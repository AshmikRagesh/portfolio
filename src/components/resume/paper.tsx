"use client";

// ── The résumé's paper ────────────────────────────────────────────────────────
// The sheet's stock and typesetting, the blurred page behind it, the pile it sits
// on, and the next copy that comes into focus after one is taken.

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { resume, resumeSections, type ResumeEntry } from "@/lib/resume";
import { EASE } from "./motion";

// A4 at 640px wide
export const SHEET_W = 640;
export const SHEET_H = Math.round((SHEET_W * 842) / 595);

export const INK = "#33302a";
export const MUTED = "#6d675c";
export const FAINT = "#a39b8c";
export const PAPER = "#f8f3e8";
export const PAPER_BACK = "#efe7d8";

// Fine grain, multiplied over the paper
export const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
// Edges a touch warmer and darker, the way real stock ages from the outside in
export const EDGES = [
  "radial-gradient(ellipse 125% 100% at 50% 50%, transparent 66%, rgba(166,128,70,0.07) 88%, rgba(140,104,52,0.15) 100%)",
  "linear-gradient(to right, rgba(150,112,58,0.07), transparent 14px, transparent calc(100% - 14px), rgba(150,112,58,0.07))",
  "linear-gradient(to bottom, rgba(150,112,58,0.06), transparent 14px, transparent calc(100% - 14px), rgba(150,112,58,0.07))",
].join(", ");
// The crease across the middle: a shadow above, a catch of light just below
const CREASE =
  "linear-gradient(to bottom, transparent calc(50% - 40px), rgba(90,70,40,0.035) calc(50% - 2px), rgba(90,70,40,0.1) 50%, rgba(255,250,238,0.5) calc(50% + 1px), rgba(255,250,238,0) calc(50% + 3px), rgba(90,70,40,0.025) calc(50% + 24px), transparent calc(50% + 48px))";
export const PAPER_STYLE: CSSProperties = {
  backgroundColor: PAPER,
  boxShadow: "0 1px 2px rgba(48,40,26,0.07), 0 10px 26px -10px rgba(48,40,26,0.17), 0 32px 64px -28px rgba(48,40,26,0.22)",
};

export function Grain({ crease = true }: { crease?: boolean }) {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN, opacity: 0.08, mixBlendMode: "multiply" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: crease ? `${EDGES}, ${CREASE}` : EDGES }} />
    </>
  );
}

/** The back of the sheet: plain stock, no type. */
export function PaperBack() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${PAPER_BACK}, #ebe2d1)` }} />
      <div className="absolute inset-0" style={{ backgroundImage: EDGES }} />
      <div className="absolute inset-0" style={{ backgroundImage: GRAIN, opacity: 0.08, mixBlendMode: "multiply" }} />
    </>
  );
}

// ── Typesetting ───────────────────────────────────────────────────────────────

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
export function SheetWide() {
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
export function SheetNarrow() {
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

// ── Backdrop ──────────────────────────────────────────────────────────────────
// The page behind, blurred more towards the edges so the sheet stays the focus. Each
// layer fades on its own: fading a parent would stop the blur working while it fades.

export function Backdrop() {
  const vignette = (shape: string) => ({ maskImage: shape, WebkitMaskImage: shape });
  return (
    <>
      <div data-backdrop className="absolute inset-0 backdrop-blur-[2px]" style={{ background: "rgba(255,255,255,0.25)" }} />
      <div data-backdrop className="absolute inset-0 backdrop-blur-[7px]" style={vignette("radial-gradient(ellipse 62% 72% at 50% 50%, transparent 28%, black 78%)")} />
      <div data-backdrop className="absolute inset-0 backdrop-blur-[16px]" style={vignette("radial-gradient(ellipse 70% 80% at 50% 50%, transparent 52%, black 100%)")} />
      <div
        data-backdrop
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 75% 85% at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.45) 70%, rgba(255,255,255,0.7) 100%)" }}
      />
    </>
  );
}

// ── The pile ──────────────────────────────────────────────────────────────────
// Two more sheets slide out from under the top one and come to rest a little askew.

const PILE = [
  { rotate: -1.6, x: -7, y: 5, tint: "#f1ebdd", delay: 0.9 },
  { rotate: 1.1, x: 6, y: 3, tint: "#f4efe3", delay: 1.15 },
];
export function Pile() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {PILE.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 overflow-hidden"
          style={
            {
              "--pile-to": `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`,
              transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`,
              backgroundColor: s.tint,
              boxShadow: "0 1px 2px rgba(48,40,26,0.06), 0 8px 22px -12px rgba(48,40,26,0.18)",
              animation: `resume-pile-in 1.3s ${EASE} ${s.delay}s both`,
            } as CSSProperties
          }
        >
          <Grain crease={false} />
        </div>
      ))}
    </div>
  );
}

// ── The next copy coming into focus ───────────────────────────────────────────
// Four stacked copies of the sheet, each masked to a band and blurred by a different
// amount, so the copy sharpens from the top down.

export const FOCUS_MS = 3200;
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

export function NextCopy({ start, Sheet }: { start: number | null; Sheet: () => ReactNode }) {
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
