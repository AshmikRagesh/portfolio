"use client";

// Highlighted words in the About intro. Each is a bright pill that does one small thing
// about what it says when you hover it (or tap it on a touch screen):
//
//   self-taught      a pencil underlines it by hand
//   design engineer  turns over into {design + code}
//   Travelopia       an airliner glides over, leaving a fading contrail
//   code and AI      a light sweeps through the letters; two sparkles twinkle
//   a workflow       design → code → review ✓ steps in above it (links to Helix)
//   Airbnb           a brass house key on a leather fob swings down above it
//   football         a ball is chipped into a little goal and ripples the net
//   badminton        a shuttlecock is cleared over it and drops
//   Chelsea          the 💙 at the end of the line beats and lets a few hearts go
//
// Motion rules: nothing changes the size of a pill or moves the text around it (every
// effect is drawn on top, with transforms and opacity only); entrances ease out, exits
// ease in; each effect runs once per hover and can't be re-triggered while it plays;
// reduced-motion users get the pill's hover state and nothing else.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

const COLORS = {
  orange: "#F2541B",
  violet: "#6D3BFF",
  teal: "#00838A",
  ink: "#16121A",
  pink: "#E8137A",
  coral: "#E8434A",
  green: "#12893D",
  yellow: "#FFC21A",
  chelsea: "#034694",
};

const canHover = () => window.matchMedia("(hover: hover)").matches;
const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
let uid = 0;

/** Hover plays it once; on a touch screen a tap does. `on` is true while it plays. */
function usePlay(play?: (el: HTMLElement) => Promise<void> | void) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  const busy = useRef(false);
  const run = async () => {
    if (!ref.current || busy.current || still()) return;
    busy.current = true;
    setOn(true);
    try {
      if (play) await play(ref.current);
    } finally {
      setOn(false);
      window.setTimeout(() => (busy.current = false), 300);
    }
  };
  return {
    on,
    props: {
      ref,
      "data-on": on,
      onMouseEnter: () => canHover() && run(),
      onClick: () => !canHover() && run(),
    },
  };
}

/** A drawing laid over the pill (never in the flow) */
function overlay(host: HTMLElement, html: string, style: Partial<CSSStyleDeclaration> = {}) {
  const el = document.createElement("span");
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = html;
  Object.assign(el.style, { position: "absolute", left: "0", top: "0", pointerEvents: "none", lineHeight: "0", zIndex: "20", ...style });
  host.appendChild(el);
  return el;
}

// ── The pill ──────────────────────────────────────────────────────────────────
// Geist medium a step smaller than the text around it, a soft top light and a hairline
// lower edge so it reads as a solid, pressed shape; it lifts a pixel on hover.
const PILL =
  "group/pill relative inline-block whitespace-nowrap rounded-full px-[10px] align-baseline font-geist text-[14px] font-medium leading-[24px] tracking-[0px] text-white antialiased md:px-[12px] md:text-[18px] md:leading-[28px] " +
  "bg-[var(--pill)] [background-image:linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_60%)] " +
  "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(0,0,0,0.16),0_1px_2px_rgba(22,18,26,0.16)] " +
  "transition-[transform,box-shadow] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-[1px] " +
  "[@media(hover:hover)]:hover:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(0,0,0,0.16),0_6px_14px_-6px_var(--pill)]";

type PlayProps = ReturnType<typeof usePlay>["props"];
function Pill({ color, play, className = "", children }: { color: string; play?: PlayProps; className?: string; children: React.ReactNode }) {
  return (
    <span {...play} className={`${PILL} ${className}`} style={{ ["--pill" as string]: color }}>
      {children}
    </span>
  );
}

