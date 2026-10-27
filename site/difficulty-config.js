export const DIFFICULTIES=Object.freeze({
  easy:{id:'easy',label:'輕鬆',speed:7.2,corner:2.4,bravery:.75},
  normal:{id:'normal',label:'標準',speed:9.4,corner:2.6,bravery:.95},
  hard:{id:'hard',label:'挑戰',speed:11,corner:2.9,bravery:1.08},
});
export const getDifficulty=id=>DIFFICULTIES[id]||DIFFICULTIES.normal;
