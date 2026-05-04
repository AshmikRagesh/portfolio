"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, LayoutGrid, CirclePlay, CircleUser, ArrowLeft } from "lucide-react";
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";
import { useChatDrawer } from "@/context/ChatContext";

const navLinks = [
  { label: "Works", href: "#works", Icon: LayoutGrid, tabletHidden: true },
  { label: "Playground", href: "#playground", Icon: CirclePlay },
  { label: "About", href: "#about", Icon: CircleUser },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function NavTimer() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Persist start time in sessionStorage — survives page navigation,
    // cleared automatically when the tab is closed.
    const key = "ash_visit_start";
    const stored = sessionStorage.getItem(key);
    const startTime = stored ? parseInt(stored, 10) : Date.now();
    if (!stored) sessionStorage.setItem(key, String(startTime));

    setElapsed(Math.floor((Date.now() - startTime) / 1000));

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <Link href="/" aria-label="Home" className="group relative shrink-0 select-none">
      {/* Fixed-width block so the tooltip anchor never shifts */}
      <span className="font-heading italic font-normal text-[30px] md:text-[32px] lg:text-[36px] text-heading tracking-[-0.3px] md:tracking-[-0.32px] lg:tracking-[-0.36px] leading-[38px] md:leading-[44px] tabular-nums block w-[72px] md:w-[82px] lg:w-[94px]">
        {formatTime(elapsed)}
      </span>

      {/* Tooltip — centered on the fixed-width container */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <div className="flex items-center gap-[6px] bg-[#172b4d] rounded px-2 py-[6px] whitespace-nowrap">
          <img src="/icons/clock-filled.svg" alt="" width={14} height={14} className="shrink-0" />
          <span className="font-brand font-medium text-[12px] text-white tracking-[-0.06px]">
            Measuring your curiosity
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isOpen, toggle: toggleChat } = useChatDrawer();
  const pathname = usePathname();
  const isCaseStudy = pathname.startsWith("/works/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={`fixed ${isCaseStudy ? "top-0" : "top-[28px]"} left-0 h-[68px] z-50 bg-background border-b border-[#c8ccd4] transition-[right,box-shadow] duration-300 ease-in-out ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)]" : ""
      } ${isOpen ? "lg:right-[400px] right-0" : "right-0"}`}
    >
      {/* Main nav row */}
      <nav className="flex items-center justify-between h-full px-[20px] md:px-[80px] lg:px-[100px]">
        {/* Mobile on case study pages: back button. Everything else: Ash logo */}
        {isCaseStudy ? (
          <>
            <Link
              href="/#works"
              className="md:hidden flex items-center gap-2 font-brand text-[14px] font-medium uppercase tracking-[1px] text-[#9ca3af] hover:text-[#091624] transition-colors duration-150 shrink-0"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              Back
            </Link>
            <div className="hidden md:block">
              <NavTimer />
            </div>
          </>
        ) : (
          <NavTimer />
        )}

        {/* Desktop + tablet: nav links + CTA */}
        <div className="hidden md:flex items-center gap-[20px]">
          <ul className="flex items-center gap-[24px]">
            {navLinks.map(({ label, href, Icon, tabletHidden }) => (
              <li key={label} className={tabletHidden ? "hidden lg:block" : undefined}>
                <a
                  href={href}
                  className="group/tab flex items-center gap-2 font-brand text-[14px] font-normal text-[#354454] uppercase tracking-[1px] transition-colors duration-200 hover:text-black hover:underline hover:decoration-wavy"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="transition-[stroke-width] duration-200 group-hover/tab:stroke-2"
                  />
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={toggleChat}
            className={`flex items-center gap-2 text-white font-brand font-medium text-[15px] tracking-[-0.075px] px-[16px] h-[42px] rounded-[10px] transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                isOpen ? "bg-[#0049c4]" : "bg-[#172b4d] hover:bg-[#0049c4]"
              }`}
          >
            <SparkleAiIcon size={16} />
            ASH LLM
          </button>
        </div>

        {/* Mobile: ASH LLM button + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={toggleChat}
            className={`flex items-center gap-2 text-white font-brand font-medium text-[15px] tracking-[-0.075px] px-[16px] py-[8px] rounded-[10px] transition-colors duration-200 whitespace-nowrap cursor-pointer ${
              isOpen ? "bg-[#0049c4]" : "bg-[#172b4d] hover:bg-[#0049c4]"
            }`}
          >
            <SparkleAiIcon size={16} />
            ASH LLM
          </button>
          <button
            className="flex items-center justify-center w-[38px] self-stretch rounded-full border-[0.5px] border-[#c8ccd4] bg-[rgba(23,43,77,0.1)] p-[4px] text-[#091624]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-background border-b border-[#c8ccd4]">
          {/* Nav items — each with a bottom divider */}
          <ul>
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label} className="border-b border-[#e8eaed]">
                <a
                  href={href}
                  className="flex items-center gap-3 font-brand text-[14px] font-normal text-[#354454] uppercase tracking-[1px] px-[20px] py-5 transition-colors duration-200 hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 px-[20px] py-8">
            <button
              type="button"
              onClick={() => { toggleChat(); setMenuOpen(false); }}
              className={`w-full flex items-center justify-center gap-2 text-white font-brand font-medium text-[15px] tracking-[-0.075px] px-[16px] py-[10px] rounded-[10px] transition-colors duration-200 cursor-pointer ${
                isOpen ? "bg-[#0049c4]" : "bg-[#172b4d] hover:bg-[#0049c4]"
              }`}
            >
              <SparkleAiIcon size={16} />
              ASH LLM
            </button>
            <a
              href="/resume"
              className="w-full flex items-center justify-center font-brand font-medium text-[15px] tracking-[-0.075px] px-[16px] py-[10px] rounded-[10px] border border-[#c8ccd4] text-[#354454] hover:border-[#354454] transition-colors duration-200"
            >
              Resume
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
