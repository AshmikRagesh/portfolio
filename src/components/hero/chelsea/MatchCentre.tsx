"use client";

// ── Chelsea match centre (the back of the pin) ────────────────────────────────
// Two views in one card, after matchday apps (Apple Sports, FotMob, the Premier League
// app):
//   Overview      one dark match tile (the hero: crests, kick-off or the live score, a
//                 countdown), then Chelsea's form and the next fixtures.
//   Match centre  tap the tile or any fixture: a compact scoreboard, then tabs. Before
//                 kick-off: Preview (form, head-to-head), Lineups, Table, News. Live or
//                 finished: Timeline, Lineups, Stats, News.
// A live match refreshes itself every 30 seconds. Times are in the visitor's time zone.

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Article, FormGame, KeyEvent, Lineup, Match, MatchDetail, Player, Side, Stat, TableRow } from "@/lib/chelsea";

const TEAM = "363";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TILE_BG = "linear-gradient(155deg, #3d0a45 0%, #32073e 45%, #1e0525 100%)";

// ── Data ──────────────────────────────────────────────────────────────────────
// In development, ?match=<ESPN event id> on the page shows that match as live.
const demoId = () => (typeof window !== "undefined" && process.env.NODE_ENV !== "production" ? new URLSearchParams(window.location.search).get("match") : null);

function usePoll<T>(url: string | null, live: (d: T) => boolean) {
  const [data, setData] = useState<T | null | "error">(null);
  useEffect(() => {
    if (!url) return;
    let stop = false;
    let timer = 0;
    const load = () =>
      fetch(url)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: T) => {
          if (stop) return;
          setData(d);
          if (live(d)) timer = window.setTimeout(load, 30_000);
        })
        .catch(() => !stop && setData((p) => (p && p !== "error" ? p : "error")));
    load();
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return data;
}

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
const shortDate = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
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
function ago(iso: string, now: number) {
  const m = Math.max(1, Math.round((now - Date.parse(iso)) / 6e4));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return shortDate(new Date(iso));
}
const chelseaSide = (m: Match) => (m.home.isChelsea ? "home" : "away");

// ── Small parts ───────────────────────────────────────────────────────────────
function Crest({ src, size, className = "" }: { src: string; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} className={`shrink-0 object-contain ${className}`} style={{ width: size, height: size }} />;
}

function LiveDot({ className = "bg-[#ff4d6d]" }: { className?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${className}`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${className}`} />
    </span>
  );
}

function Status({ m, now, tone = "dark" }: { m: Match; now: number; tone?: "dark" | "light" }) {
  const base = tone === "dark" ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-surface text-heading ring-1 ring-line-soft";
  if (m.state === "in")
    return (
      <span className="inline-flex h-[24px] items-center gap-[6px] rounded-full bg-[#ff4d6d]/15 px-[10px] font-geist text-caption font-semibold text-[#ff8fa3] ring-1 ring-[#ff4d6d]/30 data-[tone=light]:text-[#d92d4b]" data-tone={tone}>
        <LiveDot />
        LIVE · {m.clock}
      </span>
    );
  if (m.state === "post") return <span className={`inline-flex h-[24px] items-center rounded-full px-[10px] font-geist text-caption font-medium ${base}`}>Full time</span>;
  return <span className={`inline-flex h-[24px] items-center rounded-full px-[10px] font-geist text-caption font-medium ${base}`}>{when(new Date(m.date), now)}</span>;
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
type View = { id: string; dir: 1 | -1 | 0 } | { id: null; dir: 1 | -1 | 0 };

const SHELL =
  "flex h-[min(680px,calc(100dvh-136px))] md:h-[min(680px,calc(100dvh-96px))] w-[calc(100vw-24px)] max-w-[440px] flex-col overflow-hidden rounded-[24px] bg-background shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.04),0_24px_56px_rgba(30,5,37,0.18)]";

export default function MatchCentreCard() {
  const demo = demoId();
  const fixtures = usePoll<Fixtures>(`/api/fixture${demo ? `?demo=${demo}` : ""}`, (d) => d.next[0]?.state === "in");
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
          <Overview data={data} now={now} onOpen={(id) => setView({ id, dir: 1 })} />
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
        <section className="px-[16px]">
          <SectionHead title="Form" aside="Last 5, oldest first" />
          <Form games={data.form} />
        </section>
      )}

      {later.length > 0 && (
        <section className="px-[16px]">
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
                    <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-surface ring-1 ring-line-soft">
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

      <p className="px-[16px] font-geist text-caption text-muted">Times in your time zone ({zone(new Date(m.date))}) · Data from ESPN</p>
    </div>
  );
}

