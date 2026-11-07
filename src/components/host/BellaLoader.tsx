"use client";

// ── Bella loader ──────────────────────────────────────────────────────────────
// The first thing a visitor sees, once per browser session: Bella getting the
// guest's room ready while the site loads. Each chore is one act, with its own line:
//
//   pillows   "Fluffing your pillows" — Bella bounces on a hotel pillow to plump it,
//             the pillow squashing under each landing, then a backflip off it.
//             Feathers float out when she lands.
//   polish    "Giving the bell a polish" — a folded napkin swoops in and buffs her
//             dome; she squeezes her eyes shut, then a glint runs across and a
//             sparkle catches the light.
//   mint      "Leaving a mint on your pillow" — a peppermint drops onto the pillow
//             beside her; she watches it land.
//   ready     "Your room is ready" — she tips her dome like a hat and the room key
//             is hanging underneath. One ding, and the stage lifts away.
//
// Bella is a flat character, so every move stays in the picture plane: hops,
// squashes, flips and tilts, never a turn that would show her edge.
// She's drawn from HostCharacter's paths and colours, split into body (the whole
// bell) and top (plunger + dome + face), so the dome can lift off the base.
//
// The count rolls on an odometer in the display serif. It reaches 100 only once the
// page has loaded; if loading runs long, the chores go round again with new lines.
// Shown once per session (sessionStorage "bella-loaded"); ?loader shows it again.
// An inline script in layout.tsx hides it before paint on repeat visits.
// With reduced motion Bella sits still on her pillow and the stage fades out.
// All sizes are multiples of 2/4px.

import { useEffect, useRef, useState } from "react";
import { DOME, FINISH, GRAPE, LIGHT, MIDNIGHT, RIM, STAR } from "@/components/host/HostCharacter";

const SEEN_KEY = "bella-loaded";
const MAX_MS = 9000; // never hold the visitor longer than this, loaded or not
const LIFT_MS = 900;

type Eyes = "open" | "squeeze" | "happy" | "dizzy";
type Face = { eyes: Eyes; dx?: number; dy?: number };
type Act = "pillows" | "polish" | "mint" | "ready";

const LINES: Record<Act, [string, string]> = {
  // [first time round, if loading runs long and the chores go round again]
  pillows: ["Fluffing your pillows", "Plumping the cushions"],
  polish: ["Giving the bell a polish", "Polishing the brass"],
  mint: ["Leaving a mint on your pillow", "Turning down the bed"],
  ready: ["Your room is ready", "Your room is ready"],
};
const DURATION: Record<Act, number> = { pillows: 1300, polish: 1200, mint: 1000, ready: 1200 };
const CHORES_MS = DURATION.pillows + DURATION.polish + DURATION.mint;

// Where things stand: the pillow's top is at y≈214 under Bella (her base sinks 12 into
// it), and it squashes toward the floor at y=284, so a squash of sy lowers her 70·(1−sy)
const FLOOR = 284;
const PILLOW = "M8 248 Q2 222 24 220 Q100 208 176 220 Q198 222 192 248 Q198 274 176 276 Q100 288 24 276 Q2 274 8 248 Z";
const STITCH = "M18 248 Q14 229 32 227 Q100 216 168 227 Q186 229 182 248 Q186 267 168 269 Q100 280 32 269 Q14 267 18 248 Z";
const FEATHER = "M0 -8 Q5 -2 0 8 Q-5 -2 0 -8 Z";

const around = (x: number, y: number, mid: string) => `translate(${x}px, ${y}px) ${mid} translate(${-x}px, ${-y}px)`;
// [ms, y, rot, sx, sy] for the whole bell — flips about her middle, squashes from her base
const bodyFrame = (p: number[]) => ({
  transform: `translate(0px, ${p[1]}px) ${around(100, 183, `rotate(${p[2]}deg)`)} ${around(100, 226, `scale(${p[3]}, ${p[4]})`)}`,
});
const pillowFrame = (p: number[]) => ({ transform: around(100, FLOOR, `scale(${p[1]}, ${p[2]})`) });

