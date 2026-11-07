"use client";

// Highlighted words in the About intro — solid, bright pills (a deliberate break from the
// DS palette), each doing one small thing about what it says when you hover it, or tap it
// on a touch screen:
//
//   self-taught      the letters scramble and work themselves out
//   design engineer  rolls over into {design + code}
//   Travelopia       a paper plane loops over it, leaving a dotted trail
//   code and AI      deletes itself and types itself back, then sparkles
//   a workflow       design → code → review ✓ builds up above it (links to Helix)
//   Airbnb           rolls over into "welcome!"
//   football         a ball is chipped into a little goal: GOAL!
//   badminton        a shuttlecock rallies back and forth over it
//
// And the sign-off, "Chelsea till God calls upon my name. 💙", does a stadium wave and
// throws blue-and-gold ticker tape.

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

const PILL =
  "group/pill relative inline-block whitespace-nowrap rounded-full px-[10px] align-baseline font-medium leading-[22px] text-white md:leading-[28px] transition-transform duration-200 [@media(hover:hover)]:hover:-translate-y-[2px]";

const canHover = () => window.matchMedia("(hover: hover)").matches;
const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** Hover plays it; on a touch screen a tap plays it. `on` stays true while it plays. */
function usePlay(play: (el: HTMLElement) => Promise<void> | void, minGap = 400) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  const busy = useRef(false);
  const run = async () => {
    if (!ref.current || busy.current) return;
    busy.current = true;
    setOn(true);
    if (!still()) await play(ref.current);
    else await wait(1200);
    setOn(false);
    window.setTimeout(() => (busy.current = false), minGap);
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

function overlay(pill: HTMLElement, html: string, style: Partial<CSSStyleDeclaration> = {}) {
  const el = document.createElement("span");
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = html;
  Object.assign(el.style, { position: "absolute", left: "0", top: "0", pointerEvents: "none", lineHeight: "0", ...style });
  pill.appendChild(el);
  return el;
}

/** Points along a hop from (x0, y0) to (x1, y1) peaking `lift` px above the straight line */
function hop(x0: number, y0: number, x1: number, y1: number, lift: number, n = 12) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - lift * 4 * t * (1 - t)] as const;
  });
}

// ── self-taught: scramble ─────────────────────────────────────────────────────
export function SelfTaughtPill() {
  const label = useRef<HTMLSpanElement>(null);
  const { props } = usePlay(async () => {
    const el = label.current!;
    const text = "self-taught";
    el.style.width = `${el.offsetWidth}px`;
    const chars = "abcdefghijklmnopqrstuvwxyz?#%&";
    const start = performance.now();
    await new Promise<void>((done) => {
      const tick = () => {
        const t = (performance.now() - start) / 760;
        el.textContent = [...text]
          .map((c, i) => (c === "-" || t > 0.25 + (i / text.length) * 0.7 ? c : chars[Math.floor(Math.random() * chars.length)]))
          .join("");
        if (t < 1) requestAnimationFrame(tick);
        else done();
      };
      tick();
    });
    el.textContent = text;
    el.style.width = "";
  });
  return (
    <span {...props} ref={props.ref as React.Ref<HTMLSpanElement>} className={PILL} style={{ background: COLORS.orange }}>
      <span ref={label} className="inline-block text-center">self-taught</span>
    </span>
  );
}

