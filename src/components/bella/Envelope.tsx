"use client";

// ── The envelope the guest card arrives in ────────────────────────────────────
// A cream envelope seen from the back, drawn in SVG with a paper grain: two side flaps,
// a bottom flap folded up over them with soft fold shadows, and the top flap down over
// everything, held by a wax seal pressed with Bella. Inside, a blackcurrant liner with
// small gold bells. "From the front desk" is printed on the bottom flap, and the guest
// number is written by hand.
//
// The card waits inside, lower down and a little smaller. Breaking the seal plays one
// choreographed sequence (~2.6s):
//   0.0s   the seal gives under the press, then cracks in two; the halves tumble away
//   0.2s   the flap swings up and over on its fold, showing the liner, and passes
//          behind the card once it's past upright
//   0.8s   the card slides up out of the pocket, overshooting a little
//   1.5s   the envelope drops away and fades
//   1.9s   the card settles into place with a small overshoot
// The card never jumps: it ends exactly where the page keeps it afterwards.
// On arrival the envelope rises in with a slight turn; the seal breathes to invite a
// click. With reduced motion the envelope simply opens.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ringBell } from "@/components/host/bellSound";

const BELL_PATH =
  "M48 214 Q48 140 100 140 Q152 140 152 214 Z M76 176 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M106 176 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M94 124 h12 v14 h-12 Z M38 212 h124 v14 h-124 Z";

// The seal's outline: a circle pushed out of round, as poured wax is
function sealBlob() {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const r = 54 + 2.6 * Math.sin(a * 5 + 0.6) + 1.8 * Math.sin(a * 9 + 2.1) + 1.2 * Math.sin(a * 14);
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)} ${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}
const BLOB = sealBlob();
// Where it cracks: a jagged line down the middle
const CRACK_LEFT = "M-4 -4 L62 -4 L56 22 L66 40 L54 62 L64 82 L56 104 L60 124 L-4 124 Z";
const CRACK_RIGHT = "M62 -4 L124 -4 L124 124 L60 124 L56 104 L64 82 L54 62 L66 40 L56 22 Z";

function WaxSeal({ id, half }: { id: string; half?: "left" | "right" }) {
  return (
    <svg viewBox="-6 -6 132 132" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}w`} cx="38%" cy="32%" r="78%">
          <stop offset="0" stopColor="#d23b95" />
          <stop offset="0.45" stopColor="#a3156f" />
          <stop offset="1" stopColor="#5e0a3e" />
        </radialGradient>
        <radialGradient id={`${id}p`} cx="50%" cy="50%" r="50%">
          <stop offset="0.7" stopColor="#8d1160" />
          <stop offset="1" stopColor="#6b0c48" />
        </radialGradient>
        {half && (
          <clipPath id={`${id}c`}>
            <path d={half === "left" ? CRACK_LEFT : CRACK_RIGHT} />
          </clipPath>
        )}
      </defs>
      <g clipPath={half ? `url(#${id}c)` : undefined}>
        {/* Poured wax, with a darker spread at the edge */}
        <path d={BLOB} fill={`url(#${id}w)`} />
        <path d={BLOB} fill="none" stroke="#4a0731" strokeOpacity="0.35" strokeWidth="1.5" />
        {/* The pressed face: a dished disc inside a raised rim */}
        <circle cx="60" cy="60" r="40" fill={`url(#${id}p)`} />
        <circle cx="60" cy="60" r="40" fill="none" stroke="#4a0731" strokeOpacity="0.55" strokeWidth="2.5" transform="translate(0.8 1.2)" />
        <circle cx="60" cy="60" r="40.5" fill="none" stroke="#f08cc4" strokeOpacity="0.45" strokeWidth="1.5" transform="translate(-0.6 -0.8)" />
        {/* Bella pressed into the wax: a shadow along the top edges, light along the bottom */}
        <g transform="translate(60 60) scale(0.36) translate(-100 -176)">
          <path d={BELL_PATH} fillRule="evenodd" fill="#3d0627" opacity="0.6" transform="translate(-2.4 -3)" />
          <path d={BELL_PATH} fillRule="evenodd" fill="#f08cc4" opacity="0.5" transform="translate(2.4 3)" />
          <path d={BELL_PATH} fillRule="evenodd" fill="#8d1160" />
        </g>
        {/* A glossy catch of light */}
        <ellipse cx="38" cy="30" rx="16" ry="8" fill="#fff" opacity="0.28" transform="rotate(-32 38 30)" />
        <ellipse cx="86" cy="94" rx="10" ry="4" fill="#fff" opacity="0.12" transform="rotate(-32 86 94)" />
      </g>
    </svg>
  );
}

// Paper grain: speckles of the paper's own fibres, only inside the shape they're on
function Grain({ id }: { id: string }) {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.26  0 0 0 0 0.18  0 0 0 0.16 0" result="g" />
      <feComposite in="g" in2="SourceGraphic" operator="in" result="gi" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="gi" />
      </feMerge>
    </filter>
  );
}

