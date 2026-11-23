// 連携する業種の一覧を、提携分野の決まり（keiyaku/bunrui.js）から作り、各サービスのページへ書き込む
// 使い方：node tools/gyoshu.js （サイトのいちばん上のフォルダで）
const fs=require('fs'),path=require('path');
global.window={};require(path.resolve('keiyaku/bunrui.js'));
const D=window.Bunrui.data.filter(b=>['協力企業','士業'].includes(b[1]));
const SLUG={'家財整理・不用品買取':'kazai','退去・住まいの整理':'taikyo','遺品整理':'ihin','生前整理':'seizen','将来への備え':'sonae','空き家管理':'akiya','引越し・施設入居':'hikkoshi','終活・生活支援':'shukatsu','不動産の売却・活用':'fudosan','次の住まい探し':'sagashi','自宅を活かした資金づくり':'jitaku','修繕・建替え・解体':'shuzen','身元保証・身元引受':'mihoshou','見守り・緊急連絡先代行':'mimamori','死後事務の手配':'shigo','毎月の支出の見直し':'shishutsu','相続・遺言':'souzoku','各種手続き':'tetsuzuki'};
const NAME=Object.fromEntries(Object.entries(SLUG).map(([n,s])=>[s,n]));
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const A='<!--gyoshu:start-->',Z='<!--gyoshu:end-->';
function put(file,html,before){let s=fs.readFileSync(file,'utf8');const i=s.indexOf(A),j=s.indexOf(Z);
  if(i>=0&&j>i)s=s.slice(0,i)+A+html+Z+s.slice(j+Z.length);
  else{const d=s.indexOf('<div class="detail"><main>');const k=d>=0?s.indexOf(before,d):s.lastIndexOf(before);if(k<0)throw new Error('置き場所がない '+file);s=s.slice(0,k)+A+html+Z+s.slice(k)}
  fs.writeFileSync(file,s)}
