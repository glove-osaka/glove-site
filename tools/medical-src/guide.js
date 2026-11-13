/* 使い方ガイドと入力サポート（医療介護総合支援会）。build.py が assets/guide.js に写します。 */
(function () {
  "use strict";
  var me = document.currentScript, src = me ? me.getAttribute("src") : "assets/guide.js";
  var BASE = src.replace(/assets\/guide\.js.*$/, "");
  var MODE = (me && me.getAttribute("data-mode")) || "site";
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var css = [
    ".gd-btn{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;align-items:center;gap:8px;min-height:56px;padding:0 20px 0 16px;border-radius:999px;border:2px solid #fff;background:var(--gold,#8A621C);color:#fff;font:700 1.05rem/1 var(--f-body,sans-serif);box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer}",
    ".gd-btn .q{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#fff;color:var(--gold,#8A621C);font-size:1.1rem}",
    "body.has-telbar .gd-btn{bottom:84px}@media (min-width:761px){body.has-telbar .gd-btn{bottom:20px}}",
    ".gd-tip{position:fixed;right:16px;bottom:84px;z-index:61;max-width:260px;background:var(--pine-deep,#0A2E33);color:#fff;border-radius:14px;padding:12px 14px;font-size:.98rem;line-height:1.6;box-shadow:0 6px 20px rgba(0,0,0,.25)}",
    "body.has-telbar .gd-tip{bottom:152px}@media (min-width:761px){body.has-telbar .gd-tip{bottom:88px}}",
    ".gd-tip:after{content:'';position:absolute;right:40px;bottom:-8px;border:8px solid transparent;border-bottom:0;border-top-color:var(--pine-deep,#0A2E33)}",
    ".gd-tip button{margin-top:8px;background:#fff;color:var(--pine-deep,#0A2E33);border:0;border-radius:8px;padding:6px 12px;font:700 .9rem var(--f-body,sans-serif);cursor:pointer}",
    ".gd-ov{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.45);display:flex;justify-content:flex-end}",
    ".gd-pn{width:min(440px,100%);height:100%;overflow:auto;background:var(--surface,#fff);color:var(--ink,#14211F);padding:22px 20px 40px;box-shadow:-8px 0 30px rgba(0,0,0,.2);font-family:var(--f-body,sans-serif)}",
    ".gd-pn h2{font-size:1.35rem;margin:0 0 6px}.gd-pn h3{font-size:1.1rem;margin:22px 0 8px}.gd-pn p{margin:0 0 10px;line-height:1.75}",
    ".gd-x{float:right;min-height:44px;padding:0 14px;border-radius:10px;border:2px solid var(--line,#C6D4D3);background:var(--surface,#fff);color:var(--ink,#14211F);font:700 1rem var(--f-body,sans-serif);cursor:pointer}",
    ".gd-here{background:var(--pine-soft,#E3F0F0);border-radius:12px;padding:14px 16px;margin:14px 0}",
    ".gd-goals{display:grid;gap:8px}.gd-goals button{display:flex;gap:12px;align-items:center;text-align:left;min-height:56px;padding:10px 14px;border-radius:12px;border:2px solid var(--line,#C6D4D3);background:var(--surface,#fff);color:var(--ink,#14211F);font:700 1.02rem/1.4 var(--f-body,sans-serif);cursor:pointer}",
    ".gd-goals button:hover,.gd-goals button:focus{border-color:var(--pine,#0E5A63)}.gd-goals .n{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--pine,#0E5A63);color:var(--on-pine,#fff);font-size:.95rem}",
    ".gd-steps{counter-reset:s;list-style:none;padding:0;margin:8px 0 14px}.gd-steps li{counter-increment:s;position:relative;padding:8px 0 8px 42px;line-height:1.7;border-bottom:1px dashed var(--line,#C6D4D3)}",
    ".gd-steps li:before{content:counter(s);position:absolute;left:0;top:8px;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--gold-soft,#F5ECDA);color:var(--gold,#8A621C);font-weight:700}",
    ".gd-go{display:flex;align-items:center;justify-content:center;min-height:52px;border-radius:12px;background:var(--pine,#0E5A63);color:var(--on-pine,#fff);font-weight:700;text-decoration:none;margin:6px 0}",
    ".gd-back{min-height:44px;margin-top:6px;padding:0 14px;border-radius:10px;border:2px solid var(--line,#C6D4D3);background:transparent;color:var(--ink,#14211F);font:700 .98rem var(--f-body,sans-serif);cursor:pointer}",
    ".gd-flash{outline:4px solid var(--gold-bright,#C99A45)!important;outline-offset:4px;border-radius:8px;transition:outline-color .3s}",
    /* 入力サポート */
    ".fh-tip{margin:8px 0 2px;padding:10px 12px;border-radius:10px;background:var(--gold-soft,#F5ECDA);color:var(--ink,#14211F);font-size:.95rem;line-height:1.65;border-left:5px solid var(--gold-bright,#C99A45)}",
    ".fh-tip b{display:block;margin-bottom:2px}.fh-tip .ex{display:block;color:var(--muted,#3A4A48)}",
    ".fh-msg{margin:6px 0 0;padding:0;border:0;background:none;font-size:.92rem;font-weight:700}.fh-msg.fh-bad{color:#B3261E}.fh-msg.fh-good{color:var(--pine,#0E5A63)}",
    ".fh-badf{border-color:#B3261E!important;box-shadow:0 0 0 3px rgba(179,38,30,.15)!important}",
    ".fh-bar{position:fixed;left:16px;bottom:16px;z-index:59;display:flex;align-items:center;gap:10px;max-width:calc(100% - 200px);padding:8px 8px 8px 14px;border-radius:999px;background:var(--pine-deep,#0A2E33);color:#fff;font:700 .98rem/1.3 var(--f-body,sans-serif);box-shadow:0 6px 20px rgba(0,0,0,.25)}",
    ".fh-bar button{flex:none;min-height:40px;padding:0 14px;border-radius:999px;border:0;background:#fff;color:var(--pine-deep,#0A2E33);font:700 .95rem var(--f-body,sans-serif);cursor:pointer}",
    ".fh-bar.done{background:var(--pine,#0E5A63)}",
    "body.has-telbar .fh-bar{bottom:84px}@media (min-width:761px){body.has-telbar .fh-bar{bottom:20px}}",
    "@media (max-width:520px){.gd-btn{padding:0 12px 0 8px;min-height:48px;font-size:.95rem}.gd-btn .q{width:26px;height:26px}.fh-bar{max-width:calc(100% - 140px);font-size:.9rem;padding:6px 6px 6px 12px}.fh-bar button{min-height:36px;padding:0 10px}}",
    "@media print{.gd-btn,.gd-tip,.fh-bar{display:none!important}}"
  ].join("");
  document.head.appendChild(el("style", "", css));

  /* ---------- 使い方ガイド ---------- */
  var GOALS = [
    { k: "soudan", t: "相談したい（無料）", steps: ["下の「相談のページを開く」を押します。", "あなたの立場を選びます（押すだけです）。", "相談の内容を、大分類・中分類・小分類の順に選びます。くわしく書かなくても大丈夫です。", "返信を受け取るメールアドレスを入れます。名前を伏せることもできます。", "「確認」の画面で内容を見て、「この内容で送信する」を押します。", "原則3営業日以内に、メールで返信が届きます。"], go: [["相談のページを開く", "contact/index.html"]] },
    { k: "kaiin", t: "会員になりたい", steps: ["会員制度のページで、会費と条件を確かめます。", "「会員登録を申し込む」を押し、会員の種類と支払い方法を選びます。", "お名前・住所・メールアドレスなどを1画面で入れます（約5分）。", "そのまま電子契約の画面に切り替わります。メールに届く6けたの数字を入れて、規約を確認し、押印・承認します。", "届いた振込のご案内に従って会費を振り込めば、登録完了です。"], go: [["会員制度のページを開く", "member/index.html"], ["すぐに申し込む", "member/apply.html"]] },
    { k: "shien", t: "どんな支援があるか見たい", steps: ["支援メニューのページを開きます。", "支援が3つの分類に分かれています。気になる項目を押すと、説明が読めます。", "各ページの「相談を送る」から、そのまま相談を送れます。"], go: [["支援メニューを開く", "support/index.html"]] },
    { k: "tachiba", t: "自分の立場に合う情報を見たい", steps: ["「立場から選ぶ」のページを開きます。", "企業・事業者／医療・介護で働く方／利用者・ご本人／ご家族 から、あなたに近いものを押します。", "その立場でよくある相談と、使える支援がまとめて読めます。"], go: [["立場から選ぶ", "roles/index.html"]] },
    { k: "kyu", t: "急いでいる・命に関わる", steps: ["命や体に関わるときは、すぐに 119番 へ電話してください。", "事件・事故は 110番 へ。", "救急車を呼ぶか迷うときは、大阪府内では #7119（救急安心センターおおさか）へ。", "この窓口は緊急の対応を行っていません。"], go: [["公的な相談窓口の一覧", "soudan/index.html"]] },
    { k: "moji", t: "文字を大きくしたい", steps: ["画面のいちばん上にある「文字の大きさ」の「大」または「特大」を押します。", "一度選ぶと、ほかのページでもその大きさのままになります。", "元に戻すときは「標準」を押します。"], act: "moji" },
    { k: "kyoryoku", t: "提携・協業を申し込みたい（事業者・専門家）", steps: ["提携・協業の申し込みフォームを開きます。", "申し込みの種類と、協力できる分野を選びます。", "事業者名・ご担当者・提供できるサービスなどを入れて送ります。", "担当者から連絡し、面談のうえで提携の可否を決めます。"], go: [["提携・協業の申し込みフォーム", "kyoryoku/teikei.html"]] },
    { k: "youbou", t: "ほしい支援・改善の要望を伝えたい", steps: ["要望の窓口を開きます。", "要望の種類を選び、内容を書きます。", "名前なしでも送れます。返信がほしいときだけメールアドレスを入れます。"], go: [["要望の窓口を開く", "kyoryoku/youbou.html"]] },
    { k: "shokai", t: "事業所・法人を紹介したい", steps: ["会員制度のページの「紹介料の仕組み」を読みます。", "個人会員（営業協力者・無料）として申し込み、電子契約で登録します。", "登録が済むと、あなたの紹介コードがメールで届きます。", "紹介先には、申込みの「紹介者」欄にそのコードを書いてもらいます。"], go: [["紹介料の仕組みを読む", "member/index.html#shokai"], ["個人会員を申し込む", "member/apply.html"]] }
  ];
  function here() {
    var p = location.pathname.replace(/index\.html$/, "");
    var H = [
      [/\/contact\/$/, "相談を送るページ", "4つの段階で進みます。① 立場を選ぶ → ② 相談の内容を大分類・中分類・小分類の順に選ぶ（詳細は書かなくても進めます）→ ③ ご連絡先 → ④ 確認 です。各段階の下の「次へ進む」を押してください。"],
      [/\/member\/apply\.html$/, "会員登録の申込みページ", "① 会員の種類 → ② 支払い方法 → ③ お申込者 → ④ 同意のチェック の順に入れ、いちばん下の「この内容で電子契約へ進む」を押します。画面の左下に、あといくつ入れればよいかが出ます。"],
      [/\/member\/kiyaku\.html$/, "会員規約のページ", "電子契約で確認していただく規約の全文です。読み終えたら、いちばん下の「会員登録を申し込む」から申し込めます。"],
      [/\/member\/$/, "会員制度のページ", "会費・支払い方法・契約の条件・紹介料の仕組みが書いてあります。申し込むときは「会員登録を申し込む」を押します。"],
      [/\/support\/$/, "支援メニューのページ", "支援が3つの分類に分かれています。項目を押すと、それぞれの説明のページが開きます。"],
      [/\/support\//, "支援の説明のページ", "この支援でできること・できないことが書いてあります。相談するときは、ページ内の「相談を送る」を押すと、この支援が選ばれた状態で受付が開きます。"],
      [/\/roles\/$/, "立場から選ぶページ", "4つの立場から、あなたに近いものを押してください。"],
      [/\/roles\//, "立場ごとのページ", "この立場でよくある相談・使える支援・相談の例が書いてあります。「困りごとを相談する」などのボタンから、そのまま相談を送れます。"],
      [/\/soudan\/$/, "緊急時・公的な相談窓口のページ", "急ぐときの電話番号と、公的な相談窓口が書いてあります。高齢者虐待の相談先は、市町村を選ぶと表示されます。"],
      [/\/kyoryoku\/teikei\.html$/, "提携・協業の申し込みフォーム", "申し込みの種類と協力できる分野を選び、必須の欄を入れて「この内容で申し込む」を押します。画面の左下に、あといくつ入れればよいかが出ます。"],
      [/\/kyoryoku\/youbou\.html$/, "要望の窓口", "要望の種類を選び、内容を書いて送ります。名前なしでも送れます。返信がほしいときだけ、メールアドレスを入れてください。"],
      [/\/kyoryoku\/$/, "提携・協業・要望のページ", "提携・協業の申し込みと、要望は、それぞれ専用の窓口があります。当てはまるほうのボタンを押してください。"],
      [/\/faq\/$/, "よくある質問のページ", "質問を押すと、答えが開きます。"],
      [/\/keiyaku\/$/, "電子契約の画面", "① メールに届いた6けたの数字を入れる → ② 契約の内容を読む → ③ 必要なことを記入 → ④ 押印して承認 の順に進みます。入力中は、欄の下に説明が出ます。"],
      [/\/$/, "トップページ", "はじめての方は、下の「何をしたいですか？」から選んでください。手順と、開くページをご案内します。"]
    ];
    for (var i = 0; i < H.length; i++) if (H[i][0].test(p)) return H[i];
    return [null, "このページ", "知りたいことを、下の「何をしたいですか？」から選んでください。"];
  }
  function openPanel(goal) {
    var ov = el("div", "gd-ov"), pn = el("div", "gd-pn"); ov.appendChild(pn);
    pn.setAttribute("role", "dialog"); pn.setAttribute("aria-modal", "true"); pn.setAttribute("aria-label", "使い方の案内");
    function close() { ov.remove(); btn && btn.focus(); document.removeEventListener("keydown", key); }
    function key(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", key);
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    function home() {
      var h = here();
      pn.innerHTML = '<button type="button" class="gd-x">閉じる ×</button><h2>使い方の案内</h2><p>分からないときは、いつでもこのボタンを押してください。</p>' +
        '<div class="gd-here"><b>いま見ているのは「' + esc(h[1]) + '」です</b><p style="margin:6px 0 0">' + esc(h[2]) + "</p></div>" +
        "<h3>何をしたいですか？</h3><div class=\"gd-goals\">" + GOALS.map(function (g, i) { return '<button type="button" data-g="' + g.k + '"><span class="n">' + (i + 1) + "</span>" + esc(g.t) + "</button>"; }).join("") + "</div>" +
        '<h3>それでも分からないとき</h3><p>受付フォームに「使い方が分からない」と書いて送っていただければ、担当者からご案内します。</p><a class="gd-go" href="' + BASE + 'contact/index.html">相談のページを開く</a>';
      pn.querySelector(".gd-x").onclick = close;
      pn.querySelectorAll("[data-g]").forEach(function (b) { b.onclick = function () { show(b.getAttribute("data-g")); }; });
      pn.querySelector(".gd-x").focus();
    }
    function show(k) {
      var g = GOALS.filter(function (x) { return x.k === k; })[0]; if (!g) return home();
      pn.innerHTML = '<button type="button" class="gd-x">閉じる ×</button><h2>' + esc(g.t) + '</h2><p>この順番で進めてください。</p><ol class="gd-steps">' + g.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        (g.go || []).map(function (x) { return '<a class="gd-go" href="' + BASE + x[1] + '">' + esc(x[0]) + "</a>"; }).join("") +
        (g.act === "moji" ? '<button type="button" class="gd-go" style="width:100%;border:0;cursor:pointer" data-act="moji">文字の大きさのボタンの場所を見る</button>' : "") +
        '<button type="button" class="gd-back">‹ ほかのことを選ぶ</button>';
      pn.querySelector(".gd-x").onclick = close;
      pn.querySelector(".gd-back").onclick = home;
      var a = pn.querySelector("[data-act=moji]");
      if (a) a.onclick = function () { close(); var f = document.querySelector(".fs"); if (f) { scrollTo({ top: 0, behavior: "smooth" }); f.classList.add("gd-flash"); setTimeout(function () { f.classList.remove("gd-flash"); }, 4000); } };
      pn.querySelector(".gd-x").focus();
    }
    document.body.appendChild(ov);
    goal ? show(goal) : home();
  }
  var btn = null;
  if (MODE === "site") {
    btn = el("button", "gd-btn", '<span class="q" aria-hidden="true">？</span>使い方');
    btn.type = "button"; btn.setAttribute("aria-label", "使い方の案内を開く");
    btn.onclick = function () { var t = document.querySelector(".gd-tip"); if (t) t.remove(); openPanel(); };
    document.body.appendChild(btn);
    var tries = 0;
    (function waitOp() { var op = document.querySelector(".opn"); if (op && visible(op) && tries++ < 90) return setTimeout(waitOp, 1000); showTip(); })();
  }
  function showTip() {
    if (window.FORM_HELP) return; /* 入力の画面では、欄ごとの説明が出るので吹き出しは出さない */
    if (!ls("iryo-guide-seen")) {
      var tip = el("div", "gd-tip", "<b>はじめての方へ</b>使い方が分からないときは、右下の「使い方」を押してください。手順をご案内します。<br><button type=\"button\">わかりました</button>");
      tip.setAttribute("role", "note");
      document.body.appendChild(tip);
      tip.querySelector("button").onclick = function () { tip.remove(); ls("iryo-guide-seen", "1"); };
      setTimeout(function () { if (tip.parentNode) { tip.remove(); ls("iryo-guide-seen", "1"); } }, 15000);
    }
  }
  if (MODE === "site") window.iryoGuide = openPanel;

  /* ---------- 入力サポート ---------- */
  var HELP = window.FORM_HELP || {};
  var Z2H = function (s) { return s.replace(/[０-９Ａ-Ｚａ-ｚ＠．－ー―‐＿]/g, function (c) { var m = { "＠": "@", "．": ".", "－": "-", "ー": "-", "―": "-", "‐": "-", "＿": "_" }; return m[c] || String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }); };
  function fieldOf(t) { return t && t.closest ? t.closest(".fld") : null; }
  function labelOf(inp) { var l = inp.id && document.querySelector('label[for="' + inp.id + '"]'); return l ? l.textContent.replace(/必須/g, "").trim() : ""; }
  function isReq(inp) {
    var h = HELP[inp.id]; if (h && h.req != null) return !!h.req;
    var l = inp.id && document.querySelector('label[for="' + inp.id + '"]');
    return !!(inp.required || (l && l.querySelector(".req")));
  }
  function visible(e) { return !!(e && (e.offsetWidth || e.offsetHeight || e.getClientRects().length)) && !e.closest("[hidden]"); }
  function helpFor(inp) {
    var h = HELP[inp.id]; if (h && h.t) return h;
    var lb = labelOf(inp), ty = (inp.getAttribute("type") || inp.tagName).toLowerCase();
    if (ty === "email") return { t: "メールアドレスを半角で入れます。", ex: "例：yamada@example.jp（全角で入れても自動で直します）" };
    if (ty === "tel") return { t: "電話番号を数字で入れます。", ex: "例：06-1234-5678　ハイフンはあってもなくても大丈夫です" };
    if (ty === "number") return { t: "数字だけを入れます。", ex: "全角の数字も自動で直します" };
    if (ty === "date") return { t: "日付を選びます。", ex: "欄を押すと、こよみが開きます" };
    if (ty === "file") return { t: "写真を選ぶか、その場で撮影します。", ex: "文字がはっきり読めるように、明るい場所で撮ってください" };
    if (ty === "password") return { t: "パスワードを入れます。", ex: "大文字・小文字、全角・半角の違いにご注意ください" };
    if (ty === "select") return { t: "一覧から1つ選びます。", ex: "欄を押すと選べるものが出ます" };
    if (ty === "textarea") return { t: (lb ? "「" + lb + "」を自由に書いてください。" : "自由に書いてください。"), ex: "うまく書けなくても大丈夫です。担当者が確認します" };
    return lb ? { t: "「" + lb + "」を入れてください。" } : null;
  }
  function clearTip(f) { var t = f && f.querySelector(".fh-tip"); if (t) t.remove(); }
  function msg(f, cls, text) { var m = f.querySelector(".fh-msg"); if (!text) { if (m) m.remove(); return; } if (!m) { m = el("p", "fh-msg"); m.setAttribute("aria-live", "polite"); f.appendChild(m); } m.className = "fh-msg " + (cls === "bad" ? "fh-bad" : "fh-good"); m.textContent = text; }
  function norm(inp) {
    var ty = (inp.getAttribute("type") || "").toLowerCase(), v = String(inp.value || "");
    if (/^(email|tel|number)$/.test(ty) || inp.inputMode === "numeric" || /code|Code/.test(inp.id)) { var n = Z2H(v).trim(); if (n !== v) { inp.value = n; v = n; try { inp.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) {} } }
    return v;
  }
  function check(inp, final) {
    var f = fieldOf(inp); if (!f || !visible(inp)) return true;
    var ty = (inp.getAttribute("type") || "").toLowerCase(), v = String(inp.value || "");
    v = norm(inp);
    var bad = "";
    if (!v.trim()) { if (isReq(inp) && final) bad = "ここは必ず入れてください。"; }
    else if (ty === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) bad = "メールアドレスの形が違うようです。「@」と「.」が入っているか確かめてください。";
    else if (ty === "tel" && (v.replace(/\D/g, "").length < 10 || v.replace(/\D/g, "").length > 11)) bad = "電話番号のけた数が違うようです（10けたか11けたです）。";
    else if (HELP[inp.id] && HELP[inp.id].min && v.length < HELP[inp.id].min) bad = HELP[inp.id].minMsg || ("あと" + (HELP[inp.id].min - v.length) + "文字以上入れてください。");
    inp.classList.toggle("fh-badf", !!bad);
    if (bad) msg(f, "bad", bad); else if (v.trim() && ty !== "password") msg(f, "ok", "✓ 入力できています"); else msg(f, "", "");
    return !bad;
  }
  var inputs = "input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not(#hpf),select,textarea";
  document.addEventListener("focusin", function (e) {
    var t = e.target; if (!t.matches || !t.matches(inputs)) return;
    var f = fieldOf(t); if (!f) return; clearTip(f);
    var h = helpFor(t); if (!h) return;
    var tip = el("div", "fh-tip", "<b>" + esc(h.t) + "</b>" + (h.ex ? '<span class="ex">' + esc(h.ex) + "</span>" : ""));
    tip.setAttribute("role", "note");
    var m = f.querySelector(".fh-msg"); f.insertBefore(tip, m || null);
  });
  /* 画面がずれて押し間違えないよう、離れたあと少し待ってから説明を消す */
  document.addEventListener("focusout", function (e) { var t = e.target; if (!t.matches || !t.matches(inputs)) return; var f = fieldOf(t); norm(t); setTimeout(function () { if (document.activeElement !== t) clearTip(f); check(t, true); updBar(); }, 350); });
  document.addEventListener("input", function (e) { var t = e.target; if (t.classList && t.classList.contains("fh-badf")) check(t, false); updBar(); });
  document.addEventListener("change", function () { setTimeout(updBar, 0); });

  /* 必須の欄の残り（画面の左下） */
  var bar = null, GROUPS = window.FORM_GROUPS || [];
  function pending() {
    var out = [];
    GROUPS.forEach(function (g) { var first = document.querySelector('input[name="' + g.name + '"]'); if (!first || !visible(first)) return; if (!document.querySelector('input[name="' + g.name + '"]:checked')) out.push({ el: first, label: g.label }); });
    document.querySelectorAll(inputs).forEach(function (i) { if (visible(i) && isReq(i) && !String(i.value || "").trim()) out.push({ el: i, label: labelOf(i) }); });
    (window.FORM_CHECKS || []).forEach(function (id) { var c = document.getElementById(id); if (c && visible(c) && !c.checked) out.push({ el: c, label: "同意のチェック" }); });
    return out;
  }
  function updBar() {
    if (!bar) return;
    var form = firstVis(window.FORM_SCOPE || "form");
    if (!form) { bar.hidden = true; return; }
    var p = pending(); bar.hidden = false;
    var sm = window.matchMedia && matchMedia("(max-width:520px)").matches;
    if (p.length) { bar.className = "fh-bar"; bar.querySelector("span").textContent = sm ? "あと " + p.length + " か所" : (window.FORM_STEPWISE ? "この段階で" : "") + "入れる欄：あと " + p.length + " か所"; bar.querySelector("button").textContent = "次の欄へ ›"; }
    else { bar.className = "fh-bar done"; bar.querySelector("span").textContent = sm ? "✓ 入力済み" : (window.FORM_STEPWISE ? "✓ この段階は入力できました" : "✓ 必要な欄はすべて入力できました"); bar.querySelector("button").textContent = sm ? "進む ›" : (window.FORM_DONE_LABEL || "送るボタンへ ›"); }
  }
  function firstVis(sel) { var l = document.querySelectorAll(sel); for (var i = 0; i < l.length; i++) if (visible(l[i])) return l[i]; return null; }
  if ((window.FORM_HELP || window.FORM_GROUPS) && !window.FORM_NOBAR) {
    bar = el("div", "fh-bar", "<span></span><button type=\"button\"></button>"); bar.hidden = true; bar.setAttribute("aria-live", "polite");
    document.body.appendChild(bar);
    bar.querySelector("button").onclick = function () {
      var p = pending();
      if (p.length) { var t = p[0].el; t.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(function () { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }, 350); var f = t.closest(".fld,fieldset,label") || t; f.classList.add("gd-flash"); setTimeout(function () { f.classList.remove("gd-flash"); }, 2500); }
      else { var s = firstVis(window.FORM_SUBMIT || "form [type=submit]"); if (s) { s.scrollIntoView({ block: "center", behavior: "smooth" }); s.classList.add("gd-flash"); setTimeout(function () { s.classList.remove("gd-flash"); }, 2500); } else { var n = firstVis(window.FORM_NEXT || "#next"); if (n) { n.scrollIntoView({ block: "center", behavior: "smooth" }); n.classList.add("gd-flash"); setTimeout(function () { n.classList.remove("gd-flash"); }, 2500); } } }
    };
    setInterval(updBar, 1500); setTimeout(updBar, 300);
  }
})();
