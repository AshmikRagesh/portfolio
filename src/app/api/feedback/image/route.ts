// ── POST /api/feedback/image ──────────────────────────────────────────────────
// Takes one image for a feedback comment, already resized to a JPEG in the browser,
// and stores it privately in Vercel Blob. Answers with its pathname, which the
// comment then carries. Only the /feedback inbox can show it (app/feedback/image).
// On `next dev` without Blob, images are kept in memory (lib/feedback/images.ts).

import { randomUUID } from "node:crypto";
import { imagesEnabled, saveImage } from "@/lib/feedback/images";
import { IMAGE_MAX_BYTES } from "@/lib/feedback/shared";
import { FB_NS } from "@/lib/feedback/store";
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
