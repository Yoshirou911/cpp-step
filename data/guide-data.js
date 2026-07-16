// ===== 教本データ =====


// ===== 言語別初心者ガイド =====

var langBeginnerData = {
  cpp: {
    name: 'C++', emoji: '⚙️',
    tagline: 'ゲーム・OS・競技プログラミングで使われる高速言語',
    difficulty: 4, usedFor: ['ゲーム開発（Unreal Engine）', 'OS・ドライバ開発', '競技プログラミング', '組み込み・IoT', '高頻度トレーディング'],
    hello: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    keywords: ['#include', 'using namespace std', 'int main()', 'cout', 'cin', 'endl', 'return', 'int/double/string', 'if/else', 'for/while', 'class', 'vector'],
    mistakes: [
      { bad: 'cout << "Hello"', good: 'cout << "Hello";', note: 'セミコロン ; を忘れずに' },
      { bad: '#include iostream', good: '#include <iostream>', note: '角括弧 < > が必要' },
      { bad: 'Int x = 5;', good: 'int x = 5;', note: '型名は小文字' },
      { bad: 'return;', good: 'return 0;', note: 'main関数は 0 を返す' },
    ],
    tips: ['コンパイルエラーは上から読む', 'まずは cin/cout だけ覚えよう', '型（int/double/string）を意識する', '括弧 {} の対応を必ず確認'],
  },
  python: {
    name: 'Python', emoji: '🐍',
    tagline: 'AI・データ分析・Web開発で最も人気の言語',
    difficulty: 2, usedFor: ['AI・機械学習', 'データ分析', 'Web開発（Django/Flask）', '自動化・スクリプト', '科学技術計算'],
    hello: 'print("Hello, World!")',
    keywords: ['print()', 'input()', 'def', 'return', 'if/elif/else', 'for/while', 'in', 'import', 'list/dict/tuple', 'class', 'lambda'],
    mistakes: [
      { bad: 'print "Hello"', good: 'print("Hello")', note: 'Python3では括弧が必須' },
      { bad: 'if x > 0 {', good: 'if x > 0:', note: 'コロン : を忘れずに、{ } は不要' },
      { bad: 'def foo() {', good: 'def foo():', note: 'コロン : とインデントで構造を表す' },
      { bad: 'x = "5" + 3', good: 'x = int("5") + 3', note: '文字列と数値は型変換が必要' },
    ],
    tips: ['インデント（字下げ）が文法の一部', '# でコメント', 'f-string（f"Hello {name}"）は便利', 'pip でライブラリを追加できる'],
  },
  javascript: {
    name: 'JavaScript', emoji: '🟨',
    tagline: 'ブラウザで動く唯一の言語・Webの必須スキル',
    difficulty: 2, usedFor: ['Webフロントエンド', 'Web アニメーション', 'Node.js（サーバー）', 'React/Vue アプリ', 'ブラウザ拡張機能'],
    hello: 'console.log("Hello, World!");',
    keywords: ['console.log()', 'let/const/var', 'function', 'return', 'if/else', 'for/while', 'document', 'addEventListener', 'async/await', 'fetch', 'JSON'],
    mistakes: [
      { bad: 'var x = 5\nconsole.log(x)', good: 'let x = 5;\nconsole.log(x);', note: 'let/constを使い、セミコロンを付ける習慣を' },
      { bad: 'if (x = 5)', good: 'if (x === 5)', note: '= は代入、=== は比較' },
      { bad: 'console.log("値：" + x)', good: 'console.log(`値：${x}`)', note: 'テンプレートリテラルが読みやすい' },
    ],
    tips: ['ブラウザの開発者ツール（F12）で動作確認', '=== で厳密比較', 'const を優先して使う', '非同期処理はasync/await'],
  },
  typescript: {
    name: 'TypeScript', emoji: '🔷',
    tagline: 'JavaScriptに型安全を追加した大規模開発向け言語',
    difficulty: 3, usedFor: ['大規模Webアプリ', 'Reactアプリ', 'Next.js', '企業・チーム開発', 'API設計'],
    hello: 'const greeting: string = "Hello, World!";\nconsole.log(greeting);',
    keywords: ['const/let', 'string/number/boolean', 'interface', 'type', 'generic<T>', 'async/await', 'readonly', 'optional?', 'union |', 'enum'],
    mistakes: [
      { bad: 'let x = "hello"\nx = 5', good: 'let x: string = "hello"', note: '型を宣言すると間違いをコンパイル時に発見できる' },
      { bad: 'function greet(name) {}', good: 'function greet(name: string): void {}', note: '引数と戻り値の型を必ず書く' },
    ],
    tips: ['JavaScriptの知識がそのまま活かせる', 'any型の使いすぎに注意', 'interfaceで型を定義する', 'tsconfig.json の strict: true が推奨'],
  },
  java: {
    name: 'Java', emoji: '☕',
    tagline: '企業システム・Androidアプリ開発の定番言語',
    difficulty: 3, usedFor: ['企業・業務システム', 'Androidアプリ', 'Webバックエンド（Spring）', '大規模開発', 'クラウドサービス'],
    hello: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    keywords: ['public class', 'public static void main', 'System.out.println', 'String', 'int/double/boolean', 'if/else', 'for/while', 'ArrayList', 'import', 'new'],
    mistakes: [
      { bad: 'System.out.println("Hello")', good: 'System.out.println("Hello");', note: 'セミコロン必須' },
      { bad: 'class main {}', good: 'class Main {}', note: 'クラス名は大文字始まり（PascalCase）' },
      { bad: 'String[] args', good: '（これは正しい）', note: 'mainメソッドの引数は String[] args が必須' },
    ],
    tips: ['クラス名とファイル名は一致させる', 'IDE（IntelliJ）が便利', 'null 参照に注意', 'Javaは「書いたら動く」型の安定感がある'],
  },
  ruby: {
    name: 'Ruby', emoji: '💎',
    tagline: 'シンプルな文法・Web開発（Rails）で人気',
    difficulty: 2, usedFor: ['Webアプリ（Ruby on Rails）', 'スクリプト自動化', 'プロトタイプ開発', 'EC サイト'],
    hello: 'puts "Hello, World!"',
    keywords: ['puts/print', 'def...end', 'if...end', 'do...end', 'each', 'map', 'nil', 'true/false', 'require', 'class...end', 'attr_accessor'],
    mistakes: [
      { bad: 'puts("Hello")', good: 'puts "Hello"', note: 'Rubyでは () なしが慣習（動くが）' },
      { bad: 'def foo\n  ...\n{', good: 'def foo\n  ...\nend', note: 'ブロックは { } でなく end で閉じる' },
    ],
    tips: ['日本人が作った言語（まつもとゆきひろ氏）', 'すべてがオブジェクト', 'Railsを覚えるとWebアプリが速く作れる', 'irb でインタラクティブに試せる'],
  },
  kotlin: {
    name: 'Kotlin', emoji: '🟣',
    tagline: 'Androidの公式言語・Javaより簡潔に書ける',
    difficulty: 3, usedFor: ['Androidアプリ開発', 'Webバックエンド（Ktor）', 'マルチプラットフォーム開発'],
    hello: 'fun main() {\n    println("Hello, World!")\n}',
    keywords: ['fun', 'val/var', 'println()', 'String/Int/Boolean', 'if/else', 'when', 'for/while', 'null?', 'data class', 'lambda'],
    mistakes: [
      { bad: 'var x: Int = "5"', good: 'var x: Int = 5', note: '型と値が一致しないとコンパイルエラー' },
      { bad: 'x!!.method()', good: 'x?.method()', note: '!! はnull安全チェックを無視するので危険' },
    ],
    tips: ['val は変更不可（= const）、var は変更可能', 'null安全が言語レベルで組み込まれている', 'Javaとの相互運用が可能', 'Android Studioで開発できる'],
  },
  swift: {
    name: 'Swift', emoji: '🍎',
    tagline: 'iOSアプリ開発の公式言語・AppleのOSSプロジェクト',
    difficulty: 3, usedFor: ['iOSアプリ開発', 'macOSアプリ', 'watchOSアプリ', 'Appleエコシステム全般'],
    hello: 'print("Hello, World!")',
    keywords: ['let/var', 'print()', 'String/Int/Double/Bool', 'if/else', 'for...in', 'func', 'return', 'Optional?', 'class/struct', 'guard'],
    mistakes: [
      { bad: 'var x = nil', good: 'var x: String? = nil', note: 'nilを使うにはOptional型（?）が必要' },
      { bad: 'if let x = x { }', good: '// guard letも検討', note: 'Optional bindingのパターンをしっかり覚える' },
    ],
    tips: ['Xcodeがないと開発できない（Macが必要）', 'Optional型（?）はSwiftの核心', 'SwiftUIで宣言的UIが書ける', 'Playgroundで手軽に試せる'],
  },
  csharp: {
    name: 'C#', emoji: '🔵',
    tagline: 'Unityゲーム開発・Windows アプリ開発の標準',
    difficulty: 3, usedFor: ['Unityゲーム開発', 'Windowsアプリ', 'Webバックエンド（ASP.NET）', '企業システム'],
    hello: 'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    keywords: ['using', 'class', 'static void Main', 'Console.WriteLine', 'string/int/bool', 'if/else', 'for/while', 'List<>', 'var', 'async/await'],
    mistakes: [
      { bad: 'Console.writeline("Hi")', good: 'Console.WriteLine("Hi");', note: 'Lが大文字（メソッド名はPascalCase）' },
      { bad: 'string s = null\ns.Length', good: 's?.Length', note: 'null参照には ?. を使う' },
    ],
    tips: ['Unityを使うならC#は必須', 'Visual StudioがIDEとして最強', 'Javaに似た構文なので学習しやすい', 'NuGetでパッケージ管理'],
  },
  go: {
    name: 'Go', emoji: '🐹',
    tagline: 'Googleが作ったシンプル・高速なサーバー開発言語',
    difficulty: 2, usedFor: ['クラウド・マイクロサービス', 'CLI ツール', 'Webサーバー', 'Docker/Kubernetesなどのインフラ'],
    hello: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    keywords: ['package main', 'import', 'fmt.Println', 'func', 'var', ':=', 'if/else', 'for', 'goroutine', 'channel', 'error'],
    mistakes: [
      { bad: 'import "fmt"\nimport "os"', good: 'import (\n    "fmt"\n    "os"\n)', note: '複数importはグループにまとめる' },
      { bad: 'x := 5\n// xを使わない', good: 'xを必ず使う', note: 'Goでは未使用変数はコンパイルエラー' },
    ],
    tips: ['宣言した変数は必ず使う', ':= で型推論して宣言', 'gofmt で自動整形', 'error型を戻り値で返すのがGoの流儀'],
  },
  c: {
    name: 'C言語', emoji: '🔧',
    tagline: 'すべてのプログラミング言語の祖先・低レベル制御の王様',
    difficulty: 4, usedFor: ['OS開発（Linux/Windows）', '組み込み・マイコン', 'デバイスドライバ', 'パフォーマンス重視の処理'],
    hello: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    keywords: ['#include', 'printf/scanf', 'int main()', 'return', 'int/char/float/double', 'if/else', 'for/while', 'pointer *', 'struct', 'malloc/free'],
    mistakes: [
      { bad: 'printf("Hello")', good: 'printf("Hello\\n");', note: '改行は \\n、セミコロン必須' },
      { bad: 'int *p;\n*p = 5;', good: 'int x = 5;\nint *p = &x;', note: 'ポインタは初期化してから使う' },
      { bad: 'char s[5];\nscanf("%s", &s)', good: 'scanf("%s", s);', note: '配列名はすでにポインタなので & 不要' },
    ],
    tips: ['C言語を学ぶとメモリの仕組みがわかる', 'ポインタは「アドレスを格納する変数」', 'malloc したら必ず free する', 'C言語ができると他の言語も理解しやすい'],
  },
  rust: {
    name: 'Rust', emoji: '🦀',
    tagline: 'メモリ安全・超高速・次世代システム言語',
    difficulty: 5, usedFor: ['システムプログラミング', 'WebAssembly', 'ゲームエンジン', '高性能サーバー', 'CLIツール'],
    hello: 'fn main() {\n    println!("Hello, World!");\n}',
    keywords: ['fn', 'let/mut', 'println!', 'String/&str', 'if/else', 'loop/while/for', 'ownership', 'borrow &', 'lifetime', 'Result/Option', 'struct/enum'],
    mistakes: [
      { bad: 'let x = 5;\nx = 6;', good: 'let mut x = 5;\nx = 6;', note: 'デフォルトは不変。変更するには mut が必要' },
      { bad: 'let s = String::from("hi");\nlet s2 = s;\nprintln!("{}", s);', good: 'let s2 = s.clone();', note: '所有権の移動（move）に注意' },
    ],
    tips: ['所有権（ownership）がRustの核心', 'コンパイルエラーは親切なので読もう', 'Rustを覚えるとメモリ管理の本質が理解できる', 'cargo がパッケージ管理ツール'],
  },
  html: {
    name: 'HTML', emoji: '🌐',
    tagline: 'Webページの骨格を作るマークアップ言語',
    difficulty: 1, usedFor: ['Webページ作成', 'ランディングページ', 'メールテンプレート', 'Web学習の入口'],
    hello: '<!DOCTYPE html>\n<html>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
    keywords: ['<!DOCTYPE html>', '<html>', '<head>', '<body>', '<h1>～<h6>', '<p>', '<a href>', '<img src>', '<div>', '<span>', '<class>', '<id>'],
    mistakes: [
      { bad: '<p>テキスト', good: '<p>テキスト</p>', note: '閉じタグを忘れずに（<br>など例外あり）' },
      { bad: '<img src=photo.jpg>', good: '<img src="photo.jpg">', note: '属性値は " " で囲む' },
      { bad: '<a href=https://...>', good: '<a href="https://...">', note: 'URLも " " で囲む' },
    ],
    tips: ['HTMLはプログラムではなくマークアップ言語', 'CSSで見た目、JSで動きをつける', 'ブラウザの「検証」でHTMLを確認できる', 'W3C バリデーターで文法チェック'],
  },
  sql: {
    name: 'SQL', emoji: '🗃️',
    tagline: 'データベースを操作する標準的なクエリ言語',
    difficulty: 2, usedFor: ['データベース操作', 'データ分析・集計', 'Webアプリのデータ管理', 'BI・レポート作成'],
    hello: 'SELECT "Hello, World!" AS message;',
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT INTO', 'UPDATE', 'DELETE', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'CREATE TABLE', 'INDEX'],
    mistakes: [
      { bad: 'SELECT name FROM users WHERE id = 1', good: 'SELECT name FROM users WHERE id = 1;', note: 'セミコロンで文を終える' },
      { bad: "SELECT * FROM users WHERE name = 'Tanaka' AND", good: '末尾のANDを削除', note: '条件の最後にAND/ORを残さない' },
      { bad: 'DELETE FROM users', good: 'DELETE FROM users WHERE id = 1', note: 'WHEREなしは全件削除！必ず条件を付ける' },
    ],
    tips: ['SELECTだけ覚えれば多くのことができる', 'WHERE句で絞り込み、ORDER BYで並び替え', 'JOINでテーブルを結合できる', 'DELETE/UPDATEはWHEREを必ず確認してから'],
  },
  bash: {
    name: 'Bash', emoji: '🐚',
    tagline: 'Linux/Macのターミナル操作・自動化スクリプト',
    difficulty: 3, usedFor: ['Linux/Mac自動化', 'CI/CDパイプライン', 'サーバー管理', 'ファイル操作スクリプト', 'DevOps'],
    hello: '#!/bin/bash\necho "Hello, World!"',
    keywords: ['echo', 'cd/ls/mkdir', 'if/fi', 'for/do/done', '$変数', '$1/$2', '|（パイプ）', '>', '>>', 'chmod', 'cron', 'grep/sed/awk'],
    mistakes: [
      { bad: 'if [ $x = 5 ]', good: 'if [ "$x" = "5" ]', note: '変数は " " で囲む（スペースがある場合の保護）' },
      { bad: 'x=5\necho $x + 1', good: 'x=5\necho $((x + 1))', note: '算術演算は $(( )) の中で' },
    ],
    tips: ['#!/bin/bash を1行目に書く（シバン）', 'chmod +x script.sh で実行権限を付ける', '変数に $ を付けてアクセス', 'man コマンドでマニュアルを読める'],
  },
  regex: {
    name: '正規表現', emoji: '🔍',
    tagline: '文字列の検索・置換・バリデーションのパターン言語',
    difficulty: 4, usedFor: ['ログ解析', '入力バリデーション', '文字列置換', 'スクレイピング', 'コード検索'],
    hello: '// メールアドレスを検索するパターン\n/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/',
    keywords: ['.（任意1文字）', '*（0回以上）', '+（1回以上）', '?（0か1回）', '[abc]（文字クラス）', '^（行頭）', '$（行末）', '\\d', '\\w', '\\s', '()', '|'],
    mistakes: [
      { bad: '/hello.world/', good: '/hello\\.world/', note: '. は任意の文字にマッチする。文字の . にするには \\. と書く' },
      { bad: '/\\d+/', good: '/^\\d+$/', note: '全体にマッチさせるには ^ と $ で囲む' },
    ],
    tips: ['regex101.com でリアルタイム確認できる', '最初は \\d（数字）と \\w（英数字）だけ覚えれば十分', '欲張りマッチ（greedy）に注意', 'キャプチャグループ（）は便利'],
  },
  php: {
    name: 'PHP', emoji: '🐘',
    tagline: 'Webサーバーサイドの王道・WordPressの開発言語',
    difficulty: 2, usedFor: ['WordPress開発', 'Webバックエンド（Laravel）', 'ECサイト', 'CMSシステム', 'API開発'],
    hello: '<?php\necho "Hello, World!";\n?>',
    keywords: ['<?php', 'echo', '$変数', 'if/else', 'for/while', 'function', 'array()', '=>', 'include/require', 'class', 'mysql/PDO'],
    mistakes: [
      { bad: 'echo "Hello"', good: 'echo "Hello";', note: 'セミコロン必須' },
      { bad: 'x = 5;', good: '$x = 5;', note: 'PHPの変数名は $ で始まる' },
      { bad: '<?php\n$x = 1\n?>', good: '<?php\n$x = 1;\n?>', note: '各文にセミコロンを付ける' },
    ],
    tips: ['変数は必ず $ で始まる', 'WordPressの世界シェアは約40%', 'Laravelで本格的なWebアプリ開発', 'XSSやSQLインジェクション対策を必ず学ぶ'],
  },
};

