"use client";

import { useState, type KeyboardEvent } from "react";
import useInView from "./useInView";
import { pitchFor } from "@/lib/sound/ui";

/**
 * How visit numbers travel, told on one real bar chart of visits per day. Tabs switch what
 * the chart points out, one step each:
 *   visits   every bar in grape: each visit counted once, from the tab's 20-second reports
 *   saved    nights a copy of the totals was saved get a marker under their bar
 *   weekly   seven-day blocks, Monday to Sunday, each with the total a Monday summary adds up
 *   spikes   the morning check's flood line (max of FLOOD_MIN and FLOOD_TIMES × the median
 *            of the 14 days before); a day over it is set in the warning colour
 * At rest the bars are plain, with no tooltip. Pointing at, tapping or arrowing to a day
 * shows one dark tooltip for it and dims the other bars, the same as the results chart. Bars grow in when the card scrolls into view; with reduced motion they
 * simply show. Built after ResultsCard's chart, in a plain white card.
 */
export type Day = { date: string; visits: number; saved?: boolean };
type Mode = "visits" | "saved" | "weekly" | "spikes";

// Same rule as scripts/curiosity-report.mjs (spike check)
const FLOOD_MIN = 30;
const FLOOD_TIMES = 5;
const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

const nice = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const weekday = (d: string) => new Date(`${d}T00:00:00Z`).getUTCDay(); // 0 Sunday, 1 Monday
const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

