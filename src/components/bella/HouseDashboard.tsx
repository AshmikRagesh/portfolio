"use client";

// ── The house: a dashboard under the pass ─────────────────────────────────────
// What's happening at the front desk, live and this month (store houseStats):
//   your stay         featured: this visit on a line from 0 to this month's longest,
//                     with the average marked
//   here right now    one small bell per guest, the visitor's own in grape
//   guests            so far, this month, and the busiest day of the last two weeks
// Numbers in GT Alpina and count up when first seen, labels in Geist, grape for the
// visitor's own. Refreshes every
// 30 seconds so "here right now" stays live.

import { useEffect, useRef, useState } from "react";
import { formatStay } from "@/lib/bella/passArt";
import type { HouseStats } from "@/lib/curiosity/store";

const BELL = "M48 214 Q48 140 100 140 Q152 140 152 214 Z M94 126 h12 v14 h-12 Z M38 212 h124 v14 h-124 Z";
const MAX_OTHERS = 6; // other guests' bells shown before the rest become "+N"
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

const CARD =
  "rounded-[20px] border border-line-soft shadow-[0_1px_2px_rgba(30,5,37,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(30,5,37,0.08)]";

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
      <p className="font-body text-[14px] leading-[20px] text-secondary">{label}</p>
      <div className="font-heading text-[48px] leading-[52px] text-heading tabular-nums">{children}</div>
      {note && <p className="mt-auto font-body text-[14px] leading-[20px] text-muted">{note}</p>}
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
          <p className="font-body text-[14px] leading-[20px] text-secondary">Your stay</p>
          <p className="font-heading text-[64px] leading-[64px] text-grape tabular-nums">
            <CountUp value={seconds} format={formatStay} />
          </p>
        </div>
        <p className="max-w-[340px] text-balance pb-[6px] font-body text-[16px] leading-[24px] text-secondary">
          {month.beaten === null
            ? "You’re the first guest this month."
            : yours
              ? "The longest stay this month so far."
              : `Longer than ${month.beaten}% of this month’s guests.`}
        </p>
      </div>

      {/* The line: 0 to the longest, average and yours marked */}
      <div ref={ref} className="flex flex-col gap-[10px]" role="img" aria-label={`Your stay ${formatStay(seconds)}, this month's average ${month.averageSeconds === null ? "not known" : formatStay(month.averageSeconds)}, longest ${formatStay(longest)}`}>
        <div className="relative mt-[32px] h-[12px] rounded-full bg-line-soft">
          <span className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-grape/40 to-grape transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ width: seen ? at(seconds) : "0%" }} />
          {month.averageSeconds !== null && (
            <span className="absolute -top-[6px] h-[24px] w-[2px] -translate-x-1/2 rounded-full bg-heading" style={{ left: at(month.averageSeconds) }} />
          )}
          {/* You: a dot on the end of the fill, with a tag above it */}
          <span
            className="absolute top-1/2 transition-[left] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: seen ? at(seconds) : "0%" }}
          >
            <span className="absolute left-0 top-0 h-[20px] w-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-white bg-grape shadow-[0_2px_6px_rgba(30,5,37,0.24)]" />
            <span
              className={`absolute bottom-[16px] whitespace-nowrap rounded-full bg-grape px-[8px] font-brand text-[10px] uppercase leading-[20px] tracking-[1px] text-white ${
                seconds / longest < 0.06 ? "-left-[10px]" : seconds / longest > 0.94 ? "-right-[10px]" : "-translate-x-1/2"
              }`}
            >
              You
            </span>
          </span>
        </div>
        <div className="relative h-[20px] font-body text-[12px] leading-[20px] text-muted">
          {(month.averageSeconds === null || month.averageSeconds / longest > 0.2) && <span className="absolute left-0">0m</span>}
          {month.averageSeconds !== null && (
            <span
              className={`absolute whitespace-nowrap text-heading ${month.averageSeconds / longest < 0.2 ? "" : "-translate-x-1/2"}`}
              style={{ left: month.averageSeconds / longest < 0.2 ? 0 : at(month.averageSeconds) }}
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

// Guests on the site right now, as bells on a front desk: the visitor's own bell in grape
// with Bella's eyes and a "You" under it, everyone else's in soft lilac, standing a little
// in front of each other like a queue. Past MAX_OTHERS the rest are a "+N".
function HereNow({ count }: { count: number }) {
  const others = Math.max(0, count - 1);
  const shown = Math.min(others, MAX_OTHERS);
  return (
    <div className={`flex flex-col gap-[12px] bg-grape-light/50 p-[24px] md:p-[32px] ${CARD}`}>
      <div className="flex items-baseline justify-between gap-[12px]">
        <p className="font-body text-[14px] leading-[20px] text-secondary">Here right now</p>
        <p className="font-body text-[12px] leading-[16px] text-muted">Updates live</p>
      </div>
      <p className="flex items-baseline gap-[8px]">
        <span className="font-heading text-[64px] leading-[64px] text-grape tabular-nums">
          <CountUp value={count} />
        </span>
        <span className="font-body text-[16px] leading-[24px] text-secondary">{count === 1 ? "guest" : "guests"}</span>
      </p>

      {/* The desk */}
      <div className="mt-auto flex flex-col pt-[8px]" aria-hidden="true">
        <div className="flex items-end px-[8px]">
          <svg viewBox="36 120 128 108" className="h-[40px] w-auto shrink-0">
            <path d={BELL} fill="#9D136A" />
            <ellipse cx="86" cy="184" rx="9" ry="11" fill="#fff" />
            <ellipse cx="114" cy="184" rx="9" ry="11" fill="#fff" />
            <circle cx="88" cy="186" r="5" fill="#32073e" />
            <circle cx="116" cy="186" r="5" fill="#32073e" />
          </svg>
          {Array.from({ length: shown }, (_, i) => (
            <svg
              key={i}
              viewBox="30 114 140 118"
              className={`relative h-[30px] w-auto shrink-0 ${i ? "-ml-[8px]" : "ml-[6px]"}`}
              style={{ zIndex: MAX_OTHERS - i }}
            >
              <path d={BELL} fill="#E7C6DC" stroke="#FCF2FF" strokeWidth="10" strokeLinejoin="round" paintOrder="stroke" />
            </svg>
          ))}
          {others > MAX_OTHERS && (
            <span className="ml-[8px] pb-[2px] font-body text-[14px] leading-[20px] text-secondary tabular-nums">+{others - MAX_OTHERS}</span>
          )}
        </div>
        <span className="h-[6px] rounded-full bg-heading/15" />
        <span className="mt-[6px] w-[64px] text-center font-brand text-[10px] uppercase leading-[12px] tracking-[1px] text-grape">You</span>
      </div>

      <p className="font-body text-[14px] leading-[20px] text-muted">
        {count <= 1 ? "Just you at the desk" : `You and ${others} ${others === 1 ? "other" : "others"}`}
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
    return <p className="font-body text-[16px] leading-[24px] text-muted">The house’s numbers aren’t available right now.</p>;

  const busiest = stats.lastDays.reduce((m, d) => (d.visits > m.visits ? d : m), stats.lastDays[0]);
  const share = Math.round((stats.month.guests / Math.max(1, stats.guests)) * 100);
  const perGuest = +(stats.visits / Math.max(1, stats.guests)).toFixed(1);
  const daily = stats.lastDays.reduce((n, d) => n + d.visits, 0) / stats.lastDays.length;
  const times = daily ? +(busiest.visits / daily).toFixed(1) : 0;

  return (
    <section className="flex w-full max-w-[1040px] flex-col gap-[32px]" aria-labelledby="house-title">
      <div className="flex flex-col items-center gap-[8px] text-center">
        <h2 id="house-title" className="font-heading text-[40px] leading-[48px] text-heading">
          The house
        </h2>
        <p className="font-body text-[16px] leading-[24px] text-secondary">Who’s here now, and this month so far.</p>
      </div>

      <div className="grid gap-[16px] md:grid-cols-3">
        <StayCard seconds={seconds} month={stats.month} />
        <HereNow count={stats.hereNow} />

        <Tile label="Guests so far" note={`${stats.visits.toLocaleString()} visits, about ${perGuest} each`}>
          <CountUp value={stats.guests} />
        </Tile>
        <Tile label="Guests this month" note={`${share}% of everyone so far`}>
          <CountUp value={stats.month.guests} />
        </Tile>
        <Tile
          label="Busiest day, last two weeks"
          note={`${busiest.visits} ${busiest.visits === 1 ? "visit" : "visits"}${times >= 1.5 ? `, ${times}× the average` : ""}`}
        >
          {!busiest.visits ? "–" : busiest === stats.lastDays[stats.lastDays.length - 1] ? "Today" : fmtDay(busiest.day, true)}
        </Tile>
      </div>
    </section>
  );
}
