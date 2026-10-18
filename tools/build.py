"""公開用の書き出し：ページごとのHTML・サイトマップを作る。使い方: python3 build.py <アプリのindex.html> <出力先フォルダ> <公開URL>"""
import sys, os, re, json, shutil, subprocess, time, html, datetime
SRC, OUT, SITE = sys.argv[1], sys.argv[2], sys.argv[3].rstrip('/') + '/'
BASE_PATH = '/' + SITE.split('://',1)[1].split('/',1)[1] if SITE.count('/') > 3 else '/'
app = open(SRC, encoding='utf8').read()
# 1) 公開用の殻：<base data-site> を入れる
shell = app.replace('<meta name="viewport"', f'<base href="{BASE_PATH}" data-site>\n<meta name="viewport"', 1)
assert 'data-site' in shell
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
for d in ('images', 'videos', 'audio'): shutil.copytree(os.path.join(os.path.dirname(SRC), d), os.path.join(OUT, d))
open(os.path.join(OUT, '.nojekyll'), 'w').close()
nf = shell.replace('<meta name="theme-color"', '<meta name="robots" content="noindex">\n<meta name="theme-color"', 1)
# 医療介護総合支援会（/medical/）の存在しないURLは、支援会の案内ページへ（MEDICAL_404）
nf = nf.replace('<meta name="robots" content="noindex">', '<meta name="robots" content="noindex">\n'+"<script>if(/^\\/glove-site\\/medical\\//.test(location.pathname)&&!/404\\.html$/.test(location.pathname))location.replace('/glove-site/medical/404.html')</script>", 1)
open(os.path.join(OUT, '404.html'), 'w', encoding='utf8').write(nf)
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf8').write(shell)
BIZ = re.findall(r'\{ id:"([a-z]+)", no:"(\d\d)", en:"[^"]*", ja:"([^"]+)"', app)
ROUTES = [('home','ホーム'),('philosophy','企業理念'),('business','事業領域')] + [(f'business-{i}', ja) for i,_,ja in BIZ] + \
         [('finder','サービスを探す'),('partnership','連携・協業'),('company','会社概要'),('contact','お問い合わせ'),('privacy','プライバシーポリシー'),('terms','利用規約'),('disclaimer','免責事項'),('sitemap','サイトマップ')]
# 2) 各ページを実際に表示して中身を写し取る
srv = subprocess.Popen([sys.executable, os.path.join(os.path.dirname(__file__), 'serve.py'), OUT, '8765'])
time.sleep(1)
js = r'''
const { chromium } = require('playwright');
(async () => {
  const routes = JSON.parse(process.argv[2]); const out = {};
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  for (const r of routes) {
    await p.goto('http://127.0.0.1:8765' + process.argv[3] + (r === 'home' ? '' : r + '/'), { waitUntil: 'load' });
    await p.waitForTimeout(700);
    out[r] = await p.evaluate(() => { const v = document.querySelector('#view').cloneNode(true);
      v.querySelectorAll('canvas,.lens,.toybox').forEach(x => x.remove());
      return { view: v.innerHTML, title: document.title, desc: document.querySelector('meta[name="description"]').content, h1: (document.querySelector('#view h1') || {}).textContent || '' }; });
  }
  console.log(JSON.stringify({ out, errs })); await b.close();
})();
'''
open('/tmp/claude-0/prerender.js', 'w').write(js) if os.path.isdir('/tmp/claude-0') else None
jsfile = '/home/claude/build/prerender.js'; open(jsfile, 'w').write(js)
res = subprocess.run(['node', jsfile, json.dumps([r for r,_ in ROUTES]), BASE_PATH], capture_output=True, text=True,
                     env=dict(os.environ, NODE_PATH=subprocess.run(['npm','root','-g'],capture_output=True,text=True).stdout.strip()))
