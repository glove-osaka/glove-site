import json,base64,re,sys
# 使い方: grab.py <先頭の目印> <長さ> <出力ファイル>
mark,size,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
p='/root/.claude/projects/-home-claude/73631692-f7f0-51cc-9ce5-00117ee881e0.jsonl'
for line in open(p,encoding='utf-8'):
    if mark not in line: continue
    for m in re.finditer(re.escape(mark)+r'[A-Za-z0-9+/=]*',json.dumps(json.loads(line),ensure_ascii=False)):
        t=m.group(0);t+='='*((4-len(t)%4)%4)
        try: d=base64.b64decode(t)
        except Exception: continue
        if len(d)==size: open(out,'wb').write(d);print('ok',out,len(d));sys.exit()
print('not found')
