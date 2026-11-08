// ── The cover ─────────────────────────────────────────────────────────────────
// After the reference's itinerary booklet: an off-white cloth board with the title set
// top left, and a picture that fades up into the board from the bottom edge. Here the
// picture is a variegated pixel texture in the brand ramp (squares that grow and shrink
// with a slow noise field, densest at the bottom, thinning out as they rise), not a
// photo. The spine has its hinge groove,
// and the title is debossed into the cloth.
//
// Flag stickers for the four trips are stuck across the board, like ones picked up on
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
  india: {
    label: "India",
    ratio: 1.5,
    art: (
      <svg viewBox="0 0 900 600" className="block h-full w-full">
        <rect width="900" height="200" fill="#FF9933" />
        <rect y="200" width="900" height="200" fill="#fff" />
        <rect y="400" width="900" height="200" fill="#138808" />
        <g transform="translate(450 300)" stroke="#000080" fill="none">
          <circle r="85" strokeWidth="14" />
          <circle r="15" fill="#000080" stroke="none" />
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1="0" y1="0" x2="0" y2="-80" strokeWidth="5" transform={`rotate(${i * 15})`} />
          ))}
        </g>
      </svg>
    ),
  },
} as const;

type FlagKey = keyof typeof FLAGS;

function Sticker({ flag, width, left, top, rotate, peel = false }: { flag: FlagKey; width: number; left: number; top: number; rotate: number; peel?: boolean }) {
  const f = FLAGS[flag];
  const EDGE = 5; // the white die-cut margin
  const w = width;
  const h = Math.round((width - EDGE * 2) / f.ratio + EDGE * 2);
  const P = 14; // how far the peeled corner has lifted
  const cut = peel ? `polygon(0 0, 100% 0, 100% calc(100% - ${P}px), calc(100% - ${P}px) 100%, 0 100%)` : undefined;
  return (
    <div className="absolute" style={{ left, top, width: w, height: h, transform: `rotate(${rotate}deg)` }} role="img" aria-label={`${f.label} flag sticker`}>
      {/* The shadow, on its own layer so it follows the cut corner */}
      <div className="absolute inset-0 rounded-[5px] bg-[#1e0525]/30 blur-[1.5px]" style={{ transform: "translate(0.6px, 1.4px)", clipPath: cut }} />
      <div className="absolute inset-0 overflow-hidden rounded-[5px] bg-white" style={{ clipPath: cut, boxShadow: "inset 0 0 0 0.5px rgba(30,5,37,0.12)" }}>
        <div className="absolute overflow-hidden rounded-[2px]" style={{ inset: EDGE, boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)" }}>
          {f.art}
        </div>
        {/* Vinyl: a broad sheen across the top left and a faint one low on the right */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(118deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0) 46%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.18) 100%)" }} />
        {/* The edge catches the light on top and sinks into the cloth below */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(30,5,37,0.08)" }} />
      </div>
      {/* The peeled corner: the sticker's paper back, folded over, with its own shadow */}
      {peel && (
        <div
          className="absolute"
          style={{
            right: 0,
            bottom: 0,
            width: P,
            height: P,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            background: "linear-gradient(135deg, #e9e4da 0%, #fbfaf6 55%, #d9d2c4 100%)",
            filter: "drop-shadow(-0.5px -0.5px 0.6px rgba(30,5,37,0.3))",
          }}
        />
      )}
    </div>
  );
}

function Stickers() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Sticker flag="india" width={78} left={30} top={214} rotate={-9} />
      <Sticker flag="indonesia" width={70} left={120} top={182} rotate={6} />
      <Sticker flag="azerbaijan" width={92} left={196} top={226} rotate={-4} peel />
      <Sticker flag="uae" width={88} left={96} top={286} rotate={8} />
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
