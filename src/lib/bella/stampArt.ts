// ── Stamps ────────────────────────────────────────────────────────────────────
// Five stamps a visitor can collect, each for finding something. Each one is a real
// postage stamp from "Curiosity Post", the guesthouse's own mail: perforated edges,
// aged cream paper with fibres and toning, the picture engraved in a single ink (fine
// line hatching, like old intaglio stamps), a value in the corners, and a postmark
// cancelled across it in dark ink, so it looks used.
//   First ring    grape, portrait: Bella ringing, value 1
//   Screening     carmine, landscape: a stage with the curtains drawn back, Bella's
//                 eyes looking out, value 2
//   Front desk    blackcurrant, portrait: a room key fob in an arched window, value 3
//   Two in a row  green, portrait: two doors, 1 and 2, the second open, value 4
//   Back again    slate, a triangle stamp: the house with the sun coming up, value 5
// Inks are DS colours (grape, warning, primary, success, secondary).
// `ink: "none"` draws an empty slot in the stamp's shape, for a stamp not found yet.
//
// Returns an SVG string so the same art works in React (dangerouslySetInnerHTML,
// static markup only), in the share image, and anywhere else.

export type StampKey = "ring" | "screen" | "desk" | "two" | "back";

export const STAMPS: { key: StampKey; name: string; earned: string }[] = [
  { key: "ring", name: "First ring", earned: "Rang Bella for the first time." },
  { key: "screen", name: "Screening", earned: "Watched a walkthrough video." },
  { key: "desk", name: "Front desk", earned: "Copied Ashmik's email." },
  { key: "two", name: "Two in a row", earned: "Read two case studies in one visit." },
  { key: "back", name: "Back again", earned: "Came back on another day." },
];

export const STAMP_INK: Record<StampKey, string> = {
  ring: "#9D136A",
  screen: "#c5444a",
  desk: "#32073e",
  two: "#0E9A49",
  back: "#524555",
};
const SEED: Record<StampKey, number> = { ring: 3, screen: 11, desk: 13, two: 17, back: 23 };
const SERIF = "GT Alpina Trial, Georgia, serif";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function stampDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const PAPER = "#f4ecdb"; // aged cream stock
const POST = "#1e0525"; // postmark ink (midnight)

const f1 = (n: number) => n.toFixed(1);

// ── Shapes ──

type Pt = [number, number];

// A stamp's edge: straight sides bitten by perforation holes, round any polygon
function perforated(pts: Pt[], step = 10, r = 2.8) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  pts.forEach(([ax, ay], i) => {
    const [bx, by] = pts[(i + 1) % pts.length];
    const len = Math.hypot(bx - ax, by - ay), n = Math.round(len / step);
    const ux = (bx - ax) / len, uy = (by - ay) / len;
    for (let k = 0; k < n; k++) {
      const m = (k + 0.5) * (len / n);
      d += ` L${f1(ax + ux * (m - r))} ${f1(ay + uy * (m - r))}` +
        ` A${r} ${r} 0 0 0 ${f1(ax + ux * (m + r))} ${f1(ay + uy * (m + r))}`;
    }
    d += ` L${bx} ${by}`;
  });
  return d + " Z";
}

const PORTRAIT: Pt[] = [[36, 16], [164, 16], [164, 184], [36, 184]];
const LANDSCAPE: Pt[] = [[14, 40], [186, 40], [186, 160], [14, 160]];
const TRIANGLE: Pt[] = [[100, 10], [190, 172], [10, 172]];
const SHAPE: Record<StampKey, Pt[]> = { ring: PORTRAIT, screen: LANDSCAPE, desk: PORTRAIT, two: PORTRAIT, back: TRIANGLE };

// ── Printing helpers (single ink `c`, paper `P` for reversed-out parts) ──

