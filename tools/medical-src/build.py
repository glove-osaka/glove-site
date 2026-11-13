# -*- coding: utf-8 -*-
"""医療介護総合支援会サイトの生成。家じまい相談窓口と同じ設計（CSS・部品）を使い、色だけ医療向けに替える。"""
import os, re, json, html, shutil
from data import REGION_ORDER, zone_tree, SITE, ROLES, STATUS, CATS, SUP, PURPOSES, FAQ, ROLE_FAQ, ROLE_CASES, HOUSING, NEWS, PARTNER_TAX, CONTACT_SUB, CONTACT_SPECIAL, CONTACT_GROUPS, SOFT_SUP, SOFT_BADGE
# フォームの送り先：支援会専用の受付（keiyaku_config.js の KEIYAKU_API_URL）が設定されたら、そちらへ切り替える
_k = re.search(r'KEIYAKU_API_URL = "([^"]*)"', open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "keiyaku_config.js"), encoding="utf-8").read())
if _k and _k.group(1):
    SITE["endpoint"] = _k.group(1)
NSUP = len(SUP)

OUT = os.environ.get("MED_OUT", "/home/claude/glove-site/sites/119cm.net")  # 公開先：Xサーバー 119cm.net（GitHub Actions でFTP転送）
SRC_CSS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "iejimai_base.html")  # 家じまいの見た目の写し（2026/11 時点）
E = html.escape

# ---------- 色（常磐色 → 医療向けの深い青緑。構造・書体・山吹色は共通） ----------
CMAP = {
    "#1D4A3D": "#0E5A63", "#163A30": "#0B4A52", "#0F2B23": "#0A2E33", "#E6EEE8": "#E3F0F0", "#EEF2EC": "#EAF2F1",
    "#F8F8F4": "#F6F8F7", "#16201B": "#14211F", "#3B4740": "#3A4A48", "#C9D2CB": "#C6D4D3", "#1E3B33": "#123F45",
    "#C9D6CF": "#C6D6D6", "#D3DFD8": "#D0E0E0", "#D5E0DA": "#D2E1E1", "#DCE6E0": "#D9E7E7", "#E3ECE7": "#E1EDED",
    "#E8F0EB": "#E6F1F1", "#E9F0EC": "#E7F1F1",
    "#8CC3AC": "#86C7C9", "#A8D6C2": "#A6DADB", "#0B1F19": "#081F22", "#1C2C25": "#16292B", "#0C1A15": "#0A1A1C",
    "#101714": "#0E1718", "#17201C": "#152022", "#EEF3EF": "#EEF4F4", "#C2CDC6": "#BFD0D0", "#34423B": "#32464A", "#141E1A": "#121D1F",
}
def load_css():
    s = open(SRC_CSS, encoding="utf-8").read()
    c = re.search(r"<style>(.*?)</style>", s, re.S).group(1)
    for a, b in CMAP.items():
        c = re.sub(re.escape(a), b, c, flags=re.I)
    c = c.replace("rgba(15,43,35", "rgba(10,46,51")
    c = c.replace("常磐色＋山吹色", "深い青緑＋山吹色")
    c = strip_op(c)
    return c + EXTRA_CSS

OPSEL = re.compile(r"\.opn\b|\.op-(start|sb|sk|snd|skip|veil|text|foot|brand|go)\b|\.still\b")
def strip_op(c):
    # 家じまいサイトのオープニング用の指定を取り除く（支援会は独自のオープニングを使う）
    c = re.sub(r"@keyframes opZoom\{(?:[^{}]*\{[^{}]*\})*\}", "", c)
    def fix(m):
        sels = [x for x in m.group(1).split(",") if not OPSEL.search(x)]
        return (",".join(sels) + "{" + m.group(2) + "}") if sels else ""
    c = re.sub(r"([^{}@]+)\{([^{}]*)\}", fix, c)
    c = re.sub(r"@media[^{]*\{\s*\}", "", c)
    return c

EXTRA_CSS = r"""
.sec-sub{display:flex;align-items:center;gap:14px;margin:34px 0 16px;color:var(--muted);font-weight:700}.sec-sub:before,.sec-sub:after{content:"";flex:1;height:1px;background:var(--line)}
.doors.d2{grid-template-columns:repeat(2,minmax(0,1fr))}@media (max-width:760px){.doors.d2{grid-template-columns:1fr}}
.req{display:inline;margin-left:6px;padding:0;background:none;color:#B3261E;font-size:.9em;font-weight:700}
.area-h .small-btn{min-height:40px;padding:0 14px;border-radius:10px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:.92rem;font-weight:700;cursor:pointer}
.area-row{border:2px solid var(--line);border-radius:14px;padding:14px 16px 4px;margin:0 0 12px;background:var(--surface)}.area-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.area-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:start}@media (max-width:760px){.area-g{grid-template-columns:1fr;gap:0}}
.voice-cta{display:flex;align-items:center;gap:16px;margin-top:16px;padding:18px 20px;border-radius:16px;border:2px dashed var(--gold-bright,#C99A45);background:var(--gold-soft,#F5ECDA);color:var(--ink);text-decoration:none;transition:border-color .2s,transform .2s}
.voice-cta:hover{border-style:solid;transform:translateY(-2px)}.voice-cta b{display:block;font-size:1.15rem}.voice-cta small{display:block;color:var(--muted);font-size:.95rem;line-height:1.6;margin-top:2px}
.voice-cta .go{flex:none;margin-left:auto;padding:10px 18px;border-radius:999px;background:var(--gold,#8A621C);color:#fff;font-weight:700;white-space:nowrap}
@media (max-width:560px){.voice-cta{flex-wrap:wrap}.voice-cta .go{margin-left:0;width:100%;text-align:center}}
.door-x{border-style:dashed;border-color:var(--gold-bright,#C99A45);background:var(--gold-soft,#F5ECDA)}.door-x .no{color:var(--gold,#8A621C)}

.news{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.news li{display:grid;grid-template-columns:9.5em 1fr;gap:4px 18px;padding:14px 4px;border-bottom:1px solid var(--line)}
.news time{color:var(--muted);font-variant-numeric:tabular-nums}
.news a{color:var(--pine);display:block;min-height:44px}
.voices-h{font-family:var(--f-display);font-size:1.3rem;margin:0 0 4px}
.voices{display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:16px;margin-top:14px}
.voice{position:relative;margin:0;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px 20px 18px}
.voice blockquote{margin:6px 0 10px;font-family:var(--f-display);font-size:1.08rem;line-height:1.8;color:var(--ink)}
.voice figcaption{font-size:.9rem;color:var(--muted);margin-bottom:10px}
.voice dl{margin:0;display:grid;gap:4px;font-size:.95rem}.voice dt{font-weight:700;color:var(--pine)}.voice dd{margin:0 0 6px}
.tag-ex{display:inline-block;font-size:.78rem;font-weight:700;border-radius:6px;padding:1px 8px;background:var(--pine-soft);color:var(--pine)}
@media (max-width:560px){.news li{grid-template-columns:1fr}}

/* トップをスマホで短く */
@media (max-width:560px){.trust-in{grid-template-columns:1fr 1fr}.trust-in>div{padding:14px 12px;gap:8px;flex-direction:column;align-items:flex-start;border-right:1px solid var(--line);border-bottom:0}.trust-in>div:nth-child(2n){border-right:0}.trust-in>div:nth-child(-n+2){border-bottom:1px solid var(--line)}.trust p b{font-size:1.1rem}.trust p span{font-size:.88rem;line-height:1.5}
.stmt>.stmt-img{display:none}.news li{padding:10px 4px}.cta-band .wrap{padding-block:40px;gap:18px}.cta-band p{font-size:1rem}.sec{padding-block:52px}}
.flow.f4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:960px){.flow.f4{grid-template-columns:1fr 1fr}}
@media (max-width:560px){.flow.f4{grid-template-columns:1fr}}
.sec .note-box+.eyebrow,.sec>.wrap>.note-box{margin-bottom:34px}
.num-c{white-space:nowrap;font-weight:700}
.mtbl th,.mtbl thead th{width:auto}.mtbl tbody th{width:9em}.mtbl td.num-c{width:9.5em}
@media (max-width:640px){.mtbl thead{display:none}.mtbl td[data-l]{display:flex;justify-content:space-between;gap:12px}.mtbl td[data-l]::before{content:attr(data-l);font-weight:400;color:var(--muted)}}
.fld .opts input,.fld input[type=radio],.fld input[type=checkbox]{width:26px;height:26px;min-height:0;padding:0;border-radius:50%;flex-shrink:0}
.fld input[type=checkbox]{border-radius:4px}
.agree span a{display:inline;padding-block:6px}
.est{margin-top:4px}.est b{font-size:1.05rem}
/* オープニング */
.op-sos{display:inline-flex;align-items:center;margin-top:0;color:#fff;font-weight:700}
.op-replay{margin:10px 0 0}.op-replay a{display:inline-flex;align-items:center;gap:6px;min-height:44px;color:inherit;text-decoration:underline;text-underline-offset:.25em}
.opn{position:fixed;inset:0;z-index:200;background:#071a1e;overflow:hidden;transition:opacity 1.4s ease}
.opn.out{opacity:0;pointer-events:none}
.opn video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.opn .still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .3s}
.opn.ttl .still{opacity:1;transition:opacity 1.2s ease}
.opn.ttl video{opacity:0;transition:opacity 1.2s ease}
.op-start{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:radial-gradient(ellipse at center,rgba(8,30,36,.55),rgba(4,14,17,.93)),url(assets/opening-start.jpg) center/cover;color:#F4F8F7;text-align:center;padding:24px}
.op-start-in{display:grid;justify-items:center;gap:14px;max-width:560px}
.op-start .ic{font-size:3.6rem;color:#F4F8F7}
.op-start-t{margin:0;font-family:var(--f-display);font-size:clamp(1.5rem,4vw,2.2rem);letter-spacing:.18em}
.op-start-s{margin:0;font-size:1.05rem;color:#D6E4E2}
.op-start-b{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:10px}
.op-sb{min-height:62px;min-width:200px;padding:0 26px;border-radius:12px;border:2px solid rgba(255,255,255,.85);background:transparent;color:#fff;font:inherit;font-weight:700;font-size:1.15rem;cursor:pointer}
.op-sb.on{background:#D9A93F;border-color:#D9A93F;color:#1A1406}
.op-sb:hover{filter:brightness(1.08)}
.op-sb:focus-visible,.op-sk:focus-visible,.op-go:focus-visible,.op-skip:focus-visible,.op-snd:focus-visible{outline:3px solid #fff;outline-offset:3px}
.op-sk{margin-top:8px;background:none;border:0;color:#D6E4E2;font:inherit;font-size:1rem;text-decoration:underline;text-underline-offset:.25em;cursor:pointer;min-height:44px}
.op-skip,.op-snd{position:absolute;z-index:4;top:max(16px,env(safe-area-inset-top,0px));min-height:48px;padding:0 20px;border-radius:99px;border:1px solid rgba(255,255,255,.75);background:rgba(6,22,26,.55);color:#fff;font:inherit;font-size:1rem;cursor:pointer}
.op-skip{right:max(16px,env(safe-area-inset-right,0px))}
.op-snd{left:max(16px,env(safe-area-inset-left,0px))}
.opn:not(.playing) .op-skip{display:none}
.op-foot{position:absolute;z-index:4;left:50%;bottom:max(7vh,28px);transform:translateX(-50%);width:min(92vw,600px);display:flex;flex-wrap:wrap;justify-content:center;gap:12px;opacity:0;pointer-events:none;transition:opacity 1.2s ease}
.opn.text .op-foot{opacity:1;pointer-events:auto}
.opn.text .op-skip{display:none}
.op-go{white-space:nowrap;background:#0E5A63;color:#fff;border:0;border-radius:10px;min-height:58px;padding:0 32px;font:inherit;font-weight:700;font-size:1.1rem;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.18)}
.op-go:hover{filter:brightness(1.1)}
.op-again{background:#fff;color:#0E5A63;border:1px solid #0E5A63;border-radius:10px;min-height:58px;padding:0 22px;font:inherit;font-weight:700;font-size:1rem;cursor:pointer}
.opn.ttl{background:#EEDFCF}
@media (max-aspect-ratio:1/1){.opn video{object-fit:contain}}
.op-cap{position:absolute;z-index:3;left:50%;top:16%;transform:translateX(-50%);width:min(92vw,980px);text-align:center;color:#F4F8F7;font-family:"BIZ UDMincho",var(--f-display);pointer-events:none}
.op-cap p{margin:0;font-size:clamp(1.45rem,4.4vw,2.9rem);letter-spacing:.16em;line-height:1.75;opacity:0;transform:translate3d(0,10px,0);transition:opacity 1s ease,transform 1s ease;will-change:opacity,transform;text-shadow:0 0 12px rgba(0,0,0,.9),0 2px 4px rgba(0,0,0,.9)}
.op-cap p{transition-delay:0s}
.opn.c1 #opCap1 p+p,.opn.c2 #opCap2 p+p{transition-delay:.7s}
.op-cap p{transition-duration:.9s}
.opn.c1 #opCap1 p,.opn.c2 #opCap2 p{opacity:1;transform:translate3d(0,0,0)}
@media (min-aspect-ratio:1/1){#opCap2{top:auto;bottom:11%}}
.op-title{position:absolute;z-index:3;left:50%;top:44%;transform:translate(-50%,-50%);width:94vw;text-align:center;color:#1E2B4A;font-family:"BIZ UDMincho",var(--f-display);pointer-events:none;opacity:0;transition:opacity 1.4s ease .4s;will-change:opacity}
.op-title b{display:block;font-size:min(8.6vw,5.6rem);letter-spacing:.1em;line-height:1.3;font-weight:700}
.op-title span{display:block;margin-top:.9em;font-size:min(4.4vw,1.75rem);letter-spacing:.2em}
.op-title i{display:block;width:min(46vw,360px);height:1px;margin:.9em auto 0;background:linear-gradient(90deg,transparent,#B48A3C,transparent)}
.opn.ttl .op-title{opacity:1}
.op-co{position:absolute;z-index:3;right:max(18px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));margin:0;font-size:.78rem;letter-spacing:.14em;color:rgba(244,248,247,.5);opacity:0;transition:opacity 1.2s ease;pointer-events:none}
.opn.co .op-co{opacity:1}
.opn.text .op-foot{bottom:max(9vh,32px)}
@media print{.opn{display:none!important}}

/* 医療介護総合支援会：追加の部品 */
.badge{display:inline-flex;align-items:center;gap:6px;font-size:.92rem;font-weight:700;border-radius:99px;padding:3px 14px;line-height:1.6;white-space:nowrap;font-family:var(--f-body);letter-spacing:.04em}
.badge.open{background:var(--pine);color:var(--on-pine)}
.badge.refer{background:var(--pine-soft);color:var(--pine);box-shadow:inset 0 0 0 1px var(--pine)}
.badge.prep{background:var(--gold-soft);color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}
.ph .badge.refer{background:#fff;color:#0A2E33;box-shadow:none}
.ph .badge.prep{background:#F5ECDA;color:#6E4C12;box-shadow:none}
.svcs .badge{margin-left:auto;font-size:.9rem;padding:2px 10px}
.svcs a .arr{margin-left:8px}
.svcs a.soft{align-items:center}.svcs a.soft .st2{display:flex;flex-direction:column;gap:2px;min-width:0}.svcs a.soft .st2 b{font-weight:700;line-height:1.5}.svcs a.soft .st2 small{color:var(--muted);font-size:.92rem;line-height:1.6}.svcs a.soft .badge{flex:none}
.doors.d4{grid-template-columns:repeat(4,minmax(0,1fr))}
.vals{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}
.val{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:24px 20px;display:grid;gap:10px;align-content:start}
.val h3{font-size:1.3rem;color:var(--pine)}
.val p{font-size:1.02rem;color:var(--muted);line-height:1.8}
.vrow{display:grid;grid-template-columns:7em minmax(0,1fr);gap:16px;padding:16px 0;border-bottom:1px solid var(--line)}
.vrow:last-child{border-bottom:0}
.vrow b{color:var(--pine);font-family:var(--f-display);font-size:1.15rem}
.stat3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.stat3 .card h3{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:1.3rem;margin-bottom:12px}
.stat3 .card ul{margin:0;padding-left:1.2em}
.stat3 .card li{margin:4px 0}
.sos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.sos .card{display:grid;gap:6px;align-content:start}
.sos .card b{font-size:1.15rem}
.sos .num-big{font-family:var(--f-display);font-size:1.6rem;color:var(--pine);font-weight:700}
.alert-red{background:#FBEAE6;color:#7A2115;border-radius:12px;padding:18px 22px;font-weight:700;line-height:1.8}
.alert-red a{color:#7A2115}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .alert-red{background:#3A1D18;color:#F6CFC6}:root:not([data-theme="light"]) .alert-red a{color:#F6CFC6}}
:root[data-theme="dark"] .alert-red{background:#3A1D18;color:#F6CFC6}
.radio-opts label{min-height:64px}
.opts input[type=radio]{border-radius:50%}
.done-box{background:var(--pine-soft);border-radius:14px;padding:26px 28px;display:grid;gap:10px}
.done-box b{font-size:1.25rem;color:var(--pine)}
.warn-inline{color:#7A2115;font-weight:700;font-size:1rem;margin-top:8px}
.h-nb{white-space:nowrap}
#gyakutai{scroll-margin-top:90px}
.gy-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:8px}
.gy-form .fld{margin:0}
.gy-out{margin-top:22px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:22px 24px}
.gy-h{font-size:1.3rem;margin-bottom:12px}
.gy-sub{font-weight:700;margin:18px 0 8px;color:var(--gold)}
.gy-list{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.gy-c{display:grid;gap:4px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:var(--bg)}
.gy-c b{font-size:1.05rem}
.gy-c small{color:var(--muted);font-size:.95rem}
.gy-tels{display:flex;flex-wrap:wrap;gap:6px 18px}
.gy-tel{display:inline-flex;align-items:center;min-height:44px;font-family:var(--f-display);font-size:1.45rem;font-weight:700;color:var(--pine);text-decoration:none;letter-spacing:.04em;user-select:all}
.gy-tel:hover{text-decoration:underline}
.gy-src{margin-top:16px}
.gy-src a{display:inline-flex;align-items:center;min-height:44px}
.gy-notes{display:grid;gap:10px;margin-top:20px}
.gy-notes p{display:flex;gap:10px;align-items:flex-start}
.gy-notes .ic{font-size:1.5rem;color:var(--pine);margin-top:3px}
@media (max-width:760px){.gy-form{grid-template-columns:1fr}.gy-out{padding:16px}}
.acc>.acc-body{padding:4px 22px 24px}
.acc>.acc-body>p:first-child{margin-bottom:12px}
.acc .vals{margin-top:6px}
.block>.acc{margin-bottom:0}
.acc-group .acc{margin-bottom:12px}
.acc .contact-box{margin:0;border:0;padding:0;background:none;box-shadow:none}
.fcol>summary{list-style:none;cursor:pointer}
.fcol>summary::-webkit-details-marker{display:none}
.fcol>summary h4{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;margin:0}
@media (max-width:760px){.acc>.acc-body{padding:2px 14px 18px}.fcol{border-bottom:1px solid rgba(255,255,255,.14)}.fcol>summary h4::after{content:"";width:9px;height:9px;border-right:2px solid #E2B868;border-bottom:2px solid #E2B868;transform:rotate(45deg);transition:transform .2s}.fcol[open]>summary h4::after{transform:rotate(-135deg)}.fcol>ul{padding-bottom:12px}}
.cats.c3{grid-template-columns:repeat(3,minmax(0,1fr))}
.stmt-img{aspect-ratio:4/3}
.hero-media img{object-position:62% center}
.stmt-img.vt-l .vt{right:auto;left:22px;top:18px;font-size:clamp(1.1rem,1.7vw,1.45rem);letter-spacing:.18em;line-height:1.7}
.stmt-img .vt{font-family:"BIZ UDMincho",var(--f-display)}
.stmt-img.vt-l::after{background:linear-gradient(90deg,rgba(10,46,51,.72) 0%,rgba(10,46,51,.3) 40%,rgba(10,46,51,0) 70%)}
.stmt-img.vt-l img{object-position:60% center}
@media (max-width:700px){.stmt-img.vt-l .vt{font-size:.95rem;top:12px;left:14px}}
.telbar{background:#0A2E33;box-shadow:0 -2px 0 var(--gold-bright)}
.ft-bottom .replay{min-height:44px;display:inline-flex;align-items:center}
@media (max-width:1000px){.cats.c3{grid-template-columns:1fr}}
@media (max-width:700px){.doors.d4{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.doors.d4 .door{padding:20px 16px;gap:8px}.doors.d4 .door p,.doors.d4 .door .no{display:none}.doors.d4 .door h3{font-size:1.15rem}.doors.d4 .emb.lg{width:3.6rem;height:3.6rem;font-size:2rem}.stmt-img{max-height:260px;overflow:hidden}}
.stat3 .card li a,.alert-red a,.agree a,.sos .card a{display:inline-flex;align-items:center;min-height:44px}
.skip:focus{min-height:44px;display:inline-flex;align-items:center}
.hd .brand{min-height:48px}
.menu-btn span{white-space:nowrap}
@media (max-width:440px){.hd .brand b{font-size:1rem;letter-spacing:.02em}.hd .brand .brand-mark{font-size:1.6rem}.menu-btn{padding-inline:12px;gap:6px}}
.info td a{display:inline-flex;align-items:center;min-height:44px}
.ft .brand{min-height:48px}
@media (max-width:1100px){.vals{grid-template-columns:repeat(3,minmax(0,1fr))}.doors.d4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.stat3{grid-template-columns:1fr}.sos{grid-template-columns:1fr}}
@media (max-width:700px){.vals{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.val{padding:18px 16px}.vrow{grid-template-columns:1fr;gap:4px}.svcs .badge{display:none}}
"""

