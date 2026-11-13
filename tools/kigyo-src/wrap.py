import urllib.parse,os
src=open('/home/claude/kigyo/dist/kigyo-soudan.html',encoding='utf-8').read()
title='企業支援 総合相談窓口'
desc='許認可・補助金・資金繰り・採用・承継まで、会社の困りごとを一つの窓口で整理し、提携行政書士・専門家・提携事業者へおつなぎします。運営：株式会社グローブ'
url=os.environ.get('SITE_URL','https://glove-osaka.github.io/glove-site/kigyo/')
icon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#1E3460"/><path d="M14 12h13l7 7v17H14z" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M18.5 23h8M18.5 27.5h5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="31" cy="32" r="5.5" fill="#D38B2C"/></svg>'
fav='data:image/svg+xml,'+urllib.parse.quote(icon)
import re
body=src.replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')
body=re.sub(r'<title>.*?</title>\n?','',body,count=1)
body=re.sub(r'<meta name="description"[^>]*>\n?','',body,count=1)
head=f'''<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}｜運営：株式会社グローブ</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<link rel="icon" type="image/svg+xml" href="{fav}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{title}">
<meta property="og:title" content="{title}｜運営：株式会社グローブ">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{url}assets/ogp.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"ProfessionalService","name":"{title}","url":"{url}","description":"{desc}","telephone":"06-6355-0779","email":"kigyosoudan@gmail.com","areaServed":"JP","address":{{"@type":"PostalAddress","addressRegion":"大阪府","addressLocality":"大阪市生野区","streetAddress":"勝山南2-2-7","addressCountry":"JP"}},"parentOrganization":{{"@type":"Organization","name":"株式会社グローブ","url":"https://glove-osaka.github.io/glove-site/"}}}}</script>
<style>:root{{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}img{{max-width:100%}}</style>
'''
i=body.index('<div class="opn"')
out=head+body[:i]+'</head><body>\n'+body[i:]+'\n</body></html>\n'
OUT=os.environ.get('OUT_DIR','/home/claude/glove-site/kigyo')
os.makedirs(OUT,exist_ok=True)
open(OUT+'/index.html','w',encoding='utf-8').write(out)
print('wrapped',len(out.encode()))
