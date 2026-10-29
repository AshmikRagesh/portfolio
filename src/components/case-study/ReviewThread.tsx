"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Code, GitMerge, PenNib } from "@phosphor-icons/react/dist/ssr";

/**
 * Who does what, as a pull request's timeline, all in Geist: comments (an avatar beside a
 * box with a header line and the message) and events (a small icon on the timeline with a
 * line of text, like "approved these changes" or "merged into main"), joined by a thin
 * vertical line that grows item by item as the thread plays. No outer container.
 * When it scrolls into view it plays once. Each comment's header first reads "is typing…",
 * then the message types out with a human rhythm (uneven gaps between characters, longer
 * pauses after punctuation) and a caret, then the header settles to its verb. Events fade in
 * after the comment before them.
 * Best practice for typed text: every message keeps its full text in the layout (invisible)
 * with the typed part laid over it, so nothing shifts while it types; the animated text is
 * hidden from screen readers, which read the full message; and with reduced motion the
 * whole thread simply shows.
 */
type Who = "designer" | "developer";
export type ThreadItem =
  | { kind: "comment"; who: Who; name: string; verb: string; text: string }
  | { kind: "event"; icon: "approved" | "merged"; name: string; text: string };

const START_MS = 700; // "is typing…" before a message
const AFTER_MS = 550; // pause after an item, before the next

// Uneven, human typing: quick inside words, a beat at spaces, longer after punctuation
function delayAfter(ch: string) {
  if (/[.!?]/.test(ch)) return 260;
  if (/[,;:]/.test(ch)) return 140;
  if (ch === " ") return 40 + Math.random() * 30;
  return 16 + Math.random() * 26;
}

const AVATAR: Record<Who, { icon: typeof Code; tone: string }> = {
  designer: { icon: PenNib, tone: "bg-grape-light text-grape" },
  developer: { icon: Code, tone: "bg-primary text-white" },
};

const EVENT: Record<"approved" | "merged", { icon: typeof Check; tone: string }> = {
  approved: { icon: Check, tone: "bg-success text-white" },
  merged: { icon: GitMerge, tone: "bg-grape text-white" },
};

export default function ReviewThread({ items }: { items: ThreadItem[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(-1); // the item playing (-1: not started)
  const [phase, setPhase] = useState<"wait" | "type" | "done">("wait");
  const [chars, setChars] = useState(0);

  // Start once, when most of the thread is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(items.length);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(0);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items.length]);

  // Step through each item: wait, type (comments only), done, then the next
  useEffect(() => {
    if (active < 0 || active >= items.length) return;
    const item = items[active];
    let t: number;
    if (phase === "wait") {
      t = window.setTimeout(
        () => setPhase(item.kind === "comment" ? "type" : "done"),
        item.kind === "comment" ? START_MS : 0,
      );
    } else if (phase === "type" && item.kind === "comment" && chars < item.text.length) {
      t = window.setTimeout(() => setChars((c) => c + 1), delayAfter(item.text[chars - 1] ?? ""));
    } else if (phase === "type") {
      t = window.setTimeout(() => setPhase("done"), 0);
    } else {
      t = window.setTimeout(() => {
        setActive((a) => a + 1);
        setPhase("wait");
        setChars(0);
      }, AFTER_MS);
    }
    return () => window.clearTimeout(t);
  }, [active, phase, chars, items]);

  return (
    <ol ref={ref} className="relative m-0 mt-[40px] flex list-none flex-col gap-[24px] p-0 font-geist">
      {items.map((item, i) => {
        const done = i < active;
        const live = i === active;
        // The timeline: a short line from this item down to the next, drawn once the next shows
        const link = i < items.length - 1 && (
          <span
            aria-hidden="true"
            className={`absolute left-[20px] top-[20px] -bottom-[24px] w-[2px] -translate-x-1/2 bg-line-soft transition-opacity duration-[400ms] motion-reduce:transition-none ${
              i + 1 <= active ? "opacity-100" : "opacity-0"
            }`}
          />
        );
        const fade = `transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
          done || live ? "translate-y-0 opacity-100" : "translate-y-[8px] opacity-0"
        }`;

        if (item.kind === "event") {
          const { icon: Icon, tone } = EVENT[item.icon];
          return (
            <li key={item.text} className={`relative flex items-center gap-[16px] pl-[8px] ${fade}`}>
              {link}
              <span
                aria-hidden="true"
                className={`relative flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${tone}`}
              >
                <Icon size={14} weight="bold" />
              </span>
              <p className="m-0 text-[14px] leading-[20px] text-secondary">
                <span className="font-medium text-heading">{item.name}</span> {item.text}
              </p>
            </li>
          );
        }

        const { icon: Icon, tone } = AVATAR[item.who];
        const waiting = live && phase === "wait";
        const typingNow = live && phase === "type";
        const typed = done || (live && phase === "done") ? item.text : typingNow ? item.text.slice(0, chars) : "";
        return (
          <li key={item.text} className={`relative flex items-start gap-[16px] ${fade}`}>
            {link}
            <span
              aria-hidden="true"
              className={`relative flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${tone}`}
            >
              <Icon size={20} />
            </span>
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-[12px] border border-line bg-white">
              <p className="m-0 border-b border-line-soft bg-surface px-[16px] py-[10px] text-[14px] leading-[20px] text-secondary">
                <span className="font-medium text-heading">{item.name}</span>{" "}
                <span aria-hidden="true">{waiting || typingNow ? "is typing…" : item.verb}</span>
                <span className="sr-only">{item.verb}</span>
              </p>
              <div className="relative px-[16px] py-[14px]">
                <p className="invisible m-0 text-[16px] leading-[24px]">
                  <span className="sr-only !visible">{item.text}</span>
                  <span aria-hidden="true">{item.text}</span>
                </p>
                <p
                  aria-hidden="true"
                  className="absolute inset-0 m-0 px-[16px] py-[14px] text-[16px] leading-[24px] text-heading"
                >
                  {typed}
                  {(waiting || typingNow) && (
                    <span className="ml-[2px] inline-block h-[18px] w-[2px] translate-y-[3px] animate-[thread-caret_1s_steps(1)_infinite] bg-grape" />
                  )}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
