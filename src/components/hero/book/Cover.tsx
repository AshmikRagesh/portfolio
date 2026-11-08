// ── The cover ─────────────────────────────────────────────────────────────────
// After the reference's itinerary booklet: an off-white cloth board with the title set
// top left, and a picture that fades up into the board from the bottom edge. Here the
// picture is a variegated pixel texture in the brand ramp (squares that grow and shrink
// with a slow noise field, densest at the bottom, thinning out as they rise), not a
// photo. The spine has its hinge groove,
// and the title is debossed into the cloth.
//
// Flag stickers from the trips abroad are stuck across the board, like ones picked up on
// the way: vinyl with a white die-cut edge, a soft sheen, a shadow that lifts them a
// hair off the cloth, and one corner starting to peel.

import { memo } from "react";

export const PW = 320;
export const PH = 432;

const CELL = 8;
const COLS = PW / CELL;
const ROWS = 30; // the texture's height in cells
const TONES = ["#F9E4FF", "#F2B6EC", "#D66FB6", "#9D136A", "#32073e"];

function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}

const Texture = memo(function Texture() {
  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    const rise = y / (ROWS - 1); // 0 at the top of the texture, 1 at the bottom edge
    for (let x = 0; x < COLS; x++) {
      const n = noise(x / 6, y / 5) * 0.65 + noise(x / 2.5 + 9, y / 2.5) * 0.35;
      const v = n * 0.75 + rise * 0.85 - 0.35 + (hash(x, y) - 0.5) * 0.18;
      if (v <= 0.05) continue;
      const size = Math.min(CELL - 1, 1.5 + v * 6.5);
      const tone = TONES[Math.min(TONES.length - 1, Math.floor(v * 4.2))];
      const o = (CELL - size) / 2;
      cells.push(<rect key={y * COLS + x} x={x * CELL + o} y={y * CELL + o} width={size} height={size} rx={size > 4 ? 0.8 : 0.4} fill={tone} />);
    }
  }
  return (
    <svg viewBox={`0 0 ${PW} ${ROWS * CELL}`} className="absolute inset-x-0 bottom-0 block w-full" aria-hidden="true">
      {cells}
    </svg>
  );
});

// ── Flag stickers ──
// Each flag in its real proportions, drawn flat; the sticker adds the vinyl look.
const FLAGS = {
  uae: {
    label: "United Arab Emirates",
    ratio: 2,
    art: (
      <svg viewBox="0 0 12 6" className="block h-full w-full">
        <rect width="12" height="2" fill="#00732F" />
        <rect y="2" width="12" height="2" fill="#fff" />
        <rect y="4" width="12" height="2" fill="#000" />
        <rect width="3" height="6" fill="#EF3340" />
      </svg>
    ),
  },
  azerbaijan: {
    label: "Azerbaijan",
    ratio: 2,
    art: (
      <svg viewBox="0 0 1200 600" className="block h-full w-full">
        <rect width="1200" height="200" fill="#00B5E2" />
        <rect y="200" width="1200" height="200" fill="#EF3340" />
        <rect y="400" width="1200" height="200" fill="#509E2F" />
        <circle cx="570" cy="300" r="90" fill="#fff" />
        <circle cx="592" cy="300" r="75" fill="#EF3340" />
        <polygon
          fill="#fff"
          points={Array.from({ length: 16 }, (_, i) => {
            const a = (i * Math.PI) / 8 - Math.PI / 2;
            const r = i % 2 ? 23 : 50;
            return `${(680 + r * Math.cos(a)).toFixed(1)},${(300 + r * Math.sin(a)).toFixed(1)}`;
          }).join(" ")}
        />
      </svg>
    ),
  },
  indonesia: {
    label: "Indonesia",
    ratio: 1.5,
    art: (
      <svg viewBox="0 0 3 2" className="block h-full w-full">
        <rect width="3" height="1" fill="#CE1126" />
        <rect y="1" width="3" height="1" fill="#fff" />
      </svg>
    ),
  },
} as const;

type FlagKey = keyof typeof FLAGS;

// Fine print grain, shared by every sticker (an SVG noise tile)
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='64' height='64' filter='url(%23n)'/></svg>\")";

