/* 電子契約：通信と、設定前のお試し表示（この端末の中だけで動く見本） */
(function () {
var FIELD_LIST = ["経営・業務の改善", "採用・定着・研修", "補助金・助成金の情報", "共同購入・固定費の見直し", "専門家への相談", "事業承継・連携", "職場・働き方の相談", "資格・研修・キャリア", "福利厚生・暮らしの優待", "病院・施設・在宅サービスの相談先", "退院・入居前後の暮らしの準備", "医療費・介護費の制度", "家族の介護と仕事の両立", "お金の管理・成年後見", "買い物・移動などの生活支援", "引越し・住み替え・家財の整理", "終活・相続・遺品整理", "その他・まだ分からない", "会員登録（事業所会員）", "会員登録（法人会員）", "会員登録（協賛会員）", "会員登録（個人会員（営業協力者））"];
var KIYAKU_TEXT = "医療介護総合支援会　会員規約（事業所・法人・協賛会員）\n\n第1条（目的と適用）\n1　この規約は、株式会社グローブ（以下「当社」）が運営する「医療介護総合支援会」（以下「本会」）の会員制サービスの利用条件を定めるものです。\n2　この規約は、事業所会員・法人会員・協賛会員（以下あわせて「会員」）に適用します。個人会員には「個人会員規約」を適用します。\n\n第2条（本会の性格）\n本会は、当社が提供する会員制のサービスです。中小企業等協同組合法その他の法令に基づく組合や社団ではなく、会員が本会の出資者や構成員となるものではありません。契約・会費・入退会・個人情報の管理は、当社が行います。\n\n第3条（会員の種類）\n1　事業所会員：病院・診療所・介護事業所・薬局など1つの事業所\n2　法人会員：複数の事業所を運営する法人\n3　協賛会員：医療・介護に関わる方へサービスを提供する企業で、当社の審査を通過したもの\n\n第4条（入会の申込みと契約の成立）\n1　入会を希望する方は、本会のウェブサイトから申し込み、当社が送る電子契約でこの規約を確認し、必要事項の記入と押印をして承認します。\n2　入会の契約は、申込者が電子契約で承認した時に成立します。\n3　当社は、申込者が次のいずれかに当たる場合、入会をお断りすることがあります。理由は開示しないことがあります。\n　(1) 申込内容に偽りや誤りがある\n　(2) 過去にこの規約に反して退会させられたことがある\n　(3) 反社会的勢力に当たる、または関わりがある\n　(4) その他、当社が会員とすることが適当でないと判断した\n\n第5条（会費）\n1　会費（税込）は次のとおりとします。年間払いは、いずれも月額の10か月分とします。\n　(1) 事業所会員：月額5,500円（職員5名まで）。職員が5名を超える場合は1名につき500円を加算\n　(2) 法人会員：1か所目5,500円、2か所目から1か所につき5,000円（いずれも職員5名まで）。5名を超える職員1名につき500円を加算\n　(3) 協賛会員：月額33,000円（年間払い330,000円）\n2　職員の数は、入会時と更新時に会員が申告した人数とします。契約期間中に事業所や職員が増えた場合は、会員は当社に速やかに知らせ、翌月分から変更後の会費とします。\n3　会費は、入会の翌月1日から発生します。入会した月の会費はかかりません。\n\n第6条（会費の支払い）\n1　会費は前払いとし、当社が指定する銀行口座への振込みで支払うものとします。振込手数料は会員の負担とします。\n2　月払いの会員は、毎月末日までに翌月分の会費を支払います。入会時は、入会した月の末日までに翌月分を支払います。\n3　年間払いの会員は、12か月分の会費を、その12か月が始まる月の前月末日までに支払います。\n4　支払日が金融機関の休業日の場合は、その前の営業日までに支払うものとします。\n\n第7条（入会金と創設会員）\n1　創設会員は、事業所会員・法人会員の数が合わせて100社に達するまでに入会した会員とします。\n2　創設会員の入会金は免除します。創設会員以外の入会金は、別に定めて公表します。\n\n第8条（紹介特典）\n創設会員の募集期間中に、会員の紹介で事業所会員または法人会員が3社入会した場合、その会員の会費を1年分免除します。免除は、3社目の入会を確認した月の翌月分から適用します。年間払いで支払済みの会費がある場合は、次の更新時から免除します。\n\n第9条（契約期間と更新）\n1　契約期間は、会費が発生する月の1日から1年間とします。月払いの会員も同じです。\n2　期間が終わる1か月前までに会員または当社から解約の申し出がない場合、契約は同じ条件で1年間更新され、以後も同様とします。\n3　当社は、更新の2か月前までに、会員に更新日と解約の申し出の期限をメールで知らせます。\n\n第10条（解約）\n1　会員は、契約期間が終わる1か月前までに当社所定の方法で申し出ることで、期間の終了をもって解約できます。\n2　月払いの会員が契約期間の途中で解約する場合、契約期間の残りの月数分の会費を、解約日の属する月の末日までに支払うものとします。\n3　年間払いの会員が契約期間の途中で解約する場合、支払済みの会費は返金しません。\n4　第2項と第3項は、次条の場合には適用しません。\n\n第11条（効果が出なかった場合の途中解約）\n1　入会後、当社が提案する経費の削減などを会員が実施したにもかかわらず、会費が発生してから3か月の時点で、その効果の額が同じ期間に支払った会費の額を下回る場合、会員は残りの月数分の会費を支払うことなく解約できます。\n2　会員が当社の提案に同意しなかった場合、または同意した提案を実施しなかった場合は、前項を適用しません。\n3　効果の額は、会員が提出する請求書などの資料をもとに、当社と会員が確認して決めます。\n\n第12条（サービスの内容と範囲）\n1　当社は、会員に対し、本会のウェブサイトに示す支援（情報の提供、相談内容の整理、専門家・提携先へのおつなぎ、経費の見直しの提案など）を提供します。\n2　当社は、診断・治療などの医療の判断、法律・税務・労務の専門的な判断、補助金などの申請書類の作成、職業紹介、事業の売買の仲介は行いません。これらは、資格や許可を持つ専門家・提携先が担当します。\n3　当社は、患者・利用者の個人情報を受け取りません。会員は、当社への相談に患者・利用者を特定できる情報を含めないものとします。\n4　提携先が提供するサービスの契約は、会員と提携先の間で結ばれ、当社はその当事者になりません。\n5　当社は、提案や情報によって経費の削減や売上などの特定の結果が生じることを保証しません（第11条の途中解約を除きます）。\n\n第13条（手数料と紹介料の開示）\n1　当社は、会員が提携先のサービスを利用した場合に、提携先から手数料を受け取ることがあります。その場合は、提案の時にその旨を知らせます。\n2　当社は、弁護士・税理士・社会保険労務士・行政書士などの専門家から紹介料を受け取りません。\n3　当社は、会員を紹介した個人会員に、その会員の会費・手数料の一部を紹介料として支払います。紹介料は当社の受け取る会費・手数料から支払うもので、会員の会費に上乗せするものではありません。\n\n第14条（協賛会員の特則）\n1　協賛会員の入会には、当社の審査が必要です。\n2　協賛会員の紹介・掲載は、広告であることを明示して行います。当社は、他の会員に協賛会員の商品・サービスの購入を強いません。\n\n第15条（禁止事項）\n会員は、次の行為をしてはなりません。\n　(1) 他の会員・提携先・当社の信用を傷つける行為\n　(2) 本会で知った他の会員の情報を、その会員の同意なく営業や第三者への提供に使う行為\n　(3) 本会の名称を、当社の承諾なく宣伝に使う行為\n　(4) 法令や公序良俗に反する行為\n\n第16条（会費の滞納と退会）\n1　会費の支払いが期日から1か月以上遅れた場合、当社はサービスの提供を止めることがあります。\n2　会員がこの規約に重大な違反をし、当社が求めても改めない場合、当社は契約を解除できます。この場合、支払済みの会費は返金せず、未払いの会費はただちに支払うものとします。\n\n第17条（個人情報）\n当社は、会員の個人情報を、本会のウェブサイトに示す「個人情報の取り扱い」に従って取り扱います。会員の同意なく、提携先や個人会員に会員の情報を渡しません。\n\n第18条（反社会的勢力の排除）\n会員と当社は、自らとその役員が暴力団などの反社会的勢力でないこと、反社会的勢力と関わりを持たないことを確約します。相手がこれに反した場合、催告なく契約を解除できます。\n\n第19条（責任の範囲）\n当社は、本会のサービスに関して会員に生じた損害について、当社の故意または重大な過失による場合を除き、損害が生じた月の会費の額を上限として責任を負います。\n\n第20条（規約の変更）\n1　当社は、会員の利益になる場合、または変更の必要性・内容の相当性などに照らして合理的な場合に、この規約を変更できます。\n2　変更するときは、効力が生じる日の1か月前までに、変更の内容と効力が生じる日を、本会のウェブサイトとメールで知らせます。\n3　会費の値上げは、次の更新時から適用します。\n\n第21条（準拠法と管轄）\nこの規約は日本の法律に従います。この規約に関する紛争は、大阪地方裁判所を第一審の専属的合意管轄裁判所とします。";
var KOJIN_TEXT = "医療介護総合支援会　個人会員（営業協力者）規約\n\n第1条（目的）\nこの規約は、株式会社グローブ（以下「当社」）が運営する「医療介護総合支援会」（以下「本会」）に、事業所会員・法人会員を紹介する個人会員（営業協力者）と当社の間の条件を定めるものです。\n\n第2条（個人会員の位置づけ）\n1　個人会員の登録と継続に費用はかかりません。個人会員は、本会の支援サービスを利用できません。\n2　個人会員は、当社の従業員・代理人ではなく、当社に代わって契約を結ぶ権限もありません。\n3　個人会員に、紹介の件数・時間のノルマはありません。\n\n第3条（登録）\n1　登録を希望する方は、本会のウェブサイトから申し込み、当社が送る電子契約でこの規約を確認して承認します。\n2　紹介料の支払いを受けるには、本人確認書類の提出と、本人名義の振込口座の登録が必要です。\n3　18歳未満の方、反社会的勢力に当たる方、その他当社が不適当と判断した方は、登録できません。\n\n第4条（紹介の方法）\n1　個人会員は、紹介先の了解を得たうえで、当社所定の紹介コードまたは紹介の申込みで、紹介先を当社に知らせます。\n2　紹介先が入会の申込みで紹介者として個人会員を指定した場合に、その個人会員の紹介とします。同じ紹介先に複数の紹介があった場合は、紹介先が指定した方を優先します。\n3　個人会員は、本会のサービスの内容や費用を自分で説明して契約を結ばせてはならず、その説明は当社が行います。\n\n第5条（紹介料）\n1　当社は、個人会員の紹介で入会した事業所会員・法人会員（以下「紹介先」）について、次の紹介料を支払います。\n　(1) 会費の紹介料：紹介先から当社に入金された会費の20%\n　(2) 手数料の紹介料：紹介先が経費の削減などのサービスを利用して当社が受け取った手数料の20%。当社が紹介先へ還元した場合は、還元した額を差し引いた残りの20%\n2　紹介料は、紹介先からの入金を当社が確認したものだけを対象とします。\n3　紹介料は、毎月末日で締め、翌月15日までに計算して個人会員に知らせ、翌月末日に登録口座へ振り込みます。\n4　紹介先が会費の返金を受けた場合や、紹介が第7条に反していた場合は、その分の紹介料を支払いません。すでに支払った場合は、次回以降の紹介料から差し引くか、返していただきます。\n5　個人会員が別の個人会員を紹介しても、紹介料は支払いません。個人会員が紹介した個人会員の成果に応じた紹介料も支払いません。\n6　紹介料は、当社が受け取る会費・手数料の中から支払うもので、紹介先の会費に上乗せしません。当社は、紹介料の仕組みがあることを本会のウェブサイトと会員規約で紹介先に知らせます。\n7　紹介料に関する税金の申告は、個人会員が自分で行います。当社は、法令に従い支払の記録を作り、必要な場合は税務署に提出します。\n\n第6条（勤め先の紹介）\n個人会員が自分の勤め先や、自分が役員を務める法人を紹介する場合は、紹介料を受け取ることについて、その勤め先・法人の了解を得なければなりません。当社は、了解を得たことを確かめることがあります。\n\n第7条（禁止事項）\n個人会員は、紹介にあたり次の行為をしてはなりません。\n　(1) 「必ず得をする」「確実に経費が下がる」など、事実と違う説明や断定的な説明\n　(2) 断られた後の繰り返しの勧誘、威迫、心理的に追い込む勧誘\n　(3) 当社の従業員や代理人であるかのような名乗り、本会の名での契約や約束\n　(4) 紹介先に紹介料の一部を渡す約束や、金品の提供\n　(5) 紹介先の同意なく、その情報を当社や第三者に伝えること\n　(6) 患者・利用者の個人情報を扱うこと\n　(7) 本会の名称・画像を、当社の承諾なく広告に使うこと\n　(8) 法令や公序良俗に反する行為\n\n第8条（秘密の保持）\n個人会員は、紹介を通じて知った紹介先と当社の秘密を、登録を終えた後も第三者に漏らしてはなりません。\n\n第9条（登録の取消し）\n1　個人会員は、いつでも登録を取り消せます。取り消した月までに入金が確認された分の紹介料は支払います。\n2　当社は、個人会員がこの規約に反した場合、紹介料の支払いを止め、登録を取り消すことがあります。\n\n第10条（個人情報・反社会的勢力・規約の変更・管轄）\n個人情報の取り扱い、反社会的勢力の排除、規約の変更、準拠法と管轄は、会員規約の第17条・第18条・第20条・第21条と同じとします。";
var NDA_TEXT = "株式会社グローブ（以下「甲」という。）と [[party]]（以下「乙」という。）は、甲が運営する医療介護総合支援会でのご相談に関し、次のとおり秘密保持契約を結ぶ。\n\n第1条（秘密情報）\n本契約で秘密情報とは、ご相談の内容、乙の事業・経営・人事・取引に関する情報など、相談を通じて甲が知った一切の情報をいう。ただし、すでに公知の情報、甲が正当に第三者から得た情報は除く。\n\n第2条（秘密の保持）\n甲は、秘密情報を厳重に管理し、乙の事前の同意なく第三者に開示・漏えいしない。\n\n第3条（目的外の使用の禁止）\n甲は、秘密情報を、乙のご相談への対応の目的以外に使わない。\n\n第4条（専門家・提携先への開示）\n甲は、乙の同意を得た場合に限り、ご相談に必要な範囲で、秘密情報を専門家・提携先に開示できる。この場合、甲は開示先に本契約と同じ義務を守らせる。\n\n第5条（患者・利用者の情報）\n乙は、ご相談に患者・利用者を特定できる情報を含めない。誤って受け取った場合、甲はただちに乙に知らせ、廃棄する。\n\n第6条（返還・廃棄）\n甲は、ご相談が終わった後、乙から求めがあれば、秘密情報を返還または廃棄する。\n\n第7条（有効期間）\n本契約は締結の日から効力を持ち、ご相談が終わった後も3年間有効とする。\n\n第8条（準拠法と管轄）\n本契約は日本の法律に従う。本契約に関する紛争は、大阪地方裁判所を第一審の専属的合意管轄裁判所とする。";
var TEIKEI_TEXT = "株式会社グローブ（以下「甲」という。）と [[party]]（以下「乙」という。）は、甲が運営する医療介護総合支援会（以下「本会」）の会員に対し、乙がサービスを提供することに関し、次のとおり業務提携契約を結ぶ。\n\n第1条（目的）\n甲は、本会の会員の相談内容に応じて乙を紹介し、乙は会員に対して自らのサービスを提供する。\n\n第2条（契約の当事者）\n乙のサービスの契約は、乙と会員の間で結ばれ、甲はその当事者にならない。乙は、自らの責任でサービスを提供する。\n\n第3条（手数料）\n1　会員が乙のサービスを利用した場合、乙は甲に、別に定める手数料を支払う。手数料の条件は、末尾の「提携の条件」による。\n2　甲は、手数料を受け取ることを、提案の時に会員に知らせる。乙はこれに同意する。\n3　手数料を会員への請求額に上乗せしてはならない。\n\n第4条（適正な提供）\n乙は、法令・業界の規則を守り、会員に対し、事実と違う説明や断定的な説明、強引な勧誘をしない。\n\n第5条（秘密の保持と個人情報）\n1　甲と乙は、本契約を通じて知った相手方と会員の秘密を、第三者に漏らさない。本契約の終了後も同じとする。\n2　甲と乙は、会員の個人情報を、個人情報の保護に関する法律に従って取り扱い、紹介の目的以外に使わない。\n\n第6条（反社会的勢力の排除）\n甲と乙は、自らとその役員が反社会的勢力でないこと、反社会的勢力と関わりを持たないことを確約する。相手がこれに反した場合、催告なく本契約を解除できる。\n\n第7条（有効期間）\n本契約の有効期間は締結の日から1年間とし、期間が終わる1か月前までに申し出がなければ、同じ条件で1年間更新し、以後も同様とする。\n\n第8条（解除）\n甲または乙は、相手方が本契約に違反し、催告しても改めない場合、本契約を解除できる。\n\n第9条（準拠法と管轄）\n本契約は日本の法律に従う。本契約に関する紛争は、大阪地方裁判所を第一審の専属的合意管轄裁判所とする。";
/* ---- 共通：項目・ひな形・会費の計算・文面の組み立て（サイトのお試し表示と Apps Script で同じものを使う） ---- */
var ISSUER = { name: "株式会社グローブ", service: "医療介護総合支援会", rep: "代表取締役 藤原 重郎", addr: "〒544-0033 大阪府大阪市生野区勝山南2-2-7", tel: "0120-933-496", hours: "10:00〜19:00" };
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

  var URL_ = window.KEIYAKU_API_URL || "";
  var DEMO = !URL_ || /[?&]demo=1/.test(location.search);
  window.KEIYAKU_DEMO = DEMO;
  window.KEIYAKU_CORE = { TEMPLATES: TEMPLATES, FIELDS: FIELDS, normCond: normCond, buildBody: buildBody, yen: yen, MEMBER_LABEL: MEMBER_LABEL };
  function real(action, data) {
    var payload = Object.assign({ action: action }, data || {});
    if (action.indexOf("admin.") === 0) { try { payload.adminToken = sessionStorage.getItem("iryo-adm") || ""; } catch (e) { } }
    var body = JSON.stringify(payload);
    return fetch(URL_, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body, redirect: "follow" })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) { var er = new Error(j.error || "うまくいきませんでした"); er.needLogin = !!j.needLogin; if (er.needLogin && window.onNeedLogin) window.onNeedLogin(); throw er; } return j; });
  }
  /* ---- お試し表示 ---- */
  var KEY = "iryo-keiyaku-demo";
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function store(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { } }
  function wait(v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 300); }); }
  function sample() { return { id: "IKK-DEMO-0001", token: "sample", template: "kaiin", title: tplOf("kaiin").title, party_name: "見本 花子", party_company: "見本デイサービス", party_email: "sample@example.jp", status: "送付済み", fields: tplOf("kaiin").fields, required: tplOf("kaiin").required, requireId: false, prefill: { company: "見本デイサービス", name: "見本 花子" }, body: buildBody("kaiin", { type: "jigyosho", pay: "month", staff: 8, founder: true }, "", "見本デイサービス"), draft: "" }; }
  function demo(action, d) {
    d = d || {};
    var list = load();
    if (action === "admin.login") return d.id && d.pass ? wait({ ok: true, adminToken: "demo" }) : Promise.reject(new Error("IDとパスワードを入れてください"));
    if (action === "admin.logout") return wait({ ok: true });
    if (action === "admin.templates") return wait({ ok: true, templates: TEMPLATES, fields: FIELDS });
    if (action === "admin.issue") {
      var t = tplOf(d.template), p = d.party || {};
      if (!p.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email || "")) return Promise.reject(new Error("相手のお名前と、正しいメールアドレスを入れてください"));
      var f = orderFields(t, d.fields);
      var o = { id: "IKK-DEMO-" + (1001 + list.length), token: "demo" + Date.now(), template: t.key, title: t.title, party_name: p.name, party_company: p.company || "", party_email: p.email, status: "送付済み", created: new Date().toISOString(), draft: d.draft ? "yes" : "", fields: f, required: t.required, requireId: !!(d.requireId || t.requireId), prefill: d.prefill || {}, body: buildBody(t.key, d.cond, d.note, p.company || p.name) };
      list.unshift(o); store(list);
      return wait({ ok: true, id: o.id, url: location.href.replace(/admin\.html.*$/, "index.html") + "?t=" + o.token + "&demo=1" });
    }
    if (action === "admin.list") return wait({ ok: true, rows: list });
    if (action === "admin.cases") { var now = Date.now(), dd = function (h) { return new Date(now - h * 36e5).toISOString(); }; var rt = {}; FIELD_LIST.forEach(function (f) { rt[f] = ""; }); rt["経営・業務の改善"] = "見本コンサルティング株式会社"; rt["採用・定着・研修"] = "見本人材サービス、見本社労士事務所";
      return wait({ ok: true, routes: rt, rows: [
        { no: "IK-261030-0912ABC", ts: dd(30), label: "医療介護総合支援会：企業・事業者／経営・業務の改善", name: "見本 一郎", company: "見本クリニック", email: "sample@example.jp", tel: "06-0000-0000", body: "【受付内容】\n立場：企業・事業者\n内容：経営・業務の改善", status: "新規受付", memo: "", fields: "経営・業務の改善", partner: "見本コンサルティング株式会社", staff: "", updated: dd(30), contacted: "", next: "" },
        { no: "IKM-261029-1530XYZ", ts: dd(50), label: "医療介護総合支援会：会員登録／事業所会員", name: "見本 花子", company: "見本デイサービス", email: "hanako@example.jp", tel: "06-1111-2222", body: "【会員登録の申込み】\n会員の種類：事業所会員", status: "提携先対応中", memo: "電子契約 締結済み", fields: "会員登録（事業所会員）", partner: "", staff: "中嶋", updated: dd(200), contacted: dd(200), next: "" },
        { no: "IK-261020-1010QWE", ts: dd(240), label: "医療介護総合支援会：医療・介護で働く方／採用・定着・研修", name: "見本 次郎", company: "見本訪問看護", email: "jiro@example.jp", tel: "", body: "【受付内容】\n内容：採用・定着・研修", status: "完了", memo: "紹介済み", fields: "採用・定着・研修", partner: "見本人材サービス", staff: "中嶋", updated: dd(100), contacted: dd(100), next: "" }] }); }
    if (action === "admin.caseSet" || action === "admin.report" || action === "admin.routeSet") return wait({ ok: true, routes: d.rows ? (function () { var o = {}; d.rows.forEach(function (r) { o[r.field] = r.partners; }); return o; })() : null });
    if (action === "admin.history") return wait({ ok: true, rows: [{ ts: new Date().toISOString(), kind: "受付", text: "サイトから受付", staff: "" }] });
    if (action === "client.apply") {
      var kj = d.type === "kojin", tp = tplOf(kj ? "kojin" : "kaiin");
      var oo = { id: "IKK-DEMO-" + (1001 + list.length), token: "demo" + Date.now(), template: tp.key, title: tp.title, party_name: d.name, party_company: kj ? "" : d.org, party_email: d.email, status: "送付済み", created: new Date().toISOString(), draft: "", fields: tp.fields.slice(), required: tp.required, requireId: tp.requireId, prefill: kj ? { name: d.name, address: d.address, phone: d.phone } : { company: d.org, address: d.address, rep: d.rep, name: d.name, phone: d.phone }, body: buildBody(tp.key, kj ? null : { type: d.type, pay: d.pay, sites: d.sites, staff: d.staff, referrer: d.referrer, founder: true }, "", kj ? d.name : d.org) };
      list.unshift(oo); store(list); return wait({ ok: true, token: oo.token });
    }
    if (action === "admin.resend") return wait({ ok: true });
    if (action === "admin.paid") { list.forEach(function (x) { if (x.id === d.id) x.paid = new Date().toISOString(); }); store(list); return wait({ ok: true }); }
    if (action === "admin.cancel") { list.forEach(function (x) { if (x.id === d.id) x.status = "取り消し"; }); store(list); return wait({ ok: true }); }
    if (action === "admin.pdf" || action === "client.pdf") return Promise.reject(new Error("お試し表示では、契約書のPDFは作られません"));
    var c = list.filter(function (x) { return x.token === d.token; })[0] || sample();
    if (c.status === "取り消し") return Promise.reject(new Error("この契約書は取り消されました。"));
    if (action === "client.otp") return wait({ ok: true, demoCode: "123456" });
    if (action === "client.verify") return String(d.code) === "123456" ? wait({ ok: true, sess: "demo" }) : Promise.reject(new Error("認証コードが違います（お試し表示では 123456 です）。"));
    if (action === "client.get") {
      var t2 = tplOf(c.template) || tplOf("kaiin");
      if (d.sess !== "demo") return wait({ ok: true, needOtp: true, contract: { id: c.id, title: c.title, party_name: c.party_name, party_company: c.party_company, email: c.party_email.split("@")[0].slice(0, 2) + "***@" + c.party_email.split("@")[1], issuer: ISSUER } });
      return wait({ ok: true, contract: { id: c.id, title: c.title, status: c.status, draft: c.draft === "yes", party_name: c.party_name, party_company: c.party_company, body: c.body, fields: c.fields.map(function (k) { return { key: k, label: fieldLabel(t2, k), type: FIELDS[k].type, ac: FIELDS[k].ac || "", required: c.required.indexOf(k) >= 0, value: (c.prefill || {})[k] || "" }; }), requireId: !!c.requireId, adult: !!t2.adult, seal: t2.seal, issuer: ISSUER, signed: c.status === "締結済み" } });
    }
    if (action === "client.sign") { list.forEach(function (x) { if (x.token === d.token) { x.status = "締結済み"; x.signed = new Date().toISOString(); } }); store(list); return wait({ ok: true, demo: true }); }
    return Promise.reject(new Error("不明な操作です"));
  }
  window.keiyakuApi = function (action, data) { return DEMO ? demo(action, data) : real(action, data); };
})();
