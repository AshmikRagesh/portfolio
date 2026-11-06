// ── Pixel scenes ──────────────────────────────────────────────────────────────
// Small dithered pictures in the site's pixel style (the same seven tones as the work
// cards' pixel clouds: clear, pale, pale dither, mid, mid dither, deep, darkest). They
// stand in for trip photos and fill the book's cover. Each scene is a function from a
// point (u, v in 0–1, v down) to a tone.

import { memo } from "react";
import type { Palette, Scene } from "./trip";

const PALETTES: Record<Palette, { bg: string; pale: string; mid: string; deep: string; dark: string }> = {
  brand: { bg: "#FFFFFF", pale: "#F9E4FF", mid: "#F2B6EC", deep: "#9D136A", dark: "#32073e" },
  yellow: { bg: "#FFFDF6", pale: "#FFF3D1", mid: "#F7CF6E", deep: "#D9940F", dark: "#6b4300" },
  green: { bg: "#FBFEFC", pale: "#DDF4E6", mid: "#8FD5A9", deep: "#23845A", dark: "#0d3b27" },
  blue: { bg: "#FAFCFF", pale: "#DDEBFF", mid: "#93BCF5", deep: "#2A64CF", dark: "#0f2b63" },
};

const seg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const hash = (x: number, y: number) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

function sky(u: number, v: number, sun = { x: 0.72, y: 0.3, r: 0.09 }) {
  if (Math.hypot(u - sun.x, (v - sun.y) * 1.3) < sun.r) return 3;
  return v < 0.14 ? 2 : 1;
}

function palm(u: number, v: number, x: number, base: number, top: number, lean: number) {
  // Curved trunk, then a crown of fronds
  for (let k = 0; k <= 10; k++) {
    const t = k / 10;
    const tx = x + lean * t * t;
    const ty = base + (top - base) * t;
    if (Math.abs(u - tx) < 0.012 && Math.abs(v - ty) < 0.03) return true;
  }
  const cx = x + lean, cy = top;
  for (let a = 0; a < 7; a++) {
    const ang = Math.PI * (0.05 + (a / 6) * 0.9) + Math.PI;
    const ex = cx + Math.cos(ang) * 0.13, ey = cy - Math.sin(ang) * 0.05 + 0.05 * Math.abs(Math.cos(ang));
    if (seg(u, v, cx, cy, ex, ey) < 0.016) return true;
  }
  return false;
}