export default function RhythmChart({
  days,
  history = [],
  tabs,
}: {
  /** The days drawn, oldest first */
  days: Day[];
  /** Earlier days, only used to work out the first drawn days' "usual day" */
  history?: number[];
  /** One line per tab saying what it shows, in the case study's words */
  tabs: Record<Mode, { name: string; text: string }>;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [mode, setMode] = useState<Mode>("visits");
  const last = days.length - 1;
  // Opens on the busiest day, so the first tooltip says something
  const peak = days.reduce((best, d, i) => (d.visits > days[best].visits ? i : best), 0);
  const [active, setActive] = useState(peak);
  // Nothing is singled out at rest: the tooltip and the dimming only show while a day is
  // being pointed at, tapped or reached with the keyboard
  const [engaged, setEngaged] = useState(false);

  // The spike check's line for each day: median of the 14 days before, then the flood rule
  const all = [...history, ...days.map((d) => d.visits)];
  const flood = days.map((_, i) => {
    const k = history.length + i;
    const before = all.slice(Math.max(0, k - 14), k).sort((a, b) => a - b);
    const usual = before[7] ?? before[before.length - 1] ?? 0;
    return { usual, line: Math.max(FLOOD_MIN, FLOOD_TIMES * Math.max(1, usual)) };
  });

  // Monday-to-Sunday blocks for the weekly tab (only whole weeks)
  const weeks: { from: number; to: number; total: number; sent: string }[] = [];
  days.forEach((d, i) => {
    if (weekday(d.date) !== 1 || i + 6 > last) return;
    const total = days.slice(i, i + 7).reduce((a, b) => a + b.visits, 0);
    weeks.push({ from: i, to: i + 6, total, sent: addDays(d.date, 7) });
  });
  const weekOf = (i: number) => weeks.find((w) => i >= w.from && i <= w.to);

  const top = Math.ceil(Math.max(...days.map((d) => d.visits), ...(mode === "spikes" ? flood.map((f) => f.line) : [0])) / 10) * 10;
  const h = (v: number) => `${(v / top) * 100}%`;

  const pick = (i: number) => {
    setEngaged(true);
    setActive(Math.max(0, Math.min(last, i)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") pick(active + 1);
    else if (e.key === "ArrowLeft") pick(active - 1);
    else return;
    e.preventDefault();
  };

  const day = days[active];
  const week = weekOf(active);
  const over = (i: number) => days[i].visits >= flood[i].line;
  const tip =
    mode === "saved"
      ? `${nice(day.date)} · ${day.saved ? "Totals saved that night" : "Before nightly copies"}`
      : mode === "weekly"
        ? week
          ? `${nice(days[week.from].date)} to ${nice(days[week.to].date)} · ${week.total} visits`
          : `${nice(day.date)} · Not a whole week`
        : mode === "spikes"
          ? `${nice(day.date)} · ${day.visits} visits · flag line ${flood[active].line}${over(active) ? " · Flagged" : ""}`
          : `${nice(day.date)} · ${day.visits} visit${day.visits === 1 ? "" : "s"}`;

  const barTone = (i: number) => {
    if (mode === "saved") return days[i].saved ? "bg-grape" : "bg-grape/20";
    if (mode === "weekly") return weekOf(i) ? (weekOf(i) === week ? "bg-grape" : "bg-grape/45") : "bg-grape/20";
    if (mode === "spikes") return over(i) ? "bg-warning" : "bg-grape/30";
    return "bg-grape";
  };

  // Labels under the axis: first, last, and each Monday not crowding either end
  const ticks = days.map((d, i) => i === 0 || i === last || (weekday(d.date) === 1 && i >= 4 && i <= last - 4));

  return (
    <div ref={ref} className="rounded-lg border border-line-soft bg-white p-[20px] md:p-[32px]">
      <div role="tablist" aria-label="What the chart shows" className="flex flex-wrap gap-[8px]">
        {(Object.keys(tabs) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={m === mode}
            data-sound-click="toggle"
            onClick={() => {
              setMode(m);
              if (m === "spikes") {
                const flagged = days.findIndex((_, i) => over(i));
                if (flagged >= 0) setActive(flagged);
              }
            }}
            className={`rounded-full px-[12px] py-[4px] font-geist text-caption transition-colors duration-200 ${
              m === mode ? "bg-primary text-white" : "bg-surface text-secondary hover:text-heading"
            }`}
          >
            {tabs[m].name}
          </button>
        ))}
      </div>
      <p className="mt-[16px] min-h-[52px] max-w-[560px] font-body text-body text-secondary md:text-body-md">{tabs[mode].text}</p>

      <div className="mt-[32px] flex gap-[8px]">
        {/* Y axis: top, middle, zero */}
        <div aria-hidden="true" className="relative w-[24px] shrink-0 font-body text-caption text-muted">
          {[top, top / 2, 0].map((v, i) => (
            <span key={i} className="absolute right-0 -translate-y-1/2" style={{ top: `${i * 50}%` }}>
              {v}
            </span>
          ))}
        </div>

        <div
          role="group"
          aria-label="Visits per day. Use the arrow keys to move between days."
          tabIndex={0}
          onKeyDown={onKey}
          onFocus={() => setEngaged(true)}
          onBlur={() => setEngaged(false)}
          onMouseLeave={() => setEngaged(false)}
          className="relative h-[176px] min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4 md:h-[208px]"
        >
          {/* Grid lines */}
          {[0, 50, 100].map((g) => (
            <span key={g} aria-hidden="true" className="absolute inset-x-0 h-px bg-primary/10" style={{ top: `${g}%` }} />
          ))}

          {/* Weekly blocks: a soft grey band per whole week, its total above */}
          {mode === "weekly" &&
            weeks.map((w) => (
              <span
                key={w.from}
                aria-hidden="true"
                className={`absolute inset-y-0 rounded-sm transition-colors duration-300 ${w === week ? "bg-primary/[0.06]" : "bg-primary/[0.025]"}`}
                style={{ left: `${(w.from / days.length) * 100}%`, width: `${(7 / days.length) * 100}%` }}
              />
            ))}

          {/* The flood line, one step per day */}
          {mode === "spikes" &&
            flood.map((f, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute h-0 border-t-2 border-dashed border-warning/70"
                style={{ left: `${(i / days.length) * 100}%`, width: `${100 / days.length}%`, bottom: h(f.line) }}
              />
            ))}

          {/* Bars, each with its hit area */}
          <div className="absolute inset-0 flex items-end gap-[3px] md:gap-[4px]">
            {days.map((d, i) => (
              <button
                key={d.date}
                type="button"
                tabIndex={-1}
                aria-label={`${nice(d.date)}: ${d.visits} visits`}
                data-sound="note"
                data-pitch={pitchFor(d.visits, top)}
                onMouseEnter={() => pick(i)}
                onFocus={() => pick(i)}
                onClick={() => pick(i)}
                className="relative flex h-full min-w-0 flex-1 items-end"
              >
                <span
                  className={`block w-full rounded-t-[2px] transition-[height,background-color,opacity] duration-700 ${EASE} motion-reduce:transition-none ${barTone(i)} ${
                    engaged && i !== active ? "opacity-40" : "opacity-100"
                  }`}
                  style={{ height: inView ? (d.visits ? h(d.visits) : "2px") : "0%", transitionDelay: inView ? `${i * 18}ms` : "0ms" }}
                />
                {/* Nightly copy marker, under the axis */}
                {mode === "saved" && d.saved && (
                  <span aria-hidden="true" className="absolute -bottom-[10px] left-1/2 size-[6px] -translate-x-1/2 rounded-full bg-grape" />
                )}
              </button>
            ))}
          </div>

          {/* One tooltip above the day in focus */}
          <span
            aria-live="polite"
            className={`pointer-events-none absolute z-[1] -translate-x-1/2 whitespace-nowrap rounded-sm bg-primary px-[8px] py-[4px] font-geist text-caption text-white transition-all duration-300 ${EASE} motion-reduce:transition-none ${
              inView && engaged ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `clamp(80px, ${((active + 0.5) / days.length) * 100}%, calc(100% - 80px))`,
              bottom: `calc(${h(Math.max(day.visits, mode === "spikes" ? flood[active].line : 0))} + 12px)`,
            }}
          >
            {tip}
          </span>
        </div>
      </div>

      {/* X axis: first day, each Monday, last day (the day in focus is named in the tooltip) */}
      <div aria-hidden="true" className="ml-[32px] mt-[16px] flex gap-[3px] font-body text-caption md:gap-[4px]">
        {days.map((d, i) => (
          <span key={d.date} className="relative h-[16px] min-w-0 flex-1">
            {ticks[i] && (
              <span className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap ${engaged && i === active ? "text-heading" : "text-muted"}`}>
                {nice(d.date)}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
