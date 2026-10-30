import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import KeyTag from "@/components/KeyTag";
import PaperTooth from "@/components/PaperTooth";
import PixelClouds from "@/components/PixelClouds";
import { nextWorks, roomFor } from "@/content/works";

/**
 * The end of every case study: the next two case studies on the homepage, as the doors
 * further down the hall. A dark Blackcurrant panel, with the same paper tooth as the
 * footer and the guestbook, holds a mono eyebrow, the heading and
 * the navbar's button (inverted to white) back to all the work, then one wide row per case
 * study: its cover, its room number, its title and a line about it, with an arrow. Hovering
 * a row zooms its cover a touch under a light fringe of pixel clouds, drops (then swings)
 * the room's key onto its hook, lights the row and slides the arrow. From md the cover sits beside the text; on phones it sits on top.
 */
export default function NextCase({ current }: { current: string }) {
  const works = nextWorks(current);
  return (
    <section className="cs-chapter" aria-labelledby="next-case-study">
      <div className="cs-visual relative !mb-0 overflow-hidden rounded-xl bg-primary p-[24px] text-white md:p-[40px]">
        <PaperTooth />
        <div className="relative flex flex-col gap-[16px] md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-[8px]">
            <p className="m-0 font-brand text-[12px] uppercase leading-[16px] tracking-[1px] text-white/60">
              Keep reading
            </p>
            <h2
              id="next-case-study"
              className="m-0 font-heading text-[34px] font-normal leading-[40px] tracking-[-2px] text-white md:text-[42px] md:leading-[48px]"
            >
              Down the hall
            </h2>
          </div>
          <Link
            href="/#works"
            className="group inline-flex h-[42px] items-center gap-[8px] self-start whitespace-nowrap rounded-lg bg-white px-[16px] font-brand text-[14px] font-medium uppercase tracking-[1px] text-primary transition-colors duration-200 hover:bg-grape-light md:self-auto"
          >
            All work
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-[200ms] group-hover:translate-x-[4px] motion-reduce:transition-none"
            />
          </Link>
        </div>

        <ul className="relative m-0 mt-[32px] flex list-none flex-col p-0 md:mt-[40px]">
          {works.map((work) => (
            <li key={work.href} className="border-t border-white/10">
              <Link
                href={work.href}
                className="group grid grid-cols-1 gap-[16px] rounded-lg py-[24px] transition-colors duration-[260ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape-light md:-mx-[16px] md:grid-cols-[240px_1fr_auto] md:items-center md:gap-[32px] md:px-[16px] md:hover:bg-white/5"
              >
                {/* The key hangs past the cover's edge, so it sits outside the clipped image */}
                <span className="relative block">
                  <KeyTag
                    room={roomFor(work)}
                    className="absolute -top-[2px] right-[12px] z-[2]"
                  />
                  <span className="relative block h-[168px] overflow-hidden rounded-md bg-white/10 md:h-[144px]">
                    <Image
                      src={work.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 240px, 100vw"
                      style={{ objectPosition: work.imagePosition ?? "center" }}
                      className="object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <PixelClouds
                      seed={Number(roomFor(work))}
                      subtle
                      className="z-[1]"
                    />
                  </span>
                </span>
                <span className="flex flex-col gap-[8px]">
                  <span className="font-brand text-[12px] uppercase leading-[16px] tracking-[1px] text-grape-light">
                    Room {roomFor(work)}
                  </span>
                  <span className="text-balance font-heading text-[24px] leading-[32px] text-white md:text-[28px] md:leading-[36px]">
                    {work.title}
                  </span>
                  <span className="line-clamp-2 font-body text-[16px] leading-[26px] text-white/60">
                    {work.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="hidden h-[48px] w-[48px] items-center justify-center rounded-full border border-white/20 transition-[transform,background-color,border-color,color] duration-[260ms] group-hover:translate-x-[4px] group-hover:border-white group-hover:bg-white group-hover:text-primary motion-reduce:transition-none md:flex"
                >
                  <ArrowRight size={20} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
