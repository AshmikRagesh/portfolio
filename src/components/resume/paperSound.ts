// ── Paper sounds ──────────────────────────────────────────────────────────────
// The résumé's sounds, synthesised with the Web Audio API like the bell: no audio
// file to load.
//
//   unfold   a sheet lifted off a pile and opened out: a soft rustle as it lifts,
//            a few dry crackles along the crease, then the low flap of the top half
//            landing flat. Timed to the fold (lands about 1s after it starts).
//   refold   the same sheet folded back up, quicker, ending on a crisp crease.
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
    flap(c, out, t + 0.98, 0.9);
    crackles(c, out, t + 0.99, t + 1.12, 2, 0.25);
  });
}

export function refoldSound(volume = 0.3, delayMs = 0) {
  play(volume, delayMs, (c, out, t) => {
    burst(c, out, t, { freq: 1800, q: 0.7, attack: 0.06, decay: 0.3, level: 0.45, sweepTo: 3400 });
    crackles(c, out, t + 0.08, t + 0.42, 6, 0.6);
    flap(c, out, t + 0.48, 0.6);
    // The crease pressed flat
    burst(c, out, t + 0.5, { freq: 4200, q: 3, attack: 0.002, decay: 0.05, level: 0.5 });
  });
}

/** Quick crisp folds while the plane takes shape. */
export function planeFoldSound(volume = 0.3, durationMs = 700) {
  play(volume, 0, (c, out, t) => {
    const d = durationMs / 1000;
    crackles(c, out, t, t + d, 6, 0.55);
    burst(c, out, t + d * 0.42, { freq: 4000, q: 3, attack: 0.002, decay: 0.05, level: 0.5 });
    burst(c, out, t + d * 0.95, { freq: 4600, q: 3, attack: 0.002, decay: 0.05, level: 0.45 });
  });
}

export function whooshSound(volume = 0.22, durationMs = 800) {
  play(volume, 0, (c, out, t) => {
    const d = durationMs / 1000;
    burst(c, out, t, { freq: 500, q: 0.9, attack: d * 0.55, decay: d * 0.5, level: 0.8, sweepTo: 2600 });
  });
}
