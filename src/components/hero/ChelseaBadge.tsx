"use client";

// ── Chelsea ───────────────────────────────────────────────────────────────────
// The lion and staff on their own, no circle, cut out of old brass: worn and darkened,
// with rust spreading in from the edges and pitting across the face, and a small
// stamped bar underneath, "CFC · LDN". Everything is drawn live with SVG filters:
// noise for the rust and grain, a bump map from the shape for the raised edges, and a
// point light that follows the pointer, so the shine moves across the metal.
//
// It's decoration, so it stays where it is: hover leans it towards the pointer, a click
// swings it on its pin with a very quiet clink.

import { useId, useRef } from "react";
import { LION_BODY, LION_EYE, LION_RING, LION_STAFF, LION_TRANSFORM, LION_VIEWBOX } from "./lionPath";
import { clink, useCursorLight } from "./light";
import { useReducedMotion } from "./FocusOverlay";

const W = 200;
const H = 300;
const LION_SCALE = Math.min(W / LION_VIEWBOX.w, 256 / LION_VIEWBOX.h);
const LION_X = (W - LION_VIEWBOX.w * LION_SCALE) / 2;

export function LionArt({ id, svgRef }: { id: string; svgRef?: React.Ref<SVGSVGElement> }) {
  const f = (s: string) => `${id}-${s}`;
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        {/* Aged brass: dull, uneven, never shiny-new */}
        <linearGradient id={f("brass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a88b44" />
          <stop offset="0.35" stopColor="#7a6128" />
          <stop offset="0.6" stopColor="#957638" />
          <stop offset="1" stopColor="#4f3c18" />
        </linearGradient>

        <filter id={f("metal")} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          {/* Grain and pitting */}
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
          {/* Large blotches for rust and tarnish */}
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="11" result="blot" />

          {/* The edge band, where rust starts */}
          <feMorphology in="SourceAlpha" operator="erode" radius="5" result="inner" />
          <feComposite in="SourceAlpha" in2="inner" operator="out" result="edge" />
          <feGaussianBlur in="edge" stdDeviation="4" result="edgeSoft" />

          {/* Rust where the blotch noise is high, much more of it near the edges */}
          <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -1.5" result="blotMask" />
          <feComposite in="edgeSoft" in2="blotMask" operator="arithmetic" k1="1.6" k2="0.55" k3="0.6" k4="-0.16" result="rustMask" />
          <feFlood floodColor="#7a3510" result="rustDeep" />
          <feComposite in="rustDeep" in2="rustMask" operator="in" result="rust" />
          {/* Lighter orange bloom inside the rust */}
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -1.1" result="grainMask" />
          <feComposite in="rustMask" in2="grainMask" operator="arithmetic" k1="1.2" k2="0" k3="0" k4="0" result="bloomMask" />
          <feFlood floodColor="#b8561c" result="bloomCol" />
          <feComposite in="bloomCol" in2="bloomMask" operator="in" result="bloom" />

          {/* Dark tarnish in the low blotches */}
          <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 1.15" result="tarnMask" />
          <feFlood floodColor="#2a2412" floodOpacity="0.7" result="tarnCol" />
          <feComposite in="tarnCol" in2="tarnMask" operator="in" result="tarnish" />

          {/* Pits: the brightest grain, punched dark */}
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  7 0 0 0 -4.6" result="pitMask" />
          <feFlood floodColor="#1c1206" floodOpacity="0.8" result="pitCol" />
          <feComposite in="pitCol" in2="pitMask" operator="in" result="pits" />
          {/* Verdigris creeping into the tarnish */}
          <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 -3.4 0 0 1.62" result="greenMask" />
          <feFlood floodColor="#5d7a5a" floodOpacity="0.45" result="greenCol" />
          <feComposite in="greenCol" in2="greenMask" operator="in" result="verdigris" />

          <feMerge result="painted">
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="tarnish" />
            <feMergeNode in="verdigris" />
            <feMergeNode in="rust" />
            <feMergeNode in="bloom" />
            <feMergeNode in="pits" />
          </feMerge>
          <feComposite in="painted" in2="SourceAlpha" operator="in" result="metal" />

          {/* Height: the shape's own bevel plus grain, so the face reads as cast and worn */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="bevel" />
          <feComposite in="bevel" in2="grain" operator="arithmetic" k1="0" k2="1" k3="0.08" k4="0" result="bump" />

          <feDiffuseLighting in="bump" surfaceScale="5" diffuseConstant="1.15" lightingColor="#fff4e0" result="diffuse">
            <fePointLight data-light="" x="40" y="30" z="160" />
          </feDiffuseLighting>
          <feComposite in="metal" in2="diffuse" operator="arithmetic" k1="1.12" k2="0" k3="0" k4="0" result="lit" />

          <feSpecularLighting in="bump" surfaceScale="5" specularConstant="0.55" specularExponent="14" lightingColor="#ffe9b8" result="spec">
            <fePointLight data-light="" x="40" y="30" z="120" />
          </feSpecularLighting>
          {/* No shine where it's rusted */}
          <feComposite in="spec" in2="rustMask" operator="out" result="specClean" />
          <feComposite in="specClean" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="lit" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.6" k4="0" />
        </filter>

        <filter id={f("shadow")} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#1e0525" floodOpacity="0.28" />
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1e0525" floodOpacity="0.16" />
        </filter>
      </defs>

      <g filter={`url(#${f("shadow")})`}>
        <g filter={`url(#${f("metal")})`}>
          {/* The lion and staff */}
          <g transform={`translate(${LION_X} 0) scale(${LION_SCALE}) translate(${-LION_VIEWBOX.x} ${-LION_VIEWBOX.y})`}>
            <g transform={LION_TRANSFORM} fill={`url(#${f("brass")})`}>
              <path d={LION_BODY} />
              <path d={LION_STAFF} />
            </g>
          </g>
          {/* The stamped bar */}
          <rect x="40" y="266" width="120" height="28" rx="4" fill={`url(#${f("brass")})`} />
        </g>
        {/* Holes punched through: the eye and the ring of the staff */}
        <g transform={`translate(${LION_X} 0) scale(${LION_SCALE}) translate(${-LION_VIEWBOX.x} ${-LION_VIEWBOX.y})`}>
          <g transform={LION_TRANSFORM} fill="#2a1a08" opacity="0.85">
            <path d={LION_EYE} />
            <path d={LION_RING} />
          </g>
        </g>
        {/* Letters struck into the bar: dark in the cut, a light lip under each */}
        <text x="100" y="285.5" textAnchor="middle" fontFamily="var(--font-brand), monospace" fontSize="14" fontWeight="700" letterSpacing="3" fill="#fff3d4" opacity="0.4" dy="0.8">
          CFC · LDN
        </text>
        <text x="100" y="285.5" textAnchor="middle" fontFamily="var(--font-brand), monospace" fontSize="14" fontWeight="700" letterSpacing="3" fill="#1c1206" opacity="0.92">
          CFC · LDN
        </text>
      </g>
    </svg>
  );
}

export default function ChelseaBadge({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const swing = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useCursorLight(svg, { w: W, h: H }, { tilt, tiltDeg: 10, reduced });

  const onClick = () => {
    clink();
    if (reduced) return;
    // Swings on its pin, which sits at the top, then settles
    swing.current?.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(9deg)" },
        { transform: "rotate(-6.5deg)" },
        { transform: "rotate(4deg)" },
        { transform: "rotate(-2deg)" },
        { transform: "rotate(0.8deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 1400, easing: "cubic-bezier(0.3, 0.6, 0.4, 1)" },
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Chelsea lion badge"
      className={`group block rotate-[4deg] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
    >
      <div ref={swing} style={{ transformOrigin: "50% 4%" }}>
        <div ref={tilt} className="h-full w-full" style={{ transformStyle: "preserve-3d", aspectRatio: `${W} / ${H}` }}>
          <LionArt id={id} svgRef={svg} />
        </div>
      </div>
    </button>
  );
}
