"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PictureFrame, { FRAME } from "./PictureFrame";
import {
  createNet,
  EDGE_ALIVE,
  EDGE_SNAPPED,
  EYE,
  FACE,
  NODE_FALLING,
  NODE_GONE,
  OPEN_W,
  SHADOW,
  type Net,
  type Rect,
} from "./tornNet";

// Board (viewBox) units → world units: the opening is OPEN_W wide
const [FX0, FY0, FX1, FY1] = FRAME.open;
const K = OPEN_W / (FX1 - FX0);
const OPEN_H = (FY1 - FY0) * K;
const OPEN: Rect = [0, 0, OPEN_W, OPEN_H];
const MID = [OPEN_W / 2, OPEN_H / 2];
// The frame's face, in world units
const E = FRAME.edge;
const CARD: Rect = [(E - FX0) * K, (E - FY0) * K, (FRAME.w - E - FX0) * K, (FRAME.h - E - FY0) * K];
const onFrame = (x: number, y: number) =>
  x >= CARD[0] && x <= CARD[2] && y >= CARD[1] && y <= CARD[3] && !(x >= 0 && x <= OPEN_W && y >= 0 && y <= OPEN_H);

const STRAND = 0.0021; // strand thickness, world units
const HOVER_R = 0.03;

type Slot = { net: Net; fade: number; dropped: number };

function hexToRgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

