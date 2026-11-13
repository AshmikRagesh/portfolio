// ── GET /feedback/image?p=<pathname> ──────────────────────────────────────────
// Shows a feedback image in the inbox. Private in Blob, so it's read here on the
// server, and only for a browser that has unlocked /feedback.

import { readImage } from "@/lib/feedback/images";
import { IMAGE_RE } from "@/lib/feedback/shared";
import { hasAccess } from "../actions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await hasAccess())) return new Response(null, { status: 404 });
  const pathname = new URL(req.url).searchParams.get("p") ?? "";
  if (!IMAGE_RE.test(pathname)) return new Response(null, { status: 404 });
  try {
    const body = await readImage(pathname);
    if (!body) return new Response(null, { status: 404 });
    return new Response(body, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" },
    });
  } catch (err) {
    console.error("[feedback] image read failed", err);
    return new Response(null, { status: 404 });
  }
}