// The liner: blackcurrant with a scatter of small gold bells
function Liner({ id }: { id: string }) {
  return (
    <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
      <rect width="44" height="44" fill="#3e0d4b" />
      <g fill="#c8952e" opacity="0.55">
        <path d="M6 16 Q6 8 12 8 Q18 8 18 16 Z M5 16.5 h14 v2 h-14 Z M11 5.5 h2 v3 h-2 Z" />
        <path d="M28 38 Q28 30 34 30 Q40 30 40 38 Z M27 38.5 h14 v2 h-14 Z M33 27.5 h2 v3 h-2 Z" />
      </g>
      <circle cx="33" cy="10" r="1.2" fill="#c8952e" opacity="0.45" />
      <circle cx="10" cy="33" r="1.2" fill="#c8952e" opacity="0.45" />
    </pattern>
  );
}

export default function Envelope({
  sealed,
  guestNo,
  onOpened,
  children,
}: {
  sealed: boolean;
  guestNo: string;
  onOpened: () => void;
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">(sealed ? "sealed" : "open");
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const flapOut = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLButtonElement>(null);
  const halves = useRef<HTMLDivElement>(null);
  const id = "env";

  useEffect(() => setPhase(sealed ? "sealed" : "open"), [sealed]);

  const open = () => {
    if (phase !== "sealed") return;
    setPhase("opening");
    onOpened();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !card.current?.animate) {
      setPhase("open");
      return;
    }
    ringBell();
    const D = 2600;
    const anims: Animation[] = [];
    const play = (el: Element | null, frames: Keyframe[], opts: KeyframeAnimationOptions = {}) => {
      if (el) anims.push(el.animate(frames, { duration: D, fill: "both", ...opts }));
    };
    const at = (ms: number) => ms / D;
    const BASE = "translate(-50%, 30%)";
    const FLAP = (deg: number, y = "30%") => `perspective(1400px) translate(-50%, ${y}) rotateX(${deg}deg)`;

    // The seal gives, then the halves tumble apart
    play(seal.current, [
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(0.9)", opacity: 1, offset: at(160) },
      { transform: "translate(-50%, -50%) scale(0.96)", opacity: 0, offset: at(200) },
      { transform: "translate(-50%, -50%) scale(0.96)", opacity: 0 },
    ]);
    const halfEls = halves.current?.children ?? [];
    [-1, 1].forEach((side, i) =>
      play(halfEls[i] ?? null, [
        { transform: "translate(0px, 0px) rotate(0deg)", opacity: 0 },
        { transform: "translate(0px, 0px) rotate(0deg)", opacity: 1, offset: at(190) },
        { transform: `translate(${side * 14}px, -6px) rotate(${side * 10}deg)`, opacity: 1, offset: at(320) },
        { transform: `translate(${side * 54}px, 120px) rotate(${side * 60}deg)`, opacity: 0, offset: at(900) },
        { transform: `translate(${side * 54}px, 120px) rotate(${side * 60}deg)`, opacity: 0 },
      ], { easing: "cubic-bezier(0.3, 0, 0.6, 1)" }),
    );
    // The flap swings up and over, passing behind the card once it's past upright
    play(flap.current, [
      { transform: FLAP(0), zIndex: 3, opacity: 1, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
      { transform: FLAP(0), zIndex: 3, opacity: 1, offset: at(200) },
      { transform: FLAP(90), zIndex: 3, opacity: 1, offset: at(550) },
      { transform: FLAP(90.1), zIndex: 0, opacity: 1, offset: at(551) },
      { transform: FLAP(180), zIndex: 0, opacity: 1, offset: at(900) },
      { transform: FLAP(180), zIndex: 0, opacity: 1, offset: at(1500), easing: "cubic-bezier(0.5, 0, 0.8, 0.4)" },
      { transform: FLAP(183, "86%"), zIndex: 0, opacity: 0, offset: at(2150) },
      { transform: FLAP(183, "86%"), zIndex: 0, opacity: 0 },
    ]);
    // The outside of the flap darkens as it turns away from the light
    play(flapOut.current, [
      { filter: "brightness(1)" },
      { filter: "brightness(1)", offset: at(200) },
      { filter: "brightness(0.82)", offset: at(550) },
      { filter: "brightness(0.82)" },
    ]);
    // The card slides out, overshoots, and settles exactly where it stays
    play(card.current, [
      { transform: "translateY(40%) scale(0.9) rotate(0deg)", easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
      { transform: "translateY(40%) scale(0.9) rotate(0deg)", offset: at(800), easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
      { transform: "translateY(-22%) scale(1) rotate(-1.5deg)", offset: at(1700), easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      { transform: "translateY(-22%) scale(1) rotate(-1.5deg)", offset: at(1900), easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" },
      { transform: "translateY(0%) scale(1) rotate(0deg)" },
    ]);
    // The envelope drops away and fades
    [back.current, front.current].forEach((el) =>
      play(el, [
        { transform: BASE, opacity: 1 },
        { transform: BASE, opacity: 1, offset: at(1500), easing: "cubic-bezier(0.5, 0, 0.8, 0.4)" },
        { transform: "translate(-50%, 86%) rotate(3deg)", opacity: 0, offset: at(2150) },
        { transform: "translate(-50%, 86%) rotate(3deg)", opacity: 0 },
      ]),
    );
    window.setTimeout(() => {
      anims.forEach((a) => a.cancel());
      setPhase("open");
    }, D);
  };

  if (phase === "open") return <div className="env-stage is-open">{children}</div>;

  return (
    <div ref={stage} className={`env-stage is-${phase}`}>
      {/* Room above for the flap once it swings open; it closes with the space below */}
      <div className="env-topspacer" />
      <div className="env-inner">
      <div ref={back} className="env-part env-back" aria-hidden="true">
        <svg viewBox="0 0 700 500" preserveAspectRatio="none">
          <defs>
            <Grain id={`${id}g1`} />
            <Liner id={`${id}l1`} />
            <linearGradient id={`${id}shade`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#000" stopOpacity="0.35" />
              <stop offset="0.2" stopColor="#000" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="700" height="500" rx="6" fill="#e6d6b9" filter={`url(#${id}g1)`} />
          {/* The liner inside, seen when the flap is open */}
          <rect x="12" y="10" width="676" height="300" fill={`url(#${id}l1)`} />
          <rect x="12" y="10" width="676" height="300" fill={`url(#${id}shade)`} />
        </svg>
      </div>

      <div ref={card} className="env-card">
        {children}
      </div>
      <div className="env-spacer" />

      <div ref={front} className="env-part env-front" aria-hidden="true">
        <svg viewBox="0 0 700 500" preserveAspectRatio="none">
          <defs>
            <Grain id={`${id}g2`} />
            <linearGradient id={`${id}side`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#e3d2b3" />
              <stop offset="1" stopColor="#ecdec4" />
            </linearGradient>
            <linearGradient id={`${id}bottom`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4ead6" />
              <stop offset="1" stopColor="#ecdfc6" />
            </linearGradient>
            <filter id={`${id}fold`} x="-5%" y="-10%" width="110%" height="120%">
              <feDropShadow dx="0" dy="-2" stdDeviation="4" floodColor="#5a3c1c" floodOpacity="0.22" />
            </filter>
          </defs>
          {/* Side flaps */}
          <g filter={`url(#${id}g2)`}>
            <path d="M0 0 L372 268 Q378 273 372 278 L0 500 Z" fill={`url(#${id}side)`} />
            <path d="M700 0 L328 268 Q322 273 328 278 L700 500 Z" fill={`url(#${id}side)`} />
          </g>
          {/* Bottom flap, folded up over the sides */}
          <g filter={`url(#${id}fold)`}>
            <path d="M0 500 L330 226 Q350 212 370 226 L700 500 Z" fill={`url(#${id}bottom)`} filter={`url(#${id}g2)`} />
          </g>
          <text x="350" y="388" textAnchor="middle" fontSize="13" letterSpacing="3" fill="#8a6a7c" style={{ fontFamily: "var(--font-geist), sans-serif", fontWeight: 500 }}>
            FROM THE FRONT DESK
          </text>
          <text x="350" y="446" textAnchor="middle" fontSize="44" fill="#6e0e4b" transform="rotate(-2 350 446)" style={{ fontFamily: "var(--font-handwriting), cursive" }}>
            for guest no. {guestNo}
          </text>
        </svg>
      </div>

      <div ref={flap} className="env-part env-flap" aria-hidden="true">
        <div ref={flapOut} className="env-flap-face">
          <svg viewBox="0 0 700 500" preserveAspectRatio="none">
            <defs>
              <Grain id={`${id}g3`} />
              <linearGradient id={`${id}flap`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#e2d1b1" />
                <stop offset="1" stopColor="#efe3cb" />
              </linearGradient>
              <filter id={`${id}cast`} x="-5%" y="-5%" width="110%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#5a3c1c" floodOpacity="0.25" />
              </filter>
            </defs>
            <g filter={`url(#${id}cast)`}>
              <path d="M0 0 L700 0 L370 296 Q350 312 330 296 Z" fill={`url(#${id}flap)`} filter={`url(#${id}g3)`} />
            </g>
          </svg>
        </div>
        <div className="env-flap-face is-inside">
          <svg viewBox="0 0 700 500" preserveAspectRatio="none">
            <defs>
              <Liner id={`${id}l2`} />
            </defs>
            <path d="M0 0 L700 0 L370 296 Q350 312 330 296 Z" fill="#e6d6b9" />
            <path d="M12 6 L688 6 L366 290 Q350 302 334 290 Z" fill={`url(#${id}l2)`} />
          </svg>
        </div>
      </div>

      {/* The seal sits on the flap's tip, in the same frame as the envelope */}
      <div className="env-part env-sealbox">
        <button ref={seal} type="button" onClick={open} className="env-seal" aria-label="Break the seal and open the envelope">
          <WaxSeal id={`${id}s`} />
        </button>
        <div ref={halves} className="env-halves" aria-hidden="true">
          <span><WaxSeal id={`${id}h1`} half="left" /></span>
          <span><WaxSeal id={`${id}h2`} half="right" /></span>
        </div>
      </div>
      </div>

      <p className="env-hint">Break the seal to open</p>
    </div>
  );
}
