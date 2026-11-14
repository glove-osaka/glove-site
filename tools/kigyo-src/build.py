# -*- coding: utf-8 -*-
import json, html, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from data import CASES, SITE, TAGS, GROUPS, CATS, SITS, FAQ, DIAG

E = html.escape
CAT = {c["id"]: c for c in CATS}

P = '<svg class="ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
ICONS = {
 "doc": '<path d="M8 3.5h11l5.5 5.5v19.5H8z"/><path d="M19 3.5V9h5.5M11.5 14h9M11.5 18h9M11.5 22h4"/><circle class="ac" cx="21.5" cy="23" r="3"/>',
 "seal": '<rect x="5" y="5" width="22" height="22" rx="3"/><circle class="ac" cx="16" cy="16" r="6"/><path class="ac" d="M13.5 16h5M16 13.5v5"/>',
 "network": '<circle cx="16" cy="16" r="3.4" class="ac"/><circle cx="6" cy="7" r="2.6"/><circle cx="26" cy="7" r="2.6"/><circle cx="6" cy="25" r="2.6"/><circle cx="26" cy="25" r="2.6"/><path d="M8 8.8l5.4 5M24 8.8l-5.4 5M8 23.2l5.4-5M24 23.2l-5.4-5"/>',
 "yen": '<circle cx="16" cy="16" r="12"/><path class="ac" d="M11 9l5 7 5-7M16 16v8M12 17h8M12 20.5h8"/>',
 "cut": '<path d="M5 9h22v15H5z"/><path d="M5 13h22"/><path class="ac" d="M10 19h4M20 21l3-3-3-3"/>',
 "people": '<circle cx="11" cy="10.5" r="3.6"/><circle cx="22" cy="11.5" r="3"/><path d="M4 25c0-4.2 3.1-7.2 7-7.2s7 3 7 7.2"/><path class="ac" d="M19 18.4c.9-.4 1.9-.6 3-.6 3.4 0 6 2.6 6 6.2"/>',
 "gear": '<circle class="ac" cx="16" cy="16" r="4"/><path d="M16 3.5v4M16 24.5v4M3.5 16h4M24.5 16h4M7.2 7.2l2.8 2.8M22 22l2.8 2.8M7.2 24.8 10 22M22 10l2.8-2.8"/><circle cx="16" cy="16" r="8.5"/>',
 "growth": '<path d="M4 27h24"/><path d="M7 27v-6h4v6M14 27V15h4v12M21 27V9h4v18"/><path class="ac" d="M6 15l7-6 5 3 8-7M22 5h4v4"/>',
 "spark": '<path d="M16 3.5v5M16 23.5v5M3.5 16h5M23.5 16h5"/><path class="ac" d="M16 10.5l1.8 3.7 3.7 1.8-3.7 1.8-1.8 3.7-1.8-3.7-3.7-1.8 3.7-1.8z"/>',
 "globe": '<circle cx="16" cy="16" r="12"/><path d="M4 16h24M16 4c3.4 3.4 5 7.4 5 12s-1.6 8.6-5 12c-3.4-3.4-5-7.4-5-12s1.6-8.6 5-12z"/><path class="ac" d="M6.5 9.5h19M6.5 22.5h19"/>',
 "baton": '<path d="M4 22h9l4-4"/><path d="M28 10h-9l-4 4"/><circle class="ac" cx="16" cy="16" r="2.6"/><path d="M8 18l-4 4 4 4M24 14l4-4-4-4"/>',
 "shield": '<path d="M16 3.5 26 7v8c0 6.5-4.2 11-10 13.5C10.2 26 6 21.5 6 15V7z"/><path class="ac" d="M11.5 16l3.2 3.2 6-6.4"/>',
 "chat": '<path d="M5 6h22v15H14l-6 5v-5H5z"/><path class="ac" d="M10 12h12M10 16h7"/>',
 "clock": '<circle cx="16" cy="16" r="12"/><path class="ac" d="M16 9v7l5 3"/>',
 "check": '<path d="M6 16.5l6.5 6.5L26 9.5"/>',
 "pen": '<path d="M20.5 5.5l6 6L11 27H5v-6z"/><path class="ac" d="M17 9l6 6"/>',
 "list": '<path d="M11 8h16M11 16h16M11 24h16"/><circle class="ac" cx="5.5" cy="8" r="1.6"/><circle class="ac" cx="5.5" cy="16" r="1.6"/><circle class="ac" cx="5.5" cy="24" r="1.6"/>',
 "quiz": '<rect x="5" y="4" width="22" height="24" rx="3"/><path class="ac" d="M12.5 12a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3V18"/><circle class="ac" cx="16" cy="22.5" r=".6"/>',
 "building": '<path d="M5 28V9l9-4v23M14 28V12h13v16M3 28h26"/><path class="ac" d="M18 16h5M18 20h5M18 24h5M8 13h3M8 17h3M8 21h3"/>',
 "hand": '<path d="M4 18l6-4c1.6-1 3.6-1 5 0l2 1.3"/><path d="M28 18l-6-4c-1.6-1-3.6-1-5 0l-5 3.3c-1 .7-1 2 0 2.6 .8.5 1.8.4 2.5-.2l2.5-2"/><path class="ac" d="M10 22l3 3c1 1 2.6 1 3.6 0L22 19.6"/>',
 "mail": '<rect x="4" y="7" width="24" height="18" rx="2"/><path class="ac" d="M5 9l11 8 11-8"/>',
 "menu": '<path d="M5 9h22M5 16h22M5 23h22"/>',
 "lock": '<rect x="7" y="14" width="18" height="13" rx="2"/><path d="M11 14v-3.5a5 5 0 0 1 10 0V14"/><circle class="ac" cx="16" cy="20.5" r="2"/>',
 "fs": '<path d="M4 25 10 8l6 17M6.2 19h7.6"/><path class="ac" d="M18 25l4.5-12L27 25M19.6 21h5.8"/>',
 "copy": '<rect x="10" y="10" width="16" height="17" rx="2"/><path d="M6 21V7a2 2 0 0 1 2-2h12"/>',
}
def ic(n): return P + ICONS[n] + '</svg>'
def emb(n, cls=""): return f'<span class="emb {cls}">{ic(n)}</span>'
def tag(t): return f'<span class="tag t-{t}">{TAGS[t][0]}</span>'

MARK = ('<svg class="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">'
        '<rect x="3" y="3" width="42" height="42" rx="9" stroke="currentColor" stroke-width="2"/>'
        '<path d="M14 13h13l7 7v16H14z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>'
        '<path d="M27 13v7h7" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>'
        '<circle cx="30" cy="31" r="5.5" fill="var(--amber-b)" stroke="none"/>'
        '<path d="M18.5 23h8M18.5 27.5h5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>')


OPENING = ('<div class="opn" id="op" hidden role="dialog" aria-modal="true" aria-label="オープニング映像">'
 '<canvas id="opC" aria-hidden="true"></canvas>'
 '<div class="op-start" id="opStart"><div class="op-start-in">' + MARK +
 '<p class="op-start-t">企業支援 総合相談窓口</p><p class="op-start-s">はじめに、短い映像（約17秒）をご覧ください。</p>'
 '<div class="op-start-b"><button type="button" class="op-sb on" id="opSound">音ありで見る</button><button type="button" class="op-sb" id="opMute">音なしで見る</button></div>'
 '<button type="button" class="op-sk" id="opSkip0">映像をとばして、ホームページへ</button></div></div>'
 '<div class="op-text"><p class="ln ln1">許可、補助金、資金、人。</p><p class="ln ln2">会社の困りごとを、<br>ひとつの窓口で。</p></div>'
 '<div class="op-dim" aria-hidden="true"></div>'
 '<div class="op-title">' + MARK + '<p class="op-name"><span>企業支援</span><span>総合相談窓口</span></p><span class="op-rule" aria-hidden="true"></span>'
 '<button class="op-go" id="opGo" type="button">ホームページへ進む</button></div>'
 '<p class="op-corp">運営　株式会社グローブ</p>'
 '<button class="op-skip" id="opSkip" type="button">とばす</button></div>')

