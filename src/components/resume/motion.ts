// ── Motion helpers for the résumé ─────────────────────────────────────────────

/** Cubic-bezier easing, as CSS defines it, for motion driven frame by frame. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(t) - x;
      const d = dx(t);
      if (Math.abs(err) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}

/**
 * A damped spring as a CSS `linear()` easing plus the time it takes to settle, so
 * Web Animations get real spring motion (a little overshoot, then rest) without a
 * library.
 */
export function spring(stiffness: number, damping: number, mass = 1) {
  const dt = 1 / 240;
  let x = 0, v = 0, t = 0;
  const samples: number[] = [0];
  while (t < 4) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    t += dt;
    samples.push(x);
    if (t > 0.1 && Math.abs(1 - x) < 0.0008 && Math.abs(v) < 0.004) break;
  }
  const n = 64;
  const points = Array.from({ length: n + 1 }, (_, i) => samples[Math.round((i / n) * (samples.length - 1))].toFixed(4));
  points[n] = "1";
  return { easing: `linear(${points.join(", ")})`, duration: Math.round(t * 1000) };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
// A fold: slow to lift, quick through the middle, soft as it lands
export const FOLD_EASE = "cubic-bezier(0.65, 0, 0.25, 1)";

/**
 * When a spring from 0 to 1 is visually done: the last moment it's further than
 * `within` (as a fraction of the travel) from rest. Earlier than the full settle,
 * which waits out the last invisible fraction of a pixel.
 */
export function settledAt(stiffness: number, damping: number, within: number, mass = 1) {
  const dt = 1 / 480;
  let x = 0, v = 0, t = 0, last = 0;
  while (t < 4) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    t += dt;
    if (Math.abs(1 - x) > within) last = t;
  }
  return Math.round(last * 1000);
}
