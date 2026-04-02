"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LayoutGrid, CirclePlay, CircleUser } from "lucide-react";
import { useChatDrawer } from "@/context/ChatContext";

// TODO: Replace with permanent SVG asset (Figma URL expires in ~7 days)
const ICON_SPARKLE =
  "https://www.figma.com/api/mcp/asset/1858483a-3433-4113-b266-1594a7d33744";

const navLinks = [
  { label: "Works", href: "#works", Icon: LayoutGrid },
  { label: "Playground", href: "#playground", Icon: CirclePlay },
  { label: "About", href: "#about", Icon: CircleUser },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isOpen, toggle: toggleChat } = useChatDrawer();

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
      className={`fixed top-0 left-0 h-[80px] z-50 bg-background border-b border-[#c8ccd4] transition-[right,box-shadow] duration-300 ease-in-out ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)]" : ""
      } ${isOpen ? "lg:right-[400px]" : "right-0"}`}
    >
      {/* Main nav row */}
      <nav className="flex items-center justify-between h-full px-6 md:px-10 lg:px-[100px]">
        {/* Logo */}
        <Link href="/" aria-label="Home" className="shrink-0">
          <span className="font-heading italic font-normal text-[28px] md:text-[32px] lg:text-[36px] text-heading tracking-[-0.36px] leading-[44px]">
            Ash
          </span>
        </Link>

        {/* Desktop + tablet: nav links + CTA */}
        <div className="hidden md:flex items-center gap-[20px]">
          <ul className="flex items-center gap-[24px]">
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label}>
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
            className={`flex items-center gap-2 text-white font-brand font-medium text-[15px] tracking-[-0.075px] px-[16px] py-[8px] rounded-[10px] transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                isOpen ? "bg-[#0049c4]" : "bg-[#172b4d] hover:bg-[#0049c4]"
              }`}
          >
            <Image src={ICON_SPARKLE} alt="" width={16} height={16} unoptimized />
            ASH LLM
          </button>
        </div>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden text-primary p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-dashed border-[#c8ccd4] bg-background px-6 py-6">
          <ul className="flex flex-col gap-5 mb-6">
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex items-center gap-3 font-brand text-[14px] font-normal text-[#354454] uppercase tracking-[1px] transition-colors duration-200 hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={toggleChat}
            className={`inline-flex items-center gap-2 text-white font-brand font-medium text-[15px] tracking-[-0.075px] px-[16px] py-[8px] rounded-[10px] transition-colors duration-200 cursor-pointer ${
                isOpen ? "bg-[#0049c4]" : "bg-[#172b4d] hover:bg-[#0049c4]"
              }`}
          >
            <Image src={ICON_SPARKLE} alt="" width={16} height={16} unoptimized />
            ASH LLM
          </button>
        </div>
      )}
    </header>
  );
}