def crumbs(items):
    lis = '<li><a href="#top">トップ</a></li>' + ''.join(
        (f'<li><a href="#{h}">{E(t)}</a></li>' if h else f'<li aria-current="page">{E(t)}</li>') for t, h in items)
    return f'<ol class="crumbs">{lis}</ol>'

def ph(title, lead, icon, items, num=""):
    n = f'<span class="num">{E(num)}</span>' if num else ""
    return (f'<header class="ph"><div class="wrap">{emb(icon,"lg")}<div>{crumbs(items)}{n}'
            f'<h1>{E(title)}</h1><p>{E(lead)}</p></div></div></header>')

def fold(title, body, icon=None, sub="", cls="", open_=False, desk=False):
    """タップで中身が出てくる開閉部品"""
    i = emb(icon) if icon else ""
    sb = f'<small>{E(sub)}</small>' if sub else ""
    o = " open" if open_ else ""
    d = " data-desk-open" if desk else ""
    return (f'<details class="fold {cls}"{o}{d}><summary class="fold-h">{i}<span class="fold-t"><b>{E(title)}</b>{sb}</span>'
            f'<span class="fold-k" aria-hidden="true"></span></summary><div class="fold-b">{body}</div></details>')

def page(pid, title, body):
    return f'<section class="page" data-p="{pid}" data-title="{E(title)}" hidden>{body}</section>'

CTA = ('<section class="cta-band"><div class="wrap"><div><h2>会社の困りごとは、まずここへ。</h2>'
       '<p>分野が分からない段階でも構いません。内容を整理して、適切な専門家・提携先へおつなぎします。</p></div>'
       f'<div class="btns"><a class="btn btn-g" href="#contact">{ic("pen")}相談内容をまとめる</a>'
       f'<a class="btn btn-w" href="#diagnosis">{ic("quiz")}4つの質問で整理する</a></div></div></section>')

HJ = ('<div class="box hj-box"><b>使える制度を調べる</b><p>会社の情報を入れると、補助金・助成金の対象となる可能性を、理由と根拠付きで判定します（無料）。</p>'
      f'<a class="btn btn-w" href="hojokin/">{ic("yen")}公的支援マッチで調べる</a></div>')

HJP = f'<div class="prep" style="margin-top:24px">{ic("yen")}<p>どの制度が使えそうか先に知りたいときは、<a href="hojokin/">公的支援マッチ</a>で会社の情報を入れると、対象となる可能性を理由付きで判定します（無料）。</p></div>'

# ---------- トップ ----------
def hero_art():
    nodes = [("行政書士",160,48),("税理士",276,92),("社労士",300,206),("司法書士",232,300),("弁護士",100,300),("弁理士",30,206),("診断士",50,92)]
    lines = ''.join(f'<path class="ln" d="M165 175 L{x} {y}" style="--d:{i*0.35}s"/>' for i,(t,x,y) in enumerate(nodes))
    dots = ''.join(f'<g class="nd"><circle cx="{x}" cy="{y}" r="27"/><text x="{x}" y="{y+5}">{t}</text></g>' for t,x,y in nodes)
    return (f'<svg class="art" viewBox="-10 0 350 350" role="img" aria-label="相談窓口を中心に、7つの専門家がつながる図">{lines}'
            '<g class="ctr"><rect x="122" y="128" width="86" height="96" rx="8"/><path d="M136 150h58M136 164h58M136 178h40"/>'
            '<circle cx="190" cy="204" r="13" class="sealc"/><text x="190" y="209" class="sealt">窓口</text></g>'
            f'{dots}</svg>')

def top():
    tl = lambda s: f'<a class="tile" href="#{s["id"]}">{emb(s["icon"])}<span>{E(s["name"])}</span><span class="arr" aria-hidden="true">›</span></a>'
    tiles = '<div class="tiles">' + ''.join(tl(s) for s in SITS[:3]) + '</div>' + fold(f'ほかの{len(SITS)-3}つの場面を表示', '<div class="tiles">' + ''.join(tl(s) for s in SITS[3:]) + '</div>', cls="more-fold")
    cats = ''
    for g in GROUPS:
        svcs = ''.join(f'<li><a href="#svc-{c}">{ic(CAT[c]["icon"])}<span>{E(CAT[c]["name"])}</span><span class="arr" aria-hidden="true">›</span></a></li>' for c in g["cats"])
        cats += fold(g["name"], f'<ul class="svcs">{svcs}</ul>', g["icon"], f'{g["lead"]}（{len(g["cats"])}分野）', "catf")
    faq = ''.join(f'<details><summary>{E(q)}</summary><div class="a"><p>{E(a)}</p></div></details>' for q, a in FAQ[:5])
    body = f'''
<section class="hero"><picture class="hero-media"><source srcset="top-01.webp" type="image/webp"><img src="top-01.jpg" width="1024" height="559" alt="大阪の街を見渡すオフィスの窓辺に立つ経営者" fetchpriority="high" decoding="async"></picture><div class="wrap hero-in"><div class="hero-copy">
<span class="lbl">企業向けの総合相談窓口</span>
<h1>許可、補助金、資金、人。<br><span>会社の困りごと</span>を、<br>ひとつの窓口で。</h1>
<p class="lead">何から相談すればよいか分からない段階から、内容を整理し、提携行政書士をはじめとする専門家・提携事業者へおつなぎします。</p>
<ul class="hero-tags"><li>初回相談無料</li><li>全国対応・Zoom相談可</li><li>平日10:00〜18:00</li><li>契約は電子契約で来社不要</li></ul>
<div class="btns"><a class="btn btn-g" href="#contact">{ic("pen")}相談内容をまとめる</a><a class="btn btn-w" href="#t-scenes">{ic("chat")}よくある相談場面を見る</a></div>
</div></div></section>
<section class="sec"><div class="wrap entry">
<figure class="entry-fig"><picture><source srcset="top-02.webp" type="image/webp"><img src="top-02.jpg" width="1024" height="572" alt="窓辺の机で資料とノートパソコンを確かめながら、相談内容を整理する経営者" loading="lazy" decoding="async"></picture>
<figcaption><b>迷ったら、まずここから。</b><span>手続きの名前が分からなくても、状況をそのままお話しください。</span></figcaption></figure>
<div class="entry-r"><div class="sec-h"><span class="eyebrow">はじめに</span><h2>ご相談の入り口</h2><p>分野が分からなければ質問から、決まっていれば直接まとめから。近い場面がある方は、次の「よくある相談場面」から選べます。</p></div>
<div class="doors">
<a class="door" href="#diagnosis">{emb("quiz")}<div><h3>4つの質問で整理する</h3><p>分野が分からないときは、4つの質問に答えるだけで、相談先の目安が分かります。</p></div><span class="arr" aria-hidden="true">›</span></a>
<a class="door" href="#contact">{emb("pen")}<div><h3>相談内容をまとめる</h3><p>分野を選び、状況を入力していくと、窓口に伝える内容がまとまります。</p></div><span class="arr" aria-hidden="true">›</span></a>
<a class="door" href="hojokin/">{emb("yen")}<div><h3>使える補助金・助成金を調べる</h3><p>会社の情報を入れると、国・大阪府・大阪市などの制度の対象となる可能性を、理由付きで判定します（無料）。</p></div><span class="arr" aria-hidden="true">›</span></a>
</div></div></div></section>
<section class="sec band" id="t-scenes"><div class="wrap">
<div class="scene"><div class="scene-l"><div class="sec-h"><span class="eyebrow">困りごとから探す</span><h2>よくある相談場面</h2><p>近い場面を選ぶと、だれが、どの順番で進めるかが分かります。</p></div>
{tiles}
<p style="margin-top:20px"><a class="more" href="#situations">すべての場面を見る</a></p></div>
<figure class="scene-fig"><picture><source srcset="top-03.webp" type="image/webp"><img src="top-03.jpg" width="1024" height="572" alt="夕暮れの街を見ながら、机の資料を前に考えごとをする経営者" loading="lazy" decoding="async"></picture>
<figcaption><b>期限のある手続きほど、早めのご相談を。</b><span>許可の更新、補助金の締切、資金の支払い。順番を決めるところからお手伝いします。</span></figcaption></figure></div>
</div></section>
<section class="sec"><div class="wrap stmt">
<figure class="stmt-art stmt-photo"><picture><source srcset="top-04.webp" type="image/webp"><img src="top-04.jpg" width="1600" height="893" alt="工場で、導入した工作機械の前に立ち、記録を確かめる従業員" loading="lazy" decoding="async"></picture><figcaption class="vt">申請で終わらない。<br>成長まで支える。</figcaption><span class="cap">補助金で入れた設備が、現場で動き出すまで。</span></figure>
<div><span class="eyebrow">私たちの考え</span><h2>手続きは、会社が前に進むための入り口です。</h2>
<div class="body"><p>許可を取る、補助金を申請する。その先には、設備を入れる、人を雇う、新しいお客様に届けるという本来の目的があります。</p><p>窓口は、目の前の手続きだけでなく、その先の目的まで見渡して、必要な専門家と提携先を順番に組み合わせます。</p></div>
<p style="margin-top:20px"><a class="more" href="#about">窓口について詳しく</a></p></div>
</div></section>
<section class="sec band" id="t-services"><div class="wrap">
<div class="sec-h"><span class="eyebrow">サービス一覧</span><h2>5つの領域、13の分野</h2><p>領域をタップすると、分野が表示されます。</p></div>
<div class="folds">{cats}</div><p style="margin-top:18px"><a class="more" href="#services">13分野をまとめて見る</a></p>
</div></section>
{tiers_html()}
<section class="sec"><div class="wrap">
<div class="sec-h"><span class="eyebrow">ご相談の流れ</span><h2>ご相談から支援の開始まで</h2></div>
{flow_html()}
<p style="margin-top:22px"><a class="more" href="#flow">流れと費用の考え方を見る</a></p>
</div></section>
<section class="sec band"><div class="wrap">
<div class="sec-h"><span class="eyebrow">よくある質問</span><h2>ご相談の前に</h2></div>
<div class="faq">{faq}</div><p style="margin-top:12px"><a class="more" href="#faq">すべての質問を見る</a></p>
</div></section>
{CTA}'''
    return page("top", f'{SITE["name"]}｜運営：{SITE["company"]}', body)

