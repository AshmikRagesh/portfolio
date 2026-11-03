// ── Marker sound ──────────────────────────────────────────────────────────────
// The faint swish of a fat felt-tip marker on thick paper, synthesised with the Web
// Audio API (no file to load), for the case study Highlight marks.
//
// Soft, low "brown" noise (no hiss or crackle) through a gentle low-pass that opens up
// as the stroke speeds through the middle and closes as it slows, under a smooth swell
// in and fade out, so it reads as a glide rather than static. It's kept very quiet on
// purpose: something you notice only if you're listening.
//
// Browsers keep audio switched off until the visitor has interacted with the page, so
// the marks stay silent until their first click, tap or key press; primeMarker()
// listens for that. Marks that draw together share one sound (a short cooldown).

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const VOLUME = 0.04; // very low, on purpose (brown noise is quieter than it reads here)
const STROKE_S = 0.55;
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
  const c = ctx;
  if (!c || c.state !== "running") return;
  const now = performance.now();
  if (now - last < COOLDOWN_MS) return;
  last = now;

  const at = c.currentTime;

  // Brown noise: white noise, smoothed, so its energy sits low and soft
  const length = Math.floor(c.sampleRate * (STROKE_S + 0.05));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  let smooth = 0;
  for (let i = 0; i < length; i++) {
    smooth = (smooth + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = smooth * 3.5;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;

  const tone = c.createBiquadFilter();
  tone.type = "lowpass";
  tone.Q.value = 0.7;
  tone.frequency.setValueAtTime(900, at);
  tone.frequency.linearRampToValueAtTime(1800, at + STROKE_S * 0.55);
  tone.frequency.linearRampToValueAtTime(1100, at + STROKE_S);

  // A smooth swell in and a long fade out, with no hard edges to click
  const points = 64;
  const curve = new Float32Array(points);
  const attack = 0.25;
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const rise = Math.sin((Math.min(1, t / attack) * Math.PI) / 2);
    const fall = t < attack ? 1 : Math.pow(1 - (t - attack) / (1 - attack), 1.6);
    curve[i] = VOLUME * rise * fall;
  }
  const env = c.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.setValueCurveAtTime(curve, at, STROKE_S);

  source.connect(tone).connect(env).connect(c.destination);
  source.start(at);
  source.stop(at + STROKE_S + 0.05);
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
