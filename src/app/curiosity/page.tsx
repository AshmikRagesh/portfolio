import type { Metadata } from "next";
import Link from "next/link";

// ── /curiosity ────────────────────────────────────────────────────────────────
// A plain note on what the front-desk bell measures and what gets stored. Linked
// from the footer. Keep it in step with src/lib/curiosity/store.ts.

export const metadata: Metadata = {
  title: "What the bell measures · Ashmik Ragesh",
  description: "What the front-desk bell measures and what is stored.",
};

const points = [
  "It counts active time only. The clock pauses when the tab is hidden, or after 30 seconds without scrolling, typing, tapping or moving the pointer.",
  "Your browser gets a random ID so return visits can add up. It lives in your browser's local storage and is not linked to you.",
  "No names, cookies or IP addresses are stored.",
  "Each visit also saves the page you were on, the site you came from (domain only) and a screen size bucket: mobile, tablet or desktop.",
  "Visit records are deleted after 90 days. The longest visits are kept as plain numbers for the record.",
];

export default function CuriosityPage() {
  return (
    <main className="page-container section-spacing pb-[96px] md:pb-[128px]">
      <div className="max-w-[640px] flex flex-col gap-6 md:gap-8">
        <h1 className="font-heading font-medium text-h2 text-heading md:text-h2-md lg:text-h2-lg">
          What the bell measures
        </h1>
        <p className="text-lead text-secondary md:text-lead-md lg:text-lead-lg">
          The bell in the top corner keeps time while you read. That time is the only thing it measures.
        </p>
        <ul className="flex flex-col gap-4 text-body text-secondary md:text-body-md lg:text-body-lg">
          {points.map((point) => (
            <li key={point} className="flex gap-3">
              <span aria-hidden className="mt-[10px] size-[6px] shrink-0 rounded-full bg-grape" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <Link href="/" className="font-brand text-body text-grape underline underline-offset-4 hover:text-primary w-fit">
          Back to the portfolio
        </Link>
      </div>
    </main>
  );
}
