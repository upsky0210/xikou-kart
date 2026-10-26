import { ACTIVE_ROUTE } from './session-config.js?build=20261026-soft-faces';
import { ROUTES, world } from './track-config.js?build=20261026-soft-faces';
import { TRACK_ID } from './game-version.js?build=20261026-soft-faces';

export function makeGates(route=ACTIVE_ROUTE){
  return route.checkpoints.map((index,i)=>{
    const p=route.points[index],before=route.points[index?index-1:route.points.length-2],after=route.points[(index+1)%(route.points.length-1)];
    const [x,z]=world(p),len=Math.hypot(after[0]-before[0],after[1]-before[1]);
    return{id:i,x,z,fx:(after[0]-before[0])/len,fz:(after[1]-before[1])/len,halfWidth:route.width/2+.45};
  });
}
export function crossedGate(from,to,gate,forward=true){
  const a=(from.x-gate.x)*gate.fx+(from.z-gate.z)*gate.fz,b=(to.x-gate.x)*gate.fx+(to.z-gate.z)*gate.fz;
  if(forward?!(a<0&&b>=0):!(a>0&&b<=0))return null;
  const fraction=a/(a-b),x=from.x+(to.x-from.x)*fraction,z=from.z+(to.z-from.z)*fraction;
  const side=(x-gate.x)*-gate.fz+(z-gate.z)*gate.fx;
  return Math.abs(side)<=gate.halfWidth?fraction:null;
}
export class RaceSession {
  constructor({laps=2,gates=makeGates(),name='訪客',id=''}={}){
    this.totalLaps=Math.max(1,Math.min(9,Math.floor(laps)));this.gates=gates;this.name=cleanName(name);this.id=id;
    this.phase='idle';this.countdown=3;this.elapsed=0;this.lapStart=0;this.lapTimes=[];this.expected=0;this.message='';this.messageUntil=0;this.invalidLaps=0;this.resets=0;
  }
  begin(){this.phase='countdown';return this;}
  advance(seconds){
    let dt=Number.isFinite(seconds)?Math.max(0,seconds):0;
    const fromTime=this.elapsed;
    if(this.phase==='countdown'){
      const consumed=Math.min(this.countdown,dt);this.countdown-=consumed;dt-=consumed;
      if(this.countdown<=1e-8){this.countdown=0;this.phase='racing';this.say('GO！依箭頭通過全部檢查點',2);}
    }
    if(this.phase!=='racing')return{driveSeconds:0,fromTime,toTime:this.elapsed};
    this.elapsed+=dt;
    return{driveSeconds:dt,fromTime,toTime:this.elapsed};
  }
  say(message,duration=2.5){this.message=message;this.messageUntil=this.elapsed+duration;}
  observeMove(from,to,fromTime=this.elapsed,toTime=this.elapsed){
    if(this.phase!=='racing'||Math.hypot(to.x-from.x,to.z-from.z)>4)return false;
    for(const gate of this.gates){
      const fraction=crossedGate(from,to,gate);
      if(fraction===null){if((gate.id===0||gate.id===this.expected)&&crossedGate(from,to,gate,false)!==null)this.say('方向反了，請依路面箭頭前進');continue;}
      const time=fromTime+(toTime-fromTime)*fraction;
      if(gate.id===0){
        if(this.expected===0){this.expected=1;this.say('起跑通過 · 前往下一個光門',1.8);}
        else if(this.expected===this.gates.length){
          const lap=time-this.lapStart;
          if(lap<=0)return false;
          this.lapTimes.push(lap);
          if(this.lapTimes.length===this.totalLaps){this.phase='finished';this.elapsed=time;this.expected=this.gates.length;this.say('完成比賽！',Infinity);return true;}
          this.lapStart=time;this.expected=1;
          this.say(`第 ${this.lapTimes.length+1} 圈 · 再跑一圈！`,3);
        }else{
          this.invalidLaps++;this.expected=1;this.lapStart=time;this.say('漏了檢查點，這圈不計，請重新跑本圈',4);
        }
      }else if(gate.id===this.expected){this.expected++;this.say(this.expected===this.gates.length?'檢查點完成 · 回到終點線！':`檢查點 ${gate.id+1} 通過`,1.6);}
      else if(gate.id>this.expected)this.say(`還沒通過第 ${this.expected+1} 個檢查點`,2.5);
    }
    return false;
  }
  resetPose(){
    this.resets++;this.say('已回到最後通過的檢查點，計時繼續',2.5);
    const gate=this.gates[Math.max(0,Math.min(this.gates.length-1,this.expected-1))],offset=this.expected===0?-3:0;
    return{x:gate.x+gate.fx*offset,z:gate.z+gate.fz*offset,yaw:Math.atan2(gate.fx,gate.fz)};
  }
  snapshot(){return{phase:this.phase,countdown:this.countdown,totalLaps:this.totalLaps,lap:Math.min(this.totalLaps,this.lapTimes.length+1),elapsed:this.elapsed,lapElapsed:Math.max(0,this.elapsed-this.lapStart),lapTimes:[...this.lapTimes],bestLap:this.lapTimes.length?Math.min(...this.lapTimes):null,expected:this.expected,nextGate:this.expected%this.gates.length,passed:Math.min(this.expected,this.gates.length),gateCount:this.gates.length,message:this.elapsed<=this.messageUntil?this.message:'',name:this.name,id:this.id,invalidLaps:this.invalidLaps,resets:this.resets};}
  result(){if(this.phase!=='finished')return null;return{id:this.id,name:this.name,totalMs:Math.round(this.elapsed*1000),lapMs:this.lapTimes.map(s=>Math.round(s*1000)),bestLapMs:Math.round(Math.min(...this.lapTimes)*1000),date:new Date().toISOString(),track:TRACK_ID};}
}
export function cleanName(name){const text=typeof name==='string'?name.trim():'';return Array.from(text).slice(0,16).join('')||'訪客';}
export function formatTime(seconds){if(!Number.isFinite(seconds)||seconds<0)return'—';const ms=Math.round(seconds*1000),minutes=Math.floor(ms/60000);return`${minutes}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;}
