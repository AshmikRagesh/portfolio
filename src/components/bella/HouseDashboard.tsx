"use client";

// ── The house: a dashboard under the pass ─────────────────────────────────────
// What's happening at the front desk, live and this month (store houseStats):
//   here right now    one small bell per guest, the visitor's own in gold
//   guests so far     everyone who's been, and how many visits that made
//   this month        guests, average stay, longest stay
//   your stay         where this visit sits among this month's guests
//   last two weeks    visits per day, with the daily average; hover or arrow keys
//                     pick a day
//   stamps            the share of visits that found each one, in each stamp's ink
// Numbers in GT Alpina, labels in Geist, gold for the visitor's own. Refreshes every
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
    <div className="flex flex-col gap-[20px] rounded-[20px] border border-white/10 bg-white/[0.03] p-[24px]">
      <div className="flex items-start justify-between gap-[16px]">
        <div className="flex flex-col gap-[4px]">
          <p className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]/60">Visits, last two weeks</p>
          <p className="font-heading text-[32px] leading-[36px] text-[#f8f1e3] tabular-nums">{total.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-end gap-[4px] text-right" aria-live="polite">
          <p className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]/60">{pick === null || pick === last ? "Today" : fmtDay(shown.day, true)}</p>
          <p className="font-heading text-[32px] leading-[36px] text-[#e3bd62] tabular-nums">{shown.visits}</p>
        </div>
      </div>

      <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-[8px]">
        {/* The scale: 0, half and the top */}
        <div className="relative h-[176px] font-geist text-[12px] leading-[16px] text-[#f8f1e3]/40 tabular-nums" aria-hidden="true">
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
          className="relative h-[176px] rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3bd62]"
        >
          {/* Recessive grid: top, half, baseline */}
          {[0, 50, 100].map((t) => (
            <span key={t} className={`absolute inset-x-0 h-px ${t === 100 ? "bg-white/20" : "bg-white/[0.06]"}`} style={{ top: `${t}%` }} aria-hidden="true" />
          ))}
          {/* Daily average */}
          <span
            className="absolute inset-x-0 border-t border-dashed border-[#f8f1e3]/30 transition-[bottom] duration-700"
            style={{ bottom: seen ? `${(avg / top) * 100}%` : 0 }}
            aria-hidden="true"
          >
            <span className="absolute -top-[10px] left-0 z-[1] rounded-[4px] bg-[#1b0620] px-[6px] font-geist text-[12px] leading-[20px] text-[#f8f1e3]/60">
              Average {avg.toFixed(1)} a day
            </span>
          </span>

          <div className="absolute inset-0 flex items-end gap-[6px]">
            {days.map((d, i) => {
              const on = pick === i;
              const today = i === last;
              return (
                <div key={d.day} className="relative flex h-full flex-1 cursor-default items-end" onMouseEnter={() => setPick(i)}>
                  {on && <span className="absolute inset-x-[-3px] inset-y-0 rounded-[6px] bg-white/[0.05]" aria-hidden="true" />}
                  <div
                    className={`relative w-full rounded-t-[4px] transition-[height,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      today || on ? "bg-[#e3bd62]" : pick !== null ? "bg-[#e3bd62]/20" : "bg-[#e3bd62]/35"
                    }`}
                    style={{ height: seen ? `${Math.max(1.5, (d.visits / top) * 100)}%` : "0%", transitionDelay: seen ? `${i * 30}ms, 0ms` : "0ms" }}
                  />
                  {on && (
                    <span className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-[#f8f1e3] px-[10px] py-[6px] font-geist text-[12px] leading-[16px] text-[#1e0525] shadow-[0_8px_24px_rgba(0,0,0,0.4)]" style={{ bottom: `calc(${(d.visits / top) * 100}% + 10px)` }}>
                      <b className="font-medium">{d.visits}</b> {d.visits === 1 ? "visit" : "visits"} · {fmtDay(d.day, true)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <span />
        <div className="mt-[8px] flex justify-between font-geist text-[12px] leading-[16px] text-[#f8f1e3]/40">
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
    <div className="flex flex-col gap-[16px] rounded-[20px] border border-white/10 bg-white/[0.03] p-[24px]">
      <div className="flex items-baseline justify-between gap-[16px]">
        <p className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]/60">Stamps found by guests</p>
        <p className="font-geist text-[12px] leading-[16px] text-[#f8f1e3]/40">% of visits</p>
      </div>
      <ul ref={ref} className="flex flex-col gap-[4px]">
        {STAMPS.map((s, i) => {
          const pct = stamps[s.key] ?? 0;
          return (
            <li
              key={s.key}
              title={s.earned}
              className="group grid grid-cols-[36px_minmax(0,1fr)_40px] items-center gap-[12px] rounded-[12px] px-[8px] py-[6px] transition-colors hover:bg-white/[0.05]"
            >
              <Stamp stamp={s.key} className="h-[36px] w-[36px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <div className="flex flex-col gap-[6px]">
                <span className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]">{s.name}</span>
                <span className="relative block h-[6px] overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ width: seen ? `${Math.max(pct ? 2 : 0, pct)}%` : "0%", background: STAMP_INK[s.key], transitionDelay: `${i * 60}ms` }}
                  />
                </span>
              </div>
              <span className="text-right font-geist text-[14px] leading-[20px] text-[#f8f1e3]/60 tabular-nums group-hover:text-[#f8f1e3]">{pct}%</span>
            </li>
          );
        })}
      </ul>
      <p className="font-geist text-[12px] leading-[16px] text-[#f8f1e3]/40">Hover a stamp to see how it’s found.</p>
    </div>
  );
}

function Tile({ label, children, note, className = "" }: { label: string; children: React.ReactNode; note?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-[12px] rounded-[20px] border border-white/10 bg-white/[0.03] p-[24px] ${className}`}>
      <p className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]/60">{label}</p>
      <div className="font-heading text-[48px] leading-[52px] text-[#f8f1e3] tabular-nums">{children}</div>
      {note && <p className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]/50">{note}</p>}
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
    return <p className="font-geist text-[16px] leading-[24px] text-[#f8f1e3]/50">The house’s numbers aren’t available right now.</p>;

  const bells = Math.min(stats.hereNow, MAX_BELLS);

  return (
    <section className="flex w-full max-w-[1040px] flex-col gap-[32px]" aria-labelledby="house-title">
      <div className="flex flex-col items-center gap-[8px] text-center">
        <h2 id="house-title" className="font-heading text-[40px] leading-[48px] text-[#f8f1e3]">
          The house
        </h2>
        <p className="font-geist text-[16px] leading-[24px] text-[#f8f1e3]/60">Who’s here now, and this month so far.</p>
      </div>

      <div className="grid gap-[16px] md:grid-cols-3">
        <Tile label="Here right now" note={stats.hereNow === 1 ? "Just you at the desk" : `You and ${stats.hereNow - 1} more`}>
          <div className="flex items-end gap-[16px]">
            <span className="text-[#e3bd62]">{stats.hereNow}</span>
            <span className="mb-[10px] flex items-end gap-[5px]" aria-hidden="true">
              {Array.from({ length: bells }, (_, i) => (
                <svg key={i} viewBox="36 120 128 108" className={i === 0 ? "h-[20px] w-auto" : "h-[14px] w-auto"}>
                  <path d={BELL} fill={i === 0 ? "#e3bd62" : "rgba(248,241,227,0.3)"} />
                </svg>
              ))}
            </span>
          </div>
        </Tile>
        <Tile label="Guests so far" note={`${stats.visits.toLocaleString()} visits in all`}>
          {stats.guests.toLocaleString()}
        </Tile>
        <Tile label="Guests this month">{stats.month.guests.toLocaleString()}</Tile>

        <Tile label="Average stay this month">{stats.month.averageSeconds === null ? "–" : formatStay(stats.month.averageSeconds)}</Tile>
        <Tile label="Longest stay this month">{stats.month.longestSeconds === null ? "–" : formatStay(stats.month.longestSeconds)}</Tile>
        <Tile
          label="Your stay"
          note={stats.month.beaten === null ? "You’re the first guest this month" : `Longer than ${stats.month.beaten}% of this month’s guests`}
        >
          {stats.month.beaten === null ? (
            <span className="text-[#e3bd62]">{formatStay(seconds)}</span>
          ) : (
            <div className="flex flex-col gap-[12px]">
              <span className="text-[#e3bd62]">{formatStay(seconds)}</span>
              <span className="relative block h-[6px] rounded-full bg-white/10" aria-hidden="true">
                <span className="absolute inset-y-0 left-0 rounded-full bg-[#e3bd62]" style={{ width: `${stats.month.beaten}%` }} />
              </span>
            </div>
          )}
        </Tile>
      </div>

      <div className="grid gap-[16px] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <VisitsChart days={stats.lastDays} />
        <StampsFound stamps={stats.stamps} />
      </div>
    </section>
  );
}
