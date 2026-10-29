/**
 * 株式会社グローブ 公式サイト フォーム受付 ＋ 案件管理（Google Apps Script・無料）
 *
 * 役割
 *   ・サイトの「お問い合わせ」「提携のお申し込み」を、このスプレッドシートに1件1行で保存する
 *   ・保存できたときだけ受付番号を返す（サイトはこの番号を表示する）
 *   ・受付のたびに、NOTIFY_EMAIL へ通知メールを送る
 *   ・案件管理画面（ID とパスワードでログイン）：一覧・進捗・振分け・放置の警告・進捗報告の作成と送信
 *   ・毎日決まった時刻に、未対応・放置の案件を NOTIFY_EMAIL へ知らせる
 *
 * 管理画面の住所：このウェブアプリの住所の末尾に ?p=admin を付けたもの
 */

// ▼ 受付通知・警告を受け取るメールアドレス（複数ならカンマ区切り）
const NOTIFY_EMAIL = "info@kaitori-d.com";

// ▼ 送信までの時間がこれより短いものは機械的な送信とみなして保存しない（ミリ秒）
const MIN_ELAPSED_MS = 3000;

// ▼ 警告の基準
const ALERT_NEW_HOURS = 24;     // 新規受付のまま、この時間を過ぎたら「未対応の警告」
const ALERT_STALE_DAYS = 3;     // 最後の更新からこの日数が過ぎたら「進捗報告なしの注意」
const ALERT_STALE_RED_DAYS = 7; // この日数を過ぎたら「放置の警告」
const RECONTACT_HOURS = 48;     // 前回お客様へ連絡してから、この時間内の再連絡は確認を出す

// ▼ 進捗報告メールの差出人名と署名
const SENDER_NAME = "株式会社グローブ";
const SIGNATURE = [
  "――――――――――――――――",
  "株式会社グローブ",
  "〒544-0033 大阪府大阪市生野区勝山南2-2-7",
  "電話 06-6355-0779　フリーダイヤル 0120-933-496",
  "メール info@kaitori-d.com",
  "受付時間 10:00〜19:00（年中無休）",
  "――――――――――――――――"
].join("\n");

const SHEETS = {
  inbox: {
    name: "お問い合わせ",
    prefix: "GL",
    cols: [["no", "受付番号"], ["ts", "受付日時"], ["status", "状態"], ["entry", "入口"], ["name", "お名前"], ["company", "会社名・屋号"],
           ["email", "メール"], ["tel", "電話番号"], ["cat", "分類"], ["method", "希望連絡方法"], ["body", "お問い合わせ内容"],
           ["share", "提携先への情報提供同意"], ["memo", "対応メモ"]]
  },
  partners: {
    name: "提携申込み",
    prefix: "PT",
    cols: [["no", "受付番号"], ["ts", "受付日時"], ["status", "状態"], ["company", "会社名"], ["person", "担当者名"], ["industry", "業種"],
           ["address", "所在地"], ["tel", "電話番号"], ["email", "メール"], ["service", "提供サービス"], ["area", "対応地域"],
           ["want", "提携希望内容"], ["note", "備考"], ["memo", "対応メモ"]]
  }
};
// 管理用に後ろへ足す列（既存の列はそのまま）
const EXTRA_COLS = [["partner", "振分け先"], ["staff", "担当者"], ["updated", "最終更新日時"], ["contacted", "最終連絡日時"], ["next", "次の対応予定日"]];
const STEPS = {
  inbox: ["新規受付", "内容確認中", "振分け済み", "提携先対応中", "提案・見積り中", "完了"],
  partners: ["審査待ち", "審査中", "面談調整中", "提携決定"]
};
const STOPPED = { inbox: "見送り", partners: "見送り" };
const HISTORY_SHEET = "対応履歴";
const ROUTE_SHEET = "振分け設定";
const CATEGORIES = ["企業支援・経営サポート", "医療・介護 総合支援", "リユース・買取事業", "許認可・補助金申請サポート", "家じまい・不動産支援",
  "海外・輸出事業", "人材支援・採用支援", "企画・プロデュース事業", "地域活性化事業", "国際ネットワーク構築", "事業連携・協業支援", "新規事業開発", "その他・分からない"];
