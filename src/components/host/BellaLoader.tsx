"use client";

// ── Bella loader ──────────────────────────────────────────────────────────────
// The first thing a visitor sees, once per browser session: Bella on an empty
// vanilla stage, doing tricks while the site loads, over a split-flap counter
// (the same cards as the timer board) and one plain status line.
//
// Bella is drawn here from the same paths and colours as HostCharacter, split into
// two parts so the dome can lift off its base:
//   body   the whole bell: jumps, flips, squashes on take-off and landing.
//   top    plunger + dome + face: lifts off the base like a hat for the hat tip.
//
// Tricks play one after another, each ending with a landing and a ding:
//   backflip   squash, launch, a full turn backwards, land, dizzy eyes, ding.
//   twirl      jump, two turns on the spot (the face hides while Bella faces away).
//   hat tip    the dome lifts off the base, waves left and right, sets back down.
//
// The counter only reaches 100 once the page has loaded and at least MIN_MS has
// passed, so a fast load still sees one full trick. On 100, Bella waits for her next
// landing, rings once, and the stage closes like an iris onto her, revealing the site.
//
// Shown once per session (sessionStorage "bella-loaded"); add ?loader to the URL to
// see it again. An inline script in layout.tsx hides it before paint for repeat
// visits, so there's no flash. With reduced motion Bella stays still, only blinking,
// and the stage fades out instead.
// All sizes are multiples of 2/4px.

import { useEffect, useRef, useState } from "react";
import { FlapDigit } from "@/components/host/TimerBoard";
import { DOME, FINISH, GRAPE, LIGHT, MIDNIGHT } from "@/components/host/HostCharacter";

const SEEN_KEY = "bella-loaded";
const MIN_MS = 2600;
const MAX_MS = 9000; // never hold the visitor longer than this, loaded or not
const IRIS_MS = 820;

type Face = "open" | "up" | "squeeze" | "happy" | "dizzy";
type Trick = "backflip" | "twirl" | "hattip";
const ORDER: Trick[] = ["backflip", "twirl", "hattip"];

const MESSAGES: [number, string][] = [
  [0, "Opening the front desk"],
  [22, "Setting out the case studies"],
  [48, "Turning on the lights"],
  [74, "Getting your room ready"],
  [100, "Welcome in"],
];
const messageFor = (n: number) => MESSAGES.reduce((m, [at, text]) => (n >= at ? text : m), MESSAGES[0][1]);

// [ms, ...values] → a transform about a point, as in HostCharacter
const around = (x: number, y: number, mid: string) => `translate(${x}px, ${y}px) ${mid} translate(${-x}px, ${-y}px)`;
const bodyFrame = (p: number[]) => ({
  transform: `translate(0px, ${p[1]}px) ${around(100, 183, `rotate(${p[2]}deg)`)} ${around(100, 226, `scale(${p[3]}, ${p[4]})`)}`,
});

interface Script {
  duration: number;
  /** When Bella is back on the ground and could stop. */
  landed: number;
  body: number[][];
  shadow: number[][];
  top?: number[][];
  faceOpacity?: number[][];
  faces: [number, Face][];
  dust?: number;
  ding: number;
}

