// ── Curiosity: storage ────────────────────────────────────────────────────────
// Where visit reports end up. Two modes, picked by environment:
//
//   Upstash Redis   when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are
//                   set. Talks to Upstash's REST API with plain fetch, so there's
//                   no SDK dependency.
//   Dev log         otherwise. Prints each report to the server console and keeps
//                   nothing — fine locally, a no-op if it ever ships unconfigured.
//
// Redis layout (keys shown with the production prefix; see NS below):
//   curiosity:visit:<visitId>        hash, the latest numbers for one visit (90-day TTL)
//   curiosity:board:alltime          sorted set, visitorId → best single-visit seconds
//   curiosity:board:<YYYY-MM>        sorted set, same but for this month only
//   curiosity:lifetime               sorted set, visitorId → lifetime seconds
//   curiosity:visits                 counter, visits seen (bumped once per visit)
//
// Tallies for the private stats page (no TTL, nothing that identifies a person):
//   curiosity:durations              sorted set, visitId → active seconds (GT, like the boards)
//   curiosity:recent                 sorted set, visitId → start time in ms; the stats page
//                                    reads the newest visit hashes from here for exit pages
//                                    (capped at RECENT_KEEP)
//   curiosity:days                   hash, YYYY-MM-DD (UTC) → visits started that day
//   curiosity:referrers              hash, referrer host or "direct" → visits
//   curiosity:devices                hash, mobile | tablet | desktop → visits
//   curiosity:events                 hash, Bella event → visits that did it (once per visit)
//
// For the Front desk page:
//   curiosity:present                sorted set, visitorId → time of their latest report (ms);
//                                    "guests in the house now" counts the last minute
//   curiosity:guests                 counter, guest numbers handed out so far
//   curiosity:guestno:<visitorId>    that visitor's guest number
//
// The sorted sets are what Phase 2 reads: rank and count on them give "you've
// stayed longer than N% of visitors" in a single round trip.

import { MIN_RANK_SAMPLE, type BellaEvent, type CuriosityPayload, type RankResult } from "./config";

/**
 * Key prefix. Production writes "curiosity:…"; anything else (next dev, local builds)
 * writes "dev:curiosity:…", so local testing never lands in the live numbers even
 * when .env.local points at the same Upstash database. CURIOSITY_NS overrides it.
 */
export const NS = process.env.CURIOSITY_NS || (process.env.NODE_ENV === "production" ? "curiosity" : "dev:curiosity");

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const VISIT_TTL_SECONDS = 60 * 60 * 24 * 90;
/** How many of the newest visit IDs curiosity:recent holds. */
export const RECENT_KEEP = 1000;

export const storeConfigured = Boolean(REDIS_URL && TOKEN);
/** How long a visitor stays on the present list without a report. */
const PRESENT_KEEP_MS = 5 * 60_000;
/** "Guests in the house now" counts visitors who reported within this window. */
const PRESENT_NOW_MS = 60_000;

type Command = (string | number)[];

export async function pipeline(commands: Command[]) {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return res.json();
}

