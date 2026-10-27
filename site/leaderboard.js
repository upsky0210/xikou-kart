import { cleanName } from './race-core.js?build=premium-roster-open1';
import { TRACK_ID, LEGACY_TRACK_ID } from './game-version.js?build=premium-roster-open1';
export const LEADERBOARD_KEY='xikou-kart.leaderboard.v1';
export const CURRENT_LEADERBOARD_KEY='xikou-kart.leaderboard.v2';
export function validRecord(value){
  if(!value||typeof value!=='object'||typeof value.id!=='string'||value.id.length>120||!value.id||!['courtyard-arcade-open-v1-laps1','courtyard-arcade-open-v1-laps2','courtyard-arcade-v2-laps1','courtyard-arcade-v2-laps2','field-arcade-v2-laps1','field-arcade-v2-laps2','campus-arcade-v2-laps1','campus-arcade-v2-laps2','courtyard-elevation-v1-laps1','courtyard-elevation-v1-laps2','field-v221-v2','field-v221-v1','field-v221-v2-laps1','campus-v221-v2-laps1','campus-v221-v2-laps2','campus-stadium-v3-laps1','campus-stadium-v3-laps2','field-friendly-v1-laps1','field-friendly-v1-laps2','campus-friendly-v1-laps1','campus-friendly-v1-laps2'].includes(value.track))return null;
  if(!Number.isInteger(value.totalMs)||value.totalMs<=0||value.totalMs>86400000||!Array.isArray(value.lapMs)||value.lapMs.length<1||value.lapMs.length>9||value.lapMs.some(v=>!Number.isInteger(v)||v<=0))return null;
  if(!Number.isInteger(value.bestLapMs)||value.bestLapMs<=0||Math.abs(Math.min(...value.lapMs)-value.bestLapMs)>1||value.lapMs.reduce((a,b)=>a+b,0)>value.totalMs+2||typeof value.date!=='string'||!Number.isFinite(Date.parse(value.date)))return null;
  return{id:value.id.slice(0,120),name:cleanName(value.name),totalMs:value.totalMs,lapMs:[...value.lapMs],bestLapMs:value.bestLapMs,date:new Date(value.date).toISOString(),track:value.track};
}
export function rankRecords(rows){
  const byId=new Map();for(const raw of Array.isArray(rows)?rows:[]){const record=validRecord(raw);if(record&&!byId.has(record.id))byId.set(record.id,record);}
  return[...byId.values()].sort((a,b)=>a.totalMs-b.totalMs||a.bestLapMs-b.bestLapMs||a.date.localeCompare(b.date)||a.id.localeCompare(b.id)).slice(0,5);
}
export function readLeaderboard(storage,key=LEADERBOARD_KEY){
  try{if(!storage)return{rows:[],available:false};const raw=storage.getItem(key);if(!raw)return{rows:[],available:true};let parsed;try{parsed=JSON.parse(raw);}catch{return{rows:[],available:true,recovered:true};}return{rows:rankRecords(parsed?.version===1?parsed.rows:[]),available:true};}
  catch{return{rows:[],available:false};}
}
export function saveResult(storage,result,memoryRows=[],key=LEADERBOARD_KEY){
  const record=validRecord(result);if(!record)return{rows:rankRecords(memoryRows),saved:false,invalid:true};
  const previous=readLeaderboard(storage,key),rows=rankRecords([...previous.rows,...memoryRows,record]);
  try{if(!storage)throw Error('Storage unavailable');storage.setItem(key,JSON.stringify({version:1,rows}));return{rows,saved:true};}catch{return{rows,saved:false};}
}