function _renderLangBeginnerGuide(langId) {
  var d = langBeginnerData[langId];
  if (!d) return '<p style="padding:20px;color:#94a3b8;">このガイドはまだ準備中です。</p>';

  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<span style="color:' + (i <= d.difficulty ? '#f59e0b' : '#334155') + '">★</span>';
  }
  var diffLabel = ['', '超かんたん', 'かんたん', '普通', 'むずかしい', '上級者向け'][d.difficulty] || '';
  var usedForColor = ['', '#22c55e', '#22c55e', '#f59e0b', '#f97316', '#ef4444'][d.difficulty] || '#64748b';

  var h = '';

  // ヘッダー
  h += '<div class="bgl-header">';
  h += '<span class="bgl-emoji">' + d.emoji + '</span>';
  h += '<div class="bgl-header-text">';
  h += '<h2 class="bgl-lang-name">' + d.name + '</h2>';
  h += '<p class="bgl-tagline">' + d.tagline + '</p>';
  h += '</div>';
  h += '</div>';

  // 難易度・用途
  h += '<div class="bgl-info-row">';
  h += '<div class="bgl-info-card">';
  h += '<div class="bgl-info-label">難易度</div>';
  h += '<div class="bgl-stars">' + stars + '</div>';
  h += '<div class="bgl-diff-label" style="color:' + usedForColor + '">' + diffLabel + '</div>';
  h += '</div>';
  h += '<div class="bgl-info-card bgl-usefor-card">';
  h += '<div class="bgl-info-label">活用シーン</div>';
  h += '<ul class="bgl-usefor-list">';
  d.usedFor.forEach(function(u) { h += '<li>' + u + '</li>'; });
  h += '</ul>';
  h += '</div>';
  h += '</div>';

  // Hello World
  h += '<div class="bgl-section">';
  h += '<div class="bgl-section-title">👋 Hello World</div>';
  h += '<pre class="bgl-code"><code>' + escapeHtml(d.hello) + '</code></pre>';
  h += '</div>';

  // キーワード
  h += '<div class="bgl-section">';
  h += '<div class="bgl-section-title">🔑 覚えておきたいキーワード</div>';
  h += '<div class="bgl-keywords">';
  d.keywords.forEach(function(kw) { h += '<span class="bgl-kw">' + escapeHtml(kw) + '</span>'; });
  h += '</div>';
  h += '</div>';

  // よくあるミス
  h += '<div class="bgl-section">';
  h += '<div class="bgl-section-title">⚠️ よくあるミス</div>';
  h += '<div class="bgl-mistakes">';
  d.mistakes.forEach(function(m) {
    h += '<div class="bgl-mistake-item">';
    h += '<div class="bgl-mistake-bad"><span class="bgl-badge-bad">✗ NG</span><code>' + escapeHtml(m.bad) + '</code></div>';
    h += '<div class="bgl-mistake-note">→ ' + m.note + '</div>';
    if (m.good && m.good !== m.bad) {
      h += '<div class="bgl-mistake-good"><span class="bgl-badge-good">✓ OK</span><code>' + escapeHtml(m.good) + '</code></div>';
    }
    h += '</div>';
  });
  h += '</div>';
  h += '</div>';

  // Tips
  h += '<div class="bgl-section">';
  h += '<div class="bgl-section-title">💡 Tips</div>';
  h += '<ul class="bgl-tips">';
  d.tips.forEach(function(t) { h += '<li>' + escapeHtml(t) + '</li>'; });
  h += '</ul>';
  h += '</div>';

  // CTA
  h += '<div class="bgl-cta">';
  h += '<button class="bgl-cta-btn" onclick="switchTab(\'problems\')">◆ 問題を解いてみよう</button>';
  h += '<button class="bgl-cta-btn bgl-cta-secondary" onclick="switchTab(\'textbook\')">📖 文法リファレンス</button>';
  h += '</div>';

  return h;
}

