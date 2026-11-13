"use client";

// ── Sound layer ───────────────────────────────────────────────────────────────
// Listens across the whole page and plays the DS interface sounds (lib/sound/ui), so
// components only describe what they are and never call audio code themselves:
//
//   any link or button                  → "tick" on hover
//   data-sound="whisper" | "note" | …   → that sound on hover (and on a tap on phones)
//   data-pitch="1.4"                    → pitches the sound's tones (bars, chart points)
//   data-sound="none"                   → silent (things with a sound of their own, like Bella)
//   data-sound-click="toggle" | …       → that sound on click
//   a new page                          → "page"
//
// One sound per element entered, not per pixel moved; while something is being dragged
// (an ancestor has data-dragging) hovering stays quiet. On phones, sliding a finger
// sideways across a chart plays each bar it crosses.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isSoundName, playSound, unlockSounds } from "@/lib/sound/ui";

const INTERACTIVE = "a[href], button, [role=button], [role=tab], summary, select, input[type=checkbox], input[type=radio]";
const THROTTLE_MS = 35;

function soundFor(el: Element) {
  // In case study feedback mode, clicks on the page pick a block instead of doing
  // their usual thing, so the page's links, buttons and media stay silent
  if (document.documentElement.dataset.feedback === "on" && el.closest("[data-cs-main]")) return null;
  const own = el.closest("[data-sound]");
  if (own) {
    const name = own.getAttribute("data-sound") ?? "";
    return isSoundName(name) ? { el: own, name, pitch: parseFloat(own.getAttribute("data-pitch") ?? "") } : { el: own, name: null };
  }
  const hit = el.closest(INTERACTIVE);
  if (!hit || (hit as HTMLButtonElement).disabled) return null;
  return { el: hit, name: "tick" as const, pitch: NaN };
}

export default function SoundLayer() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    let current: Element | null = null;
    let last = 0;
    let touch = false;
    let sweep: { x: number; y: number; dir: "x" | "y" | null; el: Element | null } | null = null;

    const play = (s: ReturnType<typeof soundFor>) => {
      if (!s?.name) return;
      const now = performance.now();
      if (now - last < THROTTLE_MS) return;
      last = now;
      playSound(s.name, Number.isFinite(s.pitch) ? { pitch: s.pitch } : undefined);
    };

    const onDown = (e: PointerEvent) => {
      unlockSounds();
      touch = e.pointerType !== "mouse";
      // Phones have no hover: a tap on a bar or a picture plays its sound instead
      if (touch && e.target instanceof Element) {
        const s = soundFor(e.target);
        if (s && s.name && s.name !== "tick") play(s);
      }
    };
    const onKey = () => unlockSounds();

    const onOver = (e: MouseEvent) => {
      if (touch || !(e.target instanceof Element)) return;
      const s = soundFor(e.target);
      if (!s || s.el === current) return;
      current = s.el;
      if (s.el.closest("[data-dragging]")) return;
      play(s);
    };
    const onOut = (e: MouseEvent) => {
      if (current && !(e.relatedTarget instanceof Node && current.contains(e.relatedTarget))) current = null;
    };
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest("[data-sound-click]") : null;
      const name = el?.getAttribute("data-sound-click") ?? "";
      if (isSoundName(name)) playSound(name);
    };

    // Phones: a sideways slide across [data-sound] things plays each one it crosses
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      sweep = t ? { x: t.clientX, y: t.clientY, dir: null, el: null } : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!sweep || !t) return;
      if (!sweep.dir) {
        const dx = Math.abs(t.clientX - sweep.x);
        const dy = Math.abs(t.clientY - sweep.y);
        if (dx < 6 && dy < 6) return;
        sweep.dir = dx > dy ? "x" : "y";
      }
      if (sweep.dir !== "x") return;
      const under = document.elementFromPoint(t.clientX, t.clientY);
      const s = under ? soundFor(under) : null;
      if (!s || s.name === "tick" || s.el === sweep.el) return;
      sweep.el = s.el;
      play(s);
    };
    const onTouchEnd = () => (sweep = null);

    const opts = { capture: true, passive: true } as const;
    document.addEventListener("pointerdown", onDown, opts);
    document.addEventListener("keydown", onKey, opts);
    document.addEventListener("mouseover", onOver, opts);
    document.addEventListener("mouseout", onOut, opts);
    document.addEventListener("click", onClick, opts);
    document.addEventListener("touchstart", onTouchStart, opts);
    document.addEventListener("touchmove", onTouchMove, opts);
    document.addEventListener("touchend", onTouchEnd, opts);
    document.addEventListener("touchcancel", onTouchEnd, opts);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("touchstart", onTouchStart, true);
      document.removeEventListener("touchmove", onTouchMove, true);
      document.removeEventListener("touchend", onTouchEnd, true);
      document.removeEventListener("touchcancel", onTouchEnd, true);
    };
  }, []);

  // A soft page-turn on arriving somewhere new (not on the first load)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    playSound("page");
  }, [pathname]);

  return null;
}
