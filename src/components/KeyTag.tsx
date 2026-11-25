"use client";

import { useEffect, useId, useRef } from "react";

// Hotel room key on a brass wall hook, hung from the card it labels.
//
//   hook  — brass rosette plate + slotted screw, a shaded J-hook and its cast shadow.
//           Always on the card. Gives a small jolt when the key lands.
//   key   — steel split ring, a brass key on the ring, and the grape room fob threaded
//           through its brass eyelet. Matte, as the footer social badges: flat colour with soft
//           light washes, grain, edge bevels, a pressed-in room number and the same shadows.
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
// Touch screens can't hover, so there it drops once the card's picture scrolls into view.
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

    // Touch screens can't hover, so there the key drops once its picture is well in view.
    // Watching the picture, not the card: on a phone the words sit above it, and the key
    // used to fall while the picture was still below the screen.
    let io: IntersectionObserver | null = null;
    const media = svg?.parentElement;
    if (media && window.matchMedia("(hover: none), (pointer: coarse)").matches && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          if (!card.getAttribute("data-key")) set("dropping");
          io?.disconnect();
        },
        { threshold: 0.6, rootMargin: "0px 0px -8% 0px" }
      );
      io.observe(media);
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
          <stop offset="0" stopColor="#e4c27a" />
          <stop offset="0.5" stopColor="#c99a45" />
          <stop offset="1" stopColor="#94702b" />
        </linearGradient>
        <radialGradient id={`plate-${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#e8c983" />
          <stop offset="0.6" stopColor="#c69744" />
          <stop offset="1" stopColor="#8a6626" />
        </radialGradient>
        <linearGradient id={`steel-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eceef1" />
          <stop offset="0.5" stopColor="#bfc3c9" />
          <stop offset="1" stopColor="#80858e" />
        </linearGradient>
        {/* Brass, matte: a turned rod lit from the left, and a domed bow */}
        <linearGradient id={`rod-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a7430" />
          <stop offset="0.35" stopColor="#ecd291" />
          <stop offset="0.6" stopColor="#c99a45" />
          <stop offset="1" stopColor="#87631f" />
        </linearGradient>
        <radialGradient id={`bow-${id}`} cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#f0d79a" />
          <stop offset="0.55" stopColor="#c99a45" />
          <stop offset="1" stopColor="#8a6626" />
        </radialGradient>
        <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* The fob shares the footer badges' matte finish: one flat colour, a soft lift of light
            top left and a shade low right (the same two radial washes), a grain, an edge bevel */}
        <radialGradient id={`lift-${id}`} cx="0.28" cy="0.18" r="1.2">
          <stop offset="0" stopColor="rgb(255,236,255)" stopOpacity="0.13" />
          <stop offset="0.55" stopColor="rgb(255,236,255)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`shade-${id}`} cx="0.76" cy="0.92" r="1.1">
          <stop offset="0" stopColor="rgb(18,0,24)" stopOpacity="0.28" />
          <stop offset="0.62" stopColor="rgb(18,0,24)" stopOpacity="0" />
        </radialGradient>
        {/* Matte material, as .social-badge: grain at 7% soft-light, a 1px light edge inside the
            top, a 1px dark edge and a soft shade inside the bottom */}
        <filter id={`matte-${id}`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0" result="white" />
          <feComposite in="white" in2="SourceAlpha" operator="in" result="grainIn" />
          <feComponentTransfer in="grainIn" result="grain">
            <feFuncA type="linear" slope="0.05" />
          </feComponentTransfer>
          <feBlend in="grain" in2="SourceGraphic" mode="soft-light" result="grained" />
          <feComponentTransfer in="SourceAlpha" result="outside">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feOffset in="outside" dy="1" result="o1" />
          <feComposite in="o1" in2="SourceAlpha" operator="in" result="topBand" />
          <feFlood floodColor="#fff" floodOpacity="0.14" />
          <feComposite in2="topBand" operator="in" result="topLight" />
          <feOffset in="outside" dy="-1" result="o2" />
          <feComposite in="o2" in2="SourceAlpha" operator="in" result="botBand" />
          <feFlood floodColor="rgb(12,0,16)" floodOpacity="0.22" />
          <feComposite in2="botBand" operator="in" result="botDark" />
          <feOffset in="outside" dy="-3" result="o3" />
          <feGaussianBlur in="o3" stdDeviation="2.5" result="o3b" />
          <feComposite in="o3b" in2="SourceAlpha" operator="in" result="botSoftBand" />
          <feFlood floodColor="rgb(12,0,16)" floodOpacity="0.22" />
          <feComposite in2="botSoftBand" operator="in" result="botSoft" />
          <feMerge>
            <feMergeNode in="grained" />
            <feMergeNode in="botSoft" />
            <feMergeNode in="botDark" />
            <feMergeNode in="topLight" />
          </feMerge>
        </filter>
        {/* The room number pressed in, as the footer icons: dark edge on top, light edge below */}
        <filter id={`press-${id}`} x="-20%" y="-30%" width="140%" height="160%">
          <feDropShadow dx="0" dy="-1" stdDeviation="0" floodColor="rgb(12,0,16)" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="-1" stdDeviation="0.5" floodColor="rgb(12,0,16)" floodOpacity="0.12" />
          <feDropShadow dx="0" dy="1" stdDeviation="0" floodColor="#fff" floodOpacity="0.22" />
        </filter>
        <filter id={`soft-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={`drop-${id}`} x="-40%" y="-20%" width="180%" height="150%">
          {/* A tight contact shadow and a soft one under it, light enough for a pale card */}
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgb(30,5,37)" floodOpacity="0.2" result="far" />
          <feDropShadow in="far" dx="0" dy="1" stdDeviation="0.8" floodColor="rgb(30,5,37)" floodOpacity="0.28" />
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
        {/* Brass room key on the ring, hanging out to the left of the fob so its whole shape
            reads: round bow, collar, a round shank and a toothed bit facing outwards. The
            shank and bit are shaded across their width like a turned brass rod. */}
        <g transform="translate(26.5 46.3) rotate(24)">
          <g mask={u("bowhole")}>
            {/* Bow: a ring with a raised rim */}
            <circle r="6.4" fill={u("bow")} />
            <circle r="5.2" fill="none" stroke="rgba(255,240,200,0.35)" strokeWidth="0.6" />
            <circle r="6.4" fill="none" stroke="#7d5b1f" strokeOpacity="0.55" strokeWidth="0.5" />
            {/* Collar */}
            <rect x="-3.4" y="5.6" width="6.8" height="2.6" rx="1" fill={u("rod")} stroke="#7d5b1f" strokeOpacity="0.5" strokeWidth="0.4" />
            {/* Shank, rounded at the tip */}
            <path d="M-1.7 8.2h3.4V41a1.7 1.7 0 0 1-3.4 0Z" fill={u("rod")} stroke="#7d5b1f" strokeOpacity="0.5" strokeWidth="0.4" />
            {/* Bit, on the outer side: two teeth and a notch */}
            <path d="M-1.6 31h-5v2.6h-1.6v2.2h1.6v2.4h-1.6v1.6h6.6Z" fill={u("rod")} stroke="#7d5b1f" strokeOpacity="0.5" strokeWidth="0.4" strokeLinejoin="round" />
          </g>
          <circle r="2.4" fill="none" stroke="#7d5b1f" strokeOpacity="0.6" strokeWidth="0.5" />
        </g>

        {/* Fob + room number, hung from the ring's bottom */}
        <g transform="translate(1.5 -1)">
          <g mask={u("fobhole")}>
            <g filter={u("matte")}>
              <path d="M34 44c6 0 9 4 10 10l6 46c1.5 11-6 18-16 18S16.5 111 18 100l6-46c1-6 4-10 10-10Z" fill="#9D136A" />
              <path d="M34 44c6 0 9 4 10 10l6 46c1.5 11-6 18-16 18S16.5 111 18 100l6-46c1-6 4-10 10-10Z" fill={u("shade")} />
              <path d="M34 44c6 0 9 4 10 10l6 46c1.5 11-6 18-16 18S16.5 111 18 100l6-46c1-6 4-10 10-10Z" fill={u("lift")} />
            </g>
            {/* A soft light rim just inside the edge, brighter top left where the light falls */}
            <path
              d="M34 46.6c4.8 0 7.4 3.2 8.2 8.2l5.9 45.6c1.3 9.6-5.2 16-14.1 16s-15.4-6.4-14.1-16l5.9-45.6c.8-5 3.4-8.2 8.2-8.2Z"
              fill="none"
              stroke={u("rim")}
              strokeWidth="1"
            />
            <circle cx="34" cy="54" r="5.5" fill={u("brass")} filter={u("matte")} />
          </g>
          <text x="34" y="96" textAnchor="middle" className="font-heading" fontSize="16" fill="#fbe9f6" fillOpacity="0.95" filter={u("press")}>
            {room}
          </text>
        </g>

        {/* Split ring — inner top edge rests on the wire at C, bottom threads the eyelet */}
        <circle cx="35.5" cy="40" r="11" fill="none" stroke={u("steel")} strokeWidth="2.4" />
        <circle cx="36.2" cy="40.4" r="10.1" fill="none" stroke={u("steel")} strokeWidth="0.9" opacity="0.8" />
        <path d="M25.9 36a11 11 0 0 1 15.4-5.4" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.8" />
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
        <path d="M29.2 14v8.4c0 5 3 7.6 6.8 7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" strokeLinecap="round" />
        <circle cx="30" cy="9" r="6.5" fill={u("plate")} filter={u("matte")} />
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
