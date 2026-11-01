"use client";

// ── Bella's director ──────────────────────────────────────────────────────────
// Watches for the rewards that don't belong to one place on the page:
//   arrival      Back again for a new day, and a welcome back with a link to where the
//                visitor was reading (lib/bella/progress arrive()).
//   Screening    45 seconds of watching videos the visitor started.
// Room keys come from CaseStudyTracker; First ring, Front desk and the resume from the
// bells and the navbar.
//
// In development, `?bella=celebrate|key|stamp|welcome` plays a sample moment for review.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCuriosity } from "@/context/CuriosityContext";
import { isWatching } from "@/lib/curiosity/watching";
import { arrive, awardStamp, pushMoment, type Moment } from "@/lib/bella/progress";

const SAMPLES: Record<string, Moment> = {
  celebrate: { kind: "celebrate", line: "Two case studies in one visit.", stamp: "two" },
  key: { kind: "key", room: "101", line: "Room key 101: Helix." },
  stamp: { kind: "stamp", stamp: "ring", line: "New stamp: First ring." },
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
        awardStamp("screen");
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
