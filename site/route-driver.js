import { world,pointAt,lengthMetres } from './track-config.js?build=sculpted-crew4';
import {getDifficulty} from './difficulty-config.js?build=sculpted-crew4';
const cache=new Map(),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function path(route){if(cache.has(route.id))return cache.get(route.id);const length=lengthMetres(route.points),count=Math.ceil(length/.18),poses=Array.from({length:count},(_,i)=>world(pointAt(route.points,i/count))),cumulative=[0];for(let i=1;i<route.points.length;i++)cumulative.push(cumulative.at(-1)+Math.hypot(...route.points[i].map((x,j)=>(x-route.points[i-1][j])/18)));const data={length,count,poses,gateSamples:route.checkpoints.map(i=>Math.round(cumulative[i]/length*count)%count)};cache.set(route.id,data);return data;}
export function createRouteDriver(route,difficulty='normal'){
  const cfg=getDifficulty(difficulty),{poses,length,count,gateSamples}=path(route),metres=length/count;let cursor=count-1,last=null;
  const at=i=>poses[((Math.round(i)%count)+count)%count];
  return(s,race)=>{
    if(!last||Math.hypot(s.x-last.x,s.z-last.z)>3){cursor=race?.expected?gateSamples[Math.min(gateSamples.length-1,race.expected-1)]:count-1;}
    let best=cursor,error=Infinity;for(let n=-Math.ceil(5/metres);n<=Math.ceil(9/metres);n++){const i=cursor+n,p=at(i),d=(s.x-p[0])**2+(s.z-p[1])**2;if(d<error){error=d;best=i;}}cursor=((best%count)+count)%count;last={x:s.x,z:s.z};
    let target=cfg.speed;
    const braking=3+Math.max(0,s.speed*s.speed)/(2*10);
    for(let d=0;d<=braking;d+=.7){const i=cursor+d/metres,a=at(i-1.0/metres),b=at(i),c=at(i+1.0/metres),u=Math.atan2(b[0]-a[0],b[1]-a[1]),v=Math.atan2(c[0]-b[0],c[1]-b[1]),bend=Math.abs(Math.atan2(Math.sin(v-u),Math.cos(v-u))),corner=clamp(cfg.bravery/(bend+.015),cfg.corner,cfg.speed);target=Math.min(target,Math.sqrt(corner*corner+2*8*Math.max(0,d-.7)));}
    const look=clamp(1.0+Math.max(0,s.speed)*.22,1.4,3.5),p=at(cursor+look/metres),desired=Math.atan2(p[0]-s.x,p[1]-s.z),angle=Math.atan2(Math.sin(desired-s.yaw),Math.cos(desired-s.yaw));
    if(Math.abs(angle)>.5)target=Math.min(target,Math.max(cfg.corner,4-Math.abs(angle)*2));
    return{throttle:s.speed<target,brake:s.speed>target+.25,left:angle>.025,right:angle<-.025,handbrake:false};
  };
}
