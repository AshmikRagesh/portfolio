"use client";

import { useCallback, useRef, useState } from "react";
import { VariantSwitch } from "./VariantSwitch";

/**
 * Before and after as one picture: the after sits underneath, the before on top, cut off at
 * a handle you drag (or move with the arrow keys; it's a range input underneath). Both
 * stills must be captured at the same size and framing so the edges line up.
 *
 * `afters` can hold more than one version (two designs in a test): a switch in the top-right
 * corner picks which one the after side shows, so neither design is the default "after".
 * Labels sit in the top corners: "Before" on the left, the switch (or "After") on the right;
 * on a phone the switch moves under the picture so it doesn't cover it.
 */
type Shot = { src: string; alt: string };
type After = Shot & { id: string; label: string; short: string };

export default function BeforeAfterSlider({
  before,
  afters,
  label,
  start = 50,
}: {
  before: Shot;
  afters: After[];
  /** A short caption centred under the picture, as on Figure */
  label?: string;
  /** Where the handle starts, in % from the left */
  start?: number;
}) {
  const [pos, setPos] = useState(start);
  const [current, setCurrent] = useState(afters[0].id);
  const box = useRef<HTMLDivElement>(null);
  const after = afters.find((a) => a.id === current) ?? afters[0];

  // Dragging anywhere on the picture moves the handle there
  const moveTo = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <figure className="m-0 min-w-0">
      <div
        ref={box}
        className="relative aspect-[16/9] touch-pan-y select-none overflow-hidden rounded-sm bg-grape-light/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.03)]"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[role=radiogroup]")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e.clientX);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={after.id} src={after.src} alt={after.alt} className="cs-fade absolute inset-0 h-full w-full object-cover" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before.src}
          alt={before.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          draggable={false}
        />

        {/* The handle: a hairline with a round grip */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0" style={{ left: `${pos}%` }}>
          <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-white shadow-[0_0_0_1px_rgba(30,5,37,0.12)]" />
          <div className="absolute left-1/2 top-1/2 flex size-[40px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_4px_16px_rgba(30,5,37,0.24)] ring-1 ring-primary/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </div>
        </div>

        {/* Keyboard and screen readers: the same position as a range */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Before and after: move to compare"
          className="peer absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
        <div className="pointer-events-none absolute inset-0 rounded-sm ring-2 ring-inset ring-grape opacity-0 peer-focus-visible:opacity-100" />

        <span className="pointer-events-none absolute left-[8px] top-[8px] rounded-full bg-white/90 px-[8px] py-[4px] font-geist text-caption-md font-medium uppercase tracking-[1px] text-primary shadow-[0_4px_16px_rgba(30,5,37,0.12)] backdrop-blur-md md:left-[16px] md:top-[16px] md:px-[12px] md:py-[6px]">
          Before
        </span>
        {/* On a phone the switch would cover the picture, so it sits under it there */}
        <div className={`absolute right-[12px] top-[12px] z-10 md:right-[16px] md:top-[16px] ${afters.length > 1 ? "hidden md:block" : ""}`}>
          {afters.length > 1 ? (
            <VariantSwitch variants={afters} current={current} onChange={setCurrent} />
          ) : (
            <span className="rounded-full bg-white/90 px-[12px] py-[6px] font-geist text-caption-md font-medium uppercase tracking-[1px] text-primary">
              After
            </span>
          )}
        </div>
      </div>
      {afters.length > 1 && (
        <div className="mt-[12px] flex justify-center md:hidden">
          <VariantSwitch variants={afters} current={current} onChange={setCurrent} />
        </div>
      )}
      {label && (
        <p className="mt-[12px] text-center font-body text-[12px] font-medium leading-[16px] text-muted">{label}</p>
      )}
    </figure>
  );
}
