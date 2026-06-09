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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { adminUserId, targetEmail, isPremium } = req.body || {};
  const supabaseUrl  = process.env.SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminUserIds = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

  // ─── 管理者確認 ───
  if (!adminUserId || !adminUserIds.includes(adminUserId)) {
    return res.status(403).json({ error: '管理者権限がありません' });
  }

  if (!targetEmail) return res.status(400).json({ error: 'メールアドレスが必要です' });
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'サーバー設定エラー' });

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
      return res.status(502).json({ error: 'ユーザー検索に失敗しました: ' + err });
    }

    const listData = await listRes.json();
    const users = listData.users || [];
    const target = users.find(u => u.email === targetEmail);

    if (!target) {
      return res.status(404).json({ error: `"${targetEmail}" は登録されていません` });
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
      return res.status(500).json({ error: 'DB更新に失敗しました: ' + err });
    }

    console.log(`[admin-grant] admin=${adminUserId} → ${targetEmail} is_premium=${isPremium}`);
    return res.status(200).json({ ok: true, targetEmail, isPremium });

  } catch (e) {
    console.error('admin-grant error:', e);
    return res.status(500).json({ error: 'サーバーエラー: ' + e.message });
  }
}
