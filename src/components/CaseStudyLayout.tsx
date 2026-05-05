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
          className="flex items-center gap-2 font-brand text-[13px] font-medium uppercase tracking-[1.5px] text-[#6b7280] hover:text-[#091624] hover:-translate-x-[3px] transition-all duration-200 mb-8"
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Home
        </Link>

        {/* Nav card — no header */}
        <div className="bg-[#f8f9fa] border border-[#edf0f3] rounded-[12px] p-3">
          <nav className="flex flex-col gap-[2px]">
            {sections.map(({ id, label }, i) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-left w-full flex items-baseline gap-[8px] px-2 py-[7px] rounded-[8px] transition-colors duration-150 ease-in-out ${
                  activeId === id
                    ? "bg-[#e2ecff] text-[#0049c4]"
                    : "text-[#6b7280] hover:text-[#172b4d] hover:bg-[#f0f4ff]"
                }`}
              >
                <span className="font-body text-[13px] shrink-0 leading-none">
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
          className="flex items-center gap-2 font-brand text-[13px] font-medium uppercase tracking-[1.5px] text-[#6b7280] hover:text-[#091624] hover:-translate-y-[3px] transition-all duration-200 mt-auto"
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          <ArrowUp size={13} strokeWidth={2} />
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
