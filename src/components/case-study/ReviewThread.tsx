"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Who does what, drawn as a GitHub pull request page, in Geist and GitHub's own greys:
 * the pull request's title with its state label (Open, turning to Merged when the merge
 * event plays), then the timeline. Comments sit beside a 40px avatar in a box with a grey
 * header and a small caret pointing at the avatar; events (approved, merged) sit on the
 * timeline line with GitHub's badge icon, the person's small avatar and a line of text.
 * Avatars are GitHub's default identicons: a mirrored 5×5 pattern, one colour per person.
 * When it scrolls into view it plays once. Each comment's header first reads "is typing…",
 * then the message types out with a human rhythm (uneven gaps between characters, longer
 * pauses after punctuation) and a caret. Events fade in after the comment before them, and
 * the timeline line grows down to each item as it appears.
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

// GitHub's colours for the page: borders, header grey, text, and the two state colours
const GH = {
  border: "border-[#d0d7de]",
  header: "bg-[#f6f8fa]",
  text: "text-[#1f2328]",
  muted: "text-[#59636e]",
  green: "bg-[#1f883d]",
  purple: "bg-[#8250df]",
};

// Octicons, as GitHub draws them (16px grid)
const OCTICON = {
  check:
    "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z",
  merge:
    "M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z",
  pull: "M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z",
};

function Octicon({ d, size }: { d: string; size: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Fixed identicon patterns (columns 0–2 of a 5×5 grid, mirrored), one per person
const IDENTICON: Record<Who, { cells: string[]; color: string }> = {
  designer: { cells: ["101", "011", "110", "011", "101"], color: "#9D136A" },
  developer: { cells: ["010", "111", "101", "100", "111"], color: "#32073e" },
};

function Avatar({ who, size }: { who: Who; size: 20 | 40 }) {
  const { cells, color } = IDENTICON[who];
  return (
    <svg
      viewBox="-1 -1 7 7"
      width={size}
      height={size}
      aria-hidden="true"
      className="relative shrink-0 rounded-full bg-[#f0f0f0] shadow-[0_0_0_1px_rgba(31,35,40,0.15)]"
      shapeRendering="crispEdges"
    >
      {cells.flatMap((row, y) =>
        [0, 1, 2, 3, 4].map((x) =>
          row[x < 3 ? x : 4 - x] === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null,
        ),
      )}
    </svg>
  );
}

export default function ReviewThread({ title, items }: { title: string; items: ThreadItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
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

  // The label flips to Merged once the merge event has shown
  const mergeAt = items.findIndex((it) => it.kind === "event" && it.icon === "merged");
  const merged = mergeAt >= 0 && active >= mergeAt;

  return (
    <div ref={ref} className={`mt-[40px] font-geist ${GH.text}`}>
      {/* The pull request's title and state */}
      <div className={`flex flex-col items-start gap-[12px] border-b pb-[16px] ${GH.border}`}>
        <p className="m-0 text-[20px] font-normal leading-[28px] md:text-[24px] md:leading-[32px]">{title}</p>
        <span
          className={`inline-flex h-[32px] items-center gap-[4px] rounded-full px-[12px] text-[14px] font-medium leading-[20px] text-white transition-colors duration-[300ms] ${
            merged ? GH.purple : GH.green
          }`}
        >
          <Octicon d={merged ? OCTICON.merge : OCTICON.pull} size={16} />
          {merged ? "Merged" : "Open"}
        </span>
      </div>

      <ol className="relative m-0 mt-[24px] list-none p-0">
        {items.map((item, i) => {
          const done = i < active;
          const live = i === active;
          const fade = `transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
            done || live ? "translate-y-0 opacity-100" : "translate-y-[8px] opacity-0"
          }`;
          // The timeline: GitHub runs it 16px in from the comment boxes' left edge, from
          // this item down to the next, drawn once the next shows
          const link = i < items.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute bottom-0 left-[72px] top-0 w-[2px] -translate-x-1/2 bg-[#d0d7de] transition-opacity duration-[400ms] motion-reduce:transition-none ${
                i + 1 <= active ? "opacity-100" : "opacity-0"
              }`}
            />
          );

          if (item.kind === "event") {
            const approved = item.icon === "approved";
            return (
              <li key={item.text} className={`relative py-[16px] ${fade}`}>
                {link}
                <div className="relative flex items-center gap-[8px] pl-[60px]">
                  <span
                    className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-white ring-4 ring-surface ${
                      approved ? GH.green : GH.purple
                    }`}
                  >
                    <Octicon d={approved ? OCTICON.check : OCTICON.merge} size={12} />
                  </span>
                  <Avatar who={item.who} size={20} />
                  <p className={`m-0 text-[14px] leading-[20px] ${GH.muted}`}>
                    <span className={`font-medium ${GH.text}`}>{item.name}</span> {item.text}
                  </p>
                </div>
              </li>
            );
          }

          const waiting = live && phase === "wait";
          const typingNow = live && phase === "type";
          const typed = done || (live && phase === "done") ? item.text : typingNow ? item.text.slice(0, chars) : "";
          return (
            <li key={item.text} className={`relative pb-[16px] ${fade}`}>
              {link}
              <div className="relative flex items-start gap-[16px]">
                <Avatar who={item.who} size={40} />
                <div className={`relative min-w-0 flex-1 rounded-[6px] border bg-white ${GH.border}`}>
                  {/* The caret pointing at the avatar: a border-coloured triangle under a header-coloured one */}
                  <span
                    aria-hidden="true"
                    className="absolute left-[-8px] top-[12px] h-0 w-0 border-y-[8px] border-r-[8px] border-y-transparent border-r-[#d0d7de]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-[-6px] top-[14px] h-0 w-0 border-y-[6px] border-r-[6px] border-y-transparent border-r-[#f6f8fa]"
                  />
                  <p
                    className={`m-0 rounded-t-[6px] border-b px-[16px] py-[8px] text-[14px] leading-[24px] ${GH.border} ${GH.header} ${GH.muted}`}
                  >
                    <span className={`font-medium ${GH.text}`}>{item.name}</span>{" "}
                    <span aria-hidden="true">{waiting || typingNow ? "is typing…" : item.verb}</span>
                    <span className="sr-only">{item.verb}</span>
                  </p>
                  <div className="relative p-[16px]">
                    <p className="invisible m-0 text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]">
                      <span className="sr-only !visible">{item.text}</span>
                      <span aria-hidden="true">{item.text}</span>
                    </p>
                    <p
                      aria-hidden="true"
                      className="absolute inset-0 m-0 p-[16px] text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]"
                    >
                      {typed}
                      {(waiting || typingNow) && (
                        <span className="ml-[2px] inline-block h-[16px] w-[2px] translate-y-[3px] animate-[thread-caret_1s_steps(1)_infinite] bg-[#0969da]" />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
