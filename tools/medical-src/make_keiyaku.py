# -*- coding: utf-8 -*-
"""医療介護総合支援会の電子契約（/medical/keiyaku/）と Apps Script 一式を作る"""
import json, os, re, shutil
from keiyaku_text import KIYAKU, KOJIN_KIYAKU, NDA, TEIKEI
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.environ.get("MED_OUT", "/home/claude/glove-site/sites/119cm.net"), "keiyaku")
GAS = os.path.join(HERE, "gas")
os.makedirs(OUT, exist_ok=True); os.makedirs(GAS, exist_ok=True)
CORE = open(os.path.join(HERE, "keiyaku_core.js"), encoding="utf-8").read()
from data import SUP as _SUP
FIELD_LIST = [v["name"] for v in _SUP.values()] + ["その他・まだ分からない", "提携・協業の申し込み", "要望・ご意見", "会員登録（事業所会員）", "会員登録（法人会員）", "会員登録（協賛会員）", "会員登録（個人会員（営業協力者））"]
TEXTS = "var CASE_SEGS = " + json.dumps(__import__("data").CASE_SEGS, ensure_ascii=False) + ";\n" + "var FIELD_LIST = " + json.dumps(FIELD_LIST, ensure_ascii=False) + ";\n" + "var ROUTE_AUTO = " + json.dumps({v["name"]: list(__import__("data").ROUTE_AUTO[k]) for k, v in _SUP.items()}, ensure_ascii=False) + ";\n" + "var KIYAKU_TEXT = %s;\nvar KOJIN_TEXT = %s;\nvar NDA_TEXT = %s;\nvar TEIKEI_TEXT = %s;\n" % tuple(json.dumps(x, ensure_ascii=False) for x in (KIYAKU, KOJIN_KIYAKU, NDA, TEIKEI))
TEL, TELR, HRS = "0120-933-496", "0120933496", "10:00〜19:00"

# ---------- CSS（家じまいの電子契約と同じ作り。色だけ支援会の深い青緑へ） ----------
css = open(os.path.join(HERE, "keiyaku_base.css"), encoding="utf-8").read()  # 家じまいの電子契約の見た目（2026/10時点の写し）
for a, b in {"#1D4A3D": "#0E5A63", "#163A30": "#0B4A52", "#E6EEE8": "#E3F0F0", "#F8F8F4": "#F6F8F7", "#16201B": "#14211F", "#3B4740": "#3A4A48", "#C9D2CB": "#C6D4D3",
             "#101714": "#0E1718", "#17201C": "#152022", "#EEF3EF": "#EEF4F4", "#C2CEC6": "#BFD0D0", "#34443B": "#32464A", "#7FB89F": "#86C7C9", "#9CCBB5": "#A6DADB", "#1E2B25": "#16292B", "#0E1A15": "#081F22"}.items():
    css = re.sub(re.escape(a), b, css, flags=re.I)
css = css.replace("input[type=date],","input[type=date],input[type=number],input[type=month],")
css += """
[hidden]{display:none!important}
.tabs{display:flex;gap:8px;margin:0 0 16px;flex-wrap:wrap}.tab{min-height:50px;padding:0 20px;border-radius:12px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:700;cursor:pointer}
.tab.on{border-color:var(--pine);background:var(--pine);color:var(--on-pine)}.cnt{display:inline-block;margin-left:8px;min-width:24px;padding:0 7px;border-radius:12px;background:#B3261E;color:#fff;font-size:.85rem}
.filters{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:14px}.filters label{display:flex;gap:8px;align-items:center;font-weight:700}.filters select,.filters input{min-height:44px;width:auto}
.todo{border:3px solid var(--pine)}.todo-h{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin-bottom:6px}.todo-h h2{margin:0}.todo-h .small-btn{margin-left:auto}
.todo-l{margin:8px 0 0;padding-left:0;list-style:none;counter-reset:t}.todo-l li{counter-increment:t;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--line)}
.todo-l li:before{content:counter(t);flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--pine);color:#fff;font-weight:700}.todo-l li.red:before{background:#B3261E}.todo-l li.ok:before{content:"✓";background:#2E7D4F}
.todo-l li span{flex:1 1 260px}.todo-l li small{display:block;color:var(--muted);font-size:.88rem}.todo-l li button{min-height:44px}
.howto{border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:0 16px;margin-bottom:14px}.howto summary{min-height:48px;display:flex;align-items:center;font-weight:700;cursor:pointer;color:var(--pine)}.howto summary:before{content:"？";display:grid;place-items:center;width:26px;height:26px;margin-right:8px;border-radius:50%;background:var(--pine);color:#fff;font-size:.9rem}
.howto ol{padding-left:22px;margin:0 0 12px;line-height:1.8}.howto table{margin-bottom:10px}
.tour-ov{position:fixed;inset:0;z-index:80}.tour-hl{position:fixed;z-index:81;border-radius:12px;box-shadow:0 0 0 4px #C99A45,0 0 0 9999px rgba(0,0,0,.55);transition:all .25s;pointer-events:none}
.tour-tx{position:fixed;z-index:82;width:min(380px,calc(100% - 24px));background:var(--surface);color:var(--ink);border-radius:14px;padding:16px 18px;box-shadow:0 8px 30px rgba(0,0,0,.35);line-height:1.7}
.tour-tx b{display:block;font-size:1.08rem;margin-bottom:4px}.tour-tx .tn{color:var(--muted);font-size:.85rem}.tour-tx .bt{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.tour-tx .bt button{min-height:44px}
.flash{outline:4px solid #C99A45;outline-offset:3px;border-radius:12px}
body.adm main{max-width:1280px}.ctbl td:nth-child(1),.ctbl td:nth-child(2){white-space:nowrap}.vt-sw{display:inline-flex;gap:0;margin-left:auto}.vt-sw .small-btn{border-radius:0}.vt-sw .small-btn:first-child{border-radius:10px 0 0 10px}.vt-sw .small-btn:last-child{border-radius:0 10px 10px 0}.vt-sw .small-btn.on,.seg-b.on{background:var(--pine);color:#fff;border-color:var(--pine)}
.ctbl{width:100%;border-collapse:collapse;font-size:.95rem}.ctbl th{background:var(--pine-soft);text-align:left;padding:8px 10px;font-size:.85rem;white-space:nowrap}.ctbl td{padding:9px 10px;border-top:1px solid var(--line);vertical-align:top}
.ctbl tr.cr{cursor:pointer}.ctbl tr.cr td{border-top:2px solid var(--line)}.ctbl tr.cr.z td{background:#F6F9F9}.ctbl tr.cr:hover td{background:#F4F8F8}.ctbl tr.cr.open td{background:var(--pine-soft)}.ctbl tr.cr.new td:first-child{box-shadow:inset 5px 0 0 #B3261E}.ctbl tr.cd td{background:#FAFCFC;padding:10px}
.ctbl .sm{display:block;color:var(--muted);font-size:.82rem;margin-top:2px}.st{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.82rem;font-weight:700;background:var(--pine-soft);color:var(--pine);white-space:nowrap}.st.s0{background:#B3261E;color:#fff}.st.s5,.st.s6{background:#E8E8E8;color:#555}
.kd{display:inline-block;padding:1px 7px;border-radius:6px;font-size:.78rem;font-weight:700;background:#E7F1FB;color:#163d6b;margin-bottom:3px}.kd.k2{background:#F5ECD9;color:#6b4a0c}.kd.k3{background:#EDE7F6;color:#4527a0}.kd.k4{background:#E3F2E9;color:#1e5b34}
.seg{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}.seg-b{min-height:48px;padding:0 18px;border-radius:12px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:700;cursor:pointer}
.segbar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.segbar button{min-height:44px;padding:4px 12px;border-radius:10px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:.92rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.segbar button.on{border-color:var(--pine);background:var(--pine);color:#fff}.segbar button.zero{opacity:.55}.segbar button i{font-style:normal;background:#B3261E;color:#fff;border-radius:999px;padding:0 7px;font-size:.78rem}.segbar button b{font-weight:400;font-size:.82rem}.segbar .gap{width:100%;height:0}.seg-note{margin:0 0 12px;padding:10px 14px;border-left:4px solid var(--pine);background:var(--pine-soft);border-radius:6px;font-size:.92rem}.self-pt{margin:4px 0 0;padding:10px 12px;border:1px dashed var(--line);border-radius:8px;background:#F6F9F9}.kd.k5{background:#FDE7E7;color:#8a1c1c}.kd.k6{background:#E0F2F1;color:#0b5149}.kd.k7{background:#FFF3D6;color:#6b4a0c}
.ctbl tr.cd td{white-space:normal}.fac-box{margin:12px 0;padding:12px 14px;border:2px solid #E3D3A8;border-radius:10px;background:#FFFBF0}.fac-box>label{font-weight:700}.fac-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px 12px;margin-top:8px}.fac-g>div{min-width:0}.fac-g small{display:block;color:var(--muted);font-size:.8rem;margin-bottom:2px}.fac-g select,.fac-g input{width:100%}.fac-box[data-m="会員の病院・施設"] .fc-non,.fac-box[data-m="未確認"] .fc-non{display:none}.fac-box:not([data-m="会員の病院・施設"]) .fc-mem{display:none}
.req{color:#B3261E;font-weight:700;font-size:.85em}.pf-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px 16px}.pf-g>div{min-width:0}.pf-g label{display:block;font-weight:700;font-size:.92rem;margin-bottom:4px}.pf-g input,.pf-g select{width:100%}.pf-g .wide{grid-column:1/-1}.fw-inc{border:1px solid var(--line);border-radius:8px;padding:8px 14px 10px;margin:0 0 12px;display:flex;flex-wrap:wrap;gap:6px 20px}.fw-inc legend{font-weight:700;font-size:.9rem;padding:0 4px}.fw-inc label{display:flex;gap:6px;align-items:center}.fw-ok{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border:2px solid #B3261E;border-radius:10px;background:#FFF5F4;margin:10px 0;cursor:pointer}.fw-ok input,.fw-st input{width:22px;height:22px;flex:none;margin-top:2px}.fw-st{display:flex;gap:10px;align-items:center;margin:0 0 8px;cursor:pointer}.small-btn.fw-b{border-color:var(--pine);background:var(--pine);color:#fff}
.adm-top{display:flex;justify-content:flex-end;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 10px}.actor{display:inline-flex;align-items:center;gap:8px;font-weight:700}.actor select{min-height:44px}.actor.need select{border:2px solid #B3261E;background:#FFF5F4}.lgt td{vertical-align:top}.lgt .sm{display:block;color:var(--muted);font-size:.82rem}.lg-pre{white-space:pre-wrap;font:inherit;font-size:.88rem;margin:6px 0 0;color:var(--ink)}.lnk{background:none;border:0;padding:0;color:var(--pine);text-decoration:underline;font:inherit;cursor:pointer}.hist details summary{cursor:pointer}
.fb-l{flex-basis:100%;padding:8px 12px;border-radius:8px;font-size:.92rem}.fb-l.ok{background:#E3F2E9;color:#1e5b34}.fb-l.fix{background:#FFF3D6;color:#6b4a0c}.ct-box{margin:12px 0;padding:10px 14px;border:1px solid var(--line);border-radius:10px;background:#F7FAFA}.ct-box>b{display:block;margin-bottom:4px}.ct-l{list-style:none;margin:0;padding:0}.ct-l li{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;padding:6px 0;border-top:1px dashed var(--line)}.ct-l li:first-child{border-top:0}.ct-st{display:inline-block;padding:1px 9px;border-radius:999px;font-size:.82rem;font-weight:700;background:#EDE7F6;color:#4527a0}.ct-st.dr{background:#FFF3D6;color:#6b4a0c}.ct-st.ok{background:#E3F2E9;color:#1e5b34}.ct-st.no{background:#eee;color:#666}.case-ln{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.fb-box{margin-top:18px;padding:18px 20px;border:2px solid var(--pine);border-radius:12px;background:var(--pine-soft)}.fb-box .btns{display:flex;flex-wrap:wrap;gap:10px}
body.role-staff .adm-only{display:none!important}.me-badge{display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:6px 12px;border-radius:999px;background:var(--pine-soft)}.st-wait{display:inline-block;padding:1px 8px;border-radius:999px;font-size:.8rem;font-weight:700;background:#FFF3D6;color:#6b4a0c}.st-mine{display:inline-block;padding:1px 8px;border-radius:999px;font-size:.8rem;font-weight:700;background:#E3F2E9;color:#1e5b34}
.roster{display:grid;grid-template-columns:260px 1fr;gap:16px}@media (max-width:860px){.roster{grid-template-columns:1fr}}
.r-tree{border:1px solid var(--line);border-radius:12px;padding:10px;max-height:70vh;overflow:auto;background:var(--surface)}.r-tree h4{margin:10px 6px 4px;font-size:.85rem;color:var(--muted)}.r-tree button{display:flex;justify-content:space-between;gap:8px;width:100%;text-align:left;min-height:38px;padding:6px 10px;border:0;border-radius:8px;background:none;color:var(--ink);font:inherit;cursor:pointer}.r-tree button:hover{background:var(--pine-soft)}.r-tree button.on{background:var(--pine);color:#fff}.r-tree button b{font-weight:700}.r-tree .l2{padding-left:22px;font-size:.92rem}.r-tree .l3{padding-left:36px;font-size:.88rem}
.pt-box{margin-top:10px}.pt-box>label{display:block;font-size:.85rem;color:var(--muted);margin-bottom:4px}.pt-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.pt-g select{min-height:44px;font-size:.95rem}.pt-box input{margin-top:8px;min-height:44px}
@media (max-width:760px){.pt-g{grid-template-columns:1fr 1fr}}
.chip{display:inline-flex;align-items:center;gap:6px;margin:0 8px 8px 0;padding:6px 6px 6px 12px;border-radius:999px;background:var(--pine-soft);color:var(--pine);font-weight:700}.chip button{width:28px;height:28px;border-radius:50%;border:0;background:#fff;color:var(--ink);cursor:pointer;font-weight:700}
.ptab input,.ptab select{min-height:42px;width:100%;font-size:.95rem}.ptab td{padding:6px}.ptab td:first-child{min-width:200px}.ptab .small-btn{white-space:nowrap}
.memo2{display:flex;gap:8px;flex:1;min-width:260px}.memo2 select{min-height:44px;width:auto}.memo2 input{flex:1;min-width:140px;min-height:44px}
.alertbar{background:#FBEBEB;color:#7a1712;border:2px solid #B3261E;border-radius:12px;padding:12px 16px;margin-bottom:14px;font-weight:700}
.sum{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.sum button{min-height:56px;padding:6px 14px;border-radius:12px;border:2px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;cursor:pointer;text-align:left}.sum button b{display:block;font-size:1.3rem}.sum button.red{border-color:#B3261E;color:#B3261E}
.bar{display:flex;gap:3px;margin:8px 0}.bar i{flex:1;height:8px;border-radius:4px;background:var(--line)}.bar i.on{background:var(--pine)}.bar.stop i.on{background:#888}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.tg{display:inline-block;border-radius:6px;padding:1px 8px;font-size:.85rem;font-weight:700;background:var(--pine-soft);color:var(--pine)}.tg.red{background:#B3261E;color:#fff}.tg.yel{background:#F5ECD9;color:#6b4a0c}.tg.pt{background:#E7F1FB;color:#163d6b}
.age{font-weight:700}.age.y{color:#8A621C}.age.r{color:#B3261E}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:8px}.grid2 label{font-size:.85rem;color:var(--muted);display:block}.grid2 input,.grid2 select{min-height:44px;font-size:1rem}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;padding:16px;z-index:50}.modal-in{background:var(--surface);border-radius:16px;padding:22px;max-width:720px;width:100%;max-height:92vh;overflow:auto}
.filters label{white-space:nowrap}
@media (max-width:640px){.filters label{width:100%;white-space:normal}.filters select,.filters input{flex:1;min-width:0}.grid2{grid-template-columns:1fr 1fr}.ib-h{display:block}.ib-a input{min-width:0;flex-basis:100%}.tabs .small-btn{margin-left:0!important}}
.hist{font-size:.88rem;color:var(--muted);margin:6px 0 0;padding-left:18px}
.ib{border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:12px;background:var(--surface)}.ib.new{border-left:6px solid #B3261E}.ib.doing{border-left:6px solid var(--gold-bright)}.ib.done{opacity:.75}
.ib-h{display:flex;gap:10px;flex-wrap:wrap;align-items:baseline;justify-content:space-between}.ib-h b{font-size:1.05rem}.ib-m{font-size:.9rem;color:var(--muted)}
.ib details{margin:8px 0}.ib pre{white-space:pre-wrap;font-family:var(--f-body);font-size:.95rem;background:var(--bg);border-radius:8px;padding:10px 12px;margin:6px 0 0}
.ib-a{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}.ib-a select{width:auto;min-height:44px}.ib-a input{flex:1;min-width:180px;min-height:44px}
.brand svg{width:40px;height:40px}.brand svg .ac{color:var(--gold-bright);stroke:var(--gold-bright)}
.foot{max-width:880px;margin:0 auto;padding:0 16px 40px;text-align:right;font-size:.82rem;color:var(--muted)}
.otp{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.otp input{max-width:220px;font-size:1.5rem;letter-spacing:.3em;text-align:center}
.shape{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}.shape label{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 16px;border:2px solid var(--line);border-radius:10px;background:var(--surface);cursor:pointer;font-weight:700}
.shape input{width:22px;height:22px}
.blank{background:var(--pine-soft);color:var(--pine);border-radius:4px;padding:0 6px;font-family:var(--f-body);font-size:.9rem;font-weight:700}
.cond{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;padding:16px;border:2px solid var(--line);border-radius:12px;background:var(--bg)}
.cond .fld{margin:0}.fee{grid-column:1/-1;font-weight:700;color:var(--pine);font-size:1.1rem}
.pre{display:grid;gap:10px}.pre .fld{margin:0}
@media (max-width:640px){.items-row{grid-template-columns:1fr 1fr}.tbl table.list thead{display:none}.tbl table.list td{display:block;border:0;padding:4px 8px}.tbl table.list tr{display:block;border-bottom:1px solid var(--line);padding:8px 0}}
"""
import hashlib as _hl
CSSV = _hl.md5(css.encode("utf-8")).hexdigest()[:8]
open(os.path.join(OUT, "keiyaku.css"), "w", encoding="utf-8").write(css)

