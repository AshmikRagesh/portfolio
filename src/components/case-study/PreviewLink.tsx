"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Tag } from "@/components/Tag";

/**
 * An inline link to another case study that previews it on hover or keyboard focus: a
 * small white card (no pointer) springs in under the link — rising and scaling up from
 * its top-left with a slight overshoot — with the case study's cover, a tag, its title
 * and a line. The card stays open while the pointer moves onto it, and it
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
  preview: { tag: string; title: string; description: string; image?: string };
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
        className={`absolute left-0 top-full z-50 block w-[272px] origin-top-left pt-[10px] transition-[opacity,transform] motion-reduce:transition-none ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100 duration-[420ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            : "pointer-events-none translate-y-[8px] scale-[0.92] opacity-0 duration-[180ms] ease-out"
        }`}
      >
        <Link
          href={href}
          tabIndex={-1}
          className="block overflow-hidden rounded-xl border border-line-soft bg-white shadow-[0_2px_0_rgba(200,204,212,0.45),0_16px_40px_rgba(30,5,37,0.08)]"
        >
          <span className="relative block h-[112px] bg-placeholder">
            {preview.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </span>
          <span className="flex flex-col gap-[6px] p-[14px]">
            <span className="block">
              <Tag tone="grey">{preview.tag}</Tag>
            </span>
            <span className="block font-heading text-[18px] leading-[24px] text-heading">{preview.title}</span>
            <span className="block font-body text-[14px] leading-[22px] text-secondary">{preview.description}</span>
          </span>
        </Link>
      </span>
    </span>
  );
}
