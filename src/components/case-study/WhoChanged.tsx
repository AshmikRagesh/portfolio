"use client";

import useInView from "./useInView";

/**
 * What changed for each group of people, kept simple: one card per group, side by side
 * from md. Each card leads with the group's name in the heading serif, then what happens
 * now, and closes with what used to happen, small and muted. The cards rise in one after
 * another when they scroll into view; with reduced motion they simply show.
 */
type Row = { who: string; before: string; now: string };

export default function WhoChanged({ rows }: { rows: Row[] }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.3);

  return (
    // Wrapped, so the reading column's own list styles (which apply to its direct children) don't reach it
    <div ref={ref} className="mt-[48px] font-body">
      <ul className="m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-3">
        {rows.map((row, i) => (
          <li
            key={row.who}
            className={`flex flex-col gap-[12px] rounded-[20px] border border-line-soft bg-white p-[24px] transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
              shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
            }`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <h4 className="m-0 font-heading text-[24px] font-normal leading-[32px] text-heading">{row.who}</h4>
            <p className="m-0 text-[16px] leading-[26px] text-heading">{row.now}</p>
            <p className="m-0 mt-auto border-t border-line-soft pt-[12px] text-[14px] leading-[22px] text-muted">
              Before: {row.before}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
