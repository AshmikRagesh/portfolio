"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import PixelRuler from "@/components/PixelRuler";
import { CuriosityProvider } from "@/context/CuriosityContext";

export default function GlobalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The /demo theme preview ships its own navbar
  const isDemo = pathname.startsWith("/demo");

  // The private stats page stands alone: no navbar, and reading it isn't a visit
  if (pathname.startsWith("/stats")) return <>{children}</>;

  return (
    <CuriosityProvider>
      {!isDemo && <Navbar />}
      <PixelRuler />
      {children}
    </CuriosityProvider>
  );
}
