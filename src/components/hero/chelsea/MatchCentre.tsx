"use client";

// ── Chelsea match centre (the back of the pin) ────────────────────────────────
// Two views in one card, after matchday apps (Apple Sports, FotMob, the Premier League
// app):
//   Overview      one dark match tile (crests, kick-off or the live score, a countdown),
//                 then Chelsea's form and the next fixtures.
//   Match centre  tap the tile or any fixture: a compact scoreboard, then tabs. Before
//                 kick-off: Preview (form, head-to-head), Lineups, Table, News. Live or
//                 finished: Timeline, Lineups, Stats, News.
// Flat surfaces only: no glows, blurs or coloured shadows inside the card.
//
// Live: ESPN's live feed (through /api/fixture, cached ~10s) is polled every 15 seconds
// while a match is on, and every minute once kick-off is near, so the card flips to live on
// its own. Times are in the visitor's time zone.

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Article, FormGame, KeyEvent, Lineup, Match, MatchDetail, Player, Side, Stat, TableRow } from "@/lib/chelsea";

const TEAM = "363";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TILE_BG = "linear-gradient(160deg, #3a0944 0%, #32073e 50%, #24062d 100%)";
const LIVE_MS = 15_000;
const NEAR_MS = 60_000;

// Results read the way every sports app reads them: won green, drew grey, lost red.
// Each passes 4.5:1 with white bold caption text.
const RESULT = {
  W: "bg-[#15803d] text-white",
  D: "bg-[#6f6d6b] text-white",
  L: "bg-[#c4231a] text-white",
};
const RESULT_WORD = { W: "Won", D: "Drew", L: "Lost" };

// ── Data ──────────────────────────────────────────────────────────────────────
// In development, ?match=<ESPN event id> on the page shows that match as live.
const demoId = () => (typeof window !== "undefined" && process.env.NODE_ENV !== "production" ? new URLSearchParams(window.location.search).get("match") : null);

/** Fetches `url`, then again after `every(data)` ms (null = stop). */
function usePoll<T>(url: string | null, every: (d: T) => number | null) {
  const [state, setState] = useState<{ data: T | null | "error"; at: number }>({ data: null, at: 0 });
  useEffect(() => {
    if (!url) return;
    let stop = false;
    let timer = 0;
    const load = () =>
      fetch(url, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: T) => {
          if (stop) return;
          setState({ data: d, at: Date.now() });
          const ms = every(d);
          if (ms) timer = window.setTimeout(load, ms);
        })
        .catch(() => {
          if (stop) return;
          setState((p) => (p.data && p.data !== "error" ? p : { data: "error", at: Date.now() }));
          timer = window.setTimeout(load, NEAR_MS);
        });
    load();
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return state;
}

const pollFor = (m?: Match) => {
  if (!m || m.state === "post") return null;
  if (m.state === "in") return LIVE_MS;
  return Date.parse(m.date) - Date.now() < 15 * 6e4 ? NEAR_MS : null;
};

function useNow(on: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [on]);
  return now;
}

// ── Formatting ────────────────────────────────────────────────────────────────
const comp = (s: string) => s.replace(/^English /, "").replace(/^\d{4}-\d{2} /, "");
const day = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
const fullDate = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
function clock(d: Date) {
  // 12-hour locales get "7:30" + "PM"; 24-hour ones "01:00", never a bare "1:00"
  const h12 = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hour12;
  const parts = new Intl.DateTimeFormat(undefined, { hour: h12 ? "numeric" : "2-digit", minute: "2-digit" }).formatToParts(d);
  const period = parts.find((p) => p.type === "dayPeriod")?.value;
  const time = parts
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("")
    .trim();
  return { time, period };
}
const zone = (d: Date) => d.toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop();
function when(d: Date, now: number) {
  const a = new Date(now);
  const days = Math.round((new Date(d).setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0)) / 864e5);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}
