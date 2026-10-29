"use client";

import { useEffect, useId, useRef, useState } from "react";

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
  | { kind: "event"; icon: "approved" | "merged"; who: Who; name: string; text: string };

const START_MS = 700; // "is typing…" before a message
const AFTER_MS = 550; // pause after an item, before the next

// Uneven, human typing: quick inside words, a beat at spaces, longer after punctuation
function delayAfter(ch: string) {
  if (/[.!?]/.test(ch)) return 260;
  if (/[,;:]/.test(ch)) return 140;
  if (ch === " ") return 40 + Math.random() * 30;
  return 16 + Math.random() * 26;
}

// GitHub's own timeline icons (Octicons check-16 and git-merge-16) in GitHub's colours, so
// the events read exactly as they do on a real pull request
const OCTICON = {
  approved: {
    color: "bg-[#1f883d]",
    path: "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z",
  },
  merged: {
    color: "bg-[#8250df]",
    path: "M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z",
  },
};

/**
 * The profile pictures, in the hero's pencil-sketch style: the designer is the hero portrait
 * itself, cropped to the face; the developer is drawn to match, in Blackcurrant line with a
 * slight pencil wobble (a turbulence filter), curly hair, glasses and a hoodie.
 */
function Avatar({ who, size }: { who: Who; size: 20 | 48 }) {
  const id = useId();
  return (
    <span
      aria-hidden="true"
      className="relative block shrink-0 overflow-hidden rounded-full bg-grape-light ring-4 ring-surface"
      style={{ width: size, height: size }}
    >
      {who === "designer" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/portrait-sketch.png"
          alt=""
          className="absolute left-1/2 top-[-6%] h-[180%] w-[180%] max-w-none -translate-x-1/2 object-cover"
        />
      ) : (
        <svg viewBox="0 0 96 96" className="h-full w-full" fill="none">
          <filter id={id}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="1.6" />
          </filter>
          <g
            filter={`url(#${id})`}
            stroke="#32073e"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Hoodie, strings and neck */}
            <path d="M10 98C14 78 30 71 48 71s34 7 38 27" />
            <path d="M40 75l-2 12M56 75l2 12" />
            <path d="M41 61v10M55 61v10" />
            {/* Face and ears */}
            <path d="M31 41c0-15 34-15 34 0 0 15-8 25-17 25s-17-10-17-25Z" fill="#F9E4FF" />
            <path d="M31 43c-5 0-5 9 0 9M65 43c5 0 5 9 0 9" />
            {/* Curly hair, with pencil hatching */}
            <path
              d="M29 41c-5-14 3-25 13-24 4-5 14-5 18 0 10 1 14 12 7 24-3-6-8-9-14-9-8 0-18 2-24 9Z"
              fill="#32073e"
              fillOpacity="0.85"
            />
            <path d="M33 23c2-4 6-4 8 0M45 18c2-4 6-4 8 0M57 22c2-4 6-3 7 1" strokeWidth="1.6" />
            {/* Glasses, eyes and a smile */}
            <rect x="34" y="40" width="11" height="8" rx="2" />
            <rect x="51" y="40" width="11" height="8" rx="2" />
            <path d="M45 43h6" />
            <path d="M43 56c3 3 7 3 10 0" />
          </g>
          <circle cx="39.5" cy="44" r="1.4" fill="#32073e" />
          <circle cx="56.5" cy="44" r="1.4" fill="#32073e" />
        </svg>
      )}
    </span>
  );
}

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
            className={`absolute left-[24px] top-[24px] -bottom-[24px] w-[2px] -translate-x-1/2 bg-line-soft transition-opacity duration-[400ms] motion-reduce:transition-none ${
              i + 1 <= active ? "opacity-100" : "opacity-0"
            }`}
          />
        );
        const fade = `transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
          done || live ? "translate-y-0 opacity-100" : "translate-y-[8px] opacity-0"
        }`;

        if (item.kind === "event") {
          const icon = OCTICON[item.icon];
          return (
            <li key={item.text} className={`relative flex items-center gap-[16px] pl-[12px] ${fade}`}>
              {link}
              <span
                aria-hidden="true"
                className={`relative flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-white ring-4 ring-surface ${icon.color}`}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d={icon.path} />
                </svg>
              </span>
              <Avatar who={item.who} size={20} />
              <p className="m-0 -ml-[8px] text-[14px] leading-[20px] text-secondary">
                <span className="font-medium text-heading">{item.name}</span> {item.text}
              </p>
            </li>
          );
        }

        const waiting = live && phase === "wait";
        const typingNow = live && phase === "type";
        const typed = done || (live && phase === "done") ? item.text : typingNow ? item.text.slice(0, chars) : "";
        return (
          <li key={item.text} className={`relative flex items-start gap-[16px] ${fade}`}>
            {link}
            <Avatar who={item.who} size={48} />
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
