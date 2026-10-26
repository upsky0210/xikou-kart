import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildKart } from './kart-model.js?build=20261026-lab1';
import { SpatialGrid,createState,resetState,FixedSimulation,InputState,KEY_ACTION } from './drive-core.js?build=20261026-lab1';
import { world } from './track-config.js?build=20261026-lab1';
import { LAB_DRIVE,LENGTH,SAMPLES,BARRIERS,edge,heightAt,poseAt,nearestPose,demoInput } from './lab-course.js?build=20261026-lab1';

const $=q=>document.querySelector(q),canvas=$('#scene'),renderer=new T.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.setClearColor('#d8e8e6');
const scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.1,250),orbit=new OrbitControls(camera,canvas);
scene.add(new T.HemisphereLight('#fff9e8','#748c8c',1.8));const sun=new T.DirectionalLight('#fff1da',2);sun.position.set(10,18,14);scene.add(sun);
const gallery=new T.Group(),course=new T.Group();scene.add(gallery,course);course.visible=false;
function box(parent,w,h,d,x,y,z,color){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);parent.add(m);return m;}
function rect(r,y,h,color){const a=world(r.slice(0,2)),b=world(r.slice(2));return box(course,b[0]-a[0],h,b[1]-a[1],(a[0]+b[0])/2,y-h/2,(a[1]+b[1])/2,color);}
function sign(text,pixel,y,width=3){const cv=document.createElement('canvas');cv.width=768;cv.height=144;const c=cv.getContext('2d');c.fillStyle='#145d5c';c.fillRect(0,0,768,144);c.fillStyle='#fff6dc';c.font='bold 62px Microsoft JhengHei,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,384,74);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(width,width*144/768),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));const[x,z]=world(pixel);m.position.set(x,y,z);course.add(m);return m;}
const models=['cat','beagle'].map((id,i)=>{const model=buildKart(T,id,{faceStyle:'sculpted'});model.car.position.set(i?1.55:-1.55,.08,0);gallery.add(model.car);const plinth=new T.Mesh(new T.CylinderGeometry(1.37,1.48,.12,64),new T.MeshStandardMaterial({color:i?'#e7bbb0':'#c5dbb9',roughness:.7}));plinth.position.set(i?1.55:-1.55,0,0);gallery.add(plinth);return model;});
box(gallery,60,.1,60,0,-.13,0,'#d8e8e6');
rect([535,670,1065,1040],0,.15,'#e3dfcf');rect([705,690,1040,1020],.012,.02,'#a9c594');
rect([645,690,705,1015],1.2,1.2,'#e6d5ba');rect([540,690,645,1015],4.5,4.5,'#f0dfc3');
rect([640,690,645,1015],2.4,1.2,'#f8efdc');rect([705,795,710,905],1.9,.7,'#77b5ad');
for(let y=705;y<1015;y+=65){const a=world([643,y]);box(course,.06,.8,1.7,a[0],2.8,a[1],'#789b9c');}
// The pond remains in its real plan position, outside the driveable ribbon.
rect([710,783,764,867],.05,.07,'#609fa9');
for(const pixel of [[835,810],[910,890],[1030,820],[785,865]]){const[x,z]=world(pixel);box(course,.2,1.3,.2,x,.65,z,'#9a8060');const m=new T.Mesh(new T.SphereGeometry(.8,14,10),new T.MeshStandardMaterial({color:'#659d79'}));m.position.set(x,1.7,z);course.add(m);}
const pos=[],indices=[];
for(let i=0;i<=SAMPLES.length;i++){const p=SAMPLES[i%SAMPLES.length];for(const side of[-1,1]){const q=edge(p,side);pos.push(q.x,heightAt(q.x)+.045,q.z);}if(i){const n=i*2;indices.push(n-2,n,n-1,n-1,n,n+1);}}
const road=new T.BufferGeometry();road.setAttribute('position',new T.Float32BufferAttribute(pos,3));road.setIndex(indices);road.computeVertexNormals();course.add(new T.Mesh(road,new T.MeshStandardMaterial({color:'#557577',side:T.DoubleSide,roughness:.94})));
for(let d=0;d<LENGTH;d+=2){const p=poseAt(d),dash=box(course,.08,.018,.65,p.x,p.y+.072,p.z,'#ffe9a1');dash.rotation.y=p.yaw;dash.rotation.x=-Math.atan2(heightAt(p.x+Math.sin(p.yaw)*.1)-p.y,.1);}
// Low soft rails prevent falls from the ramp and stop the kart entering scenery.
const rails=new T.InstancedMesh(new T.CylinderGeometry(.075,.075,1,6),new T.MeshStandardMaterial({color:'#f3cc82'}),BARRIERS.length),railPose=new T.Object3D();
for(let i=0;i<BARRIERS.length;i++){const w=BARRIERS[i],a=new T.Vector3(w.ax,heightAt(w.ax)+.26,w.az),b=new T.Vector3(w.bx,heightAt(w.bx)+.26,w.bz),v=b.clone().sub(a);railPose.position.copy(a).add(b).multiplyScalar(.5);railPose.scale.set(1,v.length(),1);railPose.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());railPose.updateMatrix();rails.setMatrixAt(i,railPose.matrix);}course.add(rails);
sign('西側走廊',[672,700],3.1,3.1);sign('中庭試駕',[948,790],2.2,3.1);sign('緩坡・慢行',[813,718],1.8,2.7);
const start=poseAt(0),state=createState(start),grid=new SpatialGrid([],BARRIERS),simulation=new FixedSimulation(state,grid,null,LAB_DRIVE),input=new InputState();
for(let i=0;i<8;i++){const x=start.x+(i-3.5)*.35;box(course,.35,.015,.32,x,heightAt(x)+.08,start.z,i%2?'#f3eed9':'#234c50');}
let selected=0,view='gallery',paused=false,demo=false,laps=0,previousDistance=0,travel=0,last=performance.now(),lastReport=0;
const kart=buildKart(T,'cat',{faceStyle:'sculpted'});kart.car.position.set(start.x,start.y+.075,start.z);course.add(kart.car);let driver=kart;
function clear(){input.clear();document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));simulation.clear();}
function reset(){const p=nearestPose(state.x,state.z);resetState(state,p);clear();previousDistance=p.distance;travel=0;}
function setView(next){clear();view=next;demo=false;paused=false;gallery.visible=next==='gallery';course.visible=next!=='gallery';orbit.enabled=next!=='drive';$('#labels').hidden=next!=='gallery';$('#touch').hidden=next!=='drive';document.body.classList.toggle('driving',next==='drive');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===next));$('#pause').textContent='暫停（P）';$('#demo').textContent='看路線示範';
  if(next==='gallery'){camera.position.set(4.3,3.05,7.3);orbit.target.set(-.65,1.05,0);orbit.minDistance=2.5;orbit.maxDistance=14;$('#title').textContent='兩位車手，換個表情。';$('#description').textContent='拖曳旋轉、滾輪或雙指縮放。眼睛貼合頭骨，口鼻由一個柔和體塊銜接。';}
  else{const[x,z]=world([820,850]);camera.position.set(x,36,z+9);orbit.target.set(x,.5,z);orbit.minDistance=8;orbit.maxDistance=65;$('#title').textContent='走廊，通往中庭。';$('#description').textContent='西側走廊 → 緩坡進中庭 → 回到走廊。WASD／方向鍵，R 回路線，P 暫停。';}
  camera.fov=next==='drive'?52:42;camera.updateProjectionMatrix();$('#reset').hidden=next==='gallery';$('#pause').hidden=next!=='drive';$('#faceClose').hidden=next!=='gallery';orbit.update();if(next==='drive'){resetState(state,start);previousDistance=0;travel=0;laps=0;camera.position.set(start.x, start.y+4.3,start.z+5);}
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.querySelectorAll('[data-racer]').forEach((b,i)=>b.onclick=()=>{selected=i;document.querySelectorAll('[data-racer]').forEach((q,j)=>q.setAttribute('aria-pressed',String(i===j)));course.remove(driver.car);driver.car.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material])){m.map?.dispose();m.dispose();}}});driver=buildKart(T,i?'beagle':'cat',{faceStyle:'sculpted'});driver.car.position.set(state.x,heightAt(state.x)+.075,state.z);driver.car.rotation.y=state.yaw;course.add(driver.car);});
$('#faceClose').onclick=()=>{const x=selected?1.55:-1.55;orbit.minDistance=.7;orbit.target.set(x-.12,1.48,.05);camera.position.set(x+.7,1.85,2.0);orbit.update();$('#labels').hidden=true;};
function togglePause(){if(view!=='drive')return;paused=!paused;clear();$('#pause').textContent=paused?'繼續（P）':'暫停（P）';}
$('#reset').onclick=reset;$('#pause').onclick=togglePause;$('#demo').onclick=()=>{if(view!=='drive')setView('drive');demo=!demo;if(demo){paused=false;$('#pause').textContent='暫停（P）';}clear();$('#demo').textContent=demo?'停止示範・自己開':'看路線示範';};
addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(KEY_ACTION[e.code]){e.preventDefault();if(view==='drive'&&!paused){demo=false;$('#demo').textContent='看路線示範';input.set(e.code,KEY_ACTION[e.code]);}}if(!e.repeat&&e.code==='KeyR')reset();if(!e.repeat&&(e.code==='KeyP'||e.code==='Escape'))togglePause();});
addEventListener('keyup',e=>input.set(e.code,null));addEventListener('blur',()=>{if(view==='drive'&&!paused)togglePause();else clear();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&view==='drive'&&!paused)togglePause();});
for(const b of document.querySelectorAll('[data-action]')){b.onpointerdown=e=>{e.preventDefault();if(paused)return;demo=false;$('#demo').textContent='看路線示範';b.setPointerCapture(e.pointerId);input.set(`touch${e.pointerId}`,b.dataset.action);b.classList.add('held');};const release=e=>{input.set(`touch${e.pointerId}`,null);b.classList.remove('held');};b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();setView('gallery');
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.15);last=now;
  if(view==='drive'&&!paused){simulation.advance(dt,demo?demoInput:input.value());const p=nearestPose(state.x,state.z),delta=p.distance-previousDistance;const forward=(delta+LENGTH*1.5)%LENGTH-LENGTH*.5;travel+=forward;if(previousDistance>LENGTH*.8&&p.distance<LENGTH*.2&&travel>LENGTH*.85){laps++;travel=0;}previousDistance=p.distance;
    const y=heightAt(state.x);driver.car.position.set(state.x,y+.075,state.z);driver.car.rotation.set(0,state.yaw,0,'YXZ');driver.car.rotation.x=-Math.atan2(heightAt(state.x+Math.sin(state.yaw)*.1)-y,.1);driver.car.rotation.z=Math.atan2(heightAt(state.x+Math.cos(state.yaw)*.1)-y,.1);
    for(const w of driver.wheels){w.tire.rotation.x+=state.speed*dt/.28;if(w.front)w.pivot.rotation.y=state.steering;}driver.steeringWheel.rotation.z=-state.steering;
    const target=new T.Vector3(state.x-Math.sin(state.yaw)*5,y+4.3,state.z-Math.cos(state.yaw)*5);camera.position.lerp(target,1-Math.exp(-5*dt));camera.lookAt(state.x+Math.sin(state.yaw)*1.6,y+.9,state.z+Math.cos(state.yaw)*1.6);
  }else if(orbit.enabled)orbit.update();
  renderer.render(scene,camera);
  if(now-lastReport>180){lastReport=now;const p=nearestPose(state.x,state.z),floor=heightAt(state.x);$('#status').textContent=view==='gallery'?'橘貓 × 米格魯 ｜ 可旋轉檢視':`${paused?'已暫停 ｜ ':demo?'路線示範 ｜ ':''}${(Math.abs(state.speed)*3.6).toFixed(0)} km/h · 已繞 ${laps} 圈 · ${floor>.8?'西側走廊':floor>.1?'緩坡':'中庭'}`;$('#hint').textContent=view==='gallery'?'淺眼窩・連續口鼻・柔和輪廓 ｜ 拖曳看側面':`約 ${Math.round(LENGTH)} 公尺 · 低速試駕 ｜ 方向鍵 / WASD · R 回路線 · P 暫停`;$('#lab-state').textContent=JSON.stringify({ready:true,view,racer:selected?'beagle':'cat',faceStyle:'sculpted-v1',demo,paused,laps,speed:state.speed,x:state.x,z:state.z,y:floor,progress:p.distance/LENGTH,offCentre:p.error,collisions:state.collisions,routeLength:LENGTH,drawCalls:renderer.info.render.calls});}
}requestAnimationFrame(animate);
if(new URLSearchParams(location.search).get('view')==='drive')setView('drive');
