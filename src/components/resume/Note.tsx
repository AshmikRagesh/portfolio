"use client";

// ── The sticky note ───────────────────────────────────────────────────────────
// "download a copy", clipped to the sheet's corner. It drops in once the sheet lies
// flat, landing a touch crooked and springing straight as the clip bites, and lifts
// away the moment it's clicked.

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { RESUME_FILENAME, RESUME_PDF } from "@/lib/resume";
import { INK } from "./paper";
import { spring } from "./motion";
import { clipSound } from "./paperSound";

// A paperclip in two halves: the back loop goes behind the note, the front over it
const CLIP_W = 20, CLIP_H = 60, CLIP_R = 7.5, CLIP_TOP = 12, CLIP_L = 2;
const CLIP_RX = CLIP_W - 2, CLIP_A = CLIP_R + 2, CLIP_B = CLIP_H - CLIP_R - 2;
const CLIP_BACK = `M${CLIP_L} ${CLIP_B - 6} L${CLIP_L} ${CLIP_A} A${CLIP_R} ${CLIP_R} 0 0 1 ${CLIP_RX} ${CLIP_A}`;
const CLIP_FRONT = `M${CLIP_RX} ${CLIP_A} L${CLIP_RX} ${CLIP_B} A${CLIP_R} ${CLIP_R} 0 0 1 ${CLIP_L} ${CLIP_B} L${CLIP_L} ${CLIP_B - 15}`;

function Clip({ d, shadow }: { d: string; shadow: string }) {
  return (
    <svg
      width={CLIP_W}
      height={CLIP_H}
      viewBox={`0 0 ${CLIP_W} ${CLIP_H}`}
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute overflow-visible"
      style={{ right: 4, top: -CLIP_TOP, transform: "rotate(9deg)", transformOrigin: `50% ${CLIP_TOP}px`, filter: `drop-shadow(${shadow})` }}
    >
      {/* Steel wire: a dark edge, the body, and a thin highlight */}
      <path d={d} stroke="#83827d" strokeWidth="2.8" strokeLinecap="round" />
      <path d={d} stroke="#c4c3be" strokeWidth="1.6" strokeLinecap="round" />
      <path d={d} stroke="#f4f3ef" strokeWidth="0.65" strokeLinecap="round" transform="translate(-0.5 -0.25)" />
    </svg>
  );
}

const LAND = spring(260, 17);

export default function Note({ show, taking, onTake, style }: { show: boolean; taking: boolean; onTake: () => void; style: CSSProperties }) {
  const box = useRef<HTMLDivElement>(null);
  const visible = show && !taking;

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    if (visible) {
      clipSound(0.35, 140);
      el.animate(
        [
          { opacity: 0, transform: "translate(10px, -26px) rotate(-9deg) scale(1.08)", filter: "blur(3px)" },
          { opacity: 1, transform: "translate(0, 0) rotate(0deg) scale(1)", filter: "blur(0px)" },
        ],
        { duration: LAND.duration, easing: LAND.easing, delay: 120, fill: "both" },
      );
    } else if (taking) {
      // Peeled off and gone
      el.animate(
        [
          { opacity: 1, transform: "translate(0, 0) rotate(0deg)", filter: "blur(0px)" },
          { opacity: 0, transform: "translate(14px, -18px) rotate(8deg)", filter: "blur(4px)" },
        ],
        { duration: 260, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "both" },
      );
    } else {
      el.style.opacity = "0";
    }
  }, [visible, taking]);

  return (
    <div ref={box} className="absolute z-10" style={{ ...style, opacity: 0 }}>
      <a
        href={RESUME_PDF}
        download={RESUME_FILENAME}
        aria-label="Download a copy of the résumé (PDF)"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTake();
        }}
        className="group/note relative block outline-none"
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <span
          className="relative block rotate-[1.5deg] transition-transform duration-500 ease-out group-hover/note:-translate-y-[2px] group-hover/note:rotate-0 group-focus-visible/note:-translate-y-[2px] group-focus-visible/note:rotate-0"
          style={{ transformOrigin: "70% 0%" }}
        >
          <Clip d={CLIP_BACK} shadow="0.5px 1px 0.6px rgba(40,34,24,0.22)" />
          <span
            className="relative flex items-center justify-center text-center"
            style={{
              width: 100,
              height: 96,
              background: "linear-gradient(to bottom, #efe3b2 0, #f6edc6 9px, #f7eecb 70%, #f3e8bf 100%)",
              boxShadow: "0 1px 1px rgba(48,40,26,0.1), 0 6px 9px -6px rgba(48,40,26,0.3), 6px 9px 10px -9px rgba(48,40,26,0.28)",
            }}
          >
            <span
              className="block font-heading text-[16px] leading-[1.15] underline-offset-2 transition-colors group-hover/note:text-[#1f1d19] group-focus-visible/note:underline"
              style={{ color: INK }}
            >
              download
              <br />a copy
            </span>
          </span>
          <Clip d={CLIP_FRONT} shadow="0.8px 1.4px 0.8px rgba(40,34,24,0.3)" />
        </span>
      </a>
    </div>
  );
}
