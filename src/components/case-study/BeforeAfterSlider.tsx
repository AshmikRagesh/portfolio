"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Pause, Play } from "@phosphor-icons/react";

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
 * in while dragged. No labels on the picture: one footer line names the side that fills most
 * of it (past 55% the before, under 45% the after, "Drag to compare" between) and crossfades
 * as the handle moves.
 */
type Shot = { src: string; alt: string };

const isVideo = (shot: Shot) => /\.(mp4|webm|mov)$/i.test(shot.src);

/** One side of the comparison: a still, or a muted looping screen recording when src is a video */
const Media = forwardRef<HTMLVideoElement, { shot: Shot; width: number; height: number; style?: React.CSSProperties }>(
  function Media({ shot, width, height, style }, ref) {
    const cls = "pointer-events-none absolute inset-0 h-full w-full object-cover";
    if (isVideo(shot)) {
      return (
        <video ref={ref} src={shot.src} aria-label={shot.alt} width={width} height={height} muted loop playsInline preload="metadata" className={cls} style={style} />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={shot.src} alt={shot.alt} width={width} height={height} draggable={false} className={cls} style={style} />;
  },
);

/**
 * The controls for one video side, pinned to that side's bottom corner: a play/pause button
 * ringed by the clip's progress, the side's short name, and restart.
 *  - It fades out when the handle covers most of its side, so it never sits over the other video.
 *  - Videos pause while scrolled out of view and pick up again on return (unless the reader
 *    paused them), and start paused under reduced motion.
 *  - Pointer events stop here, so pressing a control never moves the handle.
 */
function VideoControls({
  video,
  name,
  tag,
  align,
  visible,
}: {
  video: React.RefObject<HTMLVideoElement | null>;
  name: string;
  tag: string;
  align: "left" | "right";
  visible: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let raf = 0;
    const tick = () => {
      if (v.duration) setProgress(v.currentTime / v.duration);
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
      if (v.duration) setProgress(v.currentTime / v.duration);
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) userPaused.current = true;
    // Play only while on screen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) v.play().catch(() => {});
        else if (!entry.isIntersecting) v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [video]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };
  const restart = () => {
    const v = video.current;
    if (!v) return;
    userPaused.current = false;
    v.currentTime = 0;
    setProgress(0);
    v.play().catch(() => {});
  };

  const R = 15; // ring radius inside the 36px button
  const C = 2 * Math.PI * R;
  const btn =
    "grid shrink-0 place-items-center rounded-full text-heading transition-[background-color,transform] duration-200 hover:bg-grape-light active:scale-[0.92] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heading motion-reduce:transition-none";

  return (
    <div
      aria-hidden={!visible}
      className={`absolute bottom-[8px] z-[2] flex items-center gap-[2px] rounded-full bg-white/[0.92] p-[2px] shadow-[0_0_0_0.5px_rgba(30,5,37,0.16),0_4px_16px_-4px_rgba(30,5,37,0.32)] backdrop-blur-md transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none md:bottom-[12px] ${
        align === "left" ? "left-[8px] flex-row md:left-[12px]" : "right-[8px] flex-row-reverse md:right-[12px]"
      } ${visible ? "opacity-100" : "pointer-events-none translate-y-[4px] opacity-0"}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button type="button" className={`${btn} relative size-[36px]`} aria-label={`${playing ? "Pause" : "Play"} ${name}`} data-sound-click="toggle" tabIndex={visible ? 0 : -1} onClick={toggle}>
        {/* Progress ring: the clip's position, drawn clockwise from the top */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
          <circle cx="18" cy="18" r={R} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
        </svg>
        {playing ? <Pause size={14} weight="fill" aria-hidden="true" /> : <Play size={14} weight="fill" aria-hidden="true" className="translate-x-[1px]" />}
      </button>
      <span className="px-[6px] font-geist text-caption-md font-medium uppercase tracking-[0.5px] text-heading">{tag}</span>
      <button type="button" className={`${btn} size-[32px]`} aria-label={`Restart ${name}`} data-sound-click="toggle" tabIndex={visible ? 0 : -1} onClick={restart}>
        <ArrowCounterClockwise size={14} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
/** `tag` is the short name on a video side's controls (falls back to the title) */
type Side = { title: string; note: string; tag?: string };

/** Width (px) a side needs before its video controls show: the pill plus a little air */
const ROOM = 168;
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
  /** The footer under the picture: each side named under its own half */
  labels?: { before: Side; after: Side };
}) {
  const [pos, setPosState] = useState(start);
  const [dragging, setDragging] = useState(false);
  const posRef = useRef(start);
  const beforeVid = useRef<HTMLVideoElement>(null);
  const afterVid = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  // The frame's width, so a side's video controls only show when that side has room for them
  const [boxW, setBoxW] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const anim = useRef<number | null>(null);
  const touched = useRef(false);
  // Which side the footer names: the one that fills most of the picture. A 3% margin either
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
        <Media ref={afterVid} shot={after} width={width} height={height} />
        <Media ref={beforeVid} shot={before} width={width} height={height} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
        {/* Each side's controls show while that side has room (fade once the handle covers most of it) */}
        {isVideo(before) && (
          <VideoControls video={beforeVid} name={labels?.before.title ?? "before video"} tag={labels?.before.tag ?? labels?.before.title ?? "Before"} align="left" visible={(pos / 100) * boxW > ROOM} />
        )}
        {isVideo(after) && (
          <VideoControls video={afterVid} name={labels?.after.title ?? "after video"} tag={labels?.after.tag ?? labels?.after.title ?? "After"} align="right" visible={((100 - pos) / 100) * boxW > ROOM} />
        )}

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
      {labels && (
        // One line under the picture, naming the side that fills most of it; the three states
        // share one grid cell and crossfade with a small lift
        <figcaption aria-live="polite" className="grid px-[12px] pb-[8px] pt-[16px] [text-wrap:balance] md:px-[16px]">
          {(
            [
              ["before", <>{"\u2190 "}{labels.before.title}</>, labels.before.note],
              ["after", <>{labels.after.title}{" \u2192"}</>, labels.after.note],
            ] as const
          ).map(([key, title, note]) => (
            <span
              key={key}
              aria-hidden={side !== key}
              className={`col-start-1 row-start-1 flex flex-col items-center gap-[2px] text-center transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
                side === key ? "translate-y-0 opacity-100 blur-0" : "pointer-events-none translate-y-[4px] opacity-0 blur-[2px]"
              }`}
            >
              <span className="font-body text-body font-medium text-heading md:text-body-md">{title}</span>
              <span className="font-body text-body text-secondary">{note}</span>
            </span>
          ))}
          <span
            aria-hidden={side !== null}
            className={`col-start-1 row-start-1 flex items-center justify-center gap-[6px] self-center font-geist text-caption-md font-medium uppercase tracking-[0.5px] text-heading transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
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
    </figure>
  );
}
