"use client";

// ── Chelsea ───────────────────────────────────────────────────────────────────
// The lion and staff on their own, no circle, made as a luxury enamel pin: a polished
// gold outline with grape cloisonné enamel inside it (the shape shrunk inwards for the
// enamel, so a raised gold wall runs all the way round), a glossy reflection across the
// enamel, gold eye and staff ring, and a small gold bar underneath, "CFC · LDN", in
// gold on grape. A point light follows the pointer so the polish moves across the gold.
//
// Hover leans it towards the pointer. Click and it comes to the middle of the screen and
// turns over into a small match centre: the next (or live) match, then lineups, stats,
// timeline and news for it, live from ESPN (chelsea/MatchCentre.tsx).

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { LION_BODY, LION_EYE, LION_RING, LION_STAFF, LION_TRANSFORM, LION_VIEWBOX } from "./lionPath";
import { useCursorLight } from "./light";
import HoverTip from "./HoverTip";
import MatchCentreCard, { prefetchChelsea } from "./chelsea/MatchCentre";
import FocusOverlay, { FlipStage, TURN_MS, useReducedMotion, type FocusPhase } from "./FocusOverlay";

const W = 200;
const H = 300;
const LION_SCALE = Math.min(W / LION_VIEWBOX.w, 240 / LION_VIEWBOX.h);
const LION_X = (W - LION_VIEWBOX.w * LION_SCALE) / 2;
const PLACE = `translate(${LION_X} 0) scale(${LION_SCALE}) translate(${-LION_VIEWBOX.x} ${-LION_VIEWBOX.y})`;

function Lion({ fill }: { fill: string }) {
  return (
    <g transform={PLACE}>
      <g transform={LION_TRANSFORM} fill={fill}>
        <path d={LION_BODY} />
        <path d={LION_STAFF} />
      </g>
    </g>
  );
}

