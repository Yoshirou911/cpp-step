/**
 * POST /api/admin-grant
 * 管理者が特定ユーザーのプレミアム状態を変更する
 *
 * 必要な環境変数（Vercel ダッシュボードで設定）:
 *   ADMIN_USER_IDS         — カンマ区切りの Supabase user UUID（例: "abc-123,def-456"）
 *   SUPABASE_URL           — https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — Service Role キー（全ユーザーデータにアクセス可能）
 *
 * リクエストボディ:
 *   { adminUserId: string, targetEmail: string, isPremium: boolean }
 */

const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQS  = 5; // 管理者エンドポイントは厳しめに制限

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // レート制限
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: '短時間に送信しすぎています。1分後にお試しください。' });
  }

  const { targetEmail, isPremium } = req.body || {};

  // 入力バリデーション
  if (targetEmail && !EMAIL_RE.test(targetEmail)) {
    return res.status(400).json({ error: '不正なメールアドレスです' });
  }

  const supabaseUrl  = process.env.SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminUserIds = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'サーバー設定エラー' });

  // ─── JWTを検証して管理者確認 ───
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  const token = authHeader.slice(7);
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${token}` }
  });
  if (!userRes.ok) {
    return res.status(401).json({ error: '無効なトークンです' });
  }
  const userData = await userRes.json();
  const adminUserId = userData.id;
  if (!adminUserId || !adminUserIds.includes(adminUserId)) {
    return res.status(403).json({ error: '管理者権限がありません' });
  }

  if (!targetEmail) return res.status(400).json({ error: 'メールアドレスが必要です' });

  try {
    // 1. メールアドレスからユーザーIDを検索
    const listRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(targetEmail)}`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        }
      }
    );

    if (!listRes.ok) {
      const err = await listRes.text();
      console.error('User lookup failed:', err);
      return res.status(502).json({ error: 'ユーザー検索に失敗しました。' });
    }

    const listData = await listRes.json();
    const users = listData.users || [];
    const target = users.find(u => u.email === targetEmail);

    if (!target) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // 2. user_profiles.is_premium を更新
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id:       target.id,
        is_premium:    isPremium,
        premium_since: isPremium ? new Date().toISOString() : null,
        updated_at:    new Date().toISOString(),
      }),
    });

    if (!upsertRes.ok) {
      const err = await upsertRes.text();
      console.error('Upsert failed:', err);
      return res.status(500).json({ error: 'ユーザー情報の更新に失敗しました。' });
    }

    console.log(`[admin-grant] admin=${adminUserId} → ${targetEmail} is_premium=${isPremium}`);
    return res.status(200).json({ ok: true, targetEmail, isPremium });

  } catch (e) {
    console.error('admin-grant error:', e);
    return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
  }
}