export async function recordVisit(p: CuriosityPayload) {
  if (!storeConfigured) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[curiosity] ${p.final ? "final" : "beat "} visit=${p.visitId.slice(0, 8)} active=${p.activeSeconds}s ` +
          `lifetime=${p.lifetimeSeconds}s visits=${p.visits} path=${p.path} ${p.viewport}` +
          (p.referrer ? ` from=${p.referrer}` : ""),
      );
    }
    return;
  }

  const month = new Date().toISOString().slice(0, 7);
  const visitKey = `${NS}:visit:${p.visitId}`;

  await pipeline([
    // HSETNX first-seen fields so later reports don't overwrite where the visit began
    ["HSETNX", visitKey, "startedAt", Date.now()],
    ["HSETNX", visitKey, "entryPath", p.path],
    ["HSET", visitKey,
      "visitorId", p.visitorId,
      "activeSeconds", p.activeSeconds,
      "lastPath", p.path,
      "referrer", p.referrer,
      "viewport", p.viewport,
      "visitNumber", p.visits,
      "updatedAt", Date.now(),
      "closed", p.final ? 1 : 0,
    ],
    ["EXPIRE", visitKey, VISIT_TTL_SECONDS],
    // GT: a score only ever moves up, so a stale or out-of-order report can't lower it
    ["ZADD", `${NS}:board:alltime`, "GT", p.activeSeconds, p.visitorId],
    ["ZADD", `${NS}:board:${month}`, "GT", p.activeSeconds, p.visitorId],
    ["ZADD", `${NS}:lifetime`, "GT", p.lifetimeSeconds, p.visitorId],
    ["ZADD", `${NS}:durations`, "GT", p.activeSeconds, p.visitId],
    // In the house: refreshed by every heartbeat, gone on the closing report
    p.final ? ["ZREM", `${NS}:present`, p.visitorId] : ["ZADD", `${NS}:present`, Date.now(), p.visitorId],
    ["ZREMRANGEBYSCORE", `${NS}:present`, "-inf", Date.now() - PRESENT_KEEP_MS],
  ]);

  // Count each visit once — SET NX on a marker means only the first report wins
  const [{ result }] = await pipeline([["SET", `${visitKey}:counted`, 1, "NX", "EX", VISIT_TTL_SECONDS]]);
  if (result === "OK") {
    const now = Date.now();
    await pipeline([
      ["INCR", `${NS}:visits`],
      ["ZADD", `${NS}:recent`, now, p.visitId],
      ["ZREMRANGEBYRANK", `${NS}:recent`, 0, -(RECENT_KEEP + 1)],
      ["HINCRBY", `${NS}:days`, new Date(now).toISOString().slice(0, 10), 1],
      ["HINCRBY", `${NS}:referrers`, p.referrer || "direct", 1],
      ["HINCRBY", `${NS}:devices`, p.viewport, 1],
    ]);
  }
}

/** The Front desk: this visitor's guest number (handed out on first ask) and how many are here now. */
export async function deskFor(visitorId: string): Promise<{ guestNo: number | null; guestsNow: number | null }> {
  if (!storeConfigured) return { guestNo: null, guestsNow: null };
  const key = `${NS}:guestno:${visitorId}`;
  const [{ result: existing }, { result: now }] = await pipeline([
    ["GET", key],
    ["ZCOUNT", `${NS}:present`, Date.now() - PRESENT_NOW_MS, "+inf"],
  ]);
  let guestNo = existing === null ? null : Number(existing);
  if (guestNo === null) {
    const [{ result: next }] = await pipeline([["INCR", `${NS}:guests`]]);
    const [{ result: set }] = await pipeline([["SET", key, next, "NX"]]);
    // Another request got there first: use the number it set
    guestNo = set === "OK" ? Number(next) : Number((await pipeline([["GET", key]]))[0].result);
  }
  return { guestNo, guestsNow: Math.max(1, Number(now)) };
}

/**
 * The house, for the dashboard on the pass page: who's here now, everyone so far, this
 * month's guests and stays, where this visit sits among them, visits per day for the last
 * two weeks, and how many visits found each stamp.
 */
export async function houseStats(visitorId: string, seconds: number) {
  if (!storeConfigured) return null;
  const now = Date.now();
  const month = new Date().toISOString().slice(0, 7);
  const [{ result: here }, { result: guests }, { result: visits }, { result: scores }, { result: days }, { result: events }] = await pipeline([
    ["ZCOUNT", `${NS}:present`, now - PRESENT_NOW_MS, "+inf"],
    ["GET", `${NS}:guests`],
    ["GET", `${NS}:visits`],
    ["ZRANGE", `${NS}:board:${month}`, 0, -1, "WITHSCORES"],
    ["HGETALL", `${NS}:days`],
    ["HGETALL", `${NS}:events`],
  ]);
  const flat = (scores as string[]) ?? [];
  const others: number[] = [];
  for (let i = 0; i < flat.length; i += 2) if (flat[i] !== visitorId) others.push(Number(flat[i + 1]));
  const perDay = new Map<string, number>();
  const dayFlat = (days as string[]) ?? [];
  for (let i = 0; i < dayFlat.length; i += 2) perDay.set(dayFlat[i], Number(dayFlat[i + 1]));
  const lastDays = Array.from({ length: 14 }, (_, i) => {
    const key = new Date(now - (13 - i) * 86_400_000).toISOString().slice(0, 10);
    return { day: key, visits: perDay.get(key) ?? 0 };
  });
  const ev = new Map<string, number>();
  const evFlat = (events as string[]) ?? [];
  for (let i = 0; i < evFlat.length; i += 2) ev.set(evFlat[i], Number(evFlat[i + 1]));
  const totalVisits = Number(visits ?? 0);
  return {
    hereNow: Math.max(1, Number(here)),
    guests: Number(guests ?? 0),
    visits: totalVisits,
    month: {
      guests: others.length + 1,
      averageSeconds: others.length ? Math.round(others.reduce((a, b) => a + b, 0) / others.length) : null,
      longestSeconds: others.length ? Math.max(...others) : null,
      // Share of this month's other guests this visit has out-stayed
      beaten: others.length ? Math.round((others.filter((s) => s < seconds).length / others.length) * 100) : null,
    },
    lastDays,
    stamps: Object.fromEntries(["ring", "screen", "desk", "two", "back"].map((k) => [k, totalVisits ? Math.round(((ev.get(`stamp_${k}`) ?? 0) / totalVisits) * 100) : 0])),
  };
}
export type HouseStats = NonNullable<Awaited<ReturnType<typeof houseStats>>>;

/** Count a Bella event once per visit — SET NX on a per-visit marker, like visits. */
export async function recordEvent(visitId: string, event: BellaEvent) {
  if (!storeConfigured) {
    if (process.env.NODE_ENV !== "production") console.log(`[curiosity] event ${event} visit=${visitId.slice(0, 8)}`);
    return;
  }
  const [{ result }] = await pipeline([["SET", `${NS}:visit:${visitId}:event:${event}`, 1, "NX", "EX", VISIT_TTL_SECONDS]]);
  if (result === "OK") await pipeline([["HINCRBY", `${NS}:events`, event, 1]]);
}

/**
 * Where `seconds` would sit, measured against everyone else. The percentage comes from
 * the all-time board, which has the most visits behind it. The record to beat comes
 * from this month's board, so the gold stays winnable for new visitors even after a
 * very long visit is on record. The visitor's own stored score is left out of both —
 * it lags behind their live clock and would otherwise count as someone they've "beaten".
 */
export async function rankFor(visitorId: string, seconds: number): Promise<RankResult> {
  if (!storeConfigured) return { percentile: null, others: 0, leader: null };

  const board = `${NS}:board:alltime`;
  const month = `${NS}:board:${new Date().toISOString().slice(0, 7)}`;
  const [{ result: total }, { result: below }, { result: own }, { result: monthTotal }, { result: monthOwn }, { result: top }] = await pipeline([
    ["ZCARD", board],
    ["ZCOUNT", board, "-inf", `(${seconds}`],
    ["ZSCORE", board, visitorId],
    ["ZCARD", month],
    ["ZSCORE", month, visitorId],
    // Top two this month, so the leader is still found when this visitor is the one on top
    ["ZREVRANGE", month, 0, 1, "WITHSCORES"],
  ]);

  const ownScore = own === null ? null : Number(own);
  const everyone = Number(total) - (ownScore === null ? 0 : 1);
  const beaten = Number(below) - (ownScore !== null && ownScore < seconds ? 1 : 0);
  const others = Number(monthTotal) - (monthOwn === null ? 0 : 1);

  // ZREVRANGE WITHSCORES comes back flat: [member, score, member, score]
  const flat = top as string[];
  let leader: number | null = null;
  for (let i = 0; i < flat.length; i += 2) {
    if (flat[i] !== visitorId) {
      leader = Number(flat[i + 1]);
      break;
    }
  }

  const percentile = everyone < MIN_RANK_SAMPLE ? null : Math.floor((beaten / everyone) * 100);
  return { percentile, others, leader };
}
