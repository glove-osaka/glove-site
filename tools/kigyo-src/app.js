(function(){
const D = SITE_DATA, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pages = $$('.page'), ids = new Set(pages.map(p => p.dataset.p));
const store = {get(k){try{return localStorage.getItem(k)}catch(e){return null}}, set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* 画面の切り替え：bsd.osaka では本当の住所（/services/subsidy/ など）、それ以外は「#」で切り替える */
const PM = !!window.KG_PATHS;
const P2 = {}; pages.forEach(p => { const id = p.dataset.p; P2[id] = id === 'top' ? '/' : id.startsWith('svc-') ? '/services/' + id.slice(4) + '/' : id.startsWith('sit-') ? '/situations/' + id.slice(4) + '/' : '/' + id + '/'; });
const R2 = {}; Object.keys(P2).forEach(k => R2[P2[k]] = k);
D.paths = P2;
function show(){
  let h = location.hash.slice(1), id = null, anchor = null;
  if (h === 'main') return;
  if (PM){
    if (h && ids.has(h)){ id = h; h = ''; history.replaceState(null, '', P2[id]); }
    else id = R2[location.pathname.replace(/index\.html$/, '')] || 'top';
    if (h){ const el = document.getElementById(h); const pg = el && el.closest('.page'); if (pg){ anchor = el; if (pg.dataset.p !== id){ id = pg.dataset.p; history.replaceState(null, '', P2[id] + '#' + h); } } }
  } else {
    id = h || 'top';
    if (!ids.has(id)){ const el = document.getElementById(id); const pg = el && el.closest('.page'); if (pg){ anchor = el; id = pg.dataset.p } else id = 'top' }
  }
  pages.forEach(p => p.hidden = p.dataset.p !== id);
  const cur = pages.find(p => p.dataset.p === id);
  document.title = cur.dataset.title;
  document.body.dataset.page = id;
  const sec = id.startsWith('svc-') || id === 'services' ? 'services' : id.startsWith('sit-') ? 'situations' : id;
  $$('.nav a').forEach(a => { const t = a.getAttribute('href') || ''; a.setAttribute('aria-current', (t === '#' + sec || t === P2[sec]) ? 'page' : 'false'); });
  if (anchor) requestAnimationFrame(() => anchor.scrollIntoView({block:'start'})); else window.scrollTo(0, 0);
  $('#gnav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); $('#dd').classList.remove('open');
}
addEventListener('hashchange', show); show();
if (PM){
  addEventListener('popstate', show);
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]'); if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const u = new URL(a.getAttribute('href'), location.href); if (u.origin !== location.origin) return;
    let id = null;
    if (u.hash && ids.has(u.hash.slice(1))) id = u.hash.slice(1);
    else if (!u.hash && R2[u.pathname]) id = R2[u.pathname];
    if (!id) return;
    e.preventDefault();
    if (location.pathname !== P2[id] || location.hash) history.pushState(null, '', P2[id]);
    show();
  });
}

/* メニュー・文字の大きさ */
$('#menuBtn').addEventListener('click', e => {const o = $('#gnav').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o)});
function setFs(v){document.documentElement.dataset.fs = v; $$('.fs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.fs === v)); store.set('fs', v)}
$$('.fs button').forEach(b => b.addEventListener('click', () => setFs(b.dataset.fs)));
setFs(store.get('fs') || '');

/* 見出しのボタンが見えている間は、下の相談の帯を出さない */
const heroBtns = document.querySelector('.hero .btns');
if (heroBtns && 'IntersectionObserver' in window){
  new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle('hero-on', e.isIntersecting))).observe(heroBtns);
}
/* スマホのメニュー：13分野の開閉 */
$('#ddTg').addEventListener('click', e => {const o = $('#dd').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); e.currentTarget.firstElementChild.textContent = o ? '閉じる' : '13分野を表示'});
/* 広い画面では、フッターと分野の一覧を開いておく */
const wide = matchMedia('(min-width:961px)');
function deskOpen(){ $$('details[data-desk-open]').forEach(d => d.open = wide.matches) }
(wide.addEventListener ? wide.addEventListener('change', deskOpen) : wide.addListener(deskOpen)); deskOpen();

/* 分野を選んだ状態で相談へ */
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-cat]'); if (!a) return;
  preselect([a.dataset.cat]);
});
function preselect(list){
  $$('input[name="c-cat"]').forEach(i => i.checked = list.includes(i.value));
  step = 1; render(); saveDraft();
}

