// ===== 問題データ =====
const problems = [
  {
    id: 1,
    title: "Hello World",
    difficulty: "★☆☆",
    question: "「Hello, World!」と画面に出力するプログラムを書いてください。",
    hint: "cout を使って出力できます。文末に endl をつけると改行されます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    explanation: "cout は標準出力ストリームです。<< 演算子でつないだ内容を画面に表示します。endl は改行を意味します。#include <iostream> は入出力を使うためのおまじないです。"
  },
  {
    id: 2,
    title: "変数と型",
    difficulty: "★☆☆",
    question: "整数 42 と文字列 \"C++\" をそれぞれ変数に代入して、両方を出力してください。",
    hint: "整数は int 型、文字列は string 型を使います。string を使うには #include <string> が必要です。",
    answer:
`#include <iostream>
#include <string>
using namespace std;

int main() {
    int num = 42;
    string lang = "C++";
    cout << num << endl;
    cout << lang << endl;
    return 0;
}`,
    explanation: "int は整数を表す型です。string は文字列を表す型で、ダブルクォートで囲みます。変数に値を入れることを「代入」といいます。"
  },
  {
    id: 3,
    title: "四則演算",
    difficulty: "★☆☆",
    question: "変数 a = 10、b = 3 として、a+b・a-b・a*b・a/b の結果をそれぞれ出力してください。",
    hint: "足し算は +、引き算は -、掛け算は *、割り算は / を使います。int 同士の割り算は小数点以下が切り捨てられます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int a = 10;
    int b = 3;
    cout << a + b << endl;
    cout << a - b << endl;
    cout << a * b << endl;
    cout << a / b << endl;
    return 0;
}`,
    explanation: "int 型同士の割り算は整数除算になります。10 / 3 の結果は 3（小数点以下切り捨て）です。小数が必要なときは double 型を使います。"
  },
  {
    id: 4,
    title: "if 文",
    difficulty: "★☆☆",
    question: "変数 score に 75 を代入し、60 以上なら「合格」、そうでなければ「不合格」と出力してください。",
    hint: "if (条件) { ... } else { ... } の形で書きます。「以上」は >= を使います。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int score = 75;
    if (score >= 60) {
        cout << "合格" << endl;
    } else {
        cout << "不合格" << endl;
    }
    return 0;
}`,
    explanation: "if 文は条件が true のときだけ { } の中を実行します。else は条件が false のときに実行されます。>= は「以上」を意味する比較演算子です。"
  },
  {
    id: 5,
    title: "for 文",
    difficulty: "★★☆",
    question: "for 文を使って 1 から 5 までの数字を1行ずつ出力してください。",
    hint: "for (int i = 1; i <= 5; i++) という形で書きます。i++ は i を1ずつ増やします。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++) {
        cout << i << endl;
    }
    return 0;
}`,
    explanation: "for 文は「初期化; 条件; 更新」の3つの部分で構成されます。条件が true の間、{ } の中を繰り返します。i++ は i = i + 1 の省略形です。"
  },
  {
    id: 6,
    title: "while 文",
    difficulty: "★★☆",
    question: "while 文を使って 10 から 1 までカウントダウンして出力してください。",
    hint: "変数 n を 10 から始めて、n-- で1ずつ減らします。条件は n >= 1 です。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int n = 10;
    while (n >= 1) {
        cout << n << endl;
        n--;
    }
    return 0;
}`,
    explanation: "while 文は条件が true の間、繰り返し処理を行います。n-- は n を1ずつ減らします。条件が false になると while ループを抜けます。"
  },
  {
    id: 7,
    title: "配列",
    difficulty: "★★☆",
    question: "5つの整数 {10, 20, 30, 40, 50} を配列に格納し、for 文で全要素を出力してください。",
    hint: "int arr[5] = {10, 20, 30, 40, 50}; と宣言します。要素へのアクセスは arr[0] から arr[4] です。",
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
    explanation: "配列は同じ型の値をまとめて格納できます。インデックスは 0 から始まります。arr[0] が最初の要素、arr[4] が最後の要素です。"
  },
  {
    id: 8,
    title: "関数",
    difficulty: "★★☆",
    question: "2つの整数を受け取り、その合計を返す関数 add を定義して、add(3, 5) の結果を出力してください。",
    hint: "int add(int a, int b) { return a + b; } という形で関数を定義します。",
    answer:
`#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int main() {
    cout << add(3, 5) << endl;
    return 0;
}`,
    explanation: "関数は処理をまとめて名前をつけたものです。int add(int a, int b) は「整数2つを受け取り整数を返す関数 add」という意味です。return で値を呼び出し元に返します。"
  },
  {
    id: 9,
    title: "文字列操作",
    difficulty: "★★☆",
    question: "string 型の変数に \"Hello, C++!\" を代入し、文字列の長さと先頭の文字を出力してください。",
    hint: ".length() で長さ、[0] で先頭の文字にアクセスできます。",
    answer:
`#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "Hello, C++!";
    cout << s.length() << endl;
    cout << s[0] << endl;
    return 0;
}`,
    explanation: "string 型には便利なメソッドがあります。.length() は文字数を返します。s[0] は配列と同様にインデックスで文字にアクセスできます。"
  },
  {
    id: 10,
    title: "cin で入力",
    difficulty: "★★★",
    question: "ユーザーから整数を1つ受け取り、その数の2倍を出力するプログラムを書いてください。",
    hint: "cin >> 変数名 でキーボードから入力を受け取れます。",
    answer:
`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n * 2 << endl;
    return 0;
}`,
    explanation: "cin は標準入力ストリームです。>> 演算子で変数に値を受け取ります。ユーザーが数字を入力してEnterを押すと、その値が変数 n に代入されます。"
  }
];

