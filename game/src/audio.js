// VAULTBREAK sound: synthesized WebAudio effects, no audio files.
// The context is created lazily on the first key press (browsers block
// audio before a gesture); every call is guarded so a headless load with
// no audio device never throws.
'use strict';

const VBAudio = {
  ctx: null,
  lastPulse: 0,

  ensure: function () {
    if (this.ctx) return this.ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
    return this.ctx;
  },

  tone: function (freq, dur, type, vol, when) {
    const ctx = this.ensure();
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime + (when || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {
      // Audio is decoration; a failure must never break the game.
    }
  },

  // A bright two-note blip when loot is picked up.
  pickup: function () {
    this.tone(880, 0.09, 'triangle', 0.14, 0);
    this.tone(1318, 0.12, 'triangle', 0.12, 0.07);
  },

  // A low pulse while the alarm is high; callers throttle it.
  alarmPulse: function (now) {
    if (now - this.lastPulse < 0.6) return;
    this.lastPulse = now;
    this.tone(220, 0.12, 'square', 0.05, 0);
  },

  // A descending sting when a guard catches the thief.
  caught: function () {
    this.tone(392, 0.16, 'sawtooth', 0.14, 0);
    this.tone(311, 0.16, 'sawtooth', 0.14, 0.14);
    this.tone(233, 0.34, 'sawtooth', 0.14, 0.28);
  },

  // A rising jingle for a clean getaway.
  win: function () {
    const notes = [523, 659, 784, 1046];
    for (let i = 0; i < notes.length; i++) {
      this.tone(notes[i], 0.16, 'triangle', 0.13, i * 0.11);
    }
  },

  // A soft metallic clink for a thrown coin.
  coin: function () {
    this.tone(2093, 0.05, 'square', 0.06, 0);
    this.tone(1568, 0.07, 'square', 0.05, 0.05);
  },

  // A low zap for the EMP.
  emp: function () {
    this.tone(160, 0.22, 'sawtooth', 0.1, 0);
    this.tone(90, 0.3, 'sawtooth', 0.09, 0.08);
  },
};
