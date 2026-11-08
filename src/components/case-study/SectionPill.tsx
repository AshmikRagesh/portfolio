"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface CaseStudySection {
  id: string;
  label: string;
}

const pad = (i: number) => String(i).padStart(2, "0");

/**
 * Bottom-centre index for a case study. Shows the chapter being read, with a bar
 * filling through it; opens a timeline of every chapter. Styles: .cs-pill in globals.css.
 */
export default function SectionPill({ sections }: { sections: CaseStudySection[] }) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // How far through the active chapter the middle of the screen is, 0–1
  const [progress, setProgress] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  // The title sliding out while the new one slides in
  const [leaving, setLeaving] = useState<{ index: number; dir: "up" | "down" } | null>(null);
  const shown = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sizersRef = useRef<HTMLSpanElement>(null);

  // Track the reading position
  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const y = window.scrollY;
      const hero = document.querySelector<HTMLElement>("[data-cs-hero]");
      // Step aside once the footer comes up, so its links and bell stay reachable
      const main = document.querySelector<HTMLElement>("[data-cs-main]");
      const footerShowing = main ? main.getBoundingClientRect().bottom < window.innerHeight : false;
      setVisible(y > (hero ? hero.offsetHeight / 2 : 260) && !footerShowing);

      const tops = sections.map(
        ({ id }) => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + y
      );
      const last = document.getElementById(sections[sections.length - 1]?.id ?? "");
      const end = last ? last.getBoundingClientRect().bottom + y : document.body.scrollHeight;
      const line = y + window.innerHeight / 2;
      const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;

      let index = 0;
      tops.forEach((top, i) => {
        if (top <= line) index = i;
      });
      const start = tops[index];
      const stop = tops[index + 1] ?? end;
      const through = atBottom && index === sections.length - 1
        ? 1
        : Math.min(1, Math.max(0, (line - start) / Math.max(1, stop - start)));

      setActive(index);
      setProgress(through);
    };

    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  // Swap titles: the old one leaves the way the reader is moving
  useEffect(() => {
    if (active === shown.current) return;
    setLeaving({ index: shown.current, dir: active > shown.current ? "up" : "down" });
    shown.current = active;
  }, [active]);

  // Measure every title so the label can ease between widths
  useLayoutEffect(() => {
    const measure = () => {
      const spans = sizersRef.current?.children;
      if (spans) setWidths(Array.from(spans, (s) => Math.ceil((s as HTMLElement).offsetWidth)));
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [sections]);

  // Close on a click outside or Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hidden pills close, so they never reappear already open
  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  const goTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    setOpen(false);
  };

  const span = Math.max(1, sections.length - 1);
  const overall = Math.min(1, (active + progress) / span);
  const title = (i: number) => (
    <>
      <span className="cs-pill-num">{pad(i)}</span>
      {sections[i]?.label}
    </>
  );

  return (
    <div
      ref={rootRef}
      className="cs-pill"
      data-visible={visible}
      data-open={open}
      inert={!visible}
    >
      <div className="cs-pill-panel" id="cs-timeline-panel" inert={!open}>
        <nav
          className="cs-timeline"
          aria-label="In this case study"
          style={{ "--span": span, "--progress": overall } as React.CSSProperties}
        >
          <span className="cs-timeline-track" aria-hidden="true">
            <span />
          </span>
          <ol>
            {sections.map(({ id }, i) => (
              <li
                key={id}
                data-reached={i <= active}
                data-current={i === active}
                style={{ "--i": i } as React.CSSProperties}
              >
                <a
                  href={`#${id}`}
                  onClick={(e) => goTo(e, id)}
                  aria-current={i === active ? "location" : undefined}
                >
                  <span className="cs-timeline-dot" aria-hidden="true" />
                  {title(i)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <button
        ref={buttonRef}
        type="button"
        className="cs-pill-button"
        aria-expanded={open}
        aria-controls="cs-timeline-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="cs-pill-label" style={widths[active] ? { width: widths[active] } : undefined}>
          {leaving && (
            <span
              key={`out-${leaving.index}`}
              className="cs-pill-slot"
              data-motion={`out-${leaving.dir}`}
              aria-hidden="true"
              onAnimationEnd={() => setLeaving(null)}
            >
              {title(leaving.index)}
            </span>
          )}
          <span
            key={`in-${active}`}
            className="cs-pill-slot"
            data-motion={leaving ? `in-${leaving.dir}` : undefined}
          >
            {title(active)}
          </span>
        </span>
        <span className="cs-pill-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
        <svg
          className="cs-pill-chevron"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 15 6-6 6 6" />
        </svg>
        <span className="sr-only"> — show all sections</span>
        <span ref={sizersRef} className="cs-pill-sizers" aria-hidden="true">
          {sections.map(({ id }, i) => (
            <span key={id}>{title(i)}</span>
          ))}
        </span>
      </button>
    </div>
  );
}
