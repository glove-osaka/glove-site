/* ---- 共通：項目・ひな形・会費の計算・文面の組み立て（サイトのお試し表示と Apps Script で同じものを使う） ---- */
var ISSUER = { name: "株式会社グローブ", service: "医療介護総合支援会", rep: "代表取締役 藤原 重郎", addr: "〒544-0033 大阪府大阪市生野区勝山南2-2-7", tel: "0120-933-496", hours: "10:00〜19:00", invoice: "T1120001257469" };
var FIELDS = {
  company: { label: "事業所名・法人名", type: "text", ac: "organization" },
  address: { label: "所在地・ご住所", type: "text", ac: "street-address" },
  rep: { label: "代表者名", type: "text" },
  name: { label: "お名前（ご担当者名）", type: "text", ac: "name" },
  kana: { label: "ふりがな", type: "text" },
  title: { label: "役職", type: "text", ac: "organization-title" },
  phone: { label: "電話番号", type: "tel", ac: "tel" },
  birth: { label: "生年月日", type: "date", ac: "bday" },
  bank: { label: "紹介料の振込口座（銀行名・支店・種別・口座番号・名義）", type: "textarea" }
};
var TEMPLATES = [
  { key: "kaiin", title: "会員申込書（事業所・法人・協賛会員）", cond: true, fields: ["company", "address", "rep", "name", "phone"], required: ["company", "address", "rep", "name", "phone"], requireId: false, seal: "square", note: "", labels: { name: "ご担当者名", address: "所在地", company: "事業所名・法人名" } },
  { key: "kojin", title: "個人会員（営業協力者）登録書", cond: false, fields: ["name", "kana", "address", "phone", "birth", "bank"], required: ["name", "kana", "address", "phone", "birth", "bank"], requireId: true, adult: true, seal: "round", note: "特記事項", labels: { name: "お名前", address: "ご住所" } },
  { key: "nda", title: "秘密保持契約書（ご相談）", cond: false, fields: ["company", "name", "address", "phone"], required: ["name", "address", "phone"], requireId: false, seal: "round", note: "特記事項" },
  { key: "teikei", title: "業務提携契約書（提携先）", cond: false, fields: ["company", "rep", "name", "title", "address", "phone"], required: ["company", "rep", "address", "phone"], requireId: false, seal: "square", note: "提携の条件（業務分野・手数料の率・支払時期など）" }
];
var MEMBER_LABEL = { jigyosho: "事業所会員", hojin: "法人会員", kyosan: "協賛会員" };
function tplOf(key) { for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].key === key) return TEMPLATES[i]; return null; }
function fieldLabel(t, k) { return (t && t.labels && t.labels[k]) || FIELDS[k].label; }
/* 項目の並びをひな形の順にそろえ、必須の項目を必ず入れる */
function orderFields(t, arr) {
  arr = (arr || t.fields).filter(function (k) { return FIELDS[k]; });
  t.required.forEach(function (k) { if (arr.indexOf(k) < 0) arr.push(k); });
  var first = t.fields.filter(function (k) { return arr.indexOf(k) >= 0; });
  return first.concat(Object.keys(FIELDS).filter(function (k) { return arr.indexOf(k) >= 0 && first.indexOf(k) < 0; }));
}
function yen(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "円"; }
function monthlyFee(c) {
  var s = Math.max(1, parseInt(c.sites, 10) || 1), n = Math.max(0, parseInt(c.staff, 10) || 0);
  if (c.type === "jigyosho") return 5500 + Math.max(0, n - 5) * 500;
  if (c.type === "hojin") return 5500 + (s - 1) * 5000 + Math.max(0, n - 5 * s) * 500;
  if (c.type === "kyosan") return 33000;
  return 0;
}
function ymd(d) { return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日"; }
function nextFirst(from) { var d = from ? new Date(from) : new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1); }
/* 契約の条件をそろえる（金額は必ずここで計算し直す） */
function normCond(c) {
  c = c || {};
  var o = { type: MEMBER_LABEL[c.type] ? c.type : "jigyosho", pay: c.pay === "year" ? "year" : "month", sites: Math.max(1, parseInt(c.sites, 10) || 1), staff: Math.max(0, parseInt(c.staff, 10) || 0), founder: c.founder !== false && c.founder !== "false", referrer: String(c.referrer || "").slice(0, 60), entryFee: String(c.entryFee || "").slice(0, 40) };
  if (o.type === "jigyosho") o.sites = 1;
  var st = c.start && /^\d{4}-\d{2}/.test(c.start) ? new Date(+c.start.slice(0, 4), +c.start.slice(5, 7) - 1, 1) : nextFirst();
  o.start = st.getFullYear() + "-" + ("0" + (st.getMonth() + 1)).slice(-2) + "-01";
  o.monthly = monthlyFee(o);
  o.first = o.pay === "year" ? o.monthly * 10 : o.monthly;
  o.startText = ymd(st);
  o.endText = ymd(new Date(st.getFullYear() + 1, st.getMonth(), 0));
  o.dueText = ymd(new Date(st.getFullYear(), st.getMonth(), 0));
  return o;
}
function condText(c) {
  var o = normCond(c), L = [];
  L.push("　会員区分：" + MEMBER_LABEL[o.type] + (o.type === "kyosan" ? "" : "（事業所数 " + o.sites + "か所、職員数 " + o.staff + "名）"));
  L.push("　支払方法：" + (o.pay === "year" ? "年間払い（12か月分を10か月分の額で）" : "月払い") + "　銀行振込・前払い。振込手数料は申込者の負担");
  L.push("　月額会費（税込）：" + yen(o.monthly) + (o.pay === "year" ? "　→　年間払いの額（税込）：" + yen(o.monthly * 10) : ""));
  L.push("　初回のお振込み額（税込）：" + yen(o.first) + "（" + o.dueText + "まで）");
  L.push("　会費の発生日：" + o.startText);
  L.push("　契約期間：" + o.startText + "〜" + o.endText + "（1年。期間が終わる1か月前までに申し出がなければ1年ごとに自動更新）");
  L.push("　入会金：" + (o.founder ? "創設会員のため免除" : (o.entryFee || "別に定める額（担当者からご案内します）")));
  L.push("　紹介者：" + (o.referrer || "なし"));
  return L.join("\n");
}
/* 文面を組み立てる。[[項目]] は相手が記入する欄（画面では「記入欄」、PDFでは記入した内容になる） */
function buildBody(key, cond, note, party) {
  var t = tplOf(key), b = "";
  var who = party || "[[name]]";
  if (key === "kaiin") {
    b = "医療介護総合支援会　会員申込書\n\n株式会社グローブ　御中\n\n申込者は、下に続く「医療介護総合支援会 会員規約」に同意し、次のとおり入会を申し込みます。\n\n1．申込者\n　事業所名・法人名：[[company]]\n　所在地：[[address]]\n　代表者名：[[rep]]\n　ご担当者名：[[name]]\n　電話番号：[[phone]]\n\n2．契約の内容\n" + condText(cond) +
      "\n\n3．特にご確認いただく事項\n　・契約期間は1年で、月払いも同じです。終了日の1か月前までに解約の申し出がない場合は、1年ごとに自動で更新されます。\n　・月払いで途中解約する場合は、残りの月数分の会費をお支払いいただきます。年間払いの途中解約は返金しません。\n　・会費が発生してから3か月の時点で、当社の提案を実施しても効果が会費を下回った場合は、会員規約第11条により途中解約できます。\n　・当社は、本会を紹介した個人会員に会費・手数料の一部を紹介料として支払うことがあります（会費に上乗せはありません）。\n\n――――――――――――――――――――\n\n" + KIYAKU_TEXT;
  } else if (key === "kojin") {
    b = "医療介護総合支援会　個人会員（営業協力者）登録書\n\n株式会社グローブ　御中\n\n私は、下に続く「医療介護総合支援会 個人会員（営業協力者）規約」に同意し、個人会員として登録を申し込みます。\n\n1．登録者\n　お名前：[[name]]（[[kana]]）\n　ご住所：[[address]]\n　電話番号：[[phone]]\n　生年月日：[[birth]]\n　紹介料の振込口座：[[bank]]\n\n2．確認事項\n　・個人会員の登録と継続に費用はかかりません。本会の支援サービスは利用できません。\n　・紹介料は、紹介先の会費の20%と、手数料の20%（紹介先へ還元した額を差し引いた残り）です。毎月末日締め、翌月15日までに計算し、翌月末日に振り込みます。\n　・個人会員を紹介しても紹介料はありません。\n　・紹介料の税金の申告は、ご自身で行っていただきます。\n\n――――――――――――――――――――\n\n" + KOJIN_TEXT;
  } else if (key === "nda") {
    b = "秘密保持契約書\n\n" + NDA_TEXT.replace("[[party]]", who);
  } else if (key === "teikei") {
    b = "業務提携契約書\n\n" + TEIKEI_TEXT.replace("[[party]]", who);
  }
  if (note) b += "\n\n" + (t && t.note ? t.note : "特記事項") + "\n" + note;
  return b;
}
