export const RACERS=Object.freeze([
  {id:'cat',name:'橘貓',nickname:'橘子',icon:'🐱',fur:'#edaa51',light:'#fff0d2',dark:'#a95c2b',paint:'#f4b544',accent:'#149a91',suit:'#229d95',number:'01',note:'愛曬太陽，也愛漂亮過彎。'},
  {id:'bunny',name:'兔兔',nickname:'邦妮',icon:'🐰',fur:'#eee8df',light:'#fffaf1',dark:'#a79a93',paint:'#7cd3bc',accent:'#ee9cb0',suit:'#e98ba4',number:'02',note:'長耳朵迎著風，邦妮準備好出發了！'},
  {id:'hamster',name:'倉鼠',nickname:'麻糬',icon:'🐹',fur:'#e8c29a',light:'#fff5df',dark:'#94705a',paint:'#f3b9c0',accent:'#9282bb',suit:'#ac96cb',number:'03',note:'圓滾滾的臉頰，裝滿出發的勇氣。'},
  {id:'beagle',name:'米格魯',nickname:'布丁',icon:'🐶',fur:'#b97843',light:'#fff0d9',dark:'#4d3c32',paint:'#ec7968',accent:'#fff0cb',suit:'#d86c55',number:'04',note:'垂垂大耳朵，是開心的領航員。'},
  {id:'macaque',name:'獼猴',nickname:'桃桃',icon:'🐵',fur:'#a97854',light:'#efc6a3',dark:'#674631',paint:'#77b9dd',accent:'#f6c66a',suit:'#6c9fc7',number:'05',note:'帶著好奇心，把校園風景看個夠。'},
  {id:'horse',name:'寶馬',nickname:'小栗',icon:'🐴',fur:'#ba8559',light:'#ffe8bd',dark:'#684b3d',paint:'#a9b7e4',accent:'#e9b657',suit:'#8d9fd4',number:'06',note:'一撮小鬃毛，迎著風慢慢長大。'},
  {id:'sheep',name:'羊妹',nickname:'綿綿',icon:'🐑',fur:'#fff1db',light:'#fff9ec',dark:'#b99c89',paint:'#efb1ce',accent:'#a18cc7',suit:'#ce8fb4',number:'07',note:'戴上蝴蝶結，把每個彎都跑得甜甜的。'},
  {id:'boar',name:'山豬',nickname:'栗丸',icon:'🐗',fur:'#9c8373',light:'#e4c3aa',dark:'#614d46',paint:'#bd9bd2',accent:'#f1aa69',suit:'#9d80b7',number:'08',note:'小獠牙配大笑臉，勇敢向前出發。'},
]);
export const getRacer=id=>RACERS.find(r=>r.id===(id==='meerkat'?'bunny':id))||RACERS[0];
// Portraits are rendered from the same 3D models used by the race.
export function racerPortrait(r){return `<img src="portraits/${r.id}.png?v=sculpted-v2" alt="" width="40" height="40" decoding="async">`;}
