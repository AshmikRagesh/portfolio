"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Who does what, drawn as a GitHub pull request page, in Geist and GitHub's own greys:
 * the pull request's title with its state label (Open, turning to Merged when the merge
 * event plays), then the timeline. Comments sit beside a 32px avatar in a box with a grey
 * header (name and verb, then the time and GitHub's ··· menu) and a small caret pointing at
 * the avatar; events (approved, merged) sit on the
 * timeline line with GitHub's badge icon and a line of text.
 * Avatars are GitHub's default identicons: a mirrored 5×5 pattern, one colour per person.
 * When it scrolls into view it plays once. Each comment's header first reads "is typing…",
 * then the message types out with a human rhythm (uneven gaps between characters, longer
 * pauses after punctuation) and a caret. Events fade in after the comment before them, and
 * the timeline line grows down to each item as it appears. Under the thread, the path a change
 * takes (a segmented bar, one solid segment per step) fills in step with it.
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
  kebab: "M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
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
  developer: { cells: ["110", "001", "111", "010", "100"], color: "#5b2a6e" },
};

function Avatar({ who, size }: { who: Who; size: 32 }) {
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

// The bar's segments, light grape to Blackcurrant (solid, no gradient)
const STEP_TONE = ["bg-grape-light", "bg-grape/40", "bg-grape", "bg-primary"];

export default function ReviewThread({
  title,
  number,
  branch,
  items,
  steps,
}: {
  title: string;
  number: number;
  branch: string;
  items: ThreadItem[];
  steps: { title: string; text: string }[];
}) {
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
      { threshold: 0.25 },
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
  // The bar fills as the thread plays: needed when it starts, built once the designer's
  // comment is in, reviewed at the approval, merged at the merge
  const approveAt = items.findIndex((it) => it.kind === "event" && it.icon === "approved");
  const litAt = [0, 1, approveAt, mergeAt];
  const lit = (step: number) => active >= (litAt[step] ?? items.length);

  return (
    <div ref={ref} className={`mt-[40px] font-geist ${GH.text}`}>
      {/* The pull request's title and state */}
      <div className={`flex flex-col items-start gap-[12px] border-b pb-[16px] ${GH.border}`}>
        <p className="m-0 text-[24px] font-normal leading-[32px] md:text-[28px] md:leading-[36px]">
          {title} <span className={`font-light ${GH.muted}`}>#{number}</span>
        </p>
        <span
          key={merged ? "merged" : "open"}
          className={`inline-flex h-[32px] items-center gap-[4px] rounded-full px-[12px] text-[14px] font-medium leading-[20px] text-white ${
            merged ? "animate-[thread-pop_500ms_cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:animate-none" : ""
          } ${
            merged ? GH.purple : GH.green
          }`}
        >
          <Octicon d={merged ? OCTICON.merge : OCTICON.pull} size={16} />
          {merged ? "Merged" : "Open"}
        </span>
        <p className={`m-0 text-[14px] leading-[20px] ${GH.muted}`}>
          <span className={`font-medium ${GH.text}`}>Designer</span> {merged ? "merged 1 commit into" : "wants to merge 1 commit into"}{" "}
          <code className="whitespace-nowrap rounded-md bg-[#ddf4ff] px-[6px] py-[2px] font-mono text-[12px] text-[#0969da]">main</code> from{" "}
          <code className="whitespace-nowrap rounded-md bg-[#ddf4ff] px-[6px] py-[2px] font-mono text-[12px] text-[#0969da]">{branch}</code>
        </p>
      </div>

      <ol className="relative m-0 mt-[24px] list-none p-0">
        {items.map((item, i) => {
          const done = i < active;
          const live = i === active;
          const fade = `transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
            done || live ? "translate-y-0 scale-100 opacity-100" : "translate-y-[12px] scale-[0.98] opacity-0"
          }`;
          // The timeline: GitHub runs it 16px in from the comment boxes' left edge. Each piece
          // draws down from this item to the next as the next appears
          const link = i < items.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute bottom-0 left-[64px] top-0 w-[2px] -translate-x-1/2 bg-[#d0d7de] origin-top transition-transform duration-[500ms] ease-out motion-reduce:transition-none ${
                i + 1 <= active ? "scale-y-100" : "scale-y-0"
              }`}
            />
          );

          if (item.kind === "event") {
            const approved = item.icon === "approved";
            return (
              <li key={item.text} className={`relative py-[16px] ${fade}`}>
                {link}
                <div className="relative flex items-center gap-[12px] pl-[54px]">
                  <span
                    className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-white ring-2 ring-surface transition-transform delay-[100ms] duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
                      done || live ? "scale-100" : "scale-50"
                    } ${
                      approved ? GH.green : GH.purple
                    }`}
                  >
                    <Octicon d={approved ? OCTICON.check : OCTICON.merge} size={12} />
                  </span>
                  <p className={`m-0 text-[14px] leading-[20px] ${GH.muted}`}>
                    <span className={`font-semibold ${GH.text}`}>{item.name}</span>{" "}
                    {/* A commit hash shows in GitHub's bold mono */}
                    {item.text.split(/\b([0-9a-f]{7})\b/).map((part, j) =>
                      j % 2 ? (
                        <code key={j} className={`font-mono text-[12px] font-semibold ${GH.text}`}>
                          {part}
                        </code>
                      ) : (
                        part
                      ),
                    )}{" "}
                    <span className="whitespace-nowrap">just now</span>
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
                <Avatar who={item.who} size={32} />
                <div
                  className="relative min-w-0 flex-1 rounded-md border border-[#d0d7de] bg-white shadow-[0_1px_2px_rgba(31,35,40,0.06)]"
                >
                  {/* The caret pointing at the avatar: a border-coloured triangle under a header-coloured one */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-[-8px] top-[8px] h-0 w-0 border-y-[8px] border-r-[8px] border-y-transparent border-r-[#d0d7de]`}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute left-[-6px] top-[10px] h-0 w-0 border-y-[6px] border-r-[6px] border-y-transparent border-r-[#f6f8fa]`}
                  />
                  <div
                    className={`flex items-center justify-between gap-[12px] rounded-t-md border-b px-[16px] py-[8px] md:px-[20px] text-[14px] leading-[24px] ${GH.border} ${GH.header} ${GH.muted}`}
                  >
                    <p className="m-0 min-w-0">
                    <span className={`font-semibold ${GH.text}`}>{item.name}</span>{" "}
                    <span aria-hidden="true">
                      {waiting || typingNow ? (
                        <>
                          is typing
                          <span className="ml-[4px] inline-flex gap-[2px]">
                            {[0, 1, 2].map((d) => (
                              <span
                                key={d}
                                className="inline-block h-[4px] w-[4px] animate-[thread-dot_1s_ease-in-out_infinite] rounded-full bg-current"
                                style={{ animationDelay: `${d * 160}ms` }}
                              />
                            ))}
                          </span>
                        </>
                      ) : (
                        item.verb
                      )}
                    </span>
                    <span className="sr-only">{item.verb}</span>
                    </p>
                    <span aria-hidden="true" className="flex shrink-0 items-center gap-[12px] text-[12px]">
                      {done || (live && phase === "done") ? "just now" : ""}
                      <Octicon d={OCTICON.kebab} size={16} />
                    </span>
                  </div>
                  <div className="relative p-[16px] md:px-[20px]">
                    <p className="invisible m-0 text-[14px] leading-[22px] md:text-[16px] md:leading-[26px]">
                      <span className="sr-only !visible">{item.text}</span>
                      <span aria-hidden="true">{item.text}</span>
                    </p>
                    <p
                      aria-hidden="true"
                      className="absolute inset-0 m-0 p-[16px] text-[14px] leading-[22px] md:px-[20px] md:text-[16px] md:leading-[26px]"
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

      {/* The path a change takes, filling in step with the thread */}
      <ol className="m-0 mt-[64px] grid list-none grid-cols-1 gap-[16px] p-0 md:mt-[80px] md:grid-cols-4 md:gap-[8px]">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-[16px] md:flex-col">
            <span aria-hidden="true" className="relative w-[4px] shrink-0 overflow-hidden rounded-full bg-[#d0d7de]/50 md:h-[8px] md:w-full">
              <span
                className={`absolute inset-0 rounded-full transition-transform duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
                  STEP_TONE[i % STEP_TONE.length]
                } origin-top md:origin-left ${lit(i) ? "scale-100" : "scale-y-0 md:scale-x-0 md:scale-y-100"}`}
              />
            </span>
            <div className="flex flex-col gap-[4px]">
              <span
                className={`text-[16px] font-medium leading-[24px] transition-colors duration-[400ms] ${lit(i) ? GH.text : GH.muted}`}
              >
                {step.title}
              </span>
              <span className={`text-[14px] leading-[22px] ${GH.muted}`}>{step.text}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
