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
//   curiosity:board:<YYYY-MM>        sorted set, same but for this month only (IST month)
//   curiosity:lifetime               sorted set, visitorId → lifetime seconds
//   curiosity:visits                 counter, visits seen (bumped once per visit)
//
// Tallies for the private stats page (no TTL, nothing that identifies a person):
//   curiosity:durations              sorted set, visitId → active seconds (GT, like the boards)
//   curiosity:recent                 sorted set, visitId → start time in ms; the stats page
//                                    reads the newest visit hashes from here for exit pages
//                                    (capped at RECENT_KEEP)
//   curiosity:days                   hash, YYYY-MM-DD (IST; UTC before v1.2) → visits started that day
//   curiosity:referrers              hash, referrer host or "direct" → visits
//   curiosity:devices                hash, mobile | tablet | desktop → visits
//   curiosity:events                 hash, Bella event → visits that did it (once per visit)
//   curiosity:snapshot:<YYYY-MM-DD>  string, the totals at the end of that IST day (see snapshot.ts)
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
import { istDay, istMonth } from "./day";

/**
 * Key prefix. Production writes "curiosity:…"; next dev (NODE_ENV=development)
 * writes "dev:curiosity:…", so local testing never lands in the live numbers even
 * when .env.local points at the same Upstash database. A local `next start` runs as
 * production, so set CURIOSITY_NS=dev:curiosity for that. Vercel preview deployments
 * also write dev keys. CURIOSITY_NS overrides it.
 */
// Vercel preview deployments run as production too, so they're sent to the dev keys
export const NS =
  process.env.CURIOSITY_NS ||
  (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview" ? "curiosity" : "dev:curiosity");

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

/** Seconds of active time the first report of a visit may claim. */
const FIRST_REPORT_SLACK = 60;

/**
 * Store one report. Returns "rejected" when the visit belongs to another visitor or a new
 * visit isn't allowed (opts.canStartVisit, the per-IP limit on new visits).
 */
export async function recordVisit(p: CuriosityPayload, opts: { canStartVisit?: () => Promise<boolean> } = {}) {
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

  const month = istMonth();
  const visitKey = `${NS}:visit:${p.visitId}`;

  // What the server already knows about this visit, to keep the claim plausible
  const [{ result: startedAt }, { result: owner }, { result: prevLifetime }] = await pipeline([
    ["HGET", visitKey, "startedAt"],
    ["HGET", visitKey, "visitorId"],
    ["ZSCORE", `${NS}:lifetime`, p.visitorId],
  ]);
  // A visit belongs to the visitor who started it
  if (owner !== null && owner !== p.visitorId) return "rejected";
  if (startedAt === null && opts.canStartVisit && !(await opts.canStartVisit())) return "rejected";

  // Active time can't outrun the wall clock since the server first saw this visit.
  // The first report gets FIRST_REPORT_SLACK seconds, since the clock runs before it.
  const elapsed = startedAt === null ? 0 : Math.max(0, (Date.now() - Number(startedAt)) / 1000);
  const activeSeconds = Math.min(p.activeSeconds, Math.floor(elapsed) + FIRST_REPORT_SLACK);
  // Lifetime can't grow by more than this visit's active time
  const lifetimeSeconds = Math.max(activeSeconds, Math.min(p.lifetimeSeconds, Number(prevLifetime ?? 0) + activeSeconds));
  p = { ...p, activeSeconds, lifetimeSeconds };

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
      ["HINCRBY", `${NS}:days`, istDay(now), 1],
      ["HINCRBY", `${NS}:referrers`, p.referrer || "direct", 1],
      ["HINCRBY", `${NS}:devices`, p.viewport, 1],
    ]);
  }
  return "stored";
}

/** True once this visitor has a stored report (every report sets their lifetime score). */
async function seen(visitorId: string) {
  const [{ result }] = await pipeline([["ZSCORE", `${NS}:lifetime`, visitorId]]);
  return result !== null;
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
  // Numbers only go to visitors whose clock has already reported, so a made-up ID gets none
  if (guestNo === null && !(await seen(visitorId))) return { guestNo: null, guestsNow: Math.max(1, Number(now)) };
  if (guestNo === null) {
    const [{ result: next }] = await pipeline([["INCR", `${NS}:guests`]]);
    const [{ result: set }] = await pipeline([["SET", key, next, "NX"]]);
    // Another request got there first: use the number it set
    guestNo = set === "OK" ? Number(next) : Number((await pipeline([["GET", key]]))[0].result);
  }
  return { guestNo, guestsNow: Math.max(1, Number(now)) };
}

/** Count a Bella event once per visit — SET NX on a per-visit marker, like visits. */
/** Only counts events for a visit the server has seen, from the visitor who owns it. */
export async function recordEvent(visitId: string, visitorId: string, event: BellaEvent): Promise<boolean> {
  if (!storeConfigured) {
    if (process.env.NODE_ENV !== "production") console.log(`[curiosity] event ${event} visit=${visitId.slice(0, 8)}`);
    return true;
  }
  const [{ result: owner }] = await pipeline([["HGET", `${NS}:visit:${visitId}`, "visitorId"]]);
  if (owner === null || owner !== visitorId) return false;
  const [{ result }] = await pipeline([["SET", `${NS}:visit:${visitId}:event:${event}`, 1, "NX", "EX", VISIT_TTL_SECONDS]]);
  if (result === "OK") await pipeline([["HINCRBY", `${NS}:events`, event, 1]]);
  return true;
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
  const month = `${NS}:board:${istMonth()}`;
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
