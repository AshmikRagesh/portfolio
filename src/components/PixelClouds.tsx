"use client";

import { useEffect, useRef } from "react";

// Pixel clouds over a work image, after the dithered sky on andreas.vision.
//
// The image is cut into an 8px grid. A drifting value-noise field, weighted towards the
// edges, picks one of seven tones per cell:
//   clear · pale dither · pale · mid dither · mid · deep dither · deep
// where a "dither" is a 1px checkerboard of the two tones either side of it, drawn at the
// screen's own pixel density so it stays crisp. Each card has its own colour (yellow,
// green, blue, grape; grey for NDA). On a hover the clouds roll in from the edges in quick
// steps, keep drifting
// while the pointer stays, and roll back out when it leaves. They stay light and hug the
// edges: the middle stays clear and the noise is weighted lightly, so grape (or dark grey)
// only shows at the outer peaks and the work itself stays in view.
//
// Hover is read from the card (the nearest .group). Touch screens never hover, so they
// never see it; with reduced motion the clouds appear and leave without drifting.
// `subtle` is for small covers: finer 4px cells, a wider clear middle, and no deep tones,
// so only a light fringe drifts round the edge.
const CELL = 8;
const DOT = 1;
// One set per card colour; greys for NDA works, to match their greyed-out image
const PALETTES = {
  brand: { pale: "#F9E4FF", mid: "#F2B6EC", deep: "#9D136A" },
  yellow: { pale: "#FFF3D1", mid: "#F7CF6E", deep: "#D9940F" },
  green: { pale: "#DDF4E6", mid: "#8FD5A9", deep: "#23845A" },
  blue: { pale: "#DDEBFF", mid: "#93BCF5", deep: "#2A64CF" },
  grey: { pale: "#F3F4F6", mid: "#D1D5DB", deep: "#6B7280" },
};
// Tone thresholds on the (field − hidden) value; seven tones, so six cuts
// The first cut sets how far the clouds reach; the later ones are close together so more
// of the cloud turns grape (or dark grey) without the cloud growing
const CUTS = [0.62, 0.67, 0.71, 0.75, 0.79, 0.84];
const STEPS = 12; // the reveal moves in this many visible jumps
const IN_MS = 520;
const OUT_MS = 360;
const DRIFT = 1.2; // cells per second
const MAX_TONE = 6; // all seven tones; the deepest only reach the outermost peaks
const CLEAR = 0.72; // no clouds inside this distance from the centre (0 = centre, 1 = corners)

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
    let last = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const shown = Math.ceil(cover * STEPS) / STEPS;
      if (shown <= 0) return;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Distance from the centre: 0 in the middle, ~1 in the corners
          const ex = ((c + 0.5) * cell) / w - 0.5;
          const ey = ((r + 0.5) * cell) / h - 0.5;
          const edge = Math.min(1, Math.hypot(ex * 1.6, ey * 1.8));
          // The middle stays clear: clouds only gather in the outer band
          if (edge < clear) continue;
          const field =
            0.4 * fbm((c + drift) * 0.14 * k, r * 0.2 * k, seed) + 0.6 * edge * edge + 0.04 * hash(c, r, seed + 3) - (1 - shown) * 0.7;
          let tone = 0;
          while (tone < maxTone && field >= CUTS[tone]) tone++;
          if (!tone) continue;
          ctx.fillStyle = fills[tone];
          const x = Math.round(c * cell * dpr);
          const y = Math.round(r * cell * dpr);
          ctx.fillRect(x, y, Math.round((c + 1) * cell * dpr) - x, Math.round((r + 1) * cell * dpr) - y);
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
      start();
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(canvas);
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, [seed, palette, subtle]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
