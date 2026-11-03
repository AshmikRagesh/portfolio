"use client";

import { useEffect, useRef, useState } from "react";
import { playMarker, primeMarker } from "./markerSound";

/**
 * Pen-and-paper marks for the words that matter, drawn once as they scroll into view:
 * Highlight sweeps a pink highlighter across a phrase; Circled scribbles a quick pen loop
 * round a number. A highlight draws with the faintest marker-on-paper sound (see
 * markerSound.ts), once the visitor has clicked or tapped the page. With reduced motion
 * they're simply there, silently. A mark the reader scrolled past without it coming
 * into view (a jump to a later section) is drawn silently, so none is left blank.
 * Mark the point a skimmer must not miss, in running text, never inside a card; a
 * circle only for the one number that tells the story.
 */
function useSeenOnce<T extends Element>(onSeen?: () => void) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    let done = false;
    const finish = (sound: boolean) => {
      if (done) return;
      done = true;
      setSeen(true);
      if (sound) onSeen?.();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && finish(true),
      { threshold: 0.6, rootMargin: "0px 0px -15% 0px" },
    );
    // Scrolled past it unseen: show it, quietly
    const onScroll = () => el.getBoundingClientRect().bottom < 0 && finish(false);
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [onSeen]);
  return [ref, seen] as const;
}

// The sound starts with the sweep, which waits a beat (see .cs-marker)
const markerStroke = () => window.setTimeout(playMarker, 150);

export function Highlight({ children }: { children: React.ReactNode }) {
  useEffect(primeMarker, []);
  const [ref, seen] = useSeenOnce<HTMLElement>(markerStroke);
  return (
    <mark ref={ref} data-seen={seen} className="cs-marker">
      {children}
    </mark>
  );
}

export function Circled({ children }: { children: React.ReactNode }) {
  const [ref, seen] = useSeenOnce<HTMLSpanElement>();
  return (
    <span ref={ref} data-seen={seen} className="cs-circled">
      {children}
      {/* A loop and a bit: round the number, past the start, and off in a small tail */}
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M64 7 C 32 1, 5 13, 6 33 C 7 53, 42 59, 72 54 C 95 50, 99 29, 89 16 C 80 4, 55 2, 32 9 C 22 12, 16 17, 14 22" />
      </svg>
    </span>
  );
}
