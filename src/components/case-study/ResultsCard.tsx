"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { Tag } from "@/components/Tag";
import useInView from "./useInView";

/**
 * A results card, sized to sit in the text column: the headline number with what it
 * means and a short paragraph, two or three supporting stats in tagged boxes side by
 * side (wins as before → after, and any number still to improve in the warning colour), then a line chart of one metric by month. All type comes from the
 * DS scale.
 * When it scrolls into view the card rises in, the headline and the new stat values count
 * up, the line and the fill under it draw left to right, each point popping in as the line
 * reaches it. Then the focus walks through the months once, a single tooltip
 * sliding along with each month's value and its change from the month before (up or
 * down); the latest point keeps a soft pulse. Hovering, tapping or arrowing takes over. With more
 * than one metric, tabs switch between them and the line redraws. With reduced motion
 * everything simply shows.
 */
type Point = { label: string; value: number };
type Metric = { name: string; points: Point[]; caption: string; max?: number };
// A stat is a win (grape) unless it's marked `improve`: a number not yet in our favour,
// set in the warning colour with a note on what's behind it
type Stat = {
  before?: string;
  after: string;
  change?: string;
  label: string;
  note?: string;
  improve?: boolean;
};

const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";
const DRAW = 1400;
const WALK = 450;

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
  const last = points.length - 1;
  // Drawn a frame after mounting, so a new metric redraws its line too
  const [shown, setShown] = useState(false);
  // The focus starts on the first month and, once drawn, walks through them once; any
  // hover or key takes over. With reduced motion it simply rests on the latest month
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  useEffect(() => {
    if (!shown || touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(last);
      return;
    }
    const timers = points.map((_, i) =>
      setTimeout(() => setActive(i), DRAW + 200 + i * WALK),
    );
    return () => timers.forEach(clearTimeout);
  }, [shown, touched, points, last]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const top = metric.max ?? Math.ceil(Math.max(...points.map((p) => p.value)) / 10) * 10;
  const x = (i: number) => (last === 0 ? 50 : (i / last) * 100);
  const y = (v: number) => 100 - (v / top) * 100;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L100,100 L0,100 Z`;
  const now = points[active];
  const change = active > 0 ? now.value - points[active - 1].value : null;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") pick(Math.min(last, active + 1));
    else if (e.key === "ArrowLeft") pick(Math.max(0, active - 1));
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
          onMouseLeave={() => touched && setActive(last)}
          className="relative h-[160px] min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4 md:h-[176px]"
        >
          {/* Grid, then a soft fill under the line, drawn along with it */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="results-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" className="[stop-color:theme(colors.grape)]" stopOpacity="0.18" />
                <stop offset="1" className="[stop-color:theme(colors.grape)]" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 50, 100].map((g) => (
              <line key={g} x1="0" x2="100" y1={g} y2={g} className="stroke-primary/10" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            <path
              d={area}
              fill="url(#results-fill)"
              className={`transition-[clip-path] ${EASE} motion-reduce:transition-none`}
              style={{ clipPath: `inset(-20% ${shown ? -20 : 120}% -20% -20%)`, transitionDuration: `${DRAW}ms` }}
            />
            {/* The line, drawn left to right */}
            <path
              d={line}
              fill="none"
              className={`stroke-grape transition-[clip-path] ${EASE} motion-reduce:transition-none`}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ clipPath: `inset(-20% ${shown ? -20 : 120}% -20% -20%)`, transitionDuration: `${DRAW}ms` }}
            />
          </svg>

          {/* Guide from the month in focus down to the axis, sliding between months */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-0 w-px -translate-x-1/2 border-l border-dashed border-grape/40 transition-all duration-500 ${EASE} motion-reduce:transition-none ${
              shown ? "opacity-100" : "opacity-0"
            }`}
            style={{ left: `${x(active)}%`, top: `${y(now.value)}%` }}
          />

          {/* Points: each pops in as the line reaches it, with a hit area per month */}
          {points.map((p, i) => {
            const on = i === active;
            return (
              <button
                key={p.label}
                type="button"
                tabIndex={-1}
                aria-label={`${p.label}: ${p.value}%`}
                onMouseEnter={() => pick(i)}
                onFocus={() => pick(i)}
                onClick={() => pick(i)}
                className="absolute top-0 h-full -translate-x-1/2"
                style={{ left: `${x(i)}%`, width: `${100 / (last + 1)}%` }}
              >
                <span
                  className="absolute left-1/2 block -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${y(p.value)}%` }}
                >
                  {/* The latest month keeps a soft pulse, since the rate is still moving */}
                  {i === last && shown && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-grape/30 motion-reduce:hidden" style={{ animationDuration: "2400ms" }} />
                  )}
                  <span
                    className={`relative block rounded-full border-2 border-grape transition-[transform,opacity,background-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
                      on ? "size-[12px] bg-grape" : "size-[10px] bg-white"
                    } ${shown ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                    style={{ transitionDelay: shown && !touched ? `${(x(i) / 100) * DRAW}ms` : "0ms" }}
                  />
                </span>
              </button>
            );
          })}

          {/* One tooltip that slides to the month in focus: the value and the change */}
          <span
            aria-live="polite"
            className={`pointer-events-none absolute z-[1] flex -translate-x-1/2 items-center gap-[6px] whitespace-nowrap rounded-sm bg-primary px-[8px] py-[4px] font-geist text-caption text-white transition-all duration-500 ${EASE} motion-reduce:transition-none ${
              shown ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `clamp(32px, ${x(active)}%, calc(100% - 32px))`,
              top: `calc(${y(now.value)}% - 36px)`,
            }}
          >
            <span>{now.label} · {now.value}%</span>
            {change !== null && (
              <span className={`flex items-center gap-[2px] ${change >= 0 ? "text-grape-light" : "text-white/60"}`}>
                {change >= 0 ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
                {Math.abs(change)} pts
              </span>
            )}
          </span>
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

// A stat value that counts up from zero, keeping any suffix like "%"
function CountUp({ value, run }: { value: string; run: boolean }) {
  const [, num = "0", rest = ""] = value.match(/^([\d.]+)(.*)$/) ?? [];
  const n = useCountUp(Number(num), run, num.includes(".") ? 1 : 0, 1000);
  return (
    <span className="tabular-nums">
      {n}
      {rest}
    </span>
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

      {/* Supporting stats: white boxes side by side, each tagged. A win shows the old value
          muted and the new one in grape; a number still to improve shows in the warning
          colour with a note on what's behind it */}
      <dl
        className={`m-0 mt-[24px] grid grid-cols-1 gap-[12px] md:gap-[16px] ${
          stats.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {stats.map((s, i) => (
          <div key={s.label} {...rise(200 + i * 150)}>
            <div
              className={`flex h-full flex-col gap-[12px] rounded-md bg-white p-[16px] ring-1 ring-inset md:p-[20px] ${
                s.improve ? "ring-warning/30" : "ring-primary/5"
              }`}
            >
              <span className="self-start">
                <Tag face="geist" tone={s.improve ? "grey" : "grape"}>
                  {s.improve ? "Still to improve" : "Improved"}
                </Tag>
              </span>
              {/* Number first, so the numbers line up across the boxes */}
              <dt className="order-3 font-body text-body text-secondary">{s.label}</dt>
              <dd className="order-2 m-0 flex flex-col gap-[8px]">
                <span className="flex items-baseline gap-[8px]">
                  {s.before && (
                    <>
                      <span className="font-heading text-h4 text-muted md:text-h4-md">{s.before}</span>
                      <span aria-hidden="true" className="font-body text-body text-muted">→</span>
                    </>
                  )}
                  <span className={`font-heading text-h2 md:text-h2-md ${s.improve ? "text-warning" : "text-grape"}`}>
                    <CountUp value={s.after} run={shown} />
                  </span>
                  {s.change && <span className="sr-only">, {s.change}</span>}
                </span>
              </dd>
              {s.note && <dd className="order-4 m-0 font-body text-body text-muted">{s.note}</dd>}
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
                  className={`rounded-full px-[12px] py-[4px] font-geist text-caption transition-colors duration-200 ${
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
