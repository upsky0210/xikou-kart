import { ROUTE_ID, LAPS, ACTIVE_ROUTE, SESSION_EDITION } from './session-config.js?build=20261031-racing1';
export const TRACK_ID=`${ROUTE_ID}-${SESSION_EDITION}-laps${LAPS}`;
export const LEGACY_TRACK_ID='field-v221-v1';
export const RULES_LABEL=`${ACTIVE_ROUTE.short} · ${LAPS} 圈 · 暢快操控版`;
