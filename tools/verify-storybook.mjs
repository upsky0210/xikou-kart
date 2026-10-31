import assert from 'node:assert/strict';
import * as T from '../site/campus/vendor/three/build/three.module.js';
import {buildKart} from '../site/kart-model.js';
import {COURTYARD_SAMPLES,courtyardHeightAt} from '../site/courtyard-route.js';
globalThis.document={createElement(){return{width:0,height:0,getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};}};
const evidence=[];
for(const id of ['bunny','sheep','hamster']){
  const m=buildKart(T,id),head=m.head,skull=head.getObjectByName('continuous-sculpted-skull');
  assert.equal(head.userData.sculptRevision,3);assert.equal(head.children.filter(o=>o.name==='continuous-sculpted-skull').length,1);
  const paws=[];m.driver.traverse(o=>{if(o.name==='steering-paw')paws.push(o);assert.ok(!/cookie|biscuit|snack|food-prop/.test(o.name),'hands must not hold food');});
  assert.equal(paws.length,2);for(const paw of paws){assert.ok(Math.abs(Math.abs(paw.position.x)-.18)<.001);assert.equal(paw.position.y,1);assert.equal(paw.position.z,.30);}
  m.car.updateMatrixWorld(true);let maxEyeRelief=0;
  for(const eye of head.children.filter(o=>o.name==='iris')){
    const vertices=eye.geometry.attributes.position;
    for(let i=0;i<vertices.count;i+=7){const origin=head.localToWorld(new T.Vector3(vertices.getX(i),vertices.getY(i),vertices.getZ(i)+.2)),hit=new T.Raycaster(origin,new T.Vector3(0,0,-1)).intersectObject(skull)[0];assert.ok(hit,'eyes remain over the continuous facial surface');const relief=hit.distance-.2;assert.ok(relief>-.002&&relief<.025,`${id}: eye relief ${relief} at ${vertices.getX(i)}, ${vertices.getY(i)} stays within 25 mm`);maxEyeRelief=Math.max(maxEyeRelief,relief);}
  }
  if(id==='bunny'){assert.equal(head.children.filter(o=>o.name==='petal-ear').length,2);assert.equal(head.children.filter(o=>o.name==='swept-forelock').length,3);}
  if(id==='hamster'){assert.equal(head.children.filter(o=>o.name==='front-tooth').length,2);assert.equal(head.children.filter(o=>o.name==='whisker').length,6);}
  if(id==='sheep'){assert.ok(head.getObjectByName('sculpted-fleece-cap'));assert.ok(m.driver.getObjectByName('fleece-racing-jacket'));assert.ok(head.getObjectByName('fleece-crown-curls').isInstancedMesh);}
  let maxHeight=0;
  for(const p of COURTYARD_SAMPLES.filter((p,i)=>p.y>.02&&i%7===0)){
    const fx=Math.sin(p.yaw),fz=Math.cos(p.yaw);m.car.position.set(p.x,p.y+.075,p.z);m.car.rotation.set(-Math.atan2(courtyardHeightAt(p.x+fx*.1,p.z+fz*.1)-p.y,.1),p.yaw,Math.atan2(courtyardHeightAt(p.x+fz*.1,p.z-fx*.1)-p.y,.1),'YXZ');
    const h=new T.Box3().setFromObject(m.car).max.y-p.y;maxHeight=Math.max(maxHeight,h);assert.ok(h<2.30,`${id} clears real corridor height on ramps`);
  }
  evidence.push({id,maxEyeRelief,maxHeight});
}
console.log(JSON.stringify({passed:true,evidence}));
