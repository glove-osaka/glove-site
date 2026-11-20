/* 管理画面：画面の切り替えと「今やること」 */
/* ---------- 画面の切り替え ---------- */
var VIEW='dash',TB={case:'case',ref:'ref',apply:'partner',partner:'partner',staff:'staff',home:'partner'};
function go(v){VIEW=v;document.querySelectorAll('.view').forEach(function(x){x.hidden=x.id!=='v-'+v});
 document.querySelectorAll('#tabs button[data-v]').forEach(function(b){b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-current',b.dataset.v===v?'page':'false')});
 if(v==='dash')dash();if(v==='home')home();if(TB[v]&&v!=='home'){closeEd(v);load(v)}if(v==='log')loadLog();if(v==='cust')loadCust();if(v==='keiyaku')list();window.scrollTo(0,0)}
$('tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.id==='logout'){logout();return}if(b.id==='sound'){soundToggle();return}if(b.id==='helpBtn'){openHelp();return}if(b.dataset.v)go(b.dataset.v)});

/* ---------- 今やること（管理者） ---------- */
var STEPS=['新規','連絡済み','面談予定','対応中','取次ぎ中','完了'],ASTEPS=['新規申込','連絡済み','面談日調整中','面談予定','面談済み・確認中','契約書送付済み','提携開始'];
function steps(st,list){list=list||STEPS;if(st==='見送り')return '<span class="tag st-見送り">見送り</span>';var i=list.indexOf(st);if(i<0)i=0;
 return '<span class="prog" title="'+esc(st)+'">'+list.map(function(x,j){return '<i class="'+(j<i?'d':j===i?'c':'')+'"></i>'}).join('')+'</span><small class="progt">'+esc(st)+'</small>'}
function badges(c){return (c.alerts||[]).map(function(a){return '<span class="al al-'+a.lv+'">'+(a.lv==='red'?'⚠ ':'')+esc(a.text)+'</span>'}).join('')}
function idle(c){if(c.status==='完了'||c.status==='見送り')return '';var d=+c.idle_days||0;return '<b class="idle'+(d>=7?' r':d>=3?' y':'')+'">'+(d?d+'日':'今日')+'</b>'}
var LASTRED=-1;
function todoItem(n,lv,title,how,btn){return '<li class="td td-'+lv+'"><b class="n">'+n+'</b><div><b>'+title+'</b><span>'+how+'</span></div>'+btn+'</li>'}
function dash(quiet){if(!quiet)$('errD').textContent='';return api('kanri.dash').then(function(r){var c=r.counts;OPTS=r.opts||OPTS;
 var td=[],k=0,nm=function(a){return a.slice(0,3).map(function(x){return esc(x.name)}).join('、')+(a.length>3?' ほか':'')};
 if(c.newCase)td.push(todoItem(++k,'red','未対応の新しい相談が '+c.newCase+' 件','まずお電話してください。終わったら状態を「連絡済み」にします。（'+nm(r.newest)+'）','<button type="button" class="small-btn" data-go="case" data-filter="new">開く</button>'));
 if(c.newApply)td.push(todoItem(++k,'red','新しい提携・協業の申し込みが '+c.newApply+' 件','担当者を決めて、面談の日の調整のご連絡をします。','<button type="button" class="small-btn" data-go="apply" data-filter="新規申込">開く</button>'));
 var reds=r.alerts.filter(function(x){return x.level==='red'&&x.status!=='新規'});
 if(reds.length)td.push(todoItem(++k,'red','急ぎの相談が '+reds.length+' 件','期日を過ぎた・長く動きがないものです。（'+nm(reds)+'）','<button type="button" class="small-btn" data-go="case" data-filter="alert">開く</button>'));
 var ar=(r.apps||[]).filter(function(x){return x.level&&x.apply_status!=='新規申込'});
 if(ar.length)td.push(todoItem(++k,'yellow','気をつける申し込みが '+ar.length+' 件','面談が近い・担当者が決まっていない・動きがないものです。','<button type="button" class="small-btn" data-go="apply" data-filter="open">開く</button>'));
 if(c.noStaff)td.push(todoItem(++k,'yellow','担当者が決まっていない相談が '+c.noStaff+' 件','1件の画面で「担当者」を選んで保存します。','<button type="button" class="small-btn" data-go="case" data-filter="nostaff">開く</button>'));
 if(c.unrouted)td.push(todoItem(++k,'yellow','振り分けが済んでいない相談が '+c.unrouted+' 件','1件の画面の「振り分け」から、取次ぎ先を選びます。','<button type="button" class="small-btn" data-go="case" data-filter="open">開く</button>'));
 if(c.waiting)td.push(todoItem(++k,'','返事待ちの契約書が '+c.waiting+' 件','3日以上たっても返事がなければ「もう一度送る」か、お電話で確かめます。','<button type="button" class="small-btn" data-go="keiyaku">開く</button>'));
 $('todoList').innerHTML=td.length?'<ol class="todo-l">'+td.join('')+'</ol>':'<p class="ok-msg">今すぐやることはありません。すべて順調です。</p>';
 var t=[['急ぎ',c.red,'case','alert','red'],['未対応の新しい相談',c.newCase,'case','new',c.newCase?'red':''],['対応中の相談',c.open,'case','open',''],['進行中の取次ぎ',c.refOpen,'ref','',''],['対応中の申し込み',c.pendingPartner||0,'apply','open',c.newApply?'yellow':''],['提携先（取引中）',c.members||0,'partner','取引中',''],['返事待ちの契約書',c.waiting,'keiyaku','',''],['今月の締結',c.signedMonth,'keiyaku','','']];
 $('tiles').innerHTML=t.map(function(x){return '<button type="button" class="tile'+(x[1]&&x[4]?' t-'+x[4]:'')+'" data-go="'+x[2]+'" data-filter="'+x[3]+'"><b>'+x[1]+'</b><span>'+x[0]+'</span></button>'}).join('');
 var bars=function(a){var mx=Math.max.apply(null,a.map(function(s){return s.n}).concat([1]));return a.map(function(s){return '<div class="stg"><span>'+esc(s.status)+'</span><i style="width:'+Math.round(s.n/mx*100)+'%"></i><b>'+s.n+'</b></div>'}).join('')};
 $('stages').innerHTML=bars(r.stages);$('astages').innerHTML=bars(r.astages||[]);
 document.title=(c.red?'('+c.red+') ':'')+'管理画面｜家じまい123';
 if(c.red&&(LASTRED<0||c.red>LASTRED))chime(c.red);LASTRED=c.red}).catch(function(e){if(!quiet)$('errD').textContent=e.message})}
/* 注意の音 */
var SOUND=true;try{SOUND=localStorage.getItem('ij-sound')!=='off'}catch(e){}
function soundLabel(){var b=$('sound');b.textContent=SOUND?'🔔 音：オン':'🔕 音：オフ';b.setAttribute('aria-pressed',SOUND?'true':'false')}
function soundToggle(){SOUND=!SOUND;try{localStorage.setItem('ij-sound',SOUND?'on':'off')}catch(e){}soundLabel();if(SOUND)chime(1)}
var AC=null;function chime(n){if(!SOUND)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var t=AC.currentTime;[0,0.28,0.56].slice(0,Math.min(3,n||1)).forEach(function(d,i){var o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=i%2?660:880;g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(0.25,t+d+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.25);o.connect(g);g.connect(AC.destination);o.start(t+d);o.stop(t+d+0.3)})}catch(e){}}
setInterval(function(){if(!$('tabs').hidden&&isAdm())dash(VIEW!=='dash')},5*60*1000);
document.addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(b){if(b.dataset.filter!=null){var f=document.querySelector('[data-f="'+b.dataset.go+'"][data-k="st"]');if(f&&[].some.call(f.options,function(o){return o.value===b.dataset.filter}))f.value=b.dataset.filter}go(b.dataset.go)}
 var o=e.target.closest('[data-open]');if(o){var t=o.dataset.open;if(VIEW!==t){go(t)}openEd(t,o.dataset.id)}});
