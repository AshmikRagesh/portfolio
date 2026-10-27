"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

/**
 * Extra research tucked behind a toggle. The toggle is a text link in the nav links' style
 * (brand mono caps), underlined; on hover, and while open, it turns grape with the nav's
 * wavy underline. Its plus turns into a cross when open. The panel
 * opens and closes by easing its height (a 0fr → 1fr grid row) while fading and settling
 * in, so closing animates as smoothly as opening; reduced motion skips straight to the end.
 */
export default function MoreDetail({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`group/more mx-auto flex items-center gap-[8px] whitespace-nowrap rounded-[2px] py-[8px] font-brand text-[14px] font-normal uppercase tracking-[1px] transition-colors duration-200 hover:text-grape focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape ${
          open ? "text-grape" : "text-heading"
        }`}
      >
        <span
          className={`underline underline-offset-[6px] group-hover/more:decoration-wavy ${
            open ? "decoration-wavy" : "decoration-solid"
          }`}
        >
          {label}
        </span>
        <Plus
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            open ? "rotate-45" : ""
          }`}
        />
      </button>
      <div
        id={id}
        role="region"
        aria-label={label}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`mt-[24px] rounded-[16px] border border-line-soft bg-white p-[20px] transition-transform duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:p-[32px] motion-reduce:transition-none ${
              open ? "translate-y-0" : "-translate-y-[12px]"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
