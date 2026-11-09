"use client";

// ── Play: the endless grid ────────────────────────────────────────────────────
// Every piece (content/play) sits in a six-column grid that repeats in every direction,
// so there's no edge to reach. Drag it (or scroll, or use the arrow keys) and it glides
// on after you let go. While it moves, the whole sheet leans a little into the direction
// of travel and the tiles draw in slightly, then settle when it stops.
//
//   Intro        tiles rise in from the middle of the screen outwards.
//   Hover        a tile lifts and its title slides up; a small "View" label follows the
//                pointer ("Drag" over the gaps). Mouse and trackpad only.
//   Open         a tile grows from where it sits into the viewer (PlayViewer), and
//                shrinks back into place when closed.
//
// Reduced motion: no lean and no intro.
// Styles: src/app/play/play.css.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { playItems, type PlayItem } from "@/content/play";
import PlayViewer from "./PlayViewer";
import PlayMedia from "./PlayMedia";

const COLS = 6;
const N = playItems.length;
const ROWS = Math.ceil(N / COLS);

const mod = (n: number, m: number) => ((n % m) + m) % m;

// Tile size and gap for the window width (all multiples of 4)
function sizes(w: number) {
  if (w < 640) return { tile: 168, gap: 16 };
  if (w < 1024) return { tile: 220, gap: 28 };
  return { tile: 264, gap: 40 };
}

