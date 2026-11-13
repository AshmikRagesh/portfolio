// ── Owner switch ──────────────────────────────────────────────────────────────
// Lets Ashmik mark a browser as his, from /stats (behind STATS_KEY). A marked
// browser isn't counted by Curiosity (no visit, time, guest number or events) and
// its case study feedback is saved as a test comment, so he can try things on the
// live site without changing the real numbers.
//
//   site_owner  httpOnly cookie, an HMAC of STATS_KEY — what the server trusts
//   ash_owner   readable cookie, "1" — only drives the small "Owner" badge

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const OWNER_COOKIE = "site_owner";
export const OWNER_FLAG = "ash_owner";
export const OWNER_MAX_AGE = 60 * 60 * 24 * 365;

export function ownerToken() {
  const key = process.env.STATS_KEY;
  return key ? createHmac("sha256", key).update("site-owner").digest("hex") : null;
}

/** True when the current request comes from a browser marked as Ashmik's. */
export async function isOwner() {
  const expected = ownerToken();
  const given = (await cookies()).get(OWNER_COOKIE)?.value;
  if (!expected || !given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
