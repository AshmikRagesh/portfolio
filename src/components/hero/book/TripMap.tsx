"use client";

// ── The route map ─────────────────────────────────────────────────────────────
// One place per trip, from real boundaries: the place itself dithered in pale lilac
// with a blackcurrant edge, its neighbours plain paper with a hairline, anything beyond
// (sea, other countries) hatched. The route runs dashed from stop to stop with a numbered
// pin at each. Pick a stop (here or in the list) and the map glides in on it, its label
// slides out; pick it again and it eases back out to the whole map.

import { useEffect, useRef } from "react";
import { MAPS } from "./maps";
import type { Trip } from "./trip";
import { useReducedMotion } from "../FocusOverlay";
import { PH, PW } from "./Cover";

type View = { x: number; y: number; w: number; h: number };
const FULL: View = { x: 0, y: 0, w: PW, h: PH };
const ZOOM = 0.42; // zoomed view, as a fraction of the page

export default function TripMap({ trip, active, onPick, id }: { trip: Trip; active: number | null; onPick: (i: number | null) => void; id: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef<View>({ ...FULL });
  const reduced = useReducedMotion();
  const m = MAPS[trip.key];
  const P = (lon: number, lat: number) => [(lon - m.proj.x0) * m.proj.c * m.proj.k + m.proj.ox, (m.proj.y1 - lat) * m.proj.k + m.proj.oy];
  const pts = trip.stops.map((s) => P(s.lon, s.lat));

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    let to = FULL;
    if (active !== null) {
      const [x, y] = pts[active];
      const w = PW * ZOOM, h = PH * ZOOM;
      to = { x: x - w / 2, y: y - h / 2, w, h };
    }
    const from = { ...view.current };
    // Pins, labels and lines keep their size on screen as the map zooms
    const marks = Array.from(el.querySelectorAll<SVGGElement>("[data-at]"));
    const set = (v: View) => {
      view.current = v;
      el.setAttribute("viewBox", `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`);
      const k = (v.w / PW).toFixed(4);
      marks.forEach((g) => g.setAttribute("transform", `${g.dataset.at} scale(${k})`));
    };
    if (reduced) return set(to);
    const start = performance.now();
    const DUR = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      // Quick to leave, long soft landing
      const e = 1 - Math.pow(1 - t, 4);
      set({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e });
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced, trip.key]);

  const route = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const at = (x: number, y: number) => `translate(${x.toFixed(1)} ${y.toFixed(1)})`;

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${PW} ${PH}`}
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="group"
      aria-label={`Map of ${trip.title} with the route through ${trip.stops.map((s) => s.name).join(", ")}`}
    >
      <defs>
        <pattern id={`${id}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="5" fill="#fdfcfa" />
          <line x1="0" y1="0" x2="0" y2="5" stroke="#F2B6EC" strokeWidth="0.8" />
        </pattern>
        <pattern id={`${id}-dither`} width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="#FDF6FF" />
          <rect width="1" height="1" fill="#F2B6EC" opacity="0.7" />
          <rect x="1" y="1" width="1" height="1" fill="#F9E4FF" />
        </pattern>
      </defs>
      <rect x={-PW} y={-PH} width={PW * 3} height={PH * 3} fill={`url(#${id}-hatch)`} />
      <path d={m.neighbours} fill="#fdfcfa" stroke="#c8ccd4" strokeWidth="0.5" strokeLinejoin="round" style={{ vectorEffect: "non-scaling-stroke" }} />
      <path d={m.land} fill={`url(#${id}-dither)`} stroke="#32073e" strokeWidth="1.1" strokeLinejoin="round" style={{ vectorEffect: "non-scaling-stroke" }} />

      {trip.labels.map(([text, lon, lat, water]) => {
        const [x, y] = P(lon, lat);
        return (
          <g key={text} data-at={at(x, y)} transform={at(x, y)}>
            <text textAnchor="middle" fill="#9D136A" fillOpacity="0.75" fontFamily="var(--font-geist), sans-serif" fontSize={water ? 10 : 8} fontStyle={water ? "italic" : undefined} letterSpacing={water ? 0.4 : 1.6}>
              {text}
            </text>
          </g>
        );
      })}

      <path d={route} fill="none" stroke="#9D136A" strokeWidth="1.4" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" style={{ vectorEffect: "non-scaling-stroke" }} />

      {pts.map(([x, y], i) => {
        const on = active === i;
        const s = trip.stops[i];
        return (
          <g key={s.name} data-at={at(x, y)} transform={at(x, y)}>
            <g
              role="button"
              tabIndex={0}
              aria-label={`${i + 1}. ${s.name}, ${s.days}`}
              aria-pressed={on}
              data-nodrag=""
              onClick={() => onPick(on ? null : i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(on ? null : i);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <circle r="16" fill="transparent" />
              <circle r={on ? 10 : 8.5} fill={on ? "#32073e" : "#9D136A"} stroke="#fff" strokeWidth="2" style={{ transition: "r 200ms ease, fill 200ms ease" }} />
              <text y="3.6" textAnchor="middle" fill="#fff" fontFamily="var(--font-geist), sans-serif" fontWeight="600" fontSize="10" style={{ pointerEvents: "none" }}>
                {i + 1}
              </text>
            </g>
            {/* The label slides out from behind the pin */}
            <g style={{ pointerEvents: "none", opacity: on ? 1 : 0, transform: on ? "translateX(0)" : "translateX(-6px)", transition: "opacity 250ms ease, transform 300ms cubic-bezier(0.22,1,0.36,1)" }}>
              <rect x="14" y="-11" width={s.name.length * 6.6 + 18} height="22" rx="11" fill="#32073e" />
              <text x="23" y="3.8" fill="#fff" fontFamily="var(--font-geist), sans-serif" fontSize="11" fontWeight="500">
                {s.name}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
