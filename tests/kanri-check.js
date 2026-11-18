// 管理画面の自動確認：本物の裏側を使わず、決まった見本データで全タブ・1件画面を開き、
// ① 画面のエラーがないか ② 見本データに混ぜた「危ない文字」で命令が動かないか を確かめる
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=path.resolve(process.argv[2]||path.join(__dirname,'..'));const ROLE=process.argv[4]||'admin';const OUT=process.argv[3]||'';
const X='危<img src=x onerror="window.__xss=1">"\'<script>window.__xss=2</script>';
const T='2026-11-10T10:00:00.000Z';
const base=(over)=>Object.assign({created:T,updated:T,log:'[]',checks:'[]'},over);
const cs=['name','relation','phone','email','address','area','housing','timing','fields','services','worries','detail','staff','next_action','memo','source','contact_pref','case_name','partner_name','service','amount','person','kind','categories','meeting','meet_dates','registered_by','role','login_id','note','pg1','pg2','pg3','pg_note','license','title','party_name','party_email','party_company'];
const row=(id,o)=>{const r=base({id});cs.forEach(k=>r[k]=X+k);return Object.assign(r,o)};
const rows={
 case:[row('C-1',{status:'新規',cat1:'家財・持ち物の整理',cat2:'遺品整理',cat3:X,next_date:'2026-11-20',idle_days:3,alerts:[{lv:'red',t:X}],suggest:[{service:X,partners:[{id:'P-1',name:X}]}]}),row('C-2',{status:'対応中'})],
 ref:[row('R-1',{case_id:'C-1',partner_id:'P-1',status:'進行中',date:'2026-11-11',sent_at:T,cat2:'遺品整理',pg_updated:T})],
 partner:[row('P-1',{kind:'協力企業',apply_status:'提携開始',active:'取引中',categories:'作業・サービスの提供＞片付け＞遺品整理：'+X,meet_date:'2026-11-12'}),row('P-2',{kind:'協力企業',apply_status:'新規申込',active:''})],
 staff:[row('S-1',{active:'在籍',role:X})],
};
const opts={caseStatus:['新規','連絡済み','対応中','完了','見送り'],refStatus:['進行中','完了'],applyStatus:['新規申込','提携開始'],staff:[X]};
const con={id:'K-1',title:X,status:'締結済み',party_name:X,party_email:'a@example.com',created:T,signed:T,link:'partner:P-1',draft:'',terms:'{}'};
function answer(a,d){switch(a){
 case 'admin.me':return ROLE==='staff'?{me:{r:'staff',n:X,id:'s1'},perms:['case','ref','contract','partner']}:{me:{r:'admin',n:X,id:'nakajima'}};
 case 'admin.templates':return{templates:[{key:'teikei',title:X,defaultFields:['name'],requireId:false,items:false}],fields:{name:{label:X,type:'text',required:true}},names:[{key:'iejimai',label:X,company:X,shop:X}]};
 case 'admin.list':return{rows:[con]};
 case 'kanri.dash':return{counts:{newCase:1,newApply:1,red:1,open:2,refOpen:1,pendingPartner:1,members:1,waiting:1,signedMonth:1,noStaff:1,unrouted:1},opts,newest:[{name:X}],alerts:[{level:'red',status:'対応中',name:X}],apps:[{level:'yellow',apply_status:'面談予定',name:X}],stages:[{status:X,n:2}],astages:[{status:X,n:1}]};
 case 'kanri.list':return{rows:rows[d.table]||[],opts};
 case 'kanri.get':{const r=(rows[d.table]||[]).find(x=>x.id===d.id)||rows[d.table][0];return{row:r,refs:rows.ref,contracts:[con],partners:rows.partner,builtins:[],opts,files:[],notes:[]}}
 case 'kanri.audit':return{rows:[{at:'2026-11-18 10:00',who:X,what:X,target:X,detail:X}]};
 case 'kanri.customers':return{rows:[{name:X,phone:X,email:X,area:X,relation:X,staff:X,last:T,open:1,signed:1,cats:[X],cases:[Object.assign({},rows.case[0])],contracts:[con]}]};
 case 'staff.home':return{me:{n:X},perms:['case','ref','contract','partner'],applyUrl:'https://iejimai123.jp/kyoryoku/?ref=x',contracts:{draft:1,waiting:1,signed:1},partners:[Object.assign({},rows.partner[1],{next_date:'2026-11-01',refs:1,refsOpen:1,source:X})],sent:[{t:'2026-11-18',company:X,to:X,person:X}]};
 case 'kanri.refx':return{ref:Object.assign({},rows.ref[0],{pg:[],files:[],invoices:[]})};
 default:return{};
}}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const srv=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)){s.writeHead(404);s.end();return}const h={'Content-Type':types[path.extname(f)]||'application/octet-stream'};if(p.startsWith('/kanri/')&&fs.existsSync(path.join(ROOT,'kanri/.htaccess'))){const m=fs.readFileSync(path.join(ROOT,'kanri/.htaccess'),'utf8').match(/Content-Security-Policy "([^"]+)"/);if(m)h['Content-Security-Policy']=m[1].replace(' upgrade-insecure-requests','').replace(/connect-src [^;]+/,'$& http://127.0.0.1:*')}s.writeHead(200,h);fs.createReadStream(f).pipe(s)});
(async()=>{await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});const pg=await ctx.newPage();
 const errs=[],calls=[];let probing=false;pg.on('pageerror',e=>errs.push('画面のエラー：'+e.message));pg.on('console',m=>{if(probing)return;if(/Content Security Policy|Refused/.test(m.text()))errs.push('守りの設定で止められた：'+m.text().slice(0,160));if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('記録：'+m.text())});
 await pg.route(/script\.google(usercontent)?\.com/,async r=>{let d={};try{d=JSON.parse(r.request().postData()||'{}')}catch(e){}calls.push(d.action);await r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(Object.assign({ok:true},answer(d.action,d)))})});
 await pg.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
 await ctx.addInitScript(()=>{try{sessionStorage.setItem('ij-admin-session','test');localStorage.setItem('ij-help-admin','1');localStorage.setItem('ij-help-staff','1')}catch(e){}});
 await pg.goto(`http://127.0.0.1:${port}/kanri/`);await pg.waitForTimeout(800);
 const snap={};
 const tabs=ROLE==='staff'?['home','keiyaku','acct']:['dash','case','ref','apply','partner','staff','keiyaku','cust','log','acct'];for(const v of tabs){
  const btn=await pg.$(`[data-v="${v}"]`);if(!btn||!(await btn.isVisible())){errs.push('タブが見えない：'+v);continue}
  await btn.click();await pg.waitForTimeout(400);
  snap[v]=await pg.evaluate(v=>{const e=document.getElementById('v-'+v);return e?e.innerText.replace(/\s+/g,' ').slice(0,4000):'(なし)'},v);
  if(v==='cust'){const r=await pg.$('#custRows tr.click');if(r){await r.click();await pg.waitForTimeout(300);snap['cust:1件']=await pg.evaluate(()=>document.getElementById('v-cust').innerText.replace(/\s+/g,' ').slice(0,4000))}else errs.push('お客様リストに行がない')}
  const er=await pg.evaluate(()=>[...document.querySelectorAll('.err')].filter(e=>e.offsetParent&&e.textContent.trim()).map(e=>e.textContent.trim().slice(0,80)));if(er.length)errs.push(v+'：画面にエラー表示：'+er.join(' / '));
  if(['case','ref','apply','partner','staff'].includes(v)){const r=await pg.$(`[data-list="${v}"] tbody .row`);if(r){await r.click();await pg.waitForTimeout(500);snap[v+':1件']=await pg.evaluate(v=>{const e=document.querySelector('[data-ed="'+v+'"]');return e?e.innerText.replace(/\s+/g,' ').slice(0,6000):''},v);const c=await pg.$(`[data-close="${v}"]`);if(c&&await c.isVisible())await c.click();}else errs.push('一覧に行がない：'+v)}
 }
 probing=true;const inl=await pg.evaluate(async()=>{const e=document.createElement('script');e.textContent='window.__inl=1';document.body.appendChild(e);await new Promise(r=>setTimeout(r,100));return !!window.__inl});await pg.waitForTimeout(200);probing=false;if(inl)errs.push('混ぜ込んだ命令が動く状態です（守りの設定が効いていない）');
 const xss=await pg.evaluate(()=>window.__xss);if(xss)errs.push('危ない文字で命令が動いた（'+xss+'）');
 const bad=await pg.evaluate(()=>{const o=[];for(const k of ['open','close','print','alert','fetch','setTimeout','addEventListener','confirm','focus','scroll','stop','find'])if(typeof window[k]!=='function')o.push(k);return o});if(bad.length)errs.push('ブラウザの機能が上書きされた：'+bad.join(','));
 if(OUT)fs.writeFileSync(OUT,JSON.stringify(snap,null,1));
 console.log(JSON.stringify({呼んだ操作:[...new Set(calls)].length,エラー:errs},null,1));
 await b.close();srv.close();process.exit(errs.length?1:0)})();
