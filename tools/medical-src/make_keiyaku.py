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
TEXTS = "var FIELD_LIST = " + json.dumps(FIELD_LIST, ensure_ascii=False) + ";\n" + "var KIYAKU_TEXT = %s;\nvar KOJIN_TEXT = %s;\nvar NDA_TEXT = %s;\nvar TEIKEI_TEXT = %s;\n" % tuple(json.dumps(x, ensure_ascii=False) for x in (KIYAKU, KOJIN_KIYAKU, NDA, TEIKEI))
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
<link rel="stylesheet" href="keiyaku.css">
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
    if (action === "admin.login") return d.id && d.pass ? wait({ ok: true, adminToken: "demo" }) : Promise.reject(new Error("IDとパスワードを入れてください"));
    if (action === "admin.logout") return wait({ ok: true });
    if (action === "admin.forgot") return wait({ ok: true });
    if (action === "admin.reset") return d.code && d.pass ? wait({ ok: true, id: "demo" }) : Promise.reject(new Error("確認コードとパスワードを入れてください"));
    if (action === "admin.templates") return wait({ ok: true, templates: TEMPLATES, fields: FIELDS });
    if (action === "admin.issue") {
      var t = tplOf(d.template), p = d.party || {};
      if (!p.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email || "")) return Promise.reject(new Error("相手のお名前と、正しいメールアドレスを入れてください"));
      var f = orderFields(t, d.fields);
      var o = { id: "IKK-DEMO-" + (1001 + list.length), token: "demo" + Date.now(), template: t.key, title: t.title, party_name: p.name, party_company: p.company || "", party_email: p.email, status: "送付済み", created: new Date().toISOString(), draft: d.draft ? "yes" : "", fields: f, required: t.required, requireId: !!(d.requireId || t.requireId), prefill: d.prefill || {}, body: buildBody(t.key, d.cond, d.note, p.company || p.name) };
      list.unshift(o); store(list);
      return wait({ ok: true, id: o.id, url: location.href.replace(/admin\.html.*$/, "index.html") + "?t=" + o.token + "&demo=1" });
    }
    if (action === "admin.list") return wait({ ok: true, rows: list });
    if (action === "admin.cases") { var now = Date.now(), dd = function (h) { return new Date(now - h * 36e5).toISOString(); }; var rt = {}; FIELD_LIST.forEach(function (f) { rt[f] = ""; }); rt["経営・業務の改善"] = "見本コンサルティング株式会社"; rt["採用・定着・研修"] = "見本人材サービス、見本社労士事務所";
      return wait({ ok: true, routes: rt, rows: [
        { no: "IK-261030-0912ABC", ts: dd(30), label: "医療介護総合支援会：企業・事業者／経営・業務の改善", name: "見本 一郎", company: "見本クリニック", email: "sample@example.jp", tel: "06-0000-0000", body: "【受付内容】\n立場：企業・事業者\n内容：経営・業務の改善", status: "新規受付", memo: "", fields: "経営・業務の改善", partner: "見本コンサルティング株式会社", staff: "", updated: dd(30), contacted: "", next: "" },
        { no: "IKM-261029-1530XYZ", ts: dd(50), label: "医療介護総合支援会：会員登録／事業所会員", name: "見本 花子", company: "見本デイサービス", email: "hanako@example.jp", tel: "06-1111-2222", body: "【会員登録の申込み】\n会員の種類：事業所会員", status: "提携先対応中", memo: "電子契約 締結済み", fields: "会員登録（事業所会員）", partner: "", staff: "中嶋", updated: dd(200), contacted: dd(200), next: "" },
        { no: "IK-261020-1010QWE", ts: dd(240), label: "医療介護総合支援会：医療・介護で働く方／採用・定着・研修", name: "見本 次郎", company: "見本訪問看護", email: "jiro@example.jp", tel: "", body: "【受付内容】\n内容：採用・定着・研修", status: "完了", memo: "紹介済み", fields: "採用・定着・研修", partner: "見本人材サービス", staff: "中嶋", updated: dd(100), contacted: dd(100), next: "" }] }); }
    if (action === "admin.caseSet" || action === "admin.report" || action === "admin.routeSet") return wait({ ok: true, routes: d.rows ? (function () { var o = {}; d.rows.forEach(function (r) { o[r.field] = r.partners; }); return o; })() : null });
    if (action === "admin.history") return wait({ ok: true, rows: [{ ts: new Date().toISOString(), kind: "受付", text: "サイトから受付", staff: "" }] });
    if (action === "client.apply") {
      var kj = d.type === "kojin", tp = tplOf(kj ? "kojin" : "kaiin");
      var oo = { id: "IKK-DEMO-" + (1001 + list.length), token: "demo" + Date.now(), template: tp.key, title: tp.title, party_name: d.name, party_company: kj ? "" : d.org, party_email: d.email, status: "送付済み", created: new Date().toISOString(), draft: "", fields: tp.fields.slice(), required: tp.required, requireId: tp.requireId, prefill: kj ? { name: d.name, address: d.address, phone: d.phone } : { company: d.org, address: d.address, rep: d.rep, name: d.name, phone: d.phone }, body: buildBody(tp.key, kj ? null : { type: d.type, pay: d.pay, sites: d.sites, staff: d.staff, referrer: d.referrer, founder: true }, "", kj ? d.name : d.org) };
      list.unshift(oo); store(list); return wait({ ok: true, token: oo.token });
    }
    if (action === "admin.resend") return wait({ ok: true });
    if (action === "admin.stop") { list.forEach(function (x) { if (x.id === d.id) x.stopped = new Date().toISOString(); }); store(list); return wait({ ok: true }); }
    if (action === "admin.paid") { list.forEach(function (x) { if (x.id === d.id) x.paid = new Date().toISOString(); }); store(list); return wait({ ok: true }); }
    if (action === "admin.cancel") { list.forEach(function (x) { if (x.id === d.id) x.status = "取り消し"; }); store(list); return wait({ ok: true }); }
    if (action === "admin.pdf" || action === "client.pdf") return Promise.reject(new Error("お試し表示では、契約書のPDFは作られません"));
    var c = list.filter(function (x) { return x.token === d.token; })[0] || sample();
    if (c.status === "取り消し") return Promise.reject(new Error("この契約書は取り消されました。"));
    if (action === "client.otp") return wait({ ok: true, demoCode: "123456" });
    if (action === "client.verify") return String(d.code) === "123456" ? wait({ ok: true, sess: "demo" }) : Promise.reject(new Error("認証コードが違います（お試し表示では 123456 です）。"));
    if (action === "client.get") {
      var t2 = tplOf(c.template) || tplOf("kaiin");
      if (d.sess !== "demo") return wait({ ok: true, needOtp: true, contract: { id: c.id, title: c.title, party_name: c.party_name, party_company: c.party_company, email: c.party_email.split("@")[0].slice(0, 2) + "***@" + c.party_email.split("@")[1], issuer: ISSUER } });
      return wait({ ok: true, contract: { id: c.id, title: c.title, status: c.status, draft: c.draft === "yes", party_name: c.party_name, party_company: c.party_company, body: c.body, fields: c.fields.map(function (k) { return { key: k, label: fieldLabel(t2, k), type: FIELDS[k].type, ac: FIELDS[k].ac || "", required: c.required.indexOf(k) >= 0, value: (c.prefill || {})[k] || "" }; }), requireId: !!c.requireId, adult: !!t2.adult, seal: t2.seal, issuer: ISSUER, signed: c.status === "締結済み" } });
    }
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
<p class="note" id="draftNote" hidden>この書面は「下書き（確認用）」です。内容をご確認いただくためのもので、締結はできません。気になる点はお電話でお知らせください。</p>
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
 if(C.draft){{$('draftNote').hidden=false;$('toFill').hidden=true}}
 if(C.requireId)$('idBox').hidden=false;
 if(C.seal==='square')document.querySelector('input[name=shape][value=square]').checked=true;
 $('nextPay').hidden=!/会員申込書/.test(C.title);
 if(C.signed){{show(3)}}else show(0);
}}).catch(function(e){{fail(e.message)}})}}
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
<h2>担当者ログイン</h2>
<p class="hint">電子契約と受付の管理画面です。担当者のIDとパスワードを入れてください。</p>
<form id="lf" autocomplete="on">
<div class="fld"><label for="lid">ID</label><input type="text" id="lid" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="60"></div>
<div class="fld"><label for="lpw">パスワード</label><input type="password" id="lpw" autocomplete="current-password" maxlength="100"></div>
<p class="err" id="errL" role="alert"></p>
<button class="btn" type="submit" id="doLogin" style="width:100%">ログイン</button>
</form>
<p style="margin:14px 0 0"><button type="button" class="small-btn" id="fgOpen">ID・パスワードを忘れたとき</button></p>
<div id="fg" hidden style="margin-top:14px;border-top:1px solid var(--line);padding-top:14px">
<h3 style="margin:0 0 6px">パスワードを決め直す</h3>
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
<p style="text-align:right;margin:0 0 10px"><button type="button" class="small-btn" id="logout">ログアウト</button></p>
<section class="card todo" id="todo"><div class="todo-h"><h2>今やること</h2><span class="hint" id="todoAt"></span><button type="button" class="small-btn" id="tourBtn">はじめての方へ：操作の案内</button></div><ol class="todo-l" id="todoList"><li class="hint">読み込み中…</li></ol></section>
<nav class="tabs" role="tablist"><button type="button" role="tab" class="tab on" data-v="inbox">案件管理<span class="cnt" id="newCnt" hidden></span></button><button type="button" role="tab" class="tab" data-v="keiyaku">電子契約</button><button type="button" role="tab" class="tab" data-v="route">振分け設定</button><button type="button" class="small-btn" id="snd" aria-pressed="true" style="margin-left:auto">警告音：オン</button></nav>
<div data-view="inbox">
<details class="howto" id="howInbox"><summary>この画面の使い方（案件管理）</summary><div>
<ol><li><b>赤い印の案件から</b>対応します。新しい受付ほど上に出ます。</li><li>案件の「受付の内容を見る」を押して、内容を読みます。</li><li>読んだら「状態」を進め、「振分け先」「担当」「次の対応予定日」を入れて<b>「保存」</b>を押します。</li><li>お客様に伝えることがあれば「お客様へ報告を作る」を押します。文面は自動で作られます。<b>送るかどうかは自分で決めます</b>（電話で伝えた・今回は送らない、も選べます）。</li><li>上の数字のボタンを押すと、その状態の案件だけを表示します。</li></ol>
<table class="list"><thead><tr><th>状態</th><th>この状態にするとき</th></tr></thead><tbody>
<tr><td>新規受付</td><td>サイトから届いたまま（まだ読んでいない）</td></tr><tr><td>内容確認中</td><td>内容を読んだ。お客様に確認している</td></tr><tr><td>振分け済み</td><td>どの提携先に任せるか決めた</td></tr><tr><td>提携先対応中</td><td>提携先がお客様とやりとりしている</td></tr><tr><td>提案・見積り中</td><td>お客様が提案や見積りを検討している</td></tr><tr><td>完了</td><td>対応が終わった</td></tr><tr><td>見送り</td><td>お客様の都合などで進めない</td></tr></tbody></table>
<p class="hint">放っておくと警告が出ます：新規受付のまま24時間／動きがないまま3日（黄）・7日（赤）／予定日を過ぎた／お客様へ7日報告なし。</p></div></details>
<div class="alertbar" id="alertBar" hidden></div>
<div class="sum" id="sum"></div>
<section class="card">
<div class="filters"><label>状態 <select id="fSt"><option value="">完了・見送り以外</option><option value="all">すべて</option><option value="alert">警告・注意があるもの</option></select></label><label>振分け先 <select id="fPt"><option value="">すべて</option></select></label><label>さがす <input type="text" id="fQ" placeholder="名前・会社・番号・内容"></label><button type="button" class="small-btn" id="reloadIn">最新にする</button></div>
<div id="inbox"><p class="hint">読み込み中…</p></div>
<p class="err" id="errB" role="alert"></p>
</section>
</div>
<div data-view="route" hidden>
<details class="howto"><summary>この画面の使い方（振分け設定）</summary><div><ol><li>左の「分野」は、お客様がサイトで選ぶ項目です。</li><li>右の欄に、その分野を任せる提携企業・専門家の名前を入れます。複数のときは「、」で区切ります。</li><li>いちばん下の「振分け設定を保存する」を押します。</li><li>以後の新しい受付には、ここで決めた先が自動で入ります。</li></ol></div></details>
<section class="card">
<h2>振分け設定</h2>
<p class="hint">お客様がサイトで選んだ分野ごとに、どの提携企業・専門家へ振り分けるかを決めます。新しい受付には、ここで決めた先（複数のときは最初の先）が自動で入ります。案件ごとに変えることもできます。複数の先は「、」で区切ってください。</p>
<div class="tbl"><table class="list"><thead><tr><th style="width:42%">分野（お客様が選ぶ項目）</th><th>振分け先</th><th style="width:70px">件数</th></tr></thead><tbody id="routeRows"></tbody></table></div>
<p class="err" id="errRt" role="alert"></p>
<button class="btn" type="button" id="saveRt">振分け設定を保存する</button>
</section>
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
<div data-view="keiyaku" hidden>
<details class="howto"><summary>この画面の使い方（電子契約）</summary><div><ol><li>サイトの会員登録は、お客様が申し込むと<b>自動で契約書が作られます</b>。ここで送る必要はありません。</li><li>相手が承認すると「締結済み」になり、請求書つきの振込のご案内が自動で届きます（期限は承認日から7日。入会した月は無料）。</li><li><b>毎月1日の朝に、翌月分の請求書が自動で全員に届きます</b>（期限は10日）。送った内容は登録メールにも届きます。</li><li>会員が退会するときは、その行の「退会（請求を止める）」を押します。翌月から請求書が止まります。</li><li>通帳などで入金を確かめたら、その行の<b>「入金を確認した」</b>を押します。会員登録完了のメールが自動で届きます。</li><li>相手がまだ承認していないときは「もう一度送る」で案内を送り直せます。</li><li>協賛会員（審査あり）や、個別の契約書は、下の「契約書を送る」から作って送ります。</li></ol></div></details>
<section class="card">
<h2>送った契約書の一覧</h2>
<div class="tbl"><table class="list"><thead><tr><th>契約番号</th><th>種類</th><th>相手</th><th>状態</th><th>送った日</th><th>操作</th></tr></thead><tbody id="rows"><tr><td colspan="6">読み込み中…</td></tr></tbody></table></div>
<p class="err" id="errR" role="alert"></p>
</section>
<section class="card">
<h2>契約書を送る</h2>
<p class="hint">サイトの「会員登録の申込み」の通知メールを見ながら入れてください。</p>
<div class="fld"><label for="tpl">契約書の種類</label><select id="tpl"></select></div>
<div class="fld"><label for="pName">相手のお名前（ご担当者）<span class="req">※必須</span></label><input type="text" id="pName"></div>
<div class="fld" id="pCompanyBox"><label for="pCompany">事業所名・法人名</label><input type="text" id="pCompany"></div>
<div class="fld"><label for="pEmail">相手のメールアドレス<span class="req">※必須</span></label><input type="email" id="pEmail" autocomplete="off"></div>

