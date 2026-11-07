// A gallery frame on a 320×420 board: lacquered blackcurrant wood with mitred corners and
// real grain, a thin grape liner, and a vanilla paper mat with a bevelled window. Light
// comes from the top left. FRAME.open is the window the picture shows through.

export const FRAME = {
  w: 320,
  h: 420,
  open: [56, 56, 264, 350] as const, // x0, y0, x1, y1 — the bottom of the mat is a little deeper
  edge: 2, // the frame's face starts this far in from the board's edge
};

const W = FRAME.w;
const H = FRAME.h;
const M = 26; // moulding width
const L = 29; // liner ends, mat begins
const [OX0, OY0, OX1, OY1] = FRAME.open;
const BV = 3; // bevel width

const poly = (pts: number[][]) => pts.map((p) => p.join(",")).join(" ");

// The four mitred lengths of moulding, each with the direction its profile runs (outer → inner)
const SIDES = [
  { id: "t", pts: [[0, 0], [W, 0], [W - M, M], [M, M]], from: [0, 0], to: [0, M], light: "rgba(255,255,255,0.07)", grain: "h" },
  { id: "l", pts: [[0, 0], [M, M], [M, H - M], [0, H]], from: [0, 0], to: [M, 0], light: "rgba(255,255,255,0.03)", grain: "v" },
  { id: "r", pts: [[W, 0], [W, H], [W - M, H - M], [W - M, M]], from: [W, 0], to: [W - M, 0], light: "rgba(10,0,14,0.2)", grain: "v" },
  { id: "b", pts: [[0, H], [M, H - M], [W - M, H - M], [W, H]], from: [0, H], to: [0, H - M], light: "rgba(10,0,14,0.3)", grain: "h" },
] as const;

// The moulding's profile, outer edge to inner edge: rounded outer bead, flat face, a cove,
// and a small inner bead that catches the light
const PROFILE: [number, string][] = [
  [0, "#14021a"],
  [0.05, "#4a1458"],
  [0.11, "#6b2a7c"],
  [0.2, "#3f0a4d"],
  [0.46, "#32073e"],
  [0.6, "#2a0534"],
  [0.7, "#1c0323"],
  [0.8, "#5c2069"],
  [0.86, "#7a3a8a"],
  [0.93, "#3a0846"],
  [1, "#12011a"],
];

const BEVELS = [
  { pts: [[OX0 - BV, OY0 - BV], [OX1 + BV, OY0 - BV], [OX1, OY0], [OX0, OY0]], fill: "#d6cdbf" }, // top: faces down, in shade
  { pts: [[OX0 - BV, OY0 - BV], [OX0, OY0], [OX0, OY1], [OX0 - BV, OY1 + BV]], fill: "#e3dbcf" },
  { pts: [[OX1 + BV, OY0 - BV], [OX1 + BV, OY1 + BV], [OX1, OY1], [OX1, OY0]], fill: "#faf6ef" },
  { pts: [[OX0 - BV, OY1 + BV], [OX0, OY1], [OX1, OY1], [OX1 + BV, OY1 + BV]], fill: "#fffcf6" }, // bottom: faces up, lit
];

