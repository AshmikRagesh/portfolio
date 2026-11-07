import type { Metadata } from "next";
import TornNetFrame from "@/components/about/TornNetFrame";

export const metadata: Metadata = {
  title: "About — Ashmik Ragesh",
};

export default function AboutPage() {
  return (
    <section className="page-container flex flex-col items-center gap-[64px] pt-[140px] pb-[96px] lg:flex-row lg:items-center lg:justify-between lg:gap-[80px] lg:pt-[160px] lg:pb-[160px]">
      {/* Text */}
      <div className="flex w-full flex-col gap-[24px] lg:max-w-[540px]">
        <p className="font-brand text-[12px] font-medium uppercase leading-[16px] tracking-[2px] text-muted">
          A bit about me
        </p>
        <h1 className="font-heading text-[36px] font-normal leading-[40px] tracking-[-0.36px] text-heading md:text-[44px] md:leading-[48px] md:tracking-[-0.44px] lg:text-[48px] lg:leading-[56px] lg:tracking-[-0.48px]">
          Design is how I think.
          <br />
          Craft is how I prove it.
        </h1>
        <p className="font-body text-[16px] leading-[24px] text-secondary md:text-[20px] md:leading-[32px]">
          Being a designer with a systems-thinking mindset, I&apos;ve always felt most at home at the
          intersection of product thinking and visual craft. I work best when I get to own the full
          journey — from early research to shipped product. Now that&apos;s my superpower.
        </p>
      </div>

      {/* Framed picture under a net you can tear */}
      <TornNetFrame
        src="/images/portrait.png"
        alt="Portrait of Ashmik Ragesh"
        className="w-full max-w-[360px] shrink-0 md:max-w-[400px] lg:w-[440px] lg:max-w-none"
      />
    </section>
  );
}
