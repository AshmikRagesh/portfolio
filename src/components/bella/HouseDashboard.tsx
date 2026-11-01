"use client";

// ── The house: a dashboard under the pass ─────────────────────────────────────
// What's happening at the front desk, live and this month (store houseStats):
//   your stay         featured: this visit on a line from 0 to this month's longest,
//                     with the average marked
//   here right now    one small bell per guest, the visitor's own in grape
//   guests            so far, this month, and the busiest day of the last two weeks
//   last two weeks    visits per day, with the daily average; hover or arrow keys
//                     pick a day
//   stamps            the share of visits that found each one, in each stamp's ink
// Numbers in GT Alpina and count up when first seen, labels in Geist, grape for the
// visitor's own. Refreshes every
// 30 seconds so "here right now" stays live.

import { useEffect, useRef, useState } from "react";
import Stamp from "@/components/bella/Stamp";
import { STAMP_INK, STAMPS } from "@/lib/bella/stampArt";
import { formatStay } from "@/lib/bella/passArt";
import type { HouseStats } from "@/lib/curiosity/store";

const BELL = "M48 214 Q48 140 100 140 Q152 140 152 214 Z M94 126 h12 v14 h-12 Z M38 212 h124 v14 h-124 Z";
const MAX_BELLS = 14;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmtDay = (iso: string, weekday = false) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${weekday ? `${DAYS[d.getUTCDay()]} ` : ""}${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

// True once the element has scrolled into view, so the bars can grow in then
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

// Visits per day: hover or arrow keys pick a day, and the header reads it out.
// Today is solid gold, the rest a lighter gold; a dashed line marks the daily average.
function VisitsChart({ days }: { days: HouseStats["lastDays"] }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const last = days.length - 1;
  const [pick, setPick] = useState<number | null>(null);
  const peak = Math.max(1, ...days.map((d) => d.visits));
  const top = Math.max(4, Math.ceil(peak / 4) * 4); // a round top for the scale
  const total = days.reduce((n, d) => n + d.visits, 0);
  const avg = total / days.length;
  const shown = days[pick ?? last];

  return (
    <div className="flex flex-col gap-[20px] rounded-[20px] border border-line-soft bg-white shadow-[0_1px_2px_rgba(30,5,37,0.04)] p-[24px]">
      <div className="flex items-start justify-between gap-[16px]">
        <div className="flex flex-col gap-[4px]">
          <p className="font-geist text-[14px] leading-[20px] text-secondary">Visits, last two weeks</p>
          <p className="font-heading text-[32px] leading-[36px] text-heading tabular-nums">{total.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-end gap-[4px] text-right" aria-live="polite">
          <p className="font-geist text-[14px] leading-[20px] text-secondary">{pick === null || pick === last ? "Today" : fmtDay(shown.day, true)}</p>
          <p className="font-heading text-[32px] leading-[36px] text-grape tabular-nums">{shown.visits}</p>
        </div>
      </div>

      <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-[8px]">
        {/* The scale: 0, half and the top */}
        <div className="relative h-[176px] font-geist text-[12px] leading-[16px] text-muted tabular-nums" aria-hidden="true">
          {[top, top / 2, 0].map((v, i) => (
            <span key={i} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / 2) * 100}%` }}>
              {v}
            </span>
          ))}
        </div>
        <div
          ref={ref}
          tabIndex={0}
          role="img"
          aria-label={`Visits per day for the last 14 days: ${days.map((d) => `${fmtDay(d.day)} ${d.visits}`).join(", ")}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPick((p) => Math.max(0, (p ?? last) - 1));
            else if (e.key === "ArrowRight") setPick((p) => Math.min(last, (p ?? last) + 1));
            else return;
            e.preventDefault();
          }}
          onBlur={() => setPick(null)}
          onMouseLeave={() => setPick(null)}
          className="relative h-[176px] rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape"
        >
          {/* Recessive grid: top, half, baseline */}
          {[0, 50, 100].map((t) => (
            <span key={t} className={`absolute inset-x-0 h-px ${t === 100 ? "bg-line" : "bg-line-soft"}`} style={{ top: `${t}%` }} aria-hidden="true" />
          ))}
          {/* Daily average */}
          <span
            className="absolute inset-x-0 border-t border-dashed border-heading/30 transition-[bottom] duration-700"
            style={{ bottom: seen ? `${(avg / top) * 100}%` : 0 }}
            aria-hidden="true"
          >
            <span className="absolute -top-[10px] left-0 z-[1] rounded-[4px] bg-white px-[6px] font-geist text-[12px] leading-[20px] text-secondary">
              Average {avg.toFixed(1)} a day
            </span>
          </span>

          <div className="absolute inset-0 flex items-end gap-[6px]">
            {days.map((d, i) => {
              const on = pick === i;
              const today = i === last;
              return (
                <div key={d.day} className="relative flex h-full flex-1 cursor-default items-end" onMouseEnter={() => setPick(i)}>
                  {on && <span className="absolute inset-x-[-3px] inset-y-0 rounded-[6px] bg-grape-light/60" aria-hidden="true" />}
                  <div
                    className={`relative w-full rounded-t-[4px] transition-[height,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      today || on ? "bg-grape" : pick !== null ? "bg-grape/15" : "bg-grape/30"
                    }`}
                    style={{ height: seen ? `${Math.max(1.5, (d.visits / top) * 100)}%` : "0%", transitionDelay: seen ? `${i * 30}ms, 0ms` : "0ms" }}
                  />
                  {on && (
                    <span className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-primary px-[10px] py-[6px] font-geist text-[12px] leading-[16px] text-white shadow-[0_8px_24px_rgba(30,5,37,0.2)]" style={{ bottom: `calc(${(d.visits / top) * 100}% + 10px)` }}>
                      <b className="font-medium">{d.visits}</b> {d.visits === 1 ? "visit" : "visits"} · {fmtDay(d.day, true)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <span />
        <div className="mt-[8px] flex justify-between font-geist text-[12px] leading-[16px] text-muted">
          <span>{fmtDay(days[0].day)}</span>
          <span>{fmtDay(days[Math.floor(last / 2)].day)}</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

// The share of visits that found each stamp, each bar in its stamp's own ink
function StampsFound({ stamps }: { stamps: HouseStats["stamps"] }) {
  const [ref, seen] = useSeen<HTMLUListElement>();
  return (
    <div className="flex flex-col gap-[16px] rounded-[20px] border border-line-soft bg-white shadow-[0_1px_2px_rgba(30,5,37,0.04)] p-[24px]">
      <div className="flex items-baseline justify-between gap-[16px]">
        <p className="font-geist text-[14px] leading-[20px] text-secondary">Stamps found by guests</p>
        <p className="font-geist text-[12px] leading-[16px] text-muted">% of visits</p>
      </div>
      <ul ref={ref} className="-mx-[8px] flex flex-col gap-[4px]">
        {STAMPS.map((s, i) => {
          const pct = stamps[s.key] ?? 0;
          return (
            // Hover or focus swaps the bar for how the stamp is found; the row keeps its height
            <li
              key={s.key}
              tabIndex={0}
              aria-label={`${s.name}: ${pct}% of visits. ${s.earned}`}
              className="group grid grid-cols-[36px_minmax(0,1fr)_40px] items-center gap-[12px] rounded-[12px] px-[8px] py-[8px] outline-none transition-colors hover:bg-grape-light/60 focus-visible:bg-grape-light/60 focus-visible:ring-2 focus-visible:ring-grape/40"
            >
              <Stamp stamp={s.key} className="h-[36px] w-[36px] transition-transform duration-300 group-hover:-rotate-6 group-focus-visible:-rotate-6" />
              <div className="flex min-w-0 flex-col gap-[4px] group-hover:col-span-2 group-focus-visible:col-span-2">
                <span className="font-geist text-[14px] leading-[20px] text-heading">{s.name}</span>
                <span className="grid h-[16px] items-center" aria-hidden="true">
                  <span className="relative col-start-1 row-start-1 block h-[6px] overflow-hidden rounded-full bg-line-soft transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ width: seen ? `${Math.max(pct ? 2 : 0, pct)}%` : "0%", background: STAMP_INK[s.key], transitionDelay: `${i * 60}ms` }}
                    />
                  </span>
                  <span className="col-start-1 row-start-1 translate-y-[2px] truncate whitespace-nowrap font-geist text-[12px] leading-[16px] text-secondary opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    {s.earned}
                  </span>
                </span>
              </div>
              <span className="text-right font-geist text-[14px] leading-[20px] text-secondary tabular-nums group-hover:hidden group-focus-visible:hidden">{pct}%</span>
            </li>
          );
        })}
      </ul>
      <p className="font-geist text-[12px] leading-[16px] text-muted">Hover or tab to a stamp to see how it’s found.</p>
    </div>
  );
}

const CARD = "rounded-[20px] border border-line-soft shadow-[0_1px_2px_rgba(30,5,37,0.04)]";

// A number that counts up from zero the first time it comes into view
function CountUp({ value, format = (n: number) => n.toLocaleString() }: { value: number; format?: (n: number) => string }) {
  const [ref, seen] = useSeen<HTMLSpanElement>();
  const [shown, setShown] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!seen) return;
    if (done.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    done.current = true;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 900);
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);
  return <span ref={ref}>{format(shown)}</span>;
}

function Tile({ label, children, note }: { label: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-[12px] bg-white p-[24px] ${CARD}`}>
      <p className="font-geist text-[14px] leading-[20px] text-secondary">{label}</p>
      <div className="font-heading text-[48px] leading-[52px] text-heading tabular-nums">{children}</div>
      {note && <p className="mt-auto font-geist text-[14px] leading-[20px] text-muted">{note}</p>}
    </div>
  );
}

// The visitor's stay on a line from no time to this month's longest, with the average
// marked, so "longer than X%" has something to stand on
function StayCard({ seconds, month }: { seconds: number; month: HouseStats["month"] }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const longest = Math.max(month.longestSeconds ?? 0, seconds, 1);
  const at = (n: number) => `${Math.min(100, (n / longest) * 100)}%`;
  const yours = seconds >= longest && month.longestSeconds !== null && seconds >= month.longestSeconds;
  return (
    <div className={`flex flex-col gap-[24px] bg-white p-[24px] md:col-span-2 md:p-[32px] ${CARD}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-[24px] gap-y-[8px]">
        <div className="flex flex-col gap-[8px]">
          <p className="font-geist text-[14px] leading-[20px] text-secondary">Your stay</p>
          <p className="font-heading text-[64px] leading-[64px] text-grape tabular-nums">
            <CountUp value={seconds} format={formatStay} />
          </p>
        </div>
        <p className="max-w-[340px] text-balance pb-[6px] font-geist text-[16px] leading-[24px] text-secondary">
          {month.beaten === null
            ? "You’re the first guest this month."
            : yours
              ? "The longest stay this month so far."
              : `Longer than ${month.beaten}% of this month’s guests.`}
        </p>
      </div>

      {/* The line: 0 to the longest, average and yours marked */}
      <div ref={ref} className="flex flex-col gap-[10px]" role="img" aria-label={`Your stay ${formatStay(seconds)}, this month's average ${month.averageSeconds === null ? "not known" : formatStay(month.averageSeconds)}, longest ${formatStay(longest)}`}>
        <div className="relative h-[10px] rounded-full bg-line-soft">
          <span className="absolute inset-y-0 left-0 rounded-full bg-grape transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: seen ? at(seconds) : "0%" }} />
          {month.averageSeconds !== null && (
            <span className="absolute -top-[6px] h-[22px] w-[2px] -translate-x-1/2 rounded-full bg-heading" style={{ left: at(month.averageSeconds) }} />
          )}
        </div>
        <div className="relative h-[20px] font-geist text-[12px] leading-[20px] text-muted">
          {(month.averageSeconds === null || month.averageSeconds / longest > 0.14) && <span className="absolute left-0">0m</span>}
          {month.averageSeconds !== null && (
            <span
              className={`absolute whitespace-nowrap text-heading ${month.averageSeconds / longest < 0.14 ? "" : "-translate-x-1/2"}`}
              style={{ left: month.averageSeconds / longest < 0.14 ? 0 : at(month.averageSeconds) }}
            >
              Average {formatStay(month.averageSeconds)}
            </span>
          )}
          <span className="absolute right-0 whitespace-nowrap">Longest {formatStay(longest)}</span>
        </div>
      </div>
    </div>
  );
}

// Guests on the site right now: one bell each, the visitor's own in grape
function HereNow({ count }: { count: number }) {
  const bells = Math.min(count, MAX_BELLS);
  return (
    <div className={`flex flex-col gap-[12px] bg-grape-light/50 p-[24px] md:p-[32px] ${CARD}`}>
      <p className="font-geist text-[14px] leading-[20px] text-secondary">Here right now</p>
      <p className="font-heading text-[64px] leading-[64px] text-grape tabular-nums">
        <CountUp value={count} />
      </p>
      <div className="flex flex-wrap items-end gap-[6px]" aria-hidden="true">
        {Array.from({ length: bells }, (_, i) => (
          <svg key={i} viewBox="36 120 128 108" className={`w-auto ${i === 0 ? "h-[24px]" : "h-[18px]"}`}>
            <path d={BELL} fill={i === 0 ? "#9D136A" : "rgba(50,7,62,0.22)"} />
          </svg>
        ))}
        {count > MAX_BELLS && <span className="font-geist text-[12px] leading-[16px] text-muted">+{count - MAX_BELLS}</span>}
      </div>
      <p className="mt-auto font-geist text-[14px] leading-[20px] text-muted">
        {count <= 1 ? "Just you at the desk" : `You and ${count - 1} more, live`}
      </p>
    </div>
  );
}

export default function HouseDashboard({ visitorId, seconds }: { visitorId: string; seconds: number }) {
  const [stats, setStats] = useState<HouseStats | null | undefined>(undefined);
  const [secs, setSecs] = useState(seconds);
  // Ask with the stay as it is now, but only re-ask on the timer, not every second
  useEffect(() => setSecs((s) => (Math.abs(seconds - s) >= 30 ? seconds : s)), [seconds]);

  useEffect(() => {
    if (!visitorId) return;
    let stop = false;
    const load = () =>
      fetch(`/api/curiosity/house?v=${encodeURIComponent(visitorId)}&s=${secs}`)
        .then((r) => r.json())
        .then((d) => !stop && setStats(d))
        .catch(() => !stop && setStats(null));
    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [visitorId, secs]);

  if (stats === undefined) return null;
  if (stats === null)
    return <p className="font-geist text-[16px] leading-[24px] text-muted">The house’s numbers aren’t available right now.</p>;

  const busiest = stats.lastDays.reduce((m, d) => (d.visits > m.visits ? d : m), stats.lastDays[0]);

  return (
    <section className="flex w-full max-w-[1040px] flex-col gap-[32px]" aria-labelledby="house-title">
      <div className="flex flex-col items-center gap-[8px] text-center">
        <h2 id="house-title" className="font-heading text-[40px] leading-[48px] text-heading">
          The house
        </h2>
        <p className="font-geist text-[16px] leading-[24px] text-secondary">Who’s here now, and this month so far.</p>
      </div>

      <div className="grid gap-[16px] md:grid-cols-3">
        <StayCard seconds={seconds} month={stats.month} />
        <HereNow count={stats.hereNow} />

        <Tile label="Guests so far" note={`${stats.visits.toLocaleString()} visits in all`}>
          <CountUp value={stats.guests} />
        </Tile>
        <Tile label="Guests this month" note={`${Math.round((stats.month.guests / Math.max(1, stats.guests)) * 100)}% of everyone so far`}>
          <CountUp value={stats.month.guests} />
        </Tile>
        <Tile label="Busiest day, last two weeks" note={`${busiest.visits} ${busiest.visits === 1 ? "visit" : "visits"}`}>
          {!busiest.visits ? "–" : busiest === stats.lastDays[stats.lastDays.length - 1] ? "Today" : fmtDay(busiest.day, true)}
        </Tile>
      </div>

      <div className="grid gap-[16px] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <VisitsChart days={stats.lastDays} />
        <StampsFound stamps={stats.stamps} />
      </div>
    </section>
  );
}
