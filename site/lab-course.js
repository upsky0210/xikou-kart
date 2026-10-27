import { world } from './track-config.js?build=premium-roster-open1';
import { DRIVE } from './drive-config.js?build=premium-roster-open1';
// A local greybox study of D's west corridor and the courtyard. Plan scale: 18 px/m.
export const LAB_DRIVE=Object.freeze({...DRIVE,maxSpeed:4.5,acceleration:3,reverseSpeed:2,turnSpeed:2.8,turnDeceleration:6,driftMinSpeed:99});
const controls=[[675,740],[1000,740],[1000,960],[675,960]];
const dense=[];
for(let i=0;i<controls.length;i++){
  const a=controls[(i+controls.length-1)%controls.length],b=controls[i],c=controls[(i+1)%controls.length];
  const l1=Math.hypot(a[0]-b[0],a[1]-b[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(55,l1*.4,l2*.4);
  const p=[b[0]+(a[0]-b[0])*r/l1,b[1]+(a[1]-b[1])*r/l1],q=[b[0]+(c[0]-b[0])*r/l2,b[1]+(c[1]-b[1])*r/l2];
  for(let j=0;j<=18;j++){const t=j/18;dense.push(world([(1-t)**2*p[0]+2*t*(1-t)*b[0]+t*t*q[0],(1-t)**2*p[1]+2*t*(1-t)*b[1]+t*t*q[1]]));}
}
const raw=[];let total=0;
for(let i=0;i<dense.length;i++){const a=dense[i],b=dense[(i+1)%dense.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len>1e-6){raw.push({a,b,start:total,len});total+=len;}}
export const LENGTH=total;
const START_OFFSET=total-105/18;
export const heightAt=x=>Math.max(0,Math.min(1.2,(900-(x*18+1100))/195*1.2));
export function poseAt(distance){const relative=((distance%total)+total)%total,d=(relative+START_OFFSET)%total,s=raw.find(s=>s.start+s.len>=d)||raw.at(-1),t=(d-s.start)/s.len,x=s.a[0]+(s.b[0]-s.a[0])*t,z=s.a[1]+(s.b[1]-s.a[1])*t;return{x,z,y:heightAt(x),yaw:Math.atan2(s.b[0]-s.a[0],s.b[1]-s.a[1]),distance:relative};}
export const SAMPLES=Array.from({length:Math.ceil(total/.22)},(_,i)=>poseAt(i*total/Math.ceil(total/.22)));
export function nearestPose(x,z){let best=null;for(const s of raw){const t=Math.max(0,Math.min(1,((x-s.a[0])*(s.b[0]-s.a[0])+(z-s.a[1])*(s.b[1]-s.a[1]))/s.len**2)),px=s.a[0]+(s.b[0]-s.a[0])*t,pz=s.a[1]+(s.b[1]-s.a[1])*t,error=Math.hypot(x-px,z-pz);if(!best||error<best.error)best={...poseAt(s.start+t*s.len-START_OFFSET),error};}return best;}
export const edge=(p,side)=>({x:p.x+Math.cos(p.yaw)*1.5*side,z:p.z-Math.sin(p.yaw)*1.5*side});
export const BARRIERS=SAMPLES.flatMap((p,i)=>[-1,1].map(side=>{const a=edge(p,side),b=edge(SAMPLES[(i+1)%SAMPLES.length],side);return{ax:a.x,az:a.z,bx:b.x,bz:b.z,thickness:.07,kind:'padded-rail'};}));
export function demoInput(s){const p=nearestPose(s.x,s.z),q=poseAt(p.distance+1.55),target=Math.atan2(q.x-s.x,q.z-s.z),angle=Math.atan2(Math.sin(target-s.yaw),Math.cos(target-s.yaw));return{throttle:s.speed<2.45,brake:false,left:angle>.035,right:angle<-.035,handbrake:false};}
