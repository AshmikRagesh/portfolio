// ── Stamps ────────────────────────────────────────────────────────────────────
// Five stamps a visitor can collect, each for finding something. Each one is a paper
// thing from the guesthouse, inked like a rubber stamp: line work with a little wobble
// and uneven ink, pressed into the paper (a light edge up-left, a shadow down-right).
//   First ring    pink, a perforated postage stamp, value 1: a finger pressing Bella
//   Screening     gold, an ADMIT ONE ticket with a torn-off stub: a film strip, Bella
//                 in the middle frame
//   Front desk    lavender, a room key fob on its ring: FRONT DESK, room 01
//   Two in a row  mint, a luggage tag on a string: two doors, 1 and 2
//   Back again    coral, a postmark from The House, with the wavy cancel lines
// `ink: "none"` draws it in faint ivory with no colour, for a stamp not found yet.
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
const SERIF = "GT Alpina Trial, Georgia, serif";
const MONO = "Geist Mono, ui-monospace, monospace";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function stampDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const mono = (x: number, y: number, s: string, size = 9, spacing = 1.6) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${MONO}" font-size="${size}" font-weight="600" letter-spacing="${spacing}" fill="currentColor" stroke="none">${s}</text>`;
const serif = (x: number, y: number, s: string, size: number) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="${size}" font-weight="500" fill="currentColor" stroke="none">${s}</text>`;
const onArc = (id: string, d: string, s: string, size: number) =>
  `<path id="${id}" d="${d}" fill="none" stroke="none"/>` +
  `<text font-family="${MONO}" font-size="${size}" font-weight="600" letter-spacing="2" fill="currentColor" stroke="none"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${s}</textPath></text>`;

// A postage stamp's edge: straight sides bitten by perforation holes
function perforated(x0: number, y0: number, x1: number, y1: number, step = 12, r = 3.6) {
  const side = (ax: number, ay: number, bx: number, by: number) => {
    const len = Math.hypot(bx - ax, by - ay), n = Math.round(len / step);
    const ux = (bx - ax) / len, uy = (by - ay) / len;
    let d = "";
    for (let i = 0; i < n; i++) {
      const c = (i + 0.5) * (len / n);
      d += ` L${(ax + ux * (c - r)).toFixed(1)} ${(ay + uy * (c - r)).toFixed(1)}` +
        ` A${r} ${r} 0 0 0 ${(ax + ux * (c + r)).toFixed(1)} ${(ay + uy * (c + r)).toFixed(1)}`;
    }
    return d + ` L${bx} ${by}`;
  };
  return `M${x0} ${y0}` + side(x0, y0, x1, y0) + side(x1, y0, x1, y1) + side(x1, y1, x0, y1) + side(x0, y1, x0, y0) + " Z";
}

// Each scene is drawn in currentColor, in a 200 box
const ART: Record<StampKey, (id: string, date: string) => string> = {
  ring: (id, date) => {
    let hatch = "";
    for (let x = 108; x <= 140; x += 6) hatch += `<path d="M${x} 82 L${x - 14} 130"/>`;
    return (
      `<path d="${perforated(34, 20, 166, 180)}" stroke-width="3.2" stroke-linejoin="round"/>` +
      `<rect x="48" y="34" width="104" height="132" stroke-width="2"/>` +
      // The value, as on a postage stamp
      serif(62, 58, "1", 22) +
      `<clipPath id="${id}k"><rect x="48" y="34" width="104" height="132"/></clipPath>` +
      `<clipPath id="${id}d"><path d="M66 128 Q66 84 100 84 Q134 84 134 128 Z"/></clipPath>` +
      `<g clip-path="url(#${id}k)">` +
      // Bella: dome with shading on the right, eyes, button, base plate
      `<path d="M66 128 Q66 84 100 84 Q134 84 134 128" stroke-width="3.4" stroke-linecap="round"/>` +
      `<g clip-path="url(#${id}d)" stroke-width="1.6">${hatch}</g>` +
      `<ellipse cx="89" cy="110" rx="5" ry="6.5" stroke-width="2.4"/><ellipse cx="111" cy="110" rx="5" ry="6.5" stroke-width="2.4"/>` +
      `<circle cx="90" cy="111.5" r="2.4" fill="currentColor" stroke="none"/><circle cx="112" cy="111.5" r="2.4" fill="currentColor" stroke="none"/>` +
      `<path d="M95 84 V76 H105 V84" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<path d="M58 128 H142 V136 H58 Z" stroke-width="2.8" stroke-linejoin="round"/>` +
      // A finger coming in from the corner, pressing the button
      `<g transform="rotate(40 122 46)"><path d="M112 79 V22 M132 79 V22 M112 79 A10 10 0 0 0 132 79" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M116 74 Q122 80 128 74" stroke-width="1.8" stroke-linecap="round"/><path d="M114 50 Q122 53 130 50" stroke-width="1.4" stroke-linecap="round"/></g>` +
      // It rings
      `<path d="M58 92 Q52 104 58 116 M50 86 Q42 104 50 122" stroke-width="2.2" stroke-linecap="round"/>` +
      `</g>` +
      mono(100, 152, "FIRST RING", 9, 2) +
      mono(100, 161, date, 6, 1)
    );
  },

  screen: (id, date) => {
    let sprockets = "";
    for (let x = 34; x <= 122; x += 11) sprockets += `<rect x="${x}" y="80" width="5" height="4" rx="1"/><rect x="${x}" y="116" width="5" height="4" rx="1"/>`;
    return (
      `<g transform="rotate(-6 100 100)">` +
      // The ticket: notched at both ends, a stub torn along the dashes
      `<path d="M18 48 H182 V90 A10 10 0 0 0 182 110 V152 H18 V110 A10 10 0 0 0 18 90 Z" stroke-width="4" stroke-linejoin="round"/>` +
      `<path d="M140 52 V148" stroke-width="2" stroke-dasharray="4 4"/>` +
      mono(79, 70, "ADMIT ONE", 9, 2.4) +
      // A strip of film, Bella looking out of the middle frame
      `<path d="M28 76 H132 M28 124 H132" stroke-width="2.4"/>` +
      `<g stroke-width="1.4">${sprockets}</g>` +
      `<rect x="31" y="88" width="28" height="24" stroke-width="2"/><rect x="65" y="88" width="28" height="24" stroke-width="2.6"/><rect x="99" y="88" width="28" height="24" stroke-width="2"/>` +
      `<path d="M37 106 L45 96 L51 102 L54 99 L57 106" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<circle cx="74" cy="100" r="3.2" fill="currentColor" stroke="none"/><circle cx="84" cy="100" r="3.2" fill="currentColor" stroke="none"/>` +
      `<path d="M105 106 h16 M105 100 h12 M105 94 h16" stroke-width="1.6"/>` +
      serif(79, 142, "Screening", 15) +
      // The stub
      `<g transform="rotate(-90 161 100)">${mono(161, 98, "SCREENING", 7, 1.6)}${mono(161, 108, date, 6, 1)}</g>` +
      `</g>`
    );
  },

  desk: (id, date) => (
    // A room key fob: a rounded diamond on a ring, the room number stamped in
    `<g transform="rotate(4 100 100)">` +
    `<circle cx="100" cy="22" r="13" stroke-width="3"/>` +
    `<path d="M100 14 Q104 14 156 96 Q160 100 156 104 L104 182 Q100 188 96 182 L44 104 Q40 100 44 96 L96 18 Q100 14 100 14 Z" stroke-width="4.4" stroke-linejoin="round"/>` +
    `<path d="M100 32 L144 100 L100 168 L56 100 Z" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<circle cx="100" cy="42" r="5.5" stroke-width="2.6"/>` +
    mono(100, 78, "FRONT", 8, 2) +
    mono(100, 89, "DESK", 8, 2) +
    mono(100, 103, date, 6, 0.6) +
    `<path d="M74 110 H126" stroke-width="1.4"/>` +
    serif(100, 140, "01", 28) +
    `</g>`
  ),

  two: (id, date) => {
    const door = (x: number, n: string, ajar = false) =>
      `<path d="M${x} 132 V90 Q${x} 74 ${x + 19} 74 Q${x + 38} 74 ${x + 38} 90 V132" stroke-width="2.8"/>` +
      (ajar
        ? `<path d="M${x + 6} 132 V92 Q${x + 6} 82 ${x + 19} 80 L${x + 26} 82 V136 Z" fill="currentColor" stroke="none"/>`
        : `<path d="M${x + 7} 90 Q${x + 7} 82 ${x + 19} 82 Q${x + 31} 82 ${x + 31} 90 V102 H${x + 7} Z M${x + 7} 108 H${x + 31} V126 H${x + 7} Z" stroke-width="1.4"/>`) +
      `<circle cx="${x + 31}" cy="${ajar ? 110 : 114}" r="2.2" fill="currentColor" stroke="none"/>` +
      serif(x + 19, 68, n, 14);
    return (
      `<g transform="rotate(3 100 100)">` +
      // A luggage tag: chamfered top, a grommet, the string going off the edge
      `<path d="M58 30 H142 L166 54 V174 H34 V54 Z" stroke-width="4.4" stroke-linejoin="round"/>` +
      `<circle cx="100" cy="46" r="7" stroke-width="2.6"/><circle cx="100" cy="46" r="2.5" fill="currentColor" stroke="none"/>` +
      `<path d="M100 39 C94 24 112 16 106 0" stroke-width="2.2" stroke-linecap="round"/>` +
      door(54, "1") + door(108, "2", true) +
      `<path d="M44 132 H156" stroke-width="2.4"/>` +
      mono(100, 152, "TWO IN A ROW", 8.5, 1.6) +
      mono(100, 164, date, 6, 1) +
      `</g>`
    );
  },

  back: (id, date) => {
    let waves = "";
    for (const y of [70, 86, 102, 118, 134]) waves += `<path d="M152 ${y} q5 -6 10 0 t10 0 t10 0 t10 0"/>`;
    return (
      `<g transform="rotate(-8 100 100)">` +
      // A postmark from The House: town round the rim, the date across a band
      `<circle cx="84" cy="102" r="62" stroke-width="4"/>` +
      `<circle cx="84" cy="102" r="54" stroke-width="1.6"/>` +
      onArc(`${id}t`, "M42 102 A42 42 0 0 1 126 102", "BACK AGAIN", 10) +
      onArc(`${id}b`, "M36 102 A48 48 0 0 0 132 102", "THE HOUSE", 9) +
      `<path d="M37 92 H131 M37 112 H131" stroke-width="2"/>` +
      mono(84, 106, date, 8.5, 1) +
      `<g stroke-width="2.6" stroke-linecap="round">${waves}</g>` +
      `</g>`
    );
  },
};

