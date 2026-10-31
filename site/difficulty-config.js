export const DIFFICULTIES=Object.freeze({
  easy:{id:'easy',label:'輕鬆',speed:8.4,corner:2.7,bravery:.92},
  normal:{id:'normal',label:'標準',speed:11,corner:3.0,bravery:1.18},
  hard:{id:'hard',label:'挑戰',speed:12.2,corner:3.3,bravery:1.35},
});
export const getDifficulty=id=>DIFFICULTIES[id]||DIFFICULTIES.normal;
