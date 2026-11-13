"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Circle,
  CircleCheck,
  CircleDot,
  CircleX,
  Lock,
  MessageSquare,
  Search,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, type FeedbackCategory, type FeedbackStatus } from "@/lib/feedback/shared";
import { moveTo } from "./actions";

// ── Feedback board ────────────────────────────────────────────────────────────
// A full-screen board in the style of Linear and Jira. A top bar, a toolbar
// (search, case study, category, my tests) that filters instantly, and four
// columns that fill the width and scroll on their own under sticky headers.
// Cards: key and date, the comment, an image preview, case study and category
// chips, the reporter. Drag a card to another column, or open it (click / Enter)
// for the details panel. Moves show at once and save in the background.

export interface BoardCard {
  id: string;
  key: string;
  status: FeedbackStatus;
  test: boolean;
  caseStudy: string;
  where: string;
  snippet: string;
  text: string;
  name: string;
  category: FeedbackCategory | "";
  image: string;
  link: string;
  createdAt: number;
}

const COLUMNS: { status: FeedbackStatus; label: string; icon: LucideIcon; tone: string; empty: string }[] = [
  { status: "open", label: "To do", icon: Circle, tone: "text-muted", empty: "New feedback lands here" },
  { status: "doing", label: "In progress", icon: CircleDot, tone: "text-[#c98a0b]", empty: "Drop a card here while you fix it" },
  { status: "done", label: "Done", icon: CircleCheck, tone: "text-success", empty: "Fixed feedback ends up here" },
  { status: "wontdo", label: "Won't do", icon: CircleX, tone: "text-muted", empty: "Feedback you decided against" },
];
const COLUMN = Object.fromEntries(COLUMNS.map((c) => [c.status, c])) as Record<FeedbackStatus, (typeof COLUMNS)[number]>;

const CATEGORY_DOT: Record<FeedbackCategory, string> = {
  bug: "bg-[#c5444a]",
  accessibility: "bg-[#3d6ad6]",
  content: "bg-success",
  visual: "bg-grape",
};

const when = (ms: number, long = false) =>
  new Date(ms).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    ...(long ? { year: "numeric", hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  });

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

