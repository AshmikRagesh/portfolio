"use client";

// ── The trips book ────────────────────────────────────────────────────────────
// A small hardback by the portrait. Click it and it comes to the middle of the screen
// (FocusOverlay, the same motion as the medal and the GitHub card). Drag the cover, tap
// it, or use the arrows, and it opens: one spread per trip, the stops listed on the left
// (one open at a time, the list scrolls) and the route on the right.
//
// Pages turn with real physics, not a canned animation:
//   · the point you grab follows the pointer: a page held at distance r from the spine
//     is turned to the angle where r·cos θ lands under the pointer
//   · let go and a damped spring carries it the rest of the way, starting at the speed
//     you flicked it; past halfway (or flicked) it turns, otherwise it falls back
//   · it lands with a little bounce, the way paper settles on paper
//   · as it lifts it shades, catches a highlight along the curve, and casts a shadow
//     on the page underneath that shrinks as it comes over
// Arrow keys and the buttons drive the same spring.
//
// On a phone a two-page spread would be half size, so the book shows one page at a time
// at full width: a swipe slides from a trip's stops to its route, and the next swipe turns
// the leaf over while the book slides along with it, so the turned page lands in view.

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import HoverTip from "../HoverTip";
import FocusOverlay, { RoundButton, useReducedMotion, type FocusPhase } from "../FocusOverlay";
import { Cover, ClosedEdges, PH, PW } from "./Cover";
import TripMap from "./TripMap";
import { TRIPS, type Trip } from "./trip";

const LEAVES = TRIPS.length + 1; // the cover, then one leaf per trip
const MAX_TURN = TRIPS.length;
const STIFF = 170;
const DAMP = 23;
const FLICK = 320; // degrees per second that count as a flick

// ── Pages ─────────────────────────────────────────────────────────────────────
function Paper({ children, side }: { children?: ReactNode; side: "left" | "right" }) {
  return (
    <div className={`absolute inset-0 overflow-hidden bg-[#fdfcfa] ${side === "left" ? "rounded-l-[6px]" : "rounded-r-[6px]"}`}>
      {/* Fine paper tooth */}
      <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(30,5,37,0.018) 0 1px, transparent 1px 2px)" }} />
      {children}
      {/* The gutter: the page curving down into the spine */}
      <div
        className="pointer-events-none absolute inset-y-0 w-10"
        style={side === "left" ? { right: 0, background: "linear-gradient(to left, rgba(30,5,37,0.14), rgba(30,5,37,0.04) 40%, transparent)" } : { left: 0, background: "linear-gradient(to right, rgba(30,5,37,0.14), rgba(30,5,37,0.04) 40%, transparent)" }}
      />
    </div>
  );
}

