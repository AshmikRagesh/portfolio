#!/usr/bin/env node
// ── Curiosity: weekly summary and spike check (READ ONLY) ─────────────────────
// Prints a plain Markdown report from the live numbers. Used by the scheduled
// Claude tasks; never writes or deletes anything.
//
//   node scripts/curiosity-report.mjs weekly             # last Mon–Sun (IST), vs the week before
//   node scripts/curiosity-report.mjs spikes             # last 24 hours; first line is "SPIKE" or "OK"
//   node scripts/curiosity-report.mjs weekly dev:curiosity
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
const MODE = process.argv[2] || "weekly";
const NS = process.argv[3] || "curiosity";

// Only read commands are ever sent
const READ = new Set(["GET", "MGET", "HGET", "HMGET", "HGETALL", "ZCOUNT", "ZRANGE", "ZRANGEBYSCORE", "ZCARD"]);
async function run(commands) {
  if (!commands.length) return [];
  for (const c of commands) if (!READ.has(c[0])) throw new Error(`refusing non-read command ${c[0]}`);
  const res = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return (await res.json()).map((r) => r.result);
}

// ── Days in IST (same rules as src/lib/curiosity/day.ts) ──
const IST = 5.5 * 3600_000;
const DAY = 86_400_000;
const istDay = (ms = Date.now()) => new Date(ms + IST).toISOString().slice(0, 10);
const dayBefore = (d, n = 1) => new Date(Date.parse(`${d}T00:00:00Z`) - n * DAY).toISOString().slice(0, 10);
const dayStart = (d) => Date.parse(`${d}T00:00:00+05:30`);
const nice = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

