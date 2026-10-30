"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once the element has scrolled into view (and stays true), for motion that plays
 * once. With reduced motion it's true straight away, so everything simply shows.
 */
export default function useInView<T extends Element>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, shown] as const;
}
