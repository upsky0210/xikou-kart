import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
globalThis.location=new URL('http://local/play.html?track=courtyard&laps=2');
const {COURTYARD_LENGTH,COURTYARD_SAMPLES,COURTYARD_RAILS,courtyardPoseAt,courtyardHeightAt,courtyardWidthAt,courtyardSlowAt,nearestOnCourtyard}=await import('../site/courtyard-route.js');
const {COURTYARD_DRIVE,courtyardConfigAt,ElevationGrid}=await import('../site/courtyard-world.js');
const {ROUTES,distanceRect,distanceSegment}=await import('../site/track-config.js');
const {createState,resetState,contacts,step}=await import('../site/drive-core.js');
const {makeGates,RaceSession}=await import('../site/race-core.js');
const {regressionInput}=await import('../site/qa-driver.js');
const {GhostRecorder,validGhost,ghostPose,saveGhost,readGhost}=await import('../site/ghost-core.js');
const {saveResult,readLeaderboard,CURRENT_LEADERBOARD_KEY}=await import('../site/leaderboard.js');
const {SESSION_SCOPE}=await import('../site/session-config.js');
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/courtyard-collisions.json',import.meta.url))),checks=[];
const grid=new ElevationGrid(fixture.obstacles,fixture.walls);
const check=(name,fn)=>{fn();checks.push(name);console.log('PASS',name);};
check('collision evidence is from the complete current campus rather than the greybox',()=>{
  assert.ok(fixture.sourceBoxCount>3000);assert.ok(fixture.obstacles.length>2500);assert.ok(fixture.walls.length>=214);assert.ok(fixture.ceilings.length>20);
  for(const[path,hash]of Object.entries(fixture.sourceHashes)){const source=fs.readFileSync(new URL('../'+path,import.meta.url),'utf8').replace(/\r\n/g,'\n').replace(/\?build=[A-Za-z0-9-]+/g,'');assert.equal(createHash('sha256').update(source).digest('hex'),hash,`Refresh the actual browser collision fixture after changing ${path}`);}
});
let minClearance=Infinity,maxGrade=0;
check('all route width, spawn and checkpoint reset poses clear the real 3D obstacles at their elevation',()=>{
  const scenery=new ElevationGrid(fixture.obstacles,fixture.walls);
  for(let i=0;i<COURTYARD_SAMPLES.length;i++){
    const p=COURTYARD_SAMPLES[i],q=COURTYARD_SAMPLES[(i+1)%COURTYARD_SAMPLES.length],half=courtyardWidthAt(p.x,p.z)/2;
    assert.equal(contacts(createState(p),grid,COURTYARD_DRIVE).length,0,`blocked centre ${p.x},${p.z}`);
    for(const o of scenery.nearby(p.x,p.z,half+.3,p)){const clearance=(o.kind==='wall'?distanceSegment(p.x,p.z,o)-.16:distanceRect(p.x,p.z,o))-half;minClearance=Math.min(minClearance,clearance);assert.ok(clearance>=.005,`lane intersects scenery: ${p.x*18+1100},${p.z*18+700} / ${clearance}`);}
    maxGrade=Math.max(maxGrade,Math.abs(p.y-q.y)/Math.hypot(p.x-q.x,p.z-q.z));
  }
  assert.ok(maxGrade<.14);assert.ok(COURTYARD_LENGTH>290&&COURTYARD_LENGTH<320);
  for(const p of Object.values(fixture.spawns))assert.equal(contacts(createState(p),grid,COURTYARD_DRIVE).length,0);
  const gates=makeGates(ROUTES.courtyard);for(let i=0;i<gates.length;i++){const race=new RaceSession({gates});race.expected=i+1;const p=race.resetPose();assert.equal(contacts(createState(p),grid,COURTYARD_DRIVE).length,0);assert.ok(courtyardHeightAt(p.x,p.z)>=0);}
});
check('route rails are absent from both rendering and collision evidence',()=>{
  assert.equal(fixture.routeRailCount,0);assert.ok(!fixture.walls.some(w=>w.kind==='route-rail'));
  const source=fs.readFileSync(new URL('../site/drive-scene.js',import.meta.url),'utf8');assert.ok(!source.includes('walls.push(...COURTYARD_RAILS)'));
  const worldSource=fs.readFileSync(new URL('../site/courtyard-world.js',import.meta.url),'utf8');assert.ok(!worldSource.includes('CylinderGeometry'));
});
check('corridors and ramps retain full speed, acceleration and drift',()=>{
  for(const p of COURTYARD_SAMPLES){const cfg=courtyardConfigAt(p);assert.equal(cfg.maxSpeed,11);assert.equal(cfg.acceleration,6.5);assert.equal(cfg.driftMinSpeed,4);}
  const p=COURTYARD_SAMPLES.find(p=>p.y>1),s=createState(p),empty=new ElevationGrid([],[]);s.speed=8;
  step(s,{throttle:true},1/120,empty,null,courtyardConfigAt(s));assert.ok(s.speed>8,'entering a corridor must not clamp speed');
});
const T=await import('../site/campus/vendor/three/build/three.module.js'),{buildKart}=await import('../site/kart-model.js'),{RACERS}=await import('../site/racer-catalog.js');
check('all eight complete racer models fit the actual ceiling and arch clearance',()=>{
  globalThis.document={createElement(){return{width:0,height:0,getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};}};
  const poses=COURTYARD_SAMPLES.filter((p,i)=>p.y>.02&&i%35===0);
  for(const racer of RACERS){const {car}=buildKart(T,racer.id);for(const p of poses){const fx=Math.sin(p.yaw),fz=Math.cos(p.yaw);car.position.set(p.x,p.y+.075,p.z);car.rotation.set(-Math.atan2(courtyardHeightAt(p.x+fx*.1,p.z+fz*.1)-p.y,.1),p.yaw,Math.atan2(courtyardHeightAt(p.x+fz*.1,p.z-fx*.1)-p.y,.1),'YXZ');const bounds=new T.Box3().setFromObject(car);assert.ok(bounds.max.y-p.y<COURTYARD_DRIVE.carHeight,`${racer.id} height exceeds collision envelope`);}}
});
let result,recording,raceEvidence;
check('two laps complete all 28 gates with the real physics, ramps, ceilings and zero collisions',()=>{
  const gates=makeGates(ROUTES.courtyard),first=gates[0],s=createState({x:first.x-first.fx*3,z:first.z-first.fz*3,yaw:Math.atan2(first.fx,first.fz)}),race=new RaceSession({laps:2,gates,name:'走廊驗證',id:'courtyard-verification'}).begin(),recorder=new GhostRecorder();race.advance(3);recorder.record(0,s,false,true);let maxError=0,climbs=0,wasRaised=false;const collisionTrace=[];
  for(let i=0;i<120*400&&race.phase!=='finished';i++){const from={...s},span=race.advance(1/120);const collided=step(s,regressionInput(s,7.6,ROUTES.courtyard),1/120,grid,fixture.bounds,courtyardConfigAt(s));if(collided)collisionTrace.push({x:s.x*18+1100,z:s.z*18+700,time:race.elapsed});const finished=race.observeMove(from,s,span.fromTime,span.toTime);recorder.record(finished?race.elapsed:span.toTime,s,false,finished);const raised=courtyardHeightAt(s.x,s.z)>.95;if(raised&&!wasRaised)climbs++;wasRaised=raised;maxError=Math.max(maxError,nearestOnCourtyard(s.x,s.z).error);}
  assert.equal(race.phase,'finished');assert.equal(race.invalidLaps,0);assert.equal(s.collisions,0,JSON.stringify(collisionTrace));assert.equal(race.lapTimes.length,2);assert.ok(climbs>=4);result=race.result();recording=recorder.finish(result,s);assert.ok(recording);raceEvidence={totalMs:result.totalMs,lapMs:result.lapMs,collisions:s.collisions,climbs,maxError};
});
check('elevated ghost playback, result storage and resets preserve old routes and independent profiles',()=>{
  const map=new Map([['xikou-kart.leaderboard.v2.campus.friendly-v1.laps2','old-campus-untouched']]),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
  assert.ok(validGhost(recording,'走廊驗證'));assert.ok(saveGhost(storage,recording).saved);assert.ok(readGhost(storage,'走廊驗證'));const key=CURRENT_LEADERBOARD_KEY+SESSION_SCOPE;assert.ok(saveResult(storage,result,[],key).saved);assert.equal(readLeaderboard(storage,key).rows[0].track,'courtyard-arcade-open-v1-laps2');assert.equal(map.get('xikou-kart.leaderboard.v2.campus.friendly-v1.laps2'),'old-campus-untouched');
  let raised=0;for(let t=0;t<result.totalMs/1000;t+=.3){const p=ghostPose(recording,t);assert.ok(p&&Number.isFinite(p.x));const y=courtyardHeightAt(p.x,p.z);assert.ok(y>=0&&y<=1.2+1e-8);if(y>.95)raised++;}assert.ok(raised>20);
  const p=courtyardPoseAt(COURTYARD_LENGTH*.7),s=createState(p);s.speed=4;resetState(s,nearestOnCourtyard(s.x+.15,s.z));assert.equal(s.speed,0);assert.equal(contacts(s,grid,COURTYARD_DRIVE).length,0);
});
check('steering responds within 150 ms and releases promptly',()=>{
  const s=createState({x:0,z:0,yaw:0}),empty=new ElevationGrid([],[]);s.speed=5;
  for(let i=0;i<18;i++)step(s,{left:true,throttle:true},1/120,empty,null,COURTYARD_DRIVE);
  assert.ok(s.steering>.25);assert.ok(s.yaw>0);
  for(let i=0;i<12;i++)step(s,{throttle:true},1/120,empty,null,COURTYARD_DRIVE);
  assert.equal(s.steering,0);
});
const {Opponent,racePosition,fleetPosition}=await import('../site/opponent-core.js');
check('three computer rivals complete two laps and rank all four cars',()=>{
  const gates=makeGates(ROUTES.courtyard),opponents=Array.from({length:3},(_,index)=>new Opponent({gates,laps:2,grid,bounds:fixture.bounds,cfg:COURTYARD_DRIVE,route:ROUTES.courtyard,index}));
  const player=new RaceSession({gates,laps:2}).begin(),g=gates[0],pose={x:g.x-g.fx*3,z:g.z-g.fz*3};
  assert.equal(fleetPosition(player,pose,opponents),1);
  for(const opponent of opponents){
    assert.equal(contacts(opponent.state,grid,COURTYARD_DRIVE).length,0);
    opponent.advance(3);assert.equal(opponent.race.phase,'racing');assert.equal(opponent.state.distance,0);
    for(let i=0;i<120*400&&opponent.race.phase!=='finished';i++)opponent.advance(1/120);
    assert.equal(opponent.race.phase,'finished');assert.equal(opponent.race.invalidLaps,0);assert.equal(opponent.state.collisions,0);assert.equal(opponent.race.lapTimes.length,2);
  }
  assert.equal(fleetPosition(player,pose,opponents),4);
  const times=opponents.map(o=>o.race.elapsed).sort((a,b)=>a-b);
  player.phase='finished';player.elapsed=times[0]-1;assert.equal(fleetPosition(player,pose,opponents),1);
  player.elapsed=times[2]+1;assert.equal(fleetPosition(player,pose,opponents),4);
  for(let i=0;i<2;i++){player.elapsed=(times[i]+times[i+1])/2;assert.equal(fleetPosition(player,pose,opponents),i+2);}
  const lagged=new Opponent({gates,laps:1,grid,bounds:fixture.bounds,cfg:COURTYARD_DRIVE,route:ROUTES.courtyard});lagged.advance(4);assert.equal(lagged.race.elapsed,1);
});
console.log(JSON.stringify({checks,length:COURTYARD_LENGTH,minClearance,maxGrade,race:raceEvidence,ghostSamples:recording.samples.length},null,2));
