"use client";

// ── Nivasa, Superhost ─────────────────────────────────────────────────────────
// Airbnb's Superhost medal in the brand's colours, drawn to look like the real one: a
// satin ribbon folded like an envelope (each fold lit differently, with soft shadows
// where they overlap and gold piping along the edges), a polished gold rim stepping
// down to a glossy grape enamel face, and the Bélo raised in gold. The gold and satin
// are lit by a light that follows the pointer.
//
// Click it and it comes to the middle of the screen and turns over into Nivasa's host
// card (the same motion as the book and the GitHub card).

import { useCallback, useId, useRef, useState } from "react";
import HoverTip from "./HoverTip";
import Cta from "@/components/Cta";
import { Tag } from "@/components/Tag";
import FocusOverlay, { FlipStage, TURN_MS, useReducedMotion, type FocusPhase } from "./FocusOverlay";
import { useCursorLight } from "./light";

export const MEDAL_W = 180;
export const MEDAL_H = 270;
const PROFILE = "https://www.airbnb.co.in/users/profile/1734971986341408714";
const CX = 90;
const CY = 198;

// The Bélo, drawn as one stroke: the outer arch and the loop inside it
const BELO =
  "M50 74 C42 64 38 56 42 49 C45 44 55 44 58 49 C62 56 58 64 50 74 C45 81 35 84 28 79 C20 73 20 63 25 54 L43 21 C46 15 54 15 57 21 L75 54 C80 63 80 73 72 79 C65 84 55 81 50 74 Z";

