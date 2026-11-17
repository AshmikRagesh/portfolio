"use client";

import useInView from "./useInView";
import { CardFooter } from "./Blocks";

/**
 * A screenshot marked up by hand: each finding circles the thing it's about with a pen
 * ring, and a handwritten note in the margin points at it with a curved arrow. Notes sit in
 * a strip above or below the picture, so they never cover the screenshot's own text.
 *
 * Drawing: once in view, each note plays in turn — the ring draws itself, then the arrow,
 * then the note fades up. Reduced motion shows everything drawn.
 * Phones: the picture keeps its rings with a small number beside each, and the notes
 * follow underneath as a numbered handwritten list (margin text would be too small).
 *
 * Coordinates are fractions of the picture (0–1 across, 0–1 down), so the notes stay on
 * their targets at any width.
 */
type Note = {
  /** The handwritten note, one string per line */
  lines: string[];
  /** Which margin strip the note sits in */
  side: "top" | "bottom";
  /** Where the note's text starts, as a fraction across */
  x: number;
  /** The ring around the target: centre and radii, as fractions of the picture */
  ring: { cx: number; cy: number; rx: number; ry: number };
  /** Where the arrow leaves the note, as a fraction across (defaults to the text start + a bit) */
  from?: number;
  /** How far the arrow bows sideways, in canvas units (negative bows left) */
  bow?: number;
};

const W = 1000; // canvas width, in SVG units
const STRIP = 120; // height of each margin strip
const SIZE = 36; // note font size
const LINE = 36; // note line height
const GRAPE = "#9D136A";
const INK = "#32073e";

