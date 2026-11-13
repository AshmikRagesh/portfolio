"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Accessibility, ArrowUpRight, Bug, MessageSquare, Palette, Search, Type, X, type LucideIcon } from "lucide-react";
import { CATEGORIES, type FeedbackCategory, type FeedbackStatus } from "@/lib/feedback/shared";
import { moveTo } from "./actions";

// ── Feedback board ────────────────────────────────────────────────────────────
// A Jira-style board: four columns, compact cards with a key (FB-12), the comment
// as the summary, lozenges for the case study and category, and the reporter's
// initials. Drag a card to another column, or open it (click / Enter) for the
// details panel, where its status can also be changed. Moves show at once and save
// in the background; a failed save puts the card back.

export interface BoardCard {
  id: string;
  key: string;
  status: FeedbackStatus;
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

const COLUMNS: { status: FeedbackStatus; label: string; empty: string }[] = [
  { status: "open", label: "To do", empty: "New feedback lands here" },
  { status: "doing", label: "In progress", empty: "Drag a card here while you fix it" },
  { status: "done", label: "Done", empty: "Fixed feedback" },
  { status: "wontdo", label: "Won't do", empty: "Decided against" },
];

// Category lozenges and type icons, like Jira's issue types
const CATEGORY_STYLE: Record<FeedbackCategory, { icon: LucideIcon; lozenge: string; icon_bg: string }> = {
  bug: { icon: Bug, lozenge: "bg-[#fbe9ea] text-[#a8343a]", icon_bg: "bg-[#c5444a]" },
  accessibility: { icon: Accessibility, lozenge: "bg-[#e6eefc] text-[#2a4f9a]", icon_bg: "bg-[#3d6ad6]" },
  content: { icon: Type, lozenge: "bg-success-bg text-[#0a7037]", icon_bg: "bg-success" },
  visual: { icon: Palette, lozenge: "bg-grape-light text-primary", icon_bg: "bg-grape" },
};

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  open: "bg-[#eceaee] text-secondary",
  doing: "bg-[#e6eefc] text-[#2a4f9a]",
  done: "bg-success-bg text-[#0a7037]",
  wontdo: "bg-[#eceaee] text-muted",
};

const when = (ms: number, long = false) =>
  new Date(ms).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    ...(long ? { year: "numeric", hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  });

const initials = (name: string) =>
  name === "Anonymous"
    ? "?"
    : name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

