import { DRIVE } from './drive-config.js?build=20261026-friendly3';
import { effectState, updateEffects, cancelDrift } from './effects-core.js?build=20261026-friendly3';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const toward=(v,target,step)=>v<target?Math.min(target,v+step):Math.max(target,v-step);
export class InputState {
  constructor(){this.sources=new Map();}
  set(id,action){if(action)this.sources.set(id,action);else this.sources.delete(id);}
  clear(){this.sources.clear();}
  value(){const set=new Set(this.sources.values());return{throttle:set.has('throttle'),brake:set.has('brake'),left:set.has('left'),right:set.has('right'),handbrake:set.has('handbrake')};}
}

export const KEY_ACTION={KeyW:'throttle',ArrowUp:'throttle',KeyS:'brake',ArrowDown:'brake',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'handbrake'};

export class SpatialGrid {
  constructor(boxes=[],walls=[],cell=5){
    this.cell=cell;this.bins=new Map();
    for(const b of boxes)this.add({...b,sourceKind:b.kind,kind:'box'},b.x1,b.z1,b.x2,b.z2);
    for(const w of walls)this.add({...w,sourceKind:w.kind,kind:'wall'},Math.min(w.ax,w.bx)-.2,Math.min(w.az,w.bz)-.2,Math.max(w.ax,w.bx)+.2,Math.max(w.az,w.bz)+.2);
  }
  add(o,x1,z1,x2,z2){for(let x=Math.floor(x1/this.cell);x<=Math.floor(x2/this.cell);x++)for(let z=Math.floor(z1/this.cell);z<=Math.floor(z2/this.cell);z++){const key=`${x},${z}`;if(!this.bins.has(key))this.bins.set(key,[]);this.bins.get(key).push(o);}}
  nearby(x,z,r){const result=new Set();for(let i=Math.floor((x-r)/this.cell);i<=Math.floor((x+r)/this.cell);i++)for(let j=Math.floor((z-r)/this.cell);j<=Math.floor((z+r)/this.cell);j++)for(const o of this.bins.get(`${i},${j}`)||[])result.add(o);return result;}
}

function circleContact(x,z,r,o){
  if(o.kind==='wall'){
    const dx=o.bx-o.ax,dz=o.bz-o.az,l=dx*dx+dz*dz;
    const t=l?clamp(((x-o.ax)*dx+(z-o.az)*dz)/l,0,1):0;
    const nx=x-o.ax-t*dx,nz=z-o.az-t*dz,d=Math.hypot(nx,nz),radius=r+(o.thickness??.15);
    if(d>=radius)return null;
    if(d>1e-7)return{nx:nx/d,nz:nz/d,depth:radius-d};
    const len=Math.sqrt(l)||1;return{nx:-dz/len,nz:dx/len,depth:radius};
  }
  const qx=clamp(x,o.x1,o.x2),qz=clamp(z,o.z1,o.z2),dx=x-qx,dz=z-qz,d=Math.hypot(dx,dz);
  if(d>=r)return null;
  if(d>1e-7)return{nx:dx/d,nz:dz/d,depth:r-d};
  const faces=[{nx:-1,nz:0,d:x-o.x1},{nx:1,nz:0,d:o.x2-x},{nx:0,nz:-1,d:z-o.z1},{nx:0,nz:1,d:o.z2-z}].sort((a,b)=>a.d-b.d);
  return{...faces[0],depth:r+faces[0].d};
}

export function contacts(state,grid,cfg=DRIVE){
  const out=[];
  for(const sign of[-1,1]){
    const x=state.x+Math.sin(state.yaw)*cfg.collisionOffset*sign,z=state.z+Math.cos(state.yaw)*cfg.collisionOffset*sign;
    for(const obstacle of grid.nearby(x,z,cfg.collisionRadius+.2)){
      const c=circleContact(x,z,cfg.collisionRadius,obstacle);if(c)out.push({...c,obstacle});
    }
  }
  return out;
}

export function createState(spawn){return{x:spawn.x,z:spawn.z,yaw:spawn.yaw,speed:0,steering:0,distance:0,collisions:0,collisionPulse:0,...effectState()};}
export function resetState(s,spawn){Object.assign(s,createState(spawn));}

