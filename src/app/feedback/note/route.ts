// ── GET /feedback/note?id=<id> ────────────────────────────────────────────────
// One comment, for "Show on page" on the board: the case study fetches it to pin the
// comment on its block and show it in a card. Reviewers only ever see their own notes,
// so this answers only a browser that has unlocked /feedback (its cookie is scoped to
// /feedback, which is why this lives here and not under /api).

import { getFeedback } from "@/lib/feedback/store";
import { hasAccess } from "../actions";

export const dynamic = "force-dynamic";

const ID_RE = /^[0-9a-f-]{36}$/;

export async function GET(req: Request) {
  if (!(await hasAccess())) return new Response(null, { status: 404 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!ID_RE.test(id)) return new Response(null, { status: 404 });
  try {
    const item = await getFeedback(id);
    if (!item) return new Response(null, { status: 404 });
    return Response.json(
      {
        id: item.id,
        page: item.page,
        section: item.section,
        sectionLabel: item.sectionLabel,
        anchor: item.anchor,
        label: item.label,
        snippet: item.snippet,
        text: item.text,
        name: item.name,
        category: item.category,
        status: item.status,
        createdAt: item.createdAt,
        image: item.image ? `/feedback/image?p=${encodeURIComponent(item.image)}` : "",
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[feedback] note read failed", err);
    return new Response(null, { status: 404 });
  }
}
