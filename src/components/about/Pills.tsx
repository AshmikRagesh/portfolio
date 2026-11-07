"use client";

// Highlighted words in the About intro: solid pills, each in its own colour, that do a
// small thing when you hover them (or tap them on a touch screen).
//
//   Travelopia   a paper plane flies over it
//   a workflow   a "Helix on Claude Code" tag springs up; links to the case study
//   Airbnb       a little house pops up and its window lights
//   football     a ball drops in and bounces along it
//   Chelsea      the lion springs up; the 💙 after the line cheers when tapped

import { useRef, useState } from "react";
import Link from "next/link";
import { Tag } from "@/components/Tag";
import { LION_BODY, LION_STAFF, LION_TRANSFORM, LION_VIEWBOX } from "@/components/hero/lionPath";

const PILL =
  "group/pill relative inline-block whitespace-nowrap rounded-full px-[10px] align-baseline leading-[24px] md:leading-[28px] transition-transform duration-200 [@media(hover:hover)]:hover:-translate-y-[1px]";

const STICKER =
  "pointer-events-none absolute bottom-full z-10 mb-[4px] translate-y-[8px] scale-50 opacity-0 transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] " +
  "[@media(hover:hover)]:group-hover/pill:translate-y-0 [@media(hover:hover)]:group-hover/pill:scale-100 [@media(hover:hover)]:group-hover/pill:opacity-100 " +
  "group-data-[on=true]/pill:translate-y-0 group-data-[on=true]/pill:scale-100 group-data-[on=true]/pill:opacity-100 " +
  "group-focus-visible/pill:translate-y-0 group-focus-visible/pill:scale-100 group-focus-visible/pill:opacity-100";

const canHover = () => window.matchMedia("(hover: hover)").matches;
const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Hover plays it; on a touch screen a tap plays it and holds the sticker up for a moment */
function usePlay(play?: (el: HTMLElement) => void) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  const busy = useRef(false);
  const run = () => {
    if (!play || !ref.current || busy.current || still()) return;
    busy.current = true;
    play(ref.current);
    window.setTimeout(() => (busy.current = false), 900);
  };
  return {
    ref,
    "data-on": on,
    onMouseEnter: () => canHover() && run(),
    onClick: () => {
      if (canHover()) return;
      run();
      setOn(true);
      window.setTimeout(() => setOn(false), 1800);
    },
  };
}

// ── Travelopia ────────────────────────────────────────────────────────────────
function flyPlane(pill: HTMLElement) {
  const w = pill.offsetWidth;
  const plane = document.createElement("span");
  plane.setAttribute("aria-hidden", "true");
  plane.innerHTML =
    '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M1 7.2 15 1.2 10.4 15 7.6 9.4Z" fill="#32073e"/><path d="M7.6 9.4 15 1.2 5.2 8.3" fill="#9D136A"/></svg>';
  Object.assign(plane.style, { position: "absolute", left: "0", top: "-14px", pointerEvents: "none", lineHeight: "0" });
  pill.appendChild(plane);
  plane.animate(
    [
      { transform: "translate(-20px, 10px) rotate(-8deg)", opacity: 0 },
      { transform: `translate(${w * 0.2}px, -6px) rotate(-14deg)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${w * 0.6}px, -12px) rotate(4deg)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${w + 16}px, -2px) rotate(16deg)`, opacity: 0 },
    ],
    { duration: 1200, easing: "cubic-bezier(0.4, 0, 0.3, 1)" },
  ).onfinish = () => plane.remove();
}

export function TravelopiaPill() {
  const p = usePlay(flyPlane);
  return (
    <span {...p} ref={p.ref as React.Ref<HTMLSpanElement>} className={`${PILL} bg-primary text-white`}>
      Travelopia
    </span>
  );
}

// ── a workflow → Helix ────────────────────────────────────────────────────────
export function WorkflowPill() {
  return (
    <Link href="/works/helix" className={`${PILL} bg-grape text-white outline-none`}>
      a workflow
      <span aria-hidden="true" className={`${STICKER} left-[4px] origin-bottom-left -rotate-[3deg]`}>
        <span className="block rounded-full shadow-[0_4px_10px_rgba(30,5,37,0.18)]">
          <Tag tone="grey" face="geist">
            Helix on Claude Code ↗
          </Tag>
        </span>
      </span>
      <span className="sr-only"> (Helix on Claude Code case study)</span>
    </Link>
  );
}

