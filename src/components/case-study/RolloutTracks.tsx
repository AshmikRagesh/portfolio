"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import useInView from "./useInView";

/**
 * The rollout as two tracks on one month axis, all in Geist. The top track is live work:
 * three new tickets a month, never paused, as small ticket cards that flip from Figma
 * (white) to Helix (grape). The bottom track is the system moving into Helix, one slot
 * under each ticket: the brand's tokens first (one wide dark bar), existing components
 * moved across when there was time (pale), and new components built as a ticket needed
 * them (grape, with a short line up to that ticket). A legend sits under the tracks, then
 * a segmented bar, one segment per step, and the current step's story.
 * Each step adds its layer: the tickets, the tokens, the moved components, the new ones
 * (whose tickets flip to Helix), then every ticket from August flips. When it scrolls into
 * view it plays through every step once, the current segment filling like a timer;
 * clicking a segment (or the arrow keys) takes over, and stepping back peels layers off.
 * Tickets land with a squash and settle, blocks pop in, lines draw up, tickets flip in a
 * wave. With reduced motion it opens on the last step and simply switches. On phones each
 * month's slots stack, and the lines between the tracks are left out.
 * The tickets and blocks are illustrative, not a count.
 */
type Step = { title: string; description: string; short: string };
type Block = { kind: "tokens" | "moved" | "new"; at: number; span?: number };
type Slot = { flipAt?: number; below?: Block };
type Month = { label: string; slots: Slot[] };

const DWELL = 3000;
const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

const BLOCK_LOOK = {
  tokens: "bg-primary text-white",
  moved: "bg-grape-light ring-1 ring-inset ring-grape/30",
  new: "bg-grape",
};

// One ticket card, both faces: Figma on the front, Helix on the back
function Ticket({ n }: { n: number }) {
  const lines = (helix: boolean) => (
    <>
      <span className={`h-[4px] rounded-full ${helix ? "bg-white/80" : "bg-primary/20"}`} style={{ width: `${[78, 62, 86][n % 3]}%` }} />
      <span className={`hidden h-[4px] rounded-full md:block ${helix ? "bg-white/40" : "bg-primary/10"}`} style={{ width: `${[48, 38, 54][n % 3]}%` }} />
    </>
  );
  const face = "absolute inset-0 flex flex-col justify-center gap-[6px] rounded-sm px-[6px] md:rounded-md md:px-[8px]";
  return (
    <>
      <span className={`${face} bg-white shadow-[0_1px_2px_rgba(50,7,62,0.06)] ring-1 ring-inset ring-primary/10`} style={{ backfaceVisibility: "hidden" }}>
        {lines(false)}
      </span>
      <span
        className={`${face} bg-grape shadow-[0_1px_2px_rgba(50,7,62,0.24)]`}
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        {lines(true)}
      </span>
    </>
  );
}

