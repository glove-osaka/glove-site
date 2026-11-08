/* 京都太陽行政書士事務所 事務所管理 */
(()=>{
const {esc,getJ,setJ,today,nowStr,uid,yen,pad}=KT;
const $=s=>document.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const REMOTE=!!KT.apiUrl();

/* ================= 基本の設定 ================= */
const STAFF_DEF=[{id:'matsumiya',name:'松宮 紀代',role:'代表・特定行政書士'},{id:'ma',name:'MA',role:'運営'}];
const MASTER_DEF={
  inqStatus:['未対応','連絡済','面談予定','見積提示','受任','完了','見送り'],
  caseStatus:['相談中','見積中','受任','作業中','完了','保留','見送り'],
  caseKind:['人が辞めない対策','事業承継・M&A','財務改善','補助金の申請','契約書・内容証明','許認可','会社設立・変更','外国人雇用・在留資格','遺言・相続','任意後見・家族信託','終活','空き家・施設入居','女性の起業','セミナー・講座','その他'],
  custKind:['企業','個人'],
  custSource:['ホームページ','ご紹介','セミナー','相談会','お電話','ハローワーク','その他'],
  custTag:['製造業','高齢の方','外国人雇用','紹介元','重要','継続支援'],
  logKind:['電話','メール','面談','訪問','書類作成','役所手続き','見積','請求','入金確認','その他'],
  evKind:['面談','訪問','オンライン面談','セミナー・講座','役所・手続き','移動','事務作業','私用','その他'],
  place:['事務所','お客様先','オンライン（Zoom）','電話','役所','その他'],
  dailyWork:['相談対応','書類作成','役所手続き','訪問・面談','全社員ヒアリング','見積・請求','営業・広報','セミナー','移動','事務'],
  docItem:['技術承継・定着支援プログラム（月額）','事業承継・M&A支援','補助金申請支援','契約書の作成','内容証明の作成','定款作成・会社設立','経営事項審査（経審）','在留資格の申請','公正証書遺言の起案','遺言・相続・終活 生前6点セット','任意後見契約書の起案','相談料（60分）','セミナー・講座','交通費（実費）','印紙代・手数料（実費）'],
  unit:['式','件','回','時間','ヶ月','通','名'],
  payMethod:['銀行振込','現金','クレジットカード','口座振替','電子マネー・QR決済'],
  expKind:['交通費','通信費','会費・登録料','研修費','書籍・資料','事務用品','広告・ホームページ','外注費','印紙・手数料（立替）','家賃・光熱費','その他'],
  expStatus:['支払予定','支払済'],
  quoteStatus:['作成中','提出済','受注','失注'],
  ctrStatus:['下書き','送付済','締結','取消']
};
const MASTER_NAMES={inqStatus:'相談受付の対応状況',caseStatus:'対応（案件）の状況',caseKind:'相談・案件の種類',custKind:'顧客の区分',custSource:'顧客のきっかけ',custTag:'顧客の目印',logKind:'経過記録の種類',evKind:'予定の種類',place:'場所・方法',dailyWork:'日報の業務',docItem:'見積・請求の品目',unit:'単位',payMethod:'支払い方法',expKind:'支払いの科目',expStatus:'支払いの状態',quoteStatus:'見積の状態',ctrStatus:'契約の状態'};

const CTR_TPL_DEF=[
{name:'業務委託契約書（技術承継・定着支援プログラム）',body:`業務委託契約書

{{顧客名}}（以下「甲」という。）と{{事務所名}}（以下「乙」という。）は、次のとおり業務委託契約（以下「本契約」という。）を締結する。

第1条（目的）
甲は乙に対し、甲の社員の定着と技術承継の仕組みづくりに関する支援業務（以下「本業務」という。）を委託し、乙はこれを受託する。

第2条（業務の内容）
本業務の内容は次のとおりとする。
(1) 全社員への個別ヒアリングと、その結果の報告
(2) 定着と技術承継の仕組みの提案と、導入の支援
(3) 評価制度の整備に関する助言
(4) その他、甲乙が別途合意した業務
2　就業規則の作成・変更、社会保険の手続きなど社会保険労務士の業務、および税務に関する業務は本業務に含まない。必要な場合、乙は甲の求めにより専門家を紹介する。

第3条（期間）
本契約の期間は、{{開始日}}から{{期間}}とする。

第4条（委託料）
本業務の委託料は{{金額}}とし、甲は乙の発行する請求書に従い、指定の期日までに乙の指定する口座に振り込んで支払う。振込手数料は甲の負担とする。

第5条（返金制度）
6ヶ月プランについては、乙が別に定める条件を満たした場合に限り、甲が支払った委託料の全額を返金する。条件の詳細は別紙のとおりとする。

第6条（協力義務）
甲は、ヒアリングの日程確保、必要な資料の提供その他本業務の遂行に必要な協力を行う。

第7条（秘密保持）
甲および乙は、本業務を通じて知り得た相手方の秘密情報を、相手方の書面による承諾なく第三者に開示し、または本契約の目的以外に使用してはならない。この義務は本契約終了後も存続する。
2　乙は、ヒアリングで得た社員個人の発言内容を、本人の同意なく個人が特定できる形で甲に開示しない。

第8条（個人情報）
乙は、本業務で取り扱う個人情報を、個人情報保護法その他の法令に従い適切に管理する。

第9条（解約）
甲または乙は、1ヶ月前までに書面または電磁的方法で通知することにより、本契約を解約することができる。この場合、甲は解約日までに提供された本業務に相当する委託料を支払う。

第10条（協議）
本契約に定めのない事項または疑義が生じた事項は、甲乙誠実に協議して解決する。

第11条（管轄）
本契約に関する紛争は、京都地方裁判所を第一審の専属的合意管轄裁判所とする。

本契約の成立を証するため、本書を電磁的に作成し、甲乙それぞれが電子的に合意のうえ、各自その記録を保管する。

{{日付}}

甲　{{顧客住所}}
　　{{顧客名}}

乙　{{事務所住所}}
　　{{事務所名}}
　　{{行政書士名}}`},
{name:'委任契約書（行政書士業務）',body:`委任契約書

{{顧客名}}（以下「甲」という。）と{{事務所名}} {{行政書士名}}（以下「乙」という。）は、次のとおり委任契約（以下「本契約」という。）を締結する。

第1条（委任業務）
甲は乙に対し、次の業務（以下「本業務」という。）を委任し、乙はこれを受任する。
件名：{{件名}}

第2条（報酬）
本業務の報酬は{{金額}}とする。登録免許税・印紙代・証明書の取得費用などの実費は、報酬とは別に甲が負担する。

第3条（支払い）
甲は、乙の発行する請求書に従い、指定の期日までに報酬および実費を支払う。

第4条（業務の範囲）
乙は、行政書士法に定める範囲で本業務を行う。相手方との交渉や紛争の代理など、他の法律で他の資格者の業務とされるものは本業務に含まない。

第5条（資料の提供）
甲は、本業務に必要な資料と情報を、正確かつ速やかに乙に提供する。甲の提供した資料の誤りにより生じた結果について、乙は責任を負わない。

第6条（守秘義務）
乙は、本業務を通じて知り得た甲の秘密を、正当な理由なく第三者に漏らさない。

第7条（解約）
甲または乙は、いつでも本契約を解約することができる。この場合、甲は解約時までに乙が行った業務に相当する報酬と、支出済みの実費を支払う。

第8条（協議）
本契約に定めのない事項は、甲乙誠実に協議して定める。

本契約の成立を証するため、本書を電磁的に作成し、甲乙それぞれが電子的に合意のうえ、各自その記録を保管する。

{{日付}}

甲　{{顧客住所}}
　　{{顧客名}}

乙　{{事務所住所}}
　　{{事務所名}}
　　{{行政書士名}}`},
{name:'秘密保持契約書',body:`秘密保持契約書

{{顧客名}}（以下「甲」という。）と{{事務所名}}（以下「乙」という。）は、{{件名}}の検討および実施（以下「本目的」という。）にあたり、相互に開示する秘密情報の取扱いについて、次のとおり契約を締結する。

第1条（秘密情報）
本契約において秘密情報とは、本目的のために一方当事者が相手方に開示した技術上・営業上・人事上の情報のうち、開示の際に秘密である旨を示したもの、およびその性質上秘密として扱うべきものをいう。ただし、次のものを除く。
(1) 開示の時点で既に公知であったもの
(2) 開示後、受領者の責めによらず公知となったもの
(3) 開示の時点で受領者が既に保有していたもの
(4) 正当な権限を有する第三者から秘密保持義務を負わずに取得したもの

第2条（秘密保持）
受領者は、秘密情報を厳重に管理し、相手方の書面による事前の承諾なく第三者に開示・漏えいしてはならない。

第3条（目的外使用の禁止）
受領者は、秘密情報を本目的以外に使用してはならない。

第4条（返還・廃棄）
受領者は、本契約が終了したとき、または相手方から求められたときは、秘密情報を含む資料を返還または廃棄する。

第5条（有効期間）
本契約の有効期間は、締結日から{{期間}}とする。ただし、第2条および第3条の義務は、本契約終了後も3年間存続する。

第6条（協議）
本契約に定めのない事項は、甲乙誠実に協議して定める。

本契約の成立を証するため、本書を電磁的に作成し、甲乙それぞれが電子的に合意のうえ、各自その記録を保管する。

{{日付}}

甲　{{顧客住所}}
　　{{顧客名}}

乙　{{事務所住所}}
　　{{事務所名}}
　　{{行政書士名}}`}
];
const OFFICE_DEF={name:'京都太陽行政書士事務所',rep:'特定行政書士　松宮 紀代',zip:'615-0023',addr:'京都府京都市右京区西院西平町24',tel:'075-312-6647',mail:'contact@kyoto-taiyou.com',regNo:'',bank:'',invoiceNote:'お振込手数料はご負担いただきますようお願いいたします。',signText:''};

/* ================= 保存 ================= */
const KEYS={inq:'kt-inq-v1',cust:'kt-db-cust',case:'kt-db-case',ev:'kt-db-ev',daily:'kt-db-daily',doc:'kt-db-doc',rcv:'kt-db-rcv',exp:'kt-db-exp',ctr:'kt-db-ctr'};
const TABLES=Object.keys(KEYS);
let DB={},MASTER={},OFFICE={},TPL=[],STAFF=STAFF_DEF,ME=null;

function seed(){
  const d=today(),ym=d.slice(0,7),add=n=>{const t=new Date();t.setDate(t.getDate()+n);return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());};
  return {
    inq:[
      {id:'K261105-1012',no:'K261105-1012',at:add(-4)+' 10:12',sample:1,type:'企業',topics:['人が辞めない対策','事業承継・M&A'],timing:'1ヶ月以内',how:'訪問してほしい',name:'見本 一郎',company:'見本精工株式会社',tel:'075-000-0001',mail:'',contact:'電話',time:['午前（9〜12時）'],msg:'ベテラン社員が来春に定年。若手に技術を残す方法を相談したい。（見本のデータです）',files:[],status:'受任',next:'',memo:'顧客登録済み',custId:'c-sample1'},
      {id:'P261107-1530',no:'P261107-1530',at:add(-2)+' 15:30',sample:1,type:'個人',topics:['遺言・相続','任意後見・家族信託'],timing:'すぐに相談したい',how:'事務所へ来所',name:'見本 花子',company:'',tel:'',mail:'sample@example.com',contact:'メール',time:['いつでも'],msg:'母の今後に備えて、任意後見と遺言について知りたい。（見本のデータです）',files:['資産メモ.pdf'],status:'未対応',next:'',memo:''}],
    cust:[{id:'c-sample1',sample:1,kind:'企業',name:'見本 一郎',kana:'みほん いちろう',company:'見本精工株式会社',title:'代表取締役',tel:'075-000-0001',mail:'ichiro@example.com',zip:'615-0000',addr:'京都府京都市右京区〇〇町1-2',source:'ホームページ',tags:['製造業'],memo:'社員22名。精密部品の加工。（見本）',created:add(-4)}],
    case:[{id:'k-sample1',sample:1,custId:'c-sample1',title:'技術承継・定着支援（6ヶ月プラン）',kind:'人が辞めない対策',status:'受任',owner:'松宮 紀代',start:add(-1),due:add(180),fee:900000,memo:'',log:[{at:add(-3)+' 11:00',kind:'電話',by:'松宮 紀代',text:'初回のお電話。訪問面談の日程を決定。'},{at:add(-1)+' 14:00',kind:'訪問',by:'松宮 紀代',text:'社長と面談。6ヶ月プランで受任。全社員ヒアリングは来週から。'}]}],
    ev:[{id:'e-s1',sample:1,date:d,start:'10:00',end:'11:00',kind:'面談',title:'見本精工 ヒアリング日程の打合せ',custId:'c-sample1',caseId:'k-sample1',place:'オンライン（Zoom）',owner:'松宮 紀代',memo:''},{id:'e-s2',sample:1,date:add(2),start:'13:30',end:'17:00',kind:'訪問',title:'見本精工 全社員ヒアリング（1日目）',custId:'c-sample1',caseId:'k-sample1',place:'お客様先',owner:'松宮 紀代',memo:'5名予定'}],
    daily:[{id:'d-s1',sample:1,date:add(-1),user:'松宮 紀代',items:[{time:'9:00〜10:00',work:'書類作成',text:'在留資格の申請書類を作成'},{time:'14:00〜16:00',work:'訪問・面談',text:'見本精工 社長面談、受任'}],hours:7,note:'明日はヒアリング項目を準備する。'}],
    doc:[
      {id:'q-s1',sample:1,type:'見積',no:'Q'+ym.replace('-','').slice(2)+'-001',custId:'c-sample1',caseId:'k-sample1',title:'技術承継・定着支援プログラム（6ヶ月プラン）',issue:add(-2),due:add(28),status:'受注',lines:[{name:'技術承継・定着支援プログラム（月額）',qty:6,unit:'ヶ月',price:150000,tax:10}],note:'6ヶ月プランの返金制度の条件は契約書の別紙のとおりです。'},
      {id:'i-s1',sample:1,type:'請求',no:'I'+ym.replace('-','').slice(2)+'-001',custId:'c-sample1',caseId:'k-sample1',title:'技術承継・定着支援プログラム（1ヶ月目）',issue:d,due:add(30),status:'請求済',fromId:'q-s1',lines:[{name:'技術承継・定着支援プログラム（月額）',qty:1,unit:'ヶ月',price:150000,tax:10},{name:'交通費（実費）',qty:1,unit:'式',price:1200,tax:0}],note:''}],
    rcv:[],
    exp:[{id:'x-s1',sample:1,date:add(-3),kind:'会費・登録料',payee:'京都府行政書士会',item:'会費',amount:6000,method:'口座振替',status:'支払済',due:'',memo:''},{id:'x-s2',sample:1,date:add(-1),kind:'交通費',payee:'阪急電鉄',item:'見本精工 訪問',amount:600,method:'現金',status:'支払済',due:'',memo:''}],
    ctr:[]
  };
}
function loadLocal(){
  const s=getJ('kt-seeded',0)?null:seed();
  TABLES.forEach(t=>{let v=getJ(KEYS[t],null);if(v===null&&s){v=s[t];}DB[t]=(v||[]).map(r=>(r.id=r.id||r.no||uid(t+'-'),r));});
  if(s){TABLES.forEach(t=>setJ(KEYS[t],DB[t]));setJ('kt-seeded',1);}
  MASTER=Object.assign({},MASTER_DEF,getJ('kt-master-v1',{}));
  OFFICE=Object.assign({},OFFICE_DEF,getJ('kt-office-v1',{}));
  TPL=getJ('kt-ctrtpl-v1',null)||CTR_TPL_DEF;
  STAFF=getJ('kt-staff-v1',null)||STAFF_DEF;
}
function persistLocal(t){setJ(KEYS[t],DB[t]);}
async function loadRemote(){
  const j=await KT.call('listAll',{});
  TABLES.forEach(t=>DB[t]=(j[t]||[]).map(r=>(r.id=r.id||r.no,r)));
  MASTER=Object.assign({},MASTER_DEF,j.master||{});OFFICE=Object.assign({},OFFICE_DEF,j.office||{});
  TPL=(j.ctrTpl&&j.ctrTpl.length)?j.ctrTpl:CTR_TPL_DEF;STAFF=(j.staff&&j.staff.length)?j.staff:STAFF_DEF;
  ['info','news','fees','terms'].forEach(k=>{if(j[k]!=null)setJ(KT.SITE_KEYS[k],j[k]);});
}
function save(t,rec){
  if(!rec.id)rec.id=uid(t[0]+'-');
  rec.updatedAt=nowStr();rec.updatedBy=ME?ME.name:'';
  const a=DB[t],i=a.findIndex(r=>r.id===rec.id);
  if(i>-1)a[i]=rec;else a.unshift(rec);
  if(REMOTE)KT.call('save',{table:t,rec}).catch(e=>toast('保存先に保存できませんでした：'+(e.message||'')));
  else persistLocal(t);
  return rec;
}
function removeRec(t,id){
  DB[t]=DB[t].filter(r=>r.id!==id);
  if(REMOTE)KT.call('remove',{table:t,id}).catch(e=>toast('保存先で削除できませんでした：'+(e.message||'')));
  else persistLocal(t);
}
function saveConf(key,val){
  const map={master:'kt-master-v1',office:'kt-office-v1',ctrTpl:'kt-ctrtpl-v1',staff:'kt-staff-v1',info:KT.SITE_KEYS.info,news:KT.SITE_KEYS.news,fees:KT.SITE_KEYS.fees,terms:KT.SITE_KEYS.terms};
  setJ(map[key],val);
  if(REMOTE)return KT.call('saveConf',{key,val}).catch(e=>toast('保存先に保存できませんでした：'+(e.message||'')));
  return Promise.resolve();
}
const get=(t,id)=>DB[t].find(r=>r.id===id);
const custName=id=>{const c=get('cust',id);return c?(c.company?c.company+'　'+c.name:c.name):'';};
const caseName=id=>{const c=get('case',id);return c?c.title:'';};

/* ================= 小道具 ================= */
let toastT;
function toast(m){let el=$('#toast');if(!el){el=document.createElement('div');el.id='toast';el.className='toast';el.setAttribute('role','status');document.body.appendChild(el);}el.textContent=m;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2600);}
const dstr=s=>s?String(s).replace(/-/g,'/'):'';
const wd=s=>{if(!s)return '';const d=new Date(s+'T00:00');return '日月火水木金土'[d.getDay()];};
const addDays=(s,n)=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
function tagCls(v){if(['未対応','期限超過','未入金'].includes(v))return 't-new';if(['受任','受注','入金済','締結','支払済','作業中'].includes(v))return 't-ok';if(['完了','失注','見送り','取消'].includes(v))return 't-done';return 't-mid';}
const tag=(v,c)=>v?`<span class="tag ${c||tagCls(v)}">${esc(v)}</span>`:'';
const kindTag=k=>k==='企業'?tag('企業','t-biz'):k==='個人'?tag('個人','t-per'):'';
function copy(t){try{return navigator.clipboard.writeText(t).then(()=>toast('写しました'),()=>toast('写せませんでした。長押しで選んで写してください'));}catch(e){toast('写せませんでした');}}

