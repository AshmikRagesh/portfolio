"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export interface Reel {
  youtubeId: string;
  title: string;
}

/**
 * A case study's walkthrough video, floating over the page. Drag it to one of six docks
 * (two on each side, one centred top and bottom); click it to watch with sound.
 * Styles: .reel in globals.css.
 */

type Dock = "left-top" | "left-bottom" | "right-top" | "right-bottom" | "top" | "bottom";
const DOCKS: Dock[] = ["left-top", "left-bottom", "right-top", "right-bottom", "top", "bottom"];
const STORAGE_KEY = "reel-dock";

type Point = { x: number; y: number };

// Where each dock sits for a viewport. The card is a 9:16 video in a 4px bezel.
function geometry(w: number, h: number) {
  const small = w < 768;
  const card = small ? { w: 80, h: 136 } : { w: 116, h: 200 };
  const side = small ? 16 : w < 1024 ? 24 : 32;
  const top = 88 + (small ? 16 : 24); // under the ruler and navbar
  const low = h - (small ? 16 : 24) - card.h;
  const right = w - side - card.w;
  const centre = Math.round((w - card.w) / 2);
  const pos: Record<Dock, Point> = {
    "left-top": { x: side, y: top },
    "left-bottom": { x: side, y: low },
    "right-top": { x: right, y: top },
    "right-bottom": { x: right, y: low },
    top: { x: centre, y: top },
    bottom: { x: centre, y: h - 76 - card.h }, // stacks above the chapter pill
  };
  return { card, pos };
}

