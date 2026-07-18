// ===== ツール学習データ（プログラミング学習とは独立） =====

var TOOL_GROUPS = [
  {
    id: 'linux',
    name: 'Linux',
    icon: '🐧',
    color: '#FFA500',
    desc: 'ファイル操作・プロセス管理・権限設定など基本コマンドを学ぶ',
    guide: {
      what: 'Linux（リナックス）は、無料で使えるオープンソースの OS（オペレーティングシステム）です。OS とは、パソコンやサーバーを動かすための基本ソフトのことで、Windows や macOS と同じ仲間です。1991年にフィンランドの学生リーナス・トーバルズが開発を始め、現在は世界中の開発者が協力して作り続けています。',
      why: 'Web サービスやクラウド（AWS・GCP・Azure）のサーバーのほぼ 100% が Linux で動いています。プログラマーやエンジニアになるなら、Linux のコマンド操作は避けて通れないスキルです。また Android のベースも Linux なので、モバイル開発にも関係があります。',
      concepts: [
        { term: 'カーネル',    desc: 'OS の核心部分。CPU・メモリ・デバイスを管理し、アプリとハードウェアの橋渡し役。' },
        { term: 'シェル',      desc: 'ユーザーがコマンドを入力する窓口。bash・zsh などが有名。ターミナルで文字を打つとシェルが受け取る。' },
        { term: 'ターミナル',  desc: 'シェルを操作するための黒い画面。コマンドを打ち込んでファイル操作やプログラム実行ができる。' },
        { term: 'ファイルシステム', desc: 'Linux はすべてがファイルとして管理される。/ がルート（頂点）で、/home /etc /var などにフォルダが分かれている。' },
        { term: 'パーミッション', desc: 'ファイルやフォルダごとに「誰が・何をできるか」を設定する仕組み。r（読む）w（書く）x（実行）の 3 種類。' },
        { term: 'プロセス',    desc: '実行中のプログラムのこと。ps や top コマンドで一覧を見たり、kill で終了させたりできる。' },
        { term: 'ルートユーザー', desc: '何でもできる管理者アカウント（root）。強力すぎるため普段は使わず、必要なときだけ sudo で権限を借りる。' },
        { term: 'ディストリビューション', desc: 'Linux をベースにしたOSのパッケージ。Ubuntu・Debian・CentOS・Arch などがある。中身はほぼ同じコマンドが使える。' },
      ]
    },
    textbook: [
      {
        id: 'lch1', title: '第1章：現在地とファイルの確認',
        commands: [
          {
            cmd: 'pwd',
            desc: '現在いるディレクトリの絶対パスを表示します（print working directory の略）。どこにいるか分からなくなったらまずこれを打ちましょう。',
            example: '$ pwd\n/home/user/Documents'
          },
          {
            cmd: 'ls',
            desc: 'カレントディレクトリのファイル・フォルダ一覧を表示します（list の略）。日常的に最もよく使うコマンドの一つです。',
            example: '$ ls\nDesktop  Documents  Downloads  main.cpp',
            note: 'よく使うオプション\n  ls -l  → 詳細情報（権限・サイズ・日時）を表示\n  ls -a  → 隠しファイル（. で始まるもの）も表示\n  ls -la → 詳細 + 隠しファイル（組み合わせ）'
          }
        ]
      },
      {
        id: 'lch2', title: '第2章：ディレクトリの移動',
        commands: [
          {
            cmd: 'cd',
            desc: 'ディレクトリを移動します（change directory の略）。ファイル操作の前に、目的の場所に移動するために使います。',
            example: '$ cd Documents\n$ pwd\n/home/user/Documents',
            note: '特殊なパス指定\n  cd ..  → 1つ上（親）のディレクトリへ移動\n  cd ~   → ホームディレクトリへ移動\n  cd     → 引数なしでもホームへ移動（cd ~ と同じ）\n  cd /   → ルートディレクトリへ移動'
          }
        ]
      },
      {
        id: 'lch3', title: '第3章：ファイルとディレクトリの作成',
        commands: [
          {
            cmd: 'touch',
            desc: '空のファイルを新規作成します。すでに存在するファイルに対して使うと中身は変わらず更新日時だけが変わります。',
            example: '$ touch hello.txt\n$ ls\nhello.txt'
          },
          {
            cmd: 'mkdir',
            desc: '新しいディレクトリを作成します（make directory の略）。複数の階層をまとめて作るときは -p オプションを使います。',
            example: '$ mkdir myproject\n$ ls\nhello.txt  myproject/'
          }
        ]
      },
      {
        id: 'lch4', title: '第4章：ファイルの表示・コピー・移動・削除',
        commands: [
          {
            cmd: 'cat',
            desc: 'ファイルの内容をターミナルに表示します（concatenate の略）。短いファイルの素早い確認に便利です。',
            example: '$ cat readme.txt\nHello, World!\nThis is a readme file.'
          },
          {
            cmd: 'cp',
            desc: 'ファイルをコピーします（copy の略）。cp 元ファイル 先ファイル の形で使います。',
            example: '$ cp hello.txt backup.txt\n$ ls\nbackup.txt  hello.txt'
          },
          {
            cmd: 'mv',
            desc: 'ファイルを移動、またはファイル名を変更します（move の略）。mv 元 先 の形で使います。',
            example: '$ mv old.txt new.txt   # リネーム\n$ mv file.txt ~/       # ホームへ移動'
          },
          {
            cmd: 'rm',
            desc: 'ファイルを削除します（remove の略）。⚠️ ゴミ箱に入らず完全削除されるので注意！ ディレクトリを削除するには -r を付けます。',
            example: '$ rm temp.txt\n\n# ディレクトリを削除するには\n$ rm -r mydir/'
          }
        ]
      },
      {
        id: 'lch5', title: '第5章：権限と管理者コマンド',
        commands: [
          {
            cmd: 'chmod',
            desc: 'ファイル・ディレクトリのアクセス権限を変更します（change mode の略）。シェルスクリプトに実行権限を付与するのが特によく使われます。',
            example: '$ chmod +x script.sh   # 実行権限を付与\n$ chmod 755 script.sh  # rwxr-xr-x に設定',
            note: '権限の種類\n  r（read）    → 読み取り\n  w（write）   → 書き込み\n  x（execute） → 実行\n\n数字表記：r=4, w=2, x=1 の合計\n  7 = rwx（全権限）、5 = r-x、4 = r-- など'
          },
          {
            cmd: 'sudo',
            desc: '管理者（root）権限でコマンドを実行します（superuser do の略）。パッケージのインストールなど、通常ユーザーでは実行できない操作に使います。',
            example: '$ sudo apt install vim\n[sudo] password for user: ****'
          }
        ]
      },
      {
        id: 'lch6', title: '第6章：検索・調査コマンド',
        commands: [
          {
            cmd: 'grep',
            desc: 'ファイルの中から特定の文字列を検索します（global regular expression print の略）。ログファイルからエラーを探すときなどによく使います。',
            example: '$ grep "error" log.txt\n2024-01-01 error: connection failed\n2024-01-02 error: timeout'
          },
          {
            cmd: 'ps',
            desc: '現在実行中のプロセス（アプリ）の一覧を表示します（process status の略）。',
            example: '$ ps aux\nUSER   PID  %CPU  COMMAND\nroot     1   0.0  /sbin/init\nuser  1234   2.1  python3 app.py'
          },
          {
            cmd: 'df -h',
            desc: 'ディスクの使用状況を表示します（disk free）。-h は human-readable の意味で GB・MB 単位で見やすく表示します。',
            example: '$ df -h\nFilesystem  Size  Used  Avail  Use%\n/dev/sda1    20G   12G    8G    60%'
          },
          {
            cmd: 'du -sh',
            desc: 'ディレクトリの合計サイズを表示します（disk usage）。-s は合計のみ表示、-h は人が読みやすい単位。',
            example: '$ du -sh Downloads/\n2.3G  Downloads/'
          },
          {
            cmd: 'echo',
            desc: '文字列をターミナルに表示します。> を使ってファイルに書き込むこともでき、シェルスクリプトでよく使われます。',
            example: '$ echo "Hello World"\nHello World\n\n$ echo "text" > file.txt  # ファイルに書き込む'
          },
          {
            cmd: 'which',
            desc: 'コマンドのインストール先パスを調べます。コマンドが存在するかどうかの確認にも使えます。',
            example: '$ which python3\n/usr/bin/python3\n\n$ which git\n/usr/bin/git'
          }
        ]
      }
    ],
    problems: [
      { id: 'l01', title: 'ファイル一覧',
        question: 'カレントディレクトリのファイルを一覧表示するコマンドは？',
        answers: ['ls'], hint: 'list の略です' },
      { id: 'l02', title: '隠しファイルも表示',
        question: '隠しファイルを含むすべてのファイルを一覧表示するコマンドは？',
        answers: ['ls -a', 'ls -la', 'ls -al'], hint: '-a オプションをつける（all）' },
      { id: 'l03', title: '詳細情報表示',
        question: 'ファイルの権限・所有者・サイズなど詳細を一覧表示するコマンドは？',
        answers: ['ls -l'], hint: '-l オプション（long format）' },
      { id: 'l04', title: '現在地確認',
        question: '現在いるディレクトリのパスを表示するコマンドは？',
        answers: ['pwd'], hint: 'print working directory' },
      { id: 'l05', title: '親ディレクトリへ移動',
        question: '親ディレクトリ（一つ上）に移動するコマンドは？',
        answers: ['cd ..'], hint: '.. は親ディレクトリを指す' },
      { id: 'l06', title: 'ホームへ戻る',
        question: 'ホームディレクトリに移動するコマンドは？（最短の書き方）',
        answers: ['cd', 'cd ~'], hint: '引数なし、またはチルダ（~）' },
      { id: 'l07', title: '空ファイル作成',
        question: '空のファイル "test.txt" を作成するコマンドは？',
        answers: ['touch test.txt'], hint: 'touch コマンドを使う' },
      { id: 'l08', title: 'ディレクトリ作成',
        question: '"mydir" というディレクトリを作成するコマンドは？',
        answers: ['mkdir mydir'], hint: 'make directory' },
      { id: 'l09', title: 'ファイル内容表示',
        question: '"readme.txt" の内容をターミナルに表示するコマンドは？',
        answers: ['cat readme.txt'], hint: 'concatenate の略' },
      { id: 'l10', title: 'ファイルコピー',
        question: '"a.txt" を "b.txt" としてコピーするコマンドは？',
        answers: ['cp a.txt b.txt'], hint: 'copy' },
      { id: 'l11', title: 'ファイル移動・リネーム',
        question: '"old.txt" を "new.txt" にリネームするコマンドは？',
        answers: ['mv old.txt new.txt'], hint: 'move' },
      { id: 'l12', title: 'ファイル削除',
        question: '"test.txt" を削除するコマンドは？',
        answers: ['rm test.txt'], hint: 'remove' },
      { id: 'l13', title: '実行権限付与',
        question: '"script.sh" に実行権限を付与するコマンドは？',
        answers: ['chmod +x script.sh'], hint: 'chmod で権限を変更する' },
      { id: 'l14', title: 'テキスト検索',
        question: '"log.txt" の中から "error" という文字列を検索するコマンドは？',
        answers: ['grep error log.txt', 'grep "error" log.txt'], hint: 'global regular expression print' },
      { id: 'l15', title: 'プロセス確認',
        question: '実行中のプロセス一覧を表示するコマンドは？',
        answers: ['ps', 'ps aux', 'ps -aux'], hint: 'process status' },
      { id: 'l16', title: 'ディスク使用量',
        question: 'ディスクの使用状況を人間が読みやすい形式で表示するコマンドは？',
        answers: ['df -h'], hint: 'disk free / -h は human-readable' },
      { id: 'l17', title: 'ファイルサイズ確認',
        question: '"data" ディレクトリの合計サイズを人間が読みやすい形式で表示するコマンドは？',
        answers: ['du -sh data'], hint: 'disk usage / -s は合計 / -h は human-readable' },
      { id: 'l18', title: 'スーパーユーザー権限',
        question: 'root 権限でコマンドを実行する際の頭に付けるコマンドは？',
        answers: ['sudo'], hint: 'superuser do' },
      { id: 'l19', title: 'テキストを画面に表示',
        question: '"Hello World" という文字列をターミナルに表示するコマンドは？',
        answers: ['echo Hello World', 'echo "Hello World"'], hint: 'echo コマンドを使う' },
      { id: 'l20', title: 'コマンドの場所を調べる',
        question: '"python3" コマンドがどこにインストールされているか調べるコマンドは？',
        answers: ['which python3'], hint: 'which コマンドを使う' },
    ]
  },
  {
    id: 'git',
    name: 'Git',
    icon: '📦',
    color: '#F05032',
    desc: 'バージョン管理の基本操作・ブランチ・リモートをコマンドで覚える',
    guide: {
      what: 'Git（ギット）は、ファイルの変更履歴を記録・管理するツールです。「バージョン管理システム」と呼ばれ、「いつ・誰が・何を変えたか」を追跡できます。コードを間違えても以前の状態に戻せるので、安心して開発できます。2005年にリーナス・トーバルズ（Linux の開発者と同じ人）が作りました。',
      why: '現代のソフトウェア開発では Git はほぼ必須です。GitHub・GitLab などのサービスと組み合わせることで、複数人でのチーム開発やコードの共有・公開ができます。就職活動でも「GitHub のアカウントを見せてください」と言われることがあるほど、エンジニアの基本スキルとして定着しています。',
      concepts: [
        { term: 'リポジトリ',     desc: 'ファイルの変更履歴をまとめて保存する場所。ローカル（自分のPC）とリモート（GitHub など）の2種類がある。' },
        { term: 'コミット',       desc: '変更内容を「セーブポイント」として記録すること。メッセージを付けて「何を変えたか」を残す。' },
        { term: 'ステージング',   desc: 'コミットする前に「次のセーブポイントに含めるファイル」を選ぶ作業。git add で行う。' },
        { term: 'ブランチ',       desc: 'メインのコードとは別に、独立した作業ラインを作る仕組み。機能追加やバグ修正を安全に進められる。' },
        { term: 'マージ',         desc: '別のブランチで行った変更をメインブランチに取り込むこと。チーム開発の要となる操作。' },
        { term: 'リモート',       desc: 'GitHub などのサーバー上にあるリポジトリ。push で送信、pull で受信して同期する。' },
        { term: 'クローン',       desc: 'リモートリポジトリをまるごと自分のPCにコピーしてくること。git clone コマンドで実行する。' },
        { term: 'コンフリクト',   desc: '複数人が同じ箇所を別々に変更したとき発生する衝突。手動で内容を確認して解決する必要がある。' },
      ]
    },
    textbook: [
      {
        id: 'gch1', title: '第1章：リポジトリの作成と状態確認',
        commands: [
          {
            cmd: 'git init',
            desc: 'カレントディレクトリを Git リポジトリとして初期化します。.git という隠しフォルダが作られ、そこに変更履歴が保存されます。',
            example: '$ git init\nInitialized empty Git repository in /home/user/myproject/.git/'
          },
          {
            cmd: 'git status',
            desc: '変更されたファイルや、ステージング（コミット準備）の状態を確認します。何かする前に必ず確認する習慣をつけましょう。',
            example: '$ git status\nOn branch main\nChanges not staged for commit:\n  modified: main.cpp\nUntracked files:\n  new_file.cpp'
          },
          {
            cmd: 'git log',
            desc: 'コミット履歴を新しい順に表示します。誰が・いつ・何を変えたかを確認できます。',
            example: '$ git log\ncommit abc1234 (HEAD -> main)\nAuthor: Yamada <y@example.com>\nDate:   Mon Jan 1 12:00:00 2024\n\n    Add login feature'
          },
          {
            cmd: 'git diff',
            desc: 'ステージング前の変更内容（前回コミットとの差分）を表示します。- が削除行、+ が追加行です。',
            example: '$ git diff\n-  int x = 1;\n+  int x = 2;'
          }
        ]
      },
      {
        id: 'gch2', title: '第2章：変更を記録する（add と commit）',
        commands: [
          {
            cmd: 'git add',
            desc: '変更をステージングエリア（コミット準備エリア）に追加します。コミットの前に必ず行う手順です。',
            example: '$ git add main.cpp   # 特定ファイルを追加\n$ git add .          # すべての変更を追加\n$ git add -A         # 削除ファイルも含めて追加'
          },
          {
            cmd: 'git commit -m',
            desc: 'ステージした変更を「セーブポイント」として記録します。-m でコミットメッセージを指定します。',
            example: '$ git commit -m "Add login feature"\n[main abc1234] Add login feature\n 1 file changed, 20 insertions(+)',
            note: 'コミットメッセージのコツ\n「何を変えたか」より「なぜ変えたか」を書くと後から見やすい。\n例: "Add button" より "Fix crash when submit button is clicked"'
          }
        ]
      },
      {
        id: 'gch3', title: '第3章：ブランチ操作',
        commands: [
          {
            cmd: 'git branch',
            desc: 'ブランチの一覧を表示します（* が現在のブランチ）。名前を続けると新規作成になります。',
            example: '$ git branch\n* main\n  feature-login\n\n$ git branch feature-search  # 新規作成'
          },
          {
            cmd: 'git checkout / git switch',
            desc: 'ブランチを切り替えます。checkout は旧コマンド、switch は新しいコマンドですが両方使えます。',
            example: '$ git checkout feature-login   # 旧スタイル\n$ git switch   feature-login   # 新スタイル\n\n# 作成と切り替えを同時に\n$ git checkout -b hotfix\n$ git switch -c hotfix'
          },
          {
            cmd: 'git merge',
            desc: '指定ブランチの変更を現在のブランチに取り込みます。機能ブランチを main に統合するときに使います。',
            example: '$ git checkout main\n$ git merge feature-login\nMerge made by the "recursive" strategy.'
          }
        ]
      },
      {
        id: 'gch4', title: '第4章：リモートリポジトリ（GitHub など）',
        commands: [
          {
            cmd: 'git remote add',
            desc: 'リモートリポジトリを登録します。慣例として "origin" という名前をつけます。',
            example: '$ git remote add origin https://github.com/user/repo.git'
          },
          {
            cmd: 'git push',
            desc: 'ローカルの変更をリモートリポジトリに送信（アップロード）します。',
            example: '$ git push origin main\nTo https://github.com/user/repo.git\n   abc1234..def5678  main -> main'
          },
          {
            cmd: 'git pull',
            desc: 'リモートの変更を取得してローカルにマージします。作業前に必ず実行してチームの変更を反映させましょう。',
            example: '$ git pull\nAlready up to date.\n# または\nUpdating abc1234..def5678'
          },
          {
            cmd: 'git clone',
            desc: 'リモートリポジトリをまるごとローカルにコピーします。GitHub 上のプロジェクトを手元で動かすときに使います。',
            example: '$ git clone https://github.com/user/repo.git\nCloning into "repo"...'
          }
        ]
      },
      {
        id: 'gch5', title: '第5章：便利な操作',
        commands: [
          {
            cmd: 'git commit --amend',
            desc: '直前のコミットのメッセージや内容を修正します。まだ push していないコミットにのみ使うのが原則です。',
            example: '$ git commit --amend\n（エディタが開きメッセージを編集できる）'
          },
          {
            cmd: 'git stash',
            desc: '作業中の変更を一時退避します。コミットせずにブランチを切り替えたいときに便利です。',
            example: '$ git stash\nSaved working directory and index state WIP on main\n\n$ git stash pop  # 退避した変更を取り出す'
          },
          {
            cmd: 'git tag',
            desc: 'コミットにタグをつけます。バージョン番号（v1.0 など）の管理によく使われます。',
            example: '$ git tag v1.0\n$ git tag       # タグ一覧を表示'
          }
        ]
      }
    ],
    problems: [
      { id: 'g01', title: 'リポジトリ初期化',
        question: '現在のディレクトリを Git リポジトリとして初期化するコマンドは？',
        answers: ['git init'], hint: 'initialize' },
      { id: 'g02', title: '状態確認',
        question: 'ファイルの変更状態を確認するコマンドは？',
        answers: ['git status'], hint: '' },
      { id: 'g03', title: 'ファイルをステージング',
        question: '"main.cpp" をステージングエリアに追加するコマンドは？',
        answers: ['git add main.cpp'], hint: '' },
      { id: 'g04', title: '全ファイルをステージング',
        question: '変更されたすべてのファイルをステージングするコマンドは？',
        answers: ['git add .', 'git add -A'], hint: '' },
      { id: 'g05', title: 'コミット',
        question: '"first commit" というメッセージでコミットするコマンドは？',
        answers: ['git commit -m "first commit"', "git commit -m 'first commit'"], hint: '-m でメッセージを指定する' },
      { id: 'g06', title: 'ログ確認',
        question: 'コミット履歴を表示するコマンドは？',
        answers: ['git log'], hint: '' },
      { id: 'g07', title: '差分確認',
        question: 'ステージング前の変更内容を確認するコマンドは？',
        answers: ['git diff'], hint: 'difference' },
      { id: 'g08', title: 'ブランチ一覧',
        question: 'ブランチの一覧を表示するコマンドは？',
        answers: ['git branch'], hint: '' },
      { id: 'g09', title: 'ブランチ作成',
        question: '"feature" という名前のブランチを作成するコマンドは？',
        answers: ['git branch feature'], hint: '' },
      { id: 'g10', title: 'ブランチ切り替え',
        question: '"feature" ブランチに切り替えるコマンドは？',
        answers: ['git checkout feature', 'git switch feature'], hint: 'checkout または switch' },
      { id: 'g11', title: '作成して切り替え',
        question: '"hotfix" ブランチを作成して同時に切り替えるコマンドは？',
        answers: ['git checkout -b hotfix', 'git switch -c hotfix'], hint: '-b または -c オプションを使う' },
      { id: 'g12', title: 'マージ',
        question: '"feature" ブランチを現在のブランチにマージするコマンドは？',
        answers: ['git merge feature'], hint: '' },
      { id: 'g13', title: 'リモート追加',
        question: 'リモートリポジトリを "origin" という名前で登録するコマンドは？（URL は https://example.com/repo.git）',
        answers: ['git remote add origin https://example.com/repo.git'], hint: 'remote add を使う' },
      { id: 'g14', title: 'プッシュ',
        question: 'main ブランチを origin にプッシュするコマンドは？',
        answers: ['git push origin main', 'git push'], hint: '' },
      { id: 'g15', title: 'プル',
        question: 'リモートの変更を取得してマージするコマンドは？',
        answers: ['git pull', 'git pull origin main'], hint: '' },
      { id: 'g16', title: 'クローン',
        question: '"https://example.com/repo.git" をローカルにクローンするコマンドは？',
        answers: ['git clone https://example.com/repo.git'], hint: '' },
      { id: 'g17', title: '直前のコミットを修正',
        question: '直前のコミットメッセージを修正するコマンドは？',
        answers: ['git commit --amend'], hint: '--amend オプション' },
      { id: 'g18', title: '変更を一時退避',
        question: '作業中の変更を一時的に退避させるコマンドは？',
        answers: ['git stash'], hint: 'stash = 隠す・しまう' },
      { id: 'g19', title: '退避した変更を戻す',
        question: 'git stash で退避した最新の変更を取り出すコマンドは？',
        answers: ['git stash pop'], hint: 'pop で取り出す' },
      { id: 'g20', title: 'タグを付ける',
        question: '現在のコミットに "v1.0" というタグを付けるコマンドは？',
        answers: ['git tag v1.0'], hint: 'tag コマンドを使う' },
    ]
  },

  // ===== Docker =====
  {
    id: 'docker',
    name: 'Docker',
    icon: '🐳',
    color: '#2496ED',
    desc: 'コンテナ作成・起動・管理の基本コマンドと Dockerfile を学ぶ',
    guide: {
      what: 'Docker（ドッカー）は、アプリを「コンテナ」という軽量な仮想環境にまとめて動かすツールです。コンテナを使うと「自分のPCでは動くのにサーバーでは動かない」という問題をなくせます。2013年リリース後、急速に普及し現在のWebエンジニアには欠かせないツールになっています。',
      why: 'クラウド（AWS・GCP・Azure）やCI/CDではDockerがほぼ必須です。開発環境を簡単にチームで共有でき、どのOSでも同じ動作が保証されます。バックエンド・インフラ・MLOps問わず多くの職種で求められます。',
      concepts: [
        { term: 'コンテナ',     desc: '独立した軽量な実行環境。ホストOSのカーネルを共有しつつプロセスとファイルシステムを分離する。' },
        { term: 'イメージ',     desc: 'コンテナの設計図（テンプレート）。Dockerfileでビルドするか Docker Hub からpullして使う。' },
        { term: 'Dockerfile',   desc: 'イメージを作る手順書ファイル。FROM・RUN・COPYなどの命令を並べて記述する。' },
        { term: 'Docker Hub',   desc: 'Dockerイメージの公式リポジトリ。nginx・mysql・nodeなど公式イメージを無料で使える。' },
        { term: 'ボリューム',   desc: 'コンテナとホスト間でデータを共有・永続化する仕組み。コンテナ削除後もデータが残る。' },
        { term: 'ポートマッピング', desc: 'ホストのポートとコンテナのポートを繋ぐ設定。-p 8080:80 でホスト8080→コンテナ80に転送。' },
        { term: 'Docker Compose', desc: '複数コンテナをyamlで定義・管理するツール。Web + DBなど複数サービスをまとめて起動できる。' },
        { term: 'レジストリ',   desc: 'Dockerイメージを保存・配布するサーバー。Docker Hub・GitHub Container Registry・ECRなど。' },
      ]
    },
    textbook: [
      {
        id: 'dch1', title: '第1章：イメージの取得と確認',
        commands: [
          {
            cmd: 'docker pull',
            desc: 'Docker Hubからイメージをダウンロードします。タグ未指定の場合は latest が取得されます。',
            example: '$ docker pull nginx\nUsing default tag: latest\nStatus: Downloaded newer image for nginx:latest\n\n$ docker pull node:20-alpine  # バージョン指定'
          },
          {
            cmd: 'docker images',
            desc: 'ローカルに保存されているイメージの一覧を表示します。',
            example: '$ docker images\nREPOSITORY  TAG     IMAGE ID     CREATED    SIZE\nnginx       latest  abc1234def   2 days ago  187MB\nnode        20      xyz5678ghi   3 days ago  135MB'
          }
        ]
      },
      {
        id: 'dch2', title: '第2章：コンテナの起動と管理',
        commands: [
          {
            cmd: 'docker run',
            desc: 'イメージからコンテナを作成して起動します。最もよく使うコマンドです。',
            example: '$ docker run nginx              # フォアグラウンド\n$ docker run -d nginx           # バックグラウンド\n$ docker run -d -p 8080:80 nginx # ポート公開\n$ docker run -d --name web nginx  # 名前をつける\n$ docker run --rm nginx          # 終了時に自動削除',
            note: 'よく使うオプション\n  -d          → バックグラウンドで起動\n  -p ホスト:内 → ポートフォワーディング\n  --name 名前  → コンテナに名前をつける\n  -it         → インタラクティブモード\n  -v ホスト:内 → ボリュームをマウント\n  --rm        → 終了時に自動削除'
          },
          {
            cmd: 'docker ps',
            desc: '実行中のコンテナ一覧を表示します。-a で停止中も含めて表示します。',
            example: '$ docker ps\nCONTAINER ID  IMAGE  STATUS  PORTS           NAMES\nabc123        nginx  Up 1m   0.0.0.0:80->80  web\n\n$ docker ps -a  # 停止中も表示'
          },
          {
            cmd: 'docker stop / start / restart',
            desc: 'コンテナを停止・起動・再起動します。stop はグレースフルに停止します。',
            example: '$ docker stop web\n$ docker start web\n$ docker restart web'
          },
          {
            cmd: 'docker rm',
            desc: 'コンテナを削除します。停止後に削除するのが基本です。prune で停止中を一括削除できます。',
            example: '$ docker rm web\n$ docker rm -f web          # 強制削除（起動中でも）\n$ docker container prune    # 停止中を一括削除'
          },
          {
            cmd: 'docker exec',
            desc: '実行中のコンテナ内でコマンドを実行します。-it /bin/bash でシェルに入れます。',
            example: '$ docker exec web ls /etc/nginx\n$ docker exec -it web /bin/bash\nroot@abc123:/#'
          },
          {
            cmd: 'docker logs',
            desc: 'コンテナのログを表示します。-f でリアルタイムに追いかけられます。',
            example: '$ docker logs web\n$ docker logs -f web        # リアルタイム\n$ docker logs --tail 50 web # 最新50行'
          }
        ]
      },
      {
        id: 'dch3', title: '第3章：Dockerfile とイメージのビルド',
        commands: [
          {
            cmd: 'Dockerfile の書き方',
            desc: 'FROM で基底イメージを指定し、RUN でコマンド実行、COPY でファイルをコピーします。CMD は起動時のデフォルトコマンドです。',
            example: 'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]'
          },
          {
            cmd: 'docker build',
            desc: 'Dockerfile からイメージをビルドします。-t でイメージ名とタグを指定、末尾の . はビルドコンテキストを示します。',
            example: '$ docker build -t myapp:1.0 .\n[1/4] FROM node:20-alpine\n[2/4] RUN npm install\n...\nSuccessfully built abc1234ef56'
          },
          {
            cmd: 'docker rmi',
            desc: '不要なイメージを削除します。使用中のイメージは削除できません。',
            example: '$ docker rmi myapp:1.0\n$ docker image prune   # タグのないイメージを一括削除'
          }
        ]
      },
      {
        id: 'dch4', title: '第4章：Docker Compose',
        commands: [
          {
            cmd: 'docker-compose.yml',
            desc: '複数コンテナをまとめて管理するYAMLファイル。services・volumes・networksを定義します。',
            example: 'services:\n  web:\n    image: nginx\n    ports:\n      - "8080:80"\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - db-data:/var/lib/postgresql/data\nvolumes:\n  db-data:'
          },
          {
            cmd: 'docker compose up / down',
            desc: 'Composeで定義したサービスをまとめて起動・停止します。',
            example: '$ docker compose up -d     # バックグラウンドで全サービス起動\n$ docker compose down      # 停止してコンテナ削除\n$ docker compose down -v   # ボリュームも削除'
          },
          {
            cmd: 'docker compose ps / logs',
            desc: 'Composeで管理しているサービスの状態とログを確認します。',
            example: '$ docker compose ps\nNAME  SERVICE  STATUS\nweb   web      running\ndb    db       running\n\n$ docker compose logs -f web'
          }
        ]
      }
    ],
    problems: [
      { id: 'd01', title: 'イメージの取得',
        question: 'Docker Hub から "nginx" の最新イメージをダウンロードするコマンドは？',
        answers: ['docker pull nginx'], hint: 'pull コマンドを使う' },
      { id: 'd02', title: 'イメージ一覧',
        question: 'ローカルのイメージ一覧を表示するコマンドは？',
        answers: ['docker images', 'docker image ls'], hint: 'images コマンドを使う' },
      { id: 'd03', title: 'バックグラウンド起動',
        question: '"nginx" イメージをバックグラウンドで起動するコマンドは？',
        answers: ['docker run -d nginx'], hint: '-d オプションでバックグラウンド' },
      { id: 'd04', title: 'ポートフォワーディング',
        question: '"nginx" をホストの8080番ポートでアクセスできるようバックグラウンド起動するコマンドは？',
        answers: ['docker run -d -p 8080:80 nginx'], hint: '-p ホスト:コンテナ' },
      { id: 'd05', title: 'コンテナ一覧',
        question: '実行中のコンテナ一覧を表示するコマンドは？',
        answers: ['docker ps'], hint: 'ps コマンドを使う' },
      { id: 'd06', title: '停止中も表示',
        question: '停止中を含むすべてのコンテナを表示するコマンドは？',
        answers: ['docker ps -a', 'docker ps --all'], hint: '-a オプション（all）' },
      { id: 'd07', title: 'コンテナの停止',
        question: '"web" という名前のコンテナを停止するコマンドは？',
        answers: ['docker stop web'], hint: 'stop コマンドを使う' },
      { id: 'd08', title: 'コンテナの削除',
        question: '"web" という名前の停止済みコンテナを削除するコマンドは？',
        answers: ['docker rm web'], hint: 'rm コマンドを使う' },
      { id: 'd09', title: 'シェル接続',
        question: '実行中の "web" コンテナに bash でシェル接続するコマンドは？',
        answers: ['docker exec -it web bash', 'docker exec -it web /bin/bash'], hint: 'exec -it を使う' },
      { id: 'd10', title: 'ログのリアルタイム確認',
        question: '"web" コンテナのログをリアルタイムで表示するコマンドは？',
        answers: ['docker logs -f web'], hint: '-f オプション（follow）' },
      { id: 'd11', title: 'イメージのビルド',
        question: 'カレントディレクトリの Dockerfile から "myapp:1.0" という名前でビルドするコマンドは？',
        answers: ['docker build -t myapp:1.0 .'], hint: 'build -t でタグを指定、末尾は .' },
      { id: 'd12', title: 'イメージの削除',
        question: '"myapp:1.0" イメージを削除するコマンドは？',
        answers: ['docker rmi myapp:1.0', 'docker image rm myapp:1.0'], hint: 'rmi コマンドを使う' },
      { id: 'd13', title: '名前をつけて起動',
        question: '"nginx" を "web" という名前でバックグラウンド起動するコマンドは？',
        answers: ['docker run -d --name web nginx'], hint: '--name オプションで名前を指定' },
      { id: 'd14', title: 'Compose 起動',
        question: 'docker-compose.yml のサービスをバックグラウンドで起動するコマンドは？',
        answers: ['docker compose up -d', 'docker-compose up -d'], hint: 'compose up -d' },
      { id: 'd15', title: 'Compose 停止・削除',
        question: 'Compose で起動したコンテナを停止して削除するコマンドは？',
        answers: ['docker compose down', 'docker-compose down'], hint: 'compose down' },
      { id: 'd16', title: 'ボリュームマウント',
        question: 'ホストの "./data" をコンテナの "/app/data" にマウントして nginx を起動するコマンドは？',
        answers: ['docker run -v ./data:/app/data nginx'], hint: '-v ホスト:コンテナ' },
      { id: 'd17', title: 'コンテナ内コマンド実行',
        question: '実行中の "db" コンテナで "ls /var/lib" を実行するコマンドは？',
        answers: ['docker exec db ls /var/lib'], hint: 'exec コマンドを使う' },
      { id: 'd18', title: 'イメージのプッシュ',
        question: '"myapp:1.0" イメージを Docker Hub にプッシュするコマンドは？',
        answers: ['docker push myapp:1.0'], hint: 'push コマンドを使う' },
      { id: 'd19', title: '停止中コンテナの一括削除',
        question: '停止中のコンテナをすべて削除するコマンドは？',
        answers: ['docker container prune'], hint: 'prune コマンドを使う' },
      { id: 'd20', title: 'Compose サービスのログ',
        question: 'Compose の "web" サービスのログをリアルタイムで表示するコマンドは？',
        answers: ['docker compose logs -f web', 'docker-compose logs -f web'], hint: 'compose logs -f を使う' },
    ]
  },

  // ===== Vim =====
  {
    id: 'vim',
    name: 'Vim',
    icon: '✍️',
    color: '#019733',
    desc: 'サーバー作業に必須のエディタ。モード切替・移動・編集・保存を覚える',
    guide: {
      what: 'Vim（ヴィム）は、ターミナル上で動くテキストエディタです。サーバー上でのファイル編集に欠かせないツールで、vi のクローンとして1991年に誕生しました。マウスを使わずキーボードだけで高速に操作できるのが特徴ですが、独特の「モード」という概念があり、最初は戸惑う人が多いエディタです。',
      why: 'SSHでサーバーに接続したとき、GUIエディタは使えません。そのときVimやnano等のCLIエディタが必要になります。特にVimはほぼすべてのLinux/Unixシステムに標準搭載されているので、最低限の操作方法を知っていれば「どのサーバーでも作業できる」状態になれます。',
      concepts: [
        { term: 'ノーマルモード', desc: 'Vim起動時のデフォルトモード。コマンドや移動に使う。ESCキーでどこからでも戻れる。' },
        { term: 'インサートモード', desc: 'テキストを入力するモード。i・a・o などのキーで入る。iはカーソル前、aはカーソル後に挿入。' },
        { term: 'ビジュアルモード', desc: 'テキストを選択するモード。v で文字選択、V で行選択、Ctrl+V でブロック選択。' },
        { term: 'コマンドモード', desc: '「:」を押して入るモード。保存・終了・検索などの操作ができる。' },
        { term: 'バッファ',   desc: '編集中のファイルが載っている一時領域。:w で保存、:q で終了。' },
        { term: 'レジスタ',   desc: 'コピー・切り取りしたテキストを保存する場所。y でヤンク（コピー）、p でペーストする。' },
        { term: '繰り返し',   desc: '数字+コマンドで繰り返せる。例: 5dd で5行削除、3j で3行下に移動。' },
        { term: '.ドットコマンド', desc: '. を押すと直前の操作を繰り返せる。何度も同じ編集をするときに便利。' },
      ]
    },
    textbook: [
      {
        id: 'vch1', title: '第1章：起動・終了とモードの基本',
        commands: [
          {
            cmd: 'vim [ファイル名]',
            desc: 'Vim でファイルを開きます。ファイルが存在しない場合は新規作成されます。',
            example: '$ vim hello.txt\n$ vim /etc/nginx/nginx.conf'
          },
          {
            cmd: 'モードの切り替え',
            desc: 'Vim はモードによって同じキーでも動作が変わります。まずESCでノーマルモードに戻る癖をつけましょう。',
            example: 'i    → インサートモード（カーソル前に挿入）\na    → インサートモード（カーソル後に挿入）\no    → 次の行を作ってインサートモード\nESC  → ノーマルモードに戻る\nv    → ビジュアルモード（文字選択）\nV    → ビジュアルモード（行選択）\n:    → コマンドモード'
          },
          {
            cmd: ':w / :q / :wq / :q!',
            desc: 'コマンドモードでの保存・終了コマンドです。:wq または ZZ で保存して終了します。',
            example: ':w       → 保存\n:q       → 終了（変更なしのとき）\n:wq      → 保存して終了\n:q!      → 変更を破棄して強制終了\n:w ファイル → 別名保存'
          }
        ]
      },
      {
        id: 'vch2', title: '第2章：カーソル移動',
        commands: [
          {
            cmd: '基本移動（hjkl）',
            desc: 'ノーマルモードで h/j/k/l で左下上右に移動します。矢印キーでも動きますが、hjkl が Vim らしい使い方です。',
            example: 'h → 左\nj → 下\nk → 上\nl → 右\n\n# 数字を前につけると繰り返し\n5j → 5行下に移動\n10l → 10文字右に移動'
          },
          {
            cmd: '単語・行・ファイル単位の移動',
            desc: 'より大きな単位で素早く移動できます。',
            example: 'w  → 次の単語の先頭へ\nb  → 前の単語の先頭へ\n0  → 行頭へ\n$  → 行末へ\ngg → ファイルの先頭へ\nG  → ファイルの末尾へ\n:5 → 5行目へジャンプ'
          }
        ]
      },
      {
        id: 'vch3', title: '第3章：テキストの編集',
        commands: [
          {
            cmd: '削除コマンド',
            desc: 'ノーマルモードで x・dd・dw などで削除できます。削除したテキストはレジスタに保存されpで貼り付けられます。',
            example: 'x   → カーソル上の1文字削除\ndd  → 現在行を削除\n5dd → 5行削除\ndw  → カーソルから単語末尾まで削除\nD   → カーソルから行末まで削除'
          },
          {
            cmd: 'コピーと貼り付け',
            desc: 'Vimではコピーを「ヤンク」（yank）と呼びます。',
            example: 'yy  → 現在行をヤンク（コピー）\n5yy → 5行ヤンク\nyw  → 単語をヤンク\np   → カーソルの後に貼り付け\nP   → カーソルの前に貼り付け'
          },
          {
            cmd: '取り消しとやり直し',
            desc: 'u で操作を取り消し（Ctrl+Z のような動き）、Ctrl+R でやり直します。',
            example: 'u      → 直前の操作を取り消し（undo）\nCtrl+R → やり直し（redo）\n.      → 直前の操作を繰り返す'
          }
        ]
      },
      {
        id: 'vch4', title: '第4章：検索と置換',
        commands: [
          {
            cmd: '検索',
            desc: 'ノーマルモードで / を押してから検索語を入力します。n で次の一致へ、N で前の一致へ移動します。',
            example: '/error     → "error" を検索\nn          → 次の一致へ\nN          → 前の一致へ\n?error     → 逆方向に検索'
          },
          {
            cmd: '置換（:s コマンド）',
            desc: 'コマンドモードで :s（substitute）を使って置換します。',
            example: ':s/old/new/     → 現在行の最初の一致を置換\n:s/old/new/g    → 現在行のすべての一致を置換\n:%s/old/new/g   → ファイル全体で置換\n:%s/old/new/gc  → 全体置換（確認あり）'
          }
        ]
      }
    ],
    problems: [
      { id: 'v01', title: 'ファイルを開く',
        question: 'Vim で "config.txt" を開くコマンドは？',
        answers: ['vim config.txt'], hint: 'vim コマンドを使う' },
      { id: 'v02', title: '保存して終了',
        question: 'Vim で変更を保存してエディタを終了するコマンド（コマンドモード）は？',
        answers: [':wq', ':x', 'ZZ'], hint: ':w（保存）と :q（終了）を組み合わせる' },
      { id: 'v03', title: '変更を捨てて終了',
        question: 'Vim で変更を保存せず強制終了するコマンドは？',
        answers: [':q!'], hint: ':q に ! をつける' },
      { id: 'v04', title: 'インサートモードに入る',
        question: 'ノーマルモードからカーソル位置の前にテキストを入力するモードに切り替えるキーは？',
        answers: ['i'], hint: 'insert の頭文字' },
      { id: 'v05', title: 'ノーマルモードに戻る',
        question: 'インサートモードからノーマルモードに戻るキーは？',
        answers: ['ESC', 'Escape'], hint: '左上のキー' },
      { id: 'v06', title: '現在行を削除',
        question: 'ノーマルモードで現在行を丸ごと削除するコマンドは？',
        answers: ['dd'], hint: 'd を2回押す' },
      { id: 'v07', title: '現在行をコピー',
        question: 'ノーマルモードで現在行をヤンク（コピー）するコマンドは？',
        answers: ['yy'], hint: 'y を2回押す（yank）' },
      { id: 'v08', title: '貼り付け',
        question: 'ノーマルモードでヤンクしたテキストをカーソルの後に貼り付けるキーは？',
        answers: ['p'], hint: 'paste の頭文字' },
      { id: 'v09', title: 'undo',
        question: 'ノーマルモードで直前の操作を取り消す（undo）キーは？',
        answers: ['u'], hint: 'undo の頭文字' },
      { id: 'v10', title: 'ファイルの末尾へ移動',
        question: 'ノーマルモードでファイルの末尾に移動するキーは？',
        answers: ['G'], hint: '大文字のG' },
      { id: 'v11', title: 'ファイルの先頭へ移動',
        question: 'ノーマルモードでファイルの先頭に移動するコマンドは？',
        answers: ['gg'], hint: 'g を2回押す' },
      { id: 'v12', title: '検索',
        question: 'ノーマルモードで "error" という文字列を前方検索するコマンドは？',
        answers: ['/error'], hint: '/ を押してから検索語を入力' },
      { id: 'v13', title: '次の検索結果',
        question: '検索後、次の一致箇所に移動するキーは？',
        answers: ['n'], hint: 'next の頭文字' },
      { id: 'v14', title: '一文字削除',
        question: 'ノーマルモードでカーソル上の1文字を削除するキーは？',
        answers: ['x'], hint: '消しゴムのイメージ' },
      { id: 'v15', title: 'ファイル全体を置換',
        question: 'ファイル全体の "foo" を "bar" に置換するコマンド（コマンドモード）は？',
        answers: [':%s/foo/bar/g'], hint: '%s/検索/置換/g' },
      { id: 'v16', title: '行を追加してインサートモード',
        question: 'ノーマルモードで現在行の次に新しい行を挿入してインサートモードに入るキーは？',
        answers: ['o'], hint: 'open の頭文字' },
      { id: 'v17', title: '5行削除',
        question: 'ノーマルモードで5行まとめて削除するコマンドは？',
        answers: ['5dd'], hint: '数字+dd で繰り返す' },
      { id: 'v18', title: '行末へ移動',
        question: 'ノーマルモードで行末に移動するキーは？',
        answers: ['$'], hint: '正規表現の行末と同じ' },
      { id: 'v19', title: '行頭へ移動',
        question: 'ノーマルモードで行頭（最初の文字）に移動するキーは？',
        answers: ['0'], hint: 'ゼロキー' },
      { id: 'v20', title: '保存のみ',
        question: '終了せずにファイルを保存するだけのコマンドは？',
        answers: [':w'], hint: 'write の頭文字' },
    ]
  },

  // ===== ネットワーク =====
  {
    id: 'network',
    name: 'ネットワーク',
    icon: '🌐',
    color: '#0EA5E9',
    desc: 'ping・curl・ssh・dig など通信確認と接続に使うコマンドを学ぶ',
    guide: {
      what: 'ネットワークコマンドとは、ターミナルからネットワーク通信の確認・接続・診断を行うコマンド群です。Webエンジニアやインフラエンジニアがサーバーのトラブルシューティングや外部APIの確認をするときに日常的に使います。',
      why: 'サーバーが繋がらない・APIが返ってこない・DNSがおかしいといった問題を解決するには、ネットワークコマンドの知識が必須です。インフラ・セキュリティ・バックエンドの職種で特に重要ですが、フロントエンドエンジニアも知っておくと役立ちます。',
      concepts: [
        { term: 'IPアドレス',  desc: 'ネットワーク上のデバイスを識別する番号。IPv4（例: 192.168.1.1）とIPv6がある。' },
        { term: 'ポート',      desc: 'アプリケーションごとに割り当てられた番号。HTTP=80, HTTPS=443, SSH=22 など。' },
        { term: 'DNS',         desc: 'ドメイン名（example.com）をIPアドレスに変換する仕組み。電話帳のようなもの。' },
        { term: 'TCP/IP',      desc: 'インターネット通信の基本プロトコル。TCPは信頼性重視、UDPは速度重視。' },
        { term: 'HTTP/HTTPS',  desc: 'WebブラウザとサーバーのデータやりとりのプロトコルHTTPSはSSL/TLS暗号化あり。' },
        { term: 'SSH',         desc: 'リモートサーバーに安全に接続するプロトコル。公開鍵認証でパスワードなしでもログインできる。' },
        { term: 'ファイアウォール', desc: '不正な通信をブロックする仕組み。特定のポートやIPアドレスへのアクセスを制御する。' },
        { term: 'ローカルホスト', desc: '自分自身のマシンを指す。127.0.0.1 または localhost という名前でアクセスできる。' },
      ]
    },
    textbook: [
      {
        id: 'nch1', title: '第1章：接続確認コマンド',
        commands: [
          {
            cmd: 'ping',
            desc: '指定したホストが到達可能かどうか確認します。ICMPパケットを送って応答時間を計測します。',
            example: '$ ping google.com\nPING google.com (142.250.196.14)\n64 bytes from 142.250.196.14: icmp_seq=1 ttl=117 time=12.3 ms\n64 bytes from 142.250.196.14: icmp_seq=2 ttl=117 time=11.8 ms\n^C  # Ctrl+C で停止'
          },
          {
            cmd: 'traceroute / tracert',
            desc: '宛先ホストまでの経路を表示します。どこで遅延が発生しているか調べるのに使います。Linux: traceroute、Windows: tracert。',
            example: '$ traceroute google.com\n1  192.168.1.1  1ms\n2  xxx.provider.com  5ms\n3  ...\n10 142.250.196.14  12ms'
          },
          {
            cmd: 'ss / netstat',
            desc: 'ネットワーク接続やリッスン中のポート一覧を表示します。ss は netstat の後継コマンドです。',
            example: '$ ss -tuln\nNetid State  Recv-Q Send-Q  Local Address:Port\ntcp   LISTEN 0      128     0.0.0.0:22\ntcp   LISTEN 0      128     0.0.0.0:80\n\n$ netstat -tuln  # 古いシステムではこちら'
          }
        ]
      },
      {
        id: 'nch2', title: '第2章：HTTP通信（curl）',
        commands: [
          {
            cmd: 'curl',
            desc: 'URLにHTTPリクエストを送ってレスポンスを取得します。APIのテストやファイルダウンロードに使います。',
            example: '$ curl https://api.example.com/users\n{"users": [...]}\n\n$ curl -o output.html https://example.com  # ファイルに保存\n$ curl -I https://example.com             # ヘッダのみ表示',
            note: 'よく使うオプション\n  -X POST           → POSTリクエスト\n  -H "Key: Value"   → ヘッダを追加\n  -d "body"         → リクエストボディ\n  -o ファイル名     → レスポンスをファイルに保存\n  -I                → ヘッダのみ取得\n  -L                → リダイレクト先を追跡\n  -s                → 進捗を非表示（silent）'
          },
          {
            cmd: 'wget',
            desc: 'ファイルをURLからダウンロードします。curl より単純なダウンロード向きです。',
            example: '$ wget https://example.com/file.zip\n$ wget -O myfile.zip https://example.com/file.zip  # 名前を指定'
          }
        ]
      },
      {
        id: 'nch3', title: '第3章：リモート接続（SSH）',
        commands: [
          {
            cmd: 'ssh',
            desc: 'リモートサーバーに安全に接続します。エンジニアが最もよく使うネットワークコマンドの一つです。',
            example: '$ ssh user@192.168.1.10         # IPアドレスで接続\n$ ssh user@example.com          # ドメインで接続\n$ ssh -p 2222 user@example.com  # ポート指定\n$ ssh -i ~/.ssh/id_rsa user@example.com  # 秘密鍵指定'
          },
          {
            cmd: 'scp',
            desc: 'SSH経由でファイルをリモートサーバーとの間でコピーします（secure copy）。',
            example: '# ローカル→リモート\n$ scp file.txt user@example.com:/home/user/\n\n# リモート→ローカル\n$ scp user@example.com:/home/user/file.txt ./\n\n# ディレクトリをまとめてコピー\n$ scp -r mydir/ user@example.com:/home/user/'
          }
        ]
      },
      {
        id: 'nch4', title: '第4章：DNS・アドレス確認',
        commands: [
          {
            cmd: 'dig / nslookup',
            desc: 'DNSクエリを送り、ドメインのIPアドレスやDNSレコードを調べます。dig は詳細な情報が得られます。',
            example: '$ dig google.com\n;; ANSWER SECTION:\ngoogle.com. 300 IN A 142.250.196.14\n\n$ dig google.com MX    # MXレコード（メール）を調べる\n$ nslookup google.com  # シンプルなDNS確認'
          },
          {
            cmd: 'ip addr / ifconfig',
            desc: '自分のマシンのIPアドレスやネットワークインターフェイスを確認します。ip addr が新しいコマンドです。',
            example: '$ ip addr\n2: eth0: <BROADCAST> mtu 1500\n  inet 192.168.1.100/24 brd 192.168.1.255\n\n$ ifconfig  # 古いシステムではこちら'
          }
        ]
      }
    ],
    problems: [
      { id: 'n01', title: '疎通確認',
        question: '"google.com" が到達可能かどうか確認するコマンドは？',
        answers: ['ping google.com'], hint: 'ping コマンドを使う' },
      { id: 'n02', title: 'HTTPリクエスト',
        question: '"https://api.example.com" に GET リクエストを送るコマンドは？',
        answers: ['curl https://api.example.com'], hint: 'curl コマンドを使う' },
      { id: 'n03', title: 'SSH接続',
        question: '"user" として "192.168.1.10" のサーバーに SSH 接続するコマンドは？',
        answers: ['ssh user@192.168.1.10'], hint: 'ssh ユーザー@ホスト' },
      { id: 'n04', title: 'ファイルのダウンロード',
        question: '"https://example.com/file.zip" をダウンロードするコマンドは？（2つのどちらでも可）',
        answers: ['wget https://example.com/file.zip', 'curl -O https://example.com/file.zip'], hint: 'wget または curl -O を使う' },
      { id: 'n05', title: 'リッスンポート確認',
        question: 'リッスン中のTCPポート一覧を表示するコマンドは？',
        answers: ['ss -tuln', 'netstat -tuln'], hint: 'ss または netstat に -tuln をつける' },
      { id: 'n06', title: 'DNS確認',
        question: '"google.com" のIPアドレスを DNS で調べるコマンドは？',
        answers: ['dig google.com', 'nslookup google.com'], hint: 'dig または nslookup を使う' },
      { id: 'n07', title: 'IPアドレスの確認',
        question: '自分のマシンの IP アドレスを確認するコマンドは？',
        answers: ['ip addr', 'ip addr show', 'ifconfig'], hint: 'ip addr または ifconfig を使う' },
      { id: 'n08', title: 'ルート経路確認',
        question: '"google.com" までのネットワーク経路を表示するコマンドは？',
        answers: ['traceroute google.com'], hint: 'traceroute コマンドを使う' },
      { id: 'n09', title: 'ヘッダのみ取得',
        question: '"https://example.com" の HTTP レスポンスヘッダだけを取得する curl コマンドは？',
        answers: ['curl -I https://example.com'], hint: '-I オプション（大文字のI）' },
      { id: 'n10', title: 'SSH ポート指定',
        question: '"user@example.com" にポート 2222 で SSH 接続するコマンドは？',
        answers: ['ssh -p 2222 user@example.com'], hint: '-p でポート番号を指定' },
      { id: 'n11', title: 'ファイルをサーバーへ送る',
        question: '"file.txt" を "user@example.com" の "/home/user/" へ SCP で送るコマンドは？',
        answers: ['scp file.txt user@example.com:/home/user/'], hint: 'scp ローカル ユーザー@ホスト:リモートパス' },
      { id: 'n12', title: 'POST リクエスト',
        question: '"https://api.example.com/data" に JSON データ \'{"key":"val"}\' を POST する curl コマンドは？',
        answers: ['curl -X POST -H "Content-Type: application/json" -d \'{"key":"val"}\' https://api.example.com/data'], hint: '-X POST -H -d を使う' },
      { id: 'n13', title: 'curlで保存',
        question: '"https://example.com/file.zip" を "out.zip" という名前で保存する curl コマンドは？',
        answers: ['curl -o out.zip https://example.com/file.zip'], hint: '-o ファイル名 で保存' },
      { id: 'n14', title: 'MXレコード確認',
        question: '"example.com" のメールサーバー（MXレコード）を確認する dig コマンドは？',
        answers: ['dig example.com MX'], hint: 'dig ドメイン レコードタイプ' },
      { id: 'n15', title: 'SCP でダウンロード',
        question: '"user@example.com" の "/etc/nginx/nginx.conf" をカレントディレクトリにダウンロードするコマンドは？',
        answers: ['scp user@example.com:/etc/nginx/nginx.conf ./'], hint: 'scp リモート ローカルパス' },
    ]
  },

  // ===== npm =====
  {
    id: 'npm',
    name: 'npm',
    icon: '📦',
    color: '#CB3837',
    desc: 'JavaScriptのパッケージ管理・スクリプト実行・プロジェクト初期化を学ぶ',
    guide: {
      what: 'npm（Node Package Manager）は、JavaScript/Node.jsのパッケージ（ライブラリ）を管理するツールです。Node.jsに付属して自動インストールされます。React・TypeScript・Expressなど、JavaScriptエコシステムの膨大なパッケージをコマンド一つで追加できます。世界最大のパッケージレジストリで200万以上のパッケージが公開されています。',
      why: 'フロントエンド・バックエンド問わずJavaScript/TypeScript開発ではnpmが必須です。Reactアプリの作成・ビルド・テスト実行・開発サーバー起動など、あらゆる操作をnpmコマンド経由で行います。npmの代替としてyarn・pnpmもありますが、コマンド体系は似ています。',
      concepts: [
        { term: 'package.json', desc: 'プロジェクトの設定ファイル。依存パッケージ一覧・スクリプト・バージョンなどを記述する。' },
        { term: 'node_modules', desc: 'インストールされたパッケージが入るフォルダ。巨大になるためgitignoreに追加する。' },
        { term: 'package-lock.json', desc: 'インストールした全パッケージのバージョンを固定するファイル。これをコミットするとチームで同じ環境を再現できる。' },
        { term: 'dependencies', desc: '本番環境でも必要なパッケージ。npm install で追加すると自動的にここに記録される。' },
        { term: 'devDependencies', desc: '開発時のみ必要なパッケージ（テストツール・ビルドツールなど）。npm install -D で追加する。' },
        { term: 'スクリプト',  desc: 'package.json の scripts セクションに定義するコマンドのショートカット。npm run start などで実行する。' },
        { term: 'グローバルインストール', desc: '-g オプションで全プロジェクトから使えるようにインストールする方法。create-react-app 等のCLIツールに使う。' },
        { term: 'セマンティックバージョニング', desc: 'メジャー.マイナー.パッチ（例: 1.2.3）でバージョンを表す規則。^ はマイナーまで更新を許可する意味。' },
      ]
    },
    textbook: [
      {
        id: 'pch1', title: '第1章：プロジェクトの初期化',
        commands: [
          {
            cmd: 'npm init',
            desc: '新しい Node.js プロジェクトを初期化して package.json を作成します。-y で質問をすべてデフォルトで答えます。',
            example: '$ npm init       # 対話形式でpackage.jsonを作成\n$ npm init -y    # すべてデフォルトでpackage.jsonを作成\n\n# 作成されるpackage.json（例）\n{\n  "name": "myapp",\n  "version": "1.0.0",\n  "scripts": { "test": "echo ok" },\n  "dependencies": {}\n}'
          }
        ]
      },
      {
        id: 'pch2', title: '第2章：パッケージのインストール',
        commands: [
          {
            cmd: 'npm install',
            desc: 'package.json に記載されたパッケージをまとめてインストールします。git clone 後に必ず実行する操作です。',
            example: '$ npm install      # package.jsonの全依存をインストール\n$ npm i            # 省略形'
          },
          {
            cmd: 'npm install [パッケージ名]',
            desc: '特定のパッケージをインストールします。-D で開発用依存に追加、-g でグローバルインストールします。',
            example: '$ npm install react           # 本番依存に追加\n$ npm install -D typescript   # 開発依存に追加\n$ npm install -g typescript   # グローバルインストール\n$ npm install react@18.2.0    # バージョン指定'
          },
          {
            cmd: 'npm uninstall',
            desc: 'パッケージをアンインストールして package.json からも削除します。',
            example: '$ npm uninstall lodash\n$ npm uninstall -D typescript'
          }
        ]
      },
      {
        id: 'pch3', title: '第3章：スクリプトの実行',
        commands: [
          {
            cmd: 'npm run',
            desc: 'package.json の scripts に定義されたコマンドを実行します。start・test は run を省略できます。',
            example: '$ npm run build   # ビルド\n$ npm run dev     # 開発サーバー起動\n$ npm start       # "start" スクリプト（run省略可）\n$ npm test        # "test" スクリプト（run省略可）'
          },
          {
            cmd: 'npx',
            desc: 'インストールせずにパッケージのコマンドを一時的に実行します。プロジェクト作成時によく使います。',
            example: '$ npx create-react-app myapp\n$ npx create-next-app@latest\n$ npx prettier --write .'
          }
        ]
      },
      {
        id: 'pch4', title: '第4章：パッケージの確認・更新',
        commands: [
          {
            cmd: 'npm list',
            desc: 'インストールされているパッケージの一覧を表示します。--depth=0 でトップレベルのみ表示します。',
            example: '$ npm list\n$ npm list --depth=0  # 直接依存のみ表示'
          },
          {
            cmd: 'npm update',
            desc: 'パッケージを package.json に指定された範囲で最新版に更新します。',
            example: '$ npm update          # すべて更新\n$ npm update lodash   # 特定パッケージのみ'
          },
          {
            cmd: 'npm outdated',
            desc: '現在インストールされているバージョンと最新バージョンを比較して表示します。',
            example: '$ npm outdated\nPackage   Current  Wanted  Latest\nreact       18.0.0  18.3.1  18.3.1'
          }
        ]
      }
    ],
    problems: [
      { id: 'p01', title: 'プロジェクト初期化（デフォルト）',
        question: '質問なしで即座に package.json を作成するコマンドは？',
        answers: ['npm init -y', 'npm init --yes'], hint: 'init に -y をつける' },
      { id: 'p02', title: '依存パッケージをインストール',
        question: 'package.json に記載された依存パッケージをまとめてインストールするコマンドは？',
        answers: ['npm install', 'npm i'], hint: 'install コマンドを使う（省略形は i）' },
      { id: 'p03', title: 'パッケージを追加',
        question: '"lodash" を本番依存としてインストールするコマンドは？',
        answers: ['npm install lodash', 'npm i lodash'], hint: 'npm install パッケージ名' },
      { id: 'p04', title: '開発依存として追加',
        question: '"typescript" を開発依存（devDependencies）としてインストールするコマンドは？',
        answers: ['npm install -D typescript', 'npm install --save-dev typescript', 'npm i -D typescript'], hint: '-D または --save-dev オプション' },
      { id: 'p05', title: 'グローバルインストール',
        question: '"typescript" をグローバルにインストールするコマンドは？',
        answers: ['npm install -g typescript', 'npm i -g typescript'], hint: '-g オプション（global）' },
      { id: 'p06', title: 'スクリプト実行',
        question: 'package.json の "build" スクリプトを実行するコマンドは？',
        answers: ['npm run build'], hint: 'npm run スクリプト名' },
      { id: 'p07', title: '開発サーバー起動',
        question: 'package.json の "dev" スクリプトを実行するコマンドは？',
        answers: ['npm run dev'], hint: 'npm run スクリプト名' },
      { id: 'p08', title: 'テスト実行',
        question: 'package.json の "test" スクリプトを実行するコマンドは？（最短形）',
        answers: ['npm test', 'npm t'], hint: 'test は run を省略できる' },
      { id: 'p09', title: 'パッケージの削除',
        question: '"lodash" パッケージをアンインストールするコマンドは？',
        answers: ['npm uninstall lodash', 'npm remove lodash', 'npm rm lodash'], hint: 'uninstall コマンドを使う' },
      { id: 'p10', title: 'インストール済み一覧',
        question: 'トップレベルの依存パッケージ一覧を表示するコマンドは？',
        answers: ['npm list --depth=0', 'npm ls --depth=0'], hint: 'list に --depth=0 をつける' },
      { id: 'p11', title: '一時的にコマンドを実行',
        question: 'インストールせずに "create-react-app myapp" を実行するコマンドは？',
        answers: ['npx create-react-app myapp'], hint: 'npx を使う' },
      { id: 'p12', title: 'バージョン指定インストール',
        question: '"react" のバージョン 18.2.0 をインストールするコマンドは？',
        answers: ['npm install react@18.2.0', 'npm i react@18.2.0'], hint: 'パッケージ名@バージョン' },
      { id: 'p13', title: '最新バージョン確認',
        question: 'インストール済みパッケージの最新バージョンを確認するコマンドは？',
        answers: ['npm outdated'], hint: 'outdated コマンドを使う' },
      { id: 'p14', title: 'パッケージの更新',
        question: 'インストール済みのすべてのパッケージを更新するコマンドは？',
        answers: ['npm update'], hint: 'update コマンドを使う' },
      { id: 'p15', title: 'start の実行',
        question: 'package.json の "start" スクリプトを実行するコマンドは？（最短形）',
        answers: ['npm start'], hint: 'start は run を省略できる' },
    ]
  },

  // ===== Kubernetes =====
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    icon: '☸️',
    color: '#326CE5',
    desc: 'kubectl の基本コマンドでPod・Service・Deploymentを操作する',
    guide: {
      what: 'Kubernetes（クバネティス、K8s）は、複数のコンテナを自動でデプロイ・スケーリング・管理するプラットフォームです。Dockerが「1台のマシンでコンテナを動かすツール」なら、Kubernetesは「複数台のサーバー上で多数のコンテナをオーケストレーションするツール」です。2014年にGoogleが公開し、現在はクラウドネイティブ開発の標準になっています。',
      why: 'クラウド上のサービスではKubernetesはほぼデファクトスタンダードです。AWS（EKS）・GCP（GKE）・Azure（AKS）のいずれもKubernetesをマネージドサービスとして提供しています。インフラ・SRE・MLOpsの職種では特に必須のスキルです。',
      concepts: [
        { term: 'Pod',         desc: 'Kubernetesの最小デプロイ単位。1つ以上のコンテナを含む。同じPodのコンテナはネットワークを共有する。' },
        { term: 'Node',        desc: 'Podが動くサーバー（物理または仮想マシン）。マスターノードとワーカーノードがある。' },
        { term: 'Deployment',  desc: 'Podの数やバージョンを管理するリソース。ローリングアップデートやロールバックができる。' },
        { term: 'Service',     desc: 'Podへのネットワークアクセスを提供する。ClusterIP・NodePort・LoadBalancerの3種類がある。' },
        { term: 'Namespace',   desc: 'リソースを論理的に分離するグループ。開発・ステージング・本番を同じクラスターで分けるのに使う。' },
        { term: 'ConfigMap',   desc: '設定情報をコンテナから分離して管理するリソース。環境変数やファイルとしてPodに渡せる。' },
        { term: 'Secret',      desc: 'パスワードやAPIキーなど機密情報を管理するリソース。Base64エンコードで保存される。' },
        { term: 'kubectl',     desc: 'Kubernetesを操作するCLIツール。get・apply・delete・describe など多数のサブコマンドがある。' },
      ]
    },
    textbook: [
      {
        id: 'kch1', title: '第1章：基本的なリソースの確認',
        commands: [
          {
            cmd: 'kubectl get',
            desc: 'リソースの一覧を表示します。pods・nodes・services・deployments など様々なリソースタイプを指定できます。',
            example: '$ kubectl get pods              # Pod一覧\n$ kubectl get nodes             # Node一覧\n$ kubectl get services          # Service一覧\n$ kubectl get deployments       # Deployment一覧\n$ kubectl get all               # すべてのリソース\n$ kubectl get pods -n kube-system  # Namespace指定'
          },
          {
            cmd: 'kubectl describe',
            desc: 'リソースの詳細情報を表示します。トラブルシューティングで最初に使うコマンドです。',
            example: '$ kubectl describe pod my-pod\n$ kubectl describe node my-node\n$ kubectl describe service my-svc'
          },
          {
            cmd: 'kubectl logs',
            desc: 'Pod内のコンテナのログを表示します。-f でリアルタイム追跡、--previous で前回クラッシュ時のログを表示します。',
            example: '$ kubectl logs my-pod\n$ kubectl logs -f my-pod         # リアルタイム\n$ kubectl logs my-pod -c nginx   # コンテナ指定\n$ kubectl logs --previous my-pod # 直前のクラッシュログ'
          }
        ]
      },
      {
        id: 'kch2', title: '第2章：マニフェストの適用と削除',
        commands: [
          {
            cmd: 'kubectl apply',
            desc: 'YAMLマニフェストファイルを元にリソースを作成・更新します。-f でファイルを指定します。',
            example: '# deployment.yaml の例\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: myapp\nspec:\n  replicas: 3\n  ...\n\n$ kubectl apply -f deployment.yaml\n$ kubectl apply -f ./k8s/           # ディレクトリ内すべて適用'
          },
          {
            cmd: 'kubectl delete',
            desc: 'リソースを削除します。-f でファイル指定か、リソースタイプと名前で指定します。',
            example: '$ kubectl delete pod my-pod\n$ kubectl delete -f deployment.yaml\n$ kubectl delete deployment myapp\n$ kubectl delete pods --all      # Pod をすべて削除'
          }
        ]
      },
      {
        id: 'kch3', title: '第3章：Deployment の操作',
        commands: [
          {
            cmd: 'kubectl scale',
            desc: 'DeploymentのPod数（レプリカ数）を変更します。',
            example: '$ kubectl scale deployment myapp --replicas=5\n$ kubectl scale deployment myapp --replicas=1'
          },
          {
            cmd: 'kubectl rollout',
            desc: 'デプロイ状況の確認やロールバックを行います。',
            example: '$ kubectl rollout status deployment/myapp  # 状況確認\n$ kubectl rollout undo deployment/myapp    # ロールバック\n$ kubectl rollout history deployment/myapp # 履歴表示'
          },
          {
            cmd: 'kubectl exec',
            desc: 'Pod内のコンテナでコマンドを実行します。docker exec と同じ使い方です。',
            example: '$ kubectl exec my-pod -- ls /app\n$ kubectl exec -it my-pod -- /bin/bash  # シェル接続'
          }
        ]
      },
      {
        id: 'kch4', title: '第4章：Namespace とコンテキスト',
        commands: [
          {
            cmd: 'kubectl get namespaces',
            desc: 'Namespaceの一覧を表示します。リソースはNamespace単位で分離されます。',
            example: '$ kubectl get namespaces\nNAME              STATUS\ndefault           Active\nkube-system       Active\nproduction        Active'
          },
          {
            cmd: 'kubectl config',
            desc: 'kubectlが接続するクラスター（コンテキスト）を切り替えます。複数クラスターを管理するときに使います。',
            example: '$ kubectl config get-contexts         # コンテキスト一覧\n$ kubectl config use-context my-cluster  # 切り替え\n$ kubectl config current-context         # 現在のコンテキスト'
          }
        ]
      }
    ],
    problems: [
      { id: 'k01', title: 'Pod一覧',
        question: 'すべての Pod の一覧を表示するコマンドは？',
        answers: ['kubectl get pods', 'kubectl get pod'], hint: 'kubectl get pods' },
      { id: 'k02', title: 'Node一覧',
        question: 'クラスターの Node 一覧を表示するコマンドは？',
        answers: ['kubectl get nodes', 'kubectl get node'], hint: 'kubectl get nodes' },
      { id: 'k03', title: 'Pod詳細情報',
        question: '"my-pod" の詳細情報を表示するコマンドは？',
        answers: ['kubectl describe pod my-pod'], hint: 'describe コマンドを使う' },
      { id: 'k04', title: 'Podのログ',
        question: '"my-pod" のログを表示するコマンドは？',
        answers: ['kubectl logs my-pod'], hint: 'logs コマンドを使う' },
      { id: 'k05', title: 'ログのリアルタイム確認',
        question: '"my-pod" のログをリアルタイムで追いかけるコマンドは？',
        answers: ['kubectl logs -f my-pod'], hint: '-f オプション（follow）' },
      { id: 'k06', title: 'マニフェストの適用',
        question: '"deployment.yaml" を適用するコマンドは？',
        answers: ['kubectl apply -f deployment.yaml'], hint: 'apply -f を使う' },
      { id: 'k07', title: 'Pod の削除',
        question: '"my-pod" を削除するコマンドは？',
        answers: ['kubectl delete pod my-pod'], hint: 'delete コマンドを使う' },
      { id: 'k08', title: 'Deployment一覧',
        question: 'Deployment の一覧を表示するコマンドは？',
        answers: ['kubectl get deployments', 'kubectl get deployment'], hint: 'kubectl get deployments' },
      { id: 'k09', title: 'レプリカ数の変更',
        question: '"myapp" Deployment のレプリカ数を 3 に変更するコマンドは？',
        answers: ['kubectl scale deployment myapp --replicas=3'], hint: 'scale --replicas を使う' },
      { id: 'k10', title: 'ロールバック',
        question: '"myapp" Deployment を直前のバージョンにロールバックするコマンドは？',
        answers: ['kubectl rollout undo deployment/myapp', 'kubectl rollout undo deployment myapp'], hint: 'rollout undo を使う' },
      { id: 'k11', title: 'デプロイ状況確認',
        question: '"myapp" Deployment のロールアウト状況を確認するコマンドは？',
        answers: ['kubectl rollout status deployment/myapp', 'kubectl rollout status deployment myapp'], hint: 'rollout status を使う' },
      { id: 'k12', title: 'シェル接続',
        question: '"my-pod" に bash でシェル接続するコマンドは？',
        answers: ['kubectl exec -it my-pod -- /bin/bash', 'kubectl exec -it my-pod -- bash'], hint: 'exec -it -- /bin/bash' },
      { id: 'k13', title: 'Service一覧',
        question: 'Service の一覧を表示するコマンドは？',
        answers: ['kubectl get services', 'kubectl get svc'], hint: 'kubectl get services または svc' },
      { id: 'k14', title: 'Namespace一覧',
        question: 'Namespace の一覧を表示するコマンドは？',
        answers: ['kubectl get namespaces', 'kubectl get ns'], hint: 'kubectl get namespaces または ns' },
      { id: 'k15', title: 'Namespace を指定して Pod 一覧',
        question: '"production" Namespace の Pod 一覧を表示するコマンドは？',
        answers: ['kubectl get pods -n production', 'kubectl get pods --namespace production'], hint: '-n で Namespace を指定' },
    ]
  }
];