// A fixed shuffle, so the page looks the same on every visit
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
const MIX: number[] = (() => {
  const rand = seeded(11);
  const a = playItems.map((_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
})();

// The piece in a grid cell. Each repeat of the grid further down is shifted three columns,
// so the same tiles never stack straight above each other.
function slot(c: number, r: number) {
  const block = Math.floor(r / ROWS);
  return mod(r, ROWS) * COLS + mod(c + block * 3, COLS);
}

type Range = { c0: number; c1: number; r0: number; r1: number };
type Gesture = { id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean; samples: { x: number; y: number; t: number }[] };
export type Opened = { at: number; cell: string | null; from: DOMRect | null };

export default function PlayGrid() {
  const stage = useRef<HTMLDivElement>(null);
  const lean = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  const [vp, setVp] = useState<{ w: number; h: number } | null>(null);
  const [range, setRange] = useState<Range>({ c0: 0, c1: -1, r0: 0, r1: -1 });
  const [intro, setIntro] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [opened, setOpened] = useState<Opened | null>(null);
  const [labelText, setLabelText] = useState<"Drag" | "View" | null>(null);

  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const target = useRef<{ x: number; y: number } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const justDragged = useRef(false);
  const frame = useRef(0);
  const reduce = useRef(false);
  const fine = useRef(false);
  const labelPos = useRef({ x: -100, y: -100, tx: -100, ty: -100, frame: 0 });

  const order = MIX;
  const geo = vp ? sizes(vp.w) : null;
  const cell = geo ? geo.tile + geo.gap : 0;

  // ── Placing the sheet ──
  const apply = useCallback(() => {
    const el = world.current;
    if (!el || !vp || !cell) return;
    const { x, y } = pos.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const c0 = Math.floor(-x / cell) - 1;
    const c1 = Math.floor((-x + vp.w) / cell) + 1;
    const r0 = Math.floor(-y / cell) - 1;
    const r1 = Math.floor((-y + vp.h) / cell) + 1;
    setRange((r) => (r.c0 === c0 && r.c1 === c1 && r.r0 === r0 && r.r1 === r1 ? r : { c0, c1, r0, r1 }));
    // The lean: a few degrees towards where it's heading, and the tiles draw in with speed
    const l = lean.current;
    if (l && !reduce.current) {
      const v = vel.current;
      const clamp = (n: number) => Math.max(-5, Math.min(5, n));
      const speed = Math.min(1, Math.hypot(v.x, v.y) / 48);
      l.style.setProperty("--ry", `${clamp(v.x * 0.28).toFixed(2)}deg`);
      l.style.setProperty("--rx", `${clamp(-v.y * 0.28).toFixed(2)}deg`);
      l.style.setProperty("--squash", (1 - speed * 0.07).toFixed(3));
    }
  }, [vp, cell]);
  const applyRef = useRef(apply);
  applyRef.current = apply;

  // ── The motion loop: dragging, gliding after a release, or easing to a target ──
  const loop = useRef<() => void>(() => {});
  loop.current = () => {
    const p = pos.current;
    const v = vel.current;
    const g = gesture.current;
    if (g) {
      // Speed from the last 90ms of the drag, so holding still lets the lean settle
      const now = performance.now();
      const recent = g.samples.filter((s) => now - s.t < 90);
      if (recent.length > 1) {
        const a = recent[0];
        const b = recent[recent.length - 1];
        const dt = Math.max(1, b.t - a.t);
        v.x = ((b.x - a.x) / dt) * 16;
        v.y = ((b.y - a.y) / dt) * 16;
      } else {
        v.x *= 0.8;
        v.y *= 0.8;
      }
    } else if (target.current) {
      const t = target.current;
      const dx = (t.x - p.x) * 0.14;
      const dy = (t.y - p.y) * 0.14;
      p.x += dx;
      p.y += dy;
      v.x = dx;
      v.y = dy;
      if (Math.abs(t.x - p.x) < 0.5 && Math.abs(t.y - p.y) < 0.5) {
        p.x = t.x;
        p.y = t.y;
        target.current = null;
      }
    } else {
      p.x += v.x;
      p.y += v.y;
      v.x *= 0.94;
      v.y *= 0.94;
    }
    const moving = g !== null || target.current !== null || Math.abs(v.x) > 0.05 || Math.abs(v.y) > 0.05;
    if (!moving) {
      v.x = 0;
      v.y = 0;
    }
    applyRef.current();
    frame.current = moving ? requestAnimationFrame(() => loop.current()) : 0;
  };
  const kick = () => {
    if (!frame.current) frame.current = requestAnimationFrame(() => loop.current());
  };

  // ── Size, and start with the first tile in the middle ──
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fine.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const measure = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    measure();
    const s = sizes(window.innerWidth);
    pos.current = { x: Math.round(window.innerWidth / 2 - s.tile / 2), y: Math.round(window.innerHeight / 2 - s.tile / 2 + 24) };
    window.addEventListener("resize", measure);
    const t = window.setTimeout(() => setIntro(false), reduce.current ? 0 : 1600);
    // The page itself never scrolls: the grid takes the wheel instead
    const html = document.documentElement;
    const before = { overflow: html.style.overflow, overscroll: html.style.overscrollBehavior };
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
      cancelAnimationFrame(frame.current);
      html.style.overflow = before.overflow;
      html.style.overscrollBehavior = before.overscroll;
    };
  }, []);

  useLayoutEffect(() => {
    apply();
  }, [apply]);

  // ── Wheel and trackpad ──
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch zoom stays the browser's
      e.preventDefault();
      if (opened) return;
      const k = e.deltaMode === 1 ? 32 : 1;
      target.current = null;
      pos.current.x -= e.deltaX * k;
      pos.current.y -= e.deltaY * k;
      vel.current = { x: -e.deltaX * k * 0.25, y: -e.deltaY * k * 0.25 };
      kick();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Arrow keys: one tile at a time ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (opened || !cell || e.metaKey || e.ctrlKey || e.altKey) return;
      const step: Record<string, [number, number]> = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
      const d = step[e.key];
      if (!d) return;
      e.preventDefault();
      const from = target.current ?? pos.current;
      target.current = { x: from.x + d[0] * cell, y: from.y + d[1] * cell };
      kick();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, cell]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dragging ──
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || opened) return;
    target.current = null;
    vel.current = { x: 0, y: 0 };
    gesture.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: pos.current.x,
      oy: pos.current.y,
      moved: false,
      samples: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
    };
    kick();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    moveLabel(e);
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    if (!g.moved && Math.hypot(dx, dy) > 4) {
      g.moved = true;
      // Captured only once it's a drag, so a plain click still reaches the tile
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      setDragging(true);
    }
    if (!g.moved) return;
    pos.current = { x: g.ox + dx, y: g.oy + dy };
    g.samples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (g.samples.length > 8) g.samples.shift();
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    setDragging(false);
    if (g.moved) {
      justDragged.current = true;
      window.setTimeout(() => (justDragged.current = false), 0);
    }
    kick();
  };

  // ── The label that follows the pointer (mouse and trackpad only) ──
  const moveLabel = (e: React.PointerEvent) => {
    if (!fine.current || e.pointerType !== "mouse") return;
    const overTile = (e.target as Element).closest?.(".play-tile");
    const overUi = (e.target as Element).closest?.("[data-play-ui]");
    setLabelText(overUi ? null : overTile ? "View" : "Drag");
    const l = labelPos.current;
    l.tx = e.clientX;
    l.ty = e.clientY;
    if (!l.frame) {
      if (l.x < -50) {
        l.x = l.tx;
        l.y = l.ty;
      }
      const follow = () => {
        l.x += (l.tx - l.x) * 0.22;
        l.y += (l.ty - l.y) * 0.22;
        if (label.current) label.current.style.transform = `translate3d(${l.x + 16}px, ${l.y + 16}px, 0)`;
        l.frame = Math.abs(l.tx - l.x) + Math.abs(l.ty - l.y) > 0.3 ? requestAnimationFrame(follow) : 0;
      };
      l.frame = requestAnimationFrame(follow);
    }
  };

  // ── Opening a tile ──
  const open = (c: number, r: number, el: HTMLElement) => {
    if (justDragged.current) return;
    setLabelText(null);
    setOpened({ at: mod(slot(c, r), N), cell: `${c},${r}`, from: el.getBoundingClientRect() });
  };

  // ── The visible tiles ──
  const tiles: React.ReactNode[] = [];
  if (geo) {
    for (let r = range.r0; r <= range.r1; r++) {
      for (let c = range.c0; c <= range.c1; c++) {
        const s = mod(slot(c, r), N);
        const item = playItems[order[s]];
        const delay = intro ? Math.min(900, Math.hypot(c, r) * 110) : 0;
        tiles.push(
          <button
            key={`${c},${r}`}
            type="button"
            data-cell={`${c},${r}`}
            data-sound="whisper"
            className="play-tile"
            style={{ left: c * cell, top: r * cell, width: geo.tile, height: geo.tile, "--d": `${Math.round(delay)}ms` } as React.CSSProperties}
            aria-label={`${item.title}, ${item.kind}. Open`}
            onClick={(e) => open(c, r, e.currentTarget)}
          >
            <span className="play-lift">
              <span className="play-flip">
                <Face item={item} />
              </span>
            </span>
          </button>,
        );
      }
    }
  }

  return (
    <div
      ref={stage}
      className={`play-stage ${intro ? "is-intro" : ""}`}
      data-dragging={dragging || undefined}
      aria-label="All pieces. Drag, scroll or use the arrow keys to explore."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => setLabelText(null)}
    >
      <div ref={lean} className="play-lean">
        <div ref={world} className="play-world">
          {tiles}
        </div>
      </div>

      {/* The label beside the pointer */}
      <div ref={label} className={`play-cursor ${labelText && !opened ? "is-on" : ""} ${dragging ? "is-dragging" : ""}`} aria-hidden="true">
        <span>{labelText ?? "Drag"}</span>
      </div>

      {opened && (
        <PlayViewer
          order={order}
          opened={opened}
          onStep={(at) => setOpened({ at, cell: null, from: null })}
          onClosed={() => setOpened(null)}
        />
      )}
    </div>
  );
}

/** A tile's face: the piece, or its grey placeholder, with the title that slides up on hover. */
function Face({ item }: { item: PlayItem }) {
  return (
    <span className="play-face" style={{ background: item.tone }}>
      <PlayMedia item={item} />
      <span className="play-caption">
        {item.title}
      </span>
    </span>
  );
}
