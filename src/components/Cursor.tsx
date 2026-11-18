"use client";

// ── The cursor ────────────────────────────────────────────────────────────────
// A grape square that takes the arrow's place on mouse and trackpad screens, and reads
// what's under it:
//   rest     14px square over empty page.
//   link     shrinks to 8px over anything you can click.
//   text     turns into a 2px caret, as tall as the line, over words.
//   press    squeezes to 75% while the button is down.
// It trails the pointer by a beat, then settles exactly on it. Over the footer's dark
// band it switches to grape-light so it stays visible.
//
// Native cursors stay where they mean something: form fields (text caret), the draggable
// reels (grab hand), feedback mode (crosshair), and anything marked data-native-cursor.
// Phones, tablets, reduced motion and forced colours keep the system cursor entirely.

import { useEffect, useRef } from "react";

type Mode = "rest" | "link" | "text" | "native";

const NATIVE = "input, textarea, select, [contenteditable=''], [contenteditable='true'], [data-native-cursor], .reel, iframe";
const LINK = "a[href], button, [role='button'], [role='link'], [role='tab'], [role='menuitem'], label, summary, select, [data-sound-click], [data-cursor='link']";
const TEXT = "p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, dt, dd, td, th, [data-cursor='text']";

const FOLLOW = 0.35; // share of the gap closed each frame: settles in about a tenth of a second

/** Caret height for the text under the pointer: its line height, kept to an even number. */
function caretHeight(el: Element) {
  const s = getComputedStyle(el);
  const size = parseFloat(s.fontSize) || 16;
  const line = parseFloat(s.lineHeight) || size * 1.3;
  const h = Math.min(line, size * 1.4);
  return Math.max(16, Math.min(56, Math.round(h / 2) * 2));
}

/** True when the pointer sits on the words themselves, not the padding around a block. */
function overText(el: Element, x: number, y: number) {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of Array.from(range.getClientRects())) {
      if (x >= r.left - 2 && x <= r.right + 2 && y >= r.top && y <= r.bottom) return true;
    }
  }
  return false;
}

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)",
    );
    const root = document.documentElement;
    const el = ref.current;
    if (!el) return;

    let on = false;
    let frame = 0;
    let x = -100, y = -100; // where it's drawn
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
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = x === tx && y === ty ? 0 : requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const read = (target: Element | null, px: number, py: number) => {
      let next: Mode = "rest";
      let caret = 0;
      if (!target || root.dataset.feedback === "on" || target.closest(NATIVE)) next = "native";
      else if (target.closest(LINK)) next = "link";
      else {
        const block = target.closest(TEXT);
        if (block && overText(target, px, py)) {
          next = "text";
          caret = caretHeight(target);
        }
      }
      if (next !== mode) {
        mode = next;
        el.dataset.mode = mode;
      }
      if (caret) el.style.setProperty("--caret", `${caret}px`);
      el.dataset.tone = target?.closest("footer, [data-cursor-tone='light']") ? "light" : "grape";
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
        el.dataset.visible = "";
      }
      read(e.target as Element, tx, ty);
      kick();
    };
    const hide = () => {
      shown = false;
      delete el.dataset.visible;
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) hide(); // left the window, or went into an embedded video
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") el.dataset.pressed = "";
    };
    const onUp = () => delete el.dataset.pressed;
    // Scrolling moves the page under a still pointer, so read what's there now
    const onScroll = () => {
      if (shown) read(document.elementFromPoint(tx, ty), tx, ty);
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
    <div ref={ref} className="site-cursor" aria-hidden="true" data-mode="rest" data-tone="grape">
      <span />
    </div>
  );
}