/* ---- 入力欄 ---- */
let FC=0;
function fieldHTML(f,v){
  const id='f'+(++FC),req=f.req?'<span class="req">必須</span>':'',full=f.full?' full':'';
  const lab=`<label for="${id}">${esc(f.label)}${req}</label>`;
  v=v==null?'':v;
  switch(f.type){
    case 'textarea':return `<div class="field${full}" data-k="${f.k}" data-t="textarea">${lab}<textarea id="${id}" rows="${f.rows||3}" placeholder="${esc(f.ph||'')}">${esc(v)}</textarea></div>`;
    case 'date':case 'time':case 'number':case 'email':case 'tel':
      return `<div class="field${full}" data-k="${f.k}" data-t="${f.type}">${lab}<input id="${id}" type="${f.type}" value="${esc(v)}" ${f.type==='number'?'inputmode="decimal" step="any"':''} placeholder="${esc(f.ph||'')}"></div>`;
    case 'money':return `<div class="field${full}" data-k="${f.k}" data-t="money">${lab}<input id="${id}" type="number" inputmode="numeric" value="${esc(v)}" placeholder="円"></div>`;
    case 'pick':{
      const opts=f.opts?f.opts():(MASTER[f.master]||[]);const has=v!==''&&!opts.includes(v);
      return `<div class="field${full}" data-k="${f.k}" data-t="pick" data-m="${f.master||''}"><label for="${id}">${esc(f.label)}${req}</label><div class="pick"><select id="${id}"><option value="">選んでください</option>${opts.map(o=>`<option${o===v?' selected':''}>${esc(o)}</option>`).join('')}<option value="__free"${has?' selected':''}>（自由に入力）</option></select><div class="pick-free"${has?'':' hidden'}><input aria-label="${esc(f.label)}を自由に入力" value="${has?esc(v):''}" placeholder="自由に入力">${f.master?'<button type="button" class="btn btn-s" data-addm>選択肢に追加</button>':''}</div></div></div>`;}
    case 'multi':{
      const opts=MASTER[f.master]||[],vals=Array.isArray(v)?v:[];const all=opts.concat(vals.filter(x=>!opts.includes(x)));
      return `<div class="field${full}" data-k="${f.k}" data-t="multi" data-m="${f.master}"><span class="lbl">${esc(f.label)}${req}<span class="muted">（いくつでも）</span></span><div class="multi">${all.map((o,i)=>`<label><input type="checkbox" value="${esc(o)}"${vals.includes(o)?' checked':''}><span>${esc(o)}</span></label>`).join('')}</div><div class="mini-add"><input aria-label="${esc(f.label)}を追加" placeholder="ほかを入力して追加"><button type="button" class="btn btn-s" data-addchip>追加</button></div></div>`;}
    case 'ref':{
      const list=f.list();
      return `<div class="field${full}" data-k="${f.k}" data-t="ref">${lab}<select id="${id}"><option value="">${f.none||'選んでください'}</option>${list.map(o=>`<option value="${esc(o.id)}"${o.id===v?' selected':''}>${esc(o.label)}</option>`).join('')}</select></div>`;}
    default:return `<div class="field${full}" data-k="${f.k}" data-t="text">${lab}<input id="${id}" value="${esc(v)}" placeholder="${esc(f.ph||'')}" ${f.im?`inputmode="${f.im}"`:''}></div>`;
  }
}
function wireFields(root){
  $$('[data-t="pick"] select',root).forEach(sel=>sel.addEventListener('change',()=>{const fr=sel.parentNode.querySelector('.pick-free');fr.hidden=sel.value!=='__free';if(!fr.hidden)fr.querySelector('input').focus();}));
  $$('[data-addm]',root).forEach(b=>b.addEventListener('click',()=>{const box=b.closest('[data-t="pick"]'),m=box.dataset.m,inp=box.querySelector('.pick-free input'),v=inp.value.trim();if(!v)return;if(!MASTER[m].includes(v)){MASTER[m]=MASTER[m].concat(v);saveConf('master',pickMaster());}const sel=box.querySelector('select');const o=document.createElement('option');o.textContent=v;o.selected=true;sel.insertBefore(o,sel.lastElementChild);box.querySelector('.pick-free').hidden=true;toast('選択肢に「'+v+'」を追加しました');}));
  $$('[data-addchip]',root).forEach(b=>b.addEventListener('click',()=>{const box=b.closest('[data-t="multi"]'),inp=box.querySelector('.mini-add input'),v=inp.value.trim();if(!v)return;const m=box.dataset.m;if(m&&!MASTER[m].includes(v)){MASTER[m]=MASTER[m].concat(v);saveConf('master',pickMaster());}box.querySelector('.multi').insertAdjacentHTML('beforeend',`<label><input type="checkbox" value="${esc(v)}" checked><span>${esc(v)}</span></label>`);inp.value='';}));
}
function readFields(root){
  const o={};
  $$('[data-k]',root).forEach(el=>{if(el.closest('[data-k]')!==el)return;const k=el.dataset.k,t=el.dataset.t;
    if(t==='pick'){const s=el.querySelector('select');o[k]=s.value==='__free'?el.querySelector('.pick-free input').value.trim():s.value;}
    else if(t==='multi')o[k]=$$('.multi input:checked',el).map(i=>i.value);
    else if(t==='money'||t==='number'){const v=el.querySelector('input').value;o[k]=v===''?'':Number(v);}
    else {const i=el.querySelector('input,textarea,select');if(i)o[k]=i.value.trim();}
  });return o;
}
const pickMaster=()=>{const o={};Object.keys(MASTER_DEF).forEach(k=>o[k]=MASTER[k]);return o;};

/* ---- 小窓 ---- */
function modal(title,bodyHTML,footHTML,opt={}){
  const wrap=document.createElement('div');wrap.className='modal';
  wrap.innerHTML=`<div class="modal-bg" data-close></div><div class="modal-panel" role="dialog" aria-label="${esc(title)}" style="${opt.wide?'width:min(980px,100%)':''}"><div class="modal-head"><h2>${esc(title)}</h2><button class="btn btn-s" type="button" data-close>閉じる</button></div><div class="modal-body" style="display:grid;gap:14px">${bodyHTML}</div>${footHTML?`<div class="modal-foot">${footHTML}</div>`:''}</div>`;
  $('#modals').appendChild(wrap);document.body.style.overflow='hidden';
  const close=()=>{wrap.remove();if(!$('#modals').children.length)document.body.style.overflow='';};
  $$('[data-close]',wrap).forEach(b=>b.addEventListener('click',close));
  wrap.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  wireFields(wrap);
  const first=wrap.querySelector('input,select,textarea');if(first&&!opt.noFocus)setTimeout(()=>first.focus({preventScroll:true}),30);
  return {el:wrap,close};
}
function confirmBtn(btn,label,fn){btn.addEventListener('click',()=>{if(btn.dataset.sure!=='1'){btn.dataset.sure='1';btn.textContent='本当に'+label;setTimeout(()=>{btn.dataset.sure='';btn.textContent=label;},4000);return;}fn();});}

/* ================= 帳票の計算 ================= */
function docCalc(d){
  const by={};let sub=0;
  (d.lines||[]).forEach(l=>{const amt=Math.round((Number(l.qty)||0)*(Number(l.price)||0));const r=Number(l.tax)||0;by[r]=(by[r]||0)+amt;sub+=amt;});
  let tax=0;const rates=Object.keys(by).map(Number).sort((a,b)=>b-a).map(r=>{const t=Math.floor(by[r]*r/100);tax+=t;return {r,base:by[r],tax:t};});
  return {sub,tax,total:sub+tax,rates};
}
const paidOf=id=>DB.rcv.filter(r=>r.docId===id).reduce((s,r)=>s+(Number(r.amount)||0),0);
function invStatus(d){if(d.type!=='請求')return d.status||'作成中';const tot=docCalc(d).total,p=paidOf(d.id);if(d.status==='作成中')return '作成中';if(p>=tot&&tot>0)return '入金済';if(p>0)return '一部入金';if(d.due&&d.due<today())return '期限超過';return '請求済';}
function nextNo(type){const pre=(type==='見積'?'Q':'I')+today().slice(2,7).replace('-','');const n=DB.doc.filter(d=>String(d.no||'').startsWith(pre)).length+1;return pre+'-'+String(n).padStart(3,'0');}
function nextCtrNo(){const pre='C'+today().slice(2,7).replace('-','');return pre+'-'+String(DB.ctr.filter(c=>String(c.no||'').startsWith(pre)).length+1).padStart(3,'0');}

/* ================= 画面 ================= */
const NAV=[
  {v:'home',ico:'⌂',label:'ホーム'},
  {sep:'受付と顧客'},
  {v:'inq',ico:'受',label:'相談受付',badge:()=>DB.inq.filter(x=>x.status==='未対応').length},
  {v:'cust',ico:'客',label:'顧客'},
  {v:'case',ico:'件',label:'対応（案件）'},
  {sep:'日々の業務'},
  {v:'ev',ico:'予',label:'予定'},
  {v:'daily',ico:'報',label:'日報'},
  {sep:'お金と契約'},
  {v:'doc',ico:'見',label:'見積・請求'},
  {v:'rcv',ico:'入',label:'入金'},
  {v:'exp',ico:'支',label:'支払い'},
  {v:'ctr',ico:'契',label:'契約書・電子契約'},
  {sep:'そのほか'},
  {v:'site',ico:'頁',label:'サイトの内容'},
  {v:'set',ico:'設',label:'設定'}
];
let CUR='home';const VIEWS={};
function renderNav(){
  $('#nav').innerHTML=NAV.map(n=>n.sep?`<div class="nav-sep">${esc(n.sep)}</div>`:`<button type="button" data-v="${n.v}"${n.v===CUR?' aria-current="page"':''}><span class="ico" aria-hidden="true">${n.ico}</span><span>${esc(n.label)}</span>${n.badge&&n.badge()?`<span class="badge">${n.badge()}</span>`:''}</button>`).join('');
}
function go(v,arg){CUR=VIEWS[v]?v:'home';const n=NAV.find(x=>x.v===CUR);$('#view-title').textContent=n.label;renderNav();$('#view').innerHTML='';VIEWS[CUR]($('#view'),arg);if(location.hash!=='#v-'+CUR)history.replaceState(null,'','#v-'+CUR);window.scrollTo(0,0);}
const refresh=()=>go(CUR);

/* ---------- ホーム ---------- */
VIEWS.home=el=>{
  const td=today(),tm=addDays(td,1),ym=td.slice(0,7);
  const newInq=DB.inq.filter(x=>x.status==='未対応');
  const evs=DB.ev.filter(e=>e.date===td||e.date===tm).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  const unpaid=DB.doc.filter(d=>d.type==='請求'&&['請求済','一部入金','期限超過'].includes(invStatus(d)));
  const unpaidAmt=unpaid.reduce((s,d)=>s+docCalc(d).total-paidOf(d.id),0);
  const over=unpaid.filter(d=>invStatus(d)==='期限超過');
  const dueCases=DB.case.filter(c=>c.due&&c.due<=addDays(td,14)&&!['完了','見送り'].includes(c.status));
  const waitCtr=DB.ctr.filter(c=>c.status==='送付済');
  const inMonth=DB.rcv.filter(r=>String(r.date).slice(0,7)===ym).reduce((s,r)=>s+(Number(r.amount)||0),0);
  const outMonth=DB.exp.filter(x=>String(x.date).slice(0,7)===ym&&x.status==='支払済').reduce((s,x)=>s+(Number(x.amount)||0),0);
  const myDaily=DB.daily.find(d=>d.date===td&&d.user===ME.name);
  el.innerHTML=`
  <div class="stats">
    <button class="stat${newInq.length?' alert':''}" data-go="inq"><b>${newInq.length}</b><span>未対応の相談</span></button>
    <button class="stat" data-go="ev"><b>${DB.ev.filter(e=>e.date===td).length}</b><span>今日の予定</span></button>
    <button class="stat${over.length?' alert':''}" data-go="doc"><b>${unpaid.length}<small style="font-size:.5em">件</small></b><span>入金待ち ${yen(unpaidAmt)}${over.length?`（期限超過${over.length}）`:''}</span></button>
    <button class="stat" data-go="ctr"><b>${waitCtr.length}</b><span>締結待ちの契約</span></button>
  </div>
  ${myDaily?'':`<div class="warn row"><span>今日の日報がまだです。</span><span class="spacer"></span><button class="btn btn-s btn-main" data-act="daily">日報を書く</button></div>`}
  <div class="grid2">
    <section class="card"><h2>今日と明日の予定<small>${dstr(td)}（${wd(td)}）</small></h2>${evs.length?`<ul class="list">${evs.map(evItem).join('')}</ul>`:'<p class="empty">予定はありません</p>'}<div class="row" style="margin-top:10px"><button class="btn btn-s" data-act="addev">予定を入れる</button></div></section>
    <section class="card"><h2>未対応の相談</h2>${newInq.length?`<ul class="list">${newInq.slice(0,5).map(inqItem).join('')}</ul>`:'<p class="empty">未対応の相談はありません</p>'}</section>
    <section class="card"><h2>期限が近い対応<small>2週間以内</small></h2>${dueCases.length?`<ul class="list">${dueCases.map(caseItem).join('')}</ul>`:'<p class="empty">ありません</p>'}</section>
    <section class="card"><h2>今月のお金<small>${ym.replace('-','年')}月</small></h2>
      <div class="kv"><span>入金</span><b>${yen(inMonth)}</b></div><div class="kv"><span>支払い（支払済）</span><b>${yen(outMonth)}</b></div><div class="kv"><span>差し引き</span><b>${yen(inMonth-outMonth)}</b></div><div class="kv"><span>入金待ち</span><b>${yen(unpaidAmt)}</b></div>
    </section>
  </div>`;
  $$('[data-go]',el).forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  bindItems(el);
  const ad=el.querySelector('[data-act="daily"]');if(ad)ad.addEventListener('click',()=>openDaily(null,{date:td}));
  el.querySelector('[data-act="addev"]').addEventListener('click',()=>openEv(null,{date:td}));
};
function bindItems(el){
  $$('[data-open]',el).forEach(b=>b.addEventListener('click',()=>{const [t,id]=b.dataset.open.split(':');({inq:openInq,cust:openCust,case:openCase,ev:openEv,daily:openDaily,doc:openDoc,rcv:openRcv,exp:openExp,ctr:openCtr})[t](id);}));
}
function listView(el,{search,chips,chipKey,items,item,addLabel,onAdd,extra,empty}){
  let q='',ch='';
  el.innerHTML=`<div class="toolbar"><label class="sr" for="q">探す</label><input id="q" type="search" placeholder="${esc(search)}">${addLabel?`<button class="btn btn-main" type="button" data-add>＋ ${esc(addLabel)}</button>`:''}</div>${chips?`<div class="chips" role="group" aria-label="絞り込み"><button class="chip" aria-pressed="true" data-ch="">すべて</button>${chips.map(c=>`<button class="chip" aria-pressed="false" data-ch="${esc(c)}">${esc(c)}</button>`).join('')}</div>`:''}<div data-extra>${extra||''}</div><ul class="list" id="lst"></ul>`;
  const draw=()=>{const r=items().filter(x=>(!ch||chipKey(x)===ch)&&(!q||JSON.stringify(x).includes(q)));$('#lst',el).innerHTML=r.length?r.map(item).join(''):`<li class="empty">${esc(empty||'まだ登録がありません')}</li>`;bindItems($('#lst',el));};
  el.querySelector('#q').addEventListener('input',e=>{q=e.target.value.trim();draw();});
  $$('[data-ch]',el).forEach(b=>b.addEventListener('click',()=>{ch=b.dataset.ch;$$('[data-ch]',el).forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));draw();}));
  const ab=el.querySelector('[data-add]');if(ab)ab.addEventListener('click',onAdd);
  bindItems(el.querySelector('[data-extra]'));
  draw();return draw;
}