# ---------- アイコン（家じまいサイトと同じ線の太さ・角の丸め） ----------
IC = {
    "plus": '<path d="M12.5 4h7v8.5H28v7h-8.5V28h-7v-8.5H4v-7h8.5z"/><path class="ac" d="M16 23.5s-4-2.4-4-5.2a2.2 2.2 0 0 1 4-1.3 2.2 2.2 0 0 1 4 1.3c0 2.8-4 5.2-4 5.2z"/>',
    "building": '<path d="M5 27V6h13v21M18 12h9v15M3 27h26"/><path class="ac" d="M9 10h5M9 15h5M9 20h5M22 17h1M22 21h1"/>',
    "worker": '<circle cx="16" cy="9" r="4.5"/><path d="M7 27c0-5 4-9 9-9s9 4 9 9"/><path class="ac" d="M16 20.5v5M13.5 23h5"/>',
    "person": '<circle cx="16" cy="9" r="4.5"/><path d="M7 27c0-5 4-9 9-9s9 4 9 9"/><path class="ac" d="M23.5 6.5l1.5-1.5M25 10h2"/>',
    "family": '<circle cx="11" cy="9" r="3.8"/><circle cx="22" cy="11" r="3.2"/><path d="M3.5 27c0-4.6 3.4-8.3 7.5-8.3s7.5 3.7 7.5 8.3"/><path class="ac" d="M17 27c.4-3.6 2.4-6.2 5-6.2s4.6 2.6 5 6.2"/>',
    "heart": '<path d="M16 27s-11-6.3-11-14a6 6 0 0 1 11-3.3A6 6 0 0 1 27 13c0 7.7-11 14-11 14z"/><path class="ac" d="M11 15h3l1.5-3 2 6 1.5-3h2"/>',
    "yen": '<path d="M9 5l7 10 7-10M16 15v12M10.5 17.5h11M10.5 22h11"/>',
    "link": '<path d="M13.5 18.5a5 5 0 0 0 7 0l4-4a5 5 0 0 0-7-7l-1.5 1.5"/><path class="ac" d="M18.5 13.5a5 5 0 0 0-7 0l-4 4a5 5 0 0 0 7 7l1.5-1.5"/>',
    "hands": '<path d="M4 18l6-6h5l3 3-3 3h-3"/><path d="M28 18l-6-6h-4"/><path class="ac" d="M10 22l4 4 4-1 6-6"/>',
    "gift": '<path d="M5 12h22v5H5zM7 17h18v10H7zM16 12v15"/><path class="ac" d="M16 12c-2-5-7-5-7-2s7 2 7 2zM16 12c2-5 7-5 7-2s-7 2-7 2z"/>',
    "chat": '<path d="M5 6h22v15H14l-6 5v-5H5z"/><path class="ac" d="M10 12h12M10 16h8"/>',
    "doc": '<path d="M8 4h11l6 6v18H8z"/><path d="M19 4v6h6"/><path class="ac" d="M12 16h9M12 20h9M12 24h5"/>',
    "check": '<circle cx="16" cy="16" r="12"/><path class="ac" d="M10.5 16.5l4 4 7-8"/>',
    "clock": '<circle cx="16" cy="16" r="12"/><path class="ac" d="M16 9v7l5 3"/>',
    "pin": '<path d="M16 28s-9-8.5-9-15a9 9 0 0 1 18 0c0 6.5-9 15-9 15z"/><circle class="ac" cx="16" cy="13" r="3.2"/>',
    "mail": '<path d="M4 8h24v16H4z"/><path class="ac" d="M4 9l12 9 12-9"/>',
    "phone": '<path d="M9 4h4.5l2 6-3 2a14 14 0 0 0 7.5 7.5l2-3 6 2V23a2.5 2.5 0 0 1-2.5 2.5C14.5 25.5 6.5 17.5 6.5 6.5A2.5 2.5 0 0 1 9 4z"/>',
    "shield": '<path d="M16 4l10 4v7c0 6.5-4.3 11-10 13-5.7-2-10-6.5-10-13V8z"/><path class="ac" d="M11.5 16l3 3 6-6.5"/>',
    "warn": '<path d="M16 4l13 23H3z"/><path class="ac" d="M16 13v7M16 23.5v.5"/>',
    "home": '<path d="M4 15 16 5l12 10"/><path d="M8 13v14h16V13"/><path class="ac" d="M13 27v-7h6v7"/>',
    "truck": '<path d="M3 8h16v14H3zM19 13h6l4 5v4H19"/><circle class="ac" cx="9" cy="24" r="2.5"/><circle class="ac" cx="23" cy="24" r="2.5"/>',
    "book": '<path d="M5 6h9a3 3 0 0 1 3 3v17a3 3 0 0 0-3-3H5zM27 6h-7a3 3 0 0 0-3 3"/><path class="ac" d="M27 6v17h-7a3 3 0 0 0-3 3"/>',
    "search": '<circle cx="14" cy="14" r="8.5"/><path class="ac" d="M20.5 20.5 27 27"/>',
    "leaf": '<path d="M6 26C6 13 14 6 27 5c-1 13-8 21-21 21z"/><path class="ac" d="M6 26 18 14"/>',
    "cart": '<path d="M3 5h4l3 15h15l3-10H8.5"/><circle class="ac" cx="12" cy="25" r="2"/><circle class="ac" cx="23" cy="25" r="2"/>',
    "users": '<circle cx="12" cy="10" r="4"/><circle cx="22" cy="12" r="3.2"/><path d="M4 26c0-4.5 3.6-8 8-8s8 3.5 8 8"/><path class="ac" d="M20 19c4 0 7 2.8 7 6.5"/>',
    "menu": '<path d="M5 9h22M5 16h22M5 23h22"/>',
    "font": '<path d="M4 25 10 8l6 17M6.2 19h7.6"/><path class="ac" d="M18 25l4.5-12L27 25M19.6 21h5.8"/>',
    "arrow": '<path d="M6 16h20M19 9l7 7-7 7"/>',
    "sos": '<circle cx="16" cy="16" r="12"/><path class="ac" d="M16 9v8M16 21.5v.5"/>',
}
SUP_ICON = {"keiei": "building", "jinzai": "users", "hojo": "yen", "kyodo": "cart", "senmon": "doc", "shokei": "link",
            "shokuba": "chat", "career": "book", "fukuri": "gift", "sagasu": "search", "taiin": "home", "hiyou": "yen",
            "kaigo": "family", "hikkoshi": "truck", "shukatsu": "leaf", "kouken": "shield", "seikatsu": "cart"}
VAL_ICON = {"応援": "heart", "補助": "yen", "支援": "link", "協力": "hands", "優待": "gift"}

def ic(name, cls="ic"):
    return f'<svg class="{cls}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{IC[name]}</svg>'
def emb(name, lg=False):
    return f'<span class="emb{" lg" if lg else ""}">{ic(name)}</span>'
def acc(icon, title, sub, inner, open_=False, aid=""):
    return (f'<details class="acc"{" open" if open_ else ""}{f" id={chr(34)}{aid}{chr(34)}" if aid else ""}><summary>{emb(icon)}<span class="t"><b>{title}</b>'
            + (f'<small>{sub}</small>' if sub else '') + '</span><span class="st"><i aria-hidden="true"></i><span class="op-l">開く</span><span class="cl-l">閉じる</span></span></summary>'
            + f'<div class="acc-body">{inner}</div></details>')

def badge(st):
    return f'<span class="badge {st}">{STATUS[st][0]}</span>'

ROLE = {r["id"]: r for r in ROLES}
CAT_OF = {k: c for c in CATS for k in c["items"]}

# ---------- 共通の枠 ----------
def nav(p, cur):
    def a(href, label, key, extra=""):
        return f'<a{extra} href="{p}{href}"{" aria-current=\"page\"" if cur == key else ""}>{label}</a>'
    roles_dd = "".join(f'<li><a href="{p}roles/{r["id"]}.html">{r["name"]}</a></li>' for r in ROLES)
    cats_dd = "".join(
        f'<div><h4><a href="{p}support/index.html#{c["id"]}">{ic(c["icon"])}{c["name"]}</a></h4><ul>'
        + "".join(f'<li><a href="{p}support/{k}.html">{SUP[k]["name"]}</a></li>' for k in c["items"]) + "</ul></div>"
        for c in CATS)
    return f'''<nav class="nav" id="gnav" aria-label="サイト内">
<a class="home" href="{p}index.html"{" aria-current=\"page\"" if cur == "top" else ""}>トップ</a>
{a("about/index.html", "支援会とは", "about")}
<div class="dd"><a href="{p}roles/index.html"{" aria-current=\"page\"" if cur == "roles" else ""}>立場から選ぶ</a><div class="dd-panel"><div><h4><a href="{p}roles/index.html">{ic("users")}4つの立場</a></h4><ul>{roles_dd}</ul></div><a class="all more" href="{p}roles/index.html">立場の一覧を見る</a></div></div>
<div class="dd"><a href="{p}support/index.html"{" aria-current=\"page\"" if cur == "support" else ""}>支援メニュー</a><div class="dd-panel">{cats_dd}<a class="all more" href="{p}support/index.html">支援メニューを見る（{NSUP}項目）</a></div></div>
{a("flow/index.html", "流れ・費用", "flow")}
{a("faq/index.html", "よくある質問", "faq")}
{a("company/index.html", "運営会社", "company")}
<a class="m-only" href="{p}status/index.html">提供状況</a>
<a class="m-only" href="{p}soudan/index.html">緊急時・公的な相談窓口</a>
<a class="cta" href="{p}contact/index.html">{ic("chat")}相談を送る</a>
</nav>'''

def footer(p):
    return f'''<section class="cta-band"><img class="bg" src="{p}assets/head-5.jpg" alt="" loading="lazy"><div class="wrap">
<div><h2>相談内容が決まっていなくても、<br>だいじょうぶです。</h2><p>立場と目的を選ぶだけで、受付の内容がまとまります。<br>名前を伏せた相談もできます。</p></div>
<a class="btn btn-g" href="{p}contact/index.html">{ic("chat")}相談を送る</a>
</div></section>
<footer class="ft"><div class="wrap ft-in">
<div><a class="brand" href="{p}index.html">{ic("plus", "ic brand-mark")}<span><b>{SITE["name"]}</b><small>みんなで使い、みんなで育てる</small></span></a>
<div class="co"><span>運営会社　{SITE["company"]}</span><span>{SITE["addr"]}</span><span>メール　{SITE["mail"]}</span><span>対応地域　{SITE["area"]}</span></div></div>
<details class="fcol" open><summary><h4>支援会について</h4></summary><ul>
<li><a href="{p}about/index.html">支援会とは</a></li><li><a href="{p}status/index.html">提供状況</a></li><li><a href="{p}member/index.html">会員制度</a></li><li><a href="{p}flow/index.html">相談の流れ・費用</a></li><li><a href="{p}faq/index.html">よくある質問</a></li><li><a href="{p}kyoryoku/teikei.html">提携・協業の申し込み</a></li><li><a href="{p}kyoryoku/youbou.html">要望の窓口</a></li><li><a href="{p}soudan/index.html">緊急時・公的な相談窓口</a></li><li><a href="{p}company/index.html">運営会社</a></li><li><a href="{p}contact/index.html">相談を送る</a></li><li><a href="{p}privacy/index.html">個人情報の取り扱い</a></li><li><a href="{p}terms/index.html">利用規約・免責事項</a></li><li><a href="{p}member/tokushoho.html">特定商取引法に基づく表記</a></li></ul></details>
<details class="fcol" open><summary><h4>立場から選ぶ</h4></summary><ul>{"".join(f'<li><a href="{p}roles/{r["id"]}.html">{r["name"]}</a></li>' for r in ROLES)}<li><a href="{p}roles/index.html">4つの立場の一覧</a></li></ul></details>
<details class="fcol" open><summary><h4>支援メニュー</h4></summary><ul>{"".join(f'<li><a href="{p}support/index.html#{c["id"]}">{c["name"]}</a></li>' for c in CATS)}<li><a href="{p}support/index.html">すべての支援メニュー</a></li></ul>
<h4 style="margin-top:22px">関連する窓口</h4><ul><li><a href="{SITE["iejimai"]}">家じまい相談窓口</a></li><li><a href="{SITE["kigyo"]}">企業支援 総合相談窓口</a></li><li><a href="{SITE["globe"]}">株式会社グローブ</a></li></ul></details>
</div><div class="ft-bottom"><div class="wrap"><span>© {SITE["company"]}</span><span class="ft-img">掲載の写真・映像はイメージです</span><a class="replay" href="{p}privacy/index.html">個人情報の取り扱い</a><a class="replay" href="{p}keiyaku/admin.html" rel="nofollow">担当者ログイン</a></div></div></footer>
<a class="telbar" href="{p}contact/index.html">{ic("chat")}相談を送る（ウェブ受付）</a><script>document.body.classList.add("has-telbar")</script>'''

COMMON_JS = r"""<script>
(function(){var b=document.getElementById('menuBtn'),n=document.getElementById('gnav');
if(b)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);b.querySelector('span').textContent=o?'閉じる':'メニュー';});
var root=document.documentElement,bs=document.querySelectorAll('.fs button');
function set(v){if(v)root.setAttribute('data-fs',v);else root.removeAttribute('data-fs');bs.forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.fs===v))});try{localStorage.setItem('iryo-fs',v)}catch(e){}}
var saved='';try{saved=localStorage.getItem('iryo-fs')||''}catch(e){}
if(saved)set(saved);bs.forEach(function(x){x.addEventListener('click',function(){set(x.dataset.fs)})});
var fc=document.querySelectorAll('.fcol'),narrow=window.matchMedia&&matchMedia('(max-width:760px)').matches;
fc.forEach(function(d){if(narrow)d.removeAttribute('open');else d.querySelector('summary').addEventListener('click',function(e){e.preventDefault()})});
if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t&&t.tagName==='DETAILS')t.open=true}
var v=document.getElementById('heroV'),c=document.getElementById('vctl');
if(v&&c){function st(p){c.classList.toggle('paused',p);c.querySelector('span').textContent=p?'動画を再生する':'動画を止める'}
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');try{v.pause()}catch(e){}st(true)}
c.addEventListener('click',function(){if(v.paused){var q=v.play();if(q&&q.catch)q.catch(function(){});st(false)}else{v.pause();st(true)}})}
})();
</script>"""