const SCRIPTS: Record<Trick, Script> = {
  backflip: {
    duration: 1700,
    landed: 1120,
    body: [[0, 0, 0, 1, 1], [180, 0, 0, 1.16, 0.82], [300, -30, 0, 0.9, 1.14], [460, -88, -120, 1, 1], [600, -102, -240, 1, 1], [760, -60, -340, 0.96, 1.04], [880, 0, -360, 1.2, 0.8], [1000, -8, -360, 0.96, 1.04], [1120, 0, -360, 1.02, 0.98], [1240, 0, -360, 1, 1], [1700, 0, -360, 1, 1]],
    shadow: [[0, 1, 0.14], [180, 1.12, 0.16], [600, 0.42, 0.04], [880, 1.2, 0.18], [1120, 1, 0.14], [1700, 1, 0.14]],
    faces: [[0, "open"], [100, "squeeze"], [300, "happy"], [860, "squeeze"], [1000, "dizzy"], [1500, "open"]],
    dust: 880,
    ding: 1160,
  },
  twirl: {
    duration: 1900,
    landed: 1420,
    body: [[0, 0, 0, 1, 1], [180, 0, 0, 1.14, 0.84], [300, -24, 0, 0.9, 1.12], [420, -60, 0, 0, 1.04], [540, -84, 0, -1, 1], [660, -92, 0, 0, 1], [780, -84, 0, 1, 1], [880, -66, 0, 0, 1], [980, -40, 0, -1, 1], [1080, -14, 0, 0, 1], [1180, 0, 0, 1.18, 0.82], [1300, -6, 0, 0.96, 1.04], [1420, 0, 0, 1, 1], [1900, 0, 0, 1, 1]],
    shadow: [[0, 1, 0.14], [180, 1.1, 0.16], [660, 0.5, 0.05], [1180, 1.18, 0.18], [1420, 1, 0.14], [1900, 1, 0.14]],
    // The face is only on show while Bella faces the front
    faceOpacity: [[0, 1], [419, 1], [421, 0], [659, 0], [661, 1], [879, 1], [881, 0], [1079, 0], [1081, 1], [1900, 1]],
    faces: [[0, "open"], [100, "squeeze"], [300, "up"], [1160, "squeeze"], [1300, "happy"], [1700, "open"]],
    dust: 1180,
    ding: 1440,
  },
  hattip: {
    duration: 1900,
    landed: 1500,
    body: [[0, 0, 0, 1, 1], [160, 0, 0, 1.08, 0.92], [300, 0, 0, 0.98, 1.02], [420, 0, 0, 1, 1], [1300, 0, 0, 1, 1], [1380, 0, 0, 1.1, 0.9], [1500, 0, 0, 0.98, 1.02], [1620, 0, 0, 1, 1], [1900, 0, 0, 1, 1]],
    shadow: [[0, 1, 0.14], [1900, 1, 0.14]],
    // [ms, lift, tilt] about the base's top edge
    top: [[0, 0, 0], [240, 0, 0], [440, -46, -16], [620, -52, 12], [780, -48, -10], [940, -50, 8], [1100, -46, 0], [1300, 0, 0], [1380, 2, 0], [1500, 0, 0], [1900, 0, 0]],
    faces: [[0, "open"], [260, "happy"], [1300, "squeeze"], [1440, "open"]],
    ding: 1520,
  },
};

