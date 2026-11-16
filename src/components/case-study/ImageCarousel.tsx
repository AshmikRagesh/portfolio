"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

/**
 * A few stills shown one at a time in the case study card, for a short sequence that reads
 * in order (e.g. a pull request review, then the work behind it). All slides share one size so
 * the card never jumps between them.
 *
 * Interaction
 *  - Drag or swipe the picture: it follows the pointer 1:1 and presses in slightly, then
 *    settles on the nearest slide. A quick flick is enough, and a faster flick settles faster.
 *    The ends resist (a third of the pointer's pace) so the reader feels the edge.
 *  - With a mouse, the left and right thirds of the picture are click targets: hovering one
 *    shades that edge and shows its arrow, a click goes there.
 *  - A control row under the picture: previous, one segment per slide (click to jump), next.
 *    Buttons at the ends dim instead of vanishing, so the row never shifts.
 *  - Arrow keys move when the carousel has focus; Home and End go to the ends.
 *  - The caption settles in with each slide; a tiny vibration marks a slide change on touch.
 *  - The next slide preloads, so a swipe never shows an empty frame.
 *  - Reduced motion: slides switch without the glide.
 */
type Slide = { src: string; alt: string; caption: string };

const SETTLE = "cubic-bezier(0.22,1,0.36,1)";

export default function ImageCarousel({ slides, width, height }: { slides: Slide[]; width: number; height: number }) {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState<number | null>(null); // px offset while dragging
  const [ms, setMs] = useState(520); // settle duration, shorter after a fast flick
  const [zone, setZone] = useState<"prev" | "next" | null>(null); // mouse hover edge
  const start = useRef<{ x: number; y: number; t: number; id: number; touch: boolean } | null>(null);
  const lastMove = useRef<{ x: number; t: number; v: number }>({ x: 0, t: 0, v: 0 });
  const axis = useRef<"x" | "y" | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const last = slides.length - 1;

  const go = (n: number, touch = false) => {
    const to = Math.min(last, Math.max(0, n));
    if (to !== i && touch) navigator.vibrate?.(6);
    setI(to);
  };

  // Preload the slide after the current one
  useEffect(() => {
    const next = slides[i + 1];
    if (next) new Image().src = next.src;
  }, [i, slides]);

  const zoneAt = (clientX: number) => {
    const r = frame.current!.getBoundingClientRect();
    const x = (clientX - r.left) / r.width;
    return x < 0.3 && i > 0 ? "prev" : x > 0.7 && i < last ? "next" : null;
  };

  const release = (clientX: number) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (axis.current !== "x") {
      // A click without a drag: the hovered edge decides
      if (!s.touch && axis.current === null) {
        const z = zoneAt(clientX);
        if (z) {
          setMs(520);
          go(z === "next" ? i + 1 : i - 1);
        }
      }
      setDrag(null);
      return;
    }
    const w = frame.current?.offsetWidth ?? 1;
    const dx = clientX - s.x;
    const v = Math.abs(lastMove.current.v); // px per ms at release
    const flick = v > 0.45 && Math.abs(dx) > 24;
    // A faster flick settles faster (between 260 and 520ms)
    setMs(flick ? Math.round(Math.max(260, Math.min(520, 520 - v * 160))) : 520);
    if (Math.abs(dx) > w * 0.18 || flick) go(dx < 0 ? i + 1 : i - 1, s.touch);
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
        setMs(520);
        go(next);
      }}
    >
      <div
        ref={frame}
        className={`cs-pair-media relative touch-pan-y select-none overflow-hidden rounded-sm bg-grape-light/40 ${
          drag !== null ? "cursor-grabbing" : zone ? "cursor-pointer" : "cursor-grab"
        }`}
        style={{ aspectRatio: `${width} / ${height}` }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          const touch = e.pointerType !== "mouse";
          start.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, touch };
          lastMove.current = { x: e.clientX, t: performance.now(), v: 0 };
          axis.current = null;
        }}
        onPointerMove={(e) => {
          const s = start.current;
          if (!s || s.id !== e.pointerId) {
            if (e.pointerType === "mouse") setZone(zoneAt(e.clientX));
            return;
          }
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          // Decide once whether this is a sideways drag or a page scroll
          if (axis.current === null && Math.hypot(dx, dy) > 6) {
            axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
            if (axis.current === "x") {
              e.currentTarget.setPointerCapture(e.pointerId);
              setZone(null);
            }
          }
          if (axis.current !== "x") return;
          const now = performance.now();
          const dt = Math.max(1, now - lastMove.current.t);
          lastMove.current = { x: e.clientX, t: now, v: (e.clientX - lastMove.current.x) / dt };
          setDrag(dx);
        }}
        onPointerUp={(e) => release(e.clientX)}
        onPointerLeave={() => setZone(null)}
        onPointerCancel={() => {
          start.current = null;
          setDrag(null);
        }}
      >
        <div
          className="flex h-full motion-reduce:!transition-none"
          style={{
            transform: `translateX(calc(${-i * 100}% + ${offset}px)) scale(${drag !== null ? 0.985 : 1})`,
            transition: drag === null ? `transform ${ms}ms ${SETTLE}` : "transform 160ms ease-out",
          }}
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
              loading={n <= 1 ? undefined : "lazy"}
              aria-hidden={n !== i}
              className={`h-full w-full shrink-0 object-cover transition-opacity duration-500 motion-reduce:transition-none ${n === i || drag !== null ? "opacity-100" : "opacity-40"}`}
            />
          ))}
        </div>

        {/* Mouse hover: the edge you'd go to shades in with its arrow */}
        {(["prev", "next"] as const).map((z) => (
          <div
            key={z}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 flex w-[30%] items-center transition-opacity duration-300 motion-reduce:transition-none ${
              z === "prev" ? "left-0 justify-start bg-gradient-to-r pl-[12px] md:pl-[16px]" : "right-0 justify-end bg-gradient-to-l pr-[12px] md:pr-[16px]"
            } from-[rgba(30,5,37,0.24)] to-transparent ${zone === z ? "opacity-100" : "opacity-0"}`}
          >
            <span
              className={`grid size-[40px] place-items-center rounded-full bg-white/[0.92] text-heading shadow-[0_0_0_0.5px_rgba(30,5,37,0.16),0_4px_16px_-4px_rgba(30,5,37,0.32)] backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                zone === z ? "translate-x-0" : z === "prev" ? "-translate-x-[8px]" : "translate-x-[8px]"
              }`}
            >
              {z === "prev" ? <CaretLeft size={18} weight="bold" /> : <CaretRight size={18} weight="bold" />}
            </span>
          </div>
        ))}
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
                  n === i ? "w-[32px] bg-heading" : "w-[16px] bg-heading/[0.16] group-hover/seg:w-[20px] group-hover/seg:bg-heading/[0.4]"
                }`}
              />
            </button>
          ))}
        </div>
        <button type="button" className={step} aria-label="Next image" data-sound-click="toggle" disabled={i === last} onClick={() => go(i + 1)}>
          <CaretRight size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>
      {/* Same look as CardFooter's caption; keyed by slide so it settles in each time it changes */}
      <figcaption key={i} aria-live="polite" className="cs-caption-in flex flex-col items-center px-[12px] pb-[8px] pt-[16px] text-center [text-wrap:balance] md:px-[16px]">
        <span className="font-geist text-caption-md font-medium uppercase tracking-[0.5px] text-heading">
          {i + 1} of {slides.length} · {slides[i].caption}
        </span>
      </figcaption>
    </figure>
  );
}