/* ---------- 相談受付 ---------- */
function inqItem(x){return `<li><button class="item" data-open="inq:${esc(x.id)}"><span class="item-top">${tag(x.status)}${kindTag(x.type)}<span class="meta">${esc(x.no)}</span>${x.sample?'<span class="tag t-done">見本</span>':''}</span><b>${esc(x.name)}${x.company?`<small>（${esc(x.company)}）</small>`:''}</b><span class="sub">${esc((x.topics||[]).join('、'))}</span><span class="meta">受付 ${esc(x.at)}${x.next?'　次の連絡 '+dstr(x.next):''}${(x.files||[]).length?'　添付'+x.files.length+'点':''}${(x.replies||[]).length?'　返信'+x.replies.length+'回':''}</span></button></li>`;}
VIEWS.inq=el=>listView(el,{search:'名前・会社・電話・内容で探す',chips:MASTER.inqStatus,chipKey:x=>x.status,items:()=>DB.inq.slice().sort((a,b)=>String(b.at).localeCompare(a.at)),item:inqItem,empty:'相談はまだありません。サイトの相談フォームから届くと、ここに出ます'});
function openInq(id){
  const x=get('inq',id);if(!x)return;
  const rows=[['受付日時',x.at],['区分',x.type+'のご相談'],['お名前',x.name],['会社名',x.company],['お電話',x.tel],['メール',x.mail],['ご相談の種類',(x.topics||[]).join('、')],['時期',x.timing],['相談方法',x.how],['ご連絡の希望',x.contact],['つながりやすい時間',(x.time||[]).join('、')],['ご相談の内容',x.msg],['添付資料',(x.files||[]).map(f=>typeof f==='string'?f:f.name).join('、')]].filter(r=>r[1]);
  const cust=x.custId&&get('cust',x.custId);
  const m=modal(`${x.type}のご相談　${x.no}`,`
    <div class="row"><button class="btn btn-main" data-rep>メールで返信する</button>${cust?`<button class="btn" data-cust>顧客カルテを開く</button>`:`<button class="btn" data-mkcust>顧客と対応に登録する</button>`}<button class="btn" data-ev>予定を入れる</button></div>
    <dl class="dl">${rows.map(r=>`<dt>${r[0]}</dt><dd>${r[0]==='お電話'?`<a href="tel:${esc(r[1].replace(/[^0-9+]/g,''))}">${esc(r[1])}</a>`:r[0]==='メール'?`<a href="mailto:${esc(r[1])}">${esc(r[1])}</a>`:esc(r[1])}</dd>`).join('')}</dl>
    ${(x.replies||[]).length?`<div><h3 style="font-size:15px;margin-bottom:6px">返信の記録（${x.replies.length}件）</h3>${x.replies.map(r=>`<details class="card" style="padding:10px 12px;margin-bottom:6px"><summary><b>${esc(r.at)}</b>　${esc(r.s)} <span class="muted">${esc(r.via)}</span></summary><pre style="white-space:pre-wrap;font:inherit;margin:8px 0 0">${esc(r.b)}</pre></details>`).join('')}</div>`:''}
    <div class="fgrid">${fieldHTML({k:'status',label:'対応状況',type:'pick',master:'inqStatus'},x.status)}${fieldHTML({k:'next',label:'次に連絡する日',type:'date'},x.next)}${fieldHTML({k:'memo',label:'対応メモ',type:'textarea',full:1,ph:'例）11/10 電話。来所面談を11/15 14時で予約'},x.memo)}</div>`,
    `<button class="btn btn-del" data-del>削除</button><span class="spacer"></span><button class="btn btn-main" data-save>保存する</button>`,{noFocus:1});
  const keep=()=>{Object.assign(x,readFields(m.el.querySelector('.fgrid')));save('inq',x);};
  m.el.querySelector('[data-save]').addEventListener('click',()=>{keep();m.close();refresh();toast('保存しました');});
  confirmBtn(m.el.querySelector('[data-del]'),'削除',()=>{removeRec('inq',x.id);m.close();refresh();toast('削除しました');});
  m.el.querySelector('[data-rep]').addEventListener('click',()=>{keep();m.close();openReply(x.id);});
  m.el.querySelector('[data-ev]').addEventListener('click',()=>{keep();m.close();openEv(null,{date:x.next||today(),title:(x.company||x.name)+' 様 ご相談',custId:x.custId||'',kind:'面談'});});
  const cb=m.el.querySelector('[data-cust]');if(cb)cb.addEventListener('click',()=>{m.close();openCust(x.custId);});
  const mk=m.el.querySelector('[data-mkcust]');if(mk)mk.addEventListener('click',()=>{keep();
    const c=save('cust',{kind:x.type,name:x.name,company:x.company,tel:x.tel,mail:x.mail,source:'ホームページ',tags:[],memo:'相談受付 '+x.no+' から登録',created:today()});
    const k=save('case',{custId:c.id,title:(x.topics||[])[0]?(x.topics[0]+'のご相談'):'ご相談',kind:(x.topics||[])[0]||'',status:'相談中',owner:ME.name,start:today(),due:'',fee:'',memo:x.msg,log:[{at:nowStr(),kind:'その他',by:ME.name,text:'ホームページの相談フォームから受付（'+x.no+'）'}],inqId:x.id});
    x.custId=c.id;x.caseId=k.id;save('inq',x);m.close();toast('顧客と対応に登録しました');openCase(k.id);});
}

