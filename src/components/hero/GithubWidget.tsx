"use client";

// ── GitHub, Aug–Nov ───────────────────────────────────────────────────────────
// A small card of contribution squares sitting by the portrait. At rest a few squares
// glow and fade on their own. On hover the squares rearrange into "ship" and a tooltip
// offers the last four months; click opens a popover with two calendars, Personal and
// Work, one block of weeks per month, every day a square you can hover for its count.
// Colours are the brand ramp (pale lilac → blackcurrant), not GitHub green.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACCOUNTS, CONTRIB_ASOF, CONTRIB_FROM, CONTRIB_TO } from "./githubData";
import { useReducedMotion } from "./FocusOverlay";

// Empty, then four steps up the brand ramp
const RAMP = ["#f3f3f2", "#F9E4FF", "#F2B6EC", "#9D136A", "#32073e"];

const level = (n: number) => (n <= 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4);

// ── The chip ────────────────────────────────────────────────────────────────────
const COLS = 18;
const ROWS = 7;
const CELL = 6;
const GAP = 2;

// "ship" in a 3×5 pixel face, placed in the middle of the grid
const GLYPHS: Record<string, string[]> = {
  s: ["111", "100", "111", "001", "111"],
  h: ["101", "101", "111", "101", "101"],
  i: ["1", "0", "1", "1", "1"],
  p: ["111", "101", "111", "100", "100"],
};
function wordCells(word: string) {
  const on = new Set<number>();
  const widths = [...word].map((c) => GLYPHS[c][0].length);
  const total = widths.reduce((a, b) => a + b, 0) + word.length - 1;
  let x = Math.floor((COLS - total) / 2);
  [...word].forEach((c, k) => {
    GLYPHS[c].forEach((row, y) => [...row].forEach((b, dx) => b === "1" && on.add((y + 1) * COLS + x + dx)));
    x += widths[k] + 1;
  });
  return on;
}
const SHIP = wordCells("ship");

// A fixed scatter for the resting chip, so server and client agree
function restLevels() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: COLS * ROWS }, (): number => {
    const r = rnd();
    return r < 0.5 ? 0 : r < 0.72 ? 1 : r < 0.88 ? 2 : r < 0.96 ? 3 : 4;
  });
}

function Chip({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion();
  const base = useMemo(restLevels, []);
  const [levels, setLevels] = useState(base);

  // At rest a few squares change at a time, like days filling in
  useEffect(() => {
    if (reduced || hovered) return;
    const t = window.setInterval(() => {
      setLevels((prev) => {
        const next = prev.slice();
        for (let k = 0; k < 6; k++) {
          const i = Math.floor(Math.random() * next.length);
          next[i] = Math.random() < 0.45 ? 0 : 1 + Math.floor(Math.random() * 4);
        }
        return next;
      });
    }, 420);
    return () => window.clearInterval(t);
  }, [reduced, hovered]);

  return (
    <svg
      width={COLS * (CELL + GAP) - GAP}
      height={ROWS * (CELL + GAP) - GAP}
      aria-hidden="true"
      className="block"
    >
      {levels.map((l, i) => {
        const x = (i % COLS) * (CELL + GAP);
        const y = Math.floor(i / COLS) * (CELL + GAP);
        const fill = hovered ? (SHIP.has(i) ? RAMP[4] : RAMP[0]) : RAMP[l];
        // Ripple in from the left as the word forms
        const delay = hovered ? (i % COLS) * 14 : 0;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            rx={1.5}
            fill={fill}
            style={{ transition: reduced ? "none" : `fill 220ms ease ${delay}ms` }}
          />
        );
      })}
    </svg>
  );
}

// ── The popover ─────────────────────────────────────────────────────────────────
type Day = { date: string; n: number; future: boolean };

const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const iso = (d: Date) => d.toISOString().slice(0, 10);
const nice = (s: string) => parse(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** One month as columns of weeks, Sunday on top, like GitHub */
function monthWeeks(year: number, month: number, days: Record<string, number>) {
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const cols: (Day | null)[][] = [];
  let col: (Day | null)[] = Array(first.getUTCDay()).fill(null);
  for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const k = iso(d);
    col.push({ date: k, n: days[k] ?? 0, future: k > CONTRIB_ASOF });
    if (col.length === 7) {
      cols.push(col);
      col = [];
    }
  }
  if (col.length) cols.push([...col, ...Array(7 - col.length).fill(null)]);
  return cols;
}

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS = (() => {
  const out: { y: number; m: number; label: string }[] = [];
  const from = parse(CONTRIB_FROM);
  const to = parse(CONTRIB_TO);
  for (let d = new Date(from); d <= to; d.setUTCMonth(d.getUTCMonth() + 1)) {
    out.push({ y: d.getUTCFullYear(), m: d.getUTCMonth(), label: SHORT[d.getUTCMonth()] });
  }
  return out;
})();

const SQ = 12;
const SQ_GAP = 4;

