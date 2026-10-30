"use client";

import useInView from "./useInView";

/**
 * A short list of lessons: each a large grape number in the heading serif beside the
 * lesson as a heading-serif statement, with one line of explanation under it. No cards;
 * the rows rise in one after another when they scroll into view, and with reduced motion
 * they simply show.
 */
type Lesson = { title: string; text: string };

export default function Lessons({ items }: { items: Lesson[] }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.3);

  return (
    // Wrapped, so the reading column's own list styles (which apply to its direct children) don't reach it
    <div ref={ref} className="mt-[40px]">
      <ol className="m-0 flex list-none flex-col gap-[32px] p-0">
        {items.map((item, i) => (
          <li
            key={item.title}
            className={`grid grid-cols-[48px_1fr] gap-[16px] transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none md:grid-cols-[64px_1fr] md:gap-[24px] ${
              shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
            }`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <span aria-hidden="true" className="font-heading text-[32px] leading-[36px] text-grape md:text-[40px] md:leading-[44px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-[8px]">
              <h3 className="m-0 font-heading text-[24px] font-normal leading-[32px] text-heading md:text-[28px] md:leading-[36px]">
                {item.title}
              </h3>
              <p className="m-0 font-body text-[18px] leading-[30px] text-secondary">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
