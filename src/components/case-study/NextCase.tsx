import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeaturedCard } from "@/components/Works";
import { nextWorks, roomFor } from "@/content/works";

/**
 * The end of every case study: the next two case studies on the homepage, side by side as
 * the homepage's own work cards (in their "standard" shape, keys and room numbers kept),
 * under a heading with a link back to all the work. From lg the pair splits the 1000px
 * Visual into 480px + 40px + 480px; below that they stack.
 */
export default function NextCase({ current }: { current: string }) {
  const works = nextWorks(current);
  return (
    <section className="cs-chapter" aria-labelledby="next-case-study">
      <div className="cs-visual !mb-0 border-t border-line-soft pt-[40px] md:pt-[48px]">
        <div className="flex flex-col gap-[16px] md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-[12px]">
            <p className="font-brand text-[12px] uppercase leading-[16px] text-muted">Next case studies</p>
            <h2
              id="next-case-study"
              className="m-0 font-heading text-[34px] font-normal leading-[36px] tracking-[-2px] text-heading md:text-[42px] md:leading-[44px]"
            >
              Down the hall
            </h2>
          </div>
          <Link
            href="/#works"
            className="group inline-flex items-center gap-[8px] self-start font-brand text-[12px] uppercase leading-[16px] text-heading underline-offset-4 hover:underline md:self-auto"
          >
            All work
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-[200ms] group-hover:translate-x-[4px] motion-reduce:transition-none"
            />
          </Link>
        </div>
        <div className="mt-[8px] grid grid-cols-1 gap-[32px] lg:grid-cols-2 lg:gap-[40px]">
          {works.map((work) => (
            <FeaturedCard key={work.href} work={{ ...work, layout: "standard" }} room={roomFor(work)} />
          ))}
        </div>
      </div>
    </section>
  );
}
