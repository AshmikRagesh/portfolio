// ── Marker sound ──────────────────────────────────────────────────────────────
// A highlighter stroke across paper, synthesised with the Web Audio API (no file to
// load), for the case study Highlight marks.
//
// Paper friction is irregular: the felt never catches at a steady rhythm (a steady
// rhythm is heard as a pitch, which is what makes friction sound like a drill). So the
// noise is roughened by two random drifts, one slow and one fast, with no pattern to
// them. Its level and brightness follow the hand: the stroke speeds up, the sound gets
// louder and brighter, then it eases off as the pen slows and lifts. It's kept very
// quiet on purpose: something you notice only if you're listening.
//
// Browsers keep audio switched off until the visitor has interacted with the page, so
// the marks stay silent until their first click, tap or key press; primeMarker()
// listens for that. Marks that draw together share one sound (a short cooldown).

import { soundsMuted } from "@/lib/sound/ui";
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const VOLUME = 0.012; // very low, on purpose (the stroke's shape keeps most of it quieter still)
const STROKE_S = 0.48;
const COOLDOWN_MS = 500;

let ctx: AudioContext | null = null;
let last = 0;
let primed = false;

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  ctx = AC ? new AC() : null;
  return ctx;
}

/** One stroke of the marker. Silent until the page has had a click, tap or key press. */
export function playMarker() {
  if (soundsMuted()) return;
  const c = ctx;
  if (!c || c.state !== "running") return;
  const now = performance.now();
  if (now - last < COOLDOWN_MS) return;
  last = now;

  const at = c.currentTime;
  const sr = c.sampleRate;

  const length = Math.floor(sr * STROKE_S);
  const buffer = c.createBuffer(1, length, sr);
  const data = buffer.getChannelData(0);
  let slow = 0; // the paper's unevenness under the pen
  let fast = 0; // the felt's fine grain
  for (let i = 0; i < length; i++) {
    const t = i / length;
    // The hand: speeds up quickly, then slows into the lift
    const speed = Math.sin(Math.PI * Math.pow(t, 0.8));
    slow += (Math.random() - 0.5) * 0.35 - slow * 0.08;
    fast += (Math.random() - 0.5) * 0.9 - fast * 0.35;
    const grain = Math.max(0, 0.6 + slow * 1.2 + fast * 0.35);
    data[i] = (Math.random() * 2 - 1) * grain * speed;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;

  const body = c.createBiquadFilter();
  body.type = "highpass";
  body.frequency.value = 900;
  // Brighter while the stroke is fastest
  const bright = c.createBiquadFilter();
  bright.type = "lowpass";
  bright.Q.value = 0.5;
  bright.frequency.setValueAtTime(2600, at);
  bright.frequency.linearRampToValueAtTime(5200, at + STROKE_S * 0.45);
  bright.frequency.linearRampToValueAtTime(3000, at + STROKE_S);

  const level = c.createGain();
  level.gain.value = VOLUME;

  source.connect(body).connect(bright).connect(level).connect(c.destination);
  source.start(at);
}

/** Wake the audio up on the visitor's first interaction (once per page). */
export function primeMarker() {
  if (primed) return;
  primed = true;
  const wake = () => {
    audio()?.resume();
    events.forEach((e) => window.removeEventListener(e, wake, true));
  };
  const events = ["pointerdown", "keydown", "touchstart"] as const;
  events.forEach((e) => window.addEventListener(e, wake, { capture: true, passive: true }));
}
