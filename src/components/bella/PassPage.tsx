"use client";

// ── The pass page ─────────────────────────────────────────────────────────────
// Where a visitor finds their Curiosity Pass (navbar: "Your pass"). On a light grid, like the rest of the site:
//   the envelope scene   scroll to open it and bring the pass out (PassScene). Opened
//                        once, it stays open. Nothing below shows until it has been.
//   the house            a dashboard under it: who's here now, guests so far, this
//                        month's stays, visits per day, stamps found (HouseDashboard)
//   continue reading     where they left off, if they were mid case study
// A shared pass link (/pass/<code>) still works, with the pass as its preview image.
// In development, `?stamps=all` shows every stamp as found (nothing is saved).

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCuriosity } from "@/context/CuriosityContext";
import CuriosityPass from "@/components/bella/CuriosityPass";
import PassScene from "@/components/bella/PassScene";
import { STAMPS } from "@/lib/bella/stampArt";
import { caseStudy, useProgress } from "@/lib/bella/progress";
import type { PassData } from "@/lib/bella/passArt";
import HouseDashboard from "@/components/bella/HouseDashboard";
import { track } from "@/lib/curiosity/report";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface Desk {
  guestNo: number | null;
  guestsNow: number | null;
  city: string | null;
  country: string | null;
}

const LINE_BTN =
  "inline-flex items-center gap-[8px] rounded-full border border-line px-[20px] py-[12px] font-geist text-[15px] leading-[20px] text-heading transition-colors hover:border-grape hover:text-grape focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape";

export default function PassPage() {
  const { visitorId, activeSeconds } = useCuriosity();
  const stored = useProgress();
  const [desk, setDesk] = useState<Desk | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    track("desk_open");
    if (process.env.NODE_ENV !== "production")
      setShowAll(
        new URLSearchParams(window.location.search).get("stamps") === "all",
      );
  }, []);

  useEffect(() => {
    if (!visitorId) return;
    fetch(`/api/curiosity/desk?v=${encodeURIComponent(visitorId)}`)
      .then((r) => r.json())
      .then(setDesk)
      .catch(() => {});
  }, [visitorId]);

  const progress = showAll
    ? {
        ...stored,
        stamps: Object.fromEntries(STAMPS.map((s) => [s.key, Date.now()])),
      }
    : stored;
  const now = new Date();
  const data: PassData = {
    n: desk?.guestNo ?? null,
    f: desk?.city
      ? `${desk.city}${desk.country ? `, ${desk.country}` : ""}`
      : (desk?.country ?? null),
    a: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    s: activeSeconds,
    h: progress.hereAs,
    k: STAMPS.filter((s) => progress.stamps[s.key]).map((s) => s.key),
  };

  const reading = progress.reading && caseStudy(progress.reading.slug);
  const head = (
    <>
      <h1 className="font-heading text-[40px] font-medium leading-[44px] text-heading md:text-[52px] md:leading-[56px]">
        Your Curiosity Pass
      </h1>
      <p className="max-w-[560px] font-geist text-[20px] leading-[28px] text-secondary">
        Your guest number, the day you arrived and how long you’ve stayed, sealed inside.
      </p>
    </>
  );

  return (
    <div className="pass-page">
      <PassScene
        head={head}
        pass={({ revealed, tilt }) => (
          <CuriosityPass data={data} revealed={revealed} tilt={tilt} />
        )}
        onOpen={() => setOpened(true)}
      />

      {opened && (
        <div className="pass-after page-container flex flex-col items-center gap-[48px] pb-[160px] pt-[24px]">
          {reading && (
            <Link
              href={`${reading.href}#${progress.reading!.sectionId}`}
              className={LINE_BTN}
            >
              Continue reading {reading.name}
            </Link>
          )}
          <HouseDashboard visitorId={visitorId} seconds={activeSeconds} />
        </div>
      )}
    </div>
  );
}
