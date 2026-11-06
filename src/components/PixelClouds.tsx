"use client";

import { useEffect, useRef } from "react";

// Pixel clouds over a work image, after the dithered sky on andreas.vision.
//
// The image is cut into an 8px grid. A drifting value-noise field, weighted towards the
// edges, picks one of seven tones per cell:
//   clear · pale dither · pale · mid dither · mid · deep dither · deep
// where a "dither" is a 1px checkerboard of the two tones either side of it, drawn at the
// screen's own pixel density so it stays crisp. Every card uses brand pink (grey for NDA
// works, to match their greyed-out image). On a
// hover the clouds puff in from the edges in quick steps (easing to a stop, never
// past where they rest), keep drifting on two axes and breathing while the pointer stays, swell towards
// the pointer when it comes near the image, and throw off the odd twinkling pixel along
// their fringe. They roll back out when it leaves. They stay light and hug the edges: the
// middle stays clear, so grape only shows at the outer peaks and the work stays in view.
//
// Hover is read from the card (the nearest .group). Touch screens never hover, so they
// never see it; with reduced motion the clouds appear and leave without drifting.
// `subtle` is for small covers: finer 4px cells, a wider clear middle, and no deep tones,
// so only a light fringe drifts round the edge.
const CELL = 8;
const DOT = 1;
// Brand pink, from pale blush to grape; greys for NDA works
const PALETTES = {
  brand: { pale: "#F9E4FF", mid: "#F2B6EC", deep: "#9D136A" },
  grey: { pale: "#F3F4F6", mid: "#D1D5DB", deep: "#6B7280" },
};
const SPARK = "#FFFFFF"; // twinkling pixels on the fringe
// Tone thresholds on the (field − hidden) value; seven tones, so six cuts
// The first cut sets how far the clouds reach; the later ones are close together so more
// of the cloud turns grape (or dark grey) without the cloud growing
const CUTS = [0.64, 0.68, 0.71, 0.75, 0.79, 0.84];
const STEPS = 16; // the reveal moves in this many visible jumps
const IN_MS = 640;
const OUT_MS = 380;
const DRIFT = 1.3; // cells per second, sideways
const BOB = 0.4; // cells of slow up-and-down sway
const BREATHE = 0.015; // how much the clouds swell and shrink while hovered
const PULL = 0.1; // how far the clouds swell towards a nearby pointer
const TWINKLE = 0.018; // share of fringe cells sparkling at any moment
const MAX_TONE = 6; // all seven tones; the deepest only reach the outermost peaks
const CLEAR = 0.74; // no clouds inside this distance from the centre (0 = centre, 1 = corners)

function hash(x: number, y: number, seed: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  const top = a + (b - a) * u;
  return top + (c + (d - c) * u - top) * v;
}

const fbm = (x: number, y: number, seed: number) =>
  0.6 * noise(x, y, seed) + 0.3 * noise(x * 2, y * 2, seed + 1) + 0.1 * noise(x * 4, y * 4, seed + 2);

function checker(ctx: CanvasRenderingContext2D, a: string | null, b: string, px: number) {
  const tile = document.createElement("canvas");
  tile.width = tile.height = px * 2;
  const t = tile.getContext("2d")!;
  if (a) {
    t.fillStyle = a;
    t.fillRect(0, 0, px * 2, px * 2);
  }
  t.fillStyle = b;
  t.fillRect(0, 0, px, px);
  t.fillRect(px, px, px, px);
  return ctx.createPattern(tile, "repeat")!;
}