function renderIntro() {
  var c = document.getElementById('intro-content');
  if (!c) return;

  var currentLangId = currentLanguage; // null のまま — 強制デフォルトなし
  var langs = Object.keys(langBeginnerData);
  var h = '';

  h += '<div class="intro-page-header">';
  h += '<span class="intro-page-badge">🌱 INTRO</span>';
  h += '<h1 class="intro-page-title">入門ガイド</h1>';
  h += '<p class="intro-page-sub">言語を選んで、その言語のイントロを読もう。</p>';
  h += '</div>';

  h += '<div class="beginner-lang-grid">';
  langs.forEach(function(lid) {
    var d = langBeginnerData[lid];
    var isCurrent = lid === currentLangId;
    var stars = '';
    for (var i = 1; i <= 5; i++) stars += (i <= d.difficulty ? '★' : '☆');
    var diffColor = ['', '#22c55e', '#22c55e', '#f59e0b', '#f97316', '#ef4444'][d.difficulty] || '#64748b';
    h += '<div class="beginner-lang-card' + (isCurrent ? ' blc-current' : '') + '" onclick="openBeginnerLang(\'' + lid + '\')">';
    h += '<div class="blc-emoji">' + d.emoji + '</div>';
    h += '<div class="blc-name">' + d.name + (isCurrent ? ' <span class="blc-now">NOW</span>' : '') + '</div>';
    h += '<div class="blc-tagline">' + d.tagline + '</div>';
    h += '<div class="blc-diff" style="color:' + diffColor + '">' + stars + '</div>';
    h += '<div class="blc-arrow">→ イントロを見る</div>';
    h += '</div>';
  });
  h += '</div>';

  c.innerHTML = h;
}

function goToIntroDirect() {
  showNavAndProgress();
  setActiveTab('intro');
  history.pushState({ page: 'intro', lang: currentLanguage, tab: 'intro' }, '');
  renderIntro();
  showPage('intro');
}

function goToCareerDirect() {
  showNavAndProgress();
  setActiveTab('career');
  history.pushState({ page: 'career', lang: currentLanguage, tab: 'career' }, '');
  renderCareer();
  showPage('career');
}

function openBeginnerLang(langId) {
  var c = document.getElementById('beginner-lang-content');
  if (!c) return;
  var d = langBeginnerData[langId];
  var h = '';
  h += '<div class="bgl-lang-header-wrap">';
  h += '<span class="bgl-page-badge">🌱 INTRO</span>';
  h += '</div>';
  h += _renderLangBeginnerGuide(langId);
  c.innerHTML = h;
  history.pushState({ page: 'beginner-lang', lang: currentLanguage, tab: 'intro', langId: langId }, '');
  showPage('beginner-lang');
}