// ── self-taught: a pencil underlines it ───────────────────────────────────────
const PENCIL = `<svg viewBox="0 0 44 12" width="40" height="11" style="display:block;transform:rotate(-34deg);transform-origin:0 6px;filter:drop-shadow(0 2px 1.5px rgba(22,18,26,.25))">
<defs><linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DDB6"/><stop offset="1" stop-color="#D5AE7C"/></linearGradient>
<linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F6F8"/><stop offset=".5" stop-color="#B8C0C9"/><stop offset="1" stop-color="#8A939E"/></linearGradient></defs>
<path d="M0 6 5.4 4.5v3Z" fill="#2B2B33"/>
<path d="M5.4 4.5 12 2.4v7.2L5.4 7.5Z" fill="url(#pw)"/>
<path d="M12 2.4h21v2.4H12Z" fill="#FFD453"/><path d="M12 4.8h21v2.4H12Z" fill="#F5B300"/><path d="M12 7.2h21v2.4H12Z" fill="#D69500"/>
<path d="M12 2.4c.8.8.8 1.6 0 2.4.8.8.8 1.6 0 2.4.8.8.8 1.6 0 2.4" fill="none" stroke="#C99A5E" stroke-width=".5"/>
<path d="M33 2.2h4.2v7.6H33Z" fill="url(#pf)"/><path d="M34.4 2.2v7.6M35.8 2.2v7.6" stroke="#7D8691" stroke-width=".35"/>
<path d="M37.2 2.2h4.4a1.6 1.6 0 0 1 1.6 1.6v4.4a1.6 1.6 0 0 1-1.6 1.6h-4.4Z" fill="#F08FA6"/><path d="M37.2 7.6h5.8" stroke="#D96C88" stroke-width=".6"/>
</svg>`;

export function SelfTaughtPill() {
  const { props } = usePlay(async (pill) => {
    const w = pill.offsetWidth;
    const h = pill.offsetHeight;
    const d = `M3 4.2 C ${w * 0.28} 2.2, ${w * 0.55} 6, ${w - 3} 3.4`;
    const line = overlay(
      pill,
      `<svg width="${w}" height="8" overflow="visible"><path d="${d}" fill="none" stroke="#2B2B33" stroke-opacity=".85" stroke-width="1.6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`,
      { top: `${h + 1}px` },
    );
    const stroke = line.querySelector("path") as SVGPathElement;
    const pencil = overlay(pill, PENCIL, {
      top: `${h + 1}px`,
      offsetPath: `path('${d}')`,
      offsetRotate: "0deg",
      offsetAnchor: "0px 6px",
    } as Partial<CSSStyleDeclaration>);
    pencil.animate([{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 160, easing: EASE_OUT, fill: "backwards" });
    stroke.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 640, delay: 120, easing: EASE_IN_OUT, fill: "forwards" });
    await pencil.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }], { duration: 640, delay: 120, easing: EASE_IN_OUT, fill: "forwards" }).finished;
    await pencil.animate([{ opacity: 1, transform: "translate(0,0)" }, { opacity: 0, transform: "translate(6px,-8px)" }], { duration: 200, easing: "ease-in", fill: "forwards" }).finished;
    pencil.remove();
    await wait(700);
    await line.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-in", fill: "forwards" }).finished;
    line.remove();
  });
  return (
    <Pill color={COLORS.orange} play={props}>
      self-taught
    </Pill>
  );
}

// ── design engineer: turns over into {design + code} ──────────────────────────
// The pill keeps the width of "design engineer"; the code line is scaled to fit inside it.
export function DesignEngineerPill() {
  const label = useRef<HTMLSpanElement>(null);
  const alt = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(1);
  const { on, props } = usePlay(() => wait(1500));
  const measure = () => {
    if (label.current && alt.current) setFit(Math.min(1, label.current.offsetWidth / alt.current.scrollWidth));
  };
  useLayoutEffect(measure, []);
  useEffect(() => {
    document.fonts?.ready.then(measure);
  }, []);
  const t = "transition-[transform,opacity] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";
  return (
    <Pill color={COLORS.violet} play={props}>
      <span className="relative block [clip-path:inset(0_-4px)]">
        <span ref={label} className={`block ${t} ${on ? "-translate-y-full opacity-0" : ""}`}>
          design engineer
        </span>
        <span aria-hidden="true" className={`absolute inset-0 flex items-center justify-center ${t} ${on ? "" : "translate-y-full opacity-0"}`}>
          <span ref={alt} className="inline-block font-brand text-[0.84em] font-normal" style={{ transform: `scale(${fit})` }}>
            {"{design + code}"}
          </span>
        </span>
      </span>
    </Pill>
  );
}

