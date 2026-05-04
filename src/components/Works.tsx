"use client";

import Image from "next/image";
import Link from "next/link";

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
  },
];

function WorkCard({ work }: { work: WorkItem }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";

  return (
    <Wrapper
      href={work.href as string}
      className="group flex flex-col gap-6 bg-white border border-[#c8ccd4] rounded-[20px] shadow-[0px_1px_12px_rgba(0,0,0,0.06)] pt-5 px-5 pb-10 min-h-[514px] cursor-pointer transition-shadow duration-300 hover:shadow-[0px_4px_24px_rgba(0,0,0,0.1)]"
    >
      {/* Number + Image — image grows to fill remaining height */}
      <div className="flex flex-col gap-3 items-end flex-1 min-h-0">
        <span className="font-brand font-medium text-[14px] uppercase text-[#172b4d] leading-[20px] shrink-0">
          {work.number}
        </span>
        <div className="relative flex-1 w-full min-h-0 rounded-[16px] overflow-hidden">
          <Image
            src={work.image}
            alt={work.imageAlt}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Content — fixed at bottom */}
      <div className="flex flex-col gap-3 shrink-0">
        {/* Tags + Title */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {work.tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#e2ecff] text-[#091624] font-brand font-medium text-[12px] uppercase leading-[20px] px-2 py-1 rounded-[4px]"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-heading font-normal text-[30px] leading-[1.18] tracking-[-0.6px] text-black">
            {work.title}
          </h3>
        </div>

        {/* Description */}
        <p className="font-body font-normal text-[18px] leading-[24px] text-[#717379]">
          {work.description}
        </p>

        {/* Hover-reveal: Role / Team / Timeframe */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
          <div className="overflow-hidden">
            <div className="pt-4 border-t border-[#e8eaed] flex flex-col gap-3">
              {[
                { label: "Role", value: work.role },
                { label: "Team", value: work.team },
                { label: "Timeframe", value: work.timeframe },
              ].map(({ label, value }) => (
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
      </div>
    </Wrapper>
  );
}

export default function Works() {
  return (
    <section
      id="works"
      className="bg-background px-[20px] py-[60px] md:px-[60px] lg:px-[120px] lg:py-[60px]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[40px] lg:gap-[60px]">
        {works.map((work) => (
          <WorkCard key={work.number} work={work} />
        ))}
      </div>
    </section>
  );
}
