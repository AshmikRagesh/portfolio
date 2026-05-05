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
  {
    number: "NO:04",
    title: "Travel Agent Dashboard",
    description:
      "Redesigned the agent-facing dashboard to surface key booking signals and reduce context-switching.",
    image: "/images/works-cover.png",
    imageAlt: "Travel Agent Dashboard preview",
    tags: ["PRODUCT DESIGN", "SHIPPED"],
    role: "Product Designer",
    team: "3 Engineers, 1 PM",
    timeframe: "3 months",
    href: "#",
    rotate: "right",
  },
  {
    number: "NO:05",
    title: "Onboarding Redesign",
    description:
      "Simplified the traveler onboarding flow, cutting drop-off by 40% through progressive disclosure and inline validation.",
    image: "/images/works-cover.png",
    imageAlt: "Onboarding Redesign preview",
    tags: ["UX DESIGN", "SHIPPED"],
    role: "Product Designer",
    team: "2 Engineers, 1 PM",
    timeframe: "6 weeks",
    href: "#",
    rotate: "left",
  },
  {
    number: "NO:06",
    title: "Mobile App Exploration",
    description:
      "Explored a native mobile experience for travellers to manage bookings, documents, and itineraries on the go.",
    image: "/images/works-cover.png",
    imageAlt: "Mobile App Exploration preview",
    tags: ["SIDE PROJECT", "CONCEPT"],
    role: "Solo Designer",
    team: "Just me",
    timeframe: "1 month",
    href: "#",
    rotate: "right",
  },
];

const leftWorks = works.filter((w) => w.rotate === "left");
const rightWorks = works.filter((w) => w.rotate === "right");

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
      className="bg-background px-[20px] py-[60px] md:px-[60px] lg:px-[120px] lg:pt-[100px] lg:pb-[60px] overflow-x-hidden"
    >
      {/* Mobile: single column */}
      <div className="flex flex-col gap-[60px] lg:hidden">
        {works.map((work) => (
          <WorkCard key={work.number} work={work} />
        ))}
      </div>

      {/* Desktop: two staggered tilted columns, centered */}
      <div className="hidden lg:flex gap-[60px] items-start max-w-[1035px] mx-auto">
        {/* Left column — tilt -1°, starts at top */}
        <div className="flex-1 flex flex-col gap-[60px]">
          {leftWorks.map((work) => (
            <WorkCard key={work.number} work={work} />
          ))}
        </div>

        {/* Right column — tilt +1°, offset 60px down */}
        <div className="flex-1 flex flex-col gap-[60px] pt-[60px]">
          {rightWorks.map((work) => (
            <WorkCard key={work.number} work={work} />
          ))}
        </div>
      </div>
    </section>
  );
}