/* ---- 返信（文例・AI・送信） ---- */
function sign(){return OFFICE.signText||`――――――――――――――――\n${OFFICE.name}\n${OFFICE.rep}\n〒${OFFICE.zip} ${OFFICE.addr}\n電話 ${KT.site('info').tel}（${KT.site('info').hours}・暦通り）\nメール ${KT.site('info').mail}`;}
function greet(x){return (x.company?x.company+'\n':'')+x.name+' 様\n\nこのたびは'+OFFICE.name+'にご相談いただき、誠にありがとうございます。\n特定行政書士の松宮でございます。\n\n';}
function replyTemplates(x){
  const tp=(x.topics||[]).join('、'),how=x.how||'',no=x.no||'',S=OFFICE.name;
  return [
  {k:'お礼と日程の調整',s:`【${S}】ご相談ありがとうございます（受付番号 ${no}）`,b:greet(x)+`「${tp}」についてのご相談、確かに承りました。\nまずは初回のご相談（1時間まで無料）で、詳しいお話をお伺いできればと存じます。\n\n${how?'ご希望の「'+how+'」で承ります。\n':''}下記の日時のご都合はいかがでしょうか。\n\n・〇月〇日（〇）〇時〜\n・〇月〇日（〇）〇時〜\n・〇月〇日（〇）〇時〜\n\nご都合が合わない場合は、ご希望の日時をお知らせください。\n\nどうぞよろしくお願いいたします。\n\n`+sign()},
  {k:'詳しい内容の確認',s:`【${S}】ご相談内容の確認（受付番号 ${no}）`,b:greet(x)+'より適切なご提案をするため、差し支えのない範囲で、次の点を教えていただけますでしょうか。\n\n'+(x.type==='企業'?'・社員の人数と、主な業種\n・現在いちばんお困りのこと\n・いつ頃までに解決したいか\n':'・ご相談の対象となる方（ご本人・ご家族など）\n・現在の状況と、いちばんご心配なこと\n・いつ頃までに進めたいか\n')+'\nお電話でお話しいただくことも可能です。\n\nどうぞよろしくお願いいたします。\n\n'+sign()},
  {k:'お見積りのご案内',s:`【${S}】お見積りのご案内（受付番号 ${no}）`,b:greet(x)+'先日はお時間をいただき、ありがとうございました。\nお伺いした内容をもとに、お見積りをお送りいたします。\n\n・ご依頼内容：〇〇〇〇\n・費用：〇〇円（税込）\n・お支払い時期：〇〇〇〇\n・進め方と期間の目安：〇〇〇〇\n\nご納得いただけるまで、ご契約は発生いたしません。\n\nどうぞよろしくお願いいたします。\n\n'+sign()},
  {k:'ほかの専門家のご紹介',s:`【${S}】ご相談への回答（受付番号 ${no}）`,b:greet(x)+'お伺いした内容のうち、〇〇〇〇の点については、〇〇（弁護士・税理士・司法書士・社会保険労務士など）の専門分野となります。\n\n信頼できる専門家を、私が同行してご紹介することができます。ご紹介に費用はかかりません。\nあわせて、当事務所でお手伝いできる〇〇〇〇については、引き続き対応いたします。\n\nご希望をお聞かせいただけましたら幸いです。\n\n'+sign()},
  {k:'面談日の確定',s:`【${S}】面談日のご確認（受付番号 ${no}）`,b:greet(x)+`面談の日時を、下記のとおり承りました。\n\n・日時：〇月〇日（〇）〇時〜（1時間程度）\n・方法：${how||'〇〇〇〇'}\n・場所：${OFFICE.addr}（阪急・嵐電「西院」駅から徒歩圏）\n\n関係する資料があればお持ちください（なくても構いません）。\n\n当日お目にかかれますことを楽しみにしております。\n\n`+sign()}];
}
const pv=b=>{const ps=String(b||'').split(/\n\s*\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x&&!/様$|ありがとうございます|松宮でございます|^―/.test(x));const t=ps[0]||'';return t.length>46?t.slice(0,46)+'…':t;};
/* AI */
let sampleP=null;
function getSample(){if(!sampleP)sampleP=(window.claude&&window.claude.use)?window.claude.use('sample').catch(()=>null):Promise.resolve(null);return sampleP;}
async function ai(prompt){
  const s=await getSample();
  if(s){const r=await s(prompt,{modelTier:'default'});return r.text;}
  if(REMOTE){const j=await KT.call('ai',{prompt});return j.text||'';}
  throw {code:'none',message:'AIは、Claudeの画面で開いたとき、または保存先（Googleスプレッドシート）につないでAIの鍵を登録したときに使えます。'};
}
const parseJSON=t=>{const m=String(t).match(/\{[\s\S]*\}|\[[\s\S]*\]/);if(!m)throw {message:'AIの答えを読み取れませんでした。もう一度お試しください。'};return JSON.parse(m[0]);};
const feeText=()=>{const f=KT.site('fees');return [['biz','経営者のご相談'],['per','個人のご相談']].map(([g,n])=>n+'\n'+f[g].map(r=>'・'+r.n+(r.note?'（'+r.note+'）':'')+'：'+r.p+(r.ps?' '+r.ps:'')).join('\n')).join('\n\n');};
const RULES='あなたは京都太陽行政書士事務所（代表：特定行政書士 松宮紀代、女性）のメール作成を手伝う秘書です。守ること：丁寧で温かく、簡潔な日本語。相談者を安心させる。行政書士の業務範囲を守り、争いのある交渉・代理は弁護士、税務は税理士、登記は司法書士、就業規則や社会保険は社会保険労務士を紹介すると書く。結果を約束しない・断定しない。料金は料金表の範囲でのみ触れ、分からないことは〇〇の伏せ字にする。日時など事務所が決めることは〇の伏せ字にする。個人情報を必要以上に繰り返さない。';
const recText=x=>`受付番号：${x.no}\n区分：${x.type}のご相談\nお名前：${x.name}${x.company?'\n会社名：'+x.company:''}\n相談の種類：${(x.topics||[]).join('、')}\n時期：${x.timing||'未記入'}\n希望の相談方法：${x.how||'未記入'}\n相談内容：${x.msg||'未記入'}\n対応状況：${x.status}\n事務所のメモ：${x.memo||'なし'}\nこれまでの返信：${(x.replies||[]).map(r=>r.at+' 「'+r.s+'」').join(' / ')||'なし'}`;
async function busy(btn,fn){const l=btn.textContent;btn.disabled=true;btn.textContent='AIが考えています…';try{await fn();}catch(e){toast((e&&e.code==='rate_limited')?'AIが混み合っています。少し時間をおいてお試しください':(e&&e.message)||'AIで作れませんでした');}finally{btn.disabled=false;btn.textContent=l;}}
function mailBox(m,{to,subject,body,onDone}){
  /* 送る部分（Gmail・メールアプリ・写す・この画面から送信） */
  const box=m.el.querySelector('[data-mailbox]');
  box.innerHTML=`<div class="fgrid">${fieldHTML({k:'to',label:'宛先',type:'email',full:1},to)}${fieldHTML({k:'s',label:'件名',full:1},subject)}${fieldHTML({k:'b',label:'本文',type:'textarea',rows:12,full:1},body)}</div>
  <div class="row"><button class="btn btn-s" data-polish>AIに読みやすく整えてもらう</button><button class="btn btn-s" data-check>AIに送る前の点検をしてもらう</button></div><div class="check-out" data-out hidden></div>
  <div class="row">${REMOTE?'<button class="btn btn-main" data-send>この画面から送信する</button>':''}<a class="btn${REMOTE?'':' btn-main'}" data-gmail target="_blank" rel="noopener" href="#">Gmailで送る</a><a class="btn" data-mailto href="#">メールアプリで送る</a><button class="btn" data-copy>件名と本文を写す</button></div>
  <p class="note">${REMOTE?'「この画面から送信」は事務所のGmailから送られ、自動で記録されます。':'押すと、宛先・件名・本文が入った状態でメールが開きます。送ったら「送信済みにする」を押して記録してください。'}</p>`;
  wireFields(box);
  const val=()=>{const o=readFields(box);return o;};
  const upd=()=>{const o=val();box.querySelector('[data-gmail]').href='https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(o.to)+'&su='+encodeURIComponent(o.s)+'&body='+encodeURIComponent(o.b);box.querySelector('[data-mailto]').href='mailto:'+encodeURIComponent(o.to)+'?subject='+encodeURIComponent(o.s)+'&body='+encodeURIComponent(o.b);};
  box.addEventListener('input',upd);upd();
  let via='';
  box.querySelector('[data-gmail]').addEventListener('click',()=>via='Gmail');box.querySelector('[data-mailto]').addEventListener('click',()=>via='メールアプリ');
  box.querySelector('[data-copy]').addEventListener('click',()=>{via='写して送信';const o=val();copy('件名：'+o.s+'\n\n'+o.b);});
  const sb=box.querySelector('[data-send]');if(sb)sb.addEventListener('click',async()=>{const o=val();if(!o.to){toast('宛先を入れてください');return;}sb.disabled=true;try{await KT.call('sendMail',{to:o.to,subject:o.s,body:o.b});onDone(o,'事務所のGmailから送信');}catch(e){toast('送信できませんでした：'+(e.message||''));}sb.disabled=false;});
  box.querySelector('[data-polish]').addEventListener('click',e=>busy(e.target,async()=>{const o=val();const t=await ai(RULES+'\n\n次のメール本文を、意味と伏せ字（〇）を変えずに、読みやすく丁寧に整えてください。署名はそのまま残す。答えは整えた本文だけ。\n\n'+o.b);box.querySelector('[data-k="b"] textarea').value=String(t).trim();upd();toast('整えました。内容を確かめてください');}));
  box.querySelector('[data-check]').addEventListener('click',e=>busy(e.target,async()=>{const o=val();const out=box.querySelector('[data-out]');const t=await ai(RULES+'\n\n【送ろうとしているメール】\n宛先：'+o.to+'\n件名：'+o.s+'\n'+o.b+'\n\n送る前の点検をしてください。見る点：宛名の誤り、埋め忘れの〇、行政書士の業務範囲を超える表現、断定や約束、料金の誤り、失礼な表現、誤字。問題ごとに1行で。問題がなければ「問題は見つかりませんでした」とだけ答える。');out.textContent=String(t).trim();out.hidden=false;}));
  return {set:(s,b)=>{box.querySelector('[data-k="s"] input').value=s;box.querySelector('[data-k="b"] textarea').value=b;upd();},get:val,via:()=>via||'メール'};
}
function openReply(id){
  const x=get('inq',id);if(!x)return;
  const m=modal('メールで返信する　'+x.no,`
    ${x.mail?'':`<p class="warn">メールアドレスの登録がありません。電話（${esc(x.tel||'未登録')}）でご連絡するか、宛先を入れて送ってください。</p>`}
    <section><h3 style="font-size:15px;margin-bottom:8px">1. 返信文を選ぶ・作る</h3>
      <div class="chips" style="margin-bottom:8px"><button class="chip" aria-pressed="true" data-tab="tpl">文例から選ぶ</button><button class="chip" aria-pressed="false" data-tab="ai">AIに作ってもらう</button></div>
      <div data-p="tpl"><div class="rep-cards" data-cards="tpl"></div></div>
      <div data-p="ai" hidden><div class="fgrid">${fieldHTML({k:'hint',label:'AIへの指示（任意）',full:1,ph:'例）来週火曜か水曜の午後で面談を提案して'},'')}</div><div class="row" style="margin-top:8px"><button class="btn btn-main btn-s" data-ai>AIに返信案を3つ作ってもらう</button></div><div class="rep-cards" data-cards="ai" style="margin-top:8px"></div></div>
    </section>
    <section><h3 style="font-size:15px;margin-bottom:8px">2. 内容を確かめて送る</h3><div data-mailbox style="display:grid;gap:10px"></div></section>`,
    `<span class="spacer"></span><button class="btn btn-main" data-done>送信済みにする（記録する）</button>`,{noFocus:1});
  const done=(o,via)=>{x.replies=x.replies||[];x.replies.unshift({at:nowStr(),to:o.to,s:o.s,b:o.b,via});if(x.status==='未対応')x.status='連絡済';save('inq',x);if(x.caseId){const k=get('case',x.caseId);if(k){k.log=k.log||[];k.log.unshift({at:nowStr(),kind:'メール',by:ME.name,text:'返信：'+o.s});save('case',k);}}m.close();refresh();toast('返信を記録しました');openInq(x.id);};
  const tp=replyTemplates(x);
  const mb=mailBox(m,{to:x.mail||'',subject:tp[0].s,body:tp[0].b,onDone:done});
  const cards=(sel,list)=>{const box=m.el.querySelector(`[data-cards="${sel}"]`);box.innerHTML=list.map((t,i)=>`<button class="rep-card${sel==='tpl'&&i===0?' on':''}" data-i="${i}"><b>${esc(t.k)}</b><span>${esc(pv(t.b))}</span></button>`).join('');$$('[data-i]',box).forEach(b=>b.addEventListener('click',()=>{$$('.rep-card',m.el).forEach(c=>c.classList.toggle('on',c===b));const t=list[+b.dataset.i];mb.set(t.s,t.b);}));};
  cards('tpl',tp);
  $$('[data-tab]',m.el).forEach(b=>b.addEventListener('click',()=>{$$('[data-tab]',m.el).forEach(c=>c.setAttribute('aria-pressed',c===b?'true':'false'));$$('[data-p]',m.el).forEach(p=>p.hidden=p.dataset.p!==b.dataset.tab);}));
  m.el.querySelector('[data-ai]').addEventListener('click',e=>busy(e.target,async()=>{const hint=readFields(m.el.querySelector('[data-p="ai"]')).hint;const t=await ai(RULES+'\n\n【相談の内容】\n'+recText(x)+'\n\n【料金表】\n'+feeText()+'\n\n【事務所からの指示】\n'+(hint||'特になし。相談の段階に合った返信にする')+'\n\n【作るもの】この相談者へのメール返信案を、方針の違う3案作る。各案に、短い方針名（10字以内）、件名、本文（宛名から始め、署名は付けない）を入れる。\n答えはJSONの配列だけで返す：[{"k":"方針名","s":"件名","b":"本文"}]');cards('ai',parseJSON(t).map(a=>({k:a.k||'AIの案',s:a.s||'',b:(a.b||'')+'\n\n'+sign()})));toast('3つの案ができました。使う案を押してください');}));
  m.el.querySelector('[data-done]').addEventListener('click',()=>done(mb.get(),mb.via()));
}

/* ---------- 顧客 ---------- */
const CUST_F=[{k:'kind',label:'区分',type:'pick',master:'custKind',req:1},{k:'name',label:'お名前（ご担当者）',req:1},{k:'kana',label:'ふりがな'},{k:'company',label:'会社名・団体名'},{k:'title',label:'役職'},{k:'tel',label:'電話',type:'tel'},{k:'mail',label:'メール',type:'email'},{k:'zip',label:'郵便番号',im:'numeric'},{k:'addr',label:'住所',full:1},{k:'source',label:'きっかけ',type:'pick',master:'custSource'},{k:'tags',label:'目印',type:'multi',master:'custTag',full:1},{k:'memo',label:'メモ',type:'textarea',full:1}];
function custItem(c){const cs=DB.case.filter(k=>k.custId===c.id);return `<li><button class="item" data-open="cust:${esc(c.id)}"><span class="item-top">${kindTag(c.kind)}${(c.tags||[]).map(t=>tag(t,'t-gold')).join('')}${c.sample?tag('見本','t-done'):''}</span><b>${esc(c.company||c.name)}${c.company?`<small>　${esc(c.name)} 様</small>`:' 様'}</b><span class="meta">${esc(c.tel||'')}${c.mail?'　'+esc(c.mail):''}${cs.length?'　対応'+cs.length+'件':''}</span></button></li>`;}
VIEWS.cust=el=>listView(el,{search:'名前・会社・電話・メモで探す',chips:MASTER.custKind,chipKey:x=>x.kind,items:()=>DB.cust.slice().sort((a,b)=>String(a.kana||a.name).localeCompare(b.kana||b.name,'ja')),item:custItem,addLabel:'顧客を登録',onAdd:()=>editRec('cust',null,CUST_F,'顧客'),empty:'まだ顧客の登録がありません'});
function editRec(t,id,F,name,preset,after){
  const r=id?Object.assign({},get(t,id)):Object.assign({},preset||{});
  const m=modal((id?name+'を直す':name+'を登録'),`<div class="fgrid">${F.map(f=>fieldHTML(f,r[f.k])).join('')}</div>`,`${id?'<button class="btn btn-del" data-del>削除</button>':''}<span class="spacer"></span><button class="btn btn-main" data-save>保存する</button>`);
  m.el.querySelector('[data-save]').addEventListener('click',()=>{const o=readFields(m.el.querySelector('.fgrid'));const miss=F.filter(f=>f.req&&(o[f.k]===''||o[f.k]==null));if(miss.length){toast(miss.map(f=>f.label).join('・')+'を入れてください');return;}Object.assign(r,o);if(!id)r.created=today();const s=save(t,r);m.close();if(after)after(s);else refresh();toast('保存しました');});
  const d=m.el.querySelector('[data-del]');if(d)confirmBtn(d,'削除',()=>{removeRec(t,id);m.close();refresh();toast('削除しました');});
  return m;
}
function openCust(id){
  const c=get('cust',id);if(!c)return;
  const cs=DB.case.filter(k=>k.custId===id),ds=DB.doc.filter(d=>d.custId===id),cts=DB.ctr.filter(k=>k.custId===id),evs=DB.ev.filter(e=>e.custId===id).sort((a,b)=>b.date.localeCompare(a.date)),iq=DB.inq.filter(q=>q.custId===id);
  const billed=ds.filter(d=>d.type==='請求').reduce((s,d)=>s+docCalc(d).total,0),paid=ds.filter(d=>d.type==='請求').reduce((s,d)=>s+paidOf(d.id),0);
  const m=modal('顧客カルテ　'+(c.company||c.name),`
    <div class="row">${kindTag(c.kind)}${(c.tags||[]).map(t=>tag(t,'t-gold')).join('')}<span class="spacer"></span><button class="btn btn-s" data-edit>情報を直す</button></div>
    <dl class="dl">${[['お名前',c.name+(c.kana?'（'+c.kana+'）':'')],['会社名',c.company],['役職',c.title],['電話',c.tel],['メール',c.mail],['住所',(c.zip?'〒'+c.zip+' ':'')+(c.addr||'')],['きっかけ',c.source],['メモ',c.memo]].filter(r=>r[1]&&r[1].trim()).map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>
    <div class="grid3"><div class="card"><span class="muted">請求の合計</span><b style="display:block;font-size:18px">${yen(billed)}</b></div><div class="card"><span class="muted">入金済み</span><b style="display:block;font-size:18px">${yen(paid)}</b></div><div class="card"><span class="muted">未入金</span><b style="display:block;font-size:18px;color:${billed-paid>0?'var(--red)':'inherit'}">${yen(billed-paid)}</b></div></div>
    <div class="row"><button class="btn btn-main btn-s" data-newcase>対応を追加</button><button class="btn btn-s" data-newq>見積を作る</button><button class="btn btn-s" data-newctr>契約書を作る</button><button class="btn btn-s" data-newev>予定を入れる</button>${c.mail?'<button class="btn btn-s" data-mail>メールを送る</button>':''}</div>
    <section><h3 style="font-size:15px;margin-bottom:6px">対応（${cs.length}）</h3>${cs.length?`<ul class="list">${cs.map(caseItem).join('')}</ul>`:'<p class="muted">ありません</p>'}</section>
    <section><h3 style="font-size:15px;margin-bottom:6px">見積・請求（${ds.length}）</h3>${ds.length?`<ul class="list">${ds.map(docItem).join('')}</ul>`:'<p class="muted">ありません</p>'}</section>
    <section><h3 style="font-size:15px;margin-bottom:6px">契約（${cts.length}）</h3>${cts.length?`<ul class="list">${cts.map(ctrItem).join('')}</ul>`:'<p class="muted">ありません</p>'}</section>
    <section><h3 style="font-size:15px;margin-bottom:6px">予定（${evs.length}）</h3>${evs.length?`<ul class="list">${evs.slice(0,8).map(evItem).join('')}</ul>`:'<p class="muted">ありません</p>'}</section>
    ${iq.length?`<section><h3 style="font-size:15px;margin-bottom:6px">相談受付（${iq.length}）</h3><ul class="list">${iq.map(inqItem).join('')}</ul></section>`:''}`,'',{noFocus:1,wide:1});
  bindItemsClose(m);
  m.el.querySelector('[data-edit]').addEventListener('click',()=>{m.close();editRec('cust',id,CUST_F,'顧客',null,()=>openCust(id));});
  m.el.querySelector('[data-newcase]').addEventListener('click',()=>{m.close();editRec('case',null,CASE_F,'対応',{custId:id,status:'相談中',owner:ME.name,start:today(),log:[]},k=>openCase(k.id));});
  m.el.querySelector('[data-newq]').addEventListener('click',()=>{m.close();openDoc(null,{type:'見積',custId:id});});
  m.el.querySelector('[data-newctr]').addEventListener('click',()=>{m.close();openCtr(null,{custId:id});});
  m.el.querySelector('[data-newev]').addEventListener('click',()=>{m.close();openEv(null,{date:today(),custId:id,title:(c.company||c.name)+' 様'});});
  const mb=m.el.querySelector('[data-mail]');if(mb)mb.addEventListener('click',()=>{m.close();openMail({to:c.mail,subject:'【'+OFFICE.name+'】',body:(c.company?c.company+'\n':'')+c.name+' 様\n\nいつもお世話になっております。\n'+OFFICE.name+'の松宮でございます。\n\n\n\n'+sign(),onDone:(o,via)=>{logToCust(c,o,via);}});});
}
function bindItemsClose(m){$$('[data-open]',m.el).forEach(b=>b.addEventListener('click',()=>m.close()));bindItems(m.el);}
function logToCust(c,o,via){const k=DB.case.find(x=>x.custId===c.id&&!['完了','見送り'].includes(x.status));if(k){k.log=k.log||[];k.log.unshift({at:nowStr(),kind:'メール',by:ME.name,text:'メール送信：'+o.s+'（'+via+'）'});save('case',k);}}
function openMail({to,subject,body,onDone}){
  const m=modal('メールを送る','<div data-mailbox style="display:grid;gap:10px"></div>','<span class="spacer"></span><button class="btn btn-main" data-done>送信済みにする（記録する）</button>',{noFocus:1});
  const fin=(o,via)=>{if(onDone)onDone(o,via);m.close();toast('記録しました');};
  const mb=mailBox(m,{to,subject,body,onDone:fin});
  m.el.querySelector('[data-done]').addEventListener('click',()=>fin(mb.get(),mb.via()));
}

/* ---------- 対応（案件） ---------- */
const custList=()=>DB.cust.map(c=>({id:c.id,label:(c.company?c.company+'　':'')+c.name}));
const caseList=()=>DB.case.map(k=>({id:k.id,label:k.title+'（'+custName(k.custId)+'）'}));
const staffOpts=()=>STAFF.map(s=>s.name);
const CASE_F=[{k:'custId',label:'顧客',type:'ref',list:custList,req:1,full:1},{k:'title',label:'件名',req:1,full:1,ph:'例）技術承継・定着支援（6ヶ月プラン）'},{k:'kind',label:'種類',type:'pick',master:'caseKind'},{k:'status',label:'状況',type:'pick',master:'caseStatus'},{k:'owner',label:'担当',type:'pick',opts:staffOpts},{k:'fee',label:'受任金額（税込）',type:'money'},{k:'start',label:'開始日',type:'date'},{k:'due',label:'期限',type:'date'},{k:'memo',label:'メモ',type:'textarea',full:1}];
function caseItem(k){const last=(k.log||[])[0];return `<li><button class="item" data-open="case:${esc(k.id)}"><span class="item-top">${tag(k.status)}${k.kind?tag(k.kind,'t-gold'):''}${k.sample?tag('見本','t-done'):''}${k.fee?`<span class="amt">${yen(k.fee)}</span>`:''}</span><b>${esc(k.title)}</b><span class="sub">${esc(custName(k.custId))}</span><span class="meta">担当 ${esc(k.owner||'')}${k.due?'　期限 '+dstr(k.due):''}${last?'　最終 '+esc(last.at)+' '+esc(last.kind):''}</span></button></li>`;}
VIEWS.case=el=>listView(el,{search:'件名・顧客・メモで探す',chips:MASTER.caseStatus,chipKey:x=>x.status,items:()=>DB.case.map(k=>Object.assign({_c:custName(k.custId)},k)).sort((a,b)=>String(b.updatedAt||b.start).localeCompare(a.updatedAt||a.start)),item:caseItem,addLabel:'対応を追加',onAdd:()=>editRec('case',null,CASE_F,'対応',{status:'相談中',owner:ME.name,start:today(),log:[]},k=>openCase(k.id))});
function openCase(id){
  const k=get('case',id);if(!k)return;
  const ds=DB.doc.filter(d=>d.caseId===id),cts=DB.ctr.filter(c=>c.caseId===id),evs=DB.ev.filter(e=>e.caseId===id).sort((a,b)=>a.date.localeCompare(b.date));
  const m=modal('対応　'+k.title,`
    <div class="row">${tag(k.status)}${k.kind?tag(k.kind,'t-gold'):''}<span class="muted">${esc(custName(k.custId))}　担当 ${esc(k.owner||'')}${k.due?'　期限 '+dstr(k.due):''}</span><span class="spacer"></span><button class="btn btn-s" data-edit>情報を直す</button></div>
    <div class="row"><button class="btn btn-s" data-cust>顧客カルテ</button><button class="btn btn-s" data-q>見積を作る</button><button class="btn btn-s" data-i>請求を作る</button><button class="btn btn-s" data-c>契約書を作る</button><button class="btn btn-s" data-e>予定を入れる</button></div>
    <section class="card"><h2>経過を記録する</h2><div class="fgrid">${fieldHTML({k:'kind',label:'種類',type:'pick',master:'logKind'},'電話')}${fieldHTML({k:'at',label:'日時',ph:'空なら今'},'')}${fieldHTML({k:'text',label:'内容',type:'textarea',full:1,ph:'例）社長と電話。ヒアリングは12/2〜12/4で確定'},'')}${fieldHTML({k:'status',label:'あわせて状況を変える',type:'pick',master:'caseStatus'},k.status)}</div><div class="row" style="margin-top:8px"><span class="spacer"></span><button class="btn btn-main btn-s" data-addlog>記録する</button></div></section>
    <section><h3 style="font-size:15px;margin-bottom:8px">経過（${(k.log||[]).length}）</h3>${(k.log||[]).length?`<ol class="timeline">${k.log.map((l,i)=>`<li><span class="meta">${esc(l.at)}　${esc(l.kind)}　${esc(l.by||'')}</span><p>${esc(l.text)}</p><button class="btn btn-s btn-del" style="padding:2px 10px;font-size:12px" data-dl="${i}">消す</button></li>`).join('')}</ol>`:'<p class="muted">まだ記録がありません</p>'}</section>
    ${evs.length?`<section><h3 style="font-size:15px;margin-bottom:6px">予定</h3><ul class="list">${evs.map(evItem).join('')}</ul></section>`:''}
    ${ds.length?`<section><h3 style="font-size:15px;margin-bottom:6px">見積・請求</h3><ul class="list">${ds.map(docItem).join('')}</ul></section>`:''}
    ${cts.length?`<section><h3 style="font-size:15px;margin-bottom:6px">契約</h3><ul class="list">${cts.map(ctrItem).join('')}</ul></section>`:''}
    ${k.memo?`<section><h3 style="font-size:15px">メモ</h3><p style="white-space:pre-wrap">${esc(k.memo)}</p></section>`:''}`,'',{noFocus:1,wide:1});
  bindItemsClose(m);
  m.el.querySelector('[data-edit]').addEventListener('click',()=>{m.close();editRec('case',id,CASE_F,'対応',null,()=>openCase(id));});
  m.el.querySelector('[data-cust]').addEventListener('click',()=>{m.close();openCust(k.custId);});
  m.el.querySelector('[data-q]').addEventListener('click',()=>{m.close();openDoc(null,{type:'見積',custId:k.custId,caseId:id,title:k.title});});
  m.el.querySelector('[data-i]').addEventListener('click',()=>{m.close();openDoc(null,{type:'請求',custId:k.custId,caseId:id,title:k.title});});
  m.el.querySelector('[data-c]').addEventListener('click',()=>{m.close();openCtr(null,{custId:k.custId,caseId:id,title:k.title,amount:k.fee?yen(k.fee)+'（税込）':''});});
  m.el.querySelector('[data-e]').addEventListener('click',()=>{m.close();openEv(null,{date:today(),custId:k.custId,caseId:id,title:custName(k.custId)+' '+k.title});});
  m.el.querySelector('[data-addlog]').addEventListener('click',()=>{const sec=m.el.querySelector('[data-addlog]').closest('section');const o=readFields(sec);if(!o.text){toast('内容を入れてください');return;}k.log=k.log||[];k.log.unshift({at:o.at||nowStr(),kind:o.kind||'その他',by:ME.name,text:o.text});if(o.status)k.status=o.status;save('case',k);m.close();openCase(id);toast('記録しました');});
  $$('[data-dl]',m.el).forEach(b=>confirmBtn(b,'消す',()=>{k.log.splice(+b.dataset.dl,1);save('case',k);m.close();openCase(id);}));
}

/* ---------- 予定 ---------- */
const EV_F=[{k:'date',label:'日付',type:'date',req:1},{k:'kind',label:'種類',type:'pick',master:'evKind'},{k:'start',label:'開始',type:'time'},{k:'end',label:'終了',type:'time'},{k:'title',label:'件名',req:1,full:1},{k:'custId',label:'顧客',type:'ref',list:custList,none:'（なし）'},{k:'caseId',label:'対応',type:'ref',list:caseList,none:'（なし）'},{k:'place',label:'場所・方法',type:'pick',master:'place'},{k:'owner',label:'担当',type:'pick',opts:staffOpts},{k:'memo',label:'メモ',type:'textarea',full:1}];
function evItem(e){return `<li><button class="item" data-open="ev:${esc(e.id)}"><span class="item-top"><span class="meta">${dstr(e.date)}（${wd(e.date)}）${esc(e.start||'')}${e.end?'〜'+esc(e.end):''}</span>${e.kind?tag(e.kind,'t-gold'):''}${e.sample?tag('見本','t-done'):''}</span><b>${esc(e.title)}</b><span class="meta">${esc(e.place||'')}${e.owner?'　'+esc(e.owner):''}</span></button></li>`;}
const openEv=(id,preset)=>editRec('ev',id,EV_F,'予定',preset||{owner:ME.name});
let calMonth=today().slice(0,7),calSel=today();
VIEWS.ev=el=>{
  const [y,mo]=calMonth.split('-').map(Number);const first=new Date(y,mo-1,1),start=new Date(first);start.setDate(1-first.getDay());
  const days=[];for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);days.push(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()));}
  const byD={};DB.ev.forEach(e=>{(byD[e.date]=byD[e.date]||[]).push(e);});Object.values(byD).forEach(a=>a.sort((p,q)=>String(p.start).localeCompare(q.start)));
  const sel=(byD[calSel]||[]);
  el.innerHTML=`<div class="toolbar"><button class="btn btn-s" data-m="-1" aria-label="前の月">〈</button><h2 style="font-size:19px;min-width:8em;text-align:center">${y}年${mo}月</h2><button class="btn btn-s" data-m="1" aria-label="次の月">〉</button><button class="btn btn-s" data-today>今日</button><span class="spacer"></span><button class="btn btn-main" data-add>＋ 予定を入れる</button></div>
  <div class="card"><div class="cal">${'日月火水木金土'.split('').map(w=>`<div class="cal-h">${w}</div>`).join('')}${days.map(d=>{const dw=new Date(d+'T00:00').getDay();const es=byD[d]||[];return `<button class="cal-d${d.slice(0,7)!==calMonth?' out':''}${d===today()?' today':''}${d===calSel?' sel':''}${dw===0?' sun':dw===6?' sat':''}" data-d="${d}" aria-label="${dstr(d)} 予定${es.length}件"><span class="n">${Number(d.slice(8))}</span>${es.slice(0,3).map(e=>`<span class="cal-e${e.owner&&e.owner!==STAFF[0].name?' k2':''}">${esc(e.start||'')} ${esc(e.title)}</span>`).join('')}${es.length>3?`<span class="muted" style="font-size:10px">ほか${es.length-3}</span>`:''}</button>`;}).join('')}</div></div>
  <section class="card"><h2>${dstr(calSel)}（${wd(calSel)}）の予定</h2>${sel.length?`<ul class="list">${sel.map(evItem).join('')}</ul>`:'<p class="empty">予定はありません</p>'}</section>`;
  $$('[data-m]',el).forEach(b=>b.addEventListener('click',()=>{const d=new Date(y,mo-1+Number(b.dataset.m),1);calMonth=d.getFullYear()+'-'+pad(d.getMonth()+1);refresh();}));
  el.querySelector('[data-today]').addEventListener('click',()=>{calMonth=today().slice(0,7);calSel=today();refresh();});
  $$('[data-d]',el).forEach(b=>b.addEventListener('click',()=>{calSel=b.dataset.d;refresh();}));
  el.querySelector('[data-add]').addEventListener('click',()=>openEv(null,{date:calSel,owner:ME.name}));
  bindItems(el);
};

