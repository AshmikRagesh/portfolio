"use client";

// ── The résumé's paper ────────────────────────────────────────────────────────
// The sheet's stock and typesetting, the blurred page behind it, the pile it sits
// on, the punch holes, pen marks and tear-off stub.

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import PunchHole from "@/components/PunchHole";
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
const PEN = "#9D136A"; // grape, the case studies' pen colour
const GOLD = "#a8813a";

// The tear-off stub along the bottom of the sheet, below a perforated line
export const STUB_H = 72;
export const PERF_GAP = 8; // one perforation hole every 8px

// Torn off a pad: the top edge keeps the half-holes of the perforation it came from
export const TOP_EDGE: CSSProperties = {
  maskImage: "radial-gradient(circle at 50% 0, transparent 2.2px, #000 2.8px) 0 0 / 8px 6px repeat-x, linear-gradient(#000, #000) 0 6px / 100% calc(100% - 6px) no-repeat",
  WebkitMaskImage:
    "radial-gradient(circle at 50% 0, transparent 2.2px, #000 2.8px) 0 0 / 8px 6px repeat-x, linear-gradient(#000, #000) 0 6px / 100% calc(100% - 6px) no-repeat",
};

// The visitor's guest number, printed on the stub
export const GuestNo = createContext<string>("····");

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

/** A phrase circled in pen, the loop drawing itself in once the sheet is down. */
function Circled({ children }: { children: ReactNode }) {
  return (
    // A block of its own, so a phrase that runs onto two lines gets one loop round both
    <span className="relative inline-block" style={{ color: INK }}>
      {children}
      <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute overflow-visible" style={{ left: -12, top: -3, width: "calc(100% + 22px)", height: "calc(100% + 7px)" }}>
        {/* A quick oval in one stroke, starting top right and overshooting where it began */}
        <path
          className="resume-pen"
          pathLength={1}
          d="M90 22C74 2 24 0 7 24-6 44 8 90 50 96c40 5 56-22 48-52C92 18 70 6 40 8"
          fill="none"
          stroke={PEN}
          strokeWidth={1.3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ animationDelay: "0.55s" }}
        />
      </svg>
    </span>
  );
}

// **double stars** set a phrase in the darker ink; ((double brackets)) circle it in pen
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|\(\([^)]+\)\))/g).map((part, i) =>
        part.startsWith("**") ? (
          <span key={i} style={{ color: INK }}>
            {part.slice(2, -2)}
          </span>
        ) : part.startsWith("((") ? (
          <Circled key={i}>
            {part.slice(2, -2)}
          </Circled>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** A note in the margin in Ashmik's hand, with a little arrow up to what it's about. */
function MarginNote({ text }: { text: string }) {
  return (
    <p className="resume-note relative mt-[2px] flex items-start gap-1 pl-[2px] font-handwriting text-[18px] leading-none" style={{ color: PEN, transform: "rotate(-2.5deg)", transformOrigin: "0 50%" }}>
      <svg aria-hidden="true" width="18" height="16" viewBox="0 0 18 16" fill="none" className="mt-[-4px] shrink-0">
        <path d="M15 14C9 13 5 10 4 3M1.5 5.5 4 2.5l2.8 2.6" stroke={PEN} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {text}
    </p>
  );
}

/** Three punched holes down the left margin. */
function Holes({ left }: { left: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute" style={{ left, top: 0, bottom: STUB_H }}>
      {[0.2, 0.5, 0.8].map((at, i) => (
        <div key={i} className="absolute" style={{ top: `${at * 100}%`, transform: "translateY(-50%)" }}>
          <PunchHole index={i + 1} fill="#e7dfcc" />
        </div>
      ))}
    </div>
  );
}

/** The tear-off stub: a perforated line across, and a slip below it. */
function Stub() {
  const guest = useContext(GuestNo);
  return (
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0" style={{ height: STUB_H }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(150,112,58,0.05), rgba(150,112,58,0.02))" }} />
      <svg className="absolute left-0 top-0 h-[4px] w-full overflow-visible">
        <defs>
          <pattern id="resume-perf" width={PERF_GAP} height="4" patternUnits="userSpaceOnUse">
            <circle cx={PERF_GAP / 2} cy="0" r="1.25" fill="rgba(70,56,36,0.34)" />
          </pattern>
        </defs>
        <rect x="0" y="-2" width="100%" height="4" fill="url(#resume-perf)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-between font-brand uppercase" style={{ padding: "0 clamp(20px, 7.2%, 46px)", fontSize: 10, letterSpacing: "0.14em", color: INK }}>
        <span className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
          </svg>
          Tear for a copy
        </span>
        <span className="max-[639px]:hidden" style={{ color: MUTED }}>Résumé · PDF</span>
        <span style={{ color: GOLD }}>Guest No. {guest}</span>
      </div>
    </div>
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
      {entry.note && <MarginNote text={entry.note} />}
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
    <div className="relative font-geist" style={{ width: SHEET_W, height: SHEET_H, padding: `44px 46px ${STUB_H + 24}px`, color: MUTED }}>
      <Holes left={15} />
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
      <Stub />
    </div>
  );
}

/** The sheet on a phone: one column, as long as it needs to be. */
export function SheetNarrow() {
  return (
    <div className="relative font-geist" style={{ padding: `32px 24px ${STUB_H + 32}px 40px`, color: MUTED }}>
      <Holes left={12} />
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
      <Stub />
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
