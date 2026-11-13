"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, ChatCircleDots, X } from "@phosphor-icons/react";
import type { CaseStudySection } from "@/components/case-study/SectionPill";
import { blockFor, describe, locate } from "@/lib/feedback/anchor";
import { AUTHOR_KEY, FEEDBACK_PATH, LIMITS, NAME_KEY, type FeedbackItem } from "@/lib/feedback/shared";
import { playSound } from "@/lib/sound/ui";

// ── Case study feedback ───────────────────────────────────────────────────────
// A round button beside the section pill turns on feedback mode. In it, the block
// under the pointer is outlined; clicking one opens a floating card at the right to
// leave a comment on it. Reviewers see only their own comments (numbered dots);
// everything goes to the private /feedback inbox. Styles: .fb-* in globals.css.

type Saved = Omit<FeedbackItem, "author">;
type Target = ReturnType<typeof describe> & { el: HTMLElement };

interface FeedbackState {
  on: boolean;
  setOn: (on: boolean) => void;
  items: Saved[];
  add: (item: Saved) => void;
  author: string;
}

const Ctx = createContext<FeedbackState | null>(null);
const NONE: Saved[] = [];
const useFeedback = () => useContext(Ctx);
export const useFeedbackOn = () => useContext(Ctx)?.on ?? false;

function storageGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Blocked storage: the comment still sends, it just won't be remembered here
  }
}

