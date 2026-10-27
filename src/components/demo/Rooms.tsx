"use client";

import Image from "next/image";
import Link from "next/link";
import { featuredWorks, type FeaturedWork } from "@/content/works";

// Works, re-dressed as rooms. Same card layout as the live Works section, plus:
//   • a room key fob that swings on hover
//   • "Room 101" in the label line
//   • a "Stayed" passport stamp once the case study has been opened
//   • projects without a case study page yet are "Under renovation"

export const ROOM_NUMBERS = featuredWorks.map((_, i) => String(101 + i));

function MiniKey({ room }: { room: string }) {
  return (
    <div className="swing pointer-events-none absolute -top-[6px] right-6 z-[2] flex origin-top flex-col items-center md:right-8">
      <span className="h-[14px] w-[14px] rounded-full border-2 border-primary" />
      <div
        className="-mt-[6px] flex h-[64px] w-[40px] flex-col items-center justify-end rounded-[20px_20px_10px_10px] bg-grape pb-2 shadow-[0_2px_6px_rgba(30,5,37,0.2)]"
        style={{ WebkitMask: "radial-gradient(circle 4px at 20px 12px, transparent 97%, #000)", mask: "radial-gradient(circle 4px at 20px 12px, transparent 97%, #000)" }}
      >
        <span className="font-heading text-[16px] leading-[18px] tracking-[0px] text-white">{room}</span>
      </div>
    </div>
  );
}

function StayedStamp() {
  return (
    <span className="stamp-in scribble absolute left-4 top-4 z-[1] flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full border-2 border-grape/80 bg-white/70 font-brand text-[10px] uppercase leading-[12px] tracking-[1px] text-grape">
      <span>Stayed</span>
      <span className="font-heading text-[16px] normal-case italic leading-[18px] tracking-[0px]">✓</span>
    </span>
  );
}

function RoomCard({ work, room, stayed, onEnter }: { work: FeaturedWork; room: string; stayed: boolean; onEnter: () => void }) {
  const isOpen = work.href !== "#";
  const Wrapper = isOpen ? Link : "div";
  const isFlagship = work.layout === "flagship";

  return (
    <Wrapper
      href={work.href as string}
      onClick={isOpen ? onEnter : undefined}
      className={`group relative flex h-full min-w-0 flex-col rounded-[4px] border border-line/60 bg-white shadow-[0_2px_0_rgba(200,204,212,0.45)] ${
        isFlagship ? "lg:grid lg:grid-cols-[480px_minmax(0,1fr)]" : ""
      } ${
        isOpen
          ? "transition-[transform,box-shadow] duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-1 hover:shadow-[0_2px_0_rgba(200,204,212,0.45),0_16px_40px_rgba(30,5,37,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          : ""
      }`}
    >
      <MiniKey room={room} />

      {/* Media */}
      <div
        className={`relative h-[200px] shrink-0 overflow-hidden rounded-t-[4px] border-b border-line/60 bg-placeholder ${
          isFlagship
            ? "md:h-[320px] lg:col-start-2 lg:row-start-1 lg:h-full lg:min-h-[338px] lg:rounded-l-none lg:rounded-r-[4px] lg:border-b-0 lg:border-l"
            : "md:h-[320px] lg:h-[340px]"
        }`}
      >
        <Image
          src={work.image}
          alt={work.imageAlt}
          fill
          sizes={isFlagship ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
          style={{ objectPosition: work.imagePosition ?? "center" }}
          className={`object-cover ${isOpen ? "" : "opacity-60 grayscale"}`}
        />
        {stayed && <StayedStamp />}
        {!isOpen && (
          <span className="absolute left-4 top-4 rotate-[-4deg] bg-[#faf6ef] px-3 py-1 font-brand text-[10px] uppercase leading-[16px] tracking-[2px] text-primary shadow-[0_1px_2px_rgba(30,5,37,0.2)]">
            Under renovation
          </span>
        )}
      </div>

      {/* Body */}
      <div className={`flex flex-1 flex-col gap-4 p-6 md:p-8 ${isFlagship ? "lg:col-start-1 lg:row-start-1" : ""}`}>
        <p className="m-0 flex flex-wrap gap-x-2 gap-y-1 pr-12 font-brand text-[10px] uppercase leading-[16px] tracking-[0px] text-muted">
          <span className="font-medium text-grape">Room {room}</span>
          <span aria-hidden="true">/</span>
          <span>{[work.type, work.discipline].join(" · ")}</span>
        </p>
        <h3 className="m-0 max-w-[24ch] text-balance font-heading text-[26px] font-normal leading-[28px] tracking-[0px] text-heading md:text-[28px] md:leading-[32px] lg:text-[32px] lg:leading-[34px] lg:tracking-[-2px]">
          {work.title}
        </h3>
        <p className="m-0 max-w-[60ch] text-pretty text-[16px] leading-[26px] text-secondary">{work.description}</p>
      </div>
    </Wrapper>
  );
}

export default function Rooms({ stamps, onStamp }: { stamps: string[]; onStamp: (room: string) => void }) {
  const withRooms = featuredWorks.map((work, i) => ({ work, room: ROOM_NUMBERS[i] }));
  const card = ({ work, room }: (typeof withRooms)[number]) => (
    <RoomCard key={room} work={work} room={room} stayed={stamps.includes(room)} onEnter={() => onStamp(room)} />
  );

  return (
    <section id="rooms" aria-labelledby="rooms-heading" className="page-container section-spacing scroll-mt-24">
      <header className="mb-8 grid grid-cols-1 items-end gap-4 border-b border-line/60 pb-5 md:mb-10 md:grid-cols-[minmax(0,1fr)_320px] md:gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
        <h2
          id="rooms-heading"
          className="m-0 text-balance font-heading text-[34px] font-normal leading-[36px] tracking-[-2px] text-heading md:text-[44px] md:leading-[44px]"
        >
          The rooms.
        </h2>
        <p className="m-0 text-pretty text-[16px] leading-[26px] text-secondary">
          Each room is a project I designed and shipped. Take a key and look around — your passport keeps track of where
          you&apos;ve stayed.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {withRooms.filter(({ work }) => work.layout === "flagship").map(card)}
        <div className="grid grid-cols-1 gap-8 lg:auto-rows-fr lg:grid-cols-2">
          {withRooms.filter(({ work }) => work.layout !== "flagship").map(card)}
        </div>
      </div>
    </section>
  );
}
