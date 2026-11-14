"""公的支援マッチ（/hojokin/）を企業支援サイト用に整える。
元：リポジトリ直下の hojokin/index.html（技術者に渡した版）→ 出力：sites/bsd.osaka/hojokin/index.html
使い方：python3 tools/kigyo-src/hojokin_patch.py （リポジトリの一番上で）"""
import os
src = open('hojokin/index.html', encoding='utf-8').read()
out = src
def rep(a, b):
    global out
    assert out.count(a) == 1, a[:40]
    out = out.replace(a, b)

rep('<title>公的支援マッチ｜補助金・助成金の対象可能性を判定</title>',
    '<title>公的支援マッチ｜補助金・助成金の対象可能性を判定｜企業支援 総合相談窓口</title>')
# 上の戻る帯
rep('<body>\n', '<body>\n<style>.kg-back{display:block;background:#0D1A33;color:#fff;text-decoration:none;font-size:14px;padding:9px 16px;padding-top:calc(9px + env(safe-area-inset-top,0px))}.kg-back:hover{text-decoration:underline}'
    '.kg-foot{border-top:1px solid #d9dee8;margin-top:40px;padding:22px 16px 34px;font-size:13px;line-height:1.9;color:#4a5468;background:#f6f7fa}.kg-foot .in{max-width:1080px;margin:0 auto}.kg-foot a{color:#1E3460}.kg-foot b{color:#0D1A33}.kg-foot ul{margin:6px 0 0;padding-left:1.2em}'
    '.consent a{color:inherit;text-decoration:underline}</style>\n'
    '<a class="kg-back" href="../">‹ 企業支援 総合相談窓口へ戻る</a>\n')
# ログイン画面の約束
rep('<li>登録した企業の情報は、登録した本人と運営管理者だけが見られます。</li>\n      <li>第三者への提供や、営業目的の連絡はしません。</li>',
    '<li>登録した企業の情報は、登録した本人と運営会社（株式会社グローブ）の担当者だけが見られます。</li>\n      <li>ご本人の同意なく第三者へ提供することはありません。営業目的のご連絡もしません。</li>\n      <li>判定には、同意をいただいた企業に限りAI（Anthropic社の「Claude」・アメリカ合衆国）を使います。詳しくは<a href="../#privacy" target="_blank" rel="noopener">個人情報の取り扱い</a>をご覧ください。</li>')
rep('<li>判定は「対象となる可能性」です。受給や採択を保証するものではありません。</li>',
    '<li>判定は「対象となる可能性」です。受給や採択を保証するものではありません。</li>\n      <li>申請書類の作成・提出は、行政書士（雇用関係の助成金は社会保険労務士）が行います。</li>')
# 名刺の写真
rep('写真は会社情報の読み取りにだけ使います。', '写真は会社情報の読み取りにだけ使い、読み取り後に削除します。名刺に書かれた個人の氏名・電話番号などは記録しません。')
# 判定への同意（外国にある第三者への提供の同意として必要な情報を示す）
rep('<span>判定のため、このカルテの内容を判定担当（運営者が契約するAI）に渡すことに同意します。第三者への提供はしません。同意がない企業は判定できません。</span>',
    '<span>判定と会社情報の読み取りのため、このカルテの内容（ホームページ・名刺から読み取った内容を含む）を、株式会社グローブが利用する Anthropic, PBC（アメリカ合衆国）のAI「Claude」に送ることに同意します。アメリカ合衆国の個人情報保護の制度と、移転先が講じる措置は<a href="../#privacy" target="_blank" rel="noopener">個人情報の取り扱い</a>の6に記載しています。同意がない企業は判定できません（カルテの保存はできます）。</span>')
# 下の運営者表示
rep('</main>\n', '</main>\n<footer class="kg-foot"><div class="in">'
    '<b>公的支援マッチ</b>は、企業支援 総合相談窓口の機能です。運営：株式会社グローブ（大阪府大阪市生野区勝山南2-2-7）'
    '<ul><li>判定は、公開されている公式情報をもとにした「対象となる可能性」の目安です。受給や採択を保証するものではありません。最終的な要件は各制度の公募要領でご確認ください。</li>'
    '<li>申請書類の作成・提出は、提携する行政書士（雇用関係の助成金は社会保険労務士）が行います。窓口では制度のご案内と事業内容の整理をお手伝いします。</li></ul>'
    '<div style="margin-top:10px"><a href="../#contact">窓口に相談する（初回無料）</a>　｜　<a href="../#privacy">個人情報の取り扱い</a>　｜　<a href="../#company">運営会社</a>　｜　電話 <a href="tel:0663550779">06-6355-0779</a>（平日10:00〜18:00）　｜　<a href="mailto:kigyosoudan@gmail.com">kigyosoudan@gmail.com</a></div>'
    '</div></footer>\n')
os.makedirs('sites/bsd.osaka/hojokin', exist_ok=True)
open('sites/bsd.osaka/hojokin/index.html', 'w', encoding='utf-8').write(out)
print('ok')
