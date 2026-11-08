/**
 * 京都太陽行政書士事務所 事務所管理の保存先（Googleスプレッドシート＋Apps Script）
 * 設置手順は「設置手順.md」を見てください。
 *
 * スクリプトのプロパティ（設定画面で登録）
 *   NOTIFY_TO          … 新しい相談の通知を受け取るメール（例 contact@kyoto-taiyou.com）
 *   OFFICE_NAME        … 送信者名（例 京都太陽行政書士事務所）
 *   SITE_URL           … サイトの住所（例 https://kyoto-taiyou.com/）署名ページのリンクに使う
 *   ANTHROPIC_API_KEY  … AIを使う場合だけ（Claudeの開発者向けの鍵）
 */

var TABLES = { inq:'相談受付', cust:'顧客', 'case':'対応', ev:'予定', daily:'日報', doc:'見積請求', rcv:'入金', exp:'支払い', ctr:'契約' };
var CONF_SHEET = '設定';
var STAFF_SHEET = '担当者';
var HEAD = ['id', '更新日時', '更新者', '概要', 'データ'];
var PUBLIC = { siteData:1, publicInquiry:1, contractGet:1, contractSign:1, login:1 };

/* ---------- 入口 ---------- */
function doPost(e) {
  var req = {};
  try { req = JSON.parse(e.postData.contents || '{}'); } catch (err) { return out({ error: '形式が正しくありません' }); }
  var a = req.action;
  try {
    if (!PUBLIC[a]) {
      var user = auth_(req.token);
      if (!user) return out({ error: 'ログインし直してください', code: 'auth' });
      req._user = user;
    }
    var fn = ACTIONS[a];
    if (!fn) return out({ error: '不明な操作です' });
    return out(fn(req));
  } catch (err) {
    return out({ error: String(err && err.message || err) });
  }
}
function doGet() { return out({ ok: true, name: '京都太陽 事務所管理' }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }

/* ---------- シート ---------- */
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name, head) {
  var sh = ss_().getSheetByName(name);
  if (!sh) { sh = ss_().insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}
function tableSheet_(t) { if (!TABLES[t]) throw new Error('表の名前が正しくありません'); return sheet_(TABLES[t], HEAD); }
function readTable_(t) {
  var v = tableSheet_(t).getDataRange().getValues(); var r = [];
  for (var i = 1; i < v.length; i++) { if (!v[i][0]) continue; try { r.push(JSON.parse(v[i][4])); } catch (e) {} }
  return r;
}
function summary_(t, rec) {
  switch (t) {
    case 'inq': return [rec.status, rec.type, rec.name, rec.company, (rec.topics || []).join('、')].filter(String).join(' / ');
    case 'cust': return [rec.kind, rec.company, rec.name, rec.tel].filter(String).join(' / ');
    case 'case': return [rec.status, rec.title].filter(String).join(' / ');
    case 'ev': return [rec.date, rec.start, rec.title].filter(String).join(' ');
    case 'daily': return [rec.date, rec.user].join(' ');
    case 'doc': return [rec.type, rec.no, rec.title].filter(String).join(' / ');
    case 'rcv': return [rec.date, rec.amount].join(' / ');
    case 'exp': return [rec.date, rec.payee, rec.amount].join(' / ');
    case 'ctr': return [rec.status, rec.no, rec.title].filter(String).join(' / ');
  }
  return '';
}
function upsert_(t, rec, by) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = tableSheet_(t), ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues();
    var row = -1;
    for (var i = 1; i < ids.length; i++) if (String(ids[i][0]) === String(rec.id)) { row = i + 1; break; }
    var vals = [[rec.id, new Date(), by || '', summary_(t, rec), JSON.stringify(rec)]];
    if (row > 0) sh.getRange(row, 1, 1, 5).setValues(vals); else sh.appendRow(vals[0]);
  } finally { lock.releaseLock(); }
}
function removeRow_(t, id) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = tableSheet_(t), ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues();
    for (var i = ids.length - 1; i >= 1; i--) if (String(ids[i][0]) === String(id)) sh.deleteRow(i + 1);
  } finally { lock.releaseLock(); }
}
function conf_(key) {
  var v = sheet_(CONF_SHEET, ['項目', '値']).getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][0] === key) { try { return JSON.parse(v[i][1]); } catch (e) { return null; } }
  return null;
}
function setConf_(key, val) {
  var sh = sheet_(CONF_SHEET, ['項目', '値']), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (v[i][0] === key) { sh.getRange(i + 1, 2).setValue(JSON.stringify(val)); return; }
  sh.appendRow([key, JSON.stringify(val)]);
}

