"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleDot,
  CircleX,
  FlaskConical,
  ImageIcon,
  Lock,
  MapPin,
  MessageSquare,
  Search,
  Tag,
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
// Every picker is our own menu (no system dropdowns), so they all look the same.

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

/* ── Small pieces ─────────────────────────────────────────────────────────── */

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
function SafeImg({
  src,
  alt,
  className,
  href,
  frame,
}: {
  src: string;
  alt: string;
  className: string;
  href?: string;
  /** Wraps the image (e.g. a titled section) and disappears with it if it fails */
  frame?: (img: ReactNode) => ReactNode;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element -- private image served by the inbox route
  const img = <img ref={ref} src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
  const linked = href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {img}
    </a>
  ) : (
    img
  );
  return <>{frame ? frame(linked) : linked}</>;
}

const Dot = ({ category }: { category: FeedbackCategory }) => (
  <span className={`h-[8px] w-[8px] shrink-0 rounded-full ${CATEGORY_DOT[category]}`} aria-hidden="true" />
);

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[22px] w-fit min-w-0 max-w-full items-center gap-[6px] rounded-md bg-[#f4f1f6] px-2 text-[12px] leading-[16px] text-secondary">
      {children}
    </span>
  );
}

/* ── Our own menu, used for every picker ──────────────────────────────────── */

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

