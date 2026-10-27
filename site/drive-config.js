export const DRIVE = Object.freeze({
  maxSpeed: 11, acceleration: 6.5, braking: 13, reverseSpeed: 3.5,
  reverseAcceleration: 4.5, rollingResistance: 0.65, drag: 0.027,
  steeringLow: 0.58, steeringHigh: 0.30, steeringRate: 1.8,
  steeringReturnRate: 6, counterSteeringRate: 4,
  yawRateLow: 2.2, yawRateHigh: 0.95, turnSpeed: 7.2, turnDeceleration: 5,
  wheelbase: 1.35, collisionRadius: 0.61, collisionOffset: 0.43,
  collisionSpeedRetention: 0.65, collisionCrawlSpeed: 0.65, collisionHeadOnThreshold: 0.85, handbrake: 18,
  fixedStep: 1 / 120, maxFrameTime: 0.20, maxSteps: 24,
  cameraDistance: 6.3, cameraHeight: 3.6, cameraSmoothing: 7,
  resetDistance: 22, carHeight: 1.25,
  driftSteeringMultiplier: 1.25, driftChargeRate: 0.6,
  boostMultiplier: 1.4, boostDuration: 1.5, laps: 2,
  driftMinSpeed: 4, driftDrag: 0.35, driftSlipAngle: 0.14,
  boostKick: 2.2, boostAccelerationMultiplier: 1.3, boostDecay: 6,
  padCooldown: 2,
});
export const SPAWNS = {
  field: {label:'操場起點', pixel:[1090,1335], yaw:Math.PI/2},
  north: {label:'北側通道', pixel:[1100,95], yaw:Math.PI/2},
  east: {label:'東側通道', pixel:[1820,700], yaw:0},
};
