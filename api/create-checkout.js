/**
 * POST /api/create-checkout
 * Stripe Checkout セッションを作成して URL を返す
 *
 * 必要な環境変数（Vercel ダッシュボードで設定）:
 *   STRIPE_SECRET_KEY  — sk_live_... または sk_test_...
 *   STRIPE_PRICE_ID    — price_... (月額¥480のサブスクリプション価格ID)
 *   NEXT_PUBLIC_BASE_URL — https://cpp-step.vercel.app (任意、デフォルトで推定)
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, userId } = req.body || {};
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
