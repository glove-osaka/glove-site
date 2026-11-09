# 岐阜県・愛知県を gyakutai.json に追加する（make_data.py の後に実行）
import json, re, unicodedata
D = json.load(open('/home/claude/gyakutai/gyakutai.json', encoding='utf-8'))

# ---------- 岐阜県（令和8年4月1日現在、PDFの座標で行を確認して手入力） ----------
G = [
("岐阜市", [("高齢福祉課","058-265-3889","")]),
("大垣市", [("高齢福祉課","0584-47-7416",""),("介護保険課","0584-47-7409","")]),
("高山市", [("高年介護課","0577-32-3333","内線2953")]),
("多治見市", [("高齢福祉課","0572-23-5821","直通"),("高齢福祉課（代表）","0572-22-1111","内線2234")]),
("関市", [("高齢福祉課（養護者による虐待）","0575-23-9007",""),("高齢福祉課（施設での虐待）","0575-23-7730",""),("関市役所（代表）","0575-22-3131","内線2145")]),
("中津川市", [("高齢介護課（中津川市包括支援センター）","0573-66-1111","内線589・656")]),
("美濃市", [("高齢福祉保険課","0575-33-1122","内線140")]),
("瑞浪市", [("高齢福祉課","0572-68-2117","")]),
("羽島市", [("高齢福祉課","058-392-1111","")]),
("恵那市", [("高齢福祉課 地域包括支援センター","0573-26-6828","直通")]),
("美濃加茂市", [("高齢福祉課 高齢福祉係（養護者による虐待）","0574-25-2111","内線504"),("高齢福祉課 介護保険係（施設での虐待）","0574-25-2111","内線317")]),
("土岐市", [("高齢介護課","0572-54-1111","内線231・232")]),
("各務原市", [("高齢介護課","058-383-1779","")]),
("可児市", [("高齢福祉課","0574-62-1111","内線3231")]),
("山県市", [("福祉課","0581-22-6837","")]),
("瑞穂市", [("地域福祉高齢課","058-327-4126","")]),
("飛騨市", [("地域包括ケア課 地域包括支援センター","0577-73-6233","直通")]),
("本巣市", [("長寿支援課","058-323-7754","")]),
("郡上市", [("高齢福祉課 地域包括支援センター","0575-67-0008","直通")]),
("下呂市", [("高齢福祉課（地域包括支援センター）","0576-53-2100","")]),
("海津市", [("高齢介護課","0584-53-1145",""),("地域包括支援センター","0584-53-3030","")]),
("岐南町", [("保険年金課 地域包括支援センター","058-247-1312","")]),
("笠松町", [("健康介護課","058-388-7171","")]),
("養老町", [("地域包括支援センター","0584-33-0270","")]),
("垂井町", [("健康福祉課 地域包括支援センター","0584-22-7505","直通")]),
("関ケ原町", [("住民課","0584-43-1113","直通"),("地域包括支援センター","0584-43-3201","")]),
("神戸町", [("健康福祉課","0584-27-0175",""),("地域包括支援センター","0584-27-1158","")]),
("輪之内町", [("福祉介護課","0584-69-3128",""),("地域包括支援センター","0584-68-2766","")]),
("安八町", [("福祉課","0584-64-7104","直通")]),
("揖斐川町", [("健康福祉課","0585-23-1341","")]),
("大野町", [("福祉課 地域包括支援センター","0585-35-5369","直通")]),
("池田町", [("保険年金課 地域包括支援センター","0585-45-8123","")]),
("北方町", [("福祉子ども課","058-323-1119","")]),
("坂祝町", [("福祉課","0574-66-2406",""),("地域包括支援センター","0574-25-7575","")]),
("富加町", [("福祉保健課 福祉係","0574-54-2183",""),("地域包括支援センター","0574-54-2184","")]),
("川辺町", [("健康福祉課（地域包括支援センター）","0574-53-7216","")]),
("七宗町", [("健康福祉課 地域包括支援センター","0574-48-1112","")]),
("八百津町", [("八百津町地域包括支援センター","0574-43-3267","直通"),("八百津町役場（代表）","0574-43-2111","内線2567")]),
("白川町", [("保健福祉課","0574-70-1328",""),("地域包括支援センター","0574-74-0808","")]),
("東白川村", [("村民福祉課・東白川村地域包括支援センター","0574-78-2100","")]),
("御嵩町", [("保険長寿課 高齢福祉係（養護者による虐待）","0574-66-2002",""),("保険長寿課 介護保険係（施設職員などによる虐待）","0574-66-2003",""),("御嵩町地域包括支援センター（養護者による虐待）","0574-66-8210","")]),
("白川村", [("村民課","05769-6-1311","")]),
]
D["岐阜県"] = {"name": "岐阜県",
  "src": {"label": "岐阜県「市町村別高齢者虐待相談窓口」（令和8年4月1日現在）", "url": "https://www.pref.gifu.lg.jp/uploaded/attachment/514160.pdf", "asof": "令和8年4月1日現在"},
  "note": "掲載の番号は、主に平日の日中につながる担当窓口です。",
  "m": {mu: {"list": [{"l": l, "t": t, "n": n} for l, t, n in cs]} for mu, cs in G}}

# ---------- 愛知県（令和8年4月1日現在、PDFの文字を行ごとに解析） ----------
def norm(s):
    return unicodedata.normalize('NFKC', s)
def normn(s):
    return re.sub(r'[ー‐―−–－]', '-', unicodedata.normalize('NFKC', s))
