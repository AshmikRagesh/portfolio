"use client";

import { useRef, useState, type KeyboardEvent } from "react";

/**
 * A short history told one step at a time. A row of steps along a line (a dot, the date in
 * brand mono caps, the step's name); the picked step's dot fills grape and the line fills up
 * to it. Under the row, the picked step's figure in the heading serif, what it counts, and a
 * line of detail, which fade up whenever the step changes. Steps are tabs: click one, or use
 * the arrow keys. On phones the steps stack, one per line, without the connecting line.
 */
type Step = { when: string; title: string; figure: string; figureLabel: string; detail: string };

export default function StepStory({ steps, start = 0 }: { steps: Step[]; start?: number }) {
  const [active, setActive] = useState(start);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = steps.length - 1;
  const step = steps[active];

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = Math.max(0, Math.min(last, active + d));
    setActive(i);
    tabs.current[i]?.focus();
  };

  return (
    <div className="font-body text-heading">
      <div>
        <div role="tablist" aria-label="Steps" onKeyDown={onKey} className="relative flex flex-col gap-[16px] md:flex-row md:gap-0">
          {/* From tablet up: the line from the first dot to the last (each dot starts its
              column), and the grape fill up to the picked step. Phones stack the steps. */}
          <span
            aria-hidden="true"
            className="absolute left-[8px] top-[7px] hidden h-[2px] bg-line-soft md:block"
            style={{ width: `calc(100% / ${steps.length} * ${last})` }}
          />
          <span
            aria-hidden="true"
            className="absolute left-[8px] top-[7px] hidden h-[2px] bg-grape transition-[width] duration-[500ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none md:block"
            style={{ width: `calc(100% / ${steps.length} * ${active})` }}
          />
          {steps.map((s, i) => {
            const on = i === active;
            const reached = i <= active;
            return (
              <button
                key={s.when}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                className="group relative flex flex-1 flex-row items-start gap-[12px] rounded-xs text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape md:flex-col md:pr-[12px]"
              >
                <span
                  aria-hidden="true"
                  className={`relative mt-[2px] size-[16px] shrink-0 rounded-full border-2 transition-colors duration-300 md:mt-0 ${
                    reached ? "border-grape bg-grape" : "border-line bg-white group-hover:border-grape"
                  } ${on ? "ring-4 ring-grape-light" : ""}`}
                />
                <span className="flex flex-col gap-[4px]">
                  <span className="font-brand text-[12px] uppercase leading-[16px] tracking-[0.5px] text-muted">{s.when}</span>
                  <span
                    className={`text-[14px] leading-[20px] transition-colors duration-200 md:text-[16px] md:leading-[24px] ${
                      on ? "font-medium text-heading" : "text-secondary group-hover:text-heading"
                    }`}
                  >
                    {s.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The picked step; keyed so it fades up again on every change */}
      <div
        key={active}
        role="tabpanel"
        aria-label={step.title}
        className="mt-[32px] grid animate-[step-in_400ms_ease-out] gap-[16px] rounded-xl bg-surface p-[24px] motion-reduce:animate-none md:grid-cols-[200px_1fr] md:gap-[32px]"
      >
        <div className="flex flex-col gap-[4px]">
          <span className="font-heading text-[40px] leading-[48px] tracking-[-1px] text-grape">{step.figure}</span>
          <span className="text-[14px] leading-[20px] text-secondary">{step.figureLabel}</span>
        </div>
        <p className="m-0 text-[16px] leading-[26px] text-secondary md:text-[18px] md:leading-[30px]">{step.detail}</p>
      </div>
    </div>
  );
}
