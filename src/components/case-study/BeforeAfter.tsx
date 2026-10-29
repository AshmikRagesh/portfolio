"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A before-and-after comparison, in Geist: one row per state, each a label over a solid
 * bar sized to its share of the longest, with its value right at the bar's end. Under the
 * bars, one short line for each group of people it changed things for.
 * The bars grow from the left once, when the chart scrolls into view (the second after a
 * short delay, so the drop reads); with reduced motion they're simply drawn.
 */
type Row = { label: string; value: string; share: number; tone: "before" | "after" };

const TONE = { before: "bg-[#d0d7de]", after: "bg-grape" };

export default function BeforeAfter({
  rows,
  groups,
}: {
  rows: Row[];
  groups: { who: string; what: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-[40px] font-geist text-heading">
      <dl className="m-0 flex flex-col gap-[24px]">
        {rows.map((row, i) => (
          <div key={row.label} className="flex flex-col gap-[8px]">
            <dt className="text-[14px] leading-[20px] text-secondary">{row.label}</dt>
            {/* The bar takes its share of the row, less room for the value, which sits at its end */}
            <dd className="m-0 flex items-center gap-[16px]">
              <span
                aria-hidden="true"
                className={`h-[40px] shrink-0 origin-left rounded-[8px] transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${TONE[row.tone]}`}
                style={{
                  width: `calc(${row.share} * (100% - 136px))`,
                  transform: `scaleX(${shown ? 1 : 0})`,
                  transitionDelay: `${i * 300}ms`,
                }}
              />
              <span
                className={`whitespace-nowrap text-[16px] font-medium leading-[24px] transition-opacity duration-[400ms] md:text-[18px] ${
                  shown ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionDelay: `${i * 300 + 500}ms` }}
              >
                {row.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <ul className="m-0 mt-[40px] grid list-none grid-cols-1 gap-[24px] p-0 md:grid-cols-3">
        {groups.map((g) => (
          <li key={g.who} className="flex flex-col gap-[4px]">
            <span className="text-[16px] font-medium leading-[24px]">{g.who}</span>
            <span className="text-[14px] leading-[22px] text-secondary">{g.what}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
