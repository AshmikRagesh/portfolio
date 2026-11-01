"use client";

// ── The pass page ─────────────────────────────────────────────────────────────
// Where a visitor finds their Curiosity Pass (navbar: "Your pass"). On a dark grid:
//   the envelope scene   scroll to open it and bring the pass out (PassScene)
//   here as              one tap, and the pass shows it
//   share                a message to go with it (editable), sent to LinkedIn, X or
//                        WhatsApp, or the device's own share sheet; the link opens a
//                        page with this pass on it, and its preview image is the pass
//   stamps               the five, found ones inked in gold, the rest empty, no hints
//   pick up              where they were reading, if they were
// In development, `?stamps=all` shows every stamp as found (nothing is saved).

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Link2, MessageCircle, Share2 } from "lucide-react";
import { useCuriosity } from "@/context/CuriosityContext";
import CuriosityPass from "@/components/bella/CuriosityPass";
import PassScene from "@/components/bella/PassScene";
import Stamp from "@/components/bella/Stamp";
import { STAMPS, stampDate } from "@/lib/bella/stampArt";
import { caseStudy, setHereAs, useProgress, type HereAs } from "@/lib/bella/progress";
import { encodePass, guestNumber, shareMessage, type PassData } from "@/lib/bella/passArt";
import { track } from "@/lib/curiosity/report";

