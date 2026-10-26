"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import type { Reel } from "@/content/reels";

export type { Reel };

/**
 * Walkthrough videos, floating over the page. On tablet and up the card can be dragged
 * to one of five docks (two on each side, one centred at the bottom); on phones it sits
 * still at the middle of the right edge. Click it to watch with sound.
 * `browse` (the home page) adds chevrons between reels and a link to each case study.
 * Styles: .reel in globals.css.
 */

type Dock = "left-top" | "left-bottom" | "right-top" | "right-bottom" | "bottom" | "right-middle";
const DOCKS: Dock[] = ["left-top", "left-bottom", "right-top", "right-bottom", "bottom"];
const STORAGE_KEY = "reel-dock";

type Point = { x: number; y: number };

// Where the card sits for a viewport. The card is a 9:16 video in a 4px bezel.
function geometry(w: number, h: number) {
  const small = w < 768;
  if (small) {
    const card = { w: 98, h: 168 };
    const spot = { x: w - 16 - card.w, y: Math.round((h - card.h) / 2) };
    return { small, card, pos: { "right-middle": spot } as Partial<Record<Dock, Point>> };
  }
  const card = { w: 116, h: 200 };
  const side = w < 1024 ? 24 : 32;
  const top = 88 + 24; // under the ruler and navbar
  const low = h - 24 - card.h;
  const right = w - side - card.w;
  const pos: Partial<Record<Dock, Point>> = {
    "left-top": { x: side, y: top },
    "left-bottom": { x: side, y: low },
    "right-top": { x: right, y: top },
    "right-bottom": { x: right, y: low },
    bottom: { x: Math.round((w - card.w) / 2), y: h - 76 - card.h }, // stacks above the chapter pill
  };
  return { small, card, pos };
}

