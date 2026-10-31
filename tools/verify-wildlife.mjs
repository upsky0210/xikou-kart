import assert from 'node:assert/strict';
import * as T from '../site/campus/vendor/three/build/three.module.js';
import {buildKart} from '../site/kart-model.js';
import {getRacer,RACERS} from '../site/racer-catalog.js';
import {COURTYARD_SAMPLES,courtyardHeightAt} from '../site/courtyard-route.js';
globalThis.document={createElement(){return{width:0,height:0,getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};}};
assert.equal(RACERS.length,8);for(const [old,next]of Object.entries({hamster:'koala',macaque:'raccoon',bunny:'giraffe',meerkat:'giraffe'}))assert.equal(getRacer(old).id,next);
const rows=[],silhouettes=new Set();
for(const id of ['koala','raccoon','giraffe']){
  const m=buildKart(T,id),head=m.head,skull=head.getObjectByName('continuous-sculpted-skull');assert.equal(head.userData.faceStyle,`premium-${id}-v1`);assert.ok(skull);m.car.updateMatrixWorld(true);
  const paws=[];let triangles=0;m.car.traverse(o=>{if(o.name==='steering-paw')paws.push(o);if(o.isMesh){assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);}});assert.equal(paws.length,2);assert.ok(triangles<220000,'four-car geometry budget');
  let relief=0;for(const eye of head.children.filter(o=>o.name==='iris')){const v=eye.geometry.attributes.position;for(let i=0;i<v.count;i+=17){const origin=head.localToWorld(new T.Vector3(v.getX(i),v.getY(i),v.getZ(i)+.2)),hit=new T.Raycaster(origin,new T.Vector3(0,0,-1)).intersectObject(skull)[0];assert.ok(hit);const d=hit.distance-.2;assert.ok(d>-.003&&d<.03,`${id} conforming eye at ${d}`);relief=Math.max(relief,d);}}
  for(const paw of paws){assert.equal(paw.position.y,1);assert.equal(paw.position.z,.30);assert.ok(Math.abs(Math.abs(paw.position.x)-.18)<.001);}
  if(id==='koala'){assert.equal(head.children.filter(o=>o.name==='koala-fluffy-ear').length,2);assert.equal(head.children.filter(o=>o.name==='koala-ear-fluff').length,2);assert.ok(head.getObjectByName('koala-velvet-nose').material.bumpMap);let pads=0;m.driver.traverse(o=>{if(o.name==='koala-toe-pad')pads++;});assert.equal(pads,6);}
  if(id==='raccoon'){assert.ok(skull.material.map);const tail=m.driver.getObjectByName('raccoon-ringed-tail');assert.ok(tail);const colors=tail.geometry.attributes.color,ringColors=Array.from({length:81},(_,i)=>[0,1,2].map(c=>colors.array[i*15*3+c].toFixed(3)).join(','));assert.equal(new Set(ringColors).size,2);assert.ok(ringColors.filter((c,i)=>i&&c!==ringColors[i-1]).length>=6);assert.ok(m.driver.getObjectByName('raccoon-tail-fibers').isInstancedMesh);}
  if(id==='giraffe'){assert.ok(skull.material.map);assert.equal(head.children.filter(o=>o.name==='giraffe-horn-tip').length,2);assert.equal(head.children.filter(o=>o.name==='giraffe-eyelash').length,6);const neck=m.driver.getObjectByName('giraffe-long-spotted-neck');neck.geometry.computeBoundingBox();assert.ok(neck.geometry.boundingBox.max.y-neck.geometry.boundingBox.min.y>.60);assert.ok(neck.geometry.attributes.position.count>5000);assert.ok(neck.geometry.attributes.color);}
  const bounds=new T.Box3().setFromObject(m.car);silhouettes.add(bounds.getSize(new T.Vector3()).toArray().map(n=>n.toFixed(3)).join(','));
  let maxHeight=0;for(const p of COURTYARD_SAMPLES.filter((p,i)=>p.y>.02&&i%7===0)){const fx=Math.sin(p.yaw),fz=Math.cos(p.yaw);m.car.position.set(p.x,p.y+.075,p.z);m.car.rotation.set(-Math.atan2(courtyardHeightAt(p.x+fx*.1,p.z+fz*.1)-p.y,.1),p.yaw,Math.atan2(courtyardHeightAt(p.x+fz*.1,p.z-fx*.1)-p.y,.1),'YXZ');const h=new T.Box3().setFromObject(m.car).max.y-p.y;maxHeight=Math.max(maxHeight,h);assert.ok(h<2.30,`${id} corridor/ramp clearance: ${h}`);}
  rows.push({id,triangles,maxHeight,eyeRelief:relief});
}
assert.equal(silhouettes.size,3,'three genuinely different anatomical silhouettes');console.log(JSON.stringify({passed:true,rows}));