/** One stamp as an SVG string. `id` must be unique on the page. */
export function stampSvg(
  key: StampKey,
  { id, date = "", rotate = 0, label, ink }: { id: string; date?: string; rotate?: number; label?: string; ink?: string },
) {
  const colour = ink ?? STAMP_INK[key];
  const ghost = colour === "none";
  const name = STAMPS.find((s) => s.key === key)?.name ?? key;
  // The art as a symbol, used three times: light edge, shadow, then the ink
  return (
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label ?? `Stamp: ${name}`}">` +
    `<defs><filter id="${id}w" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${SEED[key]}"/>` +
    `<feDisplacementMap in="SourceGraphic" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `<g id="${id}a" fill="none" stroke="currentColor" filter="url(#${id}w)">${ART[key](id, date)}</g>` +
    `<filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="${SEED[key]}" result="b"/>` +
    `<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.75" result="m"/>` +
    `<feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs>` +
    `<g transform="rotate(${rotate} 100 100)">` +
    `<use href="#${id}a" transform="translate(-1.2 -1.2)" style="color:#fff" opacity="${ghost ? 0.12 : 0.22}"/>` +
    `<use href="#${id}a" transform="translate(1.6 1.8)" style="color:#000" opacity="${ghost ? 0.3 : 0.4}"/>` +
    // Not found yet: the same art in faint ivory, so it reads as a blank to collect
    (ghost ? `<use href="#${id}a" style="color:#f8f1e3" opacity="0.3"/>` : `<use href="#${id}a" style="color:${colour}" filter="url(#${id}f)"/>`) +
    `</g></svg>`
  );
}
