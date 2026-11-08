"use client";

// ── Bella loader ──────────────────────────────────────────────────────────────
// The first thing a visitor sees, once per browser session, while the site loads.
// A terminal-style check-in on a midnight screen, in Geist Mono caps:
//
//   left    a list of housekeeping chores ("// Fluffing your pillows...") that drifts
//           slowly upward on a loop; the chore under way is marked by a vanilla bar.
//   centre  Bella, in her satin rendered finish, stands in a soft pool of light above
//           the count "( 42% )", set in the display serif. Her face stays calm
//           (eyes ahead, blinking). She stays in one spot and keeps jumping, with
//           the weight of a real object: a crouch, a stretched take-off, a hang at
//           the top, a fall that speeds up, a squash on impact, a small rebound,
//           and a settle. Her contact shadow shrinks and fades as she rises.
//           Tap her to ring for service. At 100 she rings and the curtain opens
//           straight away.
//   right   a note to the guest types itself out: each letter arrives as a solid
//           block, flickers through a few random characters, then settles; a block
//           cursor blinks at the end.
//
// The count reaches 100 only once the page has loaded (or after MAX_MS). Then the
// last chore reads "Your room is ready", Bella rings, and the screen opens like a
// curtain while the text fades up and away: two halves part from the middle, their
// inner edges slanted (the bottom travels further than the top), over 1.05s on
// cubic-bezier(0.76, 0, 0.24, 1). A click or key skips once the page has loaded.
// On phones the three parts stack: list on top, count in the middle, note below.
//
// Bella is flat, so she only moves in the picture plane (hops, squash).
// Shown once per session (sessionStorage "bella-loaded"); ?loader shows it again.
// An inline script in layout.tsx hides it before paint on repeat visits.
// With reduced motion nothing scrolls or scrambles, and the screen fades out.
// Bella's rendered finish (HostCharacter `rendered`) gives her a lit, lacquered
// look with a rim light, so she reads on the dark screen without an outline.

import { useEffect, useRef, useState } from "react";
import HostCharacter, { hostLayout } from "@/components/host/HostCharacter";

const SEEN_KEY = "bella-loaded";
const MAX_MS = 9000; // never hold the visitor longer than this, loaded or not
const PACE_MS = 3600; // the count's pace when the page is quick
const CURTAIN_MS = 1050;
const CURTAIN_EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
// Each half: from its side of the screen to off-screen, the inner edge slanting as it goes
const CURTAIN = {
  left: ["polygon(0% -10%, 50% -10%, 50% 110%, 0% 110%)", "polygon(0% -10%, -6% -10%, -86% 110%, 0% 110%)"],
  right: ["polygon(50% -10%, 100% -10%, 100% 110%, 50% 110%)", "polygon(106% -10%, 100% -10%, 100% 110%, 186% 110%)"],
};
const BELLA_H = 88;

const CHORES = [
  "Fluffing the pillows",
  "Polishing the front-desk bell",
  "Dusting off the case studies",
  "Leaving a mint on your pillow",
  "Turning down the bed",
  "Your room is ready",
];
const NOTE = "Welcome in. Housekeeping is putting the finishing touches on your room: fresh sheets, plumped pillows, the good soap.";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\[]{}#%&*+=?!;:^~";
const NOTE_CHARS_PER_MS = 0.04; // ~3s to type the note
const SETTLE = 6; // characters behind the head that are still flickering