const P = PAPER;
const txt = (x: number, y: number, s: string, fill: string, size: number, ls = 1, len?: number) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="${size}" font-weight="600" letter-spacing="${ls}" fill="${fill}"` +
  (len ? ` textLength="${len}" lengthAdjust="spacingAndGlyphs"` : "") + `>${s}</text>`;
// Engraving: line patterns that build tone the way old intaglio stamps do
const hatches = (id: string, c: string) =>
  `<pattern id="${id}h1" patternUnits="userSpaceOnUse" width="3.2" height="3.2"><rect width="3.2" height="0.7" fill="${c}"/></pattern>` +
  `<pattern id="${id}h2" patternUnits="userSpaceOnUse" width="2.4" height="2.4" patternTransform="rotate(45)"><rect width="2.4" height="1.1" fill="${c}"/></pattern>` +
  `<pattern id="${id}h3" patternUnits="userSpaceOnUse" width="2.2" height="2.2" patternTransform="rotate(-45)"><rect width="2.2" height="1.2" fill="${c}"/></pattern>` +
  `<pattern id="${id}hv" patternUnits="userSpaceOnUse" width="2.6" height="2.6"><rect width="1" height="2.6" fill="${c}"/></pattern>`;
const fillH = (id: string, h: string) => `url(#${id}${h})`;
// Lines fanning out from a point (an engraved sunburst)
const burst = (x: number, y: number, r: number, n: number, c: string, w = 0.6) => {
  let d = "";
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    d += `M${x} ${y}L${f1(x + r * Math.cos(a))} ${f1(y + r * Math.sin(a))}`;
  }
  return `<path d="${d}" stroke="${c}" stroke-width="${w}"/>`;
};
const value = (x: number, y: number, n: string, c: string, r = 6.5) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + txt(x, y + r * 0.5, n, P, r * 1.5, 0);
// Double printed frame round a rectangle
const frame = (x0: number, y0: number, x1: number, y1: number, c: string) =>
  `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="${c}" stroke-width="2"/>` +
  `<rect x="${x0 + 3.5}" y="${y0 + 3.5}" width="${x1 - x0 - 7}" height="${y1 - y0 - 7}" fill="none" stroke="${c}" stroke-width="0.7"/>`;

// The shared layout of the three portrait stamps: banner, picture box, name and values
const portrait = (c: string, name: string, n: string, pic: string, nameLen?: number) =>
  frame(46, 26, 154, 174, c) +
  `<rect x="49.5" y="29.5" width="101" height="15" fill="${c}"/>` +
  txt(100, 40.2, "CURIOSITY POST", P, 7.4, 1.2, 84) +
  pic +
  `<path d="M49.5 143.5 H150.5" stroke="${c}" stroke-width="1"/>` +
  txt(100, 157, name, c, 9.4, 1.1, nameLen) +
  txt(100, 167.5, "THE HOUSE", c, 5.2, 1.4) +
  value(59, 160, n, c) + value(141, 160, n, c);

