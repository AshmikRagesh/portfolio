"use client";

// ── Nivasa, Superhost ─────────────────────────────────────────────────────────
// Airbnb's Superhost medal, made as a real one would be: a striped grosgrain ribbon
// (blackcurrant with a grape centre stripe and gold pinstripes) folded into a V, a
// knurled gold rim with "SUPERHOST · NIVASA" struck into it, and a grape enamel face
// over a guilloché sunburst, with the Bélo raised in gold. The gold is lit by a light
// that follows the pointer.
//
// Click it and it comes to the middle of the screen and turns over into Nivasa's host
// card (the same motion as the book and the GitHub card). "Identity verified" turns the
// card again, to the verified card, as Airbnb's own profile does.

import { useCallback, useId, useRef, useState } from "react";
import FocusOverlay, { ControlBar, FlipStage, TURN_MS, useReducedMotion, type FocusPhase } from "./FocusOverlay";
import { useCursorLight } from "./light";

export const MEDAL_W = 180;
export const MEDAL_H = 270;
const PROFILE = "https://www.airbnb.co.in/users/profile/1734971986341408714";
const CX = 90;
const CY = 196;

// The Bélo, drawn as one stroke: the outer arch and the loop inside it
const BELO =
  "M50 74 C42 64 38 56 42 49 C45 44 55 44 58 49 C62 56 58 64 50 74 C45 81 35 84 28 79 C20 73 20 63 25 54 L43 21 C46 15 54 15 57 21 L75 54 C80 63 80 73 72 79 C65 84 55 81 50 74 Z";

