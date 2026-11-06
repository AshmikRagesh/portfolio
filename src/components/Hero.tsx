import Image from "next/image";
import TripsBook from "./hero/book/TripsBook";
import NivasaMedal from "./hero/NivasaMedal";
import GithubWidget from "./hero/GithubWidget";
import ChelseaBadge from "./hero/ChelseaBadge";
import Tossed from "./hero/Tossed";

const PORTRAIT_SRC = "/images/portrait-sketch.png";

export default function Hero() {
  return (
    <section className="page-container bg-background flex flex-col items-center gap-[60px] pt-[140px] lg:pt-[144px]">
      {/* Text */}
      <div className="flex flex-col items-center gap-6 text-center w-full">
        <h1 className="font-heading font-normal text-[36px] leading-[40px] tracking-[-0.36px] text-heading whitespace-normal md:text-[44px] md:leading-[48px] md:tracking-[-0.44px] lg:text-[48px] lg:leading-[56px] lg:tracking-[-0.48px] lg:whitespace-pre-wrap">
          {`I'm Ashmik, Design Engineer\nwho ships with vision.`}
        </h1>
        <p className="font-body font-normal text-[16px] leading-[24px] text-secondary w-full md:text-[20px] md:leading-[32px] md:max-w-[652px] lg:text-[20px] lg:leading-[32px] lg:max-w-[652px]">
          I make data-heavy products easy to understand—and build working
          prototypes so teams can try an idea before they commit to it.
        </p>
      </div>

      {/* Portrait, with the desk objects around it: beside it on a wide screen, in a
          row underneath on smaller ones. The wrapper is the portrait's own width, so the
          objects are placed against the portrait itself */}
      <div className="relative flex w-[80%] flex-col items-center md:w-auto">
        {/* Portrait */}
        <div className="relative overflow-hidden w-full aspect-[502/514] md:w-[502px] md:h-[514px] md:aspect-auto lg:w-[502px] lg:h-[514px]">
          <Image
            src={PORTRAIT_SRC}
            alt="Portrait of Ashmik Ragesh"
            width={2048}
            height={2076}
            className="absolute left-[-4%] top-[-2.71%] w-[108%] max-w-none"
          />
        </div>
        {/* The desk objects. Always beside the portrait: on tablet and up all four sit
            round it, two each side; on a phone the book and the medal sit at its
            shoulders and the GitHub card and the lion just under it. Sizes step down
            with the screen so they never crowd the face. */}
        <Tossed rotate={-7} delay={0} className="absolute left-[-40px] top-[2%] z-10 md:left-[-104px] md:top-[24px] lg:left-[-232px] lg:top-[36px]">
          <TripsBook className="w-[76px] md:w-[104px] lg:w-[156px]" />
        </Tossed>
        <Tossed rotate={5} delay={110} className="absolute right-[-34px] top-[4%] z-10 md:right-[-104px] md:top-[20px] lg:right-[-184px] lg:top-[24px]">
          <NivasaMedal className="w-[54px] md:w-[84px] lg:w-[112px]" />
        </Tossed>
        <div className="relative z-10 -mt-6 flex w-full items-start justify-between px-2 md:contents">
          <Tossed rotate={4} delay={220} className="md:absolute md:left-[-104px] md:top-[296px] lg:left-[-252px] lg:top-[336px]">
            <GithubWidget className="w-[148px] md:w-[136px] lg:w-[200px]" />
          </Tossed>
          <Tossed rotate={-6} delay={330} className="mr-4 md:absolute md:right-[-96px] md:top-[296px] md:mr-0 lg:right-[-176px] lg:top-[318px]">
            <ChelseaBadge className="w-[52px] md:w-[64px] lg:w-[88px]" />
          </Tossed>
        </div>
      </div>
    </section>
  );
}
