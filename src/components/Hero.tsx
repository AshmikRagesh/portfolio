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
        {/* The desk objects, always beside the portrait. Left: the trips book over the
            Chelsea pin. Right: the GitHub card over the Superhost medal. On a phone the
            book and the GitHub card sit at the shoulders and the pin and the medal just
            under the portrait. Each can be picked up and moved (Tossed). */}
        <Tossed rotate={-6} delay={0} className="absolute left-[-44px] top-[-8px] z-10 md:left-[-128px] md:top-[8px] lg:left-[-264px] lg:top-0">
          <TripsBook className="w-[112px] md:w-[152px] lg:w-[200px]" />
        </Tossed>
        <Tossed rotate={4} delay={110} className="absolute right-[-44px] top-0 z-10 md:right-[-136px] md:top-[40px] lg:right-[-272px] lg:top-[48px]">
          <GithubWidget className="w-[140px] md:w-[176px] lg:w-[224px]" />
        </Tossed>
        <div className="relative z-10 -mt-12 flex w-full items-start justify-between px-3 md:contents">
          <Tossed rotate={-6} delay={220} className="md:absolute md:left-[-100px] md:top-[300px] lg:left-[-196px] lg:top-[320px]">
            <ChelseaBadge className="w-[64px] md:w-[80px] lg:w-[104px]" />
          </Tossed>
          <Tossed rotate={5} delay={330} className="md:absolute md:right-[-108px] md:top-[256px] lg:right-[-200px] lg:top-[268px]">
            <NivasaMedal className="w-[76px] md:w-[96px] lg:w-[124px]" />
          </Tossed>
        </div>
      </div>
    </section>
  );
}
