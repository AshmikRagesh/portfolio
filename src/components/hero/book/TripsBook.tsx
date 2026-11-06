"use client";

// ── The trips book ────────────────────────────────────────────────────────────
// A small hardback by the portrait. Click it and it comes to the middle of the screen
// (FocusOverlay, the same motion as the Superhost medal); drag the cover, or tap it, and
// it opens out into a spread.
//
//   Overview  list of stops on the left (one open at a time) · route map on the right
//   Each stop photos on the left · notes and a close-up map on the right
//
// Pages turn by dragging: grab a page and pull it across, it follows the pointer, bends
// its shading as it goes, and turns if you let go past a third of the way (or flick it),
// otherwise it falls back. Arrow keys and the ‹ › buttons turn pages too. A photo opens
// over the right-hand page, as in the reference; the map and the list stay in step.

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import FocusOverlay, { CloseChip, useReducedMotion, type FocusPhase } from "../FocusOverlay";
import PixelScene from "./PixelScene";
import TripMap from "./TripMap";
import { TRIP, type Photo } from "./trip";

const PW = 320; // one page
const PH = 432;
const LEAVES = 5; // cover + overview map + one per stop
const MAX_TURN = LEAVES - 1;
const TURN_MS = 620;

// ── Pages ─────────────────────────────────────────────────────────────────────
function Paper({ children, side, className = "" }: { children?: ReactNode; side: "left" | "right"; className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-background ${side === "left" ? "rounded-l-md" : "rounded-r-md"} ${className}`}
      style={{
        // The gutter: a soft shadow where the page curves into the spine
        backgroundImage:
          side === "left"
            ? "linear-gradient(to left, rgba(30,5,37,0.10), rgba(30,5,37,0) 14%)"
            : "linear-gradient(to right, rgba(30,5,37,0.10), rgba(30,5,37,0) 14%)",
      }}
    >
      {children}
    </div>
  );
}

function Cover() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-r-md rounded-l-sm bg-vanilla p-6" style={{ boxShadow: "inset 6px 0 8px -6px rgba(30,5,37,0.35), inset 0 0 0 1px rgba(30,5,37,0.06)" }}>
      <p className="font-heading text-h1-lg text-grape">{TRIP.title}</p>
      <p className="mt-1 font-brand text-caption uppercase tracking-[2px] text-grape/80">{TRIP.meta}</p>
      <div className="absolute inset-x-0 bottom-0 h-[232px]">
        <PixelScene scene="boat" palette="brand" cols={64} rows={46} className="h-full w-full" />
      </div>
      {/* Cloth grain over everything */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply" style={{ backgroundImage: "repeating-linear-gradient(0deg, #1e0525 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, #1e0525 0 1px, transparent 1px 3px)" }} />
    </div>
  );
}

function Thumbs({ photos, onOpen, label }: { photos: Photo[]; onOpen: (i: number) => void; label: string }) {
  return (
    <div className="flex">
      {photos.map((p, i) => (
        <button
          key={i}
          type="button"
          data-nodrag=""
          onClick={() => onOpen(i)}
          aria-label={`${label}: open photo ${i + 1} of ${photos.length}`}
          className="-ml-2 h-10 w-10 overflow-hidden rounded-full border-2 border-background shadow-[0_1px_3px_rgba(30,5,37,0.25)] transition-transform first:ml-0 hover:z-10 hover:-translate-y-0.5 hover:scale-110"
        >
          <PixelScene scene={p.scene} palette={p.palette} cols={20} rows={20} className="h-full w-full" />
        </button>
      ))}
    </div>
  );
}

function Overview({ active, setActive, openPhoto }: { active: number | null; setActive: (i: number | null) => void; openPhoto: (s: number, p: number) => void }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-6" data-nodrag="">
      {TRIP.stops.map((s, i) => {
        const on = active === i;
        return (
          <div key={s.name} className="border-b border-line-soft py-3 last:border-b-0">
            <button type="button" aria-expanded={on} onClick={() => setActive(on ? null : i)} className="flex w-full flex-col items-start gap-1 text-left">
              <span className="flex items-center gap-2 font-geist text-caption text-muted">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-grape text-[10px] font-semibold leading-none text-background">{i + 1}</span>
                {s.days}
                {s.leg ? ` · ${s.leg}` : ""}
              </span>
              <span className="flex items-center gap-1 font-geist text-body-lg font-medium text-heading">
                {s.name}
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="transition-transform duration-300" style={{ transform: on ? "rotate(180deg)" : "none" }}>
                  <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {/* Opens to its own height */}
            <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <p className="pt-2 font-geist text-body text-secondary">{s.line}</p>
                <div className="pb-1 pt-3">
                  <Thumbs photos={s.photos} label={s.name} onOpen={(p) => openPhoto(i, p)} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StopPhotos({ stop, openPhoto }: { stop: number; openPhoto: (s: number, p: number) => void }) {
  const s = TRIP.stops[stop];
  const [a, b, c] = s.photos;
  const Tile = ({ p, i, className }: { p: Photo; i: number; className: string }) => (
    <button type="button" data-nodrag="" onClick={() => openPhoto(stop, i)} aria-label={`${s.name}: open photo ${i + 1}, ${p.caption}`} className={`group relative overflow-hidden rounded-md ${className}`}>
      <PixelScene scene={p.scene} palette={p.palette} cols={48} rows={36} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" />
    </button>
  );
  return (
    <div className="flex h-full flex-col gap-3 p-6">
      <Tile p={a} i={0} className="h-[208px] w-full -rotate-1 shadow-[0_2px_6px_rgba(30,5,37,0.15)]" />
      <div className="flex flex-1 gap-3">
        <Tile p={b} i={1} className="h-full flex-1 rotate-1 shadow-[0_2px_6px_rgba(30,5,37,0.15)]" />
        <Tile p={c} i={2} className="h-full flex-1 -rotate-[0.5deg] shadow-[0_2px_6px_rgba(30,5,37,0.15)]" />
      </div>
      <p className="font-handwriting text-[22px] leading-none text-grape">{s.name}</p>
    </div>
  );
}

function StopNotes({ stop, mapId }: { stop: number; mapId: string }) {
  const s = TRIP.stops[stop];
  return (
    <div className="flex h-full flex-col p-6">
      <span className="flex items-center gap-2 font-geist text-caption text-muted">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-grape text-[10px] font-semibold leading-none text-background">{stop + 1}</span>
        {s.days}
      </span>
      <p className="mt-1 font-heading text-h3-lg text-heading">{s.name}</p>
      <div className="mt-3 flex flex-col gap-2 font-geist text-body text-secondary">
        {s.notes.map((n) => (
          <p key={n}>{n}</p>
        ))}
      </div>
      <div className="mt-auto h-[120px] overflow-hidden rounded-md border border-line-soft">
        <TripMap active={null} fixed={stop} id={`${mapId}-s${stop}`} />
      </div>
    </div>
  );
}

function EndPaper() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="font-handwriting text-[28px] text-grape/70">until the next one</p>
    </div>
  );
}

// ── The book ──────────────────────────────────────────────────────────────────
type Drag = { leaf: number; p: number; forward: boolean };

function Book({ phase, turned, setTurned, mapId }: { phase: FocusPhase; turned: number; setTurned: (n: number) => void; mapId: string }) {
  const [active, setActive] = useState<number | null>(null);
  const [photo, setPhoto] = useState<{ s: number; p: number } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const reduced = useReducedMotion();
  const gesture = useRef<{ x: number; y: number; t: number; started: boolean; id: number } | null>(null);
  const swallowClick = useRef(false);
  const root = useRef<HTMLDivElement>(null);

  const go = useCallback((n: number) => {
    setPhoto(null);
    setTurned(Math.max(0, Math.min(MAX_TURN, n)));
  }, [setTurned]);

  // Arrow keys turn pages
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(turned + 1);
      if (e.key === "ArrowLeft") go(turned - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, turned, go]);

  // ── Dragging a page ──
  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== "open" || e.button !== 0) return;
    gesture.current = { x: e.clientX, y: e.clientY, t: performance.now(), started: false, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.started) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      const forward = dx < 0;
      if (forward ? turned >= MAX_TURN : turned <= 0) return;
      g.started = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setPhoto(null);
      setDrag({ leaf: forward ? turned : turned - 1, p: 0, forward });
    }
    // Scaled with the book, so measure the page as drawn
    const pageW = (root.current?.getBoundingClientRect().width ?? PW * 2) / 2;
    setDrag((d) => (d ? { ...d, p: Math.max(0, Math.min(1, (d.forward ? -dx : dx) / (pageW * 1.6))) } : d));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.started || !drag) return;
    swallowClick.current = true;
    const v = Math.abs(e.clientX - g.x) / Math.max(1, performance.now() - g.t); // px per ms
    const commit = drag.p > 0.33 || (v > 0.6 && drag.p > 0.08);
    setDrag(null);
    if (commit) go(drag.forward ? turned + 1 : turned - 1);
  };

  const angleOf = (i: number) => {
    if (drag && drag.leaf === i) return drag.forward ? drag.p * 180 : 180 - drag.p * 180;
    return i < turned ? 180 : 0;
  };

  const leaves: { front: ReactNode; back: ReactNode }[] = [
    { front: <Cover />, back: <Overview active={active} setActive={setActive} openPhoto={(s, p) => setPhoto({ s, p })} /> },
    { front: <TripMap active={active} onPick={(i) => setActive(i < 0 ? null : i)} id={`${mapId}-o`} />, back: <StopPhotos stop={0} openPhoto={(s, p) => setPhoto({ s, p })} /> },
    { front: <StopNotes stop={0} mapId={mapId} />, back: <StopPhotos stop={1} openPhoto={(s, p) => setPhoto({ s, p })} /> },
    { front: <StopNotes stop={1} mapId={mapId} />, back: <StopPhotos stop={2} openPhoto={(s, p) => setPhoto({ s, p })} /> },
    { front: <StopNotes stop={2} mapId={mapId} />, back: <EndPaper /> },
  ];

  const isOpen = turned > 0 || (drag?.leaf === 0 && drag.p > 0);
  const shot = photo ? TRIP.stops[photo.s].photos[photo.p] : null;

  return (
    <div
      ref={root}
      className="absolute top-0 select-none"
      style={{
        left: -PW,
        width: PW * 2,
        height: PH,
        perspective: 2200,
        // Closed, the cover sits in the middle; open, the spread does
        transform: isOpen ? `translateX(${PW / 2}px)` : "none",
        transition: reduced ? "none" : `transform ${TURN_MS}ms cubic-bezier(0.65, 0, 0.25, 1)`,
        touchAction: "pan-y",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (swallowClick.current) {
          swallowClick.current = false;
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      {/* The book's shadow on the table */}
      <div
        className="absolute bottom-[-12px] h-6 rounded-[50%] bg-midnight/25 blur-md transition-all"
        style={{ left: isOpen ? 16 : PW + 12, right: 16, transitionDuration: `${TURN_MS}ms` }}
        aria-hidden="true"
      />
      {/* Back cover board, under everything */}
      <div className="absolute top-[-4px] h-[calc(100%+8px)] rounded-md bg-vanilla shadow-[0_2px_6px_rgba(30,5,37,0.18)]" style={{ left: isOpen ? -4 : PW, right: -4, transition: `left ${TURN_MS}ms` }} aria-hidden="true" />

      {leaves.map((leaf, i) => {
        const a = angleOf(i);
        const moving = drag?.leaf === i;
        // Turned leaves stack the other way round
        const z = moving ? 50 : a > 90 ? 10 + i : 10 + LEAVES - i;
        const bend = Math.sin((a * Math.PI) / 180); // 0 flat, 1 standing up
        return (
          <div
            key={i}
            className="absolute top-0"
            style={{
              left: PW,
              width: PW,
              height: PH,
              zIndex: z,
              transformOrigin: "0 50%",
              transformStyle: "preserve-3d",
              transform: `rotateY(${-a}deg)`,
              transition: moving || reduced ? "none" : `transform ${TURN_MS}ms cubic-bezier(0.45, 0.05, 0.25, 1)`,
            }}
          >
            {/* Front (right-hand page) */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }} aria-hidden={a > 90} inert={a > 90 ? true : undefined}>
              {i === 0 ? leaf.front : <Paper side="right">{leaf.front}</Paper>}
              <div className="pointer-events-none absolute inset-0 rounded-r-md" style={{ background: `linear-gradient(to left, rgba(30,5,37,${(0.22 * bend).toFixed(3)}), rgba(30,5,37,0) 70%)` }} />
            </div>
            {/* Back (left-hand page once turned) */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} aria-hidden={a <= 90} inert={a <= 90 ? true : undefined}>
              <Paper side="left">{leaf.back}</Paper>
              <div className="pointer-events-none absolute inset-0 rounded-l-md" style={{ background: `linear-gradient(to right, rgba(30,5,37,${(0.22 * bend).toFixed(3)}), rgba(30,5,37,0) 70%)` }} />
            </div>
          </div>
        );
      })}

      {/* A photo, open over the right-hand page */}
      {shot && turned > 0 && (
        <div className="absolute top-0 z-[60] overflow-hidden rounded-r-md bg-midnight" style={{ left: PW, width: PW, height: PH }} data-nodrag="">
          <PixelScene scene={shot.scene} palette={shot.palette} cols={64} rows={86} className="h-full w-full" title={shot.caption} />
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/80 to-transparent px-4 pb-4 pt-12 font-geist text-body text-background">{shot.caption}</p>
          <button type="button" onClick={() => setPhoto(null)} aria-label="Close photo" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-midnight/60 text-background backdrop-blur hover:bg-midnight/80">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Closed: tap the cover to open it */}
      {!isOpen && phase === "open" && (
        <button type="button" onClick={() => go(1)} className="absolute top-0 z-[55] cursor-pointer" style={{ left: PW, width: PW, height: PH }} aria-label="Open the book" />
      )}
    </div>
  );
}

// ── In the hero ───────────────────────────────────────────────────────────────
const LABELS = ["Cover", "Overview", ...TRIP.stops.map((s) => s.name)];

export default function TripsBook({ width = 152, className = "" }: { width?: number; className?: string }) {
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [turned, setTurned] = useState(0);
  const mapId = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const onClosed = useCallback(() => {
    setOpen(false);
    setTurned(0);
  }, []);

  return (
    <>
      <button
        ref={btn}
        type="button"
        data-rest="-6"
        onClick={() => setOpen(true)}
        aria-label="Trips book. Open the itinerary"
        aria-haspopup="dialog"
        className={`relative block rotate-[-6deg] transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-4deg] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
        style={{ width, height: (width * PH) / PW, ["--book-k" as string]: width / PW }}
      >
        {/* The closed book at hero size: the cover, scaled down, on a board edge */}
        <span className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-md bg-[#d9cfbd]" aria-hidden="true" />
        <span className="absolute inset-0 overflow-hidden rounded-md shadow-[0_2px_4px_rgba(30,5,37,0.12),0_12px_24px_rgba(30,5,37,0.14)]">
          <span className="absolute left-0 top-0 block origin-top-left" style={{ width: PW, height: PH, transform: "scale(var(--book-k))" }}>
            <Cover />
          </span>
        </span>
      </button>

      <FocusOverlay
        source={btn.current}
        open={open}
        onClosed={onClosed}
        label="Trips book"
        width={PW}
        height={PH}
        fitWidth={PW * 2 + 32}
        fitHeight={PH + 96}
        closeMs={reduced || turned === 0 ? 0 : TURN_MS + 80}
      >
        {(phase, close) => (
          <BookStage phase={phase} close={close} turned={turned} setTurned={setTurned} mapId={mapId} />
        )}
      </FocusOverlay>
    </>
  );
}

