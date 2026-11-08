"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import StickerBoard from "./StickerBoard";

/** "Turning on the porch light…" — once per visit, skipped with reduced motion. */
function PorchLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("guesthouse_porch")) return;
      sessionStorage.setItem("guesthouse_porch", "1");
    } catch {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;
  return (
    <div className="porch-loader demo-paper fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4" aria-hidden="true">
      <svg width="56" height="72" viewBox="0 0 56 72" fill="none" className="scribble">
        <path d="M28 0v14" stroke="#32073e" strokeWidth="2" />
        <path d="M16 14h24l6 18H10z" fill="#32073e" />
        <circle className="bulb-on" cx="28" cy="40" r="10" fill="#f8c2f7" />
        <circle className="bulb-on" cx="28" cy="40" r="26" fill="#f8c2f7" opacity="0.25" />
      </svg>
      <p className="m-0 font-handwriting text-[28px] leading-[28px] text-primary">Turning on the porch light…</p>
    </div>
  );
}

export default function CheckIn({
  calm,
  onToggleCalm,
  stamps,
  totalRooms,
}: {
  calm: boolean;
  onToggleCalm: () => void;
  stamps: number;
  totalRooms: number;
}) {
  return (
    <section className="page-container relative pt-[136px] lg:min-h-[800px] lg:pt-[160px]">
      <PorchLoader />

      {/* Text sits in the middle; on desktop the stickers frame it */}
      <div className="relative z-[1] mx-auto flex max-w-[600px] flex-col items-center gap-6 text-center lg:pointer-events-none lg:[&_a]:pointer-events-auto">
        <span className="font-brand text-[12px] uppercase leading-[16px] tracking-[2px] text-grape">Check-in · Bangalore, India</span>
        <h1 className="m-0 text-balance font-heading text-[34px] font-normal leading-[38px] tracking-[-1px] text-heading md:text-[44px] md:leading-[48px] lg:text-[52px] lg:leading-[56px] lg:tracking-[-2px]">
          Welcome in. I&apos;m <em>Ashmik Ragesh</em>, a product designer who also hosts.
        </h1>
        <p className="m-0 max-w-[520px] text-pretty text-[16px] leading-[26px] text-secondary md:text-[18px] md:leading-[28px]">
          I design products the way I run my Airbnbs in Bangalore — notice what people need before they ask, then get out of
          their way.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#rooms"
            className="flex h-[44px] items-center gap-2 rounded-lg bg-primary px-5 font-brand font-medium text-[14px] uppercase leading-[20px] tracking-[1px] text-white transition-colors hover:bg-grape"
          >
            See the rooms <ArrowDown size={16} strokeWidth={1.8} />
          </a>
          <a
            href="/resume"
            className="flex h-[44px] items-center gap-1 font-brand text-[14px] uppercase leading-[20px] tracking-[1px] text-primary underline decoration-grape/40 underline-offset-4 hover:decoration-grape"
          >
            Registration card <ArrowUpRight size={16} strokeWidth={1.8} />
          </a>
        </div>
      </div>

      {/* Sticker board: overlays the hero on desktop, sits under the text on smaller screens */}
      <div className="relative mt-10 h-[800px] lg:absolute lg:inset-x-[100px] lg:bottom-0 lg:top-[112px] lg:mt-0 lg:h-auto">
        <StickerBoard calm={calm} onToggleCalm={onToggleCalm} stamps={stamps} totalRooms={totalRooms} />
      </div>
    </section>
  );
}
