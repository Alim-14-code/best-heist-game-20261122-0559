// VAULTBREAK — keyboard input. WASD or arrows to move, Shift to sneak,
// Q to throw a coin, E to fire an EMP, P to pause, Enter to start.
var VB = window.VB || (window.VB = {});

VB.Input = (function buildInput() {
  var held = {};
  var pressed = {};

  var MOVE_KEYS = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
  };

  function onKeyDown(e) {
    if (MOVE_KEYS[e.code] || e.code === 'ShiftLeft' || e.code === 'ShiftRight'
      || e.code === 'KeyQ' || e.code === 'KeyE' || e.code === 'KeyP'
      || e.code === 'Enter') {
      e.preventDefault();
    }
    if (!held[e.code]) pressed[e.code] = true;
    held[e.code] = true;
    VB.Audio.unlock();
  }

  function onKeyUp(e) {
    held[e.code] = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    moveVector: function moveVector() {
      var x = 0;
      var y = 0;
      if (held.KeyA || held.ArrowLeft) x -= 1;
      if (held.KeyD || held.ArrowRight) x += 1;
      if (held.KeyW || held.ArrowUp) y -= 1;
      if (held.KeyS || held.ArrowDown) y += 1;
      if (x !== 0 && y !== 0) {
        var len = Math.sqrt(2);
        x /= len;
        y /= len;
      }
      return { x: x, y: y };
    },
    sneaking: function sneaking() {
      return !!(held.ShiftLeft || held.ShiftRight);
    },
    wasPressed: function wasPressed(code) {
      return !!pressed[code];
    },
    endFrame: function endFrame() {
      pressed = {};
    },
    // Test hook: pretend a key was pressed (used by the headless probes).
    fakePress: function fakePress(code) {
      pressed[code] = true;
      held[code] = true;
    },
    fakeRelease: function fakeRelease(code) {
      held[code] = false;
    },
    fakeHold: function fakeHold(code) {
      held[code] = true;
    },
  };
})();
