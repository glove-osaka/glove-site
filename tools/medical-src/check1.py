import os,re,glob,json
from html.parser import HTMLParser
ROOT="/home/claude/glove-site/medical"
pages=sorted(glob.glob(ROOT+"/**/*.html",recursive=True))
class P(HTMLParser):
    def __init__(s):
        super().__init__();s.ids=[];s.links=[];s.imgs=[];s.h1=0;s.lang=None;s.labels=set();s.inputs=[];s.title="";s.it=False;s.media=[]
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=="html":s.lang=a.get("lang")
        if "id" in a:s.ids.append(a["id"])
        if t=="a" and "href" in a:s.links.append(a["href"])
        if t=="img":s.imgs.append(a)
        if t in("source","video"):
            for k in("src","poster"):
                if a.get(k):s.media.append(a[k])
        if t=="link" and a.get("href"):s.links.append(a["href"])
        if t=="h1":s.h1+=1
        if t=="label" and a.get("for"):s.labels.add(a["for"])
        if t in("input","select","textarea") and a.get("type") not in("checkbox","radio","hidden"):s.inputs.append(a.get("id"))
        if t=="title":s.it=True
    def handle_endtag(s,t):
        if t=="title":s.it=False
    def handle_data(s,d):
        if s.it:s.title+=d
iss=[];titles={}
for f in pages:
    rel=os.path.relpath(f,ROOT);src=open(f,encoding="utf-8").read();p=P();p.feed(src)
    titles.setdefault(p.title,[]).append(rel)
    if "{p}" in src or "{{" in src.replace("{{","",0) and False:iss.append((rel,"未置換"))
    if "{p}" in src:iss.append((rel,"未置換{p}"))
    if p.lang!="ja":iss.append((rel,"lang"))
    if p.h1!=1:iss.append((rel,f"h1={p.h1}"))
    d=[i for i in set(p.ids) if p.ids.count(i)>1]
    if d:iss.append((rel,"dup id "+",".join(d)))
    for im in p.imgs:
        if "alt" not in im:iss.append((rel,"alt無 "+im.get("src","")))
    for i in p.inputs:
        if i and i not in p.labels:iss.append((rel,"label無 "+i))
    dd=os.path.dirname(f)
    if rel=="404.html":continue
    for h in p.links+p.media+[im.get("src") for im in p.imgs]:
        if not h or h.startswith(("http","mailto:","tel:","#","data:")):continue
        path=h.split("#")[0].split("?")[0]
        tgt=os.path.normpath(os.path.join(dd,path))
        if not os.path.exists(tgt):iss.append((rel,"リンク切れ "+h))
        frag=h.split("#")[1] if "#" in h else None
        if frag and os.path.exists(tgt) and tgt.endswith(".html") and f'id="{frag}"' not in open(tgt,encoding="utf-8").read():iss.append((rel,"見出し無 "+h))
    # 外部の自サイトURL
for t,v in titles.items():
    if len(v)>1:iss.append((",".join(v),"title重複 "+t))
print("pages",len(pages));print(json.dumps(iss,ensure_ascii=False,indent=0)[:3000])
ext=set()
for f in pages:
    ext|=set(re.findall(r'href="(https?://[^"]+)"',open(f,encoding="utf-8").read()))
print(sorted(ext))
