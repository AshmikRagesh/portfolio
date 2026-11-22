// ── Curiosity: stats ──────────────────────────────────────────────────────────
// Reads everything the private /stats page shows in two round trips. Server only:
// it talks to Upstash with the token, which must never reach the browser.

import { BELLA_EVENTS } from "./config";
import { dayBefore, istDay } from "./day";
import { NS, pipeline, storeConfigured } from "./store";

/** Visit length buckets for the distribution, as [label, upper bound in seconds). */
const BUCKETS: [string, number][] = [
  ["Under 10s", 10],
  ["10–30s", 30],
  ["30s–1m", 60],
  ["1–2m", 120],
  ["2–5m", 300],
  ["5–10m", 600],
  ["10m+", Infinity],
];

/** How many of the newest visits the exit page tally looks at. */
const EXIT_SAMPLE = 500;

export const STATS_DAYS = 30;

export interface Tally {
  label: string;
  count: number;
  /** Total active seconds across these visits, when known. Lists that have it are ordered by it. */
  seconds?: number;
}

/** One visitor (browser), totalled across their stored visits. */
export interface VisitorRow {
  id: string;
  guestNo: number | null;
  visits: number;
  seconds: number;
  device: string;
  referrer: string;
  lastSeen: number;
}

/** How many visitors the Visitors list shows. */
const VISITOR_LIMIT = 25;

export interface Stats {
  configured: boolean;
  visits: number;
  visitors: number;
  averageSeconds: number;
  medianSeconds: number;
  distribution: Tally[];
  /** Oldest first, one entry per IST day, zero-filled. */
  days: Tally[];
  referrers: Tally[];
  devices: Tally[];
  exits: Tally[];
  exitSample: number;
  recordSeconds: number | null;
  /** Visits that did each thing with Bella, in BELLA_EVENTS order. */
  events: Tally[];
  /** Most time on the site first, from stored visits (the newest RECENT_KEEP, up to 90 days). */
  topVisitors: VisitorRow[];
  visitorSample: number;
}

function hashToTallies(flat: string[] | null): Tally[] {
  const out: Tally[] = [];
  for (let i = 0; flat && i < flat.length; i += 2) out.push({ label: flat[i], count: Number(flat[i + 1]) });
  return out.sort((a, b) => b.count - a.count);
}

