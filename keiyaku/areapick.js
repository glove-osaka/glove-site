/* 対応地域の選択：1回押すと「対応（✓）」、2回で「除外（✕）」、3回で元に戻る。自由記入も一緒に保存する。
   保存する文字の形：「対応：関西地区、東京都 ／ 除外：和歌山県 ／ その他：離島は相談」 */
(function () {
  var REG = [
    ['北海道', ['北海道']],
    ['東北地区', ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県']],
    ['関東地区', ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県']],
    ['北陸・甲信越地区', ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県']],
    ['東海地区', ['岐阜県', '静岡県', '愛知県', '三重県']],
    ['関西地区', ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県']],
    ['中国地区', ['鳥取県', '島根県', '岡山県', '広島県', '山口県']],
    ['四国地区', ['徳島県', '香川県', '愛媛県', '高知県']],
    ['九州・沖縄地区', ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']]
  ];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function parse(v) {
    v = String(v || ''); var on = [], ex = [], memo = '';
    var m1 = v.match(/対応：([^／]*)/), m2 = v.match(/除外：([^／]*)/), m3 = v.match(/その他：(.*)$/);
    if (m1 || m2 || m3) {
      if (m1) on = m1[1].split('、').map(function (x) { return x.trim(); }).filter(String);
      if (m2) ex = m2[1].split('、').map(function (x) { return x.trim(); }).filter(String);
      if (m3) memo = m3[1].trim();
    } else memo = v.trim();
    return { on: on, ex: ex, memo: memo };
  }
  function chip(name, st, label) {
    return '<button type="button" class="ap-chip' + (st ? ' ap-' + st : '') + '" data-ap="' + esc(name) + '"' + (label ? ' data-lb="' + esc(label) + '"' : '') + ' aria-pressed="' + (st === 'on' ? 'true' : st === 'ex' ? 'mixed' : 'false') + '">' +
      '<span class="ap-mark" aria-hidden="true">' + (st === 'on' ? '✓' : st === 'ex' ? '✕' : '') + '</span>' + esc(label || name) + (st === 'ex' ? '<small>（除外）</small>' : '') + '</button>';
  }
  function cities(pf, st) { return (window.AreaCities[pf] || []).map(function (x) { return chip(pf + x, st(pf + x), x); }).join(''); }
  function render(box, value) {
    var p = parse(value), st = function (n) { return p.on.indexOf(n) >= 0 ? 'on' : p.ex.indexOf(n) >= 0 ? 'ex' : ''; };
    var h = '<p class="hint ap-help">1回押すと <b class="ap-k on">✓ 対応</b>、もう1回で <b class="ap-k ex">✕ 除外</b>、さらに押すと元に戻ります。</p>';
    h += '<div class="ap-row">' + chip('全国', st('全国')) + '</div>';
    h += '<div class="ap-row">' + REG.map(function (r) { return chip(r[0], st(r[0])); }).join('') + '</div>';
    var C = window.AreaCities || null, any = function (pf) { return C && C[pf] ? C[pf].some(function (x) { return st(pf + x); }) : false; };
    h += '<details class="ap-pref"' + (REG.some(function (r) { return r[1].some(function (x) { return st(x) || any(x); }); }) ? ' open' : '') + '><summary>都道府県ごとに選ぶ（中分類）</summary>' +
      REG.map(function (r) { return '<div class="ap-grp"><b>' + esc(r[0]) + '</b><div class="ap-row">' + r[1].map(function (x) { return chip(x, st(x)); }).join('') + '</div>' +
        (C ? r[1].map(function (x) { return '<details class="ap-city" data-pf="' + esc(x) + '"' + (any(x) ? ' open' : '') + '><summary>' + esc(x) + 'の市区町村を選ぶ（小分類）</summary><div class="ap-row ap-cities">' + (any(x) ? cities(x, st) : '') + '</div></details>'; }).join('') : '') + '</div>'; }).join('') + '</details>';
    h += '<input type="text" class="ap-memo" placeholder="自由記入（例：大阪市内は当日対応、離島は相談）" value="' + esc(p.memo) + '">';
    h += '<p class="ap-sum hint" aria-live="polite"></p>';
    box.innerHTML = h; box.classList.add('ap');
    box.onclick = function (e) {
      var b = e.target.closest('[data-ap]'); if (!b) return;
      var cur = b.classList.contains('ap-on') ? 'on' : b.classList.contains('ap-ex') ? 'ex' : '', next = cur === '' ? 'on' : cur === 'on' ? 'ex' : '';
      b.outerHTML = chip(b.dataset.ap, next, b.dataset.lb || ''); sum(box);
      var nb = box.querySelector('[data-ap="' + b.dataset.ap.replace(/"/g, '\\"') + '"]'); if (nb) nb.focus();
    };
    box.querySelectorAll('.ap-city').forEach(function (d) { d.addEventListener('toggle', function () { var r = d.querySelector('.ap-cities'); if (d.open && !r.children.length) { var l = lists(box), st2 = function (n) { return l.on.indexOf(n) >= 0 ? 'on' : l.ex.indexOf(n) >= 0 ? 'ex' : ''; }; r.innerHTML = cities(d.dataset.pf, st2); } }); });
    sum(box);
  }
  function lists(box) {
    var on = [], ex = [];
    box.querySelectorAll('[data-ap]').forEach(function (b) { if (b.classList.contains('ap-on')) on.push(b.dataset.ap); else if (b.classList.contains('ap-ex')) ex.push(b.dataset.ap); });
    return { on: on, ex: ex, memo: (box.querySelector('.ap-memo') || {}).value || '' };
  }
  function sum(box) {
    var l = lists(box), s = box.querySelector('.ap-sum'); if (!s) return;
    s.textContent = (l.on.length ? '対応：' + l.on.join('、') : '対応：まだ選んでいません') + (l.ex.length ? '　／　除外：' + l.ex.join('、') : '');
  }
  function value(box) {
    var l = lists(box), parts = [];
    if (l.on.length) parts.push('対応：' + l.on.join('、'));
    if (l.ex.length) parts.push('除外：' + l.ex.join('、'));
    if (l.memo.trim()) parts.push('その他：' + l.memo.trim().replace(/／/g, '/'));
    return parts.join(' ／ ');
  }
  window.AreaPick = { render: render, value: value, parse: parse };
})();