function Thumbs({ stop, onOpen }: { stop: Trip["stops"][number]; onOpen: (p: number) => void }) {
  return (
    <div className="flex pl-1">
      {stop.photos.map((ph, i) => (
        <button
          key={ph.src}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`${stop.name}: open photo ${i + 1} of ${stop.photos.length}, ${ph.caption}`}
          className="relative -ml-2 h-11 w-11 overflow-hidden rounded-full bg-card ring-2 ring-[#fdfcfa] shadow-[0_1px_3px_rgba(30,5,37,0.25)] transition-transform duration-300 ease-out first:ml-0 hover:z-10 hover:-translate-y-1 hover:scale-110"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ph.src} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

function Itinerary({ trip, index, active, setActive, openPhoto }: { trip: Trip; index: number; active: number | null; setActive: (i: number | null) => void; openPhoto: (s: number, p: number) => void }) {
  return (
    <div className="flex h-full flex-col pl-7 pr-9 pt-7">
      <p className="font-geist text-[10px] font-medium uppercase leading-none tracking-[1.6px] text-muted">
        Trip {index + 1} of {TRIPS.length}
      </p>
      <p className="mt-2 font-heading text-[30px] leading-none tracking-[-1px] text-heading">{trip.title}</p>
      <p className="mt-2 font-geist text-caption text-secondary">{trip.when}</p>
      {/* The list scrolls; it fades out under the bottom edge */}
      <div
        className="-mr-4 mt-4 flex-1 overflow-y-auto overscroll-contain pb-8 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 40px), transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 40px), transparent)" }}
      >
        {trip.stops.map((s, i) => {
          const on = active === i;
          return (
            <div key={s.name} className="relative border-t border-line-soft first:border-t-0">
              <button type="button" aria-expanded={on} onClick={() => setActive(on ? null : i)} className="group flex w-full items-start gap-3 py-3 text-left">
                <span className={`mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-geist text-[10px] font-semibold leading-none transition-colors duration-300 ${on ? "bg-primary text-background" : "bg-grape-light text-grape group-hover:bg-pink"}`}>{i + 1}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-geist text-caption text-muted">
                    {s.days}
                    {s.leg ? ` · ${s.leg}` : ""}
                  </span>
                  <span className="flex items-center gap-1.5 font-geist text-body-lg font-medium text-heading">
                    {s.name}
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="text-muted transition-transform duration-300" style={{ transform: on ? "rotate(180deg)" : "none" }}>
                      <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </button>
              <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <div className={`pb-4 pl-8 transition-[opacity,transform] duration-500 ${on ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}>
                    <p className="font-geist text-body text-secondary">{s.line}</p>
                    <div className="mt-3">
                      <Thumbs stop={s} onOpen={(p) => openPhoto(i, p)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EndPaper() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <p className="font-handwriting text-[30px] leading-none text-grape/70">until the next one</p>
      <p className="font-geist text-caption text-muted">— A.R.</p>
    </div>
  );
}

function PhotoViewer({ trip, at, onMove, onClose }: { trip: Trip; at: { s: number; p: number }; onMove: (d: number) => void; onClose: () => void }) {
  const stop = trip.stops[at.s];
  const ph = stop.photos[at.p];
  const many = stop.photos.length > 1;
  return (
    <div className="absolute inset-0 animate-[bookPhotoIn_420ms_cubic-bezier(0.22,1,0.36,1)] overflow-hidden rounded-r-[6px] bg-midnight">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={ph.src} src={ph.src} alt={`${stop.name}: ${ph.caption}`} draggable={false} className="absolute inset-0 h-full w-full animate-[bookPhotoImg_600ms_ease-out] object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/85 via-midnight/40 to-transparent px-5 pb-5 pt-16">
        <p className="font-geist text-[10px] font-medium uppercase tracking-[1.6px] text-background/70">
          {stop.name} · {at.p + 1} / {stop.photos.length}
        </p>
        <p className="mt-1 font-geist text-body-lg text-background">{ph.caption}</p>
      </div>
      <div className="absolute right-3 top-3 flex gap-1">
        {many && (
          <>
            <ViewerButton label="Previous photo" onClick={() => onMove(-1)}>‹</ViewerButton>
            <ViewerButton label="Next photo" onClick={() => onMove(1)}>›</ViewerButton>
          </>
        )}
        <ViewerButton label="Close photo" onClick={onClose}>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </ViewerButton>
      </div>
    </div>
  );
}
function ViewerButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight/45 text-[16px] leading-none text-background backdrop-blur-md transition-colors hover:bg-midnight/70">
      {children}
    </button>
  );
}

// ── The book ──────────────────────────────────────────────────────────────────
type Sim = { a: number[]; v: number[]; target: number[]; startAt: number[]; p: number; pv: number; pt: number };
export type Side = "l" | "r";
type Nav = { next: () => void; prev: () => void; goTo: (turned: number, side: Side) => void };

/** Where the book slides to so the page being read is in view (phone, one page at a time) */
const panFor = (turned: number, side: Side) => (turned > 0 && side === "l" ? PW : 0);

function Book({ phase, turned, side, compact, nav, uid, api }: { phase: FocusPhase; turned: number; side: Side; compact: boolean; nav: Nav; uid: string; api: React.MutableRefObject<BookApi | null> }) {
  const [active, setActive] = useState<(number | null)[]>(() => TRIPS.map(() => null));
  const [photo, setPhoto] = useState<{ t: number; s: number; p: number } | null>(null);
  const reduced = useReducedMotion();

  const root = useRef<HTMLDivElement>(null);
  const leafEls = useRef<(HTMLDivElement | null)[]>([]);
  const shadeEls = useRef<(HTMLDivElement | null)[]>([]);
  const castR = useRef<HTMLDivElement>(null);
  const castL = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const tableShadow = useRef<HTMLDivElement>(null);
  const sim = useRef<Sim>({ a: Array(LEAVES).fill(0), v: Array(LEAVES).fill(0), target: Array(LEAVES).fill(0), startAt: Array(LEAVES).fill(0), p: 0, pv: 0, pt: 0 });
  const dragging = useRef<{ leaf: number; r: number; lastA: number; lastT: number; w: number; a0: number; scale: number } | null>(null);
  const panning = useRef<{ p0: number; lastP: number; lastT: number; scale: number } | null>(null);
  const gesture = useRef<{ x: number; y: number; id: number; started: boolean; side: Side } | null>(null);
  const compactRef = useRef(compact);
  compactRef.current = compact;
  const swallow = useRef(false);
  const raf = useRef(0);
  const closing = useRef(false);
  const waiters = useRef<(() => void)[]>([]);

  // ── Drawing one frame ──
  const draw = useCallback(() => {
    const { a } = sim.current;
    const d = dragging.current?.leaf;
    let lead = -1;
    let leadLift = 0;
    for (let i = 0; i < LEAVES; i++) {
      const el = leafEls.current[i];
      if (!el) continue;
      const th = a[i];
      const lift = Math.sin((th * Math.PI) / 180);
      if (lift > leadLift) {
        leadLift = lift;
        lead = i;
      }
      el.style.transform = `rotateY(${(-th).toFixed(3)}deg)`;
      // Stacking: on the left the later page lies on top, on the right the earlier one does.
      // A page in the air is lifted above the resting pages but keeps that same order, so
      // two pages moving at once (closing) never pass through each other.
      const side = th > 90 ? 10 + i : 10 + LEAVES - i;
      el.style.zIndex = String(side + (d === i ? 40 : lift > 0.02 ? 25 : 0));
      const [front, back] = [shadeEls.current[i * 2], shadeEls.current[i * 2 + 1]];
      // Shading across the lifting page: darker towards the spine, a soft highlight along the curve
      const sh = (0.28 * lift).toFixed(3);
      const hi = (0.22 * lift).toFixed(3);
      if (front) front.style.background = `linear-gradient(to left, rgba(255,255,255,${hi}) 0%, rgba(255,255,255,0) 22%, rgba(30,5,37,0) 55%, rgba(30,5,37,${sh}) 100%)`;
      if (back) back.style.background = `linear-gradient(to right, rgba(255,255,255,${hi}) 0%, rgba(255,255,255,0) 22%, rgba(30,5,37,0) 55%, rgba(30,5,37,${sh}) 100%)`;
    }
    // The lifted page's shadow on whichever page it's over
    const th = lead >= 0 ? a[lead] : 0;
    const proj = Math.cos((th * Math.PI) / 180); // where its edge is, -1 left … 1 right
    const strength = (0.32 * leadLift).toFixed(3);
    if (castR.current) {
      const on = lead >= 0 && proj > 0;
      castR.current.style.opacity = on ? "1" : "0";
      if (on) castR.current.style.background = `linear-gradient(to right, rgba(30,5,37,${strength}) 0%, rgba(30,5,37,${(0.6 * Number(strength)).toFixed(3)}) ${(proj * 100).toFixed(1)}%, rgba(30,5,37,0) ${Math.min(100, proj * 100 + 18).toFixed(1)}%)`;
    }
    if (castL.current) {
      const on = lead >= 0 && proj < 0;
      castL.current.style.opacity = on ? "1" : "0";
      if (on) castL.current.style.background = `linear-gradient(to left, rgba(30,5,37,${strength}) 0%, rgba(30,5,37,${(0.6 * Number(strength)).toFixed(3)}) ${(-proj * 100).toFixed(1)}%, rgba(30,5,37,0) ${Math.min(100, -proj * 100 + 18).toFixed(1)}%)`;
    }
    // Closed, the cover sits in the middle; as it opens the whole book slides over so the spread is centred
    const open = (1 - Math.cos((a[0] * Math.PI) / 180)) / 2;
    const shift = compactRef.current ? sim.current.p : open * PW * 0.5;
    if (root.current) root.current.style.transform = `translateX(${shift.toFixed(2)}px)`;
    if (board.current) board.current.style.left = `${((1 - open) * PW - 4).toFixed(2)}px`;
    if (tableShadow.current) tableShadow.current.style.left = `${((1 - open) * PW + 16).toFixed(2)}px`;
  }, []);

  // ── The spring ──
  const run = useCallback(() => {
    cancelAnimationFrame(raf.current);
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const s = sim.current;
      let moving = false;
      for (let i = 0; i < LEAVES; i++) {
        if (dragging.current?.leaf === i) {
          moving = true;
          continue;
        }
        if (now < s.startAt[i]) {
          moving = true;
          continue;
        }
        const k = closing.current ? 260 : STIFF;
        const c = closing.current ? 30 : DAMP;
        const acc = -k * (s.a[i] - s.target[i]) - c * s.v[i];
        s.v[i] += acc * dt;
        s.a[i] += s.v[i] * dt;
        // Paper landing on paper: it can't go through, it settles with a small bounce
        if (s.a[i] > 180) {
          s.a[i] = 180;
          s.v[i] = -s.v[i] * 0.22;
        } else if (s.a[i] < 0) {
          s.a[i] = 0;
          s.v[i] = -s.v[i] * 0.22;
        }
        if (Math.abs(s.a[i] - s.target[i]) > 0.05 || Math.abs(s.v[i]) > 0.5) moving = true;
        else {
          s.a[i] = s.target[i];
          s.v[i] = 0;
        }
      }
      // The slide (phone): a spring of its own, unless a finger is holding it
      if (panning.current || (compactRef.current && dragging.current)) moving = true;
      else {
        s.pv += (-STIFF * (s.p - s.pt) - DAMP * s.pv) * dt;
        s.p += s.pv * dt;
        if (Math.abs(s.p - s.pt) > 0.3 || Math.abs(s.pv) > 2) moving = true;
        else {
          s.p = s.pt;
          s.pv = 0;
        }
      }
      draw();
      // Closing: fly home as soon as every page is visibly flat, without waiting out the
      // last invisible fraction of the bounce
      if (waiters.current.length && s.a.every((a, i) => Math.abs(a - s.target[i]) < 1.5 && Math.abs(s.v[i]) < 30) && Math.abs(s.p - s.pt) < 2 && !s.startAt.some((t) => now < t)) {
        waiters.current.splice(0).forEach((f) => f());
      }
      if (moving) raf.current = requestAnimationFrame(step);
      else {
        closing.current = false;
        waiters.current.splice(0).forEach((f) => f());
      }
    };
    raf.current = requestAnimationFrame(step);
  }, [draw]);

  // Whenever the page changes, every leaf heads for its side; several at once fan out
  const prevTurned = useRef(turned);
  useLayoutEffect(() => {
    const s = sim.current;
    const now = performance.now();
    const from = prevTurned.current;
    prevTurned.current = turned;
    let order = 0;
    const leaves = turned > from ? [...Array(LEAVES).keys()] : [...Array(LEAVES).keys()].reverse();
    for (const i of leaves) {
      const t = i < turned ? 180 : 0;
      if (s.target[i] !== t) {
        s.target[i] = t;
        s.startAt[i] = now + order * (closing.current ? 55 : 70);
        order++;
      }
    }
    s.pt = panFor(turned, side);
    if (reduced) {
      s.a = s.target.slice();
      s.v.fill(0);
      s.p = s.pt;
      s.pv = 0;
      draw();
      return;
    }
    run();
  }, [turned, side, compact, reduced, run, draw]);

  // Any page move puts an open photo away
  useEffect(() => setPhoto(null), [turned, side]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Closing: the turned pages riffle back one after another, last first, quicker than a
  // normal turn; resolves once every page is lying flat
  api.current = {
    closeUp: () =>
      new Promise<void>((resolve) => {
        setPhoto(null);
        if (turned === 0 && sim.current.a.every((a) => a === 0) && sim.current.p === 0) return resolve();
        closing.current = true;
        waiters.current.push(resolve);
        window.setTimeout(resolve, 2000);
        if (turned === 0) run();
        else nav.goTo(0, "l");
      }),
  };

  // Arrow keys turn pages
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nav.next();
      if (e.key === "ArrowLeft") nav.prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, nav]);

  // ── Dragging ──
  // Keep the pointer while a page is held (it can be refused, e.g. if the pointer has already gone)
  const capture = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };
  const geometry = () => {
    const r = root.current!.getBoundingClientRect();
    return { spine: r.left + r.width / 2, w: r.width / 2 };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== "open" || e.button !== 0 || reduced) return;
    // A second finger while a page is held is ignored
    if (dragging.current || panning.current) return;
    const { spine } = geometry();
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, started: false, side: e.clientX >= spine ? "r" : "l" };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const { spine, w } = geometry();
    const scale = root.current!.getBoundingClientRect().width / (PW * 2);
    if (compactRef.current) {
      const dx = e.clientX - g.x;
      if (!g.started) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - g.y)) return;
        const forward = dx < 0;
        // Forward from a route page (or the cover) turns the leaf; from a stops page it slides
        // over to the route. Back is the mirror of that.
        const turnLeaf = forward ? turned === 0 || side === "r" : turned > 0 && side === "l";
        if (turnLeaf ? (forward ? turned >= MAX_TURN : turned <= 0) : turned === 0) return;
        g.started = true;
        capture(e);
        setPhoto(null);
        if (turnLeaf) {
          const leaf = forward ? turned : turned - 1;
          dragging.current = { leaf, r: 1, lastA: sim.current.a[leaf], lastT: performance.now(), w, a0: sim.current.a[leaf], scale };
          sim.current.v[leaf] = 0;
        } else {
          panning.current = { p0: sim.current.p, lastP: sim.current.p, lastT: performance.now(), scale };
          sim.current.pv = 0;
        }
        run();
      }
      const now = performance.now();
      const dr = dragging.current;
      if (dr) {
        // A swipe across most of the page turns it all the way
        const th = Math.max(0, Math.min(180, dr.a0 - (dx / (PW * dr.scale * 0.8)) * 180));
        const dt = Math.max(1, now - dr.lastT) / 1000;
        const s = sim.current;
        s.v[dr.leaf] = s.v[dr.leaf] * 0.6 + ((th - dr.lastA) / dt) * 0.4;
        dr.lastA = th;
        dr.lastT = now;
        s.a[dr.leaf] = th;
        // The book slides with the page, so the page lands where it can be read
        const rad = (th * Math.PI) / 180;
        s.p = (PW * (1 - Math.cos(rad))) / 2;
        s.pv = ((PW * Math.sin(rad)) / 2) * ((s.v[dr.leaf] * Math.PI) / 180);
        return;
      }
      const pn = panning.current;
      if (pn) {
        const raw = pn.p0 + dx / pn.scale;
        // A little give past either end
        const p = raw < 0 ? raw * 0.3 : raw > PW ? PW + (raw - PW) * 0.3 : raw;
        const dt = Math.max(1, now - pn.lastT) / 1000;
        sim.current.pv = sim.current.pv * 0.6 + ((p - pn.lastP) / dt) * 0.4;
        pn.lastP = p;
        pn.lastT = now;
        sim.current.p = p;
      }
      return;
    }
    if (!g.started) {
      const dx = e.clientX - g.x;
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - g.y)) return;
      const forward = g.side === "r";
      if (forward ? turned >= MAX_TURN : turned <= 0) return;
      g.started = true;
      capture(e);
      setPhoto(null);
      const leaf = forward ? turned : turned - 1;
      // Where along the page it was grabbed (never right at the spine, or it would spin)
      const r = Math.max(0.35, Math.min(1, Math.abs(g.x - spine) / w));
      dragging.current = { leaf, r, lastA: sim.current.a[leaf], lastT: performance.now(), w, a0: sim.current.a[leaf], scale };
      sim.current.v[leaf] = 0;
      run();
    }
    const dr = dragging.current;
    if (!dr) return;
    const u = (e.clientX - spine) / dr.w;
    const th = (Math.acos(Math.max(-1, Math.min(1, u / dr.r))) * 180) / Math.PI;
    const now = performance.now();
    const dt = Math.max(1, now - dr.lastT) / 1000;
    // Smoothed angular speed, for the flick
    sim.current.v[dr.leaf] = sim.current.v[dr.leaf] * 0.6 + ((th - dr.lastA) / dt) * 0.4;
    dr.lastA = th;
    dr.lastT = now;
    sim.current.a[dr.leaf] = th;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    // Only the finger holding the page lets it go
    if (g && g.id !== e.pointerId) return;
    gesture.current = null;
    const dr = dragging.current;
    const pn = panning.current;
    if (!dr && !pn) return;
    // Swallow the click this release would fire, and only that one
    swallow.current = true;
    window.setTimeout(() => (swallow.current = false), 0);
    dragging.current = null;
    panning.current = null;
    const s = sim.current;
    if (pn) {
      // Slid over to the route, or back to the stops: flicked, or whichever is more in view
      const to: Side = Math.abs(s.pv) > 400 ? (s.pv > 0 ? "l" : "r") : s.p > PW / 2 ? "l" : "r";
      s.pt = panFor(turned, to);
      nav.goTo(turned, to);
      run();
      return;
    }
    if (!dr) return;
    const th = s.a[dr.leaf];
    const w = s.v[dr.leaf];
    const over = Math.abs(w) > FLICK ? w > 0 : th > 90;
    const next = over ? dr.leaf + 1 : dr.leaf;
    s.target[dr.leaf] = over ? 180 : 0;
    s.startAt[dr.leaf] = 0;
    prevTurned.current = next;
    // Phone: a turned-over page lands with its stops in view, a page let fall back with its route
    const to: Side = compactRef.current ? (over ? "l" : "r") : side;
    s.pt = panFor(next, to);
    if (next !== turned || to !== side) nav.goTo(next, to);
    run();
  };

  const openPhoto = (t: number) => (s: number, p: number) => setPhoto({ t, s, p });
  const faces: { front: ReactNode; back: ReactNode }[] = [];
  for (let i = 0; i < LEAVES; i++) {
    const front = i === 0 ? <Cover /> : <Paper side="right"><TripMap trip={TRIPS[i - 1]} active={active[i - 1]} onPick={(s) => setActive((a) => a.map((x, k) => (k === i - 1 ? s : x)))} id={`${uid}-m${i}`} /></Paper>;
    const back =
      i < TRIPS.length ? (
        <Paper side="left">
          <Itinerary trip={TRIPS[i]} index={i} active={active[i]} setActive={(s) => setActive((a) => a.map((x, k) => (k === i ? s : x)))} openPhoto={openPhoto(i)} />
        </Paper>
      ) : (
        <Paper side="left"><EndPaper /></Paper>
      );
    faces.push({ front, back });
  }
  const viewing = photo && turned === photo.t + 1 ? photo : null;
  // A photo opens over the right-hand page, or on a phone over the page in view
  const photoLeft = compact && side === "l" ? 0 : PW;

  return (
    <div
      ref={root}
      className="absolute top-0 select-none"
      style={{ left: -PW, width: PW * 2, height: PH, perspective: 2400, touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (swallow.current) {
          swallow.current = false;
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      {/* A soft contact shadow under the book; it covers only the cover while closed and
          widens with the spread as it opens */}
      <div ref={tableShadow} className="pointer-events-none absolute -bottom-3 h-6 rounded-[50%] bg-midnight/15 blur-lg" style={{ left: PW + 16, right: 16 }} aria-hidden="true" />
      {/* Back board and page block, under everything */}
      <div ref={board} className="absolute -bottom-1 -top-1 right-[-4px] rounded-[4px_10px_10px_4px] bg-[#e9e3d6] shadow-[0_1px_2px_rgba(30,5,37,0.10),0_10px_24px_rgba(30,5,37,0.10)]" style={{ left: PW - 4 }} aria-hidden="true" />
      <div className="pointer-events-none absolute top-0" style={{ left: PW, width: PW, height: PH }} aria-hidden="true">
        <ClosedEdges />
      </div>

      {faces.map((f, i) => {
        const isTurned = i < turned;
        return (
          <div
            key={i}
            ref={(el) => {
              leafEls.current[i] = el;
            }}
            className="absolute top-0 will-change-transform"
            style={{ left: PW, width: PW, height: PH, transformOrigin: "0 50%", transformStyle: "preserve-3d", zIndex: 10 + LEAVES - i }}
          >
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }} inert={isTurned ? true : undefined}>
              {f.front}
              <div ref={(el) => { shadeEls.current[i * 2] = el; }} className={`pointer-events-none absolute inset-0 ${i === 0 ? "rounded-[3px_10px_10px_3px]" : "rounded-r-[6px]"}`} />
            </div>
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} inert={!isTurned ? true : undefined}>
              {f.back}
              <div ref={(el) => { shadeEls.current[i * 2 + 1] = el; }} className="pointer-events-none absolute inset-0 rounded-l-[6px]" />
            </div>
          </div>
        );
      })}

      {/* Shadows the turning page casts on the pages under it */}
      <div ref={castR} className="pointer-events-none absolute top-0 z-[35] rounded-r-[6px] opacity-0" style={{ left: PW, width: PW, height: PH }} aria-hidden="true" />
      <div ref={castL} className="pointer-events-none absolute top-0 z-[35] rounded-l-[6px] opacity-0" style={{ left: 0, width: PW, height: PH }} aria-hidden="true" />

      {/* A photo, open over the right-hand page */}
      {viewing && (
        <div className={`absolute top-0 z-[80] ${photoLeft === 0 ? "[&>div]:rounded-l-[6px] [&>div]:rounded-r-none" : ""}`} style={{ left: photoLeft, width: PW, height: PH }}>
          <PhotoViewer
            trip={TRIPS[viewing.t]}
            at={viewing}
            onClose={() => setPhoto(null)}
            onMove={(d) => setPhoto((p) => (p ? { ...p, p: (p.p + d + TRIPS[p.t].stops[p.s].photos.length) % TRIPS[p.t].stops[p.s].photos.length } : p))}
          />
        </div>
      )}

      {/* Closed: tap the cover to open it */}
      {turned === 0 && phase === "open" && (
        <button type="button" onClick={nav.next} className="absolute top-0 z-[70] cursor-pointer rounded-[3px_10px_10px_3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-grape" style={{ left: PW, width: PW, height: PH }} aria-label="Open the book" />
      )}
      {/* The page corners lift under the pointer: a hint that they turn. Bottom right goes
          forward, bottom left goes back */}
      {turned > 0 && phase === "open" && !viewing && (
        <>
          {/* On a phone only the corners of the page in view */}
          {turned < MAX_TURN && (!compact || side === "r") && <PageCorner corner="r" label="Turn the page" onClick={nav.next} left={PW * 2 - 48} />}
          {(!compact || side === "l") && <PageCorner corner="l" label="Turn back" onClick={nav.prev} left={0} />}
        </>
      )}
    </div>
  );
}

function PageCorner({ corner, label, onClick, left }: { corner: Side; label: string; onClick: () => void; left: number }) {
  const r = corner === "r";
  return (
    <button type="button" onClick={onClick} aria-label={label} className="group absolute bottom-0 z-[70] h-12 w-12" style={{ left }}>
      <span
        className={`absolute bottom-0 block h-5 w-5 transition-all duration-300 ease-out group-hover:h-10 group-hover:w-10 group-active:h-10 group-active:w-10 ${r ? "right-0 rounded-tl-[3px]" : "left-0 rounded-tr-[3px]"}`}
        style={{
          background: `linear-gradient(${r ? 135 : 225}deg, #e9e3d6 0%, #fdfcfa 48%, transparent 50%)`,
          boxShadow: `${r ? -2 : 2}px -2px 6px rgba(30,5,37,0.12)`,
        }}
      />
    </button>
  );
}

/** A phone: one page at a time */
function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 639px)");
    const read = () => setCompact(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);
  return compact;
}

// ── In the hero ───────────────────────────────────────────────────────────────
type BookApi = { closeUp: () => Promise<void> };

export default function TripsBook({ className = "" }: { className?: string }) {
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [turned, setTurned] = useState(0);
  const [side, setSide] = useState<Side>("l");
  const [moves, setMoves] = useState(0);
  const compact = useCompact();
  const api = useRef<BookApi | null>(null);
  const uid = useId().replace(/:/g, "");
  const onClosed = useCallback(() => {
    setOpen(false);
    setTurned(0);
    setSide("l");
  }, []);

  // Paging. On a wide screen a step is a spread; on a phone it's a page: the stops, then the route
  const goTo = useCallback((t: number, s: Side) => {
    setTurned(Math.max(0, Math.min(MAX_TURN, t)));
    setSide(s);
    setMoves((m) => m + 1);
  }, []);
  const next = useCallback(() => {
    if (!compact) return goTo(turned + 1, "l");
    if (turned === 0) return goTo(1, "l");
    if (side === "l") return goTo(turned, "r");
    if (turned < MAX_TURN) goTo(turned + 1, "l");
  }, [compact, turned, side, goTo]);
  const prev = useCallback(() => {
    if (!compact) return goTo(turned - 1, "l");
    if (turned === 0) return;
    if (side === "r") return goTo(turned, "l");
    goTo(turned - 1, "r");
  }, [compact, turned, side, goTo]);
  const nav = useMemo(() => ({ next, prev, goTo }), [next, prev, goTo]);
  const atEnd = turned === MAX_TURN && (!compact || side === "r");
  // Before it flies home: riffle the pages shut, and wait until they've settled
  const beforeClose = useCallback(() => api.current?.closeUp() ?? Promise.resolve(), []);

  // The cover is drawn at full size and scaled to whatever width the hero gives it
  useLayoutEffect(() => {
    const el = btn.current;
    if (!el) return;
    const read = () => el.style.setProperty("--book-k", String(el.offsetWidth / PW));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Trips book. Open the itinerary"
        aria-haspopup="dialog"
        className={`group group/tip relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
        style={{ aspectRatio: `${PW} / ${PH}` }}
      >
        <span className="absolute left-0 top-0 block origin-top-left" style={{ width: PW, height: PH, transform: "scale(var(--book-k, 0.5))" }}>
          <span className="absolute -bottom-1 -top-1 left-[-4px] right-[-4px] rounded-[4px_10px_10px_4px] bg-[#e9e3d6] shadow-[0_2px_4px_rgba(30,5,37,0.14),0_16px_32px_rgba(30,5,37,0.18)] transition-shadow duration-300 group-hover:shadow-[0_4px_8px_rgba(30,5,37,0.14),0_28px_48px_rgba(30,5,37,0.22)]" />
          <ClosedEdges />
          {/* The cover opens a crack on hover */}
          <span className="absolute inset-0 block origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] group-hover:[transform:perspective(900px)_rotateY(-14deg)]">
            <Cover />
          </span>
        </span>
        <HoverTip>Flip through four trips</HoverTip>
      </button>

      <FocusOverlay
        source={btn.current}
        open={open}
        onClosed={onClosed}
        label="Trips book"
        width={PW}
        height={PH}
        fitWidth={compact ? PW + 24 : PW * 2 + 32}
        fitHeight={PH + 140}
        beforeClose={beforeClose}
      >
        {(phase) => <BookStage phase={phase} turned={turned} side={side} compact={compact} nav={nav} atEnd={atEnd} moves={moves} uid={uid} api={api} />}
      </FocusOverlay>
    </>
  );
}

function BookStage({ phase, turned, side, compact, nav, atEnd, moves, uid, api }: { phase: FocusPhase; turned: number; side: Side; compact: boolean; nav: Nav; atEnd: boolean; moves: number; uid: string; api: React.MutableRefObject<BookApi | null> }) {
  const open = phase === "open";
  // What's on the page in view, said under the controls on a phone
  const where = turned === 0 ? "" : compact ? (side === "l" ? "Stops" : "Route") : "";
  const hint = moves < 2 ? (compact ? "Swipe the page, or use the arrows" : "Drag a page, or use ← → to turn") : where;
  return (
    <>
      <Book phase={phase} turned={turned} side={side} compact={compact} nav={nav} uid={uid} api={api} />
      {/* Page control: back · one dot per trip · forward. The current trip's dot stretches
          into a pill; every dot is a button, named for its trip, with the name as a tooltip */}
      <nav
        aria-label="Pages"
        className={`absolute left-1/2 top-full mt-8 flex -translate-x-1/2 items-center gap-1 rounded-full bg-background/85 p-1 shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_1px_2px_rgba(30,5,37,0.05),0_6px_20px_rgba(30,5,37,0.08)] backdrop-blur-md transition-[opacity,transform] duration-300 ease-out ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        <RoundButton onClick={nav.prev} disabled={turned === 0} aria-label="Previous page" className="h-11 w-11 sm:h-9 sm:w-9">
          <Chevron left />
        </RoundButton>
        <div className="flex h-11 items-center gap-0.5 px-1 sm:h-9 sm:gap-1.5 sm:px-2">
          {TRIPS.map((t, i) => {
            const on = turned === i + 1;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => nav.goTo(i + 1, "l")}
                aria-label={`${t.title}, trip ${i + 1} of ${TRIPS.length}`}
                aria-current={on ? "page" : undefined}
                className="group/dot relative flex h-11 items-center justify-center px-1.5 sm:h-6 sm:px-0.5"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    on ? "w-5 bg-grape" : "w-1.5 bg-line group-hover/dot:bg-muted"
                  }`}
                />
                <span className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-md bg-midnight px-2 py-1 font-geist text-caption text-background opacity-0 shadow-[0_4px_12px_rgba(30,5,37,0.2)] transition-[opacity,transform] duration-200 group-hover/dot:-translate-y-0.5 group-hover/dot:opacity-100">
                  {t.title}
                </span>
              </button>
            );
          })}
        </div>
        <RoundButton onClick={nav.next} disabled={atEnd} aria-label={turned === 0 ? "Open the book" : "Next page"} className="h-11 w-11 sm:h-9 sm:w-9">
          <Chevron />
        </RoundButton>
      </nav>
      {/* How to turn, until it's been done; then, on a phone, which page is in view */}
      <p
        aria-live="polite"
        className={`absolute left-1/2 top-full mt-[92px] -translate-x-1/2 whitespace-nowrap font-geist text-caption text-muted transition-opacity duration-300 sm:mt-[84px] ${open && hint ? "opacity-100" : "opacity-0"}`}
      >
        {hint}
      </p>
    </>
  );
}

function Chevron({ left = false }: { left?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ transform: left ? "scaleX(-1)" : undefined }}>
      <path d="M5.25 3 9.25 7l-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
