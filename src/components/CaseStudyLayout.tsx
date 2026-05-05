"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp } from "lucide-react";
import Footer from "@/components/Footer";

export interface CaseStudySection {
  id: string;
  label: string;
}

interface CaseStudyLayoutProps {
  sections: CaseStudySection[];
  backHref?: string;
  children: React.ReactNode;
}

export default function CaseStudyLayout({
  sections,
  backHref = "/#works",
  children,
}: CaseStudyLayoutProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const handleScroll = () => {
      // If scrolled to the bottom of the page, activate the last section
      const atBottom =
        window.scrollY + window.innerHeight >= document.body.scrollHeight - 40;
      if (atBottom) {
        setActiveId(sections[sections.length - 1]?.id ?? "");
        return;
      }

      // Otherwise activate the last section whose top has passed the trigger line
      const trigger = window.scrollY + 120;
      let current = sections[0]?.id ?? "";
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= trigger) current = id;
      }
      setActiveId(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
    <div className="flex min-h-screen pt-[68px]">

      {/* ── Sticky sidebar (desktop only) ── */}
      <aside className="hidden lg:flex flex-col w-[272px] xl:w-[323px] shrink-0 sticky top-[68px] self-start h-[calc(100vh-68px)] pl-[100px] pr-4 py-10 overflow-y-auto">
        {/* Back / Home link */}
        <Link
          href={backHref}
          className="flex items-center gap-2 font-brand text-[12px] font-medium uppercase tracking-[1.5px] text-[#6b7280] hover:text-[#091624] transition-colors duration-150 mb-8"
        >
          <ArrowLeft size={12} strokeWidth={2} />
          Home
        </Link>

        {/* TABLE OF CONTENTS card */}
        <div className="bg-[#f4f5f6] border border-[#e8eaed] rounded-[12px] p-3">
          <p className="font-brand font-medium text-[10px] uppercase tracking-[2px] text-[#354454] px-2 mb-3 whitespace-nowrap">
            Table of Contents
          </p>
          <nav className="flex flex-col gap-[2px]">
            {sections.map(({ id, label }, i) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-left w-full flex items-baseline gap-[8px] px-2 py-[7px] rounded-[8px] transition-colors duration-150 ${
                  activeId === id
                    ? "bg-[#e2ecff] text-[#172b4d]"
                    : "text-[#6b7280] hover:text-[#172b4d]"
                }`}
              >
                <span className={`font-brand font-medium text-[11px] shrink-0 leading-none ${activeId === id ? "text-[#0049c4]" : "text-[#9ca3af]"}`}>
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <span className="font-body text-[14px] leading-[1.4]">
                  {label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Back to top — pinned to bottom */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 font-brand text-[12px] font-medium uppercase tracking-[1.5px] text-[#6b7280] hover:text-[#091624] transition-colors duration-150 mt-auto"
        >
          <ArrowUp size={12} strokeWidth={2} />
          Back to top
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0">

        {/* Mobile sticky nav — section tabs only (back is in the navbar) */}
        <div className="lg:hidden sticky top-[68px] z-30 bg-white border-b border-[#e8eaed]">
          <div className="flex overflow-x-auto gap-6 px-5 py-2 scrollbar-hide">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`shrink-0 font-body text-[15px] py-1.5 border-b-2 transition-colors duration-150 whitespace-nowrap ${
                  activeId === id
                    ? "border-[#172b4d] text-[#172b4d]"
                    : "border-transparent text-[#9ca3af] hover:text-[#0049c4]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {children}
      </main>
    </div>
    <Footer />
    </>
  );
}
