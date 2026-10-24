"use client";

// ── Host character ────────────────────────────────────────────────────────────
// The front-desk bell who lives in the navbar as the logo.
//
// Drawn flat, in the brand's colours, with just enough form to read as an object:
//   dome      blackcurrant: a shade shape with a lit copy on top, offset up-left and
//             clipped to the dome, leaving a soft shadow crescent on the right; one
//             curved highlight down the left. The champion's bell is cast in gold.
//   plunger   grape, with a lit cap.
//   base      grape, with a lit top edge.
//   ground    a soft shadow beneath.
//   turning   the face follows the cursor while the light slides the other way.
//
// The hands stay tucked behind the bell until they're needed; they come round to
// the front to hold the board, and slip back behind once they're done.
//
// It behaves like a desk bell: `ding` (a counter — bump it to ring) presses the
// plunger, shudders the dome and sends ring lines out from the top.
//
// Moods:
//   idle       eyes open, blinking, smiling, following the cursor.
//   dozing     lids shut, slow breathing, a slump and Z's — the clock is paused
//              because nobody's there.
//   champion   this visitor has out-stayed everyone, ever: the bell turns gold, the
//              eyes squeeze shut happily, and sparkles catch the light.
// On top of any mood:
//   holding    both hands come down in front of the base to hold the timer board;
//              eyes glance down at it. hostLayout() says where the hands end up.
//
// There's no mouth — the face is just the eyes.
//
// Cursor tracking and the arm swing write straight to the DOM on rAF, so neither
// re-renders React. With reduced motion everything holds still.

import { useEffect, useId, useRef, useState } from "react";

export type HostMood = "idle" | "dozing" | "champion";

// The drawing lives in a 200-wide space; this crop frames the bell
const VIEWBOX = { x: 30, y: 118, w: 140, h: 130 };

const SHOULDERS = { left: { x: 60, y: 186 }, right: { x: 140, y: 186 } };
// At rest the hands sit just inside the dome's outline — hidden behind it
const REST = { left: { x: 66, y: 200 }, right: { x: 134, y: 200 } };
// Holding the board, just below the base
const HOLD = { left: { x: 80, y: 262 }, right: { x: 120, y: 262 } };
const SWING_MS = 420;
const DING_MS = 900;

const DOME = "M48 214 Q48 140 100 140 Q152 140 152 214 Z";
const LIGHT = { x: -6, y: -7 }; // where the lit copy of the dome rests

// Midnight — one dark for the dome's shade, the arms and the pupils (and the tooltip)
const MIDNIGHT = "#1e0525";

const FINISH = {
  primary: { lit: "#3e0d4b", shade: MIDNIGHT, ink: "#ffffff" },
  gold: { lit: "#f2c75c", shade: "#c8952e", ink: "#3a2406" },
};
const GRAPE = { lit: "#c22a88", mid: "#9D136A", shade: "#6e0e4b" };

// Bottom edge of the base — where the bell rests on a surface
const BASE_Y = 226;

/** Size of the host at a given rendered height, where its hands hold the board, and where its base
 *  rests (px from top-left). */
export function hostLayout(height: number) {
  const scale = height / VIEWBOX.h;
  const px = (p: { x: number; y: number }) => ({
    x: Math.round((p.x - VIEWBOX.x) * scale),
    y: Math.round((p.y - VIEWBOX.y) * scale),
  });
  return {
    width: Math.round(VIEWBOX.w * scale),
    hands: [px(HOLD.left), px(HOLD.right)] as const,
    base: Math.round((BASE_Y - VIEWBOX.y) * scale),
  };
}

interface Props {
  mood?: HostMood;
  holding?: boolean;
  /** Bump to ring the bell. */
  ding?: number;
  /** Where to look (-1…1 on each axis), overriding the cursor while set. */
  gaze?: { x: number; y: number } | null;
  className?: string;
  style?: React.CSSProperties;
}

// easeOutBack — a small overshoot, so the hands land with a little weight
const settle = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

