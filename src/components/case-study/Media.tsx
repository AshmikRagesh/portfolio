"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * A case study screenshot or clip that opens larger when clicked — an expanded view over a
 * dimmed page, sized to the media itself, not full screen.
 *
 * Clips get a full player: play / pause in the centre, and a control bar on a soft scrim
 * along the bottom — play, time, a scrubber that shows what's loaded, speed (0.5× to 2×),
 * sound for narrated clips, and expand. The controls stay while paused and fade out two
 * seconds after the pointer stops while playing. Keyboard, once the player has focus:
 * Space or K play / pause · ← → skip 5s · < > speed · M sound · F expand.
 *
 * A silent clip plays itself on loop while it's on screen (never with reduced motion, and
 * never again once the reader has paused it); a `narrated` clip waits and plays with sound.
 * The expanded clip picks up where the inline one was, and hands its place back on close.
 */
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const IDLE_MS = 2000;

type Place = { time: number; rate: number; playing: boolean };

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
// Round icon buttons on the dark scrim
const ICON_BTN = `flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-white/90 transition-colors duration-150 hover:bg-white/15 hover:text-white ${FOCUS}`;

// ─── Icons: 24px, rounded, drawn for this player ─────────────────────────────
const Svg = ({ size = 20, children }: { size?: number; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const PlayIcon = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M6.6 5.6v12.8a1.1 1.1 0 0 0 1.66.94l10.4-6.4a1.1 1.1 0 0 0 0-1.88l-10.4-6.4A1.1 1.1 0 0 0 6.6 5.6Z" fill="currentColor" stroke="none" />
  </Svg>
);
const PauseIcon = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <rect x="6" y="5" width="4" height="14" rx="1.4" fill="currentColor" stroke="none" />
    <rect x="14" y="5" width="4" height="14" rx="1.4" fill="currentColor" stroke="none" />
  </Svg>
);
const Speaker = () => (
  <path d="M3.5 9.8v4.4a1 1 0 0 0 1 1h2.8l4.1 3.4a.7.7 0 0 0 1.1-.54V5.94a.7.7 0 0 0-1.1-.54L7.3 8.8H4.5a1 1 0 0 0-1 1Z" fill="currentColor" stroke="none" />
);
const SoundOnIcon = () => (
  <Svg>
    <Speaker />
    <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
  </Svg>
);
const SoundOffIcon = () => (
  <Svg>
    <Speaker />
    <path d="m16 9.5 5 5m0-5-5 5" />
  </Svg>
);
const ExpandIcon = () => (
  <Svg>
    <path d="M4.5 9V5.5a1 1 0 0 1 1-1H9M15 4.5h3.5a1 1 0 0 1 1 1V9M19.5 15v3.5a1 1 0 0 1-1 1H15M9 19.5H5.5a1 1 0 0 1-1-1V15" />
  </Svg>
);
const CloseIcon = () => (
  <Svg>
    <path d="M6.5 6.5l11 11m0-11-11 11" strokeWidth={2} />
  </Svg>
);
const CheckIcon = () => (
  <Svg size={16}>
    <path d="m5 12.5 4.5 4.5L19 7.5" strokeWidth={2.2} />
  </Svg>
);

const clock = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
const speedName = (r: number) => (r === 1 ? "Normal" : `${r}×`);

