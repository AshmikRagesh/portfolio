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
// stays open while they're on the page, and the section shrinks to one screen (on a phone,
// just the pass), so
// scrolling back up doesn't close it or take long. `onOpen` fires
// once the pass is out, so the page can hold the rest back until then.
//
// A blackcurrant paper envelope with a scalloped flap: paper grain, a light from the top
// left, soft shadows where the flaps overlap, and a liner of small gold bells. Sealed
// with real-looking gold wax. With reduced motion there's no pinning:
// the pass is simply shown.

import { useEffect, useRef, useState, type ReactElement } from "react";
import { ringBell } from "@/components/host/bellSound";
import { useTouchScreen } from "@/components/host/useTouchScreen";

const OLD_KEY = "ash.bella.passOpened"; // once kept the pass open for good; cleared on load
const NAV = 88; // the navbar's height on a phone


const CRACK = {
  left: "M-6 -6 L62 -6 L56 22 L66 40 L54 62 L64 82 L56 104 L60 126 L-6 126 Z",
  right: "M62 -6 L126 -6 L126 126 L60 126 L56 104 L64 82 L54 62 L66 40 L56 22 Z",
};

// Gold wax pressed with a copperplate "A" seal, after real metallic sealing wax: six
// soft poured lobes, a rounded rim, a groove, a double ring, a satin face with a fine
// metallic sand. It's a lit render (public/images/bella/wax-seal.webp, made from a
// height map with real lighting), so the wax reads as wax; the cracked halves clip it.
function Seal({ id, half }: { id: string; half?: "left" | "right" }) {
  return (
    <svg viewBox="-6 -6 132 132" aria-hidden="true">
      {half && (
        <defs>
          <clipPath id={`${id}c`}>
            <path d={CRACK[half]} />
          </clipPath>
        </defs>
      )}
      <image href="/images/bella/wax-seal.webp" x="-6" y="-6" width="132" height="132" clipPath={half ? `url(#${id}c)` : undefined} />
    </svg>
  );
}

// The flap's edge: from each top corner down to the point in three soft scallops,
// `inset` further in for the liner printed inside it
function flapPath(inset = 0) {
  const y0 = inset * 0.6, tip: [number, number] = [350, 300 - inset * 1.6];
  const side = (ax: number, ay: number, bx: number, by: number) => {
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    const pts: string[] = [];
    for (let i = 1; i <= 60; i++) {
      const t = i / 60, bump = 9 * Math.abs(Math.sin(Math.PI * 3 * t));
      pts.push(`${(ax + dx * t - (dy / len) * bump).toFixed(1)} ${(ay + dy * t + (dx / len) * bump).toFixed(1)}`);
    }
    return pts.join(" L");
  };
  return `M${inset} ${y0} L${side(inset, y0, tip[0], tip[1])} L${side(tip[0], tip[1], 700 - inset, y0)} Z`;
}
const FLAP = flapPath();
const FLAP_IN = flapPath(14);