const CSS='<style>.gs{margin:0 0 3em}.gs h2{font-size:1.45rem;border-left:6px solid var(--pine);padding-left:14px;margin:0 0 .8em;line-height:1.5}.gs-g{display:grid;gap:14px;margin:1em 0}.gs-g>div{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 18px}.gs-g b{display:block;color:var(--pine);margin-bottom:8px}.gs-c{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}.gs-c li{background:var(--pine-soft);border-radius:99px;padding:4px 14px;font-size:.98rem;line-height:1.6;word-break:keep-all;text-align:start}.gs .more{color:var(--pine);font-weight:700}.gs-g .fine{margin-top:12px}</style>';
// サービスごとの業種
const per={};
for(const [big,kind,mids] of D)for(const [mid,smalls] of mids)for(const [sm,fields] of smalls)for(const f of fields){const s=SLUG[f];if(!s)continue;(per[s]=per[s]||{});const key=(kind==='士業'?'専門家：':'')+mid;(per[s][key]=per[s][key]||[]).push(sm)}
let n=0;
for(const [slug,groups] of Object.entries(per)){
  const file=`services/${slug}.html`;if(!fs.existsSync(file))continue;
  const body=Object.entries(groups).map(([g,items])=>`<div><b>${esc(g)}</b><ul class="gs-c">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
  const html=`${CSS}<section class="gs" id="gyoshu"><h2>この分野でお手伝いする業種</h2><p>「${esc(NAME[slug])}」のご相談では、内容に合わせて、次のような業種の提携先や専門家へおつなぎします。窓口が見積りの比較や日程の調整をまとめて行うため、それぞれに連絡する必要はありません。提携先は順次広げています。</p><div class="gs-g">${body}</div><p><a class="more" href="../renkei/index.html">連携する業種の一覧を見る</a></p></section>`;
  put(file,html,'</main>');n++;
}
// 一覧に載らないサービスのページは、一覧への案内だけ
for(const slug of ['gyosha','kazoku','sonota']){const file=`services/${slug}.html`;if(!fs.existsSync(file))continue;
  put(file,`${CSS}<section class="gs" id="gyoshu"><h2>連携する業種</h2><p>家じまい123は、片付け・引越し・不動産・工事・シニアライフサポート・葬儀や供養・暮らしの費用の事業者と、弁護士・司法書士・税理士・行政書士などの専門家と連携しています。ご相談の内容に合わせて、窓口がおつなぎします。</p><p><a class="more" href="../renkei/index.html">連携する業種の一覧を見る</a></p></section>`,'</main>');n++}
// 全体の一覧ページ
const tpl=fs.readFileSync('faq/index.html','utf8');
let total=0;const secs=D.map(([big,kind,mids])=>{const head=kind==='士業'?'専門家（士業など）':'作業・サービスの事業者';
  return `<section class="gs"><h2>${head}</h2><div class="gs-g">`+mids.map(([mid,smalls])=>{total+=smalls.length;
   const rel=[...new Set(smalls.flatMap(s=>s[1]).filter(f=>SLUG[f]))];
   return `<div><b>${esc(mid)}</b><ul class="gs-c">${smalls.map(s=>`<li>${esc(s[0])}</li>`).join('')}</ul><p class="fine">関係するご相談：${rel.map(f=>`<a href="../services/${SLUG[f]}.html">${esc(f)}</a>`).join('、')}</p></div>`}).join('')+'</div></section>'}).join('');
const title='連携する専門家・事業者の業種一覧｜家じまい123（家じまい相談窓口）';
const desc='家じまい123が連携する専門家・事業者の業種の一覧です。片付け・遺品整理・引越し・不動産・工事・身元保証・葬儀や供養・暮らしの費用の事業者と、弁護士・司法書士・税理士・行政書士などの専門家へ、ご相談の内容に合わせて窓口がおつなぎします。';
let s=tpl.replace(/<title>[^<]*<\/title>/,`<title>${title}</title>`).replace(/https:\/\/iejimai123\.jp\/faq\//g,'https://iejimai123.jp/renkei/');
for(const p of ['og:title','twitter:title'])s=s.replace(new RegExp(`(<meta (?:property|name)="${p}" content=")[^"]*`),`$1${title}`);
for(const p of ['description','og:description','twitter:description'])s=s.replace(new RegExp(`(<meta (?:property|name)="${p}" content=")[^"]*`),`$1${desc}`);
s=s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g,'');
s=s.replace('</head>',`<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"トップ","item":"https://iejimai123.jp/"},{"@type":"ListItem","position":2,"name":"連携する業種の一覧","item":"https://iejimai123.jp/renkei/"}]})}</script>\n${CSS}</head>`);
const a=s.indexOf('<main id="main">'),b=s.indexOf('</main>')+7;const old=s.slice(a,b);
const emb=(old.match(/<span class="emb lg">[\s\S]*?<\/span>/)||[''])[0];
const main=`<main id="main"><section class="ph"><img class="bg" src="../assets/head-1.jpg" alt=""><div class="wrap">${emb}<div><nav aria-label="現在地"><ol class="crumbs"><li><a href="../index.html">トップ</a></li><li aria-current="page">連携する業種の一覧</li></ol></nav><h1>連携する専門家・事業者の業種</h1><p>家じまい123は、ひとつの窓口でご相談を受け、内容に合わせて次のような業種の提携先や専門家へおつなぎします。</p></div></div></section>
<div class="wrap" style="padding-block:56px 88px;max-width:980px">
<p>家じまいでは、片付け・住まい・お金・手続き・葬儀など、たくさんの業種が関わります。家じまい123では、窓口が状況を整理し、必要な業種だけを選んで、見積りの比較や日程の調整をまとめて行います。ご相談者が、それぞれの業者に一から連絡する必要はありません。</p>
<p class="fine">いまの一覧は全${total}業種です。提携先は順次広げています。提携先へおつなぎするときは、相手と範囲をお伝えし、同意をいただいてからにします。</p>
${secs}
<p><a class="more" href="../partners/index.html">提携・協業をご希望の事業者・専門家の方はこちら</a></p>
</div></main>`;
s=s.slice(0,a)+main+s.slice(b);
fs.mkdirSync('renkei',{recursive:true});fs.writeFileSync('renkei/index.html',s);
console.log('サービスのページ',n,'業種',total);
