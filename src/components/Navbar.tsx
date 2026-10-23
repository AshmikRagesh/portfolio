"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutGrid, CircleUser, ArrowLeft } from "lucide-react";
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";
import { useCuriosity } from "@/context/CuriosityContext";
import CuriosityBubble, { useMilestoneBubble, type Bubble } from "@/components/CuriosityBubble";
import HostCharacter, { hostLayout, type HostMood } from "@/components/host/HostCharacter";
import TimerBoard, { BOARD_WIDTH } from "@/components/host/TimerBoard";
import { useRecordHolder } from "@/components/host/useRecordHolder";
import { primeBell, ringBell } from "@/components/host/bellSound";

const navLinks = [
  { label: "Works", href: "#works", Icon: LayoutGrid },
  { label: "About", href: "#about", Icon: CircleUser },
];

// Host size in the navbar — the 68px row leaves a little air above and below
const HOST_HEIGHT = 56;
const HOST = hostLayout(HOST_HEIGHT);
// The board never comes closer than this to the edge of the screen
const BOARD_EDGE = 12;

// In development, `?mood=dozing|champion|holding` pins the host in that state for review
function usePreviewMood() {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") setPreview(new URLSearchParams(window.location.search).get("mood"));
  }, []);
  return preview;
}

// The logo: the front-desk bell. On hover (or a first tap on touch screens) it rings —
// ding ding, out loud once the page has had a click — and both hands come down to
// hold the timer board underneath it. It dozes while the
// clock is paused, turns gold once this is the longest visit ever, and rings before
// it says anything. The board is out of the layout and above everything on the page,
// so nothing around it ever moves.
function NavHost({ bubble, record }: { bubble: Bubble; record: boolean }) {
  const { activeSeconds, paused } = useCuriosity();
  const preview = usePreviewMood();
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const speaking = bubble.message !== null;
  const holding = ((hovered || tapped) && !speaking) || preview === "holding";
  const champion = record || preview === "champion";
  const mood: HostMood = preview === "dozing" || (paused && !holding) ? "dozing" : champion ? "champion" : "idle";

  // It rings like a desk bell: when it's hovered, and before it says anything
  const [ding, setDing] = useState(0);
  useEffect(() => {
    if (holding || speaking) setDing((d) => d + 1);
  }, [holding, speaking]);

  // The board hangs centred under the hands, nudged in if that would run off-screen
  const [left, right] = HOST.hands;
  const gripMid = (left.x + right.x) / 2;
  const boardWidth = BOARD_WIDTH;
  const boardLeft = gripMid - boardWidth / 2 + shift;

  useLayoutEffect(() => {
    if (!holding) return;
    const hostLeft = wrapRef.current?.getBoundingClientRect().left ?? 0;
    const overflowLeft = BOARD_EDGE - (hostLeft + gripMid - boardWidth / 2);
    setShift(Math.max(0, overflowLeft));
  }, [holding, gripMid, boardWidth]);

  useEffect(() => {
    if (!tapped) return;
    const id = window.setTimeout(() => setTapped(false), 4000);
    return () => window.clearTimeout(id);
  }, [tapped]);

  useEffect(primeBell, []);

  // Touch screens have no hover: the first tap rings and shows the board, a second tap goes home
  const onClick = (e: React.MouseEvent) => {
    if (window.matchMedia("(hover: none)").matches && !tapped) {
      e.preventDefault();
      setTapped(true);
      ringBell();
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      onMouseEnter={() => {
        setHovered(true);
        ringBell();
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Above the board, so the hands overlap the rings they hold it by */}
      <Link href="/" aria-label="Home — measuring your curiosity" onClick={onClick} className="relative z-10 block select-none">
        <HostCharacter
          mood={mood}
          holding={holding}
          ding={ding}
          className="block"
          style={{ width: HOST.width, height: HOST_HEIGHT }}
        />
      </Link>

      {/* Timer board — hangs from the hands, rings level with them */}
      {holding && (
        <div className="absolute" style={{ left: boardLeft, top: left.y + 6 }}>
          <div className="host-board" style={{ "--grip-x": `${gripMid - boardLeft}px` } as React.CSSProperties}>
            <TimerBoard seconds={activeSeconds} champion={champion} grips={[left.x - boardLeft, right.x - boardLeft]} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isCaseStudy = pathname.startsWith("/works/");
  // A milestone line brings the navbar back into view for as long as it's up
  const record = useRecordHolder();
  const bubble = useMilestoneBubble(record);
  const speaking = bubble.message !== null;
  const showNav = isNavVisible || speaking;

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let downwardDistance = 0;
    let upwardDistance = 0;
    let frameId: number | null = null;

    const onScroll = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;

        setScrolled(currentScrollY > 10);

        if (currentScrollY <= 10) {
          downwardDistance = 0;
          upwardDistance = 0;
          setIsNavVisible(true);
        } else if (delta > 0) {
          downwardDistance += delta;
          upwardDistance = 0;
          if (downwardDistance >= 8) setIsNavVisible(false);
        } else if (delta < 0) {
          upwardDistance += Math.abs(delta);
          downwardDistance = 0;
          if (upwardDistance >= 8) setIsNavVisible(true);
        }

        lastScrollY = currentScrollY;
        frameId = null;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      onFocusCapture={() => setIsNavVisible(true)}
      className={`fixed ${isCaseStudy ? "top-0" : "top-[20px]"} right-0 left-0 h-[68px] z-50 bg-background border-b border-line transition-[transform,box-shadow] duration-300 ease-in-out ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)]" : ""
      } ${showNav ? "translate-y-0" : "-translate-y-[100px] pointer-events-none"}`}
    >
      {/* Main nav row */}
      <nav className={`relative flex items-center justify-between h-full ${isCaseStudy ? "px-[20px] md:px-[80px] lg:px-[100px]" : "nav-container"}`}>
        {/* Mobile on case study pages: back button. Everything else: Ash logo */}
        {isCaseStudy ? (
          <>
            <Link
              href="/#works"
              className="md:hidden flex items-center gap-2 font-brand text-[14px] font-medium uppercase tracking-[1px] text-muted hover:text-heading transition-colors duration-150 shrink-0"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              Back
            </Link>
            <div className="hidden md:block">
              <NavHost bubble={bubble} record={record} />
            </div>
          </>
        ) : (
          <NavHost bubble={bubble} record={record} />
        )}

        {/* Host tooltip — just under the bell, its pointer at the bell's centre. Out of
            the layout and above everything on the page. */}
        <div className="absolute z-[60] top-full mt-[4px] left-[20px] md:left-[80px] lg:left-[100px]">
          <CuriosityBubble bubble={bubble} pointerFromMd={isCaseStudy} />
        </div>

        {/* Desktop + tablet: nav links + CTA */}
        <div className="hidden md:flex items-center gap-[20px]">
          <ul className="flex items-center gap-[24px]">
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="group/tab flex items-center gap-2 font-brand text-[14px] font-normal text-secondary uppercase tracking-[1px] transition-colors duration-200 hover:text-grape hover:underline hover:decoration-wavy"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="transition-[stroke-width] duration-200 group-hover/tab:stroke-2"
                  />
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/resume"
            className="flex items-center gap-2 text-white font-brand font-normal text-[14px] uppercase tracking-[1px] px-[16px] h-[42px] rounded-[10px] transition-colors duration-200 whitespace-nowrap bg-primary hover:bg-grape"
          >
            <SparkleAiIcon size={16} />
            Fancy Paper
          </Link>
        </div>

        {/* Mobile: resume CTA + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/resume"
            className="flex items-center gap-2 text-white font-brand font-normal text-[14px] uppercase tracking-[1px] px-[16px] py-[8px] rounded-[10px] transition-colors duration-200 whitespace-nowrap bg-primary hover:bg-grape"
          >
            <SparkleAiIcon size={16} />
            Fancy Paper
          </Link>
          <button
            className="flex items-center justify-center w-[38px] self-stretch rounded-full border-[0.5px] border-line bg-[rgba(30,5,37,0.08)] p-[4px] text-heading"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-background border-b border-line">
          {/* Nav items — each with a bottom divider */}
          <ul>
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label} className="border-b border-line-soft">
                <a
                  href={href}
                  className="flex items-center gap-3 font-brand text-[14px] font-normal text-secondary uppercase tracking-[1px] px-[20px] py-5 transition-colors duration-200 hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                </a>
              </li>
            ))}
          </ul>

        </div>
      )}
    </header>
  );
}
