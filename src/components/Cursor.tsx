"use client";

// ── The cursor ────────────────────────────────────────────────────────────────
// A small grape square with grape-light corner brackets, like a viewfinder, takes the
// arrow's place on mouse and trackpad screens.
//   rest     16px square.
//   hover    grows to 28px over anything you can click.
//   press    squeezes to 75% while the button is down.
// The square trails the pointer by a beat; a 4px white point sits exactly on it, so
// aiming stays precise. Over the footer's dark band the colours swap so it stays visible.
//
// Native cursors stay where they mean something: form fields (text caret), the draggable
// reels (grab hand), embedded video, feedback mode (crosshair), and anything marked
// data-native-cursor. Phones, tablets, reduced motion and forced colours keep the system
// cursor entirely.

import { useEffect, useRef } from "react";

type Mode = "rest" | "hover" | "native";

const NATIVE = "input, textarea, select, [contenteditable=''], [contenteditable='true'], [data-native-cursor], .reel, iframe";
const HOVER = "a[href], button, [role='button'], [role='link'], [role='tab'], [role='menuitem'], label, summary, [data-sound-click], [data-cursor='hover']";

const FOLLOW = 0.3; // share of the gap the square closes each frame: settles in about a tenth of a second

export default function Cursor() {
  const squareRef = useRef<HTMLDivElement>(null);
  const pointRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)",
    );
    const root = document.documentElement;
    const square = squareRef.current;
    const point = pointRef.current;
    if (!square || !point) return;
    const both = [square, point];
    const set = (key: string, value: string | null) =>
      both.forEach((el) => (value === null ? delete el.dataset[key] : (el.dataset[key] = value)));

    let on = false;
    let frame = 0;
    let x = -100, y = -100; // where the square is drawn
    let tx = -100, ty = -100; // where the pointer is
    let shown = false;
    let mode: Mode = "rest";

    const draw = () => {
      x += (tx - x) * FOLLOW;
      y += (ty - y) * FOLLOW;
      if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) {
        x = tx;
        y = ty;
      }
      square.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = x === tx && y === ty ? 0 : requestAnimationFrame(draw);
    };

    const read = (target: Element | null) => {
      const next: Mode =
        !target || root.dataset.feedback === "on" || target.closest(NATIVE)
          ? "native"
          : target.closest(HOVER)
            ? "hover"
            : "rest";
      if (next !== mode) {
        mode = next;
        set("mode", mode);
      }
      set("tone", target?.closest("footer, [data-cursor-tone='light']") ? "light" : "grape");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      point.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (!shown) {
        // First sight: appear on the pointer rather than sliding in from a corner
        x = tx;
        y = ty;
        shown = true;
        set("visible", "");
      }
      read(e.target as Element);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const hide = () => {
      shown = false;
      set("visible", null);
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) hide(); // left the window, or went into an embedded video
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") set("pressed", "");
    };
    const onUp = () => set("pressed", null);
    // Scrolling moves the page under a still pointer, so read what's there now
    const onScroll = () => {
      if (shown) read(document.elementFromPoint(tx, ty));
    };

    const start = () => {
      if (on) return;
      on = true;
      root.dataset.cursor = "";
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("mouseout", onOut);
      window.addEventListener("blur", hide);
    };
    const stop = () => {
      if (!on) return;
      on = false;
      delete root.dataset.cursor;
      hide();
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", hide);
    };
    const sync = () => (query.matches ? start() : stop());
    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return (
    <>
      <div ref={squareRef} className="site-cursor" aria-hidden="true" data-mode="rest" data-tone="grape">
        <svg viewBox="0 0 24 24" focusable="false">
          <path className="site-cursor__box" d="M0 0h24v24H0z" />
          <path className="site-cursor__corners" d="M8 2H2v6M16 2h6v6M2 16v6h6M22 16v6h-6" />
        </svg>
      </div>
      <div ref={pointRef} className="site-cursor-point" aria-hidden="true" data-mode="rest" data-tone="grape" />
    </>
  );
}