// Each stamp's printed ink, in a 200 box
const ART: Record<StampKey, (id: string, c: string) => string> = {
  // Bella ringing against an engraved sunburst
  ring: (id, c) =>
    portrait(
      c,
      "FIRST RING",
      "1",
      `<clipPath id="${id}k"><rect x="52" y="48" width="96" height="92"/></clipPath>` +
        `<g clip-path="url(#${id}k)">${burst(100, 118, 90, 56, c, 0.55)}` +
        `<rect x="52" y="124" width="96" height="16" fill="${fillH(id, "h1")}"/></g>` +
        `<rect x="52" y="48" width="96" height="92" fill="none" stroke="${c}" stroke-width="1.2"/>` +
        `<path d="M62 98 Q57 106 62 114 M56 93 Q49 106 56 119 M138 98 Q143 106 138 114 M144 93 Q151 106 144 119" stroke="${c}" stroke-width="1.6" stroke-linecap="round" fill="none"/>` +
        `<path d="M72 122 Q72 82 100 82 Q128 82 128 122 Z" fill="${P}"/>` +
        `<path d="M72 122 Q72 82 100 82 Q128 82 128 122 Z" fill="${fillH(id, "h2")}" stroke="${c}" stroke-width="1.6"/>` +
        `<path d="M80 116 Q79 95 94 88" stroke="${P}" stroke-width="3.2" stroke-linecap="round" fill="none"/>` +
        `<rect x="95" y="74" width="10" height="9" rx="1" fill="${c}"/>` +
        `<rect x="63" y="121" width="74" height="7" rx="1" fill="${c}"/>` +
        `<ellipse cx="91" cy="104" rx="5" ry="6" fill="${P}" stroke="${c}"/><ellipse cx="109" cy="104" rx="5" ry="6" fill="${P}" stroke="${c}"/>` +
        `<circle cx="92" cy="105.5" r="2.4" fill="${c}"/><circle cx="110" cy="105.5" r="2.4" fill="${c}"/>`,
    ),

  // A stage with the curtains drawn back and Bella's eyes in the dark
  screen: (id, c) => {
    const curtain =
      `<path d="M30 70 H72 Q62 90 67 106 Q61 120 65 130 H30 Z" fill="${P}"/>` +
      `<path d="M30 70 H72 Q62 90 67 106 Q61 120 65 130 H30 Z" fill="${fillH(id, "hv")}" stroke="${c}" stroke-width="1.2"/>` +
      `<path d="M40 74 Q42 100 38 130 M50 74 Q53 100 49 130 M60 76 Q57 96 58 118" stroke="${c}" stroke-width="1.3" fill="none"/>` +
      `<rect x="56" y="104" width="12" height="4" rx="1" fill="${c}" transform="rotate(-18 62 106)"/>`;
    return (
      frame(24, 50, 176, 150, c) +
      `<rect x="27.5" y="53.5" width="145" height="13" fill="${c}"/>` +
      txt(100, 62.6, "CURIOSITY POST", P, 7, 1.4) +
      `<rect x="30" y="70" width="140" height="60" fill="${fillH(id, "h2")}"/>` +
      `<rect x="30" y="70" width="140" height="60" fill="${fillH(id, "h3")}"/>` +
      `<ellipse cx="100" cy="125" rx="34" ry="6" fill="${P}"/><ellipse cx="100" cy="125" rx="34" ry="6" fill="${fillH(id, "h1")}"/>` +
      `<ellipse cx="91" cy="100" rx="5" ry="6" fill="${P}"/><ellipse cx="109" cy="100" rx="5" ry="6" fill="${P}"/>` +
      `<circle cx="92" cy="101.5" r="2.4" fill="${c}"/><circle cx="110" cy="101.5" r="2.4" fill="${c}"/>` +
      curtain +
      `<g transform="translate(200 0) scale(-1 1)">${curtain}</g>` +
      `<path d="M30 70 H170 V78 Q163 85 156 78 Q149 85 142 78 Q135 85 128 78 Q121 85 114 78 Q107 85 100 78 Q93 85 86 78 Q79 85 72 78 Q65 85 58 78 Q51 85 44 78 Q37 85 30 78 Z" fill="${c}"/>` +
      `<rect x="30" y="129" width="140" height="3" fill="${c}"/>` +
      `<rect x="30" y="70" width="140" height="62" fill="none" stroke="${c}" stroke-width="1.2"/>` +
      txt(100, 144.6, "SCREENING", c, 9.4, 1.4) +
      value(39, 140.5, "2", c, 5.5) + value(161, 140.5, "2", c, 5.5)
    );
  },

  // A room key fob on its ring, in an arched window
  desk: (id, c) =>
    portrait(
      c,
      "FRONT DESK",
      "3",
      `<path d="M52 140 V84 Q52 48 100 48 Q148 48 148 84 V140 Z" fill="${fillH(id, "h1")}" stroke="${c}" stroke-width="1.2"/>` +
        `<circle cx="100" cy="64" r="7" fill="none" stroke="${c}" stroke-width="2.4"/>` +
        `<path d="M100 72 L130 103 L100 134 L70 103 Z" fill="${P}"/>` +
        `<path d="M100 72 L130 103 L100 134 L70 103 Z" fill="${fillH(id, "h2")}" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<path d="M100 82 L121 103 L100 124 L79 103 Z" fill="${P}" stroke="${c}" stroke-width="0.8"/>` +
        `<circle cx="100" cy="77" r="2.2" fill="${P}" stroke="${c}" stroke-width="0.8"/>` +
        txt(100, 109, "01", c, 16, 0) +
        `<path d="M62 124 l2 -5 l2 5 l-2 5 Z M134 124 l2 -5 l2 5 l-2 5 Z" fill="${c}"/>`,
    ),

  // Two doors, 1 and 2, the second one open with light inside
  two: (id, c) => {
    const arch = (x: number) => `M${x} 134 V90 Q${x} 74 ${x + 17} 74 Q${x + 34} 74 ${x + 34} 90 V134 Z`;
    return portrait(
      c,
      "TWO IN A ROW",
      "4",
      `<rect x="52" y="48" width="96" height="92" fill="${fillH(id, "h1")}" stroke="${c}" stroke-width="1.2"/>` +
        // Door 1, shut, with panels and a knob
        `<path d="${arch(60)}" fill="${c}"/>` +
        `<path d="M65 130 V100 H89 V130 Z M65 95 V90 Q65 80 77 79 Q89 80 89 90 V95 Z" fill="none" stroke="${P}" stroke-width="0.8"/>` +
        `<circle cx="85" cy="112" r="1.8" fill="${P}"/>` +
        // Door 2, open: light inside, the door swung in
        `<path d="${arch(106)}" fill="${P}" stroke="${c}" stroke-width="1.6"/>` +
        `<clipPath id="${id}d"><path d="${arch(106)}"/></clipPath>` +
        `<g clip-path="url(#${id}d)">${burst(124, 134, 60, 40, c, 0.5)}</g>` +
        `<path d="M106 134 V90 Q106 78 112 75 L118 140 Z" fill="${c}"/>` +
        `<circle cx="77" cy="62" r="6" fill="${P}" stroke="${c}"/><circle cx="123" cy="62" r="6" fill="${P}" stroke="${c}"/>` +
        txt(77, 65, "1", c, 8.4, 0) + txt(123, 65, "2", c, 8.4, 0) +
        `<rect x="54" y="134" width="92" height="5" fill="${c}"/>`,
      74,
    );
  },

  // A triangle stamp: the house, with the sun coming up behind it
  back: (id, c) =>
    `<path d="M100 30.6 L173 162 L27 162 Z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M100 37.8 L167 158.5 L33 158.5 Z" fill="none" stroke="${c}" stroke-width="0.7" stroke-linejoin="round"/>` +
    `<clipPath id="${id}k"><path d="M100 37.8 L167 158.5 L33 158.5 Z"/></clipPath>` +
    `<g clip-path="url(#${id}k)">${burst(100, 124, 90, 60, c, 0.55)}` +
    `<rect x="20" y="126" width="160" height="16" fill="${P}"/><rect x="20" y="126" width="160" height="16" fill="${fillH(id, "h1")}"/>` +
    `</g>` +
    `<rect x="108" y="90" width="7" height="12" fill="${c}"/>` +
    `<rect x="80" y="106" width="40" height="32" fill="${P}"/>` +
    `<rect x="80" y="106" width="40" height="32" fill="${fillH(id, "h1")}" stroke="${c}" stroke-width="1.2"/>` +
    `<path d="M73 108 L100 86 L127 108 Z" fill="${c}"/>` +
    `<path d="M93 138 V124 Q93 117 100 117 Q107 117 107 124 V138 Z" fill="${c}"/>` +
    `<circle cx="87" cy="118" r="3.4" fill="${c}"/><circle cx="113" cy="118" r="3.4" fill="${c}"/>` +
    `<path d="M42.7 141 L157.3 141 L165.1 155 L34.9 155 Z" fill="${c}"/>` +
    txt(100, 151.6, "BACK AGAIN", P, 8.4, 1.2, 72) +
    txt(100, 60, "5", c, 11, 0),
};