// ── Airbnb ────────────────────────────────────────────────────────────────────
export function AirbnbPill() {
  const p = usePlay();
  return (
    <span {...p} ref={p.ref as React.Ref<HTMLSpanElement>} className={`${PILL} bg-pink text-primary`}>
      Airbnb
      <span aria-hidden="true" className={`${STICKER} right-[-4px] origin-bottom-right rotate-[6deg]`}>
        <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-white shadow-[0_4px_10px_rgba(30,5,37,0.18)]">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M3 11.2 12 4l9 7.2" fill="none" stroke="#32073e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 9.6V20h13V9.6" fill="#f8c2f7" stroke="#32073e" strokeWidth="2" strokeLinejoin="round" />
            <rect
              x="10"
              y="13"
              width="4"
              height="4"
              rx="0.6"
              className="fill-[#32073e] transition-[fill] delay-300 duration-200 [@media(hover:hover)]:group-hover/pill:fill-[#ffcf4a] group-data-[on=true]/pill:fill-[#ffcf4a]"
            />
          </svg>
        </span>
      </span>
    </span>
  );
}

// ── football ──────────────────────────────────────────────────────────────────
function bounceBall(pill: HTMLElement) {
  const w = pill.offsetWidth;
  const ball = document.createElement("span");
  ball.setAttribute("aria-hidden", "true");
  ball.innerHTML =
    '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7.2" fill="#fff" stroke="#1e0525" stroke-width="1.2"/><path d="M8 5.2 10.6 7.1 9.6 10.1H6.4L5.4 7.1Z" fill="#1e0525"/><path d="M8 5.2V1.2M10.6 7.1 14.6 5.8M9.6 10.1 12 13.6M6.4 10.1 4 13.6M5.4 7.1 1.4 5.8" stroke="#1e0525" stroke-width="0.9"/></svg>';
  Object.assign(ball.style, { position: "absolute", left: "0", top: "-14px", pointerEvents: "none", lineHeight: "0" });
  pill.appendChild(ball);
  // drops in, bounces three times along the top of the pill, then rolls off the end
  const hops: [number, number][] = [
    [0, -40], [0.14, 0], [0.3, -20], [0.44, 0], [0.56, -9], [0.66, 0], [0.74, -3], [0.8, 0], [1, 0],
  ];
  ball.animate(
    hops.map(([t, y], i) => ({
      transform: `translate(${4 + t * (w + 6)}px, ${y}px) rotate(${t * 540}deg)`,
      opacity: i === 0 ? 0 : i === hops.length - 1 ? 0 : 1,
      offset: t,
      easing: y === 0 ? "cubic-bezier(0.3, 0, 0.6, 0.4)" : "cubic-bezier(0.4, 0.6, 0.7, 1)",
    })),
    { duration: 1400 },
  ).onfinish = () => ball.remove();
}

export function FootballPill() {
  const p = usePlay(bounceBall);
  return (
    <span {...p} ref={p.ref as React.Ref<HTMLSpanElement>} className={`${PILL} bg-success text-white`}>
      football
    </span>
  );
}

// ── Chelsea ───────────────────────────────────────────────────────────────────
export function ChelseaPill() {
  const p = usePlay();
  return (
    <span {...p} ref={p.ref as React.Ref<HTMLSpanElement>} className={`${PILL} bg-[#034694] text-white`}>
      Chelsea
      <span aria-hidden="true" className={`${STICKER} right-[-8px] origin-bottom-left -rotate-[6deg]`}>
        <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white shadow-[0_4px_10px_rgba(3,70,148,0.3)]">
          <svg viewBox={`${LION_VIEWBOX.x} ${LION_VIEWBOX.y} ${LION_VIEWBOX.w} ${LION_VIEWBOX.h}`} className="h-[24px] w-[24px] fill-[#034694]">
            <g transform={LION_TRANSFORM}>
              <path d={LION_BODY} />
              <path d={LION_STAFF} />
            </g>
          </svg>
        </span>
      </span>
    </span>
  );
}

/** The 💙 at the end: it beats, and a few small hearts float up — still here, still supporting */
export function CheerHeart() {
  const ref = useRef<HTMLButtonElement>(null);
  const cheer = () => {
    const heart = ref.current;
    if (!heart) return;
    heart.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(0.92)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 520, easing: "ease-out" },
    );
    if (still()) return;
    for (let i = 0; i < 5; i++) {
      const h = document.createElement("span");
      h.textContent = "💙";
      h.setAttribute("aria-hidden", "true");
      Object.assign(h.style, { position: "absolute", left: "50%", top: "0", fontSize: "12px", lineHeight: "16px", pointerEvents: "none" });
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
    <button ref={ref} type="button" onClick={cheer} onMouseEnter={cheer} aria-label="Cheer for Chelsea" className="relative inline-block cursor-pointer leading-none">
      💙
    </button>
  );
}
