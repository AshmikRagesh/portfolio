"use client";

// ── Front desk ────────────────────────────────────────────────────────────────
// The page a visitor reaches from Bella's lines ("See your card") or the footer: their
// guest card, and what goes with it.
//
//   envelope   on the first visit to this page the card arrives sealed in an envelope
//              with the guest number on it; opening it (a click on the wax seal) lifts
//              the flap and slides the card out. After that the card is simply there.
//   the card   GuestCard, centred, as if just handed over.
//   below      who you're here as (one tap), where you left off reading, your stamps by
//              name, how many guests are in the house now, and the email to copy.
//
// Missing stamps are empty circles with no hints. Nothing here pops up or redirects.
// In development, `?stamps=all` shows every stamp as found (nothing is saved) for review.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCuriosity } from "@/context/CuriosityContext";
import { formatDuration } from "@/components/host/clock";
import GuestCard from "@/components/bella/GuestCard";
import Stamp from "@/components/bella/Stamp";
import { STAMPS, stampDate } from "@/lib/bella/stampArt";
import { caseStudy, celebrate, setHereAs, useProgress, type HereAs } from "@/lib/bella/progress";
import { track } from "@/lib/curiosity/report";
import { EMAIL } from "@/lib/contact";

const OPENED_KEY = "ash.bella.deskOpened"; // localStorage
const HERE_AS: HereAs[] = ["Recruiter", "Designer", "Engineer", "Just curious"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Desk {
  guestNo: number | null;
  guestsNow: number | null;
  city: string | null;
  country: string | null;
}

export default function FrontDesk() {
  const { visitorId, activeSeconds, visits } = useCuriosity();
  const stored = useProgress();
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") setShowAll(new URLSearchParams(window.location.search).get("stamps") === "all");
  }, []);
  const progress = showAll ? { ...stored, stamps: Object.fromEntries(STAMPS.map((s) => [s.key, Date.now()])) } : stored;
  const [desk, setDesk] = useState<Desk | null>(null);
  const [envelope, setEnvelope] = useState<"sealed" | "opening" | "open" | null>(null);
  const [copied, setCopied] = useState<"yes" | "blocked" | null>(null);
  const [justOpened, setJustOpened] = useState(false);

  useEffect(() => {
    track("desk_open");
    let opened = false;
    try {
      opened = localStorage.getItem(OPENED_KEY) === "1";
    } catch {}
    setEnvelope(opened ? "open" : "sealed");
  }, []);

  useEffect(() => {
    if (!visitorId) return;
    fetch(`/api/curiosity/desk?v=${encodeURIComponent(visitorId)}`)
      .then((r) => r.json())
      .then(setDesk)
      .catch(() => {});
  }, [visitorId]);

  const open = () => {
    setEnvelope("opening");
    setJustOpened(true);
    try {
      localStorage.setItem(OPENED_KEY, "1");
    } catch {}
    window.setTimeout(() => setEnvelope("open"), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1400);
  };

  const copyEmail = () => {
    track("email_copy_button");
    try {
      navigator.clipboard.writeText(EMAIL).then(
        () => {
          setCopied("yes");
          celebrate("email", "Email copied.", "desk", 600);
        },
        () => setCopied("blocked"),
      );
    } catch {
      setCopied("blocked");
    }
  };

  const now = new Date();
  const arrived = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const from = desk?.city ? `${desk.city}${desk.country ? `, ${desk.country}` : ""}` : desk?.country ?? null;
  const guestNo = desk?.guestNo ?? null;
  const reading = progress.reading && caseStudy(progress.reading.slug);
  const card = (
    <GuestCard guestNo={guestNo} from={from} arrived={arrived} stay={formatDuration(activeSeconds)} progress={progress} returning={visits > 1} />
  );

  return (
    <div className="flex flex-col items-center gap-[64px]">
      <header className="flex flex-col items-center gap-[8px] text-center">
        <p className="font-brand text-[12px] uppercase leading-[16px] tracking-[2px] text-muted">Front desk</p>
        <h1 className="font-heading text-[40px] font-medium leading-[48px] text-heading md:text-[48px] md:leading-[56px]">Your stay so far</h1>
      </header>

      {/* The card, or the envelope it arrives in */}
      <div className="flex w-full justify-center">
        {envelope === "open" ? (
          <div className={`flex w-full justify-center ${justOpened ? "desk-arrive" : ""}`}>{card}</div>
        ) : envelope ? (
          <div className={`desk-envelope ${envelope === "opening" ? "is-opening" : ""}`}>
            <div className="desk-envelope-card">{card}</div>
            <div className="desk-envelope-back" />
            <div className="desk-envelope-front">
              <p className="font-geist text-[12px] uppercase leading-[16px] tracking-[1px] text-[#8a6a7c]">For guest no.</p>
              <p className="font-geist text-[28px] font-light leading-[32px] text-[#9a6a16]">{guestNo !== null ? String(guestNo).padStart(4, "0") : "····"}</p>
            </div>
            <div className="desk-envelope-flap" />
            <button type="button" onClick={open} disabled={envelope === "opening"} className="desk-envelope-seal" aria-label="Open the envelope">
              <svg viewBox="36 120 128 112" aria-hidden="true">
                <path fillRule="evenodd" d="M48 214 Q48 140 100 140 Q152 140 152 214 Z M76 176 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M106 176 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M94 124 h12 v14 h-12 Z M38 212 h124 v14 h-124 Z" fill="currentColor" />
              </svg>
            </button>
            <p className="desk-envelope-hint font-geist text-[14px] leading-[20px] text-muted">Click the seal to open</p>
          </div>
        ) : null}
      </div>

      {/* Who are you here as? */}
      <section className="flex flex-col items-center gap-[12px] text-center">
        <h2 className="font-heading text-[24px] leading-[32px] text-heading">Who are you here as?</h2>
        <div className="flex flex-wrap justify-center gap-[8px]" role="radiogroup" aria-label="Who are you here as">
          {HERE_AS.map((h) => (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={progress.hereAs === h}
              onClick={() => setHereAs(h)}
              className={`rounded-full border px-[16px] py-[8px] font-geist text-[14px] leading-[20px] transition-colors ${
                progress.hereAs === h ? "border-grape bg-grape text-white" : "border-line bg-background text-heading hover:border-grape"
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape`}
            >
              {h}
            </button>
          ))}
        </div>
      </section>

      <div className="grid w-full max-w-[720px] gap-[16px]">
        {/* Pick up where you left off */}
        {reading && (
          <Link
            href={`${reading.href}#${progress.reading!.sectionId}`}
            className="flex items-center justify-between gap-[16px] rounded-lg bg-primary px-[20px] py-[16px] font-geist text-[16px] leading-[24px] text-white transition-colors hover:bg-grape"
          >
            <span>
              You were reading {reading.name}, {progress.reading!.section}.
            </span>
            <span className="whitespace-nowrap font-brand text-[12px] uppercase tracking-[1px]">Continue</span>
          </Link>
        )}

        {/* Stamps by name */}
        <section className="rounded-lg border border-line-soft bg-background p-[20px]">
          <h2 className="mb-[16px] font-heading text-[20px] leading-[28px] text-heading">Your stamps</h2>
          <ul className="grid grid-cols-2 gap-[16px] sm:grid-cols-3 md:grid-cols-5">
            {STAMPS.map((s) => {
              const at = progress.stamps[s.key];
              return (
                <li key={s.key} className="flex flex-col items-center gap-[8px] text-center">
                  {at ? (
                    <Stamp stamp={s.key} date={stampDate(new Date(at))} rotate={-6} className="h-[96px] w-[96px]" />
                  ) : (
                    <span className="m-[8px] h-[80px] w-[80px] rounded-full border-[2px] border-dashed border-[#c9b6a0]" />
                  )}
                  <span className="font-geist text-[14px] leading-[20px] text-heading">{at ? s.name : "Not found yet"}</span>
                  {at && <span className="font-geist text-[12px] leading-[16px] text-muted">{s.earned}</span>}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="grid gap-[16px] md:grid-cols-2">
          {/* Guests in the house now */}
          <section className="flex items-center gap-[12px] rounded-lg border border-line-soft bg-background p-[20px]">
            <span className="relative flex h-[12px] w-[12px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f2c75c] opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-[12px] w-[12px] rounded-full bg-[#e0a93a]" />
            </span>
            <p className="font-geist text-[16px] leading-[24px] text-heading">
              {desk?.guestsNow ? `${desk.guestsNow} ${desk.guestsNow === 1 ? "guest" : "guests"} in the house now` : "Counting the guests in the house"}
            </p>
          </section>

          {/* The email */}
          <section className="flex flex-wrap items-center justify-between gap-[12px] rounded-lg border border-line-soft bg-background p-[20px]">
            <p className="font-geist text-[16px] leading-[24px] text-heading">Ring for Ashmik</p>
            {copied === "blocked" ? (
              <span className="select-all font-brand text-[14px] text-heading">{EMAIL}</span>
            ) : (
              <button
                type="button"
                onClick={copyEmail}
                className="rounded-full bg-primary px-[16px] py-[8px] font-brand text-[12px] uppercase leading-[16px] tracking-[1px] text-white hover:bg-grape focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape"
              >
                {copied === "yes" ? "Email copied" : "Copy email"}
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
