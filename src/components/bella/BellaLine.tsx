"use client";

// ── Bella's line for a moment ─────────────────────────────────────────────────
// The tooltip Bella shows while it plays a moment (lib/bella/progress): a room key, a
// new stamp, a celebration, or a welcome back. Same look as the milestone lines: Geist
// on midnight. A stamp shows small beside the words; stamps and celebrations link to the
// guest card on the Front desk, a welcome back links to where the visitor left off.

import Link from "next/link";
import Stamp from "@/components/bella/Stamp";
import { skipMoment, type Moment } from "@/lib/bella/progress";

export default function BellaLine({ moment, pointer = "top" }: { moment: Moment; pointer?: "top" | "bottom" }) {
  const stamp = moment.kind === "stamp" ? moment.stamp : moment.kind === "celebrate" ? moment.stamp : undefined;
  const link =
    moment.kind === "welcome"
      ? { href: moment.href, text: moment.link }
      : moment.kind === "stamp" || moment.kind === "celebrate" || moment.kind === "key"
        ? { href: "/front-desk", text: "See your card" }
        : null;
  return (
    <div className="host-tip relative w-max max-w-[min(320px,calc(100vw-40px))]">
      <span
        aria-hidden="true"
        className={`absolute ${pointer === "top" ? "-top-[4px] left-[26px]" : "-bottom-[4px] left-1/2 -ml-[4px]"} h-[8px] w-[8px] rotate-45 rounded-xs bg-midnight`}
      />
      <div
        role="status"
        className="relative flex items-center gap-[8px] rounded-md bg-midnight px-[12px] py-[8px] font-geist font-normal text-[14px] leading-[20px] text-white shadow-[0_8px_20px_rgba(30,5,37,0.22)]"
      >
        {stamp && (
          <span className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full bg-[#f6efe2]">
            <Stamp stamp={stamp} className="bella-stamp-thud h-[30px] w-[30px]" />
          </span>
        )}
        <span>
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
      </div>
    </div>
  );
}
