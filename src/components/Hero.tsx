import Image from "next/image";
import TripsBook from "./hero/book/TripsBook";
import NivasaMedal from "./hero/NivasaMedal";
import GithubWidget from "./hero/GithubWidget";
import ChelseaBadge from "./hero/ChelseaBadge";
import Tossed from "./hero/Tossed";

const PORTRAIT_SRC = "/images/portrait-sketch-glasses.webp";

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
            width={1908}
            height={2000}
            priority
            className="absolute inset-0 h-full w-full object-contain object-bottom mix-blend-multiply [filter:brightness(1.025)_contrast(1.02)]"
          />
        </div>
        {/* The desk objects, always beside the portrait. Left: the trips book over the
            Chelsea pin. Right: the GitHub card over the Superhost medal. On a phone the
            book and the GitHub card sit at the shoulders and the pin and the medal just
            under the portrait. Each can be picked up and moved (Tossed). */}
        <Tossed rotate={-6} delay={0} className="absolute left-[-32px] top-[-8px] z-10 md:left-[-112px] md:top-[8px] lg:left-[-188px] lg:top-[8px]">
          <TripsBook className="w-[112px] md:w-[152px] lg:w-[200px]" />
        </Tossed>
        <Tossed rotate={4} delay={110} className="absolute right-[-32px] top-0 z-10 md:right-[-120px] md:top-[44px] lg:right-[-196px] lg:top-[52px]">
          <GithubWidget className="w-[140px] md:w-[176px] lg:w-[224px]" />
        </Tossed>
        <div className="relative z-10 -mt-14 flex w-full items-start justify-between px-6 md:contents">
          <Tossed rotate={-6} delay={220} className="md:absolute md:left-[-88px] md:top-[296px] lg:left-[-136px] lg:top-[300px]">
            <ChelseaBadge className="w-[68px] md:w-[88px] lg:w-[112px]" />
          </Tossed>
          <Tossed rotate={5} delay={330} className="md:absolute md:right-[-88px] md:top-[280px] lg:right-[-136px] lg:top-[292px]">
            <NivasaMedal className="w-[68px] md:w-[88px] lg:w-[112px]" />
          </Tossed>
        </div>
      </div>
    </section>
  );
}
