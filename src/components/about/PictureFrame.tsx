// A pale oak frame on a 320×416 board: a softly rounded moulding with real grain and
// mitred corners, and a thin walnut lip round the picture. No mat — the picture fills the
// frame. Light comes from the top left. FRAME.open is the window the picture shows through.

export const FRAME = {
  w: 320,
  h: 416,
  open: [38, 38, 282, 378] as const, // x0, y0, x1, y1
  edge: 1, // the frame's face starts this far in from the board's edge
};

const W = FRAME.w;
const H = FRAME.h;
const M = FRAME.open[0]; // moulding width, lip included

const poly = (pts: readonly (readonly number[])[]) => pts.map((p) => p.join(",")).join(" ");

// The four mitred lengths, each with the direction its profile runs (outer edge → picture)
const SIDES = [
  { id: "t", pts: [[0, 0], [W, 0], [W - M, M], [M, M]], from: [0, 0], to: [0, M], tint: "rgba(255,250,240,0.1)", grain: "h" },
  { id: "l", pts: [[0, 0], [M, M], [M, H - M], [0, H]], from: [0, 0], to: [M, 0], tint: "rgba(255,250,240,0.04)", grain: "v" },
  { id: "r", pts: [[W, 0], [W, H], [W - M, H - M], [W - M, M]], from: [W, 0], to: [W - M, 0], tint: "rgba(60,35,15,0.12)", grain: "v" },
  { id: "b", pts: [[0, H], [M, H - M], [W - M, H - M], [W, H]], from: [0, H], to: [0, H - M], tint: "rgba(60,35,15,0.2)", grain: "h" },
] as const;

// Outer edge, a rounded bead that catches the light, a broad face, a soft cove, a small
// step — then the thin walnut lip at the picture
const PROFILE: [number, string][] = [
  [0, "#7a5a38"],
  [0.03, "#c49e6c"],
  [0.09, "#f3dbb2"],
  [0.17, "#e3bf8c"],
  [0.42, "#d7b07b"],
  [0.6, "#c99d67"],
  [0.7, "#b68a55"],
  [0.78, "#dfb986"],
  [0.84, "#c69a63"],
  [0.87, "#4a2f19"],
  [0.92, "#7b5333"],
  [0.96, "#5b3b21"],
  [1, "#241508"],
];

export default function PictureFrame({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      <defs>
        {SIDES.map((s) => (
          <linearGradient key={s.id} id={`pf-prof-${s.id}`} gradientUnits="userSpaceOnUse" x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]}>
            {PROFILE.map(([o, c]) => (
              <stop key={o} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        ))}
        {SIDES.map((s) => (
          <clipPath key={s.id} id={`pf-clip-${s.id}`}>
            <polygon points={poly(s.pts)} />
          </clipPath>
        ))}

        {/* Oak grain: long dark streaks along each length… */}
        {(["h", "v"] as const).map((d) => (
          <filter key={d} id={`pf-grain-${d}`} x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency={d === "h" ? "0.004 0.14" : "0.14 0.004"} numOctaves="5" seed={d === "h" ? 4 : 9} result="lines" />
            {/* the grain wanders, the way real wood does */}
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={d === "h" ? 5 : 6} result="wander" />
            <feDisplacementMap in="lines" in2="wander" scale="9" xChannelSelector="R" yChannelSelector="G" result="grain" />
            <feColorMatrix in="grain" values="0 0 0 0 0.4  0 0 0 0 0.24  0 0 0 0 0.1  3.2 0 0 0 -1.34" />
          </filter>
        ))}
        {/* …pale ray flecks between them… */}
        {(["h", "v"] as const).map((d) => (
          <filter key={d} id={`pf-figure-${d}`} x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency={d === "h" ? "0.02 0.5" : "0.5 0.02"} numOctaves="3" seed={d === "h" ? 11 : 13} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.84  3 0 0 0 -1.5" />
          </filter>
        ))}
        {/* …and open pores */}
        <filter id="pf-pores" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="2" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.18  0 0 0 0 0.08  3 0 0 0 -1.9" />
        </filter>
        <filter id="pf-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* ── Moulding ── */}
      {SIDES.map((s) => (
        <g key={s.id} clipPath={`url(#pf-clip-${s.id})`}>
          <rect width={W} height={H} fill={`url(#pf-prof-${s.id})`} />
          <rect width={W} height={H} filter={`url(#pf-grain-${s.grain})`} opacity="0.75" />
          <rect width={W} height={H} filter={`url(#pf-figure-${s.grain})`} opacity="0.28" />
          <rect width={W} height={H} filter="url(#pf-pores)" opacity="0.35" />
          <rect width={W} height={H} fill={s.tint} />
        </g>
      ))}

      {/* Satin sheen along the outer bead and the step, brightest at the top and left */}
      <g filter="url(#pf-soft)" fill="none" strokeLinecap="round">
        <path d={`M3.2 ${H - 10}V3.2H${W - 10}`} stroke="rgba(255,248,232,0.75)" strokeWidth="1.1" />
        <path d={`M${M * 0.78} ${H - M - 4}V${M * 0.78}H${W - M - 4}`} stroke="rgba(255,246,228,0.5)" strokeWidth="0.9" />
        <path d={`M${W - 3.2} 10V${H - 3.2}H10`} stroke="rgba(255,240,220,0.18)" strokeWidth="0.9" />
      </g>
      {/* the walnut lip's little highlight */}
      <path d={`M${M - 2.4} ${H - M + 1}V${M - 2.4}H${W - M + 1}`} fill="none" stroke="rgba(255,225,190,0.35)" strokeWidth="0.5" />

      {/* Mitre joints */}
      {[
        [0, 0, M, M],
        [W, 0, W - M, M],
        [0, H, M, H - M],
        [W, H, W - M, H - M],
      ].map(([x0, y0, x1, y1], i) => (
        <g key={i} strokeWidth="0.5">
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(50,28,10,0.55)" />
          <line x1={x0 + 0.5} y1={y0} x2={x1 + 0.5} y2={y1} stroke="rgba(255,240,215,0.35)" />
        </g>
      ))}
      <rect x="0.25" y="0.25" width={W - 0.5} height={H - 0.5} fill="none" stroke="rgba(60,36,14,0.55)" strokeWidth="0.5" />
    </svg>
  );
}
