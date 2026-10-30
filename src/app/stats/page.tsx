import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readStats, STATS_DAYS, type Tally } from "@/lib/curiosity/stats";
import { hasAccess, lock, unlock } from "./actions";

// ── /stats ────────────────────────────────────────────────────────────────────
// Private numbers behind the front-desk bell. 404s unless STATS_KEY is set, and
// asks for that key before showing anything. All reads happen on the server.

export const metadata: Metadata = { title: "Curiosity stats", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function duration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-soft p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading font-medium text-h4 text-heading md:text-h4-md">{title}</h2>
        {note && <p className="text-caption text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="text-body text-muted">Nothing recorded yet.</p>;
}

/** Horizontal bars, one row per tally, value printed beside each bar. */
function BarList({ rows, limit = 8 }: { rows: Tally[]; limit?: number }) {
  const shown = rows.slice(0, limit);
  const max = Math.max(1, ...shown.map((r) => r.count));
  if (!shown.some((r) => r.count)) return <Empty />;
  return (
    <ul className="flex flex-col gap-2">
      {shown.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_40px] items-center gap-3" title={`${r.label}: ${r.count}`}>
          <span className="truncate text-body text-secondary">{r.label}</span>
          <span className="h-2 rounded-r-sm bg-grape" style={{ width: `${(r.count / max) * 100}%`, minWidth: r.count ? 2 : 0 }} />
          <span className="text-right font-brand text-caption text-text-base">{r.count}</span>
        </li>
      ))}
    </ul>
  );
}

/** Visits per day as columns on a shared baseline, with a hover label per day. */
function DayColumns({ days }: { days: Tally[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  if (!days.some((d) => d.count)) return <Empty />;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-[160px] items-end gap-[2px] border-b border-line">
        {days.map((d) => (
          <div key={d.label} className="group relative flex h-full flex-1 items-end" title={`${shortDate(d.label)}: ${d.count}`}>
            {d.count > 0 && (
              <div className="w-full rounded-t-sm bg-grape group-hover:bg-primary" style={{ height: `${(d.count / max) * 100}%` }} />
            )}
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-midnight px-2 py-1 font-brand text-caption text-white group-hover:block">
              {shortDate(d.label)}: {d.count}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between font-brand text-caption text-muted">
        <span>{shortDate(days[0].label)}</span>
        <span>{shortDate(days[days.length - 1].label)}</span>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface p-4">
      <span className="text-caption text-muted">{label}</span>
      <span className="font-heading text-h3 text-heading md:text-h3-md">{value}</span>
    </div>
  );
}

function KeyForm({ wrong }: { wrong: boolean }) {
  return (
    <main className="page-container pt-[96px] pb-[96px]">
      <form action={unlock} className="mx-auto flex max-w-[360px] flex-col gap-4">
        <h1 className="font-heading font-medium text-h3 text-heading md:text-h3-md">Curiosity stats</h1>
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
        {wrong && <p className="text-caption text-warning">That key didn&apos;t match.</p>}
        <button type="submit" className="h-[44px] rounded-md bg-primary font-brand text-body text-white hover:bg-grape">
          Open stats
        </button>
      </form>
    </main>
  );
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ wrong?: string }> }) {
  if (!process.env.STATS_KEY) notFound();
  if (!(await hasAccess())) return <KeyForm wrong={(await searchParams).wrong === "1"} />;

  const s = await readStats();
  const updated = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  return (
    <main className="page-container pt-[48px] pb-[96px] md:pt-[64px]">
      <div className="flex flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading font-medium text-h2 text-heading md:text-h2-md lg:text-h2-lg">Curiosity stats</h1>
            <p className="text-caption text-muted">
              {s.configured ? `Updated ${updated} UTC. Days are counted in UTC.` : "Upstash is not configured, so there is nothing to show."}
            </p>
          </div>
          <form action={lock}>
            <button type="submit" className="font-brand text-caption text-muted underline underline-offset-4 hover:text-grape">
              Lock
            </button>
          </form>
        </header>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4">
          <Tile label="Visits" value={String(s.visits)} />
          <Tile label="Visitors" value={String(s.visitors)} />
          <Tile label="Average active time" value={duration(s.averageSeconds)} />
          <Tile label="Median active time" value={duration(s.medianSeconds)} />
          <Tile label="Record" value={s.recordSeconds === null ? "None yet" : duration(s.recordSeconds)} />
        </div>

        <Section title="Visits per day" note={`Last ${STATS_DAYS} days`}>
          <DayColumns days={s.days} />
        </Section>

        <div className="grid gap-4 md:grid-cols-2">
          <Section title="Visit length" note="Active time per visit">
            <BarList rows={s.distribution} limit={s.distribution.length} />
          </Section>
          <Section title="Devices" note="By screen width">
            <BarList rows={s.devices} />
          </Section>
          <Section title="Top referrers" note="Domain only. Direct means no referrer.">
            <BarList rows={s.referrers} />
          </Section>
          <Section title="Exit pages" note={`Last page seen, across the ${s.exitSample} newest visits`}>
            <BarList rows={s.exits} />
          </Section>
        </div>
      </div>
    </main>
  );
}