/* ---------- ログイン ---------- */
function staff_() {
  var sh = sheet_(STAFF_SHEET, ['名前', '役割', '合言葉']), v = sh.getDataRange().getValues(), r = [];
  for (var i = 1; i < v.length; i++) if (v[i][0]) r.push({ id: 's' + i, name: String(v[i][0]), role: String(v[i][1] || ''), pass: String(v[i][2] || '') });
  return r;
}
function auth_(token) {
  if (!token) return null;
  var u = CacheService.getScriptCache().get('t_' + token);
  return u ? JSON.parse(u) : null;
}

/* ---------- 操作 ---------- */
var ACTIONS = {
  login: function (r) {
    var s = staff_().filter(function (x) { return x.name === r.user; })[0];
    if (!s || !s.pass || s.pass !== String(r.pass || '')) { Utilities.sleep(800); throw new Error('担当者か合言葉が違います'); }
    var token = Utilities.getUuid() + Utilities.getUuid();
    var user = { id: s.id, name: s.name, role: s.role };
    CacheService.getScriptCache().put('t_' + token, JSON.stringify(user), 21600);
    return { token: token, user: user };
  },
  logout: function (r) { CacheService.getScriptCache().remove('t_' + r.token); return { ok: true }; },
  listAll: function () {
    var o = {};
    Object.keys(TABLES).forEach(function (t) { o[t] = readTable_(t); });
    ['master', 'office', 'ctrTpl', 'info', 'news', 'fees', 'terms'].forEach(function (k) { o[k] = conf_(k); });
    o.staff = staff_().map(function (s) { return { id: s.id, name: s.name, role: s.role }; });
    return o;
  },
  save: function (r) { upsert_(r.table, r.rec, r._user.name); return { ok: true }; },
  remove: function (r) { removeRow_(r.table, r.id); return { ok: true }; },
  saveConf: function (r) {
    if (['master', 'office', 'ctrTpl', 'info', 'news', 'fees', 'terms'].indexOf(r.key) < 0) throw new Error('保存できない項目です');
    setConf_(r.key, r.val); return { ok: true };
  },
  siteData: function () {
    var o = {}; ['info', 'news', 'fees', 'terms'].forEach(function (k) { o[k] = conf_(k); }); return o;
  },
  sendMail: function (r) {
    if (!r.to) throw new Error('宛先がありません');
    GmailApp.sendEmail(r.to, r.subject || '', r.body || '', { name: prop_('OFFICE_NAME') || '京都太陽行政書士事務所' });
    return { ok: true };
  },
  ai: function (r) {
    var key = prop_('ANTHROPIC_API_KEY');
    if (!key) throw new Error('AIの鍵が登録されていません（スクリプトのプロパティ ANTHROPIC_API_KEY）');
    var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      payload: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 2000, messages: [{ role: 'user', content: String(r.prompt || '').slice(0, 20000) }] })
    });
    var j = JSON.parse(res.getContentText());
    if (res.getResponseCode() !== 200) throw new Error('AIが応答しませんでした（' + res.getResponseCode() + '）');
    return { text: (j.content || []).map(function (c) { return c.text || ''; }).join('') };
  },

  /* 相談フォーム（公開） */
  publicInquiry: function (r) {
    var rec = r.rec || {};
    if (!rec.name || !(rec.tel || rec.mail)) throw new Error('お名前と連絡先が必要です');
    rec.id = rec.no = rec.no || ('W' + new Date().getTime());
    rec.status = '未対応';
    var saved = [];
    if (r.files && r.files.length) {
      var folder = folder_('相談の添付資料');
      r.files.slice(0, 3).forEach(function (f) {
        var bytes = Utilities.base64Decode(f.data);
        if (bytes.length > 3 * 1024 * 1024) return;
        if (!/\.(jpe?g|png|gif|pdf)$/i.test(f.name)) return;
        var file = folder.createFile(Utilities.newBlob(bytes, f.type, rec.no + '_' + f.name));
        saved.push({ name: f.name, url: file.getUrl() });
      });
    }
    rec.files = saved;
    upsert_('inq', rec, 'ホームページ');
    var to = prop_('NOTIFY_TO'), name = prop_('OFFICE_NAME') || '京都太陽行政書士事務所';
    if (to) {
      GmailApp.sendEmail(to, '【新しいご相談】' + rec.type + '　' + rec.name + ' 様（' + rec.no + '）',
        ['受付番号：' + rec.no, '区分：' + rec.type + 'のご相談', 'お名前：' + rec.name, rec.company ? '会社名：' + rec.company : '', '電話：' + (rec.tel || ''), 'メール：' + (rec.mail || ''),
         '相談の種類：' + (rec.topics || []).join('、'), '時期：' + (rec.timing || ''), '相談方法：' + (rec.how || ''), '', (rec.msg || ''), '',
         saved.length ? '添付：' + saved.map(function (f) { return f.name; }).join('、') : '', '', '管理画面で対応してください。'].filter(function (x) { return x !== null; }).join('\n'), { name: name });
    }
    if (rec.mail) {
      GmailApp.sendEmail(rec.mail, '【' + name + '】ご相談を受け付けました（受付番号 ' + rec.no + '）',
        rec.name + ' 様\n\nこのたびはご相談いただき、誠にありがとうございます。\n下記の内容で受け付けました。内容を確認のうえ、担当よりご連絡いたします。\n\n受付番号：' + rec.no + '\nご相談の種類：' + (rec.topics || []).join('、') + '\n\nこのメールは送信専用です。お急ぎの方はお電話でご連絡ください。\n\n' + name, { name: name });
    }
    return { ok: true, no: rec.no };
  },

  /* 電子契約（公開） */
  contractGet: function (r) {
    var c = findCtr_(r.t); if (!c) throw new Error('契約書が見つかりませんでした');
    var cu = readTable_('cust').filter(function (x) { return x.id === c.custId; })[0] || {};
    if (c.status !== '締結') { c.viewedAt = c.viewedAt || new Date().toISOString(); upsert_('ctr', c, 'お客様（閲覧）'); }
    return { no: c.no, title: c.title, body: c.body, status: c.status, signedAt: c.signedAt, signer: c.status === '締結' ? c.signer : null, hash: c.hash,
             cust: { name: cu.name, company: cu.company, title: cu.title, addr: cu.addr, mail: cu.mail, tel: cu.tel } };
  },
  contractSign: function (r) {
    var c = findCtr_(r.t); if (!c) throw new Error('契約書が見つかりませんでした');
    if (c.status === '締結') throw new Error('この契約書は既に締結されています');
    if (c.status === '取消') throw new Error('この契約書は取り消されました');
    var hash = sha256_(c.body);
    if (r.hash && r.hash !== hash) throw new Error('契約書の内容が変更されています。事務所にお問い合わせください');
    var now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
    c.status = '締結'; c.signedAt = now; c.hash = hash;
    c.signer = r.signer || {}; c.signer.agreeAt = now;
    c.log = c.log || []; c.log.unshift({ at: now, text: 'お客様が署名・押印し、締結（' + (c.signer.name || '') + '）' });
    upsert_('ctr', c, 'お客様');
    if (c.caseId) {
      var k = readTable_('case').filter(function (x) { return x.id === c.caseId; })[0];
      if (k) { k.log = k.log || []; k.log.unshift({ at: now, kind: 'その他', by: 'お客様', text: '契約書 ' + c.no + ' が電子契約で締結されました' }); upsert_('case', k, 'お客様'); }
    }
    var name = prop_('OFFICE_NAME') || '京都太陽行政書士事務所';
    var link = (prop_('SITE_URL') || '') + 'sign.html#c-' + c.token;
    var body = '「' + c.title + '」（' + c.no + '）の契約が、電子契約により締結されました。\n\n締結日時：' + now + '\n署名者：' + (c.signer.name || '') + '\n確認番号：' + hash + '\n\n契約書の控え：' + link + '\n\n' + name;
    if (c.signer.mail) GmailApp.sendEmail(c.signer.mail, '【' + name + '】契約締結のお知らせ（' + c.no + '）', c.signer.name + ' 様\n\n' + body, { name: name });
    if (prop_('NOTIFY_TO')) GmailApp.sendEmail(prop_('NOTIFY_TO'), '【締結】' + c.title + '（' + (c.signer.name || '') + ' 様）', body, { name: name });
    return { status: c.status, signedAt: now, hash: hash, signer: c.signer };
  }
};
function findCtr_(t) { if (!t || String(t).length < 16) return null; return readTable_('ctr').filter(function (x) { return x.token === t; })[0] || null; }
function sha256_(s) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return b.map(function (x) { var v = (x < 0 ? x + 256 : x).toString(16); return v.length < 2 ? '0' + v : v; }).join('');
}
function folder_(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

/* 初回だけ実行：シートを作り、担当者の行を用意する */
function setup() {
  Object.keys(TABLES).forEach(function (t) { tableSheet_(t); });
  sheet_(CONF_SHEET, ['項目', '値']);
  var st = sheet_(STAFF_SHEET, ['名前', '役割', '合言葉']);
  if (st.getLastRow() < 2) { st.appendRow(['松宮 紀代', '代表・特定行政書士', '（ここに合言葉）']); st.appendRow(['MA', '運営', '（ここに合言葉）']); }
  var d = ss_().getSheetByName('シート1'); if (d && d.getLastRow() === 0) ss_().deleteSheet(d);
}
