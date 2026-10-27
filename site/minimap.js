import { ACTIVE_ROUTE } from './session-config.js?build=20261026-courtyard6';
import { ROUTES, ORIGIN, SCALE } from './track-config.js?build=20261026-courtyard6';
const $=s=>document.querySelector(s);
const W=window.CAMPUS.outdoor.wall.x2-300,H=window.CAMPUS.outdoor.wall.y2-40;
const canvas=$('#minimap'),ctx=canvas.getContext('2d'),bg=document.createElement('canvas');bg.width=400;bg.height=440;
function drawBase(){
  const c=bg.getContext('2d'),D=window.CAMPUS;
  c.fillStyle='#e0e8d8';c.fillRect(0,0,400,440);
  const X=x=>30+(x-300)/W*340,Y=y=>20+(y-40)/H*390;
  c.fillStyle='#d2dfc6';c.strokeStyle='#95aa8b';c.lineWidth=2;c.fillRect(X(300),Y(40),X(W+300)-X(300),Y(H+40)-Y(40));c.strokeRect(X(300),Y(40),X(W+300)-X(300),Y(H+40)-Y(40));
  for(const r of D.rooms.filter(r=>r.floor==='1F'&&r.type!=='garden')){c.fillStyle={A:'#bbc8af',B:'#a8c3c6',C:'#cebd9d',D:'#a8bea0'}[r.building]||'#bdc9af';c.fillRect(X(r.rect[0]),Y(r.rect[1]),X(r.rect[2])-X(r.rect[0]),Y(r.rect[3])-Y(r.rect[1]));}
  c.fillStyle='#a9c1c8';const p=D.outdoor.pool;c.fillRect(X(p[0]),Y(p[1]),X(p[2])-X(p[0]),Y(p[3])-Y(p[1]));
  c.beginPath();ACTIVE_ROUTE.points.forEach((p,i)=>{i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1]));});c.strokeStyle='#21958f';c.lineWidth=8;c.stroke();
  c.font='14px "Microsoft JhengHei",sans-serif';c.fillStyle='#6b8373';c.textAlign='center';c.fillText('校舍',X(1100),Y(650));c.fillText('操場',X(1100),Y(1600));
  c.fillStyle='#dec26a';c.fillRect(X(300)-4,Y(770),8,Y(880)-Y(770));
}
drawBase();
export function drawMap(s,gate){ctx.drawImage(bg,0,0);for(const r of s.competition?.opponents||[]){ctx.beginPath();ctx.arc(30+(r.x*SCALE+ORIGIN[0]-300)/W*340,20+(r.z*SCALE+ORIGIN[1]-40)/H*390,6,0,Math.PI*2);ctx.fillStyle=r.color||'#e76f51';ctx.fill();}if(gate){ctx.beginPath();ctx.arc(30+(gate.x*SCALE+ORIGIN[0]-300)/W*340,20+(gate.z*SCALE+ORIGIN[1]-40)/H*390,10,0,Math.PI*2);ctx.strokeStyle='#d79932';ctx.lineWidth=4;ctx.stroke();}const px=s.x*SCALE+ORIGIN[0],py=s.z*SCALE+ORIGIN[1],x=30+(px-300)/W*340,y=20+(py-40)/H*390;ctx.save();ctx.translate(x,y);ctx.rotate(-s.yaw);ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(-9,-8);ctx.lineTo(9,-8);ctx.closePath();ctx.fillStyle='#f4c65e';ctx.strokeStyle='#23484a';ctx.lineWidth=3;ctx.fill();ctx.stroke();ctx.restore();}