def page(path, title, desc, body, cur="", extra_js="", full_title=None, ld=None):
    depth = path.count("/")
    p = "../" * depth
    url = SITE["base"] + (path[:-10] if path.endswith("index.html") else path)
    t = full_title or f"{title}｜{SITE['name']}"
    ldj = ld or {"@context": "https://schema.org", "@type": "WebPage", "name": t, "url": url,
                 "isPartOf": {"@type": "WebSite", "name": SITE["name"], "url": SITE["base"]},
                 "publisher": {"@type": "Organization", "name": SITE["company"]}}
    doc = f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{E(t)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#0A2E33">
<link rel="canonical" href="{url}">
<link rel="icon" href="{p}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{p}assets/apple-touch-icon.png">
<meta property="og:type" content="{"website" if cur == "top" else "article"}">
<meta property="og:site_name" content="{SITE["name"]}">
<meta property="og:title" content="{E(t)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE["base"]}assets/ogp.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=BIZ+UDPMincho:wght@700&family=BIZ+UDMincho:wght@700&display=swap">
<script type="application/ld+json">{json.dumps(ldj, ensure_ascii=False)}</script>
<style>{CSS}</style>
</head>
<body>
<a class="skip" href="#main">本文へ移動</a>
<div class="util"><div class="wrap"><span class="op">ウェブ総合受付：<b>受付中</b>（LINE・電話での相談は準備中）</span>
<div class="util-r"><div class="fs" role="group" aria-label="文字の大きさ">{ic("font")}<span>文字の大きさ</span><button type="button" data-fs="" aria-pressed="true">標準</button><button type="button" data-fs="l" aria-pressed="false">大</button><button type="button" data-fs="xl" aria-pressed="false">特大</button></div></div></div></div>
<header class="hd"><div class="wrap hd-in">
<a class="brand" href="{p}index.html">{ic("plus", "ic brand-mark")}<span><b>{SITE["name"]}</b><small>{SITE["sub"]}</small></span></a>
<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="gnav">{ic("menu")}<span>メニュー</span></button>
{nav(p, cur)}</div></header>
{body.replace("{p}", p)}
{footer(p)}
{COMMON_JS}{extra_js}
<script src="{p}assets/guide.js" data-mode="site"></script>
</body>
</html>
'''
    out = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(doc)
    PAGES.append(path)

def ph(title, lead, crumbs, img="head-5.jpg", icon="plus", num=""):
    cr = '<li><a href="{p}index.html">トップ</a></li>' + "".join(
        f'<li><a href="{{p}}{h}">{E(n)}</a></li>' if h else f'<li aria-current="page">{E(n)}</li>' for n, h in crumbs)
    return f'''<section class="ph"><img class="bg" src="{{p}}assets/{img}" alt=""><div class="wrap">{emb(icon, True)}<div><nav aria-label="現在地"><ol class="crumbs">{cr}</ol></nav>{num}<h1>{title}</h1><p>{lead}</p></div></div></section>'''

def top_voices():
    out = []
    for r in ROLES:
        who, q, d, after = ROLE_CASES[r["id"]][0]
        out.append(f'<figure class="voice"><span class="tag-ex">参考事例・{r["name"]}</span><blockquote>「{q}」</blockquote><figcaption>{who}</figcaption><dl><dt>支援会でしたこと</dt><dd>{d}</dd></dl><p style="margin-top:8px"><a class="more" href="{{p}}roles/{r["id"]}.html">{r["name"]}の相談の例をもっと見る</a></p></figure>')
    return '<div class="voices">' + "".join(out) + '</div>'
def sec_h(eyebrow, h2, p_="", c=False):
    return f'<div class="sec-h{" c" if c else ""}"><span class="eyebrow">{eyebrow}</span><h2>{h2}</h2>{f"<p>{p_}</p>" if p_ else ""}</div>'

def contact_link(role=None, purpose=None, s=None):
    q = "&".join(x for x in [f"role={role}" if role else "", f"p={purpose}" if purpose else "", f"s={s}" if s else ""] if x)
    return "{p}contact/index.html" + (("?" + q) if q else "")

def sup_li(k, rel=""):
    s = SUP[k]
    return f'<li><a href="{rel}{k}.html">{ic(SUP_ICON[k])}<span class="n">{s["num"]}</span><span>{s["name"]}</span>{badge(s["status"])}<span class="arr">›</span></a></li>'

def soft_li(k, rel=""):
    s = SUP[k]; t, d = SOFT_SUP[k]
    return f'<li><a href="{rel}{k}.html" class="soft">{ic(SUP_ICON[k])}<span class="st2"><b>{t}</b><small>{d}</small></span><span class="badge {s["status"]}">{SOFT_BADGE[s["status"]]}</span><span class="arr">›</span></a></li>'

def faq_html(items):
    return '<div class="faq">' + "".join(f'<details><summary>{E(q)}</summary><div class="a"><p>{E(a)}</p></div></details>' for q, a in items) + "</div>"

SAFETY = '''<div class="alert-red" role="note">この窓口は緊急の対応を行っていません。命や体に関わるときは<b>119番</b>、事件・事故は<b>110番</b>へ。救急車を呼ぶか迷うときは、大阪府内では救急安心センターおおさか（<b>#7119</b>）へご相談ください。<a href="{p}soudan/index.html">ほかの公的な相談窓口</a></div>'''

PAGES = []
CSS = ""

# ---------- トップ ----------
def extra_doors(pre):
    return f'''<div class="sec-sub"><span>立場とは別の窓口</span></div><div class="doors d2 x2">
<a class="door door-x" href="{pre}kyoryoku/teikei.html">{emb("hands", True)}<span class="no">事業者・専門家の方</span><h3>提携・協業の申し込み</h3><p>会員へサービスを提供したい事業者、協力いただける専門家（士業・医師など）、協賛会員として参加したい企業の方の窓口です。</p><span class="more">申し込みフォームへ</span></a>
<a class="door door-x" href="{pre}kyoryoku/youbou.html">{emb("chat", True)}<span class="no">どなたでも</span><h3>要望の窓口</h3><p>「こんな支援がほしい」「ここを改善してほしい」という声を受け付けます。名前なしでも送れます。</p><span class="more">要望を送る</span></a>
</div>'''

def build_top():
    doors = "".join(f'''<a class="door" href="{{p}}roles/{r["id"]}.html">{emb(r["icon"], True)}<span class="no">入口 {i+1}</span><h3>{r["name"]}</h3><p>{r["short"]}。{"、".join(r["topics"][:3])}など。</p><span class="more">この立場で選ぶ</span></a>''' for i, r in enumerate(ROLES))
    vals = "".join(f'<div class="val">{emb(VAL_ICON[k])}<h3>{k}</h3><p>{t}</p></div>' for k, t in [
        ("応援", "経営、仕事、療養、介護、家族の選択を、情報と人のつながりで後押しします。"),
        ("補助", "費用の負担を軽くする公的な制度や手続きの情報を整理します。"),
        ("支援", "困りごとをひとつの窓口で受け付け、整理し、合う相談先への接続を検討します。"),
        ("協力", "事業者、施設、働く方、地域、専門家が、強みを持ち寄る場をつくります。"),
        ("優待", "共同購入や福利厚生など、集まる力を生かした仕組みを準備しています。")])
    cats = "".join(f'''<div class="catp" id="{c["id"]}"><div class="catp-h">{emb(c["icon"], True)}<h3><a href="{{p}}support/index.html#{c["id"]}">{c["name"]}</a></h3></div><p>{c["lead"]}</p><div class="chips">{"".join(f'<a href="{{p}}support/{k}.html">{ic(SUP_ICON[k])}{SUP[k]["name"]}</a>' for k in c["items"])}</div></div>''' for c in CATS)
    cats_acc = "".join(acc(c["icon"], c["name"], f'{len(c["items"])}項目', '<p>' + c["lead"] + '</p><div class="chips">' + "".join(f'<a href="{{p}}support/{k}.html">{ic(SUP_ICON[k])}{SUP[k]["name"]}</a>' for k in c["items"]) + '</div>') for c in CATS)
    body = f'''<main id="main">
<div class="opn" id="op" hidden role="dialog" aria-label="オープニング映像" aria-modal="true">
<video id="opV" muted playsinline preload="metadata" aria-hidden="true"><source src="{{p}}assets/opening.mp4?v=2" type="video/mp4"><source src="{{p}}assets/opening.webm?v=2" type="video/webm"></video>
<img class="still" src="{{p}}assets/opening-clean.jpg" alt="" aria-hidden="true" loading="lazy">
<div class="op-cap" id="opCap1" aria-hidden="true"><p>立場は、それぞれ。</p><p>抱える悩みも、それぞれ。</p></div>
<div class="op-cap" id="opCap2" aria-hidden="true"><p>この扉の向こうに、</p><p>解決への道があります。</p></div>
<div class="op-title" aria-hidden="true"><b>医療介護総合支援会</b><i></i><span>医療と介護の未来を、つなぐ。</span></div>
<p class="op-co" aria-hidden="true">運営　株式会社グローブ</p>
<div class="op-start" id="opStart"><div class="op-start-in">{ic("plus")}<p class="op-start-t">医療介護総合支援会</p><p class="op-start-s">はじめに、短い映像（約11秒）をご覧ください。</p>
<div class="op-start-b"><button type="button" class="op-sb on" id="opSound">音ありで見る</button><button type="button" class="op-sb" id="opMute">音なしで見る</button></div>
<button type="button" class="op-sk" id="opSkip0">映像をとばして、ホームページへ</button>
<a class="op-sk op-sos" href="{{p}}soudan/index.html">急ぎのとき・緊急の相談窓口はこちら</a></div></div>
<div class="op-foot"><button class="op-go" id="opGo" type="button">ホームページへ進む</button><button class="op-again" id="opAgain" type="button">もう一度見る</button></div>
<button class="op-snd" id="opSnd" type="button" hidden>音を消す</button>
<button class="op-skip" id="opSkip" type="button">とばす</button>
</div>
<section class="hero">
<div class="hero-media"><picture><source srcset="{{p}}assets/hero.webp" type="image/webp"><img src="{{p}}assets/hero.jpg" alt="" width="1920" height="1072" fetchpriority="high" decoding="async"></picture></div>
<div class="wrap hero-in"><div class="hero-copy">
<span class="lbl">みんなで使い、みんなで育てる総合支援会</span>
<h1>医療・介護に関わる<br>すべての人を、<br><span class="h-nb">応援し、</span><span class="h-nb">支え、</span><span class="h-nb">つなぐ。</span></h1>
<p class="lead">困ったときだけではありません。経営をよくしたい、働きやすくしたい、暮らしを便利にしたい、家族を支えたい。皆さまの声から、求められる支援を増やしていきます。</p>
<div class="btns"><a class="btn btn-g" href="{{p}}contact/index.html">{ic("chat")}相談を送る</a><a class="btn btn-w" href="{{p}}roles/index.html">{ic("users")}自分の立場から選ぶ</a></div>
<p class="note"><b>ご相談の受付・整理は無料</b>　名前を伏せた相談もできます<br>対応地域：{SITE["area"]}</p>
<p class="op-replay"><a href="#op" data-op>{ic("arrow")}オープニング映像を見る（約11秒）</a></p>
</div></div></section>

<div class="trust"><div class="wrap"><div class="trust-in">
<div>{emb("users")}<p><b>4つの立場</b><span>企業・働く方・ご本人・ご家族の総合窓口</span></p></div>
<div>{emb("chat")}<p><b>受付は無料</b><span>費用がかかる支援は、必ず事前にご説明</span></p></div>
<div>{emb("shield")}<p><b>無断で共有しない</b><span>ご本人の同意なく、勤務先や外部へ伝えません</span></p></div>
<div>{emb("doc")}<p><b>判断は資格者へ</b><span>医療・法律・税務・労務の判断は専門家が担当</span></p></div>
</div></div></div>

<section class="sec"><div class="wrap">
{sec_h("まず、あなたの立場から", "4つの入口から、お選びください", "選んだ立場に関係する相談・支援・優待・協力の方法だけをご案内します。どれを選べばよいか分からないときは、そのまま受付フォームへお進みください。", True)}
<div class="doors d4">{doors}</div>
<p style="margin-top:26px;text-align:center"><a class="more" href="{{p}}contact/index.html">どの立場か分からない・近いものがない</a></p>
</div></section>



<section class="sec"><div class="wrap stmt">
<div class="stmt-img"><img src="{{p}}assets/statement.jpg" alt="明るい施設の通路で、車いすの方に職員が付き添い、ご夫婦が並んで歩いている様子" loading="lazy"><span class="vt">声から、<br>支援を育てる。</span></div>
<div><span class="eyebrow">成長型の支援会</span><h2>完成したサービスを<br>並べるだけではありません。</h2>
<div class="body"><p>皆さまの困りごとと「こんな支援がほしい」という声を集め、いまある支援へつなぎ、足りないものは補い、まだないものは協力者とつくります。</p><p>できた支援は、4つの立場すべてへ還元します。</p></div>
<ul class="pledges">
<li>{emb("check")}<div><b>事務局が勝手に判断しません</b><span>医療・法律・税務・労務の判断が必要なときは、資格を持つ専門家・専門機関へおつなぎします。</span></div></li>
<li>{emb("shield")}<div><b>同意なく共有しません</b><span>相談の内容を外部へ伝えるときは、共有先・目的・範囲・費用をご説明し、同意をいただいてからにします。</span></div></li>
<li>{emb("link")}<div><b>紹介料は受け取りません</b><span>弁護士・行政書士などの専門家へのご案内で、専門家から紹介料を受け取ることはありません。</span></div></li>
</ul>
<div style="margin-top:22px">{acc("heart", "5つの価値を、4つの立場それぞれへ", "応援・補助・支援・協力・優待", "<div class=" + chr(34) + "vals" + chr(34) + ">" + vals + "</div>")}</div>
<a class="voice-cta" href="{{p}}kyoryoku/youbou.html">{emb("chat", True)}<span><b>要望の窓口</b><small>「こんな支援がほしい」「ここを改善してほしい」をお聞かせください。名前なしでも送れます。</small></span><span class="go">声を送る ›</span></a>
<p style="margin-top:22px"><a class="more" href="{{p}}about/index.html">支援会について詳しく見る</a></p></div>
</div></section>

<section class="sec band"><div class="wrap">
{sec_h("支援メニュー", f"3つの分類、{NSUP}の支援", "支援メニューのページでは、それぞれが受付中か、相談後に確認するものか、準備中かを表示しています。")}
<div class="acc-group">{cats_acc}</div>
<p style="margin-top:26px"><a class="btn btn-o" href="{{p}}support/index.html">支援メニューと提供状況を見る</a></p>
<a class="voice-cta" href="{{p}}kyoryoku/teikei.html" style="margin-top:22px">{emb("hands", True)}<span><b>提携・協業の申し込み</b><small>これらの支援を一緒に提供していただける事業者・専門家（士業・医師など）・協賛企業を募集しています。分野を選んでお申し込みください。</small></span><span class="go">申し込む ›</span></a>
</div></section>

<section class="sec"><div class="wrap">
{sec_h("相談の例", "それぞれの立場から、こんなご相談をお受けしています", "よくあるご相談をもとに作成した参考事例です。結果は状況により異なります。")}
{top_voices()}
</div></section>

<section class="sec dark"><div class="wrap">
{sec_h("相談の流れ", "受付から、同意のうえでおつなぎするまで", "窓口が目的と優先順位を整理し、必要な資格・役割を確認してから、対応の範囲・費用・共有先をご説明します。ご了承いただくまで、外部へおつなぎすることはありません。")}
<div class="btns"><a class="btn btn-w" href="{{p}}flow/index.html">流れと費用の考え方を見る</a><a class="btn btn-w" href="{{p}}about/index.html">支援会の体制を見る</a></div>
</div></section>

<section class="sec"><div class="wrap" style="max-width:900px">
{sec_h("お知らせ", "最近の更新")}
<ul class="news">{"".join(f'<li><time datetime="{dt}">{dt[:4]}年{int(dt[5:7])}月{int(dt[8:])}日</time>' + (('<a href="' + chr(123) + 'p' + chr(125) + u + '">' + t + '</a>') if u else ('<span>' + t + '</span>')) + '</li>' for dt, t, u in NEWS[:2])}</ul>
</div></section>

<section class="sec band"><div class="wrap" style="max-width:900px">
{sec_h("よくある質問", "はじめての方からよくいただくご質問")}
{faq_html(FAQ[:2])}
<p style="margin-top:20px"><a class="more" href="{{p}}faq/index.html">よくある質問をすべて見る</a></p>
</div></section></main>'''
    ld = {"@context": "https://schema.org", "@type": "Organization", "name": SITE["name"], "url": SITE["base"],
          "logo": SITE["base"] + "assets/apple-touch-icon.png", "email": SITE["mail"], "areaServed": "大阪府・関西",
          "parentOrganization": {"@type": "Organization", "name": SITE["company"], "url": SITE["globe"],
                                 "address": {"@type": "PostalAddress", "postalCode": "544-0033", "addressRegion": "大阪府", "addressLocality": "大阪市生野区", "streetAddress": "勝山南2-2-7", "addressCountry": "JP"}}}
    page("index.html", "", f"大阪・関西の医療・介護に関わる企業・事業者、働く方、ご本人、ご家族の総合窓口。相談・支援情報・要望・協力をウェブで受け付け、必要に応じて専門家・提携先へおつなぎします。",
         body, cur="top", extra_js=OPENING_JS, full_title=f"{SITE['name']}｜大阪・関西の医療・介護の総合窓口", ld=ld)

# ---------- 支援会について ----------
def build_about():
    body = ph("支援会とは", "医療介護総合支援会が大切にしていることと、できること・できないことをご説明します。", [("支援会とは", None)], "head-5.jpg", "plus") + f'''
<section class="sec"><div class="wrap stmt">
<div class="stmt-img vt-l"><img src="{{p}}assets/minna.jpg" alt="木のぬくもりのある明るい部屋で、医療・介護の職員、医師、事業者、ご家族が一つのテーブルを囲んで話し合っている様子" loading="lazy"><span class="vt">みんなで使い、<br>みんなで育てる。</span></div>
<div><span class="eyebrow">私たちの考え</span><h2>医療・介護に関わる人が、<br>ひとりで抱えこまないために。</h2>
<div class="body"><p>医療・介護の現場には、経営する方、働く方、医療や介護を受ける方、支えるご家族がいます。立場は違っても、「どこに相談すればよいか分からない」という困りごとは共通しています。</p><p>医療介護総合支援会は、4つの立場の声をひとつの窓口で受け止め、いまある支援へつなぎ、足りない支援を協力者とつくっていく会です。</p></div></div>
</div></section>
<section class="sec"><div class="wrap greet" style="max-width:860px">
{sec_h("事務局より", "ひとりで抱えこまず、<br>まずは声を聞かせてください。")}
<p>医療や介護の現場で働く方、事業所を営む方、医療や介護を受ける方、支えるご家族。立場は違っても、「どこに相談すればよいか分からない」という声を多く聞いてきました。</p>
<p>この支援会は、そうした声をひとつの窓口で受け止め、いまある支援へつなぎ、足りない支援は協力者と一緒につくっていくために生まれました。</p>
<p>医療や法律の判断が必要なことは、必ず資格を持つ専門家へおつなぎします。ご本人の同意なく、相談の内容を外部へ伝えることはありません。相談内容が決まっていなくても大丈夫です。どうぞ気軽にお声がけください。</p>
<p class="sign">医療介護総合支援会 事務局</p>
</div></section>
<section class="sec band"><div class="wrap">
{sec_h("育つ仕組み", "声を集め、支援を育て、みんなへ還元する")}
{acc("leaf", "6つの段階を見る", "声を集める → つなぐ → 補う → つくる → 還元する", """<ol class="flow"><li><div><b>声を集める</b><p>困りごとと「こんな支援がほしい」という声を受け付けます。</p></div></li><li><div><b>いまある支援へつなぐ</b><p>公的な窓口・専門家・提携先の中から、合う先をご案内します。</p></div></li><li><div><b>足りない部分を補う</b><p>つなぐだけでは足りないところを、窓口が整理し補います。</p></div></li><li><div><b>新しい支援をつくる</b><p>多く寄せられた要望は、協力者と一緒に新しい支援にします。</p></div></li><li><div><b>みんなへ還元する</b><p>できた支援は、4つの立場すべてが使えるようにします。</p></div></li><li><div><b>提供状況を正しく示す</b><p>受付中・準備中を正しく表示し、できないことは約束しません。</p></div></li></ol>""")}
</div></section>
<section class="sec"><div class="wrap">
{sec_h("できること・できないこと", "事務局が勝手に判断せず、適切な先へ")}
<div class="acc-group">{acc("check", "支援会の窓口が行うこと", "受付・整理・情報のご案内・おつなぎ", """<ul class="dots"><li>相談・要望・協力の申し出の受付</li><li>内容と優先順位の整理</li><li>公的な制度・相談窓口の情報のご案内</li><li>専門家・提携先への接続の検討と、ご説明</li><li>家財の買取査定（運営会社 株式会社グローブ）</li></ul>""")}{acc("warn", "支援会の窓口が行わないこと", "医療・法律の判断、申請書類の作成、職業紹介、緊急対応", """<ul class="dots"><li>診断・治療など医療の判断</li><li>法律・税務・労務の専門的な判断</li><li>補助金などの申請書類の作成（行政書士・社会保険労務士が担当）</li><li>特定の事業所への就職のあっせん（職業紹介）</li><li>緊急時の対応（119番・110番へ）</li></ul>""")}</div>
</div></section>
<section class="sec dark"><div class="wrap">
{sec_h("安心の体制", "3つの役割が連携して、お支えします", "だれが何を担当するのかを、はじめにはっきりお伝えします。")}
<div class="tiers"><div class="tier">{ic("chat")}<span class="k">1　支援会の窓口</span><h3>受付と整理</h3><p>相談・要望・協力の申し出を受け付け、目的と優先順位を整理し、対応先を検討します。家財の買取査定は運営会社が直接対応します。</p></div><div class="tier">{ic("hands")}<span class="k">2　提携事業者</span><h3>サービスの提供</h3><p>引越し・片付け・研修・共同購入などは、内容と地域に合う提携先へおつなぎします。契約はお客様と提携先の間で結ばれます。</p></div><div class="tier">{ic("shield")}<span class="k">3　有資格者・専門機関</span><h3>専門的な判断</h3><p>診断・治療、法律、税務、労務、許認可の判断や書類の作成は、医療機関や弁護士・税理士・社会保険労務士・行政書士が担当します。</p></div></div>
</div></section>
<section class="sec"><div class="wrap"><p class="fine">運営会社や連携している窓口は、<a href="{{p}}company/index.html">運営会社</a>のページでご案内しています。</p></div></section>'''
    page("about/index.html", "支援会とは", "医療介護総合支援会の考え方と、声を集めて支援を育てる仕組み、窓口ができること・できないこと、だれが何を担当するかの体制をご説明します。大阪・関西の医療・介護に関わる方の総合窓口です。", "<main id=\"main\">" + body + "</main>", cur="about")

# ---------- 立場 ----------
ROLE_PHOTO = {
    "kigyo": ("kigyo.jpg", "明るい会議室で、事業所の管理者や職員が資料やパソコンの数字を見ながら話し合っている様子", "現場と経営を、<br>ともに支える。"),
    "kazoku": ("kazoku.jpg", "明るい住まいのダイニングで、家族がテーブルを囲み、資料に書き込みながら相談している様子", "家族の心配を、<br>ひとりで抱えない。"),
    "honnin": ("honnin.jpg", "明るい住まいのリビングで、高齢のご夫婦がソファに並んで座り、お茶を前に笑顔で話している様子", "いつもの暮らしを、<br>これからも。"),
    "hataraku": ("hataraku.jpg", "明るい施設の廊下で、職員が高齢の方の歩行に付き添い、ほかの職員がタブレットや書類を確認しながら働いている様子", "働く人を、<br>みんなで支える。"),
}

def build_roles():
    doors = "".join(f'''<a class="door" href="{r["id"]}.html">{emb(r["icon"], True)}<span class="no">入口 {i+1}</span><h3>{r["name"]}</h3><p>{r["lead"]}</p><span class="more">この立場で選ぶ</span></a>''' for i, r in enumerate(ROLES))
    body = ph("立場から選ぶ", "あなたの立場を選ぶと、関係する相談・支援・優待・協力の方法をご案内します。", [("立場から選ぶ", None)], "head-1.jpg", "users") + f'''
<section class="sec"><div class="wrap"><div class="doors d4">{doors}</div>
<p style="margin-top:26px;text-align:center"><a class="more" href="{{p}}contact/index.html">どの立場か分からない・近いものがない</a></p></div></section>'''
    page("roles/index.html", "立場から選ぶ", "企業・事業者、医療・介護で働く方、利用者・ご本人、ご家族の4つの立場から、関係する相談・支援・優待・協力の方法をお選びいただけます。大阪・関西の医療・介護の総合窓口です。", "<main id=\"main\">" + body + "</main>", cur="roles")
    for r in ROLES:
        soft = r["id"] in ("honnin", "kazoku")
        sups = "".join((soft_li if soft else sup_li)(k, "../support/") for k in r["sup"])
        vrows = "".join(f'<div class="vrow"><b>{k}</b><p>{t}</p></div>' for k, t in r["values"].items())
        others = "".join(f'<a href="{o["id"]}.html">{ic(o["icon"])}{o["name"]}</a>' for o in ROLES if o["id"] != r["id"])
        purpose_btns = "".join(f'<a class="btn btn-o" href="{contact_link(r["id"], pid)}">{pn}</a>' for pid, pn, _ in PURPOSES)
        cases = '<div class="voices">' + "".join(f'<figure class="voice"><span class="tag-ex">参考事例</span><blockquote>「{q}」</blockquote><figcaption>{who}</figcaption><dl><dt>支援会でしたこと</dt><dd>{d}</dd><dt>その後</dt><dd>{after}</dd></dl></figure>' for who, q, d, after in ROLE_CASES[r["id"]]) + '</div>'
        housing = '<div class="block">' + acc("home", "住まいをどうするか", "残す・使う・変える・手放す・新たに探す", '<p>当てはまるものから、家じまい相談窓口の詳しいページへ進めます。</p>' + "".join(f'<p style="margin-top:16px;font-weight:700">{g}</p><div class="tbl-wrap" style="margin-top:8px"><table class="info"><tbody>' + "".join(f'<tr><th>{y}</th><td><a href="{SITE["iejimai"]}{u}">{c}</a></td></tr>' for x, y, c, u in HOUSING if x == g) + '</tbody></table></div>' for g in ["住まいがある", "住まいがない・移る"])) + '</div>'
        extra = ""
        if r["id"] == "hataraku":
            extra = '<p class="note-box" style="margin-top:18px">ご本人の同意なく、勤務先へ相談の内容を伝えることはありません。名前を伏せた相談もできます（返信用のメールアドレスは必要です）。</p>'
        if r["id"] == "kazoku":
            extra = f'<p class="note-box" style="margin-top:18px">住まい・空き家・相続・遺品整理の詳しいご相談は、同じ運営会社の<a href="{SITE["iejimai"]}">家じまい相談窓口</a>でも承ります。</p>'
        photo = ""
        if r["id"] in ROLE_PHOTO:
            f_, alt_, vt_ = ROLE_PHOTO[r["id"]]
            photo = f'<div class="stmt-img vt-l" style="margin-bottom:40px"><img src="{{p}}assets/{f_}" alt="{alt_}" width="1024" height="572" loading="lazy"><span class="vt">{vt_}</span></div>'
        if r["id"] == "kigyo":
            extra = f'<p class="note-box" style="margin-top:18px">許認可・補助金の申請のご相談は、同じ運営会社の<a href="{SITE["kigyo"]}">企業支援 総合相談窓口</a>でも承ります（書類の作成は、補助金は提携の行政書士、雇用関係の助成金は提携の社会保険労務士が担当）。</p>'
        body = ph(r["name"], r["lead"], [("立場から選ぶ", "roles/index.html"), (r["name"], None)], r["head"], r["icon"]) + f'''
<div class="wrap" style="padding-block:64px 88px"><div class="detail"><div>
{photo}<div class="block"><h2>{ic("search")}{"お手伝いできること" if r["id"] == "honnin" else "ご家族にお手伝いできること" if r["id"] == "kazoku" else "関係する支援メニュー"}</h2>{'<p style="margin:-6px 0 16px">気になることがあれば、どれからでもお気軽にご相談ください。小さなことでも大丈夫です。</p>' if soft else ''}<ul class="svcs{' soft' if soft else ''}">{sups}</ul></div>
<div class="block">{acc("heart", ("わたしたちが大切にしていること" if soft else "5つの価値を、" + r["name"] + "へ"), "応援・補助・支援・協力・優待", vrows)}</div>
{housing if r["id"] == "kazoku" else ""}
<div class="block"><h2>{ic("chat")}よくいただくご相談</h2><ul class="checks">{"".join(f"<li>{ic('check')}<span>{t}</span></li>" for t in r["topics"])}</ul>{extra}</div>
<div class="block"><h2>{ic("chat")}よくある質問</h2>{faq_html(ROLE_FAQ[r["id"]])}</div>
<div class="block"><h3 class="voices-h">こんなご相談をお受けしています</h3><p class="fine">よくあるご相談をもとに作成した<b>参考事例</b>です。結果は状況により異なります。</p>{cases}</div>
<div class="block"><h2>{ic("arrow")}目的を選んで、受付へ進む</h2><div class="btns" style="flex-wrap:wrap">{purpose_btns}</div></div>
<div class="block"><h2>{ic("users")}ほかの立場</h2><div class="chips">{others}</div></div>
</div>
<aside class="side"><nav aria-label="立場"><h3>{ic("users")}立場から選ぶ</h3><ul>{"".join(f'<li><a href="{o["id"]}.html"{" aria-current=\"page\"" if o["id"] == r["id"] else ""}>{o["name"]}</a></li>' for o in ROLES)}</ul><p style="margin-top:8px"><a class="more" href="index.html">立場の一覧へ</a></p></nav>
<div class="box"><p>{r["name"]}として、相談を送れます。</p><a class="btn btn-g" href="{contact_link(r["id"])}">{ic("chat")}相談を送る</a></div></aside>
</div></div>'''
        page(f"roles/{r['id']}.html", {"kigyo":"企業・事業者の方へ","hataraku":"医療・介護で働く方へ","honnin":"利用者・ご本人へ","kazoku":"ご家族へ"}[r["id"]], r["lead"] + "大阪・関西の医療介護総合支援会がお手伝いします。", "<main id=\"main\">" + body + "</main>", cur="roles")

# ---------- 支援メニュー ----------
SUP_PHOTO = {
    "hojo": ("hojo.jpg", "明るい部屋で、事業所の職員と専門家が図面や資料、電卓を広げて補助金の計画を話し合っている様子", "使える制度を、<br>見落とさない。"),
    "kyodo": ("kyodo.jpg", "事業所の備品庫で、職員がタブレットを見ながら棚の衛生用品や消耗品の在庫を確認している様子", "まとめて買い、<br>ムダを減らす。"),
    "jinzai": ("jinzai.jpg", "明るい研修室で、指導役の職員が介護用品を手に説明し、若手の職員がメモを取りながら研修を受けている様子", "育てて、<br>長く働ける職場へ。"),
    "keiei": ("keiei.jpg", "事業所の事務室で、管理者や職員が大きな画面のグラフやパソコンの表を見ながら業務の改善を話し合っている様子", "数字で見て、<br>業務を軽くする。"),
}

PHOTO_POS = {"hojo.jpg": "0% center"}

def photo_html(f_, alt_, vt_):
    st = f' style="object-position:{PHOTO_POS[f_]}"' if f_ in PHOTO_POS else ""
    return f'<div class="stmt-img vt-l" style="margin-bottom:40px"><img src="{{p}}assets/{f_}" alt="{alt_}" width="1024" height="572" loading="lazy"{st}><span class="vt">{vt_}</span></div>'

def build_support():
    cats = "".join(f'''<div class="catp" id="{c["id"]}"><div class="catp-h">{emb(c["icon"], True)}<h3>{c["name"]}</h3></div><p>{c["lead"]}</p><ul class="svcs">{"".join(sup_li(k) for k in c["items"])}</ul></div>''' for c in CATS)
    body = ph("支援メニュー", f"3つの分類、{NSUP}の支援。それぞれ、受付中・相談後に確認・準備中を表示しています。", [("支援メニュー", None)], "head-3.jpg", "search") + f'''
<section class="sec"><div class="wrap"><div class="cats">{cats}</div>
<div class="grid g3" style="margin-top:30px">{"".join(f'<div class="card">{badge(k)}<p style="margin-top:10px">{v[1]}</p></div>' for k, v in STATUS.items())}</div>
<p style="margin-top:24px"><a class="more" href="{{p}}status/index.html">提供状況の一覧を見る</a></p></div></section>'''
    page("support/index.html", "支援メニュー", f"医療・介護に関わる方への{NSUP}の支援です。経営・運営、働く方、医療・介護と暮らしの3つの分類から選べ、それぞれ受付中・相談後に確認・準備中を表示しています。", "<main id=\"main\">" + body + "</main>", cur="support")
    for k, s in SUP.items():
        c = CAT_OF[k]
        roles = "".join(f'<a href="../roles/{rid}.html">{ic(ROLE[rid]["icon"])}{ROLE[rid]["name"]}</a>' for rid in s["roles"])
        rel = [x for x in c["items"] if x != k][:3]
        rels = "".join(f'<a href="{x}.html">{ic(SUP_ICON[x])}<b>{SUP[x]["name"]}</b><span class="fine">{SUP[x]["short"]}</span></a>' for x in rel)
        who = "".join(f'<div>{ic("check")}<p><b>{a}</b>{b}</p></div>' for a, b in s["who"])
        lnk = ""
        if s.get("link"):
            lnk = f'<p style="margin-top:14px"><a class="btn btn-o" href="{SITE[s["link"][1]]}">{s["link"][0]}</a></p>'
        st = s["status"]
        body = ph(s["name"], s["short"] + "。", [("支援メニュー", "support/index.html"), (c["name"], f"support/index.html#{c['id']}"), (s["name"], None)],
                  {"keiei-shien": "head-2.jpg", "hataraku-shien": "head-1.jpg", "kurashi-shien": "head-4.jpg"}[c["id"]], SUP_ICON[k],
                  f'<span class="num">{s["num"]}　{c["name"]}　{badge(st)}</span>') + f'''
<div class="wrap" style="padding-block:64px 88px"><div class="detail"><div>
{photo_html(*SUP_PHOTO[k]) if k in SUP_PHOTO else ""}<div class="block"><h2>{ic("chat")}このようなお悩みはありませんか</h2><ul class="checks">{"".join(f"<li>{ic('check')}<span>{w}</span></li>" for w in s["worries"])}</ul></div>
<div class="block"><h2>{ic("hands")}支援会がお手伝いすること</h2><ul class="dots">{"".join(f"<li>{h}</li>" for h in s["help"])}</ul></div>
<div class="block"><p class="note-box">{s["note"]}</p>{lnk}</div>
<div class="block">{acc("users", "担当について", "だれが何を担当するか", "<div class=" + chr(34) + "who" + chr(34) + ">" + who + "</div><p class=" + chr(34) + "fine" + chr(34) + " style=" + chr(34) + "margin-top:14px" + chr(34) + ">提供状況：" + badge(st) + "　" + STATUS[st][1] + "</p>")}</div>
<div class="block"><h2>{ic("person")}この支援が関わる立場</h2><div class="chips">{roles}</div></div>
<div class="block">{acc("search", "あわせてご相談の多い支援", "同じ分類のほかの支援", "<div class=" + chr(34) + "rel" + chr(34) + ">" + rels + "</div>")}</div>
</div>
<aside class="side"><nav aria-label="{c["name"]}"><h3>{ic(c["icon"])}{c["name"]}</h3><ul>{"".join(f'<li><a href="{x}.html"{" aria-current=\"page\"" if x == k else ""}>{SUP[x]["name"]}</a></li>' for x in c["items"])}</ul><p style="margin-top:8px"><a class="more" href="index.html">支援メニューへ</a></p></nav>
<div class="box"><p>「{s["name"]}」について、{"ご要望" if st == "prep" else "ご相談"}を送れます。</p><a class="btn btn-g" href="{"{p}kyoryoku/youbou.html?s=" + k if st == "prep" else contact_link(s["roles"][0], "soudan", k)}">{ic("chat")}{"要望を送る" if st == "prep" else "相談を送る"}</a></div></aside>
</div></div>'''
        page(f"support/{k}.html", s["name"], f"{s['name']}のご相談を受け付けます。{s['short']}。大阪・関西の医療・介護に関わる方の総合窓口、医療介護総合支援会の支援メニューです（{STATUS[st][0]}）。", "<main id=\"main\">" + body + "</main>", cur="support")

# ---------- 提供状況 ----------
def build_status():
    cols = ""
    for st in ["open", "refer", "prep"]:
        items = "".join(f'<li><a href="{{p}}support/{k}.html">{s["name"]}</a></li>' for k, s in SUP.items() if s["status"] == st)
        if st == "open":
            items = "<li>ウェブでの総合受付（相談・情報・要望・協力）</li><li>名前を伏せた相談</li><li><a href=\"{p}member/index.html\">会員制度（月払い・年間払い）・電子契約での入会</a></li>" + items
        if st == "prep":
            items += "<li>公式LINEでの相談</li><li>電話での相談</li><li>寄せられた要望から生まれる新しい支援</li>"
        cols += f'<div class="card"><h3>{badge(st)}</h3><p class="fine" style="margin-bottom:12px">{STATUS[st][1]}</p><ul>{items}</ul></div>'
    body = ph("提供状況", "いまできることと、これから育てることを正しくお示しします。", [("提供状況", None)], "head-3.jpg", "check") + f'''
<section class="sec"><div class="wrap"><div class="stat3">{cols}</div>
<p style="margin-top:26px"><a class="btn btn-o" href="{{p}}kyoryoku/youbou.html">導入してほしい支援を伝える</a></p></div></section>'''
    page("status/index.html", "提供状況", "医療介護総合支援会の支援ごとの提供状況です。いま受け付けている支援、相談後に対応できるかを確認する支援、準備中の支援を正しくお示しします。ほしい支援の要望も受け付けています。", "<main id=\"main\">" + body + "</main>", cur="")

# ---------- 会員制度 ----------
MEMBER_TYPES = [
    ("個人会員", "事業所・法人をご紹介いただく営業協力者（支援会のサービスはご利用いただけません）", "無料", "―", "ご紹介で入会された事業所・法人に応じて、紹介料をお支払いします（下の「紹介料の仕組み」をご覧ください）"),
    ("事業所会員", "病院・診療所・介護事業所・薬局など1つの事業所", "5,500円〜", "55,000円〜", "職員5名まで。6人目から1名につき月500円（年5,000円）"),
    ("法人会員", "複数の事業所を運営する法人", "5,500円〜", "55,000円〜", "1か所目5,500円（職員5名まで）、2か所目から1か所につき5,000円（職員5名まで）、各事業所で5名を超える職員1名につき500円（金額はすべて月額）"),
    ("協賛会員", "医療・介護に関わる方へサービスを提供する企業（審査があります）", "33,000円", "330,000円", ""),
]
def build_member():
    rows = "".join(f'<tr><th>{n}</th><td>{t}' + (f'<br><small class="fine">{x}</small>' if x else '') + f'</td><td class="num-c" data-l="月払い（月額）">{m}</td><td class="num-c" data-l="年間払い（10か月分）">{y}</td></tr>' for n, t, m, y, x in MEMBER_TYPES)
    body = ph("会員制度", "月払いと年間払いの2通りから選べる会員制度です。お申し込みは、ウェブで完結する電子契約で行います。", [("会員制度", None)], "head-3.jpg", "users", f'<span class="num">{badge("open")}</span>') + f'''
<section class="sec"><div class="wrap" style="max-width:1000px">
<p class="note-box"><b>会員登録を受け付けています。</b>申込みから契約まで、このサイトの電子契約で完結します（約5分）。事業所・法人の会員が100社に達するまでに入会した方は、<b>創設会員として入会金が免除</b>されます。<a href="apply.html">会員登録を申し込む</a></p>
{sec_h("会員の種類", "立場と規模に合わせて選べます")}
<div class="tbl-wrap"><table class="info mtbl"><thead><tr><th>区分</th><th>対象</th><th>月払い（月額・税込）</th><th>年間払い（10か月分・税込）</th></tr></thead><tbody>{rows}</tbody></table></div>
<p class="fine" style="margin-top:12px">法人会員の例：2つの事業所で、職員が6名と5名の場合　5,500円＋5,000円＋500円＝月11,000円（年間払いは110,000円）</p>
</div></section>
<section class="sec band"><div class="wrap" style="max-width:1000px">
{sec_h("お支払い", "月払いと年間払いの2通り（銀行振込）")}
<div class="grid g2">
<div class="card"><h3 style="font-size:1.35rem;margin-bottom:8px">{ic("clock")} 月払い</h3><p>前払いです。毎月1日に<b>翌月分</b>の請求書をメールでお送りします。<b>毎月10日まで</b>に指定の口座へお振込みください。</p></div>
<div class="card"><h3 style="font-size:1.35rem;margin-bottom:8px">{ic("check")} 年間払い</h3><p>前払いです。12か月分を<b>10か月分の会費</b>でまとめてお振込みいただきます（2か月分お得です）。更新のときは、前の月の1日に請求書をお送りし、10日までにお振込みいただきます。</p></div>
</div>
<p class="note-box" style="margin-top:18px"><b>入会した月の会費は無料</b>です。会費は入会の翌月1日から発生し、入会時に翌月分（年間払いの方は12か月分）の請求書をお送りします。お支払期限は<b>入会日から7日以内</b>です。更新日は毎月1日です（年間払いの方は、12か月ごとの1日に更新されます）。振込手数料は会員のご負担です。</p>
<p class="note-box" style="margin-top:12px">入会金：<b>創設会員は免除</b>します（創設会員は、事業所・法人の会員が100社に達するまでに入会された方です）。</p>
</div></section>
<section class="sec"><div class="wrap" style="max-width:1000px">
{sec_h("入会の流れ", "お申し込みから利用開始まで、ウェブで完結します")}
<ol class="flow f4">
<li><div><b>ウェブで申し込む</b><p>会員の種類と、月払い・年間払いを選びます。</p></div></li>
<li><div><b>そのまま電子契約の画面へ</b><p>申込みのあと、自動で電子契約の画面に切り替わります。メールに届く認証コードで本人確認をしたうえで、会員規約を読み、必要事項の記入と押印をして承認します。押印済みの契約書は、いつでも保存できます。</p></div></li>
<li><div><b>会費を振り込む</b><p>入会した月は無料です。メールで届く請求書に従い、入会日から7日以内に翌月分（年間払いの方は1年分）をお振込みいただきます。以後は毎月1日に請求書が届き、10日までのお振込みです。</p></div></li>
<li><div><b>利用を始める</b><p>お振込みを確認しだい、会員登録の完了をメールでお知らせし、会員向けの支援をご利用いただけます。</p></div></li>
</ol>
<p style="margin-top:18px"><a class="btn btn-o" href="../keiyaku/index.html?demo=1" target="_blank" rel="noopener">電子契約の画面を見本で試す</a>　<span class="fine">見本では、認証コードは 123456 です。入力した内容は送信されません。</span></p>
</div></section>
<section class="sec band"><div class="wrap" style="max-width:1000px">
{sec_h("ご契約の条件", "お申し込みの前に、必ずご確認ください")}
<p style="margin-bottom:14px">事業所会員・法人会員・協賛会員のご契約の条件です（個人会員は会費がないため対象外です）。</p>
<div class="tbl-wrap"><table class="info"><tbody>
<tr><th>契約期間</th><td>1年です（月払い・年間払いとも同じです）。以後は1年ごとに自動で更新されます。</td></tr>
<tr><th>解約</th><td>更新の1か月前までにお申し出ください。</td></tr>
<tr><th>月払いの途中解約</th><td>1年の途中で解約される場合は、残りの月数分の会費をお支払いいただきます（下の「効果が出なかった場合」を除きます）。</td></tr>
<tr><th>年間払いの途中解約</th><td>お支払いいただいた会費の返金はありません（下の「効果が出なかった場合」を除きます）。</td></tr>
<tr><th>効果が出なかった場合</th><td>入会から3か月の時点で、支援会がご提案する経費の削減などを実施しても、会費を上回る効果が出なかった場合は、1年の途中でも解約できます。ご提案に同意されなかった場合は、1年契約のままとなります。効果の確かめ方は会員規約で定めます。</td></tr>
<tr><th>入会金</th><td>創設会員は免除します。</td></tr>
<tr><th>創設会員</th><td>事業所・法人の会員が100社に達するまでに入会された方です（個人会員は数に含みません）。</td></tr>
<tr><th>ご紹介の特典</th><td>創設会員の募集期間中に、ご紹介で事業所・法人が3社入会された会員の方は、会費が1年分無料になります。</td></tr>
</tbody></table></div>
<p class="fine" style="margin-top:12px">振込先は、電子契約で承認したあとにメールで自動でお知らせします。会員規約の全文は<a href="kiyaku.html">会員規約のページ</a>で、販売条件は<a href="tokushoho.html">特定商取引法に基づく表記</a>で、申込みの前にお読みいただけます。</p>
</div></section>
<section class="sec" id="shokai"><div class="wrap" style="max-width:1000px">
{sec_h("紹介料の仕組み", "個人会員（営業協力者）への紹介料")}
<p>支援会は、事業所・法人の会員をご紹介いただいた個人会員に、紹介料をお支払いしています。紹介で入会された事業所・法人の方にも、この仕組みがあることをお知らせしています。紹介料は支援会が受け取る会費・手数料の中から支払うもので、紹介された方の会費が上乗せされることはありません。</p>
<div class="tbl-wrap" style="margin-top:18px"><table class="info"><tbody>
<tr><th>会費の紹介料</th><td>紹介先から入金された会費の20%</td></tr>
<tr><th>手数料の紹介料</th><td>紹介先が経費の削減などのサービスを利用し、支援会に手数料が入った場合、その手数料の20%（支援会が紹介先へ還元（キャッシュバック）した場合は、還元した額を差し引いた残りの20%）</td></tr>
<tr><th>締め日・お支払い</th><td>毎月末日締め。入金を確認できた分について翌月15日までに計算し、翌月末日にお支払いします。</td></tr>
</tbody></table></div>
<h3 style="font-size:1.2rem;margin:26px 0 10px">個人会員の決まりごと</h3>
<ul class="dots">
<li>紹介料が出るのは、事業所・法人の会員を紹介した場合だけです。個人会員が別の個人会員を紹介しても、紹介料は出ません。</li>
<li>ご自身の勤め先を紹介する場合は、勤め先の了承を得てください。</li>
<li>「必ず得をする」など、事実と違う説明や断定的な説明をしないでください。しつこい勧誘もお断りします。</li>
<li>支援会に代わって契約や約束をすることはできません。サービスの内容と費用は、支援会からご説明します。</li>
<li>紹介先の情報は、紹介先の同意を得たうえでお知らせください。</li>
<li>紹介料のお支払いには、本人確認と振込口座の登録が必要です。紹介料は所得として申告が必要になる場合があります。</li>
<li>決まりごとに反する行為があった場合は、紹介料のお支払いを止め、個人会員の登録を取り消すことがあります。</li>
</ul>
<p class="fine" style="margin-top:12px">詳しい決まりごとは、<a href="kiyaku.html#kojin">個人会員規約</a>で定めています。個人会員として登録が済むと、ご自身の<b>紹介コード</b>をメールでお送りします。紹介先には、申込みの「紹介者」欄にそのコードを書いてもらってください。</p>
<div class="btns" style="margin-top:28px"><a class="btn btn-g" href="apply.html">{ic("users")}会員登録を申し込む</a><a class="btn btn-o" href="{contact_link(None, "nyukai")}">{ic("chat")}まず相談する</a><a class="btn btn-o" href="{{p}}status/index.html">提供状況を見る</a></div>
</div></section>'''
    page("member/index.html", "会員制度", "医療介護総合支援会の会員制度です。事業所月5,500円〜・法人月5,500円〜・協賛月33,000円と、営業協力者の個人会員（無料）、月払いと年間払い（12か月分を10か月分の会費で）、電子契約での入会の流れと、創設会員（入会金免除）をご案内します。", "<main id=\"main\">" + body + "</main>", cur="")


# ---------- 会員登録 ----------
APPLY_JS = r"""<script>
(function(){
var EP=__EP__,SITE=__SITE__,f=document.getElementById('af'),t0=Date.now(),sending=false,rec={};
var TRY=/[?&]demo=1/.test(location.search),LIVE=!!window.KEIYAKU_API_URL||TRY;
function done(msg){f.hidden=true;var d=document.getElementById('adone');d.hidden=false;document.getElementById('ano').textContent=rec.no;if(msg)document.getElementById('adoneMsg').textContent=msg;d.scrollIntoView({block:'start'});try{d.focus()}catch(x){}}
function $(i){return document.getElementById(i)}
function v(i){var e=$(i);return e?String(e.value||'').trim():''}
function n(i){var x=parseInt(v(i),10);return isNaN(x)?0:x}
function typ(){var e=f.querySelector('input[name=mt]:checked');return e?e.value:''}
function pay(){var e=f.querySelector('input[name=pay]:checked');return e?e.value:''}
function yen(x){return x.toLocaleString('ja-JP')+'円'}
var NAMES={jigyosho:'事業所会員',hojin:'法人会員',kyosan:'協賛会員',kojin:'個人会員（営業協力者）'};
function fee(){var t=typ(),m=0;
 if(t==='jigyosho'){m=5500+Math.max(0,n('staff')-5)*500}
 else if(t==='hojin'){var s=Math.max(1,n('sites'));m=5500+(s-1)*5000+Math.max(0,n('staff')-5*s)*500}
 else if(t==='kyosan'){m=33000}
 return m}
function upd(){var t=typ(),biz=(t==='jigyosho'||t==='hojin'||t==='kyosan');
 f.querySelectorAll('[data-for]').forEach(function(e){e.hidden=e.getAttribute('data-for').split(' ').indexOf(t)<0});
 var m=fee(),box=$('est');
 if(!t||t==='kojin'){box.hidden=true;return}
 box.hidden=false;var ann=pay()==='年間払い';
 $('estm').textContent=yen(m)+(t==='hojin'?'〜':'');$('esty').textContent=yen(m*10)+(t==='hojin'?'〜':'');
 $('est1').textContent=(ann?yen(m*10)+'（1年分）':yen(m)+'（翌月分）')+'を、入会日から7日以内にお振込み（入会した月は無料）';
}
f.addEventListener('change',function(){$('aerr').hidden=true;upd()});f.addEventListener('input',upd);upd();
function need(msg,id){var e=$('aerr');e.textContent=msg;e.hidden=false;if(id&&$(id)){try{$(id).focus()}catch(x){}}e.scrollIntoView({block:'center'});return false}
function ok(){var t=typ();$('aerr').hidden=true;
 if(!t)return need('会員の種類を選んでください。');
 if(t!=='kojin'&&!pay())return need('お支払い方法を選んでください。');
 if(t==='hojin'&&n('sites')<2)return need('法人会員は、事業所の数（2以上）を入力してください。1か所の場合は事業所会員をお選びください。','sites');
 if((t==='jigyosho'||t==='hojin')&&n('staff')<1)return need('職員の数を入力してください。','staff');
 if(t!=='kojin'&&!v('org'))return need('事業所名・法人名・会社名を入力してください。','org');
 if(t!=='kojin'&&!v('rep'))return need('代表者のお名前を入力してください。','rep');
 if(!v('nm'))return need(t==='kojin'?'お名前を入力してください。':'ご担当者のお名前を入力してください。','nm');
 if(!v('addr'))return need('所在地（住所）を入力してください。','addr');
 if(!v('tel'))return need('電話番号を入力してください。','tel');
 var m=v('mail');if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m))return need('メールアドレスを正しく入力してください。','mail');
 if(!$('agree').checked)return need('会員規約の要点と個人情報の取り扱いを確認し、同意にチェックを入れてください。','agree');
 return true}
function receipt(){var d=new Date(),p=function(x){return String(x).padStart(2,'0')},a=new Uint8Array(3);crypto.getRandomValues(a);return 'IKM-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+Array.prototype.map.call(a,function(x){return(x%36).toString(36)}).join('').toUpperCase()}
function rows(){var t=typ(),r=[['会員の種類',NAMES[t]]];
 if(t!=='kojin')r.push(['お支払い方法',pay()]);
 if(t==='hojin')r.push(['事業所の数',v('sites')]);
 if(t==='jigyosho'||t==='hojin')r.push(['職員の数（合計）',v('staff')+'名']);
 if(t!=='kojin'){r.push(['会費の目安（月額）',$('estm').textContent]);r.push(['事業所名・法人名',v('org')]);r.push(['代表者',v('rep')])}
 r.push([t==='kojin'?'お名前':'ご担当者',v('nm')]);r.push(['所在地',v('addr')]);r.push(['電話番号',v('tel')]);r.push(['メール',v('mail')]);
 r.push(['紹介者（紹介コード・お名前）',v('ref')||'なし']);r.push(['連絡事項',v('note')||'なし']);return r}
f.addEventListener('submit',function(e){e.preventDefault();if(sending||!ok())return;
 if(v('hpf'))return;
 sending=true;var b=$('asend');b.disabled=true;b.textContent='送信しています…';
 rec={no:receipt(),ts:new Date().toISOString(),entry:SITE,name:v('nm'),company:v('org'),email:v('mail'),tel:v('tel'),cat:'medical',method:'メール',body:'【'+SITE+' 会員登録の申込み】\n'+rows().map(function(r){return r[0]+'：'+r[1]}).join('\n'),agree:true,share:false,status:'新規受付',memo:'',fields:['会員登録（'+NAMES[typ()]+'）']};
 fetch(EP,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({kind:'inbox'},rec,{elapsed:Date.now()-t0,catLabel:SITE+'：会員登録／'+NAMES[typ()]}))})
 .then(function(r){return r.json()}).then(function(j){if(!j||j.ok!==true)throw new Error('not_saved');rec.no=j.no||rec.no;
  var t=typ(),KY='審査のうえ、電子契約へ進むご案内をメールでお送りします。届かない場合は、迷惑メールの設定をご確認ください。';
  if(LIVE&&t!=='kyosan'&&window.keiyakuApi){b.textContent='電子契約の画面を準備しています…';
   return keiyakuApi('client.apply',{no:rec.no,type:t,pay:pay()==='年間払い'?'year':'month',sites:n('sites'),staff:n('staff'),org:v('org'),rep:v('rep'),name:v('nm'),address:v('addr'),phone:v('tel'),email:v('mail'),referrer:v('ref'),note:v('note')})
    .then(function(k){location.href='../keiyaku/index.html?t='+encodeURIComponent(k.token)+'&s=1'+(TRY?'&demo=1':'')})
    .catch(function(){done('電子契約の画面を開けませんでした。お申込みは受け付けていますので、担当者から電子契約へ進むご案内をメールでお送りします。')})}
  done(t==='kyosan'&&LIVE?KY:'')})
 .catch(function(){sending=false;b.disabled=false;b.textContent='この内容で申し込む';need('送信できませんでした。時間をおいてもう一度お試しいただくか、'+__MAIL__+' へメールでお知らせください。')});
});
})();
</script>"""

def build_apply():
    radios = "".join(f'<label><input type="radio" name="mt" value="{k}"><span>{n}<small>{d}</small></span></label>' for k, n, d in [
        ("jigyosho", "事業所会員", "1つの事業所（月5,500円〜）"), ("hojin", "法人会員", "複数の事業所を運営する法人（月5,500円〜）"),
        ("kyosan", "協賛会員", "医療・介護向けのサービスを提供する企業（月33,000円・審査あり）"), ("kojin", "個人会員（営業協力者）", "事業所・法人を紹介する方（会費なし・サービスの利用なし）")])
    body = ph("会員登録の申込み", "1画面で申し込み、そのまま電子契約の画面に移って、記入・押印・承認まで進めます。", [("会員制度", "member/index.html"), ("会員登録の申込み", None)], "head-3.jpg", "users") + f'''
<section class="sec"><div class="wrap" style="max-width:860px">
<p class="note-box" id="preNote">電子契約で会員規約を確認し、押印・承認した時点でご入会の契約が成立します。この申込みだけでは会費は発生しません。会員規約の全文は<a href="kiyaku.html">会員規約のページ</a>でお読みいただけます。</p>
<ol class="flow f4" style="margin:26px 0 34px"><li><div><b>このページで申し込む</b><p>約10項目、1画面です。</p></div></li><li><div><b>そのまま電子契約の画面へ</b><p>自動で切り替わります。メールに届く認証コードで本人確認し、会員規約を確認します。</p></div></li><li><div><b>記入・押印・承認</b><p>パソコン・スマホで完結します。</p></div></li><li><div><b>振込・利用開始</b><p>入金を確認して登録完了です。</p></div></li></ol>
<form id="af" novalidate>
<fieldset class="fld" style="border:0;padding:0;margin:0 0 22px"><legend style="font-weight:700;font-size:1.15rem;margin-bottom:10px">1. 会員の種類</legend><div class="opts radio-opts">{radios}</div></fieldset>
<fieldset class="fld" data-for="jigyosho hojin kyosan" hidden style="border:0;padding:0;margin:0 0 22px"><legend style="font-weight:700;font-size:1.15rem;margin-bottom:10px">2. お支払い方法</legend><div class="opts radio-opts"><label><input type="radio" name="pay" value="月払い"><span>月払い<small>毎月1日に翌月分の請求書、10日までにお振込み</small></span></label><label><input type="radio" name="pay" value="年間払い"><span>年間払い<small>10か月分で12か月（2か月分お得）</small></span></label></div></fieldset>
<div class="grid g2" style="gap:0 20px">
<div class="fld" data-for="hojin" hidden><label for="sites">事業所の数</label><input id="sites" type="number" min="2" inputmode="numeric" placeholder="例：3"></div>
<div class="fld" data-for="jigyosho hojin" hidden><label for="staff">職員の数（合計）</label><input id="staff" type="number" min="1" inputmode="numeric" placeholder="例：8"></div>
</div>
<div class="est note-box" id="est" hidden><b>会費の目安（税込）</b>　月払い <b id="estm"></b>／年間払い <b id="esty"></b><br><span class="fine" id="est1"></span><br><span class="fine">法人会員は、各事業所で5名を超える職員1名につき500円を加えます。正式な金額は電子契約でお知らせします。入会した月の会費はかかりません。</span></div>
<h2 style="font-size:1.15rem;margin:26px 0 12px">3. お申込者</h2>
<div class="fld" data-for="jigyosho hojin kyosan" hidden><label for="org">事業所名・法人名・会社名</label><input id="org" type="text" autocomplete="organization" maxlength="80"></div>
<div class="fld" data-for="jigyosho hojin kyosan" hidden><label for="rep">代表者のお名前</label><input id="rep" type="text" maxlength="40"></div>
<div class="fld"><label for="nm">お名前（法人などは、ご担当者のお名前）</label><input id="nm" type="text" autocomplete="name" maxlength="40"></div>
<div class="fld"><label for="addr">所在地（住所）</label><input id="addr" type="text" autocomplete="street-address" maxlength="120" placeholder="例：大阪府大阪市…"></div>
<div class="grid g2" style="gap:0 20px"><div class="fld"><label for="tel">電話番号</label><input id="tel" type="tel" autocomplete="tel" maxlength="20"></div>
<div class="fld"><label for="mail">メールアドレス（認証コードと、押印済みの契約書の送り先）</label><input id="mail" type="email" autocomplete="email" maxlength="120"></div></div>
<div class="fld"><label for="ref">紹介者（紹介コード、またはお名前・任意）</label><p class="hint" style="margin:0 0 6px">紹介を受けた方は、個人会員からもらった紹介コード（例：SK-7KQ2M）を書いてください。</p><input id="ref" type="text" maxlength="60"></div>
<div class="fld"><label for="note">連絡事項（任意）</label><textarea id="note" maxlength="500" style="min-height:96px"></textarea></div>
<p class="fine" data-for="kojin" hidden>個人会員の方は、紹介料のお支払いのため、電子契約で本人確認書類の撮影と振込口座の登録をお願いします。</p>
<div class="note-box" style="margin-top:8px"><b>ご契約の要点</b>（事業所・法人・協賛会員）：契約期間は1年（月払いも同じ）で自動更新／解約は更新の1か月前まで／月払いの途中解約は残りの月数分をお支払い／年間払いの途中解約は返金なし（入会から3か月で効果が出なかった場合を除く）／前払い・銀行振込・振込手数料はご負担。詳しくは<a href="index.html">会員制度のページ</a>、<a href="kiyaku.html" target="_blank" rel="noopener">会員規約の全文</a>、<a href="tokushoho.html" target="_blank" rel="noopener">特定商取引法に基づく表記</a>（いずれも別の画面で開きます）をご覧ください。</div>
<label class="agree" for="agree" style="margin-top:16px"><input type="checkbox" id="agree"><span>上の要点と<a href="{{p}}privacy/index.html" target="_blank" rel="noopener">個人情報の取り扱い</a>（別の画面で開きます）を確認し、同意します。</span></label>
<div class="hp" aria-hidden="true" style="position:absolute;left:-9999px"><label for="hpf">この欄は空のままにしてください</label><input id="hpf" type="text" tabindex="-1" autocomplete="off"></div>
<p class="warn-inline" id="aerr" role="alert" hidden></p>
<p class="fine" data-for="kyosan" hidden>協賛会員は審査があるため、審査のあとに電子契約へ進むご案内をメールでお送りします。</p>
<div class="btns" style="margin-top:20px"><button class="btn btn-g" id="asend" type="submit">この内容で電子契約へ進む</button></div>
</form>
<div id="adone" hidden tabindex="-1" class="note-box"><h2 style="font-size:1.3rem;margin-bottom:10px">お申込みを受け付けました</h2><p>受付番号：<b id="ano"></b></p><p id="adoneMsg">担当者から、ご入力のメールアドレスへ電子契約のご案内をお送りします。届かない場合は、迷惑メールの設定をご確認ください。</p></div>
</div></section>'''
    js = "<script>window.FORM_HELP={\"sites\": {\"t\": \"運営している事業所の数を入れます（2以上）。\", \"ex\": \"例：3　1か所だけのときは、上で「事業所会員」を選んでください\", \"req\": true}, \"staff\": {\"t\": \"職員の数を、すべての事業所の合計で入れます。\", \"ex\": \"例：8　入れると、すぐ下に会費の目安が出ます\", \"req\": true}, \"org\": {\"t\": \"事業所名・法人名・会社名を、正式な名前で入れます。\", \"ex\": \"例：株式会社○○　○○デイサービス\", \"req\": true}, \"rep\": {\"t\": \"代表者のお名前を入れます。\", \"ex\": \"例：山田 太郎\", \"req\": true}, \"nm\": {\"t\": \"お名前を入れます。法人などの場合は、手続きをするご担当者のお名前です。\", \"ex\": \"例：山田 花子\", \"req\": true}, \"addr\": {\"t\": \"所在地（住所）を、都道府県から入れます。\", \"ex\": \"例：大阪府大阪市○○区○○1-2-3\", \"req\": true}, \"tel\": {\"t\": \"日中につながる電話番号を入れます。\", \"ex\": \"例：06-1234-5678\", \"req\": true}, \"mail\": {\"t\": \"このアドレスに、6けたの認証コードと押印済みの契約書が届きます。\", \"ex\": \"例：yamada@example.jp　よく使うアドレスを入れてください\", \"req\": true}, \"ref\": {\"t\": \"紹介を受けた方だけ入れます（空のままでも申し込めます）。\", \"ex\": \"例：SK-7KQ2M、または紹介者のお名前\", \"req\": false}, \"note\": {\"t\": \"伝えておきたいことがあれば書きます（空のままでも申し込めます）。\", \"req\": false}};window.FORM_GROUPS=[{name:'mt',label:'会員の種類'},{name:'pay',label:'お支払い方法'}];window.FORM_CHECKS=['agree'];window.FORM_SCOPE='#af';window.FORM_SUBMIT='#asend';window.FORM_DONE_LABEL='申込みボタンへ ›';</script>" + '<script src="../keiyaku/config.js"></script><script src="../keiyaku/api.js"></script>' + APPLY_JS.replace("__EP__", json.dumps(SITE["endpoint"])).replace("__SITE__", json.dumps(SITE["name"])).replace("__MAIL__", json.dumps(SITE["mail"]).replace('"', "'"))
    page("member/apply.html", "会員登録の申込み", "医療介護総合支援会の会員登録です。会員の種類と支払い方法を選んで1画面で申し込むと、そのまま電子契約の画面に移り、記入・押印・承認まで進めます。", "<main id=\"main\">" + body + "</main>", cur="", extra_js=js)


# ---------- 会員規約の全文 ----------
def kiyaku_html(t):
    out = []
    for ln in t.strip().split("\n"):
        if not ln.strip(): continue
        if ln.startswith("第") and "条" in ln[:6]: out.append(f'<h3 style="font-size:1.12rem;margin:22px 0 6px">{E(ln)}</h3>')
        elif ln is t.strip().split("\n")[0]: continue
        else: out.append(f'<p style="margin:0 0 6px">{E(ln)}</p>')
    return "".join(out)
def build_kiyaku():
    from keiyaku_text import KIYAKU, KOJIN_KIYAKU
    body = ph("会員規約", "電子契約でご確認いただく会員規約の全文です。お申し込みの前にお読みいただけます。", [("会員制度", "member/index.html"), ("会員規約", None)], "head-3.jpg", "doc") + f'''
<section class="sec"><div class="wrap" style="max-width:900px">
<p class="note-box">この規約は、電子契約の画面で表示する内容と同じものです。ご入会の契約は、電子契約で規約を確認し、押印・承認した時点で成立します。</p>
<nav style="margin:18px 0 8px"><a class="btn btn-o" href="#kaiin">事業所・法人・協賛会員の規約</a>　<a class="btn btn-o" href="#kojin">個人会員（営業協力者）の規約</a></nav>
<article class="card" id="kaiin" style="margin-top:22px"><h2 style="font-size:1.4rem;margin-bottom:10px">会員規約（事業所・法人・協賛会員）</h2>{kiyaku_html(KIYAKU)}</article>
<article class="card" id="kojin" style="margin-top:26px"><h2 style="font-size:1.4rem;margin-bottom:10px">個人会員（営業協力者）規約</h2>{kiyaku_html(KOJIN_KIYAKU)}</article>
<div class="btns" style="margin-top:28px"><a class="btn btn-g" href="apply.html">{ic("users")}会員登録を申し込む</a><a class="btn btn-o" href="index.html">会員制度のページへ戻る</a></div>
</div></section>'''
    page("member/kiyaku.html", "会員規約", "医療介護総合支援会の会員規約（事業所・法人・協賛会員）と個人会員（営業協力者）規約の全文です。会費、支払い、契約期間と更新、解約、効果が出なかった場合の途中解約などを定めています。", "<main id=\"main\">" + body + "</main>", cur="")

# ---------- 特定商取引法に基づく表記 ----------
def build_tokushoho():
    S = SITE
    rows = [
        ("販売事業者", S["company"]),
        ("運営責任者", "代表取締役　" + S["rep"]),
        ("所在地", S["zip"] + " " + S["addr"]),
        ("電話番号", S["tel"] + "（受付時間 " + S["tel_hours"] + "）<br><span class=\"fine\">お問い合わせは、メールまたはウェブ受付でも承ります。</span>"),
        ("メールアドレス", S["mail"]),
        ("適格請求書発行事業者 登録番号", S["invoice"]),
        ("サービスの名称", S["name"] + "の会員制度"),
        ("販売価格（会費・税込）", "事業所会員：月額5,500円（職員5名まで。6人目から1名につき月500円）<br>法人会員：1か所目月額5,500円、2か所目から1か所につき月額5,000円（いずれも職員5名まで。超える職員1名につき月500円）<br>協賛会員：月額33,000円<br>個人会員（営業協力者）：無料<br>年間払いは、いずれも月額の10か月分で12か月ご利用いただけます。"),
        ("会費以外に必要な料金", "会費の振込手数料（会員のご負担）。入会金は、創設会員（事業所・法人の会員が100社に達するまでに入会された方）は免除します。"),
        ("お支払い方法", "銀行振込（前払い）。振込先は、電子契約で承認したあとにメールでお知らせします。"),
        ("お支払いの時期", "入会した月の会費は無料で、入会の翌月1日から発生します。毎月1日に翌月分の請求書をメールでお送りします。<br>入会時：入会日から7日以内に翌月分（年間払いは12か月分）<br>月払い：以後は毎月10日までに翌月分<br>年間払い：更新時は、新しい12か月が始まる月の前月10日まで"),
        ("サービスの提供時期", "入金を確認しだい、会員登録の完了をメールでお知らせし、会員向けの支援をご利用いただけます。"),
        ("お申し込みの方法", "このサイトの会員登録のページから申し込み、電子契約で会員規約を確認して押印・承認していただきます。承認した時点で契約が成立します。"),
        ("契約期間・更新", "1年（月払いも同じ）。期間が終わる1か月前までに申し出がない場合、同じ条件で1年ごとに自動で更新します。"),
        ("解約・返金", "解約は、契約期間が終わる1か月前までにお申し出ください。期間の途中で解約する場合、月払いは残りの月数分の会費をお支払いいただき、年間払いはお支払いいただいた会費を返金しません。ただし、入会から3か月の時点で、支援会がご提案する経費の削減などを実施しても会費を上回る効果が出なかった場合は、残りの会費のお支払いなく解約できます（詳しくは会員規約）。"),
        ("動作環境", "電子契約は、パソコン・スマートフォンの一般的なブラウザ（最新の版）でご利用いただけます。メールで認証コードを受け取れる必要があります。"),
    ]
    trs = "".join(f"<tr><th>{a}</th><td>{b}</td></tr>" for a, b in rows)
    body = ph("特定商取引法に基づく表記", "会員制度の販売条件です。", [("会員制度", "member/index.html"), ("特定商取引法に基づく表記", None)], "head-2.jpg", "doc") + f'''
<section class="sec"><div class="wrap" style="max-width:960px"><div class="tbl-wrap"><table class="info"><tbody>{trs}</tbody></table></div>
<p class="fine" style="margin-top:14px">会員規約の全文は<a href="kiyaku.html">会員規約のページ</a>をご覧ください。</p></div></section>'''
    page("member/tokushoho.html", "特定商取引法に基づく表記", "医療介護総合支援会の会員制度の特定商取引法に基づく表記です。販売事業者、所在地、連絡先、会費、支払い方法と時期、提供時期、契約期間、解約と返金について記載しています。", "<main id=\"main\">" + body + "</main>", cur="")

# ---------- 流れ・費用 ----------
def build_flow():
    body = ph("相談の流れ・費用", "受付からご案内までの流れと、費用・返信・対応地域の考え方です。", [("相談の流れ・費用", None)], "head-2.jpg", "clock") + f'''
<section class="sec"><div class="wrap">
{sec_h("相談の流れ", "受付から、ご案内まで")}
<ol class="flow"><li><div><b>立場と目的を選ぶ</b><p>受付フォームで、4つの立場と目的を選びます。</p></div></li><li><div><b>内容を送る</b><p>必要な範囲で内容を書きます。病名や症状などの詳しい情報は書かないでください。</p></div></li><li><div><b>内容の整理</b><p>窓口が目的と優先順位を確認します。</p></div></li><li><div><b>対応先の検討</b><p>必要な資格・役割を確認し、合う相談先・提携先を検討します。</p></div></li><li><div><b>事前のご説明</b><p>対応の範囲・費用・共有先をご説明します。</p></div></li><li><div><b>同意のうえでおつなぎ</b><p>ご了承いただいてから、専門家・提携先へおつなぎします。</p></div></li></ol>
</div></section>
<section class="sec band"><div class="wrap" style="max-width:960px">
{sec_h("ご利用の前に", "費用・返信・対応地域")}
<div class="tbl-wrap"><table class="info"><tbody>
<tr><th>費用</th><td>{SITE["fee"]}</td></tr>
<tr><th>返信の目安</th><td>{SITE["reply"]}</td></tr>
<tr><th>対応地域</th><td>{SITE["area"]}。ご案内できる提携先の範囲は、内容と地域によって異なります。</td></tr>
<tr><th>受付の方法</th><td>ウェブ受付（24時間受付）。公式LINE・電話での相談は準備中です。</td></tr>
<tr><th>名前を伏せた相談</th><td>できます。返信のためにメールアドレスは必要なため、完全な匿名ではありません。</td></tr>
<tr><th>受け付けない内容</th><td>緊急の対応、診断・治療、法律・税務・労務の専門的な判断、申請書類の作成、職業紹介</td></tr>
</tbody></table></div>
</div></section>'''
    page("flow/index.html", "相談の流れ・費用", "医療介護総合支援会の相談の流れ、費用の考え方、返信の目安、対応地域、名前を伏せた相談についてご説明します。受付から、同意のうえで専門家・提携先へおつなぎするまでの6つの段階です。", "<main id=\"main\">" + body + "</main>", cur="flow")

def build_faq():
    body = ph("よくある質問", "はじめての方からよくいただくご質問です。", [("よくある質問", None)], "head-5.jpg", "chat") + f'''
<section class="sec"><div class="wrap" style="max-width:900px">{faq_html(FAQ)}
<p style="margin-top:26px"><a class="btn btn-g" href="{{p}}contact/index.html">{ic("chat")}相談を送る</a></p></div></section>'''
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}
    page("faq/index.html", "よくある質問", "医療介護総合支援会へのよくある質問です。費用、名前を伏せた相談、勤務先への秘密、緊急時の連絡先、仕事の紹介、補助金の申請、対応地域、返信の目安などにお答えします。", "<main id=\"main\">" + body + "</main>", cur="faq", ld=ld)

