import { ROUTES } from './track-config.js?build=20261102-features1';
const query=new URLSearchParams(typeof location==='undefined'?'':location.search);
export const ITEMS_ENABLED=query.get('items')==='1';
export const ITEM_COUNT=query.get('itemset')==='6'?6:8;
export const ROUTE_ID=['campus','courtyard','grand'].includes(query.get('track'))?query.get('track'):'field';
export const ACTIVE_ROUTE=ROUTES[ROUTE_ID];
export const LAPS=query.get('laps')==='1'?1:2;
export const PREVIOUS_SESSION_SCOPE=ROUTE_ID==='field'&&LAPS===2?'':`.${ROUTE_ID==='campus'?'campus-stadium':ROUTE_ID}.laps${LAPS}`;

export const SESSION_EDITION=ITEMS_ENABLED?`items${ITEM_COUNT}-v1`:ROUTE_ID==='grand'?'tour-v1':ROUTE_ID==='courtyard'?'arcade-open-v1':'arcade-v2';
export const SESSION_SCOPE=`.${ROUTE_ID}.${SESSION_EDITION}.laps${LAPS}`;
