from pathlib import Path
from urllib.parse import urlsplit,unquote
import re

site=Path(__file__).resolve().parents[1]/'site'
missing=[]
for p in site.rglob('*'):
    if not p.is_file() or p.suffix not in ['.html','.css','.js']:continue
    s=p.read_text(encoding='utf-8')
    refs=[]
    if p.suffix=='.html':
        refs+=re.findall(r'(?:src|href|data-src)="([^"]+)"',s)
        refs+=re.findall(r'"(?:three|three/addons/)"\s*:\s*"([^"]+)"',s)
    if p.suffix=='.css':refs+=re.findall(r'url\([\'"]?([^\)\'\"]+)',s)
    if p.suffix=='.js':refs+=re.findall(r'(?:from\s*|import\s*\()\s*[\'"](\.[^\'\"]+\.js(?:\?[^\'\"]*)?)[\'"]',s)
    for ref in refs:
        ref=ref.replace('&amp;','&')
        if not ref or ref.startswith(('#','data:','https:','http:','mailto:','tel:')) or '${' in ref:continue
        path=unquote(urlsplit(ref).path)
        if path.startswith('/'):raise SystemExit(f'Absolute asset URL breaks repository subpath: {p.relative_to(site)} -> {path}')
        target=(p.parent/path).resolve()
        if not target.is_relative_to(site.resolve()):raise SystemExit(f'Asset escapes site: {ref}')
        if not target.exists():missing.append(f'{p.relative_to(site)} -> {ref}')
if missing:raise SystemExit('\n'.join(missing))
assert (site/'play.html').is_file()
assert 'play.html' in (site/'index.html').read_text(encoding='utf-8')
assert (site/'campus/vendor/three/LICENSE').is_file()
assert (site/'campus/fonts/noto-sans-tc/OFL.txt').is_file()
print(f'PASS: {sum(p.is_file() for p in site.rglob("*"))} site files; all literal asset paths resolve and remain relative.')
