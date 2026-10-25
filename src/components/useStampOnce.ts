"use client";

import { useEffect, type RefObject } from "react";

// Presses a rubber stamp once: sets data-stamped on the nearest .group card the first
// time it's hovered or focused, or — on touch screens, which can't hover — once it
// scrolls into view. `on: "view"` always waits for scroll-in instead, for stamps that
// mark something and shouldn't need a hover to appear. The press itself is CSS
// (.nda-stamp / .shipped-stamp in globals.css).
export function useStampOnce(ref: RefObject<Element | null>, on: "hover" | "view" = "hover") {
  useEffect(() => {
    const card = ref.current?.closest<HTMLElement>(".group");
    if (!card) return;
    const stamp = () => card.setAttribute("data-stamped", "true");

    // Mouse/trackpad + keyboard: first hover or focus
    if (on === "hover" && window.matchMedia("(hover: hover)").matches) {
      const once = () => {
        stamp();
        card.removeEventListener("pointerenter", once);
        card.removeEventListener("focusin", once);
      };
      card.addEventListener("pointerenter", once);
      card.addEventListener("focusin", once);
      return () => {
        card.removeEventListener("pointerenter", once);
        card.removeEventListener("focusin", once);
      };
    }

    // Touch: on scroll-in
    if (!("IntersectionObserver" in window)) {
      stamp();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stamp();
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(card);
    return () => io.disconnect();
  }, [ref, on]);
}
