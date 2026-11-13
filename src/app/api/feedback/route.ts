// ── /api/feedback ─────────────────────────────────────────────────────────────
// GET  ?author=<id>[&page=/works/x] → that reviewer's own comments (on that page, or all)
// POST FeedbackInput (+ "website", a honeypot real people never fill) → the saved comment
// DELETE { id, author } → removes that comment, only for the browser that wrote it
//
// Reviewers only ever see their own comments; everything lands in the private
// /feedback inbox. Rate limited per hashed IP. Comments from Ashmik's own browser
// (lib/owner.ts) are saved as tests.

import { addFeedback, deleteFeedback, listForAuthor } from "@/lib/feedback/store";
import { deleteImage } from "@/lib/feedback/images";
import { ANCHOR_RE, AUTHOR_RE, IMAGE_RE, LIMITS, PAGE_RE, isCategory, type FeedbackInput, type FeedbackItem } from "@/lib/feedback/shared";
import { isOwner } from "@/lib/owner";
import { allow, ipHash, tooMany } from "@/lib/curiosity/guard";

export const dynamic = "force-dynamic";

/** The author ID and the test flag stay on the server; the image path becomes a yes/no */
function forReviewer(item: FeedbackItem) {
  const rest: Partial<FeedbackItem> & { hasImage?: boolean } = { ...item, hasImage: Boolean(item.image) };
  delete rest.author;
  delete rest.test;
  delete rest.image;
  return rest;
}

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

export async function GET(req: Request) {
  if (!(await allow("feedback-read", ipHash(req.headers), 60, 60))) return tooMany();
  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "";
  const author = url.searchParams.get("author") ?? "";
  if ((page && !PAGE_RE.test(page)) || !AUTHOR_RE.test(author)) return new Response(null, { status: 400 });
  try {
    const items = await listForAuthor(author, page || undefined);
    return Response.json(items.map(forReviewer));
  } catch (err) {
    console.error("[feedback] read failed", err);
    return Response.json([]);
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  // Bots fill every field; pretend it worked
  if (typeof body.website === "string" && body.website) return new Response(null, { status: 204 });
  if (!(await allow("feedback", ipHash(req.headers), 10, 10 * 60))) return tooMany();

  // Keep line breaks in the comment itself, but cap and trim it
  const text = typeof body.text === "string" ? body.text.trim().slice(0, LIMITS.text) : "";
  const input: FeedbackInput = {
    page: clean(body.page, 80),
    pageTitle: clean(body.pageTitle, LIMITS.label),
    section: clean(body.section, LIMITS.section),
    sectionLabel: clean(body.sectionLabel, LIMITS.label),
    anchor: clean(body.anchor, LIMITS.anchor),
    label: clean(body.label, LIMITS.label),
    snippet: clean(body.snippet, LIMITS.snippet),
    text,
    name: clean(body.name, LIMITS.name),
    category: isCategory(body.category) ? body.category : "",
    image: typeof body.image === "string" && IMAGE_RE.test(body.image) ? body.image : "",
    author: clean(body.author, 64),
  };
  if (!PAGE_RE.test(input.page) || !AUTHOR_RE.test(input.author) || !ANCHOR_RE.test(input.anchor) || !text) {
    return new Response(null, { status: 400 });
  }

  try {
    return Response.json(forReviewer(await addFeedback(input, { test: await isOwner() })), { status: 201 });
  } catch (err) {
    console.error("[feedback] store failed", err);
    return new Response(null, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  if (!(await allow("feedback-delete", ipHash(req.headers), 30, 10 * 60))) return tooMany();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { id, author } = body ?? {};
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id) || typeof author !== "string" || !AUTHOR_RE.test(author)) {
    return new Response(null, { status: 400 });
  }
  try {
    const { deleted, image } = await deleteFeedback(id, author);
    if (!deleted) return new Response(null, { status: 404 });
    if (image && IMAGE_RE.test(image)) {
      // The note is gone either way; a stray image is only storage
      await deleteImage(image).catch((err) => console.error("[feedback] image delete failed", err));
    }
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[feedback] delete failed", err);
    return new Response(null, { status: 503 });
  }
}
