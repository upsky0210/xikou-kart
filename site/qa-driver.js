// Shared route-following driver for the computer rival and developer regression runs.
import { ROUTES, world, pointAt, lengthMetres } from './track-config.js?build=20261031-racing1';
const paths=new Map();
import { courtyardSlowAt } from './courtyard-route.js?build=20261031-racing1';
function path(route){if(!paths.has(route.id)){const count=1800;paths.set(route.id,{count,length:lengthMetres(route.points),poses:Array.from({length:count},(_,i)=>world(pointAt(route.points,i/count)))});}return paths.get(route.id);}
export function regressionInput(state,targetSpeed=7.6,route=ROUTES.field){
  const {poses,count,length}=path(route);
  let closest=0,distance=Infinity;
  for(let i=0;i<count;i++){const d=Math.hypot(state.x-poses[i][0],state.z-poses[i][1]);if(d<distance){distance=d;closest=i;}}
  const corridor=route.id==='courtyard'&&courtyardSlowAt(state.x,state.z);
  const narrow=corridor||route.id==='campus'&&(state.x<-29||state.z<-30);if(narrow)targetSpeed=Math.min(targetSpeed,corridor?2.6:4.2);
  const p=poses[(closest+Math.round((corridor?1.4:narrow?1.6:4.1)/length*count))%count],desired=Math.atan2(p[0]-state.x,p[1]-state.z),error=Math.atan2(Math.sin(desired-state.yaw),Math.cos(desired-state.yaw));
  return{throttle:state.speed<targetSpeed,brake:state.speed>targetSpeed+.5,left:error>.025,right:error<-.025,handbrake:false};
}