// ===== 進捗管理 =====

function loadProgress() {
  const data = localStorage.getItem("cpp_progress");
  return data ? JSON.parse(data) : [];
}

function saveProgress(id) {
  const progress = loadProgress();
  if (!progress.includes(id)) {
    progress.push(id);
    localStorage.setItem("cpp_progress", JSON.stringify(progress));
  }
}

function isLearned(id) {
  return loadProgress().includes(id);
}

// ===== 画面切り替え =====

function showPage(name) {
  document.getElementById("page-list").classList.add("hidden");
  document.getElementById("page-detail").classList.add("hidden");
  document.getElementById("page-" + name).classList.remove("hidden");
}

// ===== 進捗バーの更新 =====

function updateProgressDisplay() {
  const count = loadProgress().length;
  const total = problems.length;
  document.getElementById("progress-text").textContent = count + " / " + total + " 問 クリア";
  document.getElementById("progress-bar").style.width = (count / total * 100) + "%";
}

// ===== 問題一覧の描画 =====

function renderList() {
  const list = document.getElementById("problem-list");
  list.innerHTML = "";

  problems.forEach(function(p) {
    const learned = isLearned(p.id);

    const card = document.createElement("div");
    card.className = "problem-card" + (learned ? " learned" : "");

    card.innerHTML =
      '<div class="card-left">' +
        '<span class="problem-id">#' + p.id + '</span>' +
        '<span class="problem-title">' + p.title + '</span>' +
        '<span class="difficulty">' + p.difficulty + '</span>' +
      '</div>' +
      '<span class="badge ' + (learned ? "" : "not-learned") + '">' +
        (learned ? "✅ 学習済み" : "未学習") +
      '</span>';

    card.addEventListener("click", function() {
      renderDetail(p.id);
      showPage("detail");
    });

    list.appendChild(card);
  });

  updateProgressDisplay();
}

// ===== ヒント・解説の開閉 =====

function toggleSection(sectionId) {
  const el = document.getElementById(sectionId);
  el.classList.toggle("hidden");
}

// ===== 特殊文字のエスケープ（コード表示用） =====

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ===== 問題詳細の描画 =====

function renderDetail(id) {
  const p = problems.find(function(x) { return x.id === id; });
  const learned = isLearned(p.id);

  const detail = document.getElementById("detail-content");
  detail.innerHTML =
    '<h2>' + p.title + '</h2>' +
    '<p class="difficulty" style="margin-bottom:16px;">' + p.difficulty + '</p>' +

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
      '<button class="toggle-btn" onclick="toggleSection(\'answer-' + p.id + '\')">📝 正解例を見る</button>' +
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
      '<h3>コードエディタ</h3>' +
      '<textarea id="code-editor" class="code-editor" placeholder="ここにC++コードを書いてください..."></textarea>' +
      '<div class="editor-options">' +
        '<label class="stdin-label">標準入力（cin用）：</label>' +
        '<input id="stdin-input" class="stdin-input" type="text" placeholder="例: 5（cinを使う問題のとき入力）">' +
      '</div>' +
      '<button class="run-btn" onclick="runCode()">▶ 実行する</button>' +
      '<div id="output-area" class="hidden">' +
        '<p class="output-label">実行結果：</p>' +
        '<pre id="output-text"></pre>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      '<button ' +
        'id="learn-btn" ' +
        'class="learn-btn ' + (learned ? "learned" : "") + '" ' +
        'onclick="markLearned(' + p.id + ')" ' +
        (learned ? 'disabled' : '') +
      '>' +
        (learned ? "✅ 学習済み" : "学習済みにする ✅") +
      '</button>' +
    '</div>';
}

// ===== コードを実行する（Wandbox API） =====

async function runCode() {
  const code = document.getElementById("code-editor").value.trim();
  if (!code) {
    alert("コードを入力してください");
    return;
  }

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
      body: JSON.stringify({ code: code, compiler: "gcc-head", stdin: stdin })
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
    outputText.textContent = "エラー: サーバーに接続できませんでした。インターネット接続を確認してください。";
    outputText.className = "output-error";
  }

  btn.textContent = "▶ 実行する";
  btn.disabled = false;
}

// ===== 学習済みにする =====

function markLearned(id) {
  saveProgress(id);
  renderDetail(id);
  updateProgressDisplay();
}

// ===== 初期化 =====

document.getElementById("back-btn").addEventListener("click", function() {
  renderList();
  showPage("list");
});

document.getElementById("site-title").addEventListener("click", function() {
  renderList();
  showPage("list");
});

renderList();
showPage("list");
