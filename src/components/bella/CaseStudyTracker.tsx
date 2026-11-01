"use client";

// ── Case study tracker ────────────────────────────────────────────────────────
// On a case study page:
//   finished   once the footer comes into view after at least a minute of active time
//              on this case study, it's finished, which may set off a celebration
//              (lib/bella/progress finishCaseStudy).
//   reading    the chapter being read (the last one whose top has passed the middle of
//              the screen) is remembered, so a returning visitor can pick up there.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCuriosity } from "@/context/CuriosityContext";
import { finishCaseStudy, saveReading } from "@/lib/bella/progress";
import type { CaseStudySection } from "@/components/case-study/SectionPill";

const READ_SECONDS = 60;

export default function CaseStudyTracker({ sections }: { sections: CaseStudySection[] }) {
  const slug = usePathname().split("/")[2] ?? "";
  const { activeSeconds, visitorId } = useCuriosity();
  const start = useRef<number | null>(null);
  const [atEnd, setAtEnd] = useState(false);
  const finished = useRef(false);

  // Active time on this page counts from when the clock has loaded
  useEffect(() => {
    if (visitorId && start.current === null) start.current = activeSeconds;
  }, [visitorId, activeSeconds]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { threshold: 0.1 });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (finished.current || !atEnd || start.current === null) return;
    if (activeSeconds - start.current < READ_SECONDS) return;
    finished.current = true;
    finishCaseStudy(slug);
  }, [atEnd, activeSeconds, slug]);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - last < 1000) return;
      last = now;
      const mid = window.innerHeight / 2;
      let current: CaseStudySection | null = null;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < mid) current = s;
      }
      if (current) saveReading({ slug, section: current.label, sectionId: current.id, at: now });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections, slug]);

  return null;
}
