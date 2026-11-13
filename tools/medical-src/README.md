# 医療介護総合支援会の元ファイルと現状（2026年11月13日 更新）

## 住所
| 用途 | 住所 |
|---|---|
| サイト（本番） | https://119cm.net/ （Xサーバー sv17329） |
| 電子契約 | https://119cm.net/keiyaku/ |
| 担当者ログイン | https://119cm.net/keiyaku/admin.html |
| 旧住所 | glove-osaka.github.io/glove-site/medical/ → 119cm.net へ自動で転送（?t= も引き継ぐ） |

## 公開のしかた
`sites/119cm.net/` を push すると GitHub Actions（deploy-119cm.yml）が FTP で自動アップロード。パスワードは GitHub の秘密情報 FTP_119CM_PASSWORD。

## 元ファイル
| ファイル | 役割 |
|---|---|
| build.py / data.py | サイト全39ページを作る（文面・メニュー・会員制度・相談フォームなど） |
| make_keiyaku.py | 電子契約と管理画面（/medical/keiyaku/）を作る。build.py の最後で自動で動く |
| keiyaku_text.py | 会員規約・個人会員規約・秘密保持・業務提携の文面 |
| keiyaku_core.js / keiyaku_gas_main.js | 会費計算・契約書の組み立て／受付の仕組み（Apps Script）本体 |
| keiyaku_config.js | 受付の仕組みのURL（お客様用・管理画面用） |
| gas/ | Apps Script に貼る完成品（コード.gs・admin.html・appsscript.json・設定のしかた.txt） |
| gyakutai/ | 高齢者虐待の相談先検索のデータ（8府県・294市町村） |

## 作り直すとき
1. このフォルダを `/home/claude/medical-src`、gyakutai を `/home/claude/gyakutai` に置く（build.py が絶対パスで読むため）
2. glove-site を `/home/claude/glove-site` に置く
3. `cd /home/claude/medical-src && python3 build.py`（出力先 sites/119cm.net）→ push で自動公開
4. Apps Script を変えたときは、gas/コード.gs と gas/admin.html を貼り替え →「デプロイを管理」で2つとも新しいバージョンにする

## 受付の仕組み（Google・ikshienkai@gmail.com）
| 項目 | 内容 |
|---|---|
| プロジェクト | 「医療介護総合支援会 電子契約・受付」（ikshienkai@gmail.com のApps Script） |
| お客様用（全員） | https://script.google.com/macros/s/AKfycbznp_C6UEbTjF6rrYOs6cdVItyAaOtWtMZzl34-Ao5ZAfkMyzjS5GHWAQhsuR0BbV3z/exec |
| 管理画面用（自分のみ） | https://script.google.com/macros/s/AKfycbwZUSCmvDZyNJfqeAUNcGGj3z6j2HxwIi8MpBLpqcBGjn_cIuZxU7BMs2ygwcx58hkH/exec?admin=1 |
| 公開の版 | 両方ともバージョン7（2026/11/13・パスワード再設定を追加） |
| 台帳 | ドライブ「医療介護総合支援会 電子契約（台帳）」：シート 契約／受付／振分け設定／対応履歴 |
| 自動の確認 | alertCheck が1時間ごと（遅れている案件を NOTIFY_TO へメール） |
| 設定（スクリプト プロパティ） | ADMIN_ID / ADMIN_PASS_HASH・SALT / ADMIN_EMAILS / NOTIFY_TO / BANK_INFO / SHEET_ID / FOLDER_ID / SIGN_URL |
| パスワードを忘れたら | ログイン画面の「ID・パスワードを忘れたとき」→ 登録メールに届くIDと確認コードで決め直す（予備：ADMIN_PASS に新しいパスワードを入れて保存） |

## サイトでできること（公開中）
- 立場別の入口・支援メニュー・相談フォーム（6段階）・高齢者虐待の相談先検索・オープニング動画
- 会員制度（受付中）：事業所5,500円〜／法人5,500円〜／協賛33,000円／個人（営業協力者）無料。年払い＝10か月分。銀行振込・前払い・毎月1日更新
- 会員登録 → そのまま電子契約（認証コード → 確認 → 押印・承認 → PDF）→ 振込案内メール自動 → 入金確認で登録完了メール
- 担当者ログイン（ページ下）→ 案件管理（新しい順・6段階の帯・振分け・警告音・放置日数・進捗報告の作成と送信判断）／電子契約／振分け設定
- 相談の例：立場ごとに3件の「参考事例」（作成した事例と明記）

## 残っていること
| 項目 | 担当 |
|---|---|
| 振分け設定に提携企業を登録 | MA |
| 相談フォームからのためし送信 | MA |
| 会員規約の【要決定】8項目（紹介料の期間・年払いの紹介料・効果の測り方・入会金・協賛の審査基準・解約の申し出先・振込手数料・施行日） | MA |
| 弁護士（規約）・税理士（紹介料の税務）の確認 | MA |
| Google Search Console に 119cm.net を登録 | 次に支援 |
| LINE・アクセス解析 | 未定 |
| 実際の会員の声（同意を得て）を「会員様の声」として追加 | 声が集まりしだい |
