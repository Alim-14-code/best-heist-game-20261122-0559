// Synthesized sound effects: plain WebAudio oscillators, no audio files,
// no network. The context is created lazily on the first user gesture so
// browsers do not block it, and every effect is a no-op until then.
'use strict';

const AudioFX = {
  ctx: null,
  master: null,
  alarmOn: false,
  alarmTimer: null,

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.ctx.destination);
      return true;
    } catch (e) {
      return false;
    }
  },

  // One short oscillator blip.
  blip(freq, dur, type, vol, slideTo) {
    if (!this.ensure()) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol || 0.5, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },

  step(sneak) {
    this.blip(sneak ? 140 : 190, 0.05, 'triangle', sneak ? 0.12 : 0.2);
  },

  pickup() {
    this.blip(660, 0.09, 'sine', 0.5);
    setTimeout(() => this.blip(880, 0.09, 'sine', 0.5), 70);
    setTimeout(() => this.blip(1320, 0.16, 'sine', 0.5), 140);
  },

  spotted() {
    this.blip(520, 0.14, 'square', 0.3, 780);
  },

  alarmStart() {
    if (this.alarmOn) return;
    this.alarmOn = true;
    const twoTone = () => {
      if (!this.alarmOn) return;
      this.blip(740, 0.22, 'square', 0.14);
      setTimeout(() => { if (this.alarmOn) this.blip(560, 0.22, 'square', 0.14); }, 240);
    };
    twoTone();
    this.alarmTimer = setInterval(twoTone, 500);
  },

  alarmStop() {
    this.alarmOn = false;
    if (this.alarmTimer) { clearInterval(this.alarmTimer); this.alarmTimer = null; }
  },

  caught() {
    this.alarmStop();
    this.blip(220, 0.5, 'sawtooth', 0.5, 55);
    setTimeout(() => this.blip(110, 0.6, 'sawtooth', 0.4, 40), 120);
  },

  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => this.blip(f, 0.22, 'triangle', 0.5), i * 110));
  },

  click() {
    this.blip(440, 0.06, 'square', 0.25);
  },
};