H5 = 893
def tiers_html():
    return f'''<section class="sec dark tiers-sec"><picture class="tiers-bg"><source srcset="top-05.webp" type="image/webp"><img src="top-05.jpg" width="1600" height="{H5}" alt="会議室で、窓口の担当者・専門家・経営者が資料を囲んで役割を確認している様子" loading="lazy" decoding="async"></picture><div class="wrap">
<div class="sec-h"><span class="eyebrow">体制</span><h2>3つの立場で、役割を分けて対応します</h2><p>誰が何を担当するかを、ご依頼の前にお伝えします。</p></div>
<div class="tiers">
<div class="tier">{ic("chat")}<span class="k">窓口</span><h3>{E(SITE["company"])}</h3><p>ご相談の受付と整理、専門家・提携先の選定とおつなぎ、経営・集客・業務改善の支援を行います。</p></div>
<div class="tier">{ic("seal")}<span class="k">取次</span><h3>提携行政書士・各専門家</h3><p>許認可・補助金の書類作成と申請は行政書士が、税務・労務・登記・法律・知財は各専門家が担当します。</p></div>
<div class="tier">{ic("hand")}<span class="k">提携</span><h3>提携事業者</h3><p>設備・システムの導入、通信・電気の見直し、物流、人材サービスなどを、許可を持つ事業者が担当します。</p></div>
</div></div></section>'''

FLOW6 = [("相談内容を送る","分野と状況をフォームに入力。分からない項目は空欄で構いません。","send"),
         ("窓口からご連絡","内容を確認し、窓口の担当者からご連絡します。","call"),
         ("課題の整理","状況をうかがい、必要な分野と進める順番を整理します。","sort"),
         ("担当のご提案","だれが担当するかと、費用の目安をお伝えします。","assign"),
         ("専門家と直接ご契約","お見積りを確かめて、電子契約でご契約。来社・郵送は不要です。","contract"),
         ("支援の開始と継続","支援が始まります。新しい悩みは、いつでも窓口へ。","start")]
FI = '<svg class="fi" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
FICONS = {
 "send": '<path d="M9 7h20l8 8v26H9z"/><path d="M29 7v8h8"/><path d="M15 21h14M15 27h14M15 33h8"/><path class="g" d="M31 31l9 4-9 4 2-4z"/>',
 "call": '<path d="M14 8h6l3 8-4 3c2 4 5 7 9 9l3-4 8 3v6c0 2-1 3-3 3C21 36 12 27 11 11c0-2 1-3 3-3z"/><path class="g" d="M30 8a10 10 0 0 1 10 10M30 14a4 4 0 0 1 4 4"/>',
 "sort": '<rect x="10" y="9" width="28" height="32" rx="3"/><path d="M18 6h12v6H18z"/><path class="g" d="M16 22l3 3 5-6"/><path d="M28 22h5M16 32h17"/>',
 "assign": '<circle cx="24" cy="15" r="6"/><path d="M13 39c0-6 5-11 11-11s11 5 11 11"/><circle class="g" cx="9" cy="24" r="3.5"/><circle class="g" cx="39" cy="24" r="3.5"/><path class="g" d="M12.5 24h4M31.5 24h4"/>',
 "contract": '<path d="M11 6h18l8 8v28H11z"/><path d="M29 6v8h8"/><path d="M17 20h14M17 26h9"/><circle class="g" cx="29" cy="34" r="5"/><path class="g" d="M17 35h5"/>',
 "start": '<path d="M8 40h32"/><path d="M12 40V30h6v10M21 40V24h6v16M30 40V17h6v23"/><path class="g" d="M11 22l9-7 6 4 12-10M33 9h5v5"/>',
}
def flow_html():
    li = ''
    for k, (a, b, ic_) in enumerate(FLOW6, 1):
        li += (f'<li class="fd-s"><div class="fd-t"><span class="fd-n">{k}</span>{FI}{FICONS[ic_]}</svg></div>'
               f'<div class="fd-x"><b>{E(a)}</b><p>{E(b)}</p></div></li>')
    return (f'<div class="fd"><ol class="fd-l" aria-label="ご相談から支援の開始までの6段階">{li}</ol>'
            '<div class="fd-ph" aria-hidden="true"><span class="p1">1〜4　窓口とやり取り</span><span class="p2">5〜6　専門家・提携先と直接</span></div></div>')

