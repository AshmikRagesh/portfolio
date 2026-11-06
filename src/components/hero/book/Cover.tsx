// ── The cover ─────────────────────────────────────────────────────────────────
// After the reference's itinerary booklet: an off-white cloth board with the title set
// top left, and a picture that fades up into the board from the bottom edge. Here the
// picture is a variegated pixel texture in the brand ramp (squares that grow and shrink
// with a slow noise field, densest at the bottom, thinning out as they rise), not a
// photo. A grape ribbon marker hangs out of the bottom, the spine has its hinge groove,
// and the title is debossed into the cloth.

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

function CoverInner() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[3px_10px_10px_3px] bg-[#f8f6f1]">
      {/* Cloth weave */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(30,5,37,0.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(30,5,37,0.03) 0 1px, transparent 1px 3px)",
        }}
      />
      <Texture />

      {/* Title, debossed: a shadow above the letters, light below */}
      <div className="absolute left-7 top-8 right-7">
        <p className="font-brand text-[10px] uppercase leading-none tracking-[2.4px] text-grape/70">Field notes · Vol. 01</p>
        <p
          className="mt-3 font-heading text-[44px] leading-[0.95] tracking-[-1.6px] text-grape"
          style={{ textShadow: "0 -1px 0 rgba(30,5,37,0.18), 0 1px 0 rgba(255,255,255,0.9)" }}
        >
          Itinerary
        </p>
        <div className="mt-4 flex items-center gap-2 font-brand text-[10px] uppercase leading-none tracking-[2px] text-grape/80">
          <span>4 trips</span>
          <span className="h-px w-4 bg-grape/40" />
          <span>2024–2026</span>
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

/** The page block and ribbon that show round a closed book */
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
      {/* Ribbon marker */}
      <div className="absolute bottom-[-26px] left-[62%] h-[34px] w-[10px]" style={{ background: "linear-gradient(90deg, #7a0f55, #b8237f 45%, #9D136A)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)" }} />
    </>
  );
}