// ─── Speed menu ──────────────────────────────────────────────────────────────
function Speed({ rate, onPick }: { rate: number; onPick: (r: number) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", away);
    box.current?.querySelector<HTMLElement>("[aria-checked=true]")?.focus();
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = [...(box.current?.querySelectorAll<HTMLElement>("[role=menuitemradio]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.stopPropagation(); // close the menu, not the expanded view
      setOpen(false);
      box.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    }
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Playback speed, ${speedName(rate)}`}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[36px] min-w-[48px] items-center justify-center rounded-full px-[10px] font-geist text-[14px] font-medium tabular-nums text-white/90 transition-colors duration-150 hover:bg-white/15 hover:text-white ${FOCUS}`}
      >
        {rate}×
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Playback speed"
          onKeyDown={onMenuKey}
          className="cs-pop absolute bottom-[44px] right-0 z-10 w-[148px] origin-bottom-right rounded-[12px] bg-[#1e0525]/90 p-[6px] font-geist shadow-[0_12px_32px_rgba(0,0,0,0.32)] ring-1 ring-white/10 backdrop-blur-md"
        >
          <p className="px-[10px] pb-[4px] pt-[6px] text-[12px] font-medium text-white/50">Speed</p>
          {[...SPEEDS].reverse().map((s) => (
            <button
              key={s}
              type="button"
              role="menuitemradio"
              aria-checked={s === rate}
              onClick={() => {
                onPick(s);
                setOpen(false);
              }}
              className="flex h-[36px] w-full items-center justify-between rounded-[8px] px-[10px] text-left text-[14px] tabular-nums text-white/90 outline-none hover:bg-white/10 focus-visible:bg-white/15"
            >
              {speedName(s)}
              {s === rate && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Player ──────────────────────────────────────────────────────────────────
function Player({
  src,
  poster,
  label,
  narrated,
  expanded,
  place,
  hold,
  onOpen,
  onRatio,
}: {
  src: string;
  poster?: string;
  label: string;
  narrated?: boolean;
  expanded?: boolean;
  place?: Place | null; // where to pick up from
  hold?: boolean; // paused while the expanded view has the clip
  onOpen?: (place: Place) => void;
  onRatio?: (ratio: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const chose = useRef(false); // the reader played or paused it themselves
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(!narrated);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [active, setActive] = useState(false); // pointer moved recently

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

  // Smooth progress while playing
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = () => {
      if (ref.current) setTime(ref.current.currentTime);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => () => clearTimeout(idle.current), []);

  const wake = useCallback(() => {
    setActive(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setActive(false), IDLE_MS);
  }, []);

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

  const setSpeed = (next: number) => {
    if (ref.current) ref.current.playbackRate = next;
    setRate(next);
  };

  const skip = (by: number) => {
    const video = ref.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + by), video.duration || 0);
    setTime(video.currentTime);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("[role=menu]")) return;
    const k = e.key;
    if (k === " " || k === "k") {
      if ((e.target as HTMLElement).tagName === "BUTTON" && k === " ") return; // let buttons click
      e.preventDefault();
      toggle();
    } else if (k === "ArrowRight" || k === "ArrowLeft") {
      if ((e.target as HTMLElement).tagName === "INPUT") return; // the scrubber handles its own
      e.preventDefault();
      skip(k === "ArrowRight" ? 5 : -5);
    } else if (k === ">" || k === "<") {
      const i = SPEEDS.indexOf(rate) + (k === ">" ? 1 : -1);
      if (SPEEDS[i]) setSpeed(SPEEDS[i]);
    } else if (k === "m" && narrated) setMuted((m) => !m);
    else if (k === "f" && !expanded) onOpen?.(where());
    else return;
    wake();
  };

  const shown = !playing || active; // controls visible
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={`Video: ${label}`}
      onKeyDown={onKey}
      onPointerMove={wake}
      onPointerLeave={() => setActive(false)}
      className={`group/player relative isolate h-full w-full overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grape ${
        shown ? "" : "cursor-none"
      }`}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        aria-label={label}
        muted={muted}
        loop={!narrated}
        playsInline
        preload={expanded ? "auto" : "metadata"}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration);
          if (v.videoWidth) onRatio?.(v.videoWidth / v.videoHeight);
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => !playing && setTime(e.currentTarget.currentTime)}
        onProgress={(e) => {
          const v = e.currentTarget;
          if (v.buffered.length && v.duration) setLoaded(v.buffered.end(v.buffered.length - 1) / v.duration);
        }}
        onClick={expanded ? toggle : () => onOpen?.(where())}
        className={`block h-full w-full object-contain ${expanded ? "cursor-pointer" : "cursor-zoom-in"}`}
      />

      {/* Centre: play while paused, pause on hover while playing, a spinner while loading */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {waiting && playing ? (
          <span className="h-[48px] w-[48px] animate-spin rounded-full border-[3px] border-white/25 border-t-white motion-reduce:animate-none" />
        ) : (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className={`pointer-events-auto flex items-center justify-center rounded-full bg-black/35 text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] ring-1 ring-white/20 backdrop-blur-md transition-[opacity,transform,background-color] duration-200 hover:scale-[1.06] hover:bg-black/50 active:scale-[0.96] motion-reduce:transition-none ${FOCUS} ${
              expanded ? "h-[80px] w-[80px]" : "h-[64px] w-[64px]"
            } ${playing ? (active ? "opacity-100" : "pointer-events-none opacity-0") : "opacity-100"}`}
          >
            {playing ? <PauseIcon size={expanded ? 32 : 28} /> : <PlayIcon size={expanded ? 32 : 28} />}
          </button>
        )}
      </div>

      {/* Bottom: scrim and control bar */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-[8px] pb-[6px] pt-[40px] transition-opacity duration-300 focus-within:opacity-100 motion-reduce:transition-none md:px-[12px] md:pb-[8px] ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Scrubber: a native range for keyboard and screen readers, drawn as a thin track */}
        <div className="group/scrub relative mx-[6px] flex h-[16px] items-center">
          <div className="relative h-[4px] w-full overflow-hidden rounded-full bg-white/25 transition-[height] duration-150 group-hover/scrub:h-[6px]">
            <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${loaded * 100}%` }} />
            <div className="absolute inset-y-0 left-0 bg-grape" style={{ width: `${pct}%` }} />
          </div>
          <span
            className="pointer-events-none absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition-transform duration-150 group-hover/scrub:scale-100 group-focus-within/scrub:scale-100"
            style={{ left: `${pct}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={(e) => {
              const t = Number(e.target.value);
              if (ref.current) ref.current.currentTime = t;
              setTime(t);
            }}
            aria-label="Seek"
            aria-valuetext={`${clock(time)} of ${clock(duration)}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="flex items-center gap-[2px] font-geist">
          <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className={ICON_BTN}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          {narrated && (
            <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"} className={ICON_BTN}>
              {muted ? <SoundOffIcon /> : <SoundOnIcon />}
            </button>
          )}
          <span className="ml-[6px] text-[13px] font-medium tabular-nums text-white/90 max-sm:hidden">
            {clock(time)} <span className="text-white/50">/ {clock(duration)}</span>
          </span>
          <span className="flex-1" />
          <Speed rate={rate} onPick={setSpeed} />
          {!expanded && (
            <button type="button" onClick={() => onOpen?.(where())} aria-label="Expand" className={ICON_BTN}>
              <ExpandIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Expanded view ───────────────────────────────────────────────────────────
/** The media large and centred over a dimmed page, sized to its own shape. Esc, the backdrop or ✕ close it. */
function Expanded({
  label,
  ratio,
  onClose,
  children,
}: {
  label: string;
  ratio: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !box.current) return;
      // Keep Tab inside the dialog
      const items = [...box.current.querySelectorAll<HTMLElement>("button, input, [tabindex='0']")].filter((el) => el.offsetParent);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      before?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={box}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="cs-fade fixed inset-0 z-[100] flex flex-col items-center justify-center gap-[16px] bg-[#12020f]/80 p-[16px] backdrop-blur-[8px] md:p-[56px]"
    >
      <button
        ref={close}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={`absolute right-[16px] top-[16px] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/10 text-white/90 ring-1 ring-white/15 backdrop-blur-md transition-colors duration-150 hover:bg-white/20 hover:text-white md:right-[24px] md:top-[24px] ${FOCUS}`}
      >
        <CloseIcon />
      </button>
      <div
        className="cs-pop overflow-hidden rounded-[12px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
        style={{ aspectRatio: ratio, width: `min(100%, 1440px, calc((100dvh - 160px) * ${ratio}))` }}
      >
        {children}
      </div>
      <p className="pointer-events-none max-w-[640px] text-center font-geist text-[14px] leading-[20px] text-white/70">{label}</p>
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
  const [ratio, setRatio] = useState(16 / 9);
  const big = useRef<HTMLDivElement>(null);
  const shut = useCallback(() => {
    const v = big.current?.querySelector("video");
    setBack(v ? { time: v.currentTime, rate: v.playbackRate, playing: !v.paused } : open);
    setOpen(null);
  }, [open]);
  const shutImage = useCallback(() => setImage(false), []);

  if (video) {
    return (
      <>
        <div style={{ aspectRatio: ratio }}>
          <Player src={video} poster={poster} label={label} narrated={narrated} place={back} hold={!!open} onOpen={setOpen} onRatio={setRatio} />
        </div>
        {open && (
          <Expanded label={label} ratio={ratio} onClose={shut}>
            <div ref={big} className="h-full w-full">
              <Player src={video} poster={poster} label={label} narrated={narrated} expanded place={open} onRatio={setRatio} />
            </div>
          </Expanded>
        )}
      </>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setImage(true)} aria-label={`Expand: ${label}`} className="block w-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grape">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
          className="block h-auto w-full"
        />
      </button>
      {image && (
        <Expanded label={label} ratio={ratio} onClose={shutImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} className="block h-full w-full bg-white object-contain" />
        </Expanded>
      )}
    </>
  );
}
