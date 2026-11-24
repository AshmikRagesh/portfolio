"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Expanded } from "./Media";

/**
 * A few stills shown one at a time in the case study card, for a short sequence that reads
 * in order (e.g. a pull request review, then the work behind it). All slides share one size so
 * the card never jumps between them.
 *
 * Controls follow the usual gallery pattern:
 *  - On the picture: a white arrow centred on each side, and the dots centred on the
 *    bottom edge. The caption sits straight under the picture, like every other media card.
 *  - Drag or swipe the picture: it follows the pointer 1:1 and settles on the nearest slide; a
 *    quick flick is enough. The ends resist so the reader feels the edge.
 *  - Tap or click the picture (without dragging), or press Enter, to see the slide large.
 *  - Arrow keys move when the carousel has focus; Home and End go to the ends.
 *  - The caption is read out when the slide changes.
 *  - Reduced motion: slides switch without the glide.
 */
type Slide = { src: string; alt: string; caption: string };

const SETTLE = "cubic-bezier(0.22,1,0.36,1)";

export default function ImageCarousel({ slides, width, height }: { slides: Slide[]; width: number; height: number }) {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState<number | null>(null); // px offset while dragging
  const [ms, setMs] = useState(520); // settle duration, shorter after a fast flick
  const start = useRef<{ x: number; y: number; id: number; touch: boolean } | null>(null);
  const lastMove = useRef<{ x: number; t: number; v: number }>({ x: 0, t: 0, v: 0 });
  const axis = useRef<"x" | "y" | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const last = slides.length - 1;
  const [zoom, setZoom] = useState(false);
  const shut = useCallback(() => setZoom(false), []);

  const go = (n: number, touch = false) => {
    const to = Math.min(last, Math.max(0, n));
    if (to !== i && touch) navigator.vibrate?.(6);
    setI(to);
  };
  const jump = (n: number) => {
    setMs(520);
    go(n);
  };

  // Preload the slide after the current one
  useEffect(() => {
    const next = slides[i + 1];
    if (next) new Image().src = next.src;
  }, [i, slides]);

  const release = (clientX: number) => {
    const s = start.current;
    start.current = null;
    // A tap that never moved far enough to pick a direction opens the slide large
    if (s && axis.current === null) setZoom(true);
    if (!s || axis.current !== "x") {
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

  return (
    <figure
      className="m-0 flex min-w-0 flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${slides.length} images`}
      aria-keyshortcuts="ArrowLeft ArrowRight Home End"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter") {
          e.preventDefault();
          setZoom(true);
          return;
        }
        const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? last : null;
        if (next === null) return;
        e.preventDefault();
        jump(next);
      }}
    >
      <div
        ref={frame}
        className={`cs-pair-media relative touch-pan-y select-none overflow-hidden rounded-lg bg-grape-light/40 ${
          drag !== null ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ aspectRatio: `${width} / ${height}` }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, touch: e.pointerType !== "mouse" };
          lastMove.current = { x: e.clientX, t: performance.now(), v: 0 };
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
          if (axis.current !== "x") return;
          const now = performance.now();
          const dt = Math.max(1, now - lastMove.current.t);
          lastMove.current = { x: e.clientX, t: now, v: (e.clientX - lastMove.current.x) / dt };
          setDrag(dx);
        }}
        onPointerUp={(e) => release(e.clientX)}
        onPointerCancel={() => {
          start.current = null;
          setDrag(null);
        }}
      >
        <div
          className="flex h-full motion-reduce:!transition-none"
          style={{
            transform: `translateX(calc(${-i * 100}% + ${offset}px))`,
            transition: drag === null ? `transform ${ms}ms ${SETTLE}` : "none",
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
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>

        <Arrow dir="prev" off={i === 0} onGo={() => jump(i - 1)} />
        <Arrow dir="next" off={i === last} onGo={() => jump(i + 1)} />

        {/* Dots centred on the bottom edge, on a dark glass chip so they read over any
            screenshot. Each dot is a 24px target around an 8px dot; the current one is a bar. */}
        <div
          className="absolute bottom-[8px] left-1/2 z-[2] flex -translate-x-1/2 items-center rounded-full bg-[rgba(30,5,37,0.72)] px-[4px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl backdrop-saturate-150 md:bottom-[12px]"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          {slides.map((s, n) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Image ${n + 1} of ${slides.length}: ${s.caption}`}
              aria-current={n === i ? "true" : undefined}
              data-sound-click="toggle"
              onClick={() => jump(n)}
              className={`group/dot grid h-[24px] place-items-center rounded-full outline-none transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-white/[0.64] motion-reduce:transition-none ${
                n === i ? "w-[32px] cursor-default" : "w-[24px]"
              }`}
            >
              <span
                className={`block h-[6px] rounded-full transition-[width,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  n === i ? "w-[20px] bg-white" : "w-[6px] bg-white/[0.48] [@media(hover:hover)]:group-hover/dot:bg-white/[0.8]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Same look as CardFooter's caption; keyed by slide so it settles in each time it changes */}
      <figcaption key={i} aria-live="polite" className="cs-caption-in flex flex-col pt-[16px] text-left [text-wrap:pretty]">
        <span className="font-body text-body-md text-subtle">{slides[i].caption}</span>
      </figcaption>

      {zoom && (
        <Expanded label={slides[i].caption} ratio={width / height} onClose={shut}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async" src={slides[i].src} alt={slides[i].alt} className="block h-full w-full bg-white object-contain" />
        </Expanded>
      )}
    </figure>
  );
}

/**
 * The usual on-image arrow: a white circle centred on the picture's left or right edge.
 *  - Always visible (no hover needed to find it); hidden at the first and last slide.
 *  - Hover (mouse and trackpad only, so a tap never leaves it stuck): it grows a touch and its
 *    shadow deepens. Press: it sinks (scale 0.92) in 100ms and springs back.
 *  - At an end it stays focusable (aria-disabled, shown faint while focused), so keyboard focus
 *    never drops to the page.
 */
function Arrow({ dir, off, onGo }: { dir: "prev" | "next"; off: boolean; onGo: () => void }) {
  const Icon = dir === "prev" ? CaretLeft : CaretRight;
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous image" : "Next image"}
      aria-disabled={off || undefined}
      data-sound-click={off ? undefined : "toggle"}
      onClick={() => !off && onGo()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className={`absolute top-1/2 z-[2] grid size-[36px] -translate-y-1/2 place-items-center rounded-full bg-white text-heading shadow-[0_0_0_1px_rgba(30,5,37,0.08),0_4px_12px_-2px_rgba(30,5,37,0.32)] outline-none transition-[opacity,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-heading focus-visible:ring-offset-2 motion-reduce:transition-none md:size-[40px] ${
        dir === "prev" ? "left-[8px] md:left-[12px]" : "right-[8px] md:right-[12px]"
      } ${
        off
          ? "pointer-events-none opacity-0 focus-visible:opacity-[0.4]"
          : "opacity-100 active:scale-[0.92] active:duration-100 [@media(hover:hover)]:hover:scale-[1.08] [@media(hover:hover)]:hover:shadow-[0_0_0_1px_rgba(30,5,37,0.08),0_8px_20px_-4px_rgba(30,5,37,0.4)]"
      }`}
    >
      <Icon size={16} weight="bold" aria-hidden="true" />
    </button>
  );
}