/* ---------- 日報 ---------- */
function dailyItem(d){return `<li><button class="item" data-open="daily:${esc(d.id)}"><span class="item-top"><span class="meta">${dstr(d.date)}（${wd(d.date)}）</span>${tag(d.user,'t-gold')}${d.hours?`<span class="amt">${esc(d.hours)}時間</span>`:''}${d.sample?tag('見本','t-done'):''}</span><b>${esc((d.items||[]).map(i=>i.work).filter(Boolean).join('・')||'（業務の記入なし）')}</b><span class="sub">${esc((d.note||'').slice(0,60))}</span></button></li>`;}
VIEWS.daily=el=>listView(el,{search:'内容・所感で探す',chips:staffOpts(),chipKey:x=>x.user,items:()=>DB.daily.slice().sort((a,b)=>b.date.localeCompare(a.date)),item:dailyItem,addLabel:'日報を書く',onAdd:()=>openDaily(null,{date:today()})});
function openDaily(id,preset){
  const d=id?JSON.parse(JSON.stringify(get('daily',id))):Object.assign({user:ME.name,items:[],hours:'',note:''},preset||{});
  if(!d.items.length)d.items=[{time:'',work:'',caseId:'',text:''}];
  const rowHTML=(it)=>`<div class="line line-daily" data-row>${fieldHTML({k:'time',label:'時間',ph:'9:00〜10:00'},it.time)}${fieldHTML({k:'work',label:'業務',type:'pick',master:'dailyWork'},it.work)}${fieldHTML({k:'caseId',label:'対応',type:'ref',list:caseList,none:'（なし）'},it.caseId)}${fieldHTML({k:'text',label:'内容'},it.text)}<div class="l-ops"><button type="button" class="btn btn-s btn-del" data-rm aria-label="この行を消す">消す</button></div></div>`;
  const m=modal(id?'日報を直す':'日報を書く',`<div class="fgrid" data-head>${fieldHTML({k:'date',label:'日付',type:'date',req:1},d.date)}${fieldHTML({k:'user',label:'記入者',type:'pick',opts:staffOpts},d.user)}</div>
    <div class="row"><h3 style="font-size:15px">業務</h3><span class="spacer"></span><button class="btn btn-s" data-fromev>この日の予定から取り込む</button><button class="btn btn-s" data-ai>AIに下書きしてもらう</button></div>
    <div class="lines" data-rows>${d.items.map(rowHTML).join('')}</div><div><button class="btn btn-s" data-addrow>＋ 行を追加</button></div>
    <div class="fgrid" data-foot>${fieldHTML({k:'hours',label:'勤務時間',type:'number',ph:'時間'},d.hours)}${fieldHTML({k:'note',label:'所感・明日の予定',type:'textarea',full:1,rows:4},d.note)}</div>`,
    `${id?'<button class="btn btn-del" data-del>削除</button>':''}<span class="spacer"></span><button class="btn btn-main" data-save>保存する</button>`,{noFocus:1,wide:1});
  const rows=m.el.querySelector('[data-rows]');
  const addRow=(it)=>{rows.insertAdjacentHTML('beforeend',rowHTML(it));wireFields(rows.lastElementChild);bindRm();};
  const bindRm=()=>$$('[data-rm]',rows).forEach(b=>b.onclick=()=>{b.closest('[data-row]').remove();});
  bindRm();
  m.el.querySelector('[data-addrow]').addEventListener('click',()=>addRow({}));
  const readRows=()=>$$('[data-row]',rows).map(r=>readFields(r)).filter(r=>r.time||r.work||r.text||r.caseId);
  m.el.querySelector('[data-fromev]').addEventListener('click',()=>{const dt=readFields(m.el.querySelector('[data-head]')).date;const es=DB.ev.filter(e=>e.date===dt).sort((a,b)=>String(a.start).localeCompare(b.start));if(!es.length){toast('この日の予定はありません');return;}if(!readRows().length)rows.innerHTML='';es.forEach(e=>addRow({time:(e.start||'')+(e.end?'〜'+e.end:''),work:{'面談':'訪問・面談','訪問':'訪問・面談','オンライン面談':'訪問・面談','セミナー・講座':'セミナー','役所・手続き':'役所手続き','移動':'移動'}[e.kind]||'事務',caseId:e.caseId||'',text:e.title}));toast(es.length+'件を取り込みました');});
  m.el.querySelector('[data-ai]').addEventListener('click',e=>busy(e.target,async()=>{const h=readFields(m.el.querySelector('[data-head]'));const items=readRows();const logs=DB.case.flatMap(k=>(k.log||[]).filter(l=>String(l.at).startsWith(h.date)).map(l=>k.title+'：'+l.kind+' '+l.text));const evs=DB.ev.filter(x=>x.date===h.date).map(x=>(x.start||'')+' '+x.title);const t=await ai('行政書士事務所の日報の「所感・明日の予定」欄の下書きを、3〜5行の丁寧な日本語で書いてください。事実にないことは書かない。\n日付：'+h.date+'\n業務：'+items.map(i=>[i.time,i.work,i.text].join(' ')).join(' / ')+'\n予定：'+evs.join(' / ')+'\n対応の記録：'+logs.join(' / ')+'\n明日の予定：'+DB.ev.filter(x=>x.date===addDays(h.date,1)).map(x=>(x.start||'')+' '+x.title).join(' / ')+'\n答えは本文だけ。');m.el.querySelector('[data-foot] [data-k="note"] textarea').value=String(t).trim();toast('下書きしました。確かめてください');}));
  m.el.querySelector('[data-save]').addEventListener('click',()=>{const h=readFields(m.el.querySelector('[data-head]')),f=readFields(m.el.querySelector('[data-foot]'));if(!h.date){toast('日付を入れてください');return;}Object.assign(d,h,f,{items:readRows()});save('daily',d);m.close();refresh();toast('保存しました');});
  const del=m.el.querySelector('[data-del]');if(del)confirmBtn(del,'削除',()=>{removeRec('daily',id);m.close();refresh();});
}

