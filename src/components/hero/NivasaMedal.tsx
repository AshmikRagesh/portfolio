"use client";

// ── Nivasa, Superhost ─────────────────────────────────────────────────────────
// Airbnb's Superhost medal in the brand's colours: a satin ribbon folded into a V,
// a gold rim and loop, and the Bélo raised in gold on a grape enamel disc. The gold is
// lit by a light that follows the pointer.
//
// Click it and it comes to the middle of the screen (FocusOverlay, the same motion as
// the trips book), turns over, and becomes Nivasa's host card: the two hosts, reviews,
// rating, months hosting. "Identity verified" turns the card again to the verified
// card, as Airbnb's own profile does.

import { useCallback, useId, useRef, useState } from "react";
import FocusOverlay, { CloseChip, useReducedMotion, type FocusPhase } from "./FocusOverlay";
import { useCursorLight } from "./light";

const W = 180;
const H = 270;
const PROFILE = "https://www.airbnb.co.in/users/profile/1734971986341408714";

// The Bélo, drawn as one stroke: the outer arch and the loop inside it
const BELO =
  "M50 74 C42 64 38 56 42 49 C45 44 55 44 58 49 C62 56 58 64 50 74 C45 81 35 84 28 79 C20 73 20 63 25 54 L43 21 C46 15 54 15 57 21 L75 54 C80 63 80 73 72 79 C65 84 55 81 50 74 Z";

