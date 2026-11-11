#!/usr/bin/env node
// ── Curiosity: list suspect entries (READ ONLY) ───────────────────────────────
// Prints board entries and recent visits that look like tests or forgeries, so they
// can be reviewed before anything is removed. This script never writes or deletes.
//
//   node scripts/curiosity-suspects.mjs            # live keys (curiosity:*)
//   node scripts/curiosity-suspects.mjs dev:curiosity
//
// Reads UPSTASH_REDIS_REST_URL / _TOKEN from the environment or .env.local.

import { readFileSync } from "node:fs";

const env = { ...process.env };
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}
const URL_ = env.UPSTASH_REDIS_REST_URL;
const TOKEN = env.UPSTASH_REDIS_REST_TOKEN;
if (!URL_ || !TOKEN) {
  console.error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set");
  process.exit(1);
}
const NS = process.argv[2] || "curiosity";
// Only read commands are ever sent
const READ = new Set(["ZRANGE", "ZREVRANGE", "HGETALL", "GET", "SCAN"]);

async function run(commands) {
  for (const c of commands) if (!READ.has(c[0])) throw new Error(`refusing non-read command ${c[0]}`);
  const res = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return (await res.json()).map((r) => r.result);
}
const pairs = (flat) => Array.from({ length: (flat?.length ?? 0) / 2 }, (_, i) => [flat[2 * i], Number(flat[2 * i + 1])]);

const TEST_ID = /placeholder|test|dev|flood|demo|fake|local/i;
const LONG = 7000; // within 200s of the 2-hour cap
const month = new Date().toISOString().slice(0, 7);

const [alltime, monthly, lifetime, recent] = await run([
  ["ZREVRANGE", `${NS}:board:alltime`, 0, -1, "WITHSCORES"],
  ["ZREVRANGE", `${NS}:board:${month}`, 0, -1, "WITHSCORES"],
  ["ZREVRANGE", `${NS}:lifetime`, 0, -1, "WITHSCORES"],
  ["ZREVRANGE", `${NS}:recent`, 0, 499],
]);

const report = (title, rows) => {
  console.log(`\n${title} (${rows.length})`);
  for (const r of rows) console.log("  " + r);
};

const flagBoard = (rows) =>
  rows.filter(([id, s]) => TEST_ID.test(id) || s >= LONG).map(([id, s]) => `${id}  ${s}s${s >= LONG ? "  [≥7000s]" : ""}`);

report(`${NS}:board:alltime suspects`, flagBoard(pairs(alltime)));
report(`${NS}:board:${month} suspects`, flagBoard(pairs(monthly)));
report(`${NS}:lifetime suspects`, flagBoard(pairs(lifetime)));

const visits = recent?.length ? await run(recent.map((id) => ["HGETALL", `${NS}:visit:${id}`])) : [];
const odd = [];
visits.forEach((flat, i) => {
  const v = Object.fromEntries(pairs(flat ?? []).map(([k], j) => [k, flat[2 * j + 1]]));
  const why = [];
  if (TEST_ID.test(recent[i]) || TEST_ID.test(v.visitorId ?? "")) why.push("test-like id");
  if (/localhost|127\.0\.0\.1|vercel\.app/i.test(v.referrer ?? "")) why.push(`referrer ${v.referrer}`);
  if (Number(v.activeSeconds) >= LONG) why.push(`${v.activeSeconds}s`);
  const span = (Number(v.updatedAt) - Number(v.startedAt)) / 1000;
  if (Number.isFinite(span) && Number(v.activeSeconds) > span + 60) why.push(`active ${v.activeSeconds}s > wall ${Math.round(span)}s`);
  if (why.length) odd.push(`${recent[i]}  visitor=${v.visitorId ?? "?"}  ${why.join(", ")}`);
});
report(`${NS}:visit suspects among newest ${recent?.length ?? 0}`, odd);

console.log("\nNothing was changed. Review these, then decide what to remove.");