REQ_SPAN = ' <span class="req">※必須</span>'
def build_kyoryoku():
    body = ph("提携・協業・要望", "提携・協業のお申し込みと、ご要望は、それぞれ専用の窓口で受け付けています。", [("提携・協業・要望", None)], "head-3.jpg", "hands") + f'''
<section class="sec"><div class="wrap"><div class="grid g2">
<div class="card"><h2 style="font-size:1.5rem;margin-bottom:12px">{ic("hands")} 提携・協業の申し込み</h2><p>医療・介護に関わる方へのサービスを提供する事業者、弁護士・税理士・社会保険労務士・行政書士などの専門家の方の協力を募集しています。</p><ul class="dots" style="margin-top:12px"><li>提供できるサービスと、対応できる地域</li><li>会員向けの優待や条件</li><li>許認可・資格</li></ul><p class="fine" style="margin-top:10px">いただいた内容をもとに担当者から連絡し、面談のうえで提携の可否を決めます。</p><p style="margin-top:18px"><a class="btn btn-g" href="teikei.html">{ic("hands")}提携・協業の申し込みフォーム</a></p></div>
<div class="card"><h2 style="font-size:1.5rem;margin-bottom:12px">{ic("chat")} 要望の窓口</h2><p>「こんな支援があれば助かる」「ここを改善してほしい」という声を、どの立場の方からも受け付けています。多く寄せられた声は、協力者と一緒に新しい支援にします。</p><p class="fine" style="margin-top:10px">名前を書かずに送れます。返信がほしいときだけ、メールアドレスを入れてください。</p><p style="margin-top:18px"><a class="btn btn-o" href="youbou.html">{ic("chat")}要望を送るフォーム</a></p></div>
</div>
<p class="fine" style="margin-top:22px">困りごとのご相談は、<a href="{{p}}contact/index.html">相談の受付</a>からお送りください。</p></div></section>'''
    page("kyoryoku/index.html", "提携・協業・要望", "医療介護総合支援会では、医療・介護に関わる方へのサービスを提供する事業者や専門家の提携・協業の申し込みと、「こんな支援がほしい」という要望を、それぞれ専用のフォームで受け付けています。", "<main id=\"main\">" + body + "</main>", cur="")
    build_teikei(); build_youbou()