export function MedalArt({ id, svgRef }: { id: string; svgRef?: React.Ref<SVGSVGElement> }) {
  const f = (s: string) => `${id}-${s}`;
  const knurl = Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2;
    return `M${(CX + Math.cos(a) * 61).toFixed(2)} ${(CY + Math.sin(a) * 61).toFixed(2)}L${(CX + Math.cos(a) * 64).toFixed(2)} ${(CY + Math.sin(a) * 64).toFixed(2)}`;
  }).join("");
  const rays = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    return `M${CX} ${CY}L${(CX + Math.cos(a) * 46).toFixed(2)} ${(CY + Math.sin(a) * 46).toFixed(2)}`;
  }).join("");
  return (
    <svg ref={svgRef} viewBox={`0 0 ${MEDAL_W} ${MEDAL_H}`} className="block h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={f("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a5c16" />
          <stop offset="0.2" stopColor="#f6dc8e" />
          <stop offset="0.42" stopColor="#b9862a" />
          <stop offset="0.66" stopColor="#fff0bd" />
          <stop offset="1" stopColor="#7d5410" />
        </linearGradient>
        <linearGradient id={f("goldDark")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4610" />
          <stop offset="1" stopColor="#3d2706" />
        </linearGradient>
        {/* Ribbon stripes, running down the ribbon */}
        <pattern id={f("stripes")} width="140" height="10" patternUnits="userSpaceOnUse" x="20">
          <rect width="140" height="10" fill="#32073e" />
          <rect x="22" width="2" height="10" fill="#c9a24a" opacity="0.9" />
          <rect x="116" width="2" height="10" fill="#c9a24a" opacity="0.9" />
          <rect x="44" width="52" height="10" fill="#9D136A" />
          <rect x="66" width="8" height="10" fill="#F2B6EC" opacity="0.8" />
        </pattern>
        {/* Satin: broad light falling across the ribbon */}
        <linearGradient id={f("satin")} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <radialGradient id={f("enamel")} cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#c43a92" stopOpacity="0.86" />
          <stop offset="0.5" stopColor="#9D136A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#3a0627" stopOpacity="0.96" />
        </radialGradient>
        <linearGradient id={f("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <path id={f("rimText")} d={`M${CX - 55} ${CY} A55 55 0 1 1 ${CX + 55} ${CY} A55 55 0 1 1 ${CX - 55} ${CY}`} />

        <filter id={f("goldLit")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="2" result="grain" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="bevel" />
          <feComposite in="bevel" in2="grain" operator="arithmetic" k1="0" k2="1" k3="0.02" k4="0" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="3" specularConstant="1.5" specularExponent="32" lightingColor="#fff8e4" result="spec">
            <fePointLight data-light="" x="40" y="30" z="80" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
        <filter id={f("ribbonLit")} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          {/* Grosgrain: fine horizontal ribs */}
          <feTurbulence type="fractalNoise" baseFrequency="0.01 1.6" numOctaves="1" seed="8" result="ribs" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="bevel" />
          <feComposite in="bevel" in2="ribs" operator="arithmetic" k1="0" k2="1" k3="0.09" k4="0" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="2.4" specularConstant="0.5" specularExponent="10" lightingColor="#ffe0f3" result="spec">
            <fePointLight data-light="" x="40" y="30" z="140" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" />
        </filter>
        <filter id={f("shadow")} x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#1e0525" floodOpacity="0.28" />
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1e0525" floodOpacity="0.2" />
        </filter>
        <clipPath id={f("face")}>
          <circle cx={CX} cy={CY} r="50" />
        </clipPath>
      </defs>

      <g filter={`url(#${f("shadow")})`}>
        {/* Ribbon: back band, then the two folds over it */}
        <g filter={`url(#${f("ribbonLit")})`}>
          <path d="M20 6 H160 V70 L90 124 L20 70 Z" fill={`url(#${f("stripes")})`} />
          <path d="M20 6 H160 V70 L90 124 L20 70 Z" fill={`url(#${f("satin")})`} />
          <path d="M20 6 L90 68 L90 124 L20 70 Z" fill={`url(#${f("stripes")})`} />
          <path d="M20 6 L90 68 L90 124 L20 70 Z" fill="#fff" opacity="0.06" />
          <path d="M160 38 L108 100 L90 112 L90 68 Z" fill={`url(#${f("stripes")})`} />
          <path d="M160 38 L108 100 L90 112 L90 68 Z" fill="#000" opacity="0.14" />
          {/* Where the folds tuck under */}
          <path d="M20 6 L90 68 L160 38" fill="none" stroke="#1e0525" strokeOpacity="0.5" strokeWidth="2.2" />
        </g>
        <g filter={`url(#${f("goldLit")})`} fill="none" stroke={`url(#${f("gold")})`} strokeLinejoin="round">
          <path d="M20 6 H160 V70 L90 124 L20 70 Z" strokeWidth="2.6" />
          <path d="M20 6 L90 68 L160 38" strokeWidth="2" />
        </g>

        {/* The loop and its jump ring */}
        <g filter={`url(#${f("goldLit")})`}>
          <ellipse cx={CX} cy="128" rx="7" ry="6" fill="none" stroke={`url(#${f("gold")})`} strokeWidth="3.6" />
          <rect x={CX - 5} y="132" width="10" height="6" rx="2" fill={`url(#${f("gold")})`} />
        </g>

        {/* Rim: knurled edge, struck lettering */}
        <g filter={`url(#${f("goldLit")})`}>
          <circle cx={CX} cy={CY} r="64" fill={`url(#${f("gold")})`} />
          <path d={knurl} stroke="#6b4610" strokeWidth="1" strokeOpacity="0.5" />
        </g>
        <circle cx={CX} cy={CY} r="51" fill="none" stroke="#5a3a0c" strokeOpacity="0.55" strokeWidth="1.2" />
        <text fontFamily="var(--font-brand), monospace" fontSize="7.2" fontWeight="700" letterSpacing="2.4" fill="#5a3a0c" fillOpacity="0.75">
          <textPath href={`#${f("rimText")}`} startOffset="2%">SUPERHOST · NIVASA · BENGALURU · 2026 ·</textPath>
        </text>

        {/* Face: guilloché sunburst under translucent grape enamel */}
        <g clipPath={`url(#${f("face")})`}>
          <circle cx={CX} cy={CY} r="50" fill={`url(#${f("goldDark")})`} />
          <path d={rays} stroke="#f3d27c" strokeOpacity="0.55" strokeWidth="0.9" />
          {[10, 18, 26, 34, 42].map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#f3d27c" strokeOpacity="0.25" strokeWidth="0.6" />
          ))}
          <circle cx={CX} cy={CY} r="50" fill={`url(#${f("enamel")})`} />
        </g>
        <g filter={`url(#${f("goldLit")})`}>
          <path d={BELO} transform={`translate(${CX - 33} ${CY - 34}) scale(0.66)`} fill="none" stroke={`url(#${f("gold")})`} strokeWidth="8" strokeLinejoin="round" />
        </g>
        {/* A window's reflection in the enamel */}
        <path d={`M${CX - 44} ${CY - 18} A50 50 0 0 1 ${CX + 44} ${CY - 18} C${CX + 20} ${CY - 30} ${CX - 20} ${CY - 30} ${CX - 44} ${CY - 18} Z`} fill={`url(#${f("gloss")})`} />
      </g>
    </svg>
  );
}

// ── The host card ─────────────────────────────────────────────────────────────
function Shield({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path d="M8 1.5 13.5 3.5v4.2c0 3.1-2.3 5.6-5.5 6.8C4.8 13.3 2.5 10.8 2.5 7.7V3.5Z" fill="currentColor" />
      <path d="m5.6 8 1.7 1.7 3.2-3.4" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
      <path d="M1.5 0h9v4.5L6 7 1.5 4.5Z" fill="#9D136A" />
      <circle cx="6" cy="9.6" r="3.6" fill="#c9a24a" />
      <circle cx="6" cy="9.6" r="2.2" fill="#32073e" />
    </svg>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-2 text-center">
      <span className="font-heading text-[28px] leading-none tracking-[-0.8px] tabular-nums text-heading">{value}</span>
      <span className="font-geist text-caption text-muted">{label}</span>
    </div>
  );
}

/** The pixel pattern from the work cards, as a soft field on the verified card */
function PixelField() {
  const cells = [];
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < 22; y++)
    for (let x = 0; x < 40; x++) {
      const toRight = x / 40;
      if (rnd() < toRight * 0.95 - 0.15) cells.push(<rect key={`${x}-${y}`} x={x * 12 + 2} y={y * 12 + 2} width="8" height="8" rx="1.5" fill={rnd() < 0.5 ? "#F2B6EC" : "#F9E4FF"} opacity={0.12 + toRight * 0.3} />);
    }
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 480 264" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {cells}
    </svg>
  );
}

