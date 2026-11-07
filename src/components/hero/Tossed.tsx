"use client";

// ── On the desk ───────────────────────────────────────────────────────────────
// Each hero object sits at its own slight angle, and arrives the first time the hero
// comes into view: dropped in from a little above, turning as it falls, landing with a
// spring, one after another. Hover picks it up a touch.
//
// They can be moved: pick one up and put it anywhere, so nothing sits in your way.
//   · mouse: press and drag (a plain click still opens it)
//   · touch: press and hold for a moment, then drag; a quick swipe still scrolls
// While held it lifts (bigger shadow, a little larger) and swings with the motion, the
// way a card does in the hand; let go and it settles where it lands. `data-rest` carries
// the angle so FocusOverlay can straighten it on the way up.

import { useEffect, useRef, type ReactNode } from "react";
import { spring } from "@/components/resume/motion";
import { useReducedMotion } from "./FocusOverlay";

const LAND = spring(150, 14);
const HOLD_MS = 260;

export default function Tossed({ rotate, delay = 0, className = "", children }: { rotate: number; delay?: number; className?: string; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null);
  const mover = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const offset = useRef({ x: 0, y: 0 });

  // Arrival
  useEffect(() => {
    const node = el.current;
    if (!node || reduced) return;
    node.style.opacity = "0";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        node.style.opacity = "";
        const spin = rotate > 0 ? 10 : -10;
        node.animate(
          [
            { opacity: 0, transform: `translateY(-28px) rotate(${spin}deg) scale(1.08)` },
            { opacity: 1, transform: "none" },
          ],
          { duration: LAND.duration, easing: LAND.easing, delay, fill: "backwards" },
        );
        node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay, fill: "backwards", easing: "ease-out" });
      },
      { threshold: 0.2 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [delay, rotate, reduced]);

  // Picking it up and putting it down
  useEffect(() => {
    const node = mover.current;
    if (!node) return;
    let start: { x: number; y: number; ox: number; oy: number; id: number; touch: boolean } | null = null;
    let held = false;
    let hold = 0;
    let swallow = false;
    let lastX = 0;
    let swingV = 0;
    let swingA = 0;
    let raf = 0;

    const place = () => {
      node.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px) rotate(${swingA.toFixed(2)}deg) scale(${held ? 1.06 : 1})`;
    };
    const capture = (id: number) => {
      try {
        node.setPointerCapture(id);
      } catch {
        // Not a live pointer (or already released): carry on without capture
      }
    };
    const lift = (on: boolean) => {
      held = on;
      node.style.transition = "transform 200ms cubic-bezier(0.22,1,0.36,1), filter 200ms";
      node.style.filter = on ? "drop-shadow(0 18px 24px rgba(30,5,37,0.22))" : "";
      node.style.zIndex = on ? "60" : "";
      document.body.style.userSelect = on ? "none" : "";
      place();
      window.setTimeout(() => (node.style.transition = ""), 200);
    };
    // The swing: tilts with sideways speed, springs back upright
    const tick = () => {
      swingV += (-swingA * 0.12 - swingV * 0.25);
      swingA += swingV;
      place();
      if (held || Math.abs(swingA) > 0.05 || Math.abs(swingV) > 0.05) raf = requestAnimationFrame(tick);
      else {
        swingA = 0;
        place();
      }
    };

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY, ox: offset.current.x, oy: offset.current.y, id: e.pointerId, touch: e.pointerType === "touch" };
      lastX = e.clientX;
      // Follow the pointer wherever it goes, even if it outruns the object
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      if (start.touch) {
        hold = window.setTimeout(() => {
          if (!start) return;
          capture(start.id);
          lift(true);
          navigator.vibrate?.(8);
          raf = requestAnimationFrame(tick);
        }, HOLD_MS);
      }
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!held) {
        if (start.touch) {
          // Moved before the hold finished: it's a scroll, not a pick-up
          if (Math.hypot(dx, dy) > 8) {
            window.clearTimeout(hold);
            start = null;
          }
          return;
        }
        if (Math.hypot(dx, dy) < 6) return;
        capture(e.pointerId);
        lift(true);
        raf = requestAnimationFrame(tick);
      }
      offset.current = { x: start.ox + dx, y: start.oy + dy };
      swingV += Math.max(-1.2, Math.min(1.2, (e.clientX - lastX) * 0.06));
      lastX = e.clientX;
    };
    const up = () => {
      window.clearTimeout(hold);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (held) {
        swallow = true;
        window.setTimeout(() => (swallow = false), 0);
        // Keep it on the page. Draw where it was let go first: moves are only drawn on the
        // next frame, so after a quick flick the last one may not be on screen yet
        node.style.transition = "";
        place();
        const r = node.getBoundingClientRect();
        const pad = 8;
        if (r.left < pad) offset.current.x += pad - r.left;
        const edge = document.documentElement.clientWidth - pad; // the page, not counting a scrollbar
        if (r.right > edge) offset.current.x -= r.right - edge;
        lift(false);
      }
      start = null;
    };
    const click = (e: MouseEvent) => {
      if (swallow) {
        e.stopPropagation();
        e.preventDefault();
        swallow = false;
      }
    };
    // While held on a touch screen the page mustn't scroll
    const touchMove = (e: TouchEvent) => held && e.preventDefault();
    const menu = (e: Event) => held && e.preventDefault();

    node.addEventListener("pointerdown", down);
    node.addEventListener("click", click, true);
    node.addEventListener("touchmove", touchMove, { passive: false });
    node.addEventListener("contextmenu", menu);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hold);
      node.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      node.removeEventListener("click", click, true);
      node.removeEventListener("touchmove", touchMove);
      node.removeEventListener("contextmenu", menu);
    };
  }, []);

  return (
    <div ref={el} className={className}>
      <div ref={mover} className="cursor-grab touch-pan-y select-none active:cursor-grabbing [-webkit-touch-callout:none]">
        <div
          data-rest={rotate}
          className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform:rotate(var(--r))] hover:[transform:rotate(calc(var(--r)*0.5))_translateY(-6px)]"
          style={{ ["--r" as string]: `${rotate}deg` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
