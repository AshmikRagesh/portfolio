"use client";

// ── The sheet with its tear-off stub ──────────────────────────────────────────
// The flat résumé, with a stub along the bottom below a perforated line: "Tear to
// download". A little is already torn at the left corner. Drag it from left to right
// and the tear follows your hand along the perforation, the torn part hanging down from
// the tear front. Let go early and it lies back down; drag past 60%, or flick it, and
// the tear runs on by itself with your hand's momentum, catching slightly at each hole. (Enter or
// Space tears it from the keyboard; a tap jiggles the torn corner as a hint.)
//
// Once the tear reaches the end, the stub lies flat where it is and the résumé itself
// (everything above the perforation) comes away: a small pop as the tension lets go,
// then it falls, swaying and tipping as a big sheet does, off the bottom of the screen,
// showing the pile underneath. Then the PDF downloads, and a fresh résumé springs back
// into place with a new stub.
//
// Physics, all stepped per frame in small substeps:
//   tear front   a critically damped spring after your hand: no lag, no overshoot
//   hanging part a damped spring for its angle, so it sways a little as you speed up or
//                stop, and hangs further the more of it is torn
//   fall         the résumé under gravity against air drag, with a sideways sway, a
//                rocking turn and a 3D tip that build up as it drops
//
// Sound follows the tear itself: a rasp whose loudness and pitch track how fast the
// tear front is moving, with a crackle at each perforation it passes.
//
// How it's drawn: the body (above the torn line) is drawn once and never repaints while
// you tear. The stub lives in its own small strip along the bottom, as two pieces cut
// along the same torn line: the untorn part (right of the tear front) and the torn part
// (left of it, hinged at the front). Only that strip repaints, and only what changed.

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

// A point every 4px along the torn line: half the clip-path points of every 2px, which
// is what each frame of the tear redraws, with no visible difference at this scale
const STEP = 4;

/** The torn line: wanders a pixel either side of the perforation, dipping at each hole. */
function tornLine(width: number, y: number): Pt[] {
  const rand = seeded(11);
  const pts: Pt[] = [];
  for (let x = 0; x <= width + 0.01; x += STEP) {
    const hole = (x - PERF_GAP / 2) % PERF_GAP === 0;
    pts.push([x, y + (rand() - 0.5) * 1.6 + (hole ? 0.9 : 0)]);
  }
  return pts;
}

