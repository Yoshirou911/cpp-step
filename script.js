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

// 問題クリア音：明るい上昇アルペジオ
function playClearSound() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    _tone(523.25, now,       0.18, 'sine',     0.22); // C5
    _tone(659.25, now + 0.10, 0.18, 'sine',    0.22); // E5
    _tone(783.99, now + 0.20, 0.18, 'sine',    0.22); // G5
    _tone(1046.5, now + 0.30, 0.45, 'sine',    0.28); // C6
    _tone(1318.5, now + 0.42, 0.55, 'sine',    0.18); // E6（余韻）
  } catch(e) {}
}

// ミッションクリア音：ファンファーレ
function playMissionClearSound() {
  if (!_soundEnabled) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    _tone(392.0,  now,        0.12, 'square', 0.12);
    _tone(523.25, now + 0.12, 0.12, 'square', 0.12);
    _tone(659.25, now + 0.24, 0.12, 'square', 0.12);
    _tone(783.99, now + 0.36, 0.55, 'square', 0.15);
    _tone(1046.5, now + 0.50, 0.70, 'square', 0.18);
    // ハーモニー
    _tone(659.25, now + 0.36, 0.55, 'sine',   0.08);
    _tone(783.99, now + 0.50, 0.70, 'sine',   0.10);
  } catch(e) {}
}

