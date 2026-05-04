"use client";

import { useEffect, useRef } from "react";

const TICK_COUNT = 80; // 80 × 50px = 4000px track

export default function PixelRuler() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${-window.scrollX}px)`;
      }
    };
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  return (
    <div className="fixed top-[80px] left-0 right-0 h-[40px] overflow-hidden border-b border-black/20 bg-background z-[49]">
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
                height: isMajor ? 12 : 10,
                backgroundColor: "rgb(170, 171, 171)",
                marginRight: 49,
              }}
            >
              {isMajor && (
                <span
                  className="absolute whitespace-nowrap leading-none"
                  style={{
                    top: 18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 10,
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
