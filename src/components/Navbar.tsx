"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, CirclePlay, Flame, Sparkles, Menu, X } from "lucide-react";

// TODO: Replace with your own logo asset
const LOGO_SRC =
  "https://www.figma.com/api/mcp/asset/2080d9c7-a468-420c-8f7c-1ee5f4a54874";

const navLinks = [
  { label: "Works", href: "#works", Icon: LayoutGrid },
  { label: "Playground", href: "#playground", Icon: CirclePlay },
  { label: "About", href: "#about", Icon: Flame },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to tablet/desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background border-b border-dashed border-zinc-200 transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      {/* Main nav row */}
      <nav className="flex items-center justify-between px-6 py-3 md:px-10 md:py-4 lg:px-[100px]">
        {/* Logo */}
        <Link href="/" aria-label="Home" className="shrink-0">
          <Image
            src={LOGO_SRC}
            alt="Logo"
            width={52}
            height={52}
            className="rotate-180 w-10 h-10 md:w-[52px] md:h-[52px]"
            unoptimized
          />
        </Link>

        {/* Desktop + tablet: nav links + CTA */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-4 lg:gap-6">
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex items-center gap-2 font-brand text-[13px] lg:text-[14px] font-normal text-primary uppercase tracking-wide hover:opacity-60 transition-opacity"
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="flex items-center gap-2 bg-primary text-background font-brand text-[14px] lg:text-[16px] font-medium px-4 lg:px-5 rounded-md h-9 lg:h-10 hover:opacity-80 transition-opacity"
          >
            <Sparkles size={18} strokeWidth={1.5} />
            Ashmik
          </a>
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
        <div className="md:hidden border-t border-dashed border-zinc-200 bg-background px-6 py-6">
          <ul className="flex flex-col gap-5 mb-6">
            {navLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex items-center gap-3 font-brand text-[14px] font-normal text-primary uppercase tracking-wide"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={20} strokeWidth={1.5} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-primary text-background font-brand text-[15px] font-medium px-5 rounded-md h-10 hover:opacity-80 transition-opacity"
          >
            <Sparkles size={18} strokeWidth={1.5} />
            Ashmik
          </a>
        </div>
      )}
    </header>
  );
}
