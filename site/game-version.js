import { ROUTE_ID, LAPS, ACTIVE_ROUTE } from './session-config.js?build=20261026-courtyard6';
export const TRACK_ID=`${ROUTE_ID}-${ROUTE_ID==='courtyard'?'elevation-v1':'friendly-v1'}-laps${LAPS}`;
export const LEGACY_TRACK_ID='field-v221-v1';
export const RULES_LABEL=`${ACTIVE_ROUTE.short} · ${LAPS} 圈 · 親子友善版`;
