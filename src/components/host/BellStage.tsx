"use client";

// ── Bell stage ────────────────────────────────────────────────────────────────
// There's a bell in the navbar and a bell on the footer, but only one is ever up at a
// time. The footer bell says when it's on stage; while it is, the navbar bell ducks out
// of its spot and leaves its timer board hanging there instead (see NavHost), and when
// the footer leaves the screen they swap back. Each bell moves only in its own place.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface Stage {
  /** The footer bell is up, so the navbar bell keeps out of sight. */
  footerOnStage: boolean;
  setFooterOnStage(on: boolean): void;
}

const StageContext = createContext<Stage>({ footerOnStage: false, setFooterOnStage: () => {} });
export const useBellStage = () => useContext(StageContext);

export function BellStageProvider({ children }: { children: ReactNode }) {
  const [footerOnStage, setFooterOnStage] = useState(false);
  const value = useMemo(() => ({ footerOnStage, setFooterOnStage }), [footerOnStage]);
  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}
