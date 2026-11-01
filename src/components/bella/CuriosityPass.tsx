"use client";

// ── The Curiosity Pass ────────────────────────────────────────────────────────
// The visitor's pass: a blackcurrant card in a gold-foil frame with scalloped corners
// (lib/bella/passArt). The five stamps run small along the top (blank impressions for
// ones not found yet), "Curiosity Pass" is embossed tone-on-tone, and the visitor's own
// numbers lead: guest number, the day they arrived and how long they've stayed, large,
// with where they're from underneath when known. Everything is sized in container units, so the pass scales
// as one piece.
//
// `revealed` fades the numbers in (the envelope scene holds it back until the pass is out);
// `tilt` lets it lean toward the pointer on an underdamped spring with a light that
// follows across the foil (imdaryl.com's numbers: k 237.6, ζ 7.5, 10° per unit, at most
// 1.8 units, 120px of reach). Styles: .pass in globals.css.

import { useEffect, useId, useRef } from "react";
import Stamp from "@/components/bella/Stamp";
import { STAMPS } from "@/lib/bella/stampArt";
import { formatStay, frameSvg, guestNumber, type PassData } from "@/lib/bella/passArt";


const K = 237.6;
const ZETA = 7.5;
const CAP = 1.8;
const REACH = 120;

export default function CuriosityPass({
  data,
  revealed = true,
  tilt = true,
}: {
  data: PassData;
  revealed?: boolean;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frameId = `pf${useId().replace(/[^a-z0-9]/gi, "")}`;

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
      if (!raf) raf = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      card.style.transform = "";
    };
  }, [tilt]);

  const details = [
    { label: "Guest no.", value: guestNumber(data.n) },
    { label: "Arrived", value: data.a },
    { label: "Stayed", value: formatStay(data.s) },
  ];

  return (
    <div className="pass-scene">
      <div ref={ref} className={`pass ${revealed ? "is-revealed" : ""}`} role="group" aria-label="Your Curiosity Pass">
        <span className="pass-frame" aria-hidden="true" dangerouslySetInnerHTML={{ __html: frameSvg(frameId) }} />
        <div className="pass-face">
          {/* The stamps along the top: found ones in colour, the rest blank impressions */}
          <div className="pass-stamps" aria-label={`${data.k.length} of ${STAMPS.length} stamps found`}>
            {STAMPS.map((s) => (
              <span key={s.key} title={data.k.includes(s.key) ? `${s.name}: ${s.earned}` : "Not found yet"}>
                <Stamp stamp={s.key} ink={data.k.includes(s.key) ? undefined : "none"} className="pass-stamp" />
              </span>
            ))}
          </div>
          <p className="pass-title">Curiosity Pass</p>
          <dl className="pass-details">
            {details.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
          {data.f && <p className="pass-from">From {data.f}</p>}
        </div>
        <div className="pass-sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
