/* =====================================================================
   医療介護総合支援会　電子契約（Google Apps Script）
   ・お客様の画面（サイトの /medical/keiyaku/）からの通信を受ける doPost
   ・担当者の管理画面（このスクリプトのウェブアプリ ?admin=1）
   使い方は「設定のしかた.txt」を見てください。
   ===================================================================== */
var SHEET = "契約";
var COLS = ["id", "token", "template", "title", "party_name", "party_company", "party_email", "fields", "required", "require_id", "cond", "note", "prefill", "body", "status", "created", "expires", "viewed", "signed", "values", "seal_file", "id_file", "pdf_id", "hash", "ua", "log", "draft", "paid", "refcode", "billed", "stopped"];
var VALID_DAYS = 30;

function P(k) { return PropertiesService.getScriptProperties().getProperty(k) || ""; }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---- 最初に1回だけ実行：シートとフォルダを作る ---- */
function setup() {
  var pr = PropertiesService.getScriptProperties();
  if (!P("SHEET_ID")) {
    var ss = SpreadsheetApp.create("医療介護総合支援会 電子契約（台帳）");
    var sh = ss.getActiveSheet(); sh.setName(SHEET); sh.appendRow(COLS); sh.setFrozenRows(1);
    pr.setProperty("SHEET_ID", ss.getId());
  }
  inboxSheet_();
  if (!P("FOLDER_ID")) { var f = DriveApp.createFolder("医療介護総合支援会 電子契約"); pr.setProperty("FOLDER_ID", f.getId()); }
  if (!P("ADMIN_EMAILS")) pr.setProperty("ADMIN_EMAILS", Session.getEffectiveUser().getEmail());
  if (!P("NOTIFY_TO")) pr.setProperty("NOTIFY_TO", Session.getEffectiveUser().getEmail());
  if (!P("SIGN_URL")) pr.setProperty("SIGN_URL", "https://119cm.net/keiyaku/index.html");
  Logger.log("準備ができました。台帳: https://docs.google.com/spreadsheets/d/" + P("SHEET_ID") + "  フォルダ: https://drive.google.com/drive/folders/" + P("FOLDER_ID"));
}