// The envelope's paper: a fine grain of light fibres and a faint mottle, over any shape
// drawn with it; a light from the top left; and a soft blur for shadows
function PaperDefs({ id }: { id: string }) {
  return (
    <>
      <filter id={`${id}g`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.94  0 0 0 0 1  0 0 0 1.1 -0.5" result="lt" />
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="2" seed="9" result="m" />
        <feColorMatrix in="m" type="matrix" values="0 0 0 0 0.04  0 0 0 0 0  0 0 0 0 0.06  0 0 0 0.5 -0.17" result="dk" />
        <feMerge>
          <feMergeNode in="dk" />
          <feMergeNode in="lt" />
        </feMerge>
        <feComposite in2="SourceAlpha" operator="in" />
      </filter>
      <linearGradient id={`${id}l`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="700" y2="500">
        <stop offset="0" stopColor="#fff" stopOpacity="0.08" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.2" />
      </linearGradient>
      <filter id={`${id}b`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </>
  );
}

function Liner({ id }: { id: string }) {
  return (
    <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
      <rect width="44" height="44" fill="#1e0525" />
      <g fill="#c79a45" opacity="0.38">
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
  const flapShadow = useRef<SVGPathElement>(null);
  const sealLayer = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);
  const halves = useRef<(HTMLDivElement | null)[]>([]);
  const hint = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [still, setStill] = useState(false);
  const touch = useTouchScreen();
  const playing = useRef(0);

  // Open it for them: a tap on the hint or the seal scrolls through the scene by itself,
  // at an easy pace. Any wheel, touch or key takes the scroll back.
  const openNow = () => {
    const el = section.current;
    if (!el || el.classList.contains("is-open") || playing.current) return;
    const from = window.scrollY;
    const to = from + el.getBoundingClientRect().top + el.offsetHeight - window.innerHeight;
    const dur = Math.min(2800, Math.max(1600, (to - from) * 0.9));
    const t0 = performance.now();
    const events = ["wheel", "touchstart", "keydown"] as const;
    const stop = () => {
      cancelAnimationFrame(playing.current);
      playing.current = 0;
      events.forEach((ev) => window.removeEventListener(ev, stop));
    };
    // Added a moment later, so the tap that started it doesn't stop it
    window.setTimeout(() => playing.current && events.forEach((ev) => window.addEventListener(ev, stop, { passive: true })), 50);
    const step = (now: number) => {
      // Once it's open the scene puts the pass in view itself; don't scroll past that
      if (el.classList.contains("is-open")) return stop();
      const t = Math.min(1, (now - t0) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      window.scrollTo({ top: from + (to - from) * e, behavior: "instant" });
      if (t < 1) playing.current = requestAnimationFrame(step);
      else stop();
    };
    playing.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(playing.current), []);

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
      const narrow = vw < 640;
      // On a phone the pass runs nearly edge to edge, wider than the cards below it, so it
      // leads the page; it doesn't grow as it settles there
      const W = narrow ? Math.min(620, vw - 16) : Math.min(620, vw * 0.86, vh * 0.9);
      const H = (W * 5) / 7;
      const finalScale = narrow ? 1 : 1.06;
      // Settled: in the middle of the screen, or on a phone just under the navbar so the
      // house follows close behind
      const settledTop = narrow ? 120 : (vh - H * finalScale) / 2 + 32;
      const openH = narrow ? settledTop + H * finalScale + 40 : vh;

      if (p >= 0.92 && !locked) {
        locked = true;
        const pageTop = window.scrollY + el.getBoundingClientRect().top;
        el.classList.add("is-open");
        el.style.height = `${openH}px`;
        window.scrollTo(0, pageTop);
        onOpenRef.current?.();
      }
      if (locked) {
        p = 1;
        el.style.height = `${openH}px`;
      }

      // Where the envelope sits at first: under the title, running off the bottom, with
      // the seal and Scroll to open (0.521 of its width down) just above the fold. On a
      // phone it's wider than the screen and sits as low as that allows.
      let base: number, envW: number;
      if (narrow) {
        // The title sits in the middle of the space left above the envelope
        const headH = headRef.current?.offsetHeight ?? 200;
        envW = Math.max(W * 1.08, Math.min(vw * 1.4, (vh - 64 - (NAV + headH + 64)) / 0.521));
        base = vh - 64 - envW * 0.521;
        if (headRef.current) headRef.current.style.top = `${Math.max(NAV + 24, NAV + (base - NAV - headH) / 2)}px`;
      } else {
        base = Math.max(320, vh * 0.4);
        envW = Math.max(W * 1.08, Math.min(W * 1.3, (vh - base - 64) / 0.521));
      }
      const envH = (envW * 5) / 7;
      const envTop = base + vh * 0.85 * inn(seg(p, 0.48, 0.72));
      const envFade = 1 - seg(p, 0.6, 0.72);

      // The pass: inside, risen out, then settled in the middle
      const inside = base + envH - H - 16; // tucked fully inside the pocket
      const risen = base - H * 0.45;
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
      if (flapShadow.current) flapShadow.current.style.opacity = String(0.55 * (1 - seg(turn, 0, 0.3)));

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
        const btn = hint.current.firstElementChild as HTMLElement | null;
        if (btn) btn.style.visibility = p > 0.06 ? "hidden" : "";
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

        {/* Inside of the envelope: the liner, darker deeper in the pocket */}
        <div ref={back} className="ps-env" style={{ zIndex: 1 }} aria-hidden="true">
          <div className="ps-env-part is-back">
            <svg viewBox="0 0 700 500" preserveAspectRatio="none">
              <defs>
                <PaperDefs id="pse0" />
                <Liner id="psl1" />
                <linearGradient id="psd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#000" stopOpacity="0" />
                  <stop offset="1" stopColor="#000" stopOpacity="0.55" />
                </linearGradient>
              </defs>
              <rect width="700" height="500" fill="#2a0634" />
              <rect x="10" y="8" width="680" height="300" fill="url(#psl1)" />
              <rect width="700" height="500" fill="url(#pse0l)" />
              <rect width="700" height="500" fill="#000" filter="url(#pse0g)" opacity="0.14" />
              <rect y="100" width="700" height="400" fill="url(#psd)" />
            </svg>
          </div>
        </div>

        <div ref={card} className="ps-card" style={{ zIndex: 2 }}>
          {pass({ revealed, tilt: settled })}
        </div>

        {/* The pocket: side flaps and the bottom flap, folded paper with soft shadows where
            one layer lies over another */}
        <div ref={front} className="ps-env" style={{ zIndex: 3 }} aria-hidden="true">
          <div className="ps-env-part">
            <svg viewBox="0 0 700 500" preserveAspectRatio="none">
              <defs>
                <PaperDefs id="pse1" />
                <linearGradient id="pss1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#2c0637" />
                  <stop offset="1" stopColor="#35083f" />
                </linearGradient>
                <linearGradient id="pss2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3b0a48" />
                  <stop offset="1" stopColor="#32073e" />
                </linearGradient>
                <clipPath id="pso">
                  <path d="M0 0 L322 232 L350 214 L378 232 L700 0 Z" />
                </clipPath>
              </defs>
              {/* The pocket's edge darkens whatever is just inside it */}
              <g clipPath="url(#pso)" opacity="0.6">
                <path d="M0 0 L322 232 L350 214 L378 232 L700 0" fill="none" stroke="#0b0110" strokeWidth="28" filter="url(#pse1b)" />
              </g>
              <path d="M0 0 L372 268 Q378 273 372 278 L0 500 Z" fill="url(#pss1)" />
              <path d="M700 0 L328 268 Q322 273 328 278 L700 500 Z" fill="url(#pss1)" />
              <path d="M0 500 L330 226 Q350 212 370 226 L700 500 Z" fill="#000" opacity="0.45" filter="url(#pse1b)" transform="translate(3 -2)" />
              <path d="M0 500 L330 226 Q350 212 370 226 L700 500 Z" fill="url(#pss2)" />
              <g fill="#000">
                <path d="M0 0 L372 268 Q378 273 372 278 L0 500 Z M700 0 L328 268 Q322 273 328 278 L700 500 Z M0 500 L330 226 Q350 212 370 226 L700 500 Z" fill="url(#pse1l)" />
                <path d="M0 0 L372 268 Q378 273 372 278 L0 500 Z M700 0 L328 268 Q322 273 328 278 L700 500 Z" filter="url(#pse1g)" opacity="0.16" />
                <path d="M0 500 L330 226 Q350 212 370 226 L700 500 Z" filter="url(#pse1g)" opacity="0.16" />
              </g>
              {/* Folded edges catch the light */}
              <path d="M0 500 L330 226 Q350 212 370 226 L700 500" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" />
              <path d="M0 0 L372 268 M700 0 L328 268" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1.5" />
              {/* Sides and bottom only: a top edge here would cross the pass as it comes out */}
              <path d="M1 1 V499 H699 V1" fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="2" />
              {/* The closed flap's soft shadow on the pocket; fades as the flap lifts */}
              <path ref={flapShadow} d={FLAP} fill="#0b0110" opacity="0.55" filter="url(#pse1b)" transform="translate(4 9)" />
            </svg>
          </div>
        </div>

        <div ref={flap} className="ps-env ps-flap" style={{ zIndex: 4 }} aria-hidden="true">
          <div ref={flapOut} className="ps-flap-face">
            <svg viewBox="0 0 700 500" preserveAspectRatio="none">
              <defs>
                <PaperDefs id="pse2" />
                <linearGradient id="pss3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3c0b4a" />
                  <stop offset="1" stopColor="#32073e" />
                </linearGradient>
              </defs>
              <path d={FLAP} fill="url(#pss3)" />
              <path d={FLAP} fill="url(#pse2l)" />
              <path d={FLAP} fill="#000" filter="url(#pse2g)" opacity="0.16" />
              <path d={FLAP} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="ps-flap-face is-inside">
            <svg viewBox="0 0 700 500" preserveAspectRatio="none">
              <defs>
                <PaperDefs id="pse3" />
                <Liner id="psl2" />
              </defs>
              <path d={FLAP} fill="#2a0634" />
              <path d={FLAP_IN} fill="url(#psl2)" />
              <path d={FLAP} fill="#000" filter="url(#pse3g)" opacity="0.14" />
            </svg>
          </div>
        </div>

        <div ref={sealLayer} className="ps-env" style={{ zIndex: 5 }} aria-hidden="true">
          <div ref={seal} className="ps-seal cursor-pointer" onClick={openNow}>
            <Seal id="pss" />
          </div>
          {(["left", "right"] as const).map((h, i) => (
            <div key={h} ref={(el) => void (halves.current[i] = el)} className="ps-half">
              <Seal id={`psh${i}`} half={h} />
            </div>
          ))}
        </div>

        <div ref={hint} className="ps-hint">
          <button type="button" onClick={openNow}>
            <span>{touch ? "Tap to open" : "Scroll or click to open"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