export default function BellaLoader() {
  const [gone, setGone] = useState(false);
  const [n, setN] = useState(0);
  const [face, setFace] = useState<Face>("open");

  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const topRef = useRef<SVGGElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const dustRef = useRef<SVGGElement>(null);

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

    // ── Readiness ───────────────────────────────────────────────────────────
    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    let fontsReady = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => (fontsReady = true));

    // ── Counter ─────────────────────────────────────────────────────────────
    let shown = 0;
    let lastPaint = 0;
    let done = false;
    // On a timer rather than rAF, so the count keeps going in a tab that isn't painting
    const tick = () => {
      const now = performance.now();
      const t = now - start;
      const ready = (loaded && fontsReady) || t > MAX_MS;
      // Time gate eases out, so the count rushes early and slows into 100
      const timeCap = 100 * (1 - Math.pow(1 - Math.min(1, t / MIN_MS), 2.2));
      const target = Math.min(timeCap, ready ? 100 : 92);
      shown += (target - shown) * 0.12;
      if (target - shown < 0.4) shown = target;
      const value = Math.floor(shown);
      if (now - lastPaint > 64 || value === 100) {
        lastPaint = now;
        setN(value);
      }
      if (value >= 100) {
        done = true;
        window.clearInterval(counter);
        if (reduced) finish();
      }
    };
    const counter = window.setInterval(tick, 32);

    // ── Leaving: ring once, then close the stage onto Bella ─────────────────
    let leaving = false;
    const finish = () => {
      if (leaving) return;
      leaving = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      const root = rootRef.current;
      let restored = false;
      const restore = () => {
        if (restored) return;
        restored = true;
        html.style.overflow = prevOverflow;
        setGone(true);
      };
      if (!root || reduced) {
        root?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-out", fill: "forwards" }).finished.then(restore, restore);
        at(400, restore); // in case the fade never gets a frame
        return;
      }
      setFace("happy");
      ding();
      const box = svgRef.current?.getBoundingClientRect();
      const cx = box ? Math.round(box.left + box.width / 2) : window.innerWidth / 2;
      const cy = box ? Math.round(box.top + box.height * 0.62) : window.innerHeight / 2;
      const r = Math.ceil(Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)));
      at(520, () => {
        const iris = root.animate(
          [{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }, { clipPath: `circle(${r * 0.18}px at ${cx}px ${cy}px)`, offset: 0.7 }, { clipPath: `circle(0px at ${cx}px ${cy}px)` }],
          { duration: IRIS_MS, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" },
        );
        iris.finished.then(restore, restore);
        at(IRIS_MS + 200, restore); // in case the tab never paints the iris
      });
    };

    // Skip with a click or a key once the page has loaded
    const skip = () => loaded && (done = true);
    window.addEventListener("keydown", skip);
    rootRef.current?.addEventListener("pointerdown", skip);

    // ── Tricks ──────────────────────────────────────────────────────────────
    const ding = () => {
      const svg = svgRef.current;
      if (!svg) return;
      svg.classList.remove("is-ding");
      void svg.getBoundingClientRect();
      svg.classList.add("is-ding");
      at(900, () => svg.classList.remove("is-ding"));
    };

    const play = (el: Element | null, pts: number[][], D: number, frameOf: (p: number[]) => Keyframe, easing = "ease-in-out") => {
      if (!el?.animate) return;
      anims.push(el.animate(pts.map((p) => ({ ...frameOf(p), offset: p[0] / D, easing })), { duration: D, fill: "both" }));
    };

    const puff = () => {
      const dust = dustRef.current;
      if (!dust) return;
      Array.from(dust.children).forEach((c, i) => {
        const side = i % 2 ? 1 : -1;
        const far = i < 2 ? 1 : 0.6;
        anims.push(
          c.animate(
            [
              { transform: "translate(0px, 0px) scale(0.4)", opacity: 0 },
              { transform: `translate(${side * 14 * far}px, -6px) scale(1)`, opacity: 1, offset: 0.3 },
              { transform: `translate(${side * 30 * far}px, -14px) scale(1.4)`, opacity: 0 },
            ],
            { duration: 560, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)", fill: "both" },
          ),
        );
      });
    };

    let round = 0;
    const perform = () => {
      if (leaving) return;
      const s = SCRIPTS[ORDER[round % ORDER.length]];
      round += 1;
      const D = s.duration;
      play(bodyRef.current, s.body, D, bodyFrame);
      play(shadowRef.current, s.shadow, D, (p) => ({ transform: around(100, 238, `scale(${p[1]}, 1)`), opacity: p[2] }));
      if (s.top) play(topRef.current, s.top, D, (p) => ({ transform: `translate(0px, ${p[1]}px) ${around(100, 212, `rotate(${p[2]}deg)`)}` }), "cubic-bezier(0.4, 0, 0.3, 1)");
      if (s.faceOpacity) play(faceRef.current, s.faceOpacity, D, (p) => ({ opacity: p[1] }), "linear");
      s.faces.forEach(([ms, f]) => at(ms, () => !leaving && setFace(f)));
      if (s.dust) at(s.dust, puff);
      // Back on the ground: leave now if the count is done, else ring and go again
      at(s.landed, () => {
        if (done) return finish();
        at(s.ding - s.landed, ding);
        at(D - s.landed, () => {
          if (done) finish();
          else perform();
        });
      });
    };

    if (!reduced) at(240, perform);

    return () => {
      window.clearInterval(counter);
      timers.forEach(window.clearTimeout);
      anims.forEach((a) => a.cancel());
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", skip);
      html.style.overflow = prevOverflow;
    };
  }, []);

  if (gone) return null;

  const digits = String(n).padStart(3, "0").split("");
  const message = messageFor(n);
  const finish = FINISH.primary;

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label="Loading the site"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={n}
      className="bella-loader fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Stage: warm paper, lit from above, a faint grain over it */}
      <div aria-hidden="true" className="bella-loader-stage absolute inset-0" />

      {/* Name, top left; the tagline, top right */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 flex items-center justify-between px-[24px] pt-[24px] md:px-[40px] md:pt-[32px]">
        <span className="font-heading text-h4 md:text-h4-md text-heading">Ashmik Ragesh</span>
        <span className="hidden sm:block font-brand text-caption uppercase text-muted">Creator that designs for creators</span>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Bella */}
        <svg ref={svgRef} viewBox="0 20 200 236" width="240" height="284" aria-hidden="true" className="host bella-loader-bell overflow-visible">
          <defs>
            <clipPath id="bl-dome">
              <path d={DOME} />
            </clipPath>
          </defs>

          {/* Desk — a pool of light where Bella lands */}
          <ellipse cx="100" cy="240" rx="92" ry="10" fill="#fff" opacity="0.7" />
          <ellipse ref={shadowRef} cx="100" cy="238" rx="56" ry="6" fill={MIDNIGHT} opacity="0.14" />

          {/* Dust kicked up on landing */}
          <g ref={dustRef} fill="#32073e" opacity="0.14">
            <circle cx="40" cy="232" r="6" opacity="0" />
            <circle cx="160" cy="232" r="6" opacity="0" />
            <circle cx="52" cy="234" r="4" opacity="0" />
            <circle cx="148" cy="234" r="4" opacity="0" />
          </g>

          <g ref={bodyRef}>
            {/* The striker post, only seen when the dome lifts off */}
            <rect x="95" y="190" width="10" height="24" rx="4" fill={GRAPE.shade} />
            <circle cx="100" cy="190" r="6" fill={GRAPE.mid} />

            <g ref={topRef}>
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
                </g>
                <path d="M66 198 Q64 168 82 152" stroke="#fff" strokeOpacity="0.18" strokeWidth="5" fill="none" strokeLinecap="round" />
                <g ref={faceRef}>
                  <BellaFace face={face} />
                </g>
              </g>
            </g>

            {/* Base */}
            <rect x="38" y="212" width="124" height="14" rx="7" fill={GRAPE.shade} />
            <rect x="38" y="212" width="124" height="6" rx="3" fill={GRAPE.mid} />
            <rect x="48" y="213" width="44" height="2" rx="1" fill="#fff" opacity="0.2" />
          </g>

          {/* Ring lines on each ding */}
          <g className="host-rings" stroke={GRAPE.mid} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M80 128 Q72 120 74 110" />
            <path d="M70 134 Q58 122 62 106" />
            <path d="M120 128 Q128 120 126 110" />
            <path d="M130 134 Q142 122 138 106" />
          </g>
        </svg>

        {/* The count, on split-flap cards in a dark window */}
        <div className="mt-[16px] flex items-end gap-[4px] rounded-lg bg-[#1c1a1d] p-[6px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.8),0_16px_32px_rgba(30,5,37,0.16)]">
          {digits.map((d, i) => (
            <FlapDigit key={i} value={d} hero />
          ))}
          <span aria-hidden="true" className="self-end pb-[6px] pl-[2px] pr-[4px] font-brand text-body text-[#e9dfc8]/60">
            %
          </span>
        </div>

        {/* What's happening, in plain words */}
        <p key={message} className="bella-loader-line mt-[20px] h-[22px] font-geist text-body md:text-body-md text-secondary">
          {message}
        </p>
      </div>

      {/* A hairline of progress along the foot of the stage */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/10">
        <div className="h-full origin-left bg-grape transition-transform duration-100 ease-out" style={{ transform: `scaleX(${n / 100})` }} />
      </div>
    </div>
  );
}