/* ---- サイトのフォーム（相談・会員登録の申込み）の受付 ---- */
var INBOX = "受付", INBOX_COLS = ["受付番号", "受付日時", "区分", "お名前", "事業所名・会社名", "メール", "電話", "内容", "状態", "対応メモ", "分野", "振分け先", "担当", "最終更新", "最終連絡", "次の対応予定日", "会員施設の確認", "提携先へ送った記録"];
function inboxSheet_() {
  var ss = SpreadsheetApp.openById(P("SHEET_ID")), sh = ss.getSheetByName(INBOX);
  if (!sh) { sh = ss.insertSheet(INBOX); sh.appendRow(INBOX_COLS); sh.setFrozenRows(1); }
  if (sh.getLastColumn() < INBOX_COLS.length) sh.getRange(1, 1, 1, INBOX_COLS.length).setValues([INBOX_COLS]);
  return sh;
}
function inbox_(d) {
  var cache = CacheService.getScriptCache(), cut = function (x, m) { return String(x == null ? "" : x).slice(0, m || 200); };
  if (+d.elapsed > 0 && +d.elapsed < 3000) throw new Error("送信できませんでした");
  var em = cut(d.email, 120).trim(), okMail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em);
  var n1 = +(cache.get("in_" + em.toLowerCase()) || 0), n2 = +(cache.get("in_all") || 0);
  if (n1 >= 5 || n2 >= 100) throw new Error("送信が続いたため、しばらくお待ちください");
  cache.put("in_" + em.toLowerCase(), String(n1 + 1), 3600); cache.put("in_all", String(n2 + 1), 3600);
  var no = /^[A-Z]{2,3}-[0-9]{6}-[0-9A-Z]{4,8}$/.test(String(d.no || "")) ? d.no : "IK-" + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyMMdd-HHmm") + Math.floor(Math.random() * 1000);
  var body = cut(d.body, 6000), label = cut(d.catLabel || d.entry, 120);
  var fields = (Array.isArray(d.fields) ? d.fields : []).map(function (x) { return cut(x, 40); }).slice(0, 12);
  var partner = segOf_(label).route === "self" ? "自社" : routeFor_(fields);
  var fac = facAuto_(label, body);
  inboxSheet_().appendRow([no, new Date(), label, cut(d.name, 60), cut(d.company, 100), em, "'" + cut(d.tel, 30), body, "新規受付", "", fields.join("、"), partner, "", new Date(), "", "", fac ? JSON.stringify(fac) : "", ""]);
  hist_(no, "受付", "サイトから受付" + (partner ? "（振分け候補：" + partner + "）" : ""), "");
  var mail = { to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］新しい受付 " + no + "　" + label, body: body + "\n\nお名前：" + cut(d.name, 60) + "\nメール：" + em + "\n電話：" + cut(d.tel, 30) + "\n\n受付の一覧：https://docs.google.com/spreadsheets/d/" + P("SHEET_ID") };
  if (okMail) mail.replyTo = em;
  MailApp.sendEmail(mail);
  if (okMail) MailApp.sendEmail({ to: em, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】受付しました（受付番号 " + no + "）", body: cut(d.name, 60) + " 様\n\nお問い合わせありがとうございます。次の内容で受け付けました。\n受付後、原則として3営業日以内にメールでご返信します（土日祝・年末年始を除く）。\n\n受付番号：" + no + "\n\n" + body + "\n\nお心当たりがない場合は、このメールを破棄してください。\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）\n" + P("NOTIFY_TO") });
  return { ok: true, no: no };
}

/* 利用者・ご本人／ご家族の相談：通っている病院・施設が会員かを、会員名簿（電子契約）と照らし合わせる */
function facAuto_(label, body) {
  var g = segOf_(label); if (g.key !== "honnin" && g.key !== "kazoku") return null;
  var m = String(body || "").match(/通っている病院・施設：([^\n]*)/), f = { m: "未確認", kind: "", name: "", addr: "", member: "" };
  if (!m) return f;
  var t = m[1], a = t.match(/（([^）]*)）$/); if (a) { f.addr = a[1]; t = t.slice(0, a.index); }
  var p = t.split("／"); f.kind = (p[0] || "").trim(); f.name = (p.slice(1).join("／") || "").trim();
  if (/まだどこにも/.test(f.kind)) { f.m = "通っている先がない"; return f; }
  var norm = function (x) { return String(x || "").replace(/[\s　]/g, "").replace(/(医療法人|社会福祉法人|株式会社|有限会社|合同会社|一般社団法人|社団|財団)/g, ""); }, n = norm(f.name);
  if (n.length >= 2) rows_().forEach(function (o) {
    if (f.member || o.template !== "kaiin" || o.status !== "締結済み" || o.stopped || o.draft === "yes") return;
    var c = norm(o.party_company); if (c && (c.indexOf(n) >= 0 || n.indexOf(c) >= 0)) { f.member = o.party_company; f.m = "会員の病院・施設"; f.auto = 1; }
  });
  return f;
}

/* ---- 案件管理 ---- */
var STEPS = ["新規受付", "内容確認中", "振分け済み", "提携先対応中", "提案・見積り中", "完了", "見送り"];
/* 種別（企業・働く方・利用者・家族・提携申込み・要望・会員登録）ごとに、状態の並びと振分けのしかたが変わる */
function segOf_(label) { var t = String(label || ""), i = t.indexOf("："); t = (i >= 0 ? t.slice(i + 1) : t).split("／")[0];
  for (var k = 0; k < CASE_SEGS.length; k++) if (CASE_SEGS[k].match.indexOf(t) >= 0) return CASE_SEGS[k];
  for (k = 0; k < CASE_SEGS.length; k++) if (CASE_SEGS[k].key === "none") return CASE_SEGS[k]; }
function isDone_(c) { var s = segOf_(c.label); return s.done.indexOf(c.status) >= 0 || c.status === "完了" || c.status === "見送り"; }
var ALL_STEPS = (function () { var a = STEPS.slice(); CASE_SEGS.forEach(function (s) { s.steps.forEach(function (x) { if (a.indexOf(x) < 0) a.push(x); }); }); return a; })();
var ROUTE = "振分け設定", HIST = "対応履歴";
function sheetOf_(name, head) {
  var ss = SpreadsheetApp.openById(P("SHEET_ID")), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}
function routes_() {
  var sh = sheetOf_(ROUTE, ["分野", "振分け先（提携企業・専門家）", "備考"]), v = sh.getDataRange().getValues(), o = {};
  for (var i = 1; i < v.length; i++) if (v[i][0]) o[String(v[i][0])] = String(v[i][1] || "");
  var add = FIELD_LIST.filter(function (f) { return !(f in o); });
  if (add.length) { sh.getRange(sh.getLastRow() + 1, 1, add.length, 3).setValues(add.map(function (f) { o[f] = ""; return [f, "", ""]; })); }
  return o;
}
var PSHEET = "提携先一覧", PHEAD = ["提携先の名前", "大分類", "中分類", "小分類", "メモ", "ご担当者", "メール（案件の送り先）", "電話", "対応できる地域", "登録日"], PKEY = ["name", "a", "b", "c", "note", "person", "email", "tel", "area", "since"];
function partnerSheet_() { var sh = sheetOf_(PSHEET, PHEAD); if (sh.getLastColumn() < PHEAD.length) sh.getRange(1, 1, 1, PHEAD.length).setValues([PHEAD]); return sh; }
function partners_() { var v = partnerSheet_().getDataRange().getValues(), out = []; for (var i = 1; i < v.length; i++) if (v[i][0]) { var o = {}; PKEY.forEach(function (k, j) { var x = v[i][j]; o[k] = x instanceof Date ? Utilities.formatDate(x, "Asia/Tokyo", "yyyy-MM-dd") : String(x == null ? "" : x); }); out.push(o); } return out; }
function partnerSet_(d) {
  var today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
  var rows = (d.rows || []).filter(function (r) { return r && r.name; }).slice(0, 500).map(function (r) {
    if (r.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(r.email).trim())) throw new Error("「" + r.name + "」のメールアドレスの形が正しくありません");
    return PKEY.map(function (k) { return String(k === "since" ? (r.since || today) : (r[k] || "")).trim().slice(0, k === "note" ? 300 : 120); }); });
  var sh = partnerSheet_(), last = sh.getLastRow(); if (last > 1) sh.getRange(2, 1, last - 1, PHEAD.length).clearContent(); if (rows.length) sh.getRange(2, 1, rows.length, PHEAD.length).setValues(rows);
  return { ok: true, partners: partners_() };
}
function staff_() { return parse_(P("STAFF"), []); }
function staffSet_(d) { var l = (d.list || []).map(function (x) { return String(x).trim().slice(0, 30); }).filter(function (x, i, a) { return x && a.indexOf(x) === i; }).slice(0, 50); PropertiesService.getScriptProperties().setProperty("STAFF", JSON.stringify(l)); return { ok: true, staff: l }; }
// 新しい受付の振分け先：相談の分野から分類を決め、提携先一覧で当てはまる先を選ぶ（なければ予備の分野ごとの振分け）
function routeFor_(fields) {
  var ps = partners_();
  for (var i = 0; i < fields.length; i++) { var m = ROUTE_AUTO[fields[i]]; if (!m) continue;
    var hit = ps.filter(function (p) { return p.a === m[0] && p.b === m[1]; })[0] || ps.filter(function (p) { return p.a === m[0]; })[0]; if (hit) return hit.name; }
  var r = routes_(); for (var j = 0; j < fields.length; j++) if (r[fields[j]]) return r[fields[j]].split(/[、,]/)[0].trim(); return "";
}
function routeSet_(d) {
  var sh = sheetOf_(ROUTE, ["分野", "振分け先（提携企業・専門家）", "備考"]), v = sh.getDataRange().getValues(), idx = {};
  for (var i = 1; i < v.length; i++) idx[String(v[i][0])] = i + 1;
  (d.rows || []).forEach(function (r) {
    var f = String(r.field || "").slice(0, 60), pt = String(r.partners || "").slice(0, 300); if (!f) return;
    if (idx[f]) sh.getRange(idx[f], 2).setValue(pt); else { sh.appendRow([f, pt, ""]); idx[f] = sh.getLastRow(); }
  });
  return { ok: true, routes: routes_() };
}
function hist_(no, kind, text, staff) { sheetOf_(HIST, ["日時", "受付番号", "種類", "内容", "担当"]).appendRow([new Date(), no, kind, String(text || "").slice(0, 3000), staff || ""]); }
function histOf_(no) {
  var v = sheetOf_(HIST, ["日時", "受付番号", "種類", "内容", "担当"]).getDataRange().getValues(), out = [];
  for (var i = v.length - 1; i >= 1; i--) if (String(v[i][1]) === String(no)) out.push({ ts: v[i][0] ? new Date(v[i][0]).toISOString() : "", kind: String(v[i][2]), text: String(v[i][3]), staff: String(v[i][4]) });
  return out;
}
function iso_(x) { return x ? new Date(x).toISOString() : ""; }
function caseRows_() {
  var sh = inboxSheet_(), v = sh.getDataRange().getValues(), out = [];
  for (var i = 1; i < v.length; i++) {
    var r = v[i]; if (!r[0]) continue;
    var st = String(r[8] || "新規受付"); if (st === "対応中") st = "内容確認中";
    out.push({ row: i + 1, no: String(r[0]), ts: iso_(r[1]), label: String(r[2]), name: String(r[3]), company: String(r[4]), email: String(r[5]), tel: String(r[6]), body: String(r[7]), status: st, memo: String(r[9] || ""), fields: String(r[10] || ""), partner: String(r[11] || ""), staff: String(r[12] || ""), updated: iso_(r[13] || r[1]), contacted: iso_(r[14]), next: r[15] ? Utilities.formatDate(new Date(r[15]), "Asia/Tokyo", "yyyy-MM-dd") : "", fac: String(r[16] || ""), fwd: String(r[17] || "") });
  }
  return out;
}
function cases_() {
  var rows = caseRows_().sort(function (a, b) { return a.ts < b.ts ? 1 : -1; }).slice(0, 800);
  rows.forEach(function (x) { delete x.row; });
  return { ok: true, rows: rows, steps: ALL_STEPS, routes: routes_(), partners: partners_(), staff: staff_() };
}
function findCase_(no) { var r = caseRows_(); for (var i = 0; i < r.length; i++) if (r[i].no === String(no)) return r[i]; throw new Error("受付が見つかりません"); }
function caseSet_(d) {
  var c = findCase_(d.no), sh = inboxSheet_(), ch = [];
  if (d.status != null && d.status !== c.status) { if (ALL_STEPS.indexOf(d.status) < 0) throw new Error("状態が正しくありません"); sh.getRange(c.row, 9).setValue(d.status); ch.push("状態：" + c.status + " → " + d.status); }
  if (d.memo != null && d.memo !== c.memo) { sh.getRange(c.row, 10).setValue(String(d.memo).slice(0, 1000)); ch.push("メモ：" + String(d.memo).slice(0, 200)); }
  if (d.partner != null && d.partner !== c.partner) { sh.getRange(c.row, 12).setValue(String(d.partner).slice(0, 100)); ch.push("振分け先：" + (d.partner || "なし")); }
  if (d.staff != null && d.staff !== c.staff) { sh.getRange(c.row, 13).setValue(String(d.staff).slice(0, 40)); ch.push("担当：" + d.staff); }
  if (d.next != null && d.next !== c.next) { sh.getRange(c.row, 16).setValue(d.next ? new Date(d.next + "T09:00:00+09:00") : ""); ch.push("次の対応予定日：" + (d.next || "なし")); }
  if (d.fac != null && d.fac !== c.fac) { var fo = parse_(d.fac, null); if (!fo) throw new Error("会員施設の確認の内容が正しくありません"); sh.getRange(c.row, 17).setValue(JSON.stringify(fo).slice(0, 3000)); ch.push("会員施設の確認：" + (fo.m || "") + (fo.member || fo.name ? "（" + (fo.member || fo.name) + "）" : "") + (fo.plan ? "／" + fo.plan : "")); }
  if (ch.length) { sh.getRange(c.row, 14).setValue(new Date()); hist_(c.no, "更新", ch.join("／"), d.staff || c.staff); }
  return { ok: true };
}
function report_(d) {
  var c = findCase_(d.no), sh = inboxSheet_();
  var subj = String(d.subject || "").slice(0, 200), body = String(d.body || "").slice(0, 5000);
  if (d.send) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) throw new Error("お客様のメールアドレスがありません");
    if (!subj || !body) throw new Error("件名と本文を入れてください");
    MailApp.sendEmail({ to: c.email, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: subj, body: body });
    sh.getRange(c.row, 15).setValue(new Date()); sh.getRange(c.row, 14).setValue(new Date());
    hist_(c.no, "進捗報告（メール送信）", subj + "\n\n" + body, d.staff || c.staff);
  } else if (d.phone) {
    sh.getRange(c.row, 15).setValue(new Date()); sh.getRange(c.row, 14).setValue(new Date());
    hist_(c.no, "進捗報告（電話で伝えた）", body, d.staff || c.staff);
  } else {
    hist_(c.no, "進捗報告（送らなかった）", subj, d.staff || c.staff);
  }
  return { ok: true };
}
/* 案件の内容とお客様の情報を、提携先へメールで送る（担当者が内容を確かめ、お客様の同意を確認したときだけ） */
function forward_(d) {
  var c = findCase_(d.no), sh = inboxSheet_();
  if (d.consent !== true) throw new Error("お客様の同意を確認してください");
  if (segOf_(c.label).route === "self") throw new Error("この種別は提携先へ送りません");
  var p = partners_().filter(function (x) { return x.name === String(d.partner || ""); })[0];
  if (!p) throw new Error("提携先一覧に登録されている提携先を選んでください");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) throw new Error("「" + p.name + "」のメールアドレスが登録されていません（設定の提携先一覧で登録できます）");
  var subj = String(d.subject || "").slice(0, 200), body = String(d.body || "").slice(0, 8000);
  if (!subj || !body) throw new Error("件名と本文を入れてください");
  MailApp.sendEmail({ to: p.email, bcc: P("NOTIFY_TO"), name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: subj, body: body });
  var now = new Date(), ch = ["提携先へ送付：" + p.name];
  if (c.partner !== p.name) { sh.getRange(c.row, 12).setValue(p.name); ch.push("振分け先：" + p.name); }
  if (d.status && d.status !== c.status && ALL_STEPS.indexOf(d.status) >= 0) { sh.getRange(c.row, 9).setValue(d.status); ch.push("状態：" + c.status + " → " + d.status); }
  var log = parse_(c.fwd, []); if (!Array.isArray(log)) log = []; log.push({ ts: now.toISOString(), name: p.name, staff: d.staff || c.staff || "" });
  sh.getRange(c.row, 18).setValue(JSON.stringify(log.slice(-20))); sh.getRange(c.row, 14).setValue(now);
  hist_(c.no, "提携先へ送付（" + p.name + "）", ch.join("／") + "\n\n" + subj + "\n\n" + body, d.staff || c.staff);
  return { ok: true, fwd: JSON.stringify(log.slice(-20)) };
}
/* 1時間ごとに、遅れている案件を担当者へメールで知らせる（同じ案件は1日1回まで）。setupAlerts() を1回実行すると動き出す */
function alertCheck() {
  var now = Date.now(), H = 36e5, list = [], pr = PropertiesService.getScriptProperties(), today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMdd");
  caseRows_().forEach(function (c) {
    if (isDone_(c)) return;
    var why = [];
    if (c.status === "新規受付" && now - new Date(c.ts) > 24 * H) why.push("未対応のまま" + Math.floor((now - new Date(c.ts)) / H) + "時間");
    var idle = (now - new Date(c.updated)) / (24 * H);
    if (idle >= 3) why.push("進捗の記録なし " + Math.floor(idle) + "日");
    if (c.next && new Date(c.next + "T23:59:59+09:00") < new Date()) why.push("対応予定日（" + c.next + "）を過ぎています");
    if (!why.length) return;
    var key = "al_" + c.no + "_" + today; if (pr.getProperty(key)) return; pr.setProperty(key, "1");
    list.push("・" + c.no + "　" + (c.company ? c.company + " " : "") + c.name + "（" + c.status + "）\n　" + why.join("／"));
  });
  if (list.length) MailApp.sendEmail({ to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］対応が遅れている受付が " + list.length + " 件あります", body: list.join("\n\n") + "\n\n管理画面：https://119cm.net/keiyaku/admin.html" });
}
function setupAlerts() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "alertCheck") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("alertCheck").timeBased().everyHours(1).create();
  Logger.log("1時間ごとの確認を設定しました");
  setupBilling();
}

