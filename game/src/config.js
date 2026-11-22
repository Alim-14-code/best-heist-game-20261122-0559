// VAULTBREAK tuning constants. Plain numbers; the level layout lives in
// world.js, the behaviour in guards.js and tools.js.
'use strict';

const VB = {
  W: 1280,
  H: 720,
  WALK_SPEED: 165, // thief, pixels per second
  SNEAK_SPEED: 70, // thief while sneaking
  GUARD_SPEED: 72, // guard patrol
  HUNT_SPEED: 132, // guard chase
  PLAYER_R: 17,
  GUARD_R: 14,
  PICKUP_R: 26, // loot trigger distance
  VISION_RANGE: 235, // guard sight
  VISION_HALF: 0.61, // guard cone half-angle, ~35 degrees
  CAMERA_RANGE: 265,
  CAMERA_HALF: 0.44, // camera cone half-angle, ~25 degrees
  ALARM_GUARD: 46, // alarm rise per second while a guard sees the thief
  ALARM_CAMERA: 36, // alarm rise per second while a camera sees the thief
  ALARM_SNEAK: 0.45, // sneak multiplies the rise
  ALARM_DECAY: 13, // alarm fall per second while unseen
  HUNT_FLOOR: 40, // a hunt ends when the alarm falls back under this
  CATCH_R: 20, // guard touch distance that ends the run
  COIN_RANGE: 290, // a coin only distracts a guard this close
  COIN_TIME: 4, // seconds a distracted guard investigates
  COINS: 3, // coins per run
  EMP_TIME: 6, // seconds cameras stay blind after an EMP
  EMP_COST: 12, // alarm added by firing an EMP
  EMPS: 2, // EMPs per run
  EXIT: { x: 1136, y: 616, w: 112, h: 84 }, // green getaway door
  START: { x: 96, y: 632 }, // where the thief begins
  PAR_TIME: 150, // seconds: escape faster than this for a time bonus
  BONUS_RATE: 20, // time-bonus dollars per second under par
};
