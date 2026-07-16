// ===== PWA: Service Worker 登録 =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function() {});
  });
}

// ===== グローバルエラーハンドラー =====
(function() {
  var _errShown = false;
  function showErrorToast(msg) {
    if (_errShown) return;
    _errShown = true;
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a0a0a;border:1px solid rgba(255,50,50,0.5);color:#ff7777;font-family:"Share Tech Mono",monospace;font-size:0.75rem;padding:10px 18px;border-radius:10px;z-index:99999;max-width:340px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.7)';
    el.textContent = '⚠ エラーが発生しました。ページをリロードしてください。';
    document.body.appendChild(el);
    setTimeout(function() { _errShown = false; el.remove(); }, 8000);
  }
  window.onerror = function(msg, src, line, col, err) {
    // Ace Editor やサードパーティのエラーは無視
    if (src && (src.includes('ace.js') || src.includes('confetti') || src.includes('adsbygoogle'))) return false;
    console.error('[CODE STEP]', msg, src, line, col, err);
    showErrorToast();
    return false;
  };
  window.addEventListener('unhandledrejection', function(e) {
    if (!e.reason) return;
    var msg = e.reason && e.reason.message ? e.reason.message : String(e.reason);
    // ネットワーク系は無視（Supabase接続エラーは各関数でハンドリング済み）
    if (msg.includes('NetworkError') || msg.includes('Failed to fetch') || msg.includes('AbortError')) return;
    console.error('[CODE STEP] Unhandled rejection:', e.reason);
    showErrorToast();
  });
})();

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
  lsSet('soundEnabled', _soundEnabled);
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

// ===== コンボカウンター =====

var _comboCount = 0;

function _getComboColor(n) {
  if (n >= 7) return '#00E676';   // 緑（TITAN級）
  if (n >= 5) return '#C040FF';   // 紫（MASTER級）
  if (n >= 3) return '#FFD700';   // 金
  return '#FF6B00';               // オレンジ
}

function showComboEffect(n) {
  var el = document.createElement('div');
  el.className = 'combo-popup';
  el.style.color = _getComboColor(n);

  var label = n >= 7 ? '⚡ GODLIKE COMBO ×' + n :
              n >= 5 ? '🔥 ULTRA COMBO ×' + n :
              n >= 3 ? '✨ COMBO ×' + n :
                       'COMBO ×' + n;
  el.innerHTML = label + '<div class="combo-sub">連続クリア！</div>';
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 1600);

  // コンボ数が多いほど豪華なコンフェッティ
  if (window.confetti && n >= 3) {
    confetti({
      particleCount: Math.min(60 + n * 12, 130),
      spread: 65,
      origin: { x: 0.5, y: 0.45 },
      colors: [_getComboColor(n), '#FFD700', '#ffffff']
    });
  }
}

function showComboBreak(n) {
  var el = document.createElement('div');
  el.className = 'combo-popup combo-break';
  el.innerHTML = 'COMBO BREAK <span style="font-size:0.7em;opacity:0.7">×' + n + '</span>';
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 1200);
}

// ===== ビジュアルエフェクト =====

function showClearEffect(xp) {
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
  setTimeout(function() { el.classList.add('hidden'); }, 1650);
  // XPフローティングテキスト
  if (xp) {
    var xpEl = document.createElement('div');
    xpEl.className = 'xp-float-text';
    xpEl.textContent = '+' + xp + ' XP';
    document.body.appendChild(xpEl);
    setTimeout(function() { xpEl.remove(); }, 1200);
  }
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
var _realUserIsAdmin = false;     // 実際のSupabase is_admin値（管理者プレビュー用に保持）
var currentUserAgeGroup   = null;
var currentUserJobClass   = null;
var currentUserExperience = null;
var currentUserScoutOptIn = false;
var currentUserScoutMessages = [];
var editorDirty = false;
var _suppressDirty = false;
var PREMIUM_RANKS = ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'LEGEND', 'TITAN', 'OVERLORD'];
var HIGH_RANKS         = ['PLATINUM', 'DIAMOND', 'MASTER', 'LEGEND', 'TITAN', 'OVERLORD'];
var HIGH_RANKS_PREMIUM = ['MASTER', 'LEGEND', 'TITAN', 'OVERLORD'];

// ===== ブックマーク =====

function _bookmarkKey() { return (currentLanguage || 'cpp') + '_bookmarks'; }

function getBookmarks() {
  return lsGetJSON(_bookmarkKey(), []);
}
function isBookmarked(id) {
  return getBookmarks().indexOf(id) !== -1;
}
function toggleBookmark(id) {
  var list = getBookmarks();
  var idx = list.indexOf(id);
  if (idx === -1) { list.push(id); showToast('🔖 ブックマークに追加しました'); }
  else            { list.splice(idx, 1); showToast('ブックマークを解除しました'); }
  lsSet(_bookmarkKey(), JSON.stringify(list));
  renderList();
}
// 詳細ページからのブックマークトグル（リスト再描画なし・ボタン即時更新）
function toggleDetailBookmark(id) {
  var list = getBookmarks();
  var idx = list.indexOf(id);
  var bmed;
  if (idx === -1) { list.push(id); bmed = true;  showToast('🔖 ブックマークに追加しました'); }
  else            { list.splice(idx, 1); bmed = false; showToast('ブックマークを解除しました'); }
  lsSet(_bookmarkKey(), JSON.stringify(list));
  var btn = document.getElementById('detail-bm-btn');
  if (btn) {
    btn.textContent = bmed ? '🔖' : '☆';
    btn.classList.toggle('bookmarked', bmed);
    if (bmed) { btn.classList.add('bm-pop'); setTimeout(function() { btn.classList.remove('bm-pop'); }, 500); }
  }
}

// ===== 復習モード =====

function _wrongKey() { return (currentLanguage || 'cpp') + '_wrong'; }

function getWrongAnswers() {
  return lsGetJSON(_wrongKey(), []);
}
function isWrongAnswer(id) {
  return getWrongAnswers().indexOf(id) !== -1;
}
function trackWrongAnswer(id) {
  var list = getWrongAnswers();
  if (list.indexOf(id) === -1) {
    list.push(id);
    lsSet(_wrongKey(), JSON.stringify(list));
  }
}
function clearWrongAnswer(id) {
  var list = getWrongAnswers().filter(function(x) { return x !== id; });
  lsSet(_wrongKey(), JSON.stringify(list));
}

// ===== 問題一覧フィルター =====
var _filterQuery    = '';
var _filterRank     = '';
var _filterBookmark = false;
var _filterWrong    = false;
var _filterUnsolved = false;
var _careerFilter   = null; // { careerId, careerTitle, careerIcon, careerColor, ids: Set }

// ===== コード下書き自動保存 =====
var _draftSaveTimer  = null;
var _suppressDraftSave = false;

function _draftKey(id) {
  return 'draft_' + (currentLanguage || 'cpp') + '_' + id;
}
function _saveDraftThrottled() {
  if (_suppressDraftSave) return;
  clearTimeout(_draftSaveTimer);
  _draftSaveTimer = setTimeout(function() {
    if (aceEditor && currentProblemId) {
      lsSet(_draftKey(currentProblemId), aceEditor.getValue());
    }
  }, 1200);
}
function _loadDraft(id) { try { return localStorage.getItem(_draftKey(id)); } catch(e) { return null; } }
function _clearDraft(id) { try { localStorage.removeItem(_draftKey(id)); } catch(e) {} }

// ===== 学習時間 =====
var _problemStartTime = 0;

function _timeKey(id) { return 'time_' + (currentLanguage || 'cpp') + '_' + id; }
function _saveProblemTime(id) {
  if (!_problemStartTime || !id) return;
  var elapsed = Math.floor((Date.now() - _problemStartTime) / 1000);
  if (elapsed < 3) return;
  var prev = parseInt(localStorage.getItem(_timeKey(id)) || '0');
  lsSet(_timeKey(id), String(prev + elapsed));
  _problemStartTime = 0;
}
function _getProblemTime(id) { return parseInt(localStorage.getItem(_timeKey(id)) || '0'); }
function _formatTime(sec) {
  if (sec < 60) return sec + '秒';
  var m = Math.floor(sec / 60), s = sec % 60;
  return m + '分' + (s > 0 ? s + '秒' : '');
}

// ===== エディターフォントサイズ =====
var _editorFontSize = parseInt(localStorage.getItem('editor_font_size') || '14');
function editorFontLarger() {
  _editorFontSize = Math.min(_editorFontSize + 1, 22);
  lsSet('editor_font_size', String(_editorFontSize));
  if (aceEditor) aceEditor.setOption('fontSize', _editorFontSize + 'px');
  var d = document.getElementById('editor-font-size-display');
  if (d) d.textContent = _editorFontSize + 'px';
}
function editorFontSmaller() {
  _editorFontSize = Math.max(_editorFontSize - 1, 11);
  lsSet('editor_font_size', String(_editorFontSize));
  if (aceEditor) aceEditor.setOption('fontSize', _editorFontSize + 'px');
  var d = document.getElementById('editor-font-size-display');
  if (d) d.textContent = _editorFontSize + 'px';
}

// ===== ランダム問題 =====
function goToRandomProblem() {
  var all = getProblems();
  var pool = all.filter(function(p) { return !isLearned(p.id); });
  if (pool.length === 0) pool = all;
  var p = pool[Math.floor(Math.random() * pool.length)];
  if (!p) return;
  showToast('🎲 ランダム問題：' + p.title);
  setTimeout(function() {
    history.pushState({ page: 'detail', lang: currentLanguage, id: p.id }, '');
    renderDetail(p.id);
    showPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 400);
}

// ===== コードコピー =====
function copyEditorCode() {
  if (!aceEditor) return;
  var code = aceEditor.getValue();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(function() { showToast('📋 コードをコピーしました'); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('📋 コードをコピーしました');
  }
}

// ===== スクロールトップ =====
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
(function() {
  window.addEventListener('scroll', function() {
    var btn = document.getElementById('scroll-top-btn');
    if (btn) btn.classList.toggle('stt-visible', window.scrollY > 400);
  }, { passive: true });
})();

// ===== 問題メモ =====
function _noteKey(id) { return 'note_' + (currentLanguage || 'cpp') + '_' + id; }
function saveNote(id) {
  var ta = document.getElementById('problem-note-' + id);
  if (!ta) return;
  lsSet(_noteKey(id), ta.value);
  showToast('📝 メモを保存しました');
}
function getNote(id) { return localStorage.getItem(_noteKey(id)) || ''; }

// ===== 苦手問題カウント =====
function _wcKey(id) { return 'wc_' + (currentLanguage || 'cpp') + '_' + id; }
function _incWrongCount(id) {
  var n = parseInt(localStorage.getItem(_wcKey(id)) || '0') + 1;
  lsSet(_wcKey(id), String(n));
}
function getWrongCount(id) { return parseInt(localStorage.getItem(_wcKey(id)) || '0'); }
function isAutoWeak(id) { return getWrongCount(id) >= 3; }

// ===== ユニット全クリア演出 =====
function _checkUnitClear(id) {
  var p = getProblems().find(function(x) { return x.id === id; });
  if (!p) return;
  var unitProbs = getProblems().filter(function(x) { return x.unit === p.unit; });
  var cleared = unitProbs.filter(function(x) { return isLearned(x.id); }).length;
  if (cleared === unitProbs.length) {
    setTimeout(function() { _showUnitClearEffect(p.unit); }, 800);
  }
}
function _showUnitClearEffect(unitName) {
  var overlay = document.getElementById('unit-clear-overlay');
  var nameEl  = document.getElementById('uc-unit-name');
  if (!overlay || !nameEl) return;
  nameEl.textContent = unitName;
  overlay.classList.remove('hidden');
  if (window.confetti) {
    confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0,   y: 0.6 }, colors: ['#FF6B00','#FFD700','#ffffff'] });
    setTimeout(function() {
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1,   y: 0.6 }, colors: ['#FF6B00','#FFD700','#ffffff'] });
    }, 180);
  }
  overlay.addEventListener('click', function() { overlay.classList.add('hidden'); }, { once: true });
  setTimeout(function() { overlay.classList.add('hidden'); }, 3200);
}

// ===== 1日の目標問題数 =====
var _dailyGoal = parseInt(localStorage.getItem('daily_goal') || '3');
function _todayKey() { return new Date().toISOString().slice(0, 10); }
function getTodayCleared() { return parseInt(localStorage.getItem('dc_' + _todayKey()) || '0'); }
function _incDailyCleared() {
  var n = getTodayCleared() + 1;
  lsSet('dc_' + _todayKey(), String(n));
  _renderDailyGoalBar();
}
function setDailyGoal(n) {
  _dailyGoal = Math.max(1, Math.min(20, parseInt(n) || 3));
  lsSet('daily_goal', String(_dailyGoal));
  _renderDailyGoalBar();
}
function _editDailyGoal() {
  var n = parseInt(prompt('1日の目標問題数を入力（1〜20）', String(_dailyGoal)));
  if (!isNaN(n)) setDailyGoal(n);
}
function _renderDailyGoalBar() {
  var bar = document.getElementById('daily-goal-bar');
  var txt = document.getElementById('daily-goal-text');
  if (!bar || !txt) return;
  var done = getTodayCleared();
  var pct  = Math.min(100, Math.round(done / _dailyGoal * 100));
  bar.style.width = pct + '%';
  txt.textContent = done + ' / ' + _dailyGoal + '問';
  bar.parentElement.parentElement.classList.toggle('goal-done', done >= _dailyGoal);
}

// ===== 表示密度切り替え =====
var _listDensity = localStorage.getItem('list_density') || 'standard';
function toggleListDensity() {
  _listDensity = _listDensity === 'standard' ? 'compact' : 'standard';
  lsSet('list_density', _listDensity);
  _applyListDensity();
}
function _applyListDensity() {
  var el = document.getElementById('page-list');
  if (el) el.classList.toggle('density-compact', _listDensity === 'compact');
  var btn = document.getElementById('density-toggle-btn');
  if (btn) btn.textContent = _listDensity === 'compact' ? '☷ 標準' : '☰ コンパクト';
}

// ===== スピードチャレンジ =====
var _speedMode    = false;
var _speedSec     = 0;
var _speedTimer   = null;
var _speedLimit   = 300;
function toggleSpeedMode() {
  _speedMode = !_speedMode;
  if (_speedMode) {
    _speedSec = 0;
    _speedTimer = setInterval(function() {
      _speedSec++;
      var disp = document.getElementById('speed-timer-display');
      if (disp) {
        var rem = _speedLimit - _speedSec;
        var m = Math.floor(Math.abs(rem) / 60), s = Math.abs(rem) % 60;
        disp.textContent = (rem < 0 ? '+' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        disp.classList.toggle('speed-overtime', rem < 0);
      }
    }, 1000);
    showToast('⏱ スピードチャレンジ開始！5分以内に解こう');
  } else {
    clearInterval(_speedTimer);
    _speedTimer = null;
    var disp = document.getElementById('speed-timer-display');
    if (disp) disp.textContent = '';
    showToast('スピードチャレンジを終了しました（' + _formatTime(_speedSec) + '）');
  }
  var btn = document.getElementById('speed-mode-btn');
  if (btn) { btn.classList.toggle('speed-active', _speedMode); btn.textContent = _speedMode ? '⏹ 終了' : '⚡ スピード'; }
}

// ===== 検索オートコンプリート =====
var _suggestVisible = false;
function _showSearchSuggestions(query) {
  var wrap = document.getElementById('search-suggest-wrap');
  if (!wrap || !query || query.length < 1) { _hideSearchSuggestions(); return; }
  var probs = getProblems();
  var q = query.toLowerCase();
  var matches = probs.filter(function(p) { return p.title.toLowerCase().indexOf(q) !== -1; }).slice(0, 6);
  if (matches.length === 0) { _hideSearchSuggestions(); return; }
  wrap.innerHTML = matches.map(function(p) {
    return '<div class="suggest-item" data-pid="' + p.id + '" data-title="' + escapeHtml(p.title) + '" onmousedown="event.preventDefault();_selectSuggestion(+this.dataset.pid,this.dataset.title)">' +
      '<span class="suggest-rank rank-' + (p.rank || 'rookie').toLowerCase() + '">' + (p.rank || 'ROOKIE') + '</span>' +
      '<span class="suggest-title">' + escapeHtml(p.title) + '</span>' +
    '</div>';
  }).join('');
  wrap.classList.remove('hidden');
  _suggestVisible = true;
}
function _hideSearchSuggestions() {
  var wrap = document.getElementById('search-suggest-wrap');
  if (wrap) wrap.classList.add('hidden');
  _suggestVisible = false;
}
function _selectSuggestion(id, title) {
  _hideSearchSuggestions();
  var inp = document.getElementById('list-search-input');
  if (inp) inp.value = title;
  _filterQuery = title.toLowerCase();
  renderList();
}

// ===== 匿名ログイン（登録不要でコード実行を可能にする） =====

async function ensureAnonSession() {
  if (currentUser) return true;
  if (!_supabase) return false;
  try {
    var existing = await _supabase.auth.getSession();
    if (existing.data && existing.data.session) {
      if (!currentUser) currentUser = existing.data.session.user;
      return true;
    }
    var res = await _supabase.auth.signInAnonymously();
    if (res.error || !res.data || !res.data.user) return false;
    currentUser = res.data.user;
    updateAuthUI();
    return true;
  } catch(e) {
    return false;
  }
}

// ===== 連続学習日数リマインダー =====
function _checkStreakReminder() {
  var loginDays = lsGetJSON('login_days', []);
  if (loginDays.length === 0) return;
  var streak = calcStreak(loginDays);
  if (streak.current < 2) return;
  var today = _todayKey();
  var lastDay = loginDays[loginDays.length - 1];
  if (lastDay === today) return; // 今日はもう記録済み → 安全
  // 昨日以降ログインなし → ストリーク危機
  var banner = document.getElementById('streak-risk-banner');
  if (banner) {
    banner.innerHTML = '🔥 <strong>' + streak.current + '日連続</strong>継続中！今日も学習してストリークを守ろう';
    banner.classList.remove('hidden');
  }
}

// ===== ランク別進捗ゲージ =====
function _buildRankProgressHTML() {
  var RANKS = ['ROOKIE','BRONZE','SILVER','GOLD','PLATINUM','DIAMOND','MASTER','LEGEND','TITAN'];
  var COLORS = {ROOKIE:'#888',BRONZE:'#CD7F32',SILVER:'#B8C8D8',GOLD:'#EFC050',PLATINUM:'#00C8B4',DIAMOND:'#5588FF',MASTER:'#C040FF',LEGEND:'#FF2244',TITAN:'#FF2020'};
  var all = getProblems();
  var rows = RANKS.map(function(rank) {
    var total   = all.filter(function(p) { return p.rank === rank; }).length;
    if (total === 0) return '';
    var cleared = all.filter(function(p) { return p.rank === rank && isLearned(p.id); }).length;
    var pct = Math.round(cleared / total * 100);
    var color = COLORS[rank] || '#888';
    return '<div class="rp-row">' +
      '<span class="rp-rank" style="color:' + color + '">' + rank + '</span>' +
      '<div class="rp-track"><div class="rp-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<span class="rp-pct">' + cleared + '/' + total + '</span>' +
    '</div>';
  }).join('');
  return '<div class="rank-progress-panel">' +
    '<div class="rp-title">◆ ランク別進捗</div>' + rows +
  '</div>';
}

// ===== フィルタークリア =====
function clearFilter(type) {
  if (type === 'query') {
    _filterQuery = '';
    var s = document.getElementById('list-search-input');
    if (s) s.value = '';
    var cb = document.getElementById('list-search-clear');
    if (cb) cb.classList.add('hidden');
  } else if (type === 'rank') {
    _filterRank = '';
    document.querySelectorAll('.rank-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  } else if (type === 'bookmark') { toggleFilterBookmark(); return; }
  else if (type === 'wrong')    { toggleFilterWrong(); return; }
  else if (type === 'unsolved') { toggleFilterUnsolved(); return; }
  renderList();
}


function toggleFilterBookmark() {
  _filterBookmark = !_filterBookmark;
  if (_filterBookmark) _filterWrong = false;
  var btn = document.getElementById('btn-filter-bookmark');
  var btn2 = document.getElementById('btn-filter-wrong');
  if (btn) btn.classList.toggle('active', _filterBookmark);
  if (btn2) btn2.classList.remove('active');
  _updateFilterBadge();
  renderList();
}
function toggleFilterWrong() {
  _filterWrong = !_filterWrong;
  if (_filterWrong) _filterBookmark = false;
  var btn = document.getElementById('btn-filter-wrong');
  var btn2 = document.getElementById('btn-filter-bookmark');
  if (btn) btn.classList.toggle('active', _filterWrong);
  if (btn2) btn2.classList.remove('active');
  _updateFilterBadge();
  renderList();
}

function toggleFilterUnsolved() {
  _filterUnsolved = !_filterUnsolved;
  var btn = document.getElementById('btn-filter-unsolved');
  if (btn) btn.classList.toggle('active', _filterUnsolved);
  _updateFilterBadge();
  renderList();
}

function _updateFilterBadge() {
  var count = (_filterRank ? 1 : 0) + (_filterBookmark ? 1 : 0) + (_filterWrong ? 1 : 0) + (_filterUnsolved ? 1 : 0);
  var badge = document.getElementById('filter-badge');
  if (!badge) return;
  if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
  else           { badge.classList.add('hidden'); }
}

function openFilterSheet() {
  var sheet = document.getElementById('filter-sheet');
  if (sheet) sheet.classList.add('open');
}

function closeFilterSheet() {
  var sheet = document.getElementById('filter-sheet');
  if (sheet) sheet.classList.remove('open');
}

var _filterTimer = null;
function onFilterInput(val) {
  // 全角スペース(　)も半角スペースに正規化してトリム
  _filterQuery = val.replace(/　/g, ' ').trim().toLowerCase();
  var clearBtn = document.getElementById('list-search-clear');
  if (clearBtn) clearBtn.classList.toggle('hidden', !_filterQuery);
  // オートコンプリート
  if (_filterQuery.length >= 1) {
    _showSearchSuggestions(_filterQuery);
  } else {
    _hideSearchSuggestions();
  }
  // 120ms デバウンスで高速タイピング時の過剰 renderList を防ぐ
  clearTimeout(_filterTimer);
  _filterTimer = setTimeout(renderList, 120);
}

function onRankFilter(btn) {
  _filterRank = btn.getAttribute('data-rank');
  document.querySelectorAll('.rank-filter-btn').forEach(function(b) {
    b.classList.toggle('active', b === btn);
  });
  _updateFilterBadge();
  renderList();
}

function clearFilter() {
  _filterQuery    = '';
  _filterRank     = '';
  _filterBookmark = false;
  _filterWrong    = false;
  _filterUnsolved = false;
  var inp = document.getElementById('list-search-input');
  if (inp) inp.value = '';
  var clearBtn = document.getElementById('list-search-clear');
  if (clearBtn) clearBtn.classList.add('hidden');
  document.querySelectorAll('.rank-filter-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-rank') === '');
  });
  var bBtn = document.getElementById('btn-filter-bookmark');
  var wBtn = document.getElementById('btn-filter-wrong');
  var uBtn = document.getElementById('btn-filter-unsolved');
  if (bBtn) bBtn.classList.remove('active');
  if (wBtn) wBtn.classList.remove('active');
  if (uBtn) uBtn.classList.remove('active');
  _updateFilterBadge();
  renderList();
}
// 検索テキストのみクリア（ランク・ブックマーク・復習フィルターは維持）
function clearSearchText() {
  _filterQuery = '';
  var inp = document.getElementById('list-search-input');
  if (inp) inp.value = '';
  var clearBtn = document.getElementById('list-search-clear');
  if (clearBtn) clearBtn.classList.add('hidden');
  renderList();
}
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
  { id: 'mission_all',   name: 'MISSION MASTER', desc: 'いずれかの言語で全ミッションクリア',       tier: 'master',   check: function(s) { return s.cppM >= 6 || s.pyM >= 6 || s.jsM >= 6 || s.rubyM >= 6 || s.tsM >= 6 || s.kotlinM >= 6 || s.swiftM >= 6 || s.javaM >= 6 || s.csharpM >= 6 || s.goM >= 6 || s.cM >= 6 || s.rustM >= 6 || s.htmlM >= 6 || s.sqlM >= 6 || s.bashM >= 6 || s.regexM >= 6 || s.phpM >= 6; } },
  // 多言語
  { id: 'bilingual',     name: 'BILINGUAL',      desc: '2言語以上でクリア達成',                   tier: 'gold',     check: function(s) { return [s.cpp, s.python, s.js, s.ruby, s.ts, s.kotlin, s.swift, s.java, s.csharp, s.go, s.c, s.rust, s.html, s.sql, s.bash, s.regex, s.php].filter(function(n){return n>0;}).length >= 2; } },
  { id: 'trilingual',    name: 'TRILINGUAL',     desc: '3言語以上でクリア達成',                   tier: 'platinum', check: function(s) { return [s.cpp, s.python, s.js, s.ruby, s.ts, s.kotlin, s.swift, s.java, s.csharp, s.go, s.c, s.rust, s.html, s.sql, s.bash, s.regex, s.php].filter(function(n){return n>0;}).length >= 3; } },
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
  { id: 'html_master',   name: 'HTML MASTER',    desc: 'HTML/CSS 全30問クリア',                   tier: 'diamond',  check: function(s) { return s.html >= 30; } },
  { id: 'legend_html',   name: 'HTML LEGEND',    desc: 'HTML/CSS 最難問クリア',                   tier: 'legend',   check: function(s) { return s.legendHtml; } },
  { id: 'sql_master',    name: 'SQL MASTER',     desc: 'SQL 全30問クリア',                        tier: 'diamond',  check: function(s) { return s.sql >= 30; } },
  { id: 'legend_sql',    name: 'SQL LEGEND',     desc: 'SQL 最難問クリア',                        tier: 'legend',   check: function(s) { return s.legendSql; } },
  { id: 'bash_master',   name: 'BASH MASTER',    desc: 'Bash 全30問クリア',                       tier: 'diamond',  check: function(s) { return s.bash >= 30; } },
  { id: 'legend_bash',   name: 'BASH LEGEND',    desc: 'Bash 最難問クリア',                       tier: 'legend',   check: function(s) { return s.legendBash; } },
  { id: 'regex_master',  name: 'REGEX MASTER',   desc: 'Regex 全30問クリア',                      tier: 'diamond',  check: function(s) { return s.regex >= 30; } },
  { id: 'legend_regex',  name: 'REGEX LEGEND',   desc: 'Regex 最難問クリア',                      tier: 'legend',   check: function(s) { return s.legendRegex; } },
  { id: 'php_master',    name: 'PHP MASTER',     desc: 'PHP 全30問クリア',                        tier: 'diamond',  check: function(s) { return s.php >= 30; } },
  { id: 'legend_php',    name: 'PHP LEGEND',     desc: 'PHP 最難問クリア',                        tier: 'legend',   check: function(s) { return s.legendPhp; } },
  { id: 'true_legend',   name: 'TRUE LEGEND',    desc: '全言語の超難問クリア',                    tier: 'legend',   check: function(s) { return s.legendCpp && s.legendPython && s.legendJs && s.legendRuby && s.legendTs && s.legendKotlin && s.legendSwift && s.legendJava && s.legendCsharp && s.legendGo && s.legendC && s.legendRust && s.legendHtml && s.legendSql && s.legendBash && s.legendRegex && s.legendPhp; } },
  // ─── PREDATOR ───
  { id: 'pred_cpp',    name: 'C++ PREDATOR',    desc: 'C++ PREDATORランク問題クリア',            tier: 'predator', check: function(s) { return s.predatorCpp;    } },
  { id: 'pred_py',     name: 'PY PREDATOR',     desc: 'Python PREDATORランク問題クリア',         tier: 'predator', check: function(s) { return s.predatorPython; } },
  { id: 'pred_js',     name: 'JS PREDATOR',     desc: 'JavaScript PREDATORランク問題クリア',     tier: 'predator', check: function(s) { return s.predatorJs;     } },
  { id: 'pred_ruby',   name: 'RUBY PREDATOR',   desc: 'Ruby PREDATORランク問題クリア',           tier: 'predator', check: function(s) { return s.predatorRuby;   } },
  { id: 'pred_ts',     name: 'TS PREDATOR',     desc: 'TypeScript PREDATORランク問題クリア',     tier: 'predator', check: function(s) { return s.predatorTs;     } },
  { id: 'pred_kotlin', name: 'KT PREDATOR',     desc: 'Kotlin PREDATORランク問題クリア',         tier: 'predator', check: function(s) { return s.predatorKotlin; } },
  { id: 'pred_swift',  name: 'SWIFT PREDATOR',  desc: 'Swift PREDATORランク問題クリア',          tier: 'predator', check: function(s) { return s.predatorSwift;  } },
  { id: 'pred_java',   name: 'JAVA PREDATOR',   desc: 'Java PREDATORランク問題クリア',           tier: 'predator', check: function(s) { return s.predatorJava;   } },
  { id: 'pred_csharp', name: 'C# PREDATOR',     desc: 'C# PREDATORランク問題クリア',             tier: 'predator', check: function(s) { return s.predatorCsharp; } },
  { id: 'pred_go',     name: 'GO PREDATOR',     desc: 'Go PREDATORランク問題クリア',             tier: 'predator', check: function(s) { return s.predatorGo;     } },
  { id: 'pred_c',      name: 'C PREDATOR',      desc: 'C PREDATORランク問題クリア',              tier: 'predator', check: function(s) { return s.predatorC;      } },
  { id: 'pred_rust',   name: 'RUST PREDATOR',   desc: 'Rust PREDATORランク問題クリア',           tier: 'predator', check: function(s) { return s.predatorRust;   } },
  { id: 'true_predator', name: 'TRUE PREDATOR', desc: '全言語のPREDATOR問題クリア。本物のエンジニアの証', tier: 'predator', check: function(s) { return s.predatorCpp && s.predatorPython && s.predatorJs && s.predatorRuby && s.predatorTs && s.predatorKotlin && s.predatorSwift && s.predatorJava && s.predatorCsharp && s.predatorGo && s.predatorC && s.predatorRust; } },
];

// 全言語の進捗を localStorage から集計（言語切替不要）
function getProfileStats() {
  function getP(lang) { return lsGetJSON(lang + '_progress', []); }
  function getM(lang) { return lsGetJSON(lang + '_mission_progress', []); }
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
  var htmlArr   = getP('html');
  var sqlArr    = getP('sql');
  var bashArr   = getP('bash');
  var regexArr  = getP('regex');
  var phpArr    = getP('php');
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
  var html   = htmlArr.length;
  var sql    = sqlArr.length;
  var bash   = bashArr.length;
  var regex  = regexArr.length;
  var php    = phpArr.length;
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
  var htmlM   = getM('html').length;
  var sqlM    = getM('sql').length;
  var bashM   = getM('bash').length;
  var regexM  = getM('regex').length;
  var phpM    = getM('php').length;
  return {
    cpp: cpp, python: python, js: js, ruby: ruby, ts: ts, kotlin: kotlin, swift: swift, java: java,
    csharp: csharp, go: go, c: c, rust: rust, html: html, sql: sql, bash: bash, regex: regex, php: php,
    cppM: cppM, pyM: pyM, jsM: jsM, rubyM: rubyM, tsM: tsM, kotlinM: kotlinM, swiftM: swiftM, javaM: javaM,
    csharpM: csharpM, goM: goM, cM: cM, rustM: rustM, htmlM: htmlM, sqlM: sqlM, bashM: bashM, regexM: regexM, phpM: phpM,
    total: cpp + python + js + ruby + ts + kotlin + swift + java + csharp + go + c + rust + html + sql + bash + regex + php,
    totalMissions: cppM + pyM + jsM + rubyM + tsM + kotlinM + swiftM + javaM + csharpM + goM + cM + rustM + htmlM + sqlM + bashM + regexM + phpM,
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
    legendHtml:   htmlArr.indexOf(30)   !== -1,
    legendSql:    sqlArr.indexOf(30)    !== -1,
    legendBash:   bashArr.indexOf(30)   !== -1,
    legendRegex:  regexArr.indexOf(30)  !== -1,
    legendPhp:    phpArr.indexOf(30)    !== -1,
    predatorCpp:    cppArr.indexOf(58)    !== -1,
    predatorPython: pythonArr.indexOf(58) !== -1,
    predatorJs:     jsArr.indexOf(58)     !== -1,
    predatorRuby:   rubyArr.indexOf(58)   !== -1,
    predatorTs:     tsArr.indexOf(58)     !== -1,
    predatorKotlin: kotlinArr.indexOf(58) !== -1,
    predatorSwift:  swiftArr.indexOf(58)  !== -1,
    predatorJava:   javaArr.indexOf(58)   !== -1,
    predatorCsharp: csharpArr.indexOf(58) !== -1,
    predatorGo:     goArr.indexOf(58)     !== -1,
    predatorC:      cArr.indexOf(58)      !== -1,
    predatorRust:   rustArr.indexOf(58)   !== -1,
    // ストリークは非同期で後から上書きするため初期値0
    currentStreak: 0,
    bestStreak:    0,
    totalDays:     0
  };
}

// ===== 日付ユーティリティ（JST補正） =====
// toISOString() はUTC基準のため、JST(UTC+9)の0〜8時台に前日扱いになるバグを防ぐ
function getTodayJST() {
  var d = new Date();
  d.setTime(d.getTime() + 9 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}
function getYesterdayJST() {
  var d = new Date();
  d.setTime(d.getTime() + 9 * 60 * 60 * 1000 - 86400000);
  return d.toISOString().slice(0, 10);
}

// localStorage.setItem のラッパー（QuotaExceededError を握りつぶさない）
var _lsNativeSet = localStorage.setItem.bind(localStorage);
function lsGetJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch(e) {
    console.warn('[CODE STEP] localStorage parse error:', key, e);
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    _lsNativeSet(key, value);
  } catch(e) {
    if (e && e.name === 'QuotaExceededError') {
      console.warn('[CODE STEP] localStorage 容量不足のためデータを保存できませんでした:', key);
      showToast('⚠ ストレージ容量が不足しています。不要なデータを削除してください。');
    } else {
      throw e;
    }
  }
}

// ===== ログインストリーク =====

function calcStreak(dates) {
  if (!dates || dates.length === 0) return { current: 0, best: 0, total: 0 };
  // 降順ソート
  var sorted = dates.slice().sort(function(a, b) { return b.localeCompare(a); });
  var total  = sorted.length;
  var todayStr     = getTodayJST();
  var yesterdayStr = getYesterdayJST();

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
  var today = getTodayJST();
  // localStorage に記録
  var local = lsGetJSON('login_days', []);
  var isNew = local.indexOf(today) === -1;
  if (isNew) {
    local.push(today);
    lsSet('login_days', JSON.stringify(local));
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
  var localDates = lsGetJSON('login_days', []);
  if (!currentUser || !_supabase) return calcStreak(localDates);
  try {
    var result = await _supabase
      .from('login_days')
      .select('login_date')
      .eq('user_id', currentUser.id)
      .order('login_date', { ascending: false })
      .limit(400);
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
function getProfileRank(total, titanLangCount) {
  if (total >= 350 && (titanLangCount || 0) >= 3) return { name: 'OVERLORD', color: '#FFD700' };
  if (total >= 350) return { name: 'TITAN', color: '#FF2020' };
  if (total >=  90) return { name: 'MASTER',   color: '#C040FF' };
  if (total >=  60) return { name: 'PLATINUM', color: '#00C8B4' };
  if (total >=  30) return { name: 'GOLD',     color: '#EFC050' };
  if (total >=  10) return { name: 'SILVER',   color: '#B8C8D8' };
  if (total >=   1) return { name: 'BRONZE',   color: '#C47A2F' };
  return                    { name: 'ROOKIE',  color: '#9B9B9B' };
}

// 言語ごとの重み付き実力スコア計算
function calcLangStrengthData(langKey, problemArray) {
  var prog = lsGetJSON(langKey + '_progress', []);
  var maxExp = 0, earnedExp = 0;
  problemArray.forEach(function(p) {
    var exp = RANK_EXP[(p.rank || 'rookie').toLowerCase()] || 15;
    maxExp += exp;
    if (prog.indexOf(p.id) !== -1) earnedExp += exp;
  });
  var pct = maxExp > 0 ? Math.min(100, Math.round(earnedExp / maxExp * 100)) : 0;
  return { pct: pct, earned: earnedExp, max: maxExp };
}

function getLangStrengthRank(pct, titanLangCount) {
  if (pct >= 100 && (titanLangCount || 0) >= 2) return { name: 'OVERLORD', color: '#FFD700' };
  if (pct >= 100) return { name: 'TITAN',    color: '#FF2020' };
  if (pct >= 90)  return { name: 'LEGEND',   color: '#FF2244' };
  if (pct >= 75)  return { name: 'MASTER',   color: '#C040FF' };
  if (pct >= 55)  return { name: 'DIAMOND',  color: '#5588FF' };
  if (pct >= 38)  return { name: 'PLATINUM', color: '#00C8B4' };
  if (pct >= 24)  return { name: 'GOLD',     color: '#EFC050' };
  if (pct >= 12)  return { name: 'SILVER',   color: '#B8C8D8' };
  if (pct >= 4)   return { name: 'BRONZE',   color: '#C47A2F' };
  return               { name: 'ROOKIE',  color: '#9B9B9B' };
}

// ===== Dev Status レーダーチャート =====

var DEV_STATUS_AXES = [
  { name: 'アルゴリズム', color: '#C040FF', langs: [
    { key: 'cpp',    g: function() { return problems; },           w: 1.0 },
    { key: 'rust',   g: function() { return rustProblems; },       w: 0.8 },
    { key: 'python', g: function() { return pythonProblems; },     w: 0.6 },
    { key: 'java',   g: function() { return javaProblems; },       w: 0.5 },
  ]},
  { name: 'フロントエンド', color: '#F0C040', langs: [
    { key: 'html',       g: function() { return htmlProblems; },       w: 1.0 },
    { key: 'javascript', g: function() { return javascriptProblems; }, w: 1.0 },
    { key: 'typescript', g: function() { return typescriptProblems; }, w: 0.7 },
  ]},
  { name: 'バックエンド', color: '#3776AB', langs: [
    { key: 'python', g: function() { return pythonProblems; }, w: 1.0 },
    { key: 'php',    g: function() { return phpProblems; },    w: 1.0 },
    { key: 'ruby',   g: function() { return rubyProblems; },   w: 0.8 },
    { key: 'java',   g: function() { return javaProblems; },   w: 0.5 },
  ]},
  { name: 'インフラ', color: '#00C8B4', langs: [
    { key: 'bash',  g: function() { return bashProblems; },  w: 1.0 },
    { key: 'sql',   g: function() { return sqlProblems; },   w: 0.8 },
    { key: 'go',    g: function() { return goProblems; },    w: 0.6 },
    { key: 'regex', g: function() { return regexProblems; }, w: 0.5 },
  ]},
  { name: '設計力', color: '#00ADD8', langs: [
    { key: 'go',         g: function() { return goProblems; },         w: 1.0 },
    { key: 'kotlin',     g: function() { return kotlinProblems; },     w: 0.7 },
    { key: 'csharp',     g: function() { return csharpProblems; },     w: 0.6 },
    { key: 'typescript', g: function() { return typescriptProblems; }, w: 0.5 },
  ]},
  { name: '低レイヤ', color: '#CE412B', langs: [
    { key: 'cpp',  g: function() { return problems; },     w: 1.0 },
    { key: 'c',    g: function() { return cProblems; },    w: 1.0 },
    { key: 'rust', g: function() { return rustProblems; }, w: 0.9 },
  ]},
];

function calcDevStatus() {
  return DEV_STATUS_AXES.map(function(axis) {
    var tw = 0, ws = 0;
    axis.langs.forEach(function(l) {
      var sd = calcLangStrengthData(l.key, l.g());
      ws += sd.pct * l.w;
      tw += l.w;
    });
    return { name: axis.name, score: tw > 0 ? Math.round(ws / tw) : 0, color: axis.color };
  });
}

function _buildDevStatusSVG(scores) {
  var cx = 200, cy = 200, maxR = 115, n = 6;

  function pt(i, r) {
    var a = -Math.PI / 2 + (2 * Math.PI / n) * i;
    return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)];
  }

  function poly(r, stroke, sw, fill, opacity) {
    var d = '';
    for (var i = 0; i < n; i++) {
      var p = pt(i, r);
      d += (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1];
    }
    d += ' Z';
    return '<path d="' + d + '" fill="' + fill + '" fill-opacity="' + opacity + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
  }

  // グリッド
  var gridSVG = '';
  [20, 40, 60, 80, 100].forEach(function(pct, gi) {
    var r = maxR * pct / 100;
    var isOuter = pct === 100;
    gridSVG += poly(r, isOuter ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', isOuter ? 1.5 : 1, 'none', 0);
    if (pct === 50) {
      var lp = pt(1, r);
      gridSVG += '<text x="' + (lp[0]+3) + '" y="' + (lp[1]-2) + '" font-size="8" fill="rgba(255,255,255,0.18)" font-family="monospace">50</text>';
    }
  });

  // 軸線
  var axesSVG = '';
  for (var i = 0; i < n; i++) {
    var ep = pt(i, maxR);
    axesSVG += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ep[0] + '" y2="' + ep[1] + '" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>';
  }

  // スコアポリゴン
  var spd = '';
  for (var i = 0; i < n; i++) {
    var r = maxR * Math.max(scores[i].score, 1) / 100;
    var p = pt(i, r);
    spd += (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1];
  }
  spd += ' Z';

  // 頂点ドット
  var dotsSVG = '';
  for (var i = 0; i < n; i++) {
    var r = maxR * Math.max(scores[i].score, 1) / 100;
    var p = pt(i, r);
    if (scores[i].score > 0) {
      dotsSVG += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="' + scores[i].color + '" stroke="#0a1020" stroke-width="1.5"/>';
    }
  }

  // ラベル（名前 + スコア%）
  var labelSVG = '';
  for (var i = 0; i < n; i++) {
    var lp = pt(i, maxR + 26);
    var anc = lp[0] < cx - 8 ? 'end' : lp[0] > cx + 8 ? 'start' : 'middle';
    var s = scores[i];
    var scoreY = lp[1] + 13;
    labelSVG +=
      '<text x="' + lp[0] + '" y="' + lp[1] + '" text-anchor="' + anc + '" ' +
        'font-size="9.5" fill="' + s.color + 'bb" font-family="\'Share Tech Mono\',monospace" font-weight="700" letter-spacing="0.03em">' + s.name + '</text>' +
      '<text x="' + lp[0] + '" y="' + scoreY + '" text-anchor="' + anc + '" ' +
        'font-size="15" fill="' + s.color + '" font-family="\'Barlow Condensed\',sans-serif" font-weight="800">' + s.score + '%</text>';
  }

  return (
    '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="dev-status-chart">' +
      '<defs>' +
        '<radialGradient id="dsGrad" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="#8060FF" stop-opacity="0.28"/>' +
          '<stop offset="100%" stop-color="#FF6B00" stop-opacity="0.04"/>' +
        '</radialGradient>' +
        '<filter id="dsGlow" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feGaussianBlur stdDeviation="4" result="blur"/>' +
          '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
      '</defs>' +
      gridSVG +
      axesSVG +
      '<path d="' + spd + '" fill="url(#dsGrad)" stroke="#FF6B00" stroke-width="1.8" stroke-linejoin="round" filter="url(#dsGlow)"/>' +
      dotsSVG +
      labelSVG +
    '</svg>'
  );
}

// ===== EXP・レベルシステム =====

// 問題ランク別 EXP
var RANK_EXP = {
  rookie: 15, bronze: 25, silver: 40, gold: 60,
  platinum: 85, diamond: 120, master: 160, legend: 500, titan: 1200
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

  // 問題クリア EXP（全言語）
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
    { key: 'rust',       get: function() { return rustProblems; } },
    { key: 'html',       get: function() { return htmlProblems; } },
    { key: 'sql',        get: function() { return sqlProblems; } },
    { key: 'bash',       get: function() { return bashProblems; } },
    { key: 'regex',      get: function() { return regexProblems; } },
    { key: 'php',        get: function() { return phpProblems; } }
  ].forEach(function(lang) {
    var prog = lsGetJSON(lang.key + '_progress', []);
    lang.get().forEach(function(p) {
      if (prog.indexOf(p.id) !== -1) {
        problemExp += RANK_EXP[p.rank.toLowerCase()] || 15;
      }
    });
  });

  // ミッションクリア EXP（全言語）
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
    { key: 'rust',       get: function() { return rustMissions; } },
    { key: 'html',       get: function() { return htmlMissions; } },
    { key: 'sql',        get: function() { return sqlMissions; } },
    { key: 'bash',       get: function() { return bashMissions; } },
    { key: 'regex',      get: function() { return regexMissions; } },
    { key: 'php',        get: function() { return phpMissions; } }
  ].forEach(function(lang) {
    var prog = lsGetJSON(lang.key + '_mission_progress', []);
    lang.get().forEach(function(m) {
      if (prog.indexOf(m.id) !== -1) {
        missionExp += MISSION_EXP[m.rank.toLowerCase()] || 80;
      }
    });
  });

  // ログイン EXP
  var loginDays = lsGetJSON('login_days', []);
  var loginExp  = loginDays.length * LOGIN_EXP;

  // ボーナス EXP（デイリーチャレンジなど）
  var bonusExp = parseInt(localStorage.getItem('bonus_xp') || '0');

  return {
    total:   problemExp + missionExp + loginExp + bonusExp,
    problem: problemExp,
    mission: missionExp,
    login:   loginExp,
    bonus:   bonusExp
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

// ヘッダーのストリークバッジを更新
async function updateStreakBadge() {
  var el = document.getElementById('streak-badge');
  var reminderEl = document.getElementById('streak-reminder');
  if (!el || !currentUser) {
    if (el) el.classList.add('hidden');
    if (reminderEl) reminderEl.classList.add('hidden');
    return;
  }
  var streak;
  try { streak = await getLoginStreak(); } catch(e) { return; }
  if (streak.current >= 1) {
    el.textContent = '🔥' + streak.current;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }

  // 今日まだ学習していない場合（18時以降、ストリーク1日以上）にリマインダー表示
  if (reminderEl) {
    var today = getTodayJST();
    var log = lsGetJSON('study_log', {});
    var studiedToday = (log[today] || 0) > 0;
    var hour = new Date().getHours();
    var showReminder = !studiedToday && streak.current >= 1 && hour >= 18;
    reminderEl.classList.toggle('hidden', !showReminder);
  }
}

// ===== デイリーチャレンジ =====

function getDailyChallenge() {
  var problems = getProblems();
  if (!problems || !problems.length) return null;
  var today = getTodayJST();
  var lang  = currentLanguage || 'cpp';
  // 同じ日・同じ言語では一度決めた問題IDを固定する（進捗変化で問題が変わるのを防ぐ）
  var cacheKey = lang + '_daily_id_' + today;
  var cachedId = parseInt(localStorage.getItem(cacheKey) || '', 10);
  if (!isNaN(cachedId)) {
    var cached = problems.find(function(p) { return p.id === cachedId; });
    if (cached) return cached;
  }
  var seed = today.split('').reduce(function(acc, c) { return (acc * 31 + c.charCodeAt(0)) >>> 0; }, 0);
  // プレミアム限定問題は非プレミアムユーザーには出さない
  var available = problems.filter(function(p) { return !isPremiumRequired(p.rank) || currentUserIsPremium; });
  if (!available.length) available = problems;
  // まだクリアしていない問題を優先
  var unlearned = available.filter(function(p) { return !isLearned(p.id); });
  var pool = unlearned.length > 0 ? unlearned : available;
  var chosen = pool[seed % pool.length];
  if (chosen) lsSet(cacheKey, String(chosen.id));
  return chosen;
}

function isDailyChallengeCleared() {
  var today = getTodayJST();
  var lang = currentLanguage || 'cpp';
  return localStorage.getItem(lang + '_daily_cleared_' + today) === '1';
}

function markDailyChallengeCleared() {
  var today = getTodayJST();
  var lang = currentLanguage || 'cpp';
  lsSet(lang + '_daily_cleared_' + today, '1');
  var cur = parseInt(localStorage.getItem('bonus_xp') || '0');
  lsSet('bonus_xp', String(cur + 50));
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

// ===== SNS シェア =====
var _shareLv = 1;
function shareToX(text) {
  var url = 'https://twitter.com/intent/tweet?text=' +
    encodeURIComponent(text) + '&url=' +
    encodeURIComponent('https://cpp-step.vercel.app/');
  if (!window.open(url, '_blank', 'width=600,height=400,noopener')) {
    showToast('ポップアップをブロック解除してください');
  }
}
function shareLevelUp() {
  shareToX('CODE STEP で Lv.' + _shareLv + ' ' + getLevelTitle(_shareLv) + ' に到達しました！ #CODESTEP #プログラミング学習');
}
function shareBadge(name, desc) {
  shareToX('CODE STEP で「' + name + '」バッジを獲得しました！（' + desc + '）#CODESTEP #プログラミング学習');
}
function shareClear(title, lang) {
  shareToX('CODE STEP で「' + title + '」（' + lang + '）をクリアしました！ #CODESTEP #プログラミング学習');
}
function shareProfile() {
  var stats    = getProfileStats();
  var expData  = calculateEXP();
  var level    = calcLevel(expData.total);
  var rank     = getProfileRank(stats.total, countTitanLangs());
  var streakEl = document.getElementById('streak-badge');
  var streak   = streakEl && !streakEl.classList.contains('hidden')
    ? (streakEl.textContent || '') : '';
  var text = 'CODE STEP で ' + stats.total + ' 問クリア達成！';
  if (rank && rank.name) text += ' ランク: ' + rank.name + ' / Lv.' + level;
  if (streak) text += ' ' + streak + '連続学習中';
  text += ' #CODESTEP #プログラミング学習';
  shareToX(text);
}

// レベルアップオーバーレイを表示
function showLevelUpEffect(lv) {
  var el = document.getElementById('levelup-effect');
  if (!el) return;
  _shareLv = lv;

  var lvc = getLevelColor(lv);

  el.querySelector('.levelup-num').textContent = lv;
  el.querySelector('.levelup-title-text').textContent = getLevelTitle(lv);
  el.style.setProperty('--lv-color', lvc);

  // 次レベルまでのEXP表示
  var xpEl = el.querySelector('.lue-xp-next');
  if (xpEl) xpEl.textContent = '次のレベルまで ' + expToNextLevel(lv) + ' EXP';

  // リングアニメーションをリセット（再トリガー）
  el.querySelectorAll('.lue-ring').forEach(function(r) {
    r.style.animation = 'none';
    r.getBoundingClientRect(); // reflow
    r.style.animation = '';
  });

  el.classList.remove('hidden');

  // クリックで即閉じ
  var _luTimer = setTimeout(function() { el.classList.add('hidden'); }, 5200);
  function _closeLue() {
    clearTimeout(_luTimer);
    el.classList.add('hidden');
    el.removeEventListener('click', _closeLue);
  }
  el.addEventListener('click', _closeLue);

  // コンフェッティ 3連バースト
  if (window.confetti) {
    confetti({ particleCount: 110, spread: 80, origin: { x: 0.5, y: 0.38 },
      colors: ['#FF6B00', '#FFD700', lvc, '#ffffff'] });
    setTimeout(function() {
      confetti({ particleCount: 65, angle: 60,  spread: 55, origin: { x: 0.15, y: 0.55 },
        colors: [lvc, '#FFD700', '#ffffff'] });
      confetti({ particleCount: 65, angle: 120, spread: 55, origin: { x: 0.85, y: 0.55 },
        colors: [lvc, '#FF6B00', '#ffffff'] });
    }, 380);
    setTimeout(function() {
      confetti({ particleCount: 50, spread: 110, startVelocity: 18,
        origin: { x: 0.5, y: 0.15 },
        colors: ['#FFD700', lvc, '#ffffff'] });
    }, 820);
  }
}

// レベルアップ判定（セーブのたびに呼ぶ）
var _levelUpTimer = null;
function checkLevelUp() {
  if (_levelUpTimer) return;
  _levelUpTimer = setTimeout(function() {
    _levelUpTimer = null;
    try {
      var expData  = calculateEXP();
      var newLv    = calcLevel(expData.total);
      var prevLv   = parseInt(localStorage.getItem('user_level') || '0');
      lsSet('user_level', String(newLv));
      updateLevelBadge();
      if (prevLv > 0 && newLv > prevLv) {
        playLevelUpSound();
        showLevelUpEffect(newLv);
      }
    } catch(e) {}
  }, 50);
}

// ===== 言語データ =====

var LANGUAGE_GROUPS = [
  {
    rank: 'ROOKIE',
    rankColor: '#9B9B9B',
    desc: '文法がシンプルで誰でも始めやすい',
    langs: [
      {
        id: 'python', name: 'Python', color: '#3776AB', problems: 58, available: true,
        uses: ['AI・機械学習', 'データ分析', 'Web開発', '自動化スクリプト']
      },
      {
        id: 'html', name: 'HTML/CSS', color: '#E44D26', problems: 30, available: true,
        uses: ['Webページ作成', 'UIデザイン', 'フロントエンド基礎']
      },
    ]
  },
  {
    rank: 'BRONZE',
    rankColor: '#C47A2F',
    desc: '少し複雑だが実用的なアプリが作れる',
    langs: [
      {
        id: 'javascript', name: 'JavaScript', color: '#F0C040', problems: 58, available: true,
        uses: ['Webフロントエンド', 'ブラウザゲーム', 'Node.js サーバー']
      },
      {
        id: 'ruby', name: 'Ruby', color: '#CC342D', problems: 58, available: true,
        uses: ['Web開発 (Rails)', 'スクリプト自動化', 'プロトタイプ開発']
      },
      {
        id: 'sql', name: 'SQL', color: '#336791', problems: 30, available: true,
        uses: ['データベース操作', 'データ分析', 'バックエンド開発']
      },
    ]
  },
  {
    rank: 'SILVER',
    rankColor: '#B8C8D8',
    desc: '型システムやOOP(オブジェクト指向)を本格的に学ぶ',
    langs: [
      {
        id: 'typescript', name: 'TypeScript', color: '#3178C6', problems: 58, available: true,
        uses: ['大規模Webアプリ', '型安全なフロントエンド', 'フレームワーク開発']
      },
      {
        id: 'kotlin', name: 'Kotlin', color: '#7F52FF', problems: 58, available: true,
        uses: ['Androidアプリ', 'サーバーサイド', 'Spring Boot']
      },
      {
        id: 'swift', name: 'Swift', color: '#FA7343', problems: 58, available: true,
        uses: ['iOSアプリ', 'macOSアプリ', 'watchOS・tvOS']
      },
      {
        id: 'bash', name: 'Bash', color: '#4EAA25', problems: 30, available: true,
        uses: ['自動化スクリプト', 'サーバー管理', 'DevOps・CI/CD']
      },
      {
        id: 'regex', name: 'Regex', color: '#FF6B35', problems: 30, available: true,
        uses: ['パターンマッチング', '文字列処理', 'バリデーション']
      },
    ]
  },
  {
    rank: 'GOLD',
    rankColor: '#EFC050',
    desc: '企業現場でよく使われる実践的な言語',
    langs: [
      {
        id: 'java', name: 'Java', color: '#ED8B00', problems: 58, available: true,
        uses: ['企業向けシステム', 'Androidアプリ', 'Spring Bootサーバー']
      },
      {
        id: 'csharp', name: 'C#', color: '#9B4F96', problems: 58, available: true,
        uses: ['Unityゲーム開発', 'Windowsアプリ', '.NETサーバー']
      },
      {
        id: 'go', name: 'Go', color: '#00ADD8', problems: 58, available: true,
        uses: ['高速APIサーバー', 'Dockerなどインフラツール', 'クラウドサービス']
      },
      {
        id: 'php', name: 'PHP', color: '#777BB4', problems: 30, available: true,
        uses: ['Web開発 (Laravel)', 'WordPress', 'サーバーサイド']
      },
    ]
  },
  {
    rank: 'PLATINUM',
    rankColor: '#00C8B4',
    desc: 'OS・組み込みなど低レベルの世界',
    langs: [
      {
        id: 'c', name: 'C', color: '#A8B9CC', problems: 58, available: true,
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
        id: 'cpp', name: 'C++', color: '#00599C', problems: 58, available: true,
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
        id: 'rust', name: 'Rust', color: '#CE412B', problems: 58, available: true,
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
  _studyTimerDate  = getTodayJST();
}

function stopStudyTimer() {
  if (!_studyTimerStart) return;
  var elapsed = Math.round((Date.now() - _studyTimerStart) / 1000);
  _studyTimerStart = null;
  // 3秒未満（誤操作）や3時間超（放置）は除外
  if (elapsed < 3 || elapsed > 10800) return;
  // 日付が変わっていたら今日付で記録（前日への持ち越し防止）
  var today = getTodayJST();
  var date  = (_studyTimerDate && _studyTimerDate !== today) ? today : (_studyTimerDate || today);
  var log   = lsGetJSON('study_log', {});
  log[date] = (log[date] || 0) + elapsed;
  lsSet('study_log', JSON.stringify(log));
}

function recordLanguageStart(langId) {
  var key = langId + '_started_at';
  if (!localStorage.getItem(key)) {
    lsSet(key, getTodayJST());
  }
}

function getTotalStudyTime() {
  var log = lsGetJSON('study_log', {});
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

function _buildDashboard() {
  var stats    = getProfileStats();
  if (stats.total === 0) return '';

  var expData    = calculateEXP();
  var lv         = calcLevel(expData.total);
  var lvColor    = getLevelColor(lv);
  var title      = getLevelTitle(lv);
  var streak     = calcStreak(lsGetJSON('login_days', []));
  var studyLog   = lsGetJSON('study_log', {});
  var todayKey   = getTodayJST();
  var todaySec   = studyLog[todayKey] || 0;
  var todayMin   = Math.floor(todaySec / 60);
  var goalMin    = 15;
  var goalPct    = Math.min(100, Math.round(todaySec / (goalMin * 60) * 100));
  var goalDone   = goalPct >= 100;

  // 過去7日ヒートマップ
  var days7 = [];
  for (var d = 6; d >= 0; d--) {
    var dt = new Date();
    dt.setTime(dt.getTime() + 9 * 60 * 60 * 1000 - d * 86400000);
    var k = dt.toISOString().slice(0, 10);
    days7.push({ key: k, sec: studyLog[k] || 0 });
  }
  var maxSec = Math.max(1, Math.max.apply(null, days7.map(function(x) { return x.sec; })));
  var calCells = days7.map(function(x) {
    var lvl = x.sec > 0 ? Math.min(4, Math.ceil((x.sec / maxSec) * 4)) : 0;
    var label = x.key.slice(5) + ' — ' + Math.floor(x.sec / 60) + '分';
    return '<div class="db-cal-cell db-cal-' + lvl + '" title="' + label + '"></div>';
  }).join('');

  // 直前に遊んだ言語の「続きから」ボタン
  var lastId   = localStorage.getItem('last_language');
  var lastLang = null;
  if (lastId) {
    LANGUAGE_GROUPS.forEach(function(g) {
      g.langs.forEach(function(l) { if (l.id === lastId) lastLang = l; });
    });
  }
  var continueBtn = lastLang
    ? '<button class="db-continue-btn" onclick="selectLanguage(\'' + lastLang.id + '\')" style="--lc:' + lastLang.color + '">' +
        '▶ ' + escapeHtml(lastLang.name) + ' を続ける' +
      '</button>'
    : '';

  return (
    '<div class="db-widget">' +
      '<div class="db-stats">' +
        '<div class="db-stat">' +
          '<span class="db-val">' + (streak.current || 0) + '</span>' +
          '<span class="db-label">🔥 STREAK</span>' +
        '</div>' +
        '<div class="db-sep">◆</div>' +
        '<div class="db-stat">' +
          '<span class="db-val" style="color:' + lvColor + '">Lv.' + lv + '</span>' +
          '<span class="db-label" style="color:' + lvColor + '55">⚡ ' + title + '</span>' +
        '</div>' +
        '<div class="db-sep">◆</div>' +
        '<div class="db-stat">' +
          '<span class="db-val">' + stats.total + '</span>' +
          '<span class="db-label">📚 CLEARED</span>' +
        '</div>' +
      '</div>' +

      '<div class="db-goal">' +
        '<div class="db-goal-meta">' +
          '<span class="db-goal-label">TODAY ' + (goalDone ? '✓ GOAL REACHED' : todayMin + '分 / 目標' + goalMin + '分') + '</span>' +
          '<span class="db-goal-pct ' + (goalDone ? 'db-goal-done' : '') + '">' + goalPct + '%</span>' +
        '</div>' +
        '<div class="db-goal-track">' +
          '<div class="db-goal-fill ' + (goalDone ? 'db-goal-done' : '') + '" style="width:' + goalPct + '%"></div>' +
        '</div>' +
      '</div>' +

      '<div class="db-bottom">' +
        continueBtn +
        '<div class="db-cal-wrap">' +
          '<span class="db-cal-label">過去7日</span>' +
          '<div class="db-cal">' + calCells + '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderLangSelect() {
  document.getElementById('lang-badge').classList.add('hidden');
  var content = document.getElementById('lang-content');
  content.innerHTML =
    '<div class="lang-page-header">' +
      '<div class="lang-page-title">◆ SELECT LANGUAGE</div>' +
      '<div class="lang-page-sub">学習する言語を選択してください</div>' +
      '<div class="lang-quick-access">' +
        '<button class="lang-qa-btn" onclick="goToCareerDirect()">🎯 CAREER</button>' +
        '<button class="lang-qa-btn lang-qa-intro" onclick="goToIntroDirect()">🌱 INTRO</button>' +
      '</div>' +
      '<button class="lang-quiz-btn" onclick="openQuizModal()">🧭 どの言語を選べばいいかわからない方はこちら</button>' +
    '</div>' +
    _buildDashboard();

  var localProgress = _getLocalProgress();
  var cardIdx = 0;

  LANGUAGE_GROUPS.forEach(function(group) {
    var section = document.createElement('div');
    section.className = 'lang-section';
    section.innerHTML =
      '<div class="lang-section-header" style="--rc:' + group.rankColor + '">' +
        '<span class="lang-section-rank" style="color:' + group.rankColor + '">' + group.rank + '</span>' +
        '<span class="lang-section-desc">' + group.desc + '</span>' +
      '</div>' +
      '<div class="lang-grid"></div>';

    var grid = section.querySelector('.lang-grid');

    group.langs.forEach(function(lang) {
      var card = document.createElement('div');
      card.className = 'lang-card' + (lang.available ? ' lang-available' : ' lang-coming');
      card.style.setProperty('--lc', lang.color);
      card.style.animationDelay = (cardIdx * 0.045) + 's';
      cardIdx++;

      var solved = localProgress.filter(function(p) { return p.lang === lang.id && p.solved; }).length;
      var pct = (lang.available && lang.problems > 0) ? Math.round(solved / lang.problems * 100) : 0;

      var useTags = lang.uses.map(function(u) {
        return '<span class="lang-use-tag">' + u + '</span>';
      }).join('');

      card.innerHTML =
        '<div class="lang-card-bar" style="background:' + lang.color + '"></div>' +
        '<div class="lang-card-body">' +
          '<div class="lang-card-top">' +
            '<div class="lang-card-name">' + lang.name +
              (['python','html','javascript'].indexOf(lang.id) >= 0
                ? '<span class="lang-card-rec-badge">★ 初心者向け</span>'
                : '') +
            '</div>' +
            '<div class="lang-card-status' + (lang.available ? ' lang-status-open' : '') + '">' +
              (lang.available ? lang.problems + ' PROBLEMS' : 'COMING SOON') +
            '</div>' +
          '</div>' +
          '<div class="lang-use-tags">' + useTags + '</div>' +
          (lang.available ?
            '<div class="lang-card-footer">' +
              '<div class="lang-card-progress-track">' +
                '<div class="lang-card-progress-fill" style="width:' + pct + '%;background:' + lang.color + '"></div>' +
              '</div>' +
              '<div class="lang-card-pct">' + pct + '%</div>' +
            '</div>'
          : '') +
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
  var hasLang = !!currentLanguage;
  document.getElementById('progress-text').classList.toggle('hidden', !hasLang);
  document.getElementById('progress-bar-wrap').classList.toggle('hidden', !hasLang);
  updateLangBadge();
}

function setActiveTab(tab) {
  ['problems', 'missions', 'guide', 'intro', 'textbook', 'ranking', 'career', 'contest'].forEach(function(t) {
    var el = document.getElementById('tab-' + t);
    if (!el) return;
    el.classList.toggle('active', t === tab);
    if (t === tab) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
}

async function selectLanguage(langId) {
  playLangSelect();
  lsSet('last_language', langId);
  recordLanguageStart(langId);
  currentLanguage = langId;
  _progressCache = null;
  _missionProgressCache = null;
  chatHistory = [];
  // フィルター・コンテスト言語をリセット（前言語の状態が引き継がれないよう）
  _filterQuery    = '';
  _filterRank     = '';
  _filterBookmark = false;
  _filterWrong    = false;
  _filterUnsolved = false;
  _contestLang    = null;
  var bBtn = document.getElementById('btn-filter-bookmark');
  var wBtn = document.getElementById('btn-filter-wrong');
  var uBtn = document.getElementById('btn-filter-unsolved');
  if (bBtn) bBtn.classList.remove('active');
  if (wBtn) wBtn.classList.remove('active');
  if (uBtn) uBtn.classList.remove('active');
  document.querySelectorAll('.rank-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  history.pushState({ page: 'list', lang: langId, tab: 'problems' }, '');
  showNavAndProgress();
  setActiveTab('problems');
  showPage('list');
  // ローカルデータで即時描画（Supabaseを待たない）
  renderList();
  updateProgressDisplay();
  // バックグラウンドでSupabase同期（完了後にrenderListが再呼出しされる）
  if (currentUser && _supabase) {
    Promise.all([
      syncProgressFromSupabase(),
      syncMissionProgressFromSupabase()
    ]).catch(function() {});
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
      .select('is_premium, is_admin, age_group, job_class, experience, is_scout_opted_in')
      .eq('user_id', currentUser.id)
      .maybeSingle();
    if (result.data) {
      _premiumStatusCache      = !!result.data.is_premium;
      currentUserIsAdmin       = !!result.data.is_admin;
      _realUserIsAdmin         = !!result.data.is_admin;
      currentUserAgeGroup      = result.data.age_group   || null;
      currentUserJobClass      = result.data.job_class   || null;
      currentUserExperience    = result.data.experience  || null;
      currentUserScoutOptIn    = !!result.data.is_scout_opted_in;
    } else {
      // プロフィールが存在しなければ作成
      await _supabase.from('user_profiles').upsert({
        user_id: currentUser.id,
        is_premium: false,
        is_admin: false
      });
      _premiumStatusCache = false;
      currentUserIsAdmin  = false;
      _realUserIsAdmin    = false;
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

async function fetchScoutMessages() {
  if (!currentUser || !_supabase) { currentUserScoutMessages = []; return; }
  try {
    var result = await _supabase
      .from('scout_messages')
      .select('message_id, message_title, message_body, status, sent_at')
      .eq('target_user_id', currentUser.id)
      .order('sent_at', { ascending: false })
      .limit(20);
    currentUserScoutMessages = result.data || [];
  } catch(e) { currentUserScoutMessages = []; }
}

async function toggleScoutOptIn() {
  if (!currentUser || !_supabase) return;
  var newVal = !currentUserScoutOptIn;
  currentUserScoutOptIn = newVal;
  var btn = document.querySelector('.gc-scout-toggle');
  if (btn) btn.classList.toggle('on', newVal);
  try {
    await _supabase.from('user_profiles')
      .update({ is_scout_opted_in: newVal })
      .eq('user_id', currentUser.id);
  } catch(e) {
    currentUserScoutOptIn = !newVal;
    if (btn) btn.classList.toggle('on', !newVal);
  }
}

async function markScoutRead(messageId) {
  if (!currentUser || !_supabase) return;
  try {
    await _supabase.from('scout_messages')
      .update({ status: 'read' })
      .eq('message_id', messageId)
      .eq('target_user_id', currentUser.id);
    var msg = currentUserScoutMessages.find(function(m) { return m.message_id === messageId; });
    if (msg) msg.status = 'read';
    renderProfile();
  } catch(e) {}
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
  if (btn) btn.style.display = _realUserIsAdmin ? 'inline-flex' : 'none';
}

function openAdminPanel() {
  if (!_realUserIsAdmin) return;
  // プレビュー状態をボタンに反映
  var toggle = document.getElementById('admin-preview-toggle');
  if (toggle) {
    toggle.textContent = _adminPreviewFree ? '● 無料ユーザー表示中' : '○ 実際の表示（PLUS）';
    toggle.classList.toggle('active-preview', _adminPreviewFree);
  }
  var adminToggle = document.getElementById('admin-admin-toggle');
  if (adminToggle) {
    adminToggle.textContent = currentUserIsAdmin ? '● 管理者モード中' : '○ 非管理者として表示中';
    adminToggle.classList.toggle('active-preview', !currentUserIsAdmin);
  }
  document.getElementById('admin-panel').classList.remove('hidden');
}

function closeAdminPanel() {
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('admin-msg').textContent = '';
  document.getElementById('admin-email-input').value = '';
}

function adminTogglePreview() {
  if (!_realUserIsAdmin) return;
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

function adminToggleAdminMode() {
  if (!_realUserIsAdmin) return;
  currentUserIsAdmin = !currentUserIsAdmin;
  var toggleBtn = document.getElementById('admin-admin-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = currentUserIsAdmin ? '● 管理者モード中' : '○ 非管理者として表示中';
    toggleBtn.classList.toggle('active-preview', !currentUserIsAdmin);
  }
  var adminBtn = document.getElementById('admin-panel-btn');
  if (adminBtn) {
    adminBtn.textContent = currentUserIsAdmin ? '⚙ 管理者パネルを開く' : '🔑 管理者に戻る';
    adminBtn.classList.toggle('admin-btn-preview-mode', !currentUserIsAdmin);
  }
  if (currentLanguage) { renderCareer(); renderList(); }
}

async function adminSetPremium(isPremium) {
  if (!currentUserIsAdmin) return;
  var emailEl = document.getElementById('admin-email-input');
  var msgEl   = document.getElementById('admin-msg');
  var btnGive = document.getElementById('admin-give-btn');
  var btnTake = document.getElementById('admin-take-btn');
  if (!emailEl || !msgEl || !btnGive || !btnTake) return;
  var email = emailEl.value.trim();
  if (!email) { msgEl.textContent = '❌ メールアドレスを入力してください'; return; }

  btnGive.disabled = true; btnTake.disabled = true;
  msgEl.textContent = '処理中...';

  try {
    var session = await _supabase.auth.getSession();
    var token = session?.data?.session?.access_token;
    if (!token) { msgEl.textContent = '❌ セッションが切れています。再ログインしてください'; btnGive.disabled = false; btnTake.disabled = false; return; }
    var res = await fetch('/api/admin-grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ targetEmail: email, isPremium: isPremium })
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

// ===== 汎用トースト =====
var _toastTimer = null;
function showToast(message, typeOrDuration) {
  if (_toastTimer) { clearTimeout(_toastTimer); }
  var existing = document.querySelector('.app-toast');
  if (existing) existing.remove();
  var el = document.createElement('div');
  var isError = typeOrDuration === 'error';
  var dur = typeof typeOrDuration === 'number' ? typeOrDuration : 2800;
  el.className = 'app-toast' + (isError ? ' error' : '');
  el.textContent = message;
  document.body.appendChild(el);
  _toastTimer = setTimeout(function() { el.remove(); _toastTimer = null; }, dur);
}

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
  if (!btn) return;
  var orig = btn.textContent;
  btn.textContent = '処理中...';
  btn.disabled = true;
  try {
    var checkoutHeaders = { 'Content-Type': 'application/json' };
    if (_supabase) {
      var _cs = await _supabase.auth.getSession();
      var _ct = _cs.data && _cs.data.session && _cs.data.session.access_token;
      if (_ct) checkoutHeaders['Authorization'] = 'Bearer ' + _ct;
    }
    var res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: checkoutHeaders,
      body: JSON.stringify({ email: currentUser.email, userId: currentUser.id })
    });
    var data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || '決済の開始に失敗しました');
    }
  } catch(e) {
    showToast('エラー: ' + e.message, 'error');
    btn.textContent = orig;
    btn.disabled = false;
  }
}

// ===== ブラウザ履歴の復元 =====

function startApp() {
  playLangSelect();
  lsSet('app_started', '1');
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
    setActiveTab(state.fromContest ? 'contest' : 'problems');
    renderDetail(state.id);
    showPage('detail');
  } else if (state.page === 'guide') {
    setActiveTab('guide');
    renderGuide();
    showPage('guide');
  } else if (state.page === 'intro') {
    setActiveTab('intro');
    renderIntro();
    showPage('intro');
  } else if (state.page === 'textbook') {
    setActiveTab('textbook');
    renderTextbook();
    showPage('textbook');
  } else if (state.page === 'mission-list') {
    setActiveTab('missions');
    renderMissionList();
    showPage('mission-list');
  } else if (state.page === 'mission-detail') {
    setActiveTab('missions');
    renderMissionDetail(state.id);
    showPage('mission-detail');
  } else if (state.page === 'ranking') {
    setActiveTab('ranking');
    renderRanking();
    showPage('ranking');
  } else if (state.page === 'contest') {
    setActiveTab('contest');
    renderContest();
    showPage('contest');
  } else if (state.page === 'career') {
    setActiveTab('career');
    renderCareer();
    showPage('career');
  } else if (state.page === 'beginner-lang') {
    setActiveTab('intro');
    openBeginnerLang(state.langId);
    showPage('beginner-lang');
  } else if (state.page === 'profile') {
    renderProfile();
    showPage('profile');
  }
}

window.addEventListener('popstate', function(e) {
  restoreState(e.state);
});

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
  if (currentLanguage === 'html') return htmlProblems;
  if (currentLanguage === 'sql') return sqlProblems;
  if (currentLanguage === 'bash') return bashProblems;
  if (currentLanguage === 'regex') return regexProblems;
  if (currentLanguage === 'php') return phpProblems;
  if (currentLanguage === 'dark') return darkProblems;
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
  if (currentLanguage === 'html') return htmlMissions;
  if (currentLanguage === 'sql') return sqlMissions;
  if (currentLanguage === 'bash') return bashMissions;
  if (currentLanguage === 'regex') return regexMissions;
  if (currentLanguage === 'php') return phpMissions;
  if (currentLanguage === 'dark') return [];
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
  if (currentLanguage === 'html') return htmlUnitGuides;
  if (currentLanguage === 'sql') return sqlUnitGuides;
  if (currentLanguage === 'bash') return bashUnitGuides;
  if (currentLanguage === 'regex') return regexUnitGuides;
  if (currentLanguage === 'php') return phpUnitGuides;
  if (currentLanguage === 'dark') return [];
  return unitGuides;
}

function getProgressKey() {
  return (currentLanguage || 'cpp') + '_progress';
}

// 別タブで進捗が更新されたときキャッシュを無効化（上書き消去防止）
window.addEventListener('storage', function(e) {
  if (!e.key) return;
  if (e.key === getProgressKey()) {
    _progressCache = null;
  }
  if (e.key === getMissionProgressKey()) {
    _missionProgressCache = null;
  }
});

function getMissionProgressKey() {
  return (currentLanguage || 'cpp') + '_mission_progress';
}

function getCompiler() {
  if (currentLanguage === 'python') return 'cpython-3.13.8';
  if (currentLanguage === 'javascript') return 'nodejs-head';
  if (currentLanguage === 'ruby') return 'ruby-3.4.9';
  if (currentLanguage === 'typescript') return 'typescript-5.6.2';
  if (currentLanguage === 'kotlin') return 'kotlin';
  if (currentLanguage === 'swift') return 'swift-6.0.1';
  if (currentLanguage === 'java') return 'openjdk-head';
  if (currentLanguage === 'csharp') return 'mono-6.12.0.199';
  if (currentLanguage === 'go') return 'go-1.23.2';
  if (currentLanguage === 'c') return 'gcc-head';
  if (currentLanguage === 'rust') return 'rust-1.82.0';
  if (currentLanguage === 'html') return null;
  if (currentLanguage === 'sql') return 'cpython-3.13.8';
  if (currentLanguage === 'bash') return 'bash';
  if (currentLanguage === 'regex') return 'nodejs-head';
  if (currentLanguage === 'php') return 'php-8.3.12';
  if (currentLanguage === 'dark') return 'cpython-3.13.8';
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
  if (currentLanguage === 'html') return 'ace/mode/html';
  if (currentLanguage === 'sql') return 'ace/mode/python';
  if (currentLanguage === 'bash') return 'ace/mode/sh';
  if (currentLanguage === 'regex') return 'ace/mode/javascript';
  if (currentLanguage === 'php') return 'ace/mode/php';
  if (currentLanguage === 'dark') return 'ace/mode/python';
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
  if (currentLanguage === 'html') {
    if (p) return '<!-- [問題] ' + p.question + ' -->\n<!DOCTYPE html>\n<html lang="ja">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n  <style>\n    /* ここにCSSを書く */\n  </style>\n</head>\n<body>\n  <!-- ここにHTMLを書く -->\n</body>\n</html>\n';
    return '<!DOCTYPE html>\n<html lang="ja">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n</body>\n</html>\n';
  }
  if (currentLanguage === 'sql') {
    if (p) return '# [問題] ' + p.question + '\nimport sqlite3\nconn = sqlite3.connect(\':memory:\')\ncur = conn.cursor()\n\n# ここにコードを書く\n\nconn.close()\n';
    return 'import sqlite3\nconn = sqlite3.connect(\':memory:\')\ncur = conn.cursor()\n\n# ここにSQLを書く\n\nconn.close()\n';
  }
  if (currentLanguage === 'bash') {
    if (p) return '# [問題] ' + p.question + '\n\n# ここにBashスクリプトを書く\n';
    return '#!/bin/bash\n# ここにBashスクリプトを書く\n';
  }
  if (currentLanguage === 'regex') {
    if (p) return '// [問題] ' + p.question + '\n\n// ここにJavaScriptコードを書く\n';
    return '// ここに正規表現のコードを書く\nconst str = "";\nconst re = //;\nconsole.log(re.test(str));\n';
  }
  if (currentLanguage === 'php') {
    if (p) return '<?php\n// [問題] ' + p.question + '\n\n// ここにPHPコードを書く\n';
    return '<?php\n// ここにPHPコードを書く\n';
  }
  if (currentLanguage === 'dark') {
    if (p) return '# [DARK OPS] ' + p.question.split('\n')[0] + '\n\n# ここにコードを書く\n';
    return '# ここにコードを書く\n';
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
  if (currentLanguage === 'html') return 'HTML/CSS';
  if (currentLanguage === 'sql') return 'SQL';
  if (currentLanguage === 'bash') return 'Bash';
  if (currentLanguage === 'regex') return 'Regex';
  if (currentLanguage === 'php') return 'PHP';
  if (currentLanguage === 'dark') return '☠ DARK OPS';
  return 'C++';
}

// ===== 進捗管理 (Supabase 対応) =====

function _getLocalProgress() {
  return lsGetJSON(getProgressKey(), []);
}

function loadProgress() {
  if (_progressCache !== null) return _progressCache.slice();
  _progressCache = _getLocalProgress();
  return _progressCache.slice();
}

function saveProgress(id) {
  var progress = loadProgress();
  if (progress.includes(id)) return;
  progress.push(id);
  _progressCache = progress;
  lsSet(getProgressKey(), JSON.stringify(progress));
  clearWrongAnswer(id);
  if (currentUser && _supabase) {
    _supabase.from('progress').upsert({
      user_id: currentUser.id,
      language: currentLanguage || 'cpp',
      problem_id: id
    }).then(function(r) {
      if (r && r.error) showToast('⚠ クリア情報の同期に失敗しました。ネットワークを確認してください。');
    }).catch(function() {
      showToast('⚠ クリア情報の同期に失敗しました。ネットワークを確認してください。');
    });
    var _p = getProblems().find(function(x) { return x.id === id; });
    var _xp = _p ? (RANK_EXP[(_p.rank || '').toLowerCase()] || 15) : 15;
    syncUserStats(_xp, currentLanguage || 'cpp');
  }
  checkLevelUp(); // EXP・レベルアップ判定

  // デイリーチャレンジ達成チェック
  var dc = getDailyChallenge();
  if (dc && dc.id === id && !isDailyChallengeCleared()) {
    markDailyChallengeCleared();
    checkLevelUp();
    showToast('🎯 デイリーチャレンジ達成！ +50 XP ボーナス！');
    renderList(); // バッジ更新
  }
}

function removeProgress(id) {
  var progress = loadProgress().filter(function(x) { return x !== id; });
  _progressCache = progress;
  lsSet(getProgressKey(), JSON.stringify(progress));
  if (currentUser && _supabase) {
    _supabase.from('progress')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('language', currentLanguage || 'cpp')
      .eq('problem_id', id)
      .then(function(r) {
        if (r.error) showToast('⚠ サーバーとの同期に失敗しました。ネットワークを確認してください。');
      })
      .catch(function() { showToast('⚠ サーバーとの同期に失敗しました。ネットワークを確認してください。'); });
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
    lsSet(getProgressKey(), JSON.stringify(merged));
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
  checkTitanTheme();
}

// ===== 画面切り替え =====

function showPage(name) {
  // 問題/ミッション詳細を離れるときに学習タイマーを保存
  stopStudyTimer();
  // 詳細ページ以外ではタイトルをリセット
  if (name !== 'detail') document.title = 'CODE STEP';
  // コンテスト以外に移動したらカウントダウンを停止
  if (name !== 'contest' && _contestCdTimer) { clearInterval(_contestCdTimer); _contestCdTimer = null; }
  // ページ遷移時にクリアエフェクトを即時消去
  var _ce = document.getElementById('clear-effect');
  if (_ce) _ce.classList.add('hidden');
  var _mce = document.getElementById('mission-clear-effect');
  if (_mce) _mce.classList.add('hidden');
  // 全ページを非表示にしてから対象だけ表示
  ["page-landing", "page-lang", "page-list", "page-detail", "page-guide",
   "page-mission-list", "page-mission-detail", "page-profile", "page-textbook", "page-ranking", "page-contest", "page-career", "page-intro", "page-beginner-lang"].forEach(function(id) {
    document.getElementById(id).classList.add("hidden");
  });
  var _pageEl = document.getElementById("page-" + name);
  _pageEl.classList.remove("hidden");
  _pageEl.classList.remove("page-enter");
  void _pageEl.offsetWidth;
  _pageEl.classList.add("page-enter");
  // スクリーンリーダー向けフォーカス移動
  var _h = _pageEl.querySelector('h1,h2,h3,[tabindex="-1"]');
  if (_h) { _h.setAttribute('tabindex', '-1'); _h.focus({ preventScroll: true }); }

  // 言語選択画面ではRANKINGタブのみ表示
  if (name === 'lang') {
    document.getElementById('nav-tabs').classList.remove('hidden');
    ['problems','missions','guide','intro','textbook','contest'].forEach(function(t) {
      var el = document.getElementById('tab-' + t);
      if (el) el.classList.add('hidden');
    });
    document.getElementById('progress-text').classList.add('hidden');
    document.getElementById('progress-bar-wrap').classList.add('hidden');
  } else {
    ['problems','missions','guide','intro','textbook','contest'].forEach(function(t) {
      var el = document.getElementById('tab-' + t);
      if (el) el.classList.remove('hidden');
    });
  }
  // 詳細ページから一覧などに戻るときスクロール位置をトップにリセット
  if (name !== 'detail' && name !== 'mission-detail') {
    window.scrollTo(0, 0);
  }
  // 問題・ミッション詳細では学習タイマーを開始
  if (name === 'detail' || name === 'mission-detail') {
    startStudyTimer();
  }
}

// ===== 進捗バーの更新 =====

function updateProgressDisplay() {
  var count = loadProgress().length;
  var total = getProblems().length;
  var langKey = currentLanguage || 'cpp';
  var sd   = calcLangStrengthData(langKey, getProblems());
  var rank = getLangStrengthRank(sd.pct, countTitanLangs());

  document.getElementById('progress-text').innerHTML =
    count + ' / ' + total + ' クリア' +
    '&nbsp;&nbsp;<span style="color:' + rank.color + ';letter-spacing:0.12em">' +
      '◆ 実力 ' + sd.pct + '% &nbsp;' + rank.name +
    '</span>';

  var bar = document.getElementById('progress-bar');
  bar.style.width      = sd.pct + '%';
  bar.style.background = 'linear-gradient(90deg,' + rank.color + '99,' + rank.color + ')';
  bar.style.boxShadow  = '0 0 12px ' + rank.color + '88';
}

// ===== 問題カード hover preview tooltip =====

var _cardTooltipEl = null;

function _getCardTooltip() {
  if (!_cardTooltipEl) {
    _cardTooltipEl = document.createElement('div');
    _cardTooltipEl.id = 'card-preview-tooltip';
    document.body.appendChild(_cardTooltipEl);
  }
  return _cardTooltipEl;
}

function _showCardTooltip(card, p) {
  var tip = _getCardTooltip();
  var raw = (p.question || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  var preview = raw.length > 110 ? raw.substring(0, 110) + '…' : raw;

  tip.innerHTML =
    '<div class="cpt-rank rank-badge rank-' + (p.rank || 'rookie').toLowerCase() + '" style="display:inline-block;margin-bottom:7px">' + escapeHtml(p.rank || 'ROOKIE') + '</div>' +
    '<div class="cpt-title">' + escapeHtml(p.title) + '</div>' +
    (preview ? '<div class="cpt-text">' + escapeHtml(preview) + '</div>' : '');

  var rect   = card.getBoundingClientRect();
  var tipW   = 272;
  var left   = rect.right + 14;
  var top    = rect.top + rect.height / 2 - 56;

  if (left + tipW > window.innerWidth - 8) left = rect.left - tipW - 14;
  top = Math.max(8, Math.min(top, window.innerHeight - 140));

  tip.style.left = left + 'px';
  tip.style.top  = top  + 'px';
  tip.classList.add('visible');
}

function _hideCardTooltip() {
  if (_cardTooltipEl) _cardTooltipEl.classList.remove('visible');
}

// ===== 問題一覧の描画（単元グループ） =====

function renderList() {
  const list = document.getElementById("problem-list");
  if (!list) return;
  list.innerHTML = "";

  // 表示密度適用
  _applyListDensity();

  // ストリークリマインダーチェック
  _checkStreakReminder();

  // ストリークウィジェット（2日以上で表示）
  var _localDays = lsGetJSON('login_days', []);
  var _sw = calcStreak(_localDays);
  var streakWidgetHtml = '';
  if (_sw.current >= 2) {
    var _todayKey2 = getTodayJST();
    var _studiedToday = (lsGetJSON('study_log', {})[_todayKey2] || 0) > 0;
    streakWidgetHtml =
      '<div class="streak-widget">' +
        '<span class="streak-widget-fire">🔥</span>' +
        '<div class="streak-widget-body">' +
          '<div class="streak-widget-num">' + _sw.current + ' 日連続</div>' +
          '<div class="streak-widget-label">STREAK</div>' +
        '</div>' +
        (_studiedToday ? '<span class="streak-widget-today">✓ 今日達成</span>' : '') +
        '<div class="streak-widget-best">最長 <strong>' + _sw.best + '</strong> 日<br>累計 ' + _sw.total + ' 日</div>' +
      '</div>';
  }

  // ランク別進捗 + ランダム問題ボタン + 密度切り替え + 目標バー
  var topBarEl = document.createElement('div');
  topBarEl.className = 'list-top-bar';
  topBarEl.innerHTML =
    streakWidgetHtml +
    '<div class="list-top-row">' +
      '<button class="random-prob-btn" onclick="goToRandomProblem()" title="未クリアからランダムに選ぶ">🎲 ランダム問題</button>' +
      '<button id="density-toggle-btn" class="density-btn" onclick="toggleListDensity()">' + (_listDensity === 'compact' ? '☷ 標準' : '☰ コンパクト') + '</button>' +
    '</div>' +
    '<div class="daily-goal-wrap">' +
      '<div class="daily-goal-label">今日の目標</div>' +
      '<div class="daily-goal-track"><div id="daily-goal-bar" class="daily-goal-fill"></div></div>' +
      '<span id="daily-goal-text" class="daily-goal-text"></span>' +
      '<button class="goal-edit-btn" onclick="_editDailyGoal()" title="目標を変更">✎</button>' +
    '</div>' +
    '<div id="streak-risk-banner" class="streak-risk-banner hidden"></div>';
  list.appendChild(topBarEl);
  _renderDailyGoalBar();

  // ランク別進捗ゲージ（フィルターなし時のみ）
  if (!_filterQuery && !_filterRank && !_filterBookmark && !_filterWrong && !_filterUnsolved && !_careerFilter) {
    var rpEl = document.createElement('div');
    rpEl.innerHTML = _buildRankProgressHTML();
    list.appendChild(rpEl.firstElementChild);
  }

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

  // コンテスト問題セット（カードバッジ用）
  var _contestProbIds = new Set(getWeeklyContestProblems().map(function(p) { return p.id; }));

  // デイリーチャレンジバナー
  var dc = getDailyChallenge();
  if (dc) {
    var dcCleared = isDailyChallengeCleared() || isLearned(dc.id);
    var dcBanner = document.createElement('div');
    dcBanner.className = 'daily-challenge-banner' + (dcCleared ? ' dc-cleared' : '');
    dcBanner.innerHTML =
      '<div class="dc-header">' +
        '<span class="dc-icon">🎯</span>' +
        '<span class="dc-label">TODAY\'S CHALLENGE</span>' +
        (dcCleared ? '<span class="dc-done">CLEARED ✔</span>' : '<span class="dc-bonus">+50 XP BONUS</span>') +
      '</div>' +
      '<div class="dc-body">' +
        '<span class="dc-num">#' + String(dc.id).padStart(2, '0') + '</span>' +
        '<span class="dc-title">' + escapeHtml(dc.title) + '</span>' +
        '<span class="rank-badge rank-' + (dc.rank || 'rookie').toLowerCase() + '">' + escapeHtml(dc.rank || 'ROOKIE') + '</span>' +
      '</div>';
    dcBanner.addEventListener('click', function() {
      playItemSelect();
      history.pushState({ page: 'detail', lang: currentLanguage, id: dc.id }, '');
      renderDetail(dc.id);
      showPage('detail');
    });
    list.appendChild(dcBanner);
  }

  // 教本バナー（初心者向け）
  if (langTextbooks[currentLanguage]) {
    var tb = langTextbooks[currentLanguage];
    var tbBanner = document.createElement('div');
    tbBanner.className = 'textbook-list-banner';
    tbBanner.innerHTML =
      '<span class="textbook-banner-icon">' + tb.emoji + '</span>' +
      '<span class="textbook-banner-text"><strong>' + tb.name + ' 入門ガイド</strong> — まずはここから！基礎文法・パターン・Tipsをまとめています</span>' +
      '<button class="textbook-banner-btn" onclick="switchTab(\'textbook\')">📖 見る</button>';
    list.appendChild(tbBanner);
  }

  // キャリアフィルターバナー
  if (_careerFilter) {
    var cfBanner = document.createElement('div');
    cfBanner.className = 'career-filter-banner';
    cfBanner.style.borderColor = _careerFilter.careerColor + '88';
    cfBanner.innerHTML =
      '<span class="cf-icon">' + _careerFilter.careerIcon + '</span>' +
      '<span class="cf-label"><strong>' + escapeHtml(_careerFilter.careerTitle) + '</strong> 向けピックアップ（' + _careerFilter.ids.size + '問）</span>' +
      '<button class="cf-clear-btn" onclick="clearCareerFilter()">✕ 解除</button>';
    list.appendChild(cfBanner);
  }

  // フィルター適用
  var allProblems = getProblems();
  if (_careerFilter || _filterQuery || _filterRank || _filterBookmark || _filterWrong || _filterUnsolved) {
    allProblems = allProblems.filter(function(p) {
      var matchCareer   = !_careerFilter   || _careerFilter.ids.has(p.id);
      var matchRank     = !_filterRank     || p.rank === _filterRank;
      var matchQuery    = !_filterQuery    || p.title.toLowerCase().indexOf(_filterQuery) !== -1 || (p.question && p.question.toLowerCase().indexOf(_filterQuery) !== -1);
      var matchBookmark = !_filterBookmark || isBookmarked(p.id);
      var matchWrong    = !_filterWrong    || isWrongAnswer(p.id);
      var matchUnsolved = !_filterUnsolved || !isLearned(p.id);
      return matchCareer && matchRank && matchQuery && matchBookmark && matchWrong && matchUnsolved;
    });
  }

  // 単元ごとにグループ化
  var units = {};
  var unitOrder = [];
  allProblems.forEach(function(p) {
    if (!units[p.unit]) {
      units[p.unit] = [];
      unitOrder.push(p.unit);
    }
    units[p.unit].push(p);
  });

  if (unitOrder.length === 0) {
    var emptyEl = document.createElement('div');
    emptyEl.id = 'list-filter-empty';
    emptyEl.textContent = _filterBookmark ? 'ブックマークした問題はありません' :
      _filterWrong    ? '要復習の問題はありません（全問正解済み！）' :
      _filterUnsolved ? '🎉 この言語の問題を全てクリアしました！' :
      '「' + (_filterQuery || _filterRank) + '」に一致する問題が見つかりません';
    list.appendChild(emptyEl);
    return;
  }

  // アクティブフィルターピル
  var _activePills = [];
  if (_filterQuery)    _activePills.push({ label: '🔍 ' + escapeHtml(_filterQuery.length > 15 ? _filterQuery.substring(0,15)+'…' : _filterQuery), type: 'query' });
  if (_filterRank)     _activePills.push({ label: '🏅 ' + _filterRank, type: 'rank' });
  if (_filterBookmark) _activePills.push({ label: '🔖 ブックマーク', type: 'bookmark' });
  if (_filterWrong)    _activePills.push({ label: '❌ 要復習', type: 'wrong' });
  if (_filterUnsolved) _activePills.push({ label: '⬜ 未クリア', type: 'unsolved' });
  if (_activePills.length > 0) {
    var pillsWrap = document.createElement('div');
    pillsWrap.className = 'filter-pills';
    _activePills.forEach(function(fp) {
      var pill = document.createElement('span');
      pill.className = 'filter-pill';
      pill.innerHTML = '<span class="fp-label">' + fp.label + '</span><button class="fp-x" onclick="clearFilter(\'' + fp.type + '\')" title="解除">✕</button>';
      pillsWrap.appendChild(pill);
    });
    list.appendChild(pillsWrap);
  }

  // 要復習モードバナー
  if (_filterWrong) {
    var wrongCount = allProblems.length;
    var reviewBanner = document.createElement('div');
    reviewBanner.className = 'review-mode-banner';
    reviewBanner.innerHTML =
      '<span class="rmb-icon">📚</span>' +
      '<span class="rmb-label"><strong>復習モード</strong>  ' + wrongCount + '問を再挑戦しよう</span>' +
      '<button class="rmb-exit-btn" onclick="clearFilter(\'wrong\')">✕ 終了</button>';
    list.appendChild(reviewBanner);
  }

  // 「続きから」ボタン：フィルターなし・未クリア問題がある場合のみ表示
  if (!_filterQuery && !_filterRank && !_filterBookmark && !_filterWrong && !_filterUnsolved && !_careerFilter) {
    var firstUnsolved = allProblems.find(function(p) { return !isLearned(p.id); });
    if (firstUnsolved) {
      var resumeEl = document.createElement('button');
      resumeEl.className = 'resume-btn';
      resumeEl.innerHTML = '▶ 続きから ： <span class="resume-title">' + escapeHtml(firstUnsolved.title) + '</span><span class="resume-rank rank-' + (firstUnsolved.rank||'rookie').toLowerCase() + '">' + (firstUnsolved.rank||'ROOKIE') + '</span>';
      resumeEl.onclick = function() {
        history.pushState({ page: 'detail', lang: currentLanguage, id: firstUnsolved.id }, '');
        renderDetail(firstUnsolved.id);
        showPage('detail');
      };
      list.appendChild(resumeEl);
    }
  }

  var _cardIdx = 0;
  unitOrder.forEach(function(unitName) {
    // 単元ヘッダー
    var unitProblems = units[unitName];
    var clearedCount = unitProblems.filter(function(p) { return isLearned(p.id); }).length;
    var lastRank = unitProblems[unitProblems.length - 1].rank;
    var topRank = lastRank ? lastRank.toLowerCase() : 'rookie';
    var header = document.createElement("div");
    header.className = "unit-header";
    header.innerHTML =
      '<span class="unit-header-name">' + escapeHtml(unitName) + '</span>' +
      '<span class="unit-header-meta">' +
        '<span class="unit-header-count rank-' + topRank + '">' + clearedCount + ' / ' + unitProblems.length + '</span>' +
      '</span>';
    list.appendChild(header);

    // 問題カード
    units[unitName].forEach(function(p) {
      var learned = isLearned(p.id);
      var isLocked = isPremiumRequired(p.rank) && !currentUserIsPremium;
      var isDailyCard   = dc && dc.id === p.id;
      var isContestCard = _contestProbIds.has(p.id);
      var card = document.createElement("div");
      card.className = "problem-card rank-card-" + (p.rank || 'rookie').toLowerCase() +
        (learned ? " learned" : "") +
        (isLocked ? " premium-locked-card" : "") +
        (isDailyCard ? " daily-challenge-card" : "");
      card.style.animationDelay = Math.min(_cardIdx * 0.03, 0.24) + 's';
      _cardIdx++;

      var bookmarked = isBookmarked(p.id);
      var isWeak = isAutoWeak(p.id);
      card.innerHTML =
        '<div class="card-left">' +
          '<span class="card-num">' + String(p.id).padStart(2, '0') + '</span>' +
          '<span class="problem-title">' + escapeHtml(p.title) + '</span>' +
          (isDailyCard   ? '<span class="dc-card-badge">🎯 TODAY</span>' : '') +
          (isContestCard ? '<span class="contest-card-badge">🏆 CONTEST</span>' : '') +
          (isWeak && !learned ? '<span class="weak-badge">🔥 苦手</span>' : '') +
        '</div>' +
        '<div class="card-right">' +
          '<span class="rank-badge rank-' + (p.rank || 'rookie').toLowerCase() + '">' + escapeHtml(p.rank || 'ROOKIE') + '</span>' +
          (isLocked
            ? '<span class="premium-lock-icon">🔒</span>'
            : '<span class="badge ' + (learned ? "" : "not-learned") + '">' +
                (learned ? "✔" : "—") +
              '</span>'
          ) +
          '<button class="card-bookmark-btn' + (bookmarked ? ' bookmarked' : '') + '" title="ブックマーク" data-pid="' + p.id + '">🔖</button>' +
        '</div>';

      // ブックマークボタンは伝播を止めてカード遷移と分離
      var _bBtn = card.querySelector('.card-bookmark-btn');
      if (_bBtn) {
        (function(_id) {
          _bBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleBookmark(_id);
          });
        })(p.id);
      }

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

      // hover preview (タッチデバイスでは非表示はCSSで制御)
      if (p.question) {
        card.addEventListener('mouseenter', function() { _showCardTooltip(card, p); });
        card.addEventListener('mouseleave', _hideCardTooltip);
      }

      list.appendChild(card);
    });

  });

  updateProgressDisplay();
}

// ===== ヒント・解説の開閉 =====

function toggleSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const isNowHidden = el.classList.toggle("hidden");
  // data-toggle-for 属性でボタンを検索（CSSセレクタの特殊文字問題を回避）
  var btn = document.querySelector('[data-toggle-for="' + sectionId + '"]');
  if (btn && btn.dataset.open && btn.dataset.close) {
    btn.textContent = isNowHidden ? btn.dataset.open : btn.dataset.close;
  }
}

// ===== 特殊文字のエスケープ =====

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===== 問題詳細の描画 =====

function renderDetail(id) {
  const p = getProblems().find(function(x) { return x.id === id; });
  if (!p) {
    var dc = document.getElementById('detail-content');
    if (dc) dc.innerHTML = '<div class="detail-not-found"><p>問題が見つかりません。</p><button class="toggle-btn" onclick="history.back()">← 戻る</button></div>';
    document.title = 'CODE STEP';
    return;
  }
  document.title = p.title + ' | CODE STEP';
  const learned = isLearned(p.id);
  const effectiveHighRanks = currentUserIsPremium ? HIGH_RANKS_PREMIUM : HIGH_RANKS;

  // 既存エディタのコードを保存してから破棄
  var prevProblemId = currentProblemId;
  var prevLang = currentProblemId !== null ? (aceEditor ? aceEditor.session.$modeId : null) : null;
  var savedCode = aceEditor ? aceEditor.getValue() : null;
  if (aceEditor) { aceEditor.destroy(); aceEditor = null; }
  currentProblemId = id;
  currentEditorMode = 'scratch';  // モードをリセット
  editorDirty = false;  // 新しい問題ではリセット
  _judging = false;     // 前の問題のAI判定が残っていてもリセット

  // 前後の問題を計算
  var allProbs = getProblems();
  var probIdx  = allProbs.findIndex(function(x) { return x.id === id; });
  var prevP    = probIdx > 0 ? allProbs[probIdx - 1] : null;
  var nextP    = probIdx < allProbs.length - 1 ? allProbs[probIdx + 1] : null;
  // ユニット内位置
  var unitProbs   = allProbs.filter(function(x) { return x.unit === p.unit; });
  var unitPos     = unitProbs.findIndex(function(x) { return x.id === id; }) + 1;
  var unitTotal   = unitProbs.length;
  var unitCleared = unitProbs.filter(function(x) { return isLearned(x.id); }).length;

  const detail = document.getElementById("detail-content");
  detail.innerHTML =
    '<div class="detail-split">' +
    '<div class="detail-left">' +
    '<div class="detail-meta">' +
      '<div class="detail-nav">' +
        (prevP
          ? '<button class="detail-nav-btn detail-nav-prev" onclick="goToDetailProblem(' + prevP.id + ')" title="' + escapeHtml(prevP.title) + '">← 前<span class="nav-kbd">◀</span></button>'
          : '<span class="detail-nav-btn detail-nav-disabled">←</span>') +
        '<div class="detail-unit-pos">' +
          '<span class="detail-unit-name">' + escapeHtml(p.unit) + '</span>' +
          '<span class="detail-unit-count">' + unitPos + ' / ' + unitTotal + '</span>' +
        '</div>' +
        (nextP
          ? '<button class="detail-nav-btn detail-nav-next" onclick="goToDetailProblem(' + nextP.id + ')" title="' + escapeHtml(nextP.title) + '">次 →<span class="nav-kbd">▶</span></button>'
          : '<span class="detail-nav-btn detail-nav-disabled">→</span>') +
      '</div>' +
      '<div class="detail-meta-right">' +
        (function() { var t = _getProblemTime(p.id); return t > 10 ? '<span class="study-time-badge">⏱ ' + _formatTime(t) + '</span>' : ''; })() +
        (langTextbooks[currentLanguage]
          ? '<button class="detail-textbook-btn" onclick="switchTab(\'textbook\')">📖 ' + escapeHtml(langTextbooks[currentLanguage].name) + ' 入門ガイド</button>'
          : '') +
        '<button class="detail-bookmark-btn' + (isBookmarked(p.id) ? ' bookmarked' : '') + '" id="detail-bm-btn" onclick="toggleDetailBookmark(' + p.id + ')" title="ブックマーク">' +
          (isBookmarked(p.id) ? '🔖' : '☆') +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="detail-unit-bar">' +
      '<div class="detail-unit-fill" style="width:' + Math.round(unitCleared / unitTotal * 100) + '%"></div>' +
    '</div>' +
    '<h2>' + escapeHtml(p.title) + '</h2>' +
    '<span class="rank-badge rank-' + p.rank.toLowerCase() + ' rank-badge-lg" style="display:inline-block;margin-bottom:18px;">' + escapeHtml(p.rank) + '</span>' +

    '<div class="section">' +
      '<h3>問題</h3>' +
      '<p>' + escapeHtml(p.question) + '</p>' +
    '</div>' +

    '<div class="section">' +
      '<button class="toggle-btn toggle-hint" onclick="toggleSection(\'hint-' + p.id + '\')" data-toggle-for="hint-' + p.id + '" data-open="💡 ヒントを見る" data-close="💡 ヒントを閉じる">💡 ヒントを見る</button>' +
      '<div id="hint-' + p.id + '" class="hidden toggle-content">' +
        '<p>' + escapeHtml(p.hint) + '</p>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      (effectiveHighRanks.indexOf(p.rank) >= 0 && !learned
        ? '<p class="high-rank-lock">🔒 正解すると模範解答が表示されます</p>'
        : '<button class="toggle-btn toggle-answer" onclick="toggleSection(\'answer-' + p.id + '\')" data-toggle-for="answer-' + p.id + '" data-open="📋 正解例を見る" data-close="📋 正解例を閉じる">📋 正解例を見る</button>' +
          '<div id="answer-' + p.id + '" class="hidden toggle-content">' +
            '<pre><code>' + escapeHtml(p.answer) + '</code></pre>' +
          '</div>') +
    '</div>' +

    '<div class="section">' +
      '<button class="toggle-btn toggle-explain" onclick="toggleSection(\'explanation-' + p.id + '\')" data-toggle-for="explanation-' + p.id + '" data-open="📖 解説を見る" data-close="📖 解説を閉じる">📖 解説を見る</button>' +
      '<div id="explanation-' + p.id + '" class="hidden toggle-content">' +
        '<p>' + escapeHtml(p.explanation) + '</p>' +
      '</div>' +
    '</div>' +
    '</div>' +  // close detail-left
    '<div class="detail-right">' +

    '<div class="section">' +
      '<div class="editor-mode-bar">' +
        '<button id="mode-zero"    class="mode-btn"        onclick="editorZero()">⬜ ゼロから</button>' +
        '<button id="mode-scratch" class="mode-btn active" onclick="editorScratch()">📋 テンプレート</button>' +
        '<button id="mode-fill"   class="mode-btn"        onclick="editorFill()">📝 穴埋め</button>' +
        '<button class="mode-btn basicform-btn"            onclick="showBasicForm()">📖 基本形</button>' +
        '<div class="editor-font-ctrl">' +
          '<button class="font-btn" onclick="editorFontSmaller()" title="文字を小さく">A-</button>' +
          '<span id="editor-font-size-display" class="font-size-disp">' + _editorFontSize + 'px</span>' +
          '<button class="font-btn" onclick="editorFontLarger()" title="文字を大きく">A+</button>' +
        '</div>' +
      '</div>' +
      '<div id="draft-badge" class="draft-badge hidden">📝 下書きから復元</div>' +
      '<div id="code-editor" class="code-editor-ace"></div>' +
      '<div class="editor-options">' +
        '<label class="stdin-label">標準入力（cin用）：</label>' +
        '<input id="stdin-input" class="stdin-input" type="text" placeholder="例: 5">' +
      '</div>' +
      '<div class="run-btn-row">' +
        '<button class="run-btn" title="Ctrl+Enter で実行" onclick="runCode()">▶ 実行する<span class="run-btn-kbd">Ctrl+↵</span></button>' +
        '<button class="copy-code-btn" onclick="copyEditorCode()" title="コードをコピー">📋</button>' +
        '<button id="speed-mode-btn" class="speed-mode-btn" onclick="toggleSpeedMode()" title="スピードチャレンジ（5分以内に解く）">⚡ スピード</button>' +
        '<span id="speed-timer-display" class="speed-timer"></span>' +
      '</div>' +
      '<div id="output-area" class="hidden">' +
        '<p class="output-label">実行結果：<span id="exec-time-badge" class="exec-time-badge hidden"></span></p>' +
        '<pre id="output-text"></pre>' +
      '</div>' +
      '<div id="judge-area" class="hidden"></div>' +
      (effectiveHighRanks.indexOf(p.rank) < 0
        ? '<button class="ai-feedback-btn" onclick="getAIFeedback(' + p.id + ')">🤖 AIにフィードバックをもらう</button>' +
          '<div id="ai-feedback-area" class="hidden">' +
            '<p class="output-label">// AI FEEDBACK</p>' +
            '<div id="ai-feedback-text" class="ai-feedback-text"></div>' +
          '</div>'
        : '') +
    '</div>' +

    '<div class="section explain-section">' +
      '<div class="explain-btns">' +
        (effectiveHighRanks.indexOf(p.rank) < 0
          ? '<button class="toggle-btn explain-open-btn" onclick="explainCode(' + p.id + ')">🔍 コードを一行ずつ解説する</button>'
          : '') +
        '<button class="toggle-btn syntax-menu-btn" onclick="showSyntaxMenu()">📚 書き方メニュー</button>' +
      '</div>' +
      (effectiveHighRanks.indexOf(p.rank) < 0
        ? '<div id="explain-area-' + p.id + '" class="explain-area hidden"></div>'
        : '') +
    '</div>' +

    '<div class="section golf-section">' +
      '<div class="golf-header">' +
        '<span class="golf-title">⛳ CODE GOLF</span>' +
        '<span class="golf-live">現在: <span id="golf-counter-' + p.id + '">0</span> 文字</span>' +
      '</div>' +
      '<div id="golf-board-' + p.id + '" class="golf-board"><span class="golf-loading">読込中...</span></div>' +
      (currentUser
        ? '<button class="golf-submit-btn" onclick="submitAndRefreshGolf(' + p.id + ')">⛳ このコードを提出する</button>'
        : '<p class="golf-login-hint">ログインするとランキングに参加できます</p>'
      ) +
    '</div>' +

    '<div class="section">' +
      (learned
        ? '<button id="learn-btn" class="learn-btn learned" onclick="toggleLearned(' + p.id + ')">✔ CLEARED  ／  クリックで取り消す</button>' +
          (nextP
            ? '<button class="next-problem-btn" onclick="goToDetailProblem(' + nextP.id + ')">次の問題へ : ' + escapeHtml(nextP.title) + ' →</button>'
            : '<div class="all-cleared-hint">🎉 このランクの問題を全てクリアしました！</div>')
        : '<p class="manual-clear-hint">実行して自動判定されます ／ <button class="manual-clear-link" onclick="toggleLearned(' + p.id + ')">手動でクリア</button></p>'
      ) +
    '</div>' +
    '<div class="section report-section">' +
      '<button class="report-btn" data-pid="' + p.id + '" data-ptitle="' + escapeHtml(p.title) + '" onclick="openReportModal(+this.dataset.pid, this.dataset.ptitle)">⚑ 問題の誤りを報告</button>' +
    '</div>' +
    '</div>' +  // close detail-right

    // ===== メモパネル (detail-left の下部、全幅) =====
    '</div>' +  // close detail-split
    '<div class="problem-note-panel">' +
      '<div class="pnp-header">📝 メモ<span class="pnp-sub">（自分だけのノート）</span></div>' +
      '<textarea id="problem-note-' + p.id + '" class="problem-note-area" placeholder="考え方・詰まったポイント・次回のヒントなど自由に...">' + escapeHtml(getNote(p.id)) + '</textarea>' +
      '<button class="pnp-save-btn" onclick="saveNote(' + p.id + ')">保存</button>' +
    '</div>'; // close

  // 別の問題に移動した場合、または言語が変わった場合はリセット
  var langChanged = prevLang !== null && prevLang !== getAceMode();
  var _draft = _loadDraft(id);
  var initCode = (prevProblemId !== null && (prevProblemId !== id || langChanged))
    ? (_draft || getStarterCode())
    : (savedCode !== null ? savedCode : (_draft || getStarterCode()));
  _suppressDraftSave = true;
  initAceEditor(initCode);
  _suppressDraftSave = false;
  // 下書きバッジを表示
  var draftBadge = document.getElementById('draft-badge');
  if (draftBadge) draftBadge.classList.toggle('hidden', !_draft);
  // 学習時間スタート
  _problemStartTime = Date.now();
  refreshGolfBoard(p.id);

  var chatToggle = document.getElementById('chat-toggle');
  if (chatToggle) {
    if (effectiveHighRanks.indexOf(p.rank) >= 0) {
      chatToggle.classList.add('hidden');
      document.getElementById('chat-panel').classList.add('hidden');
    } else {
      chatToggle.classList.remove('hidden');
    }
  }
}

// ===== 書き方メニュー =====

var SYNTAX_GUIDE = {
  cpp: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // ここに処理を書く\n    return 0;\n}', n: 'C++プログラムの最小構成' },
    ]},
    { cat: '変数・型', items: [
      { t: 'int（整数）', c: 'int x = 10;', n: '整数型の変数宣言' },
      { t: 'double（小数）', c: 'double pi = 3.14;', n: '浮動小数点型' },
      { t: 'string（文字列）', c: 'string s = "hello";', n: '文字列型' },
      { t: 'bool（真偽値）', c: 'bool flag = true;', n: 'trueまたはfalse' },
      { t: 'const（定数）', c: 'const int MAX = 100;', n: '変更できない定数' },
    ]},
    { cat: '入出力', items: [
      { t: '画面に出力', c: 'cout << "hello" << endl;', n: '文字列を出力して改行' },
      { t: '変数を出力', c: 'cout << x << endl;', n: '変数の値を出力' },
      { t: '複数を出力', c: 'cout << "x=" << x << " y=" << y << endl;', n: '<<で連結して出力' },
      { t: 'キーボードから入力', c: 'cin >> x;', n: '標準入力から変数に読み込む' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if文', c: 'if (x > 0) {\n    // 処理\n}', n: '条件が真のとき実行' },
      { t: 'if-else文', c: 'if (x > 0) {\n    // 正のとき\n} else {\n    // それ以外\n}', n: '条件の真偽で分岐' },
      { t: 'else if', c: 'if (x > 0) {\n} else if (x == 0) {\n} else {\n}', n: '複数条件の分岐' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文（回数指定）', c: 'for (int i = 0; i < 10; i++) {\n    cout << i << endl;\n}', n: '0から9まで10回繰り返す' },
      { t: 'while文', c: 'while (x > 0) {\n    x--;\n}', n: '条件が真の間繰り返す' },
      { t: '範囲for文', c: 'for (int v : vec) {\n    cout << v << endl;\n}', n: 'コンテナの全要素を走査' },
      { t: 'break / continue', c: 'break;    // ループを抜ける\ncontinue; // 次の繰り返しへ', n: 'ループの制御' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'int add(int a, int b) {\n    return a + b;\n}', n: '戻り値の型 関数名(引数) { ... }' },
      { t: '戻り値なし', c: 'void greet() {\n    cout << "hi" << endl;\n}', n: 'voidは戻り値なし' },
      { t: '関数呼び出し', c: 'int result = add(3, 4);', n: '定義した関数を呼び出す' },
    ]},
    { cat: '配列・vector', items: [
      { t: '配列宣言', c: 'int arr[5] = {1, 2, 3, 4, 5};', n: '固定長配列' },
      { t: 'vector宣言', c: 'vector<int> v = {1, 2, 3};', n: '可変長配列（推奨）' },
      { t: '要素追加', c: 'v.push_back(4);', n: 'vectorの末尾に要素を追加' },
      { t: 'サイズ取得', c: 'int n = v.size();', n: '要素数を取得' },
      { t: '要素アクセス', c: 'v[0]  // 先頭要素', n: '[インデックス]でアクセス（0始まり）' },
    ]},
  ],
  python: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: '# ここに処理を書く\nprint("hello")', n: 'Pythonはmain()不要' },
    ]},
    { cat: '変数', items: [
      { t: '変数代入', c: 'x = 10\ns = "hello"\npi = 3.14', n: '型宣言不要。代入で自動判定' },
      { t: '複数代入', c: 'a, b = 1, 2', n: '一度に複数変数に代入' },
      { t: '型変換', c: 'int("42")    # 文字列→整数\nstr(100)     # 整数→文字列\nfloat("3.14")', n: '型を明示的に変換する' },
    ]},
    { cat: '入出力', items: [
      { t: '画面に出力', c: 'print("hello")\nprint(x)', n: '文字列や変数を出力' },
      { t: 'f文字列', c: 'print(f"x = {x}")', n: '変数を文字列に埋め込む' },
      { t: 'キーボードから入力', c: 'x = input("入力: ")\nn = int(input())', n: '文字列で受け取る。数値はint()変換' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if文', c: 'if x > 0:\n    print("正")', n: 'コロンとインデントで構造を表す' },
      { t: 'if-else', c: 'if x > 0:\n    print("正")\nelse:\n    print("0以下")', n: '' },
      { t: 'elif', c: 'if x > 0:\n    pass\nelif x < 0:\n    pass\nelse:\n    pass', n: '複数条件の分岐' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文（range）', c: 'for i in range(10):\n    print(i)', n: '0から9まで10回' },
      { t: 'for文（リスト）', c: 'for v in lst:\n    print(v)', n: 'リストの全要素を走査' },
      { t: 'while文', c: 'while x > 0:\n    x -= 1', n: '条件が真の間繰り返す' },
      { t: 'enumerate', c: 'for i, v in enumerate(lst):\n    print(i, v)', n: 'インデックスと値を同時に取得' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'def add(a, b):\n    return a + b', n: 'defで定義。returnで値を返す' },
      { t: '関数呼び出し', c: 'result = add(3, 4)', n: '' },
      { t: 'デフォルト引数', c: 'def greet(name="世界"):\n    print(f"こんにちは{name}")', n: '' },
    ]},
    { cat: 'リスト', items: [
      { t: 'リスト宣言', c: 'lst = [1, 2, 3, 4, 5]', n: '可変長の要素列' },
      { t: '要素追加・削除', c: 'lst.append(6)\nlst.pop()', n: '末尾に追加 / 末尾を削除' },
      { t: 'スライス', c: 'lst[1:3]  # [2, 3]\nlst[:2]   # 先頭2件\nlst[-1]   # 末尾', n: '部分リストを取り出す' },
      { t: '長さ', c: 'len(lst)', n: 'リストの要素数' },
    ]},
  ],
  javascript: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: '// ここに処理を書く\nconsole.log("hello");', n: 'ブラウザまたはNode.jsで実行' },
    ]},
    { cat: '変数', items: [
      { t: 'const（定数）', c: 'const x = 10;', n: '再代入不可。基本はconstを使う' },
      { t: 'let（変数）', c: 'let count = 0;', n: '再代入可能な変数' },
      { t: 'テンプレートリテラル', c: 'const msg = `x = ${x}`;', n: '変数を文字列に埋め込む' },
    ]},
    { cat: '入出力', items: [
      { t: 'コンソール出力', c: 'console.log("hello", x);', n: '値をコンソールに出力' },
      { t: 'アラート', c: 'alert("メッセージ");', n: 'ブラウザでポップアップ表示' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if文', c: 'if (x > 0) {\n    console.log("正");\n}', n: '' },
      { t: 'if-else', c: 'if (x > 0) {\n} else {\n}', n: '' },
      { t: '三項演算子', c: 'const msg = x > 0 ? "正" : "0以下";', n: '条件 ? 真 : 偽' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文', c: 'for (let i = 0; i < 10; i++) {\n    console.log(i);\n}', n: '' },
      { t: 'forEach', c: 'arr.forEach(v => console.log(v));', n: '配列の全要素を処理' },
      { t: 'for...of', c: 'for (const v of arr) {\n    console.log(v);\n}', n: '配列の要素を順に取り出す' },
    ]},
    { cat: '関数', items: [
      { t: '関数宣言', c: 'function add(a, b) {\n    return a + b;\n}', n: '' },
      { t: 'アロー関数', c: 'const add = (a, b) => a + b;', n: '簡潔な関数の書き方' },
      { t: '非同期関数', c: 'async function fetchData() {\n    const data = await api();\n}', n: 'awaitで非同期処理を待つ' },
    ]},
    { cat: '配列', items: [
      { t: '配列宣言', c: 'const arr = [1, 2, 3];', n: '' },
      { t: 'map', c: 'const doubled = arr.map(x => x * 2);', n: '全要素を変換した新配列' },
      { t: 'filter', c: 'const evens = arr.filter(x => x % 2 === 0);', n: '条件を満たす要素だけ抽出' },
      { t: 'push/pop', c: 'arr.push(4); arr.pop();', n: '末尾への追加・削除' },
    ]},
  ],
  java: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: 'public class Main {\n    public static void main(String[] args) {\n        // ここに処理を書く\n    }\n}', n: 'Javaプログラムの最小構成' },
    ]},
    { cat: '変数・型', items: [
      { t: 'int型', c: 'int x = 10;', n: '整数型' },
      { t: 'double型', c: 'double pi = 3.14;', n: '浮動小数点型' },
      { t: 'String型', c: 'String s = "hello";', n: '文字列型（大文字S）' },
      { t: 'boolean型', c: 'boolean flag = true;', n: '真偽値型' },
    ]},
    { cat: '入出力', items: [
      { t: '画面に出力', c: 'System.out.println("hello");', n: '改行あり出力' },
      { t: '変数を出力', c: 'System.out.println(x);', n: '' },
      { t: 'キーボードから入力', c: 'Scanner sc = new Scanner(System.in);\nint n = sc.nextInt();\nString s = sc.next();', n: 'Scannerで標準入力を読む' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if文', c: 'if (x > 0) {\n    // 処理\n}', n: '' },
      { t: 'if-else', c: 'if (x > 0) {\n} else if (x < 0) {\n} else {\n}', n: '' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文', c: 'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}', n: '' },
      { t: '拡張for文', c: 'for (int v : arr) {\n    System.out.println(v);\n}', n: '配列の全要素を走査' },
      { t: 'while文', c: 'while (x > 0) {\n    x--;\n}', n: '' },
    ]},
    { cat: '関数（メソッド）', items: [
      { t: 'staticメソッド定義', c: 'static int add(int a, int b) {\n    return a + b;\n}', n: 'mainから呼べるstaticメソッド' },
      { t: '戻り値なし', c: 'static void greet() {\n    System.out.println("hi");\n}', n: '' },
      { t: '呼び出し', c: 'int result = add(3, 4);', n: '' },
    ]},
    { cat: '配列・ArrayList', items: [
      { t: '配列宣言', c: 'int[] arr = {1, 2, 3};', n: '固定長配列' },
      { t: 'ArrayList', c: 'ArrayList<Integer> list = new ArrayList<>();\nlist.add(1);\nlist.get(0);', n: '可変長リスト' },
      { t: '長さ', c: 'arr.length        // 配列\nlist.size()       // ArrayList', n: '要素数の取得方法' },
    ]},
  ],
  sql: [
    { cat: 'データ取得（SELECT）', items: [
      { t: '全列取得', c: 'SELECT * FROM users;', n: 'テーブルの全列を取得' },
      { t: '列を指定', c: 'SELECT name, age FROM users;', n: '特定の列だけ取得' },
      { t: '条件で絞り込み', c: 'SELECT * FROM users\nWHERE age >= 20;', n: 'WHEREで行を絞り込む' },
      { t: '並び替え', c: 'SELECT * FROM users\nORDER BY age DESC;', n: 'DESC：降順、ASC：昇順' },
      { t: '件数制限', c: 'SELECT * FROM users LIMIT 10;', n: '取得件数を制限する' },
    ]},
    { cat: '集計', items: [
      { t: '件数カウント', c: 'SELECT COUNT(*) FROM users;', n: '行数を数える' },
      { t: '平均・合計・最大最小', c: 'SELECT AVG(age), SUM(score),\n       MAX(age), MIN(age)\nFROM users;', n: '数値の集計関数' },
      { t: 'グループ集計', c: 'SELECT dept, COUNT(*)\nFROM users\nGROUP BY dept;', n: 'GROUP BYで列の値ごとに集計' },
      { t: '集計条件', c: 'SELECT dept, COUNT(*)\nFROM users\nGROUP BY dept\nHAVING COUNT(*) > 5;', n: 'HAVINGは集計後の絞り込み' },
    ]},
    { cat: 'テーブル結合（JOIN）', items: [
      { t: 'INNER JOIN', c: 'SELECT * FROM orders\nINNER JOIN users\n  ON orders.user_id = users.id;', n: '両テーブルに存在する行だけ結合' },
      { t: 'LEFT JOIN', c: 'SELECT * FROM users\nLEFT JOIN orders\n  ON users.id = orders.user_id;', n: '左テーブルを全て保持して結合' },
    ]},
    { cat: 'データ操作', items: [
      { t: 'INSERT', c: 'INSERT INTO users (name, age)\nVALUES ("田中", 25);', n: '新しい行を追加' },
      { t: 'UPDATE', c: 'UPDATE users\nSET age = 26\nWHERE id = 1;', n: '行を更新（WHEREを忘れずに）' },
      { t: 'DELETE', c: 'DELETE FROM users\nWHERE id = 1;', n: '行を削除（WHEREを忘れずに）' },
    ]},
    { cat: 'テーブル定義', items: [
      { t: 'テーブル作成', c: 'CREATE TABLE users (\n    id   INT PRIMARY KEY,\n    name VARCHAR(50),\n    age  INT\n);', n: 'テーブルとカラムを定義' },
    ]},
  ],
  html: [
    { cat: 'HTML基本構造', items: [
      { t: 'HTMLの基本形', c: '<!DOCTYPE html>\n<html lang="ja">\n<head>\n  <meta charset="UTF-8">\n  <title>タイトル</title>\n</head>\n<body>\n  <!-- コンテンツ -->\n</body>\n</html>', n: 'HTMLドキュメントの最小構成' },
    ]},
    { cat: 'よく使うHTMLタグ', items: [
      { t: '見出し', c: '<h1>大見出し</h1>\n<h2>中見出し</h2>\n<h3>小見出し</h3>', n: 'h1〜h6まで使える' },
      { t: '段落・テキスト', c: '<p>段落テキスト</p>\n<span>インライン</span>', n: 'pはブロック、spanはインライン' },
      { t: 'リンク', c: '<a href="https://example.com">リンクテキスト</a>', n: 'hrefに遷移先URLを指定' },
      { t: '画像', c: '<img src="image.jpg" alt="説明文">', n: 'altは画像の代替テキスト' },
      { t: 'リスト', c: '<ul>\n  <li>箇条書き項目</li>\n</ul>\n<ol>\n  <li>番号付き項目</li>\n</ol>', n: 'ul：箇条書き、ol：番号付き' },
      { t: 'ボタン', c: '<button onclick="myFunc()">押す</button>', n: 'clickイベントを設定できる' },
      { t: '入力フォーム', c: '<input type="text" placeholder="入力">\n<input type="number">\n<input type="checkbox">', n: 'typeで入力の種類を指定' },
      { t: 'div・section', c: '<div class="card">\n  コンテンツ\n</div>', n: 'ブロック要素。レイアウトの基本単位' },
    ]},
    { cat: 'CSSの基本', items: [
      { t: 'セレクタ・プロパティ', c: 'h1 {\n  color: red;\n  font-size: 24px;\n}', n: 'セレクタ { プロパティ: 値; }' },
      { t: 'クラス', c: '.card {\n  background: white;\n  padding: 16px;\n}', n: '.クラス名でクラスに適用' },
      { t: 'IDセレクタ', c: '#header {\n  background: navy;\n}', n: '#ID名で特定の要素に適用' },
      { t: 'Flexbox', c: '.container {\n  display: flex;\n  gap: 16px;\n  align-items: center;\n}', n: '横並びレイアウトに便利' },
      { t: '色・背景', c: 'color: #333;\nbackground-color: #f0f0f0;\nborder: 1px solid #ccc;', n: '色はカラーコードや色名で指定' },
      { t: 'マージン・パディング', c: 'margin: 16px;       /* 外側の余白 */\npadding: 16px;      /* 内側の余白 */\nmargin: 8px 16px;   /* 上下 左右 */', n: 'spaceの調整に使う' },
    ]},
  ],
  php: [
    { cat: '基本形', items: [
      { t: 'PHPファイルの基本形', c: '<?php\n\n// ここに処理を書く\n\n?>', n: '<?php ?>タグでPHPコードを囲む' },
    ]},
    { cat: '変数・基本', items: [
      { t: '変数宣言', c: '$name = "田中";\n$age = 25;\n$pi = 3.14;', n: '$で始まる。型宣言不要' },
      { t: '文字列結合', c: '$msg = "こんにちは" . $name;', n: '.演算子で文字列を結合' },
      { t: '文字列補間', c: '$msg = "名前は{$name}です";', n: 'ダブルクォートで変数を埋め込める' },
    ]},
    { cat: '入出力', items: [
      { t: '画面に出力', c: 'echo "hello";\necho $name;', n: 'echoで出力（printも使える）' },
      { t: 'HTMLと組み合わせ', c: '<p><?php echo $name; ?></p>', n: '<?php ?>タグでHTMLにPHPを埋め込む' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if文', c: 'if ($x > 0) {\n    echo "正";\n}', n: '' },
      { t: 'if-else', c: 'if ($x > 0) {\n} else if ($x < 0) {\n} else {\n}', n: '' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文', c: 'for ($i = 0; $i < 10; $i++) {\n    echo $i;\n}', n: '' },
      { t: 'foreach文', c: 'foreach ($arr as $v) {\n    echo $v;\n}', n: '配列の全要素を走査' },
      { t: 'while文', c: 'while ($x > 0) {\n    $x--;\n}', n: '' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'function add($a, $b) {\n    return $a + $b;\n}', n: '' },
      { t: '関数呼び出し', c: '$result = add(3, 4);', n: '' },
    ]},
    { cat: '配列', items: [
      { t: '配列宣言', c: '$arr = [1, 2, 3, 4, 5];', n: '[]で宣言' },
      { t: '連想配列', c: '$user = [\n    "name" => "田中",\n    "age"  => 25\n];', n: 'キーと値のペア' },
      { t: '要素追加', c: '$arr[] = 6;', n: '末尾に要素を追加' },
      { t: '長さ', c: 'count($arr)', n: '配列の要素数を取得' },
    ]},
  ],
  rust: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: 'fn main() {\n    // ここに処理を書く\n    println!("hello");\n}', n: 'Rustプログラムの最小構成' },
    ]},
    { cat: '変数・型', items: [
      { t: 'let（不変）', c: 'let x = 10;', n: 'デフォルトで不変。型推論あり' },
      { t: 'let mut（可変）', c: 'let mut count = 0;\ncount += 1;', n: 'mutで変更可能にする' },
      { t: '型を明示', c: 'let x: i32 = 10;\nlet f: f64 = 3.14;\nlet s: String = String::from("hello");', n: 'i32, f64, bool, String等' },
      { t: '文字列スライス', c: 'let s: &str = "hello";', n: '&strはリテラル文字列の参照' },
    ]},
    { cat: '入出力', items: [
      { t: 'コンソール出力', c: 'println!("hello");\nprintln!("x = {}", x);\nprintln!("vec = {:?}", vec);', n: '{}で変数埋め込み、{:?}でデバッグ表示' },
      { t: '標準入力', c: 'let mut input = String::new();\nstd::io::stdin().read_line(&mut input).unwrap();\nlet n: i32 = input.trim().parse().unwrap();', n: '文字列で受け取り、parseで変換' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if式', c: 'if x > 0 {\n    println!("正");\n}', n: '括弧不要、中括弧必須' },
      { t: 'if-else式（値を返す）', c: 'let msg = if x > 0 { "正" } else { "0以下" };', n: 'Rustのifは値を返す式' },
      { t: 'match', c: 'match x {\n    1 => println!("one"),\n    2 | 3 => println!("2か3"),\n    _ => println!("その他"),\n}', n: '強力なパターンマッチング' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文（範囲）', c: 'for i in 0..10 {\n    println!("{}", i);\n}', n: '0から9まで（10は含まない）' },
      { t: 'for文（イテレータ）', c: 'for v in &vec {\n    println!("{}", v);\n}', n: 'vecの全要素を走査' },
      { t: 'loop（無限ループ）', c: 'loop {\n    if done { break; }\n}', n: 'breakで脱出' },
      { t: 'while', c: 'while x > 0 {\n    x -= 1;\n}', n: '' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'fn add(a: i32, b: i32) -> i32 {\n    a + b  // セミコロンなしで戻り値\n}', n: '引数と戻り値の型を明示' },
      { t: '戻り値なし', c: 'fn greet() {\n    println!("hello");\n}', n: '戻り値なしは()型' },
    ]},
    { cat: 'Vec（ベクタ）', items: [
      { t: 'Vec宣言', c: 'let v = vec![1, 2, 3];\nlet mut v: Vec<i32> = Vec::new();', n: 'vec!マクロで簡単に初期化' },
      { t: '要素追加', c: 'v.push(4);', n: '末尾に要素を追加' },
      { t: '長さ', c: 'v.len()', n: '要素数を取得' },
    ]},
  ],
  ruby: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: '# Rubyに特別なmain関数は不要\nputs "hello, world"', n: 'スクリプトをそのまま実行' },
    ]},
    { cat: '変数・型', items: [
      { t: '変数（型宣言不要）', c: 'x = 10\nname = "Alice"\nflag = true', n: '型推論で自動的に型が決まる' },
      { t: '定数', c: 'MAX = 100', n: '大文字始まりが定数' },
      { t: '文字列補間', c: 'name = "Alice"\nputs "Hello, #{name}!"', n: '#{}で変数を埋め込む' },
    ]},
    { cat: '入出力', items: [
      { t: '出力', c: 'puts "hello"   # 改行あり\nprint "hello"  # 改行なし\np 42           # デバッグ出力', n: 'putsが最もよく使われる' },
      { t: '入力', c: 'input = gets.chomp\nn = gets.chomp.to_i', n: 'getsで1行読み込み、chompで改行除去' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if文', c: 'if x > 0\n  puts "正"\nend', n: '中括弧不要、endで閉じる' },
      { t: 'if-elsif-else', c: 'if x > 0\n  puts "正"\nelsif x == 0\n  puts "ゼロ"\nelse\n  puts "負"\nend', n: 'elsif（elseifではない）' },
      { t: '後置if', c: 'puts "正" if x > 0', n: '一行で書ける後置if' },
      { t: 'case-when', c: 'case x\nwhen 1 then puts "one"\nwhen 2, 3 then puts "2か3"\nelse puts "その他"\nend', n: 'switchの代わりにcase/when' },
    ]},
    { cat: 'ループ', items: [
      { t: 'times', c: '5.times do\n  puts "hello"\nend', n: '整数.timesで指定回数繰り返す' },
      { t: 'each', c: '[1, 2, 3].each do |v|\n  puts v\nend', n: '配列の全要素を走査' },
      { t: 'for-in', c: 'for i in 1..5\n  puts i\nend', n: '1..5は1から5まで（5含む）' },
      { t: 'while', c: 'while x > 0\n  x -= 1\nend', n: '条件が真の間繰り返す' },
    ]},
    { cat: '配列・ハッシュ', items: [
      { t: '配列', c: 'arr = [1, 2, 3]\narr.push(4)\narr.length', n: '動的配列、pushで追加' },
      { t: 'ハッシュ', c: 'h = { "key" => "value" }\nh[:name] = "Alice"\nh[:name]', n: 'キーと値のペア（シンボルも使える）' },
    ]},
    { cat: '関数（メソッド）', items: [
      { t: 'メソッド定義', c: 'def greet(name)\n  puts "Hello, #{name}!"\nend\ngreet("Alice")', n: 'defでメソッドを定義' },
      { t: '戻り値', c: 'def add(a, b)\n  a + b  # 最後の式が戻り値\nend', n: 'returnは省略可能' },
    ]},
  ],
  typescript: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: '// TypeScript: JavaScriptに型を追加\nconst message: string = "hello";\nconsole.log(message);', n: '型注釈が追加されたJavaScript' },
    ]},
    { cat: '変数・型', items: [
      { t: '型注釈', c: 'const n: number = 42;\nconst s: string = "hello";\nconst flag: boolean = true;', n: '変数名の後に :型名 で型を指定' },
      { t: 'let / const', c: 'let count: number = 0;    // 変更可\nconst MAX: number = 100;  // 変更不可', n: 'const推奨、変更が必要なときlet' },
      { t: '配列の型', c: 'const nums: number[] = [1, 2, 3];\nconst strs: Array<string> = ["a", "b"];', n: '型[] または Array<型>' },
      { t: 'union型', c: 'let val: string | number = "hello";\nval = 42;', n: '複数の型を | で指定できる' },
      { t: 'type / interface', c: 'type Point = { x: number; y: number; };\ninterface User { name: string; age: number; }', n: 'カスタム型の定義' },
    ]},
    { cat: '入出力', items: [
      { t: '出力', c: 'console.log("hello");\nconsole.log(`x = ${x}`);', n: 'テンプレートリテラルで変数埋め込み' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if-else', c: 'if (x > 0) {\n  console.log("正");\n} else {\n  console.log("0以下");\n}', n: 'JavaScriptと同じ形式' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文', c: 'for (let i = 0; i < 10; i++) {\n  console.log(i);\n}', n: '' },
      { t: 'for-of', c: 'const arr = [1, 2, 3];\nfor (const v of arr) {\n  console.log(v);\n}', n: '配列の要素を走査' },
    ]},
    { cat: '関数', items: [
      { t: '型付き関数', c: 'function add(a: number, b: number): number {\n  return a + b;\n}', n: '引数と戻り値に型を付ける' },
      { t: 'アロー関数', c: 'const add = (a: number, b: number): number => a + b;', n: 'アロー関数にも型注釈可能' },
      { t: 'オプション引数', c: 'function greet(name: string, title?: string): string {\n  return title ? `${title} ${name}` : name;\n}', n: '?をつけると省略可能な引数' },
    ]},
  ],
  kotlin: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: 'fun main() {\n    println("hello, world")\n}', n: 'mainがエントリーポイント' },
    ]},
    { cat: '変数・型', items: [
      { t: 'val（不変）', c: 'val x = 10\nval name = "Alice"', n: '型推論あり、変更不可' },
      { t: 'var（可変）', c: 'var count = 0\ncount += 1', n: 'varは変更可能' },
      { t: '型を明示', c: 'val n: Int = 42\nval s: String = "hello"\nval flag: Boolean = true', n: 'Int, String, Boolean, Double等' },
      { t: 'Null許容型', c: 'var name: String? = null\nval len = name?.length ?: 0', n: '?でnull許容、?:でデフォルト値' },
    ]},
    { cat: '入出力', items: [
      { t: '出力', c: 'println("hello")\nprintln("x = $x")', n: '$で変数埋め込み（文字列テンプレート）' },
      { t: '入力', c: 'val input = readLine()!!\nval n = readLine()!!.toInt()', n: 'readLine()で1行読み込み' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if式', c: 'if (x > 0) {\n    println("正")\n}', n: 'Kotlinのifは値を返す式' },
      { t: 'when', c: 'when (x) {\n    1 -> println("one")\n    2, 3 -> println("2か3")\n    else -> println("その他")\n}', n: 'switchより強力なパターンマッチ' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for（範囲）', c: 'for (i in 1..5) {\n    println(i)\n}', n: '1..5は1から5（両端含む）' },
      { t: 'for（コレクション）', c: 'val list = listOf(1, 2, 3)\nfor (v in list) {\n    println(v)\n}', n: 'リストの全要素を走査' },
      { t: 'while', c: 'while (x > 0) {\n    x--\n}', n: '' },
    ]},
    { cat: 'コレクション', items: [
      { t: 'List', c: 'val list = listOf(1, 2, 3)        // 不変\nval mList = mutableListOf(1, 2)  // 可変\nmList.add(3)', n: 'mutableListOfで変更可能なリスト' },
      { t: 'Map', c: 'val map = mapOf("a" to 1, "b" to 2)\nval mMap = mutableMapOf("key" to "value")', n: 'toでキーと値を対応付ける' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'fun add(a: Int, b: Int): Int {\n    return a + b\n}', n: 'funキーワードで定義' },
      { t: '一行関数', c: 'fun add(a: Int, b: Int) = a + b', n: '式の結果を直接返す省略形' },
    ]},
  ],
  swift: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: 'import Foundation\n\nprint("hello, world")', n: 'Foundationで標準ライブラリが使える' },
    ]},
    { cat: '変数・型', items: [
      { t: 'let（定数）', c: 'let x = 10\nlet name = "Alice"', n: '変更不可、型推論あり' },
      { t: 'var（変数）', c: 'var count = 0\ncount += 1', n: '変更可能な変数' },
      { t: '型を明示', c: 'let n: Int = 42\nlet s: String = "hello"\nlet flag: Bool = true', n: 'Int, String, Bool, Double等' },
      { t: 'Optional', c: 'var name: String? = nil\nif let n = name {\n    print(n)  // 安全にアンラップ\n}', n: '?でOptional型、if letでアンラップ' },
    ]},
    { cat: '入出力', items: [
      { t: '出力', c: 'print("hello")\nprint("x = \\(x)")', n: '\\()で変数埋め込み（文字列補間）' },
      { t: '入力', c: 'let input = readLine() ?? ""\nlet n = Int(readLine() ?? "0") ?? 0', n: 'readLine()はオプショナルStringを返す' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if-else', c: 'if x > 0 {\n    print("正")\n} else {\n    print("0以下")\n}', n: '条件を括弧で囲まなくてもよい' },
      { t: 'switch', c: 'switch x {\ncase 1:\n    print("one")\ncase 2, 3:\n    print("2か3")\ndefault:\n    print("その他")\n}', n: 'fallthroughは自動的にしない' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for-in（範囲）', c: 'for i in 1...5 {\n    print(i)\n}', n: '1...5は1から5（両端含む）' },
      { t: 'for-in（配列）', c: 'let arr = [1, 2, 3]\nfor v in arr {\n    print(v)\n}', n: '配列の全要素を走査' },
      { t: 'while', c: 'while x > 0 {\n    x -= 1\n}', n: '' },
    ]},
    { cat: 'コレクション', items: [
      { t: 'Array', c: 'var arr: [Int] = [1, 2, 3]\narr.append(4)\narr.count', n: '動的配列' },
      { t: 'Dictionary', c: 'var dict: [String: Int] = ["a": 1]\ndict["b"] = 2', n: 'キーと値のペア' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'func add(a: Int, b: Int) -> Int {\n    return a + b\n}', n: 'funcキーワードで定義' },
      { t: '引数ラベル', c: 'func greet(to name: String) {\n    print("Hello, \\(name)!")\n}\ngreet(to: "Alice")', n: '外部引数名と内部引数名を分けられる' },
    ]},
  ],
  csharp: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("hello");\n    }\n}', n: 'Mainがエントリーポイント' },
      { t: 'トップレベル文（C# 9以降）', c: 'Console.WriteLine("hello");', n: 'classやMainを省略できる最新の書き方' },
    ]},
    { cat: '変数・型', items: [
      { t: '型宣言', c: 'int n = 42;\nstring s = "hello";\nbool flag = true;\ndouble d = 3.14;', n: 'int, string, bool, double等' },
      { t: 'var（型推論）', c: 'var x = 42;\nvar name = "Alice";', n: 'varで型を省略（コンパイル時に確定）' },
      { t: 'const', c: 'const int MAX = 100;', n: 'コンパイル時定数' },
    ]},
    { cat: '入出力', items: [
      { t: '出力', c: 'Console.WriteLine("hello");\nConsole.WriteLine($"x = {x}");', n: '$"..."で文字列補間' },
      { t: '入力', c: 'string input = Console.ReadLine();\nint n = int.Parse(Console.ReadLine());', n: 'ReadLineで1行読み込み' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if-else', c: 'if (x > 0) {\n    Console.WriteLine("正");\n} else {\n    Console.WriteLine("0以下");\n}', n: '' },
      { t: 'switch', c: 'switch (x) {\n    case 1:\n        Console.WriteLine("one");\n        break;\n    default:\n        Console.WriteLine("その他");\n        break;\n}', n: 'breakが必要' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文', c: 'for (int i = 0; i < 10; i++) {\n    Console.WriteLine(i);\n}', n: '' },
      { t: 'foreach', c: 'int[] arr = {1, 2, 3};\nforeach (int v in arr) {\n    Console.WriteLine(v);\n}', n: 'コレクション全要素を走査' },
      { t: 'while', c: 'while (x > 0) {\n    x--;\n}', n: '' },
    ]},
    { cat: 'コレクション', items: [
      { t: '配列', c: 'int[] arr = new int[3];\nint[] arr2 = {1, 2, 3};', n: '固定長の配列' },
      { t: 'List<T>', c: 'var list = new List<int> {1, 2, 3};\nlist.Add(4);\nlist.Count;', n: '動的な配列（Listが一般的）' },
      { t: 'Dictionary', c: 'var dict = new Dictionary<string, int>();\ndict["key"] = 1;', n: 'キーと値のペア' },
    ]},
    { cat: '関数（メソッド）', items: [
      { t: 'staticメソッド', c: 'static int Add(int a, int b) {\n    return a + b;\n}', n: 'クラス外から呼べるstatic' },
    ]},
  ],
  go: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("hello")\n}', n: 'package mainとmain関数が必須' },
    ]},
    { cat: '変数・型', items: [
      { t: 'var宣言', c: 'var x int = 10\nvar name string = "Alice"', n: '型を明示した変数宣言' },
      { t: ':= 短縮宣言', c: 'x := 10\nname := "Alice"', n: '関数内でのみ使える型推論付き宣言' },
      { t: '定数', c: 'const MAX = 100\nconst Pi = 3.14159', n: 'constで定数を宣言' },
      { t: '複数代入', c: 'a, b := 1, 2\na, b = b, a  // 値を交換', n: '複数の変数を同時に代入できる' },
    ]},
    { cat: '入出力', items: [
      { t: '出力', c: 'fmt.Println("hello")\nfmt.Printf("x = %d\\n", x)\nfmt.Printf("s = %s\\n", s)', n: 'PrintlnとPrintf（書式指定）' },
      { t: '入力', c: 'var n int\nfmt.Scan(&n)', n: 'Scanでポインタ渡し' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if文', c: 'if x > 0 {\n    fmt.Println("正")\n}', n: '括弧不要、中括弧必須' },
      { t: 'switch', c: 'switch x {\ncase 1:\n    fmt.Println("one")\ncase 2, 3:\n    fmt.Println("2か3")\ndefault:\n    fmt.Println("その他")\n}', n: 'breakは不要（自動break）' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for（C風）', c: 'for i := 0; i < 10; i++ {\n    fmt.Println(i)\n}', n: 'Goにはforしかない' },
      { t: 'for range', c: 'nums := []int{1, 2, 3}\nfor i, v := range nums {\n    fmt.Println(i, v)\n}', n: 'インデックスと値を同時に取得' },
      { t: 'while相当', c: 'for x > 0 {\n    x--\n}', n: 'forだけでwhileを実現' },
    ]},
    { cat: 'スライス・マップ', items: [
      { t: 'スライス', c: 'nums := []int{1, 2, 3}\nnums = append(nums, 4)\nlen(nums)', n: '動的配列。appendで追加' },
      { t: 'マップ', c: 'm := map[string]int{"a": 1}\nm["b"] = 2\nv, ok := m["a"]', n: '存在チェックはok変数で判定' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'func add(a, b int) int {\n    return a + b\n}', n: '同じ型の引数はまとめて書ける' },
      { t: '複数戻り値', c: 'func divide(a, b int) (int, error) {\n    if b == 0 { return 0, fmt.Errorf("zero") }\n    return a / b, nil\n}', n: 'Goは複数の値を返せる' },
    ]},
  ],
  c: [
    { cat: '基本形', items: [
      { t: 'プログラムの基本形', c: '#include <stdio.h>\n\nint main() {\n    printf("hello\\n");\n    return 0;\n}', n: 'C言語の最小構成' },
    ]},
    { cat: '変数・型', items: [
      { t: '基本型', c: 'int n = 42;\nfloat f = 3.14f;\ndouble d = 3.14;\nchar c = \'A\';', n: 'int, float, double, char' },
      { t: 'ポインタ', c: 'int x = 10;\nint *p = &x;       // アドレスを取得\nprintf("%d", *p);  // 逆参照', n: '*でポインタ宣言、&でアドレス取得' },
      { t: 'const', c: 'const int MAX = 100;', n: '変更不可の定数' },
    ]},
    { cat: '入出力', items: [
      { t: '出力（printf）', c: 'printf("hello\\n");\nprintf("x = %d\\n", x);\nprintf("d = %.2f\\n", d);', n: '%dで整数、%fで小数、%sで文字列' },
      { t: '入力（scanf）', c: 'int n;\nscanf("%d", &n);\nchar s[100];\nscanf("%s", s);', n: '変数にはアドレスを渡す（&n）' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if-else', c: 'if (x > 0) {\n    printf("正\\n");\n} else {\n    printf("0以下\\n");\n}', n: '' },
      { t: 'switch', c: 'switch (x) {\n    case 1:\n        printf("one\\n");\n        break;\n    default:\n        printf("その他\\n");\n}', n: 'breakを忘れずに' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文', c: 'for (int i = 0; i < 10; i++) {\n    printf("%d\\n", i);\n}', n: '' },
      { t: 'while', c: 'while (x > 0) {\n    x--;\n}', n: '' },
      { t: 'do-while', c: 'do {\n    printf("%d\\n", x);\n    x--;\n} while (x > 0);', n: '必ず1回は実行される' },
    ]},
    { cat: '配列', items: [
      { t: '配列宣言', c: 'int arr[5] = {1, 2, 3, 4, 5};\narr[0];  // 先頭要素', n: '固定長の配列' },
      { t: '文字列', c: 'char str[100] = "hello";\nprintf("%s\\n", str);', n: 'C言語の文字列はchar配列' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'int add(int a, int b) {\n    return a + b;\n}', n: '戻り値の型を先に書く' },
      { t: 'void関数', c: 'void greet() {\n    printf("hello\\n");\n}', n: '戻り値なしはvoid' },
    ]},
  ],
  bash: [
    { cat: '基本形', items: [
      { t: 'スクリプトの基本形', c: '#!/bin/bash\n\necho "hello, world"', n: '1行目にシェバン（#!）を書く' },
    ]},
    { cat: '変数', items: [
      { t: '変数の代入と参照', c: 'name="Alice"    # スペースなし\necho "$name"', n: '代入時はスペース禁止、参照時は$' },
      { t: '数値演算', c: 'x=10\ny=$((x + 5))\necho $y', n: '算術演算は$(( ))で行う' },
      { t: 'コマンド置換', c: 'today=$(date +%Y-%m-%d)\necho "今日は $today"', n: '$(コマンド)でコマンド結果を変数に入れる' },
    ]},
    { cat: '入出力', items: [
      { t: '出力', c: 'echo "hello"\nprintf "x = %d\\n" $x', n: 'echoが基本、printfで書式指定' },
      { t: '入力', c: 'read -p "名前を入力: " name\necho "Hello, $name"', n: 'readでユーザー入力を受け取る' },
    ]},
    { cat: '条件分岐', items: [
      { t: 'if文', c: 'if [ $x -gt 0 ]; then\n  echo "正"\nfi', n: '[ ]の内側はスペースが必要' },
      { t: '比較演算子', c: '[ $a -eq $b ]  # 等しい\n[ $a -ne $b ]  # 等しくない\n[ $a -gt $b ]  # より大きい\n[ $a -lt $b ]  # より小さい', n: '数値比較は -eq/-ne/-gt/-lt 等を使う' },
      { t: '文字列比較', c: 'if [ "$s" = "hello" ]; then\n  echo "match"\nfi', n: '文字列は = で比較（変数は""で囲む）' },
    ]},
    { cat: 'ループ', items: [
      { t: 'for文', c: 'for i in 1 2 3 4 5; do\n  echo $i\ndone', n: '値のリストを順番に処理' },
      { t: 'for文（範囲）', c: 'for i in $(seq 1 10); do\n  echo $i\ndone', n: 'seqで連番生成' },
      { t: 'while', c: 'while [ $x -gt 0 ]; do\n  echo $x\n  x=$((x - 1))\ndone', n: '条件が真の間繰り返す' },
    ]},
    { cat: '関数', items: [
      { t: '関数定義', c: 'greet() {\n  echo "Hello, $1"\n}\n\ngreet "Alice"', n: '$1, $2...で引数を参照' },
    ]},
  ],
  regex: [
    { cat: '基本メタ文字', items: [
      { t: '任意の1文字', c: '.', n: '改行以外の任意の1文字にマッチ' },
      { t: '行頭・行末', c: '^abc   # 行頭がabc\nabc$   # 行末がabc', n: '^は行頭、$は行末' },
      { t: '文字クラス', c: '[abc]   # a, b, cのどれか\n[a-z]   # 小文字アルファベット\n[^abc]  # a, b, c以外', n: '[]で文字の集合を指定' },
    ]},
    { cat: '量指定子', items: [
      { t: '0回以上（*）', c: 'ab*c   # ac, abc, abbc ...', n: '*は直前の要素の0回以上の繰り返し' },
      { t: '1回以上（+）', c: 'ab+c   # abc, abbc ...（acは不可）', n: '+は直前の要素の1回以上の繰り返し' },
      { t: '0または1回（?）', c: 'colou?r  # color または colour', n: '?は直前の要素が0または1回' },
      { t: '回数指定（{}）', c: 'a{3}    # aaa\na{2,4}  # aa, aaa, aaaa', n: '{n}でn回、{m,n}でm〜n回' },
    ]},
    { cat: '特殊シーケンス', items: [
      { t: '数字（\\d）', c: '\\d   # [0-9]と同じ\n\\D   # 数字以外', n: '\\dは数字1文字' },
      { t: '単語文字（\\w）', c: '\\w   # [a-zA-Z0-9_]と同じ\n\\W   # 単語文字以外', n: '\\wはアルファベット・数字・アンダースコア' },
      { t: '空白（\\s）', c: '\\s   # スペース、タブ、改行等\n\\S   # 空白以外', n: '\\sは空白文字' },
      { t: '単語境界（\\b）', c: '\\bword\\b', n: '前後が単語文字でない位置' },
    ]},
    { cat: 'グループ・選択', items: [
      { t: 'グループ化', c: '(abc)+   # abcの1回以上の繰り返し', n: '()で要素をグループ化' },
      { t: 'キャプチャ', c: '(\\d{4})-(\\d{2})  # グループ1と2', n: '()でキャプチャし後から参照できる' },
      { t: '選択（OR）', c: 'cat|dog   # catまたはdog', n: '|で複数の候補を指定' },
    ]},
    { cat: 'よく使うパターン', items: [
      { t: 'メールアドレス', c: '[\\w.+-]+@[\\w-]+\\.[a-z]{2,}', n: '簡易的なメール形式チェック' },
      { t: '日本語文字', c: '[\\u3040-\\u309F]  # ひらがな\n[\\u30A0-\\u30FF]  # カタカナ\n[\\u4E00-\\u9FAF]  # 漢字', n: 'Unicodeの範囲でマッチ' },
      { t: '電話番号（日本）', c: '0\\d{1,4}-\\d{1,4}-\\d{4}', n: '一般的な日本の電話番号形式' },
    ]},
  ],
};

function showSyntaxMenu() {
  var lang = typeof currentLanguage !== 'undefined' ? currentLanguage : 'cpp';
  var guide = SYNTAX_GUIDE[lang];

  var existing = document.getElementById('syntax-modal');
  if (existing) { existing.remove(); }

  var langLabel = lang.toUpperCase();
  if (lang === 'cpp') langLabel = 'C++';
  if (lang === 'javascript') langLabel = 'JavaScript';
  if (lang === 'html') langLabel = 'HTML/CSS';

  var modal = document.createElement('div');
  modal.id = 'syntax-modal';
  modal.className = 'syntax-modal';
  modal.innerHTML =
    '<div class="syntax-overlay" onclick="closeSyntaxMenu()"></div>' +
    '<div class="syntax-panel">' +
      '<div class="syntax-header">' +
        '<div class="syntax-header-left">' +
          '<span class="syntax-lang-badge">' + langLabel + '</span>' +
          '<h3 class="syntax-title">書き方メニュー</h3>' +
        '</div>' +
        '<button class="syntax-close" onclick="closeSyntaxMenu()">✕</button>' +
      '</div>' +
      '<div class="syntax-body">' + _buildSyntaxBody(guide) + '</div>' +
    '</div>';

  document.body.appendChild(modal);
  requestAnimationFrame(function() { modal.classList.add('open'); });
}

function _buildSyntaxBody(guide) {
  if (!guide) return '<p class="explain-error">この言語の書き方メニューはまだ準備中です。</p>';
  return guide.map(function(section) {
    var items = section.items.map(function(item) {
      return '<div class="syntax-item">' +
        '<div class="syntax-item-title">' + escapeHtml(item.t) + '</div>' +
        '<pre class="syntax-item-code">' + escapeHtml(item.c) + '</pre>' +
        (item.n ? '<div class="syntax-item-note">' + escapeHtml(item.n) + '</div>' : '') +
      '</div>';
    }).join('');
    return '<div class="syntax-cat">' +
      '<div class="syntax-cat-title">' + escapeHtml(section.cat) + '</div>' +
      '<div class="syntax-items">' + items + '</div>' +
    '</div>';
  }).join('');
}

function closeSyntaxMenu() {
  var modal = document.getElementById('syntax-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(function() { if (modal.parentNode) modal.remove(); }, 250);
}

// ===== コード一行解説 =====

async function explainCode(problemId) {
  const p = getProblems().find(function(x) { return x.id === problemId; });
  const area = document.getElementById('explain-area-' + problemId);
  if (!area) return;
  if (!p) { area.innerHTML = '<p class="explain-error">問題データが見つかりません。</p>'; return; }

  // すでに展開済みならトグル
  if (!area.classList.contains('hidden')) {
    area.classList.add('hidden');
    return;
  }

  // ローディング表示
  area.classList.remove('hidden');
  area.innerHTML = '<div class="explain-loading"><span class="explain-spinner"></span>AI が解析中...</div>';

  const system =
    'あなたはC++/プログラミング教育の専門家です。与えられたコードを初学者向けに解説してください。' +
    '必ず次のJSON形式だけで返答してください（マークダウンや説明文は不要）:\n' +
    '{"lines":[{"code":"コードの一行","note":"その行の日本語解説"},...]}';

  const userMsg =
    '問題タイトル: ' + p.title + '\n' +
    '問題内容: ' + p.question + '\n\n' +
    '正解コード:\n' + p.answer;

  try {
    const raw = await askAI(system, userMsg);

    // JSON抽出
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSONが返ってきませんでした');
    const data = JSON.parse(match[0]);

    let html = '';

    // 一行解説テーブル
    if (data.lines && data.lines.length) {
      html += '<div class="explain-lines-wrap">';
      html += '<h4 class="explain-subtitle">📝 一行ずつの解説</h4>';
      html += '<table class="explain-table">';
      html += '<thead><tr><th>コード</th><th>解説</th></tr></thead><tbody>';
      data.lines.forEach(function(l) {
        html += '<tr><td><code class="explain-code">' + escapeHtml(l.code) + '</code></td>' +
                '<td class="explain-note">' + escapeHtml(l.note) + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    area.innerHTML = html;
  } catch (e) {
    area.innerHTML = '<p class="explain-error">解説の取得に失敗しました: ' + escapeHtml(e.message) + '</p>';
  }
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
  _suppressDirty = true;
  aceEditor.setValue(initialCode !== undefined ? initialCode : getStarterCode(), -1);
  _suppressDirty = false;

  aceEditor.setOptions({
    fontSize          : _editorFontSize + 'px',
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

  // change リスナーを一本化（dirtyフラグ ＋ Golfカウンター）
  function _updateGolfCounter() {
    var counter = document.getElementById('golf-counter-' + currentProblemId);
    if (counter && aceEditor) counter.textContent = aceEditor.getValue().length;
  }
  aceEditor.session.on('change', function() {
    if (!_suppressDirty) { editorDirty = true; _saveDraftThrottled(); }
    _updateGolfCounter();
  });
  _updateGolfCounter();
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
var _basicformLangNames = {
  cpp: 'C++', python: 'Python', javascript: 'JS', typescript: 'TS',
  ruby: 'Ruby', kotlin: 'Kotlin', swift: 'Swift', java: 'Java',
  csharp: 'C#', go: 'Go', c: 'C', rust: 'Rust'
};
var _basicformOrder = ['cpp','python','javascript','typescript','ruby','kotlin','swift','java','csharp','go','c','rust'];

function _getStarterCodeForLang(lang) {
  var saved = currentLanguage;
  currentLanguage = lang;
  var code = getStarterCode();
  currentLanguage = saved;
  return code;
}

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
  document.getElementById('basicform-code').textContent = _getStarterCodeForLang(_basicformLang);
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

  currentEditorMode = mode;

  // ボタンのactive状態を更新
  ['mode-zero', 'mode-scratch', 'mode-fill'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });
  var activeBtn = document.getElementById('mode-' + mode);
  if (activeBtn) activeBtn.classList.add('active');

  // コードを書いていなければモードに合わせて内容を切り替える
  if (!editorDirty) {
    _suppressDirty = true;
    if (mode === 'zero') {
      aceEditor.setValue('', -1);
    } else if (mode === 'scratch') {
      aceEditor.setValue(getStarterCode(), -1);
    } else {
      aceEditor.setValue(p ? buildSkeleton(p) : getStarterCode(), -1);
    }
    _suppressDirty = false;
  }
  aceEditor.focus();
}

// ===== コードを実行する（Wandbox API + 自動判定） =====

async function runCode() {
  const code = aceEditor ? aceEditor.getValue().trim() : '';
  if (!code) { showToast('コードを入力してください'); return; }
  // 未ログインなら匿名セッションを自動作成して登録不要で実行できるようにする
  if (!currentUser) {
    var _anonOk = await ensureAnonSession();
    if (!_anonOk) { showToast('コード実行にはネットワーク接続が必要です'); return; }
  }

  const btn        = document.querySelector(".run-btn");
  const outputArea = document.getElementById("output-area");
  const outputText = document.getElementById("output-text");
  const judgeArea  = document.getElementById("judge-area");
  if (!btn || !outputArea || !outputText) return;
  const stdinEl = document.getElementById("stdin-input");
  const stdin   = stdinEl ? stdinEl.value : '';

  // HTML/CSS: iframeプレビュー（Wandbox不使用）
  if (currentLanguage === 'html') {
    var previewFrame = document.getElementById('html-preview-frame');
    if (!previewFrame) {
      previewFrame = document.createElement('iframe');
      previewFrame.id = 'html-preview-frame';
      previewFrame.style.cssText = 'width:100%;height:400px;border:1px solid #444;border-radius:8px;background:#fff;margin-top:8px;display:block;';
      if (outputArea.parentNode) outputArea.parentNode.insertBefore(previewFrame, outputArea.nextSibling);
    }
    previewFrame.srcdoc = aceEditor ? aceEditor.getValue() : '';
    previewFrame.style.display = 'block';
    outputArea.classList.add('hidden');
    if (judgeArea) judgeArea.classList.add('hidden');
    btn.textContent = '▶ 実行する';
    btn.disabled = false;
    return;
  }

  btn.textContent = "実行中...";
  btn.disabled = true;
  // 実行中ローディング表示
  outputArea.classList.remove("hidden");
  outputText.className = "output-running";
  outputText.textContent = "// 実行中...";
  if (judgeArea) judgeArea.classList.add("hidden");

  try {
    var _isKotlin  = currentLanguage === 'kotlin';
    const controller = new AbortController();
    const _timeout   = setTimeout(function() { controller.abort(); }, _isKotlin ? 30000 : 20000);
    var _fetchUrl  = _isKotlin ? '/api/run-kotlin' : '/api/run-code';
    var _wandboxBody = { code: code, compiler: getCompiler(), stdin: stdin };
    if (currentLanguage === 'c') _wandboxBody.options = 'c11';
    var _fetchBody = _isKotlin
      ? JSON.stringify({ code: code })
      : JSON.stringify(_wandboxBody);

    var _runHeaders = { "Content-Type": "application/json" };
    if (_supabase) {
      var _runSess = await _supabase.auth.getSession();
      var _runTok  = _runSess.data && _runSess.data.session && _runSess.data.session.access_token;
      if (_runTok) _runHeaders['Authorization'] = 'Bearer ' + _runTok;
    }

    const res = await fetch(_fetchUrl, {
      method:  "POST",
      headers: _runHeaders,
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

      // 実行時間バッジ
      var _timeBadge = document.getElementById('exec-time-badge');
      if (_timeBadge) {
        if (data.program_time != null) {
          var _ms = data.program_time < 1 ? Math.round(data.program_time * 1000) + 'ms' : data.program_time.toFixed(2) + 's';
          _timeBadge.textContent = '⚡ ' + _ms;
          _timeBadge.classList.remove('hidden');
        } else {
          _timeBadge.classList.add('hidden');
        }
      }

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
      var _apiName = currentLanguage === 'kotlin' ? 'Kotlin実行サーバー' : 'Wandbox API';
      var _kotlinNote = currentLanguage === 'kotlin' ? '\n（サーバーが一時的に停止している場合は、しばらく待ってから再試行してください）' : '';
      outputText.textContent = "⚠ 実行エラー: " + _apiName + "に接続できませんでした。\nインターネット接続を確認するか、しばらく待ってから再試行してください。" + _kotlinNote + "\n詳細: " + e.message;
    }
    outputText.className = "output-error";
  } finally {
    btn.textContent = "▶ 実行する";
    btn.disabled = false;
  }
}

// ===== テストケース可視化 =====

function renderTestComparison(expected, actual) {
  var area = document.getElementById('output-area');
  if (!area) return;

  var old = area.querySelector('.test-compare');
  if (old) old.remove();

  var expLines = (expected || '').trim().split('\n');
  var actLines = (actual   || '').trim().split('\n');
  var maxLen   = Math.max(expLines.length, actLines.length);
  var okCount  = 0;

  var rows = '';
  for (var i = 0; i < maxLen; i++) {
    var exp   = expLines[i] !== undefined ? expLines[i] : '';
    var act   = actLines[i] !== undefined ? actLines[i] : '';
    var match = exp === act;
    if (match) okCount++;
    rows +=
      '<div class="tc-row ' + (match ? 'tc-row-ok' : 'tc-row-ng') + '">' +
        '<div class="tc-cell tc-exp">' + escapeHtml(exp || '') + '</div>' +
        '<div class="tc-icon">' + (match ? '✓' : '✗') + '</div>' +
        '<div class="tc-cell tc-act">' + escapeHtml(act || '') + '</div>' +
      '</div>';
  }

  var compare = document.createElement('div');
  compare.className = 'test-compare';
  compare.innerHTML =
    '<div class="tc-header">' +
      '<span class="tc-col-label">期待出力</span>' +
      '<span class="tc-score">' + okCount + ' / ' + maxLen + '</span>' +
      '<span class="tc-col-label" style="text-align:right">実際の出力</span>' +
    '</div>' +
    rows;

  area.appendChild(compare);
}

// 自動判定を開始する
var _judging = false; // AI判定の多重並行実行防止フラグ

async function startAutoJudge(problemId, output) {
  const p         = getProblems().find(function(x) { return x.id === problemId; });
  const judgeArea = document.getElementById("judge-area");
  if (!p || !judgeArea) return;

  // expected がある場合 → 即座に文字列比較 + テストケース可視化
  if (p.expected !== undefined) {
    var passed = output.trim() === p.expected.trim();
    renderTestComparison(p.expected, output);
    showJudgeResult(problemId, passed, false);
    return;
  }

  // AI 判定中は多重実行を防ぐ
  if (_judging) return;
  _judging = true;

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
  } finally {
    _judging = false;
  }
}

// 判定結果を表示し、正解ならクリア処理
function getNextProblem(currentId) {
  var probs = getProblems();
  var idx = probs.findIndex(function(p) { return p.id === currentId; });
  if (idx === -1) return null;
  for (var i = idx + 1; i < probs.length; i++) {
    var p = probs[i];
    if (!isLearned(p.id) && (!isPremiumRequired(p.rank) || currentUserIsPremium)) return p;
  }
  return null;
}

// ===== ランクアンロックモーダル =====

var RANK_UNLOCK_MESSAGES = {
  rookie:   'プログラミングの第一歩を踏み出した！基礎をしっかりマスターしよう。',
  bronze:   '実用的なアプリが作れるレベルに到達！スキルが確実に上がっている。',
  silver:   '型システムとOOPを本格的に学ぶ領域へ突入。一段上のエンジニアへ！',
  gold:     '企業現場でも通用するスキルを習得した。本物のエンジニアに近づいた！',
  platinum: 'OSや組み込みなど低レベルの世界へ踏み込んだ。真の技術者の証。',
  diamond:  '最高峰クラスの言語に挑む実力を身につけた。圧倒的な実力者！',
  master:   '次世代言語をマスターした真の猛者。この領域に達する者は少ない。',
  legend:   '伝説の域に達した。あなたの名はコードに刻まれる。',
  titan:    '神の領域へ到達。もはや人間を超えた存在だ。',
};

function _getRankColorByName(rank) {
  var lc = (rank || '').toLowerCase();
  for (var i = 0; i < LANGUAGE_GROUPS.length; i++) {
    if (LANGUAGE_GROUPS[i].rank.toLowerCase() === lc) {
      return LANGUAGE_GROUPS[i].rankColor;
    }
  }
  if (lc === 'legend') return '#FF6B00';
  if (lc === 'titan')  return '#FF3E3E';
  return '#FFFFFF';
}

function _checkRankUnlock(rankStr) {
  var rank = (rankStr || '').toLowerCase();
  var unlocked = lsGetJSON('rank_first_cleared', {});
  if (unlocked[rank]) return;
  unlocked[rank] = true;
  lsSet('rank_first_cleared', JSON.stringify(unlocked));
  var color = _getRankColorByName(rank);
  var msg   = RANK_UNLOCK_MESSAGES[rank] || 'おめでとうございます！';
  setTimeout(function() {
    showRankUnlockModal(rank.toUpperCase(), color, msg);
  }, 1800);
}

function showRankUnlockModal(rankName, rankColor, message) {
  var el = document.getElementById('rank-unlock-modal');
  if (!el) return;
  var nameEl = document.getElementById('rum-rank-name');
  var msgEl  = document.getElementById('rum-message');
  if (nameEl) { nameEl.textContent = rankName; nameEl.style.color = rankColor; }
  if (msgEl)  { msgEl.textContent  = message; }
  el.style.setProperty('--rum-color', rankColor);
  el.classList.remove('hidden');
  if (window.confetti) {
    confetti({ particleCount: 120, spread: 85, origin: { y: 0.5 },
      colors: [rankColor, '#ffffff', '#FFD700'] });
  }
  function _close() { el.classList.add('hidden'); }
  el.addEventListener('click', _close, { once: true });
}

function closeRankUnlockModal() {
  var el = document.getElementById('rank-unlock-modal');
  if (el) el.classList.add('hidden');
}

function showJudgeResult(problemId, passed, byAI) {
  // 別の問題に遷移済み、またはページを離れた場合は何もしない
  if (currentProblemId !== problemId) return;
  if (document.getElementById("judge-area") === null) return;

  if (passed) {
    if (!isLearned(problemId)) {
      // コンボカウント
      _comboCount++;
      if (_comboCount >= 2) showComboEffect(_comboCount);
      // 進捗を保存・後処理
      saveProgress(problemId);
      _saveProblemTime(problemId);
      _clearDraft(problemId);
      _incDailyCleared();
      _checkUnitClear(problemId);
      // ランクアンロックチェック
      var _prob0 = getProblems().find(function(x) { return x.id === problemId; });
      if (_prob0 && _prob0.rank) _checkRankUnlock(_prob0.rank);
      // エフェクト・サウンド
      playClearSound();
      var _prob = getProblems().find(function(x) { return x.id === problemId; });
      var _xp   = (_prob && _prob.rank) ? (RANK_EXP[_prob.rank.toLowerCase()] || 15) : 15;
      showClearEffect(_xp);
      // renderDetail で画面を完全リフレッシュ（ボタン・ラベルを確実に更新）
      renderDetail(problemId);
      updateProgressDisplay();
      renderList();
      // 正解後に解説を自動展開
      var _secId = 'explanation-' + problemId;
      var _secBody = document.getElementById(_secId);
      if (_secBody && _secBody.classList.contains('hidden')) {
        toggleSection(_secId);
      }
    }
    // judge-area はrenderDetailで再生成されるので再取得
    var ja = document.getElementById("judge-area");
    if (ja) {
      var label = byAI ? 'AI判定: 正解！' : '正解！';
      var _p = getProblems().find(function(x) { return x.id === problemId; });
      var _pTitle = _p ? _p.title : '';
      var _lang = currentLanguage || 'cpp';
      var next = getNextProblem(problemId);
      var _nextRank = next ? (next.rank || 'rookie').toLowerCase() : '';
      var _nextHtml = next
        ? '<button class="next-prob-btn" onclick="goToNextProblem(' + next.id + ')">' +
            '<span class="npb-arrow">→</span>' +
            '<span class="npb-body">' +
              '<span class="npb-label">次の問題へ</span>' +
              '<span class="npb-title">' + escapeHtml(next.title) + '</span>' +
            '</span>' +
            '<span class="npb-rank rank-badge rank-' + _nextRank + '">' + (next.rank || 'ROOKIE') + '</span>' +
          '</button>'
        : '<div class="all-clear-msg">🎉 この言語の問題を全てクリアした！</div>';
      ja.innerHTML = '<div class="judge-pass">✓ ' + label + ' クリアしました！</div>' +
        '<div class="clear-share-row">' +
          '<button class="share-x-btn" data-title="' + escapeHtml(_pTitle) + '" data-lang="' + escapeHtml(_lang) + '" onclick="shareClear(this.dataset.title,this.dataset.lang)">𝕏 シェア</button>' +
        '</div>' +
        _nextHtml;
      ja.classList.remove("hidden");
    }
  } else {
    // コンボブレイク
    if (_comboCount >= 2) showComboBreak(_comboCount);
    _comboCount = 0;
    trackWrongAnswer(problemId);
    _incWrongCount(problemId);
    var judgeArea = document.getElementById("judge-area");
    if (judgeArea) {
      judgeArea.innerHTML =
        '<div class="judge-fail">✗ まだ違います。出力を確認してもう一度試してみましょう。</div>' +
        '<button class="judge-hint-btn" onclick="toggleSection(\'hint-' + problemId + '\')">💡 ヒントを確認する</button>';
      judgeArea.classList.remove("hidden");
    }
  }
}

// ===== AI 共通リクエスト =====

async function askAI(system, messages) {
  const msgArray = Array.isArray(messages)
    ? messages
    : [{ role: 'user', content: messages }];

  var askHeaders = { 'Content-Type': 'application/json' };
  if (_supabase) {
    var _sess = await _supabase.auth.getSession();
    var _tok  = _sess.data && _sess.data.session && _sess.data.session.access_token;
    if (_tok) askHeaders['Authorization'] = 'Bearer ' + _tok;
  }
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: askHeaders,
    body: JSON.stringify({ system: system, messages: msgArray })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.reply;
}

// ===== コードフィードバック =====

async function getAIFeedback(problemId) {
  if (!currentUser) {
    var _ok = await ensureAnonSession();
    if (!_ok) { openAuthModal(); return; }
  }
  const p = getProblems().find(function(x) { return x.id === problemId; });
  if (!p) return;
  const code = aceEditor ? aceEditor.getValue().trim() : '';
  if (!code) { showToast('コードを入力してください'); return; }

  const btn = document.querySelector('.ai-feedback-btn');
  const area = document.getElementById('ai-feedback-area');
  const text = document.getElementById('ai-feedback-text');
  if (!btn || !area || !text) return;

  btn.textContent = '🤖 AIが分析中...';
  btn.disabled = true;
  area.classList.add('hidden');

  const lang = getLangName();
  const system = 'あなたは' + lang + 'プログラミングの初心者向けの優しい家庭教師です。日本語で簡潔に答えてください。';
  const userMsg = '問題：' + p.question + '\n\n提出コード：\n```' + (currentLanguage||'cpp') + '\n' + code + '\n```\n\n良い点・改善点・アドバイスを初心者向けに教えてください。';

  try {
    const reply = await askAI(system, userMsg);
    area.classList.remove('hidden');
    text.innerHTML = escapeHtml(reply)
      .replace(/\n/g, '<br>')
      .replace(/`([^`]*)`/g, function(_, inner) { return '<code>' + inner + '</code>'; });
  } catch (e) {
    area.classList.remove('hidden');
    text.textContent = '⚠ AIに接続できませんでした。しばらく待ってから再試行してください。\n詳細: ' + e.message;
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
  el.innerHTML = escapeHtml(text)
    .replace(/\n/g, '<br>')
    .replace(/`([^`]*)`/g, function(_, inner) { return '<code>' + inner + '</code>'; });
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

async function sendChatMessage() {
  var input = document.getElementById('chat-input');
  if (!input) return;
  var message = input.value.trim();
  if (!message) return;

  addChatMessage('user', message);
  chatHistory.push({ role: 'user', content: message });
  if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  input.value = '';

  var typingId = 'typing-' + Date.now();
  addChatMessage('ai', '...', typingId);

  var system = 'あなたは' + getLangName() + 'プログラミングの初心者向けの優しい家庭教師です。日本語で答えてください。初心者が理解しやすい言葉で説明してください。';

  try {
    var reply = await askAI(system, chatHistory);
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
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

// ===== ランキング =====

var _rankingTab  = 'total';
var _rankingLang = 'cpp';

// ===== フォロー =====

var _followingSet = null; // Set<uid> | null (未ロード)

async function loadFollowing() {
  if (!currentUser || !_supabase) { _followingSet = new Set(); return; }
  try {
    var r = await _supabase.from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id)
      .limit(1000);
    if (r.error) {
      // エラー時は null のまま（次回呼び出しで再試行できるように）
      console.warn('loadFollowing error:', r.error.message);
      return;
    }
    _followingSet = new Set((r.data || []).map(function(x) { return x.following_id; }));
  } catch(e) {
    console.warn('loadFollowing exception:', e);
    // ネットワークエラー時も null のまま維持
  }
}

function isFollowing(uid) {
  return _followingSet ? _followingSet.has(uid) : false;
}

async function followUser(uid) {
  if (!currentUser || !_supabase) { openAuthModal(); return; }
  try {
    await _supabase.from('follows').insert({ follower_id: currentUser.id, following_id: uid });
    if (_followingSet) _followingSet.add(uid);
    showToast('フォローしました！');
    renderRanking();
  } catch(e) { showToast('フォローに失敗しました'); }
}

async function unfollowUser(uid) {
  if (!currentUser || !_supabase) return;
  try {
    await _supabase.from('follows')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', uid);
    if (_followingSet) _followingSet.delete(uid);
    showToast('フォロー解除しました');
    renderRanking();
  } catch(e) { showToast('フォロー解除に失敗しました'); }
}

async function toggleFollow(uid) {
  if (!currentUser) { openAuthModal(); return; }
  if (_followingSet === null) await loadFollowing();
  if (isFollowing(uid)) await unfollowUser(uid);
  else                  await followUser(uid);
}

async function getFollowCounts(uid) {
  if (!_supabase) return { following: 0, followers: 0 };
  try {
    var [f1, f2] = await Promise.all([
      _supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', uid),
      _supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', uid)
    ]);
    return { following: f1.count || 0, followers: f2.count || 0 };
  } catch(e) { return { following: 0, followers: 0 }; }
}

function _showSyncIndicator() {
  var el = document.getElementById('sync-indicator');
  if (!el) return;
  el.classList.add('visible');
  clearTimeout(_showSyncIndicator._t);
  _showSyncIndicator._t = setTimeout(function() { el.classList.remove('visible'); }, 2000);
}

async function syncUserStats(addedXP, lang) {
  if (!currentUser || !_supabase) return;
  var now  = new Date();
  var day  = now.getDay();
  var mon  = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  var _monJst = new Date(mon.getTime() + 9 * 60 * 60 * 1000);
  var weekStart = _monJst.toISOString().slice(0, 10);
  try {
    var r = await _supabase.from('user_stats').select('*').eq('user_id', currentUser.id).maybeSingle();
    var d = r.data;
    var isNew = !d || d.week_start < weekStart;
    var lc = (d && d.lang_cleared) ? Object.assign({}, d.lang_cleared) : {};
    lc[lang] = (lc[lang] || 0) + 1;
    await _supabase.from('user_stats').upsert({
      user_id:           currentUser.id,
      total_cleared:     (d ? d.total_cleared : 0) + 1,
      total_xp:          (d ? d.total_xp : 0) + addedXP,
      weekly_xp:         isNew ? addedXP : (d ? d.weekly_xp : 0) + addedXP,
      weekly_cleared:    isNew ? 1 : (d ? d.weekly_cleared : 0) + 1,
      prev_week_cleared: isNew ? (d ? d.weekly_cleared : 0) : (d ? d.prev_week_cleared : 0),
      week_start:        weekStart,
      lang_cleared:      lc,
      updated_at:        new Date().toISOString()
    });
    _showSyncIndicator();
  } catch(e) {}
}

// ===== キャリアページ =====

// phases: 入門/基礎/応用/実践 の4段階
var CAREER_PHASES = [
  { key: 'beginner',     label: '入門',  color: '#9B9B9B' },
  { key: 'basic',        label: '基礎',  color: '#C47A2F' },
  { key: 'advanced',     label: '応用',  color: '#5588FF' },
  { key: 'professional', label: '実践',  color: '#00E676' },
];

// phases: beginner/basic/advanced/professional の4段階
// 各 step に phase キーを付与
var CAREERS = [
  {
    id: 'frontend', icon: '🌐', color: '#F0C040',
    title: 'Webフロントエンドエンジニア',
    desc: 'WebサイトやWebアプリのUI・画面を作るエンジニア。目に見える部分を担当。',
    salary: '400〜750万円', demand: 5,
    csLangs: ['html', 'javascript', 'typescript'],
    steps: [
      { phase: 'beginner',     label: 'HTML/CSS',      color: '#E44D26', desc: 'マークアップ・レイアウト・スタイルの基礎' },
      { phase: 'basic',        label: 'JavaScript',    color: '#F0C040', desc: 'DOM操作・イベント・非同期処理' },
      { phase: 'basic',        label: 'Git / GitHub',  color: '#F05032', desc: 'バージョン管理の基礎' },
      { phase: 'advanced',     label: 'TypeScript',    color: '#3178C6', desc: '型安全な開発・型定義' },
      { phase: 'advanced',     label: 'React / Vue',   color: '#61DAFB', desc: 'コンポーネント設計・状態管理' },
      { phase: 'professional', label: 'テスト / CI',   color: '#FF6B00', desc: 'Jest・Vitest・GitHub Actions' },
      { phase: 'professional', label: '就職・転職',    color: '#00E676', desc: 'ポートフォリオ公開 → 内定' },
    ]
  },
  {
    id: 'backend', icon: '⚙️', color: '#00ADD8',
    title: 'バックエンドエンジニア',
    desc: 'サーバー・DB・APIなどシステムの裏側を設計・構築するエンジニア。',
    salary: '450〜850万円', demand: 5,
    csLangs: ['python', 'java', 'go', 'sql'],
    steps: [
      { phase: 'beginner',     label: 'Python / Java',  color: '#3776AB', desc: '変数・関数・OOP の基礎' },
      { phase: 'beginner',     label: 'SQL',             color: '#336791', desc: 'SELECT・JOIN・集計関数' },
      { phase: 'basic',        label: 'REST API',        color: '#FF6B00', desc: 'FastAPI / Spring でAPI設計' },
      { phase: 'basic',        label: 'Git / Linux',     color: '#4EAA25', desc: 'CLI操作・シェルスクリプト' },
      { phase: 'advanced',     label: 'Docker',          color: '#2496ED', desc: 'コンテナで環境構築・再現性確保' },
      { phase: 'advanced',     label: 'DB設計・最適化',  color: '#336791', desc: 'インデックス・正規化・チューニング' },
      { phase: 'professional', label: 'クラウド (AWS)',  color: '#FF9900', desc: 'EC2・RDS・Lambda・S3' },
      { phase: 'professional', label: '就職・転職',      color: '#00E676', desc: 'OSSコントリビュート → 内定' },
    ]
  },
  {
    id: 'ai', icon: '🤖', color: '#C040FF',
    title: 'AIエンジニア / データサイエンティスト',
    desc: '機械学習・深層学習モデルを開発しビジネス課題を解くエンジニア。',
    salary: '500〜1000万円', demand: 5,
    csLangs: ['python', 'sql'],
    steps: [
      { phase: 'beginner',     label: '数学基礎',        color: '#9B9B9B', desc: '統計・線形代数・微積分の概念' },
      { phase: 'beginner',     label: 'Python',          color: '#3776AB', desc: 'NumPy・Pandas でデータ処理' },
      { phase: 'basic',        label: 'データ可視化',    color: '#F0C040', desc: 'Matplotlib・Seaborn・EDA' },
      { phase: 'basic',        label: '機械学習',        color: '#C040FF', desc: 'scikit-learn・回帰・分類・クラスタリング' },
      { phase: 'advanced',     label: '深層学習',        color: '#EE4C2C', desc: 'PyTorch / TensorFlow・CNN・RNN' },
      { phase: 'advanced',     label: 'MLOps',           color: '#20BEFF', desc: 'モデル管理・デプロイ・監視' },
      { phase: 'professional', label: 'Kaggle / 論文',   color: '#C040FF', desc: 'コンペ上位 / arXiv で最新手法を追う' },
      { phase: 'professional', label: '就職・転職',      color: '#00E676', desc: '分析レポート・Kaggle実績 → 内定' },
    ]
  },
  {
    id: 'game', icon: '🎮', color: '#EFC050',
    title: 'ゲームエンジニア',
    desc: 'ゲームのシステム・物理演算・グラフィックを実装するエンジニア。',
    salary: '350〜700万円', demand: 3,
    csLangs: ['cpp', 'csharp'],
    steps: [
      { phase: 'beginner',     label: 'C# / C++',        color: '#00599C', desc: '変数・条件分岐・ループ・関数' },
      { phase: 'beginner',     label: 'Unity入門',        color: '#EFC050', desc: 'シーン・オブジェクト・スクリプト基礎' },
      { phase: 'basic',        label: '2Dゲーム制作',     color: '#FF6B00', desc: '当たり判定・アニメーション・音声' },
      { phase: 'basic',        label: 'OOP / デザパタ',   color: '#9B4F96', desc: 'State・Observer・Factory パターン' },
      { phase: 'advanced',     label: '3D / 物理演算',    color: '#C040FF', desc: 'Rigidbody・シェーダー・ライティング' },
      { phase: 'advanced',     label: 'Unreal Engine',    color: '#000000', desc: 'C++ 連携・ブループリント' },
      { phase: 'professional', label: '自作ゲーム公開',   color: '#5588FF', desc: 'Steam / App Store に申請' },
      { phase: 'professional', label: '就職・転職',       color: '#00E676', desc: 'ポートフォリオ → ゲーム会社内定' },
    ]
  },
  {
    id: 'mobile', icon: '📱', color: '#FA7343',
    title: 'モバイルアプリエンジニア',
    desc: 'iOSやAndroidのスマホアプリを開発するエンジニア。',
    salary: '400〜800万円', demand: 4,
    csLangs: ['swift', 'kotlin'],
    steps: [
      { phase: 'beginner',     label: 'Swift / Kotlin',    color: '#FA7343', desc: '基本構文・クラス・プロトコル' },
      { phase: 'beginner',     label: 'UIの基礎',           color: '#7F52FF', desc: 'SwiftUI / Jetpack Compose' },
      { phase: 'basic',        label: 'API連携',            color: '#FF6B00', desc: 'URLSession / Retrofit でデータ取得' },
      { phase: 'basic',        label: 'ローカルDB',         color: '#336791', desc: 'CoreData / Room でデータ永続化' },
      { phase: 'advanced',     label: 'テスト・CI/CD',      color: '#00C8B4', desc: 'XCTest・Fastlane・GitHub Actions' },
      { phase: 'advanced',     label: 'パフォーマンス最適化', color: '#EFC050', desc: 'メモリ・描画・バッテリー効率' },
      { phase: 'professional', label: 'ストア申請',         color: '#FA7343', desc: 'App Store / Google Play 審査対応' },
      { phase: 'professional', label: '就職・転職',         color: '#00E676', desc: 'リリース実績 → 内定' },
    ]
  },
  {
    id: 'infra', icon: '☁️', color: '#00C8B4',
    title: 'インフラ / SREエンジニア',
    desc: 'サーバー・ネットワーク・クラウドを管理し、サービスを安定稼働させる。',
    salary: '450〜900万円', demand: 4,
    csLangs: ['bash', 'python', 'go'],
    steps: [
      { phase: 'beginner',     label: 'Linux 基礎',     color: '#4EAA25', desc: 'ファイル操作・権限・プロセス管理' },
      { phase: 'beginner',     label: 'Bash スクリプト', color: '#4EAA25', desc: 'シェル自動化・cronジョブ' },
      { phase: 'basic',        label: 'ネットワーク',    color: '#9B9B9B', desc: 'TCP/IP・DNS・HTTP・SSL/TLS' },
      { phase: 'basic',        label: 'Docker',          color: '#2496ED', desc: 'コンテナ化・Compose・レジストリ' },
      { phase: 'advanced',     label: 'Kubernetes',      color: '#326CE5', desc: 'Pod・Service・Ingress・Helm' },
      { phase: 'advanced',     label: 'Terraform / IaC', color: '#7B42BC', desc: 'インフラをコードで管理' },
      { phase: 'professional', label: 'AWS / GCP',       color: '#FF9900', desc: 'クラウド設計・コスト最適化・SLO' },
      { phase: 'professional', label: '就職・転職',      color: '#00E676', desc: '資格(AWS SAA等) → 内定' },
    ]
  },
  {
    id: 'security', icon: '🔐', color: '#FF453A',
    title: 'セキュリティエンジニア',
    desc: 'サイバー攻撃から企業・システムを守る。脆弱性診断・ペネトレーションテストを行う。',
    salary: '500〜1000万円', demand: 4,
    csLangs: ['python', 'c', 'bash', 'regex'],
    steps: [
      { phase: 'beginner',     label: 'ネットワーク基礎',    color: '#9B9B9B', desc: 'TCP/IP・HTTP・パケット解析' },
      { phase: 'beginner',     label: 'Linux / C',            color: '#A8B9CC', desc: 'OS・低レイヤ・メモリ構造' },
      { phase: 'basic',        label: 'Python でツール作成',  color: '#3776AB', desc: 'スキャン・自動化ツール自作' },
      { phase: 'basic',        label: '脆弱性の種類を学ぶ',  color: '#FF453A', desc: 'OWASP Top10・XSS・SQLi・CSRF' },
      { phase: 'advanced',     label: 'CTF 参加',             color: '#FF453A', desc: 'picoCTF・HackTheBox で実戦練習' },
      { phase: 'advanced',     label: 'ペネトレーションテスト', color: '#EFC050', desc: 'Metasploit・Burp Suite 等の利用' },
      { phase: 'professional', label: '資格取得',             color: '#EFC050', desc: '情報処理安全確保支援士・CEH・OSCP' },
      { phase: 'professional', label: '就職・転職',           color: '#00E676', desc: 'CTF実績・資格 → セキュリティ職内定' },
    ]
  },
  {
    id: 'embedded', icon: '🔧', color: '#A8B9CC',
    title: '組み込み / ファームウェアエンジニア',
    desc: '家電・自動車・IoT機器などのハードウェアを動かすプログラムを書く。',
    salary: '400〜750万円', demand: 3,
    csLangs: ['c', 'cpp'],
    steps: [
      { phase: 'beginner',     label: 'C言語基礎',       color: '#A8B9CC', desc: 'ポインタ・配列・構造体・関数' },
      { phase: 'beginner',     label: '電子回路基礎',     color: '#9B9B9B', desc: 'オームの法則・センサ・デジタル回路' },
      { phase: 'basic',        label: 'Arduino 入門',     color: '#00979D', desc: 'GPIO・PWM・I2C・UART で制御' },
      { phase: 'basic',        label: 'C++ / OOP',        color: '#00599C', desc: 'クラス・継承・テンプレート' },
      { phase: 'advanced',     label: 'RTOS',             color: '#EFC050', desc: 'FreeRTOS・タスク管理・割り込み' },
      { phase: 'advanced',     label: 'Linux 組み込み',   color: '#4EAA25', desc: 'Yocto・デバイスドライバ・カーネル' },
      { phase: 'professional', label: '自動車 / IoT開発', color: '#A8B9CC', desc: 'AUTOSAR・MISRA-C・機能安全' },
      { phase: 'professional', label: '就職・転職',       color: '#00E676', desc: '電機・自動車メーカー等 → 内定' },
    ]
  },
  {
    id: 'competitive', icon: '🏆', color: '#FFD700',
    title: '競技プログラマー',
    desc: 'AtCoder・Codeforces・LeetCode等でアルゴリズム問題を解き、レーティングを競う。上位入賞は大手企業への就職直結。',
    salary: '賞金 / 高待遇内定', demand: 4,
    csLangs: ['cpp', 'python'],
    steps: [
      { phase: 'beginner',     label: '基本アルゴリズム',   color: '#FFD700', desc: 'ソート・探索・累積和・二分探索' },
      { phase: 'beginner',     label: 'AtCoder 入茶',       color: '#C47A2F', desc: '茶色レート達成・グリーディ・全探索' },
      { phase: 'basic',        label: 'データ構造',         color: '#808080', desc: '木・グラフ・ヒープ・Union-Find' },
      { phase: 'basic',        label: 'AtCoder 入緑',       color: '#008000', desc: '動的計画法・BFS/DFS マスター' },
      { phase: 'advanced',     label: '高度なDP / グラフ',  color: '#00C0C0', desc: 'セグ木・Dijkstra・最小全域木' },
      { phase: 'advanced',     label: 'AtCoder 水〜青',     color: '#0000FF', desc: 'フロー・文字列・数論・幾何アルゴリズム' },
      { phase: 'professional', label: 'AtCoder 黄〜赤',     color: '#FFD700', desc: '国際情報オリンピック・世界大会レベル' },
      { phase: 'professional', label: 'GAFA直接スカウト',   color: '#00E676', desc: 'レーティングで Google・Meta から声がかかる' },
    ]
  },
  {
    id: 'blockchain', icon: '⛓️', color: '#F6851B',
    title: 'ブロックチェーンエンジニア',
    desc: 'Ethereum・Solana等のスマートコントラクトを開発。DeFi・NFT・Web3インフラを構築する。',
    salary: '600〜1500万円以上', demand: 4,
    csLangs: ['javascript', 'python', 'rust'],
    steps: [
      { phase: 'beginner',     label: 'ブロックチェーン基礎', color: '#F6851B', desc: '分散台帳・コンセンサス・ウォレットの仕組み' },
      { phase: 'beginner',     label: 'Solidity 入門',        color: '#363636', desc: 'EVM・コントラクト・ABI・デプロイ' },
      { phase: 'basic',        label: 'DeFi 開発',            color: '#2775CA', desc: 'Uniswap・Aave 等のプロトコル実装' },
      { phase: 'basic',        label: 'テスト / セキュリティ', color: '#FF6B00', desc: 'Hardhat・Foundry・再入攻撃対策' },
      { phase: 'advanced',     label: 'Layer2 / ZK',          color: '#8247E5', desc: 'Optimism・zkSync・ゼロ知識証明' },
      { phase: 'advanced',     label: 'Rust / Solana',        color: '#9945FF', desc: '高速チェーン向けの低レベル開発' },
      { phase: 'professional', label: 'プロトコル設計',       color: '#F6851B', desc: '独自チェーン・クロスチェーン bridge' },
      { phase: 'professional', label: '就職・独立',           color: '#00E676', desc: 'Web3スタートアップ・フリーランス → 高報酬' },
    ]
  },
  {
    id: 'xr', icon: '🥽', color: '#00D4FF',
    title: 'VR / ARエンジニア',
    desc: 'Meta Quest・Apple Vision Pro・HoloLens 向けのXRアプリを開発。ゲーム・医療・教育・産業など応用範囲が広い。',
    salary: '450〜900万円', demand: 3,
    csLangs: ['csharp', 'cpp'],
    steps: [
      { phase: 'beginner',     label: 'C# / Unity 基礎',    color: '#00D4FF', desc: 'GameObject・Transform・物理エンジン' },
      { phase: 'beginner',     label: '3D数学',              color: '#00AACC', desc: 'ベクトル・クォータニオン・行列変換' },
      { phase: 'basic',        label: 'XR SDK 入門',         color: '#0088AA', desc: 'OpenXR・ARFoundation・XR Interaction Toolkit' },
      { phase: 'basic',        label: 'UI/UX for XR',        color: '#006688', desc: '空間UI設計・視線入力・ジェスチャー操作' },
      { phase: 'advanced',     label: 'シェーダー / グラフィクス', color: '#00D4FF', desc: 'HLSL・URP・パフォーマンス最適化' },
      { phase: 'advanced',     label: 'MR / 空間認識',       color: '#00FFFF', desc: 'ARKit・ARCore・SLAM・平面検出' },
      { phase: 'professional', label: 'Vision Pro / Quest3', color: '#555555', desc: 'Apple・Meta の最新デバイス対応開発' },
      { phase: 'professional', label: '就職・転職',          color: '#00E676', desc: 'メタバース企業・医療・製造 → 内定' },
    ]
  },
  {
    id: 'robotics', icon: '🤖', color: '#FF6B35',
    title: 'ロボティクスエンジニア',
    desc: '産業ロボット・自律ドローン・自動運転に組み込まれるシステムを開発。ハードとソフトの両方の知識が必要。',
    salary: '450〜850万円', demand: 4,
    csLangs: ['cpp', 'python', 'c'],
    steps: [
      { phase: 'beginner',     label: 'C++ / Python 基礎',   color: '#FF6B35', desc: 'プログラミングとLinux操作の基礎' },
      { phase: 'beginner',     label: '制御理論基礎',        color: '#FF5522', desc: 'PID制御・フィードバックループ' },
      { phase: 'basic',        label: 'ROS 2 入門',          color: '#22314E', desc: 'ノード・トピック・サービス・tf変換' },
      { phase: 'basic',        label: 'センサ統合',          color: '#FF8844', desc: 'LiDAR・カメラ・IMU でデータ取得' },
      { phase: 'advanced',     label: '自律ナビゲーション',  color: '#FF4400', desc: 'SLAM・パス計画・Nav2 スタック' },
      { phase: 'advanced',     label: 'コンピュータビジョン', color: '#FFAA22', desc: 'YOLO・点群処理・物体認識' },
      { phase: 'professional', label: '自動運転 / ドローン', color: '#FF6B35', desc: 'Autoware・PX4・ROS2 Control' },
      { phase: 'professional', label: '就職・転職',          color: '#00E676', desc: '自動車メーカー・宇宙・製造ロボ企業 → 内定' },
    ]
  },
  {
    id: 'dataeng', icon: '📊', color: '#1BA3C8',
    title: 'データエンジニア',
    desc: 'データパイプライン・ETL・データ基盤を設計・構築する。データサイエンティストが使いやすい環境を整えるインフラ担当。',
    salary: '500〜950万円', demand: 5,
    csLangs: ['python', 'sql', 'go'],
    steps: [
      { phase: 'beginner',     label: 'Python / SQL 基礎',   color: '#1BA3C8', desc: 'データ操作・集計・結合の基本' },
      { phase: 'beginner',     label: 'Linux / クラウド基礎', color: '#158AAA', desc: 'AWS S3・GCS・コマンドライン操作' },
      { phase: 'basic',        label: 'ETL パイプライン',    color: '#1270A0', desc: 'Airflow・dbt・データ変換フロー設計' },
      { phase: 'basic',        label: 'データウェアハウス',  color: '#0F5888', desc: 'BigQuery・Snowflake・Redshift' },
      { phase: 'advanced',     label: 'ストリーミング処理',  color: '#1BA3C8', desc: 'Kafka・Spark Streaming・Flink' },
      { phase: 'advanced',     label: 'データ品質 / ガバナンス', color: '#2BC5EE', desc: 'Great Expectations・データカタログ' },
      { phase: 'professional', label: 'データメッシュ設計',  color: '#1BA3C8', desc: '大規模分散データ基盤のアーキテクト' },
      { phase: 'professional', label: '就職・転職',          color: '#00E676', desc: 'テック企業・データ活用企業 → 内定' },
    ]
  },
  {
    id: 'oss', icon: '🌐', color: '#F05032',
    title: 'OSS開発者 / カーネルコントリビューター',
    desc: 'Linux カーネル・GCC・LLVM・主要OSSに貢献するエンジニア。企業スポンサー付きで開発専業も可能。',
    salary: '企業スポンサー付き600〜1200万円', demand: 3,
    csLangs: ['c', 'cpp', 'rust'],
    steps: [
      { phase: 'beginner',     label: 'C / C++ 深堀り',      color: '#F05032', desc: 'ポインタ・カーネルABI・低レベル設計' },
      { phase: 'beginner',     label: 'Git 完全理解',         color: '#F05032', desc: 'パッチ送付・rebase・コミット粒度' },
      { phase: 'basic',        label: 'OSS への Issue / PR',  color: '#DD4422', desc: 'バグ報告・ドキュメント・小さな修正から' },
      { phase: 'basic',        label: 'コードレビュー文化',   color: '#CC3311', desc: 'メンテナとのコミュニケーション・英語' },
      { phase: 'advanced',     label: 'Linuxカーネル開発',   color: '#AA2200', desc: 'LKML へのパッチ・デバイスドライバ' },
      { phase: 'advanced',     label: 'Rust in Linux',        color: '#DEA584', desc: 'カーネルへの Rust 統合・メモリ安全' },
      { phase: 'professional', label: 'メンテナー就任',       color: '#F05032', desc: '特定サブシステムのオーナーになる' },
      { phase: 'professional', label: '企業スポンサー獲得',   color: '#00E676', desc: 'Red Hat・Google・Meta がフルタイムで雇用' },
    ]
  },
  {
    id: 'quantum', icon: '⚛️', color: '#9B59B6',
    title: '量子コンピュータエンジニア',
    desc: '量子回路・量子アルゴリズムを実装し、量子化学・最適化・暗号分野の問題を解く。最先端中の最先端。',
    salary: '600〜1500万円（研究職含む）', demand: 2,
    csLangs: ['python', 'c', 'rust'],
    steps: [
      { phase: 'beginner',     label: '数学・物理基礎',      color: '#9B59B6', desc: '線形代数・複素数・量子力学の概念' },
      { phase: 'beginner',     label: 'Python / Qiskit',     color: '#8844AA', desc: 'IBM Quantum・量子回路の基本操作' },
      { phase: 'basic',        label: '量子ゲート / 回路',   color: '#7733AA', desc: 'Hadamard・CNOT・量子もつれ・測定' },
      { phase: 'basic',        label: '量子アルゴリズム',    color: '#6622AA', desc: 'Grover・Shor・QAOA・VQE' },
      { phase: 'advanced',     label: 'ノイズ対策 / NISQ',   color: '#9B59B6', desc: 'エラー訂正・ノイズのある中規模量子デバイス' },
      { phase: 'advanced',     label: '量子ML / 化学計算',   color: '#BB77DD', desc: '量子機械学習・分子シミュレーション' },
      { phase: 'professional', label: '量子ハードウェア連携', color: '#9B59B6', desc: 'IBM・Google・IonQ の実機で実験' },
      { phase: 'professional', label: '研究機関 / 企業就職', color: '#00E676', desc: '大学院・国研・量子スタートアップ → 超高待遇' },
    ]
  },
  {
    id: 'compiler', icon: '🔬', color: '#8B4513',
    title: 'コンパイラ/言語エンジニア',
    desc: '字句解析・構文解析・コード生成を実装し、プログラミング言語処理系・コンパイラ・インタプリタを開発する。最も深いレイヤーの職種。',
    salary: '550〜1100万円', demand: 2,
    csLangs: ['c', 'cpp', 'rust'],
    steps: [
      { phase: 'beginner',     label: '計算機科学基礎',        color: '#8B4513', desc: 'オートマトン・形式言語・文脈自由文法の概念' },
      { phase: 'beginner',     label: 'C / C++ / Rust',        color: '#A0522D', desc: '低レベル言語・メモリ管理・コンパイル処理の基礎' },
      { phase: 'basic',        label: '字句解析・構文解析',    color: '#CD853F', desc: '手書きParserとBison/ANTLRの基礎' },
      { phase: 'basic',        label: '抽象構文木(AST)',        color: '#DEB887', desc: 'ノード設計・意味解析・型チェック' },
      { phase: 'advanced',     label: 'コード生成',             color: '#8B4513', desc: 'アセンブリ出力・LLVM IR・最適化パス設計' },
      { phase: 'advanced',     label: '最適化技術',             color: '#A0522D', desc: '定数畳み込み・不要コード除去・インライン展開' },
      { phase: 'professional', label: '独自言語設計',          color: '#CD853F', desc: 'EBNF仕様書・エラーメッセージ設計・標準ライブラリ' },
      { phase: 'professional', label: '就職・転職',             color: '#00E676', desc: 'LLVM/GCC貢献・Apple・Google・JetBrains → 内定' },
    ]
  },
  {
    id: 'creative', icon: '🎨', color: '#FF69B4',
    title: 'クリエイティブコーダー',
    desc: 'p5.js・openFrameworks・TouchDesignerなどで「動く絵」「音に反応するビジュアル」「AIアート」を作る。コードと芸術の境界を消す職種。',
    salary: '作品販売・ライブ演出・企業案件', demand: 2,
    csLangs: ['javascript', 'cpp', 'python'],
    steps: [
      { phase: 'beginner',     label: '数学・アート基礎',      color: '#FF69B4', desc: '三角関数・ベクトル・色彩理論・デザイン原則' },
      { phase: 'beginner',     label: 'p5.js 入門',             color: '#FF1493', desc: 'キャンバス・描画・アニメーションループ' },
      { phase: 'basic',        label: 'ジェネラティブアート',   color: '#FF69B4', desc: 'パーリンノイズ・フラクタル・粒子システム' },
      { phase: 'basic',        label: 'openFrameworks / C++',   color: '#CC1177', desc: 'リアルタイム映像処理・OpenGL' },
      { phase: 'advanced',     label: '音楽×ビジュアル',        color: '#FF69B4', desc: 'Web Audio API・FFT・音に反応するグラフィクス' },
      { phase: 'advanced',     label: 'GLSLシェーダー',         color: '#FF1493', desc: '頂点シェーダー・フラグメントシェーダー・SDF' },
      { phase: 'professional', label: 'AIアート統合',           color: '#FF69B4', desc: 'Stable Diffusion・ControlNet×コード生成' },
      { phase: 'professional', label: '発表・受注',             color: '#00E676', desc: 'NFT・ライブVJ・企業インスタレーション制作' },
    ]
  },
  {
    id: 'bioinformatics', icon: '🧬', color: '#00B050',
    title: 'バイオインフォマティクスエンジニア',
    desc: 'DNAシーケンス解析・創薬AI・タンパク質構造予測など生命科学のデータ処理を行う。PythonとAI両方の知識が必要。AlphaFold以来注目度急上昇。',
    salary: '500〜950万円（研究職含む）', demand: 3,
    csLangs: ['python', 'sql', 'c'],
    steps: [
      { phase: 'beginner',     label: '生物学基礎',             color: '#00B050', desc: 'DNA・タンパク質・セントラルドグマの概念' },
      { phase: 'beginner',     label: 'Python / Biopython',     color: '#009040', desc: 'FASTA形式・塩基配列操作・Pandas' },
      { phase: 'basic',        label: '統計・R / SciPy',        color: '#00B050', desc: '統計検定・主成分分析・クラスタリング' },
      { phase: 'basic',        label: '次世代シーケンサー解析', color: '#007030', desc: 'FastQC・STAR・SAMtools でRNA-seq' },
      { phase: 'advanced',     label: 'タンパク質構造予測',     color: '#00B050', desc: 'AlphaFold・PyMOL・構造ベース創薬' },
      { phase: 'advanced',     label: 'シングルセル解析',       color: '#009040', desc: 'scRNA-seq・Seurat / Scanpy' },
      { phase: 'professional', label: '創薬AI開発',             color: '#00B050', desc: '分子グラフNN・ドッキングシミュレーション' },
      { phase: 'professional', label: '就職・転職',             color: '#00E676', desc: '製薬会社・バイオスタートアップ → 内定' },
    ]
  },
  {
    id: 'space', icon: '🚀', color: '#1A1AFF',
    title: '宇宙/衛星ソフトウェアエンジニア',
    desc: '衛星・ロケット・宇宙探査機に搭載されるフライトソフトウェアを開発する。JAXA・SpaceX・ispace などが主要雇用先。究極のミッションクリティカル。',
    salary: '500〜1000万円', demand: 2,
    csLangs: ['c', 'cpp', 'python'],
    steps: [
      { phase: 'beginner',     label: 'C / C++ 基礎',           color: '#1A1AFF', desc: '確実な基礎がすべての前提・ポインタ・組み込み' },
      { phase: 'beginner',     label: '軌道力学・制御理論',     color: '#3333FF', desc: 'ケプラー方程式・PID制御・姿勢制御の概念' },
      { phase: 'basic',        label: 'リアルタイムOS',         color: '#5555FF', desc: 'FreeRTOS・VxWorks・タスク管理・割り込み' },
      { phase: 'basic',        label: 'MISRA-C / DO-178C',      color: '#7777FF', desc: '航空宇宙向け安全規格・コーディング標準' },
      { phase: 'advanced',     label: '姿勢制御システム',       color: '#1A1AFF', desc: 'スタートラッカー・リアクションホイール制御' },
      { phase: 'advanced',     label: 'GNC開発',                color: '#3333FF', desc: '誘導・航法・制御の統合ソフトウェア設計' },
      { phase: 'professional', label: '地上局・テレメトリ',     color: '#5555FF', desc: '衛星との通信プロトコル設計・リアルタイム監視' },
      { phase: 'professional', label: '就職・転職',             color: '#00E676', desc: 'JAXA・三菱重工・ispace・Axelspace → 内定' },
    ]
  },
  {
    id: 'audio', icon: '🎵', color: '#E040FB',
    title: '音響DSPエンジニア',
    desc: 'DAW・シンセサイザー・ANCノイキャン・空間音響など音のソフトウェアを開発する。物理×数学×プログラミングの融合。Apple・Sony・Roland等が雇用先。',
    salary: '450〜900万円', demand: 2,
    csLangs: ['c', 'cpp', 'python'],
    steps: [
      { phase: 'beginner',     label: '音響理論基礎',           color: '#E040FB', desc: '波形・周波数・サンプリング定理・フーリエ変換' },
      { phase: 'beginner',     label: 'C / C++ 基礎',           color: '#CC33DD', desc: '低レイテンシ・リアルタイム処理・バッファ管理' },
      { phase: 'basic',        label: 'デジタルフィルター',     color: '#E040FB', desc: 'FIR・IIRフィルター・ローパス・バンドパス設計' },
      { phase: 'basic',        label: 'JUCE フレームワーク',    color: '#AA22CC', desc: 'クロスプラットフォームオーディオプラグイン開発' },
      { phase: 'advanced',     label: 'シンセサイザー開発',     color: '#E040FB', desc: 'FM合成・ウェーブテーブル・加算合成の実装' },
      { phase: 'advanced',     label: '空間音響',               color: '#CC33DD', desc: 'バイノーラル・アンビソニックス・HRTF処理' },
      { phase: 'professional', label: 'ANC / ノイキャン開発',   color: '#E040FB', desc: 'AirPods・WH-1000X級の適応フィルタリング' },
      { phase: 'professional', label: '就職・転職',             color: '#00E676', desc: 'Apple・Sony・ヤマハ・Roland・DAWメーカー → 内定' },
    ]
  },
  {
    id: 'uiux', icon: '✏️', color: '#FE5D26',
    title: 'UI/UXデザイナー',
    desc: 'ユーザーリサーチ・情報設計・プロトタイプ作成から視覚デザインまで手がける。コードも書けるデザイナーは特に高需要。',
    salary: '400〜800万円', demand: 4,
    csLangs: ['html', 'javascript'],
    steps: [
      { phase: 'beginner',     label: 'デザイン基礎',           color: '#FE5D26', desc: 'レイアウト・タイポグラフィ・色彩理論・Gestalt原則' },
      { phase: 'beginner',     label: 'Figma 入門',             color: '#EE4D16', desc: 'コンポーネント・オートレイアウト・プロトタイプ' },
      { phase: 'basic',        label: 'ユーザーリサーチ',       color: '#FE5D26', desc: 'インタビュー・ユーザビリティテスト・アクセシビリティ' },
      { phase: 'basic',        label: '情報アーキテクチャ',     color: '#DD3D06', desc: 'IA設計・カードソート・フローマップ作成' },
      { phase: 'advanced',     label: 'デザインシステム',       color: '#FE5D26', desc: 'コンポーネントライブラリ・デザイントークン管理' },
      { phase: 'advanced',     label: 'フロントエンド連携',     color: '#EE4D16', desc: 'HTML/CSS/JS でプロトタイプ実装・デザイン→コード' },
      { phase: 'professional', label: 'プロダクト思考',         color: '#FE5D26', desc: 'OKR・グロースデザイン・A/Bテスト設計' },
      { phase: 'professional', label: '就職・転職',             color: '#00E676', desc: 'SaaS企業・スタートアップ・大手テック → 内定' },
    ]
  },
  {
    id: 'mlops', icon: '🔄', color: '#20B2AA',
    title: 'MLOpsエンジニア',
    desc: 'AIモデルをプロダクション環境で安定稼働させるインフラを構築・運用する。AI開発とSREを橋渡しする役職で需要急増中。',
    salary: '600〜1100万円', demand: 5,
    csLangs: ['python', 'go', 'bash'],
    steps: [
      { phase: 'beginner',     label: 'Python / Linux 基礎',    color: '#20B2AA', desc: 'スクリプト・Docker・クラウド基礎' },
      { phase: 'beginner',     label: '機械学習基礎',           color: '#1A9090', desc: 'モデルの学習・評価・推論の仕組みを理解' },
      { phase: 'basic',        label: 'MLパイプライン',         color: '#20B2AA', desc: 'Airflow・Kubeflow・MLflow で実験管理' },
      { phase: 'basic',        label: 'モデルサービング',       color: '#159090', desc: 'FastAPI・Triton Inference Server・TorchServe' },
      { phase: 'advanced',     label: '継続的学習 / 監視',      color: '#20B2AA', desc: 'データドリフト検知・自動再学習・モデル監視' },
      { phase: 'advanced',     label: 'Kubernetes × GPU',       color: '#1A9090', desc: 'Ray・KubeFlow Pipelines・GPU Operator' },
      { phase: 'professional', label: 'フィーチャーストア設計', color: '#20B2AA', desc: 'Feast・Tecton・大規模特徴量管理アーキテクト' },
      { phase: 'professional', label: '就職・転職',             color: '#00E676', desc: 'テック企業・AI特化スタートアップ → 内定' },
    ]
  },
  {
    id: 'cto', icon: '👑', color: '#C0392B',
    title: 'スタートアップCTO / テックリード',
    desc: '技術選定・チームビルディング・プロダクトのアーキテクチャ決定まで担う技術のトップ。エンジニアとしてのゴール職のひとつ。',
    salary: '800〜2000万円以上 ＋エクイティ', demand: 3,
    csLangs: ['javascript', 'python', 'go'],
    steps: [
      { phase: 'beginner',     label: '幅広いスキル習得',       color: '#C0392B', desc: '複数言語・DB・インフラ・セキュリティの基礎' },
      { phase: 'beginner',     label: 'OSSコントリビュート',    color: '#A93226', desc: '副業・OSS・GitHubに実績を積む' },
      { phase: 'basic',        label: 'リードエンジニア経験',   color: '#C0392B', desc: 'チームの技術的意思決定・コードレビュー主導' },
      { phase: 'basic',        label: 'システム設計',           color: '#922B21', desc: 'スケーラビリティ・可用性・セキュリティ設計' },
      { phase: 'advanced',     label: 'プロダクト思考',         color: '#C0392B', desc: 'ビジネス目標との技術戦略整合・ロードマップ策定' },
      { phase: 'advanced',     label: 'チームビルディング',     color: '#A93226', desc: '採用・技術文化形成・エンジニア育成' },
      { phase: 'professional', label: '資金調達との連携',       color: '#C0392B', desc: 'VCへの技術説明・デューデリジェンス対応' },
      { phase: 'professional', label: 'Exit / 独立',           color: '#00E676', desc: '上場・M&A → 次のスタートアップ創業というループ' },
    ]
  },
];

var _careerSelected = null;

function _getLangData(lid) {
  return LANGUAGE_GROUPS.reduce(function(found, g) {
    return found || g.langs.find(function(l) { return l.id === lid; });
  }, null);
}

function renderCareer() {
  var el = document.getElementById('career-content');
  if (!el) return;
  var stats = getProfileStats();

  var cardsHTML = CAREERS.map(function(c) {
    var isOpen = _careerSelected === c.id;

    // 関連言語の習得率
    var relevantPct = c.csLangs.map(function(lid) {
      var ld = _getLangData(lid);
      var total   = ld ? ld.problems : 30;
      var cleared = stats[lid] || 0;
      return { lid: lid, pct: Math.round(cleared / total * 100), name: ld ? ld.name : lid, color: ld ? ld.color : '#FF6B00' };
    });
    var avgPct = relevantPct.length
      ? Math.round(relevantPct.reduce(function(s, x) { return s + x.pct; }, 0) / relevantPct.length)
      : 0;

    // 難易度フェーズ別ロードマップ
    var roadmapHTML = CAREER_PHASES.map(function(phase) {
      var phaseSteps = c.steps.filter(function(s) { return s.phase === phase.key; });
      if (!phaseSteps.length) return '';
      var stepsHTML = phaseSteps.map(function(step) {
        return '<div class="cr-step">' +
          '<div class="cr-step-dot" style="background:' + step.color + ';box-shadow:0 0 6px ' + step.color + '88"></div>' +
          '<div class="cr-step-body">' +
            '<div class="cr-step-label" style="color:' + step.color + '">' + step.label + '</div>' +
            '<div class="cr-step-desc">' + step.desc + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      return '<div class="cr-phase">' +
        '<div class="cr-phase-head">' +
          '<div class="cr-phase-badge" style="background:' + phase.color + '22;border-color:' + phase.color + '55;color:' + phase.color + '">' + phase.label + '</div>' +
          '<div class="cr-phase-line" style="background:linear-gradient(90deg,' + phase.color + '40,transparent)"></div>' +
        '</div>' +
        '<div class="cr-phase-steps">' + stepsHTML + '</div>' +
      '</div>';
    }).join('');

    // 関連言語タグ（クリックで問題へジャンプ）
    var langTagsHTML = relevantPct.map(function(lp) {
      var fillW = lp.pct + '%';
      return '<div class="cr-lang-tag cr-lang-clickable" style="border-color:' + lp.color + '55" onclick="event.stopPropagation();goToLangProblems(\'' + lp.lid + '\',\'' + c.id + '\')" title="' + lp.name + 'の問題へ">' +
        '<span class="cr-lang-name" style="color:' + lp.color + '">' + lp.name + '</span>' +
        '<div class="cr-lang-bar-wrap"><div class="cr-lang-bar-fill" style="width:' + fillW + ';background:' + lp.color + '"></div></div>' +
        '<span class="cr-lang-pct" style="color:' + lp.color + '">' + lp.pct + '%</span>' +
        '<span class="cr-lang-go" style="color:' + lp.color + '">▶</span>' +
      '</div>';
    }).join('');

    // 需要ドット
    var demandDots = '';
    for (var d = 0; d < 5; d++) {
      demandDots += '<span class="cr-demand-dot' + (d < c.demand ? ' cr-demand-on' : '') + '" style="' + (d < c.demand ? 'background:' + c.color + ';box-shadow:0 0 5px ' + c.color : '') + '"></span>';
    }

    return '<div class="career-card' + (isOpen ? ' career-card-open' : '') + '" onclick="toggleCareer(\'' + c.id + '\')" style="--cc:' + c.color + '">' +
      '<div class="career-card-head">' +
        '<div class="career-card-icon">' + c.icon + '</div>' +
        '<div class="career-card-info">' +
          '<div class="career-card-title">' + c.title + '</div>' +
          '<div class="career-card-sub">' +
            '<span class="cr-salary">💴 ' + c.salary + '</span>' +
            '<span class="cr-demand">' + demandDots + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="career-card-avg' + (avgPct > 0 ? ' cr-avg-active' : '') + '">' +
          '<div class="cr-avg-num">' + avgPct + '%</div>' +
          '<div class="cr-avg-label">習得度</div>' +
        '</div>' +
        '<div class="career-card-arrow">' + (isOpen ? '▲' : '▼') + '</div>' +
      '</div>' +
      (isOpen
        ? '<div class="career-card-body" onclick="event.stopPropagation()">' +
            '<div class="career-desc">' + c.desc + '</div>' +
            '<div class="cr-section-label">▸ 学習ロードマップ（難易度別）</div>' +
            '<div class="cr-roadmap-phases">' + roadmapHTML + '</div>' +
            '<div class="cr-section-label">▸ この職業の問題を解く</div>' +
            '<div class="cr-lang-tags">' + langTagsHTML + '</div>' +
          '</div>'
        : '') +
    '</div>';
  }).join('');

  // 闇の仕事カード
  var darkCardsHTML = DARK_CAREERS.map(function(c) {
    var isOpen = _darkCareerSelected === c.id;

    var roadmapHTML = CAREER_PHASES.map(function(phase) {
      var phaseSteps = c.steps.filter(function(s) { return s.phase === phase.key; });
      if (!phaseSteps.length) return '';
      var stepsHTML = phaseSteps.map(function(step) {
        return '<div class="cr-step">' +
          '<div class="cr-step-dot" style="background:' + step.color + ';box-shadow:0 0 6px ' + step.color + '88"></div>' +
          '<div class="cr-step-body">' +
            '<div class="cr-step-label" style="color:' + step.color + '">' + step.label + '</div>' +
            '<div class="cr-step-desc">' + step.desc + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      return '<div class="cr-phase">' +
        '<div class="cr-phase-head">' +
          '<div class="cr-phase-badge" style="background:' + phase.color + '22;border-color:' + phase.color + '55;color:' + phase.color + '">' + phase.label + '</div>' +
          '<div class="cr-phase-line" style="background:linear-gradient(90deg,' + phase.color + '40,transparent)"></div>' +
        '</div>' +
        '<div class="cr-phase-steps">' + stepsHTML + '</div>' +
      '</div>';
    }).join('');

    var riskDots = '';
    for (var d = 0; d < 5; d++) {
      riskDots += '<span class="cr-demand-dot' + (d < c.riskLevel ? ' cr-demand-on' : '') + '" style="' + (d < c.riskLevel ? 'background:#FF2222;box-shadow:0 0 5px #FF2222' : '') + '"></span>';
    }

    var langTagsHTML = c.csLangs.map(function(lid) {
      var ld = _getLangData(lid);
      var lcolor = ld ? ld.color : '#FF6B00';
      var lname  = ld ? ld.name  : lid;
      return '<div class="cr-lang-tag" style="border-color:' + lcolor + '55">' +
        '<span class="cr-lang-name" style="color:' + lcolor + '">' + lname + '</span>' +
        '<div class="cr-lang-bar-wrap"><div class="cr-lang-bar-fill" style="width:0%;background:' + lcolor + '"></div></div>' +
        '<span class="cr-lang-pct" style="color:' + lcolor + '">--</span>' +
      '</div>';
    }).join('');

    return '<div class="career-card dark-career-card' + (isOpen ? ' career-card-open' : '') + '" onclick="toggleDarkCareer(\'' + c.id + '\')" style="--cc:' + c.color + '">' +
      '<div class="career-card-head">' +
        '<div class="career-card-icon">' + c.icon + '</div>' +
        '<div class="career-card-info">' +
          '<div class="career-card-title">' + c.title + '</div>' +
          '<div class="career-card-sub">' +
            '<span class="cr-salary" style="color:#FF4444">⚠ ' + c.salary + '</span>' +
            '<span class="cr-demand" style="margin-left:6px">' + riskDots + ' リスク</span>' +
          '</div>' +
        '</div>' +
        '<div class="career-card-arrow">' + (isOpen ? '▲' : '▼') + '</div>' +
      '</div>' +
      (isOpen
        ? '<div class="career-card-body" onclick="event.stopPropagation()">' +
            '<div class="dark-warning-badge">⚠ 違法 — ' + c.warning + '</div>' +
            '<div class="career-desc">' + c.desc + '</div>' +
            '<div class="cr-section-label">▸ 末路ロードマップ（難易度別）</div>' +
            '<div class="cr-roadmap-phases">' + roadmapHTML + '</div>' +
            '<div class="cr-section-label">▸ 悪用されるスキル</div>' +
            '<div class="cr-lang-tags">' + langTagsHTML + '</div>' +
          '</div>'
        : '') +
    '</div>';
  }).join('');

  var darkSectionHTML = currentUserIsAdmin
    ? '<div class="dark-side-section">' +
        '<button class="dark-side-toggle" onclick="toggleDarkSide()">' +
          '<span class="dst-icon">' + (_showDarkSide ? '💀' : '☠') + '</span>' +
          '<span class="dst-label">' + (_showDarkSide ? '— DARK OPS CLASSIFIED —' : '▸ DARK OPS  //  CLASSIFIED') + '</span>' +
          '<span class="dst-arrow">' + (_showDarkSide ? '▲' : '▼') + '</span>' +
        '</button>' +
        (_showDarkSide
          ? '<div class="dark-side-warning">⚠ これらは犯罪行為です。参考・教育目的のみ。実行した場合は逮捕・起訴されます。</div>' +
            '<div class="career-cards dark-career-cards">' + darkCardsHTML + '</div>' +
            '<button class="dark-training-btn" onclick="openDarkTraining()">' +
              '<span class="dtb-icon">⚡</span>' +
              '<span class="dtb-label">DARK OPS TRAINING  //  専用問題を解く（15問）</span>' +
              '<span class="dtb-arrow">▶</span>' +
            '</button>'
          : '') +
      '</div>'
    : '';

  el.innerHTML =
    '<div class="career-page">' +
      '<div class="career-header">' +
        '<div class="career-header-title">◆ CAREER ROADMAP</div>' +
        '<div class="career-header-sub">なりたい職業を選んで、必要なスキルと道筋を確認しよう</div>' +
        '<button class="lang-quiz-btn career-quiz-btn" onclick="openCareerQuizModal()">🧭 どの職業が合うかわからない方はこちら</button>' +
      '</div>' +
      '<div class="career-cards">' + cardsHTML + '</div>' +
      darkSectionHTML +
    '</div>';
}

function toggleCareer(id) {
  _careerSelected = (_careerSelected === id) ? null : id;
  renderCareer();
}

var CAREER_REC_PROBLEMS = {
  'frontend':       { 'html': [1,2,3,4,5,6,7,8,9,10], 'javascript': [1,2,3,4,5,6,7,8,9,10], 'typescript': [1,2,3,4,5,6,7,8] },
  'backend':        { 'python': [5,6,7,8,9,10,11,12,13,14], 'sql': [1,2,3,4,5,6,7,8,9,10], 'java': [5,6,7,8,9,10,11,12], 'go': [5,6,7,8,9,10,11,12] },
  'ai':             { 'python': [7,8,9,10,11,12,13,14,15] },
  'game':           { 'cpp': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 'csharp': [1,2,3,4,5,6,7,8,9,10] },
  'mobile':         { 'swift': [1,2,3,4,5,6,7,8,9,10], 'kotlin': [1,2,3,4,5,6,7,8,9,10] },
  'infra':          { 'bash': [1,2,3,4,5,6,7,8,9,10], 'python': [1,2,3,4,5,6,7,8], 'go': [1,2,3,4,5,6,7,8] },
  'security':       { 'python': [5,6,7,8,9,10,11,12,13], 'c': [5,6,7,8,9,10,11,12,13], 'bash': [5,6,7,8,9,10] },
  'embedded':       { 'c': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 'cpp': [5,6,7,8,9,10,11,12] },
  'competitive':    { 'cpp': [5,6,7,8,9,10,11,12,13,14,15], 'python': [5,6,7,8,9,10,11,12,13,14,15] },
  'blockchain':     { 'javascript': [8,9,10,11,12,13,14,15], 'python': [8,9,10,11,12,13,14,15] },
  'xr':             { 'csharp': [5,6,7,8,9,10,11,12,13,14], 'cpp': [8,9,10,11,12,13,14,15] },
  'robotics':       { 'cpp': [5,6,7,8,9,10,11,12,13,14], 'python': [5,6,7,8,9,10,11,12] },
  'dataeng':        { 'python': [8,9,10,11,12,13,14,15], 'sql': [8,9,10,11,12,13,14,15] },
  'oss':            { 'c': [10,11,12,13,14,15], 'cpp': [10,11,12,13,14,15], 'rust': [8,9,10,11,12,13,14,15] },
  'quantum':        { 'python': [10,11,12,13,14,15] },
  'compiler':       { 'c': [10,11,12,13,14,15], 'cpp': [10,11,12,13,14,15], 'rust': [8,9,10,11,12,13,14,15] },
  'creative':       { 'javascript': [5,6,7,8,9,10,11,12], 'cpp': [8,9,10,11,12,13,14] },
  'bioinformatics': { 'python': [8,9,10,11,12,13,14,15] },
  'space':          { 'c': [8,9,10,11,12,13,14,15], 'cpp': [8,9,10,11,12,13,14,15] },
  'audio':          { 'c': [8,9,10,11,12,13,14], 'cpp': [8,9,10,11,12,13,14] },
  'uiux':           { 'html': [1,2,3,4,5,6,7,8,9,10,11,12], 'javascript': [1,2,3,4,5,6,7,8] },
  'mlops':          { 'python': [8,9,10,11,12,13,14,15], 'bash': [5,6,7,8,9,10] },
  'cto':            { 'javascript': [10,11,12,13,14,15], 'python': [10,11,12,13,14,15], 'go': [10,11,12,13,14,15] },
};

function clearCareerFilter() {
  _careerFilter = null;
  renderList();
}

function goToDetailProblem(id) {
  // スピードモードを引き継ぎ（問題移動時はタイマーリセットせずに続行）
  history.pushState({ page: 'detail', lang: currentLanguage, id: id }, '');
  renderDetail(id);
  showPage('detail');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function goToLangProblems(lid, careerId) {
  if (careerId) {
    var career = CAREERS.find(function(c) { return c.id === careerId; });
    var recIds = career && CAREER_REC_PROBLEMS[careerId] && CAREER_REC_PROBLEMS[careerId][lid];
    if (career && recIds) {
      _careerFilter = {
        careerId: careerId,
        careerTitle: career.title,
        careerIcon: career.icon,
        careerColor: career.color,
        ids: new Set(recIds)
      };
    } else {
      _careerFilter = null;
    }
  } else {
    _careerFilter = null;
  }
  await selectLanguage(lid);
  switchTab('problems');
}

var DARK_CAREERS = [
  {
    id: 'hacker', icon: '🎩', color: '#00FF41',
    title: 'ハッカー / バグバウンティハンター',
    desc: 'システムの脆弱性を発見して報酬を得る。合法的なペネトレーションテストから、一線を越えて不正アクセスに踏み込むケースも多い。',
    warning: '一線を越えれば不正アクセス禁止法・グレーゾーン多数',
    salary: '成果報酬〜1500万円以上', riskLevel: 3,
    csLangs: ['python', 'c', 'bash'],
    steps: [
      { phase: 'beginner',     label: 'Linux / ネットワーク',  color: '#4EAA25', desc: 'OS構造・TCP/IP・パケット解析' },
      { phase: 'beginner',     label: 'C言語',                 color: '#A8B9CC', desc: 'メモリ管理・スタック・バッファ' },
      { phase: 'basic',        label: 'Python',                color: '#3776AB', desc: 'スクリプト・スキャンツール自作' },
      { phase: 'basic',        label: 'Web脆弱性',             color: '#FF453A', desc: 'XSS・SQLi・CSRF・SSRF の仕組み' },
      { phase: 'advanced',     label: 'CTF 参加',              color: '#00FF41', desc: 'HackTheBox・picoCTF で実戦練習' },
      { phase: 'advanced',     label: 'バイナリ解析',          color: '#EFC050', desc: 'GDB・radare2・逆アセンブル' },
      { phase: 'professional', label: 'バグバウンティ or 犯罪', color: '#FF2222', desc: '合法報告で稼ぐか、不正侵入に踏み込むかの分岐点' },
      { phase: 'professional', label: '独立 or 逮捕',          color: '#00FF41', desc: '正しく使えばOSCP・高報酬。悪用すれば懲役' },
    ]
  },
  {
    id: 'cheater', icon: '⚡', color: '#FF0055',
    title: 'チーター / リバースエンジニア',
    desc: 'ゲームのメモリ構造や実行バイナリを解析し、チートツール・MOD・ボットを開発する。利用規約違反・法的グレーゾーン。',
    warning: '不正競争防止法・ゲーム会社からの訴訟・アカウント永久BAN',
    salary: '副業〜フリーランス ※訴訟リスク', riskLevel: 2,
    csLangs: ['c', 'cpp'],
    steps: [
      { phase: 'beginner',     label: 'C / C++ 基礎',            color: '#00599C', desc: 'ポインタ・構造体・メモリモデル' },
      { phase: 'beginner',     label: 'デバッガ入門',            color: '#FF0055', desc: 'x64dbg / OllyDbg でプロセス観察' },
      { phase: 'basic',        label: 'Win32 API',               color: '#0078D4', desc: 'ReadProcessMemory / WriteProcessMemory' },
      { phase: 'basic',        label: 'メモリスキャン',          color: '#FF0055', desc: 'Cheat Engine でアドレス特定・ポインタ追跡' },
      { phase: 'advanced',     label: 'DLL インジェクション',    color: '#FF6B00', desc: 'DLL作成・プロセスへの注入手法' },
      { phase: 'advanced',     label: 'リバースエンジニアリング', color: '#C040FF', desc: 'IDA Pro / Ghidra で逆アセンブル・解析' },
      { phase: 'professional', label: 'カーネルドライバ',        color: '#FF0055', desc: 'DKOM・カーネル空間チート・署名回避' },
      { phase: 'professional', label: '訴訟 or アンチチートへ転向', color: '#00E676', desc: 'ゲーム会社に訴えられるか、防衛側に転職するか' },
    ]
  },
  {
    id: 'cracker', icon: '💀', color: '#FF2222',
    title: 'クラッカー / ブラックハットハッカー',
    desc: '他者のシステムに無断侵入し、情報を盗んだり破壊したりする。完全に違法。摘発されれば懲役刑。',
    warning: '不正アクセス禁止法・電子計算機損壊等業務妨害罪',
    salary: '不定期 ※高リスク', riskLevel: 5,
    csLangs: ['python', 'c', 'bash'],
    steps: [
      { phase: 'beginner',     label: 'Linux / ネットワーク',  color: '#FF4444', desc: 'ハッカーと同じ合法的スキルから始まる' },
      { phase: 'beginner',     label: 'CVE 調査',              color: '#FF2222', desc: '公開済み脆弱性データベースを悪用目的で収集' },
      { phase: 'basic',        label: 'エクスプロイト転用',    color: '#CC0000', desc: 'MetaSploit 等のツールを攻撃に悪用' },
      { phase: 'basic',        label: '標的の選定',            color: '#DD0000', desc: 'セキュリティの甘い組織・個人を探す' },
      { phase: 'advanced',     label: '侵入・権限昇格',        color: '#AA0000', desc: '認証突破→管理者権限取得→データ窃取' },
      { phase: 'advanced',     label: '痕跡隠滅',              color: '#990000', desc: 'ログ削除・VPN/Tor で追跡を妨害' },
      { phase: 'professional', label: 'サイバー犯罪捜査の追跡', color: '#FF0000', desc: 'FBI・Interpol・警察庁に特定される' },
      { phase: 'professional', label: '逮捕・懲役',            color: '#660000', desc: '懲役最大5年・罰金最大500万円（日本）' },
    ]
  },
  {
    id: 'malware', icon: '🦠', color: '#8B0000',
    title: 'マルウェア作者 / ランサムウェア犯',
    desc: 'ウイルスやランサムウェアを作成・配布し金銭を脅迫する。国際的な犯罪組織と繋がるケースも多い。',
    warning: 'ウイルス作成罪（不正指令電磁的記録作成・供用罪）・恐喝罪',
    salary: '一時的に高額 ※全額没収', riskLevel: 5,
    csLangs: ['c', 'cpp', 'python'],
    steps: [
      { phase: 'beginner',     label: 'C / C++ プログラミング', color: '#AA2222', desc: 'メモリ操作・システムコール（合法的スキル）' },
      { phase: 'beginner',     label: 'リバースエンジニアリング', color: '#BB1111', desc: '既存マルウェアを分析して構造を理解' },
      { phase: 'basic',        label: 'ファイル暗号化実装',    color: '#CC0000', desc: 'AES でファイルをロックする処理を実装' },
      { phase: 'basic',        label: 'アンチ検出技術',        color: '#DD0000', desc: 'セキュリティソフトによる検知を回避する難読化' },
      { phase: 'advanced',     label: '配布インフラ構築',      color: '#EE0000', desc: 'フィッシングメール・不正広告で大量配布' },
      { phase: 'advanced',     label: '身代金要求',            color: '#FF0000', desc: 'Monero/Bitcoin で追跡困難な形で要求' },
      { phase: 'professional', label: 'FBI / Interpol に追跡', color: '#FF2222', desc: '国際的なサイバー犯罪捜査の最優先ターゲットになる' },
      { phase: 'professional', label: '逮捕・服役・全財産没収', color: '#550000', desc: '懲役10年超・押収・強制送還のケースも' },
    ]
  },
  {
    id: 'phisher', icon: '🎣', color: '#7700BB',
    title: '詐欺師 / フィッシャー',
    desc: '偽サイト・詐欺メールで認証情報や金銭を騙し取る。技術的ハードルが低い分、検挙率も高い。',
    warning: '詐欺罪・不正競争防止法・電子計算機詐欺罪',
    salary: '短期的に高額 ※すぐ摘発', riskLevel: 4,
    csLangs: ['html', 'javascript', 'php'],
    steps: [
      { phase: 'beginner',     label: 'HTML / CSS / JS 基礎',  color: '#9933CC', desc: '本物そっくりの偽サイトを再現するスキル' },
      { phase: 'beginner',     label: '偽ドメイン取得',        color: '#8822BB', desc: '本物に似たドメインを取得・ホスティング' },
      { phase: 'basic',        label: '認証情報収集フォーム',  color: '#7711AA', desc: 'ID・パスワードを送信させるフォームを実装' },
      { phase: 'basic',        label: 'ソーシャルエンジニアリング', color: '#660099', desc: '緊急性を煽る文面・SMS・なりすましメール' },
      { phase: 'advanced',     label: '大量送信の自動化',      color: '#550088', desc: 'スパム送信インフラ・ボットネット活用' },
      { phase: 'advanced',     label: '不正収益化',            color: '#440077', desc: '盗んだクレカ情報・アカウントを売買' },
      { phase: 'professional', label: 'デジタル捜査で特定',    color: '#9933CC', desc: 'IPログ・金融追跡・通信解析で身元判明' },
      { phase: 'professional', label: '逮捕・有罪',            color: '#330066', desc: '詐欺罪：懲役10年以下（日本）' },
    ]
  },
  {
    id: 'zeroday', icon: '🕳️', color: '#FF8C00',
    title: 'ゼロデイブローカー',
    desc: '未公開の脆弱性（ゼロデイ）を発見または買い取り、国家機関・犯罪組織・スパイ会社に高額で売却する。グレーゾーンから違法まで幅広い。',
    warning: '不正競争防止法・外為法（国家への輸出規制）・共犯罪',
    salary: '1件数百万〜数億円 ※摘発リスク大', riskLevel: 4,
    csLangs: ['c', 'cpp', 'python'],
    steps: [
      { phase: 'beginner',     label: 'セキュリティ基礎',      color: '#FF8C00', desc: 'バイナリ解析・脆弱性の仕組みを深く理解' },
      { phase: 'beginner',     label: 'ファジング入門',         color: '#FF9900', desc: 'AFL・libFuzzerでクラッシュを大量生成' },
      { phase: 'basic',        label: 'エクスプロイト開発',     color: '#FFAA00', desc: 'バッファオーバーフロー・UAF を実際に悪用' },
      { phase: 'basic',        label: '買取市場の開拓',         color: '#FF8800', desc: 'Zerodium・各国諜報機関へのコンタクト' },
      { phase: 'advanced',     label: 'チェーン構築',           color: '#FF6600', desc: '複数の脆弱性を組み合わせてRCE達成' },
      { phase: 'advanced',     label: '匿名での取引',           color: '#FF4400', desc: '暗号通貨・匿名通信で身元を隠して売却' },
      { phase: 'professional', label: '国際輸出規制違反',       color: '#FF2200', desc: '特定国への売却が外為法違反に問われる' },
      { phase: 'professional', label: '共犯・諜報事件に巻き込まれる', color: '#CC4400', desc: 'サイバー兵器売買として国際問題化するケースも' },
    ]
  },
  {
    id: 'ddos', icon: '💥', color: '#FF4500',
    title: 'DDoS請負人 / Booter運営者',
    desc: 'DDoS攻撃を代行するサービス（Booter / Stresser）を運営し、依頼者から報酬を得る。ゲームサーバー・競合企業・個人への攻撃が多い。',
    warning: '電子計算機損壊等業務妨害罪・不正アクセス禁止法',
    salary: '月数十万（すぐ摘発）', riskLevel: 4,
    csLangs: ['python', 'c', 'bash'],
    steps: [
      { phase: 'beginner',     label: 'ネットワーク基礎',       color: '#FF6633', desc: 'UDP/TCP・増幅攻撃・SYN Flood の仕組み' },
      { phase: 'beginner',     label: 'ボットネット入手',        color: '#FF5522', desc: '感染済みデバイスを購入または自作マルウェアで構築' },
      { phase: 'basic',        label: '増幅リフレクション攻撃',  color: '#FF4400', desc: 'DNS/NTP/Memcached を使い帯域を数百倍に増幅' },
      { phase: 'basic',        label: 'Booterサイト構築',        color: '#FF3300', desc: '注文フォーム・決済（仮想通貨）・管理画面を実装' },
      { phase: 'advanced',     label: 'レイヤー7攻撃',           color: '#DD2200', desc: 'HTTP/S アプリ層への低速・巧妙な攻撃' },
      { phase: 'advanced',     label: 'アンチDDoS回避',          color: '#CC2200', desc: 'Cloudflare 等の防御をすり抜ける手法' },
      { phase: 'professional', label: 'FBIによるテイクダウン',   color: '#FF4500', desc: 'Operation PowerOFF 等の国際捜査で摘発' },
      { phase: 'professional', label: '逮捕・服役',              color: '#881100', desc: '懲役数年・多額の損害賠償請求を受ける' },
    ]
  },
  {
    id: 'cryptoscam', icon: '🪙', color: '#FFD700',
    title: '仮想通貨詐欺師 / ラグプル犯',
    desc: '偽のDeFiプロジェクト・NFT・仮想通貨を作成し投資家を集めた後、資金ごと逃走（ラグプル）する。スマートコントラクトの知識が必要。',
    warning: '詐欺罪・金融商品取引法・組織犯罪処罰法',
    salary: '数億円（短期） ※凍結・没収', riskLevel: 5,
    csLangs: ['javascript', 'python'],
    steps: [
      { phase: 'beginner',     label: 'ブロックチェーン基礎',   color: '#FFD700', desc: 'Ethereum・Solidity・ウォレットの仕組み' },
      { phase: 'beginner',     label: 'トークン発行',            color: '#FFCC00', desc: 'ERC-20トークンをコピーして独自コインを作成' },
      { phase: 'basic',        label: '偽プロジェクト演出',      color: '#FFBB00', desc: '豪華なホワイトペーパー・偽チーム・SNS炎上マーケ' },
      { phase: 'basic',        label: 'DEXへの流動性提供',       color: '#FFAA00', desc: 'Uniswap等に上場し取引可能に見せる' },
      { phase: 'advanced',     label: '価格操作・ポンプ',        color: '#FF9900', desc: 'インフルエンサー買収・自作自演の価格吊り上げ' },
      { phase: 'advanced',     label: 'ラグプル実行',            color: '#FF8800', desc: '流動性を一瞬で引き抜き・投資家の資産を奪取' },
      { phase: 'professional', label: 'オンチェーン追跡',        color: '#FFD700', desc: 'Chainalysis・ブロックチェーン解析で資金移動を追跡' },
      { phase: 'professional', label: '逮捕・資産凍結',          color: '#996600', desc: '詐欺罪・暗号資産全額没収・国際引き渡し' },
    ]
  },
  {
    id: 'botshop', icon: '🤖', color: '#00BFFF',
    title: 'BOT屋 / 自動化詐欺師',
    desc: 'チケット転売BOT・フォロワー水増し・ゲームRMTボット・レビュー操作など、自動化で不正利益を得る。一部は法的グレーゾーン。',
    warning: '不正競争防止法・電子計算機不正使用・各種利用規約違反',
    salary: '月数十万〜数百万 ※BAN・逮捕リスク', riskLevel: 3,
    csLangs: ['python', 'javascript'],
    steps: [
      { phase: 'beginner',     label: 'Python / JS 基礎',       color: '#00BFFF', desc: 'スクリプト・HTTPリクエスト・DOM操作' },
      { phase: 'beginner',     label: 'Webスクレイピング',       color: '#00AAEE', desc: 'requests・Playwright・Puppeteer でサイト操作' },
      { phase: 'basic',        label: 'Bot検知の回避',           color: '#0099DD', desc: 'User-Agent偽装・IPローテーション・reCAPTCHA回避' },
      { phase: 'basic',        label: '大量アカウント管理',      color: '#0088CC', desc: '複数アカウントの自動作成・セッション管理' },
      { phase: 'advanced',     label: 'ニッチ市場の開拓',        color: '#0077BB', desc: 'チケット・スニーカー・限定品の転売自動化' },
      { phase: 'advanced',     label: '収益の最大化',            color: '#0066AA', desc: 'フォロワー売買・レビュー農場・RMTの自動化' },
      { phase: 'professional', label: '利用規約違反でBAN',       color: '#00BFFF', desc: 'プラットフォームに検知され全アカウント凍結' },
      { phase: 'professional', label: '法的措置・逮捕',          color: '#004488', desc: 'チケット不正転売禁止法・不正競争防止法で摘発' },
    ]
  },
  {
    id: 'spyware', icon: '👁️', color: '#AA00FF',
    title: 'スパイウェア開発者 / 監視ツール販売者',
    desc: 'ストーカーウェア・企業スパイツール・国家監視ソフトを開発・販売する。NSO GroupのPegasusが有名。開発者も共犯として訴追される。',
    warning: 'ウイルス作成罪・プライバシー侵害・ストーカー規制法違反',
    salary: '法人向けは数億円 ※共犯として訴追', riskLevel: 5,
    csLangs: ['c', 'cpp', 'swift', 'kotlin'],
    steps: [
      { phase: 'beginner',     label: 'モバイル開発基礎',       color: '#AA00FF', desc: 'iOS（Swift）/ Android（Kotlin）の仕組み' },
      { phase: 'beginner',     label: 'OS内部構造の理解',        color: '#9900EE', desc: 'カーネル・プロセス・パーミッション管理' },
      { phase: 'basic',        label: 'バックグラウンド常駐',   color: '#8800DD', desc: 'ユーザーに気づかれず動作し続ける実装' },
      { phase: 'basic',        label: 'データ収集実装',          color: '#7700CC', desc: 'GPS・カメラ・マイク・メッセージを秘密裏に送信' },
      { phase: 'advanced',     label: '検知回避・難読化',        color: '#6600BB', desc: 'セキュリティソフト・App Store審査を回避' },
      { phase: 'advanced',     label: '販売・営業',              color: '#5500AA', desc: '政府機関・DV加害者・企業スパイへの販売' },
      { phase: 'professional', label: '国際人権団体に告発',      color: '#AA00FF', desc: 'Amnesty・CitizenLabに発見・公開調査される' },
      { phase: 'professional', label: '訴追・制裁',              color: '#440088', desc: '米国財務省制裁・刑事訴追・会社倒産（NSO事例）' },
    ]
  },
  {
    id: 'darkweb', icon: '🕸️', color: '#333333',
    title: 'ダークウェブ管理者',
    desc: 'Tor上に違法マーケットプレイスを構築・運営する。麻薬・偽造書類・盗難データ・武器等の取引場を提供。Silk Road創設者は終身刑。',
    warning: '麻薬特例法・武器等製造法・共謀罪・組織犯罪処罰法',
    salary: '数億円（短期）※全額没収・終身刑も', riskLevel: 5,
    csLangs: ['python', 'javascript', 'bash'],
    steps: [
      { phase: 'beginner',     label: 'Tor / 匿名ネットワーク', color: '#555555', desc: 'Onion ルーティング・Hidden Service の仕組み' },
      { phase: 'beginner',     label: 'Linux / サーバー構築',   color: '#444444', desc: '匿名サーバー・bulletproof hosting の活用' },
      { phase: 'basic',        label: 'マーケット開発',          color: '#666666', desc: 'Webアプリ・エスクロー機能・評価システム' },
      { phase: 'basic',        label: '仮想通貨決済実装',        color: '#777777', desc: 'Monero・ミキサーで資金追跡を困難に' },
      { phase: 'advanced',     label: '違法出品者・顧客管理',    color: '#888888', desc: 'PGP暗号通信・オペレーションセキュリティ' },
      { phase: 'advanced',     label: '法執行機関の撹乱',        color: '#999999', desc: 'おとり捜査員の検出・インフラの移転' },
      { phase: 'professional', label: 'FBIによるテイクダウン',   color: '#FF2222', desc: 'Hansa・AlphaBay 等すべて摘発・運営者逮捕' },
      { phase: 'professional', label: '終身刑・全財産没収',      color: '#110011', desc: 'Silk Road創設者ロス・ウルブリヒト：仮釈放なし終身刑' },
    ]
  },
  {
    id: 'cryptojack', icon: '⛏️', color: '#FF8C00',
    title: 'クリプトジャッカー',
    desc: '他人のPC・サーバー・IoT機器に気づかれずマイニングマルウェアを仕込み、仮想通貨を不正に採掘する。',
    warning: '不正指令電磁的記録作成罪・電子計算機損壊等業務妨害罪',
    salary: '継続収入（電力は被害者負担）※すぐ検知', riskLevel: 3,
    csLangs: ['python', 'c', 'javascript'],
    steps: [
      { phase: 'beginner',     label: 'マイニングの仕組み',     color: '#FF8C00', desc: 'PoW・ハッシュ計算・マイニングプールの基礎' },
      { phase: 'beginner',     label: 'マルウェア基礎',         color: '#FF7700', desc: 'バックグラウンド常駐・プロセス偽装' },
      { phase: 'basic',        label: 'ブラウザマイニング',     color: '#FF6600', desc: 'WebAssembly + Coinhive系で訪問者のCPUを奪取' },
      { phase: 'basic',        label: 'サーバー侵入・配置',     color: '#FF5500', desc: '脆弱なサーバーに侵入してマイナーを仕掛ける' },
      { phase: 'advanced',     label: 'ボットネット展開',       color: '#FF4400', desc: '感染端末を大量に確保してマイニングを分散' },
      { phase: 'advanced',     label: 'クラウド悪用',           color: '#FF3300', desc: 'AWS・GCP の認証情報を盗んで無料でマイニング' },
      { phase: 'professional', label: 'セキュリティ製品に検知', color: '#FF8C00', desc: 'CPU使用率の異常でユーザー・企業に即発覚' },
      { phase: 'professional', label: '逮捕・損害賠償',         color: '#882200', desc: '不正指令罪・電気代・損害の全額賠償請求' },
    ]
  },
  {
    id: 'apt', icon: '🕵️', color: '#003366',
    title: '国家スパイ / APT工作員',
    desc: '国家の指示を受け、外国政府・軍・企業へのサイバー攻撃・諜報活動を行う。Lazarus（北朝鮮）・APT28（ロシア）等が有名。',
    warning: '国際法・サイバー犯罪条約違反・発覚すれば国際指名手配',
    salary: '国家から給与（国外では犯罪者）', riskLevel: 5,
    csLangs: ['c', 'cpp', 'python', 'bash'],
    steps: [
      { phase: 'beginner',     label: 'エリート教育機関',       color: '#003366', desc: '国家が選抜したプログラマーとして軍や情報機関に入隊' },
      { phase: 'beginner',     label: '高度なハッキング訓練',   color: '#004488', desc: 'ゼロデイ開発・標的型攻撃・マルウェア作成の国家訓練' },
      { phase: 'basic',        label: 'スピアフィッシング',     color: '#0055AA', desc: '特定個人に合わせた超精巧な標的型メール攻撃' },
      { phase: 'basic',        label: 'サプライチェーン攻撃',   color: '#0066CC', desc: 'SolarWinds型・ソフトウェア配布経路の汚染' },
      { phase: 'advanced',     label: '長期潜伏（APT）',        color: '#0077EE', desc: 'ネットワーク内に数ヶ月〜数年潜伏して情報収集' },
      { phase: 'advanced',     label: 'インフラ破壊',           color: '#0088FF', desc: 'Stuxnet型・発電所・病院・軍事システムへの破壊攻撃' },
      { phase: 'professional', label: '国際指名手配',           color: '#FF2222', desc: 'FBIが顔写真付き公開手配・出国できない生活' },
      { phase: 'professional', label: '亡命 or 国内に閉じ込め', color: '#001133', desc: '母国では英雄だが、国外では永遠の逃亡者' },
    ]
  },
  {
    id: 'fakeapp', icon: '📱', color: '#FF4081',
    title: '偽アプリ開発者',
    desc: '正規アプリに見せかけた偽物をApp Store・Google Playや野良サイトで配布し、個人情報・金融情報・認証情報を窃取する。',
    warning: '不正競争防止法・詐欺罪・ウイルス作成罪',
    salary: '短期高収入 ※ストア審査強化で即BAN', riskLevel: 4,
    csLangs: ['swift', 'kotlin', 'javascript'],
    steps: [
      { phase: 'beginner',     label: 'iOS / Android 開発基礎', color: '#FF4081', desc: 'Swift / Kotlin でアプリの基本構造を習得' },
      { phase: 'beginner',     label: '正規アプリの模倣',       color: '#FF2060', desc: 'UIを完全コピーして本物そっくりに偽装' },
      { phase: 'basic',        label: '悪意ある機能の埋め込み', color: '#EE1050', desc: 'SMS送信・連絡先収集・バックグラウンド通信' },
      { phase: 'basic',        label: 'ストア審査の回避',       color: '#DD0040', desc: '初回起動時は無害・アップデートで悪意機能を有効化' },
      { phase: 'advanced',     label: 'フィッシングオーバーレイ', color: '#CC0030', desc: '正規アプリの上に偽ログイン画面を重ねて表示' },
      { phase: 'advanced',     label: '大規模配布',             color: '#BB0020', desc: '野良APK・SMS誘導・広告ネットワーク経由で拡散' },
      { phase: 'professional', label: 'Google / Apple に摘発',  color: '#FF4081', desc: 'Play Protect・App Review の強化で大量削除' },
      { phase: 'professional', label: '逮捕・損害賠償',         color: '#770010', desc: '詐欺罪・被害者への全額賠償請求' },
    ]
  },
  {
    id: 'simswap', icon: '📶', color: '#FF1744',
    title: 'SIMスワッパー',
    desc: '携帯キャリアの本人確認を突破して被害者の電話番号を乗っ取り、SMS二段階認証を無効化して口座・仮想通貨を盗む。',
    warning: '詐欺罪・不正アクセス禁止法・電気通信事業法違反',
    salary: '1件数百万〜数億円 ※10代でも逮捕多数', riskLevel: 4,
    csLangs: ['python', 'javascript'],
    steps: [
      { phase: 'beginner',     label: 'ソーシャルエンジニアリング', color: '#FF1744', desc: 'キャリアのサポートを騙す話術・なりすまし手法' },
      { phase: 'beginner',     label: '個人情報収集',             color: '#EE1133', desc: 'SNS・データ漏洩・フィッシングで個人情報を事前収集' },
      { phase: 'basic',        label: 'キャリアへのなりすまし電話', color: '#DD0022', desc: '偽造書類・回答誘導でSIM移行を承認させる' },
      { phase: 'basic',        label: 'SMS認証の乗っ取り',        color: '#CC0011', desc: '電話番号を支配し2FAコードを受信' },
      { phase: 'advanced',     label: '仮想通貨取引所への侵入',   color: '#BB0000', desc: '取引所・ウォレットのSMS認証を突破して全額奪取' },
      { phase: 'advanced',     label: '高速資金移動',             color: '#AA0000', desc: '発覚前にミキサーや多段送金で痕跡を消す' },
      { phase: 'professional', label: 'キャリアのログで特定',     color: '#FF1744', desc: '通話記録・基地局データ・共犯者の証言で身元判明' },
      { phase: 'professional', label: '逮捕（10代も多数）',       color: '#660000', desc: '米国では15歳での有罪事例も。懲役数年〜十数年' },
    ]
  },
];

var _showDarkSide = false;
var _darkCareerSelected = null;

function toggleDarkSide() {
  _showDarkSide = !_showDarkSide;
  renderCareer();
}

function toggleDarkCareer(id) {
  _darkCareerSelected = (_darkCareerSelected === id) ? null : id;
  renderCareer();
}

function openDarkTraining() {
  if (!currentUserIsAdmin) return;
  selectLanguage('dark');
}

async function renderRanking() {
  var el = document.getElementById('ranking-content');
  if (!el) return;

  // フォローセットを事前にロード
  if (_followingSet === null) await loadFollowing();

  var LANGS = [
    ['cpp','C++'],['python','Python'],['javascript','JavaScript'],['typescript','TypeScript'],
    ['java','Java'],['csharp','C#'],['kotlin','Kotlin'],['swift','Swift'],['go','Go'],
    ['rust','Rust'],['ruby','Ruby'],['c','C'],['html','HTML'],['sql','SQL'],
    ['bash','Bash'],['regex','Regex'],['php','PHP']
  ];

  var langOpts = LANGS.map(function(l) {
    return '<option value="' + l[0] + '"' + (_rankingLang === l[0] ? ' selected' : '') + '>' + l[1] + '</option>';
  }).join('');

  var tabs = [
    ['total',     '🏅 総合クリア数'],
    ['lang',      '🌐 言語別クリア数'],
    ['weekly_xp', '⚡ 週間XP'],
    ['growth',    '📈 伸び率'],
    ['following', '👥 フォロー中']
  ];
  var tabHtml = tabs.map(function(t) {
    return '<button class="rank-sub-tab' + (_rankingTab === t[0] ? ' active' : '') +
      '" onclick="setRankingTab(\'' + t[0] + '\')">' + t[1] + '</button>';
  }).join('');

  el.innerHTML =
    '<div class="ranking-wrap">' +
      '<div class="ranking-header">' +
        '<div class="ranking-header-label">◆ LEADERBOARD</div>' +
        '<div class="ranking-title">RANK<span>ING</span></div>' +
      '</div>' +
      '<div class="rank-sub-tabs">' + tabHtml + '</div>' +
      (_rankingTab === 'lang'
        ? '<div class="rank-lang-select-wrap"><select class="rank-lang-select" onchange="setRankingLang(this.value)">' + langOpts + '</select></div>'
        : '') +
      '<div id="ranking-list"><div class="ranking-loading">// LOADING...</div></div>' +
    '</div>';
  var rankingList = document.getElementById('ranking-list');

  if (!_supabase) {
    if (rankingList) rankingList.innerHTML = '<p class="ranking-empty">ログインするとランキングに参加できます</p>';
    return;
  }

  try {
    var myId = currentUser ? currentUser.id : null;
    var rows = [];

    if (_rankingTab === 'following') {
      // フォロー中ランキング: フォロー中ユーザーの総合クリア数
      if (!myId) {
        if (rankingList) rankingList.innerHTML = '<p class="ranking-empty">ログインすると表示されます</p>';
        return;
      }
      if (_followingSet === null) await loadFollowing();
      var followingIds = _followingSet ? Array.from(_followingSet) : [];
      if (followingIds.length === 0) {
        if (rankingList) rankingList.innerHTML = '<p class="ranking-empty">まだ誰もフォローしていません。ランキングでフォローしよう！</p>';
        return;
      }
      var r = await _supabase.from('user_stats').select('user_id,total_cleared,total_xp')
        .in('user_id', followingIds)
        .gt('total_cleared', 0)
        .order('total_cleared', { ascending: false });
      rows = (r.data || []).map(function(u) {
        return { uid: u.user_id, value: u.total_cleared, sub: (u.total_xp || 0).toLocaleString() + ' XP' };
      });
    } else if (_rankingTab === 'total') {
      var r = await _supabase.from('user_stats').select('user_id,total_cleared,total_xp')
        .gt('total_cleared', 0).order('total_cleared', { ascending: false }).limit(50);
      rows = (r.data || []).map(function(u) {
        return { uid: u.user_id, value: u.total_cleared, sub: (u.total_xp || 0).toLocaleString() + ' XP' };
      });
    } else if (_rankingTab === 'lang') {
      var r = await _supabase.from('user_stats').select('user_id,lang_cleared')
        .not('lang_cleared', 'is', null).limit(200);
      rows = (r.data || [])
        .map(function(u) { return { uid: u.user_id, value: (u.lang_cleared || {})[_rankingLang] || 0 }; })
        .filter(function(u) { return u.value > 0; })
        .sort(function(a, b) { return b.value - a.value; })
        .slice(0, 50)
        .map(function(u) { return Object.assign(u, { sub: u.value + ' 問' }); });
    } else if (_rankingTab === 'weekly_xp') {
      var r = await _supabase.from('user_stats').select('user_id,weekly_xp')
        .gt('weekly_xp', 0).order('weekly_xp', { ascending: false }).limit(50);
      rows = (r.data || []).map(function(u) {
        return { uid: u.user_id, value: u.weekly_xp || 0, sub: (u.weekly_xp || 0).toLocaleString() + ' XP' };
      });
    } else if (_rankingTab === 'growth') {
      var r = await _supabase.from('user_stats').select('user_id,weekly_cleared,prev_week_cleared')
        .gt('weekly_cleared', 0).order('weekly_cleared', { ascending: false }).limit(100);
      rows = (r.data || [])
        .map(function(u) {
          var g = u.weekly_cleared - (u.prev_week_cleared || 0);
          return { uid: u.user_id, value: g, sub: '+' + g + ' 問（今週）' };
        })
        .filter(function(u) { return u.value > 0; })
        .sort(function(a, b) { return b.value - a.value; })
        .slice(0, 50);
    }

    if (rows.length === 0) {
      if (rankingList) rankingList.innerHTML = '<p class="ranking-empty">まだデータがありません。問題をクリアするとランキングに表示されます！</p>';
      return;
    }

    var posClass = ['rank-row-1st', 'rank-row-2nd', 'rank-row-3rd'];
    var posLabel = ['1ST', '2ND', '3RD'];
    var listHtml = rows.map(function(row, i) {
      var isMe = myId && row.uid === myId;
      var following = !isMe && isFollowing(row.uid);
      var anonId = 'USER #' + (row.uid || '????????').substring(0, 8).toUpperCase();
      var rowCls = 'rank-row' + (i < 3 ? ' ' + posClass[i] : '') + (isMe ? ' rank-row-me' : '');
      var posCls = i < 3 ? 'rank-pos rank-pos-' + (i + 1) : 'rank-pos';
      var posStr = i < 3 ? posLabel[i] : (i + 1) + '.';
      var followBtn = (!isMe && myId)
        ? '<button class="follow-btn' + (following ? ' following' : '') + '" data-uid="' + row.uid + '" onclick="event.stopPropagation();toggleFollow(this.dataset.uid)">' +
            (following ? '✓ フォロー中' : '+ フォロー') +
          '</button>'
        : '';
      return '<div class="' + rowCls + '">' +
        '<span class="' + posCls + '">' + posStr + '</span>' +
        '<span class="rank-name">' + anonId + (isMe ? '<span class="rank-me-badge">YOU</span>' : '') + '</span>' +
        '<span class="rank-value">' + row.sub + '</span>' +
        followBtn +
      '</div>';
    }).join('');

    var myRank = myId ? rows.findIndex(function(r) { return r.uid === myId; }) : -1;
    var myRankHtml = myRank >= 0
      ? '<div class="ranking-my-pos">あなたの順位: <strong>' + (myRank + 1) + ' 位</strong></div>'
      : '';
    if (rankingList) rankingList.innerHTML =
      '<div class="rank-list">' + listHtml + '</div>' + myRankHtml;

    // 自分の行にスクロール
    if (myRank >= 0) {
      requestAnimationFrame(function() {
        var meEl = document.querySelector('.rank-row-me');
        if (meEl) meEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  } catch(e) {
    if (rankingList) rankingList.innerHTML = '<p class="ranking-empty">読込に失敗しました</p>';
  }
}

var _rankingDebounceTimer = null;
function _scheduleRenderRanking() {
  clearTimeout(_rankingDebounceTimer);
  _rankingDebounceTimer = setTimeout(renderRanking, 200);
}

function setRankingTab(tab) {
  _rankingTab = tab;
  _scheduleRenderRanking();
}

function setRankingLang(lang) {
  _rankingLang = lang;
  _scheduleRenderRanking();
}

// ===== コンテスト =====

function _contestWeekId() {
  var d = new Date();
  d.setHours(12, 0, 0, 0);
  var tmp = new Date(d);
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
  var yearStart = new Date(tmp.getFullYear(), 0, 1);
  var week = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
  return tmp.getFullYear() * 100 + week;
}

function _contestWeekDates() {
  var d = new Date();
  var day = d.getDay();
  var diff = day === 0 ? -6 : 1 - day;
  var mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  var sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon, end: sun };
}

function _pad2(n) { return String(n).padStart(2, '0'); }
function _fmtDate(d) { return d.getFullYear() + '/' + _pad2(d.getMonth() + 1) + '/' + _pad2(d.getDate()); }

function getWeeklyContestProblems(lang) {
  var savedLang = currentLanguage;
  if (lang && lang !== currentLanguage) currentLanguage = lang;
  var problems = getProblems();
  currentLanguage = savedLang;
  if (!problems || problems.length === 0) return [];
  var wid = _contestWeekId();
  // 決定論的シャッフル（週IDとIDのハッシュ）
  var shuffled = problems.slice().sort(function(a, b) {
    var ha = ((wid * 1031 + a.id * 17) >>> 0);
    var hb = ((wid * 1031 + b.id * 17) >>> 0);
    return ha - hb;
  });
  var easyAll   = shuffled.filter(function(p) { return ['ROOKIE','BRONZE','SILVER'].indexOf(p.rank) >= 0; });
  var mediumAll = shuffled.filter(function(p) { return ['GOLD','PLATINUM'].indexOf(p.rank) >= 0; });
  var hardAll   = shuffled.filter(function(p) { return ['DIAMOND','MASTER','LEGEND','TITAN','OVERLORD','PREDATOR'].indexOf(p.rank) >= 0; });
  var easy   = easyAll.slice(0, 2);
  var medium = mediumAll.slice(0, 2);
  // hard が足りない場合は medium から補充
  var hard   = hardAll.length > 0 ? hardAll.slice(0, 1) : mediumAll.slice(medium.length, medium.length + 1);
  return easy.concat(medium).concat(hard);
}

async function fetchContestLeaderboard(problemIds, lang) {
  if (!_supabase || problemIds.length === 0) return [];
  try {
    var r = await _supabase.from('progress')
      .select('user_id, problem_id')
      .eq('language', lang || 'cpp')
      .in('problem_id', problemIds);
    if (r.error || !r.data) return [];
    // user_id ごとに何問クリアしたか集計
    var counts = {};
    r.data.forEach(function(row) {
      counts[row.user_id] = (counts[row.user_id] || 0) + 1;
    });
    return Object.entries(counts)
      .map(function(e) { return { uid: e[0], cleared: e[1] }; })
      .sort(function(a, b) { return b.cleared - a.cleared || a.uid.localeCompare(b.uid); })
      .slice(0, 20);
  } catch(e) { return []; }
}

var _contestLang     = null; // null = currentLanguage に追随
var _contestRenderTs = 0;   // 連打競合防止用タイムスタンプ
var _contestCdTimer  = null; // カウントダウンタイマーID

function setContestLang(lang) {
  _contestLang = lang;
  renderContest();
}

function _startContestCountdown(endDate) {
  if (_contestCdTimer) clearInterval(_contestCdTimer);
  function _update() {
    var el = document.getElementById('contest-countdown');
    if (!el) { clearInterval(_contestCdTimer); return; }
    var diff = endDate - Date.now();
    if (diff <= 0) { el.textContent = '今週のコンテスト終了'; clearInterval(_contestCdTimer); return; }
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    el.textContent = '終了まで ' + h + ':' + _pad2(m) + ':' + _pad2(s);
  }
  _update();
  _contestCdTimer = setInterval(_update, 1000);
}

async function renderContest() {
  var el = document.getElementById('contest-content');
  if (!el) return;
  el.innerHTML = '<div class="contest-loading">// LOADING...</div>';

  // 連打時：この呼び出しが最新かどうかをタイムスタンプで確認
  var ts = Date.now();
  _contestRenderTs = ts;

  var lang    = _contestLang || currentLanguage || 'cpp';
  var probs   = getWeeklyContestProblems(lang);
  var dates   = _contestWeekDates();
  var wid     = _contestWeekId();
  var myClears = new Set(loadProgress());
  var myCount = probs.filter(function(p) { return myClears.has(p.id); }).length;

  var lb = await fetchContestLeaderboard(probs.map(function(p) { return p.id; }), lang);

  // 連打時：このレンダリングが最新でなければ中断
  if (_contestRenderTs !== ts) return;

  _startContestCountdown(dates.end);
  var myId = currentUser ? currentUser.id : null;

  var RANK_COLOR = {
    rookie:'#9B9B9B', bronze:'#C47A2F', silver:'#C0C0C0', gold:'#FFD700',
    platinum:'#00E5FF', diamond:'#B9F2FF', master:'#C040FF',
    legend:'#FF6B00', titan:'#00E676', overlord:'#FF1744', predator:'#F0F'
  };

  var problemsHtml = probs.map(function(p, i) {
    var cleared = myClears.has(p.id);
    var col = RANK_COLOR[(p.rank || '').toLowerCase()] || '#FF6B00';
    return '<div class="contest-prob' + (cleared ? ' contest-prob-done' : '') + '" onclick="goToContestProblem(' + p.id + ')">' +
      '<span class="contest-prob-num">' + (i + 1) + '</span>' +
      '<div class="contest-prob-info">' +
        '<span class="contest-prob-title">' + escapeHtml(p.title) + '</span>' +
        '<span class="contest-prob-rank" style="color:' + col + '">' + escapeHtml(p.rank) + '</span>' +
      '</div>' +
      '<span class="contest-prob-status">' + (cleared ? '✔' : '—') + '</span>' +
    '</div>';
  }).join('');

  var posLabel = ['🥇', '🥈', '🥉'];
  var lbHtml = lb.length === 0
    ? '<p class="contest-lb-empty">まだ参加者がいません。最初の挑戦者になろう！</p>'
    : '<ol class="contest-lb-list">' +
      lb.map(function(row, i) {
        var isMe = myId && row.uid === myId;
        var pct  = Math.round(row.cleared / probs.length * 100);
        return '<li class="contest-lb-row' + (isMe ? ' contest-lb-me' : '') + '">' +
          '<span class="contest-lb-pos">' + (i < 3 ? posLabel[i] : (i + 1) + '.') + '</span>' +
          '<span class="contest-lb-name">USER #' + row.uid.substring(0, 8).toUpperCase() +
            (isMe ? '<span class="rank-me-badge">YOU</span>' : '') + '</span>' +
          '<div class="contest-lb-bar-wrap"><div class="contest-lb-bar" style="width:' + pct + '%"></div></div>' +
          '<span class="contest-lb-score">' + row.cleared + '/' + probs.length + '</span>' +
        '</li>';
      }).join('') +
      '</ol>';

  el.innerHTML =
    '<div class="contest-wrap">' +
      '<div class="contest-header">' +
        '<div class="contest-header-label">◆ WEEKLY CHALLENGE</div>' +
        '<div class="contest-title">WEEK<span>#' + (wid % 100) + '</span></div>' +
        '<div class="contest-period">' + _fmtDate(dates.start) + ' — ' + _fmtDate(dates.end) + '</div>' +
        '<div class="contest-countdown" id="contest-countdown"></div>' +
      '</div>' +

      '<div class="contest-lang-row">' +
        (function() {
          var LANGS = [['cpp','C++'],['python','Python'],['javascript','JavaScript'],['typescript','TypeScript'],
            ['java','Java'],['csharp','C#'],['kotlin','Kotlin'],['swift','Swift'],['go','Go'],
            ['rust','Rust'],['ruby','Ruby'],['c','C'],['html','HTML'],['sql','SQL'],['bash','Bash'],['regex','Regex'],['php','PHP']];
          return '<select class="contest-lang-select" onchange="setContestLang(this.value)">' +
            LANGS.map(function(l) {
              return '<option value="' + l[0] + '"' + (lang === l[0] ? ' selected' : '') + '>' + l[1] + '</option>';
            }).join('') +
          '</select>';
        })() +
      '</div>' +

      '<div class="contest-progress-wrap">' +
        '<div class="contest-progress-label">あなたの進捗 <strong>' + myCount + ' / ' + probs.length + '</strong></div>' +
        '<div class="contest-progress-bar-bg">' +
          '<div class="contest-progress-bar" style="width:' + Math.round(myCount / Math.max(probs.length, 1) * 100) + '%"></div>' +
        '</div>' +
        (probs.length > 0 && myCount === probs.length
          ? '<div class="contest-complete-badge">🏆 WEEK COMPLETE！</div>'
          : '') +
      '</div>' +

      '<div class="contest-section-title">// 今週の問題</div>' +
      '<div class="contest-problems">' + (probs.length > 0 ? problemsHtml : '<p class="contest-lb-empty">この言語にはまだ問題がありません</p>') + '</div>' +

      '<div class="contest-section-title">// ランキング</div>' +
      '<div class="contest-lb">' + lbHtml + '</div>' +
    '</div>';
}

function goToNextProblem(id) {
  playItemSelect();
  history.pushState({ page: 'detail', lang: currentLanguage, id: id }, '');
  renderDetail(id);
  showPage('detail');
}

function goToContestProblem(id) {
  playItemSelect();
  // contest タブを active のまま問題詳細へ遷移（ブラウザバックでコンテストに戻れる）
  history.pushState({ page: 'detail', lang: currentLanguage, id: id, fromContest: true }, '');
  renderDetail(id);
  showPage('detail');
}

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
  } else if (tab === 'intro') {
    history.pushState({ page: 'intro', lang: currentLanguage, tab: 'intro' }, '');
    renderIntro();
    showPage('intro');
  } else if (tab === 'textbook') {
    history.pushState({ page: 'textbook', lang: currentLanguage, tab: 'textbook' }, '');
    renderTextbook();
    showPage('textbook');
  } else if (tab === 'ranking') {
    history.pushState({ page: 'ranking', lang: currentLanguage, tab: 'ranking' }, '');
    renderRanking();
    showPage('ranking');
  } else if (tab === 'contest') {
    history.pushState({ page: 'contest', lang: currentLanguage, tab: 'contest' }, '');
    renderContest();
    showPage('contest');
  } else if (tab === 'career') {
    history.pushState({ page: 'career', lang: currentLanguage, tab: 'career' }, '');
    renderCareer();
    showPage('career');
  } else {
    history.pushState({ page: 'guide', lang: currentLanguage, tab: 'guide' }, '');
    renderGuide();
    showPage('guide');
  }
}

// ===== 教本ページの描画 =====

function renderTextbook() {
  var content = document.getElementById('textbook-content');
  content.innerHTML = '';

  var tb = langTextbooks[currentLanguage] || langTextbooks['cpp'];

  // ヘッダー
  var header = document.createElement('div');
  header.className = 'textbook-header';
  header.innerHTML =
    '<div class="textbook-title">' + escapeHtml(tb.emoji) + ' ' + escapeHtml(tb.name) + ' 入門ガイド</div>' +
    '<div class="textbook-intro">' + escapeHtml(tb.intro) + '</div>' +
    '<div class="textbook-features">' +
      tb.features.map(function(f) {
        return '<span class="textbook-feature-tag">✓ ' + escapeHtml(f) + '</span>';
      }).join('') +
    '</div>';
  content.appendChild(header);

  // 目次（TOC）
  if (tb.sections.length >= 4) {
    var toc = document.createElement('nav');
    toc.className = 'textbook-toc';
    toc.innerHTML =
      '<div class="textbook-toc-title">📋 目次</div>' +
      '<ol class="textbook-toc-list">' +
        tb.sections.map(function(sec, idx) {
          return '<li><a class="textbook-toc-link" href="#tb-body-' + idx + '" onclick="openTextbookSection(' + idx + ');return false;">' +
            '<span class="toc-num">' + String(idx + 1).padStart(2, '0') + '</span> ' + escapeHtml(sec.title) +
          '</a></li>';
        }).join('') +
      '</ol>';
    content.appendChild(toc);
  }

  // コードセクション
  var _descs = (langSectionDescs[currentLanguage] || []);
  tb.sections.forEach(function(sec, idx) {
    var section = document.createElement('div');
    section.className = 'textbook-section';
    section.id = 'tb-section-' + idx;

    var _desc = _descs[idx] || '';
    section.innerHTML =
      '<div class="textbook-section-header" onclick="toggleTextbookSection(' + idx + ')">' +
        '<span class="textbook-section-num">' + String(idx + 1).padStart(2, '0') + '</span>' +
        '<span class="textbook-section-title">' + escapeHtml(sec.title) + '</span>' +
        '<span class="textbook-toggle-icon" id="tb-icon-' + idx + '">▶</span>' +
      '</div>' +
      '<div class="textbook-section-body hidden" id="tb-body-' + idx + '">' +
        (_desc ? '<div class="textbook-section-desc">' + _desc + '</div>' : '') +
        '<pre class="textbook-code"><code>' + escapeHtml(sec.code) + '</code></pre>' +
      '</div>';

    content.appendChild(section);
  });

  // Tipsセクション
  var tips = document.createElement('div');
  tips.className = 'textbook-tips';
  tips.innerHTML =
    '<div class="textbook-tips-title">💡 ポイント・Tips</div>' +
    '<ul class="textbook-tips-list">' +
      tb.tips.map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
    '</ul>';
  content.appendChild(tips);

  // 問題一覧へのリンク
  var cta = document.createElement('div');
  cta.className = 'textbook-cta';
  cta.innerHTML =
    '<button class="textbook-cta-btn" onclick="switchTab(\'problems\')">◆ 問題を解いてみよう</button>';
  content.appendChild(cta);
}

// TOCリンクからセクションを開いてスクロール
function openTextbookSection(idx) {
  var body = document.getElementById('tb-body-' + idx);
  var icon = document.getElementById('tb-icon-' + idx);
  if (body && body.classList.contains('hidden')) {
    body.classList.remove('hidden');
    if (icon) icon.textContent = '▼';
  }
  var sec = document.getElementById('tb-section-' + idx);
  if (sec) requestAnimationFrame(function() { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
}

function toggleTextbookSection(idx) {
  var body = document.getElementById('tb-body-' + idx);
  var icon = document.getElementById('tb-icon-' + idx);
  if (!body || !icon) return;
  body.classList.toggle('hidden');
  icon.textContent = body.classList.contains('hidden') ? '▶' : '▼';
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

    var safeUnitId = String(unit.id).replace(/[^a-zA-Z0-9_-]/g, '');
    var pointsHtml = unit.points.map(function(p) {
      return '<li>' + escapeHtml(p) + '</li>';
    }).join('');

    var wordsHtml = unit.words.map(function(w) {
      return '<div class="vocab-card">' +
        '<span class="vocab-term">' + escapeHtml(w.term) + '</span>' +
        '<p class="vocab-desc">' + escapeHtml(w.desc) + '</p>' +
      '</div>';
    }).join('');

    section.innerHTML =
      '<div class="guide-unit-header" onclick="toggleGuideUnit(\'' + safeUnitId + '\')">' +
        '<span class="guide-unit-name">' + escapeHtml(unit.name) + '</span>' +
        '<span class="guide-toggle-icon" id="icon-' + safeUnitId + '">▶</span>' +
      '</div>' +
      '<div class="guide-unit-body hidden" id="body-' + safeUnitId + '">' +
        '<div class="guide-summary">' +
          '<p>' + escapeHtml(unit.summary) + '</p>' +
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
  var safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
  var body = document.getElementById('body-' + safeId);
  var icon = document.getElementById('icon-' + safeId);
  if (!body || !icon) return;
  body.classList.toggle('hidden');
  icon.textContent = body.classList.contains('hidden') ? '▶' : '▼';
}

// ===== ミッション一覧の描画 =====

function _getLocalMissionProgress() {
  return lsGetJSON(getMissionProgressKey(), []);
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
  lsSet(getMissionProgressKey(), JSON.stringify(progress));
  if (currentUser && _supabase) {
    _supabase.from('mission_progress').upsert({
      user_id: currentUser.id,
      language: currentLanguage || 'cpp',
      mission_id: id
    }).then(function() {}).catch(function() {});
  }
  checkLevelUp(); // EXP・レベルアップ判定
  // ミッションXPをサーバー側user_statsにも反映（ランキングのtotal_xpズレ防止）
  var mDef = getMissions().find(function(m) { return m.id === id; });
  if (mDef) {
    var mXp = MISSION_EXP[(mDef.rank || 'rookie').toLowerCase()] || 50;
    syncUserStats(mXp, currentLanguage || 'cpp');
  }
}

function removeMissionProgress(id) {
  var progress = loadMissionProgress().filter(function(x) { return x !== id; });
  _missionProgressCache = progress;
  lsSet(getMissionProgressKey(), JSON.stringify(progress));
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
    lsSet(getMissionProgressKey(), JSON.stringify(merged));
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
  if (!list) return;
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
        '<span class="rank-badge rank-' + escapeHtml(m.rank.toLowerCase()) + '">' + escapeHtml(m.rank) + '</span>' +
        (isLocked ? '<span class="premium-lock-icon">🔒</span>' : '') +
      '</div>' +
      '<div class="mission-card-title">' + escapeHtml(m.title) + '</div>' +
      '<div class="mission-card-desc">' + escapeHtml(m.description.substring(0, 60)) + '...</div>' +
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

var currentMissionId = null;

function renderMissionDetail(id) {
  currentMissionId = id;
  const m = getMissions().find(function(x) { return x.id === id; });
  if (!m) return;
  const cleared = isMissionCleared(m.id);
  const detail = document.getElementById('mission-detail-content');

  // 既存エディタのコードを保存してから破棄
  var savedCode = aceEditor ? aceEditor.getValue() : null;
  if (aceEditor) { aceEditor.destroy(); aceEditor = null; }

  const reqItems = m.requirements.map(function(r, i) {
    return '<li>◆ ' + escapeHtml(r) + '</li>';
  }).join('');

  detail.innerHTML =
    '<div class="mission-number-large">MISSION ' + String(m.id).padStart(2, '0') + '</div>' +
    '<h2>' + escapeHtml(m.title) + '</h2>' +
    '<span class="rank-badge rank-' + m.rank.toLowerCase() + ' rank-badge-lg" style="display:inline-block;margin-bottom:20px;">' + escapeHtml(m.rank) + '</span>' +

    '<div class="section">' +
      '<h3>ミッション概要</h3>' +
      '<p>' + escapeHtml(m.description) + '</p>' +
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
      '<button class="toggle-btn" onclick="toggleSection(\'mission-hint-' + m.id + '\')" data-toggle-for="mission-hint-' + m.id + '" data-open="💡 ヒントを見る" data-close="💡 ヒントを閉じる">💡 ヒントを見る</button>' +
      '<div id="mission-hint-' + m.id + '" class="hidden toggle-content">' +
        '<p>' + escapeHtml(m.hint || '') + '</p>' +
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
      '<button class="run-btn" title="Ctrl+Enter で実行" onclick="runCode()">▶ 実行する<span class="run-btn-kbd">Ctrl+↵</span></button>' +
      '<div id="output-area" class="hidden">' +
        '<p class="output-label">実行結果：<span id="exec-time-badge" class="exec-time-badge hidden"></span></p>' +
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
  if (!currentUser) {
    var _ok = await ensureAnonSession();
    if (!_ok) { openAuthModal(); return; }
  }
  const m = getMissions().find(function(x) { return x.id === missionId; });
  if (!m) return;
  const code = aceEditor ? aceEditor.getValue().trim() : '';
  if (!code) { showToast('コードを入力してください'); return; }

  const btn = document.querySelector('.ai-feedback-btn');
  const area = document.getElementById('ai-feedback-area');
  const text = document.getElementById('ai-feedback-text');
  if (!btn || !area || !text) return;

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
    text.textContent = '⚠ AIに接続できませんでした。しばらく待ってから再試行してください。\n詳細: ' + e.message;
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
    var _golfLen = (aceEditor && currentProblemId === id) ? aceEditor.getValue().length : 0;
    saveProgress(id);
    _saveProblemTime(id);
    _clearDraft(id);
    _incDailyCleared();
    _checkUnitClear(id);
    _comboCount++;
    playClearSound();
    showClearEffect();
    if (_comboCount >= 2) showComboEffect(_comboCount);
    _checkSilverUnlock(id);
    checkTitanTheme();
    if (_golfLen > 0) submitCodeGolfEntry(id, _golfLen);
  }
  renderDetail(id);
  updateProgressDisplay();
  renderList();
}

function _checkSilverUnlock(problemId) {
  if (localStorage.getItem('ranking_unlocked') === '1') return;
  var p = getProblems().find(function(x) { return x.id === problemId; });
  if (!p) return;
  var silverPlus = ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'LEGEND', 'TITAN'];
  if (silverPlus.indexOf(p.rank.toUpperCase()) === -1) return;
  lsSet('ranking_unlocked', '1');
  setTimeout(function() { showRankingUnlockEffect(p.rank); }, 700);
}

var _RANK_COLORS = {
  SILVER: '#B8C8D8', GOLD: '#EFC050', PLATINUM: '#00C8B4',
  DIAMOND: '#5588FF', MASTER: '#C040FF', LEGEND: '#FF2244', TITAN: '#FF2020'
};

function showRankingUnlockEffect(rank) {
  var existing = document.getElementById('ruo-overlay');
  if (existing) existing.remove();

  var color = _RANK_COLORS[rank.toUpperCase()] || '#B8C8D8';

  var el = document.createElement('div');
  el.id = 'ruo-overlay';
  el.className = 'ruo-overlay';
  el.style.setProperty('--uc', color);
  el.innerHTML =
    '<div class="ruo-bg"></div>' +
    '<div class="ruo-content">' +
      '<div class="ruo-hex-wrap">' +
        '<div class="ruo-ring ruo-ring-1"></div>' +
        '<div class="ruo-ring ruo-ring-2"></div>' +
        '<div class="ruo-ring ruo-ring-3"></div>' +
        '<div class="ruo-hex">' +
          '<div class="ruo-hex-label">RANK</div>' +
          '<div class="ruo-hex-rank">' + rank + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ruo-unlock-label">RANKING UNLOCKED</div>' +
      '<div class="ruo-desc">強さメーターが解放されました<br>プロフィールで確認しよう</div>' +
      '<div class="ruo-tap">— TAP TO CONTINUE —</div>' +
    '</div>';

  document.body.appendChild(el);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { el.classList.add('ruo-show'); });
  });

  function dismiss() {
    el.classList.add('ruo-hide');
    setTimeout(function() { if (el.parentNode) el.remove(); }, 500);
  }
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 7000);
}

// ===== TITANテーマ解放 =====

var _TITAN_LANG_ARRS = [
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
  { key: 'rust',       get: function() { return rustProblems; } },
  { key: 'html',       get: function() { return htmlProblems; } },
  { key: 'sql',        get: function() { return sqlProblems; } },
  { key: 'bash',       get: function() { return bashProblems; } },
  { key: 'regex',      get: function() { return regexProblems; } },
  { key: 'php',        get: function() { return phpProblems; } },
];

function isTitanConditionMet() {
  if (getProfileStats().total >= 350) return true;
  for (var i = 0; i < _TITAN_LANG_ARRS.length; i++) {
    var la = _TITAN_LANG_ARRS[i];
    if (calcLangStrengthData(la.key, la.get()).pct >= 100) return true;
  }
  return false;
}

function countTitanLangs() {
  var count = 0;
  for (var i = 0; i < _TITAN_LANG_ARRS.length; i++) {
    var la = _TITAN_LANG_ARRS[i];
    if (calcLangStrengthData(la.key, la.get()).pct >= 100) count++;
  }
  return count;
}

function checkTitanTheme() {
  var active = isTitanConditionMet();
  var titanCount = countTitanLangs();
  var isOverlord = active && titanCount >= 3;
  if (active) {
    document.body.classList.add('titan-theme');
    _updateTitanBadge(true);
    if (localStorage.getItem('titan_theme_unlocked') !== '1') {
      lsSet('titan_theme_unlocked', '1');
      setTimeout(showTitanThemeUnlock, 600);
    }
  } else {
    document.body.classList.remove('titan-theme');
    document.body.classList.remove('overlord-theme');
    _updateTitanBadge(false);
  }
  if (isOverlord) {
    document.body.classList.add('overlord-theme');
    if (localStorage.getItem('overlord_unlocked') !== '1') {
      lsSet('overlord_unlocked', '1');
      setTimeout(showOverlordUnlock, 1200);
    }
  } else {
    document.body.classList.remove('overlord-theme');
  }
  return active;
}

function _updateTitanBadge(show) {
  var existing = document.getElementById('titan-header-badge');
  if (show && !existing) {
    var badge = document.createElement('span');
    badge.id = 'titan-header-badge';
    badge.className = 'titan-badge-header';
    badge.textContent = '⬡ TITAN';
    var lvBadge = document.getElementById('lv-badge');
    if (lvBadge) lvBadge.parentNode.insertBefore(badge, lvBadge);
  } else if (!show && existing) {
    existing.remove();
  }
}

function showTitanThemeUnlock() {
  var existing = document.getElementById('titan-uo');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.id = 'titan-uo';
  el.className = 'titan-uo';
  el.innerHTML =
    '<div class="titan-uo-bg"></div>' +
    '<div class="titan-uo-scan"></div>' +
    '<div class="titan-uo-content">' +
      '<div class="titan-uo-badge">T I T A N</div>' +
      '<div class="titan-uo-title">THEME UNLOCKED</div>' +
      '<div class="titan-uo-sub">最高位の覇者として<br>特別スキンが解放されました</div>' +
      '<div class="titan-uo-tap">— TAP TO CONTINUE —</div>' +
    '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { el.classList.add('titan-uo-show'); });
  });
  function dismiss() {
    el.classList.add('titan-uo-hide');
    setTimeout(function() { if (el.parentNode) el.remove(); }, 600);
  }
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 7000);
}

function showOverlordUnlock() {
  var existing = document.getElementById('overlord-uo');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.id = 'overlord-uo';
  el.className = 'overlord-uo';
  el.innerHTML =
    '<div class="overlord-uo-bg"></div>' +
    '<div class="overlord-uo-scan"></div>' +
    '<div class="overlord-uo-content">' +
      '<div class="overlord-uo-crown">👑</div>' +
      '<div class="overlord-uo-badge">O V E R L O R D</div>' +
      '<div class="overlord-uo-title">RANK UNLOCKED</div>' +
      '<div class="overlord-uo-sub">3言語以上でTITAN到達<br>最高位の称号が解放されました</div>' +
      '<div class="overlord-uo-tap">— TAP TO CONTINUE —</div>' +
    '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { el.classList.add('overlord-uo-show'); });
  });
  function dismiss() {
    el.classList.add('overlord-uo-hide');
    setTimeout(function() { if (el.parentNode) el.remove(); }, 600);
  }
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, 8000);
}

// ===== CODE GOLF =====

async function submitCodeGolfEntry(problemId, codeLength) {
  if (!currentUser || !_supabase || !codeLength) return;
  try {
    var ex = await _supabase.from('code_golf')
      .select('code_length')
      .eq('user_id', currentUser.id)
      .eq('language', currentLanguage)
      .eq('problem_id', problemId)
      .maybeSingle();
    if (ex.error) { console.warn('golf fetch error:', ex.error.message); return; }
    if (ex.data && ex.data.code_length <= codeLength) return;
    var up = await _supabase.from('code_golf').upsert(
      { user_id: currentUser.id, language: currentLanguage, problem_id: problemId, code_length: codeLength },
      { onConflict: 'user_id,language,problem_id' }
    );
    if (up.error) console.warn('golf upsert error:', up.error.message);
  } catch(e) { console.warn('golf error:', e); }
}

var _golfBoardCache = {};
async function refreshGolfBoard(problemId) {
  var board = document.getElementById('golf-board-' + problemId);
  if (!board) return;
  if (!_supabase) { board.innerHTML = '<p class="golf-empty">// OFFLINE</p>'; return; }
  // 5秒以内の同一問題は再フェッチをスキップ
  var cacheEntry = _golfBoardCache[problemId];
  if (cacheEntry && Date.now() - cacheEntry.ts < 5000) {
    board.innerHTML = cacheEntry.html;
    return;
  }
  var res;
  try {
    res = await _supabase.from('code_golf')
      .select('user_id, code_length')
      .eq('language', currentLanguage)
      .eq('problem_id', problemId)
      .order('code_length', { ascending: true })
      .limit(10);
  } catch(e) {
    board.innerHTML = '<p class="golf-empty">// 読み込みエラー。再試行してください</p>';
    return;
  }
  if (res.error) {
    board.innerHTML = '<p class="golf-empty">// 読み込みエラー。再試行してください</p>';
    return;
  }
  if (!res.data || res.data.length === 0) {
    board.innerHTML = '<p class="golf-empty">まだ提出がありません。最初の挑戦者になろう！</p>';
    return;
  }
  var data = res.data;
  var minLen = data[0].code_length;
  var myIdx = currentUser ? data.findIndex(function(r) { return r.user_id === currentUser.id; }) : -1;
  var html = '';
  if (myIdx !== -1) {
    html += '<div class="golf-my-best">あなたのベスト <span class="golf-my-len">' + data[myIdx].code_length + '</span> 文字 · ' + (myIdx + 1) + '位 / ' + data.length + '人</div>';
  }
  html += '<ol class="golf-list">';
  data.forEach(function(r, i) {
    var isMe = currentUser && r.user_id === currentUser.id;
    var barW = Math.round(minLen / r.code_length * 100);
    html += '<li class="golf-entry' + (isMe ? ' golf-entry-me' : '') + '">' +
      '<span class="golf-rank">' + (i + 1) + '</span>' +
      '<div class="golf-bar-wrap"><div class="golf-bar" style="width:' + barW + '%"></div></div>' +
      '<span class="golf-len-num">' + r.code_length + '文字</span>' +
      (isMe ? '<span class="golf-you-tag">YOU</span>' : '') +
    '</li>';
  });
  html += '</ol>';
  board.innerHTML = html;
  _golfBoardCache[problemId] = { ts: Date.now(), html: html };
  // キャッシュが増えすぎたら古いエントリを削除（30件上限）
  var keys = Object.keys(_golfBoardCache);
  if (keys.length > 30) {
    keys.sort(function(a, b) { return _golfBoardCache[a].ts - _golfBoardCache[b].ts; });
    delete _golfBoardCache[keys[0]];
  }
}

var _lastGolfSubmit = {}; // { [problemId]: lastLen } 二重送信防止
var _golfSubmitting = {}; // { [problemId]: true } 送信中フラグ

async function submitAndRefreshGolf(problemId) {
  if (!currentUser) {
    var _ok = await ensureAnonSession();
    if (!_ok) { showToast('ゴルフ提出にはネットワーク接続が必要です'); return; }
  }
  if (!aceEditor) return;
  if (_golfSubmitting[problemId]) return;
  var len = aceEditor.getValue().length;
  if (len === 0) return;
  if (_lastGolfSubmit[problemId] === len) {
    var btn2 = document.querySelector('.golf-submit-btn');
    if (btn2) { btn2.textContent = '同じ文字数です'; setTimeout(function() { if (btn2) btn2.textContent = '⛳ このコードを提出する'; }, 1500); }
    return;
  }
  _golfSubmitting[problemId] = true;
  var btn = document.querySelector('.golf-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = '送信中...'; }
  try {
    await submitCodeGolfEntry(problemId, len);
    _lastGolfSubmit[problemId] = len;
    await refreshGolfBoard(problemId);
    if (btn) { btn.textContent = '✓ 提出しました！'; setTimeout(function() { if (btn) btn.textContent = '⛳ このコードを提出する'; }, 2000); }
  } finally {
    _golfSubmitting[problemId] = false;
    if (btn) btn.disabled = false;
  }
}

// ===== アクティビティヒートマップ =====

function buildHeatmapHTML() {
  var log   = lsGetJSON('study_log', {});
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

// ===== 弱点分析 =====

var _WA_RANK_ORDER  = ['rookie','bronze','silver','gold','platinum','diamond','master','legend','titan'];
var _WA_RANK_LABEL  = { rookie:'ROOKIE', bronze:'BRONZE', silver:'SILVER', gold:'GOLD', platinum:'PLATINUM', diamond:'DIAMOND', master:'MASTER', legend:'LEGEND', titan:'TITAN' };
var _WA_RANK_COLOR  = { rookie:'#9B9B9B', bronze:'#C47A2F', silver:'#B8C8D8', gold:'#EFC050', platinum:'#00C8B4', diamond:'#5588FF', master:'#C040FF', legend:'#FF2244', titan:'#FF2020' };
var _WA_LANG_LABEL  = { cpp:'C++', python:'Python', javascript:'JavaScript', ruby:'Ruby', typescript:'TypeScript', kotlin:'Kotlin', swift:'Swift', java:'Java', csharp:'C#', go:'Go', c:'C', rust:'Rust', html:'HTML', sql:'SQL', bash:'Bash', regex:'Regex', php:'PHP' };

function calcWeaknessData() {
  var langList = [
    { key:'cpp',        get:function(){ return problems; } },
    { key:'python',     get:function(){ return pythonProblems; } },
    { key:'javascript', get:function(){ return javascriptProblems; } },
    { key:'ruby',       get:function(){ return rubyProblems; } },
    { key:'typescript', get:function(){ return typescriptProblems; } },
    { key:'kotlin',     get:function(){ return kotlinProblems; } },
    { key:'swift',      get:function(){ return swiftProblems; } },
    { key:'java',       get:function(){ return javaProblems; } },
    { key:'csharp',     get:function(){ return csharpProblems; } },
    { key:'go',         get:function(){ return goProblems; } },
    { key:'c',          get:function(){ return cProblems; } },
    { key:'rust',       get:function(){ return rustProblems; } },
    { key:'html',       get:function(){ return htmlProblems; } },
    { key:'sql',        get:function(){ return sqlProblems; } },
    { key:'bash',       get:function(){ return bashProblems; } },
    { key:'regex',      get:function(){ return regexProblems; } },
    { key:'php',        get:function(){ return phpProblems; } }
  ];

  // ランク別集計（全言語合計）
  var rankTotals = {};
  _WA_RANK_ORDER.forEach(function(r) { rankTotals[r] = { total:0, cleared:0 }; });

  // 苦手スポット候補
  var weakSpots = [];

  langList.forEach(function(lang) {
    var prog = lsGetJSON(lang.key + '_progress', []);
    if (!prog.length) return; // 未着手言語はスキップ

    var byRank = {};
    lang.get().forEach(function(p) {
      var r = (p.rank || 'rookie').toLowerCase();
      if (!byRank[r]) byRank[r] = { total:0, cleared:0 };
      byRank[r].total++;
      if (prog.indexOf(p.id) !== -1) byRank[r].cleared++;
      if (rankTotals[r]) {
        rankTotals[r].total++;
        if (prog.indexOf(p.id) !== -1) rankTotals[r].cleared++;
      }
    });

    _WA_RANK_ORDER.forEach(function(r) {
      if (!byRank[r] || byRank[r].total === 0) return;
      var pct = Math.round(byRank[r].cleared / byRank[r].total * 100);
      if (pct < 100) {
        weakSpots.push({ lang: lang.key, rank: r, cleared: byRank[r].cleared, total: byRank[r].total, pct: pct });
      }
    });
  });

  weakSpots.sort(function(a, b) { return a.pct - b.pct; });
  return { rankTotals: rankTotals, weakSpots: weakSpots.slice(0, 5) };
}

function buildWeaknessHTML() {
  var d = calcWeaknessData();
  var hasData = _WA_RANK_ORDER.some(function(r) { return d.rankTotals[r].total > 0; });
  if (!hasData) return '<p class="wa-empty">問題をクリアするとここに分析が表示されます</p>';

  // ランク別達成率バー
  var rankBars = _WA_RANK_ORDER.map(function(r) {
    var rt = d.rankTotals[r];
    if (rt.total === 0) return '';
    var pct = Math.round(rt.cleared / rt.total * 100);
    var color = _WA_RANK_COLOR[r];
    return '<div class="wa-rank-row">' +
      '<span class="wa-rank-label" style="color:' + color + '">' + _WA_RANK_LABEL[r] + '</span>' +
      '<div class="wa-bar-track">' +
        '<div class="wa-bar-fill" style="width:' + pct + '%;background:' + color + ';box-shadow:0 0 6px ' + color + '66"></div>' +
      '</div>' +
      '<span class="wa-rank-pct">' + pct + '%</span>' +
      '<span class="wa-rank-frac">' + rt.cleared + '/' + rt.total + '</span>' +
    '</div>';
  }).join('');

  // 苦手スポット
  var spotHTML = d.weakSpots.length === 0
    ? '<p class="wa-perfect">全スポット100%達成！</p>'
    : d.weakSpots.map(function(s, i) {
        var color = _WA_RANK_COLOR[s.rank];
        return '<div class="wa-spot">' +
          '<span class="wa-spot-rank" style="color:' + color + ';border-color:' + color + '44">' + _WA_RANK_LABEL[s.rank] + '</span>' +
          '<span class="wa-spot-lang">' + (_WA_LANG_LABEL[s.lang] || s.lang) + '</span>' +
          '<div class="wa-spot-bar-wrap">' +
            '<div class="wa-spot-bar" style="width:' + s.pct + '%;background:' + color + '"></div>' +
          '</div>' +
          '<span class="wa-spot-pct">' + s.pct + '%</span>' +
          '<span class="wa-spot-frac">(' + s.cleared + '/' + s.total + ')</span>' +
        '</div>';
      }).join('');

  return '<div class="wa-rank-bars">' + rankBars + '</div>' +
    '<div class="wa-spots-title">苦手スポット TOP' + Math.min(5, d.weakSpots.length) + '</div>' +
    '<div class="wa-spots">' + spotHTML + '</div>';
}

// ===== プロフィールページ =====

function openProfile() {
  playUIClick();
  history.pushState({ page: 'profile', lang: currentLanguage }, '');
  showPage('profile');
  renderProfile(); // async（fire-and-forget OK）
}

async function renderProfile() {
  checkTitanTheme();
  var content = document.getElementById('profile-content');
  if (!content) return;
  try {

  // ─── ローカルデータで即時レンダリング（Supabaseを一切待たない）───
  var streak = calcStreak(lsGetJSON('login_days', []));
  var followCounts = { following: 0, followers: 0 };

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

  var rank   = getProfileRank(stats.total, countTitanLangs());
  var earned = BADGES.filter(function(b) { return b.check(stats); });
  var locked = BADGES.filter(function(b) { return !b.check(stats); });

  var avatarLetter = currentUser ? (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?') : 'G';
  var displayName  = currentUser ? (currentUser.email || 'GUEST（匿名）') : 'GUEST';

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
        (isEarned ? '<button class="badge-share-btn" data-name="' + escapeHtml(b.name) + '" data-desc="' + escapeHtml(b.desc) + '" onclick="shareBadge(this.dataset.name,this.dataset.desc)">𝕏 シェア</button>' : '') +
      '</div>'
    );
  }

  var strength = {
    cpp:    calcLangStrengthData('cpp',        problems),
    python: calcLangStrengthData('python',     pythonProblems),
    js:     calcLangStrengthData('javascript', javascriptProblems),
    ruby:   calcLangStrengthData('ruby',       rubyProblems),
    ts:     calcLangStrengthData('typescript', typescriptProblems),
    kotlin: calcLangStrengthData('kotlin',     kotlinProblems),
    swift:  calcLangStrengthData('swift',      swiftProblems),
    java:   calcLangStrengthData('java',       javaProblems),
    csharp: calcLangStrengthData('csharp',     csharpProblems),
    go:     calcLangStrengthData('go',         goProblems),
    c:      calcLangStrengthData('c',          cProblems),
    rust:   calcLangStrengthData('rust',       rustProblems),
  };

  var pct = {};

  // ストリーク状態の判定（今日ログイン済みかどうか）
  var todayStr = getTodayJST();
  var localDays = lsGetJSON('login_days', []);
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

    // ─── 未ログイン案内 ───
    (!currentUser
      ? '<div class="guest-notice">' +
          '⚠ ゲスト表示中です。<button class="guest-login-btn" onclick="openAuthModal()">ログイン / 登録</button>するとデータがクラウドに保存され、複数端末で同期されます。' +
        '</div>'
      : '') +

    // ─── ヒーローセクション ───
    '<div class="profile-hero" style="--rank-color:' + rank.color + '">' +
      '<div class="profile-avatar" style="--rank-color:' + rank.color + '">' + avatarLetter + '</div>' +
      '<div class="profile-hero-info">' +
        '<div class="profile-email">' + escapeHtml(displayName) + '</div>' +
        (_premiumStatusCache ? '<div class="plus-badge-label">◆ CODE STEP PLUS</div>' : '') +
        (currentUserIsAdmin ? '<div class="admin-badge-label">⚙ ADMIN</div>' : '') +
        '<div class="profile-rank-badge" style="color:' + rank.color + ';border-color:' + rank.color + ';box-shadow:0 0 12px ' + rank.color + '33">' +
          '◆ ' + rank.name + ' ◆' +
        '</div>' +
        '<div class="profile-total">' + stats.total + '<span> / 696 CLEARED</span></div>' +
        '<div class="profile-mission-total">' + stats.totalMissions + ' / 72 MISSIONS</div>' +
        (currentUser
          ? '<div class="profile-follow-counts">' +
              '<span class="follow-count-item" onclick="setRankingTab(\'following\');switchTab(\'ranking\')">' +
                '<strong>' + followCounts.following + '</strong> フォロー中' +
              '</span>' +
              '<span class="follow-count-sep">·</span>' +
              '<span class="follow-count-item">' +
                '<strong>' + followCounts.followers + '</strong> フォロワー' +
              '</span>' +
            '</div>'
          : '') +
        '<button class="profile-share-btn" onclick="shareProfile()">𝕏 シェア</button>' +
      '</div>' +
    '</div>' +
    (_realUserIsAdmin
      ? '<button id="admin-panel-btn" class="admin-open-btn' + (!currentUserIsAdmin ? ' admin-btn-preview-mode' : '') + '" onclick="openAdminPanel()">' + (currentUserIsAdmin ? '⚙ 管理者パネルを開く' : '🔑 管理者に戻る') + '</button>'
      : '') +

    // ─── ギルドカード ───
    (function() {
      var hasCard = currentUserAgeGroup && currentUserJobClass && currentUserExperience;
      var AGE_ICON = { '10代': '🌱', '20代': '⚡', '30代以上': '🔥' };
      var JOB_ICON = { '学生': '🎓', '会社員': '💼', 'フリーランス': '🚀', 'その他': '🎲' };
      var EXP_ICON = { '完全未経験': '🥚', '少し触ったことがある': '🐣', '実務経験あり': '🦅' };
      var unread = currentUserScoutMessages.filter(function(m) { return m.status === 'unread'; });
      if (!currentUser) return '';
      if (!hasCard) {
        return '<div class="profile-section gc-section-empty">' +
          '<div class="profile-section-title">// GUILD CARD</div>' +
          '<div class="gc-empty-body">' +
            '<p class="gc-empty-text">ギルドカードを登録すると、同じ属性の人の中での<br>ランキングが解放されます。</p>' +
            '<button class="gc-create-btn" onclick="openGuildCardModal()">🎖️ ギルドカードを作成する</button>' +
          '</div>' +
        '</div>';
      }
      return '<div class="profile-section gc-section">' +
        '<div class="profile-section-title">// GUILD CARD ' +
          '<button class="gc-edit-btn" onclick="openGuildCardModal()">編集</button>' +
        '</div>' +
        '<div class="gc-card">' +
          '<div class="gc-card-item">' +
            '<span class="gc-card-icon">' + (AGE_ICON[currentUserAgeGroup] || '👤') + '</span>' +
            '<div class="gc-card-info">' +
              '<div class="gc-card-key">年齢層</div>' +
              '<div class="gc-card-val">' + escapeHtml(currentUserAgeGroup) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="gc-card-item">' +
            '<span class="gc-card-icon">' + (JOB_ICON[currentUserJobClass] || '💼') + '</span>' +
            '<div class="gc-card-info">' +
              '<div class="gc-card-key">職業クラス</div>' +
              '<div class="gc-card-val">' + escapeHtml(currentUserJobClass) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="gc-card-item">' +
            '<span class="gc-card-icon">' + (EXP_ICON[currentUserExperience] || '🐣') + '</span>' +
            '<div class="gc-card-info">' +
              '<div class="gc-card-key">経験</div>' +
              '<div class="gc-card-val">' + escapeHtml(currentUserExperience) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="gc-scout-section">' +
          (unread.length > 0
            ? '<div class="gc-scout-badge">' +
                '<span class="gc-scout-badge-icon">🔥</span>' +
                '<div>' +
                  '<div class="gc-scout-badge-title">NEW INVITATION</div>' +
                  '<div class="gc-scout-badge-sub">' + unread.length + '件の企業からの招待状</div>' +
                '</div>' +
                '<span class="gc-scout-count">' + (unread.length > 9 ? '9+' : unread.length) + '</span>' +
              '</div>' +
              '<div class="gc-scout-msgs">' +
                unread.map(function(m) {
                  return '<div class="gc-scout-msg" onclick="markScoutRead(\'' + String(m.message_id).replace(/[^a-zA-Z0-9\-]/g, '') + '\')">' +
                    '<span class="gc-scout-dot"></span>' +
                    '<span class="gc-scout-msg-title">' + escapeHtml(m.message_title) + '</span>' +
                    '<span class="gc-scout-msg-date">' + new Date(m.sent_at).toLocaleDateString('ja-JP') + '</span>' +
                  '</div>';
                }).join('') +
              '</div>'
            : '') +
          '<div class="gc-scout-row">' +
            '<div class="gc-scout-info">' +
              '<div class="gc-scout-label">スカウト受け取り</div>' +
              '<div class="gc-scout-sub">ONにすると企業からスカウトが届きます</div>' +
            '</div>' +
            '<button class="gc-scout-toggle' + (currentUserScoutOptIn ? ' on' : '') + '" onclick="toggleScoutOptIn()" role="switch" aria-checked="' + currentUserScoutOptIn + '">' +
              '<span class="gc-scout-knob"></span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    })() +

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
            '<div class="exp-bar-fill" id="exp-bar-fill-anim" style="width:0%;background:' + lvColor + ';transition:width 0.8s ease"></div>' +
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
        (function() {
          var avgSec = stats.total > 0 ? Math.round(totalStudySec / stats.total) : 0;
          var avgStr = avgSec >= 60
            ? Math.floor(avgSec / 60) + 'm ' + (avgSec % 60) + 's'
            : avgSec > 0 ? avgSec + 's' : '—';
          return '<div class="act-stat-card">' +
            '<div class="act-stat-label">1問あたり平均</div>' +
            '<div class="act-stat-value">' + avgStr + '</div>' +
          '</div>';
        })() +
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

    // ─── Dev Status ───
    (function() {
      var ds = calcDevStatus();
      return '<div class="profile-section dev-status-section">' +
        '<div class="profile-section-title">// DEV STATUS</div>' +
        _buildDevStatusSVG(ds) +
      '</div>';
    })() +

    // ─── 言語スタッツ ───
    '<div class="profile-section">' +
      '<div class="profile-section-title">// LANGUAGE STATS</div>' +
      '<div class="profile-stats-grid">' +
        _statCardHTML('C++',        '#00599C', stats.cpp,    strength.cpp,    stats.cppM,    58, pct['cpp']) +
        _statCardHTML('Python',     '#3776AB', stats.python, strength.python, stats.pyM,     58, pct['python']) +
        _statCardHTML('JavaScript', '#F0C040', stats.js,     strength.js,     stats.jsM,     58, pct['javascript']) +
        _statCardHTML('Ruby',       '#CC342D', stats.ruby,   strength.ruby,   stats.rubyM,   30, pct['ruby']) +
        _statCardHTML('TypeScript', '#3178C6', stats.ts,     strength.ts,     stats.tsM,     30, pct['typescript']) +
        _statCardHTML('Kotlin',     '#7F52FF', stats.kotlin, strength.kotlin, stats.kotlinM, 30, pct['kotlin']) +
        _statCardHTML('Swift',      '#FA7343', stats.swift,  strength.swift,  stats.swiftM,  30, pct['swift']) +
        _statCardHTML('Java',       '#ED8B00', stats.java,   strength.java,   stats.javaM,   58, pct['java']) +
        _statCardHTML('C#',         '#9B4F96', stats.csharp, strength.csharp, stats.csharpM, 30, pct['csharp']) +
        _statCardHTML('Go',         '#00ADD8', stats.go,     strength.go,     stats.goM,     30, pct['go']) +
        _statCardHTML('C',          '#A8B9CC', stats.c,      strength.c,      stats.cM,      30, pct['c']) +
        _statCardHTML('Rust',       '#CE412B', stats.rust,   strength.rust,   stats.rustM,   58, pct['rust']) +
      '</div>' +
    '</div>' +

    // ─── 学習時間グラフ ───
    _buildStudyTimeChartHTML() +

    // ─── スキルレーダー ───
    _buildRadarChartHTML(stats) +

    // ─── 弱点分析 ───
    '<div class="profile-section">' +
      '<div class="profile-section-title">// WEAKNESS ANALYSIS</div>' +
      buildWeaknessHTML() +
    '</div>' +

    // ─── バッジウォール（ティア別グループ） ───
    (function() {
      var tierOrder = ['bronze','silver','gold','platinum','diamond','master','legend'];
      var tierLabels = { bronze:'BRONZE', silver:'SILVER', gold:'GOLD', platinum:'PLATINUM', diamond:'DIAMOND', master:'MASTER', legend:'LEGEND' };
      var sections = tierOrder.map(function(tier) {
        var all    = BADGES.filter(function(b) { return b.tier === tier; });
        var got    = all.filter(function(b)  { return b.check(stats); });
        var missed = all.filter(function(b)  { return !b.check(stats); });
        if (all.length === 0) return '';
        var col = tierColors[tier] || '#FF6B00';
        return '<div class="badge-tier-group">' +
          '<div class="badge-tier-head">' +
            '<span class="badge-tier-dot" style="background:' + col + '"></span>' +
            '<span style="color:' + col + '">' + tierLabels[tier] + '</span>' +
            '<span class="badge-tier-prog">' + got.length + ' / ' + all.length + '</span>' +
          '</div>' +
          '<div class="badge-grid">' +
            got.map(function(b)    { return badgeHTML(b, true);  }).join('') +
            missed.map(function(b) { return badgeHTML(b, false); }).join('') +
          '</div>' +
        '</div>';
      });
      return '<div class="profile-section">' +
        '<div class="profile-section-title">// BADGES ' +
          '<span class="badge-count-tag">' + earned.length + ' / ' + BADGES.length + ' 解除</span>' +
        '</div>' +
        sections.join('') +
      '</div>';
    })() +

    // ─── データバックアップ ───
    '<div class="profile-section profile-backup-section">' +
      '<div class="profile-section-title">// DATA BACKUP</div>' +
      '<p class="profile-backup-desc">進捗・ブックマーク・ログインデータをJSONファイルに保存し、別端末や再インストール時に復元できます。</p>' +
      '<div class="profile-backup-btns">' +
        '<button class="profile-backup-btn" onclick="exportProgress()">📥 エクスポート</button>' +
        '<button class="profile-backup-btn profile-backup-import" onclick="importProgress()">📤 インポート</button>' +
      '</div>' +
    '</div>'

  // XPバーアニメーション
  requestAnimationFrame(function() {
    var barEl = document.getElementById('exp-bar-fill-anim');
    if (barEl) {
      requestAnimationFrame(function() { barEl.style.width = expPct + '%'; });
    }
  });

  // バックグラウンドでSupabase更新（レンダリングをブロックしない）
  if (currentUser && _supabase) {
    getFollowCounts(currentUser.id).then(function(fc) {
      var followEl = content.querySelector('.profile-follow-counts');
      if (!followEl || !fc) return;
      var strongs = followEl.querySelectorAll('strong');
      if (strongs[0]) strongs[0].textContent = fc.following;
      if (strongs[1]) strongs[1].textContent = fc.followers;
    }).catch(function() {});
  }

  } catch(e) {
    console.error('[renderProfile]', e);
    content.innerHTML = '<div class="profile-loading" style="color:#FF4444;animation:none">⚠ 読み込みに失敗しました。ページを更新してお試しください。</div>';
  }
}

// ===== 進捗エクスポート / インポート =====

var _BACKUP_LANGS = ['cpp','python','javascript','ruby','typescript','kotlin','swift','java','csharp','go','c','rust','html','sql','bash','regex','php','dark'];
var _BACKUP_MISC  = ['login_days','study_log','daily_goal','soundEnabled','last_language'];

function exportProgress() {
  var data = { _version: 1, _date: new Date().toISOString() };
  _BACKUP_LANGS.forEach(function(lang) {
    ['_progress','_mission_progress','_bookmarks','_started_at'].forEach(function(suffix) {
      var v = localStorage.getItem(lang + suffix);
      if (v) data[lang + suffix] = v;
    });
  });
  _BACKUP_MISC.forEach(function(key) {
    var v = localStorage.getItem(key);
    if (v) data[key] = v;
  });
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'codestep-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('📥 進捗データをダウンロードしました');
}

function importProgress() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        var imported = 0;
        var allowed = {};
        _BACKUP_LANGS.forEach(function(lang) {
          ['_progress','_mission_progress','_bookmarks','_started_at'].forEach(function(s) {
            allowed[lang + s] = true;
          });
        });
        _BACKUP_MISC.forEach(function(k) { allowed[k] = true; });
        Object.keys(data).forEach(function(key) {
          if (!allowed[key]) return;
          var val = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
          lsSet(key, val);
          imported++;
        });
        _progressCache = null;
        _missionProgressCache = null;
        showToast('✓ ' + imported + '件のデータをインポートしました。ページをリロードしてください。', 6000);
      } catch(e) {
        showToast('⚠ ファイルの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
  };
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

function _buildStudyTimeChartHTML() {
  var log   = lsGetJSON('study_log', {});
  var today = new Date();
  today.setHours(12, 0, 0, 0);

  // 過去28日分のデータを収集
  var days = [];
  for (var i = 27; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var key = d.toISOString().slice(0, 10);
    days.push({ key: key, sec: log[key] || 0, label: (d.getMonth()+1) + '/' + d.getDate() });
  }

  var totalSec = days.reduce(function(a, d) { return a + d.sec; }, 0);
  if (totalSec === 0) return '';

  var maxSec = Math.max.apply(null, days.map(function(d) { return d.sec; }));
  if (maxSec === 0) return '';

  var W = 560, H = 100, pad = 28, barW = Math.floor((W - pad * 2) / 28) - 1;
  var svg = '<svg viewBox="0 0 ' + W + ' ' + (H + 30) + '" xmlns="http://www.w3.org/2000/svg" class="study-chart-svg">';

  // 目盛り線 (15分, 30分, 60分)
  var gridMins = [15, 30, 60];
  gridMins.forEach(function(m) {
    var sec = m * 60;
    if (sec > maxSec * 1.1) return;
    var y = pad + H - Math.round(sec / maxSec * H);
    svg += '<line x1="' + pad + '" y1="' + y + '" x2="' + (W - pad) + '" y2="' + y + '" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="3,3"/>';
    svg += '<text x="' + (pad - 3) + '" y="' + (y + 4) + '" text-anchor="end" fill="rgba(237,224,200,0.25)" font-size="8.5" font-family="Share Tech Mono,monospace">' + m + 'm</text>';
  });

  // バー
  var todayKey = today.toISOString().slice(0, 10);
  days.forEach(function(d, i) {
    var barH  = d.sec > 0 ? Math.max(3, Math.round(d.sec / maxSec * H)) : 0;
    var x     = pad + i * (barW + 1);
    var y     = pad + H - barH;
    var isToday = d.key === todayKey;
    var fill  = isToday ? '#FF6B00' : (d.sec > 0 ? 'rgba(255,107,0,0.55)' : 'rgba(255,255,255,0.05)');
    svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" fill="' + fill + '" rx="1.5"/>';
    // ラベル: 7日ごと
    if (i % 7 === 0 || i === 27) {
      svg += '<text x="' + (x + barW / 2) + '" y="' + (pad + H + 14) + '" text-anchor="middle" fill="rgba(237,224,200,0.3)" font-size="8.5" font-family="Share Tech Mono,monospace">' + d.label + '</text>';
    }
  });

  svg += '</svg>';

  var totalMin = Math.round(totalSec / 60);
  var avgMin   = Math.round(totalMin / 28);

  return '<div class="profile-section">' +
    '<div class="profile-section-title">// STUDY TIME' +
      '<span class="study-chart-meta">過去28日: <strong>' + totalMin + '分</strong>  平均: <strong>' + avgMin + '分/日</strong></span>' +
    '</div>' +
    '<div class="study-chart-wrap">' + svg + '</div>' +
  '</div>';
}

function _buildRadarChartHTML(stats) {
  var langs = [
    { name: 'C++',    key: 'cpp',        color: '#00599C', total: 58 },
    { name: 'Python', key: 'python',     color: '#3776AB', total: 58 },
    { name: 'JS',     key: 'javascript', color: '#F0C040', total: 58 },
    { name: 'Java',   key: 'java',       color: '#ED8B00', total: 58 },
    { name: 'Rust',   key: 'rust',       color: '#CE412B', total: 58 },
    { name: 'Ruby',   key: 'ruby',       color: '#CC342D', total: 30 },
    { name: 'TS',     key: 'typescript', color: '#3178C6', total: 58 },
    { name: 'Kotlin', key: 'kotlin',     color: '#7F52FF', total: 30 },
    { name: 'Swift',  key: 'swift',      color: '#FA7343', total: 30 },
    { name: 'Go',     key: 'go',         color: '#00ADD8', total: 30 },
    { name: 'C#',     key: 'csharp',     color: '#9B4F96', total: 30 },
    { name: 'C',      key: 'c',          color: '#A8B9CC', total: 30 },
    { name: 'HTML',   key: 'html',       color: '#E44D26', total: 30 },
    { name: 'SQL',    key: 'sql',        color: '#336791', total: 30 },
  ];
  var active = langs.filter(function(l) { return (stats[l.key] || 0) > 0; });
  if (active.length < 3) return '';
  if (active.length > 10) active = active.slice(0, 10);

  var n   = active.length;
  var cx  = 160, cy = 160, r = 108;
  var scores = active.map(function(l) { return Math.min(1, (stats[l.key] || 0) / l.total); });

  function pt(i, radius) {
    var a = (2 * Math.PI * i / n) - Math.PI / 2;
    return { x: +(cx + radius * Math.cos(a)).toFixed(2), y: +(cy + radius * Math.sin(a)).toFixed(2) };
  }

  var grid = '';
  [0.25, 0.5, 0.75, 1.0].forEach(function(f, gi) {
    var pts = [];
    for (var i = 0; i < n; i++) { var p = pt(i, r * f); pts.push(p.x + ',' + p.y); }
    var op = (0.04 + gi * 0.025).toFixed(3);
    grid += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="rgba(255,255,255,' + op + ')" stroke-width="1"/>';
  });

  var axes = '';
  for (var i = 0; i < n; i++) {
    var p = pt(i, r);
    axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p.x + '" y2="' + p.y + '" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>';
  }

  var spts = [];
  for (var i = 0; i < n; i++) { var p = pt(i, r * scores[i]); spts.push(p.x + ',' + p.y); }
  var poly = '<polygon points="' + spts.join(' ') + '" fill="rgba(255,107,0,0.22)" stroke="#FF6B00" stroke-width="1.8" stroke-linejoin="round"/>';

  var dots = '';
  for (var i = 0; i < n; i++) {
    var p = pt(i, r * scores[i]);
    dots += '<circle cx="' + p.x + '" cy="' + p.y + '" r="3.5" fill="#FF6B00" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>';
  }

  var labels = '';
  for (var i = 0; i < n; i++) {
    var lp = pt(i, r + 22);
    var anchor = lp.x < cx - 6 ? 'end' : lp.x > cx + 6 ? 'start' : 'middle';
    var pct = Math.round(scores[i] * 100);
    labels += '<text x="' + lp.x + '" y="' + (lp.y - 2) + '" text-anchor="' + anchor + '" fill="' + active[i].color + '" font-size="10.5" font-family="Share Tech Mono,monospace" font-weight="700">' + active[i].name + '</text>';
    labels += '<text x="' + lp.x + '" y="' + (lp.y + 10) + '" text-anchor="' + anchor + '" fill="rgba(237,224,200,0.4)" font-size="9" font-family="Share Tech Mono,monospace">' + pct + '%</text>';
  }

  return '<div class="profile-section">' +
    '<div class="profile-section-title">// SKILL RADAR</div>' +
    '<div class="radar-chart-wrap">' +
      '<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" class="radar-svg">' +
        grid + axes + poly + dots + labels +
      '</svg>' +
    '</div>' +
  '</div>';
}

function _statCardHTML(lang, color, count, strengthData, missions, maxProblems, pctInfo) {
  var s = strengthData || { pct: 0, earned: 0, max: 0 };
  var rank = getLangStrengthRank(s.pct, countTitanLangs());
  var isActive = count > 0;
  var showPct = pctInfo && pctInfo.total_users >= 3 && isActive;
  return (
    '<div class="profile-stat-card' + (isActive ? ' stat-card-active' : '') + '"' +
        ' style="--stat-rank-color:' + rank.color + '">' +
      '<div class="stat-card-top">' +
        '<div class="stat-lang" style="color:' + color + '">' + lang + '</div>' +
        (isActive
          ? '<div class="stat-rank-badge" style="color:' + rank.color + ';border-color:' + rank.color + '55">' + rank.name + '</div>'
          : '<div class="stat-rank-badge stat-rank-locked">— 未挑戦 —</div>') +
      '</div>' +
      '<div class="stat-strength-num" style="color:' + (isActive ? rank.color : 'rgba(160,144,112,0.2)') + '">' +
        s.pct + '<span class="stat-pct-sym">%</span>' +
      '</div>' +
      '<div class="stat-bar-wrap">' +
        '<div class="stat-bar" style="width:' + s.pct + '%;background:' + rank.color +
            ';box-shadow:' + (isActive ? '0 0 8px ' + rank.color + '88' : 'none') + '"></div>' +
      '</div>' +
      '<div class="stat-bottom">' +
        '<span class="stat-clear-text">' + count + ' / ' + maxProblems + ' CLEARED</span>' +
        '<span class="stat-mission">' + missions + '/6 M</span>' +
      '</div>' +
      (showPct
        ? '<div class="stat-pct-row">上位 <span class="stat-pct-val">' + pctInfo.top_pct + '</span>% <span class="stat-pct-total">/ ' + pctInfo.total_users + '人</span></div>'
        : '') +
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

// ===== ギルドカードモーダル =====

var _gcSelected = { age: null, job: null, exp: null };

function openGuildCardModal() {
  _gcSelected = {
    age: currentUserAgeGroup,
    job: currentUserJobClass,
    exp: currentUserExperience
  };

  var existing = document.getElementById('gc-modal');
  if (existing) existing.remove();

  var AGE_OPTS = [
    { v: '10代',    icon: '🌱', label: '10代' },
    { v: '20代',    icon: '⚡', label: '20代' },
    { v: '30代以上', icon: '🔥', label: '30代以上' },
  ];
  var JOB_OPTS = [
    { v: '学生',             icon: '🎓', label: '学生' },
    { v: '会社員',           icon: '💼', label: '会社員' },
    { v: 'フリーランス',      icon: '🚀', label: 'フリーランス' },
    { v: 'その他',           icon: '🎲', label: 'その他' },
  ];
  var EXP_OPTS = [
    { v: '完全未経験',           icon: '🥚', label: '完全未経験' },
    { v: '少し触ったことがある',   icon: '🐣', label: '少し触れたことがある' },
    { v: '実務経験あり',          icon: '🦅', label: '実務経験あり' },
  ];

  function _optHTML(key, opts) {
    return opts.map(function(o) {
      var sel = _gcSelected[key] === o.v;
      return '<button class="gc-opt' + (sel ? ' gc-opt-sel' : '') + '" ' +
        'onclick="_gcPick(\'' + key + '\',\'' + o.v.replace(/'/g, "\\'") + '\',this)">' +
        '<span class="gc-opt-icon">' + o.icon + '</span>' +
        '<span class="gc-opt-label">' + o.label + '</span>' +
        '</button>';
    }).join('');
  }

  var modal = document.createElement('div');
  modal.id = 'gc-modal';
  modal.className = 'gc-modal';
  modal.innerHTML =
    '<div class="gc-overlay" onclick="closeGuildCardModal()"></div>' +
    '<div class="gc-panel">' +
      '<div class="gc-header">' +
        '<div class="gc-header-title">🎖️ ギルドカード作成</div>' +
        '<button class="syntax-close" onclick="closeGuildCardModal()">✕</button>' +
      '</div>' +
      '<div class="gc-body">' +
        '<p class="gc-desc">プロフィールを登録すると、同じ属性の人の中での<br>ランキングが解放されます。</p>' +
        '<div class="gc-group">' +
          '<div class="gc-group-label">年齢層</div>' +
          '<div class="gc-opts" id="gc-age">' + _optHTML('age', AGE_OPTS) + '</div>' +
        '</div>' +
        '<div class="gc-group">' +
          '<div class="gc-group-label">職業クラス</div>' +
          '<div class="gc-opts" id="gc-job">' + _optHTML('job', JOB_OPTS) + '</div>' +
        '</div>' +
        '<div class="gc-group">' +
          '<div class="gc-group-label">プログラミング経験</div>' +
          '<div class="gc-opts" id="gc-exp">' + _optHTML('exp', EXP_OPTS) + '</div>' +
        '</div>' +
        '<p id="gc-error" class="gc-error hidden">すべての項目を選択してください</p>' +
        '<button class="gc-save-btn" onclick="saveGuildCard()">カードを登録する</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
  requestAnimationFrame(function() { modal.classList.add('open'); });
}

function _gcPick(key, val, el) {
  _gcSelected[key] = val;
  var group = el.parentElement;
  group.querySelectorAll('.gc-opt').forEach(function(b) { b.classList.remove('gc-opt-sel'); });
  el.classList.add('gc-opt-sel');
  document.getElementById('gc-error').classList.add('hidden');
}

function closeGuildCardModal() {
  var modal = document.getElementById('gc-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(function() { if (modal.parentNode) modal.remove(); }, 250);
}

async function saveGuildCard() {
  if (!_gcSelected.age || !_gcSelected.job || !_gcSelected.exp) {
    document.getElementById('gc-error').classList.remove('hidden');
    return;
  }
  if (!_supabase || !currentUser) return;

  var btn = document.querySelector('.gc-save-btn');
  btn.disabled = true;
  btn.textContent = '保存中...';

  try {
    var res = await _supabase
      .from('user_profiles')
      .update({
        age_group:  _gcSelected.age,
        job_class:  _gcSelected.job,
        experience: _gcSelected.exp
      })
      .eq('user_id', currentUser.id);

    if (res.error) throw res.error;

    currentUserAgeGroup   = _gcSelected.age;
    currentUserJobClass   = _gcSelected.job;
    currentUserExperience = _gcSelected.exp;

    closeGuildCardModal();
    renderProfile();
  } catch(e) {
    btn.disabled = false;
    btn.textContent = 'カードを登録する';
    document.getElementById('gc-error').textContent = '保存に失敗しました: ' + e.message;
    document.getElementById('gc-error').classList.remove('hidden');
  }
}

function openAuthModal() {
  playUIClick();
  var modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  setTimeout(function() {
    var emailEl = document.getElementById('auth-email');
    if (emailEl) emailEl.focus();
  }, 50);
}

// ===== プッシュ通知 =====
async function requestPushPermission() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  // すでに許可済みか拒否済みなら何もしない
  if (Notification.permission !== 'default') return;
  // ログインから少し遅らせて自然なタイミングで
  setTimeout(async function() {
    try {
      var permission = await Notification.requestPermission();
      if (permission === 'granted') {
        schedulePushReminders();
      }
    } catch(e) {}
  }, 3000);
}

function schedulePushReminders() {
  // ローカルで連続ログインチェック → 2日以上あいていたら即通知
  try {
    var days = lsGetJSON('login_days', []).sort();
    if (days.length < 2) return;
    var last = new Date(days[days.length - 1]);
    var diff = Math.floor((Date.now() - last.getTime()) / 86400000);
    if (diff >= 2) {
      var notifOpts = { body: diff + '日ぶりの再開です。続きから学習しよう！', icon: '/icon.svg' };
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function(reg) { reg.showNotification('CODE STEP — おかえり！', notifOpts); });
      } else {
        new Notification('CODE STEP — おかえり！', notifOpts);
      }
    }
  } catch(e) {}
}

// ===== 問題報告 =====
var _reportProblemId = null;

function openReportModal(id, title) {
  _reportProblemId = id;
  document.getElementById('report-problem-title').textContent = '問題 #' + String(id).padStart(2,'0') + ' — ' + title;
  document.querySelectorAll('input[name="report-type"]').forEach(function(r) { r.checked = false; });
  document.getElementById('report-detail').value = '';
  var msg = document.getElementById('report-msg');
  msg.classList.add('hidden');
  msg.textContent = '';
  document.getElementById('report-submit-btn').disabled = false;
  document.getElementById('report-modal').classList.remove('hidden');
}

function closeReportModal() {
  document.getElementById('report-modal').classList.add('hidden');
  _reportProblemId = null;
}

async function submitReport() {
  var type = (document.querySelector('input[name="report-type"]:checked') || {}).value;
  var detail = document.getElementById('report-detail').value.trim();
  var msg = document.getElementById('report-msg');
  var btn = document.getElementById('report-submit-btn');

  if (!type) {
    msg.textContent = '報告の種類を選択してください';
    msg.className = 'report-msg-error';
    msg.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.textContent = '送信中...';

  try {
    if (_supabase) {
      await _supabase.from('bug_reports').insert({
        problem_id:  _reportProblemId,
        language:    currentLanguage || 'cpp',
        report_type: type,
        detail:      detail || null,
        user_email:  currentUser ? currentUser.email : null,
        created_at:  new Date().toISOString()
      });
    }
    msg.textContent = '報告を受け付けました。ありがとうございます！';
    msg.className = 'report-msg-ok';
    msg.classList.remove('hidden');
    setTimeout(closeReportModal, 1800);
  } catch(e) {
    msg.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
    msg.className = 'report-msg-error';
    msg.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = '報告を送信';
  }
}

async function signInWithGoogle() {
  if (!_supabase) return;
  var btn = document.getElementById('google-signin-btn');
  if (btn) { btn.disabled = true; btn.textContent = '接続中...'; }
  try {
    await _supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  } catch(e) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" style="vertical-align:middle;margin-right:8px"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.566 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/></svg>Googleでログイン'; }
  }
}

function closeAuthModal() {
  playGoBack();
  var _m  = document.getElementById('auth-modal');    if (_m)  _m.classList.add('hidden');
  var _e  = document.getElementById('auth-error');    if (_e)  _e.classList.add('hidden');
  var _s  = document.getElementById('auth-success');  if (_s)  _s.classList.add('hidden');
  var _em = document.getElementById('auth-email');    if (_em) _em.value = '';
  var _pw = document.getElementById('auth-password'); if (_pw) _pw.value = '';
  var fpBtn = document.getElementById('forgot-pw-btn');
  if (fpBtn) { fpBtn.disabled = false; fpBtn.textContent = 'パスワードを忘れた方'; }
  _pendingConfirmEmail = null;
}

// Escキーでモーダルを閉じる
document.addEventListener('keydown', function(e) {
  // Ctrl+Enter → コード実行（詳細ページ上）
  if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'Enter') {
    var detailPage = document.getElementById('page-detail');
    if (detailPage && !detailPage.classList.contains('hidden')) {
      e.preventDefault();
      runCode();
      return;
    }
  }

  if (e.key !== 'Escape') return;
  var authModal   = document.getElementById('auth-modal');
  var adminPanel  = document.getElementById('admin-panel');
  var quizModal   = document.getElementById('quiz-modal');
  var premiumModal = document.getElementById('premium-modal');
  var rankModal   = document.getElementById('rank-unlock-modal');
  if (premiumModal && !premiumModal.classList.contains('hidden')) { closePremiumModal(); return; }
  if (rankModal   && !rankModal.classList.contains('hidden'))    { closeRankUnlockModal(); return; }
  if (authModal   && !authModal.classList.contains('hidden'))    { closeAuthModal(); return; }
  if (adminPanel  && !adminPanel.classList.contains('hidden'))   { closeAdminPanel(); return; }
  if (quizModal   && !quizModal.classList.contains('hidden'))    { closeQuizModal(); return; }
});

function switchAuthTab(tab) {
  _currentAuthTab = tab;
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('auth-submit-btn').textContent = tab === 'login' ? 'LOGIN' : 'SIGN UP';
  document.getElementById('auth-error').classList.add('hidden');
  document.getElementById('auth-success').classList.add('hidden');
}

async function submitAuth() {
  var emailEl = document.getElementById('auth-email');
  var passEl  = document.getElementById('auth-password');
  var errEl   = document.getElementById('auth-error');
  var sucEl   = document.getElementById('auth-success');
  var btn     = document.getElementById('auth-submit-btn');
  if (!emailEl || !passEl || !errEl || !sucEl || !btn) return;
  var email = emailEl.value.trim();
  var pass  = passEl.value;

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
  var btn      = document.getElementById('auth-btn');
  var info     = document.getElementById('user-info');
  var emailEl  = document.getElementById('user-email-display');
  var anonBnr  = document.getElementById('anon-banner');
  if (currentUser) {
    var isAnon = !currentUser.email;
    btn.classList.add('hidden');
    info.classList.remove('hidden');
    emailEl.textContent = isAnon ? 'ゲスト' : currentUser.email;
    if (anonBnr) anonBnr.classList.toggle('hidden', !isAnon);
  } else {
    btn.classList.remove('hidden');
    info.classList.add('hidden');
    if (anonBnr) anonBnr.classList.add('hidden');
  }
}

async function initAuth() {
  if (!_supabase) return;

  // 認証状態の変化を監視（ログイン/ログアウト時に自動発火）
  _supabase.auth.onAuthStateChange(async function(event, session) {
    currentUser = session ? session.user : null;
    _progressCache = null;
    _missionProgressCache = null;
    _followingSet = null;
    updateAuthUI();
    if (currentUser) {
      recordLoginDay();
      await fetchUserProfile(); // await してからrenderListを呼ぶ（プレミアム状態確定後に描画）
      await updateStreakBadge();
      requestPushPermission();
      // Stripe リダイレクト後にOAuthでセッションが遅延した場合のトースト表示
      if (sessionStorage.getItem('pending_premium_toast') === '1') {
        sessionStorage.removeItem('pending_premium_toast');
        var msg = document.createElement('div');
        msg.className = 'premium-success-toast';
        msg.textContent = '🎉 CODE STEP PLUS へようこそ！全コンテンツが解放されました';
        document.body.appendChild(msg);
        setTimeout(function() { msg.remove(); }, 4000);
      }
    } else {
      currentUserIsPremium = false;
      updateAdDisplay();
    }
    if (currentUser && currentLanguage) {
      try {
        await syncProgressFromSupabase();
        await syncMissionProgressFromSupabase();
      } catch(e) { console.warn('sync error on auth change:', e); }
      updateProgressDisplay();
      renderList();
    } else if (!currentUser && currentLanguage) {
      updateProgressDisplay();
      renderList();
    }
  });

  // Stripe 決済完了リダイレクト処理（セッション取得前に記録、OAuthの遅延にも対応）
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('premium') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    sessionStorage.setItem('pending_premium_toast', '1');
  }

  // ページロード時の既存セッション取得
  var sessionResult = await _supabase.auth.getSession();
  if (sessionResult.data && sessionResult.data.session) {
    currentUser = sessionResult.data.session.user;
    recordLoginDay();
    await fetchUserProfile(); // await してからrenderList（プレミアム状態確定後に描画）
    updateStreakBadge();
    updateAuthUI();
    // セッションが即取得できた場合はここでトースト表示
    if (sessionStorage.getItem('pending_premium_toast') === '1') {
      sessionStorage.removeItem('pending_premium_toast');
      var msg = document.createElement('div');
      msg.className = 'premium-success-toast';
      msg.textContent = '🎉 CODE STEP PLUS へようこそ！全コンテンツが解放されました';
      document.body.appendChild(msg);
      setTimeout(function() { msg.remove(); }, 4000);
    }
    if (currentLanguage) {
      await syncProgressFromSupabase();
      await syncMissionProgressFromSupabase();
      updateProgressDisplay();
      renderList();
    }
  }
}

// ===== 初期化 =====

// Stripe課金直後: ?premium=1 のとき数秒後にfetchUserProfileを再試行してプレミアム状態を確実に反映
(function() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('premium') !== '1') return;
  // URLからパラメータを消す（リロードしても再発火しないように）
  var cleanUrl = window.location.pathname;
  history.replaceState(null, '', cleanUrl);
  sessionStorage.setItem('pending_premium_toast', '1');
  // Webhook到達を待って2秒後・5秒後に再取得
  [2000, 5000].forEach(function(delay) {
    setTimeout(async function() {
      if (_premiumStatusCache) return; // すでにプレミアム確認済みなら不要
      if (!currentUser || !_supabase) return;
      await fetchUserProfile();
      updateAuthUI();
      if (currentLanguage) renderList();
    }, delay);
  });
})();

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
  if (!currentUser) { openAuthModal(); return; }
  var panel = document.getElementById('chat-panel');
  var isHidden = panel.classList.toggle('hidden');
  this.setAttribute('aria-expanded', String(!isHidden));
});

document.getElementById('chat-close').addEventListener('click', function() {
  document.getElementById('chat-panel').classList.add('hidden');
  document.getElementById('chat-toggle').setAttribute('aria-expanded', 'false');
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
window.addEventListener('online', function() {
  if (currentUser && _supabase) {
    syncProgressFromSupabase();
    syncMissionProgressFromSupabase();
  }
});

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
  var _bgSlideTimer = setInterval(next, 12000);
})();

// ===== 言語診断クイズ =====

var QUIZ_STEPS = {
  q1: {
    q: '何に一番興味がありますか？',
    sub: '直感でOK。後から変更できます。',
    choices: [
      { icon: '🌐', label: 'Web・アプリを作りたい',        next: 'q2_web',  log: 'Web・アプリ開発' },
      { icon: '🤖', label: 'AI・データ・自動化がしたい',   next: 'q2_data', log: 'AI・データ・自動化' },
      { icon: '🎮', label: 'ゲームを作りたい',             next: 'q2_game', log: 'ゲーム開発' },
      { icon: '🔧', label: 'システム・インフラ開発',        next: 'q2_sys',  log: 'システム・インフラ' },
      { icon: '✏️', label: 'よくわからない…自由に入力して AI に聞く', freeInput: true, log: '自由入力' }
    ]
  },
  q2_web: {
    q: 'Webのどの部分をやりたいですか？',
    choices: [
      { icon: '🎨', label: 'デザイン・見た目（HTML/CSS）',    result: 'html',       log: 'Webデザイン・見た目' },
      { icon: '⚡', label: 'ボタンや動き・インタラクション', result: 'javascript', log: 'Webインタラクション' },
      { icon: '🛠️', label: 'サーバー・API・バックエンド',    next: 'q3_backend',   log: 'サーバー・バックエンド' },
      { icon: '🌍', label: 'フロント＋バック全部やりたい',   result: 'php',        log: 'フルスタック志向' }
    ]
  },
  q2_data: {
    q: '具体的に何をしたいですか？',
    choices: [
      { icon: '📊', label: 'データ分析・機械学習・AI開発',    result: 'python', log: 'データ分析・機械学習' },
      { icon: '🖥️', label: 'サーバー管理・Linux作業の自動化', result: 'bash',   log: 'サーバー・Linux自動化' },
      { icon: '💾', label: 'データベース設計・SQL操作',       result: 'sql',    log: 'データベース・SQL' },
      { icon: '🔍', label: 'ログ解析・文字列パターン処理',    result: 'regex',  log: '文字列パターン処理' }
    ]
  },
  q2_game: {
    q: 'どんなゲームを作りたいですか？',
    choices: [
      { icon: '🕹️', label: 'ブラウザ・Webゲーム',           result: 'javascript', log: 'ブラウザゲーム' },
      { icon: '🎯', label: '3D本格ゲーム（Unreal / Unity）', result: 'cpp',        log: '3D本格ゲーム' },
      { icon: '📱', label: 'iPhoneアプリ・ゲーム（iOS）',    result: 'swift',      log: 'iOSゲーム' },
      { icon: '🤖', label: 'Androidアプリ・ゲーム',          result: 'kotlin',     log: 'Androidゲーム' }
    ]
  },
  q2_sys: {
    q: 'どんな開発がしたいですか？',
    choices: [
      { icon: '🔌', label: '組み込み・OS・ハードウェア制御',    result: 'c',    log: '組み込み・OS開発' },
      { icon: '⚡', label: '安全性と超速さを両立したシステム', result: 'rust', log: '高速・安全システム' },
      { icon: '🏢', label: '企業システム・大規模バックエンド',  result: 'java', log: '企業システム開発' },
      { icon: '☁️', label: 'クラウド・マイクロサービス開発',   result: 'go',   log: 'クラウド・マイクロサービス' }
    ]
  },
  q3_backend: {
    q: 'バックエンドで何を重視しますか？',
    choices: [
      { icon: '⚡', label: '短期間でとにかく習得したい',         result: 'php',    log: '素早い習得重視' },
      { icon: '💎', label: 'きれいで読みやすいコードを書きたい', result: 'ruby',   log: 'コードの美しさ重視' },
      { icon: '☁️', label: '大規模・高パフォーマンスなAPI',      result: 'go',     log: '大規模・高速API重視' },
      { icon: '🤖', label: 'AI・機械学習との連携も視野に',       result: 'python', log: 'AI連携バックエンド' }
    ]
  }
};

var QUIZ_RESULTS = {
  python:     { id: 'python',     name: 'Python',     color: '#3776AB', badge: '🐍', tier: 'ROOKIE' },
  html:       { id: 'html',       name: 'HTML/CSS',   color: '#E44D26', badge: '🌐', tier: 'ROOKIE' },
  javascript: { id: 'javascript', name: 'JavaScript', color: '#F0C040', badge: '⚡', tier: 'BRONZE' },
  ruby:       { id: 'ruby',       name: 'Ruby',       color: '#CC342D', badge: '💎', tier: 'BRONZE' },
  sql:        { id: 'sql',        name: 'SQL',        color: '#336791', badge: '💾', tier: 'BRONZE' },
  kotlin:     { id: 'kotlin',     name: 'Kotlin',     color: '#7F52FF', badge: '🤖', tier: 'SILVER' },
  swift:      { id: 'swift',      name: 'Swift',      color: '#FA7343', badge: '🍎', tier: 'SILVER' },
  bash:       { id: 'bash',       name: 'Bash',       color: '#4EAA25', badge: '🖥️', tier: 'SILVER' },
  regex:      { id: 'regex',      name: 'Regex',      color: '#FF6B35', badge: '🔍', tier: 'SILVER' },
  php:        { id: 'php',        name: 'PHP',        color: '#777BB4', badge: '🐘', tier: 'GOLD' },
  java:       { id: 'java',       name: 'Java',       color: '#ED8B00', badge: '☕', tier: 'GOLD' },
  go:         { id: 'go',         name: 'Go',         color: '#00ADD8', badge: '🚀', tier: 'GOLD' },
  cpp:        { id: 'cpp',        name: 'C++',        color: '#00599C', badge: '⚔️', tier: 'DIAMOND' },
  c:          { id: 'c',          name: 'C',          color: '#A8B9CC', badge: '🔧', tier: 'PLATINUM' },
  rust:       { id: 'rust',       name: 'Rust',       color: '#CE412B', badge: '⚙️', tier: 'MASTER' }
};

var _quizHistory = [];
var _quizCurrentStep = 'q1';
var _quizAnswerLog = [];

function openQuizModal() {
  _quizHistory = [];
  _quizCurrentStep = 'q1';
  _quizAnswerLog = [];
  document.getElementById('quiz-modal').classList.remove('hidden');
  _renderQuizStep('q1');
}

function closeQuizModal() {
  document.getElementById('quiz-modal').classList.add('hidden');
}

// ══════════════════════════════════════════════
// 職業診断クイズ
// ══════════════════════════════════════════════

var CAREER_QUIZ_STEPS = {
  q1: {
    step: 1, total: 2,
    q: '一番やりたいことは何ですか？',
    sub: '直感で選んでOK！後から変えられます',
    choices: [
      { icon: '🌐', label: 'Webサイト・アプリを作りたい',    next: 'q2_web'    },
      { icon: '🎮', label: 'ゲームを作りたい',              result: 'game'     },
      { icon: '🤖', label: 'AIやデータを扱いたい',          next: 'q2_ai'     },
      { icon: '📱', label: 'スマホアプリを作りたい',         next: 'q2_mobile' },
      { icon: '🔒', label: 'セキュリティ・ハッキング系',     result: 'security' },
      { icon: '🖥',  label: 'サーバー・インフラ管理',        result: 'infra'    },
      { icon: '⚙',  label: 'OS・組み込み・低レベル開発',    next: 'q2_system' },
      { icon: '📊', label: 'データ分析・ビジネス系',         result: 'dataeng'  },
    ]
  },
  q2_web: {
    step: 2, total: 2,
    q: 'Webのどの部分に興味がある？',
    sub: 'イメージで選んでみよう',
    choices: [
      { icon: '🎨', label: 'デザイン・見た目・操作感',      result: 'uiux'     },
      { icon: '⚙',  label: 'サーバー・データベース・API',   result: 'backend'  },
      { icon: '↔',  label: '両方やりたい（フルスタック）',  result: 'frontend' },
      { icon: '🚀', label: 'スタートアップで全部やりたい',   result: 'cto'      },
    ]
  },
  q2_ai: {
    step: 2, total: 2,
    q: 'AIのどの部分に関わりたい？',
    sub: '',
    choices: [
      { icon: '🧠', label: 'モデルを作る・研究する',         result: 'ai'              },
      { icon: '📦', label: '本番環境で動かす・運用する',     result: 'mlops'           },
      { icon: '🧬', label: '医療・生命科学データを扱う',     result: 'bioinformatics'  },
      { icon: '📈', label: 'データ分析・可視化',             result: 'dataeng'         },
    ]
  },
  q2_mobile: {
    step: 2, total: 2,
    q: 'どのプラットフォームのアプリを作りたい？',
    sub: '',
    choices: [
      { icon: '🍎', label: 'iPhoneアプリ（iOS）',            result: 'mobile'   },
      { icon: '🤖', label: 'Androidアプリ',                  result: 'mobile'   },
      { icon: '🎮', label: 'ゲームアプリ',                   result: 'game'     },
      { icon: '🌐', label: 'WebとアプリどちらもOK',           result: 'frontend' },
    ]
  },
  q2_system: {
    step: 2, total: 2,
    q: '低レベル系のどの分野が気になる？',
    sub: '',
    choices: [
      { icon: '🤖', label: 'ロボット・自律システム',          result: 'robotics' },
      { icon: '🚀', label: '宇宙・衛星ソフトウェア',          result: 'space'    },
      { icon: '🔬', label: 'OS・コンパイラ開発',              result: 'compiler' },
      { icon: '🎵', label: '音声処理・DSP',                   result: 'audio'    },
    ]
  }
};

var _cqHistory = [];
var _cqStep    = 'q1';

function openCareerQuizModal() {
  _cqHistory = [];
  _cqStep = 'q1';
  document.getElementById('career-quiz-modal').classList.remove('hidden');
  _renderCQStep('q1');
}

function closeCareerQuizModal() {
  document.getElementById('career-quiz-modal').classList.add('hidden');
}

function _renderCQStep(stepId) {
  var step = CAREER_QUIZ_STEPS[stepId];
  if (!step) return;
  var dots = '';
  for (var i = 1; i <= step.total; i++) {
    dots += '<span class="quiz-dot' + (i === step.step ? ' active' : (i < step.step ? ' done' : '')) + '"></span>';
  }
  var choicesHTML = step.choices.map(function(c) {
    var attr = c.result
      ? 'onclick="_cqChoose(null,\'' + c.result + '\')"'
      : 'onclick="_cqChoose(\'' + c.next + '\',null)"';
    return '<button class="cq-choice-btn" ' + attr + '>' +
      '<span class="cq-choice-icon">' + c.icon + '</span>' +
      '<span class="cq-choice-label">' + c.label + '</span>' +
    '</button>';
  }).join('');
  document.getElementById('career-quiz-box').innerHTML =
    '<div class="quiz-topbar">' +
      '<button class="quiz-back-btn" onclick="_cqBack()">←</button>' +
      '<div class="quiz-step-dots">' + dots + '</div>' +
    '</div>' +
    '<div class="quiz-q-label">STEP ' + step.step + ' / ' + step.total + '</div>' +
    '<div class="quiz-question">' + step.q + '</div>' +
    (step.sub ? '<div class="quiz-sub">' + step.sub + '</div>' : '') +
    '<div class="cq-choices">' + choicesHTML + '</div>';
}

function _cqChoose(nextStep, resultId) {
  _cqHistory.push(_cqStep);
  if (resultId) {
    _renderCQResult(resultId);
  } else {
    _cqStep = nextStep;
    _renderCQStep(nextStep);
  }
}

function _cqBack() {
  if (_cqHistory.length === 0) { closeCareerQuizModal(); return; }
  _cqStep = _cqHistory.pop();
  _renderCQStep(_cqStep);
}

function _renderCQResult(careerId) {
  var career = CAREERS.find(function(c) { return c.id === careerId; });
  if (!career) { closeCareerQuizModal(); return; }
  document.getElementById('career-quiz-box').innerHTML =
    '<div class="quiz-topbar">' +
      '<button class="quiz-back-btn" onclick="_cqBack()">←</button>' +
      '<div class="quiz-step-dots"><span class="quiz-dot done"></span><span class="quiz-dot active"></span></div>' +
    '</div>' +
    '<div class="quiz-result-announce">あなたにおすすめの職業は</div>' +
    '<div class="cq-result-card" style="border-color:' + career.color + '88;box-shadow:0 0 24px ' + career.color + '22">' +
      '<div class="cq-result-icon">' + career.icon + '</div>' +
      '<div class="cq-result-name" style="color:' + career.color + '">' + career.title + '</div>' +
      '<div class="cq-result-desc">' + career.desc + '</div>' +
    '</div>' +
    '<div class="quiz-result-actions">' +
      '<button class="quiz-start-btn" onclick="closeCareerQuizModal();_scrollToCareer(\'' + careerId + '\')" style="--qcol:' + career.color + '">▶ この職業を詳しく見る</button>' +
      '<button class="quiz-retry-btn" onclick="openCareerQuizModal()">↩ もう一度診断する</button>' +
    '</div>';
}

function _scrollToCareer(careerId) {
  _careerSelected = careerId;
  renderCareer();
  var cards = document.querySelectorAll('.career-card');
  cards.forEach(function(card) {
    if (card.querySelector('.career-card-title') && card.querySelector('.career-card-title').textContent === (CAREERS.find(function(c){return c.id===careerId;})||{}).title) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

function _quizChoose(choice) {
  _quizHistory.push(_quizCurrentStep);
  _quizAnswerLog.push(choice.log);
  if (choice.freeInput) {
    _renderFreeInputStep();
  } else if (choice.result) {
    _renderQuizResult(choice.result);
  } else {
    _quizCurrentStep = choice.next;
    _renderQuizStep(choice.next);
  }
}

function _renderFreeInputStep() {
  var box = document.getElementById('quiz-box');
  box.innerHTML =
    '<div class="quiz-topbar">' +
      '<button class="quiz-back-btn" id="quiz-back-btn">←</button>' +
      '<div class="quiz-step-dots">' + _quizDots(2) + '</div>' +
    '</div>' +
    '<div class="quiz-q-label">AI 診断</div>' +
    '<div class="quiz-question">やりたいことを自由に教えてください</div>' +
    '<div class="quiz-sub">例：「ゲームを作りたい」「仕事で使えるスキルを身につけたい」「データを分析したい」など</div>' +
    '<textarea id="quiz-free-input" class="quiz-textarea" placeholder="自由に書いてください…" maxlength="300"></textarea>' +
    '<div class="quiz-free-meta"><span id="quiz-char-count">0</span><span>/300</span></div>' +
    '<div id="quiz-free-error" class="quiz-free-error hidden"></div>' +
    '<button class="quiz-submit-btn" id="quiz-submit-btn" disabled>🤖 AIに分析してもらう</button>';

  document.getElementById('quiz-back-btn').addEventListener('click', _quizBack);

  var ta = document.getElementById('quiz-free-input');
  var cnt = document.getElementById('quiz-char-count');
  var btn = document.getElementById('quiz-submit-btn');
  ta.addEventListener('input', function() {
    cnt.textContent = ta.value.length;
    btn.disabled = ta.value.trim().length < 5;
  });
  btn.addEventListener('click', function() { _submitFreeInput(); });
}

async function _submitFreeInput() {
  var ta  = document.getElementById('quiz-free-input');
  var btn = document.getElementById('quiz-submit-btn');
  var err = document.getElementById('quiz-free-error');
  if (!ta || !btn || !err) return;
  var text = ta.value.trim();
  if (!text || text.length < 5) return;

  btn.disabled = true;
  btn.textContent = '🤖 分析中…';
  err.classList.add('hidden');

  try {
    var result = await _analyzeWithAI(text);
    _quizAnswerLog.push('自由入力: ' + text);
    _renderQuizResultFromAI(result.langId, result.message);
  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🤖 AIに分析してもらう';
    err.textContent = 'エラーが発生しました。もう一度お試しください。';
    err.classList.remove('hidden');
  }
}

async function _analyzeWithAI(userText) {
  var system = 'あなたはプログラミング言語推薦AIです。ユーザーの入力を分析して最適な言語を推薦してください。\n\n選択可能な言語ID（必ずこの中から1つ選ぶ）:\npython, javascript, html, php, ruby, typescript, go, swift, kotlin, cpp, csharp, c, rust, sql, bash, regex, java\n\n必ず以下のJSON形式のみで回答してください（余分なテキスト不要）:\n{"lang":"言語ID","message":"推薦理由と激励メッセージ（日本語2〜3文、絵文字OK）"}';
  var reply = await askAI(system, 'ユーザーの入力: ' + userText);
  try {
    var jsonStr = reply.match(/\{[\s\S]*?\}/)[0];
    var parsed  = JSON.parse(jsonStr);
    var langId  = QUIZ_RESULTS[parsed.lang] ? parsed.lang : 'python';
    return { langId: langId, message: parsed.message || '' };
  } catch(e) {
    return { langId: 'python', message: reply };
  }
}

function _renderQuizResultFromAI(resultId, aiMessage) {
  var r   = QUIZ_RESULTS[resultId];
  var box = document.getElementById('quiz-box');
  box.innerHTML =
    '<div class="quiz-topbar">' +
      '<button class="quiz-back-btn" id="quiz-result-back">←</button>' +
      '<div class="quiz-step-dots">' + _quizDots(4) + '</div>' +
    '</div>' +
    '<div class="quiz-result-announce">AIが分析しました！あなたにおすすめの言語は</div>' +
    '<div class="quiz-result-card" style="border-color:' + escapeHtml(r.color) + '88">' +
      '<div class="quiz-result-badge">' + escapeHtml(r.badge) + '</div>' +
      '<div class="quiz-result-name" style="color:' + escapeHtml(r.color) + '">' + escapeHtml(r.name) + '</div>' +
      '<div class="quiz-result-tier">◆ ' + escapeHtml(r.tier) + ' TIER</div>' +
    '</div>' +
    '<div class="quiz-ai-msg">' +
      '<div class="quiz-ai-text">' + escapeHtml(aiMessage).replace(/\n/g, '<br>') + '</div>' +
    '</div>' +
    '<div class="quiz-result-actions">' +
      '<button class="quiz-start-btn" onclick="startWithLanguage(\'' + escapeHtml(r.id) + '\')" style="--qcol:' + escapeHtml(r.color) + '">▶ ' + escapeHtml(r.name) + ' で始める</button>' +
      '<button class="quiz-retry-btn" onclick="openQuizModal()">↩ もう一度診断する</button>' +
    '</div>';
  document.getElementById('quiz-result-back').addEventListener('click', _quizBack);
}

function _quizBack() {
  if (_quizHistory.length === 0) { closeQuizModal(); return; }
  _quizAnswerLog.pop();
  _quizCurrentStep = _quizHistory.pop();
  _renderQuizStep(_quizCurrentStep);
}

function _quizDots(current) {
  var total = 3;
  var html = '';
  for (var i = 1; i <= total; i++) {
    if (i < current)      html += '<span class="quiz-dot done"></span>';
    else if (i === current) html += '<span class="quiz-dot active"></span>';
    else                  html += '<span class="quiz-dot"></span>';
  }
  return html;
}

function _renderQuizStep(stepId) {
  var step = QUIZ_STEPS[stepId];
  var box = document.getElementById('quiz-box');
  var stepNum = _quizHistory.length + 1;
  var isFirst = _quizHistory.length === 0;

  var choicesHtml = step.choices.map(function(c, i) {
    return '<button class="quiz-choice" data-qidx="' + i + '">' +
      '<span class="quiz-icon">' + escapeHtml(c.icon) + '</span>' +
      '<span class="quiz-label">' + escapeHtml(c.label) + '</span>' +
      '<span class="quiz-arrow">›</span>' +
    '</button>';
  }).join('');

  box.innerHTML =
    '<div class="quiz-topbar">' +
      '<button class="quiz-back-btn" id="quiz-back-btn">' + (isFirst ? '✕' : '←') + '</button>' +
      '<div class="quiz-step-dots">' + _quizDots(stepNum) + '</div>' +
    '</div>' +
    '<div class="quiz-q-label">Q' + stepNum + '</div>' +
    '<div class="quiz-question">' + escapeHtml(step.q) + '</div>' +
    (step.sub ? '<div class="quiz-sub">' + escapeHtml(step.sub) + '</div>' : '') +
    '<div class="quiz-choices">' + choicesHtml + '</div>';

  document.getElementById('quiz-back-btn').addEventListener('click', _quizBack);
  box.querySelectorAll('.quiz-choice').forEach(function(btn, i) {
    btn.style.animationDelay = (i * 0.06) + 's';
    btn.addEventListener('click', function() { _quizChoose(step.choices[i]); });
  });
}

function _renderQuizResult(resultId) {
  var r = QUIZ_RESULTS[resultId];
  var box = document.getElementById('quiz-box');

  box.innerHTML =
    '<div class="quiz-topbar">' +
      '<button class="quiz-back-btn" id="quiz-result-back">←</button>' +
      '<div class="quiz-step-dots">' + _quizDots(4) + '</div>' +
    '</div>' +
    '<div class="quiz-result-announce">診断完了！あなたにおすすめの言語は</div>' +
    '<div class="quiz-result-card" style="border-color:' + escapeHtml(r.color) + '88">' +
      '<div class="quiz-result-badge">' + escapeHtml(r.badge) + '</div>' +
      '<div class="quiz-result-name" style="color:' + escapeHtml(r.color) + '">' + escapeHtml(r.name) + '</div>' +
      '<div class="quiz-result-tier">◆ ' + escapeHtml(r.tier) + ' TIER</div>' +
    '</div>' +
    '<div class="quiz-ai-msg" id="quiz-ai-msg">' +
      '<div class="quiz-ai-loading"><span class="quiz-spinner"></span> AIコーチがメッセージを生成中…</div>' +
    '</div>' +
    '<div class="quiz-result-actions">' +
      '<button class="quiz-start-btn" id="quiz-start-btn" onclick="startWithLanguage(\'' + escapeHtml(r.id) + '\')" style="--qcol:' + escapeHtml(r.color) + '">' +
        '▶ ' + escapeHtml(r.name) + ' で始める' +
      '</button>' +
      '<button class="quiz-retry-btn" onclick="openQuizModal()">↩ もう一度診断する</button>' +
    '</div>';

  document.getElementById('quiz-result-back').addEventListener('click', _quizBack);

  var logSnapshot = _quizAnswerLog.slice();
  _generateQuizMessage(r, logSnapshot).then(function(msg) {
    var aiBox = document.getElementById('quiz-ai-msg');
    if (aiBox) aiBox.innerHTML = '<div class="quiz-ai-text">' + escapeHtml(msg).replace(/\n/g, '<br>') + '</div>';
  }).catch(function() {
    var aiBox = document.getElementById('quiz-ai-msg');
    if (aiBox) aiBox.innerHTML = '';
  });
}

async function _generateQuizMessage(result, answerLog) {
  var system = 'あなたはプログラミング学習アプリ「CODE STEP」のコーチです。ユーザーの診断回答を受けて、その言語への「ようこそ！」的な短い激励メッセージを日本語で生成してください。2〜3文、熱く前向きに。絵文字OK。箇条書き・コードブロック禁止。';
  var userMsg = '診断回答: ' + answerLog.join(' → ') + '\n推奨言語: ' + result.name + '\nこのユーザーへの熱い激励メッセージをください。';
  return await askAI(system, userMsg);
}

function startWithLanguage(langId) {
  closeQuizModal();
  startApp();
  setTimeout(function() { selectLanguage(langId); }, 80);
}

// ===== キーボードショートカット（←/→ で前後の問題） =====
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  // エディタ・入力欄では無視
  var tag = (e.target || {}).tagName || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
  if (e.target && e.target.classList && e.target.classList.contains('ace_text-input')) return;

  var detailPage = document.getElementById('page-detail');
  if (!detailPage || detailPage.classList.contains('hidden')) return;
  if (!currentProblemId) return;

  var probs = getProblems();
  var idx = probs.findIndex(function(x) { return x.id === currentProblemId; });
  if (e.key === 'ArrowLeft' && idx > 0) {
    e.preventDefault();
    goToDetailProblem(probs[idx - 1].id);
  } else if (e.key === 'ArrowRight' && idx >= 0 && idx < probs.length - 1) {
    e.preventDefault();
    goToDetailProblem(probs[idx + 1].id);
  }
});

// ===== スワイプジェスチャー（モバイル：前後の問題） =====
(function() {
  var _swipeX = 0;
  var _swipeY = 0;
  document.addEventListener('touchstart', function(e) {
    _swipeX = e.changedTouches[0].clientX;
    _swipeY = e.changedTouches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function(e) {
    var detailPage = document.getElementById('page-detail');
    if (!detailPage || detailPage.classList.contains('hidden')) return;
    if (!currentProblemId) return;
    var dx = e.changedTouches[0].clientX - _swipeX;
    var dy = e.changedTouches[0].clientY - _swipeY;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.8) return; // 縦スクロールは無視
    var probs = getProblems();
    var idx = probs.findIndex(function(x) { return x.id === currentProblemId; });
    if (dx < 0 && idx >= 0 && idx < probs.length - 1) {
      goToDetailProblem(probs[idx + 1].id); // 左スワイプ → 次
    } else if (dx > 0 && idx > 0) {
      goToDetailProblem(probs[idx - 1].id); // 右スワイプ → 前
    }
  }, { passive: true });
})();

// ===== オフライン検知 =====
window.addEventListener('offline', function() {
  showToast('⚡ オフラインです。インターネット接続を確認してください。', 6000);
});
window.addEventListener('online', function() {
  showToast('✓ オンラインに戻りました');
});

