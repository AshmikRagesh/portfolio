"use client";

// ── A light that follows the pointer ──────────────────────────────────────────
// The metal pieces in the hero (the Superhost medal, the Chelsea lion) are lit by SVG
// lighting filters. This moves every `fePointLight[data-light]` inside an SVG to sit
// over the pointer, a little above the surface, so the shine slides over the raised
// edges as the mouse moves. It eases after the pointer instead of jumping. With no
// pointer nearby (or on touch screens) the light drifts back to the top left.
//
// It also leans the element a few degrees towards the pointer while it's close.

import { useEffect, type RefObject } from "react";

export function useCursorLight(
  svg: RefObject<SVGSVGElement | null>,
  view: { w: number; h: number },
  opts: { tilt?: RefObject<HTMLElement | null>; tiltDeg?: number; reduced?: boolean } = {},
) {
  const { tilt, tiltDeg = 8, reduced = false } = opts;
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const lights = Array.from(el.querySelectorAll<SVGElement>("fePointLight[data-light]"));
    const rest = { x: view.w * 0.2, y: view.h * 0.1 };
    const now = { ...rest };
    let target = { ...rest };
    let lean = { x: 0, y: 0 };
    let leanNow = { x: 0, y: 0 };
    let raf = 0;

    const set = () => {
      lights.forEach((l) => {
        l.setAttribute("x", now.x.toFixed(1));
        l.setAttribute("y", now.y.toFixed(1));
      });
      if (tilt?.current) {
        tilt.current.style.transform = `perspective(600px) rotateX(${(-leanNow.y * tiltDeg).toFixed(2)}deg) rotateY(${(leanNow.x * tiltDeg).toFixed(2)}deg)`;
      }
    };
    set();
    if (reduced || !window.matchMedia("(hover: hover)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const u = (e.clientX - r.left) / r.width;
      const v = (e.clientY - r.top) / r.height;
      // Only within a couple of object-widths; further away, back to rest
      const near = u > -1.5 && u < 2.5 && v > -1 && v < 2;
      target = near ? { x: u * view.w, y: v * view.h } : { ...rest };
      const inside = u > -0.2 && u < 1.2 && v > -0.2 && v < 1.2;
      lean = inside ? { x: Math.max(-1, Math.min(1, (u - 0.5) * 2)), y: Math.max(-1, Math.min(1, (v - 0.5) * 2)) } : { x: 0, y: 0 };
    };
    const tick = () => {
      now.x += (target.x - now.x) * 0.12;
      now.y += (target.y - now.y) * 0.12;
      leanNow = { x: leanNow.x + (lean.x - leanNow.x) * 0.1, y: leanNow.y + (lean.y - leanNow.y) * 0.1 };
      set();
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [svg, view.w, view.h, tilt, tiltDeg, reduced]);
}

/** A faint metallic clink, synthesised: two bright partials that ring and die fast */
let ctx: AudioContext | null = null;
export function clink(volume = 0.035) {
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = volume;
    out.connect(ctx.destination);
    [2860, 4210, 6020].forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1 / (i + 1), t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35 / (i + 1));
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.4);
    });
  } catch {
    // No audio: stay silent
  }
}
