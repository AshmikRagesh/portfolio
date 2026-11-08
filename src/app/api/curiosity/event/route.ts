// ── POST /api/curiosity/event ─────────────────────────────────────────────────
// Notes that a visitor did something with Bella: opened the sign, copied the email,
// watched a video. Only known events from well-formed IDs are counted, once per visit.
// Always answers 204 on a well-formed request, even if storage fails.

import { BELLA_EVENTS, type BellaEvent } from "@/lib/curiosity/config";
import { recordEvent } from "@/lib/curiosity/store";

const ID = /^[a-z0-9-]{8,64}$/i;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { visitId, event } = body ?? {};
  if (typeof visitId !== "string" || !ID.test(visitId)) return new Response(null, { status: 400 });
  if (typeof event !== "string" || !(event in BELLA_EVENTS)) return new Response(null, { status: 400 });

  try {
    await recordEvent(visitId, event as BellaEvent);
  } catch (err) {
    console.error("[curiosity] event store failed", err);
  }
  return new Response(null, { status: 204 });
}
