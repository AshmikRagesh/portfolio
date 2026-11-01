// ── Stamps ────────────────────────────────────────────────────────────────────
// Five rubber stamps a visitor can collect, each for finding something. Drawn like
// passport stamps: every one has its own outline (a ring, a ticket, an oval, an
// octagon, a postmark), its own ink, lettering set around or across it, the date
// it was earned, and a small illustration in the middle.
//
// The ink is printed, not drawn: a displacement roughens every edge and a blotchy
// mask thins the ink in places, as if pressed by hand. Highlights inside the
// drawings are knocked out of the ink with a mask, so the paper shows through.
//
// Returns an SVG string so the same art works in React (dangerouslySetInnerHTML,
// static markup only) and anywhere else.

export type StampKey = "ring" | "screen" | "desk" | "two" | "back";

export const STAMPS: { key: StampKey; name: string; earned: string }[] = [
  { key: "ring", name: "First ring", earned: "Rang Bella for the first time." },
  { key: "screen", name: "Screening", earned: "Watched a walkthrough video." },
  { key: "desk", name: "Front desk", earned: "Copied Ashmik's email." },
  { key: "two", name: "Two in a row", earned: "Read two case studies in one visit." },
  { key: "back", name: "Back again", earned: "Came back on another day." },
];

// Inks from the palette, a little deeper than on screen, as stamp ink dries
const INK: Record<StampKey, string> = {
  ring: "#9d136a",
  screen: "#3e0d4b",
  desk: "#9d136a",
  two: "#a8761e",
  back: "#3e0d4b",
};
const SEED: Record<StampKey, number> = { ring: 3, screen: 11, desk: 13, two: 17, back: 23 };
const MONO = "Geist Mono, ui-monospace, monospace";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function stampDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const STAR = "M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z";
const star = (x: number, y: number, s = 1) => `<path d="${STAR}" transform="translate(${x} ${y}) scale(${s})"/>`;

function text(x: number, y: number, s: string, size: number, spacing = 2) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${MONO}" font-size="${size}" font-weight="600" letter-spacing="${spacing}" stroke="none">${s}</text>`;
}
function onPath(id: string, s: string, size: number, spacing = 2) {
  return `<text font-family="${MONO}" font-size="${size}" font-weight="600" letter-spacing="${spacing}" stroke="none"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${s}</textPath></text>`;
}

// Bella in miniature: dome, plunger, base, with her eyes and a highlight knocked out
function bell(id: string, cx: number, cy: number, w: number) {
  const k = w / 52;
  const t = (x: number, y: number) => `${(cx + (x - 26) * k).toFixed(1)} ${(cy + (y - 30) * k).toFixed(1)}`;
  return (
    `<mask id="${id}k" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="160" height="160" fill="#fff"/>` +
    `<ellipse cx="${t(19, 26).split(" ")[0]}" cy="${t(19, 26).split(" ")[1]}" rx="${3.6 * k}" ry="${4.6 * k}" fill="#000"/>` +
    `<ellipse cx="${t(33, 26).split(" ")[0]}" cy="${t(33, 26).split(" ")[1]}" rx="${3.6 * k}" ry="${4.6 * k}" fill="#000"/>` +
    `<path d="M${t(8, 34)} Q${t(7, 20)} ${t(15, 14)}" stroke="#000" stroke-width="${2.4 * k}" fill="none" stroke-linecap="round"/></mask>` +
    `<g mask="url(#${id}k)" stroke="none">` +
    `<path d="M${t(2, 40)} Q${t(2, 10)} ${t(26, 10)} Q${t(50, 10)} ${t(50, 40)} Z"/>` +
    `<rect x="${t(22, 2).split(" ")[0]}" y="${t(22, 2).split(" ")[1]}" width="${8 * k}" height="${9 * k}" rx="${2 * k}"/>` +
    `<rect x="${t(-3, 40).split(" ")[0]}" y="${t(-3, 40).split(" ")[1]}" width="${58 * k}" height="${7 * k}" rx="${3.5 * k}"/></g>`
  );
}

