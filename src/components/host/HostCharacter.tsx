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
//   glasses    "reading": round gold rims while a case study is read.
//              "video": 3D glasses, one grape lens and one gold, while a video the
//              visitor started plays; the video's light flickers on the lenses.
//              They slide down onto the face, and slip when Bella dozes.
//   raised     both arms up from behind the dome, holding a card overhead.
//   expression "surprised": taller eyes, small pupils (a stamp found).
//   celebrate  a counter; each bump plays the ~3.4s celebration for a goal: a squash,
//              a jump that swings like a rung bell, the dome lighting up grape with a
//              gold rim, the gold bow tie popping on, star eyes, then a hop and back
//              to normal. Sparks burst twice. Nothing stays afterwards.
//
// There's no mouth — the face is just the eyes.
//
// Cursor tracking and the arm swing write straight to the DOM on rAF, so neither
// re-renders React. With reduced motion everything holds still.

import { useEffect, useId, useRef, useState } from "react";

export type HostMood = "idle" | "dozing" | "champion";
export type HostGlasses = "reading" | "video";

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
const RIM = "#f2c75c"; // gold rims
const STAR = "M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z";
const SVG_NS = "http://www.w3.org/2000/svg";
const IVORY = "#f8f1e3"; // the 3D glasses' frame

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
  glasses?: HostGlasses | null;
  /** Both arms up over the dome, holding something above Bella's head (the footer's email card). */
  raised?: boolean;
  expression?: "surprised" | null;
  /** Bump to play the goal celebration. */
  celebrate?: number;
  className?: string;
  style?: React.CSSProperties;
}

// easeOutBack — a small overshoot, so the hands land with a little weight
const settle = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

