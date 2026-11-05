// ── Stamps ────────────────────────────────────────────────────────────────────
// Five stamps a visitor can collect, each for finding something. Each one is a paper
// thing from the guesthouse, printed like an old label: its own colour, cream and a deep
// plum, with ribbons, sunbursts and stars, a worn grain and slightly uneven edges.
//   First ring    pink, a perforated postage stamp, value 1: Bella ringing on a sunburst
//   Screening     gold, an ADMIT ONE ticket with a stub: a stage, curtains drawn back,
//                 Bella's eyes looking out
//   Front desk    lavender, a room key fob on its ring: FRONT DESK, room 01
//   Two in a row  mint, a luggage tag on a string: two doors, 1 and 2, the second open
//   Back again    coral, a scalloped seal from The House: the front door and a way back
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
  ring: "#ef6fb6",
  screen: "#e9c56c",
  desk: "#b49cf0",
  two: "#5fd0a3",
  back: "#f2876a",
};
const SEED: Record<StampKey, number> = { ring: 3, screen: 11, desk: 13, two: 17, back: 23 };
const SERIF = "PP Kyoto, Georgia, serif";
const MONO = "Geist Mono, ui-monospace, monospace";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function stampDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Every stamp is printed in three inks: its own colour, cream paper and a deep plum
type Inks = { i: string; p: string; d: string };
const PAPER = "#fbf1dc";
const PLUM = "#32073e";

const mono = (x: number, y: number, s: string, fill: string, size = 9, spacing = 1.6) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${MONO}" font-size="${size}" font-weight="700" letter-spacing="${spacing}" fill="${fill}">${s}</text>`;
const serif = (x: number, y: number, s: string, fill: string, size: number) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="${size}" font-weight="500" fill="${fill}">${s}</text>`;
const onArc = (id: string, d: string, s: string, fill: string, size: number) =>
  `<path id="${id}" d="${d}" fill="none"/>` +
  `<text font-family="${MONO}" font-size="${size}" font-weight="700" letter-spacing="2.4" fill="${fill}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${s}</textPath></text>`;
const star = (x: number, y: number, r: number, fill: string) => {
  let d = "";
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r;
    d += `${k ? "L" : "M"}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
};
// Rays fanning out from a point, every other wedge filled
const rays = (x: number, y: number, r: number, n: number, fill: string, opacity = 1) => {
  let d = "";
  for (let k = 0; k < n; k += 2) {
    const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2;
    d += `M${x} ${y}L${(x + r * Math.cos(a0)).toFixed(1)} ${(y + r * Math.sin(a0)).toFixed(1)}L${(x + r * Math.cos(a1)).toFixed(1)} ${(y + r * Math.sin(a1)).toFixed(1)}Z`;
  }
  return `<path d="${d}" fill="${fill}" opacity="${opacity}"/>`;
};
// A ribbon banner with folded-back tails
const ribbon = (cx: number, y: number, w: number, s: string, c: Inks, size = 9) => {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  return (
    `<path d="M${x0 - 14} ${y + 5} H${x0 + 4} V${y + 25} H${x0 - 14} L${x0 - 8} ${y + 15} Z M${x1 + 14} ${y + 5} H${x1 - 4} V${y + 25} H${x1 + 14} L${x1 + 8} ${y + 15} Z" fill="${c.d}" stroke="${c.p}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<rect x="${x0}" y="${y}" width="${w}" height="20" fill="${c.d}" stroke="${c.p}" stroke-width="1.6"/>` +
    mono(cx, y + 13.5, s, c.p, size, 1.8)
  );
};