<div class="fld" id="condBox" hidden><label>契約の内容（会費は自動で計算します）</label>
<div class="cond">
<div class="fld"><label for="cType">会員区分</label><select id="cType"><option value="jigyosho">事業所会員</option><option value="hojin">法人会員</option><option value="kyosan">協賛会員</option></select></div>
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
function api(a,d){return keiyakuApi(a,d||{})}
var n=new Date(),nx=new Date(n.getFullYear(),n.getMonth()+1,1);$('cStart').value=nx.getFullYear()+'-'+('0'+(nx.getMonth()+1)).slice(-2);
function start(){$('panel').hidden=false;
 api('admin.templates').then(function(r){TPL=r.templates;FIELDS=r.fields;$('tpl').innerHTML=TPL.map(function(t){return'<option value="'+t.key+'">'+esc(t.title)+'</option>'}).join('');onTpl()}).catch(function(e){$('errI').textContent=e.message});list()}
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
 $('reqId').checked=!!t.requireId;$('condBox').hidden=!t.cond;$('noteBox').hidden=!t.note;$('noteLabel').textContent=t.note||'特記事項';$('prev').hidden=true;if(t.cond)onCond()}
$('tpl').addEventListener('change',onTpl);
function payload(){var t=cur(),pre={};[].forEach.call($('preBox').querySelectorAll('input'),function(i){if(i.value.trim())pre[i.dataset.k]=i.value.trim()});
 return{template:t.key,party:{name:$('pName').value.trim(),company:$('pCompany').value.trim(),email:$('pEmail').value.trim()},fields:[].map.call($('fieldChk').querySelectorAll('input:checked'),function(i){return i.value}),requireId:$('reqId').checked,cond:t.cond?cond():null,note:t.note?$('note').value.trim():'',prefill:pre,draft:$('draft').checked}}
