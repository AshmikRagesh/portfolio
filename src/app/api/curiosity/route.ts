// ── POST /api/curiosity ───────────────────────────────────────────────────────
// Receives heartbeat and closing reports from the curiosity clock. Everything is
// validated and clamped here — the client is never trusted with its own numbers.
// Always answers 204 on a well-formed report, even if storage fails, so a visitor
// never sees an error for something they didn't ask for.

import { MAX_LIFETIME_SECONDS, MAX_VISIT_SECONDS, type CuriosityPayload } from "@/lib/curiosity/config";
import { recordVisit } from "@/lib/curiosity/store";

const ID = /^[a-z0-9-]{8,64}$/i;
const VIEWPORTS = new Set(["mobile", "tablet", "desktop"]);

function clampInt(n: unknown, max: number) {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) ? Math.min(Math.max(v, 0), max) : 0;
}

function clean(raw: unknown): CuriosityPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.visitorId !== "string" || !ID.test(r.visitorId)) return null;
  if (typeof r.visitId !== "string" || !ID.test(r.visitId)) return null;

  const activeSeconds = clampInt(r.activeSeconds, MAX_VISIT_SECONDS);
  return {
    visitorId: r.visitorId,
    visitId: r.visitId,
    activeSeconds,
    lifetimeSeconds: Math.max(clampInt(r.lifetimeSeconds, MAX_LIFETIME_SECONDS), activeSeconds),
    visits: Math.max(clampInt(r.visits, 10_000), 1),
    path: typeof r.path === "string" && r.path.startsWith("/") ? r.path.slice(0, 120) : "/",
    referrer: typeof r.referrer === "string" ? r.referrer.slice(0, 80).replace(/[^a-z0-9.-]/gi, "") : "",
    viewport: VIEWPORTS.has(r.viewport as string) ? (r.viewport as CuriosityPayload["viewport"]) : "desktop",
    final: r.final === true,
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const payload = clean(body);
  if (!payload) return new Response(null, { status: 400 });

  try {
    await recordVisit(payload);
  } catch (err) {
    console.error("[curiosity] store failed", err);
  }
  return new Response(null, { status: 204 });
}
