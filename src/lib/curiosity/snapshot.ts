// ── Curiosity: daily snapshots ────────────────────────────────────────────────
// Once a day, shortly after midnight IST, the running totals are copied to
//   curiosity:snapshot:<YYYY-MM-DD>   string, JSON of Snapshot below (no TTL)
// where the date is the IST day that just ended. The totals keep growing, so the
// difference between two snapshots is what happened in between. That gives history
// and week-over-week comparisons, and a copy of the totals if a key is ever lost
// (Upstash's free plan has no backups). Nothing in a snapshot identifies a person.

import { dayBefore, istDay } from "./day";
import { NS, pipeline, storeConfigured } from "./store";

export interface Snapshot {
  /** The IST day this snapshot closes. */
  day: string;
  /** When it was taken (ms). Totals include anything up to this moment. */
  takenAt: number;
  visits: number;
  /** Distinct visitors with a stored visit. */
  visitors: number;
  /** Guest numbers handed out by the Front desk. */
  guests: number;
  /** Visits started on `day` (from curiosity:days). */
  dayVisits: number;
  /** Number of visits with a duration, and their seconds added up (for averages). */
  durationCount: number;
  durationSeconds: number;
  recordSeconds: number;
  referrers: Record<string, number>;
  devices: Record<string, number>;
  events: Record<string, number>;
}

const hash = (flat: string[] | null) => {
  const out: Record<string, number> = {};
  for (let i = 0; flat && i < flat.length; i += 2) out[flat[i]] = Number(flat[i + 1]);
  return out;
};

/** The IST day a snapshot taken now should close: the one that ended most recently. */
export function dayToClose(now = Date.now()) {
  return dayBefore(istDay(now));
}

/**
 * Save the snapshot for `day`. SET NX, so a retried cron run never overwrites the
 * first one. Returns false when one already existed.
 */
export async function takeSnapshot(day = dayToClose()): Promise<{ saved: boolean; snapshot: Snapshot | null }> {
  if (!storeConfigured) return { saved: false, snapshot: null };

  const [visits, visitors, guests, dayVisits, durations, top, referrers, devices, events] = await pipeline([
    ["GET", `${NS}:visits`],
    ["ZCARD", `${NS}:board:alltime`],
    ["GET", `${NS}:guests`],
    ["HGET", `${NS}:days`, day],
    ["ZRANGE", `${NS}:durations`, 0, -1, "WITHSCORES"],
    ["ZREVRANGE", `${NS}:board:alltime`, 0, 0, "WITHSCORES"],
    ["HGETALL", `${NS}:referrers`],
    ["HGETALL", `${NS}:devices`],
    ["HGETALL", `${NS}:events`],
  ]).then((rows: { result: unknown }[]) => rows.map((r) => r.result));

  const flat = (durations as string[]) ?? [];
  let durationSeconds = 0;
  for (let i = 1; i < flat.length; i += 2) durationSeconds += Number(flat[i]);
  const topFlat = (top as string[]) ?? [];

  const snapshot: Snapshot = {
    day,
    takenAt: Date.now(),
    visits: Number(visits ?? 0),
    visitors: Number(visitors ?? 0),
    guests: Number(guests ?? 0),
    dayVisits: Number(dayVisits ?? 0),
    durationCount: flat.length / 2,
    durationSeconds,
    recordSeconds: topFlat.length ? Number(topFlat[1]) : 0,
    referrers: hash(referrers as string[]),
    devices: hash(devices as string[]),
    events: hash(events as string[]),
  };

  const [{ result }] = await pipeline([["SET", `${NS}:snapshot:${day}`, JSON.stringify(snapshot), "NX"]]);
  return { saved: result === "OK", snapshot };
}