$('doPrev').addEventListener('click',function(){var p=payload();$('prev').textContent=K.buildBody(p.template,p.cond,p.note,p.party.company||p.party.name||'（相手のお名前）').replace(/\[\[(\w+)\]\]/g,function(_,k){return p.prefill[k]?p.prefill[k]+'（相手が直せます）':'＿＿＿（相手が記入）'});$('prev').hidden=false});
$('doIssue').addEventListener('click',function(){var b=this,p=payload();
 if(p.template==='kaiin'&&p.cond.type==='hojin'&&(+p.cond.sites||1)<2&&!confirm('法人会員で事業所数が1か所です。このまま送りますか？'))return;
 if(p.template==='kaiin'&&p.cond.type==='kyosan'&&!confirm('協賛会員は審査が必要です。審査は済んでいますか？'))return;
 b.disabled=true;$('errI').textContent='';$('issued').hidden=true;
 api('admin.issue',p).then(function(r){$('issued').hidden=false;$('issued').innerHTML='送りました（契約番号 '+esc(r.id)+'）。<br>相手の画面：<a href="'+esc(r.url)+'" target="_blank" rel="noopener">'+esc(r.url)+'</a>';['pName','pCompany','pEmail','note','cRef','cEntry'].forEach(function(id){$(id).value=''});$('preBox').innerHTML='';onTpl();list()})
 .catch(function(e){$('errI').textContent=e.message}).then(function(){b.disabled=false})});
