// ── GET /api/curiosity/rank?v=<visitorId>&s=<seconds> ─────────────────────────
// "You've stayed longer than N% of visitors", plus the longest visit by anyone
// else — the record the host watches for. Takes the visitor's live seconds rather
// than their stored score, which can be up to a heartbeat behind.

import { MAX_VISIT_SECONDS, type RankResult } from "@/lib/curiosity/config";
import { rankFor } from "@/lib/curiosity/store";

const ID = /^[a-z0-9-]{8,64}$/i;
const NO_DATA: RankResult = { percentile: null, others: 0, leader: null };

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const visitorId = params.get("v") ?? "";
  const seconds = Math.min(Math.max(Math.floor(Number(params.get("s"))), 0), MAX_VISIT_SECONDS);
  if (!ID.test(visitorId) || !Number.isFinite(seconds)) return Response.json(NO_DATA, { status: 400 });

  try {
    return Response.json(await rankFor(visitorId, seconds), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[curiosity] rank failed", err);
    return Response.json(NO_DATA);
  }
}
