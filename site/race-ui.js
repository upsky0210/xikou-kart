import { getDifficulty } from './difficulty-config.js?build=20261031-daynight1';
import { installControlMode } from './control-mode.js?build=20261031-daynight1';
import { RACERS, getRacer, racerPortrait } from './racer-catalog.js?build=20261031-daynight1';
import { ACTIVE_ROUTE, ROUTE_ID, LAPS, SESSION_SCOPE } from './session-config.js?build=20261031-daynight1';
import { InputState, KEY_ACTION } from './drive-core.js?build=20261031-daynight1';
import { DRIVE } from './drive-config.js?build=20261031-daynight1';
import { cleanName, formatTime, makeGates } from './race-core.js?build=20261031-daynight1';
import { LEADERBOARD_KEY, CURRENT_LEADERBOARD_KEY, readLeaderboard, saveResult } from './leaderboard.js?build=20261031-daynight1';
import { drawMap } from './minimap.js?build=20261031-daynight1';
import { readGhost, saveGhost, ghostKey } from './ghost-core.js?build=20261031-daynight1';
import { SpeedFeedback } from './speed-feedback.js?build=20261031-daynight1';
import { GameSound } from './sound.js?build=20261031-daynight1';
import { RULES_LABEL } from './game-version.js?build=20261031-daynight1';