function list(){api('admin.list').then(function(r){KL=r.rows||[];todo();if(!r.rows.length){$('rows').innerHTML='<tr><td colspan="6">まだありません</td></tr>';return}
 $('rows').innerHTML=r.rows.map(function(x){var cls=x.status==='締結済み'?'done':x.status==='取り消し'?'cancel':'';var st=x.paid?'入金済み':x.status==='送付済み'&&x.viewed?'確認中':x.status;
  return'<tr><td>'+esc(x.id)+'</td><td>'+esc(x.title)+(x.draft==='yes'?'<br><span class="tag">下書き</span>':'')+'</td><td>'+esc(x.party_company?x.party_company+' ':'')+esc(x.party_name)+'<br><small>'+esc(x.party_email)+'</small>'+(x.refcode?'<br><span class="tag">紹介コード '+esc(x.refcode)+'</span>':'')+(x.billed?'<br><span class="tag">請求済み：'+esc(x.billed.replace('-','年'))+'月分まで</span>':'')+(x.stopped?'<br><span class="tag cancel">退会（請求停止）</span>':'')+'</td><td><span class="tag '+cls+'">'+esc(st)+'</span></td><td>'+day(x.created)+'</td><td>'+
  (x.status==='締結済み'?'<button class="small-btn" data-pdf="'+esc(x.id)+'">PDFを保存</button>'+(x.template==='kaiin'&&!x.paid?'<button class="small-btn" data-paid="'+esc(x.id)+'">入金を確認した</button>':'')+(x.template==='kaiin'&&!x.stopped?'<button class="small-btn" data-stop="'+esc(x.id)+'">退会（請求を止める）</button>':''):x.status==='取り消し'?'':'<button class="small-btn" data-resend="'+esc(x.id)+'">もう一度送る</button><button class="small-btn" data-cancel="'+esc(x.id)+'">取り消す</button>')+'</td></tr>'}).join('')}).catch(function(e){$('errR').textContent=e.message})}
$('rows').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;$('errR').textContent='';
 if(b.dataset.paid&&confirm('入金を確認しましたか？相手に「会員登録完了」のメールを送ります。'))api('admin.paid',{id:b.dataset.paid}).then(list).catch(function(x){$('errR').textContent=x.message});
 if(b.dataset.stop&&confirm('この会員を退会扱いにして、毎月の請求書を止めますか？（元に戻すときは担当者に連絡してください）'))api('admin.stop',{id:b.dataset.stop}).then(list).catch(function(x){$('errR').textContent=x.message});
 if(b.dataset.resend)api('admin.resend',{id:b.dataset.resend}).then(function(){$('errR').textContent='もう一度送りました。'}).catch(function(x){$('errR').textContent=x.message});
 if(b.dataset.cancel&&confirm('この契約書を取り消しますか？相手はもう開けなくなります。'))api('admin.cancel',{id:b.dataset.cancel}).then(list).catch(function(x){$('errR').textContent=x.message});
 if(b.dataset.pdf)api('admin.pdf',{id:b.dataset.pdf}).then(function(r){var bin=atob(r.pdf),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);var u=URL.createObjectURL(new Blob([a],{type:'application/pdf'}));var l=document.createElement('a');l.href=u;l.download=r.filename;document.body.appendChild(l);l.click();setTimeout(function(){URL.revokeObjectURL(u);l.remove()},2000)}).catch(function(x){$('errR').textContent=x.message})});
var started=false;function go(){if(started){list();inbox();return}started=true;start();inbox();var seen='';try{seen=localStorage.getItem('iryo-adm-tour')||''}catch(x){}if(!seen){var nb=document.createElement('p');nb.className='note';nb.id='tourNote';nb.innerHTML='はじめての方は、右上の<b>「はじめての方へ：操作の案内」</b>を押してください。画面の見方を順番にご案内します（約1分）。';$('todo').insertBefore(nb,$('todoList'));$('tourBtn').classList.add('flash')}}
document.querySelectorAll('.tab').forEach(function(t){t.addEventListener('click',function(){document.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('on',x===t)});document.querySelectorAll('[data-view]').forEach(function(v){v.hidden=v.dataset.view!==t.dataset.v})})});
var IN=[],STEPS=['新規受付','内容確認中','振分け済み','提携先対応中','提案・見積り中','完了','見送り'],ROUTES={},H=36e5,SND=true,lastRed=-1;
try{SND=localStorage.getItem('iryo-snd')!=='off'}catch(x){}
function sndBtn(){$('snd').textContent='警告音：'+(SND?'オン':'オフ');$('snd').setAttribute('aria-pressed',SND)}sndBtn();
$('snd').addEventListener('click',function(){SND=!SND;try{localStorage.setItem('iryo-snd',SND?'on':'off')}catch(x){}sndBtn();if(SND)beep()});
function beep(){try{var A=window.AudioContext||window.webkitAudioContext,c=new A();[0,.35,.7].forEach(function(t){var o=c.createOscillator(),g=c.createGain();o.frequency.value=880;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.18,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.3);o.start(c.currentTime+t);o.stop(c.currentTime+t+.32)})}catch(x){}}
function dt(s){var d=new Date(s);return isNaN(d)?'':(d.getMonth()+1)+'/'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function span(ms){var d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/H);return d?d+'日'+h+'時間':h+'時間'}
function open_(x){return x.status!=='完了'&&x.status!=='見送り'}
function alerts(x){var a=[],now=Date.now();if(!open_(x))return a;
 if(x.status==='新規受付'){var g=now-new Date(x.ts);a.push({lv:g>24*H?'red':'yel',t:g>24*H?'未対応 '+span(g):'未対応'})}
 var idle=(now-new Date(x.updated||x.ts))/864e5;if(x.status!=='新規受付'&&idle>=7)a.push({lv:'red',t:'放置 '+Math.floor(idle)+'日'});else if(x.status!=='新規受付'&&idle>=3)a.push({lv:'yel',t:'進捗の記録なし '+Math.floor(idle)+'日'});
 if(x.next&&new Date(x.next+'T23:59:59')<new Date())a.push({lv:'red',t:'予定日を過ぎた（'+x.next.slice(5).replace('-','/')+'）'});
 if(x.status!=='新規受付'&&x.email){var lc=x.contacted?(now-new Date(x.contacted))/864e5:(now-new Date(x.ts))/864e5;if(lc>=7)a.push({lv:'yel',t:'お客様へ'+Math.floor(lc)+'日報告なし'})}
 if(!x.partner&&['振分け済み','提携先対応中','提案・見積り中'].indexOf(x.status)>=0)a.push({lv:'yel',t:'振分け先が未設定'});
 return a}