/** Bella's eyes for each moment of a trick. No mouth — the face is just the eyes. */
function BellaFace({ face }: { face: Face }) {
  const ink = FINISH.primary.ink;
  if (face === "squeeze")
    return (
      <g stroke={ink} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M77 169 L92 177 L77 185" />
        <path d="M123 169 L108 177 L123 185" />
      </g>
    );
  if (face === "happy")
    return (
      <g stroke={ink} strokeWidth="4.2" strokeLinecap="round" fill="none">
        <path d="M75 180 Q85 168 95 180" />
        <path d="M105 180 Q115 168 125 180" />
      </g>
    );
  if (face === "dizzy")
    return (
      <g stroke={ink} strokeWidth="2.6" strokeLinecap="round" fill="none">
        {[85, 115].map((cx) => (
          <g key={cx} className="bella-loader-dizzy" style={{ transformOrigin: `${cx}px 176px` }}>
            <path d={`M${cx} 176 m-1.5 0 a1.5 1.5 0 1 1 3 0 a3 3 0 1 1 -6 0 a4.5 4.5 0 1 1 9 0 a6 6 0 1 1 -12 0`} />
          </g>
        ))}
      </g>
    );
  const dy = face === "up" ? -4 : 0;
  return (
    <g className="host-blink">
      <ellipse cx="85" cy="176" rx="9" ry="11" fill="#fff" />
      <ellipse cx="115" cy="176" rx="9" ry="11" fill="#fff" />
      <g transform={`translate(0 ${dy})`}>
        <circle cx="87" cy="177" r="5.4" fill={MIDNIGHT} />
        <circle cx="117" cy="177" r="5.4" fill={MIDNIGHT} />
        <circle cx="88.8" cy="174.6" r="1.9" fill="#fff" />
        <circle cx="118.8" cy="174.6" r="1.9" fill="#fff" />
      </g>
    </g>
  );
}
