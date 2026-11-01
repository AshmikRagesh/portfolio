"use client";

// ── The house: a dashboard under the pass ─────────────────────────────────────
// What's happening at the front desk, live and this month (store houseStats):
//   here right now    one small bell per guest, the visitor's own in gold
//   guests so far     everyone who's been, and how many visits that made
//   this month        guests, average stay, longest stay
//   your stay         where this visit sits among this month's guests
//   last two weeks    visits per day
//   stamps            the share of visits that found each one
// Numbers in GT Alpina, labels in Geist, gold for the visitor's own. Refreshes every
// 30 seconds so "here right now" stays live.

import { useEffect, useState } from "react";
import Stamp from "@/components/bella/Stamp";
import { STAMPS } from "@/lib/bella/stampArt";
import { formatStay } from "@/lib/bella/passArt";
import type { HouseStats } from "@/lib/curiosity/store";

const BELL = "M48 214 Q48 140 100 140 Q152 140 152 214 Z M94 126 h12 v14 h-12 Z M38 212 h124 v14 h-124 Z";
const MAX_BELLS = 14;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

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
  const peak = Math.max(1, ...stats.lastDays.map((d) => d.visits));
  const today = stats.lastDays[stats.lastDays.length - 1];

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
        {/* Visits per day */}
        <div className="flex flex-col gap-[20px] rounded-[20px] border border-white/10 bg-white/[0.03] p-[24px]">
          <div className="flex items-baseline justify-between gap-[16px]">
            <p className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]/60">Visits, last two weeks</p>
            <p className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]/50">
              Today <span className="text-[#e3bd62]">{today.visits}</span>
            </p>
          </div>
          <div className="flex h-[160px] items-end gap-[6px]" role="img" aria-label={`Visits per day for the last 14 days, peaking at ${peak}`}>
            {stats.lastDays.map((d, i) => (
              <div key={d.day} className="group relative flex h-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-[4px] ${i === stats.lastDays.length - 1 ? "bg-[#e3bd62]" : "bg-[#e3bd62]/35 group-hover:bg-[#e3bd62]/60"}`}
                  style={{ height: `${Math.max(2, (d.visits / peak) * 100)}%` }}
                />
                <span className="pointer-events-none absolute -top-[28px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#f8f1e3] px-[8px] py-[2px] font-geist text-[12px] text-[#1e0525] opacity-0 group-hover:opacity-100">
                  {fmtDay(d.day)}: {d.visits}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-geist text-[12px] leading-[16px] text-[#f8f1e3]/40">
            <span>{fmtDay(stats.lastDays[0].day)}</span>
            <span>Today</span>
          </div>
        </div>

        {/* Stamps found by guests */}
        <div className="flex flex-col gap-[16px] rounded-[20px] border border-white/10 bg-white/[0.03] p-[24px]">
          <p className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]/60">Stamps found by guests</p>
          <ul className="flex flex-col gap-[12px]">
            {STAMPS.map((s) => (
              <li key={s.key} className="grid grid-cols-[32px_minmax(0,1fr)_40px] items-center gap-[12px]">
                <Stamp stamp={s.key} className="h-[32px] w-[32px]" />
                <div className="flex flex-col gap-[6px]">
                  <span className="font-geist text-[14px] leading-[20px] text-[#f8f1e3]">{s.name}</span>
                  <span className="relative block h-[4px] rounded-full bg-white/10" aria-hidden="true">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[#e3bd62]/80" style={{ width: `${stats.stamps[s.key] ?? 0}%` }} />
                  </span>
                </div>
                <span className="text-right font-geist text-[14px] leading-[20px] text-[#f8f1e3]/60 tabular-nums">{stats.stamps[s.key] ?? 0}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
