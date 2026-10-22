"use client";

import { useEffect, useState } from "react";

// Same key as the live NavTimer, so the "stay" continues across pages.
const VISIT_KEY = "ash_visit_start";
const PASSPORT_KEY = "guesthouse_passport";
const PASSPORT_EVENT = "guesthouse-passport";

export function formatStay(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Seconds since this tab "checked in". */
export function useStay() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let start = Date.now();
    try {
      const stored = sessionStorage.getItem(VISIT_KEY);
      if (stored) start = parseInt(stored, 10);
      else sessionStorage.setItem(VISIT_KEY, String(start));
    } catch {
      /* storage blocked — count from now */
    }
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return elapsed;
}

function readPassport(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PASSPORT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Rooms (case studies) this visitor has opened — remembered in this browser. */
export function usePassport() {
  const [stamps, setStamps] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setStamps(readPassport());
    sync();
    window.addEventListener(PASSPORT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PASSPORT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const stamp = (room: string) => {
    const next = Array.from(new Set([...readPassport(), room]));
    try {
      localStorage.setItem(PASSPORT_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked — still show it for this session */
    }
    setStamps(next);
    window.dispatchEvent(new Event(PASSPORT_EVENT));
  };

  const reset = () => {
    try {
      localStorage.removeItem(PASSPORT_KEY);
    } catch {
      /* ignore */
    }
    setStamps([]);
    window.dispatchEvent(new Event(PASSPORT_EVENT));
  };

  return { stamps, stamp, reset };
}