// Fast at first, easing to a stop at full, with no overshoot (so the clouds never swell
// past their resting size and shrink back)
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export default function PixelClouds({
  seed = 1,
  palette = "brand",
  subtle = false,
  className = "",
}: {
  seed?: number;
  palette?: keyof typeof PALETTES;
  subtle?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const card = canvas?.closest<HTMLElement>(".group");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !card || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cell = subtle ? 4 : CELL;
    // The noise is tuned for 16px cells; scale it so the clouds keep their size
    const k = cell / 16;
    const clear = subtle ? 0.84 : CLEAR;
    const maxTone = subtle ? 4 : MAX_TONE;
    let fills: (string | CanvasPattern)[] = [];
    let dpr = 1;
    let w = 0;
    let h = 0;

    const size = () => {
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const px = Math.max(1, Math.round(DOT * dpr));
      const COLORS = PALETTES[palette];
      fills = [
        "",
        checker(ctx, null, COLORS.pale, px),
        COLORS.pale,
        checker(ctx, COLORS.pale, COLORS.mid, px),
        COLORS.mid,
        checker(ctx, COLORS.mid, COLORS.deep, px),
        COLORS.deep,
      ];
    };

    let cover = 0; // 0 = no clouds, 1 = fully in
    let target = 0;
    let drift = 0;
    let time = 0; // seconds of hover, for the sway, breathing and twinkles
    let last = 0;
    let raf = 0;
    // The pointer in the canvas's own 0–1 space (far away when unknown), eased so the
    // swell glides after it rather than jumping
    let px = 9;
    let py = 9;
    let gx = 9;
    let gy = 9;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Rolling in: ease to a stop. Rolling out: straight back.
      const eased = target > 0 && !still ? easeOut(cover) : cover;
      const shown = Math.ceil(eased * STEPS) / STEPS;
      if (shown <= 0) return;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const bob = Math.sin(time * 0.9) * BOB;
      const breathe = Math.sin(time * 2.2) * BREATHE * Math.min(1, cover);
      const tick6 = Math.floor(time * 7); // twinkles change seven times a second
      const fill = (c: number, r: number) => {
        const x = Math.round(c * cell * dpr);
        const y = Math.round(r * cell * dpr);
        ctx.fillRect(x, y, Math.round((c + 1) * cell * dpr) - x, Math.round((r + 1) * cell * dpr) - y);
      };
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Distance from the centre: 0 in the middle, ~1 in the corners
          const ux = ((c + 0.5) * cell) / w;
          const uy = ((r + 0.5) * cell) / h;
          const ex = ux - 0.5;
          const ey = uy - 0.5;
          const edge = Math.min(1, Math.hypot(ex * 1.6, ey * 1.8));
          // The middle stays clear: clouds only gather in the outer band
          if (edge < clear) continue;
          // Swell towards the pointer when it's near (it fades out ~a third of the way across)
          const d2 = ((ux - gx) * 1.6) ** 2 + ((uy - gy) * 1.8) ** 2;
          const pull = d2 < 0.3 ? PULL * Math.exp(-d2 / 0.06) : 0;
          const field =
            0.4 * fbm((c + drift) * 0.14 * k, (r + bob) * 0.2 * k, seed) +
            0.6 * edge * edge +
            0.04 * hash(c, r, seed + 3) +
            breathe +
            pull -
            (1 - shown) * 0.7;
          let tone = 0;
          while (tone < maxTone && field >= CUTS[tone]) tone++;
          if (!tone) continue;
          ctx.fillStyle = fills[tone];
          fill(c, r);
          // A few pale fringe cells twinkle white for a beat once the clouds are in
          if (!still && !subtle && tone <= 2 && cover > 0.6 && hash(c, r, seed + tick6) < TWINKLE) {
            ctx.fillStyle = SPARK;
            fill(c, r);
          }
        }
      }
    };

    const tick = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      if (still) cover = target;
      else {
        cover = target > cover ? Math.min(target, cover + dt / IN_MS) : Math.max(target, cover - dt / OUT_MS);
        drift += (dt / 1000) * DRIFT;
        time += dt / 1000;
        const ease = 1 - Math.exp(-dt / 120);
        gx += (px - gx) * ease;
        gy += (py - gy) * ease;
      }
      draw();
      // Keep going while hovered (drifting) or still rolling out
      raf = (target > 0 && !still) || cover > 0 ? requestAnimationFrame(tick) : 0;
      if (!raf) last = 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // a finger landing on the card mid-scroll isn't a hover
      target = 1;
      start();
    };
    const onLeave = () => {
      target = 0;
      px = py = 9;
      start();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const b = canvas.getBoundingClientRect();
      if (!b.width || !b.height) return;
      px = (e.clientX - b.left) / b.width;
      py = (e.clientY - b.top) / b.height;
      // First sighting: start the swell where the pointer is, not gliding in from afar
      if (gx > 5) {
        gx = px;
        gy = py;
      }
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(canvas);
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);
    card.addEventListener("pointermove", onMove);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      card.removeEventListener("pointermove", onMove);
    };
  }, [seed, palette, subtle]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
