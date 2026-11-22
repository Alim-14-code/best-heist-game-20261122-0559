// VAULTBREAK — synthesized sound effects. No audio files: every sound is
// built with the Web Audio API, so the game loads nothing over the network.
var VB = window.VB || (window.VB = {});

VB.Audio = (function buildAudio() {
  var ctx = null;
  var alarmTickAt = 0;

  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, when) {
    var c = ensure();
    if (!c) return;
    if (c.state === 'suspended') {
      var resumed = c.resume();
      if (resumed && resumed.catch) resumed.catch(function () {});
    }
    var t0 = c.currentTime + (when || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    unlock: function unlock() {
      ensure();
    },
    pickup: function pickup() {
      tone(880, 0.09, 'sine', 0.14);
      tone(1318, 0.12, 'sine', 0.12, 0.07);
    },
    coin: function coin() {
      tone(1567, 0.07, 'triangle', 0.1);
      tone(2093, 0.1, 'triangle', 0.08, 0.06);
    },
    emp: function emp() {
      tone(220, 0.35, 'sawtooth', 0.1);
      tone(110, 0.4, 'square', 0.06, 0.05);
    },
    laserZap: function laserZap() {
      tone(1800, 0.08, 'square', 0.08);
      tone(900, 0.12, 'square', 0.08, 0.05);
    },
    caught: function caught() {
      tone(220, 0.25, 'sawtooth', 0.16);
      tone(165, 0.3, 'sawtooth', 0.16, 0.18);
      tone(110, 0.5, 'sawtooth', 0.16, 0.36);
    },
    win: function win() {
      tone(523, 0.12, 'sine', 0.14);
      tone(659, 0.12, 'sine', 0.14, 0.1);
      tone(784, 0.12, 'sine', 0.14, 0.2);
      tone(1046, 0.28, 'sine', 0.16, 0.3);
    },
    alarmPulse: function alarmPulse(now) {
      if (now - alarmTickAt < 0.9) return;
      alarmTickAt = now;
      tone(660, 0.08, 'square', 0.05);
    },
  };
})();
