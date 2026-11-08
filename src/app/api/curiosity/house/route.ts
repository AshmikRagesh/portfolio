// ── GET /api/curiosity/house?v=<visitorId>&s=<seconds> ────────────────────────
// The numbers behind the dashboard on the pass page (lib/curiosity/store houseStats).
// Answers null when there's no store, so the page can say so.

import { MAX_VISIT_SECONDS } from "@/lib/curiosity/config";
import { houseStats } from "@/lib/curiosity/store";

const ID = /^[a-z0-9-]{8,64}$/i;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const v = params.get("v") ?? "";
  if (!ID.test(v)) return Response.json({ error: "bad visitor" }, { status: 400 });
  const s = Math.min(Math.max(Math.floor(Number(params.get("s"))) || 0, 0), MAX_VISIT_SECONDS);
  try {
    return Response.json(await houseStats(v, s), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[curiosity] house failed", err);
    return Response.json(null);
  }
}