export default function RolloutTracks({ months, steps }: { months: Month[]; steps: Step[] }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.3);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const [playing, setPlaying] = useState(false);
  const segs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = steps.length - 1;
  const first = prev === active;

  const go = (i: number) => {
    setPrev(active);
    setActive(i);
  };

  // Play once when it's first seen; reduced motion lands on the last step instead
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
    segs.current[i]?.focus();
  };

  // When something that changes at step `at` moves: forward, earlier steps' changes first,
  // then month by month; back, the latest first. Things not changing keep no delay.
  const delay = (at: number, m: number, k: number) => {
    const lo = Math.min(prev, active);
    const hi = Math.max(prev, active);
    if (first || at <= lo || at > hi) return 0;
    return active > prev ? 500 * (at - prev - 1) + 140 * m + 60 * k + 150 : 200 * (prev - at) + 60 * (months.length - 1 - m);
  };

  const cols = { gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` };
  const laneLabel = "text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-muted";

  const rise = (d: number) => ({
    className: `transition-[opacity,transform] duration-[700ms] ${EASE} motion-reduce:transition-none ${
      shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
    }`,
    style: { transitionDelay: `${d}ms` },
  });

  return (
    <div ref={ref} className="font-geist text-heading">
      <div {...rise(0)}>
        <div className="rounded-xl border border-line-soft bg-white p-[16px] md:p-[24px]">
          <div className="grid gap-x-[16px] md:grid-cols-[96px_minmax(0,1fr)]">
            {/* Month axis */}
            <span className="hidden md:block" />
            <div className="grid gap-[6px] md:gap-[12px]" style={cols}>
              {months.map((m) => (
                <span key={m.label} className="pb-[8px] text-[12px] font-medium uppercase leading-[16px] text-muted">
                  {m.label}
                </span>
              ))}
            </div>

            {/* Live tickets */}
            <span className={`${laneLabel} mb-[8px] self-center md:mb-0`}>Live tickets</span>
            <div className="grid gap-[6px] md:gap-[12px]" style={cols}>
              {months.map((m, mi) => (
                <div
                  key={m.label}
                  className="flex flex-col gap-[4px] rounded-md bg-surface p-[4px] md:flex-row md:gap-[6px] md:p-[6px]"
                  style={{ perspective: 800 }}
                >
                  {m.slots.map((s, k) => {
                    const helix = s.flipAt !== undefined && active >= s.flipAt;
                    return (
                      <span
                        key={k}
                        className={`relative block h-[24px] motion-reduce:animate-none md:h-[44px] md:flex-1 ${
                          shown ? "animate-[rollout-land_700ms_cubic-bezier(0.2,0.7,0.2,1)_both]" : "opacity-0"
                        }`}
                        style={{ animationDelay: `${300 + mi * 160 + k * 70}ms` }}
                      >
                        <span
                          className="relative block h-full transition-transform duration-[640ms] ease-[cubic-bezier(0.3,1.3,0.5,1)] motion-reduce:transition-none"
                          style={{
                            transformStyle: "preserve-3d",
                            transform: `rotateY(${helix ? 180 : 0}deg)`,
                            transitionDelay: `${s.flipAt !== undefined ? delay(s.flipAt, mi, k) + (s.below?.kind === "new" ? 250 : 0) : 0}ms`,
                          }}
                        >
                          <Ticket n={mi * 3 + k} />
                        </span>
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Into Helix */}
            <span className={`${laneLabel} mb-[8px] mt-[16px] self-center md:mb-0 md:mt-[20px]`}>Into Helix</span>
            <div className="mt-0 grid gap-[6px] md:mt-[20px] md:gap-[12px]" style={cols}>
              {months.map((m, mi) => (
                <div key={m.label} className="flex flex-col gap-[4px] rounded-md bg-grape-light/25 p-[4px] md:flex-row md:gap-[6px] md:p-[6px]">
                  {m.slots.map((s, k) => {
                    // A block spanning slots covers the ones after it
                    const covered = m.slots.slice(0, k).some((o, j) => o.below?.span && j + o.below.span > k);
                    if (covered) return null;
                    const b = s.below;
                    const on = !!b && shown && active >= b.at;
                    const grow = b?.span ?? 1;
                    return (
                      <span
                        key={k}
                        // Slots stack on phones, so they only share the row's width from md
                        className={`relative block md:h-[28px] ${grow === 2 ? "h-[36px] md:flex-[2]" : "h-[16px] md:flex-1"}`}
                      >
                        {b && (
                          <>
                            {/* A new component's line up to the ticket that needed it */}
                            {b.kind === "new" && (
                              <span
                                aria-hidden="true"
                                className={`absolute -top-[20px] left-1/2 hidden h-[20px] w-[2px] -translate-x-1/2 origin-bottom bg-grape transition-transform duration-[300ms] ease-out motion-reduce:transition-none md:block ${
                                  on ? "scale-y-100" : "scale-y-0"
                                }`}
                                style={{ transitionDelay: `${delay(b.at, mi, k) + (on ? 200 : 0)}ms` }}
                              />
                            )}
                            <span
                              className={`absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm text-[12px] font-medium leading-[16px] motion-reduce:transition-none md:rounded-md ${BLOCK_LOOK[b.kind]} ${
                                b.kind === "tokens"
                                  ? `origin-left transition-[transform,opacity] duration-[600ms] ${EASE} ${on ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`
                                  : `transition-[transform,opacity] duration-[500ms] ease-[cubic-bezier(0.34,1.5,0.64,1)] ${
                                      on ? "translate-y-0 scale-100 opacity-100" : "translate-y-[6px] scale-75 opacity-0"
                                    }`
                              }`}
                              style={{ transitionDelay: `${delay(b.at, mi, k)}ms` }}
                            >
                              {b.kind === "tokens" && <span className="hidden md:inline">Tokens</span>}
                            </span>
                          </>
                        )}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <ul className="m-0 mt-[20px] flex list-none flex-wrap gap-x-[16px] gap-y-[8px] border-t border-line-soft p-0 pt-[16px] text-[12px] leading-[16px] text-secondary">
            {[
              ["Ticket in Figma", "h-[12px] w-[16px] rounded-xs bg-white ring-1 ring-inset ring-primary/20"],
              ["Ticket in Helix", "h-[12px] w-[16px] rounded-xs bg-grape"],
              ["Tokens", "h-[8px] w-[16px] rounded-xs bg-primary"],
              ["Moved from Figma", "h-[8px] w-[16px] rounded-xs bg-grape-light ring-1 ring-inset ring-grape/30"],
              ["Built new", "h-[8px] w-[16px] rounded-xs bg-grape"],
            ].map(([label, look]) => (
              <li key={label} className="flex items-center gap-[6px]">
                <span aria-hidden="true" className={look} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The steps: one segment each; the current one fills like a timer while it plays */}
      <div {...rise(200)}>
        <div
          role="group"
          aria-label="Rollout steps. Use the left and right arrow keys to move between them."
          onKeyDown={onKey}
          className="mt-[24px] grid gap-[6px] md:gap-[12px]"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        >
          {steps.map((s, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <button
                key={s.title}
                ref={(el) => {
                  segs.current[i] = el;
                }}
                type="button"
                aria-pressed={on}
                aria-label={`Step ${i + 1}: ${s.title}`}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                className="group flex flex-col gap-[10px] rounded-sm pt-[4px] text-left outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4"
              >
                <span aria-hidden="true" className="block h-[4px] w-full overflow-hidden rounded-full bg-primary/10">
                  <span
                    className={`block h-full origin-left rounded-full bg-grape transition-transform duration-[500ms] ${EASE} motion-reduce:transition-none ${
                      on && playing ? "animate-[rollout-fill_linear_both]" : ""
                    }`}
                    style={{ transform: `scaleX(${shown && (done || on) ? 1 : 0})`, animationDuration: `${DWELL}ms` }}
                  />
                </span>
                <span aria-hidden="true" className="flex flex-col gap-[2px]">
                  <span className={`text-[12px] font-medium tabular-nums leading-[16px] ${on ? "text-grape" : "text-muted"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`hidden text-[14px] font-medium leading-[20px] transition-colors duration-300 md:block ${
                      on || done ? "text-heading" : "text-muted group-hover:text-secondary"
                    }`}
                  >
                    {s.short}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The story; every step shares one cell, so the height never jumps */}
      <div {...rise(320)}>
        <div className="mt-[20px] grid overflow-hidden">
          {steps.map((s, i) => {
            const on = i === active;
            const side = i < active ? "-translate-x-[24px]" : "translate-x-[24px]";
            const part = (d: string) =>
              `transition-[opacity,transform] duration-[500ms] ${EASE} motion-reduce:transition-none ${
                on ? `translate-x-0 opacity-100 ${d}` : `opacity-0 ${side}`
              }`;
            return (
              <div key={s.title} aria-hidden={!on} className={`col-start-1 row-start-1 flex flex-col ${on ? "" : "pointer-events-none"}`}>
                <span className={`text-[18px] font-medium leading-[26px] text-heading ${part("delay-[120ms]")}`}>{s.title}</span>
                <span className={`mt-[4px] text-[14px] leading-[22px] text-secondary md:text-[16px] md:leading-[26px] ${part("delay-[200ms]")}`}>
                  {s.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {`Step ${active + 1} of ${steps.length}: ${steps[active].title}. ${steps[active].description}`}
      </p>
    </div>
  );
}
