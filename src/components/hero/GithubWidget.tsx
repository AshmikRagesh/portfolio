"use client";

// ── GitHub, live ──────────────────────────────────────────────────────────────
// A small upright card on the desk, the same size as the book so both sides of the
// portrait carry the same weight: the GitHub mark, a tall grid of contribution squares that glow and fade on their own, and the total. On hover the
// squares rearrange into "ship" and a tooltip offers the last four months. Click and it
// does what the book and the medal do: comes to the middle of the screen and turns
// over, and on the back are two calendars, Personal and Work, one block of weeks per
// month, every day a square you can hover for its count.
// Colours are the brand ramp (pale lilac → blackcurrant), not GitHub green.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACCOUNTS, CONTRIB_ASOF } from "./githubData";
import HoverTip from "./HoverTip";
import FocusOverlay, { FlipStage, TURN_MS, useReducedMotion } from "./FocusOverlay";

// Empty, then four steps up the brand ramp
const RAMP = ["#f3f3f2", "#F9E4FF", "#F2B6EC", "#9D136A", "#32073e"];

const level = (n: number) => (n <= 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4);

// ── The chip ────────────────────────────────────────────────────────────────────
const COLS = 18;
const ROWS = 13;
const CELL = 8;
const GAP = 3;

// "ship" in a 3×5 pixel face, placed in the middle of the grid
const WORD_TOP = Math.floor((ROWS - 5) / 2);
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
    GLYPHS[c].forEach((row, y) => [...row].forEach((b, dx) => b === "1" && on.add((y + WORD_TOP) * COLS + x + dx)));
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
            rx={2}
            fill={fill}
            style={{ transition: reduced ? "none" : `fill 220ms ease ${delay}ms` }}
          />
        );
      })}
    </svg>
  );
}

// ── Live numbers ────────────────────────────────────────────────────────────────
// Fetched once per visit from /api/github (each account's public calendar, cached for
// an hour). Until it answers, the last saved numbers stand in.

type Account = { key: string; label: string; handle: string; total: number; days: Record<string, number> };
type Contrib = { asOf: string; accounts: Account[] };

let live: Contrib = { asOf: CONTRIB_ASOF, accounts: ACCOUNTS.map((a) => ({ ...a, days: { ...a.days } })) };
let loading: Promise<void> | null = null;
const subs = new Set<(c: Contrib) => void>();

function useContrib() {
  const [c, setC] = useState(live);
  useEffect(() => {
    subs.add(setC);
    loading ??= fetch("/api/github")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Contrib | null) => {
        if (d?.accounts?.length === 2) {
          live = d;
          subs.forEach((f) => f(d));
        }
      })
      .catch(() => {});
    return () => {
      subs.delete(setC);
    };
  }, []);
  return c;
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
function monthWeeks(year: number, month: number, days: Record<string, number>, asOf: string) {
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const cols: (Day | null)[][] = [];
  let col: (Day | null)[] = Array(first.getUTCDay()).fill(null);
  for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const k = iso(d);
    col.push({ date: k, n: days[k] ?? 0, future: k > asOf });
    if (col.length === 7) {
      cols.push(col);
      col = [];
    }
  }
  if (col.length) cols.push([...col, ...Array(7 - col.length).fill(null)]);
  return cols;
}

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** The last four months, this one included */
function monthsTo(asOf: string) {
  const end = parse(asOf);
  return [3, 2, 1, 0].map((back) => {
    const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - back, 1));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), label: SHORT[d.getUTCMonth()] };
  });
}
const rangeLabel = (asOf: string) => {
  const ms = monthsTo(asOf);
  return `${ms[0].label}–${ms[3].label}`;
};

const SQ = 12;
const SQ_GAP = 4;

