/* このファイルは make_keiyaku.py が作りました。直すときは元のファイルを直してください */
var CASE_SEGS = [{"key": "kigyo", "name": "企業・事業者", "match": ["企業・事業者"], "route": "partner", "word": "ご相談", "steps": ["新規受付", "内容確認中", "ヒアリング・面談", "振分け済み", "提携先対応中", "提案・見積り中", "契約・導入の準備中", "完了", "見送り"], "need": ["振分け済み", "提携先対応中", "提案・見積り中", "契約・導入の準備中"], "mk": ["電話した", "メールした", "訪問・面談した", "課題を聞き取った", "提携先へ紹介した", "提携先と打ち合わせた", "提案書・見積りを送った", "補助金・制度の情報を送った", "会員制度を案内した", "先方の返事待ち", "提携先の返事待ち", "完了の連絡をした", "その他"], "note": "提携先へ会社の情報を渡す前に、先方の了承を取ってください。", "done": ["完了", "見送り"]}, {"key": "hataraku", "name": "医療・介護で働く方", "match": ["医療・介護で働く方"], "route": "partner", "word": "ご相談", "steps": ["新規受付", "内容確認中", "お話を伺っている", "専門家・窓口へつないだ", "継続して相談中", "完了", "見送り"], "need": ["専門家・窓口へつないだ"], "mk": ["電話した", "メールした", "面談した（オンライン含む）", "悩み・状況を聞き取った", "公的な相談窓口を案内した", "専門家（社労士・弁護士など）へつないだ", "求人・資格・研修の情報を送った", "ご本人の返事待ち", "完了の連絡をした", "その他"], "note": "お名前を伏せた相談もあります。勤務先へは、ご本人の同意なく連絡しないでください。", "done": ["完了", "見送り"]}, {"key": "honnin", "name": "利用者・ご本人", "match": ["利用者・ご本人"], "route": "partner", "word": "ご相談", "steps": ["新規受付", "内容確認中", "会員施設の確認", "状況の聞き取り", "振分け済み", "提携先対応中", "利用・手続きの準備中", "完了", "見送り"], "need": ["振分け済み", "提携先対応中", "利用・手続きの準備中"], "mk": ["電話した", "メールした", "面談・訪問した", "状況を聞き取った", "通っている病院・施設に確認した", "施設へ会員制度を案内した", "会員の病院・施設を紹介した", "地域包括支援センターなど公的窓口を案内した", "提携先へ紹介した", "資料・見積りを送った", "ご本人の返事待ち", "提携先の返事待ち", "完了の連絡をした", "その他"], "note": "通っている病院・施設が会員かを必ず確かめてください（会員でなければ「会員施設の確認」に記録）。提携先へ情報を渡す前に、ご本人の同意を取ってください。", "done": ["完了", "見送り"]}, {"key": "kazoku", "name": "ご家族", "match": ["ご家族"], "route": "partner", "word": "ご相談", "steps": ["新規受付", "内容確認中", "会員施設の確認", "状況の聞き取り", "振分け済み", "提携先対応中", "利用・手続きの準備中", "完了", "見送り"], "need": ["振分け済み", "提携先対応中", "利用・手続きの準備中"], "mk": ["電話した", "メールした", "面談・訪問した", "ご家族から状況を聞き取った", "ご本人の意向を確かめた", "ケアマネジャーと連絡をとった", "通っている病院・施設に確認した", "施設へ会員制度を案内した", "会員の病院・施設を紹介した", "地域包括支援センターなど公的窓口を案内した", "提携先へ紹介した", "資料・見積りを送った", "ご家族の返事待ち", "提携先の返事待ち", "完了の連絡をした", "その他"], "note": "ご本人が通っている病院・施設が会員かを必ず確かめてください（会員でなければ「会員施設の確認」に記録）。ご本人の情報を提携先へ渡すときは、ご本人（または代理の方）の同意を確かめてください。", "done": ["完了", "見送り"]}, {"key": "none", "name": "立場の選択なし", "match": ["分からない・近いものがない"], "route": "partner", "word": "ご相談", "steps": ["新規受付", "内容確認中", "振分け済み", "提携先対応中", "提案・見積り中", "完了", "見送り"], "need": ["振分け済み", "提携先対応中", "提案・見積り中"], "mk": ["電話した", "メールした", "面談した", "状況を聞き取った", "公的な窓口を案内した", "提携先へ紹介した", "見積り・資料を送った", "お客様の返事待ち", "提携先の返事待ち", "完了の連絡をした", "その他"], "note": "まずお話を伺い、どの種別の相談か確かめてから進めてください。", "done": ["完了", "見送り"]}, {"key": "teikei", "name": "提携・協業の申込み", "match": ["提携・協業の申し込み"], "route": "self", "word": "お申し込み", "steps": ["新規受付", "内容確認中", "面談日の調整中", "面談済み", "社内で検討中", "契約の手続き中", "提携開始", "見送り"], "done": ["提携開始", "見送り"], "need": [], "mk": ["電話した", "メールした", "面談日を決めた", "事務所（大阪市北区）で面談した", "オンラインで面談した", "先方を訪問した", "会社案内・資料を受け取った", "社内で検討した", "提携の契約書を送った", "先方の返事待ち", "結果を連絡した", "その他"], "note": "提携・協業の申込みは、提携先へは振り分けず当会で対応します。提携開始になったら「提携先一覧に登録する」を押してください。"}, {"key": "youbou", "name": "要望・ご意見", "match": ["要望・ご意見"], "route": "self", "word": "ご意見", "steps": ["新規受付", "内容確認中", "社内で検討中", "対応を決めた", "対応済み", "見送り"], "done": ["対応済み", "見送り"], "need": [], "mk": ["内容を社内で共有した", "電話した", "メールした", "サービス・サイトに反映した", "お礼・結果を連絡した", "その他"], "note": "要望・ご意見は当会で対応します。お返事が要らない方もいるので、連絡は内容を見て判断してください。"}, {"key": "kaiin", "name": "会員登録の申込み", "match": ["会員登録"], "route": "self", "word": "お申し込み", "steps": ["新規受付", "内容確認中", "契約書を送った", "入金待ち", "登録完了", "見送り"], "done": ["登録完了", "見送り"], "need": [], "mk": ["電話した", "メールした", "契約書を送った", "入金を確認した", "登録完了を連絡した", "その他"], "note": "契約書の状況と入金は「電子契約」の画面で確かめられます。"}];
var FIELD_LIST = ["経営・業務の改善", "採用・定着・研修", "補助金・助成金の情報", "共同購入・固定費の見直し", "専門家への相談", "事業承継・連携", "職場・働き方の相談", "資格・研修・キャリア", "福利厚生・暮らしの優待", "病院・施設・在宅サービスの相談先", "退院・入居前後の暮らしの準備", "医療費・介護費の制度", "家族の介護と仕事の両立", "お金の管理・成年後見", "買い物・移動などの生活支援", "引越し・住み替え・家財の整理", "終活・相続・遺品整理", "その他・まだ分からない", "提携・協業の申し込み", "要望・ご意見", "会員登録（事業所会員）", "会員登録（法人会員）", "会員登録（協賛会員）", "会員登録（個人会員（営業協力者））"];
var ROUTE_AUTO = {"経営・業務の改善": ["経営・管理の支援", "経営コンサルティング"], "採用・定着・研修": ["人材・採用・教育", "採用・人材サービス"], "補助金・助成金の情報": ["経営・管理の支援", "補助金・資金"], "共同購入・固定費の見直し": ["固定費の見直し", "契約の見直し"], "専門家への相談": ["経営・管理の支援", "士業・専門家"], "事業承継・連携": ["経営・管理の支援", "経営コンサルティング"], "職場・働き方の相談": ["経営・管理の支援", "士業・専門家"], "資格・研修・キャリア": ["働く方の福利厚生・キャリア", "キャリア"], "福利厚生・暮らしの優待": ["働く方の福利厚生・キャリア", "福利厚生"], "病院・施設・在宅サービスの相談先": ["医療・介護サービスの連携", "介護"], "退院・入居前後の暮らしの準備": ["医療・介護サービスの連携", "医療"], "医療費・介護費の制度": ["医療・介護サービスの連携", "介護"], "家族の介護と仕事の両立": ["医療・介護サービスの連携", "介護"], "お金の管理・成年後見": ["暮らし・生活の支援（利用者・ご家族向け）", "お金・法律"], "買い物・移動などの生活支援": ["暮らし・生活の支援（利用者・ご家族向け）", "生活サービス"], "引越し・住み替え・家財の整理": ["暮らし・生活の支援（利用者・ご家族向け）", "住まい"], "終活・相続・遺品整理": ["暮らし・生活の支援（利用者・ご家族向け）", "お金・法律"]};
var KIYAKU_TEXT = "医療介護総合支援会　会員規約（事業所・法人・協賛会員）\n\n第1条（目的と適用）\n1　この規約は、株式会社グローブ（以下「当社」）が運営する「医療介護総合支援会」（以下「本会」）の会員制サービスの利用条件を定めるものです。\n2　この規約は、事業所会員・法人会員・協賛会員（以下あわせて「会員」）に適用します。個人会員には「個人会員規約」を適用します。\n\n第2条（本会の性格）\n本会は、当社が提供する会員制のサービスです。中小企業等協同組合法その他の法令に基づく組合や社団ではなく、会員が本会の出資者や構成員となるものではありません。契約・会費・入退会・個人情報の管理は、当社が行います。\n\n第3条（会員の種類）\n1　事業所会員：病院・診療所・介護事業所・薬局など1つの事業所\n2　法人会員：複数の事業所を運営する法人\n3　協賛会員：医療・介護に関わる方へサービスを提供する企業で、当社の審査を通過したもの\n\n第4条（入会の申込みと契約の成立）\n1　入会を希望する方は、本会のウェブサイトから申し込み、当社が送る電子契約でこの規約を確認し、必要事項の記入と押印をして承認します。\n2　入会の契約は、申込者が電子契約で承認した時に成立します。\n3　当社は、申込者が次のいずれかに当たる場合、入会をお断りすることがあります。理由は開示しないことがあります。\n　(1) 申込内容に偽りや誤りがある\n　(2) 過去にこの規約に反して退会させられたことがある\n　(3) 反社会的勢力に当たる、または関わりがある\n　(4) その他、当社が会員とすることが適当でないと判断した\n\n第5条（会費）\n1　会費（税込）は次のとおりとします。年間払いは、いずれも月額の10か月分とします。\n　(1) 事業所会員：月額5,500円（職員5名まで）。職員が5名を超える場合は1名につき500円を加算\n　(2) 法人会員：1か所目5,500円、2か所目から1か所につき5,000円（いずれも職員5名まで）。5名を超える職員1名につき500円を加算\n　(3) 協賛会員：月額33,000円（年間払い330,000円）\n2　職員の数は、入会時と更新時に会員が申告した人数とします。契約期間中に事業所や職員が増えた場合は、会員は当社に速やかに知らせ、翌月分から変更後の会費とします。\n3　会費は、入会の翌月1日から発生します。入会した月の会費はかかりません。\n\n第6条（会費の支払い）\n1　会費は前払いとし、当社が指定する銀行口座への振込みで支払うものとします。振込手数料は会員の負担とします。\n2　当社は、毎月1日に翌月分の会費の請求書をメールで送ります。入会時は、入会の手続きが終わった時に請求書を送ります。\n3　月払いの会員は、毎月10日までに翌月分の会費を支払います。入会時は、入会日から7日以内に翌月分を支払います。\n4　年間払いの会員は、12か月分の会費を、入会時は入会日から7日以内に、更新時は新しい12か月が始まる月の前月10日までに支払います。\n5　支払日が金融機関の休業日の場合は、その前の営業日までに支払うものとします。\n\n第7条（入会金と創設会員）\n1　創設会員は、事業所会員・法人会員の数が合わせて100社に達するまでに入会した会員とします。\n2　創設会員の入会金は免除します。創設会員以外の入会金は、別に定めて公表します。\n\n第8条（紹介特典）\n創設会員の募集期間中に、会員の紹介で事業所会員または法人会員が3社入会した場合、その会員の会費を1年分免除します。免除は、3社目の入会を確認した月の翌月分から適用します。年間払いで支払済みの会費がある場合は、次の更新時から免除します。\n\n第9条（契約期間と更新）\n1　契約期間は、会費が発生する月の1日から1年間とします。月払いの会員も同じです。\n2　期間が終わる1か月前までに会員または当社から解約の申し出がない場合、契約は同じ条件で1年間更新され、以後も同様とします。\n3　当社は、更新の2か月前までに、会員に更新日と解約の申し出の期限をメールで知らせます。\n\n第10条（解約）\n1　会員は、契約期間が終わる1か月前までに当社所定の方法で申し出ることで、期間の終了をもって解約できます。\n2　月払いの会員が契約期間の途中で解約する場合、契約期間の残りの月数分の会費を、解約日の属する月の末日までに支払うものとします。\n3　年間払いの会員が契約期間の途中で解約する場合、支払済みの会費は返金しません。\n4　第2項と第3項は、次条の場合には適用しません。\n\n第11条（効果が出なかった場合の途中解約）\n1　入会後、当社が提案する経費の削減などを会員が実施したにもかかわらず、会費が発生してから3か月の時点で、その効果の額が同じ期間に支払った会費の額を下回る場合、会員は残りの月数分の会費を支払うことなく解約できます。\n2　会員が当社の提案に同意しなかった場合、または同意した提案を実施しなかった場合は、前項を適用しません。\n3　効果の額は、会員が提出する請求書などの資料をもとに、当社と会員が確認して決めます。\n\n第12条（サービスの内容と範囲）\n1　当社は、会員に対し、本会のウェブサイトに示す支援（情報の提供、相談内容の整理、専門家・提携先へのおつなぎ、経費の見直しの提案など）を提供します。\n2　当社は、診断・治療などの医療の判断、法律・税務・労務の専門的な判断、補助金などの申請書類の作成、職業紹介、事業の売買の仲介は行いません。これらは、資格や許可を持つ専門家・提携先が担当します。\n3　当社は、患者・利用者の個人情報を受け取りません。会員は、当社への相談に患者・利用者を特定できる情報を含めないものとします。\n4　提携先が提供するサービスの契約は、会員と提携先の間で結ばれ、当社はその当事者になりません。\n5　当社は、提案や情報によって経費の削減や売上などの特定の結果が生じることを保証しません（第11条の途中解約を除きます）。\n\n第13条（手数料と紹介料の開示）\n1　当社は、会員が提携先のサービスを利用した場合に、提携先から手数料を受け取ることがあります。その場合は、提案の時にその旨を知らせます。\n2　当社は、弁護士・税理士・社会保険労務士・行政書士などの専門家から紹介料を受け取りません。\n3　当社は、会員を紹介した個人会員に、その会員の会費・手数料の一部を紹介料として支払います。紹介料は当社の受け取る会費・手数料から支払うもので、会員の会費に上乗せするものではありません。\n\n第14条（協賛会員の特則）\n1　協賛会員の入会には、当社の審査が必要です。\n2　協賛会員の紹介・掲載は、広告であることを明示して行います。当社は、他の会員に協賛会員の商品・サービスの購入を強いません。\n\n第15条（禁止事項）\n会員は、次の行為をしてはなりません。\n　(1) 他の会員・提携先・当社の信用を傷つける行為\n　(2) 本会で知った他の会員の情報を、その会員の同意なく営業や第三者への提供に使う行為\n　(3) 本会の名称を、当社の承諾なく宣伝に使う行為\n　(4) 法令や公序良俗に反する行為\n\n第16条（会費の滞納と退会）\n1　会費の支払いが期日から1か月以上遅れた場合、当社はサービスの提供を止めることがあります。\n2　会員がこの規約に重大な違反をし、当社が求めても改めない場合、当社は契約を解除できます。この場合、支払済みの会費は返金せず、未払いの会費はただちに支払うものとします。\n\n第17条（個人情報）\n当社は、会員の個人情報を、本会のウェブサイトに示す「個人情報の取り扱い」に従って取り扱います。会員の同意なく、提携先や個人会員に会員の情報を渡しません。\n\n第18条（反社会的勢力の排除）\n会員と当社は、自らとその役員が暴力団などの反社会的勢力でないこと、反社会的勢力と関わりを持たないことを確約します。相手がこれに反した場合、催告なく契約を解除できます。\n\n第19条（責任の範囲）\n当社は、本会のサービスに関して会員に生じた損害について、当社の故意または重大な過失による場合を除き、損害が生じた月の会費の額を上限として責任を負います。\n\n第20条（規約の変更）\n1　当社は、会員の利益になる場合、または変更の必要性・内容の相当性などに照らして合理的な場合に、この規約を変更できます。\n2　変更するときは、効力が生じる日の1か月前までに、変更の内容と効力が生じる日を、本会のウェブサイトとメールで知らせます。\n3　会費の値上げは、次の更新時から適用します。\n\n第21条（準拠法と管轄）\nこの規約は日本の法律に従います。この規約に関する紛争は、大阪地方裁判所を第一審の専属的合意管轄裁判所とします。";
var KOJIN_TEXT = "医療介護総合支援会　個人会員（営業協力者）規約\n\n第1条（目的）\nこの規約は、株式会社グローブ（以下「当社」）が運営する「医療介護総合支援会」（以下「本会」）に、事業所会員・法人会員を紹介する個人会員（営業協力者）と当社の間の条件を定めるものです。\n\n第2条（個人会員の位置づけ）\n1　個人会員の登録と継続に費用はかかりません。個人会員は、本会の支援サービスを利用できません。\n2　個人会員は、当社の従業員・代理人ではなく、当社に代わって契約を結ぶ権限もありません。\n3　個人会員に、紹介の件数・時間のノルマはありません。\n\n第3条（登録）\n1　登録を希望する方は、本会のウェブサイトから申し込み、当社が送る電子契約でこの規約を確認して承認します。\n2　紹介料の支払いを受けるには、本人確認書類の提出と、本人名義の振込口座の登録が必要です。\n3　18歳未満の方、反社会的勢力に当たる方、その他当社が不適当と判断した方は、登録できません。\n\n第4条（紹介の方法）\n1　個人会員は、紹介先の了解を得たうえで、当社所定の紹介コードまたは紹介の申込みで、紹介先を当社に知らせます。\n2　紹介先が入会の申込みで紹介者として個人会員を指定した場合に、その個人会員の紹介とします。同じ紹介先に複数の紹介があった場合は、紹介先が指定した方を優先します。\n3　個人会員は、本会のサービスの内容や費用を自分で説明して契約を結ばせてはならず、その説明は当社が行います。\n\n第5条（紹介料）\n1　当社は、個人会員の紹介で入会した事業所会員・法人会員（以下「紹介先」）について、次の紹介料を支払います。\n　(1) 会費の紹介料：紹介先から当社に入金された会費の20%\n　(2) 手数料の紹介料：紹介先が経費の削減などのサービスを利用して当社が受け取った手数料の20%。当社が紹介先へ還元した場合は、還元した額を差し引いた残りの20%\n2　紹介料は、紹介先からの入金を当社が確認したものだけを対象とします。\n3　紹介料は、毎月末日で締め、翌月15日までに計算して個人会員に知らせ、翌月末日に登録口座へ振り込みます。\n4　紹介先が会費の返金を受けた場合や、紹介が第7条に反していた場合は、その分の紹介料を支払いません。すでに支払った場合は、次回以降の紹介料から差し引くか、返していただきます。\n5　個人会員が別の個人会員を紹介しても、紹介料は支払いません。個人会員が紹介した個人会員の成果に応じた紹介料も支払いません。\n6　紹介料は、当社が受け取る会費・手数料の中から支払うもので、紹介先の会費に上乗せしません。当社は、紹介料の仕組みがあることを本会のウェブサイトと会員規約で紹介先に知らせます。\n7　紹介料に関する税金の申告は、個人会員が自分で行います。当社は、法令に従い支払の記録を作り、必要な場合は税務署に提出します。\n\n第6条（勤め先の紹介）\n個人会員が自分の勤め先や、自分が役員を務める法人を紹介する場合は、紹介料を受け取ることについて、その勤め先・法人の了解を得なければなりません。当社は、了解を得たことを確かめることがあります。\n\n第7条（禁止事項）\n個人会員は、紹介にあたり次の行為をしてはなりません。\n　(1) 「必ず得をする」「確実に経費が下がる」など、事実と違う説明や断定的な説明\n　(2) 断られた後の繰り返しの勧誘、威迫、心理的に追い込む勧誘\n　(3) 当社の従業員や代理人であるかのような名乗り、本会の名での契約や約束\n　(4) 紹介先に紹介料の一部を渡す約束や、金品の提供\n　(5) 紹介先の同意なく、その情報を当社や第三者に伝えること\n　(6) 患者・利用者の個人情報を扱うこと\n　(7) 本会の名称・画像を、当社の承諾なく広告に使うこと\n　(8) 法令や公序良俗に反する行為\n\n第8条（秘密の保持）\n個人会員は、紹介を通じて知った紹介先と当社の秘密を、登録を終えた後も第三者に漏らしてはなりません。\n\n第9条（登録の取消し）\n1　個人会員は、いつでも登録を取り消せます。取り消した月までに入金が確認された分の紹介料は支払います。\n2　当社は、個人会員がこの規約に反した場合、紹介料の支払いを止め、登録を取り消すことがあります。\n\n第10条（個人情報・反社会的勢力・規約の変更・管轄）\n個人情報の取り扱い、反社会的勢力の排除、規約の変更、準拠法と管轄は、会員規約の第17条・第18条・第20条・第21条と同じとします。";
var NDA_TEXT = "株式会社グローブ（以下「甲」という。）と [[party]]（以下「乙」という。）は、甲が運営する医療介護総合支援会でのご相談に関し、次のとおり秘密保持契約を結ぶ。\n\n第1条（秘密情報）\n本契約で秘密情報とは、ご相談の内容、乙の事業・経営・人事・取引に関する情報など、相談を通じて甲が知った一切の情報をいう。ただし、すでに公知の情報、甲が正当に第三者から得た情報は除く。\n\n第2条（秘密の保持）\n甲は、秘密情報を厳重に管理し、乙の事前の同意なく第三者に開示・漏えいしない。\n\n第3条（目的外の使用の禁止）\n甲は、秘密情報を、乙のご相談への対応の目的以外に使わない。\n\n第4条（専門家・提携先への開示）\n甲は、乙の同意を得た場合に限り、ご相談に必要な範囲で、秘密情報を専門家・提携先に開示できる。この場合、甲は開示先に本契約と同じ義務を守らせる。\n\n第5条（患者・利用者の情報）\n乙は、ご相談に患者・利用者を特定できる情報を含めない。誤って受け取った場合、甲はただちに乙に知らせ、廃棄する。\n\n第6条（返還・廃棄）\n甲は、ご相談が終わった後、乙から求めがあれば、秘密情報を返還または廃棄する。\n\n第7条（有効期間）\n本契約は締結の日から効力を持ち、ご相談が終わった後も3年間有効とする。\n\n第8条（準拠法と管轄）\n本契約は日本の法律に従う。本契約に関する紛争は、大阪地方裁判所を第一審の専属的合意管轄裁判所とする。";
var TEIKEI_TEXT = "株式会社グローブ（以下「甲」という。）と [[party]]（以下「乙」という。）は、甲が運営する医療介護総合支援会（以下「本会」）の会員に対し、乙がサービスを提供することに関し、次のとおり業務提携契約を結ぶ。\n\n第1条（目的）\n甲は、本会の会員の相談内容に応じて乙を紹介し、乙は会員に対して自らのサービスを提供する。\n\n第2条（契約の当事者）\n乙のサービスの契約は、乙と会員の間で結ばれ、甲はその当事者にならない。乙は、自らの責任でサービスを提供する。\n\n第3条（手数料）\n1　会員が乙のサービスを利用した場合、乙は甲に、別に定める手数料を支払う。手数料の条件は、末尾の「提携の条件」による。\n2　手数料を会員への請求額に上乗せしてはならない。\n\n第4条（適正な提供）\n乙は、法令・業界の規則を守り、会員に対し、事実と違う説明や断定的な説明、強引な勧誘をしない。\n\n第5条（秘密の保持と個人情報）\n1　甲と乙は、本契約を通じて知った相手方と会員の秘密を、第三者に漏らさない。本契約の終了後も同じとする。\n2　甲と乙は、会員の個人情報を、個人情報の保護に関する法律に従って取り扱い、紹介の目的以外に使わない。\n\n第6条（反社会的勢力の排除）\n甲と乙は、自らとその役員が反社会的勢力でないこと、反社会的勢力と関わりを持たないことを確約する。相手がこれに反した場合、催告なく本契約を解除できる。\n\n第7条（有効期間）\n本契約の有効期間は締結の日から1年間とし、期間が終わる1か月前までに申し出がなければ、同じ条件で1年間更新し、以後も同様とする。\n\n第8条（解除）\n甲または乙は、相手方が本契約に違反し、催告しても改めない場合、本契約を解除できる。\n\n第9条（準拠法と管轄）\n本契約は日本の法律に従う。本契約に関する紛争は、大阪地方裁判所を第一審の専属的合意管轄裁判所とする。";
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
function memberTitle(type) { return (MEMBER_LABEL[type] || "会員") + " 申込書"; }
/* 会員申込書は「事業所会員」「法人会員」「協賛会員」の3種類に分ける（保存するときは kaiin として扱い、会員区分は固定） */
(function () { var b = TEMPLATES[0], add = ["jigyosho", "hojin", "kyosan"].map(function (m) { var o = {}; for (var k in b) o[k] = b[k]; o.key = "kaiin_" + m; o.base = "kaiin"; o.mtype = m; o.title = memberTitle(m); return o; }); b.hidden = true; TEMPLATES.splice.apply(TEMPLATES, [1, 0].concat(add)); })();
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
  o.dueText = "入会日（承認した日）から7日以内";
  return o;
}
function condText(c) {
  var o = normCond(c), L = [];
  L.push("　会員区分：" + MEMBER_LABEL[o.type] + (o.type === "kyosan" ? "" : "（事業所数 " + o.sites + "か所、職員数 " + o.staff + "名）"));
  L.push("　支払方法：" + (o.pay === "year" ? "年間払い（12か月分を10か月分の額で）" : "月払い") + "　銀行振込・前払い。振込手数料は申込者の負担");
  L.push("　月額会費（税込）：" + yen(o.monthly) + (o.pay === "year" ? "　→　年間払いの額（税込）：" + yen(o.monthly * 10) : ""));
  L.push("　初回のお振込み額（税込）：" + yen(o.first) + "（" + o.dueText + "。入会した月の会費は無料）");
  L.push("　2回目以降：毎月1日に翌月分" + (o.pay === "year" ? "（年間払いは更新の前月1日に12か月分）" : "") + "の請求書をメールで送ります。お支払期限は毎月10日です");
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
  if (key === "kaiin" || /^kaiin_/.test(key)) {
    if (t && t.mtype) cond = Object.assign({}, cond || {}, { type: t.mtype });
    b = "医療介護総合支援会　" + memberTitle(normCond(cond).type) + "\n\n株式会社グローブ　御中\n\n申込者は、下に続く「医療介護総合支援会 会員規約」に同意し、次のとおり入会を申し込みます。\n\n1．申込者\n　事業所名・法人名：[[company]]\n　所在地：[[address]]\n　代表者名：[[rep]]\n　ご担当者名：[[name]]\n　電話番号：[[phone]]\n\n2．契約の内容\n" + condText(cond) +
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

/* =====================================================================
   医療介護総合支援会　電子契約（Google Apps Script）
   ・お客様の画面（サイトの /medical/keiyaku/）からの通信を受ける doPost
   ・担当者の管理画面（このスクリプトのウェブアプリ ?admin=1）
   使い方は「設定のしかた.txt」を見てください。
   ===================================================================== */
var SHEET = "契約";
var COLS = ["id", "token", "template", "title", "party_name", "party_company", "party_email", "fields", "required", "require_id", "cond", "note", "prefill", "body", "status", "created", "expires", "viewed", "signed", "values", "seal_file", "id_file", "pdf_id", "hash", "ua", "log", "draft", "paid", "refcode", "billed", "stopped", "case_no", "feedback", "prev", "issuer"];
var VALID_DAYS = 30;

function P(k) { return PropertiesService.getScriptProperties().getProperty(k) || ""; }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---- 最初に1回だけ実行：シートとフォルダを作る ---- */
function setup() {
  var pr = PropertiesService.getScriptProperties();
  if (!P("SHEET_ID")) {
    var ss = SpreadsheetApp.create("医療介護総合支援会 電子契約（台帳）");
    var sh = ss.getActiveSheet(); sh.setName(SHEET); sh.appendRow(COLS); sh.setFrozenRows(1);
    pr.setProperty("SHEET_ID", ss.getId());
  }
  inboxSheet_();
  if (!P("FOLDER_ID")) { var f = DriveApp.createFolder("医療介護総合支援会 電子契約"); pr.setProperty("FOLDER_ID", f.getId()); }
  if (!P("ADMIN_EMAILS")) pr.setProperty("ADMIN_EMAILS", Session.getEffectiveUser().getEmail());
  if (!P("NOTIFY_TO")) pr.setProperty("NOTIFY_TO", Session.getEffectiveUser().getEmail());
  if (!P("SIGN_URL")) pr.setProperty("SIGN_URL", "https://119cm.net/keiyaku/index.html");
  Logger.log("準備ができました。台帳: https://docs.google.com/spreadsheets/d/" + P("SHEET_ID") + "  フォルダ: https://drive.google.com/drive/folders/" + P("FOLDER_ID"));
}

/* ---- サイトのフォーム（相談・会員登録の申込み）の受付 ---- */
var INBOX = "受付", INBOX_COLS = ["受付番号", "受付日時", "区分", "お名前", "事業所名・会社名", "メール", "電話", "内容", "状態", "対応メモ", "分野", "振分け先", "担当", "最終更新", "最終連絡", "次の対応予定日", "会員施設の確認", "提携先へ送った記録"];
function inboxSheet_() {
  var ss = SpreadsheetApp.openById(P("SHEET_ID")), sh = ss.getSheetByName(INBOX);
  if (!sh) { sh = ss.insertSheet(INBOX); sh.appendRow(INBOX_COLS); sh.setFrozenRows(1); }
  if (sh.getLastColumn() < INBOX_COLS.length) sh.getRange(1, 1, 1, INBOX_COLS.length).setValues([INBOX_COLS]);
  return sh;
}
function inbox_(d) {
  var cache = CacheService.getScriptCache(), cut = function (x, m) { return String(x == null ? "" : x).slice(0, m || 200); };
  if (+d.elapsed > 0 && +d.elapsed < 3000) throw new Error("送信できませんでした");
  var em = cut(d.email, 120).trim(), okMail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em);
  var n1 = +(cache.get("in_" + em.toLowerCase()) || 0), n2 = +(cache.get("in_all") || 0);
  if (n1 >= 5 || n2 >= 100) throw new Error("送信が続いたため、しばらくお待ちください");
  cache.put("in_" + em.toLowerCase(), String(n1 + 1), 3600); cache.put("in_all", String(n2 + 1), 3600);
  var no = /^[A-Z]{2,3}-[0-9]{6}-[0-9A-Z]{4,8}$/.test(String(d.no || "")) ? d.no : "IK-" + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyMMdd-HHmm") + Math.floor(Math.random() * 1000);
  var body = cut(d.body, 6000), label = cut(d.catLabel || d.entry, 120);
  var fields = (Array.isArray(d.fields) ? d.fields : []).map(function (x) { return cut(x, 40); }).slice(0, 12);
  var partner = segOf_(label).route === "self" ? "自社" : routeFor_(fields);
  var fac = facAuto_(label, body);
  inboxSheet_().appendRow([no, new Date(), label, cut(d.name, 60), cut(d.company, 100), em, "'" + cut(d.tel, 30), body, "新規受付", "", fields.join("、"), partner, "", new Date(), "", "", fac ? JSON.stringify(fac) : "", ""]);
  hist_(no, "受付", label + "\n" + cut(d.company, 100) + " " + cut(d.name, 60) + (partner ? "\n振分け候補：" + partner : ""), "", "サイト", "受付");
  var mail = { to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］新しい受付 " + no + "　" + label, body: body + "\n\nお名前：" + cut(d.name, 60) + "\nメール：" + em + "\n電話：" + cut(d.tel, 30) + "\n\n受付の一覧：https://docs.google.com/spreadsheets/d/" + P("SHEET_ID") };
  if (okMail) mail.replyTo = em;
  MailApp.sendEmail(mail);
  if (okMail) MailApp.sendEmail({ to: em, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】受付しました（受付番号 " + no + "）", body: cut(d.name, 60) + " 様\n\nお問い合わせありがとうございます。次の内容で受け付けました。\n受付後、原則として3営業日以内にメールでご返信します（土日祝・年末年始を除く）。\n\n受付番号：" + no + "\n\n" + body + "\n\nお心当たりがない場合は、このメールを破棄してください。\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）\n" + P("NOTIFY_TO") });
  return { ok: true, no: no };
}

/* 利用者・ご本人／ご家族の相談：通っている病院・施設が会員かを、会員名簿（電子契約）と照らし合わせる */
function facAuto_(label, body) {
  var g = segOf_(label); if (g.key !== "honnin" && g.key !== "kazoku") return null;
  var m = String(body || "").match(/通っている病院・施設：([^\n]*)/), f = { m: "未確認", kind: "", name: "", addr: "", member: "" };
  if (!m) return f;
  var t = m[1], a = t.match(/（([^）]*)）$/); if (a) { f.addr = a[1]; t = t.slice(0, a.index); }
  var p = t.split("／"); f.kind = (p[0] || "").trim(); f.name = (p.slice(1).join("／") || "").trim();
  if (/まだどこにも/.test(f.kind)) { f.m = "通っている先がない"; return f; }
  var norm = function (x) { return String(x || "").replace(/[\s　]/g, "").replace(/(医療法人|社会福祉法人|株式会社|有限会社|合同会社|一般社団法人|社団|財団)/g, ""); }, n = norm(f.name);
  if (n.length >= 2) rows_().forEach(function (o) {
    if (f.member || o.template !== "kaiin" || o.status !== "締結済み" || o.stopped || o.draft === "yes") return;
    var c = norm(o.party_company); if (c && (c.indexOf(n) >= 0 || n.indexOf(c) >= 0)) { f.member = o.party_company; f.m = "会員の病院・施設"; f.auto = 1; }
  });
  return f;
}

/* ---- 案件管理 ---- */
var STEPS = ["新規受付", "内容確認中", "振分け済み", "提携先対応中", "提案・見積り中", "完了", "見送り"];
/* 種別（企業・働く方・利用者・家族・提携申込み・要望・会員登録）ごとに、状態の並びと振分けのしかたが変わる */
function segOf_(label) { var t = String(label || ""), i = t.indexOf("："); t = (i >= 0 ? t.slice(i + 1) : t).split("／")[0];
  for (var k = 0; k < CASE_SEGS.length; k++) if (CASE_SEGS[k].match.indexOf(t) >= 0) return CASE_SEGS[k];
  for (k = 0; k < CASE_SEGS.length; k++) if (CASE_SEGS[k].key === "none") return CASE_SEGS[k]; }
function isDone_(c) { var s = segOf_(c.label); return s.done.indexOf(c.status) >= 0 || c.status === "完了" || c.status === "見送り"; }
var ALL_STEPS = (function () { var a = STEPS.slice(); CASE_SEGS.forEach(function (s) { s.steps.forEach(function (x) { if (a.indexOf(x) < 0) a.push(x); }); }); return a; })();
var ROUTE = "振分け設定", HIST = "対応履歴";
function sheetOf_(name, head) {
  var ss = SpreadsheetApp.openById(P("SHEET_ID")), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}
function routes_() {
  var sh = sheetOf_(ROUTE, ["分野", "振分け先（提携企業・専門家）", "備考"]), v = sh.getDataRange().getValues(), o = {};
  for (var i = 1; i < v.length; i++) if (v[i][0]) o[String(v[i][0])] = String(v[i][1] || "");
  var add = FIELD_LIST.filter(function (f) { return !(f in o); });
  if (add.length) { sh.getRange(sh.getLastRow() + 1, 1, add.length, 3).setValues(add.map(function (f) { o[f] = ""; return [f, "", ""]; })); }
  return o;
}
var PSHEET = "提携先一覧", PHEAD = ["提携先の名前", "大分類", "中分類", "小分類", "メモ", "ご担当者", "メール（案件の送り先）", "電話", "対応できる地域", "登録日", "登録した人", "状態"], PKEY = ["name", "a", "b", "c", "note", "person", "email", "tel", "area", "since", "by", "state"];
function livePartners_() { return partners_().filter(function (p) { return p.state !== "確認待ち"; }); }
function partnerSheet_() { var sh = sheetOf_(PSHEET, PHEAD); if (sh.getLastColumn() < PHEAD.length) sh.getRange(1, 1, 1, PHEAD.length).setValues([PHEAD]); return sh; }
function partners_() { var v = partnerSheet_().getDataRange().getValues(), out = []; for (var i = 1; i < v.length; i++) if (v[i][0]) { var o = {}; PKEY.forEach(function (k, j) { var x = v[i][j]; o[k] = x instanceof Date ? Utilities.formatDate(x, "Asia/Tokyo", "yyyy-MM-dd") : String(x == null ? "" : x); }); out.push(o); } return out; }
function partnerSet_(d) {
  var today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
  var rows = (d.rows || []).filter(function (r) { return r && r.name; }).slice(0, 500).map(function (r) {
    if (r.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(r.email).trim())) throw new Error("「" + r.name + "」のメールアドレスの形が正しくありません");
    return PKEY.map(function (k) { return String(k === "since" ? (r.since || today) : k === "by" ? (r.by || ACTOR_ || adminName_()) : k === "state" ? (r.state || "登録済み") : (r[k] || "")).trim().slice(0, k === "note" ? 300 : 120); }); });
  var sh = partnerSheet_(), last = sh.getLastRow(); if (last > 1) sh.getRange(2, 1, last - 1, PHEAD.length).clearContent(); if (rows.length) sh.getRange(2, 1, rows.length, PHEAD.length).setValues(rows);
  return { ok: true, partners: partners_() };
}
function staff_() { var l = parse_(P("STAFF"), []); accs_().forEach(function (x) { if (x.active !== false && l.indexOf(x.name) < 0) l.push(x.name); }); return l; }
function staffSet_(d) { var l = (d.list || []).map(function (x) { return String(x).trim().slice(0, 30); }).filter(function (x, i, a) { return x && a.indexOf(x) === i; }).slice(0, 50); PropertiesService.getScriptProperties().setProperty("STAFF", JSON.stringify(l)); return { ok: true, staff: l }; }
// 新しい受付の振分け先：相談の分野から分類を決め、提携先一覧で当てはまる先を選ぶ（なければ予備の分野ごとの振分け）
function routeFor_(fields) {
  var ps = livePartners_();
  for (var i = 0; i < fields.length; i++) { var m = ROUTE_AUTO[fields[i]]; if (!m) continue;
    var hit = ps.filter(function (p) { return p.a === m[0] && p.b === m[1]; })[0] || ps.filter(function (p) { return p.a === m[0]; })[0]; if (hit) return hit.name; }
  var r = routes_(); for (var j = 0; j < fields.length; j++) if (r[fields[j]]) return r[fields[j]].split(/[、,]/)[0].trim(); return "";
}
function routeSet_(d) {
  var sh = sheetOf_(ROUTE, ["分野", "振分け先（提携企業・専門家）", "備考"]), v = sh.getDataRange().getValues(), idx = {};
  for (var i = 1; i < v.length; i++) idx[String(v[i][0])] = i + 1;
  (d.rows || []).forEach(function (r) {
    var f = String(r.field || "").slice(0, 60), pt = String(r.partners || "").slice(0, 300); if (!f) return;
    if (idx[f]) sh.getRange(idx[f], 2).setValue(pt); else { sh.appendRow([f, pt, ""]); idx[f] = sh.getLastRow(); }
  });
  return { ok: true, routes: routes_() };
}
/* 対応ログ：だれが・いつ・何をしたかを「対応履歴」シートに残す（案件・電子契約・設定・ログイン・自動の送信） */
var HIST_HEAD = ["日時", "受付番号・契約番号", "種類", "内容", "担当", "操作した人", "区分"], ACTOR_ = "";
function histSheet_() { var sh = sheetOf_(HIST, HIST_HEAD); if (sh.getLastColumn() < HIST_HEAD.length) sh.getRange(1, 1, 1, HIST_HEAD.length).setValues([HIST_HEAD]); return sh; }
function areaOf_(no, kind) { no = String(no || ""); if (/^IKK-/.test(no)) return "電子契約"; if (/^(IK|IKT|IKY|IKM)[A-Z]*-/.test(no)) return /^受付/.test(kind) ? "受付" : "案件"; return /ログイン|パスワード/.test(kind) ? "ログイン" : "設定"; }
function hist_(no, kind, text, staff, actor, area) { try { histSheet_().appendRow([new Date(), no || "", kind, String(text || "").slice(0, 3000), staff || "", actor != null ? actor : ACTOR_, area || areaOf_(no, kind)]); } catch (e) { } }
function logRows_(d) {
  var sh = histSheet_(), last = sh.getLastRow(); if (last < 2) return [];
  var n = Math.min(last - 1, 2000), v = sh.getRange(last - n + 1, 1, n, HIST_HEAD.length).getValues(), out = [];
  for (var i = v.length - 1; i >= 0; i--) { var r = v[i]; if (!r[0]) continue; out.push({ ts: new Date(r[0]).toISOString(), no: String(r[1] || ""), kind: String(r[2] || ""), text: String(r[3] || "").slice(0, 1500), staff: String(r[4] || ""), actor: String(r[5] || ""), area: String(r[6] || "") || areaOf_(r[1], String(r[2])) }); }
  return out;
}
function histOf_(no) {
  var v = histSheet_().getDataRange().getValues(), out = [];
  for (var i = v.length - 1; i >= 1; i--) if (String(v[i][1]) === String(no)) out.push({ ts: v[i][0] ? new Date(v[i][0]).toISOString() : "", kind: String(v[i][2]), text: String(v[i][3]), staff: String(v[i][4]), actor: String(v[i][5] || "") });
  return out;
}
function iso_(x) { return x ? new Date(x).toISOString() : ""; }
function caseRows_() {
  var sh = inboxSheet_(), v = sh.getDataRange().getValues(), out = [];
  for (var i = 1; i < v.length; i++) {
    var r = v[i]; if (!r[0]) continue;
    var st = String(r[8] || "新規受付"); if (st === "対応中") st = "内容確認中";
    out.push({ row: i + 1, no: String(r[0]), ts: iso_(r[1]), label: String(r[2]), name: String(r[3]), company: String(r[4]), email: String(r[5]), tel: String(r[6]), body: String(r[7]), status: st, memo: String(r[9] || ""), fields: String(r[10] || ""), partner: String(r[11] || ""), staff: String(r[12] || ""), updated: iso_(r[13] || r[1]), contacted: iso_(r[14]), next: r[15] ? Utilities.formatDate(new Date(r[15]), "Asia/Tokyo", "yyyy-MM-dd") : "", fac: String(r[16] || ""), fwd: String(r[17] || "") });
  }
  return out;
}
function cases_() {
  var rows = caseRows_().sort(function (a, b) { return a.ts < b.ts ? 1 : -1; }).slice(0, 800);
  rows.forEach(function (x) { delete x.row; });
  return { ok: true, rows: rows, steps: ALL_STEPS, routes: routes_(), partners: partners_(), staff: staff_() };
}
function findCase_(no) { var r = caseRows_(); for (var i = 0; i < r.length; i++) if (r[i].no === String(no)) return r[i]; throw new Error("受付が見つかりません"); }
function caseSet_(d) {
  var c = findCase_(d.no), sh = inboxSheet_(), ch = [];
  if (d.status != null && d.status !== c.status) { if (ALL_STEPS.indexOf(d.status) < 0) throw new Error("状態が正しくありません"); sh.getRange(c.row, 9).setValue(d.status); ch.push("状態：" + c.status + " → " + d.status); }
  if (d.memo != null && d.memo !== c.memo) { sh.getRange(c.row, 10).setValue(String(d.memo).slice(0, 1000)); ch.push("メモ：" + String(d.memo).slice(0, 200)); }
  if (d.partner != null && d.partner !== c.partner) { sh.getRange(c.row, 12).setValue(String(d.partner).slice(0, 100)); ch.push("振分け先：" + (d.partner || "なし")); }
  if (d.staff != null && d.staff !== c.staff) { sh.getRange(c.row, 13).setValue(String(d.staff).slice(0, 40)); ch.push("担当：" + d.staff); }
  if (d.next != null && d.next !== c.next) { sh.getRange(c.row, 16).setValue(d.next ? new Date(d.next + "T09:00:00+09:00") : ""); ch.push("次の対応予定日：" + (d.next || "なし")); }
  if (d.fac != null && d.fac !== c.fac) { var fo = parse_(d.fac, null); if (!fo) throw new Error("会員施設の確認の内容が正しくありません"); sh.getRange(c.row, 17).setValue(JSON.stringify(fo).slice(0, 3000)); ch.push("会員施設の確認：" + (fo.m || "") + (fo.member || fo.name ? "（" + (fo.member || fo.name) + "）" : "") + (fo.plan ? "／" + fo.plan : "")); }
  if (ch.length) { sh.getRange(c.row, 14).setValue(new Date()); hist_(c.no, "更新", ch.join("／"), d.staff || c.staff); }
  return { ok: true };
}
function report_(d) {
  var c = findCase_(d.no), sh = inboxSheet_();
  var subj = String(d.subject || "").slice(0, 200), body = String(d.body || "").slice(0, 5000);
  if (d.send) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) throw new Error("お客様のメールアドレスがありません");
    if (!subj || !body) throw new Error("件名と本文を入れてください");
    MailApp.sendEmail({ to: c.email, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: subj, body: body });
    sh.getRange(c.row, 15).setValue(new Date()); sh.getRange(c.row, 14).setValue(new Date());
    hist_(c.no, "進捗報告（メール送信）", subj + "\n\n" + body, d.staff || c.staff);
  } else if (d.phone) {
    sh.getRange(c.row, 15).setValue(new Date()); sh.getRange(c.row, 14).setValue(new Date());
    hist_(c.no, "進捗報告（電話で伝えた）", body, d.staff || c.staff);
  } else {
    hist_(c.no, "進捗報告（送らなかった）", subj, d.staff || c.staff);
  }
  return { ok: true };
}
/* ---- 管理者と担当者のアカウント ---- */
function adminName_() { return P("ADMIN_NAME") || "中嶋"; }
function accs_() { var l = parse_(P("STAFF_ACC"), []); return Array.isArray(l) ? l : []; }
function accSave_(l) { PropertiesService.getScriptProperties().setProperty("STAFF_ACC", JSON.stringify(l)); }
function accView_() { return accs_().map(function (x) { return { name: x.name, id: x.id, active: x.active !== false, last: x.last || "", created: x.created || "" }; }); }
function accSet_(d) {
  var L = accs_(), op = String(d.op || ""), id = String(d.id || "").trim(), pass = String(d.pass || "");
  var find = function () { return L.filter(function (x) { return String(x.id).toLowerCase() === id.toLowerCase(); })[0]; };
  if (op === "add") {
    var name = String(d.name || "").trim().slice(0, 30);
    if (!name) throw new Error("担当者の名前を入れてください");
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(id)) throw new Error("ログインIDは、半角の英字・数字（3〜30文字）で決めてください");
    if (id.toLowerCase() === String(P("ADMIN_ID")).toLowerCase() || find()) throw new Error("このログインIDはもう使われています");
    if (L.some(function (x) { return x.name === name; }) || name === adminName_()) throw new Error("同じ名前の担当者がいます");
    if (pass.length < 8 || pass.length > 100) throw new Error("パスワードは8文字以上にしてください");
    var salt = Utilities.getUuid().replace(/-/g, ""); L.push({ name: name, id: id, salt: salt, hash: hash_(salt, pass), active: true, created: new Date().toISOString() });
    accSave_(L); var st = parse_(P("STAFF"), []); if (st.indexOf(name) < 0) { st.push(name); PropertiesService.getScriptProperties().setProperty("STAFF", JSON.stringify(st)); }
    hist_("", "担当者のIDを作成", name + "（ID：" + id + "）", "", null, "設定");
  } else {
    var x = find(); if (!x) throw new Error("その担当者が見つかりません");
    if (op === "reset") { if (pass.length < 8 || pass.length > 100) throw new Error("パスワードは8文字以上にしてください"); x.salt = Utilities.getUuid().replace(/-/g, ""); x.hash = hash_(x.salt, pass); hist_("", "担当者のパスワードを再設定", x.name + "（ID：" + x.id + "）", "", null, "設定"); }
    else if (op === "active") { x.active = !!d.active; hist_("", d.active ? "担当者のIDを使えるようにした" : "担当者のIDを止めた", x.name + "（ID：" + x.id + "）", "", null, "設定"); }
    else throw new Error("不明な操作です");
    accSave_(L);
  }
  return { ok: true, accounts: accView_() };
}
/* 自分のパスワードを変える（いまのパスワードが必要） */
function passwd_(d, S) {
  var cur = String(d.cur || ""), nw = String(d.pass || "");
  if (nw.length < 8 || nw.length > 100) throw new Error("新しいパスワードは8文字以上にしてください");
  var pr = PropertiesService.getScriptProperties();
  if (S.role === "admin") {
    if (!sameStr_(hash_(P("ADMIN_PASS_SALT"), cur), P("ADMIN_PASS_HASH"))) throw new Error("いまのパスワードが違います");
    var salt = Utilities.getUuid().replace(/-/g, ""); pr.setProperty("ADMIN_PASS_SALT", salt); pr.setProperty("ADMIN_PASS_HASH", hash_(salt, nw));
  } else {
    var L = accs_(), x = L.filter(function (y) { return y.id === S.id; })[0]; if (!x) throw new Error("アカウントが見つかりません");
    if (!sameStr_(hash_(x.salt, cur), x.hash)) throw new Error("いまのパスワードが違います");
    x.salt = Utilities.getUuid().replace(/-/g, ""); x.hash = hash_(x.salt, nw); accSave_(L);
  }
  hist_("", "パスワードを変更", S.name + "が自分のパスワードを変えました", "", S.name, "ログイン");
  return { ok: true };
}
/* 担当者による提携先の登録（追加だけ。直す・消すは管理者） */
function partnerCheck_(r) {
  var o = {}; PKEY.forEach(function (k) { o[k] = String(r[k] || "").trim().slice(0, k === "note" ? 300 : 120); });
  if (!o.name) throw new Error("提携先の名前を入れてください");
  if (!o.a || !o.b) throw new Error("大分類と中分類を選んでください");
  if (o.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email)) throw new Error("メールアドレスの形が正しくありません");
  if (partners_().some(function (p) { return p.name.replace(/\s/g, "") === o.name.replace(/\s/g, ""); })) throw new Error("「" + o.name + "」はもう登録されています");
  return o;
}
function partnerAdd_(r, by) {
  var o = partnerCheck_(r); o.by = by; o.state = "登録済み"; o.since = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
  partnerSheet_().appendRow(PKEY.map(function (k) { return o[k] || ""; }));
  hist_("", "提携先の登録・変更", "登録：" + o.name + "（" + o.a + " ＞ " + o.b + "）", "", by, "設定");
  return { ok: true, partners: partners_().filter(function (p) { return p.by === by; }) };
}
/* 提携先登録フォームを相手に送る（相手が自分で記入。届いた登録は「確認待ち」になり、管理者が確かめてから使う） */
function pinvUrl_() { return String(P("SIGN_URL") || "https://119cm.net/keiyaku/index.html").replace(/index\.html.*$/, "") + "partner.html"; }
function pinvite_(d, S) {
  var em = String(d.email || "").trim().slice(0, 120), nm = String(d.name || "").trim().slice(0, 100), msg = String(d.message || "").trim().slice(0, 500);
  if (!nm) throw new Error("相手の会社名・お名前を入れてください");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) throw new Error("相手のメールアドレスを正しく入れてください");
  var pr = PropertiesService.getScriptProperties(), all = pr.getProperties(), now = Date.now();
  Object.keys(all).forEach(function (k) { if (k.indexOf("PINV_") === 0) { var v = parse_(all[k], {}); if (!v.exp || v.exp < now) pr.deleteProperty(k); } });
  var tok = newToken_(); pr.setProperty("PINV_" + tok, JSON.stringify({ by: S.name, email: em, name: nm, exp: now + 14 * 864e5, sent: new Date().toISOString() }));
  var url = pinvUrl_() + "?t=" + tok;
  var html = "<div style='font-family:sans-serif;font-size:16px;line-height:1.8;color:#14211F'><p>" + esc_(nm) + " 様</p><p>" + esc_(ISSUER.service) + "の" + esc_(S.name) + "です。<br>提携先としてのご登録をお願いしたく、ご連絡いたしました。下のボタンから、貴社の情報（分野・連絡先・対応できる地域など）をご記入ください。</p>" + (msg ? "<p>" + esc_(msg).replace(/\n/g, "<br>") + "</p>" : "") + "<p><a href='" + url + "' style='display:inline-block;background:#0E5A63;color:#fff;padding:14px 26px;border-radius:10px;text-decoration:none;font-weight:bold'>提携先の登録フォームを開く</a></p><p style='font-size:14px;color:#555'>このリンクは14日間有効です。お心当たりがない場合は、このメールを破棄してください。</p><p>" + esc_(ISSUER.service) + "（運営 " + esc_(ISSUER.name) + "）<br>" + esc_(ISSUER.tel) + "（受付 " + esc_(ISSUER.hours) + "）</p></div>";
  MailApp.sendEmail({ to: em, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】提携先のご登録のお願い", htmlBody: html, body: nm + " 様\n\n提携先の登録フォーム：" + url + "\n（14日間有効）" });
  hist_("", "提携先登録フォームを送った", nm + "（" + em + "）", "", S.name, "設定");
  return { ok: true };
}
function pinvGet_(d) {
  var v = parse_(P("PINV_" + String(d.t || "").replace(/[^0-9a-f]/gi, "")), null);
  if (!v || v.exp < Date.now()) throw new Error("このリンクは使えません（期限切れ、または登録が済んでいます）。お手数ですが、担当者にご連絡ください。");
  return { ok: true, name: v.name, email: v.email };
}
function pinvSubmit_(d) {
  var key = "PINV_" + String(d.t || "").replace(/[^0-9a-f]/gi, ""), v = parse_(P(key), null);
  if (!v || v.exp < Date.now()) throw new Error("このリンクは使えません（期限切れ、または登録が済んでいます）。");
  var o = partnerCheck_(d.row || {}); o.by = v.by; o.state = "確認待ち"; o.since = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd");
  o.note = ("相手が記入（" + v.email + " に送ったフォーム）" + (o.note ? "／" + o.note : "")).slice(0, 300);
  partnerSheet_().appendRow(PKEY.map(function (k) { return o[k] || ""; }));
  PropertiesService.getScriptProperties().deleteProperty(key);
  hist_("", "提携先登録フォームが届いた", o.name + "（" + o.a + " ＞ " + o.b + "）\n送った担当：" + v.by, "", "相手", "設定");
  MailApp.sendEmail({ to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］提携先の登録が届きました：" + o.name, body: o.name + "\n分類：" + o.a + " ＞ " + o.b + (o.c ? " ＞ " + o.c : "") + "\nご担当：" + o.person + "\nメール：" + o.email + "\n電話：" + o.tel + "\n地域：" + o.area + "\n\n送った担当：" + v.by + "\n\n管理画面の「設定」で内容を確かめ、「確認して使えるようにする」を押してください。\n管理画面：https://119cm.net/keiyaku/admin.html" });
  return { ok: true };
}
/* 案件の内容とお客様の情報を、提携先へメールで送る（担当者が内容を確かめ、お客様の同意を確認したときだけ） */
function forward_(d) {
  var c = findCase_(d.no), sh = inboxSheet_();
  if (d.consent !== true) throw new Error("お客様の同意を確認してください");
  if (segOf_(c.label).route === "self") throw new Error("この種別は提携先へ送りません");
  var p = livePartners_().filter(function (x) { return x.name === String(d.partner || ""); })[0];
  if (!p) throw new Error("提携先一覧に登録されている提携先を選んでください");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) throw new Error("「" + p.name + "」のメールアドレスが登録されていません（設定の提携先一覧で登録できます）");
  var subj = String(d.subject || "").slice(0, 200), body = String(d.body || "").slice(0, 8000);
  if (!subj || !body) throw new Error("件名と本文を入れてください");
  MailApp.sendEmail({ to: p.email, bcc: P("NOTIFY_TO"), name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: subj, body: body });
  var now = new Date(), ch = ["提携先へ送付：" + p.name];
  if (c.partner !== p.name) { sh.getRange(c.row, 12).setValue(p.name); ch.push("振分け先：" + p.name); }
  if (d.status && d.status !== c.status && ALL_STEPS.indexOf(d.status) >= 0) { sh.getRange(c.row, 9).setValue(d.status); ch.push("状態：" + c.status + " → " + d.status); }
  var log = parse_(c.fwd, []); if (!Array.isArray(log)) log = []; log.push({ ts: now.toISOString(), name: p.name, staff: d.staff || c.staff || "" });
  sh.getRange(c.row, 18).setValue(JSON.stringify(log.slice(-20))); sh.getRange(c.row, 14).setValue(now);
  hist_(c.no, "提携先へ送付（" + p.name + "）", ch.join("／") + "\n\n" + subj + "\n\n" + body, d.staff || c.staff);
  return { ok: true, fwd: JSON.stringify(log.slice(-20)) };
}
/* 1時間ごとに、遅れている案件を担当者へメールで知らせる（同じ案件は1日1回まで）。setupAlerts() を1回実行すると動き出す */
function alertCheck() {
  var now = Date.now(), H = 36e5, list = [], pr = PropertiesService.getScriptProperties(), today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMdd");
  caseRows_().forEach(function (c) {
    if (isDone_(c)) return;
    var why = [];
    if (c.status === "新規受付" && now - new Date(c.ts) > 24 * H) why.push("未対応のまま" + Math.floor((now - new Date(c.ts)) / H) + "時間");
    var idle = (now - new Date(c.updated)) / (24 * H);
    if (idle >= 3) why.push("進捗の記録なし " + Math.floor(idle) + "日");
    if (c.next && new Date(c.next + "T23:59:59+09:00") < new Date()) why.push("対応予定日（" + c.next + "）を過ぎています");
    if (!why.length) return;
    var key = "al_" + c.no + "_" + today; if (pr.getProperty(key)) return; pr.setProperty(key, "1");
    list.push("・" + c.no + "　" + (c.company ? c.company + " " : "") + c.name + "（" + c.status + "）\n　" + why.join("／"));
  });
  if (list.length) MailApp.sendEmail({ to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］対応が遅れている受付が " + list.length + " 件あります", body: list.join("\n\n") + "\n\n管理画面：https://119cm.net/keiyaku/admin.html" });
}
function setupAlerts() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "alertCheck") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("alertCheck").timeBased().everyHours(1).create();
  Logger.log("1時間ごとの確認を設定しました");
  setupBilling();
}

/* ---- 台帳 ---- */
function sheet_() {
  var sh = SpreadsheetApp.openById(P("SHEET_ID")).getSheetByName(SHEET);
  if (sh.getLastColumn() < COLS.length) sh.getRange(1, 1, 1, COLS.length).setValues([COLS]);
  return sh;
}
function rows_() {
  var sh = sheet_(), v = sh.getDataRange().getValues(), out = [];
  for (var i = 1; i < v.length; i++) { var o = { _row: i + 1 }; COLS.forEach(function (c, j) { o[c] = v[i][j]; }); out.push(o); }
  return out;
}
function find_(key, val) { var r = rows_(); for (var i = 0; i < r.length; i++) if (String(r[i][key]) === String(val)) return r[i]; return null; }
function save_(o) {
  var sh = sheet_(), line = COLS.map(function (c) { var v = o[c]; return v == null ? "" : (typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v); });
  if (o._row) sh.getRange(o._row, 1, 1, COLS.length).setValues([line]); else { sh.appendRow(line); }
}
function log_(o, msg) { o.log = (o.log ? o.log + "\n" : "") + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy-MM-dd HH:mm:ss") + "　" + msg; }
function parse_(s, d) { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } }
function newToken_() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ""); }
function newId_() {
  var d = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyMMdd"), n = rows_().filter(function (r) { return String(r.id).indexOf("IKK-" + d) === 0; }).length + 1;
  return "IKK-" + d + "-" + ("00" + n).slice(-3);
}
function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

