"use client";

import SectionPill, { type CaseStudySection } from "@/components/case-study/SectionPill";
import { FeedbackButton, FeedbackLayer, FeedbackProvider, useFeedbackOn } from "@/components/case-study/Feedback";

/** The bottom dock of a case study: the section pill, the feedback button beside it, and feedback mode. */
export default function CaseStudyDock({ sections }: { sections: CaseStudySection[] }) {
  return (
    <FeedbackProvider>
      <Pill sections={sections} />
      <FeedbackLayer sections={sections} />
    </FeedbackProvider>
  );
}

function Pill({ sections }: { sections: CaseStudySection[] }) {
  const on = useFeedbackOn();
  return <SectionPill sections={sections} trailing={<FeedbackButton />} keepVisible={on} />;
}
