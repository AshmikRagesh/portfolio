// ── Hero variation: split ─────────────────────────────────────────────────────
// The same hero, laid out in two columns on a wide screen: the heading and the
// description on the left, left aligned; the portrait on the right with the four desk
// objects scattered round it. Below 1024px it stacks (text first, left aligned) and the
// objects sit round the portrait as they do on the live hero.
// A trial only: the live hero (components/Hero.tsx) is unchanged.

import Image from "next/image";
import TripsBook from "@/components/hero/book/TripsBook";
import NivasaMedal from "@/components/hero/NivasaMedal";
import GithubWidget from "@/components/hero/GithubWidget";
import ChelseaBadge from "@/components/hero/ChelseaBadge";
import Tossed from "@/components/hero/Tossed";

const PORTRAIT_SRC = "/images/portrait-sketch-glasses.webp";

export default function HeroSplit() {
  return (
    <section className="page-container bg-background pt-[120px] lg:pt-[144px]">
      <div className="flex flex-col gap-[56px] lg:grid lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-[40px]">
        {/* Text */}
        <div className="flex w-full flex-col items-start gap-6 text-left lg:max-w-[500px]">
          <h1 className="font-heading text-[36px] font-normal leading-[40px] tracking-[-0.36px] text-heading md:text-[44px] md:leading-[48px] md:tracking-[-0.44px] lg:text-[48px] lg:leading-[56px] lg:tracking-[-0.48px]">
            I&apos;m Ashmik, Design Engineer who ships with vision.
          </h1>
          <p className="font-body text-[16px] font-normal leading-[24px] text-secondary md:max-w-[560px] md:text-[20px] md:leading-[32px]">
            I make data-heavy products easy to understand—and build working prototypes so teams can try an idea before they commit to it.
          </p>
        </div>

        {/* Portrait and the desk objects */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative flex w-[80%] flex-col items-center md:w-auto lg:mr-[72px]">
            <div className="relative aspect-[502/514] w-full overflow-hidden md:h-[514px] md:w-[502px] md:aspect-auto lg:h-[440px] lg:w-[430px]">
              <Image
                src={PORTRAIT_SRC}
                alt="Portrait of Ashmik Ragesh"
                width={1908}
                height={2000}
                priority
                className="absolute inset-0 h-full w-full object-contain object-bottom mix-blend-multiply [filter:brightness(1.025)_contrast(1.02)]"
              />
            </div>
            {/* Wide screen: book top left, leaning in from the text column; GitHub top right;
                the pin low on the left; the medal low on the right */}
            <Tossed rotate={-6} delay={0} className="absolute left-[-44px] top-[-8px] z-10 md:left-[-128px] md:top-[8px] lg:left-[-132px] lg:top-[-24px]">
              <TripsBook className="w-[112px] md:w-[152px] lg:w-[168px]" />
            </Tossed>
            <Tossed rotate={4} delay={110} className="absolute right-[-44px] top-[-8px] z-10 md:right-[-128px] md:top-[8px] lg:right-[-132px] lg:top-[-24px]">
              <GithubWidget className="w-[112px] md:w-[152px] lg:w-[168px]" />
            </Tossed>
            <div className="relative z-10 -mt-12 flex w-full items-start justify-between px-3 md:contents">
              <Tossed rotate={-6} delay={220} className="md:absolute md:left-[-100px] md:top-[300px] lg:left-[-96px] lg:top-[268px]">
                <ChelseaBadge className="w-[64px] md:w-[80px] lg:w-[92px]" />
              </Tossed>
              <Tossed rotate={5} delay={330} className="md:absolute md:right-[-108px] md:top-[300px] lg:right-[-124px] lg:top-[268px]">
                <NivasaMedal className="w-[76px] md:w-[96px] lg:w-[112px]" />
              </Tossed>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
