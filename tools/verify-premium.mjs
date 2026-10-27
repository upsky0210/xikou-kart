import assert from 'node:assert/strict';
import * as T from '../site/campus/vendor/three/build/three.module.js';
import {buildKart} from '../site/kart-model.js';
globalThis.document={createElement(){return{width:0,height:0,getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};}};
const high=buildKart(T,'cat',{faceStyle:'premium'}),low=buildKart(T,'cat');
assert.equal(high.head.userData.faceStyle,'premium-cat-v1');assert.equal(low.head.userData.faceStyle,'toon-v2');
assert.ok(high.head.getObjectByName('continuous-sculpted-skull'));
assert.equal(high.head.children.filter(o=>o.name==='continuous-sculpted-skull').length,1);
assert.equal(high.head.children.filter(o=>o.name==='iris').length,2);
assert.equal(high.head.children.filter(o=>o.name==='whisker').length,6);
function inspect(model){let triangles=0;model.car.updateMatrixWorld(true);model.car.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;assert.ok([...p.array].every(Number.isFinite));triangles+=(o.geometry.index?.count??p.count)/3*(o.isInstancedMesh?o.count:1);});return triangles;}
const highTriangles=inspect(high),lowTriangles=inspect(low);assert.ok(highTriangles>lowTriangles*1.5);assert.ok(highTriangles<250000);
const {COURTYARD_SAMPLES,courtyardHeightAt}=await import('../site/courtyard-route.js');
for(const p of COURTYARD_SAMPLES.filter((p,i)=>p.y>.02&&i%35===0)){const fx=Math.sin(p.yaw),fz=Math.cos(p.yaw);high.car.position.set(p.x,p.y+.075,p.z);high.car.rotation.set(-Math.atan2(courtyardHeightAt(p.x+fx*.1,p.z+fz*.1)-p.y,.1),p.yaw,Math.atan2(courtyardHeightAt(p.x+fz*.1,p.z-fx*.1)-p.y,.1),'YXZ');assert.ok(new T.Box3().setFromObject(high.car).max.y-p.y<2.3,'premium cat clears corridor on slopes');}
high.car.position.set(0,0,0);high.car.rotation.set(0,0,0);
const bounds=new T.Box3().setFromObject(high.car);assert.ok(bounds.max.y<2.3,'sample fits current nominal corridor envelope');
assert.ok(high.head.getObjectByName('iris').material.map);assert.ok(high.head.getObjectByName('continuous-sculpted-skull').material.bumpMap);
console.log(JSON.stringify({passed:true,highTriangles,lowTriangles,height:bounds.max.y,highStyle:high.head.userData.faceStyle,defaultStyle:low.head.userData.faceStyle}));
