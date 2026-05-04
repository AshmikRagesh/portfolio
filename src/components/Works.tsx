"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface WorkItem {
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  tags: { label: string; style: string }[];
  role: string;
  team: string;
  timeframe: string;
  href: string;
}

const works: WorkItem[] = [
  {
    number: "NO. 01",
    title: "Artemis Reservations",
    description:
      "Streamlining the reservations module in Artemis 3.0—introducing auto‑save, in‑app notifications, and categorised flights.",
    image: "/images/works-cover.png",
    imageAlt: "Artemis 3.0 Reservations Module preview",
    tags: [
      { label: "UX DESIGN", style: "border border-[#c9b99a] text-[#7a6a57]" },
      { label: "SHIPPED", style: "border border-[#9abf9a] text-[#3d6e3d]" },
    ],
    role: "Lead Product Designer",
    team: "2 Engineers, 1 PM",
    timeframe: "4 months",
    href: "/works/artemis-reservations",
  },
  {
    number: "NO. 02",
    title: "Artemis Design System",
    description:
      "Conceptualised and built the Artemis design system from the ground up—tokens, components, and documentation.",
    image: "/images/works-cover.png",
    imageAlt: "Artemis Design System preview",
    tags: [
      { label: "DESIGN SYSTEM", style: "border border-[#c9b99a] text-[#7a6a57]" },
      { label: "IN PROGRESS", style: "border border-[#b9a97a] text-[#7a5f1e]" },
    ],
    role: "Lead Product Designer",
    team: "1 Engineer, 1 PM",
    timeframe: "6 months",
    href: "#",
  },
  {
    number: "NO. 03",
    title: "AI Trip Planning",
    description:
      "Designed an AI-powered itinerary builder that lets travelers create personalised trips in under 2 minutes.",
    image: "/images/works-cover.png",
    imageAlt: "AI Trip Planning preview",
    tags: [
      { label: "SIDE PROJECT", style: "border border-[#c9b99a] text-[#7a6a57]" },
      { label: "SHIPPED", style: "border border-[#9abf9a] text-[#3d6e3d]" },
    ],
    role: "Solo Designer",
    team: "Just me",
    timeframe: "2 months",
    href: "#",
  },
  {
    number: "NO. 04",
    title: "Travel Agent Dashboard",
    description:
      "Redesigned the agent-facing dashboard to surface key booking signals and reduce context-switching.",
    image: "/images/works-cover.png",
    imageAlt: "Travel Agent Dashboard preview",
    tags: [
      { label: "PRODUCT DESIGN", style: "border border-[#c9b99a] text-[#7a6a57]" },
      { label: "SHIPPED", style: "border border-[#9abf9a] text-[#3d6e3d]" },
    ],
    role: "Product Designer",
    team: "3 Engineers, 1 PM",
    timeframe: "3 months",
    href: "#",
  },
];

function WorkCard({ work }: { work: WorkItem }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";

  return (
    <Wrapper
      href={work.href as string}
      className="group relative bg-[#f0ebe3] rounded-[20px] overflow-hidden flex flex-col"
    >
      {/* Number — floats over image top-right */}
      <span className="absolute top-4 right-4 font-mono text-[11px] font-medium text-[#b5a99a] z-10 tracking-[0.6px] select-none">
        {work.number}
      </span>

      {/* Image */}
      <div className="relative h-[260px] sm:h-[280px] w-full overflow-hidden shrink-0">
        <Image
          src={work.image}
          alt={work.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Hover overlay */}
        {isLink && (
          <div className="absolute inset-0 bg-[#091624]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="flex items-center gap-2 bg-[#e96f18] text-white font-brand font-medium text-[12px] uppercase tracking-[1px] px-5 py-[10px] rounded-full">
              View Case Study
              <ArrowRight size={13} strokeWidth={2} />
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 pt-[18px] pb-5">
        {/* Title + tags */}
        <div className="flex items-start justify-between gap-3 mb-[10px]">
          <h3 className="font-heading italic font-normal text-[22px] leading-[1.15] tracking-[-0.44px] text-[#1a1208]">
            {work.title}
          </h3>
          <div className="flex flex-wrap gap-[6px] shrink-0 pt-[2px]">
            {work.tags.map((tag) => (
              <span
                key={tag.label}
                className={`font-brand font-medium text-[10px] tracking-[0.5px] uppercase px-[8px] py-[4px] rounded-full bg-transparent ${tag.style}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="font-body text-[14px] leading-[1.55] text-[#7a6a57]">
          {work.description}
        </p>

        {/* Hover reveal: role / team / timeframe */}
        <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[160px] group-hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="mt-4 pt-4 border-t border-[#d9cfc4] flex flex-col gap-[10px]">
            {[
              { label: "Role", value: work.role },
              { label: "Team", value: work.team },
              { label: "Timeframe", value: work.timeframe },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-brand text-[10px] font-medium uppercase tracking-[0.8px] text-[#b5a99a]">
                  {label}
                </span>
                <span className="font-body text-[13px] text-[#5a4a37]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export default function Works() {
  return (
    <section
      id="works"
      className="bg-background px-[20px] py-[60px] md:px-[60px] lg:px-[120px] lg:py-[80px]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {works.map((work) => (
          <WorkCard key={work.number} work={work} />
        ))}
      </div>
    </section>
  );
}
