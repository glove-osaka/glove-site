/* 管理画面：1件の画面（相談・取次ぎ・提携先・担当者） */
/* ---------- 1件の画面 ---------- */
var CUR={};
function edBox(v){return document.querySelector('[data-ed="'+v+'"]')}
function closeEd(v){var ed=edBox(v);if(!ed)return;ed.hidden=true;ed.innerHTML='';var l=document.querySelector('[data-list="'+v+'"]');if(l)l.hidden=false;document.querySelectorAll('#v-'+v+' .bar,#v-'+v+' .chips-sum,#v-'+v+' .howto').forEach(function(b){b.hidden=false})}
function showEd(v,html){var ed=edBox(v);var l=document.querySelector('[data-list="'+v+'"]');if(l)l.hidden=true;document.querySelectorAll('#v-'+v+' .bar,#v-'+v+' .chips-sum,#v-'+v+' .howto').forEach(function(b){b.hidden=true});
 ed.innerHTML=html;ed.hidden=false;ed.querySelectorAll('.apbox').forEach(function(b){AreaPick.render(b,b.dataset.v||'')});window.scrollTo(0,0);var h=ed.querySelector('h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}
function openEd(v,id){if(!edBox(v))return;showEd(v,'<p>読み込み中…</p>');var t=TB[v];
 (id?api('kanri.get',{table:t,id:id}):Promise.resolve(t==='case'?{row:{status:'新規',source:'電話'},refs:[],contracts:[]}:t==='staff'?{row:{active:'在籍'},refs:[],contracts:[]}:{row:{kind:'協力企業',apply_status:isAdm()&&v==='partner'?'提携開始':'新規申込'},refs:[],contracts:[]}))
 .then(function(r){if(r.opts)OPTS=r.opts;CUR={v:v,t:t,row:r.row,partners:r.partners||[],builtins:r.builtins||[]};render(v,r)}).catch(function(e){edBox(v).innerHTML='<p class="err">'+esc(e.message)+'</p><button class="btn o" type="button" data-close="'+v+'">一覧に戻る</button>'})}
function sub(title,html,cls){return '<div class="sub'+(cls?' '+cls:'')+'"><h3>'+title+'</h3>'+html+'</div>'}
function guide(text,todo){return '<div class="nextbox"><b>次にやること</b><p>'+text+'</p>'+(todo&&todo.length?'<ol>'+todo.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol>':'')+'</div>'}
function checksHtml(groups,o){var on=[];try{on=JSON.parse(o.checks||'[]')}catch(e){}var all=[];groups.forEach(function(g){(g[1]||[]).forEach(function(x){if(all.indexOf(x)<0)all.push(x)})});
 var done=all.filter(function(x){return on.indexOf(x)>=0}).length;
 return '<p class="hint">'+done+' / '+all.length+' 件 済み　（相談者・申し込みの種類で、確かめることが変わります）</p>'+groups.map(function(g){return g[1]&&g[1].length?'<div class="ckg"><b>'+esc(g[0])+'</b>'+g[1].map(function(x){return '<label class="ck"><input type="checkbox" data-ck value="'+esc(x)+'"'+(on.indexOf(x)>=0?' checked':'')+'> '+esc(x)+'</label>'}).join('')+'</div>':''}).join('')}
function work(list,o,isApply){var st=isApply?o.apply_status||'新規申込':o.status||'新規',nx=(isApply?NX_APPLY:NX_CASE)[st]||[];
 return '<div class="grid">'+
  '<div class="fld"><label for="wSt">'+(isApply?'進み具合':'状態')+'</label><select id="wSt">'+opt(st,list)+'</select></div>'+
  '<div class="fld"><label for="wStaff">担当者</label><select id="wStaff">'+opt(o.staff||'',(OPTS.staff||[]).concat(o.staff&&(OPTS.staff||[]).indexOf(o.staff)<0?[o.staff]:[]),'（まだ決めていない）')+'</select>'+((OPTS.staff||[]).length?'':'<small class="hint">「担当者」の画面で名簿を作ると選べます</small>')+'</div>'+
  '<div class="fld"><label for="wNext">次にやること</label><input type="text" id="wNext" list="wNextL" value="'+esc(o.next_action||'')+'" placeholder="選ぶか、書き込みます"><datalist id="wNextL">'+nx.map(function(x){return '<option value="'+esc(x)+'">'}).join('')+'</datalist></div>'+
  '<div class="fld"><label for="wDate">期日</label><input type="date" id="wDate" value="'+esc(String(o.next_date||'').slice(0,10))+'"></div></div>'}
function render(v,r){var o=r.row,isNew=!o.id,h='',t=TB[v];
 if(t==='case'){
  h+='<h2>'+(isNew?'相談を登録する':esc(o.name)+' 様の相談')+'</h2>'+(isNew?'':'<p class="hint">番号 '+esc(o.id)+'　受付 '+esc(o.created)+(o.form_ref?'　（ホームページから）':'')+'</p><div class="edtop">'+steps(o.status)+'　'+(o.status!=='完了'&&o.status!=='見送り'?'<span class="hint">最後の対応から '+idle(o)+'</span>':'')+'<div>'+badges(o)+'</div></div>');
  h+=guide(GUIDE_CASE[o.status||'新規']||'',[]);
  h+=sub('1. 対応（状態・担当者・次にやること）',work(OPTS.caseStatus||STEPS.concat(['見送り']),o,false));
  h+=sub('2. 分類（大分類・中分類は、お客様が選んだ内容から自動で入ります）',tree('tc',o,true));
  h+=sub('3. 相談者の情報','<div class="grid">'+SPEC.case.map(function(s){return input(t,s,o[s[0]]||'')}).join('')+'</div>');
  h+=sub('4. 確認すること（'+esc(relGroup(o.relation))+'からのご相談'+(o.cat1?'・'+esc(o.cat1):'')+'）',checksHtml([['共通',CK_CASE['共通']],[relGroup(o.relation)+'からのご相談',CK_CASE[relGroup(o.relation)]],[o.cat1||'',CK_CAT[o.cat1]||[]]],o));
 }
 if(t==='partner'){var ap=v==='apply'||(!isNew&&['提携開始','見送り'].indexOf(o.apply_status)<0);var kd=o.kind||'協力企業';
  h+='<h2>'+(isNew?(isAdm()?'提携先を登録する':'提携先を登録する（担当者）'):esc(o.name))+'</h2>'+(isNew?'':'<p class="hint">番号 '+esc(o.id)+'　受付 '+esc(o.created)+'　'+esc(o.source||'')+(o.registered_by?'　登録した人：'+esc(o.registered_by):'')+'</p>');
  if(!isNew&&ap){h+='<div class="edtop">'+steps(o.apply_status,ASTEPS.concat(['見送り']))+'<div>'+badges(o)+'</div></div>'+guide(GUIDE_APPLY[o.apply_status]||'',[]);
   h+=sub('申し込みの内容','<dl class="kv"><dt>種類</dt><dd>'+esc(kd)+'</dd><dt>分野</dt><dd>'+(pcats(o).map(function(x){return esc(x.l1+'／'+x.l2+'／'+x.l3)+(x.d?'<br><small>'+esc(x.d)+'</small>':'')}).join('<br>')||'なし')+'</dd><dt>面談の方法</dt><dd>'+esc(o.meeting||'未選択')+'</dd><dt>面談の希望日</dt><dd>'+(esc(o.meet_dates||'なし').replace(/\n/g,'<br>'))+'</dd><dt>自己紹介</dt><dd>'+esc(o.intro||'').replace(/\n/g,'<br>')+'</dd></dl>');
   h+=sub('1. 対応（自社だけで対応します。取次ぎはしません）',work(OPTS.applyStatus||ASTEPS.concat(['見送り']),o,true)+'<div class="grid"><div class="fld"><label for="wMeeting">面談の方法</label><select id="wMeeting">'+opt(o.meeting||'',['オンライン（画面越し）','お電話','当社へご来社（大阪市北区の打ち合わせ専用事務所）','貴社へ訪問'],'選んでください')+'</select></div><div class="fld"><label for="wMeet">決まった面談の日時</label><input type="datetime-local" id="wMeet" value="'+esc(String(o.meet_date||'').replace(' ','T').slice(0,16))+'"></div></div>');
   h+=sub('2. 確認すること（'+esc(kd)+'）',checksHtml([['共通',CK_APPLY['共通']],[kd,CK_APPLY[kd]||[]]],o));
  }
  h+=sub((ap&&!isNew?'3. ':'')+'会社の情報','<div class="grid">'+SPEC.partner.map(function(s){return input(t,s,o[s[0]]||'')}).join('')+'</div>');
 }
 if(t==='staff'){h+='<h2>'+(isNew?'担当者を登録する':esc(o.name))+'</h2>'+sub('担当者の情報','<div class="grid">'+SPEC.staff.map(function(s){return input(t,s,o[s[0]]||'')}).join('')+'</div>');}
 if(t==='ref'){h+='<h2>取次ぎ：'+esc(o.case_name||'')+' 様 → '+esc(o.partner_name||'（これから選ぶ）')+'</h2><p class="hint">'+(o.case_id?'<button type="button" class="lnk" data-open="case" data-id="'+esc(o.case_id)+'">この相談を開く</button>':'')+(o.sent_at?'　<span class="tag done">取次ぎ先へ送信済み '+esc(o.sent_at)+'（'+esc(o.sent_to)+'）</span>':'')+'</p>';
  h+=guide(o.id?(o.sent_at?'取次ぎ先からの見積もり・結果を待ち、状態を直して保存します。':'取次ぎ先に、相談の内容とお客様の連絡先を送ります。下の「取次ぎ先に内容を送る」を押すと、送る前の確認画面が出ます（勝手には送られません）。'):'分類を選ぶと、その分野に合う提携先が上に出ます。取次ぎ先を選んで保存してください。',[]);
  h+=sub('1. 分類（何を頼むか）',tree('tc',o,false));
  if(!o.id)h+=sub('2. 取次ぎ先','<div class="fld"><label for="rPid">取次ぎ先<span class="req">必須</span></label><select id="rPid"></select></div><div class="fld" id="rOtherBox" hidden><label for="rPname">取次ぎ先の名前（「その他」を選んだ時）</label><input type="text" id="rPname"></div>');
  h+=sub((o.id?'2. ':'3. ')+'進み具合','<div class="grid">'+SPEC.ref.map(function(s){return input(t,s,o[s[0]]||'')}).join('')+'</div>');
  if(o.id)h+='<div class="btns"><button type="button" class="btn gold" id="eSendRef">取次ぎ先に内容を送る（確認してから）</button></div>';
 }
 h+='<p class="err" id="errE" role="alert"></p><div class="btns sticky-btns"><button class="btn" type="button" id="eSave">'+(t==='partner'&&!isNew&&!isAdm()?'（担当者は保存できません）':'保存する')+'</button><button class="btn o" type="button" data-close="'+v+'">一覧に戻る</button></div>';
 if(t==='case'&&!isNew){
  h+=sub('振り分け（お客様が選んだ内容ごとの取次ぎ先）',(o.suggest&&o.suggest.length?'<ul class="ul">'+o.suggest.map(function(x){return '<li><b>'+esc(x.service)+'</b>　'+(x.assigned?'<span class="tag done">取次ぎ済み：'+esc(x.assigned)+'</span>':'')+'<div class="asg">'+x.partners.concat(x.builtins||[]).map(function(p){return '<button type="button" class="small-btn'+(p.builtin?' o':'')+'" data-assign="'+esc(p.id)+'" data-svc="'+esc(x.service)+'">'+esc(p.name)+'</button>'}).join('')+'</div></li>'}).join('')+'</ul>':'<p class="hint">お客様が選んだ内容がありません。下の「＋ 取次ぎを追加」から選んでください。</p>'),'route');
  h+=sub('取次ぎ',(r.refs.length?'<ul class="ul">'+r.refs.map(function(x){return '<li><button type="button" class="lnk" data-open="ref" data-id="'+esc(x.id)+'">'+esc(x.partner_name)+'</button>　'+esc(x.service)+'　<span class="tag st-'+esc(x.status)+'">'+esc(x.status)+'</span> '+(x.sent_at?'<span class="tag done">送信済み</span>':'<button type="button" class="small-btn gold" data-sendref="'+esc(x.id)+'">取次ぎ先に送る</button>')+'</li>'}).join('')+'</ul>':'<p class="hint">まだありません</p>')+'<button type="button" class="small-btn" id="eAddRef">＋ 取次ぎを追加</button>');
  h+=sub('お客様への進捗報告','<p class="hint">'+(o.report_days<0?'まだ一度も報告していません。':'前回の報告：'+(o.report_days?o.report_days+'日前':'今日')+'（これまで '+esc(o.reports||0)+' 回）')+'</p><button type="button" class="small-btn" id="eReport">報告の文章をつくる</button>');
  h+=sub('電子契約',conList(r.contracts)+'<button type="button" class="small-btn" id="eSendK">契約書を送る（秘密保持・買取など）</button>');
 }
 if(t==='partner'&&!isNew){
  if(isAdm()&&o.apply_status!=='提携開始')h+='<div class="note" style="margin-top:16px">'+(o.apply_status==='見送り'?'見送りにした申し込みです。':'契約が済んだら「提携を始める」を押してください。提携先（会員）になり、取次ぎ先として選べるようになります。')+'<div class="btns"><button type="button" class="btn" id="eApprove">提携を始める</button>'+(o.apply_status!=='見送り'?'<button type="button" class="btn o" id="eDecline">見送る</button>':'')+'</div></div>';
  h+=sub('電子契約',conList(r.contracts)+'<button type="button" class="small-btn" data-sendp="nda">秘密保持契約書を送る</button><button type="button" class="small-btn" data-sendp="teikei">業務提携契約書を送る</button>');
  if(o.apply_status==='提携開始')h+=sub('この提携先への取次ぎ',r.refs.length?'<ul class="ul">'+r.refs.map(function(x){return '<li><button type="button" class="lnk" data-open="ref" data-id="'+esc(x.id)+'">'+esc(x.case_name)+'</button>　'+esc(x.service)+'　<span class="tag st-'+esc(x.status)+'">'+esc(x.status)+'</span></li>'}).join('')+'</ul>':'<p class="hint">まだありません</p>');
 }
 if(!isNew&&(t==='case'||t==='partner')){var lg=[];try{lg=JSON.parse(o.log||'[]')}catch(e){}
  h+=sub('対応の記録','<div class="fld"><label for="eNote">対応したことを書く（例：電話でご連絡、来週訪問の約束）</label><textarea id="eNote"></textarea></div><button type="button" class="small-btn" id="eNoteBtn">記録に残す</button><ul class="log">'+lg.slice().reverse().map(function(x){return '<li><small>'+esc(x.t)+'</small>'+esc(x.text).replace(/\n/g,'<br>')+'</li>'}).join('')+'</ul>');}
 if(t==='partner'&&!isNew&&isAdm()&&o.apply_status==='提携開始')h+=sub('提携先ページのログイン','<p class="hint">提携先が自分のIDとパスワードで入るページです（'+esc((window.KEIYAKU_SITE_URL||'https://iejimai123.jp/')+'partner/')+'）。取り次いだ案件の確認、進捗の報告、お客様へのメール、書類の登録、電子契約、請求書の作成ができます。'+(o.login_id?'<br>今のログインID：<b>'+esc(o.login_id)+'</b>'+(o.last_login?'（最後のログイン：'+esc(o.last_login)+'）':''):'<br>まだログインできません。')+'</p><div class="grid"><div class="fld"><label for="ptLid">ログインID（半角の英字と数字）</label><input type="text" id="ptLid" value="'+esc(o.login_id||'')+'" autocapitalize="off" spellcheck="false"></div><div class="fld"><label for="ptPw">パスワード（英字と数字をまぜて8文字以上）</label><input type="text" id="ptPw" autocomplete="off"></div></div><button type="button" class="small-btn" id="ptSet">設定する</button>'+(o.login_id?' <button type="button" class="small-btn" data-pv="partner">今のパスワードを見る</button><p class="hint" id="pvOut"></p>':'')+'');
 if(t==='ref'&&!isNew)h+=sub('提携先の動き（提携先ページからの報告・連絡・書類・契約・請求書）','<div id="refx"><p class="hint">読み込み中…</p></div>');
 if(t==='staff'&&!isNew)h+=sub('ログインIDとパスワード（担当者のアカウント）','<p class="hint">'+(o.login_id?'今のログインID：<b>'+esc(o.login_id)+'</b>。パスワードを忘れたときは、ここで新しく決め直します。':'まだログインできません。ログインIDとパスワードを決めて「設定する」を押し、本人に伝えてください。')+'</p><div class="grid"><div class="fld"><label for="sLid">ログインID（半角の英字と数字）</label><input type="text" id="sLid" value="'+esc(o.login_id||'')+'" autocapitalize="off" spellcheck="false"></div><div class="fld"><label for="sPw">パスワード（英字と数字をまぜて8文字以上）</label><input type="text" id="sPw" autocomplete="off"></div></div><button type="button" class="small-btn" id="sSet">設定する</button>'+(o.login_id&&isAdm()?' <button type="button" class="small-btn" data-pv="staff">今のパスワードを見る</button><p class="hint" id="pvOut"></p>':'')+(o.ref_code?'<p class="hint">この担当者専用の申し込みページ：<b>'+esc((window.KEIYAKU_SITE_URL||'https://iejimai123.jp/')+'kyoryoku/?r='+o.ref_code)+'</b></p>':''));
 if(t==='staff'&&!isNew&&isAdm()){var cur=String(o.perms||''),L=(OPTS.staffPerms||[]),on=function(p){return cur?(cur!=='none'&&cur.split(',').indexOf(p[0])>=0):p[2]};
  h+=sub('この担当者に使わせる機能（権限）','<p class="hint">印を付けた機能だけを、この担当者が使えます。お客様の相談・取次ぎ・お客様の名簿・担当者の管理・操作の記録は、印に関係なく担当者には見えません。</p><div class="chk">'+L.map(function(p){return '<label><input type="checkbox" class="pmk" value="'+esc(p[0])+'"'+(on(p)?' checked':'')+'> '+esc(p[1])+'</label>'}).join('')+'</div><button type="button" class="small-btn" id="pSet">権限を保存する</button>')}
 if(!isNew&&isAdm()&&t!=='staff')h+='<div class="danger"><button type="button" class="small-btn warn" id="eDel">この記録を消す</button></div>';
 showEd(v,h);
 if(t==='partner'){var bx=$('e_partner_categories');pcats(o).forEach(function(x){bnRow(bx,x)});if(!bx.children.length)bnRow(bx)}
 if(t==='case')treeWire('tc');
 if(t==='ref'){treeWire('tc',refPick);refPick();if(!isNew)loadRefx(o.id)}
 if(t==='partner'&&!isNew&&!isAdm()){edBox(v).querySelectorAll('input,select,textarea').forEach(function(i){i.disabled=true});$('eSave').disabled=true}}
function refPick(){var s=$('rPid');if(!s)return;var svc=($('tc2')||{}).value||'',cur=s.value,ps=CUR.partners||[],bl=CUR.builtins||[];
 var fit=ps.filter(function(p){return svc&&split(p.fields).indexOf(svc)>=0}),rest=ps.filter(function(p){return fit.indexOf(p)<0});
 var o=function(p){return '<option value="'+esc(p.id)+'"'+(p.id===cur?' selected':'')+'>'+esc(p.name)+(p.kind?'（'+esc(p.kind)+'）':'')+'</option>'};
 s.innerHTML='<option value="">選んでください</option>'+(fit.length?'<optgroup label="この分野に合う提携先（'+fit.length+'）">'+fit.map(o).join('')+'</optgroup>':'')+'<optgroup label="いつでも選べるもの">'+bl.map(o).join('')+'</optgroup>'+(rest.length?'<optgroup label="そのほかの提携先">'+rest.map(o).join('')+'</optgroup>':'');
 s.onchange=function(){$('rOtherBox').hidden=s.value!=='OTHER'};$('rOtherBox').hidden=s.value!=='OTHER'}
function conList(cs){return cs.length?'<ul class="ul">'+cs.map(function(k){return '<li>'+esc(k.id)+'　'+esc(k.title)+'　<span class="tag '+(k.status==='締結済み'?'done':k.status==='取り消し'?'cancel':'')+'">'+esc(k.status)+'</span></li>'}).join('')+'</ul>':'<p class="hint">まだありません</p>'}

document.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.dataset.close){closeEd(b.dataset.close);if(b.dataset.close==='home')home();else load(b.dataset.close)}
 if(b.dataset.new){var nv=b.dataset.new==='partner'&&VIEW==='home'?'home':b.dataset.new;if(nv==='home'){CUR={v:'home',t:'partner',row:{kind:'協力企業'}};showEd('home','');render('home',{row:{kind:'協力企業',apply_status:'新規申込'},refs:[],contracts:[]});return}openEd(nv,'')}
 if(b.id==='eSave'){var t=CUR.t,o=collect(t==='partner'?'partner':t);o.id=CUR.row.id||'';
  if(t==='ref'){o.case_id=CUR.row.case_id;o.partner_id=CUR.row.partner_id||($('rPid')||{}).value||'';o.partner_name=($('rPname')||{}).value||'';o.service=(o.cat2||'')+(o.cat3?'：'+o.cat3:'')||CUR.row.service||'';if(!o.partner_id){$('errE').textContent='取次ぎ先を選んでください。';return}}
  if(t==='case'&&!o.cat1&&o.cat2)o.cat1=cbCat(o.cat2);
  b.disabled=true;$('errE').textContent='';api('kanri.save',{table:t,row:o}).then(function(r){toast('保存しました');
   if(CUR.v==='home'){closeEd('home');home();return}
   if(t==='ref'){if(!o.id&&confirm('取次ぎを保存しました。続けて、取次ぎ先に相談の内容を送りますか？（送る前に確認の画面が出ます）')){openSend(r.id);}if(r.reportSuggested){go('case');openEd('case',r.caseId);if(o.id)openReport(r.caseId,true)}else openEd('ref',r.id);return}
   openEd(CUR.v,r.id);if(t==='case'&&r.reportSuggested)openReport(r.id,true)}).catch(function(x){$('errE').textContent=x.message;b.disabled=false})}
 if(b.id==='eNoteBtn'){var tx=$('eNote').value.trim();if(!tx)return;b.disabled=true;api('kanri.note',{table:CUR.t,id:CUR.row.id,text:tx}).then(function(){toast('記録しました');openEd(CUR.v,CUR.row.id)}).catch(function(x){$('errE').textContent=x.message;b.disabled=false})}
 if(b.dataset.assign){var c3=CUR.row,svc=b.dataset.svc;CUR={v:'ref',t:'ref',row:{case_id:c3.id,case_name:c3.name,status:'依頼済み',date:new Date().toISOString().slice(0,10),cat1:cbCat(svc)||c3.cat1,cat2:svc,partner_id:b.dataset.assign},partners:CUR.partners,builtins:CUR.builtins};if(VIEW!=='ref')go('ref');showEd('ref','');render('ref',{row:CUR.row,refs:[],contracts:[]});var s=$('rPid');if(s){refPick();s.value=b.dataset.assign;s.onchange()}return}
 if(b.id==='eAddRef'){var c=CUR.row;CUR={v:'ref',t:'ref',row:{case_id:c.id,case_name:c.name,status:'依頼済み',date:new Date().toISOString().slice(0,10),cat1:c.cat1,cat2:c.cat2,cat3:c.cat3},partners:CUR.partners,builtins:CUR.builtins};if(VIEW!=='ref')go('ref');showEd('ref','');render('ref',{row:CUR.row,refs:[],contracts:[]})}
 if(b.id==='eSendRef'){openSend(CUR.row.id)}
 if(b.dataset.sendref){openSend(b.dataset.sendref)}
 if(b.id==='eReport'){openReport(CUR.row.id);return}
 if(b.id==='eApprove'){var pr=Object.assign({},collect('partner'),{id:CUR.row.id,apply_status:'提携開始',active:'取引中'});b.disabled=true;api('kanri.save',{table:'partner',row:pr}).then(function(){toast('提携を始めました');go('partner');openEd('partner',CUR.row.id)}).catch(function(x){$('errE').textContent=x.message;b.disabled=false})}
 if(b.id==='eDecline'){if(!confirm('この申し込みを見送りにしますか？'))return;var pd=Object.assign({},collect('partner'),{id:CUR.row.id,apply_status:'見送り'});api('kanri.save',{table:'partner',row:pd}).then(function(){toast('見送りにしました');openEd(CUR.v,CUR.row.id)}).catch(function(x){$('errE').textContent=x.message})}
 if(b.id==='copyApply'||b.id==='copyMy'){var u=$(b.id==='copyApply'?'applyUrl':'myUrl').textContent;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){toast('住所をコピーしました')}).catch(function(){prompt('この住所をコピーしてください',u)});return}
 if(b.id==='eSendK'){var c2=CUR.row;prefill({link:'case:'+c2.id,label:c2.name+' 様の相談',name:c2.name,email:c2.email,tpl:'nda'})}
 if(b.dataset.sendp){var p=CUR.row;prefill({link:'partner:'+p.id,label:p.name,name:p.person||'',company:p.name,email:p.email,tpl:b.dataset.sendp})}
 if(b.id==='pSet'){b.disabled=true;var pk=[].map.call(document.querySelectorAll('.pmk:checked'),function(x){return x.value});api('kanri.staffperms',{id:CUR.row.id,perms:pk}).then(function(){toast('権限を保存しました。次の操作から反映されます');openEd('staff',CUR.row.id)}).catch(function(x){$('errE').textContent=x.message;b.disabled=false})}
 if(b.dataset.pv){b.disabled=true;api('kanri.passview',{kind:b.dataset.pv,id:CUR.row.id}).then(function(r){$('pvOut').innerHTML=r.pass?'ログインID：<b>'+esc(r.login_id)+'</b>　パスワード：<b>'+esc(r.pass)+'</b>（見たことは操作の記録に残ります）':'このパスワードは控えがありません（見られる仕組みを入れる前に決めたものです）。上で決め直すと、次から見られます。';b.disabled=false}).catch(function(x){$('errE').textContent=x.message;b.disabled=false})}
 if(b.id==='ptSet'){b.disabled=true;api('kanri.partnerpass',{id:CUR.row.id,login_id:$('ptLid').value.trim(),pass:$('ptPw').value}).then(function(){toast('提携先ページのログインを設定しました。提携先に伝えてください');openEd(CUR.t,CUR.row.id)}).catch(function(x){$('errE').textContent=x.message;b.disabled=false})}
 if(b.dataset.fidx){api('kanri.file',{fid:b.dataset.fidx}).then(function(r){dlBlob(r.data,r.mime,r.filename)}).catch(function(x){$('errE').textContent=x.message})}
 if(b.dataset.invx){api('kanri.invpdf',{id:b.dataset.invx}).then(function(r){dlBlob(r.pdf,'application/pdf',r.filename)}).catch(function(x){$('errE').textContent=x.message})}
 if(b.dataset.kvx){api('admin.view',{id:b.dataset.kvx}).then(function(r){showDoc(r,false)}).catch(function(x){$('errE').textContent=x.message})}
 if(b.id==='sSet'){b.disabled=true;api('kanri.staffpass',{id:CUR.row.id,login_id:$('sLid').value.trim(),pass:$('sPw').value}).then(function(){toast('ログインIDとパスワードを設定しました。本人に伝えてください');openEd('staff',CUR.row.id)}).catch(function(x){$('errE').textContent=x.message;b.disabled=false})}
 if(b.id==='eDel'){if(!confirm('この記録を消しますか？元には戻せません。'))return;var v2=CUR.v;api('kanri.remove',{table:CUR.t,id:CUR.row.id}).then(function(){toast('消しました');closeEd(v2);load(v2)}).catch(function(x){$('errE').textContent=x.message})}
 if(b.id==='openForm'||b.id==='openForm2'){openForm()}
});
