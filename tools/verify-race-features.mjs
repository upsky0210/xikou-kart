import assert from 'node:assert/strict';
import fs from 'node:fs';
globalThis.location=new URL('http://local/play.html?track=grand&laps=2');
const {DirectionMonitor,RocketStart}=await import('../site/race-features.js');
const {ROCKET}=await import('../site/race-features-config.js');
const {createState,step,SpatialGrid}=await import('../site/drive-core.js');
const {DRIVE}=await import('../site/drive-config.js');
const {ROUTES}=await import('../site/track-config.js');
const {makeGates}=await import('../site/race-core.js');
const {Opponent}=await import('../site/opponent-core.js');
const {ElevationGrid,COURTYARD_DRIVE}=await import('../site/courtyard-world.js');
const {nearestOnCourtyard,courtyardHeightAt}=await import('../site/courtyard-route.js');
const curves={};
for(const [name,press] of [['boost',-.2],['burn',-2],['normal',.25]]){
 const rocket=new RocketStart(),s=createState({x:0,z:0,yaw:0}),grid=new SpatialGrid(),curve=[];
 for(let i=-360;i<=240;i++){const t=i/120;const outcome=rocket.update(t>=press,t);if(t<0)continue;if(outcome!=='pending'&&!s.rocketOutcome){s.rocketOutcome=outcome;s.rocketRemaining=outcome==='boost'?ROCKET.boostSeconds:outcome==='burn'?ROCKET.burnSeconds:0;}step(s,{throttle:t>=press},1/120,grid,null,DRIVE);if(i%30===0)curve.push(+s.speed.toFixed(3));}
 assert.equal(s.rocketOutcome,name);curves[name]=curve;
}
assert.ok(curves.boost.every((v,i)=>v>curves.normal[i]));assert.ok(curves.normal.at(-1)>curves.burn.at(-1));
const idle=createState({x:0,z:0,yaw:0});for(let i=0;i<240;i++)step(idle,{throttle:false},1/120,new SpatialGrid(),null,DRIVE);assert.equal(idle.speed,0);console.log('PASS rocket speed curves at 0,.25,...2s',curves);
const monitor=new DirectionMonitor(),race={phase:'racing',expected:0,gates:[{x:0,z:100}]};
for(let i=0;i<200;i++)monitor.update({x:0,z:-i/60,yaw:Math.PI,speed:4},race,1/60);assert.ok(monitor.warning);monitor.update({x:0,z:-3,yaw:0,speed:4},race,1/60);assert.equal(monitor.warning,false);console.log('PASS reverse and immediate correction');
for(const id of ['field','campus','courtyard','grand']){
 const route=ROUTES[id],elevated=['courtyard','grand'].includes(id),f=JSON.parse(fs.readFileSync(new URL(`./fixtures/${['grand','campus'].includes(id)?'grand':'courtyard'}-collisions.json`,import.meta.url))),cfg=elevated?COURTYARD_DRIVE:DRIVE,heightAt=id==='courtyard'?courtyardHeightAt:(x,z)=>nearestOnCourtyard(x,z).error<2?courtyardHeightAt(x,z):0,grid=elevated?new ElevationGrid(f.obstacles,f.walls,heightAt):new SpatialGrid(f.obstacles.filter(o=>!(o.y1>cfg.carHeight)),f.walls.filter(o=>!(o.y1>cfg.carHeight))),o=new Opponent({gates:makeGates(route),laps:1,grid,bounds:f.bounds,cfg,route,difficulty:'normal'}),m=new DirectionMonitor();let warnings=0;
 for(let i=0;i<60*500&&o.race.phase!=='finished';i++){o.advance(1/60);m.update(o.state,o.race,1/60);if(m.warning)warnings++;}
 assert.equal(o.race.phase,'finished');assert.equal(warnings,0,`${id}: false warning frames ${warnings}`);console.log('PASS direction lap',id,o.race.elapsed,warnings);
}
