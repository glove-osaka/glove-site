
/* ===== 相談アシスト：困りごとを入れると、合う分野・場面・よくある質問・相談の入口を案内する ===== */
const AKW = {
  subsidy: ['補助金', '助成金', '給付金', '公募', '採択', '設備投資', 'IT導入', 'ものづくり', '持続化', '省力化', '事業再構築', '支援制度', '公的支援', '実績報告'],
  permits: ['許可', '許認可', '免許', '届出', '建設業', '産廃', '産業廃棄物', '古物', '飲食店', '運送', '宅建', '更新', '経審', '入札', '役所', '申請'],
  experts: ['士業', '専門家', '行政書士', '税理士', '社労士', '社会保険労務士', '司法書士', '弁護士', '診断士', '弁理士', '誰に相談', 'どこに相談'],
  finance: ['資金', '融資', '借入', '資金繰り', '銀行', 'キャッシュ', '返済', 'リスケ', '資金調達', '出資', '運転資金', '日本政策金融公庫'],
  cost: ['経費', 'コスト', '電気', 'ガス代', '光熱費', '固定費', '電気代', '通信費', '家賃', '保険料', 'リース', '削減', '見直し', '値上がり'],
  hr: ['採用', '人手不足', '人が採れない', '採れない', '人が足りない', '辞める', '離職', '従業員', 'スタッフ', '求人', '人材', '労務', '就業規則', '残業', '社会保険', '雇用', '退職', '定着', '外国人', '給与', '評価制度'],
  ops: ['業務改善', '効率化', 'AI', 'システム', 'IT', 'DX', 'デジタル', '自動化', 'ペーパーレス', '在庫', '勤怠', 'クラウド', '手作業'],
  sales: ['集客', '売上', '営業', '販路', 'ホームページ', 'SNS', '広告', '顧客', '新規客', '問い合わせが少ない', 'ネット販売', 'EC'],
  newbiz: ['新規事業', '新しい事業', '商品開発', '新商品', '特許', '商標', '知的財産', 'ブランド', '試作', '起業', '創業', '事業計画'],
  global: ['在留資格', 'ビザ', '海外', '輸出', '輸入', '貿易', '越境', '外国', '展示会', '通関', 'インバウンド'],
  succession: ['事業承継', '後継者', '引退', '廃業', 'M&A', '売却', '相続', '株式', '世代交代', '会社の将来', '事業譲渡'],
  risk: ['トラブル', 'クレーム', '契約', '未払い', '債権', '訴訟', '災害', 'BCP', '事業継続', 'リスク', '情報漏えい', 'ハラスメント', '取引先']
};
const AEX = ['建設業の許可を取りたい', '設備を入れたいので補助金を使いたい', '人が採れない・すぐ辞める', '資金繰りが苦しい', '電気代や固定費を下げたい', '後継者がいない'];
const AFAQ = D.faq || [], ASIT = D.sits || [];
function aScore(text){
  const t = String(text || '').trim(); if (!t) return [];
  return D.cats.filter(c => c.id !== 'other').map(c => {
    const hit = (AKW[c.id] || []).filter(w => t.includes(w));
    const nameHit = c.name.split(/[・、]/).filter(w => w.length >= 2 && t.includes(w));
    return {c, hit: [...new Set(hit.concat(nameHit))], s: hit.length * 2 + nameHit.length * 3};
  }).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3);
}
function aFaq(text, cats){
  const t = String(text || ''); const ws = Object.values(AKW).flat().filter(w => t.includes(w));
  return AFAQ.map(([q, a]) => ({q, a, s: ws.filter(w => (q + a).includes(w)).length + (/費用|料金|無料/.test(t) && /費用|無料|料金/.test(q) ? 2 : 0) + (/遠い|遠方|Zoom|オンライン/.test(t) && /Zoom|全国|地域/.test(q + a) ? 2 : 0)}))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3);
}
function aSits(cats){ const ids = cats.map(x => x.c.id); return ASIT.map(s => ({s, n: s.cats.filter(c => ids.includes(c)).length})).filter(x => x.n).sort((a, b) => b.n - a.n).slice(0, 2).map(x => x.s); }
const AE = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ast = document.createElement('div');
ast.innerHTML = `<button type="button" class="as-fab" id="asFab" aria-haspopup="dialog" aria-controls="asPanel"><span aria-hidden="true">🧭</span>相談アシスト</button>
<div class="as-panel" id="asPanel" role="dialog" aria-modal="false" aria-labelledby="asTtl" hidden>
  <div class="as-head"><b id="asTtl">相談アシスト</b><button type="button" class="as-x" id="asX" aria-label="閉じる">✕</button></div>
  <div class="as-body">
    <label for="asIn" class="as-lead">お困りごとを、ひとことで入れてください。合いそうな分野と、相談の進め方をご案内します。</label>
    <textarea id="asIn" rows="2" placeholder="例：建設業の許可を取りたい"></textarea>
    <div class="as-ex">${AEX.map(x => `<button type="button" data-ex="${AE(x)}">${AE(x)}</button>`).join('')}</div>
    <div id="asOut" aria-live="polite"></div>
    <div class="as-foot">お電話でもご相談いただけます（平日10:00〜18:00）　<a href="tel:${AE((D.tel || '').replace(/[^\d]/g, ''))}">${AE(D.tel || '')}</a><br>入力した内容は、この画面の中だけで使い、送信はしません。</div>
  </div>
</div>`;
document.body.appendChild(ast);
const asP = $('#asPanel'), asIn = $('#asIn'), asOut = $('#asOut'), asFab = $('#asFab');
function asOpen(on){ asP.hidden = !on; asFab.setAttribute('aria-expanded', on); document.body.classList.toggle('as-on', on); if (on) setTimeout(() => asIn.focus(), 30); }
asFab.addEventListener('click', () => asOpen(asP.hidden));
$('#asX').addEventListener('click', () => { asOpen(false); asFab.focus(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !asP.hidden) { asOpen(false); asFab.focus(); } });
$$('[data-ex]', asP).forEach(b => b.addEventListener('click', () => { asIn.value = b.dataset.ex; asRun(); }));
let asT; asIn.addEventListener('input', () => { clearTimeout(asT); asT = setTimeout(asRun, 250); });
function asRun(){
  const t = asIn.value.trim();
  if (!t){ asOut.innerHTML = ''; return; }
  const cats = aScore(t), faq = aFaq(t, cats), sits = aSits(cats);
  const pick = cats.length ? cats : [{c: D.cats.find(c => c.id === 'other'), hit: []}];
  asOut.innerHTML = `<div class="as-sec"><b>${cats.length ? '合いそうな分野' : '当てはまる分野が見つかりませんでした'}</b>
    ${cats.length ? '' : '<p class="as-note">「その他の企業相談」としてお受けできます。4つの質問で整理することもできます。</p>'}
    <ul class="as-cats">${pick.map((x, i) => `<li><a href="#svc-${x.c.id}"><span class="as-n">${i + 1}</span><span><b>${AE(x.c.name)}</b>${x.c.lead ? `<small>${AE(x.c.lead)}</small>` : ''}${x.hit.length ? `<small class="as-why">「${AE(x.hit.slice(0, 3).join('」「'))}」から</small>` : ''}</span><span aria-hidden="true">›</span></a></li>`).join('')}</ul></div>
    ${sits.length ? `<div class="as-sec"><b>近い相談場面</b><ul class="as-links">${sits.map(s => `<li><a href="#${s.id}">${AE(s.name)}</a></li>`).join('')}</ul></div>` : ''}
    ${faq.length ? `<div class="as-sec"><b>関係しそうな質問</b>${faq.map(f => `<details class="as-faq"><summary>${AE(f.q)}</summary><p>${AE(f.a)}</p></details>`).join('')}</div>` : ''}
    ${pick.some(x => ['subsidy', 'finance'].includes(x.c.id)) || /補助金|助成金/.test(t) ? `<div class="as-sec"><b>使える補助金・助成金を調べる</b><p class="as-note">会社の情報を入れると、対象となる可能性を理由付きで判定します（無料）。</p><a class="btn btn-o" href="/hojokin/">公的支援マッチで調べる</a></div>` : ''}
    <div class="as-go"><button type="button" class="btn btn-g" id="asGo">この内容で相談をまとめる</button><a class="btn btn-o" href="#diagnosis">4つの質問で整理する</a><a class="btn btn-o" href="tel:${AE((D.tel || '').replace(/[^\d]/g, ''))}">電話で相談する</a></div>`;
  $('#asGo').addEventListener('click', () => {
    preselect(pick.map(x => x.c.id));
    const f = $('#cFree'); if (f && !f.value.includes(t)) { f.value = (f.value ? f.value + '\n' : '') + t; saveDraft(); }
    asOpen(false); location.hash = '#contact';
  });
  $$('a[href^="#"],a[href^="/"]', asOut).forEach(a => a.addEventListener('click', () => { if (matchMedia('(max-width:900px)').matches) asOpen(false); }));
}
