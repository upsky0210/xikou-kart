import { createState, FixedSimulation } from './drive-core.js?build=20261026-courtyard6';
import { RaceSession } from './race-core.js?build=20261026-courtyard6';
import { regressionInput } from './qa-driver.js?build=20261026-courtyard6';

// A physical driver: walls, gates and countdown use the same rules as the player.
// Cars do not collide with each other, so a narrow corridor cannot be blocked.
export class Opponent {
  constructor({gates,laps,grid,bounds,cfg,route,index=0}) {
    const g=gates[0],offset=6+index*1.5;
    this.state=createState({x:g.x-g.fx*offset,z:g.z-g.fz*offset,yaw:Math.atan2(g.fx,g.fz)});
    this.race=new RaceSession({gates,laps,name:`電腦車手 ${index+1}`,id:`opponent-${index}`}).begin();
    this.simulation=new FixedSimulation(this.state,grid,bounds,cfg);
    this.route=route;this.stuck=0;
  }
  advance(seconds) {
    if(this.race.phase==='finished')return;
    const span=this.race.advance(Math.max(0,seconds));
    this.simulation.advance(span.driveSeconds,s=>regressionInput(s,7.6,this.route),(from,to,a,b)=>{
      if(this.race.observeMove(from,to,span.fromTime+(span.toTime-span.fromTime)*a,span.fromTime+(span.toTime-span.fromTime)*b)){this.state.speed=0;return false;}
    });
    this.stuck=this.state.collisionPulse>0&&Math.abs(this.state.speed)<1?this.stuck+Math.min(seconds,.2):0;
    if(this.stuck>2){Object.assign(this.state,createState(this.race.resetPose()));this.simulation.clear();this.stuck=0;}

  }
}
export function racePosition(player,state,opponent){
  const other=opponent.race;
  if(player.phase==='finished')return other.phase==='finished'?(player.elapsed<=other.elapsed?1:2):1;
  if(other.phase==='finished')return 2;
  const progress=r=>r.lapTimes.length*r.gates.length+r.expected;
  const a=progress(player),b=progress(other);if(a!==b)return a>b?1:2;
  const g=player.gates[player.expected%player.gates.length];
  return Math.hypot(state.x-g.x,state.z-g.z)<=Math.hypot(opponent.state.x-g.x,opponent.state.z-g.z)?1:2;
}

export function fleetPosition(player,state,opponents){
  return 1+opponents.filter(opponent=>racePosition(player,state,opponent)===2).length;
}