def radios(name, items, req=True):
    return '<div class="opts radio-opts">' + "".join(f'<label><input type="radio" name="{name}" value="{E(v)}"><span>{E(v)}{f"<small>{E(s)}</small>" if s else ""}</span></label>' for v, s in items) + '</div>'
def checks(name, items):
    return '<div class="opts">' + "".join(f'<label><input type="checkbox" name="{name}" value="{E(v)}"><span>{E(v)}</span></label>' for v in items) + '</div>'
def lg(t, req):
    return f'<legend style="font-weight:700;font-size:1.08rem;margin-bottom:8px">{t}{REQ_SPAN if req else ""}</legend>'
def fld(i, label, req=False, typ="text", extra="", ml=120):
    r = ' <span class="req">※必須</span>' if req else ""
    if typ == "textarea": return f'<div class="fld"><label for="{i}">{label}{r}</label><textarea id="{i}" maxlength="{ml}" {extra}></textarea></div>'
    return f'<div class="fld"><label for="{i}">{label}{r}</label><input id="{i}" type="{typ}" maxlength="{ml}" {extra}></div>'
HP = '<div class="hp" aria-hidden="true" style="position:absolute;left:-9999px"><label for="hpf">この欄は空のままにしてください</label><input id="hpf" type="text" tabindex="-1" autocomplete="off"></div>'
AGREE = '<label class="agree" for="agree"><input type="checkbox" id="agree"><span><a href="{p}privacy/index.html" target="_blank" rel="noopener">個人情報の取り扱い</a>（別の画面で開きます）を読み、同意します。 <span class="req">※必須</span></span></label>'

SIMPLE_JS = r"""<script>(function(){
var C=__CFG__,f=document.getElementById('sf'),err=document.getElementById('serr'),t0=Date.now(),sending=false;
function v(i){var e=document.getElementById(i);return e?String(e.value||'').trim():''}
function one(n){var e=f.querySelector('input[name="'+n+'"]:checked');return e?e.value:''}
function all(n){return Array.prototype.map.call(f.querySelectorAll('input[name="'+n+'"]:checked'),function(e){return e.value})}
function vis(e){return !!(e&&e.offsetParent)}
function need(m,el){err.textContent=m;err.hidden=false;if(el){el.scrollIntoView({block:'center',behavior:'smooth'});try{el.focus({preventScroll:true})}catch(x){}}return false}
var q=new URLSearchParams(location.search);
if(C.pre){var s=q.get('s');if(s&&C.pre[s]){var o=f.querySelector('[name="'+C.preName+'"][value="'+C.pre[s]+'"]');if(o)o.checked=true;var t=document.getElementById('preNote');if(t){t.hidden=false;t.textContent='「'+C.pre[s]+'」についての要望として送ります。'}}}
function sync(){(C.toggles||[]).forEach(function(t){var on=one(t.name)===t.value;t.show.forEach(function(id){var e=document.getElementById(id);if(e)e.hidden=!on})})}
f.addEventListener('change',function(){sync();err.hidden=true});f.addEventListener('input',function(){err.hidden=true});sync();
function check(){err.hidden=true;
 for(var i=0;i<C.reqRadio.length;i++){var r=C.reqRadio[i];if(!one(r[0]))return need(r[1]+'を選んでください。',f.querySelector('input[name="'+r[0]+'"]'))}
 for(i=0;i<(C.reqCheck||[]).length;i++){r=C.reqCheck[i];if(!all(r[0]).length)return need(r[1]+'を1つ以上選んでください。',f.querySelector('input[name="'+r[0]+'"]'))}
 if(C.customCheck&&window[C.customCheck]){var cc=window[C.customCheck]();if(cc)return need(cc[0],cc[1])}
 for(i=0;i<C.reqText.length;i++){r=C.reqText[i];var el=document.getElementById(r[0]);if(vis(el)&&!v(r[0]))return need(r[1]+'を入れてください。',el)}
 var m=document.getElementById('mail');if(m&&v('mail')&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('mail')))return need('メールアドレスの形をご確認ください（例：name@example.jp）。',m);
 if(C.sens&&/(病名|診断|うつ|がん|認知症|要介護[1-5１-５]|服薬|マイナンバー|口座番号|カード番号)/.test(v(C.sens)))return need('病気や体の状態、番号などの情報が含まれている可能性があります。その部分を消してください。',document.getElementById(C.sens));
 if(!document.getElementById('agree').checked)return need('個人情報の取り扱いを読み、同意の欄に印を付けてください。',document.getElementById('agree'));
 return true}
function rows(){var R=C.rows.map(function(r){var val=r[2]==='radio'?one(r[1]):r[2]==='check'?all(r[1]).join('、'):v(r[1]);return [r[0],val]}).filter(function(r){return r[1]});if(C.customRows&&window[C.customRows])R.splice(1,0,...window[C.customRows]());return R}
function receipt(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')},a=new Uint8Array(3);crypto.getRandomValues(a);return C.prefix+'-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+Array.prototype.map.call(a,function(x){return(x%36).toString(36)}).join('').toUpperCase()}
f.addEventListener('submit',function(e){e.preventDefault();if(sending||!check())return;
 if(v('hpf')){need('送信できませんでした。メールでご連絡ください。');return}
 sending=true;var b=document.getElementById('ssend');b.disabled=true;b.textContent='送信しています…';
 var body='【'+C.site+' '+C.title+'】\n'+rows().map(function(r){return r[0]+'：'+r[1]}).join('\n');
 var kind=one(C.kindName)||'';
 var rec={no:receipt(),ts:new Date().toISOString(),entry:C.site,name:v('nm')||C.noName,company:v('co'),email:v('mail'),tel:v('tel')||'（未入力）',body:body,status:'新規受付',fields:[C.field].concat(C.customFields&&window[C.customFields]?window[C.customFields]():[])};
 fetch(C.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({kind:'inbox'},rec,{elapsed:Date.now()-t0,catLabel:C.site+'：'+C.title+(kind?'／'+kind:'')}))})
 .then(function(r){return r.json()}).then(function(j){if(!j||j.ok!==true)throw new Error('x');
  f.hidden=true;var d=document.getElementById('sdone');d.hidden=false;d.innerHTML='<div class="done-box" role="status"><b>受け付けました</b><p>受付番号：'+(j.no||rec.no)+'</p><p>'+(v('mail')?C.doneMail:C.doneNoMail)+'</p></div>';window.scrollTo(0,d.getBoundingClientRect().top+scrollY-140)})
 .catch(function(){sending=false;b.disabled=false;b.textContent=C.btn;need('送信できませんでした。時間をおいてもう一度お試しいただくか、'+C.mail+' へメールでお送りください。')})});
})();</script>"""

