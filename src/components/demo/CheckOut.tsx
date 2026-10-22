"use client";

import { ArrowUpRight } from "lucide-react";
import { useStay, formatStay } from "./useGuesthouse";

const socials = [
  { label: "LinkedIn", href: "https://linkedin.com/in/ashmikragesh" },
  { label: "Twitter / X", href: "https://twitter.com/ashmikragesh" },
  { label: "Discord", href: "https://discord.com/users/ashmikragesh" },
];

// Footer as check-out: how long you stayed, how to stay in touch, housekeeping date.
export default function CheckOut({ roomsStayed, totalRooms }: { roomsStayed: number; totalRooms: number }) {
  const stay = useStay();

  return (
    <footer id="check-out" className="page-container scroll-mt-24 pb-4 pt-[72px] md:pb-6 md:pt-[96px] lg:pb-[40px] lg:pt-[128px]">
      <div className="demo-lamp flex flex-col items-center gap-10 rounded-[24px] bg-midnight px-6 py-16 text-center text-white md:px-16 md:py-20 lg:rounded-[40px] lg:px-[180px] lg:py-[96px]">
        <span className="font-brand text-[12px] uppercase leading-[16px] tracking-[2px] text-pink">Check-out</span>
        <h2 className="m-0 max-w-[16ch] text-balance font-heading text-[34px] font-normal leading-[38px] tracking-[-1px] md:text-[44px] md:leading-[48px] lg:text-[52px] lg:leading-[56px] lg:tracking-[-2px]">
          Thanks for staying.
        </h2>

        {/* Receipt-style summary of the visit */}
        <dl className="m-0 grid w-full max-w-[400px] grid-cols-[1fr_auto] gap-y-2 border-y border-dashed border-white/25 py-4 text-left font-brand text-[12px] uppercase leading-[16px] tracking-[1px]">
          <dt className="text-white/60">Length of stay</dt>
          <dd className="m-0 tabular-nums">{formatStay(stay)}</dd>
          <dt className="text-white/60">Rooms visited</dt>
          <dd className="m-0 tabular-nums">
            {roomsStayed} / {totalRooms}
          </dd>
          <dt className="text-white/60">Balance due</dt>
          <dd className="m-0">₹0 — on the house</dd>
        </dl>

        <p className="m-0 max-w-[480px] text-pretty text-[16px] leading-[26px] text-white/70 md:text-[18px] md:leading-[28px]">
          Leaving already? The door&apos;s always open — say hello, or leave a note in the guestbook.
        </p>

        <ul className="m-0 flex list-none flex-wrap justify-center gap-3 p-0">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[44px] items-center gap-2 rounded-full border border-white/25 px-5 font-brand text-[12px] uppercase leading-[16px] tracking-[1px] transition-colors hover:border-pink hover:text-pink"
              >
                {s.label} <ArrowUpRight size={14} />
              </a>
            </li>
          ))}
        </ul>

        <p className="m-0 font-brand text-[12px] leading-[16px] text-white/50">Housekeeping · Oct 2026 · Bangalore</p>
      </div>
    </footer>
  );
}
