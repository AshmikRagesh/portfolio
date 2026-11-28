// ── One Chelsea match, in full ────────────────────────────────────────────────
// The match centre behind the pin's card: lineups, stats, timeline, news, form, head-to-
// head and the table, from ESPN's match summary (see lib/chelsea). ?id=<ESPN event id>.
// In development, &demo=1 shows a finished match as live (see ../route.ts).

import { NextResponse } from "next/server";
import { espn, detail } from "@/lib/chelsea";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const id = q.get("id");
  if (!id || !/^\d+$/.test(id)) return NextResponse.json({ error: "id" }, { status: 400 });
  const demo = process.env.NODE_ENV !== "production" && q.get("demo") === "1";
  try {
    const d = detail(await espn(`/all/summary?event=${id}`, 20), id, demo ? { state: "in", clock: "67'" } : undefined);
    const live = d.match.state === "in";
    return NextResponse.json(d, { headers: { "Cache-Control": live ? "public, s-maxage=20" : "public, s-maxage=300, stale-while-revalidate=1800" } });
  } catch {
    return NextResponse.json({ error: "espn" }, { status: 502 });
  }
}