function BookStage({ phase, close, turned, setTurned, mapId }: { phase: FocusPhase; close: () => void; turned: number; setTurned: (n: number) => void; mapId: string }) {
  // Closing: shut the book first, then FocusOverlay flies it home
  useEffect(() => {
    if (phase === "closing") setTurned(0);
  }, [phase, setTurned]);

  const show = phase === "open";
  return (
    <>
      <Book phase={phase} turned={turned} setTurned={setTurned} mapId={mapId} />
      <div
        className={`absolute left-1/2 top-full mt-6 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap transition-opacity duration-300 ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <button type="button" onClick={() => setTurned(Math.max(0, turned - 1))} disabled={turned === 0} aria-label="Previous page" className="flex h-8 w-8 items-center justify-center rounded-md text-secondary hover:bg-card hover:text-heading disabled:opacity-30">
          ‹
        </button>
        <span className="min-w-[88px] text-center font-geist text-caption-lg text-muted" aria-live="polite">
          {turned === 0 ? "Drag or tap to open" : LABELS[turned]}
        </span>
        <button type="button" onClick={() => setTurned(Math.min(MAX_TURN, turned + 1))} disabled={turned === MAX_TURN} aria-label="Next page" className="flex h-8 w-8 items-center justify-center rounded-md text-secondary hover:bg-card hover:text-heading disabled:opacity-30">
          ›
        </button>
        <span className="mx-2 h-4 w-px bg-line" aria-hidden="true" />
        <CloseChip onClick={close} />
      </div>
    </>
  );
}
