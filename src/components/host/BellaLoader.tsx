"use client";

// ── Bella loader ──────────────────────────────────────────────────────────────
// The first thing a visitor sees, once per browser session, while the site loads.
// A terminal-style check-in on a midnight screen, in Geist Mono caps:
//
//   left    a list of housekeeping chores ("// Fluffing your pillows...") that drifts
//           slowly upward on a loop; the chore under way is marked by a vanilla bar.
//   centre  Bella, in her satin rendered finish, stands in a soft pool of light above
//           the count "( 42% )", set in the display serif. Her face stays calm
//           (eyes ahead, blinking); she moves with her whole body instead. She
//           sways gently while she waits, and each chore gets its own move: hops to
//           fluff the pillows, a ding for the bell, a shuffle left and right for the
//           dusting, a hop over to leave the mint, and a backflip to turn down the
//           bed. Tap her to ring for service. At 100 she rings once, then the
//           curtain opens.
//   right   a note to the guest types itself out: each letter arrives as a solid
//           block, flickers through a few random characters, then settles; a block
//           cursor blinks at the end.
//
// The count reaches 100 only once the page has loaded (or after MAX_MS). Then the
// last chore reads "Your room is ready", Bella rings once, the text blinks
// out and the screen opens like a curtain: two halves part from the middle, their
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
const BELLA_H = 112;

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
  const [closing, setClosing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const bellaRef = useRef<HTMLDivElement>(null);

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

    // ── Leaving: the text blinks out, then the curtain opens ──────────────────
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
      setClosing(true);
      at(260, () => {
        if (root) root.style.pointerEvents = "none";
        const halves = (["left", "right"] as const).map((side) =>
          root?.querySelector<HTMLElement>(`[data-curtain="${side}"]`)?.animate([{ clipPath: CURTAIN[side][0] }, { clipPath: CURTAIN[side][1] }], { duration: CURTAIN_MS, easing: CURTAIN_EASE, fill: "forwards" }),
        );
        Promise.all(halves.map((a) => a?.finished)).then(restore, restore);
      });
      at(260 + CURTAIN_MS + 200, restore); // in case the tab never paints it
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
          at(80, () => setDing((d) => d + 1));
          at(1100, leave);
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

  // Each chore gets its own whole-body move, all in the picture plane. The wrapper
  // pivots on her base (for squash); flips turn about her middle, FLIP_Y above it.
  useEffect(() => {
    if (reducedMotion || n >= 100) return;
    const el = bellaRef.current;
    if (!el?.animate) return;
    const FLIP_Y = 52;
    // x, y: px; sx, sy: squash; r: degrees, about her middle
    const T = (x: number, y: number, sx: number, sy: number, r = 0) =>
      `translate(${x}px, ${y}px) translateY(${-FLIP_Y}px) rotate(${r}deg) translateY(${FLIP_Y}px) scale(${sx}, ${sy})`;
    const moves: [string[], number[], number][] = [
      // Fluffing the pillows: two springy hops
      [[T(0, 0, 1, 1), T(0, 2, 1.1, 0.88), T(0, -22, 0.94, 1.08), T(0, 2, 1.1, 0.88), T(0, -14, 0.96, 1.05), T(0, 1, 1.05, 0.94), T(0, 0, 1, 1)], [0, 0.14, 0.34, 0.52, 0.7, 0.86, 1], 960],
      // Polishing the bell: a ding, and she stands a little taller
      [[T(0, 0, 1, 1), T(0, 0, 0.97, 1.05), T(0, 0, 1, 1)], [0, 0.4, 1], 600],
      // Dusting: a shuffle to the left, across to the right, and home, leaning into each
      [[T(0, 0, 1, 1), T(-26, -6, 1, 1, -8), T(-30, 0, 1.04, 0.96, -2), T(22, -8, 1, 1, 8), T(28, 0, 1.04, 0.96, 2), T(0, -4, 1, 1, -3), T(0, 0, 1, 1)], [0, 0.18, 0.3, 0.52, 0.66, 0.86, 1], 1300],
      // Leaving the mint: a hop over to the right and back
      [[T(0, 0, 1, 1), T(0, 2, 1.08, 0.9), T(18, -20, 0.95, 1.06), T(32, 0, 1.08, 0.92), T(32, 0, 1, 1), T(14, -14, 0.96, 1.04), T(0, 0, 1.05, 0.95), T(0, 0, 1, 1)], [0, 0.1, 0.24, 0.38, 0.5, 0.66, 0.84, 1], 1000],
      // Turning down the bed: crouch, a full backflip, a squashy landing
      [[T(0, 0, 1, 1), T(0, 4, 1.14, 0.84), T(0, -46, 0.94, 1.06, -120), T(0, -58, 1, 1, -230), T(0, -24, 1, 1, -330), T(0, 4, 1.16, 0.84, -360), T(0, -6, 0.97, 1.03, -360), T(0, 0, 1, 1, -360)], [0, 0.18, 0.38, 0.5, 0.66, 0.78, 0.9, 1], 1100],
    ];
    const [frames, offsets, duration] = moves[active] ?? moves[3];
    const t = window.setTimeout(() => {
      el.animate(frames.map((transform, i) => ({ transform, offset: offsets[i] })), { duration, easing: "ease-in-out" });
      if (active === 1) setDing((d) => d + 1);
    }, active === 0 ? 400 : 0);
    return () => window.clearTimeout(t);
  }, [active, reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tap Bella to ring for service (doesn't skip the loader)
  const ring = (e: React.PointerEvent) => {
    e.stopPropagation();
    setDing((d) => d + 1);
    if (!reducedMotion)
      bellaRef.current?.animate([{ transform: "scale(1, 1)" }, { transform: "scale(1.06, 0.92)" }, { transform: "scale(1, 1)" }], { duration: 240, easing: "ease-out" });
  };

  if (gone) return null;

  const bella = hostLayout(BELLA_H);
  const chores = [...CHORES, ...CHORES];

  return (
    <div
      ref={rootRef}
      className={`bella-loader fixed inset-0 z-[1000] select-none font-brand text-caption uppercase ${closing ? "is-closing" : ""}`}
      role="progressbar"
      aria-label="Loading the site"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={n}
    >
      {/* The curtain: two midnight halves that part when it's time to go */}
      <div data-curtain="left" className="bella-loader-curtain" style={{ clipPath: CURTAIN.left[0] }} aria-hidden="true" />
      <div data-curtain="right" className="bella-loader-curtain" style={{ clipPath: CURTAIN.right[0] }} aria-hidden="true" />
      <div className="relative flex h-full flex-col items-center justify-between px-4 py-12 md:flex-row md:px-5 md:py-0">
        {/* The chores, drifting upward on a loop */}
        <div className="bella-loader-fade bella-loader-list h-[164px] w-full overflow-hidden md:w-auto">
          <ul className="bella-loader-items flex flex-col gap-3">
            {chores.map((c, i) => (
              <li key={i} className={`bella-loader-item relative mx-auto w-fit md:mx-0 ${i % CHORES.length === active ? "is-active" : ""}`}>
                {`// ${c}...`}
              </li>
            ))}
          </ul>
        </div>

        {/* Bella on top of the count */}
        <div className="bella-loader-fade relative flex flex-col items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-[60%]">
          {/* The pool of light she stands in, and her contact shadow (both stay on the floor when she hops) */}
          <div className="bella-loader-pool" style={{ top: bella.base - 20 }} aria-hidden="true" />
          <div className="bella-loader-contact" style={{ top: bella.base - 3 }} aria-hidden="true" />
          <div className="bella-loader-sway">
          <div ref={bellaRef} onPointerDown={ring} className="bella-loader-bella relative cursor-pointer" style={{ transformOrigin: "50% 100%" }} title="Ring for service">
            <HostCharacter rendered ding={ding} gaze={{ x: 0, y: 0 }} style={{ width: bella.width, height: BELLA_H }} />
          </div>
          </div>
          <div className="relative mt-4 whitespace-pre font-heading text-h2 tabular-nums normal-case md:text-h2-md">{`( ${n}% )`}</div>
        </div>

        {/* The note, typing itself out */}
        <p className="bella-loader-fade relative max-w-[320px] text-center md:max-w-[300px] md:text-right" aria-label={NOTE}>
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
