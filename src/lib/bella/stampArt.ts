// ── Stamps ────────────────────────────────────────────────────────────────────
// Five stamps a visitor can collect, each for finding something. They're a set of used
// postage stamps from "Curiosity Post", printed like old screen-printed travel stamps:
// perforated edges, aged cream paper, a fine concentric-line ground, one scene printed
// as a worn single-ink silhouette with birds, a bold title top left, the value top
// right, the series name running up the side, and a postmark cancelled across it.
//   First ring    grape: the bell tower, value 1
//   Screening     carmine: the picture house, searchlights up, value 2
//   Front desk    blackcurrant: the grand hotel, value 3
//   Two in a row  green: two canal houses, numbers 1 and 2, value 4
//   Back again    slate: the lighthouse, a steamer coming home, value 5
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

const PAPER = "#f6f0e3"; // aged cream stock
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
const SHAPE: Record<StampKey, Pt[]> = { ring: PORTRAIT, screen: PORTRAIT, desk: PORTRAIT, two: PORTRAIT, back: PORTRAIT };

// ── Printing helpers (single ink `c`, paper `P` for the parts cut out of the ink) ──

const P = PAPER;
const SANS = "Geist, 'Helvetica Neue', Arial, sans-serif";
const SANS_CSS = "font-family:var(--font-geist),'Helvetica Neue',Arial,sans-serif";
const sans = (x: number, y: number, s: string, fill: string, size: number, o: { ls?: number; anchor?: string; len?: number; weight?: number; extra?: string } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "start"}" font-family="${SANS}" style="${SANS_CSS}" font-size="${size}" font-weight="${o.weight ?? 600}" letter-spacing="${o.ls ?? 0}" fill="${fill}"` +
  (o.len ? ` textLength="${o.len}" lengthAdjust="spacingAndGlyphs"` : "") + (o.extra ?? "") + `>${s}</text>`;
const serif = (x: number, y: number, s: string, fill: string, size: number, anchor = "start", italic = false) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${SERIF}" font-size="${size}" font-weight="500"${italic ? ' font-style="italic"' : ""} fill="${fill}">${s}</text>`;

// The fine concentric-line ground the scene sits on
const rings = (cx: number, cy: number) => {
  let d = "";
  for (let r = 2.2; r < 170; r += 2.2) d += `M${f1(cx - r)} ${cy}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0`;
  return `<path d="${d}" fill="none" stroke="#7d7480" stroke-opacity="0.45" stroke-width="0.38"/>`;
};
// A bird in flight, wings up or down
const bird = (x: number, y: number, s: number, up = true) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="${up
    ? "M-6 -1 Q-3.4 -4.4 -0.4 0 Q0 0.8 0.4 0 Q3.4 -4.4 6 -1 Q3.2 -1.8 0.6 1.6 Q0 2.4 -0.6 1.6 Q-3.2 -1.8 -6 -1Z"
    : "M-6 1.6 Q-3.2 -0.6 -0.6 -0.2 Q0 -1 0.6 -0.2 Q3.2 -0.6 6 1.6 Q3 0.6 0.6 1.6 Q0 2.4 -0.6 1.6 Q-3 0.6 -6 1.6Z"}"/>`;
const birds = (list: [number, number, number, boolean?][], c: string) =>
  `<g fill="${c}">${list.map(([x, y, s, up]) => bird(x, y, s, up ?? true)).join("")}</g>`;
const archP = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y + h}V${y + w / 2}Q${x} ${y} ${x + w / 2} ${y}Q${x + w} ${y} ${x + w} ${y + w / 2}V${y + h}Z`;
const rects = (list: [number, number, number, number][], fill: string) =>
  list.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`).join("");

