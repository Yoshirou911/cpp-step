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

// ===== 問題一覧の描画（単元グループ） =====

function renderList() {
  const list = document.getElementById("problem-list");
  list.innerHTML = "";

  // 単元ごとにグループ化
  var units = {};
  var unitOrder = [];
  problems.forEach(function(p) {
    if (!units[p.unit]) {
      units[p.unit] = [];
      unitOrder.push(p.unit);
    }
    units[p.unit].push(p);
  });

  unitOrder.forEach(function(unitName) {
    // 単元ヘッダー
    var header = document.createElement("div");
    header.className = "unit-header";
    header.textContent = unitName;
    list.appendChild(header);

    // 問題カード
    units[unitName].forEach(function(p) {
      var learned = isLearned(p.id);
      var card = document.createElement("div");
      card.className = "problem-card" + (learned ? " learned" : "");

      card.innerHTML =
        '<div class="card-left">' +
          '<span class="problem-id">#' + p.id + '</span>' +
          '<span class="problem-title">' + p.title + '</span>' +
        '</div>' +
        '<div class="card-right">' +
          '<span class="rank-badge rank-' + p.rank.toLowerCase() + '">' + p.rank + '</span>' +
          '<span class="badge ' + (learned ? "" : "not-learned") + '">' +
            (learned ? "✔ CLEAR" : "—") +
          '</span>' +
        '</div>';

      card.addEventListener("click", function() {
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
  const p = problems.find(function(x) { return x.id === id; });
  const learned = isLearned(p.id);

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
      '<h3>コードエディタ</h3>' +
      '<textarea id="code-editor" class="code-editor" placeholder="ここにC++コードを書いてください..."></textarea>' +
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
        'onclick="markLearned(' + p.id + ')" ' +
        (learned ? 'disabled' : '') +
      '>' +
        (learned ? "✔ CLEAR" : "MARK AS CLEAR") +
      '</button>' +
    '</div>';
}

// ===== コードを実行する（Wandbox API） =====

async function runCode() {
  const code = document.getElementById("code-editor").value.trim();
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
  const p = problems.find(function(x) { return x.id === problemId; });
  const code = document.getElementById('code-editor').value.trim();
  if (!code) { alert('コードを入力してください'); return; }

  const btn = document.querySelector('.ai-feedback-btn');
  const area = document.getElementById('ai-feedback-area');
  const text = document.getElementById('ai-feedback-text');

  btn.textContent = '🤖 AIが分析中...';
  btn.disabled = true;
  area.classList.add('hidden');

  const system = 'あなたはC++プログラミングの初心者向けの優しい家庭教師です。日本語で簡潔に答えてください。';
  const userMsg = '問題：' + p.question + '\n\n提出コード：\n```cpp\n' + code + '\n```\n\n良い点・改善点・アドバイスを初心者向けに教えてください。';

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

  var system = 'あなたはC++プログラミングの初心者向けの優しい家庭教師です。日本語で答えてください。初心者が理解しやすい言葉で説明してください。';

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
  document.getElementById('tab-problems').classList.remove('active');
  document.getElementById('tab-missions').classList.remove('active');
  document.getElementById('tab-guide').classList.remove('active');
  document.getElementById('tab-' + tab).classList.add('active');

  if (tab === 'problems') {
    renderList();
    showPage('list');
  } else if (tab === 'missions') {
    renderMissionList();
    showPage('mission-list');
  } else {
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

  unitGuides.forEach(function(unit) {
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

function loadMissionProgress() {
  const data = localStorage.getItem("cpp_mission_progress");
  return data ? JSON.parse(data) : [];
}

function saveMissionProgress(id) {
  const progress = loadMissionProgress();
  if (!progress.includes(id)) {
    progress.push(id);
    localStorage.setItem("cpp_mission_progress", JSON.stringify(progress));
  }
}

function isMissionCleared(id) {
  return loadMissionProgress().includes(id);
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
    '<div class="mission-progress-text">' + cleared + ' / ' + missions.length + ' MISSIONS CLEARED</div>';
  list.appendChild(header);

  missions.forEach(function(m) {
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
      renderMissionDetail(m.id);
      showPage('mission-detail');
    });

    list.appendChild(card);
  });
}

// ===== ミッション詳細の描画 =====

function renderMissionDetail(id) {
  const m = missions.find(function(x) { return x.id === id; });
  const cleared = isMissionCleared(m.id);
  const detail = document.getElementById('mission-detail-content');

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

    '<div class="section">' +
      '<h3>入出力例</h3>' +
      '<pre><code>' + escapeHtml(m.sampleIO) + '</code></pre>' +
    '</div>' +

    '<div class="section">' +
      '<button class="toggle-btn" onclick="toggleSection(\'mission-hint-' + m.id + '\')">💡 ヒントを見る</button>' +
      '<div id="mission-hint-' + m.id + '" class="hidden toggle-content">' +
        '<p>' + m.hint + '</p>' +
      '</div>' +
    '</div>' +

    '<div class="section">' +
      '<h3>コードエディタ</h3>' +
      '<textarea id="code-editor" class="code-editor" placeholder="ここにC++コードを書いてください..."></textarea>' +
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
        'onclick="markMissionCleared(' + m.id + ')" ' +
        (cleared ? 'disabled' : '') +
      '>' +
        (cleared ? '✔ MISSION CLEARED' : 'MISSION COMPLETE') +
      '</button>' +
    '</div>';
}

// ===== ミッションAIレビュー =====

async function getMissionAIFeedback(missionId) {
  const m = missions.find(function(x) { return x.id === missionId; });
  const code = document.getElementById('code-editor').value.trim();
  if (!code) { alert('コードを入力してください'); return; }

  const btn = document.querySelector('.ai-feedback-btn');
  const area = document.getElementById('ai-feedback-area');
  const text = document.getElementById('ai-feedback-text');

  btn.textContent = '🤖 AIがレビュー中...';
  btn.disabled = true;
  area.classList.add('hidden');

  const system = 'あなたはC++プログラミングの初心者向けの優しい先輩エンジニアです。日本語で丁寧にコードレビューしてください。';
  const reqText = m.requirements.map(function(r, i) { return (i+1) + '. ' + r; }).join('\n');
  const userMsg =
    'ミッション: ' + m.title + '\n\n' +
    '要件:\n' + reqText + '\n\n' +
    '提出コード:\n```cpp\n' + code + '\n```\n\n' +
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

function markMissionCleared(id) {
  saveMissionProgress(id);
  renderMissionDetail(id);
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

document.getElementById("mission-back-btn").addEventListener("click", function() {
  renderMissionList();
  showPage("mission-list");
});

document.getElementById("site-title").addEventListener("click", function() {
  renderList();
  showPage("list");
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

renderList();
showPage("list");