/* ---- 入口：お客様の画面から ---- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse(e.postData.contents || "{}"), a = String(d.action || "");
    if (d.kind === "inbox") { lock.waitLock(20000); return json(inbox_(d)); }
    if (a.indexOf("admin.") === 0) return json(adminPost_(a, d));
    if (a.indexOf("client.") !== 0) return json({ ok: false, error: "この操作はできません" });
    lock.waitLock(20000);
    if (a === "client.apply") return json(apply_(d));
    if (a === "client.pinv") return json(pinvGet_(d));
    if (a === "client.pinvSubmit") return json(pinvSubmit_(d));
    return json(client_(a, d));
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  } finally { try { lock.releaseLock(); } catch (x) { } }
}
function doGet(e) {
  if (e && e.parameter && e.parameter.admin) {
    if (!isAdmin_()) return HtmlService.createHtmlOutput("<p style='font:16px sans-serif;padding:24px'>この画面は、登録された担当者の Google アカウントでのみ開けます。</p>");
    return HtmlService.createHtmlOutputFromFile("admin").setTitle("電子契約の管理｜医療介護総合支援会").addMetaTag("viewport", "width=device-width,initial-scale=1");
  }
  return ContentService.createTextOutput("ok");
}
function isAdmin_() {
  var me = String(Session.getActiveUser().getEmail() || "").toLowerCase();
  if (!me) return false;
  return P("ADMIN_EMAILS").toLowerCase().split(/[\s,]+/).indexOf(me) >= 0;
}

/* ---- お客様側の操作 ---- */
function client_(a, d) {
  var o = find_("token", d.token);
  if (!o || !d.token) throw new Error("契約書が見つかりません。メールのボタンから開き直してください。");
  if (o.status === "取り消し") throw new Error("この契約書は取り消されました。");
  var signed = o.status === "締結済み";
  if (!signed && o.expires && new Date(o.expires) < new Date()) throw new Error("リンクの有効期限が切れました。担当者から送り直します。");
  var cache = CacheService.getScriptCache();
  if (a === "client.otp") { otp_(o); save_(o); return { ok: true }; }
  if (a === "client.verify") {
    var tries = +(cache.get("otpt_" + o.token) || 0);
    if (tries >= 8) throw new Error("間違いが続いたため、しばらく入力できません。認証コードを送り直してください。");
    if (!d.code || cache.get("otp_" + o.token) !== String(d.code).replace(/\D/g, "")) { cache.put("otpt_" + o.token, String(tries + 1), 1800); throw new Error("認証コードが違います。メールの6けたの数字を入れてください。"); }
    cache.remove("otp_" + o.token); cache.remove("otpt_" + o.token);
    var sess = newToken_(); cache.put("sess_" + sess, o.token, 7200);
    log_(o, "メール認証"); save_(o);
    return { ok: true, sess: sess };
  }
  var authed = d.sess && cache.get("sess_" + d.sess) === o.token;
  if (a === "client.get") {
    var t = tplOf(o.template);
    if (!authed) return { ok: true, needOtp: true, contract: { id: o.id, title: o.title, party_name: o.party_name, party_company: o.party_company, email: maskMail_(o.party_email), issuer: ISSUER } };
    if (!o.viewed) { o.viewed = new Date(); log_(o, "内容を表示"); save_(o); }
    var fields = parse_(o.fields, []), req = parse_(o.required, []), pre = parse_(o.prefill, {});
    return { ok: true, contract: { id: o.id, title: o.title, status: o.status, draft: o.draft === "yes", feedback: parse_(o.feedback, null), party_name: o.party_name, party_company: o.party_company, body: o.body, fields: fields.map(function (k) { return { key: k, label: fieldLabel(t, k), type: FIELDS[k].type, ac: FIELDS[k].ac || "", required: req.indexOf(k) >= 0, value: pre[k] || "" }; }), requireId: o.require_id === "yes" || o.require_id === true, adult: !!(t && t.adult), seal: t ? t.seal : "round", issuer: ISSUER, signed: signed } };
  }
  if (!authed) throw new Error("確認の時間が過ぎました。画面を開き直して、認証コードを入れてください。");
  if (a === "client.sign") return sign_(o, d);
  if (a === "client.feedback") return feedback_(o, d);
  if (a === "client.pdf") {
    if (!signed || !o.pdf_id) throw new Error("契約書はまだできていません。");
    var f = DriveApp.getFileById(o.pdf_id);
    return { ok: true, pdf: Utilities.base64Encode(f.getBlob().getBytes()), filename: f.getName() };
  }
  throw new Error("不明な操作です");
}
function otp_(o) {
  var cache = CacheService.getScriptCache(), cnt = +(cache.get("otpn_" + o.token) || 0);
  if (cnt >= 5) throw new Error("認証コードを送る回数が多すぎます。1時間ほどおいてお試しください。");
  var code = ("00000" + Math.floor(Math.random() * 1000000)).slice(-6);
  cache.put("otp_" + o.token, code, 900); cache.put("otpn_" + o.token, String(cnt + 1), 3600);
  MailApp.sendEmail({ to: o.party_email, name: ISSUER.service, subject: "【" + ISSUER.service + "】認証コード " + code, body: o.party_name + " 様\n\n電子契約の認証コードは " + code + " です（15分間有効）。\n開いている画面に入力してください。\n\nお心当たりがない場合は、このメールを破棄してください。\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）" });
  log_(o, "認証コードを送信");
}
/* サイトの「会員登録の申込み」から、その場で契約書を作る（協賛会員は審査があるため対象外） */
function apply_(d) {
  var type = String(d.type || ""), email = String(d.email || "").trim(), cache = CacheService.getScriptCache();
  if (["jigyosho", "hojin", "kojin"].indexOf(type) < 0) throw new Error("会員の種類が正しくありません");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !d.name) throw new Error("お名前とメールアドレスを入れてください");
  var ke = "apl_" + email.toLowerCase(), n1 = +(cache.get(ke) || 0), n2 = +(cache.get("apl_all") || 0);
  if (n1 >= 3 || n2 >= 60) throw new Error("申込みが続いたため、しばらくお待ちください");
  cache.put(ke, String(n1 + 1), 3600); cache.put("apl_all", String(n2 + 1), 3600);
  var cut = function (x, m) { return String(x || "").trim().slice(0, m || 120); };
  var kj = type === "kojin", t = tplOf(kj ? "kojin" : "kaiin");
  var cond = kj ? "" : normCond({ type: type, pay: d.pay, sites: d.sites, staff: d.staff, referrer: cut(d.referrer, 60), founder: true });
  var o = { id: newId_(), token: newToken_(), template: t.key, title: kj ? t.title : memberTitle(type), party_name: cut(d.name, 40), party_company: kj ? "" : cut(d.org, 80), party_email: email, fields: t.fields.slice(), required: t.required, require_id: t.requireId ? "yes" : "", cond: cond, note: "",
    prefill: kj ? { name: cut(d.name, 40), address: cut(d.address), phone: cut(d.phone, 20) } : { company: cut(d.org, 80), address: cut(d.address), rep: cut(d.rep, 40), name: cut(d.name, 40), phone: cut(d.phone, 20) },
    status: "送付済み", created: new Date(), expires: new Date(Date.now() + VALID_DAYS * 864e5), draft: "", case_no: cut(d.no, 40) };
  o.body = buildBody(t.key, cond, "", kj ? o.party_name : o.party_company);
  log_(o, "サイトの申込みから作成（受付番号 " + cut(d.no, 30) + "）");
  otp_(o); save_(o);
  MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［電子契約］サイトから申込み：" + o.id + "　" + (o.party_company ? o.party_company + " " : "") + o.party_name, body: o.title + "\n" + o.id + "（受付番号 " + cut(d.no, 30) + "）\n" + (o.party_company ? o.party_company + "　" : "") + o.party_name + "（" + email + "）\n" + (cond ? condText(cond) + "\n" : "") + "連絡事項：" + cut(d.note, 500) + "\n\n申込者はそのまま電子契約の画面に進んでいます。締結するとまた通知します。" });
  return { ok: true, token: o.token };
}
function maskMail_(m) { m = String(m); var p = m.split("@"); return p[0].slice(0, 2) + "***@" + (p[1] || ""); }

