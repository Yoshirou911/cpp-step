/**
 * POST /api/stripe-webhook
 * Stripe Webhook ハンドラ
 * 支払い完了/キャンセル時に Supabase user_profiles.is_premium を更新する
 *
 * 必要な環境変数（Vercel ダッシュボードで設定）:
 *   STRIPE_WEBHOOK_SECRET    — whsec_...
 *   SUPABASE_URL             — https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — eyJ... (Service Role キー)
 *
 * Stripe ダッシュボードの Webhook URL: https://cpp-step.vercel.app/api/stripe-webhook
 * 購読するイベント:
 *   checkout.session.completed
 *   customer.subscription.created
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *   invoice.payment_succeeded
 *   invoice.payment_failed
 */

// Vercel の bodyParser を無効化（生ボディを署名検証に使う）
export const config = { api: { bodyParser: false } };

// Vercel の生ボディを取得（署名検証に必要）
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = Buffer.alloc(0);
    req.on('data', chunk => { data = Buffer.concat([data, chunk]); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// HMAC-SHA256 署名検証（crypto.subtle + 定数時間比較 + タイムスタンプ検証）
const TOLERANCE_SEC = 300; // 5分以内のリクエストのみ許可

async function verifyStripeSignature(rawBody, sigHeader, secret) {
  try {
    const parts = sigHeader.split(',');
    let timestamp = null;
    let v1Sig = null;
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith('t='))  timestamp = trimmed.slice(2);
      if (trimmed.startsWith('v1=')) v1Sig    = trimmed.slice(3);
    }
    if (!timestamp || !v1Sig) return false;

    // タイムスタンプ検証（リプレイアタック対策）
    const tsNum = parseInt(timestamp, 10);
    if (isNaN(tsNum)) return false;
    const ageSeconds = Math.floor(Date.now() / 1000) - tsNum;
    if (ageSeconds > TOLERANCE_SEC || ageSeconds < -60) {
      console.error(`Webhook: タイムスタンプが古すぎます (${ageSeconds}秒)`);
      return false;
    }

    const payload = `${timestamp}.${rawBody.toString('utf8')}`;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const computed = Buffer.from(sig).toString('hex');

    // 定数時間比較（タイミング攻撃対策）
    const computedBuf = Buffer.from(computed, 'hex');
    const expectedBuf = Buffer.from(v1Sig,    'hex');
    try {
      return crypto.timingSafeEqual(computedBuf, expectedBuf);
    } catch {
      return false;
    }
  } catch (e) {
    console.error('Signature verification error:', e);
    return false;
  }
}

// プレミアムを有効化するイベント
const ACTIVATE = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'invoice.payment_succeeded',
]);
// プレミアムを無効化するイベント
const DEACTIVATE = new Set([
  'customer.subscription.deleted',
  'invoice.payment_failed',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig           = req.headers['stripe-signature'];
  const secret        = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl   = process.env.SUPABASE_URL;
  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !supabaseUrl || !serviceKey) {
    console.error('Webhook: 環境変数が不足しています');
    return res.status(500).json({ error: 'Server config error' });
  }

  // 生ボディを取得
  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (e) {
    return res.status(400).json({ error: 'Failed to read body' });
  }

  // 署名を検証（署名なしは環境問わず全て拒否）
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }
  const valid = await verifyStripeSignature(rawBody, sig, secret);
  if (!valid) {
    console.error('Webhook: 署名検証失敗');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // JSONパース
  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const eventType = event.type;
  const obj       = event.data?.object || {};

  // user_id をメタデータから取得（イベント種別によって格納場所が異なる）
  // checkout.session: obj.metadata / subscription: obj.metadata / invoice: obj.subscription_details.metadata
  const userId =
    obj.metadata?.user_id ||
    obj.subscription_data?.metadata?.user_id ||
    obj.subscription_details?.metadata?.user_id ||
    null;

  if (!userId) {
    // user_id なしは無視（Stripe retryを防ぐため200を返す）
    console.warn(`Webhook: user_id なし (${eventType})`);
    return res.status(200).json({ received: true, skipped: 'no user_id' });
  }

  // サブスクリプション更新イベントの場合、ステータスを確認
  let isPremium;
  if (ACTIVATE.has(eventType)) {
    // checkout.session.completed の場合はサブスク完了のみ処理
    if (eventType === 'checkout.session.completed' && obj.mode !== 'subscription') {
      return res.status(200).json({ received: true, skipped: 'not subscription' });
    }
    // subscription.updated の場合、activeかどうか確認
    if (eventType === 'customer.subscription.updated') {
      isPremium = obj.status === 'active' || obj.status === 'trialing';
    } else {
      isPremium = true;
    }
  } else if (DEACTIVATE.has(eventType)) {
    isPremium = false;
  } else {
    return res.status(200).json({ received: true, skipped: 'unhandled event' });
  }

  // Supabase を更新
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: userId,
        is_premium: isPremium,
        premium_since: isPremium ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase upsert 失敗:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }

    console.log(`✅ user_id=${userId} → is_premium=${isPremium} (${eventType})`);
    return res.status(200).json({ received: true });

  } catch (e) {
    console.error('Webhook handler エラー:', e);
    return res.status(500).json({ error: 'Webhook処理中にエラーが発生しました。' });
  }
}
