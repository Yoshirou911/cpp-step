/**
 * POST /api/run-code
 * Wandbox (wandbox.org) へのプロキシ — Kotlin 以外の全言語
 * Wandbox障害時は Judge0 CE (ce.judge0.com) に自動フォールバック
 * ボディ: { code, compiler, stdin?, options? }
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

// Judge0 CE 言語ID
const JUDGE0_LANG = {
  cpp:        54,
  c:          50,
  python:     71,
  java:       62,
  javascript: 63,
  typescript: 74,
  ruby:       72,
  go:         60,
  rust:       73,
  swift:      83,
};

function getJudge0LangId(compiler, options) {
  if (/cpython|python/.test(compiler))   return JUDGE0_LANG.python;
  if (/ruby/.test(compiler))             return JUDGE0_LANG.ruby;
  if (/openjdk|java/.test(compiler))     return JUDGE0_LANG.java;
  if (/nodejs|node/.test(compiler))      return JUDGE0_LANG.javascript;
  if (/typescript/.test(compiler))       return JUDGE0_LANG.typescript;
  if (/rust/.test(compiler))             return JUDGE0_LANG.rust;
  if (/\bgo-/.test(compiler))            return JUDGE0_LANG.go;
  if (/swift/.test(compiler))            return JUDGE0_LANG.swift;
  if (/gcc|g\+\+|clang/.test(compiler)) {
    return (options && /c11|c99|c89|c17/.test(options)) ? JUDGE0_LANG.c : JUDGE0_LANG.cpp;
  }
  return null;
}

async function runOnJudge0(code, compiler, stdin, options) {
  const langId = getJudge0LangId(compiler, options);
  if (!langId) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
        stdin: stdin || '',
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || !data.status) return null;
    return {
      program_output: data.stdout        || '',
      compiler_error: data.compile_output|| '',
      program_error:  data.stderr        || '',
      _source: 'judge0',
    };
  } catch (e) {
    clearTimeout(timer);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cpp-step.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'ログインが必要です' });
  }
  let authUser;
  try {
    const authRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': process.env.SUPABASE_ANON_KEY }
    });
    if (!authRes.ok) {
      return res.status(401).json({ error: '認証が無効です。再ログインしてください。' });
    }
    authUser = await authRes.json();
  } catch (e) {
    return res.status(503).json({ error: '認証サービスに接続できません。時間をおいて再試行してください。' });
  }

  const rateLimitKey = authUser?.id || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(rateLimitKey)) {
    return res.status(429).json({ error: '短時間に送信しすぎています。1分後にお試しください。' });
  }

  const { code, compiler, stdin, options } = req.body || {};
  if (!code) return res.status(400).json({ error: 'コードがありません' });
  if (typeof code !== 'string' || code.length > 10000) {
    return res.status(400).json({ error: 'コードが長すぎます（最大10,000文字）' });
  }
  if (!compiler || typeof compiler !== 'string') {
    return res.status(400).json({ error: 'コンパイラが指定されていません' });
  }

  const wandboxBody = { code, compiler };
  if (stdin)   wandboxBody.stdin   = String(stdin).slice(0, 2000);
  if (options) wandboxBody.options = String(options).slice(0, 200);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://wandbox.org/api/compile.json', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(wandboxBody),
      signal:  controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const fallback = await runOnJudge0(code, compiler, stdin, options);
      if (fallback) return res.json(fallback);
      return res.status(502).json({ error: 'コード実行サービスに接続できません（HTTP ' + response.status + '）。時間をおいて再試行してください。' });
    }

    const data = await response.json();

    // Wandboxサーバー障害（OCIエラー）→ Judge0 フォールバック
    if (data.compiler_error && data.compiler_error.includes('OCI runtime error')) {
      const fallback = await runOnJudge0(code, compiler, stdin, options);
      if (fallback) return res.json(fallback);
    }

    return res.json(data);

  } catch (e) {
    // Wandboxタイムアウト・接続失敗 → Judge0 フォールバック
    const fallback = await runOnJudge0(code, compiler, stdin, options);
    if (fallback) return res.json(fallback);
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: 'タイムアウト（15秒）。無限ループや長時間処理が含まれていないか確認してください。' });
    }
    return res.status(502).json({ error: 'コード実行サービスに接続できません。時間をおいて再試行してください。' });
  }
}
