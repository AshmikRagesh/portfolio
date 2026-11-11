import type { Metadata } from "next";
import Footer from "@/components/Footer";
import TornNetFrame from "@/components/about/TornNetFrame";
import ToolPin from "@/components/about/ToolPin";
import Tossed from "@/components/hero/Tossed";
import { Highlight } from "@/components/case-study/Marks";
import {
  AirbnbPill,
  BadmintonPill,
  ChelseaLine,
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
    <>
      {/* Clipped at the window's edge, not the content's, so the pin and medal beside the frame
          (which can be dragged anywhere) never get cut off inside the page. The footer follows,
          as on every page. */}
      <div className="relative z-10 w-full overflow-x-clip bg-background">
        <section className="page-container flex flex-col items-start gap-[64px] pt-[140px] pb-[120px] md:gap-[80px] xl:grid xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)] xl:items-start xl:gap-[104px] lg:pt-[160px] lg:pb-[200px]">
          {/* Text — the frame beside it stands exactly as tall as this */}
          <div id="about-text" className="flex w-full flex-col gap-[40px] md:gap-[48px]">
            <h1 className="font-heading text-[40px] font-normal leading-[44px] text-heading md:text-[56px] md:leading-[60px] md:tracking-[-2px]">
              Building products that <br className="hidden md:block" />
              people care about
            </h1>
    
            <div className="flex max-w-[600px] flex-col gap-[20px] font-body text-[16px] leading-[28px] text-secondary md:gap-[24px] lg:gap-[20px] md:text-[18px] md:leading-[30px]">
              <p>
                Hey, I&apos;m <Highlight>
                  <span className="font-medium text-heading">Ashmik Ragesh</span>
                </Highlight>, a <SelfTaughtPill /> product
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
                particularly when it comes to <FootballPill /> and <BadmintonPill />. <ChelseaLine />
              </p>
            </div>
          </div>
    
          {/* Framed photo under a grape net you can tear. Left-aligned when stacked. */}
          <TornNetFrame
            src="/images/about/ashmik-snow.jpg"
            alt="Ashmik in a winter coat and beanie, standing in snow above the clouds"
            matchHeightOf="about-text"
            className="w-full max-w-[360px] md:max-w-[440px] xl:max-w-none xl:justify-self-end"
          >
            {/* Beside the frame, outside it: enamel pins of the tools I build with. Figma off the
                top-left corner, Cursor off the right edge, Claude off the bottom-right. On a phone
                there's no room beside it, so they hang just over the corners. Each can be picked
                up and moved, as in the hero. */}
            <Tossed rotate={-8} delay={200} className="absolute -left-2 -top-8 z-20 md:-left-[72px] md:top-2 xl:-left-[92px] xl:top-[72px]">
              <ToolPin tool="figma" className="w-[56px] md:w-[64px] xl:w-[80px]" />
            </Tossed>
            <Tossed rotate={6} delay={320} className="absolute -right-2 top-[36%] z-20 md:-right-[72px] xl:-right-[88px]">
              <ToolPin tool="cursor" className="w-[48px] md:w-[56px] xl:w-[64px]" />
            </Tossed>
            <Tossed rotate={-4} delay={440} className="absolute -bottom-8 -right-2 z-20 md:-right-[80px] md:bottom-10 xl:-right-[96px]">
              <ToolPin tool="claude" className="w-[56px] md:w-[64px] xl:w-[80px]" />
            </Tossed>
          </TornNetFrame>
        </section>
      </div>
      <Footer />
    </>
  );
}
