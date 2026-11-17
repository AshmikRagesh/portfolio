"use client";

import { Tag } from "@/components/Tag";
import useInView from "./useInView";
import { CardFooter } from "./Blocks";

/**
 * A screenshot with its findings marked on it, kept quiet so the screenshot stays the hero.
 * Each finding is one outline box around the thing it's about, all drawn the same way
 * (2px grape line, 6px corners, a faint grape wash, a white halo so it reads on dark and
 * light parts alike), with the case studies' own Tag pinned to the box's top or bottom
 * edge naming the finding in a few words.
 *
 * Once in view the boxes appear one after another (a short fade and settle); reduced
 * motion shows them straight away. Boxes are placed as fractions of the picture, so they
 * stay on their targets at any width. Phones swap the tags for numbers and list the notes
 * under the picture; screen readers get the list on every size.
 */
type Note = {
  /** A few words on what's wrong, read on the tag */
  text: string;
  /** The box, as fractions of the picture: left, top, width, height */
  box: { x: number; y: number; w: number; h: number };
  /** Which edge of the box the tag sits on */
  place?: "top" | "bottom";
};

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
  /** The line under the card: what the markings show */
  label?: string;
}) {
  const [ref, shown] = useInView<HTMLDivElement>(0.4);
  return (
    <figure className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px]">
      <div
        ref={ref}
        className="cs-pair-media relative overflow-hidden rounded-sm bg-grape-light/40"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={width} height={height} className="absolute inset-0 h-full w-full object-cover" />
        {notes.map((n, i) => (
          <div
            key={n.text}
            aria-hidden="true"
            className={`absolute rounded-[6px] border-2 border-grape bg-grape/[0.06] shadow-[0_0_0_2px_rgba(255,255,255,0.85)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
              shown ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
            }`}
            style={{
              left: `${n.box.x * 100}%`,
              top: `${n.box.y * 100}%`,
              width: `${n.box.w * 100}%`,
              height: `${n.box.h * 100}%`,
              transitionDelay: `${300 + i * 250}ms`,
            }}
          >
            {/* Tablet up: the tag names the finding. Phones: a number, with the notes listed below */}
            <span className={`absolute left-[-2px] hidden md:block ${n.place === "bottom" ? "top-full mt-[6px]" : "bottom-full mb-[6px]"}`}>
              <Tag face="geist" tone="grape">
                {n.text}
              </Tag>
            </span>
            <span className="absolute -right-[10px] -top-[10px] grid size-[20px] place-items-center rounded-full bg-grape font-geist text-[10px] font-medium leading-[12px] text-white shadow-[0_0_0_2px_rgba(255,255,255,0.85)] md:hidden">
              {i + 1}
            </span>
          </div>
        ))}
      </div>
      {/* The notes in words: listed under the picture on phones, for screen readers everywhere */}
      <ol className="m-0 flex list-none flex-col gap-[8px] px-[12px] pt-[16px] max-md:not-sr-only md:sr-only">
        {notes.map((n, i) => (
          <li key={n.text} className="flex items-center gap-[8px] font-body text-body text-heading">
            <span aria-hidden="true" className="grid size-[20px] shrink-0 place-items-center rounded-full bg-grape font-geist text-[10px] font-medium leading-[12px] text-white">
              {i + 1}
            </span>
            {n.text}
          </li>
        ))}
      </ol>
      <CardFooter label={label} />
    </figure>
  );
}