const HERE_AS: HereAs[] = ["Recruiter", "Designer", "Engineer", "Just curious"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Desk {
  guestNo: number | null;
  guestsNow: number | null;
  city: string | null;
  country: string | null;
}

const GOLD_BTN =
  "inline-flex items-center gap-[8px] rounded-full bg-[#e3bd62] px-[20px] py-[12px] font-geist text-[14px] font-medium leading-[20px] text-[#1e0525] transition-colors hover:bg-[#f2cf7a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3bd62]";
const LINE_BTN =
  "inline-flex items-center gap-[8px] rounded-full border border-white/20 px-[20px] py-[12px] font-geist text-[14px] leading-[20px] text-[#f8f1e3] transition-colors hover:border-[#e3bd62] hover:text-[#e3bd62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3bd62]";

export default function PassPage() {
  const { visitorId, activeSeconds } = useCuriosity();
  const stored = useProgress();
  const [desk, setDesk] = useState<Desk | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    track("desk_open");
    setOrigin(window.location.origin);
    setCanShare("share" in navigator);
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
  const code = useMemo(() => encodePass({ ...data, s: activeSeconds }), [data.n, data.f, data.h, data.k.join(), Math.floor(activeSeconds / 60)]); // eslint-disable-line react-hooks/exhaustive-deps
  const url = `${origin}/pass/${code}`;
  const text = message ?? shareMessage(data);
  const flash = (s: string) => {
    setNote(s);
    window.setTimeout(() => setNote(null), 2400);
  };

  const share = async () => {
    track("pass_share");
    try {
      const blob = await fetch(`/api/pass?c=${code}`).then((r) => r.blob());
      const file = new File([blob], "curiosity-pass.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ text: `${text} ${url}`, files: [file] });
      else await navigator.share({ text, url });
    } catch {}
  };
  const copyLink = () => {
    track("pass_share");
    navigator.clipboard.writeText(`${text} ${url}`).then(() => flash("Message and link copied"), () => flash("Copying is blocked here"));
  };
  const download = async () => {
    track("pass_share");
    const blob = await fetch(`/api/pass?c=${code}`).then((r) => r.blob());
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `curiosity-pass-${guestNumber(data.n)}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const reading = progress.reading && caseStudy(progress.reading.slug);
  const head = (
    <>
      <p className="font-brand text-[12px] uppercase leading-[16px] tracking-[3px] text-[#e3bd62]">Front desk · Measuring your curiosity</p>
      <h1 className="font-heading text-[44px] font-medium leading-[48px] text-[#f8f1e3] md:text-[64px] md:leading-[68px]">Your Curiosity Pass</h1>
      {desk?.guestsNow ? (
        <p className="mt-[4px] inline-flex items-center gap-[8px] rounded-full border border-white/10 px-[12px] py-[4px] font-geist text-[13px] leading-[20px] text-[#f8f1e3]/70">
          <span className="relative flex h-[8px] w-[8px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e3bd62] opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-[#e3bd62]" />
          </span>
          {desk.guestsNow} {desk.guestsNow === 1 ? "guest" : "guests"} in the house now
        </p>
      ) : null}
    </>
  );

  return (
    <div className="pass-page">
      <PassScene
        guestNo={guestNumber(data.n)}
        head={head}
        pass={({ revealed, tilt }) => <CuriosityPass data={data} stampDates={progress.stamps} revealed={revealed} tilt={tilt} />}
      />

      <div className="page-container flex flex-col items-center gap-[96px] pb-[160px] pt-[32px]">
        {/* Who are you here as? */}
        <section className="flex flex-col items-center gap-[16px] text-center">
          <h2 className="font-heading text-[32px] leading-[40px] text-[#f8f1e3]">Who are you here as?</h2>
          <p className="font-geist text-[16px] leading-[24px] text-[#f8f1e3]/60">One tap, and it goes on your pass.</p>
          <div className="mt-[8px] flex flex-wrap justify-center gap-[8px]" role="radiogroup" aria-label="Who are you here as">
            {HERE_AS.map((h) => (
              <button
                key={h}
                type="button"
                role="radio"
                aria-checked={progress.hereAs === h}
                onClick={() => setHereAs(h)}
                className={progress.hereAs === h ? GOLD_BTN : LINE_BTN}
              >
                {h}
              </button>
            ))}
          </div>
        </section>

        {/* Share */}
        <section className="flex w-full max-w-[720px] flex-col items-center gap-[20px] text-center">
          <h2 className="font-heading text-[32px] leading-[40px] text-[#f8f1e3]">Share your pass</h2>
          <p className="max-w-[520px] font-geist text-[16px] leading-[24px] text-[#f8f1e3]/60">
            The link opens your pass, and the preview shows it. Change the message if you like.
          </p>
          <label className="w-full">
            <span className="sr-only">Message</span>
            <textarea
              value={text}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={280}
              className="w-full resize-none rounded-[16px] border border-white/15 bg-white/[0.04] px-[20px] py-[16px] font-geist text-[16px] leading-[24px] text-[#f8f1e3] outline-none placeholder:text-white/30 focus:border-[#e3bd62]"
            />
          </label>
          <div className="flex flex-wrap justify-center gap-[8px]">
            <a
              href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${text} ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("pass_share")}
              className={GOLD_BTN}
            >
              <img src="/icons/social-linkedin.svg" alt="" className="h-[16px] w-[16px] invert" />
              LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("pass_share")}
              className={LINE_BTN}
            >
              <img src="/icons/social-x.svg" alt="" className="h-[14px] w-[14px]" />
              Post on X
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("pass_share")}
              className={LINE_BTN}
            >
              <MessageCircle size={16} strokeWidth={1.8} aria-hidden="true" />
              WhatsApp
            </a>
            {canShare && (
              <button type="button" onClick={share} className={LINE_BTN}>
                <Share2 size={16} strokeWidth={1.8} aria-hidden="true" />
                More
              </button>
            )}
            <button type="button" onClick={copyLink} className={LINE_BTN}>
              <Link2 size={16} strokeWidth={1.8} aria-hidden="true" />
              Copy link
            </button>
            <button type="button" onClick={download} className={LINE_BTN}>
              <Download size={16} strokeWidth={1.8} aria-hidden="true" />
              Image
            </button>
          </div>
          <p role="status" className="h-[20px] font-geist text-[14px] leading-[20px] text-[#e3bd62]">
            {note}
          </p>
        </section>

        {/* Stamps */}
        <section className="flex w-full max-w-[880px] flex-col items-center gap-[32px] text-center">
          <div className="flex flex-col gap-[8px]">
            <h2 className="font-heading text-[32px] leading-[40px] text-[#f8f1e3]">Your stamps</h2>
            <p className="font-geist text-[16px] leading-[24px] text-[#f8f1e3]/60">
              {data.k.length} of {STAMPS.length} found. The rest are somewhere on the site.
            </p>
          </div>
          <ul className="grid w-full grid-cols-2 gap-[24px] sm:grid-cols-3 md:grid-cols-5">
            {STAMPS.map((s) => {
              const at = progress.stamps[s.key];
              return (
                <li key={s.key} className="flex flex-col items-center gap-[12px]">
                  {at ? (
                    <Stamp stamp={s.key} ink="#e9c56c" date={stampDate(new Date(at))} className="h-[128px] w-[128px]" />
                  ) : (
                    <span className="m-[8px] h-[112px] w-[112px] rounded-full border-[2px] border-dashed border-[#e3bd62]/30" />
                  )}
                  <span className="font-geist text-[16px] leading-[24px] text-[#f8f1e3]">{at ? s.name : "Not found yet"}</span>
                  {at && <span className="font-geist text-[13px] leading-[20px] text-[#f8f1e3]/50">{s.earned}</span>}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Pick up where you left off */}
        {reading && (
          <Link href={`${reading.href}#${progress.reading!.sectionId}`} className={GOLD_BTN}>
            Continue reading {reading.name}, {progress.reading!.section}
          </Link>
        )}
      </div>
    </div>
  );
}
