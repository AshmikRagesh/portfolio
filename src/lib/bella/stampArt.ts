// ── Stamps ────────────────────────────────────────────────────────────────────
// Five stamps a visitor can collect, each for finding something. Like travel stamps
// pressed into a passport: each has its own shape and colour and a small illustrated
// scene, and each is embossed (a light edge up-left, a shadow down-right) so it sits in
// the paper rather than on it.
//   First ring    pink, a tall rounded badge: Bella engraved in lines, ringing
//   Screening     gold, a tilted ticket: a cinema screen with a play mark and seats
//   Front desk    lavender, an oval: the guesthouse with its windows lit
//   Two in a row  mint, a tilted square: two case studies open side by side
//   Back again    coral, a round postmark with a dotted rim: a door and a return arrow
// `ink: "none"` draws just the emboss with no colour, for a stamp not found yet.
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

const title = (x: number, y: number, s: string, size = 17) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="${size}" font-weight="500" letter-spacing="0.5" fill="currentColor" stroke="none">${s}</text>`;
const small = (x: number, y: number, s: string) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${MONO}" font-size="7" font-weight="600" letter-spacing="1.2" fill="currentColor" stroke="none">${s}</text>`;

// Each scene is drawn in currentColor, in a 200 box
const ART: Record<StampKey, (id: string, date: string) => string> = {
  ring: (id, date) => {
    let lines = "";
    for (let y = 92; y <= 140; y += 5) lines += `<path d="M58 ${y} H142"/>`;
    return (
      `<rect x="46" y="16" width="108" height="168" rx="24" stroke-width="4.5"/>` +
      `<rect x="55" y="25" width="90" height="150" rx="17" stroke-width="1.6"/>` +
      title(100, 52, "First ring", 16) +
      `<clipPath id="${id}d"><path d="M64 141 Q64 92 100 92 Q136 92 136 141 Z"/></clipPath>` +
      `<mask id="${id}e" maskUnits="userSpaceOnUse"><rect width="200" height="200" fill="#fff"/><ellipse cx="88" cy="118" rx="8" ry="9.5" fill="#000"/><ellipse cx="112" cy="118" rx="8" ry="9.5" fill="#000"/></mask>` +
      `<g clip-path="url(#${id}d)" mask="url(#${id}e)" stroke-width="2.6">${lines}</g>` +
      `<path d="M64 141 Q64 92 100 92 Q136 92 136 141" stroke-width="2.6"/>` +
      `<circle cx="89" cy="119" r="3.6" fill="currentColor" stroke="none"/><circle cx="113" cy="119" r="3.6" fill="currentColor" stroke="none"/>` +
      `<rect x="95" y="80" width="10" height="11" rx="2.5" fill="currentColor" stroke="none"/>` +
      `<rect x="56" y="141" width="88" height="9" rx="4.5" fill="currentColor" stroke="none"/>` +
      `<path d="M66 86 Q58 78 61 68 M134 86 Q142 78 139 68" stroke-width="2.6" stroke-linecap="round"/>` +
      small(100, 166, date)
    );
  },

  screen: (id, date) => {
    let seats = "";
    for (let i = 0; i < 7; i++) seats += `<path d="M${50 + i * 16} 140 a6 6 0 0 1 12 0 Z" fill="#000"/>`;
    return (
      `<g transform="rotate(-8 100 100)">` +
      `<rect x="22" y="40" width="156" height="120" stroke-width="4.5"/>` +
      title(100, 62, "Screening", 17) +
      `<mask id="${id}m" maskUnits="userSpaceOnUse"><rect width="200" height="200" fill="#fff"/>` +
      `<rect x="54" y="80" width="92" height="44" rx="2" fill="none" stroke="#000" stroke-width="3"/>` +
      `<path d="M94 92 L110 102 L94 112 Z" fill="#000"/>` +
      `<path d="M30 76 L54 82 M30 128 L54 122 M170 76 L146 82 M170 128 L146 122" stroke="#000" stroke-width="2"/>` +
      seats +
      `<text x="164" y="150" text-anchor="end" font-family="${MONO}" font-size="7" font-weight="600" letter-spacing="1.2" fill="#000">${date}</text></mask>` +
      `<rect x="30" y="70" width="140" height="84" fill="currentColor" stroke="none" mask="url(#${id}m)"/></g>`
    );
  },

  desk: (id, date) => {
    let windows = "";
    for (const y of [124, 146]) for (const x of [68, 84, 108, 124]) windows += `<rect x="${x}" y="${y}" width="9" height="12" rx="1" fill="#000"/>`;
    return (
      `<ellipse cx="100" cy="100" rx="64" ry="86" stroke-width="4.5"/>` +
      `<ellipse cx="100" cy="100" rx="56" ry="78" stroke-width="1.6"/>` +
      `<path id="${id}t" d="M48 100 A52 66 0 0 1 152 100" fill="none" stroke="none"/>` +
      `<text font-family="${SERIF}" font-size="15" font-weight="500" letter-spacing="0.6" fill="currentColor" stroke="none"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">Front desk</textPath></text>` +
      `<clipPath id="${id}c"><ellipse cx="100" cy="100" rx="56" ry="78"/></clipPath>` +
      `<mask id="${id}m" maskUnits="userSpaceOnUse"><rect width="200" height="200" fill="#fff"/>${windows}` +
      `<path d="M94 178 V164 Q100 157 106 164 V178 Z" fill="#000"/><path d="M60 116 H140" stroke="#000" stroke-width="2"/></mask>` +
      `<g clip-path="url(#${id}c)"><path d="M56 116 L100 84 L144 116 V190 H56 Z" fill="currentColor" stroke="none" mask="url(#${id}m)"/></g>` +
      `<path d="M96 78 Q96 70 100 70 Q104 70 104 78 Z M95 78 h10 v2 h-10 Z" fill="currentColor" stroke="none"/>` +
      small(100, 64, date)
    );
  },

  two: (id, date) => {
    const page = (x: number, n: string) =>
      `<path d="M${x} 94 Q${x + 18} 88 ${x + 36} 94 V146 Q${x + 18} 140 ${x} 146 Z" stroke-width="2.6"/>` +
      `<path d="M${x + 6} 104 H${x + 30} M${x + 6} 112 H${x + 30} M${x + 6} 120 H${x + 24}" stroke-width="1.8" stroke-linecap="round"/>` +
      `<text x="${x + 18}" y="138" text-anchor="middle" font-family="${SERIF}" font-size="13" fill="currentColor" stroke="none">${n}</text>`;
    return (
      `<g transform="rotate(6 100 100)">` +
      `<rect x="28" y="28" width="144" height="144" stroke-width="5"/>` +
      `<rect x="38" y="38" width="124" height="124" stroke-width="1.6"/>` +
      title(100, 68, "Two in a row", 16) +
      `<path d="M58 154 Q100 166 142 154" stroke-width="2.4"/>` +
      page(62, "1") + page(102, "2") +
      `<path d="M100 92 V150" stroke-width="2"/>` +
      small(100, 82, date) +
      `</g>`
    );
  },

  back: (id, date) => (
    `<circle cx="100" cy="100" r="84" stroke-width="3.5"/>` +
    `<circle cx="100" cy="100" r="76" stroke-width="4" stroke-dasharray="0.1 7" stroke-linecap="round"/>` +
    `<circle cx="100" cy="100" r="68" stroke-width="1.6"/>` +
    `<path id="${id}t" d="M44 100 A56 56 0 0 1 156 100" fill="none" stroke="none"/>` +
    `<text font-family="${SERIF}" font-size="16" font-weight="500" letter-spacing="0.6" fill="currentColor" stroke="none"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">Back again</textPath></text>` +
    // A roof with upturned eaves over an open door, and an arrow coming round to it
    `<path d="M62 102 Q100 84 138 102 Q130 100 124 104 H76 Q70 100 62 102 Z" fill="currentColor" stroke="none"/>` +
    `<mask id="${id}m" maskUnits="userSpaceOnUse"><rect width="200" height="200" fill="#fff"/><path d="M92 150 V128 Q100 118 108 128 V150 Z" fill="#000"/><rect x="80" y="112" width="8" height="10" fill="#000"/><rect x="112" y="112" width="8" height="10" fill="#000"/></mask>` +
    `<rect x="76" y="106" width="48" height="44" fill="currentColor" stroke="none" mask="url(#${id}m)"/>` +
    `<path d="M126 80 A30 14 0 0 0 74 80" stroke-width="2.6" stroke-linecap="round"/><path d="M74 80 l2 -7 M74 80 l7 2" stroke-width="2.6" stroke-linecap="round"/>` +
    small(100, 162, date)
  ),
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
    `<defs><g id="${id}a" fill="none" stroke="currentColor">${ART[key](id, date)}</g>` +
    `<filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="${SEED[key]}" result="b"/>` +
    `<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.75" result="m"/>` +
    `<feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs>` +
    `<g transform="rotate(${rotate} 100 100)">` +
    `<use href="#${id}a" transform="translate(-1.2 -1.2)" style="color:#fff" opacity="${ghost ? 0.12 : 0.22}"/>` +
    `<use href="#${id}a" transform="translate(1.6 1.8)" style="color:#000" opacity="${ghost ? 0.45 : 0.4}"/>` +
    (ghost ? "" : `<use href="#${id}a" style="color:${colour}" filter="url(#${id}f)"/>`) +
    `</g></svg>`
  );
}
