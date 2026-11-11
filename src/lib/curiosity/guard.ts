// ── Curiosity: abuse guards ───────────────────────────────────────────────────
// Per-IP rate limits for the curiosity routes and the /stats unlock. The IP is
// hashed with a server-only salt before it touches storage, so no raw IP is ever
// stored, and the counter keys expire with their window.
//
// With Upstash configured, counters live in Redis (INCR + EXPIRE NX, so the window
// starts at the first hit). Without it, an in-memory map stands in — enough for
// local testing, per server instance only.

import { createHash } from "node:crypto";
import { NS, pipeline, storeConfigured } from "./store";

// Falls back to the Redis token, which is already a server-only secret
const SALT = process.env.CURIOSITY_IP_SALT || process.env.UPSTASH_REDIS_REST_TOKEN || "local-dev-salt";

/** The caller's IP, hashed. Vercel sets x-forwarded-for; the first entry is the client. */
export function ipHash(headers: Headers) {
  const ip = headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${SALT}:${ip}`).digest("hex").slice(0, 32);
}

const memory = new Map<string, { count: number; resetAt: number }>();

/**
 * Count one hit (or, with peek, only check without counting) for this bucket and IP. True while the caller is within `limit`
 * hits per `windowSeconds`. Fails open if storage is down, so a Redis outage never
 * blocks a real visitor.
 */
export async function allow(bucket: string, hash: string, limit: number, windowSeconds: number, opts: { peek?: boolean } = {}) {
  const key = `${NS}:rl:${bucket}:${hash}`;
  if (!storeConfigured) {
    const now = Date.now();
    const entry = memory.get(key);
    if (opts.peek) return !entry || entry.resetAt <= now || entry.count < limit;
    if (!entry || entry.resetAt <= now) {
      memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  }
  try {
    if (opts.peek) {
      const [{ result }] = await pipeline([["GET", key]]);
      return Number(result ?? 0) < limit;
    }
    const [{ result: count }] = await pipeline([
      ["INCR", key],
      ["EXPIRE", key, windowSeconds, "NX"],
    ]);
    return Number(count) <= limit;
  } catch (err) {
    console.error("[curiosity] rate limit failed", err);
    return true;
  }
}

/** Shorthand for the 429 every guarded route sends. */
export function tooMany() {
  return new Response(null, { status: 429, headers: { "Retry-After": "60" } });
}
