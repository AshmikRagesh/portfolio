"use client";

import { useEffect, useRef } from "react";

const TICK_COUNT = 80; // 80 × 50px = 4000px track

export default function PixelRuler() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const sync = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      // At 100% scroll, right edge of viewport aligns with 1000 on the ruler.
      // On wide viewports (>1000px) the full 0-1000 range is always visible; no shift needed.
      const maxTranslate = Math.min(0, -(1000 - window.innerWidth));
      const translateX = progress * maxTranslate;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${translateX}px)`;
      }
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
    <div className="fixed top-[80px] left-0 right-0 h-[20px] overflow-hidden border-b border-black/20 bg-background z-[49]">
      <div
        ref={trackRef}
        className="flex items-start will-change-transform h-full"
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
                height: isMajor ? 6 : 5,
                backgroundColor: "rgb(170, 171, 171)",
                marginRight: 49,
              }}
            >
              {isMajor && (
                <span
                  className="absolute whitespace-nowrap leading-none"
                  style={{
                    top: 8,
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
    </div>
  );
}
