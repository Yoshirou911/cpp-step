/**
 * POST /api/create-checkout
 * Stripe Checkout セッションを作成して URL を返す
 *
 * 必要な環境変数（Vercel ダッシュボードで設定）:
 *   STRIPE_SECRET_KEY  — sk_live_... または sk_test_...
 *   STRIPE_PRICE_ID    — price_... (月額¥600のサブスクリプション価格ID)
 *   NEXT_PUBLIC_BASE_URL — https://cpp-step.vercel.app (任意、デフォルトで推定)
 */

const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQS  = 10;

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    entry.count = 1; entry.start = now;
    rateLimitMap.set(ip, entry); return false;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > MAX_REQS;
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,63}$/;
const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  // CORS — 自ドメインのみ許可
  res.setHeader('Access-Control-Allow-Origin', 'https://cpp-step.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // レート制限
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: '短時間に送信しすぎています。1分後にお試しください。' });
  }

  const { email, userId } = req.body || {};

  // 入力バリデーション
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: '不正なメールアドレスです' });
  }
  if (userId && !UUID_RE.test(userId)) {
    return res.status(400).json({ error: '不正なユーザーIDです' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId   = process.env.STRIPE_PRICE_ID;
  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL || 'https://cpp-step.vercel.app';

  if (!stripeKey) return res.status(500).json({ error: 'Stripe APIキーが設定されていません' });
  if (!priceId)   return res.status(500).json({ error: 'Stripe 価格IDが設定されていません' });

  try {
    // Stripe API を raw fetch で呼ぶ（SDK不要）
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('success_url', `${baseUrl}/?premium=1&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${baseUrl}/`);
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');

    // ユーザーIDをメタデータに埋め込む（Webhook で使用）
    if (userId) {
      params.append('subscription_data[metadata][user_id]', userId);
      params.append('metadata[user_id]', userId);
    }
    if (email) {
      params.append('customer_email', email);
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', session);
      return res.status(502).json({ error: session?.error?.message || 'Stripe APIエラー' });
    }

    return res.status(200).json({ url: session.url });

  } catch (e) {
    console.error('create-checkout error:', e);
    return res.status(500).json({ error: 'サーバーエラー: ' + e.message });
  }
}
