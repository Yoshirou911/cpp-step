/**
 * POST /api/run-code
 * Wandbox (wandbox.org) へのプロキシ — Kotlin 以外の全言語
 * Wandbox障害時は Piston (emkc.org) に自動フォールバック
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

function getPistonLang(compiler, options) {
  if (/cpython|python/.test(compiler))   return { lang: 'python',     file: 'main.py'    };
  if (/ruby/.test(compiler))             return { lang: 'ruby',       file: 'main.rb'    };
  if (/openjdk|java/.test(compiler))     return { lang: 'java',       file: 'Main.java'  };
  if (/nodejs|node/.test(compiler))      return { lang: 'javascript', file: 'main.js'    };
  if (/typescript/.test(compiler))       return { lang: 'typescript', file: 'main.ts'    };
  if (/rust/.test(compiler))             return { lang: 'rust',       file: 'main.rs'    };
  if (/\bgo-/.test(compiler))            return { lang: 'go',         file: 'main.go'    };
  if (/swift/.test(compiler))            return { lang: 'swift',      file: 'main.swift' };
  if (/gcc|g\+\+|clang/.test(compiler)) {
    const isC = options && /c11|c99|c89|c17/.test(options);
    return isC ? { lang: 'c', file: 'main.c' } : { lang: 'cpp', file: 'main.cpp' };
  }
  return null;
}

async function runOnPiston(code, compiler, stdin, options) {
  const mapped = getPistonLang(compiler, options);
  if (!mapped) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: mapped.lang,
        version:  '*',
        files: [{ name: mapped.file, content: code }],
        stdin: stdin || '',
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.message) return null; // Pistonのエラーレスポンス
    return {
      program_output: (data.run  && data.run.stdout)  || '',
      compiler_error: (data.compile && data.compile.stderr) || '',
      program_error:  (data.run  && data.run.stderr)  || '',
      _source: 'piston',
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
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch('https://wandbox.org/api/compile.json', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(wandboxBody),
      signal:  controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      // Wandbox が 5xx → Piston フォールバック
      const fallback = await runOnPiston(code, compiler, stdin, options);
      if (fallback) return res.json(fallback);
      return res.status(502).json({ error: 'コード実行サービスに接続できません（HTTP ' + response.status + '）。時間をおいて再試行してください。' });
    }

    const data = await response.json();

    // Wandboxのサーバー障害（OCIエラー）→ Piston フォールバック
    if (data.compiler_error && data.compiler_error.includes('OCI runtime error')) {
      const fallback = await runOnPiston(code, compiler, stdin, options);
      if (fallback) return res.json(fallback);
    }

    return res.json(data);

  } catch (e) {
    if (e.name === 'AbortError') {
      // タイムアウトは重いコードの可能性が高いのでPistonフォールバックしない
      return res.status(504).json({ error: 'タイムアウト（20秒）。処理が重すぎる可能性があります。' });
    }
    // Wandbox接続失敗 → Piston フォールバック
    const fallback = await runOnPiston(code, compiler, stdin, options);
    if (fallback) return res.json(fallback);
    return res.status(502).json({ error: 'コード実行サービスに接続できません。時間をおいて再試行してください。' });
  }
}