# ---------- 窓口について ----------
def about():
    body = ph("窓口について", "会社の困りごとを整理し、適切な専門家・提携先へつなぐ、企業向けの総合相談窓口です。", "chat", [("窓口について", None)])
    body += f'''<section class="sec"><div class="wrap stmt">
<div class="stmt-art" aria-hidden="true"><span class="vt">ともに考え、<br>ともに進む。</span></div>
<div><span class="eyebrow">私たちの考え</span><h2>専門家を探す手間を、窓口が引き受けます。</h2>
<div class="body"><p>会社の悩みは、一つの専門分野で終わらないことがほとんどです。新しい事業を始めるには許可が要り、設備には資金が要り、人を雇えば労務の手続きが要ります。</p>
<p>この窓口は、そうした悩みを最初にまとめて受け止め、行政書士をはじめとする専門家と提携事業者の中から、必要な相手を必要な順番でおつなぎします。運営は{E(SITE["company"])}です。</p></div></div></div></section>
{tiers_html()}
<section class="sec band"><div class="wrap">
<div class="sec-h"><span class="eyebrow">担当の範囲</span><h2>窓口が行うこと、行わないこと</h2></div>
<div class="folds">
{fold("窓口が行うこと", """<ul><li>ご相談の受付と、必要な分野の整理（手続きの名前が分からなくても大丈夫です）</li><li>期限から逆算した、進める順番の組み立て</li><li>制度・公募情報のご案内</li><li>事業計画・資金繰り表の作成支援</li><li>専門家・提携先の選定とおつなぎ</li><li>集客・業務改善・採用広報の支援</li><li>複数の専門家・提携先の進行の調整</li></ul>""", "check", "6項目")}
{fold("窓口が行わないこと", """<ul><li>官公署へ出す書類の作成・提出代行（行政書士が担当）</li><li>雇用関係助成金・労務手続きの代行（社会保険労務士が担当）</li><li>法律相談・示談交渉（弁護士が担当）</li><li>税務代理・登記（税理士・司法書士が担当）</li><li>職業紹介・労働者派遣・融資の媒介</li><li>専門家からの紹介料の受け取り</li></ul>""", "lock", "6項目・担当する専門家")}
</div></div></section>{CTA}'''
    return page("about", f'窓口について｜{SITE["name"]}', body)

# ---------- サービス一覧・詳細 ----------
def services():
    toc = ''.join(f'<a href="#svc-{c["id"]}">{ic(c["icon"])}{E(c["name"])}</a>' for c in CATS)
    blocks = ''
    for g in GROUPS:
        cards = ''.join(f'<a class="svc-card" href="#svc-{c}"><div class="top">{emb(CAT[c]["icon"])}<h3>{E(CAT[c]["name"])}</h3></div><p>{E(CAT[c]["lead"])}</p><div class="mini">{"".join(tag(t) for t in sorted(set(i[0] for i in CAT[c]["items"]), key=list(TAGS).index))}</div></a>' for c in g["cats"])
        blocks += fold(g["name"], f'<div class="grid g3">{cards}</div>', g["icon"], f'{g["lead"]}（{len(g["cats"])}分野）', "grpf", open_=(g is GROUPS[0]))
    body = ph("サービス一覧", "5つの領域、13の分野で、会社の困りごとを受け付けます。", "list", [("サービス一覧", None)])
    body += f'<section class="sec"><div class="wrap">{fold("分野の名前から選ぶ（13分野）", f'<nav class="toc" aria-label="分野">{toc}</nav>', "list", cls="tocf")}<ul class="legend inline">{"".join(f"<li>{tag(t)}<span>{E(TAGS[t][1])}</span></li>" for t in TAGS)}</ul><div class="folds" style="margin-top:26px">{blocks}</div></div></section>{CTA}'
    return page("services", f'サービス一覧｜{SITE["name"]}', body)

def svc(i, c):
    g = next(g for g in GROUPS if c["id"] in g["cats"])
    targets = ''.join(f'<li>{ic("check")}<span>{E(t)}</span></li>' for t in c["targets"])
    items = ''.join(f'<li>{tag(t)}<span>{E(x)}</span></li>' for t, x in c["items"])
    flow = ''.join(f'<li>{E(s)}</li>' for s in c["flow"])
    note = f'<div class="prep">{ic("lock")}<p>{E(c["note"])}</p></div>' if c["note"] else ''
    sits = [s for s in SITS if c["id"] in s["cats"]]
    rel = ''
    if sits:
        rel = fold("この分野の場面", '<div class="chips">' + ''.join(f'<a href="#{s["id"]}">{ic(s["icon"])}{E(s["name"])}</a>' for s in sits) + '</div>', "chat", f'{len(sits)}つの場面')
    cs = CASES.get(c["id"], [])
    if cs:
        cards = ''.join(f'''<article class="case"><div class="case-h"><span class="case-tag">参考事例{k+1}</span><h3>{E(x["t"])}</h3><p class="case-who">{E(x["who"])}</p></div>
<dl class="case-dl"><div><dt>ご相談前</dt><dd>{E(x["before"])}</dd></div><div><dt>窓口の対応</dt><dd>{E(x["act"])}</dd></div><div><dt>結果のイメージ</dt><dd>{E(x["res"])}</dd></div></dl></article>''' for k, x in enumerate(cs))
        rel = fold("参考事例", f'<div class="cases">{cards}</div><p class="case-note">よくあるご相談の内容をもとにまとめた参考事例です。実際の進み方や結果は、状況によって異なります。</p>', "chat", f'{len(cs)}件') + rel
    AC = ' aria-current="page"'
    side = ''.join(f'<li><a href="#svc-{x["id"]}"{AC if x is c else ""}>{E(x["name"])}</a></li>' for x in CATS)
    prv, nxt = CATS[i-1], CATS[(i+1) % len(CATS)]
    body = ph(c["name"], c["lead"], c["icon"], [("サービス一覧", "services"), (c["name"], None)], f'{g["name"]}　{i+1:02d}／13')
    body += f'''<section class="sec"><div class="wrap detail"><div class="main">
<div class="block"><h2>{ic("doc")}この分野でお手伝いすること</h2><p class="body-t">{E(c["body"])}</p></div>
<div class="folds block">
{fold("こんな企業様に", f'<ul class="checks">{targets}</ul>', "people", f'{len(c["targets"])}項目')}
{fold("主な支援と担当", f'<ul class="items">{items}</ul>{note}', "list", f'{len(c["items"])}項目・窓口／提携／取次', open_=True)}
{fold("進め方", f'<ol class="dots">{flow}</ol>', "clock", f'{len(c["flow"])}つの段階')}
{rel}</div>
<nav class="pn" aria-label="前後の分野"><a href="#svc-{prv["id"]}"><small>‹ 前の分野</small><b>{E(prv["name"])}</b></a><a class="nx" href="#svc-{nxt["id"]}"><small>次の分野 ›</small><b>{E(nxt["name"])}</b></a></nav>
</div><aside class="side">{fold("ほかの分野を見る", f'<nav aria-label="分野の一覧"><ul>{side}</ul></nav>', "list", "13分野", "sidef", desk=True)}
{HJ if c["id"] in ("subsidy","finance") else ""}<div class="box"><b>この分野で相談する</b><p>分野を選んだ状態で、相談内容のまとめに進みます。</p><a class="btn btn-g" href="#contact" data-cat="{c["id"]}">{ic("pen")}相談内容をまとめる</a></div></aside></div></section>{CTA}'''
    return page("svc-" + c["id"], f'{c["name"]}｜{SITE["name"]}', body)