export default function HostCharacter({ mood = "idle", holding = false, ding = 0, gaze = null, glasses = null, raised = false, expression = null, celebrate = 0, className = "", style }: Props) {
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

  // ── Celebration ─────────────────────────────────────────────────────────────
  // A 3.4s timeline on Web Animations: [ms, ...values] keyframes, eyes switched by timers.
  const jumpRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const glowRef = useRef<SVGGElement>(null);
  const flashRef = useRef<SVGRectElement>(null);
  const rimRef = useRef<SVGPathElement>(null);
  const bowRef = useRef<SVGGElement>(null);
  const sparksRef = useRef<SVGGElement>(null);
  const [cheer, setCheer] = useState<"squeeze" | "happy" | "stars" | null>(null);

  useEffect(() => {
    if (!celebrate) return;
    const sparks = sparksRef.current;
    const D = 3400;
    const anims: Animation[] = [];
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const play = (el: Element | null, pts: number[][], frame: (p: number[]) => Keyframe, easing = "ease-in-out") => {
      if (!el?.animate) return;
      anims.push(el.animate(pts.map((p) => ({ ...frame(p), offset: p[0] / D, easing })), { duration: D, fill: "both" }));
    };
    const around = (x: number, y: number, mid: string) => `translate(${x}px, ${y}px) ${mid} translate(${-x}px, ${-y}px)`;
    const glow = [[0, 0], [380, 0], [520, 1], [2900, 1], [3300, 0], [3400, 0]];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Fade into the pose and out again, without the jump
      const fade = [[0, 0], [300, 1], [2800, 1], [3100, 0], [3400, 0]];
      [glowRef.current, rimRef.current, bowRef.current].forEach((el) => play(el, fade, (p) => ({ opacity: p[1] })));
      at(300, () => setCheer("stars"));
      at(3100, () => setCheer(null));
    } else {
      // Squash, jump, swing in the air like a rung bell, land, settle; one hop to finish
      const body = [[0, 0, 1, 1, 0], [240, 0, 1.14, 0.82, 0], [380, -34, 0.88, 1.16, 0], [540, -52, 1.02, 0.98, -10], [640, -50, 1, 1, 10], [740, -32, 1, 1, -6],
        [860, -4, 0.96, 1.06, 0], [900, 0, 1.16, 0.84, 0], [1020, -8, 0.96, 1.05, 0], [1140, 0, 1.03, 0.97, 0], [1260, 0, 1, 1, 0], [2900, 0, 1, 1, 0],
        [3020, 0, 1.08, 0.92, 0], [3160, -12, 0.96, 1.05, 0], [3300, 0, 1.04, 0.96, 0], [3400, 0, 1, 1, 0]];
      play(jumpRef.current, body, (p) => ({ transform: around(100, 226, `translate(0px, ${p[1]}px) rotate(${p[4]}deg) scale(${p[2]}, ${p[3]})`) }));
      play(shadowRef.current, [[0, 1, 0.12], [240, 1.12, 0.14], [540, 0.6, 0.05], [900, 1.16, 0.14], [1140, 1, 0.12], [3160, 0.8, 0.08], [3300, 1.06, 0.13], [3400, 1, 0.12]],
        (p) => ({ transform: around(100, 238, `scale(${p[1]}, 1)`), opacity: p[2] }));
      play(glowRef.current, glow, (p) => ({ opacity: p[1] }));
      play(rimRef.current, glow, (p) => ({ opacity: p[1] }));
      play(flashRef.current, [[0, 0], [380, 0], [440, 0.85], [620, 0], [3400, 0]], (p) => ({ opacity: p[1] }));
      play(bowRef.current, [[0, 0, -30, 0], [1000, 0, -30, 1], [1180, 1.35, 10, 1], [1300, 1, 0, 1], [1460, 1, -8, 1], [1600, 1, 5, 1], [1720, 1, 0, 1], [2980, 1, 0, 1], [3160, 1.15, -8, 1], [3320, 0, 20, 1], [3400, 0, 20, 0]],
        (p) => ({ transform: around(100, 211, `rotate(${p[2]}deg) scale(${p[1]})`), opacity: p[3] }), "cubic-bezier(0.3, 0.8, 0.4, 1)");
      // Two small bursts of sparks: as the dome lights, and as the tie pops on
      const burst = (cx: number, cy: number, n: number, delay: number, d0: number, d1: number, fan: number) => {
        if (!sparks) return;
        const colours = [RIM, "#e0a93a", GRAPE.lit, "#ec6cb3"];
        for (let j = 0; j < n; j++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * fan, d = d0 + Math.random() * (d1 - d0);
          const ex = cx + Math.cos(a) * d, ey = cy + Math.sin(a) * d, rot = Math.round(Math.random() * 90);
          const isStar = j % 3 === 0, sc = isStar ? 0.6 + Math.random() * 0.4 : 1;
          const el = document.createElementNS(SVG_NS, isStar ? "path" : "circle");
          if (isStar) el.setAttribute("d", STAR);
          else el.setAttribute("r", (1.4 + Math.random() * 1.8).toFixed(1));
          el.setAttribute("fill", colours[j % colours.length]);
          sparks.appendChild(el);
          const anim = el.animate(
            [
              { transform: `translate(${cx}px, ${cy}px) rotate(0deg) scale(0.2)`, opacity: 0 },
              { transform: `translate(${cx + (ex - cx) * 0.6}px, ${cy + (ey - cy) * 0.6}px) rotate(${rot / 2}deg) scale(${sc * 1.15})`, opacity: 1, offset: 0.25 },
              { transform: `translate(${ex}px, ${ey}px) rotate(${rot}deg) scale(${sc})`, opacity: 0.9, offset: 0.7 },
              { transform: `translate(${ex}px, ${ey + 12}px) rotate(${rot}deg) scale(0.3)`, opacity: 0 },
            ],
            { duration: 800 + Math.random() * 400, delay: delay + Math.random() * 80, easing: "cubic-bezier(0.12, 0.8, 0.3, 1)", fill: "both" },
          );
          anim.onfinish = () => el.remove();
          anims.push(anim);
        }
      };
      burst(100, 110, 10, 400, 40, 80, Math.PI * 1.2);
      burst(100, 208, 12, 1160, 34, 72, Math.PI * 1.5);
      at(120, () => setCheer("squeeze"));
      at(420, () => setCheer("happy"));
      at(1300, () => setCheer("stars"));
      at(2900, () => setCheer("happy"));
      at(3400, () => setCheer(null));
    }
    return () => {
      timers.forEach(window.clearTimeout);
      anims.forEach((a) => a.cancel());
      sparks?.replaceChildren();
      setCheer(null);
    };
  }, [celebrate]);

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
        <radialGradient id={`${uid}-glow`} cx="46%" cy="38%" r="72%">
          <stop offset="0" stopColor="#f08cc4" />
          <stop offset="0.45" stopColor={GRAPE.lit} />
          <stop offset="1" stopColor={GRAPE.mid} />
        </radialGradient>
      </defs>

      {/* Shadow beneath */}
      <ellipse ref={shadowRef} cx="100" cy="238" rx="56" ry="6" fill="#32073e" opacity="0.12" />

      <g ref={jumpRef}>
      <g className="host-tilt">
        {!armsInFront && armLayer}

        {/* Arms up from behind the dome, hands at the bottom corners of a card held overhead */}
        {raised && (
          <g className="host-raise">
            {[
              [62, 178, 74, 106],
              [138, 178, 126, 106],
            ].map(([x1, y1, x2, y2]) => (
              <g key={x1}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MIDNIGHT} strokeWidth="8" strokeLinecap="round" />
                <g transform={`translate(${x2} ${y2})`}>
                  <circle r="6.5" fill={GRAPE.mid} />
                  <circle cx="-2" cy="-2.4" r="2" fill="#fff" opacity="0.3" />
                </g>
              </g>
            ))}
          </g>
        )}

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
              {/* Celebrating: the dome lights up grape from inside, after a white flash */}
              <g ref={glowRef} opacity="0">
                <path d={DOME} fill={GRAPE.shade} />
                <path d={DOME} fill={`url(#${uid}-glow)`} transform={`translate(${LIGHT.x} ${LIGHT.y})`} />
              </g>
              <rect ref={flashRef} x="40" y="120" width="120" height="104" fill="#fff" opacity="0" />
            </g>
            {/* One curved highlight down the left, as in a polished dome */}
            <path d="M66 198 Q64 168 82 152" stroke="#fff" strokeOpacity="0.18" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Celebrating: a gold rim round the dome */}
            <path ref={rimRef} d="M48 214 Q48 140 100 140 Q152 140 152 214" stroke={RIM} strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0" />

            {/* Face */}
            <g ref={faceRef}>
              {cheer === "squeeze" ? (
                <g stroke={ink} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M77 169 L92 177 L77 185" />
                  <path d="M123 169 L108 177 L123 185" />
                </g>
              ) : cheer === "happy" ? (
                <g stroke={ink} strokeWidth="4.2" strokeLinecap="round" fill="none">
                  <path d="M75 180 Q85 168 95 180" />
                  <path d="M105 180 Q115 168 125 180" />
                </g>
              ) : cheer === "stars" ? (
                <g>
                  <ellipse cx="85" cy="176" rx="9.4" ry="11.4" fill="#fff" />
                  <ellipse cx="115" cy="176" rx="9.4" ry="11.4" fill="#fff" />
                  <circle cx="87" cy="177" r="5.8" fill={MIDNIGHT} />
                  <circle cx="117" cy="177" r="5.8" fill={MIDNIGHT} />
                  <path d={STAR} fill="#fff" transform="translate(88.4 175) scale(0.5)" />
                  <path d={STAR} fill="#fff" transform="translate(118.4 175) scale(0.5)" />
                </g>
              ) : champion ? (
                <g stroke={ink} strokeWidth="4.2" strokeLinecap="round" fill="none">
                  <path d="M75 180 Q85 168 95 180" />
                  <path d="M105 180 Q115 168 125 180" />
                </g>
              ) : asleep ? (
                <g stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none">
                  <path d="M75 177 Q85 185 95 177" />
                  <path d="M105 177 Q115 185 125 177" />
                </g>
              ) : expression === "surprised" ? (
                <g>
                  {/* Taller eyes, small pupils */}
                  <ellipse cx="85" cy="175" rx="10" ry="13" fill="#fff" />
                  <ellipse cx="115" cy="175" rx="10" ry="13" fill="#fff" />
                  <g ref={pupilsRef}>
                    <circle cx="85" cy="175" r="3.6" fill={MIDNIGHT} />
                    <circle cx="115" cy="175" r="3.6" fill={MIDNIGHT} />
                    <circle cx="86.2" cy="173.6" r="1.3" fill="#fff" />
                    <circle cx="116.2" cy="173.6" r="1.3" fill="#fff" />
                  </g>
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

              {glasses === "reading" && (
                <g key="reading" className="host-glasses">
                  <path d="M71.5 175 L55 170 M128.5 175 L145 170" stroke={RIM} strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="85" cy="177" r="13.5" fill="#fff" fillOpacity="0.1" stroke={RIM} strokeWidth="2.6" />
                  <circle cx="115" cy="177" r="13.5" fill="#fff" fillOpacity="0.1" stroke={RIM} strokeWidth="2.6" />
                  <path d="M98.5 175.5 Q100 172 101.5 175.5" stroke={RIM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <path d="M77 171 l4 -4 M107 171 l4 -4" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
              {glasses === "video" && (
                <g key="video" className="host-glasses">
                  <path d="M64 171 L55 168 M136 171 L145 168" stroke={IVORY} strokeWidth="3" strokeLinecap="round" />
                  <rect x="63" y="162" width="74" height="30" rx="9" fill={IVORY} />
                  <rect x="67" y="166" width="29" height="21" rx="6" fill={GRAPE.lit} />
                  <rect x="104" y="166" width="29" height="21" rx="6" fill={RIM} />
                  <circle cx="82" cy="177" r="4.6" fill={MIDNIGHT} opacity="0.55" />
                  <circle cx="118" cy="177" r="4.6" fill={MIDNIGHT} opacity="0.55" />
                  {/* The video's light on the lenses */}
                  <g className="host-flick" fill="#fff">
                    <rect x="67" y="166" width="29" height="21" rx="6" />
                    <rect x="104" y="166" width="29" height="21" rx="6" />
                  </g>
                  <path d="M93 192.5 Q100 183 107 192.5 Z" fill={finish.lit} />
                  <path d="M72 172 l4 -4 M109 172 l4 -4" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
            </g>
          </g>
        </g>

        {/* Base — grape, with a lit top edge */}
        <rect x="38" y="212" width="124" height="14" rx="7" fill={GRAPE.shade} />
        <rect x="38" y="212" width="124" height="6" rx="3" fill={GRAPE.mid} />
        <rect x="48" y="213" width="44" height="2" rx="1" fill="#fff" opacity="0.2" />

        {/* Celebrating: the gold bow tie */}
        <g ref={bowRef} opacity="0">
          <path d="M100 211 L85 203 Q81 211 85 219 Z" fill={RIM} />
          <path d="M100 211 L115 203 Q119 211 115 219 Z" fill={RIM} />
          <path d="M100 211 L85 219 Q83.4 215 83.6 211 Z" fill="#c8952e" opacity="0.6" />
          <path d="M100 211 L115 219 Q116.6 215 116.4 211 Z" fill="#c8952e" opacity="0.6" />
          <rect x="95.5" y="206.5" width="9" height="9" rx="2.6" fill="#c8952e" />
          <rect x="97" y="207.8" width="4" height="2" rx="1" fill="#fff" opacity="0.55" />
        </g>

        {armsInFront && armLayer}

      </g>
      </g>

      {/* Celebrating: sparks burst from the dome and the bow tie */}
      <g ref={sparksRef} />

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
