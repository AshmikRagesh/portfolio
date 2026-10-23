// ── Curiosity: shared config ──────────────────────────────────────────────────
// Tunables for the visit clock and its reporting beacon. Imported by both the
// client engine and the API route, so this file stays free of browser/node APIs.

/** No scroll, pointer, key or touch for this long → the clock pauses. */
export const IDLE_TIMEOUT_MS = 30_000;

/** How often the clock re-reads the wall clock and repaints. */
export const TICK_MS = 1_000;

/** Ceiling on what one tick may add — guards against OS sleep and tab throttling. */
export const MAX_TICK_MS = 2_000;

/** How often an active visit phones home while the tab is still open. */
export const HEARTBEAT_MS = 20_000;

/** Active time is written back to sessionStorage this often, so a reload resumes. */
export const PERSIST_MS = 4_000;

/** Server-side sanity cap — one visit can never report more than two hours. */
export const MAX_VISIT_SECONDS = 7_200;

/** Server-side sanity cap on the lifetime total a client may claim. */
export const MAX_LIFETIME_SECONDS = 360_000;

export const VISITOR_KEY = "ash.curiosity.visitor"; // localStorage — survives forever
export const VISIT_KEY = "ash.curiosity.visit";     // sessionStorage — dies with the tab

export const INGEST_PATH = "/api/curiosity";

/** What the browser sends up. Deliberately holds nothing that identifies a person. */
export interface CuriosityPayload {
  visitorId: string;
  visitId: string;
  /** Active seconds in this visit — idle and backgrounded time already removed. */
  activeSeconds: number;
  /** Active seconds across every visit this browser has made. */
  lifetimeSeconds: number;
  /** How many separate visits this browser has made, including this one. */
  visits: number;
  /** Path at the time of sending. */
  path: string;
  /** Where they came from — host only, never the full URL. */
  referrer: string;
  viewport: "mobile" | "tablet" | "desktop";
  /** True when this is the closing beacon rather than a heartbeat. */
  final: boolean;
}
