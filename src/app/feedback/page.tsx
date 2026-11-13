import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Cta from "@/components/Cta";
import { featuredWorks, artemisInsurance, artemisReservations } from "@/content/works";
import { listAll } from "@/lib/feedback/store";
import { CATEGORIES, isCategory } from "@/lib/feedback/shared";
import { isOwner } from "@/lib/owner";
import { hasAccess, lock, unlock } from "./actions";
import Board, { type BoardCard } from "./Board";

// ── /feedback ─────────────────────────────────────────────────────────────────
// Private inbox for comments left in case study feedback mode, as a board:
// To do → In progress → Done (or Won't do). Drag a card to move it. 404s unless
// STATS_KEY is set, and asks for that key first (a browser marked as Ashmik's on
// /stats gets straight in). Ashmik's own test comments show only with "My tests".

export const metadata: Metadata = { title: "Feedback inbox", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TITLES = new Map(
  [...featuredWorks, artemisInsurance, artemisReservations]
    .filter((w) => w.href.startsWith("/works/"))
    .map((w) => [w.href, w.title]),
);

const pill =
  "rounded-full border border-line px-4 py-2 text-caption text-secondary hover:border-grape hover:text-grape aria-[current=page]:border-midnight aria-[current=page]:bg-midnight aria-[current=page]:text-white";

function href(cat: string, tests: boolean) {
  const q = new URLSearchParams();
  if (cat) q.set("cat", cat);
  if (tests) q.set("tests", "1");
  const str = q.toString();
  return str ? `/feedback?${str}` : "/feedback";
}

function KeyForm({ wrong }: { wrong: string | undefined }) {
  return (
    <main className="page-container pt-[96px] pb-[96px]">
      <form action={unlock} className="mx-auto flex max-w-[360px] flex-col gap-4">
        <h1 className="font-heading font-medium text-h3 text-heading md:text-h3-md">Feedback inbox</h1>
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
        <Cta type="submit">Open inbox</Cta>
      </form>
    </main>
  );
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ wrong?: string; cat?: string; tests?: string }>;
}) {
  if (!process.env.STATS_KEY) notFound();
  const params = await searchParams;
  if (!(await hasAccess())) return <KeyForm wrong={params.wrong} />;

  const cat = isCategory(params.cat) ? params.cat : "";
  const tests = params.tests === "1";
  const owner = await isOwner();
  const everything = await listAll();
  const real = everything.filter((i) => !i.test);
  const testCount = everything.length - real.length;

  const cards: BoardCard[] = everything
    .filter((i) => i.test === tests && (!cat || i.category === cat))
    .map((i) => ({
      id: i.id,
      status: i.status,
      caseStudy: i.pageTitle || TITLES.get(i.page) || i.page.replace("/works/", ""),
      where: i.anchor.startsWith("page|") ? "Whole case study" : `${i.sectionLabel} · ${i.label}`,
      snippet: i.snippet,
      text: i.text,
      name: i.name || "Anonymous",
      category: i.category ? CATEGORIES[i.category] : "",
      image: i.image ? `/feedback/image?p=${encodeURIComponent(i.image)}` : "",
      link: `${i.page}?fb=${encodeURIComponent(i.anchor)}`,
      createdAt: i.createdAt,
    }));

  const open = real.filter((i) => i.status === "open" || i.status === "doing").length;

  return (
    <main className="page-container pt-[48px] pb-[96px] md:pt-[64px]">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading font-medium text-h2 text-heading md:text-h2-md lg:text-h2-lg">Feedback inbox</h1>
            <p className="text-caption text-muted">
              {open} to do or in progress, {real.length} in all. Drag a card to move it, or use its Move menu.
            </p>
          </div>
          {!owner && (
            <form action={lock}>
              <button type="submit" className="text-caption text-muted underline underline-offset-4 hover:text-grape">
                Lock
              </button>
            </form>
          )}
        </header>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Filter">
          <Link href={href("", tests)} aria-current={!cat ? "page" : undefined} className={pill}>
            Any category
          </Link>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <Link key={key} href={href(key, tests)} aria-current={cat === key ? "page" : undefined} className={pill}>
              {label}
            </Link>
          ))}
          <span className="mx-2 h-[20px] w-px bg-line" aria-hidden="true" />
          <Link href={href(cat, !tests)} aria-current={tests ? "page" : undefined} className={pill}>
            {tests ? "Showing my tests" : `My tests (${testCount})`}
          </Link>
        </nav>

        <Board cards={cards} />
      </div>
    </main>
  );
}
