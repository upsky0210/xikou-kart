// Coordinates use the original campus plan pixels. 18 px = 1 metre.
import { COURTYARD_ROUTE, courtyardWidthAt } from './courtyard-route.js?build=sculpted-crew4';
export const SCALE = 18;
export const ORIGIN = [1100, 700];
export const world = ([x, z]) => [(x - ORIGIN[0]) / SCALE, (z - ORIGIN[1]) / SCALE];

function stadium() {
  const points = [];
  // Clockwise; start on the north straight facing east.
  for (let x = 1090; x <= 1455; x += 365 / 32) points.push([x, 1335]);
  for (let i = 1; i <= 72; i++) { const a = -Math.PI / 2 + Math.PI * i / 72; points.push([1455 + 250 * Math.cos(a), 1585 + 250 * Math.sin(a)]); }
  for (let i = 1; i <= 64; i++) points.push([1455 - 730 * i / 64, 1835]);
  for (let i = 1; i <= 72; i++) { const a = Math.PI / 2 + Math.PI * i / 72; points.push([725 + 250 * Math.cos(a), 1585 + 250 * Math.sin(a)]); }
  for (let i = 1; i <= 32; i++) points.push([725 + 365 * i / 32, 1335]);
  return points;
}
function campusLoop(){
  // A continuous detour uses both stadium straights and its west/east bends.
  // It has no repeated connector and no at-grade crossing.
  const fieldDetour=[[1455,1335],[725,1335]];
  for(let i=1;i<=60;i++){const a=-Math.PI/2-Math.PI*i/60;fieldDetour.push([725+250*Math.cos(a),1585+250*Math.sin(a)]);}
  fieldDetour.push([1455,1835]);
  for(let i=1;i<=30;i++){const a=Math.PI/2-Math.PI/2*i/30;fieldDetour.push([1455+250*Math.cos(a),1585+250*Math.sin(a)]);}
  const controls=[[1090,95],[1750,95],[1830,175],[1830,1235],[1650,1305],...fieldDetour,[1780,1505],[1910,1545],[2025,1650],[2025,2210],[600,2210],[430,2040],[393,1610],[393,1450],[393,1247],[430,1190],[430,975],[390,900],[390,350],[390,175],[470,95],[1090,95]];
  const dense=[controls[0]];
  for(let i=1;i<controls.length-1;i++){
    const a=controls[i-1],b=controls[i],c=controls[i+1],l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(65,l1*.28,l2*.28);
    const p=[b[0]+(a[0]-b[0])*r/l1,b[1]+(a[1]-b[1])*r/l1],q=[b[0]+(c[0]-b[0])*r/l2,b[1]+(c[1]-b[1])*r/l2];
    dense.push(p);for(let k=1;k<=16;k++){const t=k/16;dense.push([(1-t)**2*p[0]+2*(1-t)*t*b[0]+t*t*q[0],(1-t)**2*p[1]+2*(1-t)*t*b[1]+t*t*q[1]]);}
  }
  dense.push(controls.at(-1));
  return Array.from({length:481},(_,i)=>i===480?[...controls[0]]:pointAt(dense,i/480));
}
export const ROUTES = {
  courtyard:COURTYARD_ROUTE,
  field: {
    id: 'field', label: 'A · 操場環線', short: '操場環線', status: '建議先做',
    color: '#00bfc0', width: 4, points: stadium(), closed: true,
    description: '沿既有五道跑道規劃，保留操場與校舍位置。適合先驗證操控與彎道。',
    checkpoints: [0, 32, 56, 80, 104, 136, 168, 192, 216, 240],
    notes: ['約 168 公尺，路寬 4 公尺', '地面環線；不需進入抬高的一樓', '起終點移至操場北側，校門保留為校園地標'],
  },
  campus: {
    id:'campus',label:'B · 全校＋操場',short:'全校＋操場',status:'可比賽',color:'#eaa239',width:2.4,closed:true,
    points:campusLoop(),checkpoints:Array.from({length:24},(_,i)=>i*20),
    description:'校園北側、操場雙直道與大彎、游泳館南側及校門串聯的環線。西側窄道請提早減速。',
    notes:['全校賽專用附屬設施配置，主要校舍保留','通過北側、東側、操場南側、校門與停車區','西側拱門與停車通道為減速區'],
  },
};

