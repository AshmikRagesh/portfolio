// ── Curiosity: storage ────────────────────────────────────────────────────────
// Where visit reports end up. Two modes, picked by environment:
//
//   Upstash Redis   when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are
//                   set. Talks to Upstash's REST API with plain fetch, so there's
//                   no SDK dependency.
//   Dev log         otherwise. Prints each report to the server console and keeps
//                   nothing — fine locally, a no-op if it ever ships unconfigured.
//
// Redis layout:
//   curiosity:visit:<visitId>        hash, the latest numbers for one visit (90-day TTL)
//   curiosity:board:alltime          sorted set, visitorId → best single-visit seconds
//   curiosity:board:<YYYY-MM>        sorted set, same but for this month only
//   curiosity:lifetime               sorted set, visitorId → lifetime seconds
//   curiosity:visits                 counter, visits seen (bumped once per visit)
//
// The sorted sets are what Phase 2 reads: rank and count on them give "you've
// stayed longer than N% of visitors" in a single round trip.

import { MIN_RANK_SAMPLE, type CuriosityPayload, type RankResult } from "./config";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const VISIT_TTL_SECONDS = 60 * 60 * 24 * 90;

export const storeConfigured = Boolean(REDIS_URL && TOKEN);

type Command = (string | number)[];

async function pipeline(commands: Command[]) {
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
  const visitKey = `curiosity:visit:${p.visitId}`;

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
    ["ZADD", "curiosity:board:alltime", "GT", p.activeSeconds, p.visitorId],
    ["ZADD", `curiosity:board:${month}`, "GT", p.activeSeconds, p.visitorId],
    ["ZADD", "curiosity:lifetime", "GT", p.lifetimeSeconds, p.visitorId],
  ]);

  // Count each visit once — SET NX on a marker means only the first report wins
  const [{ result }] = await pipeline([["SET", `${visitKey}:counted`, 1, "NX", "EX", VISIT_TTL_SECONDS]]);
  if (result === "OK") await pipeline([["INCR", "curiosity:visits"]]);
}

/**
 * Where `seconds` would sit on the all-time board, measured against everyone else.
 * The visitor's own stored score is left out — it lags behind their live clock and
 * would otherwise count as someone they've "beaten".
 */
export async function rankFor(visitorId: string, seconds: number): Promise<RankResult> {
  if (!storeConfigured) return { percentile: null, others: 0, leader: null };

  const board = "curiosity:board:alltime";
  const [{ result: total }, { result: below }, { result: own }, { result: top }] = await pipeline([
    ["ZCARD", board],
    ["ZCOUNT", board, "-inf", `(${seconds}`],
    ["ZSCORE", board, visitorId],
    // Top two, so the leader is still found when this visitor is the one on top
    ["ZREVRANGE", board, 0, 1, "WITHSCORES"],
  ]);

  const ownScore = own === null ? null : Number(own);
  const others = Number(total) - (ownScore === null ? 0 : 1);
  const beaten = Number(below) - (ownScore !== null && ownScore < seconds ? 1 : 0);

  // ZREVRANGE WITHSCORES comes back flat: [member, score, member, score]
  const flat = top as string[];
  let leader: number | null = null;
  for (let i = 0; i < flat.length; i += 2) {
    if (flat[i] !== visitorId) {
      leader = Number(flat[i + 1]);
      break;
    }
  }

  const percentile = others < MIN_RANK_SAMPLE ? null : Math.floor((beaten / others) * 100);
  return { percentile, others, leader };
}
