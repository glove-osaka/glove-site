# -*- coding: utf-8 -*-
"""企業支援サイト：1つの index.html から、ページごとの本当の住所（/services/subsidy/ など）を書き出す。
検索エンジンが分野・場面ごとのページを見つけられるようにするため。見た目と動きは同じ。
使い方：python3 paths.py <出力先（sites/bsd.osaka）> <サイトの住所 https://bsd.osaka/>"""
import sys, os, re, html, datetime
OUT, URL = sys.argv[1], sys.argv[2].rstrip('/')
src = open(os.path.join(OUT, 'index.html'), encoding='utf-8').read()
ids = re.findall(r'<section class="page" data-p="([^"]+)"', src)
def path(i):
    if i == 'top': return '/'
    if i.startswith('svc-'): return f'/services/{i[4:]}/'
    if i.startswith('sit-'): return f'/situations/{i[4:]}/'
    return f'/{i}/'
P = {i: path(i) for i in ids}
# 1) どこから開いても同じに動くよう、相対の住所を一番上からに
s = src
for a, b in [('"hojokin/"', '"/hojokin/"'), ('"kanri/"', '"/kanri/"'), ("'kanri/'", "'/kanri/'"), ('"top-0', '"/top-0'), ('"assets/', '"/assets/')]:
    s = s.replace(a, b)
# 2) ページへのリンクを本当の住所に（ページの中の見出しへのリンクはそのまま）
s = re.sub(r'href="#([a-z0-9-]+)"', lambda m: f'href="{P[m.group(1)]}"' if m.group(1) in P else m.group(0), s)
# 3) 住所で動かす合図
s = s.replace('<script>const SITE_DATA=', '<script>window.KG_PATHS=1;</script>\n<script>const SITE_DATA=', 1)
assert 'window.KG_PATHS=1' in s
# 各ページの説明文（見出しの下の文）
def lead(i, sec):
    m = re.search(r'<h1>.*?</h1>\s*<p>(.*?)</p>', sec, re.S)
    t = re.sub(r'<[^>]+>', '', m.group(1)) if m else ''
    return html.unescape(t).strip()
secs = {}
for m in re.finditer(r'<section class="page" data-p="([^"]+)" data-title="([^"]+)"( hidden)?>', s):
    secs[m.group(1)] = (m.start(), m.group(2))
desc0 = re.search(r'<meta name="description" content="([^"]*)">', s).group(1)
urls = []
for i in ids:
    t = s
    title = html.unescape(secs[i][1])
    if i != 'top':
        # 表示するページを切り替える
        t = re.sub(r'(<section class="page" data-p="top" data-title="[^"]+")>', r'\1 hidden>', t, count=1)
        t = re.sub(r'(<section class="page" data-p="%s" data-title="[^"]+") hidden>' % re.escape(i), r'\1>', t, count=1)
        st = t.index(f'data-p="{i}"'); en = t.find('<section class="page"', st + 10)
        d = lead(i, t[st:en if en > 0 else len(t)])
        d = (d + '｜' if d else '') + '企業支援 総合相談窓口（運営：株式会社グローブ）。許認可・補助金・資金繰り・採用・承継まで、会社の困りごとを一つの窓口で整理し、専門家・提携先へおつなぎします。'
        e = html.escape(title, quote=True); de = html.escape(d, quote=True)
        t = re.sub(r'<title>.*?</title>', f'<title>{e}</title>', t, count=1)
        t = t.replace(f'<meta name="description" content="{desc0}">', f'<meta name="description" content="{de}">', 1)
        t = t.replace(f'<meta property="og:description" content="{desc0}">', f'<meta property="og:description" content="{de}">', 1)
        t = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e}">', t, count=1)
    u = URL + P[i]
    t = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{u}">', t, count=1)
    t = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{u}">', t, count=1)
    d = os.path.join(OUT, P[i].strip('/'))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(t)
    urls.append(u)
# 検索エンジン向けの一覧
today = datetime.date.today().isoformat()
extra = [URL + '/hojokin/'] if os.path.exists(os.path.join(OUT, 'hojokin', 'index.html')) else []
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n' for u in urls + extra) + '</urlset>\n'
open(os.path.join(OUT, 'sitemap.xml'), 'w', encoding='utf-8').write(sm)
print('pages', len(urls) + len(extra))
