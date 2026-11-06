import Image from "next/image";
import TripsBook from "./hero/book/TripsBook";
import NivasaMedal from "./hero/NivasaMedal";
import GithubWidget from "./hero/GithubWidget";
import ChelseaBadge from "./hero/ChelseaBadge";

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
          row underneath on smaller ones */}
      <div className="relative flex w-full flex-col items-center lg:w-auto">
        {/* Portrait */}
        <div className="relative overflow-hidden w-[80%] aspect-[502/514] md:w-[502px] md:h-[514px] md:aspect-auto lg:w-[502px] lg:h-[514px]">
          <Image
            src={PORTRAIT_SRC}
            alt="Portrait of Ashmik Ragesh"
            width={2048}
            height={2076}
            className="absolute left-[-4%] top-[-2.71%] w-[108%] max-w-none"
          />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 lg:contents">
          <div className="lg:absolute lg:left-[-232px] lg:top-[24px]">
            <TripsBook width={152} />
          </div>
          <div className="lg:absolute lg:left-[-268px] lg:top-[312px]">
            <GithubWidget />
          </div>
          <div className="lg:absolute lg:right-[-196px] lg:top-[8px]">
            <NivasaMedal className="w-[112px]" />
          </div>
          <div className="lg:absolute lg:right-[-204px] lg:top-[296px]">
            <ChelseaBadge className="w-[92px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