function Menu<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
  placeholder,
  align = "left",
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  icon?: ReactNode;
  placeholder?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value);
  const filled = Boolean(placeholder) && Boolean(value);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const show = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const choose = (v: T) => {
    onChange(v);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current?.label ?? placeholder ?? ""}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show();
          }
        }}
        className={`flex h-[32px] items-center gap-2 rounded-md border px-[10px] text-[14px] leading-[20px] outline-none transition-colors focus-visible:border-grape focus-visible:shadow-[0_0_0_3px_rgba(157,19,106,0.12)] ${
          filled
            ? "border-[#e6cfe0] bg-[#fbf3f9] text-primary hover:border-[#d8b4cd]"
            : "border-[#e6e1e9] bg-background text-secondary hover:border-[#d3cad8] hover:bg-[#fbfafc]"
        } ${open ? "border-[#d3cad8] bg-[#fbfafc]" : ""}`}
      >
        {current?.icon ?? icon}
        <span className="whitespace-nowrap">{current && (current.value || !placeholder) ? current.label : placeholder}</span>
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((a) => (a + 1) % options.length);
            else if (e.key === "ArrowUp") setActive((a) => (a - 1 + options.length) % options.length);
            else if (e.key === "Enter" || e.key === " ") choose(options[active].value);
            else if (e.key === "Escape" || e.key === "Tab") {
              setOpen(false);
              if (e.key === "Escape") buttonRef.current?.focus();
            } else return;
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`absolute top-[calc(100%+4px)] z-30 min-w-[200px] rounded-lg border border-[#ebe7ee] bg-background p-1 shadow-[0_8px_24px_rgba(30,5,37,0.12)] outline-none ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((o, i) => (
            <li
              key={o.value || "all"}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              data-active={i === active}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(o.value)}
              className="flex h-[32px] cursor-pointer items-center gap-2 rounded-md px-2 text-[14px] leading-[20px] text-secondary data-[active=true]:bg-[#f4f1f6] data-[active=true]:text-heading"
            >
              <span className="grid w-[16px] shrink-0 place-items-center">{o.icon}</span>
              <span className="flex-1 whitespace-nowrap">{o.label}</span>
              {o.value === value && <Check size={14} className="text-grape" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const STATUS_OPTIONS: Option<FeedbackStatus>[] = COLUMNS.map((c) => ({
  value: c.status,
  label: c.label,
  icon: <c.icon size={14} className={c.tone} aria-hidden="true" />,
}));

const CATEGORY_OPTIONS: Option<FeedbackCategory | "">[] = [
  { value: "", label: "All categories", icon: <Tag size={14} className="text-muted" aria-hidden="true" /> },
  ...(Object.keys(CATEGORIES) as FeedbackCategory[]).map((k) => ({ value: k, label: CATEGORIES[k], icon: <Dot category={k} /> })),
];

/* ── Board ────────────────────────────────────────────────────────────────── */

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
  const searchRef = useRef<HTMLInputElement>(null);

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

  // "/" jumps to search, like Linear
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if (e.key === "/" && !typing && !openId) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  const caseOptions: Option<string>[] = [
    { value: "", label: "All case studies", icon: <BookOpen size={14} className="text-muted" aria-hidden="true" /> },
    ...caseStudies.map((name) => ({ value: name, label: name, icon: <BookOpen size={14} className="text-muted" aria-hidden="true" /> })),
  ];

  return (
    <div className="flex h-dvh flex-col bg-[#fbfafc] font-body text-text-base">
      {/* Top bar */}
      <header className="flex h-[56px] shrink-0 items-center gap-3 border-b border-[#ebe7ee] bg-background px-4 md:px-6">
        <span className="grid h-[28px] w-[28px] place-items-center rounded-md bg-midnight text-white" aria-hidden="true">
          <MessageSquare size={14} fill="currentColor" />
        </span>
        <h1 className="text-[16px] font-medium leading-[24px] text-heading">Feedback</h1>
        <span className="hidden h-[20px] w-px bg-[#ebe7ee] sm:block" aria-hidden="true" />
        <span className="hidden text-[14px] leading-[20px] text-muted sm:block">
          <span className="text-heading">{unfinished}</span> open · {pool.length} total
        </span>
        {lockAction && (
          <form action={lockAction} className="ml-auto">
            <button type="submit" className="flex h-[32px] items-center gap-2 rounded-md px-3 text-[14px] text-muted hover:bg-[#f4f1f6] hover:text-heading">
              <Lock size={14} aria-hidden="true" />
              Lock
            </button>
          </form>
        )}
      </header>

      {/* Toolbar: everything filters instantly */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#ebe7ee] bg-background px-4 py-[10px] md:px-6">
        <label className="group flex h-[32px] w-full max-w-[260px] items-center gap-2 rounded-md border border-[#e6e1e9] bg-[#fbfafc] px-[10px] transition-colors hover:border-[#d3cad8] focus-within:border-grape focus-within:bg-background focus-within:shadow-[0_0_0_3px_rgba(157,19,106,0.12)]">
          <Search size={14} className="shrink-0 text-muted" aria-hidden="true" />
          <span className="sr-only">Search feedback</span>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && (setQuery(""), searchRef.current?.blur())}
            placeholder="Search feedback"
            className="w-full bg-transparent text-[14px] leading-[20px] text-heading outline-none placeholder:text-muted"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-sm text-muted hover:bg-[#f0ecf2] hover:text-heading" aria-label="Clear search">
              <X size={12} aria-hidden="true" />
            </button>
          ) : (
            <kbd className="grid h-[20px] min-w-[20px] shrink-0 place-items-center rounded-sm border border-[#e6e1e9] bg-background px-1 font-body text-[12px] leading-[16px] text-muted" aria-hidden="true">
              /
            </kbd>
          )}
        </label>
        <Menu label="Case study" value={caseStudy} options={caseOptions} onChange={setCaseStudy} placeholder="Case study" />
        <Menu label="Category" value={category} options={CATEGORY_OPTIONS} onChange={setCategory} placeholder="Category" />
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCaseStudy("");
              setCategory("");
            }}
            className="h-[32px] rounded-md px-[10px] text-[14px] text-muted hover:bg-[#f4f1f6] hover:text-heading"
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          aria-pressed={tests}
          onClick={() => setTests((t) => !t)}
          className={`ml-auto flex h-[32px] items-center gap-2 rounded-md border px-[10px] text-[14px] transition-colors ${
            tests
              ? "border-[#e6cfe0] bg-[#fbf3f9] text-primary"
              : "border-[#e6e1e9] bg-background text-secondary hover:border-[#d3cad8] hover:bg-[#fbfafc]"
          }`}
        >
          <FlaskConical size={14} className={tests ? "text-grape" : "text-muted"} aria-hidden="true" />
          My tests
          <span className="rounded-sm bg-[#f0ecf2] px-[6px] text-[12px] leading-[18px] text-muted tabular-nums">{testCount}</span>
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
                        className="flex cursor-pointer select-none flex-col gap-2 rounded-lg border border-[#e9e4ec] bg-background p-3 shadow-[0_1px_2px_rgba(30,5,37,0.04)] outline-none transition-[border-color,box-shadow,opacity] hover:border-[#d6ccdb] hover:shadow-[0_2px_8px_rgba(30,5,37,0.08)] focus-visible:border-grape focus-visible:shadow-[0_0_0_3px_rgba(157,19,106,0.16)] data-[dragging=true]:opacity-40"
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
                          <Chip>
                            <BookOpen size={12} className="shrink-0 text-muted" aria-hidden="true" />
                            <span className="truncate">{c.caseStudy}</span>
                          </Chip>
                          {c.category && (
                            <Chip>
                              <Dot category={c.category} />
                              {CATEGORIES[c.category]}
                            </Chip>
                          )}
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

      {/* Details panel, like opening an issue in Linear */}
      {opened && (
        <>
          <div className="fixed inset-0 z-40 bg-midnight/10" onClick={closeCard} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-issue-title"
            className="fixed inset-y-2 right-2 z-50 flex w-[calc(100%-16px)] max-w-[520px] flex-col overflow-hidden rounded-xl border border-[#ebe7ee] bg-background shadow-[0_16px_48px_rgba(30,5,37,0.18)]"
          >
            {/* Breadcrumb and actions */}
            <div className="flex h-[52px] shrink-0 items-center gap-1 border-b border-[#ebe7ee] px-4">
              <span className="flex min-w-0 items-center gap-1 text-[14px] leading-[20px] text-muted">
                <BookOpen size={14} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{opened.caseStudy}</span>
                <ChevronRight size={14} className="shrink-0" aria-hidden="true" />
                <span className="shrink-0 font-medium text-heading tabular-nums">{opened.key}</span>
              </span>
              <a
                href={opened.link}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex h-[32px] shrink-0 items-center gap-1 rounded-md border border-[#e6e1e9] px-[10px] text-[14px] text-secondary transition-colors hover:border-[#d3cad8] hover:bg-[#fbfafc] hover:text-heading"
              >
                Show on page
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCard}
                className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-[#f4f1f6] hover:text-heading"
                aria-label="Close details"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {/* The note itself */}
              <div className="flex flex-col gap-4 px-6 pb-6 pt-6">
                <div className="flex items-center gap-2 text-[14px] leading-[20px]">
                  <Avatar name={opened.name} size={24} />
                  <span className="font-medium text-heading">{opened.name || "Anonymous"}</span>
                  <span className="text-muted">left feedback · {when(opened.createdAt, true)}</span>
                </div>
                <h2 id="fb-issue-title" className="whitespace-pre-wrap text-[20px] font-medium leading-[28px] text-heading [overflow-wrap:anywhere]">
                  {opened.text}
                </h2>
                {/* Properties, one row like Linear's */}
                <div className="flex flex-wrap items-center gap-2">
                  <Menu label="Status" value={opened.status} options={STATUS_OPTIONS} onChange={(v) => move(opened.id, v)} />
                  {opened.category && (
                    <span className="flex h-[32px] items-center gap-2 rounded-md border border-[#e6e1e9] px-[10px] text-[14px] text-secondary">
                      <Dot category={opened.category} />
                      {CATEGORIES[opened.category]}
                    </span>
                  )}
                </div>
              </div>

              {/* Where it was left, and what it points at */}
              <section className="flex flex-col gap-3 border-t border-[#ebe7ee] px-6 py-5" aria-label="Where on the page">
                <h3 className="flex items-center gap-2 text-[12px] font-medium uppercase leading-[16px] tracking-[0.04em] text-muted">
                  <MapPin size={14} aria-hidden="true" />
                  Where
                </h3>
                <div className="overflow-hidden rounded-lg border border-[#ebe7ee]">
                  <p className="flex items-center gap-2 border-b border-[#ebe7ee] bg-[#fbfafc] px-3 py-2 text-[14px] leading-[20px] text-heading">
                    {opened.caseStudy}
                    <ChevronRight size={14} className="text-muted" aria-hidden="true" />
                    {opened.where}
                  </p>
                  {opened.snippet ? (
                    <blockquote className="px-3 py-3 text-[14px] leading-[22px] text-secondary">“{opened.snippet}”</blockquote>
                  ) : (
                    <p className="px-3 py-3 text-[14px] leading-[22px] text-muted">About the case study as a whole.</p>
                  )}
                </div>
              </section>

              {opened.image && (
                <SafeImg
                  key={opened.id}
                  src={opened.image}
                  href={opened.image}
                  alt={`Image attached to ${opened.key}`}
                  className="w-full rounded-lg border border-[#ebe7ee]"
                  frame={(img) => (
                    <section className="flex flex-col gap-3 border-t border-[#ebe7ee] px-6 py-5" aria-label="Attachment">
                      <h3 className="flex items-center gap-2 text-[12px] font-medium uppercase leading-[16px] tracking-[0.04em] text-muted">
                        <ImageIcon size={14} aria-hidden="true" />
                        Attachment
                      </h3>
                      {img}
                    </section>
                  )}
                />
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