/* 4つの質問 */
const dq = $$('.dq'), dNext = $('#dNext'), dBack = $('#dBack'), dres = $('#dres');
let q = 1;
const CATN = Object.fromEntries(D.cats.map(c => [c.id, c.name]));
const WHO = {subsidy:'窓口 → 提携行政書士（雇用関係助成金は社会保険労務士）',permits:'窓口 → 提携行政書士',experts:'窓口 → 各専門家',finance:'窓口（税理士・認定支援機関と連携）',cost:'窓口 → 提携事業者',hr:'窓口（労務・助成金は社会保険労務士）',ops:'窓口',sales:'窓口',newbiz:'窓口（商標・特許は弁理士）',global:'窓口 → 提携事業者・通関業者',succession:'窓口（税理士・司法書士と連携）',risk:'窓口 → 弁護士・行政書士',other:'窓口'};
const NEXT = {way:'解決の方法と、進める順番をご提案します',expert:'分野に合う専門家をご案内します',proc:'手続きを担当する専門家をご案内し、お見積りをお届けします',fee:'担当と費用の目安をお伝えします',talk:'まず窓口で、お話を整理します'};
function dval(n){const c = $(`input[name="d${n}"]:checked`); return c ? c.value : ''}
function dRender(){
  dq.forEach(f => f.hidden = +f.dataset.q !== q);
  dres.hidden = q !== 6;
  dBack.hidden = q === 1;
  dNext.hidden = q === 6;
  dNext.disabled = q <= 4 && !dval(q);
  dNext.textContent = q === 5 ? '結果を見る ›' : '次へ ›';
  if (q === 6){
    const cat = dval(1), pri = dval(2), prev = $('input[name="d3"]:checked').parentElement.textContent, want = dval(4);
    dres.innerHTML = `<p class="stepnow">整理の結果</p><h3>${CATN[cat]}</h3>
<dl><dt>担当の目安</dt><dd>${WHO[cat]}</dd><dt>急ぎ具合</dt><dd>${pri === '高' ? '急ぎ。最初に期限を確認します' : pri === '低' ? '計画的に。準備の順番から整理します' : '通常。状況をうかがって順番を決めます'}</dd><dt>これまでの相談</dt><dd>${prev}</dd><dt>次にすること</dt><dd>${NEXT[want]}</dd></dl>
<div class="btns"><a class="btn btn-p" href="#svc-${cat}">この分野を詳しく見る</a><a class="btn btn-g" href="#contact" id="dGo">この結果で相談をまとめる</a><button type="button" class="btn btn-o" id="dRe">最初からやり直す</button></div>`;
    $('#dGo').addEventListener('click', () => {preselect([cat]); const t = $('#d5').value.trim(); if (t) $('#cFree').value = t; $('#cWhen').value = pri === '高' ? '1か月以内' : pri === '低' ? '時期は決まっていない' : ''});
    $('#dRe').addEventListener('click', () => {$$('#diag input').forEach(i => i.checked = false); $('#d5').value = ''; q = 1; dRender()});
  }
}
$$('#diag input[type=radio]').forEach(i => i.addEventListener('change', () => {dNext.disabled = false}));
dNext.addEventListener('click', () => {if (q < 6){q++; dRender()}});
dBack.addEventListener('click', () => {if (q > 1){q--; dRender()}});
dRender();

