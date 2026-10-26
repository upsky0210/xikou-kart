import { ROUTES } from './track-config.js?build=20261026-courtyard6';
const query=new URLSearchParams(typeof location==='undefined'?'':location.search);
export const ROUTE_ID=['campus','courtyard'].includes(query.get('track'))?query.get('track'):'field';
export const ACTIVE_ROUTE=ROUTES[ROUTE_ID];
export const LAPS=query.get('laps')==='1'?1:2;
export const PREVIOUS_SESSION_SCOPE=ROUTE_ID==='field'&&LAPS===2?'':`.${ROUTE_ID==='campus'?'campus-stadium':ROUTE_ID}.laps${LAPS}`;

export const SESSION_SCOPE=`.${ROUTE_ID}.${ROUTE_ID==='courtyard'?'elevation-v1':'friendly-v1'}.laps${LAPS}`;
