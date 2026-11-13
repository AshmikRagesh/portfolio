"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { allow, ipHash } from "@/lib/curiosity/guard";
import { setStatus } from "@/lib/feedback/store";
import { STATUSES, type FeedbackStatus } from "@/lib/feedback/shared";

// ── /feedback access ──────────────────────────────────────────────────────────
// Same key as /stats (STATS_KEY), its own httpOnly cookie scoped to /feedback.

const COOKIE = "feedback_access";
const WRONG_TRIES = 5;
const WRONG_WINDOW = 15 * 60;

const digest = (value: string) => createHash("sha256").update(value).digest();

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
  const ip = ipHash(await headers());
  if (!(await allow("stats", ip, WRONG_TRIES, WRONG_WINDOW, { peek: true }))) redirect("/feedback?wrong=wait");
  if (!key || !timingSafeEqual(digest(given), digest(key))) {
    await allow("stats", ip, WRONG_TRIES, WRONG_WINDOW);
    redirect("/feedback?wrong=1");
  }
  (await cookies()).set(COOKIE, digest(key).toString("hex"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/feedback",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/feedback");
}

export async function lock() {
  (await cookies()).delete({ name: COOKIE, path: "/feedback" });
  redirect("/feedback");
}

export async function mark(form: FormData) {
  if (!(await hasAccess())) redirect("/feedback");
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "") as FeedbackStatus;
  if (!/^[0-9a-f-]{36}$/.test(id) || !STATUSES.includes(status)) return;
  await setStatus(id, status);
  revalidatePath("/feedback");
}
