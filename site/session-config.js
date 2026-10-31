import { ROUTES } from './track-config.js?build=20261031-racing1';
const query=new URLSearchParams(typeof location==='undefined'?'':location.search);
export const ROUTE_ID=['campus','courtyard','grand'].includes(query.get('track'))?query.get('track'):'field';
export const ACTIVE_ROUTE=ROUTES[ROUTE_ID];
export const LAPS=query.get('laps')==='1'?1:2;
export const PREVIOUS_SESSION_SCOPE=ROUTE_ID==='field'&&LAPS===2?'':`.${ROUTE_ID==='campus'?'campus-stadium':ROUTE_ID}.laps${LAPS}`;

export const SESSION_EDITION=ROUTE_ID==='grand'?'tour-v1':ROUTE_ID==='courtyard'?'arcade-open-v1':'arcade-v2';
export const SESSION_SCOPE=`.${ROUTE_ID}.${SESSION_EDITION}.laps${LAPS}`;