function median(sorted: number[]) {
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export async function readStats(): Promise<Stats> {
  const empty: Stats = {
    configured: storeConfigured,
    visits: 0,
    visitors: 0,
    averageSeconds: 0,
    medianSeconds: 0,
    distribution: BUCKETS.map(([label]) => ({ label, count: 0 })),
    days: [],
    referrers: [],
    devices: [],
    exits: [],
    exitSample: 0,
    recordSeconds: null,
    events: Object.values(BELLA_EVENTS).map((label) => ({ label, count: 0 })),
    topVisitors: [],
    visitorSample: 0,
  };
  if (!storeConfigured) return empty;

  const [visits, visitors, durations, days, referrers, devices, top, recent, events] = await pipeline([
    ["GET", `${NS}:visits`],
    ["ZCARD", `${NS}:board:alltime`],
    // ZRANGE comes back ascending by score, so the scores are already sorted for the median
    ["ZRANGE", `${NS}:durations`, 0, -1, "WITHSCORES"],
    ["HGETALL", `${NS}:days`],
    ["HGETALL", `${NS}:referrers`],
    ["HGETALL", `${NS}:devices`],
    ["ZREVRANGE", `${NS}:board:alltime`, 0, 0, "WITHSCORES"],
    ["ZREVRANGE", `${NS}:recent`, 0, -1],
    ["HGETALL", `${NS}:events`],
  ]).then((rows: { result: unknown }[]) => rows.map((r) => r.result));

  const flat = (durations as string[]) ?? [];
  const seconds: number[] = [];
  for (let i = 1; i < flat.length; i += 2) seconds.push(Number(flat[i]));

  const distribution = BUCKETS.map(([label]) => ({ label, count: 0 }));
  for (const s of seconds) distribution[BUCKETS.findIndex(([, max]) => s < max)].count++;

  const perDay = new Map(hashToTallies(days as string[]).map((t) => [t.label, t.count]));
  const dayList: Tally[] = [];
  const today = istDay();
  for (let i = STATS_DAYS - 1; i >= 0; i--) {
    const key = dayBefore(today, i);
    dayList.push({ label: key, count: perDay.get(key) ?? 0 });
  }

  // Every stored visit, newest first. Hashes expire after 90 days, so older visits
  // drop out; the totals above (visits, referrers, devices) still include them.
  const ids = (recent as string[]) ?? [];
  const FIELDS = ["visitorId", "activeSeconds", "lastPath", "referrer", "viewport", "updatedAt"] as const;
  const rows = ids.length
    ? (await pipeline(ids.map((id) => ["HMGET", `${NS}:visit:${id}`, ...FIELDS]))).map((r: { result: (string | null)[] }) => r.result)
    : [];
  const stored = rows
    .filter((r: (string | null)[]) => r?.[0])
    .map((r: (string | null)[]) => ({
      visitorId: r[0] as string,
      seconds: Number(r[1] ?? 0),
      lastPath: r[2] ?? "/",
      referrer: r[3] || "direct",
      viewport: r[4] ?? "desktop",
      updatedAt: Number(r[5] ?? 0),
    }));

  // Total active time per label, so lists can be ordered by time spent rather than visits
  const timeBy = (key: (v: (typeof stored)[number]) => string) => {
    const m = new Map<string, { count: number; seconds: number }>();
    for (const v of stored) {
      const t = m.get(key(v)) ?? { count: 0, seconds: 0 };
      t.count++;
      t.seconds += v.seconds;
      m.set(key(v), t);
    }
    return m;
  };
  const byTime = (a: Tally, b: Tally) => (b.seconds ?? 0) - (a.seconds ?? 0) || b.count - a.count;
  const withTime = (tallies: Tally[], times: Map<string, { seconds: number }>) =>
    tallies.map((t) => ({ ...t, seconds: times.get(t.label)?.seconds ?? 0 })).sort(byTime);

  // Exit page = lastPath on each of the newest EXIT_SAMPLE visits
  const exitTimes = new Map<string, { count: number; seconds: number }>();
  for (const v of stored.slice(0, EXIT_SAMPLE)) {
    const t = exitTimes.get(v.lastPath) ?? { count: 0, seconds: 0 };
    t.count++;
    t.seconds += v.seconds;
    exitTimes.set(v.lastPath, t);
  }
  const exits = [...exitTimes].map(([label, t]) => ({ label, ...t })).sort(byTime);

  // Visitors, most time on the site first
  const people = new Map<string, VisitorRow>();
  for (const v of stored) {
    const p = people.get(v.visitorId) ?? { id: v.visitorId, guestNo: null, visits: 0, seconds: 0, device: v.viewport, referrer: "direct", lastSeen: 0 };
    p.visits++;
    p.seconds += v.seconds;
    if (v.referrer !== "direct") p.referrer = v.referrer;
    p.lastSeen = Math.max(p.lastSeen, v.updatedAt);
    people.set(v.visitorId, p);
  }
  const topVisitors = [...people.values()].sort((a, b) => b.seconds - a.seconds || b.visits - a.visits).slice(0, VISITOR_LIMIT);
  if (topVisitors.length) {
    const guestNos = await pipeline(topVisitors.map((p) => ["GET", `${NS}:guestno:${p.id}`]));
    guestNos.forEach((r: { result: string | null }, i: number) => (topVisitors[i].guestNo = r.result ? Number(r.result) : null));
  }

  const topFlat = (top as string[]) ?? [];

  return {
    configured: true,
    visits: Number(visits ?? 0),
    visitors: Number(visitors ?? 0),
    averageSeconds: seconds.length ? Math.round(seconds.reduce((a, b) => a + b, 0) / seconds.length) : 0,
    medianSeconds: median(seconds),
    distribution,
    days: dayList,
    referrers: withTime(hashToTallies(referrers as string[]), timeBy((v) => v.referrer)),
    devices: withTime(hashToTallies(devices as string[]), timeBy((v) => v.viewport)),
    exits,
    exitSample: Math.min(stored.length, EXIT_SAMPLE),
    topVisitors,
    visitorSample: people.size,
    recordSeconds: topFlat.length ? Number(topFlat[1]) : null,
    events: (() => {
      const counts = new Map(hashToTallies(events as string[]).map((t) => [t.label, t.count]));
      return (Object.keys(BELLA_EVENTS) as (keyof typeof BELLA_EVENTS)[]).map((k) => ({ label: BELLA_EVENTS[k], count: counts.get(k) ?? 0 }));
    })(),
  };
}
