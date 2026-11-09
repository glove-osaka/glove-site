/* 京都太陽行政書士事務所 サイトのご案内
   ・「ご案内」ボタン：質問に答えると、該当する場所へ連れて行き、光らせて説明する
   ・各ページの最後に「次はこちら」
   ・相談フォーム：今どこか（入力→確認→完了）と、次に何をするかを表示
   ・送信後：このあとの流れ */
(function(){
  var css=`
.kg-btn{position:fixed;left:14px;bottom:20px;z-index:46;display:flex;align-items:center;gap:8px;padding:10px 16px 10px 10px;border-radius:999px;border:1px solid #c9d5bd;background:#fffdf9;color:#2d2b27;font:700 14px var(--kt-body);box-shadow:0 6px 18px rgba(45,43,39,.16);cursor:pointer}
.kg-btn .kg-face{width:30px;height:30px;border-radius:50%;background:var(--kt-green);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--kt-display);font-size:15px}
@media (max-width:640px){.kg-btn{bottom:66px;left:10px;padding:8px 14px 8px 8px;font-size:13px}}
.kg-panel{position:fixed;left:14px;bottom:20px;z-index:70;width:min(380px,calc(100vw - 20px));max-height:min(78vh,620px);overflow-y:auto;background:#fffdf9;border:1px solid var(--kt-line);border-radius:16px;box-shadow:0 14px 40px rgba(45,43,39,.25);padding:16px;display:grid;gap:12px}
@media (max-width:640px){.kg-panel{left:10px;bottom:62px}}
.kg-head{display:flex;align-items:center;gap:10px}
.kg-head b{font-family:var(--kt-display);font-size:17px;color:#2d2b27;flex:1}
.kg-x{border:1px solid var(--kt-line);background:#fff;border-radius:999px;padding:4px 12px;font:inherit;font-size:13px;cursor:pointer}
.kg-say{background:var(--kt-green-pale);border-radius:12px 12px 12px 4px;padding:10px 12px;font-size:15px;line-height:1.7;color:#2d2b27}
.kg-opts{display:grid;gap:8px}
.kg-opt{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1.5px solid var(--kt-line);background:#fff;border-radius:12px;padding:11px 12px;font:inherit;font-size:15px;color:#2d2b27;cursor:pointer}
.kg-opt:hover,.kg-opt:focus-visible{border-color:var(--kt-green);background:var(--kt-green-pale)}
.kg-opt small{display:block;font-size:12.5px;color:var(--kt-text);font-weight:400}
.kg-opt .kg-n{width:26px;height:26px;border-radius:50%;flex:none;background:var(--kt-gold);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
.kg-back{justify-self:start;border:0;background:none;color:var(--kt-green);font:inherit;font-size:14px;text-decoration:underline;cursor:pointer;padding:4px 0}
.kg-panel[hidden],.kg-tip[hidden]{display:none!important}
.kg-hl{position:relative;z-index:5;border-radius:12px;animation:kgPulse 1.6s ease-out 3;box-shadow:0 0 0 3px var(--kt-gold)}
@keyframes kgPulse{0%{box-shadow:0 0 0 3px var(--kt-gold),0 0 0 0 rgba(179,138,62,.55)}100%{box-shadow:0 0 0 3px var(--kt-gold),0 0 0 16px rgba(179,138,62,0)}}
.kg-tip{position:fixed;left:50%;transform:translateX(-50%);bottom:24px;z-index:72;width:min(520px,calc(100vw - 20px));background:#2d2b27;color:#fff;border-radius:14px;padding:12px 14px;display:grid;gap:8px;box-shadow:0 12px 34px rgba(0,0,0,.3)}
@media (max-width:640px){.kg-tip{bottom:64px}}
.kg-tip p{margin:0;font-size:14.5px;line-height:1.7}
.kg-tip p b{color:#f1d9a6}
.kg-tip .kg-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.kg-tip a,.kg-tip button{border-radius:999px;padding:7px 14px;font:700 13.5px var(--kt-body);cursor:pointer;text-decoration:none;border:1px solid #fff;background:transparent;color:#fff}
.kg-tip a.kg-go{background:#fff;color:#2d2b27}
.kg-next{margin-top:28px;background:var(--kt-white);border:1px solid var(--kt-line);border-radius:16px;padding:20px;display:grid;gap:12px}
.kg-next h2{font-size:19px;display:flex;align-items:center;gap:10px}
.kg-next h2::before{content:"";width:28px;height:28px;border-radius:50%;background:var(--kt-gold) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 6l6 6-6 6' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/16px no-repeat;flex:none}
.kg-next-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.kg-next-list a{display:grid;gap:2px;text-decoration:none;border:1.5px solid var(--kt-line);border-radius:12px;padding:12px 14px;color:#2d2b27;background:#fff}
.kg-next-list a:hover{border-color:var(--kt-green);background:var(--kt-green-pale)}
.kg-next-list a b{font-size:15.5px}
.kg-next-list a span{font-size:13px;color:var(--kt-text)}
.kg-next-list a.kg-main{background:var(--kt-green);border-color:var(--kt-green);color:#fff}
.kg-next-list a.kg-main span{color:#e3ebda}
/* フォームの進み具合 */
.kg-prog{position:sticky;top:calc(var(--kg-top,77px) + 6px);z-index:15;background:rgba(250,247,240,.96);backdrop-filter:blur(4px);border:1px solid var(--kt-line);border-radius:12px;padding:10px 12px;display:grid;gap:8px}

.kg-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;counter-reset:s}
.kg-steps li{position:relative;text-align:center;font-size:12.5px;font-weight:700;color:#8a8478;padding-top:30px}
.kg-steps li::before{counter-increment:s;content:counter(s);position:absolute;left:50%;top:0;transform:translateX(-50%);width:26px;height:26px;border-radius:50%;background:#fff;border:2px solid #cfc6b2;display:flex;align-items:center;justify-content:center;font-size:13px;color:#8a8478}
.kg-steps li::after{content:"";position:absolute;top:12px;left:calc(50% + 16px);right:calc(-50% + 16px);height:2px;background:#cfc6b2}
.kg-steps li:last-child::after{display:none}
.kg-steps li.on{color:var(--kt-green)}
.kg-steps li.on::before{background:var(--kt-green);border-color:var(--kt-green);color:#fff}
.kg-steps li.done{color:var(--kt-green)}
.kg-steps li.done::before{content:"✓";background:var(--kt-green-pale);border-color:var(--kt-green);color:var(--kt-green)}
.kg-steps li.done::after{background:var(--kt-green)}
.kg-bar{height:6px;border-radius:999px;background:#ece6d9;overflow:hidden}
.kg-bar i{display:block;height:100%;background:var(--kt-green);transition:width .3s}
.kg-hint{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:#2d2b27}
.kg-hint::before{content:"";width:10px;height:10px;border-radius:50%;background:var(--kt-gold);flex:none;animation:kgDot 1.4s infinite}
@keyframes kgDot{50%{opacity:.25}}
.kg-target{outline:2.5px solid var(--kt-gold);outline-offset:6px;border-radius:10px}
.kg-flow{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:0}
.kg-flow li{display:grid;grid-template-columns:34px 1fr;gap:10px;padding:8px 0;position:relative}
.kg-flow li::before{content:"";position:absolute;left:16px;top:38px;bottom:-6px;width:2px;background:#d8d0bf}
.kg-flow li:last-child::before{display:none}
.kg-flow i{width:34px;height:34px;border-radius:50%;background:#fff;border:2px solid #cfc6b2;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:700;color:#8a8478}
.kg-flow li.done i{background:var(--kt-green);border-color:var(--kt-green);color:#fff}
.kg-flow li.now i{border-color:var(--kt-gold);color:var(--kt-gold-text)}
.kg-flow b{display:block;color:#2d2b27}
.kg-flow span{font-size:13.5px}
@media (prefers-reduced-motion:reduce){.kg-hl,.kg-hint::before{animation:none}}
`;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var esc=function(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};

  /* ---------- 光らせて説明する ---------- */
  var tipEl=null,hlEl=null;
  function clearTip(){if(tipEl){tipEl.remove();tipEl=null;}if(hlEl){hlEl.classList.remove('kg-hl');hlEl=null;}}
  function point(sel,msg,next){
    clearTip();
    var el=typeof sel==='string'?document.querySelector(sel):sel;
    if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('kg-hl');hlEl=el;}
    tipEl=document.createElement('div');tipEl.className='kg-tip';tipEl.setAttribute('role','status');
    tipEl.innerHTML='<p>'+msg+'</p><div class="kg-row"><button type="button" data-x>閉じる</button>'+(next?'<a class="kg-go" href="'+next.href+'">'+esc(next.label)+' 〉</a>':'')+'</div>';
    document.body.appendChild(tipEl);
    tipEl.querySelector('[data-x]').addEventListener('click',clearTip);
    var g=tipEl.querySelector('.kg-go');if(g)g.addEventListener('click',function(){setTimeout(clearTip,50);});
  }
  function goPage(hash,after){
    guiding=true;
    if(location.hash!==hash){location.hash=hash;setTimeout(function(){after();guiding=false;},450);}else{after();guiding=false;}
  }
  /* 見出しの文字でセクションを探す */
  function byText(page,text){
    var root=document.querySelector('[data-page="'+page+'"]');if(!root)return null;
    var hs=root.querySelectorAll('h2,h3');for(var i=0;i<hs.length;i++){if(hs[i].textContent.indexOf(text)>-1){return hs[i].closest('.kt-card,.kt-promise,.kt-head,.kt-loss')||hs[i];}}return null;
  }

  /* ---------- ご案内係 ---------- */
  var TREE={
    start:{say:'こんにちは。京都太陽行政書士事務所のご案内係です。<br>どのようなご用件ですか？',opts:[
      {n:'会社・事業のことで相談したい',s:'人材の定着、事業承継、許認可など',to:'biz'},
      {n:'相続・終活・暮らしの手続き',s:'遺言、任意後見、空き家、施設入居など',to:'per'},
      {n:'料金を知りたい',s:'主なご依頼の料金の目安',go:['#fees',null,'料金の一覧です。ご依頼の内容によって変わるため、<b>初回相談（1時間まで無料）</b>で正式にお見積りします。',{href:'#contact',label:'相談を申し込む'}]},
      {n:'どんな先生か知りたい',s:'経歴・資格・想い',go:['#profile',null,'代表の<b>特定行政書士 松宮紀代</b>のご紹介です。想いは「経営理念」のページにもまとめています。',{href:'#philosophy',label:'経営理念を読む'}]},
      {n:'事務所の場所・行き方',s:'地図と最寄り駅',go:['#access','.kt-map','<b>阪急・嵐電「西院」駅</b>から歩いて来られます。ご来所の際は事前にご予約ください。',{href:'#contact',label:'予約・相談を申し込む'}]},
      {n:'すぐに相談したい',s:'フォームかお電話で',to:'contact'}]},
    biz:{say:'会社・事業のご相談ですね。<br>いちばん近いものを選んでください。',opts:[
      {n:'社員が辞める・技術が残らない',s:'技術承継・定着支援プログラム',go:['#business',function(){return byText('business','技術承継・定着支援プログラム');},'<b>技術承継・定着支援プログラム</b>です。全社員への聞き取りから始めます。3ヶ月プランと6ヶ月プラン（返金制度あり）があります。',{href:'#contact',label:'このことで相談する'}]},
      {n:'後継者・事業承継',s:'社内承継、M&A、廃業の前に',go:['#business',function(){return byText('business','事業承継・技術承継');},'<b>事業承継</b>は、社内の方への承継から売却先探しまでご一緒します。考え方は「経営理念」のページにも載せています。',{href:'#contact',label:'このことで相談する'}]},
      {n:'外国人を雇いたい・雇っている',s:'在留資格、受け入れ、定着',go:['#business',function(){return byText('business','外国人社員');},'<b>外国人を雇う会社への支援</b>です。在留資格の手続きから、長く働いてもらうための雇用管理まで。',{href:'#contact',label:'このことで相談する'}]},
      {n:'許認可・契約書・会社設立',s:'経審、産廃、定款、契約書',go:['#business',function(){return byText('business','会社の手続き');},'<b>会社の手続き</b>の一覧です。料金は下の料金表をご覧ください。',{href:'#contact',label:'このことで相談する'}]}],back:'start'},
    per:{say:'暮らしのご相談ですね。<br>いちばん近いものを選んでください。',opts:[
      {n:'遺言・相続の準備をしたい',s:'公正証書遺言、遺産分割協議書',go:['#personal',function(){return byText('personal','聞き取りから手続きまで');},'<b>遺言・相続</b>は、お話を伺って整理し、書類の作成までお手伝いします。料金はこのページの下にあります。',{href:'#contact',label:'このことで相談する'}]},
      {n:'将来の判断力や、頼れる人がいない不安',s:'任意後見、家族信託、死後事務',go:['#personal',function(){return byText('personal','どこに相談すればよいか');},'<b>任意後見・家族信託・死後事務</b>のご相談をお受けしています。まずはお気持ちをお聞かせください。',{href:'#contact',label:'このことで相談する'}]},
      {n:'空き家・自宅の売却、施設への入居',s:'同行・代行もいたします',go:['#personal',function(){return byText('personal','聞き取りから手続きまで');},'<b>空き家の管理や売却、施設の下見から入居手続き</b>まで、同行してお手伝いします。',{href:'#contact',label:'このことで相談する'}]},
      {n:'女性の起業・詐欺被害の防止',s:'講座・セミナー',go:['#personal',function(){return byText('personal','暮らしと仕事の手続き');},'<b>女性の起業支援</b>と、高齢の方向けの<b>詐欺被害防止セミナー（無料）</b>です。',{href:'#contact',label:'申し込む・相談する'}]}],back:'start'},
    contact:{say:'ご相談の方法を選んでください。<br>初回相談は<b>1時間まで無料</b>です。',opts:[
      {n:'フォームで相談する',s:'24時間受付・3分ほどで入力できます',go:['#contact','#kt-step1','<b>まず「企業」か「個人」を選んでください。</b>選ぶと、次の質問が出てきます。',null]},
      {n:'電話で相談する',s:'',tel:1},
      {n:'流れを先に知りたい',s:'相談から契約までの4つの段階',go:['#home',function(){var h=document.querySelectorAll('[data-page="home"] h2');for(var i=0;i<h.length;i++)if(h[i].textContent.indexOf('はじめての方')>-1)return h[i].closest('.kt-sec');},'<b>お問い合わせ → 無料相談 → お見積り → ご支援開始</b>の順に進みます。ご納得いただくまで費用はかかりません。',{href:'#contact',label:'相談を申し込む'}]}],back:'start'}
  };
  var panel=null;
  function telInfo(){var i=window.KT?KT.site('info'):{tel:'075-312-6647',hours:'9:00〜18:00'};return i;}
  function openGuide(node){
    node=node||'start';var t=TREE[node];
    if(!panel){panel=document.createElement('div');panel.className='kg-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','ご案内');document.body.appendChild(panel);}
    panel.hidden=false;btn.setAttribute('aria-expanded','true');
    panel.innerHTML='<div class="kg-head"><b>ご案内</b><button type="button" class="kg-x" data-close>閉じる</button></div><div class="kg-say">'+t.say+'</div><div class="kg-opts">'+t.opts.map(function(o,i){
      if(o.tel){var ti=telInfo();return '<a class="kg-opt" href="tel:'+ti.tel.replace(/[^0-9+]/g,'')+'"><span class="kg-n">'+(i+1)+'</span><span>'+esc(o.n)+'<small>'+esc(ti.tel)+'（'+esc(ti.hours)+'・暦通り）</small></span></a>';}
      return '<button type="button" class="kg-opt" data-i="'+i+'"><span class="kg-n">'+(i+1)+'</span><span>'+esc(o.n)+(o.s?'<small>'+esc(o.s)+'</small>':'')+'</span></button>';}).join('')+'</div>'+(t.back?'<button type="button" class="kg-back" data-back>← 最初の質問に戻る</button>':'');
    panel.querySelector('[data-close]').addEventListener('click',closeGuide);
    var bk=panel.querySelector('[data-back]');if(bk)bk.addEventListener('click',function(){openGuide(t.back);});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-i]'),function(b){b.addEventListener('click',function(){
      var o=t.opts[+b.dataset.i];
      if(o.to){openGuide(o.to);return;}
      closeGuide();
      goPage(o.go[0],function(){var tgt=typeof o.go[1]==='function'?o.go[1]():o.go[1];point(tgt,o.go[2],o.go[3]);});
    });});
    var f=panel.querySelector('.kg-opt');if(f)f.focus();
  }
  function closeGuide(){if(panel)panel.hidden=true;btn.setAttribute('aria-expanded','false');}
  var btn=document.createElement('button');btn.type='button';btn.className='kg-btn';btn.setAttribute('aria-expanded','false');
  btn.innerHTML='<span class="kg-face" aria-hidden="true">?</span>ご案内';
  btn.addEventListener('click',function(){if(panel&&!panel.hidden)closeGuide();else openGuide('start');});
  document.body.appendChild(btn);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeGuide();clearTip();}});
  var guiding=false;window.addEventListener('hashchange',function(){if(!guiding)clearTip();});

  /* ---------- 各ページの最後に「次はこちら」 ---------- */
  var NEXT={
    business:[['#contact','このことで相談する','初回1時間まで無料',1],['#fees','料金の一覧を見る','見積りの目安に'],['#philosophy','経営理念を読む','なぜ全社員に聞き取りをするのか']],
    personal:[['#contact','このことで相談する','初回1時間まで無料',1],['#fees','料金の一覧を見る','遺言・相続・終活の料金'],['#profile','代表を知る','女性の行政書士がお話を伺います']],
    fees:[['#contact','見積りを相談する','ご納得いただくまで費用はかかりません',1],['#terms','支払い・解約について','お支払い方法と返金のきまり']],
    profile:[['#contact','相談を申し込む','まずはお話をお聞かせください',1],['#philosophy','経営理念を読む','この仕事に込めた想い'],['#news','活動実績を見る','相談会・講演・セミナー']],
    philosophy:[['#contact','相談を申し込む','社長おひとりで抱え込まずに',1],['#business','支援の内容を見る','技術承継・定着支援プログラム']],
    news:[['#contact','相談を申し込む','相談会以外でもお受けしています',1],['#blog','ブログ記事を読む','日々の現場から']],
    blog:[['#contact','相談を申し込む','記事について聞きたいことも',1],['#business','経営者のご相談','支援の内容と料金']],
    access:[['#contact','来所の予約をする','ご来所は事前のご予約制です',1]],
    legal:[['#contact','相談を申し込む','',1]],
    terms:[['#contact','相談を申し込む','',1],['#fees','料金の一覧を見る','']]
  };
  Object.keys(NEXT).forEach(function(p){
    var sec=document.querySelector('[data-page="'+p+'"]');if(!sec)return;
    var last=sec.querySelectorAll('.kt-sec');last=last[last.length-1];if(!last)return;var wrap=last.querySelector('.kt-wrap')||last;
    var d=document.createElement('div');d.className='kg-next';
    d.innerHTML='<h2>次はこちら</h2><div class="kg-next-list">'+NEXT[p].map(function(n){return '<a href="'+n[0]+'"'+(n[3]?' class="kg-main"':'')+'><b>'+esc(n[1])+'</b>'+(n[2]?'<span>'+esc(n[2])+'</span>':'')+'</a>';}).join('')+'</div>';
    wrap.appendChild(d);
  });

  /* ---------- 相談フォームの案内 ---------- */
  var form=document.getElementById('kt-form');
  if(form){
    var prog=document.createElement('div');prog.className='kg-prog';prog.setAttribute('aria-live','polite');
    prog.innerHTML='<ol class="kg-steps"><li data-s="1">入力</li><li data-s="2">確認</li><li data-s="3">送信完了</li></ol><div class="kg-bar" aria-hidden="true"><i style="width:0%"></i></div><p class="kg-hint" data-h></p>';
    form.parentNode.insertBefore(prog,form);
    var hint=prog.querySelector('[data-h]'),bar=prog.querySelector('.kg-bar i');
    var lastT=null;
    function mark(el){if(lastT===el)return;if(lastT)lastT.classList.remove('kg-target');lastT=el;if(el)el.classList.add('kg-target');}
    function phase(n){Array.prototype.forEach.call(prog.querySelectorAll('[data-s]'),function(li){var s=+li.dataset.s;li.className=s<n?'done':s===n?'on':'';});}
    function update(){
      var conf=document.getElementById('kt-confirm'),done=document.getElementById('kt-done');
      if(done&&!done.hidden){phase(3);bar.style.width='100%';hint.textContent='送信が完了しました。このあとの流れは下をご覧ください。';mark(null);return;}
      if(conf&&!conf.hidden){phase(2);bar.style.width='85%';hint.textContent='内容を確かめて、「この内容で送信する」を押してください。';mark(conf.querySelector('#kt-send'));return;}
      phase(1);
      var E=form.elements,checks=[
        [function(){return form.querySelector('input[name="type"]:checked');},'まず「企業のご相談」か「個人のご相談」を選んでください。',function(){return document.getElementById('kt-step1');}],
        [function(){return form.querySelector('input[name="topic"]:checked');},'ご相談の種類を選んでください（いくつでも選べます）。',function(){return document.getElementById('kt-topics');}],
        [function(){return E['name'].value.trim();},'お名前を入れてください。',function(){return E['name'];}],
        [function(){return E['tel'].value.trim()||E['mail'].value.trim();},'お電話番号かメールアドレスのどちらかを入れてください。',function(){return E['tel'];}],
        [function(){return E['agree'].checked;},'「個人情報保護方針に同意します」にチェックを入れてください。',function(){return form.querySelector('.kt-agree');}]
      ];
      var doneN=0,next=null;
      for(var i=0;i<checks.length;i++){if(checks[i][0]())doneN++;else if(!next)next=checks[i];}
      bar.style.width=Math.round(doneN/checks.length*70)+'%';
      if(next){hint.textContent='次は：'+next[1];mark(next[2]());}
      else{hint.textContent='必要な項目はそろいました。そのほかは分かる範囲で結構です。最後に「入力内容を確認する」を押してください。';mark(form.querySelector('.kt-btn-wide'));}
    }
    form.addEventListener('input',update);form.addEventListener('change',update);
    /* 企業・個人を選んだら、次の質問へ自動で進む */
    Array.prototype.forEach.call(form.querySelectorAll('input[name="type"]'),function(r){r.addEventListener('change',function(){setTimeout(function(){var t=document.getElementById('kt-topics');if(t)t.scrollIntoView({behavior:'smooth',block:'center'});update();},120);});});
    /* 確認・送信の切り替えを見張る */
    ['kt-confirm','kt-done'].forEach(function(id){var el=document.getElementById(id);if(el)new MutationObserver(function(){update();if(id==='kt-done'&&!el.hidden)addFlow(el);}).observe(el,{attributes:true,attributeFilter:['hidden']});});
    new MutationObserver(update).observe(form,{attributes:true,attributeFilter:['hidden']});
    var setTop=function(){var h=document.querySelector('.kt-header');if(h)document.documentElement.style.setProperty('--kg-top',Math.round(h.getBoundingClientRect().height)+'px');};setTop();window.addEventListener('resize',setTop);
    update();
  }
  function addFlow(el){
    if(el.querySelector('.kg-flow'))return;
    var i=telInfo();
    el.insertAdjacentHTML('beforeend','<h3 style="font-size:17px;margin-top:16px">このあとの流れ</h3><ol class="kg-flow"><li class="done"><i>✓</i><div><b>ご相談の受付</b><span>今、受け付けました。メールアドレスをご記入の方には、受付のメールをお送りします。</span></div></li><li class="now"><i>2</i><div><b>事務所からご連絡</b><span>2営業日以内に、ご希望の方法でご連絡します。</span></div></li><li><i>3</i><div><b>初回のご相談（1時間まで無料）</b><span>来所・訪問・オンラインからお選びいただけます。</span></div></li><li><i>4</i><div><b>お見積り・ご契約</b><span>ご納得いただいてからのご契約です。それまで費用はかかりません。</span></div></li></ol>');
  }
})();