function inbox(){api('admin.cases').then(function(r){IN=r.rows||[];ROUTES=r.routes||{};drawRoute();drawIn();todo()}).catch(function(e){$('errB').textContent=e.message})}
function drawIn(){var st=$('fSt').value,pt=$('fPt').value,q=$('fQ').value.trim().toLowerCase();
 var red=0,nw=0;IN.forEach(function(x){x._a=alerts(x);if(x._a.some(function(y){return y.lv==='red'}))red++;if(x.status==='新規受付')nw++});
 $('newCnt').hidden=!nw;$('newCnt').textContent=nw;
 $('alertBar').hidden=!red;$('alertBar').textContent='対応が遅れている案件が '+red+' 件あります。赤い印の案件から対応してください。';
 if(red&&SND&&red!==lastRed)beep();lastRed=red;
 var cnt={};STEPS.forEach(function(s){cnt[s]=0});IN.forEach(function(x){cnt[x.status]=(cnt[x.status]||0)+1});
 $('sum').innerHTML=STEPS.map(function(s){return'<button type="button" data-st="'+s+'"'+(s==='新規受付'&&cnt[s]?' class="red"':'')+'>'+s+'<b>'+cnt[s]+'</b></button>'}).join('');
 var pts={};IN.forEach(function(x){if(x.partner)pts[x.partner]=1});var cur=$('fPt').value;$('fPt').innerHTML='<option value="">すべて</option><option value="-"'+(cur==='-'?' selected':'')+'>振分け先なし</option>'+Object.keys(pts).sort().map(function(p){return'<option'+(p===cur?' selected':'')+'>'+esc(p)+'</option>'}).join('');
 var rows=IN.filter(function(x){if(st===''&&!open_(x))return false;if(st==='alert'&&!x._a.length)return false;if(st&&st!=='all'&&st!=='alert'&&x.status!==st)return false;if(pt==='-'&&x.partner)return false;if(pt&&pt!=='-'&&x.partner!==pt)return false;return!q||[x.no,x.name,x.company,x.email,x.body,x.label,x.fields,x.partner].join(' ').toLowerCase().indexOf(q)>=0});
 if(!rows.length){$('inbox').innerHTML='<p class="hint">'+(IN.length?'条件に合う案件はありません':'まだ受付はありません')+'</p>';return}
 $('inbox').innerHTML=rows.map(function(x){var si=STEPS.indexOf(x.status),stop=x.status==='見送り',now=Date.now(),idle=now-new Date(x.updated||x.ts),id=Math.floor(idle/864e5);
  var cls=x._a.some(function(y){return y.lv==='red'})||x.status==='新規受付'?'new':open_(x)?'doing':'done';
  var sug=[];(x.fields||'').split('、').forEach(function(f){(ROUTES[f]||'').split(/[、,]/).forEach(function(p){p=p.trim();if(p&&sug.indexOf(p)<0)sug.push(p)})});
  return'<div class="ib '+cls+'" data-no="'+esc(x.no)+'"><div class="ib-h"><b>'+(x.status==='新規受付'?'<span class="tg red">未対応</span> ':'')+esc(x.company?x.company+'　':'')+esc(x.name||'（お名前なし）')+'</b><span class="ib-m">'+esc(x.no)+'　受付 '+dt(x.ts)+'</span></div>'+
  '<div class="bar'+(stop?' stop':'')+'" title="'+esc(x.status)+'">'+STEPS.slice(0,6).map(function(s,k){return'<i class="'+(k<=si||stop?'on':'')+'"></i>'}).join('')+'</div>'+
  '<div class="ib-m"><b style="color:var(--ink)">'+esc(x.status)+'</b>　受付から '+span(now-new Date(x.ts))+'　<span class="age '+(open_(x)?(id>=7?'r':id>=3?'y':''):'')+'">最後の対応から '+span(idle)+'</span>'+(x.contacted?'　お客様へ最終連絡 '+dt(x.contacted):'')+'</div>'+
  '<div class="tags">'+x._a.map(function(y){return'<span class="tg '+(y.lv==='red'?'red':'yel')+'">'+esc(y.t)+'</span>'}).join('')+(x.fields?x.fields.split('、').map(function(f){return'<span class="tg">'+esc(f)+'</span>'}).join(''):'<span class="tg">'+esc(x.label)+'</span>')+(x.partner?'<span class="tg pt">振分け先：'+esc(x.partner)+'</span>':(sug.length?'':'<span class="tg yel">振分け先の候補なし</span>'))+'</div>'+
  '<div class="ib-m">'+(x.email?'<a href="mailto:'+esc(x.email)+'">'+esc(x.email)+'</a>':'')+(x.tel?'　<a href="tel:'+esc(String(x.tel).replace(/[^0-9+]/g,''))+'">'+esc(x.tel)+'</a>':'')+'</div>'+
  '<details><summary>受付の内容を見る</summary><pre>'+esc(x.body)+'</pre></details>'+
  '<div class="grid2"><div><label>状態</label><select data-k="status">'+STEPS.map(function(s){return'<option'+(s===x.status?' selected':'')+'>'+s+'</option>'}).join('')+'</select></div>'+
  '<div><label>振分け先'+(sug.length?'（候補：'+esc(sug.join('、'))+'）':'')+'</label><input type="text" data-k="partner" list="pl_'+esc(x.no)+'" value="'+esc(x.partner)+'" placeholder="提携企業・専門家"><datalist id="pl_'+esc(x.no)+'">'+sug.map(function(p){return'<option value="'+esc(p)+'">'}).join('')+'</datalist></div>'+
  '<div><label>担当</label><input type="text" data-k="staff" value="'+esc(x.staff)+'" placeholder="例：中嶋"></div><div><label>次の対応予定日</label><input type="date" data-k="next" value="'+esc(x.next)+'"></div></div>'+
  '<div class="ib-a"><input type="text" data-k="memo" value="'+esc(x.memo)+'" placeholder="対応メモ（何をしたか・次に何をするか）"><button type="button" class="small-btn" data-save>保存</button><button type="button" class="small-btn" data-rep>お客様へ報告を作る</button><button type="button" class="small-btn" data-his>対応の履歴</button></div><div class="hist-box"></div></div>'}).join('')}
