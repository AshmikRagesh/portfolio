"use client";

import useInView from "./useInView";

/**
 * Simple pointers: a small grape dot, then a short bold lead in the heading colour and the
 * rest of the point in the body text, on one flowing line. The points rise in one after
 * another when they scroll into view; with reduced motion they simply show.
 */
type Pointer = { lead: string; text: string };

export default function Pointers({ items }: { items: Pointer[] }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.3);

  return (
    // Wrapped, so the reading column's own list styles (which apply to its direct children) don't reach it
    <div ref={ref} className="mt-[24px]">
      <ul className="m-0 flex list-none flex-col gap-[20px] p-0">
        {items.map((item, i) => (
          <li
            key={item.lead}
            className={`grid grid-cols-[8px_1fr] gap-[16px] transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
              shown ? "translate-y-0 opacity-100" : "translate-y-[12px] opacity-0"
            }`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            {/* The dot sits on the first line of text */}
            <span aria-hidden="true" className="mt-[12px] h-[8px] w-[8px] rounded-full bg-grape" />
            <p className="m-0 font-body text-[18px] leading-[30px] text-secondary">
              <strong className="font-medium text-heading">{item.lead}</strong> {item.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
