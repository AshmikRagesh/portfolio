"use client";

// ── The cursor ────────────────────────────────────────────────────────────────
// Kept simple, after lydiashan.com: a small dot on mouse and trackpad screens.
//   rest     an 8px blackcurrant dot.
//   hover    opens into a 32px ring, faintly grape-filled, over anything you can click.
//   out      over links to other sites or files, a 44px frosted circle with an ↗ arrow.
// Over dark panels (the footer, the guestbook) it turns lilac so it stays visible.
//
// Native cursors stay where they mean something: form fields (text caret), the draggable
// reels (grab hand), embedded video, feedback mode (crosshair), and anything marked
// data-native-cursor. Phones, tablets, reduced motion and forced colours keep the system
// cursor entirely.

import { useEffect, useRef } from "react";

type Mode = "rest" | "hover" | "out" | "native";

// [data-cursor-off]: something else is the cursor there (the password pill), so the dot steps aside
const NATIVE = "input, textarea, select, [contenteditable=''], [contenteditable='true'], [data-native-cursor], [data-cursor-off], .reel, iframe";
const HOVER = "a[href], button, video, [role='button'], [role='link'], [role='tab'], [role='menuitem'], label, summary, [data-sound-click], [data-cursor='hover']";

const LAG = 24; // ms: a hair of glide, so it feels attached to the pointer without jitter

/** Whether the background behind an element is dark (the footer, the guestbook panel),
 *  from the first solid background up its ancestors. Cached per element. */
const darkCache = new WeakMap<Element, boolean>();
function onDark(el: Element): boolean {
  const cached = darkCache.get(el);
  if (cached !== undefined) return cached;
  let dark = false;
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (node.closest("[data-cursor-tone='dark']") === node) { dark = true; break; }
    const m = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
    if (!m) continue;
    const [r, g, b, a = "1"] = m;
    if (parseFloat(a) < 0.5) continue;
    dark = 0.2126 * +r + 0.7152 * +g + 0.0722 * +b < 90;
    break;
  }
  darkCache.set(el, dark);
  return dark;
}

/** Links that leave the site, open a new tab, or are files. */
function isOut(target: Element) {
  const link = target.closest("a[href]") as HTMLAnchorElement | null;
  if (!link || link.href.startsWith("mailto:")) return false;
  return link.target === "_blank" || link.origin !== window.location.origin || /\.pdf$/i.test(link.pathname);
}

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)",
    );
    const root = document.documentElement;
    const dot = dotRef.current;
    if (!dot) return;
    const set = (key: string, value: string | null) =>
      value === null ? delete dot.dataset[key] : (dot.dataset[key] = value);

    let on = false;
    let frame = 0;
    let x = -100, y = -100; // where the dot is drawn
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
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = x === tx && y === ty ? 0 : requestAnimationFrame(draw);
      if (!frame) last = 0;
    };

    const read = (target: Element | null) => {
      const next: Mode =
        !target || root.dataset.feedback === "on" || target.closest(NATIVE)
          ? "native"
          : target.closest(HOVER)
            ? isOut(target) ? "out" : "hover"
            : "rest";
      if (next !== mode) {
        mode = next;
        set("mode", mode);
      }
      set("tone", target && onDark(target) ? "dark" : "light");
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
    <div ref={dotRef} className="site-cursor" aria-hidden="true" data-mode="rest" data-tone="light">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </div>
  );
}