/* ---------- 見積・請求 ---------- */
function docItem(d){const st=invStatus(d),c=docCalc(d);const rest=d.type==='請求'?c.total-paidOf(d.id):0;return `<li><button class="item" data-open="doc:${esc(d.id)}"><span class="item-top">${tag(d.type==='見積'?'見積':'請求',d.type==='見積'?'t-gold':'t-biz')}${tag(st)}<span class="meta">${esc(d.no)}</span>${d.sample?tag('見本','t-done'):''}<span class="amt">${yen(c.total)}</span></span><b>${esc(d.title||'')}</b><span class="sub">${esc(custName(d.custId))}</span><span class="meta">発行 ${dstr(d.issue)}${d.due?`　${d.type==='見積'?'有効期限':'支払期限'} ${dstr(d.due)}`:''}${rest>0&&st!=='作成中'?'　未入金 '+yen(rest):''}</span></button></li>`;}
VIEWS.doc=el=>listView(el,{search:'番号・件名・顧客で探す',chips:['見積','請求','入金待ち','期限超過','入金済'],chipKey:x=>null,items:()=>DB.doc.slice().sort((a,b)=>String(b.issue).localeCompare(a.issue)),item:docItem,addLabel:'作る',onAdd:()=>{const m=modal('どちらを作りますか',`<div class="users"><button data-t="見積">見積書<small>お見積り</small></button><button data-t="請求">請求書<small>ご請求</small></button></div>`,'');$$('[data-t]',m.el).forEach(b=>b.addEventListener('click',()=>{m.close();openDoc(null,{type:b.dataset.t});}));}});
/* 見積・請求の絞り込みは種類と状態の両方を見る */
const _docView=VIEWS.doc;VIEWS.doc=el=>{_docView(el);const chips=$$('[data-ch]',el);let cur='';const draw=()=>{const q=(el.querySelector('#q').value||'').trim();const r=DB.doc.slice().sort((a,b)=>String(b.issue).localeCompare(a.issue)).filter(d=>{const st=invStatus(d);if(cur==='見積'&&d.type!=='見積')return false;if(cur==='請求'&&d.type!=='請求')return false;if(cur==='入金待ち'&&!(d.type==='請求'&&['請求済','一部入金','期限超過'].includes(st)))return false;if(cur==='期限超過'&&st!=='期限超過')return false;if(cur==='入金済'&&st!=='入金済')return false;return !q||JSON.stringify(d).includes(q)||custName(d.custId).includes(q);});$('#lst',el).innerHTML=r.length?r.map(docItem).join(''):'<li class="empty">ありません</li>';bindItems($('#lst',el));};chips.forEach(b=>b.addEventListener('click',()=>{cur=b.dataset.ch;setTimeout(draw);}));el.querySelector('#q').addEventListener('input',()=>setTimeout(draw));draw();};
function openDoc(id,preset){
  const d=id?JSON.parse(JSON.stringify(get('doc',id))):Object.assign({type:'見積',issue:today(),lines:[],status:'作成中'},preset||{});
  if(!id){d.no=nextNo(d.type);d.due=d.due||addDays(today(),d.type==='見積'?30:30);}
  if(!d.lines.length)d.lines=[{name:'',qty:1,unit:'式',price:'',tax:10}];
  const isQ=d.type==='見積';
  const lineHTML=l=>`<div class="line" data-line>${fieldHTML({k:'name',label:'品目',type:'pick',master:'docItem'},l.name).replace('class="field','class="field l-name')}${fieldHTML({k:'qty',label:'数量',type:'number'},l.qty)}${fieldHTML({k:'unit',label:'単位',type:'pick',master:'unit'},l.unit)}${fieldHTML({k:'price',label:'単価（税抜）',type:'money'},l.price)}${fieldHTML({k:'tax',label:'税率',type:'pick',opts:()=>['10','8','0']},String(l.tax==null?10:l.tax))}<div class="l-ops"><button type="button" class="btn btn-s btn-del" data-rm>消す</button></div></div>`;
  const stOpts=isQ?()=>MASTER.quoteStatus:()=>['作成中','請求済'];
  const m=modal((isQ?'見積書':'請求書')+(id?'　'+d.no:'を作る'),`
    ${id?`<div class="row"><button class="btn btn-s" data-print>印刷・PDFで保存</button><button class="btn btn-s" data-mail>メールで送る</button>${isQ?'<button class="btn btn-s" data-toinv>請求書にする</button><button class="btn btn-s" data-toctr>契約書を作る</button>':'<button class="btn btn-s btn-main" data-rcv>入金を記録</button>'}<button class="btn btn-s" data-dup>複製</button></div>`:''}
    <div class="fgrid" data-head>${fieldHTML({k:'no',label:'番号'},d.no)}${fieldHTML({k:'status',label:'状態',type:'pick',opts:stOpts},d.status)}${fieldHTML({k:'custId',label:'宛先（顧客）',type:'ref',list:custList,req:1},d.custId)}${fieldHTML({k:'caseId',label:'対応',type:'ref',list:caseList,none:'（なし）'},d.caseId)}${fieldHTML({k:'title',label:'件名',full:1,req:1},d.title)}${fieldHTML({k:'issue',label:'発行日',type:'date'},d.issue)}${fieldHTML({k:'due',label:isQ?'有効期限':'お支払い期限',type:'date'},d.due)}</div>
    <div class="row"><h3 style="font-size:15px">明細</h3><span class="muted">税抜の単価を入れると、税率ごとに消費税を計算します。実費（非課税）は税率0にします。</span></div>
    <div class="lines" data-lines>${d.lines.map(lineHTML).join('')}</div><div><button class="btn btn-s" data-addline>＋ 行を追加</button></div>
    <div class="totals" data-totals></div>
    <div class="fgrid" data-foot>${fieldHTML({k:'note',label:'備考',type:'textarea',full:1},d.note)}</div>
    ${!isQ&&id?`<section><h3 style="font-size:15px;margin-bottom:6px">入金の記録</h3>${DB.rcv.filter(r=>r.docId===id).map(r=>`<div class="kv"><span>${dstr(r.date)}　${esc(r.method||'')}</span><b>${yen(r.amount)}</b></div>`).join('')||'<p class="muted">まだありません</p>'}</section>`:''}`,
    `${id?'<button class="btn btn-del" data-del>削除</button>':''}<span class="spacer"></span><button class="btn btn-main" data-save>保存する</button>`,{noFocus:1,wide:1});
  const lines=m.el.querySelector('[data-lines]');
  const readLines=()=>$$('[data-line]',lines).map(r=>{const o=readFields(r);o.tax=Number(o.tax||0);o.qty=o.qty===''?0:o.qty;o.price=o.price===''?0:o.price;return o;}).filter(l=>l.name||l.price);
  const calc=()=>{const c=docCalc({lines:readLines()});m.el.querySelector('[data-totals]').innerHTML=`<span>小計（税抜） ${yen(c.sub)}</span>${c.rates.map(r=>`<span class="muted">${r.r}%対象 ${yen(r.base)}　消費税 ${yen(r.tax)}</span>`).join('')}<b>合計（税込） ${yen(c.total)}</b>`;};
  const bindRm=()=>$$('[data-rm]',lines).forEach(b=>b.onclick=()=>{b.closest('[data-line]').remove();calc();});
  lines.addEventListener('input',calc);lines.addEventListener('change',calc);bindRm();calc();
  m.el.querySelector('[data-addline]').addEventListener('click',()=>{lines.insertAdjacentHTML('beforeend',lineHTML({qty:1,unit:'式',tax:10}));wireFields(lines.lastElementChild);bindRm();});
  const collect=()=>{const h=readFields(m.el.querySelector('[data-head]')),f=readFields(m.el.querySelector('[data-foot]'));Object.assign(d,h,f,{lines:readLines()});return d;};
  m.el.querySelector('[data-save]').addEventListener('click',()=>{collect();if(!d.custId||!d.title){toast('宛先と件名を入れてください');return;}const s=save('doc',d);m.close();refresh();toast('保存しました');if(!id)openDoc(s.id);});
  const del=m.el.querySelector('[data-del]');if(del)confirmBtn(del,'削除',()=>{removeRec('doc',id);m.close();refresh();});
  const on=(sel,fn)=>{const b=m.el.querySelector(sel);if(b)b.addEventListener('click',fn);};
  on('[data-print]',()=>{collect();save('doc',d);printDoc(d);});
  on('[data-dup]',()=>{collect();const c=JSON.parse(JSON.stringify(d));delete c.id;c.no=nextNo(c.type);c.issue=today();c.status='作成中';delete c.fromId;m.close();openDoc(null,c);});
  on('[data-toinv]',()=>{collect();d.status='受注';save('doc',d);const c=JSON.parse(JSON.stringify(d));delete c.id;c.type='請求';c.no=nextNo('請求');c.issue=today();c.due=addDays(today(),30);c.status='作成中';c.fromId=d.id;m.close();openDoc(null,c);toast('見積から請求書を作りました。確かめて保存してください');});
  on('[data-toctr]',()=>{collect();save('doc',d);m.close();openCtr(null,{custId:d.custId,caseId:d.caseId,docId:d.id,title:d.title,amount:yen(docCalc(d).total)+'（税込）'});});
  on('[data-rcv]',()=>{collect();save('doc',d);m.close();openRcv(null,{docId:d.id,date:today(),amount:docCalc(d).total-paidOf(d.id),method:'銀行振込'});});
  on('[data-mail]',()=>{collect();save('doc',d);const c=get('cust',d.custId)||{};const tot=docCalc(d).total;m.close();openMail({to:c.mail||'',subject:`【${OFFICE.name}】${d.type==='見積'?'お見積り':'ご請求'}のご案内（${d.no}）`,body:`${c.company?c.company+'\n':''}${c.name||''} 様\n\nいつもお世話になっております。\n${OFFICE.name}の松宮でございます。\n\n${d.title}について、${d.type==='見積'?'お見積書':'ご請求書'}をお送りいたします。\n\n・番号：${d.no}\n・金額：${yen(tot)}（税込）\n・${d.type==='見積'?'有効期限':'お支払い期限'}：${dstr(d.due)}\n${d.type==='請求'&&OFFICE.bank?'・お振込先：'+OFFICE.bank+'\n':''}\n書類はPDFで添付しております。ご確認のほど、よろしくお願いいたします。\n\n${sign()}`,onDone:(o,via)=>{if(d.type==='請求'&&d.status==='作成中'){d.status='請求済';save('doc',d);}if(d.type==='見積'&&d.status==='作成中'){d.status='提出済';save('doc',d);}if(d.caseId){const k=get('case',d.caseId);if(k){k.log=k.log||[];k.log.unshift({at:nowStr(),kind:d.type==='見積'?'見積':'請求',by:ME.name,text:d.type+'書 '+d.no+' を送付（'+via+'）'});save('case',k);}}refresh();}});});
}
function printDoc(d){
  const c=get('cust',d.custId)||{},calc=docCalc(d),isQ=d.type==='見積';
  const html=`<div class="paper print-area"><h1>${isQ?'御見積書':'御請求書'}</h1>
  <div class="hd"><div><p class="to">${esc(c.company||c.name||'')} ${c.company?'御中':'様'}</p>${c.company&&c.name?`<p>${esc(c.name)} 様</p>`:''}<p style="margin-top:10px">${isQ?'下記のとおりお見積り申し上げます。':'下記のとおりご請求申し上げます。'}</p><p style="margin-top:10px">件名：${esc(d.title)}</p><p style="margin-top:8px">合計金額（税込）　<span class="big">${yen(calc.total)}</span></p><p style="margin-top:6px">${isQ?'有効期限':'お支払い期限'}：${dstr(d.due)}</p></div>
  <div class="from"><p>番号：${esc(d.no)}</p><p>発行日：${dstr(d.issue)}</p><p style="margin-top:10px;font-weight:700">${esc(OFFICE.name)}</p><p>${esc(OFFICE.rep)}</p><p>〒${esc(OFFICE.zip)} ${esc(OFFICE.addr)}</p><p>電話 ${esc(OFFICE.tel)}</p>${OFFICE.regNo?`<p>登録番号：${esc(OFFICE.regNo)}</p>`:''}</div></div>
  <table><thead><tr><th>品目</th><th style="width:60px">数量</th><th style="width:50px">単位</th><th style="width:100px">単価</th><th style="width:110px">金額</th><th style="width:50px">税率</th></tr></thead><tbody>${d.lines.map(l=>`<tr><td>${esc(l.name)}</td><td class="r">${esc(l.qty)}</td><td>${esc(l.unit)}</td><td class="r">${Number(l.price||0).toLocaleString('ja-JP')}</td><td class="r">${Math.round((l.qty||0)*(l.price||0)).toLocaleString('ja-JP')}</td><td class="r">${l.tax==0?'非課税':l.tax+'%'}</td></tr>`).join('')}</tbody></table>
  <table style="width:60%;margin:10px 0 0 auto"><tbody><tr><th>小計（税抜）</th><td class="r">${yen(calc.sub)}</td></tr>${calc.rates.filter(r=>r.r>0).map(r=>`<tr><th>${r.r}%対象（消費税）</th><td class="r">${yen(r.base)}（${yen(r.tax)}）</td></tr>`).join('')}${calc.rates.filter(r=>r.r===0).map(r=>`<tr><th>非課税（実費）</th><td class="r">${yen(r.base)}</td></tr>`).join('')}<tr><th>合計（税込）</th><td class="r"><b>${yen(calc.total)}</b></td></tr></tbody></table>
  ${!isQ&&OFFICE.bank?`<p style="margin-top:14px"><b>お振込先：</b>${esc(OFFICE.bank)}</p>`:''}${d.note||(!isQ&&OFFICE.invoiceNote)?`<p style="margin-top:10px;white-space:pre-wrap">${esc([d.note,!isQ?OFFICE.invoiceNote:''].filter(Boolean).join('\n'))}</p>`:''}</div>`;
  const m=modal((isQ?'見積書':'請求書')+'の印刷',html,`<span class="note">「印刷する」から、PDFで保存もできます。${OFFICE.regNo?'':'適格請求書にするには、設定で登録番号を入れてください。'}</span><span class="spacer"></span><button class="btn btn-main" data-p>印刷する</button>`,{wide:1,noFocus:1});
  m.el.querySelector('[data-p]').addEventListener('click',()=>{try{window.print();}catch(e){toast('この画面では印刷できません。確認用アドレスで開いてください');}});
}

/* ---------- 入金 ---------- */
const invList=()=>DB.doc.filter(d=>d.type==='請求').map(d=>({id:d.id,label:d.no+'　'+custName(d.custId)+'　'+yen(docCalc(d).total)+'（'+invStatus(d)+'）'}));
const RCV_F=[{k:'date',label:'入金日',type:'date',req:1},{k:'amount',label:'入金額',type:'money',req:1},{k:'docId',label:'請求書',type:'ref',list:invList,none:'（請求書なし）',full:1},{k:'method',label:'方法',type:'pick',master:'payMethod'},{k:'payer',label:'振込名義など'},{k:'memo',label:'メモ',type:'textarea',full:1}];
function rcvItem(r){const d=get('doc',r.docId);return `<li><button class="item" data-open="rcv:${esc(r.id)}"><span class="item-top"><span class="meta">${dstr(r.date)}</span>${tag(r.method||'入金','t-biz')}<span class="amt">${yen(r.amount)}</span></span><b>${esc(d?custName(d.custId):(r.payer||'（請求書なし）'))}</b><span class="meta">${d?esc(d.no+'　'+d.title):''}</span></button></li>`;}
const openRcv=(id,preset)=>editRec('rcv',id,RCV_F,'入金',preset,r=>{const d=r.docId&&get('doc',r.docId);if(d&&d.status==='作成中'){d.status='請求済';save('doc',d);}if(d&&d.caseId){const k=get('case',d.caseId);if(k){k.log=k.log||[];k.log.unshift({at:nowStr(),kind:'入金確認',by:ME.name,text:d.no+' 入金 '+yen(r.amount)});save('case',k);}}refresh();});
VIEWS.rcv=el=>{
  const ym=today().slice(0,7);const sum=DB.rcv.filter(r=>String(r.date).slice(0,7)===ym).reduce((s,r)=>s+(Number(r.amount)||0),0);
  const waits=DB.doc.filter(d=>d.type==='請求'&&['請求済','一部入金','期限超過'].includes(invStatus(d)));
  listView(el,{search:'名義・番号で探す',items:()=>DB.rcv.slice().sort((a,b)=>String(b.date).localeCompare(a.date)),item:rcvItem,addLabel:'入金を記録',onAdd:()=>openRcv(null,{date:today(),method:'銀行振込'}),extra:`<div class="grid2"><div class="card"><span class="muted">今月の入金</span><b style="display:block;font-size:22px">${yen(sum)}</b></div><div class="card"><span class="muted">入金待ちの請求</span><b style="display:block;font-size:22px">${waits.length}件　${yen(waits.reduce((s,d)=>s+docCalc(d).total-paidOf(d.id),0))}</b></div></div>${waits.length?`<section class="card"><h2>入金待ち</h2><ul class="list">${waits.map(docItem).join('')}</ul></section>`:''}`,empty:'入金の記録はまだありません'});
};

/* ---------- 支払い ---------- */
const EXP_F=[{k:'date',label:'日付',type:'date',req:1},{k:'status',label:'状態',type:'pick',master:'expStatus'},{k:'kind',label:'科目',type:'pick',master:'expKind'},{k:'amount',label:'金額（税込）',type:'money',req:1},{k:'payee',label:'支払先',full:1},{k:'item',label:'内容',full:1},{k:'method',label:'支払い方法',type:'pick',master:'payMethod'},{k:'due',label:'支払期限（予定のとき）',type:'date'},{k:'caseId',label:'対応（立替の場合）',type:'ref',list:caseList,none:'（なし）',full:1},{k:'memo',label:'メモ',type:'textarea',full:1}];
function expItem(x){return `<li><button class="item" data-open="exp:${esc(x.id)}"><span class="item-top"><span class="meta">${dstr(x.date)}</span>${tag(x.status||'支払済',x.status==='支払予定'?'t-mid':'t-done')}${x.kind?tag(x.kind,'t-gold'):''}${x.sample?tag('見本','t-done'):''}<span class="amt">${yen(x.amount)}</span></span><b>${esc(x.payee||'')}</b><span class="meta">${esc(x.item||'')}${x.method?'　'+esc(x.method):''}</span></button></li>`;}
const openExp=(id,preset)=>editRec('exp',id,EXP_F,'支払い',preset||{date:today(),status:'支払済'});
VIEWS.exp=el=>{
  const ym=today().slice(0,7);const mon=DB.exp.filter(x=>String(x.date).slice(0,7)===ym);const byK={};mon.forEach(x=>byK[x.kind||'その他']=(byK[x.kind||'その他']||0)+(Number(x.amount)||0));
  const plan=DB.exp.filter(x=>x.status==='支払予定');
  listView(el,{search:'支払先・内容で探す',chips:MASTER.expKind,chipKey:x=>x.kind,items:()=>DB.exp.slice().sort((a,b)=>String(b.date).localeCompare(a.date)),item:expItem,addLabel:'支払いを記録',onAdd:()=>openExp(null),extra:`<div class="grid2"><div class="card"><h2>今月の支払い<small>${ym.replace('-','年')}月</small></h2>${Object.keys(byK).map(k=>`<div class="kv"><span>${esc(k)}</span><b>${yen(byK[k])}</b></div>`).join('')||'<p class="muted">ありません</p>'}<div class="kv"><span>合計</span><b>${yen(mon.reduce((s,x)=>s+(Number(x.amount)||0),0))}</b></div></div><div class="card"><h2>支払い予定</h2>${plan.map(x=>`<div class="kv"><span>${dstr(x.due||x.date)}　${esc(x.payee||'')}</span><b>${yen(x.amount)}</b></div>`).join('')||'<p class="muted">ありません</p>'}</div></div>`});
};

