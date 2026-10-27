import { SpatialGrid } from './drive-core.js?build=20261026-courtyard6';
import { DRIVE } from './drive-config.js?build=20261026-courtyard6';
import { courtyardHeightAt,courtyardSlowAt,COURTYARD_RAILS,COURTYARD_SAMPLES,courtyardEdge } from './courtyard-route.js?build=20261026-courtyard6';
export const COURTYARD_DRIVE={...DRIVE,carHeight:2.30};
// The same driving rules apply outdoors, on ramps and inside corridors.
export function courtyardConfigAt(){return COURTYARD_DRIVE;}
COURTYARD_DRIVE.atState=courtyardConfigAt;
export class ElevationGrid extends SpatialGrid{
  nearby(x,z,r,s){const sx=s?.x??x,sz=s?.z??z;if(this.heightX!==sx||this.heightZ!==sz){this.heightX=sx;this.heightZ=sz;this.cachedHeight=courtyardHeightAt(sx,sz);}const h=this.cachedHeight;return new Set([...super.nearby(x,z,r)].filter(o=>(o.y2??Infinity)>h+.08&&(o.y1??0)<h+COURTYARD_DRIVE.carHeight));}
}
export function wallHeight(w){const base=w.bld||w.endWall||w.stairWall||w.kind==='rail'?1.2:0;return{...w,y1:base+(w.y0??0),y2:base+w.h};}
export function addCourtyardRails(T,scene){
  const mesh=new T.InstancedMesh(new T.CylinderGeometry(.065,.065,1,6),new T.MeshLambertMaterial({color:'#efcf8a'}),COURTYARD_RAILS.length),dummy=new T.Object3D();
  COURTYARD_RAILS.forEach((w,i)=>{const a=new T.Vector3(w.ax,courtyardHeightAt(w.ax,w.az)+.27,w.az),b=new T.Vector3(w.bx,courtyardHeightAt(w.bx,w.bz)+.27,w.bz),v=b.clone().sub(a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.scale.set(1,v.length(),1);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});scene.add(mesh);
  // Ramp infill makes the raised driveable surface visibly solid at its edges.
  const vertices=[],indices=[];
  for(let i=0;i<COURTYARD_SAMPLES.length;i++)for(const side of[-1,1]){const p=COURTYARD_SAMPLES[i],q=COURTYARD_SAMPLES[(i+1)%COURTYARD_SAMPLES.length],a=courtyardEdge(p,side),b=courtyardEdge(q,side),ya=courtyardHeightAt(a.x,a.z),yb=courtyardHeightAt(b.x,b.z);if(ya<.02&&yb<.02)continue;const n=vertices.length/3;vertices.push(a.x,ya+.06,a.z,b.x,yb+.06,b.z,a.x,0,a.z,b.x,0,b.z);indices.push(n,n+1,n+2,n+1,n+3,n+2);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();scene.add(new T.Mesh(g,new T.MeshLambertMaterial({color:'#b5c7b4',side:T.DoubleSide})));
}
