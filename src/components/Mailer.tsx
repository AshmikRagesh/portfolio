// ── Mailer ────────────────────────────────────────────────────────────────────
// A kraft mailer with a couple of sheets tucked in, printed on the front. Two tones,
// every colour a token from the design system: pink printed in blackcurrant, and
// grape printed in grape-light. The paper's form comes from the crumple lighting,
// not from shading the colour.
// It's a stack of layers, back to front:
//
//   back    the mailer's back panel. It runs a little lower and a touch wider than
//           the front, and ends in a heat-sealed, crinkled band.
//   sheets  two sheets of white paper, sitting inside and peeking out under the
//           front panel's edge. On hover (.group) they slide a little further out.
//   front   the front panel: crumpled paper (lit by an SVG lighting filter), two soft
//           fold lines across it, a crimped seal along the top with a crushed corner,
//           a glued seam down the left. Its edge casts a shadow onto the sheets.
//   print   real text in the tone's ink.
//
// Paint is defined once by <MailerDefs /> — one crumple filter per seed, so no two
// mailers crease the same way. The front sheet takes a ref so TasteNotes can pull it
// out of the mailer when the note opens.

export const MAILER_SEEDS = [3, 11];

// Each tone: front/back kraft gradients, the crushed corner, crease shadow + highlight,
// edge grime, and the ink it's printed in
export const TONES = {
  pink: { front: "mailer-kraft-pink", back: "mailer-kraft-pink-back", corner: "#f8c2f7", shade: "#1e0525", light: "#F9E4FF", grime: "#9D136A", ink: "#32073e", blend: "mix-blend-multiply" },
  grape: { front: "mailer-kraft-grape", back: "mailer-kraft-grape-back", corner: "#9D136A", shade: "#1e0525", light: "#f8c2f7", grime: "#32073e", ink: "#F9E4FF", blend: "" },
} as const;
export type Tone = keyof typeof TONES;
// Front panel outline (in the 300×430 box)
const FRONT = "M5 7 L284 3 Q292 3 293 10 L295 344 Q150 352 6 347 Z";

