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
import { ipHash } from "@/lib/curiosity/guard";
import { NS, pipeline, storeConfigured } from "@/lib/curiosity/store";

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

// ── Network switch ────────────────────────────────────────────────────────────
// The cookie only covers one browser. Marking a network (from /stats) stops
// Curiosity counting every device on it — phones, private windows, Claude's
// browser — until it's unmarked. Only the hashed IP is kept (see guard.ts), and
// a marked network never opens /stats or the feedback inbox: it only skips counting.

const NETWORKS = `${NS}:owner:networks`;

// Headless and scripted browsers (screenshots, link previews, crawlers) aren't visitors
const AUTOMATED = /headless|bot\b|crawler|spider|playwright|puppeteer|lighthouse|vercel-screenshot/i;

export async function isOwnNetwork(headers: Headers) {
  if (!storeConfigured) return false;
  try {
    const [{ result }] = await pipeline([["HEXISTS", NETWORKS, ipHash(headers)]]);
    return Number(result) === 1;
  } catch {
    return false;
  }
}

export async function setOwnNetwork(headers: Headers, on: boolean) {
  if (!storeConfigured) return;
  const hash = ipHash(headers);
  await pipeline([on ? ["HSET", NETWORKS, hash, Date.now()] : ["HDEL", NETWORKS, hash]]);
}

export async function forgetOwnNetworks() {
  if (storeConfigured) await pipeline([["DEL", NETWORKS]]);
}

export async function ownNetworkCount() {
  if (!storeConfigured) return 0;
  try {
    const [{ result }] = await pipeline([["HLEN", NETWORKS]]);
    return Number(result ?? 0);
  } catch {
    return 0;
  }
}

// Ashmik's own devices by Curiosity visitor ID, added by scripts/curiosity-remove-visitor.mjs
// when it takes a visitor's past visits out. Survives network changes; lost only if
// that browser's storage is cleared (it then gets a new ID).
const VISITORS = `${NS}:owner:visitors`;

/** True when Curiosity should ignore this request: Ashmik's browser, network or device, or an automated browser. */
export async function skipCounting(headers: Headers, visitorId?: string) {
  if (AUTOMATED.test(headers.get("user-agent") ?? "")) return true;
  if (await isOwner()) return true;
  if (!storeConfigured) return false;
  try {
    const [network, device] = await pipeline([
      ["HEXISTS", NETWORKS, ipHash(headers)],
      ["SISMEMBER", VISITORS, visitorId ?? ""],
    ]);
    return Number(network.result) === 1 || Number(device.result) === 1;
  } catch {
    return false;
  }
}