// ── rolling pills: design engineer, Airbnb ────────────────────────────────────
function RollPill({ label, alt, color, altClass = "", hold = 1400 }: { label: string; alt: string; color: string; altClass?: string; hold?: number }) {
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState<[number, number] | null>(null);
  const { on, props } = usePlay(() => wait(hold));
  const measure = () => {
    if (a.current && b.current) setW([a.current.offsetWidth, b.current.offsetWidth]);
  };
  useLayoutEffect(measure, []);
  useEffect(() => {
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return (
    <span
      {...props}
      ref={props.ref as React.Ref<HTMLSpanElement>}
      className={`${PILL} transition-[width,transform] duration-300 [transition-timing-function:cubic-bezier(0.34,1.4,0.64,1)]`}
      style={{ background: color, width: w ? (on ? w[1] : w[0]) + 20 : undefined }}
    >
      {/* sizers, out of the flow */}
      <span ref={a} aria-hidden="true" className="invisible absolute left-0 top-0">{label}</span>
      <span ref={b} aria-hidden="true" className={`invisible absolute left-0 top-0 ${altClass}`}>{alt}</span>
      <span className="relative block text-center [clip-path:inset(0_-8px)]">
        <span className={`block transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.4,0.64,1)] ${on ? "-translate-y-full" : ""}`}>
          {label}
        </span>
        <span
          aria-hidden="true"
          className={`absolute left-0 right-0 top-full block transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.4,0.64,1)] ${altClass} ${on ? "-translate-y-full" : ""}`}
        >
          {alt}
        </span>
      </span>
    </span>
  );
}

export const DesignEngineerPill = () => (
  <RollPill label="design engineer" alt="{design + code}" color={COLORS.violet} altClass="font-brand text-[0.86em]" />
);
export const AirbnbPill = () => <RollPill label="Airbnb" alt="welcome!" color={COLORS.coral} />;

// ── Travelopia: a paper plane loops over it ───────────────────────────────────
let uid = 0;
export function TravelopiaPill() {
  const { props } = usePlay(async (pill) => {
    const w = pill.offsetWidth;
    const h = pill.offsetHeight;
    const d = `M -16 ${h * 0.4} C ${w * 0.22} ${-h * 1.3}, ${w * 0.6} ${-h * 1.5}, ${w * 0.62} ${-h * 0.62} C ${w * 0.64} ${h * 0.05}, ${w * 0.4} ${h * 0.05}, ${w * 0.42} ${-h * 0.66} C ${w * 0.45} ${-h * 1.6}, ${w * 0.86} ${-h * 1.4}, ${w + 22} ${-h * 0.3}`;
    const id = `tp-trail-${++uid}`;
    const trail = overlay(
      pill,
      `<svg width="${w}" height="${h}" overflow="visible"><defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-40" y="-80" width="${w + 80}" height="${h + 120}"><path d="${d}" fill="none" stroke="#fff" stroke-width="6" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></mask></defs><path d="${d}" fill="none" stroke="${COLORS.teal}" stroke-width="1.5" stroke-dasharray="1 4" stroke-linecap="round" mask="url(#${id})"/></svg>`,
    );
    const reveal = trail.querySelector("mask path") as SVGPathElement;
    const plane = overlay(
      pill,
      '<svg viewBox="0 0 18 14" width="18" height="14"><path d="M17 7 1 1l3.4 6L1 13z" fill="#16121A"/><path d="M17 7 4.4 7 1 13z" fill="#00838A"/></svg>',
      { offsetPath: `path('${d}')`, offsetRotate: "auto", offsetAnchor: "50% 50%" } as Partial<CSSStyleDeclaration>,
    );
    const dur = 1500;
    const ease = "cubic-bezier(0.45, 0.05, 0.4, 1)";
    reveal.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: dur, easing: ease, fill: "forwards" });
    await plane.animate(
      [{ offsetDistance: "0%", opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.9 }, { offsetDistance: "100%", opacity: 0 }],
      { duration: dur, easing: ease },
    ).finished;
    plane.remove();
    await trail.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" }).finished;
    trail.remove();
  });
  return (
    <span {...props} ref={props.ref as React.Ref<HTMLSpanElement>} className={PILL} style={{ background: COLORS.teal }}>
      Travelopia
    </span>
  );
}