export function LionArt({ id, svgRef }: { id: string; svgRef?: React.Ref<SVGSVGElement> }) {
  const f = (s: string) => `${id}-${s}`;
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={f("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="0.22" stopColor="#e3b553" />
          <stop offset="0.45" stopColor="#a06d17" />
          <stop offset="0.62" stopColor="#f7d784" />
          <stop offset="0.82" stopColor="#b8842a" />
          <stop offset="1" stopColor="#6e480c" />
        </linearGradient>
        <linearGradient id={f("enamel")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#b02a83" />
          <stop offset="0.4" stopColor="#7d0f56" />
          <stop offset="1" stopColor="#32073e" />
        </linearGradient>
        <linearGradient id={f("gloss")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.34" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Polished gold: a tight bevel and a sharp highlight from the pointer's light */}
        <filter id={f("goldLit")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="bevel" />
          <feSpecularLighting in="bevel" surfaceScale="4" specularConstant="1.4" specularExponent="38" lightingColor="#fffaf0" result="spec">
            <fePointLight data-light="" x="40" y="30" z="110" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
        {/* Enamel: the lion shrunk inwards so a gold wall shows round it, slightly domed and glossy */}
        <filter id={f("enamelFx")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceGraphic" operator="erode" radius="2.6" result="enamel" />
          <feMorphology in="SourceAlpha" operator="erode" radius="2.6" result="insetA" />
          <feMorphology in="SourceAlpha" operator="erode" radius="5" result="deepA" />
          <feComposite in="insetA" in2="deepA" operator="out" result="lip" />
          <feGaussianBlur in="lip" stdDeviation="1.2" result="lipSoft" />
          <feFlood floodColor="#1e0525" floodOpacity="0.45" />
          <feComposite in2="lipSoft" operator="in" result="lipShade0" />
          <feComposite in="lipShade0" in2="insetA" operator="in" result="lipShade" />
          <feGaussianBlur in="insetA" stdDeviation="3" result="dome" />
          <feSpecularLighting in="dome" surfaceScale="2" specularConstant="0.55" specularExponent="28" lightingColor="#ffe6f6" result="spec">
            <fePointLight data-light="" x="40" y="30" z="140" />
          </feSpecularLighting>
          <feComposite in="spec" in2="insetA" operator="in" result="specIn" />
          <feMerge>
            <feMergeNode in="enamel" />
            <feMergeNode in="lipShade" />
            <feMergeNode in="specIn" />
          </feMerge>
        </filter>
        <filter id={f("shadow")} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#1e0525" floodOpacity="0.3" />
          <feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#1e0525" floodOpacity="0.18" />
        </filter>
        <clipPath id={f("clip")}>
          <path d={LION_BODY} transform={`${PLACE} ${LION_TRANSFORM}`} />
          <path d={LION_STAFF} transform={`${PLACE} ${LION_TRANSFORM}`} />
        </clipPath>
      </defs>

      <g filter={`url(#${f("shadow")})`}>
        {/* Gold body */}
        <g filter={`url(#${f("goldLit")})`}>
          <Lion fill={`url(#${f("gold")})`} />
          <rect x="28" y="250" width="144" height="46" rx="10" fill={`url(#${f("gold")})`} />
        </g>
        {/* Enamel inlay */}
        <g filter={`url(#${f("enamelFx")})`}>
          <Lion fill={`url(#${f("enamel")})`} />
          <rect x="28" y="250" width="144" height="46" rx="10" fill={`url(#${f("enamel")})`} />
        </g>
        {/* Gold eye and staff ring, raised through the enamel */}
        <g filter={`url(#${f("goldLit")})`}>
          <g transform={PLACE}>
            <g transform={LION_TRANSFORM} fill={`url(#${f("gold")})`}>
              <path d={LION_EYE} />
              <path d={LION_RING} />
            </g>
          </g>
        </g>
        {/* A sweep of reflection over the pin */}
        <rect x="0" y="0" width={W} height="244" fill={`url(#${f("gloss")})`} clipPath={`url(#${f("clip")})`} />
        {/* Gold letters standing up out of the bar's enamel */}
        <text x="100" y="281" textAnchor="middle" fontFamily="var(--font-geist), sans-serif" fontSize="22" fontWeight="700" letterSpacing="2" fill="#1e0525" opacity="0.45" dy="1.2">
          CFC · LDN
        </text>
        <text x="100" y="281" textAnchor="middle" fontFamily="var(--font-geist), sans-serif" fontSize="22" fontWeight="700" letterSpacing="2" fill={`url(#${f("gold")})`}>
          CFC · LDN
        </text>
      </g>
    </svg>
  );
}

// ── In the hero ───────────────────────────────────────────────────────────────
export default function ChelseaBadge({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  useCursorLight(svg, { w: W, h: H }, { tilt, tiltDeg: 10, reduced });
  const onClosed = useCallback(() => setOpen(false), []);

  // Fetch the match data and crests while the page is idle, so the card opens with no
  // loading; hover and focus top it up if it has gone stale
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
    if (w.requestIdleCallback) {
      const h = w.requestIdleCallback(prefetchChelsea, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(h);
    }
    const t = window.setTimeout(prefetchChelsea, 1500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={prefetchChelsea}
        onFocus={prefetchChelsea}
        aria-label="Chelsea lion pin. See the next match"
        aria-haspopup="dialog"
        className={`group group/tip relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <div ref={tilt} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <LionArt id={id} svgRef={svg} />
        </div>
        <HoverTip>When Chelsea play next</HoverTip>
      </button>

      <FocusOverlay source={btn.current} open={open} onClosed={onClosed} label="Chelsea's next match" width={W} height={H} fitWidth={W} fitHeight={H} closeMs={reduced ? 0 : TURN_MS}>
        {(phase) => <LionStage id={`${id}big`} phase={phase} />}
      </FocusOverlay>
    </>
  );
}

function LionStage({ id, phase }: { id: string; phase: FocusPhase }) {
  const svg = useRef<SVGSVGElement>(null);
  useCursorLight(svg, { w: W, h: H });
  return <FlipStage phase={phase} front={<LionArt id={id} svgRef={svg} />} back={<MatchCentreCard />} />;
}