const ENTRY_LABEL = { service: "法人向けサービス", corporate: "経営・事業相談", partner: "業務提携・代理店" };

/* ============================== 準備 ============================== */

/** 初回・更新時に一度実行：シート・見出し・管理用の列を作る（何度実行しても安全） */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.values(SHEETS).forEach(def => {
    const sh = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
    const want = def.cols.map(c => c[1]).concat(EXTRA_COLS.map(c => c[1]));
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const have = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
    if (!have[0]) { sh.getRange(1, 1, 1, want.length).setValues([want]); }
    else { want.forEach(h => { if (have.indexOf(h) < 0) { have.push(h); sh.getRange(1, have.length).setValue(h); } }); }
    sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight("bold").setBackground("#0E2A52").setFontColor("#FFFFFF");
    sh.setFrozenRows(1);
  });
  const hs = ss.getSheetByName(HISTORY_SHEET) || ss.insertSheet(HISTORY_SHEET);
  if (!hs.getRange(1, 1).getValue()) {
    hs.getRange(1, 1, 1, 7).setValues([["日時", "種類", "受付番号", "内容", "担当者", "送信先", "区分"]]).setFontWeight("bold").setBackground("#0E2A52").setFontColor("#FFFFFF");
    hs.setFrozenRows(1);
  }
  const rs = ss.getSheetByName(ROUTE_SHEET) || ss.insertSheet(ROUTE_SHEET);
  if (!rs.getRange(1, 1).getValue()) {
    rs.getRange(1, 1, 1, 5).setValues([["分類", "振分け先（提携企業）", "先方の担当者", "先方の連絡先", "備考"]]).setFontWeight("bold").setBackground("#0E2A52").setFontColor("#FFFFFF");
    rs.getRange(2, 1, CATEGORIES.length, 5).setValues(CATEGORIES.map(c => [c, c === "その他・分からない" ? "当社で確認" : "", "", "", ""]));
    rs.setFrozenRows(1);
  }
}

/**
 * 管理画面のログイン ID とパスワードを登録する。
 * 下の2行に ID とパスワードを入れて、この関数を一度実行する。実行が終わったら、2行を空に戻して保存する。
 * （パスワードはそのままでは保存せず、元に戻せない形に変えて保存する）
 */
function setupAdmin() {
  const ID = "";        // 例："glove"
  const PASSWORD = "";  // 8文字以上。英字と数字をまぜる
  const NAME = "管理者";
  if (!ID || !PASSWORD) throw new Error("setupAdmin の ID と PASSWORD を入れてから実行してください");
  if (PASSWORD.length < 8) throw new Error("パスワードは8文字以上にしてください");
  saveUser_({ id: ID, name: NAME }, PASSWORD);
  Logger.log("登録しました。ID：" + ID + "（パスワードの2行は空に戻して保存してください）");
}

/** 毎日の警告メールを設定する（一度だけ実行）。朝9時と夕方3時ごろに送る */
function setupAlerts() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "checkAlerts").forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("checkAlerts").timeBased().everyDays(1).atHour(9).inTimezone("Asia/Tokyo").create();
  ScriptApp.newTrigger("checkAlerts").timeBased().everyDays(1).atHour(15).inTimezone("Asia/Tokyo").create();
  Logger.log("毎日 9時台と15時台に警告メールを確認します");
}

