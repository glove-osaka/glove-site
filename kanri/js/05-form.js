/* 管理画面：入力欄と分類の選択 */
/* ---------- 入力欄 ---------- */
var SPEC={
 case:[['name','お名前',1],['relation','ご関係（相談された方）','list:ご本人,ご家族（お子さま）,ご家族（配偶者）,ご家族（きょうだい）,ご親戚,ケアマネジャー,病院・施設,地域包括支援センター,その他'],['source','受付の方法','sel:電話,ホームページ,来店,紹介,その他'],['referrer','紹介元（紹介の場合）','ref'],['phone','電話','tel'],['email','メール','email'],['contact_pref','ご希望の連絡方法','list:電話,メール,どれでもよい'],['area','場所（市区町村）'],['housing','住まい','list:一戸建て（持ち家）,マンション（持ち家）,賃貸住宅,施設・その他,住まいは関係しない'],['timing','時期','list:すぐに（1か月以内）,3か月以内,半年以内,時期は決まっていない'],['worries','お悩み','area'],['detail','伝えておきたいこと（ホームページの自由記入）','area'],['memo','メモ','area']],
 partner:[['kind','種類','sel:協力企業,士業,紹介・協業,事業連携'],['name','会社名・事務所名',1],['person','担当者のお名前'],['phone','電話','tel'],['email','メール','email'],['address','所在地'],['categories','提携・協業の分野','cats'],['fields','取次ぎの対象になる相談の分野（分野を選ぶと自動で入ります）','svc'],['area','対応地域（地方→都道府県→市区町村）','areapick'],['license','許認可・資格'],['web','ホームページ'],['intro','自己紹介・強み','area'],['memo','メモ（条件・注意点など）','area']],
 staff:[['name','お名前',1],['role','役割','list:管理者,窓口担当,営業,事務'],['phone','電話','tel'],['email','メール','email'],['active','状態','sel:在籍,停止'],['memo','メモ','area']],
 ref:[['date','依頼日','date'],['status','状態','sel:@refStatus'],['amount','金額（見積もり・成約）'],['memo','メモ（取次ぎ先に伝えること）','area']]
};
function input(t,s,v){var k=s[0],ty=s[2]||'',id='e_'+t+'_'+k,lab='<label for="'+id+'">'+esc(s[1])+(ty===1?'<span class="req">必須</span>':'')+'</label>',h;
 if(typeof ty==='string'&&ty.indexOf('sel:')===0){var o=ty.slice(4);o=o[0]==='@'?OPTS[o.slice(1)]||[]:o.split(',');if(v&&o.indexOf(v)<0)o=[v].concat(o);h='<select id="'+id+'">'+o.map(function(x){return '<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>'}
 else if(typeof ty==='string'&&ty.indexOf('list:')===0){h='<input type="text" id="'+id+'" list="'+id+'_l" value="'+esc(v)+'" placeholder="選ぶか、書き込みます"><datalist id="'+id+'_l">'+ty.slice(5).split(',').map(function(x){return '<option value="'+esc(x)+'">'}).join('')+'</datalist>'}
 else if(ty==='ref'){var ps=(CUR.partners||[]).filter(function(p){return p.kind==='紹介・協業'}).map(function(p){return p.name});h='<input type="text" id="'+id+'" list="'+id+'_l" value="'+esc(v)+'" placeholder="提携先から選ぶか、書き込みます"><datalist id="'+id+'_l">'+ps.map(function(x){return '<option value="'+esc(x)+'">'}).join('')+'</datalist>'}
 else if(ty==='svc'){var cur=split(v),ls=OPTS.services||[],other=cur.filter(function(x){return ls.indexOf(x)<0});
  h='<div class="chk svc" id="'+id+'">'+ls.map(function(x){return '<label><input type="checkbox" value="'+esc(x)+'"'+(cur.indexOf(x)>=0?' checked':'')+'>'+esc(x)+'</label>'}).join('')+'</div><input type="text" id="'+id+'_o" placeholder="ほかの分野（あれば、読点「、」で区切る）" value="'+esc(other.join('、'))+'" style="margin-top:8px">';return '<div class="fld wide"><label>'+esc(s[1])+'</label>'+h+'</div>'}
 else if(ty==='cats'){return '<div class="fld wide"><label>'+esc(s[1])+'（大分類 → 中分類 → 小分類 → 詳細）</label><div class="bnbox" id="'+id+'"></div><button type="button" class="small-btn" data-bnadd="'+id+'">＋ 分野を追加</button></div>'}
 else if(ty==='areapick'){return '<div class="fld wide"><label>'+esc(s[1])+'</label><div class="apbox" id="'+id+'" data-v="'+esc(v)+'"></div></div>'}
 else if(ty==='area'){h='<textarea id="'+id+'">'+esc(v)+'</textarea>'}
 else{h='<input type="'+(ty==='tel'?'tel':ty==='email'?'email':ty==='date'?'date':'text')+'" id="'+id+'" value="'+esc(v)+'">'}
 return '<div class="fld'+(ty==='area'?' wide':'')+'">'+lab+h+'</div>'}
/* 提携先の分野の行（大→中→小→詳細） */
function bnRow(box,x){x=x||{};var r=document.createElement('div');r.className='bn-row';
 r.innerHTML='<label><span>大分類</span><select class="bn1">'+opt(x.l1||'',BN.l1(),'選んでください')+'</select></label><label><span>中分類</span><select class="bn2">'+opt(x.l2||'',x.l1?BN.l2(x.l1):[],x.l1?'選んでください':'先に大分類を選んでください')+'</select></label><label><span>小分類</span><select class="bn3">'+opt(x.l3||'',x.l1&&x.l2?BN.l3(x.l1,x.l2):[],x.l2?'選んでください':'先に中分類を選んでください')+'</select></label><label class="bn-d"><span>詳細</span><input type="text" class="bn4" value="'+esc(x.d||'')+'" placeholder="例：遺品整理は月10件まで"></label><button type="button" class="bn-x">この行を消す</button>';
 var a=r.querySelector('.bn1'),b=r.querySelector('.bn2'),c=r.querySelector('.bn3');
 a.onchange=function(){b.innerHTML=opt('',BN.l2(a.value),a.value?'選んでください':'先に大分類を選んでください');c.innerHTML=opt('',[],'先に中分類を選んでください');syncSvc()};
 b.onchange=function(){c.innerHTML=opt('',b.value?BN.l3(a.value,b.value):[],b.value?'選んでください':'先に中分類を選んでください');syncSvc()};
 c.onchange=syncSvc;r.querySelector('.bn-x').onclick=function(){r.remove();syncSvc()};box.appendChild(r)}
function bnVal(box){return [].map.call(box.querySelectorAll('.bn-row'),function(r){var a=r.querySelector('.bn1').value,b=r.querySelector('.bn2').value,c=r.querySelector('.bn3').value,d=r.querySelector('.bn4').value.trim();return a?a+'／'+(b||'未選択')+'／'+(c||'未選択')+(d?'：'+d:''):''}).filter(String).join('\n')}
function syncSvc(){var box=$('e_partner_categories'),sv=$('e_partner_fields');if(!box||!sv)return;[].forEach.call(box.querySelectorAll('.bn-row'),function(r){BN.svc(r.querySelector('.bn1').value,r.querySelector('.bn2').value,r.querySelector('.bn3').value).forEach(function(s){var i=sv.querySelector('input[value="'+s.replace(/"/g,'')+'"]');if(i)i.checked=true})})}
document.addEventListener('click',function(e){var b=e.target.closest('[data-bnadd]');if(b)bnRow($(b.dataset.bnadd))});
/* お客様の相談の分類（大→中→小→詳細）／取次ぎの分類 */
function tree(pfx,o,note){var a=o.cat1||cbCat(o.cat2)||'',b=o.cat2||'',c=o.cat3||'';
 return '<div class="tree"><div class="fld"><label for="'+pfx+'1">大分類</label><select id="'+pfx+'1">'+opt(a,cb1(),'選んでください')+'</select></div><div class="fld"><label for="'+pfx+'2">中分類（分野）</label><select id="'+pfx+'2">'+opt(b,a?cb2(a):[],a?'選んでください':'先に大分類を選んでください')+'</select></div><div class="fld"><label for="'+pfx+'3">小分類（お手伝いの内容）</label><input type="text" id="'+pfx+'3" list="'+pfx+'3l" value="'+esc(c)+'" placeholder="選ぶか、書き込みます"><datalist id="'+pfx+'3l">'+(a&&b?cb3(a,b).map(function(x){return '<option value="'+esc(x)+'">'}).join(''):'')+'</datalist></div>'+(note?'<div class="fld wide"><label for="'+pfx+'n">詳細</label><textarea id="'+pfx+'n" rows="2" placeholder="例：仏壇と着物が多い。母の入居日までに">'+esc(o.cat_note||'')+'</textarea></div>':'')+'</div>'}
function treeWire(pfx,onchange){var a=$(pfx+'1'),b=$(pfx+'2'),c=$(pfx+'3l');if(!a)return;
 a.onchange=function(){b.innerHTML=opt('',a.value?cb2(a.value):[],a.value?'選んでください':'先に大分類を選んでください');c.innerHTML='';if(onchange)onchange()};
 b.onchange=function(){c.innerHTML=a.value&&b.value?cb3(a.value,b.value).map(function(x){return '<option value="'+esc(x)+'">'}).join(''):'';if(onchange)onchange()};$(pfx+'3').oninput=onchange||null}
function collect(t){var o={};(SPEC[t]||[]).forEach(function(s){var e=$('e_'+t+'_'+s[0]);if(!e)return;if(s[2]==='areapick'){o[s[0]]=AreaPick.value(e);return}if(s[2]==='cats'){o[s[0]]=bnVal(e);return}if(s[2]==='svc'){var v=[].map.call(e.querySelectorAll('input:checked'),function(i){return i.value});var ot=$(e.id+'_o').value.split(/[、,，]+/).map(function(x){return x.trim()}).filter(String);o[s[0]]=v.concat(ot).join('、')}else o[s[0]]=e.value.trim()});
 ['cat1','cat2','cat3','cat_note'].forEach(function(k,i){var e=$('tc'+(i<3?i+1:'n'));if(e)o[k]=e.value.trim()});
 var w=function(id,k){var e=$(id);if(e)o[k]=e.value.trim()};w('wSt',t==='partner'?'apply_status':'status');w('wStaff','staff');w('wNext','next_action');w('wDate','next_date');w('wMeet','meet_date');w('wMeeting','meeting');
 var cks=document.querySelectorAll('[data-ck]');if(cks.length)o.checks=JSON.stringify([].filter.call(cks,function(i){return i.checked}).map(function(i){return i.value}));
 return o}
