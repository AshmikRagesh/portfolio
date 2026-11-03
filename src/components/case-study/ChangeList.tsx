"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import useInView from "./useInView";

/**
 * What changes from one version to the next, one card per item: a numbered title, then
 * how it is today in a grey box and how it will be in a grape box, with an arrow between
 * (pointing down when the boxes stack on phones). All type comes from the DS scale.
 * When the list scrolls into view the cards rise in one after another and each arrow
 * slides across as its card lands; with reduced motion they're simply shown.
 */
type Change = { title: string; today: string; next: string };

const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

export default function ChangeList({
  items,
  from = "V1",
  to = "V2",
}: {
  items: Change[];
  from?: string;
  to?: string;
}) {
  const [ref, shown] = useInView<HTMLOListElement>(0.2);

  return (
    <ol ref={ref} className="m-0 flex list-none flex-col gap-[16px] p-0">
      {items.map(({ title, today, next }, i) => (
        <li
          key={title}
          className={`rounded-lg border border-line-soft bg-white p-[16px] transition-[opacity,transform] duration-700 ${EASE} motion-reduce:transition-none md:p-[20px] ${
            shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
          }`}
          style={{ transitionDelay: `${i * 120}ms` }}
        >
          <p className="flex items-baseline gap-[12px]">
            <span className="font-body text-body text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-heading text-h4 font-medium text-heading md:text-h4-md">{title}</span>
          </p>
          <div className="mt-[16px] grid grid-cols-1 items-stretch gap-[8px] md:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)]">
            <div className="flex flex-col gap-[8px] rounded-md bg-surface p-[12px] md:p-[16px]">
              <span className="self-start rounded-full bg-white px-[8px] py-[2px] font-geist text-caption text-secondary ring-1 ring-inset ring-line-soft">
                {from} today
              </span>
              <p className="font-body text-body text-secondary md:text-body-md">{today}</p>
            </div>
            <span
              aria-hidden="true"
              className={`flex items-center justify-center text-grape transition-[opacity,transform] duration-500 ${EASE} motion-reduce:transition-none ${
                shown ? "translate-x-0 opacity-100" : "-translate-x-[8px] opacity-0"
              }`}
              style={{ transitionDelay: `${i * 120 + 300}ms` }}
            >
              <ArrowRight size={20} weight="bold" className="rotate-90 md:rotate-0" />
            </span>
            <div className="flex flex-col gap-[8px] rounded-md bg-grape-light/60 p-[12px] md:p-[16px]">
              <span className="self-start rounded-full bg-grape px-[8px] py-[2px] font-geist text-caption text-white">In {to}</span>
              <p className="font-body text-body text-heading md:text-body-md">{next}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