// ── Travelopia: an airliner glides over ───────────────────────────────────────
function plane(id: string) {
  return `<svg viewBox="0 0 40 40" width="28" height="28" style="display:block">
<defs><linearGradient id="f${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#E9EDF2"/><stop offset="1" stop-color="#B9C1CC"/></linearGradient>
<linearGradient id="w${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9D0D9"/><stop offset="1" stop-color="#F3F5F8"/></linearGradient></defs>
<path d="M23.5 18.8 15.2 4.6h-2.6l3.4 14.2ZM23.5 21.2 15.2 35.4h-2.6l3.4-14.2Z" fill="url(#w${id})" stroke="#A3ACB8" stroke-width=".4" stroke-linejoin="round"/>
<rect x="15.6" y="10.4" width="4.4" height="2" rx="1" fill="#8F99A6"/><rect x="15.6" y="27.6" width="4.4" height="2" rx="1" fill="#8F99A6"/>
<path d="M8.6 18.9 5 13.2H3.4l1.8 5.7ZM8.6 21.1 5 26.8H3.4l1.8-5.7Z" fill="url(#w${id})" stroke="#A3ACB8" stroke-width=".4" stroke-linejoin="round"/>
<path d="M5.6 18.5C12 17.6 29 17.5 33.6 18.1c3 .4 5 1.2 5 1.9s-2 1.5-5 1.9c-4.6.6-21.6.5-28-.4-1.2-.2-1.8-.8-1.8-1.5s.6-1.3 1.8-1.5Z" fill="url(#f${id})" stroke="#A3ACB8" stroke-width=".4"/>
<path d="M34.6 19.2c1 .2 1.8.5 2.2.8" stroke="#5B6675" stroke-width=".7" stroke-linecap="round"/>
</svg>`;
}

export function TravelopiaPill() {
  const { props } = usePlay(async (pill) => {
    const w = pill.offsetWidth;
    const h = pill.offsetHeight;
    const id = `${++uid}`;
    const d = `M -40 ${h * 0.1} C ${w * 0.25} ${-h * 1.2}, ${w * 0.75} ${-h * 1.25}, ${w + 40} ${-h * 0.35}`;
    const trail = overlay(
      pill,
      `<svg width="${w}" height="${h}" overflow="visible"><defs><mask id="m${id}" maskUnits="userSpaceOnUse" x="-60" y="-80" width="${w + 120}" height="${h + 120}"><path d="${d}" fill="none" stroke="#fff" stroke-width="8" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></mask></defs><path d="${d}" fill="none" stroke="#A9B2BE" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round" mask="url(#m${id})"/></svg>`,
    );
    const reveal = trail.querySelector("mask path") as SVGPathElement;
    const jet = overlay(pill, plane(id), {
      offsetPath: `path('${d}')`,
      offsetRotate: "auto",
      offsetAnchor: "28px 14px",
      filter: "drop-shadow(0 8px 4px rgba(22,18,26,.14))",
    } as Partial<CSSStyleDeclaration>);
    const dur = 1500;
    reveal.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, easing: EASE_IN_OUT, fill: "forwards" });
    await jet.animate(
      [
        { offsetDistance: "0%", opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { opacity: 1, offset: 0.88 },
        { offsetDistance: "100%", opacity: 0 },
      ],
      { duration: dur, easing: EASE_IN_OUT, fill: "forwards" },
    ).finished;
    jet.remove();
    await trail.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: "ease-in", fill: "forwards" }).finished;
    trail.remove();
  });
  return (
    <Pill color={COLORS.teal} play={props}>
      Travelopia
    </Pill>
  );
}

