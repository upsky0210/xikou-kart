import { ROUTES } from './track-config.js?build=20261025-animals2';
const query=new URLSearchParams(typeof location==='undefined'?'':location.search);
export const ROUTE_ID=query.get('track')==='campus'?'campus':'field';
export const ACTIVE_ROUTE=ROUTES[ROUTE_ID];
export const LAPS=query.get('laps')==='1'?1:2;
export const SESSION_SCOPE=ROUTE_ID==='field'&&LAPS===2?'':`.${ROUTE_ID==='campus'?'campus-stadium':ROUTE_ID}.laps${LAPS}`;
