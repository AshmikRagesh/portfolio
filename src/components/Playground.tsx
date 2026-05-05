import { WorkCard, WorkCardItem } from "@/components/WorkCard";

const PLACEHOLDER = "/images/extra-works-card.png";

const items: WorkCardItem[] = [
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
          <WorkCard key={item.number} work={item} />
        ))}
      </div>

      {/* Desktop: two staggered tilted columns */}
      <div className="hidden lg:flex gap-[80px] items-start w-full">
        <div className="flex-1 flex flex-col gap-[60px]">
          {leftItems.map((item) => (
            <WorkCard key={item.number} work={item} />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-[60px] pt-[60px]">
          {rightItems.map((item) => (
            <WorkCard key={item.number} work={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
