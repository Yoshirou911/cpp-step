const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQS  = 10;

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 1; entry.start = now; rateLimitMap.set(ip, entry); return false; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > MAX_REQS;
}

const API_KEY_RE = /^[0-9a-f]{64}$/;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cpp-step.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: '短時間にリクエストが多すぎます' });

  const { apiKey } = req.body || {};
  if (!apiKey || !API_KEY_RE.test(apiKey)) return res.status(400).json({ error: '不正なAPIキーです' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'サーバー設定エラー' });

  try {
    const r = await fetch(
      `${supabaseUrl}/rest/v1/companies?api_key=eq.${apiKey}&select=company_id,company_name,subscription_plan`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const rows = await r.json();
    if (!r.ok || !rows.length) return res.status(401).json({ error: 'APIキーが無効です' });
    return res.status(200).json({ company: rows[0] });
  } catch (e) {
    return res.status(500).json({ error: 'サーバーエラー' });
  }
}
