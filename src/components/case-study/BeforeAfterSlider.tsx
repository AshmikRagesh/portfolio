"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Before and after as one picture. The after sits underneath and the before on top, cut off
 * at a handle. Both stills must be captured at the same size and framing (same page, same
 * window) so only the change moves when the handle passes over it.
 *
 * Interaction
 *  - Drag anywhere on the picture (mouse, pen or touch); a tap glides the handle there.
 *    Vertical swipes still scroll the page on a phone.
 *  - Keyboard: the grip is a slider (role="slider"): arrows move 2%, Shift+arrows 10%,
 *    Home and End go to the ends.
 *  - The first time it comes into view, the handle sweeps across the change and back once,
 *    so the reader sees there's something to compare. Reduced motion skips the sweep and
 *    every glide.
 *
 * Look: the picture sits in the case study card (white, 8px inset, 4px frame) like the other
 * visuals. The handle is a thin white line with a round grip that lifts on hover and presses
 * in while dragged. No labels on the picture: one line on top of the card names the side that fills most
 * of it (past 55% the before, under 45% the after, "Drag to compare" between) and crossfades
 * as the handle moves.
 */
type Shot = { src: string; alt: string };
type Side = { title: string; note: string };

const clamp = (n: number) => Math.min(100, Math.max(0, n));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function BeforeAfterSlider({
  before,
  after,
  width,
  height,
  start = 50,
  sweepTo,
  labels,
}: {
  before: Shot;
  after: Shot;
  /** The stills' pixel size, so the frame keeps their exact shape */
  width: number;
  height: number;
  /** Where the handle rests, in % from the left */
  start?: number;
  /** Where the first-view sweep turns back, in % from the left (no sweep without it) */
  sweepTo?: number;
  /** The label on top of the card, naming the side that fills most of the picture */
  labels?: { before: Side; after: Side };
}) {
  const [pos, setPosState] = useState(start);
  const [dragging, setDragging] = useState(false);
  const posRef = useRef(start);
  const box = useRef<HTMLDivElement>(null);
  const anim = useRef<number | null>(null);
  const touched = useRef(false);
  // Which side the label names: the one that fills most of the picture. A 3% margin either
  // side of each threshold keeps it from flickering when the handle rests on the line.
  const [side, setSide] = useState<"before" | "after" | null>(start >= 55 ? "before" : start <= 45 ? "after" : null);
  useEffect(() => {
    setSide((s) => {
      if (pos >= (s === "before" ? 52 : 55)) return "before";
      if (pos <= (s === "after" ? 48 : 45)) return "after";
      return null;
    });
  }, [pos]);

  const setPos = (n: number) => {
    posRef.current = n;
    setPosState(n);
  };
  const stop = () => {
    if (anim.current !== null) cancelAnimationFrame(anim.current);
    anim.current = null;
  };

  // Glide the handle through one or more points, unless the reader prefers less motion
  const glide = useCallback((stops: number[], ms: number) => {
    stop();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPos(stops[stops.length - 1]);
      return;
    }
    const path = [posRef.current, ...stops];
    const leg = ms / stops.length;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(ms, now - t0);
      const i = Math.min(stops.length - 1, Math.floor(t / leg));
      const k = Math.min(1, (t - i * leg) / leg);
      setPos(path[i] + (path[i + 1] - path[i]) * ease(k));
      anim.current = t < ms ? requestAnimationFrame(step) : null;
    };
    anim.current = requestAnimationFrame(step);
  }, []);

  // The one-time sweep when the picture first comes into view
  useEffect(() => {
    const el = box.current;
    if (!el || sweepTo === undefined) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(() => {
          if (!touched.current) glide([sweepTo, start], 2400);
        }, 500);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      stop();
    };
  }, [glide, start, sweepTo]);

  const at = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    return clamp(((clientX - r.left) / r.width) * 100);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const big = e.shiftKey ? 10 : 2;
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowDown" ? posRef.current - big
      : e.key === "ArrowRight" || e.key === "ArrowUp" ? posRef.current + big
      : e.key === "Home" ? 0
      : e.key === "End" ? 100
      : null;
    if (next === null) return;
    e.preventDefault();
    touched.current = true;
    stop();
    setPos(clamp(next));
  };

  return (
    <figure className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px]">
      {labels && (
        // The card's label, on top like every case study card: it names the side that fills most of
        // the picture; the three states
        // share one grid cell and crossfade with a small lift
        <figcaption aria-live="polite" className="grid px-[12px] pb-[12px] pt-[8px] md:px-[16px] md:pb-[16px] md:pt-[12px]">
          {(
            [
              ["before", <>{"\u2190 "}{labels.before.title}</>, labels.before.note],
              ["after", <>{labels.after.title}{" \u2192"}</>, labels.after.note],
            ] as const
          ).map(([key, title, note]) => (
            <span
              key={key}
              aria-hidden={side !== key}
              className={`col-start-1 row-start-1 flex flex-col items-start gap-[2px] text-left transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
                side === key ? "translate-y-0 opacity-100 blur-0" : "pointer-events-none translate-y-[4px] opacity-0 blur-[2px]"
              }`}
            >
              <span className="font-body text-body font-medium text-heading md:text-body-md">{title}</span>
              <span className="font-body text-caption-lg text-muted">{note}</span>
            </span>
          ))}
          <span
            aria-hidden={side !== null}
            className={`col-start-1 row-start-1 flex items-center justify-start gap-[6px] self-center font-geist text-caption-md font-medium uppercase tracking-[1px] text-muted transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
              side === null ? "translate-y-0 opacity-100 blur-0" : "pointer-events-none translate-y-[4px] opacity-0 blur-[2px]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m8 7-5 5 5 5M16 7l5 5-5 5M3 12h18" />
            </svg>
            Drag to compare
          </span>
        </figcaption>
      )}
      <div
        ref={box}
        className={`cs-pair-media group/ba relative touch-pan-y select-none overflow-hidden rounded-sm bg-grape-light/40 ${
          dragging ? "cursor-grabbing" : "cursor-ew-resize"
        }`}
        style={{ aspectRatio: `${width} / ${height}` }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          touched.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          glide([at(e.clientX)], 240);
        }}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          stop();
          setPos(at(e.clientX));
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after.src} alt={after.alt} width={width} height={height} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before.src}
          alt={before.alt}
          width={width}
          height={height}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />

        {/* The handle: a hairline with a round grip */}
        <div className="pointer-events-none absolute inset-y-0 z-[1] w-0" style={{ left: `${pos}%` }}>
          <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-white shadow-[0_0_0_0.5px_rgba(30,5,37,0.16),0_0_12px_rgba(30,5,37,0.24)]" />
          <div
            role="slider"
            tabIndex={0}
            aria-label={`Compare. Left: ${before.alt}. Right: ${after.alt}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% showing the before`}
            onKeyDown={onKey}
            className={`pointer-events-auto absolute left-0 top-1/2 flex size-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.08),0_12px_28px_-8px_rgba(30,5,37,0.4)] outline-none transition-transform duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-2 motion-reduce:transition-none ${
              dragging ? "scale-[0.92]" : "group-hover/ba:scale-[1.08]"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9.5 7-5 5 5 5M14.5 7l5 5-5 5" />
            </svg>
          </div>
        </div>
      </div>
    </figure>
  );
}
