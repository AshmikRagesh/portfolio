import type { Metadata } from "next";
import Link from "next/link";
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
          Hey, I&apos;m Ashmik.
        </h1>
        <div className="flex flex-col gap-[16px] font-body text-[16px] leading-[24px] text-secondary md:text-[20px] md:leading-[32px]">
          <p>
            I&apos;m a self-taught product designer with 5+ years of experience, currently a design
            engineer at Travelopia, working across design, technology and everything it takes to bring
            a product to life. I didn&apos;t come into design the usual way, so I like knowing how things
            work, getting into the details and making them better.
          </p>
          <p>
            Lately, that means designing with code and AI. I helped start{" "}
            <Link href="/works/helix" className="text-heading underline decoration-muted/40 underline-offset-[4px] hover:decoration-heading">
              Helix on Claude Code
            </Link>
            , which lets designers build components in code, inside each brand&apos;s design system. And
            I built{" "}
            <Link href="/works/bella" className="text-heading underline decoration-muted/40 underline-offset-[4px] hover:decoration-heading">
              Bella
            </Link>
            , the desk bell keeping you company up top, the same way.
          </p>
          <p>
            Outside work, I run a small Airbnb in Bangalore and follow anything competitive: football,
            badminton, you name it. Chelsea till God calls upon my name. 💙
          </p>
        </div>
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
