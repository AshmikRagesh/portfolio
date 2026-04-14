import Image from "next/image";
import ReelPlayer from "@/components/ReelPlayer";

// TODO: Replace each image with your own work screenshots (Figma URLs expire 2026-04-17)
const PLACEHOLDER_IMG =
  "https://www.figma.com/api/mcp/asset/2e9e803c-f22c-4622-b8a4-1fd1014aec0a";

interface WorkItem {
  tags: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
}

const works: WorkItem[] = [
  {
    tags: "UX Design, Product Design",
    title:
      "Streamlining the Reservations Module in Artemis 3.0: Saving Time for Reservations Team",
    subtitle:
      "Migrated the legacy Bookings UI—introducing auto‑save, in‑app notifications, and categorised flights.",
    image: PLACEHOLDER_IMG,
    imageAlt: "Artemis 3.0 Reservations Module preview",
    href: "/works/artemis-reservations",
  },
  {
    tags: "AI, Product Design, Research",
    title:
      "Creating and maintaining the Artemis Design System for Enchanting Travels",
    subtitle:
      "Conceptualised the product strategy. Led the end-to-end design process.",
    image: PLACEHOLDER_IMG,
    imageAlt: "Work preview",
    href: "#",
  },
  {
    tags: "AI, Product Design, Research",
    title:
      "Creating and maintaining the Artemis Design System for Enchanting Travels",
    subtitle:
      "Conceptualised the product strategy. Led the end-to-end design process.",
    image: PLACEHOLDER_IMG,
    imageAlt: "Work preview",
    href: "#",
  },
];

export default function Works() {
  return (
    <section
      id="works"
      className="bg-background px-[20px] py-[60px] md:p-[60px] lg:px-[120px] lg:py-[60px]"
    >
      {/* Two-column layout on desktop: work cards (flex-1) + sticky reel (shrink-0) */}
      <div className="flex gap-16 items-start">
        {/* Work cards column */}
        <div className="flex flex-col gap-[120px] flex-1 min-w-0">
          {works.map((work, i) => {
            const isReversed = i % 2 !== 0;
            return (
              <a
                key={i}
                href={work.href}
                className={`group flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16 ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Text */}
                <div className="flex flex-col gap-2 lg:flex-1">
                  <p className="font-brand font-medium text-[14px] text-[#0049c4] uppercase leading-[20px]">
                    {work.tags}
                  </p>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-heading font-normal text-[30px] leading-[1.18] tracking-[-0.6px] text-black md:text-[36px] md:tracking-[-0.72px] group-hover:opacity-70 transition-opacity">
                      {work.title}
                    </h3>
                    <p className="font-body font-normal text-[20px] leading-[26px] text-muted tracking-[-0.9px]">
                      {work.subtitle}
                    </p>
                  </div>
                </div>

                {/* Image */}
                <div className="relative w-full h-[432px] rounded-2xl overflow-hidden lg:flex-1">
                  <Image
                    src={work.image}
                    alt={work.imageAlt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </a>
            );
          })}
        </div>

        {/* Sticky reel column — desktop only */}
        <div className="hidden lg:flex shrink-0 sticky top-[120px] self-start">
          <ReelPlayer inline />
        </div>
      </div>
    </section>
  );
}