# ---------- 場面 ----------
def situations():
    cards = ''.join(f'<a class="svc-card" href="#{s["id"]}"><div class="top">{emb(s["icon"])}<h3>{E(s["name"])}</h3></div><p>{E(s["lead"])}</p></a>' for s in SITS)
    body = ph("困りごとから探す", "よくある場面ごとに、誰が、どの順番で進めるかをまとめました。", "chat", [("困りごとから探す", None)])
    body += f'<section class="sec"><div class="wrap"><div class="grid g3">{cards}</div><div class="prep" style="margin-top:30px">{ic("quiz")}<p>当てはまる場面がないときは、<a href="#diagnosis">4つの質問</a>で相談先の目安を確かめるか、そのまま<a href="#contact">相談内容をまとめる</a>へお進みください。</p></div></div></section>{CTA}'
    return page("situations", f'困りごとから探す｜{SITE["name"]}', body)

def sit(s):
    tl = ''.join(f'<li><b>{E(w)}</b><span>{E(t)}</span></li>' for w, t in s["tl"])
    rel = ''.join(f'<a href="#svc-{c}">{ic(CAT[c]["icon"])}<b>{E(CAT[c]["name"])}</b><span class="fine">{E(CAT[c]["lead"])}</span></a>' for c in s["cats"])
    body = ph(s["name"], s["lead"], s["icon"], [("困りごとから探す", "situations"), (s["name"], None)])
    body += f'''<section class="sec"><div class="wrap"><div class="card sitc">
<div><h2>進め方の例</h2><p class="fine">ご状況によって順番や担当は変わります。</p><ol class="tl">{tl}</ol></div>
<div><h2>関係する分野</h2><div class="rel r1">{rel}</div><a class="btn btn-p" href="#contact" data-cat="{s["cats"][0]}" style="margin-top:22px">{ic("pen")}この内容で相談をまとめる</a></div>
</div>{HJP if "subsidy" in s["cats"] else ""}<p style="margin-top:24px"><a class="more" href="#situations">ほかの場面を見る</a></p></div></section>{CTA}'''
    return page(s["id"], f'{s["name"]}｜{SITE["name"]}', body)

# ---------- 診断 ----------
def diagnosis():
    def q(n, title, opts, name):
        o = ''.join(f'<label><input type="radio" name="{name}" id="{name}-{k}" value="{E(v)}"><span>{E(t)}</span></label>' for k, (t, v) in enumerate(opts))
        return f'<fieldset class="dq" data-q="{n}" {"" if n==1 else "hidden"}><legend><span class="stepnow">質問 {n}／4</span>{E(title)}</legend><div class="opts">{o}</div></fieldset>'
    body = ph("4つの質問で整理する", "質問に答えると、相談する分野と担当の目安が分かります。最後に、伝えておきたいことを書き添えられます。", "quiz", [("4つの質問で整理する", None)])
    body += f'''<section class="sec"><div class="wrap narrow"><div class="form-card" id="diag">
{q(1,"一番困っていることは何ですか。",DIAG["q1"],"d1")}
{q(2,"いつまでに対応したいですか。",DIAG["q2"],"d2")}
{q(3,"すでに誰かに相談しましたか。",DIAG["q3"],"d3")}
{q(4,"いま、一番してほしいことは何ですか。",DIAG["q4"],"d4")}
<fieldset class="dq" data-q="5" hidden><legend><span class="stepnow">追加（任意）</span>伝えておきたいことはありますか。</legend>
<div class="fld"><label for="d5">自由記入（書かなくても進めます）</label><textarea id="d5" placeholder="例：来年3月までに建設業許可を取りたい"></textarea></div></fieldset>
<div class="dres" id="dres" hidden></div>
<div class="form-nav"><button type="button" class="btn btn-o" id="dBack" hidden>‹ 前の質問へ</button><button type="button" class="btn btn-p" id="dNext" disabled>次へ ›</button></div>
</div><p class="fine" style="margin-top:16px">この結果は相談先の目安です。実際の担当は、ご状況をうかがったうえで決めます。</p></div></section>'''
    return page("diagnosis", f'4つの質問で整理する｜{SITE["name"]}', body)

# ---------- 流れ・費用 ----------
def flowp():
    body = ph("相談の流れ・費用", "ご相談から支援の開始までの流れと、費用の考え方をご説明します。", "clock", [("相談の流れ・費用", None)])
    body += f'''<section class="sec"><div class="wrap"><div class="sec-h"><span class="eyebrow">流れ</span><h2>6つの段階で進めます</h2></div>{flow_html()}</div></section>
<section class="sec band"><div class="wrap"><div class="sec-h"><span class="eyebrow">費用</span><h2>費用は、だれに払うかで3つに分かれます</h2><p>費用がかかる場合は、ご依頼の前に必ず内容と金額をご説明します。</p></div>
<div class="grid g3">
<div class="card fee">{emb("chat")}<h3>窓口でのご相談</h3><p>状況をうかがい、分野と順番を整理する段階です。</p><p class="fee-v">初回のご相談は無料です</p></div>
<div class="card fee">{emb("doc")}<h3>窓口の支援業務</h3><p>事業計画・資金繰り表の作成支援、制作、業務改善などです。</p><p class="fee-v">作業の範囲を決め、事前にお見積り</p></div>
<div class="card fee">{emb("seal")}<h3>専門家・提携先へのご依頼</h3><p>書類作成・申請、税務、登記、工事、導入などです。</p><p class="fee-v">各専門家・提携先から直接お見積り・ご請求</p></div>
</div>
<ul class="pledges two">
<li>{emb("doc")}<div><b>事前にお見積り</b><span>何をどこまで行うかを決めてから始めます。</span></div></li>
<li>{emb("cut")}<div><b>不要な作業を増やさない</b><span>自社でできる作業は整理してお伝えし、必要な費用だけにします。</span></div></li>
<li>{emb("hand")}<div><b>紹介料を上乗せしない</b><span>当社は専門家から紹介料を受け取りません。</span></div></li>
<li>{emb("seal")}<div><b>契約は電子契約で</b><span>契約書の確認から押印・締結まで画面上で済みます。来社や郵送は要りません。</span></div></li>
<li>{emb("clock")}<div><b>範囲が変わるときは先に確認</b><span>当初の範囲を超える作業は、実施の前に内容と費用を確認します。</span></div></li>
</ul></div></section>{CTA}'''
    return page("flow", f'相談の流れ・費用｜{SITE["name"]}', body)

def faqp():
    faq = ''.join(f'<details><summary>{E(q)}</summary><div class="a"><p>{E(a)}</p></div></details>' for q, a in FAQ)
    body = ph("よくある質問", "ご相談の前によくいただく質問にお答えします。", "chat", [("よくある質問", None)])
    body += f'<section class="sec"><div class="wrap narrow"><div class="faq">{faq}</div></div></section>{CTA}'
    return page("faq", f'よくある質問｜{SITE["name"]}', body)

