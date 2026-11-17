"use client";

// ── Feedback review: "Show on page" from the board ────────────────────────────
// The board links to /works/x?review=<id>&ref=FB-4. Reviewers only ever see their own
// notes on the page, so this asks /feedback/note for that one comment (it answers only a
// browser that has unlocked the board), then:
//  - finds its block (by position, then by its text if the copy moved), scrolls it to the
//    middle of the screen, outlines it and puts the comment's pin on its corner;
//  - a comment on the whole case study, or one whose block is gone, has no pin: the page
//    stays where it is (or goes to its section) and the card says so;
//  - shows the comment in the feedback card's style: who, when, category, where and the
//    note itself, with its image if it has one.
// Close (✕ or Esc) takes the outline, the pin and ?review off the page.

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { locate } from "@/lib/feedback/anchor";
import { CATEGORIES, type FeedbackCategory, type FeedbackStatus } from "@/lib/feedback/shared";

type Note = {
  id: string;
  page: string;
  section: string;
  sectionLabel: string;
  anchor: string;
  label: string;
  snippet: string;
  text: string;
  name: string;
  category: FeedbackCategory | "";
  status: FeedbackStatus;
  createdAt: number;
  image: string;
};

const STATUS: Record<FeedbackStatus, string> = { open: "To do", doing: "In progress", done: "Done", wontdo: "Won't do" };
const ID_RE = /^[0-9a-f-]{36}$/;
const REF_RE = /^FB-\d{1,5}$/;

export default function FeedbackReview() {
  const [note, setNote] = useState<Note | null>(null);
  const [ref, setRef] = useState("");
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [missing, setMissing] = useState(false); // a block comment whose block can't be found
  const outline = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Read ?review, fetch the comment, find its block
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("review") ?? "";
    if (!ID_RE.test(id)) return;
    const given = params.get("ref") ?? "";
    setRef(REF_RE.test(given) ? given : "");
    let gone = false;
    (async () => {
      const res = await fetch(`/feedback/note?id=${id}`, { credentials: "same-origin", cache: "no-store" }).catch(() => null);
      if (!res?.ok || gone) return;
      const n = (await res.json()) as Note;
      if (n.page !== window.location.pathname) return;
      // Give lazy media and the reveal animations a moment so the block is where it will stay
      await new Promise((r) => setTimeout(r, 500));
      if (gone) return;
      const main = document.querySelector<HTMLElement>("[data-cs-main]");
      const whole = n.anchor.startsWith("page|");
      const found = !whole && main ? locate(n.anchor, n.snippet, main) : null;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (found) {
        // Phones: the card is a bottom sheet, so keep the block in the space above it
        const phone = !window.matchMedia("(min-width: 768px)").matches;
        const r = found.getBoundingClientRect();
        const top = phone ? r.top - 120 : r.top - (window.innerHeight - Math.min(r.height, window.innerHeight * 0.6)) / 2;
        window.scrollBy({ top, behavior: reduce ? "auto" : "smooth" });
      } else if (!whole) {
        setMissing(true);
        document.getElementById(n.section)?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      }
      setEl(found);
      setNote(n);
    })();
    return () => {
      gone = true;
    };
  }, []);

  // Keep the outline and the pin on the block while the page moves
  useEffect(() => {
    if (!note || !el) return;
    let frame = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      if (outline.current) {
        outline.current.style.transform = `translate(${r.left - 6}px, ${r.top - 6}px)`;
        outline.current.style.width = `${r.width + 12}px`;
        outline.current.style.height = `${r.height + 12}px`;
        outline.current.style.opacity = "1";
      }
      if (pin.current) {
        pin.current.style.transform = `translate(${r.right - 4}px, ${r.top - 16}px)`;
        pin.current.style.opacity = "1";
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [note, el]);

  const close = () => {
    setNote(null);
    setEl(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("review");
    url.searchParams.delete("ref");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  };

  // Esc closes; focus starts on the card so keyboard users land in it
  useEffect(() => {
    if (!note) return;
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [note]);

  if (!note) return null;
  const whole = note.anchor.startsWith("page|");
  const where = whole ? "Whole case study" : `${note.sectionLabel} · ${note.label}`;
  const when = new Date(note.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {el && (
        <div className="fb-overlay" data-on="true" aria-hidden="true">
          <div ref={outline} className="fb-outline" data-kind="picked">
            <span className="fb-outline-tag">{where}</span>
          </div>
        </div>
      )}
      {el && (
        <div ref={pin} className="fb-dot" aria-hidden="true" style={{ cursor: "default" }}>
          <span className="fb-dot-face" />
        </div>
      )}

      <aside className="fb-card" data-theme="dark" data-open="true" role="dialog" aria-modal="false" aria-labelledby="fb-review-title">
        <div className="fb-card-form">
          <header className="fb-card-head">
            <h2 id="fb-review-title" className="fb-card-title">
              {ref ? `Feedback ${ref}` : "Feedback"}
            </h2>
            <button ref={closeBtn} type="button" className="fb-icon-button" onClick={close} aria-label="Close feedback">
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <div className="flex min-h-0 flex-col gap-[12px] overflow-y-auto">
            <p className="m-0 text-[14px] leading-[20px] text-[var(--fb-text-3)]">
              <span className="text-[var(--fb-text-1)]">{note.name || "Anonymous"}</span> · {when}
            </p>
            <p className="m-0 whitespace-pre-wrap text-[16px] leading-[24px] text-[var(--fb-text-1)]">{note.text}</p>
            {note.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={note.image} alt="Image attached to the feedback" className="max-h-[240px] w-full rounded-md object-contain" />
            )}
            <div className="flex flex-wrap gap-[8px] text-[12px] leading-[16px]">
              <span className="rounded-full bg-[var(--fb-raise-2)] px-[8px] py-[4px] text-[var(--fb-text-2)]">{STATUS[note.status] ?? "To do"}</span>
              {note.category && (
                <span className="rounded-full bg-[var(--fb-chip-bg)] px-[8px] py-[4px] text-[var(--fb-text-1)]">{CATEGORIES[note.category]}</span>
              )}
            </div>
            <div className="rounded-md border border-[var(--fb-line)] bg-[var(--fb-raise)] px-[12px] py-[10px] text-[14px] leading-[20px]">
              <p className="m-0 text-[var(--fb-text-1)]">{where}</p>
              <p className="m-0 mt-[4px] text-[var(--fb-text-3)]">
                {whole
                  ? "Left on the case study as a whole, so there's no pin on the page."
                  : missing
                    ? "This block has moved or changed since the comment was left, so it can't be pinned. Showing its section."
                    : note.snippet
                      ? `“${note.snippet.slice(0, 120)}${note.snippet.length > 120 ? "…" : ""}”`
                      : "Pinned and outlined on the page."}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
