"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCuriosity } from "@/context/CuriosityContext";
import HostCharacter, { hostLayout, type HostMood } from "@/components/host/HostCharacter";
import TimerBoard, { BOARD_WIDTH } from "@/components/host/TimerBoard";
import { useRecordHolder } from "@/components/host/useRecordHolder";
import { useTouchScreen } from "@/components/host/useTouchScreen";
import { ringBell } from "@/components/host/bellSound";
import LobbyIllustration from "@/components/LobbyIllustration";

const socialLinks = [
  {
    label: "Discord",
    href: "https://discord.com/users/ashmikragesh",
    bg: "#67c23a",
    tiltClass: "hover:-rotate-6",
    icon: <img src="/icons/social-discord.svg" alt="Discord" className="w-[18px] h-[18px] md:w-[25px] md:h-[25px]" />,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/ashmikragesh",
    bg: "#1f88f9",
    tiltClass: "hover:rotate-6",
    icon: <img src="/icons/social-linkedin.svg" alt="LinkedIn" className="w-[18px] h-[18px] md:w-[25px] md:h-[25px]" />,
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/ashmikragesh",
    bg: "#091624",
    tiltClass: "hover:-rotate-3",
    icon: <img src="/icons/social-x.svg" alt="Twitter / X" className="w-[18px] h-[18px] md:w-[25px] md:h-[25px]" />,
  },
];

// Bell height on phone / tablet / desktop
const BELL_HEIGHT = { sm: 72, md: 88, lg: 112 };
// The board never comes closer than this to the edge of the screen
const BOARD_EDGE = 12;

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

// The front-desk bell, sitting on the footer card as if the card were the counter — where
// the telephone used to hang. Once the card has risen into view it drops onto the edge and
// rings. After that it behaves like the one in the navbar:
//   pointer   hover (or keyboard focus) rings it and lowers the board over the front of
//             the counter; a click rings it again.
//   touch     a tap rings it and toggles the board.
// It dozes while the clock is paused and turns gold for the longest visit ever.
function FooterBell() {
  const { activeSeconds, paused } = useCuriosity();
  const record = useRecordHolder();
  const touch = useTouchScreen();
  const height = useBellHeight();
  const layout = hostLayout(height);
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false); // touch: board pinned down by a tap
  const [ding, setDing] = useState(0);
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const holding = (hovered && !touch) || open;
  const mood: HostMood = paused && !holding ? "dozing" : record ? "champion" : "idle";

  useEffect(() => {
    if (holding) setDing((d) => d + 1);
  }, [holding]);

  // The board hangs centred under the hands, nudged in if that would run off-screen
  const [left, right] = layout.hands;
  const gripMid = (left.x + right.x) / 2;
  const boardLeft = gripMid - BOARD_WIDTH / 2 + shift;

  useLayoutEffect(() => {
    if (!holding) return;
    const edge = (wrapRef.current?.getBoundingClientRect().left ?? 0) + gripMid - BOARD_WIDTH / 2;
    const overRight = edge + BOARD_WIDTH - (document.documentElement.clientWidth - BOARD_EDGE);
    setShift(overRight > 0 ? -overRight : Math.max(0, BOARD_EDGE - edge));
  }, [holding, gripMid]);

  const ring = () => {
    ringBell();
    setDing((d) => d + 1);
    if (touch) setOpen((o) => !o);
  };

  return (
    <div
      ref={wrapRef}
      className="footer-bell absolute right-[48px] z-20 md:right-[64px] lg:right-[96px]"
      style={{ top: -layout.base, width: layout.width, height, transformOrigin: `50% ${layout.base}px` }}
      // Rings as it lands — only for its own landing, not the ding animations inside it
      onAnimationEnd={(e) => e.target === e.currentTarget && setDing((d) => d + 1)}
      onMouseEnter={() => {
        if (touch) return; // phones fire mouseenter on tap — the tap handles it
        setHovered(true);
        ringBell();
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-label="Measuring your curiosity — ring the bell to see your time"
        aria-expanded={holding}
        onClick={ring}
        onFocus={() => !touch && setHovered(true)}
        onBlur={() => setHovered(false)}
        className="relative z-10 block cursor-pointer select-none rounded-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape"
      >
        <HostCharacter mood={mood} holding={holding} ding={ding} className="block" style={{ width: layout.width, height }} />
      </button>

      {/* Timer board — hangs from the hands over the front of the counter. On touch, a tap puts it away. */}
      {holding && (
        <div className="absolute" style={{ left: boardLeft, top: left.y + 6 }} onClick={() => touch && setOpen(false)}>
          <div className="host-board" style={{ "--grip-x": `${gripMid - boardLeft}px` } as React.CSSProperties}>
            <TimerBoard seconds={activeSeconds} champion={record} grips={[left.x - boardLeft, right.x - boardLeft]} />
          </div>
        </div>
      )}
    </div>
  );
}

// Paper tooth, as on the taste-note mailers: a small tile of per-pixel grain made once and
// repeated. Here it's pale specks over the dark, so the band reads as a surface.
let toothTile: string | null = null;
function tooth() {
  if (toothTile) return toothTile;
  const size = 160;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = 249;
    img.data[i + 1] = 228;
    img.data[i + 2] = 255;
    img.data[i + 3] = Math.random() < 0.5 ? Math.random() * 22 : 0;
  }
  ctx.putImageData(img, 0, 0);
  toothTile = c.toDataURL();
  return toothTile;
}

// Behind the content: the paper tooth, and the lobby drawn in faint line along the floor
function FooterBackdrop() {
  const [grain, setGrain] = useState("");
  useEffect(() => setGrain(tooth()), []);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <LobbyIllustration className="absolute bottom-0 left-1/2 w-full min-w-[1100px] max-w-[1600px] -translate-x-1/2 text-grape-light opacity-[0.14]" />
      {grain && <div className="absolute inset-0" style={{ backgroundImage: `url(${grain})` }} />}
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
        <div ref={cardRef} className="footer-card relative flex flex-col gap-[60px] items-center px-8 pt-16 pb-16 md:px-16 md:pt-20 md:pb-24 md:gap-[72px] lg:px-[180px] lg:pt-[100px] lg:pb-[80px] lg:gap-[100px]">

          <FooterBell />

          {/* Header */}
          <div className="flex flex-col gap-4 items-center text-center relative z-10 lg:gap-6">
            <h2 className="font-heading font-medium text-[28px] leading-[1.18] tracking-[-0.28px] text-white md:text-[36px] md:leading-[44px] lg:text-[44px] lg:leading-[48px] lg:tracking-[-0.44px]">
              Making creating easy and
              <br className="hidden md:block" />
              {" "}enjoyable for everyone.
            </h2>
            <p className="font-body font-normal text-[16px] leading-[26px] text-muted max-w-[280px] md:max-w-[500px] md:text-[18px] md:leading-[28px] lg:text-[20px] lg:leading-[30px] lg:max-w-[504px]">
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
                className={`size-[44px] md:size-[57px] rounded-full border border-line-soft flex items-center justify-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.18] ${tiltClass}`}
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

          {/* Copyright */}
          <p className="font-body font-normal text-[14px] leading-[22px] text-muted text-center relative z-10 md:text-[16px] md:leading-[24px]">
            Designed + Coded with ❤︎ by Ashmik
          </p>

        </div>
      </div>
    </footer>
  );
}
