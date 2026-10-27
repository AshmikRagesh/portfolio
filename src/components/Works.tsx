"use client";

import Image from "next/image";
import Link from "next/link";
import KeyTag from "@/components/KeyTag";
import NdaStamp from "@/components/NdaStamp";
import PixelClouds from "@/components/PixelClouds";
import { TypeTag, DisciplineTag } from "@/components/Tag";
import { featuredWorks, roomFor, type FeaturedWork } from "@/content/works";

// ── Featured card ─────────────────────────────────────────────────────────────
export function FeaturedCard({ work, room }: { work: FeaturedWork; room: string }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";
  const isFlagship = work.layout === "flagship";

  return (
    <Wrapper
      href={work.href as string}
      className={`group relative flex h-full min-w-0 flex-col rounded-[4px] border border-line/40 bg-background shadow-[0_2px_0_rgba(200,204,212,0.45)] ${
        isFlagship ? "lg:grid lg:grid-cols-[min(640px,calc(62.5%_-_136px))_minmax(0,1fr)]" : ""
      } ${
        isLink
          ? "transition-[transform,box-shadow] duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-1 hover:shadow-[0_2px_0_rgba(200,204,212,0.45),0_16px_40px_rgba(30,5,37,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          : ""
      }`}
    >
      {/* Open works: the room key drops onto its hook on hover. (NDA works: see the media.) */}
      {!work.nda && <KeyTag room={room} className="absolute -top-[2px] right-[14px] z-[2] md:right-[22px]" />}

      {/* Media — fixed even heights instead of aspect ratios so nothing lands on a fractional px.
          Flagship: 338px + 2px border = 340px card. */}
      <div
        className={`relative h-[224px] shrink-0 overflow-hidden rounded-t-[4px] border-b border-line/40 bg-placeholder ${work.nda ? "stamp-thud" : ""} ${
          isFlagship
            ? "md:h-[400px] lg:col-start-2 lg:row-start-1 lg:h-full lg:min-h-[338px] lg:rounded-l-none lg:rounded-r-[4px] lg:border-b-0 lg:border-l"
            : "md:h-[400px] lg:h-[340px]"
        }`}
      >
        <Image
          src={work.image}
          alt={work.imageAlt}
          fill
          sizes={isFlagship ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
          style={{ objectPosition: work.imagePosition ?? "center" }}
          className={`object-cover ${work.nda ? "grayscale" : ""}`}
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

      {/* Body */}
      <div className={`flex flex-1 flex-col gap-4 p-6 md:p-8 ${isFlagship ? "lg:col-start-1 lg:row-start-1" : ""}`}>
        {/* Tags: type · discipline */}
        <div className="flex flex-wrap items-center gap-2">
          <TypeTag type={work.type} />
          <DisciplineTag discipline={work.discipline} />
        </div>
        <h3 className="m-0 max-w-[24ch] text-balance font-heading text-[26px] font-normal leading-[32px] tracking-[0px] text-heading md:text-[28px] md:leading-[36px] lg:text-[32px] lg:leading-[40px] lg:tracking-[-2px]">
          {work.title}
        </h3>
        <p className="m-0 max-w-[60ch] text-pretty font-body text-[16px] leading-[26px] text-secondary">
          {work.description}
        </p>
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

        {/* Cards */}
        <div className="flex flex-col gap-8 lg:gap-10">
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
