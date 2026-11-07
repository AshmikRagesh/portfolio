"use client";

// ── Bella loader ──────────────────────────────────────────────────────────────
// The first thing a visitor sees, once per browser session, while the site loads.
// A terminal-style check-in on a grape screen, in Geist Mono caps:
//
//   left    a list of housekeeping chores ("// Fluffing your pillows...") that drifts
//           slowly upward on a loop; the chore under way is marked by a vanilla bar.
//   centre  Bella stands in a soft spotlight above the count "( 42% )", set in the
//           display serif. Her eyes follow the highlighted chore as it drifts, or
//           the cursor while it moves. Each chore gets its own move: a bounce to
//           fluff the pillows, a ding and a glint for the polish, a wiggle for the
//           towels, a hop for the mint, a sleepy sink for the turndown. Tap her to
//           ring for service. At 100 she plays her celebration and the screen lifts.
//   right   a note to the guest types itself out: each letter arrives as a solid
//           block, flickers through a few random characters, then settles; a block
//           cursor blinks at the end.
//
// The count reaches 100 only once the page has loaded (or after MAX_MS). Then the
// last chore reads "Your room is ready", Bella celebrates, the text blinks out and
// the screen lifts away like a blind. A click or key skips once the page has loaded.
// On phones the three parts stack: list on top, count in the middle, note below.
//
// Bella is flat, so she only moves in the picture plane (hops, squash).
// Shown once per session (sessionStorage "bella-loaded"); ?loader shows it again.
// An inline script in layout.tsx hides it before paint on repeat visits.
// With reduced motion nothing scrolls or scrambles, and the screen fades out.
//
// Background: three DS options while we choose, picked with ?loader=vanilla (default),
// ?loader=midnight or ?loader=plum. Colours live in CSS variables (globals.css).

import { useEffect, useRef, useState } from "react";
import HostCharacter, { hostLayout } from "@/components/host/HostCharacter";

const SEEN_KEY = "bella-loaded";
const MAX_MS = 9000; // never hold the visitor longer than this, loaded or not
const PACE_MS = 3600; // the count's pace when the page is quick
const LIFT_MS = 900;
const BELLA_H = 112;
const THEMES = ["vanilla", "midnight", "plum"] as const;
type Theme = (typeof THEMES)[number];

