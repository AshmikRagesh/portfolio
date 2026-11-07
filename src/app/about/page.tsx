import type { Metadata } from "next";
import TornNetFrame from "@/components/about/TornNetFrame";
import Peek from "@/components/about/Peek";
import ChelseaLine from "@/components/about/ChelseaLine";

export const metadata: Metadata = {
  title: "About — Ashmik Ragesh",
};

export default function AboutPage() {
  return (
    <section className="page-container flex flex-col items-start gap-[64px] pt-[140px] pb-[96px] lg:flex-row lg:items-center lg:justify-between lg:gap-[80px] lg:pt-[160px] lg:pb-[160px]">
      {/* Text */}
      <div className="flex w-full flex-col gap-[32px] lg:max-w-[560px]">
        <h1 className="font-heading text-[48px] font-normal leading-[52px] tracking-[-1.44px] text-heading md:text-[64px] md:leading-[68px] md:tracking-[-1.92px] lg:text-[72px] lg:leading-[76px] lg:tracking-[-2.16px]">
          Hey, I&apos;m <em className="italic text-grape">Ashmik</em>.
        </h1>
        <div className="flex flex-col gap-[16px] font-body text-lead text-secondary md:text-lead-md">
          <p>
            I&apos;m a self-taught product designer with 5+ years of experience, currently working as a
            design engineer at Travelopia. I work across design, technology and everything it takes to
            bring a product to life. I didn&apos;t get into design the conventional way, so I&apos;ve
            always enjoyed understanding how things work, getting into the details and figuring out how
            to make them better.
          </p>
          <p>
            Over time, I&apos;ve also started getting more hands-on with code and AI. I helped build{" "}
            <Peek href="/works/helix" label="Helix on Claude Code">
              a workflow
            </Peek>{" "}
            that lets designers build components directly in code, within their brand&apos;s design
            system. Since then, I&apos;ve been building components directly in code across
            Travelopia&apos;s brands, alongside my design work.
          </p>
          <p>
            Outside work, I run a small Airbnb in Bangalore. I&apos;m also a big sports enthusiast,
            particularly when it comes to football and badminton. I&apos;ve been following Chelsea for
            years, which means I&apos;ve experienced more than my fair share of emotional ups and downs.
            Still here, still supporting. <ChelseaLine />
          </p>
        </div>
      </div>

      {/* Framed picture under a grape net you can tear. Left-aligned when stacked. */}
      <TornNetFrame
        src="/images/portrait.png"
        alt="Portrait of Ashmik Ragesh"
        className="w-full max-w-[360px] shrink-0 md:max-w-[400px] lg:w-[440px] lg:max-w-none"
      />
    </section>
  );
}
