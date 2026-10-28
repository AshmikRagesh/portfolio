import { FeaturedCard } from "@/components/Works";
import { nextWork, roomFor } from "@/content/works";

/**
 * The end of every case study: a small "Next case study" label over the homepage's own
 * work card for whichever case study comes next on the homepage.
 */
export default function NextCase({ current }: { current: string }) {
  const work = nextWork(current);
  return (
    <section className="cs-chapter" aria-labelledby="next-case-study">
      <div className="cs-column">
        <p id="next-case-study" className="mb-[24px] font-brand text-[12px] uppercase leading-[16px] text-muted">
          Next case study
        </p>
      </div>
      <div className="cs-visual !mt-0">
        <FeaturedCard work={work} room={roomFor(work)} />
      </div>
    </section>
  );
}
