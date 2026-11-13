"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { Figure } from "./Blocks";

/**
 * Visuals that show two or more versions side by side in time: two designs, or the same
 * thing for different brands. VariantProvider names them (a full name and a short tag
 * such as "V2" or a brand name, matching the tags earlier in the case study); every
 * VariantFigure carries its own switch in its top-right corner, so the reader flips the
 * version right where they're looking instead of scrolling back to a control.
 */
type Variant = { id: string; label: string; short: string };

const VariantContext = createContext<Variant[] | null>(null);

export function VariantProvider({ variants, children }: { variants: Variant[]; children: React.ReactNode }) {
  return <VariantContext.Provider value={variants}>{children}</VariantContext.Provider>;
}

/**
 * The switch — a frosted white pill with a soft ring and shadow, so it reads over any
 * screen, and a blackcurrant thumb that slides and stretches under the picked version's
 * tag (Geist 14 medium, white when picked, grape on hover). Tags size to their text (at
 * least 44px), and the thumb takes each one's width.
 * The full name goes to screen readers and shows on hover.
 */
export function VariantSwitch({
  variants,
  current,
  onChange,
}: {
  variants: Variant[];
  current: string;
  onChange: (id: string) => void;
}) {
  const index = variants.findIndex((v) => v.id === current);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState({ x: 0, w: 36 });
  // Measure the picked tag, and again whenever it changes size (the mono font loads late)
  useLayoutEffect(() => {
    const el = tabs.current[index];
    if (!el) return;
    const measure = () => setThumb({ x: el.offsetLeft - 4, w: el.offsetWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [index, variants]);
  return (
    <div
      role="radiogroup"
      aria-label="Show version"
      className="relative flex rounded-full bg-white/90 p-[4px] shadow-[0_4px_16px_rgba(30,5,37,0.12)] ring-1 ring-primary/10 backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="absolute left-[4px] top-[4px] h-[36px] rounded-full bg-primary shadow-[0_2px_6px_rgba(50,7,62,0.25)] transition-[transform,width] duration-[400ms] ease-[cubic-bezier(0.34,1.3,0.64,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }}
      />
      {variants.map((v, i) => {
        const on = v.id === current;
        return (
          <button
            key={v.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            data-sound-click="toggle"
            aria-label={v.label}
            title={v.label}
            onClick={() => onChange(v.id)}
            className={`relative flex h-[36px] min-w-[44px] items-center justify-center rounded-full px-[16px] font-geist text-[14px] font-medium leading-[20px] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
              on ? "text-white" : "text-secondary hover:text-grape"
            }`}
          >
            {v.short}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A figure with its own version switch; the visual fades to the picked version. Each
 * version can carry a screen recording (`videos`, muted loop) and a note under it
 * (`captions`); without a recording it shows a placeholder named from `names`.
 */
export function VariantFigure({
  names,
  videos = {},
  captions = {},
  card,
}: {
  names: Record<string, string>;
  videos?: Record<string, string | undefined>;
  captions?: Record<string, React.ReactNode>;
  /** Set it in the white case study card, like the other Solution visuals */
  card?: boolean;
}) {
  const variants = useContext(VariantContext);
  if (!variants) throw new Error("VariantFigure needs a VariantProvider");
  const [current, setCurrent] = useState(variants[0].id);
  const video = videos[current];
  return (
    <div className="relative">
      <div key={current} className="cs-fade">
        <Figure
          name={names[current]}
          alt={video ? `Screen recording: ${names[current]}` : undefined}
          video={video}
          caption={captions[current]}
          card={card}
        />
      </div>
      <div className="absolute right-[12px] top-[12px] z-10 md:right-[16px] md:top-[16px]">
        <VariantSwitch variants={variants} current={current} onChange={setCurrent} />
      </div>
    </div>
  );
}

/**
 * Two versions at equal weight: one card below the other at full width, playing together.
 * For designs in a test, where a switch would show one first and hide the other. Each card
 * has the OptionCard layout and finish: white, 8px corners, soft low shadow; the variant
 * one small label on top (CardKicker: "Text links · Variant 2", the name first), then the
 * recording in a 4px frame nested in the 8px inset. No title: the point's own heading sits
 * just above, so a repeated serif name would only add bulk. Recordings are 16:9 (1920 × 1080).
 */
export function VariantPair({
  names,
  videos = {},
  aspect = "aspect-[16/9]",
}: {
  names: Record<string, string>;
  videos?: Record<string, string | undefined>;
  aspect?: string;
}) {
  const variants = useContext(VariantContext);
  if (!variants) throw new Error("VariantPair needs a VariantProvider");
  return (
    <ul className="m-0 flex list-none flex-col gap-[24px] p-0 md:gap-[32px]">
      {variants.map((v) => {
        const video = videos[v.id];
        const [kicker, name] = v.label.includes(" · ") ? v.label.split(" · ") : [undefined, v.label];
        return (
          <li key={v.id} className="min-w-0">
            <Figure
              card
              kicker={
                <>
                  {name}
                  {kicker && <span className="text-muted">· {kicker}</span>}
                </>
              }
              name={names[v.id]}
              alt={video ? `Screen recording: ${names[v.id]}` : undefined}
              video={video}
              aspect={aspect}
            />
          </li>
        );
      })}
    </ul>
  );
}
