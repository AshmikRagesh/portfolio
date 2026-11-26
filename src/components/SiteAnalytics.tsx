"use client";

// ── Vercel Web Analytics ──────────────────────────────────────────────────────
// Page views for the Vercel dashboard (visitors, page views, bounce rate,
// referrers, countries, devices). Same exclusions as Curiosity where the browser
// can tell: a browser marked as Ashmik's on /stats (the readable ash_owner flag)
// and scripted browsers send nothing. His marked networks can't be seen from the
// browser, so phones on his Wi-Fi still count here unless marked themselves.

import { Analytics } from "@vercel/analytics/next";

function skip() {
  if (typeof navigator !== "undefined" && navigator.webdriver) return true;
  return typeof document !== "undefined" && /(?:^|;\s*)ash_owner=1/.test(document.cookie);
}

export default function SiteAnalytics() {
  return <Analytics beforeSend={(event) => (skip() ? null : event)} />;
}
