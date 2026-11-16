"use client";

import { useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CardFooter } from "./Blocks";

/**
 * A few stills shown one at a time in the case study card, for a short sequence that reads
 * in order (e.g. a pull request review, then the work behind it). All slides share one size so
 * the card never jumps between them.
 *
 * Interaction
 *  - Drag or swipe the picture: it follows the pointer, then settles on the nearest slide
 *    (a quick flick is enough). The ends resist a little so the reader feels the edge.
 *  - A control row under the picture: previous, one segment per slide (click to jump), next.
 *    Buttons at the ends dim instead of vanishing, so the row never shifts.
 *  - Arrow keys move when the carousel has focus; Home and End go to the ends.
 *  - Reduced motion: slides switch without the glide.
 * The caption under the row names the current slide like every other media caption.
 */
type Slide = { src: string; alt: string; caption: string };

export default function ImageCarousel({ slides, width, height }: { slides: Slide[]; width: number; height: number }) {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState<number | null>(null); // px offset while dragging
  const start = useRef<{ x: number; y: number; t: number; id: number } | null>(null);
  const axis = useRef<"x" | "y" | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const last = slides.length - 1;
  const go = (n: number) => setI(Math.min(last, Math.max(0, n)));

  const release = (clientX: number) => {
    const s = start.current;
    start.current = null;
    if (!s || drag === null) return setDrag(null);
    const w = frame.current?.offsetWidth ?? 1;
    const dx = clientX - s.x;
    const fast = Math.abs(dx) / Math.max(1, performance.now() - s.t) > 0.5; // px per ms
    if (Math.abs(dx) > w * 0.18 || (fast && Math.abs(dx) > 24)) go(dx < 0 ? i + 1 : i - 1);
    setDrag(null);
  };

  // Past the first or last slide the picture moves at a third of the pointer's pace
  const offset = drag === null ? 0 : (i === 0 && drag > 0) || (i === last && drag < 0) ? drag / 3 : drag;

  const step =
    "grid size-[36px] shrink-0 place-items-center rounded-full text-heading transition-[background-color,opacity,transform] duration-200 hover:bg-grape-light active:scale-[0.92] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading disabled:pointer-events-none disabled:opacity-[0.32] motion-reduce:transition-none";

  return (
    <figure
      className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px] outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-2"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${slides.length} images: ${slides.map((s) => s.caption).join(", then ")}`}
      tabIndex={0}
      onKeyDown={(e) => {
        const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? last : null;
        if (next === null) return;
        e.preventDefault();
        go(next);
      }}
    >
      <div
        ref={frame}
        className={`cs-pair-media relative touch-pan-y select-none overflow-hidden rounded-sm bg-grape-light/40 ${drag !== null ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ aspectRatio: `${width} / ${height}` }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          start.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
          axis.current = null;
        }}
        onPointerMove={(e) => {
          const s = start.current;
          if (!s || s.id !== e.pointerId) return;
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          // Decide once whether this is a sideways drag or a page scroll
          if (axis.current === null && Math.hypot(dx, dy) > 6) {
            axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
            if (axis.current === "x") e.currentTarget.setPointerCapture(e.pointerId);
          }
          if (axis.current === "x") setDrag(dx);
        }}
        onPointerUp={(e) => release(e.clientX)}
        onPointerCancel={() => {
          start.current = null;
          setDrag(null);
        }}
      >
        <div
          className={`flex h-full ${drag === null ? "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" : ""}`}
          style={{ transform: `translateX(calc(${-i * 100}% + ${offset}px))` }}
        >
          {slides.map((s, n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.src}
              src={s.src}
              alt={s.alt}
              width={width}
              height={height}
              draggable={false}
              loading={n === 0 ? undefined : "lazy"}
              aria-hidden={n !== i}
              className={`h-full w-full shrink-0 object-cover transition-opacity duration-500 motion-reduce:transition-none ${n === i || drag !== null ? "opacity-100" : "opacity-40"}`}
            />
          ))}
        </div>
      </div>

      {/* Previous · one segment per slide · next */}
      <div className="flex items-center justify-center gap-[12px] pt-[12px]">
        <button type="button" className={step} aria-label="Previous image" data-sound-click="toggle" disabled={i === 0} onClick={() => go(i - 1)}>
          <CaretLeft size={16} weight="bold" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-[4px]">
          {slides.map((s, n) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Image ${n + 1} of ${slides.length}: ${s.caption}`}
              aria-current={n === i ? "true" : undefined}
              data-sound-click="toggle"
              onClick={() => go(n)}
              className="group/seg grid h-[24px] place-items-center px-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-heading"
            >
              <span
                className={`block h-[4px] rounded-full transition-[width,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  n === i ? "w-[32px] bg-heading" : "w-[16px] bg-heading/[0.16] group-hover/seg:bg-heading/[0.4]"
                }`}
              />
            </button>
          ))}
        </div>
        <button type="button" className={step} aria-label="Next image" data-sound-click="toggle" disabled={i === last} onClick={() => go(i + 1)}>
          <CaretRight size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>
      <CardFooter caption={`${i + 1} of ${slides.length} · ${slides[i].caption}`} />
    </figure>
  );
}
