"use client";

// ── Guest card ────────────────────────────────────────────────────────────────
// The visitor's registration card: heavy cream stock with a paper grain, a printed gold
// hairline with corner marks, a gold-foil guest number, a blind-embossed Bella in the
// corner, every word in Geist. Six things on it: guest number, where they're from, the
// day they arrived, their stay, who they're here as, and their stamps.
//
// It tilts toward the pointer on an underdamped spring and a soft light follows the
// pointer across the foil — the same numbers as the ticket stub on imdaryl.com:
// x'' = −k(x − target) − 2ζx' with k = 237.6 and ζ = 7.5, 10° of tilt per unit of
// travel, travel capped at 1.8, following the pointer up to 120px past the card's edge
// before letting go; the light fades in over 0.18s and out over 0.26s.
// Styles: .guest-card in globals.css. With reduced motion it holds still.

import { useEffect, useRef } from "react";
import Stamp from "@/components/bella/Stamp";
import { STAMPS, stampDate } from "@/lib/bella/stampArt";
import type { Progress } from "@/lib/bella/progress";

const K = 237.6;
const ZETA = 7.5;
const CAP = 1.8;
const REACH = 120;

export interface GuestCardProps {
  guestNo: number | null;
  from: string | null;
  arrived: string;
  stay: string;
  progress: Progress;
  returning: boolean;
  /** Tilt toward the pointer. Off while the card is still in its envelope. */
  tilt?: boolean;
}

export default function GuestCard({ guestNo, from, arrived, stay, progress, returning, tilt = true }: GuestCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const found = STAMPS.filter((s) => progress.stamps[s.key]).length;

  useEffect(() => {
    const card = ref.current;
    if (!card || !tilt || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ax = { p: 0, v: 0, t: 0 };
    const ay = { p: 0, v: 0, t: 0 };
    let lit = 0, litT = 0, lx = 50, ly = 30, lxT = 50, lyT = 30, raf = 0, last = 0;
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    const spring = (a: typeof ax, h: number) => {
      a.v += (-K * (a.p - a.t) - 2 * ZETA * a.v) * h;
      a.p += a.v * h;
    };
    const step = (ts: number) => {
      const dt = Math.min(0.064, last ? (ts - last) / 1000 : 1 / 60);
      last = ts;
      const n = Math.ceil(dt * 240);
      for (let i = 0; i < n; i++) {
        spring(ax, dt / n);
        spring(ay, dt / n);
      }
      lit += (litT - lit) * (1 - Math.exp(-dt / (litT > lit ? 0.18 : 0.26)));
      const home = litT ? 0.1 : 0.2;
      lx += (lxT - lx) * (1 - Math.exp(-dt / home));
      ly += (lyT - ly) * (1 - Math.exp(-dt / home));
      card.style.transform = `rotateY(${(10 * ax.p).toFixed(2)}deg) rotateX(${(-10 * ay.p).toFixed(2)}deg)`;
      card.style.setProperty("--lx", `${lx.toFixed(1)}%`);
      card.style.setProperty("--ly", `${ly.toFixed(1)}%`);
      card.style.setProperty("--lit", lit.toFixed(3));
      const moving = Math.abs(ax.p - ax.t) + Math.abs(ax.v) + Math.abs(ay.p - ay.t) + Math.abs(ay.v) + Math.abs(lit - litT) + Math.abs(lx - lxT) / 50 > 0.002;
      if (moving) raf = requestAnimationFrame(step);
      else {
        raf = 0;
        last = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const hw = r.width / 2, hh = r.height / 2;
      const dx = e.clientX - (r.left + hw), dy = e.clientY - (r.top + hh);
      const near = Math.abs(dx) <= hw + REACH && Math.abs(dy) <= hh + REACH;
      const on = Math.abs(dx) <= hw && Math.abs(dy) <= hh;
      ax.t = near ? clamp(dx / hw, CAP) : 0;
      ay.t = near ? clamp(dy / hh, CAP) : 0;
      litT = on ? 1 : 0;
      lxT = on ? 50 + clamp(dx / hw, 1) * 50 : 50;
      lyT = on ? 50 + clamp(dy / hh, 1) * 50 : 30;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      card.style.transform = "";
    };
  }, [tilt]);

  return (
    <div className="guest-card-scene">
      <div ref={ref} className="guest-card" role="group" aria-label="Your guest card">
        <div className="guest-card-face">
          <span className="gc-corner tl" />
          <span className="gc-corner tr" />
          <span className="gc-corner bl" />
          <span className="gc-corner br" />
          <div className="gc-top">
            <div>
              <p className="gc-label">Front desk · Ashmik Ragesh</p>
              <p className="gc-title">Guest card</p>
            </div>
            {guestNo !== null && (
              <div className="text-right">
                <p className="gc-label">No.</p>
                <p className="gc-number">{String(guestNo).padStart(4, "0")}</p>
              </div>
            )}
          </div>
          <dl className="gc-fields">
            {from && (
              <div>
                <dt>From</dt>
                <dd>{from}</dd>
              </div>
            )}
            <div>
              <dt>Arrived</dt>
              <dd>{arrived}</dd>
            </div>
            <div>
              <dt>Stay</dt>
              <dd>{stay}</dd>
            </div>
            <div>
              <dt>Here as</dt>
              <dd>{progress.hereAs ?? "Not answered yet"}</dd>
            </div>
          </dl>
          <div className="gc-stamps">
            <span className="gc-label">Stamps</span>
            {/* Inked where found, a little crooked and overlapping like real impressions */}
            <span className="flex items-center">
              {STAMPS.map((s, i) => {
                const at = progress.stamps[s.key];
                return at ? (
                  <Stamp key={s.key} stamp={s.key} date={stampDate(new Date(at))} rotate={[-8, 6, -4, 9, -6][i]} className="-mr-[4px] h-[36px] w-[36px]" />
                ) : (
                  <span key={s.key} title="Not found yet" className="mx-[4px] h-[24px] w-[24px] rounded-full border-[1.5px] border-dashed border-[#c9b6a0]" />
                );
              })}
            </span>
            <span className="gc-of">{found} of {STAMPS.length}</span>
          </div>
          <div className="gc-foot">
            <p className="gc-thanks">{returning ? "Welcome back." : "Thank you for your time."}</p>
            <svg className="gc-emboss" viewBox="36 120 128 112" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M48 214 Q48 140 100 140 Q152 140 152 214 Z M76 176 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M106 176 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M94 124 h12 v14 h-12 Z M38 212 h124 v14 h-124 Z"
                fill="#f6efe2"
              />
            </svg>
          </div>
        </div>
        <div className="gc-sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