function toggleSound() {
  _soundEnabled = !_soundEnabled;
  localStorage.setItem('soundEnabled', _soundEnabled);
  var btn = document.getElementById('sound-btn');
  btn.textContent  = _soundEnabled ? '🔊' : '🔇';
  btn.classList.toggle('muted', !_soundEnabled);
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
var _currentAuthTab = 'login';
// 進捗のインメモリキャッシュ（言語切替時にリセット）
var _progressCache = null;
var _missionProgressCache = null;

// ===== 言語データ =====

var LANGUAGE_GROUPS = [
  {
    rank: 'ROOKIE',
    rankColor: '#9B9B9B',
    desc: '文法がシンプルで誰でも始めやすい',
    langs: [
      {
        id: 'python', name: 'Python', color: '#3776AB', problems: 30, available: true,
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
        id: 'javascript', name: 'JavaScript', color: '#F0C040', problems: 30, available: true,
        uses: ['Webフロントエンド', 'ブラウザゲーム', 'Node.js サーバー']
      },
      {
        id: 'ruby', name: 'Ruby', color: '#CC342D', problems: 0, available: false,
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
        id: 'typescript', name: 'TypeScript', color: '#3178C6', problems: 0, available: false,
        uses: ['大規模Webアプリ', '型安全なフロントエンド', 'フレームワーク開発']
      },
      {
        id: 'kotlin', name: 'Kotlin', color: '#7F52FF', problems: 0, available: false,
        uses: ['Androidアプリ', 'サーバーサイド', 'Spring Boot']
      },
      {
        id: 'swift', name: 'Swift', color: '#FA7343', problems: 0, available: false,
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
        id: 'java', name: 'Java', color: '#ED8B00', problems: 0, available: false,
        uses: ['企業向けシステム', 'Androidアプリ', 'Spring Bootサーバー']
      },
      {
        id: 'csharp', name: 'C#', color: '#9B4F96', problems: 0, available: false,
        uses: ['Unityゲーム開発', 'Windowsアプリ', '.NETサーバー']
      },
      {
        id: 'go', name: 'Go', color: '#00ADD8', problems: 0, available: false,
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
        id: 'c', name: 'C', color: '#A8B9CC', problems: 0, available: false,
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
        id: 'cpp', name: 'C++', color: '#00599C', problems: 30, available: true,
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
        id: 'rust', name: 'Rust', color: '#CE412B', problems: 0, available: false,
        uses: ['システムプログラミング', 'WebAssembly', 'OSカーネル', '高安全性ソフト']
      },
    ]
  },
];

var currentLanguage = null;

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

// ===== ブラウザ履歴の復元 =====

function restoreState(state) {
  if (!state || state.page === 'lang') {
    currentLanguage = null;
    renderLangSelect();
    showPage('lang');
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

// ===== 言語別データ取得ヘルパー =====

function getProblems() {
  if (currentLanguage === 'python') return pythonProblems;
  if (currentLanguage === 'javascript') return javascriptProblems;
  return problems;
}

function getMissions() {
  if (currentLanguage === 'python') return pythonMissions;
  if (currentLanguage === 'javascript') return javascriptMissions;
  return missions;
}

function getUnitGuides() {
  if (currentLanguage === 'python') return pythonUnitGuides;
  if (currentLanguage === 'javascript') return javascriptUnitGuides;
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
  if (currentLanguage === 'javascript') return 'node-head';
  return 'gcc-head';
}

function getAceMode() {
  if (currentLanguage === 'python') return 'ace/mode/python';
  if (currentLanguage === 'javascript') return 'ace/mode/javascript';
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
  if (p) return '// [問題] ' + p.question + '\n' + ACE_STARTER;
  return ACE_STARTER;
}

function getLangName() {
  if (currentLanguage === 'python') return 'Python';
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
  // 全ページを非表示にしてから対象だけ表示
  ["page-lang", "page-list", "page-detail", "page-guide",
   "page-mission-list", "page-mission-detail"].forEach(function(id) {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById("page-" + name).classList.remove("hidden");

  // 言語選択画面ではナビとプログレスを隠す
  if (name === 'lang') {
    document.getElementById('nav-tabs').classList.add('hidden');
    document.getElementById('progress-text').classList.add('hidden');
    document.getElementById('progress-bar-wrap').classList.add('hidden');
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
      var card = document.createElement("div");
      card.className = "problem-card rank-card-" + p.rank.toLowerCase() + (learned ? " learned" : "");

      card.innerHTML =
        '<div class="card-left">' +
          '<span class="card-num">' + String(p.id).padStart(2, '0') + '</span>' +
          '<span class="problem-title">' + p.title + '</span>' +
        '</div>' +
        '<div class="card-right">' +
          '<span class="rank-badge rank-' + p.rank.toLowerCase() + '">' + p.rank + '</span>' +
          '<span class="badge ' + (learned ? "" : "not-learned") + '">' +
            (learned ? "✔" : "—") +
          '</span>' +
        '</div>';

      card.addEventListener("click", function() {
        history.pushState({ page: 'detail', lang: currentLanguage, id: p.id }, '');
        renderDetail(p.id);
        showPage("detail");
      });

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
      '<button class="ai-feedback-btn" onclick="getAIFeedback(' + p.id + ')">🤖 AIにフィードバックをもらう</button>' +
      '<div id="ai-feedback-area" class="hidden">' +
        '<p class="output-label">// AI FEEDBACK</p>' +
        '<div id="ai-feedback-text" class="ai-feedback-text"></div>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      '<button ' +
        'id="learn-btn" ' +
        'class="learn-btn ' + (learned ? "learned" : "") + '" ' +
        'onclick="toggleLearned(' + p.id + ')" ' +
      '>' +
        (learned ? "✔ CLEAR  ／  クリックで取り消す" : "MARK AS CLEAR") +
      '</button>' +
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
function editorZero()    { setEditorMode('zero');    }  // 完全ゼロから
function editorScratch() { setEditorMode('scratch'); }  // テンプレートから
function editorFill()    { setEditorMode('fill');    }  // 穴埋め

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

// ===== コードを実行する（Wandbox API） =====

async function runCode() {
  const code = aceEditor ? aceEditor.getValue().trim() : '';
  if (!code) { alert("コードを入力してください"); return; }

  const btn = document.querySelector(".run-btn");
  const outputArea = document.getElementById("output-area");
  const outputText = document.getElementById("output-text");
  const stdin = document.getElementById("stdin-input").value;

  btn.textContent = "実行中...";
  btn.disabled = true;
  outputArea.classList.add("hidden");

  try {
    const res = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, compiler: getCompiler(), stdin: stdin })
    });
    const data = await res.json();
    outputArea.classList.remove("hidden");
    if (data.compiler_error) {
      outputText.textContent = "コンパイルエラー:\n" + data.compiler_error;
      outputText.className = "output-error";
    } else {
      outputText.textContent = data.program_output || "(出力なし)";
      outputText.className = "output-success";
    }
  } catch (e) {
    outputArea.classList.remove("hidden");
    outputText.textContent = "エラー: 実行できませんでした。インターネット接続を確認してください。";
    outputText.className = "output-error";
  }

  btn.textContent = "▶ 実行する";
  btn.disabled = false;
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

  getMissions().forEach(function(m) {
    const cleared = isMissionCleared(m.id);
    const card = document.createElement('div');
    card.className = 'mission-card' + (cleared ? ' cleared' : '');

    card.innerHTML =
      '<div class="mission-card-top">' +
        '<span class="mission-number">MISSION ' + String(m.id).padStart(2, '0') + '</span>' +
        '<span class="rank-badge rank-' + m.rank.toLowerCase() + '">' + m.rank + '</span>' +
      '</div>' +
      '<div class="mission-card-title">' + m.title + '</div>' +
      '<div class="mission-card-desc">' + m.description.substring(0, 60) + '...</div>' +
      '<div class="mission-card-bottom">' +
        '<span class="mission-req-count">要件 ' + m.requirements.length + ' 項目</span>' +
        '<span class="mission-badge ' + (cleared ? '' : 'not-cleared') + '">' +
          (cleared ? '✔ CLEARED' : '— PENDING') +
        '</span>' +
      '</div>';

    card.addEventListener('click', function() {
      history.pushState({ page: 'mission-detail', lang: currentLanguage, id: m.id }, '');
      renderMissionDetail(m.id);
      showPage('mission-detail');
    });

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

// ===== 認証モーダル UI =====

function openAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
  setTimeout(function() { document.getElementById('auth-email').focus(); }, 50);
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
  document.getElementById('auth-error').classList.add('hidden');
  document.getElementById('auth-success').classList.add('hidden');
  document.getElementById('auth-email').value = '';
  document.getElementById('auth-password').value = '';
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
    errEl.textContent = result.error.message;
    errEl.classList.remove('hidden');
    return;
  }

  // サインアップ後にメール確認が必要な場合
  if (_currentAuthTab === 'signup' && result.data && result.data.user && !result.data.session) {
    sucEl.textContent = '確認メールを送信しました。受信ボックスをご確認ください。';
    sucEl.classList.remove('hidden');
    return;
  }

  closeAuthModal();
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
    updateAuthUI();
    if (currentLanguage) {
      await syncProgressFromSupabase();
      await syncMissionProgressFromSupabase();
      updateProgressDisplay();
      renderList();
    }
  }
}

// ===== 初期化 =====

document.getElementById("back-btn").addEventListener("click", function() {
  history.back();
});

document.getElementById("mission-back-btn").addEventListener("click", function() {
  history.back();
});

document.getElementById("site-title").addEventListener("click", function() {
  history.pushState({ page: 'lang' }, '');
  currentLanguage = null;
  renderLangSelect();
  showPage("lang");
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

history.replaceState({ page: 'lang' }, '');
renderLangSelect();
showPage("lang");

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
