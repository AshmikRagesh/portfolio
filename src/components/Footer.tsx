"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HostCharacter, { hostLayout } from "@/components/host/HostCharacter";
import { useRecordHolder } from "@/components/host/useRecordHolder";
import { useBellStage } from "@/components/host/BellStage";
import { useTouchScreen } from "@/components/host/useTouchScreen";
import { chimeBell, ringBell } from "@/components/host/bellSound";
import { awardStamp, celebrate, useMoment } from "@/lib/bella/progress";
import BellaLine from "@/components/bella/BellaLine";
import { useVideoGlasses } from "@/lib/curiosity/watching";
import { COPY_EMAIL_EVENT, EMAIL } from "@/lib/contact";
import TimerBoard, { BOARD_WIDTH } from "@/components/host/TimerBoard";
import { track } from "@/lib/curiosity/report";
import Image from "next/image";
import PaperTooth from "@/components/PaperTooth";

const socialLinks = [
  {
    label: "Discord",
    href: "https://discord.com/users/ashmikragesh",
    bg: "#67c23a",
    tiltClass: "hover:-rotate-6",
    icon: <img src="/icons/social-discord.svg" alt="Discord" className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" />,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/ashmikragesh",
    bg: "#1f88f9",
    tiltClass: "hover:rotate-6",
    icon: <img src="/icons/social-linkedin.svg" alt="LinkedIn" className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" />,
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/ashmikragesh",
    bg: "#091624",
    tiltClass: "hover:-rotate-3",
    icon: <img src="/icons/social-x.svg" alt="Twitter / X" className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" />,
  },
];

// Bell height on phone / tablet / desktop
const BELL_HEIGHT = { sm: 56, md: 64, lg: 72 };
// Wandering: each hop takes HOP_MS and covers about this share of the bell's width
const HOP_MS = 300;
const HOP_REACH = 0.7;
// Squash lasts this long either side of each touch-down
const CONTACT_MS = 60;
// Hovered mid-hop, it comes straight down where it is over this long
const LAND_MS = 180;
// A click: one jump on the spot, this high (share of the bell's height) and this long
const JUMP_UP = 0.45;
const JUMP_MS = 420;
// A double-click: a backflip, higher and slower so the full turn reads
const FLIP_UP = 0.9;
const FLIP_MS = 720;
// The pointer can slip off this long before the bell counts it as gone
const HOVER_GRACE_MS = 240;
// The bell is up while the band's top edge is above ON_LINE of the screen, and ducks
// once it falls below OFF_LINE — a gap, so scrolling around one spot can't flicker it
const ON_LINE = 0.85;
const OFF_LINE = 0.9;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const random = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

type Gaze = { x: number; y: number } | null;
type Trip = { from: number; to: number; hops: { h: number; ms: number }[]; travelling: number; start: number };

function useBellHeight() {
  const [height, setHeight] = useState(BELL_HEIGHT.lg);
  useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => setHeight(lg.matches ? BELL_HEIGHT.lg : md.matches ? BELL_HEIGHT.md : BELL_HEIGHT.sm);
    update();
    md.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      md.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);
  return height;
}