/* ============================== 受付（サイトから） ============================== */

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const def = SHEETS[data.kind];
    if (!def) return json({ ok: false, error: "unknown_kind" });
    if (Number(data.elapsed || 0) < MIN_ELAPSED_MS) return json({ ok: false, error: "too_fast" });
    const req = data.kind === "inbox" ? ["name", "email", "tel", "cat", "method", "body"] : ["company", "person", "industry", "address", "tel", "email", "service", "area", "want"];
    if (req.some(k => !String(data[k] || "").trim())) return json({ ok: false, error: "missing" });
    if (data.agree !== true) return json({ ok: false, error: "no_consent" });

    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(def.name);
    if (!sh) return json({ ok: false, error: "not_setup" });

    const now = new Date();
    const ymd = Utilities.formatDate(now, "Asia/Tokyo", "yyMMdd");
    const seq = String(sh.getLastRow()).padStart(4, "0");
    const no = `${def.prefix}-${ymd}-${seq}`;
    const cat = data.catLabel || data.cat || "";
    const rec = Object.assign({}, data, {
      no,
      ts: fmt_(now),
      status: STEPS[data.kind][0],
      entry: ENTRY_LABEL[data.entry] || data.entry || "",
      cat,
      share: data.share ? "同意あり" : "同意なし（提供前に要確認）",
      memo: "",
      partner: data.kind === "inbox" ? routeFor_(cat) : "",
      staff: "", updated: fmt_(now), contacted: "", next: ""
    });
    const safe = v => { const s = String(v == null ? "" : v).slice(0, 4000); return /^[=+\-@]/.test(s) ? "'" + s : s; };
    const head = header_(sh);
    const row = head.map(h => { const key = keyOf_(def, h); return key ? safe(rec[key]) : ""; });
    sh.appendRow(row);
    lock.releaseLock();

    notify(def, rec);
    return json({ ok: true, no });
  } catch (err) {
    try { lock.releaseLock(); } catch (e) {}
    return json({ ok: false, error: "server_error" });
  }
}

