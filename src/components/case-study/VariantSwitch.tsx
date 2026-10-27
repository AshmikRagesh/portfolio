"use client";

import { createContext, useContext, useState } from "react";
import { Figure } from "./Blocks";

/**
 * One switch for a whole chapter when it shows two designs: a segmented control picks the
 * variant, and every VariantFigure inside the provider swaps to that variant's visual
 * (fading in). Points where the comparison is the point use a plain two-up instead.
 */
type Variant = { id: string; label: string };

const VariantContext = createContext<{ variants: Variant[]; current: string; set: (id: string) => void } | null>(
  null,
);

function useVariants() {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error("Variant components need a VariantProvider");
  return ctx;
}

export function VariantProvider({ variants, children }: { variants: Variant[]; children: React.ReactNode }) {
  const [current, set] = useState(variants[0].id);
  return <VariantContext.Provider value={{ variants, current, set }}>{children}</VariantContext.Provider>;
}

/**
 * The segmented control — the nav button's type (brand mono caps) in a white, line-bordered
 * track; the picked option fills blackcurrant, the others go grape on hover.
 */
export function VariantToggle({ label }: { label: string }) {
  const { variants, current, set } = useVariants();
  return (
    <div role="group" aria-label={label} className="mt-[32px] inline-flex gap-[4px] rounded-[10px] border border-line bg-white p-[4px]">
      {variants.map((v) => {
        const on = v.id === current;
        return (
          <button
            key={v.id}
            type="button"
            aria-pressed={on}
            onClick={() => set(v.id)}
            className={`h-[34px] whitespace-nowrap rounded-[6px] px-[14px] font-brand text-[14px] font-normal uppercase tracking-[1px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
              on ? "bg-primary text-white" : "text-heading hover:text-grape"
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

/** A figure that shows the visual for whichever variant is picked */
export function VariantFigure({ names }: { names: Record<string, string> }) {
  const { current } = useVariants();
  return (
    <div key={current} className="cs-fade">
      <Figure name={names[current]} />
    </div>
  );
}
