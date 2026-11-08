"use client";

// ── Bella in the browser tab ──────────────────────────────────────────────────
// The tab is the only part of the site anyone sees while they're away, so Bella's
// dozing shows there: while the clock is paused the favicon closes its eyes, and
// while the tab is hidden its title says where the clock stopped. Both go back the
// moment the visitor returns.
//
// The awake icon is app/icon.svg; this swaps the same drawing with its eyes shut.

import { useEffect, useRef } from "react";
import { useCuriosity } from "@/context/CuriosityContext";
import { formatDuration } from "@/components/host/clock";

const BELL = (eyes: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="36 112 128 128"><rect x="90" y="124" width="20" height="18" rx="5" fill="#9D136A"/><path d="M48 214 Q48 140 100 140 Q152 140 152 214 Z" fill="#3e0d4b"/>${eyes}<rect x="36" y="210" width="128" height="18" rx="8" fill="#9D136A"/></svg>`;
const AWAKE = BELL('<ellipse cx="83" cy="178" rx="10" ry="13" fill="#fff"/><ellipse cx="117" cy="178" rx="10" ry="13" fill="#fff"/>');
const DOZING = BELL('<g stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"><path d="M72 180 Q83 190 94 180"/><path d="M106 180 Q117 190 128 180"/></g>');
const href = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

export default function TabPresence() {
  const { paused, activeSeconds, visitorId } = useCuriosity();
  const title = useRef<string | null>(null);
  const seconds = useRef(activeSeconds);
  seconds.current = activeSeconds;

  // Favicon: eyes shut while the clock is paused
  useEffect(() => {
    if (!visitorId) return;
    let link = document.querySelector<HTMLLinkElement>('link[data-bella="1"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.dataset.bella = "1";
      document.head.appendChild(link);
    }
    link.href = href(paused ? DOZING : AWAKE);
  }, [paused, visitorId]);

  // Title: "Paused at 4m 16s · Ashmik" while the tab is hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        title.current = document.title;
        document.title = `Paused at ${formatDuration(seconds.current)} · Ashmik`;
      } else if (title.current !== null) {
        document.title = title.current;
        title.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}