export default function BellaLoader() {
  const [gone, setGone] = useState(false);
  const [n, setN] = useState(0);
  const [face, setFace] = useState<Face>({ eyes: "open" });
  const [line, setLine] = useState(LINES.pillows[0]);

  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const r = {
    body: useRef<SVGGElement>(null),
    top: useRef<SVGGElement>(null),
    pillow: useRef<SVGGElement>(null),
    floor: useRef<SVGEllipseElement>(null),
    feathers: useRef<SVGGElement>(null),
    cloth: useRef<SVGGElement>(null),
    sweep: useRef<SVGRectElement>(null),
    sparkle: useRef<SVGPathElement>(null),
    mint: useRef<SVGGElement>(null),
  };

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
    const start = performance.now();
    const anims: Animation[] = [];
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    // ── Readiness and the count ─────────────────────────────────────────────
    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    let fontsReady = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => (fontsReady = true));

    let shown = 0;
    let done = false;
    // On a timer rather than rAF, so the count keeps going in a tab that isn't painting
    const counter = window.setInterval(() => {
      const t = performance.now() - start;
      const ready = (loaded && fontsReady) || t > MAX_MS;
      // Paced to the chores, easing out so it slows into 100
      const timeCap = 100 * (1 - Math.pow(1 - Math.min(1, t / CHORES_MS), 1.8));
      const target = Math.min(timeCap, ready ? 100 : 94);
      shown += (target - shown) * 0.1;
      if (target - shown < 0.5) shown = target;
      setN(Math.round(shown * 100) / 100);
      if (shown >= 100) {
        done = true;
        window.clearInterval(counter);
        if (reduced) leave();
      }
    }, 32);

    // ── Leaving: the stage lifts away like a blind ─────────────────────────
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
      const lift = reduced
        ? root?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-out", fill: "forwards" })
        : root?.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: LIFT_MS, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" });
      lift?.finished.then(restore, restore);
      at((reduced ? 320 : LIFT_MS) + 200, restore); // in case the tab never paints it
    };

    // Skip with a click or a key once the page has loaded
    const skip = () => {
      if (loaded) leave();
    };
    window.addEventListener("keydown", skip);
    rootRef.current?.addEventListener("pointerdown", skip);

    // ── Choreography ────────────────────────────────────────────────────────
    const play = (el: Element | null, pts: number[][], D: number, frameOf: (p: number[]) => Keyframe, easing = "ease-in-out") => {
      if (!el?.animate) return;
      anims.push(el.animate(pts.map((p) => ({ ...frameOf(p), offset: p[0] / D, easing })), { duration: D, fill: "both" }));
    };
    const faces = (list: [number, Face][]) => list.forEach(([ms, f]) => at(ms, () => setFace(f)));
    const ding = () => {
      const svg = svgRef.current;
      if (!svg) return;
      svg.classList.remove("is-ding");
      void svg.getBoundingClientRect();
      svg.classList.add("is-ding");
      at(900, () => svg.classList.remove("is-ding"));
    };
    const floor = (pts: number[][], D: number) => play(r.floor.current, pts, D, (p) => ({ transform: around(100, FLOOR, `scale(${p[1]}, 1)`), opacity: p[2] }));

    const feathers = () => {
      Array.from(r.feathers.current?.children ?? []).forEach((f, i) => {
        const side = i === 1 ? 1 : -1;
        const x0 = [34, 166, 60][i];
        const drift = [-34, 30, -12][i];
        anims.push(
          f.animate(
            [
              { transform: `translate(${x0}px, 238px) rotate(0deg) scale(0.4)`, opacity: 0 },
              { transform: `translate(${x0 + drift * 0.5}px, 200px) rotate(${side * 40}deg) scale(1)`, opacity: 1, offset: 0.25 },
              { transform: `translate(${x0 + drift * 0.9}px, 214px) rotate(${-side * 20}deg) scale(1)`, opacity: 1, offset: 0.55 },
              { transform: `translate(${x0 + drift * 0.7}px, 230px) rotate(${side * 30}deg) scale(0.9)`, opacity: 1, offset: 0.8 },
              { transform: `translate(${x0 + drift}px, 246px) rotate(${-side * 10}deg) scale(0.8)`, opacity: 0 },
            ],
            { duration: 1600 + i * 200, delay: i * 60, easing: "ease-in-out", fill: "both" },
          ),
        );
      });
    };

    const acts: Record<Act, () => void> = {
      pillows: () => {
        const D = DURATION.pillows;
        // Two small bounces to plump it, a deep load, then a backflip off it
        play(r.body.current, [[0, 0, 0, 1, 1], [150, 10, 0, 1.1, 0.9], [300, -26, 0, 0.94, 1.08], [420, 8, 0, 1.08, 0.92], [540, 12, 0, 1.14, 0.86], [700, -72, -170, 0.95, 1.06], [820, -86, -300, 1, 1], [960, 12, -360, 1.16, 0.84], [1080, -6, -360, 0.97, 1.03], [1200, 0, -360, 1, 1], [D, 0, -360, 1, 1]], D, bodyFrame);
        play(r.pillow.current, [[0, 1, 1], [150, 1.04, 0.85], [300, 0.98, 1.05], [420, 1.04, 0.88], [540, 1.06, 0.82], [700, 0.96, 1.08], [820, 1.02, 0.98], [960, 1.06, 0.82], [1080, 0.98, 1.04], [1200, 1, 1], [D, 1, 1]], D, pillowFrame);
        floor([[0, 1, 0.12], [540, 1.04, 0.14], [820, 0.98, 0.1], [960, 1.06, 0.14], [1200, 1, 0.12], [D, 1, 0.12]], D);
        faces([[0, { eyes: "open" }], [120, { eyes: "squeeze" }], [260, { eyes: "open", dy: -3 }], [400, { eyes: "squeeze" }], [600, { eyes: "happy" }], [940, { eyes: "squeeze" }], [1060, { eyes: "dizzy" }]]);
        at(960, feathers);
      },
      polish: () => {
        const D = DURATION.polish;
        // The napkin buffs the dome, back and forth, and flies off
        play(r.cloth.current, [[0, 260, 110, 30, 0], [100, 230, 130, 24, 1], [240, 128, 168, 8, 1], [380, 74, 178, -10, 1], [520, 126, 164, 10, 1], [660, 76, 174, -8, 1], [820, 250, 104, 40, 1], [900, 270, 96, 44, 0], [D, 270, 96, 44, 0]], D,
          (p) => ({ transform: `translate(${p[1]}px, ${p[2]}px) rotate(${p[3]}deg)`, opacity: p[4] }), "cubic-bezier(0.45, 0, 0.3, 1)");
        play(r.body.current, [[0, 0, 0, 1, 1], [240, 0, 0, 1, 1], [380, 0, -5, 1, 1], [520, 0, 5, 1, 1], [660, 0, -4, 1, 1], [780, 0, 2, 1, 1], [900, 0, 0, 1, 1], [D, 0, 0, 1, 1]], D,
          (p) => ({ transform: around(100, 226, `rotate(${p[2]}deg)`) }));
        play(r.sweep.current, [[0, 0, 0], [820, 0, 0.9], [1120, 190, 0], [D, 190, 0]], D, (p) => ({ transform: `skewX(-20deg) translateX(${p[1]}px)`, opacity: p[2] }), "ease-out");
        play(r.sparkle.current, [[0, 0, 0], [880, 0, 0], [1000, 1.4, 45], [D, 0, 90]], D, (p) => ({ transform: `translate(64px, 150px) rotate(${p[2]}deg) scale(${p[1]})` }), "ease-out");
        faces([[0, { eyes: "dizzy" }], [220, { eyes: "squeeze" }], [800, { eyes: "happy" }], [1040, { eyes: "open", dx: -2, dy: -2 }]]);
      },
      mint: () => {
        const D = DURATION.mint;
        // A peppermint drops onto the pillow beside her and settles
        play(r.mint.current, [[0, -150, -120, 0], [60, -150, -120, 1], [380, 0, 0, 1], [470, -10, 14, 1], [560, 0, 0, 1], [640, -3, 4, 1], [700, 0, 0, 1], [D, 0, 0, 1]], D,
          (p) => ({ transform: `translate(182px, ${214 + p[1]}px) rotate(${p[2]}deg)`, opacity: p[3] }), "cubic-bezier(0.5, 0, 0.75, 0)");
        play(r.pillow.current, [[0, 1, 1], [380, 1, 1], [440, 1.01, 0.97], [540, 1, 1], [D, 1, 1]], D, pillowFrame);
        play(r.body.current, [[0, 0, 0, 1, 1], [380, 0, 0, 1, 1], [440, 2, 0, 1.02, 0.98], [540, 0, 0, 1, 1], [D, 0, 0, 1, 1]], D, bodyFrame);
        faces([[0, { eyes: "open", dx: 2, dy: -4 }], [300, { eyes: "open", dx: 3, dy: 3 }], [640, { eyes: "happy" }]]);
      },
      ready: () => {
        const D = DURATION.ready;
        // Tips the dome like a hat: the room key hangs underneath
        play(r.top.current, [[0, 0, 0], [220, -42, -14], [400, -48, 10], [560, -46, -6], [720, -44, 0], [900, 0, 0], [960, 2, 0], [1020, 0, 0], [D, 0, 0]], D,
          (p) => ({ transform: `translate(0px, ${p[1]}px) ${around(100, 212, `rotate(${p[2]}deg)`)}` }), "cubic-bezier(0.4, 0, 0.3, 1)");
        play(r.body.current, [[0, 0, 0, 1, 1], [120, 0, 0, 1.06, 0.94], [260, 0, 0, 0.98, 1.02], [380, 0, 0, 1, 1], [900, 0, 0, 1, 1], [960, 3, 0, 1.08, 0.92], [1080, 0, 0, 1, 1], [D, 0, 0, 1, 1]], D, bodyFrame);
        faces([[0, { eyes: "happy" }], [900, { eyes: "squeeze" }], [1000, { eyes: "happy" }]]);
        at(920, ding);
      },
    };

    let round = 0;
    const run = (act: Act) => {
      if (leaving) return;
      if (act === "pillows") {
        // A fresh round: clear the last one, so the mint is gone and the pillow is plumped
        anims.splice(0).forEach((a) => a.cancel());
      }
      setLine(LINES[act][act === "ready" ? 0 : Math.min(round, 1)]);
      acts[act]();
      const next = () => {
        // Once the count is done, finish the chore in hand and hand over the key
        if (act !== "ready" && done) return run("ready");
        if (act === "pillows") return run("polish");
        if (act === "polish") return run("mint");
        if (act === "mint") {
          round += 1;
          return run("pillows");
        }
        leave();
      };
      at(DURATION[act], next);
    };

    if (reduced) setFace({ eyes: "happy" });
    else at(200, () => run("pillows"));

    return () => {
      window.clearInterval(counter);
      timers.forEach(window.clearTimeout);
      anims.forEach((a) => a.cancel());
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", skip);
      html.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  const finish = FINISH.primary;

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label="Getting the site ready"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.floor(n)}
      className="bella-loader fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      <div aria-hidden="true" className="bella-loader-stage absolute inset-0" />

      <div aria-hidden="true" className="absolute inset-x-0 top-0 flex items-center justify-between px-[24px] pt-[24px] md:px-[40px] md:pt-[32px]">
        <span className="font-heading text-h4 md:text-h4-md text-heading">Ashmik Ragesh</span>
        <span className="font-brand text-caption uppercase text-muted">Checking you in</span>
      </div>

      <div className="relative flex flex-col items-center">
        <svg ref={svgRef} viewBox="0 40 200 260" aria-hidden="true" className="host bella-loader-bell overflow-visible w-[240px] h-[312px] md:w-[280px] md:h-[364px]">
          <defs>
            <clipPath id="bl-dome">
              <path d={DOME} />
            </clipPath>
            <clipPath id="bl-pillow">
              <path d={PILLOW} />
            </clipPath>
            <radialGradient id="bl-pillow-shade" cx="50%" cy="20%" r="80%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#fbf7ef" />
              <stop offset="1" stopColor="#e9dfcd" />
            </radialGradient>
          </defs>

          {/* Floor shadow */}
          <ellipse ref={r.floor} cx="100" cy={FLOOR} rx="94" ry="7" fill={MIDNIGHT} opacity="0.12" />

          {/* The pillow: soft white, a stitched seam, a tuft in the middle */}
          <g ref={r.pillow}>
            <path d={PILLOW} fill="url(#bl-pillow-shade)" />
            <g clipPath="url(#bl-pillow)">
              <ellipse cx="100" cy="288" rx="104" ry="22" fill="#d9ccb4" opacity="0.45" />
            </g>
            <path d={STITCH} fill="none" stroke="#d6c8af" strokeWidth="1.2" strokeDasharray="2.4 3" />
            <path d={PILLOW} fill="none" stroke="#d9ccb4" strokeWidth="1" />
            <circle cx="100" cy="256" r="3" fill="#e2d6c0" />
            <path d="M93 252 Q96 256 93 260 M107 252 Q104 256 107 260" stroke="#d9ccb4" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>

          {/* Feathers out of the pillow */}
          <g ref={r.feathers}>
            {[0, 1, 2].map((i) => (
              <g key={i} opacity="0">
                <path d={FEATHER} fill="#fff" stroke="#d6c8af" strokeWidth="0.8" />
                <path d="M0 -6 L0 7" stroke="#d6c8af" strokeWidth="0.6" />
              </g>
            ))}
          </g>

          <g ref={r.body}>
            {/* Where the base sinks into the pillow */}
            <ellipse cx="100" cy="226" rx="62" ry="4" fill={MIDNIGHT} opacity="0.1" />

            {/* Under the dome: the striker post, with the room key hanging off it */}
            <rect x="96" y="200" width="8" height="14" rx="3" fill={GRAPE.shade} />
            <g transform="translate(100 178) rotate(-6)">
              {/* Leather tag on a short cord */}
              <path d="M0 0 Q6 4 10 2" stroke={GRAPE.shade} strokeWidth="1.2" fill="none" />
              <g transform="translate(10 2) rotate(24)">
                <rect x="-5" y="0" width="10" height="16" rx="3" fill={GRAPE.mid} />
                <circle cy="3" r="1.4" fill={RIM} />
                <rect x="-2" y="7" width="4" height="6" rx="1" fill="#fff" opacity="0.5" />
              </g>
              {/* The key: bow, shaft, bit */}
              <circle cy="4" r="5" fill="none" stroke={RIM} strokeWidth="2.6" />
              <rect x="-1.6" y="8" width="3.2" height="20" rx="1.4" fill={RIM} />
              <rect x="1" y="20" width="4.4" height="2.6" rx="0.8" fill={RIM} />
              <rect x="1" y="24.4" width="3.2" height="2.6" rx="0.8" fill={RIM} />
              <rect x="-0.4" y="10" width="1" height="14" rx="0.5" fill="#fff" opacity="0.5" />
            </g>

            <g ref={r.top}>
              <g className="host-plunger">
                <rect x="94" y="126" width="12" height="12" rx="3" fill={GRAPE.mid} />
                <rect x="94" y="126" width="12" height="5" rx="2.5" fill={GRAPE.lit} />
                <rect x="88" y="136" width="24" height="6" rx="3" fill={GRAPE.shade} />
              </g>
              <g className="host-dome">
                <path d={DOME} fill={finish.shade} />
                <g clipPath="url(#bl-dome)">
                  <path d={DOME} fill={finish.lit} transform={`translate(${LIGHT.x} ${LIGHT.y})`} />
                  <rect className="host-sweep" x="20" y="130" width="14" height="100" fill="#fff" opacity="0" transform="skewX(-20)" />
                  <rect ref={r.sweep} x="20" y="130" width="16" height="100" fill="#fff" opacity="0" />
                </g>
                <path d="M66 198 Q64 168 82 152" stroke="#fff" strokeOpacity="0.18" strokeWidth="5" fill="none" strokeLinecap="round" />
                <BellaEyes face={face} />
              </g>
            </g>

            <rect x="38" y="212" width="124" height="14" rx="7" fill={GRAPE.shade} />
            <rect x="38" y="212" width="124" height="6" rx="3" fill={GRAPE.mid} />
            <rect x="48" y="213" width="44" height="2" rx="1" fill="#fff" opacity="0.2" />
          </g>

          {/* The mint, once it's been left */}
          <g ref={r.mint} opacity="0">
            <path d="M-7 0 L-13 -5 L-12 5 Z M7 0 L13 -5 L12 5 Z" fill="#fff" stroke="#d6c8af" strokeWidth="0.8" strokeLinejoin="round" />
            <circle r="7" fill="#fff" stroke="#e2d6c0" strokeWidth="0.8" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <path key={a} d="M0 0 L0 -7 A7 7 0 0 1 3.5 -6.06 Z" fill={GRAPE.mid} transform={`rotate(${a})`} />
            ))}
            <circle r="2" fill="#fff" />
          </g>

          {/* The napkin that polishes her */}
          <g ref={r.cloth} opacity="0">
            <path d="M-16 -12 L14 -14 Q18 -14 18 -10 L16 12 Q16 15 12 15 L-14 14 Q-18 14 -18 10 Z" fill="#fff" stroke="#d6c8af" strokeWidth="1" />
            <path d="M-16 -12 L16 12" stroke="#e2d6c0" strokeWidth="1" />
            <path d="M-14 9 L13 11" stroke={GRAPE.mid} strokeWidth="1.6" opacity="0.7" />
          </g>

          {/* The sparkle after polishing */}
          <path ref={r.sparkle} d={STAR} fill={RIM} transform="translate(64 150) scale(0)" />

          <g className="host-rings" stroke={GRAPE.mid} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M80 128 Q72 120 74 110" />
            <path d="M70 134 Q58 122 62 106" />
            <path d="M120 128 Q128 120 126 110" />
            <path d="M130 134 Q142 122 138 106" />
          </g>
        </svg>

        <Odometer value={n} />

        <p key={line} className="bella-loader-line mt-[8px] h-[26px] font-geist text-body-md text-secondary">
          {line}
        </p>
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/10">
        <div className="h-full origin-left bg-grape transition-transform duration-200 ease-out" style={{ transform: `scaleX(${n / 100})` }} />
      </div>
    </div>
  );
}

