import { world,pointAt,lengthMetres,roadWidthAt } from './track-config.js?build=20261031-wildlife3';
import {contacts} from './drive-core.js?build=20261031-wildlife3';
import {getDifficulty} from './difficulty-config.js?build=20261031-wildlife3';
const cache=new Map(),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function path(route){if(cache.has(route.id))return cache.get(route.id);const length=lengthMetres(route.points),count=Math.ceil(length/.18),poses=Array.from({length:count},(_,i)=>world(pointAt(route.points,i/count))),cumulative=[0];for(let i=1;i<route.points.length;i++)cumulative.push(cumulative.at(-1)+Math.hypot(...route.points[i].map((x,j)=>(x-route.points[i-1][j])/18)));const data={length,count,poses,gateSamples:route.checkpoints.map(i=>Math.round(cumulative[i]/length*count)%count)};cache.set(route.id,data);return data;}
export function createRouteDriver(route,difficulty='normal',trafficOptions=null){
  const cfg=getDifficulty(difficulty),{poses,length,count,gateSamples}=path(route),metres=length/count,widthCache=new Map();let cursor=count-1,last=null,lane=0,chosenSide=0;
  const at=i=>poses[((Math.round(i)%count)+count)%count];
  return(s,race)=>{
    if(!last||Math.hypot(s.x-last.x,s.z-last.z)>3){cursor=race?.expected?gateSamples[Math.min(gateSamples.length-1,race.expected-1)]:count-1;}
    let best=cursor,error=Infinity;for(let n=-Math.ceil(5/metres);n<=Math.ceil(9/metres);n++){const i=cursor+n,p=at(i),d=(s.x-p[0])**2+(s.z-p[1])**2;if(d<error){error=d;best=i;}}cursor=((best%count)+count)%count;last={x:s.x,z:s.z};
    const index=trafficOptions?.index??0,clock=(race?.elapsed??0);
    const pace=trafficOptions?[.99,1.035,.965][index%3]+.025*Math.sin(clock*.19+index*2.1):1;
    let target=cfg.speed*pace;
    const braking=3+Math.max(0,s.speed*s.speed)/(2*10);
    for(let d=0;d<=braking;d+=.7){const i=cursor+d/metres,a=at(i-1.0/metres),b=at(i),c=at(i+1.0/metres),u=Math.atan2(b[0]-a[0],b[1]-a[1]),v=Math.atan2(c[0]-b[0],c[1]-b[1]),bend=Math.abs(Math.atan2(Math.sin(v-u),Math.cos(v-u))),corner=clamp(cfg.bravery/(bend+.015),cfg.corner,cfg.speed);target=Math.min(target,Math.sqrt(corner*corner+2*8*Math.max(0,d-.7)));}
    const look=clamp(1.0+Math.max(0,s.speed)*.22,1.4,3.5),centre=at(cursor),p=[...at(cursor+look/metres)];
    if(trafficOptions){
      if(trafficOptions.lastPlan===undefined||clock-trafficOptions.lastPlan>=.12){
        trafficOptions.lastPlan=clock;
        const tangent=at(cursor+1/metres),yaw=Math.atan2(tangent[0]-centre[0],tangent[1]-centre[1]),fx=Math.sin(yaw),fz=Math.cos(yaw);
        // Wide stadium sections permit side-by-side lines; narrow passages merge early.
        let room=.85;
        for(let d=0;d<=Math.max(7,s.speed*1.4);d+=1){
          const q=at(cursor+d/metres),pixel=[q[0]*18+1100,q[1]*18+700];
          const stadium=pixel[0]>480&&pixel[0]<1710&&pixel[1]>1320&&pixel[1]<1850;
          const key=Math.round(((cursor+d/metres)%count+count)%count);
          if(!widthCache.has(key))widthCache.set(key,stadium?3.6:roadWidthAt(route,pixel));
          room=Math.min(room,Math.max(0,widthCache.get(key)/2-1.05));
          const a=at(cursor+(d-1)/metres),b=at(cursor+(d+1)/metres),heading=Math.atan2(b[0]-a[0],b[1]-a[1]);
          if(Math.abs(Math.atan2(Math.sin(heading-yaw),Math.cos(heading-yaw)))>.20)room=0;
        }
        const peers=trafficOptions.traffic?.()??[];
        const ahead=peers.map(o=>o.state??o).filter(o=>o!==s&&Math.cos(o.yaw-yaw)>.7).map(o=>({s:o,along:(o.x-s.x)*fx+(o.z-s.z)*fz,side:(o.x-centre[0])*fz-(o.z-centre[1])*fx}));
        const leader=ahead.find(o=>o.along>0&&o.along<9&&Math.abs(o.side-lane)<1.5);
        if(leader&&room>.4){
          if(!chosenSide)chosenSide=leader.side>0?-1:leader.side<0?1:index%2?1:-1;
        }else if(!ahead.some(o=>o.along>-3&&o.along<9))chosenSide=0;
        let wanted=room*(chosenSide||[0,1,-1][index%3]);
        if(ahead.some(o=>Math.abs(o.along)<2.3&&Math.abs(o.side-wanted)<1.3)){
          const alternate=-wanted;
          if(!ahead.some(o=>Math.abs(o.along)<2.3&&Math.abs(o.side-alternate)<1.3))wanted=alternate;
        }
        // Probe the actual school obstacles, including platform heights, before shifting.
        if(trafficOptions.grid&&Math.abs(wanted)>.01){
          for(let d=0;d<=look+2;d+=.8){const q=at(cursor+d/metres),n=at(cursor+(d+.4)/metres),a=Math.atan2(n[0]-q[0],n[1]-q[1]);
            if(contacts({x:q[0]+Math.cos(a)*wanted,z:q[1]-Math.sin(a)*wanted,yaw:a},trafficOptions.grid,trafficOptions.cfg).length){wanted=0;break;}}
        }
        trafficOptions.wanted=wanted;trafficOptions.room=room;
      }
      const {wanted,room}=trafficOptions;
      const dt=clamp(clock-(trafficOptions.lastClock??clock),0,.05);trafficOptions.lastClock=clock;
      lane+=clamp(wanted-lane,-dt*.7,dt*.7);
      // Return to the centre promptly before narrow corners, without teleporting.
      if(room===0)lane*=Math.exp(-dt*5);
      const q=at(cursor+(look+.5)/metres),a=Math.atan2(q[0]-p[0],q[1]-p[1]);p[0]+=Math.cos(a)*lane;p[1]-=Math.sin(a)*lane;
      s.aiLane=lane;s.aiOvertaking=!!chosenSide&&room>.4;s.aiTargetSpeed=target;
    }
    const desired=Math.atan2(p[0]-s.x,p[1]-s.z),angle=Math.atan2(Math.sin(desired-s.yaw),Math.cos(desired-s.yaw));
    if(Math.abs(angle)>.5)target=Math.min(target,Math.max(cfg.corner,4-Math.abs(angle)*2));
    return{throttle:s.speed<target,brake:s.speed>target+.25,left:angle>.025,right:angle<-.025,handbrake:false};
  };
}