// The front-desk bell, on the footer's top edge as if the band were the counter. While the
// footer's on screen it pops up from behind the counter and rings, and the navbar's bell
// ducks out of sight so only one is ever up (BellStage); it ducks back behind the counter
// when the footer leaves. While it's up it potters along the counter like the Claude Code mascot on its input box: strings
// of small hops — sometimes half-way across and back, sometimes all the way — with a
// pause, a hop on the spot or a look around in between. Its eyes face the way it's going,
// and it stretches on the way up and squashes on each landing.
//   pointer   hover (or keyboard focus) rings it and brings it straight down where it is, so it
//             can be clicked; a click rings it and makes it jump, a double-click a backflip.
//   touch     a tap rings it and makes it jump, a double-tap a backflip.
// It's also the front desk: the mail icon beside the social icons (and only that)
// copies Ashmik's email: the bell rings and says so in a line underneath, the same way
// the navbar bell talks. If the clipboard is blocked the line holds the address so it can
// be selected by hand. Lines and the hover hint hang below the bell, over the band, so
// the counter's clip is lifted while one is showing.
// The timer board lives with the bell in the navbar only.
// It never dozes, and turns gold for the longest visit this month. With reduced motion it stays
// where it landed and keeps still.
function FooterBell() {
  const record = useRecordHolder();
  const touch = useTouchScreen();
  const watching = useVideoGlasses();
  const height = useBellHeight();
  const layout = hostLayout(height);
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef(0);
  const [card, setCard] = useState<{ copied: boolean; align: "left" | "center" | "right" } | null>(null);
  const [ding, setDing] = useState(0);
  const [gaze, setGaze] = useState<Gaze>(null);
  const [onStage, setOnStage] = useState(false);
  const [entrance, setEntrance] = useState<"away" | "pop" | "duck">("away");
  const { setFooterOnStage } = useBellStage();
  const railRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  // Click and double-click, set by the pottering effect below while the bell is up
  const tricks = useRef<{ jump: () => void; flip: () => void } | null>(null);
  // Mid-jump or mid-flip: the hover hint hides so it doesn't fly about with the bell
  const [acting, setActing] = useState(false);

  // Bella's moments play here while this bell is up (lib/bella/progress)
  const moment = useMoment();
  const momentHere = onStage ? moment : null;
  const [celebrateCount, setCelebrateCount] = useState(0);
  useEffect(() => {
    if (!momentHere) return;
    if (momentHere.kind === "celebrate") {
      setCelebrateCount((c) => c + 1);
      chimeBell();
    } else {
      setDing((d) => d + 1);
      ringBell();
    }
  }, [momentHere]);

  // The first ring earns the First ring stamp, once the pointer moves off
  const rang = useRef(false);
  useEffect(() => {
    if (hovered && !touch) rang.current = true;
    else if (!hovered && rang.current) {
      rang.current = false;
      awardStamp("ring");
    }
  }, [hovered, touch]);

  // Under the pointer, holding up the email card, or playing a moment: stays put
  const still = (hovered && !touch) || card !== null || momentHere !== null;
  const live = useRef({ x: null as number | null, still, width: layout.width });
  live.current.still = still;
  live.current.width = layout.width;

  useEffect(() => {
    if (still) setDing((d) => d + 1);
  }, [still]);

  // Keep it on the counter: start near the right, and stay inside when the page resizes
  useLayoutEffect(() => {
    const rail = railRef.current;
    const mover = moverRef.current;
    if (!rail || !mover) return;
    const s = live.current;
    const seat = () => {
      const span = Math.max(0, rail.clientWidth - s.width);
      s.x = s.x === null ? Math.round(span * 0.9) : Math.min(s.x, span);
      mover.style.transform = `translate3d(${s.x}px, 0, 0)`;
    };
    seat();
    const observer = new ResizeObserver(seat);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [layout.width]);

  // Up while the footer's on screen: pops up from behind the counter (and rings), ducks
  // back down when it leaves. The navbar bell does the opposite (BellStage).
  // Kept across re-runs of the watcher below (it restarts when the bell changes size)
  const onRef = useRef(false);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const edge = rail.getBoundingClientRect().top + layout.base;
      const h = window.innerHeight;
      const next = onRef.current ? edge < h * OFF_LINE : edge < h * ON_LINE;
      if (next === onRef.current) return;
      onRef.current = next;
      setOnStage(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // The page can grow or shrink under a still scroll position (images loading)
    const observer = new ResizeObserver(onScroll);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, [layout.base]);

  useEffect(() => {
    setFooterOnStage(onStage);
    if (onStage) {
      setEntrance("pop");
      setDing((d) => d + 1);
    } else {
      setEntrance((e) => (e === "away" ? "away" : "duck"));
      setHovered(false);
    }
  }, [onStage, setFooterOnStage]);

  useEffect(() => () => setFooterOnStage(false), [setFooterOnStage]);

  // Pottering about — while it's up
  useEffect(() => {
    const rail = railRef.current;
    const mover = moverRef.current;
    const lift = liftRef.current;
    if (!onStage || !rail || !mover || !lift) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const s = live.current;
    let frame = 0;
    let timer = 0;
    let looks: number[] = [];
    let visible = true;
    let trip: Trip | null = null;
    let lifted = 0;
    // The way it last travelled, so a backflip turns backwards from where it's facing
    let facing = 1;

    const span = () => Math.max(0, rail.clientWidth - s.width);
    const setX = (x: number) => {
      s.x = x;
      mover.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    // Turns spin about the middle of the bell; the squash stays at its feet
    const setLift = (up: number, sx = 1, sy = 1, turn = 0) => {
      lifted = up;
      const mid = turn ? lift.offsetHeight / 2 - Number.parseFloat(getComputedStyle(lift).transformOrigin.split(" ")[1]) : 0;
      const spin = turn ? ` translate(0, ${mid}px) rotate(${turn}deg) translate(0, ${-mid}px)` : "";
      lift.style.transform = `translate3d(0, ${-up}px, 0)${spin} scale(${sx}, ${sy})`;
    };

    const schedule = (lo = 1400, hi = 3800) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(next, random(lo, hi));
    };

    const finish = (x: number) => {
      trip = null;
      setX(x);
      setLift(0);
      setGaze(null);
      schedule();
    };

    const tick = (now: number) => {
      if (!trip) return;
      let t = now - trip.start;
      let i = 0;
      while (i < trip.hops.length && t > trip.hops[i].ms) t -= trip.hops[i++].ms;
      const at = (k: number) => lerp(trip!.from, trip!.to, Math.min(1, k / trip!.travelling));
      if (i >= trip.hops.length) return finish(at(i));
      // Hovered or tapped mid-trip: come down where it is, so it never hops out from
      // under the pointer
      if (s.still && i < trip.travelling) return land(at(i + t / trip.hops[i].ms));
      const hop = trip.hops[i];
      const p = t / hop.ms;
      setX(at(i + p));
      const fromContact = Math.min(p, 1 - p) * hop.ms;
      if (fromContact < CONTACT_MS) {
        const k = (1 - fromContact / CONTACT_MS) * (hop.h > 6 ? 0.12 : 0.05);
        setLift(hop.h * 4 * p * (1 - p), 1 + k * 0.7, 1 - k);
      } else {
        const k = Math.abs(1 - 2 * p) * 0.05;
        setLift(hop.h * 4 * p * (1 - p), 1 - k * 0.6, 1 + k);
      }
      frame = requestAnimationFrame(tick);
    };

    // Ease down from wherever it is in the air, with a small squash on touch-down
    const land = (x: number) => {
      trip = null;
      setX(x);
      setGaze(null);
      const from = lifted;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / LAND_MS);
        const k = Math.sin(p * Math.PI) * 0.08;
        setLift(from * Math.pow(1 - p, 3), 1 + k * 0.7, 1 - k);
        if (p < 1) frame = requestAnimationFrame(step);
        else {
          setLift(0);
          schedule();
        }
      };
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(step);
    };

    const go = (to: number, hops: { h: number; ms: number }[]) => {
      const from = s.x ?? 0;
      trip = { from, to, hops: [...hops, { h: 4, ms: 140 }], travelling: hops.length, start: performance.now() };
      if (to !== from) {
        facing = Math.sign(to - from);
        setGaze({ x: facing, y: 0.2 });
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const hopOnTheSpot = (h = 14) => go(s.x ?? 0, [{ h, ms: HOP_MS + 40 }]);

    const lookAround = () => {
      const steps: [Gaze, number][] = [
        [{ x: -1, y: 0.1 }, 0],
        [{ x: 1, y: 0.1 }, 720],
        [{ x: 0, y: -0.5 }, 1440],
        [null, 2080],
      ];
      looks = steps.map(([g, at]) => window.setTimeout(() => setGaze(g), at));
      schedule(2400, 4200);
    };

    // Next thing to do: mostly a wander, now and then a hop or a look around
    function next() {
      if (!visible || document.hidden || s.still || trip) return schedule();
      const roll = Math.random();
      if (roll < 0.14) return hopOnTheSpot();
      if (roll < 0.28) return lookAround();
      const x = s.x ?? 0;
      const max = span();
      const step = s.width * HOP_REACH;
      // Head for the far side more often than not, a quarter to two-thirds of the way
      const towards = x > max / 2 ? -1 : 1;
      let dir = Math.random() < 0.75 ? towards : -towards;
      let to = Math.max(0, Math.min(max, x + dir * random(0.25, 0.65) * max));
      if (Math.abs(to - x) < step) {
        dir = -dir;
        to = Math.max(0, Math.min(max, x + dir * random(0.25, 0.65) * max));
      }
      const count = Math.max(1, Math.round(Math.abs(to - x) / step));
      go(to, Array.from({ length: count }, () => ({ h: Math.round(random(10, 16)), ms: HOP_MS })));
    }

    // A trick on the spot, even while hovered: drops whatever it was doing, rises from
    // wherever it is (so a double-click's flip takes over the first click's jump), squashes
    // on take-off and landing, and stretches in the air
    const leap = (rise: number, ms: number, turns: number) => {
      trip = null;
      window.clearTimeout(timer);
      looks.forEach(window.clearTimeout);
      looks = [];
      setGaze(turns ? null : { x: 0, y: -0.5 });
      setActing(true);
      cancelAnimationFrame(frame);
      const from = lifted;
      const h = rise * lift.offsetHeight;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / ms);
        const up = h * 4 * p * (1 - p) + from * (1 - p);
        const fromContact = Math.min(p, 1 - p) * ms;
        const k = fromContact < CONTACT_MS ? (1 - fromContact / CONTACT_MS) * 0.12 : 0;
        const air = Math.sin(p * Math.PI) * 0.05;
        // The turn eases in and out, done just before touch-down
        const q = Math.min(1, p / 0.9);
        const turn = turns * 360 * (q * q * (3 - 2 * q));
        setLift(up, 1 + k * 0.7 - air * 0.6, 1 - k + air, turn % 360 === 0 ? 0 : turn);
        if (p < 1) frame = requestAnimationFrame(step);
        else {
          setLift(0);
          setGaze(null);
          setActing(false);
          schedule();
        }
      };
      frame = requestAnimationFrame(step);
    };
    tricks.current = {
      jump: () => leap(JUMP_UP, JUMP_MS, 0),
      // Backwards from the way it faces: facing right, the top goes left
      flip: () => leap(FLIP_UP, FLIP_MS, -facing),
    };

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(rail);
    schedule(800, 1600);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      looks.forEach(window.clearTimeout);
      io.disconnect();
      tricks.current = null;
      setActing(false);
      setLift(0);
    };
  }, [onStage]);

  // Keep a card or line on screen when the bell is near either end of the counter
  const alignOnCounter = () => {
    const span = Math.max(1, (railRef.current?.clientWidth ?? 0) - layout.width);
    const at = (live.current.x ?? 0) / span;
    return at > 0.66 ? "right" : at < 0.34 ? "left" : "center";
  };
  const edge = (align: "left" | "center" | "right") => (align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2");

  // Copy the email and hold the card up for a few seconds
  const cardTimer = useRef(0);
  const copyEmail = useRef(() => {});
  copyEmail.current = () => {
    track("email_copy_button");
    ringBell();
    setDing((d) => d + 1);
    const align = alignOnCounter();
    const show = (copied: boolean) => {
      setCard({ copied, align });
      window.clearTimeout(cardTimer.current);
      cardTimer.current = window.setTimeout(() => setCard(null), copied ? 4000 : 8000);
      // The first email copied is a goal: a celebration (and the Front desk stamp) once the card is down
      if (copied) celebrate("email", "Email copied.", "desk", 4400);
    };
    try {
      navigator.clipboard.writeText(EMAIL).then(() => show(true), () => show(false));
    } catch {
      show(false);
    }
  };
  useEffect(() => {
    const onCopy = () => copyEmail.current();
    window.addEventListener(COPY_EMAIL_EVENT, onCopy);
    return () => {
      window.removeEventListener(COPY_EMAIL_EVENT, onCopy);
      window.clearTimeout(cardTimer.current);
    };
  }, []);

  // Where the line's pointer sits: under the bell, whichever way the line is aligned
  const pointerAt = (align: "left" | "center" | "right") =>
    align === "left" ? `${layout.width / 2 - 4}px` : align === "right" ? `calc(100% - ${layout.width / 2 + 4}px)` : "calc(50% - 4px)";
  // The board hangs centred under the hands, nudged in from the ends of the counter
  const gripMid = (layout.hands[0].x + layout.hands[1].x) / 2;
  const boardLeft = card
    ? Math.round(gripMid - BOARD_WIDTH / 2 + (card.align === "left" ? BOARD_WIDTH / 2 - gripMid : card.align === "right" ? -(BOARD_WIDTH / 2 - (layout.width - gripMid)) : 0))
    : 0;
  const talking = card !== null || momentHere !== null || (hovered && !touch);

  return (
    // The counter: a rail along the footer's top edge that the bell moves along
    // Clipped at the band's top edge, so the bell can duck behind the counter
    <div
      ref={railRef}
      className="pointer-events-none absolute inset-x-0 z-20"
      style={{ top: -layout.base, height, clipPath: talking ? "none" : `inset(-200px -200px ${height - layout.base}px -200px)` }}
    >
      <div
        ref={moverRef}
        className="pointer-events-auto absolute left-0 top-0"
        style={{ width: layout.width, height }}
        onMouseEnter={() => {
          if (touch) return; // phones fire mouseenter on tap — the tap handles it
          window.clearTimeout(leaveTimer.current);
          if (!hovered) ringBell();
          setHovered(true);
        }}
        onMouseLeave={() => {
          window.clearTimeout(leaveTimer.current);
          leaveTimer.current = window.setTimeout(() => setHovered(false), HOVER_GRACE_MS);
        }}
      >
        <div className={`bell-${entrance}`} style={entrance === "pop" ? { animationDelay: "160ms" } : undefined}>
          <div ref={liftRef} style={{ transformOrigin: `50% ${layout.base}px` }}>
            <button
              type="button"
              aria-label="Bella, the desk bell: click to jump, double-click to backflip"
              onClick={(e) => {
                ringBell();
                setDing((d) => d + 1);
                // The second click of a double-click turns the jump into a backflip
                if (e.detail === 2) tricks.current?.flip();
                else if (e.detail < 2) tricks.current?.jump();
              }}
              onFocus={() => !touch && setHovered(true)}
              onBlur={() => setHovered(false)}
              className="relative z-10 block cursor-pointer select-none touch-manipulation rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape"
            >
              <HostCharacter mood={record ? "champion" : "idle"} ding={ding} gaze={gaze} glasses={watching ? "video" : null} holding={card !== null} expression={momentHere?.kind === "stamp" ? "surprised" : null} celebrate={celebrateCount} className="block" style={{ width: layout.width, height }} />
            </button>
            {/* Below the bell, like the navbar's lines: the copied email, a moment, or the hover hint */}
            {card ? (
              // The navbar's board, hung from both hands below the bell, with the email in its window
              <div className="absolute z-10" style={{ left: boardLeft, top: layout.hands[0].y + 6 }}>
                <div className="host-board" style={{ "--grip-x": `${gripMid - boardLeft}px` } as React.CSSProperties}>
                  <TimerBoard
                    seconds={0}
                    message={{ title: card.copied ? "Email copied" : "Copy it from here", text: EMAIL }}
                    grips={[layout.hands[0].x - boardLeft, layout.hands[1].x - boardLeft]}
                  />
                </div>
              </div>
            ) : momentHere ? (
              <div className={`absolute top-full z-10 mt-[12px] ${edge(alignOnCounter())}`}>
                <BellaLine key={momentHere.id} moment={momentHere} pointerLeft={pointerAt(alignOnCounter())} />
              </div>
            ) : (
              hovered &&
              !touch &&
              !acting && (
                <div className="pointer-events-none absolute left-1/2 top-full mt-[12px] -translate-x-1/2">
                  <p className="host-tip relative whitespace-nowrap rounded-md bg-midnight px-[12px] py-[8px] font-geist font-normal text-[14px] leading-[20px] text-white shadow-[0_8px_20px_rgba(30,5,37,0.22)]">
                    <span aria-hidden="true" className="absolute -top-[4px] left-1/2 -ml-[4px] h-[8px] w-[8px] rotate-45 rounded-xs bg-midnight" />
                    Click me, or double-click
                  </p>
                </div>
              )
            )}
            <p className="sr-only" aria-live="polite">
              {card ? (card.copied ? `Email copied: ${EMAIL}` : `Copying is blocked. The address is ${EMAIL}`) : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Behind the content: the paper tooth, and a corner guesthouse drawn in faint line, centred
// and standing on the floor of the band. The drawing is generated by
// scripts/draw-footer-guesthouse.py; its lines are grape-light.
function FooterBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/images/footer-guesthouse.svg"
        alt=""
        width={1840}
        height={640}
        unoptimized
        className="absolute bottom-0 left-1/2 h-[280px] w-auto max-w-none -translate-x-1/2 opacity-[0.1] md:h-[340px] lg:h-[340px] xl:h-[380px]"
      />
      <PaperTooth />
    </div>
  );
}

export default function Footer() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Trigger the card-rise animation once
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("in-view"); },
      { threshold: 0.08 }
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    // A full-width band of blackcurrant down to the bottom of the page; the content keeps the
    // shared container. Above the page's content layer (z-10), so the bell can sit up past the top edge.
    <footer className="relative z-20 bg-primary">
      <FooterBackdrop />
      <div className="page-container">
        <div ref={cardRef} className="footer-card relative flex flex-col gap-[60px] items-center px-8 pt-[96px] pb-[100px] md:px-16 md:pt-[116px] md:pb-[132px] md:gap-[72px] lg:px-16 lg:pt-[80px] lg:pb-[100px] lg:gap-[64px]">

          <FooterBell />

          {/* Header */}
          <div className="flex flex-col gap-4 items-center text-center relative z-10 lg:gap-6">
            <h2 className="font-heading font-medium text-[36px] leading-[40px] tracking-[-0.36px] text-white md:text-[44px] md:leading-[48px] md:tracking-[-0.44px] lg:text-[48px] lg:leading-[56px] lg:tracking-[-0.48px]">
              Making creating easy and
              <br className="hidden md:block" />
              {" "}enjoyable for everyone.
            </h2>
            <p className="font-body font-normal text-[16px] leading-[26px] text-white/70 text-balance max-w-[320px] md:max-w-[500px] md:text-[18px] md:leading-[28px] lg:text-[20px] lg:leading-[30px] lg:max-w-[504px]">
              For any work inquiries, please feel free to get in touch with me anytime.
            </p>
          </div>

          {/* Social icons */}
          <div className="flex items-center relative z-10">
            {socialLinks.map(({ label, href, bg, tiltClass, icon }, i) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`size-[44px] md:size-[56px] rounded-full border border-line-soft flex items-center justify-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.18] ${tiltClass}`}
                style={{
                  background: bg,
                  marginRight: "-4px",
                  zIndex: i + 1,
                  position: "relative",
                }}
              >
                {icon}
              </a>
            ))}
            {/* Email: a mail icon in the same row, which copies the address and has the bell say so */}
            <button
              type="button"
              aria-label="Copy Ashmik's email address"
              onClick={() => window.dispatchEvent(new Event(COPY_EMAIL_EVENT))}
              className="relative size-[44px] md:size-[56px] rounded-full border border-line-soft flex items-center justify-center shrink-0 bg-[#ea4335] text-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.18] hover:rotate-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ zIndex: socialLinks.length + 1 }}
            >
              {/* A filled envelope */}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] md:h-[24px] md:w-[24px]">
                <path fill="currentColor" d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v.3l-9 5.6-9-5.6v-.3Z" />
                <path fill="currentColor" d="M3 9.1V17.5A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5V9.1l-8.47 5.27a1 1 0 0 1-1.06 0L3 9.1Z" />
              </svg>
            </button>
          </div>


        </div>
      </div>
    </footer>
  );
}
