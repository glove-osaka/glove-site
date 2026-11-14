#!/bin/sh
# 企業支援サイト（https://bsd.osaka/）を作り直す。リポジトリの一番上で：sh tools/kigyo-src/build_bsd.sh
# 1) 元ファイルを作業用の場所に写して組み立て 2) 包む 3) ページごとの住所と検索エンジン向けの一覧を書き出す
# 4) 管理ページ・協力企業の登録ページを写す 5) 公的支援マッチ（/hojokin/）は hojokin_patch.py で別に作る
set -e
R=$(pwd); T=$(mktemp -d)
cp -r tools/kigyo-src/. "$T/"
sed -i "s#open('/home/claude/kigyo/dist/kigyo-soudan.html'#open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'dist','kigyo-soudan.html')#" "$T/wrap.py"
python3 "$T/build.py" >/dev/null
SITE_URL=https://bsd.osaka/ OUT_DIR="$R/sites/bsd.osaka" python3 "$T/wrap.py"
python3 "$T/paths.py" "$R/sites/bsd.osaka" https://bsd.osaka/
cp tools/kigyo-src/kanri/index.html sites/bsd.osaka/kanri/index.html
cp tools/kigyo-src/kyoryoku/index.html sites/bsd.osaka/kyoryoku/index.html
rm -rf "$T"
echo "できあがり：sites/bsd.osaka"
