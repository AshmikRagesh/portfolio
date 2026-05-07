"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ── Exported for Playground ───────────────────────────────────────────────────
export interface WorkItem {
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

export function WorkCard({ work }: { work: WorkItem }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";
  const rotateClass = work.rotate === "left" ? "-rotate-1" : "rotate-1";

  return (
    <div className="group">
      <div className={`${rotateClass} group-hover:rotate-0 transition-transform duration-300 ease-in-out w-full`}>
        <Wrapper
          href={work.href as string}
          className="relative flex flex-col gap-4 bg-[#fbfbfb] border border-[#c8ccd4] rounded-[20px] shadow-[0px_0px_6px_rgba(0,0,0,0.05)] pt-4 px-4 pb-6 transition-shadow duration-300 group-hover:shadow-[0px_4px_24px_rgba(0,0,0,0.1)] cursor-pointer"
        >
          <div className="absolute top-[14px] left-[14px] w-[16px] h-[16px] rounded-full border border-[#c8ccd4] bg-background" />
          <div className="flex flex-col gap-3 items-end">
            <span className="font-brand font-medium text-[14px] uppercase text-[#172b4d] leading-[20px] shrink-0">{work.number}</span>
            <div className="relative h-[180px] w-full rounded-[16px] overflow-hidden shrink-0">
              <Image src={work.image} alt={work.imageAlt} fill className="object-cover" />
            </div>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading font-normal text-[22px] leading-[1.18] tracking-[-0.44px] text-black">{work.title}</h3>
              <div className="flex flex-wrap gap-1 shrink-0 pt-[3px]">
                {work.tags.map((tag) => (
                  <span key={tag} className="bg-[#cde4ff] text-[#091624] font-brand font-medium text-[10px] uppercase leading-[20px] px-2 py-[2px] rounded-[4px] whitespace-nowrap">{tag}</span>
                ))}
              </div>
            </div>
            <p className="font-body font-normal text-[14px] leading-[20px] text-[#717379]">{work.description}</p>
            {(work.role || work.team || work.timeframe) && (
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
                <div className="overflow-hidden">
                  <div className="pt-4 border-t border-[#e8eaed] flex flex-col gap-3">
                    {[{ label: "Role", value: work.role }, { label: "Team", value: work.team }, { label: "Timeframe", value: work.timeframe }]
                      .filter(({ value }) => value)
                      .map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="font-brand font-medium text-[11px] uppercase tracking-[0.8px] text-[#9ca3af]">{label}</span>
                          <span className="font-body text-[14px] text-[#354454]">{value}</span>
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

// ── Timeline works data ───────────────────────────────────────────────────────
interface TimelineWork {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  tags: string[];
}

interface YearGroup {
  year: string;
  works: TimelineWork[];
}

const timelineGroups: YearGroup[] = [
  {
    year: "2025",
    works: [
      {
        title: "Creating and maintaining the Artemis Design System for Enchanting Travels",
        description:
          "Building accessible digital products is tough. It requires product designers to dive deep into guidelines, run extensive user testing, and manually audit every component. We fixed that.",
        image: "/images/works-cover.png",
        imageAlt: "Artemis Design System preview",
        href: "/works/artemis-reservations",
        tags: ["Design System", "Shipped"],
      },
      {
        title: "Streamlining the reservations module in Artemis 3.0",
        description:
          "Introducing auto‑save, in‑app notifications, and categorised flights—reducing booking errors and cutting task completion time by 35%.",
        image: "/images/works-cover.png",
        imageAlt: "Artemis Reservations preview",
        href: "#",
        tags: ["UX Design", "Shipped"],
      },
    ],
  },
  {
    year: "2024",
    works: [
      {
        title: "Designing an AI-powered itinerary builder for modern travellers",
        description:
          "Lets travelers create fully personalised trips in under 2 minutes—combining real-time availability, smart suggestions, and a zero-friction booking flow.",
        image: "/images/works-cover.png",
        imageAlt: "AI Trip Planning preview",
        href: "#",
        tags: ["Side Project", "Shipped"],
      },
      {
        title: "Redesigning the travel agent dashboard to surface key booking signals",
        description:
          "Reduced context-switching by 40% by consolidating fragmented views into a single, scannable workspace built around how agents actually think.",
        image: "/images/works-cover.png",
        imageAlt: "Travel Agent Dashboard preview",
        href: "#",
        tags: ["Product Design", "Shipped"],
      },
    ],
  },
];

// ── Works section ─────────────────────────────────────────────────────────────
export default function Works() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [activeWork, setActiveWork] = useState<string | null>(null);

  return (
    <section
      id="works"
      className="bg-background px-[20px] py-[60px] md:px-[60px] lg:pl-[120px] lg:pr-[160px] lg:pt-[100px] lg:pb-[120px]"
    >
      {/* Custom cursor */}
      {activeWork && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: cursorPos.x, top: cursorPos.y, transform: "translate(-50%, calc(-100% - 14px))" }}
        >
          <span className="block bg-[#172b4d] text-white font-brand font-medium text-[12px] tracking-[0.2px] px-4 py-[7px] rounded-full whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            Read case study
          </span>
        </div>
      )}

      {/* Timeline */}
      <div className="flex flex-col gap-[80px] lg:gap-[120px]">
        {timelineGroups.map((group) => (
          <div key={group.year} className="flex gap-[32px] lg:gap-[80px]">

            {/* Year column — sticky on desktop */}
            <div className="hidden lg:flex w-[160px] shrink-0 relative">
              {/* Vertical trail line */}
              <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-[#ebebeb]" />

              <div className="sticky top-[200px] self-start flex items-center gap-3 z-10">
                <div className="w-[7px] h-[7px] rounded-full bg-background ring-[1.5px] ring-[#c8ccd4] shrink-0" />
                <span className="font-heading font-normal text-[64px] leading-none tracking-[-1.5px] text-[#e5e7eb] select-none">
                  {group.year}
                </span>
              </div>
            </div>

            {/* Projects */}
            <div className="flex flex-col gap-[70px] lg:gap-[100px] flex-1">

              {/* Mobile: year label */}
              <div className="flex items-center gap-2 lg:hidden">
                <div className="w-[6px] h-[6px] rounded-full bg-[#d1d5db]" />
                <span className="font-heading font-normal text-[40px] leading-none tracking-[-0.8px] text-[#e5e7eb] select-none">
                  {group.year}
                </span>
              </div>

              {group.works.map((work) => {
                const isLink = work.href !== "#";
                const Wrapper = isLink ? Link : "div";

                return (
                  <div
                    key={work.title}
                    className={isLink ? "cursor-none" : ""}
                    onMouseMove={(e) => { if (isLink) setCursorPos({ x: e.clientX, y: e.clientY }); }}
                    onMouseEnter={() => { if (isLink) setActiveWork(work.title); }}
                    onMouseLeave={() => setActiveWork(null)}
                  >
                    <Wrapper href={work.href as string} className="group flex flex-col gap-0">

                      {/* Tags */}
                      <div className="flex items-center gap-3 mb-[8px]">
                        {work.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-brand font-medium text-[11px] uppercase tracking-[0.8px] text-[#0049c4]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h3 className="font-heading font-normal text-[26px] leading-[1.18] tracking-[-0.52px] text-[#091624] transition-opacity duration-200 group-hover:opacity-60 lg:text-[38px] lg:tracking-[-0.76px] mb-[12px]">
                        {work.title}
                      </h3>

                      {/* Description */}
                      <p className="font-body font-normal text-[15px] leading-[26px] text-[#717379] lg:text-[17px] lg:leading-[28px]">
                        {work.description}
                      </p>

                      {/* Image */}
                      <div className="relative w-full h-[260px] rounded-[20px] overflow-hidden mt-[32px] lg:h-[480px] lg:mt-[40px]">
                        <Image
                          src={work.image}
                          alt={work.imageAlt}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      </div>

                    </Wrapper>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
