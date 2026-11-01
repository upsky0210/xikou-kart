import assert from 'node:assert/strict';
import fs from 'node:fs';
globalThis.location=new URL('http://local/play.html?track=field&laps=1&items=1');
const {ItemRace}=await import('../site/item-core.js');
const {newItemEffects,itemDriveConfig,tickItemEffects}=await import('../site/item-status.js');
const {itemBlocker}=await import('../site/item-geometry.js');
const {createState,step,SpatialGrid,contacts}=await import('../site/drive-core.js');
const {DRIVE}=await import('../site/drive-config.js');
const {ROUTES}=await import('../site/track-config.js');
const {makeGates}=await import('../site/race-core.js');
const {makeSupplyBoxes}=await import('../site/supply-boxes.js');
const {courtyardHeightAt,nearestOnCourtyard}=await import('../site/courtyard-route.js');
const {ElevationGrid,COURTYARD_DRIVE}=await import('../site/courtyard-world.js');
const {Opponent}=await import('../site/opponent-core.js');
const {saveResult,readLeaderboard,validRecord}=await import('../site/leaderboard.js');
const {SESSION_SCOPE}=await import('../site/session-config.js');
const checks=[];function check(name,fn){fn();checks.push(name);console.log('PASS',name);}
const actor=(id,x=0,z=0)=>({id,state:createState({x,z,yaw:0}),cfg:DRIVE});
function advance(e,t){for(let left=t;left>1e-8;left-=1/120){const dt=Math.min(left,1/120);for(const a of e.actors)tickItemEffects(a.state,dt);e.update(dt);}}
check('one inventory slot, countdown lockout and independent eight-second box cooldown',()=>{
 const a=actor('a'),b=actor('b'),e=new ItemRace({actors:[a,b],boxes:[{id:'box',x:0,z:0,y:0}]});e.update(.01);assert.ok(a.item&&b.item);assert.equal(e.give('a','chalk'),false);e.use('a');e.update(.1);assert.equal(a.item,null);advance(e,8);assert.ok(a.item);a.race={phase:'countdown'};assert.equal(e.use('a'),false);assert.equal(e.give('a','milk',true),false);assert.equal(e.hit('b','a','chalk'),false);
});
check('six-item selection excludes plane and bell; deterministic draws favor catch-up boosts',()=>{
 const e=new ItemRace({actors:[actor('a')],count:6});for(let i=0;i<1000;i++)assert.ok(!['plane','bell'].includes(e.draw(1,4)));assert.equal(e.give('a','plane'),false);
 const first=new ItemRace({actors:[],seed:99}),last=new ItemRace({actors:[],seed:99});let m1=0,m4=0;for(let i=0;i<10000;i++){if(first.draw(1,4)==='milk')m1++;if(last.draw(4,4)==='milk')m4++;}assert.ok(m4>m1*2);
});
check('chalk sweeps through a target at speed; shield blocks once, immunity prevents chains, eraser clears',()=>{
 const a=actor('a'),b=actor('b',0,4),e=new ItemRace({actors:[a,b]});b.state.speed=10;e.give('a','chalk');e.use('a');advance(e,.15);assert.equal(a.stats.hits,1);assert.equal(b.state.itemEffects.factor,.65);assert.equal(e.hit('a','b','plane'),false);e.give('b','eraser');e.use('b');assert.equal(b.state.itemEffects.slow,0);advance(e,4);e.give('b','ruler');e.use('b');assert.equal(e.hit('a','b','chalk'),false);assert.equal(b.stats.blocks,1);assert.equal(b.state.itemEffects.shield,0);advance(e,.6);assert.equal(e.hit('a','b','water'),true);assert.ok(b.state.itemEffects.water>0);assert.equal(b.stats.received,2);
});
check('walls and floor heights stop both projectiles and splash; paper plane steers gently',()=>{
 const clear=itemBlocker([{x1:-1,x2:1,z1:2,z2:2.2,y1:0,y2:3}],[]);assert.equal(clear({x:0,z:0,y:.8},{x:0,z:5,y:.8}),false);assert.equal(clear({x:0,z:0,y:4},{x:0,z:5,y:4}),true);
 const wall=itemBlocker([],[{ax:-2,az:2,bx:2,bz:2,y1:0,y2:3}]);assert.equal(wall({x:0,z:0,y:1},{x:0,z:5,y:1}),false);
 const a=actor('a'),b=actor('b',0,4),e=new ItemRace({actors:[a,b],clearLine:clear});e.give('a','chalk');e.use('a');advance(e,.4);assert.equal(b.stats.received,0);assert.equal(e.projectiles.length,0);
 const c=actor('c'),d=actor('d',2,10),p=new ItemRace({actors:[c,d]});p.give('c','plane');p.use('c');p.update(.05);assert.ok(p.projectiles[0].yaw>0&&p.projectiles[0].yaw<=.086);advance(p,.8);assert.equal(d.stats.received,1);
 const raised=new ItemRace({actors:[actor('a'),actor('b',0,4)],heightAt:(x,z)=>z>2?1.2:0});raised.give('a','chalk');raised.use('a');advance(raised,.4);assert.equal(raised.actor('b').stats.received,0);
});
check('rear water and glue expire, skip owner, slow briefly; bell telegraphs and obeys walls',()=>{
 for(const item of ['water','glue']){const a=actor('a'),b=actor('b',0,-1.45),e=new ItemRace({actors:[a,b]});e.give('a',item);e.use('a');e.update(.01);assert.equal(a.stats.received,0);assert.equal(b.stats.received,1);assert.ok(b.state.itemEffects.slow>0);if(item==='water')assert.ok(b.state.itemEffects.water>0);advance(e,5.1);assert.equal(e.traps.length,0);assert.equal(b.state.itemEffects.slow,0);}
 const e=new ItemRace({actors:[actor('a'),actor('b',0,3)]});e.give('a','bell');e.use('a');e.update(.2);assert.equal(e.actor('b').stats.received,0);e.update(.11);assert.equal(e.actor('b').stats.received,1);
 const w=new ItemRace({actors:[actor('a'),actor('b',0,3)],clearLine:()=>false});w.give('a','bell');w.use('a');advance(w,.4);assert.equal(w.actor('b').stats.received,0);
});
check('milk produces real speed gain without stacking pad/drift boosts; pure driving is unchanged',()=>{
 const a=actor('a'),e=new ItemRace({actors:[a]});a.state.speed=11;e.give('a','milk');e.use('a');const c=itemDriveConfig(a.state,DRIVE);assert.equal(c.maxSpeed,13.75);assert.ok(Math.abs(c.maxSpeed*c.boostMultiplier-DRIVE.maxSpeed*DRIVE.boostMultiplier)<1e-9);
 const g=new SpatialGrid([],[]);for(let i=0;i<60;i++)step(a.state,{throttle:true},1/120,g,null,DRIVE);assert.ok(a.state.speed>11);for(let i=0;i<300;i++)step(a.state,{throttle:true},1/120,g,null,DRIVE);assert.equal(a.state.itemEffects.milk,0);assert.ok(a.state.speed<=11.01);assert.strictEqual(itemDriveConfig(createState({x:0,z:0,yaw:0}),DRIVE),DRIVE);
});
check('AI reacts after a delay, uses attacks by context, and stop clears live objects',()=>{
 const a=actor('ai'),b=actor('player',0,6);a.ai=true;const e=new ItemRace({actors:[a,b]});e.give('ai','chalk');e.update(.2);assert.equal(a.stats.uses,0);advance(e,1.5);assert.equal(a.stats.uses,1);assert.equal(b.stats.received,1);e.stop();assert.equal(e.projectiles.length+e.traps.length+e.waves.length,0);const t=e.time;e.update(.2);assert.equal(e.time,t);
});
check('all four actual routes have clear outdoor supplies away from checkpoint gates',()=>{
 for(const [id,r]of Object.entries(ROUTES)){const elevated=['courtyard','grand'].includes(id),f=JSON.parse(fs.readFileSync(new URL(`./fixtures/${['grand','campus'].includes(id)?'grand':'courtyard'}-collisions.json`,import.meta.url))),heightAt=id==='courtyard'?courtyardHeightAt:id==='grand'?(x,z)=>nearestOnCourtyard(x,z).error<2?courtyardHeightAt(x,z):0:()=>0,grid=elevated?new ElevationGrid(f.obstacles,f.walls,heightAt):new SpatialGrid(f.obstacles.filter(o=>!(o.y1>DRIVE.carHeight)),f.walls.filter(o=>!(o.y1>DRIVE.carHeight))),cfg=elevated?COURTYARD_DRIVE:DRIVE;
 const gates=makeGates(r),boxes=makeSupplyBoxes(r,gates,{heightAt,isClear:(x,z,yaw)=>!contacts(createState({x,z,yaw}),grid,cfg).length});assert.ok(boxes.length>=3,`${id}: too few boxes`);for(const b of boxes){assert.ok(b.y<.08&&b.width>=2.35);assert.ok(!gates.some(g=>Math.hypot(g.x-b.x,g.z-b.z)<3.2));assert.ok(b.sections.length);assert.equal(contacts(createState(b),grid,cfg).length,0);}console.log('SUPPLIES',id,boxes.length);
 }
});

