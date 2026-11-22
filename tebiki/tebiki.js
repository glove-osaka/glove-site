/* 家じまいの手引き書：画面の動き
   ・書いた内容は、選んだ方法でだけ保存する（この端末／ファイル／家じまい123に鍵をかけて預ける）
   ・預けるときは、端末の中で合言葉から鍵を作って暗号化してから送る。家じまい123は中身を読めない */
(function () {
  'use strict';
  var D = window.TEBIKI, CH = D.chapters;
  var LS = 'ij-tebiki-v1', LS_MODE = 'ij-tebiki-mode', LS_VAULT = 'ij-tebiki-vault';
  var API = '../api/tebiki.php';
  var st = { v: 1, updated: '', data: {} };
  var mode = '';           // 'device' | 'none'
  var cur = -1;            // 表示中の章（-1 = 目次）
  var $ = function (id) { return document.getElementById(id); };

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function val(cid, k) { return (st.data[cid] || {})[k]; }
  function setVal(cid, k, v) { (st.data[cid] = st.data[cid] || {})[k] = v; touch(); }
  function filled(v) {
    if (v == null) return false;
    if (Array.isArray(v)) return v.some(function (x) { return Array.isArray(x) ? x.some(function (y) { return String(y || '').trim(); }) : String(x || '').trim(); });
    return String(v).trim() !== '';
  }
  function chDone(c) { var n = 0; c.fields.forEach(function (f) { if (filled(val(c.id, f.k))) n++; }); return n; }
  function allDone() { var a = 0, b = 0; CH.forEach(function (c) { a += chDone(c); b += c.fields.length; }); return [a, b]; }

  var saveTimer = null;
  function touch() {
    st.updated = new Date().toISOString();
    if (mode === 'device') { clearTimeout(saveTimer); saveTimer = setTimeout(saveLocal, 400); }
    showSaved('');
  }
  function saveLocal() { if (lsSet(LS, JSON.stringify(st))) showSaved('この端末に保存しました'); else showSaved('この端末には保存できませんでした。ファイルで保存してください'); }
  function showSaved(t) { var e = $('tbSaved'); if (e) e.textContent = t; }

  /* ---------- 入力欄 ---------- */
  function field(c, f) {
    var id = 'f-' + c.id + '-' + f.k, v = val(c.id, f.k), box = h('div', { class: 'tb-f' });
    var lab = h(f.t === 'choice' || f.t === 'multi' || f.t === 'rows' ? 'p' : 'label', { class: 'tb-l', for: f.t === 'choice' || f.t === 'multi' || f.t === 'rows' ? null : id, text: f.l });
    box.appendChild(lab);
    if (f.h) box.appendChild(h('p', { class: 'tb-h', text: f.h }));
    if (f.t === 'text' || f.t === 'date') {
      box.appendChild(h('input', { id: id, type: f.t === 'date' ? 'date' : 'text', value: v || '', autocomplete: 'off', oninput: function (e) { setVal(c.id, f.k, e.target.value); } }));
    } else if (f.t === 'area') {
      var ta = h('textarea', { id: id, rows: '3', oninput: function (e) { setVal(c.id, f.k, e.target.value); } }); ta.value = v || ''; box.appendChild(ta);
    } else if (f.t === 'choice') {
      var g = h('div', { class: 'tb-opts', role: 'radiogroup', 'aria-label': f.l });
      f.o.forEach(function (o) {
        g.appendChild(h('label', { class: 'tb-o' }, [h('input', { type: 'radio', name: id, value: o, checked: v === o, onchange: function () { setVal(c.id, f.k, o); } }), h('span', { text: o })]));
      });
      g.appendChild(h('button', { type: 'button', class: 'tb-clear', text: '選び直す', onclick: function () { setVal(c.id, f.k, ''); renderChapter(); } }));
      box.appendChild(g);
    } else if (f.t === 'multi') {
      var g2 = h('div', { class: 'tb-opts' }), arr = Array.isArray(v) ? v.slice() : [];
      f.o.forEach(function (o) {
        g2.appendChild(h('label', { class: 'tb-o' }, [h('input', { type: 'checkbox', value: o, checked: arr.indexOf(o) >= 0, onchange: function (e) {
          var a = (val(c.id, f.k) || []).filter(function (x) { return x !== o; }); if (e.target.checked) a.push(o); setVal(c.id, f.k, a);
        } }), h('span', { text: o })]));
      });
      box.appendChild(g2);
    } else if (f.t === 'rows') {
      var rows = Array.isArray(v) && v.length ? v : [f.cols.map(function () { return ''; })];
      var list = h('div', { class: 'tb-rows' });
      rows.forEach(function (r, i) {
        var card = h('div', { class: 'tb-row' });
        f.cols.forEach(function (col, j) {
          var iid = id + '-' + i + '-' + j, long = /メッセージ|伝えたい|注意|メモ/.test(col);
          card.appendChild(h('label', { class: 'tb-rl', for: iid, text: col }));
          var inp = long ? h('textarea', { id: iid, rows: '2' }) : h('input', { id: iid, type: 'text', autocomplete: 'off' });
          inp.value = r[j] || '';
          inp.addEventListener('input', function (e) { var a = cloneRows(c.id, f); a[i][j] = e.target.value; setVal(c.id, f.k, a); });
          card.appendChild(inp);
        });
        if (rows.length > 1) card.appendChild(h('button', { type: 'button', class: 'tb-del', text: 'この行を消す', onclick: function () { var a = cloneRows(c.id, f); a.splice(i, 1); setVal(c.id, f.k, a); renderChapter(); } }));
        list.appendChild(card);
      });
      box.appendChild(list);
      box.appendChild(h('button', { type: 'button', class: 'tb-add', text: '＋ もう1つ書く', onclick: function () { var a = cloneRows(c.id, f); a.push(f.cols.map(function () { return ''; })); setVal(c.id, f.k, a); renderChapter(); } }));
    }
    return box;
  }
  function cloneRows(cid, f) { var v = val(cid, f.k); var a = Array.isArray(v) && v.length ? v.map(function (r) { return r.slice(); }) : [f.cols.map(function () { return ''; })]; return a; }

  /* ---------- 画面 ---------- */
  function renderToc() {
    cur = -1; var app = $('tbApp'); app.textContent = '';
    var d = allDone();
    app.appendChild(h('div', { class: 'tb-prog' }, [h('b', { text: '書いた項目　' + d[0] + ' / ' + d[1] }), h('span', { class: 'tb-bar' }, [h('i', { style: 'width:' + Math.round(d[0] / d[1] * 100) + '%' })])]));
    var g = h('ol', { class: 'tb-toc' });
    CH.forEach(function (c, i) {
      var n = chDone(c), all = c.fields.length;
      g.appendChild(h('li', null, [h('button', { type: 'button', onclick: function () { go(i); } }, [
        h('span', { class: 'tb-no', text: String(i + 1) }), h('span', { class: 'tb-tt' }, [h('b', { text: c.title }), h('small', { text: c.lead })]),
        h('span', { class: 'tb-st' + (n === all ? ' ok' : n ? ' mid' : ''), text: n === all ? '書けました' : n ? n + ' / ' + all : 'まだ' })])]));
    });
    g.appendChild(h('li', null, [h('button', { type: 'button', class: 'tb-sum', onclick: function () { go(CH.length); } }, [h('span', { class: 'tb-no', text: '✓' }), h('span', { class: 'tb-tt' }, [h('b', { text: 'まとめ と これからやること' }), h('small', { text: '書いた内容から、次にやることを順番に並べます。印刷もここから。' })])])]));
    app.appendChild(g);
  }
  function renderChapter() {
    var c = CH[cur], app = $('tbApp'), y = window.scrollY; app.textContent = '';
    app.appendChild(h('p', { class: 'tb-crumb' }, [h('button', { type: 'button', class: 'tb-link', text: '← 目次にもどる', onclick: function () { go(-1); } }), h('span', { text: '　第' + (cur + 1) + '章 / 全' + CH.length + '章' })]));
    app.appendChild(h('h2', { class: 'tb-ch', text: '第' + (cur + 1) + '章　' + c.title }));
    app.appendChild(h('p', { class: 'tb-lead', text: c.lead }));
    if (c.warn) app.appendChild(h('p', { class: 'tb-warn', text: c.warn }));
    var form = h('div', { class: 'tb-form' }); c.fields.forEach(function (f) { form.appendChild(field(c, f)); }); app.appendChild(form);
    if (c.help) {
      var hb = h('aside', { class: 'tb-help' }, [h('b', { text: '家じまい123がお手伝いできること' }), h('p', { text: c.help.text })]);
      var ul = h('p', { class: 'tb-hl' }); c.help.links.forEach(function (l) { ul.appendChild(h('a', { href: '../services/' + l[0] + '.html', target: '_blank', rel: 'noopener', text: l[1] + ' →' })); });
      hb.appendChild(ul);
      hb.appendChild(h('a', { class: 'tb-ask', href: '../contact/index.html', target: '_blank', rel: 'noopener', text: 'この章のことを相談する（無料）' }));
      hb.appendChild(h('p', { class: 'tb-h', text: '相談のページは別の画面で開きます。手引き書に書いた内容が自動で送られることはありません。' }));
      app.appendChild(hb);
    }
    var nav = h('div', { class: 'tb-nav' });
    if (cur > 0) nav.appendChild(h('button', { type: 'button', class: 'btn btn-o', text: '← 前の章', onclick: function () { go(cur - 1); } }));
    nav.appendChild(h('button', { type: 'button', class: 'btn btn-g', text: cur < CH.length - 1 ? '次の章へ →' : 'まとめへ →', onclick: function () { go(cur + 1); } }));
    app.appendChild(nav);
    window.scrollTo(0, y);
  }
  function nextSteps() {
    var out = [], seen = {};
    D.next.forEach(function (r) {
      var p = r.if[0].split('.'), v = val(p[0], p[1]), hit = false;
      if (r.if[1] === '*') hit = filled(v);
      else if (Array.isArray(v)) hit = v.some(function (x) { return r.if[1].indexOf(x) >= 0; });
      else hit = r.if[1].indexOf(v) >= 0;
      if (hit && !seen[r.text]) { seen[r.text] = 1; out.push(r); }
    });
    return out;
  }
  function renderSummary() {
    var app = $('tbApp'); app.textContent = ''; var d = allDone();
    app.appendChild(h('p', { class: 'tb-crumb' }, [h('button', { type: 'button', class: 'tb-link', text: '← 目次にもどる', onclick: function () { go(-1); } })]));
    app.appendChild(h('h2', { class: 'tb-ch', text: 'まとめ と これからやること' }));
    app.appendChild(h('p', { class: 'tb-lead', text: '全' + d[1] + '項目のうち、' + d[0] + '項目を書きました。空いている項目は、分かったときに書き足せば大丈夫です。' }));
    var ns = nextSteps(), ol = h('ol', { class: 'tb-next' });
    if (ns.length) ns.forEach(function (r) { ol.appendChild(h('li', null, [h('span', { text: r.text }), h('a', { href: '../services/' + r.link + '.html', target: '_blank', rel: 'noopener', text: '詳しく →' })])); });
    else ol.appendChild(h('li', null, [h('span', { text: '「家（実家）のこと」「持ち物のこと」「介護とこれからの住まい」の章を書くと、ここに次にやることが出ます。' })]));
    app.appendChild(h('h3', { class: 'tb-h3', text: 'これからやること' })); app.appendChild(ol);
    app.appendChild(h('aside', { class: 'tb-help' }, [h('b', { text: 'この先は、家じまい123にお任せください' }), h('p', { text: 'この手引き書を見ながらお話しいただければ、やることの順番と費用を整理してご案内します。ご相談とお見積りは無料です。' }),
      h('a', { class: 'tb-ask', href: 'tel:0120933496', text: '電話で相談する 0120-933-496（通話無料・毎日10時〜18時）' }), h('a', { class: 'tb-ask tb-ask2', href: '../contact/index.html', target: '_blank', rel: 'noopener', text: '相談内容をまとめて送る' })]));
    app.appendChild(h('h3', { class: 'tb-h3', text: '残す・印刷する' }));
    app.appendChild(h('div', { class: 'tb-nav' }, [h('button', { type: 'button', class: 'btn btn-g', text: '印刷する（紙やPDFに）', onclick: printAll }), h('button', { type: 'button', class: 'btn btn-o', text: 'ファイルに保存する', onclick: saveFile })]));
    app.appendChild(h('p', { class: 'tb-h', text: '印刷したものは、ご家族に置き場所を伝えておきましょう。この手引き書は遺言書の代わりにはなりません。' }));
  }
  function go(i) {
    if (i < 0) renderToc(); else if (i >= CH.length) { cur = CH.length; renderSummary(); } else { cur = i; renderChapter(); }
    var t = $('tbTop'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- 印刷 ---------- */
  function printAll() {
    var p = $('tbPrint'); p.textContent = '';
    p.appendChild(h('h1', { text: '家じまいの手引き書' }));
    p.appendChild(h('p', { text: (val('me', 'name') ? val('me', 'name') + '　' : '') + '書いた日：' + new Date().toLocaleDateString('ja-JP') }));
    CH.forEach(function (c, i) {
      p.appendChild(h('h2', { text: '第' + (i + 1) + '章　' + c.title }));
      c.fields.forEach(function (f) {
        var v = val(c.id, f.k);
        if (f.t === 'rows') {
          p.appendChild(h('h3', { text: f.l }));
          var tb = h('table'), tr = h('tr'); f.cols.forEach(function (col) { tr.appendChild(h('th', { text: col })); }); tb.appendChild(tr);
          var rows = Array.isArray(v) && filled(v) ? v.filter(function (r) { return r.some(function (x) { return String(x || '').trim(); }); }) : [];
          for (var k = rows.length; k < 2; k++) rows.push(f.cols.map(function () { return ''; }));
          rows.forEach(function (r) { var t2 = h('tr'); f.cols.forEach(function (_, j) { t2.appendChild(h('td', { text: r[j] || '' })); }); tb.appendChild(t2); });
          p.appendChild(tb);
        } else {
          p.appendChild(h('div', { class: 'pr-f' }, [h('b', { text: f.l }), h('span', { text: Array.isArray(v) ? v.join('、') : (v || '') })]));
        }
      });
    });
    var ns = nextSteps();
    if (ns.length) { p.appendChild(h('h2', { text: 'これからやること' })); var ol = h('ol'); ns.forEach(function (r) { ol.appendChild(h('li', { text: r.text })); }); p.appendChild(ol); }
    p.appendChild(h('p', { class: 'pr-foot', text: '家じまい123（家じまい相談窓口）　0120-933-496　https://iejimai123.jp/' }));
    window.print();
  }

  /* ---------- ファイル ---------- */
  function saveFile() {
    var b = new Blob([JSON.stringify(st, null, 1)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = 'iejimai123-tebiki_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function loadFile(file) {
    var r = new FileReader();
    r.onload = function () {
      try { var j = JSON.parse(r.result); if (!j || typeof j.data !== 'object') throw 0; useState(j); alert0('ファイルを読み込みました'); }
      catch (e) { alert0('この手引き書のファイルではないようです'); }
    };
    r.readAsText(file);
  }
  function useState(j) { st = { v: 1, updated: j.updated || '', data: j.data || {} }; if (mode === 'device') saveLocal(); go(-1); }
  function alert0(t) { var e = $('tbMsg'); e.textContent = t; e.hidden = false; clearTimeout(alert0.t); alert0.t = setTimeout(function () { e.hidden = true; }, 6000); }

  /* ---------- 鍵をかけて預ける ---------- */
  var enc = new TextEncoder(), dec = new TextDecoder();
  function b64(u8) { var s = ''; for (var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function ub64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function hex(u8) { return Array.prototype.map.call(u8, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  function keys(pass, salt) {
    return crypto.subtle.importKey('raw', enc.encode(pass.normalize('NFKC')), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 310000, hash: 'SHA-256' }, k, 512);
    }).then(function (bits) {
      var u = new Uint8Array(bits), auth = hex(u.slice(32));
      return crypto.subtle.importKey('raw', u.slice(0, 32), 'AES-GCM', false, ['encrypt', 'decrypt']).then(function (ek) {
        return crypto.subtle.digest('SHA-256', enc.encode(auth)).then(function (d) { return { ek: ek, auth: auth, authHash: hex(new Uint8Array(d)) }; });
      });
    });
  }
  function call(body) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'server' }; }); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || 'error'); return j; });
  }
  var ERR = { auth: '預かり番号か合言葉が違います', notfound: '預かり番号が見つかりません', locked: '間違いが続いたため、しばらく使えません。1時間ほどしてからお試しください', rate: '操作が多すぎます。少し時間をおいてください', size: '内容が大きすぎます', server: '通信できませんでした。少し時間をおいてお試しください' };
  function errText(e) { return ERR[e.message] || ERR.server; }
  function fmtId(id) { return id.replace(/(.{4})(?=.)/g, '$1-'); }
  function normId(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function vaultSave() {
    var p1 = $('vPass').value, p2 = $('vPass2').value, out = $('vOut');
    if (p1.length < 8) { out.textContent = '合言葉は8文字以上にしてください'; return; }
    if (p1 !== p2) { out.textContent = '確認のための合言葉が一致しません'; return; }
    out.textContent = '鍵をかけています…';
    var saved = lsGet(LS_VAULT), id = saved || '', salt;
    var pre = id ? call({ op: 'salt', id: id }).then(function (j) { salt = ub64(j.salt); }).catch(function () { id = ''; }) : Promise.resolve();
    pre.then(function () {
      if (!id) salt = crypto.getRandomValues(new Uint8Array(16));
      return keys(p1, salt);
    }).then(function (k) {
      var iv = crypto.getRandomValues(new Uint8Array(12));
      return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k.ek, enc.encode(JSON.stringify(st))).then(function (ct) {
        var body = { iv: b64(iv), data: b64(new Uint8Array(ct)) };
        if (id) { body.op = 'save'; body.id = id; body.auth = k.auth; } else { body.op = 'create'; body.salt = b64(salt); body.authHash = k.authHash; }
        return call(body);
      });
    }).then(function (j) {
      var nid = j.id || id; if (mode === 'device') lsSet(LS_VAULT, nid);
      out.textContent = '';
      out.appendChild(h('b', { text: '預けました。預かり番号：' + fmtId(nid) }));
      out.appendChild(h('span', { text: '　この番号と合言葉は、紙に書いて大切に保管してください。合言葉を忘れると、家じまい123でも中身を取り出せません。' }));
      $('vPass').value = ''; $('vPass2').value = '';
    }).catch(function (e) { out.textContent = errText(e) + '（合言葉が以前と違う場合は、新しく預け直してください）'; if (e.message === 'auth' && $('vNew')) $('vNew').hidden = false; });
  }
  function vaultLoad() {
    var id = normId($('lId').value), pass = $('lPass').value, out = $('lOut');
    if (id.length !== 12 || !pass) { out.textContent = '預かり番号（12文字）と合言葉を入れてください'; return; }
    out.textContent = '取り出しています…'; var k0;
    call({ op: 'salt', id: id }).then(function (j) { return keys(pass, ub64(j.salt)); })
      .then(function (k) { k0 = k; return call({ op: 'load', id: id, auth: k.auth }); })
      .then(function (j) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub64(j.iv) }, k0.ek, ub64(j.data)); })
      .then(function (pt) { useState(JSON.parse(dec.decode(pt))); if (mode === 'device') lsSet(LS_VAULT, id); out.textContent = '取り出しました（最後に預けた日時：' + new Date(st.updated || Date.now()).toLocaleString('ja-JP') + '）'; $('lPass').value = ''; })
      .catch(function (e) { out.textContent = errText(e); });
  }

  function vaultDelete() {
    var id = normId($('lId').value), pass = $('lPass').value, out = $('lOut');
    if (id.length !== 12 || !pass) { out.textContent = '消すには、預かり番号と合言葉を入れてください'; return; }
    if (!window.confirm('預けた内容を、家じまい123から完全に消します。元には戻せません。よろしいですか？')) return;
    out.textContent = '消しています…';
    call({ op: 'salt', id: id }).then(function (j) { return keys(pass, ub64(j.salt)); })
      .then(function (k) { return call({ op: 'delete', id: id, auth: k.auth }); })
      .then(function () { if (lsGet(LS_VAULT) === id) lsSet(LS_VAULT, null); out.textContent = '預けた内容を消しました。'; $('lPass').value = ''; })
      .catch(function (e) { out.textContent = errText(e); });
  }

  /* ---------- 始め方 ---------- */
  function start(m) {
    mode = m; lsSet(LS_MODE, m === 'device' ? 'device' : null);
    if (m !== 'device') { lsSet(LS, null); lsSet(LS_VAULT, null); }
    $('tbStart').hidden = true; $('tbMain').hidden = false;
    $('tbModeNote').textContent = m === 'device' ? '書いた内容は、この端末の中にだけ自動で保存されます。' : '書いた内容は保存されません。画面を閉じる前に、印刷するかファイルに保存してください。';
    if (m === 'device') saveLocal();
    go(-1);
  }
  function init() {
    if (!window.crypto || !crypto.subtle) { var vs = $('tbVaultBox'); if (vs) vs.hidden = true; }
    var saved = lsGet(LS), m = lsGet(LS_MODE);
    if (saved && m === 'device') { try { var j = JSON.parse(saved); st = { v: 1, updated: j.updated || '', data: j.data || {} }; } catch (e) { } start('device'); }
    $('goDevice').addEventListener('click', function () { start('device'); });
    $('goNone').addEventListener('click', function () { start('none'); });
    $('goLoad').addEventListener('click', function () { start(lsGet(LS_MODE) === 'device' ? 'device' : 'none'); $('tbVault').open = true; $('lId').focus(); });
    $('bFile').addEventListener('click', saveFile);
    $('bLoad').addEventListener('change', function (e) { if (e.target.files[0]) loadFile(e.target.files[0]); e.target.value = ''; });
    $('bPrint').addEventListener('click', printAll);
    $('bClear').addEventListener('click', function () {
      if (!window.confirm('この端末に保存した手引き書を消します。よろしいですか？（預けた内容やファイルは消えません）')) return;
      lsSet(LS, null); lsSet(LS_VAULT, null); lsSet(LS_MODE, null); st = { v: 1, updated: '', data: {} }; mode = ''; $('tbMain').hidden = true; $('tbStart').hidden = false;
    });
    $('vSave').addEventListener('click', vaultSave);
    $('lGo').addEventListener('click', vaultLoad);
    $('lDel').addEventListener('click', vaultDelete);
    if ($('vNew')) $('vNew').addEventListener('click', function () { lsSet(LS_VAULT, null); $('vNew').hidden = true; vaultSave(); });
    window.addEventListener('beforeunload', function (e) { if (mode === 'none' && allDone()[0] > 0) { e.preventDefault(); e.returnValue = ''; } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
