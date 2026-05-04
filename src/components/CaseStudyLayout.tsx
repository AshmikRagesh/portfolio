"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <div className="flex min-h-screen pt-[84px]">

      {/* ── Sticky sidebar (desktop only) ── */}
      <aside className="hidden lg:flex flex-col w-[260px] xl:w-[300px] shrink-0 sticky top-[84px] self-start h-[calc(100vh-84px)] pl-[100px] pr-8 py-10 overflow-y-auto">
        {/* Back button */}
        <Link
          href={backHref}
          className="flex items-center gap-2 font-brand text-[16px] font-medium uppercase tracking-[1px] text-[#9ca3af] hover:text-[#091624] transition-colors duration-150 mb-8"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back
        </Link>

        {/* Section nav */}
        <nav className="flex flex-col">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`text-left font-body font-normal text-[18px] leading-[1.5] py-1 transition-colors duration-150 ${
                activeId === id
                  ? "text-[#172b4d]"
                  : "text-[#9ca3af] hover:text-[#0049c4]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0">

        {/* Mobile sticky nav — section tabs only (back is in the navbar) */}
        <div className="lg:hidden sticky top-[84px] z-30 bg-white border-b border-[#e8eaed]">
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