function HostCard({ phase, close }: { phase: FocusPhase; close: () => void }) {
  const [verified, setVerified] = useState(false);
  return (
    <div className="flex w-[480px] max-w-[calc(100vw-32px)] flex-col items-center gap-6">
      <div className="relative w-full" style={{ perspective: 1600 }}>
        <div
          className="relative w-full transition-transform duration-700"
          style={{ transformStyle: "preserve-3d", transform: verified ? "rotateY(180deg)" : "none", transitionTimingFunction: "cubic-bezier(0.65, 0, 0.25, 1)" }}
        >
          {/* ── Front: the host profile ── */}
          <div className="w-full overflow-hidden rounded-[20px] bg-background shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.04),0_24px_56px_rgba(30,5,37,0.16)]" style={{ backfaceVisibility: "hidden" }}>
            {/* Header band */}
            <div className="relative h-[88px] overflow-hidden" style={{ background: "linear-gradient(120deg, #32073e 0%, #6e0d4b 55%, #9D136A 100%)" }}>
              <PixelField />
              <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-background/10 px-2.5 py-1 font-brand text-[10px] uppercase tracking-[1.6px] text-background ring-1 ring-background/20 backdrop-blur">
                <MedalIcon /> Superhost
              </span>
            </div>
            <div className="px-7 pb-7">
              <div className="-mt-12 flex flex-col items-start gap-3">
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/hero/nivasa-hosts.png" alt="Nandagopal and Ashmik, the hosts of Nivasa" width={96} height={96} className="h-24 w-24 rounded-full object-cover ring-4 ring-background" />
                  <span className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-[0_1px_3px_rgba(30,5,37,0.25)]">
                    <Shield className="h-4 w-4 text-grape" />
                  </span>
                </div>
                <div>
                  <p className="font-heading text-[32px] leading-none tracking-[-1px] text-heading">Nivasa</p>
                  <p className="mt-1.5 font-geist text-caption-lg text-secondary">Short stays in Bengaluru · Nandagopal &amp; Ashmik</p>
                </div>
              </div>

              <div className="mt-6 flex items-stretch divide-x divide-line-soft rounded-xl bg-surface py-4">
                <Stat value="30" label="Reviews" />
                <Stat
                  value={
                    <span className="inline-flex items-baseline gap-1">
                      4.97<span className="text-[18px] text-grape">★</span>
                    </span>
                  }
                  label="Rating"
                />
                <Stat value="3" label="Months hosting" />
              </div>

              <div className="mt-6">
                <p className="font-brand text-[10px] uppercase tracking-[2px] text-muted">About the hosts</p>
                <p className="mt-2 font-geist text-body-lg text-text-base">We’re Nandagopal and Ashmik, the two behind Nivasa.</p>
                <p className="mt-1 font-geist text-body-lg text-secondary">Between us, someone’s always reachable, usually within the hour.</p>
                <p className="mt-3 font-handwriting text-[24px] leading-none text-grape">Welcome to your nest in the city.</p>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-line-soft pt-5">
                <button type="button" onClick={() => setVerified(true)} className="group flex items-center gap-2 font-geist text-caption-lg text-secondary transition-colors hover:text-heading">
                  <Shield className="h-4 w-4 text-grape" />
                  <span className="underline decoration-line underline-offset-4 transition-colors group-hover:decoration-grape">Identity verified</span>
                </button>
                <a
                  href={PROFILE}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex h-10 items-center gap-2 rounded-full bg-primary pl-4 pr-1.5 font-geist text-caption-lg font-medium text-background shadow-[0_1px_2px_rgba(30,5,37,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors hover:bg-grape"
                >
                  View on Airbnb
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-45">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Back: the verified card ── */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-[20px] bg-background p-7 shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_24px_56px_rgba(30,5,37,0.16)]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl p-6 text-background shadow-[0_12px_32px_rgba(110,13,75,0.35)]" style={{ background: "linear-gradient(125deg, #32073e 0%, #6e0d4b 40%, #9D136A 75%, #c43a92 100%)" }}>
              <PixelField />
              <div className="relative flex flex-1 items-end justify-between gap-4">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <Shield className="h-6 w-6 text-background" />
                    <p className="mt-4 font-heading text-[28px] leading-[1.05] tracking-[-0.8px]">Nivasa</p>
                    <p className="mt-1 font-geist text-body-lg text-background/80">Verified since July 2026</p>
                  </div>
                  <p className="max-w-[220px] font-geist text-body text-background/75">Identity checked by Airbnb, so guests know who they’re staying with.</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/hero/nivasa-hosts.png" alt="" width={120} height={148} className="h-[148px] w-[120px] rounded-xl object-cover ring-1 ring-background/30 mix-blend-luminosity" />
              </div>
            </div>
            <button type="button" onClick={() => setVerified(false)} className="mt-5 inline-flex items-center gap-2 self-start font-geist text-caption-lg text-secondary transition-colors hover:text-heading">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M10 6H2M5.5 2.5 2 6l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to the profile
            </button>
          </div>
        </div>
      </div>
      <ControlBar onClose={close} visible={phase === "open"} />
    </div>
  );
}

// ── In the hero ───────────────────────────────────────────────────────────────
export default function NivasaMedal({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  useCursorLight(svg, { w: MEDAL_W, h: MEDAL_H }, { tilt, tiltDeg: 8, reduced });
  const onClosed = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Nivasa, Airbnb Superhost. Open the host card"
        aria-haspopup="dialog"
        className={`block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
        style={{ aspectRatio: `${MEDAL_W} / ${MEDAL_H}` }}
      >
        <div ref={tilt} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <MedalArt id={id} svgRef={svg} />
        </div>
      </button>

      <FocusOverlay source={btn.current} open={open} onClosed={onClosed} label="Nivasa host card" width={MEDAL_W} height={MEDAL_H} fitWidth={520} fitHeight={720} closeMs={reduced ? 0 : TURN_MS}>
        {(phase, close) => <MedalStage id={`${id}big`} phase={phase} close={close} />}
      </FocusOverlay>
    </>
  );
}

function MedalStage({ id, phase, close }: { id: string; phase: FocusPhase; close: () => void }) {
  const svg = useRef<SVGSVGElement>(null);
  useCursorLight(svg, { w: MEDAL_W, h: MEDAL_H });
  return <FlipStage phase={phase} front={<MedalArt id={id} svgRef={svg} />} back={<HostCard phase={phase} close={close} />} />;
}
