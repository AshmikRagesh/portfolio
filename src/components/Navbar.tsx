"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutGrid, CircleUser } from "lucide-react";
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";
import { useCuriosity } from "@/context/CuriosityContext";
import CuriosityBubble, { useMilestoneBubble, type Bubble } from "@/components/CuriosityBubble";
import HostCharacter, { hostLayout, type HostMood } from "@/components/host/HostCharacter";
import TimerBoard, { BOARD_WIDTH } from "@/components/host/TimerBoard";
import { useRecordHolder } from "@/components/host/useRecordHolder";
import { useBellStage } from "@/components/host/BellStage";
import { useTouchScreen } from "@/components/host/useTouchScreen";
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

// Shown once per visit on touch screens, right after the bell's first line, so people
// who can't hover still find out the board is there
const BOARD_SHOWN_KEY = "ash.curiosity.boardShown"; // sessionStorage

// The logo: the front-desk bell. It dozes while the clock is paused, turns gold once
// this is the longest visit ever, and rings before it says anything.
//
// The board, two ways:
//   pointer   hover (or keyboard focus) rings it — ding ding, out loud once the page
//             has had a click — and both hands bring the board down; it goes back up
//             when the pointer leaves.
//   touch     there's no hover, so nothing happens until a tap. A tap on the bell rings
//             it and brings the board down; it stays until another tap on the bell or
//             the board. The bell doesn't navigate home on touch screens. The board
//             also comes down once by itself, after the first line of the visit.
//
// The board is out of the layout and above everything on the page, so nothing around
// it ever moves.
//
// Only one bell is up at a time: while the footer's bell is on screen (BellStage), this
// one ducks down out of its spot and leaves just its clock there, still counting. When the
// footer leaves, the clock lifts away and the bell pops back up and rings.
function NavHost({ bubble, record }: { bubble: Bubble; record: boolean }) {
  const { activeSeconds, paused } = useCuriosity();
  const preview = usePreviewMood();
  const touch = useTouchScreen();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false); // touch: board pinned down by a tap
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const speaking = bubble.message !== null;
  const [ding, setDing] = useState(0);
  const { footerOnStage: ducked } = useBellStage();
  const holding = !ducked && ((((hovered && !touch) || open) && !speaking) || preview === "holding");

  // Ducking out for the footer's bell, and popping back up. Nothing moves until the first duck.
  const [entrance, setEntrance] = useState<"up" | "duck" | "pop">("up");
  const [awayBoard, setAwayBoard] = useState<"in" | "out" | null>(null);
  const hasDucked = useRef(false);
  useEffect(() => {
    if (ducked) {
      hasDucked.current = true;
      setEntrance("duck");
      setAwayBoard("in");
      return;
    }
    if (!hasDucked.current) return;
    // The clock lifts away first, then the bell springs up and rings — and once it's up,
    // the clip comes off so its hands can reach below the spot to hold the board again
    setEntrance("pop");
    setAwayBoard((b) => (b ? "out" : null));
    const clear = window.setTimeout(() => setAwayBoard(null), 220);
    const ring = window.setTimeout(() => {
      setDing((d) => d + 1);
      setEntrance("up");
    }, 680);
    return () => {
      window.clearTimeout(clear);
      window.clearTimeout(ring);
    };
  }, [ducked]);
  const champion = record || preview === "champion";
  const mood: HostMood = preview === "dozing" || (paused && !holding) ? "dozing" : champion ? "champion" : "idle";

  // It rings like a desk bell: when the board comes down, and before it says anything
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

  // Touch: once the bell's first line of the visit has been said, bring the board down
  const wasSpeaking = useRef(false);
  useEffect(() => {
    const finished = wasSpeaking.current && !speaking;
    wasSpeaking.current = speaking;
    if (!touch || !finished) return;
    try {
      if (sessionStorage.getItem(BOARD_SHOWN_KEY)) return;
      sessionStorage.setItem(BOARD_SHOWN_KEY, "1");
    } catch {}
    setOpen(true);
  }, [speaking, touch]);

  useEffect(primeBell, []);

  // Touch: a tap on the bell or the board toggles the board. Pointer: the bell is a link home.
  const toggle = (e: React.MouseEvent) => {
    if (!touch || ducked) return;
    e.preventDefault();
    if (!open) ringBell();
    setOpen((o) => !o);
  };

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      onMouseEnter={() => {
        if (touch) return; // phones fire mouseenter on tap — the tap handles it
        setHovered(true);
        if (!ducked) ringBell();
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => !touch && setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Above the board, so the hands overlap the rings they hold it by */}
      <Link
        href="/"
        aria-label={touch ? "Measuring your curiosity — show your time" : "Home — measuring your curiosity"}
        aria-expanded={touch ? holding : undefined}
        onClick={toggle}
        className="relative z-10 block select-none"
        // Clipped along the bottom of the spot while ducking and popping, so the bell can
        // go out of sight through it. Off otherwise: the hands reach below to hold the board.
        style={entrance === "up" ? undefined : { clipPath: "inset(-100% -100% 0 -100%)" }}
      >
        <HostCharacter
          mood={mood}
          holding={holding}
          ding={ding}
          className={`block ${entrance === "up" ? "" : `bell-${entrance}`}`}
          style={{ width: HOST.width, height: HOST_HEIGHT, animationDelay: entrance === "pop" ? "160ms" : undefined }}
        />
      </Link>

      {/* Just the clock, left in the bell's spot while it's ducked out */}
      {awayBoard && (
        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2">
          <div className={awayBoard === "in" ? "clock-in" : "host-board-out"} style={awayBoard === "in" ? { animationDelay: "240ms" } : undefined}>
            <TimerBoard seconds={activeSeconds} champion={champion} bare />
          </div>
        </div>
      )}

      {/* Timer board — hangs from the hands, rings level with them. On touch, a tap puts it away. */}
      {holding && (
        <div className="absolute" style={{ left: boardLeft, top: left.y + 6 }} onClick={toggle}>
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
  // Lines wait while the bell has ducked out for the footer's bell
  const { footerOnStage } = useBellStage();
  const bubble = useMilestoneBubble(record, footerOnStage);
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
      className={`fixed top-[20px] right-0 left-0 h-[68px] z-50 bg-background border-b border-line transition-[transform,box-shadow] duration-300 ease-in-out ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)]" : ""
      } ${showNav ? "translate-y-0" : "-translate-y-[100px] pointer-events-none"}`}
    >
      {/* Main nav row */}
      <nav className="relative flex items-center justify-between h-full nav-container">
        <NavHost bubble={bubble} record={record} />

        {/* Host tooltip — just under the bell, its pointer at the bell's centre. Out of
            the layout and above everything on the page. */}
        <div className="absolute z-[60] top-full mt-[4px] left-[20px] md:left-[80px] lg:left-[100px]">
          <CuriosityBubble bubble={bubble} />
        </div>

        {/* Desktop + tablet: nav links + CTA */}
        <div className="hidden md:flex items-center gap-[20px]">
          <ul className="flex items-center gap-[24px]">
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={isCaseStudy ? `/${href}` : href}
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
            className="flex items-center gap-2 text-white font-brand font-medium text-[14px] uppercase tracking-[1px] px-[16px] h-[42px] rounded-[10px] transition-colors duration-200 whitespace-nowrap bg-primary hover:bg-grape"
          >
            <SparkleAiIcon size={16} />
            Fancy Paper
          </Link>
        </div>

        {/* Mobile: just the menu — the CTA is desktop and tablet only */}
        <div className="md:hidden flex items-center">
          <button
            className="flex items-center justify-center size-[38px] rounded-full border-[0.5px] border-line bg-[rgba(30,5,37,0.08)] p-[4px] text-heading"
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
                  href={isCaseStudy ? `/${href}` : href}
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
