"use client";

// ── The sheet with its tear-off stub ──────────────────────────────────────────
// The flat résumé, with a stub along the bottom below a perforated line: "Tear for a
// copy". Pull the stub down and it tears along the perforation from the left, the
// torn part bending away at the tear front as you pull, a crackle at each hole it
// passes. Let go early and it settles back; pull far enough, or just tap it, and the
// tear runs on to the end by itself. The stub comes free with a snap, drops away with
// a little spin, the copy downloads, and a fresh stub slides in.
//
// How it's drawn: three copies of the sheet, clipped along one jagged torn line so
// they fit together exactly. The body (above the line), the untorn stub (right of the
// tear front) and the torn flap (left of it, hinged at the tear front). Torn edges
// show a pale fibre line, as torn paper does.

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { Grain, PAPER, PERF_GAP, STUB_H, TOP_EDGE } from "./paper";
import { clamp01, lerp, spring } from "./motion";
import { restockSound, tearFree, tearRip, tearTick } from "./paperSound";

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

/** The torn line: wanders a pixel either side of the perforation, dipping through each hole. */
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
  return lerp(pts[i][1], pts[i + 1][1], t);
};
const polygon = (pts: Pt[]) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(", ")})`;

const RESTOCK = spring(220, 20);
const SETTLE_MS = 260;
const FALL_MS = 1000;

export default function TearSheet({
  Sheet,
  onTorn,
  onTearing,
}: {
  Sheet: () => ReactNode;
  /** The stub came free: download now */
  onTorn: () => void;
  /** Tearing started (true) or a fresh stub is back (false) */
  onTearing: (tearing: boolean) => void;
}) {
  const body = useRef<HTMLDivElement>(null);
  const untorn = useRef<HTMLDivElement>(null);
  const flapWrap = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const fibres = useRef<(SVGPathElement | null)[]>([]);
  const hit = useRef<HTMLButtonElement>(null);
  const geo = useRef({ w: 0, h: 0, perf: 0, line: [] as Pt[] });
  const state = useRef<"idle" | "pulling" | "running" | "falling" | "gone">("idle");
  const progress = useRef(0);
  const holes = useRef(0);
  const raf = useRef(0);
  const cb = useRef({ onTorn, onTearing });
  cb.current = { onTorn, onTearing };

  /** Lays the three pieces out for a tear that has run p of the way across. */
  const render = (p: number, extra = { x: 0, y: 0, spin: 0 }) => {
    const { w, h, line } = geo.current;
    if (!w) return;
    progress.current = p;
    const xf = p * w; // the tear front
    const yf = yAt(line, xf);
    const below = h + 60;
    const between = (x0: number, x1: number) => line.filter(([x]) => x > x0 && x < x1);

    // Untorn stub, right of the front
    untorn.current!.style.clipPath = polygon([[xf, yAt(line, xf)], ...between(xf, w), [w + 40, yAt(line, w)], [w + 40, below], [xf, below]]);
    // Torn flap, left of the front: hangs from the front, dropping further the more is torn
    const flapPts: Pt[] = p > 0 ? [[-40, yAt(line, 0)], ...between(-1, xf + 1), [xf + 1, yAt(line, xf + 1)], [xf + 1, below], [-40, below]] : [[0, 0], [0, 0], [0, 0]];
    flap.current!.style.clipPath = polygon(flapPts);
    const tilt = p > 0 ? 2 + 10 * Math.pow(p, 0.8) : 0;
    flapWrap.current!.style.transformOrigin = `${xf}px ${yf}px`;
    flapWrap.current!.style.transform = `translate(${extra.x}px, ${p * 3 + extra.y}px) rotate(${-(tilt + extra.spin)}deg)`;
    fibres.current.forEach((f) => f && (f.style.opacity = String(clamp01(p * 6))));

    // A crackle each time the front passes a hole
    const passed = Math.floor(xf / PERF_GAP);
    if (state.current === "pulling" && passed > holes.current) tearTick(0.8);
    holes.current = passed;
  };

  // Measure, and draw the torn line to fit
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const perf = h - STUB_H;
      const line = tornLine(w, perf);
      geo.current = { w, h, perf, line };
      el.style.clipPath = polygon([[-40, -40], [w + 40, -40], [w + 40, yAt(line, w) + 0.6], ...[...line].reverse().map(([x, y]) => [x, y + 0.6] as Pt), [-40, yAt(line, 0) + 0.6]]);
      const d = `M${line.map(([x, y]) => `${x} ${y.toFixed(2)}`).join(" L")}`;
      fibres.current.forEach((f) => f?.setAttribute("d", d));
      if (state.current === "idle") render(0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const animate = (from: number, to: number, ms: number, ease: (t: number) => number, done?: () => void) => {
    cancelAnimationFrame(raf.current);
    const begin = performance.now();
    const step = () => {
      const t = clamp01((performance.now() - begin) / ms);
      render(lerp(from, to, ease(t)));
      if (t < 1) raf.current = requestAnimationFrame(step);
      else done?.();
    };
    raf.current = requestAnimationFrame(step);
  };

  /** The tear runs on to the end by itself, speeding up, catching slightly at holes. */
  const runOut = () => {
    if (state.current === "running" || state.current === "falling" || state.current === "gone") return;
    if (state.current === "idle") cb.current.onTearing(true);
    state.current = "running";
    const from = progress.current;
    const ms = 140 + 620 * (1 - from);
    tearRip(ms);
    const stutter = (t: number) => Math.pow(t, 1.55) + 0.012 * Math.sin(t * 46) * (1 - t);
    animate(from, 1, ms, stutter, fall);
  };

  /** Free: drops away with a little spin, fading as it goes. */
  const fall = () => {
    state.current = "falling";
    tearFree();
    cb.current.onTorn();
    const begin = performance.now();
    const step = () => {
      const t = performance.now() - begin;
      const k = clamp01(t / FALL_MS);
      render(1, { x: 0.05 * t, y: 0.12 * t + 0.0011 * t * t, spin: 0.018 * t + 0.000012 * t * t });
      flapWrap.current!.style.opacity = String(clamp01((FALL_MS - t) / 320));
      if (k < 1) raf.current = requestAnimationFrame(step);
      else restock();
    };
    raf.current = requestAnimationFrame(step);
  };

  /** A fresh stub slides in from under the sheet. */
  const restock = () => {
    state.current = "gone";
    window.setTimeout(() => {
      flapWrap.current!.style.opacity = "1";
      render(0);
      restockSound();
      untorn.current?.animate(
        [
          { transform: "translateY(22px)", opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        { duration: RESTOCK.duration, easing: RESTOCK.easing, fill: "backwards" },
      );
      state.current = "idle";
      cb.current.onTearing(false);
    }, 650);
  };

  // ── Pointer ─────────────────────────────────────────────────────────────────

  const drag = useRef<{ x: number; y: number; at: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (state.current !== "idle") return;
    try {
      hit.current?.setPointerCapture(e.pointerId);
    } catch {
      // A pointer that's already gone can't be captured; the drag still works
    }
    drag.current = { x: e.clientX, y: e.clientY, at: performance.now(), moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      cancelAnimationFrame(raf.current);
      state.current = "pulling";
      cb.current.onTearing(true);
    }
    // Pulling down tears it; pulling sideways helps a little
    render(clamp01((Math.max(0, dy) + 0.35 * Math.abs(dx)) / 140));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved || progress.current > 0.38) return runOut();
    // Not far enough: it settles back together
    animate(progress.current, 0, SETTLE_MS, (t) => 1 - Math.pow(1 - t, 3), () => {
      state.current = "idle";
      cb.current.onTearing(false);
    });
  };
  // Hovering lifts the corner a touch, so it reads as something to pull
  const peek = (on: boolean) => {
    if (state.current !== "idle" || drag.current) return;
    animate(progress.current, on ? 0.035 : 0, 220, (t) => 1 - Math.pow(1 - t, 3));
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
  const copy = (
    <>
      <Grain />
      <Sheet />
    </>
  );

  return (
    <div className="relative" style={{ filter: "drop-shadow(0 1px 1.5px rgba(48,40,26,0.1)) drop-shadow(0 12px 18px rgba(48,40,26,0.15))" }}>
      <div ref={body} className="relative" style={{ ...TOP_EDGE, backgroundColor: PAPER }}>
        {copy}
        {fibre(0)}
      </div>
      <div ref={untorn} className="absolute inset-0" style={{ backgroundColor: PAPER }}>
        {copy}
      </div>
      <div ref={flapWrap} className="absolute inset-0" style={{ filter: "drop-shadow(0 3px 4px rgba(48,40,26,0.16))", willChange: "transform" }}>
        <div ref={flap} className="absolute inset-0" style={{ backgroundColor: PAPER }}>
          {copy}
          {fibre(1)}
        </div>
      </div>
      <button
        ref={hit}
        type="button"
        aria-label="Tear off a copy (downloads the résumé PDF)"
        className="absolute inset-x-0 bottom-0 cursor-grab touch-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#9D136A]/40"
        style={{ height: STUB_H }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => peek(true)}
        onPointerLeave={() => peek(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            runOut();
          }
        }}
      />
    </div>
  );
}
