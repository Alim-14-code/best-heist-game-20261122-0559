// VAULTBREAK seeded randomness. Cosmetic variation (sparkles, dust) must
// be identical on every load, so nothing here reads Math.random.
'use strict';

const VBRng = {
  // mulberry32: a tiny deterministic generator.
  make: function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  // A fixed-seed stream the render code uses for sparkles and dust motes,
  // so the same frame always draws the same specks.
  cosmetic: function () {
    return VBRng.make(20261122);
  },
};
