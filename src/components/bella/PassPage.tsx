"use client";

// ── The pass page ─────────────────────────────────────────────────────────────
// Where a visitor finds their Curiosity Pass (navbar: "Your pass"). On a dark grid:
//   the envelope scene   scroll to open it and bring the pass out; their stamps land
//                        round it (PassScene). Opened once, it stays open.
//   guests               how many are in the house now, as a row of small bells, theirs
//                        in gold
//   under the pass       share it (the device's share sheet with the pass as an image,
//                        or the link copied with a line to go with it), and pick up
//                        where they left off reading, if they were
// A shared link opens /pass/<code>, whose preview image is the pass (/api/pass).
// In development, `?stamps=all` shows every stamp as found (nothing is saved).

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCuriosity } from "@/context/CuriosityContext";
import CuriosityPass from "@/components/bella/CuriosityPass";
import PassScene from "@/components/bella/PassScene";
import { STAMPS } from "@/lib/bella/stampArt";
import { caseStudy, useProgress } from "@/lib/bella/progress";
import { encodePass, guestNumber, shareMessage, type PassData } from "@/lib/bella/passArt";
import { track } from "@/lib/curiosity/report";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MAX_BELLS = 12;
const BELL = "M48 214 Q48 140 100 140 Q152 140 152 214 Z M94 126 h12 v14 h-12 Z M38 212 h124 v14 h-124 Z";

interface Desk {
  guestNo: number | null;
  guestsNow: number | null;
  city: string | null;
  country: string | null;
}

const GOLD_BTN =
  "inline-flex items-center gap-[8px] rounded-full bg-[#e3bd62] px-[20px] py-[12px] font-geist text-[15px] font-medium leading-[20px] text-[#1e0525] transition-colors hover:bg-[#f2cf7a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3bd62]";
const LINE_BTN =
  "inline-flex items-center gap-[8px] rounded-full border border-white/20 px-[20px] py-[12px] font-geist text-[15px] leading-[20px] text-[#f8f1e3] transition-colors hover:border-[#e3bd62] hover:text-[#e3bd62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3bd62]";

// Guests in the house now: one small bell each, the visitor's own in gold
function Guests({ count }: { count: number }) {
  const shown = Math.min(count, MAX_BELLS);
  return (
    <div className="flex flex-col items-center gap-[10px]">
      <div className="flex items-end gap-[6px]" aria-hidden="true">
        {Array.from({ length: shown }, (_, i) => (
          <svg key={i} viewBox="36 120 128 108" className={i === 0 ? "h-[22px] w-auto" : "h-[16px] w-auto"}>
            <path d={BELL} fill={i === 0 ? "#e3bd62" : "rgba(248,241,227,0.35)"} />
          </svg>
        ))}
        {count > MAX_BELLS && <span className="font-geist text-[14px] text-[#f8f1e3]/50">+{count - MAX_BELLS}</span>}
      </div>
      <p className="font-geist text-[16px] leading-[24px] text-[#f8f1e3]/70">
        {count === 1 ? "Just you at the desk right now" : `You and ${count - 1} other ${count === 2 ? "guest" : "guests"} here right now`}
      </p>
    </div>
  );
}

export default function PassPage() {
  const { visitorId, activeSeconds } = useCuriosity();
  const stored = useProgress();
  const [desk, setDesk] = useState<Desk | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    track("desk_open");
    if (process.env.NODE_ENV !== "production") setShowAll(new URLSearchParams(window.location.search).get("stamps") === "all");
  }, []);

  useEffect(() => {
    if (!visitorId) return;
    fetch(`/api/curiosity/desk?v=${encodeURIComponent(visitorId)}`)
      .then((r) => r.json())
      .then(setDesk)
      .catch(() => {});
  }, [visitorId]);

  const progress = showAll ? { ...stored, stamps: Object.fromEntries(STAMPS.map((s) => [s.key, Date.now()])) } : stored;
  const now = new Date();
  const data: PassData = {
    n: desk?.guestNo ?? null,
    f: desk?.city ? `${desk.city}${desk.country ? `, ${desk.country}` : ""}` : desk?.country ?? null,
    a: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    s: activeSeconds,
    h: progress.hereAs,
    k: STAMPS.filter((s) => progress.stamps[s.key]).map((s) => s.key),
  };
  // The shared link only needs to change when the stay crosses a minute
  const code = useMemo(() => encodePass(data), [data.n, data.f, data.k.join(), Math.floor(activeSeconds / 60)]); // eslint-disable-line react-hooks/exhaustive-deps

  const share = async () => {
    track("pass_share");
    const url = `${window.location.origin}/pass/${code}`;
    const text = shareMessage(data);
    try {
      if ("share" in navigator) {
        const blob = await fetch(`/api/pass?c=${code}`).then((r) => r.blob());
        const file = new File([blob], `curiosity-pass-${guestNumber(data.n)}.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ text: `${text} ${url}`, files: [file] });
        else await navigator.share({ text, url });
        return;
      }
      await (navigator as Navigator).clipboard.writeText(`${text} ${url}`);
      setNote("Link copied, with a line to go with it");
    } catch {
      setNote(null);
    }
    window.setTimeout(() => setNote(null), 2600);
  };

  const reading = progress.reading && caseStudy(progress.reading.slug);
  const head = (
    <>
      <h1 className="font-heading text-[44px] font-medium leading-[48px] text-[#f8f1e3] md:text-[64px] md:leading-[68px]">Your Curiosity Pass</h1>
      {desk?.guestsNow ? <Guests count={desk.guestsNow} /> : null}
    </>
  );

  return (
    <div className="pass-page">
      <PassScene
        guestNo={guestNumber(data.n)}
        head={head}
        stamps={progress.stamps}
        pass={({ revealed, tilt }) => <CuriosityPass data={data} revealed={revealed} tilt={tilt} />}
      />

      <div className="page-container flex flex-col items-center gap-[16px] pb-[160px] pt-[24px]">
        <div className="flex flex-wrap justify-center gap-[12px]">
          <button type="button" onClick={share} className={GOLD_BTN}>
            Share your pass
          </button>
          {reading && (
            <Link href={`${reading.href}#${progress.reading!.sectionId}`} className={LINE_BTN}>
              Continue reading {reading.name}
            </Link>
          )}
        </div>
        <p role="status" className="h-[20px] font-geist text-[14px] leading-[20px] text-[#e3bd62]">
          {note}
        </p>
      </div>
    </div>
  );
}