const $=s=>document.querySelector(s),frame=$('#world'),inputs=new InputState(),gates=makeGates();
const QA=new URLSearchParams(location.search).get('qa')==='1';
const storage=(()=>{try{return localStorage;}catch{return null;}})();
const boardKey=CURRENT_LEADERBOARD_KEY+SESSION_SCOPE+(QA?'.qa':'');
const legacyBoardKey=LEADERBOARD_KEY+(QA?'.qa':'');
let selectedRacer='cat';try{selectedRacer=getRacer(storage?.getItem('xikou-kart.racer')).id;}catch{}
const speedFeedback=new SpeedFeedback(),sound=new GameSound(),ghostMemory=new Map();let ghostEnabled=true,muted=false,previewActive=false,lastCount=null,lastBoost=0,lastCollision=0,lastCharged=false;
try{muted=storage?.getItem('xikou-kart.muted')==='1';ghostEnabled=storage?.getItem('xikou-kart.showGhost')!=='0';}catch{}
sound.setMuted(muted);
let board=readLeaderboard(storage,boardKey),ready=false,started=false,paused=false,helpOpen=false,boardOpen=false,finished=false;
let selectedMode='duel',activeMode='race',activeDuel=false,lastState=null,toastTimer=0,result=null;
const savedIds=new Set();
let selectedDifficulty=getDifficulty(new URLSearchParams(location.search).get('difficulty')||storage?.getItem('xikou-kart.difficulty')).id;$('#difficultySelect').value=selectedDifficulty;$('#difficultySelect').onchange=()=>{selectedDifficulty=getDifficulty($('#difficultySelect').value).id;const u=new URL(location.href);u.searchParams.set('difficulty',selectedDifficulty);history.replaceState(null,'',u);try{storage?.setItem('xikou-kart.difficulty',selectedDifficulty);}catch{}};
const send=(type,data={})=>frame.contentWindow.postMessage({source:'kart-controls',type,...data},location.origin);
let lightingTime='noon';
function updateLighting(time){
  if(!['dawn','noon','dusk','night'].includes(time))return;
  lightingTime=time;const night=time==='night',button=$('#dayNightToggle');
  button.textContent=night?'🌙 夜晚':'☀️ 白天';button.setAttribute('aria-pressed',String(night));
  button.setAttribute('aria-label',night?'目前夜晚，切換為白天':'目前白天，切換為夜晚');
  button.title=night?'切換為白天':'切換為夜晚';button.disabled=!ready;
}
$('#dayNightToggle').onclick=()=>{if(!ready)return;const time=lightingTime==='night'?'noon':'night';updateLighting(time);send('lighting',{time});};
const inMenu=()=>!started||paused||helpOpen||boardOpen||finished;
function flush(){inputs.clear();for(const b of document.querySelectorAll('[data-action]'))b.classList.remove('pressed');send('clear');}
function syncInput(){if(!inMenu())send('input',{input:inputs.value()});}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('on'),2400);}
function setMenu(){
  if(inMenu()){speedFeedback.stop();sound.updateDrive({});}
  document.body.classList.toggle('in-menu',inMenu());document.body.classList.toggle('in-race',started&&activeMode==='race');document.body.classList.toggle('finished',finished);
  $('#startScreen').hidden=started||helpOpen||boardOpen;$('#pauseScreen').hidden=!paused||helpOpen||boardOpen||finished||!started;
  $('#helpScreen').hidden=!helpOpen;$('#boardScreen').hidden=!boardOpen;$('#resultScreen').hidden=!finished||helpOpen||boardOpen;
  $('#pause').setAttribute('aria-label',paused?'繼續比賽':'暫停比賽');$('#pause').textContent=paused?'▶':'Ⅱ';
  $('#raceHud').hidden=!started||activeMode!=='race';
  if(!started||finished||activeMode!=='race')$('#countdown').hidden=true;
}
function setPause(value){if(!started||finished)return;if(!value)sound.unlock();paused=value;flush();send('pause',{paused});setMenu();}
function start(mode=selectedMode,qaSpeed=7.6){
  if(!ready)return;activeDuel=mode==='duel';mode=activeDuel?'race':mode;activeMode=mode;started=true;paused=false;helpOpen=false;boardOpen=false;finished=false;result=null;lastState=null;
  const name=cleanName($('#playerName').value);try{if(!QA)storage?.setItem('xikou-kart.playerName',name);}catch{}
  sound.unlock();lastCount=null;lastBoost=0;lastCollision=0;lastCharged=false;previewActive=false;$('#previewCampus').textContent='巡覽校園';
  flush();send('start',{mode,difficulty:selectedDifficulty,duel:activeDuel,name,racer:selectedRacer,qa:QA&&mode==='race',qaSpeed,ghost:getPersonalGhost(name),ghostVisible:ghostEnabled});setMenu();
  if(QA)$('#qaStatus').textContent=mode==='race'?'自動驗證進行中，測試成績獨立儲存':'自由試駕';
}
function menu(){flush();send('menu');started=false;paused=false;finished=false;helpOpen=false;boardOpen=false;lastState=null;$('#countdown').hidden=true;setMenu();renderBoards();}
function setMode(mode){
  $('#raceOptions').hidden=false;$('#lapSelect').parentElement.hidden=mode==='practice';selectedMode=mode;$('#difficultyRow').hidden=mode!=='duel';document.querySelectorAll('[data-mode]').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  $('.name-field').hidden=mode==='practice';$('#modeDescription').textContent=mode!=='practice'?`${mode==='duel'?'與三台電腦車手同場起跑！':''}沿${ACTIVE_ROUTE.short}跑完 ${LAPS} 圈。依序通過光門，挑戰你的個人紀錄。`:['courtyard','grand'].includes(ROUTE_ID)?'從操場開進原校園穿堂、走廊與中庭。走廊與坡道不限速，R 回到鄰近安全路面。':'自由探索操場、北側與東側通道。熟悉油門、煞車與每個轉彎。';
  if(ready)$('#start').innerHTML=mode!=='practice'?`開始 ${LAPS} 圈${mode==='duel'?'四車競賽':'計時賽'} <span>→</span>`:'開始自由試駕 <span>→</span>';
}
function renderList(element,rows,currentId=''){
  element.replaceChildren();
  if(!rows.length){const empty=document.createElement('li');empty.className='empty';empty.textContent='還沒有成績。完成一場，留下第一筆紀錄！';element.append(empty);return;}
  rows.forEach((row,i)=>{
    const li=document.createElement('li');if(row.id===currentId)li.className='current';
    for(const[className,text]of[['rank',String(i+1)],['racer-name',row.name],['record-time',formatTime(row.totalMs/1000)],['record-date',new Date(row.date).toLocaleDateString('zh-TW')]]){
      const span=document.createElement('span');span.className=className;span.textContent=text;li.append(span);
    }
    element.append(li);
  });
}
function renderBoards(){const edition=$('#boardEdition').value,legacy=edition==='legacy',oldCampus=edition==='campus-old',previous=edition==='previous',menuBoard=previous?readLeaderboard(storage,CURRENT_LEADERBOARD_KEY+`.${ROUTE_ID}.${['courtyard','grand'].includes(ROUTE_ID)?'arcade-v2':'friendly-v1'}.laps${LAPS}`+(QA?'.qa':'')):legacy?readLeaderboard(storage,legacyBoardKey):oldCampus?readLeaderboard(storage,CURRENT_LEADERBOARD_KEY+`.campus.laps${LAPS}`+(QA?'.qa':'')):board;renderList($('#menuLeaderboard'),menuBoard.rows);renderList($('#resultLeaderboard'),board.rows,result?.id);$('#boardStatus').textContent=previous?'先前限速與操控版本的紀錄，另存保留。':oldCampus?'舊全校外圈路線紀錄，與新串聯路線分開。':legacy?'保留的 M2 舊版成績，與加速版分開比較。':QA?'自動驗證專用排行榜，與正式紀錄分開。':board.available?'只存在目前瀏覽器，清除網站資料後會消失。':'目前瀏覽器無法使用本機儲存；遊戲仍可進行。';}
function getPersonalGhost(name=cleanName($('#playerName').value)){return ghostMemory.get(name)||readGhost(storage,name,QA);}
function ghostSummary(){const ghost=getPersonalGhost();$('#ghostSummary').textContent=ghost?`你的最佳 ${formatTime(ghost.totalMs/1000)} · 下一場挑戰幽靈車`:'完成本賽道與圈數的第一場，建立個人最佳幽靈車。';}
function updateSettings(){sound.setMuted(muted);$('#mute').textContent=muted?'🔇':'🔊';$('#mute').setAttribute('aria-label',muted?'開啟音效':'靜音');$('#muteSetting').checked=muted;$('#ghostSetting').checked=ghostEnabled;}
function finish(record,race,recording,competition){
  if(savedIds.has(record.id))return;savedIds.add(record.id);result=record;finished=true;paused=false;flush();
  const saved=saveResult(storage,record,board.rows,boardKey);board={rows:saved.rows,available:saved.saved};
  $('#resultName').textContent=`${record.name} · ${RULES_LABEL}`;
  $('.result-main h2').textContent=competition?`第 ${competition.position} 名！${competition.position===1?'獲勝！':'再挑戰一次！'}`:`${race.totalLaps} 圈，完成！`;
  $('#resultTotal').textContent=formatTime(record.totalMs/1000);$('#resultBest').textContent=formatTime(record.bestLapMs/1000);
  $('#resultLap1').textContent=formatTime(record.lapMs[0]/1000);$('#resultLap2').textContent=record.lapMs[1]?formatTime(record.lapMs[1]/1000):'—';
  $('#resultLap2').parentElement.hidden=record.lapMs.length<2;$('.result-laps').style.gridTemplateColumns=`repeat(${record.lapMs.length<2?2:3},1fr)`;
  const rank=board.rows.findIndex(r=>r.id===record.id)+1;
  $('#saveStatus').textContent=QA?(saved.saved?'自動驗證完成 · 已寫入獨立測試排行榜':'自動驗證完成 · 測試儲存不可用'):saved.saved?(rank?`本機第 ${rank} 名 · 成績已儲存`:'完成！本次未進前五名。'):'成績暫時無法存到瀏覽器；仍可再來一場。';
  const previous=getPersonalGhost(record.name);const best=recording&&(!previous||recording.totalMs<previous.totalMs)?saveGhost(storage,recording,QA):{saved:true,updated:false,ghost:previous};
  if(best.ghost)ghostMemory.set(record.name,best.ghost);
  $('#ghostResult').textContent=best.updated?(best.saved?'新個人最佳！幽靈車已更新。':'新個人最佳！幽靈車暫留此分頁，本機儲存不可用。'):best.ghost?`個人最佳 ${formatTime(best.ghost.totalMs/1000)} · 下次繼續挑戰。`:'本場未錄下幽靈車，成績不受影響。';
  ghostSummary();sound.play('finish');
  renderBoards();setMenu();
  let pre=$('#race-result');if(!pre){pre=document.createElement('script');pre.id='race-result';pre.type='application/json';document.body.append(pre);}pre.textContent=JSON.stringify({result:record,race,saved:saved.saved,rank,qa:QA,ghostSaved:best.saved,ghostUpdated:best.updated,ghostSamples:best.ghost?.samples.length??0});
  if(QA)$('#qaStatus').textContent=`${LAPS} 圈自動驗證完成`;
}
function drawRace(race){
  if(!race||activeMode!=='race'){$('#countdown').hidden=true;return;}
  $('#lapLabel').textContent=`第 ${race.lap}／${race.totalLaps} 圈`;
  $('#checkpointLabel').textContent=`檢查點 ${race.passed}／${race.gateCount}`;
  $('#raceTime').textContent=formatTime(race.elapsed);$('#lapTime').textContent=formatTime(race.lapElapsed);$('#bestLap').textContent=race.bestLap===null?'—':formatTime(race.bestLap);
  $('#checkpointBar').style.width=`${race.passed/race.gateCount*100}%`;$('#raceMessage').textContent=race.message||`下一個：${race.nextGate===0?'起終點':`第 ${race.nextGate+1} 個光門`}`;
  const counting=race.phase==='countdown',go=race.phase==='racing'&&race.elapsed<.8;
  const count=counting?Math.ceil(race.countdown):go?'GO':null;if(count!==null&&count!==lastCount){sound.play(count==='GO'?'go':'count');lastCount=count;}
  $('#countdown').hidden=!(counting||go)||finished;$('#countdown').classList.toggle('go',go);
  $('#countdownValue').textContent=counting?Math.max(1,Math.ceil(race.countdown)):'GO！';
  $('#countdown small').textContent=counting?'準備出發':'挑戰開始';$('#countdown span').textContent=counting?'倒數結束後開始計時':'依序通過光門';
}

