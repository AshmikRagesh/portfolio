#!/usr/bin/env node
// ── Feedback: inbox in the terminal (for Claude) ──────────────────────────────
// Lists comments left in case study feedback mode, as Markdown, and marks them.
//
//   node scripts/feedback-report.mjs                 # open comments, grouped by case study
//   node scripts/feedback-report.mjs all             # every comment
//   node scripts/feedback-report.mjs since 7         # open comments from the last 7 days
//   node scripts/feedback-report.mjs mark <id> done  # done | wontdo | open  (the only write)
//
// Namespace: FEEDBACK_NS env, default "feedback" (live). Use FEEDBACK_NS=dev:feedback
// for comments left on `next dev`. Reads UPSTASH_REDIS_REST_URL / _TOKEN from the
// environment or .env.local.

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
const NS = env.FEEDBACK_NS || "feedback";
const SITE = env.SITE_URL || ""; // e.g. https://your-domain, for full links
const [mode = "open", a, b] = process.argv.slice(2);

async function run(commands) {
  if (!commands.length) return [];
  const res = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return (await res.json()).map((r) => r.result);
}

if (mode === "mark") {
  if (!/^[0-9a-f-]{36}$/.test(a ?? "") || !["done", "wontdo", "open"].includes(b)) {
    console.error("usage: mark <id> done|wontdo|open");
    process.exit(1);
  }
  const [exists] = await run([["EXISTS", `${NS}:item:${a}`]]);
  if (!exists) {
    console.error(`No comment ${a} in ${NS}`);
    process.exit(1);
  }
  await run([["HSET", `${NS}:item:${a}`, "status", b]]);
  console.log(`Marked ${a} as ${b}`);
  process.exit(0);
}

const [ids] = await run([["ZRANGE", `${NS}:all`, 0, 499, "REV"]]);
const rows = await run((ids ?? []).map((id) => ["HGETALL", `${NS}:item:${id}`]));
const items = rows
  .map((flat) => {
    const h = {};
    for (let i = 0; flat && i < flat.length; i += 2) h[flat[i]] = flat[i + 1];
    return h.id ? { ...h, createdAt: Number(h.createdAt), status: h.status || "open" } : null;
  })
  .filter(Boolean);

const since = mode === "since" ? Date.now() - Number(a || 7) * 86_400_000 : 0;
const shown = items.filter((i) => (mode === "all" ? true : i.status === "open") && i.createdAt >= since);
const nice = (ms) =>
  new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

const open = items.filter((i) => i.status === "open").length;
console.log(`# Case study feedback (${NS})\n`);
console.log(`${open} open of ${items.length} total. Showing ${shown.length}${mode === "all" ? " (all)" : mode === "since" ? ` open from the last ${a || 7} days` : " open"}.\n`);

const byPage = new Map();
for (const i of shown) byPage.set(i.page, [...(byPage.get(i.page) ?? []), i]);
for (const [page, list] of byPage) {
  console.log(`## ${page} (${list.length})\n`);
  for (const i of list.sort((x, y) => x.createdAt - y.createdAt)) {
    console.log(`- **${i.sectionLabel} · ${i.label}** — ${i.name || "Anonymous"}, ${nice(i.createdAt)}${i.status !== "open" ? ` [${i.status}]` : ""}`);
    if (i.snippet) console.log(`  > ${i.snippet}`);
    console.log(`  ${i.text.replace(/\n/g, "\n  ")}`);
    console.log(`  id: \`${i.id}\` · anchor: \`${i.anchor}\` · ${SITE}${i.page}?fb=${encodeURIComponent(i.anchor)}\n`);
  }
}
if (!shown.length) console.log("Nothing to show.");
