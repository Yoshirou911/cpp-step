const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQS  = 30;

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 1; entry.start = now; rateLimitMap.set(ip, entry); return false; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > MAX_REQS;
}

const API_KEY_RE = /^[0-9a-f]{64}$/;
const SUPPORTED_LANGS = new Set([
  'cpp','python','javascript','java','rust',
  'ruby','typescript','kotlin','swift','csharp',
  'go','c','html','sql','bash','regex','php',
]);

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Company-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: '短時間にリクエストが多すぎます' });

  const apiKey = req.headers['x-company-api-key'] || '';
  if (!API_KEY_RE.test(apiKey)) return res.status(401).json({ error: 'APIキーが必要です' });

  const { language = 'cpp', min_tier = '8', limit = '20', offset = '0' } = req.query;
  if (!SUPPORTED_LANGS.has(language)) return res.status(400).json({ error: '未対応の言語です' });

  const minTier  = Math.max(8, Math.min(9, parseInt(min_tier)  || 8));
  const limitVal = Math.max(1, Math.min(50, parseInt(limit)     || 20));
  const offsetVal= Math.max(0,              parseInt(offset)    || 0);

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'サーバー設定エラー' });

  try {
    const company = await verifyCompany(supabaseUrl, serviceKey, apiKey);
    if (!company) return res.status(401).json({ error: 'APIキーが無効です' });

    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/search_scout_candidates`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_language: language,
        p_min_tier: minTier,
        p_limit:    limitVal,
        p_offset:   offsetVal,
      }),
    });

    const items = await rpcRes.json();
    if (!rpcRes.ok) return res.status(502).json({ error: '検索に失敗しました' });

    return res.status(200).json({ language, min_tier: minTier, total: items.length, items: items || [] });
  } catch (e) {
    return res.status(500).json({ error: 'サーバーエラー' });
  }
}
