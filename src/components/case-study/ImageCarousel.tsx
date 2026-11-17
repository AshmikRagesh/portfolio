"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

/**
 * A few stills shown one at a time in the case study card, for a short sequence that reads
 * in order (e.g. a pull request review, then the work behind it). All slides share one size so
 * the card never jumps between them.
 *
 * Modelled on Framer's Slideshow component with its controls outside the media:
 *  - Under the picture: a round arrow at each end, and between them a dot per slide (24px tap
 *    target around an 8px dot) above the caption. Nothing sits on top of the screenshot.
 *  - Drag or swipe the picture: it follows the pointer 1:1 and settles on the nearest slide; a
 *    quick flick is enough. The ends resist so the reader feels the edge.
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
      className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px] outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-2"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${slides.length} images`}
      aria-keyshortcuts="ArrowLeft ArrowRight Home End"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? last : null;
        if (next === null) return;
        e.preventDefault();
        jump(next);
      }}
    >
      <div
        ref={frame}
        className={`cs-pair-media relative touch-pan-y select-none overflow-hidden rounded-sm bg-grape-light/40 ${
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
      </div>

      {/* Footer, after Framer's Slideshow with its controls placed outside the media: round
          arrows at the ends, dots and the caption centred between them. Nothing covers the
          screenshot, and the caption keeps the same centred Geist caps as every media card. */}
      <figcaption className="flex items-start gap-[8px] px-[4px] pb-[4px] pt-[12px] md:gap-[16px] md:px-[8px]">
        <Arrow dir="prev" off={i === 0} onGo={() => jump(i - 1)} />
        <div className="flex min-w-0 flex-1 flex-col items-center gap-[8px] pt-[4px]">
          <div className="flex items-center">
            {slides.map((s, n) => (
              <button
                key={s.src}
                type="button"
                aria-label={`Image ${n + 1} of ${slides.length}: ${s.caption}`}
                aria-current={n === i ? "true" : undefined}
                data-sound-click="toggle"
                onClick={() => jump(n)}
                className="group/dot grid size-[24px] place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-heading"
              >
                <span
                  className={`block size-[8px] rounded-full transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    n === i ? "scale-[1.25] bg-heading" : "bg-heading/[0.32] group-hover/dot:bg-heading/[0.56]"
                  }`}
                />
              </button>
            ))}
          </div>
          <p key={i} aria-live="polite" className="cs-caption-in m-0 text-center [text-wrap:balance]">
            <span className="font-geist text-caption-md font-medium uppercase tracking-[0.5px] text-heading">{slides[i].caption}</span>
          </p>
        </div>
        <Arrow dir="next" off={i === last} onGo={() => jump(i + 1)} />
      </figcaption>
    </figure>
  );
}

/**
 * Framer Slideshow's arrow: a 40px white circle with a hairline edge and soft shadow. At an end
 * it fades but stays focusable (aria-disabled), so keyboard focus never drops to the page.
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
      className={`grid size-[40px] shrink-0 place-items-center rounded-full bg-white text-heading shadow-[0_0_0_1px_rgba(30,5,37,0.12),0_2px_6px_-2px_rgba(30,5,37,0.16)] outline-none transition-[opacity,background-color,transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-heading focus-visible:ring-offset-2 motion-reduce:transition-none ${
        off
          ? "cursor-default opacity-[0.4] shadow-[0_0_0_1px_rgba(30,5,37,0.12)]"
          : "hover:bg-grape-light hover:shadow-[0_0_0_1px_rgba(30,5,37,0.16),0_4px_12px_-4px_rgba(30,5,37,0.24)] active:scale-[0.94]"
      }`}
    >
      <Icon size={16} weight="bold" aria-hidden="true" />
    </button>
  );
}
