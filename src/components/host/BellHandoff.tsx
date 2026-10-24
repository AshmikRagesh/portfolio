"use client";

// ── Bell handoff ──────────────────────────────────────────────────────────────
// There is one bell. It lives in the navbar as the logo; when the visitor reaches the
// footer it leaves its timer board hanging in the navbar and jumps down onto the footer's
// top edge, and when they scroll back up it jumps home again and takes the board down.
// So the board stays where it always is, and the bell is never on screen twice.
//
// The navbar and the footer each register an anchor: the point, in viewport px, where
// the middle of the bell's base rests there, and the bell's height there. This provider
// watches the footer and flies the bell between the two.
//
//   down   footer's top edge comes up past DOWN_LINE of the screen
//   up     it falls back below UP_LINE — further down, so the bell can't be flicked back
//          and forth by scrolling around one spot
//
// A trip is one jump, drawn on one rAF timeline in a fixed overlay:
//   crouch   anticipation: it squashes down on the spot
//   air      a real gravity arc — horizontal speed constant, height a parabola tuned to
//            pop up a little before it falls — with a stretch that follows its vertical
//            speed, a lean into the jump, and its size easing from one anchor's to the
//            other's. The landing point is measured every frame, so scrolling mid-jump
//            still lands it exactly.
//   land     squash on impact, then two settling bounces
// Then the overlay hands over to the bell at the anchor in the same frame. The eyes look
// where it's going. If the visitor turns round mid-jump it sets off back from wherever it
// is in the air. With reduced motion it just swaps.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import HostCharacter, { hostLayout } from "@/components/host/HostCharacter";
import { useRecordHolder } from "@/components/host/useRecordHolder";

export type Spot = "nav" | "footer";
type Point = { x: number; y: number };
export interface BellAnchor {
  /** Middle of the bell's base, in viewport px; null when the spot isn't on the page. */
  point(): Point | null;
  height: number;
}

// Footer's top edge, as a share of the screen height
const DOWN_LINE = 0.72;
const UP_LINE = 0.88;

const CROUCH_MS = 140;
const LAND_MS = 130;
const POP = 48; // how far above the straight line the arc is pushed — makes the take-off hop
const BOUNCES: Record<Spot, { h: number; ms: number }[]> = {
  footer: [
    { h: 12, ms: 220 },
    { h: 4, ms: 150 },
  ],
  nav: [
    { h: 8, ms: 200 },
    { h: 3, ms: 130 },
  ],
};
const CONTACT_MS = 60;

interface Handoff {
  /** Where the bell is resting, or heading. */
  at: Spot;
  flying: boolean;
  /** The board stays in the navbar while the bell is away: "in" to show it, "out" while it lifts away. */
  navBoard: "in" | "out" | null;
  /** Bump to make the bell at an anchor ring as it's handed over. */
  arrivals: number;
  /** This visit is the longest ever — the bell is gold wherever it is. */
  record: boolean;
  setAnchor(spot: Spot, anchor: BellAnchor | null): void;
}

// Outside the provider (a page without the navbar) the bell simply stays on the footer
const HandoffContext = createContext<Handoff>({ at: "footer", flying: false, navBoard: null, arrivals: 0, record: false, setAnchor: () => {} });
export const useBellHandoff = () => useContext(HandoffContext);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

interface Flight {
  to: Spot;
  from: Point;
  /** Size at take-off and on landing, as a share of the overlay's drawn height. */
  sizeFrom: number;
  sizeTo: number;
  /** Arc height, fixed at take-off. */
  arc: number;
  air: number;
  start: number;
  crouch: boolean;
  /** Where the overlay is right now — a turn-round mid-jump starts from here. */
  now: Point;
  nowSize: number;
}

