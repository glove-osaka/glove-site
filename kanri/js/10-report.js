/* 管理画面：進捗報告 */
/* ---------- 進捗報告 ---------- */
var REP=null;
function openReport(id,auto){REP={id:id};$('errRep').textContent='';$('repBody').value='文章をつくっています…';$('repSub').value='';$('repWarn').hidden=true;
 $('repT').textContent=auto?'状態が変わりました。お客様に報告しますか？':'お客様への進捗報告';
 try{$('rep').showModal()}catch(e){$('rep').setAttribute('open','')}
 api('kanri.report.draft',{id:id}).then(function(r){REP.r=r;$('repSub').value=r.subject;$('repBody').value=r.body;
  $('repInfo').textContent=(r.email?'メール：'+r.email:'メールアドレスなし')+'　'+(r.phone?'電話：'+r.phone:'')+'　'+(r.lastReportDays<0?'（まだ一度も報告していません）':'（前回の報告：'+(r.lastReportDays?r.lastReportDays+'日前':'今日')+'）');
  $('repMail').disabled=!r.email;
  if(r.tooSoon){$('repWarn').hidden=false;$('repWarn').textContent='前回の報告から'+(r.lastReportDays?r.lastReportDays+'日':'まだ1日')+'しかたっていません。連絡が多すぎないよう、急ぎでなければ「今回は送らない」も考えてください。'}
 }).catch(function(e){$('errRep').textContent=e.message})}
function closeReport(){try{$('rep').close()}catch(e){$('rep').removeAttribute('open')}}
function sendReport(ch){var b=event&&event.target;$('errRep').textContent='';
 if(ch==='mail'&&!confirm('このメールを、'+(REP.r&&REP.r.email)+' に送ります。よろしいですか？'))return;
 document.querySelectorAll('#rep .btn').forEach(function(x){x.disabled=true});
 api('kanri.report.send',{id:REP.id,channel:ch,subject:$('repSub').value,body:$('repBody').value}).then(function(){closeReport();toast(ch==='mail'?'メールで報告しました':ch==='phone'?'報告したことを記録しました':'今回は送らないことを記録しました');if(VIEW==='case')openEd('case',REP.id)})
 .catch(function(e){$('errRep').textContent=e.message}).then(function(){document.querySelectorAll('#rep .btn').forEach(function(x){x.disabled=false});if(REP.r)$('repMail').disabled=!REP.r.email})}
$('repMail').addEventListener('click',function(){sendReport('mail')});
$('repPhone').addEventListener('click',function(){sendReport('phone')});
$('repSkip').addEventListener('click',function(){sendReport('skip')});
$('repRegen').addEventListener('click',function(){openReport(REP.id)});
