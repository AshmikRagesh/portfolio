// ── GitHub contributions, live ────────────────────────────────────────────────
// For the GitHub card in the hero. Reads each account's public contribution calendar
// (the same one on its profile, private-repo contributions included as counts) and
// returns the last year's total plus every day's count. Cached for an hour, so the
// numbers stay current without hitting GitHub on every visit.

import { NextResponse } from "next/server";

export const revalidate = 3600;

const ACCOUNTS = [
  { key: "personal", label: "Personal", handle: "AshmikRagesh" },
  { key: "work", label: "Work", handle: "aashmikragesh" },
] as const;

async function calendar(handle: string) {
  const r = await fetch(`https://github.com/users/${handle}/contributions`, {
    headers: { "User-Agent": "ashmik-portfolio" },
    next: { revalidate },
  });
  if (!r.ok) throw new Error(`${handle}: ${r.status}`);
  const html = await r.text();

  // Each day is a cell with a date and an id; its count lives in the tool-tip that points at that id
  const dateOf = new Map<string, string>();
  for (const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*?id="([^"]+)"/g)) dateOf.set(m[2], m[1]);
  for (const m of html.matchAll(/id="([^"]+)"[^>]*?data-date="(\d{4}-\d{2}-\d{2})"/g)) dateOf.set(m[1], m[2]);
  const days: Record<string, number> = {};
  for (const m of html.matchAll(/<tool-tip[^>]*?for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const date = dateOf.get(m[1]);
    const n = /^\s*([\d,]+) contribution/.exec(m[2]);
    if (date && n) days[date] = Number(n[1].replace(/,/g, ""));
  }
  const totalMatch = /([\d,]+)\s+contributions?\s+in the last year/.exec(html);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : Object.values(days).reduce((a, b) => a + b, 0);
  return { total, days };
}

export async function GET() {
  try {
    const results = await Promise.all(ACCOUNTS.map(async (a) => ({ ...a, ...(await calendar(a.handle)) })));
    return NextResponse.json(
      { asOf: new Date().toISOString().slice(0, 10), accounts: results },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ accounts: [] }, { status: 502 });
  }
}
