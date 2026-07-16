/**
 * POST /api/run-kotlin
 * Kotlin Playground API (api.kotlinlang.org) へのプロキシ
 * レスポンスはWandbox互換形式: { program_output, compiler_error, program_error }
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cpp-step.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: '短時間に送信しすぎています。1分後にお試しください。' });
  }

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'コードがありません' });
  if (typeof code !== 'string' || code.length > 10000) {
    return res.status(400).json({ error: 'コードが長すぎます（最大10,000文字）' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch('https://api.kotlinlang.org/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '',
        name: 'Main',
        defaultFile: 'main.kt',
        files: [{ name: 'main.kt', text: code }],
        args: ''
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({ error: 'Kotlin Playground API エラー: ' + response.status });
    }

    const data = await response.json();

    // コンパイルエラー判定
    const errorList = (data.errors && data.errors['main.kt']) || [];
    const compileErrors = errorList.filter(e => e.severity === 'ERROR');
    if (compileErrors.length > 0) {
      const msg = compileErrors.map(e => `(${e.line}:${e.col}) ${e.message}`).join('\n');
      return res.json({ program_output: '', compiler_error: msg, program_error: '' });
    }

    // 実行時例外
    if (data.exception) {
      const exMsg = data.exception.fullName
        ? data.exception.fullName + ': ' + (data.exception.message || '')
        : (data.exception.message || '実行時エラー');
      return res.json({ program_output: data.output || '', compiler_error: '', program_error: exMsg });
    }

    return res.json({
      program_output: data.output || '',
      compiler_error: '',
      program_error: ''
    });

  } catch (e) {
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: 'タイムアウト（25秒）' });
    }
    return res.status(500).json({ error: 'サーバーエラー: ' + e.message });
  }
}
