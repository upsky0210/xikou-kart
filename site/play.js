import { InputState, KEY_ACTION } from './drive-core.js?build=20261026-friendly3';
import { ROUTES, ORIGIN, SCALE } from './track-config.js?build=20261026-friendly3';
import { DRIVE } from './drive-config.js?build=20261026-friendly3';
const $=s=>document.querySelector(s),frame=$('#world'),inputs=new InputState();
let ready=false,started=false,paused=false,helpOpen=false,lastState=null,toastTimer=0;
const send=(type,data={})=>frame.contentWindow.postMessage({source:'kart-controls',type,...data},location.origin);
const inMenu=()=>!started||paused||helpOpen;
function flush(){inputs.clear();for(const b of document.querySelectorAll('[data-action]'))b.classList.remove('pressed');send('clear');}
function syncInput(){if(!inMenu())send('input',{input:inputs.value()});}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('on'),2200);}
function setMenu(){document.body.classList.toggle('in-menu',inMenu());$('#startScreen').hidden=started;$('#pauseScreen').hidden=!paused||helpOpen||!started;$('#helpScreen').hidden=!helpOpen;$('#pause').setAttribute('aria-label',paused?'繼續試駕':'暫停試駕');$('#pause').textContent=paused?'▶':'Ⅱ';}
function setPause(value){if(!started)return;paused=value;flush();send('pause',{paused});setMenu();}
function start(){if(!ready)return;started=true;paused=false;helpOpen=false;flush();send('start');setMenu();}
$('#start').onclick=start;$('#resume').onclick=()=>setPause(false);$('#pause').onclick=()=>setPause(!paused);
$('#touchToggle').onclick=()=>{const on=document.body.classList.toggle('touch-preview');$('#touchToggle').setAttribute('aria-pressed',String(on));$('#touchToggle').setAttribute('aria-label',on?'隱藏觸控按鈕':'顯示觸控按鈕');flush();};
$('#restart').onclick=()=>{flush();send('restart');paused=false;setMenu();};
$('#reset').onclick=()=>{flush();send('reset');};
$('#help').onclick=()=>{helpOpen=true;if(started){paused=true;flush();send('pause',{paused:true});}setMenu();};
$('#closeHelp').onclick=()=>{helpOpen=false;setMenu();};
document.querySelectorAll('[data-spawn]').forEach(b=>b.onclick=()=>{flush();send('spawn',{id:b.dataset.spawn});document.querySelectorAll('[data-spawn]').forEach(el=>el.classList.toggle('active',el===b));toast(b.dataset.spawn==='field'?'操場環線 · R 回到鄰近賽道':`${b.dataset.spawn==='north'?'北側':'東側'}探索 · v221 開放戶外配置`);});
addEventListener('keydown',e=>{
  if(KEY_ACTION[e.code]){e.preventDefault();if(!inMenu())inputs.set(`key:${e.code}`,KEY_ACTION[e.code]);syncInput();}
  if(e.repeat)return;
  if(e.code==='Enter'){e.preventDefault();if(!started)start();else if(paused)setPause(false);else{flush();send('restart');}}
  if(e.code==='KeyR'&&started){flush();send('reset');}
  if((e.code==='Escape'||e.code==='KeyP')&&started){if(helpOpen){helpOpen=false;setMenu();}else setPause(!paused);}
});
addEventListener('keyup',e=>{if(KEY_ACTION[e.code]){e.preventDefault();inputs.set(`key:${e.code}`,null);syncInput();}});
addEventListener('blur',flush);
document.addEventListener('visibilitychange',()=>{if(document.hidden){flush();if(started)setPause(true);}});
for(const b of document.querySelectorAll('[data-action]')){
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(inMenu())return;b.setPointerCapture(e.pointerId);inputs.set(`pointer:${e.pointerId}`,b.dataset.action);b.classList.add('pressed');syncInput();});
  const release=e=>{inputs.set(`pointer:${e.pointerId}`,null);if(![...inputs.sources.values()].includes(b.dataset.action))b.classList.remove('pressed');syncInput();};
  b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
  b.addEventListener('contextmenu',e=>e.preventDefault());
}

