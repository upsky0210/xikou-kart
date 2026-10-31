export const RACERS=Object.freeze([
  {id:'cat',name:'橘貓',nickname:'橘子',icon:'🐱',fur:'#edaa51',light:'#fff0d2',dark:'#a95c2b',paint:'#f4b544',accent:'#149a91',suit:'#229d95',number:'01',note:'愛曬太陽，也愛漂亮過彎。'},
  {id:'giraffe',name:'長頸鹿',nickname:'朵朵',icon:'🦒',fur:'#efbf46',light:'#f7d798',dark:'#9b5e38',paint:'#f0cb67',accent:'#a47151',suit:'#e0b64f',number:'02',note:'不規則斑紋、藍眼睫毛與圓頭小角，長脖子也能輕快過彎。'},
  {id:'koala',name:'無尾熊',nickname:'灰寶',icon:'🐨',fur:'#aaa2a4',light:'#fff0df',dark:'#5c5358',paint:'#b4b0ca',accent:'#e6a9b2',suit:'#b9a4bb',number:'03',note:'毛茸茸的大耳朵、絨面大鼻子，腳掌還藏著小肉墊。'},
  {id:'beagle',name:'米格魯',nickname:'布丁',icon:'🐶',fur:'#b97843',light:'#fff0d9',dark:'#4d3c32',paint:'#ec7968',accent:'#fff0cb',suit:'#d86c55',number:'04',note:'垂垂大耳朵，是開心的領航員。'},
  {id:'raccoon',name:'浣熊',nickname:'阿森',icon:'🦝',fur:'#929892',light:'#f6f0e3',dark:'#484346',paint:'#83bcb5',accent:'#e8d9b5',suit:'#648f88',number:'05',note:'白眉眼罩配蓬鬆環紋尾巴，靈巧小手緊握方向盤。'},
  {id:'horse',name:'寶馬',nickname:'小栗',icon:'🐴',fur:'#ba8559',light:'#ffe8bd',dark:'#684b3d',paint:'#a9b7e4',accent:'#e9b657',suit:'#8d9fd4',number:'06',note:'一撮小鬃毛，迎著風慢慢長大。'},
  {id:'sheep',name:'羊妹',nickname:'綿綿',icon:'🐑',fur:'#fff1db',light:'#fff9ec',dark:'#b99c89',paint:'#efb1ce',accent:'#a18cc7',suit:'#ce8fb4',number:'07',note:'奶油捲羊毛配黑色長臉，綿綿輕快過彎。'},
  {id:'boar',name:'山豬',nickname:'栗丸',icon:'🐗',fur:'#9c8373',light:'#e4c3aa',dark:'#614d46',paint:'#bd9bd2',accent:'#f1aa69',suit:'#9d80b7',number:'08',note:'小獠牙配大笑臉，勇敢向前出發。'},
]);
export const RACER_REPLACEMENTS=Object.freeze({hamster:'koala',macaque:'raccoon',bunny:'giraffe',meerkat:'giraffe'});
export const getRacer=id=>RACERS.find(r=>r.id===(RACER_REPLACEMENTS[id]||id))||RACERS[0];
// Portraits are rendered from the same 3D models used by the race.
export function racerPortrait(r){return `<img src="portraits/${r.id}.png?v=wildlife-v1" alt="" width="40" height="40" decoding="async">`;}
