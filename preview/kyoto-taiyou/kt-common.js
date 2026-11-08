/* 京都太陽行政書士事務所 共通部品
   保存先：KT_API が空なら「この端末のブラウザ」、入っていれば Googleスプレッドシート（Apps Script）
   公開時は下の KT_API に Apps Script のアドレスを入れるだけで切り替わります。 */
(function(){
  var KT_API = ''; /* 例：'https://script.google.com/macros/s/xxxxx/exec' */

  function getJ(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
  function setJ(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
  function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function pad(n){return ('0'+n).slice(-2);}
  function today(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function nowStr(){var d=new Date();return today()+' '+pad(d.getHours())+':'+pad(d.getMinutes());}
  function uid(p){return (p||'')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
  function yen(n){n=Math.round(Number(n)||0);return n.toLocaleString('ja-JP')+'円';}

  /* ---------- 初期データ（サイトの表示） ---------- */
  var DEF = {
    info:{tel:'075-312-6647',hours:'9:00〜18:00',mail:'contact@kyoto-taiyou.com'},
    news:[
      {d:'2026-11-08',l:'ご案内',t:'ホームページを新しくしました。企業・個人のご相談をフォームから受け付けています'},
      {d:'2025-08-16',l:'相談会',t:'8月17日（日）10時〜17時半、京都駅八条口のイオンモールで終活の無料相談会を行います'},
      {d:'2025-08-06',l:'相談会',t:'8月13日・20日（水）9時30分〜17時、七条ハローワークで外国人を雇用される事業主の方への無料相談を行います'},
      {d:'2025-07-11',l:'講演',t:'公認会計士の特別講演へのご参加のお礼'},
      {d:'2025-05-24',l:'講演',t:'いよいよ明日、特別講演を行います'},
      {d:'2025-05-04',l:'講演',t:'公認会計士・市ノ澤翔氏による経営改善講演を主催します'},
      {d:'2024-11-09',l:'ご案内',t:'ご依頼について'},
      {d:'2024-10-16',l:'重要',t:'メールアドレスが変わりました（新しいアドレス：contact@kyoto-taiyou.com）'},
      {d:'2024-07-10',l:'セミナー',t:'遺言を1日で作るセミナー・遺産分割協議書を1日で作るセミナーへのご参加ありがとうございました'},
      {d:'2024-05-26',l:'セミナー',t:'6月22日・24日のセミナー、満席のお礼'}
    ],
    fees:{biz:[
      {n:'技術承継・定着支援プログラム 3ヶ月プラン',note:'社員規模・距離・訪問回数によりお見積り',p:'お見積り',ps:''},
      {n:'技術承継・定着支援プログラム 6ヶ月プラン',note:'返金保証つき。社員規模・距離・訪問回数によりお見積り',p:'月額15万円〜',ps:''},
      {n:'事業承継・M&A支援',note:'',p:'10万円〜',ps:'＋成功額の10%'},
      {n:'補助金申請支援',note:'',p:'10万円〜',ps:'＋採択額の10%'},
      {n:'契約書の作成',note:'',p:'10万円〜',ps:''},
      {n:'定款作成・会社設立',note:'',p:'10万円〜',ps:''},
      {n:'経営事項審査（経審）',note:'',p:'15万円〜',ps:''},
      {n:'在留資格',note:'日本語でやり取りできる方',p:'25万円',ps:''},
      {n:'ワーク付き 単発2回完結講座',note:'',p:'6万円',ps:''},
      {n:'内定者・社員向けセミナー',note:'',p:'要相談',ps:''}],
     per:[
      {n:'ご相談（1時間まで）',note:'',p:'無料',ps:''},
      {n:'1時間を超える場合',note:'',p:'5,000円',ps:'／60分'},
      {n:'遺言・相続・終活 生前6点セット',note:'単発のご依頼も可',p:'30万円',ps:''},
      {n:'公正証書遺言の起案',note:'',p:'10万円',ps:''},
      {n:'事業承継を踏まえた相続・遺言',note:'',p:'20万円',ps:''},
      {n:'契約書・内容証明',note:'',p:'10万円〜',ps:''},
      {n:'被害届の作成',note:'',p:'5万円〜',ps:''},
      {n:'女性起業 事業プランニングコース',note:'',p:'19万円',ps:''},
      {n:'高齢者向け 詐欺被害防止セミナー',note:'',p:'無料',ps:''}]},
    terms:{
      pay:['クレジットカード','銀行振込'],payOther:'',payNote:'分割払いをご利用の場合は分割手数料がかかります。',
      payTiming:'クレジットカード：ご注文時に確定します。\n銀行振込：お振込みの時点で確定します。',
      coolingOff:'インターネットでのお申込みには、法律上のクーリングオフ制度はありません。当事務所では独自の制度として、お申込み日から7日以内にご連絡いただければ、お支払い済みの金額を返金いたします。返金時の振込手数料はお客様のご負担となります。',
      cancel:'中途解約の場合は、お支払い額を講座の回数で割った金額に、残りの回数をかけた金額を振込で返金いたします。振込手数料はお客様のご負担となります。',
      delivery:'お支払いの確認後24時間以内に、メールまたはLINE公式アカウントでご案内いたします。',
      defect:'お申込み内容と異なる場合や、データが破損していた場合は、7日以内にご連絡ください。状況を確認のうえ、改めて提供いたします。',
      extraFees:'分割払いの手数料、振込手数料'
    }
  };
  var SITE_KEYS={info:'kt-info-v1',news:'kt-news-v1',fees:'kt-fees-v1',terms:'kt-settings-v1'};

  function site(name){
    var v=getJ(SITE_KEYS[name],null);
    if(name==='info'){v=v||{};return {tel:v.tel||DEF.info.tel,hours:v.hours||DEF.info.hours,mail:v.mail||DEF.info.mail};}
    if(name==='fees')return v&&v.biz&&v.per?v:JSON.parse(JSON.stringify(DEF.fees));
    if(name==='news')return (v||DEF.news).slice().sort(function(a,b){return a.d<b.d?1:-1;});
    if(name==='terms'){var r={};v=v||{};for(var k in DEF.terms)r[k]=(v[k]!==undefined?v[k]:DEF.terms[k]);return r;}
  }

  /* ---------- 保存先とのやり取り ---------- */
  function apiUrl(){return KT_API||getJ('kt-api-url','')||'';}
  function call(action,data){
    var url=apiUrl();
    if(!url)return Promise.reject({code:'local',message:'保存先が設定されていません'});
    var body=Object.assign({action:action,token:getJ('kt-token','')},data||{});
    return fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)})
      .then(function(r){if(!r.ok)throw {message:'保存先が応答しませんでした（'+r.status+'）'};return r.json();})
      .then(function(j){if(j&&j.error)throw {code:j.code||'error',message:j.error};return j;});
  }

  /* サイト表示用データを保存先から取り込む（公開側） */
  function pullSite(){
    if(!apiUrl())return Promise.resolve(false);
    return call('siteData',{}).then(function(j){
      ['info','news','fees','terms'].forEach(function(k){if(j[k]!==undefined&&j[k]!==null)setJ(SITE_KEYS[k],j[k]);});
      return true;
    }).catch(function(){return false;});
  }

  /* 相談フォームの受付（公開側） */
  function fileToB64(f){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res({name:f.name,type:f.type,data:String(r.result).split(',')[1]});};r.onerror=rej;r.readAsDataURL(f);});}
  function submitInquiry(rec,files){
    if(!apiUrl()){
      var a=getJ('kt-inq-v1',null);if(!a)a=[];a.unshift(rec);setJ('kt-inq-v1',a);return Promise.resolve({ok:true,local:true});
    }
    return Promise.all((files||[]).map(fileToB64)).then(function(fs){return call('publicInquiry',{rec:rec,files:fs});});
  }

  window.KT={DEF:DEF,SITE_KEYS:SITE_KEYS,site:site,getJ:getJ,setJ:setJ,esc:esc,pad:pad,today:today,nowStr:nowStr,uid:uid,yen:yen,apiUrl:apiUrl,call:call,pullSite:pullSite,submitInquiry:submitInquiry};
})();
