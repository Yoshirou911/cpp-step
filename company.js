/* ===== STATE ===== */
var _apiKey   = null;
var _company  = null;
var _results  = [];
var _hasMore  = false;
var _offset   = 0;
var _scoutTarget = null; // { user_id, rank_tier, color }

var RANK_COLOR = {
  OVERLORD: '#FFD700',
  TITAN:    '#FF2020',
  LEGEND:   '#FF2244',
  MASTER:   '#C040FF',
  DIAMOND:  '#5588FF',
  PLATINUM: '#00C8B4',
  GOLD:     '#EFC050',
  SILVER:   '#B8C8D8',
  BRONZE:   '#C47A2F',
  ROOKIE:   '#9B9B9B',
};

/* ===== INIT ===== */
(function init() {
  var stored = sessionStorage.getItem('scout_api_key');
  if (stored) { _apiKey = stored; verifySession(); }
  document.getElementById('scout-body').addEventListener('input', updateCharCount);
})();

/* ===== AUTH ===== */
async function verifySession() {
  try {
    var data = await callAuth(_apiKey);
    if (data.company) { _company = data.company; showDashboard(); }
    else              { doLogout(); }
  } catch(e) { doLogout(); }
}

async function doLogin() {
  var key = document.getElementById('api-key-input').value.trim();
  if (!key) { showLoginError('APIキーを入力してください'); return; }

  var btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = '認証中...';
  hideLoginError();

  try {
    var data = await callAuth(key);
    if (!data.company) { showLoginError(data.error || '認証に失敗しました'); return; }
    _apiKey  = key;
    _company = data.company;
    sessionStorage.setItem('scout_api_key', key);
    showDashboard();
  } catch(e) {
    showLoginError('ネットワークエラーが発生しました');
  } finally {
    btn.disabled = false; btn.textContent = 'ログイン';
  }
}

function doLogout() {
  _apiKey = null; _company = null; _results = [];
  sessionStorage.removeItem('scout_api_key');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('api-key-input').value = '';
  document.getElementById('results-grid').innerHTML = '';
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('company-name-label').textContent = _company.company_name;
  var planEl = document.getElementById('plan-badge');
  planEl.textContent = _company.subscription_plan.toUpperCase();
  planEl.className = 'plan-badge ' + _company.subscription_plan;
}

/* ===== SEARCH ===== */
async function doSearch(append) {
  if (!append) {
    _results = []; _offset = 0; _hasMore = false;
    document.getElementById('results-grid').innerHTML =
      '<div class="results-loading">// SEARCHING...</div>';
    setSearchStatus('');
  }

  var lang = document.getElementById('lang-select').value;
  var tier = document.getElementById('tier-select').value;
  var btn  = document.getElementById('search-btn');
  btn.disabled = true;

  try {
    var params = new URLSearchParams({ language: lang, min_tier: tier, limit: 20, offset: _offset });
    var res = await fetch('/api/company-search?' + params, {
      headers: { 'X-Company-API-Key': _apiKey }
    });
    var data = await res.json();

    if (!res.ok) {
      document.getElementById('results-grid').innerHTML =
        '<div class="results-error">// ' + escHtml(data.error || 'エラーが発生しました') + '</div>';
      return;
    }

    var items = data.items || [];
    _hasMore  = items.length === 20;
    _offset  += items.length;
    _results  = append ? _results.concat(items) : items;
    renderResults(append, items);
    setSearchStatus(
      _results.length === 0
        ? '該当するユーザーが見つかりませんでした'
        : _results.length + '件のユーザーが見つかりました' + (_hasMore ? '（続きあり）' : '')
    );
  } catch(e) {
    document.getElementById('results-grid').innerHTML =
      '<div class="results-error">// ネットワークエラー</div>';
  } finally {
    btn.disabled = false;
  }
}

function renderResults(append, newItems) {
  var grid = document.getElementById('results-grid');
  if (!append) grid.innerHTML = '';

  // 既存の「もっと読む」ボタンを削除
  var oldMore = document.getElementById('load-more-wrap');
  if (oldMore) oldMore.remove();

  if (_results.length === 0) {
    grid.innerHTML = '<div class="results-empty">// 該当するユーザーが見つかりませんでした</div>';
    return;
  }

  (newItems || _results).forEach(function(u) {
    grid.appendChild(makeUserCard(u));
  });

  if (_hasMore) {
    var wrap = document.createElement('div');
    wrap.id = 'load-more-wrap';
    wrap.className = 'load-more-wrap';
    wrap.innerHTML = '<button class="load-more-btn" onclick="doSearch(true)">さらに読み込む（20件）</button>';
    grid.appendChild(wrap);
  }
}