$('.layout-label').lastChild.textContent=ROUTE_ID==='grand'?'全校大巡迴':['courtyard','grand'].includes(ROUTE_ID)?'原校園・走廊中庭':ROUTE_ID==='campus'?'全校賽道配置':'v221 戶外配置';$('#trackSelect').value=ROUTE_ID;$('#lapSelect').value=String(LAPS);
if(['courtyard','grand'].includes(ROUTE_ID)){$('[data-spawn=north]').textContent='走廊試駕';$('[data-spawn=east]').textContent='中庭試駕';$('.start-note span').textContent=ROUTE_ID==='grand'?'全校外圈＋完整操場＋走廊中庭 · 大巡迴':'原校園走廊＋中庭＋操場 · 一圈／兩圈';}
for(const id of ['trackSelect','lapSelect'])$('#'+id).onchange=()=>{const u=new URL(location.href);u.searchParams.set('track',$('#trackSelect').value);u.searchParams.set('laps',$('#lapSelect').value);location.href=u.href;};
$('.board-dialog>p').textContent=`${ACTIVE_ROUTE.short} · ${LAPS} 圈 · 依總時間排序`;
try{$('#playerName').value=QA?'驗證車手':storage?.getItem('xikou-kart.playerName')||'';}catch{}
function chooseRacer(id,preview=true){selectedRacer=getRacer(id).id;const r=getRacer(id);for(const button of document.querySelectorAll('[data-racer]'))button.setAttribute('aria-pressed',String(button.dataset.racer===r.id));$('#racerName').textContent=`${r.nickname} · ${r.name}`;$('#racerNote').textContent='高精細車手 · '+r.note;try{storage?.setItem('xikou-kart.racer',r.id);}catch{}if(ready)send('racer',{id:r.id,preview});}
for(const r of RACERS){const b=document.createElement('button');b.type='button';b.className='racer-choice';b.dataset.racer=r.id;b.setAttribute('aria-label',`${r.name} ${r.nickname}`);b.innerHTML=racerPortrait(r)+`<span>${r.name}</span>`;b.onclick=()=>chooseRacer(r.id);$('#racerGrid').append(b);}chooseRacer(selectedRacer,false);
$('#playerName').addEventListener('input',()=>{ghostSummary();try{if(!QA)storage?.setItem('xikou-kart.playerName',cleanName($('#playerName').value));}catch{}});
$('#mute').onclick=()=>{muted=!muted;sound.unlock();updateSettings();try{storage?.setItem('xikou-kart.muted',muted?'1':'0');}catch{}};
$('#muteSetting').onchange=e=>{muted=e.target.checked;sound.unlock();updateSettings();try{storage?.setItem('xikou-kart.muted',muted?'1':'0');}catch{}};
$('#ghostSetting').onchange=e=>{ghostEnabled=e.target.checked;send('ghostVisibility',{visible:ghostEnabled});try{storage?.setItem('xikou-kart.showGhost',ghostEnabled?'1':'0');}catch{}};
$('#previewKart').onclick=()=>{previewActive=false;$('#previewCampus').textContent='巡覽校園';send('garage');toast('車輛與車手展示 · 按開始即可出發');};
$('#previewCampus').onclick=()=>{previewActive=!previewActive;send('preview',{active:previewActive});$('#previewCampus').textContent=previewActive?'固定視角':'巡覽校園';};
$('#boardEdition').onchange=renderBoards;
$('#start').onclick=()=>start();$('#resume').onclick=()=>setPause(false);$('#pause').onclick=()=>setPause(!paused);
$('#raceAgain').onclick=()=>start(activeDuel?'duel':'race');$('#resultMenu').onclick=menu;$('#backMenu').onclick=menu;
$('#restart').onclick=()=>start(activeDuel?'duel':activeMode);$('#reset').onclick=()=>{flush();send('reset');};
installControlMode({storage,onChange:flush});
$('#help').onclick=()=>{helpOpen=true;if(started&&!finished){paused=true;flush();send('pause',{paused:true});}setMenu();};$('#closeHelp').onclick=()=>{helpOpen=false;setMenu();};
$('#openBoard').onclick=()=>{const stored=readLeaderboard(storage,boardKey);board={rows:stored.available?stored.rows:board.rows,available:stored.available};boardOpen=true;renderBoards();setMenu();};$('#closeBoard').onclick=()=>{boardOpen=false;setMenu();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
document.querySelectorAll('[data-spawn]').forEach(b=>b.onclick=()=>{if(activeMode!=='practice')return;flush();send('spawn',{id:b.dataset.spawn});document.querySelectorAll('[data-spawn]').forEach(el=>el.classList.toggle('active',el===b));toast(['courtyard','grand'].includes(ROUTE_ID)?`${b.textContent} · R 回到鄰近安全路面`:b.dataset.spawn==='field'?'操場環線 · R 回到鄰近賽道':`${b.dataset.spawn==='north'?'北側':'東側'}探索 · v221 開放戶外配置`);});
addEventListener('keydown',e=>{
  if(e.target.closest('#dayNightToggle')&&['Space','Enter'].includes(e.code))return;
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){if(e.code==='Enter'){e.preventDefault();start();}return;}
  if(inMenu()&&e.target.closest('button')&&['Space','Enter'].includes(e.code))return;
  if(boardOpen){if(e.code==='Escape'){$('#closeBoard').click();}return;}
  if(KEY_ACTION[e.code]){e.preventDefault();if(!inMenu())inputs.set(`key:${e.code}`,KEY_ACTION[e.code]);syncInput();}
  if(e.repeat)return;
  if(e.code==='Enter'){e.preventDefault();if(helpOpen)return;if(!started)start();else if(finished)start(activeDuel?'duel':'race');else if(paused)setPause(false);else start(activeDuel?'duel':activeMode);}
  if(e.code==='KeyR'&&started&&!finished){flush();send('reset');}
  if((e.code==='Escape'||e.code==='KeyP')&&started&&!finished){if(helpOpen){helpOpen=false;setMenu();}else setPause(!paused);}
});
addEventListener('keyup',e=>{if(KEY_ACTION[e.code]){inputs.set(`key:${e.code}`,null);syncInput();}});
addEventListener('blur',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden){flush();if(started&&!finished)setPause(true);}});
for(const button of document.querySelectorAll('[data-action]')){
  button.addEventListener('pointerdown',e=>{e.preventDefault();if(inMenu())return;button.setPointerCapture(e.pointerId);inputs.set(`pointer:${e.pointerId}`,button.dataset.action);button.classList.add('pressed');syncInput();});
  const release=e=>{inputs.set(`pointer:${e.pointerId}`,null);if(![...inputs.sources.values()].includes(button.dataset.action))button.classList.remove('pressed');syncInput();};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);button.addEventListener('contextmenu',e=>e.preventDefault());
}
addEventListener('message',e=>{
  if(e.source!==frame.contentWindow||e.origin!==location.origin||e.data?.source!=='kart-drive')return;const data=e.data;
  if(data.type==='ready'){
    send('lightingQuery');
    ready=true;chooseRacer(selectedRacer,true);$('#start').disabled=false;setMode(selectedMode);$('#loadHint').textContent='WASD／方向鍵駕駛 · 平板可同時按油門與轉向';document.body.dataset.ready='true';
    const pre=document.createElement('script');pre.id='game-report';pre.type='application/json';pre.textContent=JSON.stringify(data);document.body.append(pre);
    if(QA)$('#qaRun').disabled=false;
  }
  if(data.type==='lighting')updateLighting(data.time);
  if(data.type==='started'){started=true;paused=false;finished=false;activeMode=data.mode||activeMode;setMenu();}
  if(data.type==='pause'){paused=data.paused;flush();setMenu();}
  if(data.type==='menu')menuStateOnly();
  if(data.type==='reset'&&!data.initial){const spawn=['courtyard','grand'].includes(ROUTE_ID)?({'北側通道':'走廊','東側通道':'中庭'}[data.spawn]||data.spawn):data.spawn;toast(activeMode==='race'?'已回到檢查點，計時繼續':`已重置 · ${spawn}`);}
  if(data.type==='finished')finish(data.result,data.race,data.recording,data.competition);
  if(data.type==='state'){
    const s=lastState=data.state;speedFeedback.update(s);sound.updateDrive(s);$('#positionLabel').hidden=!s.competition;$('#positionLabel').textContent=s.competition?`第 ${s.competition.position}／${s.competition.total} 名`:'';activeMode=s.mode||activeMode;
    $('#effectsHud').hidden=!s.playing||finished;const charge=Math.round((s.driftCharge||0)*100),boost=s.boostRemaining>0;
    $('#driftBar').style.width=`${charge}%`;$('#driftMeter').setAttribute('aria-valuenow',String(charge));$('#driftMeter').classList.toggle('charged',charge===100);
    $('.effects-title b').textContent='DRIFT / BOOST';$('#driftStatus').textContent=boost?`加速 ${s.boostRemaining.toFixed(1)} 秒`:charge===100?'集滿了！放開甩尾加速':s.drifting?`甩尾集氣 ${charge}%`:'油門＋轉彎＋甩尾，集滿後放開';document.body.classList.toggle('boosting',boost&&s.playing&&!s.paused&&!finished);
    if(s.boostCount>lastBoost)sound.play('boost');lastBoost=s.boostCount||0;if(s.collisions>lastCollision&&s.collisionPulse>0)sound.play('collision');lastCollision=s.collisions||0;if(charge===100&&!lastCharged)sound.play('charged');lastCharged=charge===100;
    $('#ghostStatus').textContent=s.mode==='practice'?'自由試駕 · 幽靈車於計時賽顯示':!ghostEnabled?'幽靈車已隱藏':s.ghostAvailable?(s.ghostFinished?'個人最佳已完賽':`追逐個人最佳 ${formatTime(s.ghostBestMs/1000)}`):'尚無個人幽靈紀錄';
    let audio=$('#sound-state');if(!audio){audio=document.createElement('script');audio.id='sound-state';audio.type='application/json';document.body.append(audio);}audio.textContent=JSON.stringify({available:sound.available,muted:sound.muted,state:sound.context?.state??'not-created',events:[...sound.last.keys()]});
    $('#speed').textContent=Math.round(Math.abs(s.speed)*3.6);$('#gear').textContent=s.speed<-.15?'R':s.speed>.15?'D':'N';$('#speedBar').style.width=`${Math.min(100,Math.abs(s.speed)/DRIVE.maxSpeed*100)}%`;
    $('#driveStatus').textContent=s.paused?'已暫停':s.race?.phase==='countdown'?'準備起跑':s.race?.phase==='finished'?'完賽':!s.playing?'準備出發':activeMode==='race'?activeDuel?'四車競賽':`${LAPS} 圈計時挑戰`:s.speed<-.15?'倒車中':'自由試駕';
    $('#collisionHint').textContent=s.collisionPulse>0?'碰撞減速 · 可倒車脫離':activeMode==='race'?(ROUTE_ID==='campus'&&s.x<-29?'西側窄道 · 請減速':'依序通過光門'):'自由試駕 · 尚未計時';
    $('#area').textContent=ROUTE_ID==='grand'?ACTIVE_ROUTE.short:['courtyard','grand'].includes(ROUTE_ID)?(s.groundHeight>.9?'原校園走廊':s.groundHeight>.05?'坡道':s.z*18+700<1100?'中庭':ACTIVE_ROUTE.short):activeMode==='race'?ACTIVE_ROUTE.short:{field:'操場環線',north:'北側開放通道',east:'東側開放通道'}[s.spawn];$('#mapLabel').textContent=activeMode==='race'?'下一光門':s.spawn==='field'?'操場':'校園探索';
    drawMap(s,s.race&&s.race.phase!=='finished'?gates[s.race.nextGate]:null);drawRace(s.race);
    let pre=$('#game-state');if(!pre){pre=document.createElement('script');pre.id='game-state';pre.type='application/json';document.body.append(pre);}pre.textContent=JSON.stringify(s);
  }
  if(data.type==='metrics'){
    $('#fps').textContent=`${Math.round(data.metrics.fps)} FPS`;let pre=$('#game-metrics');if(!pre){pre=document.createElement('script');pre.id='game-metrics';pre.type='application/json';document.body.append(pre);}pre.textContent=JSON.stringify(data.metrics);
  }
});
function menuStateOnly(){started=false;paused=false;finished=false;lastState=null;setMenu();}
if(QA){
  const banner=document.createElement('div');banner.className='qa-banner';const label=document.createElement('b');label.textContent='自動驗證模式';const run=document.createElement('button');run.id='qaRun';run.disabled=true;run.textContent=`執行 ${LAPS} 圈自動驗證`;run.onclick=()=>start('race');const slow=document.createElement('button');slow.textContent='慢速追逐驗證';slow.onclick=()=>start('race',6.1);const status=document.createElement('span');status.id='qaStatus';status.textContent='使用獨立測試排行榜';banner.append(label,run,slow,status);document.body.append(banner);
}
setTimeout(()=>{if(!ready)$('#loadHint').textContent='場景仍在載入，若長時間未完成請重新整理。';},25000);
updateSettings();ghostSummary();renderBoards();setMenu();
