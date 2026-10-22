"use client";

import Image from "next/image";
import { Wifi, Moon, Sparkles } from "lucide-react";

// ── "Postcards from Bangalore" sticker kit ────────────────────────────────────
// Pure visuals (no drag logic) — StickerBoard positions and moves them.
// Palette only: primary #32073e · midnight #1e0525 · grape #9D136A ·
// grape-light #F9E4FF · pink #f8c2f7 · vanilla #ece5d8 · paper #faf6ef.
// Every size is a multiple of 2/4px; perforated pieces are multiples of 8px.

const PAPER = "#faf6ef";

/** Large-letter vintage postcard. Flips to a handwritten back. */
export function Postcard({ flipped }: { flipped: boolean }) {
  return (
    <div className="flip h-[160px] w-[240px]" data-flipped={flipped}>
      <div className="flip-inner">
        {/* Front */}
        <div className="flip-face overflow-hidden rounded-[4px] bg-vanilla p-[6px] shadow-[0_2px_6px_rgba(30,5,37,0.12)]">
          <div className="relative flex h-full flex-col items-center justify-center rounded-[2px] border border-primary/20 bg-pink/40">
            <span className="font-handwriting text-[24px] leading-[20px] text-grape">Greetings from</span>
            <span
              className="mt-1 font-heading text-[36px] font-medium uppercase leading-[36px] tracking-[0px] text-grape"
              style={{ textShadow: "2px 2px 0 #32073e" }}
            >
              Bangalore
            </span>
            <span className="mt-2 font-brand text-[10px] uppercase leading-[12px] tracking-[0px] text-primary/70">
              Garden City · Est. 1537
            </span>
            <span className="absolute bottom-[6px] right-[8px] font-brand text-[10px] leading-[12px] text-primary/50">tap to flip ↻</span>
          </div>
        </div>

        {/* Back */}
        <div
          className="flip-face flip-back grid grid-cols-[1fr_1px_88px] gap-3 rounded-[4px] p-3 shadow-[0_2px_6px_rgba(30,5,37,0.12)]"
          style={{ background: PAPER }}
        >
          <p className="m-0 font-handwriting text-[20px] leading-[20px] text-primary">
            Wish you were here! Filter coffee&apos;s on me next time. — A
          </p>
          <span className="scribble bg-primary/30" />
          <div className="flex flex-col gap-2">
            <div className="relative h-[48px] w-[40px] self-end">
              <div className="perforated h-[48px] w-[40px] bg-grape-light p-[6px]">
                <div className="flex h-full items-center justify-center bg-grape font-brand text-[10px] leading-[12px] text-white">
                  ₹5
                </div>
              </div>
              {/* Postmark */}
              <span className="scribble absolute -left-[28px] top-[6px] flex h-[36px] w-[36px] items-center justify-center rounded-full border border-primary/50 font-brand text-[10px] leading-[10px] text-primary/60">
                BLR
              </span>
            </div>
            <span className="scribble h-px bg-primary/30" />
            <span className="scribble h-px bg-primary/30" />
            <span className="scribble h-px bg-primary/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Oval vintage hotel luggage label. */
export function LuggageLabel() {
  return (
    <div className="flex h-[128px] w-[200px] items-center justify-center rounded-[50%] bg-primary p-[6px] shadow-[0_2px_6px_rgba(30,5,37,0.2)]">
      <div className="scribble flex h-full w-full flex-col items-center justify-center rounded-[50%] border-2 border-dashed border-pink/70">
        <span className="font-brand text-[10px] uppercase leading-[12px] tracking-[2px] text-pink">The Guesthouse</span>
        <span className="font-heading text-[30px] italic leading-[32px] tracking-[0px] text-white">Ashmik&apos;s</span>
        <span className="font-brand text-[10px] uppercase leading-[12px] tracking-[2px] text-pink">Bangalore · India</span>
      </div>
    </div>
  );
}

/** Perforated postage stamp — filter coffee. */
export function CoffeeStamp() {
  return (
    <div className="perforated h-[120px] w-[96px] p-2 drop-shadow-[0_2px_4px_rgba(30,5,37,0.18)]" style={{ background: PAPER }}>
      <div className="relative flex h-full flex-col items-center justify-between bg-grape-light px-1 pb-1 pt-2">
        <span className="absolute left-1 top-1 font-brand text-[10px] leading-[10px] text-grape">₹5</span>
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="scribble mt-2" aria-hidden="true">
          {/* steam */}
          <path d="M18 4c-3 4 3 6 0 10M26 2c-3 4 3 6 0 10" stroke="#9D136A" strokeWidth="1.6" strokeLinecap="round" />
          {/* tumbler */}
          <path d="M14 18h20l-3 26H17z" fill="#f8c2f7" stroke="#32073e" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M15 24h18" stroke="#32073e" strokeWidth="1.2" />
          {/* dabara */}
          <path d="M4 42h40c0 6-8 10-20 10S4 48 4 42z" fill="#ece5d8" stroke="#32073e" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        <span className="font-brand text-[10px] uppercase leading-[12px] tracking-[0px] text-primary">Filter kaapi</span>
      </div>
    </div>
  );
}

/** Hotel room key fob on a ring. */
export function KeyTag({ room = "101" }: { room?: string }) {
  return (
    <div className="flex w-[72px] flex-col items-center">
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" className="scribble -mb-[10px]" aria-hidden="true">
        <circle cx="16" cy="12" r="10" stroke="#32073e" strokeWidth="2" />
      </svg>
      <div
        className="flex h-[112px] w-[72px] flex-col items-center justify-end rounded-[36px_36px_16px_16px] bg-grape pb-4 shadow-[0_2px_6px_rgba(30,5,37,0.2)]"
        style={{ WebkitMask: "radial-gradient(circle 6px at 36px 16px, transparent 97%, #000)", mask: "radial-gradient(circle 6px at 36px 16px, transparent 97%, #000)" }}
      >
        <span className="font-brand text-[10px] uppercase leading-[12px] tracking-[2px] text-pink">Room</span>
        <span className="font-heading text-[28px] leading-[28px] tracking-[0px] text-white">{room}</span>
      </div>
    </div>
  );
}

/** Door hanger — doubles as the animations on/off switch. */
export function DoNotDisturb({ calm }: { calm: boolean }) {
  return (
    <div
      className={`flex h-[200px] w-[104px] flex-col items-center justify-end gap-2 rounded-[8px_8px_12px_12px] px-2 pb-4 shadow-[0_2px_6px_rgba(30,5,37,0.2)] ${
        calm ? "bg-midnight text-white" : "bg-vanilla text-primary"
      }`}
      style={{
        WebkitMask: "radial-gradient(circle 20px at 52px 36px, transparent 97%, #000)",
        mask: "radial-gradient(circle 20px at 52px 36px, transparent 97%, #000)",
      }}
    >
      {calm ? <Moon size={20} strokeWidth={1.6} /> : <Sparkles size={20} strokeWidth={1.6} />}
      <span className="text-center font-brand text-[10px] uppercase leading-[12px] tracking-[1px]">Please</span>
      <span className="text-center font-heading text-[18px] leading-[20px] tracking-[0px]">
        {calm ? "Do not disturb" : "Make up the room"}
      </span>
      <span className={`text-center font-brand text-[10px] leading-[12px] ${calm ? "text-pink" : "text-grape"}`}>
        {calm ? "motion off" : "motion on"}
      </span>
    </div>
  );
}

/** Guest Wi-Fi card — the contact details. */
export function WifiCard() {
  return (
    <div className="h-[120px] w-[208px] rounded-[4px] border border-line/60 bg-white p-4 shadow-[0_2px_6px_rgba(30,5,37,0.12)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-brand text-[10px] uppercase leading-[12px] tracking-[2px] text-grape">Guest Wi-Fi</span>
        <Wifi size={16} strokeWidth={1.8} className="text-grape" />
      </div>
      <div className="grid grid-cols-[64px_1fr] items-baseline gap-y-1">
        <span className="font-brand text-[10px] uppercase leading-[16px] text-muted">Network</span>
        <span className="font-[family-name:var(--font-demo-body)] text-[14px] leading-[20px] text-heading">ashmik-guest</span>
        <span className="font-brand text-[10px] uppercase leading-[16px] text-muted">Password</span>
        <span className="font-handwriting text-[22px] leading-[20px] text-grape">say-hello</span>
      </div>
    </div>
  );
}

/** Passport that fills with a stamp per room visited. */
export function Passport({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex h-[168px] w-[120px] flex-col items-center justify-between rounded-[6px] bg-midnight px-3 py-4 text-pink shadow-[0_2px_6px_rgba(30,5,37,0.25)]">
      <span className="font-brand text-[10px] uppercase leading-[12px] tracking-[3px]">Passport</span>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="scribble" aria-hidden="true">
        <circle cx="24" cy="24" r="22" stroke="#f8c2f7" strokeWidth="1.4" />
        <path d="M12 26 24 15l12 11M16 23v11h16V23" stroke="#f8c2f7" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M22 34v-6h4v6" stroke="#f8c2f7" strokeWidth="1.4" />
      </svg>
      <span className="text-center font-heading text-[16px] italic leading-[18px] tracking-[0px] text-white">The Guesthouse</span>
      <span className="font-brand text-[10px] leading-[12px] text-pink/80">
        Rooms {count}/{total}
      </span>
    </div>
  );
}

/** Polaroid of the host. */
export function Polaroid() {
  return (
    <div className="w-[168px] bg-white p-2 pb-0 shadow-[0_2px_8px_rgba(30,5,37,0.16)]">
      <div className="relative h-[152px] w-[152px] overflow-hidden bg-vanilla">
        <Image src="/images/portrait-sketch.png" alt="Sketch of Ashmik" fill sizes="152px" className="object-cover object-top" />
      </div>
      <p className="m-0 py-2 text-center font-handwriting text-[22px] leading-[24px] text-primary">your host :)</p>
    </div>
  );
}
