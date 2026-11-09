// ── Interface sounds (DS) ─────────────────────────────────────────────────────
// The site's small sounds for pointing and pressing, synthesised with the Web Audio API
// (no files to load). Learnt from dutilh.net: every sound is a few short layers, each a
// burst of filtered noise (the "click" of paper, a key, a switch) or a sine/triangle tone
// (the "ping"), shaped by a fast attack and an exponential fade. Kept tiny and quiet so
// they read as texture, not as notifications.
//
// Where each one is used (wired up in components/SoundLayer.tsx):
//   tick     hovering any link or button
//   whisper  hovering media and diagrams (images, videos, play tiles, a modal diagram)
//   note     hovering a bar or chart point; pitched by its value (data-pitch), so taller
//            bars sound higher and sweeping across a chart plays its shape
//   press    pressing a button down
//   toggle   switching a tab, variant or option (data-sound-click="toggle")
//   page     arriving on a new page
//   pop      opening something (a viewer, a panel)
//   done     a small success (copied, finished)
//
// The visitor can mute them all from the navbar; the choice is kept in localStorage and
// the other synthesised sounds (Bella's bell, the marker, the paper) follow it too.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

type Layer =
  | { kind: "noise"; filter: BiquadFilterType; freq: number; q?: number; offset?: number; attack: number; decay: number; peak: number }
  | { kind: "tone"; wave: OscillatorType; freq: number; glideTo?: number; offset?: number; attack: number; decay: number; peak: number };
type Recipe = { gain: number; layers: Layer[] };

// Tuned to the site: soft paper and felt rather than hard plastic, the tones on a
// pentatonic-friendly pitch so chart sweeps sound musical
const RECIPES = {
  tick: {
    gain: 0.18,
    layers: [
      { kind: "noise", filter: "bandpass", freq: 3800, q: 1.4, attack: 0.001, decay: 0.016, peak: 0.1 },
      { kind: "tone", wave: "sine", freq: 2100, attack: 0.001, decay: 0.012, peak: 0.01 },
    ],
  },
  whisper: {
    gain: 0.16,
    layers: [{ kind: "noise", filter: "lowpass", freq: 1300, q: 0.8, attack: 0.004, decay: 0.032, peak: 0.07 }],
  },
  note: {
    gain: 0.2,
    layers: [
      { kind: "tone", wave: "sine", freq: 523.25, attack: 0.003, decay: 0.11, peak: 0.05 },
      { kind: "tone", wave: "sine", freq: 1046.5, attack: 0.003, decay: 0.05, peak: 0.008 },
    ],
  },
  press: {
    gain: 0.3,
    layers: [{ kind: "noise", filter: "bandpass", freq: 1500, q: 1.3, attack: 0.001, decay: 0.02, peak: 0.12 }],
  },
  toggle: {
    gain: 0.22,
    layers: [
      { kind: "noise", filter: "bandpass", freq: 2000, q: 1.5, attack: 0.001, decay: 0.016, peak: 0.12 },
      { kind: "noise", filter: "bandpass", freq: 3700, q: 1.5, offset: 0.024, attack: 0.001, decay: 0.02, peak: 0.1 },
    ],
  },
  page: {
    gain: 0.2,
    layers: [
      { kind: "noise", filter: "lowpass", freq: 1800, q: 0.7, attack: 0.006, decay: 0.085, peak: 0.11 },
      { kind: "noise", filter: "bandpass", freq: 4200, q: 1.2, offset: 0.04, attack: 0.004, decay: 0.06, peak: 0.07 },
      { kind: "tone", wave: "sine", freq: 2093, offset: 0.08, attack: 0.002, decay: 0.045, peak: 0.018 },
    ],
  },
  pop: {
    gain: 0.32,
    layers: [
      { kind: "tone", wave: "sine", freq: 600, glideTo: 300, attack: 0.002, decay: 0.07, peak: 0.06 },
      { kind: "noise", filter: "bandpass", freq: 1200, q: 1.2, attack: 0.001, decay: 0.02, peak: 0.07 },
    ],
  },
  done: {
    gain: 0.16,
    layers: [
      { kind: "tone", wave: "sine", freq: 784, attack: 0.003, decay: 0.09, peak: 0.04 },
      { kind: "tone", wave: "sine", freq: 1175, offset: 0.09, attack: 0.003, decay: 0.16, peak: 0.04 },
    ],
  },
} satisfies Record<string, Recipe>;

export type SoundName = keyof typeof RECIPES;
export const isSoundName = (s: string): s is SoundName => s in RECIPES;

const MASTER = 1.2;
const KEY = "ashmik:sounds";

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let muted: boolean | null = null;
let unlocked = false;
const listeners = new Set<(muted: boolean) => void>();

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

// One shared 0.3s of white noise; every noise layer filters a slice of it
function noiseBuffer(c: AudioContext) {
  if (noise) return noise;
  const n = Math.floor(c.sampleRate * 0.3);
  noise = c.createBuffer(1, n, c.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

function render(c: AudioContext, r: Recipe, volume: number, pitch: number) {
  const t0 = c.currentTime + 0.005;
  const out = c.createGain();
  out.gain.value = r.gain * volume * MASTER;
  out.connect(c.destination);
  for (const l of r.layers) {
    const at = t0 + (l.offset ?? 0);
    const end = at + l.attack + l.decay;
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(l.peak, at + l.attack);
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    env.connect(out);
    if (l.kind === "noise") {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c);
      const f = c.createBiquadFilter();
      f.type = l.filter;
      f.frequency.value = l.freq;
      f.Q.value = l.q ?? 1;
      src.connect(f).connect(env);
      src.start(at, Math.random() * 0.2); // a different slice each time, so repeats never sound identical
      src.stop(end + 0.02);
    } else {
      const o = c.createOscillator();
      o.type = l.wave;
      o.frequency.setValueAtTime(l.freq * pitch, at);
      if (l.glideTo) o.frequency.exponentialRampToValueAtTime(l.glideTo * pitch, end);
      o.connect(env);
      o.start(at);
      o.stop(end + 0.02);
    }
  }
}

/** Whether the visitor has muted the site's sounds (read once from localStorage). */
export function soundsMuted() {
  if (muted === null) {
    try {
      muted = localStorage.getItem(KEY) === "off";
    } catch {
      muted = false;
    }
  }
  return muted;
}

export function setSoundsMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem(KEY, m ? "off" : "on");
  } catch {}
  listeners.forEach((fn) => fn(m));
}

export function onSoundsMuted(fn: (muted: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Browsers keep audio off until the first click, tap or key press; call this then. */
export function unlockSounds() {
  unlocked = true;
  audio()?.resume().catch(() => {});
}

/** Play one interface sound. `pitch` scales the tones (1 = as written). */
export function playSound(name: SoundName, { volume = 1, pitch = 1 }: { volume?: number; pitch?: number } = {}) {
  if (!unlocked || soundsMuted()) return;
  const c = audio();
  if (!c) return;
  const r: Recipe = RECIPES[name];
  if (c.state === "running") render(c, r, volume, pitch);
  else c.resume().then(() => render(c, r, volume, pitch)).catch(() => {});
}

/** The pitch for a value on a chart: 0 → low, max → about two octaves up. */
export const pitchFor = (value: number, max: number) => (0.6 + 1.4 * (max > 0 ? Math.max(0, value) / max : 0)).toFixed(3);