MARK = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4h7v8.5H28v7h-8.5V28h-7v-8.5H4v-7h8.5z"/><path class="ac" d="M16 23.5s-4-2.4-4-5.2a2.2 2.2 0 0 1 4-1.3 2.2 2.2 0 0 1 4 1.3c0 2.8-4 5.2-4 5.2z"/></svg>'
HEAD = lambda title: f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<title>{title}｜医療介護総合支援会</title>
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=BIZ+UDPMincho:wght@700&display=swap">
<link rel="stylesheet" href="keiyaku.css?v={CSSV}">
</head>
<body>'''
FOOT = '<p class="foot">運営　株式会社グローブ</p>'

# ---------- api.js（通信と、設定前のお試し表示） ----------
API = "/* 電子契約：通信と、設定前のお試し表示（この端末の中だけで動く見本） */\n(function () {\n" + TEXTS + CORE + r'''
  var URL_ = window.KEIYAKU_API_URL || "";
  var DEMO = !URL_ || /[?&]demo=1/.test(location.search);
  window.KEIYAKU_DEMO = DEMO;
  window.KEIYAKU_CORE = { TEMPLATES: TEMPLATES, FIELDS: FIELDS, normCond: normCond, buildBody: buildBody, yen: yen, MEMBER_LABEL: MEMBER_LABEL };
  function real(action, data) {
    var payload = Object.assign({ action: action }, data || {});
    if (action.indexOf("admin.") === 0) { try { payload.adminToken = sessionStorage.getItem("iryo-adm") || ""; } catch (e) { } }
    var body = JSON.stringify(payload);
    return fetch(URL_, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body, redirect: "follow" })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) { var er = new Error(j.error || "うまくいきませんでした"); er.needLogin = !!j.needLogin; if (er.needLogin && window.onNeedLogin) window.onNeedLogin(); throw er; } return j; });
  }
  /* ---- お試し表示 ---- */
  var KEY = "iryo-keiyaku-demo";
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function store(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { } }
  function wait(v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 300); }); }
  function sample() { return { id: "IKK-DEMO-0001", token: "sample", template: "kaiin", title: tplOf("kaiin").title, party_name: "見本 花子", party_company: "見本デイサービス", party_email: "sample@example.jp", status: "送付済み", fields: tplOf("kaiin").fields, required: tplOf("kaiin").required, requireId: false, prefill: { company: "見本デイサービス", name: "見本 花子" }, body: buildBody("kaiin", { type: "jigyosho", pay: "month", staff: 8, founder: true }, "", "見本デイサービス"), draft: "" }; }
  function demo(action, d) {
    d = d || {};
    var list = load();
    if (action === "admin.login") { if (!d.id || !d.pass) return Promise.reject(new Error("IDとパスワードを入れてください")); var me = /^staff|^tanto/i.test(d.id) ? { role: "staff", name: "見本 担当", id: d.id } : { role: "admin", name: "中嶋", id: d.id }; try { sessionStorage.setItem("iryo-demo-me", JSON.stringify(me)); } catch (e) { } return wait({ ok: true, adminToken: "demo", role: me.role, name: me.name }); }
    var ME = (function () { try { return JSON.parse(sessionStorage.getItem("iryo-demo-me") || "null"); } catch (e) { return null; } })() || { role: "admin", name: "中嶋", id: "demo" };
    var DPT = (function () { try { return JSON.parse(localStorage.getItem("iryo-demo-pt") || "null"); } catch (e) { return null; } })();
    function savePt(l) { try { localStorage.setItem("iryo-demo-pt", JSON.stringify(l)); } catch (e) { } return l; }
    var DEMO_PT = [{ name: "見本コンサルティング株式会社", a: "経営・管理の支援", b: "経営コンサルティング", c: "収支改善・コスト削減", note: "初回相談は無料", person: "見本 太郎", email: "consult@example.jp", tel: "06-3333-4444", area: "大阪府・兵庫県", by: "中嶋", state: "登録済み", since: "2026-11-10" }, { name: "見本社労士事務所", a: "経営・管理の支援", b: "士業・専門家", c: "社会保険労務士", note: "", by: "見本 担当", state: "登録済み", since: "2026-11-12" }, { name: "見本人材サービス", a: "人材・採用・教育", b: "採用・人材サービス", c: "有料職業紹介（人材紹介）", note: "相手が記入", by: "見本 担当", state: "確認待ち", since: "2026-11-14" }];
    var PTL = DPT || DEMO_PT;
    if (action === "admin.me") return wait({ ok: true, role: ME.role, name: ME.name, id: ME.id });
    if (ME.role === "staff" && ["admin.me", "admin.passwd", "admin.templates", "admin.preview", "admin.issue", "admin.list", "admin.get", "admin.resend", "admin.cancel", "admin.finalize", "admin.pdf", "admin.partnerAdd", "admin.partnersMine", "admin.partnerInvite"].indexOf(action) < 0) return Promise.reject(new Error("この操作は管理者だけができます"));
    if (action === "admin.passwd") return d.cur ? wait({ ok: true }) : Promise.reject(new Error("いまのパスワードが違います"));
    if (action === "admin.accList" || action === "admin.accSet") { var AC = (function () { try { return JSON.parse(localStorage.getItem("iryo-demo-acc") || "null"); } catch (e) { return null; } })() || [{ name: "見本 担当", id: "staff1", active: true, last: new Date().toISOString() }];
      if (action === "admin.accSet") { if (d.op === "add") AC.push({ name: d.name, id: d.id, active: true, last: "" }); if (d.op === "active") AC.forEach(function (x) { if (x.id === d.id) x.active = !!d.active; }); try { localStorage.setItem("iryo-demo-acc", JSON.stringify(AC)); } catch (e) { } }
      return wait({ ok: true, accounts: AC }); }
    if (action === "admin.partnersMine") return wait({ ok: true, partners: ME.role === "admin" ? PTL : PTL.filter(function (p) { return p.by === ME.name; }) });
    if (action === "admin.partnerAdd") { var r0 = d.row || {}; if (PTL.some(function (p) { return p.name === r0.name; })) return Promise.reject(new Error("「" + r0.name + "」はもう登録されています")); r0.by = ME.name; r0.state = "登録済み"; r0.since = new Date().toISOString().slice(0, 10); PTL.push(r0); savePt(PTL); return wait({ ok: true, partners: PTL.filter(function (p) { return p.by === ME.name; }) }); }
    if (action === "admin.partnerInvite") return wait({ ok: true });
    if (action === "admin.logout") return wait({ ok: true });
    if (action === "admin.forgot") return wait({ ok: true });
    if (action === "admin.reset") return d.code && d.pass ? wait({ ok: true, id: "demo" }) : Promise.reject(new Error("確認コードとパスワードを入れてください"));
    if (action === "admin.templates") return wait({ ok: true, templates: TEMPLATES, fields: FIELDS });
    if (action === "admin.issue") {
      var t = tplOf(d.template), p = d.party || {}; if (t.base) d.cond = Object.assign({}, d.cond || {}, { type: t.mtype });
      if (!p.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email || "")) return Promise.reject(new Error("相手のお名前と、正しいメールアドレスを入れてください"));
      var f = orderFields(t, d.fields);
      var o = { id: "IKK-DEMO-" + (1001 + list.length), token: "demo" + Date.now(), case_no: d.caseNo || "", issuer: ME.name, template: t.base || t.key, title: t.base ? memberTitle(t.mtype) : t.title, party_name: p.name, party_company: p.company || "", party_email: p.email, status: "送付済み", created: new Date().toISOString(), draft: d.draft ? "yes" : "", fields: f, required: t.required, requireId: !!(d.requireId || t.requireId), prefill: d.prefill || {}, body: buildBody(t.key, d.cond, d.note, p.company || p.name), cond: t.cond ? normCond(d.cond) : null, note: d.note || "" };
      if (d.replaces) list.forEach(function (x) { if (x.id === d.replaces) { x.status = "取り消し"; o.prev = x.id; if (!o.case_no) o.case_no = x.case_no || ""; } });
      list.unshift(o); store(list);
      return wait({ ok: true, id: o.id, url: location.href.replace(/admin\.html.*$/, "index.html") + "?t=" + o.token + "&demo=1" });
    }
    if (action === "admin.list") return wait({ ok: true, rows: ME.role === "admin" ? list : list.filter(function (x) { return x.issuer === ME.name; }) });
    if (action === "admin.cases") { var now = Date.now(), dd = function (h) { return new Date(now - h * 36e5).toISOString(); }; var rt = {}; FIELD_LIST.forEach(function (f) { rt[f] = ""; }); rt["経営・業務の改善"] = "見本コンサルティング株式会社"; rt["採用・定着・研修"] = "見本人材サービス、見本社労士事務所";
      return wait({ ok: true, routes: rt, staff: ["中嶋", "見本 担当"], partners: PTL, rows: [
        { no: "IKT-261101-1000TKY", ts: dd(5), label: "医療介護総合支援会：提携・協業の申し込み／提携企業として、会員へサービスを提供したい", name: "見本 三郎", company: "見本エネルギー株式会社", email: "saburo@example.jp", tel: "06-2222-3333", body: "【医療介護総合支援会 提携・協業の申し込み】\n分野 1：固定費の見直し ＞ エネルギー ＞ 電気\n地域 1：近畿 ＞ 大阪府 ＞ 全域", status: "新規受付", memo: "", fields: "提携・協業の申し込み、提携：固定費の見直し", partner: "", staff: "", updated: dd(5), contacted: "", next: "" },
        { no: "IKY-261101-1100YBO", ts: dd(8), label: "医療介護総合支援会：要望・ご意見／ほしい支援・サービスがある", name: "（名前なしの要望）", company: "", email: "", tel: "", body: "【医療介護総合支援会 要望・ご意見】\n内容：夜も受付してほしい", status: "新規受付", memo: "", fields: "要望・ご意見", partner: "", staff: "", updated: dd(8), contacted: "", next: "" },
        { no: "IK-261113-2210HNN", ts: dd(3), label: "医療介護総合支援会：利用者・ご本人／医療・介護サービスのこと", name: "見本 四郎", company: "", email: "shiro@example.jp", tel: "090-0000-1111", body: "【医療介護総合支援会 受付内容】\n立場：利用者・ご本人\n通っている病院・施設：クリニック・診療所／見本内科クリニック（大阪市北区）\n相談の内容 1：医療・介護サービスのこと ＞ 医療・介護サービスを探す ＞ 訪問診療", status: "内容確認中", memo: "", fields: "医療・介護サービスを探す", partner: "", staff: "中嶋", updated: dd(2), contacted: "", next: "", fac: "" },
        { no: "IK-261112-1600KZK", ts: dd(20), label: "医療介護総合支援会：ご家族／介護のこと", name: "見本 五月", company: "", email: "satsuki@example.jp", tel: "", body: "【医療介護総合支援会 受付内容】\n立場：ご家族\n通っている病院・施設：デイサービス・訪問介護などの事業所／見本デイサービス（大阪市淀川区）\n相談の内容 1：介護のこと ＞ 介護の困りごと ＞ 施設入居の相談", status: "新規受付", memo: "", fields: "介護の困りごと", partner: "", staff: "", updated: dd(20), contacted: "", next: "", fac: JSON.stringify({ m: "会員の病院・施設", kind: "デイサービス・訪問介護などの事業所", name: "見本デイサービス", addr: "大阪市淀川区", member: "見本デイサービス", auto: 1 }) },
        { no: "IK-261030-0912ABC", ts: dd(30), label: "医療介護総合支援会：企業・事業者／経営・運営のこと", name: "見本 一郎", company: "見本クリニック", email: "sample@example.jp", tel: "06-0000-0000", body: "【医療介護総合支援会 受付内容】\n立場：企業・事業者\n相談の内容 1：経営・運営のこと ＞ 経営・業務の改善 ＞ 収支を改善したい", status: "新規受付", memo: "", fields: "経営・業務の改善", partner: "見本コンサルティング株式会社", staff: "", updated: dd(30), contacted: "", next: "" },
        { no: "IKM-261029-1530XYZ", ts: dd(50), label: "医療介護総合支援会：会員登録／事業所会員", name: "見本 花子", company: "見本デイサービス", email: "hanako@example.jp", tel: "06-1111-2222", body: "【会員登録の申込み】\n会員の種類：事業所会員", status: "提携先対応中", memo: "電子契約 締結済み", fields: "会員登録（事業所会員）", partner: "", staff: "中嶋", updated: dd(200), contacted: dd(200), next: "" },
        { no: "IK-261020-1010QWE", ts: dd(240), label: "医療介護総合支援会：医療・介護で働く方／採用・定着・研修", name: "見本 次郎", company: "見本訪問看護", email: "jiro@example.jp", tel: "", body: "【受付内容】\n内容：採用・定着・研修", status: "完了", memo: "紹介済み", fields: "採用・定着・研修", partner: "見本人材サービス", staff: "中嶋", updated: dd(100), contacted: dd(100), next: "" }] }); }
    if (action === "admin.partnerSet") return wait({ ok: true, partners: savePt(d.rows) });
    if (action === "admin.log") { var nw = Date.now(), ag = function (h) { return new Date(nw - h * 36e5).toISOString(); }; return wait({ ok: true, rows: [
      { ts: ag(0.2), no: "IK-261113-2210HNN", kind: "更新", text: "状態：内容確認中 → 会員施設の確認\n会員施設の確認：会員の病院・施設（見本内科クリニック）", staff: "中嶋", actor: "中嶋", area: "案件" },
      { ts: ag(1), no: "IKK-DEMO-0001", kind: "入金を確認した（登録完了のメールを送信）", text: "事業所会員 申込書\n見本デイサービス 見本 花子", staff: "", actor: "見本 担当", area: "電子契約" },
      { ts: ag(3), no: "", kind: "提携先の登録・変更", text: "登録：見本コンサルティング株式会社", staff: "", actor: "中嶋", area: "設定" },
      { ts: ag(5), no: "IKT-261101-1000TKY", kind: "受付", text: "医療介護総合支援会：提携・協業の申し込み\n見本エネルギー株式会社 見本 三郎", staff: "", actor: "サイト", area: "受付" },
      { ts: ag(6), no: "", kind: "ログイン", text: "管理画面にログインしました", staff: "", actor: "", area: "ログイン" },
      { ts: ag(30), no: "IKK-DEMO-0001", kind: "相手が承認した（締結）", text: "事業所会員 申込書\n見本デイサービス 見本 花子", staff: "", actor: "相手", area: "電子契約" }] }); }
    if (action === "admin.forward") return wait({ ok: true, fwd: JSON.stringify([{ ts: new Date().toISOString(), name: d.partner }]) });
    if (action === "admin.staffSet") return wait({ ok: true, staff: d.list });
    if (action === "admin.caseSet" || action === "admin.report" || action === "admin.routeSet") return wait({ ok: true, routes: d.rows ? (function () { var o = {}; d.rows.forEach(function (r) { o[r.field] = r.partners; }); return o; })() : null });
    if (action === "admin.history") return wait({ ok: true, rows: [{ ts: new Date().toISOString(), kind: "受付", text: "サイトから受付", staff: "" }] });
    if (action === "client.pinv") return d.t ? wait({ ok: true, name: "見本ケア株式会社 ご担当者様", email: "care@example.jp" }) : Promise.reject(new Error("このリンクは使えません"));
    if (action === "client.pinvSubmit") { var rr = d.row || {}; if (!rr.name || !rr.a || !rr.b) return Promise.reject(new Error("名前と分類を入れてください")); rr.state = "確認待ち"; rr.by = "見本 担当"; PTL.push(rr); savePt(PTL); return wait({ ok: true }); }
    if (action === "client.apply") {
      var kj = d.type === "kojin", tp = tplOf(kj ? "kojin" : "kaiin");
      var oo = { id: "IKK-DEMO-" + (1001 + list.length), token: "demo" + Date.now(), template: tp.key, title: kj ? tp.title : memberTitle(d.type), party_name: d.name, party_company: kj ? "" : d.org, party_email: d.email, status: "送付済み", created: new Date().toISOString(), draft: "", fields: tp.fields.slice(), required: tp.required, requireId: tp.requireId, prefill: kj ? { name: d.name, address: d.address, phone: d.phone } : { company: d.org, address: d.address, rep: d.rep, name: d.name, phone: d.phone }, body: buildBody(tp.key, kj ? null : { type: d.type, pay: d.pay, sites: d.sites, staff: d.staff, referrer: d.referrer, founder: true }, "", kj ? d.name : d.org) };
      list.unshift(oo); store(list); return wait({ ok: true, token: oo.token });
    }
    if (action === "admin.resend") return wait({ ok: true });
    if (action === "admin.stop") { list.forEach(function (x) { if (x.id === d.id) x.stopped = new Date().toISOString(); }); store(list); return wait({ ok: true }); }
    if (action === "admin.paid") { list.forEach(function (x) { if (x.id === d.id) x.paid = new Date().toISOString(); }); store(list); return wait({ ok: true }); }
    if (action === "admin.get") { var g0 = list.filter(function (x) { return x.id === d.id; })[0]; if (!g0) return Promise.reject(new Error("見つかりません")); return wait({ ok: true, contract: { id: g0.id, template: g0.template, title: g0.title, draft: g0.draft === "yes", status: g0.status, party: { name: g0.party_name, company: g0.party_company, email: g0.party_email }, cond: g0.cond || null, note: g0.note || "", fields: g0.fields || [], prefill: g0.prefill || {}, requireId: !!g0.requireId, case_no: g0.case_no || "", feedback: g0.feedback || null } }); }
    if (action === "admin.finalize") { list.forEach(function (x) { if (x.id === d.id) { x.draft = ""; x.viewed = ""; x.status = "送付済み"; } }); store(list); return wait({ ok: true }); }
    if (action === "admin.cancel") { list.forEach(function (x) { if (x.id === d.id) x.status = "取り消し"; }); store(list); return wait({ ok: true }); }
    if (action === "admin.pdf" || action === "client.pdf") return Promise.reject(new Error("お試し表示では、契約書のPDFは作られません"));
    var c = list.filter(function (x) { return x.token === d.token; })[0] || sample();
    if (c.status === "取り消し") return Promise.reject(new Error("この契約書は取り消されました。"));
    if (action === "client.otp") return wait({ ok: true, demoCode: "123456" });
    if (action === "client.verify") return String(d.code) === "123456" ? wait({ ok: true, sess: "demo" }) : Promise.reject(new Error("認証コードが違います（お試し表示では 123456 です）。"));
    if (action === "client.get") {
      var t2 = tplOf(c.template) || tplOf("kaiin");
      if (d.sess !== "demo") return wait({ ok: true, needOtp: true, contract: { id: c.id, title: c.title, party_name: c.party_name, party_company: c.party_company, email: c.party_email.split("@")[0].slice(0, 2) + "***@" + c.party_email.split("@")[1], issuer: ISSUER } });
      return wait({ ok: true, contract: { id: c.id, title: c.title, status: c.status, draft: c.draft === "yes", feedback: c.feedback || null, party_name: c.party_name, party_company: c.party_company, body: c.body, fields: c.fields.map(function (k) { return { key: k, label: fieldLabel(t2, k), type: FIELDS[k].type, ac: FIELDS[k].ac || "", required: c.required.indexOf(k) >= 0, value: (c.prefill || {})[k] || "" }; }), requireId: !!c.requireId, adult: !!t2.adult, seal: t2.seal, issuer: ISSUER, signed: c.status === "締結済み" } });
    }
    if (action === "client.feedback") { if (d.res === "fix" && !String(d.comment || "").trim()) return Promise.reject(new Error("直してほしいところを書いてください")); var fb = { res: d.res, comment: d.comment || "", ts: new Date().toISOString() }; list.forEach(function (x) { if (x.token === d.token) { x.feedback = fb; x.viewed = x.viewed || fb.ts; } }); store(list); return wait({ ok: true, feedback: fb }); }
    if (action === "client.sign") { list.forEach(function (x) { if (x.token === d.token) { x.status = "締結済み"; x.signed = new Date().toISOString(); } }); store(list); return wait({ ok: true, demo: true }); }
    return Promise.reject(new Error("不明な操作です"));
  }
  window.keiyakuApi = function (action, data) { return DEMO ? demo(action, data) : real(action, data); };
})();
'''
open(os.path.join(OUT, "api.js"), "w", encoding="utf-8").write(API)
shutil.copy(os.path.join(HERE, "keiyaku_config.js"), os.path.join(OUT, "config.js"))  # URLはここ（medical-src/keiyaku_config.js）で設定

# ---------- お客様の画面 ----------
CLIENT = HEAD("電子契約") + f'''
<div class="demo" id="demoBar" hidden>お試し表示です（入力した内容は送信されません。認証コードは 123456）</div>
<header class="top"><div class="in">
<a class="brand" href="../index.html">{MARK}<span><b>医療介護総合支援会</b><small>電子契約</small></span></a>
<a class="tel" href="tel:{TELR}">分からないときは <b>{TEL}</b> <small>受付 {HRS}</small></a>
</div></header>
<main>
<div id="loading" class="card">契約書を読み込んでいます…</div>
<div id="fail" class="card" hidden><h2>契約書を開けませんでした</h2><p id="failMsg"></p><p>お手数ですが、<a href="tel:{TELR}">{TEL}</a>（受付 {HRS}）までお電話ください。</p></div>

<section class="card" id="otpBox" hidden>
<p class="hint" id="toLine0"></p>
<h1 id="title0"></h1>
<h2>はじめに、ご本人の確認をします</h2>
<p id="otpLead">このメールアドレスに、6けたの認証コードをお送りします。<br><b id="mailMask"></b></p>
<div class="btns" style="margin-top:6px" id="sendRow"><button class="btn" type="button" id="sendOtp">認証コードを送る</button></div>
<div id="otpIn" hidden style="margin-top:20px">
<div class="fld"><label for="code">届いた認証コード（6けたの数字）</label><div class="otp"><input type="text" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*"><button class="btn" type="button" id="doVerify">確認する</button></div></div>
<p class="hint">届かないときは、迷惑メールのフォルダもご確認ください。<button type="button" class="small-btn" id="resend">もう一度送る</button></p>
</div>
<p class="err" id="errO" role="alert"></p>
</section>

<div id="app" hidden>
<p class="hint" id="toLine"></p>
<h1 id="title"></h1>
<p class="hint">契約番号　<span id="cid"></span></p>
<ol class="steps" id="steps"><li><b>1</b>確認</li><li><b>2</b>記入</li><li><b>3</b>押印・承認</li><li><b>4</b>完了</li></ol>

<section class="card" data-s="0">
<h2>契約書の内容をご確認ください</h2>
<p class="hint">枠の中を、最後までお読みください。枠の中は上下に動かせます。<span id="blankHint"><span class="blank">記入欄</span>は、次の画面でご記入いただきます。</span></p>
<div class="doc" id="doc" tabindex="0"></div>
<p class="note" id="draftNote" hidden>この書面は「下書き（確認用）」です。まだ締結はできません。内容をご確認のうえ、下のボタンからお返事ください。「この内容で進めてよい」とお返事いただくと、<b>同じ内容の正式な契約書</b>を、このメールアドレスにお送りします。</p>
<div id="fbBox" class="fb-box" hidden><h3 style="margin:0 0 6px">内容はいかがでしたか？</h3><p class="hint" style="margin:0 0 12px">お返事は担当者に届きます。お電話（0120-933-496）でも承ります。</p>
<div class="btns"><button class="btn" type="button" id="fbOk">この内容で進めてよい</button><button class="btn o" type="button" id="fbFixB">直してほしいところがある</button></div>
<div id="fbFix" hidden style="margin-top:14px"><div class="fld"><label for="fbC">直してほしいところ <span class="req">※必須</span></label><textarea id="fbC" maxlength="2000" placeholder="例：第3条の支払日を15日にしてほしい"></textarea></div><button class="btn" type="button" id="fbSend">この内容で伝える</button></div>
<p class="note" id="fbDone" hidden style="margin-top:14px"></p><p class="err" id="errFb" role="alert"></p></div>
<div class="btns"><button class="btn" type="button" id="toFill">内容を確認しました。次へ</button></div>
</section>

<section class="card" data-s="1" hidden>
<h2>必要なことを記入してください</h2>
<p class="hint">「必須」の印がある欄は、必ずご記入ください。入っている内容も、違っていれば直してください。</p>
<div id="fields"></div>
<div class="fld" id="idBox" hidden>
<label for="idFile">本人確認書類の写真<span class="req">※必須</span></label>
<p class="hint">運転免許証・マイナンバーカード（<b>表面のみ</b>。裏面は撮らないでください）・パスポートのどれか1つを、スマホで撮影するか、写真を選んでください。</p>
<input type="file" id="idFile" accept="image/*" capture="environment">
<img id="idPrev" class="idprev" alt="添付した本人確認書類" hidden>
</div>
<p class="err" id="err1" role="alert"></p>
<div class="btns"><button class="btn o" type="button" data-back="0">戻る</button><button class="btn" type="button" id="toSeal">次へ</button></div>
</section>

<section class="card" data-s="2" hidden>
<h2>押印して、承認してください</h2>
<div id="sumBox"></div>
<p class="hint">印は自動で作りました。形や文字を変えたいときだけ、直してください。</p>
<div class="seal-wrap" style="margin-bottom:14px"><div class="seal-box"><canvas id="seal" width="240" height="240" aria-label="印影"></canvas></div>
<div style="flex:1;min-width:220px"><div class="shape" role="radiogroup" aria-label="印の形"><label><input type="radio" name="shape" value="round" checked>丸印</label><label><input type="radio" name="shape" value="square">角印</label></div>
<div class="fld" style="margin:0"><label for="sealName" id="sealLabel">印に入れる名字（4文字まで）</label><input type="text" id="sealName" maxlength="4"></div></div></div>
<label class="agree" for="agree"><input type="checkbox" id="agree"><span>契約書の内容と記入した内容を確認しました。この内容で契約を結ぶことに同意します。</span></label>
<p class="err" id="err3" role="alert"></p>
<div class="btns"><button class="btn o" type="button" id="back2">記入した内容を直す</button><button class="btn gold" type="button" id="doSign">押印して承認する</button></div>
<p class="hint">「押印して承認する」を押すと、契約が結ばれます。押印済みの契約書は、この画面とメールでお届けします。</p>
</section>

