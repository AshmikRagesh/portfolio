"use client";

import Image from "next/image";
import Link from "next/link";
import { CtaPill } from "@/components/Cta";
import KeyTag from "@/components/KeyTag";
import NdaStamp from "@/components/NdaStamp";
import PixelClouds from "@/components/PixelClouds";
import { featuredWorks, roomFor, type FeaturedWork } from "@/content/works";

// ── Featured card ─────────────────────────────────────────────────────────────
// A soft grey card in two parts with the same padding all round: the words and the work.
// The words read in one order on every card: the title in the heading serif, a line about it (lead, 18/28 from md), and a pill "Read case study"
// pinned to the foot. Flagships sit side by side from lg (words 0.82fr, image 1.18fr); below
// lg they stack; the smaller pair always stack. The image is always 16:9, the covers' own
// shape, so it scales with the card and is never cropped at any width.
// Hovering the card rolls pink pixel clouds (grey for NDA works) in round the image, drops
// the room key onto its hook, and turns the pill grape as it makes room for an arrow
// circle (see .work-cta). NDA works show a stamp on a greyed image and a greyed-out pill.
export function FeaturedCard({ work, room }: { work: FeaturedWork; room: string }) {
  const isLink = work.href !== "#";
  const Wrapper = isLink ? Link : "div";
  const isFlagship = work.layout === "flagship";
  const pad = "p-[24px] md:p-[32px]";

  return (
    <Wrapper
      href={work.href as string}
      className={`work-card group relative grid h-full min-w-0 grid-rows-[auto_1fr] rounded-xl text-heading ${
        isFlagship ? "lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:grid-rows-1" : ""
      } ${isLink ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape" : ""}`}
    >
      {/* Words */}
      <div className={`flex min-w-0 flex-col justify-between gap-[32px] md:gap-[40px] ${pad} ${isFlagship ? "pb-0 md:pb-0 lg:pb-[32px]" : "pb-0 md:pb-0"}`}>
        <div className="flex flex-col">
          <h3 className="m-0 max-w-[560px] text-balance font-heading text-[26px] font-normal leading-[32px] tracking-[-1px] text-heading md:text-[28px] md:leading-[36px] lg:text-[32px] lg:leading-[40px]">
            {work.title}
          </h3>
          <p className="m-0 mt-[12px] max-w-[560px] text-pretty font-body text-lead-md text-secondary md:mt-[16px]">
            {work.description}
          </p>
        </div>
        {isLink ? (
          <CtaPill>Read case study</CtaPill>
        ) : (
          // Under NDA: the same pill, greyed out and inert
          <CtaPill off>Read case study</CtaPill>
        )}
      </div>

      {/* The work, in its half with the same padding as the words, at a fixed 16:9 and centred
          against the words beside it */}
      <div className={`flex min-w-0 items-center ${pad}`}>
        <div className="relative w-full">
          {/* Open works: the room key drops onto its hook on hover. (NDA works: the stamp.) */}
          {!work.nda && <KeyTag room={room} className="absolute -top-[2px] right-[12px] z-[3]" />}
          <div
            className={`work-media relative aspect-[16/9] overflow-hidden rounded-lg bg-placeholder ${work.nda ? "stamp-thud" : ""}`}
          >
            <Image
              src={work.image}
              alt={work.imageAlt}
              fill
              sizes={isFlagship ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
              style={{ objectPosition: work.imagePosition ?? "center" }}
              className={`work-media__img object-cover ${work.nda ? "grayscale" : ""}`}
            />

            {/* Pixel clouds roll in round the image's edges on hover: pink, or grey for NDA */}
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
            A collection of my recent work, from a design-system skill on Claude Code to search and trip planning for TCS World Travel.
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