export function BellHandoffProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const record = useRecordHolder();
  const anchors = useRef<Record<Spot, BellAnchor | null>>({ nav: null, footer: null });
  const [at, setAt] = useState<Spot>("nav");
  const [flying, setFlying] = useState(false);
  const [navBoard, setNavBoard] = useState<Handoff["navBoard"]>(null);
  const [arrivals, setArrivals] = useState(0);
  const [gaze, setGaze] = useState<Point | null>(null);
  const [drawn, setDrawn] = useState(72); // overlay's drawn height: the larger of the two anchors

  const overlayRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const squashRef = useRef<HTMLDivElement>(null);
  const flight = useRef<Flight | null>(null);
  const frame = useRef(0);
  const state = useRef({ at: "nav" as Spot, ready: false });
  const lastGaze = useRef<Point | null>(null);

  const setAnchor = useCallback((spot: Spot, anchor: BellAnchor | null) => {
    anchors.current[spot] = anchor;
  }, []);

  // ── Drawing the overlay ───────────────────────────────────────────────────
  const pose = useCallback((p: Point, size: number, sx = 1, sy = 1, tilt = 0) => {
    const overlay = overlayRef.current;
    const sizer = sizerRef.current;
    const squash = squashRef.current;
    if (!overlay || !sizer || !squash) return;
    const { width, base } = hostLayout(drawn);
    overlay.style.transform = `translate3d(${p.x - width / 2}px, ${p.y - base}px, 0)`;
    sizer.style.transform = `rotate(${tilt}deg) scale(${size})`;
    squash.style.transform = `scale(${sx}, ${sy})`;
  }, [drawn]);

  // ── The jump ──────────────────────────────────────────────────────────────
  const land = useCallback((to: Spot) => {
    cancelAnimationFrame(frame.current);
    flight.current = null;
    state.current.at = to;
    setFlying(false);
    lastGaze.current = null;
    setGaze(null);
    setArrivals((n) => n + 1);
    if (to === "nav") setNavBoard(null);
  }, []);

  const tick = useCallback(
    (now: number) => {
      const f = flight.current;
      if (!f) return;
      const target = anchors.current[f.to]?.point() ?? { x: f.from.x, y: -120 };
      const offstage = !anchors.current[f.to]?.point();
      let t = now - f.start;

      // Crouch
      const crouch = f.crouch ? CROUCH_MS : 0;
      if (t < crouch) {
        const k = easeOut(t / CROUCH_MS);
        f.now = f.from;
        pose(f.from, f.sizeFrom, 1 + 0.12 * k, 1 - 0.16 * k);
        frame.current = requestAnimationFrame(tick);
        return;
      }
      t -= crouch;

      // Air
      if (t < f.air) {
        const u = t / f.air;
        const dx = target.x - f.from.x;
        const dy = target.y - f.from.y;
        const p = { x: f.from.x + dx * u, y: f.from.y + dy * u - 4 * f.arc * u * (1 - u) };
        // Vertical speed (per unit of u): negative going up
        const vy = dy - 4 * f.arc * (1 - 2 * u);
        const k = clamp(Math.abs(vy) / (Math.abs(dy) + 4 * f.arc), 0, 1) * 0.12;
        let sx = 1 - k * 0.5;
        let sy = 1 + k;
        // Spring out of the crouch over the first few frames
        if (f.crouch && t < 80) {
          const e = smooth(t / 80);
          sx = lerp(1.12, sx, e);
          sy = lerp(0.84, sy, e);
        }
        const tilt = Math.sin(Math.PI * u) * clamp(dx / 400, -1, 1) * 8;
        const size = lerp(f.sizeFrom, f.sizeTo, smooth(u));
        f.now = p;
        f.nowSize = size;
        pose(p, size, sx, sy, tilt);
        // Look where it's going: up and out, then down at the landing
        const look = { x: Math.abs(dx) > 40 ? Math.sign(dx) * 0.7 : 0, y: vy > 0 ? 0.8 : -0.8 };
        if (look.x !== lastGaze.current?.x || look.y !== lastGaze.current?.y) {
          lastGaze.current = look;
          setGaze(look);
        }
        // Coming home: the board lifts out of the logo's spot just before it lands
        if (f.to === "nav" && u > 0.78) setNavBoard((b) => (b === "in" ? "out" : b));
        frame.current = requestAnimationFrame(tick);
        return;
      }
      t -= f.air;
      if (offstage) return land(f.to);

      // Land, then settle
      f.now = target;
      if (t < LAND_MS) {
        const k = (1 - t / LAND_MS) ** 2;
        pose(target, f.sizeTo, 1 + 0.2 * k, 1 - 0.24 * k);
        frame.current = requestAnimationFrame(tick);
        return;
      }
      t -= LAND_MS;
      for (const b of BOUNCES[f.to]) {
        if (t < b.ms) {
          const p = t / b.ms;
          const fromContact = Math.min(p, 1 - p) * b.ms;
          const k = fromContact < CONTACT_MS ? (1 - fromContact / CONTACT_MS) * 0.08 : 0;
          pose({ x: target.x, y: target.y - b.h * 4 * p * (1 - p) }, f.sizeTo, 1 + k * 0.7, 1 - k);
          frame.current = requestAnimationFrame(tick);
          return;
        }
        t -= b.ms;
      }
      land(f.to);
    },
    [land, pose]
  );

  const go = useCallback(
    (to: Spot) => {
      const fromSpot: Spot = to === "nav" ? "footer" : "nav";
      state.current.at = to;
      setAt(to);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setNavBoard(to === "footer" ? "in" : null);
        setArrivals((n) => n + 1);
        return;
      }

      const toAnchor = anchors.current[to];
      const fromAnchor = anchors.current[fromSpot];
      const big = Math.max(toAnchor?.height ?? 0, fromAnchor?.height ?? 0, 56);
      const mid = flight.current; // turning round mid-jump
      const target = toAnchor?.point() ?? null;
      let from = mid ? mid.now : fromAnchor?.point() ?? null;
      // Leaving a spot that isn't on the page (the navbar's hidden on phones on case
      // studies): drop in from just above the screen instead
      if (!from) from = { x: target?.x ?? window.innerWidth / 2, y: -big };
      // Never start a long way off-screen — come in from just past the edge
      from = { x: from.x, y: clamp(from.y, -big, window.innerHeight + big) };
      const end = target ?? { x: from.x, y: -120 };

      const dy = end.y - from.y;
      const dx = end.x - from.x;
      const distance = Math.hypot(dx, dy);
      const sizeFrom = mid ? mid.nowSize : (fromAnchor?.height ?? big) / big;
      cancelAnimationFrame(frame.current);
      setDrawn(big);
      flight.current = {
        to,
        from,
        sizeFrom,
        sizeTo: (toAnchor?.height ?? big) / big,
        arc: Math.abs(dy) / 4 + POP,
        air: clamp(520 + distance * 0.32, 640, 1000),
        start: performance.now(),
        crouch: !mid,
        now: from,
        nowSize: sizeFrom,
      };
      // Already in the air: carry straight on from here. Otherwise the layout effect below
      // starts it once the overlay is on the page.
      if (mid) frame.current = requestAnimationFrame(tick);
      setFlying(true);
      // Leaving the navbar: the board swings into the logo's spot as the bell takes off
      if (to === "footer") window.setTimeout(() => flight.current?.to === "footer" && setNavBoard("in"), mid ? 0 : CROUCH_MS + 60);
    },
    [tick]
  );

  // Start the jump once the overlay is on the page and posed where the bell was, so the
  // swap from the anchor's bell to the overlay happens in one frame
  useLayoutEffect(() => {
    const f = flight.current;
    if (!flying || !f) return;
    pose(f.now, f.nowSize);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(tick);
  }, [flying, drawn, pose, tick]);

  // ── Watching the footer ───────────────────────────────────────────────────
  const footerEdge = () => anchors.current.footer?.point()?.y ?? null;

  // Settle without a jump — on load, and after moving to another page
  useEffect(() => {
    cancelAnimationFrame(frame.current);
    flight.current = null;
    setFlying(false);
    const id = requestAnimationFrame(() => {
      const edge = footerEdge();
      const there: Spot = edge !== null && edge < window.innerHeight * DOWN_LINE ? "footer" : "nav";
      state.current.at = there;
      state.current.ready = true;
      setAt(there);
      setNavBoard(there === "footer" ? "in" : null);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    let scheduled = 0;
    const check = () => {
      scheduled = 0;
      if (!state.current.ready) return;
      const edge = footerEdge();
      const h = window.innerHeight;
      if (state.current.at === "nav" && edge !== null && edge < h * DOWN_LINE) go("footer");
      else if (state.current.at === "footer" && (edge === null || edge > h * UP_LINE)) go("nav");
    };
    const onScroll = () => {
      if (!scheduled) scheduled = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(scheduled);
    };
  }, [go]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const value = useMemo(() => ({ at, flying, navBoard, arrivals, record, setAnchor }), [at, flying, navBoard, arrivals, record, setAnchor]);
  const layout = hostLayout(drawn);

  return (
    <HandoffContext.Provider value={value}>
      {children}
      {flying &&
        createPortal(
          <div ref={overlayRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[55] will-change-transform" style={{ width: layout.width, height: drawn }}>
            <div ref={sizerRef} style={{ transformOrigin: `50% ${layout.base}px` }}>
              <div ref={squashRef} style={{ transformOrigin: `50% ${layout.base}px` }}>
                <HostCharacter mood={record ? "champion" : "idle"} gaze={gaze} className="block" style={{ width: layout.width, height: drawn }} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </HandoffContext.Provider>
  );
}
