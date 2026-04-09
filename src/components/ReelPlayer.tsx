"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronUp, ChevronDown, ArrowRight, Maximize2 } from "lucide-react";
import { useChatDrawer } from "@/context/ChatContext";

interface Reel {
  youtubeId: string;
  title: string;
  projectHref: string;
}

// TODO: Replace youtubeId with actual YouTube Short IDs and update projectHref per project
const reels: Reel[] = [
  { youtubeId: "dQw4w9WgXcQ", title: "Artemis Design System", projectHref: "#" },
  { youtubeId: "dQw4w9WgXcQ", title: "PokerGPT", projectHref: "#" },
  { youtubeId: "dQw4w9WgXcQ", title: "RBC AI Solution", projectHref: "#" },
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
          transition-[right,transform] duration-300 ease-in-out
          right-[20px] md:right-[80px] lg:right-[100px]
          ${chatOpen ? "lg:!right-[500px]" : ""}
          ${hovered ? "scale-[1.08]" : "scale-100"}
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(true)}
      >
        {/* Navy bezel frame */}
        <div className="bg-[#172b4d] p-[4px] rounded-[8px] shadow-[0_8px_32px_rgba(0,0,0,0.32)]">
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#060d18]">
          {/* Close — top left */}
          <button
            onClick={() => setExpanded(false)}
            aria-label="Close"
            className="absolute top-5 left-5 flex items-center justify-center size-[36px] rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          {/* Video column + nav row */}
          <div className="flex items-center gap-4">
            {/* Video + CTA stacked vertically */}
            <div className="flex flex-col gap-0">
              {/* Phone-frame video — no bezel, just rounded corners */}
              <div className="relative w-[380px] h-[676px] rounded-t-[16px] overflow-hidden bg-black">
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

              {/* See Full Project — below the video */}
              <Link
                href={reel.projectHref}
                className="flex items-center justify-between w-[380px] bg-[#111827] hover:bg-[#1a2537] transition-colors px-6 py-5 rounded-b-[16px] text-white font-brand font-medium text-[15px] tracking-[-0.07px]"
              >
                See Full Project
                <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </div>

            {/* Up / Down navigation — down on top, up on bottom (matches screenshot) */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => go(1)}
                aria-label="Next reel"
                className="flex items-center justify-center size-[44px] rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronDown size={22} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => go(-1)}
                aria-label="Previous reel"
                className="flex items-center justify-center size-[44px] rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronUp size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
