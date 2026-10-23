"use client";

// ── Curiosity bubble ──────────────────────────────────────────────────────────
// The host speaking up. When active time crosses a milestone (see milestones.ts),
// or the visit becomes the longest ever, a tooltip rises in under the host, holds
// while it's read, then tucks itself away.
//
// A tooltip, not a toast: a compact dark box anchored to the bell by a small pointer,
// holding just the line, which types out as the bell says it. It fades in quickly,
// pauses while hovered, and closes on its own (or on click). Positioned by its
// parent, out of the layout, so it never nudges the host or the navbar.
//
// Each milestone fires once per visit — what's been said is kept in sessionStorage,
// so a reload doesn't repeat it. Nothing fires while the clock is paused: if they've
// stepped away, there's no one to talk to.
//
// Rank milestones ask the server for a percentile first. If that's slow or fails,
// the milestone's fallback line is used instead — the bubble never waits long.
//
// The bubble opens at full size straight away, then the line types itself out with
// a beat after each punctuation mark, so it reads as being said rather than shown.
// It stays up for a reading pause once typed. Screen readers get the whole line at
// once; with reduced motion it simply appears.
// All values are multiples of 2/4px.

import { useCallback, useEffect, useRef, useState } from "react";
import { useCuriosity } from "@/context/CuriosityContext";
import { RANK_PATH, type RankResult } from "@/lib/curiosity/config";
import {
  HOLD_BASE_MS,
  HOLD_PER_CHAR_MS,
  MILESTONES,
  TYPE_MS_PER_CHAR,
  TYPE_PAUSE_MS,
  sayRecord,
} from "@/lib/curiosity/milestones";

const SEEN_KEY = "ash.curiosity.seen"; // sessionStorage — one visit's worth
const RANK_TIMEOUT_MS = 2_500;
const LEAVE_MS = 200;

function loadSeen(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // Blocked storage — worst case a reload repeats a line
  }
}

const PAUSE_AFTER = /[,.?!—]/;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Delay before typing character i — slower straight after punctuation. */
function charDelay(line: string, i: number) {
  return i > 0 && PAUSE_AFTER.test(line[i - 1]) ? TYPE_MS_PER_CHAR + TYPE_PAUSE_MS : TYPE_MS_PER_CHAR;
}

/** How long a line takes to type out, then how long it stays up to be read. */
function bubbleTiming(line: string) {
  let typeMs = 0;
  if (!prefersReducedMotion()) for (let i = 0; i < line.length; i++) typeMs += charDelay(line, i);
  return { typeMs, holdMs: HOLD_BASE_MS + line.length * HOLD_PER_CHAR_MS };
}