// ── code and AI: a light sweeps through it ────────────────────────────────────
const SPARK = (size: number, id: string) =>
  `<svg viewBox="0 0 16 16" width="${size}" height="${size}" style="display:block"><defs><radialGradient id="s${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFFBEA"/><stop offset=".55" stop-color="#FFE07A"/><stop offset="1" stop-color="#FFB800"/></radialGradient></defs><path d="M8 0c.5 4.4 3.6 7.5 8 8-4.4.5-7.5 3.6-8 8-.5-4.4-3.6-7.5-8-8 4.4-.5 7.5-3.6 8-8Z" fill="url(#s${id})"/></svg>`;

export function CodeAndAIPill() {
  const text = useRef<HTMLSpanElement>(null);
  const { props } = usePlay(async (pill) => {
    const sweep = text.current!.animate([{ backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0" }], { duration: 1100, easing: EASE_IN_OUT });
    const a = overlay(pill, SPARK(12, `${++uid}`), { left: "auto", right: "-6px", top: "-8px" });
    const b = overlay(pill, SPARK(8, `${++uid}`), { left: "auto", right: "-14px", top: "4px" });
    const twinkle = (el: HTMLElement, delay: number) =>
      el.animate(
        [
          { transform: "scale(0) rotate(-30deg)", opacity: 0 },
          { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.35 },
          { transform: "scale(0.85) rotate(20deg)", opacity: 1, offset: 0.6 },
          { transform: "scale(0) rotate(45deg)", opacity: 0 },
        ],
        { duration: 900, delay, easing: EASE_OUT, fill: "both" },
      ).finished;
    await Promise.all([sweep.finished, twinkle(a, 250), twinkle(b, 420)]);
    a.remove();
    b.remove();
  });
  return (
    <Pill color={COLORS.ink} play={props}>
      <span
        ref={text}
        className="bg-[linear-gradient(105deg,#fff_0%,#fff_38%,#D9C9FF_45%,#9FF3FF_50%,#FFE07A_55%,#fff_62%,#fff_100%)] bg-[length:300%_100%] bg-[position:100%_0] bg-clip-text text-transparent"
      >
        code and AI
      </span>
    </Pill>
  );
}

// ── a workflow: design → code → review ✓ ──────────────────────────────────────
const SHOW =
  "[@media(hover:hover)]:group-hover/pill:translate-y-0 [@media(hover:hover)]:group-hover/pill:scale-100 [@media(hover:hover)]:group-hover/pill:opacity-100 group-focus-visible/pill:translate-y-0 group-focus-visible/pill:scale-100 group-focus-visible/pill:opacity-100";
const HIDE = "translate-y-[4px] scale-95 opacity-0 transition-[transform,opacity] duration-200 ease-in [@media(hover:hover)]:group-hover/pill:duration-300 [@media(hover:hover)]:group-hover/pill:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";
const DELAY = ["", "[@media(hover:hover)]:group-hover/pill:delay-[90ms]", "[@media(hover:hover)]:group-hover/pill:delay-[180ms]", "[@media(hover:hover)]:group-hover/pill:delay-[270ms]", "[@media(hover:hover)]:group-hover/pill:delay-[360ms]"];
const CHIP =
  "flex h-[24px] items-center gap-[6px] rounded-full bg-white px-[8px] font-geist text-[12px] font-medium leading-[16px] text-[#16121A] [box-shadow:0_0_0_1px_rgba(22,18,26,0.08),0_6px_16px_-6px_rgba(22,18,26,0.28)]";

export function WorkflowPill() {
  return (
    <Link
      href="/works/helix"
      className={`${PILL} outline-none focus-visible:ring-2 focus-visible:ring-[#E8137A]/40 focus-visible:ring-offset-2`}
      style={{ ["--pill" as string]: COLORS.pink }}
    >
      a workflow
      <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-0 z-20 mb-[8px] flex items-center">
        <span className={`${CHIP} ${HIDE} ${SHOW} ${DELAY[0]}`}>
          <span className="h-[6px] w-[6px] rounded-full bg-[#6D3BFF]" />
          design
        </span>
        <span className={`h-px w-[12px] origin-left bg-[#16121A]/25 ${HIDE} ${SHOW} ${DELAY[1]}`} />
        <span className={`${CHIP} ${HIDE} ${SHOW} ${DELAY[2]}`}>
          <span className="font-brand text-[11px] leading-[16px] text-[#6D3BFF]">{"</>"}</span>
          code
        </span>
        <span className={`h-px w-[12px] origin-left bg-[#16121A]/25 ${HIDE} ${SHOW} ${DELAY[3]}`} />
        <span className={`${CHIP} ${HIDE} ${SHOW} ${DELAY[4]} !text-[#12893D]`}>
          <svg viewBox="0 0 12 12" width="12" height="12">
            <circle cx="6" cy="6" r="6" fill="#12893D" />
            <path d="M3.4 6.2 5.2 8l3.4-3.6" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          review
        </span>
      </span>
      <span className="sr-only"> (Helix on Claude Code case study)</span>
    </Link>
  );
}

// ── Airbnb: a house key swings down ───────────────────────────────────────────
function keys(id: string) {
  return `<svg viewBox="0 0 40 46" width="34" height="39" style="display:block;overflow:visible">
<defs><linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBE3A0"/><stop offset=".45" stop-color="#D9A53C"/><stop offset="1" stop-color="#9A6C1E"/></linearGradient>
<linearGradient id="r${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F6F8"/><stop offset=".5" stop-color="#A9B1BB"/><stop offset="1" stop-color="#717A85"/></linearGradient>
<linearGradient id="t${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0646A"/><stop offset="1" stop-color="#C9333A"/></linearGradient></defs>
<circle cx="20" cy="6" r="4.6" fill="none" stroke="url(#r${id})" stroke-width="1.6"/>
<g transform="translate(23.2 9.4) rotate(14)">
  <path d="M-1 0h4.4l3 3v14.4a2.2 2.2 0 0 1-2.2 2.2h-3a2.2 2.2 0 0 1-2.2-2.2Z" fill="url(#t${id})"/>
  <path d="M.4 2.2h2.6l1.8 1.8v12.8a1 1 0 0 1-1 1H1.4a1 1 0 0 1-1-1Z" fill="none" stroke="#FFD3D5" stroke-opacity=".7" stroke-width=".45" stroke-dasharray="1 .8"/>
  <circle cx="1.2" cy="1.6" r=".9" fill="#7A1E22"/>
</g>
<g transform="translate(16.4 9.6) rotate(-6)">
  <circle cx="3.6" cy="5.2" r="5.2" fill="url(#b${id})" stroke="#8A5F18" stroke-width=".5"/>
  <circle cx="3.6" cy="3.4" r="1.4" fill="#fff"/>
  <path d="M2.5 9.6h2.2v19.6H2.5Z" fill="url(#b${id})" stroke="#8A5F18" stroke-width=".4"/>
  <path d="M4.7 21.2h2.4v1.8H5.6v1.4h1.8v2H4.7Z" fill="url(#b${id})" stroke="#8A5F18" stroke-width=".4" stroke-linejoin="round"/>
  <path d="M3 11v17" stroke="#FFF4CF" stroke-opacity=".7" stroke-width=".5"/>
</g>
</svg>`;
}

export function AirbnbPill() {
  const { props } = usePlay(async (pill) => {
    const w = pill.offsetWidth;
    const el = overlay(pill, keys(`${++uid}`), { left: `${w - 26}px`, top: "-44px", transformOrigin: "20px 2px" });
    // drops onto its hook and swings to rest, like a real pendulum: each swing smaller
    await el.animate(
      [
        { transform: "translateY(-10px) rotate(0deg)", opacity: 0 },
        { transform: "translateY(0) rotate(22deg)", opacity: 1, offset: 0.16 },
        { transform: "rotate(-15deg)", offset: 0.36 },
        { transform: "rotate(9deg)", offset: 0.54 },
        { transform: "rotate(-5deg)", offset: 0.7 },
        { transform: "rotate(2deg)", offset: 0.84 },
        { transform: "rotate(0deg)", opacity: 1 },
      ],
      { duration: 1500, easing: "cubic-bezier(0.37, 0, 0.63, 1)", fill: "forwards" },
    ).finished;
    await wait(500);
    await el.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 220, easing: "ease-in", fill: "forwards" }).finished;
    el.remove();
  });
  return (
    <Pill color={COLORS.coral} play={props}>
      Airbnb
    </Pill>
  );
}

// ── football: chipped into a goal ─────────────────────────────────────────────
const pentagon = (cx: number, cy: number, r: number, rot: number) =>
  Array.from({ length: 5 }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / 5;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

function ballPattern() {
  const c = 16;
  const inner = pentagon(c, c, 5, -Math.PI / 2);
  const outer = Array.from({ length: 5 }, (_, k) => {
    const a = -Math.PI / 2 + Math.PI / 5 + (k * 2 * Math.PI) / 5;
    return `<polygon points="${pentagon(c + Math.cos(a) * 14.6, c + Math.sin(a) * 14.6, 5.2, a + Math.PI)}"/>`;
  }).join("");
  const seams = Array.from({ length: 5 }, (_, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
    return `<path d="M${(c + Math.cos(a) * 5).toFixed(2)} ${(c + Math.sin(a) * 5).toFixed(2)}L${(c + Math.cos(a) * 11).toFixed(2)} ${(c + Math.sin(a) * 11).toFixed(2)}"/>`;
  }).join("");
  return { inner, outer, seams };
}
const BALL = ballPattern();

function ball(id: string) {
  return `<span style="position:relative;display:block;width:16px;height:16px">
<svg class="spin" viewBox="0 0 32 32" width="16" height="16" style="position:absolute;inset:0">
<defs><clipPath id="c${id}"><circle cx="16" cy="16" r="15"/></clipPath></defs>
<circle cx="16" cy="16" r="15" fill="#FAFBFC"/>
<g clip-path="url(#c${id})" fill="#1D1D24"><polygon points="${BALL.inner}"/>${BALL.outer}</g>
<g stroke="#9AA1AA" stroke-width=".7" fill="none">${BALL.seams}</g>
</svg>
<svg viewBox="0 0 32 32" width="16" height="16" style="position:absolute;inset:0">
<defs><radialGradient id="g${id}" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#2A2F38" stop-opacity=".22"/><stop offset="1" stop-color="#1A1E26" stop-opacity=".45"/></radialGradient></defs>
<circle cx="16" cy="16" r="15" fill="url(#g${id})" stroke="#2A2F38" stroke-opacity=".35" stroke-width=".8"/>
</svg></span>`;
}

function goal(id: string) {
  // a small goal seen from the front-side: posts, crossbar, and netting running back
  return `<svg viewBox="0 0 44 30" width="40" height="27" style="display:block;overflow:visible">
<defs><pattern id="n${id}" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H3.2M0 0V3.2" stroke="#B8BFC8" stroke-width=".45"/></pattern>
<linearGradient id="p${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#CED4DB"/></linearGradient></defs>
<ellipse cx="24" cy="29.4" rx="22" ry="1.6" fill="#16121A" opacity=".12"/>
<g class="net"><path d="M6 4 14 1h28v28H14Z" fill="url(#n${id})" opacity=".95"/>
<path d="M14 1v28M6 4l8-3M6 29l8 0" stroke="#C3C9D1" stroke-width=".6" fill="none"/></g>
<path d="M6 29.2V4h30v25.2" fill="none" stroke="url(#p${id})" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M6 29.2V4h30v25.2" fill="none" stroke="#7E8792" stroke-opacity=".45" stroke-width=".5"/>
</svg>`;
}

export function FootballPill() {
  const { props } = usePlay(async (pill) => {
    const w = pill.offsetWidth;
    const id = `${++uid}`;
    const gx = w - 14; // where the goal stands, on top of the pill's right end
    const g = overlay(pill, goal(id), { left: `${gx}px`, top: "-26px", transformOrigin: "50% 100%" });
    const shadow = overlay(pill, `<span style="display:block;width:12px;height:3px;border-radius:50%;background:rgba(22,18,26,.28)"></span>`, { top: "-2px" });
    const b = overlay(pill, ball(id), { top: "-16px" });
    const spin = b.querySelector(".spin") as SVGElement;
    const net = g.querySelector(".net") as SVGGElement;
    await g.animate([{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, transform: "scale(1)" }], { duration: 200, easing: EASE_OUT, fill: "forwards" }).finished;

    // the chip: across, up and down under gravity, slowing into the net
    const x0 = 0;
    const x1 = gx + 18;
    const n = 18;
    const flight: Keyframe[] = [];
    const shade: Keyframe[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * (1 - Math.pow(1 - t, 1.6));
      const y = -26 * 4 * t * (1 - t) - 6 * t; // lands in the goal mouth, not on the ground
      flight.push({ transform: `translate(${x}px, ${y}px)` });
      const up = Math.min(1, -y / 26);
      shade.push({ transform: `translate(${x + 2}px, 0) scale(${1 - up * 0.5})`, opacity: 0.9 - up * 0.6 });
    }
    spin.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(540deg)" }], { duration: 760, easing: "linear", fill: "forwards" });
    shadow.animate(shade, { duration: 760, easing: "linear", fill: "forwards" });
    await b.animate(flight, { duration: 760, easing: "linear", fill: "forwards" }).finished;
    // into the net: it gives, and the ball drops
    net.animate([{ transform: "translateX(0)" }, { transform: "translateX(2.4px) scaleY(1.04)" }, { transform: "translateX(0)" }], { duration: 420, easing: EASE_OUT });
    b.animate([{ transform: `translate(${x1}px, -6px)` }, { transform: `translate(${x1 + 4}px, -6px)`, offset: 0.4 }, { transform: `translate(${x1 + 3}px, 0px)` }], {
      duration: 420,
      easing: "ease-in",
      fill: "forwards",
    });
    await wait(900);
    await Promise.all([b, g, shadow].map((e) => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease-in", fill: "forwards" }).finished));
    [b, g, shadow].forEach((e) => e.remove());
  });
  return (
    <Pill color={COLORS.green} play={props}>
      football
    </Pill>
  );
}

// ── badminton: a clear ────────────────────────────────────────────────────────
function shuttle(id: string) {
  // cork at the right (it always flies cork first), feathered skirt behind it
  const feathers = Array.from({ length: 7 }, (_, i) => {
    const y = 1.6 + i * 3.47;
    return `<path d="M25.6 ${(10.2 + i * 0.6).toFixed(2)} 3.6 ${(y - 1.3).toFixed(2)}q-1.4 1.3 0 2.6Z" fill="url(#k${id})" stroke="#C7CCD3" stroke-width=".3"/>`;
  }).join("");
  const quills = Array.from({ length: 7 }, (_, i) => `<path d="M25.6 ${(10.2 + i * 0.6).toFixed(2)} 3.4 ${(1.6 + i * 3.47).toFixed(2)}"/>`).join("");
  return `<svg viewBox="0 0 40 26" width="26" height="17" style="display:block;overflow:visible">
<defs><linearGradient id="k${id}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#F3F5F8"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
<radialGradient id="c${id}" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#EDE6DA"/><stop offset="1" stop-color="#BFB4A3"/></radialGradient></defs>
${feathers}
<g stroke="#D3D8DE" stroke-width=".45" fill="none">${quills}</g>
<path d="M9.4 3.4q-1.2 9.6 0 19.2M17.6 6.4q-.8 6.6 0 13.2" stroke="#8D96A2" stroke-width=".55" fill="none"/>
<path d="M25.4 9h3.2v8h-3.2Z" fill="#2F6FEB"/><path d="M25.4 11.4h3.2" stroke="#fff" stroke-width=".5"/>
<path d="M28.6 8.6c5.6 0 8.6 2 8.6 4.4s-3 4.4-8.6 4.4Z" fill="url(#c${id})" stroke="#A89C8A" stroke-width=".4"/>
</svg>`;
}

export function BadmintonPill() {
  const { props } = usePlay(async (pill) => {
    const w = pill.offsetWidth;
    const s = overlay(pill, shuttle(`${++uid}`));
    s.style.transformOrigin = "28px 8.5px";
    // A shuttle is all drag: it leaves fast, loses speed quickly and falls almost straight
    // down. Integrate that once and lay the path over the pill.
    const pts: [number, number][] = [];
    let x = 0, y = 0, vx = 9, vy = -7.2;
    for (let i = 0; i < 80; i++) {
      pts.push([x, y]);
      const v = Math.hypot(vx, vy);
      vx -= 0.0072 * v * vx;
      vy += 0.42 - 0.0072 * v * vy;
      x += vx * 0.96;
      y += vy * 0.96;
      if (y > 0 && i > 4) break;
    }
    const maxX = pts[pts.length - 1][0] || 1;
    const sx = (w + 4) / maxX;
    const path = pts.map(([px, py]) => [-8 + px * sx, -10 + py * 0.9] as const);
    const frames: Keyframe[] = path.map(([px, py], i) => {
      const [nx, ny] = path[Math.min(i + 1, path.length - 1)];
      const [qx, qy] = path[Math.max(i - 1, 0)];
      const ang = (Math.atan2(ny - qy, nx - qx) * 180) / Math.PI;
      return { transform: `translate(${px - 28}px, ${py - 8.5}px) rotate(${ang}deg)` };
    });
    s.animate([{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1 }], { duration: 1100, fill: "forwards" });
    await s.animate(frames, { duration: 1100, easing: "linear", fill: "forwards" }).finished;
    await wait(250);
    await s.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease-in", fill: "forwards" }).finished;
    s.remove();
  });
  return (
    <Pill color={COLORS.yellow} play={props} className="!text-[#16121A]">
      badminton
    </Pill>
  );
}

// ── Chelsea: the heart at the end of the line ─────────────────────────────────
export function ChelseaLine() {
  const heart = useRef<HTMLSpanElement>(null);
  const { props } = usePlay(async () => {
    const h = heart.current!;
    h.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.28)" }, { transform: "scale(0.94)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 640, easing: "ease-out" },
    );
    const lets = Array.from({ length: 3 }, (_, i) => {
      const e = overlay(h, `<span style="font-size:10px;line-height:12px">💙</span>`, { left: "50%", top: "0", lineHeight: "12px" });
      const dx = (i - 1) * 10;
      return e
        .animate(
          [
            { transform: "translate(-50%, 0) scale(.4)", opacity: 0 },
            { transform: `translate(calc(-50% + ${dx * 0.4}px), -12px) scale(1)`, opacity: 1, offset: 0.3 },
            { transform: `translate(calc(-50% + ${dx}px), -34px) scale(.8)`, opacity: 0 },
          ],
          { duration: 1000, delay: 120 + i * 110, easing: EASE_OUT, fill: "both" },
        )
        .finished.then(() => e.remove());
    });
    await Promise.all(lets);
  });
  return (
    <>
      <Pill color={COLORS.chelsea} play={props}>
        Chelsea
      </Pill>{" "}
      till God calls upon my name.{" "}
      <span ref={heart} className="relative inline-block" role="img" aria-label="blue heart">
        💙
      </span>
    </>
  );
}