function Calendar({ days, asOf, onTip }: { days: Record<string, number>; asOf: string; onTip: (t: { text: string; x: number; y: number } | null) => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:gap-4">
      {monthsTo(asOf).map(({ y, m, label }) => {
        const weeks = monthWeeks(y, m, days, asOf);
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


function Mark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

// ── The card (front) ──────────────────────────────────────────────────────────
export const CARD_W = 224;
// Same proportions as the book cover (320 × 432)
export const CARD_H = 302;

function Card({ hovered }: { hovered: boolean }) {
  const c = useContrib();
  const total = c.accounts.reduce((a, x) => a + x.total, 0);
  return (
    <div className="absolute inset-0 flex flex-col rounded-[12px] text-left bg-gradient-to-b from-white to-[#fbfafc] p-[14px] shadow-[0_0_0_1px_rgba(30,5,37,0.07),0_1px_1px_rgba(30,5,37,0.05),0_4px_8px_rgba(30,5,37,0.06),0_16px_32px_rgba(30,5,37,0.10)]">
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(30,5,37,0.04)]" />
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-heading">
          <Mark />
          <span className="font-geist text-[11px] font-medium uppercase tracking-[1.2px] text-secondary">Contributions</span>
        </span>
        <span className="flex items-center gap-[3px]" aria-hidden="true">
          {RAMP.map((c) => (
            <span key={c} className="block h-[6px] w-[6px] rounded-[1.5px]" style={{ background: c }} />
          ))}
        </span>
      </div>
      <div className="mt-[14px]">
        <Chip hovered={hovered} />
      </div>
      <div className="mt-auto flex flex-col gap-[6px]">
        <span className="font-heading text-stat font-normal tabular-nums text-heading">{total}</span>
        <span className="font-geist text-[11px] font-medium uppercase tracking-[1.2px] text-muted">In the last year</span>
      </div>
    </div>
  );
}

// ── The calendars (back) ──────────────────────────────────────────────────────
type Tip = { text: string; x: number; y: number } | null;

function Calendars() {
  const c = useContrib();
  const total = c.accounts.reduce((a, x) => a + x.total, 0);
  const [tip, setTip] = useState<Tip>(null);
  return (
    <div className="flex flex-col items-center">
      <div className="max-h-[calc(100dvh-152px)] sm:max-h-[calc(100dvh-112px)] w-[calc(100vw-24px)] max-w-[560px] overflow-y-auto overscroll-contain rounded-2xl bg-background p-5 sm:w-max sm:p-8 shadow-[0_0_0_1px_rgba(30,5,37,0.06),0_2px_4px_rgba(30,5,37,0.04),0_24px_56px_rgba(30,5,37,0.16)]">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
          <div>
            <p className="flex items-center gap-2 font-geist text-[11px] font-medium uppercase tracking-[1.2px] text-muted">
              <Mark size={12} /> GitHub · the last year
            </p>
            <p className="mt-3 font-heading text-h2-lg text-heading">
              <span className="tabular-nums">{total}</span> contributions
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1 font-geist text-caption text-muted">
            Less
            {RAMP.map((c) => (
              <span key={c} className="block rounded-xs" style={{ width: 10, height: 10, background: c }} />
            ))}
            More
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-8">
          {c.accounts.map((a) => (
            <div key={a.key} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4 font-geist text-body">
                <span className="flex items-baseline gap-2">
                  <span className="font-medium text-heading">{a.label}</span>
                  <a href={`https://github.com/${a.handle}`} target="_blank" rel="noreferrer" className="text-muted underline-offset-2 transition-colors hover:text-grape hover:underline">
                    @{a.handle} ↗
                  </a>
                </span>
                <span className="font-medium tabular-nums text-heading">{a.total}</span>
              </div>
              <Calendar days={a.days} asOf={c.asOf} onTip={setTip} />
            </div>
          ))}
        </div>
        <p className="mt-6 font-geist text-caption text-muted">Day by day for {rangeLabel(c.asOf)}. Work is private repositories at Travelopia. Live from GitHub, updated hourly.</p>
      </div>
      {tip &&
        createPortal(
          <div role="tooltip" className="pointer-events-none fixed z-[260] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-midnight px-2 py-1 font-geist text-caption text-background shadow-[0_4px_12px_rgba(30,5,37,0.2)]" style={{ left: tip.x, top: tip.y - 6 }}>
            {tip.text}
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── In the hero ───────────────────────────────────────────────────────────────
export default function GithubWidget({ className = "" }: { className?: string }) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const onClosed = useCallback(() => setOpen(false), []);

  useLayoutEffect(() => {
    const el = btn.current;
    if (!el) return;
    const read = () => el.style.setProperty("--card-k", String(el.offsetWidth / CARD_W));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="dialog"
        aria-label="GitHub contributions in the last year. Open the calendars"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={() => setOpen(true)}
        className={`group/tip relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${className}`}
        style={{ aspectRatio: `${CARD_W} / ${CARD_H}` }}
      >
        <span className="absolute left-0 top-0 block origin-top-left" style={{ width: CARD_W, height: CARD_H, transform: "scale(var(--card-k, 0.7))" }}>
          <Card hovered={hovered && !open} />
        </span>
        <HoverTip>A year of commits, day by day</HoverTip>
      </button>

      <FocusOverlay source={btn.current} open={open} onClosed={onClosed} label="GitHub contributions" width={CARD_W} height={CARD_H} fitWidth={CARD_W} fitHeight={CARD_H} closeMs={reduced ? 0 : TURN_MS}>
        {(phase) => <FlipStage phase={phase} front={<Card hovered={false} />} back={<Calendars />} />}
      </FocusOverlay>
    </>
  );
}