export function step(s,input,dt,grid,bounds,cfg=DRIVE){
  const previous={x:s.x,z:s.z,yaw:s.yaw};
  const previousSpeed=s.speed;updateEffects(s,input,dt,cfg);
  const boosting=s.boostRemaining>0;
  let acceleration=0;
  if(input.throttle)acceleration=s.speed<-.1?cfg.braking:cfg.acceleration;
  else if(input.brake)acceleration=s.speed>.1?-cfg.braking:-cfg.reverseAcceleration;
  else s.speed=toward(s.speed,0,cfg.rollingResistance*dt);
  if(input.throttle&&input.brake)acceleration=-Math.sign(s.speed)*cfg.braking;
  const old=s.speed;
  s.speed+=acceleration*(boosting&&acceleration>0?cfg.boostAccelerationMultiplier:1)*dt;
  if(input.throttle&&input.brake&&old*s.speed<0)s.speed=0;
  s.speed-=Math.sign(s.speed)*cfg.drag*s.speed*s.speed*dt;
  if(input.handbrake)s.speed=toward(s.speed,0,(s.drifting?cfg.driftDrag:cfg.handbrake)*dt);
  const speedCap=boosting?cfg.maxSpeed*cfg.boostMultiplier:Math.max(cfg.maxSpeed,previousSpeed-cfg.boostDecay*dt);
  s.speed=clamp(s.speed,-cfg.reverseSpeed,speedCap);
  const steerFactor=clamp(Math.abs(s.speed)/cfg.maxSpeed,0,1),maxSteer=cfg.steeringLow+(cfg.steeringHigh-cfg.steeringLow)*steerFactor*steerFactor;
  const direction=(input.left?1:0)-(input.right?1:0);
  const steerRate=direction===0?cfg.steeringReturnRate:direction*s.steering<0?cfg.counterSteeringRate:cfg.steeringRate;
  s.steering=toward(s.steering,direction*maxSteer*(s.drifting?cfg.driftSteeringMultiplier:1),steerRate*dt);
  if(direction&&!s.drifting&&s.speed>cfg.turnSpeed)s.speed=toward(s.speed,cfg.turnSpeed,cfg.turnDeceleration*dt);
  const yawLimit=cfg.yawRateLow+(cfg.yawRateHigh-cfg.yawRateLow)*steerFactor;
  s.yaw+=clamp(s.speed/cfg.wheelbase*Math.tan(s.steering),-yawLimit,yawLimit)*dt;
  const travelYaw=s.yaw-(s.drifting?s.driftSide*cfg.driftSlipAngle:0);
  s.x+=Math.sin(travelYaw)*s.speed*dt;s.z+=Math.cos(travelYaw)*s.speed*dt;
  let collision=false,maxImpact=0;
  for(let n=0;n<8;n++){
    const found=contacts(s,grid,cfg);if(!found.length)break;
    found.sort((a,b)=>b.depth-a.depth);const c=found[0];
    s.x+=c.nx*(c.depth+.001);s.z+=c.nz*(c.depth+.001);
    maxImpact=Math.max(maxImpact,Math.abs(Math.sin(s.yaw)*c.nx+Math.cos(s.yaw)*c.nz));collision=true;
  }
  // Keep the last safe pose if a tight corner cannot be resolved. Never tunnel.
  if(contacts(s,grid,cfg).some(c=>c.depth>.005)){Object.assign(s,previous);collision=true;maxImpact=1;}
  if(bounds){const x=clamp(s.x,bounds.x1+1.1,bounds.x2-1.1),z=clamp(s.z,bounds.z1+1.1,bounds.z2-1.1);if(x!==s.x||z!==s.z){s.x=x;s.z=z;collision=true;maxImpact=1;}}
  if(collision){
    cancelDrift(s);s.boostRemaining=0;
    // Continuous glancing contact keeps tangential movement; repeated speed
    // multiplication every physics step would glue the car to the wall.
    if(maxImpact>cfg.collisionHeadOnThreshold)s.speed=Math.sign(s.speed)*Math.min(Math.abs(s.speed),cfg.collisionCrawlSpeed);
    else if(s.collisionPulse<=0)s.speed*=cfg.collisionSpeedRetention;
    s.collisionPulse=.3;s.collisions++;
  }
  s.collisionPulse=Math.max(0,s.collisionPulse-dt);
  s.distance+=Math.hypot(s.x-previous.x,s.z-previous.z);
  return collision;
}

export class FixedSimulation {
  constructor(state,grid,bounds,cfg=DRIVE){this.state=state;this.grid=grid;this.bounds=bounds;this.cfg=cfg;this.accumulator=0;}
  advance(seconds,input,onStep){
    this.accumulator+=Math.min(Math.max(0,seconds),this.cfg.maxFrameTime);let steps=0;
    const planned=Math.min(this.cfg.maxSteps,Math.floor((this.accumulator+1e-10)/this.cfg.fixedStep));
    while(this.accumulator>=this.cfg.fixedStep&&steps<this.cfg.maxSteps){
      const from=onStep?{x:this.state.x,z:this.state.z}:null;
      step(this.state,typeof input==='function'?input(this.state):input,this.cfg.fixedStep,this.grid,this.bounds,this.cfg);this.accumulator-=this.cfg.fixedStep;steps++;
      if(onStep&&onStep(from,this.state,(steps-1)/planned,steps/planned)===false){this.accumulator=0;break;}
    }
    if(steps>=this.cfg.maxSteps)this.accumulator=0;return steps;
  }
  clear(){this.accumulator=0;}
}
