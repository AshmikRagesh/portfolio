"use client";

import { useEffect, useId, useRef, useState } from "react";

// Hand-drawn signature in blue pen ink. The first time it scrolls into view it's written
// out like a real signature: strokes go in order, left to right, at one steady pen speed
// (each stroke's duration comes from its measured length) with a short lift between them.
// Instant with reduced motion — see .signature in globals.css.
//
// Ink look, per stroke:
//   • bleed — a slightly wider, lighter blue line where the ink has spread into the paper
//   • core  — a narrower, deeper blue line on top
//   • a faint turbulence wobble so the line isn't machine-perfect
// Bleed and core live in two groups in the same order and share each stroke's timing,
// so stroke n's bleed and core draw together. Multiply blend (set by the card)
// lets the paper's ruled lines show through the ink.
const INK_BLEED = "#3557b7";
const INK_CORE = "#1c2f7d";
const PEN_SPEED = 240; // viewBox units per second
const PEN_LIFT = 0.12; // seconds between strokes
const MIN_STROKE = 0.08; // seconds, so a dot still shows as a dab

export default function Signature({ strokes, label, className = "" }: { strokes: string[]; label: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [timing, setTiming] = useState<{ duration: number; delay: number }[]>([]);
  const id = useId().replace(/:/g, "");

  // Time each stroke from its real length, back to back
  useEffect(() => {
    const paths = ref.current?.querySelectorAll<SVGPathElement>("g > g:last-child > path");
    if (!paths) return;
    let t = 0;
    setTiming(
      Array.from(paths).map((p) => {
        const duration = Math.max(MIN_STROKE, p.getTotalLength() / PEN_SPEED);
        const slot = { duration, delay: t };
        t += duration + PEN_LIFT;
        return slot;
      })
    );
  }, [strokes]);

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
        style={timing[i] && { transitionDuration: `${timing[i].duration}s`, transitionDelay: `${timing[i].delay}s` }}
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
