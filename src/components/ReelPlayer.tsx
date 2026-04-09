"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Maximize2, X, ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import { useChatDrawer } from "@/context/ChatContext";

interface Reel {
  videoSrc: string;
  title: string;
  projectHref: string;
}

// TODO: Replace videoSrc paths with real video files in /public/videos/
const reels: Reel[] = [
  { videoSrc: "/videos/reel-1.mp4", title: "Artemis Design System", projectHref: "#" },
  { videoSrc: "/videos/reel-2.mp4", title: "PokerGPT", projectHref: "#" },
  { videoSrc: "/videos/reel-3.mp4", title: "RBC AI Solution", projectHref: "#" },
];

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
        {/* Outer navy bezel — matches Figma spec */}
        <div className="bg-[#172b4d] p-[4px] rounded-[8px] shadow-[0_8px_32px_rgba(0,0,0,0.32)]">
          <div className="relative w-[102px] h-[180px] rounded-[6px] overflow-hidden">
            <video
              key={index}
              src={reel.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Expand overlay on hover */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                hovered ? "opacity-100 bg-black/25" : "opacity-0"
              }`}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                <Maximize2 size={18} strokeWidth={1.5} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded overlay ── */}
      {expanded && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(25,25,25,0.96)_0%,_rgba(0,0,0,0.98)_100%)]">
          {/* Close */}
          <button
            onClick={() => setExpanded(false)}
            aria-label="Close"
            className="absolute top-6 right-6 flex items-center justify-center size-[40px] rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          {/* Phone frame + nav */}
          <div className="flex items-center gap-5">
            {/* Phone-shaped video — navy bezel matches Figma spec */}
            <div className="bg-[#172b4d] p-[4px] rounded-[8px] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
              <div className="relative w-[332px] h-[612px] rounded-[6px] overflow-hidden">
                <video
                  key={index}
                  src={reel.videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* See Full Project bar */}
                <Link
                  href={reel.projectHref}
                  className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-[#0d1821]/80 backdrop-blur-sm px-5 py-4 text-white font-brand font-medium text-[14px] tracking-[-0.07px] hover:bg-[#0d1821]/95 transition-colors"
                >
                  See Full Project
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            {/* Up / Down navigation */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => go(-1)}
                aria-label="Previous reel"
                className="flex items-center justify-center size-[44px] rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronUp size={22} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next reel"
                className="flex items-center justify-center size-[44px] rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronDown size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