// A postmark: a double ring with the post office and the date, and wavy cancel lines
const POSTMARK: Record<StampKey, { x: number; y: number; r: number; dir: 1 | -1 }> = {
  ring: { x: 134, y: 66, r: -12, dir: -1 },
  screen: { x: 146, y: 112, r: 9, dir: -1 },
  desk: { x: 132, y: 134, r: -7, dir: -1 },
  two: { x: 136, y: 118, r: 11, dir: -1 },
  back: { x: 120, y: 132, r: -16, dir: -1 },
};
function postmark(id: string, key: StampKey, date: string) {
  const { x, y, r, dir } = POSTMARK[key];
  let waves = "";
  for (const wy of [-10, -3.4, 3.4, 10]) {
    const x0 = 27 * dir;
    waves += `M${x0} ${wy} q${8 * dir} -3 ${16 * dir} 0 t${16 * dir} 0 t${16 * dir} 0 t${16 * dir} 0 t${16 * dir} 0`;
  }
  return (
    `<g transform="translate(${x} ${y}) rotate(${r})" fill="none" stroke="${POST}">` +
    `<circle r="24" stroke-width="1.7"/><circle r="15.5" stroke-width="1"/>` +
    `<path d="${waves}" stroke-width="1.5"/>` +
    `<path id="${id}pt" d="M-17.8 0 A17.8 17.8 0 0 1 17.8 0"/><path id="${id}pb" d="M-21.6 0 A21.6 21.6 0 0 0 21.6 0"/>` +
    `<g stroke="none" fill="${POST}" font-family="${SERIF}" font-weight="700" font-size="5.2" letter-spacing="0.8">` +
    `<text><textPath href="#${id}pt" startOffset="50%" text-anchor="middle">CURIOSITY POST</textPath></text>` +
    `<text><textPath href="#${id}pb" startOffset="50%" text-anchor="middle">THE HOUSE</textPath></text>` +
    (date
      ? `<text x="0" y="2" text-anchor="middle" font-size="5" letter-spacing="0.2">${date}</text>`
      : `<path d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z"/>`) +
    `</g></g>`
  );
}

