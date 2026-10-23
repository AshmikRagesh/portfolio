// ── Bell sound ────────────────────────────────────────────────────────────────
// A "ding ding" from a front-desk bell, synthesised with the Web Audio API — no
// audio file to load.
//
// Each strike is a short metallic click (a burst of high-passed noise, the plunger
// hitting the clapper) over the bell's ring: a handful of sine partials at the
// inharmonic ratios of a struck dome, each fading on its own curve, with a slightly
// detuned copy of the fundamental so the tone shimmers the way real metal does.
// Two strikes, the second a touch softer, like a quick double tap on the plunger.
//
// Browsers keep audio switched off until the visitor has interacted with the page,
// so the bell stays silent on hover until their first click, tap or key press —
// primeBell() listens for that and wakes the audio up.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const FUNDAMENTAL = 2090; // Hz — a small desk bell rings around here
// [ratio to the fundamental, level, seconds to fade out, detune in cents]
const PARTIALS: [number, number, number, number][] = [
  [1, 1, 1.8, 0],
  [1, 0.5, 1.6, 7],
  [2.32, 0.32, 0.9, 0],
  [4.25, 0.14, 0.45, 0],
  [6.8, 0.05, 0.2, 0],
];
const VOLUME = 0.14;
const SECOND_STRIKE_S = 0.17;
const COOLDOWN_MS = 900;

let ctx: AudioContext | null = null;
let lastRing = 0;

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  ctx = AC ? new AC() : null;
  return ctx;
}

function strike(c: AudioContext, at: number, level: number) {
  const out = c.createGain();
  out.gain.value = VOLUME * level;
  out.connect(c.destination);

  for (const [ratio, amp, fade, detune] of PARTIALS) {
    const osc = c.createOscillator();
    osc.frequency.value = FUNDAMENTAL * ratio;
    osc.detune.value = detune;
    const env = c.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(amp, at + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, at + fade);
    osc.connect(env).connect(out);
    osc.start(at);
    osc.stop(at + fade + 0.05);
  }

  // The click of the strike
  const length = Math.floor(c.sampleRate * 0.015);
  const noise = c.createBuffer(1, length, c.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const click = c.createBufferSource();
  click.buffer = noise;
  const highpass = c.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 4000;
  const clickLevel = c.createGain();
  clickLevel.gain.value = 0.35;
  click.connect(highpass).connect(clickLevel).connect(out);
  click.start(at);
}

/** Ring the bell — ding ding. Silent until the page has had a click, tap or key press. */
export function ringBell() {
  const c = audio();
  if (!c || c.state !== "running") return;
  const now = performance.now();
  if (now - lastRing < COOLDOWN_MS) return;
  lastRing = now;
  strike(c, c.currentTime, 1);
  strike(c, c.currentTime + SECOND_STRIKE_S, 0.75);
}

/** Wake the audio up on the visitor's first interaction. Returns a cleanup. */
export function primeBell() {
  const wake = () => {
    audio()?.resume();
    remove();
  };
  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const remove = () => events.forEach((e) => window.removeEventListener(e, wake, true));
  events.forEach((e) => window.addEventListener(e, wake, { capture: true, passive: true }));
  return remove;
}
