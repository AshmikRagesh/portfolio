import Image from "next/image";

const PLACEHOLDER = "/images/extra-works-card.png";

interface PlaygroundItem {
  number: string;
  tags: string[];
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  rotate: "left" | "right";
}

const items: PlaygroundItem[] = [
  {
    number: "NO:01",
    tags: ["AI", "Product Design", "Research"],
    title: "AI Will Revolutionize Accessibility",
    description:
      "Building accessible digital products is tough. Right now, it requires product designers to dive deep into guidelines, run extensive user testing, and manually audit every component.",
    image: PLACEHOLDER,
    imageAlt: "AI Accessibility project preview",
    href: "#",
    rotate: "left",
  },
  {
    number: "NO:02",
    tags: ["Design Systems", "Component Library"],
    title: "Building with Design Systems at Scale",
    description:
      "Designing for scale means building systems, not screens. I explore how design tokens, component libraries, and documentation workflows unlock team velocity.",
    image: PLACEHOLDER,
    imageAlt: "Design Systems project preview",
    href: "#",
    rotate: "right",
  },
];

function PlaygroundCard({ item }: { item: PlaygroundItem }) {
  const rotateClass = item.rotate === "left" ? "-rotate-1" : "rotate-1";

  return (
    <div className="group">
      <div
        className={`${rotateClass} group-hover:rotate-0 transition-transform duration-300 ease-in-out w-full`}
      >
        <a
          href={item.href}
          className="flex flex-col gap-6 bg-[#f8f8f8] border border-[#c8ccd4] rounded-[20px] shadow-[0px_0px_6px_rgba(0,0,0,0.05)] pt-5 px-5 pb-10 transition-shadow duration-300 group-hover:shadow-[0px_4px_24px_rgba(0,0,0,0.1)] cursor-pointer"
        >
          {/* Number + Image */}
          <div className="flex flex-col gap-3 items-end">
            <span className="font-brand font-medium text-[14px] uppercase text-[#172b4d] leading-[20px] shrink-0">
              {item.number}
            </span>
            <div className="relative h-[220px] w-full rounded-[16px] overflow-hidden lg:h-[260px]">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading font-normal text-[24px] leading-[1.18] tracking-[-0.6px] text-black lg:text-[30px]">
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-1 shrink-0 pt-[3px]">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#cde4ff] text-[#091624] font-brand font-medium text-[10px] uppercase leading-[20px] px-2 py-[2px] rounded-[4px] whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <p className="font-body font-normal text-[16px] leading-[24px] text-[#717379] lg:text-[18px]">
              {item.description}
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}

const leftItems = items.filter((i) => i.rotate === "left");
const rightItems = items.filter((i) => i.rotate === "right");

export default function Playground() {
  return (
    <section
      id="playground"
      className="bg-background px-[20px] pt-[60px] pb-[60px] md:px-[60px] lg:px-[120px] lg:pt-[100px] lg:pb-[60px] flex flex-col gap-[80px] items-center"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-[14px] text-center">
        <h2 className="font-heading font-normal text-[30px] leading-[1.2] tracking-[-0.38px] text-[#091624] md:text-[34px] lg:text-[38px] lg:leading-[42px]">
          Take a look at my latest stuff
        </h2>
        <p className="font-body font-normal text-[16px] leading-[24px] tracking-[-0.5px] text-[#717379] max-w-[520px] lg:text-[20px] lg:leading-[28px] lg:tracking-[-0.9px] lg:max-w-[653px]">
          I&apos;ve been creating some exciting projects lately; check out my latest works!
        </p>
      </div>

      {/* Mobile: single column */}
      <div className="flex flex-col gap-[60px] lg:hidden w-full">
        {items.map((item) => (
          <PlaygroundCard key={item.number} item={item} />
        ))}
      </div>

      {/* Desktop: two staggered tilted columns */}
      <div className="hidden lg:flex gap-[80px] items-start w-full">
        <div className="flex-1 flex flex-col gap-[60px]">
          {leftItems.map((item) => (
            <PlaygroundCard key={item.number} item={item} />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-[60px] pt-[60px]">
          {rightItems.map((item) => (
            <PlaygroundCard key={item.number} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
