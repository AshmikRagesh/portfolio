import Footer from "@/components/Footer";
import { type CaseStudySection } from "@/components/case-study/SectionPill";
import CaseStudyDock from "@/components/case-study/CaseStudyDock";
import ReelPlayer, { type Reel } from "@/components/ReelPlayer";
import CaseStudyTracker from "@/components/bella/CaseStudyTracker";
import RevealOnScroll from "@/components/case-study/RevealOnScroll";

export type { CaseStudySection, Reel };

interface CaseStudyLayoutProps {
  sections: CaseStudySection[];
  /** The case study's walkthrough video, floating over the page */
  reel?: Reel;
  children: React.ReactNode;
}

export default function CaseStudyLayout({ sections, reel, children }: CaseStudyLayoutProps) {
  return (
    <>
      {/* Top padding clears the ruler and navbar; bottom padding leaves room for the bell
          sitting on the footer */}
      <main data-cs-main className="relative z-10 min-h-screen bg-surface pt-[88px] pb-[96px] md:pb-[128px] lg:pb-[200px]">
        {children}
      </main>
      {/* Every block rises in once as it's read */}
      <RevealOnScroll />
      {/* Section pill, the feedback button beside it, and feedback mode */}
      <CaseStudyDock sections={sections} />
      {/* Room keys and where the reader is, for Bella */}
      <CaseStudyTracker sections={sections} />
      {/* Tablet and desktop only; on a phone it would cover the reading */}
      {reel && <ReelPlayer reels={[reel]} pill desktopOnly />}
      <Footer />
    </>
  );
}
