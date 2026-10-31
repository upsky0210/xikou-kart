import fs from 'node:fs';
import assert from 'node:assert/strict';
globalThis.location=new URL('http://local/play.html?track=grand&laps=2');
const {ROUTES}=await import('../site/track-config.js');
const {ElevationGrid,COURTYARD_DRIVE}=await import('../site/courtyard-world.js');
const {nearestOnCourtyard,courtyardHeightAt}=await import('../site/courtyard-route.js');
const {makeGates}=await import('../site/race-core.js');
const {Opponent,racePosition}=await import('../site/opponent-core.js');
const rows=[];
for(const track of ['grand','courtyard','field','campus'])for(const difficulty of ['easy','normal','hard']){
 const f=JSON.parse(fs.readFileSync(new URL(`./fixtures/${['grand','campus'].includes(track)?'grand':'courtyard'}-collisions.json`,import.meta.url)));
 const h=track==='grand'?(x,z)=>nearestOnCourtyard(x,z).error<2?courtyardHeightAt(x,z):0:track==='courtyard'?courtyardHeightAt:()=>0;
 const grid=new ElevationGrid(f.obstacles,f.walls,h),route=ROUTES[track],gates=makeGates(route);
 const fleet=Array.from({length:3},(_,index)=>new Opponent({gates,laps:2,grid,bounds:f.bounds,cfg:COURTYARD_DRIVE,route,index,difficulty}));
 const stats=fleet.map(()=>({lane:0,passing:0,top:0}));let changes=0,lastOrder='',time=0;
 for(;time<800&&fleet.some(o=>o.race.phase!=='finished');time+=1/60){
   const snapshot=fleet.map(o=>({state:{...o.state},race:o.race}));
   fleet.forEach((o,i)=>{o.advance(1/60,snapshot.filter((_,j)=>i!==j));stats[i].lane=Math.max(stats[i].lane,Math.abs(o.state.aiLane??0));stats[i].passing+=o.state.aiOvertaking?1:0;stats[i].top=Math.max(stats[i].top,o.state.speed);});
   const order=[0,1,2].sort((a,b)=>racePosition(fleet[a].race,fleet[a].state,fleet[b])===1?-1:1).join('');
   if(time>5&&order!==lastOrder&&lastOrder)changes++;lastOrder=order;
 }
 const row={track,difficulty,changes,racers:fleet.map((o,i)=>({seconds:+o.race.elapsed.toFixed(2),phase:o.race.phase,collisions:o.state.collisions,invalid:o.race.invalidLaps,resets:o.race.resets,...stats[i]}))};rows.push(row);console.log(JSON.stringify(row));
 assert.ok(fleet.every(o=>o.race.phase==='finished'&&o.race.invalidLaps===0&&o.race.resets===0),`${track}/${difficulty}: all AI must finish valid laps without rescue`);
 assert.ok(fleet.every(o=>o.state.collisions===0),`${track}/${difficulty}: safe lane changes`);
 assert.ok(stats.some(s=>s.lane>.35&&s.passing>0),`${track}/${difficulty}: visible passing line`);
}
assert.ok(rows.some(r=>r.changes>0),'AI must exchange positions');
console.log('PASS: 36 physical AI two-lap finishes, varied lines and order changes');