// ── code and AI: deletes and retypes itself ───────────────────────────────────
export function CodeAndAIPill() {
  const label = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const { props } = usePlay(async (pill) => {
    const el = label.current!;
    const text = "code and AI";
    el.style.minWidth = `${el.offsetWidth}px`;
    caret.current!.style.opacity = "1";
    for (let i = text.length; i >= 0; i--) {
      el.textContent = text.slice(0, i);
      await wait(28);
    }
    await wait(160);
    for (let i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      await wait(62);
    }
    caret.current!.style.opacity = "0";
    el.style.minWidth = "";
    const spark = overlay(pill, '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 0c.6 4.2 3.8 7.4 8 8-4.2.6-7.4 3.8-8 8-.6-4.2-3.8-7.4-8-8 4.2-.6 7.4-3.8 8-8z" fill="#FFC21A"/></svg>', {
      left: "auto",
      right: "-8px",
      top: "-10px",
    });
    await spark.animate(
      [
        { transform: "scale(0) rotate(0deg)", opacity: 1 },
        { transform: "scale(1.2) rotate(90deg)", opacity: 1, offset: 0.4 },
        { transform: "scale(0.9) rotate(140deg)", opacity: 0 },
      ],
      { duration: 700, easing: "ease-out" },
    ).finished;
    spark.remove();
  });
  return (
    <span {...props} ref={props.ref as React.Ref<HTMLSpanElement>} className={PILL} style={{ background: COLORS.ink }}>
      <span ref={label} className="inline-block">code and AI</span>
      <span ref={caret} aria-hidden="true" className="ml-[1px] inline-block h-[0.9em] w-[2px] translate-y-[0.12em] animate-pulse bg-[#FFC21A] opacity-0" />
    </span>
  );
}

// ── a workflow: design → code → review ✓ ──────────────────────────────────────
const STEPS = ["design", "code", "review"];
const STEP_IN = [
  "delay-[0ms]",
  "delay-[140ms]",
  "delay-[280ms]",
];
export function WorkflowPill() {
  const [on, setOn] = useState(false);
  const show = "[@media(hover:hover)]:group-hover/pill:translate-y-0 [@media(hover:hover)]:group-hover/pill:scale-100 [@media(hover:hover)]:group-hover/pill:opacity-100 group-focus-visible/pill:translate-y-0 group-focus-visible/pill:scale-100 group-focus-visible/pill:opacity-100 group-data-[on=true]/pill:translate-y-0 group-data-[on=true]/pill:scale-100 group-data-[on=true]/pill:opacity-100";
  return (
    <Link
      href="/works/helix"
      data-on={on}
      onTouchStart={() => setOn(true)}
      className={`${PILL} outline-none`}
      style={{ background: COLORS.pink }}
    >
      a workflow
      <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-0 z-10 mb-[6px] flex items-center gap-[4px] font-brand text-[12px] font-normal leading-[16px]">
        {STEPS.map((s, i) => (
          <span key={s} className="flex items-center gap-[4px]">
            {i > 0 && <span className={`translate-y-[4px] scale-75 text-[#8e8292] opacity-0 transition-all duration-300 ${STEP_IN[i]} ${show}`}>→</span>}
            <span
              className={`flex translate-y-[4px] scale-75 items-center gap-[4px] rounded-full border px-[8px] py-[2px] opacity-0 shadow-[0_2px_6px_rgba(30,5,37,0.12)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${STEP_IN[i]} ${show} ${
                i === 2 ? "border-[#12893D] bg-[#E9F7EE] text-[#12893D]" : "border-[#e6e1e8] bg-white text-[#16121A]"
              }`}
            >
              {s}
              {i === 2 && <span>✓</span>}
            </span>
          </span>
        ))}
      </span>
      <span className="sr-only"> (Helix on Claude Code case study)</span>
    </Link>
  );
}

