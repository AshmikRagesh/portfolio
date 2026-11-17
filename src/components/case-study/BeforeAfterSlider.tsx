"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Pause, Play } from "@phosphor-icons/react";
import { DEFAULT_SPEED } from "./Media";

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
 *  - Let go mid-swipe and the handle carries on a little before easing to a stop; a
 *    double-click glides it back to the middle; on touch a tiny tick marks either edge.
 *  - With video sides, one control on the bottom edge plays, pauses and restarts both
 *    together (see VideoControls), and Space on the grip does the same as play/pause. Each
 *    side's name sits in its top corner.
 *  - The first time it comes into view, the handle sweeps across the change and back once,
 *    so the reader sees there's something to compare. Reduced motion skips the sweep and
 *    every glide.
 *
 * Look: the picture sits in the case study card (white, 8px inset, 4px frame) like the other
 * visuals. The handle is a thin white line with a round grip that lifts on hover and presses
 * in while dragged. Stills carry no labels on the picture (videos get a name tag per side): one footer line names the side that fills most
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
        <video
          ref={ref}
          src={shot.src}
          aria-label={shot.alt}
          width={width}
          height={height}
          muted
          loop
          playsInline
          preload="metadata"
          className={cls}
          style={style}
        />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={shot.src} alt={shot.alt} width={width} height={height} draggable={false} className={cls} style={style} />;
  },
);

/**
 * One set of controls for both videos, centred on the picture's bottom edge. A comparison is
 * read side by side, so both clips play, pause and restart together, and the control never
 * has to hide when the handle moves (each side's own pill used to vanish as its half shrank).
 *  - Play/pause is a solid white button ringed by the clip's progress (the longer clip's, so
 *    the ring fills once per full cycle). Restart sits quieter beside it.
 *  - Videos pause while scrolled out of view and pick up again on return (unless the reader
 *    paused them), and start paused under reduced motion.
 *  - Pointer events stop here, so pressing a control never moves the handle.
 */
