/* 管理画面：取次ぎ先へ送る・登録フォームを送る */
/* ---------- 取次ぎ先へ送る（確認してから） ---------- */
var SND=null,SPICK=[['name','お名前',1],['relation','ご関係',0],['phone','電話',1],['email','メール',0],['contact_pref','ご希望の連絡方法',1],['area','場所',1],['housing','住まい',1],['timing','時期',1],['services','ご相談の内容',1],['worries','お悩み',1],['detail','伝えておきたいこと',1]];
function sendBody(){var r=SND.r,c=r.c,pk=[].filter.call($('sPick').querySelectorAll('input:checked'),function(i){return 1}).map(function(i){return i.value});
 var lines=SPICK.filter(function(x){return pk.indexOf(x[0])>=0&&c[x[0]]}).map(function(x){return '・'+x[1]+'：'+c[x[0]]});
 return (r.person?r.person+' 様\n':r.partner+' ご担当者様\n')+'\nいつもお世話になっております。家じまい123です。\n下記のご相談について、ご対応をお願いいたします。\n\n【お願いしたい内容】\n'+(r.ref.cat2||r.ref.service)+(r.ref.cat3?'（'+r.ref.cat3+'）':'')+(r.ref.memo?'\n'+r.ref.memo:'')+'\n\n【お客様の情報】\n'+lines.join('\n')+'\n\n※お客様から、このご連絡の同意をいただいています。いただいた情報は、このご相談の対応のためだけにお使いください。\n※ご対応の見込み（ご連絡の日・お見積りの日）を、この窓口までお知らせください。\n\n家じまい123　0120-659-470（受付 10:00〜18:00）\n取次ぎ番号：'+r.ref.id}
function openSend(id){$('errSend').textContent='';$('sBody').value='読み込み中…';$('sOk').checked=false;try{$('sendDlg').showModal()}catch(e){$('sendDlg').setAttribute('open','')}
 api('kanri.ref.draft',{id:id}).then(function(r){SND={id:id,r:r,edited:false};$('sTo').value=r.to||'';
  $('sPick').innerHTML=SPICK.map(function(x){return '<label><input type="checkbox" value="'+x[0]+'"'+(x[2]&&r.c[x[0]]?' checked':'')+(r.c[x[0]]?'':' disabled')+'> '+x[1]+(r.c[x[0]]?'':'（なし）')+'</label>'}).join('');
  $('sSub').value='【家じまい123】ご相談のお取次ぎ（'+(r.ref.cat2||r.ref.service||'')+'）';$('sBody').value=sendBody();
  $('sInfo').textContent=(r.sent_at?'前回の送信：'+r.sent_at+'（'+r.sent_to+'）。もう一度送ることもできます。':'')+(r.to?'':'　この取次ぎ先には、メールアドレスが登録されていません。送り先を入れてください。')}).catch(function(e){$('errSend').textContent=e.message})}
$('sPick').addEventListener('change',function(){if(SND.edited&&!confirm('本文を手で直しています。選んだ情報で本文を作り直しますか？'))return;$('sBody').value=sendBody();SND.edited=false});
$('sBody').addEventListener('input',function(){if(SND)SND.edited=true});
function closeSend(){try{$('sendDlg').close()}catch(e){$('sendDlg').removeAttribute('open')}}
$('sCancel').addEventListener('click',closeSend);
$('sGo').addEventListener('click',function(){var b=this;$('errSend').textContent='';if(!$('sOk').checked){$('errSend').textContent='お客様の同意をいただいたか確かめて、印を付けてください。';return}
 if(!confirm($('sTo').value+' に送ります。よろしいですか？'))return;b.disabled=true;
 api('kanri.ref.send',{id:SND.id,to:$('sTo').value.trim(),subject:$('sSub').value,body:$('sBody').value,consent:true}).then(function(){closeSend();toast('取次ぎ先に送りました');if(CUR.v==='ref'&&CUR.row.id===SND.id)openEd('ref',SND.id);else if(CUR.v==='case')openEd('case',CUR.row.id)}).catch(function(e){$('errSend').textContent=e.message}).then(function(){b.disabled=false})});

/* ---------- 登録フォームを送る ---------- */
function openForm(){$('errForm').textContent='';['fCo','fPs','fTo','fMsg'].forEach(function(i){$(i).value=''});try{$('formDlg').showModal()}catch(e){$('formDlg').setAttribute('open','')}$('fCo').focus()}
function closeForm(){try{$('formDlg').close()}catch(e){$('formDlg').removeAttribute('open')}}
$('fCancel').addEventListener('click',closeForm);
$('fGo').addEventListener('click',function(){var b=this;$('errForm').textContent='';var to=$('fTo').value.trim();if(!$('fCo').value.trim()||!to){$('errForm').textContent='会社名と送り先を入れてください。';return}
 if(!confirm(to+' に、提携・協業の申し込みページの案内を送ります。よろしいですか？'))return;b.disabled=true;
 api('staff.sendForm',{to:to,company:$('fCo').value.trim(),person:$('fPs').value.trim(),message:$('fMsg').value}).then(function(){closeForm();toast('登録フォームの案内を送りました');if(VIEW==='home')home()}).catch(function(e){$('errForm').textContent=e.message}).then(function(){b.disabled=false})});