function Sticker({ flag, width, left, top, rotate, peel = false, lift = "right" }: { flag: FlagKey; width: number; left: number; top: number; rotate: number; peel?: boolean; lift?: "left" | "right" }) {
  const f = FLAGS[flag];
  const EDGE = 3.5; // the white die-cut margin
  const w = width;
  const h = Math.round(((width - EDGE * 2) / f.ratio + EDGE * 2) * 10) / 10;
  const P = 9; // how far the peeled corner has lifted
  const cut = peel ? `polygon(0 0, 100% 0, 100% calc(100% - ${P}px), calc(100% - ${P}px) 100%, 0 100%)` : undefined;
  return (
    <div className="absolute" style={{ left, top, width: w, height: h, transform: `rotate(${rotate}deg)` }} role="img" aria-label={`${f.label} flag sticker`}>
      {/* Two shadows, both following the cut corner: a tight contact line where the vinyl meets
          the cloth, and a soft one under the side that's lifting a little */}
      <div className="absolute inset-0 rounded-[3px] bg-[#1e0525]/35 blur-[0.4px]" style={{ transform: "translate(0, 0.5px)", clipPath: cut }} />
      <div
        className="absolute inset-0 rounded-[3px] bg-[#1e0525]/20 blur-[2px]"
        style={{ transform: `translate(${lift === "right" ? 1 : -1}px, 1.6px)`, clipPath: cut }}
      />
      <div className="absolute inset-0 overflow-hidden rounded-[3px] bg-[#fdfcf8]" style={{ clipPath: cut }}>
        {/* The printed flag: a touch flatter than screen colour, as ink on vinyl is */}
        <div className="absolute overflow-hidden rounded-[1px]" style={{ inset: EDGE, filter: "saturate(0.9) contrast(0.96) brightness(0.99)" }}>
          {f.art}
        </div>
        {/* Print grain over the whole sticker */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply" style={{ backgroundImage: GRAIN, backgroundSize: "32px 32px" }} />
        {/* Gloss: a narrow specular streak and a broad soft sheen */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(112deg, rgba(255,255,255,0) 18%, rgba(255,255,255,0.5) 24%, rgba(255,255,255,0.08) 31%, rgba(255,255,255,0) 40%), linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 45%, rgba(30,5,37,0.06) 100%)",
          }}
        />
        {/* The lifting side curls up slightly: lighter along its edge */}
        <div
          className="pointer-events-none absolute inset-y-0 w-[30%]"
          style={{ [lift]: 0, background: `linear-gradient(to ${lift}, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 100%)` }}
        />
        {/* The cut edge: a bright rim on top, a faint dark line below */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: "inset 0 0.5px 0 rgba(255,255,255,1), inset 0 -0.5px 0 rgba(30,5,37,0.14), inset 0 0 0 0.5px rgba(30,5,37,0.08)" }} />
      </div>
      {/* The peeled corner: the backing, folded over, curving as it lifts, with a shadow on the sticker under it */}
      {peel && (
        <>
          <div
            className="absolute"
            style={{ right: P - 1, bottom: P - 1, width: 6, height: 6, background: "radial-gradient(circle at 100% 100%, rgba(30,5,37,0.28), rgba(30,5,37,0) 70%)", transform: "translate(3px, 3px)" }}
          />
          <div
            className="absolute"
            style={{
              right: 0,
              bottom: 0,
              width: P,
              height: P,
              clipPath: "polygon(0 0, 100% 0, 0 100%)",
              background: "linear-gradient(135deg, #d8d1c3 0%, #f6f3ec 45%, #fffefb 60%, #e4ddd0 100%)",
              filter: "drop-shadow(-0.4px -0.4px 0.4px rgba(30,5,37,0.35))",
            }}
          />
        </>
      )}
    </div>
  );
}

function Stickers() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Sticker flag="indonesia" width={56} left={58} top={210} rotate={-8} lift="left" />
      <Sticker flag="azerbaijan" width={70} left={190} top={196} rotate={5} peel />
      <Sticker flag="uae" width={66} left={112} top={262} rotate={-3} />
    </div>
  );
}

function CoverInner() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[3px_10px_10px_3px] bg-[#f8f6f1] text-left">
      {/* Cloth weave */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(30,5,37,0.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(30,5,37,0.03) 0 1px, transparent 1px 3px)",
        }}
      />
      <Texture />
      <Stickers />

      {/* Title, debossed: a shadow above the letters, light below */}
      <div className="absolute left-7 top-8 right-7">
        <p className="font-geist text-[10px] font-medium uppercase leading-none tracking-[2px] text-grape/70">Field notes · Vol. 01</p>
        <p
          className="mt-3 font-heading text-[44px] leading-[0.95] tracking-[-1.6px] text-grape"
          style={{ textShadow: "0 -1px 0 rgba(30,5,37,0.18), 0 1px 0 rgba(255,255,255,0.9)" }}
        >
          Itinerary
        </p>
        <div className="mt-4 flex items-center gap-2 font-geist text-[10px] font-medium uppercase leading-none tracking-[1.6px] text-grape/80">
          <span>4 trips</span>
          <span className="h-px w-4 bg-grape/40" />
          <span>2023–2026</span>
        </div>
      </div>

      {/* Spine: the hinge groove, and the board rounding into it */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[18px]" style={{ background: "linear-gradient(to right, rgba(30,5,37,0.16), rgba(30,5,37,0.04) 40%, rgba(255,255,255,0.5) 62%, rgba(30,5,37,0.06) 72%, transparent)" }} />
      {/* Light falling across the board from the top left */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 40%, rgba(30,5,37,0.06) 100%)" }} />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(30,5,37,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]" />
    </div>
  );
}
export const Cover = memo(CoverInner);

/** The page block that shows round a closed book */
export function ClosedEdges() {
  return (
    <>
      {/* Page block: the stack of pages, visible along the fore-edge and the bottom */}
      <div
        className="absolute bottom-[3px] right-[-5px] top-[5px] w-[8px] rounded-r-[4px]"
        style={{ background: "repeating-linear-gradient(90deg, #f3efe6 0 1px, #e2dccf 1px 2px)", boxShadow: "1px 1px 2px rgba(30,5,37,0.18)" }}
      />
      <div
        className="absolute bottom-[-5px] left-[4px] right-[-3px] h-[7px] rounded-b-[4px]"
        style={{ background: "repeating-linear-gradient(0deg, #f3efe6 0 1px, #e2dccf 1px 2px)", boxShadow: "1px 2px 3px rgba(30,5,37,0.18)" }}
      />
    </>
  );
}
