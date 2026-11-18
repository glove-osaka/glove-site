/* 管理画面：ログインと起動 */
function start(){$('tabs').hidden=false;soundLabel();$('applyUrl').textContent=(window.KEIYAKU_SITE_URL||'https://iejimai123.jp/')+'kyoryoku/';
 api('admin.me').then(function(r){if(r.me&&r.me.r==='partner'){location.href='../partner/';return}ME=r.me||ME;if(ME.r==='staff'){PERMS=r.perms||[];applyPerms()}document.body.classList.toggle('role-staff',ME.r==='staff');$('whoAmI').textContent=(ME.n||'')+(ME.r==='staff'?'（担当者）':'（管理者）');
  var first=false;try{first=!localStorage.getItem('ij-help-'+ME.r);localStorage.setItem('ij-help-'+ME.r,'1')}catch(e){}
  go(ME.r==='staff'?'home':'dash');if(first)openHelp()}).catch(function(){go('dash')});
 api('admin.templates').then(function(r){TPL=r.templates;FIELDS=r.fields;setNames(r.names||[]);$('tpl').innerHTML=TPL.map(function(t){return'<option value="'+t.key+'">'+esc(t.title)+'</option>'}).join('');onTpl()}).catch(function(e){$('errI').textContent=e.message});
}
function showLogin(msg){$('tabs').hidden=true;document.querySelectorAll('.view').forEach(function(x){x.hidden=true});$('gate').hidden=false;$('errL').textContent=msg||'';$('lpw').value='';setTimeout(function(){$('lid').focus()},50)}
$('lshow').addEventListener('change',function(){$('lpw').type=this.checked?'text':'password'});
$('loginForm').addEventListener('submit',function(e){e.preventDefault();var b=$('lbtn');b.disabled=true;$('errL').textContent='';
 api('admin.login',{id:$('lid').value.trim(),pass:$('lpw').value}).then(function(r){keiyakuSession(r.session);$('gate').hidden=true;$('lpw').value='';start()}).catch(function(x){$('errL').textContent=x.message}).then(function(){b.disabled=false})});
function logout(){api('admin.logout').catch(function(){}).then(function(){keiyakuSession('');showLogin('ログアウトしました')})}
document.addEventListener('ij-relogin',function(){showLogin('ログインの有効時間が切れました。もう一度ログインしてください')});
$('pwBtn').addEventListener('click',function(){var b=this;$('errP').textContent='';if($('pwNew').value!==$('pwNew2').value){$('errP').textContent='新しいパスワードが、確認のものと一致しません';return}
 b.disabled=true;api('admin.password',{current:$('pwNow').value,next:$('pwNew').value}).then(function(){['pwNow','pwNew','pwNew2'].forEach(function(i){$(i).value=''});toast('パスワードを変えました')}).catch(function(x){$('errP').textContent=x.message}).then(function(){b.disabled=false})});
if(IN_GAS){$('logout').hidden=true;$('chgBox').hidden=true;$('setBox').hidden=false;document.querySelector('[data-v="acct"]').textContent='ID・パスワード登録';
 api('admin.loginState').then(function(r){$('setState').textContent=r.ready?'登録済みです（ログインID：'+r.id+'）。登録し直すと、前のパスワードは使えなくなります。':'まだ登録されていません。ここで登録してください。';if(r.id)$('setId').value=r.id;if(!r.ready)go('acct')}).catch(function(){})}
$('setShow').addEventListener('change',function(){$('setPw').type=$('setPw2').type=this.checked?'text':'password'});
$('setBtn').addEventListener('click',function(){var b=this;$('errS').textContent='';if($('setPw').value!==$('setPw2').value){$('errS').textContent='パスワードが、確認のものと一致しません';return}
 b.disabled=true;api('admin.setlogin',{id:$('setId').value.trim(),pass:$('setPw').value}).then(function(){$('setPw').value=$('setPw2').value='';$('setState').textContent='登録しました（ログインID：'+$('setId').value.trim()+'）。';toast('登録しました')}).catch(function(x){$('errS').textContent=x.message}).then(function(){b.disabled=false})});
if(IN_GAS||window.KEIYAKU_DEMO||keiyakuHasSession()){start()}else{showLogin()}
