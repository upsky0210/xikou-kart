export function touchAvailable({touchPoints=0,coarse=false,anyCoarse=false}={}){
  // Convertible Chromebooks can report a fine primary mouse while still supporting touch.
  return touchPoints>0||coarse||anyCoarse;
}
export function showTouch(mode,device){return mode==='touch'||mode!=='keyboard'&&touchAvailable(device);}
export function installControlMode({storage,onChange}){
  const select=document.querySelector('#controlMode'),toggle=document.querySelector('#touchToggle'),hint=document.querySelector('#controlHint');
  const primary=matchMedia('(pointer: coarse)'),any=matchMedia('(any-pointer: coarse)');
  let mode='auto',seenTouch=false;try{const saved=storage?.getItem('xikou-kart.controls');if(['auto','touch','keyboard'].includes(saved))mode=saved;}catch{}
  const requested=new URLSearchParams(location.search).get('controls');if(['auto','touch','keyboard'].includes(requested))mode=requested;
  function update(){
    const device={touchPoints:Math.max(navigator.maxTouchPoints||0,seenTouch?1:0),coarse:primary.matches,anyCoarse:any.matches},visible=showTouch(mode,device);
    document.body.classList.toggle('touch-preview',visible);document.body.classList.toggle('controls-keyboard',!visible);
    document.body.dataset.controls=visible?'touch':'keyboard';select.value=mode;
    toggle.setAttribute('aria-pressed',String(visible));toggle.setAttribute('aria-label',visible?'切換為鍵盤操作':'顯示螢幕觸控按鈕');toggle.textContent=visible?'觸控 ✓':'觸控操作';
    hint.textContent=visible?'按開始後，左側轉向、右側油門；可以同時按。':'WASD／方向鍵；有觸控螢幕可選「螢幕按鈕」。';onChange?.();
  }
  function set(value){mode=value;try{storage?.setItem('xikou-kart.controls',mode);}catch{}update();}
  select.onchange=()=>set(select.value);toggle.onclick=()=>set(document.body.dataset.controls==='touch'?'keyboard':'touch');
  primary.addEventListener('change',update);any.addEventListener('change',update);
  addEventListener('pointerdown',e=>{if(mode==='auto'&&e.pointerType==='touch'&&!seenTouch){seenTouch=true;update();}},true);
  update();
}