const rectPath = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;

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
            <polygon points={poly(s.pts as unknown as number[][])} />
          </clipPath>
        ))}

        {/* Wood grain: long streaks of noise, along the length of each piece */}
        {(["h", "v"] as const).map((d) => (
          <filter key={d} id={`pf-grain-${d}`} x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency={d === "h" ? "0.006 0.42" : "0.42 0.006"} numOctaves="4" seed={d === "h" ? 4 : 9} />
            <feColorMatrix values="0 0 0 0 0.03  0 0 0 0 0  0 0 0 0 0.05  2.6 0 0 0 -1" />
          </filter>
        ))}
        {/* …and lighter streaks between them, where the lacquer catches the figure */}
        {(["h", "v"] as const).map((d) => (
          <filter key={d} id={`pf-figure-${d}`} x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency={d === "h" ? "0.012 0.6" : "0.6 0.012"} numOctaves="3" seed={d === "h" ? 11 : 13} />
            <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.36  0 0 0 0 0.7  2.8 0 0 0 -1.22" />
          </filter>
        ))}
        {/* Fine pores in the lacquer */}
        <filter id="pf-pores" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="2" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 1  0 0 0 -2.2 1.12" />
        </filter>
        {/* Mat board: soft cotton paper */}
        <filter id="pf-paper" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 -1.3 0.72" />
        </filter>
        <filter id="pf-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <filter id="pf-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" />
        </filter>

        <linearGradient id="pf-liner-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b3307f" />
          <stop offset="0.45" stopColor="#9D136A" />
          <stop offset="1" stopColor="#5e0a3f" />
        </linearGradient>
        <linearGradient id="pf-mat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3eee5" />
          <stop offset="1" stopColor="#e9e1d3" />
        </linearGradient>
        <mask id="pf-mat-mask">
          <path d={`${rectPath(L, L, W - L, H - L)} ${rectPath(OX0 - BV, OY0 - BV, OX1 + BV, OY1 + BV)}`} fillRule="evenodd" fill="#fff" />
        </mask>
      </defs>

      {/* ── Mat ── */}
      <g mask="url(#pf-mat-mask)">
        <rect x={L} y={L} width={W - 2 * L} height={H - 2 * L} fill="url(#pf-mat)" />
        <rect x={L} y={L} width={W - 2 * L} height={H - 2 * L} filter="url(#pf-paper)" opacity="0.22" />
        {/* the moulding's shadow falling across the mat, deepest at the top and left */}
        <path
          d={`${rectPath(L - 6, L - 6, W - L + 6, H - L + 6)} ${rectPath(L + 3, L + 4, W - L - 1, H - L - 1)}`}
          fillRule="evenodd"
          fill="rgba(30,5,37,0.45)"
          filter="url(#pf-shadow)"
        />
      </g>

      {/* Bevel cut, its white core showing */}
      {BEVELS.map((b, i) => (
        <polygon key={i} points={poly(b.pts)} fill={b.fill} />
      ))}
      <path d={rectPath(OX0, OY0, OX1, OY1)} fill="none" stroke="rgba(40,20,30,0.28)" strokeWidth="0.5" />

      {/* ── Liner: a thin grape lacquer between the wood and the mat ── */}
      <path d={`${rectPath(M, M, W - M, H - M)} ${rectPath(L, L, W - L, H - L)}`} fillRule="evenodd" fill="url(#pf-liner-h)" />
      <path d={rectPath(L, L, W - L, H - L)} fill="none" stroke="rgba(20,0,20,0.45)" strokeWidth="0.5" />
      <path d={`M${M + 1} ${H - M - 1}V${M + 1}H${W - M - 1}`} fill="none" stroke="rgba(255,220,240,0.55)" strokeWidth="0.6" />

      {/* ── Moulding ── */}
      {SIDES.map((s) => (
        <g key={s.id} clipPath={`url(#pf-clip-${s.id})`}>
          <rect width={W} height={H} fill={`url(#pf-prof-${s.id})`} />
          <rect width={W} height={H} filter={`url(#pf-grain-${s.grain})`} opacity="0.9" />
          <rect width={W} height={H} filter={`url(#pf-figure-${s.grain})`} opacity="0.35" />
          <rect width={W} height={H} filter="url(#pf-pores)" opacity="0.05" />
          <rect width={W} height={H} fill={s.light} />
        </g>
      ))}

      {/* Lacquer sheen along the two beads, brightest where the light hits */}
      <g filter="url(#pf-soft)" fill="none" strokeLinecap="round">
        <path d={`M2.6 ${H - 8}V2.6H${W - 8}`} stroke="rgba(255,235,255,0.5)" strokeWidth="0.9" />
        <path d={`M${M - 3.6} ${H - M - 2}V${M - 3.6}H${W - M - 2}`} stroke="rgba(255,235,255,0.42)" strokeWidth="0.8" />
        <path d={`M${W - 2.6} 8V${H - 2.6}H8`} stroke="rgba(255,235,255,0.1)" strokeWidth="0.8" />
      </g>

      {/* Mitre joints */}
      <g strokeWidth="0.6">
        {[
          [0, 0, M, M],
          [W, 0, W - M, M],
          [0, H, M, H - M],
          [W, H, W - M, H - M],
        ].map(([x0, y0, x1, y1], i) => (
          <g key={i}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(8,0,10,0.75)" />
            <line x1={x0 + 0.6} y1={y0} x2={x1 + 0.6} y2={y1} stroke="rgba(255,220,255,0.12)" />
          </g>
        ))}
      </g>
      <path d={rectPath(0.3, 0.3, W - 0.3, H - 0.3)} fill="none" stroke="rgba(8,0,10,0.6)" strokeWidth="0.6" />
    </svg>
  );
}