/* ---------- 契約書・電子契約 ---------- */
function ctrItem(c){return `<li><button class="item" data-open="ctr:${esc(c.id)}"><span class="item-top">${tag(c.status)}<span class="meta">${esc(c.no||'')}</span>${c.sample?tag('見本','t-done'):''}</span><b>${esc(c.title||'')}</b><span class="sub">${esc(custName(c.custId))}</span><span class="meta">${c.status==='締結'?'締結 '+esc(c.signedAt||''):c.sentAt?'送付 '+esc(c.sentAt):'作成 '+esc(c.created||'')}</span></button></li>`;}
VIEWS.ctr=el=>listView(el,{search:'件名・顧客で探す',chips:MASTER.ctrStatus,chipKey:x=>x.status,items:()=>DB.ctr.slice().sort((a,b)=>String(b.updatedAt||b.created).localeCompare(a.updatedAt||a.created)),item:ctrItem,addLabel:'契約書を作る',onAdd:()=>openCtr(null,{}),empty:'契約書はまだありません。「契約書を作る」から、ひな形を選んで作れます'});
function fillTpl(body,c){
  const cu=get('cust',c.custId)||{};const map={'顧客名':cu.company?cu.company+'（代表 '+(cu.title?cu.title+' ':'')+cu.name+'）':(cu.name||'〇〇'),'顧客住所':cu.addr||'〇〇','件名':c.title||'〇〇','金額':c.amount||'〇〇円（税込）','期間':c.period||'〇ヶ月間','開始日':c.start?dstr(c.start):'〇年〇月〇日','日付':dstr(today()),'事務所名':OFFICE.name,'事務所住所':OFFICE.addr,'行政書士名':OFFICE.rep};
  return String(body).replace(/\{\{(.+?)\}\}/g,(_,k)=>map[k]!=null?map[k]:'〇〇');
}
const SIGN_BASE=()=>location.href.replace(/admin\.html.*$/,'').replace(/#.*$/,'')+'sign.html#c-';
async function sha256(t){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}catch(e){let h=0;for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return 'x'+(h>>>0).toString(16);}}
function openCtr(id,preset){
  const c=id?JSON.parse(JSON.stringify(get('ctr',id))):Object.assign({status:'下書き',tpl:TPL[0].name,created:nowStr(),log:[]},preset||{});
  if(!id){c.no=nextCtrNo();c.body=fillTpl((TPL.find(t=>t.name===c.tpl)||TPL[0]).body,c);}
  const locked=c.status==='締結';
  const m=modal('契約書'+(id?'　'+c.no:'を作る'),`
    ${id?`<div class="row">${tag(c.status)}<span class="spacer"></span><button class="btn btn-s" data-print>印刷・PDF</button>${locked?'':'<button class="btn btn-s btn-main" data-send>電子契約で送る</button>'}${c.token&&!locked?'<button class="btn btn-s" data-link>署名ページのリンクを写す</button>':''}</div>`:''}
    ${locked?`<div class="card" style="background:var(--green-p)"><h2>締結済み</h2><dl class="dl">${[['締結日時',c.signedAt],['署名者',c.signer&&c.signer.name],['会社名・役職',c.signer&&[c.signer.company,c.signer.title].filter(Boolean).join(' ')],['住所',c.signer&&c.signer.addr],['メール',c.signer&&c.signer.mail],['同意の記録',c.signer&&c.signer.agreeAt],['確認番号',c.hash]].filter(r=>r[1]).map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl><p class="note" style="margin-top:6px">確認番号は締結した本文から作った値です。本文が1文字でも変わると番号が変わります。</p></div>`:''}
    <div class="fgrid" data-head>${fieldHTML({k:'custId',label:'相手方（顧客）',type:'ref',list:custList,req:1},c.custId)}${fieldHTML({k:'caseId',label:'対応',type:'ref',list:caseList,none:'（なし）'},c.caseId)}${fieldHTML({k:'tpl',label:'ひな形',type:'pick',opts:()=>TPL.map(t=>t.name)},c.tpl)}${fieldHTML({k:'title',label:'件名',req:1},c.title)}${fieldHTML({k:'amount',label:'金額',ph:'例）月額150,000円（税込）'},c.amount)}${fieldHTML({k:'period',label:'期間',ph:'例）6ヶ月間'},c.period)}${fieldHTML({k:'start',label:'開始日',type:'date'},c.start)}${fieldHTML({k:'status',label:'状態',type:'pick',master:'ctrStatus'},c.status)}</div>
    ${locked?'':'<div class="row"><button class="btn btn-s" data-refill>上の内容でひな形から作り直す</button><button class="btn btn-s" data-aic>AIに条文を点検してもらう</button></div><div class="check-out" data-out hidden></div>'}
    <div class="fgrid" data-bodyf>${fieldHTML({k:'body',label:'本文（自由に直せます。〇〇の箇所を埋めてください）',type:'textarea',rows:18,full:1},c.body)}</div>
    <p class="note">ひな形は一般的な例です。使う前に、内容が依頼の実態と合っているか、先生が必ず確認してください。</p>
    ${(c.log||[]).length?`<section><h3 style="font-size:15px">記録</h3>${c.log.map(l=>`<div class="kv"><span>${esc(l.at)}</span><b style="font-weight:400">${esc(l.text)}</b></div>`).join('')}</section>`:''}`,
    `${id?'<button class="btn btn-del" data-del>削除</button>':''}<span class="spacer"></span><button class="btn btn-main" data-save>保存する</button>`,{noFocus:1,wide:1});
  if(locked)$$('input,select,textarea',m.el.querySelector('.modal-body')).forEach(i=>i.disabled=true);
  const collect=()=>{if(locked)return c;Object.assign(c,readFields(m.el.querySelector('[data-head]')),readFields(m.el.querySelector('[data-bodyf]')));return c;};
  const on=(sel,fn)=>{const b=m.el.querySelector(sel);if(b)b.addEventListener('click',fn);};
  on('[data-save]',()=>{collect();if(!c.custId||!c.title){toast('相手方と件名を入れてください');return;}const s=save('ctr',c);m.close();refresh();toast('保存しました');if(!id)openCtr(s.id);});
  on('[data-refill]',()=>{collect();const t=TPL.find(x=>x.name===c.tpl);if(!t){toast('ひな形が見つかりません');return;}m.el.querySelector('[data-bodyf] textarea').value=fillTpl(t.body,c);toast('作り直しました');});
  on('[data-aic]',e=>busy(e.target,async()=>{collect();const t=await ai('あなたは行政書士事務所の契約書点検の補助者です。次の契約書の下書きについて、(1)埋め忘れ（〇〇）、(2)金額・期間・当事者名の不整合、(3)条文の抜けや矛盾、(4)行政書士の業務範囲を超える約束、(5)相手方に不利すぎる条項、の観点で、問題点を1行ずつ挙げてください。法的判断の最終確認は行政書士が行う前提で、断定せず指摘だけしてください。\n\n'+c.body);const o=m.el.querySelector('[data-out]');o.textContent=String(t).trim();o.hidden=false;}));
  const del=m.el.querySelector('[data-del]');if(del)confirmBtn(del,'削除',()=>{removeRec('ctr',id);m.close();refresh();});
  on('[data-print]',()=>{collect();printCtr(c);});
  on('[data-link]',()=>copy(SIGN_BASE()+c.token));
  on('[data-send]',async()=>{collect();if(!c.custId){toast('相手方を選んでください');return;}if(/〇〇/.test(c.body)){toast('本文に〇〇が残っています。埋めてから送ってください');return;}
    c.token=c.token||(uid('')+uid(''));c.hashSent=await sha256(c.body);save('ctr',c);
    const cu=get('cust',c.custId)||{};const link=SIGN_BASE()+c.token;m.close();
    openMail({to:cu.mail||'',subject:`【${OFFICE.name}】契約書のご確認とご署名のお願い（${c.no}）`,body:`${cu.company?cu.company+'\n':''}${cu.name||''} 様\n\nいつもお世話になっております。\n${OFFICE.name}の松宮でございます。\n\n「${c.title}」の契約書をお送りいたします。\n下記のリンクから内容をご確認のうえ、必要事項のご記入とご署名（押印）をお願いいたします。\nログインや登録は必要ありません。\n\n${link}\n\nご不明な点がございましたら、ご署名の前にお気軽にお問い合わせください。\n\n${sign()}`,onDone:(o,via)=>{c.status='送付済';c.sentAt=nowStr();c.log=c.log||[];c.log.unshift({at:nowStr(),text:'電子契約を送付（'+via+'）宛先 '+o.to});save('ctr',c);if(c.caseId){const k=get('case',c.caseId);if(k){k.log=k.log||[];k.log.unshift({at:nowStr(),kind:'その他',by:ME.name,text:'契約書 '+c.no+' を電子契約で送付'});save('case',k);}}refresh();}});});
}
function sealHTML(n,size){n=String(n||'').trim();let a,b;const sp=n.split(/[\s　]+/).filter(Boolean);if(sp.length>=2){a=sp[0];b=sp.slice(1).join('');}else{const t=n.replace(/\s/g,'');a=t.slice(0,Math.ceil(t.length/2));b=t.slice(Math.ceil(t.length/2));}a=a.slice(0,3);b=b.slice(0,3);const L=Math.max(a.length,b.length,1);const fs=Math.round(size*(L>=3?0.24:L===2?0.3:0.42));return `<span class="seal" style="width:${size}px;height:${size}px;font-size:${fs}px"><span>${esc(a)}</span>${b?`<span>${esc(b)}</span>`:''}</span>`;}
function printCtr(c){
  const m=modal('契約書の印刷',`<div class="paper print-area"><div class="ctr-body">${esc(c.body)}</div>${c.status==='締結'?`<div style="margin-top:18px;border-top:1px solid #999;padding-top:10px;display:flex;gap:16px;align-items:center">${sealHTML(c.signer&&c.signer.name,64)}<div style="font-size:12px">電子契約により締結<br>締結日時：${esc(c.signedAt)}<br>署名者：${esc(c.signer&&c.signer.name)}<br>確認番号：${esc(c.hash)}</div></div>`:''}</div>`,`<span class="spacer"></span><button class="btn btn-main" data-p>印刷する</button>`,{wide:1,noFocus:1});
  m.el.querySelector('[data-p]').addEventListener('click',()=>{try{window.print();}catch(e){toast('この画面では印刷できません');}});
}

/* ---------- サイトの内容 ---------- */
VIEWS.site=el=>{
  const info=KT.site('info'),news=KT.site('news'),fees=KT.site('fees'),terms=KT.site('terms');
  el.innerHTML=`<div class="chips" role="tablist"><button class="chip" aria-pressed="true" data-st="news">お知らせ</button><button class="chip" aria-pressed="false" data-st="fees">料金</button><button class="chip" aria-pressed="false" data-st="info">連絡先</button><button class="chip" aria-pressed="false" data-st="terms">支払い・解約</button></div>
  <div data-sp="news"><div class="row"><span class="note">新しい順に、トップに4件、お知らせページに全件出ます。</span><span class="spacer"></span><button class="btn btn-main" data-nadd>＋ お知らせを追加</button></div><ul class="list" style="margin-top:10px">${news.map((n,i)=>`<li><button class="item" data-ni="${i}"><span class="item-top"><span class="meta">${dstr(n.d)}</span>${tag(n.l,'t-gold')}</span><b style="font-weight:500">${esc(n.t)}</b></button></li>`).join('')}</ul></div>
  <div data-sp="fees" hidden>${['biz','per'].map(g=>`<section class="card" style="margin-bottom:12px"><h2>${g==='biz'?'経営者のご相談':'個人のご相談'}</h2><div class="lines" data-fg="${g}">${fees[g].map(r=>feeLine(r)).join('')}</div><button class="btn btn-s" style="margin-top:8px" data-fadd="${g}">＋ 項目を追加</button></section>`).join('')}<div class="row"><span class="spacer"></span><button class="btn" data-freset>初期の料金に戻す</button><button class="btn btn-main" data-fsave>料金を登録する</button></div></div>
  <div data-sp="info" hidden><div class="card"><div class="fgrid" data-if>${fieldHTML({k:'tel',label:'電話番号',type:'tel'},info.tel)}${fieldHTML({k:'hours',label:'電話の受付時間'},info.hours)}${fieldHTML({k:'mail',label:'メールアドレス',type:'email',full:1},info.mail)}</div><div class="row" style="margin-top:10px"><span class="spacer"></span><button class="btn btn-main" data-isave>登録する</button></div></div></div>
  <div data-sp="terms" hidden><div class="card"><div class="form" data-tf><div class="field" data-k="pay" data-t="multi" data-m=""><span class="lbl">お支払い方法</span><div class="multi">${MASTER.payMethod.concat(terms.pay.filter(p=>!MASTER.payMethod.includes(p))).map(p=>`<label><input type="checkbox" value="${esc(p)}"${terms.pay.includes(p)?' checked':''}><span>${esc(p)}</span></label>`).join('')}</div></div><div class="fgrid">${[['payOther','そのほかのお支払い方法'],['payNote','お支払いの補足']].map(([k,l])=>fieldHTML({k,label:l,full:1},terms[k])).join('')}${[['payTiming','お支払い時期'],['coolingOff','お申込みの取消し（独自の制度）'],['cancel','中途解約・返金'],['delivery','提供の時期'],['defect','提供内容の不備'],['extraFees','商品代以外の費用']].map(([k,l])=>fieldHTML({k,label:l,type:'textarea',full:1},terms[k])).join('')}</div></div><div class="row" style="margin-top:10px"><span class="spacer"></span><button class="btn btn-main" data-tsave>登録する</button></div></div></div>`;
  wireFields(el);
  $$('[data-st]',el).forEach(b=>b.addEventListener('click',()=>{$$('[data-st]',el).forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));$$('[data-sp]',el).forEach(p=>p.hidden=p.dataset.sp!==b.dataset.st);}));
  const editNews=i=>{const n=i==null?{d:today(),l:'ご案内',t:''}:news[i];const m=modal(i==null?'お知らせを追加':'お知らせを直す',`<div class="fgrid">${fieldHTML({k:'d',label:'日付',type:'date',req:1},n.d)}${fieldHTML({k:'l',label:'種類',type:'pick',opts:()=>['ご案内','相談会','セミナー','講演','重要']},n.l)}${fieldHTML({k:'t',label:'内容',type:'textarea',req:1,full:1},n.t)}</div>`,`${i!=null?'<button class="btn btn-del" data-del>削除</button>':''}<span class="spacer"></span><button class="btn btn-main" data-save>保存する</button>`);
    m.el.querySelector('[data-save]').addEventListener('click',()=>{const o=readFields(m.el.querySelector('.fgrid'));if(!o.d||!o.t){toast('日付と内容を入れてください');return;}const a=news.slice();if(i==null)a.push(o);else a[i]=o;saveConf('news',a);m.close();refresh();toast('保存しました');});
    const d=m.el.querySelector('[data-del]');if(d)confirmBtn(d,'削除',()=>{const a=news.slice();a.splice(i,1);saveConf('news',a);m.close();refresh();});};
  el.querySelector('[data-nadd]').addEventListener('click',()=>editNews(null));
  $$('[data-ni]',el).forEach(b=>b.addEventListener('click',()=>editNews(+b.dataset.ni)));
  const bindF=()=>$$('[data-frm]',el).forEach(b=>b.onclick=()=>b.closest('[data-line]').remove());bindF();
  $$('[data-fadd]',el).forEach(b=>b.addEventListener('click',()=>{const box=el.querySelector(`[data-fg="${b.dataset.fadd}"]`);box.insertAdjacentHTML('beforeend',feeLine({}));wireFields(box.lastElementChild);bindF();}));
  el.querySelector('[data-fsave]').addEventListener('click',()=>{const o={};['biz','per'].forEach(g=>o[g]=$$('[data-line]',el.querySelector(`[data-fg="${g}"]`)).map(r=>readFields(r)).filter(r=>r.n||r.p));saveConf('fees',o);toast('料金を登録しました');});
  el.querySelector('[data-freset]').addEventListener('click',()=>{saveConf('fees',JSON.parse(JSON.stringify(KT.DEF.fees)));refresh();toast('初期の料金に戻しました');});
  el.querySelector('[data-isave]').addEventListener('click',()=>{const o=readFields(el.querySelector('[data-if]'));if(!o.tel||!o.hours||!o.mail){toast('3つとも入れてください');return;}saveConf('info',o);toast('登録しました');});
  el.querySelector('[data-tsave]').addEventListener('click',()=>{const o=readFields(el.querySelector('[data-tf]'));saveConf('terms',o);toast('登録しました');});
};
const feeLine=r=>`<div class="line line-fee" data-line>${fieldHTML({k:'n',label:'項目名'},r.n)}${fieldHTML({k:'note',label:'補足'},r.note)}${fieldHTML({k:'p',label:'価格'},r.p)}${fieldHTML({k:'ps',label:'価格の補足'},r.ps)}<div class="l-ops"><button type="button" class="btn btn-s btn-del" data-frm>消す</button></div></div>`;

