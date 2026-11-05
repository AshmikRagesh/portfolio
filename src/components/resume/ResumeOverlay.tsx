"use client";

// ── Fancy paper ───────────────────────────────────────────────────────────────
// The résumé as a real sheet of paper. Clicking "Fancy paper" blurs the page, and a
// sheet folded in half rises into the middle of the screen and opens out, the top half
// swinging over on its crease. Two more sheets settle into a loose pile underneath, and
// a sticky note with a paperclip lands on the corner: "download a copy".
//
// Taking a copy folds the sheet back in half, then folds it into a paper plane that
// flies off to the corner of the browser where downloads appear, and the file
// downloads. Meanwhile the next copy on the pile comes into focus where it was.
//
// Motion: the sheet opens over 0.95s (after 0.4s) on an expo-out curve and refolds in
// 0.5s; the plane folds in 0.8s and flies for 0.85s, banking along its path as it
// climbs. Sounds are synthesised (paperSound.ts). With reduced motion the sheet simply
// fades in and the copy downloads straight away.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { celebrate } from "@/lib/bella/progress";
import { RESUME_FILENAME, RESUME_OPEN_EVENT, RESUME_PDF, resume, resumeSections, type ResumeEntry } from "@/lib/resume";
import { planeFoldSound, refoldSound, unfoldSound, whooshSound } from "./paperSound";

// ── Paper ─────────────────────────────────────────────────────────────────────

// A4 at 640px wide
const SHEET_W = 640;
const SHEET_H = Math.round((SHEET_W * 842) / 595);

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const REFOLD_EASE = "cubic-bezier(0.55, 0, 0.35, 1)";

const INK = "#33302a";
const MUTED = "#6d675c";
const FAINT = "#a39b8c";
const PAPER = "#f8f3e8";
const PAPER_BACK = "#f2ecdf";

// Fine grain, multiplied over the paper
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
// Edges a touch warmer and darker, the way real stock ages from the outside in
const EDGES = [
  "radial-gradient(ellipse 125% 100% at 50% 50%, transparent 66%, rgba(166,128,70,0.07) 88%, rgba(140,104,52,0.15) 100%)",
  "linear-gradient(to right, rgba(150,112,58,0.07), transparent 14px, transparent calc(100% - 14px), rgba(150,112,58,0.07))",
  "linear-gradient(to bottom, rgba(150,112,58,0.06), transparent 14px, transparent calc(100% - 14px), rgba(150,112,58,0.07))",
].join(", ");
// The crease across the middle: a shadow above, a catch of light just below
const CREASE =
  "linear-gradient(to bottom, transparent calc(50% - 40px), rgba(90,70,40,0.035) calc(50% - 2px), rgba(90,70,40,0.1) 50%, rgba(255,250,238,0.5) calc(50% + 1px), rgba(255,250,238,0) calc(50% + 3px), rgba(90,70,40,0.025) calc(50% + 24px), transparent calc(50% + 48px))";
const PAPER_STYLE: CSSProperties = {
  backgroundColor: PAPER,
  boxShadow: "0 1px 2px rgba(48,40,26,0.07), 0 10px 26px -10px rgba(48,40,26,0.17), 0 32px 64px -28px rgba(48,40,26,0.22)",
};

function Grain({ crease = true }: { crease?: boolean }) {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN, opacity: 0.08, mixBlendMode: "multiply" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: crease ? `${EDGES}, ${CREASE}` : EDGES }} />
    </>
  );
}