/* ---- 台帳 ---- */
function sheet_() {
  var sh = SpreadsheetApp.openById(P("SHEET_ID")).getSheetByName(SHEET);
  if (sh.getLastColumn() < COLS.length) sh.getRange(1, 1, 1, COLS.length).setValues([COLS]);
  return sh;
}
function rows_() {
  var sh = sheet_(), v = sh.getDataRange().getValues(), out = [];
  for (var i = 1; i < v.length; i++) { var o = { _row: i + 1 }; COLS.forEach(function (c, j) { o[c] = v[i][j]; }); out.push(o); }
  return out;
}
function find_(key, val) { var r = rows_(); for (var i = 0; i < r.length; i++) if (String(r[i][key]) === String(val)) return r[i]; return null; }
function save_(o) {
  var sh = sheet_(), line = COLS.map(function (c) { var v = o[c]; return v == null ? "" : (typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v); });
  if (o._row) sh.getRange(o._row, 1, 1, COLS.length).setValues([line]); else { sh.appendRow(line); }
}
function log_(o, msg) { o.log = (o.log ? o.log + "\n" : "") + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd HH:mm:ss") + "　" + msg; }
function parse_(s, d) { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } }
function newToken_() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ""); }
function newId_() {
  var d = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyMMdd"), n = rows_().filter(function (r) { return String(r.id).indexOf("IKK-" + d) === 0; }).length + 1;
  return "IKK-" + d + "-" + ("00" + n).slice(-3);
}
function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

