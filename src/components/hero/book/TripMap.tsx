"use client";

// ── The route map ─────────────────────────────────────────────────────────────
// Kerala drawn by hand from a couple of dozen coastline and border points: the land
// dithered in pale lilac, the sea hatched, the route dashed from stop to stop with a
// numbered pin at each. Click a pin (or open its entry in the list) and the map zooms in
// on it with a label; open nothing and it eases back out to the whole state.

import { useEffect, useRef } from "react";
import { TRIP } from "./trip";
import { useReducedMotion } from "../FocusOverlay";

// [lon, lat] round Kerala, clockwise from the northern tip
const OUTLINE: [number, number][] = [
  [74.86, 12.79], [75.2, 12.62], [75.42, 12.42], [75.62, 12.24], [75.9, 11.96], [76.18, 11.78], [76.42, 11.6],
  [76.6, 11.52], [76.86, 11.36], [76.72, 11.14], [76.78, 10.86], [76.9, 10.74], [76.84, 10.56], [77.02, 10.4],
  [77.24, 10.24], [77.26, 10.06], [77.34, 9.88], [77.2, 9.66], [77.38, 9.46], [77.3, 9.16], [77.2, 8.86],
  [77.16, 8.56], [77.06, 8.28], [76.96, 8.38], [76.86, 8.56], [76.6, 8.9], [76.48, 9.2], [76.36, 9.5],
  [76.28, 9.8], [76.22, 10.06], [76.12, 10.36], [76, 10.64], [75.88, 10.96], [75.76, 11.28], [75.6, 11.6],
  [75.4, 11.9], [75.2, 12.2], [75.02, 12.5],
];
const X = (lon: number) => (lon - 74.6) * 100;
const Y = (lat: number) => (12.95 - lat) * 100;
const LAND = `M${OUTLINE.map(([a, b]) => `${X(a).toFixed(1)} ${Y(b).toFixed(1)}`).join("L")}Z`;

// Same shape as the page (320 × 432), so nothing gets cropped
const FULL = { x: -36, y: 4, w: 352, h: 476 };
const zoomOn = (i: number) => {
  const s = TRIP.stops[i];
  const w = 112, h = 152;
  return { x: X(s.lon) - w / 2, y: Y(s.lat) - h / 2, w, h };
};

type Props = {
  active: number | null;
  onPick?: (i: number) => void;
  /** A map that stays zoomed on one stop and doesn't take clicks */
  fixed?: number;
  id: string;
};

export default function TripMap({ active, onPick, fixed, id }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const initial = fixed !== undefined ? zoomOn(fixed) : FULL;
  const view = useRef({ ...initial });
  const reduced = useReducedMotion();
  const focus = fixed ?? active;

  // Ease the viewBox to the stop (or out to the whole state)
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const to = focus === null ? FULL : zoomOn(focus);
    const from = { ...view.current };
    const set = (v: typeof FULL) => {
      view.current = v;
      el.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
    };
    if (reduced || fixed !== undefined) return set(to);
    const start = performance.now();
    const DUR = 700;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const e = 1 - Math.pow(1 - t, 4);
      set({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e });
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [focus, reduced, fixed]);

  // Pins and labels keep their size on screen as the map zooms
  const k = focus === null ? 1 : 112 / FULL.w;
  const pts = TRIP.stops.map((s) => ({ x: X(s.lon), y: Y(s.lat) }));
  const route = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join("");

  return (
    <svg ref={svg} viewBox={`${initial.x} ${initial.y} ${initial.w} ${initial.h}`} className="block h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of Kerala: the route from Kochi to Munnar to Alleppey">
      <defs>
        <pattern id={`${id}-sea`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#F2B6EC" strokeWidth="1" />
        </pattern>
        <pattern id={`${id}-land`} width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="#FFFFFF" />
          <rect width="1" height="1" fill="#F9E4FF" />
          <rect x="1" y="1" width="1" height="1" fill="#F9E4FF" />
        </pattern>
      </defs>
      <rect x="-200" y="-200" width="700" height="900" fill={`url(#${id}-sea)`} />
      <path d={LAND} fill={`url(#${id}-land)`} stroke="#32073e" strokeWidth={1.2 * k} strokeLinejoin="round" />

      <g fontFamily="var(--font-geist), sans-serif" fill="#9D136A" style={{ fontSize: 9 * k, letterSpacing: 1.5 * k }}>
        <text x={X(74.9)} y={Y(10.2)} fontStyle="italic" style={{ fontSize: 10 * k }}>Arabian Sea</text>
        <text x={X(76.2)} y={Y(12.6)}>KARNATAKA</text>
        <text x={310} y={Y(10.9)} textAnchor="end">TAMIL NADU</text>
      </g>
      <path d={route} fill="none" stroke="#9D136A" strokeWidth={1.6 * k} strokeDasharray={`${4 * k} ${3 * k}`} strokeLinecap="round" />

      {pts.map((p, i) => {
        const on = focus === i;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            {onPick ? (
              <a
                href="#"
                role="button"
                aria-label={`${i + 1}. ${TRIP.stops[i].name}, ${TRIP.stops[i].days}`}
                aria-pressed={on}
                onClick={(e) => {
                  e.preventDefault();
                  onPick(on ? -1 : i);
                }}
                style={{ cursor: "pointer", outline: "none" }}
              >
                <circle r={18 * k} fill="transparent" />
                <Pin n={i + 1} k={k} on={on} />
              </a>
            ) : (
              <Pin n={i + 1} k={k} on={on} />
            )}
            {on && (
              <g transform={`translate(${16 * k} ${-11 * k})`} style={{ pointerEvents: "none" }}>
                <rect width={TRIP.stops[i].name.length * 8 * k + 16 * k} height={22 * k} rx={4 * k} fill="#9D136A" />
                <text x={8 * k} y={15.4 * k} fill="#fff" fontFamily="var(--font-geist), sans-serif" style={{ fontSize: 13 * k }}>
                  {TRIP.stops[i].name}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Pin({ n, k, on }: { n: number; k: number; on: boolean }) {
  return (
    <>
      <circle r={(on ? 12 : 10) * k} fill={on ? "#32073e" : "#9D136A"} stroke="#fff" strokeWidth={1.5 * k} />
      <text y={4.4 * k} textAnchor="middle" fill="#fff" fontFamily="var(--font-geist), sans-serif" fontWeight="600" style={{ fontSize: 12 * k }}>
        {n}
      </text>
    </>
  );
}