function ago(iso: string | number, now: number) {
  const s = Math.max(0, Math.round((now - (typeof iso === "number" ? iso : Date.parse(iso))) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return fullDate(new Date(iso));
}
const lastName = (n: string) => n.split(" ").slice(-1)[0];
const espnUrl = (id: string) => `https://www.espn.com/soccer/match/_/gameId/${id}`;

// ── Small parts ───────────────────────────────────────────────────────────────
function Crest({ src, size, className = "" }: { src: string; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} className={`shrink-0 object-contain ${className}`} style={{ width: size, height: size }} />;
}

// A steady dot that breathes in opacity: no halo
function LiveDot() {
  return <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-[#e5484d]" aria-hidden="true" />;
}

function Status({ m, now, tone = "dark" }: { m: Match; now: number; tone?: "dark" | "light" }) {
  const quiet = tone === "dark" ? "bg-white/10 text-white" : "bg-surface text-heading ring-1 ring-inset ring-line-soft";
  const pill = "inline-flex h-[24px] items-center gap-[6px] rounded-full px-[10px] font-geist text-caption font-semibold tabular-nums";
  if (m.state === "in")
    return (
      <span className={`${pill} ${tone === "dark" ? "bg-white text-[#c4231a]" : "bg-[#fdecec] text-[#c4231a]"}`}>
        <LiveDot />
        {m.clock === "HT" ? "Half time" : `Live · ${m.clock}`}
      </span>
    );
  if (m.state === "post") return <span className={`${pill} ${quiet}`}>Full time</span>;
  return <span className={`${pill} font-medium ${quiet}`}>{when(new Date(m.date), now)}</span>;
}

function SectionHead({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="mb-[12px] flex items-baseline justify-between gap-[12px]">
      <h3 className="font-geist text-caption font-semibold uppercase tracking-[0.6px] text-heading">{title}</h3>
      {aside && <span className="font-geist text-caption text-muted">{aside}</span>}
    </div>
  );
}

function Chevron({ dir = "right" }: { dir?: "right" | "left" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={dir === "left" ? "rotate-180" : ""}>
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResultChip({ r, size = 24 }: { r: FormGame["result"]; size?: number }) {
  return (
    <span className={`flex items-center justify-center rounded-[6px] font-geist text-caption font-bold ${RESULT[r] ?? RESULT.D}`} style={{ width: size, height: size }} title={RESULT_WORD[r]}>
      {r}
    </span>
  );
}

// Slides a view in from the side it was opened from
function Slide({ dir, children, className = "" }: { dir: 1 | -1 | 0; children: ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!dir || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.current?.animate(
      [
        { opacity: 0, transform: `translateX(${dir * 24}px)` },
        { opacity: 1, transform: "none" },
      ],
      { duration: 320, easing: EASE },
    );
  }, [dir]);
  return (
    <div ref={el} className={className}>
      {children}
    </div>
  );
}

// ── The card ──────────────────────────────────────────────────────────────────
type Fixtures = { next: Match[]; form: FormGame[] };
type View = { id: string | null; dir: 1 | -1 | 0 };

const SHELL =
  "flex h-[min(680px,calc(100dvh-136px))] md:h-[min(680px,calc(100dvh-96px))] w-[calc(100vw-24px)] max-w-[440px] flex-col overflow-hidden rounded-[24px] bg-background shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_24px_56px_rgba(30,5,37,0.16)]";

export default function MatchCentreCard() {
  const demo = demoId();
  const { data: fixtures, at } = usePoll<Fixtures>(`/api/fixture${demo ? `?demo=${demo}` : ""}`, (d) => (demo ? null : pollFor(d.next[0])));
  const [view, setView] = useState<View>({ id: null, dir: 0 });
  const data = fixtures && fixtures !== "error" && fixtures.next.length ? fixtures : fixtures === null ? null : "error";
  const now = useNow(true);

  if (data === null)
    return (
      <div className={`${SHELL} items-center justify-center`}>
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-grape" aria-label="Loading fixtures" />
      </div>
    );
  if (data === "error")
    return (
      <div className={`${SHELL} justify-center p-[32px]`}>
        <p className="font-heading text-h2 text-heading">No fixtures right now</p>
        <p className="mt-[8px] font-geist text-body text-secondary">The fixture list isn’t loading. Try again in a bit.</p>
      </div>
    );

  const open = view.id ? data.next.find((m) => m.id === view.id) : undefined;
  return (
    <div className={SHELL}>
      {open ? (
        <Slide key={open.id} dir={view.dir} className="flex min-h-0 flex-1 flex-col">
          <MatchView base={open} demo={demo === open.id} now={now} onBack={() => setView({ id: null, dir: -1 })} />
        </Slide>
      ) : (
        <Slide key="overview" dir={view.dir} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <Overview data={data} now={now} updated={at} onOpen={(id) => setView({ id, dir: 1 })} />
        </Slide>
      )}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ data, now, updated, onOpen }: { data: Fixtures; now: number; updated: number; onOpen: (id: string) => void }) {
  const [m, ...later] = data.next;
  return (
    <div className="flex flex-col gap-[28px] p-[8px] pb-[20px]">
      <MatchTile m={m} now={now} onOpen={() => onOpen(m.id)} />

      {data.form.length > 0 && (
        <section className="px-[12px]">
          <SectionHead title="Form" aside="Last 5 · newest on the right" />
          <Form games={data.form} />
        </section>
      )}

      {later.length > 0 && (
        <section className="px-[12px]">
          <SectionHead title="Coming up" />
          <ul className="flex flex-col overflow-hidden rounded-[16px] ring-1 ring-line-soft">
            {later.map((x) => {
              const d = new Date(x.date);
              const atHome = x.home.isChelsea;
              const opp = atHome ? x.away : x.home;
              const c = clock(d);
              return (
                <li key={x.id} className="border-t border-line-soft first:border-t-0">
                  <button type="button" onClick={() => onOpen(x.id)} className="group flex w-full items-center gap-[12px] px-[14px] py-[12px] text-left transition-colors hover:bg-surface">
                    <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-surface">
                      <Crest src={opp.logo} size={24} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-geist text-body font-medium text-heading">
                        {atHome ? "vs" : "at"} {opp.name}
                      </span>
                      <span className="block truncate font-geist text-caption text-muted">{comp(x.competition)}</span>
                    </span>
                    <span className="text-right font-geist tabular-nums">
                      <span className="block text-caption font-medium text-heading">{day(d)}</span>
                      <span className="block text-caption text-muted">
                        {c.time} {c.period}
                      </span>
                    </span>
                    <span className="text-muted transition-transform group-hover:translate-x-[2px]">
                      <Chevron />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Source live={m.state === "in"} updated={updated} now={now} href={espnUrl(m.id)} note={`Times in ${zone(new Date(m.date))}`} />
    </div>
  );
}

// Where the data comes from, how fresh it is, and the way out to the full page
function Source({ live, updated, now, href, note, className = "px-[12px]" }: { live: boolean; updated: number; now: number; href: string; note?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-[12px] font-geist text-caption text-muted ${className}`}>
      <span className="flex min-w-0 items-center gap-[6px] truncate">
        {live && <LiveDot />}
        {live ? `Live from ESPN · updated ${ago(updated, now)}` : `${note ? `${note} · ` : ""}Data from ESPN`}
      </span>
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-[2px] font-medium text-heading underline-offset-[3px] hover:underline">
        Open on ESPN
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M4 2.5h5.5V8M9.5 2.5 3 9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}

function TileSide({ s }: { s: Side }) {
  return (
    <div className="flex w-[104px] flex-col items-center gap-[10px] text-center">
      <span className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-white">
        <Crest src={s.logo} size={40} />
      </span>
      <span className="font-geist text-body font-medium leading-[18px] text-white">{s.name}</span>
    </div>
  );
}

function MatchTile({ m, now, onOpen }: { m: Match; now: number; onOpen: () => void }) {
  const at = new Date(m.date);
  const c = clock(at);
  const started = m.state !== "pre";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open match centre: ${m.home.name} v ${m.away.name}`}
      className="group block w-full overflow-hidden rounded-[18px] text-left text-white transition-transform duration-300 active:scale-[0.99]"
      style={{ background: TILE_BG }}
    >
      <div className="flex items-center justify-between gap-[12px] px-[20px] pt-[18px]">
        <span className="truncate font-geist text-caption font-medium text-white/70">{comp(m.competition)}</span>
        <Status m={m} now={now} />
      </div>

      <div className="flex items-start justify-between px-[12px] pt-[24px]">
        <TileSide s={m.home} />
        <div className="flex min-w-0 flex-1 flex-col items-center pt-[10px]">
          {started ? (
            <>
              <span className="font-heading text-stat tabular-nums text-white">
                {m.home.score ?? 0}
                <span className="mx-[8px] text-white/40">–</span>
                {m.away.score ?? 0}
              </span>
              <span className="mt-[8px] font-geist text-caption text-white/60">{m.state === "in" ? "Score updates live" : day(at)}</span>
            </>
          ) : (
            <>
              <span className="flex items-baseline gap-[4px]">
                <span className="font-heading text-h1-md tabular-nums text-white">{c.time}</span>
                {c.period && <span className="font-geist text-caption font-semibold uppercase text-white/60">{c.period}</span>}
              </span>
              <span className="mt-[6px] font-geist text-caption text-white/70">{day(at)}</span>
            </>
          )}
        </div>
        <TileSide s={m.away} />
      </div>

      {m.state === "pre" && (
        <div className="px-[16px] pt-[20px]">
          <Countdown to={at.getTime()} now={now} />
        </div>
      )}

      <div className="mt-[20px] flex items-center justify-between gap-[12px] border-t border-white/10 px-[20px] py-[14px]">
        <span className="flex min-w-0 items-center gap-[6px] font-geist text-caption text-white/60">
          <PinIcon />
          <span className="truncate">{m.venue}</span>
          <span className="text-white/30">·</span>
          <span>{m.home.isChelsea ? "Home" : "Away"}</span>
        </span>
        <span className="flex shrink-0 items-center gap-[2px] font-geist text-caption font-semibold text-white transition-transform group-hover:translate-x-[2px]">
          {m.state === "pre" ? "Match preview" : "Match centre"}
          <Chevron />
        </span>
      </div>
    </button>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      <path d="M6 11s4-3.6 4-6.4A4 4 0 0 0 2 4.6C2 7.4 6 11 6 11Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="4.8" r="1.4" fill="currentColor" />
    </svg>
  );
}

function Countdown({ to, now }: { to: number; now: number }) {
  const left = Math.max(0, to - now);
  const parts = [
    [Math.floor(left / 864e5), "days"],
    [Math.floor(left / 36e5) % 24, "hrs"],
    [Math.floor(left / 6e4) % 60, "min"],
    [Math.floor(left / 1e3) % 60, "sec"],
  ] as const;
  if (left === 0) return <p className="rounded-[12px] bg-white/10 py-[12px] text-center font-geist text-body font-medium">Kicking off now</p>;
  return (
    <div className="grid grid-cols-4 gap-[6px]" role="timer" aria-label="Time to kick-off">
      {parts.map(([v, l]) => (
        <div key={l} className="flex items-baseline justify-center gap-[4px] rounded-[12px] bg-white/[0.08] py-[10px]">
          <span className="font-heading text-h2 tabular-nums text-white">{String(v).padStart(2, "0")}</span>
          <span className="font-geist text-[10px] leading-[12px] text-white/60">{l}</span>
        </div>
      ))}
    </div>
  );
}

function Form({ games }: { games: FormGame[] }) {
  const sorted = [...games].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  return (
    <ol className="grid grid-cols-5 gap-[8px]">
      {sorted.map((g, i) => (
        <li key={g.date + i} className="flex flex-col items-center gap-[8px] rounded-[14px] py-[12px] ring-1 ring-line-soft" title={`${RESULT_WORD[g.result]} ${g.score} ${g.home ? "vs" : "at"} ${g.opponent}`}>
          <Crest src={g.logo} size={20} />
          <ResultChip r={g.result} />
          <span className="font-geist text-caption tabular-nums text-secondary">{g.score}</span>
        </li>
      ))}
    </ol>
  );
}

// ── Match centre ──────────────────────────────────────────────────────────────
type Tab = "preview" | "timeline" | "lineups" | "stats" | "table" | "news";

function MatchView({ base, demo, now, onBack }: { base: Match; demo: boolean; now: number; onBack: () => void }) {
  const { data: d, at } = usePoll<MatchDetail>(`/api/fixture/match?id=${base.id}${demo ? "&demo=1" : ""}`, (x) => (demo ? null : pollFor(x.match)));
  const detail = d && d !== "error" ? d : null;
  const m = detail?.match ?? base;
  const pre = m.state === "pre";
  const tabs: [Tab, string][] = pre
    ? [
        ["preview", "Preview"],
        ["lineups", "Lineups"],
        ["table", "Table"],
        ["news", "News"],
      ]
    : [
        ["timeline", "Timeline"],
        ["lineups", "Lineups"],
        ["stats", "Stats"],
        ["news", "News"],
      ];
  const [tab, setTab] = useState<Tab>(tabs[0][0]);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [tab]);

  return (
    <>
      <header className="shrink-0 border-b border-line-soft px-[16px] pb-[12px] pt-[12px]">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onBack} className="-ml-[6px] flex h-[36px] items-center gap-[2px] rounded-full pl-[6px] pr-[12px] font-geist text-body font-medium text-secondary transition-colors hover:bg-surface hover:text-heading">
            <Chevron dir="left" />
            Back
          </button>
          <Status m={m} now={now} tone="light" />
        </div>
        <Scoreboard m={m} />
        <div role="tablist" aria-label="Match centre" className="mt-[16px] grid grid-cols-4 gap-[2px] rounded-full bg-surface p-[4px]">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              data-sound-click="toggle"
              onClick={() => setTab(k)}
              className={`h-[32px] rounded-full font-geist text-caption font-medium transition-[background-color,color,box-shadow] duration-200 ${
                tab === k ? "bg-background text-heading shadow-[0_0_0_1px_rgba(30,5,37,0.08)]" : "text-muted hover:text-heading"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div ref={body} role="tabpanel" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[16px] pb-[20px] pt-[20px]">
        {d === null ? (
          <div className="flex h-full items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-grape" aria-label="Loading match" />
          </div>
        ) : !detail ? (
          <Empty title="Match centre isn’t loading" body="ESPN didn’t answer. Try again in a bit." />
        ) : (
          <>
            {tab === "preview" && <Preview d={detail} />}
            {tab === "timeline" && <Timeline d={detail} />}
            {tab === "lineups" && <Lineups d={detail} />}
            {tab === "stats" && <Stats d={detail} />}
            {tab === "table" && <Table d={detail} />}
            {tab === "news" && <News items={detail.news} now={now} />}
          </>
        )}
      </div>
      <Source live={m.state === "in"} updated={at} now={now} href={espnUrl(m.id)} className="shrink-0 border-t border-line-soft px-[16px] py-[12px]" />
    </>
  );
}

function Scoreboard({ m }: { m: Match }) {
  const at = new Date(m.date);
  const c = clock(at);
  const team = (s: Side, right?: boolean) => (
    <div className={`flex min-w-0 flex-1 items-center gap-[10px] ${right ? "flex-row-reverse text-right" : ""}`}>
      <Crest src={s.logo} size={36} />
      <span className="min-w-0">
        <span className="block truncate font-geist text-body font-semibold text-heading">{s.name}</span>
        <span className="block font-geist text-caption text-muted">{right ? "Away" : "Home"}</span>
      </span>
    </div>
  );
  return (
    <div className="mt-[12px] flex items-center gap-[12px]">
      {team(m.home)}
      <div className="flex shrink-0 flex-col items-center">
        {m.state === "pre" ? (
          <>
            <span className="font-heading text-h2 tabular-nums text-heading">
              {c.time}
              {c.period && <span className="ml-[2px] font-geist text-caption font-semibold uppercase text-muted">{c.period}</span>}
            </span>
            <span className="font-geist text-caption text-muted">{day(at)}</span>
          </>
        ) : (
          <span className="font-heading text-h1 tabular-nums text-heading">
            {m.home.score ?? 0}
            <span className="mx-[6px] text-muted">–</span>
            {m.away.score ?? 0}
          </span>
        )}
      </div>
      {team(m.away, true)}
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center px-[16px] py-[40px] text-center">
      <p className="font-geist text-body font-semibold text-heading">{title}</p>
      <p className="mt-[4px] max-w-[280px] font-geist text-body text-muted">{body}</p>
    </div>
  );
}

// ── Preview: form side by side, then the last meetings ────────────────────────
function Preview({ d }: { d: MatchDetail }) {
  const m = d.match;
  const sides = [m.home, m.away];
  return (
    <div className="flex flex-col gap-[28px]">
      {d.form.length > 0 && (
        <section>
          <SectionHead title="Form" aside="Last 5 · newest on the right" />
          <div className="flex flex-col overflow-hidden rounded-[16px] ring-1 ring-line-soft">
            {sides.map((s) => {
              const games = [...(d.form.find((f) => f.teamId === s.id)?.games ?? [])].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
              const pts = games.reduce((n, g) => n + (g.result === "W" ? 3 : g.result === "D" ? 1 : 0), 0);
              return (
                <div key={s.id} className="flex items-center gap-[12px] border-t border-line-soft px-[14px] py-[12px] first:border-t-0">
                  <Crest src={s.logo} size={24} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-geist text-body font-medium text-heading">{s.name}</span>
                    <span className="block font-geist text-caption tabular-nums text-muted">{pts} of 15 points</span>
                  </span>
                  <span className="flex gap-[4px]">
                    {games.map((g, i) => (
                      <span key={i} title={`${RESULT_WORD[g.result]} ${g.score} ${g.home ? "vs" : "at"} ${g.opponent}`}>
                        <ResultChip r={g.result} />
                      </span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {d.h2h.length > 0 && <HeadToHead d={d} />}

      {d.form.length === 0 && d.h2h.length === 0 && <Empty title="No preview yet" body="Form and past meetings show here closer to the match." />}
    </div>
  );
}

function HeadToHead({ d }: { d: MatchDetail }) {
  let won = 0,
    drew = 0,
    lost = 0;
  for (const g of d.h2h) {
    const che = g.home.isChelsea ? g.home : g.away;
    const opp = g.home.isChelsea ? g.away : g.home;
    const a = Number(che.score),
      b = Number(opp.score);
    if (a > b) won++;
    else if (a === b) drew++;
    else lost++;
  }
  const total = Math.max(1, d.h2h.length);
  const opp = d.match.home.isChelsea ? d.match.away : d.match.home;
  return (
    <section>
      <SectionHead title="Head to head" aside={`Last ${d.h2h.length} meetings`} />
      <div className="rounded-[16px] p-[16px] ring-1 ring-line-soft">
        <div className="grid grid-cols-3">
          {[
            [won, "Chelsea", "text-left"],
            [drew, "Draws", "text-center"],
            [lost, opp.name, "text-right"],
          ].map(([n, l, align]) => (
            <div key={String(l)} className={String(align)}>
              <span className="block font-heading text-h1 tabular-nums text-heading">{n}</span>
              <span className="block font-geist text-caption text-muted">{l === "Draws" ? "Draws" : `${l} wins`}</span>
            </div>
          ))}
        </div>
        <div className="mt-[14px] flex h-[6px] gap-[2px] overflow-hidden rounded-full">
          {won > 0 && <span className="rounded-full bg-grape" style={{ width: `${(won / total) * 100}%` }} />}
          {drew > 0 && <span className="rounded-full bg-[#D4D2CF]" style={{ width: `${(drew / total) * 100}%` }} />}
          {lost > 0 && <span className="rounded-full bg-primary" style={{ width: `${(lost / total) * 100}%` }} />}
        </div>
      </div>

      {/* Each meeting: the date on top, the two sides stacked, the result on the right */}
      <ul className="mt-[12px] flex flex-col overflow-hidden rounded-[16px] ring-1 ring-line-soft">
        {d.h2h.map((g) => {
          const hs = Number(g.home.score),
            as = Number(g.away.score);
          const row = (s: Side, score: number, other: number) => (
            <span className="flex items-center gap-[10px]">
              <Crest src={s.logo} size={20} />
              <span className={`min-w-0 flex-1 truncate font-geist text-body ${score > other ? "font-semibold text-heading" : "text-secondary"}`}>{s.name}</span>
              <span className={`w-[24px] text-right font-geist text-body tabular-nums ${score > other ? "font-semibold text-heading" : "text-muted"}`}>{s.score}</span>
            </span>
          );
          return (
            <li key={g.date} className="flex flex-col gap-[8px] border-t border-line-soft px-[14px] py-[12px] first:border-t-0">
              <span className="font-geist text-caption text-muted">
                {fullDate(new Date(g.date))}
                {g.competition && ` · ${comp(g.competition)}`}
              </span>
              {row(g.home, hs, as)}
              {row(g.away, as, hs)}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function EventIcon({ kind, size = 16 }: { kind: KeyEvent["kind"]; size?: number }) {
  if (kind === "yellow" || kind === "red")
    return <span className={`inline-block shrink-0 rounded-[2px] ${kind === "yellow" ? "bg-[#F5C518]" : "bg-[#E03131]"}`} style={{ width: size * 0.62, height: size * 0.875 }} aria-label={kind === "yellow" ? "Yellow card" : "Red card"} />;
  if (kind === "sub")
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-label="Substitution" className="shrink-0">
        <path d="M5 13V4m0 0L2 7m3-3 3 3" fill="none" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 3v9m0 0 3-3m-3 3-3-3" fill="none" stroke="#c4231a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return <Ball size={size} own={kind === "own-goal"} />;
}

function Ball({ size = 16, own }: { size?: number; own?: boolean }) {
  const ink = own ? "#c4231a" : "#32073e";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-label={own ? "Own goal" : "Goal"} className="shrink-0">
      <circle cx="8" cy="8" r="7.2" fill="white" stroke={ink} strokeWidth="1.2" />
      <path d="M8 4.8 10.6 6.7 9.6 9.8H6.4L5.4 6.7Z" fill={ink} />
      <path d="M8 4.8V1M10.6 6.7l3.5-1.2M9.6 9.8l2.2 3M6.4 9.8l-2.2 3M5.4 6.7 1.9 5.5" stroke={ink} strokeWidth="1" />
    </svg>
  );
}

const minuteValue = (s: string) => s.split("+").reduce((n, p, i) => n + (parseInt(p, 10) || 0) / (i ? 100 : 1), 0);

function Timeline({ d }: { d: MatchDetail }) {
  const live = d.match.state === "in";
  const events = [...d.events].sort((a, b) => minuteValue(a.minute) - minuteValue(b.minute));
  if (live) events.reverse();
  if (!events.length) return <Empty title="Nothing yet" body="Goals, cards and changes show here as they happen." />;
  const goals = [...d.events].filter((e) => e.kind === "goal" || e.kind === "penalty" || e.kind === "own-goal").sort((a, b) => minuteValue(a.minute) - minuteValue(b.minute));
  const scorers = (home: boolean) => goals.filter((g) => g.home === home);

  return (
    <div className="flex flex-col gap-[20px]">
      {goals.length > 0 && (
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-[12px] rounded-[16px] px-[14px] py-[12px] ring-1 ring-line-soft">
          {[true, false].map((h, i) => (
            <div key={String(h)} className={`flex flex-col gap-[4px] ${h ? "" : "col-start-3 text-right"}`}>
              {scorers(h).map((g, j) => (
                <span key={j} className="font-geist text-caption text-secondary">
                  {lastName(g.player)} <span className="tabular-nums text-muted">{g.minute}</span>
                  {g.kind === "penalty" && " (pen)"}
                  {g.kind === "own-goal" && " (og)"}
                </span>
              ))}
              {i === 0 && <span className="sr-only">Home scorers</span>}
            </div>
          ))}
          <span className="col-start-2 row-start-1 pt-[2px]">
            <Ball size={14} />
          </span>
        </div>
      )}
      <ol className="relative flex flex-col">
        <span className="absolute bottom-[16px] left-1/2 top-[16px] w-px -translate-x-1/2 bg-line-soft" aria-hidden="true" />
        {events.map((e, i) => {
          const isGoal = e.kind === "goal" || e.kind === "penalty" || e.kind === "own-goal";
          const text = (
            <span className={`flex min-w-0 items-center gap-[8px] ${e.home ? "flex-row-reverse text-right" : ""}`}>
              <EventIcon kind={e.kind} />
              <span className="min-w-0">
                <span className={`block truncate font-geist text-body ${isGoal ? "font-semibold" : ""} text-heading`}>{e.player}</span>
                {(e.other || e.kind === "penalty" || e.kind === "own-goal") && (
                  <span className="block truncate font-geist text-caption text-muted">
                    {e.kind === "sub" ? `For ${e.other}` : e.kind === "penalty" ? "Penalty" : e.kind === "own-goal" ? "Own goal" : `Assist ${e.other}`}
                  </span>
                )}
              </span>
            </span>
          );
          return (
            <li key={i} className="relative grid grid-cols-[1fr_56px_1fr] items-center py-[8px]">
              <div className="flex min-w-0 justify-end">{e.home && text}</div>
              <div className="flex justify-center">
                <span className={`relative min-w-[40px] rounded-full px-[6px] py-[2px] text-center font-geist text-caption font-semibold tabular-nums ${isGoal ? "bg-primary text-white" : "bg-background text-muted ring-1 ring-line-soft"}`}>{e.minute}</span>
              </div>
              <div className="flex min-w-0 justify-start">{!e.home && text}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Lineups: both sides on one pitch, home from the bottom ────────────────────
const DEPTH: [RegExp, number][] = [
  [/^G/, 0],
  [/^(CD|CB|D)/, 1],
  [/^(RB|LB)$/, 1.2],
  [/WB/, 1.8],
  [/^(DM|CDM)/, 2],
  [/^(CM|M)(-|$)/, 2.5],
  [/^(LM|RM)/, 2.7],
  [/^AM/, 3],
  [/^(LW|RW)/, 3.3],
  [/^(F|CF|ST|S)/, 4],
];
const depthOf = (pos: string) => DEPTH.find(([r]) => r.test(pos))?.[1] ?? 2.5;
const sideOf = (pos: string) => (/-L$|^L/.test(pos) ? -1 : /-R$|^R/.test(pos) ? 1 : 0);

// Lines from the keeper up, each from the team's left to right, sized by the formation
function lines(starters: Player[], formation?: string): Player[][] {
  const gk = starters.filter((p) => depthOf(p.pos) === 0).slice(0, 1);
  const out = starters.filter((p) => !gk.includes(p)).sort((a, b) => depthOf(a.pos) - depthOf(b.pos) || a.place - b.place);
  const counts = formation?.split("-").map(Number) ?? [];
  let rows: Player[][] = [];
  if (counts.length && counts.every(Boolean) && counts.reduce((a, b) => a + b, 0) === out.length) {
    let i = 0;
    rows = counts.map((n) => out.slice(i, (i += n)));
  } else {
    const by = new Map<number, Player[]>();
    for (const p of out) {
      const k = Math.round(depthOf(p.pos));
      by.set(k, [...(by.get(k) ?? []), p]);
    }
    rows = [...by.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  }
  return [gk, ...rows].map((l) => [...l].sort((a, b) => sideOf(a.pos) - sideOf(b.pos)));
}

type Marks = { goals: number; yellow: boolean; red: boolean; off?: string };
function marksFor(events: KeyEvent[]) {
  const map = new Map<string, Marks>();
  const get = (n: string) => map.get(n) ?? (map.set(n, { goals: 0, yellow: false, red: false }), map.get(n)!);
  for (const e of events) {
    if (e.kind === "goal" || e.kind === "penalty") get(e.player).goals++;
    if (e.kind === "yellow") get(e.player).yellow = true;
    if (e.kind === "red") get(e.player).red = true;
    if (e.kind === "sub" && e.other) get(e.other).off = e.minute;
  }
  return map;
}

function Lineups({ d }: { d: MatchDetail }) {
  const m = d.match;
  const home = d.lineups.find((l) => l.teamId === m.home.id);
  const away = d.lineups.find((l) => l.teamId === m.away.id);
  const marks = marksFor(d.events);
  if (!home && !away)
    return (
      <div className="relative">
        <Pitch />
        <div className="absolute inset-0 flex items-center justify-center p-[24px]">
          <p className="max-w-[240px] rounded-[14px] bg-background px-[16px] py-[12px] text-center font-geist text-body text-heading">Lineups are announced about an hour before kick-off.</p>
        </div>
      </div>
    );
  return (
    <div className="flex flex-col gap-[24px]">
      <div>
        <TeamBar s={m.away} formation={away?.formation} />
        <Pitch home={home} away={away} marks={marks} />
        <TeamBar s={m.home} formation={home?.formation} />
      </div>
      <Bench m={m} home={home} away={away} />
    </div>
  );
}

function TeamBar({ s, formation }: { s: Side; formation?: string }) {
  return (
    <div className="flex items-center justify-between py-[10px]">
      <span className="flex items-center gap-[8px] font-geist text-body font-semibold text-heading">
        <Crest src={s.logo} size={20} />
        {s.name}
      </span>
      {formation && <span className="font-geist text-caption font-medium tabular-nums text-muted">{formation}</span>}
    </div>
  );
}

// A full pitch to scale (68 × 105 m): mown stripes and every marking
function PitchMarkings() {
  const W = 68,
    L = 105,
    box = 40.32,
    six = 18.32,
    goal = 7.32;
  const x = (w: number) => (W - w) / 2;
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox={`-2 -2 ${W + 4} ${L + 4}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <clipPath id="pitch-top">
          <rect x="0" y="16.5" width={W} height="20" />
        </clipPath>
        <clipPath id="pitch-bottom">
          <rect x="0" y={L - 36.5} width={W} height="20" />
        </clipPath>
      </defs>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x="-2" y={-2 + i * ((L + 4) / 14)} width={W + 4} height={(L + 4) / 14} fill={i % 2 ? "rgba(255,255,255,0.035)" : "transparent"} />
      ))}
      <g fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <rect x="0" y="0" width={W} height={L} vectorEffect="non-scaling-stroke" />
        <line x1="0" y1={L / 2} x2={W} y2={L / 2} vectorEffect="non-scaling-stroke" />
        <circle cx={W / 2} cy={L / 2} r="9.15" vectorEffect="non-scaling-stroke" />
        {/* top end */}
        <rect x={x(box)} y="0" width={box} height="16.5" vectorEffect="non-scaling-stroke" />
        <rect x={x(six)} y="0" width={six} height="5.5" vectorEffect="non-scaling-stroke" />
        <rect x={x(goal)} y="-1.6" width={goal} height="1.6" vectorEffect="non-scaling-stroke" />
        <circle cx={W / 2} cy="11" r="9.15" clipPath="url(#pitch-top)" vectorEffect="non-scaling-stroke" />
        {/* bottom end */}
        <rect x={x(box)} y={L - 16.5} width={box} height="16.5" vectorEffect="non-scaling-stroke" />
        <rect x={x(six)} y={L - 5.5} width={six} height="5.5" vectorEffect="non-scaling-stroke" />
        <rect x={x(goal)} y={L} width={goal} height="1.6" vectorEffect="non-scaling-stroke" />
        <circle cx={W / 2} cy={L - 11} r="9.15" clipPath="url(#pitch-bottom)" vectorEffect="non-scaling-stroke" />
        {/* corners */}
        <path d={`M1 0A1 1 0 0 1 0 1M${W - 1} 0A1 1 0 0 0 ${W} 1M0 ${L - 1}A1 1 0 0 1 1 ${L}M${W} ${L - 1}A1 1 0 0 0 ${W - 1} ${L}`} vectorEffect="non-scaling-stroke" />
      </g>
      <g fill="rgba(255,255,255,0.4)">
        <circle cx={W / 2} cy={L / 2} r="0.5" />
        <circle cx={W / 2} cy="11" r="0.4" />
        <circle cx={W / 2} cy={L - 11} r="0.4" />
      </g>
    </svg>
  );
}

function Pitch({ home, away, marks }: { home?: Lineup; away?: Lineup; marks?: Map<string, Marks> }) {
  // Home keeper at the bottom edge, its forwards just below halfway; away mirrored on top
  const place = (lineup: Lineup, top: boolean) => {
    const ls = lines(lineup.starters, lineup.formation);
    const n = ls.length;
    return ls.flatMap((line, r) => {
      const y = r === 0 ? 6 : 15 + ((r - 1) / Math.max(1, n - 2)) * 25; // % from own goal line
      return line.map((p, i) => {
        const xi = (i + 1) / (line.length + 1);
        return { p, x: (top ? 1 - xi : xi) * 100, y: top ? y : 100 - y, away: top };
      });
    });
  };
  const dots = [...(home ? place(home, false) : []), ...(away ? place(away, true) : [])];
  return (
    <div className="relative aspect-[72/109] w-full overflow-hidden rounded-[16px]" style={{ background: "#2c0737" }}>
      <PitchMarkings />
      {dots.map(({ p, x, y, away: isAway }) => {
        const mk = marks?.get(p.name);
        return (
          <div key={(isAway ? "a" : "h") + p.number + p.name} className="absolute flex w-[68px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[4px]" style={{ left: `${x}%`, top: `${y}%` }}>
            <span
              className={`relative flex h-[28px] w-[28px] items-center justify-center rounded-full font-geist text-caption font-bold tabular-nums ${
                isAway ? "bg-[#1e0525] text-white ring-[1.5px] ring-white/70" : "bg-white text-heading"
              }`}
            >
              {p.number}
              {mk?.goals ? (
                <span className="absolute -left-[6px] -top-[6px] flex items-center rounded-full bg-white">
                  <Ball size={14} />
                  {mk.goals > 1 && <span className="pr-[3px] font-geist text-[10px] font-bold leading-[12px] text-heading">{mk.goals}</span>}
                </span>
              ) : null}
              {(mk?.yellow || mk?.red) && <span className={`absolute -right-[4px] -top-[4px] h-[10px] w-[8px] rounded-[1px] ${mk.red ? "bg-[#E03131]" : "bg-[#F5C518]"}`} />}
              {mk?.off && (
                <span className="absolute -bottom-[4px] -right-[8px] flex h-[16px] items-center rounded-full bg-[#c4231a] px-[4px] font-geist text-[10px] font-semibold leading-[12px] text-white">{mk.off}</span>
              )}
            </span>
            <span className="max-w-full truncate font-geist text-[10px] font-medium leading-[12px] text-white">{p.short}</span>
          </div>
        );
      })}
    </div>
  );
}

function Bench({ m, home, away }: { m: Match; home?: Lineup; away?: Lineup }) {
  const col = (s: Side, l?: Lineup) =>
    l && (
      <div className="min-w-0">
        <p className="mb-[4px] flex items-center gap-[6px] font-geist text-caption font-medium text-muted">
          <Crest src={s.logo} size={14} />
          {s.name}
        </p>
        <ul>
          {l.bench.map((p) => (
            <li key={p.number + p.name} className="flex items-center gap-[8px] border-b border-line-soft py-[8px] last:border-b-0">
              <span className="w-[20px] font-geist text-caption tabular-nums text-muted">{p.number}</span>
              <span className={`min-w-0 flex-1 truncate font-geist text-body ${p.subIn ? "font-medium text-heading" : "text-secondary"}`}>{p.short}</span>
              {p.subIn && (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-label="Came on" className="shrink-0">
                  <path d="M6 10V2m0 0L3 5m3-3 3 3" fill="none" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <section>
      <SectionHead title="Substitutes" />
      <div className="grid grid-cols-2 gap-x-[20px]">
        {col(m.home, home)}
        {col(m.away, away)}
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
// After FotMob / Apple Sports: a team key, possession as one split bar with the numbers
// inside it, a shooting card with an accuracy ring per side, then grouped cards of rows.
// Each row is value · label · value; the side that leads gets its number in a filled pill
// in its team colour, so the winner of every row reads at a glance without extra bars.
const teamFill = (s: Side) => (s.isChelsea ? "bg-grape" : "bg-primary");
const teamStroke = (s: Side) => (s.isChelsea ? "#9D136A" : "#32073e");

const GROUPS: [string, string[]][] = [
  ["Top stats", ["Corners", "Saves", "Accurate passes"]],
  ["Discipline", ["Fouls", "Offsides", "Yellow cards", "Red cards"]],
];

function Stats({ d }: { d: MatchDetail }) {
  const m = d.match;
  if (!d.stats.length) return <Empty title="No stats yet" body="Match stats fill in once the game is under way." />;
  const get = (label: string) => d.stats.find((s) => s.label === label);
  const poss = get("Possession");
  const shots = get("Shots");
  const onTarget = get("Shots on target");
  const used = new Set(["Possession", "Shots", "Shots on target"]);

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Key: which colour is which side */}
      <div className="flex items-center justify-between">
        {[m.home, m.away].map((s, i) => (
          <span key={s.id} className={`flex items-center gap-[8px] ${i ? "flex-row-reverse" : ""}`}>
            <Crest src={s.logo} size={24} />
            <span className="font-geist text-body font-semibold text-heading">{s.name}</span>
            <span className={`h-[8px] w-[8px] rounded-full ${teamFill(s)}`} aria-hidden="true" />
          </span>
        ))}
      </div>

      {poss && <Possession home={m.home} away={m.away} s={poss} />}

      {shots && onTarget && <Shooting home={m.home} away={m.away} shots={shots} onTarget={onTarget} />}

      {GROUPS.map(([title, labels]) => {
        const rows = labels.map(get).filter((s): s is Stat => !!s);
        rows.forEach((r) => used.add(r.label));
        return rows.length ? <StatGroup key={title} title={title} rows={rows} home={m.home} away={m.away} neutral={title === "Discipline"} /> : null;
      })}
      {(() => {
        const other = d.stats.filter((s) => !used.has(s.label));
        return other.length ? <StatGroup title="More" rows={other} home={m.home} away={m.away} /> : null;
      })()}
    </div>
  );
}

function Possession({ s, home, away }: { s: Stat; home: Side; away: Side }) {
  const h = Math.round(s.home),
    a = 100 - h;
  return (
    <section className="rounded-[16px] p-[16px] ring-1 ring-line-soft">
      <p className="mb-[12px] text-center font-geist text-caption font-semibold uppercase tracking-[0.6px] text-muted">Ball possession</p>
      <div className="flex h-[36px] gap-[4px]" role="img" aria-label={`Possession: ${home.name} ${h}%, ${away.name} ${a}%`}>
        <span className={`flex items-center rounded-l-full rounded-r-[6px] pl-[14px] ${teamFill(home)}`} style={{ width: `${h}%` }}>
          <span className="font-geist text-body font-semibold tabular-nums text-white">{h}%</span>
        </span>
        <span className={`flex items-center justify-end rounded-l-[6px] rounded-r-full pr-[14px] ${teamFill(away)}`} style={{ width: `${a}%` }}>
          <span className="font-geist text-body font-semibold tabular-nums text-white">{a}%</span>
        </span>
      </div>
    </section>
  );
}

function Ring({ value, total, side, align }: { value: number; total: number; side: Side; align: "left" | "right" }) {
  const pct = total ? value / total : 0;
  const r = 26,
    c = 2 * Math.PI * r;
  return (
    <div className={`flex items-center gap-[12px] ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#eeece8" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={teamStroke(side)} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${pct * c} ${c}`} />
      </svg>
      <div>
        <span className="block font-heading text-h2 tabular-nums text-heading">{Math.round(pct * 100)}%</span>
        <span className="block font-geist text-caption tabular-nums text-muted">
          {value} of {total} on target
        </span>
      </div>
    </div>
  );
}

function Shooting({ home, away, shots, onTarget }: { home: Side; away: Side; shots: Stat; onTarget: Stat }) {
  return (
    <section className="overflow-hidden rounded-[16px] ring-1 ring-line-soft">
      <p className="px-[16px] pt-[14px] font-geist text-caption font-semibold uppercase tracking-[0.6px] text-muted">Shooting</p>
      <div className="flex items-center justify-between px-[16px] py-[14px]">
        <Ring value={onTarget.home} total={shots.home} side={home} align="left" />
        <Ring value={onTarget.away} total={shots.away} side={away} align="right" />
      </div>
      <ul className="border-t border-line-soft">
        <CompareRow s={shots} home={home} away={away} />
        <CompareRow s={onTarget} home={home} away={away} />
      </ul>
    </section>
  );
}

// Discipline has no "winner": more fouls or cards isn't a lead, so its numbers stay plain
function StatGroup({ title, rows, home, away, neutral }: { title: string; rows: Stat[]; home: Side; away: Side; neutral?: boolean }) {
  return (
    <section className="overflow-hidden rounded-[16px] ring-1 ring-line-soft">
      <p className="px-[16px] pt-[14px] pb-[4px] font-geist text-caption font-semibold uppercase tracking-[0.6px] text-muted">{title}</p>
      <ul>
        {rows.map((s) => (
          <CompareRow key={s.label} s={s} home={home} away={away} neutral={neutral} />
        ))}
      </ul>
    </section>
  );
}

function CompareRow({ s, home, away, neutral }: { s: Stat; home: Side; away: Side; neutral?: boolean }) {
  const lead = neutral || s.home === s.away ? null : s.home > s.away ? "home" : "away";
  const value = (v: number, side: "home" | "away", t: Side) => (
    <span
      className={`inline-flex h-[28px] min-w-[40px] items-center justify-center rounded-full px-[10px] font-geist text-body font-semibold tabular-nums ${
        lead === side ? `${teamFill(t)} text-white` : "text-heading"
      }`}
    >
      {v}
    </span>
  );
  return (
    <li className="grid h-[48px] grid-cols-[64px_1fr_64px] items-center border-t border-line-soft px-[12px] first:border-t-0">
      <span className="justify-self-start">{value(s.home, "home", home)}</span>
      <span className="text-center font-geist text-body text-secondary">{s.label}</span>
      <span className="justify-self-end">{value(s.away, "away", away)}</span>
    </li>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
function Table({ d }: { d: MatchDetail }) {
  if (!d.table.length) return <Empty title="No table for this one" body="Cup matches don’t have a league table." />;
  const ids = [d.match.home.id, d.match.away.id];
  return (
    <section>
      <SectionHead title={comp(d.match.competition)} aside="Both sides highlighted" />
      <table className="w-full font-geist text-body tabular-nums">
        <thead>
          <tr className="text-left text-caption text-muted">
            <th className="w-[28px] pb-[8px] pl-[6px] font-medium">#</th>
            <th className="pb-[8px] font-medium">Team</th>
            <th className="w-[32px] pb-[8px] text-right font-medium">P</th>
            <th className="w-[40px] pb-[8px] text-right font-medium">GD</th>
            <th className="w-[44px] pb-[8px] pr-[6px] text-right font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {d.table.map((r: TableRow) => {
            const hi = ids.includes(r.teamId);
            const che = r.teamId === TEAM;
            return (
              <tr key={r.teamId} className={`${hi ? "bg-surface" : ""} border-t border-line-soft`}>
                <td className={`py-[8px] pl-[6px] text-caption ${che ? "font-semibold text-grape" : "text-muted"}`}>{r.pos}</td>
                <td className="py-[8px]">
                  <span className="flex min-w-0 items-center gap-[8px]">
                    <Crest src={r.logo} size={18} />
                    <span className={`truncate ${hi ? "font-semibold text-heading" : "text-secondary"}`}>{r.name}</span>
                  </span>
                </td>
                <td className="py-[8px] text-right text-secondary">{r.played}</td>
                <td className="py-[8px] text-right text-secondary">{r.gd}</td>
                <td className={`py-[8px] pr-[6px] text-right font-semibold ${che ? "text-grape" : "text-heading"}`}>{r.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

// ── News ──────────────────────────────────────────────────────────────────────
function News({ items, now }: { items: Article[]; now: number }) {
  if (!items.length) return <Empty title="No news yet" body="Stories about this match show here." />;
  const [lead, ...rest] = items;
  return (
    <div className="flex flex-col gap-[16px]">
      <a href={lead.href} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[16px] ring-1 ring-line-soft">
        {lead.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lead.image} alt="" className="aspect-[16/9] w-full object-cover" />
        )}
        <span className="block p-[14px]">
          <span className="block font-geist text-body-md font-semibold text-heading group-hover:text-grape">{lead.headline}</span>
          <span className="mt-[4px] block font-geist text-caption text-muted">ESPN · {ago(lead.published, now)}</span>
        </span>
      </a>
      <ul className="flex flex-col">
        {rest.map((a) => (
          <li key={a.href} className="border-t border-line-soft first:border-t-0">
            <a href={a.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-[12px] py-[12px]">
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-geist text-body font-medium text-heading group-hover:text-grape">{a.headline}</span>
                <span className="mt-[2px] block font-geist text-caption text-muted">ESPN · {ago(a.published, now)}</span>
              </span>
              {a.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt="" className="h-[56px] w-[80px] shrink-0 rounded-[10px] object-cover" />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
