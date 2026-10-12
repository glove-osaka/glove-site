import http.server, os, sys
ROOT=sys.argv[1]; PORT=int(sys.argv[2]); PREFIX='/glove-site/'
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path=path.split('?')[0].split('#')[0]
        rel=path[len(PREFIX):] if path.startswith(PREFIX) else path.lstrip('/')
        from urllib.parse import unquote
        fp=os.path.join(ROOT, unquote(rel))
        if os.path.isdir(fp): fp=os.path.join(fp,'index.html')
        if not os.path.exists(fp): fp=os.path.join(ROOT,'404.html')
        return fp
    def log_message(self,*a): pass
http.server.ThreadingHTTPServer(('127.0.0.1',PORT),H).serve_forever()
