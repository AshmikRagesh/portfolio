"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/**
 * Reference characters loose on one white card: just their pictures, no labels. Each can
 * be dragged anywhere inside the card (mouse, touch or pen), and the one you pick up comes
 * to the front. With the keyboard, focus one and move it with the arrow keys. Positions are
 * kept as a share of the free space, so the layout holds when the card resizes.
 * Pictures live in public/images/bella/references/{slug}.png; until one exists, a soft
 * stand-in with the name holds its place.
 */
type Ref = { name: string; slug: string; x: number; y: number };

const STEP = 0.04; // one arrow press, as a share of the free space

export default function ReferencePlayground({ items }: { items: Ref[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() => items.map(({ x, y }) => ({ x, y })));
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const drag = useRef<{ i: number; px: number; py: number; x: number; y: number } | null>(null);

  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const lift = (i: number) => setOrder((o) => [...o.filter((j) => j !== i), i]);
  const move = (i: number, x: number, y: number) =>
    setPos((p) => p.map((q, j) => (j === i ? { x: clamp(x), y: clamp(y) } : q)));

  const down = (i: number) => (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { i, px: e.clientX, py: e.clientY, ...pos[i] };
    lift(i);
  };
  const moveTo = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const box = stage.current;
    if (!d || !box) return;
    const item = e.currentTarget.getBoundingClientRect();
    const freeX = Math.max(1, box.clientWidth - item.width);
    const freeY = Math.max(1, box.clientHeight - item.height);
    move(d.i, d.x + (e.clientX - d.px) / freeX, d.y + (e.clientY - d.py) / freeY);
  };
  const up = () => {
    drag.current = null;
  };
  const key = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const dx = { ArrowLeft: -STEP, ArrowRight: STEP }[e.key] ?? 0;
    const dy = { ArrowUp: -STEP, ArrowDown: STEP }[e.key] ?? 0;
    if (!dx && !dy) return;
    e.preventDefault();
    lift(i);
    move(i, pos[i].x + dx, pos[i].y + dy);
  };

  return (
    <div className="rounded-lg border border-line-soft bg-white p-[12px]">
      <div
        ref={stage}
        className="relative h-[320px] touch-none [--ref-size:112px] md:[--ref-size:144px] overflow-hidden rounded-md bg-grape-light/30 md:h-[360px]"
      >
        {items.map(({ name, slug }, i) => (
          <button
            key={slug}
            type="button"
            aria-label={`${name}. Drag, or use the arrow keys, to move it.`}
            onPointerDown={down(i)}
            onPointerMove={moveTo}
            onPointerUp={up}
            onPointerCancel={up}
            onKeyDown={key(i)}
            className="absolute flex h-[var(--ref-size)] w-[var(--ref-size)] cursor-grab items-center justify-center rounded-md outline-none transition-transform duration-200 ease-out hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-grape active:cursor-grabbing active:scale-[1.08] motion-reduce:transition-none"
            style={{
              left: `calc(${pos[i].x} * (100% - var(--ref-size)))`,
              top: `calc(${pos[i].y} * (100% - var(--ref-size)))`,
              zIndex: order.indexOf(i) + 1,
            }}
          >
            {missing[slug] ? (
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white/80 p-[16px] text-center font-body text-[14px] leading-[20px] text-muted">
                {name}
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/images/bella/references/${slug}.png`}
                alt=""
                draggable={false}
                onError={() => setMissing((m) => ({ ...m, [slug]: true }))}
                // An error before hydration never reaches onError, so check once it's mounted too
                ref={(el) => {
                  if (el?.complete && el.naturalWidth === 0) setMissing((m) => (m[slug] ? m : { ...m, [slug]: true }));
                }}
                className="pointer-events-none h-full w-full select-none object-contain"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
