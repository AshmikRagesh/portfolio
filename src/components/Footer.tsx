"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HostCharacter, { hostLayout } from "@/components/host/HostCharacter";
import { useRecordHolder } from "@/components/host/useRecordHolder";
import { useBellStage } from "@/components/host/BellStage";
import { useTouchScreen } from "@/components/host/useTouchScreen";
import { ringBell } from "@/components/host/bellSound";
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
//   pointer   hover (or keyboard focus) rings it and stops it at its next landing, so it
//             can be clicked; a click rings it and makes it hop.
//   touch     a tap rings it and makes it hop.
// The timer board lives with the bell in the navbar only.
// It never dozes, and turns gold for the longest visit ever. With reduced motion it stays
// where it landed and keeps still.
function FooterBell() {
  const record = useRecordHolder();
  const touch = useTouchScreen();
  const height = useBellHeight();
  const layout = hostLayout(height);
  const [hovered, setHovered] = useState(false);
  const [ding, setDing] = useState(0);
  const [gaze, setGaze] = useState<Gaze>(null);
  const [onStage, setOnStage] = useState(false);
  const [entrance, setEntrance] = useState<"away" | "pop" | "duck">("away");
  const { setFooterOnStage } = useBellStage();
  const railRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const pokeRef = useRef(() => {});

  const still = hovered && !touch; // under the pointer: stays put so it can be rung
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

    const span = () => Math.max(0, rail.clientWidth - s.width);
    const setX = (x: number) => {
      s.x = x;
      mover.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    const setLift = (up: number, sx = 1, sy = 1) => {
      lift.style.transform = `translate3d(0, ${-up}px, 0) scale(${sx}, ${sy})`;
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
      // Done, or hovered/tapped: stop at the landing it has just made
      if (i >= trip.hops.length || (s.still && i > 0 && i <= trip.travelling)) return finish(at(i));
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

    const go = (to: number, hops: { h: number; ms: number }[]) => {
      const from = s.x ?? 0;
      trip = { from, to, hops: [...hops, { h: 4, ms: 140 }], travelling: hops.length, start: performance.now() };
      if (to !== from) setGaze({ x: Math.sign(to - from), y: 0.2 });
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

    pokeRef.current = () => {
      if (!trip) hopOnTheSpot(20);
    };

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(rail);
    schedule(800, 1600);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      looks.forEach(window.clearTimeout);
      io.disconnect();
      pokeRef.current = () => {};
      setLift(0);
    };
  }, [onStage]);

  const ring = () => {
    ringBell();
    setDing((d) => d + 1);
    pokeRef.current();
  };

  return (
    // The counter: a rail along the footer's top edge that the bell moves along
    // Clipped at the band's top edge, so the bell can duck behind the counter
    <div
      ref={railRef}
      className="pointer-events-none absolute inset-x-0 z-20"
      style={{ top: -layout.base, height, clipPath: `inset(-200px -200px ${height - layout.base}px -200px)` }}
    >
      <div
        ref={moverRef}
        className="pointer-events-auto absolute left-0 top-0"
        style={{ width: layout.width, height }}
        onMouseEnter={() => {
          if (touch) return; // phones fire mouseenter on tap — the tap handles it
          setHovered(true);
          ringBell();
        }}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={`bell-${entrance}`} style={entrance === "pop" ? { animationDelay: "160ms" } : undefined}>
          <div ref={liftRef} style={{ transformOrigin: `50% ${layout.base}px` }}>
            <button
              type="button"
              aria-label="Ring the bell"
              onClick={ring}
              onFocus={() => !touch && setHovered(true)}
              onBlur={() => setHovered(false)}
              className="relative z-10 block cursor-pointer select-none rounded-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape"
            >
              <HostCharacter mood={record ? "champion" : "idle"} ding={ding} gaze={gaze} className="block" style={{ width: layout.width, height }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ashmik's signature, written large across the floor of the band in the same faint
// grape-light line the drawing used: the A, the rest of the name in one run, the A's
// crossbar, the dot on the i, and an underline. Drawn in a 600×220 box.
const SIGNATURE = [
  "M40 168 C66 128 98 70 132 28 C142 70 150 116 166 160",
  "M188 150 C196 132 204 116 212 104 C216 118 222 134 214 148 C208 156 196 152 198 144 C222 126 246 80 252 42 C254 24 238 26 238 46 C236 82 236 120 234 152 C244 122 262 108 270 116 C278 126 272 140 276 152 C282 126 294 110 302 116 C310 124 306 140 308 152 C314 126 326 110 334 116 C342 124 338 140 342 152 C348 136 352 122 356 112 C356 128 358 142 366 150 C376 128 386 80 390 44 C392 28 378 30 378 48 C376 90 376 126 374 152 C380 134 392 118 404 114 C412 116 406 128 386 132 C400 138 406 150 422 152 C446 154 476 140 506 118",
  "M76 116 C112 106 152 102 196 110",
  "M358 90 c2 -3 5 -2 4 1",
  "M56 192 C200 178 380 176 566 160",
];

// The signature draws itself once, the first time the footer comes into view, with the
// guestbook signatures' motion: each stroke inks in over 0.9s, the next 0.35s behind.
// Never loops. With reduced motion it's simply there.
function FooterSignature() {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setStill(true);
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setDrawn(true);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 600 220"
      fill="none"
      className="absolute bottom-[16px] left-1/2 w-[360px] -translate-x-1/2 text-grape-light opacity-[0.24] md:w-[560px] lg:bottom-[8px] lg:w-[720px]"
    >
      <defs>
        {/* A little wobble, as in a hand-drawn line */}
        <filter id="footer-signature-wobble" x="-2%" y="-4%" width="104%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </defs>
      <g filter="url(#footer-signature-wobble)" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {SIGNATURE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: drawn ? 0 : 1,
              transition: still ? "none" : `stroke-dashoffset 0.9s cubic-bezier(0.6, 0, 0.3, 1) ${i * 0.35}s`,
            }}
          />
        ))}
      </g>
    </svg>
  );
}

// Behind the content: the paper tooth, and the signature along the floor of the band
function FooterBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <FooterSignature />
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
        <div ref={cardRef} className="footer-card relative flex flex-col gap-[60px] items-center px-8 pt-[96px] pb-[100px] md:px-16 md:pt-[116px] md:pb-[132px] md:gap-[72px] lg:px-[180px] lg:pt-[80px] lg:pb-[100px] lg:gap-[64px]">

          <FooterBell />

          {/* Header */}
          <div className="flex flex-col gap-4 items-center text-center relative z-10 lg:gap-6">
            <h2 className="font-heading font-medium text-[32px] leading-[40px] tracking-[0px] text-white md:text-[40px] md:leading-[48px] lg:text-[44px] lg:leading-[48px] lg:tracking-[-0.44px] xl:text-[50px] xl:leading-[58px] xl:tracking-[-2px]">
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
                  marginRight: i < socialLinks.length - 1 ? "-4px" : 0,
                  zIndex: i + 1,
                  position: "relative",
                }}
              >
                {icon}
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
