// ── Curiosity: stats ──────────────────────────────────────────────────────────
// Reads everything the private /stats page shows in two round trips. Server only:
// it talks to Upstash with the token, which must never reach the browser.

import { pipeline, storeConfigured } from "./store";

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
}

export interface Stats {
  configured: boolean;
  visits: number;
  visitors: number;
  averageSeconds: number;
  medianSeconds: number;
  distribution: Tally[];
  /** Oldest first, one entry per UTC day, zero-filled. */
  days: Tally[];
  referrers: Tally[];
  devices: Tally[];
  exits: Tally[];
  exitSample: number;
  recordSeconds: number | null;
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
  };
  if (!storeConfigured) return empty;

  const [visits, visitors, durations, days, referrers, devices, top, recent] = await pipeline([
    ["GET", "curiosity:visits"],
    ["ZCARD", "curiosity:board:alltime"],
    // ZRANGE comes back ascending by score, so the scores are already sorted for the median
    ["ZRANGE", "curiosity:durations", 0, -1, "WITHSCORES"],
    ["HGETALL", "curiosity:days"],
    ["HGETALL", "curiosity:referrers"],
    ["HGETALL", "curiosity:devices"],
    ["ZREVRANGE", "curiosity:board:alltime", 0, 0, "WITHSCORES"],
    ["ZREVRANGE", "curiosity:recent", 0, EXIT_SAMPLE - 1],
  ]).then((rows: { result: unknown }[]) => rows.map((r) => r.result));

  const flat = (durations as string[]) ?? [];
  const seconds: number[] = [];
  for (let i = 1; i < flat.length; i += 2) seconds.push(Number(flat[i]));

  const distribution = BUCKETS.map(([label]) => ({ label, count: 0 }));
  for (const s of seconds) distribution[BUCKETS.findIndex(([, max]) => s < max)].count++;

  const perDay = new Map(hashToTallies(days as string[]).map((t) => [t.label, t.count]));
  const dayList: Tally[] = [];
  for (let i = STATS_DAYS - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    dayList.push({ label: key, count: perDay.get(key) ?? 0 });
  }

  // Exit page = lastPath on each recent visit's hash. Hashes expire after 90 days,
  // so anything older simply drops out of the sample.
  const ids = (recent as string[]) ?? [];
  const paths: (string | null)[] = ids.length
    ? (await pipeline(ids.map((id) => ["HGET", `curiosity:visit:${id}`, "lastPath"]))).map(
        (r: { result: string | null }) => r.result,
      )
    : [];
  const exitCounts = new Map<string, number>();
  for (const p of paths) if (p) exitCounts.set(p, (exitCounts.get(p) ?? 0) + 1);
  const exits = [...exitCounts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

  const topFlat = (top as string[]) ?? [];

  return {
    configured: true,
    visits: Number(visits ?? 0),
    visitors: Number(visitors ?? 0),
    averageSeconds: seconds.length ? Math.round(seconds.reduce((a, b) => a + b, 0) / seconds.length) : 0,
    medianSeconds: median(seconds),
    distribution,
    days: dayList,
    referrers: hashToTallies(referrers as string[]),
    devices: hashToTallies(devices as string[]),
    exits,
    exitSample: paths.filter(Boolean).length,
    recordSeconds: topFlat.length ? Number(topFlat[1]) : null,
  };
}
