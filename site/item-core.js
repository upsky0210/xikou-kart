import {ITEMS,itemIds} from './item-catalog.js?build=20261101-items1';
import {newItemEffects} from './item-status.js?build=20261101-items1';
import {pointSegmentDistance} from './item-geometry.js?build=20261101-items1';
const angle=a=>Math.atan2(Math.sin(a),Math.cos(a)),distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const DAMAGE={chalk:{factor:.65,seconds:1.2},water:{factor:.9,seconds:.8,water:1.5},glue:{factor:.70,seconds:1},plane:{factor:.75,seconds:1},bell:{factor:.8,seconds:.8}};
const WEIGHTS={lead:[10,18,15,25,12,15,3,2],middle:[20,18,10,14,8,10,12,8],last:[30,15,7,10,6,7,17,8]};
export class ItemRace {
  constructor({actors,boxes=[],heightAt=()=>0,clearLine=()=>true,seed=7,count=8,autoPlayer=false}){
    this.time=0;this.running=true;this.actors=actors;this.boxes=boxes;this.heightAt=heightAt;this.clearLine=clearLine;this.seed=seed>>>0;this.ids=itemIds(count);this.autoPlayer=autoPlayer;
    this.projectiles=[];this.traps=[];this.waves=[];this.events=[];this.sequence=0;
    for(const a of actors){a.state.itemEffects=newItemEffects();a.item=null;a.cooldown=0;a.readyAt=0;a.pickups=new Map();a.previous={x:a.state.x,z:a.state.z};a.stats={pickups:0,uses:0,hits:0,received:0,blocks:0};}
  }
  random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
  actor(id){return this.actors.find(a=>a.id===id);}
  active(a){return a&&this.running&&(!a.race||a.race.phase==='racing');}
  floor(a){return this.heightAt(a.state.x,a.state.z);}
  visible(a,b){return Math.abs(this.floor(a)-this.floor(b))<.45&&this.clearLine({x:a.state.x,z:a.state.z,y:this.floor(a)+.8},{x:b.state.x,z:b.state.z,y:this.floor(b)+.8});}
  emit(type,actor,item,target=null){this.events.push({seq:++this.sequence,time:this.time,type,actor,item,target});if(this.events.length>40)this.events.shift();}
  draw(rank,total){const weights=rank===1&&total>1?WEIGHTS.lead:rank===total&&total>1?WEIGHTS.last:WEIGHTS.middle,sum=this.ids.reduce((n,id)=>n+weights[Object.keys(ITEMS).indexOf(id)],0);let r=this.random()*sum;for(const id of this.ids){r-=weights[Object.keys(ITEMS).indexOf(id)];if(r<0)return id;}return this.ids.at(-1);}
  rank(a){const live=this.actors,progress=b=>b.race?(b.race.lapTimes.length*b.race.gates.length+b.race.expected):0,p=progress(a);return 1+live.filter(b=>b!==a&&(progress(b)>p||(progress(b)===p&&b.state.distance>a.state.distance))).length;}
  give(id,item,replace=false){const a=this.actor(id);if(!this.active(a)||!this.ids.includes(item)||a.item&&!replace)return false;a.item=item;a.readyAt=this.time+.7+this.random()*.7;a.stats.pickups++;this.emit('pickup',id,item);return true;}
  hit(owner,id,item){
    const a=this.actor(id),damage=DAMAGE[item];if(!this.active(a)||!damage||owner===id)return false;const e=a.state.itemEffects;
    if(e.immune>0)return false;
    if(e.shield>0){e.shield=0;e.immune=.5;a.stats.blocks++;this.emit('block',id,item,owner);return false;}
    e.slow=damage.seconds;e.factor=damage.factor;e.water=damage.water??0;e.immune=Math.max(e.slow,e.water)+2;
    if(a.state.speed>0)a.state.speed*=damage.factor;
    a.stats.received++;const from=this.actor(owner);if(from)from.stats.hits++;this.emit('hit',owner,item,id);return true;
  }
  use(id){
    const a=this.actor(id);if(!this.active(a)||!a.item||a.cooldown>this.time)return false;
    const item=a.item,s=a.state,e=s.itemEffects,fx=Math.sin(s.yaw),fz=Math.cos(s.yaw),floor=this.floor(a);
    if(item==='water'||item==='glue'){
      const p={x:s.x-fx*1.45,z:s.z-fz*1.45,y:floor+.4};
      if(Math.abs(this.heightAt(p.x,p.z)-floor)>.15||!this.clearLine({x:s.x,z:s.z,y:p.y},p))return false;
      this.traps.push({...p,y:floor,item,owner:id,born:this.time,until:this.time+5,radius:item==='water'?.8:.75,visits:new Set()});if(this.traps.length>16)this.traps.shift();
    }else if(item==='milk'){
      e.milk=1.8;s.speed=Math.min(a.cfg.maxSpeed*1.25,Math.max(0,s.speed)+2);s.itemBoostCount=(s.itemBoostCount??0)+1;
    }else if(item==='ruler'){e.shield=4;
    }else if(item==='eraser'){e.water=0;e.slow=0;e.factor=1;e.immune=Math.max(e.immune,1.2);this.emit('clean',id,item);
    }else if(item==='bell'){
      for(const b of this.actors)if(b!==a&&this.active(b)&&distance(s,b.state)<4&&this.visible(a,b))this.emit('warning',id,item,b.id);
      this.waves.push({owner:id,x:s.x,z:s.z,y:floor,born:this.time,at:this.time+.3});if(this.waves.length>4)this.waves.shift();
    }else{
      const p={x:s.x+fx*1.25,z:s.z+fz*1.25,y:floor+.8};
      if(this.clearLine({x:s.x,z:s.z,y:p.y},p)){
        const target=item==='plane'?this.actors.filter(b=>b!==a&&this.active(b)&&distance(s,b.state)<25&&Math.cos(Math.atan2(b.state.x-s.x,b.state.z-s.z)-s.yaw)>.45&&this.visible(a,b)).sort((b,c)=>distance(s,b.state)-distance(s,c.state))[0]:null;
        this.projectiles.push({...p,owner:id,item,yaw:s.yaw,range:item==='plane'?25:20,speed:item==='plane'?16:22,target:target?.id??null,born:this.time});if(this.projectiles.length>24)this.projectiles.shift();
      }else this.emit('wall',id,item);
    }
    a.item=null;a.cooldown=this.time+.35;a.stats.uses++;this.emit('use',id,item);return true;
  }
  think(a){
    if(!a.ai&&!this.autoPlayer||!a.item||this.time<a.readyAt)return;
    const s=a.state,e=s.itemEffects,near=this.actors.filter(b=>b!==a&&this.active(b)&&this.visible(a,b)).map(b=>({a:b,d:distance(s,b.state),front:Math.cos(Math.atan2(b.state.x-s.x,b.state.z-s.z)-s.yaw)}));
    const front=near.some(b=>b.d<20&&b.front>.8),back=near.some(b=>b.d<9&&b.front<-.35);
    let use=false;
    if(a.item==='milk')use=Math.abs(s.steering)<.07&&s.speed>3&&(a.straight?.(s,12)??true);
    if(a.item==='eraser')use=e.water>0||e.slow>0||this.time-a.readyAt>7&&near.some(b=>b.d<5);
    if(a.item==='ruler')use=!e.shield&&(this.projectiles.some(p=>p.owner!==a.id&&distance(s,p)<10)||near.some(b=>b.d<7));
    if(a.item==='chalk'||a.item==='plane')use=front;
    if(a.item==='water'||a.item==='glue')use=back||this.time-a.readyAt>7;
    if(a.item==='bell')use=near.some(b=>b.d<3.8);
    if(use)this.use(a.id);
  }
  update(seconds){
    if(!this.running)return;let remaining=Math.max(0,Math.min(.2,seconds));while(remaining>1e-8){const dt=Math.min(.04,remaining);this.advance(dt);remaining-=dt;}
  }
  advance(dt){
    this.time+=dt;
    for(const a of this.actors){
      const s=a.state;if(!this.active(a))continue;
      const jumped=distance(s,a.previous)>4;
      if(!a.item&&!jumped)for(const box of this.boxes){
        if((a.pickups.get(box.id)??0)>this.time||Math.abs(this.floor(a)-box.y)>.35||a.race&&box.sections&&!box.sections.includes(a.race.expected%a.race.gates.length))continue;
        if(pointSegmentDistance(box,a.previous,s)<1.1){a.pickups.set(box.id,this.time+8);this.give(a.id,this.draw(this.rank(a),this.actors.length));break;}
      }
      a.previous={x:s.x,z:s.z};this.think(a);
    }
    const next=[];
    for(const p of this.projectiles){
      const before={x:p.x,z:p.z,y:p.y},target=this.actor(p.target);
      if(target&&this.active(target)){
        const desired=Math.atan2(target.state.x-p.x,target.state.z-p.z),delta=angle(desired-p.yaw);
        if(Math.abs(delta)<Math.PI*.6&&Math.abs(this.floor(target)+.8-p.y)<.45)p.yaw+=Math.max(-1.7*dt,Math.min(1.7*dt,delta));else p.target=null;
      }
      const travel=p.speed*dt;p.x+=Math.sin(p.yaw)*travel;p.z+=Math.cos(p.yaw)*travel;p.range-=travel;
      if(p.range<=0||this.time-p.born>2||Math.abs(this.heightAt(p.x,p.z)+.8-p.y)>.45||!this.clearLine(before,p)){this.emit('wall',p.owner,p.item);continue;}
      const struck=this.actors.filter(a=>a.id!==p.owner&&this.active(a)&&Math.abs(this.floor(a)+.8-p.y)<.45&&pointSegmentDistance(a.state,before,p)<.83).sort((a,b)=>distance(before,a.state)-distance(before,b.state))[0];
      if(struck){this.hit(p.owner,struck.id,p.item);continue;}next.push(p);
    }this.projectiles=next;
    for(const trap of this.traps)for(const a of this.actors){if(a.id===trap.owner||trap.visits.has(a.id)||!this.active(a)||Math.abs(this.floor(a)-trap.y)>.35||distance(a.state,trap)>trap.radius+.48)continue;if(!this.clearLine({x:a.state.x,z:a.state.z,y:this.floor(a)+.4},{x:trap.x,z:trap.z,y:trap.y+.4}))continue;trap.visits.add(a.id);this.hit(trap.owner,a.id,trap.item);}
    this.traps=this.traps.filter(p=>p.until>this.time);
    const pending=[];for(const wave of this.waves){if(this.time<wave.at){pending.push(wave);continue;}const owner=this.actor(wave.owner);for(const a of this.actors){if(a===owner||!this.active(a)||Math.abs(this.floor(a)-wave.y)>.45||distance(a.state,wave)>4)continue;if(this.clearLine({x:wave.x,z:wave.z,y:wave.y+.8},{x:a.state.x,z:a.state.z,y:this.floor(a)+.8}))this.hit(wave.owner,a.id,'bell');}}this.waves=pending;
  }
  snapshot(id){const a=this.actor(id);return a?{enabled:true,count:this.ids.length,held:a.item,effects:{...a.state.itemEffects},stats:{...a.stats},boxes:this.boxes.map(b=>({id:b.id,x:b.x,z:b.z,ready:(a.pickups.get(b.id)??0)<=this.time})),events:this.events.filter(e=>e.actor===id||e.target===id).slice(-8)}:null;}
  stop(){this.running=false;this.projectiles=[];this.traps=[];this.waves=[];}
}
