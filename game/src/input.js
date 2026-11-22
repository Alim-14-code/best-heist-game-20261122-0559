// VAULTBREAK keyboard input. Tracks held keys and edge-triggered presses
// (a press fires once when the key goes down, not while it is held).
'use strict';

const VBInput = {
  held: {},
  pressed: {},
  onKey: null, // optional callback(code) for edge presses

  init: function () {
    const self = this;
    window.addEventListener('keydown', function (e) {
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown' ||
          e.code === 'ArrowLeft' || e.code === 'ArrowRight' ||
          e.code === 'Space') {
        e.preventDefault();
      }
      if (!e.repeat) {
        self.pressed[e.code] = true;
        if (self.onKey) self.onKey(e.code);
      }
      self.held[e.code] = true;
    });
    window.addEventListener('keyup', function (e) {
      self.held[e.code] = false;
    });
    window.addEventListener('blur', function () {
      self.held = {};
    });
  },

  down: function (code) {
    return !!this.held[code];
  },

  // True once, on the frame after the key went down.
  hit: function (code) {
    return !!this.pressed[code];
  },

  // Movement vector from WASD or the arrow keys, normalised.
  move: function () {
    let x = 0;
    let y = 0;
    if (this.down('KeyA') || this.down('ArrowLeft')) x -= 1;
    if (this.down('KeyD') || this.down('ArrowRight')) x += 1;
    if (this.down('KeyW') || this.down('ArrowUp')) y -= 1;
    if (this.down('KeyS') || this.down('ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.sqrt(2);
      x *= inv;
      y *= inv;
    }
    return { x: x, y: y };
  },

  sneaking: function () {
    return this.down('ShiftLeft') || this.down('ShiftRight');
  },

  endFrame: function () {
    this.pressed = {};
  },
};