$('sum').addEventListener('click',function(e){var b=e.target.closest('[data-st]');if(!b)return;var o=$('fSt');if(![].some.call(o.options,function(op){return op.value===b.dataset.st}))o.insertAdjacentHTML('beforeend','<option>'+b.dataset.st+'</option>');o.value=b.dataset.st;drawIn()});
['fSt','fPt'].forEach(function(id){$(id).addEventListener('change',drawIn)});$('fQ').addEventListener('input',drawIn);$('reloadIn').addEventListener('click',inbox);
setInterval(function(){if(!$('panel').hidden)inbox()},300000);setInterval(function(){if(!$('panel').hidden&&IN.length)drawIn()},60000);
function caseOf(no){return IN.filter(function(x){return x.no===no})[0]}
/* ---- 今やること（データから自動で並べる） ---- */
var KL=null;
function goTab(v){var t=document.querySelector('.tab[data-v="'+v+'"]');if(t)t.click()}
function flash(el){if(!el)return;el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('flash');setTimeout(function(){el.classList.remove('flash')},3000)}
function todo(){var L=[],now=Date.now();
 var nw=IN.filter(function(x){return x.status==='新規受付'}),red=IN.filter(function(x){return(x._a||alerts(x)).some(function(y){return y.lv==='red'})&&x.status!=='新規受付'}),
  past=IN.filter(function(x){return open_(x)&&x.next&&new Date(x.next+'T23:59:59')<new Date()}),
  rep=IN.filter(function(x){return(x._a||[]).some(function(y){return/報告なし/.test(y.t)})}),
  nopt=IN.filter(function(x){return!x.partner&&['振分け済み','提携先対応中','提案・見積り中'].indexOf(x.status)>=0}),
  emptyRt=Object.keys(ROUTES).filter(function(f){return!ROUTES[f]&&!/^会員登録/.test(f)}).length;
 if(nw.length)L.push({c:'red',t:'新しい受付が <b>'+nw.length+'件</b> あります',s:'いちばん上の案件の「受付の内容を見る」で読み、状態を「内容確認中」にして保存します。',b:'新しい受付を表示',f:function(){goTab('inbox');var b=document.querySelector('#sum [data-st="新規受付"]');if(b)b.click();flash($('inbox').querySelector('.ib'))}});
 if(red.length)L.push({c:'red',t:'対応が止まっている案件が <b>'+red.length+'件</b> あります',s:'赤い印の案件です。次の一手を決め、対応メモを書いて保存します。',b:'その案件を表示',f:function(){goTab('inbox');$('fSt').value='alert';drawIn();flash($('inbox').querySelector('.ib'))}});
 if(past.length)L.push({c:'red',t:'対応予定日を過ぎた案件が <b>'+past.length+'件</b>',s:'予定していた対応をして、次の予定日を入れ直します。',b:'表示する',f:function(){goTab('inbox');$('fSt').value='alert';drawIn();flash($('inbox').querySelector('.ib'))}});
 if(KL){var unpaid=KL.filter(function(x){return x.status==='締結済み'&&x.template==='kaiin'&&!x.paid}),wait=KL.filter(function(x){return(x.status==='送付済み'||x.status==='確認中')&&x.draft!=='yes'&&now-new Date(x.created)>3*864e5});
  if(unpaid.length)L.push({c:'',t:'会費の入金確認待ちが <b>'+unpaid.length+'件</b>',s:'通帳やネットバンキングで入金を確かめたら、その行の「入金を確認した」を押します（登録完了のメールが自動で届きます）。',b:'電子契約を開く',f:function(){goTab('keiyaku');flash($('rows').querySelector('[data-paid]'))}});
  if(wait.length)L.push({c:'',t:'3日以上、相手の承認待ちの契約が <b>'+wait.length+'件</b>',s:'相手に届いているか確かめ、必要なら「もう一度送る」を押します。',b:'電子契約を開く',f:function(){goTab('keiyaku');flash($('rows').querySelector('[data-resend]'))}})}
 if(rep.length)L.push({c:'',t:'お客様へ7日以上報告していない案件が <b>'+rep.length+'件</b>',s:'「お客様へ報告を作る」で文面を作り、送るか（または電話で伝えたか）を選びます。',b:'表示する',f:function(){goTab('inbox');$('fSt').value='alert';drawIn();flash($('inbox').querySelector('[data-rep]'))}});
 if(nopt.length)L.push({c:'',t:'振分け先が決まっていない案件が <b>'+nopt.length+'件</b>',s:'案件の「振分け先」に提携先の名前を入れて保存します。',b:'表示する',f:function(){goTab('inbox');$('fPt').value='-';drawIn();flash($('inbox').querySelector('[data-k="partner"]'))}});
 if(emptyRt)L.push({c:'',t:'振分け設定が未登録の分野が <b>'+emptyRt+'分野</b> あります',s:'分野ごとに提携企業を登録しておくと、新しい受付に振分け先が自動で入ります。',b:'振分け設定を開く',f:function(){goTab('route');flash(document.querySelector('#routeRows input[value=""]'))}});
 if(!L.length)L.push({c:'ok',t:'いま、急いでやることはありません',s:'新しい受付が届くと、ここに表示され、警告音でもお知らせします（5分ごとに自動で最新にします）。',b:'',f:null});
 $('todoList').innerHTML=L.map(function(x,i){return'<li class="'+x.c+'"><span>'+x.t+'<small>'+esc(x.s)+'</small></span>'+(x.b?'<button type="button" class="small-btn" data-td="'+i+'">'+esc(x.b)+' ›</button>':'')+'</li>'}).join('');
 $('todoList').querySelectorAll('[data-td]').forEach(function(b){b.onclick=L[+b.dataset.td].f});
 var d=new Date();$('todoAt').textContent=d.getHours()+'時'+('0'+d.getMinutes()).slice(-2)+'分の時点'}