export default function HostCharacter({ mood = "idle", holding = false, ding = 0, gaze = null, className = "", style }: Props) {
  const uid = useId().replace(/:/g, "");
  const clipId = `${uid}-dome`;

  const svgRef = useRef<SVGSVGElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const litRef = useRef<SVGPathElement>(null);
  const arms = {
    left: { line: useRef<SVGLineElement>(null), hand: useRef<SVGGElement>(null) },
    right: { line: useRef<SVGLineElement>(null), hand: useRef<SVGGElement>(null) },
  };
  // Hands come round to the front while in use, and go back behind when done
  const [armsInFront, setArmsInFront] = useState(holding);

  const state = useRef({ mood, holding, gaze, look: { x: 0, y: 0 }, swing: holding ? 1 : 0 });
  state.current.mood = mood;
  state.current.holding = holding;
  state.current.gaze = gaze;

  // Gaze and light — recomputed whenever the cursor moves or the pose changes
  const applyLook = () => {
    const { mood: m, holding: h, gaze: g, look } = state.current;
    const { x, y } = m === "dozing" ? { x: 0, y: 0 } : (g ?? look);
    const down = h ? 3 : 0; // glance at the board while holding it
    faceRef.current?.setAttribute("transform", `translate(${x * 7} ${y * 4})`);
    pupilsRef.current?.setAttribute("transform", `translate(${x * 2.5} ${y * 2.5 + down})`);
    litRef.current?.setAttribute("transform", `translate(${LIGHT.x - x * 4} ${LIGHT.y - y * 3})`);
  };

  // Arms — a straight line from shoulder to hand, the hand lerped between rest and hold
  const applyArms = (t: number) => {
    (["left", "right"] as const).forEach((side) => {
      const hx = REST[side].x + (HOLD[side].x - REST[side].x) * t;
      const hy = REST[side].y + (HOLD[side].y - REST[side].y) * t;
      arms[side].line.current?.setAttribute("x2", String(hx));
      arms[side].line.current?.setAttribute("y2", String(hy));
      arms[side].hand.current?.setAttribute("transform", `translate(${hx} ${hy})`);
    });
  };

  // Cursor tracking
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const box = svgRef.current?.getBoundingClientRect();
      if (!box) return;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      state.current.look = {
        x: clamp((e.clientX - (box.left + box.width / 2)) / 320),
        y: clamp((e.clientY - (box.top + box.height / 2)) / 240),
      };
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), applyLook()));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(applyLook);

  // Arm swing between tucked away and holding the board
  useEffect(() => {
    const target = holding ? 1 : 0;
    const from = state.current.swing;
    if (holding) setArmsInFront(true);
    if (from === target) {
      applyArms(target);
      if (!holding) setArmsInFront(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.current.swing = target;
      applyArms(target);
      if (!holding) setArmsInFront(false);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / SWING_MS);
      state.current.swing = from + (target - from) * p;
      applyArms(from + (target - from) * settle(p));
      if (p < 1) frame = requestAnimationFrame(step);
      else if (!holding) setArmsInFront(false);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holding]);

  // Keep the arm geometry in place when they swap between behind and in front
  useEffect(() => applyArms(state.current.swing), [armsInFront]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ring — restart the ding animation each time the counter moves
  useEffect(() => {
    const svg = svgRef.current;
    if (!ding || !svg) return;
    svg.classList.remove("is-ding");
    void svg.getBoundingClientRect(); // reflow, so the animation restarts
    svg.classList.add("is-ding");
    const t = window.setTimeout(() => svg.classList.remove("is-ding"), DING_MS);
    return () => window.clearTimeout(t);
  }, [ding]);

  const asleep = mood === "dozing";
  const champion = mood === "champion";
  const finish = champion ? FINISH.gold : FINISH.primary;
  const ink = finish.ink;

  const armLayer = (
    <g>
      {(["left", "right"] as const).map((side) => (
        <g key={side}>
          <line
            ref={arms[side].line}
            x1={SHOULDERS[side].x}
            y1={SHOULDERS[side].y}
            x2={REST[side].x}
            y2={REST[side].y}
            stroke={MIDNIGHT}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <g ref={arms[side].hand} transform={`translate(${REST[side].x} ${REST[side].y})`}>
            <circle r="6.5" fill={GRAPE.mid} />
            <circle cx="-2" cy="-2.4" r="2" fill="#fff" opacity="0.3" />
          </g>
        </g>
      ))}
    </g>
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
      aria-hidden="true"
      style={style}
      className={`host is-${mood} ${holding ? "is-holding" : ""} overflow-visible ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={DOME} />
        </clipPath>
      </defs>

      {/* Shadow beneath */}
      <ellipse cx="100" cy="238" rx="56" ry="6" fill="#32073e" opacity="0.12" />

      <g className="host-tilt">
        {!armsInFront && armLayer}

        <g className="host-breathe">
          {/* Plunger — pressed down on each ding */}
          <g className="host-plunger">
            <rect x="94" y="126" width="12" height="12" rx="3" fill={GRAPE.mid} />
            <rect x="94" y="126" width="12" height="5" rx="2.5" fill={GRAPE.lit} />
            <rect x="88" y="136" width="24" height="6" rx="3" fill={GRAPE.shade} />
          </g>

          {/* Dome — shudders on each ding */}
          <g className="host-dome">
            <path d={DOME} fill={finish.shade} />
            <g clipPath={`url(#${clipId})`}>
              <path ref={litRef} d={DOME} fill={finish.lit} transform={`translate(${LIGHT.x} ${LIGHT.y})`} />
              {/* A glint that sweeps across on each ding */}
              <rect className="host-sweep" x="20" y="130" width="14" height="100" fill="#fff" opacity="0" transform="skewX(-20)" />
            </g>
            {/* One curved highlight down the left, as in a polished dome */}
            <path d="M66 198 Q64 168 82 152" stroke="#fff" strokeOpacity="0.18" strokeWidth="5" fill="none" strokeLinecap="round" />

            {/* Face */}
            <g ref={faceRef}>
              {champion ? (
                <g stroke={ink} strokeWidth="4.2" strokeLinecap="round" fill="none">
                  <path d="M75 180 Q85 168 95 180" />
                  <path d="M105 180 Q115 168 125 180" />
                </g>
              ) : asleep ? (
                <g stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none">
                  <path d="M75 177 Q85 185 95 177" />
                  <path d="M105 177 Q115 185 125 177" />
                </g>
              ) : (
                <g className="host-blink">
                  {/* Whites stay put; pupils and catchlights follow the cursor */}
                  <ellipse cx="85" cy="176" rx="9" ry="11" fill="#fff" />
                  <ellipse cx="115" cy="176" rx="9" ry="11" fill="#fff" />
                  <g ref={pupilsRef}>
                    <circle cx="87" cy="177" r="5.4" fill={MIDNIGHT} />
                    <circle cx="117" cy="177" r="5.4" fill={MIDNIGHT} />
                    <circle cx="88.8" cy="174.6" r="1.9" fill="#fff" />
                    <circle cx="118.8" cy="174.6" r="1.9" fill="#fff" />
                  </g>
                </g>
              )}

            </g>
          </g>
        </g>

        {/* Base — grape, with a lit top edge */}
        <rect x="38" y="212" width="124" height="14" rx="7" fill={GRAPE.shade} />
        <rect x="38" y="212" width="124" height="6" rx="3" fill={GRAPE.mid} />
        <rect x="48" y="213" width="44" height="2" rx="1" fill="#fff" opacity="0.2" />

        {armsInFront && armLayer}
      </g>

      {/* Ring lines — fan out from the top on each ding */}
      <g className="host-rings" stroke={GRAPE.mid} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M80 128 Q72 120 74 110" />
        <path d="M70 134 Q58 122 62 106" />
        <path d="M120 128 Q128 120 126 110" />
        <path d="M130 134 Q142 122 138 106" />
      </g>

      {/* Sparkles catching the light on a gold bell */}
      {champion && (
        <g className="host-sparkles" fill="#f1bf45">
          {[
            [40, 152, 1],
            [162, 148, 0.8],
            [150, 124, 0.6],
            [52, 128, 0.7],
          ].map(([x, y, s], i) => (
            <path
              key={i}
              d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z"
              transform={`translate(${x} ${y}) scale(${s})`}
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          ))}
        </g>
      )}

      {/* Z's while it sleeps — big enough to read at navbar size */}
      {asleep && (
        <g className="host-zz" fill={GRAPE.mid} stroke="#fff" strokeWidth="2.4" paintOrder="stroke" style={{ fontFamily: "var(--font-brand), monospace", fontWeight: 500 }}>
          <text x="140" y="146" fontSize="24">Z</text>
          <text x="156" y="128" fontSize="18">Z</text>
          <text x="167" y="114" fontSize="14">z</text>
        </g>
      )}
    </svg>
  );
}
