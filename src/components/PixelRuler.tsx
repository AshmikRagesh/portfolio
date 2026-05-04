"use client";

import { useEffect, useRef } from "react";

const TICK_COUNT = 80; // 80 × 50px = 4000px track

export default function PixelRuler() {
  const lineRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let rafId: number;

    const sync = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const progressX = progress * window.innerWidth;

      // Move the progress needle
      if (lineRef.current) {
        lineRef.current.style.left = `${progressX}px`;
      }

      // Highlight the nearest major tick label (every 100px = labelIndex step)
      const activeIndex = Math.round(progressX / 100);
      labelsRef.current.forEach((el, i) => {
        if (!el) return;
        el.style.color =
          i === activeIndex ? "rgba(0,0,0,0.65)" : "rgb(170,171,171)";
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[28px] overflow-hidden border-b border-black/20 bg-background z-[51]">
      {/* Tick track — fixed, no translation */}
      <div
        className="flex items-start h-full"
        style={{ width: `${TICK_COUNT * 50}px` }}
      >
        {Array.from({ length: TICK_COUNT }, (_, i) => {
          const isMajor = i % 2 === 0;
          return (
            <div
              key={i}
              className="relative shrink-0"
              style={{
                width: 1,
                height: isMajor ? 8 : 6,
                backgroundColor: "rgb(170, 171, 171)",
                marginRight: 49,
              }}
            >
              {isMajor && (
                <span
                  ref={(el) => { labelsRef.current[i / 2] = el; }}
                  className="absolute whitespace-nowrap leading-none"
                  style={{
                    top: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 9,
                    color: "rgb(170, 171, 171)",
                  }}
                >
                  {i * 50}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll progress needle */}
      <div
        ref={lineRef}
        className="absolute top-0 h-full pointer-events-none will-change-[left]"
        style={{ left: 0, width: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
      />
    </div>
  );
}
