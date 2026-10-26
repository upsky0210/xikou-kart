export const RACERS=Object.freeze([
  {id:'cat',name:'橘貓',nickname:'橘子',icon:'🐱',fur:'#edaa51',light:'#fff0d2',dark:'#a95c2b',paint:'#f4b544',accent:'#149a91',suit:'#229d95',number:'01',note:'愛曬太陽，也愛漂亮過彎。'},
  {id:'meerkat',name:'狐蒙',nickname:'阿望',icon:'🦦',fur:'#c99b69',light:'#ffebca',dark:'#695044',paint:'#7cd3bc',accent:'#e77d61',suit:'#e98b71',number:'02',note:'小小探險家，眼睛總看著下一個彎。'},
  {id:'hamster',name:'倉鼠',nickname:'麻糬',icon:'🐹',fur:'#e8c29a',light:'#fff5df',dark:'#94705a',paint:'#f3b9c0',accent:'#9282bb',suit:'#ac96cb',number:'03',note:'圓滾滾的臉頰，裝滿出發的勇氣。'},
  {id:'beagle',name:'米格魯',nickname:'布丁',icon:'🐶',fur:'#b97843',light:'#fff0d9',dark:'#4d3c32',paint:'#ec7968',accent:'#fff0cb',suit:'#d86c55',number:'04',note:'垂垂大耳朵，是開心的領航員。'},
  {id:'macaque',name:'獼猴',nickname:'桃桃',icon:'🐵',fur:'#a97854',light:'#efc6a3',dark:'#674631',paint:'#77b9dd',accent:'#f6c66a',suit:'#6c9fc7',number:'05',note:'帶著好奇心，把校園風景看個夠。'},
  {id:'horse',name:'寶馬',nickname:'小栗',icon:'🐴',fur:'#ba8559',light:'#ffe8bd',dark:'#684b3d',paint:'#a9b7e4',accent:'#e9b657',suit:'#8d9fd4',number:'06',note:'一撮小鬃毛，迎著風慢慢長大。'},
  {id:'sheep',name:'羊妹',nickname:'綿綿',icon:'🐑',fur:'#fff1db',light:'#fff9ec',dark:'#b99c89',paint:'#efb1ce',accent:'#a18cc7',suit:'#ce8fb4',number:'07',note:'戴上蝴蝶結，把每個彎都跑得甜甜的。'},
  {id:'boar',name:'山豬',nickname:'栗丸',icon:'🐗',fur:'#9c8373',light:'#e4c3aa',dark:'#614d46',paint:'#bd9bd2',accent:'#f1aa69',suit:'#9d80b7',number:'08',note:'小獠牙配大笑臉，勇敢向前出發。'},
]);
export const getRacer=id=>RACERS.find(r=>r.id===id)||RACERS[0];
// Small original vector portraits; the actual driver is a fully modelled 3D animal.
export function racerPortrait(r){
  const ears=r.id==='sheep'?`<ellipse cx="16" cy="36" rx="12" ry="7"/><ellipse cx="64" cy="36" rx="12" ry="7"/>`:r.id==='beagle'?`<ellipse cx="17" cy="41" rx="9" ry="21"/><ellipse cx="63" cy="41" rx="9" ry="21"/>`:['cat','boar'].includes(r.id)?`<path d="M16 33 14 9 34 25M46 25 66 9 64 33"/>`:r.id==='horse'?`<ellipse cx="26" cy="18" rx="7" ry="16"/><ellipse cx="54" cy="18" rx="7" ry="16"/>`:`<circle cx="19" cy="23" r="11"/><circle cx="61" cy="23" r="11"/>`;
  const muzzle=r.id==='boar'?`<ellipse cx="40" cy="53" rx="17" ry="11" fill="#eab7b0"/><circle cx="34" cy="52" r="2.4"/><circle cx="46" cy="52" r="2.4"/>`:`<ellipse cx="40" cy="55" rx="17" ry="12" fill="${r.light}"/><ellipse cx="40" cy="51" rx="4" ry="3"/>`;
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><g fill="${r.fur}">${ears}<ellipse cx="40" cy="43" rx="28" ry="28"/></g>${r.id==='sheep'?`<g fill="${r.light}">${[18,28,40,52,62].map((x,i)=>`<circle cx="${x}" cy="${i%2?20:24}" r="10"/>`).join('')}</g>`:''}<g fill="${r.dark}"><ellipse cx="28" cy="40" rx="8" ry="11"/><ellipse cx="52" cy="40" rx="8" ry="11"/>${muzzle}</g><g fill="white"><circle cx="26" cy="36" r="3.5"/><circle cx="50" cy="36" r="3.5"/></g><g fill="#e88d91" opacity=".6"><ellipse cx="20" cy="52" rx="5" ry="3"/><ellipse cx="60" cy="52" rx="5" ry="3"/></g></svg>`;
}