export function MedalArt({ id, svgRef }: { id: string; svgRef?: React.Ref<SVGSVGElement> }) {
  const f = (s: string) => `${id}-${s}`;
  const RIBBON = "M20 4 H160 V72 L90 124 L20 72 Z";
  return (
    <svg ref={svgRef} viewBox={`0 0 ${MEDAL_W} ${MEDAL_H}`} className="block h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        {/* Gold: warm, smooth, polished */}
        <linearGradient id={f("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a6" />
          <stop offset="0.28" stopColor="#d9a845" />
          <stop offset="0.52" stopColor="#a8761f" />
          <stop offset="0.74" stopColor="#f3d27c" />
          <stop offset="1" stopColor="#8f6014" />
        </linearGradient>
        <linearGradient id={f("rim")} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="0.3" stopColor="#e0b157" />
          <stop offset="0.62" stopColor="#9a6a17" />
          <stop offset="0.85" stopColor="#d9a845" />
          <stop offset="1" stopColor="#7a510f" />
        </linearGradient>
        {/* Satin facets, each lit differently so the folds read */}
        <linearGradient id={f("back")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d0f56" />
          <stop offset="1" stopColor="#5b0a3e" />
        </linearGradient>
        <linearGradient id={f("left")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d3529f" />
          <stop offset="0.45" stopColor="#b42a83" />
          <stop offset="1" stopColor="#8c1260" />
        </linearGradient>
        <linearGradient id={f("right")} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a81d75" />
          <stop offset="0.6" stopColor="#8a1160" />
          <stop offset="1" stopColor="#6e0d4b" />
        </linearGradient>
        <radialGradient id={f("enamel")} cx="0.38" cy="0.3" r="0.78">
          <stop offset="0" stopColor="#d4559f" />
          <stop offset="0.45" stopColor="#a8197a" />
          <stop offset="0.85" stopColor="#7d0f56" />
          <stop offset="1" stopColor="#4a0832" />
        </radialGradient>
        <linearGradient id={f("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        <filter id={f("goldLit")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="bevel" />
          <feSpecularLighting in="bevel" surfaceScale="3.2" specularConstant="1.25" specularExponent="34" lightingColor="#fffaf0" result="spec">
            <fePointLight data-light="" x="40" y="30" z="90" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.9" k4="0" />
        </filter>
        {/* Satin: a soft broad sheen that moves with the light, and a faint weave */}
        <filter id={f("satin")} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.7" numOctaves="1" seed="5" result="weave" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="soft" />
          <feComposite in="soft" in2="weave" operator="arithmetic" k1="0" k2="1" k3="0.025" k4="0" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="3" specularConstant="0.45" specularExponent="8" lightingColor="#ffe0f2" result="spec">
            <fePointLight data-light="" x="40" y="30" z="160" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.5" k4="0" />
        </filter>
        <filter id={f("flap")} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.6" floodColor="#1e0525" floodOpacity="0.35" />
        </filter>
        <filter id={f("shadow")} x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#1e0525" floodOpacity="0.26" />
          <feDropShadow dx="0" dy="14" stdDeviation="11" floodColor="#1e0525" floodOpacity="0.18" />
        </filter>
        <clipPath id={f("ribbon")}>
          <path d={RIBBON} />
        </clipPath>
      </defs>

      <g filter={`url(#${f("shadow")})`}>
        {/* ── Ribbon, folded like an envelope ── */}
        <g clipPath={`url(#${f("ribbon")})`}>
          <g filter={`url(#${f("satin")})`}>
            <path d={RIBBON} fill={`url(#${f("back")})`} />
          </g>
          <g filter={`url(#${f("flap")})`}>
            <g filter={`url(#${f("satin")})`}>
              <path d="M160 34 L104 100 L90 112 L90 62 Z" fill={`url(#${f("right")})`} />
            </g>
          </g>
          <g filter={`url(#${f("flap")})`}>
            <g filter={`url(#${f("satin")})`}>
              <path d="M20 4 L90 62 L90 124 L20 72 Z" fill={`url(#${f("left")})`} />
            </g>
          </g>
        </g>
        {/* Gold piping on the edges and the folds */}
        <g filter={`url(#${f("goldLit")})`} fill="none" stroke={`url(#${f("gold")})`} strokeLinejoin="round" strokeLinecap="round">
          <path d={RIBBON} strokeWidth="2.4" />
          <path d="M20 4 L90 62" strokeWidth="1.8" />
          <path d="M160 34 L90 62" strokeWidth="1.8" />
        </g>

        {/* ── Loop ── */}
        <g filter={`url(#${f("goldLit")})`}>
          <ellipse cx={CX} cy="129" rx="6.5" ry="6" fill="none" stroke={`url(#${f("gold")})`} strokeWidth="3.4" />
        </g>

        {/* ── Medal ── */}
        <g filter={`url(#${f("goldLit")})`}>
          <circle cx={CX} cy={CY} r="62" fill={`url(#${f("rim")})`} />
        </g>
        {/* The rim's inner step: shadow below the lip, light along the top */}
        <circle cx={CX} cy={CY} r="55" fill="#4a3006" opacity="0.5" />
        <circle cx={CX} cy={CY + 0.8} r="54" fill={`url(#${f("enamel")})`} />
        <circle cx={CX} cy={CY} r="54" fill="none" stroke="#2a0419" strokeOpacity="0.45" strokeWidth="3" />
        <g filter={`url(#${f("goldLit")})`}>
          <path d={BELO} transform={`translate(${CX - 33} ${CY - 34}) scale(0.66)`} fill="none" stroke={`url(#${f("gold")})`} strokeWidth="8.5" strokeLinejoin="round" />
        </g>
        {/* Glossy enamel: a soft window reflection, top left */}
        <path d={`M${CX - 46} ${CY - 10} A48 48 0 0 1 ${CX + 30} ${CY - 40} C${CX + 4} ${CY - 34} ${CX - 26} ${CY - 26} ${CX - 46} ${CY - 10} Z`} fill={`url(#${f("gloss")})`} />
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

/** One figure in the stats row: the number, and what it counts under it, both left-aligned */
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-1 px-4 text-left first:pl-0">
      <span className="font-heading text-h3-lg tabular-nums text-heading">{value}</span>
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

// Hierarchy, top to bottom: who (the name, with Superhost beside it) → where and who
// runs it → the numbers → about the hosts → the way out to Airbnb. Everything reads from
// one left edge.
function HostCard() {
  return (
    <div className="w-[calc(100vw-32px)] max-w-[440px] overflow-hidden rounded-[20px] bg-background text-left shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.04),0_24px_56px_rgba(30,5,37,0.16)]">
      {/* Header band */}
      <div className="relative h-[72px] overflow-hidden sm:h-[80px]" style={{ background: "linear-gradient(120deg, #32073e 0%, #6e0d4b 55%, #9D136A 100%)" }}>
        <PixelField />
      </div>
      <div className="px-5 pb-6 sm:px-6">
        {/* Who */}
        <div className="relative -mt-10 w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero/nivasa-hosts.png" alt="Nandagopal and Ashmik, the hosts of Nivasa" width={80} height={80} className="h-20 w-20 rounded-full object-cover ring-4 ring-background" />
          <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-[0_1px_3px_rgba(30,5,37,0.25)]" title="Identity verified">
            <Shield className="h-3.5 w-3.5 text-grape" />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="m-0 font-heading text-h2 text-heading sm:text-h2-md">Nivasa</h2>
          <Tag tone="grey" face="geist">
            <MedalIcon /> Superhost
          </Tag>
        </div>
        <p className="mt-1 text-pretty font-geist text-body text-secondary sm:text-body-md">Short stays in Bengaluru · Nandagopal &amp; Ashmik</p>

        {/* The numbers */}
        <div className="mt-5 flex items-stretch divide-x divide-line-soft border-y border-line-soft py-4">
          <Stat value="30" label="Reviews" />
          <Stat
            value={
              <span className="inline-flex items-baseline gap-1">
                4.97<span className="text-[16px] text-grape">★</span>
              </span>
            }
            label="Rating"
          />
          <Stat value="3" label="Months hosting" />
        </div>

        {/* About the hosts */}
        <p className="mt-5 font-geist text-caption font-medium uppercase tracking-[0.5px] text-muted">About the hosts</p>
        <p className="mt-2 text-pretty font-geist text-body text-secondary sm:text-body-md">
          <span className="text-text-base">We’re Nandagopal and Ashmik, the two behind Nivasa.</span> Between us, someone’s always reachable, usually within the hour.
        </p>

        {/* The work cards' CTA, smaller: grape on hover, and the arrow circle slides out */}
        <Cta href={PROFILE} external size="sm" className="mt-6">
          View Nivasa on Airbnb
        </Cta>
      </div>
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
        className={`group/tip relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
        style={{ aspectRatio: `${MEDAL_W} / ${MEDAL_H}` }}
      >
        <div ref={tilt} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <MedalArt id={id} svgRef={svg} />
        </div>
        <HoverTip>Our Airbnb in Bengaluru</HoverTip>
      </button>

      <FocusOverlay source={btn.current} open={open} onClosed={onClosed} label="Nivasa host card" width={MEDAL_W} height={MEDAL_H} fitWidth={MEDAL_W} fitHeight={MEDAL_H} closeMs={reduced ? 0 : TURN_MS}>
        {(phase) => <MedalStage id={`${id}big`} phase={phase} />}
      </FocusOverlay>
    </>
  );
}

function MedalStage({ id, phase }: { id: string; phase: FocusPhase }) {
  const svg = useRef<SVGSVGElement>(null);
  useCursorLight(svg, { w: MEDAL_W, h: MEDAL_H });
  return <FlipStage phase={phase} front={<MedalArt id={id} svgRef={svg} />} back={<HostCard />} />;
}