function nearest(pos: Record<Dock, Point>, p: Point): Dock {
  let best: Dock = "right-bottom";
  let bestDist = Infinity;
  for (const d of DOCKS) {
    const dist = Math.hypot(pos[d].x - p.x, pos[d].y - p.y);
    if (dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}

const ARROWS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

// The closest dock in a direction, favouring ones straight ahead
function neighbour(pos: Record<Dock, Point>, from: Dock, dir: Point): Dock {
  let best = from;
  let bestScore = Infinity;
  for (const d of DOCKS) {
    const vx = pos[d].x - pos[from].x;
    const vy = pos[d].y - pos[from].y;
    const along = vx * dir.x + vy * dir.y;
    if (along <= 1) continue;
    const score = along + 2 * Math.abs(vx * dir.y - vy * dir.x);
    if (score < bestScore) {
      best = d;
      bestScore = score;
    }
  }
  return best;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const floatSrc = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&iv_load_policy=3&rel=0`;

const expandSrc = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1`;

const EASE_OPEN = "cubic-bezier(0.2, 0.8, 0.3, 1)";
const EASE_CLOSE = "cubic-bezier(0.4, 0, 0.2, 1)";

// Two arrows pointing out to opposite corners; they spread on hover
function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g className="reel-arrow-ne" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2.5H13.5V6.5" />
        <path d="M13.5 2.5L9 7" />
      </g>
      <g className="reel-arrow-sw" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 13.5H2.5V9.5" />
        <path d="M2.5 13.5L7 9" />
      </g>
    </svg>
  );
}

interface Gesture {
  id: number;
  start: Point;
  origin: Point;
  at: Point;
  moved: boolean;
  tilt: number;
  samples: { x: number; y: number; t: number }[];
}

export default function ReelPlayer({ reel }: { reel: Reel }) {
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);
  const [dock, setDock] = useState<Dock>("right-bottom");
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [target, setTarget] = useState<Dock | null>(null);
  const [footerUp, setFooterUp] = useState(false);
  const [view, setView] = useState<"closed" | "open" | "closing">("closed");

  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const gesture = useRef<Gesture | null>(null);

  const geo = viewport ? geometry(viewport.w, viewport.h) : null;
  const spot = geo?.pos[dock];

  // Size to the window, and come back to the dock the visitor last chose
  useEffect(() => {
    const measure = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    measure();
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Dock | null;
      if (saved && DOCKS.includes(saved)) setDock(saved);
    } catch {}
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Step aside once the footer comes up, like the chapter pill
  useEffect(() => {
    let frame: number | null = null;
    const update = () => {
      frame = null;
      const main = document.querySelector<HTMLElement>("[data-cs-main]");
      setFooterUp(main ? main.getBoundingClientRect().bottom < window.innerHeight : false);
    };
    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Sit on the dock. The position is written straight to the element so a drag never
  // waits on a render.
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el || !spot || gesture.current?.moved) return;
    el.style.transform = `translate3d(${spot.x}px, ${spot.y}px, 0)`;
    if (!ready) {
      // The first placement lands without sliding in from the corner
      const id = window.requestAnimationFrame(() => setReady(true));
      return () => window.cancelAnimationFrame(id);
    }
  }, [spot?.x, spot?.y, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (d: Dock) => {
    setDock(d);
    try {
      window.localStorage.setItem(STORAGE_KEY, d);
    } catch {}
  };

  // ── Dragging ───────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !spot) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = {
      id: e.pointerId,
      start: { x: e.clientX, y: e.clientY },
      origin: spot,
      at: spot,
      moved: false,
      tilt: 0,
      samples: [{ x: e.clientX, y: e.clientY, t: e.timeStamp }],
    };
  };

  const velocity = (g: Gesture) => {
    const last = g.samples[g.samples.length - 1];
    const first = g.samples.find((s) => last.t - s.t < 80) ?? last;
    const dt = Math.max(1, last.t - first.t);
    return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId || !geo) return;
    const dx = e.clientX - g.start.x;
    const dy = e.clientY - g.start.y;
    if (!g.moved) {
      if (Math.hypot(dx, dy) < 4) return;
      g.moved = true;
      setDragging(true);
    }
    g.samples.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    if (g.samples.length > 8) g.samples.shift();
    g.at = { x: g.origin.x + dx, y: g.origin.y + dy };

    // Lean a little into the direction of travel
    const lean = prefersReducedMotion() ? 0 : Math.max(-4, Math.min(4, velocity(g).x * 3));
    g.tilt += (lean - g.tilt) * 0.3;
    cardRef.current!.style.transform =
      `translate3d(${g.at.x}px, ${g.at.y}px, 0) rotate(${g.tilt.toFixed(2)}deg)`;

    const d = nearest(geo.pos, g.at);
    setTarget((t) => (t === d ? t : d));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId || !geo) return;
    gesture.current = null;
    if (!g.moved) {
      if (e.type === "pointerup") open();
      return;
    }
    // A throw carries on: aim for where it was heading, not where it was let go
    const v = velocity(g);
    const d = nearest(geo.pos, { x: g.at.x + v.x * 180, y: g.at.y + v.y * 180 });
    setDragging(false);
    setTarget(null);
    choose(d);
    // Back to the same dock: the layout effect won't re-run, so send it home by hand
    if (d === dock) cardRef.current!.style.transform = `translate3d(${geo.pos[d].x}px, ${geo.pos[d].y}px, 0)`;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
      return;
    }
    const dir = ARROWS[e.key];
    if (dir && geo) {
      e.preventDefault();
      choose(neighbour(geo.pos, dock, dir));
    }
  };

  // ── Expanded view ──────────────────────────────────────────────────────────
  // The video grows out of the card, and shrinks back into it
  const flip = (direction: "in" | "out") => {
    const box = boxRef.current;
    const from = videoRef.current?.getBoundingClientRect();
    if (!box || !from) return null;
    const to = box.getBoundingClientRect();
    const s = from.width / to.width;
    const small = {
      transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${s})`,
      borderRadius: `${8 / s}px`,
    };
    const full = { transform: "none", borderRadius: "12px" };
    const duration = prefersReducedMotion() ? 0 : direction === "in" ? 520 : 360;
    backdropRef.current?.animate(
      direction === "in" ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
      { duration: duration * 0.7, easing: "ease-out", fill: "forwards" }
    );
    return box.animate(direction === "in" ? [small, full] : [full, small], {
      duration,
      easing: direction === "in" ? EASE_OPEN : EASE_CLOSE,
      fill: "forwards",
    });
  };

  const open = () => setView("open");

  const close = () => {
    if (view !== "open") return;
    setView("closing");
    const anim = flip("out");
    if (anim) anim.onfinish = () => setView("closed");
    else setView("closed");
  };

  useLayoutEffect(() => {
    if (view !== "open") return;
    flip("in");
    closeRef.current?.focus({ preventScroll: true });
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hand focus back to the card once the video has gone
  const wasOpen = useRef(false);
  useEffect(() => {
    if (view === "closed" && wasOpen.current) cardRef.current?.focus({ preventScroll: true });
    wasOpen.current = view !== "closed";
  }, [view]);

  // Hold the page still behind, and close on Escape
  useEffect(() => {
    if (view === "closed") return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }); // eslint-disable-line react-hooks/exhaustive-deps

  if (!geo) return null;

  return (
    <>
      {/* Docks, shown while dragging */}
      {dragging &&
        DOCKS.map((d) => (
          <div
            key={d}
            aria-hidden="true"
            className="reel-slot"
            data-near={target === d}
            style={{
              width: geo.card.w,
              height: geo.card.h,
              transform: `translate3d(${geo.pos[d].x}px, ${geo.pos[d].y}px, 0)`,
            }}
          />
        ))}

      {/* ── Floating card ── */}
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`Play the ${reel.title} walkthrough. Arrow keys move it.`}
        className="reel"
        data-ready={ready}
        data-dragging={dragging}
        data-hidden={!ready || footerUp}
        data-away={view !== "closed"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="reel-frame">
          <div ref={videoRef} className="reel-video" style={{ width: geo.card.w - 8, height: geo.card.h - 8 }}>
            <iframe
              src={floatSrc(reel.youtubeId)}
              allow="autoplay; encrypted-media"
              tabIndex={-1}
              className="absolute inset-0 h-full w-full border-0"
              title={`${reel.title}, muted preview`}
            />
            <span className="reel-veil" />
            <span className="reel-expand">
              <ExpandIcon />
            </span>
          </div>
        </div>
      </div>

      {/* ── Expanded view ── */}
      {view !== "closed" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={reel.title}
          className="reel-modal fixed inset-0 z-[70] flex flex-col"
          data-closing={view === "closing"}
        >
          <div ref={backdropRef} className="absolute inset-0 bg-midnight" onClick={close} />

          <div className="reel-modal-head relative flex items-start justify-between gap-[16px] p-[16px] md:p-[32px]">
            <div className="max-w-[480px] pt-[4px]">
              <p className="font-brand text-[12px] uppercase leading-[16px] tracking-[1px] text-white/60">
                Case study walkthrough
              </p>
              <h2 className="mt-[8px] font-heading text-h4 text-white md:text-h4-md lg:text-h4-lg">
                {reel.title}
              </h2>
            </div>
            <button
              ref={closeRef}
              onClick={close}
              aria-label="Close"
              className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="pointer-events-none relative flex min-h-0 flex-1 items-center justify-center px-[16px] pb-[16px] md:pb-[32px]">
            <div
              ref={boxRef}
              className="pointer-events-auto relative aspect-[9/16] h-full max-h-[640px] max-w-full origin-top-left overflow-hidden rounded-[12px] bg-black bg-cover bg-center"
              style={{ backgroundImage: `url(https://i.ytimg.com/vi/${reel.youtubeId}/hqdefault.jpg)` }}
            >
              <iframe
                src={expandSrc(reel.youtubeId)}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
                title={reel.title}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
