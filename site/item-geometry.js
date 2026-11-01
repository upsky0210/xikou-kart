import {SpatialGrid} from './drive-core.js?build=20261101-items1';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function pointSegmentDistance(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,t=l?clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/l,0,1):0;return Math.hypot(p.x-a.x-dx*t,p.z-a.z-dz*t);}
function boxHit(a,b,o){let lo=0,hi=1;for(const [key,min,max]of [['x',o.x1-.06,o.x2+.06],['z',o.z1-.06,o.z2+.06]]){const delta=b[key]-a[key];if(Math.abs(delta)<1e-9){if(a[key]<min||a[key]>max)return false;}else{const p=(min-a[key])/delta,q=(max-a[key])/delta;lo=Math.max(lo,Math.min(p,q));hi=Math.min(hi,Math.max(p,q));if(lo>hi)return false;}}return true;}
function wallHit(a,b,o){const c={x:o.ax,z:o.az},d={x:o.bx,z:o.bz},cross=(p,q,r)=>(q.x-p.x)*(r.z-p.z)-(q.z-p.z)*(r.x-p.x);if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return true;return Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b))<(o.thickness??.15)+.06;}
export function itemBlocker(boxes=[],walls=[]){
  const grid=new SpatialGrid(boxes,walls);
  return (a,b)=>{const distance=Math.hypot(b.x-a.x,b.z-a.z),low=Math.min(a.y,b.y),high=Math.max(a.y,b.y);for(const o of grid.nearby((a.x+b.x)/2,(a.z+b.z)/2,distance/2+.2)){if((o.y2??Infinity)<low-.05||(o.y1??0)>high+.05)continue;if(o.kind==='wall'?wallHit(a,b,o):boxHit(a,b,o))return false;}return true;};
}