const ART: Record<StampKey, (id: string, date: string) => string> = {
  // A ring: Bella ringing, sound lines either side, lettering round the top and bottom
  ring: (id, date) =>
    `<path id="${id}t" d="M26 80 A54 54 0 0 1 134 80" fill="none"/><path id="${id}b" d="M22 80 A58 58 0 0 0 138 80" fill="none"/>` +
    `<circle cx="80" cy="80" r="72" stroke-width="4" fill="none"/><circle cx="80" cy="80" r="65" stroke-width="1.4" fill="none"/>` +
    `<circle cx="80" cy="80" r="44" stroke-width="1.2" fill="none" stroke-dasharray="0.1 4" stroke-linecap="round"/>` +
    onPath(`${id}t`, "FIRST RING", 12, 3) + onPath(`${id}b`, date, 9, 2) +
    `<g stroke="none">${star(15, 80, 1)}${star(145, 80, 1)}</g>` +
    bell(id, 80, 84, 46) +
    `<g stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M50 70 Q44 62 47 53"/><path d="M42 74 Q34 63 38 50"/><path d="M110 70 Q116 62 113 53"/><path d="M118 74 Q126 63 122 50"/></g>`,

  // A cinema ticket: notched corners, a film frame with sprocket holes and a play mark
  screen: (id, date) => {
    const notch = (inset: number, r: number) => {
      const a = 14 + inset, b = 146 - inset, c = 30 + inset, d = 130 - inset;
      return `M${a + r} ${c} H${b - r} A${r} ${r} 0 0 0 ${b} ${c + r} V${d - r} A${r} ${r} 0 0 0 ${b - r} ${d} H${a + r} A${r} ${r} 0 0 0 ${a} ${d - r} V${c + r} A${r} ${r} 0 0 0 ${a + r} ${c} Z`;
    };
    let holes = "";
    for (let x = 44; x <= 112; x += 10) holes += `<rect x="${x}" y="61" width="5" height="4" rx="1"/><rect x="${x}" y="103" width="5" height="4" rx="1"/>`;
    return (
      `<path d="${notch(0, 12)}" stroke-width="4" fill="none"/><path d="${notch(6, 8)}" stroke-width="1.4" fill="none"/>` +
      text(80, 52, "SCREENING", 12, 3) + text(80, 41, "ADMIT ONE", 6, 2) +
      `<g stroke="none">${holes}</g>` +
      `<rect x="42" y="68" width="76" height="32" rx="3" stroke-width="2.6" fill="none"/>` +
      `<path d="M74 75 L90 84 L74 93 Z" stroke="none"/>` +
      `<g stroke="none">${star(30, 84, 0.8)}${star(130, 84, 0.8)}</g>` +
      text(80, 121, date, 8, 2)
    );
  },

  // An oval: an envelope sealed with a wax seal stamped with Bella
  desk: (id, date) =>
    `<path id="${id}t" d="M30 80 A50 34 0 0 1 130 80" fill="none"/><path id="${id}b" d="M27 80 A53 37 0 0 0 133 80" fill="none"/>` +
    `<ellipse cx="80" cy="80" rx="72" ry="54" stroke-width="4" fill="none"/><ellipse cx="80" cy="80" rx="65" ry="47" stroke-width="1.4" fill="none"/>` +
    onPath(`${id}t`, "FRONT DESK", 11, 3) + onPath(`${id}b`, date, 8, 2) +
    `<rect x="54" y="64" width="52" height="34" rx="3" stroke-width="2.6" fill="none"/>` +
    `<path d="M55 66 L80 85 L105 66" stroke-width="2.2" fill="none" stroke-linejoin="round"/>` +
    `<circle cx="80" cy="86" r="9" stroke="none"/>` +
    `<mask id="${id}w" maskUnits="userSpaceOnUse"><rect width="160" height="160" fill="#fff"/><path d="M75 90 Q75 81 80 81 Q85 81 85 90 Z M73.5 90 h13 v2 h-13 Z" fill="#000"/></mask>` +
    `<circle cx="80" cy="86" r="9" stroke="none" mask="url(#${id}w)"/>` +
    `<g stroke="none">${star(16, 80, 0.8)}${star(144, 80, 0.8)}</g>`,

  // An octagon: two room keys crossed, numbered 1 and 2
  two: (id, date) => {
    const oct = (r: number) =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i + Math.PI / 8;
        return `${(80 + r * Math.cos(a)).toFixed(1)} ${(80 + r * Math.sin(a)).toFixed(1)}`;
      }).join(" L");
    const key = (rot: number, n: string) =>
      `<g transform="translate(80 86) rotate(${rot})"><circle cx="0" cy="-24" r="9" stroke-width="2.6" fill="none"/><circle cx="0" cy="-24" r="3" stroke="none"/>` +
      `<path d="M0 -15 V24 M0 14 H8 M0 20 H6" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
      `<text x="0" y="-33" text-anchor="middle" font-family="${MONO}" font-size="9" font-weight="700" stroke="none" transform="rotate(${-rot} 0 -36)">${n}</text></g>`;
    return (
      `<path d="M${oct(74)} Z" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M${oct(66)} Z" stroke-width="1.4" fill="none" stroke-linejoin="round"/>` +
      text(80, 46, "TWO IN A ROW", 10, 1.4) + key(-30, "1") + key(30, "2") +
      `<g stroke="none">${star(36, 86, 0.8)}${star(124, 86, 0.8)}</g>` +
      text(80, 128, date, 8, 2)
    );
  },

  // A postmark: a cancellation ring with wavy lines, a guesthouse door and a return arrow
  back: (id, date) => {
    let teeth = "";
    for (let i = 0; i < 48; i++) {
      const a = (Math.PI * 2 * i) / 48, r = i % 2 ? 58 : 54;
      teeth += `${i ? "L" : "M"}${(66 + r * Math.cos(a)).toFixed(1)} ${(80 + r * Math.sin(a)).toFixed(1)} `;
    }
    return (
      `<path id="${id}t" d="M30 80 A36 36 0 0 1 102 80" fill="none"/><path id="${id}b" d="M27 80 A39 39 0 0 0 105 80" fill="none"/>` +
      `<path d="${teeth}Z" stroke-width="2.4" fill="none" stroke-linejoin="round"/><circle cx="66" cy="80" r="47" stroke-width="1.4" fill="none"/>` +
      onPath(`${id}t`, "BACK AGAIN", 9, 2) + onPath(`${id}b`, date, 7, 1.4) +
      `<path d="M54 98 V80 Q66 66 78 80 V98 Z" stroke-width="2.6" fill="none" stroke-linejoin="round"/><circle cx="72" cy="88" r="1.8" stroke="none"/>` +
      `<path d="M48 76 A20 20 0 0 1 82 68" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M82 68 l-1 -7 M82 68 l-7 1" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
      `<g stroke-width="2.4" fill="none" stroke-linecap="round">` +
      [62, 72, 82, 92, 102].map((y) => `<path d="M118 ${y} q5 -4 10 0 t10 0 t10 0 t10 0"/>`).join("") +
      `</g>`
    );
  },
};

/** One stamp as an SVG string. `id` must be unique on the page. */
export function stampSvg(key: StampKey, { id, date = "", rotate = 0, label }: { id: string; date?: string; rotate?: number; label?: string }) {
  const ink = INK[key];
  const seed = SEED[key];
  const name = STAMPS.find((s) => s.key === key)?.name ?? key;
  return (
    `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label ?? `Stamp: ${name}`}">` +
    `<defs><filter id="${id}f" x="-8%" y="-8%" width="116%" height="116%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.28" numOctaves="3" seed="${seed + 7}" result="b"/>` +
    `<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.25" result="m"/>` +
    `<feComposite in="d" in2="m" operator="in"/></filter></defs>` +
    `<g filter="url(#${id}f)" transform="rotate(${rotate} 80 80)" fill="${ink}" stroke="${ink}" opacity="0.92">` +
    `${ART[key](id, date)}</g></svg>`
  );
}
