// VAULTBREAK — seeded random numbers. Every cosmetic variation in the
// game (sparkle positions, dust motes) comes from this stream, so the game
// looks identical on every load.
var VB = window.VB || (window.VB = {});

VB.makeRng = function makeRng(seed) {
  var s = seed >>> 0;
  return function next() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