function notify(def, rec) {
  if (!NOTIFY_EMAIL) return;
  const lines = def.cols.filter(([k]) => k !== "memo").map(([k, label]) => `${label}：${rec[k] == null ? "" : rec[k]}`);
  if (rec.partner) lines.push(`振分け先（自動）：${rec.partner}`);
  const subject = `【GLOVEサイト】${def.name}を受け付けました（${rec.no}）`;
  const body = `${def.name}が届きました。\n\n${lines.join("\n")}\n\n案件管理画面：${adminUrl_()}\nスプレッドシート：${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;
  try { MailApp.sendEmail({ to: NOTIFY_EMAIL, subject, body, replyTo: rec.email || undefined }); } catch (e) {}
}

/* ============================== 画面の出し分け ============================== */

function doGet(e) {
  if (e && e.parameter && e.parameter.p === "admin") {
    return HtmlService.createTemplateFromFile("admin").evaluate()
      .setTitle("案件管理｜株式会社グローブ")
      .addMetaTag("viewport", "width=device-width, initial-scale=1")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }
  return json({ ok: true, service: "GLOVE form receiver" });
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ============================== ログイン ============================== */

function users_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty("ADMIN_USERS") || "[]"); } catch (e) { return []; } }
function hash_(salt, pw) {
  let h = salt + ":" + pw;
  for (let i = 0; i < 1000; i++) h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + salt, Utilities.Charset.UTF_8));
  return h;
}
function saveUser_(u, pw) {
  const list = users_().filter(x => x.id !== u.id);
  const salt = Utilities.getUuid();
  list.push({ id: u.id, name: u.name || u.id, salt, hash: hash_(salt, pw) });
  PropertiesService.getScriptProperties().setProperty("ADMIN_USERS", JSON.stringify(list));
}

/** 画面から呼ぶ：ID とパスワードを確かめ、8時間有効の合い札を返す */
function login(id, pw) {
  id = String(id || "").trim(); pw = String(pw || "");
  const cache = CacheService.getScriptCache();
  const key = "fail_" + id;
  const fails = Number(cache.get(key) || 0);
  if (fails >= 5) return { ok: false, error: "続けて間違えたため、15分間ログインできません。時間をおいてお試しください。" };
  const u = users_().find(x => x.id === id);
  if (!u || hash_(u.salt, pw) !== u.hash) {
    cache.put(key, String(fails + 1), 900);
    Utilities.sleep(800);
    return { ok: false, error: users_().length ? "ID またはパスワードが違います。" : "管理者がまだ登録されていません（setupAdmin を実行してください）。" };
  }
  cache.remove(key);
  const token = Utilities.getUuid() + Utilities.getUuid();
  cache.put("tok_" + token, JSON.stringify({ id: u.id, name: u.name }), 8 * 3600);
  return { ok: true, token, name: u.name, id: u.id };
}
function logout(token) { CacheService.getScriptCache().remove("tok_" + token); return { ok: true }; }
function auth_(token) {
  const v = token && CacheService.getScriptCache().get("tok_" + token);
  if (!v) throw new Error("LOGIN_REQUIRED");
  const u = JSON.parse(v);
  CacheService.getScriptCache().put("tok_" + token, v, 8 * 3600); // 使うたびに延長
  return u;
}
/** 画面から呼ぶ：パスワード変更・担当者の追加 */
function changePassword(token, oldPw, newPw) {
  const me = auth_(token);
  const u = users_().find(x => x.id === me.id);
  if (!u || hash_(u.salt, String(oldPw || "")) !== u.hash) return { ok: false, error: "今のパスワードが違います。" };
  if (String(newPw || "").length < 8) return { ok: false, error: "新しいパスワードは8文字以上にしてください。" };
  saveUser_({ id: u.id, name: u.name }, String(newPw));
  return { ok: true };
}
function addUser(token, id, name, pw) {
  auth_(token);
  id = String(id || "").trim();
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(id)) return { ok: false, error: "ID は半角の英字・数字で3〜30文字にしてください。" };
  if (String(pw || "").length < 8) return { ok: false, error: "パスワードは8文字以上にしてください。" };
  saveUser_({ id, name: String(name || id).trim() }, String(pw));
  return { ok: true, users: users_().map(x => ({ id: x.id, name: x.name })) };
}
function removeUser(token, id) {
  const me = auth_(token);
  if (id === me.id) return { ok: false, error: "自分自身は削除できません。" };
  const list = users_().filter(x => x.id !== id);
  PropertiesService.getScriptProperties().setProperty("ADMIN_USERS", JSON.stringify(list));
  return { ok: true, users: list.map(x => ({ id: x.id, name: x.name })) };
}

/* ============================== 管理画面のデータ ============================== */

function fmt_(d) { return Utilities.formatDate(d, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss"); }
function parse_(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const m = String(v).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) { const d = new Date(v); return isNaN(d) ? null : d; }
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], (+(m[4] || 0)) - 9, +(m[5] || 0), +(m[6] || 0)));
}
function header_(sh) { return sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String); }
function keyOf_(def, label) {
  const all = def.cols.concat(EXTRA_COLS);
  const f = all.find(c => c[1] === label);
  return f ? f[0] : null;
}
function routes_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ROUTE_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues().filter(r => r[0]).map(r => ({ cat: String(r[0]), partner: String(r[1]), person: String(r[2]), contact: String(r[3]), note: String(r[4]) }));
}
function routeFor_(cat) { const r = routes_().find(x => x.cat === cat); return r ? r.partner : ""; }
function adminUrl_() { try { return ScriptApp.getService().getUrl() + "?p=admin"; } catch (e) { return ""; } }

function readCases_(kind) {
  const def = SHEETS[kind];
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(def.name);
  if (!sh || sh.getLastRow() < 2) return [];
  const head = header_(sh);
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues();
  const out = [];
  rows.forEach((r, i) => {
    const o = { kind, row: i + 2 };
    head.forEach((h, j) => { const k = keyOf_(def, h); if (k) o[k] = r[j] instanceof Date ? fmt_(r[j]) : String(r[j] == null ? "" : r[j]); });
    if (!o.no) return;
    if (!o.updated) o.updated = o.ts;
    out.push(o);
  });
  return out;
}
function history_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HISTORY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues().map(r => ({ at: r[0] instanceof Date ? fmt_(r[0]) : String(r[0]), type: String(r[1]), no: String(r[2]), text: String(r[3]), by: String(r[4]), to: String(r[5]), kind: String(r[6]) }));
}
function log_(kind, no, type, text, by, to) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HISTORY_SHEET);
  if (sh) sh.appendRow([fmt_(new Date()), type, no, String(text || "").slice(0, 5000), by || "", to || "", kind]);
}

/** 画面から呼ぶ：一覧と設定をまとめて返す */
function adminData(token) {
  const me = auth_(token);
  return {
    me, now: Date.now(),
    cases: readCases_("inbox").concat(readCases_("partners")),
    history: history_(),
    routes: routes_(),
    steps: STEPS, stopped: STOPPED, categories: CATEGORIES,
    rules: { newHours: ALERT_NEW_HOURS, staleDays: ALERT_STALE_DAYS, staleRedDays: ALERT_STALE_RED_DAYS, recontactHours: RECONTACT_HOURS },
    signature: SIGNATURE, users: users_().map(x => ({ id: x.id, name: x.name }))
  };
}

/** 画面から呼ぶ：状態・振分け先・担当者・次の予定日・メモの更新 */
function updateCase(token, kind, no, patch) {
  const me = auth_(token);
  const def = SHEETS[kind]; if (!def) throw new Error("種類が違います");
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(def.name);
    const head = header_(sh);
    const nos = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(r => String(r[0]));
    const idx = nos.indexOf(no); if (idx < 0) throw new Error("案件が見つかりません：" + no);
    const row = idx + 2;
    const col = label => head.indexOf(label) + 1;
    const get = label => { const c = col(label); return c ? String(sh.getRange(row, c).getValue()) : ""; };
    const set = (label, v) => { const c = col(label); if (c) sh.getRange(row, c).setValue(v); };
    const notes = [];
    if (patch.status != null && patch.status !== get("状態")) { notes.push(`状態：${get("状態")} → ${patch.status}`); set("状態", patch.status); }
    if (patch.partner != null && patch.partner !== get("振分け先")) { notes.push(`振分け先：${patch.partner || "（なし）"}`); set("振分け先", patch.partner); }
    if (patch.staff != null && patch.staff !== get("担当者")) { notes.push(`担当者：${patch.staff || "（なし）"}`); set("担当者", patch.staff); }
    if (patch.next != null && patch.next !== get("次の対応予定日")) { notes.push(`次の対応予定日：${patch.next || "（なし）"}`); set("次の対応予定日", patch.next); }
    if (patch.memo) {
      const old = get("対応メモ");
      const line = `[${Utilities.formatDate(new Date(), "Asia/Tokyo", "MM/dd HH:mm")} ${me.name}] ${patch.memo}`;
      set("対応メモ", old ? old + "\n" + line : line);
      log_(kind, no, "メモ", patch.memo, me.name, "");
    }
    if (notes.length || patch.memo) set("最終更新日時", fmt_(new Date()));
    if (notes.length) log_(kind, no, "更新", notes.join("／"), me.name, "");
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/** 画面から呼ぶ：お客様への進捗報告。send=false のときは送らずに記録だけ残す */
function sendReport(token, kind, no, subject, body, send) {
  const me = auth_(token);
  const c = readCases_(kind).find(x => x.no === no);
  if (!c) throw new Error("案件が見つかりません：" + no);
  if (!send) { log_(kind, no, "連絡見送り", "（送らずに記録）" + String(body || "").slice(0, 300), me.name, ""); touch_(kind, no, false); return { ok: true, sent: false }; }
  const to = String(c.email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, error: "お客様のメールアドレスが正しくありません。" };
  if (!String(subject || "").trim() || !String(body || "").trim()) return { ok: false, error: "件名と本文を入れてください。" };
  MailApp.sendEmail({ to, subject: String(subject), body: String(body), name: SENDER_NAME, replyTo: NOTIFY_EMAIL.split(",")[0].trim() });
  log_(kind, no, "お客様へ連絡", `件名：${subject}\n${body}`, me.name, to);
  touch_(kind, no, true);
  return { ok: true, sent: true, left: MailApp.getRemainingDailyQuota() };
}
function touch_(kind, no, contacted) {
  const def = SHEETS[kind];
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(def.name);
  const head = header_(sh);
  const nos = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(r => String(r[0]));
  const idx = nos.indexOf(no); if (idx < 0) return;
  const now = fmt_(new Date());
  const cu = head.indexOf("最終更新日時") + 1; if (cu) sh.getRange(idx + 2, cu).setValue(now);
  if (contacted) { const cc = head.indexOf("最終連絡日時") + 1; if (cc) sh.getRange(idx + 2, cc).setValue(now); }
}

/** 画面から呼ぶ：振分け設定の保存 */
function saveRoutes(token, rows) {
  auth_(token);
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ROUTE_SHEET);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 5).clearContent();
  const vals = (rows || []).filter(r => r.cat).map(r => [r.cat, r.partner || "", r.person || "", r.contact || "", r.note || ""]);
  if (vals.length) sh.getRange(2, 1, vals.length, 5).setValues(vals);
  return { ok: true, routes: routes_() };
}

/* ============================== 警告 ============================== */

/** 案件の注意度：0=問題なし 1=注意 2=警告 */
function level_(c, now) {
  const stop = c.status === STOPPED[c.kind] || c.status === STEPS[c.kind][STEPS[c.kind].length - 1];
  if (stop) return { lv: 0, why: "" };
  const ts = parse_(c.ts), up = parse_(c.updated) || ts;
  const h = (now - (ts ? ts.getTime() : now)) / 36e5, d = (now - (up ? up.getTime() : now)) / 864e5;
  if (c.status === STEPS[c.kind][0] && h >= ALERT_NEW_HOURS) return { lv: 2, why: `未対応のまま${Math.floor(h)}時間` };
  if (d >= ALERT_STALE_RED_DAYS) return { lv: 2, why: `${Math.floor(d)}日間 進捗なし` };
  if (d >= ALERT_STALE_DAYS) return { lv: 1, why: `${Math.floor(d)}日間 進捗なし` };
  if (c.status === STEPS[c.kind][0]) return { lv: 1, why: "未対応" };
  return { lv: 0, why: "" };
}

/** 時刻で自動実行：未対応・放置の案件をメールで知らせる */
function checkAlerts() {
  if (!NOTIFY_EMAIL) return;
  const now = Date.now();
  const list = readCases_("inbox").concat(readCases_("partners")).map(c => Object.assign(c, level_(c, now))).filter(c => c.lv > 0);
  if (!list.length) return;
  const red = list.filter(c => c.lv === 2), yel = list.filter(c => c.lv === 1);
  const line = c => `・${c.no}　${c.company || c.name || ""}　${c.cat || c.industry || ""}　状態：${c.status}　${c.why}${c.staff ? "　担当：" + c.staff : ""}`;
  const body = [
    `案件管理の確認をお願いします（${Utilities.formatDate(new Date(), "Asia/Tokyo", "M月d日 H時")}時点）。`, "",
    red.length ? `■ 警告（${red.length}件）` : "", ...red.map(line), red.length ? "" : "",
    yel.length ? `■ 注意（${yel.length}件）` : "", ...yel.map(line), "",
    `案件管理画面：${adminUrl_()}`
  ].filter((x, i, a) => !(x === "" && a[i - 1] === "")).join("\n");
  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: `【案件管理】対応が必要な案件 ${list.length}件（警告${red.length}件）`, body });
}

/** 動作確認用：管理画面のファイルを読み込む */
function include(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); }