/** The count in the display serif on a mechanical odometer: the units wheel turns
 *  continuously with the count, and each wheel to its left only turns while the one
 *  beside it passes from 9 to 0. Wheels fade out at the top and bottom of the window.
 *  Leading zeros fold away, so the number stays centred as it grows. */
function Odometer({ value }: { value: number }) {
  const whole = Math.floor(value);
  const places = [100, 10, 1];
  return (
    <div aria-hidden="true" className="mt-[24px] flex items-start font-heading text-stat md:text-stat-md text-heading">
      {places.map((place) => {
        // Where this wheel stands, 0–10 (10 is the 0 again, after 9)
        let pos: number;
        if (place === 1) pos = value % 10;
        else {
          const below = value % place; // what the wheels to the right show together
          pos = Math.floor(value / place) % 10 + Math.max(0, below - (place - 1));
        }
        const hidden = place > 1 && whole < place && !(place === 100 && value > 99);
        return (
          <span key={place} className={`bella-odo-col relative block h-[48px] md:h-[56px] overflow-hidden transition-[width,opacity] duration-500 ${hidden ? "w-0 opacity-0" : "w-[30px] md:w-[36px] opacity-100"}`}>
            <span className="absolute inset-x-0 top-0 flex flex-col items-center" style={{ transform: `translateY(${-(pos / 11) * 100}%)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((k, i) => (
                <span key={i} className="block h-[48px] md:h-[56px] leading-[48px] md:leading-[56px]">
                  {k}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      <span className="ml-[4px] mt-[4px] font-heading text-h3 md:text-h3-md text-muted">%</span>
    </div>
  );
}

/** Bella's eyes for each moment. No mouth — the face is just the eyes. */
function BellaEyes({ face }: { face: Face }) {
  const ink = FINISH.primary.ink;
  if (face.eyes === "squeeze")
    return (
      <g stroke={ink} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M77 169 L92 177 L77 185" />
        <path d="M123 169 L108 177 L123 185" />
      </g>
    );
  if (face.eyes === "happy")
    return (
      <g stroke={ink} strokeWidth="4.2" strokeLinecap="round" fill="none">
        <path d="M75 180 Q85 168 95 180" />
        <path d="M105 180 Q115 168 125 180" />
      </g>
    );
  if (face.eyes === "dizzy")
    return (
      <g stroke={ink} strokeWidth="2.6" strokeLinecap="round" fill="none">
        {[85, 115].map((cx) => (
          <g key={cx} className="bella-loader-dizzy" style={{ transformOrigin: `${cx}px 176px` }}>
            <path d={`M${cx} 176 m-1.5 0 a1.5 1.5 0 1 1 3 0 a3 3 0 1 1 -6 0 a4.5 4.5 0 1 1 9 0 a6 6 0 1 1 -12 0`} />
          </g>
        ))}
      </g>
    );
  return (
    <g className="host-blink">
      <ellipse cx="85" cy="176" rx="9" ry="11" fill="#fff" />
      <ellipse cx="115" cy="176" rx="9" ry="11" fill="#fff" />
      <g className="bella-loader-pupils" style={{ transform: `translate(${face.dx ?? 0}px, ${face.dy ?? 0}px)` }}>
        <circle cx="87" cy="177" r="5.4" fill={MIDNIGHT} />
        <circle cx="117" cy="177" r="5.4" fill={MIDNIGHT} />
        <circle cx="88.8" cy="174.6" r="1.9" fill="#fff" />
        <circle cx="118.8" cy="174.6" r="1.9" fill="#fff" />
      </g>
    </g>
  );
}
