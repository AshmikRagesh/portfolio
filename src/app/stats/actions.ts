"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ── /stats access ─────────────────────────────────────────────────────────────
// One shared secret, STATS_KEY, checked on the server. A correct key sets an
// httpOnly cookie holding the key's hash, scoped to /stats, so the key itself is
// never stored in the browser.

const COOKIE = "stats_access";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

/** True when the request carries a cookie for the current STATS_KEY. */
export async function hasAccess() {
  const key = process.env.STATS_KEY;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!key || !token) return false;
  const expected = digest(key).toString("hex");
  return token.length === expected.length && timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function unlock(form: FormData) {
  const key = process.env.STATS_KEY;
  const given = String(form.get("key") ?? "");
  // Compare digests so the check takes the same time whatever the input length
  if (!key || !timingSafeEqual(digest(given), digest(key))) redirect("/stats?wrong=1");

  (await cookies()).set(COOKIE, digest(key).toString("hex"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/stats",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/stats");
}

export async function lock() {
  (await cookies()).delete({ name: COOKIE, path: "/stats" });
  redirect("/stats");
}