var langTextbooks = {
  cpp: {
    name: 'C++', emoji: '⚙️',
    intro: 'C++はシステムプログラミングからゲーム開発まで幅広く使われる高性能言語です。C言語を拡張し、オブジェクト指向・テンプレート・標準ライブラリ（STL）を加えた多機能な言語です。',
    features: ['高速実行（ゼロコスト抽象化）', 'メモリを直接操作できるポインタ', 'クラス・継承・多態性によるOOP', 'テンプレートによるジェネリックプログラミング', 'STL（vector, map, set など豊富なコンテナ）'],
    sections: [
      { title: '基本的な構造', code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}` },
      { title: '変数と型', code: `int age = 20;
double pi = 3.14;
bool flag = true;
string name = "Taro";
char grade = 'A';` },
      { title: '制御構文', code: `// if文
if (x > 0) { cout << "正" << endl; }
else if (x < 0) { cout << "負" << endl; }
else { cout << "ゼロ" << endl; }

// forループ
for (int i = 0; i < 5; i++) {
    cout << i << endl;
}

// while
int n = 0;
while (n < 3) { cout << n++; }` },
      { title: '関数', code: `int add(int a, int b) {
    return a + b;
}

// 参照渡し（元の変数を変更できる）
void doubleVal(int& x) { x *= 2; }

int main() {
    int v = 5;
    doubleVal(v);
    cout << v; // 10
}` },
      { title: 'vectorと配列', code: `#include <vector>
vector<int> v = {1, 2, 3, 4, 5};
v.push_back(6);
v.pop_back();

for (int x : v) { // 範囲for
    cout << x << " ";
}
cout << v.size(); // 要素数` },
      { title: 'クラス', code: `class Dog {
public:
    string name;
    Dog(string n) : name(n) {}
    void bark() { cout << name << ": Woof!" << endl; }
};

Dog d("Pochi");
d.bark();` },
      { title: 'よくあるエラーと対策', code: `// 配列の範囲外アクセス → vectorのat()で安全に
vector<int> v = {1,2,3};
cout << v.at(10); // 例外が発生して安全に停止

// ポインタのnullチェック
int* p = nullptr;
if (p != nullptr) { *p = 5; } // 安全

// new → delete でメモリリーク防止
int* arr = new int[10];
delete[] arr;` }
    ],
    tips: ['#include <bits/stdc++.h> で競技プログラミングでは全ヘッダを一括インクルード', 'cout << endl; より cout << "\\n"; の方が高速', 'auto キーワードで型推論が使える（C++11以降）', 'const をつけると変更できない変数になる']
  },
  python: {
    name: 'Python', emoji: '🐍',
    intro: 'Pythonはシンプルな文法で初心者にも学びやすく、データサイエンス・AI・Web開発・自動化など幅広い分野で使われる人気言語です。インタープリタ型で実行しながら学べます。',
    features: ['インデントでブロックを表現（波括弧なし）', '型宣言不要（動的型付け）', 'リスト・辞書・タプル・セットなど豊富なデータ型', 'NumPy・Pandas・TensorFlow など強力なライブラリ', 'ワンライナーで複雑な処理を書ける']
    , sections: [
      { title: '基本構造', code: `# コメントは#で書く
print("Hello, World!")

# 複数行コメント
"""
これは
複数行コメント
"""` },
      { title: '変数と型', code: `age = 20           # int
height = 172.5     # float
name = "Taro"      # str
is_student = True  # bool
data = None        # None

print(type(age))   # <class 'int'>` },
      { title: '制御構文', code: `# if文
x = 10
if x > 0:
    print("正")
elif x < 0:
    print("負")
else:
    print("ゼロ")

# forループ
for i in range(5):
    print(i)

# while
n = 0
while n < 3:
    print(n)
    n += 1` },
      { title: '関数', code: `def greet(name, greeting="こんにちは"):
    return f"{greeting}、{name}さん！"

print(greet("Alice"))
print(greet("Bob", "おはよう"))

# ラムダ（無名関数）
square = lambda x: x ** 2
print(square(5))  # 25` },
      { title: 'リストと辞書', code: `# リスト
nums = [1, 2, 3, 4, 5]
nums.append(6)
nums.pop()
print(nums[0], nums[-1])  # 先頭・末尾

# 内包表記
squares = [x**2 for x in range(5)]

# 辞書
person = {"name": "Alice", "age": 25}
person["city"] = "Tokyo"
for k, v in person.items():
    print(f"{k}: {v}")` },
      { title: 'クラス', code: `class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        print(f"{self.name}: ワン！")

d = Dog("ポチ")
d.bark()` },
      { title: '例外処理', code: `try:
    x = int(input("数字を入力: "))
    print(10 / x)
except ValueError:
    print("数字ではありません")
except ZeroDivisionError:
    print("0で割れません")
finally:
    print("終了")` }
    ],
    tips: ['f文字列（f"{変数}"）を使うと文字列の中に変数を埋め込める', 'list(range(10)) で0〜9のリストを作れる', 'enumerate() でインデックスと値を同時に取得できる', 'zip() で2つのリストを同時にループできる']
  },
  javascript: {
    name: 'JavaScript', emoji: '🌐',
    intro: 'JavaScriptはWebブラウザで動く唯一の言語で、フロントエンド開発の基礎です。Node.jsを使えばサーバーサイドでも動きます。現代のWeb開発には欠かせない言語です。',
    features: ['ブラウザで直接実行できる', '非同期処理（Promise / async-await）が得意', 'DOM操作でWebページを動的に変更できる', 'オブジェクト指向＋関数型の両方が使える', 'Node.jsでサーバーサイドも書ける'],
    sections: [
      { title: '変数と型', code: `const name = "Alice";    // 変更不可
let count = 0;           // 変更可
var old = "古い書き方";  // 非推奨

// 型は動的
let x = 42;
x = "文字列";  // OK

console.log(typeof x);  // "string"` },
      { title: '制御構文', code: `// if文
if (score >= 90) {
  console.log("A");
} else if (score >= 70) {
  console.log("B");
} else {
  console.log("C");
}

// for...of（配列ループ）
const arr = [1, 2, 3];
for (const item of arr) {
  console.log(item);
}

// 三項演算子
const label = x > 0 ? "正" : "非正";` },
      { title: '関数', code: `// 通常の関数
function add(a, b) { return a + b; }

// アロー関数
const mul = (a, b) => a * b;

// デフォルト引数
const greet = (name = "World") => \`Hello, \${name}!\`;

console.log(greet());       // Hello, World!
console.log(greet("Alice")); // Hello, Alice!` },
      { title: '配列とオブジェクト', code: `const arr = [1, 2, 3, 4, 5];
arr.push(6);
arr.pop();

// 高階関数
const doubled = arr.map(x => x * 2);
const evens   = arr.filter(x => x % 2 === 0);
const sum      = arr.reduce((acc, x) => acc + x, 0);

// オブジェクト
const person = { name: "Bob", age: 30 };
const { name, age } = person;  // 分割代入` },
      { title: '非同期処理', code: `// Promise
fetch("/api/data")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// async/await（推奨）
async function loadData() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}` },
      { title: 'クラス', code: `class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(\`\${this.name} makes a sound.\`); }
}

class Dog extends Animal {
  speak() { console.log(\`\${this.name}: Woof!\`); }
}

const d = new Dog("Rex");
d.speak();` }
    ],
    tips: ['=== を使う（== は型変換あり）', 'console.log() でデバッグ', 'スプレッド演算子 [...arr] で配列をコピー', 'オプショナルチェーン obj?.prop でnullエラーを防げる']
  },
  typescript: {
    name: 'TypeScript', emoji: '🔷',
    intro: 'TypeScriptはJavaScriptに型システムを追加した言語です。コンパイル時にエラーを発見でき、大規模アプリの開発に適しています。最終的にはJavaScriptにコンパイルされます。',
    features: ['静的型付けでコンパイル時にバグを発見', 'インターフェース・ジェネリクスで型安全なコード', 'IDEの補完・リファクタリングサポートが強力', 'JavaScriptとの互換性が高い', 'null安全（strictNullChecks）'],
    sections: [
      { title: '型アノテーション', code: `const name: string = "Alice";
const age: number = 25;
const isStudent: boolean = true;
let data: string | null = null;

function add(a: number, b: number): number {
  return a + b;
}` },
      { title: 'インターフェース', code: `interface User {
  id: number;
  name: string;
  email?: string;  // オプショナル
}

const user: User = { id: 1, name: "Bob" };

function greet(u: User): string {
  return \`Hello, \${u.name}\`;
}` },
      { title: '型エイリアスとユニオン型', code: `type Status = "active" | "inactive" | "pending";
type ID = number | string;

let status: Status = "active";
// status = "deleted"; // エラー！

type Result<T> = { ok: true; data: T } | { ok: false; error: string };` },
      { title: 'ジェネリクス', code: `function identity<T>(arg: T): T {
  return arg;
}

const s = identity<string>("hello");
const n = identity<number>(42);

// ジェネリクスクラス
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}` },
      { title: 'Enum', code: `enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

function move(dir: Direction) {
  console.log(\`Moving \${dir}\`);
}
move(Direction.Up);` }
    ],
    tips: ['any 型は極力避ける（型の恩恵がなくなる）', 'unknown 型は any より安全な代替', 'as const でオブジェクトを読み取り専用にできる', 'Partial<T> / Required<T> など Utility Types が便利']
  },
  java: {
    name: 'Java', emoji: '☕',
    intro: 'Javaは「一度書けばどこでも動く」をコンセプトにした言語で、企業のバックエンド開発に広く使われています。強い静的型付けとオブジェクト指向が特徴です。',
    features: ['JVM上で動くため高い移植性', '強い静的型付け', '完全なオブジェクト指向（全てクラス内）', 'ガベージコレクション', 'Spring・Hibernateなど強力なエコシステム'],
    sections: [
      { title: '基本構造', code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}` },
      { title: '変数と型', code: `int age = 20;
double pi = 3.14;
boolean flag = true;
String name = "Taro";
char grade = 'A';

// 型キャスト
int x = (int) 3.7;  // 3` },
      { title: 'クラスとオブジェクト', code: `public class Dog {
    private String name;

    public Dog(String name) {
        this.name = name;
    }

    public void bark() {
        System.out.println(name + ": Woof!");
    }
}

Dog d = new Dog("Rex");
d.bark();` },
      { title: 'コレクション', code: `import java.util.*;

List<Integer> list = new ArrayList<>();
list.add(1); list.add(2); list.add(3);

Map<String, Integer> map = new HashMap<>();
map.put("Alice", 90);
map.put("Bob", 85);

for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + ": " + e.getValue());
}` },
      { title: 'ラムダとStream', code: `import java.util.*;
import java.util.stream.*;

List<Integer> nums = Arrays.asList(1,2,3,4,5);

// Stream API
int sum = nums.stream()
    .filter(n -> n % 2 == 0)
    .mapToInt(Integer::intValue)
    .sum();

List<String> names = Arrays.asList("Bob","Alice","Carol");
names.stream().sorted().forEach(System.out::println);` }
    ],
    tips: ['String の比較は == ではなく .equals() を使う', 'NullPointerException に注意（Optional を活用）', 'インターフェースを積極的に使う（疎結合）', 'final をつけると変更不可な変数になる']
  },
  ruby: {
    name: 'Ruby', emoji: '💎',
    intro: 'Rubyは「プログラマの幸福」を重視した言語で、読みやすく書きやすい文法が特徴です。Webフレームワーク Ruby on Rails で有名です。全てのものがオブジェクトです。',
    features: ['全てがオブジェクト（数字・trueもオブジェクト）', '柔軟な文法（多様な書き方が可能）', 'ブロック・proc・lambdaによる関数型プログラミング', 'メタプログラミングが強力', 'Ruby on Rails での Web 開発'],
    sections: [
      { title: '基本構造', code: `# コメントは#
puts "Hello, World!"

# 複数行出力
print "Hello "
puts "Ruby"` },
      { title: '変数と型', code: `age = 25            # 整数
pi = 3.14           # 浮動小数
name = "Alice"      # 文字列
flag = true         # 真偽値

# 文字列展開
puts "#{name}は#{age}歳です"

# シンボル（軽量な識別子）
status = :active` },
      { title: 'コレクション', code: `# 配列
arr = [1, 2, 3, 4, 5]
arr << 6            # 末尾に追加
arr.push(7)
arr.pop             # 末尾を削除

# ハッシュ（Rubyの辞書）
person = { name: "Bob", age: 30 }
person[:city] = "Tokyo"

# 便利なメソッド
arr.map { |x| x * 2 }
arr.select { |x| x.even? }
arr.reduce(0) { |sum, x| sum + x }` },
      { title: '制御構文', code: `# if/unless
if x > 0
  puts "正"
elsif x < 0
  puts "負"
else
  puts "ゼロ"
end

unless x == 0
  puts "非ゼロ"
end

# ループ
5.times { |i| puts i }
(1..5).each { |i| puts i }` },
      { title: 'メソッドとブロック', code: `def greet(name, greeting: "こんにちは")
  "#{greeting}、#{name}さん！"
end

puts greet("Alice")
puts greet("Bob", greeting: "おはよう")

# ブロック
[1,2,3].each do |n|
  puts n * 2
end` }
    ],
    tips: ['? で終わるメソッドは真偽値を返す慣習（empty?, include?）', '! で終わるメソッドはオブジェクト自身を変更する慣習（sort!）', 'puts は末尾に改行あり、print は改行なし', 'nil は「何もない」を表すオブジェクト']
  },
  kotlin: {
    name: 'Kotlin', emoji: '🎯',
    intro: 'KotlinはJetBrainsが開発したJVM言語で、Androidアプリ開発の公式言語です。Javaより簡潔に書け、null安全・コルーチンなどモダンな機能を持ちます。',
    features: ['null安全（Null Pointer Exception を防ぐ）', 'データクラスで定型コードを削減', 'コルーチンで非同期処理を簡潔に書ける', 'Javaとの完全な相互運用性', 'Android開発の公式言語'],
    sections: [
      { title: '変数', code: `val name = "Alice"   // 変更不可（推奨）
var count = 0        // 変更可

val pi: Double = 3.14

// null安全
var str: String? = null
println(str?.length) // null → クラッシュしない
println(str ?: "デフォルト") // nullなら代替値` },
      { title: '関数', code: `fun add(a: Int, b: Int): Int = a + b

fun greet(name: String, greeting: String = "Hello"): String {
    return "$greeting, $name!"
}

// ラムダ
val square: (Int) -> Int = { x -> x * x }

// 拡張関数
fun String.shout() = this.uppercase() + "!"` },
      { title: 'コレクション', code: `val list = listOf(1, 2, 3, 4, 5)  // イミュータブル
val mList = mutableListOf(1, 2, 3)
mList.add(4)

val map = mapOf("a" to 1, "b" to 2)
val mMap = mutableMapOf("x" to 10)

// 高階関数
val doubled = list.map { it * 2 }
val evens   = list.filter { it % 2 == 0 }
val sum      = list.reduce { acc, x -> acc + x }` },
      { title: 'データクラスとシールドクラス', code: `data class User(val id: Int, val name: String)

val u1 = User(1, "Alice")
val u2 = u1.copy(name = "Bob")

// シールドクラス
sealed class Result<out T>
data class Success<T>(val data: T) : Result<T>()
data class Error(val msg: String) : Result<Nothing>()` },
      { title: 'コルーチン', code: `import kotlinx.coroutines.*

suspend fun fetchData(): String {
    delay(1000) // 非同期の遅延
    return "データ取得完了"
}

fun main() = runBlocking {
    val result = async { fetchData() }
    println(result.await())
}` }
    ],
    tips: ['val を優先して val/var を使い分ける', 'when 式は switch の代替（値を返せる）', 'data class で equals/hashCode/toString/copy が自動生成', 'let/run/also/apply などのスコープ関数を活用']
  },
  swift: {
    name: 'Swift', emoji: '🦅',
    intro: 'SwiftはAppleが開発したiOS・macOS・watchOSアプリ開発向けの言語です。安全性を重視した設計で、Obj-Cより簡潔に書けます。パフォーマンスも非常に高いです。',
    features: ['型安全・null安全（Optional型）', 'クロージャによる関数型プログラミング', 'プロトコル指向プログラミング', 'iOSアプリ開発の標準言語', 'SwiftUI による宣言的UIプログラミング'],
    sections: [
      { title: '変数と定数', code: `let name = "Alice"    // 定数（変更不可・推奨）
var count = 0         // 変数（変更可）

// Optional（nilが入る可能性がある型）
var email: String? = nil
email = "alice@example.com"

// アンラップ
if let e = email {
    print("メール: \(e)")
}

// nil合体演算子
let display = email ?? "未設定"` },
      { title: '制御構文', code: `// if
let x = 10
if x > 0 { print("正") } else { print("非正") }

// switch（パターンマッチが強力）
switch x {
case 1...5: print("小")
case 6...10: print("中")
default: print("大")
}

// for-in
for i in 1...5 { print(i) }
for item in ["a","b","c"] { print(item) }` },
      { title: '関数とクロージャ', code: `func greet(name: String, greeting: String = "Hello") -> String {
    return "\(greeting), \(name)!"
}

print(greet(name: "Bob"))
print(greet(name: "Alice", greeting: "Hi"))

// クロージャ
let square: (Int) -> Int = { $0 * $0 }

let nums = [1,2,3,4,5]
let doubled = nums.map { $0 * 2 }` },
      { title: '構造体とクラス', code: `struct Point {
    var x: Double
    var y: Double

    func distance(to other: Point) -> Double {
        let dx = x - other.x, dy = y - other.y
        return (dx*dx + dy*dy).squareRoot()
    }
}

class Animal {
    var name: String
    init(name: String) { self.name = name }
    func speak() { print("\(name) makes a sound") }
}` }
    ],
    tips: ['guard let で早期リターンパターンを使う', '構造体（struct）はコピー、クラスは参照', 'enum に associated value で豊富なデータを持てる', 'Codable で JSON の encode/decode が簡単']
  },
  csharp: {
    name: 'C#', emoji: '🔵',
    intro: 'C#はMicrosoftが開発した言語で、.NETエコシステムで動きます。UnityでのゲームB発や、Windowsアプリ・Web API（ASP.NET）開発に広く使われます。',
    features: ['強い静的型付け', 'LINQ でコレクション操作を簡潔に', 'async/await で非同期処理を書きやすい', 'Unityゲーム開発の標準言語', 'プロパティ・イベントなど洗練されたOOP機能'],
    sections: [
      { title: '基本構造', code: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}` },
      { title: '変数と型', code: `int age = 25;
double pi = 3.14;
bool flag = true;
string name = "Alice";

// var で型推論
var count = 0;
var greeting = "Hello";

// null許容型
string? nullable = null;
int? num = null;` },
      { title: 'クラスとプロパティ', code: `class Person {
    public string Name { get; set; }
    public int Age { get; init; }  // C# 9: 初期化専用

    public Person(string name, int age) {
        Name = name; Age = age;
    }

    public override string ToString() => $"{Name} ({Age})";
}

var p = new Person("Alice", 25);
Console.WriteLine(p);` },
      { title: 'LINQ', code: `using System.Linq;
using System.Collections.Generic;

var nums = new List<int> {1,2,3,4,5,6};

var evens = nums.Where(x => x % 2 == 0);
var doubled = nums.Select(x => x * 2);
var sum = nums.Sum();
var max = nums.Max();

// クエリ構文
var query = from n in nums
            where n > 3
            orderby n descending
            select n;` },
      { title: 'async/await', code: `using System.Net.Http;

async Task<string> FetchAsync(string url) {
    using var client = new HttpClient();
    return await client.GetStringAsync(url);
}

// 複数の非同期処理を並列実行
var t1 = FetchAsync("url1");
var t2 = FetchAsync("url2");
await Task.WhenAll(t1, t2);` }
    ],
    tips: ['string 補間: $"{変数}" で文字列に変数を埋め込める', 'using で IDisposable なオブジェクトを自動解放', 'record クラス（C# 9）でイミュータブルなデータ型を簡単に定義', 'パターンマッチング（switch expression）を活用する']
  },
  go: {
    name: 'Go', emoji: '🐹',
    intro: 'Goはシンプルさと高速さを重視したGoogleが開発した言語です。並行処理（goroutine/channel）が組み込みで、クラウドインフラやマイクロサービス開発に人気があります。',
    features: ['シンプルな文法（予約語が少ない）', 'goroutineで軽量な並行処理', 'channelでgoroutine間の通信', '高速コンパイル・実行', 'ガベージコレクション付きだが低レイテンシ'],
    sections: [
      { title: '基本構造', code: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}` },
      { title: '変数', code: `// var宣言
var name string = "Alice"
var age int = 25

// 短縮宣言（:= は関数内のみ）
count := 0
pi := 3.14

// 複数代入
x, y := 1, 2
x, y = y, x  // スワップ` },
      { title: '関数と多値返却', code: `func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 3)
if err != nil {
    fmt.Println("Error:", err)
    return
}
fmt.Printf("%.2f\n", result)` },
      { title: '構造体とメソッド', code: `type Dog struct {
    Name string
    Age  int
}

func (d Dog) Bark() string {
    return d.Name + ": Woof!"
}

func (d *Dog) Birthday() {
    d.Age++  // ポインタレシーバで変更
}

d := Dog{Name: "Rex", Age: 3}
fmt.Println(d.Bark())` },
      { title: 'goroutineとchannel', code: `func worker(id int, ch chan<- string) {
    ch <- fmt.Sprintf("worker %d done", id)
}

func main() {
    ch := make(chan string, 3)
    for i := 1; i <= 3; i++ {
        go worker(i, ch)
    }
    for i := 0; i < 3; i++ {
        fmt.Println(<-ch)
    }
}` }
    ],
    tips: ['エラーは戻り値で返す（例外がない）', ':= は型推論付き短縮宣言（関数内のみ）', 'スライスはGoで最もよく使うデータ構造', 'defer でリソース解放を関数終了時に確実に実行']
  },
  c: {
    name: 'C', emoji: '🔩',
    intro: 'CはUNIX・Linuxカーネル・組み込みシステムなど低レイヤーで使われる最も古い主要言語の一つです。メモリを直接操作でき、OSや言語処理系の実装に使われます。',
    features: ['ハードウェアに近い低レベル制御', 'ポインタによるメモリ直接操作', 'OSやシステムプログラミングの基礎', 'コンパイルして高速実行', '全ての言語の基礎となる概念が学べる'],
    sections: [
      { title: '基本構造', code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}` },
      { title: '変数と型', code: `int age = 20;
float pi = 3.14f;
double precise = 3.14159;
char grade = 'A';
char name[] = "Taro";

// 型確認
printf("%d %f %c %s\\n", age, pi, grade, name);` },
      { title: 'ポインタ', code: `int x = 10;
int *p = &x;   // xのアドレスをpに格納

printf("%d\\n", *p);  // 10（間接参照）
*p = 20;
printf("%d\\n", x);   // 20（xが変わった）

// 動的メモリ確保
int *arr = malloc(5 * sizeof(int));
for (int i = 0; i < 5; i++) arr[i] = i;
free(arr);  // 必ずfreeする` },
      { title: '関数', code: `// プロトタイプ宣言
int add(int a, int b);

int main() {
    printf("%d\\n", add(3, 4));
    return 0;
}

int add(int a, int b) {
    return a + b;
}

// ポインタ渡し（値を変更するには必要）
void swap(int *a, int *b) {
    int tmp = *a; *a = *b; *b = tmp;
}` },
      { title: '構造体', code: `struct Point {
    int x;
    int y;
};

struct Point p = {3, 4};
printf("(%d, %d)\\n", p.x, p.y);

// typedefで型エイリアス
typedef struct {
    char name[50];
    int age;
} Person;

Person alice = {"Alice", 25};` }
    ],
    tips: ['free() は必ず malloc() とペアで使う（メモリリーク防止）', 'scanf では & を忘れないようにする', '文字列は char[] または char* を使う', 'NULL ポインタのデリファレンスはセグフォルトになる']
  },
  rust: {
    name: 'Rust', emoji: '🦀',
    intro: 'RustはMozillaが開発したシステムプログラミング言語です。メモリ安全性をコンパイル時に保証し、GCなしで高速実行できます。Webassembly・ゲームエンジン・OSカーネルにも使われます。',
    features: ['所有権システムでメモリ安全を保証（GCなし）', 'ゼロコスト抽象化', '型システムが非常に強力', 'パターンマッチングが豊富', 'concurrencyが安全（data race コンパイルエラー）'],
    sections: [
      { title: '基本構造', code: `fn main() {
    println!("Hello, World!");
    println!("{} + {} = {}", 3, 4, 3 + 4);
}` },
      { title: '変数と型', code: `let x = 5;         // 不変（デフォルト）
let mut y = 10;    // 可変（mutが必要）
y += 1;

let pi: f64 = 3.14159;
let flag: bool = true;
let s: &str = "hello";
let owned: String = String::from("world");` },
      { title: '所有権と借用', code: `let s1 = String::from("hello");
let s2 = s1;       // s1はmoveされs2が所有者
// println!("{}", s1); // エラー！s1は無効

let s3 = String::from("world");
let s4 = &s3;      // 借用（s3は有効のまま）
println!("{} {}", s3, s4);

// 関数への参照渡し
fn print_str(s: &String) {
    println!("{}", s);
}` },
      { title: 'enum とパターンマッチング', code: `enum Result<T, E> {
    Ok(T),
    Err(E),
}

fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 { Err("division by zero".to_string()) }
    else { Ok(a / b) }
}

match divide(10.0, 3.0) {
    Ok(v)  => println!("{:.2}", v),
    Err(e) => println!("Error: {}", e),
}` },
      { title: '構造体とimpl', code: `struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn new(w: f64, h: f64) -> Self {
        Rectangle { width: w, height: h }
    }
    fn area(&self) -> f64 { self.width * self.height }
}

let r = Rectangle::new(3.0, 4.0);
println!("面積: {}", r.area());` }
    ],
    tips: ['変数はデフォルト不変。変更するには mut が必要', '所有権・借用はコンパイラが守ってくれる', 'unwrap() はパニックになるので本番では避ける', '? 演算子でエラーを伝播させる']
  },
  html: {
    name: 'HTML/CSS', emoji: '🎨',
    intro: 'HTMLはWebページの構造を定義するマークアップ言語で、CSSはそのスタイル（見た目）を定義する言語です。すべてのWebサイトの基礎です。',
    features: ['HTMLで構造・CSSで見た目を分離', 'セマンティックタグで意味のあるマークアップ', 'Flexbox・Grid でレイアウト', 'メディアクエリでレスポンシブデザイン', 'アニメーション・トランジションで動きをつける'],
    sections: [
      { title: 'HTMLの基本構造', code: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <title>ページタイトル</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>見出し</h1>
  <p>段落テキスト</p>
</body>
</html>` },
      { title: 'よく使うHTMLタグ', code: `<!-- 見出し -->
<h1>〜<h6>

<!-- テキスト -->
<p>段落</p>
<strong>太字</strong>  <em>斜体</em>
<a href="URL">リンク</a>

<!-- リスト -->
<ul><li>箇条書き</li></ul>
<ol><li>番号付き</li></ol>

<!-- 画像 -->
<img src="image.png" alt="説明">

<!-- フォーム -->
<input type="text" placeholder="入力">
<button type="submit">送信</button>` },
      { title: 'CSSセレクタと基本スタイル', code: `/* 要素セレクタ */
p { color: red; }

/* クラス */
.highlight { background: yellow; }

/* ID */
#header { font-size: 2rem; }

/* 子孫 */
.nav a { text-decoration: none; }

/* 擬似クラス */
a:hover { color: blue; }
li:first-child { font-weight: bold; }` },
      { title: 'Flexbox', code: `.container {
  display: flex;
  justify-content: center;   /* 横方向 */
  align-items: center;        /* 縦方向 */
  gap: 16px;
  flex-wrap: wrap;
}

.item {
  flex: 1;      /* 均等に広がる */
  min-width: 200px;
}` },
      { title: 'CSS Grid', code: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}

/* レスポンシブ */
@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}` },
      { title: 'アニメーション', code: `/* トランジション */
.btn {
  background: blue;
  transition: background 0.3s ease;
}
.btn:hover { background: darkblue; }

/* @keyframes アニメーション */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeIn 0.4s ease; }` }
    ],
    tips: ['box-sizing: border-box; を全要素に適用するのが現代のベストプラクティス', 'clamp(最小, 推奨, 最大) でレスポンシブなサイズ指定ができる', 'CSS変数（--color: #fff）でテーマ管理', 'Flexbox: 一方向、Grid: 二次元レイアウトと使い分ける']
  },
  sql: {
    name: 'SQL', emoji: '🗄️',
    intro: 'SQLはリレーショナルデータベースを操作する言語です。データの取得・追加・更新・削除ができます。バックエンド開発やデータ分析に不可欠なスキルです。',
    features: ['SELECT/INSERT/UPDATE/DELETE でデータ操作', 'JOIN で複数テーブルを結合', 'GROUP BY + 集計関数で分析', 'ウィンドウ関数で高度な分析', 'CTE でクエリを分割・再利用'],
    sections: [
      { title: 'テーブル作成とデータ操作', code: `-- テーブル作成
CREATE TABLE users (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age  INTEGER
);

-- データ挿入
INSERT INTO users VALUES (1, 'Alice', 25);
INSERT INTO users VALUES (2, 'Bob', 30);

-- 更新・削除
UPDATE users SET age = 26 WHERE name = 'Alice';
DELETE FROM users WHERE id = 2;` },
      { title: 'SELECT とフィルタリング', code: `-- 全件取得
SELECT * FROM users;

-- 条件絞り込み
SELECT name, age FROM users WHERE age >= 25;

-- ソートと件数制限
SELECT * FROM users ORDER BY age DESC LIMIT 3;

-- LIKE でパターンマッチ
SELECT * FROM users WHERE name LIKE 'A%';` },
      { title: '集計関数とGROUP BY', code: `-- 集計
SELECT COUNT(*), AVG(age), MAX(age) FROM users;

-- グループ別集計
SELECT department, COUNT(*), AVG(salary)
FROM employees
GROUP BY department
HAVING AVG(salary) > 50000
ORDER BY AVG(salary) DESC;` },
      { title: 'JOIN（テーブル結合）', code: `-- INNER JOIN（両テーブルに一致）
SELECT users.name, orders.amount
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- LEFT JOIN（左テーブル全行）
SELECT users.name, orders.amount
FROM users
LEFT JOIN orders ON users.id = orders.user_id;

-- サブクエリ
SELECT * FROM users
WHERE age > (SELECT AVG(age) FROM users);` },
      { title: 'ウィンドウ関数', code: `-- ランキング
SELECT name, score,
  RANK() OVER (ORDER BY score DESC) AS rank
FROM scores;

-- 部門別ランキング
SELECT name, dept, salary,
  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank
FROM employees;

-- 前行との差分
SELECT date, sales,
  sales - LAG(sales) OVER (ORDER BY date) AS diff
FROM daily_sales;` }
    ],
    tips: ['WHERE は行の絞り込み、HAVING はGROUP BY後の絞り込み', 'NULL との比較は = ではなく IS NULL / IS NOT NULL を使う', 'インデックスはWHERE・JOIN・ORDER BYの対象列に作成すると高速化', 'EXPLAIN QUERY PLAN でクエリの実行計画を確認できる']
  },
  bash: {
    name: 'Bash', emoji: '🖥️',
    intro: 'BashはLinux/macOSのデフォルトシェルです。コマンドを組み合わせて自動化スクリプトを書けます。ファイル処理・デプロイ・CI/CDなどで活躍します。',
    features: ['コマンドのパイプラインで処理を連鎖', '条件分岐・ループで自動化', 'find/grep/awk/sed でテキスト処理', 'cron で定期実行', 'エラーハンドリングと終了コード'],
    sections: [
      { title: '基本コマンドと変数', code: `#!/bin/bash
# コメント

# 変数（スペースなし）
name="Alice"
age=25
echo "$name は $age 歳です"

# コマンド置換
current_dir=$(pwd)
files=$(ls -l | wc -l)
echo "ファイル数: $files"` },
      { title: '条件分岐', code: `# if文
if [ $age -ge 20 ]; then
  echo "成人"
elif [ $age -ge 13 ]; then
  echo "ティーン"
else
  echo "子ども"
fi

# ファイル存在チェック
if [ -f "/etc/passwd" ]; then
  echo "ファイルあり"
fi

# 文字列比較
if [ "$name" = "Alice" ]; then
  echo "こんにちは Alice"
fi` },
      { title: 'ループ', code: `# forループ
for i in 1 2 3 4 5; do
  echo "数: $i"
done

# 範囲ループ
for i in {1..10}; do
  echo $i
done

# whileループ
count=0
while [ $count -lt 5 ]; do
  echo "count: $count"
  ((count++))
done` },
      { title: '関数', code: `# 関数定義
greet() {
  local name="$1"   # ローカル変数
  echo "こんにちは、$name さん！"
  return 0          # 終了コード
}

greet "Alice"
greet "Bob"

# 関数の戻り値（echoで返す）
add() {
  echo $(($1 + $2))
}
result=$(add 3 4)
echo "3 + 4 = $result"` },
      { title: 'パイプとリダイレクト', code: `# パイプ（|）で出力を次のコマンドへ
cat /etc/passwd | grep "root" | cut -d: -f1

# リダイレクト
echo "Hello" > output.txt      # 上書き
echo "World" >> output.txt     # 追記
cat output.txt 2>/dev/null     # エラーを捨てる

# テキスト処理
grep -i "error" log.txt        # パターン検索
sort file.txt | uniq -c        # ソートして重複カウント
awk '{print $1}' data.csv      # 1列目を取り出す
sed 's/old/new/g' file.txt     # 文字列置換` }
    ],
    tips: ['set -e でスクリプトエラー時に即停止', 'set -u で未定義変数を参照時にエラー', '"$変数" とクォートで空白を含む値を安全に扱う', 'shellcheck コマンドでスクリプトの問題を自動検出']
  },
  regex: {
    name: 'Regex', emoji: '🔍',
    intro: '正規表現（Regex）はテキストのパターンマッチングに使う記法です。メールアドレスのバリデーション・ログ解析・文字列置換など幅広い場面で使われます。',
    features: ['あらゆる言語で使えるパターン記法', '文字列の検索・抽出・置換が一行で書ける', 'フォームバリデーションに必須', 'ログ解析・データクレンジングに活躍', 'キャプチャグループで部分抽出が可能'],
    sections: [
      { title: '基本メタ文字', code: `// JavaScriptでの例
const str = "Hello, World! 2024";

/Hello/         // 固定文字列
/./             // 任意の1文字
/H.llo/         // Hillo, Hello, H1lloなど
/\\d/            // 数字1文字 [0-9]
/\\w/            // 単語文字 [a-zA-Z0-9_]
/\\s/            // 空白文字（スペース・タブ・改行）
/\\D/            // 非数字
/\\W/            // 非単語文字` },
      { title: '量指定子', code: `/a*/    // 0回以上
/a+/    // 1回以上
/a?/    // 0か1回
/a{3}/  // ちょうど3回
/a{2,4}/ // 2〜4回

// 貪欲 vs 非貪欲
/<.*>/   // 貪欲（できるだけ長く）
/<.*?>/  // 非貪欲（できるだけ短く）

// 例
"<b>太字</b>".match(/<.*>/)   // <b>太字</b> 全体
"<b>太字</b>".match(/<.*?>/)  // <b> のみ` },
      { title: 'アンカーとフラグ', code: `/^Hello/    // 行頭がHello
/World$/    // 行末がWorld
/^Hello$/   // Hello のみ（前後に何もない）

// フラグ
/hello/i    // i: 大文字小文字無視
/\\d+/g     // g: 全マッチ（グローバル）
/^.+$/m    // m: 複数行モード（各行の先頭・末尾）

// test()で判定
/^\\d+$/.test("123")  // true
/^\\d+$/.test("12a")  // false` },
      { title: 'キャプチャグループ', code: `const date = "2024-01-15";

// グループでキャプチャ
const m = date.match(/(\\d{4})-(\\d{2})-(\\d{2})/);
console.log(m[1]);  // 2024（年）
console.log(m[2]);  // 01（月）
console.log(m[3]);  // 15（日）

// 名前付きキャプチャ
const m2 = date.match(/(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/);
console.log(m2.groups.year);  // 2024` },
      { title: 'よく使うパターン', code: `// メールアドレス
/^[^@]+@[^@]+\\.[^@]+$/

// 日本の電話番号
/^0\\d{1,4}-?\\d{1,4}-?\\d{4}$/

// 郵便番号
/^\\d{3}-?\\d{4}$/

// 数字のみ
/^\\d+$/

// URLの簡易チェック
/^https?:\\/\\/.+\\..+/

// HTMLタグ除去
str.replace(/<[^>]*>/g, "")` }
    ],
    tips: ['test() は判定のみ、match() はマッチ内容を取得', '文字クラス内の - は先頭か末尾に置くか \\- でエスケープ', 'グローバルフラグ /g を使うと lastIndex に注意', 'regexr.com などのツールでリアルタイムに動作確認できる']
  },
  php: {
    name: 'PHP', emoji: '🐘',
    intro: 'PHPはWebサーバーサイド開発に特化したスクリプト言語です。WordPressやLaravelなど多くのCMSやフレームワークで使われており、世界のWebサーバーの多くがPHPを使っています。',
    features: ['HTMLに直接埋め込める', 'WordPressなどのCMSに使われる', 'Laravelなど強力なフレームワーク', '豊富な組み込み関数', 'PHP 8でJIT・Fiberなどモダン機能追加'],
    sections: [
      { title: '基本構造', code: `<?php
// PHPはこのタグで始まる
echo "Hello, World!\\n";

// 変数は$で始まる
$name = "Alice";
$age = 25;
echo "$name は {$age}歳です\\n";` },
      { title: '変数と型', code: `<?php
$int   = 42;
$float = 3.14;
$str   = "Hello";
$bool  = true;
$arr   = [1, 2, 3];
$null  = null;

// 型チェック
var_dump($int);      // int(42)
var_dump($str);      // string(5) "Hello"

// 文字列連結は .
echo "Hello" . " " . "World";` },
      { title: '制御構文', code: `<?php
// if文
$age = 20;
if ($age >= 18) {
    echo "成人";
} elseif ($age >= 13) {
    echo "ティーン";
} else {
    echo "子ども";
}

// match式（PHP 8）
$status = "active";
$label = match($status) {
    "active"   => "有効",
    "inactive" => "無効",
    default    => "不明",
};` },
      { title: '配列と関数', code: `<?php
// 配列
$arr = [1, 2, 3, 4, 5];
$arr[] = 6;  // 末尾追加
array_push($arr, 7);

// 高階関数
$doubled = array_map(fn($x) => $x * 2, $arr);
$evens   = array_filter($arr, fn($x) => $x % 2 === 0);
$sum     = array_reduce($arr, fn($acc, $x) => $acc + $x, 0);

// 連想配列
$person = ["name" => "Alice", "age" => 25];
foreach ($person as $key => $value) {
    echo "$key: $value\\n";
}` },
      { title: 'クラスとOOP', code: `<?php
class Animal {
    public function __construct(
        private string $name  // コンストラクタプロモーション
    ) {}

    public function speak(): string {
        return "{$this->name} makes a sound";
    }
}

class Dog extends Animal {
    public function speak(): string {
        return parent::speak() . " (Woof!)";
    }
}

$d = new Dog("Rex");
echo $d->speak();` }
    ],
    tips: ['=== を使う（== はPHPの型ジャグリングで意図しない結果になることがある）', 'echo は ; を忘れないこと', 'htmlspecialchars() でXSS対策（ユーザー入力を出力する場合）', 'null合体演算子 ?? で $a ?? $b と書ける（PHP 7以降）']
  }
};

