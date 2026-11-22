// Keyboard input: WASD + arrow keys to move, Shift to sneak, Q to toss a
// coin, E to fire the EMP, P / Escape to pause, Enter to start or restart.
// Tracks held keys and edge-triggered presses so the game loop can read both.
'use strict';

const Input = {
  keys: {},
  pressed: {}, // edge-triggered: true only on the frame the key went down

  init() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (!e.repeat) this.pressed[e.key.toLowerCase()] = true;
      this.keys[e.key.toLowerCase()] = true;
      AudioFX.ensure();
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener('blur', () => { this.keys = {}; });
  },

  // Normalised movement vector from the held movement keys.
  moveVector() {
    let x = 0, y = 0;
    if (this.keys['a'] || this.keys['arrowleft']) x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) x += 1;
    if (this.keys['w'] || this.keys['arrowup']) y -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) y += 1;
    if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  },

  get sneaking() {
    return !!(this.keys['shift']);
  },

  // Was this key pressed since the last endFrame()? Case-insensitive.
  wasPressed(key) {
    return !!this.pressed[key.toLowerCase()];
  },

  endFrame() {
    this.pressed = {};
  },
};
