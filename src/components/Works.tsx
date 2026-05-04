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
  tags: string[];
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
    tags: ["SHIPPED"],
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
    tags: ["IN PROGRESS"],
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
    tags: ["SIDE PROJECT"],
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
    tags: ["SHIPPED"],
    role: "Product Designer",
    team: "3 Engineers, 1 PM",
    timeframe: "3 months",
    href: "#",
  },
];

const TAG_STYLES: Record<string, string> = {
  SHIPPED: "bg-[#d1fae5] text-[#065f46]",
  "IN PROGRESS": "bg-[#fef3c7] text-[#92400e]",
  "SIDE PROJECT": "bg-[#e0e7ff] text-[#3730a3]",
};

function WorkCard({ work }: { work: WorkItem }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";

  return (
    <Wrapper
      href={work.href as string}
      className="group relative bg-[#f4f5f6] rounded-[20px] overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Number badge */}
      <span className="absolute top-4 right-4 font-mono text-[11px] font-medium text-[#9ca3af] z-10 tracking-[0.5px]">
        {work.number}
      </span>

      {/* Image */}
      <div className="relative h-[220px] sm:h-[240px] overflow-hidden shrink-0">
        <Image
          src={work.image}
          alt={work.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#091624]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="flex items-center gap-2 bg-[#e96f18] text-white font-brand font-medium text-[13px] uppercase tracking-[1px] px-5 py-[10px] rounded-full">
            View Case Study
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
        {/* Title + tags */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-heading font-normal text-[22px] leading-[1.2] tracking-[-0.44px] text-[#091624]">
            {work.title}
          </h3>
          <div className="flex flex-wrap gap-1 shrink-0 pt-[3px]">
            {work.tags.map((tag) => (
              <span
                key={tag}
                className={`font-brand font-medium text-[10px] tracking-[0.4px] uppercase px-2 py-[3px] rounded-full ${
                  TAG_STYLES[tag] ?? "bg-[#e8eaed] text-[#354454]"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="font-body text-[15px] leading-[1.5] text-[#6b7280] mb-0">
          {work.description}
        </p>

        {/* Hover reveal: role / team / timeframe */}
        <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[160px] group-hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="mt-4 pt-4 border-t border-[#e0e2e6] flex flex-col gap-[10px]">
            {[
              { label: "Role", value: work.role },
              { label: "Team", value: work.team },
              { label: "Timeframe", value: work.timeframe },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-brand text-[11px] font-medium uppercase tracking-[0.8px] text-[#9ca3af]">
                  {label}
                </span>
                <span className="font-body text-[13px] text-[#354454]">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {works.map((work) => (
          <WorkCard key={work.number} work={work} />
        ))}
      </div>
    </section>
  );
}
