import Image from "next/image";
import { Link2 } from "lucide-react";

// TODO: Replace with your own project screenshots (Figma URLs expire 2026-04-07)
const CARD_IMG =
  "https://www.figma.com/api/mcp/asset/0c0d9df1-40db-4eaf-8713-a16365f6a8fe";

interface PlaygroundItem {
  title: string;
  description: string;
  image: string;
  buttonLabel: string;
  href: string;
}

const items: PlaygroundItem[] = [
  {
    title: "Best of Figma",
    description: "Grab your free mix-and-match illustration pack!",
    image: CARD_IMG,
    buttonLabel: "Check Figma",
    href: "#",
  },
  {
    title: "Best of Figma",
    description: "Grab your free mix-and-match illustration pack!",
    image: CARD_IMG,
    buttonLabel: "Check Figma",
    href: "#",
  },
];

function ProductCard({ item }: { item: PlaygroundItem }) {
  return (
    // group — coordinates hover between deck and button
    <div className="group flex flex-col w-full max-w-[318px]">

      {/*
        Deck — sits first in DOM so it renders BEHIND the container.
        mb-[-67px] pulls the container up so the container covers the
        bottom portion of the deck. Only the top ~200px peeks above.
        Each card moves in a different direction on hover with a spring bounce.
        Container stays fixed.
      */}
      <div className="relative h-[270px] w-full mb-[-67px]">
        {/* Orange card — fans left + slightly down on hover */}
        <div className="absolute inset-0 flex items-center justify-center w-[294px] transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-x-2 group-hover:translate-y-1 will-change-transform">
          <div className="w-[267px] h-[239px] bg-[#f75923] rounded-[14px] -rotate-[7.06deg]" />
        </div>
        {/* Blue card — fans right + slightly up on hover */}
        <div className="absolute top-[9px] left-[29px] flex items-center justify-center w-[287px] h-[261px] transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-2 group-hover:-translate-y-1 will-change-transform">
          <div className="w-[264px] h-[234px] bg-[#1f88f9] rounded-[14px] rotate-6" />
        </div>
        {/* Screenshot card — lifts straight up on hover */}
        <div className="absolute top-[31px] left-[29px] w-[268px] h-[238px] rounded-[14px] overflow-hidden transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-2 will-change-transform">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      {/*
        Container — second in DOM so it naturally renders ON TOP of the deck.
        z-10 makes this explicit and safe during deck's transform animation.
        Container does NOT move on hover.
      */}
      <div className="relative z-10 flex flex-col gap-10 p-6 bg-background border border-[#c8ccd4]
        rounded-tl-[4px] rounded-tr-[4px] rounded-bl-[24px] rounded-br-[24px]
        shadow-[0px_-14px_30.8px_-3.25px_rgba(25,41,105,0.09),0px_-4.468px_9.829px_-2.438px_rgba(25,41,105,0.14),0px_-1.69px_3.718px_-1.625px_rgba(25,41,105,0.15),0px_-0.557px_1.226px_-0.813px_rgba(25,41,105,0.16)]">
        {/* Inner top-edge highlight */}
        <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(9,13,51,0.1)] pointer-events-none" />

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h3 className="font-ui font-bold text-[26px] leading-[1.18] tracking-[-0.3px] text-heading">
            {item.title}
          </h3>
          <p className="font-body font-normal text-[16px] leading-[22px] text-[rgba(9,13,51,0.7)]">
            {item.description}
          </p>
        </div>

        {/* CTA button — only the button has its own hover state */}
        <a
          href={item.href}
          className="flex items-center justify-center gap-3 bg-primary text-background font-ui font-medium text-[18px] tracking-[-0.09px] h-[50px] rounded-[10px] w-full transition-opacity duration-200 hover:opacity-70"
        >
          <Link2 size={22} strokeWidth={1.5} />
          {item.buttonLabel}
        </a>
      </div>
    </div>
  );
}

export default function Playground() {
  return (
    <section
      id="playground"
      className="bg-background flex flex-col items-center gap-16 px-6 pt-16 pb-12 md:gap-20 md:px-10 md:pt-20 md:pb-16 lg:gap-[100px] lg:px-[240px] lg:pt-[100px] lg:pb-[60px]"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-heading font-normal text-[26px] leading-[1.22] tracking-[-0.26px] text-heading md:text-[30px] lg:text-[36px] lg:leading-[44px] lg:tracking-[-0.36px]">
          Take a look at my latest stuff
        </h2>
        <p className="font-body text-[15px] leading-[24px] tracking-[-0.5px] text-muted max-w-[320px] md:max-w-[420px] lg:text-[18px] lg:leading-[26px] lg:tracking-[-0.9px] lg:max-w-[510px]">
          I help startups turn big ideas into designs that actually work.
          Whether you need an MVP that converts or a pitch deck that closes
          funding, I focus on results over pretty pixels.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col items-center gap-20 md:flex-row md:justify-center md:items-start md:gap-10 lg:gap-[60px]">
        {items.map((item, i) => (
          <ProductCard key={i} item={item} />
        ))}
      </div>
    </section>
  );
}