/* ---- 操作の案内（はじめての方） ---- */
var TOUR=[
 ['#todo','今やること','ログインしたら、まずここを見ます。やることが上から順に並び、右のボタンを押すとその場所へ移ります。'],
 ['.tabs','画面の切り替え','「案件管理」「電子契約」「振分け設定」の3つの画面があります。数字は新しい受付の件数です。'],
 ['#sum','状態ごとの件数','押すと、その状態の案件だけを表示します。赤い枠は未対応があるしるしです。'],
 ['#inbox .ib','案件のカード','1件ずつの受付です。帯の色で進み具合が、印で急ぎかどうかが分かります。'],
 ['#inbox .ib .grid2','状態と担当を入れる','状態・振分け先・担当・次の対応予定日を入れます。'],
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
 if((b=e.target.closest('[data-save]'))){var v={no:no};card.querySelectorAll('[data-k]').forEach(function(el){v[el.dataset.k]=String(el.value).trim()});
  var changedSt=v.status!==x.status;b.disabled=true;b.textContent='保存中…';
  api('admin.caseSet',v).then(function(){Object.keys(v).forEach(function(k){x[k]=v[k]});x.updated=new Date().toISOString();b.textContent='保存しました';setTimeout(drawIn,600);if(changedSt&&v.status!=='新規受付')openRpt(x,v.status)})
  .catch(function(er){$('errB').textContent=er.message;b.disabled=false;b.textContent='保存'})}
 if(e.target.closest('[data-rep]'))openRpt(x,x.status==='新規受付'?'受付':x.status);
 if(e.target.closest('[data-his]')){var hb=card.querySelector('.hist-box');hb.innerHTML='<p class="hint">読み込み中…</p>';api('admin.history',{no:no}).then(function(r){hb.innerHTML=r.rows.length?'<ul class="hist">'+r.rows.map(function(h){return'<li>'+dt(h.ts)+'　'+esc(h.kind)+(h.staff?'（'+esc(h.staff)+'）':'')+'　'+esc(h.text.split('\n')[0].slice(0,120))+'</li>'}).join('')+'</ul>':'<p class="hint">履歴はまだありません</p>'}).catch(function(er){hb.textContent=er.message})}});
/* 進捗報告の文章を作る（担当者が直して、送るかどうかを決める） */
var RP=null,ALT=0;
var TX={'受付':['このたびは、医療介護総合支援会にご相談いただき、ありがとうございます。ご相談を受け付けました。\n担当者が内容を確認し、あらためてご連絡いたします。','ご相談をお寄せいただき、ありがとうございます。内容を拝見し、担当者から追ってご連絡いたします。今しばらくお待ちください。'],
'内容確認中':['いただいたご相談の内容を、担当者が確認しております。\n確認のためにお伺いしたいことがある場合は、こちらからご連絡いたします。','ご相談の内容を確認しているところです。進め方の見通しが立ちましたら、あらためてご報告いたします。'],
'振分け済み':['ご相談の内容に合わせて、対応できる提携先・専門家を選びました。\nお客様の情報を提携先へお伝えする前に、あらためてご了承の確認をさせていただきます。','ご相談に対応できる提携先・専門家の候補が決まりました。今後の進め方について、追ってご案内いたします。'],
'提携先対応中':['現在、提携先・専門家とともに、具体的な進め方を検討しております。\n進み具合に応じて、あらためてご報告いたします。','提携先・専門家との間で、ご相談への対応を進めております。次の段階に進みましたら、ご報告いたします。'],
'提案・見積り中':['ご提案の内容（必要に応じてお見積り）をまとめております。\nまとまりしだいお送りいたしますので、ご確認をお願いいたします。','ご提案とお見積りの準備を進めております。整いしだいお届けいたしますので、もうしばらくお待ちください。'],
'完了':['このたびのご相談につきまして、対応が完了いたしましたのでご報告いたします。\nご相談いただき、ありがとうございました。今後もお困りのことがあれば、いつでもご相談ください。','ご相談への対応が完了いたしました。ご協力いただき、ありがとうございました。また何かございましたら、お気軽にお声がけください。'],
'見送り':['ご相談の内容を検討いたしましたが、誠に恐れ入りますが、今回は当会および提携先でのお手伝いが難しいとの結論になりました。\nご期待に沿えず申し訳ございません。状況が変わった際は、あらためてご相談ください。','慎重に検討いたしましたが、今回のご相談は、当会と提携先での対応が難しい状況です。申し訳ございません。別のご相談がございましたら、いつでもお声がけください。']};
var TT={'受付':'受付のお知らせ','内容確認中':'内容確認のご報告','振分け済み':'今後の進め方のご報告','提携先対応中':'進捗のご報告','提案・見積り中':'ご提案準備のご報告','完了':'対応完了のご報告','見送り':'ご相談へのご回答'};
function makeRpt(x,kind){var who=(x.company?x.company+'\n':'')+(x.name&&x.name.indexOf('伏せ')<0?x.name+' 様':'ご相談者様');var t=TX[kind]||TX['提携先対応中'];
 return{s:'【医療介護総合支援会】'+(TT[kind]||'進捗のご報告')+'（受付番号 '+x.no+'）',b:who+'\n\nいつもお世話になっております。医療介護総合支援会です。\n\n'+t[ALT%t.length]+'\n\n受付番号：'+x.no+(x.staff?'\n担当：'+x.staff:'')+'\n\nご不明な点は、このメールにご返信いただくか、お電話でお問い合わせください。\n\n――――――――――――――――\n医療介護総合支援会（運営 株式会社グローブ）\n電話 0120-933-496（受付 10:00〜19:00）\nメール ikshienkai@gmail.com\n――――――――――――――――'}}
