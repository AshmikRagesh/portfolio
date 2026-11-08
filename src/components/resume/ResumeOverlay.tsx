"use client";

// ── Fancy paper ───────────────────────────────────────────────────────────────
// The résumé as a real sheet of paper. Clicking "Fancy paper" blurs the page, and a
// sheet folded in half springs up into the middle of the screen and opens out
// (Unfold.tsx). Two more sheets slide out into a loose pile underneath. The sheet leans
// gently towards the pointer.
//
// Along the bottom is a tear-off stub (TearSheet.tsx): pull it or tap it and it tears
// along its perforation and drops away, the copy downloads, and a fresh stub slides in.
// The paper is punched down the left, torn from a pad along the top, and carries pen
// circles and margin notes in Ashmik's hand (paper.tsx).
//
// Sounds are synthesised (paperSound.ts). With reduced motion the sheet fades in flat
// and the copy downloads straight away.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { celebrate } from "@/lib/bella/progress";
import { RESUME_FILENAME, RESUME_OPEN_EVENT, RESUME_PDF } from "@/lib/resume";
import { useCuriosity } from "@/context/CuriosityContext";
import { guestNumber } from "@/lib/bella/passArt";
import { Backdrop, GuestNo, Pile, SHEET_H, SHEET_W, SheetNarrow, SheetWide } from "./paper";
import Unfold from "./Unfold";
import TearSheet from "./TearSheet";
import { EASE, lerp, spring } from "./motion";
import { playOpen, preloadOpen } from "./paperSound";

const RISE = spring(120, 17);
const TILT_DEG = 2.4;

function useViewport() {
  const [size, setSize] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const read = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return size;
}