/* ---- 入口：お客様の画面から ---- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse(e.postData.contents || "{}"), a = String(d.action || "");
    if (d.kind === "inbox") { lock.waitLock(20000); return json(inbox_(d)); }
    if (a.indexOf("admin.") === 0) return json(adminPost_(a, d));
    if (a.indexOf("client.") !== 0) return json({ ok: false, error: "この操作はできません" });
    lock.waitLock(20000);
    if (a === "client.apply") return json(apply_(d));
    return json(client_(a, d));
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  } finally { try { lock.releaseLock(); } catch (x) { } }
}
function doGet(e) {
  if (e && e.parameter && e.parameter.admin) {
    if (!isAdmin_()) return HtmlService.createHtmlOutput("<p style='font:16px sans-serif;padding:24px'>この画面は、登録された担当者の Google アカウントでのみ開けます。</p>");
    return HtmlService.createHtmlOutputFromFile("admin").setTitle("電子契約の管理｜医療介護総合支援会").addMetaTag("viewport", "width=device-width,initial-scale=1");
  }
  return ContentService.createTextOutput("ok");
}
function isAdmin_() {
  var me = String(Session.getActiveUser().getEmail() || "").toLowerCase();
  if (!me) return false;
  return P("ADMIN_EMAILS").toLowerCase().split(/[\s,]+/).indexOf(me) >= 0;
}

/* ---- お客様側の操作 ---- */
function client_(a, d) {
  var o = find_("token", d.token);
  if (!o || !d.token) throw new Error("契約書が見つかりません。メールのボタンから開き直してください。");
  if (o.status === "取り消し") throw new Error("この契約書は取り消されました。");
  var signed = o.status === "締結済み";
  if (!signed && o.expires && new Date(o.expires) < new Date()) throw new Error("リンクの有効期限が切れました。担当者から送り直します。");
  var cache = CacheService.getScriptCache();
  if (a === "client.otp") { otp_(o); save_(o); return { ok: true }; }
  if (a === "client.verify") {
    var tries = +(cache.get("otpt_" + o.token) || 0);
    if (tries >= 8) throw new Error("間違いが続いたため、しばらく入力できません。認証コードを送り直してください。");
    if (!d.code || cache.get("otp_" + o.token) !== String(d.code).replace(/\D/g, "")) { cache.put("otpt_" + o.token, String(tries + 1), 1800); throw new Error("認証コードが違います。メールの6けたの数字を入れてください。"); }
    cache.remove("otp_" + o.token); cache.remove("otpt_" + o.token);
    var sess = newToken_(); cache.put("sess_" + sess, o.token, 7200);
    log_(o, "メール認証"); save_(o);
    return { ok: true, sess: sess };
  }
  var authed = d.sess && cache.get("sess_" + d.sess) === o.token;
  if (a === "client.get") {
    var t = tplOf(o.template);
    if (!authed) return { ok: true, needOtp: true, contract: { id: o.id, title: o.title, party_name: o.party_name, party_company: o.party_company, email: maskMail_(o.party_email), issuer: ISSUER } };
    if (!o.viewed) { o.viewed = new Date(); log_(o, "内容を表示"); save_(o); }
    var fields = parse_(o.fields, []), req = parse_(o.required, []), pre = parse_(o.prefill, {});
    return { ok: true, contract: { id: o.id, title: o.title, status: o.status, draft: o.draft === "yes", party_name: o.party_name, party_company: o.party_company, body: o.body, fields: fields.map(function (k) { return { key: k, label: fieldLabel(t, k), type: FIELDS[k].type, ac: FIELDS[k].ac || "", required: req.indexOf(k) >= 0, value: pre[k] || "" }; }), requireId: o.require_id === "yes" || o.require_id === true, adult: !!(t && t.adult), seal: t ? t.seal : "round", issuer: ISSUER, signed: signed } };
  }
  if (!authed) throw new Error("確認の時間が過ぎました。画面を開き直して、認証コードを入れてください。");
  if (a === "client.sign") return sign_(o, d);
  if (a === "client.pdf") {
    if (!signed || !o.pdf_id) throw new Error("契約書はまだできていません。");
    var f = DriveApp.getFileById(o.pdf_id);
    return { ok: true, pdf: Utilities.base64Encode(f.getBlob().getBytes()), filename: f.getName() };
  }
  throw new Error("不明な操作です");
}
function otp_(o) {
  var cache = CacheService.getScriptCache(), cnt = +(cache.get("otpn_" + o.token) || 0);
  if (cnt >= 5) throw new Error("認証コードを送る回数が多すぎます。1時間ほどおいてお試しください。");
  var code = ("00000" + Math.floor(Math.random() * 1000000)).slice(-6);
  cache.put("otp_" + o.token, code, 900); cache.put("otpn_" + o.token, String(cnt + 1), 3600);
  MailApp.sendEmail({ to: o.party_email, name: ISSUER.service, subject: "【" + ISSUER.service + "】認証コード " + code, body: o.party_name + " 様\n\n電子契約の認証コードは " + code + " です（15分間有効）。\n開いている画面に入力してください。\n\nお心当たりがない場合は、このメールを破棄してください。\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）" });
  log_(o, "認証コードを送信");
}
/* サイトの「会員登録の申込み」から、その場で契約書を作る（協賛会員は審査があるため対象外） */
function apply_(d) {
  var type = String(d.type || ""), email = String(d.email || "").trim(), cache = CacheService.getScriptCache();
  if (["jigyosho", "hojin", "kojin"].indexOf(type) < 0) throw new Error("会員の種類が正しくありません");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !d.name) throw new Error("お名前とメールアドレスを入れてください");
  var ke = "apl_" + email.toLowerCase(), n1 = +(cache.get(ke) || 0), n2 = +(cache.get("apl_all") || 0);
  if (n1 >= 3 || n2 >= 60) throw new Error("申込みが続いたため、しばらくお待ちください");
  cache.put(ke, String(n1 + 1), 3600); cache.put("apl_all", String(n2 + 1), 3600);
  var cut = function (x, m) { return String(x || "").trim().slice(0, m || 120); };
  var kj = type === "kojin", t = tplOf(kj ? "kojin" : "kaiin");
  var cond = kj ? "" : normCond({ type: type, pay: d.pay, sites: d.sites, staff: d.staff, referrer: cut(d.referrer, 60), founder: true });
  var o = { id: newId_(), token: newToken_(), template: t.key, title: t.title, party_name: cut(d.name, 40), party_company: kj ? "" : cut(d.org, 80), party_email: email, fields: t.fields.slice(), required: t.required, require_id: t.requireId ? "yes" : "", cond: cond, note: "",
    prefill: kj ? { name: cut(d.name, 40), address: cut(d.address), phone: cut(d.phone, 20) } : { company: cut(d.org, 80), address: cut(d.address), rep: cut(d.rep, 40), name: cut(d.name, 40), phone: cut(d.phone, 20) },
    status: "送付済み", created: new Date(), expires: new Date(Date.now() + VALID_DAYS * 864e5), draft: "" };
  o.body = buildBody(t.key, cond, "", kj ? o.party_name : o.party_company);
  log_(o, "サイトの申込みから作成（受付番号 " + cut(d.no, 30) + "）");
  otp_(o); save_(o);
  MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［電子契約］サイトから申込み：" + o.id + "　" + (o.party_company ? o.party_company + " " : "") + o.party_name, body: o.title + "\n" + o.id + "（受付番号 " + cut(d.no, 30) + "）\n" + (o.party_company ? o.party_company + "　" : "") + o.party_name + "（" + email + "）\n" + (cond ? condText(cond) + "\n" : "") + "連絡事項：" + cut(d.note, 500) + "\n\n申込者はそのまま電子契約の画面に進んでいます。締結するとまた通知します。" });
  return { ok: true, token: o.token };
}
function maskMail_(m) { m = String(m); var p = m.split("@"); return p[0].slice(0, 2) + "***@" + (p[1] || ""); }

