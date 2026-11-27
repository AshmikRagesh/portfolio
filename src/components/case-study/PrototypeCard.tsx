"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CardFooter } from "./Blocks";
import { TOOLS } from "@/components/about/ToolPin";

/**
 * A working prototype inside a case study, after the reference (sudhanva.space): the prototype
 * runs live in the card, drawn at its desktop width (1440px) and scaled down to fit, so it
 * never drops to its tablet layout. A label above says what it is and what built it, with the
 * Claude mark. Hovering (or focusing) dims the rest of the page and lifts the card; clicking
 * opens it large, again at desktop width scaled to the screen. On a phone the open prototype
 * uses its own phone layout instead.
 */
const DESIGN_W = 1440;
const DESIGN_H = 900;

function ClaudeMark() {
  const { view, parts } = TOOLS.claude;
  return (
    <svg width="16" height="16" viewBox={`0 0 ${view[0]} ${view[1]}`} aria-hidden="true" className="shrink-0">
      {parts.map((p) => (
        <path key={p.d.slice(0, 12)} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

/** The prototype drawn at 1440px wide and scaled to its box; below 768px wide (phones) the
 *  open prototype fills the box at its own size so its phone layout shows */
function Frame({ src, title, live, previewAt, previewHash }: { src: string; title: string; live: boolean; previewAt?: string; previewHash?: string }) {
  const box = useRef<HTMLDivElement>(null);
  // The card's preview opens on the part of the page the case study is about (e.g. the travel
  // protection section), under the prototype's sticky bars; the open prototype starts at the top
  const onLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    if (live || !previewAt) return;
    try {
      const doc = e.currentTarget.contentDocument;
      const target = doc?.querySelector<HTMLElement>(previewAt);
      if (!doc || !target) return;
      const bars = [...doc.querySelectorAll<HTMLElement>(".stepper, .topnav")].filter((b) => getComputedStyle(b).position === "sticky").reduce((h, b) => h + b.offsetHeight, 0);
      doc.documentElement.style.scrollBehavior = "auto";
      const top = target.getBoundingClientRect().top + (doc.defaultView?.scrollY ?? 0) - bars - 24;
      doc.defaultView?.scrollTo(0, Math.max(0, top));
    } catch {
      /* another origin: the preview stays at the top */
    }
  };
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const native = live && size !== null && size.w < 768;
  const scale = size && !native ? size.w / DESIGN_W : 1;
  const height = size && !native ? Math.round(size.h / scale) : DESIGN_H;

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-white">
      {/* Wait for a real size: a box still at 0 wide would give a NaN height */}
      {size && size.w > 0 && size.h > 0 && (
        <iframe
          src={!live && previewHash ? `${src}#${previewHash}` : src}
          title={title}
          loading="lazy"
          onLoad={onLoad}
          tabIndex={live ? 0 : -1}
          aria-hidden={live ? undefined : true}
          className={`absolute left-0 top-0 border-0 bg-white ${live ? "" : "pointer-events-none"}`}
          style={
            native
              ? { width: "100%", height: "100%" }
              : { width: DESIGN_W, height, transform: `scale(${scale})`, transformOrigin: "0 0" }
          }
        />
      )}
    </div>
  );
}

/** The open prototype: a tall frame, no wider than 1200px, with its title and the close button
 *  on a bar right above the frame's top edge and what to try under it. Esc or a click on the
 *  backdrop closes it; Tab stays inside. */
function Open({ src, title, hint, onClose }: { src: string; title: string; hint: string; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !box.current) return;
      const items = [...box.current.querySelectorAll<HTMLElement>("button, iframe")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      before?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={box}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="cs-fade fixed inset-0 z-[100] flex items-center justify-center bg-[#12020f]/85 p-[12px] backdrop-blur-[8px] md:p-[24px]"
    >
      <div className="cs-pop flex h-full max-h-[1000px] w-full max-w-[1200px] flex-col gap-[12px]">
        <div className="flex items-center justify-between gap-[16px] pl-[4px]">
          <p className="m-0 flex min-w-0 flex-1 items-center gap-[8px] font-geist text-caption text-white/70 md:text-caption-lg">
            <ClaudeMark />
            <span className="truncate">Working prototype · {title}</span>
          </p>
          <button
            ref={close}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-white/10 text-white/90 ring-1 ring-white/15 transition-colors duration-150 hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-white shadow-[0_32px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
          <Frame src={src} title={title} live />
        </div>
        <p className="m-0 text-center font-geist text-caption text-white/70 md:text-caption-lg">{hint}</p>
      </div>
    </div>,
    document.body,
  );
}

export default function PrototypeCard({
  src,
  title,
  hint,
  label,
  builtWith = "Claude Code",
  previewAt,
  previewHash,
}: {
  /** The prototype page, e.g. /prototypes/artemis-insurance.html */
  src: string;
  /** Names the prototype for screen readers and the expanded view */
  title: string;
  /** What to try, shown under the open prototype */
  hint: string;
  /** Grey support line under the card */
  label?: string;
  builtWith?: string;
  /** A selector inside the prototype that the card's preview scrolls to (the open view starts at the top) */
  previewAt?: string;
  /** Opens the card preview at this step of the prototype (e.g. "details"); the open view starts at the beginning */
  previewHash?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const show = () => setOpen(true);

  // The spotlight: the label appears and the rest of the page blurs and dims once the card
  // has scrolled well into view (most of it on screen), and while it's hovered or
  // keyboard-focused. At rest the card shows only the prototype.
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.intersectionRatio >= 0.7), { threshold: [0, 0.7, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const on = (seen || hover || focus) && !open;

  // The site's floating chrome (navbar, section pill) fades out while the spotlight is on, so
  // nothing bright sits over the dimmed page. Animated directly, so their own transitions are
  // left alone; once back to full opacity the animation is dropped and their CSS takes over.
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>(".floating-header, .cs-pill")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anims = els.map((el) => {
      el.getAnimations().filter((x) => x.id === "proto-spot").forEach((x) => x.cancel());
      const from = getComputedStyle(el).opacity;
      const anim = el.animate([{ opacity: from }, { opacity: on ? 0 : 1 }], { duration: reduce ? 0 : 400, easing: "ease-out", fill: "forwards", id: "proto-spot" });
      if (!on) anim.onfinish = () => anim.cancel();
      el.style.pointerEvents = on ? "none" : "";
      return anim;
    });
    return () => {
      if (!on) anims.forEach((x) => x.cancel());
    };
  }, [on]);

  // Leaving the page mid-spotlight must not leave the chrome hidden
  useEffect(
    () => () => {
      document.querySelectorAll<HTMLElement>(".floating-header, .cs-pill").forEach((el) => {
        el.getAnimations().filter((x) => x.id === "proto-spot").forEach((x) => x.cancel());
        el.style.pointerEvents = "";
      });
    },
    [],
  );

  return (
    <figure ref={ref} data-on={on} className="group/proto relative m-0 flex min-w-0 flex-col data-[on=true]:z-[60]">
      <span
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[#12020f]/80 opacity-0 backdrop-blur-[6px] transition-opacity duration-500 ease-out motion-reduce:transition-none group-data-[on=true]/proto:opacity-100"
      />

      <div
        aria-hidden={!on}
        className="relative z-[1] mb-[20px] flex translate-y-[6px] flex-col items-center gap-[6px] text-center opacity-0 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none group-data-[on=true]/proto:translate-y-0 group-data-[on=true]/proto:opacity-100"
      >
        <p className="m-0 font-heading text-h4-md text-white md:text-h3-md">This is a working prototype</p>
        <p className="m-0 flex items-center gap-[6px] font-geist text-caption text-white/70 md:text-caption-lg">
          Built with <ClaudeMark />
          <span className="text-white">{builtWith}</span>
        </p>
      </div>

      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="cs-pair-media relative z-[1] overflow-hidden rounded-lg border border-line-soft bg-white transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none group-data-[on=true]/proto:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.45)] hover:-translate-y-[4px]"
        style={{ aspectRatio: `${DESIGN_W} / ${DESIGN_H}` }}
      >
        <Frame src={src} title={title} live={false} previewAt={previewAt} previewHash={previewHash} />
        <button
          type="button"
          onClick={show}
          onFocus={(e) => setFocus(e.currentTarget.matches(":focus-visible"))}
          onBlur={() => setFocus(false)}
          aria-label={`Open the working prototype: ${title}`}
          data-sound="whisper"
          data-sound-click="pop"
          className="absolute inset-0 cursor-zoom-in outline-none"
        >
          <span className="absolute right-[12px] top-[12px] flex h-[36px] w-[36px] scale-90 items-center justify-center rounded-full bg-primary/80 text-white opacity-0 transition-[opacity,transform] duration-200 group-data-[on=true]/proto:scale-100 group-data-[on=true]/proto:opacity-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 4h5v5M9 20H4v-5M20 4l-6 6M4 20l6-6" />
            </svg>
          </span>
        </button>
      </div>

      <div className="relative z-[1] [&_span]:transition-colors [&_span]:duration-500 group-data-[on=true]/proto:[&_span]:text-white/60">
        <CardFooter label={label} />
      </div>

      {open && <Open src={src} title={title} hint={hint} onClose={close} />}
    </figure>
  );
}
