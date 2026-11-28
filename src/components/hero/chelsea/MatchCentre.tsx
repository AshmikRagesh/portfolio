"use client";

// ── Chelsea match centre (the back of the pin) ────────────────────────────────
// Two views in one card, after matchday apps (Apple Sports, FotMob, the Premier League
// app):
//   Overview      one dark match tile (status, crests, kick-off or the live score, a
//                 countdown, the venue), then Chelsea's form and the next fixtures.
//   Match centre  tap the tile or any fixture: a compact scoreboard, then tabs. Before
//                 kick-off: Preview (form, head-to-head), Lineups, Table, News. Live or
//                 finished: Timeline, Lineups, Stats, News.
//
// Opens with no loading: the data and crests are fetched while the page is idle and again
// when the pin is hovered (prefetchChelsea), and every view paints from that cache.
// Flat surfaces only (no glows, blurs or coloured shadows); corners come from one
// concentric radius scale, squircles where supported (.mc-r-* in globals.css). Icons are
// Lucide, like the rest of the site.
//
// Live: ESPN's live feed (through /api/fixture, cached ~10s) is polled every 15 seconds
// while a match is on, and every minute once kick-off is near, so the card flips to live on
// its own. Times are in the visitor's time zone.

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowLeftRight, ArrowUp, ArrowUpRight, ChevronLeft, ChevronRight, Goal, MapPin, RectangleVertical } from "lucide-react";
import type { Article, FormGame, KeyEvent, Lineup, Match, MatchDetail, Player, Side, Stat, TableRow } from "@/lib/chelsea";

const TEAM = "363";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TILE_BG = "linear-gradient(160deg, #3a0944 0%, #32073e 50%, #24062d 100%)";
const LIVE_MS = 15_000;
const NEAR_MS = 60_000;
const ICON = { strokeWidth: 1.8, "aria-hidden": true } as const;

// Results read the way every sports app reads them: won green, drew grey, lost red.
// Each passes 4.5:1 with white bold caption text.
const RESULT = {
  W: "bg-[#15803d] text-white",
  D: "bg-[#6f6d6b] text-white",
  L: "bg-[#c4231a] text-white",
};
const RESULT_WORD = { W: "Won", D: "Drew", L: "Lost" };

// ── Data: one cache, filled ahead of time ─────────────────────────────────────
type Fixtures = { next: Match[]; form: FormGame[] };

// In development, ?match=<ESPN event id> on the page shows that match as live.
const demoId = () => (typeof window !== "undefined" && process.env.NODE_ENV !== "production" ? new URLSearchParams(window.location.search).get("match") : null);
const fixturesUrl = () => {
  const demo = demoId();
  return `/api/fixture${demo ? `?demo=${demo}` : ""}`;
};
const matchUrl = (id: string) => `/api/fixture/match?id=${id}${demoId() === id ? "&demo=1" : ""}`;

const cache = new Map<string, { data: unknown; at: number }>();
const inflight = new Map<string, Promise<unknown>>();