function sign_(o, d) {
  if (o.status === "締結済み") throw new Error("この契約はすでに結ばれています。");
  if (o.draft === "yes") throw new Error("この書面は下書き（確認用）のため、締結できません。");
  if (!d.agree) throw new Error("内容に同意する欄に印を付けてください。");
  var fields = parse_(o.fields, []), req = parse_(o.required, []), v = {}, t = tplOf(o.template);
  fields.forEach(function (k) { v[k] = String((d.values || {})[k] || "").trim().slice(0, 300); });
  req.forEach(function (k) { if (!v[k]) throw new Error(fieldLabel(t, k) + "を記入してください。"); });
  if (t && t.adult && v.birth) { var b = new Date(v.birth), lim = new Date(); lim.setFullYear(lim.getFullYear() - 18); if (!(b <= lim)) throw new Error("18歳未満の方は登録できません。"); }
  if (!/^data:image\/png;base64,/.test(d.sealPng || "")) throw new Error("押印してください。");
  var folder = DriveApp.getFolderById(P("FOLDER_ID"));
  var seal = folder.createFile(Utilities.newBlob(Utilities.base64Decode(d.sealPng.split(",")[1]), "image/png", o.id + "_印影.png"));
  o.seal_file = seal.getId();
  if (o.require_id === "yes" || o.require_id === true) {
    if (!/^data:image\/jpeg;base64,/.test(d.idImage || "")) throw new Error("本人確認書類の写真を添付してください。");
    var idf = folder.createFile(Utilities.newBlob(Utilities.base64Decode(d.idImage.split(",")[1]), "image/jpeg", o.id + "_本人確認書類.jpg"));
    o.id_file = idf.getId();
  }
  o.values = v; o.signed = new Date(); o.status = "締結済み"; o.ua = String(d.ua || "").slice(0, 300);
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, o.id + "\n" + o.body + "\n" + JSON.stringify(v) + "\n" + d.sealPng + "\n" + o.signed.toISOString(), Utilities.Charset.UTF_8);
  o.hash = digest.map(function (b) { return ("0" + ((b + 256) % 256).toString(16)).slice(-2); }).join("");
  log_(o, "承認（締結）"); hist_(o.id, "相手が承認した（締結）", o.title + "\n" + (o.party_company ? o.party_company + " " : "") + o.party_name, "", "相手", "電子契約");
  var pdf = makePdf_(o, d.sealPng);
  var pf = folder.createFile(pdf); o.pdf_id = pf.getId();
  save_(o);
  var mail = { name: ISSUER.service, replyTo: P("NOTIFY_TO"), attachments: [pdf] };
  MailApp.sendEmail(Object.assign({ to: o.party_email, subject: "【" + ISSUER.service + "】" + o.title + "（締結済み）", body: o.party_name + " 様\n\nお手続きありがとうございました。押印済みの契約書（PDF）をお送りします。大切に保管してください。\n契約番号：" + o.id + "\n\n" + (o.template === "kaiin" ? "お振込先と金額は、担当者から別のメールでご案内します。\n\n" : "") + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）" }, mail));
  MailApp.sendEmail(Object.assign({ to: P("NOTIFY_TO"), subject: "［電子契約］締結：" + o.id + "　" + (o.party_company ? o.party_company + " " : "") + o.party_name, body: o.title + "\n" + o.id + "\n" + (o.party_company ? o.party_company + "　" : "") + o.party_name + "（" + o.party_email + "）\n\n台帳：https://docs.google.com/spreadsheets/d/" + P("SHEET_ID") }, mail));
  if (o.template === "kaiin") {
    var c0 = typeof o.cond === "string" ? parse_(o.cond, null) : o.cond;
    if (c0) { var nf = nextFirst(new Date()), ns = nf.getFullYear() + "-" + ("0" + (nf.getMonth() + 1)).slice(-2); if (!c0.start || c0.start.slice(0, 7) < ns) c0.start = ns; o.cond = normCond(c0); save_(o); }
    payMail_(o);
  }
  if (o.template === "kojin") refMail_(o);
  return { ok: true, pdf: Utilities.base64Encode(pdf.getBytes()), filename: pdf.getName() };
}

/* ---- 個人会員の紹介コード（締結したら自動で作って送る） ---- */
function refMail_(o) {
  if (o.refcode) return;
  var used = {}; rows_().forEach(function (r) { if (r.refcode) used[r.refcode] = 1; });
  var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", code = "";
  do { code = "SK-"; for (var i = 0; i < 5; i++) code += A.charAt(Math.floor(Math.random() * A.length)); } while (used[code]);
  o.refcode = code; save_(o);
  MailApp.sendEmail({ to: o.party_email, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】紹介コードのお知らせ", body: o.party_name + " 様\n\n個人会員（営業協力者）の登録が完了しました。あなたの紹介コードは次のとおりです。\n\n紹介コード：" + code + "\n\n事業所・法人をご紹介いただくときは、会員登録の申込み画面の「紹介者」欄に、このコードを書いてもらってください。\n会員登録の申込み：https://119cm.net/member/apply.html\n\n紹介料の仕組みと決まりごと：https://119cm.net/member/index.html#shokai\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + P("NOTIFY_TO") });
  MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［電子契約］紹介コードを発行：" + code + "　" + o.party_name, body: o.id + "\n" + o.party_name + "（" + o.party_email + "）に紹介コード " + code + " を発行し、メールで送りました。" });
}

/* ---- 会費の振込のご案内（締結したら自動で送る）。振込先はスクリプト プロパティ BANK_INFO に書く ---- */
function payMail_(o) {
  var c = typeof o.cond === "string" ? parse_(o.cond, null) : o.cond;
  if (!c || !c.first) return;
  c.dueText = Utilities.formatDate(new Date(Date.now() + 7 * 864e5), "Asia/Tokyo", "yyyy年M月d日");
  var bank = P("BANK_INFO"), who = (o.party_company ? o.party_company + "　" : "") + o.party_name + " 様";
  var kana = String(o.id).replace(/[^0-9]/g, "");
  if (!bank) {
    MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［電子契約］振込先が未設定です：" + o.id, body: "BANK_INFO（振込先）が設定されていないため、" + who + "への振込のご案内を自動で送れませんでした。手でご案内してください。\n\nお振込み額：" + yen(c.first) + "（" + c.dueText + "まで）" });
    return;
  }
  var body = who + "\n\n" + ISSUER.service + "へのご入会のお手続き、ありがとうございました。\n初回の会費のお振込みについてご案内します。\n\n" +
    "■お振込み額（税込）：" + yen(c.first) + (c.pay === "year" ? "（年間払い：" + c.startText.replace(/\d+日$/, "") + "からの12か月分）" : "（月払い：" + c.startText.replace(/\d+日$/, "") + "分）") + "\n" +
    "■お振込みの期限：" + c.dueText + "\n" +
    "■お振込先：\n" + bank + "\n" +
    "■お振込みの名義：ご依頼人名の前に、番号「" + kana + "」を入れてください（例：" + kana + " " + (o.party_company || o.party_name) + "）\n" +
    "■振込手数料：恐れ入りますが、ご負担をお願いします。\n\n" +
    "入会した月の会費は無料です。\n" +
    (c.pay === "month" ? "以後は、毎月1日に翌月分（" + yen(c.monthly) + "）の請求書をメールでお送りします。お支払期限は毎月10日です。\n" : "以後は、更新の前の月の1日に、次の12か月分の請求書をメールでお送りします（お支払期限はその月の10日）。\n") +
    "入金を確認しましたら、会員登録完了のお知らせをお送りします。\n\n契約番号：" + o.id + "\n\n" + invoiceText_(o, c, who) + "\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）\n" + P("NOTIFY_TO");
  MailApp.sendEmail({ to: o.party_email, bcc: P("NOTIFY_TO"), name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】会費のお振込みのご案内（" + yen(c.first) + "・" + c.dueText + "まで）", body: body });
  o.billed = JSON.stringify([c.start.slice(0, 7)]);
  log_(o, "振込のご案内（請求書 " + c.start.slice(0, 7) + "分・期限 " + c.dueText + "）を送信"); save_(o);
}
/* 適格請求書（メール本文に載せる） */
function invoiceText_(o, c, who) {
  var amt = Number(c.first) || 0, tax = Math.floor(amt * 10 / 110), d = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy年M月d日");
  var kind = (MEMBER_LABEL[c.type] || "会員") + "　会費" + (c.pay === "year" ? "（年間払い：" + c.startText.replace(/\d+日$/, "") + "からの12か月分）" : "（月払い：" + c.startText.replace(/\d+日$/, "") + "分）");
  return "━━━━━━ ご請求書（適格請求書） ━━━━━━\n" +
    "宛名：" + who + "\n" +
    "発行日：" + d + "\n" +
    "請求番号：" + o.id + "-" + String(c.start || "").slice(0, 7).replace("-", "") + "\n" +
    "内容：" + ISSUER.service + "　" + kind + "\n" +
    "ご請求額（税込）：" + yen(amt) + "\n" +
    "　10％対象：" + yen(amt) + "（うち消費税 " + yen(tax) + "）\n" +
    "お支払期限：" + c.dueText + "\n" +
    "発行者：" + ISSUER.name + "（" + ISSUER.service + "）\n" +
    "　" + ISSUER.addr + "\n" +
    "登録番号：" + ISSUER.invoice + "\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "このメールが請求書を兼ねます。保存しておいてください。";
}
/* ---- 毎月1日：翌月分の請求書を自動で送る（期限はその月の10日） ---- */
function monthlyBilling() {
  var now = new Date(), nf = nextFirst(now), T = nf.getFullYear() + "-" + ("0" + (nf.getMonth() + 1)).slice(-2);
  var due = Utilities.formatDate(new Date(now.getFullYear(), now.getMonth(), 10), "Asia/Tokyo", "yyyy年M月d日");
  var sent = [], bank = P("BANK_INFO") || "（振込先は、入会時のご案内をご覧ください）";
  rows_().forEach(function (o) {
    if (o.template !== "kaiin" || o.status !== "締結済み" || o.stopped || o.draft === "yes") return;
    var c = parse_(o.cond, null); if (!c || !c.start) return;
    var billed = parse_(o.billed, []), S = String(c.start).slice(0, 7);
    if (T < S || billed.indexOf(T) >= 0) return;
    var diff = (+T.slice(0, 4) - +S.slice(0, 4)) * 12 + (+T.slice(5, 7) - +S.slice(5, 7));
    if (c.pay === "year" && diff % 12 !== 0) return;
    var amt = c.pay === "year" ? c.monthly * 10 : c.monthly, who = (o.party_company ? o.party_company + "　" : "") + o.party_name + " 様";
    var ymT = +T.slice(0, 4) + "年" + (+T.slice(5, 7)) + "月";
    var term = c.pay === "year" ? ymT + "からの12か月分" : ymT + "分";
    var inv = invoiceText_(o, { type: c.type, pay: c.pay, first: amt, start: T, startText: ymT + "1日", dueText: due }, who);
    var body = who + "\n\nいつも" + ISSUER.service + "をご利用いただき、ありがとうございます。\n" + term + "の会費のご請求をお送りします。\n\n" +
      "■お振込み額（税込）：" + yen(amt) + "（" + term + "）\n■お振込みの期限：" + due + "\n■お振込先：\n" + bank + "\n■お振込みの名義：ご依頼人名の前に、番号「" + String(o.id).replace(/[^0-9]/g, "") + "」を入れてください\n■振込手数料：恐れ入りますが、ご負担をお願いします。\n\n" +
      inv + "\n\n行き違いでお振込み済みの場合は、ご容赦ください。\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）\n" + P("NOTIFY_TO");
    try {
      MailApp.sendEmail({ to: o.party_email, bcc: P("NOTIFY_TO"), name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】" + term + " 会費のご請求（" + yen(amt) + "・" + due + "まで）", body: body });
      billed.push(T); o.billed = JSON.stringify(billed); log_(o, "請求書（" + T + "分・期限 " + due + "）を送信"); save_(o);
      hist_(o.id, "請求書を自動で送った", term + "　" + yen(amt) + "（期限 " + due + "）\n" + who, "", "自動", "電子契約");
      sent.push(o.id + "　" + who + "　" + yen(amt) + "（" + term + "）");
    } catch (e) { sent.push("【送れませんでした】" + o.id + "　" + who + "　" + e.message); }
  });
  if (sent.length) MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［" + ISSUER.service + "］" + T + "分の請求書を " + sent.length + " 件送りました", body: sent.join("\n") + "\n\nお支払期限：" + due + "\n入金は通帳などでご確認ください。" });
  return sent.length;
}
function setupBilling() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "monthlyBilling") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("monthlyBilling").timeBased().onMonthDay(1).atHour(9).inTimezone("Asia/Tokyo").create();
  Logger.log("毎月1日 9時ごろに、翌月分の請求書を自動で送る設定をしました");
}

/* 入金を確認したら、会員登録完了のお知らせを送る */
function paid_(o) {
  if (o.status !== "締結済み") throw new Error("締結済みの契約ではありません");
  if (o.paid) throw new Error("すでに入金確認済みです");
  var c = typeof o.cond === "string" ? parse_(o.cond, null) : o.cond;
  o.paid = new Date(); log_(o, "入金確認・登録完了のお知らせを送信"); save_(o);
  MailApp.sendEmail({ to: o.party_email, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】会員登録が完了しました", body: (o.party_company ? o.party_company + "　" : "") + o.party_name + " 様\n\nお振込みを確認しました。ありがとうございます。\n" + ISSUER.service + "の会員登録が完了しました。\n\n" + (c ? "会員区分：" + MEMBER_LABEL[c.type] + "\n会費の発生日：" + c.startText + "\n契約期間：" + c.startText + "〜" + c.endText + "\n" : "") + "契約番号：" + o.id + "\n\nご相談は、このメールへの返信、またはサイトの相談フォームからお寄せください。\nhttps://119cm.net/contact/index.html\n\n" + ISSUER.service + "（運営 " + ISSUER.name + "）\n" + ISSUER.tel + "（受付 " + ISSUER.hours + "）" });
  return { ok: true };
}

function makePdf_(o, sealPng) {
  var v = typeof o.values === "string" ? parse_(o.values, {}) : o.values || {};
  var body = esc_(o.body).replace(/\[\[(\w+)\]\]/g, function (_, k) { return "<b>" + esc_(v[k] || "") + "</b>"; });
  var co = P("COMPANY_SEAL") ? "<img src='data:image/png;base64," + Utilities.base64Encode(DriveApp.getFileById(P("COMPANY_SEAL")).getBlob().getBytes()) + "' style='width:80px;height:80px'>" : "";
  var rows = parse_(o.fields, []).map(function (k) { return "<tr><th>" + esc_(fieldLabel(tplOf(o.template), k)) + "</th><td>" + esc_(v[k] || "") + "</td></tr>"; }).join("");
  var tz = function (x) { return x ? Utilities.formatDate(new Date(x), "Asia/Tokyo", "yyyy年M月d日 HH:mm") : ""; };
  var html = "<html><head><meta charset='utf-8'><style>body{font-family:'Noto Serif JP','Noto Sans JP',serif;font-size:10.5pt;line-height:1.8;color:#111}h1{font-size:15pt;text-align:center;letter-spacing:.2em;margin:0 0 4px}.no{text-align:right;font-size:9pt}.doc{white-space:pre-wrap}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #888;padding:4px 8px;text-align:left;font-size:9.5pt;vertical-align:top}th{background:#eef4f4;width:32%}.sig{display:flex;gap:40px;margin-top:14px}.box{flex:1}.aud{font-size:8pt;color:#333;word-break:break-all}</style></head><body>" +
    "<p class='no'>契約番号 " + esc_(o.id) + "</p><h1>" + esc_(o.title) + "</h1><div class='doc'>" + body + "</div>" +
    "<h2 style='font-size:11pt;margin-top:18px'>記入内容</h2><table>" + rows + "</table>" +
    "<table><tr><th>甲（当社）</th><td>" + esc_(ISSUER.addr) + "<br>" + esc_(ISSUER.name) + "　" + esc_(ISSUER.rep) + "　" + co + "</td></tr>" +
    "<tr><th>" + (o.template === "kaiin" || o.template === "kojin" ? "申込者" : "乙") + "</th><td>" + esc_(v.address || "") + "<br>" + esc_(v.company || o.party_company || "") + "　" + esc_(v.rep || v.name || o.party_name) + "　<img src='" + sealPng + "' style='width:70px;height:70px;vertical-align:middle'></td></tr></table>" +
    "<h2 style='font-size:11pt;margin-top:14px'>電子契約の記録</h2><table class='aud'><tr><th>締結日時</th><td>" + tz(o.signed) + "</td></tr><tr><th>署名者のメール（認証済み）</th><td>" + esc_(o.party_email) + "</td></tr><tr><th>送付・表示</th><td>送付 " + tz(o.created) + "／表示 " + tz(o.viewed) + "</td></tr><tr><th>改ざん検知用の値（SHA-256）</th><td>" + esc_(o.hash) + "</td></tr><tr><th>利用環境</th><td>" + esc_(o.ua) + "</td></tr></table>" +
    "<p style='font-size:8.5pt'>この契約書は、電子契約で締結されたものです。署名者はメールに届いた認証コードで本人確認をしたうえで、内容を確認し、押印・承認しました。原本はこの電子データです。</p></body></html>";
  return Utilities.newBlob(html, "text/html", "x.html").getAs("application/pdf").setName(o.id + "_" + o.title.replace(/[（）\s]/g, "") + ".pdf");
}

/* ---- 管理画面から（google.script.run で呼ぶ） ---- */
/* ---- IDとパスワードでのログイン（サイトの「担当者ログイン」から） ----
   スクリプト プロパティに ADMIN_ID と ADMIN_PASS を入れておくと、最初のログインで
   パスワードを暗号化（ハッシュ化）して保存し、ADMIN_PASS は自動で消します。 */
function hash_(salt, pass) {
  var h = salt + "|" + pass;
  for (var i = 0; i < 2000; i++) {
    h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + "|" + salt, Utilities.Charset.UTF_8).map(function (b) { return ("0" + ((b + 256) % 256).toString(16)).slice(-2); }).join("");
  }
  return h;
}
function sameStr_(a, b) { a = String(a); b = String(b); var r = a.length ^ b.length; for (var i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return r === 0; }
function login_(d) {
  var pr = PropertiesService.getScriptProperties(), cache = CacheService.getScriptCache();
  var id = String(d.id || "").trim(), pass = String(d.pass || "");
  if (!P("ADMIN_ID") || (!P("ADMIN_PASS") && !P("ADMIN_PASS_HASH"))) throw new Error("IDとパスワードがまだ設定されていません");
  var kf = "lf_" + id.toLowerCase(), nf = +(cache.get(kf) || 0), ng = +(cache.get("lf_all") || 0);
  if (nf >= 5 || ng >= 30) throw new Error("間違いが続いたため、しばらくログインできません（15分ほどお待ちください）");
  if (P("ADMIN_PASS")) {
    var salt = Utilities.getUuid().replace(/-/g, "");
    pr.setProperty("ADMIN_PASS_SALT", salt); pr.setProperty("ADMIN_PASS_HASH", hash_(salt, P("ADMIN_PASS"))); pr.deleteProperty("ADMIN_PASS");
  }
  var isA = sameStr_(id.toLowerCase(), P("ADMIN_ID").toLowerCase()) && sameStr_(hash_(P("ADMIN_PASS_SALT"), pass), P("ADMIN_PASS_HASH")), acc = null, L = accs_();
  if (!isA) L.forEach(function (x) { if (!acc && x.active !== false && sameStr_(id.toLowerCase(), String(x.id).toLowerCase()) && sameStr_(hash_(x.salt, pass), x.hash)) acc = x; });
  var ok = isA || !!acc;
  if (!ok) {
    cache.put(kf, String(nf + 1), 900); cache.put("lf_all", String(ng + 1), 3600);
    if (nf + 1 >= 5) MailApp.sendEmail({ to: P("NOTIFY_TO"), subject: "［" + ISSUER.service + "］管理画面のログインの失敗が続いています", body: "ID「" + id.slice(0, 40) + "」でのログインに5回失敗したため、15分間止めました。心当たりがなければ、パスワードを変えてください。" });
    hist_("", "ログインの失敗", "ID「" + id.slice(0, 40) + "」", "", "", "ログイン"); throw new Error("IDまたはパスワードが違います");
  }
  var S = isA ? { role: "admin", name: adminName_(), id: P("ADMIN_ID") } : { role: "staff", name: acc.name, id: acc.id };
  if (acc) { acc.last = new Date().toISOString(); accSave_(L); }
  cache.remove(kf); hist_("", "ログイン", (isA ? "管理者" : "担当者") + "として管理画面にログインしました", "", S.name, "ログイン");
  var tok = newToken_(); cache.put("adm_" + tok, JSON.stringify(S), 21600);
  return { ok: true, adminToken: tok, role: S.role, name: S.name };
}
// パスワードを忘れたとき：登録メール（NOTIFY_TO）だけにIDと確認コードを送る
function forgot_() {
  if (!P("ADMIN_ID")) throw new Error("IDとパスワードがまだ設定されていません");
  var cache = CacheService.getScriptCache(), n = +(cache.get("fg_n") || 0);
  if (n >= 5) throw new Error("確認コードの送信が続いたため、しばらく送れません（1時間ほどお待ちください）");
  cache.put("fg_n", String(n + 1), 3600);
  var code = String(Math.floor(100000 + Math.random() * 900000));
  cache.put("fg_code", code, 1800); cache.remove("fg_bad");
  MailApp.sendEmail({ to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］管理画面のパスワード変更の確認コード", body: "管理画面で「ID・パスワードを忘れたとき」が使われました。\n\nID：" + P("ADMIN_ID") + "\n確認コード：" + code + "（30分有効）\n\n管理画面：https://119cm.net/keiyaku/admin.html\n\n心当たりがない場合は、このメールを無視してください（パスワードは変わりません）。" });
  return { ok: true };
}
function reset_(d) {
  var cache = CacheService.getScriptCache(), code = cache.get("fg_code"), bad = +(cache.get("fg_bad") || 0);
  var c = String(d.code || "").replace(/\D/g, ""), pass = String(d.pass || "");
  if (!code) throw new Error("確認コードの期限が切れました。もう一度送ってください。");
  if (bad >= 5) { cache.remove("fg_code"); throw new Error("間違いが続いたため、コードを無効にしました。もう一度送ってください。"); }
  if (!sameStr_(c, code)) { cache.put("fg_bad", String(bad + 1), 1800); throw new Error("確認コードが違います"); }
  if (pass.length < 8 || pass.length > 100) throw new Error("パスワードは8文字以上にしてください");
  var pr = PropertiesService.getScriptProperties(), salt = Utilities.getUuid().replace(/-/g, "");
  pr.setProperty("ADMIN_PASS_SALT", salt); pr.setProperty("ADMIN_PASS_HASH", hash_(salt, pass)); pr.deleteProperty("ADMIN_PASS");
  cache.remove("fg_code"); cache.remove("fg_bad"); cache.remove("lf_" + P("ADMIN_ID").toLowerCase()); cache.remove("lf_all");
  MailApp.sendEmail({ to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［" + ISSUER.service + "］管理画面のパスワードを変えました", body: "管理画面のパスワードが変更されました（" + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm") + "）。\n心当たりがない場合は、すぐに確認してください。" });
  hist_("", "パスワードを変更", "確認コードで変更しました", "", "", "ログイン");
  return { ok: true, id: P("ADMIN_ID") };
}
function adminPost_(a, d) {
  try {
    if (a === "admin.login") return login_(d);
    if (a === "admin.forgot") return forgot_();
    if (a === "admin.reset") return reset_(d);
    var cache = CacheService.getScriptCache(), t = String(d.adminToken || "");
    if (a === "admin.logout") { if (t) cache.remove("adm_" + t); return { ok: true }; }
    var sv = t && cache.get("adm_" + t);
    if (!sv) return { ok: false, error: "ログインの有効期限が切れました。もう一度ログインしてください。", needLogin: true };
    cache.put("adm_" + t, sv, 21600);
    var S = parse_(sv, null); if (!S || !S.role) S = { role: "admin", name: adminName_(), id: P("ADMIN_ID") };
    if (S.role === "staff") { var ac = accs_().filter(function (x) { return x.id === S.id; })[0]; if (!ac || ac.active === false) { cache.remove("adm_" + t); return { ok: false, error: "このIDは使えなくなりました。管理者に確認してください。", needLogin: true }; } }
    return adminDo_(a, d, S);
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; }
}
function adminCall(a, d) {
  try {
    if (!isAdmin_()) throw new Error("担当者として登録されたアカウントではありません");
    return adminDo_(a, d, { role: "admin", name: adminName_(), id: "google" });
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; }
}
/* 担当者（管理者以外）ができる操作。案件・名簿・ログ・設定の変更は管理者だけ */
var STAFF_OK = ["admin.me", "admin.passwd", "admin.templates", "admin.preview", "admin.issue", "admin.list", "admin.get", "admin.resend", "admin.cancel", "admin.finalize", "admin.pdf", "admin.partnerAdd", "admin.partnersMine", "admin.partnerInvite"];
function adminDo_(a, d, S) {
  try {
    d = d || {}; S = S || { role: "admin", name: adminName_(), id: "" };
    ACTOR_ = S.role === "staff" ? S.name : (String(d.actor || "").trim().slice(0, 30) || S.name);
    if (S.role !== "admin" && STAFF_OK.indexOf(a) < 0) throw new Error("この操作は管理者だけができます");
    if (a === "admin.me") return { ok: true, role: S.role, name: S.name, id: S.id };
    if (a === "admin.passwd") return passwd_(d, S);
    if (a === "admin.accList") return { ok: true, accounts: accView_() };
    if (a === "admin.accSet") return accSet_(d);
    if (a === "admin.partnerAdd") return partnerAdd_(d.row || {}, S.name);
    if (a === "admin.partnersMine") return { ok: true, partners: S.role === "admin" ? partners_() : partners_().filter(function (p) { return p.by === S.name; }) };
    if (a === "admin.partnerInvite") return pinvite_(d, S);
    if (a === "admin.log") return { ok: true, rows: logRows_(d) };
    if (a === "admin.templates") return { ok: true, templates: TEMPLATES, fields: FIELDS };
    if (a === "admin.cases") return cases_();
    if (a === "admin.caseSet") return caseSet_(d);
    if (a === "admin.report") return report_(d);
    if (a === "admin.forward") return forward_(d);
    if (a === "admin.history") return { ok: true, rows: histOf_(d.no) };
    if (a === "admin.routeSet") { hist_("", "予備の振分けを保存", (d.rows || []).filter(function (r) { return r.partners; }).map(function (r) { return r.field + "：" + r.partners; }).join("\n")); return routeSet_(d); }
    if (a === "admin.partnerSet") { var before = partners_(), r1 = partnerSet_(d), bn = before.map(function (x) { return x.name; }), an = r1.partners.map(function (x) { return x.name; }), ch = [];
      an.forEach(function (n) { if (bn.indexOf(n) < 0) ch.push("登録：" + n); });
      bn.forEach(function (n) { if (an.indexOf(n) < 0) ch.push("削除：" + n); });
      r1.partners.forEach(function (x) { var o = before.filter(function (y) { return y.name === x.name; })[0]; if (o && PKEY.some(function (k) { return k !== "since" && String(o[k] || "") !== String(x[k] || ""); })) ch.push("変更：" + x.name); });
      if (ch.length) hist_("", "提携先の登録・変更", ch.join("\n")); return r1; }
    if (a === "admin.staffSet") { var sb = staff_(), r2 = staffSet_(d), ch2 = []; r2.staff.forEach(function (n) { if (sb.indexOf(n) < 0) ch2.push("追加：" + n); }); sb.forEach(function (n) { if (r2.staff.indexOf(n) < 0) ch2.push("削除：" + n); }); if (ch2.length) hist_("", "担当者の登録・変更", ch2.join("\n")); return r2; }
    if (a === "admin.preview") return { ok: true, cond: normCond(d.cond), body: buildBody(d.template, d.cond, d.note, d.party) };
    if (a === "admin.issue") { d._issuer = S.name; var ri = issue_(d), ti = tplOf(d.template), pp = d.party || {}; hist_(ri.id, d.draft ? "契約書の下書きを送った" : "契約書を送った", (ti && ti.base ? memberTitle(ti.mtype) : ti ? ti.title : "") + "\n" + (pp.company ? pp.company + " " : "") + (pp.name || "") + "（" + (pp.email || "") + "）", "", null, "電子契約"); return ri; }
    if (a === "admin.list") return { ok: true, rows: rows_().reverse().filter(function (r) { return S.role === "admin" || String(r.issuer || "") === S.name; }).slice(0, 300).map(function (r) { return { id: r.id, title: r.title, party_name: r.party_name, party_company: r.party_company, party_email: r.party_email, status: r.status, template: r.template, paid: r.paid ? new Date(r.paid).toISOString() : "", created: r.created ? new Date(r.created).toISOString() : "", viewed: r.viewed ? new Date(r.viewed).toISOString() : "", signed: r.signed ? new Date(r.signed).toISOString() : "", draft: r.draft, refcode: r.refcode || "", typeLabel: (function () { var c = parse_(r.cond, null); return c && MEMBER_LABEL[c.type] || ""; })(), pay: (function () { var c = parse_(r.cond, null); return c ? c.pay : ""; })(), phone: (parse_(r.values, {}) || {}).phone || "", billed: parse_(r.billed, []).slice(-1)[0] || "", stopped: r.stopped ? new Date(r.stopped).toISOString() : "", case_no: String(r.case_no || ""), feedback: parse_(r.feedback, null), prev: String(r.prev || ""), issuer: String(r.issuer || "") }; }) };
    var o = find_("id", d.id); if (!o) throw new Error("見つかりません");
    if (S.role !== "admin" && String(o.issuer || "") !== S.name) throw new Error("自分が送った契約書だけを見たり操作したりできます");
    if (a === "admin.get") return getForEdit_(o);
    var who_ = o.title + "\n" + (o.party_company ? o.party_company + " " : "") + o.party_name, LG = { "admin.resend": "契約書を送り直した", "admin.paid": "入金を確認した（登録完了のメールを送信）", "admin.stop": "退会にした（請求を停止）", "admin.cancel": "契約書を取り消した", "admin.pdf": "契約書のPDFを保存した", "admin.finalize": "下書きを本契約として送った（同じ内容）" };
    if (LG[a]) { var res_ = adminOne_(a, d, o); hist_(o.id, LG[a], who_, "", null, "電子契約"); return res_; }
    throw new Error("不明な操作です");
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; }
}
function adminOne_(a, d, o) {
    if (a === "admin.resend") { if (o.status === "締結済み" || o.status === "取り消し") throw new Error("送り直せない状態です"); o.expires = new Date(Date.now() + VALID_DAYS * 864e5); sendInvite_(o); log_(o, "送り直し"); save_(o); return { ok: true }; }
    if (a === "admin.paid") return paid_(o);
    if (a === "admin.finalize") return finalize_(o);
    if (a === "admin.stop") { if (o.stopped) throw new Error("すでに請求を止めています"); o.stopped = new Date(); log_(o, "退会・請求を停止"); save_(o); return { ok: true }; }
    if (a === "admin.cancel") { if (o.status === "締結済み") throw new Error("締結済みの契約は取り消せません"); o.status = "取り消し"; log_(o, "取り消し"); save_(o); return { ok: true }; }
    if (a === "admin.pdf") { if (!o.pdf_id) throw new Error("まだ締結されていません"); var f = DriveApp.getFileById(o.pdf_id); return { ok: true, pdf: Utilities.base64Encode(f.getBlob().getBytes()), filename: f.getName() }; }
    throw new Error("不明な操作です");
}
function issue_(d) {
  var t = tplOf(d.template); if (!t) throw new Error("契約書の種類を選んでください");
  var bt = t.base ? tplOf(t.base) : t; if (t.base) d.cond = Object.assign({}, d.cond || {}, { type: t.mtype });
  var p = d.party || {};
  if (!p.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email || "")) throw new Error("相手のお名前と、正しいメールアドレスを入れてください");
  var fields = orderFields(t, d.fields);
  var cond = t.cond ? normCond(d.cond) : "";
  var o = { id: newId_(), token: newToken_(), template: bt.key, title: t.base ? memberTitle(t.mtype) : t.title, party_name: p.name, party_company: p.company || "", party_email: p.email, fields: fields, required: t.required, require_id: (d.requireId || t.requireId) ? "yes" : "", cond: cond, note: d.note || "", prefill: d.prefill || {}, status: "送付済み", created: new Date(), expires: new Date(Date.now() + VALID_DAYS * 864e5), draft: d.draft ? "yes" : "", case_no: String(d.caseNo || "").slice(0, 40), issuer: String(d._issuer || "").slice(0, 40) };
  o.body = buildBody(t.key, cond, o.note, p.company || p.name);
  if (d.replaces) {
    var old = find_("id", d.replaces); if (!old) throw new Error("差し替える元の契約書が見つかりません");
    if (d._issuer && d._issuer !== adminName_() && String(old.issuer || "") !== d._issuer) throw new Error("自分が送った契約書だけを差し替えられます");
    if (old.status === "締結済み") throw new Error("元の契約書はすでに締結されているため、差し替えられません");
    if (old.status !== "取り消し") { old.status = "取り消し"; log_(old, "差し替えのため取り消し（新しい契約書 " + o.id + "）"); save_(old); }
    o.prev = old.id; if (!o.case_no) o.case_no = String(old.case_no || "");
    hist_(old.id, "内容を直して差し替えた", "新しい契約書 " + o.id, "", null, "電子契約");
  }
  log_(o, "作成・送付" + (o.case_no ? "（案件 " + o.case_no + "）" : "") + (o.prev ? "（" + o.prev + " の差し替え）" : "")); save_(o); sendInvite_(o);
  if (o.case_no) { hist_(o.case_no, d.draft ? "電子契約の下書きを送った" : "電子契約を送った", o.id + "　" + o.title, "", null, "案件"); try { var cc = findCase_(o.case_no); inboxSheet_().getRange(cc.row, 14).setValue(new Date()); } catch (e) { } }
  return { ok: true, id: o.id, url: P("SIGN_URL") + "?t=" + o.token };
}
/* 下書きを見た相手からの返事（この内容でよい／修正をお願いしたい） */
function feedback_(o, d) {
  if (o.draft !== "yes" || o.status === "取り消し" || o.status === "締結済み") throw new Error("この書面には、お返事をいただけません。");
  var res = d.res === "ok" ? "ok" : d.res === "fix" ? "fix" : ""; if (!res) throw new Error("お返事を選んでください");
  var comment = String(d.comment || "").trim().slice(0, 2000); if (res === "fix" && !comment) throw new Error("直してほしいところを書いてください");
  o.feedback = JSON.stringify({ res: res, comment: comment, ts: new Date().toISOString() });
  var kind = res === "ok" ? "下書きの確認：この内容でよい" : "下書きの確認：修正の希望", who = (o.party_company ? o.party_company + " " : "") + o.party_name;
  log_(o, kind + (comment ? "（" + comment.slice(0, 100) + "）" : "")); save_(o);
  hist_(o.id, kind, o.title + "\n" + who + (comment ? "\n" + comment : ""), "", "相手", "電子契約");
  if (o.case_no) hist_(o.case_no, kind, o.id + "　" + o.title + (comment ? "\n" + comment : ""), "", "相手", "案件");
  MailApp.sendEmail({ to: P("NOTIFY_TO"), name: ISSUER.service, subject: "［電子契約］" + kind + "：" + o.id + "　" + who, body: o.title + "\n" + o.id + "\n" + who + "\n\n" + (res === "ok" ? "相手が下書きを確認し、「この内容で進めてよい」と返事をしました。\n管理画面の電子契約で「この内容で本契約として送る」を押すと、同じ内容の契約書が正式に届きます。" : "相手から修正の希望が届きました。\n\n" + comment + "\n\n管理画面の電子契約で「内容を直して送り直す」を押すと、直した下書きまたは本契約を送れます。") + "\n\n管理画面：https://119cm.net/keiyaku/admin.html" });
  return { ok: true, feedback: parse_(o.feedback, null) };
}
/* 下書き（確認してもらった内容）を、そのまま本契約に切り替えて送る。文面は変えない */
function finalize_(o) {
  if (o.draft !== "yes") throw new Error("下書きではありません");
  if (o.status === "取り消し" || o.status === "締結済み") throw new Error("この契約書は切り替えられません");
  o.draft = ""; o.viewed = ""; o.status = "送付済み"; o.expires = new Date(Date.now() + VALID_DAYS * 864e5);
  log_(o, "下書きから本契約に切り替え（同じ内容）"); save_(o); sendInvite_(o, true);
  if (o.case_no) hist_(o.case_no, "下書きを本契約として送った", o.id + "　" + o.title, "", null, "案件");
  return { ok: true };
}
/* 内容を直すために、元の契約書の条件を返す */
function getForEdit_(o) {
  var c = parse_(o.cond, null);
  return { ok: true, contract: { id: o.id, template: o.template, title: o.title, draft: o.draft === "yes", status: o.status, party: { name: o.party_name, company: o.party_company, email: o.party_email }, cond: c, note: o.note || "", fields: parse_(o.fields, []), prefill: parse_(o.prefill, {}), requireId: o.require_id === "yes", case_no: o.case_no || "", feedback: parse_(o.feedback, null) } };
}
function sendInvite_(o, fin) {
  var url = P("SIGN_URL") + "?t=" + o.token, draft = o.draft === "yes";
  var html = "<div style='font-family:sans-serif;font-size:16px;line-height:1.8;color:#14211F'><p>" + esc_(o.party_company ? o.party_company + "　" : "") + esc_(o.party_name) + " 様</p><p>" + esc_(ISSUER.service) + "です。" + (draft ? "「" + esc_(o.title) + "」の下書き（確認用）をお送りします。内容をご確認のうえ、画面のボタンからお返事をお願いします。" : (fin ? "先日ご確認いただいた内容のまま、" : "") + "「" + esc_(o.title) + "」をお送りします。下のボタンから内容をご確認のうえ、記入・押印・承認をお願いします。") + "</p><p><a href='" + url + "' style='display:inline-block;background:#0E5A63;color:#fff;padding:14px 26px;border-radius:10px;text-decoration:none;font-weight:bold'>契約書を開く</a></p><p style='font-size:14px;color:#3A4A48'>開くと、このメールアドレスに6けたの認証コードが届きます。リンクの有効期限は" + VALID_DAYS + "日です。<br>契約番号：" + esc_(o.id) + "</p><p style='font-size:14px'>" + esc_(ISSUER.service) + "（運営 " + esc_(ISSUER.name) + "）<br>" + ISSUER.tel + "（受付 " + ISSUER.hours + "）</p></div>";
  MailApp.sendEmail({ to: o.party_email, name: ISSUER.service, replyTo: P("NOTIFY_TO"), subject: "【" + ISSUER.service + "】" + o.title + (draft ? "（下書き）" : fin ? "（正式な契約書）" : "") + "のご案内", htmlBody: html, body: "契約書を開く：" + url });
}
