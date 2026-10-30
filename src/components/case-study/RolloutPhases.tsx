"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, Code2, Frame } from "lucide-react";
import useInView from "./useInView";

/**
 * A rollout told in a few steps, all in Geist.
 * On top, a dotted board of tickets: each a small ticket stub (notched sides, a thumbnail,
 * two lines of text) that flips from a Figma ticket (white, a frame mark) to a Helix one
 * (grape, a code mark and a tick) as the rollout moves on, with a pill reading the mix.
 * Under it, a stepper: one dot per phase on a track that fills up to the current one, then
 * a card with that phase's story.
 * When it scrolls into view the board and its tickets rise in, then it plays through every
 * phase once on its own; clicking a step (or the arrow keys on the stepper) takes over.
 * Changing tickets hop and flip one after another, starting from the edge between Figma and
 * Helix; the story slides in from the side it's heading to. With reduced motion it opens on
 * the last phase and simply switches.
 * The tickets are illustrative: `helix` is how many of `tickets` were designed in Helix.
 */
type Phase = { when: string; title: string; detail: string; helix: number };

const DWELL = 2800;
const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";
const MIXES = ["Mostly Figma", "Half and half", "All in Helix"];

// Notched sides, like a ticket stub; the notches show the board through
const NOTCH =
  "radial-gradient(circle at 0 50%, transparent 5px, #000 5.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 5px, #000 5.5px) right / 51% 100% no-repeat";
const FACE = { WebkitMask: NOTCH, mask: NOTCH, backfaceVisibility: "hidden" as const };

// A plain-words read of the mix, for the pill and screen readers
function mix(helix: number, total: number) {
  if (helix >= total) return "All in Helix";
  if (helix / total >= 0.4) return "Half and half";
  return "Mostly Figma";
}

// Both faces of one ticket: Figma on the front, Helix on the back
function Ticket({ sheen, delay }: { sheen: boolean; delay: number }) {
  return (
    <>
      <span style={FACE} className="absolute inset-0 flex flex-col rounded-md bg-white p-[6px] md:p-[8px]">
        <span className="h-[12px] rounded-xs bg-primary/[0.06] md:h-[20px]" />
        <span className="mt-[6px] h-[4px] w-4/5 rounded-full bg-primary/10" />
        <span className="mt-[4px] hidden h-[4px] w-1/2 rounded-full bg-primary/10 md:block" />
        <Frame size={12} strokeWidth={2} aria-hidden="true" className="mt-auto text-primary/25" />
      </span>
      <span
        style={{ ...FACE, transform: "rotateY(180deg)" }}
        className="absolute inset-0 flex flex-col overflow-hidden rounded-md bg-grape p-[6px] md:p-[8px]"
      >
        <span className="h-[12px] rounded-xs bg-white/15 md:h-[20px]" />
        <span className="mt-[6px] h-[4px] w-4/5 rounded-full bg-white/40" />
        <span className="mt-[4px] hidden h-[4px] w-1/2 rounded-full bg-white/40 md:block" />
        <span className="mt-auto flex items-center justify-between">
          <Code2 size={12} strokeWidth={2} aria-hidden="true" className="text-white/70" />
          <span className="flex h-[12px] w-[12px] items-center justify-center rounded-full bg-white">
            <Check size={8} strokeWidth={4} className="text-grape" />
          </span>
        </span>
        {/* A sheen passes over the finished row */}
        {sheen && (
          <span
            className="absolute inset-y-0 -left-full w-full animate-[rollout-sheen_1200ms_ease-out_both] bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.4)_50%,transparent_70%)] motion-reduce:hidden"
            style={{ animationDelay: `${delay}ms` }}
          />
        )}
      </span>
    </>
  );
}