async function fetchPercentile(visitorId: string, seconds: number): Promise<number | null> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), RANK_TIMEOUT_MS);
  try {
    const res = await fetch(`${RANK_PATH}?v=${encodeURIComponent(visitorId)}&s=${seconds}`, { signal: ctrl.signal });
    const data = (await res.json()) as RankResult;
    return data.percentile;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export interface Bubble {
  /** The whole line, or null when the host is quiet. */
  message: string | null;
  /** "record" for the longest-visit-ever line, otherwise a regular milestone. */
  kind: "milestone" | "record";
  /** Active seconds when it was said, for the subhead. */
  stamp: number;
  typeMs: number;
  holdMs: number;
  /** Percentile out-stayed when the line is about rank, otherwise null. */
  percentile: number | null;
  /** As much of the line as has been "said" so far. */
  typed: string;
  /** True while the line is still being typed out. */
  talking: boolean;
  leaving: boolean;
  dismiss: () => void;
  /** Hold the countdown while the card is hovered, and pick it back up after. */
  pause: () => void;
  resume: () => void;
}


/**
 * Watches the clock and hands back whatever the host should be saying right now.
 * `record` is true once this visit is the longest ever — that line jumps the queue.
 */
export function useMilestoneBubble(record = false): Bubble {
  const { visitorId, activeSeconds, paused } = useCuriosity();
  const [message, setMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    kind: "milestone" as Bubble["kind"],
    stamp: 0,
    typeMs: 0,
    holdMs: 0,
    percentile: null as number | null,
  });
  const [leaving, setLeaving] = useState(false);
  const busy = useRef(false);
  const seen = useRef<Set<string> | null>(null);
  const timers = useRef<number[]>([]);
  // When the card is due to close, and how much was left when it was paused
  const deadline = useRef(0);
  const remaining = useRef<number | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const dismiss = useCallback(() => {
    clearTimers();
    setLeaving(true);
    timers.current.push(
      window.setTimeout(() => {
        setMessage(null);
        setLeaving(false);
        busy.current = false;
      }, LEAVE_MS),
    );
  }, []);

  useEffect(() => {
    if (!visitorId || paused || busy.current) return;
    seen.current ??= loadSeen();
    const recordDue = record && !seen.current.has("record");
    const next = recordDue ? null : MILESTONES.find((m) => m.at <= activeSeconds && !seen.current!.has(m.id));
    if (!recordDue && !next) return;

    busy.current = true;
    seen.current.add(recordDue ? "record" : next!.id);
    saveSeen(seen.current);
    const stamp = activeSeconds;

    (async () => {
      const percentile = next?.rank ? await fetchPercentile(visitorId, stamp) : null;
      const touch = window.matchMedia("(hover: none)").matches;
      const line = recordDue ? sayRecord() : next!.say({ percentile, touch });
      const timing = bubbleTiming(line);
      setMeta({ kind: recordDue ? "record" : "milestone", stamp, percentile, ...timing });
      setMessage(line);
      setLeaving(false);
      remaining.current = null;
      deadline.current = Date.now() + timing.typeMs + timing.holdMs;
      timers.current.push(window.setTimeout(dismiss, timing.typeMs + timing.holdMs));
    })();
  }, [visitorId, activeSeconds, paused, record, dismiss]);

  useEffect(() => clearTimers, []);

  const typed = useTypedLine(message);
  const talking = message !== null && typed.length < message.length;

  const pause = useCallback(() => {
    if (remaining.current !== null) return;
    remaining.current = Math.max(0, deadline.current - Date.now());
    clearTimers();
  }, []);

  const resume = useCallback(() => {
    if (remaining.current === null) return;
    const left = remaining.current;
    remaining.current = null;
    deadline.current = Date.now() + left;
    timers.current.push(window.setTimeout(dismiss, left));
  }, [dismiss]);

  return { message, ...meta, typed, talking, leaving, dismiss, pause, resume };
}

/** Types `line` out one character at a time, at speaking pace. */
function useTypedLine(line: string | null) {
  // The count is tied to the line it belongs to, so a new line starts from nothing
  // instead of flashing the previous line's length for a frame
  const [progress, setProgress] = useState<{ line: string | null; count: number }>({ line: null, count: 0 });

  useEffect(() => {
    if (!line) return;
    if (prefersReducedMotion()) {
      setProgress({ line, count: line.length });
      return;
    }
    let i = 0;
    let timer: number;
    const step = () => {
      i += 1;
      setProgress({ line, count: i });
      if (i < line.length) timer = window.setTimeout(step, charDelay(line, i));
    };
    timer = window.setTimeout(step, charDelay(line, 0));
    return () => window.clearTimeout(timer);
  }, [line]);

  return line && progress.line === line ? line.slice(0, progress.count) : "";
}

/**
 * The tooltip itself. The pointer sits under the bell's centre; `pointerFromMd` hides
 * it on small screens for pages where the bell isn't shown there.
 */
export default function CuriosityBubble({ bubble, pointerFromMd = false }: { bubble: Bubble; pointerFromMd?: boolean }) {
  if (!bubble.message) return null;

  return (
    <div
      onMouseEnter={bubble.pause}
      onMouseLeave={bubble.resume}
      onClick={bubble.dismiss}
      className={`host-tip ${bubble.leaving ? "is-leaving" : ""} relative w-max max-w-[min(260px,calc(100vw-40px))] cursor-pointer`}
    >
      {/* Pointer, up to the bell */}
      <span
        aria-hidden="true"
        className={`${pointerFromMd ? "hidden md:block" : "block"} absolute -top-[4px] left-[26px] w-[8px] h-[8px] rotate-45 rounded-[1px] bg-midnight`}
      />
      {/* The full line sizes the box (invisibly) so it doesn't grow as it types */}
      <p className="relative grid rounded-[8px] bg-midnight px-[12px] py-[8px] font-geist font-normal text-[14px] leading-[20px] text-white shadow-[0_8px_20px_rgba(30,5,37,0.22)]">
        <span aria-hidden="true" className="invisible [grid-area:1/1]">{bubble.message}</span>
        <span aria-hidden="true" className="[grid-area:1/1]">{bubble.typed}</span>
        <span role="status" aria-live="polite" className="sr-only">{bubble.message}</span>
      </p>
    </div>
  );
}