const canvas=$('#minimap'),ctx=canvas.getContext('2d'),bg=document.createElement('canvas');bg.width=400;bg.height=440;
function drawBase(){
  const c=bg.getContext('2d'),D=window.CAMPUS;
  c.fillStyle='#e0e8d8';c.fillRect(0,0,400,440);
  const X=x=>30+(x-300)/1660*340,Y=y=>20+(y-40)/2160*390;
  c.fillStyle='#d2dfc6';c.strokeStyle='#95aa8b';c.lineWidth=2;c.fillRect(X(300),Y(40),X(1960)-X(300),Y(2200)-Y(40));c.strokeRect(X(300),Y(40),X(1960)-X(300),Y(2200)-Y(40));
  for(const r of D.rooms.filter(r=>r.floor==='1F'&&r.type!=='garden')){c.fillStyle={A:'#bbc8af',B:'#a8c3c6',C:'#cebd9d',D:'#a8bea0'}[r.building]||'#bdc9af';c.fillRect(X(r.rect[0]),Y(r.rect[1]),X(r.rect[2])-X(r.rect[0]),Y(r.rect[3])-Y(r.rect[1]));}
  c.fillStyle='#a9c1c8';const p=D.outdoor.pool;c.fillRect(X(p[0]),Y(p[1]),X(p[2])-X(p[0]),Y(p[3])-Y(p[1]));
  c.beginPath();ROUTES.field.points.forEach((p,i)=>{i?c.lineTo(X(p[0]),Y(p[1])):c.moveTo(X(p[0]),Y(p[1]));});c.strokeStyle='#21958f';c.lineWidth=8;c.stroke();
  c.font='14px "Microsoft JhengHei",sans-serif';c.fillStyle='#6b8373';c.textAlign='center';c.fillText('校舍',X(1100),Y(650));c.fillText('操場',X(1100),Y(1600));
  c.fillStyle='#dec26a';c.fillRect(X(300)-4,Y(770),8,Y(880)-Y(770));
}
drawBase();
function drawMap(s){ctx.drawImage(bg,0,0);const px=s.x*SCALE+ORIGIN[0],py=s.z*SCALE+ORIGIN[1],x=30+(px-300)/1660*340,y=20+(py-40)/2160*390;ctx.save();ctx.translate(x,y);ctx.rotate(-s.yaw);ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(-9,-8);ctx.lineTo(9,-8);ctx.closePath();ctx.fillStyle='#f4c65e';ctx.strokeStyle='#23484a';ctx.lineWidth=3;ctx.fill();ctx.stroke();ctx.restore();}
addEventListener('message',e=>{
  if(e.source!==frame.contentWindow||e.origin!==location.origin||e.data?.source!=='kart-drive')return;
  const data=e.data;
  if(data.type==='ready'){ready=true;$('#start').disabled=false;$('#start').innerHTML='開始試駕 <span>→</span>';$('#loadHint').textContent='電腦用鍵盤；平板可同時按油門與轉向';document.body.dataset.ready='true';const pre=document.createElement('script');pre.id='game-report';pre.type='application/json';pre.textContent=JSON.stringify(data);document.body.append(pre);}
  if(data.type==='started'){started=true;paused=false;setMenu();}
  if(data.type==='pause'){paused=data.paused;flush();setMenu();}
  if(data.type==='reset')toast(`已重置 · ${data.spawn}`);
  if(data.type==='state'){
    const s=lastState=data.state;
    $('#speed').textContent=Math.round(Math.abs(s.speed)*3.6);$('#gear').textContent=s.speed<-.15?'R':s.speed>.15?'D':'N';$('#speedBar').style.width=`${Math.min(100,Math.abs(s.speed)/DRIVE.maxSpeed*100)}%`;
    $('#driveStatus').textContent=s.paused?'已暫停':!s.playing?'準備試駕':s.speed<-.15?'倒車中':'自由試駕 · 尚未計時';
    $('#collisionHint').textContent=s.collisionPulse>0?'碰撞減速 · 可倒車脫離':'自由試駕 · 尚未計時';
    const labels={field:'操場環線',north:'北側開放通道',east:'東側開放通道'};$('#area').textContent=labels[s.spawn];$('#mapLabel').textContent=s.spawn==='field'?'操場':'校園探索';
    drawMap(s);let pre=$('#game-state');if(!pre){pre=document.createElement('script');pre.id='game-state';pre.type='application/json';document.body.append(pre);}pre.textContent=JSON.stringify(s);
  }
  if(data.type==='metrics'){$('#fps').textContent=`${Math.round(data.metrics.fps)} FPS`;let pre=$('#game-metrics');if(!pre){pre=document.createElement('script');pre.id='game-metrics';pre.type='application/json';document.body.append(pre);}pre.textContent=JSON.stringify(data.metrics);}
});
setTimeout(()=>{if(!ready){$('#loadHint').textContent='場景仍在載入，若長時間未完成請重新整理。';}},25000);
setMenu();
