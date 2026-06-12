// ===== PWA: Service Worker 登録 =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function() {});
  });
}

// ===== サウンドエンジン =====
var _audioCtx   = null;
var _soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function _tone(freq, t0, dur, type, vol) {
  var ctx  = getAudioCtx();
  var osc  = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol || 0.22, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.01);
}

// サブベースキック: ドラムのキック的な重低音パンチ
function _kick(t0, startFreq, endFreq, dur, vol) {
  var ctx  = getAudioCtx();
  var osc  = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq || 200, t0);
  osc.frequency.exponentialRampToValueAtTime(endFreq || 40, t0 + dur * 0.55);
  gain.gain.setValueAtTime(vol || 0.45, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.01);
}

// 問題クリア音：戻るボタン基準 × キック + FM降下 + 上昇メロディ
function playClearSound() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx(), t = ctx.currentTime;
    // 戻るボタンと同じキック
    _kick(t, 90, 16, 0.30, 0.62);
    // 戻るボタンと同じFM構造（降下）
    var mod = ctx.createOscillator(), mG = ctx.createGain();
    var car = ctx.createOscillator(), filt = ctx.createBiquadFilter(), gn = ctx.createGain();
    mod.connect(mG); mG.connect(car.frequency);
    car.connect(filt); filt.connect(gn); gn.connect(ctx.destination);
    mod.type = 'sine';
    mod.frequency.setValueAtTime(110, t); mod.frequency.exponentialRampToValueAtTime(18, t + 0.18);
    mG.gain.setValueAtTime(380, t); mG.gain.exponentialRampToValueAtTime(8, t + 0.18);
    car.type = 'sine';
    car.frequency.setValueAtTime(260, t); car.frequency.exponentialRampToValueAtTime(45, t + 0.16);
    filt.type = 'lowpass'; filt.frequency.setValueAtTime(400, t); filt.frequency.exponentialRampToValueAtTime(80, t + 0.18);
    gn.gain.setValueAtTime(0.24, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    mod.start(t); mod.stop(t + 0.21); car.start(t); car.stop(t + 0.21);
  } catch(e) {}
}

// ミッションクリア音：戻るボタン基準 × 3連打 + ファンファーレ
function playMissionClearSound() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx(), t = ctx.currentTime;
    // 戻るボタンと同じキック × 3連打
    _kick(t,        90, 16, 0.30, 0.65);
    _kick(t + 0.24, 90, 16, 0.30, 0.65);
    _kick(t + 0.48, 90, 16, 0.50, 0.80);
    // 戻るボタンと同じFM × 3セット
    [0, 0.24, 0.48].forEach(function(offset) {
      var mo = ctx.createOscillator(), mg = ctx.createGain();
      var co = ctx.createOscillator(), fi = ctx.createBiquadFilter(), gi = ctx.createGain();
      mo.connect(mg); mg.connect(co.frequency);
      co.connect(fi); fi.connect(gi); gi.connect(ctx.destination);
      mo.type = 'sine';
      mo.frequency.setValueAtTime(110, t+offset); mo.frequency.exponentialRampToValueAtTime(18, t+offset+0.18);
      mg.gain.setValueAtTime(380, t+offset); mg.gain.exponentialRampToValueAtTime(8, t+offset+0.18);
      co.type = 'sine';
      co.frequency.setValueAtTime(260, t+offset); co.frequency.exponentialRampToValueAtTime(45, t+offset+0.16);
      fi.type = 'lowpass'; fi.frequency.setValueAtTime(400, t+offset); fi.frequency.exponentialRampToValueAtTime(80, t+offset+0.18);
      gi.gain.setValueAtTime(0.24, t+offset); gi.gain.exponentialRampToValueAtTime(0.001, t+offset+0.20);
      mo.start(t+offset); mo.stop(t+offset+0.21);
      co.start(t+offset); co.stop(t+offset+0.21);
    });
  } catch(e) {}
}

function toggleSound() {
  _soundEnabled = !_soundEnabled;
  localStorage.setItem('soundEnabled', _soundEnabled);
  var btn = document.getElementById('sound-btn');
  btn.textContent  = _soundEnabled ? '🔊' : '🔇';
  btn.classList.toggle('muted', !_soundEnabled);
}

// ===== 近未来 UI サウンド（重低音強化版） =====

// ホログラムボタン押下（汎用クリック）
// サブベースパンチ + 低域FM
// 戻るボタン基準・短縮版（汎用クリック）
function playUIClick() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx(), t = ctx.currentTime;
    // 戻るボタンと同じキック・短め
    _kick(t, 90, 16, 0.15, 0.58);
    // 戻るボタンと同じFM・短縮
    var mod = ctx.createOscillator(), mG = ctx.createGain();
    var car = ctx.createOscillator(), filt = ctx.createBiquadFilter(), gain = ctx.createGain();
    mod.connect(mG); mG.connect(car.frequency);
    car.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    mod.type = 'sine';
    mod.frequency.setValueAtTime(110, t); mod.frequency.exponentialRampToValueAtTime(18, t + 0.10);
    mG.gain.setValueAtTime(380, t); mG.gain.exponentialRampToValueAtTime(8, t + 0.10);
    car.type = 'sine';
    car.frequency.setValueAtTime(260, t); car.frequency.exponentialRampToValueAtTime(45, t + 0.09);
    filt.type = 'lowpass'; filt.frequency.setValueAtTime(400, t); filt.frequency.exponentialRampToValueAtTime(80, t + 0.10);
    gain.gain.setValueAtTime(0.24, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    mod.start(t); mod.stop(t + 0.13); car.start(t); car.stop(t + 0.13);
  } catch(e) {}
}

// スキャン＆ロックオン（問題/ミッション選択）
// 重低音スイープ → ディープピング + エコー
// 戻るボタン基準・確認ピング付き（問題/ミッション選択）
function playItemSelect() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx(), t = ctx.currentTime;
    // 戻るボタンと同じキック
    _kick(t, 90, 16, 0.30, 0.58);
    // 戻るボタンと同じFM
    var mod = ctx.createOscillator(), mG = ctx.createGain();
    var car = ctx.createOscillator(), filt = ctx.createBiquadFilter(), gain = ctx.createGain();
    mod.connect(mG); mG.connect(car.frequency);
    car.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    mod.type = 'sine';
    mod.frequency.setValueAtTime(110, t); mod.frequency.exponentialRampToValueAtTime(18, t + 0.18);
    mG.gain.setValueAtTime(380, t); mG.gain.exponentialRampToValueAtTime(8, t + 0.18);
    car.type = 'sine';
    car.frequency.setValueAtTime(260, t); car.frequency.exponentialRampToValueAtTime(45, t + 0.16);
    filt.type = 'lowpass'; filt.frequency.setValueAtTime(400, t); filt.frequency.exponentialRampToValueAtTime(80, t + 0.18);
    gain.gain.setValueAtTime(0.24, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    mod.start(t); mod.stop(t + 0.21); car.start(t); car.stop(t + 0.21);
  } catch(e) {}
}

// インターフェースパネル切替（タブ）
// 低域ウーシュ + サブベース
// 戻るボタン基準・やや短め（タブ切替）
function playNavTab() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx(), t = ctx.currentTime;
    // 戻るボタンと同じキック・やや短め
    _kick(t, 90, 16, 0.22, 0.58);
    // 戻るボタンと同じFM・やや短縮
    var mod = ctx.createOscillator(), mG = ctx.createGain();
    var car = ctx.createOscillator(), filt = ctx.createBiquadFilter(), gain = ctx.createGain();
    mod.connect(mG); mG.connect(car.frequency);
    car.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    mod.type = 'sine';
    mod.frequency.setValueAtTime(110, t); mod.frequency.exponentialRampToValueAtTime(18, t + 0.14);
    mG.gain.setValueAtTime(380, t); mG.gain.exponentialRampToValueAtTime(8, t + 0.14);
    car.type = 'sine';
    car.frequency.setValueAtTime(260, t); car.frequency.exponentialRampToValueAtTime(45, t + 0.13);
    filt.type = 'lowpass'; filt.frequency.setValueAtTime(400, t); filt.frequency.exponentialRampToValueAtTime(80, t + 0.14);
    gain.gain.setValueAtTime(0.24, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    mod.start(t); mod.stop(t + 0.17); car.start(t); car.stop(t + 0.17);
  } catch(e) {}
}

// システム離脱/後退（戻るボタン）
// 重低音下降 + サブベース消失
function playGoBack() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx(), t = ctx.currentTime;
    // サブベース消失（超低音下降）
    _kick(t, 90, 16, 0.30, 0.58);
    var mod = ctx.createOscillator(), mG = ctx.createGain();
    var car = ctx.createOscillator(), filt = ctx.createBiquadFilter(), gain = ctx.createGain();
    mod.connect(mG); mG.connect(car.frequency);
    car.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    mod.type = 'sine';
    mod.frequency.setValueAtTime(110, t); mod.frequency.exponentialRampToValueAtTime(18, t + 0.18);
    mG.gain.setValueAtTime(380, t); mG.gain.exponentialRampToValueAtTime(8, t + 0.18);
    car.type = 'sine';
    car.frequency.setValueAtTime(260, t); car.frequency.exponentialRampToValueAtTime(45, t + 0.16);
    filt.type = 'lowpass'; filt.frequency.setValueAtTime(400, t); filt.frequency.exponentialRampToValueAtTime(80, t + 0.18);
    gain.gain.setValueAtTime(0.24, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    mod.start(t); mod.stop(t + 0.21); car.start(t); car.stop(t + 0.21);
  } catch(e) {}
}

// システム起動シーケンス（言語選択）
// シネマティック重低音 + 三層FM合成
function playLangSelect() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx(), t = ctx.currentTime;
    // 戻るボタンと同じキック × 2連打
    _kick(t,        90, 16, 0.30, 0.65);
    _kick(t + 0.10, 90, 16, 0.38, 0.72);
    // 戻るボタンと同じFM × 2セット（時差あり）
    [0, 0.10].forEach(function(offset) {
      var mo=ctx.createOscillator(), mg=ctx.createGain();
      var co=ctx.createOscillator(), fi=ctx.createBiquadFilter(), gi=ctx.createGain();
      mo.connect(mg); mg.connect(co.frequency);
      co.connect(fi); fi.connect(gi); gi.connect(ctx.destination);
      mo.type='sine';
      mo.frequency.setValueAtTime(110,t+offset); mo.frequency.exponentialRampToValueAtTime(18,t+offset+0.18);
      mg.gain.setValueAtTime(380,t+offset); mg.gain.exponentialRampToValueAtTime(8,t+offset+0.18);
      co.type='sine';
      co.frequency.setValueAtTime(260,t+offset); co.frequency.exponentialRampToValueAtTime(45,t+offset+0.16);
      fi.type='lowpass'; fi.frequency.setValueAtTime(400,t+offset); fi.frequency.exponentialRampToValueAtTime(80,t+offset+0.18);
      gi.gain.setValueAtTime(0.24,t+offset); gi.gain.exponentialRampToValueAtTime(0.001,t+offset+0.20);
      mo.start(t+offset); mo.stop(t+offset+0.21);
      co.start(t+offset); co.stop(t+offset+0.21);
    });
  } catch(e) {}
}

// ===== ビジュアルエフェクト =====

function showClearEffect() {
  // コンフェッティ
  if (window.confetti) {
    confetti({
      particleCount: 90,
      spread: 65,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#FF6B00', '#FFD700', '#FF9940', '#ffffff', '#ede0c8'],
      scalar: 1.1
    });
  }
  // テキストフラッシュ
  var el = document.getElementById('clear-effect');
  el.classList.remove('hidden');
  // アニメーション終了後に非表示
  setTimeout(function() { el.classList.add('hidden'); }, 1650);
}

function showMissionClearEffect() {
  if (window.confetti) {
    // 左から
    confetti({
      particleCount: 130,
      angle: 60,
      spread: 58,
      origin: { x: 0, y: 0.65 },
      colors: ['#FF6B00', '#FFD700', '#C040FF', '#5588FF', '#00E676', '#ffffff']
    });
    // 右から（少し遅らせ）
    setTimeout(function() {
      confetti({
        particleCount: 130,
        angle: 120,
        spread: 58,
        origin: { x: 1, y: 0.65 },
        colors: ['#FF6B00', '#FFD700', '#C040FF', '#5588FF', '#00E676', '#ffffff']
      });
    }, 220);
    // 中央からも
    setTimeout(function() {
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#FFD700', '#ffffff', '#FF6B00']
      });
    }, 440);
  }
  var el = document.getElementById('mission-clear-effect');
  el.classList.remove('hidden');
  setTimeout(function() { el.classList.add('hidden'); }, 2100);
}

// ===== Supabase 設定 =====
// Supabase プロジェクト作成後、以下の2行を書き換えてください
// https://supabase.com → Project Settings → API で確認できます
var SUPABASE_URL      = 'https://mvebyobsjywbormbzgtv.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_u5R6gvT2YjwviCrHz8ZoOw_PAcGfVe0';

var _supabase = null;
try {
  if (window.supabase && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch(e) {}

var currentUser = null;
var currentUserIsPremium = false;
var currentUserIsAdmin = false;
var _premiumStatusCache = false;  // 実際のSupabase値（管理者プレビュー用に保持）
var _adminPreviewFree = false;    // 管理者が「無料ユーザーとして表示」テスト中
var PREMIUM_RANKS = ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'LEGEND'];
var _currentAuthTab = 'login';
// 進捗のインメモリキャッシュ（言語切替時にリセット）
var _progressCache = null;
var _missionProgressCache = null;

// ===== バッジ定義 =====
var BADGES = [
  // 問題クリア数
  { id: 'first_step',    name: 'FIRST STEP',     desc: '初めての問題をクリア',                    tier: 'bronze',   check: function(s) { return s.total >= 1;  } },
  { id: 'code_runner',   name: 'CODE RUNNER',    desc: '合計10問クリア',                          tier: 'silver',   check: function(s) { return s.total >= 10; } },
  { id: 'striker',       name: 'STRIKER',        desc: '合計30問クリア',                          tier: 'gold',     check: function(s) { return s.total >= 30; } },
  { id: 'veteran',       name: 'VETERAN',        desc: '合計60問クリア',                          tier: 'platinum', check: function(s) { return s.total >= 60; } },
  { id: 'full_clear',    name: 'FULL CLEAR',     desc: '合計90問クリア達成',                      tier: 'master',   check: function(s) { return s.total >= 90; } },
  // 言語マスター
  { id: 'cpp_master',    name: 'C++ MASTER',     desc: 'C++ 30問クリア',                          tier: 'diamond',  check: function(s) { return s.cpp >= 30;    } },
  { id: 'py_master',     name: 'PYTHON MASTER',  desc: 'Python 30問クリア',                       tier: 'diamond',  check: function(s) { return s.python >= 30; } },
  { id: 'js_master',     name: 'JS MASTER',      desc: 'JavaScript 30問クリア',                   tier: 'diamond',  check: function(s) { return s.js >= 30;     } },
  // ミッション
  { id: 'first_mission', name: 'MISSION START',  desc: '初ミッションクリア',                      tier: 'silver',   check: function(s) { return s.totalMissions >= 1; } },
  { id: 'mission_all',   name: 'MISSION MASTER', desc: 'いずれかの言語で全ミッションクリア',       tier: 'master',   check: function(s) { return s.cppM >= 6 || s.pyM >= 6 || s.jsM >= 6 || s.rubyM >= 6 || s.tsM >= 6 || s.kotlinM >= 6 || s.swiftM >= 6 || s.javaM >= 6 || s.csharpM >= 6 || s.goM >= 6 || s.cM >= 6 || s.rustM >= 6; } },
  // 多言語
  { id: 'bilingual',     name: 'BILINGUAL',      desc: '2言語以上でクリア達成',                   tier: 'gold',     check: function(s) { return [s.cpp, s.python, s.js, s.ruby, s.ts, s.kotlin, s.swift, s.java, s.csharp, s.go, s.c, s.rust].filter(function(n){return n>0;}).length >= 2; } },
  { id: 'trilingual',    name: 'TRILINGUAL',     desc: '3言語以上でクリア達成',                   tier: 'platinum', check: function(s) { return [s.cpp, s.python, s.js, s.ruby, s.ts, s.kotlin, s.swift, s.java, s.csharp, s.go, s.c, s.rust].filter(function(n){return n>0;}).length >= 3; } },
  // ストリーク
  { id: 'streak_3',      name: '3 DAY STREAK',   desc: '3日連続ログイン',                         tier: 'silver',   check: function(s) { return s.currentStreak >= 3;  } },
  { id: 'streak_7',      name: 'WEEKLY',         desc: '7日連続ログイン',                         tier: 'gold',     check: function(s) { return s.currentStreak >= 7;  } },
  { id: 'streak_30',     name: 'MONTHLY',        desc: '30日連続ログイン',                        tier: 'platinum', check: function(s) { return s.currentStreak >= 30; } },
  // LEGEND 超難問
  { id: 'legend_cpp',    name: 'C++ LEGEND',     desc: 'C++ 超難問クリア',                        tier: 'legend',   check: function(s) { return s.legendCpp;    } },
  { id: 'legend_py',     name: 'PYTHON LEGEND',  desc: 'Python 超難問クリア',                     tier: 'legend',   check: function(s) { return s.legendPython; } },
  { id: 'legend_js',     name: 'JS LEGEND',      desc: 'JavaScript 超難問クリア',                 tier: 'legend',   check: function(s) { return s.legendJs;     } },
  { id: 'ruby_master',   name: 'RUBY MASTER',    desc: 'Ruby 全30問クリア',                       tier: 'diamond',  check: function(s) { return s.ruby >= 30;   } },
  { id: 'legend_ruby',   name: 'RUBY LEGEND',    desc: 'Ruby 超難問クリア',                       tier: 'legend',   check: function(s) { return s.legendRuby;   } },
  { id: 'ts_master',     name: 'TS MASTER',      desc: 'TypeScript 全30問クリア',                 tier: 'diamond',  check: function(s) { return s.ts >= 30;     } },
  { id: 'legend_ts',     name: 'TS LEGEND',      desc: 'TypeScript 超難問クリア',                 tier: 'legend',   check: function(s) { return s.legendTs;     } },
  { id: 'kotlin_master', name: 'KOTLIN MASTER',  desc: 'Kotlin 全30問クリア',                     tier: 'diamond',  check: function(s) { return s.kotlin >= 30; } },
  { id: 'legend_kotlin', name: 'KOTLIN LEGEND',  desc: 'Kotlin 超難問クリア',                     tier: 'legend',   check: function(s) { return s.legendKotlin; } },
  { id: 'swift_master',  name: 'SWIFT MASTER',   desc: 'Swift 全30問クリア',                      tier: 'diamond',  check: function(s) { return s.swift >= 30; } },
  { id: 'legend_swift',  name: 'SWIFT LEGEND',   desc: 'Swiftで伝説の称号獲得',                  tier: 'legend',   check: function(s) { return s.legendSwift; } },
  { id: 'java_master',   name: 'JAVA MASTER',    desc: 'Java 全30問クリア',                       tier: 'diamond',  check: function(s) { return s.java >= 30; } },
  { id: 'legend_java',   name: 'JAVA LEGEND',    desc: 'Javaで伝説の称号獲得',                   tier: 'legend',   check: function(s) { return s.legendJava; } },
  { id: 'csharp_master', name: 'C# MASTER',      desc: 'C# 全30問クリア',                         tier: 'diamond',  check: function(s) { return s.csharp >= 30; } },
  { id: 'legend_csharp', name: 'C# LEGEND',      desc: 'C#で伝説の称号獲得',                      tier: 'legend',   check: function(s) { return s.legendCsharp; } },
  { id: 'go_master',     name: 'GO MASTER',      desc: 'Go 全30問クリア',                         tier: 'diamond',  check: function(s) { return s.go >= 30; } },
  { id: 'legend_go',     name: 'GO LEGEND',      desc: 'Goで伝説の称号獲得',                      tier: 'legend',   check: function(s) { return s.legendGo; } },
  { id: 'c_master',      name: 'C MASTER',       desc: 'C 全30問クリア',                          tier: 'diamond',  check: function(s) { return s.c >= 30; } },
  { id: 'legend_c',      name: 'C LEGEND',       desc: 'Cで伝説の称号獲得',                       tier: 'legend',   check: function(s) { return s.legendC; } },
  { id: 'rust_master',   name: 'RUST MASTER',    desc: 'Rust 全30問クリア',                       tier: 'diamond',  check: function(s) { return s.rust >= 30; } },
  { id: 'legend_rust',   name: 'RUST LEGEND',    desc: 'Rustで伝説の称号獲得',                    tier: 'legend',   check: function(s) { return s.legendRust; } },
  { id: 'true_legend',   name: 'TRUE LEGEND',    desc: '全言語の超難問クリア',                    tier: 'legend',   check: function(s) { return s.legendCpp && s.legendPython && s.legendJs && s.legendRuby && s.legendTs && s.legendKotlin && s.legendSwift && s.legendJava && s.legendCsharp && s.legendGo && s.legendC && s.legendRust; } },
];

// 全言語の進捗を localStorage から集計（言語切替不要）
function getProfileStats() {
  function getP(lang) {
    var d = localStorage.getItem(lang + '_progress');
    return d ? JSON.parse(d) : [];
  }
  function getM(lang) {
    var d = localStorage.getItem(lang + '_mission_progress');
    return d ? JSON.parse(d) : [];
  }
  var cppArr    = getP('cpp');
  var pythonArr = getP('python');
  var jsArr     = getP('javascript');
  var rubyArr = getP('ruby');
  var tsArr   = getP('typescript');
  var kotlinArr = getP('kotlin');
  var swiftArr  = getP('swift');
  var javaArr   = getP('java');
  var csharpArr = getP('csharp');
  var goArr     = getP('go');
  var cArr      = getP('c');
  var rustArr   = getP('rust');
  var cpp    = cppArr.length;
  var python = pythonArr.length;
  var js     = jsArr.length;
  var ruby   = rubyArr.length;
  var ts     = tsArr.length;
  var kotlin = kotlinArr.length;
  var swift  = swiftArr.length;
  var java   = javaArr.length;
  var csharp = csharpArr.length;
  var go     = goArr.length;
  var c      = cArr.length;
  var rust   = rustArr.length;
  var cppM    = getM('cpp').length;
  var pyM     = getM('python').length;
  var jsM     = getM('javascript').length;
  var rubyM   = getM('ruby').length;
  var tsM     = getM('typescript').length;
  var kotlinM = getM('kotlin').length;
  var swiftM  = getM('swift').length;
  var javaM   = getM('java').length;
  var csharpM = getM('csharp').length;
  var goM     = getM('go').length;
  var cM      = getM('c').length;
  var rustM   = getM('rust').length;
  return {
    cpp: cpp, python: python, js: js, ruby: ruby, ts: ts, kotlin: kotlin, swift: swift, java: java,
    csharp: csharp, go: go, c: c, rust: rust,
    cppM: cppM, pyM: pyM, jsM: jsM, rubyM: rubyM, tsM: tsM, kotlinM: kotlinM, swiftM: swiftM, javaM: javaM,
    csharpM: csharpM, goM: goM, cM: cM, rustM: rustM,
    total: cpp + python + js + ruby + ts + kotlin + swift + java + csharp + go + c + rust,
    totalMissions: cppM + pyM + jsM + rubyM + tsM + kotlinM + swiftM + javaM + csharpM + goM + cM + rustM,
    legendCpp:    cppArr.indexOf(31)    !== -1,
    legendPython: pythonArr.indexOf(31) !== -1,
    legendJs:     jsArr.indexOf(31)     !== -1,
    legendRuby:   rubyArr.indexOf(30)   !== -1,
    legendTs:     tsArr.indexOf(30)     !== -1,
    legendKotlin: kotlinArr.indexOf(30) !== -1,
    legendSwift:  swiftArr.indexOf(30)  !== -1,
    legendJava:   javaArr.indexOf(30)   !== -1,
    legendCsharp: csharpArr.indexOf(30) !== -1,
    legendGo:     goArr.indexOf(30)     !== -1,
    legendC:      cArr.indexOf(30)      !== -1,
    legendRust:   rustArr.indexOf(30)   !== -1,
    // ストリークは非同期で後から上書きするため初期値0
    currentStreak: 0,
    bestStreak:    0,
    totalDays:     0
  };
}

// ===== ログインストリーク =====

function calcStreak(dates) {
  if (!dates || dates.length === 0) return { current: 0, best: 0, total: 0 };
  // 降順ソート
  var sorted = dates.slice().sort(function(a, b) { return b.localeCompare(a); });
  var total  = sorted.length;
  var todayStr     = new Date().toISOString().slice(0, 10);
  var yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // 現在のストリーク（今日か昨日ログインしていれば継続中）
  var current = 0;
  if (sorted[0] === todayStr || sorted[0] === yesterdayStr) {
    current = 1;
    for (var i = 1; i < sorted.length; i++) {
      var diff = Math.round((Date.parse(sorted[i-1]) - Date.parse(sorted[i])) / 86400000);
      if (diff === 1) { current++; } else { break; }
    }
  }

  // 最長ストリーク
  var best = 0;
  var run  = 1;
  for (var j = 1; j < sorted.length; j++) {
    var d = Math.round((Date.parse(sorted[j-1]) - Date.parse(sorted[j])) / 86400000);
    if (d === 1) { run++; } else { best = Math.max(best, run); run = 1; }
  }
  best = Math.max(best, run, current);

  return { current: current, best: best, total: total };
}

function recordLoginDay() {
  var today = new Date().toISOString().slice(0, 10);
  // localStorage に記録
  var local = JSON.parse(localStorage.getItem('login_days') || '[]');
  var isNew = local.indexOf(today) === -1;
  if (isNew) {
    local.push(today);
    localStorage.setItem('login_days', JSON.stringify(local));
  }
  // Supabase に記録（ログイン中のみ）
  if (currentUser && _supabase) {
    _supabase.from('login_days').upsert({
      user_id: currentUser.id,
      login_date: today
    }).then(function() {}).catch(function() {});
  }
  if (isNew) checkLevelUp(); // 新規ログイン日なら EXP を加算・判定
}

async function getLoginStreak() {
  var localDates = JSON.parse(localStorage.getItem('login_days') || '[]');
  if (!currentUser || !_supabase) return calcStreak(localDates);
  try {
    var result = await _supabase
      .from('login_days')
      .select('login_date')
      .eq('user_id', currentUser.id);
    if (result.error) return calcStreak(localDates);
    var remoteDates = (result.data || []).map(function(r) { return r.login_date; });
    // ローカル ∪ リモート をマージ
    var merged = remoteDates.slice();
    localDates.forEach(function(d) { if (merged.indexOf(d) === -1) merged.push(d); });
    return calcStreak(merged);
  } catch(e) {
    return calcStreak(localDates);
  }
}

// 総クリア数からランクを計算
function getProfileRank(total) {
  if (total >= 90) return { name: 'MASTER',   color: '#C040FF' };
  if (total >= 60) return { name: 'PLATINUM', color: '#00C8B4' };
  if (total >= 30) return { name: 'GOLD',     color: '#EFC050' };
  if (total >= 10) return { name: 'SILVER',   color: '#B8C8D8' };
  if (total >=  1) return { name: 'BRONZE',   color: '#C47A2F' };
  return                   { name: 'ROOKIE',  color: '#9B9B9B' };
}

// ===== EXP・レベルシステム =====

// 問題ランク別 EXP
var RANK_EXP = {
  rookie: 15, bronze: 25, silver: 40, gold: 60,
  platinum: 85, diamond: 120, master: 160, legend: 500
};
// ミッションランク別 EXP
var MISSION_EXP = {
  rookie: 50, bronze: 80, silver: 130, gold: 200,
  platinum: 280, diamond: 380, master: 500
};
var LOGIN_EXP = 20; // ユニークログイン1日あたり

// 全進捗から合計EXP＋内訳を計算（localStorage のみ、同期）
function calculateEXP() {
  var problemExp = 0;
  var missionExp = 0;

  // 問題クリア EXP（全12言語）
  [
    { key: 'cpp',        get: function() { return problems; } },
    { key: 'python',     get: function() { return pythonProblems; } },
    { key: 'javascript', get: function() { return javascriptProblems; } },
    { key: 'ruby',       get: function() { return rubyProblems; } },
    { key: 'typescript', get: function() { return typescriptProblems; } },
    { key: 'kotlin',     get: function() { return kotlinProblems; } },
    { key: 'swift',      get: function() { return swiftProblems; } },
    { key: 'java',       get: function() { return javaProblems; } },
    { key: 'csharp',     get: function() { return csharpProblems; } },
    { key: 'go',         get: function() { return goProblems; } },
    { key: 'c',          get: function() { return cProblems; } },
    { key: 'rust',       get: function() { return rustProblems; } }
  ].forEach(function(lang) {
    var prog = JSON.parse(localStorage.getItem(lang.key + '_progress') || '[]');
    lang.get().forEach(function(p) {
      if (prog.indexOf(p.id) !== -1) {
        problemExp += RANK_EXP[p.rank.toLowerCase()] || 15;
      }
    });
  });

  // ミッションクリア EXP（全12言語）
  [
    { key: 'cpp',        get: function() { return missions; } },
    { key: 'python',     get: function() { return pythonMissions; } },
    { key: 'javascript', get: function() { return javascriptMissions; } },
    { key: 'ruby',       get: function() { return rubyMissions; } },
    { key: 'typescript', get: function() { return typescriptMissions; } },
    { key: 'kotlin',     get: function() { return kotlinMissions; } },
    { key: 'swift',      get: function() { return swiftMissions; } },
    { key: 'java',       get: function() { return javaMissions; } },
    { key: 'csharp',     get: function() { return csharpMissions; } },
    { key: 'go',         get: function() { return goMissions; } },
    { key: 'c',          get: function() { return cMissions; } },
    { key: 'rust',       get: function() { return rustMissions; } }
  ].forEach(function(lang) {
    var prog = JSON.parse(localStorage.getItem(lang.key + '_mission_progress') || '[]');
    lang.get().forEach(function(m) {
      if (prog.indexOf(m.id) !== -1) {
        missionExp += MISSION_EXP[m.rank.toLowerCase()] || 80;
      }
    });
  });

  // ログイン EXP
  var loginDays = JSON.parse(localStorage.getItem('login_days') || '[]');
  var loginExp  = loginDays.length * LOGIN_EXP;

  return {
    total:   problemExp + missionExp + loginExp,
    problem: problemExp,
    mission: missionExp,
    login:   loginExp
  };
}

// Lv N に到達するために必要な累計 EXP  ← Lv N→N+1 に N×150 EXP
function totalExpForLevel(n) {
  return 75 * n * (n - 1); // = sum_{i=1}^{n-1} 150i = 150·n(n-1)/2
}

// 次のレベルまでに必要な EXP
function expToNextLevel(n) { return n * 150; }

// 現在の EXP からレベルを算出
function calcLevel(exp) {
  if (exp <= 0) return 1;
  var lv = 1;
  while (totalExpForLevel(lv + 1) <= exp) lv++;
  return lv;
}

// レベルから称号文字列を返す
function getLevelTitle(lv) {
  if (lv >= 100) return 'CODE GOD';
  if (lv >= 75)  return 'LEGEND';
  if (lv >= 50)  return 'MASTER DEVELOPER';
  if (lv >= 40)  return 'TECH LEAD';
  if (lv >= 30)  return 'ARCHITECT';
  if (lv >= 20)  return 'SENIOR ENGINEER';
  if (lv >= 15)  return 'ENGINEER';
  if (lv >= 10)  return 'DEVELOPER';
  if (lv >= 6)   return 'PROGRAMMER';
  if (lv >= 3)   return 'CADET';
  return 'TRAINEE';
}

// レベルからテーマカラーを返す
function getLevelColor(lv) {
  if (lv >= 75)  return '#FF2244'; // LEGEND (赤)
  if (lv >= 50)  return '#C040FF'; // MASTER (紫)
  if (lv >= 40)  return '#FF6B00'; // TECH LEAD (オレンジ)
  if (lv >= 30)  return '#EFC050'; // ARCHITECT (ゴールド)
  if (lv >= 20)  return '#00C8B4'; // SENIOR (プラチナ)
  if (lv >= 15)  return '#5588FF'; // ENGINEER (ダイヤ)
  if (lv >= 10)  return '#3776AB'; // DEVELOPER (ブルー)
  if (lv >= 6)   return '#00E676'; // PROGRAMMER (グリーン)
  if (lv >= 3)   return '#B8C8D8'; // CADET (シルバー)
  return '#9B9B9B';                // TRAINEE (グレー)
}

// ヘッダーの Lv.XX バッジを更新
function updateLevelBadge() {
  try {
    var expData = calculateEXP();
    var lv = calcLevel(expData.total);
    var el = document.getElementById('lv-badge');
    if (el) {
      el.textContent = 'Lv.' + lv;
      el.style.color       = getLevelColor(lv);
      el.style.borderColor = getLevelColor(lv) + '55';
    }
  } catch(e) {}
}

// レベルアップ効果音（上昇アルペジオ + 低域打音）
function playLevelUpSound() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx(), t = ctx.currentTime;
    _tone(523.25, t,       0.13, 'sine',     0.20); // C5
    _tone(659.25, t+0.09,  0.13, 'sine',     0.20); // E5
    _tone(783.99, t+0.18,  0.13, 'sine',     0.20); // G5
    _tone(1046.5, t+0.28,  0.45, 'sine',     0.24); // C6
    _tone(1318.5, t+0.42,  0.60, 'sine',     0.17); // E6
    _tone(1568.0, t+0.58,  0.75, 'sine',     0.12); // G6（余韻）
    _tone(65,     t,       0.22, 'triangle', 0.28); // 低音ドラム
    _tone(65,     t+0.28,  0.28, 'triangle', 0.20);
  } catch(e) {}
}

// レベルアップオーバーレイを表示
function showLevelUpEffect(lv) {
  var el = document.getElementById('levelup-effect');
  if (!el) return;
  el.querySelector('.levelup-num').textContent    = lv;
  el.querySelector('.levelup-title-text').textContent = getLevelTitle(lv);
  el.style.setProperty('--lv-color', getLevelColor(lv));
  el.classList.remove('hidden');
  setTimeout(function() { el.classList.add('hidden'); }, 2800);
  // コンフェッティ
  if (window.confetti) {
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.35 },
      colors: ['#FF6B00', '#FFD700', getLevelColor(lv), '#ffffff'] });
  }
}

// レベルアップ判定（セーブのたびに呼ぶ）
function checkLevelUp() {
  try {
    var expData  = calculateEXP();
    var newLv    = calcLevel(expData.total);
    var prevLv   = parseInt(localStorage.getItem('user_level') || '0');
    localStorage.setItem('user_level', String(newLv));
    updateLevelBadge();
    if (prevLv > 0 && newLv > prevLv) {
      playLevelUpSound();
      showLevelUpEffect(newLv);
    }
  } catch(e) {}
}

// ===== 言語データ =====

var LANGUAGE_GROUPS = [
  {
    rank: 'ROOKIE',
    rankColor: '#9B9B9B',
    desc: '文法がシンプルで誰でも始めやすい',
    langs: [
      {
        id: 'python', name: 'Python', color: '#3776AB', problems: 31, available: true,
        uses: ['AI・機械学習', 'データ分析', 'Web開発', '自動化スクリプト']
      },
    ]
  },
  {
    rank: 'BRONZE',
    rankColor: '#C47A2F',
    desc: '少し複雑だが実用的なアプリが作れる',
    langs: [
      {
        id: 'javascript', name: 'JavaScript', color: '#F0C040', problems: 31, available: true,
        uses: ['Webフロントエンド', 'ブラウザゲーム', 'Node.js サーバー']
      },
      {
        id: 'ruby', name: 'Ruby', color: '#CC342D', problems: 30, available: true,
        uses: ['Web開発 (Rails)', 'スクリプト自動化', 'プロトタイプ開発']
      },
    ]
  },
  {
    rank: 'SILVER',
    rankColor: '#B8C8D8',
    desc: '型システムやOOP(オブジェクト指向)を本格的に学ぶ',
    langs: [
      {
        id: 'typescript', name: 'TypeScript', color: '#3178C6', problems: 30, available: true,
        uses: ['大規模Webアプリ', '型安全なフロントエンド', 'フレームワーク開発']
      },
      {
        id: 'kotlin', name: 'Kotlin', color: '#7F52FF', problems: 30, available: true,
        uses: ['Androidアプリ', 'サーバーサイド', 'Spring Boot']
      },
      {
        id: 'swift', name: 'Swift', color: '#FA7343', problems: 30, available: true,
        uses: ['iOSアプリ', 'macOSアプリ', 'watchOS・tvOS']
      },
    ]
  },
  {
    rank: 'GOLD',
    rankColor: '#EFC050',
    desc: '企業現場でよく使われる実践的な言語',
    langs: [
      {
        id: 'java', name: 'Java', color: '#ED8B00', problems: 30, available: true,
        uses: ['企業向けシステム', 'Androidアプリ', 'Spring Bootサーバー']
      },
      {
        id: 'csharp', name: 'C#', color: '#9B4F96', problems: 30, available: true,
        uses: ['Unityゲーム開発', 'Windowsアプリ', '.NETサーバー']
      },
      {
        id: 'go', name: 'Go', color: '#00ADD8', problems: 30, available: true,
        uses: ['高速APIサーバー', 'Dockerなどインフラツール', 'クラウドサービス']
      },
    ]
  },
  {
    rank: 'PLATINUM',
    rankColor: '#00C8B4',
    desc: 'OS・組み込みなど低レベルの世界',
    langs: [
      {
        id: 'c', name: 'C', color: '#A8B9CC', problems: 30, available: true,
        uses: ['OS開発 (Linux等)', '組み込み・マイコン', 'ドライバ・ファームウェア']
      },
    ]
  },
  {
    rank: 'DIAMOND',
    rankColor: '#5588FF',
    desc: '高速・高機能。習得難度は高いが強力',
    langs: [
      {
        id: 'cpp', name: 'C++', color: '#00599C', problems: 31, available: true,
        uses: ['ゲームエンジン (Unreal)', 'OS・ブラウザ開発', '競技プログラミング', '高速数値計算']
      },
    ]
  },
  {
    rank: 'MASTER',
    rankColor: '#C040FF',
    desc: '最高難度。安全性と速度を両立する次世代言語',
    langs: [
      {
        id: 'rust', name: 'Rust', color: '#CE412B', problems: 30, available: true,
        uses: ['システムプログラミング', 'WebAssembly', 'OSカーネル', '高安全性ソフト']
      },
    ]
  },
];

var currentLanguage = null;

// ===== 学習タイマー & スタート日記録 =====

var _studyTimerStart = null;
var _studyTimerDate  = null;

function startStudyTimer() {
  _studyTimerStart = Date.now();
  _studyTimerDate  = new Date().toISOString().slice(0, 10);
}

function stopStudyTimer() {
  if (!_studyTimerStart) return;
  var elapsed = Math.round((Date.now() - _studyTimerStart) / 1000);
  _studyTimerStart = null;
  // 3秒未満（誤操作）や3時間超（放置）は除外
  if (elapsed < 3 || elapsed > 10800) return;
  var date = _studyTimerDate || new Date().toISOString().slice(0, 10);
  var log  = JSON.parse(localStorage.getItem('study_log') || '{}');
  log[date] = (log[date] || 0) + elapsed;
  localStorage.setItem('study_log', JSON.stringify(log));
}

function recordLanguageStart(langId) {
  var key = langId + '_started_at';
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, new Date().toISOString().slice(0, 10));
  }
}

function getTotalStudyTime() {
  var log = JSON.parse(localStorage.getItem('study_log') || '{}');
  return Object.keys(log).reduce(function(sum, k) { return sum + (log[k] || 0); }, 0);
}

function formatStudyTime(sec) {
  if (sec < 60) return sec + 's';
  var h = Math.floor(sec / 3600);
  var m = Math.floor((sec % 3600) / 60);
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'min';
}

// ===== 言語選択ページの描画 =====

function renderLangSelect() {
  document.getElementById('lang-badge').classList.add('hidden');
  var content = document.getElementById('lang-content');
  content.innerHTML =
    '<div class="lang-page-header">' +
      '<div class="lang-page-title">◆ SELECT LANGUAGE</div>' +
      '<div class="lang-page-sub">学習する言語を選択してください</div>' +
    '</div>';

  LANGUAGE_GROUPS.forEach(function(group) {
    var section = document.createElement('div');
    section.className = 'lang-section';
    section.innerHTML =
      '<div class="lang-section-header">' +
        '<span class="lang-section-rank" style="color:' + group.rankColor + '">' + group.rank + '</span>' +
        '<span class="lang-section-desc">' + group.desc + '</span>' +
      '</div>' +
      '<div class="lang-grid"></div>';

    var grid = section.querySelector('.lang-grid');

    group.langs.forEach(function(lang) {
      var card = document.createElement('div');
      card.className = 'lang-card' + (lang.available ? ' lang-available' : ' lang-coming');

      var useTags = lang.uses.map(function(u) {
        return '<span class="lang-use-tag">' + u + '</span>';
      }).join('');

      card.innerHTML =
        '<div class="lang-card-bar" style="background:' + lang.color + '"></div>' +
        '<div class="lang-card-body">' +
          '<div class="lang-card-top">' +
            '<div class="lang-card-name">' + lang.name + '</div>' +
            '<div class="lang-card-status' + (lang.available ? ' lang-status-open' : '') + '">' +
              (lang.available ? lang.problems + ' PROBLEMS' : 'COMING SOON') +
            '</div>' +
          '</div>' +
          '<div class="lang-use-tags">' + useTags + '</div>' +
        '</div>';

      if (lang.available) {
        card.addEventListener('click', function() { selectLanguage(lang.id); });
      }

      grid.appendChild(card);
    });

    content.appendChild(section);
  });
}

// ===== 言語選択 =====

function updateLangBadge() {
  var badge = document.getElementById('lang-badge');
  if (!currentLanguage) { badge.classList.add('hidden'); return; }

  var langData = null, rankData = null;
  LANGUAGE_GROUPS.forEach(function(g) {
    g.langs.forEach(function(l) {
      if (l.id === currentLanguage) { langData = l; rankData = g; }
    });
  });

  if (!langData) { badge.classList.add('hidden'); return; }

  badge.classList.remove('hidden');
  badge.innerHTML =
    '<span class="lang-badge-rank" style="color:' + rankData.rankColor + '">' + rankData.rank + '</span>' +
    '<span class="lang-badge-sep">◆</span>' +
    '<span class="lang-badge-name" style="color:' + langData.color + '">' + langData.name + '</span>';
}

function showNavAndProgress() {
  document.getElementById('nav-tabs').classList.remove('hidden');
  document.getElementById('progress-text').classList.remove('hidden');
  document.getElementById('progress-bar-wrap').classList.remove('hidden');
  updateLangBadge();
}

function setActiveTab(tab) {
  ['problems', 'missions', 'guide'].forEach(function(t) {
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
  });
}

function selectLanguage(langId) {
  playLangSelect();
  recordLanguageStart(langId);
  currentLanguage = langId;
  _progressCache = null;
  _missionProgressCache = null;
  history.pushState({ page: 'list', lang: langId, tab: 'problems' }, '');
  showNavAndProgress();
  setActiveTab('problems');
  renderList();
  updateProgressDisplay();
  showPage('list');
  // ログイン中なら Supabase から進捗を同期
  if (currentUser && _supabase) {
    syncProgressFromSupabase();
    syncMissionProgressFromSupabase();
  }
}

// ===== プレミアム機能 =====

function isPremiumRequired(rank) {
  return PREMIUM_RANKS.indexOf((rank || '').toUpperCase()) !== -1;
}

async function fetchUserProfile() {
  if (!currentUser || !_supabase) {
    currentUserIsPremium = false; currentUserIsAdmin = false;
    updateAdDisplay(); return;
  }
  try {
    var result = await _supabase
      .from('user_profiles')
      .select('is_premium, is_admin')
      .eq('user_id', currentUser.id)
      .maybeSingle();
    if (result.data) {
      _premiumStatusCache  = !!result.data.is_premium;
      currentUserIsAdmin   = !!result.data.is_admin;
    } else {
      // プロフィールが存在しなければ作成
      await _supabase.from('user_profiles').upsert({
        user_id: currentUser.id,
        is_premium: false,
        is_admin: false
      });
      _premiumStatusCache = false;
      currentUserIsAdmin  = false;
    }
    // 管理者プレビュー中でなければ実際の値を適用
    currentUserIsPremium = _adminPreviewFree ? false : _premiumStatusCache;
  } catch(e) {
    currentUserIsPremium = false; currentUserIsAdmin = false;
  }
  updateAdDisplay();
  if (currentLanguage) { renderList(); renderMissionList(); }
  updateAdminBtnVisibility();
}

function updateAdDisplay() {
  var ads = document.querySelectorAll('.ad-slot');
  ads.forEach(function(ad) {
    if (currentUserIsPremium) {
      ad.style.display = 'none';
    } else {
      ad.style.display = '';
    }
  });
}

// ===== 管理者パネル =====

function updateAdminBtnVisibility() {
  var btn = document.getElementById('admin-panel-btn');
  if (btn) btn.style.display = currentUserIsAdmin ? 'inline-flex' : 'none';
}

function openAdminPanel() {
  if (!currentUserIsAdmin) return;
  // プレビュー状態をボタンに反映
  var toggle = document.getElementById('admin-preview-toggle');
  if (toggle) {
    toggle.textContent = _adminPreviewFree ? '● 無料ユーザー表示中' : '○ 実際の表示（PLUS）';
    toggle.classList.toggle('active-preview', _adminPreviewFree);
  }
  document.getElementById('admin-panel').classList.remove('hidden');
}

function closeAdminPanel() {
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('admin-msg').textContent = '';
  document.getElementById('admin-email-input').value = '';
}

function adminTogglePreview() {
  if (!currentUserIsAdmin) return;
  _adminPreviewFree = !_adminPreviewFree;
  currentUserIsPremium = _adminPreviewFree ? false : _premiumStatusCache;
  var toggle = document.getElementById('admin-preview-toggle');
  if (toggle) {
    toggle.textContent = _adminPreviewFree ? '● 無料ユーザー表示中' : '○ 実際の表示（PLUS）';
    toggle.classList.toggle('active-preview', _adminPreviewFree);
  }
  updateAdDisplay();
  if (currentLanguage) { renderList(); renderMissionList(); }
}

async function adminSetPremium(isPremium) {
  if (!currentUserIsAdmin) return;
  var email   = document.getElementById('admin-email-input').value.trim();
  var msgEl   = document.getElementById('admin-msg');
  var btnGive = document.getElementById('admin-give-btn');
  var btnTake = document.getElementById('admin-take-btn');
  if (!email) { msgEl.textContent = '❌ メールアドレスを入力してください'; return; }

  btnGive.disabled = true; btnTake.disabled = true;
  msgEl.textContent = '処理中...';

  try {
    var res = await fetch('/api/admin-grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId: currentUser.id, targetEmail: email, isPremium: isPremium })
    });
    var data = await res.json();
    if (data.error) throw new Error(data.error);
    msgEl.textContent = isPremium
      ? '✅ ' + email + ' に PLUS を付与しました'
      : '✅ ' + email + ' の PLUS を取り消しました';
    msgEl.style.color = '#4caf90';
  } catch(e) {
    msgEl.textContent = '❌ ' + e.message;
    msgEl.style.color = '#ff6060';
  } finally {
    btnGive.disabled = false; btnTake.disabled = false;
  }
}

// ===== プレミアムモーダル =====

function openPremiumModal() {
  document.getElementById('premium-modal').classList.remove('hidden');
}

function closePremiumModal() {
  document.getElementById('premium-modal').classList.add('hidden');
}

async function startCheckout() {
  // 未ログインなら先にログインモーダルへ
  if (!currentUser) {
    closePremiumModal();
    openAuthModal();
    return;
  }
  var btn = document.getElementById('checkout-btn');
  var orig = btn.textContent;
  btn.textContent = '処理中...';
  btn.disabled = true;
  try {
    var res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, userId: currentUser.id })
    });
    var data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || '決済の開始に失敗しました');
    }
  } catch(e) {
    alert('エラー: ' + e.message);
    btn.textContent = orig;
    btn.disabled = false;
  }
}

// ===== ブラウザ履歴の復元 =====

function startApp() {
  playLangSelect();
  localStorage.setItem('app_started', '1');
  history.pushState({ page: 'lang' }, '');
  renderLangSelect();
  showPage('lang');
}

function openPrivacyPolicy() {
  document.getElementById('privacy-modal').classList.remove('hidden');
}
function closePrivacyPolicy() {
  document.getElementById('privacy-modal').classList.add('hidden');
}
function openTermsModal() {
  document.getElementById('terms-modal').classList.remove('hidden');
}
function closeTermsModal() {
  document.getElementById('terms-modal').classList.add('hidden');
}

// パスワードリセットメール送信
async function sendPasswordReset() {
  var email = document.getElementById('auth-email').value.trim();
  var errEl = document.getElementById('auth-error');
  var sucEl = document.getElementById('auth-success');
  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  if (!email) {
    errEl.textContent = 'メールアドレスを入力してください';
    errEl.classList.remove('hidden');
    return;
  }
  if (!_supabase) return;

  var btn = document.getElementById('forgot-pw-btn');
  btn.disabled = true;
  btn.textContent = '送信中...';

  try {
    var result = await _supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/'
    });
    if (result.error) throw result.error;
    sucEl.innerHTML =
      'パスワードリセットメールを送信しました ✓<br>' +
      '<span style="font-size:0.65rem;color:rgba(160,144,112,0.55)">受信ボックス・迷惑メールフォルダを確認してください</span>';
    sucEl.classList.remove('hidden');
  } catch(e) {
    errEl.textContent = translateAuthError(e.message || '不明なエラー');
    errEl.classList.remove('hidden');
  }

  btn.disabled = false;
  btn.textContent = 'パスワードを忘れた方';
}

function restoreState(state) {
  if (!state || state.page === 'lang') {
    currentLanguage = null;
    renderLangSelect();
    showPage('lang');
    return;
  }
  if (state.page === 'landing') {
    showPage('landing');
    return;
  }
  currentLanguage = state.lang || null;
  showNavAndProgress();
  if (state.page === 'list') {
    setActiveTab('problems');
    renderList();
    updateProgressDisplay();
    showPage('list');
  } else if (state.page === 'detail') {
    setActiveTab('problems');
    renderDetail(state.id);
    showPage('detail');
  } else if (state.page === 'guide') {
    setActiveTab('guide');
    renderGuide();
    showPage('guide');
  } else if (state.page === 'mission-list') {
    setActiveTab('missions');
    renderMissionList();
    showPage('mission-list');
  } else if (state.page === 'mission-detail') {
    setActiveTab('missions');
    renderMissionDetail(state.id);
    showPage('mission-detail');
  } else if (state.page === 'profile') {
    renderProfile();
    showPage('profile');
  }
}

window.addEventListener('popstate', function(e) {
  restoreState(e.state);
});

// ===== 問題データ =====

const problems = [

  // ───────────── UNIT 01: 基礎入力・出力 ─────────────
  {
    id: 1, unit: "UNIT 01  ◆  基礎入力・出力", rank: "ROOKIE",
    title: "Hello World",
    question: "「Hello, World!」と画面に出力するプログラムを書いてください。",
    hint: "cout を使って出力します。endl で改行できます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    expected: "Hello, World!",
    explanation: "cout は画面への出力に使います。<< で出力する内容をつなぎ、endl で改行します。#include <iostream> は入出力機能を使うためのおまじないです。"
  },
  {
    id: 2, unit: "UNIT 01  ◆  基礎入力・出力", rank: "ROOKIE",
    title: "コメントの書き方",
    question: "「// これはコメント」という1行コメントと、「/* 複数行 */」という複数行コメントを両方使ったプログラムを書いてください。Hello と出力してください。",
    hint: "// は1行コメント、/* ～ */ は複数行コメントです。コメントは実行されません。",
    answer:
`#include <iostream>
using namespace std;

// これは1行コメントです
/* これは
   複数行コメントです */

int main() {
    cout << "Hello" << endl;
    return 0;
}`,
    expected: "Hello",
    explanation: "コメントはメモとして書く説明文です。プログラムの実行には影響しません。// は行末までがコメント、/* */ は囲んだ範囲がコメントになります。"
  },
  {
    id: 3, unit: "UNIT 01  ◆  基礎入力・出力", rank: "BRONZE",
    title: "整数変数 (int)",
    question: "int 型の変数 age に 20 を代入して出力してください。",
    hint: "int 型は整数を扱う型です。int 変数名 = 値; で宣言と代入が同時にできます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int age = 20;
    cout << age << endl;
    return 0;
}`,
    expected: "20",
    explanation: "int は整数（-2147483648 ～ 2147483647）を扱う型です。変数は「型 名前 = 値;」で宣言します。変数名は中身を入れる箱のイメージです。"
  },
  {
    id: 4, unit: "UNIT 01  ◆  基礎入力・出力", rank: "BRONZE",
    title: "小数と文字列 (double / string)",
    question: "身長 172.5 を double 型の変数に、名前「Taro」を string 型の変数に代入して、両方出力してください。",
    hint: "小数は double 型、文字列は string 型を使います。string を使うには #include <string> が必要です。",
    answer:
`#include <iostream>
#include <string>
using namespace std;

int main() {
    double height = 172.5;
    string name = "Taro";
    cout << height << endl;
    cout << name << endl;
    return 0;
}`,
    expected: "172.5\nTaro",
    explanation: "double は小数を扱う型です。string は文字列を扱う型で、ダブルクォートで囲みます。int/double/string はC++の基本的な3つの型です。"
  },
  {
    id: 5, unit: "UNIT 01  ◆  基礎入力・出力", rank: "BRONZE",
    title: "定数 (const)",
    question: "円周率 3.14159 を const で定数として定義し、半径 5 の円の面積を出力してください。",
    hint: "const double PI = 3.14159; のように定義します。面積 = PI × r × r です。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    const double PI = 3.14159;
    double r = 5.0;
    cout << PI * r * r << endl;
    return 0;
}`,
    explanation: "const をつけると変数の値を変更できなくなります（定数）。変えてはいけない値（円周率・消費税率など）に使います。定数名は大文字で書くことが多いです。"
  },
  {
    id: 6, unit: "UNIT 01  ◆  基礎入力・出力", rank: "SILVER",
    title: "cin で入力",
    question: "ユーザーから名前（string）を受け取り「Hello, ○○!」と出力してください。",
    hint: "cin >> 変数名 でキーボードから入力を受け取れます。文字列連結は + で行います。",
    answer:
`#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    cin >> name;
    cout << "Hello, " << name << "!" << endl;
    return 0;
}`,
    explanation: "cin はキーボードからの入力を受け取ります。>> で変数に代入します。cout の << と向きが反対なのがポイントです。"
  },

  // ───────────── UNIT 02: 演算と条件分岐 ─────────────
  {
    id: 7, unit: "UNIT 02  ◆  演算と条件分岐", rank: "ROOKIE",
    title: "四則演算",
    question: "a = 10, b = 3 として、a+b, a-b, a*b, a/b をそれぞれ出力してください。",
    hint: "+, -, *, / を使います。int 同士の割り算は小数点以下が切り捨てられます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int a = 10, b = 3;
    cout << a + b << endl;
    cout << a - b << endl;
    cout << a * b << endl;
    cout << a / b << endl;
    return 0;
}`,
    expected: "13\n7\n30\n3",
    explanation: "int 同士の割り算は整数除算になります。10/3 は 3 になります（余りは切り捨て）。小数で割りたい場合は double 型を使います。"
  },
  {
    id: 8, unit: "UNIT 02  ◆  演算と条件分岐", rank: "BRONZE",
    title: "余り演算子 (%)",
    question: "17 を 5 で割った余りを出力してください。また、入力された数が偶数か奇数かを判定して出力してください。",
    hint: "% は余りを求める演算子です。偶数は 2 で割った余りが 0 になります。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    cout << 17 % 5 << endl;

    int n;
    cin >> n;
    if (n % 2 == 0) {
        cout << "偶数" << endl;
    } else {
        cout << "奇数" << endl;
    }
    return 0;
}`,
    explanation: "% は余りを返します。17 % 5 = 2 です。偶数・奇数判定は % 2 == 0 で行うのが定番です。"
  },
  {
    id: 9, unit: "UNIT 02  ◆  演算と条件分岐", rank: "BRONZE",
    title: "if 文",
    question: "点数（0〜100）を入力して、80点以上なら「A」、60点以上なら「B」、それ以外なら「C」と出力してください。",
    hint: "if, else if, else を組み合わせます。上から順に条件が評価されます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int score;
    cin >> score;
    if (score >= 80) {
        cout << "A" << endl;
    } else if (score >= 60) {
        cout << "B" << endl;
    } else {
        cout << "C" << endl;
    }
    return 0;
}`,
    explanation: "if-else if-else は上から順に条件を確認します。最初に true になった条件だけ実行されます。80点以上を先に判定することがポイントです。"
  },
  {
    id: 10, unit: "UNIT 02  ◆  演算と条件分岐", rank: "SILVER",
    title: "論理演算子 (&&, ||)",
    question: "3つの整数 a, b, c を入力して、3つ全部が正なら「全部正」、1つでも負なら「負あり」と出力してください。",
    hint: "&& は「かつ」、|| は「または」を意味します。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    if (a > 0 && b > 0 && c > 0) {
        cout << "全部正" << endl;
    } else {
        cout << "負あり" << endl;
    }
    return 0;
}`,
    explanation: "&& は両方の条件が true のとき true になります。|| は片方でも true なら true です。! は条件を反転させます。"
  },
  {
    id: 11, unit: "UNIT 02  ◆  演算と条件分岐", rank: "SILVER",
    title: "switch 文",
    question: "1〜7の数字を入力して、対応する曜日（月〜日）を出力してください。範囲外は「不明」と出力。",
    hint: "switch(変数) { case 値: 処理; break; } の形で書きます。break を忘れずに。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int day;
    cin >> day;
    switch (day) {
        case 1: cout << "月曜日" << endl; break;
        case 2: cout << "火曜日" << endl; break;
        case 3: cout << "水曜日" << endl; break;
        case 4: cout << "木曜日" << endl; break;
        case 5: cout << "金曜日" << endl; break;
        case 6: cout << "土曜日" << endl; break;
        case 7: cout << "日曜日" << endl; break;
        default: cout << "不明" << endl;
    }
    return 0;
}`,
    explanation: "switch 文は特定の値ごとに処理を分ける構文です。break がないと次の case も実行されてしまいます（フォールスルー）。default は全ての case に当てはまらない場合です。"
  },
  {
    id: 12, unit: "UNIT 02  ◆  演算と条件分岐", rank: "GOLD",
    title: "三項演算子",
    question: "整数を入力して、正なら「+」、0以下なら「-」を出力してください。三項演算子を使ってください。",
    hint: "条件 ? 値1 : 値2 の形で、条件が true なら値1、false なら値2が返ります。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << (n > 0 ? "+" : "-") << endl;
    return 0;
}`,
    explanation: "三項演算子は if-else を1行で書ける構文です。「条件 ? true時の値 : false時の値」の形で使います。シンプルな条件分岐に便利です。"
  },

  // ───────────── UNIT 03: ループ ─────────────
  {
    id: 13, unit: "UNIT 03  ◆  ループ", rank: "SILVER",
    title: "for 文",
    question: "1から n までの合計を求めて出力してください（n はユーザーが入力）。",
    hint: "for (int i = 1; i <= n; i++) でループします。合計用の変数を用意しましょう。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    cout << sum << endl;
    return 0;
}`,
    explanation: "for 文は「初期化; 条件; 更新」の3つで構成されます。sum += i は sum = sum + i の省略形です。ループ変数 i が 1 から n まで増えながら合計を計算します。"
  },
  {
    id: 14, unit: "UNIT 03  ◆  ループ", rank: "SILVER",
    title: "while 文",
    question: "1から始めて、値を2倍にし続けて 1000 を超えたら止まるプログラムを書いてください。各ステップの値を出力。",
    hint: "while (条件) { 処理 } の形で書きます。変数が 1000 を超えるまでループします。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int n = 1;
    while (n <= 1000) {
        cout << n << endl;
        n *= 2;
    }
    return 0;
}`,
    explanation: "while は条件が true の間ループします。n *= 2 は n = n * 2 の省略形（2倍）です。for より条件が複雑なときに使われることが多いです。"
  },
  {
    id: 15, unit: "UNIT 03  ◆  ループ", rank: "SILVER",
    title: "do-while 文",
    question: "1〜10の数字を入力するよう促し、範囲外なら再入力を求めるプログラムを書いてください（do-while を使う）。",
    hint: "do { 処理 } while (条件); は必ず1回実行してから条件を確認します。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int n;
    do {
        cout << "1〜10の数を入力: ";
        cin >> n;
    } while (n < 1 || n > 10);
    cout << "入力値: " << n << endl;
    return 0;
}`,
    explanation: "do-while は処理を先に1回実行してから条件を確認します。「入力→チェック」のように必ず1回実行が必要な場面に向いています。"
  },
  {
    id: 16, unit: "UNIT 03  ◆  ループ", rank: "GOLD",
    title: "break と continue",
    question: "1から20まで出力するが、3の倍数はスキップし、15になったら終了するプログラムを書いてください。",
    hint: "continue は今のループをスキップ、break はループを抜けます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 20; i++) {
        if (i == 15) break;
        if (i % 3 == 0) continue;
        cout << i << endl;
    }
    return 0;
}`,
    explanation: "break はループを即座に終了します。continue は残りの処理をスキップして次のループへ進みます。組み合わせることで複雑な制御が可能です。"
  },
  {
    id: 17, unit: "UNIT 03  ◆  ループ", rank: "GOLD",
    title: "ネストしたループ",
    question: "九九の表（1×1〜9×9）を出力してください。横に並べて表形式で表示してください。",
    hint: "for ループの中に for ループを入れます。\\t でタブ、\\n で改行できます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 9; i++) {
        for (int j = 1; j <= 9; j++) {
            cout << i * j << "\t";
        }
        cout << endl;
    }
    return 0;
}`,
    explanation: "ループの中にループを入れることを「ネスト（入れ子）」といいます。外のループが1回回るごとに、内側のループが全て実行されます。"
  },

  // ───────────── UNIT 04: 配列と文字列 ─────────────
  {
    id: 18, unit: "UNIT 04  ◆  配列と文字列", rank: "SILVER",
    title: "配列の基礎",
    question: "5つの整数を配列に格納し、全て出力してください。値は {10, 20, 30, 40, 50} です。",
    hint: "int arr[5] = {10, 20, 30, 40, 50}; で宣言します。インデックスは 0 から始まります。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    for (int i = 0; i < 5; i++) {
        cout << arr[i] << endl;
    }
    return 0;
}`,
    explanation: "配列は同じ型の値を連続して格納できます。arr[0] が最初、arr[4] が最後です（5要素の場合）。インデックスが0始まりであることに注意しましょう。"
  },
  {
    id: 19, unit: "UNIT 04  ◆  配列と文字列", rank: "GOLD",
    title: "配列の合計・最大値",
    question: "ユーザーから5つの整数を入力して配列に格納し、合計と最大値を出力してください。",
    hint: "最大値の初期値は配列の最初の要素にしておくのが定番です。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int arr[5];
    for (int i = 0; i < 5; i++) {
        cin >> arr[i];
    }
    int sum = 0, maxVal = arr[0];
    for (int i = 0; i < 5; i++) {
        sum += arr[i];
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    cout << "合計: " << sum << endl;
    cout << "最大: " << maxVal << endl;
    return 0;
}`,
    explanation: "最大値を求めるには、最初の要素を仮の最大値とし、それより大きい値が出たら更新します。この「比較して更新」パターンはよく使います。"
  },
  {
    id: 20, unit: "UNIT 04  ◆  配列と文字列", rank: "GOLD",
    title: "多次元配列",
    question: "3×3の行列を2次元配列で定義し（値は自由）、全要素を行列形式で出力してください。",
    hint: "int matrix[3][3] = {{...}, {...}, {...}}; で宣言します。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int matrix[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }
    return 0;
}`,
    explanation: "2次元配列は「配列の配列」です。matrix[行][列] でアクセスします。ネストしたループで全要素を操作するのが基本パターンです。"
  },
  {
    id: 21, unit: "UNIT 04  ◆  配列と文字列", rank: "GOLD",
    title: "文字列操作",
    question: "文字列を入力して、文字数・大文字変換・逆順を出力してください。",
    hint: ".length() で長さ、toupper() で大文字変換、reverse() で逆順にできます。",
    answer:
`#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    cin >> s;
    cout << s.length() << endl;

    string upper = s;
    for (char& c : upper) c = toupper(c);
    cout << upper << endl;

    string rev = s;
    reverse(rev.begin(), rev.end());
    cout << rev << endl;
    return 0;
}`,
    explanation: "string は文字列を扱うクラスです。.length() で文字数、reverse() で逆順にできます。for (char& c : s) は文字列の各文字にアクセスする「範囲for文」です。"
  },
  {
    id: 22, unit: "UNIT 04  ◆  配列と文字列", rank: "PLATINUM",
    title: "vector（動的配列）",
    question: "vector に整数を5つ追加し、全要素を出力してください。その後最後の要素を削除して再度出力してください。",
    hint: "push_back() で追加、pop_back() で最後を削除、size() でサイズ取得です。",
    answer:
`#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;
    v.push_back(10);
    v.push_back(20);
    v.push_back(30);
    v.push_back(40);
    v.push_back(50);

    for (int i = 0; i < v.size(); i++) {
        cout << v[i] << " ";
    }
    cout << endl;

    v.pop_back();
    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;
    return 0;
}`,
    explanation: "vector はサイズを後から変えられる配列です。push_back() で末尾追加、pop_back() で末尾削除。普通の配列よりも扱いやすいため実際の開発でよく使われます。"
  },

  // ───────────── UNIT 05: 関数 ─────────────
  {
    id: 23, unit: "UNIT 05  ◆  関数", rank: "GOLD",
    title: "関数の定義",
    question: "2つの整数の大きい方を返す関数 maxVal を作り、入力した2つの数の大きい方を出力してください。",
    hint: "int maxVal(int a, int b) { ... } の形で定義します。main より前に書くか、前方宣言が必要です。",
    answer:
`#include <iostream>
using namespace std;

int maxVal(int a, int b) {
    if (a > b) return a;
    return b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << maxVal(a, b) << endl;
    return 0;
}`,
    explanation: "関数は処理をまとめて名前をつけたものです。一度定義すれば何度でも使い回せます。return で値を返し、呼び出し元に結果が渡ります。"
  },
  {
    id: 24, unit: "UNIT 05  ◆  関数", rank: "GOLD",
    title: "参照渡し",
    question: "2つの整数を受け取り、値を入れ替える関数 swap を作ってください（参照渡しで実装）。",
    hint: "void swap(int& a, int& b) のように & をつけると参照渡しになります。",
    answer:
`#include <iostream>
using namespace std;

void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 5, y = 10;
    swap(x, y);
    cout << x << " " << y << endl;
    return 0;
}`,
    explanation: "参照渡し（&）を使うと、関数内で元の変数を直接変更できます。値渡しではコピーが渡されるため元の値は変わりません。入れ替えや変更が必要な場合に使います。"
  },
  {
    id: 25, unit: "UNIT 05  ◆  関数", rank: "PLATINUM",
    title: "関数のオーバーロード",
    question: "int 同士・double 同士の足し算をする add 関数を2つ定義して、それぞれ呼び出してください。",
    hint: "同じ関数名で引数の型が違う関数を複数定義できます（オーバーロード）。",
    answer:
`#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

double add(double a, double b) {
    return a + b;
}

int main() {
    cout << add(3, 4) << endl;
    cout << add(1.5, 2.3) << endl;
    return 0;
}`,
    explanation: "同じ関数名でも引数の型や数が違えば別の関数として定義できます（オーバーロード）。呼び出し時に引数の型によって自動で使う関数が選ばれます。"
  },
  {
    id: 26, unit: "UNIT 05  ◆  関数", rank: "DIAMOND",
    title: "再帰関数",
    question: "n の階乗（n!）を再帰関数で計算して出力してください。",
    hint: "factorial(n) = n * factorial(n-1)、factorial(0) = 1 が基本の考え方です。",
    answer:
`#include <iostream>
using namespace std;

int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

int main() {
    int n;
    cin >> n;
    cout << factorial(n) << endl;
    return 0;
}`,
    explanation: "再帰とは関数が自分自身を呼び出すことです。必ず「終了条件（ベースケース）」が必要です。n! = n × (n-1)! という数学的な定義をそのままコードにできます。"
  },

  // ───────────── UNIT 06: ポインタと参照 ─────────────
  {
    id: 27, unit: "UNIT 06  ◆  ポインタと参照", rank: "PLATINUM",
    title: "参照 (&)",
    question: "int 型変数 x = 10 を作り、参照 ref を通じて値を 20 に変更して x を出力してください。",
    hint: "int& ref = x; で参照を作れます。ref を変更すると x も変わります。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int x = 10;
    int& ref = x;
    ref = 20;
    cout << x << endl;
    return 0;
}`,
    explanation: "参照は変数の別名です。ref を通じた操作は x への操作と同じです。ポインタより扱いやすく、関数の引数で元の値を変更したいときに使います。"
  },
  {
    id: 28, unit: "UNIT 06  ◆  ポインタと参照", rank: "PLATINUM",
    title: "ポインタの基礎",
    question: "int 変数 x のポインタを作り、ポインタ経由でアドレスと値を出力してください。",
    hint: "int* ptr = &x; でポインタを作ります。&x はアドレス、*ptr は値です。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int x = 42;
    int* ptr = &x;
    cout << ptr << endl;
    cout << *ptr << endl;
    return 0;
}`,
    explanation: "ポインタはメモリアドレスを格納する変数です。& でアドレスを取得、* で間接参照（そのアドレスの値を取得）します。C++の重要概念のひとつです。"
  },
  {
    id: 29, unit: "UNIT 06  ◆  ポインタと参照", rank: "DIAMOND",
    title: "ポインタと配列",
    question: "int 配列 {1,2,3,4,5} をポインタを使って全要素出力してください。",
    hint: "配列名はそのまま先頭のポインタです。*(ptr + i) または ptr[i] でアクセスできます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    int* ptr = arr;
    for (int i = 0; i < 5; i++) {
        cout << *(ptr + i) << endl;
    }
    return 0;
}`,
    explanation: "配列名はその先頭アドレスを指すポインタです。*(ptr + i) は arr[i] と同じ意味です。ポインタ演算でアドレスを動かしながら配列を操作できます。"
  },
  {
    id: 30, unit: "UNIT 06  ◆  ポインタと参照", rank: "DIAMOND",
    title: "動的メモリ確保 (new/delete)",
    question: "new を使って実行時に整数を動的確保し、値を代入して出力後、delete で解放してください。",
    hint: "int* ptr = new int; で動的確保、delete ptr; で解放します。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int* ptr = new int;
    *ptr = 100;
    cout << *ptr << endl;
    delete ptr;
    ptr = nullptr;
    return 0;
}`,
    explanation: "new でヒープメモリを動的に確保できます。使い終わったら必ず delete で解放します（メモリリーク防止）。delete 後は nullptr を代入するのが安全です。"
  },

  // ───────────── LEGEND: 超難問チャレンジ ─────────────
  {
    id: 31, unit: "LEGEND  ◆  超難問チャレンジ", rank: "LEGEND",
    title: "テンプレートメタプログラミング",
    question: "C++ テンプレートの再帰的特殊化（Template Metaprogramming）を使って、コンパイル時にフィボナッチ数列の第10項（F(10) = 55）を計算し、出力するプログラムを書いてください。（F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)）",
    hint: "template<int N> struct Fib { static const int value = ...; }; でテンプレートを定義します。template<> struct Fib<0> と Fib<1> でベースケースを特殊化します。main() では Fib<10>::value を出力します。",
    answer:
`#include <iostream>
using namespace std;

template<int N>
struct Fib {
    static const int value = Fib<N-1>::value + Fib<N-2>::value;
};

template<>
struct Fib<0> { static const int value = 0; };

template<>
struct Fib<1> { static const int value = 1; };

int main() {
    cout << Fib<10>::value << endl;
    return 0;
}`,
    expected: "55",
    explanation: "テンプレートメタプログラミング（TMP）はコンパイル時に計算を行う高度な技法です。Fib<N>はFib<N-1>とFib<N-2>に依存し、コンパイラが再帰的に展開します。特殊化でベースケース(0,1)を定義することで無限展開を防ぎます。実行時のオーバーヘッドがゼロになる点が最大のメリットです。"
  }
];

// ===== 単元ガイドデータ =====

const unitGuides = [
  {
    id: "unit01",
    name: "UNIT 01  ◆  基礎入力・出力",
    summary: "C++プログラムの基本構造を学びます。プログラムはどう書き始めるのか、どうやって画面に文字を出すのか、どうやってキーボードから値を受け取るのかを理解しましょう。",
    points: [
      "C++のプログラムは必ず main() 関数から始まる",
      "#include でライブラリを読み込むことで機能を追加できる",
      "cout で出力、cin で入力ができる",
      "変数は「型 名前 = 値;」の形で宣言する",
      "const をつけると値を変更できない定数になる"
    ],
    words: [
      { term: "#include", desc: "ライブラリを読み込む命令。#include <iostream> で入出力機能が使えるようになる。" },
      { term: "iostream", desc: "入出力（Input/Output Stream）を扱うライブラリ。cout や cin が使えるようになる。" },
      { term: "using namespace std", desc: "std:: という前置きを省略できるようにするおまじない。これがないと std::cout と書く必要がある。" },
      { term: "main()", desc: "プログラムの起点となる関数。C++プログラムはここから実行が始まる。" },
      { term: "cout", desc: "画面（標準出力）へ出力するストリーム。<< で内容をつなぐ。" },
      { term: "cin", desc: "キーボード（標準入力）から値を受け取るストリーム。>> で変数に代入する。" },
      { term: "endl", desc: "改行を表す。cout << endl; で改行される。\\n でも同様に改行できる。" },
      { term: "変数", desc: "値を入れておく箱。名前をつけて後から参照・変更できる。" },
      { term: "型", desc: "変数の種類。int（整数）、double（小数）、string（文字列）、bool（真偽）など。" },
      { term: "const", desc: "変更できない定数を作るキーワード。const double PI = 3.14159; のように使う。" },
      { term: "return 0", desc: "main関数の終わりに書く。プログラムが正常終了したことをOSに伝える。" }
    ]
  },
  {
    id: "unit02",
    name: "UNIT 02  ◆  演算と条件分岐",
    summary: "計算の方法と、条件によって処理を変える分岐構造を学びます。プログラムは「状況に応じて違う動きをする」ことが重要で、それを実現するのが条件分岐です。",
    points: [
      "算術演算子（+, -, *, /, %）で計算できる",
      "int 同士の割り算は小数点以下が切り捨てられる",
      "if / else if / else で条件に応じた処理を書ける",
      "switch 文は特定の値で処理を分けるのに向いている",
      "比較演算子と論理演算子で複雑な条件を作れる"
    ],
    words: [
      { term: "算術演算子", desc: "計算に使う記号。+(加算) -(減算) *(乗算) /(除算) %(余り) がある。" },
      { term: "% (モジュロ)", desc: "割り算の余りを求める演算子。17 % 5 = 2。偶数・奇数判定によく使う。" },
      { term: "整数除算", desc: "int 同士の割り算。小数点以下は切り捨て。7 / 2 = 3 になる。" },
      { term: "if 文", desc: "条件が true のときだけ処理を実行する構文。if (条件) { 処理 } の形で書く。" },
      { term: "else", desc: "if の条件が false のときに実行される処理。" },
      { term: "else if", desc: "複数の条件を順番に判定するときに使う。最初に true になった条件だけ実行される。" },
      { term: "switch 文", desc: "変数の値によって処理を分ける構文。break を忘れると次の case も実行される。" },
      { term: "比較演算子", desc: "値を比較する演算子。== (等しい), != (等しくない), <, >, <=, >= がある。" },
      { term: "論理演算子", desc: "&& (かつ), || (または), ! (否定) の3種類。条件を組み合わせるのに使う。" },
      { term: "三項演算子", desc: "条件 ? 真の値 : 偽の値 の形。if-else を1行で書ける省略形。" },
      { term: "bool 型", desc: "true か false の2値を持つ型。条件式の結果はこの型になる。" }
    ]
  },
  {
    id: "unit03",
    name: "UNIT 03  ◆  ループ",
    summary: "同じ処理を繰り返す「ループ」を学びます。100回同じ処理をしたいとき、同じコードを100回書く必要はありません。ループを使えば数行で書けます。",
    points: [
      "for 文は「何回繰り返すか」が決まっているときに使う",
      "while 文は「条件が満たされる間」繰り返すときに使う",
      "do-while 文は必ず1回実行してから条件を確認する",
      "break でループを途中で抜け、continue で次へスキップできる",
      "ループの中にループを書くことを「ネスト」という"
    ],
    words: [
      { term: "for 文", desc: "for (初期化; 条件; 更新) { 処理 } の形。回数が決まった繰り返しに向いている。" },
      { term: "while 文", desc: "while (条件) { 処理 } の形。条件が true の間ずっと繰り返す。" },
      { term: "do-while 文", desc: "do { 処理 } while (条件); の形。必ず1回実行してから条件を確認する。" },
      { term: "ループ変数", desc: "for文で使うカウンター用の変数（よく i や j を使う）。" },
      { term: "インクリメント (++)", desc: "変数の値を1増やす。i++ は i = i + 1 と同じ。" },
      { term: "デクリメント (--)", desc: "変数の値を1減らす。i-- は i = i - 1 と同じ。" },
      { term: "break", desc: "ループを途中で強制終了する命令。switch 文でも使う。" },
      { term: "continue", desc: "ループの残りの処理をスキップして、次のループ回へ進む命令。" },
      { term: "無限ループ", desc: "終わらないループ。while(true) { } などで意図的に作ることもあるが、バグの原因にもなる。" },
      { term: "ネスト", desc: "ループの中にループを書くこと。九九の表などに使う。外側×内側の回数だけ実行される。" }
    ]
  },
  {
    id: "unit04",
    name: "UNIT 04  ◆  配列と文字列",
    summary: "複数の値をまとめて扱う「配列」と、文字列操作を学びます。データをまとめて管理することで、プログラムが大幅にシンプルになります。",
    points: [
      "配列は同じ型の値を連続して格納できるデータ構造",
      "インデックスは 0 から始まる（5要素なら 0〜4）",
      "vector は後からサイズを変えられる便利な配列",
      "string は文字の配列で、便利なメソッドが多数ある",
      "範囲 for 文（for (型 変数 : 配列)）で全要素を操作できる"
    ],
    words: [
      { term: "配列", desc: "同じ型の値を連続して格納するデータ構造。int arr[5]; のように宣言する。" },
      { term: "インデックス", desc: "配列の要素番号。0 から始まる。arr[0] が最初、arr[4] が5番目（最後）。" },
      { term: "要素", desc: "配列の中に入っている各値のこと。" },
      { term: "初期化", desc: "宣言と同時に値を設定すること。int arr[3] = {1, 2, 3}; のように書く。" },
      { term: "多次元配列", desc: "配列の配列。int matrix[3][3]; で3×3の2次元配列。[行][列] でアクセス。" },
      { term: "vector", desc: "サイズを動的に変えられる配列。#include <vector> が必要。実用的な場面でよく使う。" },
      { term: "push_back()", desc: "vector の末尾に要素を追加するメソッド。" },
      { term: "pop_back()", desc: "vector の末尾の要素を削除するメソッド。" },
      { term: "size() / length()", desc: "配列・vector・string の要素数・文字数を返すメソッド。" },
      { term: "範囲 for 文", desc: "for (型 変数 : コレクション) の形で全要素を順に処理できる構文。" },
      { term: "バッファオーバーフロー", desc: "配列の範囲外にアクセスしてしまうバグ。C++ではエラーにならず危険な動作をすることがある。" }
    ]
  },
  {
    id: "unit05",
    name: "UNIT 05  ◆  関数",
    summary: "処理をまとめて名前をつけた「関数」を学びます。同じ処理を何度も書く必要がなくなり、コードが読みやすく・再利用しやすくなります。",
    points: [
      "関数は「型 名前(引数) { 処理; return 値; }」の形で定義する",
      "main() より前に定義するか、前方宣言が必要",
      "値渡しでは引数のコピーが渡され、元の変数は変わらない",
      "参照渡し（&）では元の変数を直接変更できる",
      "同名で引数が違う関数を複数定義できる（オーバーロード）",
      "再帰関数は自分自身を呼び出す。必ず終了条件が必要"
    ],
    words: [
      { term: "関数", desc: "処理をまとめて名前をつけたもの。何度でも呼び出して再利用できる。" },
      { term: "引数 (パラメータ)", desc: "関数に渡す値。関数定義の () の中に書く。" },
      { term: "戻り値 (返り値)", desc: "関数が処理結果として返す値。return 文で返す。" },
      { term: "void", desc: "戻り値がないことを示す型。void func() は何も返さない関数。" },
      { term: "return", desc: "関数から値を返す・関数を終了する命令。" },
      { term: "値渡し", desc: "引数のコピーが関数に渡される。関数内で変更しても元の変数は変わらない。" },
      { term: "参照渡し", desc: "引数に & をつけると元の変数を直接渡せる。関数内での変更が元の変数に反映される。" },
      { term: "関数プロトタイプ", desc: "関数の型・名前・引数を事前に宣言すること。定義より前で使いたいときに必要。" },
      { term: "オーバーロード", desc: "同じ名前で引数の型・数が違う関数を複数定義すること。呼び出し時に自動判別される。" },
      { term: "再帰", desc: "関数が自分自身を呼び出すこと。必ず終了条件（ベースケース）が必要。ないと無限ループになる。" },
      { term: "スコープ", desc: "変数が有効な範囲。{ } の中で宣言した変数はその外からはアクセスできない。" }
    ]
  },
  {
    id: "unit06",
    name: "UNIT 06  ◆  ポインタと参照",
    summary: "メモリのアドレスを扱う「ポインタ」を学びます。C++で最も難しい概念のひとつですが、理解するとメモリの仕組みが分かりより高度なプログラムが書けるようになります。",
    points: [
      "変数はメモリ上の特定のアドレスに格納されている",
      "&（アドレス演算子）で変数のアドレスを取得できる",
      "*（間接参照）でポインタが指すアドレスの値を取得できる",
      "参照（&）はポインタより安全で扱いやすい変数の別名",
      "new でメモリを動的確保し、delete で解放する"
    ],
    words: [
      { term: "メモリ", desc: "プログラムがデータを保存する場所（RAM）。変数はメモリ上の特定の場所に格納される。" },
      { term: "アドレス", desc: "メモリ上の場所を示す番号。郵便番号のようなもの。" },
      { term: "ポインタ", desc: "アドレスを格納する変数。int* ptr; で宣言する。" },
      { term: "& (アドレス演算子)", desc: "変数のメモリアドレスを取得する演算子。&x で変数 x のアドレスが得られる。" },
      { term: "* (間接参照演算子)", desc: "ポインタが指すアドレスの値を取得する演算子（デリファレンス）。*ptr でアドレスの中の値が得られる。" },
      { term: "参照 (reference)", desc: "変数の別名。int& ref = x; で ref を通じて x を操作できる。ポインタより安全。" },
      { term: "nullptr", desc: "何も指さないポインタの値（NULL の代わり）。ポインタを使い終わったら nullptr を代入する。" },
      { term: "動的メモリ確保", desc: "new を使って実行時にメモリを確保すること。配列のサイズを実行時に決めたいときに使う。" },
      { term: "new", desc: "ヒープメモリを動的確保する演算子。int* p = new int; のように使う。" },
      { term: "delete", desc: "new で確保したメモリを解放する演算子。使い終わったら必ず呼ぶ。" },
      { term: "メモリリーク", desc: "new で確保したメモリを delete せずに放置すること。メモリが無駄に使われ続けるバグの原因。" },
      { term: "スタック / ヒープ", desc: "スタック: 通常の変数が置かれる領域。ヒープ: new で確保される領域。ヒープは手動解放が必要。" }
    ]
  }
];

// ===== Python 問題データ =====

const pythonProblems = [

  // ───────────── UNIT 01: 基礎入力・出力 ─────────────
  {
    id: 1, unit: "UNIT 01  ◆  基礎入力・出力", rank: "ROOKIE",
    title: "Hello World",
    question: "「Hello, World!」と画面に出力するプログラムを書いてください。",
    hint: "print() 関数を使って出力します。",
    answer:
`print("Hello, World!")`,
    expected: "Hello, World!",
    explanation: "print() はPythonの基本的な出力関数です。括弧の中に文字列を書くと画面に表示されます。文字列はダブルクォート \" またはシングルクォート ' で囲みます。"
  },
  {
    id: 2, unit: "UNIT 01  ◆  基礎入力・出力", rank: "ROOKIE",
    title: "コメントの書き方",
    question: "# を使った1行コメントと、''' を使った複数行コメントを両方含むプログラムを書き、「Hello」と出力してください。",
    hint: "# は1行コメント、''' ～ ''' は複数行コメントです。",
    answer:
`# これは1行コメントです
'''
これは
複数行コメントです
'''
print("Hello")`,
    explanation: "# より右はすべてコメントとして無視されます。''' または \"\"\" で囲むと複数行コメントになります。コメントはメモとして書く説明文で、実行結果に影響しません。"
  },
  {
    id: 3, unit: "UNIT 01  ◆  基礎入力・出力", rank: "BRONZE",
    title: "変数と型",
    question: "整数変数 age に 20 を、文字列変数 name に \"Taro\" を代入して、両方出力してください。",
    hint: "Python は型宣言が不要です。変数名 = 値 で代入できます。",
    answer:
`age = 20
name = "Taro"
print(age)
print(name)`,
    explanation: "Pythonは型を書かずに変数を使えます（動的型付け）。= で値を代入するだけで変数が作られます。type(変数) で型を確認できます。"
  },
  {
    id: 4, unit: "UNIT 01  ◆  基礎入力・出力", rank: "BRONZE",
    title: "input() で入力を受け取る",
    question: "キーボードから名前を入力してもらい、「こんにちは、〇〇さん！」と出力してください。",
    hint: "name = input() で入力を受け取れます。文字列の結合は + か f文字列を使います。",
    answer:
`name = input()
print("こんにちは、" + name + "さん！")`,
    explanation: "input() はキーボードからの入力を文字列として受け取ります。input(\"メッセージ\") とするとプロンプト表示もできます。受け取った値は常に文字列型です。"
  },
  {
    id: 5, unit: "UNIT 01  ◆  基礎入力・出力", rank: "BRONZE",
    title: "f文字列",
    question: "height に 172.5、name に \"Taro\" を代入し、f文字列を使って「Taroの身長は172.5cmです」と出力してください。",
    hint: "f\"テキスト{変数名}テキスト\" の形で書きます。",
    answer:
`name = "Taro"
height = 172.5
print(f"{name}の身長は{height}cmです")`,
    explanation: "f文字列（フォーマット文字列）は f\"\" または f'' で始める文字列です。{} の中に変数や式を書くと値が埋め込まれます。+ で文字列をつなぐより読みやすく書けます。"
  },

  // ───────────── UNIT 02: 演算と条件分岐 ─────────────
  {
    id: 6, unit: "UNIT 02  ◆  演算と条件分岐", rank: "BRONZE",
    title: "四則演算・剰余・べき乗",
    question: "a = 17、b = 5 として、a+b, a-b, a*b, a/b, a//b, a%b, a**2 をそれぞれ出力してください。",
    hint: "// は整数除算、% は剰余、** はべき乗です。",
    answer:
`a = 17
b = 5
print(a + b)
print(a - b)
print(a * b)
print(a / b)
print(a // b)
print(a % b)
print(a ** 2)`,
    explanation: "/ は小数の割り算（17/5=3.4）、// は整数除算（17//5=3）、% は余り（17%5=2）、** はべき乗（17**2=289）です。C++と違い / は常に小数を返します。"
  },
  {
    id: 7, unit: "UNIT 02  ◆  演算と条件分岐", rank: "BRONZE",
    title: "if文",
    question: "score を入力して、60以上なら「合格」、未満なら「不合格」と出力してください。",
    hint: "if 条件: の後はインデント（スペース4つ）で本文を書きます。",
    answer:
`score = int(input())
if score >= 60:
    print("合格")
else:
    print("不合格")`,
    explanation: "Pythonはインデント（字下げ）でブロックを表します。{} ではなくインデントが必須です。if 条件: の後は必ずインデントを入れてください。"
  },
  {
    id: 8, unit: "UNIT 02  ◆  演算と条件分岐", rank: "SILVER",
    title: "elif / else",
    question: "score を入力して、90以上→「S」、80以上→「A」、70以上→「B」、60以上→「C」、未満→「F」と出力してください。",
    hint: "elif を使って複数の条件を順番に判定します。",
    answer:
`score = int(input())
if score >= 90:
    print("S")
elif score >= 80:
    print("A")
elif score >= 70:
    print("B")
elif score >= 60:
    print("C")
else:
    print("F")`,
    explanation: "elif（else if）で複数の条件を順番に評価します。最初に True になった条件だけ実行されます。最後の else はどれにも当てはまらない場合の処理です。"
  },
  {
    id: 9, unit: "UNIT 02  ◆  演算と条件分岐", rank: "SILVER",
    title: "比較・論理演算子",
    question: "age を入力して、13以上かつ18未満なら「中学生・高校生」、それ以外なら「対象外」と出力してください。",
    hint: "and で条件を組み合わせます。Python では 13 <= age < 18 という書き方もできます。",
    answer:
`age = int(input())
if age >= 13 and age < 18:
    print("中学生・高校生")
else:
    print("対象外")`,
    explanation: "and は両方 True のとき True、or はどちらか True のとき True、not は True/False を反転します。Pythonでは 13 <= age < 18 のような連続比較も書けます。"
  },
  {
    id: 10, unit: "UNIT 02  ◆  演算と条件分岐", rank: "SILVER",
    title: "三項演算子（条件式）",
    question: "x を入力して、正の数なら「正」、そうでなければ「非正」を変数 result に代入して出力してください。三項演算子（条件式）を使ってください。",
    hint: "result = 値A if 条件 else 値B の形で書きます。",
    answer:
`x = int(input())
result = "正" if x > 0 else "非正"
print(result)`,
    explanation: "Pythonの三項演算子は 値A if 条件 else 値B の形です。条件が True なら値A、False なら値B が返ります。1行でif-elseを書けます。"
  },

  // ───────────── UNIT 03: ループ ─────────────
  {
    id: 11, unit: "UNIT 03  ◆  ループ", rank: "SILVER",
    title: "for と range()",
    question: "1 から 10 までの数を1行ずつ出力してください。",
    hint: "for i in range(1, 11): のように書きます。range(start, stop) の stop は含まれません。",
    answer:
`for i in range(1, 11):
    print(i)`,
    explanation: "range(start, stop) は start 以上 stop 未満の整数列を生成します。range(n) は 0〜n-1 です。for 変数 in イテラブル: の形で反復できます。"
  },
  {
    id: 12, unit: "UNIT 03  ◆  ループ", rank: "SILVER",
    title: "while ループ",
    question: "1 から始めて 2 倍ずつ増やし、100 を超えるまで値を出力してください。",
    hint: "while n <= 100: のような条件でループします。",
    answer:
`n = 1
while n <= 100:
    print(n)
    n *= 2`,
    explanation: "while 条件: は条件が True の間繰り返します。n *= 2 は n = n * 2 の省略形です。無限ループを防ぐため、必ずループ内で条件が変化するようにしましょう。"
  },
  {
    id: 13, unit: "UNIT 03  ◆  ループ", rank: "SILVER",
    title: "break と continue",
    question: "1 から 20 までループして、3 の倍数はスキップ、13 に達したらループを終了し、それ以外は出力してください。",
    hint: "3の倍数は continue、13は break を使います。",
    answer:
`for i in range(1, 21):
    if i == 13:
        break
    if i % 3 == 0:
        continue
    print(i)`,
    explanation: "break はループを即座に終了します。continue は残りの処理をスキップして次のイテレーションへ進みます。両方とも for と while で使えます。"
  },
  {
    id: 14, unit: "UNIT 03  ◆  ループ", rank: "GOLD",
    title: "ネストループ（九九の表）",
    question: "九九の表（1×1 から 9×9）を出力してください。各行はスペース区切りで表示してください。",
    hint: "for i in range(1, 10): の中に for j in range(1, 10): を書きます。end=\" \" で改行なし出力できます。",
    answer:
`for i in range(1, 10):
    for j in range(1, 10):
        print(i * j, end=" ")
    print()`,
    explanation: "ループの中にループを書くことを「ネスト（入れ子）」と言います。print(値, end=\"\") は改行なしで出力します。print() だけで改行できます。"
  },
  {
    id: 15, unit: "UNIT 03  ◆  ループ", rank: "GOLD",
    title: "リスト内包表記",
    question: "1 から 10 の二乗のリストを内包表記で作り、出力してください。",
    hint: "[式 for 変数 in range()] の形で書きます。",
    answer:
`squares = [i**2 for i in range(1, 11)]
print(squares)`,
    explanation: "リスト内包表記は [式 for 変数 in イテラブル] の形でリストを1行で生成できます。条件もつけられます: [i for i in range(10) if i % 2 == 0]。Pythonらしい書き方です。"
  },

  // ───────────── UNIT 04: リストと辞書 ─────────────
  {
    id: 16, unit: "UNIT 04  ◆  リストと辞書", rank: "SILVER",
    title: "リスト基本",
    question: "[10, 20, 30, 40, 50] というリストを作り、1番目（インデックス0）と最後の要素を出力してください。また要素数も出力してください。",
    hint: "リストは [] で作ります。インデックスは 0 から。[-1] で最後の要素を取れます。",
    answer:
`nums = [10, 20, 30, 40, 50]
print(nums[0])
print(nums[-1])
print(len(nums))`,
    explanation: "リストは [] で複数の値をまとめて管理できます。インデックスは 0 から始まり、[-1] は最後の要素を指します。len() で要素数を取得できます。"
  },
  {
    id: 17, unit: "UNIT 04  ◆  リストと辞書", rank: "GOLD",
    title: "リストのメソッド",
    question: "空のリストを作り、1,2,3 を追加、末尾を削除、昇順ソートして出力してください。",
    hint: "append(), pop(), sort() メソッドを使います。",
    answer:
`nums = []
nums.append(1)
nums.append(2)
nums.append(3)
nums.pop()
nums.sort()
print(nums)`,
    explanation: "append() は末尾に追加、pop() は末尾を削除（返り値あり）、sort() は昇順ソート（破壊的）、sorted() は新しいリストを返します。reverse=True で降順にできます。"
  },
  {
    id: 18, unit: "UNIT 04  ◆  リストと辞書", rank: "GOLD",
    title: "タプルとセット",
    question: "タプル (1, 2, 3) と セット {1, 2, 2, 3, 3} を作り、それぞれ出力してください。",
    hint: "タプルは () 、セットは {} で作ります。セットは重複を除去します。",
    answer:
`t = (1, 2, 3)
s = {1, 2, 2, 3, 3}
print(t)
print(s)`,
    explanation: "タプル () は変更不可のリストです。セット {} は重複なし・順序なしのコレクションです。セットは集合演算（和集合・差集合など）が得意です。"
  },
  {
    id: 19, unit: "UNIT 04  ◆  リストと辞書", rank: "GOLD",
    title: "辞書 (dict)",
    question: "名前→点数の辞書 {\"Alice\": 90, \"Bob\": 75, \"Carol\": 85} を作り、Bobの点数を出力し、Daveの点数 70 を追加して全員分を出力してください。",
    hint: "dict[キー] で値を取得・追加できます。for k, v in dict.items(): で全要素を取れます。",
    answer:
`scores = {"Alice": 90, "Bob": 75, "Carol": 85}
print(scores["Bob"])
scores["Dave"] = 70
for name, score in scores.items():
    print(f"{name}: {score}")`,
    explanation: "辞書はキーと値のペアを管理するデータ構造です。dict[キー] で値を取得・更新・追加できます。items() でキーと値のペアを取得、keys() でキー一覧、values() で値一覧を取れます。"
  },
  {
    id: 20, unit: "UNIT 04  ◆  リストと辞書", rank: "GOLD",
    title: "文字列操作",
    question: "\"Hello, World!\" という文字列を大文字・小文字に変換し、\",\" で分割して最初の要素を出力してください。",
    hint: "upper(), lower(), split() メソッドを使います。",
    answer:
`s = "Hello, World!"
print(s.upper())
print(s.lower())
parts = s.split(",")
print(parts[0])`,
    explanation: "文字列には便利なメソッドがたくさんあります。upper()/lower()は大小変換、split(区切り文字)で分割、strip()で前後の空白除去、replace(before,after)で置換ができます。"
  },

  // ───────────── UNIT 05: 関数 ─────────────
  {
    id: 21, unit: "UNIT 05  ◆  関数", rank: "GOLD",
    title: "def で関数定義",
    question: "2つの整数を受け取り、大きい方を返す関数 max_val を定義して、3 と 7 で呼び出して結果を出力してください。",
    hint: "def 関数名(引数): の形で定義します。return で値を返します。",
    answer:
`def max_val(a, b):
    if a > b:
        return a
    else:
        return b

print(max_val(3, 7))`,
    explanation: "def で関数を定義します。return で戻り値を指定します。Pythonの関数は型宣言が不要です。定義より前に呼び出すとエラーになります（C++と同様）。"
  },
  {
    id: 22, unit: "UNIT 05  ◆  関数", rank: "PLATINUM",
    title: "デフォルト引数",
    question: "名前と挨拶文を受け取り「挨拶文、名前！」と返す greet 関数を作ってください。挨拶文のデフォルトは「こんにちは」にしてください。",
    hint: "def greet(name, greeting=\"こんにちは\"): のように書きます。",
    answer:
`def greet(name, greeting="こんにちは"):
    return f"{greeting}、{name}！"

print(greet("Alice"))
print(greet("Bob", "おはよう"))`,
    explanation: "デフォルト引数は def func(引数=デフォルト値) で設定します。呼び出し時に省略するとデフォルト値が使われます。デフォルト引数は必ず最後に書く必要があります。"
  },
  {
    id: 23, unit: "UNIT 05  ◆  関数", rank: "PLATINUM",
    title: "*args と **kwargs",
    question: "任意の数の整数を受け取り合計を返す sum_all 関数と、キーワード引数を全て出力する print_info 関数を書いてください。",
    hint: "*args はタプルとして受け取ります。**kwargs は辞書として受け取ります。",
    answer:
`def sum_all(*args):
    return sum(args)

def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print(sum_all(1, 2, 3, 4, 5))
print_info(name="Alice", age=20, city="Tokyo")`,
    explanation: "*args は任意の数の位置引数をタプルで受け取ります。**kwargs は任意の数のキーワード引数を辞書で受け取ります。両方使うこともできます。"
  },
  {
    id: 24, unit: "UNIT 05  ◆  関数", rank: "PLATINUM",
    title: "lambda 式",
    question: "2数を掛け算する lambda 式を変数 multiply に代入して、3 と 4 の結果を出力してください。またリスト [(1,3),(2,1),(0,5)] を第2要素で降順ソートしてください。",
    hint: "lambda 引数: 式 の形で書きます。sort のキーに使えます。",
    answer:
`multiply = lambda a, b: a * b
print(multiply(3, 4))

pairs = [(1, 3), (2, 1), (0, 5)]
pairs.sort(key=lambda x: x[1], reverse=True)
print(pairs)`,
    explanation: "lambda は1行で書ける無名関数です。lambda 引数: 式 の形で定義します。sort の key や map/filter でよく使われます。複雑な処理は通常の def で書く方が読みやすいです。"
  },
  {
    id: 25, unit: "UNIT 05  ◆  関数", rank: "DIAMOND",
    title: "再帰関数",
    question: "n の階乗（n!）を再帰で計算する factorial 関数を書いて、5! を出力してください。",
    hint: "n == 0 のとき 1 を返す（ベースケース）。それ以外は n * factorial(n-1) を返します。",
    answer:
`def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
    explanation: "再帰は関数が自分自身を呼び出すテクニックです。必ず終了条件（ベースケース）が必要です。Pythonのデフォルトの再帰深度は約1000です。sys.setrecursionlimit() で変更できます。"
  },

  // ───────────── UNIT 06: クラスと例外 ─────────────
  {
    id: 26, unit: "UNIT 06  ◆  クラスと例外", rank: "DIAMOND",
    title: "クラスと __init__",
    question: "名前と年齢を持つ Person クラスを作り、「Alice, 20歳」と表示する introduce メソッドを追加して呼び出してください。",
    hint: "class クラス名: で定義。__init__(self, ...) でコンストラクタを書きます。",
    answer:
`class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        print(f"{self.name}, {self.age}歳")

p = Person("Alice", 20)
p.introduce()`,
    explanation: "__init__ はインスタンス生成時に自動的に呼ばれるコンストラクタです。self は自分自身を指す引数で、全てのメソッドの第1引数に必要です。self.名前 でインスタンス変数を定義します。"
  },
  {
    id: 27, unit: "UNIT 06  ◆  クラスと例外", rank: "DIAMOND",
    title: "継承",
    question: "Animal クラス（name属性、speak メソッドを持つ）を継承した Dog クラスを作り、speak をオーバーライドして「ワン！」と出力させてください。",
    hint: "class Dog(Animal): で継承します。super().__init__() で親クラスの初期化を呼べます。",
    answer:
`class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name}が鳴きます")

class Dog(Animal):
    def speak(self):
        print(f"{self.name}：ワン！")

d = Dog("ポチ")
d.speak()`,
    explanation: "class 子クラス(親クラス): で継承します。親のメソッドと同名のメソッドを定義するとオーバーライド（上書き）できます。super() で親クラスのメソッドを呼び出せます。"
  },
  {
    id: 28, unit: "UNIT 06  ◆  クラスと例外", rank: "DIAMOND",
    title: "try / except / finally",
    question: "0 での割り算と、文字列を int に変換するときのエラーを try/except で捕まえ、finally で「処理完了」と出力してください。",
    hint: "except ZeroDivisionError: と except ValueError: のように例外の種類を指定できます。",
    answer:
`try:
    x = int("abc")
    result = 10 / 0
except ValueError as e:
    print(f"ValueError: {e}")
except ZeroDivisionError as e:
    print(f"ZeroDivisionError: {e}")
finally:
    print("処理完了")`,
    explanation: "try ブロックでエラーが起きると except に飛びます。except 例外型 as e: で例外オブジェクトを受け取れます。finally は例外の有無に関わらず必ず実行されます。"
  },
  {
    id: 29, unit: "UNIT 06  ◆  クラスと例外", rank: "MASTER",
    title: "__str__ と特殊メソッド",
    question: "x,y座標を持つ Point クラスを作り、print(p) で「Point(3, 4)」と表示されるよう __str__ を実装してください。また2点間のユークリッド距離を求める distance メソッドも追加してください。",
    hint: "__str__(self) は print() で呼ばれます。距離は math.sqrt((x2-x1)**2 + (y2-y1)**2) です。",
    answer:
`import math

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"Point({self.x}, {self.y})"

    def distance(self, other):
        return math.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)

p1 = Point(3, 4)
p2 = Point(0, 0)
print(p1)
print(p1.distance(p2))`,
    explanation: "__str__ は str() や print() で呼ばれる特殊メソッドです。他にも __len__, __add__, __eq__ など多くの特殊メソッドがあります。import でモジュールを読み込めます。"
  },
  {
    id: 30, unit: "UNIT 06  ◆  クラスと例外", rank: "MASTER",
    title: "リスト操作の応用",
    question: "1〜20のリストから偶数だけを内包表記で取り出し、各要素を2乗した新しいリストを作り、合計と平均を出力してください。",
    hint: "内包表記で条件付きフィルタリングができます。sum() と len() を使います。",
    answer:
`nums = [i for i in range(1, 21) if i % 2 == 0]
squared = [x**2 for x in nums]
print(squared)
print(f"合計: {sum(squared)}")
print(f"平均: {sum(squared) / len(squared)}")`,
    explanation: "リスト内包表記 [式 for 変数 in イテラブル if 条件] で条件付きリストを1行で作れます。sum() で合計、max()/min() で最大・最小値を取得できます。"
  },

  // ───────────── LEGEND: 超難問チャレンジ ─────────────
  {
    id: 31, unit: "LEGEND  ◆  超難問チャレンジ", rank: "LEGEND",
    title: "メタクラスでSingleton実装",
    question: "Pythonのメタクラス（type を継承したクラス）を使って Singleton パターンを実装してください。MySingleton クラスはインスタンスをいくつ作成しても常に同一オブジェクトを返す必要があります。a と b を作成して a is b が True になることを出力してください。",
    hint: "class SingletonMeta(type): を定義し、__call__ メソッドをオーバーライドします。_instances 辞書でクラスとインスタンスを管理します。インスタンスが未作成の場合のみ super().__call__() を呼びます。",
    answer:
`class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class MySingleton(metaclass=SingletonMeta):
    pass


a = MySingleton()
b = MySingleton()
print(a is b)`,
    expected: "True",
    explanation: "メタクラスはクラスのクラスです。type を継承することでクラス生成の振る舞いを制御できます。__call__ はクラスが呼ばれた（インスタンス化された）ときに実行されます。_instances 辞書でインスタンスを管理し、2回目以降は既存インスタンスを返すことでSingletonを実現します。"
  }
];

// ===== Python ミッションデータ =====

const pythonMissions = [
  {
    id: 1, rank: "SILVER",
    title: "BMI 計算ツール",
    description: "身長（cm）と体重（kg）を入力してBMIを計算し、判定結果を表示するプログラムを作れ。",
    requirements: [
      "身長（cm）と体重（kg）を入力する",
      "BMI = 体重(kg) / (身長(m))² を計算する",
      "BMI 18.5未満 → 低体重、18.5〜25未満 → 普通体重、25〜30未満 → 肥満(1度)、30以上 → 肥満(2度以上)",
      "BMIを小数点第1位まで表示する",
      "身長・体重が0以下の場合はエラーメッセージを出す"
    ],
    sampleIO: `身長(cm): 170\n体重(kg): 65\nBMI: 22.5\n判定: 普通体重`,
    hint: "身長をcmからmに変換（/100）してから計算します。f\"{bmi:.1f}\" で小数点1桁表示できます。"
  },
  {
    id: 2, rank: "GOLD",
    title: "FizzBuzz 拡張版",
    description: "1 から N までの数を出力するプログラムを作れ。3の倍数は「Fizz」、5の倍数は「Buzz」、15の倍数は「FizzBuzz」と出力しろ。",
    requirements: [
      "N をユーザーが入力する",
      "1〜N を順番に出力する",
      "3の倍数 → Fizz",
      "5の倍数 → Buzz",
      "15の倍数 → FizzBuzz",
      "N が 0 以下なら「無効な入力です」と出力する"
    ],
    sampleIO: `入力: 15\n1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz`,
    hint: "15の倍数の判定を先に書かないと Fizz や Buzz が先に引っかかります。条件の順番に注意してください。"
  },
  {
    id: 3, rank: "GOLD",
    title: "数当てゲーム",
    description: "コンピュータが 1〜100 のランダムな整数を選ぶ。プレイヤーが数を入力するたびに「もっと大きい」「もっと小さい」「正解！」を表示するゲームを作れ。",
    requirements: [
      "1〜100の乱数を生成する（random モジュールを使う）",
      "ユーザーの入力が正解より小さければ「もっと大きい」",
      "ユーザーの入力が正解より大きければ「もっと小さい」",
      "正解したら「正解！ X回で当てました」と表示して終了",
      "入力が 1〜100 の範囲外なら「範囲外です」と表示する"
    ],
    sampleIO: `入力: 50\nもっと大きい\n入力: 75\nもっと小さい\n入力: 62\n正解！ 3回で当てました`,
    hint: "import random して random.randint(1, 100) で乱数を生成できます。while ループで正解するまで繰り返します。"
  },
  {
    id: 4, rank: "PLATINUM",
    title: "成績管理システム",
    description: "複数の生徒の名前と点数を入力して管理するプログラムを作れ。合計・平均・最高・最低点を計算して出力しろ。",
    requirements: [
      "生徒数 N を入力する",
      "各生徒の名前と点数を入力する",
      "各生徒の点数と合否（60点以上で合格）を表示する",
      "クラス全体の平均・最高点・最低点を表示する",
      "辞書またはリストを使ってデータを管理する"
    ],
    sampleIO: `生徒数: 3\n名前: Alice 点数: 85\n名前: Bob 点数: 55\n名前: Carol 点数: 92\nAlice: 85点 合格\nBob: 55点 不合格\nCarol: 92点 合格\n平均: 77.3点\n最高: 92点\n最低: 55点`,
    hint: "辞書のリスト [{\"name\": \"Alice\", \"score\": 85}, ...] で管理すると便利です。max() / min() に key を使えます。"
  },
  {
    id: 5, rank: "DIAMOND",
    title: "簡易 Todo アプリ",
    description: "コマンドラインで動く Todo リスト管理アプリを作れ。追加・表示・削除ができること。",
    requirements: [
      "add タスク名 でタスクを追加する",
      "list で現在のタスク一覧を番号付きで表示する",
      "done 番号 で完了タスクを削除する",
      "quit で終了する",
      "存在しない番号が指定された場合はエラーメッセージを表示する"
    ],
    sampleIO: `> add 買い物\n追加しました: 買い物\n> add 勉強\n追加しました: 勉強\n> list\n1. 買い物\n2. 勉強\n> done 1\n完了: 買い物\n> quit`,
    hint: "while True で無限ループ、input() でコマンドを受け取り、split() でコマンドと引数に分割します。リストのインデックスに注意してください。"
  },
  {
    id: 6, rank: "MASTER",
    title: "テキスト解析ツール",
    description: "英語テキストを入力して単語の出現頻度を分析し、上位5単語を表示するプログラムを作れ。",
    requirements: [
      "テキストを入力する（複数行も可、空行で終了）",
      "大文字小文字を統一する",
      "句読点（.,!?）を除去する",
      "各単語の出現回数をカウントする",
      "出現回数の多い順に上位5単語とその回数を表示する"
    ],
    sampleIO: `テキスト入力（空行で終了）:\nthe quick brown fox jumps over the lazy dog the fox\n\n=== 出現頻度 上位5 ===\nthe: 3回\nfox: 2回\nquick: 1回\nbrown: 1回\njumps: 1回`,
    hint: "split() で単語に分割、辞書で頻度をカウント、sorted() と key=lambda でソートできます。string.punctuation で句読点リストを使えます。"
  }
];

// ===== Python 単元ガイドデータ =====

const pythonUnitGuides = [
  {
    id: "py-unit01",
    name: "UNIT 01  ◆  基礎入力・出力",
    summary: "Pythonプログラムの基本構造を学びます。print() で出力、input() で入力、変数への代入、f文字列による文字列整形など、プログラムの基本要素を理解しましょう。",
    points: [
      "print() で画面に出力、input() でキーボードから入力を受け取る",
      "変数は 変数名 = 値 で宣言と代入を同時に行う（型宣言不要）",
      "# で1行コメント、''' または \"\"\" で複数行コメント",
      "f\"{変数}\" で変数を文字列に埋め込めるf文字列が便利",
      "int(), float(), str() で型変換ができる"
    ],
    words: [
      { term: "print()", desc: "画面に値を出力する関数。print(a, b) で複数値をスペース区切り出力。end='' で改行なし。" },
      { term: "input()", desc: "キーボードからの入力を文字列として受け取る関数。常に str 型を返す。" },
      { term: "変数", desc: "値を入れておく入れ物。Python は型宣言不要。変数名 = 値 で作成できる。" },
      { term: "int()", desc: "文字列や小数を整数に変換する関数。int(\"42\") → 42、int(3.9) → 3。" },
      { term: "float()", desc: "整数や文字列を小数（浮動小数点数）に変換する関数。float(\"3.14\") → 3.14。" },
      { term: "str()", desc: "整数や小数を文字列に変換する関数。str(42) → \"42\"。" },
      { term: "f文字列", desc: "f\"テキスト{変数}\" の形で変数を文字列に埋め込む記法。{変数:.2f} で小数点以下2桁表示も可能。" },
      { term: "コメント", desc: "# より右はコメント。''' または \"\"\" で囲むと複数行コメント。実行には影響しない。" },
      { term: "型", desc: "データの種類。int（整数）、float（小数）、str（文字列）、bool（真偽値）など。" },
      { term: "type()", desc: "変数の型を返す関数。type(x) で int や str などが返ってくる。" }
    ]
  },
  {
    id: "py-unit02",
    name: "UNIT 02  ◆  演算と条件分岐",
    summary: "計算の方法と条件によって処理を変える方法を学びます。Pythonは // で整数除算、** でべき乗ができるなどC++と少し異なる点があります。インデントによるブロック構造も重要です。",
    points: [
      "/ は常に小数を返す。整数除算は // を使う",
      "** でべき乗（2**10 = 1024）",
      "if/elif/else でブロックはインデント（スペース4つ）で表す",
      "and, or, not で論理演算（&&, ||, ! の代わり）",
      "値A if 条件 else 値B で三項演算子"
    ],
    words: [
      { term: "/ (除算)", desc: "常に小数を返す。7/2 = 3.5。整数同士でも小数になる（C++と違う）。" },
      { term: "// (整数除算)", desc: "割り算の商（小数切り捨て）。7//2 = 3。C++の / に近い動作。" },
      { term: "% (剰余)", desc: "割り算の余り。17%5 = 2。偶数判定 n%2==0 などに使う。" },
      { term: "** (べき乗)", desc: "2**10 = 1024。C++にはない演算子。math.pow() でも同様の計算ができる。" },
      { term: "インデント", desc: "ブロックを表すための字下げ。通常スペース4つ。Pythonでは必須でありスタイルではなく文法。" },
      { term: "if / elif / else", desc: "条件分岐の構文。elif は else if の省略形。インデントでブロックを表す。" },
      { term: "and / or / not", desc: "論理演算子。and = 両方True、or = どちらかTrue、not = 反転。C++の &&, ||, ! に相当。" },
      { term: "比較演算子", desc: "== (等しい), != (等しくない), <, >, <=, >= でTrue/Falseを返す。" },
      { term: "三項演算子", desc: "値A if 条件 else 値B の形。C++の 条件 ? 値A : 値B に相当。" },
      { term: "in 演算子", desc: "値がリストや文字列に含まれるか判定。if x in [1,2,3]: のように使う。" }
    ]
  },
  {
    id: "py-unit03",
    name: "UNIT 03  ◆  ループ",
    summary: "同じ処理を繰り返す「ループ」を学びます。Pythonの for 文はC++と大きく異なり、リストなどのイテラブルを直接操作できます。リスト内包表記というPython特有の便利な書き方も習得しましょう。",
    points: [
      "for 変数 in イテラブル: でリストや文字列の要素を順に処理できる",
      "range(start, stop, step) で整数列を生成する",
      "while 条件: は条件が True の間繰り返す",
      "break でループ終了、continue で次へスキップ",
      "[式 for 変数 in イテラブル if 条件] リスト内包表記でシンプルにリストを生成"
    ],
    words: [
      { term: "for 文", desc: "for 変数 in イテラブル: の形。リスト・文字列・range などの要素を順番に処理する。" },
      { term: "range()", desc: "整数列を生成する関数。range(5): 0〜4、range(1,6): 1〜5、range(0,10,2): 0,2,4,6,8。" },
      { term: "while 文", desc: "while 条件: の形。条件が True の間繰り返す。条件を変化させないと無限ループになる。" },
      { term: "break", desc: "ループを即座に終了する命令。for/while 両方で使える。" },
      { term: "continue", desc: "現在のイテレーションの残りをスキップして次へ進む命令。" },
      { term: "enumerate()", desc: "for i, v in enumerate(list): で添字と値を同時に取得できる便利関数。" },
      { term: "zip()", desc: "複数のリストを同時にループできる。for a, b in zip(list1, list2): の形で使う。" },
      { term: "リスト内包表記", desc: "[式 for 変数 in イテラブル] や [式 for 変数 in イテラブル if 条件] でリストを生成する。" },
      { term: "pass", desc: "何もしない命令。空のブロックを作るときに使う（Pythonは空ブロックがエラーになるため）。" },
      { term: "イテラブル", desc: "for 文で反復できるオブジェクトの総称。list, str, range, tuple, dict などがある。" }
    ]
  },
  {
    id: "py-unit04",
    name: "UNIT 04  ◆  リストと辞書",
    summary: "Pythonの主要なデータ構造を学びます。リスト・タプル・セット・辞書はそれぞれ異なる特徴を持ち、状況に応じて使い分けることが重要です。",
    points: [
      "リスト [] は順序あり・変更可能。append/pop/sort などメソッドが豊富",
      "タプル () は順序あり・変更不可。イミュータブルなので辞書のキーにもなれる",
      "セット {} は重複なし・順序なし。集合演算が得意",
      "辞書 {} はキーと値のペア。キーは一意で、検索が高速",
      "スライス list[start:stop:step] で部分列を取得できる"
    ],
    words: [
      { term: "リスト", desc: "[] で作る順序ありの可変コレクション。異なる型の値も入れられる。C++のvectorに近い。" },
      { term: "インデックス", desc: "0 から始まる要素番号。list[0] が最初、list[-1] が最後の要素。" },
      { term: "スライス", desc: "list[start:stop:step] で部分列を取得。list[1:3] は index 1〜2 の要素。" },
      { term: "append() / pop()", desc: "append(値) で末尾に追加、pop() で末尾を削除して返す。pop(i) で i番目を削除。" },
      { term: "sort() / sorted()", desc: "sort() はリスト自体を並び替え（破壊的）。sorted() は新しいリストを返す（非破壊）。" },
      { term: "タプル", desc: "() で作る変更不可のコレクション。関数の複数戻り値、辞書のキーとして使える。" },
      { term: "セット", desc: "重複なし・順序なしのコレクション。集合演算（| 和集合、& 積集合、- 差集合）が使える。" },
      { term: "辞書 (dict)", desc: "{キー: 値} で作るキーと値のペアの集合。キーで高速に値を検索できる。" },
      { term: "items() / keys() / values()", desc: "辞書のキーと値のペア、キー一覧、値一覧をそれぞれ返すメソッド。" },
      { term: "len()", desc: "リスト・文字列・辞書などの要素数・文字数を返す組み込み関数。" }
    ]
  },
  {
    id: "py-unit05",
    name: "UNIT 05  ◆  関数",
    summary: "処理をまとめて再利用できる「関数」を学びます。Pythonの関数はC++より柔軟で、デフォルト引数・可変長引数・ラムダ式など様々な機能があります。",
    points: [
      "def 関数名(引数): の形で定義し、return で戻り値を返す",
      "デフォルト引数 def func(x, y=10): で引数を省略可能にできる",
      "*args で可変長位置引数（タプル）、**kwargs で可変長キーワード引数（辞書）",
      "lambda 引数: 式 で簡潔な無名関数を作れる",
      "関数はオブジェクトなので変数に代入したり引数として渡したりできる"
    ],
    words: [
      { term: "def", desc: "関数を定義するキーワード。def 関数名(引数): の形で書く。" },
      { term: "return", desc: "関数から値を返す命令。return を書かない場合は None が返る。複数の値も返せる。" },
      { term: "引数 / 仮引数", desc: "関数に渡す値。def func(a, b): の a, b が仮引数。呼び出し時に渡す値が実引数。" },
      { term: "デフォルト引数", desc: "def func(x, y=10): のように省略可能な引数。呼び出し時に省略するとデフォルト値が使われる。" },
      { term: "*args", desc: "可変長の位置引数をタプルとして受け取る。def func(*args): の形で使う。" },
      { term: "**kwargs", desc: "可変長のキーワード引数を辞書として受け取る。def func(**kwargs): の形で使う。" },
      { term: "lambda", desc: "lambda 引数: 式 で書ける無名関数。sort の key などに使う。複雑な処理は def で書く方がいい。" },
      { term: "スコープ", desc: "変数の有効範囲。関数内の変数は外から見えない（ローカルスコープ）。" },
      { term: "再帰", desc: "関数が自分自身を呼び出すこと。必ずベースケース（終了条件）が必要。" },
      { term: "None", desc: "「何もない」を表す特殊な値。return のない関数はNoneを返す。C++のnullptrに近い。" }
    ]
  },
  {
    id: "py-unit06",
    name: "UNIT 06  ◆  クラスと例外",
    summary: "オブジェクト指向プログラミングの基本である「クラス」と、エラーを適切に処理する「例外処理」を学びます。大きなプログラムを整理・再利用するための重要な概念です。",
    points: [
      "class クラス名: でクラスを定義し、__init__(self, ...) で初期化する",
      "self は自分自身（インスタンス）を指す引数。全メソッドの第1引数に必要",
      "class 子(親): で継承。super() で親クラスのメソッドを呼べる",
      "try/except でエラーを捕捉。finally は常に実行される",
      "__str__, __len__, __add__ などの特殊メソッドでクラスの動作をカスタマイズできる"
    ],
    words: [
      { term: "class", desc: "クラスを定義するキーワード。設計図のようなもので、インスタンスを生成できる。" },
      { term: "__init__", desc: "コンストラクタ。インスタンス生成時に自動的に呼ばれる。self と初期化したい引数を取る。" },
      { term: "self", desc: "インスタンス自身を指す引数。全メソッドの第1引数に書く必要がある。" },
      { term: "インスタンス", desc: "クラスから作られた実体。p = Person(\"Alice\", 20) で Person クラスのインスタンスを作る。" },
      { term: "継承", desc: "class 子クラス(親クラス): で親の機能を引き継ぐ。コードの再利用に使う。" },
      { term: "super()", desc: "親クラスのメソッドを呼び出す関数。super().__init__() で親の初期化を行う。" },
      { term: "オーバーライド", desc: "子クラスで親クラスと同名のメソッドを再定義すること。子クラスの方が優先される。" },
      { term: "try / except", desc: "エラー（例外）が起きたときの処理を書く構文。except 例外型 as e: でエラー情報を取得。" },
      { term: "finally", desc: "try/except の後に必ず実行される処理。ファイルのクローズなど後始末に使う。" },
      { term: "__str__", desc: "print() や str() で呼ばれる特殊メソッド。クラスの文字列表現を定義できる。" }
    ]
  }
];

// ===== ミッションデータ =====

const missions = [
  {
    id: 1, rank: "GOLD",
    title: "じゃんけんゲーム",
    description: "コンピュータとじゃんけんができるプログラムを作れ。プレイヤーが0（グー）・1（チョキ）・2（パー）を入力し、コンピュータはランダムに出す。勝敗を判定して表示しろ。",
    requirements: [
      "0=グー、1=チョキ、2=パーの入力を受け取る",
      "コンピュータはランダムに手を選ぶ",
      "勝ち・負け・あいこを判定して表示する",
      "無効な入力（0〜2以外）はエラーメッセージを出す"
    ],
    sampleIO: `入力: 0\nCPU: パー(2)\n結果: 負け`,
    hint: "rand() % 3 で 0〜2 の乱数が得られます。srand(time(0)) を main の最初に書いてください。勝敗の条件は (player - cpu + 3) % 3 で判定できます。"
  },
  {
    id: 2, rank: "PLATINUM",
    title: "FizzBuzz 拡張版",
    description: "1 から N までの数を出力するプログラムを作れ。ただし 3 の倍数は「Fizz」、5 の倍数は「Buzz」、15 の倍数は「FizzBuzz」と出力しろ。N はユーザーが入力する。",
    requirements: [
      "N をユーザーが入力する",
      "1〜N を順番に出力する",
      "3の倍数 → Fizz",
      "5の倍数 → Buzz",
      "15の倍数 → FizzBuzz（FizzでもBuzzでもなく）",
      "N が 0 以下なら「無効」と出力する"
    ],
    sampleIO: `入力: 15\n1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz`,
    hint: "15の倍数の判定を先に書かないと、Fizz や Buzz が先に引っかかってしまいます。条件の順番に注意してください。"
  },
  {
    id: 3, rank: "PLATINUM",
    title: "数当てゲーム",
    description: "コンピュータが 1〜100 のランダムな整数を選ぶ。プレイヤーが数を入力するたびに「もっと大きい」「もっと小さい」「正解！」を表示するゲームを作れ。",
    requirements: [
      "1〜100の乱数を生成する",
      "ユーザーの入力が正解より小さければ「もっと大きい」",
      "ユーザーの入力が正解より大きければ「もっと小さい」",
      "正解したら「正解！ X回で当てました」と表示して終了",
      "入力が 1〜100 の範囲外なら「範囲外です」と表示する"
    ],
    sampleIO: `入力: 50\nもっと大きい\n入力: 75\nもっと小さい\n入力: 62\n正解！ 3回で当てました`,
    hint: "rand() % 100 + 1 で 1〜100 の乱数。whileループで正解するまで繰り返します。試行回数をカウントする変数を用意しましょう。"
  },
  {
    id: 4, rank: "DIAMOND",
    title: "簡易電卓",
    description: "2つの数値と演算子（+, -, *, /）を入力して結果を表示する電卓プログラムを作れ。ループで繰り返し計算でき、「q」を入力したら終了する。",
    requirements: [
      "数値 演算子 数値 の形で入力を受け取る",
      "+, -, *, / の四則演算に対応する",
      "ゼロ除算はエラーメッセージを表示する",
      "ループで繰り返し計算できる",
      "「q」を入力したらプログラムを終了する"
    ],
    sampleIO: `入力: 10 + 5\n結果: 15\n入力: 10 / 0\nエラー: ゼロ除算\n入力: q\n終了`,
    hint: "演算子は char 型で受け取れます。switch 文で分岐するとスッキリ書けます。ゼロ除算は if (b == 0) でチェックしましょう。"
  },
  {
    id: 5, rank: "DIAMOND",
    title: "成績管理システム",
    description: "生徒の名前と点数（複数科目）を入力して管理するプログラムを作れ。合計・平均・合否を計算して出力しろ。",
    requirements: [
      "生徒数 N を入力する",
      "各生徒の名前と点数（5科目）を入力する",
      "各生徒の合計・平均を計算して表示する",
      "平均 60 点以上で「合格」、未満で「不合格」",
      "クラス全体の最高平均・最低平均を表示する"
    ],
    sampleIO: `生徒数: 2\n名前: Taro\n点数(5科目): 80 70 90 60 75\n合計: 375  平均: 75.0  合格\n名前: Hanako\n点数(5科目): 50 40 60 55 45\n合計: 250  平均: 50.0  不合格`,
    hint: "生徒数が可変なので vector を使うと便利です。二次元配列や構造体を使って整理するとコードが読みやすくなります。"
  },
  {
    id: 6, rank: "MASTER",
    title: "素数列挙プログラム",
    description: "N 以下の素数をすべて出力するプログラムを作れ。「エラトステネスの篩（ふるい）」アルゴリズムを使って効率的に実装しろ。",
    requirements: [
      "N をユーザーが入力する",
      "エラトステネスの篩で N 以下の素数をすべて列挙する",
      "素数を 1 行に 10 個ずつ表示する",
      "素数の個数も最後に表示する",
      "N が 2 未満なら「素数なし」と表示する"
    ],
    sampleIO: `入力: 50\n2  3  5  7  11  13  17  19  23  29\n31  37  41  43  47\n素数の個数: 15`,
    hint: "エラトステネスの篩：bool 配列を用意して、合成数（素数でない数）を順番に消していくアルゴリズムです。2の倍数を消し、3の倍数を消し…と繰り返します。"
  }
];

// ===== JavaScript 問題データ =====

const javascriptProblems = [

  // UNIT 01
  {
    id: 1, unit: "UNIT 01  ◆  基礎・出力", rank: "ROOKIE",
    title: "Hello World",
    question: "「Hello, World!」と画面に出力するプログラムを書いてください。",
    hint: "console.log() を使って出力します。",
    answer: `console.log("Hello, World!");`,
    expected: "Hello, World!",
    explanation: "console.log() はJavaScriptの基本的な出力関数です。文字列はダブルクォートまたはシングルクォートで囲みます。"
  },
  {
    id: 2, unit: "UNIT 01  ◆  基礎・出力", rank: "ROOKIE",
    title: "コメントの書き方",
    question: "// による1行コメントと /* */ による複数行コメントを両方含むプログラムを書き、「Hello」と出力してください。",
    hint: "// は1行コメント、/* ～ */ は複数行コメントです。",
    answer:
`// これは1行コメントです
/*
これは複数行コメントです
*/
console.log("Hello");`,
    explanation: "// より右はすべてコメントです。/* */ で囲むと複数行コメントになります。"
  },
  {
    id: 3, unit: "UNIT 01  ◆  基礎・出力", rank: "ROOKIE",
    title: "let と const",
    question: "const で name に \"Taro\" を、let で age に 20 を代入して、両方を出力してください。",
    hint: "const は再代入不可、let は再代入可能な変数宣言です。",
    answer:
`const name = "Taro";
let age = 20;
console.log(name);
console.log(age);`,
    explanation: "const は定数（値を変えられない）、let は変数（値を変えられる）です。現代のJavaScriptでは var より const/let を使います。"
  },
  {
    id: 4, unit: "UNIT 01  ◆  基礎・出力", rank: "BRONZE",
    title: "テンプレートリテラル",
    question: "name に \"Taro\"、age に 20 を代入し、テンプレートリテラルを使って「Taroは20歳です」と出力してください。",
    hint: "バッククォート ` で囲み、${変数名} で値を埋め込みます。",
    answer: 'const name = "Taro";\nconst age = 20;\nconsole.log(`${name}は${age}歳です`);',



    explanation: "テンプレートリテラルはバッククォートで囲み、${} の中に変数や式を書けます。"
  },
  {
    id: 5, unit: "UNIT 01  ◆  基礎・出力", rank: "BRONZE",
    title: "データ型と型変換",
    question: "文字列 \"42\" を Number() で数値に変換して 8 を足した結果と、変換前後の型を typeof で出力してください。",
    hint: "Number() で文字列を数値に変換できます。typeof で型を確認できます。",
    answer:
`const str = "42";
const num = Number(str);
console.log(typeof str);
console.log(typeof num);
console.log(num + 8);`,
    explanation: "Number()で文字列→数値変換ができます。typeof演算子で型を確認できます。"
  },

  // UNIT 02
  {
    id: 6, unit: "UNIT 02  ◆  演算と条件分岐", rank: "ROOKIE",
    title: "四則演算・剰余・べき乗",
    question: "a = 17、b = 5 として、a+b, a-b, a*b, a/b, a%b, a**2 をそれぞれ出力してください。",
    hint: "% は剰余、** はべき乗です。",
    answer:
`const a = 17;
const b = 5;
console.log(a + b);
console.log(a - b);
console.log(a * b);
console.log(a / b);
console.log(a % b);
console.log(a ** 2);`,
    explanation: "% は余り（17%5=2）、** はべき乗（17**2=289）です。/ は常に小数を返します（17/5=3.4）。"
  },
  {
    id: 7, unit: "UNIT 02  ◆  演算と条件分岐", rank: "ROOKIE",
    title: "if / else",
    question: "score = 75 として、60以上なら「合格」、未満なら「不合格」と出力してください。",
    hint: "if (条件) { } else { } の形で書きます。",
    answer:
`const score = 75;
if (score >= 60) {
    console.log("合格");
} else {
    console.log("不合格");
}`,
    explanation: "if文は条件が true のときのみブロックを実行します。else は条件が false のときに実行されます。"
  },
  {
    id: 8, unit: "UNIT 02  ◆  演算と条件分岐", rank: "BRONZE",
    title: "三項演算子",
    question: "x = -5 として、正の数なら「正」、そうでなければ「非正」を result に代入して出力してください。",
    hint: "条件 ? 値A : 値B の形で書きます。",
    answer:
`const x = -5;
const result = x > 0 ? "正" : "非正";
console.log(result);`,
    explanation: "三項演算子は 条件 ? trueの値 : falseの値 です。if-elseを1行で書けます。"
  },
  {
    id: 9, unit: "UNIT 02  ◆  演算と条件分岐", rank: "BRONZE",
    title: "switch文",
    question: "day = 3 として、1→「月曜」2→「火曜」3→「水曜」それ以外→「その他」と出力するswitch文を書いてください。",
    hint: "switch (変数) { case 値: ... break; } の形で書きます。",
    answer:
`const day = 3;
switch (day) {
    case 1: console.log("月曜"); break;
    case 2: console.log("火曜"); break;
    case 3: console.log("水曜"); break;
    default: console.log("その他");
}`,
    explanation: "switch文は一つの値に対して複数の条件を書けます。break を忘れると次の case も実行されます。"
  },
  {
    id: 10, unit: "UNIT 02  ◆  演算と条件分岐", rank: "BRONZE",
    title: "論理演算子",
    question: "age = 20 として、18以上かつ65未満なら「現役世代」、それ以外なら「対象外」と出力してください。",
    hint: "&& は「かつ」、|| は「または」、! は「でない」です。",
    answer:
`const age = 20;
if (age >= 18 && age < 65) {
    console.log("現役世代");
} else {
    console.log("対象外");
}`,
    explanation: "&& は両方 true のとき true、|| はどちらか true のとき true です。"
  },

  // UNIT 03
  {
    id: 11, unit: "UNIT 03  ◆  ループ", rank: "ROOKIE",
    title: "for ループ",
    question: "1 から 10 までの数を1行ずつ出力してください。",
    hint: "for (let i = 1; i <= 10; i++) の形で書きます。",
    answer:
`for (let i = 1; i <= 10; i++) {
    console.log(i);
}`,
    explanation: "for文は 初期化; 条件; 更新 の3つの部分で構成されます。i++ は i = i + 1 の省略形です。"
  },
  {
    id: 12, unit: "UNIT 03  ◆  ループ", rank: "BRONZE",
    title: "while ループ",
    question: "1 から始めて 2 倍ずつ増やし、100 を超えるまで値を出力してください。",
    hint: "while (n <= 100) の形で書きます。",
    answer:
`let n = 1;
while (n <= 100) {
    console.log(n);
    n *= 2;
}`,
    explanation: "while文は条件が true の間繰り返します。n *= 2 は n = n * 2 の省略形です。"
  },
  {
    id: 13, unit: "UNIT 03  ◆  ループ", rank: "BRONZE",
    title: "break と continue",
    question: "1 から 20 までループして、3の倍数はスキップし、13 に達したらループを終了し、それ以外は出力してください。",
    hint: "3の倍数は continue、13は break を使います。",
    answer:
`for (let i = 1; i <= 20; i++) {
    if (i === 13) break;
    if (i % 3 === 0) continue;
    console.log(i);
}`,
    explanation: "break はループを即終了、continue は今回の処理をスキップして次へ進みます。"
  },
  {
    id: 14, unit: "UNIT 03  ◆  ループ", rank: "BRONZE",
    title: "for...of",
    question: "fruits = [\"apple\", \"banana\", \"cherry\"] を for...of で繰り返し、各要素を出力してください。",
    hint: "for (const item of 配列) { } の形で書きます。",
    answer:
`const fruits = ["apple", "banana", "cherry"];
for (const fruit of fruits) {
    console.log(fruit);
}`,
    explanation: "for...of は配列などのイテラブルを要素ごとに繰り返します。インデックスが不要な場合に便利です。"
  },
  {
    id: 15, unit: "UNIT 03  ◆  ループ", rank: "SILVER",
    title: "forEach メソッド",
    question: "numbers = [1, 2, 3, 4, 5] の各要素の2乗を forEach を使って出力してください。",
    hint: "配列.forEach(n => { }) の形で書きます。",
    answer:
`const numbers = [1, 2, 3, 4, 5];
numbers.forEach(n => {
    console.log(n ** 2);
});`,
    explanation: "forEach はコールバック関数を各要素に対して呼び出します。アロー関数 => を使うとシンプルに書けます。"
  },

  // UNIT 04
  {
    id: 16, unit: "UNIT 04  ◆  関数", rank: "BRONZE",
    title: "関数定義",
    question: "2つの数を受け取り合計を返す関数 add を定義して、add(3, 7) の結果を出力してください。",
    hint: "function 関数名(引数) { return 値; } の形で定義します。",
    answer:
`function add(a, b) {
    return a + b;
}
console.log(add(3, 7));`,
    explanation: "function キーワードで関数を定義します。return で値を返します。定義した関数は何度でも呼び出せます。"
  },
  {
    id: 17, unit: "UNIT 04  ◆  関数", rank: "BRONZE",
    title: "アロー関数",
    question: "2つの数を受け取り大きい方を返す関数 max をアロー関数で定義して、max(4, 9) の結果を出力してください。",
    hint: "const 関数名 = (a, b) => 式 と書けます。",
    answer:
`const max = (a, b) => a > b ? a : b;
console.log(max(4, 9));`,
    explanation: "アロー関数は => を使った短い関数定義です。本体が1行の式なら {} と return を省略できます。"
  },
  {
    id: 18, unit: "UNIT 04  ◆  関数", rank: "SILVER",
    title: "デフォルト引数",
    question: "名前を受け取り「こんにちは、〇〇！」と返す greet 関数を作り、引数なしのとき「ゲスト」になるようにしてください。",
    hint: "function greet(name = \"ゲスト\") の形でデフォルト値を設定できます。",
    answer:
`function greet(name = "ゲスト") {
    return "こんにちは、" + name + "！";
}
console.log(greet("Taro"));
console.log(greet());`,
    explanation: "デフォルト引数は引数が渡されなかった場合に使われる値です。= で指定します。"
  },
  {
    id: 19, unit: "UNIT 04  ◆  関数", rank: "SILVER",
    title: "レスト引数（...）",
    question: "任意の数の引数をすべて合計する sum 関数を作り、sum(1, 2, 3, 4, 5) の結果を出力してください。",
    hint: "function sum(...args) で可変長引数を配列として受け取れます。",
    answer:
`function sum(...args) {
    return args.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4, 5));`,
    explanation: "...args（レスト引数）で任意の数の引数を配列として受け取れます。reduce() で合計を求めています。"
  },
  {
    id: 20, unit: "UNIT 04  ◆  関数", rank: "GOLD",
    title: "クロージャ",
    question: "makeCounter() を呼ぶと呼ぶたびに1ずつ増えるカウント関数を返す関数を作り、counter() を3回呼んで出力してください。",
    hint: "関数の中で変数を持ち、それを参照する関数を return します。",
    answer:
`function makeCounter() {
    let count = 0;
    return function() {
        count++;
        return count;
    };
}
const counter = makeCounter();
console.log(counter());
console.log(counter());
console.log(counter());`,
    explanation: "クロージャは外側の関数の変数を参照し続ける関数です。count は外からアクセスできませんが、返された関数からは参照できます。"
  },

  // UNIT 05
  {
    id: 21, unit: "UNIT 05  ◆  配列とオブジェクト", rank: "BRONZE",
    title: "配列の基本操作",
    question: "[10, 20, 30] を作り push で 40 を追加、先頭要素・末尾要素・長さを出力してください。",
    hint: "push() で末尾に追加、[0] で先頭、[length-1] で末尾を取得できます。",
    answer:
`const nums = [10, 20, 30];
nums.push(40);
console.log(nums[0]);
console.log(nums[nums.length - 1]);
console.log(nums.length);`,
    explanation: "配列は [] で作ります。push() は末尾に追加。length プロパティで要素数を取得できます。"
  },
  {
    id: 22, unit: "UNIT 05  ◆  配列とオブジェクト", rank: "SILVER",
    title: "map と filter",
    question: "[1, 2, 3, 4, 5] から偶数だけ取り出し、それぞれを2乗した配列を作って出力してください。",
    hint: "filter() で条件を満たす要素を取り出し、map() で変換します。",
    answer:
`const nums = [1, 2, 3, 4, 5];
const result = nums.filter(n => n % 2 === 0).map(n => n ** 2);
console.log(result);`,
    explanation: "filter() は条件が true の要素だけを残した新配列を返します。map() は各要素を変換した新配列を返します。"
  },
  {
    id: 23, unit: "UNIT 05  ◆  配列とオブジェクト", rank: "BRONZE",
    title: "オブジェクトの基本",
    question: "name, age, language プロパティを持つオブジェクト person を作り、各プロパティを出力してください。",
    hint: "const obj = { キー: 値 } の形で作ります。obj.キー でアクセスできます。",
    answer:
`const person = {
    name: "Taro",
    age: 20,
    language: "JavaScript"
};
console.log(person.name);
console.log(person.age);
console.log(person.language);`,
    explanation: "オブジェクトはキーと値のペアを持つデータ構造です。ドット記法 obj.key でアクセスできます。"
  },
  {
    id: 24, unit: "UNIT 05  ◆  配列とオブジェクト", rank: "SILVER",
    title: "分割代入",
    question: "{ name: \"Taro\", age: 20, city: \"Tokyo\" } から name と city だけ分割代入で取り出して出力してください。",
    hint: "const { キー1, キー2 } = オブジェクト の形で書きます。",
    answer:
`const person = { name: "Taro", age: 20, city: "Tokyo" };
const { name, city } = person;
console.log(name);
console.log(city);`,
    explanation: "分割代入はオブジェクトや配列から複数の値を一度に取り出せます。"
  },
  {
    id: 25, unit: "UNIT 05  ◆  配列とオブジェクト", rank: "SILVER",
    title: "スプレッド構文",
    question: "[1, 2, 3] と [4, 5, 6] をスプレッド構文で結合した配列を作り出力してください。",
    hint: "[...配列1, ...配列2] の形で展開して結合できます。",
    answer:
`const a = [1, 2, 3];
const b = [4, 5, 6];
const combined = [...a, ...b];
console.log(combined);`,
    explanation: "スプレッド構文 ... は配列やオブジェクトを展開します。配列の結合・コピーなどに使います。"
  },

  // UNIT 06
  {
    id: 26, unit: "UNIT 06  ◆  クラスとエラー処理", rank: "SILVER",
    title: "クラスの定義",
    question: "name と age を持つ Person クラスを定義し、「Taroは20歳です」と出力する greet() メソッドを追加してください。",
    hint: "class Person { constructor(name, age) { } greet() { } } の形で定義します。",
    answer:
`class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    greet() {
        console.log(this.name + "は" + this.age + "歳です");
    }
}
const p = new Person("Taro", 20);
p.greet();`,
    explanation: "class で設計図を定義します。constructor は new で呼ばれる初期化メソッドです。this はインスタンス自身を指します。"
  },
  {
    id: 27, unit: "UNIT 06  ◆  クラスとエラー処理", rank: "GOLD",
    title: "クラスの継承",
    question: "Person クラスを継承した Student クラスを作り、grade プロパティを追加して「Taro (20歳) - 3年生」と出力してください。",
    hint: "class Student extends Person { constructor() { super(); } } の形で継承します。",
    answer:
`class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
class Student extends Person {
    constructor(name, age, grade) {
        super(name, age);
        this.grade = grade;
    }
    greet() {
        console.log(this.name + " (" + this.age + "歳) - " + this.grade + "年生");
    }
}
const s = new Student("Taro", 20, 3);
s.greet();`,
    explanation: "extends で継承します。super() は親クラスのコンストラクタを呼び出します。"
  },
  {
    id: 28, unit: "UNIT 06  ◆  クラスとエラー処理", rank: "GOLD",
    title: "try / catch",
    question: "0 で割ったときに「エラー: 0で割れません」と出力する divide 関数を作り、divide(10, 0) を呼んでください。",
    hint: "throw new Error('メッセージ') でエラーを投げ、try { } catch (e) { } でキャッチします。",
    answer:
`function divide(a, b) {
    if (b === 0) throw new Error("0で割れません");
    return a / b;
}
try {
    console.log(divide(10, 0));
} catch (e) {
    console.log("エラー: " + e.message);
}`,
    explanation: "throw でエラーを発生させ、try...catch でキャッチします。e.message でエラーメッセージを取得できます。"
  },
  {
    id: 29, unit: "UNIT 06  ◆  クラスとエラー処理", rank: "GOLD",
    title: "配列の reduce",
    question: "[85, 92, 78, 96, 88] の合計・平均・最大値を reduce と Math.max を使って求めて出力してください。",
    hint: "reduce((acc, n) => acc + n, 0) で合計、Math.max(...配列) で最大値を求めます。",
    answer:
`const scores = [85, 92, 78, 96, 88];
const sum = scores.reduce((acc, n) => acc + n, 0);
const avg = sum / scores.length;
const max = Math.max(...scores);
console.log("合計: " + sum);
console.log("平均: " + avg);
console.log("最大: " + max);`,
    explanation: "reduce() は配列を一つの値にまとめます。Math.max(...配列) はスプレッド構文で配列を展開して最大値を求めます。"
  },
  {
    id: 30, unit: "UNIT 06  ◆  クラスとエラー処理", rank: "PLATINUM",
    title: "実践：成績管理クラス",
    question: "名前と点数配列を受け取る GradeBook クラスを作り、average() で平均点、max() で最高点を返すメソッドを実装してください。",
    hint: "reduce() で合計、Math.max(...this.scores) で最高点を求めます。",
    answer:
`class GradeBook {
    constructor(name, scores) {
        this.name = name;
        this.scores = scores;
    }
    average() {
        const sum = this.scores.reduce((acc, s) => acc + s, 0);
        return sum / this.scores.length;
    }
    max() {
        return Math.max(...this.scores);
    }
}
const gb = new GradeBook("Taro", [85, 92, 78, 96, 88]);
console.log(gb.average());
console.log(gb.max());`,
    explanation: "reduce() で合計を求め配列長で割って平均を計算します。Math.max(...配列) でスプレッド構文を使い最高点を求めます。"
  },

  // ───────────── LEGEND: 超難問チャレンジ ─────────────
  {
    id: 31, unit: "LEGEND  ◆  超難問チャレンジ", rank: "LEGEND",
    title: "ProxyとReflectでプロパティ監視",
    question: "ES6の Proxy と Reflect を使って、プロパティの get アクセスを自動的にログするオブジェクトを作成してください。obj.name = \"Alice\"; obj.age = 20; と設定した後、obj.name と obj.age にアクセスしたとき「GET: name」「GET: age」の順で出力されるようにしてください（set時は出力不要）。",
    hint: "new Proxy(target, handler) でhandlerの get トラップを定義します。get(target, prop) の中で console.log し、Reflect.get(target, prop) で元の値を返します。setトラップも定義して Reflect.set() を返します。",
    answer:
`const handler = {
    get(target, prop) {
        console.log(\`GET: \${prop}\`);
        return Reflect.get(target, prop);
    },
    set(target, prop, value) {
        return Reflect.set(target, prop, value);
    }
};

const obj = new Proxy({}, handler);
obj.name = "Alice";
obj.age = 20;
obj.name;
obj.age;`,
    expected: "GET: name\nGET: age",
    explanation: "Proxy はオブジェクトの操作に割り込むラッパーです。get トラップはプロパティ読み取り時、set トラップは書き込み時に呼ばれます。Reflect は Proxy トラップのデフォルト動作を提供するユーティリティです。この組み合わせで変更追跡・バリデーション・ログ記録が実装できます。"
  }
];

// ===== JavaScript ミッションデータ =====

const javascriptMissions = [
  {
    id: 1, rank: "ROOKIE",
    title: "BMI計算ツール",
    description: "身長(cm)と体重(kg)からBMIを計算し、判定を表示するプログラムを作ってください。",
    requirements: [
      "BMI = 体重(kg) ÷ (身長(m))²",
      "toFixed(2) で小数点2桁表示",
      "18.5未満→「痩せ」、25未満→「普通」、25以上→「肥満」"
    ],
    sampleIO: `height = 170, weight = 65\nBMI: 22.49\n普通`,
    hint: "身長をcmからmに変換（÷100）してから計算します。",
    answer:
`const height = 170;
const weight = 65;
const h = height / 100;
const bmi = weight / (h * h);
console.log("BMI: " + bmi.toFixed(2));
if (bmi < 18.5) console.log("痩せ");
else if (bmi < 25) console.log("普通");
else console.log("肥満");`
  },
  {
    id: 2, rank: "ROOKIE",
    title: "FizzBuzz",
    description: "1から100まで出力。3の倍数はFizz、5の倍数はBuzz、両方はFizzBuzz。",
    requirements: [
      "1〜100のループ",
      "15の倍数→FizzBuzz（先に判定）",
      "3の倍数→Fizz",
      "5の倍数→Buzz"
    ],
    sampleIO: `1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n...`,
    hint: "15の倍数の判定を先に行ってください。",
    answer:
`for (let i = 1; i <= 100; i++) {
    if (i % 15 === 0) console.log("FizzBuzz");
    else if (i % 3 === 0) console.log("Fizz");
    else if (i % 5 === 0) console.log("Buzz");
    else console.log(i);
}`
  },
  {
    id: 3, rank: "BRONZE",
    title: "配列の統計計算",
    description: "数値配列から合計・平均・最大・最小を求めるプログラムを作ってください。",
    requirements: [
      "合計を求める（reduce使用）",
      "平均を小数点2桁で表示",
      "最大値・最小値を求める（Math.max/min使用）"
    ],
    sampleIO: `合計: 397\n平均: 39.70\n最大: 89\n最小: 7`,
    hint: "reduce() で合計、Math.max(...arr) で最大値を求めます。",
    answer:
`const nums = [15, 42, 7, 89, 23, 56, 34, 71, 12, 48];
const sum = nums.reduce((acc, n) => acc + n, 0);
const avg = sum / nums.length;
console.log("合計: " + sum);
console.log("平均: " + avg.toFixed(2));
console.log("最大: " + Math.max(...nums));
console.log("最小: " + Math.min(...nums));`
  },
  {
    id: 4, rank: "BRONZE",
    title: "シンプルToDoリスト",
    description: "配列でタスクを管理する関数群を実装してください。",
    requirements: [
      "add(task) でタスクを追加",
      "remove(task) でタスクを削除",
      "list() で番号付き一覧を表示"
    ],
    sampleIO: `1. 買い物\n2. 勉強\n3. 運動\n--- 削除後 ---\n1. 買い物\n2. 運動`,
    hint: "push() で追加、indexOf() と splice() で削除します。",
    answer:
`const todos = [];
function add(task) { todos.push(task); }
function remove(task) {
    const idx = todos.indexOf(task);
    if (idx !== -1) todos.splice(idx, 1);
}
function list() {
    todos.forEach((t, i) => console.log((i + 1) + ". " + t));
}
add("買い物"); add("勉強"); add("運動");
list();
remove("勉強");
console.log("--- 削除後 ---");
list();`
  },
  {
    id: 5, rank: "SILVER",
    title: "Counterクラス",
    description: "カウンターオブジェクトをクラスで実装してください。",
    requirements: [
      "increment() で+1",
      "decrement() で-1",
      "reset() で0に戻す",
      "getCount() で現在値を返す"
    ],
    sampleIO: `3\n2\n0`,
    hint: "コンストラクタで count = 0 を初期化します。",
    answer:
`class Counter {
    constructor() { this.count = 0; }
    increment() { this.count++; }
    decrement() { this.count--; }
    reset() { this.count = 0; }
    getCount() { return this.count; }
}
const c = new Counter();
c.increment(); c.increment(); c.increment();
console.log(c.getCount());
c.decrement();
console.log(c.getCount());
c.reset();
console.log(c.getCount());`
  },
  {
    id: 6, rank: "GOLD",
    title: "テキスト解析",
    description: "文章の単語数・最長単語・最頻出単語を求めるプログラムを作ってください。",
    requirements: [
      "単語数を数える",
      "最も長い単語を見つける",
      "最も多く出現する単語を見つける"
    ],
    sampleIO: `単語数: 10\n最長: jumps\n最頻出: the (3回)`,
    hint: "split(' ') で単語分割、reduce でオブジェクト集計します。",
    answer:
`const text = "the quick brown fox jumps over the lazy dog the fox";
const words = text.split(" ");
console.log("単語数: " + words.length);
const longest = words.reduce((a, b) => a.length >= b.length ? a : b);
console.log("最長: " + longest);
const freq = words.reduce((acc, w) => {
    acc[w] = (acc[w] || 0) + 1;
    return acc;
}, {});
const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
console.log("最頻出: " + top[0] + " (" + top[1] + "回)");`
  }
];

// ===== JavaScript 単元ガイドデータ =====

const javascriptUnitGuides = [
  {
    id: "js-unit01",
    unit: "UNIT 01", title: "基礎・出力",
    summary: "console.log()で出力し、let/constで変数を扱う。テンプレートリテラルで文字列を組み立てる。",
    points: [
      "console.log() で画面に出力",
      "const は再代入不可、let は再代入可能",
      "テンプレートリテラル: バッククォート + ${} で変数を埋め込む",
      "typeof で型を確認できる"
    ],
    words: [
      { term: "console.log()", desc: "コンソールに値を出力する関数" },
      { term: "const", desc: "再代入できない定数を宣言するキーワード" },
      { term: "let", desc: "再代入できる変数を宣言するキーワード" },
      { term: "テンプレートリテラル", desc: "バッククォートで囲み ${} で変数を埋め込める文字列" }
    ]
  },
  {
    id: "js-unit02",
    unit: "UNIT 02", title: "演算と条件分岐",
    summary: "算術演算子と比較演算子を使い、if/else・switch・三項演算子で条件分岐を行う。",
    points: [
      "=== は厳密等価（型も一致）。== より === を使うのが原則",
      "三項演算子: 条件 ? trueの値 : falseの値",
      "switch文: 一つの変数に対して複数の値を比較",
      "&&, ||, ! で論理演算"
    ],
    words: [
      { term: "===", desc: "値と型が両方一致するか比較する厳密等価演算子" },
      { term: "三項演算子", desc: "条件 ? A : B の形で1行のif-else" },
      { term: "switch", desc: "一つの変数に対して複数の値を比較する構文" },
      { term: "&&", desc: "論理AND。両方trueのときtrue" }
    ]
  },
  {
    id: "js-unit03",
    unit: "UNIT 03", title: "ループ",
    summary: "for・while・for...of・forEachで繰り返し処理を行う。",
    points: [
      "for (let i = 0; i < n; i++) が基本のカウンタループ",
      "for...of で配列の各要素を順番に取り出す",
      "forEach() はコールバックを各要素に適用",
      "break でループ終了、continue で次へスキップ"
    ],
    words: [
      { term: "for...of", desc: "配列などのイテラブルを要素ごとに繰り返す構文" },
      { term: "forEach()", desc: "配列の各要素にコールバック関数を実行するメソッド" },
      { term: "break", desc: "ループを即座に終了させる命令" },
      { term: "continue", desc: "今の繰り返しをスキップして次に進む命令" }
    ]
  },
  {
    id: "js-unit04",
    unit: "UNIT 04", title: "関数",
    summary: "functionとアロー関数で関数を定義。デフォルト引数・レスト引数・クロージャを学ぶ。",
    points: [
      "function キーワードで通常の関数を定義",
      "アロー関数 => で短く書ける。1行なら {} と return 省略可",
      "デフォルト引数: function f(x = 0) で省略時の値を設定",
      "クロージャ: 外の変数を記憶し続ける関数"
    ],
    words: [
      { term: "アロー関数", desc: "=> を使った短い関数の書き方。(a, b) => a + b など" },
      { term: "デフォルト引数", desc: "関数の引数に省略時のデフォルト値を設定する機能" },
      { term: "レスト引数", desc: "...args で可変長の引数を配列として受け取る機能" },
      { term: "クロージャ", desc: "外側の関数の変数を参照し続ける内側の関数" }
    ]
  },
  {
    id: "js-unit05",
    unit: "UNIT 05", title: "配列とオブジェクト",
    summary: "配列メソッド(map/filter/reduce)とオブジェクト操作、分割代入・スプレッド構文を学ぶ。",
    points: [
      "map(): 各要素を変換した新配列を返す",
      "filter(): 条件を満たす要素だけの新配列を返す",
      "reduce(): 配列を一つの値にまとめる",
      "分割代入: const { name } = obj でプロパティを取り出す"
    ],
    words: [
      { term: "map()", desc: "配列の各要素を変換した新配列を返すメソッド" },
      { term: "filter()", desc: "条件に合う要素だけを残した新配列を返すメソッド" },
      { term: "reduce()", desc: "配列を一つの値（合計など）にまとめるメソッド" },
      { term: "分割代入", desc: "オブジェクトや配列から値を取り出す簡潔な構文" }
    ]
  },
  {
    id: "js-unit06",
    unit: "UNIT 06", title: "クラスとエラー処理",
    summary: "classでオブジェクト指向プログラミング、try/catchでエラー処理を学ぶ。",
    points: [
      "class と constructor でオブジェクトの設計図を作る",
      "extends で継承、super() で親クラスのコンストラクタを呼ぶ",
      "try/catch でエラーをキャッチして安全に処理",
      "throw new Error() でエラーを意図的に発生させる"
    ],
    words: [
      { term: "class", desc: "オブジェクトの設計図（ひな型）を定義するキーワード" },
      { term: "extends", desc: "クラスを継承するキーワード。親のプロパティとメソッドを引き継ぐ" },
      { term: "try/catch", desc: "エラーが起きそうなコードをtryで囲み、catchで処理する構文" },
      { term: "throw", desc: "エラーを意図的に発生させる命令" }
    ]
  }
];

// ===== Ruby データ =====

const rubyProblems = [
  // UNIT 01 基礎出力 ROOKIE
  { id:1, unit:"UNIT 01  ◆  基礎出力", rank:"ROOKIE",
    title:"Hello World",
    question:"「Hello, World!」と画面に出力するプログラムを書いてください。",
    hint:"puts メソッドを使って出力します。",
    answer:`puts "Hello, World!"`,
    expected:"Hello, World!",
    explanation:"puts はRubyの基本的な出力メソッドです。文字列の末尾に自動で改行が追加されます。"
  },
  { id:2, unit:"UNIT 01  ◆  基礎出力", rank:"ROOKIE",
    title:"コメントの書き方",
    question:"# を使った1行コメントと =begin =end を使った複数行コメントを含むプログラムを書き「Hello」と出力してください。",
    hint:"# は1行コメント、=begin ～ =end は複数行コメントです。",
    answer:
`# これは1行コメントです
=begin
これは
複数行コメントです
=end
puts "Hello"`,
    explanation:"# より右はコメントとして無視されます。=begin から =end で囲む部分は複数行コメントになります。"
  },
  { id:3, unit:"UNIT 01  ◆  基礎出力", rank:"ROOKIE",
    title:"変数と出力",
    question:"変数 name に \"Ruby\" を、version に 3 を代入して、それぞれ puts で出力してください。",
    hint:"Rubyでは変数宣言に var や let は不要です。直接代入できます。",
    answer:
`name = "Ruby"
version = 3
puts name
puts version`,
    expected:"Ruby\n3",
    explanation:"Rubyは動的型付け言語です。変数宣言なしに直接代入できます。puts は末尾に改行を追加します。"
  },
  // UNIT 02 変数と演算 BRONZE
  { id:4, unit:"UNIT 02  ◆  変数と演算", rank:"BRONZE",
    title:"文字列補完",
    question:"name に \"Ruby\" を代入して、\"Hello, Ruby!\" と出力してください。文字列補完（#{}）を使うこと。",
    hint:"\"#{変数名}\" の形で変数を文字列に埋め込めます。",
    answer:
`name = "Ruby"
puts "Hello, #{name}!"`,
    expected:"Hello, Ruby!",
    explanation:"#{ } を使うと文字列の中に式や変数を埋め込めます。ダブルクォートの中でのみ使えます。"
  },
  { id:5, unit:"UNIT 02  ◆  変数と演算", rank:"BRONZE",
    title:"四則演算",
    question:"a = 10, b = 3 として、足し算・引き算・掛け算・割り算・余りをそれぞれ puts で出力してください。",
    hint:"演算子は +、-、*、/、% です。整数同士の / は整数除算になります。",
    answer:
`a = 10
b = 3
puts a + b
puts a - b
puts a * b
puts a / b
puts a % b`,
    expected:"13\n7\n30\n3\n1",
    explanation:"Rubyの整数同士の / は整数除算です。10 / 3 は 3 になります。小数にしたい場合は 10.0 / 3 とします。"
  },
  { id:6, unit:"UNIT 02  ◆  変数と演算", rank:"BRONZE",
    title:"文字列メソッド",
    question:"\"hello world\" を大文字にして出力し、次に文字数を出力してください。",
    hint:"upcase と length メソッドを使います。",
    answer:
`str = "hello world"
puts str.upcase
puts str.length`,
    expected:"HELLO WORLD\n11",
    explanation:"Rubyの文字列はメソッドが豊富です。upcase で大文字変換、length で文字数取得ができます。"
  },
  { id:7, unit:"UNIT 02  ◆  変数と演算", rank:"BRONZE",
    title:"型変換",
    question:"文字列 \"42\" を整数に変換して 8 を足し、結果を出力してください。",
    hint:"to_i メソッドで文字列を整数に変換できます。",
    answer:
`num = "42".to_i
puts num + 8`,
    expected:"50",
    explanation:"to_i は文字列を整数（Integer）に変換します。to_f は浮動小数点数、to_s は文字列への変換です。"
  },
  { id:8, unit:"UNIT 02  ◆  変数と演算", rank:"BRONZE",
    title:"条件分岐 if/else",
    question:"x = 15 として、x が 10 より大きければ \"big\"、そうでなければ \"small\" と出力してください。",
    hint:"if 条件 ～ else ～ end の形で書きます。",
    answer:
`x = 15
if x > 10
  puts "big"
else
  puts "small"
end`,
    expected:"big",
    explanation:"Rubyの if 文は end で閉じます。条件が真なら if ブロック、偽なら else ブロックが実行されます。"
  },
  // UNIT 03 制御フロー SILVER
  { id:9, unit:"UNIT 03  ◆  制御フロー", rank:"SILVER",
    title:"elsif と case",
    question:"score = 75 として、80以上なら \"A\"、60以上なら \"B\"、それ以外は \"C\" と出力してください。",
    hint:"elsif を使って複数条件を処理します。",
    answer:
`score = 75
if score >= 80
  puts "A"
elsif score >= 60
  puts "B"
else
  puts "C"
end`,
    expected:"B",
    explanation:"elsif で追加の条件を並べられます。Rubyには unless（if の逆）もあり、条件が偽のときに実行します。"
  },
  { id:10, unit:"UNIT 03  ◆  制御フロー", rank:"SILVER",
    title:"case/when",
    question:"day = \"Mon\" として、\"Mon\" なら \"Monday\"、\"Tue\" なら \"Tuesday\"、それ以外は \"Other\" と出力してください。",
    hint:"case ～ when ～ else ～ end の形で書きます。",
    answer:
`day = "Mon"
case day
when "Mon"
  puts "Monday"
when "Tue"
  puts "Tuesday"
else
  puts "Other"
end`,
    expected:"Monday",
    explanation:"case/when は複数の値を比較するときに便利です。C++のswitch文に相当しますが、より柔軟です。"
  },
  { id:11, unit:"UNIT 03  ◆  制御フロー", rank:"SILVER",
    title:"while ループ",
    question:"while を使って 0 から 4 まで順に出力してください。",
    hint:"while 条件 ～ end の形で書きます。",
    answer:
`i = 0
while i < 5
  puts i
  i += 1
end`,
    expected:"0\n1\n2\n3\n4",
    explanation:"while は条件が真の間繰り返します。Rubyには ++ 演算子がないので += 1 を使います。"
  },
  { id:12, unit:"UNIT 03  ◆  制御フロー", rank:"SILVER",
    title:"times メソッド",
    question:"3.times を使って \"Hello\" を3回出力してください。",
    hint:"整数.times { } の形で使います。",
    answer:
`3.times { puts "Hello" }`,
    expected:"Hello\nHello\nHello",
    explanation:"times はRuby独特のループです。3.times は0,1,2の3回ブロックを実行します。{ } がブロックです。"
  },
  { id:13, unit:"UNIT 03  ◆  制御フロー", rank:"SILVER",
    title:"each メソッド",
    question:"配列 [10, 20, 30] の各要素を each で順番に出力してください。",
    hint:"配列.each { |変数| 処理 } の形で書きます。",
    answer:
`[10, 20, 30].each { |n| puts n }`,
    expected:"10\n20\n30",
    explanation:"each は配列の各要素に対してブロックを実行します。| | の中の変数にブロック変数に各要素が入ります。"
  },
  // UNIT 04 メソッド SILVER/GOLD
  { id:14, unit:"UNIT 04  ◆  メソッド", rank:"SILVER",
    title:"メソッドの定義",
    question:"名前を受け取って \"Hello, [名前]!\" と出力する greet メソッドを定義して、\"Ruby\" で呼び出してください。",
    hint:"def メソッド名(引数) ～ end で定義します。",
    answer:
`def greet(name)
  puts "Hello, #{name}!"
end
greet("Ruby")`,
    expected:"Hello, Ruby!",
    explanation:"Rubyのメソッドは def ～ end で定義します。return を書かなくても最後の式の値が自動的に返されます。"
  },
  { id:15, unit:"UNIT 04  ◆  メソッド", rank:"GOLD",
    title:"戻り値",
    question:"2つの整数を受け取って足し算の結果を返す add メソッドを定義し、add(3, 4) の結果を出力してください。",
    hint:"最後の式が自動的に戻り値になります。",
    answer:
`def add(a, b)
  a + b
end
puts add(3, 4)`,
    expected:"7",
    explanation:"Rubyでは最後に評価した式が自動的に戻り値になります。明示的に return を書くこともできます。"
  },
  { id:16, unit:"UNIT 04  ◆  メソッド", rank:"GOLD",
    title:"デフォルト引数",
    question:"greet メソッドを引数なしで呼ぶと \"Hello, World!\"、\"Ruby\" を渡すと \"Hello, Ruby!\" と出力されるように実装してください。",
    hint:"def greet(name = \"World\") のようにデフォルト値を設定できます。",
    answer:
`def greet(name = "World")
  puts "Hello, #{name}!"
end
greet
greet("Ruby")`,
    expected:"Hello, World!\nHello, Ruby!",
    explanation:"引数にデフォルト値を設定すると、省略したときにその値が使われます。"
  },
  { id:17, unit:"UNIT 04  ◆  メソッド", rank:"GOLD",
    title:"可変長引数",
    question:"任意の数の整数を受け取って合計を返す sum メソッドを定義し、sum(1,2,3,4,5) の結果を出力してください。",
    hint:"*args で可変長引数を受け取れます。",
    answer:
`def sum(*numbers)
  numbers.sum
end
puts sum(1, 2, 3, 4, 5)`,
    expected:"15",
    explanation:"* をつけた引数は可変長引数で、複数の値を配列として受け取ります。配列には sum メソッドがあります。"
  },
  // UNIT 05 配列とイテレータ GOLD/PLATINUM
  { id:18, unit:"UNIT 05  ◆  配列とイテレータ", rank:"GOLD",
    title:"配列の基本操作",
    question:"[3, 1, 4, 1, 5, 9] を昇順にソートして出力し、要素数も出力してください。",
    hint:"sort と length メソッドを使います。",
    answer:
`nums = [3, 1, 4, 1, 5, 9]
puts nums.sort.inspect
puts nums.length`,
    expected:"[1, 1, 3, 4, 5, 9]\n6",
    explanation:"sort は並び替えた新しい配列を返します。inspect は配列を見やすい文字列形式に変換します。"
  },
  { id:19, unit:"UNIT 05  ◆  配列とイテレータ", rank:"GOLD",
    title:"map メソッド",
    question:"[1, 2, 3, 4, 5] の各要素を2倍にした配列を map で作り、出力してください。",
    hint:"配列.map { |x| 変換式 } の形で書きます。",
    answer:
`nums = [1, 2, 3, 4, 5]
puts nums.map { |n| n * 2 }.inspect`,
    expected:"[2, 4, 6, 8, 10]",
    explanation:"map は各要素を変換して新しい配列を作ります。元の配列は変更されません。"
  },
  { id:20, unit:"UNIT 05  ◆  配列とイテレータ", rank:"PLATINUM",
    title:"select と inject",
    question:"[1, 2, 3, 4, 5, 6] から偶数だけを select で取り出した配列を出力してください。",
    hint:"select { |x| 条件 } で条件に合う要素だけを取り出せます。even? メソッドを使います。",
    answer:
`nums = [1, 2, 3, 4, 5, 6]
puts nums.select { |n| n.even? }.inspect`,
    expected:"[2, 4, 6]",
    explanation:"select は条件がtrueの要素だけを集めた配列を返します。even? は偶数かどうかを判定するメソッドです。"
  },
  // UNIT 06 ハッシュ PLATINUM
  { id:21, unit:"UNIT 06  ◆  ハッシュ", rank:"PLATINUM",
    title:"ハッシュの基本",
    question:"person = { name: \"Taro\", age: 20 } というハッシュを作り、name と age を出力してください。",
    hint:"シンボルキーには [:キー名] でアクセスします。",
    answer:
`person = { name: "Taro", age: 20 }
puts person[:name]
puts person[:age]`,
    expected:"Taro\n20",
    explanation:"ハッシュはキーと値のペアを格納します。シンボル（: で始まる）をキーにすると効率的です。"
  },
  { id:22, unit:"UNIT 06  ◆  ハッシュ", rank:"PLATINUM",
    title:"ハッシュの操作",
    question:"scores = { math: 80, english: 90 } に science: 75 を追加して、全キーと全値を出力してください。",
    hint:"keys と values メソッドを使います。",
    answer:
`scores = { math: 80, english: 90 }
scores[:science] = 75
puts scores.keys.inspect
puts scores.values.inspect`,
    expected:"[:math, :english, :science]\n[80, 90, 75]",
    explanation:"ハッシュへの追加は hash[key] = value で行います。keys は全キー、values は全値の配列を返します。"
  },
  { id:23, unit:"UNIT 06  ◆  ハッシュ", rank:"PLATINUM",
    title:"inject で集計",
    question:"[1, 2, 3, 4, 5] の合計を inject を使って計算し出力してください。",
    hint:"inject(初期値) { |合計, 要素| 演算 } の形で書きます。",
    answer:
`nums = [1, 2, 3, 4, 5]
total = nums.inject(0) { |sum, n| sum + n }
puts total`,
    expected:"15",
    explanation:"inject（別名 reduce）は畳み込み演算です。初期値から始めて各要素を累積していきます。"
  },
  // UNIT 07 クラスとオブジェクト DIAMOND
  { id:24, unit:"UNIT 07  ◆  クラスとオブジェクト", rank:"DIAMOND",
    title:"クラスの定義",
    question:"Animal クラスを定義してください。initialize で name を受け取り、speak メソッドで \"[name] says hello\" と出力します。Animal.new(\"Dog\").speak を呼び出してください。",
    hint:"class ～ end でクラスを定義し、@name でインスタンス変数を使います。",
    answer:
`class Animal
  def initialize(name)
    @name = name
  end
  def speak
    puts "#{@name} says hello"
  end
end
Animal.new("Dog").speak`,
    expected:"Dog says hello",
    explanation:"initialize はコンストラクタです。@ で始まる変数はインスタンス変数で、そのオブジェクト内で共有されます。"
  },
  { id:25, unit:"UNIT 07  ◆  クラスとオブジェクト", rank:"DIAMOND",
    title:"継承",
    question:"Animal クラスを継承した Dog クラスを作り、speak で \"[name]: Woof!\" と出力してください。Dog.new(\"Rex\").speak を呼び出してください。",
    hint:"class Dog < Animal の形で継承します。",
    answer:
`class Animal
  def initialize(name)
    @name = name
  end
end
class Dog < Animal
  def speak
    puts "#{@name}: Woof!"
  end
end
Dog.new("Rex").speak`,
    expected:"Rex: Woof!",
    explanation:"< を使って親クラスを継承します。継承したクラスは親のメソッドやインスタンス変数を使えます。"
  },
  { id:26, unit:"UNIT 07  ◆  クラスとオブジェクト", rank:"DIAMOND",
    title:"attr_accessor",
    question:"Person クラスに name と age の attr_accessor を設定し、p = Person.new(\"Taro\", 20)、p.age = 21 として \"Taro is 21\" と出力してください。",
    hint:"attr_accessor :name, :age でゲッター・セッターを自動生成できます。",
    answer:
`class Person
  attr_accessor :name, :age
  def initialize(name, age)
    @name = name
    @age = age
  end
end
p = Person.new("Taro", 20)
p.age = 21
puts "#{p.name} is #{p.age}"`,
    expected:"Taro is 21",
    explanation:"attr_accessor は読み書き両方のアクセサを自動生成します。attr_reader は読み取り専用、attr_writer は書き込み専用です。"
  },
  { id:27, unit:"UNIT 07  ◆  クラスとオブジェクト", rank:"DIAMOND",
    title:"モジュールとMixin",
    question:"greet メソッド（\"Hello, I'm [name]\" と出力）を持つ Greetable モジュールを作り、Person クラスに include して Person.new(\"Taro\").greet を呼び出してください。",
    hint:"module ～ end でモジュールを定義し、include で取り込みます。",
    answer:
`module Greetable
  def greet
    puts "Hello, I'm #{@name}"
  end
end
class Person
  include Greetable
  def initialize(name)
    @name = name
  end
end
Person.new("Taro").greet`,
    expected:"Hello, I'm Taro",
    explanation:"モジュールはメソッドをまとめる仕組みです。include するとクラスにメソッドが追加されます。これをMixinと呼びます。"
  },
  // UNIT 08 高度なRuby MASTER/LEGEND
  { id:28, unit:"UNIT 08  ◆  高度なRuby", rank:"MASTER",
    title:"例外処理",
    question:"begin ～ rescue ～ end を使って、ゼロ除算エラーを捕捉し \"エラー: 0では割れません\" と出力してください。",
    hint:"rescue ZeroDivisionError => e の形でエラーの種類を指定できます。",
    answer:
`begin
  puts 10 / 0
rescue ZeroDivisionError
  puts "エラー: 0では割れません"
end`,
    expected:"エラー: 0では割れません",
    explanation:"begin ～ rescue で例外を捕捉します。=> e で例外オブジェクトを変数に格納できます。ensure で後処理も書けます。"
  },
  { id:29, unit:"UNIT 08  ◆  高度なRuby", rank:"MASTER",
    title:"Proc と lambda",
    question:"2つの数を受け取って積を返す lambda を定義し、multiply = lambda { |a, b| a * b } として multiply.call(4, 5) の結果を出力してください。",
    hint:"lambda { |引数| 処理 } で定義し、call で呼び出します。",
    answer:
`multiply = lambda { |a, b| a * b }
puts multiply.call(4, 5)`,
    expected:"20",
    explanation:"lambdaはオブジェクトとして扱えるメソッドです。call で呼び出します。Proc も似ていますが引数チェックの厳密さが異なります。"
  },
  { id:30, unit:"UNIT 08  ◆  高度なRuby", rank:"LEGEND",
    title:"メタプログラミング",
    question:"method_missing を使って、未定義メソッド hello_world を呼んだ際に \"Hello, World!\" と出力する DynamicGreeter クラスを作り DynamicGreeter.new.hello_world を呼び出してください。",
    hint:"method_missing(name, *args) でメソッド名を文字列として受け取れます。split と capitalize を使いましょう。",
    answer:
`class DynamicGreeter
  def method_missing(name, *args)
    words = name.to_s.split("_").map(&:capitalize)
    puts words.join(", ") + "!"
  end
end
DynamicGreeter.new.hello_world`,
    expected:"Hello, World!",
    explanation:"method_missing は未定義メソッドが呼ばれたときに実行される特殊メソッドです。これを使いメソッドを動的に生成できます。Rubyのメタプログラミングの基礎です。"
  },
];

const rubyMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "FizzBuzz",
    description: "1から30までの数を出力するが、3の倍数のとき「Fizz」、5の倍数のとき「Buzz」、両方の倍数のとき「FizzBuzz」と出力する。",
    requirements: [
      "1から30まで順番に処理する",
      "3の倍数のとき「Fizz」を出力",
      "5の倍数のとき「Buzz」を出力",
      "15の倍数のとき「FizzBuzz」を出力",
      "それ以外は数字をそのまま出力"
    ],
    hint: "times または each で1〜30を繰り返します。% 演算子で余りを使って判定します。",
    answer:
`(1..30).each do |i|
  if i % 15 == 0
    puts "FizzBuzz"
  elsif i % 3 == 0
    puts "Fizz"
  elsif i % 5 == 0
    puts "Buzz"
  else
    puts i
  end
end`
  },
  {
    id: 2, rank: "BRONZE",
    title: "成績平均計算機",
    description: "生徒のテスト点数の配列から平均点を計算して出力する。小数点以下1桁で表示する。",
    requirements: [
      "scores = [75, 88, 92, 60, 71] を使う",
      "合計を計算する",
      "平均を計算する",
      "小数点以下1桁で出力（round を使う）",
      "\"平均点: XX.X\" の形式で出力"
    ],
    hint: "inject や sum で合計を計算し、length で割ります。round(1) で小数点以下1桁に丸めます。",
    answer:
`scores = [75, 88, 92, 60, 71]
avg = scores.sum.to_f / scores.length
puts "平均点: #{avg.round(1)}"`
  },
  {
    id: 3, rank: "SILVER",
    title: "ワードカウンター",
    description: "文章を受け取り、各単語の出現回数をカウントして多い順に出力する。",
    requirements: [
      "text = \"ruby is great ruby is fun ruby\" を使う",
      "スペースで単語に分割する",
      "各単語の出現回数をハッシュで管理",
      "出現回数が多い順にソートして出力",
      "\"単語: 回数\" の形式で出力"
    ],
    hint: "split でスペース分割、ハッシュで集計、sort_by で並べ替えます。",
    answer:
`text = "ruby is great ruby is fun ruby"
count = {}
text.split(" ").each do |word|
  count[word] = (count[word] || 0) + 1
end
count.sort_by { |_, v| -v }.each do |word, n|
  puts "#{word}: #{n}"
end`
  },
  {
    id: 4, rank: "SILVER",
    title: "簡易電話帳",
    description: "名前と電話番号を管理する電話帳をハッシュで実装する。",
    requirements: [
      "ハッシュで電話帳を初期化（3件分データを入れる）",
      "名前で電話番号を検索できる",
      "存在しない名前を検索したとき「見つかりません」と出力",
      "全件一覧を出力できる",
      "上記を順番に実行して動作を確認する"
    ],
    hint: "ハッシュの key? メソッドでキーの存在確認ができます。each で全件繰り返し出力します。",
    answer:
`phonebook = {
  "Taro" => "090-1234-5678",
  "Hanako" => "080-9876-5432",
  "Ken" => "070-1111-2222"
}

def lookup(book, name)
  if book.key?(name)
    puts "#{name}: #{book[name]}"
  else
    puts "見つかりません"
  end
end

lookup(phonebook, "Taro")
lookup(phonebook, "Alice")
phonebook.each { |name, tel| puts "#{name}: #{tel}" }`
  },
  {
    id: 5, rank: "GOLD",
    title: "スタック実装",
    description: "クラスを使ってスタック（LIFO）データ構造を実装する。",
    requirements: [
      "Stack クラスを定義する",
      "push(value) でデータを追加",
      "pop で最後のデータを取り出して返す",
      "empty? でスタックが空かどうかを返す",
      "push 3回、pop 2回、empty? を呼び出して動作確認"
    ],
    hint: "配列の push と pop メソッドを内部で使います。empty? は配列の empty? を使えます。",
    answer:
`class Stack
  def initialize
    @data = []
  end
  def push(value)
    @data.push(value)
  end
  def pop
    @data.pop
  end
  def empty?
    @data.empty?
  end
end

s = Stack.new
s.push(10)
s.push(20)
s.push(30)
puts s.pop
puts s.pop
puts s.empty?`
  },
  {
    id: 6, rank: "GOLD",
    title: "行列の転置",
    description: "2次元配列（行列）を転置（行と列を入れ替え）する処理をクラスで実装する。",
    requirements: [
      "Matrix クラスを定義する",
      "initialize で2次元配列を受け取る",
      "transpose メソッドで転置した行列を返す",
      "display メソッドで各行を出力する",
      "3x3行列で動作確認する"
    ],
    hint: "Rubyには組み込みの transpose メソッドがあります。それを内部で使うか、自分で実装してみましょう。",
    answer:
`class Matrix
  def initialize(data)
    @data = data
  end
  def transpose
    Matrix.new(@data.transpose)
  end
  def display
    @data.each { |row| puts row.inspect }
  end
end

m = Matrix.new([[1,2,3],[4,5,6],[7,8,9]])
puts "元の行列:"
m.display
puts "転置後:"
m.transpose.display`
  },
];

const rubyUnitGuides = [
  {
    id: "ruby-unit01",
    unit: "UNIT 01", title: "基礎出力",
    summary: "Rubyの puts/print による出力と変数の基本を学ぶ。",
    points: [
      "puts は出力後に改行、print は改行なし",
      "変数宣言は不要、直接代入できる",
      "# で1行コメント、=begin ～ =end で複数行コメント",
      "ダブルクォート文字列で #{ } による式展開が使える"
    ],
    words: [
      { term: "puts", desc: "出力後に改行を追加するメソッド" },
      { term: "print", desc: "改行なしで出力するメソッド" },
      { term: "p", desc: "デバッグ用出力。オブジェクトの内容を詳しく表示" }
    ]
  },
  {
    id: "ruby-unit02",
    unit: "UNIT 02", title: "変数と演算",
    summary: "文字列補完、演算子、型変換と条件分岐の基本を学ぶ。",
    points: [
      "文字列補完 #{} でダブルクォート内に値を埋め込む",
      "整数同士の / は整数除算になる",
      "to_i, to_f, to_s で型変換",
      "if ～ else ～ end で条件分岐"
    ],
    words: [
      { term: "to_i", desc: "文字列を整数に変換するメソッド" },
      { term: "to_f", desc: "文字列・整数を浮動小数点数に変換" },
      { term: "upcase", desc: "文字列を大文字に変換するメソッド" }
    ]
  },
  {
    id: "ruby-unit03",
    unit: "UNIT 03", title: "制御フロー",
    summary: "elsif/case/when と繰り返し処理（while/times/each）を学ぶ。",
    points: [
      "elsif で複数条件、case/when で多分岐",
      "times はシンプルなN回繰り返し",
      "each は配列の各要素を処理",
      "while は条件が真の間繰り返す"
    ],
    words: [
      { term: "times", desc: "指定回数繰り返すメソッド（例: 3.times）" },
      { term: "each", desc: "配列の各要素に対してブロックを実行" },
      { term: "unless", desc: "条件が偽のときに実行（if の逆）" }
    ]
  },
  {
    id: "ruby-unit04",
    unit: "UNIT 04", title: "メソッド",
    summary: "def でのメソッド定義、デフォルト引数、可変長引数を学ぶ。",
    points: [
      "def ～ end でメソッドを定義",
      "最後の式が自動的に戻り値になる",
      "引数にデフォルト値を設定できる",
      "*args で可変長引数を受け取る"
    ],
    words: [
      { term: "def", desc: "メソッドを定義するキーワード" },
      { term: "return", desc: "値を返すキーワード（省略可）" },
      { term: "*args", desc: "可変長引数。複数の値を配列として受け取る" }
    ]
  },
  {
    id: "ruby-unit05",
    unit: "UNIT 05", title: "配列とイテレータ",
    summary: "map/select/inject などRubyらしい配列操作を学ぶ。",
    points: [
      "map で各要素を変換した新しい配列を作る",
      "select で条件に合う要素だけを取り出す",
      "inject/reduce で畳み込み演算",
      "sort, uniq, flatten など便利なメソッド多数"
    ],
    words: [
      { term: "map", desc: "各要素を変換した新しい配列を返す" },
      { term: "select", desc: "条件に合う要素だけを集めた配列を返す" },
      { term: "inject", desc: "畳み込み演算（合計・積などの集計）" }
    ]
  },
  {
    id: "ruby-unit06",
    unit: "UNIT 06", title: "ハッシュ",
    summary: "キーと値のペアを管理するハッシュの使い方を学ぶ。",
    points: [
      "{ key: value } でシンボルキーのハッシュを作成",
      "hash[:key] でアクセス",
      "keys/values/each で全体を操作",
      "key? でキーの存在確認"
    ],
    words: [
      { term: "ハッシュ", desc: "キーと値のペアを格納するデータ構造（辞書）" },
      { term: "シンボル", desc: ": で始まる識別子。文字列より効率的なキー" },
      { term: "key?", desc: "指定したキーが存在するか確認するメソッド" }
    ]
  },
  {
    id: "ruby-unit07",
    unit: "UNIT 07", title: "クラスとオブジェクト",
    summary: "class定義、継承、attr_accessor、モジュールのMixinを学ぶ。",
    points: [
      "class ～ end でクラスを定義",
      "initialize がコンストラクタ",
      "@ でインスタンス変数",
      "attr_accessor でアクセサを自動生成",
      "module + include でMixin"
    ],
    words: [
      { term: "initialize", desc: "オブジェクト生成時に呼ばれるコンストラクタ" },
      { term: "@変数", desc: "インスタンス変数。同じオブジェクト内で共有" },
      { term: "attr_accessor", desc: "ゲッターとセッターを自動生成するマクロ" }
    ]
  },
  {
    id: "ruby-unit08",
    unit: "UNIT 08", title: "高度なRuby",
    summary: "例外処理、Proc/lambda、メタプログラミングを学ぶ。",
    points: [
      "begin ～ rescue ～ end で例外処理",
      "lambda でオブジェクトとして扱えるメソッド",
      "method_missing でメソッドを動的に処理",
      "Rubyはメタプログラミングが強力"
    ],
    words: [
      { term: "rescue", desc: "例外を捕捉するキーワード" },
      { term: "lambda", desc: "オブジェクトとして扱えるメソッド（無名関数）" },
      { term: "method_missing", desc: "未定義メソッド呼び出し時に実行される特殊メソッド" }
    ]
  }
];

// ===== TypeScript データ =====

const typescriptProblems = [
  // UNIT 01 基礎出力 ROOKIE
  { id:1, unit:"UNIT 01  ◆  基礎出力と型", rank:"ROOKIE",
    title:"Hello World",
    question:"\"Hello, World!\" と画面に出力するプログラムを書いてください。",
    hint:"console.log() を使います。TypeScriptはJavaScriptと同じ出力メソッドが使えます。",
    answer:`console.log("Hello, World!");`,
    expected:"Hello, World!",
    explanation:"TypeScriptはJavaScriptのスーパーセットです。console.log()でブラウザやNode.jsに出力できます。"
  },
  { id:2, unit:"UNIT 01  ◆  基礎出力と型", rank:"ROOKIE",
    title:"型アノテーション",
    question:"name に string 型、age に number 型のアノテーションをつけて変数を宣言し、それぞれ出力してください。name は \"TypeScript\"、age は 10 とします。",
    hint:"let 変数名: 型 = 値; の形で型アノテーションを書きます。",
    answer:
`let name: string = "TypeScript";
let age: number = 10;
console.log(name);
console.log(age);`,
    expected:"TypeScript\n10",
    explanation:"型アノテーションは変数の右に : 型名 と書きます。string、number、boolean が基本の型です。"
  },
  { id:3, unit:"UNIT 01  ◆  基礎出力と型", rank:"ROOKIE",
    title:"基本型一覧",
    question:"string型の greeting、number型の score、boolean型の isActive を宣言して、それぞれ出力してください。値は \"Hello\"、95、true とします。",
    hint:"boolean 型は true か false を格納できます。",
    answer:
`let greeting: string = "Hello";
let score: number = 95;
let isActive: boolean = true;
console.log(greeting);
console.log(score);
console.log(isActive);`,
    expected:"Hello\n95\ntrue",
    explanation:"TypeScriptの基本型: string（文字列）、number（数値）、boolean（真偽値）。型を明示することで誤った代入をコンパイル時に検出できます。"
  },
  // UNIT 02 関数と型 BRONZE
  { id:4, unit:"UNIT 02  ◆  関数と型", rank:"BRONZE",
    title:"型付き関数",
    question:"引数 name: string を受け取り \"Hello, [name]!\" を返す関数 greet を定義し、\"TypeScript\" で呼び出して出力してください。戻り値の型アノテーションも書くこと。",
    hint:"function 関数名(引数: 型): 戻り値の型 { } の形で書きます。",
    answer:
`function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
console.log(greet("TypeScript"));`,
    expected:"Hello, TypeScript!",
    explanation:"引数と戻り値に型を付けることで、誤った型の値を渡すとコンパイルエラーになります。"
  },
  { id:5, unit:"UNIT 02  ◆  関数と型", rank:"BRONZE",
    title:"オプショナル引数",
    question:"name: string と greeting?: string を受け取る greet 関数を定義してください。greeting が省略されたら \"Hello\" を使います。greet(\"Taro\") と greet(\"Hanako\", \"Hi\") を出力してください。",
    hint:"? をつけた引数はオプショナルです。|| でデフォルト値を設定できます。",
    answer:
`function greet(name: string, greeting?: string): string {
  const g = greeting || "Hello";
  return \`\${g}, \${name}!\`;
}
console.log(greet("Taro"));
console.log(greet("Hanako", "Hi"));`,
    expected:"Hello, Taro!\nHi, Hanako!",
    explanation:"? をつけた引数は省略できます。省略された場合は undefined になります。"
  },
  { id:6, unit:"UNIT 02  ◆  関数と型", rank:"BRONZE",
    title:"アロー関数",
    question:"2つの number を受け取って足し算の結果を返すアロー関数 add を定義し、add(3, 4) を出力してください。",
    hint:"const 変数名 = (引数: 型): 戻り値の型 => 式; の形で書きます。",
    answer:
`const add = (a: number, b: number): number => a + b;
console.log(add(3, 4));`,
    expected:"7",
    explanation:"アロー関数は簡潔に関数を書けます。1行の場合 {} と return を省略できます。"
  },
  { id:7, unit:"UNIT 02  ◆  関数と型", rank:"BRONZE",
    title:"デフォルト引数",
    question:"base: number と exp: number = 2 を受け取って base の exp 乗を返す power 関数を定義し、power(3) と power(2, 10) を出力してください。",
    hint:"Math.pow(base, exp) を使えます。",
    answer:
`function power(base: number, exp: number = 2): number {
  return Math.pow(base, exp);
}
console.log(power(3));
console.log(power(2, 10));`,
    expected:"9\n1024",
    explanation:"デフォルト引数を設定すると省略可能になります。TypeScriptはデフォルト引数から型を推論できます。"
  },
  { id:8, unit:"UNIT 02  ◆  関数と型", rank:"BRONZE",
    title:"型推論",
    question:"let x = 42; と let msg = \"hello\"; を宣言し、それぞれの型を typeof で確認して出力してください。",
    hint:"typeof 変数名 で変数の型を文字列として取得できます。",
    answer:
`let x = 42;
let msg = "hello";
console.log(typeof x);
console.log(typeof msg);`,
    expected:"number\nstring",
    explanation:"TypeScriptは初期値から型を推論します（型推論）。明示的に書かなくても型チェックが働きます。"
  },
  // UNIT 03 配列とタプル SILVER
  { id:9, unit:"UNIT 03  ◆  配列とタプル", rank:"SILVER",
    title:"型付き配列",
    question:"number[] 型の配列 scores を [85, 92, 78, 96] で作り、map で各スコアに +5 した新しい配列を出力してください。",
    hint:"配列型は 型名[] または Array<型名> で書きます。",
    answer:
`const scores: number[] = [85, 92, 78, 96];
const boosted = scores.map(s => s + 5);
console.log(boosted);`,
    expected:"[ 90, 97, 83, 101 ]",
    explanation:"number[] は数値の配列型です。JavaScriptの配列メソッドはそのまま使えます。"
  },
  { id:10, unit:"UNIT 03  ◆  配列とタプル", rank:"SILVER",
    title:"タプル",
    question:"[string, number] 型のタプル person を [\"Taro\", 20] で作り、0番目と1番目をそれぞれ出力してください。",
    hint:"タプルは [型1, 型2] の形で各位置の型を固定した配列です。",
    answer:
`const person: [string, number] = ["Taro", 20];
console.log(person[0]);
console.log(person[1]);`,
    expected:"Taro\n20",
    explanation:"タプルは各インデックスの型が決まった配列です。固定長で型安全な複数値の受け渡しに使います。"
  },
  { id:11, unit:"UNIT 03  ◆  配列とタプル", rank:"SILVER",
    title:"readonly 配列",
    question:"readonly number[] 型の定数 PRIMES を [2, 3, 5, 7, 11] で作り、filter で5より大きい要素だけ出力してください。",
    hint:"readonly をつけると変更不可能な配列になります。",
    answer:
`const PRIMES: readonly number[] = [2, 3, 5, 7, 11];
console.log(PRIMES.filter(n => n > 5));`,
    expected:"[ 7, 11 ]",
    explanation:"readonly をつけると push や pop などの変更操作がコンパイルエラーになります。意図しない変更を防げます。"
  },
  { id:12, unit:"UNIT 03  ◆  配列とタプル", rank:"SILVER",
    title:"ユニオン型配列",
    question:"(string | number)[] 型の配列 mixed を ['hello', 42, 'world', 100] で作り、filter で number 型のみ取り出して出力してください。",
    hint:"typeof x === 'number' で型の絞り込みができます。",
    answer:
`const mixed: (string | number)[] = ['hello', 42, 'world', 100];
const nums = mixed.filter((x): x is number => typeof x === 'number');
console.log(nums);`,
    expected:"[ 42, 100 ]",
    explanation:"ユニオン型 string | number は「文字列か数値」のどちらかを表します。型ガードで絞り込みができます。"
  },
  // UNIT 04 インターフェース SILVER/GOLD
  { id:13, unit:"UNIT 04  ◆  インターフェース", rank:"SILVER",
    title:"interfaceの定義",
    question:"name: string と age: number を持つ Person インターフェースを定義し、Taro(20歳) のオブジェクトを作って name と age を出力してください。",
    hint:"interface 名前 { プロパティ: 型; } の形で定義します。",
    answer:
`interface Person {
  name: string;
  age: number;
}
const taro: Person = { name: "Taro", age: 20 };
console.log(taro.name);
console.log(taro.age);`,
    expected:"Taro\n20",
    explanation:"インターフェースはオブジェクトの形（プロパティと型）を定義します。型チェックの基準になります。"
  },
  { id:14, unit:"UNIT 04  ◆  インターフェース", rank:"SILVER",
    title:"オプショナルプロパティ",
    question:"name: string、age: number、email?: string を持つ User インターフェースを定義し、email なしと email ありのオブジェクトを作って email ?? \"なし\" で出力してください。",
    hint:"? をつけたプロパティは省略可能です。?? は null/undefined のときの代替値を指定します。",
    answer:
`interface User {
  name: string;
  age: number;
  email?: string;
}
const u1: User = { name: "Taro", age: 20 };
const u2: User = { name: "Hanako", age: 25, email: "h@example.com" };
console.log(u1.email ?? "なし");
console.log(u2.email ?? "なし");`,
    expected:"なし\nh@example.com",
    explanation:"? でオプショナルプロパティを定義します。??(Nullish Coalescing)はnull/undefinedのときに右の値を返します。"
  },
  { id:15, unit:"UNIT 04  ◆  インターフェース", rank:"GOLD",
    title:"インターフェースの継承",
    question:"id: number と createdAt: string を持つ Base インターフェースを定義し、それを extends した Post インターフェース（title: string, body: string を追加）を定義して、オブジェクトを作り title と createdAt を出力してください。",
    hint:"interface 子 extends 親 { } で継承できます。",
    answer:
`interface Base {
  id: number;
  createdAt: string;
}
interface Post extends Base {
  title: string;
  body: string;
}
const post: Post = { id: 1, createdAt: "2025-01-01", title: "Hello", body: "World" };
console.log(post.title);
console.log(post.createdAt);`,
    expected:"Hello\n2025-01-01",
    explanation:"extends で既存インターフェースを継承し、新しいプロパティを追加できます。"
  },
  { id:16, unit:"UNIT 04  ◆  インターフェース", rank:"GOLD",
    title:"関数型インターフェース",
    question:"(x: number, y: number) => number 型の Calc インターフェースを定義し、add と multiply の実装を作って結果を出力してください（3+4、3×4）。",
    hint:"interface に直接関数シグネチャを書けます。",
    answer:
`interface Calc {
  (x: number, y: number): number;
}
const add: Calc = (x, y) => x + y;
const multiply: Calc = (x, y) => x * y;
console.log(add(3, 4));
console.log(multiply(3, 4));`,
    expected:"7\n12",
    explanation:"インターフェースで関数の型も定義できます。実装側は型推論が働くため引数の型を省略できます。"
  },
  // UNIT 05 型エイリアスとユニオン GOLD/PLATINUM
  { id:17, unit:"UNIT 05  ◆  型エイリアスとユニオン", rank:"GOLD",
    title:"type エイリアス",
    question:"type Point = { x: number; y: number } を定義し、Point 型の変数を作り x と y を出力してください（x:3, y:4）。",
    hint:"type 名前 = { ... } で型エイリアスを定義します。interface と似ていますが合成方法が異なります。",
    answer:
`type Point = { x: number; y: number };
const p: Point = { x: 3, y: 4 };
console.log(p.x);
console.log(p.y);`,
    expected:"3\n4",
    explanation:"type エイリアスはあらゆる型に名前をつけられます。プリミティブ型、ユニオン型、交差型にも使えます。"
  },
  { id:18, unit:"UNIT 05  ◆  型エイリアスとユニオン", rank:"GOLD",
    title:"ユニオン型",
    question:"type Status = 'active' | 'inactive' | 'pending' を定義し、Status 型の変数を 'active' に設定して出力してください。次に 'active' かどうかを判定して出力してください。",
    hint:"文字列リテラル型を | で結合するとユニオン型になります。",
    answer:
`type Status = 'active' | 'inactive' | 'pending';
const status: Status = 'active';
console.log(status);
console.log(status === 'active' ? "有効" : "無効");`,
    expected:"active\n有効",
    explanation:"リテラル型のユニオンはenum的な使い方ができます。指定した値以外を代入するとコンパイルエラーになります。"
  },
  { id:19, unit:"UNIT 05  ◆  型エイリアスとユニオン", rank:"PLATINUM",
    title:"交差型（Intersection）",
    question:"type A = { name: string } と type B = { age: number } を定義し、type C = A & B で交差型を作って { name: \"Taro\", age: 20 } のオブジェクトの name と age を出力してください。",
    hint:"& で複数の型を合成した交差型を作れます。",
    answer:
`type A = { name: string };
type B = { age: number };
type C = A & B;
const c: C = { name: "Taro", age: 20 };
console.log(c.name);
console.log(c.age);`,
    expected:"Taro\n20",
    explanation:"交差型 A & B は「A かつ B」の型です。両方のプロパティを持つオブジェクト型になります。"
  },
  // UNIT 06 クラス PLATINUM/DIAMOND
  { id:20, unit:"UNIT 06  ◆  クラス", rank:"PLATINUM",
    title:"クラスの定義",
    question:"Animal クラスを定義してください。name: string のプロパティ（コンストラクタで初期化）と speak(): string メソッド（\"[name] says hello\" を返す）を持ちます。new Animal(\"Dog\").speak() を出力してください。",
    hint:"class 名 { constructor(public プロパティ: 型) {} } の形で簡潔に書けます。",
    answer:
`class Animal {
  constructor(public name: string) {}
  speak(): string {
    return \`\${this.name} says hello\`;
  }
}
console.log(new Animal("Dog").speak());`,
    expected:"Dog says hello",
    explanation:"constructorの引数に public をつけると自動的にプロパティが作成されます（省略記法）。"
  },
  { id:21, unit:"UNIT 06  ◆  クラス", rank:"PLATINUM",
    title:"アクセス修飾子",
    question:"BankAccount クラスを定義してください。private balance: number（初期値0）、deposit(amount: number) で残高追加、getBalance() で残高を返す。deposit(1000)して getBalance() を出力してください。",
    hint:"private にすると外部からアクセスできなくなります。",
    answer:
`class BankAccount {
  private balance: number = 0;
  deposit(amount: number): void {
    this.balance += amount;
  }
  getBalance(): number {
    return this.balance;
  }
}
const acc = new BankAccount();
acc.deposit(1000);
console.log(acc.getBalance());`,
    expected:"1000",
    explanation:"private はクラス外からのアクセスを禁止します。protected は継承クラスからはアクセス可能です。"
  },
  { id:22, unit:"UNIT 06  ◆  クラス", rank:"DIAMOND",
    title:"継承とオーバーライド",
    question:"speak() で \"animal\" を返す Animal クラスと、それを継承して speak() を \"woof\" にオーバーライドする Dog クラスを作り、Dog の speak() を出力してください。",
    hint:"extends で継承し、メソッドを上書きするとオーバーライドになります。",
    answer:
`class Animal {
  speak(): string { return "animal"; }
}
class Dog extends Animal {
  speak(): string { return "woof"; }
}
const dog = new Dog();
console.log(dog.speak());`,
    expected:"woof",
    explanation:"TypeScriptのクラスは1つの親クラスを extends で継承できます。同名のメソッドを定義するとオーバーライドになります。"
  },
  { id:23, unit:"UNIT 06  ◆  クラス", rank:"DIAMOND",
    title:"implements（インターフェース実装）",
    question:"greet(): string メソッドを持つ Greeter インターフェースを定義し、それを implements した JapaneseGreeter クラス（\"こんにちは\" を返す）を作って出力してください。",
    hint:"class クラス名 implements インターフェース名 { } の形で実装します。",
    answer:
`interface Greeter {
  greet(): string;
}
class JapaneseGreeter implements Greeter {
  greet(): string {
    return "こんにちは";
  }
}
const g = new JapaneseGreeter();
console.log(g.greet());`,
    expected:"こんにちは",
    explanation:"implements でインターフェースを実装することを宣言します。必要なメソッドが揃っていないとエラーになります。"
  },
  // UNIT 07 ジェネリクス DIAMOND/MASTER
  { id:24, unit:"UNIT 07  ◆  ジェネリクス", rank:"DIAMOND",
    title:"ジェネリック関数",
    question:"任意の型 T の配列を受け取り最初の要素を返すジェネリック関数 first<T>(arr: T[]): T を定義し、数値配列と文字列配列で呼び出して出力してください。",
    hint:"function 名<T>(引数: T[]): T { } の形でジェネリクスを使います。",
    answer:
`function first<T>(arr: T[]): T {
  return arr[0];
}
console.log(first([10, 20, 30]));
console.log(first(["a", "b", "c"]));`,
    expected:"10\na",
    explanation:"ジェネリクスは型をパラメータとして受け取る仕組みです。型安全性を保ちながら汎用的なコードが書けます。"
  },
  { id:25, unit:"UNIT 07  ◆  ジェネリクス", rank:"DIAMOND",
    title:"ジェネリッククラス",
    question:"ジェネリッククラス Stack<T> を定義してください。push(item: T)、pop(): T | undefined、get size(): number を実装し、数値スタックで動作確認してください。",
    hint:"class Stack<T> { private items: T[] = []; } の形で書きます。",
    answer:
`class Stack<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  get size(): number { return this.items.length; }
}
const s = new Stack<number>();
s.push(1); s.push(2); s.push(3);
console.log(s.pop());
console.log(s.size);`,
    expected:"3\n2",
    explanation:"クラスにもジェネリクスを使えます。Stack<number> のように型引数を指定して使います。"
  },
  { id:26, unit:"UNIT 07  ◆  ジェネリクス", rank:"MASTER",
    title:"制約付きジェネリクス",
    question:"length プロパティを持つ型 T に制約した getLength<T extends { length: number }>(val: T): number 関数を定義し、文字列と配列で呼び出して出力してください。",
    hint:"extends で型に制約を付けられます。",
    answer:
`function getLength<T extends { length: number }>(val: T): number {
  return val.length;
}
console.log(getLength("hello"));
console.log(getLength([1, 2, 3, 4]));`,
    expected:"5\n4",
    explanation:"extends で型パラメータに制約を付けられます。{ length: number } を持つ型であれば何でも受け取れます。"
  },
  // UNIT 08 高度な型 MASTER/LEGEND
  { id:27, unit:"UNIT 08  ◆  高度な型", rank:"MASTER",
    title:"Mapped Types",
    question:"type Readonly<T> = { readonly [K in keyof T]: T[K] } を使って Person型（name: string, age: number）の全プロパティを readonly にした型を作り、オブジェクトを作成してプロパティを出力してください。",
    hint:"組み込みの Readonly<T> ユーティリティ型を使えます。",
    answer:
`interface Person {
  name: string;
  age: number;
}
const p: Readonly<Person> = { name: "Taro", age: 20 };
console.log(p.name);
console.log(p.age);`,
    expected:"Taro\n20",
    explanation:"Readonly<T> は全プロパティを readonly にするユーティリティ型です。Partial<T>、Required<T>、Pick<T,K>なども用意されています。"
  },
  { id:28, unit:"UNIT 08  ◆  高度な型", rank:"MASTER",
    title:"条件型",
    question:"type IsString<T> = T extends string ? 'yes' : 'no' を定義し、IsString<string> と IsString<number> を出力してください（型を変数に入れて出力する必要はなく、型チェックが通ることを確認する形でOK）。型レベルで判定した結果を実行時に文字列として出力してください。",
    hint:"条件型は T extends U ? X : Y の形で書きます。",
    answer:
`type IsString<T> = T extends string ? 'yes' : 'no';
const a: IsString<string> = 'yes';
const b: IsString<number> = 'no';
console.log(a);
console.log(b);`,
    expected:"yes\nno",
    explanation:"条件型は型レベルのif文です。T extends U ? X : Y で「TがUを拡張するならX、そうでなければY」の型になります。"
  },
  { id:29, unit:"UNIT 08  ◆  高度な型", rank:"MASTER",
    title:"Template Literal Types",
    question:"type EventName<T extends string> = \\`on\\${Capitalize<T>}\\` を定義し、EventName<'click'> と EventName<'change'> 型の変数を作って出力してください。",
    hint:"テンプレートリテラル型はバッククォートで文字列型を組み合わせます。",
    answer:
`type EventName<T extends string> = \`on\${Capitalize<T>}\`;
const a: EventName<'click'> = 'onClick';
const b: EventName<'change'> = 'onChange';
console.log(a);
console.log(b);`,
    expected:"onClick\nonChange",
    explanation:"テンプレートリテラル型で文字列型を動的に生成できます。Capitalize はTypeScriptの組み込みユーティリティ型です。"
  },
  { id:30, unit:"UNIT 08  ◆  高度な型", rank:"LEGEND",
    title:"型レベルの再帰 DeepReadonly",
    question:"type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] } を定義し、ネストされたオブジェクト型を DeepReadonly にして、プロパティを2段階出力してください。",
    hint:"再帰的な型定義は T[K] extends object かどうかで分岐します。",
    answer:
`type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
interface Config {
  server: { host: string; port: number };
  debug: boolean;
}
const cfg: DeepReadonly<Config> = {
  server: { host: "localhost", port: 3000 },
  debug: false,
};
console.log(cfg.server.host);
console.log(cfg.server.port);`,
    expected:"localhost\n3000",
    explanation:"再帰的な型定義で深くネストされたオブジェクトにも型制約を適用できます。これはTypeScriptの型システムの強力な機能の一つです。"
  },
];

const typescriptMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "型安全なFizzBuzz",
    description: "FizzBuzzをTypeScriptの型安全な方法で実装する。戻り値の型を明示すること。",
    requirements: [
      "fizzBuzz(n: number): string 関数を定義",
      "3の倍数なら 'Fizz'、5の倍数なら 'Buzz'、両方なら 'FizzBuzz'",
      "それ以外は数字を文字列で返す",
      "1から20まで出力する"
    ],
    hint: "戻り値型を string に指定します。数値を文字列化するには String(n) や n.toString() を使います。",
    answer:
`function fizzBuzz(n: number): string {
  if (n % 15 === 0) return 'FizzBuzz';
  if (n % 3 === 0) return 'Fizz';
  if (n % 5 === 0) return 'Buzz';
  return String(n);
}
for (let i = 1; i <= 20; i++) {
  console.log(fizzBuzz(i));
}`
  },
  {
    id: 2, rank: "BRONZE",
    title: "型付き電話帳",
    description: "インターフェースを使った型安全な電話帳を実装する。",
    requirements: [
      "Contact インターフェース（name: string, phone: string, email?: string）を定義",
      "Contact[] 型の配列を3件以上で初期化",
      "名前で検索する find 関数を型付きで実装",
      "見つかった場合は情報を、見つからない場合は 'Not found' を出力"
    ],
    hint: "Array.find() を使います。見つからない場合は undefined が返るので undefined チェックが必要です。",
    answer:
`interface Contact {
  name: string;
  phone: string;
  email?: string;
}
const contacts: Contact[] = [
  { name: "Taro", phone: "090-1111-2222", email: "taro@example.com" },
  { name: "Hanako", phone: "080-3333-4444" },
  { name: "Ken", phone: "070-5555-6666", email: "ken@example.com" },
];
function findContact(name: string): string {
  const c = contacts.find(c => c.name === name);
  if (!c) return 'Not found';
  return \`\${c.name}: \${c.phone}\${c.email ? ' / ' + c.email : ''}\`;
}
console.log(findContact("Taro"));
console.log(findContact("Alice"));`
  },
  {
    id: 3, rank: "SILVER",
    title: "ジェネリックなキャッシュ",
    description: "ジェネリクスを使った型安全なキャッシュクラスを実装する。",
    requirements: [
      "Cache<T> クラスを定義",
      "set(key: string, value: T, ttl?: number) でキャッシュを設定",
      "get(key: string): T | undefined でキャッシュを取得",
      "has(key: string): boolean でキャッシュの存在確認",
      "文字列と数値でそれぞれ動作確認"
    ],
    hint: "内部で Map<string, T> を使います。",
    answer:
`class Cache<T> {
  private store = new Map<string, T>();
  set(key: string, value: T): void {
    this.store.set(key, value);
  }
  get(key: string): T | undefined {
    return this.store.get(key);
  }
  has(key: string): boolean {
    return this.store.has(key);
  }
}
const strCache = new Cache<string>();
strCache.set("greeting", "Hello");
console.log(strCache.get("greeting"));
console.log(strCache.has("greeting"));
console.log(strCache.has("farewell"));`
  },
  {
    id: 4, rank: "SILVER",
    title: "判別可能なユニオン",
    description: "判別可能なユニオン型を使ったイベント処理システムを実装する。",
    requirements: [
      "type ClickEvent = { type: 'click'; x: number; y: number } を定義",
      "type KeyEvent = { type: 'key'; key: string } を定義",
      "type AppEvent = ClickEvent | KeyEvent のユニオン型を定義",
      "AppEvent を受け取り適切な情報を出力する handleEvent 関数を実装",
      "両方のイベントタイプで動作確認"
    ],
    hint: "switch(event.type) で判別できます。TypeScriptはそれぞれのcaseで型を絞り込みます。",
    answer:
`type ClickEvent = { type: 'click'; x: number; y: number };
type KeyEvent   = { type: 'key'; key: string };
type AppEvent   = ClickEvent | KeyEvent;

function handleEvent(e: AppEvent): void {
  switch (e.type) {
    case 'click':
      console.log(\`クリック: (\${e.x}, \${e.y})\`);
      break;
    case 'key':
      console.log(\`キー入力: \${e.key}\`);
      break;
  }
}
handleEvent({ type: 'click', x: 100, y: 200 });
handleEvent({ type: 'key', key: 'Enter' });`
  },
  {
    id: 5, rank: "GOLD",
    title: "型安全なビルダーパターン",
    description: "TypeScriptのジェネリクスを使って型安全なビルダーパターンを実装する。",
    requirements: [
      "QueryBuilder<T> クラスを定義（T はレコードの型）",
      "select(...fields: (keyof T)[]) でフィールドを選択",
      "where(field: keyof T, value: T[keyof T]) で条件を追加",
      "build() でクエリ文字列を返す",
      "User型（id, name, email）で動作確認"
    ],
    hint: "keyof T で型のキー一覧を取得できます。T[keyof T] で値の型になります。",
    answer:
`interface User {
  id: number;
  name: string;
  email: string;
}
class QueryBuilder<T> {
  private fields: string[] = [];
  private conditions: string[] = [];
  select(...f: (keyof T)[]): this {
    this.fields = f as string[];
    return this;
  }
  where(field: keyof T, value: T[keyof T]): this {
    this.conditions.push(\`\${String(field)} = '\${value}'\`);
    return this;
  }
  build(): string {
    const sel = this.fields.length ? this.fields.join(', ') : '*';
    const where = this.conditions.length ? ' WHERE ' + this.conditions.join(' AND ') : '';
    return \`SELECT \${sel}\${where}\`;
  }
}
const q = new QueryBuilder<User>()
  .select('id', 'name')
  .where('email', 'taro@example.com')
  .build();
console.log(q);`
  },
  {
    id: 6, rank: "GOLD",
    title: "型安全なイベントエミッター",
    description: "TypeScriptの型システムを使ってイベント名と引数が型安全なEventEmitterを実装する。",
    requirements: [
      "EventMap インターフェース（click: { x: number, y: number }, load: { url: string }）を定義",
      "TypedEmitter<T extends Record<string, unknown>> クラスを定義",
      "on<K extends keyof T>(event: K, handler: (data: T[K]) => void) でリスナー登録",
      "emit<K extends keyof T>(event: K, data: T[K]) でイベント発火",
      "両方のイベントで動作確認"
    ],
    hint: "Map<string, Function[]> でリスナーを管理します。",
    answer:
`interface EventMap {
  click: { x: number; y: number };
  load:  { url: string };
}
class TypedEmitter<T extends Record<string, unknown>> {
  private handlers = new Map<string, ((d: unknown) => void)[]>();
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    const key = String(event);
    const arr = this.handlers.get(key) || [];
    arr.push(handler as (d: unknown) => void);
    this.handlers.set(key, arr);
  }
  emit<K extends keyof T>(event: K, data: T[K]): void {
    const arr = this.handlers.get(String(event)) || [];
    arr.forEach(h => h(data));
  }
}
const emitter = new TypedEmitter<EventMap>();
emitter.on('click', ({ x, y }) => console.log(\`クリック: \${x}, \${y}\`));
emitter.on('load',  ({ url })   => console.log(\`ロード: \${url}\`));
emitter.emit('click', { x: 100, y: 200 });
emitter.emit('load',  { url: 'https://example.com' });`
  },
];

const typescriptUnitGuides = [
  {
    id: "ts-unit01",
    unit: "UNIT 01", title: "基礎出力と型",
    summary: "TypeScriptの型アノテーションの基本を学ぶ。",
    points: [
      "TypeScriptはJavaScriptに静的型付けを追加した言語",
      "変数に : 型名 でアノテーションを付ける",
      "基本型: string、number、boolean、null、undefined",
      "型推論: 初期値から型を自動判定"
    ],
    words: [
      { term: "型アノテーション", desc: "変数や引数に型を明示する記法（: 型名）" },
      { term: "型推論", desc: "TypeScriptが自動的に型を判定する機能" },
      { term: "静的型付け", desc: "コンパイル時に型をチェックする仕組み" }
    ]
  },
  {
    id: "ts-unit02",
    unit: "UNIT 02", title: "関数と型",
    summary: "引数・戻り値の型付け、アロー関数、オプショナル・デフォルト引数を学ぶ。",
    points: [
      "引数と戻り値に型アノテーションを書く",
      "? でオプショナル引数（省略可能）",
      "= でデフォルト値を設定",
      "アロー関数で簡潔に書ける"
    ],
    words: [
      { term: "オプショナル引数", desc: "? をつけると省略可能な引数になる" },
      { term: "void", desc: "何も返さない関数の戻り値型" },
      { term: "アロー関数", desc: "=> で書く簡潔な関数記法" }
    ]
  },
  {
    id: "ts-unit03",
    unit: "UNIT 03", title: "配列とタプル",
    summary: "型付き配列、タプル、readonly、ユニオン型配列を学ぶ。",
    points: [
      "型名[] で型付き配列を宣言",
      "タプルは各インデックスの型が固定された配列",
      "readonly で変更不可能な配列",
      "型ガードで型を絞り込める"
    ],
    words: [
      { term: "タプル", desc: "各インデックスの型を固定した固定長配列" },
      { term: "readonly", desc: "変更を禁止する修飾子" },
      { term: "型ガード", desc: "型を絞り込む条件チェック（typeof、instanceof）" }
    ]
  },
  {
    id: "ts-unit04",
    unit: "UNIT 04", title: "インターフェース",
    summary: "オブジェクトの形を定義するインターフェースを学ぶ。",
    points: [
      "interface でオブジェクトの形を定義",
      "? でオプショナルプロパティ",
      "extends で継承",
      "関数型も定義できる"
    ],
    words: [
      { term: "interface", desc: "オブジェクトの型を定義するキーワード" },
      { term: "extends", desc: "インターフェースを継承するキーワード" },
      { term: "??", desc: "null/undefinedのとき右の値を返す演算子" }
    ]
  },
  {
    id: "ts-unit05",
    unit: "UNIT 05", title: "型エイリアスとユニオン",
    summary: "type エイリアス、ユニオン型（|）、交差型（&）を学ぶ。",
    points: [
      "type で型に名前をつける",
      "| でユニオン型（どれか一つ）",
      "& で交差型（全部を満たす）",
      "リテラル型でenum的な使い方"
    ],
    words: [
      { term: "type エイリアス", desc: "型に名前をつける宣言（type Name = ...）" },
      { term: "ユニオン型", desc: "A | B 「AまたはB」のどちらかの型" },
      { term: "交差型", desc: "A & B 「AかつB」両方の型を満たす" }
    ]
  },
  {
    id: "ts-unit06",
    unit: "UNIT 06", title: "クラス",
    summary: "クラス定義、アクセス修飾子、継承、インターフェース実装を学ぶ。",
    points: [
      "constructorの引数にpublicをつけると自動でプロパティ生成",
      "public / private / protected でアクセスを制御",
      "extends で継承、implements でインターフェース実装",
      "TypeScriptのクラスはJavaScriptのclassとほぼ同じ"
    ],
    words: [
      { term: "public", desc: "どこからでもアクセス可能（デフォルト）" },
      { term: "private", desc: "クラス内からのみアクセス可能" },
      { term: "implements", desc: "インターフェースを実装することを宣言" }
    ]
  },
  {
    id: "ts-unit07",
    unit: "UNIT 07", title: "ジェネリクス",
    summary: "型パラメータを使った汎用的なコードの書き方を学ぶ。",
    points: [
      "<T> で型パラメータを宣言",
      "関数・クラス・インターフェースに使える",
      "extends で型パラメータに制約を付ける",
      "呼び出し時に型引数を指定（または推論）"
    ],
    words: [
      { term: "ジェネリクス", desc: "型をパラメータとして受け取る機能" },
      { term: "型パラメータ", desc: "<T>で宣言する型の変数" },
      { term: "型制約", desc: "T extends U で型パラメータの範囲を制限" }
    ]
  },
  {
    id: "ts-unit08",
    unit: "UNIT 08", title: "高度な型",
    summary: "Mapped Types、条件型、テンプレートリテラル型、再帰型を学ぶ。",
    points: [
      "Readonly<T>、Partial<T>などユーティリティ型",
      "T extends U ? X : Y 条件型",
      "テンプレートリテラル型で文字列型を組み合わせ",
      "再帰的な型定義も可能"
    ],
    words: [
      { term: "Mapped Types", desc: "既存型の全プロパティを変換する型" },
      { term: "条件型", desc: "T extends U ? X : Y 型レベルのif" },
      { term: "keyof", desc: "型のキー一覧をユニオン型として取得" }
    ]
  }
];

// ===== Kotlin データ =====

const kotlinProblems = [
  // UNIT 01 基礎出力と変数 ROOKIE
  { id:1, unit:"UNIT 01  ◆  基礎出力と変数", rank:"ROOKIE",
    title:"Hello World",
    question:"\"Hello, World!\" と画面に出力するプログラムを書いてください。",
    hint:"println() 関数を使います。Kotlinのメイン関数は fun main() {} です。",
    answer:`fun main() {\n    println("Hello, World!")\n}`,
    expected:"Hello, World!",
    explanation:"Kotlinのエントリーポイントは fun main() です。println() は出力後に改行します。"
  },
  { id:2, unit:"UNIT 01  ◆  基礎出力と変数", rank:"ROOKIE",
    title:"val と var",
    question:"val で不変の name = \"Kotlin\" を、var で可変の version = 2 を宣言し、version を 3 に変更してそれぞれ出力してください。",
    hint:"val は再代入不可、var は再代入可能です。",
    answer:`fun main() {\n    val name = "Kotlin"\n    var version = 2\n    version = 3\n    println(name)\n    println(version)\n}`,
    expected:"Kotlin\n3",
    explanation:"val は immutable（変更不可）、var は mutable（変更可）の変数宣言です。基本的には val を使い、必要なときだけ var を使います。"
  },
  { id:3, unit:"UNIT 01  ◆  基礎出力と変数", rank:"ROOKIE",
    title:"文字列テンプレート",
    question:"name = \"Kotlin\" と version = 2.1 を宣言し、\"Hello, Kotlin!\" と \"Version: 2.1\" を文字列テンプレートで出力してください。",
    hint:"\"$変数名\" または \"${式}\" で変数や式を文字列に埋め込めます。",
    answer:`fun main() {\n    val name = "Kotlin"\n    val version = 2.1\n    println("Hello, \$name!")\n    println("Version: \$version")\n}`,
    expected:"Hello, Kotlin!\nVersion: 2.1",
    explanation:"$ で変数を、${} で式を文字列に埋め込める文字列テンプレートはKotlinの便利な機能です。"
  },
  // UNIT 02 型と制御フロー BRONZE
  { id:4, unit:"UNIT 02  ◆  型と制御フロー", rank:"BRONZE",
    title:"基本型",
    question:"Int型の n=42、Double型の d=3.14、String型の s=\"Hello\"、Boolean型の b=true を宣言してそれぞれ出力してください。",
    hint:"Kotlinの型名は大文字始まりです（Int、Double、String、Boolean）。",
    answer:`fun main() {\n    val n: Int = 42\n    val d: Double = 3.14\n    val s: String = "Hello"\n    val b: Boolean = true\n    println(n)\n    println(d)\n    println(s)\n    println(b)\n}`,
    expected:"42\n3.14\nHello\ntrue",
    explanation:"Kotlinの基本型はすべてオブジェクトです。型推論により多くの場合型アノテーションは省略できます。"
  },
  { id:5, unit:"UNIT 02  ◆  型と制御フロー", rank:"BRONZE",
    title:"null安全",
    question:"String? 型の name を null で宣言し、\"名前なし\" を ?: で出力してください。次に name を \"Kotlin\" に変えて length を ?. で出力してください。",
    hint:"?: はElvis演算子、?. はsafe call演算子です。",
    answer:`fun main() {\n    var name: String? = null\n    println(name ?: "名前なし")\n    name = "Kotlin"\n    println(name?.length)\n}`,
    expected:"名前なし\n6",
    explanation:"Kotlinはnull安全な言語です。? 付き型のみnullを格納できます。?. はnullのとき処理をスキップし、?: はnullのときの代替値を指定します。"
  },
  { id:6, unit:"UNIT 02  ◆  型と制御フロー", rank:"BRONZE",
    title:"if式",
    question:"x = 15 として、x が 10 より大きければ \"big\"、そうでなければ \"small\" を if 式を使って変数に代入して出力してください。",
    hint:"Kotlinの if は式（値を返す）として使えます。",
    answer:`fun main() {\n    val x = 15\n    val result = if (x > 10) "big" else "small"\n    println(result)\n}`,
    expected:"big",
    explanation:"Kotlinの if は式として使えます。三項演算子がない代わりに if-else が値を返します。"
  },
  { id:7, unit:"UNIT 02  ◆  型と制御フロー", rank:"BRONZE",
    title:"when式",
    question:"score = 75 として、80以上なら \"A\"、60以上なら \"B\"、それ以外は \"C\" を when 式で変数に代入して出力してください。",
    hint:"when { 条件 -> 値 } の形で書きます。",
    answer:`fun main() {\n    val score = 75\n    val grade = when {\n        score >= 80 -> "A"\n        score >= 60 -> "B"\n        else -> "C"\n    }\n    println(grade)\n}`,
    expected:"B",
    explanation:"when はKotlinの多分岐式です。switch文より強力で、条件式、型チェックなど様々なパターンで使えます。"
  },
  { id:8, unit:"UNIT 02  ◆  型と制御フロー", rank:"BRONZE",
    title:"for ループと範囲",
    question:"1..5 の範囲を for でループして各値を出力してください。",
    hint:"for (i in 1..5) の形で書きます。",
    answer:`fun main() {\n    for (i in 1..5) {\n        println(i)\n    }\n}`,
    expected:"1\n2\n3\n4\n5",
    explanation:".. で範囲（Range）を作れます。1..5 は1から5まで（両端含む）です。downTo で降順、step でステップ数を指定できます。"
  },
  // UNIT 03 関数 SILVER
  { id:9, unit:"UNIT 03  ◆  関数", rank:"SILVER",
    title:"関数と単一式関数",
    question:"2つの Int を受け取り合計を返す add 関数を通常形式と単一式形式の2通りで定義し、add(3, 4) を出力してください。",
    hint:"fun 名前(引数: 型): 戻り値型 = 式 の形で単一式関数を書けます。",
    answer:`fun add(a: Int, b: Int): Int = a + b\n\nfun main() {\n    println(add(3, 4))\n}`,
    expected:"7",
    explanation:"単一式関数は { return 式 } を = 式 と書けます。戻り値型は推論できる場合省略可能です。"
  },
  { id:10, unit:"UNIT 03  ◆  関数", rank:"SILVER",
    title:"デフォルト引数と名前付き引数",
    question:"name: String と greeting: String = \"Hello\" を受け取る greet 関数を定義し、greet(\"Taro\") と greet(\"Hanako\", greeting = \"Hi\") を出力してください。",
    hint:"引数 = 値 でデフォルト値を設定します。呼び出し時に名前付き引数が使えます。",
    answer:`fun greet(name: String, greeting: String = "Hello"): String = "\$greeting, \$name!"\n\nfun main() {\n    println(greet("Taro"))\n    println(greet("Hanako", greeting = "Hi"))\n}`,
    expected:"Hello, Taro!\nHi, Hanako!",
    explanation:"デフォルト引数でオーバーロードを減らせます。名前付き引数で可読性が上がり、引数の順番を変えて渡すこともできます。"
  },
  { id:11, unit:"UNIT 03  ◆  関数", rank:"SILVER",
    title:"拡張関数",
    question:"String に shout() 拡張関数を追加してください。shout() は文字列を大文字にして末尾に \"!!!\" を付けて返します。\"hello\".shout() を出力してください。",
    hint:"fun 型名.関数名(): 戻り値型 = ... の形で拡張関数を定義します。",
    answer:`fun String.shout(): String = this.uppercase() + "!!!"\n\nfun main() {\n    println("hello".shout())\n}`,
    expected:"HELLO!!!",
    explanation:"拡張関数はクラスを変更せずにメソッドを追加できます。既存クラスへの機能追加に便利です。"
  },
  { id:12, unit:"UNIT 03  ◆  関数", rank:"SILVER",
    title:"vararg（可変長引数）",
    question:"可変長の Int を受け取り合計を返す sum 関数を vararg を使って定義し、sum(1, 2, 3, 4, 5) を出力してください。",
    hint:"vararg numbers: Int で複数の引数をまとめて受け取れます。",
    answer:`fun sum(vararg numbers: Int): Int = numbers.sum()\n\nfun main() {\n    println(sum(1, 2, 3, 4, 5))\n}`,
    expected:"15",
    explanation:"vararg で可変長引数を受け取れます。関数内では配列として扱えます。* でスプレッド演算子として配列を展開して渡すこともできます。"
  },
  { id:13, unit:"UNIT 03  ◆  関数", rank:"SILVER",
    title:"ラムダ式の基礎",
    question:"(Int) -> Int 型のラムダ double を { n -> n * 2 } で定義して double(5) を出力し、listOf(1,2,3) を forEach で出力してください。",
    hint:"val 変数名: (型) -> 戻り値型 = { 引数 -> 式 } の形で書きます。",
    answer:`fun main() {\n    val double: (Int) -> Int = { n -> n * 2 }\n    println(double(5))\n    listOf(1, 2, 3).forEach { println(it) }\n}`,
    expected:"10\n1\n2\n3",
    explanation:"ラムダ式はKotlinの関数型プログラミングの基本です。引数が1つのときは it で参照できます。"
  },
  // UNIT 04 コレクション GOLD
  { id:14, unit:"UNIT 04  ◆  コレクション", rank:"GOLD",
    title:"listOf と基本操作",
    question:"listOf(3, 1, 4, 1, 5, 9) を sorted() で並べ替えた結果、size、contains(5) を出力してください。",
    hint:"sorted() は新しいリストを返します。",
    answer:`fun main() {\n    val nums = listOf(3, 1, 4, 1, 5, 9)\n    println(nums.sorted())\n    println(nums.size)\n    println(nums.contains(5))\n}`,
    expected:"[1, 1, 3, 4, 5, 9]\n6\ntrue",
    explanation:"listOf は不変リストを作ります。変更可能なリストは mutableListOf() です。sorted() は昇順ソートした新しいリストを返します。"
  },
  { id:15, unit:"UNIT 04  ◆  コレクション", rank:"GOLD",
    title:"map と filter",
    question:"listOf(1,2,3,4,5) から filter で偶数のみ、map で各要素の2乗を取り出してそれぞれ出力してください。",
    hint:"filter { 条件 } と map { 変換 } を使います。",
    answer:`fun main() {\n    val nums = listOf(1, 2, 3, 4, 5)\n    println(nums.filter { it % 2 == 0 })\n    println(nums.map { it * it })\n}`,
    expected:"[2, 4]\n[1, 4, 9, 16, 25]",
    explanation:"filter は条件に合う要素、map は変換した要素を集めた新しいリストを返します。メソッドチェーンで組み合わせられます。"
  },
  { id:16, unit:"UNIT 04  ◆  コレクション", rank:"GOLD",
    title:"sum と fold",
    question:"listOf(1,2,3,4,5) の合計を sum()、積を fold(1) { acc, n -> acc * n } で計算して出力してください。",
    hint:"fold(初期値) { 累計, 要素 -> 演算 } の形で書きます。",
    answer:`fun main() {\n    val nums = listOf(1, 2, 3, 4, 5)\n    println(nums.sum())\n    println(nums.fold(1) { acc, n -> acc * n })\n}`,
    expected:"15\n120",
    explanation:"sum() は合計を返します。fold は初期値から始めて各要素を畳み込みます。reduce は初期値なし版です。"
  },
  { id:17, unit:"UNIT 04  ◆  コレクション", rank:"GOLD",
    title:"mapOf",
    question:"mapOf(\"Taro\" to 85, \"Hanako\" to 92, \"Ken\" to 78) を forEach で \"名前: 点数\" の形式で出力してください。",
    hint:"forEach { (key, value) -> ... } の形で分割できます。",
    answer:`fun main() {\n    val scores = mapOf("Taro" to 85, "Hanako" to 92, "Ken" to 78)\n    scores.forEach { (name, score) -> println("\$name: \$score") }\n}`,
    expected:"Taro: 85\nHanako: 92\nKen: 78",
    explanation:"mapOf で不変のMapを作れます。to で infix記法のPairを作ります。forEach のラムダで分割代入が使えます。"
  },
  { id:18, unit:"UNIT 04  ◆  コレクション", rank:"GOLD",
    title:"クラスとコンストラクタ",
    question:"name: String と age: Int を持つ Person クラスを定義し、introduce() メソッドで \"私はTaro、20歳です\" と出力してください。",
    hint:"class クラス名(val プロパティ: 型) でプライマリコンストラクタを定義できます。",
    answer:`class Person(val name: String, val age: Int) {\n    fun introduce(): String = "私は\${name}、\${age}歳です"\n}\n\nfun main() {\n    val p = Person("Taro", 20)\n    println(p.introduce())\n}`,
    expected:"私はTaro、20歳です",
    explanation:"プライマリコンストラクタの引数に val/var をつけると自動的にプロパティになります。"
  },
  { id:19, unit:"UNIT 04  ◆  コレクション", rank:"GOLD",
    title:"data class",
    question:"data class Point(val x: Int, val y: Int) を定義し、Point(3,4) を作成して出力し、copy(y=10) で複製して出力してください。",
    hint:"data class は toString、equals、copy などを自動生成します。",
    answer:`data class Point(val x: Int, val y: Int)\n\nfun main() {\n    val p1 = Point(3, 4)\n    val p2 = p1.copy(y = 10)\n    println(p1)\n    println(p2)\n}`,
    expected:"Point(x=3, y=4)\nPoint(x=3, y=10)",
    explanation:"data class はtoString、equals、hashCode、copy、componentN を自動生成します。値オブジェクトに最適です。"
  },
  // UNIT 05 継承とインターフェース PLATINUM
  { id:20, unit:"UNIT 05  ◆  継承とインターフェース", rank:"PLATINUM",
    title:"継承（open class）",
    question:"open class Animal(val name: String) と sound(): String を定義し、Dog クラスで sound() を \"Woof\" にオーバーライドして \"Rex: Woof\" と出力してください。",
    hint:"Kotlinのクラスはデフォルトで final です。継承を許可するには open が必要です。",
    answer:`open class Animal(val name: String) {\n    open fun sound(): String = "..."\n}\n\nclass Dog(name: String) : Animal(name) {\n    override fun sound(): String = "Woof"\n}\n\nfun main() {\n    val d = Dog("Rex")\n    println("\${d.name}: \${d.sound()}")\n}`,
    expected:"Rex: Woof",
    explanation:"Kotlinのクラスはデフォルトで継承不可（final）です。open をつけることで継承・オーバーライドが可能になります。"
  },
  { id:21, unit:"UNIT 05  ◆  継承とインターフェース", rank:"PLATINUM",
    title:"abstract class",
    question:"abstract class Shape と abstract fun area(): Double を定義し、Circle(r: Double) で area() を実装（π×r²）して、Circle(5.0).area() を小数点2桁で出力してください。",
    hint:"String.format(\"%.2f\", 値) で小数点桁数を指定できます。",
    answer:`abstract class Shape {\n    abstract fun area(): Double\n}\n\nclass Circle(val r: Double) : Shape() {\n    override fun area(): Double = Math.PI * r * r\n}\n\nfun main() {\n    val c = Circle(5.0)\n    println(String.format("%.2f", c.area()))\n}`,
    expected:"78.54",
    explanation:"abstract class は直接インスタンス化できません。abstract メソッドはサブクラスで必ず実装が必要です。"
  },
  { id:22, unit:"UNIT 05  ◆  継承とインターフェース", rank:"PLATINUM",
    title:"interface の実装",
    question:"greet(): String を持つ Greeter インターフェースを定義し、JapaneseGreeter で \"こんにちは\" を返すよう実装して出力してください。",
    hint:"class クラス名 : インターフェース名 の形で実装します。",
    answer:`interface Greeter {\n    fun greet(): String\n}\n\nclass JapaneseGreeter : Greeter {\n    override fun greet(): String = "こんにちは"\n}\n\nfun main() {\n    val g: Greeter = JapaneseGreeter()\n    println(g.greet())\n}`,
    expected:"こんにちは",
    explanation:"Kotlinのインターフェースはデフォルト実装を持てます。クラスは複数のインターフェースを実装できます。"
  },
  { id:23, unit:"UNIT 05  ◆  継承とインターフェース", rank:"PLATINUM",
    title:"companion object",
    question:"Counter クラスに companion object を追加し、increment() と getCount() を実装してください。increment() を3回呼んで getCount() を出力してください。",
    hint:"companion object はクラスに紐づくシングルトンです。クラス名.メソッド名() で呼べます。",
    answer:`class Counter {\n    companion object {\n        private var count = 0\n        fun increment() = ++count\n        fun getCount() = count\n    }\n}\n\nfun main() {\n    Counter.increment()\n    Counter.increment()\n    Counter.increment()\n    println(Counter.getCount())\n}`,
    expected:"3",
    explanation:"companion object はJavaのstaticに相当します。ファクトリーメソッドや定数の定義によく使われます。"
  },
  // UNIT 06 シールドクラスと型システム DIAMOND
  { id:24, unit:"UNIT 06  ◆  シールドクラスと型システム", rank:"DIAMOND",
    title:"enum class",
    question:"NORTH、SOUTH、EAST、WEST を持つ Direction enum class を定義し、NORTH の名前と ordinal を出力してください。",
    hint:"enum の各値は name と ordinal プロパティを持ちます。",
    answer:`enum class Direction {\n    NORTH, SOUTH, EAST, WEST\n}\n\nfun main() {\n    val d = Direction.NORTH\n    println(d)\n    println(d.ordinal)\n}`,
    expected:"NORTH\n0",
    explanation:"enum class で列挙型を定義します。name は名前文字列、ordinal は0始まりの序数です。when 式と組み合わせると強力です。"
  },
  { id:25, unit:"UNIT 06  ◆  シールドクラスと型システム", rank:"DIAMOND",
    title:"sealed class",
    question:"sealed class Result と data class Success(val data: String)、data class Failure(val msg: String) を定義し、handle(r: Result) 関数で when を使って分岐、Success と Failure それぞれを出力してください。",
    hint:"is でシールドクラスのサブクラスを判定します。",
    answer:`sealed class Result\ndata class Success(val data: String) : Result()\ndata class Failure(val msg: String) : Result()\n\nfun handle(r: Result): String = when (r) {\n    is Success -> "成功: \${r.data}"\n    is Failure -> "失敗: \${r.msg}"\n}\n\nfun main() {\n    println(handle(Success("OK")))\n    println(handle(Failure("Not Found")))\n}`,
    expected:"成功: OK\n失敗: Not Found",
    explanation:"sealed class は限られたサブクラスしか持てないクラスです。when との組み合わせでelse不要になり、全パターン網羅をコンパイル時に確認できます。"
  },
  { id:26, unit:"UNIT 06  ◆  シールドクラスと型システム", rank:"DIAMOND",
    title:"ジェネリクス",
    question:"ジェネリッククラス Box<T>(val value: T) を定義して get(): T を実装し、Box(42).get() と Box(\"Hello\").get() を出力してください。",
    hint:"class クラス名<T>(val value: T) の形で型パラメータを宣言します。",
    answer:`class Box<T>(val value: T) {\n    fun get(): T = value\n}\n\nfun main() {\n    val intBox = Box(42)\n    val strBox = Box("Hello")\n    println(intBox.get())\n    println(strBox.get())\n}`,
    expected:"42\nHello",
    explanation:"ジェネリクスで型安全な汎用クラスを作れます。呼び出し時に型引数を推論できる場合は省略可能です。"
  },
  { id:27, unit:"UNIT 06  ◆  シールドクラスと型システム", rank:"DIAMOND",
    title:"object（シングルトン）",
    question:"object Logger を定義し、log(msg: String) でリストに追加、printAll() で全メッセージを出力するメソッドを実装してください。\"Start\"、\"Processing\"、\"Done\" をログに追加して出力してください。",
    hint:"object キーワードで直接シングルトンオブジェクトを作れます。",
    answer:`object Logger {\n    private val logs = mutableListOf<String>()\n    fun log(msg: String) { logs.add(msg) }\n    fun printAll() { logs.forEach { println(it) } }\n}\n\nfun main() {\n    Logger.log("Start")\n    Logger.log("Processing")\n    Logger.log("Done")\n    Logger.printAll()\n}`,
    expected:"Start\nProcessing\nDone",
    explanation:"object でシングルトンを簡潔に定義できます。クラスのインスタンス化なしに直接使えます。"
  },
  // UNIT 07 高度なKotlin MASTER/LEGEND
  { id:28, unit:"UNIT 07  ◆  高度なKotlin", rank:"MASTER",
    title:"演算子オーバーロード",
    question:"data class Vector(val x: Int, val y: Int) を定義し、operator fun plus で加算、operator fun times で整数倍を実装してください。Vector(1,2) + Vector(3,4) と Vector(1,2) * 3 を出力してください。",
    hint:"operator fun plus(other: Vector) でベクトル加算を定義します。",
    answer:`data class Vector(val x: Int, val y: Int) {\n    operator fun plus(other: Vector) = Vector(x + other.x, y + other.y)\n    operator fun times(n: Int) = Vector(x * n, y * n)\n}\n\nfun main() {\n    val v1 = Vector(1, 2)\n    val v2 = Vector(3, 4)\n    println(v1 + v2)\n    println(v1 * 3)\n}`,
    expected:"Vector(x=4, y=6)\nVector(x=3, y=6)",
    explanation:"operator キーワードで演算子をオーバーロードできます。data classと組み合わせると自動的に見やすいtoStringも生成されます。"
  },
  { id:29, unit:"UNIT 07  ◆  高度なKotlin", rank:"MASTER",
    title:"by lazy（委譲プロパティ）",
    question:"connection プロパティを by lazy で定義した DatabaseConnection クラスを作ってください。lazy内で \"接続中...\" を出力し \"Connected to DB\" を返します。オブジェクト作成後、connection を2回アクセスして出力してください。",
    hint:"val prop: 型 by lazy { 計算 } の形で遅延初期化できます。",
    answer:`class DatabaseConnection {\n    val connection: String by lazy {\n        println("接続中...")\n        "Connected to DB"\n    }\n}\n\nfun main() {\n    val db = DatabaseConnection()\n    println("オブジェクト作成")\n    println(db.connection)\n    println(db.connection)\n}`,
    expected:"オブジェクト作成\n接続中...\nConnected to DB\nConnected to DB",
    explanation:"by lazy で遅延初期化ができます。初回アクセス時にのみ計算され、以降はキャッシュされた値を返します。スレッドセーフです。"
  },
  { id:30, unit:"UNIT 07  ◆  高度なKotlin", rank:"LEGEND",
    title:"DSL（型安全なビルダー）",
    question:"HtmlBuilder クラスと html { } 関数を使ったDSLを実装してください。tag(name, content) でHTMLタグを追加し、html { tag(\"h1\", \"Kotlin DSL\"); tag(\"p\", \"型安全\"); tag(\"p\", \"Lambda with Receiver\") } の結果を出力してください。",
    hint:"fun html(block: HtmlBuilder.() -> Unit): String は「レシーバー付きラムダ」を使ったDSLパターンです。",
    answer:`class HtmlBuilder {\n    private val tags = mutableListOf<String>()\n    fun tag(name: String, content: String) {\n        tags.add("<\$name>\$content</\$name>")\n    }\n    fun build() = tags.joinToString("\\n")\n}\n\nfun html(block: HtmlBuilder.() -> Unit): String {\n    val builder = HtmlBuilder()\n    builder.block()\n    return builder.build()\n}\n\nfun main() {\n    val page = html {\n        tag("h1", "Kotlin DSL")\n        tag("p", "型安全")\n        tag("p", "Lambda with Receiver")\n    }\n    println(page)\n}`,
    expected:"<h1>Kotlin DSL</h1>\n<p>型安全</p>\n<p>Lambda with Receiver</p>",
    explanation:"レシーバー付きラムダ（T.() -> Unit）はDSL構築の核心です。ブロック内でレシーバーのメソッドを直接呼べます。Kotlin の Jetpack Compose や Ktor などもこのパターンを多用します。"
  },
];

const kotlinMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "型安全FizzBuzz",
    description: "when式を使ったKotlinらしいFizzBuzzを実装する。",
    requirements: [
      "fizzBuzz(n: Int): String 関数を定義",
      "when { 条件 -> 値 } の形で実装",
      "1から20まで出力"
    ],
    hint: "n % 15 == 0 の判定を最初に行います。",
    answer:
`fun fizzBuzz(n: Int): String = when {
    n % 15 == 0 -> "FizzBuzz"
    n % 3 == 0 -> "Fizz"
    n % 5 == 0 -> "Buzz"
    else -> n.toString()
}

fun main() {
    (1..20).forEach { println(fizzBuzz(it)) }
}`
  },
  {
    id: 2, rank: "BRONZE",
    title: "コレクション集計",
    description: "Kotlinのコレクション関数を使って成績の統計を計算する。",
    requirements: [
      "scores = listOf(75, 88, 92, 60, 71) を使う",
      "average() で平均（小数点1桁）を出力",
      "max() で最高点を出力",
      "count { it >= 70 } で合格者数を出力"
    ],
    hint: "\"%.1f\".format(avg) で小数点1桁のフォーマットができます。",
    answer:
`fun main() {
    val scores = listOf(75, 88, 92, 60, 71)
    val avg = scores.average()
    val max = scores.max()
    val passing = scores.count { it >= 70 }
    println("平均: \${"%.1f".format(avg)}")
    println("最高: $max")
    println("合格者: $passing")
}`
  },
  {
    id: 3, rank: "SILVER",
    title: "data classで図書管理",
    description: "data classとコレクション操作を組み合わせて図書管理システムを作る。",
    requirements: [
      "data class Book(val title: String, val author: String, val year: Int) を定義",
      "3冊以上のリストを作成",
      "sortedByDescending { it.year } で新しい順に出力",
      "find で特定著者の本を検索して出力"
    ],
    hint: "?.title ?: \"見つかりません\" でnull安全に処理できます。",
    answer:
`data class Book(val title: String, val author: String, val year: Int)

fun main() {
    val books = listOf(
        Book("Kotlin in Action", "Dmitry", 2017),
        Book("Clean Code", "Robert", 2008),
        Book("Effective Kotlin", "Marcin", 2021)
    )
    println("=== 新しい順 ===")
    books.sortedByDescending { it.year }.forEach { println("\${it.title} (\${it.year})") }
    println("=== 著者検索 ===")
    val found = books.find { it.author == "Robert" }
    println(found?.title ?: "見つかりません")
}`
  },
  {
    id: 4, rank: "SILVER",
    title: "sealed classで式ツリー",
    description: "sealed classとwhenの再帰的な組み合わせで数式を評価する。",
    requirements: [
      "sealed class Expr を定義",
      "Num(value: Double)、Add(left, right)、Mul(left, right) サブクラスを定義",
      "eval(expr: Expr): Double を再帰的に実装",
      "(2 + 3) * 4 を表す式ツリーを作って評価して出力"
    ],
    hint: "eval を再帰呼び出しします。when (expr) { is Num -> ... } の形で分岐します。",
    answer:
`sealed class Expr
data class Num(val value: Double) : Expr()
data class Add(val left: Expr, val right: Expr) : Expr()
data class Mul(val left: Expr, val right: Expr) : Expr()

fun eval(expr: Expr): Double = when (expr) {
    is Num -> expr.value
    is Add -> eval(expr.left) + eval(expr.right)
    is Mul -> eval(expr.left) * eval(expr.right)
}

fun main() {
    val expr = Mul(Add(Num(2.0), Num(3.0)), Num(4.0))
    println(eval(expr))
}`
  },
  {
    id: 5, rank: "GOLD",
    title: "ジェネリックなスタック",
    description: "ジェネリクスを使った型安全なスタックを実装する。",
    requirements: [
      "class Stack<T> を定義",
      "push(item: T)、pop(): T?、peek(): T?、size プロパティ、isEmpty() を実装",
      "Stack<Int> で3つpushして動作確認",
      "peek、pop、size を順に出力"
    ],
    hint: "mutableListOf<T>() で内部リストを管理します。",
    answer:
`class Stack<T> {
    private val items = mutableListOf<T>()
    fun push(item: T) { items.add(item) }
    fun pop(): T? = if (items.isEmpty()) null else items.removeAt(items.lastIndex)
    fun peek(): T? = items.lastOrNull()
    val size get() = items.size
    fun isEmpty() = items.isEmpty()
}

fun main() {
    val stack = Stack<Int>()
    stack.push(10); stack.push(20); stack.push(30)
    println("サイズ: \${stack.size}")
    println("top: \${stack.peek()}")
    println("pop: \${stack.pop()}")
    println("pop: \${stack.pop()}")
    println("サイズ: \${stack.size}")
}`
  },
  {
    id: 6, rank: "GOLD",
    title: "型安全なHTMLビルダー",
    description: "レシーバー付きラムダを使ったKotlin DSLでHTMLを構築する。",
    requirements: [
      "HtmlBuilder クラスを定義（tag メソッドと build メソッド）",
      "fun html(block: HtmlBuilder.() -> Unit): String 関数を定義",
      "h1、p×2 の3タグを持つHTMLを構築して出力",
      "タグは <name>content</name> 形式"
    ],
    hint: "builder.block() でレシーバー付きラムダを実行します。",
    answer:
`class HtmlBuilder {
    private val tags = mutableListOf<String>()
    fun tag(name: String, content: String) {
        tags.add("<\$name>\$content</\$name>")
    }
    fun build() = tags.joinToString("\n")
}

fun html(block: HtmlBuilder.() -> Unit): String {
    val b = HtmlBuilder()
    b.block()
    return b.build()
}

fun main() {
    val page = html {
        tag("h1", "Kotlin DSL")
        tag("p", "型安全な構築")
        tag("p", "Lambda with Receiver")
    }
    println(page)
}`
  },
];

const kotlinUnitGuides = [
  {
    id: "kotlin-unit01",
    unit: "UNIT 01", title: "基礎出力と変数",
    summary: "Kotlinのエントリーポイント、val/var、文字列テンプレートを学ぶ。",
    points: [
      "エントリーポイントは fun main() {}",
      "val は不変、var は可変",
      "文字列テンプレートで $変数 や ${式} を埋め込める",
      "型推論により多くの場合型アノテーションは省略可能"
    ],
    words: [
      { term: "val", desc: "再代入不可の変数（immutable）" },
      { term: "var", desc: "再代入可能の変数（mutable）" },
      { term: "println()", desc: "改行付きで出力する関数" }
    ]
  },
  {
    id: "kotlin-unit02",
    unit: "UNIT 02", title: "型と制御フロー",
    summary: "基本型、null安全、if/when式、forループを学ぶ。",
    points: [
      "基本型は Int、Double、String、Boolean（大文字始まり）",
      "? 付き型のみnullを格納できる",
      "if と when は式として値を返せる",
      "1..5 で範囲を作れる"
    ],
    words: [
      { term: "?.", desc: "safe call: nullなら処理をスキップする演算子" },
      { term: "?:", desc: "Elvis演算子: nullなら右の値を使う" },
      { term: "when", desc: "多分岐式。switchより強力" }
    ]
  },
  {
    id: "kotlin-unit03",
    unit: "UNIT 03", title: "関数",
    summary: "関数定義、拡張関数、vararg、ラムダ式を学ぶ。",
    points: [
      "単一式関数は = で簡潔に書ける",
      "デフォルト引数と名前付き引数でオーバーロードを減らす",
      "拡張関数で既存クラスにメソッドを追加",
      "ラムダ式は (型) -> 戻り値型 の関数型オブジェクト"
    ],
    words: [
      { term: "拡張関数", desc: "既存クラスを継承せずにメソッドを追加する機能" },
      { term: "vararg", desc: "可変長引数。複数の値を受け取れる" },
      { term: "it", desc: "ラムダ式で引数が1つのときの省略記法" }
    ]
  },
  {
    id: "kotlin-unit04",
    unit: "UNIT 04", title: "コレクション",
    summary: "listOf、map/filter、fold、mapOf などの コレクション操作を学ぶ。",
    points: [
      "listOf は不変、mutableListOf は可変",
      "filter/map/fold でFunctional styleに処理",
      "mapOf で不変のMapを作成",
      "to で infix記法のPairを作れる"
    ],
    words: [
      { term: "filter", desc: "条件に合う要素のみを集めた新しいリストを返す" },
      { term: "map", desc: "各要素を変換した新しいリストを返す" },
      { term: "fold", desc: "初期値から各要素を畳み込む" }
    ]
  },
  {
    id: "kotlin-unit05",
    unit: "UNIT 05", title: "継承とインターフェース",
    summary: "open class、data class、abstract、interface、companion objectを学ぶ。",
    points: [
      "クラスはデフォルトfinal。open で継承を許可",
      "data class はtoString/equals/copy を自動生成",
      "interface はデフォルト実装を持てる",
      "companion object はJavaのstaticに相当"
    ],
    words: [
      { term: "open", desc: "継承・オーバーライドを許可するキーワード" },
      { term: "data class", desc: "値オブジェクト向けに便利メソッドを自動生成するクラス" },
      { term: "companion object", desc: "クラスに属するシングルトンオブジェクト" }
    ]
  },
  {
    id: "kotlin-unit06",
    unit: "UNIT 06", title: "シールドクラスと型システム",
    summary: "enum class、sealed class、ジェネリクス、object を学ぶ。",
    points: [
      "enum class で列挙型を定義",
      "sealed class + when で全パターン網羅をコンパイル時確認",
      "ジェネリクスで型安全な汎用クラスを作成",
      "object でシングルトンを簡潔に定義"
    ],
    words: [
      { term: "sealed class", desc: "限られたサブクラスしか持てないクラス" },
      { term: "is", desc: "型チェックと自動キャストを行う演算子" },
      { term: "object", desc: "直接シングルトンインスタンスを定義するキーワード" }
    ]
  },
  {
    id: "kotlin-unit07",
    unit: "UNIT 07", title: "高度なKotlin",
    summary: "演算子オーバーロード、委譲プロパティ、DSLパターンを学ぶ。",
    points: [
      "operator fun で演算子をオーバーロード",
      "by lazy で遅延初期化（初回アクセス時のみ計算）",
      "レシーバー付きラムダ（T.() -> Unit）でDSLを構築",
      "Jetpack Compose / Ktor などがこのパターンを多用"
    ],
    words: [
      { term: "operator", desc: "演算子オーバーロードを宣言するキーワード" },
      { term: "by lazy", desc: "初回アクセス時に初期化する委譲プロパティ" },
      { term: "レシーバー付きラムダ", desc: "ラムダ内でレシーバーのメソッドを直接呼べる関数型" }
    ]
  }
];

// ===== Swift データ =====

const swiftProblems = [
  {
    id: 1, rank: "ROOKIE", unit: "UNIT 01",
    title: "Hello, Swift!",
    description: "Swiftで最初のプログラムを書こう。",
    question: "\"Hello, Swift!\" と出力してください。",
    requirements: ["print() 関数を使う"],
    hint: "print(\"文字列\") で出力できます。",
    answer: `print("Hello, Swift!")`
  },
  {
    id: 2, rank: "ROOKIE", unit: "UNIT 01",
    title: "変数と定数",
    description: "letで定数、varで変数を宣言しよう。",
    question: "定数 name に \"Swift\"、変数 ver に 5 を代入し、\"Swift 5\" と出力してください。",
    requirements: ["let で定数を宣言", "var で変数を宣言", "文字列補間で出力"],
    hint: "文字列補間は \\(変数名) を使います。",
    answer: `let name = "Swift"
var ver = 5
print("\\(name) \\(ver)")`
  },
  {
    id: 3, rank: "ROOKIE", unit: "UNIT 01",
    title: "文字列補間",
    description: "文字列補間で変数を埋め込もう。",
    question: "定数 item に \"MacBook\"、price に 198000 を代入し、\"MacBookの価格は198000円です\" と出力してください。",
    requirements: ["let で定数を宣言", "文字列補間を使う"],
    hint: "\"\\(item)の価格は\\(price)円です\" のように書きます。",
    answer: `let item = "MacBook"
let price = 198000
print("\\(item)の価格は\\(price)円です")`
  },
  {
    id: 4, rank: "ROOKIE", unit: "UNIT 01",
    title: "基本演算",
    description: "四則演算と剰余演算を使おう。",
    question: "a=17, b=5 として、a+b, a-b, a*b, a/b, a%b をそれぞれ改行して出力してください。",
    requirements: ["let で定数を宣言", "+, -, *, /, % を使う", "各結果を改行して出力"],
    hint: "Swiftでは整数同士の / は整数除算になります。",
    answer: `let a = 17
let b = 5
print(a + b)
print(a - b)
print(a * b)
print(a / b)
print(a % b)`
  },
  {
    id: 5, rank: "ROOKIE", unit: "UNIT 02",
    title: "型変換",
    description: "型変換とDouble演算を使おう。",
    question: "Int型の x=7 を Double に変換して 3.14 を掛け、小数点2桁で出力してください。",
    requirements: ["Double() で型変換", "String(format:) で書式指定"],
    hint: "String(format: \"%.2f\", 値) で小数点桁数を指定できます。",
    answer: `let x: Int = 7
let y = Double(x) * 3.14
print(String(format: "%.2f", y))`
  },
  {
    id: 6, rank: "ROOKIE", unit: "UNIT 02",
    title: "三項演算子",
    description: "条件式を使って値を決めよう。",
    question: "score=72 として、60以上なら \"合格\"、未満なら \"不合格\" を出力してください。",
    requirements: ["三項演算子 ? : を使う"],
    hint: "条件 ? 真の値 : 偽の値 という形です。",
    answer: `let score = 72
let result = score >= 60 ? "合格" : "不合格"
print(result)`
  },
  {
    id: 7, rank: "ROOKIE", unit: "UNIT 02",
    title: "タプル",
    description: "タプルで複数の値をまとめよう。",
    question: "名前付きタプル (x: 3, y: 4) を作り、\"(3, 4)\" と出力してください。",
    requirements: ["名前付きタプルを使う", "タプルの要素にアクセス"],
    hint: "point.x のようにラベルでアクセスできます。",
    answer: `let point = (x: 3, y: 4)
print("(\\(point.x), \\(point.y))")`
  },
  {
    id: 8, rank: "ROOKIE", unit: "UNIT 02",
    title: "範囲演算子",
    description: "範囲演算子でループしよう。",
    question: "1 から 5 まで順番に出力してください。",
    requirements: ["閉じた範囲演算子 ... を使う", "for-in ループを使う"],
    hint: "for i in 1...5 という形です。",
    answer: `for i in 1...5 {
    print(i)
}`
  },
  {
    id: 9, rank: "BRONZE", unit: "UNIT 03",
    title: "if-else",
    description: "条件分岐で体温を判定しよう。",
    question: "temp=38 として、37以上なら \"発熱\"、36以上なら \"平熱\"、それ以外は \"低体温\" と出力してください。",
    requirements: ["if / else if / else を使う"],
    hint: "条件は温度 >= 37 のように書きます。",
    answer: `let temp = 38
if temp >= 37 {
    print("発熱")
} else if temp >= 36 {
    print("平熱")
} else {
    print("低体温")
}`
  },
  {
    id: 10, rank: "BRONZE", unit: "UNIT 03",
    title: "for-in ループ",
    description: "ループで九九の一部を出力しよう。",
    question: "1 から 9 まで、\"i × 7 = 結果\" の形式で出力してください。",
    requirements: ["for-in ループを使う", "文字列補間を使う"],
    hint: "for i in 1...9 { print(\"\\(i) × 7 = \\(i*7)\") }",
    answer: `for i in 1...9 {
    print("\\(i) × 7 = \\(i * 7)")
}`
  },
  {
    id: 11, rank: "BRONZE", unit: "UNIT 03",
    title: "while ループ",
    description: "while でループしよう。",
    question: "n=1 から始めて、1000 未満の間 3 倍し続けた最終値を出力してください。",
    requirements: ["while ループを使う", "var で変数を宣言"],
    hint: "while n < 1000 { n *= 3 } のあとに print(n)。",
    answer: `var n = 1
while n < 1000 {
    n *= 3
}
print(n)`
  },
  {
    id: 12, rank: "BRONZE", unit: "UNIT 03",
    title: "switch",
    description: "switch文で言語名を判定しよう。",
    question: "lang=\"Swift\" として、\"Swift\" なら \"Apple製\"、\"Kotlin\" なら \"JetBrains製\"、その他は \"その他\" と出力してください。",
    requirements: ["switch 文を使う", "default ケースを用意"],
    hint: "case \"Swift\": print(\"Apple製\") という形です。",
    answer: `let lang = "Swift"
switch lang {
case "Swift":
    print("Apple製")
case "Kotlin":
    print("JetBrains製")
default:
    print("その他")
}`
  },
  {
    id: 13, rank: "BRONZE", unit: "UNIT 03",
    title: "guard",
    description: "guard でゼロ除算を防ごう。",
    question: "divide(_:by:) 関数を定義し、b=0 のとき \"ゼロ除算\" を出力して早期リターンしてください。divide(10, by: 2) と divide(5, by: 0) を呼び出してください。",
    requirements: ["guard 文を使う", "早期リターン（return）を使う"],
    hint: "guard b != 0 else { print(\"ゼロ除算\"); return }",
    answer: `func divide(_ a: Int, by b: Int) {
    guard b != 0 else {
        print("ゼロ除算")
        return
    }
    print(a / b)
}
divide(10, by: 2)
divide(5, by: 0)`
  },
  {
    id: 14, rank: "BRONZE", unit: "UNIT 04",
    title: "Array",
    description: "配列の基本操作を学ぼう。",
    question: "[\"red\", \"green\", \"blue\"] に \"yellow\" を追加し、要素数と最初の要素を出力してください。",
    requirements: ["var で配列を宣言", "append() で要素追加", ".count で要素数取得"],
    hint: "colors.append(\"yellow\") のあとに colors.count と colors[0] を出力。",
    answer: `var colors = ["red", "green", "blue"]
colors.append("yellow")
print(colors.count)
print(colors[0])`
  },
  {
    id: 15, rank: "BRONZE", unit: "UNIT 04",
    title: "Dictionary",
    description: "辞書の基本操作を学ぼう。",
    question: "国と首都の辞書を作り、\"Japan\" の値を出力し、\"Italy\":\"Rome\" を追加して要素数を出力してください。",
    requirements: ["var で辞書を宣言", "! でオプショナルを強制アンラップ", ".count で要素数取得"],
    hint: "cap[\"Japan\"]! で強制アンラップできます。",
    answer: `var cap = ["Japan": "Tokyo", "France": "Paris", "Germany": "Berlin"]
print(cap["Japan"]!)
cap["Italy"] = "Rome"
print(cap.count)`
  },
  {
    id: 16, rank: "BRONZE", unit: "UNIT 04",
    title: "Set",
    description: "セットの基本操作を学ぼう。",
    question: "Set に \"swift\", \"ios\", \"xcode\" を入れ、\"apple\" を追加し、\"swift\" が含まれるか確認し、要素数を出力してください。",
    requirements: ["Set<String> または型アノテーション付きで宣言", "insert() で追加", "contains() で確認"],
    hint: "var tags: Set = [\"swift\", \"ios\", \"xcode\"] のように宣言。",
    answer: `var tags: Set = ["swift", "ios", "xcode"]
tags.insert("apple")
print(tags.contains("swift"))
print(tags.count)`
  },
  {
    id: 17, rank: "BRONZE", unit: "UNIT 04",
    title: "map/filter",
    description: "高階関数で配列を変換しよう。",
    question: "[1,2,3,4,5,6,7,8] から偶数だけを filter で取り出し、map で2倍にして出力してください。",
    requirements: ["filter で偶数を取り出す", "map で2倍にする"],
    hint: "nums.filter{$0 % 2 == 0}.map{$0 * 2}",
    answer: `let nums = [1, 2, 3, 4, 5, 6, 7, 8]
let evens = nums.filter { $0 % 2 == 0 }
let doubled = evens.map { $0 * 2 }
print(doubled)`
  },
  {
    id: 18, rank: "SILVER", unit: "UNIT 05",
    title: "基本関数",
    description: "関数を定義して呼び出そう。",
    question: "greet(name:) 関数を定義し、\"こんにちは、○○さん！\" を返して出力してください。greet(name: \"Swift\") を呼び出すこと。",
    requirements: ["func で関数を定義", "引数ラベルを使う", "String を返す"],
    hint: "func greet(name: String) -> String { \"こんにちは、\\(name)さん！\" }",
    answer: `func greet(name: String) -> String {
    "こんにちは、\\(name)さん！"
}
print(greet(name: "Swift"))`
  },
  {
    id: 19, rank: "SILVER", unit: "UNIT 05",
    title: "引数ラベル",
    description: "外部引数ラベルと内部引数名を使い分けよう。",
    question: "calc(from:to:) 関数を定義し、to - from を返してください。calc(from: 10, to: 50) を呼び出して出力してください。",
    requirements: ["外部引数ラベルと内部引数名を使い分ける"],
    hint: "func calc(from a: Int, to b: Int) -> Int { b - a }",
    answer: `func calc(from a: Int, to b: Int) -> Int {
    b - a
}
print(calc(from: 10, to: 50))`
  },
  {
    id: 20, rank: "SILVER", unit: "UNIT 05",
    title: "クロージャ",
    description: "クロージャを変数に代入して使おう。",
    question: "(Int, Int) -> Int 型のクロージャ multiply を定義し、[1,2,3,4,5] の各要素を3倍にして出力してください。",
    requirements: ["クロージャを変数に代入", "map でクロージャを適用"],
    hint: "let multiply: (Int, Int) -> Int = { (a, b) in a * b }",
    answer: `let multiply: (Int, Int) -> Int = { (a, b) in a * b }
let nums = [1, 2, 3, 4, 5]
let result = nums.map { multiply($0, 3) }
print(result)`
  },
  {
    id: 21, rank: "SILVER", unit: "UNIT 05",
    title: "デフォルト引数",
    description: "デフォルト引数値を持つ関数を定義しよう。",
    question: "power(_:exp:) 関数でデフォルト exp=2 を設定し、power(3) と power(2, exp: 8) を出力してください。",
    requirements: ["デフォルト引数を設定する", "reduce を使って累乗を計算"],
    hint: "func power(_ base: Int, exp: Int = 2) -> Int",
    answer: `func power(_ base: Int, exp: Int = 2) -> Int {
    (0..<exp).reduce(1) { acc, _ in acc * base }
}
print(power(3))
print(power(2, exp: 8))`
  },
  {
    id: 22, rank: "SILVER", unit: "UNIT 06",
    title: "struct",
    description: "構造体と計算プロパティを使おう。",
    question: "Circle 構造体に radius プロパティと area 計算プロパティを定義し、radius=5 の面積を小数点2桁で出力してください。",
    requirements: ["struct を定義", "計算プロパティを使う", "Double.pi を使う"],
    hint: "var area: Double { Double.pi * radius * radius }",
    answer: `struct Circle {
    let radius: Double
    var area: Double { Double.pi * radius * radius }
}
let c = Circle(radius: 5)
print(String(format: "%.2f", c.area))`
  },
  {
    id: 23, rank: "SILVER", unit: "UNIT 06",
    title: "クラスと継承",
    description: "クラスの継承とオーバーライドを学ぼう。",
    question: "Shape クラスの area() を Rectangle でオーバーライドし、Rectangle(4, 5) の面積を出力してください。",
    requirements: ["class を定義", "継承に : を使う", "override を使う"],
    hint: "override func area() -> Double { w * h }",
    answer: `class Shape {
    func area() -> Double { 0 }
}
class Rectangle: Shape {
    let w, h: Double
    init(_ w: Double, _ h: Double) {
        self.w = w
        self.h = h
    }
    override func area() -> Double { w * h }
}
let r = Rectangle(4, 5)
print(r.area())`
  },
  {
    id: 24, rank: "SILVER", unit: "UNIT 06",
    title: "protocol",
    description: "プロトコルを定義して採用しよう。",
    question: "Greetable プロトコルに greet() -> String を定義し、Person struct で採用して出力してください。",
    requirements: ["protocol を定義", "struct で protocol を採用"],
    hint: "struct Person: Greetable { func greet() -> String { ... } }",
    answer: `protocol Greetable {
    func greet() -> String
}
struct Person: Greetable {
    let name: String
    func greet() -> String {
        "こんにちは、\\(name)！"
    }
}
let p = Person(name: "Alice")
print(p.greet())`
  },
  {
    id: 25, rank: "SILVER", unit: "UNIT 06",
    title: "extension",
    description: "extensionで型にプロパティを追加しよう。",
    question: "Int を拡張して isPrime 計算プロパティを追加し、2 から 20 の素数をすべて出力してください。",
    requirements: ["extension で Int を拡張", "isPrime を Bool 型の計算プロパティとして定義"],
    hint: "extension Int { var isPrime: Bool { ... } }",
    answer: `extension Int {
    var isPrime: Bool {
        guard self > 1 else { return false }
        for i in 2..<self {
            if self % i == 0 { return false }
        }
        return true
    }
}
for i in 2...20 {
    if i.isPrime { print(i) }
}`
  },
  {
    id: 26, rank: "GOLD", unit: "UNIT 07",
    title: "Optional",
    description: "Optionalのアンラップを使いこなそう。",
    question: "[\"42\", \"hello\", \"7\"] の各要素を Int に変換し、成功したら \"元→変換後の2乗\"、失敗したら \"→変換不可\" と出力してください。",
    requirements: ["if let でオプショナルバインディング", "Int() の変換失敗を処理"],
    hint: "if let n = Int(s) { print(\"\\(s)→\\(n*n)\") }",
    answer: `let inputs = ["42", "hello", "7"]
for s in inputs {
    if let n = Int(s) {
        print("\\(s)→\\(n * n)")
    } else {
        print("\\(s)→変換不可")
    }
}`
  },
  {
    id: 27, rank: "GOLD", unit: "UNIT 07",
    title: "エラー処理",
    description: "throws/try/catch でエラーを処理しよう。",
    question: "AppError enum を定義し、sqrt(_:) 関数で n<=0 のときエラーを投げ、do-catch で処理してください。sqrt(25) と sqrt(-4) と sqrt(0) を試してください。",
    requirements: ["enum で Error を定義", "throws/try を使う", "do-catch でエラー処理"],
    hint: "guard n > 0 else { throw n == 0 ? AppError.zero : AppError.negative }",
    answer: `enum AppError: Error {
    case negative, zero
}
func sqrt(_ n: Double) throws -> Double {
    guard n > 0 else {
        if n == 0 { throw AppError.zero }
        throw AppError.negative
    }
    return n.squareRoot()
}
do {
    print(try sqrt(25))
} catch AppError.negative {
    print("負の数")
} catch AppError.zero {
    print("ゼロ")
}
do {
    print(try sqrt(-4))
} catch AppError.negative {
    print("負の数")
} catch AppError.zero {
    print("ゼロ")
}
do {
    print(try sqrt(0))
} catch AppError.negative {
    print("負の数")
} catch AppError.zero {
    print("ゼロ")
}`
  },
  {
    id: 28, rank: "GOLD", unit: "UNIT 07",
    title: "Optional Chaining と nil合体",
    description: "Optional Chaining と ?? 演算子を使いこなそう。",
    question: "User struct に address?: Address? を持たせ、address?.city ?? \"不明\" を使って、Alice（Tokyo）と Bob（address=nil）の都市を出力してください。",
    requirements: ["Optional Chaining ?. を使う", "nil合体演算子 ?? を使う"],
    hint: "user.address?.city ?? \"不明\"",
    answer: `struct Address {
    var city: String
}
struct User {
    var name: String
    var address: Address?
}
let u1 = User(name: "Alice", address: Address(city: "Tokyo"))
let u2 = User(name: "Bob", address: nil)
print(u1.address?.city ?? "不明")
print(u2.address?.city ?? "不明")`
  },
  {
    id: 29, rank: "DIAMOND", unit: "UNIT 07",
    title: "enum 関連値",
    description: "enum の関連値と switch で図形の面積を求めよう。",
    question: "Shape enum に circle(Double) と rectangle(Double, Double) を定義し、area() 関数で面積を計算してください。circle(5) と rectangle(4, 6) を出力してください。",
    requirements: ["enum で関連値を使う", "switch で全ケースを処理", "Double.pi を使う"],
    hint: "case .circle(let r): return Double.pi * r * r",
    answer: `enum Shape {
    case circle(Double)
    case rectangle(Double, Double)
}
func area(_ s: Shape) -> Double {
    switch s {
    case .circle(let r):
        return Double.pi * r * r
    case .rectangle(let w, let h):
        return w * h
    }
}
print(String(format: "%.2f", area(.circle(5))))
print(area(.rectangle(4, 6)))`
  },
  {
    id: 30, rank: "LEGEND", unit: "UNIT 08",
    title: "ジェネリクス",
    description: "型パラメータを使った汎用関数を実装しよう。",
    question: "findMax<T: Comparable>(_:) 関数を定義し、[3,1,4,1,5,9,2,6] の最大値と [\"banana\",\"apple\",\"cherry\"] の最大値を出力してください。",
    requirements: ["ジェネリクス関数を定義", "Comparable 制約を使う", "reduce で最大値を求める"],
    hint: "func findMax<T: Comparable>(_ arr: [T]) -> T?",
    answer: `func findMax<T: Comparable>(_ arr: [T]) -> T? {
    arr.isEmpty ? nil : arr.reduce(arr[0]) { $0 > $1 ? $0 : $1 }
}
print(findMax([3, 1, 4, 1, 5, 9, 2, 6])!)
print(findMax(["banana", "apple", "cherry"])!)`
  }
];

const swiftMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "文字列マスター",
    description: "文字列の結合・反転・文字数カウントを行おう。",
    question: "[\"Swift\", \"is\", \"awesome\"] を空白で結合して出力し、結合文字列を反転させて出力し、文字数を出力してください。",
    requirements: ["joined(separator:) で結合", "reversed() で反転", "count で文字数"],
    hint: "words.joined(separator: \" \") で結合できます。",
    answer: `let words = ["Swift", "is", "awesome"]
let joined = words.joined(separator: " ")
print(joined)
let reversed = String(joined.reversed())
print(reversed)
print(joined.count)`
  },
  {
    id: 2, rank: "BRONZE",
    title: "コレクション操作",
    description: "配列から最大・最小・平均・条件カウントを求めよう。",
    question: "[85,62,90,41,78,55,93,67] の最大値、最小値、平均（小数点1桁）、70以上の個数を出力してください。",
    requirements: ["max() / min() を使う", "reduce で合計を求める", "filter で条件カウント"],
    hint: "Double(scores.reduce(0, +)) / Double(scores.count) で平均を計算。",
    answer: `let scores = [85, 62, 90, 41, 78, 55, 93, 67]
print(scores.max()!)
print(scores.min()!)
let avg = Double(scores.reduce(0, +)) / Double(scores.count)
print(String(format: "%.1f", avg))
let highCount = scores.filter { $0 >= 70 }.count
print(highCount)`
  },
  {
    id: 3, rank: "SILVER",
    title: "関数型プログラミング",
    description: "filter・map・reduce を連鎖させよう。",
    question: "[1...10] の配列から奇数だけをfilterし、3倍にmap し、総和をreduceで求め、各ステップの結果を出力してください。",
    requirements: ["filter で奇数を取り出す", "map で3倍にする", "reduce で合計を求める"],
    hint: "let odds = nums.filter { $0 % 2 != 0 }",
    answer: `let nums = Array(1...10)
let odds = nums.filter { $0 % 2 != 0 }
print(odds)
let tripled = odds.map { $0 * 3 }
print(tripled)
let sum = tripled.reduce(0, +)
print(sum)`
  },
  {
    id: 4, rank: "SILVER",
    title: "プロトコル活用",
    description: "プロトコルでインターフェースを統一しよう。",
    question: "Calculable プロトコルに add/subtract/multiply メソッドを定義し、Calculator struct で実装してテストしてください。",
    requirements: ["protocol を定義", "struct でプロトコルを採用", "各メソッドをテスト"],
    hint: "protocol Calculable { func add(_ a: Int, _ b: Int) -> Int ... }",
    answer: `protocol Calculable {
    func add(_ a: Int, _ b: Int) -> Int
    func subtract(_ a: Int, _ b: Int) -> Int
    func multiply(_ a: Int, _ b: Int) -> Int
}
struct Calculator: Calculable {
    func add(_ a: Int, _ b: Int) -> Int { a + b }
    func subtract(_ a: Int, _ b: Int) -> Int { a - b }
    func multiply(_ a: Int, _ b: Int) -> Int { a * b }
}
let calc = Calculator()
print(calc.add(10, 3))
print(calc.subtract(10, 3))
print(calc.multiply(10, 3))`
  },
  {
    id: 5, rank: "GOLD",
    title: "エラーハンドリング",
    description: "バリデーション関数でエラーを処理しよう。",
    question: "ValidationError enum を定義し、validate(age:name:) 関数で age<0, age>150, name.isEmpty のときエラーを投げ、複数のケースをテストしてください。",
    requirements: ["enum で複数エラーを定義", "throws/try/catch を使う", "複数のバリデーションを実装"],
    hint: "guard age >= 0 else { throw ValidationError.negativeAge }",
    answer: `enum ValidationError: Error {
    case negativeAge, tooOldAge, emptyName
}
func validate(age: Int, name: String) throws {
    guard age >= 0 else { throw ValidationError.negativeAge }
    guard age <= 150 else { throw ValidationError.tooOldAge }
    guard !name.isEmpty else { throw ValidationError.emptyName }
    print("\\(name) (\\(age)歳) は有効です")
}
do { try validate(age: 25, name: "Alice") } catch { print(error) }
do { try validate(age: -1, name: "Bob") } catch { print(error) }
do { try validate(age: 200, name: "Carol") } catch { print(error) }
do { try validate(age: 30, name: "") } catch { print(error) }`
  },
  {
    id: 6, rank: "GOLD",
    title: "ジェネリクス Stack",
    description: "ジェネリクスを使ったスタックを実装しよう。",
    question: "ジェネリクスの Stack<T> 構造体を実装し、push/pop/peek/isEmpty/count を定義して Int と String のスタックでテストしてください。",
    requirements: ["ジェネリクス struct を定義", "push/pop/peek/isEmpty/count を実装", "Int と String でテスト"],
    hint: "struct Stack<T> { private var items: [T] = [] ... }",
    answer: `struct Stack<T> {
    private var items: [T] = []
    mutating func push(_ item: T) { items.append(item) }
    mutating func pop() -> T? { items.popLast() }
    func peek() -> T? { items.last }
    var isEmpty: Bool { items.isEmpty }
    var count: Int { items.count }
}
var intStack = Stack<Int>()
intStack.push(1)
intStack.push(2)
intStack.push(3)
print(intStack.peek()!)
print(intStack.pop()!)
print(intStack.count)
var strStack = Stack<String>()
strStack.push("Hello")
strStack.push("Swift")
print(strStack.pop()!)
print(strStack.isEmpty)`
  }
];

const swiftUnitGuides = [
  {
    id: "swift-unit01",
    unit: "UNIT 01", title: "Hello Swift & 出力",
    summary: "Swiftの基本構文、print関数、変数・定数の宣言を学ぶ。",
    points: [
      "print() 関数で標準出力に文字列を出力できる",
      "let は定数（再代入不可）、var は変数（再代入可能）",
      "文字列補間は \\(式) で変数や式を埋め込める",
      "型推論により多くの場合型アノテーションは省略可能"
    ],
    words: [
      { term: "print()", desc: "改行付きで標準出力に出力する関数" },
      { term: "let", desc: "定数を宣言するキーワード（再代入不可）" },
      { term: "var", desc: "変数を宣言するキーワード（再代入可能）" }
    ]
  },
  {
    id: "swift-unit02",
    unit: "UNIT 02", title: "変数・定数・型推論",
    summary: "基本型、型変換、タプル、範囲演算子を学ぶ。",
    points: [
      "基本型は Int, Double, String, Bool（大文字始まり）",
      "Double() や Int() で型を明示的に変換できる",
      "タプルで複数の値をひとつにまとめられる",
      "1...5 は閉じた範囲、1..<5 は半開き範囲"
    ],
    words: [
      { term: "Double()", desc: "Int などを Double に変換するイニシャライザ" },
      { term: "タプル", desc: "複数の値をひとつにまとめる型。名前付きも可" },
      { term: "...", desc: "両端を含む閉じた範囲演算子" }
    ]
  },
  {
    id: "swift-unit03",
    unit: "UNIT 03", title: "制御構文",
    summary: "if-else、for-in、while、switch、guard を学ぶ。",
    points: [
      "if / else if / else で条件分岐できる",
      "for i in 範囲 または for item in コレクション でループ",
      "switch は文字列にも使え、default が必要なことが多い",
      "guard は条件が偽のとき早期リターンするために使う"
    ],
    words: [
      { term: "guard", desc: "条件が偽のとき早期リターンする構文" },
      { term: "switch", desc: "多分岐を記述する構文。Swift では fall-through しない" },
      { term: "for-in", desc: "範囲やコレクションを順番に処理するループ" }
    ]
  },
  {
    id: "swift-unit04",
    unit: "UNIT 04", title: "コレクション（Array/Dictionary/Set）",
    summary: "Array, Dictionary, Set の操作と高階関数を学ぶ。",
    points: [
      "Array は順序付きリスト。append() で末尾追加",
      "Dictionary はキーと値のペア。存在しないキーは Optional を返す",
      "Set は重複なしの集合。contains() で検索が高速",
      "filter / map / reduce で宣言的にコレクションを処理できる"
    ],
    words: [
      { term: "filter", desc: "条件に合う要素だけの新しい配列を返す高階関数" },
      { term: "map", desc: "各要素を変換した新しい配列を返す高階関数" },
      { term: "Set", desc: "順序なし・重複なしのコレクション型" }
    ]
  },
  {
    id: "swift-unit05",
    unit: "UNIT 05", title: "関数 & クロージャ",
    summary: "関数定義、引数ラベル、クロージャ、デフォルト引数を学ぶ。",
    points: [
      "func で関数を定義。引数ラベルと内部引数名を分けられる",
      "_ を引数ラベルにすると呼び出し時にラベルを省略できる",
      "クロージャは { (引数) in 処理 } の形で書く",
      "デフォルト引数で呼び出し側の記述を省略できる"
    ],
    words: [
      { term: "クロージャ", desc: "変数に代入できる無名関数。$0/$1 で引数を省略表記" },
      { term: "引数ラベル", desc: "関数呼び出し時に使う外部向けの名前" },
      { term: "trailing closure", desc: "最後の引数がクロージャのとき () の外に書ける構文" }
    ]
  },
  {
    id: "swift-unit06",
    unit: "UNIT 06", title: "構造体・クラス・プロトコル",
    summary: "struct, class, protocol, extension を学ぶ。",
    points: [
      "struct は値型、class は参照型。Swiftでは struct が推奨されることが多い",
      "計算プロパティは毎回計算される読み取り専用または読み書き可能なプロパティ",
      "protocol でインターフェースを定義し、struct/class で採用する",
      "extension で既存の型にメソッドやプロパティを追加できる"
    ],
    words: [
      { term: "struct", desc: "値型のカスタムデータ型。コピーで渡される" },
      { term: "protocol", desc: "型が満たすべきメソッドやプロパティを定義するインターフェース" },
      { term: "extension", desc: "既存の型に機能を追加するキーワード" }
    ]
  },
  {
    id: "swift-unit07",
    unit: "UNIT 07", title: "Optional & エラー処理",
    summary: "Optional、if let、guard let、throws/try/catch、nil合体演算子を学ぶ。",
    points: [
      "Optional 型は値が存在しないかもしれないことを表す（? 付き型）",
      "if let / guard let でアンラップして安全に使える",
      "?? (nil合体演算子) で nil のときのデフォルト値を指定",
      "throws/try/catch でエラーを型安全に処理できる"
    ],
    words: [
      { term: "Optional", desc: "値が nil になりうることを示す型。T? と書く" },
      { term: "??", desc: "nil合体演算子。左がnilなら右の値を使う" },
      { term: "throws", desc: "エラーを投げる可能性がある関数に付けるキーワード" }
    ]
  },
  {
    id: "swift-unit08",
    unit: "UNIT 08", title: "ジェネリクス & 高度な機能",
    summary: "ジェネリクス関数・型、型制約、Associated Type を学ぶ。",
    points: [
      "ジェネリクスで型に依存しない汎用的なコードを書ける",
      "<T: Comparable> のように型制約を付けられる",
      "標準ライブラリの Array や Dictionary もジェネリクスで実装されている",
      "protocol に associatedtype を使うとより柔軟な設計が可能"
    ],
    words: [
      { term: "ジェネリクス", desc: "型パラメータを使って汎用的なコードを書く仕組み" },
      { term: "Comparable", desc: "< や > で比較できる型が採用するプロトコル" },
      { term: "associatedtype", desc: "プロトコル内で使う型プレースホルダー" }
    ]
  }
];

// ===== Java データ =====

const javaProblems = [
  // UNIT 01
  {
    id: 1, rank: "ROOKIE", unit: "UNIT 01", title: "Hello, Java!",
    question: "\"Hello, Java!\" と出力してください。",
    requirements: ["System.out.println() を使う"],
    hint: "System.out.println(\"文字列\") で出力できます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}`
  },
  {
    id: 2, rank: "ROOKIE", unit: "UNIT 01", title: "変数と型",
    question: "int型の変数 age に 25、String型の変数 name に \"Java\" を代入して \"名前: Java, 年齢: 25\" と出力してください。",
    requirements: ["int型とString型の変数を宣言する", "System.out.println() で出力する"],
    hint: "int age = 25; String name = \"Java\"; のように宣言できます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int age = 25;\n        String name = "Java";\n        System.out.println("名前: " + name + ", 年齢: " + age);\n    }\n}`
  },
  {
    id: 3, rank: "ROOKIE", unit: "UNIT 01", title: "文字列フォーマット",
    question: "double型の変数 pi に 3.14159 を代入して、System.out.printf で小数点2桁 \"円周率: 3.14\" と出力してください。",
    requirements: ["double型変数を宣言する", "System.out.printf で %.2f を使う"],
    hint: "System.out.printf(\"円周率: %.2f%n\", pi) のように書きます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        double pi = 3.14159;\n        System.out.printf("円周率: %.2f%n", pi);\n    }\n}`
  },
  {
    id: 4, rank: "ROOKIE", unit: "UNIT 01", title: "基本演算",
    question: "int a = 17, b = 5 として、a+b, a-b, a*b, a/b, a%b をそれぞれ1行ずつ出力してください。",
    requirements: ["加算・減算・乗算・除算・剰余を使う", "各結果を1行ずつ出力する"],
    hint: "整数同士の / は整数除算になります。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int a = 17, b = 5;\n        System.out.println(a + b);\n        System.out.println(a - b);\n        System.out.println(a * b);\n        System.out.println(a / b);\n        System.out.println(a % b);\n    }\n}`
  },
  // UNIT 02
  {
    id: 5, rank: "ROOKIE", unit: "UNIT 02", title: "if-else",
    question: "int score = 78 として、80以上\"優\", 60以上\"良\", それ未満\"可\" と出力してください。",
    requirements: ["if-else if-else を使う", "条件に応じて出力を変える"],
    hint: "else if (score >= 60) で2番目の条件を書きます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int score = 78;\n        if (score >= 80) {\n            System.out.println("優");\n        } else if (score >= 60) {\n            System.out.println("良");\n        } else {\n            System.out.println("可");\n        }\n    }\n}`
  },
  {
    id: 6, rank: "ROOKIE", unit: "UNIT 02", title: "for ループ",
    question: "1から10の整数の合計を for ループで計算して出力してください。",
    requirements: ["for ループを使う", "合計を変数に蓄積する"],
    hint: "for(int i = 1; i <= 10; i++) のように書きます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int sum = 0;\n        for (int i = 1; i <= 10; i++) {\n            sum += i;\n        }\n        System.out.println(sum);\n    }\n}`
  },
  {
    id: 7, rank: "ROOKIE", unit: "UNIT 02", title: "while ループ",
    question: "1から始めて2倍を繰り返し、初めて1000を超えた数を出力してください。",
    requirements: ["while ループを使う", "1000を超えたら停止する"],
    hint: "while (n <= 1000) { n *= 2; } で繰り返します。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int n = 1;\n        while (n <= 1000) {\n            n *= 2;\n        }\n        System.out.println(n);\n    }\n}`
  },
  {
    id: 8, rank: "BRONZE", unit: "UNIT 02", title: "switch 文",
    question: "int day = 3 として switch で \"水曜日\" と出力してください（1=月〜7=日）。",
    requirements: ["switch 文を使う", "case と break を正しく書く"],
    hint: "switch(day) { case 1: ... break; case 2: ... } のように書きます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int day = 3;\n        switch (day) {\n            case 1: System.out.println("月曜日"); break;\n            case 2: System.out.println("火曜日"); break;\n            case 3: System.out.println("水曜日"); break;\n            case 4: System.out.println("木曜日"); break;\n            case 5: System.out.println("金曜日"); break;\n            case 6: System.out.println("土曜日"); break;\n            case 7: System.out.println("日曜日"); break;\n        }\n    }\n}`
  },
  // UNIT 03
  {
    id: 9, rank: "BRONZE", unit: "UNIT 03", title: "配列",
    question: "int[] scores = {85, 62, 90, 41, 78} を定義し、合計と平均（小数点1桁）を出力してください。",
    requirements: ["配列を定義する", "for-each ループで合計を求める", "printf で小数点1桁表示"],
    hint: "for (int s : scores) { sum += s; } で合計できます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int[] scores = {85, 62, 90, 41, 78};\n        int sum = 0;\n        for (int s : scores) {\n            sum += s;\n        }\n        System.out.println("合計: " + sum);\n        System.out.printf("平均: %.1f%n", (double) sum / scores.length);\n    }\n}`
  },
  {
    id: 10, rank: "BRONZE", unit: "UNIT 03", title: "メソッド定義",
    question: "int型の引数を2つ受け取り、大きい方を返す max(int a, int b) メソッドを定義して、max(12, 7) と max(3, 99) の結果を出力してください。",
    requirements: ["static int max(int a, int b) を定義する", "2つの結果を出力する"],
    hint: "return a > b ? a : b; で大きい方を返せます。",
    answer: `class Main {\n    static int max(int a, int b) {\n        return a > b ? a : b;\n    }\n    public static void main(String[] args) {\n        System.out.println(max(12, 7));\n        System.out.println(max(3, 99));\n    }\n}`
  },
  {
    id: 11, rank: "BRONZE", unit: "UNIT 03", title: "再帰",
    question: "再帰を使って n の階乗を計算する factorial(int n) メソッドを定義して、5! と 10! を出力してください。",
    requirements: ["再帰メソッドを定義する", "基底ケース (n <= 1) を設ける"],
    hint: "return n * factorial(n - 1); で再帰します。",
    answer: `class Main {\n    static long factorial(int n) {\n        if (n <= 1) return 1;\n        return n * factorial(n - 1);\n    }\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n        System.out.println(factorial(10));\n    }\n}`
  },
  {
    id: 12, rank: "BRONZE", unit: "UNIT 03", title: "文字列操作",
    question: "String s = \"Hello, Java World!\" として、長さ・大文字変換・\"Java\"を\"Swift\"に置換した結果を1行ずつ出力してください。",
    requirements: [".length() で長さを取得", ".toUpperCase() で大文字変換", ".replace() で置換"],
    hint: "s.replace(\"Java\", \"Swift\") で文字列を置換できます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        String s = "Hello, Java World!";\n        System.out.println(s.length());\n        System.out.println(s.toUpperCase());\n        System.out.println(s.replace("Java", "Swift"));\n    }\n}`
  },
  {
    id: 13, rank: "BRONZE", unit: "UNIT 03", title: "多次元配列",
    question: "3x3の int[][] matrix を定義して（値は1-9）、各行の合計を出力してください。",
    requirements: ["2次元配列を定義する", "二重 for ループで各行の合計を求める"],
    hint: "int[][] matrix = {{1,2,3},{4,5,6},{7,8,9}}; のように定義します。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int[][] matrix = {{1,2,3},{4,5,6},{7,8,9}};\n        for (int i = 0; i < matrix.length; i++) {\n            int sum = 0;\n            for (int j = 0; j < matrix[i].length; j++) {\n                sum += matrix[i][j];\n            }\n            System.out.println("行" + (i+1) + "の合計: " + sum);\n        }\n    }\n}`
  },
  // UNIT 04
  {
    id: 14, rank: "BRONZE", unit: "UNIT 04", title: "ArrayList",
    question: "ArrayList<String> に \"Apple\", \"Banana\", \"Cherry\" を追加し、\"Banana\" を削除して残った要素を1行ずつ出力してください。",
    requirements: ["java.util.ArrayList をインポートする", ".add() で追加、.remove() で削除", "for-each で出力"],
    hint: "list.remove(\"Banana\") で要素を削除できます。",
    answer: `import java.util.ArrayList;\nclass Main {\n    public static void main(String[] args) {\n        ArrayList<String> list = new ArrayList<>();\n        list.add("Apple");\n        list.add("Banana");\n        list.add("Cherry");\n        list.remove("Banana");\n        for (String s : list) {\n            System.out.println(s);\n        }\n    }\n}`
  },
  {
    id: 15, rank: "SILVER", unit: "UNIT 04", title: "HashMap",
    question: "HashMap<String, Integer> に 3人の名前と点数を入れ、全エントリを \"名前: 点数\" 形式で出力してください。",
    requirements: ["java.util.HashMap をインポートする", ".put() でエントリを追加", "entrySet() で全エントリを取得"],
    hint: "for (Map.Entry<String,Integer> e : map.entrySet()) で反復できます。",
    answer: `import java.util.HashMap;\nimport java.util.Map;\nclass Main {\n    public static void main(String[] args) {\n        HashMap<String, Integer> map = new HashMap<>();\n        map.put("Alice", 90);\n        map.put("Bob", 75);\n        map.put("Carol", 85);\n        for (Map.Entry<String, Integer> e : map.entrySet()) {\n            System.out.println(e.getKey() + ": " + e.getValue());\n        }\n    }\n}`
  },
  {
    id: 16, rank: "SILVER", unit: "UNIT 04", title: "Collections ソート",
    question: "ArrayList<Integer> に [5,2,8,1,9,3] を入れ、Collections.sort で昇順ソートして出力してください。",
    requirements: ["java.util.Collections をインポートする", "Collections.sort() でソート", "for-each で出力"],
    hint: "Collections.sort(list) でリストを昇順ソートできます。",
    answer: `import java.util.ArrayList;\nimport java.util.Collections;\nclass Main {\n    public static void main(String[] args) {\n        ArrayList<Integer> list = new ArrayList<>();\n        list.add(5); list.add(2); list.add(8);\n        list.add(1); list.add(9); list.add(3);\n        Collections.sort(list);\n        System.out.println(list);\n    }\n}`
  },
  {
    id: 17, rank: "SILVER", unit: "UNIT 04", title: "Iterator",
    question: "ArrayList<String> に \"red\",\"green\",\"blue\" を入れ、Iterator を使って要素を1行ずつ出力してください。",
    requirements: ["java.util.Iterator をインポートする", "iterator() で Iterator を取得", "hasNext() と next() を使う"],
    hint: "Iterator<String> it = list.iterator(); while(it.hasNext()) { ... } で反復します。",
    answer: `import java.util.ArrayList;\nimport java.util.Iterator;\nclass Main {\n    public static void main(String[] args) {\n        ArrayList<String> list = new ArrayList<>();\n        list.add("red");\n        list.add("green");\n        list.add("blue");\n        Iterator<String> it = list.iterator();\n        while (it.hasNext()) {\n            System.out.println(it.next());\n        }\n    }\n}`
  },
  // UNIT 05
  {
    id: 18, rank: "SILVER", unit: "UNIT 05", title: "クラスとコンストラクタ",
    question: "name(String)とage(int)フィールドを持つ Person クラスを定義し、コンストラクタと introduce() メソッド（\"私はXX、YY歳です\"）を実装して、Person(\"Alice\",30).introduce() を呼び出してください。",
    requirements: ["Person クラスを定義する", "コンストラクタで初期化する", "introduce() メソッドを実装する"],
    hint: "void introduce() { System.out.println(\"私は\" + name + \"、\" + age + \"歳です\"); } と書きます。",
    answer: `class Person {\n    String name;\n    int age;\n    Person(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n    void introduce() {\n        System.out.println("私は" + name + "、" + age + "歳です");\n    }\n}\nclass Main {\n    public static void main(String[] args) {\n        new Person("Alice", 30).introduce();\n    }\n}`
  },
  {
    id: 19, rank: "SILVER", unit: "UNIT 05", title: "継承",
    question: "speak() メソッドを持つ Animal クラスを継承して Dog クラスを作り、speak() を \"ワン！\" を返すようにオーバーライドして出力してください。",
    requirements: ["Animal クラスを定義する", "Dog extends Animal で継承する", "@Override で speak() をオーバーライドする"],
    hint: "@Override を付けてスーパークラスのメソッドをオーバーライドします。",
    answer: `class Animal {\n    void speak() {\n        System.out.println("...");\n    }\n}\nclass Dog extends Animal {\n    @Override\n    void speak() {\n        System.out.println("ワン！");\n    }\n}\nclass Main {\n    public static void main(String[] args) {\n        Dog dog = new Dog();\n        dog.speak();\n    }\n}`
  },
  {
    id: 20, rank: "SILVER", unit: "UNIT 05", title: "interface",
    question: "double area() を持つ Shape インターフェースを定義し、Circle(radius) と Rectangle(width, height) で実装して、それぞれの面積（小数点2桁）を出力してください。",
    requirements: ["Shape interface を定義する", "Circle と Rectangle で implements する", "printf で小数点2桁表示"],
    hint: "class Circle implements Shape { public double area() { return Math.PI * r * r; } }",
    answer: `interface Shape {\n    double area();\n}\nclass Circle implements Shape {\n    double radius;\n    Circle(double radius) { this.radius = radius; }\n    public double area() { return Math.PI * radius * radius; }\n}\nclass Rectangle implements Shape {\n    double width, height;\n    Rectangle(double w, double h) { this.width = w; this.height = h; }\n    public double area() { return width * height; }\n}\nclass Main {\n    public static void main(String[] args) {\n        Shape c = new Circle(5);\n        Shape r = new Rectangle(4, 6);\n        System.out.printf("Circle: %.2f%n", c.area());\n        System.out.printf("Rectangle: %.2f%n", r.area());\n    }\n}`
  },
  {
    id: 21, rank: "GOLD", unit: "UNIT 05", title: "抽象クラス",
    question: "abstract double calculate() を持つ Tax 抽象クラスを作り、ConsumptionTax（税率10%）を実装して、Tax t = new ConsumptionTax(1000); t.calculate() を出力してください。",
    requirements: ["abstract class Tax を定義する", "ConsumptionTax extends Tax で実装する", "calculate() で税込み金額を返す"],
    hint: "abstract クラスはインスタンス化できませんが、参照型としては使えます。",
    answer: `abstract class Tax {\n    double amount;\n    Tax(double amount) { this.amount = amount; }\n    abstract double calculate();\n}\nclass ConsumptionTax extends Tax {\n    ConsumptionTax(double amount) { super(amount); }\n    public double calculate() { return amount * 1.1; }\n}\nclass Main {\n    public static void main(String[] args) {\n        Tax t = new ConsumptionTax(1000);\n        System.out.println(t.calculate());\n    }\n}`
  },
  // UNIT 06
  {
    id: 22, rank: "GOLD", unit: "UNIT 06", title: "try-catch",
    question: "int[] arr = {1,2,3} に対して arr[5] にアクセスし、ArrayIndexOutOfBoundsException をキャッチして \"範囲外エラー: \" + e.getMessage() を出力してください。",
    requirements: ["try-catch ブロックを使う", "ArrayIndexOutOfBoundsException をキャッチする"],
    hint: "catch (ArrayIndexOutOfBoundsException e) { System.out.println(...); } と書きます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3};\n        try {\n            System.out.println(arr[5]);\n        } catch (ArrayIndexOutOfBoundsException e) {\n            System.out.println("範囲外エラー: " + e.getMessage());\n        }\n    }\n}`
  },
  {
    id: 23, rank: "GOLD", unit: "UNIT 06", title: "カスタム例外",
    question: "AgeException extends Exception を定義し、int型のageを受け取り0未満なら AgeException をスローする checkAge() を実装して、checkAge(-1) を呼び出してください。",
    requirements: ["AgeException extends Exception を定義する", "throws AgeException をメソッド宣言に追加する", "try-catch でキャッチする"],
    hint: "if (age < 0) throw new AgeException(\"年齢が不正です\"); のようにスローします。",
    answer: `class AgeException extends Exception {\n    AgeException(String msg) { super(msg); }\n}\nclass Main {\n    static void checkAge(int age) throws AgeException {\n        if (age < 0) throw new AgeException("年齢が不正です: " + age);\n        System.out.println("年齢: " + age);\n    }\n    public static void main(String[] args) {\n        try {\n            checkAge(-1);\n        } catch (AgeException e) {\n            System.out.println("エラー: " + e.getMessage());\n        }\n    }\n}`
  },
  {
    id: 24, rank: "GOLD", unit: "UNIT 06", title: "ジェネリクスクラス",
    question: "型パラメータTを持つ Pair<T,U> クラスを定義して Pair<String,Integer>(\"Score\",100) を作り、getFirst()とgetSecond()の結果を出力してください。",
    requirements: ["Pair<T,U> クラスをジェネリクスで定義する", "getFirst() と getSecond() を実装する"],
    hint: "class Pair<T, U> { T first; U second; ... } のように定義します。",
    answer: `class Pair<T, U> {\n    T first;\n    U second;\n    Pair(T first, U second) { this.first = first; this.second = second; }\n    T getFirst() { return first; }\n    U getSecond() { return second; }\n}\nclass Main {\n    public static void main(String[] args) {\n        Pair<String, Integer> p = new Pair<>("Score", 100);\n        System.out.println(p.getFirst());\n        System.out.println(p.getSecond());\n    }\n}`
  },
  {
    id: 25, rank: "GOLD", unit: "UNIT 06", title: "ジェネリクスメソッド",
    question: "<T extends Comparable<T>> T findMax(T[] arr) を定義して Integer[] と String[] でテストしてください。",
    requirements: ["ジェネリクスメソッドを定義する", "T extends Comparable<T> で比較可能な型に制限する"],
    hint: "if (arr[i].compareTo(max) > 0) max = arr[i]; で最大値を求めます。",
    answer: `class Main {\n    static <T extends Comparable<T>> T findMax(T[] arr) {\n        T max = arr[0];\n        for (T item : arr) {\n            if (item.compareTo(max) > 0) max = item;\n        }\n        return max;\n    }\n    public static void main(String[] args) {\n        Integer[] nums = {3, 7, 1, 9, 4};\n        String[] words = {"banana", "apple", "cherry"};\n        System.out.println(findMax(nums));\n        System.out.println(findMax(words));\n    }\n}`
  },
  // UNIT 07
  {
    id: 26, rank: "DIAMOND", unit: "UNIT 07", title: "ラムダ式",
    question: "List<Integer> numbers = Arrays.asList(1,2,3,4,5,6,7,8,9,10) から偶数をフィルターして2倍にしてリスト出力してください。",
    requirements: ["stream().filter() で偶数を絞り込む", "map() で2倍にする", "collect(Collectors.toList()) でリストに変換"],
    hint: ".filter(n -> n % 2 == 0).map(n -> n * 2) のようにチェーンします。",
    answer: `import java.util.*;\nimport java.util.stream.*;\nclass Main {\n    public static void main(String[] args) {\n        List<Integer> numbers = Arrays.asList(1,2,3,4,5,6,7,8,9,10);\n        List<Integer> result = numbers.stream()\n            .filter(n -> n % 2 == 0)\n            .map(n -> n * 2)\n            .collect(Collectors.toList());\n        System.out.println(result);\n    }\n}`
  },
  {
    id: 27, rank: "DIAMOND", unit: "UNIT 07", title: "Stream 集計",
    question: "List<String> words = Arrays.asList(\"Java\",\"Stream\",\"API\",\"Lambda\",\"Functional\") から文字数が5以上の単語を長さ降順にソートして出力してください。",
    requirements: ["filter() で文字数5以上を絞り込む", "sorted(Comparator) で降順ソート", "forEach() で出力"],
    hint: ".sorted(Comparator.comparingInt(String::length).reversed()) で降順ソートできます。",
    answer: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        List<String> words = Arrays.asList("Java","Stream","API","Lambda","Functional");\n        words.stream()\n            .filter(w -> w.length() >= 5)\n            .sorted(Comparator.comparingInt(String::length).reversed())\n            .forEach(System.out::println);\n    }\n}`
  },
  {
    id: 28, rank: "DIAMOND", unit: "UNIT 07", title: "Optional",
    question: "List<String> names = Arrays.asList(\"Alice\",\"Bob\",\"Charlie\") から \"B\" で始まる最初の名前を Optional で取得し、存在すれば出力、なければ \"見つかりません\" を出力してください。",
    requirements: ["stream().filter().findFirst() で Optional を取得", "ifPresentOrElse() または orElse() で結果を処理"],
    hint: ".findFirst() は Optional<T> を返します。.orElse(\"見つかりません\") で代替値を設定できます。",
    answer: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        List<String> names = Arrays.asList("Alice","Bob","Charlie");\n        String result = names.stream()\n            .filter(n -> n.startsWith("B"))\n            .findFirst()\n            .orElse("見つかりません");\n        System.out.println(result);\n    }\n}`
  },
  // UNIT 08
  {
    id: 29, rank: "MASTER", unit: "UNIT 08", title: "Comparable 実装",
    question: "score(int)とname(String)を持つ Student クラスを Comparable<Student> で実装（スコア降順）し、List<Student> を Collections.sort でソートして出力してください。",
    requirements: ["Comparable<Student> を implements する", "compareTo() でスコア降順を定義する", "Collections.sort() でソートする"],
    hint: "return other.score - this.score; でスコア降順になります。",
    answer: `import java.util.*;\nclass Student implements Comparable<Student> {\n    String name;\n    int score;\n    Student(String name, int score) { this.name = name; this.score = score; }\n    public int compareTo(Student other) { return other.score - this.score; }\n    public String toString() { return name + ": " + score; }\n}\nclass Main {\n    public static void main(String[] args) {\n        List<Student> list = new ArrayList<>();\n        list.add(new Student("Alice", 85));\n        list.add(new Student("Bob", 92));\n        list.add(new Student("Carol", 78));\n        Collections.sort(list);\n        for (Student s : list) System.out.println(s);\n    }\n}`
  },
  {
    id: 30, rank: "LEGEND", unit: "UNIT 08", title: "ジェネリクスStack",
    question: "ジェネリクスを使った Stack<T> クラスを ArrayList で実装し（push/pop/peek/isEmpty/size）、Integer と String でそれぞれテストしてください。",
    requirements: ["Stack<T> クラスをジェネリクスで定義する", "push/pop/peek/isEmpty/size を実装する", "Integer と String でテストする"],
    hint: "ArrayList の末尾を使って push は add()、pop は remove(size-1) で実装できます。",
    answer: `import java.util.ArrayList;\nclass Stack<T> {\n    private ArrayList<T> list = new ArrayList<>();\n    void push(T item) { list.add(item); }\n    T pop() { if (isEmpty()) throw new RuntimeException("空"); return list.remove(list.size()-1); }\n    T peek() { if (isEmpty()) throw new RuntimeException("空"); return list.get(list.size()-1); }\n    boolean isEmpty() { return list.isEmpty(); }\n    int size() { return list.size(); }\n}\nclass Main {\n    public static void main(String[] args) {\n        Stack<Integer> s1 = new Stack<>();\n        s1.push(10); s1.push(20); s1.push(30);\n        System.out.println("peek: " + s1.peek());\n        System.out.println("pop: " + s1.pop() + ", size: " + s1.size());\n        Stack<String> s2 = new Stack<>();\n        s2.push("Java"); s2.push("Generic"); s2.push("Stack");\n        while (!s2.isEmpty()) System.out.println(s2.pop());\n    }\n}`
  }
];

const javaMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "配列マスター",
    description: "配列の操作を習得する",
    question: "int[] data = {15, 8, 23, 4, 42, 16, 7, 35} を使って：最大値、最小値、合計、平均（小数点1桁）を出力し、さらに降順にソートして出力してください。",
    requirements: ["最大値・最小値を求める", "合計・平均を計算する", "降順ソートする"],
    hint: "Arrays.sort() で昇順ソートし、逆順に出力するか手動ソートしてください。",
    answer: `import java.util.Arrays;\nclass Main {\n    public static void main(String[] args) {\n        int[] data = {15,8,23,4,42,16,7,35};\n        int max=data[0], min=data[0], sum=0;\n        for(int x:data){if(x>max)max=x;if(x<min)min=x;sum+=x;}\n        System.out.println("最大: "+max);\n        System.out.println("最小: "+min);\n        System.out.println("合計: "+sum);\n        System.out.printf("平均: %.1f%n",(double)sum/data.length);\n        Arrays.sort(data);\n        System.out.print("降順: ");\n        for(int i=data.length-1;i>=0;i--)System.out.print(data[i]+(i>0?", ":"\\n"));\n    }\n}`
  },
  {
    id: 2, rank: "BRONZE",
    title: "文字列処理マスター",
    description: "文字列操作を習得する",
    question: "String sentence = \"The quick brown fox jumps over the lazy dog\" を使って：単語数、最長の単語、大文字変換、\"fox\"を\"cat\"に置換した文字列を出力してください。",
    requirements: ["split() で単語分割", "最長単語を求める", "toUpperCase()・replace() を使う"],
    hint: "split(\" \") でスペース区切りに分割できます。",
    answer: `class Main {\n    public static void main(String[] args) {\n        String s = "The quick brown fox jumps over the lazy dog";\n        String[] words = s.split(" ");\n        System.out.println("単語数: " + words.length);\n        String longest = "";\n        for(String w:words)if(w.length()>longest.length())longest=w;\n        System.out.println("最長: " + longest);\n        System.out.println("大文字: " + s.toUpperCase());\n        System.out.println("置換: " + s.replace("fox","cat"));\n    }\n}`
  },
  {
    id: 3, rank: "SILVER",
    title: "OOPデザイン",
    description: "クラス設計を実践する",
    question: "銀行口座クラス BankAccount を作成してください。フィールド：owner(String)、balance(double)。メソッド：deposit(double)、withdraw(double)（残高不足なら\"残高不足\"と出力）、getBalance()。口座を作り入金・出金をテストしてください。",
    requirements: ["コンストラクタでowner・balanceを初期化", "deposit/withdrawを実装", "残高不足のハンドリング"],
    hint: "withdraw では balance < amount のチェックを忘れずに。",
    answer: `class BankAccount {\n    String owner;\n    double balance;\n    BankAccount(String owner, double balance){this.owner=owner;this.balance=balance;}\n    void deposit(double amount){balance+=amount;System.out.printf("%s 入金: %.0f → 残高: %.0f%n",owner,amount,balance);}\n    void withdraw(double amount){if(balance<amount){System.out.println("残高不足");return;}balance-=amount;System.out.printf("%s 出金: %.0f → 残高: %.0f%n",owner,amount,balance);}\n    double getBalance(){return balance;}\n}\nclass Main {\n    public static void main(String[] args) {\n        BankAccount acc = new BankAccount("Alice", 10000);\n        acc.deposit(5000);\n        acc.withdraw(3000);\n        acc.withdraw(20000);\n        System.out.printf("最終残高: %.0f%n", acc.getBalance());\n    }\n}`
  },
  {
    id: 4, rank: "SILVER",
    title: "コレクション活用",
    description: "ArrayList と HashMap を組み合わせる",
    question: "学生の成績管理システムを作ってください。HashMap<String, ArrayList<Integer>> で各学生の複数教科の点数を管理し、各学生の平均点と全学生の平均点を出力してください。Alice:[80,75,90], Bob:[65,70,60], Carol:[95,88,92]",
    requirements: ["HashMap<String, ArrayList<Integer>> を使う", "各学生の平均を計算", "全体の平均を計算"],
    hint: "entrySet() で HashMap のエントリを取得できます。",
    answer: `import java.util.*;\nclass Main {\n    public static void main(String[] args) {\n        HashMap<String,ArrayList<Integer>> grades = new HashMap<>();\n        grades.put("Alice", new ArrayList<>(Arrays.asList(80,75,90)));\n        grades.put("Bob",   new ArrayList<>(Arrays.asList(65,70,60)));\n        grades.put("Carol", new ArrayList<>(Arrays.asList(95,88,92)));\n        double totalAll = 0; int countAll = 0;\n        for(Map.Entry<String,ArrayList<Integer>> e : grades.entrySet()){\n            double avg=e.getValue().stream().mapToInt(i->i).average().orElse(0);\n            System.out.printf("%s の平均: %.1f%n",e.getKey(),avg);\n            totalAll+=e.getValue().stream().mapToInt(i->i).sum();\n            countAll+=e.getValue().size();\n        }\n        System.out.printf("全体平均: %.1f%n",totalAll/countAll);\n    }\n}`
  },
  {
    id: 5, rank: "GOLD",
    title: "Stream APIマスター",
    description: "Stream APIを使いこなす",
    question: "List<String> names = [\"Alice\",\"Bob\",\"Charlie\",\"David\",\"Eve\",\"Frank\"] を Stream API で：①3文字以上の名前をアルファベット順、②全名前を大文字で連結（カンマ区切り）、③名前の長さの合計、を出力してください。",
    requirements: ["filter + sorted + forEach を使う", "map + collect(joining) を使う", "mapToInt + sum を使う"],
    hint: "Collectors.joining(\", \") で文字列連結できます。",
    answer: `import java.util.*;\nimport java.util.stream.*;\nclass Main {\n    public static void main(String[] args) {\n        List<String> names = Arrays.asList("Alice","Bob","Charlie","David","Eve","Frank");\n        System.out.println("3文字以上(昇順):");\n        names.stream().filter(n->n.length()>=3).sorted().forEach(System.out::println);\n        String joined = names.stream().map(String::toUpperCase).collect(Collectors.joining(", "));\n        System.out.println("大文字連結: "+joined);\n        int totalLen = names.stream().mapToInt(String::length).sum();\n        System.out.println("長さの合計: "+totalLen);\n    }\n}`
  },
  {
    id: 6, rank: "GOLD",
    title: "汎用データ構造",
    description: "ジェネリクスでデータ構造を実装する",
    question: "ジェネリクスを使った Queue<T>（先入れ先出し）を LinkedList で実装してください。enqueue/dequeue/peek/isEmpty/size メソッドを実装し、Integer と String の両方でテストしてください。",
    requirements: ["Queue<T>クラスをジェネリクスで定義", "LinkedList<T> を内部データ構造に使用", "Integer と String 両方でテスト"],
    hint: "java.util.LinkedList の addLast/removeFirst を活用できます。",
    answer: `import java.util.LinkedList;\nclass Queue<T> {\n    private LinkedList<T> list = new LinkedList<>();\n    void enqueue(T item){list.addLast(item);}\n    T dequeue(){if(isEmpty())throw new RuntimeException("空");return list.removeFirst();}\n    T peek(){if(isEmpty())throw new RuntimeException("空");return list.getFirst();}\n    boolean isEmpty(){return list.isEmpty();}\n    int size(){return list.size();}\n}\nclass Main {\n    public static void main(String[] args) {\n        Queue<Integer> q1 = new Queue<>();\n        q1.enqueue(10); q1.enqueue(20); q1.enqueue(30);\n        System.out.println("Integer Queue: "+q1.dequeue()+", "+q1.dequeue()+", size="+q1.size());\n        Queue<String> q2 = new Queue<>();\n        q2.enqueue("Java"); q2.enqueue("Stream"); q2.enqueue("API");\n        System.out.println("peek: "+q2.peek());\n        while(!q2.isEmpty())System.out.println(q2.dequeue());\n    }\n}`
  }
];

const javaUnitGuides = [
  {
    id: "java-unit01", unit: "UNIT 01", title: "Hello Java & 基本出力",
    summary: "Javaプログラムの基本構造、System.out.println、変数と基本型を学ぶ。",
    points: [
      "Javaはすべてのコードをクラスの中に書く",
      "エントリーポイントは public static void main(String[] args)",
      "System.out.println() で改行付き出力、print() で改行なし",
      "基本型: int, double, boolean, char; 参照型: String"
    ],
    words: [
      { term: "public static void main", desc: "Javaプログラムの開始点となるメソッドシグネチャ" },
      { term: "System.out.println()", desc: "標準出力に改行付きで出力するメソッド" },
      { term: "String", desc: "文字列を表す参照型（大文字始まり）" }
    ]
  },
  {
    id: "java-unit02", unit: "UNIT 02", title: "制御構文",
    summary: "if-else、for、while、switch を学ぶ。",
    points: [
      "if-else で条件分岐",
      "for(int i=0; i<n; i++) で回数ループ",
      "while で条件ループ",
      "switch は case: break: を忘れずに"
    ],
    words: [
      { term: "for", desc: "初期化;条件;更新 の3つで制御する繰り返し文" },
      { term: "break", desc: "ループまたはswitch文を終了するキーワード" },
      { term: "continue", desc: "現在の反復をスキップして次に進むキーワード" }
    ]
  },
  {
    id: "java-unit03", unit: "UNIT 03", title: "配列とメソッド",
    summary: "配列の宣言・操作、メソッド定義、再帰を学ぶ。",
    points: [
      "int[] arr = new int[5] または {1,2,3} で配列を作成",
      "配列の長さは arr.length",
      "static メソッドは main から直接呼び出せる",
      "再帰は自分自身を呼び出すメソッド（基底ケースを忘れずに）"
    ],
    words: [
      { term: "int[]", desc: "int型の配列。宣言時にサイズか初期値を指定する" },
      { term: "static", desc: "インスタンスを作らずにクラスから直接呼べるメソッド/フィールド" },
      { term: "return", desc: "メソッドから値を返して処理を終了するキーワード" }
    ]
  },
  {
    id: "java-unit04", unit: "UNIT 04", title: "コレクション",
    summary: "ArrayList、HashMap、Collections クラスを学ぶ。",
    points: [
      "ArrayList<T> は可変長リスト（配列の代替）",
      "HashMap<K,V> はキーと値のペアを管理",
      "Collections.sort() でリストをソート",
      "ジェネリクス <T> で型安全なコレクションを使う"
    ],
    words: [
      { term: "ArrayList", desc: "サイズが可変の配列リスト。add/remove/get が使える" },
      { term: "HashMap", desc: "キーと値のペアを格納するハッシュテーブル" },
      { term: "import", desc: "他のパッケージのクラスを使うための宣言" }
    ]
  },
  {
    id: "java-unit05", unit: "UNIT 05", title: "クラスと継承",
    summary: "クラス定義、コンストラクタ、継承、@Override を学ぶ。",
    points: [
      "クラスはフィールドとメソッドの集まり",
      "コンストラクタはクラス名と同じ名前・戻り値なし",
      "extends でクラスを継承",
      "@Override でスーパークラスのメソッドを上書き"
    ],
    words: [
      { term: "constructor", desc: "オブジェクト生成時に呼ばれる初期化メソッド" },
      { term: "extends", desc: "クラスを継承するキーワード" },
      { term: "@Override", desc: "親クラスのメソッドをオーバーライドすることを明示するアノテーション" }
    ]
  },
  {
    id: "java-unit06", unit: "UNIT 06", title: "インターフェースと抽象クラス",
    summary: "interface、abstract class、ポリモーフィズムを学ぶ。",
    points: [
      "interface は実装を強制する契約",
      "abstract class は実装と抽象メソッドを混在できる",
      "implements でインターフェースを実装",
      "ポリモーフィズムで型を抽象的に扱える"
    ],
    words: [
      { term: "interface", desc: "メソッドのシグネチャだけを定義する型の契約" },
      { term: "abstract", desc: "実装を持たないメソッド/インスタンス化できないクラスを示すキーワード" },
      { term: "implements", desc: "インターフェースを実装するキーワード" }
    ]
  },
  {
    id: "java-unit07", unit: "UNIT 07", title: "例外処理とジェネリクス",
    summary: "try-catch-finally、カスタム例外、ジェネリクスクラスを学ぶ。",
    points: [
      "try-catch で例外をキャッチ",
      "throw でカスタム例外をスロー",
      "extends Exception でカスタム例外を定義",
      "<T> でジェネリクスの型パラメータを定義"
    ],
    words: [
      { term: "try-catch", desc: "例外が発生しうるコードを囲み、エラーを処理するブロック" },
      { term: "throw", desc: "例外オブジェクトを投げるキーワード" },
      { term: "Exception", desc: "検査例外の基底クラス" }
    ]
  },
  {
    id: "java-unit08", unit: "UNIT 08", title: "Stream API & ラムダ式",
    summary: "Java 8以降のStream API、ラムダ式、Optional を学ぶ。",
    points: [
      "stream() でコレクションをStreamに変換",
      "filter/map/sorted/collect/reduce で処理を連鎖",
      "ラムダ式 (引数) -> 式 で無名関数を表現",
      "Optional<T> でnull安全な処理が可能"
    ],
    words: [
      { term: "Stream", desc: "コレクションの要素を関数型スタイルで処理するパイプライン" },
      { term: "lambda", desc: "(引数)->式 の形で書く無名関数。Java 8から導入" },
      { term: "Optional", desc: "値が存在するか不明な場合にnullの代わりに使うコンテナ型" }
    ]
  }
];

// ===== C# データ =====

const csharpProblems = [
  // UNIT 01
  {
    id: 1, rank: "ROOKIE", unit: "UNIT 01", title: "Hello, C#!",
    question: "\"Hello, C#!\" と出力してください。",
    requirements: ["Console.WriteLine() を使う"],
    hint: "Console.WriteLine(\"文字列\") で出力できます。",
    answer: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, C#!");\n    }\n}`
  },
  {
    id: 2, rank: "ROOKIE", unit: "UNIT 01", title: "変数と型",
    question: "int型変数 age に 28、string型変数 name に \"CSharp\" を代入して \"名前: CSharp, 年齢: 28\" と出力してください。",
    requirements: ["int と string 変数を宣言する", "Console.WriteLine で出力する"],
    hint: "int age = 28; string name = \"CSharp\"; のように宣言できます。",
    answer: `using System;\nclass Program {\n    static void Main() {\n        int age = 28;\n        string name = "CSharp";\n        Console.WriteLine("名前: " + name + ", 年齢: " + age);\n    }\n}`
  },
  {
    id: 3, rank: "ROOKIE", unit: "UNIT 01", title: "文字列補間",
    question: "string変数 city に \"Tokyo\" を代入し、文字列補間 $\"...\" を使って \"Welcome to Tokyo!\" と出力してください。",
    requirements: ["$\"...\" 構文を使う", "変数 city を埋め込む"],
    hint: "$\"Welcome to {city}!\" のように書きます。",
    answer: `using System;\nclass Program {\n    static void Main() {\n        string city = "Tokyo";\n        Console.WriteLine($"Welcome to {city}!");\n    }\n}`
  },
  {
    id: 4, rank: "ROOKIE", unit: "UNIT 01", title: "基本演算",
    question: "int変数 a=15, b=4 を宣言し、和・差・積・商・余りを各行に出力してください。",
    requirements: ["a+b, a-b, a*b, a/b, a%b をそれぞれ出力する"],
    hint: "整数同士の除算は整数になります。15/4=3",
    answer: `using System;\nclass Program {\n    static void Main() {\n        int a = 15, b = 4;\n        Console.WriteLine(a + b);\n        Console.WriteLine(a - b);\n        Console.WriteLine(a * b);\n        Console.WriteLine(a / b);\n        Console.WriteLine(a % b);\n    }\n}`
  },
  // UNIT 02
  {
    id: 5, rank: "ROOKIE", unit: "UNIT 02", title: "if-else",
    question: "int変数 score に 75 を代入し、60以上なら \"合格\"、未満なら \"不合格\" と出力してください。",
    requirements: ["if-else を使う"],
    hint: "if (score >= 60) { ... } else { ... }",
    answer: `using System;\nclass Program {\n    static void Main() {\n        int score = 75;\n        if (score >= 60) Console.WriteLine("合格");\n        else Console.WriteLine("不合格");\n    }\n}`
  },
  {
    id: 6, rank: "ROOKIE", unit: "UNIT 02", title: "forループ",
    question: "for ループで 1 から 5 まで順に出力してください。",
    requirements: ["for (int i = 1; i <= 5; i++) を使う"],
    hint: "ループ変数を Console.WriteLine で出力します。",
    answer: `using System;\nclass Program {\n    static void Main() {\n        for (int i = 1; i <= 5; i++) Console.WriteLine(i);\n    }\n}`
  },
  {
    id: 7, rank: "ROOKIE", unit: "UNIT 02", title: "whileループ",
    question: "while ループで 10 から 1 まで逆順に出力してください。",
    requirements: ["while を使う", "10, 9, ..., 1 の順に出力する"],
    hint: "int n = 10; while (n >= 1) { ... n--; }",
    answer: `using System;\nclass Program {\n    static void Main() {\n        int n = 10;\n        while (n >= 1) { Console.WriteLine(n); n--; }\n    }\n}`
  },
  {
    id: 8, rank: "ROOKIE", unit: "UNIT 02", title: "foreach",
    question: "string配列 fruits = {\"Apple\", \"Banana\", \"Cherry\"} を foreach で各要素を出力してください。",
    requirements: ["string[] 配列を作る", "foreach を使う"],
    hint: "foreach (string f in fruits) { Console.WriteLine(f); }",
    answer: `using System;\nclass Program {\n    static void Main() {\n        string[] fruits = {"Apple", "Banana", "Cherry"};\n        foreach (string f in fruits) Console.WriteLine(f);\n    }\n}`
  },
  // UNIT 03
  {
    id: 9, rank: "BRONZE", unit: "UNIT 03", title: "配列操作",
    question: "int配列 {3,1,4,1,5,9,2,6} を宣言し、Array.Sort で昇順ソートして全要素を出力してください。",
    requirements: ["int[] 配列を宣言する", "Array.Sort() で並び替える", "foreach で出力する"],
    hint: "Array.Sort(arr) で配列をインプレースにソートできます。",
    answer: `using System;\nclass Program {\n    static void Main() {\n        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6};\n        Array.Sort(arr);\n        foreach (int x in arr) Console.Write(x + " ");\n        Console.WriteLine();\n    }\n}`
  },
  {
    id: 10, rank: "BRONZE", unit: "UNIT 03", title: "List<T>",
    question: "List<int> を作り、1〜5 を Add で追加後、Remove(3) で3を削除し、全要素を出力してください。",
    requirements: ["List<int> を使う", "Add で要素を追加する", "Remove で要素を削除する"],
    hint: "using System.Collections.Generic; が必要です（または using System;）。",
    answer: `using System;\nusing System.Collections.Generic;\nclass Program {\n    static void Main() {\n        var list = new List<int> {1, 2, 3, 4, 5};\n        list.Remove(3);\n        foreach (int x in list) Console.Write(x + " ");\n        Console.WriteLine();\n    }\n}`
  },
  {
    id: 11, rank: "BRONZE", unit: "UNIT 03", title: "Dictionary",
    question: "Dictionary<string, int> で \"Apple\"→120, \"Banana\"→80, \"Cherry\"→200 を登録し、foreach でキーと値を \"Apple: 120\" 形式で出力してください。",
    requirements: ["Dictionary<string, int> を使う", "foreach で KeyValuePair を取り出す"],
    hint: "foreach (var kv in dict) { Console.WriteLine(kv.Key + \": \" + kv.Value); }",
    answer: `using System;\nusing System.Collections.Generic;\nclass Program {\n    static void Main() {\n        var dict = new Dictionary<string, int> {\n            {"Apple", 120}, {"Banana", 80}, {"Cherry", 200}\n        };\n        foreach (var kv in dict)\n            Console.WriteLine($"{kv.Key}: {kv.Value}");\n    }\n}`
  },
  {
    id: 12, rank: "BRONZE", unit: "UNIT 03", title: "文字列操作",
    question: "string s = \"Hello, World!\" に対して、ToUpper()・Length・Replace(\"World\", \"C#\") の結果を各行に出力してください。",
    requirements: ["ToUpper() で大文字変換", "Length で長さ", "Replace() で置換"],
    hint: "s.ToUpper(), s.Length, s.Replace(...) で各操作できます。",
    answer: `using System;\nclass Program {\n    static void Main() {\n        string s = "Hello, World!";\n        Console.WriteLine(s.ToUpper());\n        Console.WriteLine(s.Length);\n        Console.WriteLine(s.Replace("World", "C#"));\n    }\n}`
  },
  // UNIT 04
  {
    id: 13, rank: "BRONZE", unit: "UNIT 04", title: "メソッド定義",
    question: "int型の引数 a, b を受け取り大きい方を返す Max メソッドを定義し、Max(7, 3) と Max(2, 9) の結果を出力してください。",
    requirements: ["static int Max(int a, int b) を定義する", "三項演算子か if を使う"],
    hint: "return a > b ? a : b; で大きい方を返せます。",
    answer: `using System;\nclass Program {\n    static int Max(int a, int b) => a > b ? a : b;\n    static void Main() {\n        Console.WriteLine(Max(7, 3));\n        Console.WriteLine(Max(2, 9));\n    }\n}`
  },
  {
    id: 14, rank: "BRONZE", unit: "UNIT 04", title: "再帰関数",
    question: "再帰を使って階乗を計算する Factorial メソッドを実装し、5! = 120 を出力してください。",
    requirements: ["再帰呼び出しを使う", "Factorial(5) が 120 を返す"],
    hint: "Factorial(0) = 1, Factorial(n) = n * Factorial(n-1)",
    answer: `using System;\nclass Program {\n    static long Factorial(int n) => n <= 1 ? 1 : n * Factorial(n - 1);\n    static void Main() {\n        Console.WriteLine(Factorial(5));\n    }\n}`
  },
  {
    id: 15, rank: "BRONZE", unit: "UNIT 04", title: "Mathクラス",
    question: "Math.Pow(2, 10)、Math.Sqrt(144)、Math.Abs(-7) の結果を各行に出力してください。",
    requirements: ["Math.Pow() で累乗", "Math.Sqrt() で平方根", "Math.Abs() で絶対値"],
    hint: "結果は double 型です。Math.Sqrt(144) = 12.0 など。",
    answer: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine(Math.Pow(2, 10));\n        Console.WriteLine(Math.Sqrt(144));\n        Console.WriteLine(Math.Abs(-7));\n    }\n}`
  },
  {
    id: 16, rank: "BRONZE", unit: "UNIT 04", title: "LINQ基礎",
    question: "int[] numbers = {1,2,3,4,5,6,7,8,9,10} から、LINQ の Where で偶数だけ絞り込み、Select で2倍にして出力してください。",
    requirements: ["using System.Linq; を追加", "Where(x => x % 2 == 0) で偶数フィルタ", "Select(x => x * 2) で変換"],
    hint: "numbers.Where(...).Select(...) とメソッドチェーンで書けます。",
    answer: `using System;\nusing System.Linq;\nclass Program {\n    static void Main() {\n        int[] numbers = {1,2,3,4,5,6,7,8,9,10};\n        var result = numbers.Where(x => x % 2 == 0).Select(x => x * 2);\n        foreach (int x in result) Console.Write(x + " ");\n        Console.WriteLine();\n    }\n}`
  },
  // UNIT 05
  {
    id: 17, rank: "SILVER", unit: "UNIT 05", title: "クラスとコンストラクタ",
    question: "string Name と int Age プロパティを持つ Person クラスを作り、コンストラクタで初期化して \"Alice (30)\" と出力してください。",
    requirements: ["class Person を定義する", "コンストラクタで Name と Age を初期化", "インスタンスを作って出力する"],
    hint: "public Person(string name, int age) { Name = name; Age = age; }",
    answer:
`using System;
class Person {
    public string Name { get; }
    public int Age { get; }
    public Person(string name, int age) { Name = name; Age = age; }
    public override string ToString() => $"{Name} ({Age})";
}
class Program {
    static void Main() {
        var p = new Person("Alice", 30);
        Console.WriteLine(p);
    }
}`
  },
  {
    id: 18, rank: "SILVER", unit: "UNIT 05", title: "プロパティ",
    question: "Temperature クラスに double Celsius プロパティを持ち、Fahrenheit は get のみで Celsius * 9/5 + 32 を返すプロパティを実装してください。100℃ のとき 212°F と出力してください。",
    requirements: ["Celsius は get; set; プロパティ", "Fahrenheit は計算プロパティ"],
    hint: "public double Fahrenheit => Celsius * 9.0 / 5.0 + 32;",
    answer:
`using System;
class Temperature {
    public double Celsius { get; set; }
    public double Fahrenheit => Celsius * 9.0 / 5.0 + 32;
}
class Program {
    static void Main() {
        var t = new Temperature { Celsius = 100 };
        Console.WriteLine($"{t.Celsius}°C = {t.Fahrenheit}°F");
    }
}`
  },
  {
    id: 19, rank: "SILVER", unit: "UNIT 05", title: "継承とオーバーライド",
    question: "Animal クラスに virtual string Sound() を定義し、Dog と Cat に override して \"ワン\" \"ニャン\" を返すサブクラスを作り、それぞれの Sound() を出力してください。",
    requirements: ["Animal クラスを基底クラスにする", "Dog と Cat で override する"],
    hint: "public override string Sound() => \"ワン\";",
    answer:
`using System;
class Animal {
    public virtual string Sound() => "...";
}
class Dog : Animal {
    public override string Sound() => "ワン";
}
class Cat : Animal {
    public override string Sound() => "ニャン";
}
class Program {
    static void Main() {
        Animal[] animals = { new Dog(), new Cat() };
        foreach (var a in animals) Console.WriteLine(a.Sound());
    }
}`
  },
  {
    id: 20, rank: "SILVER", unit: "UNIT 05", title: "インターフェース",
    question: "double Area() メソッドを持つ IShape インターフェースを定義し、Circle と Rectangle に実装して面積を出力してください（Circle: r=5, Rectangle: 4×6）。",
    requirements: ["interface IShape { double Area(); } を定義", "Circle と Rectangle に実装"],
    hint: "class Circle : IShape { public double Area() => Math.PI * r * r; }",
    answer:
`using System;
interface IShape { double Area(); }
class Circle : IShape {
    double r;
    public Circle(double r) { this.r = r; }
    public double Area() => Math.PI * r * r;
}
class Rectangle : IShape {
    double w, h;
    public Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double Area() => w * h;
}
class Program {
    static void Main() {
        IShape[] shapes = { new Circle(5), new Rectangle(4, 6) };
        foreach (var s in shapes) Console.WriteLine($"{s.GetType().Name}: {s.Area():F2}");
    }
}`
  },
  // UNIT 06
  {
    id: 21, rank: "SILVER", unit: "UNIT 06", title: "抽象クラス",
    question: "abstract class Shape に abstract double Area() を定義し、Triangle（底辺・高さ）に実装して面積を出力してください（底辺6, 高さ4 → 12）。",
    requirements: ["abstract class を定義する", "abstract メソッドをサブクラスで実装する"],
    hint: "public override double Area() => base * height / 2;",
    answer:
`using System;
abstract class Shape {
    public abstract double Area();
}
class Triangle : Shape {
    double b, h;
    public Triangle(double b, double h) { this.b = b; this.h = h; }
    public override double Area() => b * h / 2;
}
class Program {
    static void Main() {
        Shape t = new Triangle(6, 4);
        Console.WriteLine(t.Area());
    }
}`
  },
  {
    id: 22, rank: "SILVER", unit: "UNIT 06", title: "try-catch",
    question: "int.Parse に \"abc\" を渡して FormatException をキャッチし、\"数値変換エラー\" と出力してください。finally ブロックで \"処理完了\" も出力してください。",
    requirements: ["try-catch-finally を使う", "FormatException をキャッチする"],
    hint: "catch (FormatException e) { Console.WriteLine(\"エラー: \" + e.Message); }",
    answer:
`using System;
class Program {
    static void Main() {
        try {
            int n = int.Parse("abc");
        } catch (FormatException) {
            Console.WriteLine("数値変換エラー");
        } finally {
            Console.WriteLine("処理完了");
        }
    }
}`
  },
  {
    id: 23, rank: "GOLD", unit: "UNIT 06", title: "カスタム例外",
    question: "AgeException クラス（Exception継承）を定義し、年齢が0未満または150超の場合に投げる ValidateAge メソッドを実装してください（-1 と 200 でテスト）。",
    requirements: ["Exception を継承した AgeException を定義", "ValidateAge で範囲チェックして投げる"],
    hint: "class AgeException : Exception { public AgeException(string msg) : base(msg) {} }",
    answer:
`using System;
class AgeException : Exception {
    public AgeException(string msg) : base(msg) {}
}
class Program {
    static void ValidateAge(int age) {
        if (age < 0 || age > 150)
            throw new AgeException($"無効な年齢: {age}");
    }
    static void Main() {
        foreach (int age in new[] { -1, 200 }) {
            try { ValidateAge(age); }
            catch (AgeException e) { Console.WriteLine(e.Message); }
        }
    }
}`
  },
  {
    id: 24, rank: "GOLD", unit: "UNIT 06", title: "ジェネリクス",
    question: "型パラメータ T を使った Stack<T> クラスを実装してください（Push/Pop/Peek/Count）。int と string の両方でテストしてください。",
    requirements: ["class Stack<T> を定義する", "List<T> を内部で使う", "Push/Pop/Peek/Count を実装"],
    hint: "private List<T> items = new List<T>(); を内部に持ちます。",
    answer:
`using System;
using System.Collections.Generic;
class Stack<T> {
    private List<T> items = new List<T>();
    public void Push(T item) => items.Add(item);
    public T Pop() { var v = items[items.Count-1]; items.RemoveAt(items.Count-1); return v; }
    public T Peek() => items[items.Count-1];
    public int Count => items.Count;
}
class Program {
    static void Main() {
        var s = new Stack<int>();
        s.Push(1); s.Push(2); s.Push(3);
        Console.WriteLine(s.Peek());
        Console.WriteLine(s.Pop());
        Console.WriteLine(s.Count);
    }
}`
  },
  // UNIT 07
  {
    id: 25, rank: "GOLD", unit: "UNIT 07", title: "Nullable型",
    question: "int? 型変数 value に null を代入し、HasValue で確認して、null のときは -1 を、そうでなければ値を出力してください。null合体演算子 ?? も使ってください。",
    requirements: ["int? 型を使う", "HasValue プロパティで確認", "?? 演算子でデフォルト値を設定"],
    hint: "int result = value ?? -1; で null のとき -1 になります。",
    answer: `using System;\nclass Program {\n    static void Main() {\n        int? value = null;\n        Console.WriteLine(value.HasValue);\n        Console.WriteLine(value ?? -1);\n        value = 42;\n        Console.WriteLine(value ?? -1);\n    }\n}`
  },
  {
    id: 26, rank: "GOLD", unit: "UNIT 07", title: "ラムダ式",
    question: "Func<int, int> で「x の二乗を返す」ラムダ式を作り、1〜5 に適用して出力してください。Action<string> で \"Hello {s}\" を出力するラムダも作ってください。",
    requirements: ["Func<int, int> ラムダを定義する", "Action<string> ラムダを定義する"],
    hint: "Func<int, int> square = x => x * x;",
    answer: `using System;\nclass Program {\n    static void Main() {\n        Func<int, int> square = x => x * x;\n        for (int i = 1; i <= 5; i++) Console.Write(square(i) + " ");\n        Console.WriteLine();\n        Action<string> greet = s => Console.WriteLine($"Hello {s}");\n        greet("World");\n    }\n}`
  },
  {
    id: 27, rank: "DIAMOND", unit: "UNIT 07", title: "LINQ応用",
    question: "文字列リスト {\"Alice\", \"Bob\", \"Charlie\", \"Dave\", \"Eve\"} から、名前の長さが4以上のものを長さ降順でソートして出力してください。",
    requirements: ["Where で長さ4以上をフィルタ", "OrderByDescending で長さ降順ソート"],
    hint: "list.Where(s => s.Length >= 4).OrderByDescending(s => s.Length)",
    answer: `using System;\nusing System.Linq;\nusing System.Collections.Generic;\nclass Program {\n    static void Main() {\n        var names = new List<string> {"Alice", "Bob", "Charlie", "Dave", "Eve"};\n        var result = names.Where(s => s.Length >= 4).OrderByDescending(s => s.Length);\n        foreach (var n in result) Console.WriteLine(n);\n    }\n}`
  },
  {
    id: 28, rank: "DIAMOND", unit: "UNIT 07", title: "LINQグループ化",
    question: "int[] {1,2,3,4,5,6,7,8,9,10} を偶数・奇数でグループ化し、各グループのキーと合計を出力してください。",
    requirements: ["GroupBy で偶奇分類する", "各グループの Sum() を計算する"],
    hint: "numbers.GroupBy(x => x % 2 == 0 ? \"偶数\" : \"奇数\")",
    answer: `using System;\nusing System.Linq;\nclass Program {\n    static void Main() {\n        int[] numbers = {1,2,3,4,5,6,7,8,9,10};\n        foreach (var g in numbers.GroupBy(x => x % 2 == 0 ? "偶数" : "奇数"))\n            Console.WriteLine($"{g.Key}: 合計={g.Sum()}");\n    }\n}`
  },
  // UNIT 08
  {
    id: 29, rank: "MASTER", unit: "UNIT 08", title: "デリゲートと高階関数",
    question: "int[] {1,2,3,4,5} に対して Apply メソッドを作り、Func<int,int> を受け取って各要素に適用した新しい配列を返してください。二乗と三倍の2パターンでテストしてください。",
    requirements: ["static int[] Apply(int[] arr, Func<int,int> f) を定義", "二乗と3倍でテスト"],
    hint: "return arr.Select(f).ToArray(); または for ループで実装できます。",
    answer:
`using System;
using System.Linq;
class Program {
    static int[] Apply(int[] arr, Func<int,int> f) => arr.Select(f).ToArray();
    static void Main() {
        int[] nums = {1, 2, 3, 4, 5};
        Console.WriteLine("二乗: " + string.Join(" ", Apply(nums, x => x * x)));
        Console.WriteLine("三倍: " + string.Join(" ", Apply(nums, x => x * 3)));
    }
}`
  },
  {
    id: 30, rank: "LEGEND", unit: "UNIT 08", title: "LINQ総合演習",
    question: "Student クラス（Name, Score, Grade）のリストを作り、LINQ で: ①Gradeごとにグループ化して各グループの平均スコアを出力、②スコア上位3人の名前を出力、③ScoreがAverage以上の生徒数を出力してください。",
    requirements: ["Student クラスを定義する", "GroupBy でグループ化して平均を出す", "OrderByDescending + Take で上位3人を出す", "Count で平均以上を数える"],
    hint: "var avg = students.Average(s => s.Score); で平均が取れます。",
    answer:
`using System;
using System.Linq;
using System.Collections.Generic;
class Student {
    public string Name { get; set; }
    public int Score { get; set; }
    public string Grade { get; set; }
}
class Program {
    static void Main() {
        var students = new List<Student> {
            new Student { Name="Alice",   Score=92, Grade="A" },
            new Student { Name="Bob",     Score=75, Grade="B" },
            new Student { Name="Charlie", Score=88, Grade="A" },
            new Student { Name="Dave",    Score=60, Grade="C" },
            new Student { Name="Eve",     Score=95, Grade="A" },
            new Student { Name="Frank",   Score=70, Grade="B" }
        };
        Console.WriteLine("=== グレード別平均 ===");
        foreach (var g in students.GroupBy(s => s.Grade).OrderBy(g => g.Key))
            Console.WriteLine($"{g.Key}: {g.Average(s => s.Score):F1}");
        Console.WriteLine("=== 上位3人 ===");
        foreach (var s in students.OrderByDescending(s => s.Score).Take(3))
            Console.WriteLine(s.Name);
        double avg = students.Average(s => s.Score);
        Console.WriteLine($"=== 平均以上: {students.Count(s => s.Score >= avg)}人 ===");
    }
}`
  }
];

const csharpMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "配列・Listマスター",
    description: "数値コレクションの集計・ソート・フィルタリング",
    question: "int[] {64, 34, 25, 12, 22, 11, 90} を: ①バブルソートで昇順に並べる、②偶数のみ抽出して合計を出力、③最大値・最小値・平均を出力してください。",
    requirements: ["バブルソートを自力実装する（Array.Sortは使わない）", "偶数フィルタ・合計・最大・最小・平均を出力"],
    hint: "二重ループで隣接要素を比較・交換するのがバブルソートです。",
    answer:
`using System;
using System.Linq;
class Program {
    static void Main() {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        for (int i = 0; i < arr.Length - 1; i++)
            for (int j = 0; j < arr.Length - 1 - i; j++)
                if (arr[j] > arr[j+1]) { int tmp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = tmp; }
        Console.WriteLine("ソート: " + string.Join(" ", arr));
        var evens = arr.Where(x => x % 2 == 0).ToArray();
        Console.WriteLine("偶数合計: " + evens.Sum());
        Console.WriteLine($"最大:{arr.Max()} 最小:{arr.Min()} 平均:{arr.Average():F1}");
    }
}`
  },
  {
    id: 2, rank: "BRONZE",
    title: "文字列処理マスター",
    description: "Split/Join/Replace/Containsを組み合わせた処理",
    question: "カンマ区切り文字列 \"apple,banana,cherry,apricot,avocado\" を: ①Split で分割、②'a' で始まる単語を抽出、③各単語を大文字に変換してスペース区切りで出力してください。",
    requirements: ["Split(',') で分割", "StartsWith('a') でフィルタ", "ToUpper() と string.Join() を使う"],
    hint: "words.Where(w => w.StartsWith(\"a\")) でフィルタできます。",
    answer:
`using System;
using System.Linq;
class Program {
    static void Main() {
        string csv = "apple,banana,cherry,apricot,avocado";
        string[] words = csv.Split(',');
        Console.WriteLine("全単語: " + words.Length + "個");
        var aWords = words.Where(w => w.StartsWith("a")).Select(w => w.ToUpper());
        Console.WriteLine("a始まり(大文字): " + string.Join(" ", aWords));
    }
}`
  },
  {
    id: 3, rank: "SILVER",
    title: "OOPデザイン",
    description: "継承とinterfaceを使ったクラス設計",
    question: "IPayable インターフェース（double MonthlyPay() メソッド）を定義し、Employee（基本給）と Contractor（時給×時間）クラスに実装してください。各インスタンスの支払額を出力してください。",
    requirements: ["IPayable インターフェースを定義", "Employee（基本給 300000）と Contractor（時給 2000×160時間）を実装", "多態性で処理する"],
    hint: "IPayable[] workers = { new Employee(...), new Contractor(...) }; で統一処理できます。",
    answer:
`using System;
interface IPayable { double MonthlyPay(); }
class Employee : IPayable {
    string Name; double BaseSalary;
    public Employee(string name, double salary) { Name = name; BaseSalary = salary; }
    public double MonthlyPay() => BaseSalary;
    public override string ToString() => Name;
}
class Contractor : IPayable {
    string Name; double HourlyRate; int Hours;
    public Contractor(string name, double rate, int hours) { Name = name; HourlyRate = rate; Hours = hours; }
    public double MonthlyPay() => HourlyRate * Hours;
    public override string ToString() => Name;
}
class Program {
    static void Main() {
        IPayable[] workers = { new Employee("Alice", 300000), new Contractor("Bob", 2000, 160) };
        foreach (var w in workers)
            Console.WriteLine($"{w}: {w.MonthlyPay():C0}");
    }
}`
  },
  {
    id: 4, rank: "SILVER",
    title: "LINQの活用",
    description: "Where/Select/OrderBy/GroupByの組み合わせ",
    question: "Product クラス（Name, Price, Category）のリストを作り: ①Food カテゴリの平均価格、②Price > 100 の商品を安い順に、③カテゴリ別の商品数を出力してください。",
    requirements: ["Product クラスを定義する", "Where/Average/OrderBy/GroupBy を使う"],
    hint: "products.GroupBy(p => p.Category) でカテゴリ別にグループ化できます。",
    answer:
`using System;
using System.Linq;
using System.Collections.Generic;
class Product {
    public string Name { get; set; }
    public double Price { get; set; }
    public string Category { get; set; }
}
class Program {
    static void Main() {
        var products = new List<Product> {
            new Product { Name="Rice",   Price=80,  Category="Food" },
            new Product { Name="Bread",  Price=120, Category="Food" },
            new Product { Name="Pen",    Price=50,  Category="Stationery" },
            new Product { Name="Notebook",Price=200,Category="Stationery" },
            new Product { Name="Milk",   Price=90,  Category="Food" }
        };
        Console.WriteLine($"Food平均: {products.Where(p=>p.Category=="Food").Average(p=>p.Price):F1}");
        Console.WriteLine("100超(安い順):");
        foreach (var p in products.Where(p=>p.Price>100).OrderBy(p=>p.Price))
            Console.WriteLine($"  {p.Name} {p.Price}");
        Console.WriteLine("カテゴリ別件数:");
        foreach (var g in products.GroupBy(p=>p.Category))
            Console.WriteLine($"  {g.Key}: {g.Count()}件");
    }
}`
  },
  {
    id: 5, rank: "GOLD",
    title: "例外処理設計",
    description: "try-catch-finally + カスタム例外の設計",
    question: "BankAccount クラスを作り、残高不足の Withdraw 時は InsufficientFundsException を投げてください。入金・出金・残高確認を含む一連の操作をデモしてください。",
    requirements: ["InsufficientFundsException クラスを定義", "BankAccount の Withdraw でチェック", "try-catch-finally で操作をラップ"],
    hint: "if (amount > Balance) throw new InsufficientFundsException(...);",
    answer:
`using System;
class InsufficientFundsException : Exception {
    public InsufficientFundsException(double amount) : base($"残高不足: {amount}円が引き出せません") {}
}
class BankAccount {
    public double Balance { get; private set; }
    public BankAccount(double initial) { Balance = initial; }
    public void Deposit(double amount) { Balance += amount; Console.WriteLine($"入金: {amount}円 → 残高: {Balance}円"); }
    public void Withdraw(double amount) {
        if (amount > Balance) throw new InsufficientFundsException(amount);
        Balance -= amount;
        Console.WriteLine($"出金: {amount}円 → 残高: {Balance}円");
    }
}
class Program {
    static void Main() {
        var acc = new BankAccount(1000);
        try {
            acc.Deposit(500);
            acc.Withdraw(800);
            acc.Withdraw(900);
        } catch (InsufficientFundsException e) {
            Console.WriteLine("エラー: " + e.Message);
        } finally {
            Console.WriteLine($"最終残高: {acc.Balance}円");
        }
    }
}`
  },
  {
    id: 6, rank: "GOLD",
    title: "ジェネリクスコレクション",
    description: "汎用スタック/キューの実装",
    question: "IContainer<T> インターフェース（Add/Remove/Peek/Count）を定義し、MyStack<T> と MyQueue<T> を実装してください。int で動作確認してください。",
    requirements: ["interface IContainer<T> を定義する", "MyStack<T>（LIFO）と MyQueue<T>（FIFO）を実装", "それぞれ 3 要素で動作確認"],
    hint: "Stack は末尾追加・末尾取得、Queue は末尾追加・先頭取得です。",
    answer:
`using System;
using System.Collections.Generic;
interface IContainer<T> { void Add(T item); T Remove(); T Peek(); int Count { get; } }
class MyStack<T> : IContainer<T> {
    List<T> d = new List<T>();
    public void Add(T item) => d.Add(item);
    public T Remove() { var v = d[d.Count-1]; d.RemoveAt(d.Count-1); return v; }
    public T Peek() => d[d.Count-1];
    public int Count => d.Count;
}
class MyQueue<T> : IContainer<T> {
    List<T> d = new List<T>();
    public void Add(T item) => d.Add(item);
    public T Remove() { var v = d[0]; d.RemoveAt(0); return v; }
    public T Peek() => d[0];
    public int Count => d.Count;
}
class Program {
    static void Main() {
        var stack = new MyStack<int>();
        stack.Add(1); stack.Add(2); stack.Add(3);
        Console.WriteLine("Stack: " + stack.Remove() + " " + stack.Remove());
        var queue = new MyQueue<int>();
        queue.Add(1); queue.Add(2); queue.Add(3);
        Console.WriteLine("Queue: " + queue.Remove() + " " + queue.Remove());
    }
}`
  }
];

const csharpUnitGuides = [
  {
    id: "csharp-unit01", unit: "UNIT 01", title: "Hello C# & 変数",
    summary: "Console.WriteLine、変数宣言（int/double/string/bool）、文字列補間 $\"\" を学ぶ。",
    points: ["Console.WriteLine() でコンソール出力", "int, double, string, bool が基本型", "$\"Hello {name}\" で変数を文字列に埋め込める", "var キーワードで型推論も可能"],
    words: [{ term: "Console.WriteLine", desc: "改行付きでコンソールに出力するメソッド" }, { term: "string補間", desc: "$\"...{変数}...\" で変数を直接埋め込む構文" }, { term: "var", desc: "型推論による変数宣言。右辺から型が決まる" }]
  },
  {
    id: "csharp-unit02", unit: "UNIT 02", title: "制御フロー",
    summary: "if-else、for、while、foreach による処理の流れを制御する方法を学ぶ。",
    points: ["if-else で条件分岐", "for ループでカウンタ制御の繰り返し", "while で条件が真の間繰り返す", "foreach でコレクションの各要素を処理"],
    words: [{ term: "for", desc: "初期化;条件;更新 の3パートを持つループ" }, { term: "foreach", desc: "コレクションの各要素を順に処理するループ" }, { term: "break/continue", desc: "ループを即終了/次の反復へスキップ" }]
  },
  {
    id: "csharp-unit03", unit: "UNIT 03", title: "コレクション",
    summary: "配列、List<T>、Dictionary<K,V> の使い方と文字列操作を学ぶ。",
    points: ["int[] で固定長配列、List<T> で可変長リスト", "Dictionary<K,V> でキーと値のペアを管理", "Array.Sort() で配列をソート", "string は Split/Join/Replace/Contains などメソッドが豊富"],
    words: [{ term: "List<T>", desc: "型安全な可変長リスト。Add/Remove/Contains が使える" }, { term: "Dictionary<K,V>", desc: "キーと値のペアを格納するコレクション" }, { term: "generic", desc: "<T> のような型パラメータを持つ型・メソッド" }]
  },
  {
    id: "csharp-unit04", unit: "UNIT 04", title: "メソッドとLINQ基礎",
    summary: "静的メソッド、再帰、Mathクラス、LINQの基本的な使い方を学ぶ。",
    points: ["static メソッドはインスタンス不要で呼び出せる", "再帰はメソッドが自分自身を呼び出す手法", "Math クラスに Pow/Sqrt/Abs などが揃っている", "LINQ の Where/Select でコレクションをフィルタ・変換"],
    words: [{ term: "static", desc: "クラスのインスタンスなしで呼び出せるメソッド/フィールド" }, { term: "LINQ", desc: "Language Integrated Query。コレクション操作を宣言的に書ける" }, { term: "=> 式体", desc: "=> を使ったシンプルなメソッド記法" }]
  },
  {
    id: "csharp-unit05", unit: "UNIT 05", title: "OOP基礎",
    summary: "クラス、コンストラクタ、プロパティ、継承、インターフェースを学ぶ。",
    points: ["class でデータと動作をカプセル化", "コンストラクタでインスタンス生成時に初期化", "プロパティ（get/set）でフィールドへのアクセスを制御", "interface で型に関係なく共通の振る舞いを保証"],
    words: [{ term: "constructor", desc: "new でインスタンス生成時に実行される初期化メソッド" }, { term: "property", desc: "get/set アクセサを持つクラスメンバー" }, { term: "interface", desc: "実装を持たない契約の定義。クラスが実装する" }]
  },
  {
    id: "csharp-unit06", unit: "UNIT 06", title: "抽象クラスと例外",
    summary: "abstract class、try-catch-finally、カスタム例外、ジェネリクスを学ぶ。",
    points: ["abstract class は直接インスタンス化できない基底クラス", "try-catch で例外を安全にハンドリング", "finally は例外の有無に関わらず必ず実行される", "Exception を継承してカスタム例外を作れる"],
    words: [{ term: "abstract", desc: "実装を持たない（サブクラスに委ねる）メソッド/クラス" }, { term: "try-catch", desc: "例外が発生しうるコードを囲んでキャッチする構文" }, { term: "finally", desc: "例外の有無にかかわらず必ず実行されるブロック" }]
  },
  {
    id: "csharp-unit07", unit: "UNIT 07", title: "ラムダとLINQ応用",
    summary: "Nullable型、Func/Action、ラムダ式、高度なLINQ操作を学ぶ。",
    points: ["int? など ? 付き型で null を許容できる", "?? 演算子で null のときのデフォルト値を指定", "Func<T,R> と Action<T> で関数を変数として扱える", "OrderBy/GroupBy/Aggregate など高度なLINQが使える"],
    words: [{ term: "Nullable<T>", desc: "値型を null 許容にする型。T? と書く" }, { term: "Func<T,R>", desc: "T を引数に取り R を返す関数型" }, { term: "GroupBy", desc: "コレクションをキーでグループ化するLINQメソッド" }]
  },
  {
    id: "csharp-unit08", unit: "UNIT 08", title: "高度な機能と総合演習",
    summary: "デリゲート、高階関数、async/awaitの概念、LINQの総合的な活用を学ぶ。",
    points: ["delegate は関数を型として扱う仕組み", "Func/Action はデリゲートの汎用版", "高階関数は関数を引数や戻り値にする関数", "LINQ + クラス設計の組み合わせで実用的なデータ処理が書ける"],
    words: [{ term: "delegate", desc: "メソッドを参照するオブジェクト。型安全な関数ポインタ" }, { term: "高階関数", desc: "関数を引数に取るか関数を返す関数" }, { term: "async/await", desc: "非同期処理を同期的に書けるキーワード" }]
  }
];

// ===== Go データ =====

const goProblems = [
  // UNIT 01
  {
    id: 1, rank: "ROOKIE", unit: "UNIT 01", title: "Hello, Go!",
    question: "\"Hello, Go!\" と出力してください。",
    requirements: ["fmt.Println() を使う", "package main と import \"fmt\" を忘れずに"],
    hint: "fmt.Println(\"文字列\") で改行付き出力ができます。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Go!")\n}`
  },
  {
    id: 2, rank: "ROOKIE", unit: "UNIT 01", title: "変数宣言",
    question: "var で int 型変数 age に 25、:= で string 変数 name に \"Gopher\" を代入し \"名前: Gopher, 年齢: 25\" と出力してください。",
    requirements: ["var で宣言する変数を1つ", ":= で宣言する変数を1つ"],
    hint: "var age int = 25 か var age = 25。name := \"Gopher\" のように短縮宣言もできます。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    var age int = 25\n    name := "Gopher"\n    fmt.Printf("名前: %s, 年齢: %d\n", name, age)\n}`
  },
  {
    id: 3, rank: "ROOKIE", unit: "UNIT 01", title: "定数と型",
    question: "const で Pi = 3.14159 を定義し、bool 型変数 isGo を true にして、Pi と isGo を出力してください。",
    requirements: ["const で定数を定義する", "bool 型変数を使う"],
    hint: "const Pi = 3.14159 で定数を定義できます。",
    answer: `package main\n\nimport "fmt"\n\nconst Pi = 3.14159\n\nfunc main() {\n    isGo := true\n    fmt.Println(Pi)\n    fmt.Println(isGo)\n}`
  },
  {
    id: 4, rank: "ROOKIE", unit: "UNIT 01", title: "型変換と演算",
    question: "int 変数 a=7, b=2 を宣言し、商（整数除算）と余りを出力してください。さらに float64 に変換して浮動小数点除算の結果も出力してください。",
    requirements: ["a/b で整数除算", "a%b で余り", "float64(a)/float64(b) で浮動小数点除算"],
    hint: "Go では型変換は明示的に行う必要があります。float64(a) のように書きます。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    a, b := 7, 2\n    fmt.Println(a/b)\n    fmt.Println(a%b)\n    fmt.Printf("%.2f\n", float64(a)/float64(b))\n}`
  },
  // UNIT 02
  {
    id: 5, rank: "ROOKIE", unit: "UNIT 02", title: "if-else",
    question: "int 変数 n に 17 を代入し、偶数なら \"偶数\"、奇数なら \"奇数\" と出力してください。if 文の初期化ステートメントも使ってください。",
    requirements: ["if n%2 == 0 で判定する"],
    hint: "if x := n % 2; x == 0 { ... } のように初期化ステートメントを使えます。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    n := 17\n    if n%2 == 0 {\n        fmt.Println("偶数")\n    } else {\n        fmt.Println("奇数")\n    }\n}`
  },
  {
    id: 6, rank: "ROOKIE", unit: "UNIT 02", title: "forループ",
    question: "for ループで 1 から 10 までの合計を計算して出力してください（合計: 55）。",
    requirements: ["for i := 1; i <= 10; i++ を使う", "合計を累積する変数を使う"],
    hint: "sum := 0; for i := 1; i <= 10; i++ { sum += i }",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    sum := 0\n    for i := 1; i <= 10; i++ {\n        sum += i\n    }\n    fmt.Println(sum)\n}`
  },
  {
    id: 7, rank: "ROOKIE", unit: "UNIT 02", title: "for as while",
    question: "Go の for を while 相当として使い、2 の累乗を 1, 2, 4, 8, 16, 32 と出力してください（32を超えたら停止）。",
    requirements: ["for 条件式 { ... } の形式を使う"],
    hint: "n := 1; for n <= 32 { fmt.Println(n); n *= 2 }",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    n := 1\n    for n <= 32 {\n        fmt.Println(n)\n        n *= 2\n    }\n}`
  },
  {
    id: 8, rank: "ROOKIE", unit: "UNIT 02", title: "range for",
    question: "string スライス {\"Go\", \"Rust\", \"C\", \"Python\"} を range で回し、インデックスと値を \"0: Go\" 形式で出力してください。",
    requirements: ["for i, v := range langs を使う"],
    hint: "for i, v := range langs { fmt.Printf(\"%d: %s\\n\", i, v) }",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    langs := []string{"Go", "Rust", "C", "Python"}\n    for i, v := range langs {\n        fmt.Printf("%d: %s\n", i, v)\n    }\n}`
  },
  // UNIT 03
  {
    id: 9, rank: "BRONZE", unit: "UNIT 03", title: "配列とスライス",
    question: "長さ5の int 配列を宣言して初期化し、スライス操作（[1:3]）で部分列を取り出して出力してください。",
    requirements: ["[5]int 型配列を宣言", "スライス [1:3] で部分列を取り出す"],
    hint: "[5]int{10, 20, 30, 40, 50} で初期化できます。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    arr := [5]int{10, 20, 30, 40, 50}\n    sl := arr[1:3]\n    fmt.Println(arr)\n    fmt.Println(sl)\n}`
  },
  {
    id: 10, rank: "BRONZE", unit: "UNIT 03", title: "スライス操作",
    question: "空のスライスを作り、append で 1〜5 を追加し、len と cap を出力してください。さらに別のスライスを append で結合してください。",
    requirements: ["make か var で空スライス作成", "append で要素を追加", "len() と cap() を使う"],
    hint: "nums := []int{}; nums = append(nums, 1, 2, 3) で追加できます。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    nums := []int{}\n    for i := 1; i <= 5; i++ {\n        nums = append(nums, i)\n    }\n    fmt.Println(nums)\n    fmt.Println("len:", len(nums), "cap:", cap(nums))\n    extra := []int{6, 7, 8}\n    nums = append(nums, extra...)\n    fmt.Println(nums)\n}`
  },
  {
    id: 11, rank: "BRONZE", unit: "UNIT 03", title: "Map",
    question: "map[string]int で \"Tokyo\"→1400, \"Osaka\"→880, \"Nagoya\"→230 を登録し、全エントリを出力後、\"Osaka\" を削除して残りを出力してください。",
    requirements: ["map を make で作成する", "delete() でキーを削除する"],
    hint: "m := map[string]int{\"Tokyo\": 1400} で初期化、delete(m, \"Osaka\") で削除。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    m := map[string]int{"Tokyo": 1400, "Osaka": 880, "Nagoya": 230}\n    for k, v := range m {\n        fmt.Printf("%s: %d\n", k, v)\n    }\n    delete(m, "Osaka")\n    fmt.Println("---削除後---")\n    for k, v := range m {\n        fmt.Printf("%s: %d\n", k, v)\n    }\n}`
  },
  {
    id: 12, rank: "BRONZE", unit: "UNIT 03", title: "Map集計",
    question: "文字列 \"hello world\" の各文字の出現数を map[rune]int で数えて出力してください（空白は除く）。",
    requirements: ["range で文字列を1文字ずつ処理", "map でカウントする", "空白はスキップする"],
    hint: "for _, c := range str { if c != ' ' { count[c]++ } }",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    str := "hello world"\n    count := map[rune]int{}\n    for _, c := range str {\n        if c != ' ' {\n            count[c]++\n        }\n    }\n    for k, v := range count {\n        fmt.Printf("%c: %d\n", k, v)\n    }\n}`
  },
  // UNIT 04
  {
    id: 13, rank: "BRONZE", unit: "UNIT 04", title: "関数",
    question: "2つの int を受け取り、和と積を返す SumProduct 関数を定義して、(3, 4) で呼び出して結果を出力してください。",
    requirements: ["複数の戻り値を持つ関数を定義する"],
    hint: "func SumProduct(a, b int) (int, int) { return a+b, a*b }",
    answer: `package main\n\nimport "fmt"\n\nfunc SumProduct(a, b int) (int, int) {\n    return a + b, a * b\n}\n\nfunc main() {\n    s, p := SumProduct(3, 4)\n    fmt.Println("和:", s)\n    fmt.Println("積:", p)\n}`
  },
  {
    id: 14, rank: "BRONZE", unit: "UNIT 04", title: "可変長引数",
    question: "任意個数の int を受け取り合計を返す Sum 関数と、任意個数の string を受け取り結合する Join 関数を定義してください。",
    requirements: ["...int と ...string を使う", "range でループする"],
    hint: "func Sum(nums ...int) int { ... } のように書きます。",
    answer: `package main\n\nimport "fmt"\n\nfunc Sum(nums ...int) int {\n    total := 0\n    for _, n := range nums {\n        total += n\n    }\n    return total\n}\n\nfunc Join(strs ...string) string {\n    result := ""\n    for _, s := range strs {\n        result += s\n    }\n    return result\n}\n\nfunc main() {\n    fmt.Println(Sum(1, 2, 3, 4, 5))\n    fmt.Println(Join("Hello", ", ", "World"))\n}`
  },
  {
    id: 15, rank: "BRONZE", unit: "UNIT 04", title: "defer",
    question: "\"開始\"、defer で \"終了\"（後で実行）、\"処理中\" の順にコードを書き、実行順を確認してください。複数の defer の逆順実行も確認してください。",
    requirements: ["defer キーワードを使う", "複数 defer の逆順実行を確認"],
    hint: "defer は関数の終了時にスタックの逆順で実行されます。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("開始")\n    defer fmt.Println("終了")\n    defer fmt.Println("後片付け")\n    fmt.Println("処理中")\n}`
  },
  {
    id: 16, rank: "BRONZE", unit: "UNIT 04", title: "無名関数",
    question: "即時実行関数（IIFE）と変数に代入したクロージャを使って、カウンターを実装してください（0→1→2→3 と出力）。",
    requirements: ["func() { ... }() で即時実行", "func() int を変数に代入してクロージャを作る"],
    hint: "counter := 0; inc := func() { counter++ ... } のようにクロージャで外側の変数を参照できます。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    func() {\n        fmt.Println("即時実行")\n    }()\n    counter := 0\n    inc := func() {\n        counter++\n        fmt.Println(counter)\n    }\n    inc()\n    inc()\n    inc()\n}`
  },
  // UNIT 05
  {
    id: 17, rank: "SILVER", unit: "UNIT 05", title: "構造体",
    question: "Name string と Age int フィールドを持つ Person 構造体を定義し、\"Alice (30)\" 形式で出力するメソッド String() を実装してください。",
    requirements: ["type Person struct を定義する", "func (p Person) String() string を実装"],
    hint: "fmt.Sprintf(\"%s (%d)\", p.Name, p.Age) で文字列を作れます。",
    answer: `package main\n\nimport "fmt"\n\ntype Person struct {\n    Name string\n    Age  int\n}\n\nfunc (p Person) String() string {\n    return fmt.Sprintf("%s (%d)", p.Name, p.Age)\n}\n\nfunc main() {\n    p := Person{Name: "Alice", Age: 30}\n    fmt.Println(p)\n}`
  },
  {
    id: 18, rank: "SILVER", unit: "UNIT 05", title: "ポインタレシーバ",
    question: "Counter 構造体に int フィールドを持たせ、ポインタレシーバで Increment() と Reset() を実装してください。3回インクリメント後、値を確認して、リセットしてください。",
    requirements: ["func (c *Counter) Increment() でポインタレシーバを使う", "ポインタレシーバで値を変更する"],
    hint: "c.Value++ でフィールドを変更。ポインタレシーバなら呼び出し元の値が変わります。",
    answer: `package main\n\nimport "fmt"\n\ntype Counter struct {\n    Value int\n}\n\nfunc (c *Counter) Increment() { c.Value++ }\nfunc (c *Counter) Reset() { c.Value = 0 }\n\nfunc main() {\n    c := Counter{}\n    c.Increment()\n    c.Increment()\n    c.Increment()\n    fmt.Println(c.Value)\n    c.Reset()\n    fmt.Println(c.Value)\n}`
  },
  {
    id: 19, rank: "SILVER", unit: "UNIT 05", title: "インターフェース",
    question: "Area() float64 を持つ Shape インターフェースを定義し、Circle（半径）と Rectangle（幅・高さ）を実装して面積を出力してください。",
    requirements: ["type Shape interface { Area() float64 } を定義", "Circle と Rectangle に実装"],
    hint: "math.Pi を使うには import \"math\" が必要です。",
    answer: `package main\n\nimport (\n    "fmt"\n    "math"\n)\n\ntype Shape interface {\n    Area() float64\n}\n\ntype Circle struct{ R float64 }\ntype Rectangle struct{ W, H float64 }\n\nfunc (c Circle) Area() float64    { return math.Pi * c.R * c.R }\nfunc (r Rectangle) Area() float64 { return r.W * r.H }\n\nfunc main() {\n    shapes := []Shape{Circle{5}, Rectangle{4, 6}}\n    for _, s := range shapes {\n        fmt.Printf("%T: %.2f\n", s, s.Area())\n    }\n}`
  },
  {
    id: 20, rank: "SILVER", unit: "UNIT 05", title: "構造体埋め込み",
    question: "Animal 構造体（Name, Sound()メソッド）を定義し、Dog 構造体に埋め込んで、Dog 独自の Fetch() メソッドも追加してください。",
    requirements: ["struct 埋め込みを使う", "埋め込んだ構造体のメソッドが昇格する"],
    hint: "type Dog struct { Animal } のように書くと Animal のフィールド・メソッドが昇格します。",
    answer: `package main\n\nimport "fmt"\n\ntype Animal struct{ Name string }\n\nfunc (a Animal) Sound() string { return "..." }\n\ntype Dog struct {\n    Animal\n}\n\nfunc (d Dog) Sound() string { return "ワン" }\nfunc (d Dog) Fetch() string { return d.Name + "がボールを取ってきた!" }\n\nfunc main() {\n    d := Dog{Animal{Name: "Pochi"}}\n    fmt.Println(d.Sound())\n    fmt.Println(d.Fetch())\n    fmt.Println(d.Name)\n}`
  },
  // UNIT 06
  {
    id: 21, rank: "SILVER", unit: "UNIT 06", title: "ポインタ",
    question: "int 変数 x = 10 のポインタを取り、ポインタ経由で値を 20 に変更し、x の値が変わっていることを確認してください。",
    requirements: ["& でアドレスを取得する", "* でデリファレンスして値を変更する"],
    hint: "p := &x; *p = 20; fmt.Println(x) で x が 20 になります。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    x := 10\n    p := &x\n    fmt.Println("変更前:", x)\n    *p = 20\n    fmt.Println("変更後:", x)\n    fmt.Println("アドレス:", p)\n}`
  },
  {
    id: 22, rank: "SILVER", unit: "UNIT 06", title: "エラー処理",
    question: "strconv.Atoi で文字列を整数に変換し、エラーが発生した場合は適切に処理してください。\"42\" と \"abc\" の両方でテストしてください。",
    requirements: ["strconv.Atoi を使う", "err != nil でエラーチェックする"],
    hint: "n, err := strconv.Atoi(s); if err != nil { ... }",
    answer: `package main\n\nimport (\n    "fmt"\n    "strconv"\n)\n\nfunc main() {\n    for _, s := range []string{"42", "abc"} {\n        n, err := strconv.Atoi(s)\n        if err != nil {\n            fmt.Printf("エラー: %v\n", err)\n        } else {\n            fmt.Printf("変換成功: %d\n", n)\n        }\n    }\n}`
  },
  {
    id: 23, rank: "GOLD", unit: "UNIT 06", title: "カスタムエラー",
    question: "DivisionError 型を定義して error インターフェースを実装し、ゼロ除算のときに返す Divide 関数を作ってください。",
    requirements: ["type DivisionError struct を定義", "func (e DivisionError) Error() string を実装", "Divide 関数でゼロ除算をチェック"],
    hint: "type DivisionError struct { Divisor int }; func (e DivisionError) Error() string { ... }",
    answer: `package main\n\nimport "fmt"\n\ntype DivisionError struct{ Divisor int }\n\nfunc (e DivisionError) Error() string {\n    return fmt.Sprintf("ゼロ除算: %d ÷ %d", e.Divisor, 0)\n}\n\nfunc Divide(a, b int) (int, error) {\n    if b == 0 {\n        return 0, DivisionError{Divisor: a}\n    }\n    return a / b, nil\n}\n\nfunc main() {\n    if result, err := Divide(10, 2); err == nil {\n        fmt.Println(result)\n    }\n    if _, err := Divide(5, 0); err != nil {\n        fmt.Println(err)\n    }\n}`
  },
  {
    id: 24, rank: "GOLD", unit: "UNIT 06", title: "クロージャ",
    question: "呼び出すたびに n ずつ増える Adder を返すクロージャ MakeAdder(n int) を実装してください（+3 と +5 のアダーを作ってテスト）。",
    requirements: ["関数を返す関数を定義する", "クロージャで外側の変数を捕捉する"],
    hint: "func MakeAdder(n int) func(int) int { return func(x int) int { return x + n } }",
    answer: `package main\n\nimport "fmt"\n\nfunc MakeAdder(n int) func(int) int {\n    return func(x int) int {\n        return x + n\n    }\n}\n\nfunc main() {\n    add3 := MakeAdder(3)\n    add5 := MakeAdder(5)\n    fmt.Println(add3(10))\n    fmt.Println(add5(10))\n    fmt.Println(add3(add5(0)))\n}`
  },
  // UNIT 07
  {
    id: 25, rank: "GOLD", unit: "UNIT 07", title: "高階関数",
    question: "int スライスを受け取り func(int)int を適用した新スライスを返す Map 関数、条件 func(int)bool で絞り込む Filter 関数を実装してください。",
    requirements: ["Map(nums []int, f func(int)int) []int を定義", "Filter(nums []int, f func(int)bool) []int を定義"],
    hint: "Go には組み込みの map/filter がないので自作します。",
    answer: `package main\n\nimport "fmt"\n\nfunc Map(nums []int, f func(int) int) []int {\n    result := make([]int, len(nums))\n    for i, v := range nums {\n        result[i] = f(v)\n    }\n    return result\n}\n\nfunc Filter(nums []int, f func(int) bool) []int {\n    var result []int\n    for _, v := range nums {\n        if f(v) {\n            result = append(result, v)\n        }\n    }\n    return result\n}\n\nfunc main() {\n    nums := []int{1, 2, 3, 4, 5}\n    doubled := Map(nums, func(x int) int { return x * 2 })\n    evens := Filter(nums, func(x int) bool { return x%2 == 0 })\n    fmt.Println(doubled)\n    fmt.Println(evens)\n}`
  },
  {
    id: 26, rank: "GOLD", unit: "UNIT 07", title: "Reduce関数",
    question: "int スライスと初期値と func(int,int)int を受け取り畳み込む Reduce 関数を実装し、合計・積・最大値の計算に使ってください。",
    requirements: ["Reduce(nums []int, init int, f func(int,int)int) int を定義", "合計・積・最大値でテスト"],
    hint: "acc := init; for _, v := range nums { acc = f(acc, v) } return acc",
    answer: `package main\n\nimport "fmt"\n\nfunc Reduce(nums []int, init int, f func(int, int) int) int {\n    acc := init\n    for _, v := range nums {\n        acc = f(acc, v)\n    }\n    return acc\n}\n\nfunc main() {\n    nums := []int{1, 2, 3, 4, 5}\n    sum := Reduce(nums, 0, func(a, b int) int { return a + b })\n    product := Reduce(nums, 1, func(a, b int) int { return a * b })\n    max := Reduce(nums, nums[0], func(a, b int) int {\n        if a > b { return a }\n        return b\n    })\n    fmt.Println("合計:", sum)\n    fmt.Println("積:", product)\n    fmt.Println("最大:", max)\n}`
  },
  {
    id: 27, rank: "DIAMOND", unit: "UNIT 07", title: "ゴルーチン",
    question: "goroutine で3つのメッセージを並行して送り、channel で受け取って出力してください。WaitGroup は使わずチャネルで同期してください。",
    requirements: ["go func() { ch <- ... }() でゴルーチンを起動", "channel でメッセージを受け取る"],
    hint: "ch := make(chan string, 3) でバッファ付きチャネルを作り、3回 <-ch で受け取ります。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    ch := make(chan string, 3)\n    go func() { ch <- "ゴルーチン1" }()\n    go func() { ch <- "ゴルーチン2" }()\n    go func() { ch <- "ゴルーチン3" }()\n    for i := 0; i < 3; i++ {\n        fmt.Println(<-ch)\n    }\n}`
  },
  {
    id: 28, rank: "DIAMOND", unit: "UNIT 07", title: "チャネルとselect",
    question: "2つのチャネルに異なるタイミングで送信し、select で受信できた方を処理するコードを書いてください。",
    requirements: ["select { case v := <-ch1: ... case v := <-ch2: ... } を使う"],
    hint: "select はチャネルの準備ができた case をランダムに選んで実行します。",
    answer: `package main\n\nimport "fmt"\n\nfunc main() {\n    ch1 := make(chan string, 1)\n    ch2 := make(chan string, 1)\n    ch1 <- "チャネル1からのメッセージ"\n    ch2 <- "チャネル2からのメッセージ"\n    for i := 0; i < 2; i++ {\n        select {\n        case msg := <-ch1:\n            fmt.Println("ch1:", msg)\n        case msg := <-ch2:\n            fmt.Println("ch2:", msg)\n        }\n    }\n}`
  },
  // UNIT 08
  {
    id: 29, rank: "MASTER", unit: "UNIT 08", title: "型アサーション",
    question: "interface{} スライスに int, string, float64 を混在させ、type switch で型ごとに処理を分岐して出力してください。",
    requirements: ["interface{} スライスを作る", "switch v := x.(type) { case int: ... } を使う"],
    hint: "switch v := item.(type) { case int: fmt.Println(\"int:\", v) ... }",
    answer: `package main\n\nimport "fmt"\n\nfunc describe(i interface{}) {\n    switch v := i.(type) {\n    case int:\n        fmt.Printf("int: %d\n", v)\n    case string:\n        fmt.Printf("string: %s\n", v)\n    case float64:\n        fmt.Printf("float64: %.2f\n", v)\n    default:\n        fmt.Printf("unknown: %T\n", v)\n    }\n}\n\nfunc main() {\n    items := []interface{}{42, "hello", 3.14, true}\n    for _, item := range items {\n        describe(item)\n    }\n}`
  },
  {
    id: 30, rank: "LEGEND", unit: "UNIT 08", title: "総合演習: タスク管理システム",
    question: "Task 構造体（ID, Title, Done）、TaskManager を実装してください: Add/Complete/Filter(done bool)/Summary メソッドを持ち、インターフェースで抽象化してください。",
    requirements: ["Task と TaskManager 構造体を定義", "ITaskManager インターフェースを定義", "Add/Complete/Filter/Summary を実装"],
    hint: "Filter で done フラグが一致するタスクを返し、Summary で完了率を表示します。",
    answer:
`package main

import "fmt"

type Task struct {
    ID    int
    Title string
    Done  bool
}

type ITaskManager interface {
    Add(title string)
    Complete(id int) bool
    Filter(done bool) []Task
    Summary()
}

type TaskManager struct {
    tasks  []Task
    nextID int
}

func (tm *TaskManager) Add(title string) {
    tm.nextID++
    tm.tasks = append(tm.tasks, Task{ID: tm.nextID, Title: title})
}

func (tm *TaskManager) Complete(id int) bool {
    for i := range tm.tasks {
        if tm.tasks[i].ID == id {
            tm.tasks[i].Done = true
            return true
        }
    }
    return false
}

func (tm *TaskManager) Filter(done bool) []Task {
    var result []Task
    for _, t := range tm.tasks {
        if t.Done == done {
            result = append(result, t)
        }
    }
    return result
}

func (tm *TaskManager) Summary() {
    total := len(tm.tasks)
    done := len(tm.Filter(true))
    fmt.Printf("完了: %d/%d (%.0f%%)\n", done, total, float64(done)/float64(total)*100)
}

func main() {
    var tm ITaskManager = &TaskManager{}
    tm.Add("Goを学ぶ")
    tm.Add("テストを書く")
    tm.Add("コードレビュー")
    tm.Complete(1)
    tm.Complete(3)
    tm.Summary()
    fmt.Println("未完了:")
    for _, t := range tm.(*TaskManager).Filter(false) {
        fmt.Printf("  [%d] %s\n", t.ID, t.Title)
    }
}`
  }
];

const goMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "スライス操作マスター",
    description: "append/sort/search の活用",
    question: "int スライスを: ①手動バブルソート、②二分探索で値を探す、③重複を除去、④2つのソート済みスライスをマージする関数を実装してください。",
    requirements: ["BubbleSort([]int) []int を実装", "BinarySearch([]int, int) int を実装（見つからなければ-1）", "Unique([]int) []int を実装", "Merge([]int, []int) []int を実装"],
    hint: "二分探索は lo, hi を使って範囲を二分していきます。",
    answer:
`package main

import "fmt"

func BubbleSort(s []int) []int {
    n := make([]int, len(s))
    copy(n, s)
    for i := 0; i < len(n)-1; i++ {
        for j := 0; j < len(n)-1-i; j++ {
            if n[j] > n[j+1] { n[j], n[j+1] = n[j+1], n[j] }
        }
    }
    return n
}

func BinarySearch(s []int, target int) int {
    lo, hi := 0, len(s)-1
    for lo <= hi {
        mid := (lo + hi) / 2
        if s[mid] == target { return mid }
        if s[mid] < target { lo = mid + 1 } else { hi = mid - 1 }
    }
    return -1
}

func Unique(s []int) []int {
    seen := map[int]bool{}
    var result []int
    for _, v := range s {
        if !seen[v] { seen[v] = true; result = append(result, v) }
    }
    return result
}

func Merge(a, b []int) []int {
    result := make([]int, 0, len(a)+len(b))
    i, j := 0, 0
    for i < len(a) && j < len(b) {
        if a[i] <= b[j] { result = append(result, a[i]); i++ } else { result = append(result, b[j]); j++ }
    }
    result = append(result, a[i:]...)
    result = append(result, b[j:]...)
    return result
}

func main() {
    nums := []int{5, 2, 8, 1, 9, 3, 7}
    sorted := BubbleSort(nums)
    fmt.Println("ソート:", sorted)
    fmt.Println("8の位置:", BinarySearch(sorted, 8))
    fmt.Println("重複除去:", Unique([]int{1, 2, 2, 3, 3, 3}))
    fmt.Println("マージ:", Merge([]int{1, 3, 5}, []int{2, 4, 6}))
}`
  },
  {
    id: 2, rank: "BRONZE",
    title: "Map活用: ワードカウント",
    description: "map を使った集計処理",
    question: "文章から単語の出現頻度を数えて上位3件を出力するプログラムを作ってください（strings.Fields で分割、大文字小文字を無視）。",
    requirements: ["strings.Fields で単語分割", "strings.ToLower で統一", "map で頻度カウント", "上位3件を出力"],
    hint: "sort パッケージの Slice 関数でカスタムソートができます。",
    answer:
`package main

import (
    "fmt"
    "sort"
    "strings"
)

func main() {
    text := "the quick brown fox jumps over the lazy dog the fox"
    words := strings.Fields(strings.ToLower(text))
    count := map[string]int{}
    for _, w := range words {
        count[w]++
    }
    type wordCount struct{ word string; cnt int }
    var wcs []wordCount
    for w, c := range count {
        wcs = append(wcs, wordCount{w, c})
    }
    sort.Slice(wcs, func(i, j int) bool { return wcs[i].cnt > wcs[j].cnt })
    fmt.Println("上位3件:")
    for i := 0; i < 3 && i < len(wcs); i++ {
        fmt.Printf("  %s: %d回\n", wcs[i].word, wcs[i].cnt)
    }
}`
  },
  {
    id: 3, rank: "SILVER",
    title: "struct・interface設計",
    description: "図形の面積・周長計算システム",
    question: "Shape インターフェース（Area/Perimeter）を定義し、Circle・Rectangle・Triangle に実装してください。各図形の情報を一覧表示するプログラムを作成してください。",
    requirements: ["Shape interface { Area() float64; Perimeter() float64 } を定義", "3種類の図形を実装", "スライスでまとめて処理する"],
    hint: "Triangle の面積はヘロンの公式 √(s(s-a)(s-b)(s-c)) で計算できます。",
    answer:
`package main

import (
    "fmt"
    "math"
)

type Shape interface {
    Area() float64
    Perimeter() float64
    Name() string
}

type Circle struct{ R float64 }
type Rectangle struct{ W, H float64 }
type Triangle struct{ A, B, C float64 }

func (c Circle) Area() float64      { return math.Pi * c.R * c.R }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.R }
func (c Circle) Name() string       { return "Circle" }

func (r Rectangle) Area() float64      { return r.W * r.H }
func (r Rectangle) Perimeter() float64 { return 2 * (r.W + r.H) }
func (r Rectangle) Name() string       { return "Rectangle" }

func (t Triangle) Area() float64 {
    s := (t.A + t.B + t.C) / 2
    return math.Sqrt(s * (s - t.A) * (s - t.B) * (s - t.C))
}
func (t Triangle) Perimeter() float64 { return t.A + t.B + t.C }
func (t Triangle) Name() string       { return "Triangle" }

func main() {
    shapes := []Shape{Circle{5}, Rectangle{4, 6}, Triangle{3, 4, 5}}
    for _, s := range shapes {
        fmt.Printf("%s: 面積=%.2f 周長=%.2f\n", s.Name(), s.Area(), s.Perimeter())
    }
}`
  },
  {
    id: 4, rank: "SILVER",
    title: "関数型パターン",
    description: "クロージャ・高階関数の活用",
    question: "Pipeline を実装してください: 複数の func(int)int 変換を連結し、一つの変換関数として返す Compose 関数、そして int スライスに適用する Pipeline 関数を作ってください。",
    requirements: ["Compose(fns ...func(int)int) func(int)int を実装", "Pipeline(nums []int, fns ...func(int)int) []int を実装"],
    hint: "Compose は関数を順次適用するクロージャを返します。",
    answer:
`package main

import "fmt"

func Compose(fns ...func(int) int) func(int) int {
    return func(x int) int {
        for _, f := range fns {
            x = f(x)
        }
        return x
    }
}

func Pipeline(nums []int, fns ...func(int) int) []int {
    transform := Compose(fns...)
    result := make([]int, len(nums))
    for i, n := range nums {
        result[i] = transform(n)
    }
    return result
}

func main() {
    double := func(x int) int { return x * 2 }
    addTen := func(x int) int { return x + 10 }
    square := func(x int) int { return x * x }

    nums := []int{1, 2, 3, 4, 5}
    result := Pipeline(nums, double, addTen, square)
    fmt.Println(result)

    f := Compose(double, addTen)
    fmt.Println(f(5))
}`
  },
  {
    id: 5, rank: "GOLD",
    title: "エラー処理パターン",
    description: "カスタムerrorとwrapping",
    question: "設定ファイルのパース処理を模倣した ValidateConfig 関数を作ってください。複数のエラーを収集して一度に返す MultiError 型を実装し、fmt.Errorf の %w でエラーをラップしてください。",
    requirements: ["type MultiError []error を定義して Error() string を実装", "fmt.Errorf(\"context: %w\", err) でラップ", "errors.Is/As での unwrap にも対応"],
    hint: "MultiError.Error() は全エラーを改行で結合した文字列を返します。",
    answer:
`package main

import (
    "errors"
    "fmt"
    "strings"
)

type MultiError []error

func (m MultiError) Error() string {
    msgs := make([]string, len(m))
    for i, e := range m {
        msgs[i] = e.Error()
    }
    return strings.Join(msgs, "; ")
}

type ValidationError struct{ Field, Message string }
func (e *ValidationError) Error() string { return fmt.Sprintf("%s: %s", e.Field, e.Message) }

func ValidateConfig(host string, port int, timeout int) error {
    var errs MultiError
    if host == "" {
        errs = append(errs, fmt.Errorf("設定エラー: %w", &ValidationError{"host", "空文字は不可"}))
    }
    if port < 1 || port > 65535 {
        errs = append(errs, fmt.Errorf("設定エラー: %w", &ValidationError{"port", "1-65535 の範囲外"}))
    }
    if timeout <= 0 {
        errs = append(errs, fmt.Errorf("設定エラー: %w", &ValidationError{"timeout", "正の値が必要"}))
    }
    if len(errs) > 0 {
        return errs
    }
    return nil
}

func main() {
    err := ValidateConfig("", 99999, -1)
    if err != nil {
        fmt.Println(err)
        var ve *ValidationError
        if errors.As(err.(MultiError)[0], &ve) {
            fmt.Println("最初のフィールド:", ve.Field)
        }
    }
    err2 := ValidateConfig("localhost", 8080, 30)
    fmt.Println("有効な設定:", err2 == nil)
}`
  },
  {
    id: 6, rank: "GOLD",
    title: "goroutine・channel",
    description: "並行処理の基礎",
    question: "fan-out / fan-in パターンを実装してください: 入力チャネルから値を受け取り、複数のワーカーゴルーチンで並行処理し、結果を集約して出力してください。",
    requirements: ["producer ゴルーチンで値を送信", "複数の worker ゴルーチンで並行処理", "結果を集約して出力", "sync.WaitGroup で完了を待機"],
    hint: "done チャネルまたは WaitGroup でワーカーの終了を待ちます。",
    answer:
`package main

import (
    "fmt"
    "sync"
)

func main() {
    jobs := make(chan int, 10)
    results := make(chan int, 10)

    var wg sync.WaitGroup
    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for j := range jobs {
                result := j * j
                fmt.Printf("worker%d: %d^2 = %d\n", id, j, result)
                results <- result
            }
        }(w)
    }

    for i := 1; i <= 9; i++ {
        jobs <- i
    }
    close(jobs)

    go func() {
        wg.Wait()
        close(results)
    }()

    total := 0
    for r := range results {
        total += r
    }
    fmt.Println("合計:", total)
}`
  }
];

const goUnitGuides = [
  {
    id: "go-unit01", unit: "UNIT 01", title: "Hello Go & 変数",
    summary: "fmt.Println、var / := による変数宣言、基本型（int/float64/string/bool）を学ぶ。",
    points: ["fmt.Println() で改行付き出力、fmt.Printf() でフォーマット出力", "var name type = value か name := value の短縮形で宣言", "Go は強い静的型付け言語。型変換は明示的に行う", "定数は const で定義し変更不可"],
    words: [{ term: ":=", desc: "型推論付きの短縮変数宣言。関数内でのみ使用可" }, { term: "fmt.Printf", desc: "%d/%s/%.2f などのフォーマット指定子を使った出力" }, { term: "const", desc: "変更不可の定数を定義するキーワード" }]
  },
  {
    id: "go-unit02", unit: "UNIT 02", title: "制御フロー",
    summary: "Go の if-else、for（Go唯一のループ）、switch、range を学ぶ。",
    points: ["Go のループは for のみ（while/do-while なし）", "for i := 0; i < n; i++ / for condition / for range の3形式", "switch に break は不要（自動でフォールスルーしない）", "range でスライス・マップ・文字列を反復処理できる"],
    words: [{ term: "for range", desc: "コレクションの要素を (index, value) で取り出すループ" }, { term: "switch", desc: "条件分岐。Go では break 不要でフォールスルーしない" }, { term: "fallthrough", desc: "switch の次の case を実行するキーワード（明示的）" }]
  },
  {
    id: "go-unit03", unit: "UNIT 03", title: "コレクション",
    summary: "配列（固定長）、スライス（可変長）、map（ハッシュマップ）の使い方を学ぶ。",
    points: ["[N]T が配列（固定長）、[]T がスライス（可変長）", "append でスライスに要素を追加（戻り値を代入必須）", "map[K]V でキーと値のペアを管理", "delete(m, key) でキーを削除。ok イディオムで存在確認"],
    words: [{ term: "slice", desc: "可変長配列。len（長さ）と cap（容量）を持つ" }, { term: "append", desc: "スライスに要素を追加する組み込み関数。戻り値を使う" }, { term: "map", desc: "キーと値のペアを格納するハッシュマップ" }]
  },
  {
    id: "go-unit04", unit: "UNIT 04", title: "関数と defer",
    summary: "関数定義、複数戻り値、可変長引数、defer、無名関数・クロージャを学ぶ。",
    points: ["Go の関数は複数の値を返せる（戻り値に名前も付けられる）", "...T で可変長引数を受け取る", "defer は関数終了時に LIFO 順で実行される（後処理に最適）", "無名関数はクロージャとして外側の変数を捕捉できる"],
    words: [{ term: "多値返却", desc: "Go 関数は (result, error) のように複数値を返せる" }, { term: "defer", desc: "関数の終了時（LIFO順）に実行されるコードを登録" }, { term: "クロージャ", desc: "外側のスコープの変数を捕捉した無名関数" }]
  },
  {
    id: "go-unit05", unit: "UNIT 05", title: "構造体とインターフェース",
    summary: "struct、メソッド（値/ポインタレシーバ）、interface、埋め込みを学ぶ。",
    points: ["type T struct { ... } で構造体を定義", "func (t T) Method() は値レシーバ、(t *T) はポインタレシーバ", "interface は型の振る舞いを定義する抽象型", "struct 内に別の struct を埋め込むと、そのフィールド・メソッドが昇格"],
    words: [{ term: "ポインタレシーバ", desc: "*T を使うレシーバ。メソッド内でフィールドを変更できる" }, { term: "interface", desc: "メソッドの集合を定義する型。暗黙的に実装する" }, { term: "埋め込み", desc: "struct に別の struct を名前なしで埋め込む仕組み" }]
  },
  {
    id: "go-unit06", unit: "UNIT 06", title: "ポインタとエラー処理",
    summary: "ポインタ（&/*）、Go 標準のエラー処理パターン、カスタムエラー型を学ぶ。",
    points: ["& でアドレス取得、* でデリファレンス（値を取得）", "Go のエラー処理は (value, error) を返して if err != nil でチェック", "error インターフェースは Error() string を持つ型", "fmt.Errorf(\"%w\", err) でエラーをラップできる"],
    words: [{ term: "pointer", desc: "変数のメモリアドレスを格納する型。*T と書く" }, { term: "error", desc: "Error() string メソッドを持つ組み込みインターフェース" }, { term: "%w", desc: "fmt.Errorf でエラーをラップするフォーマット動詞" }]
  },
  {
    id: "go-unit07", unit: "UNIT 07", title: "ゴルーチンとチャネル",
    summary: "goroutine による並行処理と channel によるデータ受け渡しを学ぶ。",
    points: ["go func() で軽量スレッド（goroutine）を起動", "chan T でチャネルを作り <- で送受信", "バッファなし channel は送受信が揃うまでブロック", "select で複数チャネルを待機できる"],
    words: [{ term: "goroutine", desc: "go キーワードで起動する軽量な並行実行単位" }, { term: "channel", desc: "goroutine 間でデータをやり取りするパイプ" }, { term: "select", desc: "複数チャネルのうち準備ができたものを処理するスイッチ" }]
  },
  {
    id: "go-unit08", unit: "UNIT 08", title: "型アサーションと総合演習",
    summary: "空インターフェース、型アサーション、type switch、並行パターンを総合的に学ぶ。",
    points: ["interface{} (= any) は任意の型を格納できる", "v.(T) で型アサーション、失敗すると panic", "v, ok := x.(T) で安全にアサーションできる", "switch v := x.(type) で型ごとに分岐する type switch"],
    words: [{ term: "interface{}", desc: "任意の型を格納できる空インターフェース（= any）" }, { term: "型アサーション", desc: "インターフェース値から具体的な型の値を取り出す操作" }, { term: "type switch", desc: "インターフェース値の動的型で分岐するスイッチ文" }]
  }
];

// ===== C データ =====

const cProblems = [
  // UNIT 01
  {
    id: 1, rank: "ROOKIE", unit: "UNIT 01", title: "Hello, C!",
    question: "\"Hello, C!\" と出力してください。",
    requirements: ["printf() を使う", "#include <stdio.h> を書く"],
    hint: "printf(\"文字列\\n\") で改行付き出力ができます。",
    answer: `#include <stdio.h>\n\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}`
  },
  {
    id: 2, rank: "ROOKIE", unit: "UNIT 01", title: "変数と型",
    question: "int変数 age に 20、float変数 height に 1.75 を代入し、それぞれ出力してください（heightは小数点2桁）。",
    requirements: ["int と float 変数を宣言する", "printf の書式指定子 %d と %.2f を使う"],
    hint: "printf(\"%d\\n\", age); printf(\"%.2f\\n\", height);",
    answer: `#include <stdio.h>\n\nint main() {\n    int age = 20;\n    float height = 1.75f;\n    printf("%d\\n", age);\n    printf("%.2f\\n", height);\n    return 0;\n}`
  },
  {
    id: 3, rank: "ROOKIE", unit: "UNIT 01", title: "演算子",
    question: "int変数 a=10, b=3 を宣言し、和・差・積・商・余りをすべて出力してください。",
    requirements: ["+, -, *, /, % 演算子を使う"],
    hint: "printf(\"%d\\n\", a + b); のように各演算の結果を出力します。",
    answer: `#include <stdio.h>\n\nint main() {\n    int a = 10, b = 3;\n    printf("%d\\n", a + b);\n    printf("%d\\n", a - b);\n    printf("%d\\n", a * b);\n    printf("%d\\n", a / b);\n    printf("%d\\n", a % b);\n    return 0;\n}`
  },
  {
    id: 4, rank: "ROOKIE", unit: "UNIT 01", title: "定数",
    question: "#define で PI = 3.14159 を定義し、半径 5.0 の円の面積（PI × r × r）を出力してください。",
    requirements: ["#define で定数を定義する", "面積を計算して出力する"],
    hint: "#define PI 3.14159 と書き、PI * r * r で面積を計算します。",
    answer: `#include <stdio.h>\n#define PI 3.14159\n\nint main() {\n    float r = 5.0f;\n    float area = PI * r * r;\n    printf("%.2f\\n", area);\n    return 0;\n}`
  },
  // UNIT 02
  {
    id: 5, rank: "ROOKIE", unit: "UNIT 02", title: "if-else",
    question: "int変数 score に 72 を代入し、70以上なら \"Pass\"、未満なら \"Fail\" と出力してください。",
    requirements: ["if-else 文を使う"],
    hint: "if (score >= 70) { printf(\"Pass\\n\"); } else { printf(\"Fail\\n\"); }",
    answer: `#include <stdio.h>\n\nint main() {\n    int score = 72;\n    if (score >= 70) printf("Pass\\n");\n    else printf("Fail\\n");\n    return 0;\n}`
  },
  {
    id: 6, rank: "ROOKIE", unit: "UNIT 02", title: "forループ",
    question: "for ループで 1 から 5 の二乗を出力してください（1, 4, 9, 16, 25）。",
    requirements: ["for ループを使う", "i*i で二乗を計算する"],
    hint: "for (int i = 1; i <= 5; i++) { printf(\"%d\\n\", i*i); }",
    answer: `#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        printf("%d\\n", i * i);\n    }\n    return 0;\n}`
  },
  {
    id: 7, rank: "ROOKIE", unit: "UNIT 02", title: "whileループ",
    question: "while ループで整数 n = 1 から始めて 3倍していき、1000 を超えるまで出力してください。",
    requirements: ["while ループを使う", "n *= 3 で更新する"],
    hint: "while (n <= 1000) { printf(\"%d\\n\", n); n *= 3; }",
    answer: `#include <stdio.h>\n\nint main() {\n    int n = 1;\n    while (n <= 1000) {\n        printf("%d\\n", n);\n        n *= 3;\n    }\n    return 0;\n}`
  },
  {
    id: 8, rank: "ROOKIE", unit: "UNIT 02", title: "do-while",
    question: "do-while ループで 1 から 5 の合計を計算し、\"合計: 15\" と出力してください。",
    requirements: ["do { ... } while(条件) を使う"],
    hint: "int sum = 0, i = 1; do { sum += i; i++; } while (i <= 5);",
    answer: `#include <stdio.h>\n\nint main() {\n    int sum = 0, i = 1;\n    do {\n        sum += i;\n        i++;\n    } while (i <= 5);\n    printf("合計: %d\\n", sum);\n    return 0;\n}`
  },
  // UNIT 03
  {
    id: 9, rank: "BRONZE", unit: "UNIT 03", title: "配列",
    question: "int配列 {5, 3, 8, 1, 9, 2, 7} を宣言し、最大値と最小値を求めて出力してください。",
    requirements: ["配列を宣言して初期化する", "ループで最大値・最小値を探す"],
    hint: "int arr[] = {5, 3, 8, 1, 9, 2, 7}; sizeof(arr)/sizeof(arr[0]) で要素数を取得できます。",
    answer: `#include <stdio.h>\n\nint main() {\n    int arr[] = {5, 3, 8, 1, 9, 2, 7};\n    int n = sizeof(arr) / sizeof(arr[0]);\n    int max = arr[0], min = arr[0];\n    for (int i = 1; i < n; i++) {\n        if (arr[i] > max) max = arr[i];\n        if (arr[i] < min) min = arr[i];\n    }\n    printf("最大: %d\\n最小: %d\\n", max, min);\n    return 0;\n}`
  },
  {
    id: 10, rank: "BRONZE", unit: "UNIT 03", title: "文字列",
    question: "char配列に \"Hello\" を格納し、1文字ずつループで出力してください。また strlen で長さを出力してください。",
    requirements: ["char str[] を宣言する", "for ループで1文字ずつ出力する", "strlen() で長さを取得する"],
    hint: "#include <string.h> を追加。for (int i = 0; str[i] != '\\0'; i++) で処理できます。",
    answer: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str[] = "Hello";\n    for (int i = 0; str[i] != '\\0'; i++) {\n        printf("%c\\n", str[i]);\n    }\n    printf("長さ: %lu\\n", strlen(str));\n    return 0;\n}`
  },
  {
    id: 11, rank: "BRONZE", unit: "UNIT 03", title: "string.h関数",
    question: "\"Hello\" と \"World\" を strcpy と strcat を使って結合し、strcmp で \"Hello\" と \"hello\" を比較した結果を出力してください。",
    requirements: ["strcpy でコピーする", "strcat で連結する", "strcmp で比較する"],
    hint: "strcat(dest, src) で src を dest の末尾に追加できます。",
    answer: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char buf[50];\n    strcpy(buf, "Hello");\n    strcat(buf, " World");\n    printf("%s\\n", buf);\n    int cmp = strcmp("Hello", "hello");\n    printf("strcmp結果: %d\\n", cmp);\n    return 0;\n}`
  },
  {
    id: 12, rank: "BRONZE", unit: "UNIT 03", title: "2次元配列",
    question: "3×3の int 行列を宣言・初期化し、全要素を表形式で出力してください（各要素間はタブ区切り）。",
    requirements: ["int matrix[3][3] を宣言する", "二重ループで出力する"],
    hint: "printf(\"%d\\t\", matrix[i][j]); で各要素を出力し、行末に改行を入れます。",
    answer: `#include <stdio.h>\n\nint main() {\n    int m[3][3] = {{1,2,3},{4,5,6},{7,8,9}};\n    for (int i = 0; i < 3; i++) {\n        for (int j = 0; j < 3; j++) {\n            printf("%d\\t", m[i][j]);\n        }\n        printf("\\n");\n    }\n    return 0;\n}`
  },
  // UNIT 04
  {
    id: 13, rank: "BRONZE", unit: "UNIT 04", title: "関数",
    question: "int a, b を受け取り最大公約数を返す gcd 関数（ユークリッドの互除法）を実装し、gcd(48, 18) = 6 を出力してください。",
    requirements: ["int gcd(int a, int b) を定義する", "再帰かループでユークリッド互除法を実装する"],
    hint: "gcd(a, b) = gcd(b, a%b)。b == 0 のとき a を返します。",
    answer: `#include <stdio.h>\n\nint gcd(int a, int b) {\n    return b == 0 ? a : gcd(b, a % b);\n}\n\nint main() {\n    printf("%d\\n", gcd(48, 18));\n    return 0;\n}`
  },
  {
    id: 14, rank: "BRONZE", unit: "UNIT 04", title: "再帰関数",
    question: "フィボナッチ数列を再帰で計算する fib 関数を実装し、fib(0)〜fib(9) を出力してください。",
    requirements: ["int fib(int n) を再帰で実装する", "fib(0)=0, fib(1)=1"],
    hint: "return fib(n-1) + fib(n-2); がベース。n<=1 のときの基底ケースを忘れずに。",
    answer: `#include <stdio.h>\n\nint fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        printf("%d ", fib(i));\n    }\n    printf("\\n");\n    return 0;\n}`
  },
  {
    id: 15, rank: "BRONZE", unit: "UNIT 04", title: "値渡しと参照渡し",
    question: "2つの int を値渡しで交換する swap_val と、ポインタ渡しで実際に交換する swap_ref を実装し、違いを確認してください。",
    requirements: ["void swap_val(int a, int b) は効果なし", "void swap_ref(int *a, int *b) で実際に交換"],
    hint: "*a と *b を介して値を交換します。int tmp = *a; *a = *b; *b = tmp;",
    answer: `#include <stdio.h>\n\nvoid swap_val(int a, int b) { int t = a; a = b; b = t; }\nvoid swap_ref(int *a, int *b) { int t = *a; *a = *b; *b = t; }\n\nint main() {\n    int x = 3, y = 7;\n    swap_val(x, y);\n    printf("値渡し後: x=%d, y=%d\\n", x, y);\n    swap_ref(&x, &y);\n    printf("参照渡し後: x=%d, y=%d\\n", x, y);\n    return 0;\n}`
  },
  {
    id: 16, rank: "BRONZE", unit: "UNIT 04", title: "static変数",
    question: "呼び出すたびにカウントをインクリメントして返す counter 関数を、static 変数を使って実装し、3回呼び出して出力してください。",
    requirements: ["static int count = 0; を関数内で宣言する", "関数を3回呼び出す"],
    hint: "static 変数は関数を抜けても値が保持されます。",
    answer: `#include <stdio.h>\n\nint counter() {\n    static int count = 0;\n    return ++count;\n}\n\nint main() {\n    printf("%d\\n", counter());\n    printf("%d\\n", counter());\n    printf("%d\\n", counter());\n    return 0;\n}`
  },
  // UNIT 05
  {
    id: 17, rank: "SILVER", unit: "UNIT 05", title: "ポインタ基礎",
    question: "int変数 n = 42 のアドレスをポインタ変数 p に格納し、p 経由で値を 100 に変更後、n の値を確認してください。アドレスも出力してください。",
    requirements: ["int *p = &n; でポインタを作る", "*p = 100; で値を変更する"],
    hint: "printf(\"%p\\n\", p); でアドレスを出力できます（%p は void* が必要な処理系もあります）。",
    answer: `#include <stdio.h>\n\nint main() {\n    int n = 42;\n    int *p = &n;\n    printf("変更前: n=%d, *p=%d\\n", n, *p);\n    *p = 100;\n    printf("変更後: n=%d, *p=%d\\n", n, *p);\n    printf("アドレス: %p\\n", (void*)p);\n    return 0;\n}`
  },
  {
    id: 18, rank: "SILVER", unit: "UNIT 05", title: "ポインタ演算",
    question: "int配列 {10, 20, 30, 40, 50} をポインタで走査し、p++ で要素を順に出力してください。また配列の先頭から3番目の要素をポインタ算術で取得してください。",
    requirements: ["int *p = arr; で先頭ポインタを取得", "p++ でポインタを進める", "*(arr + 2) で3番目を取得"],
    hint: "配列名自体が先頭要素のポインタです。p++ は次の要素へ移動します。",
    answer: `#include <stdio.h>\n\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int *p = arr;\n    for (int i = 0; i < 5; i++) {\n        printf("%d ", *p);\n        p++;\n    }\n    printf("\\n");\n    printf("3番目: %d\\n", *(arr + 2));\n    return 0;\n}`
  },
  {
    id: 19, rank: "SILVER", unit: "UNIT 05", title: "配列とポインタ",
    question: "int配列を受け取り合計を返す sum 関数をポインタを使って実装してください（引数は int *arr, int n）。",
    requirements: ["int sum(int *arr, int n) を定義する", "ポインタを使って要素にアクセスする"],
    hint: "*(arr + i) か arr[i] でアクセスできます（内部的に同じです）。",
    answer: `#include <stdio.h>\n\nint sum(int *arr, int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total += *(arr + i);\n    }\n    return total;\n}\n\nint main() {\n    int data[] = {1, 2, 3, 4, 5};\n    printf("%d\\n", sum(data, 5));\n    return 0;\n}`
  },
  {
    id: 20, rank: "SILVER", unit: "UNIT 05", title: "ポインタと文字列",
    question: "char* ポインタを使って文字列の長さを返す my_strlen と文字列をコピーする my_strcpy を実装してください（標準ライブラリを使わず自作）。",
    requirements: ["int my_strlen(const char *s) を実装", "void my_strcpy(char *dst, const char *src) を実装"],
    hint: "while (*s != '\\0') { s++; len++; } のように\\0（ヌル終端）を手がかりに走査します。",
    answer: `#include <stdio.h>\n\nint my_strlen(const char *s) {\n    int len = 0;\n    while (*s++) len++;\n    return len;\n}\n\nvoid my_strcpy(char *dst, const char *src) {\n    while ((*dst++ = *src++) != '\\0');\n}\n\nint main() {\n    printf("%d\\n", my_strlen("Hello"));\n    char buf[20];\n    my_strcpy(buf, "World");\n    printf("%s\\n", buf);\n    return 0;\n}`
  },
  // UNIT 06
  {
    id: 21, rank: "SILVER", unit: "UNIT 06", title: "構造体",
    question: "name (char[50]) と score (int) を持つ Student 構造体を定義し、3人分の配列を作って平均点を出力してください。",
    requirements: ["struct Student を定義する", "構造体の配列を作る", "平均を計算して出力する"],
    hint: "struct Student students[3] = {{\"Alice\", 85}, {\"Bob\", 72}, {\"Carol\", 91}};",
    answer: `#include <stdio.h>\n\nstruct Student {\n    char name[50];\n    int score;\n};\n\nint main() {\n    struct Student students[] = {{"Alice", 85}, {"Bob", 72}, {"Carol", 91}};\n    int n = 3, total = 0;\n    for (int i = 0; i < n; i++) total += students[i].score;\n    printf("平均: %.1f\\n", (float)total / n);\n    return 0;\n}`
  },
  {
    id: 22, rank: "SILVER", unit: "UNIT 06", title: "typedef struct",
    question: "typedef を使って Point 型（x, y の float）を定義し、2点間の距離を計算する distance 関数を実装してください。",
    requirements: ["typedef struct を使う", "sqrt を使った distance 関数を実装"],
    hint: "#include <math.h> が必要。dist = sqrt((x2-x1)^2 + (y2-y1)^2)",
    answer: `#include <stdio.h>\n#include <math.h>\n\ntypedef struct {\n    float x, y;\n} Point;\n\nfloat distance(Point a, Point b) {\n    float dx = b.x - a.x, dy = b.y - a.y;\n    return sqrt(dx*dx + dy*dy);\n}\n\nint main() {\n    Point p1 = {0.0f, 0.0f};\n    Point p2 = {3.0f, 4.0f};\n    printf("距離: %.2f\\n", distance(p1, p2));\n    return 0;\n}`
  },
  {
    id: 23, rank: "GOLD", unit: "UNIT 06", title: "構造体とポインタ",
    question: "Node 構造体（int value, Node* next）で連結リストを作り、3つのノードを繋いで全要素を出力してください。",
    requirements: ["struct Node { int value; struct Node *next; } を定義", "3ノードを手動で作って連結", "while ループで全要素を出力"],
    hint: "node1.next = &node2; node2.next = &node3; node3.next = NULL;",
    answer: `#include <stdio.h>\n\nstruct Node {\n    int value;\n    struct Node *next;\n};\n\nint main() {\n    struct Node n3 = {30, NULL};\n    struct Node n2 = {20, &n3};\n    struct Node n1 = {10, &n2};\n    struct Node *p = &n1;\n    while (p != NULL) {\n        printf("%d\\n", p->value);\n        p = p->next;\n    }\n    return 0;\n}`
  },
  {
    id: 24, rank: "GOLD", unit: "UNIT 06", title: "構造体配列と関数",
    question: "Item 構造体（name, price）の配列を引数で受け取り、最高値のアイテム名を返す max_price_item 関数を実装してください。",
    requirements: ["Item 構造体を定義する", "Item* を引数に取る関数を実装", "最高値のアイテムへのポインタを返す"],
    hint: "Item* max_price_item(Item *items, int n) のように定義し、ポインタを返します。",
    answer: `#include <stdio.h>\n\ntypedef struct {\n    char name[50];\n    int price;\n} Item;\n\nItem* max_price_item(Item *items, int n) {\n    Item *max = &items[0];\n    for (int i = 1; i < n; i++) {\n        if (items[i].price > max->price) max = &items[i];\n    }\n    return max;\n}\n\nint main() {\n    Item items[] = {{"Apple", 120}, {"Banana", 80}, {"Cherry", 200}};\n    Item *m = max_price_item(items, 3);\n    printf("%s: %d円\\n", m->name, m->price);\n    return 0;\n}`
  },
  // UNIT 07
  {
    id: 25, rank: "GOLD", unit: "UNIT 07", title: "動的メモリ確保",
    question: "malloc で int 配列 (n=5) を確保し、1〜5 を格納して出力後、free で解放してください。realloc でサイズを拡張する例も示してください。",
    requirements: ["malloc で動的確保する", "free で解放する", "realloc で再確保する"],
    hint: "int *arr = (int*)malloc(n * sizeof(int));",
    answer: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n = 5;\n    int *arr = (int*)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) arr[i] = i + 1;\n    for (int i = 0; i < n; i++) printf("%d ", arr[i]);\n    printf("\\n");\n    arr = (int*)realloc(arr, (n+3) * sizeof(int));\n    for (int i = n; i < n+3; i++) arr[i] = i + 1;\n    for (int i = 0; i < n+3; i++) printf("%d ", arr[i]);\n    printf("\\n");\n    free(arr);\n    return 0;\n}`
  },
  {
    id: 26, rank: "GOLD", unit: "UNIT 07", title: "動的配列: スタック",
    question: "malloc を使ったスタックを実装してください: Stack 構造体（int* data, int top, int capacity）、push/pop/is_empty 関数を定義して動作確認してください。",
    requirements: ["Stack 構造体を定義する", "malloc で動的確保する", "push/pop/is_empty を実装する"],
    hint: "push 時に top >= capacity なら容量オーバーエラー。pop 時に top < 0 ならアンダーフロー。",
    answer:
`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    int top;
    int capacity;
} Stack;

Stack* create_stack(int cap) {
    Stack *s = (Stack*)malloc(sizeof(Stack));
    s->data = (int*)malloc(cap * sizeof(int));
    s->top = -1;
    s->capacity = cap;
    return s;
}

void push(Stack *s, int val) {
    if (s->top < s->capacity - 1) s->data[++s->top] = val;
}

int pop(Stack *s) {
    if (s->top < 0) return -1;
    return s->data[s->top--];
}

int is_empty(Stack *s) { return s->top < 0; }

int main() {
    Stack *s = create_stack(5);
    push(s, 10); push(s, 20); push(s, 30);
    while (!is_empty(s)) printf("%d\\n", pop(s));
    free(s->data); free(s);
    return 0;
}`
  },
  {
    id: 27, rank: "DIAMOND", unit: "UNIT 07", title: "関数ポインタ",
    question: "int (*op)(int, int) 型の関数ポインタを使い、加算・減算・乗算の関数を切り替えて計算する apply 関数を実装してください。",
    requirements: ["int add(int,int), sub, mul を定義する", "int apply(int a, int b, int(*op)(int,int)) を定義", "3つの演算でテストする"],
    hint: "int (*fp)(int,int) = add; fp(3,4); のように関数ポインタを使います。",
    answer:
`#include <stdio.h>

int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }

int apply(int a, int b, int(*op)(int,int)) {
    return op(a, b);
}

int main() {
    printf("%d\\n", apply(10, 3, add));
    printf("%d\\n", apply(10, 3, sub));
    printf("%d\\n", apply(10, 3, mul));
    return 0;
}`
  },
  {
    id: 28, rank: "DIAMOND", unit: "UNIT 07", title: "コールバックとソート",
    question: "qsort を使って int 配列を昇順・降順でソートしてください。比較関数をコールバックとして渡します。",
    requirements: ["int cmp_asc(const void*, const void*) を定義する", "int cmp_desc(const void*, const void*) を定義する", "qsort(arr, n, sizeof(int), cmp_asc) を使う"],
    hint: "比較関数は *(int*)a - *(int*)b（昇順）か逆（降順）で書きます。",
    answer:
`#include <stdio.h>
#include <stdlib.h>

int cmp_asc(const void *a, const void *b) { return *(int*)a - *(int*)b; }
int cmp_desc(const void *a, const void *b) { return *(int*)b - *(int*)a; }

void print_arr(int *arr, int n) {
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
}

int main() {
    int arr[] = {5, 3, 8, 1, 9, 2, 7};
    int n = 7;
    qsort(arr, n, sizeof(int), cmp_asc);
    printf("昇順: "); print_arr(arr, n);
    qsort(arr, n, sizeof(int), cmp_desc);
    printf("降順: "); print_arr(arr, n);
    return 0;
}`
  },
  // UNIT 08
  {
    id: 29, rank: "MASTER", unit: "UNIT 08", title: "ビット演算",
    question: "unsigned int 変数を使い: ①特定ビットのセット・クリア・トグル・確認を実装、②32bit整数の1のビット数を数える popcount 関数を実装してください。",
    requirements: ["OR(|)でセット、AND(&~)でクリア、XOR(^)でトグル", "ビットシフト(<<,>>)を使う", "popcount を実装する"],
    hint: "n &= ~(1u << bit) でビットをクリア。popcount はループで n & 1 を確認しながら n >>= 1 します。",
    answer:
`#include <stdio.h>

unsigned int set_bit(unsigned int n, int b)    { return n | (1u << b); }
unsigned int clear_bit(unsigned int n, int b)  { return n & ~(1u << b); }
unsigned int toggle_bit(unsigned int n, int b) { return n ^ (1u << b); }
int check_bit(unsigned int n, int b) { return (n >> b) & 1; }

int popcount(unsigned int n) {
    int count = 0;
    while (n) { count += n & 1; n >>= 1; }
    return count;
}

int main() {
    unsigned int x = 0b1010;
    printf("元: %u\\n", x);
    x = set_bit(x, 0);    printf("bit0セット: %u\\n", x);
    x = clear_bit(x, 1);  printf("bit1クリア: %u\\n", x);
    x = toggle_bit(x, 2); printf("bit2トグル: %u\\n", x);
    printf("bit3: %d\\n", check_bit(x, 3));
    printf("popcount(0b1101): %d\\n", popcount(0b1101));
    return 0;
}`
  },
  {
    id: 30, rank: "LEGEND", unit: "UNIT 08", title: "総合演習: 汎用ソートシステム",
    question: "void* と関数ポインタを使った汎用ソート関数 generic_sort を実装し、int 配列と文字列配列の両方をソートしてください。バブルソートで実装してください。",
    requirements: ["void generic_sort(void *base, int n, int size, int(*cmp)(const void*, const void*)) を実装", "int 配列と char*[] 配列の両方でテスト", "memcpy でデータを交換する"],
    hint: "char *arr = (char*)base; で void* を byte 配列として扱い、i*size で各要素にアクセスします。",
    answer:
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void generic_sort(void *base, int n, int size, int(*cmp)(const void*, const void*)) {
    char *arr = (char*)base;
    char *tmp = (char*)malloc(size);
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-1-i; j++) {
            char *a = arr + j*size, *b = arr + (j+1)*size;
            if (cmp(a, b) > 0) {
                memcpy(tmp, a, size);
                memcpy(a, b, size);
                memcpy(b, tmp, size);
            }
        }
    }
    free(tmp);
}

int cmp_int(const void *a, const void *b) { return *(int*)a - *(int*)b; }
int cmp_str(const void *a, const void *b) { return strcmp(*(char**)a, *(char**)b); }

int main() {
    int nums[] = {5, 2, 8, 1, 9};
    generic_sort(nums, 5, sizeof(int), cmp_int);
    for (int i = 0; i < 5; i++) printf("%d ", nums[i]);
    printf("\\n");
    const char *words[] = {"banana", "apple", "cherry"};
    generic_sort(words, 3, sizeof(char*), cmp_str);
    for (int i = 0; i < 3; i++) printf("%s\\n", words[i]);
    return 0;
}`
  }
];

const cMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "配列・文字列操作",
    description: "ソート・検索・文字列処理の基本",
    question: "①int配列をバブルソート、②線形探索でターゲット位置を返す関数、③文字列を逆順にする関数を実装してください。",
    requirements: ["bubble_sort(int *arr, int n) を実装", "int linear_search(int *arr, int n, int target) を実装", "void reverse_str(char *s) を実装（in-place）"],
    hint: "reverse_str は先頭と末尾を交換しながら内側に進みます。",
    answer:
`#include <stdio.h>
#include <string.h>

void bubble_sort(int *arr, int n) {
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-1-i; j++)
            if (arr[j] > arr[j+1]) { int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t; }
}

int linear_search(int *arr, int n, int target) {
    for (int i = 0; i < n; i++) if (arr[i] == target) return i;
    return -1;
}

void reverse_str(char *s) {
    int l = 0, r = strlen(s) - 1;
    while (l < r) { char t = s[l]; s[l++] = s[r]; s[r--] = t; }
}

int main() {
    int arr[] = {5, 3, 8, 1, 7};
    bubble_sort(arr, 5);
    for (int i = 0; i < 5; i++) printf("%d ", arr[i]);
    printf("\\n");
    printf("8の位置: %d\\n", linear_search(arr, 5, 8));
    char s[] = "Hello";
    reverse_str(s);
    printf("%s\\n", s);
    return 0;
}`
  },
  {
    id: 2, rank: "BRONZE",
    title: "関数・再帰マスター",
    description: "再帰アルゴリズムの実装",
    question: "①再帰でフィボナッチ（メモ化あり）、②二分探索、③配列のバブルソートを実装してください。",
    requirements: ["fib_memo(int n) をメモ化で実装", "binary_search(int *arr, int n, int target) を実装", "それぞれ動作確認する"],
    hint: "メモ化は static int memo[100] = {0}; で実現できます。",
    answer:
`#include <stdio.h>
#include <string.h>

long long fib_memo(int n) {
    static long long memo[100] = {0};
    if (n <= 1) return n;
    if (memo[n]) return memo[n];
    return memo[n] = fib_memo(n-1) + fib_memo(n-2);
}

int binary_search(int *arr, int n, int target) {
    int lo = 0, hi = n-1;
    while (lo <= hi) {
        int mid = (lo+hi)/2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid+1; else hi = mid-1;
    }
    return -1;
}

int main() {
    for (int i = 0; i <= 9; i++) printf("%lld ", fib_memo(i));
    printf("\\n");
    int arr[] = {1,3,5,7,9,11,13};
    printf("7の位置: %d\\n", binary_search(arr, 7, 7));
    printf("4の位置: %d\\n", binary_search(arr, 7, 4));
    return 0;
}`
  },
  {
    id: 3, rank: "SILVER",
    title: "ポインタ活用",
    description: "ポインタを使った配列・文字列の操作",
    question: "ポインタのみを使って: ①配列の合計・最大値・最小値を求める関数、②文字列の文字数・単語数を数える関数を実装してください（配列インデックスは使わない）。",
    requirements: ["sum_ptr, max_ptr, min_ptr を実装（int* のみ使用）", "count_chars, count_words を実装", "count_words は空白区切りで数える"],
    hint: "while (*p) でヌル終端まで走査。単語数は「空白→非空白」の切り替え回数でカウントできます。",
    answer:
`#include <stdio.h>

int sum_ptr(int *arr, int n) {
    int s = 0;
    int *end = arr + n;
    while (arr < end) s += *arr++;
    return s;
}

int max_ptr(int *arr, int n) {
    int m = *arr++;
    while (--n > 0) { if (*arr > m) m = *arr; arr++; }
    return m;
}

int count_chars(const char *s) {
    int n = 0;
    while (*s++) n++;
    return n;
}

int count_words(const char *s) {
    int words = 0, in_word = 0;
    while (*s) {
        if (*s != ' ' && !in_word) { words++; in_word = 1; }
        else if (*s == ' ') in_word = 0;
        s++;
    }
    return words;
}

int main() {
    int arr[] = {3, 1, 4, 1, 5, 9};
    printf("合計: %d\\n", sum_ptr(arr, 6));
    printf("最大: %d\\n", max_ptr(arr, 6));
    const char *s = "hello world foo";
    printf("文字数: %d\\n", count_chars(s));
    printf("単語数: %d\\n", count_words(s));
    return 0;
}`
  },
  {
    id: 4, rank: "SILVER",
    title: "構造体設計",
    description: "学生情報管理システム",
    question: "Student 構造体（name, score）の配列を管理するシステムを作ってください: 追加・全表示・平均計算・最高点者表示の関数を実装してください。",
    requirements: ["Student 構造体を定義する", "add_student / print_all / avg_score / top_student を実装"],
    hint: "配列の現在サイズをグローバル変数か引数で管理します。",
    answer:
`#include <stdio.h>
#include <string.h>

#define MAX 10

typedef struct {
    char name[50];
    int score;
} Student;

Student db[MAX];
int count = 0;

void add_student(const char *name, int score) {
    if (count < MAX) {
        strcpy(db[count].name, name);
        db[count].score = score;
        count++;
    }
}

void print_all() {
    for (int i = 0; i < count; i++)
        printf("%s: %d\\n", db[i].name, db[i].score);
}

float avg_score() {
    float sum = 0;
    for (int i = 0; i < count; i++) sum += db[i].score;
    return count ? sum / count : 0;
}

void top_student() {
    int best = 0;
    for (int i = 1; i < count; i++) if (db[i].score > db[best].score) best = i;
    printf("最高点: %s (%d)\\n", db[best].name, db[best].score);
}

int main() {
    add_student("Alice", 85);
    add_student("Bob", 92);
    add_student("Carol", 78);
    print_all();
    printf("平均: %.1f\\n", avg_score());
    top_student();
    return 0;
}`
  },
  {
    id: 5, rank: "GOLD",
    title: "動的メモリ管理",
    description: "malloc/freeを使ったデータ構造",
    question: "malloc/free を使った動的配列 DynArray を実装してください: 初期容量4、push_back で自動2倍拡張、get/size/destroy 関数付き。",
    requirements: ["DynArray 構造体（data, size, capacity）を定義", "push_back でサイズ不足時に realloc", "destroy で free する"],
    hint: "capacity を超えたら realloc(arr->data, new_cap * sizeof(int)) で拡張します。",
    answer:
`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    int size;
    int capacity;
} DynArray;

DynArray* create() {
    DynArray *a = (DynArray*)malloc(sizeof(DynArray));
    a->data = (int*)malloc(4 * sizeof(int));
    a->size = 0;
    a->capacity = 4;
    return a;
}

void push_back(DynArray *a, int val) {
    if (a->size >= a->capacity) {
        a->capacity *= 2;
        a->data = (int*)realloc(a->data, a->capacity * sizeof(int));
    }
    a->data[a->size++] = val;
}

void destroy(DynArray *a) { free(a->data); free(a); }

int main() {
    DynArray *arr = create();
    for (int i = 1; i <= 10; i++) push_back(arr, i * i);
    printf("size=%d cap=%d\\n", arr->size, arr->capacity);
    for (int i = 0; i < arr->size; i++) printf("%d ", arr->data[i]);
    printf("\\n");
    destroy(arr);
    return 0;
}`
  },
  {
    id: 6, rank: "GOLD",
    title: "関数ポインタ活用",
    description: "ソート関数のカスタマイズ",
    question: "汎用ソート・探索ライブラリを作ってください: 関数ポインタを使った generic_sort（バブルソート）とgeneric_find（線形探索）を int・float・文字列で動作確認してください。",
    requirements: ["generic_sort(void*, int, int, int(*)(void*,void*)) を実装", "generic_find(void*, int, int, void*, int(*)(void*,void*)) を実装", "3種類の型でテストする"],
    hint: "char* に キャストして size バイトずつアクセスします。比較関数は0を返せば等しいとみなします。",
    answer:
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void generic_sort(void *base, int n, int sz, int(*cmp)(void*,void*)) {
    char *a = (char*)base;
    char *tmp = (char*)malloc(sz);
    for (int i=0;i<n-1;i++) for (int j=0;j<n-1-i;j++) {
        char *p = a+j*sz, *q = a+(j+1)*sz;
        if (cmp(p,q)>0) { memcpy(tmp,p,sz); memcpy(p,q,sz); memcpy(q,tmp,sz); }
    }
    free(tmp);
}

int cmp_int(void *a, void *b)   { return *(int*)a - *(int*)b; }
int cmp_float(void *a, void *b) { float d = *(float*)a - *(float*)b; return d>0?1:d<0?-1:0; }

int main() {
    int nums[] = {5,2,8,1,9,3};
    generic_sort(nums,6,sizeof(int),cmp_int);
    for(int i=0;i<6;i++) printf("%d ",nums[i]); printf("\\n");
    float fls[] = {3.1f,1.4f,2.7f,0.5f};
    generic_sort(fls,4,sizeof(float),cmp_float);
    for(int i=0;i<4;i++) printf("%.1f ",fls[i]); printf("\\n");
    return 0;
}`
  }
];

const cUnitGuides = [
  {
    id: "c-unit01", unit: "UNIT 01", title: "Hello C & 基本入出力",
    summary: "printf、変数宣言（int/float/char）、演算子、定数（#define）を学ぶ。",
    points: ["printf(\"%d %f %c\\n\", i, f, c) で書式付き出力", "int/float/double/char が基本型", "#define PI 3.14 でマクロ定数を定義", "変数宣言は使用前に行う（C89ではブロック先頭）"],
    words: [{ term: "printf", desc: "書式指定子（%d/%f/%s/%c）を使った出力関数" }, { term: "#define", desc: "プリプロセッサマクロ。型なしで定数を定義する" }, { term: "書式指定子", desc: "%d=整数 %f=浮動小数 %s=文字列 %c=文字 %p=ポインタ" }]
  },
  {
    id: "c-unit02", unit: "UNIT 02", title: "制御フロー",
    summary: "if-else、for、while、do-while、switch による制御を学ぶ。",
    points: ["if-else/switch で条件分岐", "for で初期化・条件・更新を一か所に書く", "while は条件チェックが先、do-while は後", "break でループ即終了、continue で次の反復へ"],
    words: [{ term: "do-while", desc: "最低1回は実行が保証されるループ" }, { term: "switch-case", desc: "整数値の多岐分岐。break を忘れるとfall-through" }, { term: "continue", desc: "現在の反復をスキップして次の反復へ進む" }]
  },
  {
    id: "c-unit03", unit: "UNIT 03", title: "配列と文字列",
    summary: "固定長配列、char[]文字列、string.h の便利関数を学ぶ。",
    points: ["int arr[N] で固定長配列。サイズはコンパイル時に決まる", "文字列は char[] で、末尾に \\0（ヌル終端）がある", "strlen/strcpy/strcat/strcmp が文字列操作の基本", "sizeof(arr)/sizeof(arr[0]) で配列要素数を取得"],
    words: [{ term: "ヌル終端", desc: "C文字列の末尾に置かれる \\0（ASCII 0）" }, { term: "strlen", desc: "ヌル終端を含まない文字列の長さを返す" }, { term: "sizeof", desc: "型またはオブジェクトのバイトサイズを返す演算子" }]
  },
  {
    id: "c-unit04", unit: "UNIT 04", title: "関数と再帰",
    summary: "関数定義・プロトタイプ宣言、値渡し、再帰、static変数を学ぶ。",
    points: ["Cの関数は値渡し（引数のコピーが渡される）", "ポインタを渡せば参照渡しと同等の効果", "再帰は基底ケースとスタックオーバーフローに注意", "static 変数は関数を抜けても値が保持される"],
    words: [{ term: "プロトタイプ宣言", desc: "関数の型シグネチャを先頭で宣言する。後方参照のため" }, { term: "static変数", desc: "関数ローカルだが値が保持される変数。初期化は一度のみ" }, { term: "値渡し", desc: "引数の値をコピーして渡す。元の変数は変更されない" }]
  },
  {
    id: "c-unit05", unit: "UNIT 05", title: "ポインタ",
    summary: "ポインタの基礎（&/*）、ポインタ演算、配列とポインタの関係を学ぶ。",
    points: ["& でアドレスを取得、* でデリファレンス（値を取得）", "配列名は先頭要素へのポインタと等価", "p++ は次の要素（sizeof(T) バイト先）を指す", "const char* は読み取り専用の文字列ポインタ"],
    words: [{ term: "&（アドレス演算子）", desc: "変数のメモリアドレスを返す" }, { term: "*（間接参照）", desc: "ポインタが指すアドレスの値を返す" }, { term: "ポインタ演算", desc: "p+n は n*sizeof(T) バイト先のアドレス" }]
  },
  {
    id: "c-unit06", unit: "UNIT 06", title: "構造体",
    summary: "struct定義、typedef、構造体とポインタ（->演算子）を学ぶ。",
    points: ["struct でデータを一つのまとまりとして定義", "typedef struct で短い型名を付けられる", "構造体ポインタからのメンバアクセスは -> を使う", "構造体は値渡し（コピー）されるので大きな構造体はポインタを使う"],
    words: [{ term: "struct", desc: "異なる型のフィールドをまとめたユーザー定義型" }, { term: "->演算子", desc: "ポインタからメンバにアクセスする演算子。(*p).x と同等" }, { term: "typedef", desc: "既存の型に新しい名前を付けるキーワード" }]
  },
  {
    id: "c-unit07", unit: "UNIT 07", title: "動的メモリと関数ポインタ",
    summary: "malloc/free/realloc による動的メモリ管理と関数ポインタを学ぶ。",
    points: ["malloc でヒープ領域を動的確保。使用後は必ず free", "realloc で確保済み領域を拡縮できる", "関数ポインタで実行時に呼び出す関数を切り替えられる", "qsort の比較関数もコールバック（関数ポインタ）の一例"],
    words: [{ term: "malloc", desc: "ヒープ上にバイト数を指定してメモリを確保する関数" }, { term: "free", desc: "malloc で確保したメモリを解放する。必ずセットで使う" }, { term: "関数ポインタ", desc: "関数のアドレスを格納するポインタ変数" }]
  },
  {
    id: "c-unit08", unit: "UNIT 08", title: "ビット演算と総合演習",
    summary: "ビット演算（AND/OR/XOR/シフト）と汎用プログラミングを学ぶ。",
    points: ["& OR | XOR ^ NOT ~ でビット単位の演算", "<< で左シフト（×2）、>> で右シフト（÷2）", "フラグ管理（セット/クリア/トグル/チェック）に頻出", "void* と関数ポインタで型汎用なコードが書ける"],
    words: [{ term: "ビットマスク", desc: "特定ビットを選択するために使うビットパターン" }, { term: "左シフト(<<)", desc: "ビットをn桁左に移動。2のn乗倍に相当" }, { term: "void*", desc: "型情報を持たない汎用ポインタ。キャストして使う" }]
  }
];

// ===== Rust データ =====

const rustProblems = [
  // UNIT 01
  {
    id: 1, rank: "ROOKIE", unit: "UNIT 01", title: "Hello, Rust!",
    question: "\"Hello, Rust!\" と出力してください。",
    requirements: ["println! マクロを使う"],
    hint: "println!(\"文字列\") で改行付き出力ができます。",
    answer: `fn main() {\n    println!("Hello, Rust!");\n}`
  },
  {
    id: 2, rank: "ROOKIE", unit: "UNIT 01", title: "変数とミュータビリティ",
    question: "let で不変変数 x = 5 を宣言し出力、次に let mut で可変変数 y = 10 を宣言して 20 に変更して出力してください。",
    requirements: ["let でイミュータブル変数を作る", "let mut でミュータブル変数を作る"],
    hint: "Rust のデフォルトは不変（immutable）。変更するには mut が必要です。",
    answer: `fn main() {\n    let x = 5;\n    println!("{}", x);\n    let mut y = 10;\n    y = 20;\n    println!("{}", y);\n}`
  },
  {
    id: 3, rank: "ROOKIE", unit: "UNIT 01", title: "基本型",
    question: "i32, f64, bool, char の変数を宣言し、それぞれの値と型を println! で出力してください。",
    requirements: ["i32, f64, bool, char 型を使う", "型注釈を明示的に書く"],
    hint: "let n: i32 = 42; のように型注釈を付けられます。",
    answer: `fn main() {\n    let n: i32 = 42;\n    let f: f64 = 3.14;\n    let b: bool = true;\n    let c: char = 'R';\n    println!("{} {} {} {}", n, f, b, c);\n}`
  },
  {
    id: 4, rank: "ROOKIE", unit: "UNIT 01", title: "演算と型変換",
    question: "i32 変数 a=7, b=2 の商と余りを出力し、as f64 でキャストして浮動小数点除算の結果も出力してください。",
    requirements: ["a/b で整数除算", "a%b で余り", "a as f64 / b as f64 で実数除算"],
    hint: "Rust は自動型変換しないため as でキャストします。",
    answer: `fn main() {\n    let a: i32 = 7;\n    let b: i32 = 2;\n    println!("{}", a / b);\n    println!("{}", a % b);\n    println!("{:.2}", a as f64 / b as f64);\n}`
  },
  // UNIT 02
  {
    id: 5, rank: "ROOKIE", unit: "UNIT 02", title: "if-else",
    question: "i32 変数 n = 42 を宣言し、正・負・ゼロで分岐して出力してください。if を式として使い let result = if ... で結果を変数に入れてください。",
    requirements: ["if-else if-else で3分岐する", "if を式として使う"],
    hint: "let label = if n > 0 { \"正\" } else if n < 0 { \"負\" } else { \"ゼロ\" };",
    answer: `fn main() {\n    let n = 42i32;\n    let label = if n > 0 { "正" } else if n < 0 { "負" } else { "ゼロ" };\n    println!("{}", label);\n}`
  },
  {
    id: 6, rank: "ROOKIE", unit: "UNIT 02", title: "loop と while",
    question: "loop で 1 から始めて、5 の倍数になったら break するコードを書き、その値を出力してください。次に while で 1〜10 の合計を求めてください。",
    requirements: ["loop { ... break; } を使う", "while で合計を計算する"],
    hint: "loop は無限ループ。break で抜けられ、break VALUE で値を返せます。",
    answer: `fn main() {\n    let mut n = 1;\n    let result = loop {\n        if n % 5 == 0 { break n; }\n        n += 1;\n    };\n    println!("{}", result);\n    let mut sum = 0;\n    let mut i = 1;\n    while i <= 10 { sum += i; i += 1; }\n    println!("{}", sum);\n}`
  },
  {
    id: 7, rank: "ROOKIE", unit: "UNIT 02", title: "for と range",
    question: "for i in 1..=5 で 1〜5 を出力し、for i in (1..=5).rev() で逆順に出力してください。",
    requirements: ["1..=5 のレンジを使う", ".rev() で逆順にする"],
    hint: "1..5 は1〜4（5を含まない）、1..=5 は1〜5（5を含む）です。",
    answer: `fn main() {\n    for i in 1..=5 { print!("{} ", i); }\n    println!();\n    for i in (1..=5).rev() { print!("{} ", i); }\n    println!();\n}`
  },
  {
    id: 8, rank: "ROOKIE", unit: "UNIT 02", title: "enumerate と zip",
    question: "Vec<&str> {\"apple\", \"banana\", \"cherry\"} を enumerate で (インデックス, 値) を出力し、2つのベクタを zip して対応する要素をペアで出力してください。",
    requirements: [".iter().enumerate() を使う", "2つのベクタを zip する"],
    hint: "for (i, v) in fruits.iter().enumerate() { ... }",
    answer: `fn main() {\n    let fruits = vec!["apple", "banana", "cherry"];\n    for (i, v) in fruits.iter().enumerate() {\n        println!("{}: {}", i, v);\n    }\n    let nums = vec![1, 2, 3];\n    let names = vec!["one", "two", "three"];\n    for (n, s) in nums.iter().zip(names.iter()) {\n        println!("{} = {}", n, s);\n    }\n}`
  },
  // UNIT 03
  {
    id: 9, rank: "BRONZE", unit: "UNIT 03", title: "Vec<T>",
    question: "Vec<i32> を作り 1〜5 を push、pop して取り出し、len と contains を使って出力してください。",
    requirements: ["vec! マクロか Vec::new() で作成", "push/pop/len/contains を使う"],
    hint: "pop() は Option<T> を返します。unwrap() か match で取り出せます。",
    answer: `fn main() {\n    let mut v: Vec<i32> = Vec::new();\n    for i in 1..=5 { v.push(i); }\n    println!("{:?}", v);\n    println!("len: {}", v.len());\n    println!("pop: {:?}", v.pop());\n    println!("contains 3: {}", v.contains(&3));\n}`
  },
  {
    id: 10, rank: "BRONZE", unit: "UNIT 03", title: "String操作",
    question: "String を作り push_str で追加、len・contains・replace・to_uppercase を使って出力してください。",
    requirements: ["String::from() か to_string() で作成", "push_str/len/contains/replace/to_uppercase を使う"],
    hint: "&str は文字列スライス、String は所有権を持つ文字列です。",
    answer: `fn main() {\n    let mut s = String::from("Hello");\n    s.push_str(", Rust!");\n    println!("{}", s);\n    println!("len: {}", s.len());\n    println!("contains Rust: {}", s.contains("Rust"));\n    println!("{}", s.replace("Rust", "World"));\n    println!("{}", s.to_uppercase());\n}`
  },
  {
    id: 11, rank: "BRONZE", unit: "UNIT 03", title: "HashMap",
    question: "HashMap<String, i32> で \"Tokyo\"→1400, \"Osaka\"→880, \"Nagoya\"→230 を登録し、entry API で \"Kyoto\"を追加し、全エントリを出力してください。",
    requirements: ["std::collections::HashMap を使う", "entry().or_insert() を使う"],
    hint: "use std::collections::HashMap; が必要です。",
    answer: `use std::collections::HashMap;\n\nfn main() {\n    let mut map = HashMap::new();\n    map.insert("Tokyo".to_string(), 1400);\n    map.insert("Osaka".to_string(), 880);\n    map.insert("Nagoya".to_string(), 230);\n    map.entry("Kyoto".to_string()).or_insert(150);\n    for (k, v) in &map {\n        println!("{}: {}", k, v);\n    }\n}`
  },
  {
    id: 12, rank: "BRONZE", unit: "UNIT 03", title: "イテレータ",
    question: "Vec<i32> {1..=10} に対して map で二乗、filter で偶数のみ、collect で新しい Vec を作り出力してください。また sum() と max() も使ってください。",
    requirements: ["map/filter/collect を連鎖させる", "sum() と max() を使う"],
    hint: ".collect::<Vec<i32>>() か let result: Vec<i32> = ... で型を指定します。",
    answer: `fn main() {\n    let nums: Vec<i32> = (1..=10).collect();\n    let result: Vec<i32> = nums.iter().map(|&x| x*x).filter(|&x| x%2==0).collect();\n    println!("{:?}", result);\n    let sum: i32 = nums.iter().sum();\n    println!("合計: {}", sum);\n    println!("最大: {}", nums.iter().max().unwrap());\n}`
  },
  // UNIT 04
  {
    id: 13, rank: "BRONZE", unit: "UNIT 04", title: "関数",
    question: "i32 の最大公約数を求める gcd 関数を実装し、gcd(48, 18) = 6 を出力してください。型注釈を明示してください。",
    requirements: ["fn gcd(a: i32, b: i32) -> i32 を定義する", "ユークリッドの互除法を使う"],
    hint: "if b == 0 { a } else { gcd(b, a % b) }",
    answer: `fn gcd(a: i32, b: i32) -> i32 {\n    if b == 0 { a } else { gcd(b, a % b) }\n}\n\nfn main() {\n    println!("{}", gcd(48, 18));\n    println!("{}", gcd(100, 75));\n}`
  },
  {
    id: 14, rank: "BRONZE", unit: "UNIT 04", title: "クロージャ",
    question: "クロージャを変数に代入し: ①二乗するクロージャ、②n を加算するクロージャ（環境キャプチャ）を定義して使ってください。",
    requirements: ["|x| x * x の形でクロージャを定義する", "外側の変数をキャプチャするクロージャを作る"],
    hint: "let add_n = |x| x + n; は外側の n を借用してキャプチャします。",
    answer: `fn main() {\n    let square = |x: i32| x * x;\n    println!("{}", square(5));\n    let n = 10;\n    let add_n = |x| x + n;\n    println!("{}", add_n(5));\n    let nums = vec![1, 2, 3, 4, 5];\n    let doubled: Vec<i32> = nums.iter().map(|&x| x * 2).collect();\n    println!("{:?}", doubled);\n}`
  },
  {
    id: 15, rank: "BRONZE", unit: "UNIT 04", title: "fold と sum",
    question: "Vec<i32> {1..=5} に対して fold で積（120）を計算し、sum で合計を計算し、reduce で最大値を求めてください。",
    requirements: ["fold(初期値, |acc, &x| ...) を使う", "iter().sum() を使う", "reduce で最大値を求める"],
    hint: "fold(1, |acc, &x| acc * x) で積が計算できます。",
    answer: `fn main() {\n    let nums: Vec<i32> = (1..=5).collect();\n    let product = nums.iter().fold(1, |acc, &x| acc * x);\n    println!("積: {}", product);\n    let sum: i32 = nums.iter().sum();\n    println!("合計: {}", sum);\n    let max = nums.iter().copied().reduce(|a, b| if a > b { a } else { b });\n    println!("最大: {}", max.unwrap());\n}`
  },
  {
    id: 16, rank: "BRONZE", unit: "UNIT 04", title: "sort と dedup",
    question: "Vec<i32> {3,1,4,1,5,9,2,6,5,3} をソートして重複を除去し出力してください。また Vec<&str> を文字列長でカスタムソートしてください。",
    requirements: ["sort() でソート", "dedup() で隣接重複を除去（sort後に使う）", "sort_by でカスタム比較"],
    hint: "dedup() は連続した重複のみ除去するため、事前に sort() が必要です。",
    answer: `fn main() {\n    let mut nums = vec![3,1,4,1,5,9,2,6,5,3];\n    nums.sort();\n    nums.dedup();\n    println!("{:?}", nums);\n    let mut words = vec!["banana", "apple", "kiwi", "cherry"];\n    words.sort_by(|a, b| a.len().cmp(&b.len()));\n    println!("{:?}", words);\n}`
  },
  // UNIT 05
  {
    id: 17, rank: "SILVER", unit: "UNIT 05", title: "構造体",
    question: "Rectangle 構造体（width, height: f64）を定義し、area と perimeter を計算するメソッドを impl で実装してください。",
    requirements: ["struct Rectangle を定義する", "impl Rectangle { fn area(&self) -> f64 ... } を実装"],
    hint: "&self を使う読み取り専用メソッドと、&mut self を使う変更メソッドを区別します。",
    answer: `struct Rectangle {\n    width: f64,\n    height: f64,\n}\n\nimpl Rectangle {\n    fn new(w: f64, h: f64) -> Self { Rectangle { width: w, height: h } }\n    fn area(&self) -> f64 { self.width * self.height }\n    fn perimeter(&self) -> f64 { 2.0 * (self.width + self.height) }\n}\n\nfn main() {\n    let r = Rectangle::new(4.0, 6.0);\n    println!("面積: {}", r.area());\n    println!("周長: {}", r.perimeter());\n}`
  },
  {
    id: 18, rank: "SILVER", unit: "UNIT 05", title: "impl とメソッド",
    question: "Counter 構造体（value: i32）を作り、increment/decrement/reset/value メソッドを impl で実装してください。メソッドチェーンができるよう &mut self を返す設計にしてください。",
    requirements: ["Counter 構造体と impl を定義する", "&mut self を返してメソッドチェーンを可能にする"],
    hint: "fn increment(&mut self) -> &mut Self { self.value += 1; self }",
    answer: `struct Counter { value: i32 }\n\nimpl Counter {\n    fn new() -> Self { Counter { value: 0 } }\n    fn increment(&mut self) -> &mut Self { self.value += 1; self }\n    fn decrement(&mut self) -> &mut Self { self.value -= 1; self }\n    fn reset(&mut self) -> &mut Self { self.value = 0; self }\n    fn get(&self) -> i32 { self.value }\n}\n\nfn main() {\n    let mut c = Counter::new();\n    c.increment().increment().increment().decrement();\n    println!("{}", c.get());\n    c.reset();\n    println!("{}", c.get());\n}`
  },
  {
    id: 19, rank: "SILVER", unit: "UNIT 05", title: "トレイト",
    question: "fn describe(&self) -> String メソッドを持つ Describable トレイトを定義し、Circle と Rectangle に実装してください。",
    requirements: ["trait Describable { fn describe(&self) -> String; } を定義", "Circle と Rectangle に実装"],
    hint: "impl Describable for Circle { fn describe(&self) -> String { ... } }",
    answer: `trait Describable {\n    fn describe(&self) -> String;\n}\n\nstruct Circle { radius: f64 }\nstruct Rectangle { width: f64, height: f64 }\n\nimpl Describable for Circle {\n    fn describe(&self) -> String {\n        format!("Circle(r={})", self.radius)\n    }\n}\n\nimpl Describable for Rectangle {\n    fn describe(&self) -> String {\n        format!("Rectangle({}x{})", self.width, self.height)\n    }\n}\n\nfn main() {\n    let shapes: Vec<Box<dyn Describable>> = vec![\n        Box::new(Circle { radius: 5.0 }),\n        Box::new(Rectangle { width: 4.0, height: 6.0 }),\n    ];\n    for s in &shapes { println!("{}", s.describe()); }\n}`
  },
  {
    id: 20, rank: "SILVER", unit: "UNIT 05", title: "#[derive]",
    question: "Point 構造体に #[derive(Debug, Clone, PartialEq)] を付け、2点を比較して \"同じ\" / \"違う\" と出力し、clone した点を変更しても元が変わらないことを確認してください。",
    requirements: ["#[derive(Debug, Clone, PartialEq)] を付ける", "{:?} で Debug 出力する", "clone で複製して独立性を確認"],
    hint: "#[derive(...)] はコンパイラがトレイト実装を自動生成してくれます。",
    answer: `#[derive(Debug, Clone, PartialEq)]\nstruct Point { x: f64, y: f64 }\n\nfn main() {\n    let p1 = Point { x: 1.0, y: 2.0 };\n    let p2 = Point { x: 1.0, y: 2.0 };\n    let mut p3 = p1.clone();\n    println!("{:?}", p1);\n    println!("p1 == p2: {}", p1 == p2);\n    p3.x = 99.0;\n    println!("p3変更後 p1: {:?}", p1);\n    println!("p3: {:?}", p3);\n}`
  },
  // UNIT 06
  {
    id: 21, rank: "SILVER", unit: "UNIT 06", title: "enum",
    question: "Direction enum（North, South, East, West）を定義し、各方向に対応する日本語名を返す name メソッドを impl で実装してください。",
    requirements: ["enum Direction を定義する", "impl Direction { fn name(&self) -> &str } を実装"],
    hint: "match self { Direction::North => \"北\", ... }",
    answer: `enum Direction { North, South, East, West }\n\nimpl Direction {\n    fn name(&self) -> &str {\n        match self {\n            Direction::North => "北",\n            Direction::South => "南",\n            Direction::East  => "東",\n            Direction::West  => "西",\n        }\n    }\n}\n\nfn main() {\n    let dirs = [Direction::North, Direction::East, Direction::South, Direction::West];\n    for d in &dirs { println!("{}", d.name()); }\n}`
  },
  {
    id: 22, rank: "SILVER", unit: "UNIT 06", title: "match",
    question: "i32 を受け取り match で: 1→\"one\", 2→\"two\", 3..=9→\"small\", _→\"other\" を返す関数を定義し、複数の値でテストしてください。",
    requirements: ["match 式を使う", "レンジパターン 3..=9 を使う", "_ でワイルドカードを使う"],
    hint: "match n { 1 => ..., 2 => ..., 3..=9 => ..., _ => ... }",
    answer: `fn classify(n: i32) -> &'static str {\n    match n {\n        1 => "one",\n        2 => "two",\n        3..=9 => "small",\n        _ => "other",\n    }\n}\n\nfn main() {\n    for n in [1, 2, 5, 10, -1] {\n        println!("{}: {}", n, classify(n));\n    }\n}`
  },
  {
    id: 23, rank: "GOLD", unit: "UNIT 06", title: "Option<T>",
    question: "Vec<i32> から指定インデックスの要素を安全に返す safe_get 関数を Option<&i32> で実装し、if let と unwrap_or でそれぞれ値を取り出してください。",
    requirements: ["fn safe_get(v: &Vec<i32>, i: usize) -> Option<&i32> を定義", "if let Some(v) = ... で取り出す", ".unwrap_or(&-1) でデフォルト値を設定"],
    hint: "v.get(i) は既にインデックスの安全なアクセスを行い Option を返します。",
    answer: `fn safe_get(v: &Vec<i32>, i: usize) -> Option<&i32> {\n    v.get(i)\n}\n\nfn main() {\n    let v = vec![10, 20, 30, 40, 50];\n    if let Some(val) = safe_get(&v, 2) {\n        println!("index 2: {}", val);\n    }\n    println!("index 10: {}", safe_get(&v, 10).unwrap_or(&-1));\n    let doubled: Vec<i32> = v.iter().filter_map(|&x| if x > 20 { Some(x*2) } else { None }).collect();\n    println!("{:?}", doubled);\n}`
  },
  {
    id: 24, rank: "GOLD", unit: "UNIT 06", title: "Result<T, E>",
    question: "文字列を i32 にパースする parse_int 関数を Result<i32, String> で実装し、? 演算子を使ってエラーを伝播させるサンプルも書いてください。",
    requirements: ["fn parse_int(s: &str) -> Result<i32, String> を定義", "match で Ok/Err を処理する", "? 演算子を使う関数も作る"],
    hint: "s.parse::<i32>().map_err(|e| e.to_string()) で Result<i32, String> に変換できます。",
    answer: `fn parse_int(s: &str) -> Result<i32, String> {\n    s.parse::<i32>().map_err(|e| e.to_string())\n}\n\nfn double_parse(s: &str) -> Result<i32, String> {\n    let n = parse_int(s)?;\n    Ok(n * 2)\n}\n\nfn main() {\n    match parse_int("42") {\n        Ok(n)  => println!("成功: {}", n),\n        Err(e) => println!("失敗: {}", e),\n    }\n    match parse_int("abc") {\n        Ok(n)  => println!("成功: {}", n),\n        Err(e) => println!("失敗: {}", e),\n    }\n    println!("{:?}", double_parse("21"));\n    println!("{:?}", double_parse("xyz"));\n}`
  },
  // UNIT 07
  {
    id: 25, rank: "GOLD", unit: "UNIT 07", title: "所有権とムーブ",
    question: "String を関数に渡すと所有権がムーブされて使えなくなることを確認し、clone と参照渡し（&String）で解決する方法を示してください。",
    requirements: ["所有権のムーブを実際に体験する", "clone() で複製する", "& で参照を渡す"],
    hint: "fn takes_string(s: String) はムーブ。fn borrows_string(s: &String) は借用。",
    answer: `fn takes_string(s: String) -> usize { s.len() }\nfn borrows_string(s: &String) -> usize { s.len() }\n\nfn main() {\n    let s1 = String::from("hello");\n    let s2 = s1.clone();\n    println!("clone後 s1: {}", s1);\n    let len = takes_string(s2);\n    println!("len: {}", len);\n    let s3 = String::from("world");\n    let len2 = borrows_string(&s3);\n    println!("借用後 s3: {} len: {}", s3, len2);\n}`
  },
  {
    id: 26, rank: "GOLD", unit: "UNIT 07", title: "借用と参照",
    question: "Vec<i32> の最大値を返す関数を &Vec<i32> で受け取って実装し、関数呼び出し後も元の Vec が使えることを確認してください。また &mut Vec<i32> で要素を変更する関数も作ってください。",
    requirements: ["fn max_val(v: &Vec<i32>) -> i32 を実装（所有権を取らない）", "fn double_all(v: &mut Vec<i32>) を実装（ミュータブル参照）"],
    hint: "Rust は同時に複数の可変参照を許可しません（借用チェッカー）。",
    answer: `fn max_val(v: &Vec<i32>) -> i32 {\n    *v.iter().max().unwrap()\n}\n\nfn double_all(v: &mut Vec<i32>) {\n    for x in v.iter_mut() { *x *= 2; }\n}\n\nfn main() {\n    let mut nums = vec![3, 1, 4, 1, 5, 9];\n    println!("最大: {}", max_val(&nums));\n    println!("元: {:?}", nums);\n    double_all(&mut nums);\n    println!("2倍後: {:?}", nums);\n}`
  },
  {
    id: 27, rank: "DIAMOND", unit: "UNIT 07", title: "Box<T>",
    question: "Box<T> を使ってヒープに値を確保し、再帰的なデータ構造（単方向リスト）を定義してください: List<i32>（Cons(i32, Box<List<i32>>) / Nil）。",
    requirements: ["enum List<T> { Cons(T, Box<List<T>>), Nil } を定義", "3要素のリストを作る", "再帰で全要素を出力する"],
    hint: "Box を使わないと再帰型はサイズが確定できずコンパイルエラーになります。",
    answer: `enum List {\n    Cons(i32, Box<List>),\n    Nil,\n}\n\nimpl List {\n    fn print(&self) {\n        match self {\n            List::Cons(v, next) => { print!("{} ", v); next.print(); }\n            List::Nil => println!(),\n        }\n    }\n}\n\nfn main() {\n    let list = List::Cons(1,\n        Box::new(List::Cons(2,\n            Box::new(List::Cons(3,\n                Box::new(List::Nil))))));\n    list.print();\n}`
  },
  {
    id: 28, rank: "DIAMOND", unit: "UNIT 07", title: "ライフタイム基礎",
    question: "2つの文字列スライスのうち長い方を返す longest 関数をライフタイム注釈付きで実装してください。また構造体にライフタイム付きの参照フィールドを持たせてください。",
    requirements: ["fn longest<'a>(x: &'a str, y: &'a str) -> &'a str を定義", "ライフタイム付き参照フィールドを持つ構造体を定義"],
    hint: "<'a> はライフタイムパラメータ。戻り値の寿命が引数の寿命に依存することを示します。",
    answer: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() >= y.len() { x } else { y }\n}\n\nstruct Excerpt<'a> {\n    text: &'a str,\n}\n\nimpl<'a> Excerpt<'a> {\n    fn display(&self) { println!("{}", self.text); }\n}\n\nfn main() {\n    let s1 = String::from("long string");\n    let result;\n    {\n        let s2 = String::from("xy");\n        result = longest(s1.as_str(), s2.as_str());\n        println!("長い方: {}", result);\n    }\n    let novel = String::from("最初の文。次の文。");\n    let e = Excerpt { text: &novel };\n    e.display();\n}`
  },
  // UNIT 08
  {
    id: 29, rank: "MASTER", unit: "UNIT 08", title: "ジェネリクスとトレイト境界",
    question: "T: PartialOrd を境界とする largest 関数を実装し、i32 と f64 の両方で動作することを確認してください。また Display + Debug 境界を持つ print_twice 関数も実装してください。",
    requirements: ["fn largest<T: PartialOrd>(list: &[T]) -> &T を定義", "fn print_twice<T: std::fmt::Display + std::fmt::Debug>(x: T) を定義"],
    hint: "トレイト境界は where T: Display + Debug のようにまとめて書くこともできます。",
    answer: `use std::fmt;\n\nfn largest<T: PartialOrd>(list: &[T]) -> &T {\n    let mut max = &list[0];\n    for item in list { if item > max { max = item; } }\n    max\n}\n\nfn print_twice<T: fmt::Display + fmt::Debug>(x: T) {\n    println!("Display: {}", x);\n    println!("Debug: {:?}", x);\n}\n\nfn main() {\n    let nums = vec![3, 1, 4, 1, 5, 9];\n    println!("最大: {}", largest(&nums));\n    let floats = vec![2.1, 3.7, 1.5];\n    println!("最大: {}", largest(&floats));\n    print_twice(42);\n    print_twice("hello");\n}`
  },
  {
    id: 30, rank: "LEGEND", unit: "UNIT 08", title: "総合演習: イテレータアダプタ自作",
    question: "カスタムイテレータ Counter を実装し、zip/map/filter/fold と組み合わせて複雑な処理を実現してください（1〜5 の値を生成し、2つの Counter の積の合計を計算）。",
    requirements: ["struct Counter と impl Iterator for Counter を実装", "next() メソッドを実装する", "zip/map/fold を使って合計を計算する"],
    hint: "impl Iterator for Counter { type Item = u32; fn next(&mut self) -> Option<u32> { ... } }",
    answer:
`struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter { Counter { count: 0 } }
}

impl Iterator for Counter {
    type Item = u32;
    fn next(&mut self) -> Option<u32> {
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

fn main() {
    let sum: u32 = Counter::new()
        .zip(Counter::new().skip(1))
        .map(|(a, b)| a * b)
        .filter(|x| x % 3 == 0)
        .fold(0, |acc, x| acc + x);
    println!("合計: {}", sum);

    let v: Vec<u32> = Counter::new().map(|x| x * x).collect();
    println!("二乗: {:?}", v);

    println!("合計: {}", Counter::new().sum::<u32>());
}`
  }
];

const rustMissions = [
  {
    id: 1, rank: "BRONZE",
    title: "Vec・イテレータ",
    description: "map/filter/collectを使った変換処理",
    question: "Vec<i32> {1..=20} に対して: ①3の倍数のみ抽出、②各要素を文字列に変換して連結、③チャンクに分割して2D Vecを作る処理をイテレータで実装してください。",
    requirements: ["filter/map/collect を使う", "join で文字列連結する", "chunks で分割する"],
    hint: ".map(|x| x.to_string()).collect::<Vec<_>>().join(\", \") で文字列結合できます。",
    answer:
`fn main() {
    let nums: Vec<i32> = (1..=20).collect();
    let multiples_of_3: Vec<i32> = nums.iter().filter(|&&x| x % 3 == 0).copied().collect();
    println!("3の倍数: {:?}", multiples_of_3);
    let joined: String = nums.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(", ");
    println!("結合: {}", joined);
    let chunks: Vec<&[i32]> = nums.chunks(5).collect();
    for (i, chunk) in chunks.iter().enumerate() {
        println!("chunk{}: {:?}", i, chunk);
    }
    let sum_squares: i32 = nums.iter().map(|&x| x*x).sum();
    println!("二乗和: {}", sum_squares);
}`
  },
  {
    id: 2, rank: "BRONZE",
    title: "String・HashMap",
    description: "文字出現カウント・集計",
    question: "文章から: ①単語の出現頻度を HashMap でカウント、②最頻出単語を見つける、③母音の数を数える処理を実装してください。",
    requirements: ["entry().or_insert(0) でカウント", "max_by_key で最頻出を探す", "母音をカウントする"],
    hint: "*count += 1 で HashMap の値をインクリメントできます。",
    answer:
`use std::collections::HashMap;

fn count_words(text: &str) -> HashMap<String, usize> {
    let mut map = HashMap::new();
    for word in text.split_whitespace() {
        let w = word.to_lowercase().trim_matches(|c: char| !c.is_alphabetic()).to_string();
        if !w.is_empty() { *map.entry(w).or_insert(0) += 1; }
    }
    map
}

fn most_frequent(map: &HashMap<String, usize>) -> Option<(&String, &usize)> {
    map.iter().max_by_key(|(_, &v)| v)
}

fn count_vowels(s: &str) -> usize {
    s.chars().filter(|c| "aeiouAEIOU".contains(*c)).count()
}

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the fox";
    let freq = count_words(text);
    if let Some((word, count)) = most_frequent(&freq) {
        println!("最頻出: {} ({}回)", word, count);
    }
    println!("母音数: {}", count_vowels(text));
    let mut pairs: Vec<_> = freq.iter().collect();
    pairs.sort_by(|a, b| b.1.cmp(a.1).then(a.0.cmp(b.0)));
    println!("上位3:");
    for (w, c) in pairs.iter().take(3) { println!("  {}: {}", w, c); }
}`
  },
  {
    id: 3, rank: "SILVER",
    title: "struct・トレイト",
    description: "Displayを実装した図形クラス",
    question: "Shape トレイト（area/perimeter）と std::fmt::Display を Circle・Rectangle・Triangle に実装し、図形の情報を表示するプログラムを作ってください。",
    requirements: ["trait Shape { fn area/perimeter } を定義", "fmt::Display を実装する", "Vec<Box<dyn Shape + Display>> で統一処理（または別々）"],
    hint: "impl fmt::Display for Circle { fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result { ... } }",
    answer:
`use std::fmt;

trait Shape {
    fn area(&self) -> f64;
    fn perimeter(&self) -> f64;
}

struct Circle { r: f64 }
struct Rectangle { w: f64, h: f64 }
struct Triangle { a: f64, b: f64, c: f64 }

impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.r * self.r }
    fn perimeter(&self) -> f64 { 2.0 * std::f64::consts::PI * self.r }
}
impl Shape for Rectangle {
    fn area(&self) -> f64 { self.w * self.h }
    fn perimeter(&self) -> f64 { 2.0 * (self.w + self.h) }
}
impl Shape for Triangle {
    fn area(&self) -> f64 {
        let s = (self.a+self.b+self.c)/2.0;
        (s*(s-self.a)*(s-self.b)*(s-self.c)).sqrt()
    }
    fn perimeter(&self) -> f64 { self.a+self.b+self.c }
}

impl fmt::Display for Circle { fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result { write!(f, "Circle(r={})", self.r) } }
impl fmt::Display for Rectangle { fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result { write!(f, "Rect({}x{})", self.w, self.h) } }
impl fmt::Display for Triangle { fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result { write!(f, "Triangle({},{},{})", self.a, self.b, self.c) } }

fn print_shape(s: &(impl Shape + fmt::Display)) {
    println!("{}: 面積={:.2} 周長={:.2}", s, s.area(), s.perimeter());
}

fn main() {
    print_shape(&Circle { r: 5.0 });
    print_shape(&Rectangle { w: 4.0, h: 6.0 });
    print_shape(&Triangle { a: 3.0, b: 4.0, c: 5.0 });
}`
  },
  {
    id: 4, rank: "SILVER",
    title: "Option・Result",
    description: "エラーハンドリングパターン",
    question: "設定値のパースと検証を行う関数群を実装してください: parse_port（1-65535検証）、parse_host（空文字NG）、両者をまとめて Result を返す parse_config を ? で実装。",
    requirements: ["fn parse_port(s: &str) -> Result<u16, String>", "fn parse_host(s: &str) -> Result<String, String>", "fn parse_config(host: &str, port: &str) -> Result<(String, u16), String>"],
    hint: "? は Err の場合に早期リターンします。エラー型が一致している必要があります。",
    answer:
`fn parse_port(s: &str) -> Result<u16, String> {
    let n: u16 = s.parse().map_err(|_| format!("無効なポート: {}", s))?;
    if n == 0 { return Err("ポートは1以上が必要".to_string()); }
    Ok(n)
}

fn parse_host(s: &str) -> Result<String, String> {
    if s.is_empty() { return Err("ホスト名は空にできません".to_string()); }
    Ok(s.to_string())
}

fn parse_config(host: &str, port: &str) -> Result<(String, u16), String> {
    let h = parse_host(host)?;
    let p = parse_port(port)?;
    Ok((h, p))
}

fn main() {
    let cases = [
        ("localhost", "8080"),
        ("", "8080"),
        ("localhost", "abc"),
        ("localhost", "0"),
    ];
    for (host, port) in &cases {
        match parse_config(host, port) {
            Ok((h, p)) => println!("OK: {}:{}", h, p),
            Err(e)     => println!("NG: {}", e),
        }
    }
}`
  },
  {
    id: 5, rank: "GOLD",
    title: "所有権・借用",
    description: "move semanticsの理解と活用",
    question: "所有権・借用・ライフタイムを活用した文字列処理ライブラリを作ってください: split_words（&str→Vec<&str>）、capitalize（&str→String）、word_stats（&str→HashMap）。",
    requirements: ["split_words は & でライフタイムを伝播させる", "capitalize は新しい String を返す", "word_stats で平均単語長なども計算する"],
    hint: "fn split_words<'a>(s: &'a str) -> Vec<&'a str> はライフタイム注釈が必要です。",
    answer:
`use std::collections::HashMap;

fn split_words(s: &str) -> Vec<&str> {
    s.split_whitespace().collect()
}

fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(c) => c.to_uppercase().to_string() + chars.as_str(),
    }
}

fn word_stats(s: &str) -> HashMap<&str, usize> {
    let words = split_words(s);
    let mut map = HashMap::new();
    for w in words { map.insert(w, w.len()); }
    map
}

fn main() {
    let text = "hello world foo bar";
    let words = split_words(text);
    println!("{:?}", words);
    for w in &words { println!("{}", capitalize(w)); }
    let stats = word_stats(text);
    let avg = stats.values().sum::<usize>() as f64 / stats.len() as f64;
    println!("平均単語長: {:.2}", avg);
}`
  },
  {
    id: 6, rank: "GOLD",
    title: "ジェネリクス",
    description: "トレイト境界付きの汎用データ構造",
    question: "ジェネリクスを使った MinMax<T> 構造体を実装してください: T: PartialOrd + Copy として、push で要素を追加し、min/max/mean（f64に変換）を返すメソッドを持たせてください。",
    requirements: ["struct MinMax<T> を定義する", "T: PartialOrd + Copy + Into<f64> 境界を設定", "min/max/mean を実装する"],
    hint: "fn mean(&self) -> f64 では Into<f64> の境界を使って sum を計算できます。",
    answer:
`struct MinMax<T> {
    data: Vec<T>,
}

impl<T: PartialOrd + Copy + Into<f64>> MinMax<T> {
    fn new() -> Self { MinMax { data: Vec::new() } }
    fn push(&mut self, val: T) { self.data.push(val); }
    fn min(&self) -> Option<T> { self.data.iter().copied().reduce(|a, b| if a < b { a } else { b }) }
    fn max(&self) -> Option<T> { self.data.iter().copied().reduce(|a, b| if a > b { a } else { b }) }
    fn mean(&self) -> Option<f64> {
        if self.data.is_empty() { return None; }
        let sum: f64 = self.data.iter().copied().map(Into::into).sum();
        Some(sum / self.data.len() as f64)
    }
}

fn main() {
    let mut mm: MinMax<i32> = MinMax::new();
    for x in [5, 3, 8, 1, 9, 2, 7] { mm.push(x); }
    println!("min: {:?}", mm.min());
    println!("max: {:?}", mm.max());
    println!("mean: {:.2}", mm.mean().unwrap());
}`
  }
];

const rustUnitGuides = [
  {
    id: "rust-unit01", unit: "UNIT 01", title: "Hello Rust & 変数",
    summary: "println!、let/let mut、基本型（i32/f64/bool/char）、型注釈を学ぶ。",
    points: ["println!(\"{}\" , x) でプレースホルダを使った出力", "変数はデフォルト不変（immutable）。変更には mut が必要", "型注釈: let x: i32 = 5 または型推論 let x = 5i32", "Rust は厳密な型システムを持ち、暗黙の型変換をしない"],
    words: [{ term: "immutable", desc: "変更不可。Rustのデフォルト。安全性の基礎となる設計" }, { term: "let mut", desc: "可変変数の宣言。値を後で変更できる" }, { term: "シャドーイング", desc: "同名の let で変数を再宣言。型も変えられる" }]
  },
  {
    id: "rust-unit02", unit: "UNIT 02", title: "制御フロー",
    summary: "if（式として使える）、loop/while/for、range を学ぶ。",
    points: ["if は式なので let x = if ... { v1 } else { v2 } と書ける", "loop は無限ループ。break VALUE で値を返せる", "for x in 1..5（5除く）、1..=5（5含む）でレンジ反復", ".rev() で逆順、.enumerate() でインデックス付き反復"],
    words: [{ term: "loop", desc: "無限ループ。break で抜け、break VALUE で値を返せる" }, { term: "range", desc: "1..5（排他的）または 1..=5（包括的）の数列" }, { term: "if式", desc: "if を値として使える。両腕の型が一致する必要あり" }]
  },
  {
    id: "rust-unit03", unit: "UNIT 03", title: "コレクション",
    summary: "Vec<T>、String、HashMap<K,V>、イテレータチェーンを学ぶ。",
    points: ["Vec<T> は可変長配列。push/pop/len/contains が基本操作", "String は所有権を持つ文字列。&str は参照", "HashMap の entry API で安全に挿入・更新できる", "map/filter/collect でイテレータを変換・収集する"],
    words: [{ term: "Vec<T>", desc: "ヒープ上の可変長配列。要素の型は一つに固定" }, { term: "&str vs String", desc: "&str はスライス（参照）、String は所有する動的文字列" }, { term: "Iterator", desc: "next()を持つトレイト。map/filter/collect等で変換できる" }]
  },
  {
    id: "rust-unit04", unit: "UNIT 04", title: "関数とクロージャ",
    summary: "関数定義、クロージャ（環境キャプチャ）、Iterator メソッドを学ぶ。",
    points: ["fn name(arg: Type) -> RetType { ... } で関数定義", "最後の式が戻り値（return は省略可）", "クロージャ |x| x + 1 は外側の変数をキャプチャできる", "fold/sum/product/max/min など集約系メソッドが豊富"],
    words: [{ term: "クロージャ", desc: "環境をキャプチャできる無名関数。|引数| 式 の形" }, { term: "fold", desc: "アキュムレータを使って要素を1つの値に畳み込む" }, { term: "デストラクタリング", desc: "パターンマッチで複合型をバラして変数に束縛" }]
  },
  {
    id: "rust-unit05", unit: "UNIT 05", title: "struct と trait",
    summary: "構造体定義、impl、トレイト、#[derive]を学ぶ。",
    points: ["struct で関連するデータをまとめる", "impl Struct { ... } でメソッドを実装", "trait でインターフェースを定義。impl Trait for Type で実装", "#[derive(Debug, Clone, PartialEq)] で自動実装を生成"],
    words: [{ term: "impl", desc: "構造体やトレイトのメソッドを定義するブロック" }, { term: "trait", desc: "型が持つべき振る舞いを定義するインターフェース" }, { term: "#[derive]", desc: "コンパイラが自動でトレイト実装を生成するアトリビュート" }]
  },
  {
    id: "rust-unit06", unit: "UNIT 06", title: "enum と match",
    summary: "enum、match（パターンマッチング）、Option<T>、Result<T,E>を学ぶ。",
    points: ["enum で排他的な値の集合を定義。データを持つバリアントも作れる", "match は全パターンを網羅する必要がある（コンパイラが確認）", "Option<T> は Some(T) か None。null が存在しない代わり", "Result<T,E> は Ok(T) か Err(E)。エラー処理の標準的な方法"],
    words: [{ term: "enum", desc: "複数の可能性を表す型。各バリアントはデータを持てる" }, { term: "match", desc: "パターンマッチング。全バリアントの網羅が必要" }, { term: "Option<T>", desc: "値があるかもしれない型。Some(v) または None" }]
  },
  {
    id: "rust-unit07", unit: "UNIT 07", title: "所有権・借用・ライフタイム",
    summary: "Rustの最重要概念：所有権システム、借用チェッカー、ライフタイムを学ぶ。",
    points: ["各値は1つの所有者を持つ。スコープを抜けると自動でドロップ", "& で不変参照、&mut で可変参照。同時に複数の可変参照は不可", "Box<T> はヒープに値を確保する。再帰型に必要", "ライフタイム注釈 <'a> で参照の寿命をコンパイラに伝える"],
    words: [{ term: "ownership", desc: "各値は必ず1つの変数（所有者）に属する。ムーブで移動" }, { term: "borrow", desc: "所有権を移さず参照で値にアクセスする仕組み" }, { term: "lifetime", desc: "参照の有効期間。'a などで注釈する" }]
  },
  {
    id: "rust-unit08", unit: "UNIT 08", title: "ジェネリクスと高度な機能",
    summary: "ジェネリクス関数・型、トレイト境界、カスタムイテレータを学ぶ。",
    points: ["<T> でジェネリクス。T: Trait で境界を指定", "where T: Display + Clone のような複合境界も書ける", "impl Iterator for T で任意の型をイテレータにできる", "dyn Trait でトレイトオブジェクト（動的ディスパッチ）"],
    words: [{ term: "ジェネリクス", desc: "型パラメータ <T> で汎用的なコードを書く仕組み" }, { term: "トレイト境界", desc: "T: Display のように型パラメータに要件を課す" }, { term: "dyn Trait", desc: "実行時に型が決まるトレイトオブジェクト。Box<dyn Trait>で使う" }]
  }
];

// ===== 言語別データ取得ヘルパー =====

function getProblems() {
  if (currentLanguage === 'python') return pythonProblems;
  if (currentLanguage === 'javascript') return javascriptProblems;
  if (currentLanguage === 'ruby') return rubyProblems;
  if (currentLanguage === 'typescript') return typescriptProblems;
  if (currentLanguage === 'kotlin') return kotlinProblems;
  if (currentLanguage === 'swift') return swiftProblems;
  if (currentLanguage === 'java') return javaProblems;
  if (currentLanguage === 'csharp') return csharpProblems;
  if (currentLanguage === 'go') return goProblems;
  if (currentLanguage === 'c') return cProblems;
  if (currentLanguage === 'rust') return rustProblems;
  return problems;
}

function getMissions() {
  if (currentLanguage === 'python') return pythonMissions;
  if (currentLanguage === 'javascript') return javascriptMissions;
  if (currentLanguage === 'ruby') return rubyMissions;
  if (currentLanguage === 'typescript') return typescriptMissions;
  if (currentLanguage === 'kotlin') return kotlinMissions;
  if (currentLanguage === 'swift') return swiftMissions;
  if (currentLanguage === 'java') return javaMissions;
  if (currentLanguage === 'csharp') return csharpMissions;
  if (currentLanguage === 'go') return goMissions;
  if (currentLanguage === 'c') return cMissions;
  if (currentLanguage === 'rust') return rustMissions;
  return missions;
}

function getUnitGuides() {
  if (currentLanguage === 'python') return pythonUnitGuides;
  if (currentLanguage === 'javascript') return javascriptUnitGuides;
  if (currentLanguage === 'ruby') return rubyUnitGuides;
  if (currentLanguage === 'typescript') return typescriptUnitGuides;
  if (currentLanguage === 'kotlin') return kotlinUnitGuides;
  if (currentLanguage === 'swift') return swiftUnitGuides;
  if (currentLanguage === 'java') return javaUnitGuides;
  if (currentLanguage === 'csharp') return csharpUnitGuides;
  if (currentLanguage === 'go') return goUnitGuides;
  if (currentLanguage === 'c') return cUnitGuides;
  if (currentLanguage === 'rust') return rustUnitGuides;
  return unitGuides;
}

function getProgressKey() {
  return (currentLanguage || 'cpp') + '_progress';
}

function getMissionProgressKey() {
  return (currentLanguage || 'cpp') + '_mission_progress';
}

function getCompiler() {
  if (currentLanguage === 'python') return 'cpython-3.12.7';
  if (currentLanguage === 'javascript') return 'nodejs-head';
  if (currentLanguage === 'ruby') return 'ruby-3.4.9';
  if (currentLanguage === 'typescript') return 'typescript-5.6.2';
  if (currentLanguage === 'kotlin') return 'kotlin';
  if (currentLanguage === 'swift') return 'swift-5.10';
  if (currentLanguage === 'java') return 'openjdk-head';
  if (currentLanguage === 'csharp') return 'mono-6.12.0.206';
  if (currentLanguage === 'go') return 'go-1.20.6';
  if (currentLanguage === 'c') return 'gcc-head';
  if (currentLanguage === 'rust') return 'rust-1.73.0';
  return 'gcc-head';
}

function getAceMode() {
  if (currentLanguage === 'python') return 'ace/mode/python';
  if (currentLanguage === 'javascript') return 'ace/mode/javascript';
  if (currentLanguage === 'ruby') return 'ace/mode/ruby';
  if (currentLanguage === 'typescript') return 'ace/mode/typescript';
  if (currentLanguage === 'kotlin') return 'ace/mode/kotlin';
  if (currentLanguage === 'swift') return 'ace/mode/swift';
  if (currentLanguage === 'java') return 'ace/mode/java';
  if (currentLanguage === 'csharp') return 'ace/mode/csharp';
  if (currentLanguage === 'go') return 'ace/mode/golang';
  if (currentLanguage === 'c') return 'ace/mode/c_cpp';
  if (currentLanguage === 'rust') return 'ace/mode/rust';
  return 'ace/mode/c_cpp';
}

function getStarterCode() {
  var p = getProblems().find(function(x) { return x.id === currentProblemId; });
  if (currentLanguage === 'python') {
    if (p) return '# [問題] ' + p.question + '\n\n';
    return '# ここにコードを書いてください\n';
  }
  if (currentLanguage === 'javascript') {
    if (p) return '// [問題] ' + p.question + '\n\n';
    return '// ここにコードを書いてください\n';
  }
  if (currentLanguage === 'ruby') {
    if (p) return '# [問題] ' + p.question + '\n\n';
    return '# ここにコードを書いてください\n';
  }
  if (currentLanguage === 'typescript') {
    if (p) return '// [問題] ' + p.question + '\n\n';
    return '// ここにコードを書いてください\n';
  }
  if (currentLanguage === 'kotlin') {
    if (p) return '// [問題] ' + p.question + '\n\nfun main() {\n    \n}\n';
    return 'fun main() {\n    \n}\n';
  }
  if (currentLanguage === 'swift') {
    if (p) return '// [問題] ' + p.question + '\n\n';
    return '// ここにコードを書いてください\n';
  }
  if (currentLanguage === 'java') {
    if (p) return '// [問題] ' + p.question + '\n\nclass Main {\n    public static void main(String[] args) {\n        \n    }\n}\n';
    return 'class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n';
  }
  if (currentLanguage === 'csharp') {
    if (p) return '// [問題] ' + p.question + '\n\nusing System;\nclass Program {\n    static void Main() {\n        \n    }\n}\n';
    return 'using System;\nclass Program {\n    static void Main() {\n        \n    }\n}\n';
  }
  if (currentLanguage === 'go') {
    if (p) return '// [問題] ' + p.question + '\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    \n}\n';
    return 'package main\n\nimport "fmt"\n\nfunc main() {\n    \n}\n';
  }
  if (currentLanguage === 'c') {
    if (p) return '// [問題] ' + p.question + '\n\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n';
    return '#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n';
  }
  if (currentLanguage === 'rust') {
    if (p) return '// [問題] ' + p.question + '\n\nfn main() {\n    \n}\n';
    return 'fn main() {\n    \n}\n';
  }
  if (p) return '// [問題] ' + p.question + '\n' + ACE_STARTER;
  return ACE_STARTER;
}

function getLangName() {
  if (currentLanguage === 'python') return 'Python';
  if (currentLanguage === 'javascript') return 'JavaScript';
  if (currentLanguage === 'ruby') return 'Ruby';
  if (currentLanguage === 'typescript') return 'TypeScript';
  if (currentLanguage === 'kotlin') return 'Kotlin';
  if (currentLanguage === 'swift') return 'Swift';
  if (currentLanguage === 'java') return 'Java';
  if (currentLanguage === 'csharp') return 'C#';
  if (currentLanguage === 'go') return 'Go';
  if (currentLanguage === 'c') return 'C';
  if (currentLanguage === 'rust') return 'Rust';
  return 'C++';
}

// ===== 進捗管理 (Supabase 対応) =====

function _getLocalProgress() {
  var data = localStorage.getItem(getProgressKey());
  return data ? JSON.parse(data) : [];
}

function loadProgress() {
  if (_progressCache !== null) return _progressCache.slice();
  return _getLocalProgress();
}

function saveProgress(id) {
  var progress = loadProgress();
  if (progress.includes(id)) return;
  progress.push(id);
  _progressCache = progress;
  localStorage.setItem(getProgressKey(), JSON.stringify(progress));
  if (currentUser && _supabase) {
    _supabase.from('progress').upsert({
      user_id: currentUser.id,
      language: currentLanguage || 'cpp',
      problem_id: id
    }).then(function() {}).catch(function() {});
  }
  checkLevelUp(); // EXP・レベルアップ判定
}

function removeProgress(id) {
  var progress = loadProgress().filter(function(x) { return x !== id; });
  _progressCache = progress;
  localStorage.setItem(getProgressKey(), JSON.stringify(progress));
  if (currentUser && _supabase) {
    _supabase.from('progress')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('language', currentLanguage || 'cpp')
      .eq('problem_id', id)
      .then(function() {}).catch(function() {});
  }
}

function isLearned(id) {
  return loadProgress().includes(id);
}

async function syncProgressFromSupabase() {
  if (!currentUser || !_supabase || !currentLanguage) return;
  var lang = currentLanguage;
  try {
    var result = await _supabase
      .from('progress')
      .select('problem_id')
      .eq('user_id', currentUser.id)
      .eq('language', lang);
    if (result.error) return;
    var remoteIds = (result.data || []).map(function(r) { return r.problem_id; });
    var localIds  = _getLocalProgress();
    // リモート ∪ ローカル をマージ
    var merged = remoteIds.slice();
    localIds.forEach(function(id) { if (!merged.includes(id)) merged.push(id); });
    _progressCache = merged;
    localStorage.setItem(getProgressKey(), JSON.stringify(merged));
    // ローカルのみのものを Supabase に書き込む
    var toUpload = localIds.filter(function(id) { return !remoteIds.includes(id); });
    if (toUpload.length > 0) {
      var rows = toUpload.map(function(id) {
        return { user_id: currentUser.id, language: lang, problem_id: id };
      });
      await _supabase.from('progress').upsert(rows);
    }
  } catch(e) {}
  updateProgressDisplay();
  renderList();
}

// ===== 画面切り替え =====

function showPage(name) {
  // 問題/ミッション詳細を離れるときに学習タイマーを保存
  stopStudyTimer();
  // 全ページを非表示にしてから対象だけ表示
  ["page-landing", "page-lang", "page-list", "page-detail", "page-guide",
   "page-mission-list", "page-mission-detail", "page-profile"].forEach(function(id) {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById("page-" + name).classList.remove("hidden");

  // 言語選択画面ではナビとプログレスを隠す
  if (name === 'lang') {
    document.getElementById('nav-tabs').classList.add('hidden');
    document.getElementById('progress-text').classList.add('hidden');
    document.getElementById('progress-bar-wrap').classList.add('hidden');
  }
  // 問題・ミッション詳細では学習タイマーを開始
  if (name === 'detail' || name === 'mission-detail') {
    startStudyTimer();
  }
}

// ===== 進捗バーの更新 =====

function updateProgressDisplay() {
  const count = loadProgress().length;
  const total = getProblems().length;
  document.getElementById("progress-text").textContent = count + " / " + total + " 問 クリア";
  document.getElementById("progress-bar").style.width = (count / total * 100) + "%";
}

// ===== 問題一覧の描画（単元グループ） =====

function renderList() {
  const list = document.getElementById("problem-list");
  list.innerHTML = "";

  // 無料ユーザー向け広告スロット
  if (!currentUserIsPremium) {
    var adTop = document.createElement('div');
    adTop.className = 'ad-slot ad-banner';
    adTop.innerHTML =
      '<div class="ad-placeholder-inner">' +
        '<span class="ad-label">PR</span>' +
        '<span class="ad-text">Google AdSenseコードをここに貼り付けます</span>' +
      '</div>';
    list.appendChild(adTop);
  }

  // 単元ごとにグループ化
  var units = {};
  var unitOrder = [];
  getProblems().forEach(function(p) {
    if (!units[p.unit]) {
      units[p.unit] = [];
      unitOrder.push(p.unit);
    }
    units[p.unit].push(p);
  });

  unitOrder.forEach(function(unitName) {
    // 単元ヘッダー
    var unitProblems = units[unitName];
    var clearedCount = unitProblems.filter(function(p) { return isLearned(p.id); }).length;
    var topRank = unitProblems[unitProblems.length - 1].rank.toLowerCase();
    var header = document.createElement("div");
    header.className = "unit-header";
    header.innerHTML =
      '<span class="unit-header-name">' + unitName + '</span>' +
      '<span class="unit-header-meta">' +
        '<span class="unit-header-count rank-' + topRank + '">' + clearedCount + ' / ' + unitProblems.length + '</span>' +
      '</span>';
    list.appendChild(header);

    // 問題カード
    units[unitName].forEach(function(p) {
      var learned = isLearned(p.id);
      var isLocked = isPremiumRequired(p.rank) && !currentUserIsPremium;
      var card = document.createElement("div");
      card.className = "problem-card rank-card-" + p.rank.toLowerCase() +
        (learned ? " learned" : "") +
        (isLocked ? " premium-locked-card" : "");

      card.innerHTML =
        '<div class="card-left">' +
          '<span class="card-num">' + String(p.id).padStart(2, '0') + '</span>' +
          '<span class="problem-title">' + p.title + '</span>' +
        '</div>' +
        '<div class="card-right">' +
          '<span class="rank-badge rank-' + p.rank.toLowerCase() + '">' + p.rank + '</span>' +
          (isLocked
            ? '<span class="premium-lock-icon">🔒</span>'
            : '<span class="badge ' + (learned ? "" : "not-learned") + '">' +
                (learned ? "✔" : "—") +
              '</span>'
          ) +
        '</div>';

      if (isLocked) {
        card.addEventListener("click", function() { openPremiumModal(); });
      } else {
        card.addEventListener("click", function() {
          playItemSelect();
          history.pushState({ page: 'detail', lang: currentLanguage, id: p.id }, '');
          renderDetail(p.id);
          showPage("detail");
        });
      }

      list.appendChild(card);
    });

  });

  updateProgressDisplay();
}

// ===== ヒント・解説の開閉 =====

function toggleSection(sectionId) {
  const el = document.getElementById(sectionId);
  el.classList.toggle("hidden");
}

// ===== 特殊文字のエスケープ =====

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ===== 問題詳細の描画 =====

function renderDetail(id) {
  const p = getProblems().find(function(x) { return x.id === id; });
  const learned = isLearned(p.id);

  // 既存エディタのコードを保存してから破棄
  var savedCode = aceEditor ? aceEditor.getValue() : null;
  if (aceEditor) { aceEditor.destroy(); aceEditor = null; }
  currentProblemId = id;
  currentEditorMode = 'scratch';  // モードをリセット

  const detail = document.getElementById("detail-content");
  detail.innerHTML =
    '<div class="detail-meta">' +
      '<span class="detail-unit">' + p.unit + '</span>' +
    '</div>' +
    '<h2>' + p.title + '</h2>' +
    '<span class="rank-badge rank-' + p.rank.toLowerCase() + ' rank-badge-lg" style="display:inline-block;margin-bottom:18px;">' + p.rank + '</span>' +

    '<div class="section">' +
      '<h3>問題</h3>' +
      '<p>' + p.question + '</p>' +
    '</div>' +

    '<div class="section">' +
      '<button class="toggle-btn" onclick="toggleSection(\'hint-' + p.id + '\')">💡 ヒントを見る</button>' +
      '<div id="hint-' + p.id + '" class="hidden toggle-content">' +
        '<p>' + p.hint + '</p>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      '<button class="toggle-btn" onclick="toggleSection(\'answer-' + p.id + '\')">📋 正解例を見る</button>' +
      '<div id="answer-' + p.id + '" class="hidden toggle-content">' +
        '<pre><code>' + escapeHtml(p.answer) + '</code></pre>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      '<button class="toggle-btn" onclick="toggleSection(\'explanation-' + p.id + '\')">📖 解説を見る</button>' +
      '<div id="explanation-' + p.id + '" class="hidden toggle-content">' +
        '<p>' + p.explanation + '</p>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      '<div class="editor-mode-bar">' +
        '<button id="mode-zero"    class="mode-btn"        onclick="editorZero()">⬜ ゼロから</button>' +
        '<button id="mode-scratch" class="mode-btn active" onclick="editorScratch()">📋 テンプレート</button>' +
        '<button id="mode-fill"   class="mode-btn"        onclick="editorFill()">📝 穴埋め</button>' +
        '<button class="mode-btn basicform-btn"            onclick="showBasicForm()">📖 基本形</button>' +
      '</div>' +
      '<div id="code-editor" class="code-editor-ace"></div>' +
      '<div class="editor-options">' +
        '<label class="stdin-label">標準入力（cin用）：</label>' +
        '<input id="stdin-input" class="stdin-input" type="text" placeholder="例: 5">' +
      '</div>' +
      '<button class="run-btn" onclick="runCode()">▶ 実行する</button>' +
      '<div id="output-area" class="hidden">' +
        '<p class="output-label">実行結果：</p>' +
        '<pre id="output-text"></pre>' +
      '</div>' +
      '<div id="judge-area" class="hidden"></div>' +
      '<button class="ai-feedback-btn" onclick="getAIFeedback(' + p.id + ')">🤖 AIにフィードバックをもらう</button>' +
      '<div id="ai-feedback-area" class="hidden">' +
        '<p class="output-label">// AI FEEDBACK</p>' +
        '<div id="ai-feedback-text" class="ai-feedback-text"></div>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      (learned
        ? '<button id="learn-btn" class="learn-btn learned" onclick="toggleLearned(' + p.id + ')">✔ CLEARED  ／  クリックで取り消す</button>'
        : '<p class="manual-clear-hint">実行して自動判定されます ／ <button class="manual-clear-link" onclick="toggleLearned(' + p.id + ')">手動でクリア</button></p>'
      ) +
    '</div>';

  // Ace Editor を初期化（再描画のときはコードを引き継ぐ）
  initAceEditor(savedCode !== null ? savedCode : getStarterCode());
}

// ===== Ace Editor 初期化 =====

var aceEditor = null;
var currentProblemId = null;
var currentEditorMode = 'scratch';

var ACE_STARTER =
'#include <iostream>\n' +
'using namespace std;\n' +
'\n' +
'int main() {\n' +
'    \n' +
'    return 0;\n' +
'}\n';

function initAceEditor(initialCode) {
  // Ace が読み込まれていなければスキップ
  if (typeof ace === 'undefined') {
    console.warn('Ace Editor not loaded');
    return;
  }
  // CDN のベースパスを設定（テーマ・モードの遅延ロード用）
  ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.36.5/');

  aceEditor = ace.edit('code-editor');

  // ダークテーマ（Monokai）
  aceEditor.setTheme('ace/theme/monokai');

  // 言語別構文ハイライト
  aceEditor.session.setMode(getAceMode());

  // 初期コードをセット（カーソルを末尾へ）
  aceEditor.setValue(initialCode !== undefined ? initialCode : getStarterCode(), -1);

  aceEditor.setOptions({
    fontSize          : '14px',
    fontFamily        : "'Share Tech Mono', 'Consolas', monospace",
    showPrintMargin   : false,
    tabSize           : 4,
    useSoftTabs       : true,
    wrap              : false,
    showGutter        : true,
    highlightActiveLine: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion : false,
  });

  // Tab キーでスペース4つ挿入
  aceEditor.commands.addCommand({
    name: 'insertTab',
    bindKey: { win: 'Tab', mac: 'Tab' },
    exec: function(editor) { editor.insert('    '); }
  });
}

// ===== 穴埋めスケルトン生成 =====

function buildSkeleton(p) {
  if (currentLanguage === 'python') {
    // Python：コードそのまま、文字列リテラル(f文字列除く)と数値だけ空欄
    var skeleton = p.answer.trim()
      .replace(/(?<![fF])"[^"]*"/g, '"________"')
      .replace(/\b\d+(\.\d+)?\b/g, '____');
    return skeleton + '\n';
  }
  if (currentLanguage === 'javascript') {
    // JavaScript：テンプレートリテラル以外の文字列と数値を空欄
    var skeleton = p.answer.trim()
      .replace(/"[^"]*"/g, '"________"')
      .replace(/\b\d+(\.\d+)?\b/g, '____');
    return skeleton + '\n';
  }
  // C++：#include〜main()の完全な構造を維持しつつロジック行の値だけ空欄
  var allLines = p.answer.split('\n');
  var includes = allLines
    .filter(function(l) { return l.trim().startsWith('#include'); })
    .join('\n');
  var logicLines = allLines.filter(function(l) {
    var t = l.trim();
    return t !== '' && !t.startsWith('#include') && !t.startsWith('using namespace')
        && t !== 'int main() {' && t !== '}' && t !== 'return 0;';
  });
  var blankedLogic = logicLines.map(function(l) {
    return l.replace(/"[^"]*"/g, '"________"').replace(/\b\d+\b/g, '____');
  }).join('\n');
  return includes
    + '\nusing namespace std;\n\nint main() {\n'
    + (blankedLogic ? blankedLogic + '\n' : '    \n')
    + '    return 0;\n'
    + '}';
}

// onclick から引数なしで呼べるラッパー（クォートネスト問題を回避）
function editorZero()    { playUIClick(); setEditorMode('zero');    }
function editorScratch() { playUIClick(); setEditorMode('scratch'); }
function editorFill()    { playUIClick(); setEditorMode('fill');    }

// ===== 基本形モーダル =====

var _basicformLang = null;
var _basicformTemplates = {
  cpp:        '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
  python:     '# ここにコードを書いてください',
  javascript: '// ここにコードを書いてください',
  typescript: '// ここにコードを書いてください',
  ruby:       '# ここにコードを書いてください',
  kotlin:     'fun main() {\n    \n}',
  swift:      '// ここにコードを書いてください',
  java:       'class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  csharp:     'using System;\nclass Program {\n    static void Main() {\n        \n    }\n}',
  go:         'package main\n\nimport "fmt"\n\nfunc main() {\n    \n}',
  c:          '#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}',
  rust:       'fn main() {\n    \n}'
};
var _basicformLangNames = {
  cpp: 'C++', python: 'Python', javascript: 'JS', typescript: 'TS',
  ruby: 'Ruby', kotlin: 'Kotlin', swift: 'Swift', java: 'Java',
  csharp: 'C#', go: 'Go', c: 'C', rust: 'Rust'
};
var _basicformOrder = ['cpp','python','javascript','typescript','ruby','kotlin','swift','java','csharp','go','c','rust'];

function showBasicForm() {
  playUIClick();
  _basicformLang = currentLanguage;
  _renderBasicFormModal();
  document.getElementById('basicform-modal').classList.remove('hidden');
}

function _renderBasicFormModal() {
  var tabs = _basicformOrder.map(function(l) {
    var active = l === _basicformLang ? ' active' : '';
    return '<button class="bf-tab' + active + '" onclick="switchBasicFormLang(\'' + l + '\')">' + _basicformLangNames[l] + '</button>';
  }).join('');
  document.getElementById('basicform-tabs').innerHTML = tabs;
  document.getElementById('basicform-title').textContent = _basicformLangNames[_basicformLang] + ' — 基本形';
  document.getElementById('basicform-code').textContent = _basicformTemplates[_basicformLang];
  document.getElementById('basicform-copy').textContent = 'コピー';
}

function switchBasicFormLang(lang) {
  _basicformLang = lang;
  _renderBasicFormModal();
}

function closeBasicFormModal() {
  document.getElementById('basicform-modal').classList.add('hidden');
}

function copyBasicForm() {
  var code = document.getElementById('basicform-code').textContent;
  navigator.clipboard.writeText(code).then(function() {
    var btn = document.getElementById('basicform-copy');
    btn.textContent = 'コピー済み ✓';
    setTimeout(function() { btn.textContent = 'コピー'; }, 2000);
  });
}

// ===== エディタモード切り替え =====

function setEditorMode(mode) {
  if (!aceEditor) return;
  var p = getProblems().find(function(x) { return x.id === currentProblemId; });

  // コードが書かれていたら確認
  var current = aceEditor.getValue().trim();
  var isDefault = current === ''
    || current === ACE_STARTER.trim()
    || current === getStarterCode().trim()
    || current === '# ここにコードを書いてください'
    || current === (p ? buildSkeleton(p).trim() : '');
  if (!isDefault) {
    if (!confirm('現在のコードが消えます。よいですか？')) return;
  }

  currentEditorMode = mode;

  // ボタンのactive状態を更新
  ['mode-zero', 'mode-scratch', 'mode-fill'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });
  var activeBtn = document.getElementById('mode-' + mode);
  if (activeBtn) activeBtn.classList.add('active');

  if (mode === 'zero') {
    aceEditor.setValue('', -1);
  } else if (mode === 'scratch') {
    aceEditor.setValue(getStarterCode(), -1);
  } else {
    aceEditor.setValue(p ? buildSkeleton(p) : getStarterCode(), -1);
  }
  aceEditor.focus();
}

// ===== コードを実行する（Wandbox API + 自動判定） =====

async function runCode() {
  const code = aceEditor ? aceEditor.getValue().trim() : '';
  if (!code) { alert("コードを入力してください"); return; }

  const btn        = document.querySelector(".run-btn");
  const outputArea = document.getElementById("output-area");
  const outputText = document.getElementById("output-text");
  const judgeArea  = document.getElementById("judge-area");
  const stdin      = document.getElementById("stdin-input").value;

  btn.textContent = "実行中...";
  btn.disabled = true;
  outputArea.classList.add("hidden");
  if (judgeArea) judgeArea.classList.add("hidden");

  try {
    var _isKotlin  = currentLanguage === 'kotlin';
    const controller = new AbortController();
    const _timeout   = setTimeout(function() { controller.abort(); }, _isKotlin ? 30000 : 20000);
    var _fetchUrl  = _isKotlin ? '/api/run-kotlin' : 'https://wandbox.org/api/compile.json';
    var _wandboxBody = { code: code, compiler: getCompiler(), stdin: stdin };
    if (currentLanguage === 'c') _wandboxBody.options = 'c11';
    var _fetchBody = _isKotlin
      ? JSON.stringify({ code: code })
      : JSON.stringify(_wandboxBody);

    const res = await fetch(_fetchUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    _fetchBody,
      signal:  controller.signal
    });
    clearTimeout(_timeout);

    if (!res.ok) {
      var _errBody = {};
      try { _errBody = await res.json(); } catch(e) {}
      var _errMsg = _errBody.error || ('HTTP ' + res.status + (_isKotlin ? ' — Kotlin APIエラー' : ' — Wandbox APIエラー'));
      throw new Error(_errMsg);
    }

    const data = await res.json();
    outputArea.classList.remove("hidden");

    if (data.compiler_error) {
      outputText.textContent = "コンパイルエラー:\n" + data.compiler_error;
      outputText.className = "output-error";
    } else if (data.program_error && !data.program_output) {
      outputText.textContent = "実行時エラー:\n" + data.program_error;
      outputText.className = "output-error";
    } else {
      const output = (data.program_output || "") + (data.program_error ? "\n[stderr]\n" + data.program_error : "");
      outputText.textContent = output || "(出力なし)";
      outputText.className = "output-success";

      // 出力がある＆まだクリアしていない → 自動判定
      if (data.program_output && currentProblemId && !isLearned(currentProblemId)) {
        startAutoJudge(currentProblemId, data.program_output);
      } else if (isLearned(currentProblemId)) {
        if (judgeArea) {
          judgeArea.innerHTML = '<div class="judge-pass">✔ CLEARED</div>';
          judgeArea.classList.remove("hidden");
        }
      }
    }
  } catch (e) {
    outputArea.classList.remove("hidden");
    if (e.name === 'AbortError') {
      var _timeoutSec = currentLanguage === 'kotlin' ? '30秒' : '20秒';
      outputText.textContent = "⏱ タイムアウト（" + _timeoutSec + "）: 無限ループや長時間処理が含まれていないか確認してください。" + (currentLanguage === 'kotlin' ? "\n（Kotlinは初回コンパイルに時間がかかる場合があります）" : "");
    } else {
      outputText.textContent = "⚠ 実行エラー: Wandbox APIに接続できませんでした。\nインターネット接続を確認するか、しばらく待ってから再試行してください。\n詳細: " + e.message;
    }
    outputText.className = "output-error";
  }

  btn.textContent = "▶ 実行する";
  btn.disabled = false;
}

// 自動判定を開始する
async function startAutoJudge(problemId, output) {
  const p         = getProblems().find(function(x) { return x.id === problemId; });
  const judgeArea = document.getElementById("judge-area");
  if (!p || !judgeArea) return;

  // expected がある場合 → 即座に文字列比較
  if (p.expected !== undefined) {
    var passed = output.trim() === p.expected.trim();
    showJudgeResult(problemId, passed, false);
    return;
  }

  // AI 判定
  judgeArea.innerHTML = '<div class="judge-pending">🤖 判定中...</div>';
  judgeArea.classList.remove("hidden");

  try {
    var system = 'あなたはプログラミング問題の採点AIです。ユーザーの出力が問題の要件を満たしているか判断し、"PASS" か "FAIL" の1語だけ返してください。';
    var msg    = '問題: ' + p.question + '\n正解コード:\n' + p.answer + '\nユーザーの実行出力:\n' + output;
    var reply  = await askAI(system, msg);
    var passed = reply.trim().toUpperCase().startsWith('PASS');
    showJudgeResult(problemId, passed, true);
  } catch(e) {
    judgeArea.innerHTML = '<div class="judge-error">判定エラー ／ <button class="manual-clear-link" onclick="toggleLearned(' + problemId + ')">手動でクリア</button></div>';
  }
}

// 判定結果を表示し、正解ならクリア処理
function showJudgeResult(problemId, passed, byAI) {
  // ページ遷移済みなら何もしない
  if (document.getElementById("judge-area") === null) return;

  if (passed) {
    if (!isLearned(problemId)) {
      // 進捗を保存
      saveProgress(problemId);
      // エフェクト・サウンド
      playClearSound();
      showClearEffect();
      // renderDetail で画面を完全リフレッシュ（ボタン・ラベルを確実に更新）
      renderDetail(problemId);
      updateProgressDisplay();
      renderList();
    }
    // judge-area はrenderDetailで再生成されるので再取得
    var ja = document.getElementById("judge-area");
    if (ja) {
      var label = byAI ? 'AI判定: 正解！' : '正解！';
      ja.innerHTML = '<div class="judge-pass">✓ ' + label + ' クリアしました！</div>';
      ja.classList.remove("hidden");
    }
  } else {
    var judgeArea = document.getElementById("judge-area");
    if (judgeArea) {
      judgeArea.innerHTML = '<div class="judge-fail">✗ まだ違います。出力を確認してもう一度試してみましょう。</div>';
      judgeArea.classList.remove("hidden");
    }
  }
}

// ===== AI 共通リクエスト =====

async function askAI(system, messages) {
  const msgArray = Array.isArray(messages)
    ? messages
    : [{ role: 'user', content: messages }];

  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: system, messages: msgArray })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.reply;
}

// ===== コードフィードバック =====

async function getAIFeedback(problemId) {
  const p = getProblems().find(function(x) { return x.id === problemId; });
  const code = aceEditor ? aceEditor.getValue().trim() : '';
  if (!code) { alert('コードを入力してください'); return; }

  const btn = document.querySelector('.ai-feedback-btn');
  const area = document.getElementById('ai-feedback-area');
  const text = document.getElementById('ai-feedback-text');

  btn.textContent = '🤖 AIが分析中...';
  btn.disabled = true;
  area.classList.add('hidden');

  const lang = getLangName();
  const system = 'あなたは' + lang + 'プログラミングの初心者向けの優しい家庭教師です。日本語で簡潔に答えてください。';
  const userMsg = '問題：' + p.question + '\n\n提出コード：\n```' + (currentLanguage||'cpp') + '\n' + code + '\n```\n\n良い点・改善点・アドバイスを初心者向けに教えてください。';

  try {
    const reply = await askAI(system, userMsg);
    area.classList.remove('hidden');
    text.innerHTML = reply
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  } catch (e) {
    area.classList.remove('hidden');
    text.textContent = 'エラー: AIに接続できませんでした。';
  }

  btn.textContent = '🤖 AIにフィードバックをもらう';
  btn.disabled = false;
}

// ===== チャットパネル =====

var chatHistory = [];

function addChatMessage(role, text, id) {
  var messages = document.getElementById('chat-messages');
  var el = document.createElement('div');
  el.className = 'chat-msg chat-msg-' + role;
  if (id) el.id = id;
  el.innerHTML = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

async function sendChatMessage() {
  var input = document.getElementById('chat-input');
  var message = input.value.trim();
  if (!message) return;

  addChatMessage('user', message);
  chatHistory.push({ role: 'user', content: message });
  input.value = '';

  var typingId = 'typing-' + Date.now();
  addChatMessage('ai', '...', typingId);

  var system = 'あなたは' + getLangName() + 'プログラミングの初心者向けの優しい家庭教師です。日本語で答えてください。初心者が理解しやすい言葉で説明してください。';

  try {
    var reply = await askAI(system, chatHistory);
    chatHistory.push({ role: 'assistant', content: reply });
    var typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    addChatMessage('ai', reply);
  } catch (e) {
    var typingEl2 = document.getElementById(typingId);
    if (typingEl2) typingEl2.remove();
    addChatMessage('ai', 'エラー: AIに接続できませんでした。');
  }
}

// ===== タブ切り替え =====

function switchTab(tab) {
  playNavTab();
  setActiveTab(tab);
  if (tab === 'problems') {
    history.pushState({ page: 'list', lang: currentLanguage, tab: 'problems' }, '');
    renderList();
    showPage('list');
  } else if (tab === 'missions') {
    history.pushState({ page: 'mission-list', lang: currentLanguage, tab: 'missions' }, '');
    renderMissionList();
    showPage('mission-list');
  } else {
    history.pushState({ page: 'guide', lang: currentLanguage, tab: 'guide' }, '');
    renderGuide();
    showPage('guide');
  }
}

// ===== ガイドページの描画 =====

function renderGuide() {
  const content = document.getElementById('guide-content');
  content.innerHTML = '';

  // ヘッダー
  var header = document.createElement('div');
  header.className = 'guide-header';
  header.innerHTML =
    '<div class="guide-title">◆ GUIDE</div>' +
    '<div class="guide-sub">単元の説明・重要ポイント・用語集をまとめています。</div>';
  content.appendChild(header);

  getUnitGuides().forEach(function(unit) {
    var section = document.createElement('div');
    section.className = 'guide-unit';
    section.id = 'guide-' + unit.id;

    var pointsHtml = unit.points.map(function(p) {
      return '<li>' + p + '</li>';
    }).join('');

    var wordsHtml = unit.words.map(function(w) {
      return '<div class="vocab-card">' +
        '<span class="vocab-term">' + w.term + '</span>' +
        '<p class="vocab-desc">' + w.desc + '</p>' +
      '</div>';
    }).join('');

    section.innerHTML =
      '<div class="guide-unit-header" onclick="toggleGuideUnit(\'' + unit.id + '\')">' +
        '<span class="guide-unit-name">' + unit.name + '</span>' +
        '<span class="guide-toggle-icon" id="icon-' + unit.id + '">▶</span>' +
      '</div>' +
      '<div class="guide-unit-body hidden" id="body-' + unit.id + '">' +
        '<div class="guide-summary">' +
          '<p>' + unit.summary + '</p>' +
        '</div>' +
        '<div class="guide-section">' +
          '<div class="guide-section-title">◆ 重要ポイント</div>' +
          '<ul class="guide-points">' + pointsHtml + '</ul>' +
        '</div>' +
        '<div class="guide-section">' +
          '<div class="guide-section-title">◆ 用語集</div>' +
          '<div class="vocab-grid">' + wordsHtml + '</div>' +
        '</div>' +
      '</div>';

    content.appendChild(section);
  });
}

function toggleGuideUnit(id) {
  var body = document.getElementById('body-' + id);
  var icon = document.getElementById('icon-' + id);
  body.classList.toggle('hidden');
  icon.textContent = body.classList.contains('hidden') ? '▶' : '▼';
}

// ===== ミッション一覧の描画 =====

function _getLocalMissionProgress() {
  var data = localStorage.getItem(getMissionProgressKey());
  return data ? JSON.parse(data) : [];
}

function loadMissionProgress() {
  if (_missionProgressCache !== null) return _missionProgressCache.slice();
  return _getLocalMissionProgress();
}

function saveMissionProgress(id) {
  var progress = loadMissionProgress();
  if (progress.includes(id)) return;
  progress.push(id);
  _missionProgressCache = progress;
  localStorage.setItem(getMissionProgressKey(), JSON.stringify(progress));
  if (currentUser && _supabase) {
    _supabase.from('mission_progress').upsert({
      user_id: currentUser.id,
      language: currentLanguage || 'cpp',
      mission_id: id
    }).then(function() {}).catch(function() {});
  }
  checkLevelUp(); // EXP・レベルアップ判定
}

function removeMissionProgress(id) {
  var progress = loadMissionProgress().filter(function(x) { return x !== id; });
  _missionProgressCache = progress;
  localStorage.setItem(getMissionProgressKey(), JSON.stringify(progress));
  if (currentUser && _supabase) {
    _supabase.from('mission_progress')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('language', currentLanguage || 'cpp')
      .eq('mission_id', id)
      .then(function() {}).catch(function() {});
  }
}

function isMissionCleared(id) {
  return loadMissionProgress().includes(id);
}

async function syncMissionProgressFromSupabase() {
  if (!currentUser || !_supabase || !currentLanguage) return;
  var lang = currentLanguage;
  try {
    var result = await _supabase
      .from('mission_progress')
      .select('mission_id')
      .eq('user_id', currentUser.id)
      .eq('language', lang);
    if (result.error) return;
    var remoteIds = (result.data || []).map(function(r) { return r.mission_id; });
    var localIds  = _getLocalMissionProgress();
    var merged = remoteIds.slice();
    localIds.forEach(function(id) { if (!merged.includes(id)) merged.push(id); });
    _missionProgressCache = merged;
    localStorage.setItem(getMissionProgressKey(), JSON.stringify(merged));
    var toUpload = localIds.filter(function(id) { return !remoteIds.includes(id); });
    if (toUpload.length > 0) {
      var rows = toUpload.map(function(id) {
        return { user_id: currentUser.id, language: lang, mission_id: id };
      });
      await _supabase.from('mission_progress').upsert(rows);
    }
  } catch(e) {}
}

function renderMissionList() {
  const list = document.getElementById('mission-list');
  list.innerHTML = '';

  // ヘッダー
  const header = document.createElement('div');
  header.className = 'mission-list-header';
  const cleared = loadMissionProgress().length;
  header.innerHTML =
    '<div class="mission-list-title">◆ MISSIONS</div>' +
    '<div class="mission-list-sub">実践的なプログラムを自分で設計・実装するミッションです。</div>' +
    '<div class="mission-progress-text">' + cleared + ' / ' + getMissions().length + ' MISSIONS CLEARED</div>';
  list.appendChild(header);

  // 無料ユーザー向け広告スロット（ミッション一覧上部）
  if (!currentUserIsPremium) {
    var mAdTop = document.createElement('div');
    mAdTop.className = 'ad-slot ad-banner';
    mAdTop.innerHTML =
      '<div class="ad-placeholder-inner">' +
        '<span class="ad-label">PR</span>' +
        '<span class="ad-text">Google AdSenseコードをここに貼り付けます</span>' +
      '</div>';
    list.appendChild(mAdTop);
  }

  getMissions().forEach(function(m) {
    const cleared = isMissionCleared(m.id);
    const isLocked = isPremiumRequired(m.rank) && !currentUserIsPremium;
    const card = document.createElement('div');
    card.className = 'mission-card' + (cleared ? ' cleared' : '') + (isLocked ? ' premium-locked-card' : '');

    card.innerHTML =
      '<div class="mission-card-top">' +
        '<span class="mission-number">MISSION ' + String(m.id).padStart(2, '0') + '</span>' +
        '<span class="rank-badge rank-' + m.rank.toLowerCase() + '">' + m.rank + '</span>' +
        (isLocked ? '<span class="premium-lock-icon">🔒</span>' : '') +
      '</div>' +
      '<div class="mission-card-title">' + m.title + '</div>' +
      '<div class="mission-card-desc">' + m.description.substring(0, 60) + '...</div>' +
      '<div class="mission-card-bottom">' +
        '<span class="mission-req-count">要件 ' + m.requirements.length + ' 項目</span>' +
        (isLocked
          ? '<span class="mission-badge premium-mission-badge">◆ PLUS限定</span>'
          : '<span class="mission-badge ' + (cleared ? '' : 'not-cleared') + '">' +
              (cleared ? '✔ CLEARED' : '— PENDING') +
            '</span>'
        ) +
      '</div>';

    if (isLocked) {
      card.addEventListener('click', function() { openPremiumModal(); });
    } else {
      card.addEventListener('click', function() {
        playItemSelect();
        history.pushState({ page: 'mission-detail', lang: currentLanguage, id: m.id }, '');
        renderMissionDetail(m.id);
        showPage('mission-detail');
      });
    }

    list.appendChild(card);
  });
}

// ===== ミッション詳細の描画 =====

function renderMissionDetail(id) {
  const m = getMissions().find(function(x) { return x.id === id; });
  const cleared = isMissionCleared(m.id);
  const detail = document.getElementById('mission-detail-content');

  // 既存エディタのコードを保存してから破棄
  var savedCode = aceEditor ? aceEditor.getValue() : null;
  if (aceEditor) { aceEditor.destroy(); aceEditor = null; }

  const reqItems = m.requirements.map(function(r, i) {
    return '<li>◆ ' + r + '</li>';
  }).join('');

  detail.innerHTML =
    '<div class="mission-number-large">MISSION ' + String(m.id).padStart(2, '0') + '</div>' +
    '<h2>' + m.title + '</h2>' +
    '<span class="rank-badge rank-' + m.rank.toLowerCase() + ' rank-badge-lg" style="display:inline-block;margin-bottom:20px;">' + m.rank + '</span>' +

    '<div class="section">' +
      '<h3>ミッション概要</h3>' +
      '<p>' + m.description + '</p>' +
    '</div>' +

    '<div class="section">' +
      '<h3>要件</h3>' +
      '<ul class="mission-requirements">' + reqItems + '</ul>' +
    '</div>' +

    (m.sampleIO ?
      '<div class="section">' +
        '<h3>入出力例</h3>' +
        '<pre><code>' + escapeHtml(m.sampleIO) + '</code></pre>' +
      '</div>' : '') +

    '<div class="section">' +
      '<button class="toggle-btn" onclick="toggleSection(\'mission-hint-' + m.id + '\')">💡 ヒントを見る</button>' +
      '<div id="mission-hint-' + m.id + '" class="hidden toggle-content">' +
        '<p>' + m.hint + '</p>' +
      '</div>' +
    '</div>' +

    (m.answer ?
      '<div class="section">' +
        '<button class="toggle-btn" onclick="toggleSection(\'mission-answer-' + m.id + '\')">📋 解答例を見る</button>' +
        '<div id="mission-answer-' + m.id + '" class="hidden toggle-content">' +
          '<pre><code>' + escapeHtml(m.answer) + '</code></pre>' +
        '</div>' +
      '</div>' : '') +

    '<div class="section">' +
      '<div class="editor-mode-bar">' +
        '<button id="mode-zero"    class="mode-btn"        onclick="editorZero()">⬜ ゼロから</button>' +
        '<button id="mode-scratch" class="mode-btn active" onclick="editorScratch()">📋 テンプレート</button>' +
        '<button id="mode-fill"   class="mode-btn"        onclick="editorFill()">📝 穴埋め</button>' +
        '<button class="mode-btn basicform-btn"            onclick="showBasicForm()">📖 基本形</button>' +
      '</div>' +
      '<div id="code-editor" class="code-editor-ace"></div>' +
      '<div class="editor-options">' +
        '<label class="stdin-label">標準入力（cin用）：</label>' +
        '<input id="stdin-input" class="stdin-input" type="text" placeholder="スペース区切りで入力">' +
      '</div>' +
      '<button class="run-btn" onclick="runCode()">▶ 実行する</button>' +
      '<div id="output-area" class="hidden">' +
        '<p class="output-label">実行結果：</p>' +
        '<pre id="output-text"></pre>' +
      '</div>' +
      '<button class="ai-feedback-btn" onclick="getMissionAIFeedback(' + m.id + ')">🤖 AIにコードレビューしてもらう</button>' +
      '<div id="ai-feedback-area" class="hidden">' +
        '<p class="output-label">// AI REVIEW</p>' +
        '<div id="ai-feedback-text" class="ai-feedback-text"></div>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      '<button ' +
        'id="mission-clear-btn" ' +
        'class="learn-btn master-btn ' + (cleared ? 'learned' : '') + '" ' +
        'onclick="toggleMissionCleared(' + m.id + ')" ' +
      '>' +
        (cleared ? '✔ MISSION CLEARED  ／  クリックで取り消す' : 'MISSION COMPLETE') +
      '</button>' +
    '</div>';

  // Ace Editor を初期化
  initAceEditor(savedCode !== null ? savedCode : getStarterCode());
}

// ===== ミッションAIレビュー =====

async function getMissionAIFeedback(missionId) {
  const m = getMissions().find(function(x) { return x.id === missionId; });
  const code = aceEditor ? aceEditor.getValue().trim() : '';
  if (!code) { alert('コードを入力してください'); return; }

  const btn = document.querySelector('.ai-feedback-btn');
  const area = document.getElementById('ai-feedback-area');
  const text = document.getElementById('ai-feedback-text');

  btn.textContent = '🤖 AIがレビュー中...';
  btn.disabled = true;
  area.classList.add('hidden');

  const system = 'あなたは' + getLangName() + 'プログラミングの初心者向けの優しい先輩エンジニアです。日本語で丁寧にコードレビューしてください。';
  const reqText = m.requirements.map(function(r, i) { return (i+1) + '. ' + r; }).join('\n');
  const userMsg =
    'ミッション: ' + m.title + '\n\n' +
    '要件:\n' + reqText + '\n\n' +
    '提出コード:\n```' + (currentLanguage||'cpp') + '\n' + code + '\n```\n\n' +
    '要件を満たしているか確認し、良い点・改善点・アドバイスを教えてください。';

  try {
    const reply = await askAI(system, userMsg);
    area.classList.remove('hidden');
    text.innerHTML = reply
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  } catch (e) {
    area.classList.remove('hidden');
    text.textContent = 'エラー: AIに接続できませんでした。';
  }

  btn.textContent = '🤖 AIにコードレビューしてもらう';
  btn.disabled = false;
}

// ===== ミッションクリア =====

function toggleMissionCleared(id) {
  if (isMissionCleared(id)) {
    removeMissionProgress(id);
  } else {
    saveMissionProgress(id);
    playMissionClearSound();
    showMissionClearEffect();
  }
  renderMissionDetail(id);
  renderMissionList();
}

// ===== 学習済みのトグル（マーク ↔ 取り消し） =====

function toggleLearned(id) {
  if (isLearned(id)) {
    removeProgress(id);
  } else {
    saveProgress(id);
    playClearSound();
    showClearEffect();
  }
  renderDetail(id);
  updateProgressDisplay();
  renderList();
}

// ===== アクティビティヒートマップ =====

function buildHeatmapHTML() {
  var log   = JSON.parse(localStorage.getItem('study_log') || '{}');
  var today = new Date();
  today.setHours(12, 0, 0, 0);

  // 52週前の月曜日から開始
  var startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 7 * 52);
  var dow = startDate.getDay();
  startDate.setDate(startDate.getDate() - (dow === 0 ? 6 : dow - 1));

  // 週カラムを構築
  var weeks = [];
  var cur   = new Date(startDate);
  while (cur <= today) {
    var week = [];
    for (var d = 0; d < 7; d++) {
      if (cur <= today) {
        var ds   = cur.toISOString().slice(0, 10);
        var sec  = log[ds] || 0;
        var lv   = sec >= 3600 ? 4 : sec >= 1800 ? 3 : sec >= 900 ? 2 : sec >= 60 ? 1 : 0;
        var mins = sec > 0 ? Math.round(sec / 60) : 0;
        var tstr = mins >= 60
          ? Math.floor(mins / 60) + 'h' + (mins % 60 > 0 ? ' ' + (mins % 60) + 'm' : '')
          : mins > 0 ? mins + 'min' : '';
        week.push({ date: ds, lv: lv, title: ds + (tstr ? ': ' + tstr : '') });
      } else {
        week.push(null);
      }
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  // 月ラベル（月が変わる最初の週のインデックス）
  var MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var monthLbls = [];
  var lastMonth = -1;
  weeks.forEach(function(wk, wi) {
    if (wk[0]) {
      var m = parseInt(wk[0].date.slice(5, 7)) - 1;
      if (m !== lastMonth) { monthLbls.push({ wi: wi, label: MONTHS[m] }); lastMonth = m; }
    }
  });

  var DAY_LBLS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
  var STEP     = 13; // 11px + 2px gap
  var DAY_W    = 26; // day-label column width

  var html = '<div class="heatmap-outer">';

  // 月ラベル行
  html += '<div class="heatmap-months-row">';
  monthLbls.forEach(function(m) {
    var left = DAY_W + 4 + m.wi * STEP;
    html += '<span class="heatmap-month-lbl" style="left:' + left + 'px">' + m.label + '</span>';
  });
  html += '</div>';

  // 本体（曜日ラベル + 週グリッド）
  html += '<div class="heatmap-body">';

  // 曜日列
  html += '<div class="heatmap-day-col">';
  DAY_LBLS.forEach(function(lb) {
    html += '<div class="heatmap-day-lbl">' + lb + '</div>';
  });
  html += '</div>';

  // 週グリッド
  html += '<div class="heatmap-weeks">';
  weeks.forEach(function(wk) {
    html += '<div class="heatmap-week">';
    wk.forEach(function(day) {
      if (!day) {
        html += '<div class="heatmap-cell hm-empty"></div>';
      } else {
        html += '<div class="heatmap-cell hm-lv' + day.lv + '" title="' + day.title + '"></div>';
      }
    });
    html += '</div>';
  });
  html += '</div></div>'; // weeks + body

  // 凡例
  html += '<div class="heatmap-legend">';
  html += '<span class="hm-legend-lbl">少</span>';
  [0, 1, 2, 3, 4].forEach(function(lv) {
    html += '<div class="heatmap-cell hm-lv' + lv + '"></div>';
  });
  html += '<span class="hm-legend-lbl">多</span></div>';

  html += '</div>'; // outer
  return html;
}

// ===== プロフィールページ =====

function openProfile() {
  playUIClick();
  history.pushState({ page: 'profile', lang: currentLanguage }, '');
  showPage('profile');
  renderProfile(); // async（fire-and-forget OK）
}

async function renderProfile() {
  var content = document.getElementById('profile-content');
  // まずスケルトンを表示して即座にページを見せる
  content.innerHTML = '<div class="profile-loading">// LOADING...</div>';

  // ストリークを非同期で取得
  var streak = await getLoginStreak();

  var stats  = getProfileStats();
  stats.currentStreak = streak.current;
  stats.bestStreak    = streak.best;
  stats.totalDays     = streak.total;

  // EXP・レベル計算
  var expData    = calculateEXP();
  var totalExp   = expData.total;
  var level      = calcLevel(totalExp);
  var lvColor    = getLevelColor(level);
  var lvTitle    = getLevelTitle(level);
  var expCurrent = totalExp - totalExpForLevel(level);    // 現レベル内の進捗EXP
  var expNeed    = expToNextLevel(level);                 // 次レベルまで必要EXP
  var expPct     = Math.min(100, Math.round(expCurrent / expNeed * 100));

  var rank   = getProfileRank(stats.total);
  var earned = BADGES.filter(function(b) { return b.check(stats); });
  var locked = BADGES.filter(function(b) { return !b.check(stats); });

  var avatarLetter = currentUser ? currentUser.email.charAt(0).toUpperCase() : 'G';
  var displayName  = currentUser ? currentUser.email : 'GUEST';

  var tierColors = {
    bronze:   '#C47A2F',
    silver:   '#B8C8D8',
    gold:     '#EFC050',
    platinum: '#00C8B4',
    diamond:  '#5588FF',
    master:   '#C040FF',
    legend:   '#FF2244'
  };

  function badgeHTML(b, isEarned) {
    var col      = isEarned ? (tierColors[b.tier] || '#FF6B00') : '#2a2018';
    var hexBg    = isEarned ? col : '#161210';
    var nameCol  = isEarned ? col : '#3a3028';
    var descCol  = isEarned ? 'rgba(237,224,200,0.42)' : '#2a2018';
    var tierTxt  = isEarned ? 'rgba(7,6,4,0.85)' : '#2a2018';
    var isLegend = (b.tier === 'legend' && isEarned);
    return (
      '<div class="badge-card' + (isEarned ? ' badge-earned' : ' badge-locked') +
          (isLegend ? ' badge-legend' : '') + '"' +
          ' style="--badge-color:' + col + '" title="' + b.desc + '">' +
        '<div class="badge-hex" style="background:' + hexBg + '">' +
          '<span class="badge-tier-lbl" style="color:' + tierTxt + '">' + b.tier.toUpperCase() + '</span>' +
        '</div>' +
        '<div class="badge-name" style="color:' + nameCol + '">' + b.name + '</div>' +
        '<div class="badge-desc" style="color:' + descCol + '">' + b.desc + '</div>' +
      '</div>'
    );
  }

  var pct = {
    cpp:    Math.min(100, stats.cpp    / 31 * 100),
    python: Math.min(100, stats.python / 31 * 100),
    js:     Math.min(100, stats.js     / 31 * 100),
    ruby:   Math.min(100, stats.ruby   / 30 * 100),
    ts:     Math.min(100, stats.ts     / 30 * 100),
    kotlin: Math.min(100, stats.kotlin / 30 * 100),
    swift:  Math.min(100, stats.swift  / 30 * 100),
    java:   Math.min(100, stats.java   / 30 * 100),
    csharp: Math.min(100, stats.csharp / 30 * 100),
    go:     Math.min(100, stats.go     / 30 * 100),
    c:      Math.min(100, stats.c      / 30 * 100),
    rust:   Math.min(100, stats.rust   / 30 * 100)
  };

  // ストリーク状態の判定（今日ログイン済みかどうか）
  var todayStr = new Date().toISOString().slice(0, 10);
  var localDays = JSON.parse(localStorage.getItem('login_days') || '[]');
  var loggedInToday = localDays.indexOf(todayStr) !== -1;

  // ─── ジャーニー・アクティビティデータ ───
  var allLoginDays   = localDays.slice().sort();
  var firstLoginDate = allLoginDays.length > 0 ? allLoginDays[0] : null;
  var cppStartDate    = localStorage.getItem('cpp_started_at');
  var pyStartDate     = localStorage.getItem('python_started_at');
  var jsStartDate     = localStorage.getItem('javascript_started_at');
  var rubyStartDate   = localStorage.getItem('ruby_started_at');
  var tsStartDate     = localStorage.getItem('typescript_started_at');
  var kotlinStartDate = localStorage.getItem('kotlin_started_at');
  var swiftStartDate  = localStorage.getItem('swift_started_at');
  var javaStartDate   = localStorage.getItem('java_started_at');
  var csharpStartDate = localStorage.getItem('csharp_started_at');
  var goStartDate     = localStorage.getItem('go_started_at');
  var cStartDate      = localStorage.getItem('c_started_at');
  var rustStartDate   = localStorage.getItem('rust_started_at');
  var totalStudySec   = getTotalStudyTime();

  function _daysAgo(ds) {
    if (!ds) return '';
    var diff = Math.round((Date.parse(todayStr) - Date.parse(ds)) / 86400000);
    if (diff === 0) return '今日';
    return diff + '日前';
  }
  function _fmtDate(ds) {
    return ds ? ds.replace(/-/g, '/') : '—';
  }
  function _langStartItem(name, color, ds) {
    var dateStr = ds ? _fmtDate(ds) : '未開始';
    var ago     = ds ? '(' + _daysAgo(ds) + ')' : '';
    return (
      '<div class="lang-start-item">' +
        '<div class="lang-start-dot" style="background:' + color + '"></div>' +
        '<span class="lang-start-name">' + name + '</span>' +
        '<span class="lang-start-date">' + dateStr + '</span>' +
        (ago ? '<span class="lang-start-ago">' + ago + '</span>' : '') +
      '</div>'
    );
  }

  content.innerHTML =

    // ─── ヒーローセクション ───
    '<div class="profile-hero" style="--rank-color:' + rank.color + '">' +
      '<div class="profile-avatar" style="--rank-color:' + rank.color + '">' + avatarLetter + '</div>' +
      '<div class="profile-hero-info">' +
        '<div class="profile-email">' + displayName + '</div>' +
        (_premiumStatusCache ? '<div class="plus-badge-label">◆ CODE STEP PLUS</div>' : '') +
        (currentUserIsAdmin ? '<div class="admin-badge-label">⚙ ADMIN</div>' : '') +
        '<div class="profile-rank-badge" style="color:' + rank.color + ';border-color:' + rank.color + ';box-shadow:0 0 12px ' + rank.color + '33">' +
          '◆ ' + rank.name + ' ◆' +
        '</div>' +
        '<div class="profile-total">' + stats.total + '<span> / 363 CLEARED</span></div>' +
        '<div class="profile-mission-total">' + stats.totalMissions + ' / 72 MISSIONS</div>' +
      '</div>' +
    '</div>' +
    (currentUserIsAdmin
      ? '<button id="admin-panel-btn" class="admin-open-btn" onclick="openAdminPanel()">⚙ 管理者パネルを開く</button>'
      : '') +

    // ─── EXP・レベル ───
    '<div class="profile-section exp-section">' +
      '<div class="profile-section-title">// LEVEL & EXP</div>' +
      '<div class="level-display" style="--lv-color:' + lvColor + '">' +
        '<div class="level-hex">' +
          '<span class="level-lv-label">Lv.</span>' +
          '<span class="level-num-big">' + level + '</span>' +
        '</div>' +
        '<div class="level-right">' +
          '<div class="level-title-label" style="color:' + lvColor + '">' + lvTitle + '</div>' +
          '<div class="exp-bar-track">' +
            '<div class="exp-bar-fill" style="width:' + expPct + '%;background:' + lvColor + '"></div>' +
            '<div class="exp-bar-pct" style="color:' + lvColor + '">' + expPct + '%</div>' +
          '</div>' +
          '<div class="exp-numbers">' +
            expCurrent.toLocaleString() + ' <span class="exp-slash">/ </span>' +
            expNeed.toLocaleString() + ' EXP  →  <span style="color:' + lvColor + '">Lv.' + (level + 1) + '</span>' +
          '</div>' +
          '<div class="exp-total-row">Total: <b>' + totalExp.toLocaleString() + ' EXP</b></div>' +
          '<div class="exp-breakdown">' +
            '<span class="exp-src">📘 問題 +' + expData.problem.toLocaleString() + '</span>' +
            '<span class="exp-src">🎯 ミッション +' + expData.mission.toLocaleString() + '</span>' +
            '<span class="exp-src">📅 ログイン +' + expData.login.toLocaleString() + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // ─── アクティビティ ───
    '<div class="profile-section">' +
      '<div class="profile-section-title">// ACTIVITY</div>' +
      '<div class="activity-top-row">' +
        '<div class="act-stat-card">' +
          '<div class="act-stat-label">総学習時間</div>' +
          '<div class="act-stat-value">' + (totalStudySec >= 60 ? formatStudyTime(totalStudySec) : totalStudySec > 0 ? totalStudySec + 's' : '—') + '</div>' +
        '</div>' +
        '<div class="act-stat-card">' +
          '<div class="act-stat-label">学習開始日</div>' +
          '<div class="act-stat-value">' + _fmtDate(firstLoginDate) + '</div>' +
          (firstLoginDate ? '<div class="act-stat-sub">' + _daysAgo(firstLoginDate) + '</div>' : '') +
        '</div>' +
      '</div>' +
      buildHeatmapHTML() +
      '<div class="lang-start-list">' +
        _langStartItem('C++',        '#00599C', cppStartDate) +
        _langStartItem('Python',     '#3776AB', pyStartDate) +
        _langStartItem('JavaScript', '#F0C040', jsStartDate) +
        _langStartItem('Ruby',       '#CC342D', rubyStartDate) +
        _langStartItem('TypeScript', '#3178C6', tsStartDate) +
        _langStartItem('Kotlin',     '#7F52FF', kotlinStartDate) +
        _langStartItem('Swift',      '#FA7343', swiftStartDate) +
        _langStartItem('Java',       '#ED8B00', javaStartDate) +
        _langStartItem('C#',         '#9B4F96', csharpStartDate) +
        _langStartItem('Go',         '#00ADD8', goStartDate) +
        _langStartItem('C',          '#A8B9CC', cStartDate) +
        _langStartItem('Rust',       '#CE412B', rustStartDate) +
      '</div>' +
    '</div>' +

    // ─── ログインストリーク ───
    '<div class="profile-section">' +
      '<div class="profile-section-title">// LOGIN STREAK</div>' +
      '<div class="streak-grid">' +
        '<div class="streak-card streak-current' + (loggedInToday ? ' streak-active' : '') + '">' +
          '<div class="streak-icon">' + (loggedInToday ? '🔥' : '💤') + '</div>' +
          '<div class="streak-num">' + streak.current + '</div>' +
          '<div class="streak-label">CURRENT STREAK</div>' +
          '<div class="streak-sub">' + (loggedInToday ? '今日ログイン済み ✓' : '今日まだログインしていません') + '</div>' +
        '</div>' +
        '<div class="streak-card">' +
          '<div class="streak-icon">🏆</div>' +
          '<div class="streak-num">' + streak.best + '</div>' +
          '<div class="streak-label">BEST STREAK</div>' +
          '<div class="streak-sub">最長連続記録（日）</div>' +
        '</div>' +
        '<div class="streak-card">' +
          '<div class="streak-icon">📅</div>' +
          '<div class="streak-num">' + streak.total + '</div>' +
          '<div class="streak-label">TOTAL DAYS</div>' +
          '<div class="streak-sub">累計ログイン日数</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // ─── 言語スタッツ ───
    '<div class="profile-section">' +
      '<div class="profile-section-title">// LANGUAGE STATS</div>' +
      '<div class="profile-stats-grid">' +
        _statCardHTML('C++',        '#00599C', stats.cpp,    pct.cpp,    stats.cppM,    31) +
        _statCardHTML('Python',     '#3776AB', stats.python, pct.python, stats.pyM,     31) +
        _statCardHTML('JavaScript', '#F0C040', stats.js,     pct.js,     stats.jsM,     31) +
        _statCardHTML('Ruby',       '#CC342D', stats.ruby,   pct.ruby,   stats.rubyM,   30) +
        _statCardHTML('TypeScript', '#3178C6', stats.ts,     pct.ts,     stats.tsM,     30) +
        _statCardHTML('Kotlin',     '#7F52FF', stats.kotlin, pct.kotlin, stats.kotlinM, 30) +
        _statCardHTML('Swift',      '#FA7343', stats.swift,  pct.swift,  stats.swiftM,  30) +
        _statCardHTML('Java',       '#ED8B00', stats.java,   pct.java,   stats.javaM,   30) +
        _statCardHTML('C#',         '#9B4F96', stats.csharp, pct.csharp, stats.csharpM, 30) +
        _statCardHTML('Go',         '#00ADD8', stats.go,     pct.go,     stats.goM,     30) +
        _statCardHTML('C',          '#A8B9CC', stats.c,      pct.c,      stats.cM,      30) +
        _statCardHTML('Rust',       '#CE412B', stats.rust,   pct.rust,   stats.rustM,   30) +
      '</div>' +
    '</div>' +

    // ─── バッジ ───
    '<div class="profile-section">' +
      '<div class="profile-section-title">// BADGES ' +
        '<span class="badge-count-tag">' + earned.length + ' / ' + BADGES.length + ' 解除</span>' +
      '</div>' +
      '<div class="badge-grid">' +
        earned.map(function(b) { return badgeHTML(b, true);  }).join('') +
        locked.map(function(b) { return badgeHTML(b, false); }).join('') +
      '</div>' +
    '</div>';
}

function _statCardHTML(lang, color, count, pct, missions, max) {
  var maxProblems = max || 30;
  return (
    '<div class="profile-stat-card">' +
      '<div class="stat-lang" style="color:' + color + '">' + lang + '</div>' +
      '<div class="stat-num">' + count + '<span class="stat-denom"> / ' + maxProblems + '</span></div>' +
      '<div class="stat-bar-wrap">' +
        '<div class="stat-bar" style="width:' + pct + '%;background:' + color + '"></div>' +
      '</div>' +
      '<div class="stat-mission">' + missions + ' / 6 ミッション</div>' +
    '</div>'
  );
}

// ===== 認証モーダル UI =====

// Supabase エラーメッセージを日本語に変換
function translateAuthError(msg) {
  if (!msg) return '不明なエラーが発生しました';
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials'))
    return 'メールアドレスまたはパスワードが正しくありません';
  if (msg.includes('Email not confirmed'))
    return 'メールアドレスの確認が完了していません。届いた確認メールのリンクをクリックしてください。';
  if (msg.includes('User already registered') || msg.includes('already been registered'))
    return 'このメールアドレスは既に登録されています。ログインタブからお試しください。';
  if (msg.includes('Password should be at least'))
    return 'パスワードは6文字以上で入力してください';
  if (msg.includes('Unable to validate email') || msg.includes('invalid email'))
    return '有効なメールアドレスを入力してください';
  if (msg.includes('Email rate limit') || msg.includes('over_email_send_rate_limit'))
    return 'メール送信の上限に達しました。しばらく待ってから再試行してください';
  if (msg.includes('signup disabled'))
    return '現在アカウント登録は受け付けていません';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'ネットワークエラー。インターネット接続を確認してください';
  return msg; // 翻訳なし → そのまま表示
}

// 確認待ちメールアドレスを保持（再送用）
var _pendingConfirmEmail = null;

function openAuthModal() {
  playUIClick();
  document.getElementById('auth-modal').classList.remove('hidden');
  setTimeout(function() { document.getElementById('auth-email').focus(); }, 50);
}

function closeAuthModal() {
  playGoBack();
  document.getElementById('auth-modal').classList.add('hidden');
  document.getElementById('auth-error').classList.add('hidden');
  document.getElementById('auth-success').classList.add('hidden');
  document.getElementById('auth-email').value = '';
  document.getElementById('auth-password').value = '';
  var fpBtn = document.getElementById('forgot-pw-btn');
  if (fpBtn) { fpBtn.disabled = false; fpBtn.textContent = 'パスワードを忘れた方'; }
  _pendingConfirmEmail = null;
}

function switchAuthTab(tab) {
  _currentAuthTab = tab;
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('auth-submit-btn').textContent = tab === 'login' ? 'LOGIN' : 'SIGN UP';
  document.getElementById('auth-error').classList.add('hidden');
  document.getElementById('auth-success').classList.add('hidden');
}

async function submitAuth() {
  var email  = document.getElementById('auth-email').value.trim();
  var pass   = document.getElementById('auth-password').value;
  var errEl  = document.getElementById('auth-error');
  var sucEl  = document.getElementById('auth-success');
  var btn    = document.getElementById('auth-submit-btn');

  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  if (!email || !pass) {
    errEl.textContent = 'メールアドレスとパスワードを入力してください';
    errEl.classList.remove('hidden');
    return;
  }
  if (!_supabase) {
    errEl.textContent = 'Supabase が未設定です（SUPABASE_URL / SUPABASE_ANON_KEY を設定してください）';
    errEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.textContent = '...';

  var result;
  if (_currentAuthTab === 'login') {
    result = await _supabase.auth.signInWithPassword({ email: email, password: pass });
  } else {
    result = await _supabase.auth.signUp({ email: email, password: pass });
  }

  btn.disabled = false;
  btn.textContent = _currentAuthTab === 'login' ? 'LOGIN' : 'SIGN UP';

  if (result.error) {
    errEl.textContent = translateAuthError(result.error.message);
    errEl.classList.remove('hidden');
    return;
  }

  // サインアップ後にメール確認が必要な場合
  if (_currentAuthTab === 'signup' && result.data && result.data.user && !result.data.session) {
    _pendingConfirmEmail = email;
    sucEl.innerHTML =
      '確認メールを送信しました。受信ボックスをご確認ください。<br>' +
      '<button class="auth-text-link" style="margin-top:6px;display:inline-block" ' +
        'onclick="resendConfirmEmail()">メールが届かない場合は再送する</button>';
    sucEl.classList.remove('hidden');
    return;
  }

  closeAuthModal();
}

// 確認メール再送
async function resendConfirmEmail() {
  if (!_pendingConfirmEmail || !_supabase) return;
  var sucEl = document.getElementById('auth-success');
  var errEl = document.getElementById('auth-error');
  errEl.classList.add('hidden');

  try {
    var result = await _supabase.auth.resend({ type: 'signup', email: _pendingConfirmEmail });
    if (result.error) throw result.error;
    sucEl.innerHTML = '確認メールを再送しました ✓<br>' +
      '<span style="font-size:0.65rem;color:rgba(160,144,112,0.55)">迷惑メールフォルダも確認してください</span>';
  } catch(e) {
    errEl.textContent = translateAuthError(e.message || '再送に失敗しました');
    errEl.classList.remove('hidden');
  }
}

async function authSignOut() {
  if (!_supabase) return;
  await _supabase.auth.signOut();
  currentUser = null;
  _progressCache = null;
  _missionProgressCache = null;
  updateAuthUI();
  updateProgressDisplay();
  if (currentLanguage) { renderList(); renderMissionList(); }
}

function updateAuthUI() {
  var btn     = document.getElementById('auth-btn');
  var info    = document.getElementById('user-info');
  var emailEl = document.getElementById('user-email-display');
  if (currentUser) {
    btn.classList.add('hidden');
    info.classList.remove('hidden');
    emailEl.textContent = currentUser.email;
  } else {
    btn.classList.remove('hidden');
    info.classList.add('hidden');
  }
}

async function initAuth() {
  if (!_supabase) return;

  // 認証状態の変化を監視（ログイン/ログアウト時に自動発火）
  _supabase.auth.onAuthStateChange(async function(event, session) {
    currentUser = session ? session.user : null;
    _progressCache = null;
    _missionProgressCache = null;
    updateAuthUI();
    if (currentUser) {
      recordLoginDay(); // ログイン日を記録
      fetchUserProfile(); // プレミアム状態を取得
    } else {
      currentUserIsPremium = false;
      updateAdDisplay();
    }
    if (currentUser && currentLanguage) {
      await syncProgressFromSupabase();
      await syncMissionProgressFromSupabase();
      updateProgressDisplay();
      renderList();
    } else if (!currentUser && currentLanguage) {
      updateProgressDisplay();
      renderList();
    }
  });

  // ページロード時の既存セッション取得
  var sessionResult = await _supabase.auth.getSession();
  if (sessionResult.data && sessionResult.data.session) {
    currentUser = sessionResult.data.session.user;
    recordLoginDay(); // ページロード時にも記録
    fetchUserProfile(); // プレミアム状態を取得
    updateAuthUI();
    if (currentLanguage) {
      await syncProgressFromSupabase();
      await syncMissionProgressFromSupabase();
      updateProgressDisplay();
      renderList();
    }
  }

  // Stripe 決済完了リダイレクト処理
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('premium') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    if (currentUser) {
      setTimeout(function() {
        fetchUserProfile();
        var msg = document.createElement('div');
        msg.className = 'premium-success-toast';
        msg.textContent = '🎉 CODE STEP PLUS へようこそ！全コンテンツが解放されました';
        document.body.appendChild(msg);
        setTimeout(function() { msg.remove(); }, 4000);
      }, 1500);
    }
  }
}

// ===== 初期化 =====

document.getElementById("back-btn").addEventListener("click", function() {
  playGoBack();
  history.back();
});

document.getElementById("mission-back-btn").addEventListener("click", function() {
  playGoBack();
  history.back();
});

document.getElementById("profile-back-btn").addEventListener("click", function() {
  playGoBack();
  history.back();
});

document.getElementById("site-title").addEventListener("click", function() {
  playGoBack();
  currentLanguage = null;
  if (!localStorage.getItem('app_started')) {
    history.pushState({ page: 'landing' }, '');
    showPage('landing');
  } else {
    history.pushState({ page: 'lang' }, '');
    renderLangSelect();
    showPage('lang');
  }
});

document.getElementById('chat-toggle').addEventListener('click', function() {
  document.getElementById('chat-panel').classList.toggle('hidden');
});

document.getElementById('chat-close').addEventListener('click', function() {
  document.getElementById('chat-panel').classList.add('hidden');
});

document.getElementById('chat-send').addEventListener('click', sendChatMessage);

document.getElementById('chat-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

renderLangSelect();
if (!localStorage.getItem('app_started')) {
  // 初回訪問 → ランディングページを表示
  history.replaceState({ page: 'landing' }, '');
  showPage('landing');
} else {
  // 再訪問 → 言語選択へ
  history.replaceState({ page: 'lang' }, '');
  showPage('lang');
}

// ゲスト時もローカルにログイン日を記録
recordLoginDay();

// ヘッダーの Lv バッジを初期化（データ配列定義後なので安全）
setTimeout(updateLevelBadge, 0);

// タブ切替・ページ離脱時に学習タイマーを保存
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    stopStudyTimer();
  } else {
    // タブに戻ったとき、問題/ミッション詳細ページなら再計測開始
    var onDetail  = !document.getElementById('page-detail').classList.contains('hidden');
    var onMission = !document.getElementById('page-mission-detail').classList.contains('hidden');
    if (onDetail || onMission) startStudyTimer();
  }
});
window.addEventListener('beforeunload', stopStudyTimer);

// サウンドボタン初期状態
(function() {
  var btn = document.getElementById('sound-btn');
  btn.textContent = _soundEnabled ? '🔊' : '🔇';
  btn.classList.toggle('muted', !_soundEnabled);
})();

// Supabase 認証を初期化（非同期）
initAuth();

// ===== 背景スライドショー =====
(function() {
  const BG_IMAGES = [
    // 1. 夜の都市ボケ（現在のメイン）
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80',
    // 2. 夜景・航空写真（シカゴ）
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=80',
    // 3. 夜の都市スカイライン
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80',
    // 4. 宇宙・星雲
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1920&q=80',
    // 5. ダーク・雨の夜
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1920&q=80',
    // 6. 未来的なネオン夜景
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1920&q=80',
  ];

  const layerA = document.getElementById('bg-a');
  const layerB = document.getElementById('bg-b');
  let idx = 0;
  let useA = true; // 現在表示中のレイヤー

  // 最初の1枚をセット（フェードなしで即表示）
  layerA.style.backgroundImage = "url('" + BG_IMAGES[0] + "')";
  layerA.style.opacity = '1';
  layerB.style.opacity = '0';

  function preload(url) {
    var img = new Image();
    img.src = url;
  }

  // 次の画像を先読み
  preload(BG_IMAGES[1]);

  function next() {
    idx = (idx + 1) % BG_IMAGES.length;
    var nextUrl = BG_IMAGES[idx];

    // 先読み（次の次）
    preload(BG_IMAGES[(idx + 1) % BG_IMAGES.length]);

    if (useA) {
      // A が前面 → B に次をセットして B をフェードイン、A をフェードアウト
      layerB.style.backgroundImage = "url('" + nextUrl + "')";
      layerB.style.zIndex = '-2';
      layerA.style.zIndex = '-3';
      layerB.style.opacity = '1';
      layerA.style.opacity = '0';
    } else {
      // B が前面 → A に次をセットして A をフェードイン、B をフェードアウト
      layerA.style.backgroundImage = "url('" + nextUrl + "')";
      layerA.style.zIndex = '-2';
      layerB.style.zIndex = '-3';
      layerA.style.opacity = '1';
      layerB.style.opacity = '0';
    }
    useA = !useA;
  }

  // 12秒ごとに切り替え
  setInterval(next, 12000);
})();
