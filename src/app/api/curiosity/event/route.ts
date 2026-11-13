// ── POST /api/curiosity/event ─────────────────────────────────────────────────
// Notes that a visitor did something with Bella: opened the sign, copied the email,
// watched a video. Only known events from well-formed IDs are counted, once per visit.
// Always answers 204 on a well-formed request, even if storage fails.

import { BELLA_EVENTS, type BellaEvent } from "@/lib/curiosity/config";
import { recordEvent } from "@/lib/curiosity/store";
import { allow, ipHash, tooMany } from "@/lib/curiosity/guard";
import { isOwner } from "@/lib/owner";

const ID = /^[a-z0-9-]{8,64}$/i;

export async function POST(req: Request) {
  if (!(await allow("event", ipHash(req.headers), 60, 60))) return tooMany();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { visitorId, visitId, event } = body ?? {};
  if (typeof visitId !== "string" || !ID.test(visitId)) return new Response(null, { status: 400 });
  if (typeof event !== "string" || !(event in BELLA_EVENTS)) return new Response(null, { status: 400 });
  // Ashmik's own browser (owner switch on /stats) is never counted
  if (await isOwner()) return new Response(null, { status: 204 });

  try {
    const ok = await recordEvent(visitId, typeof visitorId === "string" ? visitorId : "", event as BellaEvent);
    if (!ok) return new Response(null, { status: 403 });
  } catch (err) {
    console.error("[curiosity] event store failed", err);
  }
  return new Response(null, { status: 204 });
}
