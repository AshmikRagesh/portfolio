"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowsOut, Minus, Pause, Play, Plus, SpeakerHigh, SpeakerSlash, X } from "@phosphor-icons/react";

/**
 * A case study screenshot or clip that opens larger when clicked — an expanded view over a
 * dimmed page, not full screen. Clips get their own controls: play / pause in the centre,
 * speed down and up in the corner, and a thin progress line that seeks. A silent clip
 * plays itself on loop while it's on screen (never with reduced motion); a `narrated`
 * clip waits for the reader and plays with sound. The expanded clip picks up where the
 * inline one was, and hands its place back when it closes.
 */
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

type Place = { time: number; rate: number; playing: boolean };

// White pill controls with a hairline border, like the variant switch
const PILL = "border border-line bg-white/95 shadow-[0_2px_8px_rgba(30,5,37,0.12)] backdrop-blur-sm";
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape";

function Player({
  src,
  poster,
  label,
  narrated,
  expanded,
  place,
  hold,
  onOpen,
}: {
  src: string;
  poster?: string;
  label: string;
  narrated?: boolean;
  expanded?: boolean;
  place?: Place | null; // where to pick up from
  hold?: boolean; // paused while the expanded view is open
  onOpen?: (place: Place) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const chose = useRef(false); // the reader paused or played it themselves
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(!narrated);
  const [progress, setProgress] = useState(0);

  // Silent clips play while on screen, unless the reader took over
  useEffect(() => {
    const video = ref.current;
    if (!video || narrated || expanded) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (chose.current || hold) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [narrated, expanded, hold]);

  // Pick up from a hand-over, and pause while the other view has the clip
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (hold) {
      video.pause();
      return;
    }
    if (!place) return;
    video.currentTime = place.time;
    video.playbackRate = place.rate;
    setRate(place.rate);
    if (place.playing) video.play().catch(() => {});
  }, [place, hold]);

  const where = (): Place => {
    const video = ref.current!;
    return { time: video.currentTime, rate: video.playbackRate, playing: !video.paused };
  };

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    chose.current = true;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const step = (by: number) => {
    const video = ref.current;
    if (!video) return;
    const next = SPEEDS[Math.min(SPEEDS.length - 1, Math.max(0, SPEEDS.indexOf(rate) + by))];
    video.playbackRate = next;
    setRate(next);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = ref.current;
    if (!video || !video.duration) return;
    const box = e.currentTarget.getBoundingClientRect();
    video.currentTime = ((e.clientX - box.left) / box.width) * video.duration;
  };

  return (
    <div className="group/player relative">
      <video
        ref={ref}
        src={src}
        poster={poster}
        aria-label={label}
        muted={muted}
        loop={!narrated}
        playsInline
        preload={expanded ? "auto" : "none"}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
        onClick={expanded ? toggle : () => onOpen?.(where())}
        className={`block h-auto w-full ${expanded ? "max-h-[84vh] cursor-pointer object-contain" : "cursor-zoom-in"}`}
      />

      {/* Play / pause in the centre: always there while paused, on hover while playing */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={`absolute left-1/2 top-1/2 flex h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-primary transition-[opacity,transform] duration-200 hover:scale-[1.06] active:scale-[0.96] motion-reduce:transition-none ${PILL} ${FOCUS} ${
          playing
            ? "opacity-0 focus-visible:opacity-100 group-hover/player:opacity-100 [@media(hover:none)]:opacity-0"
            : "opacity-100"
        }`}
      >
        {playing ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" className="translate-x-[2px]" />}
      </button>

      {/* Speed, sound and expand along the bottom right */}
      <div
        className={`absolute bottom-[16px] right-[12px] flex items-center gap-[8px] transition-opacity duration-200 focus-within:opacity-100 group-hover/player:opacity-100 [@media(hover:none)]:opacity-100 md:right-[16px] ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className={`flex h-[32px] items-center rounded-full ${PILL}`} role="group" aria-label="Playback speed">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={rate === SPEEDS[0]}
            aria-label="Slower"
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-primary hover:text-grape disabled:text-line ${FOCUS}`}
          >
            <Minus size={14} weight="bold" />
          </button>
          <span aria-live="polite" className="w-[40px] text-center font-brand text-[12px] tracking-[0.5px] text-primary">
            {rate}×
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={rate === SPEEDS[SPEEDS.length - 1]}
            aria-label="Faster"
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-primary hover:text-grape disabled:text-line ${FOCUS}`}
          >
            <Plus size={14} weight="bold" />
          </button>
        </div>
        {narrated && (
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-primary hover:text-grape ${PILL} ${FOCUS}`}
          >
            {muted ? <SpeakerSlash size={16} weight="fill" /> : <SpeakerHigh size={16} weight="fill" />}
          </button>
        )}
        {!expanded && (
          <button
            type="button"
            onClick={() => onOpen?.(where())}
            aria-label="Expand"
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-primary hover:text-grape ${PILL} ${FOCUS}`}
          >
            <ArrowsOut size={16} weight="bold" />
          </button>
        )}
      </div>

      {/* Progress: a thin line along the bottom that seeks on click */}
      <div onClick={seek} className="absolute inset-x-0 bottom-0 h-[8px] cursor-pointer" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[4px] bg-primary/10">
          <div className="h-full bg-grape transition-[width] duration-200 ease-linear" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

/** The expanded view: the media large and centred over a dimmed page; Esc, the backdrop or ✕ close it */
function Expanded({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      before?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="cs-fade fixed inset-0 z-[100] flex items-center justify-center bg-primary/70 p-[16px] backdrop-blur-[4px] md:p-[48px]"
    >
      <button
        ref={close}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={`absolute right-[16px] top-[16px] flex h-[40px] w-[40px] items-center justify-center rounded-full text-primary hover:text-grape md:right-[24px] md:top-[24px] ${PILL} ${FOCUS}`}
      >
        <X size={18} weight="bold" />
      </button>
      <div className="cs-pop w-full max-w-[1200px] overflow-hidden rounded-[8px] bg-white shadow-[0_24px_64px_rgba(30,5,37,0.32)]">
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default function Media({
  src,
  video,
  poster,
  label,
  narrated,
}: {
  src?: string;
  video?: string;
  poster?: string;
  label: string;
  narrated?: boolean;
}) {
  const [open, setOpen] = useState<Place | null>(null); // where the expanded clip starts
  const [back, setBack] = useState<Place | null>(null); // where the inline clip picks up
  const [image, setImage] = useState(false);
  const big = useRef<{ place: () => Place } | null>(null);

  if (video) {
    return (
      <>
        <Player
          src={video}
          poster={poster}
          label={label}
          narrated={narrated}
          place={back}
          hold={!!open}
          onOpen={(p) => setOpen(p)}
        />
        {open && (
          <Expanded
            label={label}
            onClose={() => {
              setBack(big.current?.place() ?? open);
              setOpen(null);
            }}
          >
            <ExpandedPlayer src={video} poster={poster} label={label} narrated={narrated} start={open} handle={big} />
          </Expanded>
        )}
      </>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setImage(true)} aria-label={`Expand: ${label}`} className={`block w-full cursor-zoom-in ${FOCUS}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="block h-auto w-full" />
      </button>
      {image && (
        <Expanded label={label} onClose={() => setImage(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} className="mx-auto block max-h-[84vh] w-auto max-w-full object-contain" />
        </Expanded>
      )}
    </>
  );
}

/** The expanded clip, which reports where it is when the view closes */
function ExpandedPlayer({
  handle,
  start,
  ...props
}: {
  src: string;
  poster?: string;
  label: string;
  narrated?: boolean;
  start: Place;
  handle: React.MutableRefObject<{ place: () => Place } | null>;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    handle.current = {
      place: () => {
        const v = box.current?.querySelector("video");
        return v ? { time: v.currentTime, rate: v.playbackRate, playing: !v.paused } : start;
      },
    };
    return () => {
      handle.current = null;
    };
  }, [handle, start]);
  return (
    <div ref={box}>
      <Player {...props} expanded place={start} />
    </div>
  );
}
