"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight } from "lucide-react";
import type { FeedbackStatus } from "@/lib/feedback/shared";
import { moveTo } from "./actions";

// ── Feedback board ────────────────────────────────────────────────────────────
// Four columns like a Jira board. Drag a card into another column (mouse), or
// pick a column from its Move menu (keyboard and touch). Moves show at once and
// are saved in the background; a failed save puts the card back.

export interface BoardCard {
  id: string;
  status: FeedbackStatus;
  caseStudy: string;
  where: string;
  snippet: string;
  text: string;
  name: string;
  category: string;
  image: string;
  link: string;
  createdAt: number;
}

const COLUMNS: { status: FeedbackStatus; label: string; hint: string }[] = [
  { status: "open", label: "To do", hint: "New feedback lands here" },
  { status: "doing", label: "In progress", hint: "Drag here while you fix it" },
  { status: "done", label: "Done", hint: "Fixed" },
  { status: "wontdo", label: "Won't do", hint: "Decided against" },
];

const when = (ms: number) =>
  new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

export default function Board({ cards: initial }: { cards: BoardCard[] }) {
  const [cards, setCards] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<FeedbackStatus | null>(null);
  const [error, setError] = useState(false);
  const [, startTransition] = useTransition();

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

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-caption text-warning">Couldn&apos;t move that card, so it&apos;s back where it was. Try again.</p>}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        <div className="grid min-w-[960px] grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const list = cards.filter((c) => c.status === col.status).sort((a, b) => b.createdAt - a.createdAt);
            return (
              <section
                key={col.status}
                aria-label={`${col.label}, ${list.length}`}
                data-over={over === col.status}
                className="flex min-h-[320px] flex-col gap-3 rounded-lg border border-line-soft bg-surface p-3 transition-colors data-[over=true]:border-grape data-[over=true]:bg-grape-light/40"
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
                <header className="flex items-baseline justify-between gap-2 px-1">
                  <h2 className="text-body font-medium text-heading">{col.label}</h2>
                  <span className="text-caption text-muted tabular-nums">{list.length}</span>
                </header>
                {list.length === 0 && (
                  <p className="rounded-md border border-dashed border-line px-3 py-6 text-center text-caption text-muted">{col.hint}</p>
                )}
                <ul className="flex flex-col gap-3">
                  {list.map((c) => (
                    <li
                      key={c.id}
                      draggable
                      data-dragging={dragging === c.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", c.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDragging(c.id);
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setOver(null);
                      }}
                      className="flex cursor-grab flex-col gap-2 rounded-md border border-line-soft bg-background p-3 shadow-[0_1px_2px_rgba(30,5,37,0.06)] transition-opacity active:cursor-grabbing data-[dragging=true]:opacity-40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-caption font-medium text-heading">{c.caseStudy}</p>
                        <a
                          href={c.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex shrink-0 items-center gap-1 text-caption text-muted hover:text-grape"
                          aria-label={`Show on page: ${c.caseStudy}, ${c.where}`}
                        >
                          Show
                          <ArrowUpRight size={12} aria-hidden="true" />
                        </a>
                      </div>
                      <p className="text-caption text-muted">{c.where}</p>
                      {c.snippet && <p className="line-clamp-2 border-l-2 border-line pl-2 text-caption text-muted">“{c.snippet}”</p>}
                      <p className="whitespace-pre-wrap text-body text-text-base [overflow-wrap:anywhere]">{c.text}</p>
                      {c.image && (
                        <a href={c.image} target="_blank" rel="noreferrer" className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element -- private image served by the inbox route */}
                          <img src={c.image} alt={`Image attached to feedback on ${c.where}`} className="max-h-[140px] w-full rounded-sm border border-line-soft object-cover" />
                        </a>
                      )}
                      {c.category && (
                        <span className="w-fit rounded-full bg-grape-light px-2 text-caption text-primary">{c.category}</span>
                      )}
                      <div className="flex items-center justify-between gap-2 border-t border-line-soft pt-2 text-caption text-muted">
                        <span className="min-w-0 truncate">
                          {c.name} · {when(c.createdAt)}
                        </span>
                        <label className="flex shrink-0 items-center gap-1">
                          <span className="sr-only">Move to</span>
                          <select
                            value={c.status}
                            onChange={(e) => move(c.id, e.target.value as FeedbackStatus)}
                            className="cursor-pointer rounded-sm border border-line bg-background px-1 py-[2px] text-caption text-secondary hover:border-grape"
                          >
                            {COLUMNS.map((o) => (
                              <option key={o.status} value={o.status}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
