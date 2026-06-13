const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQS  = 20;

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 1; entry.start = now; rateLimitMap.set(ip, entry); return false; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > MAX_REQS;
}

const API_KEY_RE = /^[0-9a-f]{64}$/;
const UUID_RE    = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLAN_LIMITS = { trial: 3, basic: 10, pro: 100 };

async function verifyCompany(supabaseUrl, serviceKey, apiKey) {
  const r = await fetch(
    `${supabaseUrl}/rest/v1/companies?api_key=eq.${apiKey}&select=company_id,company_name,subscription_plan`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const rows = await r.json();
  return r.ok && rows.length ? rows[0] : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cpp-step.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Company-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: '短時間にリクエストが多すぎます' });

  const apiKey = req.headers['x-company-api-key'] || '';
  if (!API_KEY_RE.test(apiKey)) return res.status(401).json({ error: 'APIキーが必要です' });

  const { target_user_id, message_title, message_body } = req.body || {};
  if (!UUID_RE.test(target_user_id))                        return res.status(400).json({ error: '不正なユーザーIDです' });
  if (!message_title || message_title.length > 100)         return res.status(400).json({ error: '件名は1〜100文字で入力してください' });
  if (!message_body  || message_body.length  > 2000)        return res.status(400).json({ error: '本文は1〜2000文字で入力してください' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'サーバー設定エラー' });

  try {
    const company = await verifyCompany(supabaseUrl, serviceKey, apiKey);
    if (!company) return res.status(401).json({ error: 'APIキーが無効です' });

    // 日次送信上限チェック
    const dailyLimit = PLAN_LIMITS[company.subscription_plan] ?? 10;
    const oneDayAgo  = new Date(Date.now() - 86400000).toISOString();
    const countRes = await fetch(
      `${supabaseUrl}/rest/v1/scout_messages?company_id=eq.${company.company_id}&sent_at=gte.${oneDayAgo}&select=message_id`,
      {
        method: 'HEAD',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'count=exact' },
      }
    );
    const range = countRes.headers.get('Content-Range') || '*/0';
    const sentCount = parseInt(range.split('/')[1] || '0', 10);
    if (sentCount >= dailyLimit) {
      return res.status(429).json({
        error: `本日の送信上限（${dailyLimit}件）に達しました。プランを変更すると上限が増えます。`,
      });
    }

    // ユーザーのオプトイン確認
    const optRes  = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${target_user_id}&select=is_scout_opted_in`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const optData = await optRes.json();
    if (!optData[0]?.is_scout_opted_in) {
      return res.status(403).json({ error: 'このユーザーはスカウトを受け取る設定をしていません' });
    }

    // スカウトメッセージを挿入
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/scout_messages`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        company_id:     company.company_id,
        target_user_id,
        message_title:  message_title.trim(),
        message_body:   message_body.trim(),
      }),
    });

    if (!insertRes.ok) return res.status(500).json({ error: 'メッセージの送信に失敗しました' });
    const inserted = await insertRes.json();
    return res.status(201).json({ message_id: inserted[0]?.message_id });
  } catch (e) {
    return res.status(500).json({ error: 'サーバーエラー' });
  }
}