function TileSide({ s, live }: { s: Side; live: boolean }) {
  return (
    <div className="flex w-[104px] flex-col items-center gap-[10px] text-center">
      <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.35)]">
        <Crest src={s.logo} size={44} />
      </span>
      <span className={`font-geist text-body font-medium leading-[18px] ${s.isChelsea || live ? "text-white" : "text-white/80"}`}>{s.name}</span>
    </div>
  );
}

function MatchTile({ m, now, onOpen }: { m: Match; now: number; onOpen: () => void }) {
  const at = new Date(m.date);
  const c = clock(at);
  const live = m.state !== "pre";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open match centre: ${m.home.name} v ${m.away.name}`}
      className="group relative isolate block w-full overflow-hidden rounded-[18px] text-left text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_12px_32px_rgba(30,5,37,0.28)] transition-transform duration-300 active:scale-[0.99]"
      style={{ background: TILE_BG }}
    >
      {/* Light from the top corner, and a faint pitch arc behind the score */}
      <span className="pointer-events-none absolute -right-[64px] -top-[80px] -z-10 h-[240px] w-[240px] rounded-full bg-grape/50 blur-[64px]" aria-hidden="true" />
      <svg className="pointer-events-none absolute left-1/2 top-[52px] -z-10 -translate-x-1/2 opacity-[0.08]" width="240" height="160" viewBox="0 0 240 160" aria-hidden="true">
        <circle cx="120" cy="80" r="56" fill="none" stroke="white" strokeWidth="1.5" />
        <line x1="120" y1="0" x2="120" y2="160" stroke="white" strokeWidth="1.5" />
        <circle cx="120" cy="80" r="3" fill="white" />
      </svg>

      <div className="flex items-center justify-between gap-[12px] px-[20px] pt-[18px]">
        <span className="truncate font-geist text-caption font-medium text-white/70">{comp(m.competition)}</span>
        <Status m={m} now={now} />
      </div>

      <div className="flex items-start justify-between px-[12px] pt-[24px]">
        <TileSide s={m.home} live={live} />
        <div className="flex min-w-0 flex-1 flex-col items-center pt-[12px]">
          {live ? (
            <>
              <span className="font-heading text-stat tabular-nums text-white">
                {m.home.score ?? 0}
                <span className="mx-[8px] text-white/40">–</span>
                {m.away.score ?? 0}
              </span>
              <span className="mt-[8px] font-geist text-caption text-white/60">{m.state === "in" ? (m.clock === "HT" ? "Half time" : "Live now") : day(at)}</span>
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
        <TileSide s={m.away} live={live} />
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
          Match centre
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
        <div key={l} className="flex items-baseline justify-center gap-[4px] rounded-[12px] bg-white/[0.07] py-[10px] ring-1 ring-inset ring-white/10">
          <span className="font-heading text-h2 tabular-nums text-white">{String(v).padStart(2, "0")}</span>
          <span className="font-geist text-[10px] leading-[12px] text-white/50">{l}</span>
        </div>
      ))}
    </div>
  );
}

const RESULT = {
  W: "bg-grape text-white",
  D: "bg-[#E5E7EB] text-primary",
  L: "bg-background text-secondary ring-1 ring-inset ring-line",
};

function Form({ games }: { games: FormGame[] }) {
  const sorted = [...games].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  return (
    <ol className="grid grid-cols-5 gap-[8px]">
      {sorted.map((g, i) => (
        <li key={g.date + i} className="flex flex-col items-center gap-[6px] rounded-[14px] py-[10px] ring-1 ring-line-soft">
          <Crest src={g.logo} size={20} />
          <span className={`flex h-[24px] w-[24px] items-center justify-center rounded-[8px] font-geist text-caption font-bold ${RESULT[g.result] ?? RESULT.D}`} title={g.result === "W" ? "Won" : g.result === "L" ? "Lost" : "Drew"}>
            {g.result}
          </span>
          <span className="font-geist text-[10px] leading-[12px] tabular-nums text-muted">{g.score}</span>
        </li>
      ))}
    </ol>
  );
}

// ── Match centre ──────────────────────────────────────────────────────────────
type Tab = "preview" | "timeline" | "lineups" | "stats" | "table" | "news";

function MatchView({ base, demo, now, onBack }: { base: Match; demo: boolean; now: number; onBack: () => void }) {
  const d = usePoll<MatchDetail>(`/api/fixture/match?id=${base.id}${demo ? "&demo=1" : ""}`, (x) => x.match.state === "in");
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
        <div role="tablist" aria-label="Match centre" className="mt-[14px] grid grid-cols-4 gap-[2px] rounded-full bg-surface p-[4px] ring-1 ring-inset ring-line-soft">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              data-sound-click="toggle"
              onClick={() => setTab(k)}
              className={`h-[32px] rounded-full font-geist text-caption font-medium transition-[background-color,color,box-shadow] duration-200 ${
                tab === k ? "bg-background text-heading shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_1px_3px_rgba(30,5,37,0.10)]" : "text-muted hover:text-heading"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div ref={body} role="tabpanel" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[16px] pb-[24px] pt-[20px]">
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

function Empty({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-[16px] py-[40px] text-center">
      {icon}
      <p className="mt-[12px] font-geist text-body font-semibold text-heading">{title}</p>
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
          <SectionHead title="Form" aside="Last 5" />
          <div className="flex flex-col gap-[8px]">
            {sides.map((s) => {
              const games = [...(d.form.find((f) => f.teamId === s.id)?.games ?? [])].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
              const pts = games.reduce((n, g) => n + (g.result === "W" ? 3 : g.result === "D" ? 1 : 0), 0);
              return (
                <div key={s.id} className="flex items-center gap-[12px] rounded-[14px] px-[12px] py-[10px] ring-1 ring-line-soft">
                  <Crest src={s.logo} size={24} />
                  <span className="min-w-0 flex-1 truncate font-geist text-body font-medium text-heading">{s.name}</span>
                  <span className="flex gap-[4px]">
                    {games.map((g, i) => (
                      <span key={i} title={`${g.result} ${g.score} ${g.home ? "vs" : "at"} ${g.opponent}`} className={`flex h-[24px] w-[24px] items-center justify-center rounded-[8px] font-geist text-caption font-bold ${RESULT[g.result] ?? RESULT.D}`}>
                        {g.result}
                      </span>
                    ))}
                  </span>
                  <span className="w-[40px] text-right font-geist text-caption tabular-nums text-muted">{pts} pts</span>
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
  return (
    <section>
      <SectionHead title="Head to head" aside={`Last ${d.h2h.length} meetings`} />
      <div className="rounded-[16px] p-[16px] ring-1 ring-line-soft">
        <div className="flex items-end justify-between">
          {[
            [won, "Chelsea wins"],
            [drew, "Draws"],
            [lost, "Losses"],
          ].map(([n, l]) => (
            <div key={l} className="flex flex-col items-center gap-[2px]">
              <span className="font-heading text-h1 tabular-nums text-heading">{n}</span>
              <span className="font-geist text-caption text-muted">{l}</span>
            </div>
          ))}
        </div>
        <div className="mt-[14px] flex h-[6px] gap-[2px] overflow-hidden rounded-full">
          <span className="bg-grape" style={{ width: `${(won / total) * 100}%` }} />
          <span className="bg-[#D4D2CF]" style={{ width: `${(drew / total) * 100}%` }} />
          <span className="bg-primary/30" style={{ width: `${(lost / total) * 100}%` }} />
        </div>
      </div>
      <ul className="mt-[8px] flex flex-col">
        {d.h2h.map((g) => (
          <li key={g.date} className="flex items-center gap-[10px] border-b border-line-soft py-[10px] last:border-b-0">
            <span className="w-[52px] font-geist text-caption tabular-nums text-muted">{shortDate(new Date(g.date))}</span>
            <span className="flex min-w-0 flex-1 items-center justify-end gap-[8px] text-right">
              <span className={`truncate font-geist text-body ${g.home.isChelsea ? "font-semibold text-heading" : "text-secondary"}`}>{g.home.name}</span>
              <Crest src={g.home.logo} size={20} />
            </span>
            <span className="rounded-[8px] bg-surface px-[8px] py-[2px] font-geist text-caption font-semibold tabular-nums text-heading">
              {g.home.score}–{g.away.score}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-[8px]">
              <Crest src={g.away.logo} size={20} />
              <span className={`truncate font-geist text-body ${g.away.isChelsea ? "font-semibold text-heading" : "text-secondary"}`}>{g.away.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function EventIcon({ kind }: { kind: KeyEvent["kind"] }) {
  if (kind === "yellow" || kind === "red")
    return <span className={`inline-block h-[14px] w-[10px] rounded-[2px] ${kind === "yellow" ? "bg-[#F5C518]" : "bg-[#E03131]"} shadow-[0_1px_2px_rgba(0,0,0,0.15)]`} aria-label={kind === "yellow" ? "Yellow card" : "Red card"} />;
  if (kind === "sub")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Substitution">
        <path d="M5 13V4m0 0L2 7m3-3 3 3" fill="none" stroke="#1f9d55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 3v9m0 0 3-3m-3 3-3-3" fill="none" stroke="#E03131" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-label={kind === "own-goal" ? "Own goal" : kind === "penalty" ? "Penalty goal" : "Goal"}>
      <circle cx="8" cy="8" r="7" fill="white" stroke={kind === "own-goal" ? "#E03131" : "#32073e"} strokeWidth="1.4" />
      <path d="M8 4.6 10.9 6.7 9.8 10.1H6.2L5.1 6.7Z" fill={kind === "own-goal" ? "#E03131" : "#32073e"} />
    </svg>
  );
}

const minuteValue = (s: string) => s.split("+").reduce((n, p) => n + (parseInt(p, 10) || 0) / (n ? 100 : 1), 0);

function Timeline({ d }: { d: MatchDetail }) {
  const live = d.match.state === "in";
  const events = [...d.events].sort((a, b) => minuteValue(a.minute) - minuteValue(b.minute));
  if (live) events.reverse();
  if (!events.length) return <Empty title="Nothing yet" body="Goals, cards and changes show here as they happen." />;
  const goals = events.filter((e) => e.kind !== "yellow" && e.kind !== "red" && e.kind !== "sub");
  const scorers = (home: boolean) => goals.filter((g) => g.home === home).map((g) => `${g.player.split(" ").pop()} ${g.minute}`);

  return (
    <div className="flex flex-col gap-[24px]">
      {goals.length > 0 && (
        <div className="grid grid-cols-2 gap-[12px] rounded-[16px] p-[14px] ring-1 ring-line-soft">
          {[true, false].map((h) => (
            <div key={String(h)} className={`flex flex-col gap-[2px] ${h ? "" : "text-right"}`}>
              {scorers(h).map((s) => (
                <span key={s} className="font-geist text-caption text-secondary">
                  {s}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      <ol className="relative flex flex-col gap-[4px]">
        <span className="absolute bottom-[12px] left-1/2 top-[12px] w-px -translate-x-1/2 bg-line-soft" aria-hidden="true" />
        {events.map((e, i) => {
          const isGoal = e.kind === "goal" || e.kind === "penalty" || e.kind === "own-goal";
          const text = (
            <span className={`flex min-w-0 items-center gap-[8px] ${e.home ? "flex-row-reverse text-right" : ""}`}>
              <EventIcon kind={e.kind} />
              <span className="min-w-0">
                <span className={`block truncate font-geist text-body ${isGoal ? "font-semibold text-heading" : "text-heading"}`}>{e.player}</span>
                {e.other && (
                  <span className="block truncate font-geist text-caption text-muted">
                    {e.kind === "sub" ? `Off: ${e.other}` : `Assist: ${e.other}`}
                  </span>
                )}
                {e.kind === "penalty" && <span className="block font-geist text-caption text-muted">Penalty</span>}
                {e.kind === "own-goal" && <span className="block font-geist text-caption text-muted">Own goal</span>}
              </span>
            </span>
          );
          return (
            <li key={i} className="relative grid grid-cols-[1fr_52px_1fr] items-center py-[8px]">
              <div className="flex justify-end">{e.home && text}</div>
              <div className="flex justify-center">
                <span className={`z-[1] min-w-[40px] rounded-full px-[6px] py-[2px] text-center font-geist text-caption font-semibold tabular-nums ${isGoal ? "bg-primary text-white" : "bg-background text-muted ring-1 ring-line-soft"}`}>{e.minute}</span>
              </div>
              <div className="flex justify-start">{!e.home && text}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Lineups: a pitch for one side at a time, then the bench ───────────────────
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

// Rows from the keeper up, each left to right, sized by the formation where it adds up
function rows(starters: Player[], formation?: string): Player[][] {
  const gk = starters.filter((p) => depthOf(p.pos) === 0).slice(0, 1);
  const out = starters.filter((p) => !gk.includes(p)).sort((a, b) => depthOf(a.pos) - depthOf(b.pos) || a.place - b.place);
  const counts = formation?.split("-").map(Number) ?? [];
  let lines: Player[][] = [];
  if (counts.length && counts.every(Boolean) && counts.reduce((a, b) => a + b, 0) === out.length) {
    let i = 0;
    lines = counts.map((n) => out.slice(i, (i += n)));
  } else {
    const by = new Map<number, Player[]>();
    for (const p of out) {
      const k = Math.round(depthOf(p.pos));
      by.set(k, [...(by.get(k) ?? []), p]);
    }
    lines = [...by.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  }
  return [gk, ...lines].map((l) => [...l].sort((a, b) => sideOf(a.pos) - sideOf(b.pos)));
}

function Lineups({ d }: { d: MatchDetail }) {
  const m = d.match;
  const [pick, setPick] = useState(m[chelseaSide(m)].id);
  const sides = [m.home, m.away];
  const lineup = d.lineups.find((l) => l.teamId === pick);
  if (!d.lineups.length)
    return (
      <div className="flex flex-col gap-[16px]">
        <Pitch faded />
        <p className="text-center font-geist text-body text-muted">Lineups are announced about an hour before kick-off.</p>
      </div>
    );
  return (
    <div className="flex flex-col gap-[16px]">
      <div role="tablist" aria-label="Team" className="grid grid-cols-2 gap-[6px]">
        {sides.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={pick === s.id}
            data-sound-click="toggle"
            onClick={() => setPick(s.id)}
            className={`flex h-[44px] items-center justify-center gap-[8px] rounded-[12px] font-geist text-body font-medium transition-[background-color,box-shadow,color] ${
              pick === s.id ? "bg-background text-heading shadow-[0_0_0_1.5px_#32073e]" : "text-muted ring-1 ring-inset ring-line-soft hover:text-heading"
            }`}
          >
            <Crest src={s.logo} size={20} />
            <span className="truncate">{s.name}</span>
          </button>
        ))}
      </div>
      {lineup && <Pitch lineup={lineup} />}
      {lineup && lineup.bench.length > 0 && <Bench players={lineup.bench} />}
    </div>
  );
}

function PitchLines() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 130" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" vectorEffect="non-scaling-stroke">
        <rect x="4" y="4" width="92" height="122" rx="1" />
        <line x1="4" y1="65" x2="96" y2="65" />
        <circle cx="50" cy="65" r="11" />
        <rect x="26" y="108" width="48" height="18" />
        <rect x="38" y="120" width="24" height="6" />
        <rect x="26" y="4" width="48" height="18" />
        <rect x="38" y="4" width="24" height="6" />
      </g>
    </svg>
  );
}

function Pitch({ lineup, faded }: { lineup?: Lineup; faded?: boolean }) {
  const lines = lineup ? rows(lineup.starters, lineup.formation) : [];
  return (
    <div className={`relative aspect-[100/130] w-full overflow-hidden rounded-[18px] ${faded ? "opacity-40" : ""}`} style={{ background: `repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0 10%, transparent 10% 20%), ${TILE_BG}` }}>
      <PitchLines />
      {lineup?.formation && <span className="absolute left-[14px] top-[12px] rounded-full bg-white/10 px-[8px] py-[2px] font-geist text-caption font-semibold tabular-nums text-white ring-1 ring-white/15">{lineup.formation}</span>}
      {/* Keeper at the bottom, attack at the top */}
      <div className="absolute inset-x-[8px] bottom-[16px] top-[40px] flex flex-col-reverse justify-between">
        {lines.map((line, i) => (
          <div key={i} className="flex justify-around">
            {line.map((p) => (
              <div key={p.number + p.name} className="flex w-[64px] flex-col items-center gap-[4px]">
                <span className="relative flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white font-geist text-caption font-bold tabular-nums text-heading shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                  {p.number}
                  {p.subOut && (
                    <span className="absolute -right-[4px] -top-[4px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#E03131] ring-2 ring-[#32073e]" aria-label="Substituted">
                      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                        <path d="M4 1v6m0 0L1.5 4.5M4 7l2.5-2.5" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate rounded-[6px] bg-black/25 px-[4px] font-geist text-[10px] font-medium leading-[14px] text-white">{p.short}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Bench({ players }: { players: Player[] }) {
  return (
    <section className="mt-[8px]">
      <SectionHead title="Bench" />
      <ul className="grid grid-cols-2 gap-x-[16px]">
        {players.map((p) => (
          <li key={p.number + p.name} className="flex items-center gap-[8px] border-b border-line-soft py-[8px]">
            <span className="w-[20px] font-geist text-caption tabular-nums text-muted">{p.number}</span>
            <span className="min-w-0 flex-1 truncate font-geist text-body text-heading">{p.name}</span>
            {p.subIn && (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-label="Came on">
                <path d="M6 10V2m0 0L3 5m3-3 3 3" fill="none" stroke="#1f9d55" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Stats: possession on top, then side-by-side bars ──────────────────────────
function Stats({ d }: { d: MatchDetail }) {
  const m = d.match;
  if (!d.stats.length) return <Empty title="No stats yet" body="Match stats fill in once the game is under way." />;
  const [poss, ...rest] = d.stats[0].pct ? d.stats : [undefined, ...d.stats];
  const tone = (s: Side) => (s.isChelsea ? "bg-grape" : "bg-primary");
  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-center justify-between">
        <Crest src={m.home.logo} size={24} />
        <span className="font-geist text-caption font-semibold uppercase tracking-[0.6px] text-heading">Team stats</span>
        <Crest src={m.away.logo} size={24} />
      </div>
      {poss && (
        <section>
          <div className="mb-[8px] flex items-baseline justify-between">
            <span className="font-heading text-h2 tabular-nums text-heading">{Math.round(poss.home)}%</span>
            <span className="font-geist text-caption text-muted">Possession</span>
            <span className="font-heading text-h2 tabular-nums text-heading">{Math.round(poss.away)}%</span>
          </div>
          <div className="flex h-[10px] gap-[4px]">
            <span className={`rounded-full ${tone(m.home)}`} style={{ width: `${poss.home}%` }} />
            <span className={`rounded-full ${tone(m.away)} opacity-30`} style={{ width: `${poss.away}%` }} />
          </div>
        </section>
      )}
      <ul className="flex flex-col gap-[16px]">
        {rest.map((s) => s && <StatRow key={s.label} s={s} home={m.home} away={m.away} />)}
      </ul>
    </div>
  );
}

function StatRow({ s, home, away }: { s: Stat; home: Side; away: Side }) {
  const max = Math.max(s.home, s.away, 1);
  const lead = s.home === s.away ? null : s.home > s.away ? "home" : "away";
  const value = (v: number, side: "home" | "away", t: Side) => (
    <span
      className={`min-w-[32px] rounded-full px-[8px] py-[2px] text-center font-geist text-caption font-semibold tabular-nums ${
        lead === side ? (t.isChelsea ? "bg-grape text-white" : "bg-primary text-white") : "text-heading"
      }`}
    >
      {v}
    </span>
  );
  return (
    <li>
      <div className="flex items-center justify-between">
        {value(s.home, "home", home)}
        <span className="font-geist text-caption text-secondary">{s.label}</span>
        {value(s.away, "away", away)}
      </div>
      <div className="mt-[6px] grid grid-cols-2 gap-[4px]">
        <div className="flex h-[4px] justify-end overflow-hidden rounded-full bg-line-soft">
          <span className={`rounded-full ${lead === "home" ? (home.isChelsea ? "bg-grape" : "bg-primary") : "bg-[#C9C5BF]"}`} style={{ width: `${(s.home / max) * 100}%` }} />
        </div>
        <div className="flex h-[4px] overflow-hidden rounded-full bg-line-soft">
          <span className={`rounded-full ${lead === "away" ? (away.isChelsea ? "bg-grape" : "bg-primary") : "bg-[#C9C5BF]"}`} style={{ width: `${(s.away / max) * 100}%` }} />
        </div>
      </div>
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
            <th className="w-[28px] pb-[8px] font-medium">#</th>
            <th className="pb-[8px] font-medium">Team</th>
            <th className="w-[32px] pb-[8px] text-right font-medium">P</th>
            <th className="w-[40px] pb-[8px] text-right font-medium">GD</th>
            <th className="w-[40px] pb-[8px] text-right font-medium">Pts</th>
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
          <img src={lead.image} alt="" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        )}
        <span className="block p-[14px]">
          <span className="block font-geist text-body-md font-semibold text-heading">{lead.headline}</span>
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
