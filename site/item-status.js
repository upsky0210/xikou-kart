export const newItemEffects=()=>({milk:0,slow:0,factor:1,water:0,shield:0,immune:0});
export function tickItemEffects(state,dt){const e=state.itemEffects;if(!e)return;for(const k of ['milk','slow','water','shield','immune'])e[k]=Math.max(0,e[k]-dt);if(!e.slow)e.factor=1;}
export const itemSpeedFactor=state=>{const e=state.itemEffects;return e?(e.milk>0?1.25:1)*(e.slow>0?e.factor:1):1;};
export function itemDriveConfig(state,cfg){
  const e=state.itemEffects;if(!e||(!e.milk&&!e.slow))return cfg;
  const milk=e.milk>0?1.25:1,slow=e.slow>0?e.factor:1;
  return {...cfg,maxSpeed:cfg.maxSpeed*milk*slow,acceleration:cfg.acceleration*(milk>1?1.25:1),boostMultiplier:cfg.boostMultiplier/milk};
}
