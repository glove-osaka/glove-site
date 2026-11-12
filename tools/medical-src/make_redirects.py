# 旧住所（github.io/glove-site/medical/）を開いた人を 119cm.net の同じページへ案内する
import os
OLD = "/home/claude/glove-site/medical"
NEW = "https://119cm.net/"
n = 0
for d, _, fs in os.walk(OLD):
    for f in fs:
        if not f.endswith(".html"): continue
        rel = os.path.relpath(os.path.join(d, f), OLD).replace(os.sep, "/")
        url = NEW + ("" if rel == "index.html" else rel.replace("index.html", ""))
        html = f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<title>移転しました｜医療介護総合支援会</title><link rel="canonical" href="{url}">
<meta http-equiv="refresh" content="0;url={url}">
<script>location.replace("{url}"+location.search+location.hash)</script>
<style>body{{font-family:sans-serif;padding:40px 20px;line-height:1.8;color:#14211F}}a{{color:#0E5A63;font-weight:700}}</style></head>
<body><p>医療介護総合支援会のホームページは、<a href="{url}">119cm.net</a> に移転しました。自動で移動しない場合は、リンクを押してください。</p></body></html>
'''
        open(os.path.join(d, f), "w", encoding="utf-8").write(html); n += 1
print(n, "pages redirected")
