"use client";

import { useEffect, useId, useRef } from "react";

// Hotel room key on a brass wall hook, hung from the card it labels.
//
//   hook  — brass rosette plate + slotted screw, a shaded J-hook and its cast shadow.
//           Always on the card. Gives a small jolt when the key lands.
//   key   — steel split ring, a brass key on the ring, and the grape room fob threaded
//           through its brass eyelet (bevel, gloss, debossed room number).
//
// Threading: the hook wire passes *through* the ring. The ring's inner top edge rests on
// top of the wire at the bottom of the hook's cup, C = (35.5, 27.9) — the pivot the key
// swings from. Layering sells it: the ring is drawn behind the hook, then the short arc
// just left of the contact is drawn again in front, so the ring goes over the wire on one
// side and under it on the other.
//
// The first hover/focus drops the key in: it comes from the upper right, slides onto the
// hook's tip, runs down into the cup and swings to rest — then stays hung. Every later
// hover just swings it on the hook. State lives on the card as data-key
// (dropping → hung → swinging → hung); see .key-hang / .hook-jolt in globals.css.
// Touch screens can't hover, so there it drops once the card scrolls half into view.
// Reduced motion shows it hanging still.
export default function KeyTag({ room, className = "" }: { room: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const u = (name: string) => `url(#${name}-${id})`;
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    const card = svg?.closest<HTMLElement>(".group");
    const key = svg?.querySelector<SVGGElement>(".key-hang");
    if (!card || !key) return;

    const set = (state: "dropping" | "hung" | "swinging") => card.setAttribute("data-key", state);
    const onEnter = () => {
      const state = card.getAttribute("data-key");
      if (!state) return set("dropping");
      if (state === "dropping") return; // let the first drop finish
      // Restart the swing even if one is already playing
      card.removeAttribute("data-key");
      void card.offsetWidth;
      set("swinging");
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === "key-drop" || e.animationName === "key-swing") set("hung");
    };

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("focusin", onEnter);
    key.addEventListener("animationend", onEnd);

    // Touch screens can't hover, so there the key drops once the card is half in view
    let io: IntersectionObserver | null = null;
    if (window.matchMedia("(hover: none)").matches && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          if (!card.getAttribute("data-key")) set("dropping");
          io?.disconnect();
        },
        { threshold: 0.5 }
      );
      io.observe(card);
    }

    return () => {
      io?.disconnect();
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("focusin", onEnter);
      key.removeEventListener("animationend", onEnd);
    };
  }, []);

  return (
    <svg
      ref={ref}
      width="64"
      height="136"
      viewBox="0 0 64 136"
      aria-hidden="true"
      className={`key-tag pointer-events-none overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id={`brass-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8e2a0" />
          <stop offset="0.45" stopColor="#d2a44a" />
          <stop offset="1" stopColor="#7a5718" />
        </linearGradient>
        <radialGradient id={`plate-${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fbe7b0" />
          <stop offset="0.55" stopColor="#c99a3c" />
          <stop offset="1" stopColor="#6b4b14" />
        </radialGradient>
        <linearGradient id={`steel-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#c4c8ce" />
          <stop offset="1" stopColor="#686d76" />
        </linearGradient>
        <linearGradient id={`fob-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c0378d" />
          <stop offset="0.45" stopColor="#9D136A" />
          <stop offset="1" stopColor="#5e0b40" />
        </linearGradient>
        <filter id={`soft-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={`drop-${id}`} x="-40%" y="-20%" width="180%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1e0525" floodOpacity="0.3" />
        </filter>
        {/* Punched holes: the fob eyelet and the key's bow (local coordinates) */}
        <mask id={`fobhole-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="136">
          <rect width="64" height="136" fill="#fff" />
          <circle cx="34" cy="54" r="3" fill="#000" />
        </mask>
        <mask id={`bowhole-${id}`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="40" height="80">
          <rect x="-20" y="-20" width="40" height="80" fill="#fff" />
          <circle cx="0" cy="0" r="2.4" fill="#000" />
        </mask>
      </defs>

      {/* ── Key, back layer (animated) ─────────────────────────────────── */}
      <g className="key-hang" filter={u("drop")}>
        {/* Brass key on the ring, angled out from behind the fob */}
        <g transform="translate(26.5 46.3) rotate(28)">
          <g mask={u("bowhole")}>
            <circle r="6" fill={u("brass")} />
            <rect x="-3" y="5" width="6" height="3" rx="1" fill={u("brass")} />
            <rect x="-1.7" y="7.5" width="3.4" height="30" rx="1" fill={u("brass")} />
            {/* Bits */}
            <path d="M1.7 27h3v3h-2v2h2v3.5h-3Z" fill={u("brass")} />
            <path d="M-1 9v27" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" />
          </g>
          <circle r="2.4" fill="none" stroke="#6b4b14" strokeWidth="0.6" />
        </g>

        {/* Fob + room number, hung from the ring's bottom */}
        <g transform="translate(1.5 -1)">
          <g mask={u("fobhole")}>
            <path d="M34 44c6 0 9 4 10 10l6 46c1.5 11-6 18-16 18S16.5 111 18 100l6-46c1-6 4-10 10-10Z" fill={u("fob")} />
            <path
              d="M34 47c4.5 0 7 3 7.8 7.8l5.8 45.4c1.2 9-5 15.3-13.6 15.3s-14.8-6.3-13.6-15.3l5.8-45.4C27 50 29.5 47 34 47Z"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1"
            />
            <path d="M25 60c1-6 3-9 6-10-2 8-4 26-5 46-2-1-3-3-3-6Z" fill="rgba(255,255,255,0.22)" />
            <circle cx="34" cy="54" r="5.5" fill={u("brass")} />
          </g>
          <text x="34" y="95" textAnchor="middle" className="font-heading" fontSize="16" fill="rgba(40,0,28,0.55)">
            {room}
          </text>
          <text x="34" y="97" textAnchor="middle" className="font-heading" fontSize="16" fill="rgba(255,255,255,0.35)">
            {room}
          </text>
          <text x="34" y="96" textAnchor="middle" className="font-heading" fontSize="16" fill="#fbe9f6">
            {room}
          </text>
        </g>

        {/* Split ring — inner top edge rests on the wire at C, bottom threads the eyelet */}
        <circle cx="35.5" cy="40" r="11" fill="none" stroke={u("steel")} strokeWidth="2.4" />
        <circle cx="36.2" cy="40.4" r="10.1" fill="none" stroke={u("steel")} strokeWidth="0.9" opacity="0.8" />
        <path d="M25.9 36a11 11 0 0 1 15.4-5.4" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.8" />
      </g>

      {/* ── Hook (static, jolts when the key lands) ────────────────────── */}
      <g className="hook-jolt">
        <ellipse cx="31" cy="12" rx="7" ry="6" fill="rgba(30,5,37,0.22)" filter={u("soft")} />
        <path
          d="M31.5 15V24c0 6.5 5 9 9.5 6 1.5-1 2.1-2.5 1.9-4"
          fill="none"
          stroke="rgba(30,5,37,0.22)"
          strokeWidth="3"
          strokeLinecap="round"
          filter={u("soft")}
        />
        <path d="M30 13V22c0 6.5 5 9 9.5 6 1.5-1 2.1-2.5 1.9-4" fill="none" stroke={u("brass")} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M29.2 14v8.4c0 5 3 7.6 6.8 7" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.7" strokeLinecap="round" />
        <circle cx="30" cy="9" r="6.5" fill={u("plate")} />
        <circle cx="30" cy="9" r="6.5" fill="none" stroke="#6b4b14" strokeOpacity="0.5" strokeWidth="0.6" />
        <circle cx="30" cy="9" r="2.4" fill="#a37a2c" />
        <path d="M28.3 8.2 31.7 9.8" stroke="#4d3409" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* ── Key, front layer: the ring arc that passes over the wire ──── */}
      <g className="key-hang">
        <path d="M31.4 29.8A11 11 0 0 1 35.5 29" fill="none" stroke="#d9dce1" strokeWidth="2.4" strokeLinecap="butt" />
        <path d="M31.6 28.9A10.2 10.2 0 0 1 35.5 28.3" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.6" />
      </g>
    </svg>
  );
}
