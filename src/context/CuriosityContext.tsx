"use client";

// ── Curiosity clock ───────────────────────────────────────────────────────────
// Measures how long someone is actually here — not how long the tab is open.
//
// The clock only moves while the visitor is present: the tab is visible AND they've
// scrolled, moved the pointer, typed or touched within the last IDLE_TIMEOUT_MS.
// Step away and it pauses; come back and it picks up where it left off. The quiet
// stretch before it pauses still counts — that's usually someone reading.
//
// It lives above the routes (GlobalLayout), so moving between pages never restarts
// it, and it's written back to storage so a reload resumes it too.
//
// While the visit is active it reports every HEARTBEAT_MS, and sends one last
// report when the tab is hidden or closed.

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  HEARTBEAT_MS,
  IDLE_TIMEOUT_MS,
  MAX_TICK_MS,
  PERSIST_MS,
  TICK_MS,
} from "@/lib/curiosity/config";
import { loadSession, saveSession, type VisitorRecord, type VisitRecord } from "@/lib/curiosity/visitor";
import { referrerHost, report, viewportBucket } from "@/lib/curiosity/report";

interface CuriosityValue {
  /** Active seconds this visit. */
  activeSeconds: number;
  /** Active seconds across every visit from this browser. */
  lifetimeSeconds: number;
  /** Which visit this is for this browser — 1 on a first visit. */
  visits: number;
  /** True while the clock is paused (tab hidden or visitor idle). */
  paused: boolean;
}

const CuriosityContext = createContext<CuriosityValue>({
  activeSeconds: 0,
  lifetimeSeconds: 0,
  visits: 0,
  paused: false,
});

const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "scroll", "wheel", "touchstart"] as const;

interface ClockState {
  visitor: VisitorRecord;
  visit: VisitRecord;
  /** Lifetime active time from earlier visits — this visit's time is added on top. */
  priorLifetimeMs: number;
  referrer: string;
  lastTick: number;
  lastActivity: number;
  lastPersist: number;
  lastBeat: number;
  /** Active seconds at the last report, so an unchanged visit doesn't re-send. */
  lastReported: number;
}

export function CuriosityProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<CuriosityValue>({ activeSeconds: 0, lifetimeSeconds: 0, visits: 0, paused: false });
  const clock = useRef<ClockState | null>(null);
  const pathRef = useRef("/");
  const pathname = usePathname();

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const { visitor, visit } = loadSession();
    const now = Date.now();
    const s: ClockState = {
      visitor,
      visit,
      priorLifetimeMs: Math.max(0, visitor.lifetimeMs - visit.activeMs),
      referrer: referrerHost(),
      lastTick: now,
      lastActivity: now,
      lastPersist: now,
      lastBeat: now,
      lastReported: 0, // nothing worth sending until there's at least a second
    };
    clock.current = s;

    const sync = (paused: boolean) => {
      s.visitor.lifetimeMs = s.priorLifetimeMs + s.visit.activeMs;
      setValue((prev) => {
        const next = {
          activeSeconds: Math.floor(s.visit.activeMs / 1000),
          lifetimeSeconds: Math.floor(s.visitor.lifetimeMs / 1000),
          visits: s.visitor.visits,
          paused,
        };
        // Skip the re-render when nothing visible changed (e.g. every tick while paused)
        return prev.activeSeconds === next.activeSeconds && prev.paused === next.paused && prev.visits === next.visits
          ? prev
          : next;
      });
    };

    const send = (final: boolean) => {
      const activeSeconds = Math.floor(s.visit.activeMs / 1000);
      if (activeSeconds === s.lastReported) return;
      s.lastReported = activeSeconds;
      report({
        visitorId: s.visitor.id,
        visitId: s.visit.id,
        activeSeconds,
        lifetimeSeconds: Math.floor(s.visitor.lifetimeMs / 1000),
        visits: s.visitor.visits,
        path: pathRef.current,
        referrer: s.referrer,
        viewport: viewportBucket(),
        final,
      });
    };

    const tick = () => {
      const t = Date.now();
      const delta = Math.min(t - s.lastTick, MAX_TICK_MS);
      s.lastTick = t;

      const paused = document.hidden || t - s.lastActivity > IDLE_TIMEOUT_MS;
      if (!paused) s.visit.activeMs += delta;
      sync(paused);

      if (t - s.lastPersist >= PERSIST_MS) {
        s.lastPersist = t;
        saveSession(s.visitor, s.visit);
      }
      if (!paused && t - s.lastBeat >= HEARTBEAT_MS) {
        s.lastBeat = t;
        send(false);
      }
    };

    const markActivity = () => {
      const t = Date.now();
      const wasIdle = t - s.lastActivity > IDLE_TIMEOUT_MS;
      s.lastActivity = t;
      if (wasIdle) {
        // Coming back from idle: don't back-pay the gap, and un-pause immediately
        s.lastTick = t;
        sync(document.hidden);
      }
    };

    // Leaving: bank the time and send the closing report. visibilitychange is the
    // reliable signal on mobile Safari, which often skips pagehide altogether.
    const leave = () => {
      tick();
      saveSession(s.visitor, s.visit);
      send(true);
    };
    const onVisibility = () => {
      if (document.hidden) leave();
      else {
        s.lastTick = Date.now();
        s.lastActivity = Date.now();
        sync(false);
      }
    };

    sync(false);
    const id = window.setInterval(tick, TICK_MS);
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, markActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leave);

    return () => {
      window.clearInterval(id);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, markActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
      saveSession(s.visitor, s.visit);
    };
  }, []);

  return <CuriosityContext.Provider value={value}>{children}</CuriosityContext.Provider>;
}

export const useCuriosity = () => useContext(CuriosityContext);
