"use client";

// ── Page transition ───────────────────────────────────────────────────────────
// Moving between pages: the moment an internal link is clicked, the page you're on
// fades and lifts away (html[data-leaving]); the new page then rises in (.page-enter,
// app/template.tsx). The navbar stays put throughout. Links to the same page (a section
// on it), new tabs, modified clicks and data-no-transition links are left alone. A safety timer clears the state if
// a navigation never lands.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition() {
  const pathname = usePathname();

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
      document.documentElement.dataset.leaving = "";
      clearTimeout(timer);
      timer = window.setTimeout(() => delete document.documentElement.dataset.leaving, 1500);
    };
    // Capture phase: Next's <Link> cancels the native click itself, so a bubbling listener
    // would never see it. Anything that shouldn't fade the page out opts out with
    // data-no-transition.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