export default function RolloutPhases({ phases, tickets = 12 }: { phases: Phase[]; tickets?: number }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.35);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = useRef<(HTMLButtonElement | null)[]>([]);
  const tiles = useRef<(HTMLSpanElement | null)[]>([]);
  const last = phases.length - 1;

  const now = phases[active].helix;
  const was = phases[prev].helix;
  const forward = now >= was;
  // Changing tickets go in a wave, starting at the edge between Figma and Helix
  const order = (i: number) => (forward ? i - was : was - 1 - i);
  const changing = (i: number) => (forward ? i >= was && i < now : i >= now && i < was);

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
    const t = window.setTimeout(() => setPlaying(true), 900);
    return () => window.clearTimeout(t);
  }, [shown, last]);

  useEffect(() => {
    if (!playing) return;
    if (active >= last) {
      setPlaying(false);
      return;
    }
    // The first step is a beat shorter, since the board has only just arrived
    const t = window.setTimeout(() => go(active + 1), active === 0 ? 1400 : DWELL);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, active, last]);

  // Each changing ticket hops while it flips
  useEffect(() => {
    if (prev === active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    tiles.current.forEach((el, i) => {
      if (!el || !changing(i)) return;
      el.animate(
        [
          { transform: "translateY(0) scale(1)" },
          { transform: "translateY(-10px) scale(1.06)", offset: 0.45 },
          { transform: "translateY(0) scale(1)" },
        ],
        { duration: 640, delay: order(i) * 70, easing: "cubic-bezier(0.3,0.7,0.3,1)" },
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, prev]);

  const pick = (i: number) => {
    setPlaying(false);
    go(i);
  };

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = Math.max(0, Math.min(last, active + d));
    pick(i);
    steps.current[i]?.focus();
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
      {/* The board */}
      <div
        className="relative overflow-hidden rounded-lg bg-grape-light/40 p-[16px] ring-1 ring-inset ring-grape/10 md:p-[24px]"
        style={{ backgroundImage: "radial-gradient(rgba(50,7,62,0.08) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
      >
        <div {...rise(0)}>
          <div className="flex flex-wrap items-center justify-between gap-[12px]">
            <p className="m-0 text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-secondary">
              Where new tickets were designed
            </p>
            <span className="flex items-center gap-[8px] text-[12px] leading-[16px] text-secondary">
              <span className="flex items-center gap-[6px] rounded-full bg-white px-[10px] py-[4px] ring-1 ring-inset ring-primary/10">
                <Frame size={12} aria-hidden="true" className="text-primary/40" />
                Figma
              </span>
              <span className="flex items-center gap-[6px] rounded-full bg-grape px-[10px] py-[4px] text-white">
                <Code2 size={12} aria-hidden="true" />
                Helix
              </span>
            </span>
          </div>
        </div>

        <div aria-hidden="true" className="mt-[20px] grid grid-cols-6 gap-[8px] md:grid-cols-12" style={{ perspective: 900 }}>
          {Array.from({ length: tickets }, (_, i) => (
            <span
              key={i}
              className={`block transition-[opacity,transform] duration-[600ms] ${EASE} motion-reduce:transition-none ${
                shown ? "translate-y-0 opacity-100" : "translate-y-[20px] opacity-0"
              }`}
              style={{ transitionDelay: `${120 + i * 40}ms` }}
            >
              <span
                ref={(el) => {
                  tiles.current[i] = el;
                }}
                className="block"
              >
                <span
                  className="relative block h-[56px] transition-transform duration-[640ms] ease-[cubic-bezier(0.3,1.3,0.5,1)] motion-reduce:transition-none md:h-[72px]"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${i < now ? 180 : 0}deg)`,
                    transitionDelay: changing(i) ? `${order(i) * 70}ms` : "0ms",
                  }}
                >
                  <Ticket sheen={active === last && prev !== last} delay={300 + i * 50} />
                </span>
              </span>
            </span>
          ))}
        </div>

        {/* The mix, as a pill whose words roll over when it changes */}
        <div {...rise(500)}>
          <span className="mt-[16px] inline-flex items-center gap-[8px] rounded-full bg-white py-[6px] pl-[10px] pr-[12px] text-[14px] font-medium leading-[20px] text-grape shadow-[0_1px_2px_rgba(50,7,62,0.08)] ring-1 ring-inset ring-grape/10">
            <span aria-hidden="true" className="relative flex h-[8px] w-[8px]">
              <span className="absolute inset-0 animate-ping rounded-full bg-grape/40 motion-reduce:hidden" />
              <span className="relative h-[8px] w-[8px] rounded-full bg-grape" />
            </span>
            <span className="inline-grid overflow-hidden">
              {MIXES.map((m) => {
                const on = m === mix(now, tickets);
                return (
                  <span
                    key={m}
                    aria-hidden={!on}
                    className={`col-start-1 row-start-1 whitespace-nowrap transition-[opacity,transform] duration-[500ms] ${EASE} motion-reduce:transition-none ${
                      on ? "translate-y-0 opacity-100" : forward ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"
                    }`}
                  >
                    {m}
                  </span>
                );
              })}
            </span>
          </span>
        </div>
      </div>

      {/* The stepper */}
      <div {...rise(650)}>
        <div className="relative mt-[32px]">
          <div aria-hidden="true" className="absolute left-[10px] right-[10px] top-[10px] h-[2px] -translate-y-1/2 rounded-full bg-primary/10">
            <span
              className={`block h-full origin-left rounded-full bg-grape transition-transform duration-[900ms] ${EASE} motion-reduce:transition-none`}
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
                  className="group flex flex-col items-start gap-[12px] rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4"
                >
                  {/* The dot lights once the track has reached it */}
                  <span
                    aria-hidden="true"
                    className={`relative flex h-[20px] w-[20px] items-center justify-center rounded-full transition-[background-color,box-shadow,transform] duration-300 ${
                      done || on
                        ? "bg-grape"
                        : "bg-white shadow-[inset_0_0_0_2px_rgba(50,7,62,0.14)] group-hover:scale-110 group-hover:shadow-[inset_0_0_0_2px_rgba(157,19,106,0.5)]"
                    } ${on ? "scale-110" : ""}`}
                    style={{ transitionDelay: done || on ? "450ms" : "0ms" }}
                  >
                    {done && <Check size={12} strokeWidth={3} className="animate-[cs-pop_300ms_ease-out_both] text-white" />}
                    {on && (
                      <>
                        <span className="h-[8px] w-[8px] animate-[cs-pop_300ms_450ms_ease-out_both] rounded-full bg-white" />
                        <span
                          key={active}
                          className="absolute inset-0 animate-[rollout-ring_1800ms_600ms_ease-out_infinite] rounded-full ring-2 ring-grape motion-reduce:hidden"
                        />
                      </>
                    )}
                  </span>
                  <span className="flex flex-col gap-[4px]">
                    <span
                      className={`text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] transition-colors duration-300 ${
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
      </div>

      {/* The story; every card shares one cell, so the height never jumps */}
      <div {...rise(800)}>
        <div className="mt-[24px] grid overflow-hidden rounded-lg bg-surface p-[16px] ring-1 ring-inset ring-primary/5 md:p-[24px]">
          {phases.map((p, i) => {
            const on = i === active;
            const side = i < active ? "-translate-x-[24px]" : "translate-x-[24px]";
            return (
              <div
                key={p.title}
                aria-hidden={!on}
                className={`col-start-1 row-start-1 grid grid-cols-[auto_1fr] items-start gap-x-[16px] ${on ? "" : "pointer-events-none"}`}
              >
                <span
                  className={`row-span-2 flex h-[40px] w-[40px] items-center justify-center rounded-md bg-grape text-[14px] font-medium tabular-nums text-white transition-[opacity,transform] duration-[500ms] ${EASE} motion-reduce:transition-none ${
                    on ? "scale-100 opacity-100 delay-[100ms]" : "scale-75 opacity-0"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`flex flex-col gap-[4px] transition-[opacity,transform] duration-[500ms] ${EASE} motion-reduce:transition-none ${
                    on ? "translate-x-0 opacity-100 delay-[150ms]" : `opacity-0 ${side}`
                  }`}
                >
                  {/* Phones show only the dates on the stepper, so the date leads the card there */}
                  <span className="text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-grape md:hidden">{p.when}</span>
                  <span className="text-[16px] font-medium leading-[24px] text-heading">{p.title}</span>
                </span>
                <span
                  className={`mt-[4px] text-[14px] leading-[22px] text-secondary transition-[opacity,transform] duration-[500ms] ${EASE} motion-reduce:transition-none ${
                    on ? "translate-x-0 opacity-100 delay-[250ms]" : `opacity-0 ${side}`
                  }`}
                >
                  {p.detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {`${phases[active].when}: ${phases[active].title}. ${mix(now, tickets)}. ${phases[active].detail}`}
      </p>
    </div>
  );
}
