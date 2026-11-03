"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pen-and-paper marks for the words that matter, drawn once as they scroll into view:
 * Highlight sweeps a pink highlighter across a phrase; Circled scribbles a quick pen loop
 * round a number. With reduced motion they're simply there. Use them sparingly: one key
 * point a section, and a circle only for the one number that tells the story.
 */
function useSeenOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { threshold: 0.6, rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

export function Highlight({ children }: { children: React.ReactNode }) {
  const [ref, seen] = useSeenOnce<HTMLElement>();
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
