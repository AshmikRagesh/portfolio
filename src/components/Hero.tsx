import Image from "next/image";

// TODO: Replace with a permanent portrait asset (Figma URL expires ~7 days from 2026-04-09)
const PORTRAIT_SRC =
  "https://www.figma.com/api/mcp/asset/95d75a7c-dfb2-4409-86f7-b250fe5e5b2c";

export default function Hero() {
  return (
    <section className="bg-background flex flex-col items-center gap-10 px-6 pb-12 pt-[96px] md:gap-14 md:px-10 md:pt-[112px] md:pb-16 lg:gap-[60px] lg:px-[240px] lg:pt-[144px] lg:pb-[60px]">
      {/* Text */}
      <div className="flex flex-col items-center gap-4 text-center w-full md:gap-5 lg:gap-6">
        <h1 className="font-heading font-normal text-[30px] leading-[36px] tracking-[-0.3px] text-heading whitespace-normal md:text-[38px] md:leading-[44px] md:tracking-[-0.38px] lg:text-[48px] lg:leading-[50px] lg:tracking-[-0.48px] lg:whitespace-pre-wrap">
          {`Hi, I'm `}
          <em>Ashmik Ragesh</em>
          {`,\ncreator that designs for creators.`}
        </h1>
        <p className="font-body font-normal text-[15px] leading-[22px] tracking-[-0.3px] text-muted max-w-[320px] md:text-[18px] md:leading-[26px] md:tracking-[-0.5px] md:max-w-[480px] lg:text-[20px] lg:leading-[28px] lg:tracking-normal lg:max-w-[653px]">
          Designing for the world. I care about systems that scale and
          the small details that make them feel human.
        </p>
      </div>

      {/* Portrait */}
      <div className="relative overflow-hidden w-[280px] h-[290px] md:w-[380px] md:h-[392px] lg:w-[502px] lg:h-[514px]">
        <Image
          src={PORTRAIT_SRC}
          alt="Portrait of Ashmik Ragesh"
          width={542}
          height={542}
          className="absolute left-[-4%] top-[-2.71%] w-[108%] max-w-none"
          unoptimized
        />
      </div>
    </section>
  );
}