srv.kill()
data = json.loads(res.stdout.strip().splitlines()[-1]); snaps = data['out']
if data['errs']: print('page errors:', data['errs'])
# 3) 書き出し
ORG = {"@type":"Organization","@id":SITE+"#org","name":"株式会社グローブ","alternateName":["GLOVE","株式会社GLOVE"],"url":SITE,"logo":SITE+"images/logo.png",
       "telephone":"+81-6-6355-0779","foundingDate":"2023-08-10",
       "address":{"@type":"PostalAddress","postalCode":"544-0033","addressRegion":"大阪府","addressLocality":"大阪市生野区","streetAddress":"勝山南2-2-7","addressCountry":"JP"},
       "email":"info@kaitori-d.com","faxNumber":"+81-6-6355-0800","contactPoint":[{"@type":"ContactPoint","telephone":"+81-120-933-496","contactType":"customer service","areaServed":"JP","availableLanguage":"ja"}],"department":[{"@type":"Store","name":"買取大吉 大阪勝山南店","url":"https://www.kaitori-daikichi.jp/store/katsuyamaminami/","telephone":"+81-120-933-496","address":{"@type":"PostalAddress","postalCode":"544-0033","addressRegion":"大阪府","addressLocality":"大阪市生野区","streetAddress":"勝山南2-2-7","addressCountry":"JP"},"geo":{"@type":"GeoCoordinates","latitude":34.65416,"longitude":135.53221},"openingHours":"Mo-Su 10:00-19:00","hasMap":"https://www.google.com/maps/search/?api=1&query=%E8%B2%B7%E5%8F%96%E5%A4%A7%E5%90%89+%E5%A4%A7%E9%98%AA%E5%8B%9D%E5%B1%B1%E5%8D%97%E5%BA%97"}]}
today = datetime.date.today().isoformat()
def url_of(r): return SITE + ('' if r == 'home' else r + '/')
for r, name in ROUTES:
    snap = snaps[r]; u = url_of(r)
    t = html.escape(snap['title'], quote=True); d = html.escape(snap['desc'], quote=True)
    page = shell
    page = re.sub(r'<title>[^<]*</title>', f'<title>{t}</title>', page, count=1)
    page = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{d}">', page, count=1)
    page = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{t}">', page, count=1)
    page = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{d}">', page, count=1)
    page = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{u}">', page, count=1)
    page = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{u}">', page, count=1)
    graph = [ORG]
    if r == 'home': graph.append({"@type":"WebSite","@id":SITE+"#site","url":SITE,"name":"株式会社グローブ 公式サイト","inLanguage":"ja","publisher":{"@id":SITE+"#org"}})
    else:
        crumbs = [("ホーム", SITE)] + ([("事業領域", url_of('business'))] if r.startswith('business-') else []) + [(name, u)]
        graph.append({"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"item":x} for i,(n,x) in enumerate(crumbs)]})
    ld = '<script type="application/ld+json">' + json.dumps({"@context":"https://schema.org","@graph":graph}, ensure_ascii=False) + '</script>\n'
    page = page.replace('<script type="application/ld+json" id="ld">', ld + '<script type="application/ld+json" id="ld">', 1)
    page = page.replace('<main id="view" tabindex="-1"></main>', '<main id="view" tabindex="-1">' + snap['view'] + '</main>', 1)
    assert snap['view'] and 'id="view" tabindex="-1">' + snap['view'][:20] in page
    dest = OUT if r == 'home' else os.path.join(OUT, r); os.makedirs(dest, exist_ok=True)
    open(os.path.join(dest, 'index.html'), 'w', encoding='utf8').write(page)
    print(f'{r:24s} {snap["title"][:40]}  h1={snap["h1"][:20]}')
# 同じ公開場所にある専用サイト（作り直しても検索用の一覧から消さない）。
# 4番目の引数に今の sitemap.xml を渡すと、そこにある他サイトの行もそのまま残す。
_ours = {url_of(r) for r, _ in ROUTES}
_extra = [SITE + d for d in ('medical/', 'iejimai/', 'kigyo/')]
if len(sys.argv) > 4 and os.path.exists(sys.argv[4]):
    for u in re.findall(r'<loc>([^<]+)</loc>', open(sys.argv[4], encoding='utf8').read()):
        if u not in _ours and u not in _extra: _extra.append(u)
SUBSITES = ''.join(f'  <url><loc>{u}</loc><lastmod>{today}</lastmod><priority>0.7</priority></url>\n' for u in _extra)
pri = {'home':'1.0','business':'0.9','philosophy':'0.8','company':'0.8','contact':'0.7','partnership':'0.7','finder':'0.6'}
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
    f'  <url><loc>{url_of(r)}</loc><lastmod>{today}</lastmod><priority>{pri.get(r, "0.8" if r.startswith("business-") else "0.3")}</priority></url>\n' for r,_ in ROUTES) + SUBSITES + '</urlset>\n'
open(os.path.join(OUT, 'sitemap.xml'), 'w').write(sm)
print('pages', len(ROUTES))
