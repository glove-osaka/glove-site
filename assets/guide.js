/* 家じまい相談窓口：使い方サポート
   ・すべてのページの右下に「使い方」ボタン。押すと「このページでできること」と、画面の場所を順に光らせる案内
   ・相談フォームでは、いまの段階の説明と入力のこつを表示（入力サポート） */
(function () {
  'use strict';
  if (window.__ijGuide) return; window.__ijGuide = 1;
  var D = document, W = window;
  var src = (D.currentScript && D.currentScript.src) || '';
  var ROOT = src.replace(/assets\/guide\.js.*$/, '');
  var TEL = '0120-933-496', TELL = 'tel:0120933496';
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function el(t, a, h) { var e = D.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (h != null) e.innerHTML = h; return e; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function seen(e) { if (!e) return false; var r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; }
  function first() { for (var i = 0; i < arguments.length; i++) { var e = typeof arguments[i] === 'string' ? $(arguments[i]) : arguments[i]; if (seen(e)) return e; } return null; }

  /* ---------- どのページか ---------- */
  var path = location.pathname.replace(/index\.html$/, '');
  var kind = /\/services\/$/.test(path) ? 'services' : /\/services\/[a-z]+\.html$/.test(path) ? 'svc'
    : /\/situations\/$/.test(path) ? 'situations' : /\/situations\/[a-z]+\.html$/.test(path) ? 'sit'
    : (/\/(about|flow|faq|company|contact|cases|partners|privacy|terms|kyoryoku|keiyaku)\/$/.exec(path) || [])[1] || (/\/$/.test(path) || /\/iejimai-site\/$/.test(path) ? 'top' : 'other');
  if (kind === 'other' && $('.hero')) kind = 'top';

  /* ---------- ページごとの説明と、順に光らせる場所 ---------- */
  var nav = function () { return first('#menuBtn', '#gnav'); };
  var navText = function () { return seen($('#menuBtn')) ? '「メニュー」を押すと、ほかのページの一覧が開きます。' : 'ほかのページへは、この上の帯から移動できます。'; };
  var common = [
    [function () { return first('.fs'); }, '文字が小さくて読みにくいときは、「大」か「特大」を押してください。文字が大きくなります。'],
    [function () { return first('.telbar', '.util-tel'); }, 'お電話でのご相談はこちらです。受付は10:00〜19:00、通話料は無料です。'],
    [nav, navText]
  ];
  var cta = [function () { return first('main a.btn[href*="contact/"]', '.cta-band .btn', '.hd .cta'); }, '「相談内容をまとめる」を押すと、質問に答えるだけでご相談の内容がまとまり、そのまま窓口に送れます。'];
  var P = {
    top: { t: 'トップページ', d: ['家じまいのご相談を、どこから始めればよいかを選べるページです。', '迷ったときは「困りごとから探す」から選ぶのがおすすめです。'],
      s: common.slice(0, 2).concat([
        [function () { return first('.doors', '.tiles'); }, 'どこから見ればよいか迷ったら、この3つの入口から選んでください。'],
        [function () { return first('#acc-self', '#acc-family'); }, '「ご本人」か「ご家族」を押すと、困りごとの一覧が開きます。当てはまるものを押すと、進め方の目安が見られます。'],
        [function () { return first('.svcs'); }, '21の分野から、サービスの内容を見ることもできます。'],
        [nav, navText], cta]) },
    services: { t: 'サービス一覧', d: ['21の分野のサービスが、6つの分類にまとめてあります。', '分類の見出しを押すと、その中の分野が開きます。'],
      s: [[function () { return first('.toc'); }, '分類の名前を押すと、その場所まで移動します。'], [function () { return first('main .acc'); }, '見出しを押すと、中の分野が開きます。もう一度押すと閉じます。'], cta] },
    svc: { t: 'サービスの説明', d: ['このサービスでできることと、だれが担当するかを説明したページです。', '見出しの「開く」を押すと、詳しい内容が出ます。'],
      s: [[function () { return first('main .blk'); }, '「開く」を押すと、くわしい説明が開きます。'], [function () { return first('main .who', 'main .blk:nth-of-type(3)'); }, 'だれが担当するか（窓口・提携事業者・専門家）が書いてあります。'],
        [function () { return first('main .case-minis'); }, 'このサービスを使った場合の、想定の事例です。'], cta] },
    situations: { t: '困りごとから探す', d: ['いまの状況から、進め方の目安を探せるページです。', '「ご本人」か「ご家族」を押して、当てはまるものを選んでください。'],
      s: [[function () { return first('#acc-self'); }, 'ご自身のことで気になっている方は、こちらを押してください。'], [function () { return first('#acc-family'); }, '親御さんやご家族のことで気になっている方は、こちらを押してください。'], cta] },
    sit: { t: '困りごとの進め方', d: ['この状況のときに、何をどの順番で進めるとよいかの目安です。'],
      s: [[function () { return first('main .omoi'); }, 'ご本人とご家族が、よく感じる思いです。'], [function () { return first('main .tl'); }, '「開く」を押すと、時期ごとの進め方の目安が見られます。'], [function () { return first('main .rel'); }, 'この状況に関係するサービスです。押すと説明が開きます。'], cta] },
    flow: { t: '相談の流れ・費用', d: ['ご相談から始まるまでの流れと、費用の考え方、契約の方法の説明です。', 'ご相談とお見積りは無料です。'],
      s: [[function () { return first('main .flow'); }, 'ご相談の流れです。上から順に進みます。'], [function () { return first('main .tiers', 'main .tbl-wrap'); }, '費用がかかるもの・かからないものの説明です。'], [function () { return first('#keiyaku'); }, 'スマホやパソコンで結べる、電子契約の説明です。'], cta] },
    faq: { t: 'よくある質問', d: ['よくいただく質問と答えです。', '質問を押すと、答えが開きます。'],
      s: [[function () { return first('main .faq details', 'main details'); }, '質問を押すと、答えが開きます。もう一度押すと閉じます。'], common[1], cta] },
    contact: { t: '相談内容をまとめる', d: ['質問に順番に答えるだけで、ご相談の内容がまとまり、そのまま窓口に送れるページです。', '全部で7つの段階です。分からないところは空欄のまま進めても大丈夫です。', 'お電話（' + TEL + '）で話しながら入力することもできます。'],
      s: [[function () { return first('#toiawase'); }, 'お電話・メール・ご来店でもご相談いただけます。'], [function () { return first('#steps'); }, 'いま何番目の段階かが、ここに出ます。'], [function () { return first('#f section:not([hidden])'); }, 'ここに答えを入れます。当てはまるものを押して選んでください。'], [function () { return first('#next'); }, '答えたら「次へ進む」を押します。前に戻りたいときは「前に戻る」を押します。']] },
    cases: { t: '相談事例', d: ['窓口がどのようにお手伝いするかを、想定の事例でご紹介しています。', '事例を押すと、くわしい流れが開きます。'],
      s: [[function () { return first('main .pt-intro'); }, '窓口が大切にしていることです。'], [function () { return first('main .case'); }, '事例を押すと、くわしい流れが開きます。'], cta] },
    company: { t: '運営会社', d: ['家じまい相談窓口を運営する、株式会社グローブの代表のあいさつと会社の情報です。'], s: common.concat([cta]) },
    about: { t: '窓口について', d: ['家じまい相談窓口が、どのようなお手伝いをするかの説明です。'], s: common.concat([cta]) },
    partners: { t: '提携・協業の募集', d: ['事業者・専門家・医療介護の関係者の方向けのページです。', '「提携・協業を申し込む」から、申し込みページへ進めます。'],
      s: [[function () { return first('main a[href*="kyoryoku/"]'); }, 'ここを押すと、提携・協業の申し込みページが開きます。']] },
    privacy: { t: '個人情報の取り扱い', d: ['お預かりする個人情報の扱い方の説明です。', '見出しを押すと、内容が開きます。'], s: [[function () { return first('main .blk', 'main details'); }, '見出しを押すと内容が開きます。']] },
    terms: { t: '利用規約・免責事項', d: ['このサイトをご利用いただく際のお約束です。', '見出しを押すと、内容が開きます。'], s: [[function () { return first('main .blk', 'main details'); }, '見出しを押すと内容が開きます。']] },
    kyoryoku: { t: '提携・協業のお申し込み', d: ['事業者・専門家・医療介護の関係者の方の申し込みページです。', '上から順に入力し、最後に「この内容で申し込む」を押してください。'],
      s: [[function () { return first('#bn'); }, 'まず「大分類」を選ぶと「中分類」が、「中分類」を選ぶと「小分類」が選べるようになります。くわしい内容は「詳細」に書いてください。'], [function () { return first('#bnAdd'); }, '分野が複数あるときは、ここで行を増やせます。'], [function () { return first('#area'); }, '地域は、1回押すと「✓ 対応」、もう1回で「✕ 除外」になります。'], [function () { return first('#meetWay'); }, '面談の方法を選びます。'], [function () { return first('#meetDates'); }, '面談の希望日を、日にちと時間帯から選びます。第1希望は必ず選んでください。'], [function () { return first('#send'); }, '最後に、同意の欄に印を付けて、ここを押します。']] },
    other: { t: 'このページ', d: ['分からないことがあれば、お電話（' + TEL + '）でお気軽にお尋ねください。'], s: common.concat([cta]) }
  };
  var G = P[kind] || P.other;

  /* ---------- 見た目 ---------- */
  var css = '.ijg-btn{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:120;display:inline-flex;align-items:center;gap:8px;min-height:56px;padding:0 20px 0 14px;border-radius:99px;border:2px solid #fff;background:var(--gold,#8A621C);color:#fff;font:inherit;font-weight:700;font-size:1.05rem;box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer}'
    + '.ijg-btn i{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#fff;color:var(--gold,#8A621C);font-style:normal;font-size:1.15rem}'
    + 'body.has-telbar .ijg-btn{bottom:calc(76px + env(safe-area-inset-bottom,0px))}@media (min-width:761px){body.has-telbar .ijg-btn{bottom:22px}}'
    + '.ijg-tip{position:fixed;right:max(14px,env(safe-area-inset-right,0px));z-index:121;max-width:min(300px,calc(100vw - 28px));background:var(--surface,#fff);color:var(--ink,#16201B);border:2px solid var(--gold,#8A621C);border-radius:12px;padding:12px 40px 12px 14px;font-size:1rem;line-height:1.7;box-shadow:0 6px 20px rgba(0,0,0,.2)}'
    + '.ijg-tip button{position:absolute;top:4px;right:4px;width:36px;height:36px;border:0;background:none;font-size:1.3rem;cursor:pointer;color:inherit}'
    + '.ijg-ov{position:fixed;inset:0;z-index:130;background:rgba(10,20,16,.55)}'
    + '.ijg-panel{position:fixed;z-index:131;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 40px);overflow:auto;background:var(--surface,#fff);color:var(--ink,#16201B);border-radius:16px;padding:22px 20px 18px;box-shadow:0 10px 40px rgba(0,0,0,.35);font-size:1.05rem;line-height:1.85}'
    + '.ijg-panel h2{font-size:1.3rem;margin:0 0 6px}.ijg-panel h3{font-size:1.08rem;margin:18px 0 6px;color:var(--pine,#1D4A3D)}.ijg-panel p{margin:.2em 0}.ijg-panel ul{margin:.3em 0;padding-left:1.2em}'
    + '.ijg-acts{display:grid;gap:10px;margin-top:10px}.ijg-acts a,.ijg-acts button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;border-radius:10px;font:inherit;font-weight:700;text-decoration:none;cursor:pointer;border:2px solid var(--pine,#1D4A3D);background:var(--surface,#fff);color:var(--pine,#1D4A3D);padding:0 12px;text-align:center}'
    + '.ijg-acts .p{background:var(--pine,#1D4A3D);color:var(--on-pine,#fff)}.ijg-x{position:absolute;top:8px;right:8px;width:44px;height:44px;border:0;background:none;font-size:1.5rem;cursor:pointer;color:inherit}'
    + '.ijg-ring{position:fixed;z-index:132;border-radius:12px;box-shadow:0 0 0 4px var(--gold-bright,#C99A45),0 0 0 9999px rgba(10,20,16,.6);pointer-events:none;transition:all .25s ease}'
    + '.ijg-bub{position:fixed;z-index:133;width:min(380px,calc(100vw - 24px));background:var(--surface,#fff);color:var(--ink,#16201B);border-radius:14px;padding:16px 16px 12px;box-shadow:0 8px 30px rgba(0,0,0,.35);font-size:1.08rem;line-height:1.8}'
    + '.ijg-bub .n{font-size:.92rem;color:var(--muted,#3B4740);font-weight:700}.ijg-bub .b{display:flex;gap:8px;justify-content:flex-end;margin-top:10px;flex-wrap:wrap}'
    + '.ijg-bub button{min-height:48px;min-width:5.5em;border-radius:10px;font:inherit;font-weight:700;cursor:pointer;border:2px solid var(--pine,#1D4A3D);background:var(--surface,#fff);color:var(--pine,#1D4A3D);padding:0 12px}.ijg-bub button.p{background:var(--pine,#1D4A3D);color:var(--on-pine,#fff)}'
    + '.ijg-help{margin:0 0 16px;padding:14px 16px;border-radius:12px;background:var(--gold-soft,#F5ECDA);color:var(--ink,#16201B);font-size:1.02rem;line-height:1.8;border-left:6px solid var(--gold,#8A621C)}'
    + '.ijg-help b.h{display:block;font-size:1.08rem;margin-bottom:2px}.ijg-help .left{display:inline-block;margin-left:.5em;font-size:.92rem;font-weight:700;color:var(--gold,#8A621C)}.ijg-help ul{margin:.3em 0 0;padding-left:1.2em}.ijg-help a{font-weight:700}'
    + '.ijg-fh{display:block;margin-top:4px;font-size:.95rem;color:var(--muted,#3B4740)}'
    + '@media print{.ijg-btn,.ijg-tip{display:none}}';
  D.head.appendChild(el('style', null, css));

  /* ---------- 使い方ボタン ---------- */
  var btn = el('button', { type: 'button', 'class': 'ijg-btn', 'aria-haspopup': 'dialog' }, '<i aria-hidden="true">？</i>使い方');
  D.body.appendChild(btn);
  btn.addEventListener('click', openPanel);

  // 初めての方へ、一度だけ小さなお知らせ
  function hint() {
    if (store('ij-guide-tip') || kind === 'kyoryoku') return;
    var op = $('#op'); if (op && !op.hidden && seen(op)) { setTimeout(hint, 3000); return; }
    var r = btn.getBoundingClientRect();
    var t = el('div', { 'class': 'ijg-tip', role: 'status' }, '使い方が分からないときは、この<b>「使い方」</b>を押してください。<button type="button" aria-label="閉じる">×</button>');
    t.style.bottom = (innerHeight - r.top + 10) + 'px';
    D.body.appendChild(t);
    function close() { t.remove(); store('ij-guide-tip', '1'); }
    t.querySelector('button').onclick = close; btn.addEventListener('click', close);
    setTimeout(function () { if (t.isConnected) t.remove(); }, 15000);
  }
  setTimeout(hint, 4000);

  /* ---------- 説明の画面 ---------- */
  var ov, panel, lastFocus;
  function closePanel() { if (ov) ov.remove(); if (panel) panel.remove(); ov = panel = null; if (lastFocus) lastFocus.focus(); }
  function openPanel() {
    lastFocus = D.activeElement; closePanel();
    var steps = G.s.filter(function (x) { return x[0](); });
    ov = el('div', { 'class': 'ijg-ov' }); ov.onclick = closePanel;
    var h = '<button type="button" class="ijg-x" aria-label="閉じる">×</button><h2>' + G.t + 'の使い方</h2>'
      + '<h3>このページでできること</h3>' + G.d.map(function (x) { return '<p>' + x + '</p>'; }).join('')
      + '<div class="ijg-acts">' + (steps.length ? '<button type="button" class="p" data-a="tour">画面で順番に案内する（' + steps.length + 'か所）</button>' : '')
      + (kind === 'kyoryoku' ? '' : '<button type="button" data-a="big">文字を大きくする</button>')
      + '<a href="' + TELL + '">お電話で聞く　' + TEL + '</a>'
      + (kind !== 'contact' && kind !== 'kyoryoku' && kind !== 'keiyaku' ? '<a href="' + ROOT + 'contact/index.html">相談内容をまとめる</a>' : '') + '</div>'
      + '<h3>操作のこつ</h3><ul><li>「開く」と書かれた見出しは、押すと中身が開きます。</li><li>前のページに戻るときは、画面の「戻る」を押してください。</li><li>分からないときは、受付時間（10:00〜19:00）にお電話ください。</li></ul>';
    panel = el('div', { 'class': 'ijg-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': G.t + 'の使い方' }, h);
    D.body.appendChild(ov); D.body.appendChild(panel);
    panel.querySelector('.ijg-x').onclick = closePanel;
    var tb = panel.querySelector('[data-a=tour]'); if (tb) tb.onclick = function () { closePanel(); tour(steps); };
    var bb = panel.querySelector('[data-a=big]'); if (bb) bb.onclick = function () { var b = $('.fs button[data-fs="l"]'); if (b) b.click(); else D.documentElement.setAttribute('data-fs', 'l'); bb.textContent = '文字を大きくしました（元に戻すときは、上の「標準」を押します）'; };
    (tb || panel.querySelector('.ijg-x')).focus();
  }
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (panel) closePanel(); if (tourEnd) tourEnd(); } });

  /* ---------- 画面の場所を順に光らせる案内 ---------- */
  var tourEnd = null;
  function tour(steps) {
    var i = 0, ring = el('div', { 'class': 'ijg-ring' }), bub = el('div', { 'class': 'ijg-bub', role: 'dialog', 'aria-live': 'polite' });
    D.body.appendChild(ring); D.body.appendChild(bub);
    function place() {
      var t = steps[i][0](); if (!t) return;
      var r = t.getBoundingClientRect(), pad = 6;
      ring.style.left = (r.left - pad) + 'px'; ring.style.top = (r.top - pad) + 'px'; ring.style.width = (r.width + pad * 2) + 'px'; ring.style.height = Math.min(r.height + pad * 2, innerHeight - 20) + 'px';
      var bh = bub.offsetHeight, below = r.bottom + 14, above = r.top - bh - 14;
      bub.style.left = Math.max(12, Math.min(r.left, innerWidth - bub.offsetWidth - 12)) + 'px';
      var top = below + bh < innerHeight - 8 ? below : above > 8 ? above : innerHeight - bh - 12;
      bub.style.top = Math.max(8, Math.min(top, innerHeight - bh - 8)) + 'px';
    }
    function show() {
      var t = steps[i][0](); var txt = steps[i][1]; if (typeof txt === 'function') txt = txt();
      bub.innerHTML = '<div class="n">' + (i + 1) + ' / ' + steps.length + '</div><div>' + txt + '</div><div class="b">'
        + (i > 0 ? '<button type="button" data-g="-1">戻る</button>' : '') + '<button type="button" data-g="x">終わる</button>'
        + '<button type="button" class="p" data-g="1">' + (i < steps.length - 1 ? '次へ' : 'おしまい') + '</button></div>';
      bub.querySelectorAll('button').forEach(function (b) { b.onclick = function () { var g = b.dataset.g; if (g === 'x' || (g === '1' && i === steps.length - 1)) return end(); i += +g; show(); }; });
      if (t) { var r = t.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight - 140) t.scrollIntoView({ block: 'center', behavior: 'instant' }); }
      place(); [150, 350, 700, 1100].forEach(function (ms) { setTimeout(place, ms); });
      bub.querySelector('.p').focus();
    }
    function end() { ring.remove(); bub.remove(); removeEventListener('resize', place); removeEventListener('scroll', place, true); tourEnd = null; btn.focus(); }
    tourEnd = end; addEventListener('resize', place); addEventListener('scroll', place, true); show();
  }

  /* ---------- 相談フォームの入力サポート ---------- */
  if (kind === 'contact' && $('#f')) {
    var STEP = [
      ['どの分野か選ぶ', '当てはまるものを押して、印を付けます。いくつ選んでも大丈夫です。迷ったら、一番近いものを1つ選べば十分です。'],
      ['くわしい内容を選ぶ', '前の画面で選んだ分野の中から、近いものに印を付けます。分からなければ「その他のご相談」を選んでください。'],
      ['お悩みを選ぶ', '近いものがあれば押してください。<b>なければ、何も選ばずに「次へ進む」で大丈夫です。</b>'],
      ['状況を入れる', '分かる範囲で構いません。<b>空欄のままでも進めます。</b>住まいの場所は、市区町村まで（例：大阪市生野区）で十分です。'],
      ['伝えておきたいことを書く', '書かなくても進めます。ご家族の事情や、急ぎのことがあれば、短くてもよいので書いてください。'],
      ['ご連絡先を入れる', '<b>お名前</b>と、<b>電話番号かメールアドレスのどちらか</b>が必要です。電話番号は「-」なしでも大丈夫です。最後に、同意の欄に印を付けてください。'],
      ['内容を確かめて送る', '内容を確かめて、<b>「この内容で送信する」</b>を押すと窓口に届きます。ご家族にも見てもらいたいときは、下の「メールで送る」「LINEで送る」が使えます。']
    ];
    var box = el('div', { 'class': 'ijg-help', 'aria-live': 'polite' });
    var form = $('#f'), sn = $('#stepnow'); form.insertBefore(box, sn ? sn.nextSibling : form.firstChild);
    function cur() { var s = $$('#f section[data-step]'); for (var k = 0; k < s.length; k++) if (!s[k].hidden) return +s[k].dataset.step; return 0; }
    function upd() {
      var n = cur(), x = STEP[n] || STEP[0], left = STEP.length - 1 - n;
      box.innerHTML = '<b class="h">いまやること：' + x[0] + '<span class="left">' + (left ? 'あと' + left + '段階' : '最後の段階です') + '</span></b>' + x[1]
        + '<br><small>分からないときは、お電話で話しながら入力することもできます（<a href="' + TELL + '">' + TEL + '</a>、10:00〜19:00）。</small>';
    }
    $$('#f section[data-step]').forEach(function (s) { new MutationObserver(upd).observe(s, { attributes: true, attributeFilter: ['hidden'] }); });
    upd();
    // 欄ごとの入力のこつ
    var tips = { nm: '例：山田 花子（ご相談される方のお名前）', tel: '例：09012345678（「-」なしで大丈夫です）', mail: '例：name@example.jp（お持ちでなければ空欄で構いません）', area: '例：大阪市生野区' };
    Object.keys(tips).forEach(function (id) { var f = $('#' + id); if (!f) return; if (!f.placeholder) f.placeholder = tips[id].replace(/（.*$/, ''); var p = el('small', { 'class': 'ijg-fh' }, tips[id]); f.parentNode.appendChild(p); });
    // 送信のあとの案内
    var msg = $('#copyMsg');
    if (msg) new MutationObserver(function () { if (/送信しました/.test(msg.textContent) && !$('.ijg-after')) { var a = el('div', { 'class': 'ijg-help ijg-after' }, '<b class="h">送信できました。このあとの流れ</b><ul><li>受付時間（10:00〜19:00）に、窓口の担当者からご連絡します。</li><li>知らない番号からの電話は出にくい方は、先に ' + TEL + ' を登録しておくと安心です。</li><li>お急ぎのときは、お電話（<a href="' + TELL + '">' + TEL + '</a>）でお知らせください。</li></ul>'); msg.parentNode.insertBefore(a, msg.nextSibling); } }).observe(msg, { childList: true, characterData: true, subtree: true });
  }
})();
