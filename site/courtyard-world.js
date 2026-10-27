import { SpatialGrid } from './drive-core.js?build=premium-roster-open1';
import { DRIVE } from './drive-config.js?build=premium-roster-open1';
import { courtyardHeightAt,COURTYARD_SAMPLES,courtyardEdge } from './courtyard-route.js?build=premium-roster-open1';
export const COURTYARD_DRIVE={...DRIVE,carHeight:2.30};
// The same driving rules apply outdoors, on ramps and inside corridors.
export function courtyardConfigAt(){return COURTYARD_DRIVE;}
COURTYARD_DRIVE.atState=courtyardConfigAt;
export class ElevationGrid extends SpatialGrid{
  nearby(x,z,r,s){const sx=s?.x??x,sz=s?.z??z;if(this.heightX!==sx||this.heightZ!==sz){this.heightX=sx;this.heightZ=sz;this.cachedHeight=courtyardHeightAt(sx,sz);}const h=this.cachedHeight;return new Set([...super.nearby(x,z,r)].filter(o=>(o.y2??Infinity)>h+.08&&(o.y1??0)<h+COURTYARD_DRIVE.carHeight));}
}
export function wallHeight(w){const base=w.bld||w.endWall||w.stairWall||w.kind==='rail'?1.2:0;return{...w,y1:base+(w.y0??0),y2:base+w.h};}
export function addCourtyardSurface(T,scene){
  // Ramp infill makes the raised driveable surface visibly solid at its edges.
  const vertices=[],indices=[];
  for(let i=0;i<COURTYARD_SAMPLES.length;i++)for(const side of[-1,1]){const p=COURTYARD_SAMPLES[i],q=COURTYARD_SAMPLES[(i+1)%COURTYARD_SAMPLES.length],a=courtyardEdge(p,side),b=courtyardEdge(q,side),ya=courtyardHeightAt(a.x,a.z),yb=courtyardHeightAt(b.x,b.z);if(ya<.02&&yb<.02)continue;const n=vertices.length/3;vertices.push(a.x,ya+.06,a.z,b.x,yb+.06,b.z,a.x,0,a.z,b.x,0,b.z);indices.push(n,n+1,n+2,n+1,n+3,n+2);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();scene.add(new T.Mesh(g,new T.MeshLambertMaterial({color:'#b5c7b4',side:T.DoubleSide})));
}
