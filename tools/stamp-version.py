"""Give each deployed commit fresh asset URLs; source files remain editable without manual version bumps."""
from pathlib import Path
import re,sys
version=sys.argv[1]
if not re.fullmatch(r'[A-Za-z0-9-]+',version):raise SystemExit('Invalid build version')
site=Path(__file__).resolve().parents[1]/'site'
for folder in [site,site/'campus/js']:
    for p in folder.glob('*.js'):
        s=p.read_text(encoding='utf-8')
        s=re.sub(r"(['\"])(\./[^'\"?]+\.js)(?:\?[^'\"]*)?\1",lambda m:f'{m[1]}{m[2]}?build={version}{m[1]}',s)
        if p.name=='app.js':s=re.sub(r'(\.\./\.\./drive-scene\.js)(?:\?[^\'\"]*)?',rf'\1?build={version}',s)
        p.write_text(s,encoding='utf-8')
for p in [site/'index.html',site/'play.html',site/'campus-preview.html',site/'campus/index.html']:
    s=p.read_text(encoding='utf-8')
    s=re.sub(r'((?:src|href)="(?!data:)[^"?]+\.(?:js|css))(?:\?[^\"]*)?"',rf'\1?build={version}"',s)
    s=re.sub(r'(drive=1)(?:&(?:amp;)?build=[a-zA-Z0-9-]+)?',rf'\1&build={version}',s)
    p.write_text(s,encoding='utf-8')
print(f'Asset build version: {version}')
