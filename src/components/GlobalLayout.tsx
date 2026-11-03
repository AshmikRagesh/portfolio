"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import PixelRuler from "@/components/PixelRuler";
import { CuriosityProvider } from "@/context/CuriosityContext";
import { BellStageProvider } from "@/components/host/BellStage";
import TabPresence from "@/components/host/TabPresence";
import BellaDirector from "@/components/bella/BellaDirector";

export default function GlobalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The /demo theme preview ships its own navbar, and /nav-lab shows the navbar ideas instead
  const isDemo = pathname.startsWith("/demo") || pathname.startsWith("/nav-lab");

  // The private stats page stands alone: no navbar, and reading it isn't a visit
  if (pathname.startsWith("/stats")) return <>{children}</>;

  return (
    <CuriosityProvider>
      {/* Bella dozes in the browser tab too, and the title holds the paused time */}
      <TabPresence />
      <BellaDirector />
      {/* The navbar and footer bells take turns — only one is up at a time */}
      <BellStageProvider>
        {!isDemo && <Navbar />}
        <PixelRuler />
        {children}
      </BellStageProvider>
    </CuriosityProvider>
  );
}
