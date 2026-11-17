"use client";

import SectionPill, { type CaseStudySection } from "@/components/case-study/SectionPill";
import { FeedbackButton, FeedbackLayer, FeedbackProvider, useFeedbackOn } from "@/components/case-study/Feedback";
import FeedbackReview from "@/components/case-study/FeedbackReview";

/** The bottom dock of a case study: the section pill, the feedback button beside it, and feedback mode. */
export default function CaseStudyDock({ sections, imagesEnabled }: { sections: CaseStudySection[]; imagesEnabled: boolean }) {
  return (
    <FeedbackProvider imagesEnabled={imagesEnabled}>
      <Pill sections={sections} />
      <FeedbackLayer sections={sections} />
      {/* "Show on page" from the feedback board */}
      <FeedbackReview />
    </FeedbackProvider>
  );
}

function Pill({ sections }: { sections: CaseStudySection[] }) {
  const on = useFeedbackOn();
  return <SectionPill sections={sections} trailing={<FeedbackButton />} keepVisible={on} />;
}