const SCENES: Record<Scene, (u: number, v: number, x: number, y: number) => number> = {
  nets: (u, v) => {
    if (seg(u, v, 0.18, 0.66, 0.46, 0.18) < 0.012 || seg(u, v, 0.74, 0.66, 0.46, 0.18) < 0.012) return 6;
    // The net hangs from the tip in a shallow bowl
    const inNet = v > 0.2 && v < 0.5 && Math.abs(u - 0.46) < (v - 0.18) * 0.9;
    if (inNet && (Math.round(u * 60) % 3 === 0 || Math.round(v * 60) % 3 === 0)) return 5;
    if (v > 0.62) return (Math.round(v * 40) + Math.round(u * 6)) % 3 === 0 ? 3 : 2;
    return sky(u, v);
  },
  fort: (u, v) => {
    // A row of colonial shopfronts with arched windows
    if (v > 0.32 && v < 0.86) {
      const house = Math.floor(u * 4);
      const lu = u * 4 - house;
      if (v < 0.4 && Math.abs(lu - 0.5) > 0.45 - (v - 0.32) * 4) return sky(u, v);
      const win = Math.abs(lu - 0.5) < 0.16 && v > 0.48 && v < 0.66;
      if (win) return 6;
      return house % 2 ? 3 : 4;
    }
    if (v >= 0.86) return 5;
    return sky(u, v);
  },
  dance: (u, v) => {
    // A Kathakali face: the green mask, the white frame, the crown
    const d = Math.hypot((u - 0.5) * 1.1, v - 0.55);
    if (v < 0.36 && Math.abs(u - 0.5) < 0.32 - (0.36 - v) * 0.6 && v > 0.08) return Math.round(u * 20) % 2 ? 5 : 6;
    if (d < 0.26) {
      if (Math.abs(v - 0.5) < 0.03 && Math.abs(Math.abs(u - 0.5) - 0.1) < 0.05) return 6;
      if (Math.abs(v - 0.66) < 0.025 && Math.abs(u - 0.5) < 0.08) return 5;
      return 3;
    }
    if (d < 0.32) return 0;
    return v > 0.8 ? 4 : 1;
  },
  hills: (u, v) => {
    const h1 = 0.4 + 0.07 * Math.sin(u * 6.5);
    const h2 = 0.6 + 0.06 * Math.sin(u * 8 + 1.4);
    const h3 = 0.8 + 0.04 * Math.sin(u * 11 + 3);
    const rows = (k: number) => Math.round(v * 52 + Math.sin(u * 9 + k) * 3) % 2;
    if (v > h3) return rows(2) ? 6 : 5;
    if (v > h2) return rows(1) ? 5 : 4;
    if (v > h1) return rows(0) ? 3 : 2;
    return sky(u, v);
  },
  mist: (u, v) => {
    const ridge = 0.5 + 0.12 * Math.sin(u * 5 + 0.5) - 0.08 * Math.abs(Math.sin(u * 13));
    if (v > ridge + 0.12) return v > 0.85 ? 6 : 5;
    if (v > ridge) return 4;
    if (Math.abs(v - 0.62 - 0.03 * Math.sin(u * 7)) < 0.06) return 1;
    return v < 0.18 ? 2 : 0;
  },
  falls: (u, v, x, y) => {
    if (Math.abs(u - 0.5) < 0.08 + v * 0.06 && v > 0.12) return hash(x, y) < 0.5 ? 0 : 1;
    if (v > 0.84) return 2;
    return Math.abs(u - 0.5) < 0.3 ? 4 : 6;
  },
  boat: (u, v) => {
    if (v > 0.64 && v < 0.7 && Math.abs(u - 0.52) < 0.2 - (v - 0.64) * 1.2) return 6;
    if (v > 0.56 && v <= 0.64 && Math.abs(u - 0.52) < 0.14 && Math.hypot((u - 0.52) / 0.14, (v - 0.64) / 0.08) < 1) return Math.round(u * 50) % 3 ? 5 : 3;
    if (palm(u, v, 0.12, 0.6, 0.26, 0.05) || palm(u, v, 0.86, 0.6, 0.3, -0.06)) return 6;
    if (v > 0.56 && v < 0.62) return 5;
    if (v > 0.62) return Math.round(v * 44) % 3 === 0 ? 3 : 1;
    return sky(u, v);
  },
  palms: (u, v) => {
    if (palm(u, v, 0.2, 0.72, 0.2, 0.06) || palm(u, v, 0.48, 0.72, 0.3, -0.04) || palm(u, v, 0.78, 0.72, 0.16, 0.05)) return 6;
    if (v > 0.7 && v < 0.76) return 5;
    if (v > 0.76) return Math.round(v * 44) % 2 ? 2 : 3;
    return sky(u, v, { x: 0.3, y: 0.32, r: 0.07 });
  },
  sunset: (u, v) => {
    const sun = Math.hypot(u - 0.5, (v - 0.56) * 1.2);
    if (v < 0.56 && sun < 0.14) return 3;
    if (v >= 0.56) {
      if (Math.abs(u - 0.5) < 0.14 - (v - 0.56) * 0.3 && Math.round(v * 60) % 2 === 0) return 3;
      return Math.round(v * 40) % 3 === 0 ? 5 : 4;
    }
    return v < 0.2 ? 4 : v < 0.38 ? 2 : 1;
  },
};

type Props = { scene: Scene; palette?: Palette; cols?: number; rows?: number; className?: string; title?: string };

/** Draws the scene on a grid of cells; dither tones are 1-cell checkerboards */
function PixelSceneInner({ scene, palette = "brand", cols = 40, rows = 30, className = "", title }: Props) {
  const p = PALETTES[palette];
  const fill = (tone: number, x: number, y: number) => {
    const odd = (x + y) % 2 === 1;
    switch (tone) {
      case 1: return p.pale;
      case 2: return odd ? p.pale : p.mid;
      case 3: return p.mid;
      case 4: return odd ? p.mid : p.deep;
      case 5: return p.deep;
      case 6: return p.dark;
      default: return null;
    }
  };
  const cells = [];
  const f = SCENES[scene];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const c = fill(f((x + 0.5) / cols, (y + 0.5) / rows, x, y), x, y);
      if (c) cells.push(<rect key={y * cols + x} x={x} y={y} width="1.02" height="1.02" fill={c} />);
    }
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} preserveAspectRatio="xMidYMid slice" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} shapeRendering="crispEdges">
      <rect width={cols} height={rows} fill={p.bg} />
      {cells}
    </svg>
  );
}

const PixelScene = memo(PixelSceneInner);
export default PixelScene;