function useReducedMotion() {
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

/**
 * Downloads the résumé straight to the visitor's Downloads folder. (It used to open the
 * browser's Save dialog where it could, but by the time the torn stub has fallen the click
 * that started it is old, so Chrome could cancel that dialog at once, and a cancel meant
 * no download at all. A plain download works in every browser.)
 */
function download() {
  const a = document.createElement("a");
  a.href = RESUME_PDF;
  a.download = RESUME_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  celebrate("resume", "Resume downloaded.");
}

export default function ResumeOverlay() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // the flat sheet is up
  const tearing = useRef(false);
  const [measuredH, setMeasuredH] = useState(0);
  const [guest, setGuest] = useState<number | null>(null);
  const { visitorId } = useCuriosity();

  const overlay = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const measurer = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const timers = useRef<number[]>([]);

  const reduced = useReducedMotion();
  const vp = useViewport();
  const wide = vp.w >= 640;
  const scale = wide ? Math.min(1.05, (vp.h - 64) / SHEET_H, (vp.w - 48) / SHEET_W) : 1;
  const Sheet = wide ? SheetWide : SheetNarrow;
  const sheetH = wide ? SHEET_H : measuredH;

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const backdrops = () => Array.from(overlay.current?.querySelectorAll<HTMLElement>("[data-backdrop]") ?? []);

  // Open from anywhere
  useEffect(() => {
    const onOpen = () => {
      if (leaving.current) return;
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      setShown(reduced);
      tearing.current = false;
      setOpen(true);
      // The click: the paper picked up
      playOpen(0.55);
    };
    preloadOpen();
    window.addEventListener(RESUME_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(RESUME_OPEN_EVENT, onOpen);
  }, [reduced]);

  // Enter: the page blurs back, the folded sheet springs up into place
  useLayoutEffect(() => {
    if (!open) return;
    backdrops().forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: EASE, fill: "backwards" }));
    card.current?.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(64px) rotate(-2.5deg) scale(0.94)", filter: "blur(8px)" },
            { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)", filter: "blur(0px)" },
          ],
      reduced ? { duration: 300, fill: "backwards" } : { duration: RISE.duration, easing: RISE.easing, fill: "backwards" },
    );
    // The fade alone, quicker than the spring, so it's solid by the time it lifts
    if (!reduced) card.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "ease-out", fill: "backwards" });
  }, [open, reduced]);

  const close = useCallback(() => {
    // Not while the stub is being torn or the résumé is falling: it would cut off the download
    if (leaving.current || tearing.current) return;
    leaving.current = true;
    backdrops().forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: 80, easing: EASE, fill: "forwards" }));
    const exit = card.current?.animate(
      [
        { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)", filter: "blur(0px)" },
        { opacity: 0, transform: "translateY(36px) rotate(1.5deg) scale(0.96)", filter: "blur(6px)" },
      ],
      { duration: 420, easing: "cubic-bezier(0.4, 0, 0.7, 0.2)", fill: "forwards" },
    );
    const finish = () => {
      leaving.current = false;
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      setOpen(false);
    };
    later(finish, 520);
    exit?.finished.catch(() => {});
  }, []);

  // While open: Escape closes, the page underneath doesn't scroll, focus moves in
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    overlay.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = before;
    };
  }, [open, close]);

  // The sheet leans a couple of degrees towards the pointer, easing after it. Never on
  // touch screens.
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!open || !wide || reduced || !window.matchMedia("(hover: hover)").matches) return;
    const now = { x: 0, y: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      target.current = { x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 };
    };
    const tick = () => {
      // Held where it is while the stub is being torn, so nothing else moves
      if (!tearing.current) {
        const nx = lerp(now.x, target.current.x, 0.06);
        const ny = lerp(now.y, target.current.y, 0.06);
        if (Math.abs(nx - now.x) + Math.abs(ny - now.y) > 0.0004 && tilt.current) {
          tilt.current.style.transform = `perspective(2400px) rotateX(${(-ny * TILT_DEG).toFixed(3)}deg) rotateY(${(nx * TILT_DEG).toFixed(3)}deg)`;
        }
        now.x = nx;
        now.y = ny;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [open, wide, reduced]);

  // On a phone the sheet is as long as its content: measure it for the unfold
  useLayoutEffect(() => {
    if (!open || wide || !measurer.current) return;
    const el = measurer.current;
    const read = () => setMeasuredH(el.offsetHeight);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, wide]);

  // The visitor's guest number, for the stub
  useEffect(() => {
    if (!open || !visitorId || guest !== null) return;
    fetch(`/api/curiosity/desk?v=${encodeURIComponent(visitorId)}`)
      .then((r) => r.json())
      .then((d: { guestNo?: number }) => typeof d.guestNo === "number" && setGuest(d.guestNo))
      .catch(() => {});
  }, [open, visitorId, guest]);

  if (!open || typeof document === "undefined") return null;

  const content = (
    <>
      <Pile />
      {shown ? (
        <TearSheet
          Sheet={Sheet}
          onTorn={download}
          onTearing={(t) => {
            tearing.current = t;
          }}
        />
      ) : (
        <>
          {/* Laid out unseen on a phone, to know how long the sheet is */}
          {!wide && (
            <div ref={measurer} aria-hidden="true" className="invisible absolute inset-x-0 top-0">
              <Sheet />
            </div>
          )}
          {sheetH > 0 && <Unfold height={sheetH} Sheet={Sheet} onDone={() => setShown(true)} />}
        </>
      )}
    </>
  );

  return createPortal(
    <GuestNo.Provider value={guestNumber(guest)}>
    <div ref={overlay} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Résumé" className="fixed inset-0 z-[200] outline-none">
      <Backdrop />
      <div className={`absolute inset-0 ${wide ? "overflow-hidden" : "overflow-y-auto"}`} onClick={close}>
        <div className={`flex min-h-full justify-center ${wide ? "items-center" : "px-4 py-16"}`}>
          <div
            ref={card}
            className={wide ? "relative" : "relative my-auto w-full max-w-[520px]"}
            style={wide ? { width: SHEET_W * scale, height: SHEET_H * scale } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={tilt} className={wide ? "absolute inset-0" : "relative"} style={{ transformStyle: "preserve-3d" }}>
              {wide ? (
                <div className="absolute left-0 top-0" style={{ width: SHEET_W, height: SHEET_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
                  {content}
                </div>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </GuestNo.Provider>,
    document.body,
  );
}