function makeUserCard(u) {
  var color      = RANK_COLOR[u.rank_tier] || '#FF2020';
  var isOverlord = u.rank_tier === 'OVERLORD';
  var anonId     = 'USER # ' + u.user_id.substring(0, 8).toUpperCase();

  var card = document.createElement('div');
  card.className = 'user-card' + (isOverlord ? ' is-overlord' : '');

  card.innerHTML =
    '<div class="user-card-top">' +
      '<span class="user-rank-badge" style="color:' + color + ';border-color:' + color + '44">' +
        u.rank_tier +
      '</span>' +
      (isOverlord ? '<span class="user-crown">👑</span>' : '') +
    '</div>' +
    '<div class="user-anon-id">' + anonId + '</div>' +
    '<div class="user-pct-row">' +
      '<div class="user-pct-bar">' +
        '<div class="user-pct-fill" style="width:' + u.strength_pct + '%;background:' + color +
          (isOverlord ? ';box-shadow:0 0 6px ' + color : '') + '"></div>' +
      '</div>' +
      '<span class="user-pct-num" style="color:' + color + '">' + u.strength_pct + '%</span>' +
    '</div>' +
    '<div class="user-cleared">' + u.cleared_count + ' / ' + u.total_problems + ' 問クリア</div>' +
    (isOverlord
      ? '<div class="user-titan-count">👑 TITAN達成: ' + u.titan_lang_count + '言語</div>'
      : '') +
    '<button class="user-scout-btn" style="color:' + color + ';border-color:' + color + '44"' +
      ' onclick="openScoutModal(\'' + u.user_id + '\',\'' + u.rank_tier + '\')">' +
      'スカウトを送る' +
    '</button>';

  return card;
}

/* ===== SCOUT MODAL ===== */
function openScoutModal(userId, rankTier) {
  _scoutTarget = { user_id: userId, rank_tier: rankTier, color: RANK_COLOR[rankTier] || '#FF2020' };
  var anonId = 'USER # ' + userId.substring(0, 8).toUpperCase();

  document.getElementById('modal-target-id').textContent    = anonId;
  var rankEl = document.getElementById('modal-target-rank');
  rankEl.textContent      = rankTier;
  rankEl.style.color      = _scoutTarget.color;
  rankEl.style.borderColor= _scoutTarget.color + '55';

  document.getElementById('scout-title').value = '';
  document.getElementById('scout-body').value  = '';
  updateCharCount();
  hideScoutError();

  document.getElementById('scout-modal').classList.remove('hidden');
  setTimeout(function() { document.getElementById('scout-title').focus(); }, 50);
}

function closeScoutModal() {
  document.getElementById('scout-modal').classList.add('hidden');
  _scoutTarget = null;
}

async function doSendScout() {
  if (!_scoutTarget) return;
  var title = document.getElementById('scout-title').value.trim();
  var body  = document.getElementById('scout-body').value.trim();

  if (!title) { showScoutError('件名を入力してください'); return; }
  if (!body)  { showScoutError('本文を入力してください'); return; }

  var btn = document.getElementById('send-btn');
  btn.disabled = true; btn.textContent = '送信中...';
  hideScoutError();

  try {
    var res = await fetch('/api/company-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Company-API-Key': _apiKey,
      },
      body: JSON.stringify({
        target_user_id: _scoutTarget.user_id,
        message_title:  title,
        message_body:   body,
      }),
    });
    var data = await res.json();

    if (!res.ok) {
      showScoutError(data.error || '送信に失敗しました');
      return;
    }

    closeScoutModal();
    showFeedback('スカウトを送信しました');
  } catch(e) {
    showScoutError('ネットワークエラーが発生しました');
  } finally {
    btn.disabled = false; btn.textContent = '送信する';
  }
}

/* ===== API HELPERS ===== */
async function callAuth(key) {
  var res = await fetch('/api/company-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: key }),
  });
  return res.json();
}

/* ===== UI HELPERS ===== */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setSearchStatus(msg) {
  var el = document.getElementById('search-status');
  if (msg) { el.textContent = msg; el.classList.remove('hidden'); }
  else     { el.classList.add('hidden'); }
}

function showLoginError(msg) {
  var el = document.getElementById('login-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}
function hideLoginError() {
  document.getElementById('login-error').classList.add('hidden');
}

function showScoutError(msg) {
  var el = document.getElementById('scout-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}
function hideScoutError() {
  document.getElementById('scout-error').classList.add('hidden');
}

function updateCharCount() {
  var len = document.getElementById('scout-body').value.length;
  document.getElementById('body-count').textContent = len + ' / 2000';
}

function showFeedback(msg) {
  var existing = document.querySelector('.sent-feedback');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.className = 'sent-feedback';
  el.textContent = '✓ ' + msg;
  document.body.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.remove(); }, 3500);
}
