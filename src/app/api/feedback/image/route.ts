// ── POST /api/feedback/image ──────────────────────────────────────────────────
// Takes one image for a feedback comment, already resized to a JPEG in the browser,
// and stores it privately in Vercel Blob. Answers with its pathname, which the
// comment then carries. Only the /feedback inbox can show it (app/feedback/image).
// On `next dev` without Blob, images are kept in memory (lib/feedback/images.ts).
//
// GET ?id=<comment>&author=<id> shows a comment's image to the reviewer who left it
// (Your notes); nobody else can read it here.

import { randomUUID } from "node:crypto";
import { imagesEnabled, readImage, saveImage } from "@/lib/feedback/images";
import { IMAGE_MAX_BYTES } from "@/lib/feedback/shared";
import { FB_NS, getFeedback } from "@/lib/feedback/store";
import { AUTHOR_RE, IMAGE_RE } from "@/lib/feedback/shared";
import { allow, ipHash, tooMany } from "@/lib/curiosity/guard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!imagesEnabled()) return new Response(null, { status: 503 });
  if (req.headers.get("content-type") !== "image/jpeg") return new Response(null, { status: 415 });
  if (Number(req.headers.get("content-length") ?? 0) > IMAGE_MAX_BYTES) return new Response(null, { status: 413 });
  if (!(await allow("feedback-image", ipHash(req.headers), 5, 10 * 60))) return tooMany();

  const bytes = Buffer.from(await req.arrayBuffer());
  // Size again (the header can lie) and the JPEG signature, FF D8 FF
  if (!bytes.length || bytes.length > IMAGE_MAX_BYTES) return new Response(null, { status: 413 });
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return new Response(null, { status: 415 });

  try {
    const pathname = `feedback/${FB_NS.replace(":", "-")}/${randomUUID()}.jpg`;
    await saveImage(pathname, bytes);
    return Response.json({ image: pathname }, { status: 201 });
  } catch (err) {
    console.error("[feedback] image store failed", err);
    return new Response(null, { status: 503 });
  }
}

export async function GET(req: Request) {
  if (!(await allow("feedback-image-read", ipHash(req.headers), 120, 60))) return tooMany();
  const params = new URL(req.url).searchParams;
  const id = params.get("id") ?? "";
  const author = params.get("author") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id) || !AUTHOR_RE.test(author)) return new Response(null, { status: 404 });
  try {
    const item = await getFeedback(id);
    if (!item || item.author !== author || !IMAGE_RE.test(item.image)) return new Response(null, { status: 404 });
    const body = await readImage(item.image);
    if (!body) return new Response(null, { status: 404 });
    return new Response(body, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" } });
  } catch (err) {
    console.error("[feedback] reviewer image read failed", err);
    return new Response(null, { status: 404 });
  }
}
