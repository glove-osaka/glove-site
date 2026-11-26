// 公開の直前に自動で実行：日本語の文章へ、言葉のまとまりごとの改行位置を入れる（元のファイルは変えない）
// 日本語の文章に、言葉のまとまりごとの「改行してよい位置」(<wbr>)を入れる。HTMLの中身の文字だけを対象にする
const fs=require('fs'),path=require('path');
const seg=new Intl.Segmenter('ja',{granularity:'word'});
const HIRA=/^[ぁ-ゟ]/,CLOSE=/^[、。，．！？!?」』）)】〕ー〜・：:％%…]/,OPEN=/[「『（(【〔]$/,DIGIT=/[0-9０-９,，.]$/;
function phrases(t){
 const S=[...seg.segment(t)].map(x=>x.segment);const out=[];let cur='';
 const KAN=/[\u4e00-\u9fff々]/,KATA=/[\u30a0-\u30ff]/;
 for(let i=0;i<S.length;i++){const s=S[i],nx=S[i+1]||'';
  let join;
  if(!cur)join=true;
  else if(CLOSE.test(s))join=true;
  else if(OPEN.test(cur))join=true;
  else if(/[、。！？]$/.test(cur))join=false;
  else if((s==='お'||s==='ご')&&KAN.test(nx[0]||''))join=false;
  else if((cur.endsWith('お')||cur.endsWith('ご'))&&S[i-1]&&S[i-1].length===1&&KAN.test(s[0]))join=true;
  else if(/^[おご][\u4e00-\u9fff]/.test(s))join=false;
  else if(HIRA.test(s)&&s.length>=2&&/[をにがはもへとでて]$/.test(cur)&&!/^(ため|こと|もの|とき|ところ|ください|ます|です|いる|いた|おり|ない|なく|しまう|あり|ある|よう|くだ)/.test(s)&&cur.length>=2)join=false;
  else if(HIRA.test(s))join=(cur.length+s.length)<=8||s.length<=1;
  else if(KAN.test(s[0])&&KAN.test(cur.slice(-1)))join=(cur.length+s.length)<=10;
  else if(KATA.test(s[0])&&KATA.test(cur.slice(-1)))join=(cur.length+s.length)<=8;
  else if(DIGIT.test(cur)&&KAN.test(s[0])&&s.length<=2)join=true;
  else if(/^[A-Za-z0-9]/.test(s)&&/[A-Za-z0-9.,:\-]$/.test(cur))join=true;
  else join=false;
  if(join)cur+=s;else{out.push(cur);cur=s}
 }
 if(cur)out.push(cur);return out;
}
const JP=/[぀-ヿ一-鿿]/;
function textWbr(t){const nums=[];t=t.replace(/(?:\+81-?)?0\d{1,4}-\d{1,4}-\d{3,4}/g,m=>'\u0002'+(nums.push(m)-1)+'\u0003');let o=(!JP.test(t)||t.length<6)?t:phrases(t).join('<wbr>');o=o.replace(/\u0002[^\u0003]*\u0003/g,m=>nums[+m.replace(/<wbr>|\u0002|\u0003/g,'')].replace(/-/g,'\u2011'));return o.replace(/\u3000/g,'<span class="zs"> </span>')}
function processHtml(h){
 // 対象外の範囲：script/style/svg/textarea/title/head
 const out=[];let i=0;const skipTags=['script','style','svg','textarea','title','head','pre','code','select','option'];
 const re=/<(\/?)([a-zA-Z][\w-]*)[^>]*>|<!--[\s\S]*?-->/g;let m,skip=null,last=0;
 while((m=re.exec(h))){
  const text=h.slice(last,m.index);
  out.push(skip||text.indexOf('<wbr')>=0?text:textWbr(text.replace(/&[a-z#0-9]+;/gi,x=>'\u0000'+x+'\u0001')).replace(/\u0000(.*?)\u0001/g,'$1'));
  out.push(m[0]);last=re.lastIndex;
  const tag=(m[2]||'').toLowerCase();
  if(!skip&&!m[1]&&skipTags.includes(tag)&&!/\/>$/.test(m[0]))skip=tag;
  else if(skip&&m[1]&&tag===skip)skip=null;
 }
 out.push(h.slice(last));return out.join('');
}
const CSS='<link rel="stylesheet" href="/assets/type.css">';
module.exports={phrases,processHtml};
if(require.main===module){
 const root=process.argv[2];let n=0;
 (function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);const st=fs.statSync(p);if(st.isDirectory()){if(!['kanri','tests','.git','.github','node_modules','api','assets','partner','keiyaku'].includes(f))walk(p)}else if(f.endsWith('.html')&&!f.startsWith('google')){const h=fs.readFileSync(p,'utf8');if(h.includes('data-wbr="1"'))continue;let o=processHtml(h);o=o.replace('<html','<html data-wbr="1"').replace('</head>',CSS+'</head>');fs.writeFileSync(p,o);n++}}})(root);
 console.log('処理したページ',n);
}
