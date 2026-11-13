import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Cta from "@/components/Cta";
import { listAll } from "@/lib/feedback/store";
import { isOwner } from "@/lib/owner";
import { hasAccess, lock, unlock } from "./actions";
import Board, { type BoardCard } from "./Board";

// ── /feedback ─────────────────────────────────────────────────────────────────
// Private inbox for comments left in case study feedback mode, as a full-screen
// board in the style of Linear and Jira: To do → In progress → Done (or Won't do).
// 404s unless STATS_KEY is set, and asks for that key first (a browser marked as
// Ashmik's on /stats gets straight in). All filtering happens on the board itself.

export const metadata: Metadata = { title: "Feedback board", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Short case study names for the board's labels */
const SHORT: Record<string, string> = {
  "/works/helix": "Helix",
  "/works/tcs-search": "TCS Search",
  "/works/tcs-find-a-trip": "TCS Find a Trip",
  "/works/bella": "Bella",
  "/works/artemis-reservations": "Artemis Reservations",
  "/works/artemis-insurance": "Artemis Insurance",
  "/works/artemis-design-system": "Artemis Design System",
};
const shortName = (page: string) =>
  SHORT[page] ?? page.replace("/works/", "").replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

function KeyForm({ wrong }: { wrong: string | undefined }) {
  return (
    <main className="page-container pt-[96px] pb-[96px]">
      <form action={unlock} className="mx-auto flex max-w-[360px] flex-col gap-4">
        <h1 className="font-heading font-medium text-h3 text-heading md:text-h3-md">Feedback board</h1>
        <label className="flex flex-col gap-2 text-body text-secondary">
          Key
          <input
            name="key"
            type="password"
            autoComplete="current-password"
            required
            className="h-[44px] rounded-md border border-line px-3 font-brand text-body text-text-base outline-none focus:border-grape"
          />
        </label>
        {wrong === "1" && <p className="text-caption text-warning">That key didn&apos;t match.</p>}
        {wrong === "wait" && <p className="text-caption text-warning">Too many wrong tries. Try again in 15 minutes.</p>}
        <Cta type="submit">Open board</Cta>
      </form>
    </main>
  );
}

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ wrong?: string }> }) {
  if (!process.env.STATS_KEY) notFound();
  const params = await searchParams;
  if (!(await hasAccess())) return <KeyForm wrong={params.wrong} />;

  const owner = await isOwner();
  const everything = await listAll();
  // Keys like Linear and Jira: FB-1, FB-2… in the order comments arrived
  const keys = new Map([...everything].sort((a, b) => a.createdAt - b.createdAt).map((i, n) => [i.id, `FB-${n + 1}`]));

  const cards: BoardCard[] = everything.map((i) => ({
    id: i.id,
    key: keys.get(i.id) ?? "FB",
    status: i.status,
    test: i.test,
    caseStudy: shortName(i.page),
    where: i.anchor.startsWith("page|") ? "Whole case study" : `${i.sectionLabel} · ${i.label}`,
    snippet: i.snippet,
    text: i.text,
    name: i.name,
    category: i.category,
    image: i.image ? `/feedback/image?p=${encodeURIComponent(i.image)}` : "",
    link: `${i.page}?fb=${encodeURIComponent(i.anchor)}`,
    createdAt: i.createdAt,
  }));

  return <Board cards={cards} lockAction={owner ? null : lock} />;
}