/* ---------- 設定 ---------- */
VIEWS.set=el=>{
  el.innerHTML=`
  <section class="card"><h2>保存先<small>${REMOTE?'Googleスプレッドシートにつながっています':'今はこの端末のブラウザに保存しています'}</small></h2>
    ${REMOTE?'':'<p class="warn">確認用の状態です。データはこの端末のブラウザにだけ保存され、ほかの端末からは見えません。設置手順に沿ってGoogleスプレッドシートを用意し、下にアドレスを入れると切り替わります。</p>'}
    <div class="fgrid" style="margin-top:10px">${fieldHTML({k:'api',label:'保存先のアドレス（Apps Script）',type:'text',full:1,ph:'https://script.google.com/macros/s/…/exec'},getJ('kt-api-url',''))}</div>
    <div class="row" style="margin-top:8px"><span class="spacer"></span><button class="btn btn-main" data-api>登録して切り替える</button></div></section>
  <section class="card"><h2>事務所の情報<small>見積書・請求書・契約書に使います</small></h2><div class="fgrid" data-of>${[['name','事務所名'],['rep','代表者の表示'],['zip','郵便番号'],['tel','電話'],['addr','住所',1],['mail','メール'],['regNo','適格請求書の登録番号（T＋13桁）'],['bank','お振込先',1],['invoiceNote','請求書の備考（毎回）',1]].map(([k,l,f])=>fieldHTML({k,label:l,full:f},OFFICE[k])).join('')}${fieldHTML({k:'signText',label:'メールの署名（空なら自動）',type:'textarea',rows:6,full:1},OFFICE.signText)}</div><div class="row" style="margin-top:8px"><span class="spacer"></span><button class="btn btn-main" data-office>登録する</button></div></section>
  <section class="card"><h2>担当者<small>予定・日報・対応の担当に出ます</small></h2><div class="master-list" data-staff>${STAFF.map(s=>`<div class="master-row"><input value="${esc(s.name)}" aria-label="担当者名"><input value="${esc(s.role||'')}" aria-label="役割" placeholder="役割"><button class="btn btn-s btn-del" data-rm>消す</button></div>`).join('')}</div><div class="row" style="margin-top:8px"><button class="btn btn-s" data-staffadd>＋ 担当者を追加</button><span class="spacer"></span><button class="btn btn-main" data-staffsave>登録する</button></div>${REMOTE?'<p class="note">ログインの合言葉は、スプレッドシートの「担当者」シートで管理します。</p>':''}</section>
  <section class="card"><h2>選択肢の管理<small>入力欄で選べる項目を、追加・修正・削除・並べ替えできます</small></h2><div class="field"><label for="mk">直す選択肢</label><select id="mk">${Object.keys(MASTER_NAMES).map(k=>`<option value="${k}">${esc(MASTER_NAMES[k])}</option>`).join('')}</select></div><div class="master-list" data-ml style="margin-top:10px"></div><div class="row" style="margin-top:8px"><button class="btn btn-s" data-madd>＋ 追加</button><button class="btn btn-s" data-mreset>初期に戻す</button><span class="spacer"></span><button class="btn btn-main" data-msave>登録する</button></div></section>
  <section class="card"><h2>契約書のひな形<small>追加・修正・削除できます。{{顧客名}}などの差し込み記号が使えます</small></h2><ul class="list">${TPL.map((t,i)=>`<li><button class="item" data-tpl="${i}"><b>${esc(t.name)}</b><span class="meta">${esc(t.body.length)}文字</span></button></li>`).join('')}</ul><div class="row" style="margin-top:8px"><button class="btn btn-s" data-tpladd>＋ ひな形を追加</button><span class="spacer"></span><button class="btn btn-s" data-tplreset>初期のひな形に戻す</button></div><p class="note" style="margin-top:6px">使える差し込み記号：{{顧客名}} {{顧客住所}} {{件名}} {{金額}} {{期間}} {{開始日}} {{日付}} {{事務所名}} {{事務所住所}} {{行政書士名}}</p></section>
  <section class="card"><h2>データの控え</h2><div class="row"><button class="btn btn-s" data-exp>全部を書き出して写す</button><button class="btn btn-s" data-csv>顧客を表計算用に写す</button><button class="btn btn-s" data-csv2>見積・請求を表計算用に写す</button></div><div class="field" style="margin-top:8px"><label for="ta">控えの文字（読み込むときはここに貼り付けます）</label><textarea id="ta" rows="4"></textarea></div><div class="row" style="margin-top:8px"><button class="btn btn-s" data-imp>貼り付けた控えを読み込む</button><span class="spacer"></span>${REMOTE?'':'<button class="btn btn-s btn-del" data-clr>見本のデータを消す</button>'}</div></section>`;
  wireFields(el);
  const on=(s,f)=>{const b=el.querySelector(s);if(b)b.addEventListener('click',f);};
  on('[data-api]',()=>{const v=el.querySelector('[data-k="api"] input').value.trim();if(v&&!/^https:\/\//.test(v)){toast('https:// で始まるアドレスを入れてください');return;}setJ('kt-api-url',v);setJ('kt-token','');location.reload();});
  on('[data-office]',()=>{Object.assign(OFFICE,readFields(el.querySelector('[data-of]')));saveConf('office',OFFICE);toast('登録しました');});
  const sbox=el.querySelector('[data-staff]');const bindS=()=>$$('[data-rm]',sbox).forEach(b=>b.onclick=()=>b.closest('.master-row').remove());bindS();
  on('[data-staffadd]',()=>{sbox.insertAdjacentHTML('beforeend','<div class="master-row"><input aria-label="担当者名" placeholder="名前"><input aria-label="役割" placeholder="役割"><button class="btn btn-s btn-del" data-rm>消す</button></div>');bindS();});
  on('[data-staffsave]',()=>{STAFF=$$('.master-row',sbox).map((r,i)=>{const [n,ro]=$$('input',r).map(x=>x.value.trim());return {id:(STAFF[i]&&STAFF[i].id)||uid('s'),name:n,role:ro};}).filter(s=>s.name);saveConf('staff',STAFF);toast('登録しました');});
  const ml=el.querySelector('[data-ml]'),mk=el.querySelector('#mk');
  const drawM=()=>{ml.innerHTML=(MASTER[mk.value]||[]).map(v=>`<div class="master-row"><input value="${esc(v)}" aria-label="選択肢"><button class="btn btn-s" data-up aria-label="上へ">↑</button><button class="btn btn-s" data-dn aria-label="下へ">↓</button><button class="btn btn-s btn-del" data-rm>消す</button></div>`).join('');bindM();};
  const bindM=()=>{$$('[data-rm]',ml).forEach(b=>b.onclick=()=>b.closest('.master-row').remove());$$('[data-up]',ml).forEach(b=>b.onclick=()=>{const r=b.closest('.master-row');if(r.previousElementSibling)ml.insertBefore(r,r.previousElementSibling);});$$('[data-dn]',ml).forEach(b=>b.onclick=()=>{const r=b.closest('.master-row');if(r.nextElementSibling)ml.insertBefore(r.nextElementSibling,r);});};
  mk.addEventListener('change',drawM);drawM();
  on('[data-madd]',()=>{ml.insertAdjacentHTML('beforeend','<div class="master-row"><input aria-label="選択肢" placeholder="新しい選択肢"><button class="btn btn-s" data-up aria-label="上へ">↑</button><button class="btn btn-s" data-dn aria-label="下へ">↓</button><button class="btn btn-s btn-del" data-rm>消す</button></div>');bindM();ml.lastElementChild.querySelector('input').focus();});
  on('[data-mreset]',()=>{MASTER[mk.value]=MASTER_DEF[mk.value].slice();drawM();toast('初期に戻しました。「登録する」で確定します');});
  on('[data-msave]',()=>{MASTER[mk.value]=$$('input',ml).map(i=>i.value.trim()).filter(Boolean);saveConf('master',pickMaster());toast('「'+MASTER_NAMES[mk.value]+'」を登録しました');});
  const editTpl=i=>{const t=i==null?{name:'',body:''}:TPL[i];const m=modal(i==null?'ひな形を追加':'ひな形を直す',`<div class="fgrid">${fieldHTML({k:'name',label:'名前',req:1,full:1},t.name)}${fieldHTML({k:'body',label:'本文',type:'textarea',rows:20,full:1},t.body)}</div>`,`${i!=null?'<button class="btn btn-del" data-del>削除</button>':''}<span class="spacer"></span><button class="btn btn-main" data-save>保存する</button>`,{wide:1});
    m.el.querySelector('[data-save]').addEventListener('click',()=>{const o=readFields(m.el.querySelector('.fgrid'));if(!o.name){toast('名前を入れてください');return;}TPL=TPL.slice();if(i==null)TPL.push(o);else TPL[i]=o;saveConf('ctrTpl',TPL);m.close();refresh();toast('保存しました');});
    const d=m.el.querySelector('[data-del]');if(d)confirmBtn(d,'削除',()=>{TPL=TPL.slice();TPL.splice(i,1);saveConf('ctrTpl',TPL);m.close();refresh();});};
  $$('[data-tpl]',el).forEach(b=>b.addEventListener('click',()=>editTpl(+b.dataset.tpl)));
  on('[data-tpladd]',()=>editTpl(null));
  on('[data-tplreset]',()=>{TPL=JSON.parse(JSON.stringify(CTR_TPL_DEF));saveConf('ctrTpl',TPL);refresh();toast('初期のひな形に戻しました');});
  const ta=el.querySelector('#ta');
  on('[data-exp]',()=>{const o={_saved:nowStr(),db:DB,master:pickMaster(),office:OFFICE,ctrTpl:TPL,staff:STAFF,info:KT.site('info'),news:KT.site('news'),fees:KT.site('fees'),terms:KT.site('terms')};ta.value=JSON.stringify(o);copy(ta.value);});
  const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  on('[data-csv]',()=>{ta.value=[['区分','お名前','ふりがな','会社名','役職','電話','メール','郵便番号','住所','きっかけ','目印','メモ']].concat(DB.cust.map(c=>[c.kind,c.name,c.kana,c.company,c.title,c.tel,c.mail,c.zip,c.addr,c.source,(c.tags||[]).join('、'),c.memo])).map(r=>r.map(q).join('\t')).join('\n');copy(ta.value);});
  on('[data-csv2]',()=>{ta.value=[['種類','番号','発行日','期限','宛先','件名','合計（税込）','状態','入金済']].concat(DB.doc.map(d=>[d.type,d.no,d.issue,d.due,custName(d.custId),d.title,docCalc(d).total,invStatus(d),paidOf(d.id)])).map(r=>r.map(q).join('\t')).join('\n');copy(ta.value);});
  on('[data-imp]',()=>{let o;try{o=JSON.parse(ta.value);}catch(e){toast('控えの形式が正しくありません');return;}if(o.db)TABLES.forEach(t=>{if(o.db[t]){DB[t]=o.db[t];if(!REMOTE)persistLocal(t);else o.db[t].forEach(r=>KT.call('save',{table:t,rec:r}));}});['master','office','ctrTpl','staff','info','news','fees','terms'].forEach(k=>{if(o[k])saveConf(k,o[k]);});loadLocalConf();toast('読み込みました');refresh();});
  on('[data-clr]',()=>{TABLES.forEach(t=>{DB[t]=DB[t].filter(r=>!r.sample);persistLocal(t);});toast('見本のデータを消しました');refresh();});
};
function loadLocalConf(){if(REMOTE)return;MASTER=Object.assign({},MASTER_DEF,getJ('kt-master-v1',{}));OFFICE=Object.assign({},OFFICE_DEF,getJ('kt-office-v1',{}));TPL=getJ('kt-ctrtpl-v1',null)||CTR_TPL_DEF;STAFF=getJ('kt-staff-v1',null)||STAFF_DEF;}

/* ================= 入口 ================= */
function showGate(){
  const g=$('#gate');g.hidden=false;$('#app').hidden=true;
  if(REMOTE){
    g.innerHTML=`<form class="card" id="lg" novalidate><h1>事務所管理</h1><p class="muted">京都太陽行政書士事務所</p><div class="field"><label for="lu">担当者</label><select id="lu">${STAFF.map(s=>`<option>${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label for="lp">合言葉</label><input id="lp" type="password" autocomplete="current-password"></div><p class="err-msg" id="lm" role="alert"></p><button class="btn btn-main" type="submit">ログイン</button></form>`;
    $('#lg').addEventListener('submit',async e=>{e.preventDefault();try{const j=await KT.call('login',{user:$('#lu').value,pass:$('#lp').value});setJ('kt-token',j.token);setJ('kt-me',j.user);start(j.user);}catch(err){$('#lm').textContent=err.message||'ログインできませんでした';}});
  }else{
    g.innerHTML=`<div class="card"><h1>事務所管理</h1><p class="muted">京都太陽行政書士事務所</p><p class="warn">確認用の状態です。データはこの端末のブラウザにだけ保存されます。</p><p style="font-weight:700">使う人を選んでください</p><div class="users">${STAFF.map(s=>`<button type="button" data-u="${esc(s.name)}">${esc(s.name)}<small>${esc(s.role||'')}</small></button>`).join('')}</div></div>`;
    $$('[data-u]',g).forEach(b=>b.addEventListener('click',()=>{const u=STAFF.find(s=>s.name===b.dataset.u);setJ('kt-me',u);start(u);}));
  }
}
async function start(user){
  ME=user;
  if(REMOTE){try{await loadRemote();}catch(e){if(e.code==='auth'){setJ('kt-token','');ME=null;showGate();return;}toast('保存先から読み込めませんでした：'+(e.message||''));}}
  $('#gate').hidden=true;$('#app').hidden=false;
  $('#who').textContent=ME.name;
  const md=$('#mode');md.textContent=REMOTE?'スプレッドシート保存':'この端末に保存（確認用）';md.className='mode '+(REMOTE?'mode-remote':'mode-local');
  const h=(location.hash||'').replace('#v-','');go(VIEWS[h]?h:'home');
}
$('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)go(b.dataset.v);});
$('#logout').addEventListener('click',()=>{setJ('kt-me',null);if(REMOTE){KT.call('logout',{}).catch(()=>{});setJ('kt-token','');}ME=null;showGate();});
/* ほかの画面（署名ページ・サイトの相談フォーム）で変わった内容を読み込み直す */
function reloadData(){if(!ME)return;if(REMOTE){loadRemote().then(()=>{if(!$('#modals').children.length)refresh();renderNav();}).catch(()=>{});}else{loadLocal();if(!$('#modals').children.length)refresh();renderNav();}}
window.addEventListener('storage',e=>{if(e.key&&/^kt-(db-|inq-)/.test(e.key))reloadData();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reloadData();});
window.addEventListener('hashchange',()=>{const h=(location.hash||'').replace('#v-','');if(ME&&VIEWS[h]&&h!==CUR)go(h);});

if(!REMOTE)loadLocal();
const me=getJ('kt-me',null);
if(me&&(!REMOTE||getJ('kt-token','')))start(me);else showGate();
})();
