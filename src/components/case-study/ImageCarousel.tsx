"use client";

import { useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CardFooter } from "./Blocks";

/**
 * A few stills shown one at a time in the case study card, for a short sequence that reads
 * in order (e.g. spot a miss → fix it → review). All slides share one size so the card never
 * jumps between them.
 *
 * Interaction: arrow buttons on the picture, dots under it, swipe on touch, and the arrow keys
 * when the carousel has focus. The caption under the picture names the current slide and reads
 * like every other media caption (Geist caps, heading colour).
 */
type Slide = { src: string; alt: string; caption: string };

export default function ImageCarousel({ slides, width, height }: { slides: Slide[]; width: number; height: number }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const last = slides.length - 1;
  const go = (n: number) => setI(Math.min(last, Math.max(0, n)));

  const arrow =
    "absolute top-1/2 z-[1] grid size-[36px] -translate-y-1/2 place-items-center rounded-full bg-white/90 text-heading shadow-[0_0_0_0.5px_rgba(30,5,37,0.16),0_2px_8px_rgba(30,5,37,0.16)] backdrop-blur-sm transition-opacity hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading disabled:pointer-events-none disabled:opacity-0";

  return (
    <figure
      className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px]"
      role="region"
      aria-roledescription="carousel"
      aria-label={slides.map((s) => s.caption).join(", then ")}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(i + 1);
        if (e.key === "ArrowLeft") go(i - 1);
      }}
    >
      <div
        className="cs-pair-media relative touch-pan-y select-none overflow-hidden rounded-sm bg-grape-light/40"
        style={{ aspectRatio: `${width} / ${height}` }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
        }}
        onPointerCancel={() => (startX.current = null)}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${i * 100}%)` }}
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
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>
        <button type="button" className={`${arrow} left-[8px] md:left-[12px]`} aria-label="Previous" data-sound-click="toggle" disabled={i === 0} onClick={() => go(i - 1)}>
          <CaretLeft size={16} weight="bold" aria-hidden="true" />
        </button>
        <button type="button" className={`${arrow} right-[8px] md:right-[12px]`} aria-label="Next" data-sound-click="toggle" disabled={i === last} onClick={() => go(i + 1)}>
          <CaretRight size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className="flex justify-center gap-[8px] pt-[12px]">
        {slides.map((s, n) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show ${n + 1} of ${slides.length}: ${s.caption}`}
            aria-current={n === i}
            data-sound-click="toggle"
            onClick={() => go(n)}
            className="grid size-[16px] place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-heading"
          >
            <span className={`block h-[6px] rounded-full transition-all duration-300 ${n === i ? "w-[16px] bg-heading" : "w-[6px] bg-heading/[0.24]"}`} />
          </button>
        ))}
      </div>
      <CardFooter caption={`${i + 1} of ${slides.length} · ${slides[i].caption}`} />
    </figure>
  );
}