const yAt = (pts: Pt[], x: number) => {
  if (x <= 0) return pts[0][1];
  const i = Math.min(pts.length - 2, Math.floor(x / STEP));
  const t = clamp01((x - pts[i][0]) / STEP);
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

// A little is torn already at the left corner, so it's plain what to do with it
const REST = 0.09;
// Let go past this far across and the tear finishes by itself
const RUN_AT = 0.6;

// Tear front: a critically damped spring after the hand (stiffness, and damping for ζ = 1)
const FRONT_K = 520;
const FRONT_C = 2 * Math.sqrt(FRONT_K);
// Running out: sheet-widths per second. It picks up from your hand's speed and gathers
// pace evenly; the catch at the perforations is slight, so it reads as texture, not stutter.
const RUN_START = 0.9;
const RUN_ACCEL = 2.6;
const RUN_MAX = 3.2;
const HOLE_CATCH = 0.985;
// A quick flick finishes the tear even short of RUN_AT (widths per second, once past this far)
const FLICK_SPEED = 1.4;
const FLICK_FROM = 0.22;

// The hanging part's angle: a damped spring, so it sways a little and settles (ζ ≈ 0.45;
// lighter damping made it wobble on every change of speed)
const HANG_K = 150;
const HANG_C = 2 * 0.45 * Math.sqrt(HANG_K);

// The résumé falling, in sheet px and seconds. A whole sheet is big and falls faster
// than a scrap; air only takes the edge off (terminal speed ≈ 2700 px/s).
const GRAVITY = 6200;
const DRAG = 2.3;
const POP = -90; // the little lift as the tension lets go
const SWAY = 26; // sideways, px
const SWAY_HZ = 1.05;
const ROCK = 5; // degrees of rocking turn
const TUMBLE = 16; // degrees of tipping forwards and back
const SPIN = 4; // a slow overall turn, degrees per second
const FALL_MAX = 3;
const BACK = spring(170, 19); // the fresh résumé settling into place

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
  const sheet = useRef<HTMLDivElement>(null); // the body with its shadow: what falls
  const strip = useRef<HTMLDivElement>(null);
  const untorn = useRef<HTMLDivElement>(null);
  const flapWrap = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const insides = useRef<(HTMLDivElement | null)[]>([]);
  const fibres = useRef<(SVGPathElement | null)[]>([]);
  const hit = useRef<HTMLButtonElement>(null);

  const geo = useRef({ w: 0, h: 0, top: 0, boxH: 0, line: [] as Pt[] });
  const fresh = () => ({
    mode: "idle" as Mode,
    p: 0, // tear front, 0..1 across
    pv: 0, // its speed, widths per second
    target: 0,
    run: 0,
    angle: 0, // the hanging part, degrees
    angleV: 0,
    droop: 0, // your hand's up/down, degrees
    holes: 0,
    drawnP: -1,
    drawnAngle: NaN,
    // falling
    t: 0,
    y: 0,
    vy: 0,
  });
  const sim = useRef(fresh());
  const voice = useRef<TearVoice | null>(null);
  const cb = useRef({ onTorn, onTearing });
  cb.current = { onTorn, onTearing };

  /** Cuts the two stub pieces along the torn line for a tear p of the way across. */
  const cut = (p: number) => {
    const { w, boxH, line } = geo.current;
    if (!w || !untorn.current || !flap.current) return;
    const xf = p * w;
    const yf = yAt(line, xf);
    const below = boxH + 80;
    untorn.current.style.clipPath = polygon([[xf, yf], ...line.slice(Math.max(0, Math.ceil(xf / STEP))), [w + 40, yAt(line, w)], [w + 40, below], [xf, below]]);
    flap.current.style.clipPath =
      p > 0 ? polygon([[-40, line[0][1]], ...line.slice(0, Math.floor((xf + 1) / STEP) + 1), [xf + 1, yAt(line, xf + 1)], [xf + 1, below], [-40, below]]) : "polygon(0 0, 0 0, 0 0)";
    const fibre = String(clamp01(p * 6));
    fibres.current.forEach((f) => f && (f.style.opacity = fibre));
    // The body's torn edge only shows where the tear has been
    const bodyEdge = fibres.current[0]?.ownerSVGElement;
    if (bodyEdge) bodyEdge.style.clipPath = `inset(0 ${Math.max(0, w - xf).toFixed(1)}px 0 -10px)`;
    if (flapWrap.current) flapWrap.current.style.transformOrigin = `${xf.toFixed(1)}px ${yf.toFixed(1)}px`;
  };

  /** Hangs the torn part from the tear front at its current angle. */
  const hang = (p: number, angle: number) => {
    if (flapWrap.current) flapWrap.current.style.transform = `translateY(${(p * 3).toFixed(2)}px) rotate(${(-angle).toFixed(3)}deg)`;
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
      sim.current.drawnP = -1;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One frame loop drives everything
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let scroller: HTMLElement | null = null;
    let frameNo = 0;

    const step = (h: number) => {
      const s = sim.current;
      if (s.mode === "running") {
        s.run = Math.min(RUN_MAX, s.run + RUN_ACCEL * h);
        s.p = Math.min(1, s.p + s.run * h);
        s.pv = s.run;
      } else if (s.mode !== "falling" && s.mode !== "gone") {
        const a = FRONT_K * (s.target - s.p) - FRONT_C * s.pv;
        s.pv += a * h;
        s.p += s.pv * h;
      }
      // The hanging part: sags with its length, trails when the tear speeds up, follows your hand
      const hangTo =
        s.mode === "falling" || s.mode === "gone" ? 0 : s.p > 0.001 ? 2 + 10 * Math.pow(s.p, 0.8) + s.droop + Math.max(-4, Math.min(7, s.pv * 2.4)) : 0;
      const aa = HANG_K * (hangTo - s.angle) - HANG_C * s.angleV;
      s.angleV += aa * h;
      s.angle += s.angleV * h;
      if (s.mode === "falling") {
        s.t += h;
        s.vy += (GRAVITY - DRAG * s.vy) * h;
        s.y += s.vy * h;
      }
    };

    const frame = (now: number) => {
      // Real time even on a slow frame (substeps keep the springs stable)
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const s = sim.current;
      const before = s.p;
      const subs = Math.max(4, Math.ceil(dt / 0.006));
      for (let i = 0; i < subs; i++) step(dt / subs);

      if (s.mode === "settling" && Math.abs(s.p - s.target) < 0.0008 && Math.abs(s.pv) < 0.02) {
        s.mode = "idle";
        voice.current?.stop();
        voice.current = null;
        cb.current.onTearing(false);
      }
      if (s.mode === "pulling" && s.p >= 0.995) startRun();
      if (s.mode === "running" && s.p >= 1) {
        // Free: the stub lies flat, the résumé comes away
        s.mode = "falling";
        s.t = 0;
        s.y = 0;
        s.vy = POP;
        tearFree();
        if (sheet.current) {
          const { w, h } = geo.current;
          // In front of the stub while it falls (only then: at rest the stub must stay grabbable)
          sheet.current.style.zIndex = "2";
          sheet.current.style.transformOrigin = `${w / 2}px ${h * 0.45}px`;
        }
        const bodyEdge = fibres.current[0]?.ownerSVGElement;
        if (bodyEdge) bodyEdge.style.visibility = "hidden";
        voice.current?.stop();
        voice.current = null;
        // A phone's scrolling sheet would grow to fit the falling stub: hold it still
        scroller = hit.current?.closest<HTMLElement>(".overflow-y-auto") ?? null;
        if (scroller) scroller.style.overflowY = "hidden";
      }

      // Each perforation the front passes: a crackle, and a slight catch while running
      const passed = Math.floor((s.p * geo.current.w) / PERF_GAP);
      if (passed > s.holes && (s.mode === "pulling" || s.mode === "running")) {
        tearTick(Math.min(1, 0.35 + Math.abs(s.pv) * 0.35));
        if (s.mode === "running") s.run *= HOLE_CATCH;
      }
      s.holes = passed;
      voice.current?.set(Math.abs(s.p - before) / Math.max(dt, 0.001));

      // Redrawn only once the front has moved a third of a pixel: the clip-paths are the
      // costly part of each frame, and smaller steps don't show
      if (Math.abs(s.p - s.drawnP) * geo.current.w > 0.33) {
        cut(s.p);
        s.drawnP = s.p;
      }
      if (Math.abs(s.angle - s.drawnAngle) > 0.05 || Number.isNaN(s.drawnAngle)) {
        hang(s.p, s.angle);
        s.drawnAngle = s.angle;
      }

      if (s.mode === "falling" && sheet.current) {
        // Sway, rock and tip build up as it gets going, as a falling sheet's do
        const t = s.t;
        const build = 1 - Math.exp(-2.6 * t);
        const phase = Math.PI * 2 * SWAY_HZ * t;
        const x = SWAY * Math.sin(phase) * build;
        const rock = ROCK * Math.sin(phase + 1.1) * build + SPIN * t;
        const tumble = TUMBLE * Math.sin(phase * 0.8 + 0.4) * build;
        sheet.current.style.transform = `translate(${x.toFixed(2)}px, ${s.y.toFixed(2)}px) perspective(1600px) rotateX(${tumble.toFixed(2)}deg) rotate(${rock.toFixed(2)}deg)`;
        // Gone below the screen? (checked every other frame; reading layout isn't free)
        if (++frameNo % 2 === 0) {
          const top = sheet.current.getBoundingClientRect().top;
          if (top > window.innerHeight + 4 || t > FALL_MAX) {
            s.mode = "gone";
            if (scroller) scroller.style.overflowY = "";
            sheet.current.style.visibility = "hidden";
            cb.current.onTorn();
            window.setTimeout(restock, 420);
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // The starter tear comes with the sheet landing, not after it
    const starter = window.setTimeout(starterTear, 40);
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
    s.run = Math.max(RUN_START, s.pv);
    s.mode = "running";
  };

  /** A fresh résumé springs back into place, whole, with a new stub. */
  const restock = () => {
    sim.current = fresh();
    cut(0);
    hang(0, 0);
    const bodyEdge = fibres.current[0]?.ownerSVGElement;
    if (bodyEdge) bodyEdge.style.visibility = "visible";
    restockSound();
    const el = sheet.current;
    if (el) {
      el.style.transform = "";
      el.style.visibility = "visible";
      el.style.zIndex = "";
      el.animate(
        [
          { transform: "translateY(-26px) scale(0.985)", opacity: 0 },
          { transform: "translateY(0) scale(1)", opacity: 1 },
        ],
        { duration: BACK.duration, easing: BACK.easing, fill: "backwards" },
      );
    }
    strip.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 60, easing: "ease-out", fill: "backwards" });
    cb.current.onTearing(false);
    window.setTimeout(starterTear, RESTOCK.duration);
  };

  /** The pointer reaches the stub: the torn corner lifts a little, inviting a pull. */
  const invite = (e: React.PointerEvent) => {
    const s = sim.current;
    if (e.pointerType === "mouse" && s.mode === "idle" && !drag.current) s.angleV += 45;
  };

  /** A tap, not a drag: the torn corner jiggles, as a hint to drag it. */
  const jiggle = () => {
    const s = sim.current;
    if (s.mode === "idle") s.angleV += 90;
  };

  // ── Pointer ─────────────────────────────────────────────────────────────────

  const drag = useRef<{ x: number; y: number; moved: boolean; from: number; width: number; touch: boolean; lastX: number; lastT: number; speed: number } | null>(null);
  // The grabbing hand over the résumé while dragging. Set on the dialog, not on <html>:
  // a cursor change on <html> restyles every element on the page underneath
  const grabbing = (on: boolean) => {
    const dialog = hit.current?.closest<HTMLElement>("[role=dialog]");
    if (dialog) {
      dialog.style.cursor = on ? "grabbing" : "";
      // Holds the site cursor (and hover sounds) steady while the hand crosses the sheet
      if (on) dialog.dataset.dragging = "";
      else delete dialog.dataset.dragging;
    }
    if (hit.current) hit.current.style.cursor = on ? "grabbing" : "grab";
  };
  // The drag is followed on the window, not by capturing the pointer: a capture can be
  // dropped by the browser mid-drag, and then the moves go to the page and select text
  const onDown = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.mode !== "idle" || e.button !== 0) return;
    e.preventDefault(); // no text selection while dragging
    grabbing(true);
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      moved: false,
      from: Math.max(REST, s.p),
      width: hit.current?.getBoundingClientRect().width || 1,
      touch: e.pointerType !== "mouse",
      lastX: e.clientX,
      lastT: performance.now(),
      speed: 0,
    };
    const id = e.pointerId;
    const move = (ev: PointerEvent) => ev.pointerId === id && onMove(ev);
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      onUp();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const s = sim.current;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    // The hand's speed along the line (widths per second), smoothed, for a flick on release
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT) / 1000;
    d.speed += ((e.clientX - d.lastX) / d.width / dt - d.speed) * 0.4;
    d.lastX = e.clientX;
    d.lastT = now;
    if (!d.moved && Math.hypot(dx, dy) < (d.touch ? 6 : 3)) return;
    if (!d.moved) {
      d.moved = true;
      s.mode = "pulling";
      begin();
    }
    if (s.mode !== "pulling") return;
    // The tear front follows your hand along the line, left to right
    s.target = Math.max(REST, Math.min(1, d.from + dx / d.width));
    s.droop = Math.max(-3, Math.min(8, dy * 0.08));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    grabbing(false);
    if (!d) return;
    const s = sim.current;
    s.droop = 0;
    if (!d.moved) return jiggle();
    // Letting go after a drag makes the browser fire a click where the pointer is, often
    // past the sheet's edge on the backdrop, which would close the résumé mid-tear. That
    // one click is swallowed.
    const swallow = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
    if (s.mode !== "pulling") return;
    if (Math.max(s.p, s.target) > RUN_AT) return startRun();
    // A quick flick to the right finishes it too, carrying the hand's speed on
    const fresh = performance.now() - d.lastT < 80;
    if (fresh && d.speed > FLICK_SPEED && Math.max(s.p, s.target) > FLICK_FROM) {
      s.pv = Math.max(s.pv, Math.min(RUN_MAX, d.speed));
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
      {/* The body: drawn once, its shadow included. This is what falls once it's torn off */}
      {/* Moved as one layer (will-change), with its shadow on the layer inside, so the shadow
          is drawn once and only moved while it falls, not redrawn over the blurred page each frame */}
      <div ref={sheet} className="relative" style={{ willChange: "transform" }}>
        <div style={{ filter: "drop-shadow(0 1px 1.5px rgba(48,40,26,0.1)) drop-shadow(0 12px 18px rgba(48,40,26,0.15))" }}>
          <div ref={body} className="relative" style={{ ...TOP_EDGE, backgroundColor: PAPER }}>
            <Grain />
            <Sheet />
          </div>
        </div>
      </div>
      {/* The stub strip: the only part that moves */}
      <div ref={strip} className="resume-strip pointer-events-none absolute inset-x-0" style={{ top: 0 }}>
        {fibre(0)}
        <div ref={untorn} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: PAPER }}>
          {inside(0)}
        </div>
        <div>
          <div ref={flapWrap} className="absolute inset-0" style={{ filter: "drop-shadow(0 2px 3px rgba(48,40,26,0.16))", willChange: "transform" }}>
            <div ref={flap} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: PAPER, clipPath: "polygon(0 0, 0 0, 0 0)" }}>
              {inside(1)}
              {fibre(1)}
            </div>
          </div>
        </div>
      </div>
      <button
        ref={hit}
        type="button"
        aria-label="Tear off the stub to download the résumé (PDF)"
        // Silent on hover: the tear has its own paper sounds, and the site's button tick
        // fired again every time the pointer crossed back over the strip
        data-sound="none"
        className="absolute inset-x-0 bottom-0 z-[3] touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-[#9D136A]/40"
        style={{ height: STUB_H, cursor: "grab" }}
        onPointerDown={onDown}
        onPointerEnter={invite}
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