<section class="card ok" data-s="3" hidden>
<h2>ご契約の手続きが終わりました</h2>
<p>ありがとうございました。押印済みの契約書を、メールでもお送りしました。大切に保管してください。</p>
<p id="nextPay" hidden><b>会費のお振込先・金額・期限を、メールでお送りしました。</b>入金を確認したら、会員登録完了のお知らせをお送りします。</p>
<div class="btns"><button class="btn" type="button" id="dl">契約書（PDF）を保存する</button></div>
<p class="err" id="err4" role="alert"></p>
<p class="hint">ご不明な点は、<a href="tel:{TELR}">{TEL}</a>（受付 {HRS}）までお気軽にお電話ください。</p>
</section>
</div>
</main>
{FOOT}
<script src="config.js"></script>
<script src="api.js"></script>
<script>
(function(){{
var $=function(id){{return document.getElementById(id)}};
var token=(location.search.match(/[?&]t=([A-Za-z0-9]+)/)||[])[1]||(window.KEIYAKU_DEMO?'sample':'');
var sent=/[?&]s=1/.test(location.search);
var C=null,idImage='',pdf=null,sess='',skipFill=false;
try{{sess=sessionStorage.getItem('iryo-k-'+token)||''}}catch(e){{}}
if(window.KEIYAKU_DEMO)$('demoBar').hidden=false;
function show(s){{document.querySelectorAll('section[data-s]').forEach(function(x){{x.hidden=+x.dataset.s!==s}});
 document.querySelectorAll('#steps li').forEach(function(li,i){{li.className=i<s?'done':(i===s?'on':'')}});window.scrollTo(0,0);
 var h=document.querySelector('section[data-s="'+s+'"] h2');if(h){{h.tabIndex=-1;h.focus({{preventScroll:true}})}}}}
function fail(m){{$('loading').hidden=true;$('app').hidden=true;$('otpBox').hidden=true;$('fail').hidden=false;$('failMsg').textContent=m}}
function esc(s){{return String(s==null?'':s).replace(/[&<>"]/g,function(c){{return{{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}}[c]}})}}
function who(c){{return(c.party_company?c.party_company+'　':'')+c.party_name+' 様'}}
document.querySelectorAll('[data-back]').forEach(function(b){{b.addEventListener('click',function(){{show(+b.dataset.back)}})}});
if(!token){{fail('契約書のリンクが正しくありません。メールのボタンから開き直してください。');return}}
function values(){{var v={{}};C.fields.forEach(function(x){{v[x.key]=($('f_'+x.key).value||'').trim()}});return v}}
function missing(){{var v=values();return C.fields.filter(function(x){{return x.required&&!v[x.key]}})}}
function renderDoc(){{var v=values();$('doc').innerHTML=esc(C.body).replace(/\\[\\[(\\w+)\\]\\]/g,function(_,k){{return v[k]?'<b>'+esc(v[k])+'</b>':'<span class="blank">記入欄</span>'}});
 $('blankHint').hidden=!/\\[\\[\\w+\\]\\]/.test(C.body)||!missing().length}}
function get(){{keiyakuApi('client.get',{{token:token,sess:sess}}).then(function(r){{
 C=r.contract;$('loading').hidden=true;
 if(r.needOtp){{$('otpBox').hidden=false;$('toLine0').textContent=who(C);$('title0').textContent=C.title;$('mailMask').textContent=C.email;
  if(sent){{$('otpLead').innerHTML='<b>'+esc(C.email)+'</b> に、6けたの認証コードを送りました。メールを開いて、下に入れてください。';$('sendRow').hidden=true;$('otpIn').hidden=false;if(window.KEIYAKU_DEMO)$('errO').textContent='お試し表示のため、認証コードは 123456 です。';try{{$('code').focus()}}catch(x){{}}}}return}}
 $('otpBox').hidden=true;$('app').hidden=false;
 $('title').textContent=C.title;$('cid').textContent=C.id;$('toLine').textContent=who(C);
 var f='';C.fields.forEach(function(x){{var tag=x.type==='textarea'?'<textarea id="f_'+x.key+'"></textarea>':'<input type="'+x.type+'" id="f_'+x.key+'"'+(x.ac?' autocomplete="'+x.ac+'"':'')+'>';
  f+='<div class="fld"><label for="f_'+x.key+'">'+esc(x.label)+(x.required?'<span class="req">※必須</span>':'')+'</label>'+tag+'</div>'}});
 $('fields').innerHTML=f;
 C.fields.forEach(function(x){{$('f_'+x.key).value=x.value||(x.key==='name'?C.party_name:x.key==='company'?(C.party_company||''):'')}});
 skipFill=!missing().length&&!C.requireId;
 if(skipFill){{document.querySelector('#steps li:nth-child(2)').hidden=true;document.querySelectorAll('#steps li b')[2].textContent='2';document.querySelectorAll('#steps li b')[3].textContent='3'}}
 renderDoc();
 if(C.draft){{$('draftNote').hidden=false;$('toFill').hidden=true;$('fbBox').hidden=false;fbShow(C.feedback)}}
 if(C.requireId)$('idBox').hidden=false;
 if(C.seal==='square')document.querySelector('input[name=shape][value=square]').checked=true;
 $('nextPay').hidden=!/会員.*申込書/.test(C.title);
 if(C.signed){{show(3)}}else show(0);
}}).catch(function(e){{fail(e.message)}})}}
function fbShow(f){{if(!f)return;$('fbDone').hidden=false;$('fbDone').textContent=(f.res==='ok'?'「この内容で進めてよい」とお返事いただきました。担当者から、同じ内容の正式な契約書をお送りします。':'直してほしいところをお伝えいただきました。担当者が内容を直して、あらためてお送りします。')+'（'+new Date(f.ts).toLocaleString('ja-JP')+'。お返事は送り直せます）'}}
function fbSend(res){{var c=$('fbC').value.trim();$('errFb').textContent='';if(res==='fix'&&!c){{$('errFb').textContent='直してほしいところを書いてください。';$('fbC').focus();return}}
 var b=res==='ok'?$('fbOk'):$('fbSend');b.disabled=true;
 keiyakuApi('client.feedback',{{token:token,sess:sess,res:res,comment:res==='fix'?c:''}}).then(function(r){{fbShow(r.feedback);$('fbFix').hidden=true;$('fbDone').scrollIntoView({{block:'center'}})}}).catch(function(e){{$('errFb').textContent=e.message}}).then(function(){{b.disabled=false}})}}
$('fbOk').addEventListener('click',function(){{fbSend('ok')}});$('fbFixB').addEventListener('click',function(){{$('fbFix').hidden=false;$('fbC').focus()}});$('fbSend').addEventListener('click',function(){{fbSend('fix')}});
get();
function sendOtp(){{$('errO').textContent='';$('sendOtp').disabled=true;$('resend').disabled=true;
 keiyakuApi('client.otp',{{token:token}}).then(function(r){{$('otpIn').hidden=false;$('sendRow').hidden=true;$('code').focus();$('errO').textContent=r.demoCode?'お試し表示のため、認証コードは '+r.demoCode+' です。':'認証コードを送りました。'}})
 .catch(function(e){{$('errO').textContent=e.message}}).then(function(){{setTimeout(function(){{$('sendOtp').disabled=false;$('resend').disabled=false}},20000)}})}}
$('sendOtp').addEventListener('click',sendOtp);$('resend').addEventListener('click',sendOtp);
function verify(){{var c=($('code').value||'').replace(/\\D/g,'');if(c.length!==6){{$('errO').textContent='6けたの数字を入れてください。';return}}
 $('doVerify').disabled=true;keiyakuApi('client.verify',{{token:token,code:c}}).then(function(r){{sess=r.sess;try{{sessionStorage.setItem('iryo-k-'+token,sess)}}catch(e){{}}$('errO').textContent='';get()}})
 .catch(function(e){{$('errO').textContent=e.message}}).then(function(){{$('doVerify').disabled=false}})}}
$('doVerify').addEventListener('click',verify);$('code').addEventListener('keydown',function(e){{if(e.key==='Enter')verify()}});
$('code').addEventListener('input',function(){{if(this.value.replace(/\\D/g,'').length===6)verify()}});
function toSign(){{var v=values();
 $('sumBox').innerHTML='<table class="list" style="margin-bottom:14px">'+C.fields.filter(function(x){{return v[x.key]}}).map(function(x){{return'<tr><th style="width:38%">'+esc(x.label)+'</th><td>'+esc(v[x.key])+'</td></tr>'}}).join('')+'</table>';
 setDefaultSeal();show(2)}}
$('toFill').addEventListener('click',function(){{if(skipFill)toSign();else show(1)}});
$('back2').addEventListener('click',function(){{document.querySelector('#steps li:nth-child(2)').hidden=false;skipFill=false;show(1)}});
$('idFile').addEventListener('change',function(){{var file=this.files[0];if(!file)return;var rd=new FileReader();rd.onload=function(){{var img=new Image();img.onload=function(){{var m=1600,w=img.width,h=img.height,k=Math.min(1,m/Math.max(w,h));var cv=document.createElement('canvas');cv.width=Math.round(w*k);cv.height=Math.round(h*k);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);idImage=cv.toDataURL('image/jpeg',.85);$('idPrev').src=idImage;$('idPrev').hidden=false}};img.src=rd.result}};rd.readAsDataURL(file)}});
$('toSeal').addEventListener('click',function(){{var v=values(),miss=missing();
 if(miss.length){{$('err1').textContent=miss[0].label+'を記入してください。';$('f_'+miss[0].key).focus();return}}
 if(C.adult&&v.birth){{var b=new Date(v.birth),l=new Date();l.setFullYear(l.getFullYear()-18);if(!(b<=l)){{$('err1').textContent='18歳未満の方は登録できません。';return}}}}
 if(C.requireId&&!idImage){{$('err1').textContent='本人確認書類の写真を添付してください。';return}}
 $('err1').textContent='';renderDoc();toSign()}});
function shape(){{return document.querySelector('input[name=shape]:checked').value}}
function setDefaultSeal(){{var sq=shape()==='square',v=values();$('sealName').maxLength=sq?12:4;$('sealLabel').textContent=sq?'印に入れる文字（12文字まで）':'印に入れる名字（4文字まで）';
 $('sealName').value=sq?((v.company||C.party_company||v.name||'').replace(/[\\s　]/g,'').slice(0,12)):((v.rep||v.name||C.party_name||'').split(/[\\s　]+/)[0].slice(0,4));drawSeal()}}
document.querySelectorAll('input[name=shape]').forEach(function(r){{r.addEventListener('change',setDefaultSeal)}});
function drawSeal(){{var cv=$('seal'),g=cv.getContext('2d'),n=($('sealName').value||'').replace(/[\\s　]/g,'');g.clearRect(0,0,240,240);if(!n)return;
 var red='#C8211B';g.strokeStyle=red;g.fillStyle=red;g.textAlign='center';g.textBaseline='middle';var F='"Noto Serif CJK JP","Hiragino Mincho ProN","Yu Mincho",serif';
 if(shape()==='square'){{n=n.slice(0,12);g.lineWidth=9;g.strokeRect(14,14,212,212);g.lineWidth=3;g.strokeRect(26,26,188,188);
  var L=n.length,rows=L<=4?2:L<=9?3:4,cols=Math.ceil(L/rows),cell=Math.min(176/rows,176/cols),size=cell*.9;g.font='bold '+size+'px '+F;
  var x0=120+cell*(cols-1)/2,y0=120-cell*(rows-1)/2;for(var i=0;i<L;i++){{var c=Math.floor(i/rows),r=i%rows;g.fillText(n[i],x0-c*cell,y0+r*cell)}}return}}
 n=n.slice(0,4);g.lineWidth=10;g.beginPath();g.arc(120,120,104,0,Math.PI*2);g.stroke();
 var L2=n.length,sz=L2<=1?120:L2===2?84:L2===3?62:50;g.font='bold '+sz+'px '+F;var gap=sz*.98,yy=120-gap*(L2-1)/2;for(var j=0;j<L2;j++)g.fillText(n[j],120,yy+gap*j)}}
$('sealName').addEventListener('input',drawSeal);
$('doSign').addEventListener('click',function(){{
 if(!$('sealName').value.trim()){{$('err3').textContent='印に入れる文字を入れてください。';$('sealName').focus();return}}
 if(!$('agree').checked){{$('err3').textContent='同意する欄に印を付けてください。';return}}
 drawSeal();var sealPng=$('seal').toDataURL('image/png');
 var b=this;b.disabled=true;b.textContent='手続きしています…';$('err3').textContent='';
 keiyakuApi('client.sign',{{token:token,sess:sess,values:values(),sealPng:sealPng,idImage:idImage,agree:true,ua:navigator.userAgent}}).then(function(r){{pdf=r.pdf?r:null;show(3)}})
 .catch(function(e){{$('err3').textContent=e.message;b.disabled=false;b.textContent='押印して承認する'}})}});
function save(r){{var bin=atob(r.pdf),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);var url=URL.createObjectURL(new Blob([a],{{type:'application/pdf'}}));var l=document.createElement('a');l.href=url;l.download=r.filename||'契約書.pdf';document.body.appendChild(l);l.click();setTimeout(function(){{URL.revokeObjectURL(url);l.remove()}},2000)}}
$('dl').addEventListener('click',function(){{$('err4').textContent='';if(pdf){{save(pdf);return}}keiyakuApi('client.pdf',{{token:token,sess:sess}}).then(function(r){{pdf=r;save(r)}}).catch(function(e){{$('err4').textContent=e.message}})}});
}})();
</script>
</body>
</html>
'''
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(CLIENT.replace("</body>", "<script>window.FORM_HELP={\"code\": {\"t\": \"メールに届いた6けたの数字を入れて、「確認する」を押します。\", \"ex\": \"届かないときは、迷惑メールのフォルダも見てください。10分たっても届かなければ、もう一度送ってください\", \"req\": true}, \"f_company\": {\"t\": \"事業所名・法人名を、正式な名前で入れます。\", \"ex\": \"例：株式会社○○\"}, \"f_address\": {\"t\": \"住所を、都道府県から入れます。\", \"ex\": \"例：大阪府大阪市○○区○○1-2-3\"}, \"f_rep\": {\"t\": \"代表者のお名前を入れます。\", \"ex\": \"例：山田 太郎\"}, \"f_name\": {\"t\": \"お名前を入れます。\", \"ex\": \"例：山田 花子\"}, \"f_kana\": {\"t\": \"お名前のふりがなを、ひらがなで入れます。\", \"ex\": \"例：やまだ はなこ\"}, \"f_title\": {\"t\": \"役職を入れます。\", \"ex\": \"例：施設長、事務長\"}, \"f_phone\": {\"t\": \"日中につながる電話番号を入れます。\", \"ex\": \"例：06-1234-5678\"}, \"f_birth\": {\"t\": \"生年月日を選びます。\", \"ex\": \"18歳以上の方が登録できます\"}, \"f_bank\": {\"t\": \"紹介料の振込先です。5つをまとめて書いてください。\", \"ex\": \"例：○○銀行 ○○支店 普通 1234567 ヤマダ ハナコ\"}, \"sealName\": {\"t\": \"印に入れる名字です（4文字まで）。\", \"ex\": \"自動で入っています。変えたいときだけ直してください\", \"req\": false}};window.FORM_NOBAR=true;</script>\n<script src=\"../assets/guide.js\" data-mode=\"site\"></script>\n</body>", 1))

# ---------- 管理画面（サイト版：お試し表示と、Googleアカウントでの入口） ----------
ADMIN_BODY = f'''
<div class="demo" id="demoBar" hidden>お試し表示です（メールは送られず、この端末の中だけで動きます）</div>
<header class="top"><div class="in"><span class="brand">{MARK}<span><b>医療介護総合支援会</b><small>管理画面（担当者用）</small></span></span></div></header>
<main>
<section class="card" id="gate" hidden style="max-width:520px;margin:20px auto">
<h2>ログイン（管理者・担当者）</h2>
<p class="hint">電子契約と受付の管理画面です。管理者・担当者とも、<b>自分のログインIDとパスワード</b>を入れてください。</p>
<form id="lf" autocomplete="on">
<div class="fld"><label for="lid">ID</label><input type="text" id="lid" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="60"></div>
<div class="fld"><label for="lpw">パスワード</label><input type="password" id="lpw" autocomplete="current-password" maxlength="100"></div>
<p class="err" id="errL" role="alert"></p>
<button class="btn" type="submit" id="doLogin" style="width:100%">ログイン</button>
</form>
<p style="margin:14px 0 0"><button type="button" class="small-btn" id="fgOpen">ID・パスワードを忘れたとき</button></p>
<div id="fg" hidden style="margin-top:14px;border-top:1px solid var(--line);padding-top:14px">
<h3 style="margin:0 0 6px">パスワードを決め直す（管理者）</h3>
<p class="note" style="margin:0 0 10px">担当者の方は、管理者にパスワードの再設定を頼んでください（管理画面の「設定」から再設定できます）。</p>
<p class="hint">① 下のボタンを押すと、支援会の登録メール（ikshienkai@gmail.com）に<b>IDと6けたの確認コード</b>が届きます（30分有効）。<br>② 届いたコードと新しいパスワードを入れて「変更する」を押してください。</p>
<button class="btn o" type="button" id="fgSend" style="width:100%">登録メールに確認コードを送る</button>
<p class="hint" id="fgMsg" role="status"></p>
<div id="fg2" hidden>
<div class="fld"><label for="fgCode">確認コード（6けた）</label><input type="text" id="fgCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6"></div>
<div class="fld"><label for="fgP1">新しいパスワード（8文字以上）</label><input type="password" id="fgP1" autocomplete="new-password" maxlength="100"></div>
<div class="fld"><label for="fgP2">新しいパスワード（確認のためもう一度）</label><input type="password" id="fgP2" autocomplete="new-password" maxlength="100"></div>
<p class="err" id="errF" role="alert"></p>
<button class="btn" type="button" id="fgDo" style="width:100%">変更する</button>
</div>
</div>
<p class="hint" style="margin-top:16px">5回続けて間違えると、15分間ログインできなくなります（パスワードを決め直すと、すぐ入れます）。<br><a id="gateLink" href="#">支援会の Google アカウントで開く（別の方法）</a></p>
</section>

<div id="panel" hidden>
<div class="adm-top"><label class="actor" id="actorW">操作する人 <select id="actorSel" aria-label="操作する人"></select></label><button type="button" class="small-btn" id="logout">ログアウト</button></div>
<section class="card todo" id="todo"><div class="todo-h"><h2>今やること</h2><span class="hint" id="todoAt"></span><button type="button" class="small-btn" id="tourBtn">はじめての方へ：操作の案内</button></div><ol class="todo-l" id="todoList"><li class="hint">読み込み中…</li></ol></section>
<nav class="tabs" role="tablist"><button type="button" role="tab" class="tab on adm-only" data-v="inbox">案件管理<span class="cnt" id="newCnt" hidden></span></button><button type="button" role="tab" class="tab" data-v="keiyaku">電子契約</button><button type="button" role="tab" class="tab adm-only" data-v="roster">会員・相談者の名簿</button><button type="button" role="tab" class="tab" data-v="route" id="tabRoute">設定（提携先・担当者）</button><button type="button" role="tab" class="tab adm-only" data-v="log">対応ログ</button><button type="button" class="small-btn adm-only" id="snd" aria-pressed="true" style="margin-left:auto">警告音：オン</button></nav>
<div data-view="inbox">
<details class="howto" id="howInbox"><summary>この画面の使い方（案件管理）</summary><div>
<ol><li><b>赤い印の案件から</b>対応します。新しい受付ほど上に出ます。</li><li>案件の「受付の内容を見る」を押して、内容を読みます。</li><li>読んだら「状態」を進め、「振分け先」「担当」「次の対応予定日」を入れて<b>「保存」</b>を押します。</li><li>お客様に伝えることがあれば「お客様へ報告を作る」を押します。文面は自動で作られます。<b>送るかどうかは自分で決めます</b>（電話で伝えた・今回は送らない、も選べます）。</li><li>いちばん上の<b>種別</b>（企業・事業者／働く方／利用者・ご本人／ご家族／提携・協業の申込み／要望・ご意見／会員登録）を押すと、その種別だけを管理できます。状態・振分け先・対応の種類は種別ごとに変わります。</li><li>その下の数字のボタンを押すと、その状態の案件だけを表示します。</li></ol>
<p class="hint" style="margin:10px 0 4px">状態の並びは種別（企業・働く方・提携の申込みなど）ごとに変わります。いま選んでいる種別の状態：</p><table class="list"><thead><tr><th>状態</th><th>この状態にするとき</th></tr></thead><tbody id="stepHelp"></tbody></table>
<p class="hint">放っておくと警告が出ます：新規受付のまま24時間／動きがないまま3日（黄）・7日（赤）／予定日を過ぎた／お客様へ7日報告なし。</p></div></details>
<div class="alertbar" id="alertBar" hidden></div>
<div class="segbar" id="segBar" role="tablist" aria-label="種別"></div><p class="seg-note" id="segNote" hidden></p>
<div class="sum" id="sum"></div>
<section class="card">
<div class="filters"><label>分類 <select id="fCt"><option value="">すべて</option></select></label><label>状態 <select id="fSt"></select></label><label id="fFacW">会員施設 <select id="fFac"><option value="">すべて</option><option>未確認</option><option>会員の病院・施設</option><option>会員ではない</option><option>通っている先がない</option></select></label><label id="fPtW">振分け先 <select id="fPt"><option value="">すべて</option></select></label><label>さがす <input type="text" id="fQ" placeholder="名前・会社・番号・内容"></label><button type="button" class="small-btn" id="reloadIn">最新にする</button><span class="vt-sw" role="group" aria-label="表示のしかた"><button type="button" class="small-btn on" data-vm="list">一覧表</button><button type="button" class="small-btn" data-vm="card">カード</button></span></div><p class="hint" id="inCount"></p>
<div id="inbox"><p class="hint">読み込み中…</p></div><datalist id="memList"></datalist>
<p class="err" id="errB" role="alert"></p>
</section>
</div>
<div data-view="roster" hidden>
<details class="howto"><summary>この画面の使い方（会員・相談者の名簿）</summary><div><ol><li>上で「会員名簿」か「相談者・申込者」を選びます。</li><li>左の分類を押すと、その分類の人だけが表に出ます（数字は人数）。</li><li>「さがす」で名前・会社・メールから探せます。</li><li>「表計算ソフト用に保存」で、いま表に出ている名簿をファイルに保存できます。</li><li>相談者の行の「案件を見る」を押すと、案件管理のその案件へ移ります。</li></ol></div></details>
<section class="card">
<div class="seg" role="tablist"><button type="button" class="seg-b on" data-rs="member">会員名簿</button><button type="button" class="seg-b" data-rs="people">相談者・申込者</button></div>
<div class="roster"><aside class="r-tree" id="rTree"></aside><div class="r-main"><div class="filters"><label>さがす <input type="text" id="rQ" placeholder="名前・会社・メール"></label><button type="button" class="small-btn" id="rCsv">表計算ソフト用に保存</button></div><p class="hint" id="rCount"></p><div class="tbl"><table class="list"><thead id="rHead"></thead><tbody id="rBody"></tbody></table></div></div></div>
</section>
</div>
<div data-view="log" hidden>
<details class="howto"><summary>この画面の使い方（対応ログ）</summary><div><ol><li>管理画面でしたこと（案件の状態・メモ・報告・提携先への送付、契約書の送付・入金確認・退会、提携先や担当者の登録、ログイン）が、<b>いつ・だれが・何をしたか</b>で自動的に残ります。</li><li>サイトからの受付、毎月の請求書の自動送付、相手が契約書を承認したことも残ります。</li><li>「操作した人」は、画面右上の<b>「操作する人」</b>で選んだ名前です。操作の前に、自分の名前を選んでください。</li><li>番号を押すと、その案件へ移ります。「表計算ソフト用に保存」で、いま出ている記録をファイルに保存できます。</li><li>記録は消したり書き換えたりできません（Googleの台帳「対応履歴」に保存されます）。</li></ol></div></details>
<section class="card">
<div class="filters"><label>期間 <select id="lgP"><option value="1">今日（24時間）</option><option value="7" selected>7日</option><option value="30">30日</option><option value="">すべて</option></select></label><label>区分 <select id="lgA"><option value="">すべて</option><option>案件</option><option>受付</option><option>電子契約</option><option>設定</option><option>ログイン</option></select></label><label>操作した人 <select id="lgW"><option value="">すべて</option></select></label><label>さがす <input type="text" id="lgQ" placeholder="番号・名前・内容"></label><button type="button" class="small-btn" id="lgReload">最新にする</button><button type="button" class="small-btn" id="lgCsv">表計算ソフト用に保存</button></div>
<p class="hint" id="lgCount"></p>
<div class="tbl"><table class="list lgt"><thead><tr><th>日時</th><th>区分</th><th>番号</th><th>したこと</th><th>内容</th><th>操作した人</th></tr></thead><tbody id="logBody"><tr><td colspan="6">読み込み中…</td></tr></tbody></table></div>
<p class="err" id="errLog" role="alert"></p>
</section>
</div>
<div data-view="route" hidden>
<details class="howto"><summary>この画面の使い方（設定）</summary><div><ol><li><b>担当者</b>：案件の「担当」で選べる名前を登録します。</li><li><b>提携先の登録</b>：振分け先にする提携企業・専門家を、大分類・中分類・小分類・連絡先とあわせて登録します。案件では、分類を選ぶと当てはまる提携先だけが一覧に出ます。<b>メールを登録した提携先には、案件の「提携先へ送る」で案件を送れます。</b>登録済みの提携先は、一覧の「直す」「削除」で変えられます（その場で保存されます）。</li><li>新しい受付は、相談の内容から分類を自動で決め、当てはまる提携先がいれば振分け先に自動で入ります。</li><li>担当者は「担当者を保存する」を押すと反映されます。</li></ol></div></details>
<section class="card" id="meSec">
<h2>あなたのアカウント</h2>
<p id="meInfo"></p>
<details><summary style="cursor:pointer;font-weight:700">パスワードを変える</summary><div class="pf-g" style="margin-top:10px"><div><label for="mpCur">いまのパスワード</label><input type="password" id="mpCur" autocomplete="current-password" maxlength="100"></div><div><label for="mpNew">新しいパスワード（8文字以上）</label><input type="password" id="mpNew" autocomplete="new-password" maxlength="100"></div><div><label for="mpNew2">新しいパスワード（もう一度）</label><input type="password" id="mpNew2" autocomplete="new-password" maxlength="100"></div></div><p class="err" id="errMp" role="alert"></p><button type="button" class="btn" id="mpSave">パスワードを変える</button></details>
</section>
<section class="card adm-only" id="accSec">
<h2>担当者のログインID</h2>
<p class="hint">担当者ごとにログインIDとパスワードを作ります。担当者は「電子契約」（自分が送った契約書）と「設定」（提携先の登録・登録フォームの送付）だけを使えます。案件管理・名簿・対応ログは見られません。</p>
<div class="tbl"><table class="list"><thead><tr><th>名前</th><th>ログインID</th><th>状態</th><th>最後のログイン</th><th></th></tr></thead><tbody id="accRows"><tr><td colspan="5">読み込み中…</td></tr></tbody></table></div>
<h3 style="margin:18px 0 8px">担当者を追加する</h3>
<div class="pf-g"><div><label for="acName">名前 <span class="req">※必須</span></label><input type="text" id="acName" maxlength="30" placeholder="例：山田"></div><div><label for="acId">ログインID <span class="req">※必須</span></label><input type="text" id="acId" maxlength="30" autocapitalize="off" spellcheck="false" placeholder="例：yamada（半角英数字）"></div><div><label for="acPw">はじめのパスワード（8文字以上） <span class="req">※必須</span></label><input type="password" id="acPw" autocomplete="new-password" maxlength="100"></div></div>
<p class="hint">はじめのパスワードは本人に伝え、ログイン後に「あなたのアカウント」で変えてもらってください。</p>
<p class="err" id="errAc" role="alert"></p><button type="button" class="btn" id="acAdd">担当者を追加する</button>
</section>
<section class="card adm-only" id="staffSec">
<h2>担当者</h2>
<p class="hint">案件の「担当」で選べる名前です。</p>
<div class="staff-l" id="staffList"></div>
<div class="filters" style="margin-top:10px"><label>名前 <input type="text" id="staffNew" placeholder="例：中嶋" maxlength="30"></label><button type="button" class="small-btn" id="staffAdd">追加</button></div>
<p class="err" id="errSt" role="alert"></p>
<button class="btn" type="button" id="saveStaff">担当者を保存する</button>
</section>
<section class="card">
<h2>提携先の登録</h2>
<p class="hint">振分け先にする提携企業・専門家を登録します。<b>メールアドレスを登録すると、案件の「提携先へ送る」から、内容を確かめたうえで案件を送れます。</b></p>
<div id="ptForm" class="pf"><div class="pf-g">
<div><label for="pfName">提携先の名前 <span class="req">※必須</span></label><input id="pfName" type="text" maxlength="100" placeholder="例：〇〇株式会社、〇〇社会保険労務士事務所"></div>
<div><label for="pfPerson">ご担当者</label><input id="pfPerson" type="text" maxlength="60" placeholder="例：山田 太郎"></div>
<div><label for="pfA">大分類 <span class="req">※必須</span></label><select id="pfA"></select></div>
<div><label for="pfB">中分類 <span class="req">※必須</span></label><select id="pfB" disabled></select></div>
<div><label for="pfC">小分類（任意）</label><select id="pfC" disabled></select></div>
<div><label for="pfEmail">メール（案件の送り先）</label><input id="pfEmail" type="email" maxlength="120" placeholder="例：info@example.jp"></div>
<div><label for="pfTel">電話</label><input id="pfTel" type="tel" maxlength="30" placeholder="例：06-0000-0000"></div>
<div><label for="pfArea">対応できる地域</label><input id="pfArea" type="text" maxlength="120" placeholder="例：大阪府全域、兵庫県（阪神）"></div>
<div class="wide"><label for="pfNote">メモ（条件・料金・注意など）</label><input id="pfNote" type="text" maxlength="300"></div>
</div>
<p class="err" id="errPt" role="alert"></p>
<div class="btns"><button class="btn" type="button" id="pfSave">この内容で登録する</button><button class="small-btn" type="button" id="pfClear">入力を消す</button></div></div>
<h3 style="margin:24px 0 8px">登録済みの提携先 <span class="hint" id="ptCount"></span></h3>
<div class="filters"><label>大分類 <select id="ptFA"></select></label><label>さがす <input type="text" id="ptQ" placeholder="名前・地域・メモ"></label></div>
<div class="tbl"><table class="list ptab"><thead><tr><th>提携先</th><th>分類</th><th>連絡先</th><th>対応できる地域・メモ</th><th>登録した人・状態</th><th></th></tr></thead><tbody id="ptRows"></tbody></table></div>
</section>
<section class="card" id="pinvSec">
<h2>提携先登録フォームを送る</h2>
<p class="hint">提携してほしい会社・専門家に、登録フォームをメールで送ります。相手が分野・連絡先・対応できる地域を自分で記入すると、提携先一覧に<b>「確認待ち」</b>で入ります（管理者が確かめてから振分けに使えるようになります）。送った人の名前で記録されます。</p>
<div class="pf-g"><div><label for="piName">相手の会社名・お名前 <span class="req">※必須</span></label><input type="text" id="piName" maxlength="100" placeholder="例：〇〇株式会社 ご担当者様"></div><div><label for="piEmail">相手のメールアドレス <span class="req">※必須</span></label><input type="email" id="piEmail" maxlength="120" placeholder="例：info@example.jp"></div><div class="wide"><label for="piMsg">ひとこと（任意）</label><input type="text" id="piMsg" maxlength="500" placeholder="例：先日はお打ち合わせありがとうございました。"></div></div>
<p class="err" id="errPi" role="alert"></p><button type="button" class="btn" id="piSend">登録フォームを送る</button>
</section>
<details class="card adm-only" id="routeSec"><summary style="font-weight:700;cursor:pointer">（予備）分野ごとの振分け</summary>
<p class="hint">提携先一覧に当てはまる先がないときだけ使われます。</p>
<div class="tbl"><table class="list"><thead><tr><th style="width:42%">分野（お客様が選ぶ項目）</th><th>振分け先</th><th style="width:70px">件数</th></tr></thead><tbody id="routeRows"></tbody></table></div>
<p class="err" id="errRt" role="alert"></p>
<button class="btn" type="button" id="saveRt">分野ごとの振分けを保存する</button>
</details>
</div>
<div class="modal" id="rpt" hidden role="dialog" aria-modal="true" aria-labelledby="rptH"><div class="modal-in">
<h2 id="rptH">お客様に進捗を報告しますか？</h2>
<p class="hint" id="rptInfo"></p>
<p class="note" id="rptWarn" hidden></p>
<div class="fld"><label for="rptS">件名</label><input type="text" id="rptS"></div>
<div class="fld"><label for="rptB">本文（直してから送れます）</label><textarea id="rptB" style="min-height:260px"></textarea></div>
<p class="err" id="errRp" role="alert"></p>
<div class="btns"><button class="btn" type="button" id="rpSend">メールで送る</button><button class="btn o" type="button" id="rpPhone">電話で伝えた（記録する）</button><button class="btn o" type="button" id="rpSkip">今回は送らない</button><button class="small-btn" type="button" id="rpAlt">別の言い回しで作り直す</button></div>
</div></div>
<div class="modal" id="fwd" hidden role="dialog" aria-modal="true" aria-labelledby="fwdH"><div class="modal-in">
<h2 id="fwdH">提携先へ案件を送る</h2>
<p class="hint" id="fwdTo"></p>
<p class="note" id="fwdWarn" hidden></p>
<fieldset class="fw-inc"><legend>提携先に伝えるお客様の情報（外すと本文から消えます）</legend><label><input type="checkbox" data-inc="name" checked> お名前・会社名</label><label><input type="checkbox" data-inc="email" checked> メール</label><label><input type="checkbox" data-inc="tel" checked> 電話</label><label id="fwIncFac"><input type="checkbox" data-inc="fac" checked> 通っている病院・施設</label></fieldset>
<div class="fld"><label for="fwdS">件名</label><input type="text" id="fwdS"></div>
<div class="fld"><label for="fwdB">本文（直してから送れます）</label><textarea id="fwdB" style="min-height:300px"></textarea></div>
<label class="fw-ok"><input type="checkbox" id="fwdOk"><span><b>お客様から、この提携先へ情報を伝えることの同意をいただいています。</b>同意がないときは送れません。</span></label>
<label class="fw-st"><input type="checkbox" id="fwdSt" checked><span id="fwdStL"></span></label>
<p class="err" id="errFw" role="alert"></p>
<div class="btns"><button class="btn" type="button" id="fwSend" disabled>確認して送る</button><button class="btn o" type="button" id="fwCancel">やめる</button></div>
</div></div>
<div data-view="keiyaku" hidden>
<details class="howto"><summary>この画面の使い方（電子契約）</summary><div><ol><li>サイトの会員登録は、お客様が申し込むと<b>自動で契約書が作られます</b>。ここで送る必要はありません。</li><li>相手が承認すると「締結済み」になり、請求書つきの振込のご案内が自動で届きます（期限は承認日から7日。入会した月は無料）。</li><li><b>毎月1日の朝に、翌月分の請求書が自動で全員に届きます</b>（期限は10日）。送った内容は登録メールにも届きます。</li><li>会員が退会するときは、その行の「退会（請求を止める）」を押します。翌月から請求書が止まります。</li><li>通帳などで入金を確かめたら、その行の<b>「入金を確認した」</b>を押します。会員登録完了のメールが自動で届きます。</li><li>相手がまだ承認していないときは「もう一度送る」で案内を送り直せます。</li><li>協賛会員（審査あり）や、個別の契約書は、下の「契約書を送る」から作って送ります。</li></ol></div></details>
<section class="card">
<h2>送った契約書の一覧</h2>
<div class="tbl"><table class="list"><thead><tr><th>契約番号・案件</th><th>種類</th><th>相手</th><th>状態</th><th>送った日</th><th>操作</th></tr></thead><tbody id="rows"><tr><td colspan="6">読み込み中…</td></tr></tbody></table></div>
<p class="err" id="errR" role="alert"></p>
</section>
<section class="card">
<h2>契約書を送る</h2>
<p class="hint">サイトの「会員登録の申込み」の通知メールを見ながら入れてください。</p>
<p class="note case-ln" id="caseLink" hidden></p>
<div class="fld"><label for="tpl">契約書の種類</label><select id="tpl"></select></div>
<div class="fld"><label for="pName">相手のお名前（ご担当者）<span class="req">※必須</span></label><input type="text" id="pName"></div>
<div class="fld" id="pCompanyBox"><label for="pCompany">事業所名・法人名</label><input type="text" id="pCompany"></div>
<div class="fld"><label for="pEmail">相手のメールアドレス<span class="req">※必須</span></label><input type="email" id="pEmail" autocomplete="off"></div>

<div class="fld" id="condBox" hidden><label>契約の内容（会費は自動で計算します）</label>
<div class="cond">
<div class="fld" id="cTypeBox"><label for="cType">会員区分</label><select id="cType"><option value="jigyosho">事業所会員</option><option value="hojin">法人会員</option><option value="kyosan">協賛会員</option></select></div>
<div class="fld"><label for="cPay">支払方法</label><select id="cPay"><option value="month">月払い</option><option value="year">年間払い（10か月分）</option></select></div>
<div class="fld" id="cSitesBox"><label for="cSites">事業所数</label><input type="number" id="cSites" min="1" value="1" inputmode="numeric"></div>
<div class="fld" id="cStaffBox"><label for="cStaff">職員数（合計）</label><input type="number" id="cStaff" min="0" value="5" inputmode="numeric"></div>
<div class="fld"><label for="cStart">会費の発生月（1日から）</label><input type="month" id="cStart"></div>
<div class="fld"><label for="cRef">紹介者</label><input type="text" id="cRef" placeholder="なければ空のまま"></div>
<div class="fld"><label class="agree" for="cFounder" style="padding:10px"><input type="checkbox" id="cFounder" checked><span>創設会員（入会金免除）</span></label></div>
<div class="fld" id="cEntryBox" hidden><label for="cEntry">入会金</label><input type="text" id="cEntry" placeholder="例：11,000円（税込）"></div>
<p class="fee" id="cFee"></p>
</div></div>

<div class="fld"><label>相手に記入してもらう項目</label><div class="chk" id="fieldChk"></div></div>
<div class="fld"><label>前もって入れておく内容（申込みの内容を写すと、相手の手間が減ります。相手は直せます）</label><div class="pre" id="preBox"></div></div>
<div class="fld"><label class="agree" for="reqId" style="padding:12px"><input type="checkbox" id="reqId"><span>本人確認書類の写真の添付を求める</span></label></div>
<div class="fld" id="noteBox"><label for="note" id="noteLabel">特記事項</label><textarea id="note" placeholder="なければ空のまま"></textarea></div>
<div class="fld"><label class="agree" for="draft" style="padding:12px"><input type="checkbox" id="draft"><span>下書き（確認用）として送る　※相手は内容を見るだけで、締結はできません</span></label></div>
<div class="btns" style="margin-top:0;margin-bottom:14px"><button class="btn o" type="button" id="doPrev">送る前に文面を確かめる</button></div>
<div class="doc" id="prev" hidden tabindex="0"></div>
<p class="err" id="errI" role="alert"></p>
<button class="btn" id="doIssue">メールで送る</button>
<p id="issued" class="note" hidden></p>
</section>
</div>
</div>
</main>
{FOOT}
'''
ADMIN_JS = r'''<script>
(function(){
var $=function(id){return document.getElementById(id)},TPL=[],FIELDS={},K=window.KEIYAKU_CORE;
var IN_GAS=!!window.IN_GAS;
if(window.KEIYAKU_DEMO&&!IN_GAS)$('demoBar').hidden=false;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function day(s){if(!s)return'';var d=new Date(s);return isNaN(d)?esc(s):(d.getMonth()+1)+'/'+d.getDate()}
var ACTOR='';try{ACTOR=localStorage.getItem('iryo-actor')||''}catch(e){}
var ROLE='admin',MYNAME='';
function isStaff(){return ROLE==='staff'}
function applyRole(){document.body.classList.toggle('role-staff',isStaff());
 $('meInfo').innerHTML='<span class="me-badge">'+(isStaff()?'担当者':'管理者')+'：'+esc(MYNAME)+'</span>　'+(isStaff()?'使える画面：電子契約（自分が送った契約書）・設定（提携先の登録と登録フォームの送付）':'すべての画面を使えます');
 if(isStaff()){ACTOR=MYNAME;$('actorW').innerHTML='<span class="me-badge">担当：'+esc(MYNAME)+'</span>';$('tabRoute').textContent='設定（提携先）';goTab('keiyaku')}
 else{if(!ACTOR&&MYNAME){ACTOR=MYNAME;try{localStorage.setItem('iryo-actor',ACTOR)}catch(e){}}}}
function api(a,d){d=d||{};if(a.indexOf('admin.')===0&&a!=='admin.login'&&ACTOR&&d.actor==null)d.actor=ACTOR;return keiyakuApi(a,d)}
var n=new Date(),nx=new Date(n.getFullYear(),n.getMonth()+1,1);$('cStart').value=nx.getFullYear()+'-'+('0'+(nx.getMonth()+1)).slice(-2);
function start(){$('panel').hidden=false;
 api('admin.templates').then(function(r){TPL=r.templates;FIELDS=r.fields;$('tpl').innerHTML=TPL.filter(function(t){return!t.hidden}).map(function(t){return'<option value="'+t.key+'">'+esc(t.title)+'</option>'}).join('');onTpl()}).catch(function(e){$('errI').textContent=e.message});list()}
function cur(){var k=$('tpl').value;return TPL.filter(function(x){return x.key===k})[0]}
function cond(){return{type:$('cType').value,pay:$('cPay').value,sites:$('cSites').value,staff:$('cStaff').value,start:$('cStart').value,referrer:$('cRef').value.trim(),founder:$('cFounder').checked,entryFee:$('cEntry').value.trim()}}
function onCond(){var t=$('cType').value;$('cSitesBox').hidden=t!=='hojin';$('cStaffBox').hidden=t==='kyosan';$('cEntryBox').hidden=$('cFounder').checked;
 var o=K.normCond(cond());$('cFee').textContent='月額 '+K.yen(o.monthly)+'　／　初回のお振込み '+K.yen(o.first)+'（'+o.dueText+'まで）　／　契約期間 '+o.startText+'〜'+o.endText;$('prev').hidden=true}
['cType','cPay','cSites','cStaff','cStart','cRef','cFounder','cEntry'].forEach(function(id){$(id).addEventListener('input',onCond);$(id).addEventListener('change',onCond)});
function preKeys(){return[].map.call($('fieldChk').querySelectorAll('input:checked'),function(i){return i.value}).filter(function(k){return k!=='birth'&&k!=='bank'})}
function drawPre(){var old={};[].forEach.call($('preBox').querySelectorAll('input'),function(i){old[i.dataset.k]=i.value});
 $('preBox').innerHTML=preKeys().map(function(k){return'<div class="fld"><label for="pre_'+k+'" style="font-weight:400">'+esc(FIELDS[k].label)+'</label><input type="text" id="pre_'+k+'" data-k="'+k+'" value="'+esc(old[k]||'')+'"></div>'}).join('')}
function onTpl(){var t=cur();if(!t)return;
 $('fieldChk').innerHTML=Object.keys(FIELDS).map(function(k){var req=t.required.indexOf(k)>=0;return'<label><input type="checkbox" value="'+k+'"'+(t.fields.indexOf(k)>=0||req?' checked':'')+(req?' disabled':'')+'>'+esc(FIELDS[k].label)+(req?'（※必須）':'')+'</label>'}).join('');
 $('fieldChk').onchange=drawPre;drawPre();
 if(t.mtype){$('cType').value=t.mtype}$('cTypeBox').hidden=!!t.mtype;
 $('reqId').checked=!!t.requireId;$('condBox').hidden=!t.cond;$('noteBox').hidden=!t.note;$('noteLabel').textContent=t.note||'特記事項';$('prev').hidden=true;if(t.cond)onCond()}
$('tpl').addEventListener('change',onTpl);
function payload(){var t=cur(),pre={};[].forEach.call($('preBox').querySelectorAll('input'),function(i){if(i.value.trim())pre[i.dataset.k]=i.value.trim()});
 return{template:t.key,party:{name:$('pName').value.trim(),company:$('pCompany').value.trim(),email:$('pEmail').value.trim()},fields:[].map.call($('fieldChk').querySelectorAll('input:checked'),function(i){return i.value}),requireId:$('reqId').checked,cond:t.cond?cond():null,note:t.note?$('note').value.trim():'',prefill:pre,draft:$('draft').checked,caseNo:CASE_LINK||(REPLACES&&ctOf(REPLACES)?ctOf(REPLACES).case_no:'')||'',replaces:REPLACES||''}}
$('doPrev').addEventListener('click',function(){var p=payload();$('prev').textContent=K.buildBody(p.template,p.cond,p.note,p.party.company||p.party.name||'（相手のお名前）').replace(/\[\[(\w+)\]\]/g,function(_,k){return p.prefill[k]?p.prefill[k]+'（相手が直せます）':'＿＿＿（相手が記入）'});$('prev').hidden=false});
$('doIssue').addEventListener('click',function(){var b=this,p=payload();
 if(/^kaiin/.test(p.template)&&p.cond.type==='hojin'&&(+p.cond.sites||1)<2&&!confirm('法人会員で事業所数が1か所です。このまま送りますか？'))return;
 if(/^kaiin/.test(p.template)&&p.cond.type==='kyosan'&&!confirm('協賛会員は審査が必要です。審査は済んでいますか？'))return;
 b.disabled=true;$('errI').textContent='';$('issued').hidden=true;
 api('admin.issue',p).then(function(r){$('issued').hidden=false;$('issued').innerHTML='送りました（契約番号 '+esc(r.id)+'）。<br>相手の画面：<a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+esc(r.url)+'</a>';['pName','pCompany','pEmail','note','cRef','cEntry'].forEach(function(id){$(id).value=''});if(CASE_LINK)$('issued').innerHTML+='<br>案件 '+esc(CASE_LINK)+' に結びつけました。';if(REPLACES)$('issued').innerHTML+='<br>元の書面 '+esc(REPLACES)+' は取り消しました。';REPLACES=null;setCaseLink(null);$('preBox').innerHTML='';onTpl();list()})
 .catch(function(e){$('errI').textContent=e.message}).then(function(){b.disabled=false})});
function list(){api('admin.list').then(function(r){KL=r.rows||[];var mm={};KL.forEach(function(o){if(o.template==='kaiin'&&o.status==='締結済み'&&!o.stopped&&o.party_company)mm[o.party_company]=1});var dl=$('memList');if(dl)dl.innerHTML=Object.keys(mm).sort().map(function(n){return'<option value="'+esc(n)+'">'}).join('');todo();drawRoster();if(IN.length&&!document.querySelector('#inbox .ib input:focus,#inbox .ib textarea:focus'))drawIn();if(!r.rows.length){$('rows').innerHTML='<tr><td colspan="6">まだありません</td></tr>';return}
 $('rows').innerHTML=r.rows.map(function(x){var cls=x.status==='締結済み'?'done':x.status==='取り消し'?'cancel':'';var st=x.paid?'入金済み':x.status==='送付済み'&&x.viewed?'確認中':x.status;
  var cn=isStaff()?'':caseOfCt(x);return'<tr data-id="'+esc(x.id)+'"><td>'+esc(x.id)+(cn?'<br><button type="button" class="lnk" data-gocase="'+esc(cn)+'">案件 '+esc(cn)+'</button>'+(x.case_no?'':'<small>（同じメール）</small>'):'')+'</td><td>'+esc(x.title)+(x.draft==='yes'?'<br><span class="tag">下書き</span>':'')+'</td><td>'+esc(x.party_company?x.party_company+' ':'')+esc(x.party_name)+'<br><small>'+esc(x.party_email)+'</small>'+(x.refcode?'<br><span class="tag">紹介コード '+esc(x.refcode)+'</span>':'')+(x.billed?'<br><span class="tag">請求済み：'+esc(x.billed.replace('-','年'))+'月分まで</span>':'')+(x.stopped?'<br><span class="tag cancel">退会（請求停止）</span>':'')+'</td><td><span class="tag '+cls+'">'+esc(x.draft==='yes'?ctSt(x):st)+'</span>'+fbLine(x)+(x.prev?'<br><small>'+esc(x.prev)+' の差し替え</small>':'')+(!isStaff()&&x.issuer?'<br><small>送った人：'+esc(x.issuer)+'</small>':'')+'</td><td>'+day(x.created)+'</td><td>'+draftBtns(x)+
  (x.status==='締結済み'?'<button class="small-btn" data-pdf="'+esc(x.id)+'">PDFを保存</button>'+(!isStaff()&&x.template==='kaiin'&&!x.paid?'<button class="small-btn" data-paid="'+esc(x.id)+'">入金を確認した</button>':'')+(!isStaff()&&x.template==='kaiin'&&!x.stopped?'<button class="small-btn" data-stop="'+esc(x.id)+'">退会（請求を止める）</button>':''):x.status==='取り消し'?'':'<button class="small-btn" data-resend="'+esc(x.id)+'">もう一度送る</button><button class="small-btn" data-cancel="'+esc(x.id)+'">取り消す</button>')+'</td></tr>'}).join('')}).catch(function(e){$('errR').textContent=e.message})}
$('rows').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;$('errR').textContent='';
 if(b.dataset.final){ctFinal(b.dataset.final,b);return}
 if(b.dataset.redo){ctRedo(b.dataset.redo);return}
 if(b.dataset.gocase){goTab('inbox');SEG='all';['fCt','fPt'].forEach(function(i){$(i).value=''});drawIn();$('fSt').value='all';$('fQ').value=b.dataset.gocase;OPEN[b.dataset.gocase]=true;drawIn();window.scrollTo(0,$('inbox').getBoundingClientRect().top+scrollY-120);return}
 if(b.dataset.paid&&confirm('入金を確認しましたか？相手に「会員登録完了」のメールを送ります。'))api('admin.paid',{id:b.dataset.paid}).then(list).catch(function(x){$('errR').textContent=x.message});
 if(b.dataset.stop&&confirm('この会員を退会扱いにして、毎月の請求書を止めますか？（元に戻すときは担当者に連絡してください）'))api('admin.stop',{id:b.dataset.stop}).then(list).catch(function(x){$('errR').textContent=x.message});
 if(b.dataset.resend)api('admin.resend',{id:b.dataset.resend}).then(function(){$('errR').textContent='もう一度送りました。'}).catch(function(x){$('errR').textContent=x.message});
 if(b.dataset.cancel&&confirm('この契約書を取り消しますか？相手はもう開けなくなります。'))api('admin.cancel',{id:b.dataset.cancel}).then(list).catch(function(x){$('errR').textContent=x.message});
 if(b.dataset.pdf)api('admin.pdf',{id:b.dataset.pdf}).then(function(r){var bin=atob(r.pdf),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);var u=URL.createObjectURL(new Blob([a],{type:'application/pdf'}));var l=document.createElement('a');l.href=u;l.download=r.filename;document.body.appendChild(l);l.click();setTimeout(function(){URL.revokeObjectURL(u);l.remove()},2000)}).catch(function(x){$('errR').textContent=x.message})});

/* ---- 振分け先（提携先一覧から分類で選ぶ）と担当者 ---- */
var PARTNERS=[],STAFF=[];
function ctSt(c){if(c.draft==='yes'&&c.status!=='取り消し'&&c.feedback)return c.feedback.res==='ok'?'下書き・相手が「この内容でよい」':'下書き・修正の希望あり';var st=c.paid?'入金済み':c.status==='送付済み'&&c.viewed?'相手が確認中':c.status==='送付済み'?'送付済み（未開封）':c.status;return(c.draft==='yes'?'下書き・':'')+st}
function ctCls(c){return c.status==='取り消し'?'no':c.draft==='yes'?(c.feedback&&c.feedback.res==='ok'?'ok':'dr'):c.status==='締結済み'?'ok':''}
function isLiveDraft(c){return c.draft==='yes'&&c.status!=='取り消し'&&c.status!=='締結済み'}
function draftBtns(c){return isLiveDraft(c)?'<button type="button" class="small-btn fw-b" data-final="'+esc(c.id)+'">この内容で本契約として送る</button><button type="button" class="small-btn" data-redo="'+esc(c.id)+'">内容を直して送り直す</button>':''}
function fbLine(c){var f=c.feedback;return f&&c.draft==='yes'?'<div class="fb-l '+(f.res==='ok'?'ok':'fix')+'">相手の返事（'+dt(f.ts)+'）：'+(f.res==='ok'?'この内容で進めてよい':'修正の希望')+(f.comment?'<br>'+esc(f.comment):'')+'</div>':''}
function ctsOf(x){if(!KL)return[];var em=String(x.email||'').toLowerCase();return KL.filter(function(c){return c.case_no?c.case_no===x.no:(em&&String(c.party_email||'').toLowerCase()===em)})}
function caseOfCt(c){if(c.case_no)return c.case_no;var em=String(c.party_email||'').toLowerCase();if(!em)return'';var m=IN.filter(function(x){return String(x.email||'').toLowerCase()===em});return m.length?m[0].no:''}
function ctHtml(x){var l=ctsOf(x);return'<div class="ct-box"><b>電子契約</b>'+(l.length?'<ul class="ct-l">'+l.map(function(c){return'<li><span class="ct-st '+ctCls(c)+'">'+esc(ctSt(c))+'</span><span>'+esc(c.title)+'</span><small>'+esc(c.id)+'　'+day(c.created)+' 送付'+(c.prev?'（'+esc(c.prev)+' の差し替え）':'')+(c.case_no?'':'（同じメールアドレスの契約）')+'</small><button type="button" class="small-btn" data-ctgo="'+esc(c.id)+'">電子契約で見る</button>'+draftBtns(c)+fbLine(c)+'</li>'}).join('')+'</ul>':'<p class="hint" style="margin:0">この案件の契約書はまだ送っていません。</p>')+'<button type="button" class="small-btn" data-ctnew style="margin-top:8px">この案件の契約書を作る（下書きも送れます）</button></div>'}
var CASE_LINK=null;
function setCaseLink(x){CASE_LINK=x?x.no:null;var el=$('caseLink');el.hidden=!x&&!REPLACES;el.innerHTML='';if(x)el.innerHTML='<span>この契約書は <b>案件 '+esc(x.no)+'</b>（'+esc((x.company?x.company+' ':'')+(x.name||''))+'）に結びつけて送ります。案件の画面に「下書きを送った」などが表示されます。</span><button type="button" class="small-btn" id="caseUnlink">結びつけない</button>';if(x)$('caseUnlink').onclick=function(){setCaseLink(null)}}
function newCt(x){var g=segOf(x),c=cls(x);goTab('keiyaku');setCaseLink(x);
 var tk=g.key==='teikei'?'teikei':g.key==='kaiin'?({'事業所会員':'kaiin_jigyosho','法人会員':'kaiin_hojin','協賛会員':'kaiin_kyosan','個人会員（営業協力者）':'kojin'}[c.sub]||'kaiin_jigyosho'):'';
 if(tk&&[].some.call($('tpl').options,function(o){return o.value===tk})){$('tpl').value=tk;onTpl()}
 $('pName').value=x.name&&x.name.indexOf('伏せ')<0&&x.name.indexOf('名前なし')<0?x.name:'';$('pCompany').value=x.company||'';$('pEmail').value=x.email||'';$('draft').checked=true;
 window.scrollTo(0,$('caseLink').getBoundingClientRect().top+scrollY-130);flash($('caseLink'))}
function ctOf(id){return(KL||[]).filter(function(c){return c.id===id})[0]}
function ctFinal(id,b){var c=ctOf(id);if(!c)return;var w=c.feedback?(c.feedback.res==='ok'?'相手から「この内容で進めてよい」と返事が届いています。':'注意：相手から「修正の希望」が届いています。直さずに送ってよいですか？'):'まだ相手から返事が届いていません。';
 if(!confirm(w+'\n\n「'+c.title+'」（'+id+'）を、下書きと同じ内容のまま正式な契約書として '+c.party_email+' へ送ります。相手は同じリンクから記入・押印・承認できるようになります。よろしいですか？'))return;
 if(b)b.disabled=true;api('admin.finalize',{id:id}).then(function(){$('errR').textContent='「'+c.title+'」（'+id+'）を本契約として送りました。';$('errB').textContent='「'+c.title+'」を本契約として送りました。';list()}).catch(function(er){$('errR').textContent=er.message;$('errB').textContent=er.message;if(b)b.disabled=false})}
var REPLACES=null;
function ctRedo(id){api('admin.get',{id:id}).then(function(r){var c=r.contract;goTab('keiyaku');
 var tk=c.template==='kaiin'?'kaiin_'+((c.cond&&c.cond.type)||'jigyosho'):c.template;if([].some.call($('tpl').options,function(o){return o.value===tk}))$('tpl').value=tk;onTpl();
 $('pName').value=c.party.name||'';$('pCompany').value=c.party.company||'';$('pEmail').value=c.party.email||'';
 [].forEach.call($('fieldChk').querySelectorAll('input'),function(i){if(!i.disabled)i.checked=c.fields.indexOf(i.value)>=0});drawPre();
 [].forEach.call($('preBox').querySelectorAll('input'),function(i){i.value=(c.prefill||{})[i.dataset.k]||''});
 if(c.cond){$('cPay').value=c.cond.pay||'month';$('cSites').value=c.cond.sites||1;$('cStaff').value=c.cond.staff==null?5:c.cond.staff;$('cStart').value=String(c.cond.start||'').slice(0,7);$('cRef').value=c.cond.referrer||'';$('cFounder').checked=c.cond.founder!==false;$('cEntry').value=c.cond.entryFee||'';onCond()}
 $('note').value=c.note||'';$('reqId').checked=!!c.requireId;$('draft').checked=!!c.draft;
 var x=c.case_no?caseOf(c.case_no):null;setCaseLink(x||null);REPLACES=c.id;
 var el=$('caseLink');el.hidden=false;el.insertAdjacentHTML('afterbegin','<span style="flex-basis:100%"><b>'+esc(c.id)+' を直して送り直します。</b>元の書面は取り消され、直した書面だけが相手に届きます（'+(c.draft?'下書きのまま送るか、下の「下書き（確認用）として送る」を外して本契約として送るかを選べます':'')+'）。'+(c.feedback&&c.feedback.comment?'<br>相手の修正の希望：'+esc(c.feedback.comment):'')+'</span>');
 if(!x&&c.case_no)el.insertAdjacentHTML('beforeend','<span>案件 '+esc(c.case_no)+' に結びつけます。</span>');
 var cu=$('caseUnlink');if(cu)cu.remove();
 if(!el.querySelector('#redoCancel'))el.insertAdjacentHTML('beforeend','<button type="button" class="small-btn" id="redoCancel">差し替えをやめる</button>');$('redoCancel').onclick=function(){REPLACES=null;setCaseLink(null)};
 window.scrollTo(0,el.getBoundingClientRect().top+scrollY-130);flash(el)}).catch(function(er){$('errR').textContent=er.message;$('errB').textContent=er.message})}
function goCt(id){goTab('keiyaku');var tr=[].filter.call($('rows').querySelectorAll('tr'),function(t){return t.dataset.id===id})[0];if(tr)flash(tr)}
function staffOpts(cur){var l=STAFF.slice();if(cur&&l.indexOf(cur)<0)l.unshift(cur);return'<option value="">（担当者を選ぶ）</option>'+l.map(function(n){return'<option'+(n===cur?' selected':'')+'>'+esc(n)+'</option>'}).join('')}
function autoCat(x){var fs=String(x.fields||'').split('、');for(var i=0;i<fs.length;i++){var m=ROUTE_AUTO_N[fs[i]];if(m)return m}var c=cls(x);if(c.kind==='提携・協業'&&c.path[0]){var p=c.path[0].split(' ＞ ');return[p[0],p[1]||'']}return null}
function opt(list,cur,ph){return'<option value="">'+ph+'</option>'+list.map(function(v){return'<option'+(v===cur?' selected':'')+'>'+esc(v)+'</option>'}).join('')}
function ptList(a,b,c){return PARTNERS.filter(function(p){return p.state!=='確認待ち'&&(!a||p.a===a)&&(!b||p.b===b)&&(!c||!p.c||p.c===c)})}
function ptNames(a,b,c,cur){var l=ptList(a,b,c).map(function(p){return p.name});if(cur&&cur!=='自社'&&l.indexOf(cur)<0)l.unshift(cur);
 return'<option value="">'+(l.length?'（提携先を選ぶ）':'（当てはまる提携先がまだ登録されていません）')+'</option>'+l.map(function(n){return'<option'+(n===cur?' selected':'')+'>'+esc(n)+'</option>'}).join('')+'<option value="自社"'+(cur==='自社'?' selected':'')+'>自社（当会）で対応する</option><option value="__free">その他（直接入力する）</option>'}
function ptHtml(x){var a='',b='',c='';var reg=PARTNERS.filter(function(p){return p.name===x.partner})[0];if(reg){a=reg.a;b=reg.b;c=reg.c}else{var m=autoCat(x);if(m){a=m[0];b=m[1]}}
 var T=window.PARTNER_TAX||{},bs=a&&T[a]?Object.keys(T[a]):[],cs=a&&b&&T[a]&&T[a][b]?T[a][b]:[];
 return'<div class="pt-box"><label>振分け先'+(autoCat(x)&&!x.partner?' <span class="hint">（相談の内容から大分類・中分類を自動で選んでいます。提携先を選んでください）</span>':'')+'</label><div class="pt-g"><select data-pa aria-label="大分類">'+opt(Object.keys(T),a,'大分類')+'</select><select data-pb aria-label="中分類"'+(a?'':' disabled')+'>'+opt(bs,b,'中分類')+'</select><select data-pc aria-label="小分類"'+(b?'':' disabled')+'>'+opt(cs,c,'小分類（任意）')+'</select><select data-pn aria-label="提携先">'+ptNames(a,b,c,x.partner)+'</select></div>'+
 '<input type="text" data-k="partner" value="'+esc(x.partner)+'" placeholder="提携先の名前を入力" hidden></div>'}
$('inbox').addEventListener('change',function(e){if(e.target.dataset&&e.target.dataset.fc==='m'){e.target.closest('.fac-box').dataset.m=e.target.value;return}var box=e.target.closest('.pt-box');if(!box)return;var T=window.PARTNER_TAX||{},A=box.querySelector('[data-pa]'),B=box.querySelector('[data-pb]'),C=box.querySelector('[data-pc]'),N=box.querySelector('[data-pn]'),I=box.querySelector('[data-k="partner"]');
 if(e.target===A){B.innerHTML=opt(A.value&&T[A.value]?Object.keys(T[A.value]):[],'','中分類');B.disabled=!A.value;C.innerHTML=opt([],'','小分類（任意）');C.disabled=true}
 if(e.target===B){C.innerHTML=opt(A.value&&B.value&&T[A.value][B.value]?T[A.value][B.value]:[],'','小分類（任意）');C.disabled=!B.value}
 if(e.target===A||e.target===B||e.target===C){N.innerHTML=ptNames(A.value,B.value,C.value,'');I.hidden=true;I.value=''}
 if(e.target===N){if(N.value==='__free'){I.hidden=false;I.value='';I.focus()}else{I.hidden=true;I.value=N.value}}});
/* ---- 設定：担当者 ---- */
function drawActor(){if(isStaff())return;var l=STAFF.slice();if(ACTOR&&l.indexOf(ACTOR)<0)l.unshift(ACTOR);$('actorSel').innerHTML='<option value="">'+(l.length?'（名前を選ぶ）':'（設定で担当者を登録）')+'</option>'+l.map(function(n){return'<option'+(n===ACTOR?' selected':'')+'>'+esc(n)+'</option>'}).join('');$('actorW').classList.toggle('need',!!STAFF.length&&!ACTOR)}
$('actorSel').addEventListener('change',function(){ACTOR=this.value;try{localStorage.setItem('iryo-actor',ACTOR)}catch(e){}drawActor();todo()});
function drawStaff(){drawActor();$('staffList').innerHTML=STAFF.length?STAFF.map(function(n,i){return'<span class="chip">'+esc(n)+'<button type="button" data-rm="'+i+'" aria-label="'+esc(n)+'を消す">×</button></span>'}).join(''):'<p class="hint">まだ登録されていません。</p>'}
$('staffAdd').addEventListener('click',function(){var v=$('staffNew').value.trim();if(!v)return;if(STAFF.indexOf(v)<0)STAFF.push(v);$('staffNew').value='';drawStaff()});
$('staffNew').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('staffAdd').click()}});
$('staffList').addEventListener('click',function(e){var b=e.target.closest('[data-rm]');if(!b)return;STAFF.splice(+b.dataset.rm,1);drawStaff()});
$('saveStaff').addEventListener('click',function(){var b=this;b.disabled=true;$('errSt').textContent='';api('admin.staffSet',{list:STAFF}).then(function(r){STAFF=r.staff||STAFF;drawStaff();$('errSt').textContent='保存しました。';drawIn();todo()}).catch(function(er){$('errSt').textContent=er.message}).then(function(){b.disabled=false})});
/* ---- 設定：提携先一覧 ---- */
var PF_EDIT=-1,PFK={name:'pfName',person:'pfPerson',email:'pfEmail',tel:'pfTel',area:'pfArea',note:'pfNote'};
function pfFill(a,b,c){var T=window.PARTNER_TAX||{};$('pfA').innerHTML=opt(Object.keys(T),a||'','選ぶ');$('pfB').innerHTML=opt(a&&T[a]?Object.keys(T[a]):[],b||'','選ぶ');$('pfB').disabled=!a;$('pfC').innerHTML=opt(a&&b&&T[a]&&T[a][b]?T[a][b]:[],c||'','（任意）');$('pfC').disabled=!b}
function pfSet(p,idx){p=p||{};PF_EDIT=idx==null?-1:idx;Object.keys(PFK).forEach(function(k){$(PFK[k]).value=p[k]||''});pfFill(p.a,p.b,p.c);$('pfSave').textContent=PF_EDIT>=0?'この内容で更新する':'この内容で登録する';$('errPt').textContent=''}
$('pfA').addEventListener('change',function(){pfFill(this.value,'','')});$('pfB').addEventListener('change',function(){pfFill($('pfA').value,this.value,'')});
$('pfClear').addEventListener('click',function(){pfSet({})});
function savePartners(list,msg){$('pfSave').disabled=true;return api('admin.partnerSet',{rows:list}).then(function(r){PARTNERS=r.partners||list;$('pfSave').disabled=false;drawPt();$('errPt').textContent=msg;drawIn();todo()},function(er){$('pfSave').disabled=false;$('errPt').textContent=er.message;throw er})}
$('pfSave').addEventListener('click',function(){var p={};Object.keys(PFK).forEach(function(k){p[k]=$(PFK[k]).value.trim()});p.a=$('pfA').value;p.b=$('pfB').value;p.c=$('pfC').value;
 if(!p.name){$('errPt').textContent='提携先の名前を入れてください。';$('pfName').focus();return}
 if(!p.a||!p.b){$('errPt').textContent='大分類と中分類を選んでください。';(p.a?$('pfB'):$('pfA')).focus();return}
 if(p.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)){$('errPt').textContent='メールアドレスの形を確かめてください（例：info@example.jp）。';$('pfEmail').focus();return}
 if(isStaff()){$('pfSave').disabled=true;api('admin.partnerAdd',{row:p}).then(function(r){PARTNERS=r.partners||PARTNERS;drawPt();pfSet({});$('errPt').textContent='登録しました：'+p.name+'（直す・消すときは管理者に頼んでください）'}).catch(function(er){$('errPt').textContent=er.message}).then(function(){$('pfSave').disabled=false});return}
 var list=PARTNERS.slice(),dup=-1;list.forEach(function(x,j){if(x.name===p.name)dup=j});
 if(PF_EDIT>=0){if(dup>=0&&dup!==PF_EDIT){$('errPt').textContent='「'+p.name+'」は別に登録されています。';return}p.since=list[PF_EDIT].since;p.by=list[PF_EDIT].by;p.state=list[PF_EDIT].state;list[PF_EDIT]=p}
 else{if(dup>=0){$('errPt').textContent='「'+p.name+'」はもう登録されています。下の一覧の「直す」から直してください。';return}p.by=ACTOR||MYNAME;p.state='登録済み';list.push(p)}
 var ed=PF_EDIT>=0;savePartners(list,(ed?'更新しました：':'登録しました：')+p.name+(p.email?'':'（メールが未登録のため、このままでは案件を送れません）')).then(function(){var m=$('errPt').textContent;pfSet({});$('errPt').textContent=m},function(){})});