export function MedalArt({ id, svgRef }: { id: string; svgRef?: React.Ref<SVGSVGElement> }) {
  const f = (s: string) => `${id}-${s}`;
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={f("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d5410" />
          <stop offset="0.22" stopColor="#f3d27c" />
          <stop offset="0.45" stopColor="#b07a1e" />
          <stop offset="0.7" stopColor="#ffe7a3" />
          <stop offset="1" stopColor="#8a5c16" />
        </linearGradient>
        {/* Satin: bands of light running across the ribbon */}
        <linearGradient id={f("satinA")} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#6e0d4b" />
          <stop offset="0.35" stopColor="#b8237f" />
          <stop offset="0.55" stopColor="#d4489c" />
          <stop offset="0.8" stopColor="#9D136A" />
          <stop offset="1" stopColor="#5b0a3e" />
        </linearGradient>
        <linearGradient id={f("satinB")} x1="1" y1="0" x2="0" y2="0.7">
          <stop offset="0" stopColor="#5b0a3e" />
          <stop offset="0.4" stopColor="#9D136A" />
          <stop offset="0.62" stopColor="#c63a90" />
          <stop offset="1" stopColor="#7a0f55" />
        </linearGradient>
        <radialGradient id={f("enamel")} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#d4489c" />
          <stop offset="0.55" stopColor="#9D136A" />
          <stop offset="1" stopColor="#5b0a3e" />
        </radialGradient>
        {/* Enamel gloss: a soft window reflection */}
        <linearGradient id={f("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        <filter id={f("goldLit")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="2" result="grain" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="bevel" />
          <feComposite in="bevel" in2="grain" operator="arithmetic" k1="0" k2="1" k3="0.03" k4="0" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="3.5" specularConstant="1.3" specularExponent="26" lightingColor="#fff6dc" result="spec">
            <fePointLight data-light="" x="40" y="30" z="90" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
        <filter id={f("satinLit")} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.9" numOctaves="1" seed="8" result="weave" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="bevel" />
          <feComposite in="bevel" in2="weave" operator="arithmetic" k1="0" k2="1" k3="0.05" k4="0" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="2" specularConstant="0.55" specularExponent="12" lightingColor="#ffd9f0" result="spec">
            <fePointLight data-light="" x="40" y="30" z="140" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.7" k4="0" />
        </filter>
        <filter id={f("shadow")} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#1e0525" floodOpacity="0.25" />
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#1e0525" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter={`url(#${f("shadow")})`}>
        {/* Ribbon: the back band, then the two folds over it */}
        <g filter={`url(#${f("satinLit")})`}>
          <path d="M20 6 H160 V68 L90 122 L20 68 Z" fill={`url(#${f("satinB")})`} />
          <path d="M20 6 L90 66 L90 122 L20 68 Z" fill={`url(#${f("satinA")})`} />
          <path d="M160 36 L106 98 L90 110 L90 66 Z" fill={`url(#${f("satinB")})`} opacity="0.92" />
          {/* Shade where the folds tuck under */}
          <path d="M20 6 L90 66 L160 36" fill="none" stroke="#3a0627" strokeOpacity="0.35" strokeWidth="2" />
        </g>
        {/* Gold piping round the ribbon and along the folds */}
        <g filter={`url(#${f("goldLit")})`} fill="none" stroke={`url(#${f("gold")})`} strokeLinejoin="round">
          <path d="M20 6 H160 V68 L90 122 L20 68 Z" strokeWidth="3" />
          <path d="M20 6 L90 66 L160 36" strokeWidth="2.4" />
          <path d="M90 66 L90 122" strokeWidth="1.2" strokeOpacity="0.6" />
        </g>

        {/* The loop */}
        <g filter={`url(#${f("goldLit")})`}>
          <ellipse cx="90" cy="126" rx="8" ry="7" fill="none" stroke={`url(#${f("gold")})`} strokeWidth="4" />
        </g>

        {/* The disc: gold rim, grape enamel, raised Bélo */}
        <g filter={`url(#${f("goldLit")})`}>
          <circle cx="90" cy="196" r="64" fill={`url(#${f("gold")})`} />
        </g>
        <circle cx="90" cy="196" r="57" fill={`url(#${f("enamel")})`} />
        <circle cx="90" cy="196" r="57" fill="none" stroke="#3a0627" strokeOpacity="0.5" strokeWidth="1.5" />
        <g filter={`url(#${f("goldLit")})`}>
          <path d={BELO} transform="translate(56 160) scale(0.68)" fill="none" stroke={`url(#${f("gold")})`} strokeWidth="7.5" strokeLinejoin="round" />
        </g>
        <path d="M44 176 A52 52 0 0 1 136 176 A120 80 0 0 0 44 176 Z" fill={`url(#${f("gloss")})`} />
      </g>
    </svg>
  );
}

// ── The host card ─────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line-soft py-3 last:border-b-0">
      <span className="font-geist text-h3-lg font-semibold tabular-nums text-heading">{value}</span>
      <span className="font-geist text-caption-lg text-secondary">{label}</span>
    </div>
  );
}

function VerifiedShield({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center justify-center rounded-full bg-grape text-background shadow-[0_2px_6px_rgba(30,5,37,0.3)]" style={{ width: size, height: size }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1.5 13.5 3.5v4.2c0 3.1-2.3 5.6-5.5 6.8C4.8 13.3 2.5 10.8 2.5 7.7V3.5Z" fill="currentColor" />
        <path d="m5.6 8 1.7 1.7 3.2-3.4" fill="none" stroke="#9D136A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** The pixel pattern from the work cards, as a soft field on the verified card */
function PixelField() {
  const cells = [];
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < 22; y++)
    for (let x = 0; x < 34; x++) {
      const toRight = x / 34;
      if (rnd() < toRight * 0.9 - 0.15) cells.push(<rect key={`${x}-${y}`} x={x * 12} y={y * 12} width="12" height="12" fill={rnd() < 0.5 ? "#F2B6EC" : "#F9E4FF"} opacity={0.18 + toRight * 0.3} />);
    }
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 408 264" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {cells}
    </svg>
  );
}

function HostCard({ phase, close }: { phase: FocusPhase; close: () => void }) {
  const [verified, setVerified] = useState(false);
  return (
    <div className="flex w-[520px] max-w-[calc(100vw-32px)] flex-col items-center gap-4">
      <div className="relative w-full" style={{ perspective: 1400 }}>
        <div
          className="relative w-full transition-transform duration-700"
          style={{ transformStyle: "preserve-3d", transform: verified ? "rotateY(180deg)" : "none", transitionTimingFunction: "cubic-bezier(0.65, 0, 0.25, 1)" }}
        >
          {/* Front: the profile card */}
          <div className="w-full rounded-2xl bg-background p-8 shadow-[0_2px_4px_rgba(30,5,37,0.04),0_24px_48px_rgba(30,5,37,0.14)]" style={{ backfaceVisibility: "hidden" }}>
            <div className="flex items-center gap-8">
              <div className="flex flex-1 flex-col items-center gap-2 text-center">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/hero/nivasa-hosts.png" alt="Nandagopal and Ashmik, the hosts of Nivasa" width={112} height={112} className="h-28 w-28 rounded-full object-cover" />
                  <span className="absolute -bottom-1 -right-1">
                    <VerifiedShield />
                  </span>
                </div>
                <span className="font-geist text-h2-lg font-semibold text-heading">Nivasa</span>
                <span className="flex items-center gap-1 font-geist text-caption-lg text-secondary">
                  <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
                    <path d="M2 0h8v5l-4 2-4-2Z" fill="#9D136A" />
                    <circle cx="6" cy="10" r="3.4" fill="#32073e" />
                  </svg>
                  Superhost
                </span>
              </div>
              <div className="flex w-[156px] flex-col">
                <Stat value="30" label="Reviews" />
                <Stat value={<>4.97<span className="ml-0.5 text-h4-lg">★</span></>} label="Rating" />
                <Stat value="3" label="Months hosting" />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-line-soft pt-6 font-geist text-body-lg text-text-base">
              <p>We’re Nandagopal and Ashmik, the two behind Nivasa.</p>
              <p className="text-secondary">Between us, someone’s always reachable, usually within the hour.</p>
              <p className="text-secondary">Welcome to your nest in the city.</p>
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setVerified(true)} className="flex items-center gap-2 font-geist text-body-lg text-heading underline underline-offset-4 hover:text-grape">
                <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 1.5 13.5 3.5v4.2c0 3.1-2.3 5.6-5.5 6.8C4.8 13.3 2.5 10.8 2.5 7.7V3.5Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <path d="m5.6 8 1.7 1.7 3.2-3.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Identity verified
              </button>
              <a href={PROFILE} target="_blank" rel="noreferrer" className="font-geist text-caption-lg text-muted hover:text-grape">
                View on Airbnb ↗
              </a>
            </div>
          </div>

          {/* Back: the verified card */}
          <div
            className="absolute inset-0 flex flex-col rounded-2xl bg-background p-8 shadow-[0_24px_48px_rgba(30,5,37,0.14)]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl p-6 text-background" style={{ background: "linear-gradient(120deg, #6e0d4b 0%, #9D136A 55%, #d4489c 100%)" }}>
              <PixelField />
              <div className="relative flex flex-1 items-end justify-between gap-4">
                <div className="flex h-full flex-col justify-between gap-8">
                  <p className="font-geist text-h4-lg font-semibold">
                    Nivasa
                    <br />
                    <span className="opacity-80">Verified since July 2026</span>
                  </p>
                  <p className="max-w-[240px] font-geist text-body opacity-80">Identity checked by Airbnb, so guests know who they’re staying with.</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/hero/nivasa-hosts.png" alt="" width={88} height={104} className="h-[136px] w-[112px] rounded-lg object-cover mix-blend-luminosity" />
              </div>
            </div>
            <button type="button" onClick={() => setVerified(false)} className="mt-6 self-start font-geist text-body-lg text-heading underline underline-offset-4 hover:text-grape">
              ← Back to the profile
            </button>
          </div>
        </div>
      </div>
      <div className={`transition-opacity duration-300 ${phase === "open" ? "opacity-100" : "opacity-0"}`}>
        <CloseChip onClick={close} />
      </div>
    </div>
  );
}

