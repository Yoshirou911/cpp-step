// IPごとのリクエスト履歴（メモリ内・サーバー再起動でリセット）
const rateLimitMap = new Map();

// 制限設定
const WINDOW_MS  = 60 * 1000; // 1分間
const MAX_REQS   = 10;         // 1分あたり最大10回

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };

  // ウィンドウ経過でリセット
  if (now - entry.start > WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
    rateLimitMap.set(ip, entry);
    return false;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > MAX_REQS;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // レート制限チェック
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: '短時間に送信しすぎています。1分後にお試しください。' });
  }

  const { system, messages } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'APIキーが設定されていません' });
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: '不正なリクエストです' });

  const groqMessages = [
    { role: 'system', content: system },
    ...messages
  ];

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const reply = data.choices[0].message.content;
    return res.json({ reply: reply });

  } catch (e) {
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
