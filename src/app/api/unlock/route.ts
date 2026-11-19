import { NextResponse } from "next/server";
import { LOCKED, MAX_AGE, cookieName, flagName, passwordFor, sameText, tokenFor } from "@/lib/caseLock";

// POST { slug, password } → sets the case study's cookie when the password is right.
// A wrong guess waits a moment before answering, to slow down guessing.

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  let slug = "";
  let password = "";
  try {
    const body = await request.json();
    slug = typeof body.slug === "string" ? body.slug : "";
    password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!LOCKED[slug]) return NextResponse.json({ ok: false }, { status: 404 });

  const expected = passwordFor(slug);
  if (!expected) {
    // Fail closed: no password set means nobody gets in
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  const [given, real] = await Promise.all([tokenFor(slug, password), tokenFor(slug, expected)]);
  if (!sameText(given, real)) {
    await wait(700);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(cookieName(slug), real, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: MAX_AGE });
  res.cookies.set(flagName(slug), "1", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: MAX_AGE });
  return res;
}