CASCADE_JS = r"""<script>(function(){
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function opts(list,ph){return '<option value="">'+ph+'</option>'+list.map(function(x){return '<option>'+esc(x)+'</option>'}).join('')}
window.makeCascade=function(o){var T=o.tree||{},box=document.getElementById(o.box),add=document.getElementById(o.add),n=0,P=o.prefix,L=o.labels;
 function row(){if(n>=o.max)return;n++;var i=n,d=document.createElement('div');d.className='area-row';
  d.innerHTML='<div class="area-h"><b>'+o.title+' '+i+'</b>'+(i>1?'<button type="button" class="small-btn" data-del>この'+o.title+'を消す</button>':'')+'</div>'+
  '<div class="area-g"><div class="fld"><label for="'+P+i+'a">'+L[0]+((i===1&&!o.optional)||o.allReq?' <span class="req">※必須</span>':'')+'</label><select id="'+P+i+'a">'+opts(Object.keys(T),'選んでください')+'</select></div>'+
  '<div class="fld"><label for="'+P+i+'b">'+L[1]+'</label><select id="'+P+i+'b" disabled>'+opts([],'先に'+L[0]+'を選んでください')+'</select></div>'+
  '<div class="fld"><label for="'+P+i+'c">'+L[2]+'</label><select id="'+P+i+'c" disabled>'+opts([],'先に'+L[1]+'を選んでください')+'</select></div></div>'+
  '<div class="fld"><label for="'+P+i+'d">'+L[3]+'（任意）</label><input type="text" id="'+P+i+'d" maxlength="300" placeholder="'+esc(o.ph)+'"></div>';
  box.appendChild(d);var A=d.querySelector('#'+P+i+'a'),M=d.querySelector('#'+P+i+'b'),S=d.querySelector('#'+P+i+'c');
  A.onchange=function(){var m=T[A.value];M.innerHTML=opts(m?Object.keys(m):[],m?'選んでください':'先に'+L[0]+'を選んでください');M.disabled=!m;S.innerHTML=opts([],'先に'+L[1]+'を選んでください');S.disabled=true;if(m&&Object.keys(m).length===1){M.selectedIndex=1;M.onchange()}};
  M.onchange=function(){var s=T[A.value]&&T[A.value][M.value];S.innerHTML=opts(s||[],s?'選んでください':'先に'+L[1]+'を選んでください');S.disabled=!s;if(s&&s.length===1)S.selectedIndex=1};
  var del=d.querySelector('[data-del]');if(del)del.onclick=function(){d.remove();renum()};add.hidden=n>=o.max}
 function renum(){var rs=box.querySelectorAll('.area-row');n=rs.length;rs.forEach(function(r,k){r.querySelector('.area-h b').textContent=o.title+' '+(k+1)});add.hidden=n>=o.max}
 add.onclick=function(){row();var l=box.lastElementChild;if(l){l.scrollIntoView({block:'center',behavior:'smooth'});l.querySelector('select').focus({preventScroll:true})}};row();
 function list(){return Array.prototype.map.call(box.querySelectorAll('.area-row'),function(r){var g=function(s){var e=r.querySelector('[id^="'+P+'"][id$="'+s+'"]');return e?String(e.value||'').trim():''};return{a:g('a'),b:g('b'),c:g('c'),d:g('d'),ids:['a','b','c','d'].map(function(s){return r.querySelector('[id^="'+P+'"][id$="'+s+'"]')})}})}
 return{check:function(){if(o.optional)return null;var Ls=list();for(var k=0;k<Ls.length;k++){var x=Ls[k],lab=o.title+' '+(k+1)+'の';if(!x.a&&(k>0||o.optional)&&!x.d)continue;if(!x.a&&o.optional)continue;if(!x.a)return[lab+L[0]+'を選んでください。',x.ids[0]];if(!x.b)return[lab+L[1]+'を選んでください。',x.ids[1]];if(!x.c)return[lab+L[2]+'を選んでください。',x.ids[2]]}return null},
  rows:function(){return list().filter(function(x){return x.a||x.d}).map(function(x,k){return[o.title+' '+(k+1),[x.a,x.b,x.c].filter(Boolean).join(' ＞ ')+(x.d?'\n　'+L[3]+'：'+x.d:'')]})},
  firsts:function(){var r=[];list().forEach(function(x){if(x.a&&r.indexOf(x.a)<0)r.push(x.a)});return r},
  mids:function(){var r=[];list().forEach(function(x){if(x.b&&r.indexOf(x.b)<0)r.push(x.b)});return r},
  items:function(){return list().filter(function(x){return x.a||x.d})},
  reset:function(t){T=t||{};box.innerHTML='';n=0;row()},
  preset:function(a,b){var A=box.querySelector('select');if(!A||!T[a])return;A.value=a;A.onchange();if(b){var M=box.querySelectorAll('select')[1];M.value=b;M.onchange()}}}};
})();</script>"""


def build_teikei():
    kinds = [("提携企業として、会員へサービスを提供したい", "仕入れ・設備・ITなど、医療・介護の事業者向けのサービス"), ("専門家として協力したい", "弁護士・税理士・社会保険労務士・行政書士・医師など"), ("協賛会員として参加したい", "会員制度の協賛会員（審査があります）"), ("その他の協力", "共同での取り組み・情報提供など")]
    areas = [SUP[k]["name"] for c in CATS for k in c["items"]]
    form = f'''<form class="form-card" id="sf" novalidate>
<h2>提携・協業の申し込み</h2><p class="hint">分かる範囲でご記入ください。<span class="req">※必須</span>の欄だけ入れれば送れます。</p>
<fieldset class="fld" style="border:0;padding:0;margin:0 0 22px">{lg("申し込みの種類", True)}{radios("kind", kinds)}</fieldset>
<fieldset class="fld" style="border:0;padding:0;margin:0 0 22px">{lg("提携・協業の分野", True)}<p class="hint">大分類 → 中分類 → 小分類の順に選びます。詳細は書かなくても送れます。複数ある場合は「分野を追加」で5つまで登録できます。</p><div id="areas"></div><button type="button" class="btn btn-o" id="addArea" style="margin-top:6px">＋ 分野を追加</button></fieldset>
{fld("co", "事業者名・法人名", True, extra='autocomplete="organization"', ml=100)}
{fld("nm", "ご担当者のお名前", True, extra='autocomplete="name"', ml=60)}
{fld("ttl", "部署・役職", ml=60)}
{fld("addr", "所在地", True, extra='autocomplete="street-address"', ml=120)}
<fieldset class="fld" style="border:0;padding:0;margin:0 0 22px">{lg("対応できる地域", True)}<p class="hint">地方 → 都道府県 → 市区町村の順に選びます。都道府県全体なら「全域」を選んでください。複数ある場合は「地域を追加」で10か所まで登録できます。</p><div id="zones"></div><button type="button" class="btn btn-o" id="addZone" style="margin-top:6px">＋ 地域を追加</button></fieldset>
{fld("url", "ホームページ", typ="url", extra='inputmode="url"', ml=200)}
{fld("svc", "提供できるサービス・協力の内容", False, "textarea", ml=1500)}
{fld("perk", "会員向けの優待・条件（あれば）", False, "textarea", ml=800)}
{fld("lic", "許認可・資格（あれば）", ml=200)}
{fld("tel", "電話番号", True, "tel", 'autocomplete="tel" inputmode="tel"', 20)}
{fld("mail", "メールアドレス", True, "email", 'autocomplete="email" inputmode="email"', 120)}
<h3 style="font-size:1.15rem;margin:26px 0 8px">面談のご希望</h3><p class="hint">提携の前に、面談でお話をうかがいます。分かる範囲でご記入ください。</p>
<fieldset class="fld" style="border:0;padding:0;margin:0 0 18px">{lg("面談の方法", False)}{radios("mtg", [("オンライン（ビデオ通話）", ""), ("当社へお越しいただく", "大阪市北区の打ち合わせ専用事務所"), ("貴社へうかがう", ""), ("電話", ""), ("どれでもよい", "")], False)}</fieldset>
{fld("mtgNote", "面談の方法についての補足", ml=200)}
<div class="area-g" style="margin-top:6px">{fld("d1", "第1希望日", typ="date")}{fld("d2", "第2希望日", typ="date")}{fld("d3", "第3希望日", typ="date")}</div>
<div class="fld"><label for="tz">ご希望の時間帯</label><select id="tz"><option value="">選んでください</option><option>午前（10時〜12時）</option><option>午後（13時〜17時）</option><option>夕方（17時〜19時）</option><option>いつでもよい</option></select></div>
{fld("dnote", "日程についての補足", ml=200)}
<p class="note-box">お申し込みの内容を確認し、担当者からご連絡します。面談のうえで提携の可否を決めます。すべてのお申し込みにお応えできない場合があります。</p>
{AGREE}{HP}
<p class="err" id="serr" role="alert" hidden></p>
<button class="btn btn-g" type="submit" id="ssend" style="width:100%;margin-top:16px">この内容で申し込む</button>
</form><div id="sdone" hidden></div>'''
    body = ph("提携・協業の申し込み", "医療・介護に関わる方へのサービスを提供する事業者・専門家の方との提携・協業を募集しています。", [("提携・協業・要望", "kyoryoku/index.html"), ("提携・協業の申し込み", None)], "head-3.jpg", "hands") + f'<section class="sec"><div class="wrap" style="max-width:860px">{form}<p class="fine" style="margin-top:18px">ご要望・ご意見は<a href="youbou.html">要望の窓口</a>、困りごとのご相談は<a href="{{p}}contact/index.html">相談の受付</a>へ。</p></div></section>'
    cfg = {"endpoint": SITE["endpoint"], "site": SITE["name"], "mail": SITE["mail"], "title": "提携・協業の申し込み", "prefix": "IKT", "field": "提携・協業の申し込み", "kindName": "kind", "noName": "", "btn": "この内容で申し込む",
           "reqRadio": [["kind", "申し込みの種類"]], "customCheck": "teikeiCheck", "customRows": "teikeiRows", "customFields": "teikeiFields", "reqText": [["co", "事業者名・法人名"], ["nm", "ご担当者のお名前"], ["addr", "所在地"], ["tel", "電話番号"], ["mail", "メールアドレス"]],
           "rows": [["申し込みの種類", "kind", "radio"], ["事業者名・法人名", "co"], ["ご担当者", "nm"], ["部署・役職", "ttl"], ["所在地", "addr"], ["ホームページ", "url"], ["提供できるサービス・協力の内容", "svc"], ["会員向けの優待・条件", "perk"], ["許認可・資格", "lic"], ["電話", "tel"], ["メール", "mail"], ["面談の方法", "mtg", "radio"], ["面談の補足", "mtgNote"], ["第1希望日", "d1"], ["第2希望日", "d2"], ["第3希望日", "d3"], ["希望の時間帯", "tz"], ["日程の補足", "dnote"]],
           "doneMail": "内容を確認し、担当者からご連絡します（原則5営業日以内）。", "doneNoMail": "内容を確認し、担当者からご連絡します。"}
    help_ = {"co": {"t": "事業者名・法人名を、正式な名前で入れます。", "ex": "例：株式会社○○", "req": True}, "nm": {"t": "ご担当者のお名前です。", "ex": "例：山田 太郎", "req": True}, "addr": {"t": "所在地を都道府県から入れます。", "ex": "例：大阪府大阪市○○区○○1-2-3", "req": True}, "url": {"t": "ホームページがあれば入れます。", "ex": "例：https://example.jp"}, "svc": {"t": "会員に提供できるサービスや、協力できることを書きます（空のままでも送れます）。", "ex": "例：介護施設向けの電気料金の見直し。現状の請求書から削減額を無料で試算します", "req": False}, "perk": {"t": "会員だけの割引や特典があれば書きます。", "ex": "例：初年度の基本料金10%引き"}, "lic": {"t": "業務に必要な許認可・資格があれば書きます。", "ex": "例：社会保険労務士登録 第○○号"}, "tel": {"t": "日中につながる電話番号です。", "ex": "例：06-1234-5678", "req": True}, "mail": {"t": "担当者からの連絡を受け取るメールアドレスです。", "ex": "例：info@example.jp", "req": True}}
    for n in range(1, 11):
        r1 = n == 1
        if n <= 5:
            help_[f"a{n}a"] = {"t": "大分類を選びます。いちばん近いものを選んでください。", "req": r1}
            help_[f"a{n}b"] = {"t": "中分類を選びます（大分類を選ぶと出てきます）。", "req": r1}
            help_[f"a{n}c"] = {"t": "小分類を選びます（中分類を選ぶと出てきます）。", "req": r1}
            help_[f"a{n}d"] = {"t": "この分野で提供できることを書きます（空のままでも送れます）。", "ex": "例：介護施設向けの電気料金の見直し。請求書から削減額を無料で試算します", "req": False}
        help_[f"z{n}a"] = {"t": "地方を選びます。全国に対応できる場合は「全国」を選んでください。", "req": r1}
        help_[f"z{n}b"] = {"t": "都道府県を選びます（地方を選ぶと出てきます）。", "req": r1}
        help_[f"z{n}c"] = {"t": "市区町村を選びます。都道府県全体なら「全域」を選びます。", "req": r1}
        help_[f"z{n}d"] = {"t": "対応の条件などがあれば書きます（空のままでも送れます）。", "ex": "例：訪問は市内のみ、オンラインは全国"}
    help_.update({"mtgNote": {"t": "面談の方法について伝えたいことがあれば書きます。", "ex": "例：ビデオ通話はZoomを使えます"}, "d1": {"t": "面談を希望する日を選びます（空のままでも送れます）。"}, "d2": {"t": "ほかに都合のよい日があれば選びます。"}, "d3": {"t": "ほかに都合のよい日があれば選びます。"}, "dnote": {"t": "日程について伝えたいことがあれば書きます。", "ex": "例：平日の午後ならいつでも可"}})
    js = "<script>window.FORM_HELP=" + json.dumps(help_, ensure_ascii=False) + ";window.FORM_GROUPS=[{name:'kind',label:'申し込みの種類'}];window.FORM_CHECKS=['agree'];window.FORM_SCOPE='#sf';window.FORM_SUBMIT='#ssend';window.FORM_DONE_LABEL='申し込むボタンへ ›';</script>" + CASCADE_JS + "<script>(function(){var A=makeCascade({tree:" + json.dumps(PARTNER_TAX, ensure_ascii=False) + ",box:'areas',add:'addArea',prefix:'a',title:'分野',max:5,labels:['大分類','中分類','小分類','詳細'],ph:'例：介護施設向けの電気料金の見直し'}),Z=makeCascade({tree:" + json.dumps(zone_tree(), ensure_ascii=False) + ",box:'zones',add:'addZone',prefix:'z',title:'地域',max:10,labels:['地方','都道府県','市区町村','詳細'],ph:'例：訪問は市内のみ、オンラインは全国'});window.teikeiCheck=function(){return A.check()||Z.check()};window.teikeiRows=function(){return A.rows().concat(Z.rows())};window.teikeiFields=function(){return A.firsts().map(function(x){return '提携：'+x})};var d=new Date();d.setDate(d.getDate()+1);var mn=d.toISOString().slice(0,10);['d1','d2','d3'].forEach(function(i){var e=document.getElementById(i);if(e)e.min=mn})})();</script>" + SIMPLE_JS.replace("__CFG__", json.dumps(cfg, ensure_ascii=False))
    page("kyoryoku/teikei.html", "提携・協業の申し込み", "医療介護総合支援会への提携・協業の申し込みフォームです。医療・介護に関わる方へのサービスを提供する事業者、弁護士・税理士・社会保険労務士・行政書士などの専門家の方の協力を募集しています。", "<main id=\"main\">" + body + "</main>", cur="", extra_js=js)

def build_youbou():
    kinds = [("ほしい支援・サービスがある", "こんな支援があれば助かる"), ("今の支援を改善してほしい", "使ってみて気になったこと"), ("サイトの使いやすさ", "分かりにくい・見づらいところ"), ("その他のご意見", "")]
    who = [(r["name"], "") for r in ROLES] + [("答えない", "")]
    opts = "".join(f'<option>{E(SUP[k]["name"])}</option>' for c in CATS for k in c["items"])
    form = f'''<form class="form-card" id="sf" novalidate>
<h2>要望を送る</h2><p class="hint">名前を書かずに送れます。<span class="req">※必須</span>の欄だけ入れれば送れます。</p>
<p class="note-box" id="preNote" hidden></p>
<fieldset class="fld" style="border:0;padding:0;margin:0 0 22px">{lg("要望の種類", True)}{radios("kind", kinds)}</fieldset>
<div class="fld"><label for="sup">関係する支援（分かれば）</label><select id="sup"><option value="">選んでください</option>{opts}<option>特にない・分からない</option></select></div>
{fld("memo", "要望・ご意見の内容（1,000文字まで）", True, "textarea", 'placeholder="例：夜勤明けでも相談できるよう、夜の時間帯にも受付をしてほしいです。"', 1000)}
<p class="hint" style="margin-top:-6px">病名・症状・服薬・要介護度・番号などは書かないでください。</p>
<fieldset class="fld" style="border:0;padding:0;margin:18px 0 22px">{lg("あなたの立場（任意）", False)}{radios("who", who, False)}</fieldset>
<fieldset class="fld" style="border:0;padding:0;margin:0 0 18px">{lg("返信", True)}{radios("reply", [("返信は不要", "名前もメールアドレスも入れずに送れます"), ("返信がほしい", "メールアドレスを入れてください")])}</fieldset>
<div id="replyBox" hidden>
{fld("nm", "お名前（任意）", extra='autocomplete="name"', ml=60)}
{fld("mail", "返信先のメールアドレス", True, "email", 'autocomplete="email" inputmode="email"', 120)}
</div>
{AGREE}{HP}
<p class="err" id="serr" role="alert" hidden></p>
<button class="btn btn-g" type="submit" id="ssend" style="width:100%;margin-top:16px">この内容で送る</button>
</form><div id="sdone" hidden></div>'''
    body = ph("要望の窓口", "「こんな支援がほしい」「ここを改善してほしい」という声を、どの立場の方からも受け付けています。", [("提携・協業・要望", "kyoryoku/index.html"), ("要望の窓口", None)], "head-3.jpg", "chat") + f'<section class="sec"><div class="wrap" style="max-width:860px">{form}<p class="fine" style="margin-top:18px">いただいた声は、新しい支援づくりや改善に使います。個別の返信は「返信がほしい」を選んだ方にのみお送りします。困りごとのご相談は<a href="{{p}}contact/index.html">相談の受付</a>、提携・協業のお申し込みは<a href="teikei.html">専用のフォーム</a>へ。</p></div></section>'
    pre = {k: SUP[k]["name"] for c in CATS for k in c["items"]}
    cfg = {"endpoint": SITE["endpoint"], "site": SITE["name"], "mail": SITE["mail"], "title": "要望・ご意見", "prefix": "IKY", "field": "要望・ご意見", "kindName": "kind", "noName": "（名前なしの要望）", "btn": "この内容で送る", "sens": "memo",
           "reqRadio": [["kind", "要望の種類"], ["reply", "返信のいる・いらない"]], "reqText": [["memo", "要望・ご意見の内容"], ["mail", "返信先のメールアドレス"]],
           "toggles": [{"name": "reply", "value": "返信がほしい", "show": ["replyBox"]}],
           "rows": [["要望の種類", "kind", "radio"], ["関係する支援", "sup"], ["内容", "memo"], ["立場", "who", "radio"], ["返信", "reply", "radio"], ["お名前", "nm"], ["メール", "mail"]],
           "doneMail": "内容を確認し、ご入力のメールアドレスへご返信します（原則5営業日以内）。", "doneNoMail": "貴重なご意見をありがとうございました。今後の支援づくりに生かします。"}
    js_pre = "<script>(function(){var P=" + json.dumps(pre, ensure_ascii=False) + ",s=new URLSearchParams(location.search).get('s');if(s&&P[s]){var o=document.getElementById('sup');if(o){o.value=P[s]}var t=document.getElementById('preNote');if(t){t.hidden=false;t.textContent='「'+P[s]+'」についての要望として送ります。'}}})();</script>"
    help_ = {"memo": {"t": "ほしい支援や、改善してほしいことを自由に書きます。", "ex": "例：夜勤明けでも相談できるよう、夜の時間帯にも受付をしてほしい", "req": True}, "sup": {"t": "関係する支援があれば選びます（なくても送れます）。"}, "nm": {"t": "返信の宛名に使います（空でも送れます）。", "ex": "例：山田 花子"}, "mail": {"t": "返信を受け取るメールアドレスです。", "ex": "例：yamada@example.jp", "req": True}}
    js = "<script>window.FORM_HELP=" + json.dumps(help_, ensure_ascii=False) + ";window.FORM_GROUPS=[{name:'kind',label:'要望の種類'},{name:'reply',label:'返信'}];window.FORM_CHECKS=['agree'];window.FORM_SCOPE='#sf';window.FORM_SUBMIT='#ssend';window.FORM_DONE_LABEL='送るボタンへ ›';</script>" + SIMPLE_JS.replace("__CFG__", json.dumps(cfg, ensure_ascii=False)) + js_pre
    page("kyoryoku/youbou.html", "要望の窓口", "医療介護総合支援会への要望・ご意見のフォームです。ほしい支援、今の支援の改善、サイトの使いやすさなど、どの立場の方からも名前なしで送れます。", "<main id=\"main\">" + body + "</main>", cur="", extra_js=js)

def build_soudan():
    cards = [
        ("命や体に関わるとき", "119", "救急・消防は119番。事件・事故は110番へ。", None),
        ("救急車を呼ぶか迷うとき（大阪府内）", "#7119", "救急安心センターおおさかで、看護師などが助言します。", None),
        ("死にたい・消えたいほどつらいとき", "", "厚生労働省「まもろうよ こころ」で、電話・SNSの相談窓口を探せます。", "https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel/"),
        ("職場・労働の問題", "", "総合労働相談コーナー（各都道府県の労働局）で、労働者・事業主のどちらからも無料で相談できます。", "https://www.mhlw.go.jp/general/seido/chihou/kaiketu/soudan.html"),
        ("高齢者の介護・虐待が心配なとき", "", "お住まいの市区町村の高齢者担当窓口、または地域包括支援センターへ。下の「地域の窓口を探す」で連絡先を調べられます。", "#gyakutai"),
        ("契約・訪問販売などのトラブル", "188", "消費者ホットライン（188）で、身近な消費生活センターにつながります。", None),
    ]
    h = "".join(f'<div class="card"><b>{t}</b>{f"<span class=\"num-big\">{n}</span>" if n else ""}<p>{d}</p>{(f"<p><a href=\"{u}\">地域の窓口を探す ↓</a></p>" if u.startswith("#") else f"<p><a href=\"{u}\" target=\"_blank\" rel=\"noopener\">窓口を見る（別の画面で開きます）</a></p>") if u else ""}</div>' for t, n, d, u in cards)
    body = ph("緊急時・公的な相談窓口", "この窓口で待たず、すぐに専門の窓口へご連絡ください。", [("緊急時・公的な相談窓口", None)], "head-5.jpg", "sos") + f'''
<section class="sec"><div class="wrap" style="max-width:1000px">{SAFETY}<div class="sos" style="margin-top:26px">{h}</div></div></section>
<section class="sec band" id="gyakutai"><div class="wrap" style="max-width:1000px">
{sec_h("高齢者の介護・虐待が心配なとき", "お住まいの地域の窓口を探す", "府県と市区町村を選ぶと、高齢者虐待の相談・通報の窓口が出ます。ご本人・ご家族・近所の方・介護に関わる方、どなたからでも相談できます。")}
<div class="gy-form">
<div class="fld"><label for="gyPref">府県</label><select id="gyPref"><option value="">選んでください</option></select></div>
<div class="fld"><label for="gyMuni">市区町村</label><select id="gyMuni" disabled><option value="">先に府県を選んでください</option></select></div>
<div class="fld" id="gyAreaWrap" hidden><label for="gyArea">区・地域</label><select id="gyArea"></select></div>
</div>
<div id="gyOut" class="gy-out" aria-live="polite"><p class="fine">対応地域：大阪府・京都府・兵庫県・奈良県・滋賀県・和歌山県・岐阜県・愛知県（各府県が公開している一覧から作成）</p></div>
<div class="gy-notes">
<p>{ic("shield")}<span>通報した人が誰かは、法律で守られます（高齢者虐待防止法）。虐待かどうかはっきりしなくても、相談できます。</span></p>
<p>{ic("warn")}<span>命や体に危険が迫っているときは、迷わず<b>110番</b>・<b>119番</b>へ。</span></p>
</div>
</div></section>'''
    js = '<script src="{p}assets/gyakutai.js" defer></script><script>' + GY_JS + '</script>'
    page("soudan/index.html", "緊急時・公的な相談窓口", "命や体に関わるとき、救急車を呼ぶか迷うとき、死にたいほどつらいとき、職場・労働の問題、高齢者の介護や虐待、契約のトラブルで使える公的な相談窓口の一覧です。", "<main id=\"main\">" + body + "</main>", cur="", extra_js=js.replace("{p}", "../"))

