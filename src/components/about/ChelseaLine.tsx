"use client";

import { useRef } from "react";
import { LION_BODY, LION_STAFF, LION_TRANSFORM, LION_VIEWBOX } from "@/components/hero/lionPath";

// "Chelsea till God calls upon my name. 💙"
// Hover "Chelsea" and the lion peeks up from behind the word. Tap the heart and it beats,
// sending a few small hearts up — still here, still supporting.
export default function ChelseaLine() {
  const heartRef = useRef<HTMLButtonElement>(null);

  const cheer = () => {
    const heart = heartRef.current;
    if (!heart) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heart.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(0.92)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 520, easing: "ease-out" },
    );
    if (still) return;
    for (let i = 0; i < 5; i++) {
      const h = document.createElement("span");
      h.textContent = "💙";
      h.setAttribute("aria-hidden", "true");
      Object.assign(h.style, {
        position: "absolute",
        left: "50%",
        top: "0",
        fontSize: "12px",
        lineHeight: "16px",
        pointerEvents: "none",
      });
      heart.appendChild(h);
      const dx = (i - 2) * 10 + (Math.random() - 0.5) * 8;
      const rot = (Math.random() - 0.5) * 40;
      h.animate(
        [
          { transform: "translate(-50%, 0) scale(0.4)", opacity: 0 },
          { transform: `translate(calc(-50% + ${dx * 0.4}px), -14px) scale(1)`, opacity: 1, offset: 0.25 },
          { transform: `translate(calc(-50% + ${dx}px), -48px) rotate(${rot}deg) scale(0.8)`, opacity: 0 },
        ],
        { duration: 900 + i * 90, delay: i * 50, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "both" },
      ).onfinish = () => h.remove();
    }
  };

  return (
    <>
      <span className="group/lion relative inline-block">
        {/* the lion: a little grape sticker that springs up off the word */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full right-[-8px] mb-[2px] flex h-[32px] w-[32px] origin-bottom-left translate-y-[8px] rotate-[12deg] scale-50 items-center justify-center rounded-full bg-grape opacity-0 shadow-[0_4px_10px_rgba(157,19,106,0.32)] transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] [@media(hover:hover)]:group-hover/lion:translate-y-0 [@media(hover:hover)]:group-hover/lion:rotate-[-6deg] [@media(hover:hover)]:group-hover/lion:scale-100 [@media(hover:hover)]:group-hover/lion:opacity-100"
        >
          <svg viewBox={`${LION_VIEWBOX.x} ${LION_VIEWBOX.y} ${LION_VIEWBOX.w} ${LION_VIEWBOX.h}`} className="h-[20px] w-[20px] fill-white">
            <g transform={LION_TRANSFORM}>
              <path d={LION_BODY} />
              <path d={LION_STAFF} />
            </g>
          </svg>
        </span>
        <span className="relative transition-colors duration-200 [@media(hover:hover)]:group-hover/lion:text-grape">Chelsea</span>
      </span>{" "}
      till God calls upon my name.{" "}
      <button
        ref={heartRef}
        type="button"
        onClick={cheer}
        onMouseEnter={cheer}
        aria-label="Cheer for Chelsea"
        className="relative inline-block cursor-pointer align-baseline leading-none"
      >
        💙
      </button>
    </>
  );
}
