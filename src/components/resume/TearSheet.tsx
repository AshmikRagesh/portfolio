"use client";

// ── The sheet with its tear-off stub ──────────────────────────────────────────
// The flat résumé, with a stub along the bottom below a perforated line: "Tear to
// download". A little is already torn at the left corner. Drag it from left to right
// and the tear follows your hand along the perforation, the torn part hanging down from
// the tear front. Let go early and it lies back down; drag past 60%, and the tear runs
// on by itself with your hand's momentum, catching slightly at each hole. (Enter or
// Space tears it from the keyboard; a tap just jiggles the corner.) The stub comes free, falls off
// the bottom of the screen with a turn, and then the download starts. A fresh stub
// slides in afterwards.
//
// Sound follows the tear itself: a rasp whose loudness and pitch track how fast the
// tear front is moving, with a crackle at each perforation it passes.
//
// How it's drawn: the body (above the torn line) is drawn once and never repaints while
// you tear. The stub lives in its own small strip along the bottom, as two pieces cut
// along the same torn line: the untorn part (right of the tear front) and the torn flap
// (left of it, hinged at the front). Only that strip repaints, once per frame.

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { Grain, PAPER, PERF_GAP, STUB_H, TOP_EDGE } from "./paper";
import { clamp01, spring } from "./motion";
import { restockSound, tearFree, tearTick, tearVoice, type TearVoice } from "./paperSound";

type Pt = [number, number];

// Seeded, so the torn line is the same shape every time the sheet is drawn
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The torn line, a point every 2px: wanders a pixel either side of the perforation, dipping at each hole. */
function tornLine(width: number, y: number): Pt[] {
  const rand = seeded(11);
  const pts: Pt[] = [];
  for (let x = 0; x <= width + 0.01; x += 2) {
    const hole = (x - PERF_GAP / 2) % PERF_GAP === 0;
    pts.push([x, y + (rand() - 0.5) * 1.6 + (hole ? 0.9 : 0)]);
  }
  return pts;
}

const yAt = (pts: Pt[], x: number) => {
  if (x <= 0) return pts[0][1];
  const i = Math.min(pts.length - 2, Math.floor(x / 2));
  const t = clamp01((x - pts[i][0]) / 2);
  return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
};
const polygon = (pts: Pt[]) => {
  let s = "polygon(";
  for (let i = 0; i < pts.length; i++) s += `${i ? "," : ""}${pts[i][0].toFixed(1)}px ${pts[i][1].toFixed(1)}px`;
  return s + ")";
};

// The strip the stub lives in starts this far above the perforation
const PAD = 10;
const RESTOCK = spring(220, 20);
// Tear dynamics, in sheet-widths per second
const FOLLOW = 0.3; // how quickly the tear catches up with your hand, per frame
const RUN_START = 0.7;
const RUN_ACCEL = 3.4;
const RUN_MAX = 3.6;
const HOLE_CATCH = 0.94; // a little speed lost at each perforation
// A little is torn already at the left corner, so it's plain what to do with it
const REST = 0.09;
// Let go past this far across and the tear finishes by itself
const RUN_AT = 0.6;

type Mode = "idle" | "pulling" | "settling" | "running" | "falling" | "gone";