GY_JS = r"""
document.addEventListener('DOMContentLoaded',function(){
var D=window.GYAKUTAI;if(!D)return;
var P=document.getElementById('gyPref'),M=document.getElementById('gyMuni'),A=document.getElementById('gyArea'),AW=document.getElementById('gyAreaWrap'),O=document.getElementById('gyOut');
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function opt(sel,list,ph){sel.innerHTML='<option value="">'+ph+'</option>'+list.map(function(k){return '<option>'+esc(k)+'</option>'}).join('')}
function save(){try{localStorage.setItem('iryo-gy',JSON.stringify([P.value,M.value,A.value]))}catch(e){}}
opt(P,Object.keys(D),'選んでください');
function card(c){var t=c.t.split(' / ');return '<li class="gy-c"><b>'+esc(c.l)+'</b><span class="gy-tels">'+t.map(function(x){return '<a class="gy-tel" href="tel:'+x.replace(/-/g,'')+'">'+esc(x)+'</a>'}).join('')+'</span>'+(c.n?'<small>'+esc(c.n)+'</small>':'')+'</li>'}
function show(){var p=D[P.value];if(!p||!M.value){O.innerHTML='<p class="fine">市区町村を選んでください。</p>';return}
 var m=p.m[M.value],h='',list=[];
 if(m.areas){if(!A.value){O.innerHTML='<p class="fine">区・地域を選んでください。</p>';return}list=m.areas[A.value]||[]}else list=m.list||[];
 h+='<h3 class="gy-h">'+esc(P.value+' '+M.value+(A.value?' '+A.value:''))+'の窓口</h3><ul class="gy-list">'+list.map(card).join('')+'</ul>';
 if(m.all&&m.all.length)h+='<p class="gy-sub">夜間・休日など</p><ul class="gy-list">'+m.all.map(card).join('')+'</ul>';
 if(p.note)h+='<p class="note-box" style="margin-top:16px">'+esc(p.note)+'</p>';
 h+='<p class="fine gy-src">出典：<a href="'+esc(m.src||p.src.url)+'" target="_blank" rel="noopener">'+esc(m.src?M.value+'の公式ページ':p.src.label)+'（別の画面で開きます）</a>　'+'情報の時点：'+esc(p.src.asof)+'。番号が変わっている場合があります。つながらないときは、市区町村の代表番号へおかけください。</p>';
 O.innerHTML=h}
P.addEventListener('change',function(){var p=D[P.value];AW.hidden=true;A.innerHTML='';
 if(p){opt(M,Object.keys(p.m),'選んでください');M.disabled=false}else{M.innerHTML='<option value="">先に府県を選んでください</option>';M.disabled=true}
 save();show()});
M.addEventListener('change',function(){var p=D[P.value],m=p&&p.m[M.value];
 if(m&&m.areas){opt(A,Object.keys(m.areas),'選んでください');AW.hidden=false}else{AW.hidden=true;A.innerHTML=''}
 save();show()});
A.addEventListener('change',function(){save();show()});
try{var s=JSON.parse(localStorage.getItem('iryo-gy')||'[]');if(s[0]&&D[s[0]]){P.value=s[0];P.dispatchEvent(new Event('change'));if(s[1]&&D[s[0]].m[s[1]]){M.value=s[1];M.dispatchEvent(new Event('change'));if(s[2]){A.value=s[2];show()}}}}catch(e){}
});
"""

OPENING_JS = r"""<script>(function(){
var op=document.getElementById('op');if(!op)return;
var v=document.getElementById('opV'),st=document.getElementById('opStart'),snd=document.getElementById('opSnd');
var T=null,AT=null,shown=false,done=false,started=false,fadeI=null;
function seen(){try{if(localStorage.getItem('iryo-op-seen')==='1')return true}catch(e){}try{return sessionStorage.getItem('iryo-op')==='1'}catch(e){return false}}
function mark(){try{sessionStorage.setItem('iryo-op','1')}catch(e){}try{localStorage.setItem('iryo-op-seen','1')}catch(e){}}
function fadeOut(){clearInterval(fadeI);if(v.muted||v.paused)return;var vol=v.volume;fadeI=setInterval(function(){vol=Math.max(0,vol-0.08);v.volume=vol;if(vol<=0){clearInterval(fadeI);v.muted=true}},90)}
function close(){if(done)return;done=true;clearTimeout(T);clearTimeout(AT);mark();fadeOut();op.classList.add('out');document.documentElement.style.overflow='';
 setTimeout(function(){op.hidden=true;try{v.pause()}catch(e){}var m=document.getElementById('main');if(m){m.setAttribute('tabindex','-1');try{m.focus({preventScroll:true})}catch(e){}}},1500)}
function showText(){if(shown)return;shown=true;op.classList.add('text');T=setTimeout(close,8000);setTimeout(function(){try{document.getElementById('opGo').focus({preventScroll:true})}catch(e){}},600)}
function setSnd(on){v.muted=!on;snd.textContent=on?'音を消す':'音を出す';snd.setAttribute('aria-pressed',String(on))}
function tick(){if(!started||done)return;var t=v.currentTime;
 var c1=t>0.25&&t<3.05,c2=t>3.55&&t<5.55,co=t>0.25&&t<3.75;
 if(c1!==op.classList.contains('c1'))op.classList.toggle('c1',c1);if(c2!==op.classList.contains('c2'))op.classList.toggle('c2',c2);if(co!==op.classList.contains('co'))op.classList.toggle('co',co);
 if(t>9.15){op.classList.add('ttl');return}
 setTimeout(function(){requestAnimationFrame(tick)},100)}
function play(withSound){
 if(started)return;started=true;clearTimeout(AT);op.classList.add('playing');st.hidden=true;snd.hidden=false;
 v.preload='auto';try{v.currentTime=0}catch(e){}v.volume=1;setSnd(withSound);
 tick();
 var p=v.play();if(p&&p.catch)p.catch(function(){setSnd(false);var q=v.play();if(q&&q.catch)q.catch(function(){op.classList.add('ended','ttl');showText()})});
 try{document.getElementById('opSkip').focus({preventScroll:true})}catch(e){}
}
function open(){
 done=false;shown=false;started=false;clearTimeout(T);clearTimeout(AT);clearInterval(fadeI);
 op.hidden=false;op.classList.remove('out','text','ended','playing','ttl','c1','c2','co');st.hidden=false;snd.hidden=true;
 document.documentElement.style.overflow='hidden';
 try{if(v.preload!=='auto'){v.preload='auto';v.load()}}catch(e){}
 try{document.getElementById('opSound').focus({preventScroll:true})}catch(e){}
 AT=setTimeout(function(){play(false)},8000);
}
v.addEventListener('ended',function(){op.classList.add('ended','ttl');showText()});
function vfail(){op.classList.add('ended','ttl');showText()}
v.addEventListener('error',vfail);var ls=v.querySelectorAll('source');if(ls.length)ls[ls.length-1].addEventListener('error',vfail);
document.getElementById('opSound').addEventListener('click',function(){play(true)});
document.getElementById('opMute').addEventListener('click',function(){play(false)});
snd.addEventListener('click',function(){setSnd(v.muted)});
document.getElementById('opSkip').addEventListener('click',close);
document.getElementById('opSkip0').addEventListener('click',close);
document.getElementById('opGo').addEventListener('click',close);
document.getElementById('opAgain').addEventListener('click',function(){var w=!v.muted;clearTimeout(T);shown=false;op.classList.remove('text','ended','ttl','c1','c2','co');try{v.currentTime=0}catch(e){}requestAnimationFrame(tick);var p=v.play();if(p&&p.catch)p.catch(function(){});setSnd(w);try{document.getElementById('opSkip').focus({preventScroll:true})}catch(e){}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!op.hidden)close()});
var oa=document.querySelectorAll('[data-op]');for(var i=0;i<oa.length;i++)oa[i].addEventListener('click',function(e){e.preventDefault();open()});
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var h=location.hash||'';
if(h==='#op'){open()}else if(!reduce&&!seen()&&h===''){open()}
window.addEventListener('hashchange',function(){if(location.hash==='#op')open()});
})();</script>"""

def build_company():
    body = ph("運営会社", f"医療介護総合支援会は、{SITE['company']}が運営しています。", [("運営会社", None)], "head-2.jpg", "building") + f'''
<section class="sec"><div class="wrap" style="max-width:960px">
{sec_h("会社概要", SITE["company"], "リユース・買取事業を中心に、家じまい・不動産支援、シニアライフサポート、医療・介護支援などに取り組んでいます。")}
<div class="tbl-wrap"><table class="info"><tbody>
<tr><th>運営する窓口</th><td>{SITE["name"]}</td></tr>
<tr><th>会社名</th><td>{SITE["company"]}</td></tr>
<tr><th>代表取締役</th><td>{SITE["rep"]}</td></tr>
<tr><th>設立</th><td>{SITE["founded"]}</td></tr>
<tr><th>所在地</th><td>{SITE["zip"]} {SITE["addr"]}</td></tr>
<tr><th>許認可</th><td>{SITE["kobutsu"]}</td></tr>
<tr><th>適格請求書発行事業者 登録番号</th><td>{SITE["invoice"]}</td></tr>
<tr><th>支援会へのお問い合わせ</th><td>ウェブ受付（<a href="{{p}}contact/index.html">相談を送る</a>）<br>メール　{SITE["mail"]}</td></tr>
<tr><th>運営会社のお電話</th><td>{SITE["tel"]}（受付時間 {SITE["tel_hours"]}）<br><span class="fine">支援会の電話相談は準備中です。お電話では受付方法のご案内などを承ります。</span></td></tr>
<tr><th>対応地域</th><td>{SITE["area"]}</td></tr>
</tbody></table></div>
<div class="grid g3" style="margin-top:30px">
<a class="svc-card" href="{SITE["iejimai"]}">{emb("home")}<b>家じまい相談窓口</b><span class="fine">家財・住まい・相続・身元保証の総合相談</span></a>
<a class="svc-card" href="{SITE["kigyo"]}">{emb("doc")}<b>企業支援 総合相談窓口</b><span class="fine">許認可・補助金・経営の悩みを提携の専門家へ</span></a>
<a class="svc-card" href="{SITE["globe"]}">{emb("building")}<b>株式会社グローブ</b><span class="fine">運営会社の公式サイト</span></a>
</div></div></section>'''
    page("company/index.html", "運営会社", f"医療介護総合支援会の運営会社の概要です。所在地、設立、許認可、支援会へのお問い合わせ方法、対応地域と、連携している家じまい相談窓口・企業支援 総合相談窓口をご案内します。", "<main id=\"main\">" + body + "</main>", cur="company")

def doc_page(path, title, lead, img, icon, cards, desc):
    h = "".join(acc(icon, t, "", f'<p style="white-space:pre-line">{b}</p>') for t, b in cards)
    body = ph(title, lead, [(title, None)], img, icon) + f'<div class="wrap doc" style="padding-block:64px 88px;max-width:900px"><p class="fine" style="margin-bottom:18px">項目を押すと、内容が開きます。</p><div class="acc-group">{h}</div></div>'
    page(path, title, desc, "<main id=\"main\">" + body + "</main>")

def build_legal():
    S = SITE
    doc_page("privacy/index.html", "個人情報の取り扱い", f"{S['company']}は、{S['name']}でお預かりする個人情報を、次のとおり大切に取り扱います。", "head-2.jpg", "shield", [
        ("1. 事業者の名称・住所・代表者", f"{S['company']}（{S['name']}の運営会社）\n{S['zip']} {S['addr']}\n代表取締役　{S['rep']}"),
        ("2. 取得する個人情報", "ウェブ受付で、お名前または事業所名（伏せることもできます）、メールアドレス、電話番号（任意）、都道府県、ご相談の内容など、ご相談への対応に必要な情報をお預かりします。"),
        ("3. 病気や介護の状況などの情報（要配慮個人情報）", "受付フォームには、病名・症状・服薬・要介護度・障害名などは書かないようお願いしています。ご相談の対応にどうしても必要な場合は、ご本人の同意をいただいたうえで改めてお伺いし、その対応のためだけに利用します。受付フォームに病名などが書かれて届いた場合は、ご相談への対応に必要な範囲でのみ扱い、不要な部分は速やかに削除します。\nウェブ受付では、マイナンバー、口座番号、カード番号はお預かりしません（会員登録で必要な情報は、次の「会員登録と電子契約でお預かりする情報」のとおりです）。"),
        ("3-2. 会員登録と電子契約でお預かりする情報", "会員登録と電子契約では、次の情報をお預かりします。\n・事業所・法人・協賛会員：事業所名・法人名、代表者と担当者のお名前、所在地、電話番号、メールアドレス、会員の種類、事業所と職員の数、お支払い方法、押印の画像、承認した日時と端末の情報\n・個人会員（営業協力者）：お名前・ふりがな、住所、電話番号、メールアドレス、生年月日、紹介料の振込口座、本人確認書類の写真、押印の画像、承認した日時と端末の情報\n利用の目的は、ご本人であることの確認、契約の締結と管理、会費の請求と入金の確認、紹介料の計算とお支払い、法令に基づく帳簿の保存です。本人確認書類は、マイナンバーカードは表面のみをお預かりします。裏面（個人番号）は撮影しないでください。"),
        ("4. 利用の目的", "・ご相談・要望・協力の申し出の内容の確認と、ご返信\n・対応できるかどうかの検討\n・ご本人の同意を得たうえでの、専門家・提携先へのおつなぎ\n・会員登録・電子契約の手続き、会費の請求と入金の確認、紹介料のお支払い\n・サービスの改善（個人を特定しない形での集計）"),
        ("5. 第三者への提供", "ご本人の同意がある場合、または法令に基づく場合を除き、第三者へ提供しません。専門家・提携先へおつなぎする際は、提供する相手・目的・範囲・費用を事前にご説明し、同意をいただいてから提供します。ご本人の同意なく、勤務先へ相談の内容を伝えることはありません。"),
        ("6. 業務の委託と、使用しているサービス", "受付の内容と電子契約の書類（契約書・押印の画像・本人確認書類の写真）は、Google LLC（アメリカ合衆国）が提供するサービス（Google Apps Script、Google スプレッドシート、Google ドライブ、Gmail）を使って受信・保存しています。このサイトでは、文字の表示に Google Fonts を使用しています。\nアメリカ合衆国の個人情報の保護に関する制度は、個人情報保護委員会のウェブサイトでご確認いただけます。"),
        ("7. 安全管理のための取り組み", "・取り扱う担当者を限定し、責任者を定めます（組織的な取り組み）\n・担当者に定期的な教育を行います（人的な取り組み）\n・書類は施錠できる場所で保管し、持ち出しを制限します（物理的な取り組み）\n・電子データは利用者を限定し、二段階の認証などで保護します（技術的な取り組み）\n・外国のサービスを利用する際は、その国の制度を把握したうえで対策を講じます（外的環境の把握）"),
        ("8. 保存の期間と削除", "受付の内容は、対応の完了から3年を目安に保存し、その後は削除します。会員の契約書と会費・紹介料の記録は、法令に基づき契約の終了から7年間保存します。本人確認書類の写真は、個人会員の登録が終わってから1年を目安に削除します。ご本人から削除のご請求があった場合は、法令で保存が必要なものを除き、速やかに削除します。"),
        ("9. 開示・訂正・利用停止などのご請求", "ご本人またはその代理人から、保有する個人情報の開示、訂正、追加、削除、利用の停止、第三者への提供の記録の開示などのご請求があった場合は、ご本人であることを確認したうえで、遅滞なく対応します。ご請求は、下記の窓口までご連絡ください。"),
        ("10. ご相談・苦情の窓口", f"{S['company']}　{S['name']}\nメール：{S['mail']}\n電話：{S['tel']}（受付時間 {S['tel_hours']}）\n所在地：{S['zip']} {S['addr']}"),
        ("11. 方針の見直し", "法令の改正や業務の変更にあわせて、この方針を見直すことがあります。変更した場合は、このページでお知らせします。\n制定：2026年10月18日\n改定：2026年11月13日（会員登録と電子契約でお預かりする情報を追記）"),
    ], f"{S['name']}でお預かりする個人情報の取り扱いです。取得する情報、利用の目的、第三者への提供、使用しているサービス、安全管理、保存期間、開示などのご請求の方法をご説明します。")
    doc_page("terms/index.html", "利用規約・免責事項", "このサイトとウェブ受付をご利用いただく際のお約束です。", "head-2.jpg", "doc", [
        ("このサイトの内容について", "このサイトの情報は、医療・介護に関わる方への一般的なご案内です。診断・治療、法律、税務、労務、許認可などの個別の判断は、必ず医療機関や、弁護士・税理士・社会保険労務士・行政書士などの有資格者、または担当の機関にご確認ください。"),
        ("緊急時のご利用について", "このサイトとウェブ受付は、緊急の対応を行っていません。命や体に関わるときは119番、事件・事故は110番へご連絡ください。"),
        ("責任の範囲", "掲載している情報は、できる限り正確になるよう努めていますが、その正確さや最新であることを保証するものではありません。このサイトの情報を利用したことで生じた損害について、当社の故意または重大な過失による場合を除き、当社は責任を負いかねます。"),
        ("提携事業者・専門家のサービス", "提携事業者・専門家が提供するサービスの契約は、お客様と各事業者・専門家との間で結ばれます。支援会は内容の整理とおつなぎを行い、契約の当事者にはなりません。支援会は専門家から紹介料を受け取りません。なお、支援会は、事業所・法人の会員をご紹介いただいた個人会員（営業協力者）に、紹介先の会費などの一部を紹介料としてお支払いしています（会員制度のページに仕組みを記載しています）。"),
        ("行わないこと", "支援会は、特定の事業所への就職のあっせん（職業紹介）、補助金などの申請書類の作成、法律事務の取り扱いは行いません。"),
        ("著作権", "このサイトの文章・画像・映像などの著作権は、株式会社グローブまたは正当な権利を持つ者に帰属します。私的な利用の範囲を超えて、無断で転載・複製することはお断りします。"),
        ("禁止事項", "このサイトの運営を妨げる行為、ほかの利用者や第三者に不利益を与える行為、法令や公序良俗に反する行為を禁止します。"),
        ("内容の変更", "このサイトの内容や、この利用規約は、予告なく変更することがあります。"),
        ("準拠法", "この利用規約は、日本の法律に基づいて解釈します。"),
    ], "医療介護総合支援会のサイトとウェブ受付の利用規約・免責事項です。情報の扱い、緊急時のご利用、提携事業者・専門家のサービス、支援会が行わないこと、著作権、禁止事項をご説明します。")

