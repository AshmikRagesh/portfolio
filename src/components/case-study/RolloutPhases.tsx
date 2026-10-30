"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import useInView from "./useInView";

/**
 * A rollout told in a few steps, all in Geist. One column per phase: a lane that holds the
 * new tickets from that phase, as small cards (white for Figma, grape for Helix), then a
 * segment of the progress bar, then the phase's date and name. A story for the current
 * phase sits underneath.
 * Lanes fill left to right as the rollout moves on, so the board is only full on the last
 * phase, and the grape rises column by column as Figma gives way to Helix.
 * When it scrolls into view it rises in and plays through every phase once on its own, the
 * current segment filling like a timer; clicking a column (or the arrow keys) takes over.
 * A phase's tickets drop into its lane from the bottom up, one after another; stepping back
 * lifts them out again, and the story slides in from the side it's heading to. With
 * reduced motion it opens on the last phase and simply switches.
 * The tickets are illustrative: `helix` is how many of a phase's `perPhase` tickets were
 * designed in Helix.
 */
type Phase = { when: string; title: string; detail: string; helix: number };

const DWELL = 3000;
const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

// One ticket card: two lines of text and, from md, an assignee
function Ticket({ helix }: { helix: boolean }) {
  return (
    <span
      className={`absolute inset-0 flex items-center gap-[8px] rounded-md px-[8px] md:px-[12px] ${
        helix
          ? "bg-grape shadow-[0_1px_2px_rgba(50,7,62,0.24)]"
          : "bg-white shadow-[0_1px_2px_rgba(50,7,62,0.06)] ring-1 ring-inset ring-primary/10"
      }`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
        <span className={`h-[4px] w-4/5 rounded-full ${helix ? "bg-white/80" : "bg-primary/20"}`} />
        <span className={`h-[4px] w-1/2 rounded-full ${helix ? "bg-white/40" : "bg-primary/10"}`} />
      </span>
      <span className={`hidden h-[14px] w-[14px] shrink-0 rounded-full md:block ${helix ? "bg-white/30" : "bg-primary/10"}`} />
    </span>
  );
}

export default function RolloutPhases({ phases, perPhase = 4 }: { phases: Phase[]; perPhase?: number }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.35);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cols = useRef<(HTMLButtonElement | null)[]>([]);
  const last = phases.length - 1;
  const forward = active >= prev;

  const go = (i: number) => {
    setPrev(active);
    setActive(i);
  };

  // Rise in, then play once; reduced motion lands on the last phase instead
  useEffect(() => {
    if (!shown) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(last);
      setPrev(last);
      return;
    }
    const t = window.setTimeout(() => setPlaying(true), 600);
    return () => window.clearTimeout(t);
  }, [shown, last]);

  useEffect(() => {
    if (!playing) return;
    if (active >= last) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(active + 1), DWELL);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, active, last]);

  const pick = (i: number) => {
    setPlaying(false);
    if (i !== active) go(i);
  };

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = Math.max(0, Math.min(last, active + d));
    pick(i);
    cols.current[i]?.focus();
  };

  // When a ticket lands or lifts: new lanes go one after another, each from the bottom up;
  // lifted lanes go from the last back, each from the top down. The first lane waits for
  // the board to rise in.
  const ticketDelay = (col: number, k: number) => {
    if (forward) return 400 * Math.max(0, col - (prev === active ? 0 : prev + 1)) + 90 * k + (prev === active ? 500 : 0);
    return 160 * (prev - col) + 50 * (perPhase - 1 - k);
  };

  // Each block rises in after the one before it
  const rise = (delay: number) => ({
    className: `transition-[opacity,transform] duration-[700ms] ${EASE} motion-reduce:transition-none ${
      shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
    }`,
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <div ref={ref} className="font-geist text-heading">
      <div {...rise(0)}>
        <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[8px]">
          <p className="m-0 text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-secondary">
            Where new tickets were designed
          </p>
          <span className="flex items-center gap-[16px] text-[12px] leading-[16px] text-secondary">
            <span className="flex items-center gap-[6px]">
              <span aria-hidden="true" className="h-[10px] w-[10px] rounded-xs bg-white ring-1 ring-inset ring-primary/20" />
              Figma
            </span>
            <span className="flex items-center gap-[6px]">
              <span aria-hidden="true" className="h-[10px] w-[10px] rounded-xs bg-grape" />
              Helix
            </span>
          </span>
        </div>
      </div>

      <div {...rise(120)}>
        <div
          role="group"
          aria-label="Rollout phases. Use the left and right arrow keys to move between them."
          onKeyDown={onKey}
          className="mt-[16px] grid gap-[8px] md:gap-[12px]"
          style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))` }}
        >
          {phases.map((p, col) => {
            const reached = col <= active;
            const on = col === active;
            const done = col < active;
            return (
              <button
                key={p.title}
                ref={(el) => {
                  cols.current[col] = el;
                }}
                type="button"
                aria-pressed={on}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(col)}
                className="group flex flex-col gap-[12px] rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4"
              >
                {/* The lane, with a faint slot for every ticket it will hold */}
                <span
                  aria-hidden="true"
                  className={`flex w-full flex-col-reverse gap-[6px] rounded-lg border p-[6px] transition-[background-color,border-color] duration-500 md:gap-[8px] md:p-[8px] ${
                    on
                      ? "border-grape/20 bg-grape-light/60"
                      : reached
                        ? "border-transparent bg-grape-light/30"
                        : "border-dashed border-primary/15 bg-transparent group-hover:border-grape/40"
                  }`}
                >
                  {Array.from({ length: perPhase }, (_, k) => {
                    const landed = shown && reached;
                    return (
                      <span key={k} className="relative block h-[36px] rounded-md bg-primary/[0.04] md:h-[40px]">
                        <span
                          className={`absolute inset-0 transition-[opacity,transform] motion-reduce:transition-none ${
                            landed
                              ? "translate-y-0 rotate-0 scale-100 opacity-100 duration-[600ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]"
                              : "-translate-y-[24px] -rotate-[4deg] scale-90 opacity-0 duration-[300ms] ease-in"
                          }`}
                          style={{ transitionDelay: `${ticketDelay(col, k)}ms` }}
                        >
                          <Ticket helix={k < p.helix} />
                        </span>
                      </span>
                    );
                  })}
                </span>

                {/* Its segment of the progress bar; the current one fills like a timer while it plays */}
                <span aria-hidden="true" className="block h-[4px] w-full overflow-hidden rounded-full bg-primary/10">
                  <span
                    className={`block h-full origin-left rounded-full bg-grape transition-transform duration-[500ms] ${EASE} motion-reduce:transition-none ${
                      on && playing ? "animate-[rollout-fill_linear_both]" : ""
                    }`}
                    style={{
                      transform: `scaleX(${shown && (done || on) ? 1 : 0})`,
                      animationDuration: `${DWELL}ms`,
                    }}
                  />
                </span>

                <span className="flex flex-col gap-[4px]">
                  <span
                    className={`text-balance text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] transition-colors duration-300 ${
                      on ? "text-grape" : reached ? "text-heading" : "text-muted group-hover:text-secondary"
                    }`}
                  >
                    {p.when}
                  </span>
                  <span
                    className={`hidden text-[14px] font-medium leading-[20px] transition-colors duration-300 md:block ${
                      reached ? "text-heading" : "text-muted group-hover:text-secondary"
                    }`}
                  >
                    {p.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The story; every phase shares one cell, so the height never jumps */}
      <div {...rise(260)}>
        <div className="mt-[24px] grid overflow-hidden border-t border-line-soft pt-[24px]">
          {phases.map((p, i) => {
            const on = i === active;
            const side = i < active ? "-translate-x-[24px]" : "translate-x-[24px]";
            const part = (delay: string) =>
              `transition-[opacity,transform] duration-[500ms] ${EASE} motion-reduce:transition-none ${
                on ? `translate-x-0 opacity-100 ${delay}` : `opacity-0 ${side}`
              }`;
            return (
              <div
                key={p.title}
                aria-hidden={!on}
                className={`col-start-1 row-start-1 flex flex-col ${on ? "" : "pointer-events-none"}`}
              >
                <span className={`text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-grape ${part("delay-[100ms]")}`}>
                  Step {i + 1} of {phases.length} · {p.when}
                </span>
                <span className={`mt-[8px] text-[18px] font-medium leading-[26px] text-heading ${part("delay-[150ms]")}`}>
                  {p.title}
                </span>
                <span className={`mt-[4px] text-[14px] leading-[22px] text-secondary md:text-[16px] md:leading-[26px] ${part("delay-[220ms]")}`}>
                  {p.detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {`${phases[active].when}: ${phases[active].title}. ${phases[active].detail}`}
      </p>
    </div>
  );
}
