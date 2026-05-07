import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <section
      id="about"
      className="bg-background px-[20px] py-[60px] md:px-[60px] lg:px-[120px] lg:pt-[60px] lg:pb-[100px]"
    >
      <div className="bg-vanilla rounded-[28px] p-8 flex flex-col gap-8 lg:p-14 lg:gap-12">

        {/* Label */}
        <p className="font-brand font-medium text-[12px] uppercase tracking-[1.5px] text-muted">
          A bit about me
        </p>

        {/* Headline */}
        <h2 className="font-heading font-normal text-[34px] leading-[1.15] tracking-[-0.68px] text-heading lg:text-[54px] lg:leading-[1.08] lg:tracking-[-1.08px]">
          Design is how I think.<br />
          Craft is how I prove it.
        </h2>

        {/* Content row */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-[80px]">

          {/* Photo */}
          <div className="relative w-full h-[260px] rounded-[16px] overflow-hidden shrink-0 lg:w-[320px] lg:h-[300px]">
            <Image
              src="/images/portrait.png"
              alt="Ashmik Ragesh"
              fill
              className="object-cover object-top"
            />
          </div>

          {/* Text + CTA */}
          <div className="flex flex-col gap-8">
            <p className="font-body font-normal text-[16px] leading-[26px] text-secondary lg:text-[18px] lg:leading-[30px]">
              Being a designer with a systems-thinking mindset, I&apos;ve always felt most at home at the intersection of product thinking and visual craft. I work best when I get to own the full journey — from early research to shipped product. Now that&apos;s my superpower.
            </p>
            <Link
              href="#"
              className="self-start bg-blackcurrant text-white font-brand font-medium text-[13px] tracking-[0.2px] px-5 py-[10px] rounded-full transition-colors duration-200 hover:bg-grape whitespace-nowrap"
            >
              Learn more about Ashmik
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
