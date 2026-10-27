"""Capture a browser-exported real campus collision report, never invent clearance data."""
from pathlib import Path
import hashlib,json,re,sys
root=Path(__file__).resolve().parents[1]
report=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))['report']
assert report['route']=='courtyard' and len(report['sourceBoxes'])>3000
files=['site/campus-layout.js','site/drive-scene.js','site/courtyard-route.js','site/campus/js/app.js','site/campus/js/field.js','site/campus/js/blocks.js','site/campus/js/wall.js','site/campus/js/extras.js','site/campus/js/campus-data.js','site/campus/js/furniture.js']
def fingerprint(path):
    source=(root/path).read_text(encoding='utf-8').replace('\r\n','\n')
    return hashlib.sha256(re.sub(r'\?build=[A-Za-z0-9-]+','',source).encode()).hexdigest()
box_keys=['x1','x2','z1','z2','y1','y2','kind']
wall_keys=['ax','az','bx','bz','y1','y2','h','thickness','kind']
data={'routeRailCount':sum(w.get('kind')=='route-rail' for w in report['walls']),'origin':'Real rendered campus / game-report DOM export','sourceBoxCount':len(report['sourceBoxes']),'sourceHashes':{p:fingerprint(p) for p in files},'layout':report['layout'],'bounds':report['bounds'],'ceilings':report['ceilings'],'spawns':report['spawns'],'platforms':report['platforms'],'obstacles':[{k:b[k] for k in box_keys if k in b} for b in report['obstacles']],'walls':[{k:w[k] for k in wall_keys if k in w} for w in report['walls'] if w['kind']!='route-rail']}
target=root/'tools/fixtures/courtyard-collisions.json';target.parent.mkdir(parents=True,exist_ok=True)
target.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f'Captured {len(data["obstacles"])} obstacles, {len(data["walls"])} original walls, {data["sourceBoxCount"]} source primitives.')
