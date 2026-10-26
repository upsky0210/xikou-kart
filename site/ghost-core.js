import { SESSION_SCOPE, ROUTE_ID, ACTIVE_ROUTE } from './session-config.js?build=20261026-courtyard6';
import { DRIVE } from './drive-config.js?build=20261026-courtyard6';
import { BOOST_PADS } from './effects-config.js?build=20261026-courtyard6';
import { TRACK_ID } from './game-version.js?build=20261026-courtyard6';
import { cleanName } from './race-core.js?build=20261026-courtyard6';
export const GHOST_KEY='xikou-kart.ghost.v1';
function fingerprint(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(16);}
export const GHOST_SIGNATURE=`${TRACK_ID}:${fingerprint(JSON.stringify([DRIVE,BOOST_PADS,...(ROUTE_ID==='campus'?[ACTIVE_ROUTE.points]:[])]))}`;
const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export class GhostRecorder {
  constructor(){this.samples=[];this.interval=.1;this.last=-Infinity;}
  record(seconds,state,jump=false,force=false){
    if(!Number.isFinite(seconds)||![state.x,state.z,state.yaw].every(Number.isFinite))return;
    if(!force&&seconds-this.last<this.interval-1e-7)return;
    const row=[Math.round(seconds*1000),+state.x.toFixed(3),+state.z.toFixed(3),+angle(state.yaw).toFixed(4),+(state.steering||0).toFixed(4),state.boostRemaining>0?1:0,jump?1:0];
    if(this.samples.length&&row[0]<=this.samples.at(-1)[0]){if(force)this.samples[this.samples.length-1]=row;return;}
    this.samples.push(row);this.last=seconds;
    if(this.samples.length>5000){this.samples=this.samples.filter((_,i)=>i%2===0);this.interval*=2;}
  }
  finish(result,state){
    this.record(result.totalMs/1000,state,false,true);
    return{version:1,track:TRACK_ID,signature:GHOST_SIGNATURE,name:cleanName(result.name),totalMs:result.totalMs,date:result.date,samples:this.samples};
  }
}
export function validGhost(value,name){
  if(!value||value.version!==1||value.track!==TRACK_ID||value.signature!==GHOST_SIGNATURE||value.name!==cleanName(name)||!Number.isInteger(value.totalMs)||value.totalMs<=0||value.totalMs>86400000||!Number.isFinite(Date.parse(value.date))||!Array.isArray(value.samples)||value.samples.length<2||value.samples.length>5001)return null;
  let last=-1;
  for(const s of value.samples){
    if(!Array.isArray(s)||s.length!==7||!s.every(Number.isFinite)||!Number.isInteger(s[0])||s[0]<=last||Math.abs(s[1])>300||Math.abs(s[2])>300||Math.abs(s[3])>Math.PI+.001||Math.abs(s[4])>2||![0,1].includes(s[5])||![0,1].includes(s[6]))return null;
    last=s[0];
  }
  if(value.samples[0][0]!==0||last!==value.totalMs)return null;
  return value;
}
export function ghostPose(ghost,seconds){
  if(!ghost||!Number.isFinite(seconds)||seconds<0||seconds*1000>ghost.totalMs+2000)return null;
  const t=Math.min(ghost.totalMs,seconds*1000),rows=ghost.samples;
  let lo=0,hi=rows.length-1;
  while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(rows[mid][0]<=t)lo=mid;else hi=mid-1;}
  const a=rows[lo],b=rows[Math.min(lo+1,rows.length-1)];
  const f=b[0]===a[0]||b[6]?0:Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0])));
  return{x:a[1]+(b[1]-a[1])*f,z:a[2]+(b[2]-a[2])*f,yaw:angle(a[3]+angle(b[3]-a[3])*f),steering:a[4]+(b[4]-a[4])*f,boost:f<.5?a[5]:b[5],finished:t>=ghost.totalMs};
}
export function ghostKey(name,qa=false){return`${GHOST_KEY}${SESSION_SCOPE}${qa?'.qa':''}:${encodeURIComponent(cleanName(name))}`;}
export function readGhost(storage,name,qa=false){try{const raw=storage?.getItem(ghostKey(name,qa));return raw?validGhost(JSON.parse(raw),name):null;}catch{return null;}}
export function saveGhost(storage,value,qa=false){
  const ghost=validGhost(value,value?.name);if(!ghost)return{saved:false,updated:false,ghost:null};
  const previous=readGhost(storage,ghost.name,qa);
  if(previous&&previous.totalMs<=ghost.totalMs)return{saved:true,updated:false,ghost:previous};
  try{if(!storage)throw Error('Storage unavailable');storage.setItem(ghostKey(ghost.name,qa),JSON.stringify(ghost));return{saved:true,updated:true,ghost};}catch{return{saved:false,updated:true,ghost};}
}