function Calendar({ days, onTip }: { days: Record<string, number>; onTip: (t: { text: string; x: number; y: number } | null) => void }) {
  return (
    <div className="flex gap-4">
      {MONTHS.map(({ y, m, label }) => {
        const weeks = monthWeeks(y, m, days);
        const total = weeks.flat().reduce((a, d) => a + (d?.n ?? 0), 0);
        return (
          <div key={label} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2 font-geist text-caption text-muted">
              <span>{label}</span>
              <span className="tabular-nums">{total}</span>
            </div>
            <div className="flex" style={{ gap: SQ_GAP }}>
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: SQ_GAP }}>
                  {w.map((d, di) =>
                    d ? (
                      <span
                        key={di}
                        role="img"
                        aria-label={d.future ? `${nice(d.date)}, still to come` : `${d.n || "No"} contribution${d.n === 1 ? "" : "s"} on ${nice(d.date)}`}
                        className="block rounded-xs transition-transform duration-150 hover:scale-125"
                        style={{
                          width: SQ,
                          height: SQ,
                          background: d.future ? "transparent" : RAMP[level(d.n)],
                          boxShadow: d.future ? "inset 0 0 0 1px #edf0f3" : undefined,
                        }}
                        onPointerEnter={(e) => {
                          if (d.future) return onTip(null);
                          const r = e.currentTarget.getBoundingClientRect();
                          onTip({ text: `${d.n || "No"} contribution${d.n === 1 ? "" : "s"} on ${nice(d.date)}`, x: r.left + r.width / 2, y: r.top });
                        }}
                        onPointerLeave={() => onTip(null)}
                      />
                    ) : (
                      <span key={di} className="block" style={{ width: SQ, height: SQ }} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Popover({ anchor, onClose }: { anchor: HTMLElement; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const reduced = useReducedMotion();
  const totals = ACCOUNTS.map((a) => Object.values(a.days).reduce((x, y) => x + y, 0));

  // Under the chip, kept on screen
  useLayoutEffect(() => {
    const place = () => {
      const a = anchor.getBoundingClientRect();
      const w = box.current?.offsetWidth ?? 0;
      const h = box.current?.offsetHeight ?? 0;
      const left = Math.max(16, Math.min(window.innerWidth - w - 16, a.left + a.width / 2 - w / 2));
      const below = a.bottom + 12;
      const top = below + h > window.innerHeight - 16 ? Math.max(16, a.top - h - 12) : below;
      setPos({ left, top });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
    };
  }, [anchor]);

  useEffect(() => {
    if (!pos || reduced) return;
    box.current?.animate(
      [
        { opacity: 0, transform: "translateY(-6px) scale(0.98)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [pos !== null, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape or a click anywhere else closes it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !anchor.contains(t)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [anchor, onClose]);

  return createPortal(
    <>
      <div
        ref={box}
        role="dialog"
        aria-label="GitHub contributions, August to November 2026"
        className="fixed z-[150] max-w-[calc(100vw-32px)] overflow-x-auto rounded-xl border border-line-soft bg-background p-6 shadow-[0_2px_4px_rgba(30,5,37,0.04),0_12px_32px_rgba(30,5,37,0.10)]"
        style={{ left: pos?.left ?? -9999, top: pos?.top ?? 0 }}
      >
        <p className="font-geist text-body text-secondary">
          <span className="font-medium text-heading tabular-nums">{totals[0] + totals[1]}</span> contributions, Aug–Nov 2026
        </p>
        <div className="mt-6 flex flex-col gap-6">
          {ACCOUNTS.map((a, i) => (
            <div key={a.key} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4 font-geist text-body">
                <span className="flex items-baseline gap-2">
                  <span className="font-medium text-heading">{a.label}</span>
                  <a
                    href={`https://github.com/${a.handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted underline-offset-2 hover:text-grape hover:underline"
                  >
                    @{a.handle} ↗
                  </a>
                </span>
                <span className="tabular-nums text-secondary">{totals[i]}</span>
              </div>
              <Calendar days={a.days} onTip={setTip} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-end gap-2 font-geist text-caption text-muted">
          Less
          {RAMP.map((c) => (
            <span key={c} className="block rounded-xs" style={{ width: 10, height: 10, background: c }} />
          ))}
          More
        </div>
      </div>
      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[160] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-midnight px-2 py-1 font-geist text-caption text-background"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {tip.text}
        </div>
      )}
    </>,
    document.body,
  );
}

export default function GithubWidget({ className = "" }: { className?: string }) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-label="GitHub contributions, August to November. Open the calendar"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={() => setOpen((o) => !o)}
        className="group relative block rotate-[-2deg] rounded-lg border border-line-soft bg-background p-3 shadow-[0_1px_2px_rgba(30,5,37,0.06),0_6px_16px_rgba(30,5,37,0.08)] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape"
      >
        <Chip hovered={hovered || open} />
        {/* Tooltip: what a click does */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-midnight px-2 py-1 font-geist text-caption text-background transition-all duration-200 ${
            hovered && !open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          }`}
        >
          Click to see Aug–Nov
        </span>
      </button>
      {open && btn.current && <Popover anchor={btn.current} onClose={close} />}
    </div>
  );
}
