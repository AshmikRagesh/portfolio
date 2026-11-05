// ── Paper sounds ──────────────────────────────────────────────────────────────
// The résumé's sounds, synthesised with the Web Audio API like the bell: no audio
// file to load.
//
//   unfold   a sheet lifted off a pile and opened out: a soft rustle as it lifts,
//            a few dry crackles along the crease, then the low flap of the top half
//            landing flat. Timed to the fold (lands 0.84s after it starts).
//   tear     the stub torn along its perforation: a dry rasp with a crackle at
//            each hole as the tear passes it, and a soft tick as it comes free.
//   restock  a fresh stub sliding in: a short, soft brush of paper.

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

/** One perforation giving way: a short, dry crackle. */
export function tearTick(level = 1) {
  play(0.3, 0, (c, out, t) => {
    burst(c, out, t, { freq: 2600 + Math.random() * 2600, q: 1.8, attack: 0.002, decay: 0.018 + Math.random() * 0.02, level: 0.6 * level });
    if (Math.random() < 0.5) burst(c, out, t + 0.008, { freq: 1200, q: 1, attack: 0.002, decay: 0.02, level: 0.25 * level });
  });
}


/** The stub coming free: a light snap. */
export function tearFree(volume = 0.3) {
  play(volume, 0, (c, out, t) => {
    burst(c, out, t, { freq: 3800, q: 2.4, attack: 0.002, decay: 0.04, level: 0.7 });
    burst(c, out, t + 0.005, { freq: 600, q: 0.8, attack: 0.004, decay: 0.08, level: 0.35, type: "lowpass" });
  });
}

/** A fresh stub sliding in under the sheet. */
export function restockSound(volume = 0.2) {
  play(volume, 0, (c, out, t) => {
    burst(c, out, t, { freq: 900, q: 0.7, attack: 0.12, decay: 0.22, level: 0.45, sweepTo: 2200 });
  });
}

export type TearVoice = { set: (speed: number) => void; stop: () => void };

/**
 * The sound of a tear in progress, played live: fibres rasping, grainy, louder and
 * brighter the faster the tear front moves (speed in sheet-widths per second), silent
 * when it stops. Paired with tearTick() at each perforation.
 */
export function tearVoice(): TearVoice | null {
  const c = audio();
  if (!c) return null;
  if (c.state === "suspended") c.resume().catch(() => {});
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  src.loop = true;
  const high = c.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 900;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2000;
  band.Q.value = 0.8;
  const out = c.createGain();
  out.gain.value = 0;
  src.connect(high).connect(band).connect(out).connect(c.destination);
  src.start();
  let level = 0;
  return {
    set(speed) {
      const s = Math.min(1, speed / 1.8);
      // Paper fibres give way unevenly: the level flutters while it moves
      level += (s - level) * 0.35;
      const flutter = level > 0.01 ? 0.65 + Math.random() * 0.7 : 0;
      out.gain.setTargetAtTime(0.0001 + level * 0.3 * flutter, c.currentTime, 0.012);
      band.frequency.setTargetAtTime(1400 + level * 3000, c.currentTime, 0.03);
      if (level > 0.15 && Math.random() < level * 0.5) {
        burst(c, out.context.destination, c.currentTime, { freq: 3000 + Math.random() * 3000, q: 2, attack: 0.001, decay: 0.012, level: 0.12 * level });
      }
    },
    stop() {
      out.gain.setTargetAtTime(0, c.currentTime, 0.04);
      src.stop(c.currentTime + 0.3);
    },
  };
}
