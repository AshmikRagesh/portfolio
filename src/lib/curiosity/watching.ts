"use client";

// ── Watching ──────────────────────────────────────────────────────────────────
// A video the visitor chose to play counts as being here, even when they don't
// scroll, move the pointer or type for a while. Players report while something the
// visitor started is playing; the clock keeps running and Bella puts on 3D glasses.
//
// A silent clip that plays itself as it scrolls past doesn't report: nobody chose it,
// so it says nothing about attention.

import { useEffect, useId, useSyncExternalStore } from "react";
import { track } from "./report";

const sources = new Set<string>();
const listeners = new Set<() => void>();

function set(id: string, on: boolean) {
  const before = sources.size > 0;
  if (on) sources.add(id);
  else sources.delete(id);
  if (before !== sources.size > 0) listeners.forEach((l) => l());
  if (!before && on) track("video_watch");
}

export const isWatching = () => sources.size > 0;

export function onWatchingChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Report from a player: true while it plays a video the visitor started. */
export function useReportWatching(on: boolean) {
  const id = useId();
  useEffect(() => {
    set(id, on);
    return () => set(id, false);
  }, [id, on]);
}

/** True while any video the visitor started is playing. */
export function useWatching() {
  return useSyncExternalStore(onWatchingChange, isWatching, () => false);
}
