"use client";

// ── Bella's line for a moment ─────────────────────────────────────────────────
// The tooltip Bella shows while it plays a moment (lib/bella/progress): a celebration
// or a welcome back. Same look as the milestone lines: Geist on midnight. A welcome back
// links to where the visitor left off. A cross closes it early, so it can be read at
// the visitor's own pace and put away.

import Link from "next/link";
import { X } from "lucide-react";
import { skipMoment, type Moment } from "@/lib/bella/progress";

export default function BellaLine({ moment, pointer = "top", pointerLeft }: { moment: Moment; pointer?: "top" | "bottom"; pointerLeft?: string }) {
  const link = moment.kind === "welcome" ? { href: moment.href, text: moment.link } : null;
  return (
    <div className="host-tip relative w-max max-w-[min(320px,calc(100vw-40px))]">
      <span
        aria-hidden="true"
        className={`absolute ${pointer === "top" ? "-top-[4px] left-[26px]" : "-bottom-[4px] left-1/2 -ml-[4px]"} h-[8px] w-[8px] rotate-45 rounded-xs bg-midnight`}
        style={pointerLeft ? { left: pointerLeft, marginLeft: 0 } : undefined}
      />
      <div className="relative flex items-start gap-[4px] rounded-md bg-midnight py-[8px] pl-[12px] pr-[4px] font-geist font-normal text-[14px] leading-[20px] text-white shadow-[0_8px_20px_rgba(30,5,37,0.22)]">
        <span role="status">
          {moment.line}
          {link && (
            <>
              {" "}
              <Link href={link.href} onClick={skipMoment} className="whitespace-nowrap text-[#f7b3d8] underline underline-offset-4 hover:text-white">
                {link.text}
              </Link>
            </>
          )}
        </span>
        {/* Close: a 16px cross in a 32px tap area that tucks into the padding, so the pill stays slim */}
        <button
          type="button"
          onClick={skipMoment}
          aria-label="Close"
          className="relative -my-[6px] grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b3d8]"
        >
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
