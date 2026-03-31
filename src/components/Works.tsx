import Image from "next/image";

// TODO: Replace each image with your own work screenshots (Figma URLs expire 2026-04-07)
const PLACEHOLDER_IMG =
  "https://www.figma.com/api/mcp/asset/c82a55ae-67bd-4763-ba46-a7e0ae7fc66e";

interface WorkItem {
  tags: string;
  title: string;
  image: string;
  href: string;
  imageAlt: string;
}

const works: WorkItem[] = [
  {
    tags: "AI, Product Design, Research",
    title:
      "Creating and maintaining the Artemis Design System for Enchanting Travels",
    image: PLACEHOLDER_IMG,
    imageAlt: "Artemis Design System preview",
    href: "#",
  },
  {
    tags: "AI, Product Design, Research",
    title:
      "Creating and maintaining the Artemis Design System for Enchanting Travels",
    image: PLACEHOLDER_IMG,
    imageAlt: "Work preview",
    href: "#",
  },
  {
    tags: "AI, Product Design, Research",
    title:
      "Creating and maintaining the Artemis Design System for Enchanting Travels",
    image: PLACEHOLDER_IMG,
    imageAlt: "Work preview",
    href: "#",
  },
];

export default function Works() {
  return (
    <section
      id="works"
      className="bg-background flex flex-col gap-16 px-6 pt-16 pb-16 md:gap-20 md:px-10 md:pt-24 md:pb-20 lg:gap-[120px] lg:px-[120px] lg:pt-[140px] lg:pb-[100px]"
    >
      {works.map((work, i) => {
        const isReversed = i % 2 !== 0;
        return (
          <a
            key={i}
            href={work.href}
            className={`group flex flex-col gap-6 md:gap-10 lg:flex-row lg:items-center lg:gap-16 ${
              isReversed ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Text */}
            <div className="flex flex-col gap-1 lg:flex-1">
              <p className="font-brand font-medium text-[13px] lg:text-[14px] text-accent uppercase leading-[20px]">
                {work.tags}
              </p>
              <h3 className="font-heading font-normal text-[26px] leading-[1.18] tracking-[-0.52px] text-primary md:text-[30px] lg:text-[36px] lg:tracking-[-0.72px] group-hover:opacity-70 transition-opacity">
                {work.title}
              </h3>
            </div>

            {/* Image */}
            <div className="relative w-full h-[220px] rounded-xl overflow-hidden md:h-[320px] lg:flex-1 lg:h-[432px] lg:rounded-2xl">
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
    </section>
  );
}
