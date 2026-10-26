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
const grid=new ElevationGrid(fixture.obstacles,[...fixture.walls,...COURTYARD_RAILS]);
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
check('the continuous route and its full-width rails have no crossing or reversed corner',()=>{
  const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
  for(let i=0;i<COURTYARD_RAILS.length;i++)for(let j=i+1;j<COURTYARD_RAILS.length;j++){const w=COURTYARD_RAILS[i],v=COURTYARD_RAILS[j];if(Math.max(w.ax,w.bx)<Math.min(v.ax,v.bx)||Math.min(w.ax,w.bx)>Math.max(v.ax,v.bx)||Math.max(w.az,w.bz)<Math.min(v.az,v.bz)||Math.min(w.az,w.bz)>Math.max(v.az,v.bz))continue;const a={x:w.ax,z:w.az},b={x:w.bx,z:w.bz},c={x:v.ax,z:v.az},d={x:v.bx,z:v.bz};assert.ok(!(cross(a,b,c)*cross(a,b,d)<-1e-10&&cross(c,d,a)*cross(c,d,b)<-1e-10),`crossing rail ${i},${j}`);}
});
check('slow driving begins before the stadium exit corner and covers every ramp and corridor',()=>{
  for(const p of COURTYARD_SAMPLES)if(p.y>.02){assert.ok(courtyardSlowAt(p.x,p.z));assert.equal(courtyardConfigAt(p).maxSpeed,4.5);}
  assert.equal(courtyardConfigAt({x:(475-1100)/18,z:(1500-700)/18}).maxSpeed,4.5);
  assert.equal(courtyardConfigAt({x:(1250-1100)/18,z:(1335-700)/18}).maxSpeed,11);
});
const T=await import('../site/campus/vendor/three/build/three.module.js'),{buildKart}=await import('../site/kart-model.js'),{RACERS}=await import('../site/racer-catalog.js');
check('all eight complete racer models fit the actual ceiling and arch clearance',()=>{
  globalThis.document={createElement(){return{width:0,height:0,getContext(){return new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};}};
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
  assert.ok(validGhost(recording,'走廊驗證'));assert.ok(saveGhost(storage,recording).saved);assert.ok(readGhost(storage,'走廊驗證'));const key=CURRENT_LEADERBOARD_KEY+SESSION_SCOPE;assert.ok(saveResult(storage,result,[],key).saved);assert.equal(readLeaderboard(storage,key).rows[0].track,'courtyard-elevation-v1-laps2');assert.equal(map.get('xikou-kart.leaderboard.v2.campus.friendly-v1.laps2'),'old-campus-untouched');
  let raised=0;for(let t=0;t<result.totalMs/1000;t+=.3){const p=ghostPose(recording,t);assert.ok(p&&Number.isFinite(p.x));const y=courtyardHeightAt(p.x,p.z);assert.ok(y>=0&&y<=1.2+1e-8);if(y>.95)raised++;}assert.ok(raised>20);
  const p=courtyardPoseAt(COURTYARD_LENGTH*.7),s=createState(p);s.speed=4;resetState(s,nearestOnCourtyard(s.x+.15,s.z));assert.equal(s.speed,0);assert.equal(contacts(s,grid,COURTYARD_DRIVE).length,0);
});
console.log(JSON.stringify({checks,length:COURTYARD_LENGTH,minClearance,maxGrade,race:raceEvidence,ghostSamples:recording.samples.length},null,2));
