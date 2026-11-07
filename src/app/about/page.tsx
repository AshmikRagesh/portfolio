import type { Metadata } from "next";
import TornNetFrame from "@/components/about/TornNetFrame";
import {
  AirbnbPill,
  BadmintonPill,
  ChelseaSignOff,
  CodeAndAIPill,
  DesignEngineerPill,
  FootballPill,
  SelfTaughtPill,
  TravelopiaPill,
  WorkflowPill,
} from "@/components/about/Pills";

export const metadata: Metadata = {
  title: "About — Ashmik Ragesh",
};

export default function AboutPage() {
  return (
    <section className="page-container flex flex-col items-start gap-[64px] pt-[140px] pb-[96px] lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-[64px] lg:pt-[160px] lg:pb-[160px]">
      {/* Text */}
      <div className="flex w-full flex-col gap-[40px] md:gap-[48px]">
        <h1 className="font-heading text-[40px] font-normal leading-[44px] text-heading md:text-[56px] md:leading-[60px] md:tracking-[-2px]">
          Building products that <br className="hidden md:block" />
          people care about
        </h1>

        <div className="flex max-w-[600px] flex-col gap-[20px] font-body text-[16px] leading-[28px] text-secondary md:gap-[24px] md:text-[20px] md:leading-[36px]">
          <p>
            Hey, I&apos;m <span className="font-medium text-heading">Ashmik Ragesh</span>, a <SelfTaughtPill /> product
            designer with 5+ years of experience, currently working as a <DesignEngineerPill /> at{" "}
            <TravelopiaPill />. I work across design, technology and everything it takes to bring a product to life.
          </p>
          <p>
            Over time, I&apos;ve also started getting more hands-on with <CodeAndAIPill />. I helped build{" "}
            <WorkflowPill /> that lets designers build components directly in code, within their brand&apos;s design
            system. Since then, I&apos;ve been building components directly in code across Travelopia&apos;s brands,
            alongside my design work.
          </p>
          <p>
            Outside work, I run a small <AirbnbPill /> in Bangalore. I&apos;m also a big sports enthusiast,
            particularly when it comes to <FootballPill /> and <BadmintonPill />. I&apos;ve been following Chelsea for
            years, which means I&apos;ve experienced more than my fair share of emotional ups and downs. Still here,
            still supporting.
          </p>
        </div>

        <ChelseaSignOff />
      </div>

      {/* Framed photo under a grape net you can tear. Left-aligned when stacked. */}
      <TornNetFrame
        src="/images/about/ashmik-snow.jpg"
        alt="Ashmik in a winter coat and beanie, standing in snow above the clouds"
        className="w-full max-w-[360px] md:max-w-[400px] lg:sticky lg:top-[120px] lg:max-w-none lg:self-start"
      />
    </section>
  );
}
