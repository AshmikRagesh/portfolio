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
import { Star } from "lucide-react";
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

// Every inner panel (the numbers, the facts, the reviews) shares one finish: white, a
// hairline, and the faintest lift, so they read as one set on the card
const PANEL = "rounded-xl border border-line-soft bg-background shadow-[0_1px_2px_rgba(30,5,37,0.04)]";

// The hero panel: the match card's blackcurrant tile (Chelsea), so the hero objects' cards
// read as one set, with the numbers in its lighter inner tiles
const TILE_BG = "linear-gradient(160deg, #3a0944 0%, #32073e 50%, #24062d 100%)";
// The medal's gold, for the rating star
const GOLD = "#e3b553";

/** One figure on the hero panel: the number over what it counts, in a light inner tile */
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 rounded-[12px] bg-white/[0.08] px-2 py-3 text-center">
      <span className="font-heading text-h3-lg tabular-nums text-white">{value}</span>
      <span className="font-geist text-caption text-white/60">{label}</span>
    </div>
  );
}

/** A section's serif heading */
function SectionHead({ children }: { children: React.ReactNode }) {
  return <h3 className="m-0 mt-8 font-heading text-h4 text-heading sm:text-h4-md">{children}</h3>;
}

// Hierarchy, after the reference's host sheet (Doorin, Dribbble): who (photo, name,
// Superhost) → the proof as three numbers in one panel → about the place (why we
// host) → guests in their own words → the way out to Airbnb, filling the card's width.
// The who and the numbers sit on the Chelsea card's blackcurrant tile; the sections
// below are set apart by space and a serif heading, not by eyebrows or fills.
// The numbers and the reviews are from Nivasa's Airbnb profile (17 Nov 2026).
function HostCard() {
  return (
    <div className="w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)] max-w-[440px] overflow-y-auto overscroll-contain rounded-2xl bg-background p-2 text-left shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.04),0_24px_56px_rgba(30,5,37,0.16)]">
      {/* Who, and the proof: on the blackcurrant hero tile */}
      <div className="overflow-hidden rounded-[18px] px-4 pb-4 pt-5 text-white sm:px-5" style={{ background: TILE_BG }}>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 rounded-full p-0.5 ring-1 ring-white/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero/nivasa-hosts.png" alt="Nandagopal and Ashmik, the hosts of Nivasa" width={64} height={64} className="block size-16 rounded-full object-cover" />
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

        <div className="mt-5 grid grid-cols-3 gap-1.5">
          <Stat
            value={
              <span className="inline-flex items-center gap-1">
                4.97
                <Star className="size-4" style={{ fill: GOLD, color: GOLD }} strokeWidth={0} aria-label="stars" />
              </span>
            }
            label="Guest rating"
          />
          <Stat value="33" label="Reviews" />
          <Stat value="3" label="Months open" />
        </div>
      </div>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
      {/* About the place */}
      <SectionHead>About Nivasa</SectionHead>
      <p className="mt-2 text-pretty font-geist text-body text-secondary sm:text-body-md">
        We love hosting people and building the spaces they stay in. Guests test a home the way users test a product.
      </p>

      {/* Guests, in their own words, one at a time */}
      <SectionHead>Guest reviews</SectionHead>
      <GuestReviews />

      {/* The site's CTA, filled to the card's width (as in the expanded reel): grape on
          hover, and the arrow circle slides out */}
      <Cta href={PROFILE} external className="cta-full mt-8">
        See Nivasa on Airbnb
      </Cta>
      </div>
    </div>
  );
}

// ── Guest reviews ─────────────────────────────────────────────────────────────
// Five real reviews from Nivasa's Airbnb page, quoted word for word (one sentence each),
// in a white hairline card, each signed with the guest's initial, name and stay. One shows at a time: every 7 seconds the quote lifts out and blurs,
// and the next one comes in word by word, rising out of a soft blur. The active dot fills
// up as the 7 seconds pass. All five sit in one grid cell, so the card is always as tall
// as the longest and never jumps. Hovering or focusing pauses them (the dot stops
// filling); the dots pick one; with reduced motion they swap without moving and don't
// turn on their own.
const REVIEWS = [
  { quote: "The property had everything already, we didn’t need to ask for anything.", who: "Kabir", role: "Guest" },
  { quote: "The space is calm, peaceful, and immaculate.", who: "Santosh", role: "Guest" },
  { quote: "Everything felt fresh, clean and thoughtfully designed.", who: "Avinash", role: "Guest" },
  { quote: "Loved the place, feels like home.", who: "Koushik", role: "Guest" },
  { quote: "It genuinely felt like my little nest in the city.", who: "Jeena", role: "Our first guest" },
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
      className={`relative m-0 mt-4 overflow-hidden px-4 pb-3 pt-4 ${PANEL}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="What guests say"
    >
      <div className="relative grid">
        {REVIEWS.map((r, i) => {
          const on = i === index;
          const words = `“${r.quote}”`.split(" ");
          return (
            <blockquote
              key={r.who}
              aria-hidden={!on}
              className={`col-start-1 row-start-1 m-0 text-pretty font-heading text-h4 text-heading ${on ? "" : "pointer-events-none"}`}
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

      <figcaption className="mt-4 flex items-center justify-between gap-4 border-t border-line-soft pt-3">
        <span className="grid min-w-0">
            {REVIEWS.map((r, i) => (
              <span
                key={r.who}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 flex min-w-0 items-center gap-2 ${ease} duration-300 ${i === index ? "opacity-100" : "opacity-0"}`}
                style={{ transitionDelay: i === index && !reduced ? "300ms" : "0ms" }}
              >
                <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line-soft font-heading text-body text-grape">
                  {r.who[0]}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-geist text-body font-medium text-text">{r.who}</span>
                  <span className="truncate font-geist text-caption text-muted">{r.role}</span>
                </span>
              </span>
            ))}
        </span>
        <span className="flex shrink-0 items-center">
          {REVIEWS.map((r, i) => {
            const on = i === index;
            return (
              <button
                key={r.who}
                type="button"
                onClick={() => go(i)}
                aria-label={`Review ${i + 1} of ${REVIEWS.length}`}
                aria-current={on}
                className="group/dot flex h-6 w-5 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-grape"
              >
                <span
                  className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                    on ? "w-4 bg-grape/20" : "w-1.5 bg-muted/40 group-hover/dot:bg-muted"
                  }`}
                >
                  {on && (
                    <span
                      key={index}
                      className="absolute inset-y-0 left-0 rounded-full bg-grape"
                      style={
                        reduced
                          ? { width: "100%" }
                          : { animation: `review-progress ${REVIEW_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }
                      }
                    />
                  )}
                </span>
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
