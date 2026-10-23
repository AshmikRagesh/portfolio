"use client";

// ── useRecordHolder ───────────────────────────────────────────────────────────
// True once this visit has run longer than anyone else's longest visit, ever —
// the moment the host puts its crown on.
//
// The record to beat is fetched when the clock loads and refreshed every couple of
// minutes (someone else might be setting it right now). It only counts once at
// least MIN_RECORD_FIELD other visitors are on the board, so the second person to
// ever visit isn't crowned for beating one other visit. Once earned it sticks for
// the rest of the visit, even across reloads.

import { useEffect, useRef, useState } from "react";
import { useCuriosity } from "@/context/CuriosityContext";
import { MIN_RECORD_FIELD, RANK_PATH, type RankResult } from "@/lib/curiosity/config";

const RECORD_KEY = "ash.curiosity.record"; // sessionStorage
const REFRESH_MS = 120_000;

export function useRecordHolder(): boolean {
  const { visitorId, activeSeconds } = useCuriosity();
  const [leader, setLeader] = useState<number | null>(null);
  const [holder, setHolder] = useState(false);
  const seconds = useRef(activeSeconds);
  seconds.current = activeSeconds;

  useEffect(() => {
    try {
      if (sessionStorage.getItem(RECORD_KEY) === "1") setHolder(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!visitorId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${RANK_PATH}?v=${encodeURIComponent(visitorId)}&s=${seconds.current}`);
        const data = (await res.json()) as RankResult;
        if (!cancelled) setLeader(data.others >= MIN_RECORD_FIELD ? data.leader : null);
      } catch {
        // No record to chase this time — try again on the next refresh
      }
    };
    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [visitorId]);

  useEffect(() => {
    if (holder || leader === null || activeSeconds <= leader) return;
    setHolder(true);
    try {
      sessionStorage.setItem(RECORD_KEY, "1");
    } catch {}
  }, [holder, leader, activeSeconds]);

  return holder;
}
