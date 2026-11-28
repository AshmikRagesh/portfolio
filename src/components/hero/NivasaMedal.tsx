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

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
        {/* Gold and enamel: the same as the Chelsea badge beside it, so they read as one set */}
        <linearGradient id={f("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="0.22" stopColor="#e3b553" />
          <stop offset="0.45" stopColor="#a06d17" />
          <stop offset="0.62" stopColor="#f7d784" />
          <stop offset="0.82" stopColor="#b8842a" />
          <stop offset="1" stopColor="#6e480c" />
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
          <stop offset="0" stopColor="#5b0a3e" />
          <stop offset="1" stopColor="#32073e" />
        </linearGradient>
        <linearGradient id={f("left")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b02a83" />
          <stop offset="0.45" stopColor="#8a1160" />
          <stop offset="1" stopColor="#5b0a3e" />
        </linearGradient>
        <linearGradient id={f("right")} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d0f56" />
          <stop offset="0.6" stopColor="#5b0a3e" />
          <stop offset="1" stopColor="#32073e" />
        </linearGradient>
        <radialGradient id={f("enamel")} cx="0.38" cy="0.3" r="0.78">
          <stop offset="0" stopColor="#b02a83" />
          <stop offset="0.45" stopColor="#7d0f56" />
          <stop offset="1" stopColor="#32073e" />
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

// Corners: one concentric set from the DS radius scale, so every inner corner sits
// evenly inside the one around it, all drawn as smooth squircles where the browser can
// (corner-shape; plain round corners elsewhere):
//   card 24 (2xl) → hero tile 16 (xl, 8px in) → number tiles 8 (md)
//   the review is a guestbook page (2px, like the testimonials) · photo and faces round
// The hero tile is the match card's blackcurrant (Chelsea), so the hero objects' cards
// read as one set.
const TILE_BG = "linear-gradient(160deg, #3a0944 0%, #32073e 50%, #24062d 100%)";
/** The rating star: five rounded points in a warm gold, lit from the top like the medal */
function RatingStar({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="out of 5 stars">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd978" />
          <stop offset="1" stopColor="#f2a93b" />
        </linearGradient>
      </defs>
      <path
        d="M11.1 2.6a1 1 0 0 1 1.8 0l2.4 4.9 5.4.8a1 1 0 0 1 .55 1.7l-3.9 3.8.92 5.4a1 1 0 0 1-1.45 1.05L12 17.7l-4.83 2.55a1 1 0 0 1-1.45-1.05l.92-5.4-3.9-3.8a1 1 0 0 1 .55-1.7l5.4-.8Z"
        fill={`url(#${id}-g)`}
        stroke="#f2a93b"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One figure on the hero tile: the number over what it counts, in a light inner tile */
// The number sits dead centre over its label; a mark after it (the star) hangs to the
// right without pulling the number off centre. Number and label share one centre line in
// every tile, and the number has a tight line box so all three tiles line up.
function Stat({ value, label, mark }: { value: string; label: string; mark?: React.ReactNode }) {
  return (
    <div className="[corner-shape:squircle] flex min-w-0 flex-col items-center justify-center gap-2 rounded-md bg-white/[0.08] px-2 py-3 text-center">
      <span className="relative font-heading text-h3-lg leading-none tabular-nums text-white">
        {value}
        {mark && <span className="absolute left-full top-1/2 ml-1 flex -translate-y-1/2">{mark}</span>}
      </span>
      <span className="font-geist text-caption text-white/60">{label}</span>
    </div>
  );
}

/** A section's serif heading */
function SectionHead({ children }: { children: React.ReactNode }) {
  return <h3 className="m-0 mt-6 font-heading text-h4 text-heading sm:text-h4-md">{children}</h3>;
}

// Hierarchy, after the reference's host sheet (Doorin, Dribbble): who (photo, name,
// Superhost) and the proof, on the blackcurrant tile → about Nivasa, in the hosts' own
// words from the Airbnb profile → guests in their own words, on a guestbook page → the way out to Airbnb, filling the card's width.
// The numbers, the intro and the reviews are from Nivasa's Airbnb profile (28 Nov 2026).
function HostCard() {
  return (
    <div className="[corner-shape:squircle] w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)] max-w-[440px] overflow-y-auto overscroll-contain rounded-2xl bg-background p-2 text-left shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.04),0_24px_56px_rgba(30,5,37,0.16)]">
      {/* Who, and the proof: on the blackcurrant hero tile */}
      <div className="[corner-shape:squircle] overflow-hidden rounded-xl p-4 text-white sm:px-5" style={{ background: TILE_BG }}>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/nivasa-hosts.png" alt="Nandagopal and Ashmik, the hosts of Nivasa" width={64} height={64} className="block size-16 rounded-full object-cover ring-2 ring-white/20" />
            <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(30,5,37,0.3)]" title="Identity verified">
              <Shield className="size-3.5 text-grape" />
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-2">
            <h2 className="m-0 font-heading text-h2 text-white sm:text-h2-md">Nivasa</h2>
            <Tag tone="grey" face="geist">
              <MedalIcon /> Superhost
            </Tag>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat value="4.97" mark={<RatingStar className="size-4" />} label="Guest rating" />
          <Stat value="34" label="Reviews" />
          <Stat value="4" label="Months open" />
        </div>
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        {/* About: the hosts' own intro from the Airbnb profile, trimmed */}
        <SectionHead>About Nivasa</SectionHead>
        {/* A true neutral grey (Ashmik's pick, 28 Nov 2026), not the DS's warm body grey */}
        <p className="mt-2 text-pretty font-geist text-body text-[#555555] sm:text-body-md">
          We’re Nandagopal and Ashmik, the two behind Nivasa. We started it out of two things we enjoy: hosting people, and building the spaces they stay in.
        </p>

        {/* Guests, in their own words, one at a time */}
        <SectionHead>Guest reviews</SectionHead>
        <GuestReviews />

        {/* The site's CTA as the secondary outline, filled to the card's width (as in the
            expanded reel): grape on hover, and the arrow circle slides out */}
        <Cta href={PROFILE} external secondary className="cta-full mt-6">
          See Nivasa on Airbnb
        </Cta>
      </div>
    </div>
  );
}

// ── Guest faces ───────────────────────────────────────────────────────────────
// Illustrated stand-ins for the guests (placeholders until we use real photos): a
// flat head-and-shoulders on a soft DS tint, each with its own hair and colours.
type Face = { bg: string; shirt: string; skin: string; hair: string; style: "short" | "side" | "curly" | "long" | "flat"; beard?: boolean; glasses?: boolean };

function GuestFace({ face, className = "" }: { face: Face; className?: string }) {
  const { bg, shirt, skin, hair, style, beard, glasses } = face;
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="20" fill={bg} />
      {style === "long" && <path d="M11 18 C10 9 15 6 20 6 C25 6 30 9 29 18 L30 31 C26 32 24 30 24 27 L16 27 C16 30 14 32 10 31 Z" fill={hair} />}
      <path d="M6 41 C6 32 12.5 28 20 28 C27.5 28 34 32 34 41 Z" fill={shirt} />
      <rect x="17" y="22" width="6" height="7" rx="3" fill={skin} />
      <ellipse cx="20" cy="17" rx="7" ry="8" fill={skin} />
      {style === "short" && <path d="M13 16 C12.5 9 16.5 7 20.5 7 C25 7 27.8 10 27 16 C26 13 24 12 20 12 C16.5 12 14.5 13 13 16 Z" fill={hair} />}
      {style === "side" && <path d="M12.8 17 C12 9 17 6.5 21 7 C26 7.5 28 11 27.2 17 C26.5 13 25 11.5 22.5 11 C19.5 12.8 16 13.2 12.8 17 Z" fill={hair} />}
      {style === "flat" && <path d="M12.8 15 C13 8.5 17 7 20 7 C24 7 27.2 8.5 27.2 15 L26.5 12.5 L13.5 12.5 Z" fill={hair} />}
      {style === "curly" && (
        <g fill={hair}>
          <circle cx="14" cy="13" r="3" /><circle cx="16.5" cy="9.5" r="3" /><circle cx="20.5" cy="8.2" r="3.2" /><circle cx="24.5" cy="9.8" r="3" /><circle cx="26.5" cy="13.5" r="2.6" />
        </g>
      )}
      {style === "long" && <path d="M13 17 C13 10 16.5 8.5 20 8.5 C24 8.5 27 10.5 27 17 C24 15.5 22 13.5 21 11.5 C19 14.5 16 16 13 17 Z" fill={hair} />}
      {beard && <path d="M13.4 18.5 C13.8 24 16.8 25.6 20 25.6 C23.2 25.6 26.2 24 26.6 18.5 C25.2 21.2 23 22.2 20 22.2 C17 22.2 14.8 21.2 13.4 18.5 Z" fill={hair} />}
      <circle cx="17.4" cy="17.6" r="0.9" fill="#1e0525" />
      <circle cx="22.6" cy="17.6" r="0.9" fill="#1e0525" />
      {glasses && (
        <g fill="none" stroke="#1e0525" strokeWidth="0.9">
          <circle cx="17.4" cy="17.6" r="2.5" /><circle cx="22.6" cy="17.6" r="2.5" /><path d="M19.9 17.6 H20.1" />
        </g>
      )}
    </svg>
  );
}

// ── Guest reviews ─────────────────────────────────────────────────────────────
// Five real reviews from Nivasa's Airbnb page, quoted word for word (one sentence each),
// on a small guestbook page: the testimonials' cream paper and ruled lines, with a light
// shadow for the white card and none of their tilt, hover or punch hole. One shows at a
// time: every 7 seconds the quote lifts out and blurs, and the next one comes in word by
// word, rising out of a soft blur. The guests' faces
// sit in a row as the pager: the one speaking is ringed in grape and the rest wait, a
// little faded. All five quotes sit in one grid cell, so the card is always as tall as the
// longest and never jumps. Hovering or focusing pauses them; with reduced motion they swap
// without moving and don't turn on their own.
const REVIEWS: { quote: string; who: string; role: string; face: Face }[] = [
  { quote: "The property had everything already, we didn’t need to ask for anything.", who: "Kabir", role: "Guest", face: { bg: "#F9E4FF", shirt: "#9D136A", skin: "#c98d63", hair: "#1e0525", style: "short" } },
  { quote: "The space is calm, peaceful, and immaculate.", who: "Santosh", role: "Guest", face: { bg: "#e7f8f2", shirt: "#2f6b4f", skin: "#a86f4c", hair: "#2b1a12", style: "side", beard: true } },
  { quote: "Everything felt fresh, clean and thoughtfully designed.", who: "Avinash", role: "Guest", face: { bg: "#ece5d8", shirt: "#32073e", skin: "#b97a55", hair: "#241510", style: "curly" } },
  { quote: "Loved the place, feels like home.", who: "Koushik", role: "Guest", face: { bg: "#f3f3f2", shirt: "#565351", skin: "#8d5a3b", hair: "#1a1210", style: "flat", glasses: true } },
  { quote: "It genuinely felt like my little nest in the city.", who: "Jeena", role: "Our first guest", face: { bg: "#f8c2f7", shirt: "#6e0d4b", skin: "#c48a64", hair: "#2a160f", style: "long" } },
];
const REVIEW_MS = 7000;
const WORD_STAGGER_MS = 40;

function GuestReviews() {
  const [index, setIndex] = useState(0);
  // The review on its way out lifts up; the rest wait just below, ready to rise in
  const [leaving, setLeaving] = useState(-1);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const go = useCallback(
    (next: number) => {
      if (next === index) return;
      setLeaving(index);
      setIndex(next);
    },
    [index],
  );

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setTimeout(() => {
      if (!document.hidden) go((index + 1) % REVIEWS.length);
    }, REVIEW_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, reduced, go]);

  const ease = reduced ? "" : "transition-[opacity,transform,filter] ease-out";

  return (
    <figure
      className="gb-paper relative m-0 mt-3 rounded-xs px-4 pb-4 pt-3 text-heading !shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(120,100,70,0.1),0_1px_2px_rgba(30,5,37,0.08),0_6px_16px_-8px_rgba(30,5,37,0.18)] sm:px-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="What guests say"
    >
      {/* The page's head: which review this is, as on the guestbook pages */}
      <div className="mb-1 border-b border-line/60 pb-2 font-brand text-[10px] uppercase leading-[14px] tracking-[1px] text-muted">
        {String(index + 1).padStart(2, "0")} / {String(REVIEWS.length).padStart(2, "0")}
      </div>

      {/* The quote, written on the ruled lines (one rule per 28px line) */}
      <div className="gb-ruled relative -mx-4 grid px-4 pb-2 sm:-mx-5 sm:px-5">
        {REVIEWS.map((r, i) => {
          const on = i === index;
          const words = `“${r.quote}”`.split(" ");
          return (
            <blockquote
              key={r.who}
              aria-hidden={!on}
              className={`relative col-start-1 row-start-1 m-0 text-pretty font-heading text-h4 leading-[28px] text-heading sm:text-h4-md sm:leading-[28px] ${on ? "" : "pointer-events-none"}`}
            >
              {words.map((w, j) => (
                <span key={j}>
                  <span
                    className={`inline-block ${ease} ${
                      on
                        ? "translate-y-0 opacity-100 blur-0 duration-500"
                        : `opacity-0 duration-300 ${reduced ? "" : i === leaving ? "-translate-y-2 blur-[4px]" : "translate-y-2 blur-[4px]"}`
                    }`}
                    style={{ transitionDelay: on && !reduced ? `${200 + j * WORD_STAGGER_MS}ms` : "0ms" }}
                  >
                    {w}
                  </span>
                  {j < words.length - 1 ? " " : null}
                </span>
              ))}
            </blockquote>
          );
        })}
      </div>

      <figcaption className="mt-2 flex items-center justify-between gap-4 border-t border-line/60 pt-3">
        {/* Who is speaking */}
        <span className="grid min-w-0">
          {REVIEWS.map((r, i) => (
            <span
              key={r.who}
              aria-hidden={i !== index}
              className={`col-start-1 row-start-1 flex min-w-0 flex-col ${ease} duration-300 ${i === index ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: i === index && !reduced ? "300ms" : "0ms" }}
            >
              <span className="truncate font-geist text-body font-medium text-text-base">{r.who}</span>
              <span className="truncate font-geist text-caption text-muted">{r.role}</span>
            </span>
          ))}
        </span>

        {/* The guests' faces, as the pager */}
        <span className="flex shrink-0 items-center -space-x-2">
          {REVIEWS.map((r, i) => {
            const on = i === index;
            return (
              <button
                key={r.who}
                type="button"
                onClick={() => go(i)}
                aria-label={`Review ${i + 1} of ${REVIEWS.length}, from ${r.who}`}
                aria-current={on}
                className={`relative rounded-full ring-2 transition-[transform,opacity,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
                  on ? "z-10 scale-110 opacity-100 ring-grape" : "opacity-60 ring-[#f6f2e9] hover:opacity-100"
                }`}
              >
                <GuestFace face={r.face} className="block size-8 rounded-full" />
              </button>
            );
          })}
        </span>
      </figcaption>

    </figure>
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
