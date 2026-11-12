"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CtaPill } from "@/components/Cta";

/**
 * An inline link to another case study that previews it on hover or keyboard focus: a
 * small version of the Works card (no pointer) springs in under the link — rising and
 * scaling up from its top-left with a slight overshoot — with the case study's cover, its
 * title and the "Read case study" pill. The card stays open while the pointer moves onto it, and it
 * closes a beat after leaving. Built from spans so it can sit inside a paragraph. On
 * touch screens the link simply navigates.
 */
export default function PreviewLink({
  href,
  children,
  preview,
}: {
  href: string;
  children: React.ReactNode;
  preview: { title: string; image?: string };
}) {
  const [open, setOpen] = useState(false);
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closing.current) clearTimeout(closing.current);
    setOpen(true);
  };
  const hide = () => {
    closing.current = setTimeout(() => setOpen(false), 160);
  };

  return (
    <span className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      <Link
        href={href}
        onFocus={show}
        onBlur={hide}
        className="text-heading underline decoration-grape decoration-[2px] underline-offset-[4px] transition-colors duration-200 hover:text-grape focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape"
      >
        {children}
      </Link>
      <span
        role="tooltip"
        aria-hidden={!open}
        className={`absolute left-0 top-full z-50 block w-[288px] origin-top-left pt-[10px] transition-[opacity,transform] motion-reduce:transition-none ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100 duration-[420ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            : "pointer-events-none translate-y-[8px] scale-[0.92] opacity-0 duration-[180ms] ease-out"
        }`}
      >
        {/* The Works card in miniature: soft grey surface, framed cover, serif title, pill */}
        <Link
          href={href}
          tabIndex={-1}
          className="work-card group flex flex-col gap-[14px] rounded-xl p-[12px] pb-[16px] shadow-[0_16px_40px_rgba(30,5,37,0.12)]"
        >
          <span className="work-media relative block aspect-[1071/608] overflow-hidden rounded-lg bg-placeholder">
            {preview.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.image} alt="" className="work-media__img absolute inset-0 h-full w-full object-cover" />
            )}
          </span>
          <span className="block px-[4px] text-balance font-heading text-[20px] leading-[26px] tracking-[-0.5px] text-heading">{preview.title}</span>
          <span className="block px-[4px]">
            <CtaPill size="sm">Read case study</CtaPill>
          </span>
        </Link>
      </span>
    </span>
  );
}