export default function TornNetFrame({
  src,
  alt,
  netColor = "#9D136A", // grape, from the DS
  className = "",
}: {
  src: string;
  alt: string;
  netColor?: string;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [torn, setTorn] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // The net is drawn on a canvas over the whole window, so torn pieces can fall out of
    // the frame and down the page. It never takes the pointer — the card does.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "40",
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    let seed = 7;
    const slots: Slot[] = [];
    const addNet = (fade: number) => slots.push({ net: createNet(OPEN, onFrame, seed++), fade, dropped: 0 });
    addNet(1);
    const current = () => slots[slots.length - 1].net;

    // Where the board sits on screen, this frame
    const view = { scale: 1, ox: 0, oy: 0, w: 1, h: 1, dpr: 1 };
    function measure() {
      const r = card!.getBoundingClientRect();
      const px = r.width / FRAME.w;
      view.scale = px / K;
      view.ox = r.left + FX0 * px;
      view.oy = r.top + FY0 * px;
    }
    function resize() {
      view.dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.w = window.innerWidth;
      view.h = window.innerHeight;
      canvas.width = Math.round(view.w * view.dpr);
      canvas.height = Math.round(view.h * view.dpr);
    }
    resize();
    measure();

    const toWorld = (cx: number, cy: number, z = 0) => {
      const r = EYE / (EYE - z);
      const wx = (cx - view.ox) / view.scale;
      const wy = (cy - view.oy) / view.scale;
      return [MID[0] + (wx - MID[0]) / r, MID[1] + (wy - MID[1]) / r];
    };

    // ---- drawing ----------------------------------------------------------------
    const rgb = hexToRgb(netColor);
    const strandStyle = `rgb(${rgb.map((c) => Math.round(c * 0.94)).join(",")})`;
    const knotStyle = `rgb(${rgb.map((c) => Math.round(Math.min(255, c * 1.0))).join(",")})`;
    // buckets: clipped (seated, under the frame's edge) or not × thickness × opacity
    const THIN = [0.7, 0.95, 1.15];
    const segs: number[][] = Array.from({ length: 2 * 3 * 4 }, () => []);
    const shadows: number[][] = Array.from({ length: 4 }, () => []);
    const knots: number[][] = Array.from({ length: 2 * 4 }, () => []);
    const pa = [0, 0];
    const pb = [0, 0];
    const project = (x: number, y: number, z: number, out: number[]) => {
      const k = EYE / (EYE - z);
      out[0] = view.ox + (MID[0] + (x - MID[0]) * k) * view.scale;
      out[1] = view.oy + (MID[1] + (y - MID[1]) * k) * view.scale;
    };
    const aBucket = (a: number) => Math.min(3, Math.max(0, Math.ceil(a * 4) - 1));

    function addSeg(
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      thin: number, alpha: number, loose: boolean,
    ) {
      if (alpha <= 0.01) return;
      const z = 0.5 * (az + bz);
      const clip = !loose && z < FACE ? 0 : 1;
      const t = thin < 0.8 ? 0 : thin < 1.05 ? 1 : 2;
      project(ax, ay, az, pa);
      project(bx, by, bz, pb);
      segs[clip * 12 + t * 4 + aBucket(alpha)].push(pa[0], pa[1], pb[0], pb[1]);
      if (alpha > 0.5) {
        project(ax + az * SHADOW[0], ay + az * SHADOW[1], 0, pa);
        project(bx + bz * SHADOW[0], by + bz * SHADOW[1], 0, pb);
        shadows[clip * 2 + (z > 0.01 ? 1 : 0)].push(pa[0], pa[1], pb[0], pb[1]);
      }
    }

    function collect(net: Net) {
      const { pos, state, alpha, A, B, edge, rest, stubLen, lineA, lineB, snapTime, snapLen, degree } = net;
      const now = net.time;
      for (let e = 0; e < net.m; e++) {
        const st = edge[e];
        if (st === 0) continue;
        const i = A[e];
        const j = B[e];
        if (state[i] === NODE_GONE && state[j] === NODE_GONE) {
          edge[e] = 0;
          continue;
        }
        const ax = pos[3 * i], ay = pos[3 * i + 1], az = pos[3 * i + 2];
        const bx = pos[3 * j], by = pos[3 * j + 1], bz = pos[3 * j + 2];
        const loose = state[i] === NODE_FALLING || state[j] === NODE_FALLING;
        if (st === EDGE_ALIVE) {
          const len = Math.max(Math.hypot(bx - ax, by - ay, bz - az), 1e-5);
          const thin = Math.min(1.25, Math.max(0.55, Math.sqrt((1.16 * rest[e]) / len)));
          addSeg(ax, ay, az, bx, by, bz, thin, Math.min(alpha[i], alpha[j]), loose);
          continue;
        }
        if (st !== EDGE_SNAPPED) continue;
        // Snapped: a stub on each side springs back along the line the strand ran
        const t = Math.min(1, Math.max(0, (now - snapTime[e]) / 0.07));
        const ease = 1 - (1 - t) ** 3;
        for (let s = 0; s < 2; s++) {
          const me = s ? j : i;
          if (state[me] === NODE_GONE) continue;
          const lineE = s ? lineB[e] : lineA[e];
          const before = lineE >= 0 && edge[lineE] === EDGE_ALIVE ? (s ? B[lineE] : A[lineE]) : -1;
          const mx = pos[3 * me], my = pos[3 * me + 1], mz = pos[3 * me + 2];
          let dx: number, dy: number, dz: number;
          if (before >= 0) {
            dx = mx - pos[3 * before];
            dy = my - pos[3 * before + 1];
            dz = mz - pos[3 * before + 2];
          } else {
            const o = s ? i : j;
            dx = pos[3 * o] - mx;
            dy = pos[3 * o + 1] - my;
            dz = pos[3 * o + 2] - mz;
          }
          const l = Math.hypot(dx, dy, dz);
          if (l < 1e-6) continue;
          const len = 0.5 * snapLen[e] + (stubLen[2 * e + s] * rest[e] - 0.5 * snapLen[e]) * ease;
          addSeg(mx, my, mz, mx + (dx / l) * len, my + (dy / l) * len, mz + (dz / l) * len, 1.1, alpha[me],
            state[me] === NODE_FALLING);
        }
      }
      // Knots where strands still meet
      for (let i = 0; i < net.n; i++) {
        if (degree[i] < 2 || state[i] === NODE_GONE || alpha[i] <= 0.01) continue;
        const z = pos[3 * i + 2];
        project(pos[3 * i], pos[3 * i + 1], z, pa);
        const clip = state[i] !== NODE_FALLING && z < FACE ? 0 : 1;
        knots[clip * 4 + aBucket(alpha[i])].push(pa[0], pa[1], EYE / (EYE - z));
      }
    }

    function strokeAll(list: number[], width: number, style: string, alpha: number) {
      if (!list.length) return;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.strokeStyle = style;
      ctx.beginPath();
      for (let q = 0; q < list.length; q += 4) {
        ctx.moveTo(list[q], list[q + 1]);
        ctx.lineTo(list[q + 2], list[q + 3]);
      }
      ctx.stroke();
    }

    function drawLayer(clip: 0 | 1, fade: number) {
      const w = STRAND * view.scale;
      const core = 0.5 * w;
      // shadows: tight under a strand that lies on the picture, soft under one held up
      strokeAll(shadows[clip * 2], 2 * (core + 0.45), "#000", 0.22 * fade);
      strokeAll(shadows[clip * 2 + 1], 2 * (core + 0.45 + 0.03 * 0.3 * view.scale), "#000", 0.07 * fade);
      for (let t = 0; t < 3; t++)
        for (let a = 0; a < 4; a++)
          strokeAll(segs[clip * 12 + t * 4 + a], Math.max(0.5, w * THIN[t]), strandStyle, 0.86 * fade * ((a + 1) / 4));
      ctx.fillStyle = knotStyle;
      for (let a = 0; a < 4; a++) {
        const list = knots[clip * 4 + a];
        if (!list.length) continue;
        ctx.globalAlpha = 0.86 * fade * ((a + 1) / 4);
        ctx.beginPath();
        for (let q = 0; q < list.length; q += 3) {
          const r = Math.max(0.35, 0.56 * w * list[q + 2]);
          ctx.rect(list[q] - r, list[q + 1] - r, 2 * r, 2 * r);
        }
        ctx.fill();
      }
    }

    function draw() {
      ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      ctx.clearRect(0, 0, view.w, view.h);
      ctx.lineCap = "round";
      for (const slot of slots) {
        for (const l of segs) l.length = 0;
        for (const l of shadows) l.length = 0;
        for (const l of knots) l.length = 0;
        collect(slot.net);
        const fade = slot.fade * slot.fade * (3 - 2 * slot.fade);
        // what lies flat is tucked under the frame's edge; what's lifted or falling shows over it
        ctx.save();
        ctx.beginPath();
        ctx.rect(view.ox, view.oy, OPEN_W * view.scale, OPEN_H * view.scale);
        ctx.clip();
        drawLayer(0, fade);
        ctx.restore();
        drawLayer(1, fade);
      }
      ctx.globalAlpha = 1;
    }

    // ---- loop -------------------------------------------------------------------
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
    io.observe(card);

    let wasTorn = false;
    let raf = 0;
    let last = 0;
    let cleared = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(last ? (now - last) / 1000 : 1 / 60, 1 / 30);
      last = now;
      const busy = slots.some((s) => s.net.falling > 0);
      if (!visible && !busy) {
        if (!cleared) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          cleared = true;
        }
        return;
      }
      cleared = false;
      measure();
      const killY = (view.h - view.oy) / view.scale + 0.2;
      for (const slot of [...slots]) {
        slot.net.killY = killY;
        slot.net.step(dt);
        if (slot.fade < 1) slot.fade = Math.min(1, slot.fade + dt / 0.7);
        const isCurrent = slot === slots[slots.length - 1];
        if (!isCurrent && (slot.net.gone || slot.net.time - slot.dropped > 8)) slots.splice(slots.indexOf(slot), 1);
      }
      const t = current().snapped > 0;
      if (t !== wasTorn) {
        wasTorn = t;
        setTorn(t);
      }
      draw();
    };
    raf = requestAnimationFrame(frame);
    if (process.env.NODE_ENV !== "production") (window as unknown as { __tornNet: unknown }).__tornNet = { slots, view };

    // ---- pointer ----------------------------------------------------------------
    let pointer: number | null = null;
    const setCursor = (c: string) => {
      if (card.style.cursor !== c) card.style.cursor = c;
    };
    const releaseHold = () => {
      if (pointer === null) return;
      current().release();
      if (card.hasPointerCapture?.(pointer)) card.releasePointerCapture(pointer);
      pointer = null;
    };
    const onDown = (e: PointerEvent) => {
      if (pointer !== null || (e.pointerType === "mouse" && e.button !== 0)) return;
      measure();
      const [x, y] = toWorld(e.clientX, e.clientY);
      if (!current().grab(x, y)) return;
      e.preventDefault();
      pointer = e.pointerId;
      try {
        card.setPointerCapture(e.pointerId);
      } catch {}
      setCursor("grabbing");
    };
    const onMove = (e: PointerEvent) => {
      const net = current();
      if (pointer === e.pointerId) {
        const [x, y] = toWorld(e.clientX, e.clientY, net.hookZ);
        net.moveTo(x, y);
        return;
      }
      if (pointer !== null || e.pointerType !== "mouse") return;
      const [x, y] = toWorld(e.clientX, e.clientY);
      setCursor(net.nearest(x, y, HOVER_R) >= 0 ? "grab" : "");
    };
    const onUp = (e: PointerEvent) => {
      if (pointer !== e.pointerId) return;
      releaseHold();
      setCursor("grab");
    };
    card.addEventListener("pointerdown", onDown);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", onUp);
    card.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      card.removeEventListener("pointerdown", onDown);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", onUp);
      card.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", resize);
      canvas.remove();
    };
  }, [netColor]);

  // The picture sits a little under the mat all round. There's no mending: once torn,
  // the net stays torn until the page is loaded again.
  const inset = (v: number, of: number) => `${((v - 10) / of) * 100}%`;
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div
        ref={cardRef}
        className="relative w-full touch-none select-none [filter:drop-shadow(0_1px_1px_rgba(50,30,12,0.28))_drop-shadow(0_8px_12px_rgba(50,30,12,0.16))_drop-shadow(0_28px_40px_rgba(50,30,12,0.14))]"
        style={{ aspectRatio: `${FRAME.w} / ${FRAME.h}` }}
      >
        <div
          className="absolute overflow-hidden bg-vanilla"
          style={{
            left: inset(FX0, FRAME.w),
            top: inset(FY0, FRAME.h),
            right: inset(FRAME.w - FX1, FRAME.w),
            bottom: inset(FRAME.h - FY1, FRAME.h),
          }}
        >
          <Image src={src} alt={alt} fill sizes="440px" priority draggable={false} className="object-cover object-center" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_3px_3px_8px_rgba(30,16,6,0.4),inset_0_0_2px_rgba(30,16,6,0.5)]" />
        </div>
        <PictureFrame className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>

      <p className="mt-[24px] w-full text-center font-geist text-[12px] leading-[16px] text-muted" aria-hidden="true">
        {torn ? "Pull at the torn edges to open it wider" : "Grab the net and pull to tear it"}
      </p>
    </div>
  );
}
