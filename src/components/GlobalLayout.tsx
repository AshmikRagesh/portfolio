"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import PixelRuler from "@/components/PixelRuler";
import { CuriosityProvider } from "@/context/CuriosityContext";
import { BellStageProvider } from "@/components/host/BellStage";
import TabPresence from "@/components/host/TabPresence";
import BellaDirector from "@/components/bella/BellaDirector";
import ResumeOverlay from "@/components/resume/ResumeOverlay";
import BellaLoader from "@/components/host/BellaLoader";
import SoundLayer from "@/components/SoundLayer";
import PageTransition from "@/components/PageTransition";
import OwnerBadge from "@/components/OwnerBadge";

export default function GlobalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The /demo theme preview ships its own navbar, and /nav-lab shows the navbar ideas instead
  const isDemo = pathname.startsWith("/demo") || pathname.startsWith("/nav-lab");

  // The private stats and feedback pages stand alone: no navbar, and reading them isn't a visit
  if (pathname.startsWith("/stats") || pathname.startsWith("/feedback")) return <>{children}</>;

  return (
    <CuriosityProvider>
      {/* Bella dozes in the browser tab too, and the title holds the paused time */}
      <TabPresence />
      {/* The DS interface sounds: ticks on links, notes on bars, a page-turn between pages */}
      <SoundLayer />
      <PageTransition />
      <BellaDirector />
      {/* The navbar and footer bells take turns — only one is up at a time */}
      <BellStageProvider>
        {!isDemo && <Navbar />}
        <PixelRuler />
        {children}
      </BellStageProvider>
      {/* Fancy paper: the résumé sheet, opened from the navbar */}
      <ResumeOverlay />
      {/* Only on a browser Ashmik marked as his: a reminder it isn't being counted */}
      <OwnerBadge />
      {/* First visit in a session: Bella does tricks while the site loads */}
      <BellaLoader />
    </CuriosityProvider>
  );
}
