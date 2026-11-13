// ── Feedback: storage ─────────────────────────────────────────────────────────
// Comments left on case studies. Same Upstash database as Curiosity, own keys:
//
//   feedback:item:<id>          hash, one comment (fields of FeedbackItem)
//   feedback:all                sorted set, id → createdAt (ms); the inbox reads this
//   feedback:author:<authorId>  sorted set, id → createdAt; a reviewer's own comments
//
// A reviewer can delete their own comment (deleteFeedback): it's removed everywhere,
// inbox included, with its image.
//
// Attached images live in Vercel Blob (private), at feedback/<namespace>/<uuid>.jpg;
// the comment keeps only that pathname. Comments from a browser marked as Ashmik's
// (lib/owner.ts) are saved with test=true and kept out of the inbox's real lists.
//
// Production writes "feedback:…", next dev writes "dev:feedback:…" (FEEDBACK_NS
// overrides), so local testing never lands in the real inbox. Without Upstash an
// in-memory map stands in — enough for local testing, per server instance only.

import { randomUUID } from "node:crypto";
import { pipeline, storeConfigured } from "@/lib/curiosity/store";
import { isCategory, type FeedbackInput, type FeedbackItem, type FeedbackStatus } from "./shared";

// Vercel preview deployments run as production too, so they're sent to the dev keys
export const FB_NS =
  process.env.FEEDBACK_NS ||
  (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview" ? "feedback" : "dev:feedback");

/** The inbox and a reviewer's list never read more than this many. */
const READ_LIMIT = 500;

const memory: Map<string, FeedbackItem> =
  ((globalThis as { __feedback?: Map<string, FeedbackItem> }).__feedback ??= new Map());

function fromHash(flat: string[] | null): FeedbackItem | null {
  if (!flat || !flat.length) return null;
  const h: Record<string, string> = {};
  for (let i = 0; i < flat.length; i += 2) h[flat[i]] = flat[i + 1];
  return {
    id: h.id,
    page: h.page,
    pageTitle: h.pageTitle ?? "",
    section: h.section,
    sectionLabel: h.sectionLabel,
    anchor: h.anchor,
    label: h.label,
    snippet: h.snippet ?? "",
    text: h.text,
    name: h.name ?? "",
    category: isCategory(h.category) ? h.category : "",
    image: h.image ?? "",
    author: h.author,
    createdAt: Number(h.createdAt),
    status: (h.status as FeedbackStatus) || "open",
    test: h.test === "true",
  };
}

async function readItems(ids: string[]) {
  if (!ids.length) return [];
  const rows: { result: string[] | null }[] = await pipeline(ids.map((id) => ["HGETALL", `${FB_NS}:item:${id}`]));
  return rows.map((r) => fromHash(r.result)).filter((x): x is FeedbackItem => x !== null);
}

export async function addFeedback(input: FeedbackInput, opts: { test?: boolean } = {}): Promise<FeedbackItem> {
  const item: FeedbackItem = { ...input, id: randomUUID(), createdAt: Date.now(), status: "open", test: Boolean(opts.test) };
  if (!storeConfigured) {
    memory.set(item.id, item);
    return item;
  }
  const fields = Object.entries(item).flatMap(([k, v]) => [k, String(v)]);
  await pipeline([
    ["HSET", `${FB_NS}:item:${item.id}`, ...fields],
    ["ZADD", `${FB_NS}:all`, item.createdAt, item.id],
    ["ZADD", `${FB_NS}:author:${item.author}`, item.createdAt, item.id],
  ]);
  return item;
}

/** One reviewer's comments, oldest first — on one page, or every page when page is omitted. */
export async function listForAuthor(author: string, page?: string) {
  const keep = (i: FeedbackItem) => !page || i.page === page;
  if (!storeConfigured) {
    return [...memory.values()].filter((i) => i.author === author && keep(i)).sort((a, b) => a.createdAt - b.createdAt);
  }
  const [{ result: ids }] = await pipeline([["ZRANGE", `${FB_NS}:author:${author}`, 0, READ_LIMIT - 1]]);
  return (await readItems(ids ?? [])).filter(keep);
}

/** Every comment, newest first — for the inbox. */
export async function listAll() {
  if (!storeConfigured) return [...memory.values()].sort((a, b) => b.createdAt - a.createdAt);
  const [{ result: ids }] = await pipeline([["ZRANGE", `${FB_NS}:all`, 0, READ_LIMIT - 1, "REV"]]);
  return readItems(ids ?? []);
}

export async function setStatus(id: string, status: FeedbackStatus) {
  if (!storeConfigured) {
    const item = memory.get(id);
    if (item) item.status = status;
    return;
  }
  // Only touch comments that exist, so a stray id never creates a half-empty hash
  const [{ result: exists }] = await pipeline([["EXISTS", `${FB_NS}:item:${id}`]]);
  if (exists) await pipeline([["HSET", `${FB_NS}:item:${id}`, "status", status]]);
}

/**
 * A reviewer deleting their own note: only when the author matches. Removes it from
 * the inbox lists too, and returns the image pathname (if any) so it can be removed.
 */
export async function deleteFeedback(id: string, author: string): Promise<{ deleted: boolean; image: string }> {
  if (!storeConfigured) {
    const item = memory.get(id);
    if (!item || item.author !== author) return { deleted: false, image: "" };
    memory.delete(id);
    return { deleted: true, image: item.image };
  }
  const key = `${FB_NS}:item:${id}`;
  const [{ result: owner }, { result: image }] = await pipeline([
    ["HGET", key, "author"],
    ["HGET", key, "image"],
  ]);
  if (owner === null || owner !== author) return { deleted: false, image: "" };
  await pipeline([
    ["DEL", key],
    ["ZREM", `${FB_NS}:all`, id],
    ["ZREM", `${FB_NS}:author:${author}`, id],
  ]);
  return { deleted: true, image: image ?? "" };
}
