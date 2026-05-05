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
    tags: ["UX Design", "Shipped"],
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
    tags: ["Design System", "In Progress"],
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
    tags: ["Side Project", "Shipped"],
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
    tags: ["Product Design", "Shipped"],
    role: "Product Designer",
    team: "3 Engineers, 1 PM",
    timeframe: "3 months",
    href: "#",
  },
  {
    number: "NO:05",
    title: "Onboarding Redesign",
    description:
      "Simplified the traveler onboarding flow, cutting drop-off by 40% through progressive disclosure and inline validation.",
    image: "/images/works-cover.png",
    imageAlt: "Onboarding Redesign preview",
    tags: ["UX Design", "Shipped"],
    role: "Product Designer",
    team: "2 Engineers, 1 PM",
    timeframe: "6 weeks",
    href: "#",
  },
  {
    number: "NO:06",
    title: "Mobile App Exploration",
    description:
      "Explored a native mobile experience for travellers to manage bookings, documents, and itineraries on the go.",
    image: "/images/works-cover.png",
    imageAlt: "Mobile App Exploration preview",
    tags: ["Side Project", "Concept"],
    role: "Solo Designer",
    team: "Just me",
    timeframe: "1 month",
    href: "#",
  },
];

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
