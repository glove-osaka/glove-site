
/* ===== 管理者ログイン：トップの「管理者ログイン」から、管理画面（/kanri/）のログインへ ===== */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('[data-admin]');
  if (!a) return;
  e.preventDefault();
  location.href = '/kanri/';
});
