import { RACERS } from './racer-catalog.js?build=20261026-courtyard6';
import { Opponent, fleetPosition } from './opponent-core.js?build=20261026-courtyard6';
import { ACTIVE_ROUTE, LAPS, ROUTE_ID } from './session-config.js?build=20261026-courtyard6';
import { buildKart } from './kart-model.js?build=20261026-courtyard6';
import { prepareStaticScene } from './scene-utils.js?build=20261026-courtyard6';
import { DRIVE, SPAWNS } from './drive-config.js?build=20261026-courtyard6';
import { ROUTES, world, pointAt, lengthMetres, roadWidthAt } from './track-config.js?build=20261026-courtyard6';
import { InputState, KEY_ACTION, SpatialGrid, createState, resetState, contacts, FixedSimulation } from './drive-core.js?build=20261026-courtyard6';
import { RaceSession, makeGates } from './race-core.js?build=20261026-courtyard6';
import { buildRaceDecor } from './race-decor.js?build=20261026-courtyard6';
import { GhostRecorder, validGhost, ghostPose } from './ghost-core.js?build=20261026-courtyard6';
import { cancelDrift } from './effects-core.js?build=20261026-courtyard6';
import { courtyardHeightAt,COURTYARD_RAILS,nearestOnCourtyard } from './courtyard-route.js?build=20261026-courtyard6';
import { COURTYARD_DRIVE,ElevationGrid,wallHeight,addCourtyardRails } from './courtyard-world.js?build=20261026-courtyard6';

