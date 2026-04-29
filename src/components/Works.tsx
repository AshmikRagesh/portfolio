import Image from "next/image";

const PLACEHOLDER_IMG = "/images/works-cover.png";

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
      className="bg-background flex flex-col gap-[120px] px-[20px] py-[60px] md:p-[60px] lg:px-[120px] lg:py-[60px]"
    >
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
              <p className="font-brand font-medium text-[14px] text-[#e96f18] uppercase leading-[20px]">
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
              />
            </div>
          </a>
        );
      })}
    </section>
  );
}
