// A continuous cycle on the real campus: stadium -> west entrance -> corridor
// -> courtyard -> south lobby ramp -> stadium. Coordinates are campus plan pixels.
const controls=[[1090,1335],[1455,1335]];
for(let i=1;i<=64;i++){const a=-Math.PI/2+Math.PI*i/64;controls.push([1455+250*Math.cos(a),1585+250*Math.sin(a)]);}
controls.push([725,1835]);
for(let i=1;i<=32;i++){const a=Math.PI/2+Math.PI/2*i/32;controls.push([725+250*Math.cos(a),1585+250*Math.sin(a)]);}
controls.push([475,1500],[393,1450],[393,1255],[430,1210],[487,1150],[487,825],[675,825],[675,690],[1100,690],[1100,960],[675,960],[675,1100],[684,1200],[684,1280],[665,1480],[850,1560],[1010,1335]);
const dense=[];
for(let i=0;i<controls.length;i++){
  const a=controls[(i+controls.length-1)%controls.length],b=controls[i],c=controls[(i+1)%controls.length],l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(60,l1*.43,l2*.43);
  const p=[b[0]+(a[0]-b[0])*r/l1,b[1]+(a[1]-b[1])*r/l1],q=[b[0]+(c[0]-b[0])*r/l2,b[1]+(c[1]-b[1])*r/l2];
  for(let k=0;k<=12;k++){const t=k/12;dense.push([(1-t)**2*p[0]+2*(1-t)*t*b[0]+t*t*q[0],(1-t)**2*p[1]+2*(1-t)*t*b[1]+t*t*q[1]]);}
}
const segments=[];let length=0;
for(let i=0;i<dense.length;i++){const a=dense[i],b=dense[(i+1)%dense.length],n=Math.hypot(b[0]-a[0],b[1]-a[1])/18;if(n>1e-7){segments.push({ax:(a[0]-1100)/18,az:(a[1]-700)/18,dx:(b[0]-a[0])/18,dz:(b[1]-a[1])/18,length:n,start:length});length+=n;}}
export const COURTYARD_LENGTH=length;
export function nearestOnCourtyard(x,z){let best={error:Infinity};for(const s of segments){const t=Math.max(0,Math.min(1,((x-s.ax)*s.dx+(z-s.az)*s.dz)/s.length**2)),px=s.ax+t*s.dx,pz=s.az+t*s.dz,error=Math.hypot(x-px,z-pz);if(error<best.error)best={x:px,z:pz,distance:s.start+t*s.length,yaw:Math.atan2(s.dx,s.dz),error};}return best;}
const atPixel=p=>nearestOnCourtyard((p[0]-1100)/18,(p[1]-700)/18).distance;
const slowFrom=atPixel([490,1700]),slowTo=atPixel([1010,1335]);
export function courtyardSlowAt(x,z){const s=nearestOnCourtyard(x,z).distance;return s>=slowFrom&&s<=slowTo;}
const levels=[[[487,1180],0],[[487,936],1.2],[[735,690],1.2],[[945,690],0],[[900,960],0],[[735,960],1.2],[[684,1280],1.2],[[720,1505],0]].map(([p,y])=>({s:atPixel(p),y}));
export function courtyardHeightAt(x,z){const s=nearestOnCourtyard(x,z).distance;for(let i=1;i<levels.length;i++){const a=levels[i-1],b=levels[i];if(s>=a.s&&s<=b.s)return a.y+(b.y-a.y)*(s-a.s)/(b.s-a.s);}return 0;}
export function courtyardPoseAt(distance){const d=((distance%length)+length)%length,s=segments.find(s=>s.start+s.length>=d)||segments.at(-1),t=(d-s.start)/s.length,x=s.ax+t*s.dx,z=s.az+t*s.dz;return{x,z,y:courtyardHeightAt(x,z),yaw:Math.atan2(s.dx,s.dz),distance:d};}
const count=Math.ceil(length/.45),points=Array.from({length:count},(_,i)=>{const p=courtyardPoseAt(i*length/count);return[p.x*18+1100,p.z*18+700];});points.push([...points[0]]);
export const COURTYARD_ROUTE={id:'courtyard',label:'C · 操場＋走廊中庭',short:'操場＋走廊中庭',status:'可比賽',color:'#81bf9d',width:2.8,closed:true,points,checkpoints:Array.from({length:28},(_,i)=>Math.floor(i*count/28)),description:'從操場經西側穿堂、走廊與中庭，再沿南側坡道回到操場。走廊與坡道不限速。',notes:['使用原校園場景，保留校舍、池塘與主題牆','四段緩坡銜接 1.2 公尺走廊高差','走廊窄道自由控制速度；獨立排行與個人最佳幽靈']};
const widths=[[[475,1585],3.6],[[393,1450],2.6],[[393,1290],2.0],[[450,1190],2.0],[[487,1130],2.3],[[487,825],2.3],[[675,825],2.6],[[675,690],2.6],[[820,690],2.8],[[1100,690],2.8],[[1100,960],2.8],[[820,960],2.8],[[675,1000],2.4],[[675,1150],2.4],[[684,1220],2.2],[[684,1270],2.2],[[670,1370],2.4],[[665,1480],2.4],[[760,1520],3.6],[[1010,1335],3.6]].map(([p,y])=>({s:atPixel(p),y}));
export function courtyardWidthAt(x,z){const s=nearestOnCourtyard(x,z).distance;for(let i=1;i<widths.length;i++){const a=widths[i-1],b=widths[i];if(s>=a.s&&s<=b.s)return a.y+(b.y-a.y)*(s-a.s)/(b.s-a.s);}return 3.6;}
export const COURTYARD_SAMPLES=Array.from({length:Math.ceil(length/.3)},(_,i)=>courtyardPoseAt(i*length/Math.ceil(length/.3)));
export function courtyardEdge(p,side){const w=courtyardWidthAt(p.x,p.z)/2;return{x:p.x+Math.cos(p.yaw)*w*side,z:p.z-Math.sin(p.yaw)*w*side};}
export const COURTYARD_RAILS=COURTYARD_SAMPLES.flatMap((p,i)=>[-1,1].map(side=>{const a=courtyardEdge(p,side),b=courtyardEdge(COURTYARD_SAMPLES[(i+1)%COURTYARD_SAMPLES.length],side);return{ax:a.x,az:a.z,bx:b.x,bz:b.z,thickness:.055,y1:Math.min(courtyardHeightAt(a.x,a.z),courtyardHeightAt(b.x,b.z)),y2:Math.max(courtyardHeightAt(a.x,a.z),courtyardHeightAt(b.x,b.z))+.5,kind:'route-rail'};}));