// **double stars** set a phrase in the darker ink
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") ? (
          <span key={i} style={{ color: INK }}>
            {part.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function EntryHead({ entry }: { entry: ResumeEntry }) {
  return (
    <div className="text-[11px] leading-[1.5]">
      <p style={{ color: INK }}>{entry.org}</p>
      {entry.role && <p style={{ color: INK }}>{entry.role}</p>}
      {entry.when && <p style={{ color: FAINT }}>{entry.when}</p>}
    </div>
  );
}

function Details({ entry }: { entry: ResumeEntry }) {
  return (
    <div className="flex flex-col gap-[5px] text-[10.5px] leading-[1.5]">
      {entry.detail.map((d, i) => (
        <p key={i}>
          <Rich text={d} />
        </p>
      ))}
    </div>
  );
}

const Contact = () => (
  <div className="flex flex-col items-start text-[11px] leading-[1.55]">
    <a href={`mailto:${resume.email}`} className="transition-colors hover:text-[#1f1d19]" style={{ color: INK }}>
      {resume.email}
    </a>
    <a href={resume.linkedin.href} target="_blank" rel="noopener noreferrer" className="underline decoration-[0.5px] underline-offset-2 transition-colors hover:text-[#1f1d19]">
      {resume.linkedin.label}
    </a>
  </div>
);

/** The sheet on a wide screen: an A4 page in three columns. */
function SheetWide() {
  return (
    <div className="relative font-geist" style={{ width: SHEET_W, height: SHEET_H, padding: "44px 46px", color: MUTED }}>
      <header className="grid grid-cols-[120px_144px_minmax(0,1fr)] gap-x-4 pb-6">
        <h2 className="whitespace-nowrap font-heading text-[17px] leading-tight tracking-[-0.03em]" style={{ color: INK }}>
          {resume.name}
        </h2>
        <div className="text-[11px] leading-[1.55]">
          <p style={{ color: INK }}>{resume.title}</p>
          <p>{resume.site}</p>
        </div>
        <Contact />
      </header>
      {resumeSections.map((section) => (
        <section key={section.label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 py-[19px]">
          <div role="heading" aria-level={3} className="pt-[2px] text-[9.5px] uppercase tracking-[0.08em]" style={{ color: FAINT }}>
            {section.label}
          </div>
          <div className="flex flex-col gap-[16px]">
            {section.entries.map((entry) => (
              <div key={entry.org} className="grid grid-cols-[144px_minmax(0,1fr)] gap-x-4">
                <EntryHead entry={entry} />
                <Details entry={entry} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** The sheet on a phone: one column, as long as it needs to be. */
function SheetNarrow() {
  return (
    <div className="relative font-geist" style={{ padding: "32px 24px 40px", color: MUTED }}>
      <header className="flex flex-col gap-3 pb-6">
        <h2 className="font-heading text-[20px] leading-tight tracking-[-0.03em]" style={{ color: INK }}>
          {resume.name}
        </h2>
        <div className="text-[11px] leading-[1.55]">
          <p style={{ color: INK }}>{resume.title}</p>
          <p>{resume.site}</p>
        </div>
        <Contact />
      </header>
      {resumeSections.map((section) => (
        <section key={section.label} className="flex flex-col gap-3 py-4">
          <div role="heading" aria-level={3} className="text-[9.5px] uppercase tracking-[0.08em]" style={{ color: FAINT }}>
            {section.label}
          </div>
          {section.entries.map((entry) => (
            <div key={entry.org} className="flex flex-col gap-2">
              <EntryHead entry={entry} />
              <Details entry={entry} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

// ── Backdrop and pile ─────────────────────────────────────────────────────────

/** The page behind, blurred more towards the edges so the sheet stays the focus. */
function Backdrop() {
  const vignette = (shape: string) => ({ maskImage: shape, WebkitMaskImage: shape });
  return (
    <>
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ background: "rgba(255,255,255,0.25)" }} />
      <div className="absolute inset-0 backdrop-blur-[7px]" style={vignette("radial-gradient(ellipse 62% 72% at 50% 50%, transparent 28%, black 78%)")} />
      <div className="absolute inset-0 backdrop-blur-[16px]" style={vignette("radial-gradient(ellipse 70% 80% at 50% 50%, transparent 52%, black 100%)")} />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 75% 85% at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.45) 70%, rgba(255,255,255,0.7) 100%)" }}
      />
    </>
  );
}

// Two more sheets, a little askew, settling under the top one
const PILE = [
  { rotate: -1.6, x: -7, y: 5, tint: "#f1ebdd", delay: 1 },
  { rotate: 1.1, x: 6, y: 3, tint: "#f4efe3", delay: 1.45 },
];
function Pile() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {PILE.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`,
            backgroundColor: s.tint,
            boxShadow: "0 1px 2px rgba(48,40,26,0.06), 0 8px 22px -12px rgba(48,40,26,0.18)",
            animation: `resume-focus-in 1.4s ${EASE} ${s.delay}s both`,
          }}
        >
          <Grain crease={false} />
        </div>
      ))}
    </div>
  );
}

// ── The next copy coming into focus ───────────────────────────────────────────
// Four stacked copies of the sheet, each masked to a band and blurred by a different
// amount, so the copy sharpens from the top down over 4.2s.

const FOCUS_MS = 4200;
const FOCUS_BLUR = [1.4, 2.6, 4, 5.6];
const FOCUS_STAGGER = 0.14;
const FOCUS_SPAN = 1 - FOCUS_STAGGER * 3;
const BAND = 22;
const FEATHER = 8;
const TOP = 82;

function bandMask(i: number) {
  const lo = TOP - (i - 1) * BAND;
  const hi = TOP - i * BAND;
  if (i === 0) return `linear-gradient(to bottom, transparent ${TOP - FEATHER}%, black ${TOP + FEATHER}%)`;
  if (i === FOCUS_BLUR.length - 1) return `linear-gradient(to bottom, black ${lo - FEATHER}%, transparent ${lo + FEATHER}%)`;
  return `linear-gradient(to bottom, transparent ${hi - FEATHER}%, black ${hi + FEATHER}%, black ${lo - FEATHER}%, transparent ${lo + FEATHER}%)`;
}
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const blurAt = (i: number, p: number) => {
  const o = Math.min(1, Math.max(0, (p - i * FOCUS_STAGGER) / FOCUS_SPAN));
  return `blur(${(FOCUS_BLUR[i] * (1 - easeInOutQuad(o))).toFixed(2)}px)`;
};

function NextCopy({ start, Sheet }: { start: number | null; Sheet: () => ReactNode }) {
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const set = (p: number) => layers.current.forEach((el, i) => el && (el.style.filter = blurAt(i, p)));
    if (start === null) return set(0);
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / FOCUS_MS);
      set(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [start]);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" style={PAPER_STYLE}>
      <Grain />
      {FOCUS_BLUR.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            layers.current[i] = el;
          }}
          className={i === 0 ? "relative" : "absolute inset-0"}
          style={{ maskImage: bandMask(i), WebkitMaskImage: bandMask(i), filter: blurAt(i, 0) }}
        >
          <Sheet />
        </div>
      ))}
    </div>
  );
}

// ── The fold ──────────────────────────────────────────────────────────────────
// The sheet folded in half: the bottom half lies flat, the top half is hinged on the
// crease and swings over it (or back), lifting the whole sheet a little while it's folded.

function Fold({ height, closing, onDone, Sheet }: { height: number; closing: boolean; onDone: () => void; Sheet: () => ReactNode }) {
  const lift = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  const half = height / 2;

  useLayoutEffect(() => {
    const folded = { lift: -half / 2, top: half, h: half, flap: -179 };
    const flat = { lift: 0, top: 0, h: height, flap: 0 };
    const [from, to] = closing ? [flat, folded] : [folded, flat];
    const timing: KeyframeAnimationOptions = closing
      ? { duration: 500, easing: REFOLD_EASE, fill: "both" }
      : { duration: 950, delay: 400, easing: EASE, fill: "both" };
    const anims = [
      lift.current?.animate([{ transform: `translateY(${from.lift}px)` }, { transform: `translateY(${to.lift}px)` }], timing),
      shadow.current?.animate([{ top: `${from.top}px`, height: `${from.h}px` }, { top: `${to.top}px`, height: `${to.h}px` }], timing),
      flap.current?.animate([{ transform: `rotateX(${from.flap}deg)` }, { transform: `rotateX(${to.flap}deg)` }], timing),
    ];
    anims[2]?.finished.then(() => done.current()).catch(() => {});
    return () => anims.forEach((a) => a?.cancel());
  }, [closing, height, half]);

  const face: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  const halfOf = (which: 0 | 1) => (
    <div className="absolute inset-0 overflow-hidden" style={{ ...face, ...PAPER_STYLE, boxShadow: "none" }}>
      <div className="absolute inset-x-0 top-0" style={{ height, transform: `translateY(${-which * half}px)` }}>
        <Grain />
        <Sheet />
      </div>
    </div>
  );

  return (
    <div ref={lift} aria-hidden="true" className="relative" style={{ height, perspective: 2000, transformStyle: "preserve-3d" }}>
      <div ref={shadow} className="absolute inset-x-0" style={{ ...PAPER_STYLE, backgroundColor: "transparent" }} />
      <div className="absolute inset-x-0" style={{ top: half, height: half }}>
        {halfOf(1)}
      </div>
      <div ref={flap} className="absolute inset-x-0" style={{ top: 0, height: half, transformOrigin: "50% 100%", transformStyle: "preserve-3d", zIndex: 2 }}>
        {halfOf(0)}
        {/* The back of the top half, seen while it's folded over */}
        <div className="absolute inset-0 overflow-hidden" style={{ ...face, transform: "rotateX(180deg)", background: `linear-gradient(to top, ${PAPER_BACK}, #ece4d4)` }}>
          <div className="absolute inset-0" style={{ backgroundImage: EDGES }} />
          <div className="absolute inset-0" style={{ backgroundImage: GRAIN, opacity: 0.08, mixBlendMode: "multiply" }} />
        </div>
      </div>
    </div>
  );
}

// ── The paper plane ───────────────────────────────────────────────────────────

type Pt = [number, number];
type Shape = [Pt, Pt, Pt, Pt];

/** Cubic-bezier easing, as CSS defines it. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(t) - x;
      const d = dx(t);
      if (Math.abs(err) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}
const easeOut = bezier(0.22, 1, 0.36, 1);
const easeInOut = bezier(0.55, 0, 0.35, 1);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpShape = (a: Shape, b: Shape, t: number) => a.map((p, i) => [lerp(p[0], b[i][0], t), lerp(p[1], b[i][1], t)]) as Shape;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerpColor = (a: string, b: string, t: number) => `rgb(${hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t))).join(",")})`;

const PLANE_FOLD_MS = 800;
const FLY_MS = 850;

// Where the browser shows downloads: top left in Arc and plain Chromium, top right
// everywhere else
const CHROMIUM_BRANDS = /Google Chrome|Microsoft Edge|Opera|Brave|Vivaldi|Yandex|Samsung/i;
type UAData = { brands?: { brand: string }[] };
function downloadsCorner(width: number) {
  const arc = getComputedStyle(document.documentElement).getPropertyValue("--arc-palette-title").trim() !== "";
  const brands = ((navigator as Navigator & { userAgentData?: UAData }).userAgentData?.brands ?? []).map((b) => b.brand);
  const leftSide = arc || (brands.includes("Chromium") && !brands.some((b) => CHROMIUM_BRANDS.test(b)));
  return leftSide ? { x: 40, y: 18 } : { x: width - 44, y: 18 };
}

/**
 * The folded sheet becoming a plane, then flying off. Three facets (top wing, keel,
 * lower wing) start as bands of the folded sheet, fold their corners in to a nose, then
 * sweep back into wings. Then the plane flies to the downloads corner, nose along its
 * path: out sideways first, then climbing steeply into the corner as it shrinks away.
 */
function PaperPlane({ width, height, scale, onGone }: { width: number; height: number; scale: number; onGone: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const facets = useRef<(SVGPolygonElement | null)[]>([]);
  const gone = useRef(onGone);
  gone.current = onGone;

  // Which way it'll fly decides which way the nose points
  const [target] = useState(() => downloadsCorner(window.innerWidth));
  // The sheet sits in the middle of the screen
  const flip = target.x < window.innerWidth / 2;

  // Layout effect: the first frame is drawn before paint, so the folded sheet never blinks
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    // The folded sheet: full width, the middle half of the height
    const x0 = 0, x1 = width, y0 = height / 4, y1 = (height * 3) / 4;
    const fh = y1 - y0;
    const yA = y0 + fh * 0.4, yB = y0 + fh * 0.6;
    const cx = width / 2, cy = height / 2;
    const nose0: Pt = [x1, cy];
    // The finished plane
    const L = Math.min(300, width * 0.5);
    const N: Pt = [cx + L / 2, cy];
    const tx = cx - L / 2;
    const S = L * 0.32;
    const tail: Pt = [tx + L * 0.08, cy];

    const shapes: [Shape, Shape, Shape][] = [
      // Top wing
      [
        [[x0, y0], [x1, y0], [x1, yA], [x0, yA]],
        [[x0, y0], [x1 - fh / 2, y0], nose0, [x0, yA]],
        [[tx, cy - S], N, N, tail],
      ],
      // Keel
      [
        [[x0, yA], [x1, yA], [x1, yB], [x0, yB]],
        [[x0, yA], nose0, nose0, [x0, yB]],
        [tail, N, N, [tx + L * 0.12, cy + L * 0.09]],
      ],
      // Lower wing
      [
        [[x0, yB], [x1, yB], [x1, y1], [x0, y1]],
        [[x0, yB], nose0, [x1 - fh / 2, y1], [x0, y1]],
        [tail, N, N, [tx - L * 0.02, cy + S * 0.75]],
      ],
    ];
    const colors = ["#f8f3e8", "#d8ccb4", "#ece3d0"];
    const draw = (t: number) => {
      // Corners in to a nose over the first 45%, then the wings sweep back
      const a = easeOut(Math.min(1, t / 0.45));
      const b = easeInOut(Math.max(0, (t - 0.45) / 0.55));
      shapes.forEach(([rect, mid, plane], i) => {
        const pts = b > 0 ? lerpShape(mid, plane, b) : lerpShape(rect, mid, a);
        const poly = facets.current[i];
        if (!poly) return;
        poly.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
        poly.setAttribute("fill", lerpColor("#efe8da", colors[i], Math.min(1, t * 1.4)));
      });
    };

    const flyX = bezier(0.4, 0, 0.8, 0.45);
    const flyY = bezier(0.8, 0, 0.85, 1);
    const flyScale = bezier(0.45, 0, 0.7, 0.5);
    const endScale = 28 / L;

    let raf = 0;
    let heading = 0;
    const fly = () => {
      const r = el.getBoundingClientRect();
      // The nose sits at the plane's centre line; aim its middle at the corner
      const startX = r.left + cx * scale;
      const startY = r.top + cy * scale;
      const dx = (target.x - startX) / scale;
      const dy = (target.y - startY) / scale;
      const pos = (t: number) => [dx * flyX(t), dy * flyY(t)];
      whooshSound(0.22, FLY_MS);
      const begin = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - begin) / FLY_MS);
        const [x, y] = pos(t);
        const [nx, ny] = pos(Math.min(1, t + 0.02));
        if (Math.hypot(nx - x, ny - y) > 0.01) {
          const angle = (Math.atan2(ny - y, nx - x) * 180) / Math.PI - (flip ? 180 : 0);
          const wanted = ((angle + 540) % 360) - 180;
          heading = lerp(heading, wanted, 0.35);
        }
        const s = lerp(1, endScale, flyScale(t));
        const fade = Math.min(1, Math.max(0, (FLY_MS * (1 - t)) / 180));
        el.style.transform = `translate(${x}px, ${y}px) rotate(${heading}deg) scale(${s})`;
        el.style.opacity = String(fade);
        if (t < 1) raf = requestAnimationFrame(step);
        else gone.current();
      };
      step();
    };

    draw(0);
    planeFoldSound(0.3, PLANE_FOLD_MS);
    const begin = performance.now();
    const fold = () => {
      const t = Math.min(1, (performance.now() - begin) / PLANE_FOLD_MS);
      draw(t);
      if (t < 1) raf = requestAnimationFrame(fold);
      else fly();
    };
    raf = requestAnimationFrame(fold);
    return () => cancelAnimationFrame(raf);
  }, [width, height, scale, target, flip]);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0"
      style={{ width, height, transformOrigin: `${width / 2}px ${height / 2}px`, willChange: "transform, opacity" }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" style={{ filter: "drop-shadow(0 8px 12px rgba(48,40,26,0.18))" }}>
        <g transform={flip ? `translate(${width} 0) scale(-1 1)` : undefined}>
          {[1, 2, 0].map((i) => (
            <polygon
              key={i}
              ref={(el) => {
                facets.current[i] = el;
              }}
              stroke="rgba(90,70,40,0.16)"
              strokeWidth={0.8}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// ── The sticky note ───────────────────────────────────────────────────────────

// A paperclip in two halves: the back loop goes behind the note, the front over it
const CLIP_W = 20, CLIP_H = 60, CLIP_R = 7.5, CLIP_TOP = 12, CLIP_L = 2;
const CLIP_RX = CLIP_W - 2, CLIP_A = CLIP_R + 2, CLIP_B = CLIP_H - CLIP_R - 2;
const CLIP_BACK = `M${CLIP_L} ${CLIP_B - 6} L${CLIP_L} ${CLIP_A} A${CLIP_R} ${CLIP_R} 0 0 1 ${CLIP_RX} ${CLIP_A}`;
const CLIP_FRONT = `M${CLIP_RX} ${CLIP_A} L${CLIP_RX} ${CLIP_B} A${CLIP_R} ${CLIP_R} 0 0 1 ${CLIP_L} ${CLIP_B} L${CLIP_L} ${CLIP_B - 15}`;

function Clip({ d, shadow }: { d: string; shadow: string }) {
  return (
    <svg
      width={CLIP_W}
      height={CLIP_H}
      viewBox={`0 0 ${CLIP_W} ${CLIP_H}`}
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute overflow-visible"
      style={{ right: 4, top: -CLIP_TOP, transform: "rotate(9deg)", transformOrigin: `50% ${CLIP_TOP}px`, filter: `drop-shadow(${shadow})` }}
    >
      {/* Steel wire: a dark edge, the body, and a thin highlight */}
      <path d={d} stroke="#83827d" strokeWidth="2.8" strokeLinecap="round" />
      <path d={d} stroke="#c4c3be" strokeWidth="1.6" strokeLinecap="round" />
      <path d={d} stroke="#f4f3ef" strokeWidth="0.65" strokeLinecap="round" transform="translate(-0.5 -0.25)" />
    </svg>
  );
}

function Note({ show, taking, onTake, style }: { show: boolean; taking: boolean; onTake: () => void; style: CSSProperties }) {
  const visible = show && !taking;
  return (
    <div
      className="absolute z-10"
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible || taking ? 0 : -6}px)`,
        filter: visible ? "blur(0px)" : "blur(6px)",
        transition: `opacity ${taking ? 0.25 : 0.7}s ${EASE}, transform ${taking ? 0.25 : 0.7}s ${EASE}, filter ${taking ? 0.25 : 0.7}s ${EASE}`,
      }}
    >
      <a
        href={RESUME_PDF}
        download={RESUME_FILENAME}
        aria-label="Download a copy of the résumé (PDF)"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTake();
        }}
        className="group/note relative block outline-none"
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <span
          className="relative block rotate-[1.5deg] transition-transform duration-500 ease-out group-hover/note:-translate-y-[2px] group-hover/note:rotate-0 group-focus-visible/note:-translate-y-[2px] group-focus-visible/note:rotate-0"
          style={{ transformOrigin: "70% 0%" }}
        >
          <Clip d={CLIP_BACK} shadow="0.5px 1px 0.6px rgba(40,34,24,0.22)" />
          <span
            className="relative flex items-center justify-center text-center"
            style={{
              width: 100,
              height: 96,
              background: "linear-gradient(to bottom, #efe3b2 0, #f6edc6 9px, #f7eecb 70%, #f3e8bf 100%)",
              boxShadow: "0 1px 1px rgba(48,40,26,0.1), 0 6px 9px -6px rgba(48,40,26,0.3), 6px 9px 10px -9px rgba(48,40,26,0.28)",
            }}
          >
            <span
              className="block font-heading text-[16px] leading-[1.15] transition-colors underline-offset-2 group-hover/note:text-[#1f1d19] group-focus-visible/note:underline"
              style={{ color: INK }}
            >
              download
              <br />a copy
            </span>
          </span>
          <Clip d={CLIP_FRONT} shadow="0.8px 1.4px 0.8px rgba(40,34,24,0.3)" />
        </span>
      </a>
    </div>
  );
}

// ── The overlay ───────────────────────────────────────────────────────────────

function useViewport() {
  const [size, setSize] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const read = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return size;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);
  return reduced;
}

function download() {
  const a = document.createElement("a");
  a.href = RESUME_PDF;
  a.download = RESUME_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  celebrate("resume", "Resume downloaded.");
}

type Phase = "idle" | "folding" | "plane" | "arriving";

export default function ResumeOverlay() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // the flat sheet is up
  const [taking, setTaking] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const [copy, setCopy] = useState(0); // bumps for each new copy on the pile
  const [focusStart, setFocusStart] = useState<number | null>(null);
  const [measured, setMeasured] = useState({ w: 0, h: 0 });

  const overlay = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const timers = useRef<number[]>([]);

  const reduced = useReducedMotion();
  const vp = useViewport();
  const wide = vp.w >= 640;
  const scale = wide ? Math.min(1.05, (vp.h - 64) / SHEET_H, (vp.w - 48) / SHEET_W) : 1;
  const Sheet = wide ? SheetWide : SheetNarrow;
  const sheetH = wide ? SHEET_H : measured.h;
  const sheetW = wide ? SHEET_W : measured.w;

  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  // Open from anywhere
  useEffect(() => {
    const onOpen = () => {
      if (leaving.current) return;
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      setShown(reduced);
      setTaking(false);
      go("idle");
      setFocusStart(null);
      setCopy(0);
      setOpen(true);
      unfoldSound(0.45, reduced ? 0 : 350);
    };
    window.addEventListener(RESUME_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(RESUME_OPEN_EVENT, onOpen);
  }, [reduced]);

  // Enter: the page fades back, the folded sheet rises into place. "backwards" so the
  // animations let go when they end: a held opacity would stop the backdrop blurring.
  useLayoutEffect(() => {
    if (!open) return;
    overlay.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: EASE, fill: "backwards" });
    card.current?.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(28px) scale(0.97)", filter: "blur(10px)" },
            { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
          ],
      { duration: 500, easing: EASE, fill: "backwards" },
    );
  }, [open, reduced]);

  const close = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    overlay.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: EASE, fill: "forwards" });
    const exit = card.current?.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
        { opacity: 0, transform: "translateY(12px) scale(0.985)", filter: "blur(6px)" },
      ],
      { duration: 500, easing: EASE, fill: "forwards" },
    );
    const finish = () => {
      leaving.current = false;
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      setOpen(false);
    };
    if (exit) exit.finished.then(finish).catch(finish);
    else finish();
  }, []);

  // While open: Escape closes, the page underneath doesn't scroll, focus moves in
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    overlay.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = before;
    };
  }, [open, close]);

  // On a phone the sheet is as long as its content: measure it for the fold
  useLayoutEffect(() => {
    if (!open || wide || !sheet.current) return;
    const el = sheet.current;
    const read = () => setMeasured({ w: el.offsetWidth, h: el.offsetHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, wide]);

  const take = () => {
    if (phaseRef.current !== "idle") return;
    setTaking(true);
    if (reduced) {
      download();
      later(() => setTaking(false), 600);
      return;
    }
    go("folding");
    setFocusStart(null);
    setShown(false);
    refoldSound(0.3, 0);
  };

  const onFolded = () => {
    if (phaseRef.current === "folding") go("plane");
  };

  const onGone = () => {
    if (phaseRef.current !== "plane") return;
    download();
    go("arriving");
    setShown(true);
    setCopy((c) => c + 1);
    setFocusStart(performance.now());
    later(() => {
      if (phaseRef.current !== "arriving") return;
      go("idle");
      setTaking(false);
    }, FOCUS_MS);
  };

  if (!open || typeof document === "undefined") return null;

  const pileOn = phase !== "idle";
  const content = (
    <>
      <Pile />
      {/* The next copy waits underneath, out of focus, until this one has gone */}
      {pileOn && <NextCopy start={phase === "arriving" ? focusStart : null} Sheet={Sheet} />}
      <div key={copy} className="relative" style={{ visibility: pileOn && phase === "arriving" ? "hidden" : "visible" }}>
        <div
          ref={sheet}
          className="relative"
          style={{ ...PAPER_STYLE, visibility: shown ? "visible" : "hidden", position: shown ? "relative" : "absolute", top: 0, left: 0, right: 0 }}
        >
          <Grain />
          <Sheet />
        </div>
        {!shown && sheetH > 0 && phase !== "plane" && (
          <Fold key={taking ? "refold" : "unfold"} height={sheetH} Sheet={Sheet} closing={taking} onDone={taking ? onFolded : () => setShown(true)} />
        )}
      </div>
      {phase === "plane" && sheetW > 0 && <PaperPlane width={sheetW} height={sheetH} scale={scale} onGone={onGone} />}
      <Note show={shown} taking={taking} onTake={take} style={wide ? { right: -24, top: 6 } : { right: -6, top: 6 }} />
    </>
  );

  return createPortal(
    <div ref={overlay} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Résumé" className="fixed inset-0 z-[200] outline-none">
      <Backdrop />
      <div className={`absolute inset-0 ${wide ? "overflow-hidden" : "overflow-y-auto"}`} onClick={close}>
        <div className={`flex min-h-full justify-center ${wide ? "items-center" : "px-4 py-16"}`}>
          <div
            ref={card}
            className={wide ? "relative" : "relative my-auto w-full max-w-[520px]"}
            style={wide ? { width: SHEET_W * scale, height: SHEET_H * scale } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {wide ? (
              <div className="absolute left-0 top-0" style={{ width: SHEET_W, height: SHEET_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
                {content}
              </div>
            ) : (
              content
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
