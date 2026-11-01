"use client";

// ── The envelope scene ────────────────────────────────────────────────────────
// The top of the pass page, after solanasummit.in: the section is pinned while the
// visitor scrolls, and the scroll drives everything (nothing plays on its own).
//
//   0–12%    the gold wax seal cracks and its halves fall away
//   6–26%    the flap swings up and over, showing the liner, and passes behind the pass
//   22–52%   the pass rises out of the envelope, tilting a little
//   48–72%   the envelope drops away and fades; the title above fades out
//   50–80%   the pass straightens and settles in the middle, a touch bigger
//   72%+     the visitor's numbers on the pass fade in; once settled the pass leans to
//            the pointer
// Every time the page loads it starts at the top with the envelope sealed. Once opened it
// stays open while they're on the page, and the section shrinks to one screen, so
// scrolling back up doesn't close it or take long. `onOpen` fires
// once the pass is out, so the page can hold the rest back until then.
//
// A flat blackcurrant envelope on the dark grid, thin fold lines, a liner of small gold
// bells. With reduced motion there's no pinning:
// the pass is simply shown.

import { useEffect, useRef, useState, type ReactElement } from "react";
import { ringBell } from "@/components/host/bellSound";

const OLD_KEY = "ash.bella.passOpened"; // once kept the pass open for good; cleared on load


const BELL_PATH =
  "M48 214 Q48 140 100 140 Q152 140 152 214 Z M76 176 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M106 176 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M94 124 h12 v14 h-12 Z M38 212 h124 v14 h-124 Z";
const BLOB = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const r = 54 + 2.6 * Math.sin(a * 5 + 0.6) + 1.8 * Math.sin(a * 9 + 2.1) + 1.2 * Math.sin(a * 14);
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)} ${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
})();
const CRACK = {
  left: "M-4 -4 L62 -4 L56 22 L66 40 L54 62 L64 82 L56 104 L60 124 L-4 124 Z",
  right: "M62 -4 L124 -4 L124 124 L60 124 L56 104 L64 82 L54 62 L66 40 L56 22 Z",
};

// Poured gold wax with Bella pressed into it
function Seal({ id, half }: { id: string; half?: "left" | "right" }) {
  return (
    <svg viewBox="-6 -6 132 132" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}w`} cx="36%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffe9a6" />
          <stop offset="0.4" stopColor="#e3b450" />
          <stop offset="1" stopColor="#8a5c12" />
        </radialGradient>
        {half && (
          <clipPath id={`${id}c`}>
            <path d={CRACK[half]} />
          </clipPath>
        )}
      </defs>
      <g clipPath={half ? `url(#${id}c)` : undefined}>
        <path d={BLOB} fill={`url(#${id}w)`} />
        <circle cx="60" cy="60" r="40" fill="#c8952e" />
        <circle cx="60" cy="60" r="40" fill="none" stroke="#6b4508" strokeOpacity="0.5" strokeWidth="2.5" transform="translate(0.8 1.2)" />
        <circle cx="60" cy="60" r="40.5" fill="none" stroke="#fff3c4" strokeOpacity="0.6" strokeWidth="1.5" transform="translate(-0.6 -0.8)" />
        <g transform="translate(60 60) scale(0.36) translate(-100 -176)">
          <path d={BELL_PATH} fillRule="evenodd" fill="#5e3a06" opacity="0.6" transform="translate(-2.4 -3)" />
          <path d={BELL_PATH} fillRule="evenodd" fill="#fff3c4" opacity="0.6" transform="translate(2.4 3)" />
          <path d={BELL_PATH} fillRule="evenodd" fill="#c8952e" />
        </g>
        <ellipse cx="38" cy="30" rx="16" ry="7" fill="#fff" opacity="0.35" transform="rotate(-32 38 30)" />
      </g>
    </svg>
  );
}

