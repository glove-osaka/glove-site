/* 電子契約：通信と、設定前のお試し表示（この端末の中だけで動く見本） */
(function () {
  var URL_ = window.KEIYAKU_API_URL || "";
  var DEMO = !URL_ || /[?&]demo=1/.test(location.search);
  window.KEIYAKU_DEMO = DEMO;

  function sess() { try { return sessionStorage.getItem("ij-admin-session") || ""; } catch (e) { return window.__ijs || ""; } }
  window.keiyakuSession = function (t) { window.__ijs = t || ""; try { if (t) sessionStorage.setItem("ij-admin-session", t); else sessionStorage.removeItem("ij-admin-session"); } catch (e) { } };
  window.keiyakuHasSession = function () { return !!sess(); };
  // 通信は1つずつ順番に送る（同時に送ると、向こう側で順番待ちが長くなり失敗しやすいため）
  var QUEUE = Promise.resolve();
  var READ = /^(client\.pdf|admin\.(templates|list|pdf|login|logout)|kanri\.(dash|list|get|report\.draft))$/;
  function once(body) {
    return fetch(URL_, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body, redirect: "follow" })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.text(); })
      .then(function (t) { try { return JSON.parse(t); } catch (e) { throw new Error("bad json"); } });
  }
  function real(action, data) {
    var extra = /^(admin|kanri)\./.test(action) && action !== "admin.login" ? { session: sess() } : {};
    var body = JSON.stringify(Object.assign({ action: action }, data || {}, extra));
    var run = function () {
      return once(body).catch(function (e) {
        // 読むだけの操作は、通信が切れたら少し待ってもう一度だけ試す
        if (READ.test(action)) return new Promise(function (r) { setTimeout(r, 1500); }).then(function () { return once(body); });
        throw e;
      }).catch(function () {
        throw new Error(READ.test(action) ? "通信がうまくいきませんでした。電波の状態を確かめて、もう一度お試しください" :
          "通信が途中で切れました。保存や送信ができたか分からないため、画面を開き直して確かめてから、必要ならもう一度押してください");
      }).then(function (j) { if (!j.ok) { if (j.relogin) { window.keiyakuSession(""); document.dispatchEvent(new Event("ij-relogin")); } throw new Error(j.error || "うまくいきませんでした"); } return j; });
    };
    var p = QUEUE.then(run, run);
    QUEUE = p.catch(function () { });
    return p;
  }


  /* ---- お試し表示 ---- */
  var ISSUER = { name: "株式会社グローブ", service: "家じまい相談窓口", tel: "0120-933-496", hours: "10:00〜19:00" };
  var FIELDS = { name: { label: "お名前", type: "text", required: true }, kana: { label: "ふりがな", type: "text" }, address: { label: "ご住所", type: "text" }, phone: { label: "お電話番号", type: "tel" }, birth: { label: "生年月日", type: "date" }, company: { label: "会社名・屋号", type: "text" }, title: { label: "役職", type: "text" }, bank: { label: "お振込先（銀行名・支店・口座番号・名義）", type: "textarea" } };
  var TPL = [
    { key: "nda", title: "秘密保持契約書", items: false, defaultFields: ["name", "address", "phone"], requireId: false },
    { key: "kaitori", title: "物品売買契約書（買取）", items: true, defaultFields: ["name", "kana", "address", "phone", "birth", "bank"], requireId: true },
    { key: "chosei", title: "相談・調整業務委託契約書", items: false, defaultFields: ["name", "address", "phone"], requireId: false },
    { key: "teikei", title: "業務提携契約書（秘密保持条項付き）", items: false, defaultFields: ["company", "name", "title", "address", "phone"], requireId: false }
  ];
  var SAMPLE = "株式会社グローブ（以下「甲」という。）と 見本 太郎（以下「乙」という。）は、甲が運営する家じまい相談窓口でのご相談に関し、次のとおり秘密保持契約を結ぶ。\n\n第1条（秘密情報）\n本契約で秘密情報とは、ご相談の内容、乙およびその家族の氏名・住所・健康や介護の状況・資産・住まいに関する情報など、相談を通じて甲が知った一切の情報をいう。\n\n第2条（秘密の保持）\n甲は、秘密情報を厳重に管理し、乙の事前の同意なく第三者に開示・漏えいしない。\n\n（お試し表示のため、文面は一部だけを表示しています）";
  function load() { try { return JSON.parse(localStorage.getItem("ij-keiyaku-demo") || "[]"); } catch (e) { return []; } }
  function store(a) { try { localStorage.setItem("ij-keiyaku-demo", JSON.stringify(a)); } catch (e) { } }
  function wait(v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 350); }); }
  function demo(action, d) {
    d = d || {};
    var list = load();
    if (action === "admin.login") return d.pass ? wait({ ok: true, session: "demo" }) : Promise.reject(new Error("パスワードを入れてください"));
    if (action === "admin.logout" || action === "admin.password") return wait({ ok: true });
    if (action === "admin.templates") return wait({ ok: true, templates: TPL, fields: FIELDS });
    if (action === "admin.issue") {
      if (!d.party || !d.party.name || !d.party.email) return Promise.reject(new Error("相手のお名前とメールアドレスを入れてください"));
      var t = TPL.filter(function (x) { return x.key === d.template; })[0];
      var o = { id: "IJ-DEMO-" + (1000 + list.length), token: "demo" + Date.now(), title: t.title, party_name: d.party.name, party_company: d.party.company || "", party_email: d.party.email, status: "送付済み", created: new Date().toISOString(), viewed: "", signed: "", draft: d.draft ? "yes" : "", fields: d.fields, requireId: !!d.requireId };
      list.unshift(o); store(list);
      return wait({ ok: true, id: o.id, url: location.href.replace(/admin\.html.*$/, "index.html") + "?t=" + o.token + "&demo=1" });
    }
    if (action === "admin.list") return wait({ ok: true, rows: list });
    if (action === "admin.resend" || action === "admin.cancel") { list.forEach(function (x) { if (x.id === d.id && action === "admin.cancel") x.status = "取り消し"; }); store(list); return wait({ ok: true }); }
    if (action === "admin.pdf" || action === "client.pdf") return Promise.reject(new Error("お試し表示では、契約書のPDFは作られません"));
    if (action === "client.get") {
      var c = list.filter(function (x) { return x.token === d.token; })[0] || { id: "IJ-DEMO-0001", title: "秘密保持契約書", party_name: "見本 太郎", party_company: "", status: "確認中", fields: ["name", "address", "phone"], requireId: false, draft: "" };
      return wait({ ok: true, contract: { id: c.id, title: c.title, status: c.status, draft: c.draft === "yes", party_name: c.party_name, party_company: c.party_company, body: SAMPLE, fields: (c.fields || ["name"]).map(function (k) { return { key: k, label: FIELDS[k].label, type: FIELDS[k].type, required: !!FIELDS[k].required }; }), requireId: !!c.requireId, issuer: ISSUER, signed: c.status === "締結済み" } });
    }
    if (action === "client.sign") {
      list.forEach(function (x) { if (x.token === d.token) { x.status = "締結済み"; x.signed = new Date().toISOString(); } }); store(list);
      return wait({ ok: true, demo: true });
    }
    if (action === "kanri.dash") return wait({ ok: true, counts: { newCase: 0, open: 0, due: 0, refOpen: 0, signedMonth: 0, waiting: 0 }, due: [], newest: [] });
    if (action === "kanri.list") return wait({ ok: true, rows: [], opts: { caseStatus: ["新規", "連絡済み", "面談予定", "対応中", "取次ぎ中", "完了", "見送り"], refStatus: ["依頼済み", "見積もり中", "成約", "不成約", "取り下げ"] } });
    if (action.indexOf("kanri.") === 0) return Promise.reject(new Error("お試し表示では保存できません"));
    return Promise.reject(new Error("不明な操作です"));
  }
  window.keiyakuApi = function (action, data) { return DEMO ? demo(action, data) : real(action, data); };
})();
