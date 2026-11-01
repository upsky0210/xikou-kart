export const DIFFICULTIES=Object.freeze({
  easy:{id:'easy',label:'輕鬆',speed:8.8,corner:2.7,bravery:.94,acceleration:6.8,turnSpeed:8.2},
  normal:{id:'normal',label:'標準',speed:12.4,corner:3.2,bravery:1.40,acceleration:7.6,turnSpeed:9.2},
  hard:{id:'hard',label:'挑戰',speed:14,corner:3.5,bravery:1.58,acceleration:8.3,turnSpeed:10},
});
export const getDifficulty=id=>DIFFICULTIES[id]||DIFFICULTIES.normal;