def company():
    rows = [("窓口の名称", SITE["name"]), ("運営会社", f'{SITE["company"]}（GLOVE）'), ("代表取締役", SITE["rep"]), ("設立", SITE["founded"]),
            ("所在地", SITE["addr"]), ("電話", SITE["tel"]), ("FAX", SITE["fax"]), ("メール", SITE["mail"]),
            ("許認可", SITE["kobutsu"]),
            ("提携行政書士", "提携が確定した事務所の名称・行政書士登録番号・所属する行政書士会を掲載します"),
            ("受付時間", SITE["hours"]), ("対応地域", "全国（遠方の方はZoomによるWeb相談）"), ("相談料", "初回のご相談は無料")]
    def cell(k, v):
        if k == "電話": return f'<a href="tel:{v.replace("-","")}">{E(v)}</a>'
        if k == "メール": return f'<a href="mailto:{v}">{E(v)}</a>'
        return E(v)
    tbl = ''.join(f'<tr><th scope="row">{E(k)}</th><td>{cell(k, v)}</td></tr>' for k, v in rows)
    body = ph("運営会社", f'{SITE["name"]}は、{SITE["company"]}が運営しています。', "building", [("運営会社", None)])
    body += f'''<section class="sec"><div class="wrap narrow"><div class="tbl-wrap"><table class="info"><tbody>{tbl}</tbody></table></div>
<h2 class="h2s">グループの相談窓口</h2><div class="rel">
<a href="https://glove-osaka.github.io/glove-site/" target="_blank" rel="noopener">{ic("building")}<b>{E(SITE["company"])}</b><span class="fine">会社の公式サイト（別の画面で開きます）</span></a>
<a href="https://iejimai123.jp/" target="_blank" rel="noopener">{ic("hand")}<b>家じまい相談窓口</b><span class="fine">家財・住まい・相続・身元保証の相談（別の画面で開きます）</span></a>
<a href="https://119cm.net/" target="_blank" rel="noopener">{ic("people")}<b>医療介護総合支援会</b><span class="fine">大阪・関西の医療・介護の総合窓口（別の画面で開きます）</span></a>
</div></div></section>{CTA}'''
    return page("company", f'運営会社｜{SITE["name"]}', body)

def partner():
    body = ph("士業・提携先の募集", "企業の困りごとを一緒に解決する、専門家と事業者を募集しています。", "hand", [("士業・提携先の募集", None)])
    body += f'''<section class="sec"><div class="wrap"><div class="grid g2">
<div class="card"><h3 class="h3i">{ic("seal")}専門家の方</h3><p>行政書士、社会保険労務士、税理士、司法書士、弁護士、弁理士、中小企業診断士の方。とくに許認可・補助金に強い行政書士の方を募集しています。</p></div>
<div class="card"><h3 class="h3i">{ic("hand")}事業者の方</h3><p>設備・システムの導入、通信・電気、物流・通関、研修・福利厚生、人材サービス（許可事業者）など、企業の課題を解決するサービスをお持ちの方。</p></div></div>
<div class="sec-h" style="margin-top:56px"><span class="eyebrow">提携の考え方</span><h2>お願いしていること</h2></div>
<ul class="pledges two">
<li>{emb("hand")}<div><b>お客様と直接ご契約</b><span>窓口は契約の間に入らず、費用は専門家・事業者から直接ご請求いただきます。</span></div></li>
<li>{emb("lock")}<div><b>紹介料の授受なし（専門家）</b><span>士業の方との間で、紹介の対価のやり取りは行いません。</span></div></li>
<li>{emb("shield")}<div><b>資格・許可の範囲で対応</b><span>資格・許可が必要な業務は、それを持つ方が担当してください。</span></div></li>
<li>{emb("clock")}<div><b>早めのご連絡</b><span>おつなぎしたお客様へ、担当の方から直接ご連絡をお願いします。</span></div></li>
</ul>
<a class="btn btn-p" href="#contact" data-cat="partner" style="margin-top:30px">{ic("pen")}提携について相談する</a></div></section>'''
    return page("partner", f'士業・提携先の募集｜{SITE["name"]}', body)

def contact():
    catopts = ''.join(f'<label><input type="checkbox" name="c-cat" id="cc-{c["id"]}" value="{c["id"]}"><span>{E(c["name"])}<small>{E(c["lead"])}</small></span></label>' for c in CATS)
    catopts += '<label><input type="checkbox" name="c-cat" id="cc-partner" value="partner"><span>提携のご相談<small>士業・事業者として提携したい方</small></span></label>'
    body = ph("相談内容をまとめる", "質問に順番にお答えいただくと、窓口に伝える内容がまとまります。全部で6つの段階です。", "pen", [("相談内容をまとめる", None)])
    body += f'''<section class="sec"><div class="wrap narrow">
<div class="cdirect">{ic("chat")}<p>お急ぎの方は、お電話かメールでもご相談いただけます。<br><b>電話 <a href="tel:{SITE["tel"].replace("-","")}">{E(SITE["tel"])}</a></b>　<b>メール <a href="mailto:{SITE["mail"]}">{E(SITE["mail"])}</a></b><br><span class="fine">受付時間 {E(SITE["hours"])}　全国対応（遠方の方はZoomによるWeb相談）　初回相談無料</span></p></div>
<ol class="steps" id="cSteps"><li>分野</li><li>内容</li><li>状況</li><li>自由記入</li><li>ご連絡先</li><li>確認</li></ol>
<p class="restored" id="cRestored" hidden>前回の入力内容を復元しました。<button type="button" class="linkbtn" id="cClear">入力内容を消して最初から</button></p>
<form class="form-card" id="cForm" novalidate>
<div class="cs" data-s="1"><p class="stepnow">段階 1／6</p><h2>どの分野について相談したいですか</h2><p class="hint">いくつでも選べます。分からないときは「その他の企業相談」を選んでください。</p><div class="opts">{catopts}</div></div>
<div class="cs" data-s="2" hidden><p class="stepnow">段階 2／6</p><h2>具体的には、どの内容ですか</h2><p class="hint">近いものを選んでください。なければ、そのまま次へ進めます。</p><div id="cItems"></div></div>
<div class="cs" data-s="3" hidden><p class="stepnow">段階 3／6</p><h2>会社の状況を教えてください</h2><p class="hint">分かる範囲で構いません。</p>
<div class="fld"><label for="cWhen">いつまでに進めたいですか</label><select id="cWhen"><option value="">選んでください</option><option>1か月以内</option><option>3か月以内</option><option>半年以内</option><option>時期は決まっていない</option></select></div>
<div class="fld"><label for="cInd">業種</label><input id="cInd" placeholder="例：建設業、飲食業、小売業"></div>
<div class="fld"><label for="cSize">従業員の数</label><select id="cSize"><option value="">選んでください</option><option>個人事業主</option><option>1〜5人</option><option>6〜20人</option><option>21〜50人</option><option>51人以上</option></select></div>
<div class="fld"><label for="cArea">所在地（市区町村まで）</label><input id="cArea" placeholder="例：大阪市北区"></div></div>
<div class="cs" data-s="4" hidden><p class="stepnow">段階 4／6</p><h2>伝えておきたいこと</h2><p class="hint">経緯、期限、気がかりなことなどを、ご自由にお書きください。書かなくても進めます。</p>
<div class="fld"><label for="cFree">自由記入</label><textarea id="cFree"></textarea></div></div>
<div class="cs" data-s="5" hidden><p class="stepnow">段階 5／6</p><h2>ご連絡先</h2><p class="hint">電話番号かメールアドレスの、どちらかは必ずご入力ください。</p>
<div class="fld"><label for="cCo">会社名・屋号</label><input id="cCo" autocomplete="organization"></div>
<div class="fld"><label for="cName">お名前（必須）</label><input id="cName" autocomplete="name"></div>
<div class="fld"><label for="cTel">電話番号</label><input id="cTel" type="tel" autocomplete="tel"></div>
<div class="fld"><label for="cMail">メールアドレス</label><input id="cMail" type="email" autocomplete="email"></div>
<div class="fld"><label for="cHow">ご希望の連絡方法・時間帯</label><input id="cHow" placeholder="例：電話、平日の午後"></div>
<label class="agree"><input type="checkbox" id="cAg1"><span><a href="#privacy">個人情報の取り扱い</a>を確認し、記載の目的の範囲で個人情報を取り扱うことに同意します（必須）</span></label>
<label class="agree"><input type="checkbox" id="cAg2"><span>解決に必要な場合、伝える相手と範囲を確認したうえで、専門家・提携先へ相談内容を伝えることに同意します（任意。あとから決めることもできます）</span></label></div>
<div class="cs" data-s="6" hidden><p class="stepnow">段階 6／6</p><h2>内容のご確認</h2><p class="hint">まとめた内容です。誤りがあれば「前に戻る」で直せます。</p>
<dl class="sum" id="cSum"></dl>
<div class="send-on" id="cSendOn" hidden><button type="button" class="btn btn-g" id="cSubmit">{ic("mail")}この内容で相談を送る</button><p class="fine">送信後、受付番号が表示されます。メールアドレスをご入力の方には、受付のお知らせをお送りします。</p></div>
<div class="send-done" id="cDone" hidden role="status"><b>ご相談を受け付けました。</b><p>受付番号 <span class="sel" id="cNo"></span><br>内容を確認し、窓口の担当者からご連絡します。</p></div>
<div class="prep" id="cSend">{ic("mail")}<p id="cSendMsg">受付フォームの送信の仕組みは準備中です。下の「内容を写し取る」でコピーし、メール（<b class="sel">{E(SITE["mail"])}</b>）に貼り付けてお送りください。</p></div>
<button type="button" class="btn btn-o" id="cCopy">{ic("copy")}内容を写し取る（コピー）</button><p class="fine" id="cCopied" role="status"></p>
<input type="text" id="cHp" name="company_url" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
<textarea id="cOut" class="cout" readonly aria-label="まとめた相談内容" hidden></textarea></div>
<p class="err" id="cErr" role="alert" hidden></p>
<div class="form-nav"><button type="button" class="btn btn-o" id="cBack" hidden>‹ 前に戻る</button><button type="button" class="btn btn-p" id="cNext">次へ進む ›</button></div>
</form></div></section>'''
    return page("contact", f'相談内容をまとめる｜{SITE["name"]}', body)

