"use client";

// ── Page transition ───────────────────────────────────────────────────────────
// Moving between pages: the moment an internal link is clicked, the page you're on
// fades and lifts away (html[data-leaving]); only once it has gone does the router move
// on, so the new page always rises in from nothing (.page-enter, app/template.tsx)
// instead of cutting off the old one halfway. The navbar stays put throughout. Links to the same page (a section
// on it), new tabs, modified clicks and data-no-transition links are left alone. A safety timer clears the state if
// a navigation never lands.

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** How long the old page takes to fade away before the new one is fetched in. */
const LEAVE_MS = 180;

/** Big images a page shows at the top, fetched early so the page arrives with them in
 *  place instead of popping them in after it has faded up. */
const WARM: Record<string, string[]> = {
  "/about": ["/images/about/frame-gilt-grape.webp"],
};
const warmed = new Set<string>();
function warm(pathname: string) {
  for (const src of WARM[pathname] ?? []) {
    if (warmed.has(src)) continue;
    warmed.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }
}

/** The same-site page a link goes to, or null for anything else. */
function internalPath(target: EventTarget | null) {
  const a = target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
  if (!a) return null;
  const url = new URL(a.href, location.href);
  return url.origin === location.origin ? url.pathname : null;
}

export default function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();

  // Landed: the new page takes over
  useEffect(() => {
    delete document.documentElement.dataset.leaving;
  }, [pathname]);

  useEffect(() => {
    let timer = 0;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.closest("[data-no-transition]")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (/\.(pdf|png|jpe?g|zip)$/i.test(url.pathname)) return;
      // Take the click from Next's <Link> (it skips clicks already handled) and navigate
      // once the fade-out has finished
      e.preventDefault();
      if (document.documentElement.dataset.leaving !== undefined) return;
      document.documentElement.dataset.leaving = "";
      router.prefetch(url.pathname);
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), LEAVE_MS);
      clearTimeout(timer);
      timer = window.setTimeout(() => delete document.documentElement.dataset.leaving, 3000);
    };
    // Heading for a link (hover, focus, touch): get its page and its big images ready
    const onIntent = (e: Event) => {
      const path = internalPath(e.target);
      if (!path || path === location.pathname) return;
      router.prefetch(path);
      warm(path);
    };
    // And once this page has settled, warm the pages the navbar points to anyway
    const idle = window.setTimeout(() => {
      document.querySelectorAll<HTMLAnchorElement>("header a[href], nav a[href]").forEach((a) => {
        const path = internalPath(a);
        if (path && path !== location.pathname) warm(path);
      });
    }, 2500);
    document.addEventListener("pointerover", onIntent, { capture: true, passive: true });
    document.addEventListener("focusin", onIntent, true);
    document.addEventListener("touchstart", onIntent, { capture: true, passive: true });

    // Capture phase: Next's <Link> cancels the native click itself, so a bubbling listener
    // would never see it. Anything that shouldn't fade the page out opts out with
    // data-no-transition.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onIntent, true);
      document.removeEventListener("focusin", onIntent, true);
      document.removeEventListener("touchstart", onIntent, true);
      clearTimeout(timer);
      clearTimeout(idle);
    };
  }, [router]);

  return null;
}
