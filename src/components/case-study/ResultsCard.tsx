"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import useInView from "./useInView";

/**
 * A results panel: one headline number with what it means, a short paragraph, a row of
 * supporting before → after stats, then a line chart of one metric over time.
 * When it scrolls into view the panel rises in, the headline counts up, the stats follow,
 * and the line draws from left to right with each point popping in as the line reaches it.
 * The chart is interactive: hovering, tapping or arrowing through the months shows that
 * month's value. With more than one metric, tabs above the chart switch between them and
 * the line redraws. With reduced motion everything simply shows.
 */
type Point = { label: string; value: number };
type Metric = { name: string; points: Point[]; caption: string; max?: number };

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

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") setActive((a) => Math.min(last, a + 1));
    else if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
    else return;
    e.preventDefault();
  };

  return (
    <figure className="m-0">
      <div className="flex gap-[12px]">
        {/* Y axis: top, middle, zero */}
        <div aria-hidden="true" className="relative w-[40px] shrink-0 font-body text-[14px] leading-[20px] text-muted">
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
          className="relative h-[200px] min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4 focus-visible:ring-offset-grape-light md:h-[240px]"
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            {[0, 50, 100].map((g) => (
              <line key={g} x1="0" x2="100" y1={g} y2={g} className="stroke-primary/15" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {/* Guide for the month in focus */}
            <line
              x1={x(active)}
              x2={x(active)}
              y1={y(points[active].value)}
              y2="100"
              className={`stroke-grape/40 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            {/* The line, revealed left to right */}
            <path
              d={line}
              fill="none"
              className={`stroke-grape transition-[clip-path] ${EASE} motion-reduce:transition-none`}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ clipPath: `inset(-10% ${shown ? -10 : 110}% -10% -10%)`, transitionDuration: `${DRAW}ms` }}
            />
          </svg>

          {/* Points, each popping in as the line reaches it, with a hit area per month */}
          {points.map((p, i) => {
            const on = i === active;
            return (
              <button
                key={p.label}
                type="button"
                tabIndex={-1}
                aria-label={`${p.label}: ${p.value}%`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group absolute top-0 h-full -translate-x-1/2"
                style={{ left: `${x(i)}%`, width: `${100 / (last + 1)}%` }}
              >
                <span
                  className={`absolute left-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-grape ring-4 ring-grape-light transition-[transform,width,height,opacity] duration-300 ${EASE} motion-reduce:transition-none ${
                    on ? "size-[14px]" : "size-[10px]"
                  } ${shown ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                  style={{ top: `${y(p.value)}%`, transitionDelay: shown ? `${(x(i) / 100) * DRAW}ms, 0ms, 0ms, ${(x(i) / 100) * DRAW}ms` : "0ms" }}
                />
                {/* Value label above the point */}
                <span
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-[8px] py-[2px] font-heading text-[16px] leading-[24px] transition-all duration-300 ${EASE} motion-reduce:transition-none ${
                    on && shown ? "bg-primary text-white opacity-100" : "text-heading opacity-0"
                  }`}
                  style={{ top: `calc(${y(p.value)}% - 44px)` }}
                >
                  {p.value}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* X axis: one label per month, the one in focus in the heading colour */}
      <div aria-hidden="true" className="ml-[52px] mt-[12px] flex justify-between font-body text-[14px] leading-[20px]">
        {points.map((p, i) => (
          <span key={p.label} className={`transition-colors duration-300 ${i === active ? "text-heading" : "text-muted"}`}>
            {p.label}
          </span>
        ))}
      </div>

      <figcaption className="mt-[24px] font-body text-[16px] leading-[26px] text-secondary">{metric.caption}</figcaption>
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
  stats: { stat: string; label: string }[];
  metrics: Metric[];
}) {
  const [ref, shown] = useInView<HTMLDivElement>(0.25);
  const [tab, setTab] = useState(0);
  const count = useCountUp(headline.value, shown, headline.decimals ?? 0);
  const rise = (delay: number) => ({
    className: `transition-[opacity,transform] duration-700 ${EASE} motion-reduce:transition-none ${
      shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
    }`,
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <div ref={ref} className="rounded-2xl bg-grape-light/60 p-[24px] md:p-[48px]">
      <div {...rise(0)}>
        <p className="m-0 font-heading text-[80px] font-normal leading-[80px] tracking-[-2px] text-heading tabular-nums md:text-[112px] md:leading-[112px]">
          {count}
          {headline.suffix}
        </p>
        <p className="mt-[24px] font-heading text-[22px] leading-[30px] text-heading md:text-[24px] md:leading-[32px]">{title}</p>
        <p className="mt-[16px] font-body text-[18px] leading-[30px] text-secondary">{body}</p>
      </div>

      <div className="my-[32px] h-px bg-primary/15" />

      <dl className="m-0 grid grid-cols-1 gap-[24px] md:grid-cols-2 md:gap-[48px]">
        {stats.map((s, i) => (
          <div key={s.label} {...rise(200 + i * 150)}>
            <dt className="font-heading text-[32px] leading-[40px] text-heading md:text-[40px] md:leading-[48px]">{s.stat}</dt>
            <dd className="m-0 mt-[8px] font-body text-[16px] leading-[26px] text-secondary">{s.label}</dd>
          </div>
        ))}
      </dl>

      <div {...rise(500)}>
        <div className="mt-[40px]">
        {metrics.length > 1 && (
          <div role="tablist" aria-label="Metric" className="mb-[24px] flex flex-wrap gap-[8px]">
            {metrics.map((m, i) => (
              <button
                key={m.name}
                type="button"
                role="tab"
                aria-selected={i === tab}
                onClick={() => setTab(i)}
                className={`rounded-full px-[16px] py-[6px] font-body text-[14px] leading-[20px] transition-colors duration-200 ${
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
