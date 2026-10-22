"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import PixelRuler from "@/components/PixelRuler";

export default function GlobalLayout({ children }: { children: ReactNode }) {
  // The /demo theme preview ships its own navbar
  const isDemo = usePathname().startsWith("/demo");

  return (
    <>
      {!isDemo && <Navbar />}
      <PixelRuler />
      {children}
    </>
  );
}
