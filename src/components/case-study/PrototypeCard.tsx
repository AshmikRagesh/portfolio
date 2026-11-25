"use client";

import { useCallback, useState } from "react";
import { Expanded } from "./Media";
import { CardFooter } from "./Blocks";

/**
 * A working prototype inside a case study. At rest it's a still of the prototype in the usual
 * media card. Hovering (or focusing) dims the still and shows what it is: "Try the working
 * prototype", and what it was built with. Clicking opens the prototype itself, full size in
 * the expanded view, with a line under it on what to try. The prototype only loads once it's
 * opened, so the case study stays light. On touch screens the label shows without hover.
 */
export default function PrototypeCard({
  src,
  poster,
  title,
  hint,
  label,
  builtWith = "Claude Code",
}: {
  /** The prototype page, e.g. /prototypes/artemis-insurance.html */
  src: string;
  /** A still of the prototype for the resting card */
  poster: string;
  /** Names the prototype for screen readers and the expanded view */
  title: string;
  /** What to try, shown under the open prototype */
  hint: string;
  /** Optional line under the resting card */
  label?: string;
  builtWith?: string;
}) {
  const [open, setOpen] = useState(false);
  const [ratio, setRatio] = useState(16 / 10);
  const close = useCallback(() => setOpen(false), []);

  const show = () => {
    // Fill the screen around the prototype, leaving room for the close button and the hint
    const phone = window.innerWidth < 768;
    const w = window.innerWidth - (phone ? 32 : 112);
    const h = window.innerHeight - (phone ? 120 : 160);
    setRatio(w / h);
    setOpen(true);
  };

  return (
    <figure className="m-0 flex min-w-0 flex-col">
      <div className="cs-pair-media relative overflow-hidden rounded-lg">
        <button
          type="button"
          onClick={show}
          aria-label={`Open the working prototype: ${title}`}
          data-sound="whisper"
          data-sound-click="pop"
          className="group relative block w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grape"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" loading="lazy" decoding="async" className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.01] motion-reduce:transition-none" />
          <span className="absolute inset-0 bg-[#12020f]/0 transition-colors duration-300 group-hover:bg-[#12020f]/55 group-focus-visible:bg-[#12020f]/55 motion-reduce:transition-none" />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-[8px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:justify-end [@media(hover:none)]:pb-[16px] [@media(hover:none)]:opacity-100">
            <span className="flex items-center gap-[8px] rounded-full bg-white px-[20px] py-[10px] font-body text-body-md font-medium text-heading shadow-[0_8px_24px_rgba(18,2,15,0.25)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 3l14 8-6 1.5L10 19z" />
              </svg>
              Try the working prototype
            </span>
            <span className="font-geist text-caption text-white/80 [@media(hover:none)]:hidden">Built with {builtWith}</span>
          </span>
        </button>
      </div>
      <CardFooter label={label} />
      {open && (
        <Expanded
          label={title}
          ratio={ratio}
          onClose={close}
          caption={<p className="max-w-[640px] text-center font-geist text-[14px] leading-[20px] text-white/70">{hint}</p>}
        >
          <iframe src={src} title={title} className="block h-full w-full border-0 bg-white" />
        </Expanded>
      )}
    </figure>
  );
}
