import { DRIVE } from './drive-config.js?build=grand-difficulty2';
import { BOOST_PADS } from './effects-config.js?build=grand-difficulty2';
export function effectState(){return{drifting:false,driftCharge:0,driftSide:0,boostRemaining:0,boostSource:'',boostCount:0,driftBoosts:0,padBoosts:0,padCooldown:0,padInside:[]};}
export function triggerBoost(s,source,cfg=DRIVE){
  s.boostRemaining=Math.max(s.boostRemaining,cfg.boostDuration);s.boostSource=source;s.boostCount++;
  if(source==='drift')s.driftBoosts++;else s.padBoosts++;
  s.speed=Math.min(cfg.maxSpeed*cfg.boostMultiplier,Math.max(0,s.speed)+cfg.boostKick);
}
export function insidePad(s,pad){
  const dx=s.x-pad.x,dz=s.z-pad.z,fx=Math.sin(pad.yaw),fz=Math.cos(pad.yaw);
  return Math.abs(dx*fx+dz*fz)<=pad.length/2&&Math.abs(dx*fz-dz*fx)<=pad.width/2;
}
export function updateEffects(s,input,dt,cfg=DRIVE){
  s.boostRemaining=Math.max(0,s.boostRemaining-dt);s.padCooldown=Math.max(0,s.padCooldown-dt);
  const side=(input.left?1:0)-(input.right?1:0);
  const drifting=!!input.handbrake&&!input.brake&&side!==0&&s.speed>=cfg.driftMinSpeed;
  if(drifting){s.driftCharge=Math.min(1,s.driftCharge+cfg.driftChargeRate*dt);s.driftSide=side;}
  else{
    if(s.drifting&&!input.handbrake&&!input.brake&&s.driftCharge>=1-1e-7&&s.speed>=cfg.driftMinSpeed)triggerBoost(s,'drift',cfg);
    s.driftCharge=0;s.driftSide=0;
  }
  s.drifting=drifting;
  const inside=BOOST_PADS.filter(p=>insidePad(s,p));
  for(const pad of inside){
    if(!s.padInside.includes(pad.id)&&s.padCooldown===0&&s.speed>1&&Math.cos(s.yaw-pad.yaw)>.35){triggerBoost(s,'pad',cfg);s.padCooldown=cfg.padCooldown;}
  }
  s.padInside=inside.map(p=>p.id);
}
export function cancelDrift(s){s.drifting=false;s.driftCharge=0;s.driftSide=0;}
