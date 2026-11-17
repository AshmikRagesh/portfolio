"use client";

import { useCallback, useState } from "react";
import { Tag } from "@/components/Tag";
import useInView from "./useInView";
import { CardFooter } from "./Blocks";
import { Expanded } from "./Media";

/**
 * A screenshot with its findings marked on it. Quiet and static: every finding is visible
 * at once, numbered, so the reader can count them and match each mark to its words.
 *
 *  - Each finding is an outline box (2px grape line, 6px corners, a faint wash, a white
 *    halo so it reads on dark and light parts alike), numbered in reading order.
 *  - Tablet and up: the case studies' Tag sits on the box's top or bottom edge with the
 *    number in its chip and the finding in a few words. Tags on boxes in the right half
 *    hang from the box's right edge, so they never run off the picture.
 *  - Phones: tags would crowd a small picture, so each box carries just its number on the
 *    corner and the findings are listed under the picture with the same numbers.
 *  - Every size: clicking or tapping the picture (or Enter on it) opens it large. Phones
 *    keep the numbers on the picture and list the findings under it; larger screens show
 *    the tags. Esc, the backdrop or ✕ close it.
 *  - Once in view the boxes settle in one after another; reduced motion shows them
 *    straight away.
 *
 * Boxes are placed as fractions of the picture, so they stay on their targets at any width.
 */
type Note = {
  /** A few words on what's wrong */
  text: string;
  /** The box, as fractions of the picture: left, top, width, height */
  box: { x: number; y: number; w: number; h: number };
  /** Which edge of the box its tag sits on */
  place?: "top" | "bottom";
};

const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";
const HALO = "shadow-[0_0_0_2px_rgba(255,255,255,0.85)]";

// The number, the same grape dot wherever it appears
function Dot({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-[20px] shrink-0 place-items-center rounded-full bg-grape font-geist text-[10px] font-medium leading-[12px] text-white ${className}`}
    >
      {n}
    </span>
  );
}

// The findings as a numbered list (under the picture on phones, and in the large view)
function List({ notes, dark = false, className = "" }: { notes: Note[]; dark?: boolean; className?: string }) {
  return (
    <ol className={`m-0 flex list-none flex-col gap-[8px] p-0 ${className}`}>
      {notes.map((n, i) => (
        <li key={n.text} className={`flex items-center gap-[8px] font-body text-body ${dark ? "text-white/90" : "text-heading"}`}>
          <Dot n={i + 1} />
          {n.text}
        </li>
      ))}
    </ol>
  );
}

// The picture with its numbered boxes
function Marked({
  src,
  alt,
  width,
  height,
  notes,
  shown,
  large = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  notes: Note[];
  shown: boolean;
  large?: boolean;
}) {
  return (
    <div className="relative h-full w-full" style={{ aspectRatio: `${width} / ${height}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} draggable={false} className="absolute inset-0 h-full w-full bg-white object-cover" />
      {notes.map((n, i) => {
        const right = n.box.x + n.box.w / 2 > 0.5;
        return (
          <div
            key={n.text}
            aria-hidden="true"
            className={`absolute rounded-[6px] border-2 border-grape bg-grape/[0.06] ${HALO} transition-[opacity,transform] duration-500 ${EASE} motion-reduce:transition-none ${
              shown ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
            }`}
            style={{
              left: `${n.box.x * 100}%`,
              top: `${n.box.y * 100}%`,
              width: `${n.box.w * 100}%`,
              height: `${n.box.h * 100}%`,
              transitionDelay: large ? "0ms" : `${200 + i * 250}ms`,
            }}
          >
            {/* Phones: the number on the box's corner */}
            <Dot n={i + 1} className={`absolute -top-[10px] md:hidden ${right ? "-right-[10px]" : "-left-[10px]"} ${HALO}`} />
            {/* Tablet up: the tag, its number in the chip */}
            <span className={`absolute hidden md:block ${right ? "right-[-2px]" : "left-[-2px]"} ${n.place === "bottom" ? "top-full mt-[6px]" : "bottom-full mb-[6px]"}`}>
              <Tag face="geist" tone="grape">
                <span className="-ml-[6px] grid size-[16px] place-items-center rounded-full bg-white/20 text-[10px] leading-[12px]">{i + 1}</span>
                {n.text}
              </Tag>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnnotatedFigure({
  src,
  alt,
  width,
  height,
  notes,
  label,
}: {
  src: string;
  alt: string;
  /** The picture's pixel size, so the frame keeps its exact shape */
  width: number;
  height: number;
  notes: Note[];
  /** Optional line under the card */
  label?: string;
}) {
  const [ref, shown] = useInView<HTMLDivElement>(0.5);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <figure className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px]">
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`Expand: ${alt}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        data-sound="whisper"
        data-sound-click="pop"
        className="cs-pair-media relative cursor-zoom-in overflow-hidden rounded-sm bg-grape-light/40 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grape"
      >
        <Marked src={src} alt={alt} width={width} height={height} notes={notes} shown={shown} />
      </div>

      {/* The findings in words, numbered like the boxes: shown on phones, for screen readers on every size */}
      <List notes={notes} className="px-[12px] pb-[4px] pt-[12px] md:sr-only" />

      <CardFooter label={label} />

      {open && (
        <Expanded
          label={label ?? alt}
          ratio={width / height}
          onClose={close}
          caption={<List notes={notes} dark className="self-stretch px-[8px] md:hidden" />}
        >
          <Marked src={src} alt={alt} width={width} height={height} notes={notes} shown large />
        </Expanded>
      )}
    </figure>
  );
}
