// ── Paper sounds ──────────────────────────────────────────────────────────────
// The résumé's sounds, synthesised with the Web Audio API like the bell: no audio
// file to load.
//
//   unfold   a sheet lifted off a pile and opened out: a soft rustle as it lifts,
//            a few dry crackles along the crease, then the low flap of the top half
//            landing flat. Timed to the fold (lands 0.84s after it starts).
//   whoosh   the paper plane leaving: air rushing past, rising in pitch.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  ctx = AC ? new AC() : null;
  return ctx;
}

// Two seconds of pink-ish noise: paper sounds are softer than pure white noise
function noiseBuffer(c: AudioContext) {
  if (noise) return noise;
  const len = c.sampleRate * 2;
  noise = c.createBuffer(1, len, c.sampleRate);
  const data = noise.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = 0.86 * last + 0.14 * white;
    data[i] = (white * 0.55 + last * 1.6) * 0.6;
  }
  return noise;
}

/** One band of noise with an attack/decay envelope. */
function burst(
  c: AudioContext,
  out: AudioNode,
  at: number,
  { freq, q = 1, attack, decay, level, type = "bandpass" as BiquadFilterType, sweepTo }: {
    freq: number;
    q?: number;
    attack: number;
    decay: number;
    level: number;
    type?: BiquadFilterType;
    sweepTo?: number;
  },
) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, at);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, at + attack + decay);
  filter.Q.value = q;
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(level, at + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  src.connect(filter).connect(env).connect(out);
  src.start(at, Math.random() * 1.2);
  src.stop(at + attack + decay + 0.05);
}

/** Dry crackles along a crease: short, bright, randomly spaced. */
function crackles(c: AudioContext, out: AudioNode, from: number, to: number, count: number, level: number) {
  for (let i = 0; i < count; i++) {
    const at = from + ((to - from) * (i + Math.random() * 0.8)) / count;
    burst(c, out, at, {
      freq: 2800 + Math.random() * 3400,
      q: 2.2,
      attack: 0.002,
      decay: 0.012 + Math.random() * 0.03,
      level: level * (0.45 + Math.random() * 0.55),
    });
  }
}

/** The flap of a sheet landing: a low, soft thump of air. */
function flap(c: AudioContext, out: AudioNode, at: number, level: number) {
  burst(c, out, at, { freq: 520, q: 0.7, attack: 0.006, decay: 0.16, level, type: "lowpass" });
  burst(c, out, at, { freq: 1900, q: 1.2, attack: 0.003, decay: 0.05, level: level * 0.45 });
}

function play(volume: number, delayMs: number, score: (c: AudioContext, out: AudioNode, t: number) => void) {
  const c = audio();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const out = c.createGain();
  out.gain.value = volume;
  out.connect(c.destination);
  score(c, out, c.currentTime + delayMs / 1000 + 0.01);
}

export function unfoldSound(volume = 0.45, delayMs = 0) {
  play(volume, delayMs, (c, out, t) => {
    // Lifting off the pile
    burst(c, out, t, { freq: 1400, q: 0.6, attack: 0.08, decay: 0.42, level: 0.5, sweepTo: 3200 });
    crackles(c, out, t + 0.12, t + 0.62, 7, 0.55);
    // The top half swinging over
    burst(c, out, t + 0.34, { freq: 2400, q: 0.8, attack: 0.22, decay: 0.38, level: 0.32, sweepTo: 1100 });
    flap(c, out, t + 0.84, 0.9);
    crackles(c, out, t + 0.85, t + 0.98, 2, 0.25);
  });
}

export function whooshSound(volume = 0.22, durationMs = 800) {
  play(volume, 0, (c, out, t) => {
    const d = durationMs / 1000;
    burst(c, out, t, { freq: 500, q: 0.9, attack: d * 0.55, decay: d * 0.5, level: 0.8, sweepTo: 2600 });
  });
}

/** A crease pressed flat: a crisp snap with a little air behind it. */
function crease(c: AudioContext, out: AudioNode, at: number, level: number) {
  burst(c, out, at - 0.12, { freq: 2200, q: 0.8, attack: 0.08, decay: 0.08, level: level * 0.35, sweepTo: 3600 });
  burst(c, out, at, { freq: 4200, q: 2.6, attack: 0.002, decay: 0.045, level });
  burst(c, out, at + 0.004, { freq: 700, q: 0.8, attack: 0.004, decay: 0.07, level: level * 0.5, type: "lowpass" });
}

/**
 * The whole plane fold: a crease for each fold (ms from now), and a dry rustle of
 * crackles while the wings come out ([start, duration] in ms).
 */
export function planeSequenceSound({ creases, wings }: { creases: number[]; wings: [number, number] }, volume = 0.32) {
  play(volume, 0, (c, out, t) => {
    creases.forEach((ms, i) => {
      crackles(c, out, t + ms / 1000 - 0.36, t + ms / 1000 - 0.05, 3, 0.35);
      crease(c, out, t + ms / 1000, i === creases.length - 1 ? 0.75 : 0.6);
    });
    const [from, dur] = wings.map((ms) => ms / 1000);
    burst(c, out, t + from, { freq: 1600, q: 0.7, attack: dur * 0.3, decay: dur * 0.6, level: 0.3, sweepTo: 3000 });
    crackles(c, out, t + from, t + from + dur, 5, 0.45);
  });
}

/** The paperclip biting onto the sheet: a small, bright metal tick. */
export function clipSound(volume = 0.35, delayMs = 0) {
  play(volume, delayMs, (c, out, t) => {
    const osc = c.createOscillator();
    osc.frequency.setValueAtTime(3100, t);
    osc.frequency.exponentialRampToValueAtTime(2300, t + 0.06);
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.18, t + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(env).connect(out);
    osc.start(t);
    osc.stop(t + 0.1);
    burst(c, out, t, { freq: 5200, q: 3, attack: 0.001, decay: 0.02, level: 0.5 });
  });
}
