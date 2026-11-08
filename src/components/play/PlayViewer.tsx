"use client";

// ── Play: the viewer ──────────────────────────────────────────────────────────
// A piece, large. It grows out of the tile that was clicked (its box moves from the
// tile's spot and size to the middle of the screen) while the grid behind fades and
// blurs, and its title rises in underneath. Closing shrinks it back into the same tile
// if that tile is still on screen; otherwise it fades away.
//
// ← → (or a swipe on phones, or the arrows at the bottom) step through the pieces in
// the grid's current order; the box reshapes to each piece's proportions as the new
// one slides in. Esc, the cross, or a click on the backdrop closes it.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { playItems } from "@/content/play";
import PlayMedia from "./PlayMedia";
import type { Opened } from "./PlayGrid";

const N = playItems.length;
const MS = 560;

type Box = { left: number; top: number; width: number; height: number };

// Where the piece sits when open: as large as fits between the navbar and the title
function fit(aspect: number, w: number, h: number): Box {
  const phone = w < 768;
  const top = phone ? 104 : 120;
  const below = phone ? 168 : 152;
  const maxW = Math.min(w - 32, aspect >= 1 ? 880 : 560);
  const maxH = h - top - below;
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return { left: Math.round((w - width) / 2), top: Math.round(top + (maxH - height) / 2), width: Math.round(width), height: Math.round(height) };
}

const fromRect = (r: DOMRect): Box => ({ left: r.left, top: r.top, width: r.width, height: r.height });

export default function PlayViewer({
  order,
  opened,
  onStep,
  onClosed,
}: {
  order: number[];
  opened: Opened;
  onStep: (at: number) => void;
  onClosed: () => void;
}) {
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const [phase, setPhase] = useState<"enter" | "open" | "leave">("enter");
  const [leaveBox, setLeaveBox] = useState<Box | null>(null);
  const [dir, setDir] = useState(0);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const reduce = useRef(false);

  const item = playItems[order[opened.at]];

  useLayoutEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setVp({ w: window.innerWidth, h: window.innerHeight });
    returnFocus.current = document.activeElement as HTMLElement | null;
    // Two frames: the first paints the box over the tile, the second lets it travel
    let b = 0;
    const a = requestAnimationFrame(() => (b = requestAnimationFrame(() => setPhase("open"))));
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const back = returnFocus.current;
    return () => back?.focus?.({ preventScroll: true });
  }, []);

  const close = () => {
    if (phase === "leave") return;
    // Back into the tile it came from, if that tile is still on screen
    const el = opened.cell ? document.querySelector<HTMLElement>(`[data-cell="${opened.cell}"]`) : null;
    const r = el?.getBoundingClientRect();
    const visible = r && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    setLeaveBox(visible && !reduce.current ? fromRect(r) : null);
    setPhase("leave");
    window.setTimeout(onClosed, reduce.current ? 160 : MS);
  };

  const step = (d: number) => {
    if (phase !== "open") return;
    setDir(d);
    onStep(((opened.at + d) % N + N) % N);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        // Keep focus inside the viewer
        const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-play-viewer] button"));
        const i = nodes.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          nodes[nodes.length - 1]?.focus();
        } else if (!e.shiftKey && i === nodes.length - 1) {
          e.preventDefault();
          nodes[0]?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!vp.w) return null;

  const target = fit(item.aspect, vp.w, vp.h);
  const start = opened.from && !reduce.current ? fromRect(opened.from) : null;
  const box = phase === "enter" ? start ?? target : phase === "leave" ? leaveBox ?? target : target;
  const shown = phase === "open";
  const fading = (phase === "enter" && !start) || (phase === "leave" && !leaveBox);

  return createPortal(
    <div data-play-viewer role="dialog" aria-modal="true" aria-label={item.title} className="play-viewer">
      <div className={`play-viewer-backdrop ${shown ? "is-on" : ""}`} onClick={close} />

      <div
        className={`play-viewer-box ${phase === "enter" && start ? "is-tile" : ""} ${fading ? "is-faded" : ""}`}
        style={{ ...box, background: item.tone }}
        onPointerDown={(e) => (swipe.current = { x: e.clientX, id: e.pointerId })}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s || s.id !== e.pointerId) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
        }}
      >
        <div key={item.id} className="play-viewer-media" data-dir={dir}>
          <PlayMedia item={item} eager />
        </div>
      </div>

      {/* Title and kind, under the piece */}
      <div className={`play-viewer-meta ${shown ? "is-on" : ""}`} style={{ left: target.left, top: target.top + target.height + 16, width: target.width }}>
        <p key={item.id} className="font-heading text-h4 text-heading md:text-h4-md">
          {item.title}
        </p>
        <p className="mt-[4px] font-geist text-caption text-muted md:text-caption-md">
          {item.kind} · {item.year}
        </p>
      </div>

      <button ref={closeBtn} type="button" onClick={close} aria-label="Close" className={`play-viewer-close ${shown ? "is-on" : ""}`}>
        <X size={20} strokeWidth={1.8} aria-hidden="true" />
      </button>

      <div className={`play-viewer-steps ${shown ? "is-on" : ""}`}>
        <button type="button" onClick={() => step(-1)} aria-label="Previous piece">
          <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <span className="font-brand text-caption tabular-nums text-secondary" aria-live="polite">
          {String(opened.at + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => step(1)} aria-label="Next piece">
          <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