def privacy():
    S = SITE
    PPC = "https://www.ppc.go.jp/enforcement/infoprovision/laws/offshore_report_america/"
    arts = [
     ("1. 事業者", f'{S["company"]}（所在地：{S["addr"]}　代表取締役：{S["rep"]}）は、{S["name"]}（以下「本窓口」）と、本窓口の機能「公的支援マッチ」（補助金・助成金の対象可能性の判定。以下「判定機能」）で取得する個人情報を、個人情報の保護に関する法律その他の法令に従い、以下のとおり取り扱います。'),
     ("2. 取得する情報", "【ご相談】お名前、会社名・屋号、電話番号、メールアドレス、所在地（市区町村）、業種、従業員数、ご相談の内容、ご希望の連絡方法・時間帯。<br>【判定機能】ログインに使うメールアドレス、企業カルテに入力された会社の情報（所在地・業種・従業員数・資本金・事業内容・今後の取組など）、読み取りを依頼されたホームページの住所、送信された名刺の写真。"),
     ("3. 利用の目的", "ご相談内容の確認と整理、ご相談への回答と連絡、専門家・提携事業者の選定とおつなぎ、ご依頼後の進行の管理、判定機能でのログイン用の確認番号の送信、補助金・助成金の対象可能性の判定と結果の表示、ホームページ・名刺の写真からの会社情報の読み取り、サービスの改善（個人を特定しない形での集計を含む）、本窓口からのご案内（ご希望の方のみ）。判定機能の情報を、営業目的のご連絡に使うことはありません。"),
     ("4. 専門家・提携事業者への提供", "ご相談の解決に必要な場合に限り、提供する相手と範囲をご本人に確認し、同意をいただいたうえで、行政書士・税理士・社会保険労務士・司法書士・弁護士・弁理士・中小企業診断士その他の専門家、または提携事業者へ提供します。法令に基づく場合を除き、同意なく第三者へ提供することはありません。"),
     ("5. 業務の委託と利用している外部のサービス", "業務の一部を外部へ委託する場合は、委託先を適切に選び、必要な監督を行います。現在、相談・判定機能の受付とデータの保管、メールの送信には Google LLC（アメリカ合衆国）のサービスを、本サイトの公開にはエックスサーバー株式会社（日本）のサービスを利用しています。"),
     ("6. 判定機能でのAIの利用（外国にある第三者への提供）", f'判定機能では、判定への同意をいただいた企業に限り、企業カルテの内容（ホームページ・名刺の写真から読み取った内容を含みます）を、当社が利用する Anthropic, PBC（アメリカ合衆国）のAI「Claude」に送り、判定と会社情報の読み取りを行います。これは外国にある第三者への個人データの提供にあたる場合があるため、同意の前に次の情報をお知らせします。<br>（1）移転先の国：アメリカ合衆国<br>（2）その国の個人情報の保護に関する制度：連邦全体に適用される包括的な個人情報保護法はなく、分野ごとの法律や州法によって保護されています。詳しくは個人情報保護委員会の<a href="{PPC}" target="_blank" rel="noopener">「外国における個人情報の保護に関する制度等の調査（アメリカ合衆国）」</a>をご覧ください。<br>（3）移転先が講じる措置：Anthropic, PBC のプライバシーポリシー等に基づいて取り扱われます。当社は、名刺の写真は読み取りが終わりしだい削除し、名刺に書かれた個人の氏名・役職・携帯電話番号・個人のメールアドレスは記録しません。<br>同意しない場合も企業カルテの保存はできますが、判定は行いません。同意はカルテのチェックを外すことで、いつでも取りやめられます。'),
     ("7. 安全管理のために講じる措置", "取り扱う担当者の限定、アクセス権の管理、端末とアカウントの保護、従業者への教育など、漏えい・紛失・改ざんを防ぐための措置を講じます。上記5・6のとおり、個人データの一部はアメリカ合衆国の事業者のサービスで取り扱われるため、同国の個人情報の保護に関する制度を把握したうえで安全管理措置を講じています（外的環境の把握）。"),
     ("8. 保存の期間", "利用目的に必要な期間保存し、必要がなくなった情報は、法令で保存が求められる場合を除き、速やかに削除します。判定機能で「この企業を削除」を押した企業の情報は、画面に表示されなくなり、判定にも使いません。保存している情報の削除をご希望の場合は、下記の窓口へご連絡ください。"),
     ("9. 開示・訂正・利用停止などのご請求", "ご本人から、保有個人データの利用目的の通知、開示、訂正・追加・削除、利用停止・消去、第三者提供の停止、第三者提供記録の開示のご請求があった場合は、ご本人であることを確認したうえで、法令に従い遅滞なく対応します。下記の窓口までご連絡ください。"),
     ("10. アクセス情報", "本サイトは、文字の表示に Google Fonts（Google LLC）を利用しており、その際にお使いの端末の通信情報（IPアドレスなど）が Google LLC に送られます。アクセス解析は現在導入していません。導入する場合は、その名称と目的、無効にする方法をこのページに掲載します。"),
     ("11. お問い合わせ・苦情の窓口", f'{S["company"]}　{S["addr"]}　電話 {S["tel"]}（平日10:00〜18:00）　メール {S["mail"]}'),
     ("12. 改定", "法令やサービスの変更に応じて本方針を改定することがあります。改定した場合はこのページでお知らせします。"),
    ]
    body = ph("個人情報の取り扱い", "ご相談と、補助金・助成金の判定機能でお預かりする情報を、必要な範囲で適切に取り扱います。", "lock", [("個人情報の取り扱い", None)])
    body += '<section class="sec"><div class="wrap narrow"><p class="fine" style="margin-bottom:18px">項目をタップすると内容が表示されます。</p><div class="folds policy">' + ''.join(fold(h, f'<p>{t}</p>', cls="polf") for h, t in arts) + f'</div><p class="fine" style="margin-top:28px">制定日：2026年10月16日<br>改定日：2026年11月14日（判定機能・外部サービスの記載を追加）<br>{E(S["company"])}</p></div></section>'
    return page("privacy", f'個人情報の取り扱い｜{SITE["name"]}', body)

