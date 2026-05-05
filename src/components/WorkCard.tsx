"use client";

import Image from "next/image";
import Link from "next/link";

export interface WorkCardItem {
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  tags: string[];
  role?: string;
  team?: string;
  timeframe?: string;
  href: string;
  rotate: "left" | "right";
}

export function WorkCard({ work }: { work: WorkCardItem }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";
  const rotateClass = work.rotate === "left" ? "-rotate-1" : "rotate-1";
  const hasDetails = work.role || work.team || work.timeframe;

  return (
    <div className="group">
      <div
        className={`${rotateClass} group-hover:rotate-0 transition-transform duration-300 ease-in-out w-full`}
      >
        <Wrapper
          href={work.href as string}
          className="relative flex flex-col gap-4 bg-[#fbfbfb] border border-[#c8ccd4] rounded-[20px] shadow-[0px_0px_6px_rgba(0,0,0,0.05)] pt-4 px-4 pb-6 transition-shadow duration-300 group-hover:shadow-[0px_4px_24px_rgba(0,0,0,0.1)] cursor-pointer"
        >
          {/* Punch hole */}
          <div className="absolute top-[14px] left-[14px] w-[16px] h-[16px] rounded-full border border-[#c8ccd4] bg-background" />

          {/* Number + Image */}
          <div className="flex flex-col gap-3 items-end">
            <span className="font-brand font-medium text-[14px] uppercase text-[#172b4d] leading-[20px] shrink-0">
              {work.number}
            </span>
            <div className="relative h-[180px] w-full rounded-[16px] overflow-hidden shrink-0">
              <Image
                src={work.image}
                alt={work.imageAlt}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading font-normal text-[22px] leading-[1.18] tracking-[-0.44px] text-black">
                {work.title}
              </h3>
              <div className="flex flex-wrap gap-1 shrink-0 pt-[3px]">
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#cde4ff] text-[#091624] font-brand font-medium text-[10px] uppercase leading-[20px] px-2 py-[2px] rounded-[4px] whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <p className="font-body font-normal text-[14px] leading-[20px] text-[#717379]">
              {work.description}
            </p>

            {/* Hover-reveal: Role / Team / Timeframe */}
            {hasDetails && (
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
                <div className="overflow-hidden">
                  <div className="pt-4 border-t border-[#e8eaed] flex flex-col gap-3">
                    {[
                      { label: "Role", value: work.role },
                      { label: "Team", value: work.team },
                      { label: "Timeframe", value: work.timeframe },
                    ]
                      .filter(({ value }) => value)
                      .map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="font-brand font-medium text-[11px] uppercase tracking-[0.8px] text-[#9ca3af]">
                            {label}
                          </span>
                          <span className="font-body text-[14px] text-[#354454]">
                            {value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Wrapper>
      </div>
    </div>
  );
}