function drawPt(){var fa=$('ptFA').value,q=$('ptQ').value.trim().toLowerCase(),T=window.PARTNER_TAX||{},cnt={};PARTNERS.forEach(function(p){cnt[p.a]=(cnt[p.a]||0)+1});
 $('ptFA').innerHTML='<option value="">すべて（'+PARTNERS.length+'）</option>'+Object.keys(T).map(function(a){return'<option value="'+esc(a)+'"'+(a===fa?' selected':'')+'>'+esc(a)+'（'+(cnt[a]||0)+'）</option>'}).join('');
 var rows=PARTNERS.map(function(p,i){return[p,i]}).filter(function(z){var p=z[0];return(!fa||p.a===fa)&&(!q||[p.name,p.person,p.area,p.note,p.email].join(' ').toLowerCase().indexOf(q)>=0)});
 $('ptCount').textContent=(isStaff()?'（あなたが登録した ':'（')+PARTNERS.length+'件・メール登録済み '+PARTNERS.filter(function(p){return p.email}).length+'件）';
 $('ptRows').innerHTML=rows.length?rows.map(function(z){var p=z[0];return'<tr><td><b>'+esc(p.name)+'</b>'+(p.person?'<br><small>'+esc(p.person)+'</small>':'')+'</td><td>'+esc(p.a)+'<br><small>'+esc(p.b)+(p.c?' ＞ '+esc(p.c):'')+'</small></td><td>'+(p.email?esc(p.email):'<span class="tg yel">メール未登録</span>')+(p.tel?'<br><small>'+esc(p.tel)+'</small>':'')+'</td><td><small>'+esc(p.area||'')+(p.area&&p.note?'<br>':'')+esc(p.note||'')+'</small></td><td><small>'+esc(p.by||'―')+(p.since?'<br>'+esc(p.since):'')+'</small>'+(p.by&&p.by===MYNAME?' <span class="st-mine">あなたが登録</span>':'')+(p.state==='確認待ち'?'<br><span class="st-wait">確認待ち（相手が記入）</span>':'')+'</td><td style="white-space:nowrap">'+(isStaff()?'':(p.state==='確認待ち'?'<button type="button" class="small-btn fw-b" data-ap="'+z[1]+'">確認して使えるようにする</button> ':'')+'<button type="button" class="small-btn" data-ed="'+z[1]+'">直す</button> <button type="button" class="small-btn" data-dl="'+z[1]+'">削除</button>')+'</td></tr>'}).join(''):'<tr><td colspan="6">'+(PARTNERS.length?'条件に合う提携先はありません':(isStaff()?'あなたが登録した提携先は、まだありません。':'まだ登録されていません。上のフォームから登録してください。'))+'</td></tr>'}