function sign_(o, d) {
  if (o.status === "締結済み") throw new Error("この契約はすでに結ばれています。");
  if (o.draft === "yes") throw new Error("この書面は下書き（確認用）のため、締結できません。");
  if (!d.agree) throw new Error("内容に同意する欄に印を付けてください。");
  var fields = parse_(o.fields, []), req = parse_(o.required, []), v = {}, t = tplOf(o.template);
  fields.forEach(function (k) { v[k] = String((d.values || {})[k] || "").trim().slice(0, 300); });
  req.forEach(function (k) { if (!v[k]) throw new Error(fieldLabel(t, k) + "を記入してください。"); });
  if (t && t.adult && v.birth) { var b = new Date(v.birth), lim = new Date(); lim.setFullYear(lim.getFullYear() - 18); if (!(b <= lim)) throw new Error("18歳未満の方は登録できません。"); }
  if (!/^data:image\/png;base64,/.test(d.sealPng || "")) throw new Error("押印してください。");
  var folder = DriveApp.getFolderById(P("FOLDER_ID"));
  var seal = folder.createFile(Utilities.newBlob(Utilities.base64Decode(d.sealPng.split(",")[1]), "image/png", o.id + "_印影.png"));
  o.seal_file = seal.getId();
  if (o.require_id === "yes" || o.require_id === true) {
    if (!/^data:image\/jpeg;base64,/.test(d.idImage || "")) throw new Error("本人確認書類の写真を添付してください。");
    var idf = folder.createFile(Utilities.newBlob(Utilities.base64Decode(d.idImage.split(",")[1]), "image/jpeg", o.id + "_本人確認書類.jpg"));
    o.id_file = idf.getId();
  }
  o.values = v; o.signed = new Date(); o.status = "締結済み"; o.ua = String(d.ua || "").slice(0, 300);
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, o.id + "\n" + o.body + "\n" + JSON.stringify(v) + "\n" + d.sealPng + "\n" + o.signed.toISOString(), Utilities.Charset.UTF_8);
  o.hash = digest.map(function (b) { return ("0" + ((b + 256) % 256).toString(16)).slice(-2); }).join("");
  log_(o, "承認（締結）"); 
  var pdf = makePdf_(o, d.sealPng);
  var pf = folder.createFile(pdf); o.pdf_id = pf.getId();
  save_(o);
  var mail = { name: ISSUER.service, replyTo: P("NOTIFY_TO"), attachments: [pdf] };
  MailApp.sendEmail(Object.assign({ to: o.party_email, subject: "【" + ISSUER.service + "】" + o.title + "（締結済み）", body: o.party_name + " 様\n\nお手続きありがとうございました。押印済みの契約書（PDF）をお送りします。大切に保管してください。\n契約番号：" + o.id + "\n\n" + (o.template === "kaiin" ? "お振込先と金額は、担当者から別のメールでご案内します。\n\n" : "") + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）" }, mail));
  MailApp.sendEmail(Object.assign({ to: P("NOTIFY_TO"), subject: "［電子契約］締結：" + o.id + "　" + (o.party_company ? o.party_company + " " : "") + o.party_name, body: o.title + "\n" + o.id + "\n" + (o.party_company ? o.party_company + "　" : "") + o.party_name + "（" + o.party_email + "）\n\n台帳：https://docs.google.com/spreadsheets/d/" + P("SHEET_ID") }, mail));
  if (o.template === "kaiin") {
    var c0 = typeof o.cond === "string" ? parse_(o.cond, null) : o.cond;
    if (c0) { var nf = nextFirst(new Date()), ns = nf.getFullYear() + "-" + ("0" + (nf.getMonth() + 1)).slice(-2); if (!c0.start || c0.start.slice(0, 7) < ns) c0.start = ns; o.cond = normCond(c0); save_(o); }
    payMail_(o);
  }
  if (o.template === "kojin") refMail_(o);
  return { ok: true, pdf: Utilities.base64Encode(pdf.getBytes()), filename: pdf.getName() };
}

/* ---- 個人会員の紹介コード（締結したら自動で作って送る） ---- */
function refMail_(o) {
  if (o.refcode) return;
  var used = {}; rows_().forEach(function (r) { if (r.refcode) used[r.refcode] = 1; });
  var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", code = "";
  do { code = "SK-"; for (var i = 0; i < 5; i++) code += A.charAt(Math.floor(Math.random() * A.length)); } while (used[code]);
  o.refcode = code; save_(o);
  MailApp.sendEmail({ to: o.party_email, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】紹介コードのお知らせ", body: o.party_name + " 様\n\n個人会員（営業協力者）の登録が完了しました。あなたの紹介コードは次のとおりです。\n\n紹介コード：" + code + "\n\n事業所・法人をご紹介いただくときは、会員登録の申込み画面の「紹介者」欄に、このコードを書いてもらってください。\n会員登録の申込み：https://119cm.net/member/apply.html\n\n紹介料の仕組みと決まりごと：https://119cm.net/member/index.html#shokai\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + P("NOTIFY_TO") });
  MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［電子契約］紹介コードを発行：" + code + "　" + o.party_name, body: o.id + "\n" + o.party_name + "（" + o.party_email + "）に紹介コード " + code + " を発行し、メールで送りました。" });
}

/* ---- 会費の振込のご案内（締結したら自動で送る）。振込先はスクリプト プロパティ BANK_INFO に書く ---- */
function payMail_(o) {
  var c = typeof o.cond === "string" ? parse_(o.cond, null) : o.cond;
  if (!c || !c.first) return;
  c.dueText = Utilities.formatDate(new Date(Date.now() + 7 * 864e5), "Asia/Tokyo", "yyyy年M月d日");
  var bank = P("BANK_INFO"), who = (o.party_company ? o.party_company + "　" : "") + o.party_name + " 様";
  var kana = String(o.id).replace(/[^0-9]/g, "");
  if (!bank) {
    MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［電子契約］振込先が未設定です：" + o.id, body: "BANK_INFO（振込先）が設定されていないため、" + who + "への振込のご案内を自動で送れませんでした。手でご案内してください。\n\nお振込み額：" + yen(c.first) + "（" + c.dueText + "まで）" });
    return;
  }
  var body = who + "\n\n" + ISSUER.service + "へのご入会のお手続き、ありがとうございました。\n初回の会費のお振込みについてご案内します。\n\n" +
    "■お振込み額（税込）：" + yen(c.first) + (c.pay === "year" ? "（年間払い：" + c.startText.replace(/\d+日$/, "") + "からの12か月分）" : "（月払い：" + c.startText.replace(/\d+日$/, "") + "分）") + "\n" +
    "■お振込みの期限：" + c.dueText + "\n" +
    "■お振込先：\n" + bank + "\n" +
    "■お振込みの名義：ご依頼人名の前に、番号「" + kana + "」を入れてください（例：" + kana + " " + (o.party_company || o.party_name) + "）\n" +
    "■振込手数料：恐れ入りますが、ご負担をお願いします。\n\n" +
    "入会した月の会費は無料です。\n" +
    (c.pay === "month" ? "以後は、毎月1日に翌月分（" + yen(c.monthly) + "）の請求書をメールでお送りします。お支払期限は毎月10日です。\n" : "以後は、更新の前の月の1日に、次の12か月分の請求書をメールでお送りします（お支払期限はその月の10日）。\n") +
    "入金を確認しましたら、会員登録完了のお知らせをお送りします。\n\n契約番号：" + o.id + "\n\n" + invoiceText_(o, c, who) + "\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）\n" + P("NOTIFY_TO");
  MailApp.sendEmail({ to: o.party_email, bcc: P("NOTIFY_TO"), name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】会費のお振込みのご案内（" + yen(c.first) + "・" + c.dueText + "まで）", body: body });
  o.billed = JSON.stringify([c.start.slice(0, 7)]);
  log_(o, "振込のご案内（請求書 " + c.start.slice(0, 7) + "分・期限 " + c.dueText + "）を送信"); save_(o);
}
/* 適格請求書（メール本文に載せる） */
function invoiceText_(o, c, who) {
  var amt = Number(c.first) || 0, tax = Math.floor(amt * 10 / 110), d = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy年M月d日");
  var kind = (MEMBER_LABEL[c.type] || "会員") + "　会費" + (c.pay === "year" ? "（年間払い：" + c.startText.replace(/\d+日$/, "") + "からの12か月分）" : "（月払い：" + c.startText.replace(/\d+日$/, "") + "分）");
  return "━━━━━━ ご請求書（適格請求書） ━━━━━━\n" +
    "宛名：" + who + "\n" +
    "発行日：" + d + "\n" +
    "請求番号：" + o.id + "-" + String(c.start || "").slice(0, 7).replace("-", "") + "\n" +
    "内容：" + ISSUER.service + "　" + kind + "\n" +
    "ご請求額（税込）：" + yen(amt) + "\n" +
    "　10％対象：" + yen(amt) + "（うち消費税 " + yen(tax) + "）\n" +
    "お支払期限：" + c.dueText + "\n" +
    "発行者：" + ISSUER.name + "（" + ISSUER.service + "）\n" +
    "　" + ISSUER.addr + "\n" +
    "登録番号：" + ISSUER.invoice + "\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "このメールが請求書を兼ねます。保存しておいてください。";
}
/* ---- 毎月1日：翌月分の請求書を自動で送る（期限はその月の10日） ---- */
function monthlyBilling() {
  var now = new Date(), nf = nextFirst(now), T = nf.getFullYear() + "-" + ("0" + (nf.getMonth() + 1)).slice(-2);
  var due = Utilities.formatDate(new Date(now.getFullYear(), now.getMonth(), 10), "Asia/Tokyo", "yyyy年M月d日");
  var sent = [], bank = P("BANK_INFO") || "（振込先は、入会時のご案内をご覧ください）";
  rows_().forEach(function (o) {
    if (o.template !== "kaiin" || o.status !== "締結済み" || o.stopped || o.draft === "yes") return;
    var c = parse_(o.cond, null); if (!c || !c.start) return;
    var billed = parse_(o.billed, []), S = String(c.start).slice(0, 7);
    if (T < S || billed.indexOf(T) >= 0) return;
    var diff = (+T.slice(0, 4) - +S.slice(0, 4)) * 12 + (+T.slice(5, 7) - +S.slice(5, 7));
    if (c.pay === "year" && diff % 12 !== 0) return;
    var amt = c.pay === "year" ? c.monthly * 10 : c.monthly, who = (o.party_company ? o.party_company + "　" : "") + o.party_name + " 様";
    var ymT = +T.slice(0, 4) + "年" + (+T.slice(5, 7)) + "月";
    var term = c.pay === "year" ? ymT + "からの12か月分" : ymT + "分";
    var inv = invoiceText_(o, { type: c.type, pay: c.pay, first: amt, start: T, startText: ymT + "1日", dueText: due }, who);
    var body = who + "\n\nいつも" + ISSUER.service + "をご利用いただき、ありがとうございます。\n" + term + "の会費のご請求をお送りします。\n\n" +
      "■お振込み額（税込）：" + yen(amt) + "（" + term + "）\n■お振込みの期限：" + due + "\n■お振込先：\n" + bank + "\n■お振込みの名義：ご依頼人名の前に、番号「" + String(o.id).replace(/[^0-9]/g, "") + "」を入れてください\n■振込手数料：恐れ入りますが、ご負担をお願いします。\n\n" +
      inv + "\n\n行き違いでお振込み済みの場合は、ご容赦ください。\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）\n" + P("NOTIFY_TO");
    try {
      MailApp.sendEmail({ to: o.party_email, bcc: P("NOTIFY_TO"), name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】" + term + " 会費のご請求（" + yen(amt) + "・" + due + "まで）", body: body });
      billed.push(T); o.billed = JSON.stringify(billed); log_(o, "請求書（" + T + "分・期限 " + due + "）を送信"); save_(o);
      sent.push(o.id + "　" + who + "　" + yen(amt) + "（" + term + "）");
    } catch (e) { sent.push("【送れませんでした】" + o.id + "　" + who + "　" + e.message); }
  });
  if (sent.length) MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［" + ISSUER.service + "］" + T + "分の請求書を " + sent.length + " 件送りました", body: sent.join("\n") + "\n\nお支払期限：" + due + "\n入金は通帳などでご確認ください。" });
  return sent.length;
}
function setupBilling() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "monthlyBilling") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("monthlyBilling").timeBased().onMonthDay(1).atHour(9).inTimezone("Asia/Tokyo").create();
  Logger.log("毎月1日 9時ごろに、翌月分の請求書を自動で送る設定をしました");
}

/* 入金を確認したら、会員登録完了のお知らせを送る */
function paid_(o) {
  if (o.status !== "締結済み") throw new Error("締結済みの契約ではありません");
  if (o.paid) throw new Error("すでに入金確認済みです");
  var c = typeof o.cond === "string" ? parse_(o.cond, null) : o.cond;
  o.paid = new Date(); log_(o, "入金確認・登録完了のお知らせを送信"); save_(o);
  MailApp.sendEmail({ to: o.party_email, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】会員登録が完了しました", body: (o.party_company ? o.party_company + "　" : "") + o.party_name + " 様\n\nお振込みを確認しました。ありがとうございます。\n" + ISSUER.service + "の会員登録が完了しました。\n\n" + (c ? "会員区分：" + MEMBER_LABEL[c.type] + "\n会費の発生日：" + c.startText + "\n契約期間：" + c.startText + "〜" + c.endText + "\n" : "") + "契約番号：" + o.id + "\n\nご相談は、このメールへの返信、またはサイトの相談フォームからお寄せください。\nhttps://119cm.net/contact/index.html\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）" });
  return { ok: true };
}

function makePdf_(o, sealPng) {
  var v = typeof o.values === "string" ? parse_(o.values, {}) : o.values || {};
  var body = esc_(o.body).replace(/\[\[(\w+)\]\]/g, function (_, k) { return "<b>" + esc_(v[k] || "") + "</b>"; });
  var co = P("COMPANY_SEAL") ? "<img src='data:image/png;base64," + Utilities.base64Encode(DriveApp.getFileById(P("COMPANY_SEAL")).getBlob().getBytes()) + "' style='width:80px;height:80px'>" : "";
  var rows = parse_(o.fields, []).map(function (k) { return "<tr><th>" + esc_(fieldLabel(tplOf(o.template), k)) + "</th><td>" + esc_(v[k] || "") + "</td></tr>"; }).join("");
  var tz = function (x) { return x ? Utilities.formatDate(new Date(x), "Asia/Tokyo", "yyyy年M月d日 HH:mm") : ""; };
  var html = "<html><head><meta charset='utf-8'><style>body{font-family:'Noto Serif JP','Noto Sans JP',serif;font-size:10.5pt;line-height:1.8;color:#111}h1{font-size:15pt;text-align:center;letter-spacing:.2em;margin:0 0 4px}.no{text-align:right;font-size:9pt}.doc{white-space:pre-wrap}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #888;padding:4px 8px;text-align:left;font-size:9.5pt;vertical-align:top}th{background:#eef4f4;width:32%}.sig{display:flex;gap:40px;margin-top:14px}.box{flex:1}.aud{font-size:8pt;color:#333;word-break:break-all}</style></head><body>" +
    "<p class='no'>契約番号 " + esc_(o.id) + "</p><h1>" + esc_(o.title) + "</h1><div class='doc'>" + body + "</div>" +
    "<h2 style='font-size:11pt;margin-top:18px'>記入内容</h2><table>" + rows + "</table>" +
    "<table><tr><th>甲（当社）</th><td>" + esc_(ISSUER.addr) + "<br>" + esc_(ISSUER.name) + "　" + esc_(ISSUER.rep) + "　" + co + "</td></tr>" +
    "<tr><th>" + (o.template === "kaiin" || o.template === "kojin" ? "申込者" : "乙") + "</th><td>" + esc_(v.address || "") + "<br>" + esc_(v.company || o.party_company || "") + "　" + esc_(v.rep || v.name || o.party_name) + "　<img src='" + sealPng + "' style='width:70px;height:70px;vertical-align:middle'></td></tr></table>" +
    "<h2 style='font-size:11pt;margin-top:14px'>電子契約の記録</h2><table class='aud'><tr><th>締結日時</th><td>" + tz(o.signed) + "</td></tr><tr><th>署名者のメール（認証済み）</th><td>" + esc_(o.party_email) + "</td></tr><tr><th>送付・表示</th><td>送付 " + tz(o.created) + "／表示 " + tz(o.viewed) + "</td></tr><tr><th>改ざん検知用の値（SHA-256）</th><td>" + esc_(o.hash) + "</td></tr><tr><th>利用環境</th><td>" + esc_(o.ua) + "</td></tr></table>" +
    "<p style='font-size:8.5pt'>この契約書は、電子契約で締結されたものです。署名者はメールに届いた認証コードで本人確認をしたうえで、内容を確認し、押印・承認しました。原本はこの電子データです。</p></body></html>";
  return Utilities.newBlob(html, "text/html", "x.html").getAs("application/pdf").setName(o.id + "_" + o.title.replace(/[（）\s]/g, "") + ".pdf");
}

/* ---- 管理画面から（google.script.run で呼ぶ） ---- */
/* ---- IDとパスワードでのログイン（サイトの「担当者ログイン」から） ----
   スクリプト プロパティに ADMIN_ID と ADMIN_PASS を入れておくと、最初のログインで
   パスワードを暗号化（ハッシュ化）して保存し、ADMIN_PASS は自動で消します。 */
function hash_(salt, pass) {
  var h = salt + "|" + pass;
  for (var i = 0; i < 2000; i++) {
    h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + "|" + salt, Utilities.Charset.UTF_8).map(function (b) { return ("0" + ((b + 256) % 256).toString(16)).slice(-2); }).join("");
  }
  return h;
}
function sameStr_(a, b) { a = String(a); b = String(b); var r = a.length ^ b.length; for (var i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return r === 0; }
function login_(d) {
  var pr = PropertiesService.getScriptProperties(), cache = CacheService.getScriptCache();
  var id = String(d.id || "").trim(), pass = String(d.pass || "");
  if (!P("ADMIN_ID") || (!P("ADMIN_PASS") && !P("ADMIN_PASS_HASH"))) throw new Error("IDとパスワードがまだ設定されていません");
  var kf = "lf_" + id.toLowerCase(), nf = +(cache.get(kf) || 0), ng = +(cache.get("lf_all") || 0);
  if (nf >= 5 || ng >= 30) throw new Error("間違いが続いたため、しばらくログインできません（15分ほどお待ちください）");
  if (P("ADMIN_PASS")) {
    var salt = Utilities.getUuid().replace(/-/g, "");
    pr.setProperty("ADMIN_PASS_SALT", salt); pr.setProperty("ADMIN_PASS_HASH", hash_(salt, P("ADMIN_PASS"))); pr.deleteProperty("ADMIN_PASS");
  }
  var ok = sameStr_(id.toLowerCase(), P("ADMIN_ID").toLowerCase()) && sameStr_(hash_(P("ADMIN_PASS_SALT"), pass), P("ADMIN_PASS_HASH"));
  if (!ok) {
    cache.put(kf, String(nf + 1), 900); cache.put("lf_all", String(ng + 1), 3600);
    if (nf + 1 >= 5) MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［" + ISSUER.service + "］管理画面のログインの失敗が続いています", body: "ID「" + id.slice(0, 40) + "」でのログインに5回失敗したため、15分間止めました。心当たりがなければ、パスワードを変えてください。" });
    throw new Error("IDまたはパスワードが違います");
  }
  cache.remove(kf);
  var tok = newToken_(); cache.put("adm_" + tok, P("ADMIN_ID"), 21600);
  return { ok: true, adminToken: tok };
}
// パスワードを忘れたとき：登録メール（NOTIFY_TO）だけにIDと確認コードを送る
function forgot_() {
  if (!P("ADMIN_ID")) throw new Error("IDとパスワードがまだ設定されていません");
  var cache = CacheService.getScriptCache(), n = +(cache.get("fg_n") || 0);
  if (n >= 5) throw new Error("確認コードの送信が続いたため、しばらく送れません（1時間ほどお待ちください）");
  cache.put("fg_n", String(n + 1), 3600);
  var code = String(Math.floor(100000 + Math.random() * 900000));
  cache.put("fg_code", code, 1800); cache.remove("fg_bad");
  MailApp.sendEmail({ to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］管理画面のパスワード変更の確認コード", body: "管理画面で「ID・パスワードを忘れたとき」が使われました。\n\nID：" + P("ADMIN_ID") + "\n確認コード：" + code + "（30分有効）\n\n管理画面：https://119cm.net/keiyaku/admin.html\n\n心当たりがない場合は、このメールを無視してください（パスワードは変わりません）。" });
  return { ok: true };
}
function reset_(d) {
  var cache = CacheService.getScriptCache(), code = cache.get("fg_code"), bad = +(cache.get("fg_bad") || 0);
  var c = String(d.code || "").replace(/\D/g, ""), pass = String(d.pass || "");
  if (!code) throw new Error("確認コードの期限が切れました。もう一度送ってください。");
  if (bad >= 5) { cache.remove("fg_code"); throw new Error("間違いが続いたため、コードを無効にしました。もう一度送ってください。"); }
  if (!sameStr_(c, code)) { cache.put("fg_bad", String(bad + 1), 1800); throw new Error("確認コードが違います"); }
  if (pass.length < 8 || pass.length > 100) throw new Error("パスワードは8文字以上にしてください");
  var pr = PropertiesService.getScriptProperties(), salt = Utilities.getUuid().replace(/-/g, "");
  pr.setProperty("ADMIN_PASS_SALT", salt); pr.setProperty("ADMIN_PASS_HASH", hash_(salt, pass)); pr.deleteProperty("ADMIN_PASS");
  cache.remove("fg_code"); cache.remove("fg_bad"); cache.remove("lf_" + P("ADMIN_ID").toLowerCase()); cache.remove("lf_all");
  MailApp.sendEmail({ to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］管理画面のパスワードを変えました", body: "管理画面のパスワードが変更されました（" + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm") + "）。\n心当たりがない場合は、すぐに確認してください。" });
  return { ok: true, id: P("ADMIN_ID") };
}
function adminPost_(a, d) {
  try {
    if (a === "admin.login") return login_(d);
    if (a === "admin.forgot") return forgot_();
    if (a === "admin.reset") return reset_(d);
    var cache = CacheService.getScriptCache(), t = String(d.adminToken || "");
    if (a === "admin.logout") { if (t) cache.remove("adm_" + t); return { ok: true }; }
    if (!t || !cache.get("adm_" + t)) return { ok: false, error: "ログインの有効期限が切れました。もう一度ログインしてください。", needLogin: true };
    cache.put("adm_" + t, cache.get("adm_" + t), 21600);
    return adminDo_(a, d);
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; }
}
function adminCall(a, d) {
  try {
    if (!isAdmin_()) throw new Error("担当者として登録されたアカウントではありません");
    return adminDo_(a, d);
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; }
}
function adminDo_(a, d) {
  try {
    d = d || {};
    if (a === "admin.templates") return { ok: true, templates: TEMPLATES, fields: FIELDS };
    if (a === "admin.cases") return cases_();
    if (a === "admin.caseSet") return caseSet_(d);
    if (a === "admin.report") return report_(d);
    if (a === "admin.forward") return forward_(d);
    if (a === "admin.history") return { ok: true, rows: histOf_(d.no) };
    if (a === "admin.routeSet") return routeSet_(d);
    if (a === "admin.partnerSet") return partnerSet_(d);
    if (a === "admin.staffSet") return staffSet_(d);
    if (a === "admin.preview") return { ok: true, cond: normCond(d.cond), body: buildBody(d.template, d.cond, d.note, d.party) };
    if (a === "admin.issue") return issue_(d);
    if (a === "admin.list") return { ok: true, rows: rows_().reverse().slice(0, 300).map(function (r) { return { id: r.id, title: r.title, party_name: r.party_name, party_company: r.party_company, party_email: r.party_email, status: r.status, template: r.template, paid: r.paid ? new Date(r.paid).toISOString() : "", created: r.created ? new Date(r.created).toISOString() : "", viewed: r.viewed ? new Date(r.viewed).toISOString() : "", signed: r.signed ? new Date(r.signed).toISOString() : "", draft: r.draft, refcode: r.refcode || "", typeLabel: (function () { var c = parse_(r.cond, null); return c && MEMBER_LABEL[c.type] || ""; })(), pay: (function () { var c = parse_(r.cond, null); return c ? c.pay : ""; })(), phone: (parse_(r.values, {}) || {}).phone || "", billed: parse_(r.billed, []).slice(-1)[0] || "", stopped: r.stopped ? new Date(r.stopped).toISOString() : "" }; }) };
    var o = find_("id", d.id); if (!o) throw new Error("見つかりません");
    if (a === "admin.resend") { if (o.status === "締結済み" || o.status === "取り消し") throw new Error("送り直せない状態です"); o.expires = new Date(Date.now() + VALID_DAYS * 864e5); sendInvite_(o); log_(o, "送り直し"); save_(o); return { ok: true }; }
    if (a === "admin.paid") return paid_(o);
    if (a === "admin.stop") { if (o.stopped) throw new Error("すでに請求を止めています"); o.stopped = new Date(); log_(o, "退会・請求を停止"); save_(o); return { ok: true }; }
    if (a === "admin.cancel") { if (o.status === "締結済み") throw new Error("締結済みの契約は取り消せません"); o.status = "取り消し"; log_(o, "取り消し"); save_(o); return { ok: true }; }
    if (a === "admin.pdf") { if (!o.pdf_id) throw new Error("まだ締結されていません"); var f = DriveApp.getFileById(o.pdf_id); return { ok: true, pdf: Utilities.base64Encode(f.getBlob().getBytes()), filename: f.getName() }; }
    throw new Error("不明な操作です");
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; }
}
function issue_(d) {
  var t = tplOf(d.template); if (!t) throw new Error("契約書の種類を選んでください");
  var p = d.party || {};
  if (!p.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email || "")) throw new Error("相手のお名前と、正しいメールアドレスを入れてください");
  var fields = orderFields(t, d.fields);
  var cond = t.cond ? normCond(d.cond) : "";
  var o = { id: newId_(), token: newToken_(), template: t.key, title: t.title, party_name: p.name, party_company: p.company || "", party_email: p.email, fields: fields, required: t.required, require_id: (d.requireId || t.requireId) ? "yes" : "", cond: cond, note: d.note || "", prefill: d.prefill || {}, status: "送付済み", created: new Date(), expires: new Date(Date.now() + VALID_DAYS * 864e5), draft: d.draft ? "yes" : "" };
  o.body = buildBody(t.key, cond, o.note, p.company || p.name);
  log_(o, "作成・送付"); save_(o); sendInvite_(o);
  return { ok: true, id: o.id, url: P("SIGN_URL") + "?t=" + o.token };
}
function sendInvite_(o) {
  var url = P("SIGN_URL") + "?t=" + o.token, draft = o.draft === "yes";
  var html = "<div style='font-family:sans-serif;font-size:16px;line-height:1.8;color:#14211F'><p>" + esc_(o.party_company ? o.party_company + "　" : "") + esc_(o.party_name) + " 様</p><p>" + esc_(ISSUER.service) + "です。" + (draft ? "「" + esc_(o.title) + "」の下書き（確認用）をお送りします。" : "「" + esc_(o.title) + "」をお送りします。下のボタンから内容をご確認のうえ、記入・押印・承認をお願いします。") + "</p><p><a href='" + url + "' style='display:inline-block;background:#0E5A63;color:#fff;padding:14px 26px;border-radius:10px;text-decoration:none;font-weight:bold'>契約書を開く</a></p><p style='font-size:14px;color:#3A4A48'>開くと、このメールアドレスに6けたの認証コードが届きます。リンクの有効期限は" + VALID_DAYS + "日です。<br>契約番号：" + esc_(o.id) + "</p><p style='font-size:14px'>" + esc_(ISSUER.service) + "（運営 " + esc_(ISSUER.name) + "）<br>" + ISSUER.tel + "（受付 " + ISSUER.hours + "）</p></div>";
  MailApp.sendEmail({ to: o.party_email, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】" + o.title + (draft ? "（下書き）" : "") + "のご案内", htmlBody: html, body: "契約書を開く：" + url });
}