function nearest(pos: Partial<Record<Dock, Point>>, p: Point): Dock {
  let best: Dock = "right-bottom";
  let bestDist = Infinity;
  for (const d of DOCKS) {
    const dist = Math.hypot(pos[d]!.x - p.x, pos[d]!.y - p.y);
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
function neighbour(pos: Partial<Record<Dock, Point>>, from: Dock, dir: Point): Dock {
  let best = from;
  let bestScore = Infinity;
  for (const d of DOCKS) {
    const vx = pos[d]!.x - pos[from]!.x;
    const vy = pos[d]!.y - pos[from]!.y;
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

// Figma arrow/arrow-up icon, turned to point right
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 12.0001 15.3333" fill="none" aria-hidden="true" className="rotate-90">
      <path
        d="M1.00006 5.85867C2.29637 4.10584 3.81072 2.53153 5.5048 1.1746C5.65012 1.0582 5.82509 1 6.00006 1M11.0001 5.85867C9.70376 4.10583 8.18941 2.53153 6.49533 1.1746C6.35 1.0582 6.17503 1 6.00006 1M6.00006 1V14.3333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

const roundButton =
  "flex size-[48px] shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

interface Gesture {
  id: number;
  start: Point;
  origin: Point;
  at: Point;
  moved: boolean;
  tilt: number;
  samples: { x: number; y: number; t: number }[];
}

export default function ReelPlayer({ reels, browse = false }: { reels: Reel[]; browse?: boolean }) {
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);
  const [savedDock, setSavedDock] = useState<Dock>("right-bottom");
  const [index, setIndex] = useState(0);
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

  const reel = reels[index];
  const many = browse && reels.length > 1;
  const geo = viewport ? geometry(viewport.w, viewport.h) : null;
  const dock: Dock = geo?.small ? "right-middle" : savedDock;
  const spot = geo?.pos[dock];

  // Size to the window, and come back to the dock the visitor last chose
  useEffect(() => {
    const measure = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    measure();
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Dock | null;
      if (saved && DOCKS.includes(saved)) setSavedDock(saved);
    } catch {}
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Step aside once the footer comes up, like the chapter pill
  useEffect(() => {
    let frame: number | null = null;
    const update = () => {
      frame = null;
      const main = document.querySelector<HTMLElement>("[data-cs-main], [data-reel-bounds]");
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
    setSavedDock(d);
    try {
      window.localStorage.setItem(STORAGE_KEY, d);
    } catch {}
  };

  // ── Dragging (tablet and up) ───────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !spot) return;
    if (!geo?.small) e.currentTarget.setPointerCapture(e.pointerId);
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
      // Phones don't drag: a moving finger is a scroll, not a tap
      if (geo.small) return;
      setDragging(true);
    }
    if (geo.small) return;
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
    if (geo.small) return;
    // A throw carries on: aim for where it was heading, not where it was let go
    const v = velocity(g);
    const d = nearest(geo.pos, { x: g.at.x + v.x * 180, y: g.at.y + v.y * 180 });
    setDragging(false);
    setTarget(null);
    choose(d);
    // Back to the same dock: the layout effect won't re-run, so send it home by hand
    if (d === dock) cardRef.current!.style.transform = `translate3d(${geo.pos[d]!.x}px, ${geo.pos[d]!.y}px, 0)`;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
      return;
    }
    const dir = ARROWS[e.key];
    if (dir && geo && !geo.small) {
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

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + reels.length) % reels.length);

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

  // Hold the page still behind; Escape closes, up and down step through reels
  useEffect(() => {
    if (view === "closed") return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (many && view === "open" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        go(e.key === "ArrowUp" ? -1 : 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }); // eslint-disable-line react-hooks/exhaustive-deps

  if (!geo || !reel) return null;

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
              transform: `translate3d(${geo.pos[d]!.x}px, ${geo.pos[d]!.y}px, 0)`,
            }}
          />
        ))}

      {/* ── Floating card ── */}
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={geo.small ? `Play the walkthrough: ${reel.title}` : `Play the walkthrough: ${reel.title}. Arrow keys move it.`}
        className="reel"
        data-fixed={geo.small}
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
              key={index}
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

      {/* ── Expanded view ──
          One grid for both pages. Phones: title and close on top, video, then the link and
          chevrons below. Desktop: title and link on the left, video full height in the
          middle, close and chevrons on the right. */}
      {view !== "closed" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={reel.title}
          className="reel-modal fixed inset-0 z-[70]"
          data-closing={view === "closing"}
        >
          <div ref={backdropRef} className="absolute inset-0 bg-midnight" onClick={close} />

          <div className="pointer-events-none relative grid h-full grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)_auto] gap-[16px] p-[16px] md:gap-[24px] md:p-[32px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:gap-x-[48px] lg:gap-y-[32px]">
            {/* Title and description */}
            <div key={`info-${index}`} className="reel-modal-ui col-start-1 row-start-1 max-w-[480px] lg:pt-[8px]">
              <h2 className="font-heading text-h2 text-white md:text-h2-md xl:text-h1-md">{reel.title}</h2>
              <p className="mt-[12px] line-clamp-2 font-body text-body text-white/70 md:mt-[16px] md:line-clamp-none md:text-lead-md">
                {reel.description}
              </p>
            </div>

            {/* Video */}
            <div className="col-span-2 col-start-1 row-start-2 flex min-h-0 items-center justify-center lg:col-span-1 lg:col-start-2 lg:row-span-3 lg:row-start-1">
              <div
                ref={boxRef}
                className="pointer-events-auto relative aspect-[9/16] h-full max-h-[800px] max-w-full origin-top-left overflow-hidden rounded-[12px] bg-black bg-cover bg-center"
                style={{ backgroundImage: `url(https://i.ytimg.com/vi/${reel.youtubeId}/hqdefault.jpg)` }}
              >
                <iframe
                  key={index}
                  src={expandSrc(reel.youtubeId)}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                  title={reel.title}
                />
              </div>
            </div>

            {/* Close */}
            <button
              ref={closeRef}
              onClick={close}
              aria-label="Close"
              className={`reel-modal-ui pointer-events-auto col-start-2 row-start-1 justify-self-end lg:col-start-3 ${roundButton}`}
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            {/* Read the case study */}
            {browse && (
              <Link
                href={reel.href}
                className="reel-modal-ui pointer-events-auto col-start-1 row-start-3 flex h-[48px] items-center justify-center gap-[8px] self-end rounded-[10px] bg-white px-[16px] font-brand text-[14px] uppercase tracking-[1px] text-midnight transition-colors duration-200 hover:bg-grape-light md:justify-self-start lg:row-start-2 lg:self-start"
              >
                Read case study
                <ArrowRight />
              </Link>
            )}

            {/* Previous / next */}
            {many && (
              <div className="reel-modal-ui pointer-events-auto col-start-2 row-start-3 flex gap-[8px] self-end lg:col-start-3 lg:row-span-3 lg:row-start-1 lg:flex-col lg:self-center lg:justify-self-end">
                <button onClick={() => go(-1)} aria-label="Previous case study" className={roundButton}>
                  <ChevronUp size={20} strokeWidth={1.5} />
                </button>
                <button onClick={() => go(1)} aria-label="Next case study" className={roundButton}>
                  <ChevronDown size={20} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