// ── football: chipped into a little goal ──────────────────────────────────────
export function FootballPill() {
  const { props } = usePlay(async (pill) => {
    const w = pill.offsetWidth;
    const goal = overlay(
      pill,
      `<svg viewBox="0 0 30 20" width="30" height="20" overflow="visible"><defs><pattern id="gn" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0L4 4M4 0L0 4" stroke="#9aa3ad" stroke-width="0.6"/></pattern></defs><path d="M2 20V2h26v18" fill="url(#gn)" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M2 20V2h26v18" fill="none" stroke="#16121A" stroke-width="0.8" stroke-opacity="0.4"/></svg>`,
      { left: `${w - 12}px`, top: "-20px", transformOrigin: "50% 100%" },
    );
    await goal.animate([{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 220, easing: "cubic-bezier(0.34,1.56,0.64,1)", fill: "forwards" }).finished;
    const ball = overlay(
      pill,
      '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7.2" fill="#fff" stroke="#16121A" stroke-width="1.2"/><path d="M8 5.2 10.6 7.1 9.6 10.1H6.4L5.4 7.1Z" fill="#16121A"/><path d="M8 5.2V1.2M10.6 7.1 14.6 5.8M9.6 10.1 12 13.6M6.4 10.1 4 13.6M5.4 7.1 1.4 5.8" stroke="#16121A" stroke-width="0.9"/></svg>',
    );
    const path = hop(-4, -14, w - 1, -12, 26);
    await ball.animate(
      path.map(([x, y], i) => ({ transform: `translate(${x}px, ${y}px) rotate(${(i / (path.length - 1)) * 600}deg)` })),
      { duration: 620, easing: "cubic-bezier(0.3, 0.1, 0.5, 1)", fill: "forwards" },
    ).finished;
    // the net bulges, and it's in
    goal.animate([{ transform: "scale(1)" }, { transform: "scale(1.18, 1.08)" }, { transform: "scale(1)" }], { duration: 300, easing: "ease-out" });
    const shout = overlay(pill, '<span style="font: 500 12px/16px var(--font-brand), monospace; color: #12893D; letter-spacing: 1px">GOAL!</span>', {
      left: `${w - 18}px`,
      top: "-40px",
      lineHeight: "16px",
    });
    await shout.animate(
      [
        { transform: "translateY(6px) scale(0.6)", opacity: 0 },
        { transform: "translateY(0) scale(1.1)", opacity: 1, offset: 0.25 },
        { transform: "translateY(-2px) scale(1)", opacity: 1, offset: 0.8 },
        { transform: "translateY(-6px) scale(1)", opacity: 0 },
      ],
      { duration: 1000, easing: "ease-out" },
    ).finished;
    await Promise.all([
      ball.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }).finished,
      goal.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }).finished,
    ]);
    [ball, goal, shout].forEach((e) => e.remove());
  });
  return (
    <span {...props} ref={props.ref as React.Ref<HTMLSpanElement>} className={PILL} style={{ background: COLORS.green }}>
      football
    </span>
  );
}

// ── badminton: a rally ────────────────────────────────────────────────────────
export function BadmintonPill() {
  const { props } = usePlay(async (pill) => {
    const w = pill.offsetWidth;
    // nose (the cork) at the right, feathers trailing left
    const shuttle = overlay(
      pill,
      '<svg viewBox="0 0 18 12" width="18" height="12"><path d="M12 3.4 1 0.6v10.8l11-2.8z" fill="#fff" stroke="#16121A" stroke-width="0.8" stroke-linejoin="round"/><path d="M4.6 1.6v8.8M8.4 2.5v7" stroke="#16121A" stroke-width="0.5" stroke-opacity="0.5"/><circle cx="14" cy="6" r="3.4" fill="#F2541B" stroke="#16121A" stroke-width="0.8"/></svg>',
      { offsetAnchor: "50% 50%" } as Partial<CSSStyleDeclaration>,
    );
    const left = -6;
    const right = w - 10;
    const y = -12;
    const legs = [hop(left, y, right, y, 22, 10), hop(right, y, left, y, 18, 10), hop(left, y, right, y, 24, 10)];
    const frames: Keyframe[] = [];
    legs.forEach((leg, li) =>
      leg.forEach(([x, py], i) => {
        if (li > 0 && i === 0) return;
        const next = leg[Math.min(i + 1, leg.length - 1)];
        const prev = leg[Math.max(i - 1, 0)];
        const ang = (Math.atan2(next[1] - prev[1], next[0] - prev[0]) * 180) / Math.PI;
        frames.push({ transform: `translate(${x}px, ${py}px) rotate(${ang}deg)` });
      }),
    );
    // then it drops onto the pill and stops
    frames.push({ transform: `translate(${right + 6}px, ${y + 4}px) rotate(110deg)` });
    await shuttle.animate(frames, { duration: 1900, easing: "linear", fill: "forwards" }).finished;
    await shuttle.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }).finished;
    shuttle.remove();
  });
  return (
    <span {...props} ref={props.ref as React.Ref<HTMLSpanElement>} className={`${PILL} !text-[#16121A]`} style={{ background: COLORS.yellow }}>
      badminton
    </span>
  );
}