const CHORES = [
  "Fluffing your pillows",
  "Polishing the front-desk bell",
  "Folding towels into swans",
  "Leaving a mint on your pillow",
  "Turning down the bed",
  "Your room is ready",
];
const NOTE = "Hang tight, guest. Housekeeping is getting your room ready. It takes a moment, but the stay is worth the wait.\u00a0:)";
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
  const [celebrate, setCelebrate] = useState(0);
  const [gaze, setGaze] = useState<{ x: number; y: number } | null>({ x: -1, y: 0 });
  const [theme, setTheme] = useState<Theme>("vanilla");

  const rootRef = useRef<HTMLDivElement>(null);
  const bellaRef = useRef<HTMLDivElement>(null);

  const active = n >= 100 ? CHORES.length - 1 : Math.min(CHORES.length - 2, Math.floor((n / 100) * (CHORES.length - 1)));

  useEffect(() => {
    const html = document.documentElement;
    const params = new URLSearchParams(window.location.search);
    const forced = params.has("loader");
    const asked = params.get("loader") as Theme;
    if (THEMES.includes(asked)) setTheme(asked);
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

    // ── Leaving: the text blinks out, then the screen lifts away like a blind ─
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
        root?.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: LIFT_MS, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" }).finished.then(restore, restore);
      });
      at(260 + LIFT_MS + 200, restore); // in case the tab never paints it
    };

    const skip = (e: Event) => {
      // A tap on Bella rings her instead
      if (e.target instanceof Node && bellaRef.current?.contains(e.target)) return;
      if (loaded) leave();
    };
    window.addEventListener("keydown", skip);
    rootRef.current?.addEventListener("pointerdown", skip);

    // Where Bella should look: at the nearest highlighted chore as it drifts
    let lastPointer = -Infinity;
    const onPointer = () => (lastPointer = performance.now());
    window.addEventListener("pointermove", onPointer);
    const lookAtChore = () => {
      const eye = bellaRef.current?.getBoundingClientRect();
      const bars = Array.from(rootRef.current?.querySelectorAll(".bella-loader-item.is-active") ?? []);
      if (!eye || !bars.length) return { x: -1, y: 0 };
      const cx = eye.left + eye.width / 2;
      const cy = eye.top + eye.height * 0.45;
      const near = bars
        .map((b) => b.getBoundingClientRect())
        .sort((a, b) => Math.abs(a.top - cy) - Math.abs(b.top - cy))[0];
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      return { x: clamp((near.left + near.width / 2 - cx) / 240), y: clamp((near.top + near.height / 2 - cy) / 160) };
    };

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
      // Eyes on the highlighted chore, unless the cursor moved in the last 1.5s
      if (performance.now() - lastPointer < 1500) setGaze(null);
      else setGaze(lookAtChore());
      if (shown >= 100 && !finished) {
        finished = true;
        window.clearInterval(counter);
        setHead(NOTE.length + SETTLE);
        if (reduced) {
          at(600, leave);
        } else {
          setGaze({ x: 0, y: 0 });
          at(120, () => setCelebrate((c) => c + 1));
          at(1500, leave);
        }
      }
    }, 40);

    return () => {
      window.clearInterval(counter);
      timers.forEach(window.clearTimeout);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointermove", onPointer);
      html.style.overflow = prevOverflow;
    };
  }, []);

  // Each chore gets its own move, all in the picture plane, pivoting on her base
  useEffect(() => {
    if (reducedMotion || n >= 100) return;
    const el = bellaRef.current;
    if (!el?.animate) return;
    const T = (y: number, sx: number, sy: number, r = 0) => `translateY(${y}px) rotate(${r}deg) scale(${sx}, ${sy})`;
    const moves: [string[], number][] = [
      // Fluffing the pillows: two bounces
      [[T(0, 1, 1), T(2, 1.08, 0.9), T(-16, 0.96, 1.05), T(2, 1.08, 0.9), T(-10, 0.97, 1.03), T(0, 1, 1)], 900],
      // Polishing the bell: a ding plays its glint; she straightens up proudly
      [[T(0, 1, 1), T(0, 0.98, 1.04), T(0, 1, 1)], 500],
      // Folding towels: a wiggle side to side
      [[T(0, 1, 1), T(0, 1, 1, -8), T(0, 1, 1, 7), T(0, 1, 1, -4), T(0, 1, 1, 2), T(0, 1, 1)], 700],
      // A mint on the pillow: one hop
      [[T(0, 1, 1), T(2, 1.06, 0.92), T(-14, 0.96, 1.05), T(1, 1.04, 0.95), T(0, 1, 1)], 460],
      // Turning down the bed: a slow, sleepy sink and back
      [[T(0, 1, 1), T(4, 1.06, 0.9), T(4, 1.06, 0.9), T(0, 1, 1)], 1100],
    ];
    const [frames, duration] = moves[active] ?? moves[3];
    const t = window.setTimeout(() => {
      el.animate(frames.map((transform) => ({ transform })), { duration, easing: "ease-in-out" });
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
      className={`bella-loader bella-loader--${theme} fixed inset-0 z-[1000] select-none font-brand text-caption uppercase ${closing ? "is-closing" : ""}`}
      role="progressbar"
      aria-label="Loading the site"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={n}
    >
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
          <div className="bella-loader-spot" aria-hidden="true" />
          <div ref={bellaRef} onPointerDown={ring} className="relative cursor-pointer" style={{ transformOrigin: "50% 100%" }} title="Ring for service">
            <HostCharacter ding={ding} celebrate={celebrate} gaze={gaze} style={{ width: bella.width, height: BELLA_H }} />
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
