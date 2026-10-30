"use client";

import useInView from "./useInView";

/**
 * A before-and-after comparison: one row per state, each a label over a solid, rounded
 * bar sized to its share of the longest, with its value right at the bar's end in the
 * heading serif (muted for the before, grape for the after).
 * The bars grow from the left once, when the chart scrolls into view (the second after a
 * short delay, so the drop reads), and each value fades in once its bar is drawn. With
 * reduced motion they're simply drawn.
 */
type Row = { label: string; value: string; share: number; tone: "before" | "after" };

const TONE = { before: "bg-[#d0d7de]", after: "bg-grape" };

export default function BeforeAfter({ rows }: { rows: Row[] }) {
  const [ref, shown] = useInView<HTMLDListElement>();

  return (
    <dl ref={ref} className="m-0 mt-[40px] flex flex-col gap-[24px] font-body text-heading">
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
              className={`whitespace-nowrap font-heading text-[18px] leading-[24px] transition-opacity duration-[400ms] md:text-[20px] md:leading-[28px] ${
                row.tone === "after" ? "text-grape" : "text-secondary"
              } ${shown ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: `${i * 300 + 500}ms` }}
            >
              {row.value}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
