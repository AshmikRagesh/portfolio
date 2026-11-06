"use client";

// ── Bring to the centre ───────────────────────────────────────────────────────
// The one motion every hero object with something inside it shares (the trips book,
// the Superhost medal). Click the object and the thing itself lifts out of the hero and
// flies to the middle of the screen while the page blurs back, the same backdrop and
// spring as the résumé. Once it lands it opens (`phase` goes "open"); closing runs it
// backwards: it closes up, flies home and drops back into its spot.
//
// The resting object stays in the hero but goes invisible while it's away, so the page
// never reflows. With reduced motion it fades in and out where it lands.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Backdrop } from "@/components/resume/paper";
import { EASE, spring } from "@/components/resume/motion";

const RISE = spring(120, 17);
const HOME_MS = 460;

export type FocusPhase = "flying" | "open" | "closing";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);
  return reduced;
}

type Props = {
  /** The resting object in the hero, measured at the moment it's clicked */
  source: HTMLElement | null;
  open: boolean;
  onClosed: () => void;
  label: string;
  /** Size of the closed object once it has landed in the middle */
  width: number;
  height: number;
  /** How long the object takes to close up before it flies home */
  closeMs?: number;
  /** The largest the object gets once open, so it's scaled to fit the screen */
  fitWidth?: number;
  fitHeight?: number;
  children: (phase: FocusPhase, close: () => void) => ReactNode;
};

export default function FocusOverlay({ source, open, onClosed, label, width, height, closeMs = 0, fitWidth, fitHeight, children }: Props) {
  const [phase, setPhase] = useState<FocusPhase>("flying");
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const reduced = useReducedMotion();

  // Fit the landed object to the screen
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const read = () => setFit(Math.min(1, (window.innerWidth - 32) / (fitWidth ?? width), (window.innerHeight - 120) / (fitHeight ?? height)));
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [width, height, fitWidth, fitHeight]);

  /** The transform that puts the landed stage exactly over the resting object */
  const fromSource = useCallback(() => {
    const el = stage.current;
    if (!el || !source) return "none";
    const s = source.getBoundingClientRect();
    const t = el.getBoundingClientRect();
    // offsetWidth, not the rect: the resting object is turned, and its rect is the turned box
    const k = source.offsetWidth / t.width;
    const dx = s.left + s.width / 2 - (t.left + t.width / 2);
    const dy = s.top + s.height / 2 - (t.top + t.height / 2);
    // The resting object sits at an angle; carry it, so it straightens on the way up
    const rot = Number(source.dataset.rest ?? 0);
    return `translate(${dx}px, ${dy}px) scale(${k}) rotate(${rot}deg)`;
  }, [source]);

  const backdrops = () => Array.from(root.current?.querySelectorAll<HTMLElement>("[data-backdrop]") ?? []);

  // In: lift off from the hero and spring to the middle
  useLayoutEffect(() => {
    if (!open) return;
    leaving.current = false;
    setPhase("flying");
    if (source) source.style.visibility = "hidden";
    backdrops().forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: EASE, fill: "backwards" }));
    const el = stage.current;
    if (!el) return;
    const anim = reduced
      ? el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: "backwards" })
      : el.animate([{ transform: fromSource() }, { transform: "none" }], { duration: RISE.duration, easing: RISE.easing, fill: "backwards" });
    // Open a little before the spring has fully settled
    const t = window.setTimeout(() => setPhase("open"), reduced ? 120 : Math.round(RISE.duration * 0.55));
    return () => {
      window.clearTimeout(t);
      anim.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    setPhase("closing");
    const fly = () => {
      const el = stage.current;
      backdrops().forEach((b) => b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: HOME_MS, easing: EASE, fill: "forwards" }));
      const anim = reduced
        ? el?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" })
        : el?.animate([{ transform: "none" }, { transform: fromSource() }], { duration: HOME_MS, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" });
      const done = () => {
        if (source) source.style.visibility = "";
        onClosed();
      };
      if (anim) anim.finished.then(done, done);
      else done();
    };
    window.setTimeout(fly, reduced ? 0 : closeMs);
  }, [closeMs, fromSource, onClosed, reduced, source]);

  // While open: Escape closes, the page underneath stays put, focus moves in
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    root.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = before;
    };
  }, [open, close]);

  // Never leave the hero object hidden if this unmounts mid-flight
  useEffect(() => () => {
    if (source) source.style.visibility = "";
  }, [source]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-[200] outline-none">
      <Backdrop />
      <div className="absolute inset-0 flex items-center justify-center" onClick={close}>
        <div style={{ transform: `scale(${fit})` }}>
          <div ref={stage} className="relative" style={{ width, height }} onClick={(e) => e.stopPropagation()}>
            {children(phase, close)}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** The round close button that sits under an opened object */
export function CloseChip({ onClick, children = "Close" }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-2 rounded-md px-3 font-geist text-caption-lg text-secondary transition-colors hover:bg-card hover:text-heading"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {children}
    </button>
  );
}
