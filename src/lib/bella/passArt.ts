// ── The Curiosity Pass: shared art and data ───────────────────────────────────
// The pass is a blackcurrant card in a gold-foil frame whose corners curl inward in
// three scallops, with "Curiosity Pass" embossed tone-on-tone across the middle. This
// file holds what the page, the shared page and the share image all need:
//   frameSvg()   the frame and panel as an SVG string, at any size
//   encodePass() / decodePass()   the pass's details packed into a short URL-safe code,
//                so a shared link carries them and nothing is stored on the server
//   shareMessage()   the plain line that goes with a shared pass

import type { StampKey } from "./stampArt";

export const PASS_W = 700;
export const PASS_H = 500;
const MARGIN = 18; // gold frame showing round the panel
const CORNER = 62; // how far each corner's scallops reach

const f1 = (n: number) => n.toFixed(1);

// One corner's edge: a quarter turn round the corner point, its radius rippling in
// three scallops, meeting the straight edges cleanly at both ends
function corner(cx: number, cy: number, from: number, inset: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const a = ((from - 90 * t) * Math.PI) / 180;
    const r = CORNER + inset + 6 * Math.sin(Math.PI * t * 3);
    pts.push(`${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`);
  }
  return pts.join(" L");
}

/** The panel's outline, `inset` px further in than the frame's edge. */
export function panelPath(inset = 0, w = PASS_W, h = PASS_H) {
  const m = MARGIN + inset;
  return (
    `M${corner(m, m, 90, inset)}` +
    ` L${corner(w - m, m, 180, inset)}` +
    ` L${corner(w - m, h - m, 270, inset)}` +
    ` L${corner(m, h - m, 360, inset)} Z`
  );
}

const STAR = "M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z";

/** Gold-foil frame with a brushed grain, the blackcurrant panel pressed into it (a shadow
 * inside its top-left edge, light along the foil's), a fine foil keyline, and a star
 * debossed in each corner. Panel colours are the DS primary and midnight. */
export function frameSvg(id = "pf") {
  const stars = [
    [MARGIN + 22, MARGIN + 22],
    [PASS_W - MARGIN - 22, MARGIN + 22],
    [PASS_W - MARGIN - 22, PASS_H - MARGIN - 22],
    [MARGIN + 22, PASS_H - MARGIN - 22],
  ]
    .map(
      ([x, y]) =>
        `<path d="${STAR}" transform="translate(${x + 0.6} ${y + 0.8})" fill="#fff6d8" opacity="0.55"/>` +
        `<path d="${STAR}" transform="translate(${x} ${y})" fill="#7a5420" opacity="0.75"/>`,
    )
    .join("");
  const panel = panelPath();
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PASS_W} ${PASS_H}" preserveAspectRatio="none">` +
    `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#f1d58a"/><stop offset="0.18" stop-color="#c3913a"/><stop offset="0.36" stop-color="#ecca72"/>` +
    `<stop offset="0.52" stop-color="#b28233"/><stop offset="0.7" stop-color="#e6c06a"/><stop offset="0.86" stop-color="#a97a2c"/>` +
    `<stop offset="1" stop-color="#dcb560"/></linearGradient>` +
    // Brushed foil: fine streaks running across
    `<filter id="${id}b" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.004 0.7" numOctaves="2" seed="5"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.8  0.9 0 0 0 -0.38"/>` +
    `<feComposite in2="SourceAlpha" operator="in"/></filter>` +
    `<radialGradient id="${id}p" cx="50%" cy="40%" r="72%"><stop offset="0" stop-color="#3a0a47"/><stop offset="0.6" stop-color="#32073e"/><stop offset="1" stop-color="#1e0525"/></radialGradient>` +
    `<clipPath id="${id}c"><path d="${panel}"/></clipPath>` +
    `<filter id="${id}s" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>` +
    `<rect width="${PASS_W}" height="${PASS_H}" rx="10" fill="url(#${id}g)"/>` +
    `<rect width="${PASS_W}" height="${PASS_H}" rx="10" fill="#000" filter="url(#${id}b)" opacity="0.5"/>` +
    // The foil's own bevel round the outside
    `<rect x="1" y="1" width="${PASS_W - 2}" height="${PASS_H - 2}" rx="9" fill="none" stroke="#fff6d8" stroke-opacity="0.5" stroke-width="1.5"/>` +
    stars +
    // Light along the foil where it meets the panel, then the panel, pressed in
    `<path d="${panel}" fill="none" stroke="#fff6d8" stroke-opacity="0.55" stroke-width="2" transform="translate(0.8 1)"/>` +
    `<path d="${panel}" fill="url(#${id}p)"/>` +
    `<g clip-path="url(#${id}c)"><path d="${panel}" fill="none" stroke="#0b0110" stroke-opacity="0.7" stroke-width="7" filter="url(#${id}s)" transform="translate(2 3)"/></g>` +
    `<path d="${panelPath(10)}" fill="none" stroke="#d9b45e" stroke-opacity="0.55" stroke-width="1.5"/>` +
    `</svg>`
  );
}

// ── The pass's details, in a shareable code ──
export interface PassData {
  /** Guest number */
  n: number | null;
  /** From (city, country) */
  f: string | null;
  /** Arrived (as shown) */
  a: string;
  /** Stay in active seconds */
  s: number;
  /** Here as */
  h: string | null;
  /** Stamps found */
  k: StampKey[];
}

const KEYS: StampKey[] = ["ring", "screen", "desk", "two", "back"];
const HERE = ["Recruiter", "Designer", "Engineer", "Just curious"];

function toB64(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodePass(d: PassData) {
  return toB64(JSON.stringify(d));
}

/** Read a shared code back, keeping only well-formed, short values. */
export function decodePass(code: string): PassData | null {
  try {
    if (code.length > 400) return null;
    const r = JSON.parse(fromB64(code)) as Record<string, unknown>;
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max).replace(/[<>]/g, "") : null);
    return {
      n: typeof r.n === "number" && r.n > 0 && r.n < 1e7 ? Math.floor(r.n) : null,
      f: str(r.f, 48),
      a: str(r.a, 24) ?? "",
      s: typeof r.s === "number" && r.s >= 0 ? Math.min(Math.floor(r.s), 360_000) : 0,
      h: HERE.includes(r.h as string) ? (r.h as string) : null,
      k: Array.isArray(r.k) ? KEYS.filter((k) => (r.k as unknown[]).includes(k)) : [],
    };
  } catch {
    return null;
  }
}

export function formatStay(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}

export function guestNumber(n: number | null) {
  return n === null ? "····" : String(n).padStart(4, "0");
}

/** The plain line that goes with a shared pass. */
export function shareMessage(d: PassData) {
  const stamps = d.k.length ? ` and found ${d.k.length} of 5 stamps` : "";
  return `I spent ${formatStay(d.s)} exploring Ashmik Ragesh's portfolio${stamps}. Here's my Curiosity Pass.`;
}