$('ptFA').addEventListener('change',drawPt);$('ptQ').addEventListener('input',drawPt);
$('ptRows').addEventListener('click',function(e){var b=e.target.closest('[data-ed],[data-dl],[data-ap]');if(!b||isStaff())return;
 if(b.dataset.ap!=null){var ai=+b.dataset.ap,ap=PARTNERS[ai];if(!confirm('「'+ap.name+'」の内容を確かめましたか？　確認すると、振分け先として選べるようになります。'))return;var al=PARTNERS.slice();al[ai]=Object.assign({},ap,{state:'登録済み'});savePartners(al,'使えるようにしました：'+ap.name).catch(function(){});return}if(b.dataset.ed!=null){pfSet(PARTNERS[+b.dataset.ed],+b.dataset.ed);flash($('ptForm'));$('pfName').focus();return}
 var i=+b.dataset.dl,p=PARTNERS[i];if(!confirm('「'+p.name+'」を提携先一覧から消しますか？（これまでの案件の記録は残ります）'))return;var list=PARTNERS.slice();list.splice(i,1);savePartners(list,'削除しました：'+p.name).catch(function(){})});
pfFill('','','');
/* ---- 提携先へ案件を送る（担当者が確かめ、同意を確認してから送る） ---- */
var FW=null;
function fwdLog(x){try{var l=JSON.parse(x.fwd||'[]');return Array.isArray(l)?l:[]}catch(e){return[]}}
function fwBody(x,p){var g=segOf(x),inc={};document.querySelectorAll('#fwd [data-inc]').forEach(function(c){inc[c.dataset.inc]=c.checked});
 var skip=/^(【|お名前|事業所名|メール|電話|通っている病院・施設)/,lines=String(x.body||'').split('\n').filter(function(l){return l.trim()&&!skip.test(l)}),info=[];
 if(inc.name){if(x.name)info.push('お名前：'+x.name);if(x.company)info.push('会社・事業所：'+x.company)}if(inc.email&&x.email)info.push('メール：'+x.email);if(inc.tel&&x.tel&&x.tel!=='（未入力）')info.push('電話：'+x.tel);
 if(inc.fac&&isFacSeg(x)){var f=facOf(x);if(f.member||f.name)info.push('通っている病院・施設：'+(f.member||f.name)+(f.addr?'（'+f.addr+'）':''))}
 return p.name+'\n'+(p.person?p.person.replace(/\s*様$/,'')+' 様':'ご担当者様')+'\n\nいつもお世話になっております。医療介護総合支援会です。\n下記のご相談について、ご対応をお願いできますでしょうか。\n'+(info.length?'お客様からは、貴社へ情報をお伝えすることのご了承をいただいております。\n':'')+
 '\n■受付番号：'+x.no+'\n■種別：'+g.name+'\n\n■ご相談の内容\n'+(lines.join('\n')||'（内容の記入なし）')+'\n\n■お客様の情報\n'+(info.length?info.join('\n'):'（ご連絡先はお伝えしていません。当会が間に入ってご連絡します）')+
 '\n\nご対応の可否と今後の進め方を、このメールへのご返信でお知らせください。\nお伝えした個人情報は、このご相談への対応のためだけにお使いください。\n\n――――――――――――――――\n医療介護総合支援会（運営 株式会社グローブ）\n'+(x.staff?'担当：'+x.staff+'\n':'')+'電話 0120-933-496（受付 10:00〜19:00）\nメール ikshienkai@gmail.com\n――――――――――――――――'}
function openFwd(x,name){$('errB').textContent='';
 if(!name||name==='自社'){$('errB').textContent='先に「振分け先」で提携先を選んでください。';return}
 var p=PARTNERS.filter(function(z){return z.name===name&&z.state!=='確認待ち'})[0];if(!p){$('errB').textContent='「'+name+'」は提携先一覧に登録されていない（または確認待ちの）ため送れません。設定の「提携先の登録」で登録すると送れます。';return}
 var SS=stepsOf(x),tg=SS.indexOf('提携先対応中')>=0?'提携先対応中':SS.indexOf('専門家・窓口へつないだ')>=0?'専門家・窓口へつないだ':'';FW={x:x,p:p,st:(tg&&SS.indexOf(x.status)<SS.indexOf(tg))?tg:''};
 $('fwdTo').innerHTML='送り先：<b>'+esc(p.name)+'</b>'+(p.person?'（'+esc(p.person)+' 様）':'')+'　'+(p.email?esc(p.email):'<span class="tg red">メール未登録</span>')+'<br>送ったメールの写しは、当会のメールにも届きます。返信は当会のメールに届きます。';
 var w=[];if(!p.email)w.push('この提携先はメールアドレスが登録されていません。設定の「提携先の登録」で「直す」から登録してください。');
 if(isFacSeg(x)&&facOf(x).m!=='会員の病院・施設')w.push('会員施設の確認が「'+facOf(x).m+'」です。会員施設かを確かめてから送ってください。');
 var fl=fwdLog(x);if(fl.length)w.push('この案件は、'+fl.map(function(z){return dt(z.ts)+' '+z.name}).join('、')+' に送ったことがあります。');
 $('fwdWarn').hidden=!w.length;$('fwdWarn').innerHTML=w.map(esc).join('<br>');$('fwIncFac').hidden=!isFacSeg(x);
 document.querySelectorAll('#fwd [data-inc]').forEach(function(c){c.checked=true});
 $('fwdS').value='【医療介護総合支援会】ご相談のご依頼（受付番号 '+x.no+'）';$('fwdB').value=fwBody(x,p);
 $('fwdOk').checked=false;$('fwSend').disabled=true;$('fwdSt').checked=!!FW.st;$('fwdSt').parentNode.hidden=!FW.st;$('fwdStL').textContent='送ったら、状態を「'+FW.st+'」にする';$('errFw').textContent='';$('fwd').hidden=false;$('fwdB').scrollTop=0;$('fwdOk').focus()}
document.querySelectorAll('#fwd [data-inc]').forEach(function(c){c.addEventListener('change',function(){if(FW)$('fwdB').value=fwBody(FW.x,FW.p)})});
$('fwdOk').addEventListener('change',function(){$('fwSend').disabled=!this.checked||!FW||!FW.p.email});
$('fwCancel').addEventListener('click',function(){$('fwd').hidden=true});
$('fwSend').addEventListener('click',function(){var b=this,x=FW.x,p=FW.p;if(!$('fwdOk').checked||!p.email)return;if(!confirm('「'+p.name+'」（'+p.email+'）へ、この内容を送ります。よろしいですか？'))return;b.disabled=true;b.textContent='送っています…';
 api('admin.forward',{no:x.no,partner:p.name,subject:$('fwdS').value,body:$('fwdB').value,consent:true,status:$('fwdSt').checked?FW.st:'',staff:x.staff}).then(function(r){x.fwd=r.fwd||x.fwd;x.partner=p.name;if($('fwdSt').checked&&FW.st)x.status=FW.st;x.updated=new Date().toISOString();$('fwd').hidden=true;drawIn();todo();$('errB').textContent='「'+p.name+'」へ送りました（対応の履歴に記録しました）。'})
 .catch(function(er){$('errFw').textContent=er.message}).then(function(){b.textContent='確認して送る';b.disabled=!$('fwdOk').checked})});
/* ---- 担当者のログインID（管理者） ---- */
var ACCS=[];
function loadAcc(){api('admin.accList').then(function(r){ACCS=r.accounts||[];drawAcc()}).catch(function(e){$('errAc').textContent=e.message})}
function drawAcc(){$('accRows').innerHTML=ACCS.length?ACCS.map(function(a){return'<tr><td><b>'+esc(a.name)+'</b></td><td>'+esc(a.id)+'</td><td>'+(a.active?'使用中':'<span class="st-wait">停止中</span>')+'</td><td>'+(a.last?dt(a.last):'―')+'</td><td style="white-space:nowrap"><button type="button" class="small-btn" data-acpw="'+esc(a.id)+'">パスワードを再設定</button> <button type="button" class="small-btn" data-acon="'+esc(a.id)+'" data-v="'+(a.active?'0':'1')+'">'+(a.active?'止める':'使えるようにする')+'</button><div class="acpw" hidden style="margin-top:8px"><input type="password" autocomplete="new-password" maxlength="100" placeholder="新しいパスワード（8文字以上）" data-acnew="'+esc(a.id)+'"> <button type="button" class="small-btn fw-b" data-acdo="'+esc(a.id)+'">再設定する</button></div></td></tr>'}).join(''):'<tr><td colspan="5">まだ担当者のIDはありません。下から追加してください。</td></tr>'}
$('acAdd').addEventListener('click',function(){var b=this,n=$('acName').value.trim(),id=$('acId').value.trim(),pw=$('acPw').value;$('errAc').textContent='';
 if(!n||!id||!pw){$('errAc').textContent='名前・ログインID・はじめのパスワードを入れてください。';return}if(!/^[A-Za-z0-9._-]{3,30}$/.test(id)){$('errAc').textContent='ログインIDは、半角の英字・数字（3〜30文字）で決めてください。';return}if(pw.length<8){$('errAc').textContent='パスワードは8文字以上にしてください。';return}
 b.disabled=true;api('admin.accSet',{op:'add',name:n,id:id,pass:pw}).then(function(r){ACCS=r.accounts||[];drawAcc();$('acName').value=$('acId').value=$('acPw').value='';$('errAc').textContent='追加しました：'+n+'（ID：'+id+'）。はじめのパスワードを本人に伝えてください。';if(STAFF.indexOf(n)<0){STAFF.push(n);drawStaff()}}).catch(function(er){$('errAc').textContent=er.message}).then(function(){b.disabled=false})});
$('accRows').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;$('errAc').textContent='';
 if(b.dataset.acpw){var box=b.parentNode.querySelector('.acpw');box.hidden=!box.hidden;if(!box.hidden)box.querySelector('input').focus();return}
 if(b.dataset.acdo){var inp=b.parentNode.querySelector('input'),pw=inp.value;if(pw.length<8){$('errAc').textContent='パスワードは8文字以上にしてください。';return}api('admin.accSet',{op:'reset',id:b.dataset.acdo,pass:pw}).then(function(r){ACCS=r.accounts||[];drawAcc();$('errAc').textContent='パスワードを再設定しました。新しいパスワードを本人に伝えてください。'}).catch(function(er){$('errAc').textContent=er.message});return}
 if(b.dataset.acon){var on=b.dataset.v==='1';if(!on&&!confirm('このIDを止めますか？　止めると、その担当者はログインできなくなります。'))return;api('admin.accSet',{op:'active',id:b.dataset.acon,active:on}).then(function(r){ACCS=r.accounts||[];drawAcc()}).catch(function(er){$('errAc').textContent=er.message})}});
$('mpSave').addEventListener('click',function(){var b=this,c=$('mpCur').value,n1=$('mpNew').value,n2=$('mpNew2').value;$('errMp').textContent='';
 if(!c){$('errMp').textContent='いまのパスワードを入れてください。';return}if(n1.length<8){$('errMp').textContent='新しいパスワードは8文字以上にしてください。';return}if(n1!==n2){$('errMp').textContent='2つの新しいパスワードが合っていません。';return}
 b.disabled=true;api('admin.passwd',{cur:c,pass:n1}).then(function(){$('mpCur').value=$('mpNew').value=$('mpNew2').value='';$('errMp').textContent='パスワードを変えました。次のログインから新しいパスワードを使ってください。'}).catch(function(er){$('errMp').textContent=er.message}).then(function(){b.disabled=false})});
$('piSend').addEventListener('click',function(){var b=this,n=$('piName').value.trim(),em=$('piEmail').value.trim();$('errPi').textContent='';
 if(!n){$('errPi').textContent='相手の会社名・お名前を入れてください。';return}if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$('errPi').textContent='相手のメールアドレスを正しく入れてください。';return}
 if(!confirm('「'+n+'」（'+em+'）へ、提携先の登録フォームをメールで送ります。よろしいですか？'))return;
 b.disabled=true;api('admin.partnerInvite',{name:n,email:em,message:$('piMsg').value.trim()}).then(function(){$('errPi').textContent='送りました：'+n+'（'+em+'）。相手が記入すると、提携先一覧に「確認待ち」で入ります。';$('piName').value=$('piEmail').value=$('piMsg').value=''}).catch(function(er){$('errPi').textContent=er.message}).then(function(){b.disabled=false})});
/* ---- 対応ログ ---- */
var LOGS=[],LROWS=[],LOADED=false;
function loadLog(){$('errLog').textContent='';$('logBody').innerHTML='<tr><td colspan="6">読み込み中…</td></tr>';api('admin.log').then(function(r){LOGS=r.rows||[];LOADED=true;drawLog()}).catch(function(e){$('errLog').textContent=e.message})}
function drawLog(){var pd=+$('lgP').value||0,ar=$('lgA').value,q=$('lgQ').value.trim().toLowerCase(),now=Date.now(),ws={},cw=$('lgW').value;
 LOGS.forEach(function(x){var w=x.actor||'（記録なし）';ws[w]=(ws[w]||0)+1});
 $('lgW').innerHTML='<option value="">すべて</option>'+Object.keys(ws).sort().map(function(w){return'<option'+(w===cw?' selected':'')+'>'+esc(w)+'</option>'}).join('');var ac=$('lgW').value;
 LROWS=LOGS.filter(function(x){if(pd&&now-new Date(x.ts)>pd*864e5)return false;if(ar&&x.area!==ar)return false;if(ac&&(x.actor||'（記録なし）')!==ac)return false;return!q||[x.no,x.kind,x.text,x.staff,x.actor].join(' ').toLowerCase().indexOf(q)>=0});
 $('lgCount').textContent='表示中 '+LROWS.length+' 件'+(LROWS.length>500?'（画面には新しい500件まで。すべてはファイルに保存できます）':'');
 var AC={'案件':'','受付':'k4','電子契約':'k2','設定':'k3','ログイン':'k5'};
 $('logBody').innerHTML=LROWS.slice(0,500).map(function(x){var t=String(x.text||''),f=t.split('\n')[0];
  return'<tr><td style="white-space:nowrap">'+dt(x.ts)+'</td><td><span class="kd '+(AC[x.area]||'')+'">'+esc(x.area||'')+'</span></td><td style="white-space:nowrap">'+(x.no?(/^IKK-/.test(x.no)?esc(x.no):'<button type="button" class="lnk" data-go="'+esc(x.no)+'">'+esc(x.no)+'</button>'):'―')+'</td><td><b>'+esc(x.kind)+'</b></td><td>'+(t.indexOf('\n')>=0||t.length>70?'<details><summary>'+esc(f.slice(0,70))+(f.length>70?'…':'')+'</summary><pre class="lg-pre">'+esc(t)+'</pre></details>':esc(t))+'</td><td>'+esc(x.actor||'―')+(x.staff&&x.staff!==x.actor?'<span class="sm">担当 '+esc(x.staff)+'</span>':'')+'</td></tr>'}).join('')||'<tr><td colspan="6">'+(LOGS.length?'条件に合う記録はありません':'まだ記録はありません')+'</td></tr>'}
