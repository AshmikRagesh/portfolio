// ── Curiosity: reporting ──────────────────────────────────────────────────────
// Sends the visit's numbers to our own API route. Heartbeats go out as a normal
// keepalive fetch; the closing report uses sendBeacon, which the browser promises
// to deliver even while the tab is being torn down. Failures are silent — this
// must never surface an error to a visitor.

import { EVENT_PATH, INGEST_PATH, type BellaEvent, type CuriosityPayload } from "./config";

// The clock hands over its IDs once loaded, so events can be tied to this visit
const ids = { visitorId: "", visitId: "" };
const sent = new Set<string>();
export function setReportIds(visitorId: string, visitId: string) {
  ids.visitorId = visitorId;
  ids.visitId = visitId;
}

/** Note that the visitor did something with Bella. Sent at most once per event per page load;
 *  the server counts it once per visit. */
export function track(event: BellaEvent) {
  if (!ids.visitId || sent.has(event)) return;
  sent.add(event);
  fetch(EVENT_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...ids, event }),
    keepalive: true,
  }).catch(() => {});
}

export function report(payload: CuriosityPayload) {
  const body = JSON.stringify(payload);

  if (payload.final && typeof navigator !== "undefined" && navigator.sendBeacon) {
    const queued = navigator.sendBeacon(INGEST_PATH, new Blob([body], { type: "application/json" }));
    if (queued) return;
  }

  fetch(INGEST_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function viewportBucket(): CuriosityPayload["viewport"] {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/** Referrer host only — "linkedin.com", not the full URL with its tracking params. */
export function referrerHost(): string {
  try {
    if (!document.referrer) return "";
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host === window.location.hostname ? "" : host;
  } catch {
    return "";
  }
}
