import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import * as T from '../site/campus/vendor/three/build/three.module.js';
import {buildKart} from '../site/kart-model.js';
globalThis.document={createElement(){return{width:0,height:0,getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};}};
const high=buildKart(T,'cat',{faceStyle:'premium'}),low=buildKart(T,'cat',{faceStyle:'toon'});
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
const {RACERS,getRacer}=await import('../site/racer-catalog.js');
assert.equal(RACERS.length,8);assert.equal(getRacer('bunny').nickname,'邦妮');assert.equal(getRacer('meerkat').id,'bunny');
const evidence=[];
for(const racer of RACERS){const m=buildKart(T,racer.id),basic=buildKart(T,racer.id,{faceStyle:'toon'});assert.equal(m.head.userData.faceStyle,`premium-${racer.id}-${racer.id==='cat'?'v1':'v2'}`);const triangles=inspect(m);assert.ok(triangles>inspect(basic));assert.ok(triangles<300000);assert.ok(m.head.getObjectByName('instanced-short-fur'));const skin=m.head.getObjectByName('continuous-sculpted-skull');assert.ok(skin,'all racers must use a continuous sculpted skull');assert.ok(skin.geometry.attributes.position.count>10000);if(racer.id!=='cat'){assert.equal(m.head.userData.sculptRevision,2);assert.ok(m.head.userData.anatomy.muzzle>0);skin.geometry.computeBoundingBox();assert.ok(skin.geometry.boundingBox.max.z>m.head.userData.anatomy.d+m.head.userData.anatomy.muzzle*.4,'muzzle must be sculpted into the actual mesh');assert.equal(m.head.children.filter(o=>o.name==='iris').length,2);}
const height=new T.Box3().setFromObject(m.car).max.y;assert.ok(height<2.3,`${racer.id} too tall`);evidence.push({id:racer.id,triangles,height});}
const portraitManifest=JSON.parse(fs.readFileSync(new URL('../site/portraits/manifest.json',import.meta.url)));
for(const [path,hash]of Object.entries(portraitManifest.sourceHashes)){const source=fs.readFileSync(new URL('../'+path,import.meta.url),'utf8').replace(/\r\n/g,'\n').replace(/\?build=[A-Za-z0-9-]+/g,'');assert.equal(createHash('sha256').update(source).digest('hex'),hash,`Regenerate portraits after changing ${path}`);}
for(const racer of RACERS){const png=fs.readFileSync(new URL(`../site/portraits/${racer.id}.png`,import.meta.url));assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),384);assert.equal(png.readUInt32BE(20),384);}
console.log(JSON.stringify({passed:true,racers:evidence}));
