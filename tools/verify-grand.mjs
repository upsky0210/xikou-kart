import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
globalThis.location=new URL('http://local/play.html?track=grand&laps=2');
const {ROUTES,lengthMetres}=await import('../site/track-config.js');
const {ElevationGrid,COURTYARD_DRIVE}=await import('../site/courtyard-world.js');
const {nearestOnCourtyard,courtyardHeightAt}=await import('../site/courtyard-route.js');
const {makeGates,RaceSession}=await import('../site/race-core.js');
const {contacts,createState}=await import('../site/drive-core.js');
const {Opponent}=await import('../site/opponent-core.js');
const {getDifficulty}=await import('../site/difficulty-config.js');
const {GhostRecorder,validGhost,saveGhost,readGhost}=await import('../site/ghost-core.js');
const {saveResult,readLeaderboard,CURRENT_LEADERBOARD_KEY}=await import('../site/leaderboard.js');
const {SESSION_SCOPE}=await import('../site/session-config.js');
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/grand-collisions.json',import.meta.url))),route=ROUTES.grand,gates=makeGates(route);
for(const [path,hash]of Object.entries(fixture.sourceHashes)){const source=fs.readFileSync(new URL('../'+path,import.meta.url),'utf8').replace(/\r\n/g,'\n').replace(/\?build=[A-Za-z0-9-]+/g,'');assert.equal(createHash('sha256').update(source).digest('hex'),hash,`Refresh grand fixture after changing ${path}`);}
assert.equal(fixture.route,'grand');assert.equal(fixture.routeRailCount,0);assert.ok(fixture.sourceBoxCount>3000);
const heightAt=(x,z)=>nearestOnCourtyard(x,z).error<2?courtyardHeightAt(x,z):0,grid=new ElevationGrid(fixture.obstacles,fixture.walls,heightAt);
assert.ok(lengthMetres(route.points)>850&&lengthMetres(route.points)<870);assert.deepEqual(route.points[0],route.points.at(-1));assert.equal(gates.length,52);
for(let i=1;i<route.points.length;i++)assert.ok(Math.hypot(...route.points[i].map((x,j)=>(x-route.points[i-1][j])/18))<3,'continuous route segments');
for(let i=0;i<gates.length;i++){const race=new RaceSession({gates});race.expected=i+1;assert.equal(contacts(createState(race.resetPose()),grid,COURTYARD_DRIVE).length,0,`reset blocked at gate ${i}`);}
assert.equal(getDifficulty('unknown').id,'normal');
const times=[],evidence=[];let recording,result;
for(const difficulty of ['easy','normal','hard']){
 const o=new Opponent({gates,laps:2,grid,bounds:fixture.bounds,cfg:COURTYARD_DRIVE,route,difficulty});o.advance(3);const recorder=new GhostRecorder();recorder.record(0,o.state,false,true);let maximum=0,raised=0;
 for(let i=0;i<120*800&&o.race.phase!=='finished';i++){o.advance(1/120);maximum=Math.max(maximum,o.state.speed);if(heightAt(o.state.x,o.state.z)>.9)raised++;recorder.record(o.race.elapsed,o.state,false,o.race.phase==='finished');}
 assert.equal(o.race.phase,'finished',difficulty);assert.equal(o.race.invalidLaps,0);assert.equal(o.race.resets,0);assert.equal(o.state.collisions,0);assert.equal(o.race.lapTimes.length,2);assert.ok(raised>200);assert.ok(maximum>getDifficulty(difficulty).speed-.3);
 result=o.race.result();recording=recorder.finish(result,o.state);assert.ok(validGhost(recording,'電腦車手 1'));times.push(o.race.elapsed);evidence.push({difficulty,seconds:o.race.elapsed,maxSpeed:maximum,collisions:o.state.collisions});
}
assert.ok(times[0]>times[1]&&times[1]>times[2],'difficulty changes real completion times');
const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};assert.ok(saveGhost(storage,recording).saved);assert.ok(readGhost(storage,'電腦車手 1'));const key=CURRENT_LEADERBOARD_KEY+SESSION_SCOPE;assert.ok(saveResult(storage,result,[],key).saved);assert.equal(readLeaderboard(storage,key).rows[0].track,'grand-tour-v1-laps2');
console.log(JSON.stringify({passed:true,length:lengthMetres(route.points),gates:gates.length,races:evidence,ghostSamples:recording.samples.length}));
