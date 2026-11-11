/* 来店予約の案内（買取大吉 大阪勝山南店へのご紹介）
   家じまい相談窓口・医療介護総合支援会・企業支援 総合相談窓口の各ページに読み込む。
   ・ページ下（フッターの直前）に「店頭で無料査定」の案内帯を出す（トップページはヒーローの直後にも出す）
   ・スマホの下部の帯に「来店予約」ボタンを足す
   ・予約先は勝山南店の来店予約フォーム（紹介元つき）。紹介元は店の台帳・通知メール・管理画面に記録される */
(function () {
  'use strict';
  var STORE = 'https://kaitori-osaka.github.io/';
  var P = location.pathname;
  var SITES = [
    { m: '/glove-site/iejimai/', ref: 'iejimai', name: '家じまい相談窓口',
      h: 'お片付けの前に、店頭で無料査定', lead: '整理する品物の中に、値段がつく物が混ざっていることがあります。処分を決める前に、運営会社の買取店でお値段を確かめてください。',
      c: { bg: '#0F2B23', ink: '#FFFFFF', sub: '#D9E4DE', btn: '#E2B868', btnInk: '#0C1A15', line: 'rgba(255,255,255,.22)' } },
    { m: '/glove-site/medical/', ref: 'medical', name: '医療介護総合支援会',
      h: 'ご自宅の不用品・遺品は、店頭で無料査定', lead: '施設への入居やお引越し、遺品の整理で出てきた品物も、お持ちいただければその場で査定します。',
      c: { bg: '#0A2E33', ink: '#FFFFFF', sub: '#D5E3E5', btn: '#E2B868', btnInk: '#0C1A15', line: 'rgba(255,255,255,.22)' } },
    { m: '/glove-site/kigyo/', ref: 'kigyo', name: '企業支援 総合相談窓口',
      h: '事業の整理で出る品物は、店頭で無料査定', lead: '廃業・事業承継・事務所移転などで出る備品や在庫、記念品もご相談ください。お持ちいただければその場で査定します。',
      c: { bg: '#0D1A33', ink: '#FFFFFF', sub: '#D6DEEC', btn: '#E8C26A', btnInk: '#0D1A33', line: 'rgba(255,255,255,.22)' } }
  ];
  var S = null;
  for (var i = 0; i < SITES.length; i++) if (P.indexOf(SITES[i].m) === 0) S = SITES[i];
  if (!S) return;
  // 申込・管理・契約などのページには出さない
  if (/\/(kanri|keiyaku|kyoryoku|member|contact|soudan|status)\//.test(P) || /404\.html$/.test(P)) return;

  var BOOK = STORE + 'apply.html?t=shop&ref=' + S.ref;
  var MAP = STORE + 'store.html';
  var c = S.c;

  var css = ''
    + '.rt-band{background:' + c.bg + ';color:' + c.ink + ';padding:44px 0;font-size:1.05rem;line-height:1.8}'
    + '.rt-band *{box-sizing:border-box}'
    + '.rt-in{max-width:1080px;margin:0 auto;padding:0 20px;display:grid;grid-template-columns:1.25fr 1fr;gap:28px;align-items:center}'
    + '.rt-badge{display:inline-block;border:1px solid ' + c.btn + ';color:' + c.btn + ';border-radius:999px;padding:2px 14px;font-size:.9rem;font-weight:700;margin:0 0 10px}'
    + '.rt-band h2{margin:0 0 10px;font-size:clamp(1.35rem,3.6vw,1.9rem);line-height:1.4;color:' + c.ink + '}'
    + '.rt-band p{margin:0 0 14px;color:' + c.sub + '}'
    + '.rt-perks{list-style:none;margin:0;padding:0;display:grid;gap:8px}'
    + '.rt-perks li{display:flex;gap:10px;align-items:baseline;color:' + c.ink + '}'
    + '.rt-perks li:before{content:"";flex:none;width:10px;height:10px;border-radius:50%;background:' + c.btn + ';transform:translateY(-1px)}'
    + '.rt-perks small{color:' + c.sub + ';font-size:.85rem}'
    + '.rt-box{border:1px solid ' + c.line + ';border-radius:14px;padding:22px;background:rgba(255,255,255,.04)}'
    + '.rt-store{margin:0 0 14px;font-size:.98rem;color:' + c.sub + '}'
    + '.rt-store b{display:block;color:' + c.ink + ';font-size:1.08rem}'
    + '.rt-btn{display:flex;align-items:center;justify-content:center;min-height:58px;border-radius:10px;font-weight:700;font-size:1.12rem;text-decoration:none;text-align:center;line-height:1.35;padding:8px 14px}'
    + '.rt-btn.p{flex-direction:column;background:' + c.btn + ';color:' + c.btnInk + '}'
    + '.rt-btn.p small{display:block;font-size:.8rem;font-weight:700;opacity:.85}'
    + '.rt-btn.g{border:1px solid ' + c.line + ';color:' + c.ink + ';min-height:50px;font-size:1rem;margin-top:10px}'
    + '.rt-tel{display:block;text-align:center;margin-top:12px;color:' + c.ink + ';font-weight:700;text-decoration:none}'
    + '.rt-tel small{display:block;color:' + c.sub + ';font-weight:400;font-size:.82rem}'
    + '.rt-btn:focus-visible,.rt-tel:focus-visible{outline:3px solid ' + c.btn + ';outline-offset:3px}'
    + '@media (max-width:820px){.rt-in{grid-template-columns:1fr}.rt-band{padding:34px 0}}'
    // スマホ下部の帯：電話（相談）と来店予約を左右に並べる
    + '.rt-fab{display:none;position:fixed;right:0;bottom:0;z-index:41;width:34%;min-height:62px;align-items:center;justify-content:center;flex-direction:column;'
    + 'background:' + c.btn + ';color:' + c.btnInk + ';font-weight:700;font-size:1.05rem;line-height:1.2;text-decoration:none;padding:0 6px env(safe-area-inset-bottom,0px)}'
    + '.rt-fab small{font-size:.72rem;font-weight:700}'
    + '.rt-fab.on{display:flex}'
    + '.telbar.rt-split{right:34%!important;font-size:.95rem!important;gap:4px!important;padding-left:8px!important;padding-right:8px!important;text-align:center;line-height:1.25}'
    + '.telbar.rt-split svg{display:none!important}'
    + '.mbar.rt-3{grid-template-columns:1.5fr 1fr 1fr!important;gap:6px!important}'
    + '.mbar.rt-3 a{font-size:.82rem!important;line-height:1.25!important;padding:0 4px!important;gap:4px!important}'
    + '.mbar.rt-3 .ic{display:none!important}'
    + '.mbar a.rt-mb{background:' + c.btn + '!important;color:' + c.btnInk + '!important;border:0!important}'
    + '@media print{.rt-band,.rt-fab{display:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function band(id) {
    var s = document.createElement('section');
    s.className = 'rt-band'; s.id = id; s.setAttribute('aria-label', '店頭での無料査定のご案内');
    s.innerHTML = '<div class="rt-in"><div>'
      + '<p class="rt-badge">' + S.name + 'をご覧の方へ</p>'
      + '<h2>' + S.h + '</h2>'
      + '<p>' + S.lead + '</p>'
      + '<ul class="rt-perks">'
      + '<li><span>査定は無料。金額にご納得いただけなければ、お売りにならなくても大丈夫です</span></li>'
      + '<li><span>ご紹介のお客様として、通常の査定額に<b>30%上乗せ</b>して買い取ります<br><small>（貴金属・商品券は上乗せの対象外です）</small></span></li>'
      + '<li><span>ご予約は、ご希望の日にちと時間帯を選ぶだけです</span></li>'
      + '</ul></div>'
      + '<div class="rt-box">'
      + '<p class="rt-store"><b>買取大吉 大阪勝山南店</b>大阪市生野区勝山南2-2-7<br>JR「桃谷駅」から徒歩13分<br>10:00〜19:00　年中無休</p>'
      + '<a class="rt-btn p" href="' + BOOK + '" data-rt="band">来店を予約する<small>ご希望の日時を選べます</small></a>'
      + '<a class="rt-btn g" href="' + MAP + '" data-rt="map">店舗の地図・アクセスを見る</a>'
      + '<a class="rt-tel" href="tel:0120933496" data-rt="tel">お電話でも予約できます　0120-933-496<small>通話無料・10:00〜19:00</small></a>'
      + '</div></div>';
    return s;
  }

  function init() {
    // 1) ページ下の案内帯（フッターの直前）
    var ft = document.querySelector('footer.ft') || document.querySelector('footer');
    if (ft && !document.getElementById('rt-band')) ft.parentNode.insertBefore(band('rt-band'), ft);
    // 2) トップページはヒーローの直後にも出す（家じまい・支援会）
    var top = /\/(iejimai|medical)\/(index\.html)?$/.test(P);
    //    ヒーロー下の「特長カード」はヒーローに重ねて表示しているので、その後ろに入れる
    var hero = top && (document.querySelector('main > .trust') || document.querySelector('main > section'));
    if (hero && !document.getElementById('rt-band-top')) hero.parentNode.insertBefore(band('rt-band-top'), hero.nextSibling);

    // 3) スマホ下部の帯
    var mbar = document.getElementById('mbar');              // 企業支援（3つ並び）
    if (mbar && !mbar.querySelector('.rt-mb')) {
      var a = document.createElement('a');
      a.className = 'rt-mb'; a.href = BOOK; a.setAttribute('data-rt', 'bar'); a.textContent = '来店予約';
      mbar.appendChild(a); mbar.classList.add('rt-3');
    }
    var tb = document.querySelector('a.telbar');            // 家じまい・支援会（左右に並べる）
    if (tb) {
      var f = document.createElement('a');
      f.className = 'rt-fab'; f.href = BOOK; f.setAttribute('data-rt', 'bar');
      f.innerHTML = '来店予約<small>無料査定</small>';
      document.body.appendChild(f);
      // 幅が狭くなるので、文言を2行に分ける（例「お電話で相談する　0120-…」→ 1行目 お電話で相談する／2行目 番号）
      var orig = tb.innerHTML, txt = tb.textContent.replace(/\s+$/, '').replace(/^\s+/, ''), m2 = txt.match(/^(.+?)[\s　]+(0120[-\d]+)$/) || txt.match(/^(.+?)（(.+)）$/);
      var short = m2 ? '<span>' + m2[1] + '<br><small style="font-size:.85em">' + m2[2] + '</small></span>' : orig;
      var sync = function () {
        var on = getComputedStyle(tb).display !== 'none';
        f.classList.toggle('on', on); tb.classList.toggle('rt-split', on);
        tb.innerHTML = on ? short : orig;
      };
      sync(); addEventListener('resize', sync);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
