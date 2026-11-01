// ── Stamps ────────────────────────────────────────────────────────────────────
// Five rubber stamps a visitor can collect, each for finding something. All five are
// the same size, a round impression, so they sit evenly in a row; what sets each apart
// is its edge and the drawing inside:
//   First ring    a sunburst of ticks round Bella ringing
//   Screening     a ring of film perforations round a frame with a play mark
//   Front desk    a scalloped edge, like a wax seal, round a sealed envelope
//   Two in a row  a rope edge round two pages fanned open, numbered 1 and 2
//   Back again    a postmark: serrated edge, the date across a band, a door and a
//                 return arrow
// Each has its name round the top and the date it was earned round the bottom.
//
// The ink is printed, not drawn: a displacement roughens every edge and a blotchy
// mask thins the ink in places, as if pressed by hand. Highlights inside the drawings
// are knocked out with masks, so the paper shows through. `ink` overrides the colour
// (gold foil on the dark pass).
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
const C = 80; // centre of the 160 box

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function stampDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const STAR = "M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z";
const star = (x: number, y: number, s = 1) => `<path d="${STAR}" transform="translate(${x} ${y}) scale(${s})" stroke="none"/>`;
const ring = (r: number, w: number, extra = "") => `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke-width="${w}" ${extra}/>`;
const polar = (r: number, a: number) => [C + r * Math.cos(a), C + r * Math.sin(a)];
const f1 = (n: number) => n.toFixed(1);

// Name round the top, date round the bottom, both reading upright
function lettering(id: string, name: string, date: string, rTop = 52, rBottom = 59) {
  return (
    `<path id="${id}t" d="M${C - rTop} ${C} A${rTop} ${rTop} 0 0 1 ${C + rTop} ${C}" fill="none" stroke="none"/>` +
    `<path id="${id}b" d="M${C - rBottom} ${C} A${rBottom} ${rBottom} 0 0 0 ${C + rBottom} ${C}" fill="none" stroke="none"/>` +
    `<text font-family="${MONO}" font-size="11" font-weight="600" letter-spacing="2.4" stroke="none"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${name}</textPath></text>` +
    `<text font-family="${MONO}" font-size="8" font-weight="600" letter-spacing="1.6" stroke="none"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${date}</textPath></text>` +
    star(C - 58, C, 0.8) + star(C + 58, C, 0.8)
  );
}

// Bella in miniature: dome, plunger, base, with her eyes and a highlight knocked out
function bella(id: string, cx: number, cy: number, w: number) {
  const k = w / 52;
  const p = (x: number, y: number) => [cx + (x - 26) * k, cy + (y - 30) * k];
  const [e1x, e1y] = p(19, 26), [e2x, e2y] = p(33, 26), [h1x, h1y] = p(8, 34), [h2x, h2y] = p(7, 20), [h3x, h3y] = p(15, 14);
  const [dx1, dy1] = p(2, 40), [dx2, dy2] = p(2, 10), [dx3, dy3] = p(26, 10), [dx4, dy4] = p(50, 10), [dx5, dy5] = p(50, 40);
  const [px, py] = p(22, 2), [bx, by] = p(-3, 40);
  return (
    `<mask id="${id}k" maskUnits="userSpaceOnUse"><rect width="160" height="160" fill="#fff"/>` +
    `<ellipse cx="${f1(e1x)}" cy="${f1(e1y)}" rx="${f1(3.6 * k)}" ry="${f1(4.6 * k)}" fill="#000"/><ellipse cx="${f1(e2x)}" cy="${f1(e2y)}" rx="${f1(3.6 * k)}" ry="${f1(4.6 * k)}" fill="#000"/>` +
    `<path d="M${f1(h1x)} ${f1(h1y)} Q${f1(h2x)} ${f1(h2y)} ${f1(h3x)} ${f1(h3y)}" stroke="#000" stroke-width="${f1(2.4 * k)}" fill="none" stroke-linecap="round"/></mask>` +
    `<g mask="url(#${id}k)" stroke="none">` +
    `<path d="M${f1(dx1)} ${f1(dy1)} Q${f1(dx2)} ${f1(dy2)} ${f1(dx3)} ${f1(dy3)} Q${f1(dx4)} ${f1(dy4)} ${f1(dx5)} ${f1(dy5)} Z"/>` +
    `<rect x="${f1(px)}" y="${f1(py)}" width="${f1(8 * k)}" height="${f1(9 * k)}" rx="${f1(2 * k)}"/>` +
    `<rect x="${f1(bx)}" y="${f1(by)}" width="${f1(58 * k)}" height="${f1(7 * k)}" rx="${f1(3.5 * k)}"/></g>`
  );
}

