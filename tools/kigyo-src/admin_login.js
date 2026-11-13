
/* ===== 管理者ログイン（トップページから ID とパスワードで相談管理へ） ===== */
const ADM_API = D.formUrl;
const adm = document.createElement('div');
adm.innerHTML = `<div class="adm-ov" id="admOv" hidden><div class="adm-box" role="dialog" aria-modal="true" aria-labelledby="admTtl">
  <div class="adm-head"><b id="admTtl">管理者ログイン</b><button type="button" class="adm-x" id="admX" aria-label="閉じる">✕</button></div>
  <form id="admF" class="adm-body" autocomplete="on">
    <p class="adm-lead">相談管理の画面に入ります。担当者の ID とパスワードを入れてください。</p>
    <label>ID<input type="text" id="admId" autocomplete="username" autocapitalize="off" spellcheck="false" required></label>
    <label>パスワード<input type="password" id="admPw" autocomplete="current-password" required></label>
    <div class="adm-err" id="admErr" role="alert"></div>
    <button type="submit" class="btn btn-g" id="admGo">ログイン</button>
    <a class="adm-link" href="kanri/" rel="nofollow">はじめての登録・パスワードを忘れたとき</a>
  </form></div></div>`;
document.body.appendChild(adm);
const admOv = $('#admOv');
let admBack = null;
function admOpen(on){ admOv.hidden = !on; document.body.classList.toggle('adm-on', on); if (on) { admBack = document.activeElement; $('#admErr').textContent = ''; setTimeout(() => $('#admId').focus(), 30); } else if (admBack) admBack.focus(); }
$$('[data-admin]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); admOpen(true); }));
$('#admX').addEventListener('click', () => admOpen(false));
admOv.addEventListener('click', e => { if (e.target === admOv) admOpen(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !admOv.hidden) admOpen(false); });
$('#admF').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('#admId').value.trim(), pw = $('#admPw').value, b = $('#admGo'), er = $('#admErr');
  if (!id || !pw) { er.textContent = 'ID とパスワードを入れてください。'; return; }
  b.disabled = true; b.textContent = '確認しています…'; er.textContent = '';
  try {
    const r = await fetch(ADM_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn: 'login', args: [id, pw] }), credentials: 'omit', cache: 'no-store' }).then(x => x.json());
    const res = r && r.ok ? r.result : null;
    if (!res || !res.ok) { er.textContent = (res && res.error) || 'ログインできませんでした。'; return; }
    try { sessionStorage.setItem('kg-token', res.token); } catch (x) {}
    $('#admPw').value = '';
    location.href = 'kanri/';
  } catch (x) { er.textContent = '接続できませんでした。時間をおいてお試しください。'; }
  finally { b.disabled = false; b.textContent = 'ログイン'; }
});
