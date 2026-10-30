"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, RotateCcw } from "lucide-react";
import useInView from "./useInView";

/**
 * A rollout told in a few steps, all in Geist. A row of tickets sits on top, each one a
 * small tile that flips from Figma (white) to Helix (grape) as the rollout moves on, so
 * the shift reads at a glance. Under it, a stepper: one dot per phase on a track that
 * fills up to the current one, then a card with that phase's story.
 * When it scrolls into view it plays through every phase once, on its own; clicking a
 * step (or the arrow keys on the stepper) takes over, and Replay plays it again. Tiles
 * flip one after another, starting from the edge between Figma and Helix, and the card
 * slides its new story in. With reduced motion it opens on the last phase and simply
 * switches.
 * The tiles are illustrative: `helix` is how many of `tickets` were designed in Helix.
 */
type Phase = { when: string; title: string; detail: string; helix: number };

const DWELL = 2600;

// A plain-words read of the mix, for the status line and screen readers
function mix(helix: number, total: number) {
  if (helix >= total) return "All in Helix";
  if (helix === 0) return "All in Figma";
  if (helix / total >= 0.4) return "Half and half";
  return "Mostly Figma";
}

export default function RolloutPhases({ phases, tickets = 12 }: { phases: Phase[]; tickets?: number }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.4);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  const steps = useRef<(HTMLButtonElement | null)[]>([]);
  const last = phases.length - 1;

  const go = (i: number) => {
    setPrev(active);
    setActive(i);
  };

  // Start playing the first time it's seen; reduced motion lands on the last phase instead
  useEffect(() => {
    if (!shown) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(last);
      setPrev(last);
      return;
    }
    setPlaying(true);
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
  }, [playing, active, last, run]);

  const pick = (i: number) => {
    setPlaying(false);
    go(i);
  };

  const replay = () => {
    setPrev(active);
    setActive(0);
    setRun((r) => r + 1);
    setPlaying(true);
  };

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = Math.max(0, Math.min(last, active + d));
    pick(i);
    steps.current[i]?.focus();
  };

  const now = phases[active].helix;
  const was = phases[prev].helix;
  const forward = now >= was;

  return (
    <div ref={ref} className="rounded-lg bg-grape-light/30 p-[16px] font-geist text-heading md:p-[32px]">
      {/* The tickets */}
      <div className="flex items-center justify-between gap-[16px]">
        <p className="m-0 text-[12px] font-medium uppercase leading-[16px] text-muted">Where new tickets were designed</p>
        <span className="flex items-center gap-[12px] text-[12px] leading-[16px] text-secondary">
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

      <div aria-hidden="true" className="mt-[16px] grid grid-cols-6 gap-[6px] md:grid-cols-12 md:gap-[8px]" style={{ perspective: 800 }}>
        {Array.from({ length: tickets }, (_, i) => {
          const helix = i < now;
          // Tiles that change flip in a wave, starting at the edge between Figma and Helix
          const changing = forward ? i >= was && i < now : i >= now && i < was;
          const order = forward ? i - was : was - 1 - i;
          return (
            <span
              key={i}
              className="relative block h-[40px] transition-transform duration-[600ms] ease-[cubic-bezier(0.3,1.4,0.5,1)] motion-reduce:transition-none md:h-[56px]"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${helix ? 180 : 0}deg)`,
                transitionDelay: changing ? `${order * 70}ms` : "0ms",
              }}
            >
              {/* Each face carries two skeleton lines, so the tiles read as tickets */}
              <span
                className="absolute inset-0 flex flex-col gap-[4px] rounded-md bg-white p-[8px] ring-1 ring-inset ring-primary/10"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="h-[4px] w-3/5 rounded-full bg-primary/10" />
                <span className="h-[4px] w-2/5 rounded-full bg-primary/10" />
              </span>
              <span
                className="absolute inset-0 overflow-hidden rounded-md bg-grape"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <span className="flex flex-col gap-[4px] p-[8px]">
                  <span className="h-[4px] w-3/5 rounded-full bg-white/40" />
                  <span className="h-[4px] w-2/5 rounded-full bg-white/40" />
                </span>
                {/* A sheen passes over the finished row on the last phase */}
                {active === last && (
                  <span
                    key={run}
                    className="absolute inset-y-0 -left-full w-full animate-[rollout-sheen_1200ms_ease-out_both] bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] motion-reduce:hidden"
                    style={{ animationDelay: `${300 + i * 40}ms` }}
                  />
                )}
              </span>
            </span>
          );
        })}
      </div>

      <p className="m-0 mt-[12px] text-[14px] leading-[20px]">
        <span key={mix(now, tickets)} className="inline-block animate-[cs-fade_400ms_ease-out_both] font-medium text-grape">
          {mix(now, tickets)}
        </span>
      </p>

      {/* The stepper */}
      <div className="relative mt-[32px]">
        <div aria-hidden="true" className="absolute left-[8px] right-[8px] top-[8px] h-[2px] -translate-y-1/2 rounded-full bg-primary/10">
          <span
            className="block h-full origin-left rounded-full bg-grape transition-transform duration-[700ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none"
            style={{ transform: `scaleX(${active / last})` }}
          />
        </div>
        <div
          role="group"
          aria-label="Rollout phases. Use the left and right arrow keys to move between them."
          onKeyDown={onKey}
          className="relative grid gap-[8px]"
          style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))` }}
        >
          {phases.map((p, i) => {
            const done = i < active;
            const on = i === active;
            return (
              <button
                key={p.title}
                ref={(el) => {
                  steps.current[i] = el;
                }}
                type="button"
                aria-pressed={on}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                className="group flex flex-col items-start gap-[12px] rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4 focus-visible:ring-offset-grape-light"
              >
                <span
                  aria-hidden="true"
                  className={`relative flex h-[16px] w-[16px] items-center justify-center rounded-full transition-[background-color,box-shadow] duration-300 ${
                    done || on ? "bg-grape" : "bg-white shadow-[inset_0_0_0_2px_rgba(50,7,62,0.16)] group-hover:shadow-[inset_0_0_0_2px_rgba(157,19,106,0.5)]"
                  }`}
                  style={{ transitionDelay: done || on ? "350ms" : "0ms" }}
                >
                  {done && <Check size={10} strokeWidth={3} className="text-white" />}
                  {on && (
                    <>
                      <span className="h-[6px] w-[6px] rounded-full bg-white" />
                      <span
                        key={`${active}-${run}`}
                        className="absolute inset-0 animate-[rollout-ring_1600ms_ease-out_infinite] rounded-full ring-2 ring-grape motion-reduce:hidden"
                      />
                    </>
                  )}
                </span>
                <span className="flex flex-col gap-[4px]">
                  <span
                    className={`text-[12px] font-medium uppercase leading-[16px] transition-colors duration-300 ${
                      on ? "text-grape" : "text-muted"
                    }`}
                  >
                    {p.when}
                  </span>
                  <span
                    className={`hidden text-[14px] font-medium leading-[20px] transition-colors duration-300 md:block ${
                      done || on ? "text-heading" : "text-muted group-hover:text-secondary"
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

      {/* The story for the current phase; every card shares one cell, so the height never jumps */}
      <div className="mt-[24px] grid rounded-lg bg-white p-[16px] shadow-[0_1px_2px_rgba(50,7,62,0.06)] ring-1 ring-primary/5 md:p-[20px]">
        {phases.map((p, i) => (
          <div
            key={p.title}
            aria-hidden={i !== active}
            className={`col-start-1 row-start-1 flex flex-col gap-[4px] transition-[opacity,transform] duration-[500ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
              i === active
                ? "translate-y-0 opacity-100 delay-[150ms]"
                : `pointer-events-none opacity-0 ${i < active ? "-translate-y-[8px]" : "translate-y-[8px]"}`
            }`}
          >
            {/* Phones show only the dates on the stepper, so the date leads the card there */}
            <p className="m-0 text-[12px] font-medium uppercase leading-[16px] text-grape md:hidden">{p.when}</p>
            <p className="m-0 text-[16px] font-medium leading-[24px] text-heading">{p.title}</p>
            <p className="m-0 text-[14px] leading-[22px] text-secondary">{p.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-[16px] flex items-center justify-between gap-[16px]">
        {/* A slim timer while it plays itself */}
        <span aria-hidden="true" className={`h-[2px] w-[64px] overflow-hidden rounded-full bg-primary/10 transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}>
          {playing && (
            <span
              key={`${active}-${run}`}
              className="block h-full origin-left animate-[rollout-timer_linear_both] rounded-full bg-grape/60"
              style={{ animationDuration: `${DWELL}ms` }}
            />
          )}
        </span>
        <button
          type="button"
          onClick={replay}
          className="inline-flex h-[32px] items-center gap-[6px] rounded-md px-[10px] text-[12px] font-medium uppercase leading-[16px] text-secondary transition-colors duration-200 hover:bg-white hover:text-grape focus-visible:outline focus-visible:outline-2 focus-visible:outline-grape"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Replay
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {`${phases[active].when}: ${phases[active].title}. ${mix(now, tickets)}. ${phases[active].detail}`}
      </p>
    </div>
  );
}
