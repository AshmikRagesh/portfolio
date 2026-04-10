import Image from "next/image";
import { Link2 } from "lucide-react";

// TODO: Replace with your own project screenshots (Figma URLs expire 2026-04-17)
const CARD_IMG =
  "https://www.figma.com/api/mcp/asset/60030e48-5e90-4b93-a6bf-700d3e9f4fa2";

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
    <div className="group flex flex-col w-full max-w-[318px]">
      {/*
        Deck — all inner elements use percentages of the card width so
        the fan scales proportionally on any screen size.
        aspect-ratio preserves the deck height.
        mb-[-21.07%] = -67px at 318px → pulls the container up so it
        overlaps the bottom of the deck (matching the Figma design).
      */}
      <div
        className="relative w-full mb-[-21.07%]"
        style={{ aspectRatio: "318 / 270" }}
      >
        {/* Orange — back card, lifts left on hover */}
        <div className="absolute left-0 top-0 w-[92.4%] h-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,2.0,0.64,1)] group-hover:-translate-y-4 group-hover:-translate-x-1 will-change-transform">
          <div className="w-[90.7%] h-[88.5%] bg-[#f75923] rounded-[14px] -rotate-[7.06deg]" />
        </div>
        {/* Blue — middle card, lifts right on hover */}
        <div className="absolute top-[3.3%] left-[9.1%] w-[90.3%] h-[96.7%] flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,2.0,0.64,1)] group-hover:-translate-y-5 group-hover:translate-x-1 will-change-transform">
          <div className="w-[92%] h-[89.9%] bg-[#1f88f9] rounded-[14px] rotate-6" />
        </div>
        {/* Screenshot — top card, subtle lift on hover */}
        <div className="absolute top-[11.7%] left-[9.1%] w-[84.4%] h-[88.2%] rounded-[14px] overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.34,2.0,0.64,1)] group-hover:-translate-y-3 will-change-transform">
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
        Container — renders on top of the deck (z-10).
        Rounded top corners are tight (4px); rounded bottom corners are large (24px).
        Does NOT move on hover.
      */}
      <div
        className="relative z-10 flex flex-col gap-8 p-6 bg-background border border-[#c8ccd4]
          rounded-tl-[4px] rounded-tr-[4px] rounded-bl-[24px] rounded-br-[24px]
          shadow-[0px_-14px_30.8px_-3.25px_rgba(25,41,105,0.09),0px_-4.468px_9.829px_-2.438px_rgba(25,41,105,0.14),0px_-1.69px_3.718px_-1.625px_rgba(25,41,105,0.15),0px_-0.557px_1.226px_-0.813px_rgba(25,41,105,0.16)]"
      >
        {/* Inner top-edge highlight */}
        <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(9,13,51,0.1)] pointer-events-none" />

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h3 className="font-heading font-medium text-[26px] leading-[1.18] tracking-[-0.3px] text-heading">
            {item.title}
          </h3>
          <p className="font-body font-normal text-[16px] leading-[22px] text-[rgba(9,13,51,0.7)]">
            {item.description}
          </p>
        </div>

        {/* CTA */}
        <a
          href={item.href}
          className="flex items-center justify-center gap-2 bg-[#172b4d] text-background font-brand font-medium text-[18px] tracking-[-0.09px] h-[50px] rounded-[10px] w-full transition-colors duration-200 hover:bg-[#0049c4]"
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
