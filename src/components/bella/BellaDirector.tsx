"use client";

// ── Bella's director ──────────────────────────────────────────────────────────
// Watches for the rewards that don't belong to one place on the page:
//   arrival      on a new day, a welcome back with a link to where the visitor was
//                reading (lib/bella/progress arrive()).
//   videos       45 seconds of watching walkthrough videos the visitor started.
// Finished case studies come from CaseStudyTracker; the email and the resume from the
// footer and the résumé sheet.
//
// In development, `?bella=celebrate|welcome` plays a sample moment for review.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCuriosity } from "@/context/CuriosityContext";
import { isWatching } from "@/lib/curiosity/watching";
import { arrive, celebrate, pushMoment, type Moment } from "@/lib/bella/progress";

const SAMPLES: Record<string, Moment> = {
  celebrate: { kind: "celebrate", line: "Two case studies in one visit." },
  welcome: { kind: "welcome", line: "Welcome back. You were reading Helix, Research.", href: "/works/helix", link: "Continue" },
};

const SCREENING_SECONDS = 45;

export default function BellaDirector() {
  const { visitorId, visits } = useCuriosity();
  const pathname = usePathname();
  const arrived = useRef(false);

  useEffect(() => {
    if (!visitorId || arrived.current) return;
    arrived.current = true;
    arrive(visits, pathname);
    if (process.env.NODE_ENV !== "production") {
      const sample = SAMPLES[new URLSearchParams(window.location.search).get("bella") ?? ""];
      if (sample) pushMoment(sample, 1200);
    }
  }, [visitorId, visits, pathname]);

  useEffect(() => {
    let watched = 0;
    const id = window.setInterval(() => {
      if (!isWatching() || document.hidden) return;
      if (++watched >= SCREENING_SECONDS) {
        celebrate("video", "You watched the walkthroughs.");
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
