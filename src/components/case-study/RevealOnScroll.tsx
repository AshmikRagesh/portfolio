"use client";

import { useEffect } from "react";

/**
 * Reveals a case study as it's read: every chapter heading, every block in the reading
 * column (paragraphs, headings, lists, cards) and every visual rises in once as it
 * scrolls into view. The class is added here, so without script nothing is hidden;
 * with reduced motion nothing moves. Blocks with their own entrance motion still run
 * it inside the reveal.
 */
const BLOCKS = ".cs-chapter > .cs-column > .cs-h2, .cs-copy > *, .cs-visual";

export default function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("[data-cs-main]");
    if (!main) return;
    const blocks = [...main.querySelectorAll<HTMLElement>(BLOCKS)];

    // Checked on scroll rather than with an observer, so blocks skipped by a jump (the
    // section pill, a link to a chapter) are revealed too, not left hidden above
    let pending: HTMLElement[] = [];
    blocks.forEach((el) => {
      // Already on screen at load: show without a jump
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add("cs-reveal");
      pending.push(el);
    });

    let raf = 0;
    const check = () => {
      raf = 0;
      const line = window.innerHeight * 0.92;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top > line) return true;
        el.classList.add("is-in");
        return false;
      });
      if (!pending.length) stop();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
