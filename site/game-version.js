import { ROUTE_ID, LAPS, ACTIVE_ROUTE } from './session-config.js?build=20261025-animals2';
export const TRACK_ID=ROUTE_ID==='field'&&LAPS===2?'field-v221-v2':ROUTE_ID==='campus'?`campus-stadium-v3-laps${LAPS}`:`field-v221-v2-laps${LAPS}`;
export const LEGACY_TRACK_ID='field-v221-v1';
export const RULES_LABEL=`${ACTIVE_ROUTE.short} · ${LAPS} 圈 · 加速版`;
