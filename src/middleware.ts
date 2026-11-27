import { NextResponse, type NextRequest } from "next/server";
import { cookieName, isUnlocked, lockedPath } from "@/lib/caseLock";

// Locked case studies (lib/caseLock): without the password's cookie, the page shows the
// password screen at the same address, and its images and videos aren't served.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hit = lockedPath(pathname);
  if (!hit) return NextResponse.next();

  if (await isUnlocked(hit.slug, request.cookies.get(cookieName(hit.slug))?.value)) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  }

  if (hit.kind === "asset") return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });

  const url = request.nextUrl.clone();
  url.pathname = `/locked/${hit.slug}`;
  const res = NextResponse.rewrite(url);
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}

export const config = {
  // One entry per locked case study in lib/caseLock (its page, plus any asset folders)
  matcher: ["/works/tcs-search", "/works/tcs-search/:path*", "/images/tcs-search/:path*", "/videos/tcs-search/:path*"],
};