function load<T>(url: string): Promise<T> {
  const running = inflight.get(url);
  if (running) return running as Promise<T>;
  const p = fetch(url, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((d) => {
      cache.set(url, { data: d, at: Date.now() });
      return d as T;
    })
    .finally(() => inflight.delete(url));
  inflight.set(url, p);
  return p;
}

const fresh = (url: string, ms = 60_000) => {
  const c = cache.get(url);
  return c && Date.now() - c.at < ms;
};

function preloadImage(src?: string) {
  if (!src) return;
  const i = new Image();
  i.src = src;
}

/** Warm the cache: the fixtures, every crest, and the first match's full detail. */
export function prefetchChelsea() {
  const url = fixturesUrl();
  if (fresh(url) || inflight.has(url)) return;
  load<Fixtures>(url)
    .then((f) => {
      f.next.forEach((m) => [m.home.logo, m.away.logo].forEach(preloadImage));
      f.form.forEach((g) => preloadImage(g.logo));
      if (f.next[0]) prefetchMatch(f.next[0].id);
    })
    .catch(() => {});
}

function prefetchMatch(id: string) {
  const url = matchUrl(id);
  if (fresh(url) || inflight.has(url)) return;
  load<MatchDetail>(url)
    .then((d) => {
      d.news.slice(0, 3).forEach((a) => preloadImage(a.image));
      d.h2h.forEach((g) => [g.home.logo, g.away.logo].forEach(preloadImage));
    })
    .catch(() => {});
}

/** Paints from the cache at once, refreshes in the background, then every `every(data)` ms. */
function usePoll<T>(url: string, every: (d: T) => number | null) {
  const [state, setState] = useState<{ data: T | null | "error"; at: number }>(() => {
    const c = cache.get(url);
    return c ? { data: c.data as T, at: c.at } : { data: null, at: 0 };
  });
  useEffect(() => {
    let stop = false;
    let timer = 0;
    const tick = () =>
      load<T>(url)
        .then((d) => {
          if (stop) return;
          setState({ data: d, at: cache.get(url)?.at ?? Date.now() });
          const ms = every(d);
          if (ms) timer = window.setTimeout(tick, ms);
        })
        .catch(() => {
          if (stop) return;
          setState((p) => (p.data && p.data !== "error" ? p : { data: "error", at: Date.now() }));
          timer = window.setTimeout(tick, NEAR_MS);
        });
    const c = cache.get(url);
    if (c && fresh(url, 10_000)) {
      const ms = every(c.data as T);
      if (ms) timer = window.setTimeout(tick, ms);
    } else tick();
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return state;
}

const pollFor = (m?: Match) => {
  if (!m || m.state === "post" || demoId()) return null;
  if (m.state === "in") return LIVE_MS;
  return Date.parse(m.date) - Date.now() < 15 * 6e4 ? NEAR_MS : null;
};

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
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
function ago(t: string | number, now: number) {
  const s = Math.max(0, Math.round((now - (typeof t === "number" ? t : Date.parse(t))) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return fullDate(new Date(t));
}
const lastName = (n: string) => n.split(" ").slice(-1)[0];
const espnUrl = (id: string) => `https://www.espn.com/soccer/match/_/gameId/${id}`;
const isGoal = (k: KeyEvent["kind"]) => k === "goal" || k === "penalty" || k === "own-goal";

// ── Small parts ───────────────────────────────────────────────────────────────
function Crest({ src, size, className = "" }: { src: string; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} decoding="async" className={`shrink-0 object-contain ${className}`} style={{ width: size, height: size }} />;
}

// A steady dot that breathes in opacity: no halo
function LiveDot() {
  return <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-[#e5484d]" aria-hidden="true" />;
}

// Plain status text, the same voice as the footer: a live dot and minute, or when it is
function Status({ m, now, tone = "dark" }: { m: Match; now: number; tone?: "dark" | "light" }) {
  const text = "inline-flex items-center gap-[6px] font-geist text-caption font-semibold tabular-nums";
  if (m.state === "in")
    return (
      <span className={`${text} ${tone === "dark" ? "text-[#ff8a8f]" : "text-[#c4231a]"}`}>
        <LiveDot />
        {m.clock === "HT" ? "Half time" : `Live · ${m.clock}`}
      </span>
    );
  return <span className={`${text} font-medium ${tone === "dark" ? "text-white/70" : "text-muted"}`}>{m.state === "post" ? "Full time" : when(new Date(m.date), now)}</span>;
}

function SectionHead({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="mb-[12px] flex items-baseline justify-between gap-[12px]">
      <h3 className="font-geist text-caption font-semibold uppercase tracking-[0.6px] text-heading">{title}</h3>
      {aside && <span className="font-geist text-caption text-muted">{aside}</span>}
    </div>
  );
}

function ResultChip({ r }: { r: FormGame["result"] }) {
  return (
    <span className={`mc-r-chip flex h-[24px] w-[24px] items-center justify-center font-geist text-caption font-bold ${RESULT[r] ?? RESULT.D}`} title={RESULT_WORD[r]}>
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

// The card's foot: how fresh the data is, and the way out to the full match page
function Footer({ live, updated, now, href }: { live: boolean; updated: number; now: number; href: string }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-[12px] border-t border-line-soft px-[16px] py-[10px]">
      <span className="flex min-w-0 items-center gap-[8px] truncate font-geist text-caption text-muted">
        {live ? (
          <>
            <span className="flex items-center gap-[6px] font-semibold text-[#c4231a]">
              <LiveDot />
              Live
            </span>
            <span className="h-[12px] w-px bg-line" aria-hidden="true" />
            <span>Updated {ago(updated, now)}</span>
          </>
        ) : (
          <span>Data from ESPN · updated {ago(updated, now)}</span>
        )}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mc-r-ctl inline-flex h-[32px] shrink-0 items-center gap-[4px] bg-surface pl-[12px] pr-[10px] font-geist text-caption font-medium text-heading transition-colors hover:bg-card"
      >
        Open on ESPN
        <ArrowUpRight size={14} {...ICON} />
      </a>
    </div>
  );
}

// ── The card ──────────────────────────────────────────────────────────────────
type View = { id: string | null; dir: 1 | -1 | 0 };

const SHELL = "mc-r-card flex h-[min(680px,calc(100dvh-136px))] md:h-[min(680px,calc(100dvh-96px))] w-[calc(100vw-24px)] max-w-[440px] flex-col overflow-hidden bg-background shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_24px_56px_rgba(30,5,37,0.16)]";

export default function MatchCentreCard() {
  const { data: fixtures, at } = usePoll<Fixtures>(fixturesUrl(), (d) => pollFor(d.next[0]));
  const [view, setView] = useState<View>({ id: null, dir: 0 });
  const data = fixtures && fixtures !== "error" && fixtures.next.length ? fixtures : fixtures === null ? null : "error";
  const now = useNow();

  if (data === null) return <div className={SHELL} aria-busy="true" />;
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
          <MatchView base={open} now={now} onBack={() => setView({ id: null, dir: -1 })} />
        </Slide>
      ) : (
        <Slide key="overview" dir={view.dir} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <Overview data={data} now={now} onOpen={(id) => setView({ id, dir: 1 })} />
          </div>
          <Footer live={data.next[0].state === "in"} updated={at} now={now} href={espnUrl(data.next[0].id)} />
        </Slide>
      )}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ data, now, onOpen }: { data: Fixtures; now: number; onOpen: (id: string) => void }) {
  const [m, ...later] = data.next;
  return (
    <div className="flex flex-col gap-[28px] p-[8px] pb-[24px]">
      <MatchTile m={m} now={now} onOpen={() => onOpen(m.id)} />

      {data.form.length > 0 && (
        <section className="px-[12px]">
          <SectionHead title="Form" aside="Last 5 · newest on the right" />
          <Form games={data.form} />
        </section>
      )}

      {later.length > 0 && (
        <section className="px-[12px]">
          <SectionHead title="Coming up" aside={`Times in ${zone(new Date(m.date))}`} />
          <ul className="mc-r-box flex flex-col overflow-hidden ring-1 ring-inset ring-line-soft">
            {later.map((x) => {
              const d = new Date(x.date);
              const atHome = x.home.isChelsea;
              const opp = atHome ? x.away : x.home;
              const c = clock(d);
              return (
                <li key={x.id} className="border-t border-line-soft first:border-t-0">
                  <button
                    type="button"
                    onClick={() => onOpen(x.id)}
                    onPointerEnter={() => prefetchMatch(x.id)}
                    onFocus={() => prefetchMatch(x.id)}
                    className="group flex w-full items-center gap-[12px] px-[14px] py-[12px] text-left transition-colors hover:bg-surface"
                  >
                    <Crest src={opp.logo} size={32} />
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
                    <ChevronRight size={16} {...ICON} className="shrink-0 text-muted transition-transform group-hover:translate-x-[2px]" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function TileSide({ s }: { s: Side }) {
  return (
    <div className="flex w-[104px] flex-col items-center gap-[10px] text-center">
      <Crest src={s.logo} size={56} className="my-[4px]" />
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
      className="mc-r-tile group block w-full overflow-hidden p-[8px] text-left text-white transition-transform duration-300 active:scale-[0.99]"
      style={{ background: TILE_BG }}
    >
      <div className="flex justify-end px-[12px] pt-[10px]">
        <Status m={m} now={now} />
      </div>

      <div className="flex items-start justify-between px-[4px] pt-[16px]">
        <TileSide s={m.home} />
        <div className="flex min-w-0 flex-1 flex-col items-center pt-[10px]">
          {started ? (
            <>
              <span className="font-heading text-stat tabular-nums text-white">
                {m.home.score ?? 0}
                <span className="mx-[8px] text-white/40">–</span>
                {m.away.score ?? 0}
              </span>
              {m.state === "post" && <span className="mt-[8px] font-geist text-caption text-white/60">{day(at)}</span>}
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
        <div className="px-[8px] pt-[20px]">
          <Countdown to={at.getTime()} now={now} />
        </div>
      )}

      {/* Venue and the way in, as one inset bar (concentric with the tile) */}
      <div className="mc-r-inset mt-[20px] flex items-center justify-between gap-[8px] bg-white/[0.08] py-[6px] pl-[12px] pr-[6px]">
        <span className="flex min-w-0 items-center gap-[8px]">
          <MapPin size={16} {...ICON} className="shrink-0 text-white/60" />
          <span className="min-w-0">
            <span className="block truncate font-geist text-caption font-medium text-white">{m.venue}</span>
            <span className="block font-geist text-caption text-white/60">{m.home.isChelsea ? "Chelsea at home" : `Away at ${m.home.name}`}</span>
          </span>
        </span>
        <span className="mc-r-ctl inline-flex h-[32px] shrink-0 items-center gap-[2px] bg-white pl-[12px] pr-[8px] font-geist text-caption font-semibold text-heading transition-transform group-hover:translate-x-[2px]">
          {m.state === "pre" ? "Preview" : "Match centre"}
          <ChevronRight size={16} {...ICON} />
        </span>
      </div>
    </button>
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
  if (left === 0) return <p className="mc-r-cell bg-white/10 py-[12px] text-center font-geist text-body font-medium">Kicking off now</p>;
  return (
    <div className="grid grid-cols-4 gap-[6px]" role="timer" aria-label="Time to kick-off">
      {parts.map(([v, l]) => (
        <div key={l} className="mc-r-cell flex items-baseline justify-center gap-[4px] bg-white/[0.08] py-[10px]">
          <span className="font-heading text-h2 tabular-nums text-white">{String(v).padStart(2, "0")}</span>
          <span className="font-geist text-caption text-white/60">{l}</span>
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
        <li key={g.date + i} className="mc-r-cell flex flex-col items-center gap-[8px] py-[12px] ring-1 ring-inset ring-line-soft" title={`${RESULT_WORD[g.result]} ${g.score} ${g.home ? "vs" : "at"} ${g.opponent}`}>
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

function MatchView({ base, now, onBack }: { base: Match; now: number; onBack: () => void }) {
  const { data: d, at } = usePoll<MatchDetail>(matchUrl(base.id), (x) => pollFor(x.match));
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
          <button type="button" onClick={onBack} className="mc-r-ctl -ml-[6px] flex h-[36px] items-center gap-[2px] pl-[4px] pr-[12px] font-geist text-body font-medium text-secondary transition-colors hover:bg-surface hover:text-heading">
            <ChevronLeft size={18} {...ICON} />
            Back
          </button>
          <Status m={m} now={now} tone="light" />
        </div>
        <Scoreboard m={m} />
        <div role="tablist" aria-label="Match centre" className="mc-r-track mt-[16px] grid grid-cols-4 gap-[2px] bg-surface p-[4px]">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              data-sound-click="toggle"
              onClick={() => setTab(k)}
              className={`mc-r-ctl h-[32px] font-geist text-body font-medium transition-[background-color,color,box-shadow] duration-200 ${
                tab === k ? "bg-background text-heading shadow-[0_0_0_1px_rgba(30,5,37,0.08)]" : "text-muted hover:text-heading"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div ref={body} role="tabpanel" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[16px] pb-[24px] pt-[20px]">
        {d === null ? null : !detail ? (
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
      <Footer live={m.state === "in"} updated={at} now={now} href={espnUrl(m.id)} />
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
          <div className="mc-r-box flex flex-col overflow-hidden ring-1 ring-inset ring-line-soft">
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
  const opp = d.match.home.isChelsea ? d.match.away : d.match.home;
  return (
    <section>
      <SectionHead title="Head to head" aside={`Last ${d.h2h.length} meetings`} />
      <div className="mc-r-box grid grid-cols-3 divide-x divide-line-soft py-[14px] ring-1 ring-inset ring-line-soft">
        {[
          [won, "Chelsea wins"],
          [drew, "Draws"],
          [lost, `${opp.name} wins`],
        ].map(([n, l]) => (
          <div key={String(l)} className="flex flex-col items-center gap-[2px] px-[8px] text-center">
            <span className="font-heading text-h1 tabular-nums text-heading">{n}</span>
            <span className="truncate font-geist text-caption text-muted">{l}</span>
          </div>
        ))}
      </div>

      {/* Each meeting: the date on top, the two sides stacked, the result on the right */}
      <ul className="mc-r-box mt-[12px] flex flex-col overflow-hidden ring-1 ring-inset ring-line-soft">
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
// Each event gets one 28px round badge with a Lucide icon: goals solid blackcurrant (own
// goals red), cards as the card itself, changes as a swap.
function EventBadge({ kind }: { kind: KeyEvent["kind"] }) {
  const base = "mc-r-chip flex h-[28px] w-[28px] shrink-0 items-center justify-center";
  if (isGoal(kind))
    return (
      <span className={`${base} ${kind === "own-goal" ? "bg-[#c4231a]" : "bg-primary"} text-white`} aria-label={kind === "own-goal" ? "Own goal" : kind === "penalty" ? "Penalty goal" : "Goal"}>
        <Goal size={14} strokeWidth={2} aria-hidden="true" />
      </span>
    );
  if (kind === "yellow" || kind === "red")
    return (
      <span className={`${base} bg-surface`} aria-label={kind === "yellow" ? "Yellow card" : "Red card"}>
        <RectangleVertical size={16} strokeWidth={1.5} aria-hidden="true" fill={kind === "yellow" ? "#F5C518" : "#E03131"} color={kind === "yellow" ? "#d9a800" : "#c4231a"} />
      </span>
    );
  return (
    <span className={`${base} bg-surface text-heading`} aria-label="Substitution">
      <ArrowLeftRight size={14} {...ICON} />
    </span>
  );
}

const minuteValue = (s: string) => s.split("+").reduce((n, p, i) => n + (parseInt(p, 10) || 0) / (i ? 100 : 1), 0);

function Timeline({ d }: { d: MatchDetail }) {
  const live = d.match.state === "in";
  const events = [...d.events].sort((a, b) => minuteValue(a.minute) - minuteValue(b.minute));
  if (live) events.reverse();
  if (!events.length) return <Empty title="Nothing yet" body="Goals, cards and changes show here as they happen." />;
  const goals = [...d.events].filter((e) => isGoal(e.kind)).sort((a, b) => minuteValue(a.minute) - minuteValue(b.minute));

  return (
    <div className="flex flex-col gap-[20px]">
      {goals.length > 0 && (
        <div className="mc-r-box grid grid-cols-[1fr_auto_1fr] items-start gap-[12px] px-[14px] py-[12px] ring-1 ring-inset ring-line-soft">
          {[true, false].map((h) => (
            <div key={String(h)} className={`flex flex-col gap-[4px] ${h ? "" : "col-start-3 text-right"}`}>
              {goals
                .filter((g) => g.home === h)
                .map((g, j) => (
                  <span key={j} className="font-geist text-caption text-secondary">
                    {lastName(g.player)} <span className="tabular-nums text-muted">{g.minute}</span>
                    {g.kind === "penalty" && " (pen)"}
                    {g.kind === "own-goal" && " (og)"}
                  </span>
                ))}
            </div>
          ))}
          <Goal size={16} {...ICON} className="col-start-2 row-start-1 mt-[2px] text-muted" />
        </div>
      )}
      <ol className="relative flex flex-col">
        <span className="absolute bottom-[20px] left-1/2 top-[20px] w-px -translate-x-1/2 bg-line-soft" aria-hidden="true" />
        {events.map((e, i) => {
          const goal = isGoal(e.kind);
          const text = (
            <span className={`flex min-w-0 items-center gap-[10px] ${e.home ? "flex-row-reverse text-right" : ""}`}>
              <EventBadge kind={e.kind} />
              <span className="min-w-0">
                {e.kind === "sub" ? (
                  <>
                    <span className={`flex items-center gap-[4px] font-geist text-body font-medium text-heading ${e.home ? "justify-end" : ""}`}>
                      <ArrowUp size={12} strokeWidth={2.2} aria-label="On" className="shrink-0 text-[#15803d]" />
                      <span className="truncate">{e.player}</span>
                    </span>
                    {e.other && (
                      <span className={`flex items-center gap-[4px] font-geist text-caption text-muted ${e.home ? "justify-end" : ""}`}>
                        <ArrowDown size={12} strokeWidth={2.2} aria-label="Off" className="shrink-0 text-[#c4231a]" />
                        <span className="truncate">{e.other}</span>
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className={`block truncate font-geist text-body text-heading ${goal ? "font-semibold" : "font-medium"}`}>{e.player}</span>
                    {(goal || e.kind === "red") && (
                      <span className="block truncate font-geist text-caption text-muted">
                        {e.kind === "penalty" ? "Penalty" : e.kind === "own-goal" ? "Own goal" : e.kind === "red" ? "Sent off" : e.other ? `Assist · ${e.other}` : "Goal"}
                      </span>
                    )}
                  </>
                )}
              </span>
            </span>
          );
          return (
            <li key={i} className="relative grid grid-cols-[1fr_56px_1fr] items-center py-[10px]">
              <div className="flex min-w-0 justify-end">{e.home && text}</div>
              <div className="flex justify-center">
                <span className={`mc-r-tag relative min-w-[40px] px-[6px] py-[2px] text-center font-geist text-caption font-semibold tabular-nums ${goal ? "bg-primary text-white" : "bg-background text-muted ring-1 ring-inset ring-line-soft"}`}>{e.minute}</span>
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
          <p className="mc-r-cell max-w-[240px] bg-background px-[16px] py-[12px] text-center font-geist text-body text-heading">Lineups are announced about an hour before kick-off.</p>
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
        <rect x={x(box)} y="0" width={box} height="16.5" vectorEffect="non-scaling-stroke" />
        <rect x={x(six)} y="0" width={six} height="5.5" vectorEffect="non-scaling-stroke" />
        <rect x={x(goal)} y="-1.6" width={goal} height="1.6" vectorEffect="non-scaling-stroke" />
        <circle cx={W / 2} cy="11" r="9.15" clipPath="url(#pitch-top)" vectorEffect="non-scaling-stroke" />
        <rect x={x(box)} y={L - 16.5} width={box} height="16.5" vectorEffect="non-scaling-stroke" />
        <rect x={x(six)} y={L - 5.5} width={six} height="5.5" vectorEffect="non-scaling-stroke" />
        <rect x={x(goal)} y={L} width={goal} height="1.6" vectorEffect="non-scaling-stroke" />
        <circle cx={W / 2} cy={L - 11} r="9.15" clipPath="url(#pitch-bottom)" vectorEffect="non-scaling-stroke" />
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
    <div className="mc-r-box relative aspect-[72/109] w-full overflow-hidden" style={{ background: "#2c0737" }}>
      <PitchMarkings />
      {dots.map(({ p, x, y, away: isAway }) => {
        const mk = marks?.get(p.name);
        return (
          <div key={(isAway ? "a" : "h") + p.number + p.name} className="absolute flex w-[68px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[4px]" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className={`relative flex h-[28px] w-[28px] items-center justify-center rounded-full font-geist text-caption font-bold tabular-nums ${isAway ? "bg-[#1e0525] text-white ring-[1.5px] ring-white/70" : "bg-white text-heading"}`}>
              {p.number}
              {mk?.goals ? (
                <span className="absolute -left-[8px] -top-[6px] flex h-[16px] items-center gap-[2px] rounded-[4px] bg-white px-[2px] text-heading">
                  <Goal size={10} strokeWidth={2.2} aria-label="Scored" />
                  {mk.goals > 1 && <span className="font-geist text-[10px] font-bold leading-[12px]">{mk.goals}</span>}
                </span>
              ) : null}
              {(mk?.yellow || mk?.red) && <span className={`absolute -right-[4px] -top-[4px] h-[10px] w-[8px] rounded-[2px] ${mk.red ? "bg-[#E03131]" : "bg-[#F5C518]"}`} />}
              {mk?.off && <span className="absolute -bottom-[4px] -right-[8px] flex h-[16px] items-center rounded-[4px] bg-[#c4231a] px-[4px] font-geist text-[10px] font-semibold leading-[12px] text-white">{mk.off}</span>}
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
              {p.subIn && <ArrowUp size={14} strokeWidth={2.2} aria-label="Came on" className="shrink-0 text-[#15803d]" />}
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
// One list, Shots down to Red cards, like a box score in Apple Sports: number · label ·
// number on even 44px rows, in three fixed columns so every number sits on the same edge
// as the crest above it. The side ahead on a row is set bold in its team colour, the other
// drops to grey. Discipline rows have no "winner" (more fouls isn't a lead), so both stay
// plain.
const NEUTRAL = new Set(["Fouls", "Offsides", "Yellow cards", "Red cards"]);
const teamText = (s: Side) => (s.isChelsea ? "text-grape" : "text-primary");
const STAT_COLS = "grid grid-cols-[48px_1fr_48px] items-center px-[16px]";

function Stats({ d }: { d: MatchDetail }) {
  const m = d.match;
  const rows = d.stats.filter((s) => !s.pct);
  if (!rows.length) return <Empty title="No stats yet" body="Match stats fill in once the game is under way." />;
  return (
    <section className="mc-r-box overflow-hidden ring-1 ring-inset ring-line-soft">
      <div className={`${STAT_COLS} h-[48px] border-b border-line-soft`}>
        <Crest src={m.home.logo} size={24} className="justify-self-start" />
        <span className="text-center font-geist text-caption font-semibold uppercase tracking-[0.6px] text-muted">Team stats</span>
        <Crest src={m.away.logo} size={24} className="justify-self-end" />
      </div>
      <ul>
        {rows.map((s) => (
          <CompareRow key={s.label} s={s} home={m.home} away={m.away} neutral={NEUTRAL.has(s.label)} />
        ))}
      </ul>
    </section>
  );
}

function CompareRow({ s, home, away, neutral }: { s: Stat; home: Side; away: Side; neutral?: boolean }) {
  const lead = neutral || s.home === s.away ? null : s.home > s.away ? "home" : "away";
  const tone = (side: "home" | "away", t: Side) => (lead === side ? `font-semibold ${teamText(t)}` : lead ? "text-muted" : "font-medium text-heading");
  return (
    <li className={`${STAT_COLS} h-[44px] border-t border-line-soft first:border-t-0`}>
      <span className={`text-left font-geist text-body tabular-nums ${tone("home", home)}`}>{s.home}</span>
      <span className="text-center font-geist text-body text-secondary">{s.label}</span>
      <span className={`text-right font-geist text-body tabular-nums ${tone("away", away)}`}>{s.away}</span>
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
      <a href={lead.href} target="_blank" rel="noopener noreferrer" className="mc-r-box group block overflow-hidden ring-1 ring-inset ring-line-soft">
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
                <img src={a.image} alt="" className="mc-r-cell h-[56px] w-[80px] shrink-0 object-cover" />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