export function MailerDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        {/* Pink kraft — front in pink, the back panel behind it in grape */}
        <linearGradient id="mailer-kraft-pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8c2f7" />
          <stop offset="1" stopColor="#f8c2f7" />
        </linearGradient>
        <linearGradient id="mailer-kraft-pink-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9D136A" />
          <stop offset="1" stopColor="#9D136A" />
        </linearGradient>
        {/* Grape kraft — front in grape, the back panel behind it in blackcurrant */}
        <linearGradient id="mailer-kraft-grape" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9D136A" />
          <stop offset="1" stopColor="#9D136A" />
        </linearGradient>
        <linearGradient id="mailer-kraft-grape-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#32073e" />
          <stop offset="1" stopColor="#32073e" />
        </linearGradient>

        {MAILER_SEEDS.map((seed) => (
          // Crumpled paper: sharp-valleyed noise read as a height map, lit from the
          // upper left, multiplied back onto the kraft colour.
          <filter key={seed} id={`mailer-crumple-${seed}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed={seed} result="facets" />
            <feTurbulence type="turbulence" baseFrequency="0.016 0.022" numOctaves="4" seed={seed + 7} result="creases" />
            <feComposite in="facets" in2="creases" operator="arithmetic" k2="0.7" k3="0.55" result="height" />
            <feDiffuseLighting in="height" surfaceScale="2.6" diffuseConstant="1" lightingColor="#ffffff" result="light">
              <feDistantLight azimuth="225" elevation="60" />
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="1.1" k2="0.1" result="lit" />
            <feComposite in="lit" in2="SourceGraphic" operator="in" />
          </filter>
        ))}

        {/* Ink that didn't take evenly */}
        <filter id="mailer-ink" x="-2%" y="-10%" width="104%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" />
        </filter>
        <clipPath id="mailer-front-clip">
          <path d={FRONT} />
        </clipPath>
        <filter id="mailer-edge" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="mailer-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>
    </svg>
  );
}

// Crimp marks: short vertical ridges along a heat seal
function Crimp({ x1, x2, y, h, shade, light }: { x1: number; x2: number; y: number; h: number; shade: string; light: string }) {
  const lines = [];
  for (let x = x1; x < x2; x += 2.6) lines.push(`M${x.toFixed(1)} ${y}v${h}`);
  return (
    <>
      <path d={lines.join("")} stroke={shade} strokeOpacity="0.16" strokeWidth="0.9" />
      <path d={lines.join("")} transform="translate(1 0)" stroke={light} strokeOpacity="0.22" strokeWidth="0.6" />
    </>
  );
}

export default function Mailer({
  seed,
  tone = "pink",
  sheetRef,
  title,
  summary,
  date,
  readTime,
}: {
  seed: number;
  tone?: Tone;
  sheetRef?: React.Ref<HTMLDivElement>;
  title: string;
  summary: string;
  date: string;
  readTime: string;
}) {
  const crumple = `url(#mailer-crumple-${seed})`;
  const t = TONES[tone];

  return (
    <div className="relative aspect-[300/430] w-full [filter:drop-shadow(0_2px_2px_rgba(30,5,37,0.22))_drop-shadow(0_18px_22px_rgba(30,5,37,0.16))]">
      {/* Back panel — shows below the front, and flares a touch at the bottom */}
      <svg viewBox="0 0 300 430" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
        <path d="M8 300 H292 L297 412 Q298 428 284 428 L16 429 Q2 429 3 414 Z" fill={`url(#${t.back})`} filter={crumple} />
        {/* Heat-sealed bottom band, crinkled at the corners */}
        <path d="M5 408 Q150 404 296 408" fill="none" stroke={t.shade} strokeOpacity="0.2" strokeWidth="0.8" />
        <Crimp x1={10} x2={290} y={410} h={15} shade={t.shade} light={t.light} />
        <path d="M6 418 q4 -6 2 -14M294 418 q-4 -6 -2 -14" fill="none" stroke={t.shade} strokeOpacity="0.25" strokeWidth="0.8" />
      </svg>

      {/* Sheets inside — slide further out on hover */}
      <div
        aria-hidden="true"
        className="absolute left-[9%] top-[58%] h-[35%] w-[81%] rotate-[1.4deg] rounded-[2px] bg-[linear-gradient(170deg,#ffffff,#f1f1ee)] shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[26%] group-hover:rotate-[3deg] group-focus-visible:translate-y-[26%] motion-reduce:transition-none"
      />
      <div
        ref={sheetRef}
        aria-hidden="true"
        className="absolute left-[11%] top-[56%] h-[34%] w-[77%] -rotate-[0.6deg] rounded-[3px] bg-[linear-gradient(175deg,#ffffff,#f6f6f4)] shadow-[0_1px_2px_rgba(0,0,0,0.16),inset_0_0_0_1px_rgba(0,0,0,0.04)] transition-transform delay-[40ms] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-[2deg] group-hover:translate-y-[38%] group-focus-visible:translate-y-[38%] motion-reduce:transition-none"
      />

      {/* Front panel */}
      <svg
        viewBox="0 0 300 430"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible [filter:drop-shadow(0_3px_3px_rgba(30,5,37,0.28))]"
      >
        <path d={FRONT} fill={`url(#${t.front})`} filter={crumple} />
        {/* Edges darker and grimier than the middle, from handling */}
        <g clipPath="url(#mailer-front-clip)">
          <path d={FRONT} fill="none" stroke={t.grime} strokeOpacity="0.3" strokeWidth="14" filter="url(#mailer-edge)" />
        </g>
        {/* Crimped seal along the top + its fold line */}
        <Crimp x1={9} x2={284} y={5} h={18} shade={t.shade} light={t.light} />
        <path d="M6 24 Q150 21 294 24" fill="none" stroke={t.shade} strokeOpacity="0.22" strokeWidth="0.9" />
        <path d="M6 25.4 Q150 22.4 294 25.4" fill="none" stroke={t.light} strokeOpacity="0.45" strokeWidth="0.7" />
        {/* Crushed top-right corner */}
        <path d="M280 3 L298 2 L299 26 L291 22 Q287 12 280 3 Z" fill={t.corner} filter={crumple} />
        <path d="M281 4 Q288 12 291 22" fill="none" stroke={t.shade} strokeOpacity="0.3" strokeWidth="0.8" />
        {/* Glued seam down the left side */}
        <path d="M15 26 Q13 190 16 344" fill="none" stroke={t.shade} strokeOpacity="0.14" strokeWidth="1" />
        <path d="M16.4 26 Q14.4 190 17.4 344" fill="none" stroke={t.light} strokeOpacity="0.4" strokeWidth="0.6" />
        {/* Two soft folds across, from being bent in the post */}
        <g filter="url(#mailer-soft)">
          <path d="M6 176 Q80 172 150 177 T294 173" fill="none" stroke={t.shade} strokeOpacity="0.22" strokeWidth="1.6" />
          <path d="M6 252 Q100 256 180 250 T294 254" fill="none" stroke={t.shade} strokeOpacity="0.18" strokeWidth="1.6" />
        </g>
        <path d="M6 178.4 Q80 174.4 150 179.4 T294 175.4" fill="none" stroke={t.light} strokeOpacity="0.5" strokeWidth="1" />
        <path d="M6 254.4 Q100 258.4 180 252.4 T294 256.4" fill="none" stroke={t.light} strokeOpacity="0.42" strokeWidth="1" />
        {/* Lower edge: slightly rolled, catching a little light */}
        <path d="M7 345 Q150 350 294 342" fill="none" stroke={t.light} strokeOpacity="0.5" strokeWidth="0.8" />
      </svg>

      {/* Print */}
      <div className={`absolute inset-x-[9%] bottom-[23%] top-[10%] flex flex-col ${t.blend} [filter:url(#mailer-ink)]`} style={{ color: t.ink }}>
        <span className="font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-[24px] font-bold uppercase leading-[24px] tracking-[-0.6px]">{title}</span>
        <span className="mt-2 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-[13px] leading-[18px] opacity-90">{summary}</span>
        <span className="mt-auto flex items-baseline justify-between font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-[11px] uppercase leading-[14px] tracking-[1px] opacity-90">
          <span>{date}</span>
          <span>{readTime}</span>
        </span>
      </div>
    </div>
  );
}