function VideoControls({ videos }: { videos: React.RefObject<HTMLVideoElement | null>[] }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const userPaused = useRef(false);
  const list = () => videos.map((r) => r.current).filter((v): v is HTMLVideoElement => !!v);
  // The clip the ring follows: the longest one
  const lead = () => list().reduce<HTMLVideoElement | null>((m, v) => (!m || (v.duration || 0) > (m.duration || 0) ? v : m), null);

  useEffect(() => {
    const vids = videos.map((r) => r.current).filter((v): v is HTMLVideoElement => !!v);
    if (!vids.length) return;
    let raf = 0;
    const tick = () => {
      const v = lead();
      if (v?.duration) setProgress(v.currentTime / v.duration);
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      const on = vids.some((v) => !v.paused);
      setPlaying(on);
      cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(tick);
    };
    vids.forEach((v) => {
      v.addEventListener("play", sync);
      v.addEventListener("pause", sync);
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) userPaused.current = true;
    // Play only while on screen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) vids.forEach((v) => v.play().catch(() => {}));
        else if (!entry.isIntersecting) vids.forEach((v) => v.pause());
      },
      { threshold: 0.25 },
    );
    io.observe(vids[0]);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      vids.forEach((v) => {
        v.removeEventListener("play", sync);
        v.removeEventListener("pause", sync);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos]);

  const toggle = () => {
    const vids = list();
    if (playing) {
      userPaused.current = true;
      vids.forEach((v) => v.pause());
    } else {
      userPaused.current = false;
      vids.forEach((v) => v.play().catch(() => {}));
    }
  };
  const restart = () => {
    userPaused.current = false;
    list().forEach((v) => {
      v.currentTime = 0;
      v.play().catch(() => {});
    });
    setProgress(0);
  };

  const R = 17; // ring radius around the 32px button, inside the 40px ring box
  const C = 2 * Math.PI * R;
  return (
    <div
      className="absolute bottom-[8px] left-1/2 z-[2] flex -translate-x-1/2 items-center gap-[2px] rounded-full bg-[rgba(30,5,37,0.72)] p-[4px] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_-8px_rgba(30,5,37,0.48)] backdrop-blur-xl backdrop-saturate-150 md:bottom-[12px]"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="group/pp relative grid size-[40px] shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/[0.56]"
        aria-label={playing ? "Pause both videos" : "Play both videos"}
        data-sound-click="toggle"
        onClick={toggle}
      >
        {/* Progress ring: where the clips are, drawn clockwise from the top */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r={R} fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
          <circle cx="20" cy="20" r={R} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
        </svg>
        <span className="grid size-[28px] place-items-center rounded-full bg-white text-heading transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-active/pp:scale-[0.88] motion-reduce:transition-none [@media(hover:hover)]:group-hover/pp:scale-[1.08]">
          {playing ? <Pause size={12} weight="fill" aria-hidden="true" /> : <Play size={12} weight="fill" aria-hidden="true" className="translate-x-[1px]" />}
        </span>
      </button>
      <button
        type="button"
        className="grid size-[40px] shrink-0 place-items-center rounded-full text-white/[0.72] outline-none transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-white/[0.56] active:scale-[0.9] motion-reduce:transition-none [@media(hover:hover)]:hover:bg-white/[0.12] [@media(hover:hover)]:hover:text-white"
        aria-label="Restart both videos"
        data-sound-click="toggle"
        onClick={restart}
      >
        <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}

/** A side's name in its top corner, so the reader always knows which video is which */
function SideTag({ text, align, visible }: { text: string; align: "left" | "right"; visible: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-[8px] z-[2] rounded-full bg-[rgba(30,5,37,0.72)] px-[12px] py-[6px] font-geist text-caption-md font-medium uppercase leading-none tracking-[0.5px] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none md:top-[12px] ${
        align === "left" ? "left-[8px] md:left-[12px]" : "right-[8px] md:right-[12px]"
      } ${visible ? "opacity-100" : "-translate-y-[4px] opacity-0"}`}
    >
      {text}
    </span>
  );
}
/** `tag` is the short name on a video side's controls (falls back to the title) */
type Side = { title: string; note: string; tag?: string };

/** Width (px) a side needs before its name tag shows: the tag plus a little air */
const ROOM = 104;
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
  const [vidRefs] = useState(() => [beforeVid, afterVid]);
  const box = useRef<HTMLDivElement>(null);
  // Video sides start at the case studies' default speed. Set on mount (the clip may have
  // loaded before this ran) and again on every load, since a fresh load resets the speed
  useEffect(() => {
    const vids = [beforeVid.current, afterVid.current].filter((v): v is HTMLVideoElement => !!v);
    const apply = (v: HTMLVideoElement) => {
      v.defaultPlaybackRate = DEFAULT_SPEED;
      v.playbackRate = DEFAULT_SPEED;
    };
    const onLoad = (e: Event) => apply(e.currentTarget as HTMLVideoElement);
    vids.forEach((v) => {
      apply(v);
      v.addEventListener("loadedmetadata", onLoad);
    });
    return () => vids.forEach((v) => v.removeEventListener("loadedmetadata", onLoad));
  }, []);
  // The frame's width, so a side's name tag only shows when that side has room for it
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
  const vel = useRef({ x: 0, t: 0, v: 0 }); // handle speed in % per ms, for the release throw
  const touchDrag = useRef(false);
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
    if (e.key === " ") {
      // Space plays or pauses both videos together
      e.preventDefault();
      const vids = [beforeVid.current, afterVid.current].filter((v): v is HTMLVideoElement => !!v);
      const anyPlaying = vids.some((v) => !v.paused);
      vids.forEach((v) => (anyPlaying ? v.pause() : v.play().catch(() => {})));
      return;
    }
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
          touchDrag.current = e.pointerType !== "mouse";
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          vel.current = { x: at(e.clientX), t: performance.now(), v: 0 };
          glide([at(e.clientX)], 240);
        }}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          stop();
          const p = at(e.clientX);
          const now = performance.now();
          vel.current = { x: p, t: now, v: (p - vel.current.x) / Math.max(1, now - vel.current.t) };
          // A tiny tick on touch when the handle meets either edge
          if (touchDrag.current && (p === 0 || p === 100) && posRef.current !== p) navigator.vibrate?.(8);
          setPos(p);
        }}
        onPointerUp={() => {
          setDragging(false);
          // Let go mid-swipe and the handle carries on a little, easing to a stop
          const { v, t } = vel.current;
          if (Math.abs(v) > 0.03 && performance.now() - t < 80) glide([clamp(posRef.current + v * 220)], 420);
        }}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={() => glide([50], 360)}
      >
        <Media ref={afterVid} shot={after} width={width} height={height} />
        <Media ref={beforeVid} shot={before} width={width} height={height} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
        {/* Each side's name shows while that side has room; one control runs both videos */}
        {labels && (isVideo(before) || isVideo(after)) && (
          <>
            <SideTag text={labels.before.tag ?? labels.before.title} align="left" visible={(pos / 100) * boxW > ROOM} />
            <SideTag text={labels.after.tag ?? labels.after.title} align="right" visible={((100 - pos) / 100) * boxW > ROOM} />
          </>
        )}
        {(isVideo(before) || isVideo(after)) && <VideoControls videos={vidRefs} />}

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
            aria-keyshortcuts={isVideo(before) || isVideo(after) ? "Space" : undefined}
            onKeyDown={onKey}
            className={`pointer-events-auto absolute left-0 top-1/2 flex size-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.08),0_12px_28px_-8px_rgba(30,5,37,0.4)] outline-none transition-transform duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-2 motion-reduce:transition-none ${
              dragging ? "scale-[0.92]" : "group-hover/ba:scale-[1.08]"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9.5 7-5 5 5 5" className="transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/ba:-translate-x-[1.5px] motion-reduce:transition-none" />
              <path d="m14.5 7 5 5-5 5" className="transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/ba:translate-x-[1.5px] motion-reduce:transition-none" />
            </svg>
          </div>
        </div>
      </div>
      {labels && (
        // One line under the picture, naming the side that fills most of it; the three states
        // share one grid cell and crossfade with a small lift
        <figcaption aria-live="polite" className="grid px-[12px] pb-[4px] pt-[12px] [text-wrap:balance] md:px-[16px]">
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
              {/* The note under the side's name from tablet up; phones keep the footer to one line */}
              <span className="font-body text-body text-secondary max-md:hidden">{note}</span>
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
