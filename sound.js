'use strict';

// Sound effects, synthesized with the Web Audio API (no audio files needed).
// The audio context is created lazily on first use, since browsers only allow
// audio to start after a user gesture.

const Sound = (() => {
  const STORAGE_KEY = 'mahjong-muted';
  let ctx = null;
  let master = null;
  let noiseBuffer = null;
  let muted = false;

  try { muted = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { /* storage unavailable */ }

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);

      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // An oscillator with an attack/decay envelope. `freq` may be a number or
  // [start, end] for a pitch slide.
  function tone({ type = 'sine', freq, start = 0, dur, vol = 0.3, attack = 0.005, filter, vibrato }) {
    const t = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;

    const [f0, f1] = Array.isArray(freq) ? freq : [freq, freq];
    osc.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, t + dur);

    if (vibrato) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = vibrato.rate;
      depth.gain.value = vibrato.depth;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur);
    }

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    let node = osc.connect(gain);
    if (filter) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = filter;
      node = node.connect(lp);
    }
    node.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // A short burst of filtered noise, for percussive sounds.
  function noise({ start = 0, dur, vol = 0.3, type = 'bandpass', freq, q = 1 }) {
    const t = ctx.currentTime + start;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = noiseBuffer;
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  const EFFECTS = {
    // Two tiles knocking together.
    select() {
      noise({ dur: 0.05, vol: 0.6, freq: 2600, q: 2 });
      tone({ type: 'triangle', freq: 1900, dur: 0.04, vol: 0.12 });
    },

    // A softer, lower knock.
    deselect() {
      tone({ freq: [190, 70], dur: 0.14, vol: 0.45 });
      noise({ dur: 0.06, vol: 0.25, type: 'lowpass', freq: 700 });
    },

    // A bright little bell.
    match() {
      tone({ freq: 1568, dur: 0.6, vol: 0.22 });
      tone({ freq: 3136, dur: 0.35, vol: 0.06 });
      tone({ freq: 2093, start: 0.07, dur: 0.6, vol: 0.18 });
    },

    // Rising boop.
    hint() {
      tone({ freq: [480, 760], dur: 0.16, vol: 0.3, attack: 0.01 });
    },

    // Womp womp: two sad, sagging brass notes.
    lose() {
      const brass = { type: 'sawtooth', vol: 0.22, attack: 0.03, filter: 900 };
      tone({ ...brass, freq: [233, 208], dur: 0.38 });
      tone({ ...brass, freq: [208, 150], start: 0.45, dur: 0.9, vibrato: { rate: 6, depth: 6 } });
    },

    // Little victory fanfare.
    win() {
      const notes = [[392, 0], [523, 0.12], [659, 0.24], [784, 0.36], [659, 0.54], [784, 0.66]];
      notes.forEach(([f, s], i) => {
        const dur = i === notes.length - 1 ? 0.8 : 0.16;
        tone({ type: 'square', freq: f, start: 0.2 + s, dur, vol: 0.09, filter: 2800 });
        tone({ type: 'triangle', freq: f, start: 0.2 + s, dur, vol: 0.18 });
      });
      tone({ type: 'triangle', freq: 1047, start: 0.86, dur: 0.8, vol: 0.12 });
    },
  };

  function play(name) {
    if (muted || !audio()) return;
    EFFECTS[name]();
  }

  function setMuted(value) {
    muted = value;
    try { localStorage.setItem(STORAGE_KEY, value ? '1' : '0'); } catch (e) { /* storage unavailable */ }
  }

  return { play, setMuted, isMuted: () => muted };
})();
