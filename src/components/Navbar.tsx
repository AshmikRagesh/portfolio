"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCuriosity } from "@/context/CuriosityContext";
import CuriosityBubble, { useMilestoneBubble, type Bubble } from "@/components/CuriosityBubble";
import HostCharacter, { hostLayout, type HostGlasses, type HostMood } from "@/components/host/HostCharacter";
import { useVideoGlasses } from "@/lib/curiosity/watching";
import { track } from "@/lib/curiosity/report";
import { awardStamp, useMoment, type Moment } from "@/lib/bella/progress";
import BellaLine from "@/components/bella/BellaLine";
import { openResume, RESUME_PDF } from "@/lib/resume";
import { MenuToggle, MobileMenu } from "@/components/MobileMenu";

type QueuedMoment = Moment & { id: number };

import TimerBoard, { BOARD_WIDTH } from "@/components/host/TimerBoard";
import { useRecordHolder } from "@/components/host/useRecordHolder";
import { useBellStage } from "@/components/host/BellStage";
import { useTouchScreen } from "@/components/host/useTouchScreen";
import { chimeBell, primeBell, ringBell } from "@/components/host/bellSound";

// All on the right of the bell. Fancy paper is a tab like the others, not a button.
const navLinks = [
  { label: "Works", href: "#works" },
  { label: "About", href: "/about" },
  { label: "Fancy paper", href: RESUME_PDF },
];

// On the home page, the section tab whose section crosses the middle of the screen
// (Works while the work cards are being read) is marked as where the visitor is.
function useSectionInView(pathname: string) {
  const [inView, setInView] = useState<string | null>(null);
  useEffect(() => {
    setInView(null);
    if (pathname !== "/") return;
    const sections = navLinks
      .filter((l) => l.href.startsWith("#"))
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => el !== null);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const href = `#${e.target.id}`;
          setInView((cur) => (e.isIntersecting ? href : cur === href ? null : cur));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return inView;
}

// Host size in the navbar — the 68px row leaves a little air above and below
const HOST_HEIGHT = 56;
const HOST = hostLayout(HOST_HEIGHT);
// The board never comes closer than this to the edge of the screen
const BOARD_EDGE = 12;

// In development, `?mood=dozing|champion|gold-dozing|holding|reading|video` pins the host in that state for review
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
//             the board. Off the home page, a tap on the bell goes home. The board
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
  const champion = record || preview === "champion" || preview === "gold-dozing";
  const mood: HostMood = preview === "dozing" || preview === "gold-dozing" || (paused && !holding) ? "dozing" : champion ? "champion" : "idle";

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

  // The bell is the way home. On touch, once you're home, a tap on it (or on the board)
  // toggles the board instead, since there's no hover to bring it down.
  const pathname = usePathname();
  const home = pathname === "/";
  useEffect(() => setOpen(false), [pathname]);
  const toggle = (e: React.MouseEvent) => {
    if (!touch || ducked) return;
    // Off the home page the tap just goes home (the board, if it's down, goes back up)
    if (!home && e.currentTarget.tagName === "A") return;
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
        aria-label={touch && home ? "Bella, measuring your curiosity — show your time" : "Home — Bella, measuring your curiosity"}
        aria-expanded={touch && home ? holding : undefined}
        onClick={toggle}
        className="relative z-10 block select-none"
        // Clipped along the bottom of the spot while ducking and popping, so the bell can
        // go out of sight through it. Off otherwise: the hands reach below to hold the board.
        style={entrance === "up" ? undefined : { clipPath: "inset(-100% -100% 0 -100%)" }}
      >
        <HostCharacter
          mood={mood}
          gold={champion}
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

// A tab: on hover, a quick pen loop is drawn round the word, like the circled marks in the
// case studies. The page you're on (About), or the home section you're reading (Works),
// keeps its circle.
function NavTab({ label, href, pathname, inView }: { label: string; href: string; pathname: string; inView: string | null }) {
  const resume = href === RESUME_PDF;
  const page = href.startsWith("/") && pathname === href;
  const current = page || inView === href;
  const className = `nav-tab font-brand text-body font-normal uppercase tracking-[1px] whitespace-nowrap ${
    current ? "text-grape" : "text-text-base/70"
  }`;
  const inner = (
    <span className="nav-tab-label">
      {label}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M84 6C66 0 22 1 8 12-3 22 14 37 50 37c36 0 50-10 44-23C88 3 62 1 38 4" />
      </svg>
    </span>
  );
  return resume ? (
    // Opens the résumé sheet; the celebration plays once a copy is downloaded
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        openResume();
      }}
      className={className}
    >
      {inner}
    </a>
  ) : (
    <a href={linkHref(href, pathname)} aria-current={page ? "page" : current ? "location" : undefined} className={className}>
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
  const showNav = isNavVisible || speaking || momentHere !== null || menuOpen;
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const inView = useSectionInView(pathname);

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
      // At the top it sits flat on the page with a hairline; once the page scrolls under it,
      // it turns frosted with a soft lift
      // On phones it's a floating bar instead: inset from the edges, rounded, frosted, with
      // the menu card dropping out of it (MobileMenu.tsx)
      // A floating bar on every screen size: inset from the edges, rounded, frosted, with a
      // soft lift. On large screens it stops at 1240px wide, centred. (Desktop variation
      // being tried out; the phone menu card drops out of it on small screens.)
      // Desktop: a full-width bar that sits flat on the page with a hairline at the top,
      // and turns frosted with a soft lift once the page scrolls under it. Phones: a floating
      // bar (inset, glass, hairline ring, layered shadow: .floating-header in globals.css)
      // that the menu card drops out of.
      data-scrolled={scrolled || undefined}
      className={`floating-header fixed z-50 top-[28px] left-[12px] right-[12px] h-[60px] md:top-[20px] md:left-0 md:right-0 md:h-[68px] md:border-b md:transition-[transform,box-shadow,background-color,border-color] md:duration-300 md:ease-in-out ${
        scrolled
          ? "md:bg-background/80 md:backdrop-blur-md md:backdrop-saturate-150 md:border-line-soft md:shadow-[0_8px_24px_-12px_rgba(30,5,37,0.16)]"
          : "md:bg-background md:border-line-soft"
      } ${showNav ? "translate-y-0" : "-translate-y-[110px] pointer-events-none"}`}
    >
      {/* Main nav row — the bell on the left, the tabs on the right */}
      <nav className="relative flex items-center justify-between h-full nav-container max-md:!px-[10px]">
        <div className="relative">
          <NavHost bubble={bubble} record={record} moment={momentHere} />

          {/* Host tooltip — just under the bell, its pointer at the bell's centre. Out of
              the layout and above everything on the page. */}
          <div className="absolute z-[60] top-full mt-[4px] left-0">
            {momentHere ? <BellaLine key={momentHere.id} moment={momentHere} /> : <CuriosityBubble bubble={bubble} />}
          </div>
        </div>

        {/* Desktop + tablet: the tabs */}
        <ul className="nav-tabs hidden md:flex items-center gap-[16px]">
          {navLinks.map((link) => (
            <li key={link.label}>
              <NavTab {...link} pathname={pathname} inView={inView} />
            </li>
          ))}
        </ul>

        {/* Phones: the menu toggle */}
        <div className="md:hidden flex items-center">
          <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} />
        </div>
      </nav>

      {/* Phones: the floating menu card */}
      <MobileMenu open={menuOpen} onClose={closeMenu} links={navLinks} pathname={pathname} inView={inView} />
    </header>
  );
}