check('item records store place and stats separately from time-trial and six-item records',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)},pure='xikou-kart.leaderboard.v2.field.arcade-v2.laps1',key='xikou-kart.leaderboard.v2'+SESSION_SCOPE;map.set(pure,'retained');const value={id:'items-proof',name:'test',track:'field-items8-v1-laps1',date:new Date().toISOString(),totalMs:30000,lapMs:[30000],bestLapMs:30000,position:2,itemStats:{pickups:3,uses:3,hits:1,received:1,blocks:0}};assert.ok(saveResult(storage,value,[],key).saved);assert.equal(readLeaderboard(storage,key).rows[0].position,2);assert.equal(map.get(pure),'retained');assert.equal(readLeaderboard(storage,key.replace('items8','items6')).rows.length,0);assert.equal(validRecord({...value,itemStats:null}),null);
});
const evidence=[];
check('real four-car item races finish all gates with equal item physics on each route',()=>{
 for(const id of ['field','campus','courtyard','grand']){const route=ROUTES[id],elevated=['courtyard','grand'].includes(id),fixture=JSON.parse(fs.readFileSync(new URL(`./fixtures/${['grand','campus'].includes(id)?'grand':'courtyard'}-collisions.json`,import.meta.url))),heightAt=id==='courtyard'?courtyardHeightAt:id==='grand'?(x,z)=>nearestOnCourtyard(x,z).error<2?courtyardHeightAt(x,z):0:()=>0,cfg=elevated?COURTYARD_DRIVE:DRIVE,grid=elevated?new ElevationGrid(fixture.obstacles,fixture.walls,heightAt):new SpatialGrid(fixture.obstacles.filter(o=>!(o.y1>cfg.carHeight)),fixture.walls.filter(o=>!(o.y1>cfg.carHeight))),gates=makeGates(route),fleet=[0,1,2,3].map(index=>new Opponent({gates,laps:id==='grand'?2:1,grid,bounds:fixture.bounds,cfg,route,index:index%3,difficulty:'normal'})),boxes=makeSupplyBoxes(route,gates,{heightAt,isClear:(x,z,yaw)=>!contacts(createState({x,z,yaw}),grid,cfg).length}),engine=new ItemRace({actors:fleet.map((o,i)=>({id:String(i),state:o.state,cfg:o.simulation.cfg,race:o.race,ai:true})),boxes,heightAt,clearLine:itemBlocker(fixture.obstacles,fixture.walls),seed:924,count:id==='campus'?6:8});
 for(let tick=0;tick<60*500&&fleet.some(o=>o.race.phase!=='finished');tick++){const traffic=fleet.map(o=>({state:{...o.state},race:o.race}));fleet.forEach((o,i)=>o.advance(1/60,traffic.filter((_,j)=>i!==j)));engine.update(1/60);}
 assert.ok(fleet.every(o=>o.race.phase==='finished'),`${id} unfinished ${fleet.map(o=>o.race.expected)}`);assert.ok(engine.actors.every(a=>a.stats.pickups>0&&a.stats.uses>0),`${id} AI must collect and use`);assert.ok(fleet.every(o=>o.race.invalidLaps===0));const row={route:id,seconds:fleet.map(o=>+o.race.elapsed.toFixed(2)),uses:engine.actors.map(a=>a.stats.uses),hits:engine.actors.map(a=>a.stats.hits),resets:fleet.map(o=>o.race.resets)};evidence.push(row);console.log('ITEM RACE',JSON.stringify(row));
 }
});
console.log(JSON.stringify({checks:checks.length,races:evidence},null,2));
