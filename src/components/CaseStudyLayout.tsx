import Footer from "@/components/Footer";
import SectionPill, { type CaseStudySection } from "@/components/case-study/SectionPill";
import ReelPlayer, { type Reel } from "@/components/ReelPlayer";

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
      <main data-cs-main className="relative z-10 min-h-screen bg-surface pt-[88px] pb-[96px] md:pb-[128px] lg:pb-[160px]">
        {children}
      </main>
      <SectionPill sections={sections} />
      {reel && <ReelPlayer reels={[reel]} pill />}
      <Footer />
    </>
  );
}
