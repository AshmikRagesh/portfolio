// ── GET /api/curiosity/snapshot ───────────────────────────────────────────────
// Called once a day by Vercel Cron (see vercel.json) to save the totals for the IST
// day that just ended. Vercel sends "Authorization: Bearer <CRON_SECRET>"; anything
// else gets a 404, and so does every request while CRON_SECRET is unset.

import { createHash, timingSafeEqual } from "node:crypto";
import { takeSnapshot } from "@/lib/curiosity/snapshot";

export const dynamic = "force-dynamic";

const digest = (v: string) => createHash("sha256").update(v).digest();

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get("authorization") ?? "";
  if (!secret || !timingSafeEqual(digest(given), digest(`Bearer ${secret}`))) {
    return new Response("Not found", { status: 404 });
  }
  const { saved, snapshot } = await takeSnapshot();
  return Response.json({ saved, day: snapshot?.day ?? null });
}
