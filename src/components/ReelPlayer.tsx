"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Maximize2 } from "lucide-react";
import { useChatDrawer } from "@/context/ChatContext";

// Figma arrow/arrow-up icon — points up by default; rotate-90 = right, rotate-180 = down
function ArrowIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12.0001 15.3333"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block" }}
    >
      <path
        d="M1.00006 5.85867C2.29637 4.10584 3.81072 2.53153 5.5048 1.1746C5.65012 1.0582 5.82509 1 6.00006 1M11.0001 5.85867C9.70376 4.10583 8.18941 2.53153 6.49533 1.1746C6.35 1.0582 6.17503 1 6.00006 1M6.00006 1V14.3333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Reel {
  youtubeId: string;
  title: string;
  projectHref: string;
}

const reels: Reel[] = [
  { youtubeId: "2rs_wDV_0Ww", title: "Artemis Design System", projectHref: "#" },
  { youtubeId: "2rs_wDV_0Ww", title: "PokerGPT", projectHref: "#" },
  { youtubeId: "2rs_wDV_0Ww", title: "RBC AI Solution", projectHref: "#" },
];

const floatSrc = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&iv_load_policy=3&rel=0`;

const expandSrc = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1`;

export default function ReelPlayer() {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { isOpen: chatOpen } = useChatDrawer();

  // Lock body scroll when expanded
  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [expanded]);

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + reels.length) % reels.length);

  const reel = reels[index];

  return (
    <>
      {/* ── Floating card ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Expand reel"
        className={`
          fixed bottom-8 z-[45] cursor-pointer select-none
          transition-[right] duration-300 ease-in-out
          right-[20px] md:right-[80px] lg:right-[100px]
          ${chatOpen ? "lg:!right-[500px]" : ""}
        `}
        style={{
          transform: hovered ? "scale(1.13)" : "scale(1)",
          transition: hovered
            ? "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), right 0.3s ease-in-out"
            : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), right 0.3s ease-in-out",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(true)}
      >
        {/* Navy bezel frame */}
        <div className="bg-blackcurrant p-[4px] rounded-[8px] shadow-[0_8px_32px_rgba(0,0,0,0.32)]">
          <div className="relative w-[102px] h-[180px] rounded-[6px] overflow-hidden bg-black">
            <iframe
              key={index}
              src={floatSrc(reel.youtubeId)}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ border: "none" }}
              title={reel.title}
            />
            {/* Expand overlay on hover */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                hovered ? "opacity-100 bg-black/30" : "opacity-0"
              }`}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                <Maximize2 size={16} strokeWidth={1.5} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded overlay ── */}
      {expanded && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#060d18] px-4 py-10">
          {/* Full-width flex row: video column (flex-1, centered) + right column (close + nav) */}
          <div
            className="flex items-center w-full h-full"
            style={
              {
                "--vh": "min(604px, calc(100svh - 150px))",
                "--vw": "calc(var(--vh) * 9 / 16)",
              } as React.CSSProperties
            }
          >
            {/* Video + CTA — centered within flex-1, 20px gap between them */}
            <div className="flex flex-1 flex-col items-center justify-center gap-5">
              {/* Phone-frame video — fully rounded */}
              <div
                className="relative rounded-[16px] overflow-hidden bg-black"
                style={{ width: "var(--vw)", height: "var(--vh)" }}
              >
                <iframe
                  key={index}
                  src={expandSrc(reel.youtubeId)}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: "none" }}
                  title={reel.title}
                />
              </div>

              {/* View Case Study — standalone button with its own rounding */}
              <Link
                href={reel.projectHref}
                className="flex items-center justify-center gap-2 bg-blackcurrant hover:bg-blackcurrant transition-colors h-[50px] px-4 rounded-[10px] text-white font-brand font-medium text-[15px] tracking-[-0.07px]"
                style={{ width: "var(--vw)" }}
              >
                View Case Study
                <ArrowIcon size={16} className="rotate-90" />
              </Link>
            </div>

            {/* Right column: close pinned top, nav buttons centered in remaining space */}
            <div className="flex flex-col items-center shrink-0 pr-6 self-stretch">
              {/* Close — top of column */}
              <button
                onClick={() => setExpanded(false)}
                aria-label="Close"
                className="flex items-center justify-center size-[46px] rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
              {/* Nav buttons — centered in remaining height */}
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous reel"
                  className="flex items-center justify-center size-[46px] rounded-full bg-blackcurrant text-white hover:bg-blackcurrant transition-colors"
                >
                  <ArrowIcon size={18} />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next reel"
                  className="flex items-center justify-center size-[46px] rounded-full bg-blackcurrant text-white hover:bg-blackcurrant transition-colors"
                >
                  <ArrowIcon size={18} className="rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
