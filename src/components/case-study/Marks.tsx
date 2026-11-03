"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pen-and-paper marks for the words that matter, drawn once as they scroll into view:
 * Highlight sweeps a pink highlighter across a phrase; Circled loops a pen line around a
 * number. With reduced motion they're simply there. Use them sparingly — one or two a section.
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
      { threshold: 1, rootMargin: "0px 0px -15% 0px" },
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
      <svg viewBox="0 0 40 30" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M24 3 C 7 1, -1 13, 7 23 C 16 32, 38 27, 38 15 C 38 5, 27 1, 15 4" />
      </svg>
    </span>
  );
}
