"use client";

import { createContext, useContext, useState } from "react";
import { Figure } from "./Blocks";

/**
 * Visuals that show two designs. VariantProvider names the designs (with an icon each);
 * every VariantFigure carries its own switch in its top-right corner, so the reader flips
 * the design right where they're looking instead of scrolling back to a control.
 */
type Variant = { id: string; label: string; icon: React.ReactNode };

const VariantContext = createContext<Variant[] | null>(null);

export function VariantProvider({ variants, children }: { variants: Variant[]; children: React.ReactNode }) {
  return <VariantContext.Provider value={variants}>{children}</VariantContext.Provider>;
}

/**
 * The switch — a white pill track with a hairline border and a blackcurrant thumb that
 * slides under the picked design's icon. No words on it: each icon names its design to
 * screen readers and on hover.
 */
function VariantSwitch({
  variants,
  current,
  onChange,
}: {
  variants: Variant[];
  current: string;
  onChange: (id: string) => void;
}) {
  const index = variants.findIndex((v) => v.id === current);
  return (
    <div
      role="radiogroup"
      aria-label="Show design"
      className="relative flex rounded-full border border-line bg-white p-[4px] shadow-[0_2px_8px_rgba(30,5,37,0.08)]"
    >
      <span
        aria-hidden="true"
        className="absolute left-[4px] top-[4px] size-[32px] rounded-full bg-primary transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(${index * 32}px)` }}
      />
      {variants.map((v) => {
        const on = v.id === current;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={v.label}
            title={v.label}
            onClick={() => onChange(v.id)}
            className={`relative flex size-[32px] items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
              on ? "text-white" : "text-muted hover:text-grape"
            }`}
          >
            {v.icon}
          </button>
        );
      })}
    </div>
  );
}

/** A figure with its own design switch; the visual fades to the picked design */
export function VariantFigure({ names }: { names: Record<string, string> }) {
  const variants = useContext(VariantContext);
  if (!variants) throw new Error("VariantFigure needs a VariantProvider");
  const [current, setCurrent] = useState(variants[0].id);
  return (
    <div className="relative">
      <div key={current} className="cs-fade">
        <Figure name={names[current]} />
      </div>
      <div className="absolute right-[12px] top-[12px] z-10 md:right-[16px] md:top-[16px]">
        <VariantSwitch variants={variants} current={current} onChange={setCurrent} />
      </div>
    </div>
  );
}