// A postage stamp's edge: straight sides bitten by perforation holes
function perforated(x0: number, y0: number, x1: number, y1: number, step = 12, r = 3.6) {
  const side = (ax: number, ay: number, bx: number, by: number) => {
    const len = Math.hypot(bx - ax, by - ay), n = Math.round(len / step);
    const ux = (bx - ax) / len, uy = (by - ay) / len;
    let d = "";
    for (let k = 0; k < n; k++) {
      const m = (k + 0.5) * (len / n);
      d += ` L${(ax + ux * (m - r)).toFixed(1)} ${(ay + uy * (m - r)).toFixed(1)}` +
        ` A${r} ${r} 0 0 0 ${(ax + ux * (m + r)).toFixed(1)} ${(ay + uy * (m + r)).toFixed(1)}`;
    }
    return d + ` L${bx} ${by}`;
  };
  return `M${x0} ${y0}` + side(x0, y0, x1, y0) + side(x1, y0, x1, y1) + side(x1, y1, x0, y1) + side(x0, y1, x0, y0) + " Z";
}

// A round badge with a scalloped rim
function scalloped(cx: number, cy: number, r: number, n = 22, bite = 6) {
  let d = "";
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2;
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    const rr = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 2 + bite * 0.2;
    d += `${k ? "" : `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`} A${rr.toFixed(1)} ${rr.toFixed(1)} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
  }
  return d + " Z";
}

// Bella, flat: dome, button, base plate and eyes
const bella = (x: number, y: number, s: number, c: Inks) =>
  `<g transform="translate(${x} ${y}) scale(${s})">` +
  `<path d="M-34 0 Q-34 -44 0 -44 Q34 -44 34 0 Z" fill="${c.d}"/>` +
  `<rect x="-5" y="-53" width="10" height="10" rx="2" fill="${c.d}"/>` +
  `<rect x="-42" y="0" width="84" height="9" rx="2" fill="${c.d}"/>` +
  `<ellipse cx="-11" cy="-20" rx="7" ry="8.5" fill="${c.p}"/><ellipse cx="11" cy="-20" rx="7" ry="8.5" fill="${c.p}"/>` +
  `<circle cx="-9.5" cy="-18.5" r="3.4" fill="${c.d}"/><circle cx="12.5" cy="-18.5" r="3.4" fill="${c.d}"/>` +
  `<path d="M-24 -10 Q-22 -30 -8 -36" stroke="${c.p}" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.35"/>` +
  `</g>`;

// Each stamp, printed in its three inks, in a 200 box
const ART: Record<StampKey, (id: string, date: string, c: Inks) => string> = {
  // A postage stamp, value 1: Bella ringing against a sunburst, a ribbon across the foot
  ring: (id, date, c) =>
    `<path d="${perforated(32, 18, 168, 182)}" fill="${c.p}" stroke="${c.d}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<clipPath id="${id}k"><rect x="44" y="30" width="112" height="140" rx="2"/></clipPath>` +
    `<rect x="44" y="30" width="112" height="140" rx="2" fill="${c.i}"/>` +
    `<g clip-path="url(#${id}k)">${rays(100, 116, 120, 32, c.p, 0.28)}</g>` +
    `<rect x="44" y="30" width="112" height="140" rx="2" fill="none" stroke="${c.d}" stroke-width="3"/>` +
    serif(60, 56, "1", c.d, 24) +
    mono(128, 46, date, c.d, 6, 0.6) +
    `<path d="M56 98 Q50 110 56 122 M48 92 Q40 110 48 128 M144 98 Q150 110 144 122 M152 92 Q160 110 152 128" stroke="${c.d}" stroke-width="3" stroke-linecap="round" fill="none"/>` +
    bella(100, 124, 0.9, c) +
    ribbon(100, 140, 92, "FIRST RING", c),

  // An ADMIT ONE ticket: a little stage with the curtains drawn back, a stub to tear off
  screen: (id, date, c) =>
    `<g transform="rotate(-6 100 100)">` +
    `<path d="M14 46 H186 V88 A12 12 0 0 0 186 112 V154 H14 V112 A12 12 0 0 0 14 88 Z" fill="${c.i}" stroke="${c.d}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M22 54 H178 V94 A6 6 0 0 0 178 106 V146 H22 V106 A6 6 0 0 0 22 94 Z" fill="none" stroke="${c.d}" stroke-width="1.4" stroke-dasharray="3 3"/>` +
    `<rect x="142" y="54" width="36" height="92" fill="${c.d}"/>` +
    `<g transform="rotate(-90 160 100)">${mono(160, 98, "ADMIT ONE", c.p, 7.5, 1.6)}${mono(160, 109, date, c.i, 6, 0.8)}</g>` +
    // The stage
    `<rect x="36" y="62" width="94" height="58" rx="3" fill="${c.p}" stroke="${c.d}" stroke-width="2.4"/>` +
    `<circle cx="74" cy="92" r="5" fill="${c.d}"/><circle cx="92" cy="92" r="5" fill="${c.d}"/>` +
    `<circle cx="75.5" cy="90.5" r="1.6" fill="${c.p}"/><circle cx="93.5" cy="90.5" r="1.6" fill="${c.p}"/>` +
    `<path d="M36 62 H130 V70 Q118 76 106 70 Q94 76 83 70 Q72 76 60 70 Q48 76 36 70 Z" fill="${c.d}"/>` +
    `<path d="M36 70 Q50 70 56 120 H36 Z M130 70 Q116 70 110 120 H130 Z" fill="${c.d}"/>` +
    `<path d="M42 76 Q46 96 44 118 M124 76 Q120 96 122 118" stroke="${c.i}" stroke-width="1.6" fill="none"/>` +
    star(30, 136, 5, c.d) + star(136, 136, 5, c.d) +
    serif(83, 141, "Screening", c.d, 17) +
    `</g>`,

  // A room key fob on its ring: FRONT DESK, room 01
  desk: (id, date, c) =>
    `<g transform="rotate(4 100 100)">` +
    `<circle cx="100" cy="22" r="13" fill="none" stroke="${c.i}" stroke-width="5"/>` +
    `<path d="M100 14 Q104 14 156 96 Q160 100 156 104 L104 182 Q100 188 96 182 L44 104 Q40 100 44 96 L96 18 Q100 14 100 14 Z" fill="${c.i}" stroke="${c.d}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M100 34 L142 100 L100 166 L58 100 Z" fill="${c.p}" stroke="${c.d}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<circle cx="100" cy="42" r="6" fill="${c.p}" stroke="${c.d}" stroke-width="2.4"/>` +
    star(70, 100, 4, c.d) + star(130, 100, 4, c.d) +
    mono(100, 78, "FRONT", c.d, 8.5, 2) +
    mono(100, 90, "DESK", c.d, 8.5, 2) +
    mono(100, 103, date, c.d, 5.5, 0.4) +
    serif(100, 136, "01", c.d, 32) +
    `</g>`,

  // A luggage tag on a string: two doors, 1 and 2, the second one open
  two: (id, date, c) => {
    const door = (x: number, n: string, open = false) =>
      `<path d="M${x} 132 V92 Q${x} 76 ${x + 18} 76 Q${x + 36} 76 ${x + 36} 92 V132 Z" fill="${c.d}"/>` +
      (open
        ? `<path d="M${x + 5} 132 V94 Q${x + 5} 82 ${x + 18} 81 Q${x + 31} 82 ${x + 31} 94 V132 Z" fill="${c.i}"/>` +
          `<path d="M${x + 5} 132 V94 Q${x + 5} 84 ${x + 14} 82 L${x + 16} 136 Z" fill="${c.d}"/>`
        : `<path d="M${x + 6} 128 V96 M${x + 30} 128 V96" stroke="${c.i}" stroke-width="1.4"/><circle cx="${x + 27}" cy="${110}" r="2" fill="${c.p}"/>`) +
      `<circle cx="${x + 18}" cy="66" r="8" fill="${c.d}"/>` +
      mono(x + 18, 69.5, n, c.p, 10, 0);
    return (
      `<g transform="rotate(3 100 100)">` +
      `<path d="M100 40 C92 24 112 14 106 -2" stroke="${c.i}" stroke-width="2.6" stroke-linecap="round" fill="none"/>` +
      `<path d="M58 28 H142 L168 54 V176 H32 V54 Z" fill="${c.i}" stroke="${c.d}" stroke-width="3" stroke-linejoin="round"/>` +
      `<rect x="42" y="54" width="116" height="84" rx="4" fill="${c.p}" stroke="${c.d}" stroke-width="2.4"/>` +
      `<circle cx="100" cy="42" r="7" fill="${c.p}" stroke="${c.d}" stroke-width="2.6"/>` +
      door(56, "1") + door(108, "2", true) +
      `<path d="M42 132 H158" stroke="${c.d}" stroke-width="3"/>` +
      ribbon(100, 144, 96, "TWO IN A ROW", c, 8.5) +
      mono(100, 174, date, c.d, 6, 0.8) +
      `</g>`
    );
  },

  // A scalloped seal from The House: the front door with a way back round to it
  back: (id, date, c) =>
    `<g transform="rotate(-8 100 100)">` +
    `<path d="${scalloped(100, 100, 82)}" fill="${c.i}" stroke="${c.d}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<circle cx="100" cy="100" r="70" fill="${c.d}"/>` +
    onArc(`${id}t`, "M45 100 A55 55 0 0 1 155 100", "BACK AGAIN", c.p, 11) +
    onArc(`${id}b`, "M38 100 A62 62 0 0 0 162 100", "THE HOUSE", c.p, 9) +
    star(36, 100, 5, c.i) + star(164, 100, 5, c.i) +
    `<circle cx="100" cy="100" r="44" fill="${c.p}" stroke="${c.i}" stroke-width="3"/>` +
    `<clipPath id="${id}c"><circle cx="100" cy="100" r="44"/></clipPath>` +
    `<g clip-path="url(#${id}c)">${rays(100, 132, 70, 28, c.i, 0.35)}` +
    `<path d="M74 124 V96 L100 78 L126 96 V124 Z" fill="${c.d}"/>` +
    `<path d="M92 124 V108 Q92 100 100 100 Q108 100 108 108 V124 Z" fill="${c.i}"/>` +
    `<rect x="54" y="124" width="92" height="24" fill="${c.d}"/></g>` +
    `<path d="M118 68 A20 11 0 0 0 82 68" stroke="${c.d}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
    `<path d="M82 68 l1 -7 M82 68 l7 1" stroke="${c.d}" stroke-width="3" stroke-linecap="round"/>` +
    mono(100, 136, date, c.p, 6, 0.6) +
    `</g>`,
};

/** One stamp as an SVG string. `id` must be unique on the page. */
export function stampSvg(
  key: StampKey,
  { id, date = "", rotate = 0, label, ink }: { id: string; date?: string; rotate?: number; label?: string; ink?: string },
) {
  const colour = ink ?? STAMP_INK[key];
  const ghost = colour === "none";
  const name = STAMPS.find((s) => s.key === key)?.name ?? key;
  const inks: Inks = ghost ? { i: STAMP_INK[key], p: PAPER, d: PLUM } : { i: colour, p: PAPER, d: PLUM };
  const solid = (fill: string): Inks => ({ i: fill, p: fill, d: fill });
  // The printed label, and its silhouette for the shadow it casts on the page
  return (
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label ?? `Stamp: ${name}`}">` +
    `<defs><filter id="${id}w" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="${SEED[key]}"/>` +
    `<feDisplacementMap in="SourceGraphic" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `<g id="${id}a" filter="url(#${id}w)">${ART[key](id, date, inks)}</g>` +
    `<g id="${id}s" filter="url(#${id}w)">${ART[key](`${id}s`, date, solid("#000"))}</g>` +
    (ghost ? `<g id="${id}W" filter="url(#${id}w)">${ART[key](`${id}W`, date, solid("#fff"))}</g>` : "") +
    // Worn print: a fine grain knocks specks out of the ink
    `<filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${SEED[key]}" result="b"/>` +
    `<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.75" result="m"/>` +
    `<feComposite in="SourceGraphic" in2="m" operator="in"/></filter>` +
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
        `<use href="#${id}a" filter="url(#${id}g)" opacity="0.07"/>` +
        `<g mask="url(#${id}m)" opacity="0.32"><use href="#${id}s" filter="url(#${id}o)"/></g>`
      : `<use href="#${id}s" transform="translate(1.6 2)" opacity="0.3"/><use href="#${id}a" filter="url(#${id}f)"/>`) +
    `</g></svg>`
  );
}
