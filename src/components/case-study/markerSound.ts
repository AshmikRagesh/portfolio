// ── Marker sound ──────────────────────────────────────────────────────────────
// The faint scratch of a highlighter pulled across paper, synthesised with the Web
// Audio API (no file to load), for the case study Highlight marks.
//
// A burst of noise, band-passed to the papery middle of the range, swells in, holds
// through the stroke and tails off; the band drifts up a little as the pen speeds up
// and a quick wobble in level gives it the grain of a felt tip on paper. It's kept
// very quiet on purpose: something you notice only if you're listening.
//
// Browsers keep audio switched off until the visitor has interacted with the page, so
// the marks stay silent until their first click, tap or key press; primeMarker()
// listens for that. Marks that draw together share one sound (a short cooldown).

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const VOLUME = 0.035; // very low, on purpose
const STROKE_S = 0.7; // matches the marker sweep in globals.css
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
  const length = Math.floor(c.sampleRate * (STROKE_S + 0.2));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  // Noise with a fast, uneven wobble in level: the felt tip catching the paper's grain
  for (let i = 0; i < length; i++) {
    const grain = 0.75 + 0.25 * Math.sin(i / 90 + Math.sin(i / 1700) * 3);
    data[i] = (Math.random() * 2 - 1) * grain;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;

  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(2200, at);
  band.frequency.linearRampToValueAtTime(3200, at + STROKE_S * 0.6);
  band.frequency.linearRampToValueAtTime(2600, at + STROKE_S);

  const soften = c.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 6000;

  const env = c.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(VOLUME, at + 0.06);
  env.gain.setValueAtTime(VOLUME * 0.85, at + STROKE_S * 0.8);
  env.gain.exponentialRampToValueAtTime(0.0001, at + STROKE_S + 0.15);

  source.connect(band).connect(soften).connect(env).connect(c.destination);
  source.start(at);
  source.stop(at + STROKE_S + 0.2);
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
