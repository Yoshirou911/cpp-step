# CODE STEP — CLAUDE.md

## プロジェクト概要
- **アプリ名**: CODE STEP（プログラミング学習Webアプリ）
- **GitHub**: https://github.com/Yoshirou911/cpp-step.git
- **本番URL**: https://cpp-step.vercel.app/
- **ローカル**: `C:\Users\yoshi\Downloads\cpp-step`
- **スタック**: Vanilla JS SPA / LocalStorage / Supabase / Stripe / Vercel

## 主要ファイル
| ファイル | 役割 |
|---------|------|
| `index.html` | SPA本体・全モーダル |
| `script.js` | 全ロジック（~10,000行） |
| `data/problems.js` | 全17言語の問題データ（~1,200問） |
| `style.css` | ダークテーマCSS |
| `api/` | Vercel Serverless Functions |

## 技術スタック
- 認証: Supabase（メール/パスワード + Google OAuth）
- 決済: Stripe（PLUS ¥480/月）
- AI: Groq API（ヒント・採点）
- コード実行: Judge0 CE → Godbolt → Wandbox（フォールバック順）
- アナリティクス: Google Analytics 4（G-F0QKQT2YHK）

## Git運用
- mainブランチ直push（PRなし）
- `git push` → Vercel自動デプロイ
- **作業前に必ず `git pull`**（複数デバイスで並行開発中）

## プレビュー起動
`.claude/launch.json` に `cpp-step` サーバー設定済み。
`preview_start("cpp-step")` で localhost:5173 起動。

---

## 実装済み機能（2026-07-21時点）

### コア機能
- 17言語 × ~1,200問（ROOKIE〜TITAN難易度）
- 問題クリア自動判定・手動クリア
- Ace Editorコードエディタ（テンプレート/穴埋め/ゼロからモード）
- AI採点・AIフィードバック（Groq）
- ランキング・バッジ・EXPシステム
- TOOLSページ（Linux/Git/Docker/Vim/npm/Kubernetes）

### ゲーミフィケーション（SP/ガチャ）
- **SP（ステップポイント）**: 問題クリア・ログインボーナス・ミッション・連続クリアで獲得
- **ガチャ**: 通常ガチャ＋月別限定ガチャ（7月=夏コーダー等）
- **称号タイトル**: ガチャで入手、プロフィールに表示
- **プレミアム2倍SP**
- **ウィークリーチャレンジ**（全5問クリアで+300SP）
- **フレンド招待ボーナス**（URLパラメータ`?ref=`）
- **連続ログインボーナス**（7日毎に+50〜200SP）

### 学習サポート
- **苦手分析**（10問以上回答後）: 誤答×3＋未クリア数でユニットスコア化、上位3ユニットから最大9問のパーソナライズ問題をGUIDEに表示
- **単元イントロ**（「📘 この単元について」）: 各問題ページに概要・ポイント・キーワード表示
- **不正解後サポート**: 1回目→ヒント自動展開、2回目以降→解説も自動展開
- **ランク説明**（「ランクとは？」）: ROOKIE〜TITANの難易度表モーダル
- **学習ロードマップ**・コース進捗（GUIDEタブ）

### 初心者フロー
- **スキルチェック**（初回訪問）: 4択（まったくない/聞いたことある/少しある/経験あり）
- **プログラミング入門説明**（「まったくない」選択時）: 概念・コードデモ→言語選択
- **ランディングページ「プログラミングとは？」ブロック**: 命令書の概念・デモ付き
- **オンボーディング**: 言語選択（Webを作りたい/データAI/システム/アプリ）

### 開発ツール
- **開発者コンソール**: `Ctrl+Shift+D` で開閉
  - `tutorial` / `tutorial intro` / `tutorial lang` / `tutorial reset`
  - `sp <n>` / `sp set <n>` / `info` / `ls` / `goto <id>` / `lang <name>`
  - `reset` / `reset progress` / `premium` / `skill <level>` / `help`

---

## 重要な実装メモ

### LocalStorageキー
- `sp_balance` — SP残高
- `{lang}_progress` — 問題クリア済みIDリスト（例: `cpp_progress`）
- `{lang}_wrong` — 誤答済みIDリスト
- `wc_{id}` — 問題ごとの誤答回数
- `skill_check_done` / `skill_level` — スキルチェック結果
- `onboarding_done` — オンボーディング完了フラグ
- `login_days` — ログイン日配列
- `active_title` — 選択中の称号ID

### 関数の命名規則
- `render*` — 画面描画
- `_check*` — 状態チェック・サイドエフェクト
- `_build*HTML` — HTML文字列生成ヘルパー
- `get*` — データ取得（副作用なし）
- `save*` — LocalStorageへの保存

### セキュリティ注意
- 問題文は必ず `escapeHtml()` でXSS対策
- API呼び出しはSupabase JWTをAuthorizationヘッダーに付与
- プレミアム問題はJSバンドルに含まれている（UIロックのみ・コンソールで回避可能）→ Supabase移行が必要

---

## 残りのタスク

### 高優先
- Google OAuthをテストモードから公開（Google Cloud Console → 「アプリを公開」）
- モバイルエディタUX改善（Ace Editorのフォントサイズ・操作性）

### 低優先
- プレミアム問題をSupabaseに移行（大規模作業）
- Vercel KV / Upstash Redis導入（レートリミッター実効化）
- SEO個別ページ化（SPA→SSG、大規模変更）
- 価格改定（¥480/月 → ¥780〜¥980検討）