export default function BellaLoader() {
  const [gone, setGone] = useState(false);
  const [n, setN] = useState(0);
  const [head, setHead] = useState(-1); // how far the note has typed
  const [tick, setTick] = useState(0); // re-rolls the flickering characters
  const [ding, setDing] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const bellaRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const active = n >= 100 ? CHORES.length - 1 : Math.min(CHORES.length - 2, Math.floor((n / 100) * (CHORES.length - 1)));

  useEffect(() => {
    const html = document.documentElement;
    const forced = new URLSearchParams(window.location.search).has("loader");
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SEEN_KEY);
    } catch {}
    if (seen && !forced) {
      setGone(true);
      return;
    }
    html.classList.remove("loader-skip");
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
    const start = performance.now();
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    let fontsReady = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => (fontsReady = true));

    // ── Leaving: the curtain opens at once while the text fades up and away ───
    let leaving = false;
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      html.style.overflow = prevOverflow;
      setGone(true);
    };
    const leave = () => {
      if (leaving) return;
      leaving = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      const root = rootRef.current;
      if (reduced) {
        root?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-out", fill: "forwards" }).finished.then(restore, restore);
        at(520, restore);
        return;
      }
      if (root) root.style.pointerEvents = "none";
      contentRef.current?.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-12px)" }], { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" });
      const halves = (["left", "right"] as const).map((side) =>
        root?.querySelector<HTMLElement>(`[data-curtain="${side}"]`)?.animate([{ clipPath: CURTAIN[side][0] }, { clipPath: CURTAIN[side][1] }], { duration: CURTAIN_MS, easing: CURTAIN_EASE, fill: "forwards" }),
      );
      Promise.all(halves.map((a) => a?.finished)).then(restore, restore);
      at(CURTAIN_MS + 200, restore); // in case the tab never paints it
    };

    const skip = (e: Event) => {
      // A tap on Bella rings her instead
      if (e.target instanceof Node && bellaRef.current?.contains(e.target)) return;
      if (loaded) leave();
    };
    window.addEventListener("keydown", skip);
    rootRef.current?.addEventListener("pointerdown", skip);

    // ── The count and the note, on a timer so they run in a tab that isn't painting
    let shown = 0;
    let finished = false;
    const counter = window.setInterval(() => {
      const t = performance.now() - start;
      const ready = (loaded && fontsReady) || t > MAX_MS;
      const timeCap = 100 * (1 - Math.pow(1 - Math.min(1, t / PACE_MS), 1.6));
      const target = Math.min(timeCap, ready ? 100 : 94);
      shown += (target - shown) * 0.12;
      if (target - shown < 0.5) shown = target;
      setN(Math.floor(shown));
      setHead(reduced ? NOTE.length + SETTLE : (t - 300) * NOTE_CHARS_PER_MS);
      setTick((k) => k + 1);
      if (shown >= 100 && !finished) {
        finished = true;
        window.clearInterval(counter);
        setHead(NOTE.length + SETTLE);
        if (reduced) {
          at(600, leave);
        } else {
          setDing((d) => d + 1);
          at(160, leave);
        }
      }
    }, 40);

    return () => {
      window.clearInterval(counter);
      timers.forEach(window.clearTimeout);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", skip);
      html.style.overflow = prevOverflow;
    };
  }, []);

  // Bella jumps on the spot, on a loop. One cycle is a big jump and a small rebound,
  // then a beat of rest. Each keyframe carries the easing of the stretch after it:
  // rises ease out (slowing to the top), falls ease in (speeding up), so the arc
  // reads as gravity. Stretch is strongest leaving and nearing the ground, none at
  // the top; squash happens only on contact. Squash pivots on her base.
  useEffect(() => {
    if (reducedMotion) return;
    const body = bellaRef.current;
    const shadow = shadowRef.current;
    if (!body?.animate) return;
    const UP = "cubic-bezier(0.33, 1, 0.68, 1)";
    const DOWN = "cubic-bezier(0.32, 0, 0.67, 0)";
    const PUSH = "cubic-bezier(0.5, 0, 0.75, 0)";
    const EASE = "cubic-bezier(0.37, 0, 0.63, 1)";
    const REST = "cubic-bezier(0.22, 1, 0.36, 1)";
    // [offset, y px, scaleX, scaleY, contact shadow scale, shadow opacity, easing of the next stretch]
    const cycle: [number, number, number, number, number, number, string][] = [
      [0, 0, 1, 1, 1, 1, EASE],
      [0.14, 0, 1.06, 0.92, 1.06, 1, PUSH], // crouch
      [0.2, -5, 0.95, 1.07, 0.96, 0.9, UP], // take-off, stretched
      [0.42, -30, 1, 1, 0.56, 0.4, DOWN], // the top
      [0.6, -4, 0.96, 1.05, 0.96, 0.9, "linear"], // about to land, stretched
      [0.63, 0, 1.08, 0.9, 1.08, 1, REST], // impact
      [0.69, 0, 0.98, 1.03, 1, 1, UP], // springs back
      [0.77, -6, 1, 1, 0.88, 0.8, DOWN], // a small rebound
      [0.85, 0, 1.03, 0.97, 1.03, 1, REST],
      [0.92, 0, 0.995, 1.005, 1, 1, EASE],
      [1, 0, 1, 1, 1, 1, EASE],
    ];
    const opts: KeyframeAnimationOptions = { duration: 1700, iterations: Infinity, delay: 300 };
    const a = body.animate(cycle.map(([offset, y, sx, sy, , , easing]) => ({ offset, easing, transform: `translateY(${y}px) scale(${sx}, ${sy})` })), opts);
    const b = shadow?.animate(cycle.map(([offset, , , , k, o, easing]) => ({ offset, easing, opacity: o, transform: `translateX(-50%) scale(${k}, 1)` })), opts);
    return () => {
      a.cancel();
      b?.cancel();
    };
  }, [reducedMotion, gone]);

  // At the polish chore, she rings
  useEffect(() => {
    if (active === 1) setDing((d) => d + 1);
  }, [active]);

  // Tap Bella to ring for service (doesn't skip the loader)
  const ring = (e: React.PointerEvent) => {
    e.stopPropagation();
    setDing((d) => d + 1);
  };

  if (gone) return null;

  const bella = hostLayout(BELLA_H);
  const chores = [...CHORES, ...CHORES];

  return (
    <div
      ref={rootRef}
      className={`bella-loader fixed inset-0 z-[1000] select-none font-brand text-caption uppercase`}
      role="progressbar"
      aria-label="Loading the site"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={n}
    >
      {/* The curtain: two midnight halves that part when it's time to go */}
      <div data-curtain="left" className="bella-loader-curtain" style={{ clipPath: CURTAIN.left[0] }} aria-hidden="true" />
      <div data-curtain="right" className="bella-loader-curtain" style={{ clipPath: CURTAIN.right[0] }} aria-hidden="true" />
      <div ref={contentRef} className="relative flex h-full flex-col items-center justify-between px-4 py-12 md:flex-row md:px-5 md:py-0">
        {/* The chores, drifting upward on a loop */}
        <div className="bella-loader-list h-[164px] w-full overflow-hidden md:w-auto">
          <ul className="bella-loader-items flex flex-col gap-3">
            {chores.map((c, i) => (
              <li key={i} className={`bella-loader-item relative mx-auto w-fit md:mx-0 ${i % CHORES.length === active ? "is-active" : ""}`}>
                {`// ${c}...`}
              </li>
            ))}
          </ul>
        </div>

        {/* Bella on top of the count */}
        <div className="relative flex flex-col items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-[60%]">
          {/* The pool of light she stands in, and her contact shadow (both stay on the floor when she hops) */}
          <div className="bella-loader-pool" style={{ top: bella.base - 16 }} aria-hidden="true" />
          <div ref={shadowRef} className="bella-loader-contact" style={{ top: bella.base - 2 }} aria-hidden="true" />
          <div ref={bellaRef} onPointerDown={ring} className="bella-loader-bella relative cursor-pointer" style={{ transformOrigin: `50% ${bella.base}px` }} title="Ring for service">
            <HostCharacter rendered ding={ding} gaze={{ x: 0, y: 0 }} style={{ width: bella.width, height: BELLA_H }} />
          </div>
          <div className="relative mt-4 whitespace-pre font-heading text-h2 tabular-nums normal-case md:text-h2-md">{`( ${n}% )`}</div>
        </div>

        {/* The note, typing itself out */}
        <p className="relative max-w-[320px] text-center md:max-w-[300px] md:text-right" aria-label={NOTE}>
          <span aria-hidden="true">
            {"// "}
            {Array.from(NOTE).map((ch, i) => {
              const behind = head - i;
              if (behind < 0) return <span key={i} className="opacity-0">{ch}</span>;
              if (/\s/.test(ch) || behind >= SETTLE) return <span key={i}>{ch}</span>;
              if (behind < 1.5) return <span key={i} className="bella-loader-block">{ch}</span>;
              return <span key={i}>{GLYPHS[(i * 7 + tick * 13) % GLYPHS.length]}</span>;
            })}
            <span className={`bella-loader-block ${head >= NOTE.length ? "bella-loader-cursor" : "opacity-0"}`}>{" "}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
