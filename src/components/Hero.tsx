import Image from "next/image";

const PORTRAIT_SRC = "/images/portrait.png";

export default function Hero() {
  return (
    <section className="bg-background flex flex-col items-center gap-[60px] px-[20px] pt-[140px] pb-[60px] md:px-[60px] md:pt-[140px] md:pb-[60px] lg:px-[240px] lg:pt-[144px] lg:pb-[60px]">
      {/* Text */}
      <div className="flex flex-col items-center gap-6 text-center w-full">
        <h1 className="font-heading font-normal text-[36px] leading-[40px] tracking-[-0.36px] text-heading whitespace-normal md:text-[44px] md:leading-[50px] md:tracking-[-0.44px] lg:text-[48px] lg:leading-[50px] lg:tracking-[-0.48px] lg:whitespace-pre-wrap">
          {`Hi, I'm `}
          <em>Ashmik Ragesh</em>
          {`,\ncreator that designs for creators.`}
        </h1>
        <p className="font-body font-normal text-[18px] leading-[26px] text-muted w-full md:text-[20px] md:leading-[28px] md:max-w-[653px] lg:text-[20px] lg:leading-[28px] lg:max-w-[653px]">
          Designing for the world. I care about systems that scale and
          the small details that make them feel human.
        </p>
      </div>

      {/* Portrait */}
      <Image
        src={PORTRAIT_SRC}
        alt="Portrait of Ashmik Ragesh"
        width={296}
        height={528}
        className="w-[220px] h-auto md:w-[260px] lg:w-[296px]"
      />
    </section>
  );
}