// ===== 各セクションの初心者向け説明文 =====

var langSectionDescs = {
  cpp: [
    'C++プログラムは <code>#include</code> でライブラリを取り込み、<code>main()</code> 関数から実行が始まります。<code>cout &lt;&lt; "文字列" &lt;&lt; endl;</code> で画面に表示し、<code>return 0;</code> で正常終了をOSに伝えます。<br><strong>すべての文末にセミコロン <code>;</code> を忘れずに！</strong>',
    '変数は「データを入れる名前付きの箱」です。<code>int</code>（整数）・<code>double</code>（小数）・<code>string</code>（文字列）・<code>bool</code>（真偽）など、箱の種類（型）を宣言してから使います。型が違うデータを入れようとするとコンパイルエラーになります。',
    '条件分岐（<code>if/else</code>）でプログラムの流れを変え、ループ（<code>for/while</code>）で同じ処理を繰り返せます。<code>for (int i = 0; i &lt; 5; i++)</code> は「i を 0 から始めて、5 未満の間、1 ずつ増やしながら繰り返す」という意味です。',
    '関数は処理をひとまとめにして名前をつけたものです。<code>int add(int a, int b)</code> は「int 型の引数を 2 つ受け取り、int 型の値を返す」という意味です。<strong>参照渡し（<code>&amp;</code>）</strong>を使うと関数の中から元の変数の値を変更できます。',
    '<code>vector</code> は C++ の可変長配列で、サイズを動的に変えられます。<code>push_back()</code> で末尾追加、<code>pop_back()</code> で末尾削除ができます。<strong>範囲 for ループ</strong> <code>for (int x : v)</code> で全要素を順番に処理できます。',
    'クラスはデータ（メンバ変数）と処理（メンバ関数）をひとまとめにした設計図です。<code>public:</code> で外部からアクセスできるメンバを宣言します。クラス名と同名の関数がコンストラクタで、オブジェクト生成時に自動で呼ばれます。',
    'C++ でよく起きるバグと対策です。<code>vector::at()</code> は範囲外アクセスを例外で検出します。ポインタは使う前に <code>nullptr</code> チェックが必須です。<code>new</code> でメモリを確保したら必ず <code>delete</code> で解放しましょう（メモリリーク防止）。',
  ],
  python: [
    'Python は <code>print()</code> で画面に表示します。<code>#</code> の後ろがコメントです。波括弧 <code>{}</code> の代わりに<strong>インデント（字下げ）</strong>でブロックを表現するのが Python の最大の特徴です。インデントを間違えると構文エラーになります。',
    'Python では型宣言が不要です。<code>age = 20</code> と書くだけで Python が自動的に int 型と判断します（動的型付け）。<code>type(変数)</code> で型を確認できます。<code>None</code> は「何もない」を表す特別な値で、他言語の null に相当します。',
    '<code>if/elif/else</code> で条件分岐を書きます（<code>elif</code> は "else if" の短縮）。Python では <code>{}</code> の代わりに <code>:</code> とインデントでブロックを作ります。<code>range(5)</code> は 0 〜 4 の整数を生成し、<code>for i in range(5):</code> で 5 回ループできます。',
    '<code>def</code> で関数を定義します。<code>greeting="こんにちは"</code> のようにデフォルト引数を設定すると、省略可能な引数が作れます。<strong>f 文字列</strong> <code>f"{変数}"</code> は文字列の中に変数を直接埋め込める便利な記法です（Python 3.6 以降）。',
    'リストは <code>[]</code> で作る順序付きコレクションです。<code>append()</code> で末尾追加、<code>pop()</code> で末尾削除ができます。<strong>内包表記</strong> <code>[x**2 for x in range(5)]</code> でリストを 1 行で生成できます。辞書は <code>{キー: 値}</code> のペアで、<code>.items()</code> でキーと値を同時に取り出せます。',
    '<code>class クラス名:</code> でクラスを定義します。<code>__init__(self, ...)</code> はコンストラクタで、オブジェクト生成時に自動で呼ばれます。<code>self</code> は自分自身のインスタンスを指し、メンバ変数へのアクセスには <code>self.変数名</code> と書きます。',
    '<code>try:</code> ブロック内でエラーが起きると <code>except:</code> に処理が飛びます。エラーの種類ごとに複数の <code>except</code> を書けます。<code>finally:</code> はエラーの有無にかかわらず必ず実行されるので、ファイルを閉じるなど後処理を書きます。',
  ],
  javascript: [
    '<code>const</code> は変更不可の変数（定数）、<code>let</code> は変更可能な変数です。<code>var</code> は古い書き方で現在は非推奨です。JavaScript は動的型付けなので型宣言は不要ですが、<code>typeof</code> で型を確認できます。<strong><code>===</code> を使って比較する</strong>のが重要です（<code>==</code> は型変換が起きて予想外の結果になることがあります）。',
    '<code>if/else</code> で条件分岐を書きます。配列のループには <code>for...of</code> が便利です。<strong>三項演算子</strong> <code>条件 ? 真の値 : 偽の値</code> で 1 行で条件分岐を書けます。',
    'JavaScript では関数の書き方が複数あります。<strong>アロー関数</strong> <code>(a, b) =&gt; a + b</code> はシンプルで現代的な書き方として多用されます。デフォルト引数で省略時の値を設定できます。<strong>テンプレートリテラル</strong>（バッククォート <code>`...$\{変数}...`</code>）で文字列に変数を埋め込めます。',
    '配列には <code>map()</code>・<code>filter()</code>・<code>reduce()</code> などの高階関数が使えます。<code>map()</code> は全要素を変換、<code>filter()</code> は条件を満たす要素だけ抽出します。<strong>分割代入</strong> <code>const { name, age } = person</code> でオブジェクトのプロパティを一度に取り出せます。',
    '非同期処理はサーバーからデータを取得するときによく使います。<code>async function</code> と <code>await</code> を組み合わせると非同期処理を同期的に書けて読みやすくなります。エラーは <code>try/catch</code> で捕捉します。',
    '<code>class</code> でクラスを定義し、<code>constructor()</code> でコンストラクタを書きます。<code>extends</code> で別クラスを継承でき、<code>super()</code> で親クラスのコンストラクタを呼べます。テンプレートリテラルの <code>`\${this.name}`</code> でメンバ変数を文字列に埋め込めます。',
  ],
  typescript: [
    '変数の後に <code>: 型名</code> と書いて型を明示します（型アノテーション）。これにより、コンパイル時に型の不一致を検出できます。<code>string | null</code> のようにユニオン型で「文字列またはnull」を表現でき、null安全なコードを書けます。',
    '<code>interface</code> でオブジェクトの形（型の仕様書）を定義します。<code>?</code> をつけるとオプショナル（省略可能）プロパティになります。<code>interface</code> と違う形でオブジェクトを作るとコンパイルエラーになります。',
    '<code>type エイリアス名 = ...</code> で型に名前をつけられます。<strong>ユニオン型</strong> <code>"active" | "inactive"</code> で取りうる値を制限でき、間違った値の代入をコンパイル時に検出できます。<code>Result&lt;T&gt;</code> のようにジェネリクスも型エイリアスで使えます。',
    '<strong>ジェネリクス</strong> <code>&lt;T&gt;</code> を使うと「どんな型でも使える汎用的な関数やクラス」を書けます。<code>T</code> は Type（型）の略で、呼び出し時に具体的な型に置き換わります。型安全なまま再利用性の高いコードが書けます。',
    '<code>enum</code> は関連する定数をまとめる仕組みです。文字列 enum を使うと値が読みやすくなります。<code>Direction.Up</code> のように使い、間違った値を渡すとコンパイルエラーになります。',
  ],
  java: [
    'Java ではすべてのコードをクラスの中に書きます。<code>public static void main(String[] args)</code> がプログラムの入り口です。<code>System.out.println()</code> で画面に表示します。クラス名とファイル名（<code>.java</code>）を一致させる必要があります。',
    'Java は強い静的型付けで、すべての変数に型の宣言が必要です。<code>String</code>（大文字 S に注意）は Java の文字列型で、<code>char</code>（1 文字）とは別物です。型キャストで型を変換できますが、小数 → 整数のキャストでは小数点以下が切り捨てられます。',
    '<code>class</code> でクラスを定義し、<code>private</code> で外部からの直接アクセスを防ぎます（カプセル化）。コンストラクタ（クラス名と同名のメソッド）でオブジェクト生成時の初期化を行います。<code>this.name</code> は自分自身のフィールドを指します。',
    'Java の標準コレクションです。<code>ArrayList</code> は可変長リスト、<code>HashMap</code> はキーと値のペアです。<code>import java.util.*;</code> で使えるようになります。ジェネリクス（<code>&lt;Integer&gt;</code> など）で型安全に使えます。',
    'ラムダ式 <code>n -&gt; n % 2 == 0</code> で無名関数を書けます。<strong>Stream API</strong> を使うと、コレクションに対して <code>filter</code>・<code>map</code>・<code>reduce</code> などを連鎖させて宣言的に処理できます。',
  ],
  ruby: [
    'Ruby は <code>puts</code> で改行付き出力、<code>print</code> で改行なし出力をします。<code>#</code> でコメントを書きます。<code>{}</code> の代わりに <code>end</code> でブロックを閉じるのが Ruby の特徴です。',
    'Ruby では型宣言は不要です。文字列の中に <code>#{変数}</code> を書くと変数の値を埋め込めます（<strong>文字列展開</strong>）。<strong>シンボル</strong> <code>:active</code> は文字列よりメモリ効率の良い識別子で、ハッシュのキーによく使われます。',
    'Ruby の配列は <code>&lt;&lt;</code> で末尾追加できます。<strong>ハッシュ</strong> <code>{key: value}</code> は Python の辞書・JavaScript のオブジェクトに相当します。<code>map</code>・<code>select</code>・<code>reduce</code> などのメソッドにブロックを渡してコレクションを処理するのが Ruby らしい書き方です。',
    '<code>if</code> の代わりに <code>unless（〜でなければ）</code> も使えます。<code>5.times { |i| ... }</code> でシンプルにループでき、<code>(1..5).each</code> で範囲を繰り返せます。Ruby ではループも「数値オブジェクトのメソッド」として実装されています。',
    '<code>def</code> でメソッドを定義します。<code>greeting: "こんにちは"</code> はキーワード引数のデフォルト値です。<strong>ブロック</strong> <code>do |n| ... end</code> は関数に渡せる無名処理のかたまりで、Ruby プログラミングの中心的な概念です。',
  ],
  kotlin: [
    '<code>val</code> は変更不可（推奨）、<code>var</code> は変更可能な変数です。<strong>null 安全</strong>が Kotlin の最大の特徴で、<code>?</code> をつけた型だけが null を持てます。<code>?.</code>（セーフコール）でnull でも安全にアクセスでき、<code>?:</code>（エルビス演算子）で null 時のデフォルト値を指定できます。',
    '<code>fun</code> で関数を定義します。<code>= a + b</code> のように式関数で 1 行で書けます。<strong>拡張関数</strong> <code>fun 型.関数名()</code> で既存の型に新しいメソッドを追加できます。',
    '<code>listOf()</code> はイミュータブル（変更不可）なリスト、<code>mutableListOf()</code> は変更可能なリストです。<code>to</code> でペアを作れるため <code>mapOf("a" to 1)</code> と読みやすく書けます。<code>map { }・filter { }・reduce { }</code> などの高階関数が使えます。',
    '<strong>データクラス</strong>は <code>equals()</code>・<code>hashCode()</code>・<code>toString()</code>・<code>copy()</code> が自動生成されます。<code>copy(name = "Bob")</code> で一部だけ変えたコピーを簡単に作れます。<strong>シールドクラス</strong>で継承できるクラスを限定できます。',
    '<strong>コルーチン</strong>は Kotlin の非同期処理の仕組みです。<code>suspend</code> 関数は途中で中断・再開できる特別な関数で、<code>delay()</code> はスレッドをブロックせずに待機します。<code>async { }</code> で並列実行し、<code>await()</code> で結果を待ちます。',
  ],
  swift: [
    '<code>let</code> は定数（変更不可・推奨）、<code>var</code> は変数（変更可）です。<strong>Optional 型</strong> <code>String?</code> は「nil が入る可能性がある型」で、Swift の型安全の核心です。<code>if let</code> でアンラップ（中身を取り出す）し、<code>??</code> で nil 時のデフォルト値を指定できます。',
    'Swift の <code>switch</code> はパターンマッチが強力で、<code>case 1...5:</code> のように範囲でマッチできます。<code>default:</code> は必須です（全ケースを網羅しない場合）。<code>for i in 1...5</code> で閉区間（1〜5）、<code>1..&lt;5</code> で半開区間（1〜4）のループができます。',
    'Swift の関数は<strong>ラベル付き引数</strong>が特徴で、<code>greet(name: "Bob")</code> のように呼び出し側にも引数名が見えます。<strong>クロージャ</strong> では <code>$0</code> が 1 番目の引数の略記です。<code>map { $0 * 2 }</code> のように配列の各要素を変換できます。',
    '<strong>構造体（struct）</strong>はコピーで渡され、<strong>クラス（class）</strong>は参照で渡されます。Swift では値型の構造体の方が推奨されることが多いです。メソッドはどちらでも同じように書けます。プロトコルはJavaのinterfaceに相当します。',
  ],
  csharp: [
    'C# は <code>using System;</code> で名前空間を宣言し、<code>Console.WriteLine()</code> で画面に出力します。すべてのコードはクラス内に書き、<code>static void Main()</code> がプログラムの入り口です。',
    'C# では <code>var</code> で型推論を使えます。<code>string?</code> や <code>int?</code> のように <code>?</code> をつけると null 許容型になります。<code>string</code>（小文字）は <code>String</code>（大文字）の別名です。<code>$"{変数}"</code> の文字列補間で変数を埋め込めます。',
    '<strong>プロパティ</strong> <code>{ get; set; }</code> はフィールドへのアクセスをカプセル化します。<code>init</code>（C# 9）はオブジェクト生成時のみ設定できる初期化専用のセッターです。<code>override string ToString()</code> でオブジェクトを文字列で表現する方法を定義できます。',
    '<strong>LINQ</strong>（Language Integrated Query）はコレクションを宣言的に操作できる強力な機能です。<code>Where()</code> でフィルタリング、<code>Select()</code> で変換、<code>Sum()/Max()</code> で集計ができます。SQL 風のクエリ構文でも同等の処理を書けます。',
    '<code>async</code> と <code>await</code> で非同期処理を同期的な書き方で表現できます。<code>Task.WhenAll()</code> で複数の非同期処理を並列実行できます。<code>using var</code> でリソースを使い終わったら自動的に解放されます（<code>IDisposable</code> の自動 Dispose）。',
  ],
  go: [
    'Go は必ずパッケージを宣言し（<code>package main</code>）、<code>import "fmt"</code> でライブラリを取り込みます。<code>fmt.Println()</code> で画面に表示します。使っていない import があるとコンパイルエラーになります。',
    '<code>var</code> で変数宣言、<code>:=</code>（短縮宣言）で型推論付きの変数を作れます（関数内のみ）。複数変数への同時代入 <code>x, y = y, x</code> でスワップが 1 行で書けます。Go に例外はなく、エラーは戻り値として返すのが慣習です。',
    'Go では<strong>エラーは戻り値として返す</strong>のが基本です。関数が <code>(値, error)</code> を返し、呼び出し側でエラーをチェックします。<code>fmt.Errorf()</code> でエラーメッセージを作れます。エラーを無視してはいけません。',
    'Go に継承はなく、<strong>構造体</strong>にメソッドを定義します。<strong>ポインタレシーバ</strong> <code>(d *Dog)</code> を使うと構造体のフィールドを変更できます。値レシーバ <code>(d Dog)</code> ではコピーが渡されるので元のデータは変わりません。',
    '<code>go</code> キーワードで<strong>goroutine</strong>（軽量スレッド）を起動できます。<strong>channel</strong> <code>chan</code> で goroutine 間の値の受け渡しが安全にできます。<code>&lt;-ch</code> でチャネルから値を受け取り、<code>ch &lt;-</code> で値を送信します。',
  ],
  c: [
    'C 言語は <code>#include &lt;stdio.h&gt;</code> で標準入出力ライブラリを取り込み、<code>printf()</code> で画面に表示します。<code>\\n</code> が改行記号です。C はすべてのプログラミング言語の祖先とも言える重要な言語です。',
    '<code>%d</code>（整数）・<code>%f</code>（小数）・<code>%c</code>（文字）・<code>%s</code>（文字列）は <code>printf</code> の<strong>フォーマット指定子</strong>です。型を間違えると意図しない表示になります。<code>float</code> は単精度（約7桁）、<code>double</code> は倍精度（約15桁）の小数です。',
    '<strong>ポインタ</strong>はメモリアドレスを格納する変数です。<code>&amp;x</code> で x のアドレス、<code>*p</code> でポインタが指す値にアクセスします。<code>malloc()</code> でメモリを動的確保し、必ず <code>free()</code> で解放します（メモリリーク防止）。ポインタは C 言語の最も重要な概念です。',
    'C 言語では関数を使う前に<strong>プロトタイプ宣言</strong>（前方宣言）が必要な場合があります。値を関数内で変更するにはポインタ渡しが必要で、<code>void swap(int *a, int *b)</code> のように書きます。引数はデフォルトで値渡し（コピー）です。',
    '<strong>構造体（struct）</strong>で複数のデータをひとまとめにできます。<code>typedef</code> で構造体に型エイリアスをつけると、毎回 <code>struct</code> と書かずに済みます。C にはクラスはありませんが、構造体で近いことができます。',
  ],
  rust: [
    'Rust では <code>println!()</code>（マクロ）で画面に表示します。<code>{}</code> が変数の埋め込みプレースホルダーです。感嘆符 <code>!</code> がつくのはマクロ（関数ではない特別な仕組み）を示します。',
    'Rust の変数はデフォルトで<strong>不変</strong>です。変更するには <code>mut</code> キーワードが必要です。<code>&amp;str</code> は文字列スライス（不変の参照）、<code>String</code> はヒープ上に確保された可変文字列です。<code>let pi: f64 = 3.14</code> のように型を明示することもできます。',
    'Rust の最大の特徴は<strong>所有権システム</strong>です。各値には必ず 1 つの所有者があり、所有権が移ると元の変数は使えなくなります（ムーブセマンティクス）。<strong>借用</strong>（<code>&amp;</code>）を使うと所有権を移さずに参照できます。この仕組みで GC なしにメモリ安全を実現しています。',
    '<code>enum</code> と <code>match</code> の組み合わせは Rust の強力な機能です。<code>match</code> はすべての場合を網羅する必要があり、漏れがあるとコンパイルエラーになります。標準の <code>Result&lt;T, E&gt;</code> でエラー処理を型安全に書けます。',
    '<code>struct</code> でデータを定義し、<code>impl</code> でメソッドを実装します。<code>&amp;self</code>（不変参照）・<code>&amp;mut self</code>（可変参照）・<code>self</code>（所有権移動）の使い分けが重要です。<code>Rectangle::new()</code> のような関連関数（static メソッド）も <code>impl</code> 内に書きます。',
  ],
  html: [
    'すべての HTML ファイルはこの基本構造から始まります。<code>&lt;head&gt;</code> にはページの設定情報（タイトル・文字コード・CSS の読み込みなど）、<code>&lt;body&gt;</code> に実際に表示するコンテンツを書きます。<code>lang="ja"</code> で言語を日本語に設定し、<code>charset="UTF-8"</code> で文字化けを防ぎます。',
    'よく使う HTML タグの一覧です。<code>&lt;h1&gt;〜&lt;h6&gt;</code> は見出しで、数字が小さいほど大きな（重要な）見出しです。<code>&lt;a href="URL"&gt;</code> でリンクを作り、<code>&lt;img src="パス" alt="説明文"&gt;</code> で画像を表示します。<code>alt</code> は画像が表示できない場合や音声読み上げ時に使われます。',
    'CSS セレクタでスタイルを適用する対象を選択します。<strong>クラス</strong>（<code>.クラス名</code>）は複数の要素に使い回せ、<strong>ID</strong>（<code>#ID名</code>）はページ内で 1 つだけの要素に使います。擬似クラス <code>:hover</code> でマウスオーバー時のスタイルを設定できます。',
    '<strong>Flexbox</strong> は 1 次元（横方向または縦方向）のレイアウトを制御する CSS の仕組みです。<code>justify-content</code> で主軸（デフォルトは横）方向、<code>align-items</code> で交差軸（デフォルトは縦）方向の配置を指定します。<code>gap</code> で要素間の間隔を設定できます。',
    '<strong>Grid</strong> は縦横の 2 次元レイアウトを同時に制御します。<code>grid-template-columns: repeat(3, 1fr)</code> で「3 等分した 3 列」を作れます。<code>@media</code> クエリでスクリーンサイズに応じてレイアウトを変えられます（レスポンシブデザイン）。',
    '<strong>トランジション</strong>でプロパティの変化をなめらかにします。<strong>アニメーション</strong> <code>@keyframes</code> でより複雑な動きを定義できます。<code>transform</code> でスケール・回転・移動などの変形効果をつけられます。',
  ],
  sql: [
    'テーブルの作成（<code>CREATE TABLE</code>）とデータの操作（<code>INSERT/UPDATE/DELETE</code>）の基本です。<code>PRIMARY KEY</code> は各行を一意に識別するキーです。<code>NOT NULL</code> で null 値の挿入を禁止できます。SQL のキーワードは大文字で書くのが慣習です。',
    '<code>SELECT</code> でデータを取得します。<code>WHERE</code> で条件を絞り込み、<code>ORDER BY</code> でソート（<code>DESC</code> は降順）、<code>LIMIT</code> で取得件数を制限します。<code>LIKE \'A%\'</code> で「A で始まる」を表現します（<code>%</code> はワイルドカード）。',
    '<strong>集計関数</strong>（<code>COUNT/AVG/MAX/MIN/SUM</code>）でデータを集計します。<code>GROUP BY</code> でグループ化し、グループごとに集計できます。<code>HAVING</code> はグループ化後の絞り込みに使います（<code>WHERE</code> はグループ化前）。',
    '<strong>JOIN</strong> で複数テーブルを結合します。<code>INNER JOIN</code> は両テーブルに一致する行だけ、<code>LEFT JOIN</code> は左テーブルの全行を残し右テーブルに対応がない場合は NULL になります。サブクエリで <code>SELECT</code> の中に別の <code>SELECT</code> を入れ子にできます。',
    '<strong>ウィンドウ関数</strong>はグループ化せずに行ごとの集計・ランキングができる高度な機能です。<code>OVER(ORDER BY 列)</code> で順位付け、<code>PARTITION BY</code> でグループ内ランキング、<code>LAG()</code> で前の行の値にアクセスできます。',
  ],
  bash: [
    'Bash スクリプトは <code>#!/bin/bash</code>（シバン）から始めます。変数は <code>name="値"</code> で設定し（<strong>=の前後にスペースを入れない</strong>のが重要）、使うときは <code>$name</code> または <code>${name}</code> と書きます。<code>$(コマンド)</code> でコマンドの実行結果を変数に代入できます。',
    '<code>[ 条件 ]</code> で条件テストをします（<code>[</code> の後と <code>]</code> の前にスペースが必要）。数値比較には <code>-ge</code>（以上）・<code>-lt</code>（未満）・<code>-eq</code>（等しい）などを使います。<code>-f ファイル</code> でファイルの存在確認ができます。',
    '<code>for i in {1..10}</code> で範囲ループ、<code>for i in 値1 値2 ...</code> で値を列挙したループができます。<code>while [ 条件 ]; do ... done</code> で条件ループを書きます。<code>((count++))</code> で数値の加算ができます。',
    '<code>local 変数名</code> で関数内のローカル変数を宣言できます（関数外の同名変数と区別するため重要）。Bash の関数は値を返すのではなく、<code>echo</code> で出力し、呼び出し側で <code>$(関数名)</code> で受け取ります。<code>$1, $2</code> で引数を参照できます。',
    '<code>|</code>（パイプ）で一方のコマンドの出力を次のコマンドの入力にできます。<code>&gt;</code> でファイルへ書き込み（上書き）、<code>&gt;&gt;</code> で追記します。<code>grep</code>（パターン検索）・<code>awk</code>（フィールド処理）・<code>sed</code>（文字列置換）はテキスト処理の定番コマンドです。',
  ],
  regex: [
    'メタ文字は正規表現の特殊な記号です。<code>.</code> は任意の 1 文字、<code>\\d</code> は数字（0-9）、<code>\\w</code> は英数字とアンダースコア、<code>\\s</code> は空白文字です。大文字（<code>\\D</code>・<code>\\W</code>・<code>\\S</code>）はその否定になります。',
    '量指定子は直前のパターンの繰り返し回数を指定します。<code>*</code>（0 回以上）・<code>+</code>（1 回以上）・<code>?</code>（0 か 1 回）・<code>{3}</code>（ちょうど 3 回）がよく使われます。デフォルトは<strong>貪欲マッチ</strong>（できるだけ長く）で、<code>?</code> を追加すると非貪欲になります。',
    '<code>^</code> は行の先頭、<code>$</code> は行の末尾を表します。<strong>フラグ</strong>でマッチの挙動を変えられます。<code>i</code> で大文字小文字無視、<code>g</code> で全マッチ検索（グローバル）、<code>m</code> で複数行モード（各行の先頭・末尾にマッチ）になります。',
    '<code>()</code> でグループを作ると、マッチした部分を取り出せます（キャプチャグループ）。<code>m[1]</code>・<code>m[2]</code> で各グループの値を参照できます。<code>(?&lt;year&gt;...)</code> で名前付きキャプチャにすると <code>groups.year</code> でアクセスできます。',
    'よく使う正規表現パターンの実例です。メールアドレス・電話番号・URL など頻出パターンは既存のものを参考にしましょう。<code>regexr.com</code> や <code>regex101.com</code> でリアルタイムにパターンをテストできます。',
  ],
  php: [
    'PHP は <code>&lt;?php</code> タグで始まります。変数は必ず <code>$</code> から始まります。<code>echo</code> や <code>print</code> で出力し、文字列の結合は <code>.</code>（ドット）演算子を使います。文字列の中に <code>"$変数"</code> または <code>"{$変数}"</code> で変数を展開できます。',
    'PHP の変数は型宣言不要で、<code>var_dump()</code> で型と値を確認できます。<code>===</code> は型も含めた厳密な比較（推奨）、<code>==</code> は型変換ありの比較です。PHP は Webサーバー上で動くため、デバッグには <code>var_dump()</code> や <code>error_log()</code> をよく使います。',
    '<code>if/elseif/else</code> で条件分岐（<code>elseif</code> は 1 語）、<code>foreach ($arr as $v)</code> で配列ループを書きます。<code>match</code>（PHP 8）は <code>switch</code> より厳密で、型も一致する必要があります。<code>$_POST</code>・<code>$_GET</code> で HTML フォームの値を受け取れます。',
    'PHP のクラスは Java に似ています。<strong>コンストラクタプロモーション</strong>（PHP 8）で <code>__construct(private string $name)</code> と書くと、プロパティ宣言と代入を同時に行えます。<code>extends</code> で継承し、<code>parent::</code> で親クラスのメソッドを呼べます。',
  ],
};

