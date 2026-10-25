import Footer from "@/components/Footer";
import SectionPill, { type CaseStudySection } from "@/components/case-study/SectionPill";

export type { CaseStudySection };

interface CaseStudyLayoutProps {
  sections: CaseStudySection[];
  children: React.ReactNode;
}

export default function CaseStudyLayout({ sections, children }: CaseStudyLayoutProps) {
  return (
    <>
      {/* Top padding clears the ruler and navbar; bottom padding leaves room for the bell
          sitting on the footer */}
      <main data-cs-main className="relative z-10 min-h-screen bg-surface pt-[88px] pb-[72px] md:pb-[112px]">
        {children}
      </main>
      <SectionPill sections={sections} />
      <Footer />
    </>
  );
}
