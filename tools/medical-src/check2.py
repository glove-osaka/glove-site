import glob,os,json,sys
from playwright.sync_api import sync_playwright
ROOT="/home/claude/glove-site/medical"
pages=sorted(glob.glob(ROOT+"/**/*.html",recursive=True))
JS=r"""()=>{
function lum(c){c=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]}
function rgb(s){const m=s.match(/[\d.]+/g);return m?m.map(Number):null}
function bg(el){while(el){const cs=getComputedStyle(el);const b=rgb(cs.backgroundColor);if(cs.backgroundImage!=='none'&&!cs.backgroundImage.includes('gradient'))return null;if(b&&(b.length<4||b[3]>0.9))return b.slice(0,3);el=el.parentElement}return null}
const low=[],small=[],tiny=[];
document.querySelectorAll('body *:not(script):not(style)').forEach(el=>{
 if(!el.getClientRects().length)return;const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1);if(!own)return;
 const cs=getComputedStyle(el);if(cs.visibility==='hidden')return;const fs=parseFloat(cs.fontSize);if(fs<14&&!el.closest('.steps'))small.push(fs+'px「'+el.textContent.trim().slice(0,12)+'」');
 if(el.closest('.hero,.ph,.cta-band'))return;const b=bg(el);if(!b)return;const f=rgb(cs.color);
 const r=(Math.max(lum(f.slice(0,3)),lum(b))+0.05)/(Math.min(lum(f.slice(0,3)),lum(b))+0.05);const need=(fs>=24||(fs>=18.66&&+cs.fontWeight>=700))?3:4.5;
 if(r<need)low.push(r.toFixed(2)+' '+el.tagName+'.'+el.className+'「'+el.textContent.trim().slice(0,12)+'」')});
document.querySelectorAll('a,button,summary,input,select,label').forEach(el=>{const r=el.getBoundingClientRect();if(!r.width||!el.getClientRects().length)return;if(el.closest('p,li.crumbs,.crumbs,.ft li,.fine,.hp')&&el.tagName==='A')return;if(el.type==='hidden'||el.closest('.hp'))return;if(r.height<44&&el.tagName!=='LABEL'&&!(el.tagName==='INPUT'&&(el.type==='checkbox'||el.type==='radio')))tiny.push(el.tagName+'「'+(el.textContent||'').trim().slice(0,12)+'」'+Math.round(r.height))});
return {low:[...new Set(low)].slice(0,5),lowN:low.length,small:[...new Set(small)].slice(0,5),tiny:[...new Set(tiny)].slice(0,6),sw:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}}"""
out={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for scheme in("light","dark"):
        for w in(375,1366):
            ctx=b.new_context(viewport={"width":w,"height":900},color_scheme=scheme)
            ctx.route("**/fonts.g*/**",lambda r:r.abort())
            for f in pages:
                rel=os.path.relpath(f,ROOT);pg=ctx.new_page();errs=[];fails=[]
                pg.on("pageerror",lambda e:errs.append(str(e)[:100]))
                pg.on("requestfailed",lambda r:fails.append(r.url[-50:]) if "fonts.g" not in r.url else None)
                pg.goto("file://"+f);pg.wait_for_timeout(150)
                r=pg.evaluate(JS);o=out.setdefault(rel,{})
                o[f"{scheme}-{w}"]=dict(err=errs,fail=fails,over=r["sw"]>w,**r);pg.close()
            ctx.close()
    b.close()
S=lambda k:{rel:{m:v[m][k] for m in v if v[m][k]} for rel,v in out.items() if any(v[m][k] for m in v)}
print("errors",json.dumps(S("err"),ensure_ascii=False)[:800])
print("fails",json.dumps(S("fail"),ensure_ascii=False)[:800])
print("overflow",[ (rel,m) for rel,v in out.items() for m in v if v[m]["over"]])
print("lowN",{m:sum(v[m]["lowN"] for v in out.values()) for m in next(iter(out.values()))})
print("low ex",sorted({e for v in out.values() for x in v.values() for e in x["low"]})[:10])
print("small ex",sorted({e for v in out.values() for x in v.values() for e in x["small"]})[:12])
print("tiny ex",sorted({e for v in out.values() for x in v.values() for e in x["tiny"]})[:15])
print("top height mobile",out["index.html"]["light-375"]["h"])
