"use client";

import { useEffect, useId, useRef, useState } from "react";

// Hand-drawn signature in blue pen ink. Strokes draw in, one after another, the first
// time it scrolls into view (instantly with reduced motion — see .signature in globals.css).
//
// Ink look, per stroke:
//   • bleed — a slightly wider, lighter blue line where the ink has spread into the paper
//   • core  — a narrower, deeper blue line on top
//   • a faint turbulence wobble so the line isn't machine-perfect
// Bleed and core live in two groups in the same order, so the nth-child stagger in
// globals.css draws stroke n's bleed and core together. Multiply blend (set by the card)
// lets the paper's ruled lines show through the ink.
const INK_BLEED = "#3557b7";
const INK_CORE = "#1c2f7d";

export default function Signature({ strokes, label, className = "" }: { strokes: string[]; label: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const layer = (color: string, width: number, opacity: number) =>
    strokes.map((d, i) => (
      <path
        key={i}
        d={d}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ));

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={`Signature of ${label}`}
      viewBox="0 0 168 72"
      width="168"
      height="72"
      data-drawn={drawn}
      className={`signature ${className}`}
    >
      <defs>
        <filter id={`pen-${id}`} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" />
        </filter>
      </defs>
      <g filter={`url(#pen-${id})`}>
        <g>{layer(INK_BLEED, 2.4, 0.45)}</g>
        <g>{layer(INK_CORE, 1.3, 0.95)}</g>
      </g>
    </svg>
  );
}
