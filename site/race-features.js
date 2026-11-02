import {DIRECTION,ROCKET} from './race-features-config.js?build=20261102-features1';
const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export class DirectionMonitor {
 constructor(){this.reset();}
 reset(){this.bad=0;this.away=0;this.previous=null;this.gate=null;this.warning=false;this.bearing=0;}
 update(s,race,dt){
  if(race.phase!=='racing'){this.reset();return;}
  const index=race.expected%race.gates.length,g=race.gates[index],distance=Math.hypot(g.x-s.x,g.z-s.z);
  this.bearing=angle(Math.atan2(g.x-s.x,g.z-s.z)-s.yaw);
  if(index!==this.gate){this.bad=0;this.away=0;this.previous=null;this.gate=index;this.warning=false;}
  const moving=Math.abs(s.speed)>DIRECTION.minSpeed&&distance>DIRECTION.gateRadius;
  const bad=moving&&Math.abs(this.bearing)>DIRECTION.angleDegrees*Math.PI/180;
  const away=moving&&this.previous!==null&&(distance-this.previous)/dt>DIRECTION.minAwaySpeed;
  this.bad=bad?this.bad+dt:0;this.away=away?this.away+dt:0;this.previous=distance;
  this.warning=(bad||away)&&(this.warning||this.bad>=DIRECTION.angleSeconds||this.away>=DIRECTION.awaySeconds);
 }
 snapshot(){return {warning:this.warning,bearing:this.bearing};}
}
export class RocketStart {
 constructor(){this.reset();}
 reset(){this.held=false;this.pressedAt=null;this.outcome='pending';}
 update(throttle,time){
  if(throttle&&!this.held)this.pressedAt=time;
  if(!throttle&&this.outcome==='pending')this.pressedAt=null;
  this.held=throttle;
  if(this.outcome==='pending'&&time>=0){
   if(throttle&&this.pressedAt < -ROCKET.beforeGo)this.outcome='burn';
   else if(throttle&&this.pressedAt<=ROCKET.afterGo)this.outcome='boost';
   else if(time>ROCKET.afterGo)this.outcome='normal';
  }
  return this.outcome;
 }
}
export function rocketConfig(state,cfg,dt){
 if(!(state.rocketRemaining>0))return cfg;
 const active=state.rocketRemaining;state.rocketRemaining=Math.max(0,active-dt);
 return {...cfg,acceleration:cfg.acceleration*(state.rocketOutcome==='boost'?ROCKET.accelerationMultiplier:ROCKET.burnMultiplier),maxSpeed:cfg.maxSpeed*(state.rocketOutcome==='boost'?ROCKET.speedMultiplier:1)};
}