function openRpt(x,kind){RP={x:x,kind:kind};ALT=0;var r=makeRpt(x,kind);$('rptS').value=r.s;$('rptB').value=r.b;$('errRp').textContent='';
 $('rptInfo').textContent=(x.company?x.company+'　':'')+x.name+'（'+x.no+'）への報告です。送るかどうかは、担当者が判断してください。';
 var w='';if(!x.email)w='この案件にはメールアドレスがありません。電話で伝えた場合は「電話で伝えた」で記録してください。';else if(x.contacted&&Date.now()-new Date(x.contacted)<48*H)w='前回の連絡（'+dt(x.contacted)+'）から48時間たっていません。連絡が多すぎないか、確かめてから送ってください。';
 $('rptWarn').hidden=!w;$('rptWarn').textContent=w;$('rpSend').disabled=!x.email;$('rpt').hidden=false;var tb=$('rptB');tb.focus();try{tb.setSelectionRange(0,0)}catch(x){}tb.scrollTop=0}
$('rpAlt').addEventListener('click',function(){ALT++;var r=makeRpt(RP.x,RP.kind);$('rptB').value=r.b});
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
 api('admin.login',{id:$('lid').value.trim(),pass:$('lpw').value}).then(function(r){try{sessionStorage.setItem('iryo-adm',r.adminToken)}catch(x){}$('lpw').value='';$('gate').hidden=true;go()})
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
$('logout').addEventListener('click',function(){api('admin.logout',{}).catch(function(){});try{sessionStorage.removeItem('iryo-adm')}catch(x){}location.reload()});
var tok='';try{tok=sessionStorage.getItem('iryo-adm')||''}catch(x){}
if(IN_GAS){$('logout').hidden=true;go()}else if(tok){go()}else{showLogin()}
})();
</script>
'''
ADM_HELP = '<script>window.FORM_NOBAR=true;window.FORM_HELP={"lid":{"t":"担当者のIDを入れます。","ex":"英字の小文字で入れます。分からないときは「ID・パスワードを忘れたとき」を押すと、登録メールに届きます","req":true},"lpw":{"t":"パスワードを入れます。","ex":"大文字・小文字、全角・半角の違いにご注意ください。5回続けて間違えると15分止まります","req":true},"fgCode":{"t":"登録メールに届いた6けたの数字を入れます。","req":true},"fgP1":{"t":"新しいパスワードを8文字以上で決めます。","ex":"英字と数字をまぜると安全です","req":true},"fgP2":{"t":"確認のため、同じパスワードをもう一度入れます。","req":true},"pName":{"t":"契約の相手のお名前（ご担当者）です。","req":true},"pEmail":{"t":"契約書の案内を送る相手のメールアドレスです。","req":true}};</script>\n<script src="../assets/guide.js" data-mode="admin"></script>\n'
open(os.path.join(OUT, "admin.html"), "w", encoding="utf-8").write(HEAD("管理画面") + ADMIN_BODY + '<script src="config.js"></script>\n<script src="api.js"></script>\n' + ADMIN_JS + ADM_HELP + "</body>\n</html>\n")

# ---------- Apps Script 一式 ----------
gs = "/* このファイルは make_keiyaku.py が作りました。直すときは元のファイルを直してください */\n" + TEXTS + CORE + "\n" + open(os.path.join(HERE, "keiyaku_gas_main.js"), encoding="utf-8").read()
open(os.path.join(GAS, "コード.gs"), "w", encoding="utf-8").write(gs)
shim = ("<script>window.IN_GAS=true;\n(function(){" + TEXTS + CORE +
        "window.KEIYAKU_CORE={TEMPLATES:TEMPLATES,FIELDS:FIELDS,normCond:normCond,buildBody:buildBody,yen:yen,MEMBER_LABEL:MEMBER_LABEL};})();\n"
        "window.keiyakuApi=function(a,d){return new Promise(function(res,rej){google.script.run.withSuccessHandler(function(r){r&&r.ok?res(r):rej(new Error(r&&r.error||'うまくいきませんでした'))}).withFailureHandler(function(e){rej(new Error(e&&e.message||String(e)))}).adminCall(a,d)})};</script>\n")
gas_admin = ('<!doctype html><html lang="ja"><head><base target="_top"><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=BIZ+UDPMincho:wght@700&display=swap"><style>'
             + css + '</style></head><body>' + ADMIN_BODY.replace('href="../index.html"', 'href="https://119cm.net/"') + shim + ADMIN_JS + "</body></html>\n")
open(os.path.join(GAS, "admin.html"), "w", encoding="utf-8").write(gas_admin)
print("ok", OUT, GAS)