const ART: Record<StampKey, (id: string, date: string) => string> = {
  ring: (id, date) => {
    let ticks = "";
    for (let i = 0; i < 48; i++) {
      const a = (Math.PI * 2 * i) / 48;
      const [x1, y1] = polar(i % 2 ? 68 : 66, a), [x2, y2] = polar(74, a);
      ticks += `M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)} `;
    }
    return (
      `<path d="${ticks}" stroke-width="2.2" stroke-linecap="round" fill="none"/>` +
      ring(63, 2.6) + ring(44, 1.2, `stroke-dasharray="0.1 4" stroke-linecap="round"`) +
      lettering(id, "FIRST RING", date) +
      bella(id, C, C + 4, 40) +
      `<g stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M56 74 Q51 67 54 59"/><path d="M104 74 Q109 67 106 59"/></g>`
    );
  },

  screen: (id, date) => {
    let holes = "";
    for (let i = 0; i < 28; i++) {
      const a = (Math.PI * 2 * i) / 28;
      holes += `<rect x="-2.6" y="-2" width="5.2" height="4" rx="1" transform="translate(${f1(C + 68 * Math.cos(a))} ${f1(C + 68 * Math.sin(a))}) rotate(${f1((a * 180) / Math.PI)})" fill="#000"/>`;
    }
    return (
      `<mask id="${id}p" maskUnits="userSpaceOnUse"><rect width="160" height="160" fill="#fff"/>${holes}</mask>` +
      `<circle cx="${C}" cy="${C}" r="68" fill="none" stroke-width="12" mask="url(#${id}p)"/>` +
      ring(58, 1.4) +
      lettering(id, "SCREENING", date, 46, 52) +
      `<rect x="58" y="66" width="44" height="30" rx="4" fill="none" stroke-width="2.6"/>` +
      `<path d="M74 72 L88 81 L74 90 Z" stroke="none"/>` +
      `<path d="M58 72 H52 M58 90 H52 M102 72 H108 M102 90 H108" stroke-width="2" stroke-linecap="round" fill="none"/>`
    );
  },

  desk: (id, date) => {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const a = (Math.PI * 2 * i) / 120;
      const [x, y] = polar(70 + 3 * Math.abs(Math.sin(a * 12)), a);
      pts.push(`${f1(x)} ${f1(y)}`);
    }
    return (
      `<path d="M${pts.join(" L")} Z" fill="none" stroke-width="2.6" stroke-linejoin="round"/>` +
      ring(62, 1.4) +
      lettering(id, "FRONT DESK", date) +
      `<rect x="57" y="64" width="46" height="32" rx="3" fill="none" stroke-width="2.6"/>` +
      `<path d="M58 66 L80 83 L102 66" fill="none" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<mask id="${id}w" maskUnits="userSpaceOnUse"><rect width="160" height="160" fill="#fff"/><path d="M75.5 88 Q75.5 80 80 80 Q84.5 80 84.5 88 Z M74 88 h12 v2 h-12 Z" fill="#000"/></mask>` +
      `<circle cx="80" cy="85" r="9" stroke="none" mask="url(#${id}w)"/>`
    );
  },

  two: (id, date) => {
    // Two pages side by side, overlapping a little, each with its number
    const page = (dx: number, rot: number, n: string) =>
      `<g transform="translate(${dx} 0) rotate(${rot} 80 80)"><rect x="68" y="63" width="24" height="32" rx="2" stroke-width="2.4"/>` +
      `<path d="M72 70 H88 M72 75 H88 M72 80 H84" stroke-width="1.8" stroke-linecap="round" fill="none"/>` +
      `<text x="80" y="91.5" text-anchor="middle" font-family="${MONO}" font-size="8" font-weight="700" stroke="none">${n}</text></g>`;
    return (
      ring(71, 2, `stroke-dasharray="5 3"`) + ring(66, 2.6) + ring(60, 1.2) +
      lettering(id, "TWO IN A ROW", date, 50, 55) +
      // The first page is filled with the paper's colour by a knock-out, so the second sits on top cleanly
      `<mask id="${id}g" maskUnits="userSpaceOnUse"><rect width="160" height="160" fill="#fff"/><g transform="translate(9 0) rotate(8 80 80)"><rect x="66" y="61" width="28" height="36" rx="3" fill="#000"/></g></mask>` +
      `<g mask="url(#${id}g)" fill="none">${page(-9, -8, "1")}</g><g fill="none">${page(9, 8, "2")}</g>`
    );
  },

  back: (id, date) => {
    let teeth = "";
    for (let i = 0; i < 56; i++) {
      const [x, y] = polar(i % 2 ? 74 : 70, (Math.PI * 2 * i) / 56);
      teeth += `${i ? "L" : "M"}${f1(x)} ${f1(y)} `;
    }
    return (
      `<path d="${teeth}Z" fill="none" stroke-width="2" stroke-linejoin="round"/>` + ring(63, 2.4) +
      `<path id="${id}t" d="M${C - 52} ${C} A52 52 0 0 1 ${C + 52} ${C}" fill="none" stroke="none"/>` +
      `<path id="${id}b" d="M${C - 59} ${C} A59 59 0 0 0 ${C + 59} ${C}" fill="none" stroke="none"/>` +
      `<text font-family="${MONO}" font-size="11" font-weight="600" letter-spacing="2.4" stroke="none"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">BACK AGAIN</textPath></text>` +
      `<text font-family="${MONO}" font-size="8" font-weight="600" letter-spacing="2" stroke="none"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">FRONT DESK</textPath></text>` +
      // The date across a band through the middle, as on a postmark
      `<path d="M24 72 H136 M24 90 H136" stroke-width="1.6" fill="none"/>` +
      `<text x="80" y="84.5" text-anchor="middle" font-family="${MONO}" font-size="9" font-weight="700" letter-spacing="1.4" stroke="none">${date}</text>` +
      // A return arrow above the band, three stars below
      `<path d="M87 58 A8 8 0 1 1 80 54" fill="none" stroke-width="2.2" stroke-linecap="round"/><path d="M80 54 l4 -4 M80 54 l4 4" stroke-width="2.2" stroke-linecap="round" fill="none"/>` +
      star(70, 104, 0.7) + star(80, 106, 0.9) + star(90, 104, 0.7)
    );
  },
};

/** One stamp as an SVG string. `id` must be unique on the page. */
export function stampSvg(
  key: StampKey,
  { id, date = "", rotate = 0, label, ink }: { id: string; date?: string; rotate?: number; label?: string; ink?: string },
) {
  const colour = ink ?? INK[key];
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
    `<g filter="url(#${id}f)" transform="rotate(${rotate} 80 80)" fill="${colour}" stroke="${colour}" opacity="0.94">` +
    `${ART[key](id, date)}</g></svg>`
  );
}
