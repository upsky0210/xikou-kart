import { ROUTE_ID, LAPS, ACTIVE_ROUTE, SESSION_EDITION, ITEMS_ENABLED, ITEM_COUNT } from './session-config.js?build=20261102-features1';
export const TRACK_ID=`${ROUTE_ID}-${SESSION_EDITION}-laps${LAPS}`;
export const LEGACY_TRACK_ID='field-v221-v1';
export const RULES_LABEL=`${ACTIVE_ROUTE.short} · ${LAPS} 圈 · ${ITEMS_ENABLED?`${ITEM_COUNT} 種道具賽`:"暢快操控版"}`;