['lgP','lgA','lgW'].forEach(function(id){$(id).addEventListener('change',drawLog)});$('lgQ').addEventListener('input',drawLog);$('lgReload').addEventListener('click',loadLog);
document.querySelector('.tab[data-v="log"]').addEventListener('click',function(){if(!LOADED)loadLog();else drawLog()});
$('logBody').addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(!b)return;goTab('inbox');SEG='all';['fCt','fPt'].forEach(function(i){$(i).value=''});drawIn();$('fSt').value='all';$('fQ').value=b.dataset.go;OPEN[b.dataset.go]=true;drawIn();window.scrollTo(0,$('inbox').getBoundingClientRect().top+scrollY-120)});
$('lgCsv').addEventListener('click',function(){var H=['日時','区分','番号','したこと','内容','操作した人','担当'],R=LROWS.map(function(x){var d=new Date(x.ts);return[d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2),x.area,x.no,x.kind,x.text,x.actor,x.staff]});
 var csv='\ufeff'+[H].concat(R).map(function(r){return r.map(function(v){v=String(v==null?'':v);return/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')}).join('\r\n');
 var u=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),l=document.createElement('a');l.href=u;l.download='対応ログ_'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(l);l.click();setTimeout(function(){URL.revokeObjectURL(u);l.remove()},1500)});
/* ---- 会員・相談者の名簿 ---- */
var RS='member',RF={};
function members(){return(KL||[]).filter(function(x){return(x.template==='kaiin'||x.template==='kojin')&&x.status!=='取り消し'&&x.draft!=='yes'}).map(function(x){var t=x.template==='kojin'?'個人会員（営業協力者）':(x.typeLabel||'会員');
 var st=x.stopped?'退会':x.template==='kaiin'?(x.paid?'登録済み':x.status==='締結済み'?'入金待ち':'手続き中'):(x.status==='締結済み'?'登録済み':'手続き中');
 return{name:x.party_name,company:x.party_company,email:x.party_email,tel:x.phone||'',type:t,pay:x.template==='kojin'?'―':(x.pay==='year'?'年間払い':'月払い'),status:st,date:x.signed||x.created,ref:x.refcode||'',id:x.id}})}
function people(){var m={};IN.slice().sort(function(a,b){return new Date(a.ts)-new Date(b.ts)}).forEach(function(x){var c=cls(x),key=(x.email||'').toLowerCase()||(x.name+'|'+x.tel+'|'+x.no);
 var p=m[key]||(m[key]={name:'',company:'',email:x.email,tel:'',cases:[]});p.name=x.name||p.name;p.company=x.company||p.company;p.tel=x.tel||p.tel;p.cases.push(x);p.last=x;p.c=c});
 return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return new Date(b.last.ts)-new Date(a.last.ts)})}
function pMatch(p){if(RF.kind&&!p.cases.some(function(x){var c=cls(x);return c.kind===RF.kind&&(!RF.role||c.role===RF.role)&&(!RF.cat||catOf(c)===RF.cat)}))return false;return true}
function mMatch(m){return(!RF.type||m.type===RF.type)&&(!RF.status||m.status===RF.status)&&(!RF.pay||m.pay===RF.pay)}
function tb(lv,label,n,f){var on=JSON.stringify(f)===JSON.stringify(RF);return'<button type="button" class="l'+lv+(on?' on':'')+'" data-f=\''+esc(JSON.stringify(f))+'\'><span>'+esc(label)+'</span><b>'+n+'</b></button>'}
var RROWS=[];
function drawRoster(){if(!$('rBody'))return;var q=$('rQ').value.trim().toLowerCase(),T='';
 if(RS==='member'){var M=members(),by=function(k){var o={};M.forEach(function(m){o[m[k]]=(o[m[k]]||0)+1});return o};
  T=tb(1,'すべての会員',M.length,{});[['type','会員の種類'],['status','状態'],['pay','支払い方法']].forEach(function(g){var o=by(g[0]);T+='<h4>'+g[1]+'</h4>'+Object.keys(o).sort().map(function(k){var f={};f[g[0]]=k;return tb(2,k,o[k],f)}).join('')});
  RROWS=M.filter(mMatch).filter(function(m){return!q||[m.name,m.company,m.email,m.tel,m.ref].join(' ').toLowerCase().indexOf(q)>=0});
  $('rHead').innerHTML='<tr><th>お名前・会社</th><th>会員の種類</th><th>支払い</th><th>状態</th><th>登録日</th><th>連絡先</th><th>紹介コード</th></tr>';
  $('rBody').innerHTML=RROWS.map(function(m){return'<tr><td>'+esc(m.name)+(m.company?'<br><small>'+esc(m.company)+'</small>':'')+'</td><td>'+esc(m.type)+'</td><td>'+esc(m.pay)+'</td><td><span class="st'+(m.status==='退会'?' s6':m.status==='入金待ち'?' s0':'')+'">'+esc(m.status)+'</span></td><td>'+day(m.date)+'</td><td><a href="mailto:'+esc(m.email)+'">'+esc(m.email)+'</a>'+(m.tel?'<br>'+esc(m.tel):'')+'</td><td>'+esc(m.ref||'―')+'</td></tr>'}).join('')||'<tr><td colspan="7">該当する会員はいません</td></tr>'}
 else{var P=people(),tr={};P.forEach(function(p){var seen={};p.cases.forEach(function(x){var c=cls(x),k=c.kind+'|'+c.role+'|'+catOf(c);if(seen[k])return;seen[k]=1;var a=tr[c.kind]||(tr[c.kind]={n:0,r:{}});a.n++;var rk=c.role||'';var b=a.r[rk]||(a.r[rk]={n:0,c:{}});b.n++;var ck=catOf(c)||'（分類なし）';b.c[ck]=(b.c[ck]||0)+1})});
  T=tb(1,'すべての相談者・申込者',P.length,{});['相談','会員登録','提携・協業','要望'].forEach(function(k){var a=tr[k];if(!a)return;T+='<h4>'+k+'</h4>'+tb(1,k+'（すべて）',a.n,{kind:k});Object.keys(a.r).sort().forEach(function(rk){var b=a.r[rk];if(rk)T+=tb(2,rk,b.n,{kind:k,role:rk});Object.keys(b.c).sort().forEach(function(ck){var f={kind:k};if(rk)f.role=rk;f.cat=ck==='（分類なし）'?'':ck;T+=tb(rk?3:2,ck,b.c[ck],f)})})});
  RROWS=P.filter(pMatch).filter(function(p){return!q||[p.name,p.company,p.email,p.tel].join(' ').toLowerCase().indexOf(q)>=0});
  $('rHead').innerHTML='<tr><th>お名前・会社</th><th>連絡先</th><th>種類</th><th>立場・分類</th><th>件数</th><th>最終受付</th><th>最新の状態</th><th></th></tr>';
  $('rBody').innerHTML=RROWS.map(function(p){var c=cls(p.last);return'<tr><td>'+esc(p.name||'（お名前なし）')+(p.company?'<br><small>'+esc(p.company)+'</small>':'')+'</td><td>'+(p.email?'<a href="mailto:'+esc(p.email)+'">'+esc(p.email)+'</a>':'')+(p.tel&&p.tel!=='（未入力）'?'<br>'+esc(p.tel):'')+'</td><td><span class="kd '+(KCLS[c.kind]||'')+'">'+esc(c.kind)+'</span></td><td>'+esc(c.role)+(catOf(c)?'<br><small>'+esc(catOf(c))+'</small>':'')+'</td><td>'+p.cases.length+'</td><td>'+day(p.last.ts)+'</td><td><span class="st '+stCls(p.last)+'">'+esc(p.last.status)+'</span></td><td><button type="button" class="small-btn" data-go="'+esc(p.last.no)+'">案件を見る</button></td></tr>'}).join('')||'<tr><td colspan="8">該当する人はいません</td></tr>'}
 $('rTree').innerHTML=T;$('rCount').textContent='表示中 '+RROWS.length+' 人'}