/* 相談内容をまとめる */
const cs = $$('.cs'), cNext = $('#cNext'), cBack = $('#cBack'), err = $('#cErr');
let step = 1;
function selCats(){return $$('input[name="c-cat"]:checked').map(i => i.value)}
function buildItems(){
  const keep = new Set([...$$('input[name="c-item"]:checked').map(i => i.value), ...savedItems]); savedItems = new Set();
  const sel = selCats().filter(id => id !== 'partner');
  const box = $('#cItems');
  if (!sel.length){box.innerHTML = '<p class="hint">分野ごとの内容はありません。そのまま次へお進みください。</p>'; return}
  box.innerHTML = sel.map(id => {
    const c = D.cats.find(x => x.id === id);
    return `<div class="grp"><b>${c.name}</b><div class="opts">` + c.items.map((it, k) => {
      const v = c.name + '：' + it[1], iid = `ci-${id}-${k}`;
      return `<label><input type="checkbox" name="c-item" id="${iid}" value="${v.replace(/"/g,'&quot;')}"${keep.has(v) ? ' checked' : ''}><span>${it[1]}<small>担当：${D.tags[it[0]]}</small></span></label>`;
    }).join('') + '</div></div>';
  }).join('');
}
function catName(id){return id === 'partner' ? '提携のご相談' : CATN[id]}
function summary(){
  const rows = [
    ['分野', selCats().map(catName).join('、')],
    ['内容', $$('input[name="c-item"]:checked').map(i => i.value).join('\n')],
    ['時期', $('#cWhen').value], ['業種', $('#cInd').value], ['従業員数', $('#cSize').value], ['所在地', $('#cArea').value],
    ['自由記入', $('#cFree').value], ['会社名', $('#cCo').value], ['お名前', $('#cName').value], ['電話番号', $('#cTel').value],
    ['メール', $('#cMail').value], ['連絡方法・時間帯', $('#cHow').value],
    ['専門家への共有', $('#cAg2').checked ? '同意する' : 'あとで決める']];
  return rows.filter(r => r[1].trim());
}
function render(){
  cs.forEach(s => s.hidden = +s.dataset.s !== step);
  $$('#cSteps li').forEach((li, k) => {li.className = k + 1 === step ? 'on' : k + 1 < step ? 'done' : ''});
  cBack.hidden = step === 1; cNext.hidden = step === 6; err.hidden = true;
  if (step === 2) buildItems();
  if (step === 6){
    const r = summary();
    const sum = $('#cSum'); sum.innerHTML = '';
    r.forEach(([k, v]) => {const d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; d.append(dt, dd); sum.append(d)});
    $('#cOut').value = `【${D.site}】ご相談内容\n` + r.map(([k, v]) => `■${k}\n${v}`).join('\n');
    $('#cOut').hidden = true; $('#cCopied').textContent = '';
  }
}
function check(){
  if (step === 1 && !selCats().length) return '分野を一つ以上選んでください。分からないときは「その他の企業相談」を選んでください。';
  if (step === 5){
    if (!$('#cName').value.trim()) return 'お名前を入力してください。';
    if (!$('#cTel').value.trim() && !$('#cMail').value.trim()) return '電話番号かメールアドレスの、どちらかを入力してください。';
    const m = $('#cMail').value.trim(); if (m && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) return 'メールアドレスの形が正しくありません。「@」の前後をご確認ください。';
    if (!$('#cAg1').checked) return '個人情報の取り扱いへの同意にチェックを入れてください。';
  }
  return '';
}
cNext.addEventListener('click', () => {const m = check(); if (m){err.textContent = m; err.hidden = false; return} step++; render(); $('#cForm').scrollIntoView({block:'start'})});
cBack.addEventListener('click', () => {step--; render(); $('#cForm').scrollIntoView({block:'start'})});
$('#cForm').addEventListener('submit', e => e.preventDefault());
$('#cCopy').addEventListener('click', () => {
  const t = $('#cOut').value, msg = $('#cCopied');
  const fallback = () => {const o = $('#cOut'); o.hidden = false; o.focus(); o.select(); msg.textContent = 'コピーできなかったため、下に内容を表示しました。全体を選んでコピーしてください。'};
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(() => {msg.textContent = 'コピーしました。メールに貼り付けてお送りください。'}, fallback);
  } else fallback();
});
/* 送信（送信先が設定されているときだけ使う） */
if (D.formUrl){
  $('#cSendOn').hidden = false;
  $('#cSendMsg').textContent = '送信がうまくいかないときは、下の「内容を写し取る」でコピーし、メール（' + D.mail + '）でお送りください。';
}
$('#cSubmit').addEventListener('click', async () => {
  const btn = $('#cSubmit');
  if ($('#cHp').value) return;
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  const no = 'K' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const body = new URLSearchParams({no, text: $('#cOut').value, name: $('#cName').value, company: $('#cCo').value, tel: $('#cTel').value, mail: $('#cMail').value, cats: selCats().map(catName).join('、'), share: $('#cAg2').checked ? '同意' : 'あとで', ua: navigator.userAgent.slice(0, 120)});
  btn.disabled = true; btn.lastChild.textContent = '送信しています…';
  try{
    await fetch(D.formUrl, {method: 'POST', mode: 'no-cors', body});
    $('#cNo').textContent = no; $('#cDone').hidden = false; $('#cSendOn').hidden = true;
    try{ localStorage.removeItem('kigyo-draft') }catch(e){}
    $('#cRestored').hidden = true;
  }catch(e){
    btn.disabled = false; btn.lastChild.textContent = 'この内容で相談を送る';
    $('#cCopied').textContent = '送信できませんでした。通信の状態をご確認いただくか、「内容を写し取る」でコピーしてメールでお送りください。';
  }
});
/* 入力途中の内容を、この端末に一時保存する */
const DKEY = 'kigyo-draft';
const FIELDS = ['cWhen','cInd','cSize','cArea','cFree','cCo','cName','cTel','cMail','cHow'];
let savedItems = new Set();
function saveDraft(){
  const d = {cats: selCats(), items: [...new Set([...$$('input[name="c-item"]:checked').map(i => i.value), ...savedItems])], ag2: $('#cAg2').checked};
  if ($$('input[name="c-item"]').length) d.items = $$('input[name="c-item"]:checked').map(i => i.value);
  FIELDS.forEach(id => d[id] = $('#' + id).value);
  try{ localStorage.setItem(DKEY, JSON.stringify(d)) }catch(e){}
}
function loadDraft(){
  let d = null; try{ d = JSON.parse(localStorage.getItem(DKEY) || 'null') }catch(e){}
  if (!d) return;
  $$('input[name="c-cat"]').forEach(i => i.checked = (d.cats || []).includes(i.value));
  FIELDS.forEach(id => { if (d[id] != null) $('#' + id).value = d[id] });
  $('#cAg2').checked = !!d.ag2;
  savedItems = new Set(d.items || []);
  if (FIELDS.some(id => d[id]) || (d.cats || []).length) $('#cRestored').hidden = false;
}
$('#cForm').addEventListener('input', saveDraft); $('#cForm').addEventListener('change', saveDraft);
$('#cClear').addEventListener('click', () => {
  try{ localStorage.removeItem(DKEY) }catch(e){}
  $('#cForm').reset(); savedItems = new Set(); $('#cItems').innerHTML = ''; $('#cRestored').hidden = true; step = 1; render();
});
loadDraft();
render();
})();
