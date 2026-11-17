"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import HostCharacter from "@/components/host/HostCharacter";

/**
 * Bella on her own in the page, no card: the live character, centred, a little bigger than
 * the navbar logo, on her own ground shadow. Every 20 seconds she hops into the next
 * thing she does on the site (reading, watching, celebrating, champion, dozing, ringing);
 * between changes she does a small idle hop now and then. Her eyes follow the cursor. A
 * Geist caps caption under her names what she's doing. With reduced motion she holds still
 * and only the state changes.
 */
type Pose = Omit<ComponentProps<typeof HostCharacter>, "style" | "className">;

const STATES: { label: string; pose: Pose; ding?: boolean; celebrate?: boolean }[] = [
  { label: "Greeting you", pose: {}, ding: true },
  { label: "Reading a case study", pose: { glasses: "reading" } },
  { label: "Watching a video", pose: { glasses: "video" } },
  { label: "Celebrating a goal", pose: {}, celebrate: true },
  { label: "Champion of the month", pose: { mood: "champion" } },
  { label: "Dozing while you're away", pose: { mood: "dozing" } },
];

const EVERY_MS = 20_000;
const IDLE_HOP_MS = 6_000;

export default function BellaShowcase() {
  const [i, setI] = useState(0);
  const [beat, setBeat] = useState(0);
  const hopper = useRef<HTMLDivElement>(null);
  const state = STATES[i];

  const hop = (big: boolean) => {
    const el = hopper.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const up = big ? -36 : -14;
    el.animate(
      [
        { transform: "translateY(0) scale(1, 1)" },
        { transform: "translateY(2px) scale(1.06, 0.92)", offset: 0.15 },
        { transform: `translateY(${up}px) scale(0.96, 1.05)`, offset: 0.45 },
        { transform: "translateY(0) scale(1.05, 0.94)", offset: 0.78 },
        { transform: "translateY(0) scale(1, 1)" },
      ],
      { duration: big ? 700 : 480, easing: "cubic-bezier(0.3, 0.7, 0.3, 1)" },
    );
  };

  // The next state every 20s, with a big hop as it changes
  useEffect(() => {
    const id = window.setInterval(() => {
      hop(true);
      window.setTimeout(() => {
        setI((n) => (n + 1) % STATES.length);
        setBeat((b) => b + 1);
      }, 300);
    }, EVERY_MS);
    return () => window.clearInterval(id);
  }, []);

  // Small idle hops in between, except while dozing; ringing and celebrating replay too
  useEffect(() => {
    const id = window.setInterval(() => {
      if (state.pose.mood === "dozing") return;
      if (state.ding || state.celebrate) setBeat((b) => b + 1);
      else hop(false);
    }, IDLE_HOP_MS);
    return () => window.clearInterval(id);
  }, [state]);

  return (
    <figure className="m-0 flex flex-col items-center py-[24px] md:py-[40px]">
      <div ref={hopper} className="origin-bottom">
          <HostCharacter
            {...state.pose}
            ding={state.ding ? beat : 0}
            celebrate={state.celebrate ? beat : 0}
            style={{ width: 200, height: 186 }}
            className="block"
          />
      </div>
      <figcaption
        key={i}
        aria-live="polite"
        className="mt-[24px] animate-[cs-fade_600ms_ease-out] font-geist text-caption font-medium uppercase tracking-[0.5px] text-heading"
      >
        {state.label}
      </figcaption>
    </figure>
  );
}