// ── In the hero ───────────────────────────────────────────────────────────────
const TURN_MS = 520;

export default function NivasaMedal({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const bigId = `${id}big`;
  const svg = useRef<SVGSVGElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  useCursorLight(svg, { w: W, h: H }, { tilt, tiltDeg: 8, reduced });
  const onClosed = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={btn}
        type="button"
        data-rest="-5"
        onClick={() => setOpen(true)}
        aria-label="Nivasa, Airbnb Superhost. Open the host card"
        aria-haspopup="dialog"
        className={`block rotate-[-5deg] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <div ref={tilt} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <MedalArt id={id} svgRef={svg} />
        </div>
      </button>

      <FocusOverlay source={btn.current} open={open} onClosed={onClosed} label="Nivasa host card" width={W} height={H} closeMs={reduced ? 0 : TURN_MS}>
        {(phase, close) => <MedalStage id={bigId} phase={phase} close={close} />}
      </FocusOverlay>
    </>
  );
}

/** In the middle of the screen: the medal turns away and the card turns in behind it */
function MedalStage({ id, phase, close }: { id: string; phase: FocusPhase; close: () => void }) {
  const svg = useRef<SVGSVGElement>(null);
  useCursorLight(svg, { w: W, h: H });
  const showCard = phase === "open";
  const ease = "cubic-bezier(0.65, 0, 0.25, 1)";
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1400 }}>
      <div
        className="absolute inset-0"
        style={{
          transform: showCard ? "rotateY(90deg) scale(1.1)" : "none",
          opacity: showCard ? 0 : 1,
          transition: `transform ${TURN_MS / 2}ms ${ease} ${showCard ? 0 : TURN_MS / 2}ms, opacity 1ms linear ${showCard ? TURN_MS / 2 : TURN_MS / 2}ms`,
        }}
      >
        <MedalArt id={id} svgRef={svg} />
      </div>
      <div
        className="relative"
        style={{
          transform: showCard ? "none" : "rotateY(-90deg) scale(0.9)",
          opacity: showCard ? 1 : 0,
          pointerEvents: showCard ? "auto" : "none",
          transition: `transform ${TURN_MS / 2}ms ${ease} ${showCard ? TURN_MS / 2 : 0}ms, opacity 1ms linear ${TURN_MS / 2}ms`,
        }}
      >
        <HostCard phase={phase} close={close} />
      </div>
    </div>
  );
}
