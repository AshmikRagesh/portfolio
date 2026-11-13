import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Cta from "@/components/Cta";
import { featuredWorks, artemisInsurance, artemisReservations } from "@/content/works";
import { listAll } from "@/lib/feedback/store";
import type { FeedbackItem, FeedbackStatus } from "@/lib/feedback/shared";
import { hasAccess, lock, mark, unlock } from "./actions";

// ── /feedback ─────────────────────────────────────────────────────────────────
// Private inbox for comments left in case study feedback mode. 404s unless
// STATS_KEY is set and asks for that key first. Grouped by case study, newest
// first; each comment links back to its block and can be marked done.

export const metadata: Metadata = { title: "Feedback inbox", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TITLES = new Map(
  [...featuredWorks, artemisInsurance, artemisReservations]
    .filter((w) => w.href.startsWith("/works/"))
    .map((w) => [w.href, w.title]),
);
const titleFor = (page: string) => TITLES.get(page) ?? page.replace("/works/", "");

const FILTERS: { key: string; label: string; keep: (s: FeedbackStatus) => boolean }[] = [
  { key: "open", label: "Open", keep: (s) => s === "open" },
  { key: "done", label: "Done", keep: (s) => s !== "open" },
  { key: "all", label: "All", keep: () => true },
];

const STATUS_LABEL: Record<FeedbackStatus, string> = { open: "Open", done: "Done", wontdo: "Won't do" };

function when(ms: number) {
  return new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
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

function StatusButton({ id, status, children }: { id: string; status: FeedbackStatus; children: React.ReactNode }) {
  return (
    <form action={mark}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className="rounded-full border border-line px-3 py-1 font-brand text-caption text-secondary hover:border-grape hover:text-grape"
      >
        {children}
      </button>
    </form>
  );
}

function Comment({ item }: { item: FeedbackItem }) {
  return (
    <li className="flex flex-col gap-3 border-t border-line-soft py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2 font-brand text-caption uppercase text-muted">
        <span>{item.sectionLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{item.label}</span>
        <span aria-hidden="true">·</span>
        <span>{when(item.createdAt)}</span>
        {item.status !== "open" && (
          <span className="rounded-full bg-success-bg px-2 text-success">{STATUS_LABEL[item.status]}</span>
        )}
      </div>
      {item.snippet && (
        <p className="line-clamp-2 border-l-2 border-line pl-3 text-caption text-muted">“{item.snippet}”</p>
      )}
      <p className="whitespace-pre-wrap text-body text-text-base md:text-body-md">{item.text}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-auto text-caption text-secondary">{item.name || "Anonymous"}</span>
        <Link
          href={`${item.page}?fb=${encodeURIComponent(item.anchor)}`}
          target="_blank"
          className="rounded-full border border-line px-3 py-1 font-brand text-caption text-secondary hover:border-grape hover:text-grape"
        >
          Show on page ↗
        </Link>
        {item.status === "open" ? (
          <>
            <StatusButton id={item.id} status="done">Mark done</StatusButton>
            <StatusButton id={item.id} status="wontdo">Won&apos;t do</StatusButton>
          </>
        ) : (
          <StatusButton id={item.id} status="open">Reopen</StatusButton>
        )}
      </div>
    </li>
  );
}

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ wrong?: string; show?: string }> }) {
  if (!process.env.STATS_KEY) notFound();
  const params = await searchParams;
  if (!(await hasAccess())) return <KeyForm wrong={params.wrong} />;

  const filter = FILTERS.find((f) => f.key === params.show) ?? FILTERS[0];
  const all = await listAll();
  const shown = all.filter((i) => filter.keep(i.status));
  const byPage = new Map<string, FeedbackItem[]>();
  for (const item of shown) byPage.set(item.page, [...(byPage.get(item.page) ?? []), item]);
  const open = all.filter((i) => i.status === "open").length;

  return (
    <main className="page-container pt-[48px] pb-[96px] md:pt-[64px]">
      <div className="mx-auto flex max-w-[800px] flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading font-medium text-h2 text-heading md:text-h2-md lg:text-h2-lg">Feedback inbox</h1>
            <p className="text-caption text-muted">
              {open} open of {all.length}. Comments left in feedback mode on the case studies.
            </p>
          </div>
          <form action={lock}>
            <button type="submit" className="font-brand text-caption text-muted underline underline-offset-4 hover:text-grape">
              Lock
            </button>
          </form>
        </header>

        <nav className="flex gap-2" aria-label="Filter">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "open" ? "/feedback" : `/feedback?show=${f.key}`}
              aria-current={f.key === filter.key ? "page" : undefined}
              className="rounded-full border border-line px-4 py-2 font-brand text-caption text-secondary aria-[current=page]:border-midnight aria-[current=page]:bg-midnight aria-[current=page]:text-white"
            >
              {f.label}
            </Link>
          ))}
        </nav>

        {byPage.size === 0 && <p className="text-body text-muted">Nothing here. New comments show up as soon as they&apos;re sent.</p>}

        {[...byPage].map(([page, items]) => (
          <section key={page} className="flex flex-col gap-4 rounded-lg border border-line-soft p-4 md:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-heading font-medium text-h4 text-heading md:text-h4-md">{titleFor(page)}</h2>
              <span className="font-brand text-caption text-muted">{items.length}</span>
            </div>
            <ul className="flex flex-col">
              {items.map((item) => (
                <Comment key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
