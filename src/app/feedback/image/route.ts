// ── GET /feedback/image?p=<pathname> ──────────────────────────────────────────
// Shows a feedback image in the inbox. Private in Blob, so it's read here on the
// server, and only for a browser that has unlocked /feedback.

import { get } from "@vercel/blob";
import { IMAGE_RE } from "@/lib/feedback/shared";
import { hasAccess } from "../actions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await hasAccess())) return new Response(null, { status: 404 });
  const pathname = new URL(req.url).searchParams.get("p") ?? "";
  if (!IMAGE_RE.test(pathname) || !process.env.BLOB_READ_WRITE_TOKEN) return new Response(null, { status: 404 });
  try {
    const found = await get(pathname, { access: "private" });
    if (!found || !("stream" in found) || !found.stream) return new Response(null, { status: 404 });
    return new Response(found.stream, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" },
    });
  } catch (err) {
    console.error("[feedback] image read failed", err);
    return new Response(null, { status: 404 });
  }
}
