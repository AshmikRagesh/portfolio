"use client";

// ── The cursor ────────────────────────────────────────────────────────────────
// One solid grape square on mouse and trackpad screens, with a thin white rim so it
// stays clear over grape buttons and images, and a soft shadow to lift it off the page.
//   rest     8px, with a 2px white pixel at its centre marking the exact point.
//   hover    grows to 20px over anything you can click, and a small white glyph fades
//            in to say what the click does: → goes to a page on the site, ↗ opens
//            another site or a file, ▶ plays a video. Elements can pick one with
//            data-cursor-icon="arrow|out|play".
//   press    squeezes in while the button is down.
// It glides after the pointer, settling within a few frames. Over the footer's dark
// band it turns grape-light.
//
// Native cursors stay where they mean something: form fields (text caret), the draggable
// reels (grab hand), embedded video, feedback mode (crosshair), and anything marked
// data-native-cursor. Phones, tablets, reduced motion and forced colours keep the system
// cursor entirely.

import { useEffect, useRef } from "react";

type Mode = "rest" | "hover" | "native";
type Icon = "arrow" | "out" | "play";

const NATIVE = "input, textarea, select, [contenteditable=''], [contenteditable='true'], [data-native-cursor], .reel, iframe";
const HOVER = "a[href], button, video, [role='button'], [role='link'], [role='tab'], [role='menuitem'], label, summary, [data-sound-click], [data-cursor='hover']";

const LAG = 45; // ms: how long the square takes to close most of the gap — smooth at any refresh rate

/** What a click on this element will do, as a glyph. */
function iconFor(target: Element): Icon {
  const chosen = target.closest("[data-cursor-icon]")?.getAttribute("data-cursor-icon");
  if (chosen === "arrow" || chosen === "out" || chosen === "play") return chosen;
  if (target.closest("video")) return "play";
  const link = target.closest("a[href]") as HTMLAnchorElement | null;
  if (link && (link.target === "_blank" || link.origin !== window.location.origin || /\.pdf$/i.test(link.pathname))) return "out";
  return "arrow";
}

export default function Cursor() {
  const squareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)",
    );
    const root = document.documentElement;
    const square = squareRef.current;
    if (!square) return;
    const set = (key: string, value: string | null) =>
      value === null ? delete square.dataset[key] : (square.dataset[key] = value);

    let on = false;
    let frame = 0;
    let x = -100, y = -100; // where the square is drawn
    let tx = -100, ty = -100; // where the pointer is
    let shown = false;
    let mode: Mode = "rest";

    let last = 0;
    const draw = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const k = 1 - Math.exp(-dt / LAG);
      x += (tx - x) * k;
      y += (ty - y) * k;
      if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) {
        x = tx;
        y = ty;
      }
      square.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = x === tx && y === ty ? 0 : requestAnimationFrame(draw);
      if (!frame) last = 0;
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
      if (mode === "hover" && target) set("icon", iconFor(target));
      set("tone", target?.closest("footer, [data-cursor-tone='light']") ? "light" : "grape");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
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
    <div ref={squareRef} className="site-cursor" aria-hidden="true" data-mode="rest" data-tone="grape" data-icon="arrow">
      <span>
        <svg viewBox="0 0 12 12" focusable="false">
          <path className="site-cursor__arrow" d="M2 6h8M7 3l3 3-3 3" />
          <path className="site-cursor__out" d="M3 9l6-6M4 3h5v5" />
          <path className="site-cursor__play" d="M4 2.5v7l6-3.5z" />
        </svg>
      </span>
    </div>
  );
}
