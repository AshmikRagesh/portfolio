#!/usr/bin/env node
// ── Curiosity: take one visitor out of the numbers ────────────────────────────
// For visits that turned out to be Ashmik's own (before the owner switches existed,
// or from a browser that wasn't marked). Finds every stored visit of that visitor
// and undoes what it added: the visit count, its day, referrer, device and Bella
// events, its duration, and the visitor's leaderboard and lifetime scores.
//
// Dry run by default — prints what would change and writes nothing.
//
//   node scripts/curiosity-remove-visitor.mjs <visitorId or its first 8+ chars>
//   node scripts/curiosity-remove-visitor.mjs <visitorId> --apply
//   node scripts/curiosity-remove-visitor.mjs <visitorId> --ns dev:curiosity
//
// Daily snapshots already taken are history and stay as they are. Visits older
// than 90 days have expired, so only their totals remain and can't be undone.
// Reads UPSTASH_REDIS_REST_URL / _TOKEN from the environment or .env.local.

import { readFileSync } from "node:fs";

const env = { ...process.env };
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}
if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
  console.error("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set");
  process.exit(1);
}

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const nsAt = args.indexOf("--ns");
const NS = nsAt >= 0 ? args[nsAt + 1] : "curiosity";
const wanted = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--ns");
if (!wanted || wanted.length < 8) {
  console.error("Give a visitor ID (at least its first 8 characters).");
  process.exit(1);
}

async function pipeline(commands) {
  if (!commands.length) return [];
  const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return (await res.json()).map((r) => r.result);
}

async function scan(match) {
  const keys = [];
  let cursor = "0";
  do {
    const [[next, batch]] = await pipeline([["SCAN", cursor, "MATCH", match, "COUNT", 1000]]);
    cursor = next;
    keys.push(...batch);
  } while (cursor !== "0");
  return keys;
}

const istDay = (ms) => new Date(ms + 5.5 * 3600_000).toISOString().slice(0, 10);
const hash = (flat) => Object.fromEntries((flat ?? []).flatMap((v, i, a) => (i % 2 ? [] : [[v, a[i + 1]]])));

// Every stored visit (not its :counted / :event: markers)
const visitKeys = (await scan(`${NS}:visit:*`)).filter((k) => !k.slice(`${NS}:visit:`.length).includes(":"));
const rows = await pipeline(visitKeys.map((k) => ["HGETALL", k]));
const visits = visitKeys
  .map((key, i) => ({ key, id: key.slice(`${NS}:visit:`.length), ...hash(rows[i]) }))
  .filter((v) => v.visitorId?.startsWith(wanted));

const visitorIds = [...new Set(visits.map((v) => v.visitorId))];
if (visitorIds.length === 0) {
  console.log(`No stored visits for ${wanted} in ${NS}.`);
  process.exit(0);
}
if (visitorIds.length > 1) {
  console.error(`"${wanted}" matches more than one visitor: ${visitorIds.join(", ")}. Give more characters.`);
  process.exit(1);
}
const visitorId = visitorIds[0];

// Which visits were counted, and which Bella events each one added
const counted = await pipeline(visits.map((v) => ["EXISTS", `${v.key}:counted`]));
const eventKeys = await Promise.all(visits.map((v) => scan(`${v.key}:event:*`)));

const commands = [];
const summary = { visits: 0, days: {}, referrers: {}, devices: {}, events: {}, seconds: 0 };
const bump = (o, k) => (o[k] = (o[k] ?? 0) + 1);

visits.forEach((v, i) => {
  if (counted[i]) {
    const day = istDay(Number(v.startedAt));
    const ref = v.referrer || "direct";
    commands.push(
      ["DECR", `${NS}:visits`],
      ["HINCRBY", `${NS}:days`, day, -1],
      ["HINCRBY", `${NS}:referrers`, ref, -1],
      ["HINCRBY", `${NS}:devices`, v.viewport, -1],
    );
    summary.visits++;
    bump(summary.days, day);
    bump(summary.referrers, ref);
    bump(summary.devices, v.viewport);
  }
  for (const k of eventKeys[i]) {
    const event = k.split(":event:")[1];
    commands.push(["HINCRBY", `${NS}:events`, event, -1]);
    bump(summary.events, event);
  }
  summary.seconds += Number(v.activeSeconds) || 0;
  commands.push(
    ["ZREM", `${NS}:recent`, v.id],
    ["ZREM", `${NS}:durations`, v.id],
    ["DEL", v.key, `${v.key}:counted`, ...eventKeys[i]],
  );
});

// Visitor-level scores: every leaderboard (all-time and each month), lifetime, in the house now
for (const board of await scan(`${NS}:board:*`)) commands.push(["ZREM", board, visitorId]);
commands.push(["ZREM", `${NS}:lifetime`, visitorId], ["ZREM", `${NS}:present`, visitorId]);
// And stop counting this device from now on (read by skipCounting in lib/owner.ts)
commands.push(["SADD", `${NS}:owner:visitors`, visitorId]);

console.log(`Visitor ${visitorId} in ${NS}`);
console.log(`  ${visits.length} stored visits, ${summary.visits} counted, ${Math.round(summary.seconds / 60)} min active`);
console.log(`  days      ${JSON.stringify(summary.days)}`);
console.log(`  referrers ${JSON.stringify(summary.referrers)}`);
console.log(`  devices   ${JSON.stringify(summary.devices)}`);
console.log(`  events    ${JSON.stringify(summary.events)}`);

if (!APPLY) {
  console.log(`\nDry run: nothing changed. Add --apply to remove (${commands.length} writes).`);
  process.exit(0);
}
await pipeline(commands);
// Drop counters a removal brought to zero, so the lists don't show empty rows
for (const key of ["days", "referrers", "devices", "events"]) {
  const all = hash(...(await pipeline([["HGETALL", `${NS}:${key}`]])));
  const empty = Object.entries(all).filter(([, n]) => Number(n) <= 0).map(([k]) => k);
  if (empty.length) await pipeline([["HDEL", `${NS}:${key}`, ...empty]]);
}
console.log(`\nRemoved. ${commands.length} writes applied.`);
