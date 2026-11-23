// ── Locked case studies ───────────────────────────────────────────────────────
// A case study listed here needs a password. The password lives in an environment
// variable (set in Vercel's project settings, and in .env.local for development), never
// in the code. Entering it sets a signed, http-only cookie; middleware.ts checks that
// cookie before serving the page or any of its images and videos. The cover stays open,
// since the home page's work card shows it.
//
// The token is an HMAC of the case study's slug keyed by its password, so changing the
// password signs everyone out. Web Crypto, so it runs in middleware and API routes alike.

export type LockedCase = {
  title: string;
  cover: string;
  coverAlt: string;
  env: string; // name of the environment variable holding the password
  /** Used when the environment variable isn't set. It's in the public repo, so only for a
   *  card with nothing behind it yet; set the variable once real content goes in. */
  fallback?: string;
  /** No case study yet: the right password opens to a "coming soon" note, not a page. */
  comingSoon?: boolean;
  assets: string[]; // path prefixes served only once unlocked
  open: string[]; // exact paths that stay public (the cover)
};

export const LOCKED: Record<string, LockedCase> = {
  "ai-itinerary": {
    title: "Designing an AI-powered itinerary builder for modern travellers",
    cover: "/images/works-cover.png",
    coverAlt: "AI Trip Planning preview",
    env: "AI_ITINERARY_PASSWORD",
    fallback: "TCS search",
    comingSoon: true,
    assets: [],
    open: [],
  },
};

export const MAX_AGE = 60 * 60 * 24 * 30; // a month

/** The http-only cookie that proves the password was entered. */
export const cookieName = (slug: string) => `case-${slug}`;
/** A readable twin, so the page can tell it's open without asking the server. Proves nothing. */
export const flagName = (slug: string) => `case-${slug}-open`;

/** The locked case a path belongs to, and whether that path is its page or a file. */
export function lockedPath(path: string): { slug: string; kind: "page" | "asset" } | null {
  for (const [slug, c] of Object.entries(LOCKED)) {
    if (path === `/works/${slug}` || path.startsWith(`/works/${slug}/`)) return { slug, kind: "page" };
    if (c.open.includes(path)) return null;
    if (c.assets.some((prefix) => path.startsWith(prefix))) return { slug, kind: "asset" };
  }
  return null;
}

const encoder = new TextEncoder();

/** Passwords are forgiving about case and spaces: "TCS search", "tcs search" and
 *  "tcssearch" all match. */
const loose = (password: string) => password.toLowerCase().replace(/\s+/g, "");

export async function tokenFor(slug: string, password: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(loose(password)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`case:${slug}`)));
  let bin = "";
  for (const b of sig) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Compares two strings in time that doesn't depend on where they first differ. */
export function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function passwordFor(slug: string): string | undefined {
  const c = LOCKED[slug];
  return c ? process.env[c.env] || c.fallback || undefined : undefined;
}

/** Whether a cookie value unlocks this case study. */
export async function isUnlocked(slug: string, cookie: string | undefined): Promise<boolean> {
  const password = passwordFor(slug);
  if (!password || !cookie) return false;
  return sameText(cookie, await tokenFor(slug, password));
}
