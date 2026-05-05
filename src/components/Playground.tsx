import Image from "next/image";

const PLACEHOLDER = "/images/extra-works-card.png";

interface ExtraWork {
  tags: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  imageRight: boolean;
}

const items: ExtraWork[] = [
  {
    tags: "AI, Product Design, Research",
    title: "AI Will Revolutionize Accessibility",
    description:
      "Building accessible digital products is tough. Right now, it requires product designers to dive deep into guidelines, run extensive user testing, and manually audit every component.",
    image: PLACEHOLDER,
    imageAlt: "AI Accessibility project preview",
    href: "#",
    imageRight: true,
  },
  {
    tags: "Design Systems, Component Library",
    title: "Building with Design Systems at Scale",
    description:
      "Designing for scale means building systems, not screens. I explore how design tokens, component libraries, and documentation workflows unlock team velocity.",
    image: PLACEHOLDER,
    imageAlt: "Design Systems project preview",
    href: "#",
    imageRight: false,
  },
];

export default function Playground() {
  return (
    <section
      id="playground"
      className="bg-background flex flex-col gap-[120px] items-center px-[20px] pt-[60px] pb-[60px] md:px-[60px] lg:px-[120px] lg:pt-[100px] lg:pb-[60px]"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-[14px] text-center">
        <h2 className="font-heading font-normal text-[30px] leading-[1.2] tracking-[-0.38px] text-[#091624] md:text-[34px] lg:text-[38px] lg:leading-[42px]">
          Take a look at my latest stuff
        </h2>
        <p className="font-body font-normal text-[16px] leading-[24px] tracking-[-0.5px] text-[#717379] max-w-[520px] lg:text-[20px] lg:leading-[28px] lg:tracking-[-0.9px] lg:max-w-[653px]">
          I've been creating some exciting projects lately; check out my latest works!
        </p>
      </div>

      {/* Alternating rows */}
      <div className="flex flex-col gap-[60px] w-full lg:gap-[80px]">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className={`group flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-[64px] ${
              !item.imageRight ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Text */}
            <div className="flex flex-col gap-2 lg:flex-1">
              <p className="font-brand font-normal text-[14px] uppercase text-[#0049c4] leading-[20px]">
                {item.tags}
              </p>
              <div className="flex flex-col gap-3">
                <h3 className="font-heading font-normal text-[28px] leading-[1.18] tracking-[-0.56px] text-black md:text-[32px] lg:text-[36px] lg:tracking-[-0.72px] group-hover:opacity-70 transition-opacity duration-200">
                  {item.title}
                </h3>
                <p className="font-body font-normal text-[16px] leading-[24px] text-[#717379] lg:text-[20px] lg:leading-[26px]">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative w-full h-[260px] rounded-[16px] overflow-hidden lg:flex-1 lg:h-[432px]">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