// ── The sign-off ──────────────────────────────────────────────────────────────
const SIGN_OFF = ["till", "God", "calls", "upon", "my", "name."];
const TAPE = ["#034694", "#6CABDD", "#DBA111", "#034694", "#0A2C6B"];

export function ChelseaSignOff() {
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const heart = useRef<HTMLSpanElement>(null);
  const burst = useRef<HTMLSpanElement>(null);
  const { props } = usePlay(async () => {
    // a stadium wave along the line…
    words.current.forEach((w, i) =>
      w?.animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(-10px) rotate(-2deg)" }, { transform: "translateY(0)" }],
        { duration: 420, delay: i * 70, easing: "cubic-bezier(0.3, 0, 0.3, 1)" },
      ),
    );
    // …the heart beats…
    heart.current?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(0.9)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }],
      { duration: 600, delay: words.current.length * 70, easing: "ease-out" },
    );
    await wait(words.current.length * 70);
    // …and the ticker tape goes up
    const box = burst.current!;
    const pieces = Array.from({ length: 34 }, (_, i) => {
      const p = document.createElement("span");
      const tall = Math.random() > 0.4;
      Object.assign(p.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: tall ? "4px" : "6px",
        height: tall ? "10px" : "6px",
        borderRadius: tall ? "1px" : "50%",
        background: TAPE[i % TAPE.length],
        pointerEvents: "none",
      });
      box.appendChild(p);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const v = 70 + Math.random() * 90;
      const dx = Math.cos(ang) * v;
      const dy = Math.sin(ang) * v;
      const spin = (Math.random() - 0.5) * 900;
      return p.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${spin * 0.5}deg)`, opacity: 1, offset: 0.4 },
          { transform: `translate(${dx * 1.4}px, ${dy * 0.4 + 90}px) rotate(${spin}deg)`, opacity: 0 },
        ],
        { duration: 1300 + Math.random() * 600, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)" },
      ).finished.then(() => p.remove());
    });
    await Promise.all(pieces);
  }, 200);

  return (
    <p className="font-heading text-[28px] font-normal leading-[36px] tracking-[0px] text-heading md:text-[36px] md:leading-[44px] md:tracking-[-1px]">
      <span {...props} ref={props.ref as React.Ref<HTMLSpanElement>} className="group/pill cursor-pointer select-none">
        <span
          ref={(el) => {
            words.current[0] = el;
          }}
          className="inline-block rounded-full px-[12px] text-white"
          style={{ background: COLORS.chelsea }}
        >
          Chelsea
        </span>{" "}
        {SIGN_OFF.map((w, i) => (
          <span key={w}>
            <span
              ref={(el) => {
                words.current[i + 1] = el;
              }}
              className="inline-block"
            >
              {w}
            </span>{" "}
          </span>
        ))}
        <span ref={heart} className="relative inline-block" role="img" aria-label="blue heart">
          💙
          <span ref={burst} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2" />
        </span>
      </span>
    </p>
  );
}