function authorId() {
  let id = storageGet(AUTHOR_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    storageSet(AUTHOR_KEY, id);
  }
  return id;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const page = usePathname();
  const [on, setOn] = useState(false);
  const [items, setItems] = useState<Saved[]>([]);
  const [author, setAuthor] = useState("");

  useEffect(() => setAuthor(authorId()), []);

  // This reviewer's earlier comments on this page
  useEffect(() => {
    if (!author) return;
    let live = true;
    fetch(`${FEEDBACK_PATH}?page=${encodeURIComponent(page)}&author=${author}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Saved[]) => live && setItems(list))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [author, page]);

  const add = useCallback((item: Saved) => setItems((list) => [...list, item]), []);

  return <Ctx.Provider value={{ on, setOn, items, add, author }}>{children}</Ctx.Provider>;
}

/** The round button that sits beside the section pill. */
export function FeedbackButton() {
  const fb = useFeedback();
  if (!fb) return null;
  const { on, setOn, items } = fb;
  return (
    <button
      type="button"
      className="fb-button"
      data-on={on}
      aria-pressed={on}
      data-sound-click="toggle"
      onClick={() => setOn(!on)}
    >
      <ChatCircleDots size={20} weight={on ? "fill" : "regular"} aria-hidden="true" />
      <span className="sr-only">{on ? "Exit feedback mode" : "Leave feedback on this case study"}</span>
      {items.length > 0 && (
        <span className="fb-count" aria-hidden="true">
          {items.length}
        </span>
      )}
      <span className="fb-tip" aria-hidden="true">
        {on ? "Exit feedback" : "Leave feedback"}
      </span>
    </button>
  );
}

/** Outlines, dots and the comment card. Only does anything while feedback mode is on. */
export function FeedbackLayer({ sections }: { sections: CaseStudySection[] }) {
  const fb = useFeedback();
  const page = usePathname();
  const [target, setTarget] = useState<Target | null>(null);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const hoverRef = useRef<HTMLDivElement>(null);
  const pickedRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef(new Map<string, HTMLButtonElement>());
  const hovered = useRef<HTMLElement | null>(null);
  const located = useRef(new Map<string, HTMLElement | null>());
  const textRef = useRef<HTMLTextAreaElement>(null);
  const targetRef = useRef<Target | null>(null);
  targetRef.current = target;

  const on = fb?.on ?? false;
  const setOn = fb?.setOn;
  const items = fb?.items ?? NONE;

  useEffect(() => setName(storageGet(NAME_KEY) ?? ""), []);

  const root = () => document.querySelector<HTMLElement>("[data-cs-main]");

  const pick = useCallback(
    (el: HTMLElement) => {
      const main = root();
      if (!main) return;
      setTarget({ el, ...describe(el, main, sections) });
      setState("idle");
      // Phones: the card is a bottom sheet, so lift the block into the space above it
      if (!window.matchMedia("(min-width: 768px)").matches) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollBy({ top: el.getBoundingClientRect().top - 176, behavior: reduce ? "auto" : "smooth" });
      }
      playSound("pop");
    },
    [sections],
  );

  // Deep link from the inbox: /works/x?fb=<anchor> opens feedback mode on that block
  useEffect(() => {
    const anchor = new URLSearchParams(window.location.search).get("fb");
    const main = root();
    if (!anchor || !main || !setOn) return;
    const el = locate(anchor, "", main);
    if (!el) return;
    setOn(true);
    el.scrollIntoView({ block: "center" });
    pick(el);
  }, [setOn, pick]);

  // Points and clicks inside the case study belong to feedback mode while it's on
  useEffect(() => {
    if (!on) return;
    const main = root();
    if (!main) return;
    document.documentElement.dataset.feedback = "on";

    const onMove = (e: PointerEvent) => {
      hovered.current = e.pointerType === "touch" ? null : blockFor(e.target, main);
    };
    const swallow = (e: Event) => {
      if (!main.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const onClick = (e: MouseEvent) => {
      if (!main.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = blockFor(e.target, main);
      if (el) pick(el);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (targetRef.current) setTarget(null);
      else setOn?.(false);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", swallow, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      delete document.documentElement.dataset.feedback;
      hovered.current = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", swallow, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [on, pick, setOn]);

  // Leaving feedback mode closes the card (only on the switch off, so a deep link
  // that opens the mode and picks a block in the same pass keeps its card)
  const wasOn = useRef(on);
  useEffect(() => {
    if (wasOn.current && !on) setTarget(null);
    wasOn.current = on;
  }, [on]);

  // Find each saved comment's block once per mode switch or new comment
  useEffect(() => {
    const main = root();
    if (!on || !main) return;
    located.current = new Map(items.map((i) => [i.id, locate(i.anchor, i.snippet, main)]));
  }, [on, items]);

  // Keep outlines, dots and the card stuck to their blocks while the page moves
  useEffect(() => {
    if (!on) return;
    let frame = 0;
    const place = (box: HTMLDivElement | null, el: HTMLElement | null) => {
      if (!box) return;
      if (!el) {
        box.style.opacity = "0";
        return;
      }
      const r = el.getBoundingClientRect();
      box.style.opacity = "1";
      box.style.transform = `translate(${r.left - 6}px, ${r.top - 6}px)`;
      box.style.width = `${r.width + 12}px`;
      box.style.height = `${r.height + 12}px`;
    };
    const tick = () => {
      const picked = target?.el ?? null;
      place(hoverRef.current, hovered.current && hovered.current !== picked ? hovered.current : null);
      place(pickedRef.current, picked);

      // One dot per block, on its top-right corner
      const seen = new Set<HTMLElement>();
      for (const [id, dot] of dotRefs.current) {
        const el = located.current.get(id);
        if (!el || seen.has(el)) {
          dot.style.opacity = "0";
          continue;
        }
        seen.add(el);
        const r = el.getBoundingClientRect();
        dot.style.opacity = "1";
        dot.style.transform = `translate(${r.right - 4}px, ${r.top - 16}px)`;
      }

      // Desktop card: level with the block, kept clear of the navbar and the dock
      const card = cardRef.current;
      if (card && picked && window.matchMedia("(min-width: 768px)").matches) {
        const r = picked.getBoundingClientRect();
        const top = Math.min(Math.max(r.top, 104), window.innerHeight - card.offsetHeight - 96);
        card.style.top = `${Math.max(104, top)}px`;
      } else if (card) {
        card.style.top = "";
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [on, target]);

  // Focus the comment box when a block is picked
  useEffect(() => {
    if (target) textRef.current?.focus({ preventScroll: true });
  }, [target]);

  if (!fb) return null;

  const thread = target ? items.filter((i) => i.anchor === target.anchor) : [];
  // Number the dots in reading order of when they were left
  const blocks = Array.from(new Set(items.map((i) => i.anchor)));

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!target || !text || state === "sending") return;
    setState("sending");
    storageSet(NAME_KEY, name.trim());
    try {
      const res = await fetch(FEEDBACK_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          section: target.section,
          sectionLabel: target.sectionLabel,
          anchor: target.anchor,
          label: target.label,
          snippet: target.snippet,
          text,
          name: name.trim(),
          author: fb.author,
          website: (e?.target as HTMLFormElement | undefined)?.website?.value ?? "",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      if (res.status === 201) fb.add(await res.json());
      setDraft("");
      setState("sent");
      playSound("done");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      {on && (
        <div className="fb-strip" role="status">
          <span className="fb-strip-dot" aria-hidden="true" />
          <span className="fb-strip-wide">Feedback mode · click any block to comment</span>
          <span className="fb-strip-narrow">Tap any block to comment</span>
          <button type="button" className="fb-strip-exit" onClick={() => setOn?.(false)}>
            Exit <kbd>Esc</kbd>
          </button>
        </div>
      )}

      <div className="fb-overlay" data-on={on} aria-hidden="true">
        <div ref={hoverRef} className="fb-outline" data-kind="hover" />
        <div ref={pickedRef} className="fb-outline" data-kind="picked">
          {target && (
            <span className="fb-outline-tag">
              {target.sectionLabel} · {target.label}
            </span>
          )}
        </div>
      </div>

      {on &&
        items.map((item) => (
          <button
            key={item.id}
            type="button"
            ref={(node) => {
              if (node) dotRefs.current.set(item.id, node);
              else dotRefs.current.delete(item.id);
            }}
            className="fb-dot"
            aria-label={`Your comment on ${item.sectionLabel}, ${item.label.toLowerCase()}`}
            onClick={() => {
              const el = located.current.get(item.id);
              if (el) pick(el);
            }}
          >
            {blocks.indexOf(item.anchor) + 1}
          </button>
        ))}

      <div ref={cardRef} className="fb-card" data-open={Boolean(on && target)} inert={!(on && target)}>
        {target && (
          <form onSubmit={send} className="fb-card-form">
            <header className="fb-card-head">
              <div className="min-w-0">
                <p className="fb-card-eyebrow">{target.sectionLabel}</p>
                <p className="fb-card-title">{target.label}</p>
              </div>
              <button type="button" className="fb-icon-button" onClick={() => setTarget(null)}>
                <X size={16} aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </header>

            {target.snippet && <p className="fb-card-snippet">“{target.snippet}”</p>}

            {thread.length > 0 && (
              <ul className="fb-thread">
                {thread.map((c) => (
                  <li key={c.id}>
                    <p className="fb-thread-meta">
                      {c.name || "You"} · {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                    <p className="fb-thread-text">{c.text}</p>
                  </li>
                ))}
              </ul>
            )}

            <label className="sr-only" htmlFor="fb-text">
              Your feedback
            </label>
            <textarea
              id="fb-text"
              ref={textRef}
              className="fb-input fb-textarea"
              placeholder="What would make this clearer?"
              maxLength={LIMITS.text}
              rows={3}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (state !== "sending") setState("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
              }}
            />
            {/* Honeypot: hidden from people, filled by bots */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="fb-trap" aria-hidden="true" />

            <div className="fb-card-foot">
              <label className="sr-only" htmlFor="fb-name">
                Your name (optional)
              </label>
              <input
                id="fb-name"
                className="fb-input fb-name"
                placeholder="Your name (optional)"
                maxLength={LIMITS.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button type="submit" className="fb-send" aria-disabled={!draft.trim() || state === "sending"}>
                <ArrowUp size={16} weight="bold" aria-hidden="true" />
                <span className="sr-only">Send feedback</span>
              </button>
            </div>

            <p className="fb-card-note" aria-live="polite" data-state={state}>
              {state === "sent"
                ? "Sent. Thank you, Ashmik will see this."
                : state === "error"
                  ? "Couldn't send that. Try again in a minute."
                  : state === "sending"
                    ? "Sending…"
                    : <>{draft.length}/{LIMITS.text}<span className="fb-hint-keys"> · ⌘↵ to send</span></>}
            </p>
          </form>
        )}
      </div>
    </>
  );
}