function TypeIcon({ category, size = 16 }: { category: FeedbackCategory | ""; size?: number }) {
  const style = category ? CATEGORY_STYLE[category] : null;
  const Icon = style?.icon ?? MessageSquare;
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xs text-white ${style?.icon_bg ?? "bg-muted"}`}
      style={{ width: size, height: size }}
      title={category ? CATEGORIES[category] : "No category"}
    >
      <Icon size={size - 6} strokeWidth={2.5} aria-hidden="true" />
    </span>
  );
}

/** An image that hides itself if it can't load, even if it failed before the page woke up */
function SafeImg({ src, alt, className }: { src: string; alt: string; className: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element -- private image served by the inbox route
  return <img ref={ref} src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
}

function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-primary font-medium text-white"
      style={{ width: size, height: size, fontSize: size <= 24 ? 10 : 12 }}
      title={name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export default function Board({ cards: initial }: { cards: BoardCard[] }) {
  const [cards, setCards] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<FeedbackStatus | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const closeRef = useRef<HTMLButtonElement>(null);

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

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => [c.key, c.text, c.caseStudy, c.where, c.name, c.snippet].some((v) => v.toLowerCase().includes(q)));
  }, [cards, query]);

  const opened = cards.find((c) => c.id === openId) ?? null;

  // The details panel closes on Esc and takes focus when it opens
  useEffect(() => {
    if (!opened) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [opened]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-[36px] w-full max-w-[280px] items-center gap-2 rounded-md border border-line bg-background px-3 text-muted focus-within:border-grape">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search feedback</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this board"
            className="w-full bg-transparent text-body text-text-base outline-none placeholder:text-muted"
          />
        </label>
        {error && <p className="text-caption text-warning">Couldn&apos;t move that card, so it&apos;s back where it was.</p>}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
        <div className="flex gap-3">
          {COLUMNS.map((col) => {
            const list = shown.filter((c) => c.status === col.status).sort((a, b) => b.createdAt - a.createdAt);
            return (
              <section
                key={col.status}
                aria-label={`${col.label}, ${list.length}`}
                data-over={over === col.status}
                className="flex w-[268px] shrink-0 flex-col gap-2 rounded-lg bg-[#f4f2f5] p-2 transition-colors data-[over=true]:bg-grape-light/60 data-[over=true]:outline data-[over=true]:outline-2 data-[over=true]:outline-grape/40"
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  setOver(col.status);
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
                <header className="flex h-[32px] items-center gap-2 px-2">
                  <h2 className="text-[12px] font-medium uppercase leading-[16px] tracking-[0.04em] text-secondary">{col.label}</h2>
                  <span className="rounded-full bg-[#e4e0e6] px-2 text-[12px] leading-[20px] text-secondary tabular-nums">{list.length}</span>
                </header>

                <ul className="flex min-h-[120px] flex-col gap-2">
                  {list.length === 0 && (
                    <li className="grid h-[88px] place-items-center rounded-md border border-dashed border-line text-center text-caption text-muted">
                      {col.empty}
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
                        onClick={() => setOpenId(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpenId(c.id);
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
                        className="flex cursor-pointer flex-col gap-3 rounded-md bg-background p-3 shadow-[0_1px_1px_rgba(30,5,37,0.12),0_0_1px_rgba(30,5,37,0.24)] outline-none transition-[background-color,opacity,box-shadow] hover:bg-[#fbf9fc] focus-visible:ring-2 focus-visible:ring-grape data-[dragging=true]:opacity-40"
                      >
                        <p className="line-clamp-3 text-body text-text-base [overflow-wrap:anywhere]">{c.text}</p>
                        {c.image && <SafeImg src={c.image} alt="" className="h-[96px] w-full rounded-sm object-cover" />}
                        <div className="flex flex-wrap gap-1">
                          <span className="max-w-full truncate rounded-sm bg-[#eceaee] px-[6px] text-[12px] font-medium uppercase leading-[20px] tracking-[0.02em] text-secondary">
                            {c.caseStudy}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TypeIcon category={c.category} />
                          <span className="text-[12px] font-medium leading-[16px] text-muted tabular-nums">{c.key}</span>
                          <span className="ml-auto text-[12px] leading-[16px] text-muted">{when(c.createdAt)}</span>
                          <Avatar name={c.name} />
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

      {/* Details panel, like opening a Jira issue */}
      {opened && (
        <>
          <div className="fixed inset-0 z-40 bg-midnight/20" onClick={() => setOpenId(null)} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-issue-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col overflow-y-auto bg-background shadow-[-16px_0_40px_rgba(30,5,37,0.16)]"
          >
            <div className="flex items-center gap-2 border-b border-line-soft px-6 py-4">
              <TypeIcon category={opened.category} />
              <span className="text-caption font-medium text-muted tabular-nums">{opened.key}</span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpenId(null)}
                className="ml-auto grid h-[32px] w-[32px] place-items-center rounded-md text-muted hover:bg-surface hover:text-heading"
                aria-label="Close details"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 py-6">
              <h2 id="fb-issue-title" className="whitespace-pre-wrap font-heading text-h4 text-heading md:text-h4-md [overflow-wrap:anywhere]">
                {opened.text}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="fb-issue-status">
                  Status
                </label>
                <select
                  id="fb-issue-status"
                  value={opened.status}
                  onChange={(e) => move(opened.id, e.target.value as FeedbackStatus)}
                  className={`h-[32px] cursor-pointer rounded-md border-0 px-3 text-caption font-medium uppercase tracking-[0.02em] outline-none focus-visible:ring-2 focus-visible:ring-grape ${STATUS_STYLE[opened.status]}`}
                >
                  {COLUMNS.map((o) => (
                    <option key={o.status} value={o.status}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <a
                  href={opened.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-[32px] items-center gap-1 rounded-md border border-line px-3 text-caption text-secondary hover:border-grape hover:text-grape"
                >
                  Show on page
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>

              {opened.image && (
                <a href={opened.image} target="_blank" rel="noreferrer" className="block">
                  <SafeImg src={opened.image} alt={`Image attached to ${opened.key}`} className="w-full rounded-md border border-line-soft" />
                </a>
              )}

              {opened.snippet && (
                <div className="flex flex-col gap-2">
                  <p className="text-caption font-medium text-muted">Commented on</p>
                  <p className="border-l-2 border-grape pl-3 text-body text-secondary">“{opened.snippet}”</p>
                </div>
              )}

              <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-md border border-line-soft p-4 text-caption">
                <dt className="text-muted">Case study</dt>
                <dd className="text-text-base">{opened.caseStudy}</dd>
                <dt className="text-muted">Where</dt>
                <dd className="text-text-base">{opened.where}</dd>
                <dt className="text-muted">Category</dt>
                <dd>
                  {opened.category ? (
                    <span className={`rounded-sm px-[6px] py-[2px] font-medium ${CATEGORY_STYLE[opened.category].lozenge}`}>
                      {CATEGORIES[opened.category]}
                    </span>
                  ) : (
                    <span className="text-muted">None</span>
                  )}
                </dd>
                <dt className="text-muted">Reporter</dt>
                <dd className="flex items-center gap-2 text-text-base">
                  <Avatar name={opened.name} />
                  {opened.name}
                </dd>
                <dt className="text-muted">Created</dt>
                <dd className="text-text-base">{when(opened.createdAt, true)}</dd>
              </dl>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