export default function TearSheet({
  Sheet,
  onTorn,
  onTearing,
}: {
  Sheet: () => ReactNode;
  /** The stub has fallen off the screen: download now */
  onTorn: () => void;
  /** Tearing started (true) or a fresh stub is back (false) */
  onTearing: (tearing: boolean) => void;
}) {
  const body = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const untorn = useRef<HTMLDivElement>(null);
  const flapWrap = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const insides = useRef<(HTMLDivElement | null)[]>([]);
  const fibres = useRef<(SVGPathElement | null)[]>([]);
  const hit = useRef<HTMLButtonElement>(null);

  const geo = useRef({ w: 0, h: 0, top: 0, boxH: 0, line: [] as Pt[] });
  const sim = useRef({ mode: "idle" as Mode, p: 0, target: 0, v: 0, holes: 0, drawn: -1, droop: 0, droopTo: 0, drawnDroop: 0, fallT: 0, fallX: 0, fallY: 0, spin: 0 });
  const voice = useRef<TearVoice | null>(null);
  const cb = useRef({ onTorn, onTearing });
  cb.current = { onTorn, onTearing };

  /** Lays the stub out for a tear that has run p of the way across. */
  const draw = (p: number) => {
    const { w, boxH, line } = geo.current;
    if (!w || !untorn.current || !flap.current || !flapWrap.current) return;
    const xf = p * w;
    const yf = yAt(line, xf);
    const below = boxH + 80;
    const i0 = Math.max(0, Math.ceil(xf / 2));
    const inner = line.slice(i0, line.length);
    untorn.current.style.clipPath = polygon([[xf, yf], ...inner, [w + 40, yAt(line, w)], [w + 40, below], [xf, below]]);
    if (p > 0) {
      const torn = line.slice(0, Math.floor((xf + 1) / 2) + 1);
      flap.current.style.clipPath = polygon([[-40, line[0][1]], ...torn, [xf + 1, yAt(line, xf + 1)], [xf + 1, below], [-40, below]]);
    } else {
      flap.current.style.clipPath = "polygon(0 0, 0 0, 0 0)";
    }
    const s = sim.current;
    // The torn part hangs further the more is torn; your hand lifting or lowering it adds a little
    const tilt = p > 0 ? 2 + 10 * Math.pow(p, 0.8) + s.droop : 0;
    flapWrap.current.style.transformOrigin = `${xf}px ${yf}px`;
    flapWrap.current.style.transform = `translate(${s.fallX}px, ${p * 3 + s.fallY}px) rotate(${-(tilt + s.spin)}deg)`;
    const fibre = String(clamp01(p * 6));
    fibres.current.forEach((f) => f && (f.style.opacity = fibre));
    // The body's torn edge only shows where the tear has been
    const bodyEdge = fibres.current[0]?.ownerSVGElement;
    if (bodyEdge) bodyEdge.style.clipPath = `inset(0 ${Math.max(0, w - xf).toFixed(1)}px 0 -10px)`;
  };

  // Measure, and cut the torn line to fit
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const perf = h - STUB_H;
      const top = perf - PAD;
      const full = tornLine(w, perf);
      const line = full.map(([x, y]) => [x, y - top] as Pt);
      geo.current = { w, h, top, boxH: h - top, line };
      el.style.clipPath = polygon([[-40, -40], [w + 40, -40], [w + 40, yAt(full, w) + 0.6], ...[...full].reverse().map(([x, y]) => [x, y + 0.6] as Pt), [-40, full[0][1] + 0.6]]);
      if (strip.current) {
        strip.current.style.top = `${top}px`;
        strip.current.style.height = `${h - top}px`;
      }
      insides.current.forEach((d) => d && ((d.style.top = `${-top}px`), (d.style.height = `${h}px`)));
      const d = `M${line.map(([x, y]) => `${x} ${y.toFixed(2)}`).join(" L")}`;
      fibres.current.forEach((f) => f?.setAttribute("d", d));
      sim.current.drawn = -1;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One frame loop drives everything: following your hand, running out, falling
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let scroller: HTMLElement | null = null;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      const before = s.p;

      if (s.mode === "pulling" || s.mode === "settling" || s.mode === "idle") {
        s.p += (s.target - s.p) * (1 - Math.pow(1 - FOLLOW, dt * 60));
        if (Math.abs(s.target - s.p) < 0.0004) s.p = s.target;
        if (s.mode === "settling" && s.p === s.target) {
          s.mode = "idle";
          voice.current?.stop();
          voice.current = null;
          cb.current.onTearing(false);
        }
        if (s.mode === "pulling" && s.p >= 0.995) startRun();
      } else if (s.mode === "running") {
        s.v = Math.min(RUN_MAX, s.v + RUN_ACCEL * dt);
        s.p = Math.min(1, s.p + s.v * dt);
        if (s.p >= 1) {
          s.mode = "falling";
          s.fallT = 0;
          tearFree();
          voice.current?.stop();
          voice.current = null;
          // A phone's scrolling sheet would grow to fit the falling stub: hold it still
          scroller = hit.current?.closest<HTMLElement>(".overflow-y-auto") ?? null;
          if (scroller) scroller.style.overflowY = "hidden";
        }
      } else if (s.mode === "falling") {
        // Drops away under gravity with a slow turn, until it's below the screen
        s.fallT += dt * 1000;
        const t = s.fallT;
        s.fallX = 0.05 * t;
        s.fallY = 0.15 * t + 0.0016 * t * t;
        s.spin = 0.02 * t + 0.00001 * t * t;
        s.drawn = -1;
        const top = flapWrap.current?.getBoundingClientRect().top ?? Infinity;
        if (top > window.innerHeight + 10 || t > 1800) {
          s.mode = "gone";
          if (scroller) scroller.style.overflowY = "";
          if (flapWrap.current) flapWrap.current.style.visibility = "hidden";
          cb.current.onTorn();
          window.setTimeout(restock, 700);
        }
      }

      s.droop += (s.droopTo - s.droop) * (1 - Math.pow(0.8, dt * 60));
      if (Math.abs(s.droopTo - s.droop) < 0.01) s.droop = s.droopTo;

      // Each perforation the front passes: a crackle, and a slight catch while running
      const passed = Math.floor((s.p * geo.current.w) / PERF_GAP);
      if (passed > s.holes && (s.mode === "pulling" || s.mode === "running")) {
        const speed = Math.abs(s.p - before) / Math.max(dt, 0.001);
        tearTick(Math.min(1, 0.35 + speed * 0.4));
        if (s.mode === "running") s.v *= HOLE_CATCH;
      }
      s.holes = passed;
      voice.current?.set(Math.abs(s.p - before) / Math.max(dt, 0.001));

      if (s.p !== s.drawn || s.droop !== s.drawnDroop) {
        draw(s.p);
        s.drawn = s.p;
        s.drawnDroop = s.droop;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Once it has landed, the first few holes give way at the left corner
    const starter = window.setTimeout(starterTear, 900);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(starter);
      voice.current?.stop();
      if (scroller) scroller.style.overflowY = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** The small tear at the left corner that shows where to start. */
  const starterTear = () => {
    const s = sim.current;
    if (s.mode !== "idle") return;
    s.target = REST;
    tearTick(0.5);
    window.setTimeout(() => tearTick(0.4), 90);
  };

  const begin = () => {
    if (!voice.current) voice.current = tearVoice();
    cb.current.onTearing(true);
  };

  /** The tear runs on to the end by itself. */
  const startRun = () => {
    const s = sim.current;
    if (s.mode === "running" || s.mode === "falling" || s.mode === "gone") return;
    if (s.mode === "idle") begin();
    s.v = Math.max(RUN_START, s.v);
    s.mode = "running";
  };

  /** A fresh stub slides in from under the sheet. */
  const restock = () => {
    const s = sim.current;
    Object.assign(s, { mode: "idle", p: 0, target: 0, v: 0, holes: 0, drawn: -1, droop: 0, droopTo: 0, fallT: 0, fallX: 0, fallY: 0, spin: 0 });
    if (flapWrap.current) flapWrap.current.style.visibility = "visible";
    draw(0);
    restockSound();
    untorn.current?.animate(
      [
        { transform: "translateY(22px)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: RESTOCK.duration, easing: RESTOCK.easing, fill: "backwards" },
    );
    cb.current.onTearing(false);
    window.setTimeout(starterTear, RESTOCK.duration);
  };

  /** A tap, not a drag: the torn corner jiggles, as a hint to drag it. */
  const jiggle = () => {
    const s = sim.current;
    s.droopTo = 7;
    window.setTimeout(() => (s.droopTo = -2), 140);
    window.setTimeout(() => (s.droopTo = 0), 300);
  };

  // ── Pointer ─────────────────────────────────────────────────────────────────

  const drag = useRef<{ x: number; y: number; moved: boolean; from: number; width: number } | null>(null);
  const grabbing = (on: boolean) => {
    document.documentElement.style.cursor = on ? "grabbing" : "";
    if (hit.current) hit.current.style.cursor = on ? "grabbing" : "grab";
  };
  const onDown = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.mode !== "idle") return;
    try {
      hit.current?.setPointerCapture(e.pointerId);
    } catch {
      // A pointer that's already gone can't be captured; the drag still works
    }
    grabbing(true);
    drag.current = { x: e.clientX, y: e.clientY, moved: false, from: Math.max(REST, s.p), width: hit.current?.getBoundingClientRect().width || 1 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const s = sim.current;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 3) return;
    if (!d.moved) {
      d.moved = true;
      s.mode = "pulling";
      begin();
    }
    if (s.mode !== "pulling") return;
    // The tear front follows your hand along the line, left to right
    s.target = Math.max(REST, Math.min(1, d.from + dx / d.width));
    s.droopTo = Math.max(-3, Math.min(8, dy * 0.08));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    grabbing(false);
    if (!d) return;
    const s = sim.current;
    s.droopTo = 0;
    if (!d.moved) return jiggle();
    if (s.mode !== "pulling") return;
    if (Math.max(s.p, s.target) > RUN_AT) {
      // Carries the speed of your hand into the rest of the tear
      s.v = Math.max(s.v, (s.target - s.p) * 6);
      return startRun();
    }
    // Not far enough: it lies back down along the line
    s.mode = "settling";
    s.target = REST;
  };

  const fibre = (i: number) => (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <path
        ref={(el) => {
          fibres.current[i] = el;
        }}
        fill="none"
        stroke="#fffcf3"
        strokeWidth="1.6"
        strokeDasharray="0.8 1.2 2 1"
        strokeLinecap="round"
        style={{ opacity: 0 }}
      />
    </svg>
  );
  // A copy of the sheet placed so its stub shows in the strip
  const inside = (i: number) => (
    <div
      ref={(el) => {
        insides.current[i] = el;
      }}
      className="absolute inset-x-0"
    >
      <Grain />
      <Sheet />
    </div>
  );

  return (
    <div className="relative">
      {/* The body: drawn once, its shadow included */}
      <div style={{ filter: "drop-shadow(0 1px 1.5px rgba(48,40,26,0.1)) drop-shadow(0 12px 18px rgba(48,40,26,0.15))" }}>
        <div ref={body} className="relative" style={{ ...TOP_EDGE, backgroundColor: PAPER }}>
          <Grain />
          <Sheet />
        </div>
      </div>
      {/* The stub strip: the only part that moves */}
      <div ref={strip} className="pointer-events-none absolute inset-x-0" style={{ top: 0 }}>
        {fibre(0)}
        <div ref={untorn} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: PAPER }}>
          {inside(0)}
        </div>
        <div ref={flapWrap} className="absolute inset-0" style={{ filter: "drop-shadow(0 3px 4px rgba(48,40,26,0.16))", willChange: "transform" }}>
          <div ref={flap} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: PAPER, clipPath: "polygon(0 0, 0 0, 0 0)" }}>
            {inside(1)}
            {fibre(1)}
          </div>
        </div>
      </div>
      <button
        ref={hit}
        type="button"
        aria-label="Tear off the stub to download the résumé (PDF)"
        className="absolute inset-x-0 bottom-0 touch-none outline-none focus-visible:ring-2 focus-visible:ring-[#9D136A]/40"
        style={{ height: STUB_H, cursor: "grab" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startRun();
          }
        }}
      />
    </div>
  );
}
