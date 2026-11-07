// A cream lace frame with a thin wood edge, drawn on a 320×420 board. The opening
// (where the picture shows) is FRAME.open; everything outside it is the frame.

export const FRAME = {
  w: 320,
  h: 420,
  open: [44, 44, 276, 376] as const, // x0, y0, x1, y1
  wood: 36, // the wood edge runs from here in to the opening
  lace: 12, // the lace body starts here (scallops reach out past it to 4)
};

const { w: W, h: H, wood: WOOD, lace: L } = FRAME;

// Scallops all the way round, clockwise, each bulging outwards
function scallops() {
  const sides: [number, number, number, number][] = [
    [L, L, W - L, L],
    [W - L, L, W - L, H - L],
    [W - L, H - L, L, H - L],
    [L, H - L, L, L],
  ];
  let d = `M${L} ${L}`;
  for (const [x0, y0, x1, y1] of sides) {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const count = Math.round(len / 16);
    const r = len / count / 2;
    for (let i = 1; i <= count; i++) {
      const x = x0 + ((x1 - x0) * i) / count;
      const y = y0 + ((y1 - y0) * i) / count;
      d += ` A${r} ${r} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  return d + " Z";
}

// Points evenly round a rectangle inset from the board's edge
function ring(inset: number, step: number) {
  const pts: [number, number][] = [];
  const x0 = inset;
  const y0 = inset;
  const x1 = W - inset;
  const y1 = H - inset;
  const nx = Math.round((x1 - x0) / step);
  const ny = Math.round((y1 - y0) / step);
  for (let i = 0; i < nx; i++) pts.push([x0 + ((x1 - x0) * i) / nx, y0], [x1 - ((x1 - x0) * i) / nx, y1]);
  for (let i = 0; i < ny; i++) pts.push([x1, y0 + ((y1 - y0) * i) / ny], [x0, y1 - ((y1 - y0) * i) / ny]);
  return pts;
}

const SCALLOPS = scallops();
const BEADS = ring(L + 2, 16);
const EYELETS = ring(22, 10);
const SEEDS = ring(30, 6);
const CORNERS: [number, number][] = [
  [24, 24],
  [W - 24, 24],
  [W - 24, H - 24],
  [24, H - 24],
];
const PETALS = Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3);
const rectPath = (i: number) => `M${i} ${i}H${W - i}V${H - i}H${i}Z`;
const openPath = `M${FRAME.open[0]} ${FRAME.open[1]}H${FRAME.open[2]}V${FRAME.open[3]}H${FRAME.open[0]}Z`;

export default function LaceFrame({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lf-lace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf6ec" />
          <stop offset="1" stopColor="#ecdfc8" />
        </linearGradient>
        <linearGradient id="lf-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c99a68" />
          <stop offset="0.5" stopColor="#a8784a" />
          <stop offset="1" stopColor="#8a5d36" />
        </linearGradient>
        <radialGradient id="lf-pearl" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f3ece0" />
          <stop offset="1" stopColor="#d8c9b0" />
        </radialGradient>
      </defs>

      {/* Lace body, with the opening cut out */}
      <path d={`${SCALLOPS} ${rectPath(WOOD)}`} fillRule="evenodd" fill="url(#lf-lace)" stroke="#e2d3ba" strokeWidth="0.8" />

      {/* Eyelets and seed stitches */}
      {EYELETS.map(([x, y], i) => (
        <circle key={`e${i}`} cx={x} cy={y} r="2.4" fill="#dccbb0" stroke="#efe4d2" strokeWidth="0.6" />
      ))}
      {SEEDS.map(([x, y], i) => (
        <circle key={`s${i}`} cx={x} cy={y} r="0.9" fill="#d6c4a6" />
      ))}
      <path d={rectPath(16)} fill="none" stroke="#e0cfb3" strokeWidth="0.6" strokeDasharray="1.5 2" />
      <path d={rectPath(33)} fill="none" stroke="#dcc9ab" strokeWidth="0.6" strokeDasharray="2 1.6" />

      {/* Pearls along the scalloped edge */}
      {BEADS.map(([x, y], i) => (
        <circle key={`b${i}`} cx={x} cy={y} r="2.6" fill="url(#lf-pearl)" stroke="#d9c8ad" strokeWidth="0.4" />
      ))}

      {/* A rosette in each corner */}
      {CORNERS.map(([cx, cy], i) => (
        <g key={`c${i}`}>
          {PETALS.map((a, j) => (
            <circle
              key={j}
              cx={cx + Math.cos(a) * 5.4}
              cy={cy + Math.sin(a) * 5.4}
              r="3.6"
              fill="url(#lf-pearl)"
              stroke="#d6c3a5"
              strokeWidth="0.5"
            />
          ))}
          <circle cx={cx} cy={cy} r="3" fill="#e6d6bb" stroke="#cdb894" strokeWidth="0.5" />
        </g>
      ))}

      {/* The thin wood edge round the opening */}
      <path d={`${rectPath(WOOD)} ${openPath}`} fillRule="evenodd" fill="url(#lf-wood)" />
      <path d={rectPath(WOOD)} fill="none" stroke="#6f4a2a" strokeOpacity="0.35" strokeWidth="0.6" />
      <path d={openPath} fill="none" stroke="#5a3a1f" strokeOpacity="0.6" strokeWidth="0.8" />
    </svg>
  );
}