function Avatar({ name, size = 20 }: { name: string; size?: number }) {
  return name ? (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-primary font-medium text-white"
      style={{ width: size, height: size, fontSize: size <= 20 ? 10 : 12 }}
      title={name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-[#ece8ef] text-muted"
      style={{ width: size, height: size }}
      title="Anonymous"
      aria-hidden="true"
    >
      <User size={size - 8} aria-hidden="true" />
    </span>
  );
}

/** An image that hides itself if it can't load, even if it failed before the page woke up */
function SafeImg({ src, alt, className, href }: { src: string; alt: string; className: string; href?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element -- private image served by the inbox route
  const img = <img ref={ref} src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {img}
    </a>
  ) : (
    img
  );
}

function CategoryChip({ category }: { category: FeedbackCategory | "" }) {
  if (!category) return null;
  return (
    <span className="flex h-[20px] w-fit items-center gap-[6px] rounded-sm border border-[#e7e2ea] px-[6px] text-[12px] leading-[16px] text-secondary">
      <span className={`h-[6px] w-[6px] rounded-full ${CATEGORY_DOT[category]}`} aria-hidden="true" />
      {CATEGORIES[category]}
    </span>
  );
}

function CaseStudyChip({ name }: { name: string }) {
  return (
    <span className="flex h-[20px] w-fit min-w-0 max-w-full items-center gap-1 rounded-sm border border-[#e7e2ea] px-[6px] text-[12px] leading-[16px] text-secondary">
      <BookOpen size={12} className="shrink-0 text-muted" aria-hidden="true" />
      <span className="truncate">{name}</span>
    </span>
  );
}

const control =
  "h-[32px] rounded-md border border-[#e3dee6] bg-background px-[10px] text-[14px] text-secondary outline-none transition-colors hover:border-[#cfc6d4] focus-visible:border-grape";

export default function Board({ cards: initial, lockAction }: { cards: BoardCard[]; lockAction: (() => Promise<void>) | null }) {
  const [cards, setCards] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<FeedbackStatus | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [caseStudy, setCaseStudy] = useState("");
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [tests, setTests] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setCards(initial), [initial]);

  const move = (id: string, status: FeedbackStatus) => {
    const before = cards.find((c) => c.id === id);
    if (!before || before.status === status) return;
    setError(false);
    setCards((list) => list.map((c) => (c.id === id ? { ...c, status } : c)));
    startTransition(async () => {
      const res = await moveTo(id, status).catch(() => ({ ok: false }));
      if (!res.ok) {
        setCards((list) => list.map((c) => (c.id === id ? { ...c, status: before.status } : c)));
        setError(true);
      }
    });
  };

  const pool = useMemo(() => cards.filter((c) => c.test === tests), [cards, tests]);
  const caseStudies = useMemo(() => Array.from(new Set(cards.map((c) => c.caseStudy))).sort(), [cards]);
  const testCount = useMemo(() => cards.filter((c) => c.test).length, [cards]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter(
      (c) =>
        (!caseStudy || c.caseStudy === caseStudy) &&
        (!category || c.category === category) &&
        (!q || [c.key, c.text, c.caseStudy, c.where, c.name, c.snippet].some((v) => v.toLowerCase().includes(q))),
    );
  }, [pool, query, caseStudy, category]);

  const filtered = Boolean(query || caseStudy || category);
  const unfinished = pool.filter((c) => c.status === "open" || c.status === "doing").length;
  const opened = cards.find((c) => c.id === openId) ?? null;

  const openCard = (id: string) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setOpenId(id);
  };
  const closeCard = () => {
    setOpenId(null);
    lastFocus.current?.focus();
  };

  // The details panel closes on Esc and takes focus when it opens
  useEffect(() => {
    if (!opened) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCard();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-dvh flex-col bg-[#fbfafc] font-body text-text-base">
      {/* Top bar */}
      <header className="flex h-[56px] shrink-0 items-center gap-3 border-b border-[#ebe7ee] bg-background px-4 md:px-6">
        <span className="grid h-[28px] w-[28px] place-items-center rounded-md bg-midnight text-white" aria-hidden="true">
          <MessageSquare size={14} fill="currentColor" />
        </span>
        <h1 className="text-[16px] font-medium leading-[24px] text-heading">Feedback</h1>
        <span className="text-[14px] leading-[20px] text-muted">
          {unfinished} open · {pool.length} total
        </span>
        {lockAction && (
          <form action={lockAction} className="ml-auto">
            <button type="submit" className="flex h-[32px] items-center gap-2 rounded-md px-3 text-[14px] text-muted hover:bg-[#f2eff4] hover:text-heading">
              <Lock size={14} aria-hidden="true" />
              Lock
            </button>
          </form>
        )}
      </header>

      {/* Toolbar: everything filters instantly */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#ebe7ee] bg-background px-4 py-2 md:px-6">
        <label className={`${control} flex w-full max-w-[240px] items-center gap-2 focus-within:border-grape`}>
          <Search size={14} className="shrink-0 text-muted" aria-hidden="true" />
          <span className="sr-only">Search feedback</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-text-base outline-none placeholder:text-muted"
          />
        </label>
        <label className="sr-only" htmlFor="fb-filter-case">
          Case study
        </label>
        <select id="fb-filter-case" value={caseStudy} onChange={(e) => setCaseStudy(e.target.value)} className={`${control} cursor-pointer`}>
          <option value="">All case studies</option>
          {caseStudies.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="fb-filter-cat">
          Category
        </label>
        <select
          id="fb-filter-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value as FeedbackCategory | "")}
          className={`${control} cursor-pointer`}
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCaseStudy("");
              setCategory("");
            }}
            className="h-[32px] rounded-md px-3 text-[14px] text-muted hover:bg-[#f2eff4] hover:text-heading"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          aria-pressed={tests}
          onClick={() => setTests((t) => !t)}
          className={`ml-auto h-[32px] rounded-md border px-3 text-[14px] transition-colors ${
            tests ? "border-midnight bg-midnight text-white" : "border-[#e3dee6] bg-background text-secondary hover:border-[#cfc6d4]"
          }`}
        >
          {tests ? "Showing my tests" : `My tests · ${testCount}`}
        </button>
      </div>

      {error && (
        <p role="alert" className="shrink-0 bg-[#fbe9ea] px-4 py-2 text-[14px] text-[#a8343a] md:px-6">
          Couldn&apos;t move that card, so it&apos;s back where it was. Try again.
        </p>
      )}

      {/* Board: columns fill the width; each scrolls on its own */}
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="flex h-full min-w-max gap-3 p-4 md:px-6 lg:min-w-0">
          {COLUMNS.map((col) => {
            const list = shown.filter((c) => c.status === col.status).sort((a, b) => b.createdAt - a.createdAt);
            const Icon = col.icon;
            return (
              <section
                key={col.status}
                aria-label={`${col.label}, ${list.length}`}
                data-over={over === col.status}
                className="flex h-full w-[292px] flex-col rounded-xl bg-[#f3f1f5] transition-[background-color,box-shadow] data-[over=true]:bg-grape-light/50 data-[over=true]:shadow-[inset_0_0_0_2px_rgba(157,19,106,0.32)] lg:w-auto lg:min-w-[208px] lg:flex-1"
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (over !== col.status) setOver(col.status);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain") || dragging;
                  if (id) move(id, col.status);
                  setDragging(null);
                  setOver(null);
                }}
              >
                <header className="flex h-[44px] shrink-0 items-center gap-2 px-3">
                  <Icon size={16} className={col.tone} aria-hidden="true" />
                  <h2 className="text-[14px] font-medium leading-[20px] text-heading">{col.label}</h2>
                  <span className="text-[14px] leading-[20px] text-muted tabular-nums">{list.length}</span>
                </header>

                <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                  {list.length === 0 && (
                    <li className="grid h-[96px] place-items-center rounded-lg border border-dashed border-[#ddd5e2] px-4 text-center text-[12px] leading-[16px] text-muted">
                      {filtered ? "Nothing matches the filters" : col.empty}
                    </li>
                  )}
                  {list.map((c) => (
                    <li key={c.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        draggable
                        data-dragging={dragging === c.id}
                        aria-label={`${c.key}: ${c.text}. Open details`}
                        onClick={() => openCard(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openCard(c.id);
                          }
                        }}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", c.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragging(c.id);
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setOver(null);
                        }}
                        className="flex cursor-pointer select-none flex-col gap-2 rounded-lg border border-[#e7e2ea] bg-background p-3 shadow-[0_1px_2px_rgba(30,5,37,0.04)] outline-none transition-[border-color,box-shadow,opacity] hover:border-[#d4cad9] hover:shadow-[0_2px_8px_rgba(30,5,37,0.08)] focus-visible:border-grape focus-visible:shadow-[0_0_0_2px_rgba(157,19,106,0.24)] data-[dragging=true]:opacity-40"
                      >
                        <div className="flex items-center gap-2 text-[12px] leading-[16px] text-muted">
                          <span className="font-medium tabular-nums">{c.key}</span>
                          <span aria-hidden="true">·</span>
                          <span>{when(c.createdAt)}</span>
                          <span className="ml-auto">
                            <Avatar name={c.name} />
                          </span>
                        </div>
                        <p className="line-clamp-3 text-[14px] leading-[20px] text-heading [overflow-wrap:anywhere]">{c.text}</p>
                        {c.image && <SafeImg src={c.image} alt="" className="h-[88px] w-full rounded-md border border-[#ebe7ee] object-cover" />}
                        <div className="flex min-w-0 flex-wrap items-center gap-1">
                          <CaseStudyChip name={c.caseStudy} />
                          <CategoryChip category={c.category} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      {/* Details panel, like opening an issue */}
      {opened && (
        <>
          <div className="fixed inset-0 z-40 bg-midnight/10" onClick={closeCard} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-issue-title"
            className="fixed inset-y-2 right-2 z-50 flex w-[calc(100%-16px)] max-w-[520px] flex-col overflow-hidden rounded-xl border border-[#ebe7ee] bg-background shadow-[0_16px_48px_rgba(30,5,37,0.18)]"
          >
            <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-[#ebe7ee] px-5">
              <span className="text-[14px] font-medium text-muted tabular-nums">{opened.key}</span>
              <a
                href={opened.link}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex h-[32px] items-center gap-1 rounded-md px-3 text-[14px] text-secondary hover:bg-[#f2eff4] hover:text-heading"
              >
                Show on page
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCard}
                className="grid h-[32px] w-[32px] place-items-center rounded-md text-muted hover:bg-[#f2eff4] hover:text-heading"
                aria-label="Close details"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
              <h2 id="fb-issue-title" className="whitespace-pre-wrap text-[20px] font-medium leading-[28px] text-heading [overflow-wrap:anywhere]">
                {opened.text}
              </h2>

              {opened.image && (
                <SafeImg src={opened.image} href={opened.image} alt={`Image attached to ${opened.key}`} className="w-full rounded-lg border border-[#ebe7ee]" />
              )}

              {opened.snippet && (
                <figure className="flex flex-col gap-2">
                  <figcaption className="text-[12px] font-medium leading-[16px] text-muted">Commented on</figcaption>
                  <blockquote className="rounded-md border-l-2 border-grape bg-[#faf7fb] px-3 py-2 text-[14px] leading-[22px] text-secondary">
                    {opened.snippet}
                  </blockquote>
                </figure>
              )}

              <dl className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-t border-[#ebe7ee] pt-5 text-[14px] leading-[20px]">
                <dt className="text-muted">Status</dt>
                <dd>
                  <label className="sr-only" htmlFor="fb-issue-status">
                    Status
                  </label>
                  <span className="relative inline-flex items-center">
                    {(() => {
                      const Icon = COLUMN[opened.status].icon;
                      return <Icon size={14} className={`pointer-events-none absolute left-[10px] ${COLUMN[opened.status].tone}`} aria-hidden="true" />;
                    })()}
                    <select
                      id="fb-issue-status"
                      value={opened.status}
                      onChange={(e) => move(opened.id, e.target.value as FeedbackStatus)}
                      className={`${control} cursor-pointer pl-[30px] text-heading`}
                    >
                      {COLUMNS.map((o) => (
                        <option key={o.status} value={o.status}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </span>
                </dd>
                <dt className="text-muted">Case study</dt>
                <dd>
                  <CaseStudyChip name={opened.caseStudy} />
                </dd>
                <dt className="text-muted">Where</dt>
                <dd className="text-heading">{opened.where}</dd>
                <dt className="text-muted">Category</dt>
                <dd>{opened.category ? <CategoryChip category={opened.category} /> : <span className="text-muted">None</span>}</dd>
                <dt className="text-muted">Reporter</dt>
                <dd className="flex items-center gap-2 text-heading">
                  <Avatar name={opened.name} size={24} />
                  {opened.name || "Anonymous"}
                </dd>
                <dt className="text-muted">Created</dt>
                <dd className="text-heading">{when(opened.createdAt, true)}</dd>
              </dl>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
