"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import PasswordGate, { useUnlocked, type PasswordGateHandle } from "@/components/PasswordGate";
import { LOCKED } from "@/lib/caseLock";
import { EMAIL } from "@/lib/contact";
import { LockKeyhole, Mail } from "lucide-react";
import { CtaPill } from "@/components/Cta";
import NdaStamp from "@/components/NdaStamp";
import PixelClouds from "@/components/PixelClouds";
import { featuredWorks, roomFor, type FeaturedWork } from "@/content/works";

// ── Card video ────────────────────────────────────────────────────────────────
// A short muted loop over the card's image (its first frame), so nothing shifts while it
// loads. It loads and plays only while the card is on screen, and stays still for anyone who
// prefers reduced motion.
function CardVideo({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (v.preload !== "auto") v.preload = "auto";
        v.play().catch(() => {});
      } else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} muted loop playsInline preload="none" aria-hidden="true" className={className} />;
}

// ── Featured card ─────────────────────────────────────────────────────────────
// A soft grey card in two parts with the same padding all round: the words and the work.
// The words read in one order on every card: the title in the heading serif, a line about it (lead, 18/28 from md), and a pill "Read case study"
// pinned to the foot. Flagships sit side by side from lg (words 0.82fr, image 1.18fr); every
// card image keeps one fixed aspect; the smaller pair always stack.
// Hovering the card rolls pink pixel clouds (grey for NDA works) in round the image, and
// turns the pill grape as it makes room for an arrow
// circle (see .work-cta). NDA works show a stamp on a greyed image and a greyed-out pill.
export function FeaturedCard({ work }: { work: FeaturedWork }) {
  // Password-protected works (lib/caseLock): until the password's been entered, the card
  // opens the password field instead of following its link. Locked until this browser is
  // known to have the password, so it never flashes as open; a "coming soon" card stays locked.
  const lockedSlug = work.href.startsWith("/works/") ? work.href.slice(7) : "";
  const lock = LOCKED[lockedSlug];
  const unlocked = useUnlocked(lockedSlug);
  const locked = Boolean(lock) && (lock.comingSoon || unlocked !== true);
  // NDA works with no page or lock: the card opens an email asking about the work instead
  const href =
    work.nda && !lock ? `mailto:${EMAIL}?subject=${encodeURIComponent(`Access to: ${work.title}`)}` : work.href;
  const isLink = href !== "#";
  const gate = useRef<PasswordGateHandle>(null);
  const Wrapper = isLink ? Link : "div";
  const isFlagship = work.layout === "flagship";
  const pad = "p-[24px] md:p-[32px]";

  const title = (
    <h3 className="m-0 max-w-[560px] text-balance font-heading text-[26px] font-normal leading-[32px] tracking-[-1px] text-heading md:text-[28px] md:leading-[36px] lg:text-[32px] lg:leading-[40px]">
      {work.title}
    </h3>
  );
  const description = (
    <p className="m-0 max-w-[560px] text-pretty font-body text-lead-md text-secondary">{work.description}</p>
  );
  // Locked works: unlock to read. NDA works can't be shown, so the card asks for access by email.
  // Both greyed, as they can't simply be opened.
  const cta = locked ? (
    // Short, so it fits a phone-width card; the lock slides out in the circle on hover
    <CtaPill muted icon={<LockKeyhole size={18} strokeWidth={2} />}>
      <span className="sr-only">Locked: </span>
      Read case study
    </CtaPill>
  ) : work.nda ? (
    <CtaPill muted icon={<Mail size={18} strokeWidth={2} />}>Request access</CtaPill>
  ) : isLink ? (
    <CtaPill>Read case study</CtaPill>
  ) : (
    <CtaPill off>Read case study</CtaPill>
  );

  return (
    <Wrapper
      href={href}
      // Locked: the page fade mustn't take the click (components/PageTransition)
      data-no-transition={locked || undefined}
      onClick={
        locked
          ? (e: React.MouseEvent) => {
              e.preventDefault();
              // A pointer click opens it where the pointer is; Enter on the focused card, in the middle
              gate.current?.open(e.detail ? e.clientX : undefined, e.detail ? e.clientY : undefined);
            }
          : undefined
      }
      className={`work-card group relative grid h-full min-w-0 rounded-xl text-heading ${
        isFlagship
          ? "grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:grid-rows-1"
          : // The smaller pair share three rows (title, words + pill, image) through a subgrid, so
            // side by side a two-line title and a three-line one still start the description,
            // the pill and the image at the same height on both cards
            "grid-rows-[auto_auto_1fr] lg:row-span-3 lg:grid-rows-subgrid lg:gap-y-0"
      } ${isLink ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape" : ""}`}
    >
      {/* Locked: the "Enter password" pill follows the pointer over the whole card */}
      {locked && <PasswordGate ref={gate} slug={lockedSlug} href={work.href} comingSoon={lock?.comingSoon} />}

      {isFlagship ? (
        /* Words */
        <div className={`flex min-w-0 flex-col justify-between gap-[32px] md:gap-[40px] ${pad} pb-0 md:pb-0 lg:pb-[32px]`}>
          <div className="flex flex-col gap-[12px] md:gap-[16px]">
            {title}
            {description}
          </div>
          {cta}
        </div>
      ) : (
        <>
          {/* The description follows its own title, as on the large cards, so a shorter title
              never leaves a gap above it; the pill and image rows stay level across the pair */}
          <div className="flex min-w-0 flex-col gap-[12px] px-[24px] pt-[24px] md:gap-[16px] md:px-[32px] md:pt-[32px]">
            {title}
            {description}
          </div>
          <div className="flex min-w-0 flex-col justify-end px-[24px] pt-[32px] md:px-[32px] md:pt-[40px]">{cta}</div>
        </>
      )}

      {/* The work, in its half with the same padding as the words; every card's image keeps one
          fixed aspect (never stretched to the text beside it), centred in its half side by side */}
      <div className={`flex min-w-0 items-center ${pad}`}>
        <div className="relative w-full">
          <div
            className={`work-media relative aspect-[1071/608] overflow-hidden rounded-lg bg-placeholder ${work.nda ? "stamp-thud" : ""}`}
          >
            <Image
              src={work.image}
              alt={work.imageAlt}
              fill
              sizes={isFlagship ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
              style={{ objectPosition: work.imagePosition ?? "center" }}
              className={`work-media__img object-cover ${work.nda ? "grayscale" : ""}`}
            />
            {work.video && <CardVideo src={work.video} className={`work-media__img absolute inset-0 h-full w-full object-cover ${work.nda ? "grayscale" : ""}`} />}

            {/* Pixel clouds roll in round the image's edges on hover: pink, or grey for NDA */}
            <PixelClouds seed={Number(roomFor(work))} palette={work.nda ? "grey" : "brand"} className="z-[1]" />

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
        <header className="mb-8 md:mb-10">
          <h2
            id="works-heading"
            className="m-0 text-balance font-heading text-[34px] font-normal leading-[36px] tracking-[-2px] text-heading md:text-[44px] md:leading-[44px]"
          >
            Selected work.
          </h2>
        </header>

        {/* Cards — while one is hovered or focused, the rest blur back (see .works-list) */}
        <div className="works-list flex flex-col gap-8 lg:gap-10">
          {toRows(featuredWorks).map((row) =>
            row[0].layout === "flagship" ? (
              <FeaturedCard key={row[0].title} work={row[0]} />
            ) : (
              <div key={row[0].title} className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
                {row.map((work) => (
                  <FeaturedCard key={work.title} work={work} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
