/* 管理画面：共通の道具（画面の部品・文字の安全化・通信） */
var $=function(id){return document.getElementById(id)},TPL=[],FIELDS={},LINK='',REPLACES='',DATA={case:[],ref:[],partner:[],staff:[],log:[]},OPTS={caseStatus:[],refStatus:[],applyStatus:[],staff:[]},CONTRACTS=[],ME={r:'admin',n:''};
var IN_GAS=!!window.IN_GAS;
if(window.KEIYAKU_DEMO&&!IN_GAS)$('demoBar').hidden=false;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function day(s){if(!s)return'';var m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return(+m[2])+'/'+(+m[3]);var d=new Date(s);return isNaN(d)?esc(s):(d.getMonth()+1)+'/'+d.getDate()}
function api(a,d){return keiyakuApi(a,d||{})}
function toast(t){var e=$('toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},2600)}
function short(s,n){s=String(s||'');return s.length>n?s.slice(0,n)+'…':s}
function split(s){return String(s||'').split(/[、,，\n]+/).map(function(x){return x.trim()}).filter(String)}
function opt(v,list,ph){return (ph!=null?'<option value="">'+esc(ph)+'</option>':'')+list.map(function(x){return '<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>'}).join('')}
function isAdm(){return ME.r!=='staff'}
