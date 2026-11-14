# Internal link checker: every href / router.push / redirect literal must
# resolve to an app route, a public file or a next.config.js redirect.
# Usage (from frontend/):  python3 scripts/linkcheck.py "$PWD/app" app components hooks lib
import os, re, sys
APP = sys.argv[1]; SRC = sys.argv[2:]
routes = []
for dp, dns, fns in os.walk(APP):
    rel = os.path.relpath(dp, APP)
    parts = [] if rel == '.' else rel.split(os.sep)
    if any(p.startswith('_') for p in parts) or 'node_modules' in parts: continue
    if not any(f in ('page.tsx', 'page.ts', 'page.js', 'route.ts') for f in fns): continue
    segs = [p for p in parts if not (p.startswith('(') and p.endswith(')'))]
    rx = ''.join('/(.+)' if s.startswith('[...') else '/[^/]+' if s.startswith('[') else '/' + re.escape(s) for s in segs)
    routes.append(re.compile('^' + (rx or '/') + '/?$'))
# metadata routes
routes += [re.compile(r'^/sitemap\.xml$'), re.compile(r'^/robots\.txt$')]
# redirects declared in next.config.js (source patterns -> loose regex)
cfg = open(os.path.join(os.path.dirname(APP), 'next.config.js')).read()
cfg = cfg[cfg.index('async redirects()'):]
for src in re.findall(r"source: '([^']+)'", cfg):
    rx = re.sub(r':\w+\(\(\?![^)]*\)\[\^/\]\+\)', '[^/]+', src); rx = re.sub(r':\w+\*', '.*', rx); rx = re.sub(r':\w+', '[^/]+', rx)
    routes.append(re.compile('^' + rx + '/?$'))
public = set()
for dp, _, fns in os.walk(os.path.join(os.path.dirname(APP), 'public')):
    for f in fns: public.add('/' + os.path.relpath(os.path.join(dp, f), os.path.join(os.path.dirname(APP), 'public')))
LINK = re.compile(r"""(?:href=\{?|router\.(?:push|replace)\(|redirect\()\s*([`'"])(/[^`'"]*)\1""")
bad = []
for root in SRC:
    for dp, _, fns in os.walk(root):
        if 'node_modules' in dp: continue
        for f in fns:
            if not f.endswith(('.tsx', '.ts')) or f.endswith('.test.ts'): continue
            p = os.path.join(dp, f)
            for i, line in enumerate(open(p, encoding='utf-8', errors='ignore'), 1):
                for m in LINK.finditer(line):
                    url = m.group(2)
                    if url.startswith('//'): continue
                    url = re.sub(r'\$\{[^}]*\}', 'x', url).split('?')[0].split('#')[0]
                    if not url or url in public: continue
                    if not any(r.match(url) for r in routes):
                        bad.append(f'{p}:{i}: {m.group(2)}')
print(f'{len(bad)} unresolved internal links')
print('\n'.join(sorted(set(bad))))
