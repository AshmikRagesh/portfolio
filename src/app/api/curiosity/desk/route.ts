// ── GET /api/curiosity/desk?v=<visitorId> ─────────────────────────────────────
// What the Front desk page shows about this visitor and the house: their guest number,
// how many guests are here now, and the city and country Vercel puts on the request
// (approximate, from the IP, which is never stored). Nothing here is saved by city.

import { deskFor } from "@/lib/curiosity/store";
import { allow, ipHash, tooMany } from "@/lib/curiosity/guard";

const ID = /^[a-z0-9-]{8,64}$/i;

function header(req: Request, name: string) {
  const v = req.headers.get(name);
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export async function GET(req: Request) {
  if (!(await allow("desk", ipHash(req.headers), 20, 60))) return tooMany();
  const v = new URL(req.url).searchParams.get("v") ?? "";
  if (!ID.test(v)) return Response.json({ error: "bad visitor" }, { status: 400 });
  let desk: Awaited<ReturnType<typeof deskFor>> = { guestNo: null, guestsNow: null };
  try {
    desk = await deskFor(v);
  } catch (err) {
    console.error("[curiosity] desk failed", err);
  }
  return Response.json(
    { ...desk, city: header(req, "x-vercel-ip-city"), country: header(req, "x-vercel-ip-country") },
    { headers: { "Cache-Control": "no-store" } },
  );
}