# ---------- 共通部品 ----------
def header():
    dd = ''.join(f'<div><h4><a href="#svc-{g["cats"][0]}">{ic(g["icon"])}{E(g["name"])}</a></h4><ul>' + ''.join(f'<li><a href="#svc-{c}">{E(CAT[c]["name"])}</a></li>' for c in g["cats"]) + '</ul></div>' for g in GROUPS)
    return OPENING + f'''<a class="skip" href="#main">本文へ移動</a>
<div class="util"><div class="wrap"><span class="op">運営：<b>{E(SITE["company"])}</b>　資格が必要な業務は提携の専門家が担当します</span>
<div class="util-r"><a class="op-btn adm-btn" href="kanri/" rel="nofollow" data-admin>{ic("lock")}管理者ログイン</a><button type="button" class="op-btn" data-replay><i aria-hidden="true"></i>オープニングを見る</button><div class="fs" role="group" aria-label="文字の大きさ">{ic("fs")}<span>文字の大きさ</span><button type="button" data-fs="" aria-pressed="true">標準</button><button type="button" data-fs="l" aria-pressed="false">大</button><button type="button" data-fs="xl" aria-pressed="false">特大</button></div></div></div></div>
<header class="hd"><div class="wrap hd-in">
<a class="brand" href="#top">{MARK}<span><b>{E(SITE["name"])}</b><small>{E(SITE["sub"])}</small></span></a>
<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="gnav">{ic("menu")}<span>メニュー</span></button>
<nav class="nav" id="gnav" aria-label="サイト内">
<a class="home" href="#top">トップ</a>
<a href="#about">窓口について</a>
<div class="dd" id="dd"><div class="dd-row"><a href="#services">サービス一覧</a><button type="button" class="dd-tg" id="ddTg" aria-expanded="false" aria-controls="ddPanel"><span>13分野を表示</span></button></div><div class="dd-panel" id="ddPanel">{dd}<a class="all more" href="#services">サービス一覧を見る（13分野）</a></div></div>
<a href="#situations">困りごとから探す</a>
<a href="#flow">流れ・費用</a>
<a href="#faq">よくある質問</a>
<a href="#company">運営会社</a>
<button type="button" class="nav-op" data-replay>オープニングを見る</button><a class="nav-op" href="kanri/" rel="nofollow" data-admin>管理者ログイン</a>
<a class="cta" href="#contact">{ic("pen")}相談内容をまとめる</a>
</nav></div></header>'''

def footer():
    svc = ''.join(f'<li><a href="#svc-{c["id"]}">{E(c["name"])}</a></li>' for c in CATS)
    sit = ''.join(f'<li><a href="#{s["id"]}">{E(s["name"])}</a></li>' for s in SITS)
    return f'''<footer class="ft"><div class="wrap ft-in">
<div><a class="brand" href="#top">{MARK}<span><b>{E(SITE["name"])}</b><small>{E(SITE["sub"])}</small></span></a>
<div class="co"><span>受付時間 {E(SITE["hours"])}</span><span>全国対応・初回相談無料</span><span>運営会社　{E(SITE["company"])}</span><span>{E(SITE["addr"])}</span><span>電話 <a href="tel:{SITE["tel"].replace("-","")}">{E(SITE["tel"])}</a>　メール <a href="mailto:{SITE["mail"]}">{E(SITE["mail"])}</a></span></div></div>
<details class="ftf" data-desk-open><summary><h4>窓口</h4></summary><ul><li><a href="#about">窓口について</a></li><li><a href="#flow">流れ・費用</a></li><li><a href="#faq">よくある質問</a></li><li><a href="#diagnosis">4つの質問で整理する</a></li><li><a href="#contact">相談内容をまとめる</a></li><li><a href="hojokin/">補助金・助成金を調べる</a></li><li><a href="#partner">士業・提携先の募集</a></li><li><a href="#company">運営会社</a></li><li><a href="#privacy">個人情報の取り扱い</a></li></ul></details>
<details class="ftf" data-desk-open><summary><h4>サービス一覧</h4></summary><ul>{svc}</ul></details>
<details class="ftf" data-desk-open><summary><h4>困りごとから探す</h4></summary><ul>{sit}</ul></details>
</div><div class="ft-bottom"><div class="wrap"><span class="cp"><button type="button" class="replay" data-replay>オープニングをもう一度見る</button> <a class="replay" href="kanri/" rel="nofollow" data-admin>管理者ログイン</a>　© {E(SITE["company"])}</span></div></div></footer>'''

def build():
    css = open(os.path.join(os.path.dirname(__file__), "style.css"), encoding="utf-8").read()
    app = open(os.path.join(os.path.dirname(__file__), "app.js"), encoding="utf-8").read()
    asst = open(os.path.join(os.path.dirname(__file__), "assist_site.js"), encoding="utf-8").read() + open(os.path.join(os.path.dirname(__file__), "admin_login.js"), encoding="utf-8").read()
    i = app.rstrip().rfind("})();")
    app = app[:i] + asst + "\n" + app[i:]
    js = app + "\n" + open(os.path.join(os.path.dirname(__file__), "opening.js"), encoding="utf-8").read()
    data = json.dumps({"cats": [{"id": c["id"], "name": c["name"], "lead": c["lead"], "items": c["items"], "flow": c["flow"]} for c in CATS],
                       "faq": [list(f) for f in FAQ], "sits": [{"id": x["id"], "name": x["name"], "cats": x["cats"]} for x in SITS], "tel": SITE["tel"],
                       "tags": {k: v[0] for k, v in TAGS.items()}, "mail": SITE["mail"], "site": SITE["name"], "formUrl": SITE["form_url"]}, ensure_ascii=False)
    pages = [top(), about(), services()] + [svc(i, c) for i, c in enumerate(CATS)] + [situations()] + [sit(s) for s in SITS] + [diagnosis(), flowp(), faqp(), company(), partner(), contact(), privacy()]
    pages[0] = pages[0].replace(' hidden>', '>', 1)
    out = f'''<title>{E(SITE["name"])}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="許認可・補助金・資金繰り・採用・承継まで、会社の困りごとを一つの窓口で整理し、提携行政書士・専門家・提携事業者へおつなぎします。運営：{E(SITE["company"])}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=Shippori+Mincho+B1:wght@700;800&display=swap">
<style>{css}</style>
{header()}
<main id="main">{"".join(pages)}</main>
{footer()}
<nav class="mbar" id="mbar" aria-label="相談の入り口"><a href="#contact" class="mb-p">{ic("pen")}相談内容をまとめる</a><a href="#diagnosis" class="mb-o">{ic("quiz")}質問で整理</a></nav>
<script>const SITE_DATA={data};</script>
<script>{js}</script>'''
    os.makedirs(os.path.join(os.path.dirname(__file__), "dist"), exist_ok=True)
    p = os.path.join(os.path.dirname(__file__), "dist", "kigyo-soudan.html")
    open(p, "w", encoding="utf-8").write(out)
    print(p, len(out.encode()))

if __name__ == "__main__":
    build()