document.querySelectorAll('[data-rs]').forEach(function(b){b.addEventListener('click',function(){RS=b.dataset.rs;RF={};document.querySelectorAll('[data-rs]').forEach(function(z){z.classList.toggle('on',z===b)});drawRoster()})});
$('rTree').addEventListener('click',function(e){var b=e.target.closest('[data-f]');if(!b)return;RF=JSON.parse(b.dataset.f);drawRoster()});
$('rQ').addEventListener('input',drawRoster);
$('rBody').addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(!b)return;goTab('inbox');SEG='all';['fCt','fPt'].forEach(function(i){$(i).value=''});drawIn();$('fSt').value='all';$('fQ').value=b.dataset.go;OPEN[b.dataset.go]=true;drawIn();window.scrollTo(0,$('inbox').getBoundingClientRect().top+scrollY-120)});
$('rCsv').addEventListener('click',function(){var H,R;if(RS==='member'){H=['お名前','会社','会員の種類','支払い','状態','登録日','メール','電話','紹介コード','契約番号'];R=RROWS.map(function(m){return[m.name,m.company,m.type,m.pay,m.status,day(m.date),m.email,m.tel,m.ref,m.id]})}else{H=['お名前','会社','メール','電話','種類','立場','分類','件数','最終受付','最新の状態','最新の受付番号'];R=RROWS.map(function(p){var c=cls(p.last);return[p.name,p.company,p.email,p.tel,c.kind,c.role,catOf(c),p.cases.length,day(p.last.ts),p.last.status,p.last.no]})}
 var csv='﻿'+[H].concat(R).map(function(r){return r.map(function(v){v=String(v==null?'':v);return/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')}).join('\r\n');
 var u=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),l=document.createElement('a');l.href=u;l.download=(RS==='member'?'会員名簿':'相談者名簿')+'_'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(l);l.click();setTimeout(function(){URL.revokeObjectURL(u);l.remove()},1500)});
function loadMine(){api('admin.partnersMine').then(function(r){PARTNERS=r.partners||[];drawPt();todo()}).catch(function(e){$('errPt').textContent=e.message})}
var started=false;function go(){if(started){list();if(isStaff())loadMine();else{inbox();loadAcc()}return}started=true;
 api('admin.me').then(function(r){ROLE=r.role||'admin';MYNAME=r.name||'';applyRole();start();if(isStaff())loadMine();else{inbox();loadAcc()}go2()}).catch(function(e){$('panel').hidden=false;$('errB').textContent=e.message})}
function go2(){var seen='';try{seen=localStorage.getItem('iryo-adm-tour')||''}catch(x){}if(!seen){var nb=document.createElement('p');nb.className='note';nb.id='tourNote';nb.innerHTML='はじめての方は、右上の<b>「はじめての方へ：操作の案内」</b>を押してください。画面の見方を順番にご案内します（約1分）。';$('todo').insertBefore(nb,$('todoList'));$('tourBtn').classList.add('flash')}}
document.querySelectorAll('.tab').forEach(function(t){t.addEventListener('click',function(){document.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('on',x===t)});document.querySelectorAll('[data-view]').forEach(function(v){v.hidden=v.dataset.view!==t.dataset.v})})});
var IN=[],STEPS=['新規受付','内容確認中','振分け済み','提携先対応中','提案・見積り中','完了','見送り'],ROUTES={},H=36e5,SND=true,lastRed=-1;
var SEGS=window.CASE_SEGS||[],SEG='all';try{SEG=localStorage.getItem('iryo-seg')||'all'}catch(e){}
var SEGC={kigyo:'',hataraku:'k6',honnin:'k2',kazoku:'k7',none:'',teikei:'k3',youbou:'k4',kaiin:'k5'};
function segOf(x){if(x._s)return x._s;var lb=String(x.label||''),i=lb.indexOf('：'),t=(i>=0?lb.slice(i+1):lb).split('／')[0];var s=SEGS.filter(function(g){return g.match.indexOf(t)>=0})[0]||SEGS.filter(function(g){return g.key==='none'})[0];x._s=s;return s}
function segBy(k){return SEGS.filter(function(g){return g.key===k})[0]}
function stepsOf(x){var l=segOf(x).steps.slice();if(x.status&&l.indexOf(x.status)<0)l.splice(1,0,x.status);return l}
function isEnd(x){var g=segOf(x);return g.done.indexOf(x.status)>=0||x.status==='完了'||x.status==='見送り'}
function stCls(x){return x.status==='新規受付'?'s0':isEnd(x)?'s5':''}
function isFacSeg(x){var k=segOf(x).key;return k==='honnin'||k==='kazoku'}
function facOf(x){if(x._f)return x._f;var f=null;try{f=x.fac?JSON.parse(x.fac):null}catch(e){}if(!f){f={m:'未確認',kind:'',name:'',addr:'',member:''};var m=String(x.body||'').match(/通っている病院・施設：([^\n]*)/);if(m){var t=m[1],a=t.match(/（([^）]*)）$/);if(a){f.addr=a[1];t=t.slice(0,a.index)}var p=t.split('／');f.kind=(p[0]||'').trim();f.name=p.slice(1).join('／').trim();if(/まだどこにも/.test(f.kind))f.m='通っている先がない'}}x._f=f;return f}
var FAC_M=['未確認','会員の病院・施設','会員ではない','通っている先がない'],FAC_S={'未確認':'未確認','会員の病院・施設':'会員','会員ではない':'会員外','通っている先がない':'通院先なし'},FAC_K=['病院','クリニック・診療所','介護施設（入所・入居）','デイサービス・訪問介護などの事業所','訪問看護・在宅医療','薬局','居宅介護支援事業所（ケアマネジャー）','まだどこにも通っていない・決まっていない'],FAC_P=['施設へ会員制度を案内する','近くの会員の病院・施設を紹介する','当会で直接対応する','対応を見送る'],FAC_H=['会員名簿で確かめた','施設に電話で確かめた','ご本人・ご家族に確かめた','ケアマネジャーに確かめた'];
function facHtml(x){if(!isFacSeg(x))return'';var f=facOf(x);
 var sel=function(k,l,cur,ph){return'<select data-fc="'+k+'">'+(ph?'<option value="">'+ph+'</option>':'')+l.map(function(v){return'<option'+(v===cur?' selected':'')+'>'+esc(v)+'</option>'}).join('')+'</select>'},inp=function(k,cur,ph,ls){return'<input type="text" data-fc="'+k+'" value="'+esc(cur||'')+'" placeholder="'+ph+'"'+(ls?' list="'+ls+'"':'')+' maxlength="100">'};
 return'<div class="fac-box" data-m="'+esc(f.m)+'"><label>会員施設の確認 <span class="req">※必須</span>'+(f.auto?' <span class="hint">（会員名簿と名前が一致したので「会員」にしています。念のため確かめてください）</span>':'')+'</label><p class="hint" style="margin:2px 0 0">利用者・ご本人とご家族の相談は、通っている病院・クリニック・施設が会員であることが前提です。</p>'+
 '<div class="fac-g"><div><small>確認の結果</small>'+sel('m',FAC_M,f.m,'')+'</div><div><small>確認の方法</small>'+sel('how',FAC_H,f.how||'','（選ぶ）')+'</div><div class="fc-mem"><small>会員の名前（会員名簿から選ぶ）</small>'+inp('member',f.member,'会員の病院・施設名','memList')+'</div></div>'+
 '<div class="fac-g"><div><small>通っている先の種類</small>'+sel('kind',FAC_K,f.kind,'（選ぶ）')+'</div><div><small>病院・施設の名前</small>'+inp('name',f.name,'例：〇〇クリニック')+'</div><div><small>所在地</small>'+inp('addr',f.addr,'例：大阪市北区')+'</div><div><small>先方の担当者（ケアマネなど）</small>'+inp('person',f.person,'例：〇〇様（ケアマネジャー）')+'</div><div><small>先方の電話</small>'+inp('tel',f.tel,'例：06-0000-0000')+'</div></div>'+
 '<div class="fac-g fc-non"><div><small>会員ではない場合の対応 <span class="req">※必須</span></small>'+sel('plan',FAC_P,f.plan||'','（選ぶ）')+'</div><div><small>確認のメモ</small>'+inp('memo',f.memo,'例：施設長に会員制度を案内、来週お返事')+'</div></div>'+
 '<p class="err fac-err" role="alert"></p><input type="hidden" data-k="fac" value="'+esc(x.fac||'')+'"></div>'}
function needPt(x){var g=segOf(x);return g.route==='partner'&&!x.partner&&g.need.indexOf(x.status)>=0}
var STEP_DESC={'新規受付':'サイトから届いたまま（まだ読んでいない）','内容確認中':'内容を読んだ。相手に確認している','ヒアリング・面談':'課題を詳しく聞くため、面談や電話をしている','振分け済み':'どの提携先に任せるか決めた','提携先対応中':'提携先が相手とやりとりしている','提案・見積り中':'相手が提案や見積りを検討している','契約・導入の準備中':'契約・導入に向けて準備している','会員施設の確認':'通っている病院・施設が会員かを確かめている','お話を伺っている':'悩みや状況を聞いている','専門家・窓口へつないだ':'社労士・弁護士や公的な窓口などを案内した','継続して相談中':'引き続き相談にのっている','状況の聞き取り':'体の状態・暮らし・希望などを聞いている','利用・手続きの準備中':'サービスの利用や手続きの準備をしている','面談日の調整中':'面談の日時を決めている','面談済み':'面談を終えた','社内で検討中':'当会の中で検討している','契約の手続き中':'提携の契約書を送り、手続きをしている','提携開始':'提携が決まった（提携先一覧へ登録する）','対応を決めた':'要望への対応を決めた','対応済み':'要望への対応が終わった','契約書を送った':'電子契約で契約書を送った','入金待ち':'契約が済み、入金を待っている','登録完了':'入金を確かめ、会員登録が済んだ','完了':'対応が終わった','見送り':'相手の都合などで進めない'};
function setSeg(k){SEG=k;try{localStorage.setItem('iryo-seg',k)}catch(e){}$('fSt').value='';$('fCt').value='';$('fFac').value='';$('fPt').value='';drawIn()}
try{SND=localStorage.getItem('iryo-snd')!=='off'}catch(x){}
function sndBtn(){$('snd').textContent='警告音：'+(SND?'オン':'オフ');$('snd').setAttribute('aria-pressed',SND)}sndBtn();
$('snd').addEventListener('click',function(){SND=!SND;try{localStorage.setItem('iryo-snd',SND?'on':'off')}catch(x){}sndBtn();if(SND)beep()});
function beep(){try{var A=window.AudioContext||window.webkitAudioContext,c=new A();[0,.35,.7].forEach(function(t){var o=c.createOscillator(),g=c.createGain();o.frequency.value=880;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.18,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.3);o.start(c.currentTime+t);o.stop(c.currentTime+t+.32)})}catch(x){}}
function dt(s){var d=new Date(s);return isNaN(d)?'':(d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function span(ms){var d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/H);return d?d+'日'+h+'時間':h+'時間'}
function open_(x){return!isEnd(x)}
function alerts(x){var a=[],now=Date.now();if(!open_(x))return a;
 if(x.status==='新規受付'){var g=now-new Date(x.ts);a.push({lv:g>24*H?'red':'yel',t:g>24*H?'未対応 '+span(g):'未対応'})}
 var idle=(now-new Date(x.updated||x.ts))/864e5;if(x.status!=='新規受付'&&idle>=7)a.push({lv:'red',t:'放置 '+Math.floor(idle)+'日'});else if(x.status!=='新規受付'&&idle>=3)a.push({lv:'yel',t:'進捗の記録なし '+Math.floor(idle)+'日'});
 if(x.next&&new Date(x.next+'T23:59:59')<new Date())a.push({lv:'red',t:'予定日を過ぎた（'+x.next.slice(5).replace('-','/')+'）'});
 if(x.status!=='新規受付'&&x.email){var lc=x.contacted?(now-new Date(x.contacted))/864e5:(now-new Date(x.ts))/864e5;if(lc>=7)a.push({lv:'yel',t:'お客様へ'+Math.floor(lc)+'日報告なし'})}
 if(needPt(x))a.push({lv:'yel',t:'振分け先が未設定'});
 if(isFacSeg(x)){var fc=facOf(x);if(fc.m==='未確認'&&x.status!=='新規受付')a.push({lv:'yel',t:'会員施設が未確認'});if((fc.m==='会員ではない'||fc.m==='通っている先がない')&&!fc.plan)a.push({lv:'yel',t:'会員外：対応を決める'})}
 return a}
var KCLS={'相談':'','会員登録':'k2','提携・協業':'k3','要望':'k4'},OPEN={},VM='list';try{VM=localStorage.getItem('iryo-vm')||'list'}catch(e){}
function cls(x){if(x._c)return x._c;var lb=String(x.label||''),i=lb.indexOf('：'),t=i>=0?lb.slice(i+1):lb,p=t.split('／'),a=p[0]||'',b=p[1]||'',c={kind:'相談',role:'',big:'',path:[],sub:''};
 if(a==='提携・協業の申し込み'){c.kind='提携・協業';c.sub=b}else if(a==='要望・ご意見'){c.kind='要望';c.sub=b}else if(a==='会員登録'){c.kind='会員登録';c.sub=b}else{c.role=a;c.big=(b&&b!=='相談')?b:''}
 String(x.body||'').split('\n').forEach(function(l){var m=l.match(/^(相談の内容|分野) \d+：(.+)$/);if(m)c.path.push(m[2].trim())});
 if(!c.big&&c.path[0])c.big=c.path[0].split(' ＞ ')[0];x._c=c;return c}
function catOf(c){return c.kind==='相談'?c.big:(c.big||c.sub)}
function tableHtml(rows){var now=Date.now();return'<div class="tbl"><table class="ctbl"><thead><tr><th>受付</th><th>種別</th><th>内容・分類</th><th>お名前・会社</th><th>状態</th><th>振分け先</th><th>注意</th></tr></thead><tbody>'+rows.map(function(x,ri){var c=cls(x),g=segOf(x),op=OPEN[x.no];
 return'<tr class="cr'+(ri%2?' z':'')+(x.status==='新規受付'?' new':'')+(op?' open':'')+'" data-row="'+esc(x.no)+'" title="押すと詳しい内容と操作が開きます"><td>'+dt(x.ts)+'<span class="sm">'+span(now-new Date(x.ts))+'前</span></td><td><span class="kd '+(SEGC[g.key]||'')+'">'+esc(g.name)+'</span>'+(c.sub&&g.key!=='kaiin'?'':(c.sub?'<span class="sm">'+esc(c.sub)+'</span>':''))+'</td><td>'+(c.path.length?esc(c.path[0])+(c.path.length>1?'<span class="sm">ほか'+(c.path.length-1)+'件</span>':''):esc(c.big||c.sub||'―'))+(isFacSeg(x)?'<span class="sm">通院先：'+esc(facOf(x).member||facOf(x).name||'―')+'（<b style="color:'+(facOf(x).m==='会員の病院・施設'?'#1e5b34':'#8a1c1c')+'">'+FAC_S[facOf(x).m]+'</b>）</span>':'')+'</td><td>'+esc(x.name||'（お名前なし）')+(x.company?'<span class="sm">'+esc(x.company)+'</span>':'')+'</td><td><span class="st '+stCls(x)+'">'+esc(x.status)+'</span>'+(function(){var l=ctsOf(x);if(!l.length)return'';var c=l[0];return'<span class="sm"><span class="ct-st '+ctCls(c)+'">契約：'+esc(ctSt(c))+'</span>'+(l.length>1?' ほか'+(l.length-1)+'件':'')+'</span>'})()+'</td><td>'+esc(x.partner==='自社'?'自社（当会）':(x.partner||'―'))+(fwdLog(x).length?'<span class="sm">送付済み '+dt(fwdLog(x).slice(-1)[0].ts)+'</span>':'')+'</td><td>'+x._a.map(function(y){return'<span class="tg '+(y.lv==='red'?'red':'yel')+'">'+esc(y.t)+'</span>'}).join(' ')+'</td></tr>'+(op?'<tr class="cd"><td colspan="7">'+cardHtml(x)+'</td></tr>':'')}).join('')+'</tbody></table></div>'}
function fillSel(id,o){var cur=$(id).value;$(id).innerHTML='<option value="">すべて</option>'+Object.keys(o).sort().map(function(k){return'<option value="'+esc(k)+'"'+(k===cur?' selected':'')+'>'+esc(k)+'（'+o[k]+'）</option>'}).join('')}
function inbox(){api('admin.cases').then(function(r){IN=r.rows||[];ROUTES=r.routes||{};PARTNERS=r.partners||[];STAFF=r.staff||[];drawRoute();drawStaff();drawPt();drawIn();todo();drawRoster()}).catch(function(e){$('errB').textContent=e.message})}
function drawIn(){var pt=$('fPt').value,q=$('fQ').value.trim().toLowerCase();
 var red=0,nw=0;IN.forEach(function(x){x._a=alerts(x);if(x._a.some(function(y){return y.lv==='red'}))red++;if(x.status==='新規受付')nw++});
 $('newCnt').hidden=!nw;$('newCnt').textContent=nw;
 $('alertBar').hidden=!red;$('alertBar').textContent='対応が遅れている案件が '+red+' 件あります。赤い印の案件から対応してください。';
 if(red&&SND&&red!==lastRed)beep();lastRed=red;
 var base=SEG==='all'?IN:IN.filter(function(x){return segOf(x).key===SEG});if(SEG!=='all'&&!segBy(SEG)){SEG='all';base=IN}
 var sc={};IN.forEach(function(x){var k=segOf(x).key,o=sc[k]||(sc[k]={n:0,o:0,nw:0});o.n++;if(open_(x))o.o++;if(x.status==='新規受付')o.nw++});
 var allNw=IN.filter(function(x){return x.status==='新規受付'}).length,allO=IN.filter(open_).length;
 $('segBar').innerHTML='<button type="button" data-sg="all"'+(SEG==='all'?' class="on"':'')+'>すべて<b>進行中 '+allO+'</b>'+(allNw?'<i>新 '+allNw+'</i>':'')+'</button>'+SEGS.map(function(g,ix){var o=sc[g.key]||{n:0,o:0,nw:0};return(g.key==='teikei'?'<span class="gap"></span>':'')+'<button type="button" data-sg="'+g.key+'" class="'+(SEG===g.key?'on':'')+(o.n?'':' zero')+'">'+esc(g.name)+'<b>進行中 '+o.o+'</b>'+(o.nw?'<i>新 '+o.nw+'</i>':'')+'</button>'}).join('');
 var G=segBy(SEG);$('segNote').hidden=!G;if(G)$('segNote').innerHTML='<b>'+esc(G.name)+'</b>：'+(G.route==='self'?'振分け先は自社（当会）のみです。':'相談の内容から振分け先の分類を自動で選びます。')+esc(G.note);
 var ST=G?G.steps:['新規受付','__doing','__end'],STN={'__doing':'対応中','__end':'完了・終了'};
 var cnt={};ST.forEach(function(k){cnt[k]=0});base.forEach(function(x){if(G)cnt[x.status]=(cnt[x.status]||0)+1;else{var k=x.status==='新規受付'?'新規受付':isEnd(x)?'__end':'__doing';cnt[k]++}});
 $('sum').innerHTML=ST.map(function(k){return'<button type="button" data-st="'+k+'"'+(k==='新規受付'&&cnt[k]?' class="red"':'')+'>'+(STN[k]||k)+'<b>'+(cnt[k]||0)+'</b></button>'}).join('');
 $('stepHelp').innerHTML=(G?G.steps:STEPS).map(function(k){return'<tr><td>'+esc(k)+'</td><td>'+esc(STEP_DESC[k]||'')+'</td></tr>'}).join('');
 var sv=$('fSt').value;$('fSt').innerHTML='<option value="">進行中のもの（終了以外）</option><option value="all">すべて</option><option value="alert">警告・注意があるもの</option>'+ST.map(function(k){return'<option value="'+k+'">'+(STN[k]||k)+'</option>'}).join('');$('fSt').value=sv;if($('fSt').value!==sv)$('fSt').value='';
 var st=$('fSt').value;
 $('fPtW').hidden=!!(G&&G.route==='self');if($('fPtW').hidden)$('fPt').value='';
 var pts={};base.forEach(function(x){if(x.partner)pts[x.partner]=1});var cur=$('fPt').value;$('fPt').innerHTML='<option value="">すべて</option><option value="-"'+(cur==='-'?' selected':'')+'>振分け先なし</option>'+Object.keys(pts).sort().map(function(p){return'<option value="'+esc(p)+'"'+(p===cur?' selected':'')+'>'+esc(p==='自社'?'自社（当会）':p)+'</option>'}).join('');
 var cats={};base.forEach(function(x){var k=catOf(cls(x));if(k)cats[k]=(cats[k]||0)+1});fillSel('fCt',cats);
 var ct=$('fCt').value,fa=$('fFac').value;$('fFacW').hidden=!(SEG==='all'||SEG==='honnin'||SEG==='kazoku');if($('fFacW').hidden)fa='';
 var rows=base.filter(function(x){var c=cls(x);if(ct&&catOf(c)!==ct)return false;if(fa&&(!isFacSeg(x)||facOf(x).m!==fa))return false;if(st===''&&!open_(x))return false;if(st==='alert'&&!x._a.length)return false;if(st==='__doing'&&(isEnd(x)||x.status==='新規受付'))return false;if(st==='__end'&&!isEnd(x))return false;if(st&&st!=='all'&&st!=='alert'&&st.indexOf('__')&&x.status!==st)return false;if(pt==='-'&&x.partner)return false;if(pt&&pt!=='-'&&x.partner!==pt)return false;return!q||[x.no,x.name,x.company,x.email,x.body,x.label,x.fields,x.partner].join(' ').toLowerCase().indexOf(q)>=0});
 if(!rows.length){$('inbox').innerHTML='<p class="hint">'+(IN.length?'条件に合う案件はありません':'まだ受付はありません')+'</p>';return}
 $('inCount').textContent='表示中 '+rows.length+' 件（'+(G?G.name+' ':'')+'全 '+base.length+' 件）';
 $('inbox').innerHTML=VM==='card'?rows.map(cardHtml).join(''):tableHtml(rows)}
function cardHtml(x){var g=segOf(x),SS=stepsOf(x),si=SS.indexOf(x.status),stop=x.status==='見送り',now=Date.now(),idle=now-new Date(x.updated||x.ts),id=Math.floor(idle/864e5);
  var cls=x._a.some(function(y){return y.lv==='red'})||x.status==='新規受付'?'new':open_(x)?'doing':'done';
  var sug=[];(x.fields||'').split('、').forEach(function(f){(ROUTES[f]||'').split(/[、,]/).forEach(function(p){p=p.trim();if(p&&sug.indexOf(p)<0)sug.push(p)})});
  return'<div class="ib '+cls+'" data-no="'+esc(x.no)+'"><div class="ib-h"><b>'+(x.status==='新規受付'?'<span class="tg red">未対応</span> ':'')+esc(x.company?x.company+'　':'')+esc(x.name||'（お名前なし）')+'</b><span class="ib-m">'+esc(x.no)+'　受付 '+dt(x.ts)+'</span></div>'+
  '<div class="bar'+(stop?' stop':'')+'" title="'+esc(x.status)+'">'+SS.filter(function(k){return k!=='見送り'}).map(function(s,k){return'<i class="'+(k<=si||stop?'on':'')+'"></i>'}).join('')+'</div>'+
  '<div class="ib-m"><b style="color:var(--ink)">'+esc(x.status)+'</b>　受付から '+span(now-new Date(x.ts))+'　<span class="age '+(open_(x)?(id>=7?'r':id>=3?'y':''):'')+'">最後の対応から '+span(idle)+'</span>'+(x.contacted?'　お客様へ最終連絡 '+dt(x.contacted):'')+'</div>'+
  '<div class="tags">'+x._a.map(function(y){return'<span class="tg '+(y.lv==='red'?'red':'yel')+'">'+esc(y.t)+'</span>'}).join('')+(x.fields?x.fields.split('、').map(function(f){return'<span class="tg">'+esc(f)+'</span>'}).join(''):'<span class="tg">'+esc(x.label)+'</span>')+fwdLog(x).map(function(z){return'<span class="tg pt">送付済み：'+esc(z.name)+' '+dt(z.ts)+'</span>'}).join('')+(g.route==='self'?'':x.partner?'<span class="tg pt">振分け先：'+esc(x.partner==='自社'?'自社（当会）':x.partner)+'</span>':(sug.length?'':'<span class="tg yel">振分け先の候補なし</span>'))+'</div>'+
  '<div class="ib-m">'+(x.email?'<a href="mailto:'+esc(x.email)+'">'+esc(x.email)+'</a>':'')+(x.tel?'　<a href="tel:'+esc(String(x.tel).replace(/[^0-9+]/g,''))+'">'+esc(x.tel)+'</a>':'')+'</div>'+
  '<div class="ib-m"><span class="kd '+(SEGC[g.key]||'')+'">'+esc(g.name)+'</span> '+esc(g.note)+'</div>'+
  '<details><summary>受付の内容を見る</summary><pre>'+esc(x.body)+'</pre></details>'+ctHtml(x)+
  facHtml(x)+(g.route==='self'?'<div class="pt-box"><label>振分け先</label><p class="self-pt">自社（医療介護総合支援会）で対応します（'+esc(g.name)+'は提携先へ振り分けません）</p><input type="hidden" data-k="partner" value="自社"></div>':ptHtml(x))+'<div class="grid2"><div><label>状態</label><select data-k="status">'+SS.map(function(s){return'<option'+(s===x.status?' selected':'')+'>'+s+'</option>'}).join('')+'</select></div>'+
  '<div><label>担当</label><select data-k="staff">'+staffOpts(x.staff)+'</select></div><div><label>次の対応予定日</label><input type="date" data-k="next" value="'+esc(x.next)+'"></div></div>'+
  (x.memo?'<div class="ib-m" style="margin-top:8px">前回のメモ：'+esc(x.memo)+'</div>':'')+'<div class="ib-a"><span class="memo2"><select data-mk aria-label="対応の種類"><option value="">対応の種類を選ぶ</option>'+g.mk.map(function(k){return'<option>'+k+'</option>'}).join('')+'</select><input type="text" data-mt placeholder="対応メモ（何をしたか・次に何をするか）"></span><input type="hidden" data-k="memo" value="'+esc(x.memo)+'"><button type="button" class="small-btn" data-save>保存</button><button type="button" class="small-btn" data-rep>お客様へ報告を作る</button><button type="button" class="small-btn" data-his>対応の履歴</button>'+(g.route==='partner'?'<button type="button" class="small-btn fw-b" data-fw>提携先へ送る</button>':'')+(g.key==='teikei'?'<button type="button" class="small-btn" data-reg>提携先一覧に登録する</button>':'')+'</div><div class="hist-box"></div></div>'}
$('sum').addEventListener('click',function(e){var b=e.target.closest('[data-st]');if(!b)return;var o=$('fSt');if(![].some.call(o.options,function(op){return op.value===b.dataset.st}))o.insertAdjacentHTML('beforeend','<option>'+b.dataset.st+'</option>');o.value=b.dataset.st;drawIn()});
['fSt','fPt','fCt','fFac'].forEach(function(id){$(id).addEventListener('change',drawIn)});
$('segBar').addEventListener('click',function(e){var b=e.target.closest('[data-sg]');if(b)setSeg(b.dataset.sg)});
document.querySelectorAll('[data-vm]').forEach(function(b){b.classList.toggle('on',b.dataset.vm===VM);b.addEventListener('click',function(){VM=b.dataset.vm;try{localStorage.setItem('iryo-vm',VM)}catch(e){}document.querySelectorAll('[data-vm]').forEach(function(z){z.classList.toggle('on',z===b)});drawIn()})});
$('inbox').addEventListener('click',function(e){if(e.target.closest('.ib'))return;var tr=e.target.closest('tr.cr');if(!tr)return;OPEN[tr.dataset.row]=!OPEN[tr.dataset.row];drawIn()});$('fQ').addEventListener('input',drawIn);$('reloadIn').addEventListener('click',inbox);
setInterval(function(){if(!$('panel').hidden)inbox()},300000);setInterval(function(){if(!$('panel').hidden&&IN.length)drawIn()},60000);
function caseOf(no){return IN.filter(function(x){return x.no===no})[0]}
document.body.classList.add('adm');
/* ---- 今やること（データから自動で並べる） ---- */
var KL=null;
function goTab(v){var t=document.querySelector('.tab[data-v="'+v+'"]');if(t)t.click()}
function flash(el){if(!el)return;el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('flash');setTimeout(function(){el.classList.remove('flash')},3000)}
function todo(){var L=[],now=Date.now();
 var nw=IN.filter(function(x){return x.status==='新規受付'}),red=IN.filter(function(x){return(x._a||alerts(x)).some(function(y){return y.lv==='red'})&&x.status!=='新規受付'}),
  past=IN.filter(function(x){return open_(x)&&x.next&&new Date(x.next+'T23:59:59')<new Date()}),
  rep=IN.filter(function(x){return(x._a||[]).some(function(y){return/報告なし/.test(y.t)})}),
  nopt=IN.filter(needPt),nofac=IN.filter(function(x){return open_(x)&&isFacSeg(x)&&(facOf(x).m==='未確認'||((facOf(x).m==='会員ではない'||facOf(x).m==='通っている先がない')&&!facOf(x).plan))}),
  emptyRt=Object.keys(ROUTES).filter(function(f){return!ROUTES[f]&&!/^会員登録/.test(f)}).length;
 var nwBy={};nw.forEach(function(x){var n=segOf(x).name;nwBy[n]=(nwBy[n]||0)+1});
 if(nw.length)L.push({c:'red',t:'新しい受付が <b>'+nw.length+'件</b> あります（'+Object.keys(nwBy).map(function(k){return esc(k)+' '+nwBy[k]+'件'}).join('・')+'）',s:'いちばん上の案件の「受付の内容を見る」で読み、状態を「内容確認中」にして保存します。',b:'新しい受付を表示',f:function(){goTab('inbox');SEG='all';drawIn();var b=document.querySelector('#sum [data-st="新規受付"]');if(b)b.click();flash($('inbox').querySelector('tr.cr,.ib'))}});
 if(red.length)L.push({c:'red',t:'対応が止まっている案件が <b>'+red.length+'件</b> あります',s:'赤い印の案件です。次の一手を決め、対応メモを書いて保存します。',b:'その案件を表示',f:function(){goTab('inbox');$('fSt').value='alert';drawIn();flash($('inbox').querySelector('.ib'))}});
 if(past.length)L.push({c:'red',t:'対応予定日を過ぎた案件が <b>'+past.length+'件</b>',s:'予定していた対応をして、次の予定日を入れ直します。',b:'表示する',f:function(){goTab('inbox');$('fSt').value='alert';drawIn();flash($('inbox').querySelector('.ib'))}});
 if(KL){var unpaid=isStaff()?[]:KL.filter(function(x){return x.status==='締結済み'&&x.template==='kaiin'&&!x.paid}),wait=KL.filter(function(x){return(x.status==='送付済み'||x.status==='確認中')&&x.draft!=='yes'&&now-new Date(x.created)>3*864e5});
  if(unpaid.length)L.push({c:'',t:'会費の入金確認待ちが <b>'+unpaid.length+'件</b>',s:'通帳やネットバンキングで入金を確かめたら、その行の「入金を確認した」を押します（登録完了のメールが自動で届きます）。',b:'電子契約を開く',f:function(){goTab('keiyaku');flash($('rows').querySelector('[data-paid]'))}});
  var dok=KL.filter(function(x){return isLiveDraft(x)&&x.feedback&&x.feedback.res==='ok'}),dfix=KL.filter(function(x){return isLiveDraft(x)&&x.feedback&&x.feedback.res==='fix'});
  if(dok.length)L.push({c:'red',t:'相手が下書きを確認し「この内容でよい」と返事をした契約書が <b>'+dok.length+'件</b>',s:'電子契約の一覧で「この内容で本契約として送る」を押すと、同じ内容の正式な契約書が届きます。',b:'電子契約を開く',f:function(){goTab('keiyaku');flash($('rows').querySelector('[data-final]'))}});
  if(dfix.length)L.push({c:'red',t:'下書きに修正の希望が届いた契約書が <b>'+dfix.length+'件</b>',s:'電子契約の一覧で希望を読み、「内容を直して送り直す」を押します。元の書面は自動で取り消されます。',b:'電子契約を開く',f:function(){goTab('keiyaku');flash($('rows').querySelector('[data-redo]'))}});
  if(wait.length)L.push({c:'',t:'3日以上、相手の承認待ちの契約が <b>'+wait.length+'件</b>',s:'相手に届いているか確かめ、必要なら「もう一度送る」を押します。',b:'電子契約を開く',f:function(){goTab('keiyaku');flash($('rows').querySelector('[data-resend]'))}})}
 if(rep.length)L.push({c:'',t:'お客様へ7日以上報告していない案件が <b>'+rep.length+'件</b>',s:'「お客様へ報告を作る」で文面を作り、送るか（または電話で伝えたか）を選びます。',b:'表示する',f:function(){goTab('inbox');$('fSt').value='alert';drawIn();flash($('inbox').querySelector('[data-rep]'))}});
 if(nofac.length)L.push({c:'',t:'通っている病院・施設が会員か、まだ確かめていない相談が <b>'+nofac.length+'件</b>',s:'利用者・ご本人とご家族の相談は、会員の病院・施設に通っていることが前提です。「会員施設の確認」で結果を選び、会員でなければ対応を決めて保存します。',b:'表示する',f:function(){goTab('inbox');SEG='all';drawIn();$('fFac').value='未確認';drawIn();flash($('inbox').querySelector('tr.cr,.ib'))}});
 if(nopt.length)L.push({c:'',t:'振分け先が決まっていない案件が <b>'+nopt.length+'件</b>',s:'案件の「振分け先」で分類を選び、提携先（または自社）を選んで保存します。',b:'表示する',f:function(){goTab('inbox');SEG='all';$('fPt').value='-';drawIn();flash($('inbox').querySelector('[data-k="partner"]'))}});
 var nofw=IN.filter(function(x){return open_(x)&&segOf(x).route==='partner'&&x.partner&&x.partner!=='自社'&&!fwdLog(x).length&&segOf(x).need.indexOf(x.status)>=0});
 if(nofw.length)L.push({c:'',t:'振分け先は決まったが、まだ提携先へ送っていない案件が <b>'+nofw.length+'件</b>',s:'案件の「提携先へ送る」を押すと、内容とお客様の情報をまとめたメールが作られます。確かめて、お客様の同意に印を付けてから送ります。',b:'表示する',f:function(){goTab('inbox');SEG='all';$('fQ').value=nofw[0].no;OPEN[nofw[0].no]=true;drawIn();flash($('inbox').querySelector('[data-fw]'))}});
 var pwait=PARTNERS.filter(function(p){return p.state==='確認待ち'});if(!isStaff()&&pwait.length)L.push({c:'red',t:'相手が記入した提携先の登録が <b>'+pwait.length+'件</b> 確認待ちです',s:'設定の提携先一覧で内容を確かめ、「確認して使えるようにする」を押します。',b:'設定を開く',f:function(){goTab('route');flash($('ptRows').querySelector('[data-ap]'))}});
 if(!isStaff()&&!PARTNERS.length)L.push({c:'',t:'提携先がまだ登録されていません',s:'設定の「提携先の登録」で登録すると、案件の振分け先を一覧から選べ、メールを登録すれば案件をそのまま送れます。',b:'提携先を登録する',f:function(){goTab('route');flash($('ptForm'));$('pfName').focus()}});
 if(!isStaff()&&STAFF.length&&!ACTOR)L.unshift({c:'red',t:'画面右上の「操作する人」で、自分の名前を選んでください',s:'選んだ名前が、対応ログに「だれがしたか」として残ります。',b:'名前を選ぶ',f:function(){window.scrollTo(0,0);flash($('actorW'));$('actorSel').focus()}});
 if(!isStaff()&&!STAFF.length)L.push({c:'',t:'担当者がまだ登録されていません',s:'設定で担当者の名前を登録すると、案件の「担当」を選べるようになります。',b:'担当者を登録する',f:function(){goTab('route');flash($('staffNew'))}});
 if(!L.length)L.push({c:'ok',t:'いま、急いでやることはありません',s:isStaff()?'自分が送った契約書の返事や進み具合は「電子契約」で確かめられます。':'新しい受付が届くと、ここに表示され、警告音でもお知らせします（5分ごとに自動で最新にします）。',b:'',f:null});
 $('todoList').innerHTML=L.map(function(x,i){return'<li class="'+x.c+'"><span>'+x.t+'<small>'+esc(x.s)+'</small></span>'+(x.b?'<button type="button" class="small-btn" data-td="'+i+'">'+esc(x.b)+' ›</button>':'')+'</li>'}).join('');
 $('todoList').querySelectorAll('[data-td]').forEach(function(b){b.onclick=L[+b.dataset.td].f});
 var d=new Date();$('todoAt').textContent=d.getHours()+'時'+('0'+d.getMinutes()).slice(-2)+'分の時点'}
/* ---- 操作の案内（はじめての方） ---- */
var TOUR=[
 ['#todo','今やること','ログインしたら、まずここを見ます。やることが上から順に並び、右のボタンを押すとその場所へ移ります。'],
 ['#actorW','操作する人','最初に自分の名前を選びます。したことは「対応ログ」に、いつ・だれが・何をしたかで残ります。'],
 ['.tabs','画面の切り替え','「案件管理」「電子契約」「会員・相談者の名簿」「設定」「対応ログ」の5つの画面があります。数字は新しい受付の件数です。'],
 ['#segBar','種別ごとの管理','企業・事業者／働く方／利用者・ご本人／ご家族／提携・協業の申込み／要望・ご意見／会員登録で分けて管理します。種別ごとに、状態の並び・振分け先・対応の種類が変わります。'],
 ['#sum','状態ごとの件数','押すと、その状態の案件だけを表示します。赤い枠は未対応があるしるしです。'],
 ['#inbox .ib','案件のカード','1件ずつの受付です。帯の色で進み具合が、印で急ぎかどうかが分かります。'],
 ['#inbox .ib .grid2','状態と担当を入れる','状態・担当・次の対応予定日を入れます。振分け先は、相談の内容から分類が自動で選ばれます（提携・要望・会員登録は自社のみ）。'],
 ['#inbox .ib .ib-a','保存と報告','「保存」で記録します。「お客様へ報告を作る」で文面が作られ、送るかどうかを選べます。'],
 ['#snd','警告音','遅れている案件があると音で知らせます。ここでオン・オフを切り替えます。'],
 ['#howInbox','困ったときは','各画面の上の「この画面の使い方」を押すと、手順と状態の意味が読めます。']];
function tour(i){i=i||0;var old=document.querySelector('.tour-ov');if(old)old.remove();
 while(i<TOUR.length&&!document.querySelector(TOUR[i][0]))i++;
 if(i>=TOUR.length){try{localStorage.setItem('iryo-adm-tour','1')}catch(x){}return}
 var t=TOUR[i],el=document.querySelector(t[0]);goTab('inbox');el.scrollIntoView({block:'center'});
 var ov=document.createElement('div');ov.className='tour-ov';ov.innerHTML='<div class="tour-hl"></div><div class="tour-tx" role="dialog" aria-label="操作の案内"><span class="tn">操作の案内　'+(i+1)+' / '+TOUR.length+'</span><b>'+esc(t[1])+'</b>'+esc(t[2])+'<div class="bt">'+(i?'<button type="button" class="small-btn" data-t="p">‹ 戻る</button>':'')+'<button type="button" class="btn" data-t="n" style="min-height:44px;padding:0 18px">'+(i<TOUR.length-1?'次へ ›':'終わる')+'</button><button type="button" class="small-btn" data-t="x">案内を閉じる</button></div></div>';
 document.body.appendChild(ov);
 setTimeout(function(){var r=el.getBoundingClientRect(),hl=ov.querySelector('.tour-hl'),tx=ov.querySelector('.tour-tx');hl.style.left=(r.left-6)+'px';hl.style.top=(r.top-6)+'px';hl.style.width=(r.width+12)+'px';hl.style.height=Math.min(r.height+12,innerHeight-40)+'px';
  var below=r.bottom+tx.offsetHeight+24<innerHeight;tx.style.left=Math.max(12,Math.min(r.left,innerWidth-tx.offsetWidth-12))+'px';tx.style.top=(below?r.bottom+16:Math.max(12,r.top-tx.offsetHeight-16))+'px';tx.querySelector('[data-t=n]').focus()},80);
 ov.addEventListener('click',function(e){var b=e.target.closest('[data-t]');if(!b)return;var k=b.dataset.t;ov.remove();if(k==='n')tour(i+1);else if(k==='p')tour(i-1);else{try{localStorage.setItem('iryo-adm-tour','1')}catch(x){}}})}
$('tourBtn').addEventListener('click',function(){var n=$('tourNote');if(n)n.remove();this.classList.remove('flash');tour(0)});
$('inbox').addEventListener('click',function(e){var card=e.target.closest('.ib');if(!card)return;var no=card.dataset.no,x=caseOf(no),b;
 if((b=e.target.closest('[data-save]'))){var mk=card.querySelector('[data-mk]'),mt=card.querySelector('[data-mt]');if(mk&&(mk.value||mt.value.trim()))card.querySelector('[data-k="memo"]').value=(mk.value?'【'+mk.value+'】':'')+mt.value.trim();
  var fb=card.querySelector('.fac-box');if(fb){var fo={},of=facOf(x);fb.querySelectorAll('[data-fc]').forEach(function(el){var t=String(el.value).trim();if(t)fo[el.dataset.fc]=t});if(fo.m!=='会員の病院・施設')delete fo.member;else delete fo.plan;if(of.auto&&fo.m===of.m&&fo.member===of.member)fo.auto=1;
   var fe=fb.querySelector('.fac-err');fe.textContent='';if(fo.m==='会員の病院・施設'&&!fo.member){fe.textContent='会員の名前を入れてください（会員名簿から選べます）。';fb.querySelector('[data-fc=member]').focus();return}
   if((fo.m==='会員ではない'||fo.m==='通っている先がない')&&!fo.plan){fe.textContent='会員ではない場合の対応を選んでください。';fb.querySelector('[data-fc=plan]').focus();return}
   var js=JSON.stringify(fo),old=x.fac?JSON.stringify(of):'';fb.querySelector('[data-k="fac"]').value=(js===old)?(x.fac||''):js}
  var v={no:no};card.querySelectorAll('[data-k]').forEach(function(el){v[el.dataset.k]=String(el.value).trim()});
  var changedSt=v.status!==x.status;b.disabled=true;b.textContent='保存中…';
  api('admin.caseSet',v).then(function(){Object.keys(v).forEach(function(k){x[k]=v[k]});delete x._f;x.updated=new Date().toISOString();b.textContent='保存しました';setTimeout(drawIn,600);if(changedSt&&v.status!=='新規受付')openRpt(x,v.status)})
  .catch(function(er){$('errB').textContent=er.message;b.disabled=false;b.textContent='保存'})}
 if(e.target.closest('[data-rep]'))openRpt(x,x.status==='新規受付'?'受付':x.status);
 if(e.target.closest('[data-ctnew]')){newCt(x);return}
 if((b=e.target.closest('[data-ctgo]'))){goCt(b.dataset.ctgo);return}
 if((b=e.target.closest('[data-final]'))){ctFinal(b.dataset.final,b);return}
 if((b=e.target.closest('[data-redo]'))){ctRedo(b.dataset.redo);return}
 if(e.target.closest('[data-fw]')){var pi=card.querySelector('[data-k="partner"]');openFwd(x,pi?pi.value.trim():x.partner)}
 if(e.target.closest('[data-reg]')){var c=cls(x),pp=(c.path[0]||'').split(' ＞ '),nm=x.company||x.name,ar=String(x.body||'').split('\n').filter(function(l){return/^地域 \d+：/.test(l)}).map(function(l){return l.replace(/^地域 \d+：/,'').split(' ＞ ').slice(1).join(' ')}).join('、');
  if(PARTNERS.some(function(p){return p.name===nm})){$('errB').textContent='「'+nm+'」はもう提携先一覧に登録されています。';return}
  goTab('route');pfSet({name:nm,person:x.company?x.name:'',email:x.email,tel:x.tel==='（未入力）'?'':x.tel,a:pp[0]||'',b:pp[1]||'',c:pp[2]||'',area:ar,note:'提携申込み '+x.no});flash($('ptForm'));$('errPt').textContent='申込みの内容を入れました。確かめて「この内容で登録する」を押してください。'}
 if(e.target.closest('[data-his]')){var hb=card.querySelector('.hist-box');hb.innerHTML='<p class="hint">読み込み中…</p>';api('admin.history',{no:no}).then(function(r){hb.innerHTML=r.rows.length?'<ul class="hist">'+r.rows.map(function(h){var t=String(h.text||''),f=t.split('\n')[0].slice(0,120),who=h.actor||h.staff;return'<li>'+dt(h.ts)+'　<b>'+esc(h.kind)+'</b>'+(who?'（'+esc(who)+'）':'')+'　'+(t.indexOf('\n')>=0||t.length>120?'<details style="display:inline"><summary>'+esc(f)+'</summary><pre class="lg-pre">'+esc(t)+'</pre></details>':esc(t))+'</li>'}).join('')+'</ul>':'<p class="hint">履歴はまだありません</p>'}).catch(function(er){hb.textContent=er.message})}});
/* 進捗報告の文章を作る（担当者が直して、送るかどうかを決める） */
var RP=null,ALT=0;
var TX={'受付':['このたびは、医療介護総合支援会にご相談いただき、ありがとうございます。ご相談を受け付けました。\n担当者が内容を確認し、あらためてご連絡いたします。','ご相談をお寄せいただき、ありがとうございます。内容を拝見し、担当者から追ってご連絡いたします。今しばらくお待ちください。'],
'内容確認中':['いただいたご相談の内容を、担当者が確認しております。\n確認のためにお伺いしたいことがある場合は、こちらからご連絡いたします。','ご相談の内容を確認しているところです。進め方の見通しが立ちましたら、あらためてご報告いたします。'],
'振分け済み':['ご相談の内容に合わせて、対応できる提携先・専門家を選びました。\nお客様の情報を提携先へお伝えする前に、あらためてご了承の確認をさせていただきます。','ご相談に対応できる提携先・専門家の候補が決まりました。今後の進め方について、追ってご案内いたします。'],
'提携先対応中':['現在、提携先・専門家とともに、具体的な進め方を検討しております。\n進み具合に応じて、あらためてご報告いたします。','提携先・専門家との間で、ご相談への対応を進めております。次の段階に進みましたら、ご報告いたします。'],
'提案・見積り中':['ご提案の内容（必要に応じてお見積り）をまとめております。\nまとまりしだいお送りいたしますので、ご確認をお願いいたします。','ご提案とお見積りの準備を進めております。整いしだいお届けいたしますので、もうしばらくお待ちください。'],
'完了':['このたびのご相談につきまして、対応が完了いたしましたのでご報告いたします。\nご相談いただき、ありがとうございました。今後もお困りのことがあれば、いつでもご相談ください。','ご相談への対応が完了いたしました。ご協力いただき、ありがとうございました。また何かございましたら、お気軽にお声がけください。'],
'見送り':['ご相談の内容を検討いたしましたが、誠に恐れ入りますが、今回は当会および提携先でのお手伝いが難しいとの結論になりました。\nご期待に沿えず申し訳ございません。状況が変わった際は、あらためてご相談ください。','慎重に検討いたしましたが、今回のご相談は、当会と提携先での対応が難しい状況です。申し訳ございません。別のご相談がございましたら、いつでもお声がけください。']};
var RTX={_:{'会員施設の確認':['ご確認のお願い','ご相談にお応えするため、いま通っている（ご利用中の）病院・クリニック・介護施設などを確認させていただいております。\n確認のため、こちらからお電話・メールでお伺いすることがあります。'],'ヒアリング・面談':['ヒアリングのお願い','ご相談の内容について、詳しくお話を伺いたく存じます。\nお電話・オンライン・ご訪問のいずれかで、ご都合のよい日時をお知らせいただけますでしょうか。'],'契約・導入の準備中':['導入準備のご報告','ご契約・導入に向けて、提携先とともに準備を進めております。\n日程などが決まりしだい、あらためてご案内いたします。'],'お話を伺っている':['ご相談についてのご連絡','ご相談の内容を、引き続き伺っております。\nお話しいただいた内容を、ご本人の同意なく勤務先などへお伝えすることはありません。'],'専門家・窓口へつないだ':['ご相談先のご案内','ご相談の内容に合わせて、対応できる専門家・窓口をご案内いたします。\n詳しい内容は、このあと担当者からお伝えします。'],'継続して相談中':['進捗のご報告','引き続き、ご相談に対応しております。気になることがあれば、いつでもお知らせください。'],'状況の聞き取り':['お話を伺うお願い','ご相談にお応えするため、いまの状況を詳しく伺いたく存じます。\nご都合のよい日時をお知らせいただけますでしょうか。'],'利用・手続きの準備中':['お手続き準備のご報告','サービスのご利用・お手続きに向けて、準備を進めております。\n必要な書類や日程が決まりしだい、ご案内いたします。']},
self:{'受付':['受付のお知らせ','このたびは、医療介護総合支援会にご連絡いただき、ありがとうございます。受け付けました。\n担当者が内容を確認し、あらためてご連絡いたします。'],'内容確認中':['内容確認のご報告','いただいた内容を、担当者が確認しております。\n確認のためにお伺いしたいことがある場合は、こちらからご連絡いたします。']},
teikei:{'受付':['お申し込み受付のお知らせ','このたびは、医療介護総合支援会へ提携・協業のお申し込みをいただき、ありがとうございます。お申し込みを受け付けました。\n担当者が内容を確認し、面談の日程についてあらためてご連絡いたします。'],'内容確認中':['内容確認のご報告','いただいた提携・協業のお申し込み内容を、担当者が確認しております。\n確認のためにお伺いしたいことがある場合は、こちらからご連絡いたします。'],'面談日の調整中':['面談日程のご相談','提携・協業について、面談の機会をいただきたく存じます。\n面談は、当会の打ち合わせ専用事務所（大阪市北区）またはオンラインで行います。ご都合のよい日時をいくつかお知らせください。'],'面談済み':['面談のお礼','先日はお時間をいただき、ありがとうございました。\nお伺いした内容をもとに、当会で検討いたします。結果は、あらためてご連絡いたします。'],'社内で検討中':['検討状況のご報告','提携・協業のお申し込みについて、現在、当会で検討しております。\n結果がまとまりしだい、ご連絡いたします。'],'契約の手続き中':['ご契約手続きのご案内','提携・協業について、ぜひ進めさせていただきたく存じます。\n提携の契約書をお送りしますので、内容のご確認をお願いいたします。'],'提携開始':['提携開始のお知らせ','このたびは、医療介護総合支援会との提携をお引き受けいただき、ありがとうございます。\n今後、ご相談の内容に合わせてご紹介させていただきます。どうぞよろしくお願いいたします。'],'見送り':['お申し込みへのご回答','提携・協業のお申し込みについて慎重に検討いたしましたが、誠に恐れ入りますが、今回は見送らせていただくこととなりました。\nご期待に沿えず申し訳ございません。状況が変わりましたら、あらためてご相談させてください。']},
youbou:{'受付':['ご意見受付のお知らせ','このたびは、医療介護総合支援会へご要望・ご意見をお寄せいただき、ありがとうございます。\nいただいた内容は担当者が確認し、今後の運営に役立ててまいります。'],'内容確認中':['内容確認のご報告','いただいたご要望・ご意見を、担当者が確認しております。'],'社内で検討中':['検討状況のご報告','いただいたご要望について、当会で対応を検討しております。\n方針が決まりましたら、あらためてお知らせいたします。'],'対応を決めた':['対応のご報告','いただいたご要望をもとに、対応を進めることにいたしました。\n実施しましたら、あらためてお知らせいたします。'],'対応済み':['対応完了のご報告','いただいたご要望をもとに、対応いたしました。\n貴重なご意見をお寄せいただき、ありがとうございました。'],'見送り':['ご意見へのご回答','いただいたご要望について検討いたしましたが、誠に恐れ入りますが、現時点では対応が難しいとの結論になりました。\n今後の参考にさせていただきます。貴重なご意見をありがとうございました。']},
kaiin:{'受付':['お申し込み受付のお知らせ','このたびは、医療介護総合支援会の会員登録にお申し込みいただき、ありがとうございます。お申し込みを受け付けました。'],'内容確認中':['内容確認のご報告','会員登録のお申し込み内容を、担当者が確認しております。'],'契約書を送った':['契約書送付のお知らせ','会員規約（契約書）を電子契約でお送りしました。\n届いたメールのご案内に沿って、内容のご確認と承認をお願いいたします。'],'入金待ち':['お振込みのお願い','ご契約ありがとうございます。お送りした請求書の内容で、お支払い期日までにお振込みをお願いいたします。'],'登録完了':['会員登録完了のお知らせ','ご入金を確認し、会員登録が完了いたしました。今後ともどうぞよろしくお願いいたします。'],'見送り':['お申し込みへのご回答','会員登録のお申し込みについて、誠に恐れ入りますが、今回はお受けすることが難しい状況です。\nご期待に沿えず申し訳ございません。']}};
var TT={'受付':'受付のお知らせ','内容確認中':'内容確認のご報告','振分け済み':'今後の進め方のご報告','提携先対応中':'進捗のご報告','提案・見積り中':'ご提案準備のご報告','完了':'対応完了のご報告','見送り':'ご相談へのご回答'};
var RG=['いつもお世話になっております。医療介護総合支援会です。','お世話になっております。医療介護総合支援会でございます。','医療介護総合支援会です。このたびはありがとうございます。'],RC=['ご不明な点は、このメールにご返信いただくか、お電話でお問い合わせください。','ご質問などがございましたら、このメールへのご返信、またはお電話でお気軽にお知らせください。','気になることがございましたら、どうぞ遠慮なくこのメールにご返信ください。お電話でも承ります。'];
function makeRpt(x,kind){var g=segOf(x),who=(x.company?x.company+'\n':'')+(x.name&&x.name.indexOf('伏せ')<0?x.name+' 様':(g.route==='self'?'ご担当者様':'ご相談者様'));var r=(RTX[g.key]||{})[kind]||(g.route==='partner'?RTX._[kind]:null),t,tt;
 if(r){t=[r[1]];tt=r[0]}else if(g.route==='self'&&RTX.self[kind]){t=[RTX.self[kind][1]];tt=RTX.self[kind][0]}else{t=TX[kind]||[g.route==='self'?'いただいた'+g.word+'について、引き続き対応を進めております。進み具合に応じて、あらためてご報告いたします。':'ご相談について、引き続き対応を進めております。進み具合に応じて、あらためてご報告いたします。'];tt=TT[kind]}
 return{s:'【医療介護総合支援会】'+(tt||'進捗のご報告')+'（受付番号 '+x.no+'）',b:who+'\n\n'+RG[ALT%RG.length]+'\n\n'+t[ALT%t.length]+'\n\n受付番号：'+x.no+(x.staff?'\n担当：'+x.staff:'')+'\n\n'+RC[ALT%RC.length]+'\n\n――――――――――――――――\n医療介護総合支援会（運営 株式会社グローブ）\n電話 0120-933-496（受付 10:00〜19:00）\nメール ikshienkai@gmail.com\n――――――――――――――――'}}
function openRpt(x,kind){RP={x:x,kind:kind};ALT=0;var r=makeRpt(x,kind);$('rptS').value=r.s;$('rptB').value=r.b;$('errRp').textContent='';
 $('rptInfo').textContent=(x.company?x.company+'　':'')+x.name+'（'+x.no+'）への報告です。送るかどうかは、担当者が判断してください。';
 var w='';if(!x.email)w='この案件にはメールアドレスがありません。電話で伝えた場合は「電話で伝えた」で記録してください。';else if(x.contacted&&Date.now()-new Date(x.contacted)<48*H)w='前回の連絡（'+dt(x.contacted)+'）から48時間たっていません。連絡が多すぎないか、確かめてから送ってください。';
 $('rptWarn').hidden=!w;$('rptWarn').textContent=w;$('rpSend').disabled=!x.email;$('rpt').hidden=false;var tb=$('rptB');tb.focus();try{tb.setSelectionRange(0,0)}catch(x){}tb.scrollTop=0}
$('rpAlt').addEventListener('click',function(){if(!RP)return;ALT++;var r=makeRpt(RP.x,RP.kind),tb=$('rptB');tb.value=r.b;tb.scrollTop=0;tb.classList.remove('flash');void tb.offsetWidth;tb.classList.add('flash');setTimeout(function(){tb.classList.remove('flash')},1200);$('errRp').textContent='別の言い回しにしました（'+(ALT%3+1)+' / 3）。';});
function sendRpt(mode){var x=RP.x,b=mode==='send'?$('rpSend'):mode==='phone'?$('rpPhone'):$('rpSkip');b.disabled=true;
 api('admin.report',{no:x.no,subject:$('rptS').value,body:$('rptB').value,send:mode==='send',phone:mode==='phone',staff:x.staff}).then(function(){if(mode!=='skip'){x.contacted=new Date().toISOString();x.updated=x.contacted}$('rpt').hidden=true;drawIn()}).catch(function(er){$('errRp').textContent=er.message}).then(function(){b.disabled=false})}
$('rpSend').addEventListener('click',function(){if(confirm('この内容でお客様にメールを送りますか？'))sendRpt('send')});$('rpPhone').addEventListener('click',function(){sendRpt('phone')});$('rpSkip').addEventListener('click',function(){sendRpt('skip')});
/* 振分け設定 */
function drawRoute(){var used={};IN.forEach(function(x){if(open_(x))(x.fields||'').split('、').forEach(function(f){if(f)used[f]=(used[f]||0)+1})});
 $('routeRows').innerHTML=Object.keys(ROUTES).map(function(f){return'<tr><td>'+esc(f)+'</td><td><input type="text" data-f="'+esc(f)+'" value="'+esc(ROUTES[f])+'" placeholder="例：〇〇株式会社、△△社労士事務所"></td><td>'+(used[f]||0)+'件</td></tr>'}).join('')}
$('saveRt').addEventListener('click',function(){var b=this,rows=[].map.call($('routeRows').querySelectorAll('input'),function(i){return{field:i.dataset.f,partners:i.value.trim()}});b.disabled=true;$('errRt').textContent='';
 api('admin.routeSet',{rows:rows}).then(function(r){if(r.routes)ROUTES=r.routes;$('errRt').textContent='保存しました。';drawIn()}).catch(function(er){$('errRt').textContent=er.message}).then(function(){b.disabled=false})});

function showLogin(m){$('panel').hidden=true;$('gate').hidden=false;$('gateLink').href=window.KEIYAKU_ADMIN_URL||'#';if(m)$('errL').textContent=m;try{$('lid').focus()}catch(x){}}
window.onNeedLogin=function(){try{sessionStorage.removeItem('iryo-adm')}catch(x){}started=false;showLogin('ログインの有効期限が切れました。もう一度ログインしてください。')};
$('lf').addEventListener('submit',function(e){e.preventDefault();var b=$('doLogin');if(!$('lid').value.trim()||!$('lpw').value){$('errL').textContent='IDとパスワードを入れてください。';return}
 b.disabled=true;b.textContent='確認しています…';$('errL').textContent='';
 api('admin.login',{id:$('lid').value.trim(),pass:$('lpw').value}).then(function(r){try{sessionStorage.setItem('iryo-adm',r.adminToken)}catch(x){}started=false;$('lpw').value='';$('gate').hidden=true;go()})
 .catch(function(x){$('errL').textContent=x.message}).then(function(){b.disabled=false;b.textContent='ログイン'})});
$('fgOpen').addEventListener('click',function(){$('fg').hidden=!$('fg').hidden});
$('fgSend').addEventListener('click',function(){var b=this;b.disabled=true;$('fgMsg').textContent='送っています…';
 api('admin.forgot',{}).then(function(){$('fgMsg').textContent='登録メールに送りました。届かないときは迷惑メールも見てください。';$('fg2').hidden=false;try{$('fgCode').focus()}catch(x){}})
 .catch(function(x){$('fgMsg').textContent=x.message}).then(function(){setTimeout(function(){b.disabled=false},30000)})});
$('fgDo').addEventListener('click',function(){var b=this,c=$('fgCode').value.replace(/\D/g,''),p1=$('fgP1').value,p2=$('fgP2').value;$('errF').textContent='';
 if(c.length!==6){$('errF').textContent='6けたの確認コードを入れてください。';return}
 if(p1.length<8){$('errF').textContent='パスワードは8文字以上にしてください。';return}
 if(p1!==p2){$('errF').textContent='2つのパスワードが合っていません。';return}
 b.disabled=true;b.textContent='変更しています…';
 api('admin.reset',{code:c,pass:p1}).then(function(r){$('fgP1').value=$('fgP2').value=$('fgCode').value='';$('fg').hidden=true;$('fg2').hidden=true;$('fgMsg').textContent='';if(r.id)$('lid').value=r.id;$('errL').textContent='パスワードを変えました。新しいパスワードでログインしてください。';try{$('lpw').focus()}catch(x){}})
 .catch(function(x){$('errF').textContent=x.message}).then(function(){b.disabled=false;b.textContent='変更する'})});
$('logout').addEventListener('click',function(){api('admin.logout',{}).catch(function(){});try{sessionStorage.removeItem('iryo-adm');sessionStorage.removeItem('iryo-demo-me')}catch(x){}location.reload()});
var tok='';try{tok=sessionStorage.getItem('iryo-adm')||''}catch(x){}
if(IN_GAS){$('logout').hidden=true;go()}else if(tok){go()}else{showLogin()}
})();
</script>
'''
from data import PARTNER_TAX as _PT, ROUTE_AUTO as _RA
ADM_DATA = "<script>window.CASE_SEGS=" + json.dumps(__import__("data").CASE_SEGS, ensure_ascii=False) + ";window.PARTNER_TAX=" + json.dumps(_PT, ensure_ascii=False) + ";window.ROUTE_AUTO_N=" + json.dumps({_SUP[k]["name"]: list(v) for k, v in _RA.items()}, ensure_ascii=False) + ";</script>\n"
ADM_HELP = '<script>window.FORM_NOBAR=true;window.FORM_HELP={"lid":{"t":"担当者のIDを入れます。","ex":"英字の小文字で入れます。分からないときは「ID・パスワードを忘れたとき」を押すと、登録メールに届きます","req":true},"lpw":{"t":"パスワードを入れます。","ex":"大文字・小文字、全角・半角の違いにご注意ください。5回続けて間違えると15分止まります","req":true},"fgCode":{"t":"登録メールに届いた6けたの数字を入れます。","req":true},"fgP1":{"t":"新しいパスワードを8文字以上で決めます。","ex":"英字と数字をまぜると安全です","req":true},"fgP2":{"t":"確認のため、同じパスワードをもう一度入れます。","req":true},"pName":{"t":"契約の相手のお名前（ご担当者）です。","req":true},"pEmail":{"t":"契約書の案内を送る相手のメールアドレスです。","req":true}};</script>\n<script src="../assets/guide.js" data-mode="admin"></script>\n'
# ---------- 提携先の登録フォーム（担当者がメールで送ったリンクから、相手が記入する） ----------
PARTNER_PAGE = HEAD("提携先の登録") + f"""
<div class="demo" id="demoBar" hidden>お試し表示です（入力した内容は送信されません）</div>
<header class="top"><div class="in">
<a class="brand" href="../index.html">{MARK}<span><b>医療介護総合支援会</b><small>提携先の登録</small></span></a>
<a class="tel" href="tel:{TELR}">分からないときは <b>{TEL}</b> <small>受付 {HRS}</small></a>
</div></header>
<main>
<p class="hint" id="loading">読み込み中…</p>
<p class="err" id="errTop" role="alert"></p>
<section class="card" id="pf" hidden>
<h1 style="font-size:1.5rem;margin:0 0 6px">提携先のご登録</h1>
<p id="pTo"></p>
<p class="hint">医療介護総合支援会に寄せられるご相談のうち、貴社の分野に合うものをご紹介するために使います。<span class="req">※必須</span> の欄は必ずご記入ください。</p>
<div class="fld"><label for="pName">会社名・事務所名 <span class="req">※必須</span></label><input type="text" id="pName" maxlength="100" autocomplete="organization"></div>
<div class="fld"><label for="pPerson">ご担当者のお名前</label><input type="text" id="pPerson" maxlength="60" autocomplete="name"></div>
<div class="fld"><label for="pA">大分類（得意な分野） <span class="req">※必須</span></label><select id="pA"></select></div>
<div class="fld"><label for="pB">中分類 <span class="req">※必須</span></label><select id="pB" disabled></select></div>
<div class="fld"><label for="pC">小分類（任意）</label><select id="pC" disabled></select></div>
<div class="fld"><label for="pEmail">ご紹介を受け取るメールアドレス <span class="req">※必須</span></label><input type="email" id="pEmail" maxlength="120" autocomplete="email"></div>
<div class="fld"><label for="pTel">電話番号</label><input type="tel" id="pTel" maxlength="30" autocomplete="tel"></div>
<div class="fld"><label for="pArea">対応できる地域</label><input type="text" id="pArea" maxlength="120" placeholder="例：大阪府全域、兵庫県（阪神）"></div>
<div class="fld"><label for="pNote">サービスの内容・条件など（任意）</label><textarea id="pNote" maxlength="300" placeholder="例：初回相談無料、訪問対応可"></textarea></div>
<p class="err" id="errP" role="alert"></p>
<div class="btns"><button class="btn" type="button" id="pSend">この内容で登録する</button></div>
</section>
<section class="card" id="pDone" hidden><h1 style="font-size:1.5rem;margin:0 0 6px">ご登録ありがとうございました</h1><p>内容を確かめたうえで、担当者からご連絡いたします。</p></section>
</main>
<script src="config.js"></script>
<script src="api.js"></script>
""" + ADM_DATA + r"""<script>
(function(){var $=function(i){return document.getElementById(i)},t=new URLSearchParams(location.search).get('t')||'',T=window.PARTNER_TAX||{};
if(window.KEIYAKU_DEMO)$('demoBar').hidden=false;
function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function opt(l,cur,ph){return'<option value="">'+ph+'</option>'+l.map(function(v){return'<option'+(v===cur?' selected':'')+'>'+esc(v)+'</option>'}).join('')}
function fill(a,b,c){$('pA').innerHTML=opt(Object.keys(T),a,'選んでください');$('pB').innerHTML=opt(a&&T[a]?Object.keys(T[a]):[],b,'選んでください');$('pB').disabled=!a;$('pC').innerHTML=opt(a&&b&&T[a]&&T[a][b]?T[a][b]:[],c,'（任意）');$('pC').disabled=!b}
$('pA').addEventListener('change',function(){fill(this.value,'','')});$('pB').addEventListener('change',function(){fill($('pA').value,this.value,'')});
keiyakuApi('client.pinv',{t:t}).then(function(r){$('loading').hidden=true;$('pf').hidden=false;$('pTo').textContent=r.name+' 宛てのご案内です。';$('pEmail').value=r.email||'';fill('','','')}).catch(function(e){$('loading').hidden=true;$('errTop').textContent=e.message});
$('pSend').addEventListener('click',function(){var b=this,row={name:$('pName').value.trim(),person:$('pPerson').value.trim(),a:$('pA').value,b:$('pB').value,c:$('pC').value,email:$('pEmail').value.trim(),tel:$('pTel').value.trim(),area:$('pArea').value.trim(),note:$('pNote').value.trim()};$('errP').textContent='';
 if(!row.name){$('errP').textContent='会社名・事務所名を入れてください。';$('pName').focus();return}
 if(!row.a||!row.b){$('errP').textContent='大分類と中分類を選んでください。';$('pA').focus();return}
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)){$('errP').textContent='メールアドレスを正しく入れてください。';$('pEmail').focus();return}
 b.disabled=true;b.textContent='送っています…';keiyakuApi('client.pinvSubmit',{t:t,row:row}).then(function(){$('pf').hidden=true;$('pDone').hidden=false;window.scrollTo(0,0)}).catch(function(e){$('errP').textContent=e.message;b.disabled=false;b.textContent='この内容で登録する'})});
})();
</script>
<script>window.FORM_HELP={"pName":{"t":"会社名・事務所名を入れます。","req":true},"pA":{"t":"いちばん得意な分野を選びます。","req":true},"pB":{"t":"大分類を選ぶと出てきます。","req":true},"pEmail":{"t":"ご相談のご紹介を受け取るメールアドレスです。","req":true}};</script>
<script src="../assets/guide.js" data-mode="form"></script>
</body>
</html>
"""
open(os.path.join(OUT, "partner.html"), "w", encoding="utf-8").write(PARTNER_PAGE)
open(os.path.join(OUT, "admin.html"), "w", encoding="utf-8").write(HEAD("管理画面") + ADMIN_BODY + '<script src="config.js"></script>\n<script src="api.js"></script>\n' + ADM_DATA + ADMIN_JS + ADM_HELP + "</body>\n</html>\n")

# ---------- Apps Script 一式 ----------
gs = "/* このファイルは make_keiyaku.py が作りました。直すときは元のファイルを直してください */\n" + TEXTS + CORE + "\n" + open(os.path.join(HERE, "keiyaku_gas_main.js"), encoding="utf-8").read()
open(os.path.join(GAS, "コード.gs"), "w", encoding="utf-8").write(gs)
shim = ("<script>window.IN_GAS=true;\n(function(){" + TEXTS + CORE +
        "window.KEIYAKU_CORE={TEMPLATES:TEMPLATES,FIELDS:FIELDS,normCond:normCond,buildBody:buildBody,yen:yen,MEMBER_LABEL:MEMBER_LABEL};})();\n"
        "window.keiyakuApi=function(a,d){return new Promise(function(res,rej){google.script.run.withSuccessHandler(function(r){r&&r.ok?res(r):rej(new Error(r&&r.error||'うまくいきませんでした'))}).withFailureHandler(function(e){rej(new Error(e&&e.message||String(e)))}).adminCall(a,d)})};</script>\n")
gas_admin = ('<!doctype html><html lang="ja"><head><base target="_top"><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=BIZ+UDPMincho:wght@700&display=swap"><style>'
             + css + '</style></head><body>' + ADMIN_BODY.replace('href="../index.html"', 'href="https://119cm.net/"') + shim + ADM_DATA + ADMIN_JS + "</body></html>\n")
open(os.path.join(GAS, "admin.html"), "w", encoding="utf-8").write(gas_admin)
print("ok", OUT, GAS)
