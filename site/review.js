import { ROUTES, ISSUES, SCALE, lengthMetres } from './track-config.js?build=20261026-friendly3';
const $ = s=>document.querySelector(s);
const frame=$('#campus'), D=window.CAMPUS;
let selected='field', mapMode=false, overlay=true, touring=false, audit=null, metrics=null, ready=false;
const started=performance.now();
const message=(type,data={})=>frame.contentWindow.postMessage({source:'kart-review',type,...data},location.origin);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

function mapSvg(){
  const r=ROUTES[selected];
  const roomRects=D.rooms.filter(x=>x.floor==='1F'&&x.type!=='garden').map(room=>{
    const [x1,y1,x2,y2]=room.rect;
    const colors={A:'#d8d8a9',B:'#b7d5d9',C:'#e0c8b5',D:'#b3cbb7'};
    return `<rect x="${x1}" y="${y1}" width="${x2-x1}" height="${y2-y1}" rx="2" fill="${colors[room.building]||'#c3c8b2'}" stroke="#f8f9ef" stroke-width="3"/>`;
  }).join('');
  const corridorRects=(D.corridors['1F']||[]).map(rect=>`<rect x="${rect[0]}" y="${rect[1]}" width="${rect[2]-rect[0]}" height="${rect[3]-rect[1]}" fill="#d7dcca"/>`).join('');
  const routePath=r.points.map((p,i)=>`${i?'L':'M'}${p.join(',')}`).join(' ');
  const markers=r.checkpoints.map((idx,i)=>{const [x,y]=r.points[Math.min(idx,r.points.length-1)];return `<g><circle cx="${x}" cy="${y}" r="24" fill="#17383e" stroke="#fafbf4" stroke-width="6"/><text x="${x}" y="${y+1}" class="number">${i+1}</text></g>`;}).join('');
  const issues=ISSUES.filter(i=>selected==='campus'||i.id==='stage').map(i=>`<g><circle cx="${i.at[0]}" cy="${i.at[1]}" r="24" fill="#eaa239" stroke="#fff7e4" stroke-width="5"/><text x="${i.at[0]}" y="${i.at[1]+1}" class="number">!</text><title>${escape(i.name+'：'+i.text)}</title></g>`).join('');
  const hits=audit?.routes[selected].hits||[];
  const hitMarks=hits.filter((_,i)=>i%8===0).map(h=>`<circle cx="${h.at[0]}" cy="${h.at[1]}" r="9" fill="#df6955" opacity=".75"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="70 -100 2200 2530" role="img" aria-label="${escape(r.label)}校園俯視路線圖">
    <defs><pattern id="grid" width="180" height="180" patternUnits="userSpaceOnUse"><path d="M180,0H0V180" fill="none" stroke="#d4dfcc" stroke-width="1.5"/></pattern><marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0,0L9,5L0,10Z" fill="#17383e"/></marker></defs>
    <style>text{font-family:'Microsoft JhengHei',system-ui,sans-serif;fill:#405c54}.label{font-size:30px;text-anchor:middle;font-weight:700;paint-order:stroke;stroke:#edf2e5;stroke-width:9px;stroke-linejoin:round}.sub{font-size:22px;text-anchor:middle;fill:#7a8d7a}.number{font-size:25px;fill:white;text-anchor:middle;dominant-baseline:central;font-weight:800}</style>
    <rect x="70" y="-100" width="2200" height="2530" fill="#e5ecdf"/><rect x="70" y="-100" width="2200" height="2530" fill="url(#grid)"/>
    <path d="M300,40H1825V1300H1960V2200H300Z" fill="#dbe5d1" stroke="#9aac93" stroke-width="7"/>
    ${corridorRects}${roomRects}
    <rect x="705" y="585" width="800" height="475" fill="#c8d9ba"/><rect x="710" y="783" width="54" height="84" rx="16" fill="#8fc0bd"/>
    <rect x="1030" y="1245" width="160" height="45" fill="#d6b37e"/>
    <path d="M725,1290H1455A295,295 0 0 1 1455,1880H725A295,295 0 0 1 725,1290Z" fill="#bd7c6d"/>
    <path d="M725,1380H1455A205,205 0 0 1 1455,1790H725A205,205 0 0 1 725,1380Z" fill="#a7c28a"/>
    <rect x="725" y="1390" width="730" height="390" rx="10" fill="#82a6b3" stroke="#b9d5d6" stroke-width="3"/>
    <path d="M725,1585H1455M1090,1390V1780" stroke="#d3e5dd" stroke-width="3" fill="none"/>
    <rect x="1070" y="1890" width="880" height="270" rx="8" fill="#b0c3ce" stroke="#ebf0e7" stroke-width="5"/>
    <rect x="760" y="1905" width="280" height="215" rx="15" fill="#bdd0a0"/>
    <rect x="306" y="631" width="56" height="109" fill="#b8be9e"/><rect x="310" y="250" width="145" height="210" fill="#a4b5ab"/>
    <path d="M300,770V880" stroke="#f6cf69" stroke-width="17"/>
    <path d="M465,40V150M1690,40V150" stroke="#6f9c72" stroke-width="16"/>
    ${overlay?`<path d="${routePath}" fill="none" stroke="${r.color}" stroke-width="${r.width*SCALE}" opacity=".24" stroke-linejoin="round"/><path d="${routePath}" fill="none" stroke="${r.color}" stroke-width="9" ${selected==='campus'?'stroke-dasharray="25 17"':''} stroke-linejoin="round"/>${hitMarks}${markers}${issues}`:''}
    <text x="1110" y="270" class="label">敬業樓</text><text x="1595" y="705" class="label" transform="rotate(90 1595 705)">至善樓</text><text x="560" y="850" class="label" transform="rotate(-90 560 850)">思源樓</text><text x="1110" y="1198" class="label">勤學樓</text><text x="1100" y="820" class="label">中庭</text>
    <text x="1100" y="1535" class="label">操場</text><text x="1100" y="1610" class="sub">既有跑道保留</text><text x="1510" y="2040" class="label">游泳館</text><text x="900" y="2020" class="sub">遊戲場</text><text x="230" y="865" class="label" transform="rotate(-90 230 865)">正門</text><text x="1110" y="100" class="sub">北側通道 · 兩端封閉</text>
    <g transform="translate(2070 200)"><path d="M0,60V-20" stroke="#3d5a52" stroke-width="5" marker-end="url(#arrow)"/><text y="-55" text-anchor="middle" font-size="30">圖面北側</text></g>
    <g transform="translate(1550 2300)"><path d="M0,0H360M0,-10V10M180,-10V10M360,-10V10" stroke="#6f8570" stroke-width="5"/><text x="0" y="-25" font-size="23">0</text><text x="170" y="-25" font-size="23">10</text><text x="330" y="-25" font-size="23">20 m</text></g>
    <text x="330" y="2310" font-size="23">${escape(r.label)} · ${lengthMetres(r.points).toFixed(0)} m · ${r.width} m 寬</text>
    <text x="330" y="2370" font-size="19" fill="#7a8d7a">M0 規劃圖｜位置依原校園資料估算，非實測地籍或施工圖。</text>
  </svg>`;
}
function renderMap(){$('#map').innerHTML=mapSvg();}
function updateAudit(){
  if(!audit)return;
  const r=audit.routes[selected],flagged=r.flaggedSamples>0;
  $('#auditPill').textContent=flagged?'需處理障礙':'初檢無交疊';$('#auditPill').className=`pill ${flagged?'warning':''}`;
  $('#auditSummary').textContent=flagged?`以 ≤0.25 m 間距檢查 ${r.samples} 個位置，其中 ${r.flaggedSamples} 個位置的路寬範圍需檢查。紅點標示可能交疊處，尚未通過。`:`已取樣 ${r.samples} 個位置，規劃路寬與已登記地面障礙未交疊。這是幾何初檢，車體轉彎與鏡頭仍須 M1 驗證。`;
}
function setRoute(id){
  selected=id;const r=ROUTES[id];stopTour();
  document.querySelectorAll('[data-route]').forEach(b=>{b.classList.toggle('selected',b.dataset.route===id);b.setAttribute('aria-pressed',String(b.dataset.route===id));});
  $('#routeName').textContent=r.label;$('#routeStatus').textContent=r.status;$('#routeStatus').className=`pill ${id==='campus'?'warning':''}`;
  $('#routeDescription').textContent=r.description;$('#length').innerHTML=`${Math.round(lengthMetres(r.points))}<small>m</small>`;$('#width').innerHTML=`${r.width}<small>m</small>`;
  $('#elevation').innerHTML=id==='field'?'0<small>m</small>':'待確認';
  $('#routeNotes').innerHTML=r.notes.map(n=>`<li>${escape(n)}</li>`).join('');
  $('#issueList').innerHTML=ISSUES.filter(i=>id==='campus'||['stage','base','arch'].includes(i.id)).map(i=>`<article class="issue-item"><b>${escape(i.name)}</b><p>${escape(i.text)}</p></article>`).join('');
  message('route',{id});updateAudit();renderMap();
  $('#sceneTitle').innerHTML=mapMode?`${r.short}・路線勘查`:'熟悉的校園，<br>新的起跑線。';
}
function setMap(on){
  if(on)stopTour();mapMode=on;document.body.classList.toggle('map-mode',on);$('#map').hidden=!on;frame.style.visibility=on?'hidden':'visible';
  $('#view3d').classList.toggle('active',!on);$('#viewMap').classList.toggle('active',on);$('#view3d').setAttribute('aria-pressed',String(!on));$('#viewMap').setAttribute('aria-pressed',String(on));
  $('#sceneTitle').innerHTML=on?`${ROUTES[selected].short}・路線勘查`:'熟悉的校園，<br>新的起跑線。';$('#sceneHint').textContent=on?'依校園座標繪製 · 紅點為障礙初檢標記':'拖曳旋轉 · 滾輪縮放 · 兩指縮放';
  message('pause',{paused:on});
}
function stopTour(){touring=false;$('#tour').classList.remove('active');$('#tour').innerHTML='沿線巡覽 <span>→</span>';$('#tourbar').hidden=true;message('tour',{active:false});}
function save(name,body,type){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>setRoute(b.dataset.route)));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{setMap(false);stopTour();message('view',{view:b.dataset.view});document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el===b));}));
$('#view3d').onclick=()=>setMap(false);$('#viewMap').onclick=()=>setMap(true);
$('#showRoute').onchange=e=>{overlay=e.target.checked;message('overlay',{visible:overlay});renderMap();};
$('#tour').onclick=()=>{if(touring){stopTour();return;}setMap(false);touring=true;$('#tour').classList.add('active');$('#tour').textContent='暫停巡覽';$('#tourbar').hidden=false;message('tour',{active:true});};
$('#stopTour').onclick=stopTour;$('#tourSeek').oninput=e=>message('seek',{value:+e.target.value/1000});
$('#quality').onchange=e=>message('quality',{value:e.target.value});
$('#downloadMap').onclick=()=>save(`溪口卡丁車-M0-${ROUTES[selected].short}.svg`,mapSvg(),'image/svg+xml;charset=utf-8');
$('#exportAudit').onclick=()=>save('溪口卡丁車-M0-勘查資料.json',JSON.stringify({audit,metrics,environment:{userAgent:navigator.userAgent,viewport:[innerWidth,innerHeight],loadMs:Math.round(performance.now()-started)},note:'M0 靜態場景，非車輛或 iPad 實測。'},null,2),'application/json');
addEventListener('message',e=>{
  if(e.source!==frame.contentWindow||e.origin!==location.origin||e.data?.source!=='kart-m0')return;
  const data=e.data;
  if(data.type==='ready'){
    ready=true;audit=data.audit;$('#sceneLoading').hidden=true;$('#tour').disabled=false;$('#exportAudit').disabled=false;updateAudit();renderMap();
    message('route',{id:selected});message('overlay',{visible:overlay});message('pause',{paused:mapMode});message('quality',{value:$('#quality').value});
    const pre=document.createElement('script');pre.type='application/json';pre.id='review-audit';pre.textContent=JSON.stringify({audit,loadMs:Math.round(performance.now()-started)});document.body.append(pre);
  }
  if(data.type==='metrics'){
    metrics=data.metrics;$('#fps').textContent=metrics.fps.toFixed(0);$('#drawcalls').textContent=`${metrics.calls.toLocaleString()} 次繪製`;
    $('#perfDetail').textContent=`${Math.round(metrics.triangles/1000).toLocaleString()}k 三角形 · ${metrics.viewport.join(' × ')} · 像素比 ${metrics.pixelRatio}。${metrics.fps<20?'目前幀率偏低，需在前景視窗與目標裝置確認。':'僅為目前裝置量測。'}`;
    $('#tourSeek').value=Math.round(metrics.progress*1000);
    let pre=$('#review-metrics');if(!pre){pre=document.createElement('script');pre.type='application/json';pre.id='review-metrics';document.body.append(pre);}pre.textContent=JSON.stringify(metrics);
  }
  if(data.type==='tour-end')stopTour();
});
setTimeout(()=>{if(!ready){$('#sceneLoading b').textContent='場景仍在載入';$('#sceneLoading small').textContent='可先切換俯視路線；若持續未完成，請重新整理。';}},25000);
setRoute('field');