function Liner({ id }: { id: string }) {
  return (
    <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
      <rect width="44" height="44" fill="#260630" />
      <g fill="#c8952e" opacity="0.45">
        <path d="M6 16 Q6 8 12 8 Q18 8 18 16 Z M5 16.5 h14 v2 h-14 Z M11 5.5 h2 v3 h-2 Z" />
        <path d="M28 38 Q28 30 34 30 Q40 30 40 38 Z M27 38.5 h14 v2 h-14 Z M33 27.5 h2 v3 h-2 Z" />
      </g>
    </pattern>
  );
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const inn = (t: number) => t * t * t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function PassScene({
  head,
  pass,
  onOpen,
}: {
  head: ReactElement;
  pass: (state: { revealed: boolean; tilt: boolean }) => ReactElement;
  onOpen?: () => void;
}) {
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const section = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const flapOut = useRef<HTMLDivElement>(null);
  const sealLayer = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);
  const halves = useRef<(HTMLDivElement | null)[]>([]);
  const hint = useRef<HTMLParagraphElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setRevealed(true);
      setSettled(true);
      onOpenRef.current?.();
      return;
    }
    let raf = 0;
    let cracked = false;
    let locked = false;
    try {
      localStorage.removeItem(OLD_KEY);
      sessionStorage.removeItem(OLD_KEY);
    } catch {}
    // Start at the top, sealed, even on a reload (no restored scroll position past it)
    const restore = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const vw = window.innerWidth, vh = window.innerHeight;
      let p = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - vh));
      // Opened once, it stays open, and the long scroll it took folds away: the section
      // drops to one screen and the page shifts up by the same amount, so the view doesn't
      // jump and scrolling back up reaches the top straight away
      if (p >= 0.92 && !locked) {
        locked = true;
        const fold = el.offsetHeight - vh;
        el.classList.add("is-open");
        window.scrollTo(0, Math.max(0, window.scrollY - fold));
        onOpenRef.current?.();
      }
      if (locked) p = 1;

      const W = Math.min(620, vw * 0.86, vh * 0.9);
      const H = (W * 5) / 7;
      const envW = W * 1.3, envH = (envW * 5) / 7;
      // Where the envelope sits at first: under the title, running off the bottom
      const base = Math.max(vh * 0.13 + 160, vh * 0.4);
      const envTop = base + vh * 0.85 * inn(seg(p, 0.48, 0.72));
      const envFade = 1 - seg(p, 0.6, 0.72);

      // The pass: inside, risen out, then settled in the middle
      const inside = base + envH - H - 16; // tucked fully inside the pocket
      const risen = base - H * 0.45;
      const finalScale = 1.06;
      const settledTop = (vh - H * finalScale) / 2 + 32;
      const rise = out(seg(p, 0.22, 0.52));
      const settle = inOut(seg(p, 0.5, 0.8));
      const top = lerp(lerp(inside, risen, rise), settledTop, settle);
      const rot = -4 * rise * (1 - settle);
      const scale = lerp(1, finalScale, settle);
      if (card.current) {
        card.current.style.width = `${W}px`;
        card.current.style.transform = `translate(-50%, ${top}px) rotate(${rot}deg) scale(${scale})`;
        card.current.style.transformOrigin = "50% 0";
      }

      [back.current, front.current, sealLayer.current].forEach((e) => {
        if (!e) return;
        e.style.width = `${envW}px`;
        e.style.height = `${envH}px`;
        e.style.transform = `translate(-50%, ${envTop}px)`;
        e.style.opacity = String(envFade);
      });
      const turn = inOut(seg(p, 0.06, 0.26));
      if (flap.current) {
        flap.current.style.width = `${envW}px`;
        flap.current.style.height = `${envH}px`;
        flap.current.style.transform = `perspective(1400px) translate(-50%, ${envTop}px) rotateX(${turn * 180}deg)`;
        flap.current.style.zIndex = turn < 0.5 ? "4" : "1";
        flap.current.style.opacity = String(envFade);
      }
      if (flapOut.current) flapOut.current.style.filter = `brightness(${1 - 0.25 * Math.sin(turn * Math.PI)})`;

      // The seal cracks, and the halves fall away
      const c = seg(p, 0.015, 0.12);
      if (seal.current) seal.current.style.opacity = c > 0 ? "0" : "1";
      halves.current.forEach((h, i) => {
        if (!h) return;
        const side = i ? 1 : -1;
        h.style.opacity = c > 0 ? String(1 - seg(c, 0.5, 1)) : "0";
        h.style.transform = `translate(${side * (10 + 60 * c)}px, ${140 * c * c}px) rotate(${side * 60 * c}deg)`;
      });
      if (c > 0 && !cracked) {
        cracked = true;
        ringBell();
      } else if (c === 0) cracked = false;

      if (headRef.current) {
        const h = seg(p, 0.32, 0.5);
        headRef.current.style.opacity = String(1 - h);
        headRef.current.style.transform = `translateY(${-40 * h}px)`;
      }
      if (hint.current) {
        // Just under the seal, kept on screen
        const sealBottom = envTop + envH * 0.61 + envW * 0.085;
        hint.current.style.top = `${Math.min(sealBottom + 20, vh - 56)}px`;
        hint.current.style.opacity = String(1 - seg(p, 0, 0.06));
      }
      setRevealed(p > 0.72);
      setSettled(p > 0.9);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      history.scrollRestoration = restore;
    };
  }, []);

  if (still) {
    return (
      <div className="flex flex-col items-center gap-[48px] pt-[160px] pb-[64px]">
        {head}
        <div className="w-full max-w-[620px] px-[16px]">{pass({ revealed: true, tilt: false })}</div>
      </div>
    );
  }

  return (
    <div ref={section} className="ps-section">
      <div className="ps-sticky">
        <div ref={headRef} className="ps-head">
          {head}
        </div>

        {/* Inside of the envelope: a dark liner */}
        <div ref={back} className="ps-env" style={{ zIndex: 1 }} aria-hidden="true">
          <div className="ps-env-part">
            <svg viewBox="0 0 700 500" preserveAspectRatio="none">
              <defs>
                <Liner id="psl1" />
              </defs>
              <rect width="700" height="500" rx="4" fill="#2e0939" />
              <rect x="10" y="8" width="680" height="300" fill="url(#psl1)" />
            </svg>
          </div>
        </div>

        <div ref={card} className="ps-card" style={{ zIndex: 2 }}>
          {pass({ revealed, tilt: settled })}
        </div>

        {/* The pocket: side flaps and the bottom flap, with thin fold lines */}
        <div ref={front} className="ps-env" style={{ zIndex: 3 }} aria-hidden="true">
          <div className="ps-env-part">
            <svg viewBox="0 0 700 500" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pss1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#33093f" />
                  <stop offset="1" stopColor="#40104c" />
                </linearGradient>
                <linearGradient id="pss2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#521960" />
                  <stop offset="1" stopColor="#3f0f4a" />
                </linearGradient>
              </defs>
              <path d="M0 0 L372 268 Q378 273 372 278 L0 500 Z" fill="url(#pss1)" />
              <path d="M700 0 L328 268 Q322 273 328 278 L700 500 Z" fill="url(#pss1)" />
              <path d="M0 500 L330 226 Q350 212 370 226 L700 500 Z" fill="url(#pss2)" />
              <path d="M0 0 L372 268 M700 0 L328 268 M0 500 L330 226 Q350 212 370 226 L700 500" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" />
              <rect x="1" y="1" width="698" height="498" rx="4" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div ref={flap} className="ps-env ps-flap" style={{ zIndex: 4 }} aria-hidden="true">
          <div ref={flapOut} className="ps-flap-face">
            <svg viewBox="0 0 700 500" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pss3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#47135a" />
                  <stop offset="1" stopColor="#5c1f6c" />
                </linearGradient>
              </defs>
              <path d="M0 0 L700 0 L370 296 Q350 312 330 296 Z" fill="url(#pss3)" />
              <path d="M0 0 L370 296 Q350 312 330 296 L700 0" fill="none" stroke="#fff" strokeOpacity="0.09" strokeWidth="2" />
            </svg>
          </div>
          <div className="ps-flap-face is-inside">
            <svg viewBox="0 0 700 500" preserveAspectRatio="none">
              <defs>
                <Liner id="psl2" />
              </defs>
              <path d="M0 0 L700 0 L370 296 Q350 312 330 296 Z" fill="#3a0c46" />
              <path d="M12 6 L688 6 L366 290 Q350 302 334 290 Z" fill="url(#psl2)" />
            </svg>
          </div>
        </div>

        <div ref={sealLayer} className="ps-env" style={{ zIndex: 5 }} aria-hidden="true">
          <div ref={seal} className="ps-seal">
            <Seal id="pss" />
          </div>
          {(["left", "right"] as const).map((h, i) => (
            <div key={h} ref={(el) => void (halves.current[i] = el)} className="ps-half">
              <Seal id={`psh${i}`} half={h} />
            </div>
          ))}
        </div>

        <p ref={hint} className="ps-hint">
          <span>Scroll to open</span>
        </p>
      </div>
    </div>
  );
}
