"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useCuriosity } from "@/context/CuriosityContext";
import CuriosityBubble, { useMilestoneBubble, type Bubble } from "@/components/CuriosityBubble";
import HostCharacter, { hostLayout, type HostGlasses, type HostMood } from "@/components/host/HostCharacter";
import { useVideoGlasses } from "@/lib/curiosity/watching";
import { track } from "@/lib/curiosity/report";
import { awardStamp, celebrate, useMoment, type Moment } from "@/lib/bella/progress";
import BellaLine from "@/components/bella/BellaLine";

type QueuedMoment = Moment & { id: number };

import TimerBoard, { BOARD_WIDTH } from "@/components/host/TimerBoard";
import { useRecordHolder } from "@/components/host/useRecordHolder";
import { useBellStage } from "@/components/host/BellStage";
import { useTouchScreen } from "@/components/host/useTouchScreen";
import { chimeBell, primeBell, ringBell } from "@/components/host/bellSound";

// Split either side of the bell: Work and Play on the left, Fancy paper and About on the right
const leftLinks = [
  { label: "Work", href: "#works" },
  { label: "Play", href: "#play" },
];
const rightLinks = [
  { label: "Fancy paper", href: "/resume" },
  { label: "About", href: "#about" },
];
const navLinks = [...leftLinks, ...rightLinks];

// Host size in the navbar — the 68px row leaves a little air above and below
const HOST_HEIGHT = 56;
const HOST = hostLayout(HOST_HEIGHT);
// The board never comes closer than this to the edge of the screen
const BOARD_EDGE = 12;

// In development, `?mood=dozing|champion|holding|reading|video` pins the host in that state for review
function usePreviewMood() {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") setPreview(new URLSearchParams(window.location.search).get("mood"));
  }, []);
  return preview;
}

// Reading glasses go on once the reader has scrolled into a case study, and come off
// when they leave it
const READING_AFTER_PX = 120;
function useReading() {
  const pathname = usePathname();
  const [reading, setReading] = useState(false);
  useEffect(() => {
    setReading(false);
    if (!pathname.startsWith("/works/")) return;
    const check = () => {
      if (window.scrollY > READING_AFTER_PX) {
        setReading(true);
        window.removeEventListener("scroll", check);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [pathname]);
  return reading;
}

// Shown once per visit on touch screens, right after the bell's first line, so people
// who can't hover still find out the board is there
const BOARD_SHOWN_KEY = "ash.curiosity.boardShown"; // sessionStorage

// The logo: the front-desk bell. It dozes while the clock is paused, turns gold once
// this is the longest visit this month, and rings before it says anything.
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
function NavHost({ bubble, record, moment }: { bubble: Bubble; record: boolean; moment: QueuedMoment | null }) {
  const { activeSeconds, paused } = useCuriosity();
  const preview = usePreviewMood();
  const watching = useVideoGlasses();
  const reading = useReading();
  const glasses: HostGlasses | null =
    preview === "video" || watching ? "video" : preview === "reading" || reading ? "reading" : null;
  const touch = useTouchScreen();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false); // touch: board pinned down by a tap
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const speaking = bubble.message !== null;
  const [ding, setDing] = useState(0);
  const { footerOnStage: ducked } = useBellStage();
  const holding = !ducked && !moment && ((((hovered && !touch) || open) && !speaking) || preview === "holding");

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

  // Count the sign being opened, once per visit, for the stats page. The first ring earns
  // the First ring stamp, given once the sign goes back up so it doesn't cut the sign short.
  const rang = useRef(false);
  useEffect(() => {
    if (holding && !preview) {
      track("sign_open");
      rang.current = true;
    } else if (!holding && rang.current) {
      rang.current = false;
      awardStamp("ring");
    }
  }, [holding, preview]);

  // Moments (lib/bella/progress): a stamp found, a goal celebrated
  const [celebrate, setCelebrate] = useState(0);
  useEffect(() => {
    if (!moment) return;
    if (moment.kind === "celebrate") {
      setCelebrate((c) => c + 1);
      chimeBell();
    } else {
      setDing((d) => d + 1);
      ringBell();
    }
  }, [moment]);
  const expression = moment?.kind === "stamp" ? "surprised" : null;


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
        aria-label={touch ? "Bella, measuring your curiosity — show your time" : "Home — Bella, measuring your curiosity"}
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
          glasses={glasses}
          expression={expression}
          celebrate={celebrate}
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

// Section links work from any page: off the home page they go home first
function linkHref(href: string, pathname: string) {
  return href.startsWith("/") || pathname === "/" ? href : `/${href}`;
}

// A tab: on hover, the pink highlighter from the case studies sweeps behind the word
function NavTab({ label, href, pathname }: { label: string; href: string; pathname: string }) {
  const resume = href === "/resume";
  const className = "nav-tab font-brand text-lead font-normal text-text-base/85 uppercase tracking-[1px] whitespace-nowrap";
  const inner = <span className="nav-tab-label">{label}</span>;
  return resume ? (
    <Link href={href} onClick={() => celebrate("resume", "Resume downloaded.")} className={className}>
      {inner}
    </Link>
  ) : (
    <a href={linkHref(href, pathname)} className={className}>
      {inner}
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  // A milestone line brings the navbar back into view for as long as it's up
  const record = useRecordHolder();
  // Lines wait while the bell has ducked out for the footer's bell
  const { footerOnStage } = useBellStage();
  // Bella's moments play here unless the footer's Bella is up
  const moment = useMoment();
  const momentHere = moment && !footerOnStage ? moment : null;
  const bubble = useMilestoneBubble(record, footerOnStage || momentHere !== null);
  const speaking = bubble.message !== null;
  const showNav = isNavVisible || speaking || momentHere !== null;

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
      {/* Main nav row — from md up the bell is in the middle with the links split either side;
          on phones the bell is on the left and the menu on the right */}
      <nav className="relative grid grid-cols-[1fr_auto_1fr] items-center h-full nav-container">
        <ul className="hidden md:flex items-center gap-[32px]">
          {leftLinks.map((link) => (
            <li key={link.label}>
              <NavTab {...link} pathname={pathname} />
            </li>
          ))}
        </ul>

        <div className="relative col-start-1 row-start-1 md:col-start-2">
          <NavHost bubble={bubble} record={record} moment={momentHere} />

          {/* Host tooltip — just under the bell, its pointer at the bell's centre (centred on
              it from md up). Out of the layout and above everything on the page. */}
          <div className="absolute z-[60] top-full mt-[4px] left-0 md:left-1/2 md:-translate-x-1/2">
            {momentHere ? (
              <BellaLine key={momentHere.id} moment={momentHere} pointerCenterMd />
            ) : (
              <CuriosityBubble bubble={bubble} align="center-md" />
            )}
          </div>
        </div>

        <ul className="hidden md:flex items-center justify-end gap-[32px]">
          {rightLinks.map((link) => (
            <li key={link.label}>
              <NavTab {...link} pathname={pathname} />
            </li>
          ))}
        </ul>

        {/* Mobile: just the menu, on the right */}
        <div className="md:hidden col-start-3 row-start-1 flex items-center justify-end">
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
            {navLinks.map(({ label, href }) => (
              <li key={label} className="border-b border-line-soft">
                <a
                  href={linkHref(href, pathname)}
                  className="flex items-center gap-3 font-brand text-lead font-normal text-text-base/85 uppercase tracking-[1px] px-[20px] py-5 transition-colors duration-200 hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
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
