"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import useInView from "./useInView";

/**
 * What changed for each group of people, as a before-and-after comparison: one row per
 * group, its name in the heading serif, then what used to happen (muted) and what happens
 * now (on a grape-light panel), joined by an arrow. From md the before and now sit side by
 * side under a shared header; on phones each row stacks, the arrow turning down.
 * When it scrolls into view the rows rise in one after another and each "now" panel fills
 * in a beat after its row; with reduced motion everything simply shows.
 */
type Row = { who: string; before: string; now: string };

export default function WhoChanged({ rows }: { rows: Row[] }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="mt-[48px] font-body text-heading">
      {/* Column header, from md */}
      <div
        aria-hidden="true"
        className="hidden grid-cols-[160px_1fr_32px_1fr] gap-[16px] pb-[12px] text-[14px] leading-[20px] md:grid"
      >
        <span />
        <span className="text-muted">Before Helix</span>
        <span />
        <span className="pl-[20px] text-grape">With Helix</span>
      </div>

      <ul className="m-0 flex list-none flex-col gap-[12px] p-0">
        {rows.map((row, i) => {
          const delay = i * 180;
          return (
            <li
              key={row.who}
              className={`grid grid-cols-1 items-center gap-[12px] rounded-[20px] border border-line-soft bg-white p-[20px] transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none md:grid-cols-[160px_1fr_32px_1fr] md:gap-[16px] md:p-[16px] md:pl-[24px] ${
                shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
              }`}
              style={{ transitionDelay: `${delay}ms` }}
            >
              <h4 className="m-0 font-heading text-[22px] font-normal leading-[28px] text-heading">{row.who}</h4>
              <p className="m-0 text-[16px] leading-[26px] text-muted">
                <span className="sr-only">Before Helix: </span>
                {row.before}
              </p>
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="rotate-90 justify-self-start text-grape md:rotate-0 md:justify-self-center"
              />
              <p
                className={`m-0 rounded-[14px] px-[20px] py-[14px] text-[16px] leading-[26px] text-heading transition-colors duration-[600ms] motion-reduce:transition-none ${
                  shown ? "bg-grape-light" : "bg-transparent"
                }`}
                style={{ transitionDelay: `${delay + 400}ms` }}
              >
                <span className="sr-only">With Helix: </span>
                {row.now}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
