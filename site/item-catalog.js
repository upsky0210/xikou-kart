export const ITEMS=Object.freeze({
  milk:{id:'milk',name:'牛奶瓶',color:'#7bbfef',note:'加速 1.8 秒，直線使用更有效'},
  chalk:{id:'chalk',name:'粉筆',color:'#f2b3bf',note:'向前投擲，命中減速'},
  water:{id:'water',name:'水彩罐',color:'#ab97df',note:'往後灑水彩，讓對手視野暈染'},
  ruler:{id:'ruler',name:'透明尺',color:'#74d8c0',note:'保護 4 秒，擋掉一次攻擊'},
  eraser:{id:'eraser',name:'橡皮擦',color:'#ef9fb8',note:'擦掉水彩與減速，短暫免疫'},
  glue:{id:'glue',name:'膠水瓶',color:'#edce76',note:'往後留下膠水區，經過會減速'},
  plane:{id:'plane',name:'紙飛機',color:'#9ac9e3',note:'向前追蹤一位對手'},
  bell:{id:'bell',name:'下課鈴',color:'#edbd59',note:'先響鈴提示，再讓附近對手減速'},
});
export const CORE_ITEMS=Object.freeze(['milk','chalk','water','ruler','eraser','glue']);
export const ITEM_IDS=Object.freeze(Object.keys(ITEMS));
export const itemIds=count=>count===6?[...CORE_ITEMS]:[...ITEM_IDS];
export function itemIcon(id){
  const paths={
    milk:'<path fill="#f9fcff" d="M23 16h18v8l6 8v25H17V32l6-8z"/><path fill="#6cb6e8" d="M23 8h18v10H23zM18 35h28v14H18z"/><path fill="#fff" d="M27 38h10v8H27z"/>',
    chalk:'<path fill="#fff4e8" d="m14 43 27-29 10 10-27 29z"/><path fill="#efb3bf" d="m41 14 4-4 10 10-4 4zM14 43l10 10-14 4z"/><circle fill="#eab5ba" cx="44" cy="48" r="3"/><circle fill="#eab5ba" cx="52" cy="40" r="2"/>',
    water:'<path fill="#f9dfac" d="M14 18q27-17 40 8 7 21-16 29-15 4-27-11-10-14 3-26z"/><circle fill="#ef8eae" cx="23" cy="22" r="6"/><circle fill="#79b9e3" cx="42" cy="24" r="6"/><circle fill="#9a83d3" cx="45" cy="42" r="6"/><circle fill="#74c6b4" cx="26" cy="45" r="6"/><circle fill="#fff7e7" cx="17" cy="34" r="5"/>',
    ruler:'<path fill="#a6e0cf" fill-opacity=".85" d="m10 41 32-32 15 15-32 32z"/><path stroke="#2b817a" stroke-width="3" d="m19 35 7 7m0-14 5 5m2-12 7 7m0-14 5 5"/>',
    eraser:'<path fill="#ef98b0" d="m11 40 23-26 19 17-20 24H28z"/><path fill="#fff3dc" d="m11 40 11-13 19 17-8 11h-5z"/><path stroke="#b16c88" stroke-width="2" d="m22 27 19 17"/>',
    glue:'<path fill="#f4b34d" d="M27 8h10v10H27z"/><path fill="#fff6dc" d="M22 18h20v9l6 7v23H16V34l6-7z"/><path fill="#edce76" d="M17 37h30v15H17z"/><path fill="#c79648" d="M28 40h8v9h-8z"/>',
    plane:'<path fill="#fff6df" d="M7 28 58 9 41 55 30 36z"/><path fill="#88bedb" d="m30 36 28-27-19 34-9-7z"/><path fill="#c2deec" d="m30 36-2 17 9-11z"/>',
    bell:'<path fill="#c38b48" d="M27 7h10v13H27z"/><path fill="#f2c25f" d="M32 17q16 0 17 24l6 9H9l6-9q1-24 17-24z"/><path fill="#b77b3e" d="M9 48h46v5H9z"/><circle fill="#b77b3e" cx="32" cy="56" r="5"/>',
  };
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${paths[id]??'<rect x="12" y="21" width="40" height="34" rx="6" fill="#85cfc6"/><path stroke="#e69aae" stroke-width="6" d="m23 26-6-14"/><path stroke="#eac964" stroke-width="6" d="m32 26-1-18"/><path stroke="#7db7df" stroke-width="6" d="m41 26 5-15"/><rect x="17" y="30" width="30" height="19" rx="3" fill="#fff4d6"/><text x="32" y="45" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="bold" fill="#397a78">?</text>'}</svg>`;
}
