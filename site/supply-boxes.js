import {world,pointAt,lengthMetres,roadWidthAt} from './track-config.js?build=20261101-items1';
export function makeSupplyBoxes(route,gates,{heightAt=()=>0,isClear=()=>true}={}){
  const length=lengthMetres(route.points),at=d=>world(pointAt(route.points,d/length)),candidates=[];
  const cumulative=[0];for(let i=1;i<route.points.length;i++)cumulative.push(cumulative.at(-1)+Math.hypot(route.points[i][0]-route.points[i-1][0],route.points[i][1]-route.points[i-1][1])/18);
  const checkpoints=route.checkpoints.map(i=>cumulative[i]);
  for(let d=8;d<length-7;d+=2){
    const [x,z]=at(d),[ax,az]=at(d-10),[bx,bz]=at(d+12),[cx,cz]=at(d-.5),[dx,dz]=at(d+.5),yaw=Math.atan2(dx-cx,dz-cz),before=Math.atan2(x-ax,z-az),after=Math.atan2(bx-x,bz-z),bend=Math.abs(Math.atan2(Math.sin(after-before),Math.cos(after-before))),width=roadWidthAt(route,[x*18+1100,z*18+700]);
    if(width<2.35||bend>.18||heightAt(x,z)>.08||Math.abs(heightAt(ax,az)-heightAt(bx,bz))>.06||gates.some(g=>Math.hypot(g.x-x,g.z-z)<3.2)||!isClear(x,z,yaw))continue;
    candidates.push({distance:d,x,z,y:heightAt(x,z),yaw,width});
  }
  const groups=[];for(const p of candidates)if(!groups.length||p.distance-groups.at(-1).distance>=44)groups.push(p);
  // The start seam belongs to one group, even on routes that revisit a passage.
  const unique=groups.filter((p,i)=>!groups.slice(0,i).some(q=>Math.hypot(q.x-p.x,q.z-p.z)<5));
  return unique.map((p,i)=>({...p,id:`supply-${i}`,sections:[...new Set(groups.filter(q=>Math.hypot(q.x-p.x,q.z-p.z)<5).map(q=>{const next=checkpoints.findIndex(d=>d>q.distance);return next<0?0:next;}))]}));
}
