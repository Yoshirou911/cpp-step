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
  }
];