TEL = re.compile(r'0\d{1,4}-\d{1,4}-\d{3,4}')
rows = []
for line in open('/home/claude/gyakutai/src_aichi.txt', encoding='utf-8'):
    m = re.match(r'P(\d+) y(\d+) (.*)', line.rstrip('\n'))
    if not m: continue
    its = [(int(a), b) for a, b in (x.split(':', 1) for x in m.group(3).split(' | '))]
    rows.append((int(m.group(1)), int(m.group(2)), its))
def muni_of(its):
    t = ''.join(s for x, s in its if x < 112).replace(' ', '')
    m = re.match(r'(.+?[市町村])', t)
    return m.group(1) if m and t not in ('市町村',) and not t.startswith('健康福祉局') and t != '高齢福祉課' else None
groups = []  # [muni, [rows]]
for pg, y, its in rows:
    if any(s in ('市町村担当課',) for x, s in its): continue
    txt = ''.join(s for x, s in its)
    if '連絡先電話番号' in txt or (len(its) == 1 and its[0][1].isdigit()) or '各市町村高齢者虐待対応窓口' in txt.replace('　', ''): continue
    mu = muni_of(its)
    rest = [(x, s) for x, s in its if x >= 112]
    if mu and (not groups or groups[-1][0] != mu):
        if not rest:  # 名前だけの行（豊田市）：直前の市の最後の【】行から後ろを移す
            prev = groups[-1][1]; k = max(i for i, r in enumerate(prev) if any(s.startswith('【') for x, s in r))
            groups.append([mu, prev[k:]]); del prev[k:]; continue
        groups.append([mu, []])
    if rest: groups[-1][1].append(rest)
NAGOYA_WARDS = ["千種区","東区","北区","西区","中村区","中区","昭和区","瑞穂区","熱田区","中川区","港区","南区","守山区","緑区","名東区","天白区"]
SVC = {'【養護者による虐待】': '家族などによる虐待', '【養介護施設従事者等による虐待】': '施設職員などによる虐待', '【施設従事者による虐待】': '施設職員などによる虐待', '【施設における虐待】': '施設職員などによる虐待'}
A = {}
for mu, rs in groups:
    contacts = []; night = []; tag = ''; cur = None
    for r in rs:
        lab = norm(''.join(s for x, s in r if x < 274)).replace(' ', ' ').strip()
        lab = re.sub(r'(平日|夜間・休日|夜間)$', '', lab).strip()
        isnight = any(s.startswith('夜') for x, s in r if 270 <= x <= 310)
        numtxt = normn(''.join(s for x, s in r if x >= 274 and not s.startswith('夜') and s not in ('平', '日', '間', '平日')))
        tels = TEL.findall(numtxt)
        rem = re.sub(r'^[:：]?', '', re.sub(r'0\d{1,4}[ー‐―−–－-]\d{1,4}[ー‐―−–－-]\d{3,4}', '', norm(''.join(s for x, s in r if x >= 274 and not s.startswith('夜') and s not in ('平', '日', '間', '平日'))))).strip('()（）: ')
        if lab.startswith('【') and not tels: continue  # 区役所・いきいき支援センターなどの見出し
        if lab.startswith('【') and tels:
            tag = SVC.get(lab, ''); cur = {'l': '', 't': tels[0], 'n': ('平日' + (' / ' + tag if tag else ''))}; contacts.append(cur); continue
        if not tels:
            if cur is not None and lab: cur['l'] = (cur['l'] + ' ' + lab).strip()
            continue
        if isnight:
            if lab.startswith('('):
                night.append({'l': mu + lab.replace('(', '（').replace(')', '）'), 't': tels[0], 'n': rem or '夜間・休日'}); continue
            if cur is not None and lab and not cur['l']: cur['l'] = lab
            elif cur is not None and lab: cur['l'] = (cur['l'] + ' ' + lab).strip()
            night.append({'l': f'夜間・休日（{mu}）', 't': tels[0], 'n': rem or '夜間・休日'})
            continue
        cur = {'l': lab, 't': tels[0], 'n': '平日' if any(s == '平' for x, s in r) else ''}
        if rem: cur['n'] = (cur['n'] + ' ' + rem).strip()
        contacts.append(cur)
    for c in contacts:
        c['l'] = re.sub(r'\s+', ' ', c['l']).strip() or f'{mu}の担当窓口'
        c['n'] = c['n'].strip()
    # 同じ夜間番号はまとめる
    seen = set(); nn = []
    for c in night:
        if c['t'] in seen: continue
        seen.add(c['t']); nn.append(c)
    if mu == '名古屋市':
        center = [c for c in contacts if '虐待相談センター' in c['l']]
        areas = {w: [] for w in NAGOYA_WARDS}
        for c in contacts:
            if c in center: continue
            w = next((w for w in sorted(NAGOYA_WARDS, key=len, reverse=True) if c["l"].startswith(w)), None)
            if w is None: print("NOWARD", c); continue
            areas[w].append(c)
        A[mu] = {'areas': areas, 'all': center + nn}
    else:
        A[mu] = {'list': contacts, **({'all': nn} if nn else {})}
D["愛知県"] = {"name": "愛知県",
  "src": {"label": "愛知県「各市町村高齢者虐待対応窓口」（令和8年4月1日現在）", "url": "https://www.pref.aichi.jp/uploaded/attachment/617047.pdf", "asof": "令和8年4月1日現在"},
  "note": "", "m": A}
json.dump(D, open('/home/claude/gyakutai/gyakutai.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('岐阜', len(D["岐阜県"]["m"]), '愛知', len(A))
