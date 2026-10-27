"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

/**
 * Extra research tucked behind a toggle. The button is the site's secondary CTA — the nav
 * button's shape (brand mono caps, 42px, 10px corners) in white with a line border, going
 * grape on hover like the nav links. Its plus turns into a cross when open. The panel
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
        className="mx-auto flex h-[42px] items-center gap-[8px] whitespace-nowrap rounded-[10px] border border-line bg-white px-[16px] font-brand text-[14px] font-medium uppercase tracking-[1px] text-heading transition-colors duration-200 hover:border-grape hover:text-grape focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape"
      >
        {label}
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