export function initScene(api){
  const {THREE:T,scene,renderer,camera,orbit,floors,rooms}=api;
  const elevated=ROUTE_ID==='courtyard',cfg=elevated?COURTYARD_DRIVE:DRIVE,heightAt=elevated?courtyardHeightAt:()=>0;
  if(elevated)floors.find(f=>f.id==='1F').ceil.visible=true;
  const optimization=prepareStaticScene(T,scene);
  renderer.shadowMap.enabled=false;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
  orbit.enabled=false;camera.fov=58;camera.updateProjectionMatrix();
  const send=(type,data={})=>parent.postMessage({source:'kart-drive',type,...data},location.origin);
  const f1=floors.find(f=>f.id==='1F'),D=window.CAMPUS;
  const boxRect=rect=>{const[x1,z1]=world(rect.slice(0,2)),[x2,z2]=world(rect.slice(2,4));return{x1,z1,x2,z2};};
  const obstacles=f1.boxes.filter(b=>b.y1<(elevated?4.5:DRIVE.carHeight)&&b.y2>.15);
  // Raised first-floor footprints block a ground-level kart, even where a person can walk.
  for(const w of f1.walk)if(w.kind!=='outdoor'&&w.kind!=='stair'&&w.room?.type!=='garden')obstacles.push({...w.m,kind:'platform',y1:0,y2:w.room?.ground ? .01 : 1.21});
  if(elevated)for(const r of f1.ceilRects||[])obstacles.push({...r,y1:4.2,y2:4.5,kind:'ceiling'});
  for(const s of D.stairs)obstacles.push({...boxRect(s.rect),kind:'stairs'});
  for(const k of['stage','pool','pond'])if(D.outdoor[k])obstacles.push({...boxRect(D.outdoor[k]),kind:k});
  const walls=f1.segs.filter(s=>s.h>.15).map(s=>elevated?wallHeight(s):s);
  if(elevated){walls.push(...COURTYARD_RAILS);addCourtyardRails(T,scene);}
  const bounds={x1:api.mx(300)-13,z1:api.mz(40)-13,x2:api.mx(D.outdoor.wall.x2)+13,z2:api.mz(D.outdoor.wall.y2)+13};
  const staticCameraBoxes=f1.boxes.filter(b=>b.y2>.3&&b.y1<15).map(b=>new T.Box3(new T.Vector3(b.x1,b.y1,b.z1),new T.Vector3(b.x2,b.y2,b.z2)));
  for(const w of f1.walk)if(w.kind!=='outdoor'&&w.kind!=='stair'&&w.room?.type!=='garden')staticCameraBoxes.push(new T.Box3(new T.Vector3(w.m.x1,0,w.m.z1),new T.Vector3(w.m.x2,elevated?1.21:20,w.m.z2)));
  for(const w of walls)if(w.kind!=='route-rail')staticCameraBoxes.push(new T.Box3(new T.Vector3(Math.min(w.ax,w.bx)-.16,elevated?w.y1:0,Math.min(w.az,w.bz)-.16),new T.Vector3(Math.max(w.ax,w.bx)+.16,elevated?w.y2:w.h+1.2,Math.max(w.az,w.bz)+.16)));
  if(elevated)for(const r of f1.ceilRects||[])staticCameraBoxes.push(new T.Box3(new T.Vector3(r.x1,4.2,r.z1),new T.Vector3(r.x2,4.8,r.z2)));

  function box(parent,w,h,d,x,y,z,color){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshLambertMaterial({color}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  const route=ACTIVE_ROUTE;
  const positions=[],indices=[];
  for(let i=0;i<route.points.length;i++){
    const prev=route.points[i?i-1:route.points.length-2],next=route.points[(i+1)%(route.points.length-1)],len=Math.hypot(next[0]-prev[0],next[1]-prev[1]);
    const nx=-(next[1]-prev[1])/len,nz=(next[0]-prev[0])/len,[x,z]=world(route.points[i]);
    const halfWidth=roadWidthAt(route,route.points[i])/2;
    positions.push(x+nx*halfWidth,heightAt(x+nx*halfWidth,z+nz*halfWidth)+.075,z+nz*halfWidth,x-nx*halfWidth,heightAt(x-nx*halfWidth,z-nz*halfWidth)+.075,z-nz*halfWidth);
    if(i){const j=i*2;indices.push(j-2,j-1,j,j-1,j+1,j);}
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  scene.add(new T.Mesh(geometry,new T.MeshLambertMaterial({color:'#405967',side:T.DoubleSide})));
  const count=Math.floor(lengthMetres(route.points)/4),dashes=new T.InstancedMesh(new T.BoxGeometry(.11,.02,1.5),new T.MeshBasicMaterial({color:'#f3d78c'}),count),dummy=new T.Object3D();
  for(let i=0;i<count;i++){const p=pointAt(route.points,i/count),q=pointAt(route.points,i/count+.002),[x,z]=world(p);dummy.position.set(x,heightAt(x,z)+.102,z);const yaw=Math.atan2(q[0]-p[0],q[1]-p[1]),slope=(heightAt(x+Math.sin(yaw)*.1,z+Math.cos(yaw)*.1)-heightAt(x,z))/.1;dummy.rotation.set(-Math.atan(slope),yaw,0,'YXZ');dummy.updateMatrix();dashes.setMatrixAt(i,dummy.matrix);}
  scene.add(dashes);
  const arrowGeometry=new T.BufferGeometry();arrowGeometry.setAttribute('position',new T.Float32BufferAttribute([0,0,.7,-.35,0,-.25,.35,0,-.25],3));arrowGeometry.computeVertexNormals();
  const arrows=new T.InstancedMesh(arrowGeometry,new T.MeshBasicMaterial({color:'#fff5be',side:T.DoubleSide}),12);
  for(let i=0;i<12;i++){const p=pointAt(route.points,(i+.5)/12),q=pointAt(route.points,(i+.5)/12+.003),[x,z]=world(p);dummy.position.set(x,heightAt(x,z)+.13,z);dummy.rotation.set(0,Math.atan2(q[0]-p[0],q[1]-p[1]),0);dummy.scale.set(1,1,1);dummy.updateMatrix();arrows.setMatrixAt(i,dummy.matrix);}
  scene.add(arrows);
  const[sx,sz]=world(route.points[0]),arch=new T.Group();scene.add(arch);
  for(const sign of[-1,1]){
    box(arch,.35,3.6,.35,sx,1.8,sz+sign*2.65,'#f2e7c5');
    box(arch,.5,.6,.5,sx,.3,sz+sign*2.65,'#008f8c');
    obstacles.push({x1:sx-.3,x2:sx+.3,z1:sz+sign*2.65-.3,z2:sz+sign*2.65+.3,kind:'arch'});
    staticCameraBoxes.push(new T.Box3(new T.Vector3(sx-.3,0,sz+sign*2.65-.3),new T.Vector3(sx+.3,3.8,sz+sign*2.65+.3)));
  }
  box(arch,.45,.7,5.6,sx,3.8,sz,'#12666a');
  // The overhead sign blocks the follow camera, while the kart passes below it.
  staticCameraBoxes.push(new T.Box3(new T.Vector3(sx-.3,3.4,sz-2.8),new T.Vector3(sx+.3,4.2,sz+2.8)));
  const signCanvas=document.createElement('canvas');signCanvas.width=768;signCanvas.height=112;const sc=signCanvas.getContext('2d');sc.fillStyle='#12666a';sc.fillRect(0,0,768,112);sc.fillStyle='#fff2c3';sc.font='bold 52px "Microsoft JhengHei",sans-serif';sc.textAlign='center';sc.textBaseline='middle';sc.fillText('溪口卡丁車  /  起終點',384,56);
  const signTexture=new T.CanvasTexture(signCanvas);signTexture.colorSpace=T.SRGBColorSpace;
  const signMesh=new T.Mesh(new T.PlaneGeometry(5.3,.7),new T.MeshBasicMaterial({map:signTexture}));signMesh.rotation.y=-Math.PI/2;signMesh.position.set(sx-.24,3.8,sz);arch.add(signMesh);
  const backSign=signMesh.clone();backSign.rotation.y=Math.PI/2;backSign.position.x=sx+.24;arch.add(backSign);
  const startStripe=new T.InstancedMesh(new T.BoxGeometry(.34,.02,.5),new T.MeshBasicMaterial({color:'#fff6db'}),8);
  for(let i=0;i<8;i++){dummy.rotation.set(0,0,0);dummy.position.set(sx,.115,sz-1.75+i*.5);dummy.updateMatrix();startStripe.setMatrixAt(i,dummy.matrix);}scene.add(startStripe);

  buildRaceDecor(T,scene,obstacles,walls,staticCameraBoxes);
  const grid=elevated?new ElevationGrid(obstacles,walls):new SpatialGrid(obstacles,walls),spawns=Object.fromEntries(Object.entries(SPAWNS).map(([k,v])=>{const[x,z]=world(v.pixel);return[k,{x,z,yaw:v.yaw}];}));
  if(elevated){spawns.north={...nearestOnCourtyard(...world([675,1100]))};spawns.east={...nearestOnCourtyard(...world([1100,825]))};}
  let spawnId='field',safe={...spawns.field},safeDistance=0,playing=false,paused=false,collisionUntil=0;
  let duel=false,opponents=[],rivalModels=[];
  let mode='practice',race=null,finishSent=false,qaDriver=null,sessionName='訪客';
  let recorder=null,bestGhost=null,showGhost=true,previewOrbit=false,garage=false,garageStart=0;
  const gates=makeGates(),gateMarkers=gates.map(g=>{
    const mesh=new T.Group(),material=new T.MeshBasicMaterial({color:'#8ae4c4',transparent:true,opacity:.14,side:T.DoubleSide,depthWrite:false});
    const gh=elevated&&heightAt(g.x,g.z)>.9?2.55:3.8,gw=elevated?Math.min(g.halfWidth,roadWidthAt(route,[g.x*18+1100,g.z*18+700])/2+.1):g.halfWidth;
    const sheet=new T.Mesh(new T.PlaneGeometry(gw*2,gh),material);sheet.position.y=gh/2;mesh.add(sheet);
    const frameMaterial=new T.MeshBasicMaterial({color:'#fff0a8'});
    for(const x of [-gw,gw]){const post=new T.Mesh(new T.BoxGeometry(.10,gh,.10),frameMaterial);post.position.set(x,gh/2,0);mesh.add(post);}
    const top=new T.Mesh(new T.BoxGeometry(gw*2,.10,.10),frameMaterial);top.position.y=gh;mesh.add(top);
    const floor=new T.Mesh(new T.BoxGeometry(gw*2,.025,1.4),new T.MeshBasicMaterial({color:'#b8efda',transparent:true,opacity:.28,depthWrite:false}));floor.position.y=.13;mesh.add(floor);
    mesh.rotation.y=Math.atan2(g.fx,g.fz);mesh.position.set(g.x,heightAt(g.x,g.z),g.z);mesh.visible=false;scene.add(mesh);return mesh;
  });
  const state=createState(spawns.field),simulation=new FixedSimulation(state,grid,bounds,cfg),local=new InputState();let remote={};
  let {car,body,wheels,steeringWheel,driver,head,profile}=buildKart(T);scene.add(car);
  const shadow=new T.Mesh(new T.CircleGeometry(.90,32),new T.MeshBasicMaterial({color:'#1b2e37',transparent:true,opacity:.19,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.125;shadow.scale.set(.85,1.25,1);scene.add(shadow);
  let ghostModel=car.clone(true);const ghostMaterial=new T.MeshBasicMaterial({color:'#75e9ec',transparent:true,opacity:.28,depthWrite:false});
  ghostModel.traverse(o=>{if(o.isMesh)o.material=ghostMaterial;});ghostModel.visible=false;scene.add(ghostModel);
  const flames=[];
  for(const x of[-.32,.32]){const flame=new T.Mesh(new T.ConeGeometry(.15,.65,7),new T.MeshBasicMaterial({color:'#ffc45c'}));flame.name='boost-flame';flame.rotation.x=-Math.PI/2;flame.position.set(x,.39,-1.23);car.add(flame);flames.push(flame);}
  function selectRacer(id,preview=false){
    if(id!==profile.id){
      const old=car;for(const f of flames)old.remove(f);old.removeFromParent();ghostModel.removeFromParent();
      const geometries=new Set(),materials=new Set();old.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material);}});
      for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}
      ({car,body,wheels,steeringWheel,driver,head,profile}=buildKart(T,id));scene.add(car);for(const f of flames)car.add(f);
      ghostModel=car.clone(true);for(const o of [...ghostModel.children])if(o.name==='boost-flame')o.removeFromParent();
      ghostModel.traverse(o=>{if(o.isMesh)o.material=ghostMaterial;});ghostModel.visible=false;scene.add(ghostModel);
    }
    if(preview){garage=true;garageStart=performance.now();previewOrbit=false;}
  }
  const sparkCount=24,spark=new T.InstancedMesh(new T.SphereGeometry(.05,4,3),new T.MeshBasicMaterial({color:'#ffe19a'}),sparkCount),sparkDummy=new T.Object3D();scene.add(spark);spark.visible=false;
  const sparkHistory=[];let lastSpark=0;

  function input(){return Object.fromEntries(['throttle','brake','left','right','handbrake'].map(k=>[k,!!local.value()[k]||!!remote[k]]));}
  function clearInputs(){local.clear();remote={};simulation.clear();cancelDrift(state);}
  const trackSafe=[];
  for(let i=0;i<120;i++){
    const p=pointAt(route.points,i/120),q=pointAt(route.points,i/120+.001),[x,z]=world(p);
    const pose={x,z,yaw:Math.atan2(q[0]-p[0],q[1]-p[1])};
    if(!contacts(createState(pose),grid,cfg).length)trackSafe.push(pose);
  }
  function reset(full=false){
    clearInputs();
    if(race?.phase==='finished'&&!full)return;
    const destination=!full&&mode==='race'&&race?race.resetPose():full?spawns[spawnId]:(spawnId==='field'||elevated)?trackSafe.reduce((best,p)=>Math.hypot(p.x-state.x,p.z-state.z)<Math.hypot(best.x-state.x,best.z-state.z)?p:best,trackSafe[0]||spawns.field):safe;
    resetState(state,destination);safeDistance=0;collisionUntil=0;cameraSnap=true;send('reset',{spawn:SPAWNS[spawnId].label,initial:full});
    if(!full&&recorder&&race?.phase==='racing')recorder.record(race.elapsed,state,true,true);
  }
  function setPause(value){paused=value;clearInputs();last=performance.now();send('pause',{paused});}
  function setSpawn(id){if(!spawns[id])return;spawnId=id;safe={...spawns[id]};safeDistance=0;reset(true);}
  async function startSession(nextMode='race',name=sessionName,qa=false,ghost=bestGhost,qaSpeed=7.6,withRival=false){
    duel=!!withRival;opponents=[];for(const model of rivalModels)model.car.visible=false;
    mode=nextMode==='practice'?'practice':'race';sessionName=name;race=null;finishSent=false;qaDriver=null;recorder=null;bestGhost=validGhost(ghost,name);previewOrbit=false;garage=false;
    setSpawn(mode==='race'?'field':spawnId);
    if(mode==='race'){
      const id=`${Date.now()}-${Math.random().toString(36).slice(2)}`;
      race=new RaceSession({laps:LAPS,gates,name:sessionName,id}).begin();
      recorder=new GhostRecorder();
      if(duel){
        const racers=RACERS.filter(r=>r.id!==profile.id).slice(0,3);
        for(let i=0;i<3;i++){
          if(rivalModels[i]?.profile.id!==racers[i].id){
            const old=rivalModels[i]?.car;if(old){old.removeFromParent();const gs=new Set(),ms=new Set();old.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material);}});for(const g of gs)g.dispose();for(const m of ms){m.map?.dispose();m.dispose();}}
            rivalModels[i]=buildKart(T,racers[i].id);scene.add(rivalModels[i].car);
          }
          rivalModels[i].car.visible=true;
          opponents.push(new Opponent({gates,laps:LAPS,grid,bounds,cfg,route,index:i}));
        }
      }
      state.x=gates[0].x-gates[0].fx*3;state.z=gates[0].z-gates[0].fz*3;state.yaw=Math.atan2(gates[0].fx,gates[0].fz);
      if(qa){const module=await import('./qa-driver.js?build=20261026-courtyard6');qaDriver=s=>module.regressionInput(s,Math.max(5.5,Math.min(7.6,qaSpeed)),route);}
    }
    playing=true;cameraSnap=true;setPause(false);send('started',{mode});
  }
  addEventListener('keydown',e=>{
    if(KEY_ACTION[e.code]){e.preventDefault();if(playing&&!paused&&race?.phase!=='finished')local.set(e.code,KEY_ACTION[e.code]);}
    if(e.repeat)return;
    if(e.code==='KeyR')reset();
    if(e.code==='Escape'||e.code==='KeyP')setPause(!paused);
    if(e.code==='Enter'){if(paused)setPause(false);else startSession(mode,sessionName,!!qaDriver,bestGhost,7.6,duel);}
  });
  addEventListener('keyup',e=>{if(KEY_ACTION[e.code]){e.preventDefault();local.set(e.code,null);}});
  addEventListener('blur',clearInputs);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)setPause(true);});
  addEventListener('message',e=>{
    if(e.source!==parent||e.origin!==location.origin||e.data?.source!=='kart-controls')return;
    const m=e.data;
    if(m.type==='input')remote=playing&&!paused&&race?.phase!=='finished'?m.input:{};
    if(m.type==='racer'&&!playing)selectRacer(m.id,m.preview!==false);
    if(m.type==='start'){selectRacer(m.racer||profile.id);showGhost=m.ghostVisible!==false;startSession(m.mode,m.name,!!m.qa,m.ghost,m.qaSpeed,m.duel);}
    if(m.type==='pause')setPause(!!m.paused);
    if(m.type==='reset')reset();
    if(m.type==='spawn'&&mode==='practice')setSpawn(m.id);
    if(m.type==='clear')clearInputs();
    if(m.type==='restart')startSession(mode,sessionName,!!m.qa,bestGhost,7.6,duel);
    if(m.type==='menu'){playing=false;paused=false;opponents=[];for(const model of rivalModels)model.car.visible=false;state.speed=0;state.steering=0;race=null;qaDriver=null;recorder=null;bestGhost=null;clearInputs();send('menu');}
    if(m.type==='ghostVisibility')showGhost=!!m.visible;
    if(m.type==='preview'){previewOrbit=!!m.active;garage=false;}
    if(m.type==='garage'){garage=true;garageStart=performance.now();previewOrbit=false;}
  });

  let cameraSnap=true,last=performance.now(),lastSend=0,lastMetrics=0,samples=[],qualityFrames=0,qualityTime=0,qualityRatio=Math.min(devicePixelRatio,1.5);
  const target=new T.Vector3(),desired=new T.Vector3(),direction=new T.Vector3(),hit=new T.Vector3(),ray=new T.Ray();
  function constrainCamera(point){
    direction.copy(point).sub(target);const len=direction.length();if(len<.01)return point;
    ray.set(target,direction.divideScalar(len));let nearest=len;
    for(const b of staticCameraBoxes)if(ray.intersectBox(b,hit)){const d=hit.distanceTo(target);if(d>.05)nearest=Math.min(nearest,Math.max(elevated?.15:.9,d-.28));}
    return point.copy(target).addScaledVector(direction,nearest);
  }
  function updateCamera(dt){
    const y=heightAt(state.x,state.z),covered=elevated&&(f1.ceilRects||[]).some(r=>state.x>=r.x1-.6&&state.x<=r.x2+.6&&state.z>=r.z1-.6&&state.z<=r.z2+.6);
    const fx=Math.sin(state.yaw),fz=Math.cos(state.yaw),distance=covered?4:DRIVE.cameraDistance+Math.abs(state.speed)*.07;
    const fov=covered?68:58;if(Math.abs(camera.fov-fov)>.1){camera.fov+=(fov-camera.fov)*Math.min(1,dt*7);camera.updateProjectionMatrix();}
    target.set(state.x,y+1.05,state.z);
    desired.set(state.x-fx*distance,y+(covered?2.55:DRIVE.cameraHeight+Math.abs(state.speed)*.025),state.z-fz*distance);constrainCamera(desired);
    if(cameraSnap){camera.position.copy(desired);cameraSnap=false;}else camera.position.lerp(desired,1-Math.exp(-DRIVE.cameraSmoothing*dt));
    constrainCamera(camera.position);camera.lookAt(state.x+fx*(covered?1:2),y+1.0,state.z+fz*(covered?1:2));
  }
  const report={route:ROUTE_ID,laps:LAPS,layout:D.layoutVersion,layoutBounds:D.outdoor.wall,northGap:D.outdoor.northGap??null,optimization,obstacles,walls,bounds,spawns,config:Object.fromEntries(Object.entries(cfg).filter(([,v])=>typeof v!=='function')),...(elevated?{sourceBoxes:f1.boxes,ceilings:f1.ceilRects,platforms:f1.walk.filter(w=>w.kind!=='outdoor').map(w=>({bounds:w.m,kind:w.kind,name:w.room?.name}))}:{})};
  const data=document.createElement('script');data.type='application/json';data.id='drive-world';data.textContent=JSON.stringify(report);document.body.append(data);
  send('ready',{layout:D.layoutVersion,report});
  function advanceRace(seconds){
    for(const opponent of opponents)opponent.advance(seconds);
    const previousPhase=race.phase;
    const span=race.advance(seconds);
    if(previousPhase==='countdown'&&race.phase==='racing')recorder?.record(0,state,false,true);
    simulation.advance(span.driveSeconds,qaDriver&&race.phase==='racing'?qaDriver:input(),(from,to,a,b)=>{
      const finished=race.observeMove(from,to,span.fromTime+(span.toTime-span.fromTime)*a,span.fromTime+(span.toTime-span.fromTime)*b);
      recorder?.record(finished?race.elapsed:span.fromTime+(span.toTime-span.fromTime)*b,state,false,finished);
      if(finished){state.speed=0;clearInputs();return false;}
    });
  }
  function loop(now){
    requestAnimationFrame(loop);const elapsed=(now-last)/1000;last=now;
    if(document.hidden){simulation.clear();return;}
    if(playing&&!paused){
      if(mode==='race'&&race){
        // Regression-only catch-up keeps the automated test moving even if the
        // embedded test tab is throttled. Normal player input retains M1's cap.
        if(qaDriver){let remaining=Math.min(elapsed,5);while(remaining>1e-8&&race.phase!=='finished'){const chunk=Math.min(remaining,DRIVE.maxFrameTime);advanceRace(chunk);remaining-=chunk;}}
        else advanceRace(elapsed);
        if(race.phase==='finished'&&!finishSent){finishSent=true;const result=race.result();send('finished',{result,race:race.snapshot(),recording:recorder?.finish(result,state),qa:!!qaDriver,competition:opponents.length?{position:fleetPosition(race,state,opponents),total:opponents.length+1}:null});}
      }else simulation.advance(elapsed,input());
      if(state.collisionPulse>0)collisionUntil=now+220;
      if(state.distance-safeDistance>DRIVE.resetDistance&&!state.collisionPulse&&!contacts(state,grid,cfg).length){safe={x:state.x,z:state.z,yaw:state.yaw};safeDistance=state.distance;}
    }else simulation.clear();
    gateMarkers.forEach((mesh,i)=>{mesh.visible=playing&&mode==='race'&&race?.phase!=='finished'&&i===(race?.expected??0)%gates.length;});
    for(let i=0;i<opponents.length;i++){const rivalModel=rivalModels[i],r=opponents[i].state,y=heightAt(r.x,r.z),fx=Math.sin(r.yaw),fz=Math.cos(r.yaw);rivalModel.car.position.set(r.x,y+.075,r.z);rivalModel.car.rotation.set(-Math.atan2(heightAt(r.x+fx*.1,r.z+fz*.1)-y,.1),r.yaw,Math.atan2(heightAt(r.x+fz*.1,r.z-fx*.1)-y,.1),'YXZ');for(const w of rivalModel.wheels){w.pivot.rotation.y=w.front?r.steering:0;w.tire.rotation.x+=r.speed*Math.min(elapsed,.1)/.27;w.hub.rotation.x=w.tire.rotation.x;}}
    const floorY=heightAt(state.x,state.z);state.groundHeight=floorY;
    car.position.set(state.x,floorY+.075,state.z);car.rotation.set(0,state.yaw,0,'YXZ');
    if(elevated){const fx=Math.sin(state.yaw),fz=Math.cos(state.yaw);car.rotation.x=-Math.atan2(heightAt(state.x+fx*.1,state.z+fz*.1)-floorY,.1);car.rotation.z=Math.atan2(heightAt(state.x+fz*.1,state.z-fx*.1)-floorY,.1);}
    shadow.position.set(state.x,floorY+.125,state.z);shadow.rotation.z=-state.yaw;
    for(const flame of flames){flame.visible=playing&&!paused&&state.boostRemaining>0;flame.scale.y=.9+Math.sin(now*.025)*.12;}
    if(state.drifting&&now-lastSpark>45){sparkHistory.unshift({x:state.x-Math.sin(state.yaw)*.65,z:state.z-Math.cos(state.yaw)*.65,t:now});lastSpark=now;}
    while(sparkHistory.length>sparkCount||sparkHistory.length&&now-sparkHistory.at(-1).t>350)sparkHistory.pop();
    spark.visible=sparkHistory.length>0;for(let i=0;i<sparkCount;i++){const p=sparkHistory[i];sparkDummy.position.set(p?.x??0,.19,p?.z??0);sparkDummy.scale.setScalar(p?Math.max(0,1-(now-p.t)/350):0);sparkDummy.updateMatrix();spark.setMatrixAt(i,sparkDummy.matrix);}spark.instanceMatrix.needsUpdate=true;
    const ghost=playing&&mode==='race'&&race&&bestGhost&&showGhost?ghostPose(bestGhost,race.phase==='countdown'?0:race.elapsed):null;
    ghostModel.visible=!!ghost;if(ghost){ghostModel.position.set(ghost.x,heightAt(ghost.x,ghost.z)+.075,ghost.z);ghostModel.rotation.set(0,ghost.yaw,0,'YXZ');if(elevated){const y=heightAt(ghost.x,ghost.z),fx=Math.sin(ghost.yaw),fz=Math.cos(ghost.yaw);ghostModel.rotation.x=-Math.atan2(heightAt(ghost.x+fx*.1,ghost.z+fz*.1)-y,.1);ghostModel.rotation.z=Math.atan2(heightAt(ghost.x+fz*.1,ghost.z-fx*.1)-y,.1);}}
    body.material.color.set(now<collisionUntil?'#e98758':profile.paint);
    for(const w of wheels){if(w.front)w.pivot.rotation.y=state.steering;w.tire.rotation.x+=state.speed*Math.min(elapsed,.1)/.27;w.hub.rotation.x=w.tire.rotation.x;}
    steeringWheel.rotation.z=-state.steering;driver.rotation.z=-state.steering*Math.min(1,Math.abs(state.speed)/8)*.12;head.rotation.y=!playing&&garage?Math.sin(now*.0014)*.045:0;
    if(playing)updateCamera(Math.min(elapsed,.1));else if(garage){car.rotation.y=(now-garageStart)*.00035;camera.position.set(state.x+3.1,floorY+2.2,state.z+3.5);camera.lookAt(state.x-.8,floorY+.85,state.z);shadow.rotation.z=-car.rotation.y;}else {if(previewOrbit){const a=now*.00009;camera.position.set(Math.cos(a)*85,62,35+Math.sin(a)*85);}else camera.position.set(-50,55,100);camera.lookAt(-.5,0,40);}
    renderer.render(scene,camera);
    // Reduce fill cost on slower devices without changing physics or input rate.
    qualityFrames++;qualityTime+=Math.min(elapsed,1);
    if(qualityTime>=2){if(qualityFrames/qualityTime<28&&qualityRatio>.65){qualityRatio=Math.max(.65,qualityRatio-.25);renderer.setPixelRatio(qualityRatio);renderer.setSize(innerWidth,innerHeight);}qualityFrames=0;qualityTime=0;}
    if(elapsed>0)samples.push(elapsed);if(samples.length>180)samples.shift();
    if(now-lastSend>75){
      const status={...state,competition:opponents.length&&race?{position:fleetPosition(race,state,opponents),total:opponents.length+1,opponents:opponents.map((o,i)=>({x:o.state.x,z:o.state.z,phase:o.race.phase,racer:rivalModels[i].profile.id,color:rivalModels[i].profile.paint}))}:null,racer:profile.id,faceStyle:head.userData.faceStyle??'painted',track:ROUTE_ID,playing,paused,mode,race:race?.snapshot()??null,ghostAvailable:!!bestGhost,ghostVisible:!!ghost,ghostFinished:ghost?.finished??false,ghostBestMs:bestGhost?.totalMs??null,qa:!!qaDriver,input:input(),spawn:spawnId,layout:D.layoutVersion,contactCount:contacts(state,grid,cfg).filter(c=>c.depth>.005).length,camera:[camera.position.x,camera.position.y,camera.position.z]};
      send('state',{state:status});lastSend=now;
      let pre=document.getElementById('drive-state');if(!pre){pre=document.createElement('script');pre.id='drive-state';pre.type='application/json';document.body.append(pre);}pre.textContent=JSON.stringify(status);
    }
    if(now-lastMetrics>1000){const duration=samples.reduce((a,b)=>a+b,0);send('metrics',{metrics:{fps:duration>0?+(samples.length/duration).toFixed(1):0,samples:samples.length,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,viewport:[innerWidth,innerHeight]}});lastMetrics=now;}
  }
  requestAnimationFrame(loop);
}
