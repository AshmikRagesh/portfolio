"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import useInView from "./useInView";

/**
 * A results card, sized to sit in the text column: the headline number with what it
 * means and a short paragraph, two supporting stats in one split panel (each as
 * before → after), then a line chart of one metric by month. All type comes from the
 * DS scale.
 * When it scrolls into view the card rises in, the headline counts up, the stats follow,
 * and the line draws left to right with each point popping in as the line reaches it.
 * Hovering, tapping or arrowing through the months shows that month's value. With more
 * than one metric, tabs switch between them and the line redraws. With reduced motion
 * everything simply shows.
 */
type Point = { label: string; value: number };
type Metric = { name: string; points: Point[]; caption: string; max?: number };
type Stat = { before: string; after: string; change: string; label: string };

const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";
const DRAW = 1400;

// Counts from 0 to `to` once `run` is true, easing out, keeping `decimals` places
function useCountUp(to: number, run: boolean, decimals = 0, ms = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setN(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, ms]);
  return n.toFixed(decimals);
}

function Chart({ metric, shown: inView }: { metric: Metric; shown: boolean }) {
  const { points } = metric;
  // Drawn a frame after mounting, so a new metric redraws its line too
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const last = points.length - 1;
  const [active, setActive] = useState(last);
  const top = metric.max ?? Math.ceil(Math.max(...points.map((p) => p.value)) / 10) * 10;
  const x = (i: number) => (last === 0 ? 50 : (i / last) * 100);
  const y = (v: number) => 100 - (v / top) * 100;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L100,100 L0,100 Z`;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") setActive((a) => Math.min(last, a + 1));
    else if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
    else return;
    e.preventDefault();
  };

  return (
    <figure className="m-0">
      <div className="flex gap-[8px]">
        {/* Y axis: top, middle, zero */}
        <div aria-hidden="true" className="relative w-[32px] shrink-0 font-body text-caption text-muted">
          {[top, top / 2, 0].map((v, i) => (
            <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${i * 50}%` }}>
              {v}%
            </span>
          ))}
        </div>

        <div
          role="group"
          aria-label={`${metric.name} by month. Use the arrow keys to move between months.`}
          tabIndex={0}
          onKeyDown={onKey}
          className="relative h-[160px] min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4 md:h-[176px]"
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="results-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" className="[stop-color:theme(colors.grape)]" stopOpacity="0.16" />
                <stop offset="1" className="[stop-color:theme(colors.grape)]" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 50, 100].map((g) => (
              <line key={g} x1="0" x2="100" y1={g} y2={g} className="stroke-primary/10" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {/* The line and a soft fill under it, revealed left to right */}
            <g
              className={`transition-[clip-path] ${EASE} motion-reduce:transition-none`}
              style={{ clipPath: `inset(-20% ${shown ? -20 : 120}% -20% -20%)`, transitionDuration: `${DRAW}ms` }}
            >
              <path d={area} fill="url(#results-fill)" />
              <path
                d={line}
                fill="none"
                className="stroke-grape"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
            {/* Guide for the month in focus */}
            <line
              x1={x(active)}
              x2={x(active)}
              y1={y(points[active].value)}
              y2="100"
              className={`stroke-grape/40 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Points, each popping in as the line reaches it, with a hit area per month */}
          {points.map((p, i) => {
            const on = i === active;
            const delay = shown ? `${(x(i) / 100) * DRAW}ms` : "0ms";
            return (
              <button
                key={p.label}
                type="button"
                tabIndex={-1}
                aria-label={`${p.label}: ${p.value}%`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="absolute top-0 h-full -translate-x-1/2"
                style={{ left: `${x(i)}%`, width: `${100 / (last + 1)}%` }}
              >
                <span
                  className={`absolute left-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-grape transition-[transform,opacity,background-color] duration-300 ${EASE} motion-reduce:transition-none ${
                    on ? "size-[12px] bg-grape" : "size-[10px] bg-white"
                  } ${shown ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                  style={{ top: `${y(p.value)}%`, transitionDelay: delay }}
                />
                {/* Value above the point in focus */}
                <span
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-primary px-[6px] py-[2px] font-body text-caption text-white transition-[opacity,transform] duration-300 ${EASE} motion-reduce:transition-none ${
                    on && shown ? "translate-y-0 opacity-100" : "translate-y-[4px] opacity-0"
                  }`}
                  style={{ top: `calc(${y(p.value)}% - 32px)` }}
                >
                  {p.value}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* X axis: one label per month, the one in focus in the heading colour */}
      <div aria-hidden="true" className="ml-[40px] mt-[8px] flex justify-between font-body text-caption">
        {points.map((p, i) => (
          <span key={p.label} className={`transition-colors duration-300 ${i === active ? "text-heading" : "text-muted"}`}>
            {p.label}
          </span>
        ))}
      </div>

      <figcaption className="mt-[16px] font-body text-body text-secondary">{metric.caption}</figcaption>
    </figure>
  );
}

export default function ResultsCard({
  headline,
  title,
  body,
  stats,
  metrics,
}: {
  headline: { value: number; decimals?: number; suffix?: string };
  title: string;
  body: string;
  stats: Stat[];
  metrics: Metric[];
}) {
  const [ref, shown] = useInView<HTMLDivElement>(0.25);
  const [tab, setTab] = useState(0);
  const count = useCountUp(headline.value, shown, headline.decimals ?? 0);
  const rise = (delay: number) => ({
    className: `transition-[opacity,transform] duration-700 ${EASE} motion-reduce:transition-none ${
      shown ? "translate-y-0 opacity-100" : "translate-y-[12px] opacity-0"
    }`,
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <div ref={ref} className="mt-[32px] rounded-lg bg-grape-light/60 p-[20px] md:p-[32px]">
      <div {...rise(0)}>
        <p className="m-0 font-heading text-stat font-normal text-grape tabular-nums md:text-stat-md">
          {count}
          {headline.suffix}
        </p>
        <p className="mt-[16px] font-heading text-h4 font-medium text-heading md:text-h4-md">{title}</p>
        <p className="mt-[8px] font-body text-body text-secondary md:text-body-md">{body}</p>
      </div>

      {/* Supporting stats: one white panel split in two, the label above, then the old
          value muted and the new one in grape */}
      <dl className="m-0 mt-[24px] grid grid-cols-1 rounded-md bg-white ring-1 ring-inset ring-primary/5 md:grid-cols-2">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`p-[16px] md:p-[20px] ${i ? "border-t border-line-soft md:border-l md:border-t-0" : ""}`}
          >
            <div {...rise(200 + i * 150)}>
              <dt className="font-body text-body text-secondary">{s.label}</dt>
              <dd className="m-0 mt-[12px] flex items-baseline gap-[8px]">
                <span className="font-heading text-h4 text-muted md:text-h4-md">{s.before}</span>
                <span aria-hidden="true" className="font-body text-body text-muted">→</span>
                <span className="font-heading text-h2 text-grape md:text-h2-md">{s.after}</span>
                <span className="sr-only">, {s.change}</span>
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div {...rise(500)}>
        <div className="mt-[32px] border-t border-primary/10 pt-[24px]">
          {metrics.length > 1 && (
            <div role="tablist" aria-label="Metric" className="mb-[16px] flex flex-wrap gap-[8px]">
              {metrics.map((m, i) => (
                <button
                  key={m.name}
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  onClick={() => setTab(i)}
                  className={`rounded-full px-[12px] py-[4px] font-body text-caption transition-colors duration-200 ${
                    i === tab ? "bg-primary text-white" : "bg-white text-secondary hover:text-heading"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
          {/* Keyed so switching metric redraws the line */}
          <Chart key={tab} metric={metrics[tab]} shown={shown} />
        </div>
      </div>
    </div>
  );
}
