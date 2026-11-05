"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import KeyTag from "@/components/KeyTag";
import NdaStamp from "@/components/NdaStamp";
import PixelClouds from "@/components/PixelClouds";
import { TypeTag, DisciplineTag } from "@/components/Tag";
import { featuredWorks, roomFor, type FeaturedWork } from "@/content/works";

// ── Featured card ─────────────────────────────────────────────────────────────
// A soft grey card with the words on one side and the work on the other: the tags, the
// title in the heading serif, a line about it, and a pill "Read case study" at the foot;
// the image fills the rest, flush to the right and bottom edges, from a rounded top-left
// corner. Flagships sit side by side from lg (text 0.82fr, image 1.18fr) and stack below
// it; the smaller pair always stack. Hovering the card zooms the image slowly from its
// top-left, rolls the pixel clouds over it, drops the room key onto its hook, and turns the
// pill grape as it makes room for an arrow circle (see .work-cta). NDA works show a stamp
// on a greyed image and "Under NDA" instead of the pill.
export function FeaturedCard({ work, room }: { work: FeaturedWork; room: string }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";
  const isFlagship = work.layout === "flagship";

  return (
    <Wrapper
      href={work.href as string}
      className={`work-card group relative grid h-full min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-xl bg-surface text-heading ${
        isFlagship ? "lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:grid-rows-1" : ""
      } ${isLink ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape" : ""}`}
    >
      {/* Words */}
      <div className="flex min-w-0 flex-col justify-between gap-[24px] p-[24px] md:gap-[32px] md:p-[40px] lg:p-[48px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TypeTag type={work.type} />
            <DisciplineTag discipline={work.discipline} />
          </div>
          <h3 className="m-0 mt-[20px] max-w-[18ch] text-balance font-heading text-[26px] font-normal leading-[32px] tracking-[-1px] text-heading md:text-[28px] md:leading-[36px] lg:text-[32px] lg:leading-[40px]">
            {work.title}
          </h3>
          <p className="m-0 mt-[16px] max-w-[42ch] text-pretty font-body text-[16px] leading-[26px] text-secondary">
            {work.description}
          </p>
        </div>
        {isLink ? (
          <span className="work-cta font-brand text-[14px] uppercase tracking-[1px]">
            <span className="work-cta__inner">Read case study</span>
            <span aria-hidden="true" className="work-cta__circle">
              <span>
                <ArrowUpRight size={18} strokeWidth={2} />
              </span>
            </span>
          </span>
        ) : (
          <span className="font-brand text-[12px] uppercase leading-[16px] tracking-[1px] text-muted">Under NDA</span>
        )}
      </div>

      {/* The work, flush to the right and bottom edges */}
      <div className={`relative min-w-0 self-end ml-[24px] md:ml-[40px] ${isFlagship ? "lg:ml-0 lg:mt-[48px]" : ""}`}>
        {/* Open works: the room key drops onto its hook on hover. (NDA works: the stamp.) */}
        {!work.nda && <KeyTag room={room} className="absolute -top-[2px] right-[14px] z-[3] md:right-[22px]" />}
        <div className={`relative aspect-[1071/608] overflow-hidden rounded-tl-lg bg-placeholder ${work.nda ? "stamp-thud" : ""}`}>
          <Image
            src={work.image}
            alt={work.imageAlt}
            fill
            sizes={isFlagship ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
            style={{ objectPosition: work.imagePosition ?? "left top" }}
            className={`origin-[6%_11%] object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.06] group-focus-visible:scale-[1.06] ${
              work.nda ? "grayscale" : ""
            }`}
          />

          {/* Pixel clouds roll in over the image on hover — grey on NDA works */}
          <PixelClouds seed={Number(room)} palette={work.nda ? "grey" : "brand"} className="z-[1]" />

          {/* NDA: the image stays greyed out; the stamp presses down in the centre the first
              time the card is hovered or focused (on scroll-in for touch), then stays. */}
          {work.nda && (
            <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
              <NdaStamp className="h-[112px] w-[112px] md:h-[168px] md:w-[168px]" />
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}


// Keep the project order: flagships stand alone, consecutive standards pair up.
function toRows(works: FeaturedWork[]): FeaturedWork[][] {
  const rows: FeaturedWork[][] = [];
  for (const work of works) {
    const last = rows[rows.length - 1];
    if (work.layout === "standard" && last?.length === 1 && last[0].layout === "standard") last.push(work);
    else rows.push([work]);
  }
  return rows;
}

// ── Works section ─────────────────────────────────────────────────────────────
export default function Works() {
  return (
    <section
      id="works"
      aria-labelledby="works-heading"
      className="page-container section-spacing scroll-mt-20 bg-background"
    >
      <div className="w-full">
        {/* Header */}
        <header className="mb-8 grid grid-cols-1 items-end gap-4 md:mb-10 md:grid-cols-[minmax(0,1fr)_320px] md:gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
          <h2
            id="works-heading"
            className="m-0 text-balance font-heading text-[34px] font-normal leading-[36px] tracking-[-2px] text-heading md:text-[44px] md:leading-[44px]"
          >
            Selected work.
          </h2>
          <p className="m-0 text-pretty font-body text-[16px] leading-[26px] text-secondary">
            Products I&apos;ve designed and shipped — from design systems to the flows people use every day.
          </p>
        </header>

        {/* Cards — while one is hovered or focused, the rest blur back (see .works-list) */}
        <div className="works-list flex flex-col gap-8 lg:gap-10">
          {toRows(featuredWorks).map((row) =>
            row[0].layout === "flagship" ? (
              <FeaturedCard key={row[0].title} work={row[0]} room={roomFor(row[0])} />
            ) : (
              <div key={row[0].title} className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
                {row.map((work) => (
                  <FeaturedCard key={work.title} work={work} room={roomFor(work)} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