// A hand-drawn ring: an ellipse that overshoots its start a little, like a pen loop
function ringPath(cx: number, cy: number, rx: number, ry: number) {
  const pts: string[] = [];
  const steps = 36;
  for (let i = 0; i <= steps + 4; i++) {
    const t = -Math.PI / 2 + (i / steps) * Math.PI * 2;
    // a slight wobble and a widening loop, so it reads as drawn rather than set
    const k = 1 + 0.04 * Math.sin(i * 0.9) + (i > steps ? 0.06 : 0);
    pts.push(`${(cx + rx * k * Math.cos(t)).toFixed(1)},${(cy + ry * k * Math.sin(t)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

// A curved arrow from (x1,y1) to (x2,y2), bowing sideways; returns the shaft and the head
function arrowPaths(x1: number, y1: number, x2: number, y2: number, bow: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // control point pushed off the straight line, at right angles to it
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  const shaft = `M${x1},${y1} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2},${y2}`;
  // the head follows the curve's direction where it lands
  const a = Math.atan2(y2 - cy, x2 - cx);
  const h = 18;
  const s = 0.5;
  const head = `M${(x2 - h * Math.cos(a - s)).toFixed(1)},${(y2 - h * Math.sin(a - s)).toFixed(1)} L${x2},${y2} L${(x2 - h * Math.cos(a + s)).toFixed(1)},${(y2 - h * Math.sin(a + s)).toFixed(1)}`;
  return { shaft, head };
}

export default function AnnotatedFigure({
  src,
  alt,
  width,
  height,
  notes,
  label,
}: {
  src: string;
  alt: string;
  /** The picture's pixel size, so the canvas keeps its exact shape */
  width: number;
  height: number;
  notes: Note[];
  /** The line under the card: what the markings are */
  label?: string;
}) {
  const [ref, shown] = useInView<HTMLDivElement>(0.35);
  const ih = (W * height) / width; // picture height on the canvas
  const hasTop = notes.some((n) => n.side === "top");
  const hasBottom = notes.some((n) => n.side === "bottom");
  const top = hasTop ? STRIP : 0;
  const H = top + ih + (hasBottom ? STRIP : 0);

  // Drawn in order: ring, then arrow, then note; each note starts once the last is down
  const step = 900;
  const draw = (i: number, part: 0 | 1 | 2) => ({
    transitionDelay: `${i * step + part * 300}ms`,
  });
  const stroke = (on: boolean) =>
    `transition-[stroke-dashoffset] duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
      on ? "[stroke-dashoffset:0]" : "[stroke-dashoffset:1]"
    }`;

  const rings = (oy: number, scaleNumbers: boolean) =>
    notes.map((n, i) => {
      const cx = n.ring.cx * W;
      const cy = oy + n.ring.cy * ih;
      const rx = n.ring.rx * W;
      const ry = n.ring.ry * ih;
      return (
        <g key={i}>
          {/* white under-stroke so the ring reads over dark and light parts of the screenshot */}
          <path d={ringPath(cx, cy, rx, ry)} pathLength={1} strokeDasharray="1" fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" className={stroke(shown)} style={draw(i, 0)} />
          <path d={ringPath(cx, cy, rx, ry)} pathLength={1} strokeDasharray="1" fill="none" stroke={GRAPE} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className={stroke(shown)} style={draw(i, 0)} />
          {scaleNumbers && (
            <g className={`transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`} style={draw(i, 1)}>
              <circle cx={cx + rx + 30} cy={cy - ry - 10} r="30" fill={GRAPE} stroke="white" strokeWidth="5" />
              <text x={cx + rx + 30} y={cy - ry + 3} textAnchor="middle" fontSize="36" fontWeight="700" fill="white" style={{ fontFamily: "var(--font-geist)" }}>
                {i + 1}
              </text>
            </g>
          )}
        </g>
      );
    });

  return (
    <figure className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px]">
      <div ref={ref} className="relative">
        {/* Desktop and tablet: the picture between its margin strips, notes and arrows drawn over all */}
        <svg viewBox={`0 0 ${W} ${H.toFixed(1)}`} role="img" aria-label={alt} className="hidden h-auto w-full md:block">
          <image href={src} x="0" y={top} width={W} height={ih} className="[clip-path:inset(0_round_4px)]" />
          {rings(top, false)}
          {notes.map((n, i) => {
            const textY = n.side === "top" ? 44 : top + ih + STRIP - 28 - (n.lines.length - 1) * LINE;
            const fx = (n.from ?? n.x + 0.06) * W;
            const fy = n.side === "top" ? textY + (n.lines.length - 1) * LINE + 18 : textY - SIZE + 4;
            const tx = n.ring.cx * W;
            const ty = top + n.ring.cy * ih + (n.side === "top" ? -n.ring.ry * ih - 8 : n.ring.ry * ih + 8);
            const { shaft, head } = arrowPaths(fx, fy, tx, ty, n.bow ?? 40);
            return (
              <g key={i}>
                {[shaft, head].map((d, k) => (
                  <g key={k}>
                    <path d={d} pathLength={1} strokeDasharray="1" fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className={stroke(shown)} style={draw(i, 1)} />
                    <path d={d} pathLength={1} strokeDasharray="1" fill="none" stroke={GRAPE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={stroke(shown)} style={draw(i, 1)} />
                  </g>
                ))}
                <text
                  aria-hidden="true"
                  x={n.x * W}
                  y={textY}
                  fontSize={SIZE}
                  fill={INK}
                  style={{ fontFamily: "var(--font-handwriting)", ...draw(i, 2) }}
                  className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
                    shown ? "translate-y-0 opacity-100" : "translate-y-[6px] opacity-0"
                  }`}
                >
                  {n.lines.map((l, k) => (
                    <tspan key={k} x={n.x * W} dy={k === 0 ? 0 : LINE}>
                      <tspan fill={GRAPE}>{k === 0 ? `${i + 1}. ` : ""}</tspan>
                      {l}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Phones: rings with numbers on the picture, the notes listed below */}
        <div className="md:hidden">
          <svg viewBox={`0 0 ${W} ${ih.toFixed(1)}`} role="img" aria-label={alt} className="block h-auto w-full">
            <image href={src} x="0" y="0" width={W} height={ih} />
            {rings(0, true)}
          </svg>
          <ol className="m-0 mt-[12px] flex list-none flex-col gap-[4px] px-[8px] p-0">
            {notes.map((n, i) => (
              <li
                key={i}
                className={`font-handwriting text-[24px] leading-[28px] text-heading transition-opacity duration-500 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
                style={draw(i, 2)}
              >
                <span className="text-grape">{i + 1}. </span>
                {n.lines.join(" ")}
              </li>
            ))}
          </ol>
        </div>

        {/* The notes as text, for screen readers on every size */}
        <ol className="sr-only">
          {notes.map((n, i) => (
            <li key={i}>{n.lines.join(" ")}</li>
          ))}
        </ol>
      </div>
      <CardFooter label={label} />
    </figure>
  );
}
