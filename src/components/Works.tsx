"use client";

import Image from "next/image";
import Link from "next/link";

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

const works: WorkItem[] = [
  {
    number: "NO:01",
    title: "Artemis Reservations",
    description:
      "Streamlining the reservations module in Artemis 3.0—introducing auto‑save, in‑app notifications, and categorised flights.",
    image: "/images/works-cover.png",
    imageAlt: "Artemis 3.0 Reservations Module preview",
    tags: ["UX DESIGN", "SHIPPED"],
    role: "Lead Product Designer",
    team: "2 Engineers, 1 PM",
    timeframe: "4 months",
    href: "/works/artemis-reservations",
    rotate: "left",
  },
  {
    number: "NO:02",
    title: "Artemis Design System",
    description:
      "Conceptualised and built the Artemis design system from the ground up—tokens, components, and documentation.",
    image: "/images/works-cover.png",
    imageAlt: "Artemis Design System preview",
    tags: ["DESIGN SYSTEM", "IN PROGRESS"],
    role: "Lead Product Designer",
    team: "1 Engineer, 1 PM",
    timeframe: "6 months",
    href: "#",
    rotate: "right",
  },
  {
    number: "NO:03",
    title: "AI Trip Planning",
    description:
      "Designed an AI-powered itinerary builder that lets travelers create personalised trips in under 2 minutes.",
    image: "/images/works-cover.png",
    imageAlt: "AI Trip Planning preview",
    tags: ["SIDE PROJECT", "SHIPPED"],
    role: "Solo Designer",
    team: "Just me",
    timeframe: "2 months",
    href: "#",
    rotate: "left",
  },
];


export function WorkCard({ work }: { work: WorkItem }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";
  const rotateClass = work.rotate === "left" ? "-rotate-1" : "rotate-1";

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
            {/* Title + Tags on same row */}
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

            {/* Description */}
            <p className="font-body font-normal text-[14px] leading-[20px] text-[#717379]">
              {work.description}
            </p>

            {/* Hover-reveal: Role / Team / Timeframe */}
            {(work.role || work.team || work.timeframe) && (
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

export default function Works() {
  return (
    <section
      id="works"
      className="bg-background px-[20px] py-[60px] md:px-[60px] lg:px-[120px] lg:pt-[100px] lg:pb-[60px]"
    >
      <div className="flex flex-col gap-[60px] lg:gap-[80px]">
        {works.map((work, i) => {
          const isLink = work.href !== "#";
          const Wrapper = isLink ? Link : "div";
          const imageRight = i % 2 === 0;

          return (
            <Wrapper
              key={work.number}
              href={work.href as string}
              className={`group flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-[64px] ${
                !imageRight ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text */}
              <div className="flex flex-col gap-2 lg:flex-1">
                <p className="font-brand font-normal text-[14px] uppercase text-[#0049c4] leading-[20px]">
                  {work.tags.join(", ")}
                </p>
                <div className="flex flex-col gap-3">
                  <h3 className="font-heading font-normal text-[28px] leading-[1.18] tracking-[-0.56px] text-black lg:text-[36px] lg:tracking-[-0.72px] group-hover:opacity-70 transition-opacity duration-200">
                    {work.title}
                  </h3>
                  <p className="font-body font-normal text-[16px] leading-[24px] text-[#717379] lg:text-[20px] lg:leading-[26px]">
                    {work.description}
                  </p>
                </div>
              </div>

              {/* Image */}
              <div className="relative w-full h-[260px] rounded-[16px] overflow-hidden lg:flex-1 lg:h-[432px]">
                <Image
                  src={work.image}
                  alt={work.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}
