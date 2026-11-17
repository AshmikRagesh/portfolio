"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Tag } from "@/components/Tag";
import useInView from "./useInView";
import { CardFooter } from "./Blocks";
import { Expanded } from "./Media";

/**
 * A screenshot with its findings marked on it, one at a time.
 *
 * On the picture each finding is an outline box with a numbered dot on its corner, all
 * drawn the same way (2px grape line, 6px corners, white halo). The finding in focus is
 * solid with a faint wash and, from tablet up, its Tag beside it; the others step back to
 * a light outline. Under the picture the findings are tabs — a number and a few words —
 * so the reader can step through them; tapping a box picks it too. Phones keep the picture
 * clean and list the findings under it instead.
 *
 * Once in view it walks through the findings once on its own (unless the reader has
 * picked one, or prefers less motion). Clicking the picture anywhere but a box opens it
 * large, where tapping a box moves between the findings. Boxes are placed as fractions of the picture, so
 * they stay on their targets at any width.
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
const WALK = 2200; // ms on each finding during the first walk-through

// A number dot, the same everywhere it appears
function Dot({ n, on = true, className = "" }: { n: number; on?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-[20px] shrink-0 place-items-center rounded-full font-geist text-[10px] font-medium leading-[12px] transition-colors duration-300 ${
        on ? "bg-grape text-white" : "bg-white text-grape ring-1 ring-inset ring-grape/40"
      } ${className}`}
    >
      {n}
    </span>
  );
}

// The picture with its boxes; the finding in focus is solid and named by its tag. `large`
// is the expanded view, where the tag shows on every screen size
function Marked({
  src,
  alt,
  width,
  height,
  notes,
  active,
  shown,
  large = false,
  onPick,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  notes: Note[];
  active: number;
  shown: boolean;
  large?: boolean;
  onPick?: (i: number) => void;
}) {
  return (
    <div className="relative h-full w-full" style={{ aspectRatio: `${width} / ${height}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} draggable={false} className="absolute inset-0 h-full w-full bg-white object-cover" />
      {notes.map((n, i) => {
        const on = active === i;
        // Tags on boxes in the right half hang from the box's right edge, so they stay inside
        const right = n.box.x + n.box.w / 2 > 0.5;
        return (
          <button
            key={n.text}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={(e) => {
              e.stopPropagation();
              onPick?.(i);
            }}
            data-sound-click="toggle"
            className={`absolute rounded-[6px] border-2 shadow-[0_0_0_2px_rgba(255,255,255,0.85)] transition-[opacity,background-color,border-color] duration-300 ${EASE} motion-reduce:transition-none ${
              on ? "border-grape bg-grape/[0.08]" : "border-grape/40 bg-transparent hover:border-grape/70"
            } ${shown ? "opacity-100" : "opacity-0"} ${onPick ? "cursor-pointer" : "cursor-default"} ${large ? "" : "max-md:hidden"}`}
            style={{
              left: `${n.box.x * 100}%`,
              top: `${n.box.y * 100}%`,
              width: `${n.box.w * 100}%`,
              height: `${n.box.h * 100}%`,
              transitionDelay: shown ? "0ms" : `${i * 150}ms`,
            }}
          >
            <Dot n={i + 1} on={on} className="absolute -left-[11px] -top-[11px] shadow-[0_0_0_2px_rgba(255,255,255,0.85)]" />
            {/* The tag naming the finding in focus: from tablet up, and on every size in the large view */}
            <span
              className={`pointer-events-none absolute transition-[opacity,transform] duration-300 ${EASE} motion-reduce:transition-none ${
                right ? "right-0" : "left-[12px]"
              } ${large ? "block" : "hidden md:block"} ${n.place === "bottom" ? "top-full mt-[6px]" : "bottom-full mb-[6px]"} ${
                on ? "translate-y-0 opacity-100" : `${n.place === "bottom" ? "-translate-y-[4px]" : "translate-y-[4px]"} opacity-0`
              }`}
            >
              <Tag face="geist" tone="grape">
                {n.text}
              </Tag>
            </span>
          </button>
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
  /** The line under the card: what the markings show */
  label?: string;
}) {
  const [ref, shown] = useInView<HTMLDivElement>(0.5);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const touched = useRef(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = notes.length - 1;

  // The first walk-through, once in view: each finding in turn, then back to the first
  useEffect(() => {
    if (!shown || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const timer = setInterval(() => {
      if (touched.current) return clearInterval(timer);
      i += 1;
      if (i > notes.length) return clearInterval(timer);
      setActive(i % notes.length);
    }, WALK);
    return () => clearInterval(timer);
  }, [shown, notes.length]);

  const pick = useCallback((i: number) => {
    touched.current = true;
    setActive(i);
  }, []);

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = Math.max(0, Math.min(last, active + d));
    pick(i);
    tabs.current[i]?.focus();
  };

  const close = useCallback(() => setOpen(false), []);

  return (
    <figure className="cs-pair-card m-0 flex min-w-0 flex-col rounded-md p-[8px]">
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`Expand: ${alt}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(true))}
        data-sound="whisper"
        data-sound-click="pop"
        className="cs-pair-media relative cursor-zoom-in overflow-hidden rounded-sm bg-grape-light/40 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grape"
      >
        <Marked src={src} alt={alt} width={width} height={height} notes={notes} active={active} shown={shown} onPick={pick} />
      </div>

      {/* Phones: the picture stays clean and the findings read as a short list under it */}
      <ul className="m-0 flex list-none flex-col gap-[6px] px-[12px] pt-[12px] md:hidden">
        {notes.map((n) => (
          <li key={n.text} className="flex items-baseline gap-[8px] font-body text-body text-heading">
            <span aria-hidden="true" className="size-[6px] shrink-0 -translate-y-[2px] rounded-full bg-grape" />
            {n.text}
          </li>
        ))}
      </ul>

      {/* Tablet up: the findings as tabs, a number and a few words each; the picked one fills */}
      <div
        role="tablist"
        aria-label="Findings"
        onKeyDown={onKey}
        className={`mt-[8px] hidden gap-[4px] md:grid ${notes.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
      >
        {notes.map((n, i) => (
          <button
            key={n.text}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            onClick={() => pick(i)}
            data-sound-click="toggle"
            className={`flex items-center gap-[8px] rounded-sm px-[8px] py-[8px] text-left font-body text-body transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-grape md:px-[12px] ${
              active === i ? "bg-grape-light/60 text-heading" : "text-secondary hover:bg-grape-light/30 hover:text-heading"
            }`}
          >
            <Dot n={i + 1} on={active === i} />
            {n.text}
          </button>
        ))}
      </div>

      <CardFooter label={label} />

      {open && (
        <Expanded label={label ?? alt} ratio={width / height} onClose={close}>
          <Marked src={src} alt={alt} width={width} height={height} notes={notes} active={active} shown large onPick={pick} />
        </Expanded>
      )}
    </figure>
  );
}
