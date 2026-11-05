"use client";

// ── The unfold ────────────────────────────────────────────────────────────────
// The sheet arrives folded in half, the top half folded down over the bottom with its
// blank back showing. The top half lifts on the crease and swings up and over to lie
// flat, settling with a small spring, while the sheet drops from its lifted, folded
// height to rest. Light catches each face as it turns: both darken as they pass
// edge-on and brighten again as they lie flat.

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Grain, PAPER_STYLE, PaperBack, TOP_EDGE } from "./paper";
import { EASE, settledAt, spring } from "./motion";

const SWING = spring(70, 13.5);
const DELAY = 220;
// The sheet counts as flat once the swing is within half a degree of it, so what comes
// next (pen circles, the starter tear, being able to tear) starts with no wait
const FLAT_MS = DELAY + settledAt(70, 13.5, 0.5 / 180);

export default function Unfold({ height, onDone, Sheet }: { height: number; onDone: () => void; Sheet: () => ReactNode }) {
  const lift = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const shades = useRef<(HTMLDivElement | null)[]>([]);
  const done = useRef(onDone);
  done.current = onDone;
  const half = height / 2;

  useLayoutEffect(() => {
    const swing: KeyframeAnimationOptions = { duration: SWING.duration, delay: DELAY, easing: SWING.easing, fill: "both" };
    const settle: KeyframeAnimationOptions = { duration: 1000, delay: DELAY, easing: EASE, fill: "both" };
    const anims = [
      lift.current?.animate([{ transform: `translateY(${-half / 2}px)` }, { transform: "translateY(0)" }], settle),
      shadow.current?.animate([{ top: `${half}px`, height: `${half}px` }, { top: "0px", height: `${height}px` }], settle),
      // Turns edge-on (darkest) a third of the way through, since the spring front-loads the swing
      ...shades.current.map((el) =>
        el?.animate([{ opacity: 0 }, { opacity: 0.2, offset: 0.22 }, { opacity: 0.05, offset: 0.45 }, { opacity: 0 }], { ...swing, easing: "linear" }),
      ),
    ];
    const turn = flap.current?.animate([{ transform: "rotateX(-180deg)" }, { transform: "rotateX(0deg)" }], swing);
    const flat = window.setTimeout(() => done.current(), FLAT_MS);
    return () => {
      window.clearTimeout(flat);
      [...anims, turn].forEach((a) => a?.cancel());
    };
  }, [height, half]);

  const face: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  const shade = (i: number) => (
    <div
      ref={(el) => {
        shades.current[i] = el;
      }}
      className="pointer-events-none absolute inset-0 bg-[#2a2216]"
      style={{ opacity: 0 }}
    />
  );
  const halfOf = (which: 0 | 1) => (
    <div className="absolute inset-0 overflow-hidden" style={{ ...face, ...PAPER_STYLE, boxShadow: "none", ...(which === 0 ? TOP_EDGE : {}) }}>
      <div className="absolute inset-x-0 top-0" style={{ height, transform: `translateY(${-which * half}px)` }}>
        <Grain />
        <Sheet />
      </div>
      {which === 0 && shade(0)}
    </div>
  );

  return (
    // A long perspective, so the swinging half doesn't balloon out past the sheet's edges
    <div ref={lift} aria-hidden="true" className="resume-unfold relative" style={{ height, perspective: 3600, perspectiveOrigin: "50% 50%", transformStyle: "preserve-3d" }}>
      <div ref={shadow} className="absolute inset-x-0" style={{ ...PAPER_STYLE, backgroundColor: "transparent" }} />
      <div className="absolute inset-x-0" style={{ top: half, height: half }}>
        {halfOf(1)}
      </div>
      <div ref={flap} className="absolute inset-x-0" style={{ top: 0, height: half, transformOrigin: "50% 100%", transformStyle: "preserve-3d", zIndex: 2 }}>
        {halfOf(0)}
        {/* The back of the top half, seen while it's folded over */}
        <div className="absolute inset-0 overflow-hidden" style={{ ...face, transform: "rotateX(180deg)" }}>
          <PaperBack />
          {shade(1)}
        </div>
      </div>
    </div>
  );
}