# ---------- 受付フォーム ----------
def build_contact():
    D = {"roles": [{"id": r["id"], "name": r["name"], "short": r["short"], "sup": r["sup"]} for r in ROLES],
         "purposes": [{"id": a, "name": b, "short": c} for a, b, c in PURPOSES],
         "sup": {k: {"name": s["name"], "short": s["short"]} for k, s in SUP.items()},
         "endpoint": SITE["endpoint"], "site": SITE["name"], "mail": SITE["mail"]}
    trees = {}
    for rid, groups in CONTACT_GROUPS.items():
        t = {}
        for big, keys in groups:
            t[big] = {}
            for k in keys:
                if k in CONTACT_SPECIAL: t[big][CONTACT_SPECIAL[k][0]] = CONTACT_SPECIAL[k][1]
                else: t[big][SUP[k]["name"]] = CONTACT_SUB[k]
        trees[rid] = t
    D["trees"] = trees
    D["supNames"] = [s["name"] for s in SUP.values()]
    D["ex"] = {
        "kigyo": ["例：記録ソフトの入れ替えを考えている", "例：職員15名の通所介護です。来年度に向けて早めに相談したいです。"],
        "hataraku": ["例：来月から夜勤が増えるのが不安", "例：勤務先には知られずに相談したいです。"],
        "honnin": ["例：退院したあと、自宅で暮らせるか不安", "例：一人暮らしで、近くに頼れる家族がいません。"],
        "kazoku": ["例：離れて暮らす母の通院の付き添いが難しい", "例：平日の昼間は仕事のため、メールでの連絡を希望します。"],
        "none": ["例：どこに相談すればよいか分からない", "例：まず話を聞いてもらいたいです。"]}
    body = ph("相談を送る（ウェブ総合受付）", "立場を選び、相談の内容を選ぶだけで送れます。全部で4つの段階です。", [("相談を送る", None)], "head-5.jpg", "chat") + f'''
<div class="wrap" style="padding-block:56px 88px;max-width:960px">
{acc("chat", "受付の方法・返信・対応地域", "ウェブ受付は24時間。LINE・電話は準備中", f"""<div class="contact-box"><dl>
<dt>ウェブ受付</dt><dd>このページから24時間受け付けています。</dd>
<dt>返信</dt><dd>{SITE["reply"]}</dd>
<dt>メール</dt><dd><a href="mailto:{SITE["mail"]}">{SITE["mail"]}</a></dd>
<dt>LINE・電話</dt><dd>相談窓口は準備中です。受付方法のご案内は、運営会社（{SITE["tel"]}　{SITE["tel_hours"]}）でも承ります。</dd>
<dt>対応地域</dt><dd>{SITE["area"]}</dd></dl></div>""", aid="toiawase")}
<ol class="steps" id="steps" aria-hidden="true" style="margin-top:30px"><li data-i="0">立場</li><li data-i="1">相談の内容</li><li data-i="2">ご連絡先</li><li data-i="3">確認</li></ol>
<form class="form-card" id="f" novalidate>
<p class="stepnow" id="stepnow"></p>
<section data-step="0"><h2>あなたの立場を選んでください</h2><p class="hint">いちばん近いものを1つ選んでください。</p><div class="opts radio-opts" id="o0"></div></section>
<section data-step="1" hidden><h2>相談の内容を選んでください</h2><p class="hint">上から順に、<b>大分類 → 中分類 → 小分類</b>の近いものを選んでください。<b>選ばなくても、書かなくても進めます。</b>くわしく伝えたいことがあれば「詳細」に書けます。ほかにも相談したいことがあれば「＋ 相談の内容を追加」で3つまで選べます。</p>
<div id="cats"></div><button type="button" class="btn btn-o" id="addCat" style="margin-top:6px">＋ 相談の内容を追加</button>
<div id="facBox" hidden style="margin:26px 0 8px;padding:16px 18px;border:2px solid var(--line);border-radius:12px;background:var(--surface)"><p style="margin:0 0 6px;font-weight:700" id="facTtl">いま通っている・利用している病院や施設</p><p class="hint" style="margin:0 0 12px">当会のお手伝いは、会員の病院・クリニック・介護施設などと一緒に行っています。通っている先を教えてください（会員かどうかは、こちらで確かめます）。</p>
<div class="fld"><label for="facK">通っている先の種類 <span class="req">※必須</span></label><select id="facK"><option value="">選んでください</option><option>病院</option><option>クリニック・診療所</option><option>介護施設（入所・入居）</option><option>デイサービス・訪問介護などの事業所</option><option>訪問看護・在宅医療</option><option>薬局</option><option>居宅介護支援事業所（ケアマネジャー）</option><option>まだどこにも通っていない・決まっていない</option></select></div>
<div class="fld" id="facNw"><label for="facN">病院・施設の名前 <span class="req">※必須</span></label><input id="facN" type="text" maxlength="80" placeholder="例：〇〇クリニック、〇〇デイサービス"><label for="facNx" style="display:flex;align-items:center;gap:10px;margin-top:10px;font-weight:400;cursor:pointer"><input type="checkbox" id="facNx" style="width:24px;height:24px;flex:none">名前が分からない（空欄のまま進む）</label></div>
<div class="fld" id="facAw" style="margin-bottom:0"><label for="facA">所在地（市区町村・任意）</label><input id="facA" type="text" maxlength="60" placeholder="例：大阪市北区"></div></div>
<p class="hint" style="margin-top:26px">病名・症状・服薬・要介護度・障害名・マイナンバー・口座番号・カード番号は書かないでください。</p>
<div class="fld"><label for="memo">そのほか伝えたいこと（任意・1,000文字まで）</label><textarea id="memo" maxlength="1000"></textarea><p class="fine" id="cnt" aria-live="polite">0 / 1,000文字</p><p class="warn-inline" id="sens" hidden>病気や体の状態、番号などの情報が含まれている可能性があります。送る前に、その部分を消してください。</p></div><p class="hint" style="margin-top:22px"><b>状況（分かる範囲で。選ばなくても進めます）</b></p>
<div class="fld"><label for="when">ご希望の時期</label><select id="when"><option value="">選んでください</option><option>まず情報を知りたい</option><option>1か月以内に相談したい</option><option>3か月以内</option><option>利用・協力を検討している</option><option>時期は決まっていない</option></select></div>
<div class="fld"><label for="pref">都道府県</label><select id="pref"><option value="">選んでください</option><option>大阪府</option><option>兵庫県</option><option>京都府</option><option>奈良県</option><option>滋賀県</option><option>和歌山県</option><option>その他の地域</option></select></div>
<div class="fld"><label for="want">希望する対応</label><select id="want"><option value="">選んでください</option><option>相談内容を整理してほしい</option><option>使える支援・制度を知りたい</option><option>サービスの利用条件を知りたい</option><option>専門家・提携先につないでほしい</option><option>まだ分からない</option></select></div>
<p class="fine" style="margin-top:18px">この受付は緊急の対応を行っていません。命や体に関わるときは119番、事件・事故は110番へ（<a href="{{p}}soudan/index.html">公的な相談窓口</a>）。</p></section>
<section data-step="2" hidden><h2>ご連絡先</h2><p class="hint">返信に使います。</p>
<fieldset class="fld" style="border:0;padding:0;margin:0 0 20px"><legend style="font-weight:700;font-size:1.08rem;margin-bottom:8px">お名前の扱い</legend><div class="opts radio-opts"><label><input type="radio" name="anon" value="伏せる"><span>名前・事業所名を伏せて相談<small>返信用のメールアドレスは必要です</small></span></label><label><input type="radio" name="anon" value="伝える" checked><span>名前を伝えて相談<small>返信の宛名に使います</small></span></label></div></fieldset>
<div class="fld" id="nmwrap"><label for="nm">お名前</label><input id="nm" type="text" autocomplete="name" maxlength="60"></div>
<div class="fld" id="cowrap"><label for="co">事業所名・会社名（任意）</label><input id="co" type="text" autocomplete="organization" maxlength="80"></div>
<div class="fld"><label for="mail">返信先のメールアドレス <span class="req">※必須</span></label><input id="mail" type="email" autocomplete="email" maxlength="120" inputmode="email"></div>
<div class="fld"><label for="tel">電話番号（任意）</label><input id="tel" type="tel" autocomplete="tel" inputmode="tel" maxlength="20"></div>
<label class="agree" for="agree"><input type="checkbox" id="agree"><span><a href="{{p}}privacy/index.html" target="_blank" rel="noopener">個人情報の取り扱い</a>（別の画面で開きます）を読み、同意します。</span></label>
<div class="hp" aria-hidden="true" style="position:absolute;left:-9999px"><label for="hpf">この欄は空のままにしてください</label><input id="hpf" type="text" tabindex="-1" autocomplete="off"></div></section>
<section data-step="3" hidden><h2>内容のご確認</h2><p class="hint">この内容で送信します。修正するときは「前に戻る」を押してください。</p>
<dl class="sum" id="sum"></dl>
<div class="btns" style="margin-top:22px"><button class="btn btn-p" type="submit" id="send">この内容で送信する</button><button class="btn btn-o" type="button" id="copy">内容を写し取る（コピー）</button></div>
<p class="fine" id="copyMsg" style="margin-top:12px" role="status"></p></section>
<p class="err" id="err" role="alert" hidden></p>
<div class="form-nav" id="fnav"><button class="btn btn-o" type="button" id="back">‹ 前に戻る</button><button class="btn btn-p" type="button" id="next">次へ進む ›</button></div>
</form>
<div id="done" hidden></div>
</div>'''
    js = CASCADE_JS + "<script>window.FORM_HELP={\"memo\": {\"t\": \"ほかに伝えておきたいことがあれば書きます（空のままでも進めます）。\", \"ex\": \"※病名・症状・番号は書かないでください\", \"req\": false}, \"c1a\": {\"t\": \"大分類を選びます。選ばなくても進めます。\", \"req\": false}, \"c1b\": {\"t\": \"中分類を選びます（大分類を選ぶと出てきます）。\", \"req\": false}, \"c1c\": {\"t\": \"小分類を選びます（中分類を選ぶと出てきます）。\", \"req\": false}, \"c1d\": {\"t\": \"くわしく伝えたいことがあれば書きます（空のままでも進めます）。\"}, \"when\": {\"t\": \"いつごろ相談したいかを選びます（空のままでも進めます）。\", \"req\": false}, \"pref\": {\"t\": \"お住まい・事業所のある都道府県を選びます（空のままでも進めます）。\", \"req\": false}, \"want\": {\"t\": \"支援会にしてほしいことに近いものを選びます（空のままでも進めます）。\", \"req\": false}, \"nm\": {\"t\": \"お名前を入れます。返信の宛名に使います。\", \"ex\": \"例：山田 花子　名前を伏せたいときは、上で「名前・事業所名を伏せて相談」を選んでください\", \"req\": true}, \"co\": {\"t\": \"事業所名・会社名を入れます（企業・事業者の方、協力のお申し出の方のみ）。\", \"ex\": \"例：○○デイサービス\", \"req\": false}, \"mail\": {\"t\": \"返信を受け取るメールアドレスです。\", \"ex\": \"例：yamada@example.jp　携帯のメールは、パソコンからのメールを受け取れる設定にしてください\", \"req\": true}, \"tel\": {\"t\": \"電話での連絡を希望するときだけ入れます。\", \"ex\": \"例：06-1234-5678\", \"req\": false}};window.FORM_GROUPS=[{name:'role',label:'立場'}];window.FORM_CHECKS=['agree'];window.FORM_STEPWISE=true;window.FORM_SCOPE='#f';window.FORM_SUBMIT='#send';window.FORM_NEXT='#next';window.FORM_DONE_LABEL='進むボタンへ ›';</script>" + "<script>(function(){var D=" + json.dumps(D, ensure_ascii=False) + r""";
(function(H){H.facK={t:'いま通っている（利用している）病院・クリニック・施設の種類を選びます。',ex:'まだどこにも通っていない場合は、いちばん下を選びます',req:true};H.facN={t:'通っている病院・施設の名前を入れます。',ex:'分からない場合は、下の「名前が分からない」に印を付けてください',req:true};H.facA={t:'分かれば、市区町村を入れます（空のままでも進めます）。',req:false}})(window.FORM_HELP=window.FORM_HELP||{});
var L=['立場','相談の内容','ご連絡先','確認'],st=0,f=document.getElementById('f'),secs=f.querySelectorAll('section[data-step]'),lis=document.querySelectorAll('#steps li'),err=document.getElementById('err'),t0=Date.now(),sending=false;
var SENS=/(病名|診断|症状|要介護|服薬|薬の名前|障害名|既往歴|検査結果|血圧|マイナンバー|個人番号|口座番号|カード番号|\d{4}[-\s]?\d{4}[-\s]?\d{4})/;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function opt(type,name,val,label,sub,checked){return '<label><input type="'+type+'" name="'+name+'" value="'+esc(val)+'"'+(checked?' checked':'')+'><span>'+esc(label)+(sub?'<small>'+esc(sub)+'</small>':'')+'</span></label>'}
function vals(n){return Array.prototype.map.call(f.querySelectorAll('input[name="'+n+'"]:checked'),function(i){return i.value})}
function one(n){return vals(n)[0]||''}
var q=new URLSearchParams(location.search),preR=q.get('role')||'',preP=q.get('p')||'',preS=q.get('s')||'';
if(preP==='youbou'||preP==='kyoryoku'){location.replace('../kyoryoku/'+(preP==='youbou'?'youbou.html'+(preS?'?s='+encodeURIComponent(preS):''):'teikei.html'));return}
document.getElementById('o0').innerHTML=D.roles.map(function(r){return opt('radio','role',r.id,r.name,r.short,r.id===preR)}).join('')+opt('radio','role','none','分からない・近いものがない','立場を決めずに相談できます',false);
var CO={tree:{},box:'cats',add:'addCat',prefix:'c',title:'相談の内容',max:3,optional:true,labels:['大分類','中分類','小分類','詳細'],ph:''},C=makeCascade(CO),curR=null,preDone=false;
function ensureTree(){var r=one('role')||'none';if(r===curR)return;curR=r;var ex=D.ex[r]||D.ex.none;CO.ph=ex[0];var mm=document.getElementById('memo');if(mm)mm.placeholder=ex[1];
 var H=window.FORM_HELP||{};for(var k=1;k<=3;k++){H['c'+k+'d']={t:'くわしく伝えたいことがあれば書きます（空のままでも進めます）。',ex:ex[0]};if(k>1){H['c'+k+'a']={t:'大分類を選びます。選ばなくても進めます。'};H['c'+k+'b']={t:'中分類を選びます（大分類を選ぶと出てきます）。'};H['c'+k+'c']={t:'小分類を選びます（中分類を選ぶと出てきます）。'}}}if(H.memo)H.memo.ex=ex[1]+'　※病名・症状・番号は書かないでください';
 C.reset(D.trees[r]||D.trees.none);
 if(!preDone){preDone=true;var T=D.trees[r]||D.trees.none;if(preP==='nyukai'){for(var a in T)if(T[a]['入会の相談'])C.preset(a,'入会の相談')}else if(preS&&D.sup[preS]){var nm=D.sup[preS].name;for(var a2 in T)if(T[a2][nm]){C.preset(a2,nm);break}}}}
function roleName(){var r=one('role');if(r==='none')return'分からない・近いものがない';var x=D.roles.filter(function(y){return y.id===r})[0];return x?x.name:''}
function firstBig(){var f=C.firsts();return f[0]||'相談'}
function v(id){return document.getElementById(id).value.trim()}
function anon(){return one('anon')==='伏せる'}
function facOn(){var r=one('role');return r==='honnin'||r==='kazoku'}
function facNone(){return/まだどこにも/.test(v('facK'))}
function syncFac(){var on=facOn();document.getElementById('facBox').hidden=!on;document.getElementById('facTtl').textContent=one('role')==='kazoku'?'ご本人がいま通っている・利用している病院や施設':'いま通っている・利用している病院や施設';document.getElementById('facNw').hidden=facNone();document.getElementById('facAw').hidden=facNone();var fn=document.getElementById('facN');fn.disabled=facNo();if(facNo())fn.value=''}
function facNo(){return document.getElementById('facNx').checked}
function facTxt(){return v('facK')+(facNone()?'':'／'+(facNo()?'（名前は分からない）':v('facN'))+(v('facA')?'（'+v('facA')+'）':''))}
function rows(){var cr=C.rows();return [['立場',roleName()]].concat(facOn()?[['通っている病院・施設',facTxt()]]:[]).concat(cr.length?cr:[['相談の内容','（選択なし）']]).concat([['時期',v('when')],['都道府県',v('pref')],['希望する対応',v('want')],['そのほか伝えたいこと',v('memo')],['お名前の扱い',anon()?'伏せて相談':'伝えて相談'],['お名前',anon()?'（伏せる）':v('nm')],['事業所名',anon()?'（伏せる）':v('co')],['メール',v('mail')],['電話',v('tel')]])}
function build6(){document.getElementById('sum').innerHTML=rows().map(function(r){return '<div><dt>'+r[0]+'</dt><dd style="white-space:pre-line">'+(r[1]?esc(r[1]):'<span class="fine">未入力</span>')+'</dd></div>'}).join('')}
function syncAnon(){var a=anon();document.getElementById('nmwrap').hidden=a;document.getElementById('cowrap').hidden=a}
f.addEventListener('change',function(e){if(e.target.name==='anon')syncAnon();if(e.target.id==='facK'||e.target.id==='facNx')syncFac()});
var memo=document.getElementById('memo');memo.addEventListener('input',function(){document.getElementById('cnt').textContent=memo.value.length+' / 1,000文字';document.getElementById('sens').hidden=!SENS.test(memo.value)});
function show(){secs.forEach(function(s,i){s.hidden=i!==st});lis.forEach(function(l,i){l.className=i<st?'done':i===st?'on':''});
 document.getElementById('stepnow').textContent='全4段階のうち '+(st+1)+' 段階め（'+L[st]+'）';
 document.getElementById('back').style.visibility=st?'visible':'hidden';document.getElementById('next').hidden=st===3;err.hidden=true;
 if(st===1){ensureTree();syncFac()}if(st===2)syncAnon();if(st===3)build6();
 var t=document.getElementById('steps').getBoundingClientRect().top;if(t<0)window.scrollBy(0,t-140)}
function need(m){err.textContent=m;err.hidden=false;return false}
function ok(){if(st===0&&!one('role'))return need('立場を1つ選んでから、「次へ進む」を押してください。');
 if(st===1&&facOn()){if(!v('facK')){need('通っている病院・施設の種類を選んでください（まだ決まっていない場合は、いちばん下を選びます）。');document.getElementById('facK').focus();return false}if(!facNone()&&!facNo()&&!v('facN')){need('通っている病院・施設の名前を入れてください。分からない場合は「名前が分からない」に印を付けてください。');document.getElementById('facN').focus();return false}}
 if(st===1){var cc=C.check();if(cc){need(cc[0]);try{cc[1].focus()}catch(x){}return false}
  var its=C.items(),alltxt=v('memo')+its.map(function(x){return x.d}).join(' ');
  if(SENS.test(alltxt))return need('病気や体の状態、番号などの情報が含まれている可能性があります。その部分を消してから進んでください。')}
 if(st===2){var m=v('mail');if(!anon()&&!v('nm'))return need('お名前を入力してください。名前を伏せる場合は「名前・事業所名を伏せて相談」を選んでください。');if(!m)return need('返信先のメールアドレスを入力してください。');if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m))return need('メールアドレスの形をご確認ください（例：name@example.jp）。');if(!document.getElementById('agree').checked)return need('個人情報の取り扱いを読み、同意の欄に印を付けてください。')}return true}
document.getElementById('next').addEventListener('click',function(){if(ok()){st++;show()}});
document.getElementById('back').addEventListener('click',function(){if(st>0){st--;show()}});
function txt(){return '【'+D.site+' 受付内容】\n'+rows().map(function(r){return r[0]+'：'+(r[1]||'未入力')}).join('\n')}
function receipt(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')},a=new Uint8Array(3);crypto.getRandomValues(a);return 'IK-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+Array.prototype.map.call(a,function(x){return(x%36).toString(36)}).join('').toUpperCase()}
f.addEventListener('submit',function(e){e.preventDefault();if(sending||st!==3)return;
 if(document.getElementById('hpf').value){need('送信できませんでした。メールでご連絡ください。');return}
 sending=true;var b=document.getElementById('send');b.disabled=true;b.textContent='送信しています…';
 var rec={no:receipt(),ts:new Date().toISOString(),entry:D.site,name:anon()?'（名前を伏せた相談）':v('nm'),company:anon()?'':v('co'),email:v('mail'),tel:v('tel')||'（未入力）',cat:'medical',method:'メール',body:txt(),agree:true,share:false,status:'新規受付',memo:'',fields:(C.mids().length?C.mids():['その他・まだ分からない']).map(function(m){return D.supNames.indexOf(m)>=0?m:'その他・まだ分からない'}).filter(function(x,i,a){return a.indexOf(x)===i}),purpose:firstBig(),role:roleName()};
 fetch(D.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({kind:'inbox'},rec,{elapsed:Date.now()-t0,catLabel:D.site+'：'+roleName()+'／'+firstBig()}))})
 .then(function(r){return r.json()}).then(function(j){if(!j||j.ok!==true)throw new Error('not_saved');
  f.hidden=true;document.getElementById('steps').hidden=true;var d=document.getElementById('done');d.hidden=false;
  d.innerHTML='<div class="done-box" role="status"><b>受け付けました</b><p>受付番号：'+esc(j.no||rec.no)+'</p><p>'+esc('受付後、原則として3営業日以内に、ご入力のメールアドレスへご返信します。')+'</p><p class="fine">返信が届かない場合は、迷惑メールのフォルダをご確認のうえ、'+esc(D.mail)+' までご連絡ください。</p></div>';
  window.scrollTo(0,d.getBoundingClientRect().top+scrollY-140)})
 .catch(function(){sending=false;b.disabled=false;b.textContent='この内容で送信する';need('送信できませんでした。時間をおいてもう一度お試しいただくか、「内容を写し取る」で内容をコピーし、'+D.mail+' へメールでお送りください。')})});
document.getElementById('copy').addEventListener('click',function(){var m=document.getElementById('copyMsg');
 function fb(){var r=document.createRange();r.selectNodeContents(document.getElementById('sum'));var s=getSelection();s.removeAllRanges();s.addRange(r);m.textContent='内容を選択しました。コピーしてお使いください。'}
 try{navigator.clipboard.writeText(txt()).then(function(){m.textContent='写し取りました（コピーしました）。'},fb)}catch(e){fb()}});
if(preR){st=1}show();
})();</script>"""
    page("contact/index.html", "相談を送る", "医療介護総合支援会のウェブ総合受付。立場を選び、相談の内容を大分類・中分類・小分類から選ぶだけで送れます。名前を伏せた相談もできます。",
         "<main id=\"main\">" + body + "</main>", cur="", extra_js=js)

def build_404():
    body = ph("ページが見つかりません", "お探しのページは、移動または削除された可能性があります。", [("ページが見つかりません", None)], "head-5.jpg", "search") + '''
<section class="sec"><div class="wrap" style="max-width:900px"><div class="btns"><a class="btn btn-g" href="{p}index.html">トップへ戻る</a><a class="btn btn-o" href="{p}support/index.html">支援メニュー</a><a class="btn btn-o" href="{p}contact/index.html">相談を送る</a></div></div></section>'''
    # 404は配置場所が深さ0（medical/404.html）。GitHub Pagesはリポジトリ直下の404を使うため、ここは案内用。
    page("404.html", "ページが見つかりません", "お探しのページは見つかりませんでした。移動または削除された可能性があります。医療介護総合支援会のトップ、支援メニュー、ウェブ受付からお探しください。", "<main id=\"main\">" + body + "</main>")
    # 絶対パスに置き換え（どの深さで表示されても動くように）
    pth = os.path.join(OUT, "404.html"); s = open(pth, encoding="utf-8").read()
    s = s.replace('href="index.html', f'href="{SITE["base"]}index.html').replace('href="assets/', f'href="{SITE["base"]}assets/').replace('src="assets/', f'src="{SITE["base"]}assets/')
    for d in ["about/", "roles/", "support/", "flow/", "faq/", "company/", "status/", "kyoryoku/", "soudan/", "contact/", "privacy/", "terms/"]:
        s = s.replace(f'href="{d}', f'href="{SITE["base"]}{d}')
    s = s.replace('<meta name="description"', '<meta name="robots" content="noindex"><meta name="description"')
    open(pth, "w", encoding="utf-8").write(s)

def build_sitemap():
    urls = [SITE["base"] + (p[:-10] if p.endswith("index.html") else p) for p in PAGES if p != "404.html"]
    x = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"<url><loc>{u}</loc><lastmod>2026-11-12</lastmod></url>\n" for u in urls) + "</urlset>\n"
    open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8").write(x)

if __name__ == "__main__":
    import json as _j
    _gy = _j.load(open("/home/claude/gyakutai/gyakutai.json", encoding="utf-8"))
    os.makedirs(OUT + "/assets", exist_ok=True)
    shutil.copy(os.path.join(os.path.dirname(os.path.abspath(__file__)), "guide.js"), OUT + "/assets/guide.js")
    open(OUT + "/assets/gyakutai.js", "w", encoding="utf-8").write("window.GYAKUTAI=" + _j.dumps(_gy, ensure_ascii=False, separators=(",", ":")) + ";\n")
    CSS = load_css()
    for d in os.listdir(OUT):
        if d != "assets":
            pth = os.path.join(OUT, d)
            shutil.rmtree(pth) if os.path.isdir(pth) else os.remove(pth)
    build_top(); build_about(); build_roles(); build_support(); build_status(); build_member(); build_kiyaku(); build_tokushoho(); build_apply(); build_flow(); build_faq()
    build_kyoryoku(); build_soudan(); build_company(); build_legal(); build_contact(); build_404(); build_sitemap()
    # Xサーバー用：404ページの住所の基準、.htaccess、robots.txt
    _p404 = os.path.join(OUT, "404.html")
    if os.path.exists(_p404):
        t = open(_p404, encoding="utf-8").read()
        if '<base href="/">' not in t:
            open(_p404, "w", encoding="utf-8").write(t.replace("<head>", '<head><base href="/">', 1))
    open(os.path.join(OUT, ".htaccess"), "w", encoding="utf-8").write("""RewriteEngine On
RewriteCond %{HTTPS} !on
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
RewriteCond %{HTTP_HOST} ^www\\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
ErrorDocument 404 /404.html
DirectoryIndex index.html
AddType video/mp4 .mp4
AddType video/webm .webm
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/jpeg "access plus 30 days"
ExpiresByType image/png "access plus 30 days"
ExpiresByType image/svg+xml "access plus 30 days"
ExpiresByType video/mp4 "access plus 30 days"
ExpiresByType text/css "access plus 1 day"
ExpiresByType application/javascript "access plus 1 hour"
ExpiresByType text/html "access plus 0 seconds"
</IfModule>
""")
    open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8").write("User-agent: *\nDisallow: /keiyaku/\nSitemap: " + SITE["base"] + "sitemap.xml\n")
    print(len(PAGES), "pages")
    import make_keiyaku  # 電子契約（/keiyaku/）と Apps Script 一式

# 古い見た目や動きが残らないよう、使い方ガイドに版番号を付ける
import hashlib as _hl
_gv = _hl.md5(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "guide.js"), "rb").read()).hexdigest()[:8]
for _root, _d, _fs in os.walk(OUT):
    for _f in _fs:
        if _f.endswith(".html"):
            _p = os.path.join(_root, _f); _s = open(_p, encoding="utf-8").read()
            if 'assets/guide.js"' in _s:
                open(_p, "w", encoding="utf-8").write(_s.replace('assets/guide.js"', 'assets/guide.js?v=' + _gv + '"'))