const hash = (flat) => {
  const out = {};
  for (let i = 0; flat && i < flat.length; i += 2) out[flat[i]] = Number(flat[i + 1]);
  return out;
};
const dur = (s) =>
  s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` : s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
const change = (now, before) => {
  if (before == null) return "";
  if (before === 0) return now ? " (none the week before)" : " (same as the week before)";
  const pct = Math.round(((now - before) / before) * 100);
  return ` (${pct >= 0 ? "+" : ""}${pct}% vs ${before} the week before)`;
};

const EVENTS = {
  sign_open: "Opened Bella's sign",
  email_copy_bella: "Copied the email from Bella",
  email_copy_button: "Copied the email from the button",
  video_watch: "Watched a video",
  key_earned: "Finished a case study",
  stamp_ring: "Stamp: First ring",
  stamp_screen: "Stamp: Screening",
  stamp_desk: "Stamp: Front desk",
};

/** Visits started in [from, to) ms, with their active seconds. */
async function visitsBetween(from, to) {
  const [ids] = await run([["ZRANGEBYSCORE", `${NS}:recent`, from, `(${to}`]]);
  const secs = await run((ids ?? []).map((id) => ["HGET", `${NS}:visit:${id}`, "activeSeconds"]));
  return secs.filter((s) => s !== null).map(Number);
}

/** Difference of two snapshot hashes, largest first. */
function delta(end, start) {
  return Object.entries(end ?? {})
    .map(([k, v]) => [k, v - (start?.[k] ?? 0)])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
}

async function weekly() {
  const end = dayBefore(istDay()); // yesterday, IST
  const start = dayBefore(end, 6);
  const prevEnd = dayBefore(start);
  const prevStart = dayBefore(prevEnd, 6);
  const days = Array.from({ length: 14 }, (_, i) => dayBefore(end, 13 - i));

  const [perDay, snapEnd, snapStart, snapPrevStart, visitors, guests, visits] = await run([
    ["HMGET", `${NS}:days`, ...days],
    ["GET", `${NS}:snapshot:${end}`],
    ["GET", `${NS}:snapshot:${prevEnd}`],
    ["GET", `${NS}:snapshot:${dayBefore(prevStart)}`],
    ["ZCARD", `${NS}:board:alltime`],
    ["GET", `${NS}:guests`],
    ["GET", `${NS}:visits`],
  ]);
  const counts = (perDay ?? []).map((n) => Number(n ?? 0));
  const prevWeek = counts.slice(0, 7).reduce((a, b) => a + b, 0);
  const thisWeek = counts.slice(7).reduce((a, b) => a + b, 0);

  const se = snapEnd ? JSON.parse(snapEnd) : null;
  const ss = snapStart ? JSON.parse(snapStart) : null;
  const sp = snapPrevStart ? JSON.parse(snapPrevStart) : null;

  const secs = await visitsBetween(dayStart(start), dayStart(end) + DAY);
  const prevSecs = await visitsBetween(dayStart(prevStart), dayStart(prevEnd) + DAY);
  const avg = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
  const long = secs.filter((s) => s >= 7000).length;

  const out = [];
  out.push(`# Curiosity: week of ${nice(start)} – ${nice(end)} (IST)`, "");
  out.push(`- **Visits:** ${thisWeek}${change(thisWeek, prevWeek)}`);
  if (se && ss) {
    const newGuests = se.visitors - ss.visitors;
    const prev = sp ? ss.visitors - sp.visitors : null;
    out.push(`- **New guests (first visit this week):** ${newGuests}${change(newGuests, prev)}`);
  } else {
    out.push(`- **New guests:** not available yet (needs daily snapshots on ${nice(prevEnd)} and ${nice(end)})`);
  }
  out.push(`- **Average stay:** ${dur(avg(secs))}${prevSecs.length ? ` (${dur(avg(prevSecs))} the week before)` : ""}`);
  out.push(`- **Longest stay:** ${secs.length ? dur(Math.max(...secs)) : "–"}`);
  if (long) out.push(`- **Stays of nearly 2 hours (the cap):** ${long}. Worth a look; they may be a tab left open or a test.`);
  out.push("", "## Visits per day", "");
  for (let i = 7; i < 14; i++) out.push(`- ${nice(days[i])}: ${counts[i]}`);

  const section = (title, rows, label = (k) => k) => {
    out.push("", `## ${title}`, "");
    if (!rows.length) out.push("- none");
    for (const [k, v] of rows.slice(0, 8)) out.push(`- ${label(k)}: ${v}`);
  };
  if (se && ss) {
    section("Top sources this week", delta(se.referrers, ss.referrers));
    section("Devices this week", delta(se.devices, ss.devices));
    section("Bella this week (visits that did each)", delta(se.events, ss.events), (k) => EVENTS[k] ?? k);
  } else {
    out.push("", "_Sources, devices and Bella below are all-time totals; this-week numbers start once daily snapshots cover the whole week._");
    const [refs, devs, evs] = await run([
      ["HGETALL", `${NS}:referrers`],
      ["HGETALL", `${NS}:devices`],
      ["HGETALL", `${NS}:events`],
    ]);
    const sorted = (h) => Object.entries(hash(h)).sort((a, b) => b[1] - a[1]);
    section("Top sources (all time)", sorted(refs));
    section("Devices (all time)", sorted(devs));
    section("Bella (all time, visits that did each)", sorted(evs), (k) => EVENTS[k] ?? k);
  }
  out.push("", `All time: ${Number(visits ?? 0)} visits, ${Number(visitors ?? 0)} guests, guest numbers handed out: ${Number(guests ?? 0)}.`);
  out.push("", "Days before v1.2 were counted in UTC; snapshots are taken about 00:30–01:30 IST, so weekly differences can include up to an hour of the next day.");
  console.log(out.join("\n"));
}

/** A flood: at least this many visits in 24 hours AND this many times the usual day. */
const FLOOD_MIN = 30;
const FLOOD_TIMES = 5;

async function spikes() {
  const now = Date.now();
  const today = istDay(now);
  const days = Array.from({ length: 14 }, (_, i) => dayBefore(today, 14 - i));
  const [last24, perDay] = await run([
    ["ZCOUNT", `${NS}:recent`, now - DAY, "+inf"],
    ["HMGET", `${NS}:days`, ...days],
  ]);
  const usual = (perDay ?? []).map((n) => Number(n ?? 0)).sort((a, b) => a - b)[7] ?? 0; // median of 14 days
  const secs = await visitsBetween(now - DAY, now + 1);
  const long = secs.filter((s) => s >= 7000);

  const flood = Number(last24) >= FLOOD_MIN && Number(last24) >= FLOOD_TIMES * Math.max(1, usual);
  const out = [flood || long.length ? "SPIKE" : "OK", ""];
  out.push(`Last 24 hours: ${Number(last24)} visits (a usual day lately: ${usual}).`);
  if (flood) out.push(`- Flood: ${last24} visits is at least ${FLOOD_TIMES}× a usual day. Could be a share that took off, or automated traffic.`);
  if (long.length) out.push(`- ${long.length} stay${long.length > 1 ? "s" : ""} of nearly 2 hours (the cap): ${long.map(dur).join(", ")}. Often a tab left open, or a test.`);
  if (!flood && !long.length) out.push("Nothing unusual.");
  console.log(out.join("\n"));
}

await (MODE === "spikes" ? spikes() : weekly());
