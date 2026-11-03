// ── Marker sound ──────────────────────────────────────────────────────────────
// The rasp of a highlighter's felt tip dragged across paper, synthesised with the Web
// Audio API (no file to load), for the case study Highlight marks.
//
// A real felt tip doesn't hiss evenly: it catches on the paper's fibres and lets go,
// many times a second (stick-slip). So the noise comes in tiny bursts, roughly 95 a
// second with a little jitter, band-passed to the paper's papery middle-high range and
// rising slightly as the stroke speeds up. A faint squeak sits in the middle of the
// stroke, as a fresh marker gives, and the stroke ends on a quick lift. It's kept very
// quiet on purpose: something you notice only if you're listening.
//
// Browsers keep audio switched off until the visitor has interacted with the page, so
// the marks stay silent until their first click, tap or key press; primeMarker()
// listens for that. Marks that draw together share one sound (a short cooldown).

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const VOLUME = 0.03; // the rasp; very low, on purpose
const SQUEAK = 0.0035; // the felt tip's faint squeak, far under the rasp
const STROKE_S = 0.36;
const CATCHES_PER_S = 95; // how often the tip catches the paper
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
  const sr = c.sampleRate;

  // Noise in small bursts: each catch of the tip, then a 3ms fade back to the drag
  const length = Math.floor(sr * (STROKE_S + 0.05));
  const buffer = c.createBuffer(1, length, sr);
  const data = buffer.getChannelData(0);
  const fade = Math.exp(-1 / (sr * 0.003));
  let nextCatch = 0;
  let burst = 0;
  for (let i = 0; i < length; i++) {
    if (i >= nextCatch) {
      burst = 1;
      nextCatch = i + Math.floor((sr / CATCHES_PER_S) * (0.75 + Math.random() * 0.5));
    }
    burst *= fade;
    data[i] = (Math.random() * 2 - 1) * (0.45 + 0.55 * burst);
  }
  const rasp = c.createBufferSource();
  rasp.buffer = buffer;

  const low = c.createBiquadFilter();
  low.type = "highpass";
  low.frequency.value = 1500;
  const paper = c.createBiquadFilter();
  paper.type = "bandpass";
  paper.Q.value = 0.9;
  paper.frequency.setValueAtTime(3800, at);
  paper.frequency.linearRampToValueAtTime(4600, at + STROKE_S * 0.6);
  paper.frequency.linearRampToValueAtTime(4000, at + STROKE_S);

  // Quick touch down, a steady drag, a quick lift
  const level = c.createGain();
  level.gain.setValueAtTime(0, at);
  level.gain.linearRampToValueAtTime(VOLUME, at + 0.012);
  level.gain.setValueAtTime(VOLUME * 0.9, at + STROKE_S - 0.06);
  level.gain.linearRampToValueAtTime(0, at + STROKE_S);

  rasp.connect(low).connect(paper).connect(level).connect(c.destination);
  rasp.start(at);
  rasp.stop(at + STROKE_S + 0.05);

  // The squeak: a soft tone gliding up with a slight wobble, in the middle of the stroke
  const s0 = at + 0.05;
  const sLen = STROKE_S - 0.1;
  const squeak = c.createOscillator();
  squeak.frequency.setValueAtTime(2300, s0);
  squeak.frequency.linearRampToValueAtTime(2550, s0 + sLen);
  const wobble = c.createOscillator();
  const wobbleDepth = c.createGain();
  wobble.frequency.value = 9;
  wobbleDepth.gain.value = 28;
  wobble.connect(wobbleDepth).connect(squeak.frequency);
  const squeakLevel = c.createGain();
  squeakLevel.gain.setValueAtTime(0, s0);
  squeakLevel.gain.linearRampToValueAtTime(SQUEAK, s0 + sLen * 0.3);
  squeakLevel.gain.linearRampToValueAtTime(SQUEAK * 0.8, s0 + sLen * 0.7);
  squeakLevel.gain.linearRampToValueAtTime(0, s0 + sLen);
  squeak.connect(squeakLevel).connect(c.destination);
  squeak.start(s0);
  wobble.start(s0);
  squeak.stop(s0 + sLen + 0.02);
  wobble.stop(s0 + sLen + 0.02);
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
