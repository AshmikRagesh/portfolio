"use client";

import { useEffect, useRef } from "react";
import { useChatDrawer } from "@/context/ChatContext";

const TICK_COUNT = 80; // 80 × 50px = 4000px track

export default function PixelRuler() {
  const { isOpen } = useChatDrawer();
  const lineRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const isDragging = useRef(false);

  // Shared sync: move needle + highlight nearest major label
  const sync = () => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const progressX = progress * window.innerWidth;

    // Center the 20px hit-area div on progressX
    if (lineRef.current) {
      lineRef.current.style.left = `${progressX - 10}px`;
    }

    const activeIndex = Math.round(progressX / 100);
    labelsRef.current.forEach((el, i) => {
      if (!el) return;
      if (i === activeIndex) {
        el.style.color = "#091624";
        el.style.fontWeight = "600";
        el.style.fontSize = "10px";
      } else {
        el.style.color = "rgb(170,171,171)";
        el.style.fontWeight = "normal";
        el.style.fontSize = "9px";
      }
    });
  };

  // Scroll listener
  useEffect(() => {
    let rafId: number;
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

  // Drag logic: dragging the needle scrolls the page
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      window.scrollTo(0, progress * maxScroll);
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ew-resize";
    e.preventDefault();
  };

  return (
    <div
      className={`fixed top-0 left-0 h-[28px] overflow-hidden border-b border-black/20 bg-background z-[51] transition-[right] duration-300 ease-in-out ${
        isOpen ? "lg:right-[400px] right-0" : "right-0"
      }`}
    >
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
                  className="absolute whitespace-nowrap leading-none transition-[color,font-weight,font-size] duration-100"
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

      {/* Draggable needle — 20px wide hit area centered on progress position */}
      <div
        ref={lineRef}
        onMouseDown={handleMouseDown}
        className="group absolute top-0 h-full cursor-ew-resize select-none"
        style={{ left: -10, width: 20 }}
      >
        {/* 1.5px visible line, centered in hit area */}
        <div
          className="absolute top-0 h-full bg-black/35 group-hover:bg-black/60 transition-colors duration-150"
          style={{ left: "50%", width: 1.5, transform: "translateX(-50%)" }}
        />
        {/* Scrollbar-style thumb pill — appears on hover */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/30 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-150"
          style={{ width: 5, height: 18 }}
        />
      </div>
    </div>
  );
}
