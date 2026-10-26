"use client";

import Link from "next/link";
import { KeyRound, BookOpen, DoorOpen, FileText } from "lucide-react";
import { useStay, formatStay } from "./useGuesthouse";

const links = [
  { label: "Rooms", href: "#rooms", Icon: KeyRound },
  { label: "Guestbook", href: "#guestbook", Icon: BookOpen },
  { label: "Check-out", href: "#check-out", Icon: DoorOpen },
];

// Same bar as the live navbar (68px, under the 20px ruler) — themed copy only.
export default function DemoNav() {
  const stay = useStay();

  return (
    <header className="fixed inset-x-0 top-[20px] z-50 h-[68px] border-b border-line/60 bg-[#faf6ef]/90 backdrop-blur-[8px]">
      <nav className="page-container flex h-full items-center justify-between">
        <Link href="/demo" aria-label="Back to check-in" className="group flex shrink-0 items-baseline gap-2">
          <span className="hidden font-brand text-[10px] uppercase leading-[12px] tracking-[1px] text-muted sm:inline">Staying</span>
          <span className="w-[84px] font-heading text-[32px] italic leading-[40px] tracking-[0px] text-heading tabular-nums">
            {formatStay(stay)}
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <ul className="m-0 flex list-none items-center gap-1 p-0 lg:gap-6">
            {links.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="flex items-center gap-2 whitespace-nowrap rounded-full p-2 font-brand text-[14px] uppercase leading-[20px] tracking-[1px] text-secondary transition-colors hover:text-grape lg:p-0"
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span className="hidden lg:inline">{label}</span>
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/resume"
            className="flex h-[40px] items-center gap-2 whitespace-nowrap rounded-[10px] bg-primary px-4 font-brand font-medium text-[14px] uppercase leading-[20px] tracking-[1px] text-white transition-colors hover:bg-grape"
          >
            <FileText size={16} strokeWidth={1.6} />
            <span className="hidden sm:inline">Registration card</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
