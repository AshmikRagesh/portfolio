"use client";

// ── Tossed onto the desk ──────────────────────────────────────────────────────
// Each hero object sits at its own slight angle, and arrives the first time the hero
// comes into view: dropped in from a little above, turning as it falls, landing with a
// spring, one after another. Hover picks it up a touch, straightening a little.
// `data-rest` carries the angle so FocusOverlay can straighten it on the way up.

import { useEffect, useRef, type ReactNode } from "react";
import { spring } from "@/components/resume/motion";
import { useReducedMotion } from "./FocusOverlay";

const LAND = spring(150, 14);

export default function Tossed({ rotate, delay = 0, className = "", children }: { rotate: number; delay?: number; className?: string; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

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

  return (
    <div ref={el} className={className}>
      <div
        data-rest={rotate}
        className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform:rotate(var(--r))] hover:[transform:rotate(calc(var(--r)*0.5))_translateY(-6px)]"
        style={{ ["--r" as string]: `${rotate}deg` }}
      >
        {children}
      </div>
    </div>
  );
}
