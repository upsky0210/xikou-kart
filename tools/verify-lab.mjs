import assert from 'node:assert/strict';
import * as T from '../site/campus/vendor/three/build/three.module.js';
import { buildKart } from '../site/kart-model.js';
import { LAB_DRIVE,LENGTH,BARRIERS,SAMPLES,poseAt,nearestPose,heightAt,demoInput } from '../site/lab-course.js';
import { SpatialGrid,createState,step,contacts,resetState } from '../site/drive-core.js';
globalThis.document={createElement(){return{width:0,height:0,getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};}};
const checks=[],check=(name,fn)=>{fn();checks.push(name);console.log('PASS',name);};
check('two sample heads have a continuous sculpted skull and shallow conforming eyes',()=>{
  for(const id of ['cat','beagle']){
    const model=buildKart(T,id,{faceStyle:'sculpted'}),head=model.head,skin=head.getObjectByName('animal-face');
    assert.equal(head.userData.faceStyle,'sculpted-v1');assert.equal(head.getObjectByName('continuous-muzzle'),undefined);
    model.car.updateMatrixWorld(true);let eyeCount=0;for(const o of head.children){if(o.name==='flush-eye-white'){eyeCount++;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const origin=head.localToWorld(new T.Vector3(a.getX(i),a.getY(i),a.getZ(i)+.2)),ray=new T.Raycaster(origin,new T.Vector3(0,0,-1)),hit=ray.intersectObject(skin)[0];assert.ok(hit&&hit.distance>.195&&hit.distance<.225,'eye must follow the sculpted skull within 25 mm');}}}
    assert.equal(eyeCount,2);assert.ok(skin.geometry.attributes.position.count>3000);
    skin.geometry.computeBoundingBox();assert.ok(skin.geometry.boundingBox.max.z>.37/.36,'skull has an actual sculpted nose/muzzle transition');
  }
  assert.equal(buildKart(T,'cat').head.userData.faceStyle,'premium-cat-v1','formal game uses expressive species models');
  assert.equal(buildKart(T,'beagle').head.userData.faceStyle,'premium-beagle-v1');
  assert.equal(buildKart(T,'hamster').head.userData.faceStyle,'premium-hamster-v1');
});
check('eight expressive racers have different silhouettes and batched 3D faces',()=>{
  const silhouettes=new Set();
  for(const id of ['cat','bunny','hamster','beagle','macaque','horse','sheep','boar']){
    const {car,head}=buildKart(T,id);assert.equal(head.userData.faceStyle,`premium-${id}-v1`);
    car.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(head);silhouettes.add([bounds.min.x,bounds.max.x,bounds.min.y,bounds.max.y,bounds.min.z,bounds.max.z].map(n=>n.toFixed(3)).join(','));
    assert.ok(head.children.length<=(id==='cat'?80:14),'batch facial geometry for four-car rendering');
    assert.ok(head.children.every(o=>o.geometry.attributes.position.count>0));
  }
  assert.equal(silhouettes.size,8,'each species has a distinct actual head silhouette');
});
check('loop is continuous, its 1.2 m ramps are at most 11.1 percent, and its spawn/reset poses clear rails',()=>{
  assert.ok(LENGTH>50&&LENGTH<65);assert.equal(heightAt((705-1100)/18),1.2);assert.equal(heightAt((900-1100)/18),0);
  const grid=new SpatialGrid([],BARRIERS);
  for(const p of SAMPLES){assert.equal(contacts(createState(p),grid,LAB_DRIVE).length,0);assert.ok(Math.abs(heightAt(p.x+.01)-heightAt(p.x))/.01<.111);}
  const s=createState(poseAt(8));s.x+=.4;s.z+=.3;resetState(s,nearestPose(s.x,s.z));assert.equal(contacts(s,grid,LAB_DRIVE).length,0);assert.equal(s.speed,0);
});
let evidence;
check('the full-width ribbon has no self-crossing rail at rounded corners or the start seam',()=>{
  const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
  for(let i=0;i<BARRIERS.length;i++)for(let j=i+1;j<BARRIERS.length;j++){const w=BARRIERS[i],v=BARRIERS[j],a={x:w.ax,z:w.az},b={x:w.bx,z:w.bz},c={x:v.ax,z:v.az},d={x:v.bx,z:v.bz};assert.ok(!(cross(a,b,c)*cross(a,b,d)<-1e-10&&cross(c,d,a)*cross(c,d,b)<-1e-10),`crossing rails ${i},${j}`);}
});
check('same physics drives two complete loops with no collision or lane departure',()=>{
  const s=createState(poseAt(0)),g=new SpatialGrid([],BARRIERS);let travel=0,prev=0,maxOffCentre=0,t;
  for(t=0;t<120*150;t++){step(s,demoInput(s),1/120,g,null,LAB_DRIVE);const p=nearestPose(s.x,s.z);travel+=(p.distance-prev+LENGTH*1.5)%LENGTH-LENGTH*.5;prev=p.distance;maxOffCentre=Math.max(maxOffCentre,p.error);if(travel>LENGTH*2)break;}
  assert.ok(travel>LENGTH*2);assert.equal(s.collisions,0);assert.ok(maxOffCentre<.5);evidence={metres:LENGTH,travel,seconds:t/120,collisions:s.collisions,maxOffCentre};
});
check('rails block an attempted high-speed shortcut across the course boundary',()=>{
  const g=new SpatialGrid([],BARRIERS),p=poseAt(0),s=createState({...p,yaw:Math.PI/2});for(let i=0;i<120*5;i++)step(s,{throttle:true},1/120,g,null,LAB_DRIVE);assert.ok(s.collisions>0);assert.ok(nearestPose(s.x,s.z).error<1.05);
});
console.log(JSON.stringify({checks,evidence},null,2));
