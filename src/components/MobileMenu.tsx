"use client";

// ── The phone menu ────────────────────────────────────────────────────────────
// On phones the navbar is a floating bar, and the menu is a floating card that drops
// out of it. The links are in the headings' serif, the toggle in Geist. It keeps the
// desktop navbar's grape pen loop round the page you're on (drawn round a link as you
// tap it), and each link ends in a small round arrow button.
//
// Motion: the card unrolls downwards from under the bar on a spring, settling with a
// little give, and the links follow one by one; the page behind blurs and dims. The
// toggle's two lines turn into a cross and its label slides from "Menu" to "Close".
// Closing is quicker and tidier: everything lifts away together.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { openResume, RESUME_PDF } from "@/lib/resume";
import { spring } from "@/components/resume/motion";

type Link = { label: string; href: string };

const DROP = spring(260, 24);
const ITEM = spring(300, 26);
const STAGGER = 45;
// The card sits this far below the top of the screen: under the floating bar
const CARD_TOP = 20 + 8 + 60 + 10;

/** The toggle: a pill with two lines that become a cross, and a label that slides. */
export function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className="mobile-toggle group flex h-[40px] items-center gap-[10px] rounded-full border border-line-soft bg-surface pl-[16px] pr-[14px] text-heading transition-[border-color,background-color] duration-300 active:scale-[0.97]"
      data-open={open || undefined}
    >
      <span className="relative block h-[20px] overflow-hidden font-geist text-[14px] font-medium leading-[20px] tracking-[-0.01em]">
        <span className="mobile-toggle-label block">Menu</span>
        <span className="mobile-toggle-label block" aria-hidden="true">
          Close
        </span>
      </span>
      <span aria-hidden="true" className="relative block size-[16px]">
        <span className="mobile-toggle-line" data-line="top" />
        <span className="mobile-toggle-line" data-line="bottom" />
      </span>
    </button>
  );
}

/** The floating card, with the page blurred behind it. Rendered to the body, over everything. */
export function MobileMenu({ open, onClose, links, pathname }: { open: boolean; onClose: () => void; links: Link[]; pathname: string }) {
  const [shown, setShown] = useState(false); // mounted, including while it animates away
  const card = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const [tapped, setTapped] = useState<string | null>(null);

  useEffect(() => {
    if (open) setShown(true);
  }, [open]);

  // In: the card unrolls down from the bar, the links follow one by one
  useLayoutEffect(() => {
    if (!open || !shown) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrim.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "ease-out", fill: "backwards" });
    if (reduced) {
      card.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: "backwards" });
      return;
    }
    card.current?.animate(
      [
        { clipPath: "inset(0 0 100% 0 round 20px)", transform: "translateY(-10px) scale(0.97)", opacity: 1 },
        { clipPath: "inset(0 0 0% 0 round 20px)", transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      { duration: DROP.duration, easing: DROP.easing, fill: "backwards" },
    );
    items.current.forEach((el, i) =>
      el?.animate(
        [
          { opacity: 0, transform: "translateY(14px)", filter: "blur(4px)" },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
        ],
        { duration: ITEM.duration, easing: ITEM.easing, delay: 70 + i * STAGGER, fill: "backwards" },
      ),
    );
  }, [open, shown]);

  // Out: everything lifts away together, then it's gone
  useEffect(() => {
    if (open || !shown) return;
    const out: KeyframeAnimationOptions = { duration: 220, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" };
    scrim.current?.animate([{ opacity: 1 }, { opacity: 0 }], { ...out, duration: 260 });
    const a = card.current?.animate(
      [
        { clipPath: "inset(0 0 0% 0 round 20px)", transform: "translateY(0) scale(1)", opacity: 1 },
        { clipPath: "inset(0 0 40% 0 round 20px)", transform: "translateY(-8px) scale(0.98)", opacity: 0 },
      ],
      out,
    );
    const done = () => {
      setShown(false);
      setTapped(null);
    };
    if (a) a.finished.then(done).catch(done);
    else done();
  }, [open, shown]);

  // While open: Escape closes, the page doesn't scroll, focus moves to the first link
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    const first = window.setTimeout(() => (items.current[0]?.querySelector("a,button") as HTMLElement | null)?.focus({ preventScroll: true }), 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = before;
      window.clearTimeout(first);
    };
  }, [open, onClose]);

  // A tap draws the pen loop round the link, then goes there
  const go = useCallback(
    (e: React.MouseEvent, link: Link, to: string) => {
      e.preventDefault();
      setTapped(link.label);
      window.setTimeout(() => {
        onClose();
        if (link.href === RESUME_PDF) window.setTimeout(openResume, 160);
        else window.setTimeout(() => (window.location.href = to), 120);
      }, 340);
    },
    [onClose],
  );

  if (!shown || typeof document === "undefined") return null;

  const linkHref = (href: string) => (href.startsWith("/") || pathname === "/" ? href : `/${href}`);

  return createPortal(
    <div className="md:hidden">
      {/* The page behind, blurred and dimmed; a tap anywhere on it closes the menu */}
      <div ref={scrim} className="fixed inset-0 z-[45] bg-[rgba(250,247,251,0.55)] backdrop-blur-[6px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={card}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-x-[12px] z-[55] origin-top overflow-hidden rounded-[20px] border border-line-soft bg-background shadow-[0_24px_48px_-20px_rgba(30,5,37,0.28),0_2px_6px_rgba(30,5,37,0.06)]"
        style={{ top: CARD_TOP }}
      >
        <nav aria-label="Main">
          <ul className="px-[16px] py-[6px]">
            {links.map((link, i) => {
              const current = link.href.startsWith("/") && pathname === link.href;
              const marked = current || tapped === link.label;
              const to = linkHref(link.href);
              return (
                <li
                  key={link.label}
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  className="border-b border-line-soft last:border-b-0"
                >
                  <a
                    href={to}
                    aria-current={current ? "page" : undefined}
                    onClick={(e) => go(e, link, to)}
                    className="mobile-menu-link group flex items-center gap-[16px] py-[16px] pl-[4px] outline-none"
                    data-marked={marked || undefined}
                    data-tapped={tapped === link.label || undefined}
                  >
                    <span className="nav-tab-label relative font-heading text-[28px] leading-[1.1] tracking-[-0.02em] text-heading">
                      {link.label}
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                        <path pathLength={1} d="M84 6C66 0 22 1 8 12-3 22 14 37 50 37c36 0 50-10 44-23C88 3 62 1 38 4" />
                      </svg>
                    </span>
                    {/* A round button with an arrow: on tap it fills grape, and the arrow slides out
                        to the right as a fresh one slides in from the left */}
                    <span aria-hidden="true" className="mobile-menu-go ml-auto">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path className="mobile-menu-go-out" d="M2 7h10M8 3l4 4-4 4" />
                        <path className="mobile-menu-go-in" d="M2 7h10M8 3l4 4-4 4" />
                      </svg>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

        </nav>
      </div>
    </div>,
    document.body,
  );
}