// Every stamp: the ground, the scene printed worn, and the type printed clean
const stamp = (id: string, c: string, o: { title: string; sub: string; n: string; cx: number; cy: number; len?: number; k?: number; dx?: number }, scene: string) =>
  `<clipPath id="${id}k"><rect x="40" y="20" width="120" height="160"/></clipPath>` +
  `<g clip-path="url(#${id}k)">${rings(o.cx, o.cy)}<g filter="url(#${id}d)"><g transform="translate(${(o.dx ?? 0) + 104} 180) scale(${o.k ?? 1}) translate(-104 -180)">${scene}</g></g></g>` +
  `<g filter="url(#${id}f)">` +
  sans(46, 36.5, o.title, POST, 10.5, { ls: 0.3, len: o.len }) +
  serif(46, 46.5, o.sub, c, 7, "start", true) +
  serif(155, 38, o.n, c, 14, "end") +
  sans(45.6, 176, "CURIOSITY POST", POST, 4.4, { ls: 1.6, weight: 500, extra: ` transform="rotate(-90 45.6 176)" opacity="0.75"` }) +
  `</g>`;

// Each stamp's printed ink, in a 200 box
const ART: Record<StampKey, (id: string, c: string) => string> = {
  // The bell tower, birds lifting off as it rings
  ring: (id, c) =>
    stamp(id, c, { title: "FIRST RING", sub: "The bell tower", n: "1", cx: 114, cy: 74, k: 0.88, dx: 10 },
      `<g fill="${c}">` +
        `<path d="M48 180 V150 L62 138 L78 150 V180 Z"/>` +
        `<path d="M126 136 H162 V140 H160 V180 H128 V140 H126 Z"/>` +
        `<rect x="86" y="108" width="36" height="72"/><rect x="82" y="104" width="44" height="5"/>` +
        `<rect x="89" y="74" width="30" height="31"/><rect x="85" y="70" width="38" height="5"/>` +
        `<path d="M87 70 L104 30 L121 70 Z M84 70 L88 58 L92 70 Z M116 70 L120 58 L124 70 Z"/>` +
        `<rect x="103.3" y="20" width="1.4" height="11"/><circle cx="104" cy="20" r="1.8"/>` +
        `<rect x="44" y="178" width="118" height="3"/>` +
      `</g>` +
      `<g fill="${P}">` +
        `<path d="${archP(96, 79, 16, 25)}"/>` +
        `<circle cx="104" cy="124" r="8"/>` +
        `<path d="${archP(96, 138, 4, 18)} ${archP(108, 138, 4, 18)} ${archP(98, 162, 12, 18)}"/>` +
        rects([[54, 156, 6, 9], [66, 156, 6, 9], [134, 148, 7, 10], [148, 148, 7, 10], [134, 164, 7, 10], [148, 164, 7, 10]], P) +
        `<circle cx="62" cy="146" r="2.6"/>` +
      `</g>` +
      `<g fill="${c}"><path d="M98 99 Q98 87 104 87 Q110 87 110 99 Z"/><rect x="96.5" y="98.5" width="15" height="2.2"/><circle cx="104" cy="102.4" r="1.5"/></g>` +
      `<circle cx="104" cy="124" r="6.2" fill="none" stroke="${c}" stroke-width="0.8"/>` +
      `<path d="M104 124 V118.5 M104 124 L108 126.5" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>` +
      birds([[132, 60, 0.9], [142, 49, 0.7, false], [121, 44, 0.6], [150, 70, 0.55], [64, 74, 0.8, false], [72, 62, 0.6], [58, 92, 0.5], [146, 98, 0.65, false], [136, 82, 0.45]], c)),

  // The picture house: Art Deco tower, CINEMA down the sign, searchlights up
  screen: (id, c) =>
    stamp(id, c, { title: "SCREENING", sub: "The picture house", n: "2", cx: 112, cy: 66, k: 0.88, dx: 8 },
      `<g fill="${c}" opacity="0.22"><path d="M84 98 L44 26 L58 20 Z M124 98 L162 36 L152 26 Z"/></g>` +
      `<g fill="${c}">` +
        `<rect x="48" y="110" width="112" height="70"/>` +
        `<path d="M48 112 V102 H58 V98 H72 V112 Z M160 112 V102 H150 V98 H136 V112 Z"/>` +
        `<rect x="89" y="62" width="30" height="50"/><rect x="93" y="50" width="22" height="13"/>` +
        `<rect x="97.5" y="40" width="13" height="11"/><rect x="101.5" y="32" width="5" height="9"/>` +
        `<rect x="103.4" y="18" width="1.2" height="15"/><circle cx="104" cy="17.5" r="1.5"/>` +
        `<rect x="46" y="134" width="116" height="4.5"/>` +
      `</g>` +
      `<rect x="98" y="66" width="12" height="42" fill="${P}"/>` +
      ["C", "I", "N", "E", "M", "A"].map((l, i) => sans(104, 72.6 + i * 6.7, l, c, 6, { anchor: "middle", weight: 700 })).join("") +
      `<path d="M92.5 64 V110 M115.5 64 V110 M96 52 V62 M112 52 V62" stroke="${P}" stroke-width="0.8"/>` +
      `<path d="M44 122 H164 L160 134 H48 Z" fill="${P}" stroke="${c}" stroke-width="1.2"/>` +
      sans(104, 130.6, "NOW SHOWING", c, 6.4, { anchor: "middle", weight: 700, ls: 1.2 }) +
      Array.from({ length: 19 }, (_, i) => `<circle cx="${50 + i * 6}" cy="136.3" r="0.9" fill="${P}"/>`).join("") +
      rects([[80, 148, 12, 32], [98, 148, 12, 32], [116, 148, 12, 32], [56, 146, 14, 22], [138, 146, 14, 22], [52, 114, 4, 6], [60, 114, 4, 6], [144, 114, 4, 6], [152, 114, 4, 6]], P) +
      `<path d="M86 148 V180 M104 148 V180 M122 148 V180" stroke="${c}" stroke-width="1"/>` +
      `<rect x="59" y="149" width="8" height="12" fill="none" stroke="${c}" stroke-width="0.7"/><rect x="141" y="149" width="8" height="12" fill="none" stroke="${c}" stroke-width="0.7"/>` +
      `<rect x="44" y="178" width="118" height="3" fill="${c}"/>` +
      birds([[66, 62, 0.6], [74, 54, 0.45, false], [140, 70, 0.55]], c)),

  // The grand hotel: mansard roof, flag up, HOTEL over the door
  desk: (id, c) =>
    stamp(id, c, { title: "FRONT DESK", sub: "The grand hotel", n: "3", cx: 110, cy: 80, k: 0.9, dx: 6 },
      `<g fill="${c}">` +
        `<rect x="52" y="96" width="104" height="84"/>` +
        `<path d="M50 96 L58 80 H150 L158 96 Z"/>` +
        `<rect x="90" y="62" width="28" height="34"/><path d="M88 64 Q104 38 120 64 Z"/>` +
        `<rect x="103.4" y="26" width="1.2" height="22"/><path d="M104.6 26 L118 29.5 L104.6 33 Z"/>` +
        `<circle cx="51" cy="156" r="7"/><circle cx="56" cy="147" r="6.5"/><rect x="51" y="160" width="2" height="20"/>` +
        `<circle cx="157" cy="156" r="7"/><circle cx="152" cy="147" r="6.5"/><rect x="155" y="160" width="2" height="20"/>` +
        `<rect x="44" y="178" width="118" height="3"/>` +
      `</g>` +
      `<g fill="${P}">` +
        `<path d="${archP(62, 84, 6, 9)} ${archP(76, 84, 6, 9)} ${archP(126, 84, 6, 9)} ${archP(140, 84, 6, 9)}"/>` +
        `<circle cx="104" cy="76" r="5"/>` +
        rects([[58, 102, 6, 10], [70, 102, 6, 10], [82, 102, 6, 10], [120, 102, 6, 10], [132, 102, 6, 10], [144, 102, 6, 10],
          [58, 118, 6, 10], [70, 118, 6, 10], [82, 118, 6, 10], [120, 118, 6, 10], [132, 118, 6, 10], [144, 118, 6, 10],
          [74, 134, 60, 10], [96, 158, 16, 22]], P) +
        `<path d="${archP(98, 100, 12, 14)} ${archP(98, 118, 12, 10)} ${archP(62, 150, 7, 16)} ${archP(74, 150, 7, 16)} ${archP(127, 150, 7, 16)} ${archP(139, 150, 7, 16)}"/>` +
        `<path d="M86 149 H122 L126 158 H82 Z"/>` +
      `</g>` +
      `<circle cx="104" cy="76" r="1.6" fill="${c}"/>` +
      sans(104, 141.8, "HOTEL", c, 7.4, { anchor: "middle", weight: 700, ls: 3 }) +
      `<path d="M89 149 L86 158 M95 149 L94 158 M101 149 L101 158 M107 149 L107 158 M113 149 L114 158 M119 149 L122 158" stroke="${c}" stroke-width="1.4"/>` +
      `<path d="M104 158 V180" stroke="${c}" stroke-width="1"/>` +
      birds([[66, 56, 0.6], [138, 50, 0.55, false], [148, 60, 0.45]], c)),

  // Two canal houses side by side, numbers 1 and 2, the second door open
  two: (id, c) =>
    stamp(id, c, { title: "TWO IN A ROW", sub: "Numbers 1 &amp; 2", n: "4", cx: 104, cy: 76, len: 72, k: 0.88 },
      `<g fill="${c}">` +
        `<path d="M50 180 V80 H50 V72 H56 V64 H62 V56 H68 V48 H84 V56 H90 V64 H96 V72 H102 V180 Z"/>` +
        `<path d="M104 180 V84 Q104 70 114 66 V50 Q114 40 130 38 Q146 40 146 50 V66 Q156 70 156 84 V180 Z"/>` +
        `<rect x="75.3" y="40" width="1.4" height="9"/><rect x="129.3" y="30" width="1.4" height="9"/>` +
        `<rect x="44" y="178" width="118" height="3"/>` +
      `</g>` +
      `<g fill="${P}">` +
        rects([[72, 54, 8, 10], [60, 70, 6, 8], [86, 70, 6, 8],
          [58, 86, 8, 12], [86, 86, 8, 12], [58, 106, 8, 12], [86, 106, 8, 12], [58, 126, 8, 12], [86, 126, 8, 12],
          [112, 88, 8, 12], [126, 88, 8, 12], [140, 88, 8, 12], [112, 108, 8, 12], [126, 108, 8, 12], [140, 108, 8, 12],
          [112, 128, 8, 12], [140, 128, 8, 12]], P) +
        `<circle cx="130" cy="52" r="5"/>` +
        `<path d="${archP(70, 152, 12, 28)} ${archP(124, 152, 12, 28)}"/>` +
        `<circle cx="76" cy="145" r="4.6"/><circle cx="130" cy="145" r="4.6"/>` +
      `</g>` +
      `<path d="M62 86 V98 M90 86 V98 M62 106 V118 M90 106 V118 M62 126 V138 M90 126 V138 M58 92 H66 M86 92 H94 M58 112 H66 M86 112 H94 M58 132 H66 M86 132 H94" stroke="${c}" stroke-width="0.8"/>` +
      `<path d="M124 180 V160 Q124 156 128 155 V182 Z" fill="${c}"/>` +
      `<path d="M71.5 180 V161 Q71.5 154 76 153.5 Q80.5 154 80.5 161 V180 Z" fill="none" stroke="${c}" stroke-width="0.8"/><circle cx="78.6" cy="168" r="1" fill="${c}"/>` +
      serif(76, 147.4, "1", c, 6.4, "middle") + serif(130, 147.4, "2", c, 6.4, "middle") +
      birds([[66, 32, 0.55], [92, 40, 0.5, false], [150, 50, 0.6], [140, 30, 0.45, false]], c)),

  // The lighthouse, beams out, a steamer coming home
  back: (id, c) => {
    const band = (y0: number, y1: number) => {
      const hw = (y: number) => 6 + ((y - 74) / 76) * 4;
      return `M${f1(130 - hw(y0))} ${y0}H${f1(130 + hw(y0))}L${f1(130 + hw(y1))} ${y1}H${f1(130 - hw(y1))}Z`;
    };
    return stamp(id, c, { title: "BACK AGAIN", sub: "The lighthouse", n: "5", cx: 130, cy: 62 },
      `<g fill="${c}" opacity="0.22"><path d="M130 62 L40 44 L40 76 Z M130 62 L164 52 L164 62 Z"/></g>` +
      `<g fill="${c}">` +
        `<path d="M120 152 L124 74 H136 L140 152 Z"/><rect x="118.5" y="70" width="23" height="4.5"/>` +
        `<rect x="123" y="56" width="14" height="14"/><path d="M121.5 56.5 Q130 43 138.5 56.5 Z"/><rect x="129.4" y="40" width="1.2" height="7"/>` +
        `<rect x="142" y="137" width="18" height="16"/><path d="M140 137 L151 128 L162 137 Z"/>` +
        `<path d="M98 162 Q104 151 114 152 Q118 147 126 149 L148 151 Q158 149 164 158 V166 H98 Z"/>` +
        `<path d="M50 156 H98 L92 165 H57 Z"/><rect x="62" y="148" width="24" height="8.5"/><rect x="76" y="137" width="6.5" height="12"/>` +
        `<rect x="87.4" y="132" width="1.2" height="17"/>` +
      `</g>` +
      `<g fill="${c}" opacity="0.55"><circle cx="85" cy="131" r="3.2"/><circle cx="91" cy="125" r="4.2"/><circle cx="99" cy="119" r="5.2"/><circle cx="108" cy="115" r="4.4"/></g>` +
      `<g fill="${P}">` +
        `<rect x="125" y="58.5" width="10" height="9"/>` +
        `<path d="${band(90, 98)} ${band(114, 122)}"/>` +
        `<path d="${archP(127, 141, 6, 11)}"/><rect x="147" y="141" width="5" height="6"/>` +
        `<rect x="76" y="139.5" width="6.5" height="2"/>` +
        [66, 72, 78, 84].map((x) => `<circle cx="${x}" cy="159.5" r="1.1"/>`).join("") +
      `</g>` +
      `<path d="M130 58.5 V67.5" stroke="${c}" stroke-width="0.9"/>` +
      `<path d="M40 168 q5 -2.4 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 M44 173.5 q5 -2.4 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 M40 179 q5 -2.4 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" fill="none" stroke="${c}" stroke-width="1.3"/>` +
      birds([[104, 90, 0.6], [112, 82, 0.45, false], [150, 96, 0.55], [60, 104, 0.5, false]], c));
  },
};

// A postmark: a double ring with the post office and the date, and wavy cancel lines
const POSTMARK: Record<StampKey, { x: number; y: number; r: number; dir: 1 | -1 }> = {
  ring: { x: 148, y: 156, r: -12, dir: 1 },
  screen: { x: 58, y: 150, r: 9, dir: -1 },
  desk: { x: 150, y: 124, r: -7, dir: 1 },
  two: { x: 56, y: 118, r: 11, dir: -1 },
  back: { x: 56, y: 72, r: -16, dir: -1 },
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
  back: [[150, 30], [46, 120]],
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
    `<defs>` +
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
    // The scene: a worn screen print, rough edges and ink missing in patches
    `<filter id="${id}d" x="-5%" y="-5%" width="110%" height="110%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${seed + 2}" result="e"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="e" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="r"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="${seed}" result="b"/>` +
    `<feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2 2.2" result="m"/>` +
    `<feComposite in="r" in2="m" operator="in"/></filter>` +
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
        `<g opacity="0.94">${ART[key](id, c)}</g>` +
        `<g clip-path="url(#${id}c)" filter="url(#${id}q)" opacity="0.6">${postmark(id, key, date)}</g>` +
        `</g>`) +
    `</g></svg>`
  );
}