// A few faint foxing spots, where old paper has browned
const FOX: Record<StampKey, Pt[]> = {
  ring: [[150, 30], [52, 176]],
  screen: [[30, 146], [172, 56]],
  desk: [[52, 34], [150, 172]],
  two: [[150, 150], [46, 40]],
  back: [[60, 160], [140, 150]],
};

/** One stamp as an SVG string. `id` must be unique on the page. */
export function stampSvg(
  key: StampKey,
  { id, date = "", rotate = 0, label, ink }: { id: string; date?: string; rotate?: number; label?: string; ink?: string },
) {
  const ghost = ink === "none";
  const c = ghost || !ink ? STAMP_INK[key] : ink;
  const name = STAMPS.find((s) => s.key === key)?.name ?? key;
  const outline = perforated(SHAPE[key]);
  const seed = SEED[key];
  return (
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label ?? `Stamp: ${name}`}">` +
    `<defs>${hatches(id, c)}` +
    `<path id="${id}s" d="${outline}" fill="#000"/><path id="${id}W" d="${outline}" fill="#fff"/>` +
    `<clipPath id="${id}c"><path d="${outline}"/></clipPath>` +
    // Torn perforations and a hand-fed sheet: edges a touch uneven
    `<filter id="${id}w" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="${seed}"/>` +
    `<feDisplacementMap in="SourceGraphic" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    // Paper fibres
    `<filter id="${id}n" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.55 0.9" numOctaves="3" seed="${seed}"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.16  0.5 0 0 0 -0.16"/>` +
    `<feComposite in2="SourceAlpha" operator="in"/></filter>` +
    // Toning: the paper browner towards its edges
    `<radialGradient id="${id}t" cx="45%" cy="40%" r="75%"><stop offset="0.55" stop-color="#b8975a" stop-opacity="0"/><stop offset="1" stop-color="#a5824a" stop-opacity="0.32"/></radialGradient>` +
    // Worn print: a fine grain knocks specks out of the ink
    `<filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="${seed}" result="b"/>` +
    `<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.7" result="m"/>` +
    `<feComposite in="SourceGraphic" in2="m" operator="in"/></filter>` +
    // The postmark: a patchy, slightly spread hand-stamp
    `<filter id="${id}q" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feGaussianBlur stdDeviation="0.25" result="s"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="3" seed="${seed + 5}" result="b"/>` +
    `<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.05" result="m"/>` +
    `<feComposite in="s" in2="m" operator="in"/></filter>` +
    `<filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1"/></filter>` +
    // Not found yet: an empty slot pressed into the card, the stamp's shape sunk in with a
    // dotted edge round it, and the design only as a faint impression inside
    `<filter id="${id}g"><feColorMatrix type="matrix" values="0.2 0.5 0.1 0 0.62  0.2 0.5 0.1 0 0.56  0.2 0.5 0.1 0 0.5  0 0 0 1 0"/></filter>` +
    `<pattern id="${id}p" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#fff"/><rect x="3" y="3" width="3" height="3" fill="#fff"/></pattern>` +
    `<mask id="${id}m" maskUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240"><rect x="-20" y="-20" width="240" height="240" fill="url(#${id}p)"/></mask>` +
    `<filter id="${id}o" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="4" result="w"/>` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="n"/><feComposite in="w" in2="n" operator="out" result="r"/>` +
    `<feFlood flood-color="#f8f1e3"/><feComposite in2="r" operator="in"/></filter></defs>` +
    `<g transform="rotate(${rotate} 100 100)">` +
    (ghost
      ? `<use href="#${id}s" opacity="0.3"/>` +
        // A shadow along the top-left inside edge, as in a hollow
        `<mask id="${id}h" maskUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240"><use href="#${id}W"/><use href="#${id}s" transform="translate(2.4 3)"/></mask>` +
        `<rect x="-20" y="-20" width="240" height="240" fill="#000" opacity="0.4" mask="url(#${id}h)"/>` +
        `<g filter="url(#${id}g)" opacity="0.08">${ART[key](id, c)}</g>` +
        `<g mask="url(#${id}m)" opacity="0.32"><use href="#${id}s" filter="url(#${id}o)"/></g>`
      : // A stamp stuck down: a whisper of shadow, the paper, the ink, then the postmark
        `<use href="#${id}s" transform="translate(0.8 1.6)" opacity="0.26" filter="url(#${id}b)"/>` +
        `<g filter="url(#${id}w)">` +
        `<path d="${outline}" fill="${PAPER}"/>` +
        `<path d="${outline}" fill="#000" filter="url(#${id}n)"/>` +
        `<path d="${outline}" fill="url(#${id}t)"/>` +
        FOX[key].map(([fx, fy]) => `<circle cx="${fx}" cy="${fy}" r="2.2" fill="#9a6b2c" opacity="0.14"/>`).join("") +
        `<g filter="url(#${id}f)" opacity="0.86">${ART[key](id, c)}</g>` +
        `<g clip-path="url(#${id}c)" filter="url(#${id}q)" opacity="0.72">${postmark(id, key, date)}</g>` +
        `</g>`) +
    `</g></svg>`
  );
}