// Insert the complete courtyard circuit into the campus loop at their shared
// northbound west passage. Sequential gates disambiguate the shared stretches.
function grandTour(){
  const outer=ROUTES.campus.points,inner=COURTYARD_ROUTE.points.slice(0,-1),near=(points)=>points.reduce((best,p,i)=>Math.hypot(p[0]-393,p[1]-1370)<Math.hypot(points[best][0]-393,points[best][1]-1370)?i:best,0);
  const a=near(outer),b=near(inner);
  const points=[...outer.slice(0,a),...inner.slice(b),...inner.slice(0,b),...outer.slice(a)];
  return{id:'grand',label:'D · 全校大巡迴',short:'全校＋操場＋走廊中庭',status:'可比賽',color:'#b49bdb',width:2.4,closed:true,points,checkpoints:Array.from({length:52},(_,i)=>Math.floor(i*(points.length-1)/52)),description:'全校外圈、操場、走廊與中庭連成一場完整賽事，依序通過光門。',notes:['全程約 860 公尺','西側通道串聯完整中庭與校園環線','部分路段會再次經過，請跟隨下一個光門']};
}
ROUTES.grand=grandTour();

export const ISSUES = [
  { id: 'north', at: [465,95], name: '北側封閉通道', text: '北側通道約 6.1 m，但東西兩端有樹籬封閉。B 線必須處理兩端樹籬。', level: 'blocked' },
  { id: 'parking', at: [400,370], name: '教師停車場', text: 'B 線經過停車棚與車輛，不能把空白平面直接當成暢通路面。', level: 'blocked' },
  { id: 'east', at: [1760,900], name: '東側樹木', text: '至善樓與內退圍牆間約 7.5–7.8 m，現有樹木落在 B 線附近。', level: 'blocked' },
  { id: 'arch', at: [393,1247], name: '操場入口拱門', text: '開口約 2.6 m，小於 B 線 3 m 草案。需繞道或只改 Kart 副本內的設施。', level: 'blocked' },
  { id: 'base', at: [680,1100], name: '一樓高差', text: '原建築一樓基座高 1.2 m；一般走廊約 2.2–3.8 m。首版不經走廊與樓梯。', level: 'warning' },
  { id: 'stage', at: [1110,1260], name: '司令臺前緩衝', text: 'A 線北側邊界與司令臺資料外緣約差 0.5 m；實際外凸幾何另納入靜態檢查。', level: 'warning' },
];

export function lengthMetres(points) {
  return points.slice(1).reduce((n, p, i) => n + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]) / SCALE, 0);
}
export function roadWidthAt(route,p){
  if(route.id==='grand'){const x=(p[0]-1100)/18,z=(p[1]-700)/18;return Math.min(2.4,courtyardWidthAt(x,z));}
  if(route.id==='courtyard')return courtyardWidthAt((p[0]-1100)/18,(p[1]-700)/18);
  // Existing entrance flags and parking canopy leave a short 1.8 m chicane.
  return route.id==='campus'&&p[0]<460&&p[1]>900&&p[1]<1300?1.8:route.width;
}
export function pointAt(points, t) {
  const total = lengthMetres(points) * SCALE;
  let d = ((t % 1 + 1) % 1) * total;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= len && len) return [a[0] + (b[0] - a[0]) * d / len, a[1] + (b[1] - a[1]) * d / len];
    d -= len;
  }
  return points[0];
}

export function distanceRect(x, z, b) {
  return Math.hypot(Math.max(b.x1 - x, 0, x - b.x2), Math.max(b.z1 - z, 0, z - b.z2));
}
export function distanceSegment(x, z, b) {
  const dx = b.bx - b.ax, dz = b.bz - b.az, l = dx * dx + dz * dz;
  const t = l ? Math.max(0, Math.min(1, ((x - b.ax) * dx + (z - b.az) * dz) / l)) : 0;
  return Math.hypot(x - b.ax - t * dx, z - b.az - t * dz);
}

// Uniform samples at <= 0.25 m; expand half-width by one sample step so a narrow
// obstruction cannot slip between samples. Conservative geometric screening only.
export function auditRoute(route, obstacles, walls) {
  const length = lengthMetres(route.points), n = Math.ceil(length / 0.25);
  const hits = [], band = route.width / 2 + length / n;
  let minClearance = Infinity;
  for (let i = 0; i < n; i++) {
    const p = pointAt(route.points, i / n), [x,z] = world(p);
    let clearance = Infinity;
    for (const b of obstacles) clearance = Math.min(clearance, distanceRect(x,z,b));
    for (const b of walls) clearance = Math.min(clearance, distanceSegment(x,z,b) - 0.15);
    minClearance = Math.min(minClearance, clearance - route.width / 2);
    if (clearance < band) hits.push({ at: p.map(v=>+v.toFixed(1)), clearance: +clearance.toFixed(3) });
  }
  return { length: +length.toFixed(2), width: route.width, sampleStep: +(length/n).toFixed(4), samples: n,
    flaggedSamples: hits.length, minEdgeClearance: +minClearance.toFixed(3), hits,
    scope: '地面障礙矩形與牆線；保守取樣初檢，未含車輛動態、鏡頭或實機測試' };
}
