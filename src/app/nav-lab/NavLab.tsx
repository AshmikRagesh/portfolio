"use client";

import { useState, type ReactNode } from "react";
import HostCharacter, { hostLayout } from "@/components/host/HostCharacter";
import PunchHole from "@/components/PunchHole";

type Hover = "wavy" | "marker" | "circled" | "checkbox" | "stamp" | "punch" | "tab-lift" | "ruler";

const HOVERS: { id: Hover; name: string; idea: string }[] = [
  { id: "wavy", name: "Wavy underline", idea: "What's live now: grape text and a wavy underline." },
  { id: "marker", name: "Highlighter", idea: "The pink marker from the case studies sweeps behind the word." },
  { id: "circled", name: "Pen circle", idea: "A quick pen loop is drawn round the word, like circling it on paper." },
  { id: "checkbox", name: "Tick box", idea: "Form brackets [ ]; the box fills in on hover and on the page you're on." },
  { id: "stamp", name: "Rubber stamp", idea: "The word is stamped in grape ink, a little crooked, like the pass stamps." },
  { id: "punch", name: "Ticket punch", idea: "A hole is punched beside the word, like a ticket being clipped." },
  { id: "tab-lift", name: "Folder tab", idea: "A paper tab rises from the navbar's bottom edge behind the word." },
  { id: "ruler", name: "Ruler ticks", idea: "The top ruler's ticks draw under the word, a pixel step at a time." },
];

const LINKS = { work: "Work", play: "Play", paper: "Fancy paper", about: "About" };

// Every tab in the lab is "Work" as the page you're on, so the active state shows too
function Tab({ hover, label, active = false }: { hover: Hover; label: string; active?: boolean }) {
  return (
    <a href="#" onClick={(e) => e.preventDefault()} className={`nl-tab nl-${hover} ${active ? "is-active" : ""}`}>
      {hover === "checkbox" && (
        <span className="nl-box" aria-hidden="true">
          [<i>•</i>]
        </span>
      )}
      <span className="nl-label">
        {hover === "punch" && (
          <span className="nl-hole" aria-hidden="true">
            <PunchHole index={label.length} light />
          </span>
        )}
        {label}
        {hover === "circled" && (
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <path pathLength={1} vectorEffect="non-scaling-stroke" d="M84 6C66 0 22 1 8 12-3 22 14 37 50 37c36 0 50-10 44-23C88 3 62 1 38 4" />
          </svg>
        )}
      </span>
    </a>
  );
}

function Bell({ height = 56 }: { height?: number }) {
  return <HostCharacter className="block shrink-0" style={{ width: hostLayout(height).width, height }} />;
}

// A navbar-sized strip on a white page, with the real gutters
function Frame({ id, name, note, children, tall = false }: { id: string; name: string; note: string; children: ReactNode; tall?: boolean }) {
  return (
    <section className="flex flex-col gap-[12px]">
      <div className="page-container flex flex-col gap-[4px]">
        <h3 className="m-0 font-brand text-[14px] uppercase tracking-[1px] text-heading">
          {id} · {name}
        </h3>
        <p className="m-0 font-body text-[14px] leading-[20px] text-secondary">{note}</p>
      </div>
      <div className={`relative bg-background border-y border-line ${tall ? "" : "h-[68px]"}`}>{children}</div>
    </section>
  );
}

function Layouts({ hover }: { hover: Hover }) {
  const t = (label: string, active = false) => <Tab hover={hover} label={label} active={active} />;
  return (
    <div className="flex flex-col gap-[48px]">
      <Frame id="A" name="Split, logo centre" note="Your reference (lydiashan.com): Work and Play on the left, Fancy paper and About on the right, the bell in the middle. No CTA.">
        <nav className="nav-container grid h-full grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-[32px]">{t(LINKS.work, true)}{t(LINKS.play)}</div>
          <Bell />
          <div className="flex items-center justify-end gap-[32px]">{t(LINKS.paper)}{t(LINKS.about)}</div>
        </nav>
      </Frame>

      <Frame id="B" name="Split, hugging the bell" note="Same split, but the links sit close to the bell instead of out at the edges, so the whole nav reads as one centred group.">
        <nav className="nav-container flex h-full items-center justify-center gap-[40px]">
          <div className="flex items-center gap-[32px]">{t(LINKS.work, true)}{t(LINKS.play)}</div>
          <Bell />
          <div className="flex items-center gap-[32px]">{t(LINKS.paper)}{t(LINKS.about)}</div>
        </nav>
      </Frame>

      <Frame id="C" name="Ticket stub" note="The bar reads as a ticket, like Your pass: the bell sits in a stub between two perforated lines with notches cut top and bottom.">
        <nav className="nav-container grid h-full grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-[32px]">{t(LINKS.work, true)}{t(LINKS.play)}</div>
          <div className="relative flex h-full items-center border-x-2 border-dashed border-line px-[40px]">
            {[0, 1].map((side) => (
              <span key={side} className={`absolute ${side ? "right-[-8px]" : "left-[-8px]"} inset-y-0 flex flex-col justify-between`}>
                <span className="mt-[-8px] size-[14px] rounded-full border border-line bg-surface" />
                <span className="mb-[-8px] size-[14px] rounded-full border border-line bg-surface" />
              </span>
            ))}
            <Bell />
          </div>
          <div className="flex items-center justify-end gap-[32px]">{t(LINKS.paper)}{t(LINKS.about)}</div>
        </nav>
      </Frame>

      <Frame id="D" name="Floating capsule" note="No full-width bar: one rounded capsule floats in the middle with the bell inside it. Lighter, and the page shows on both sides.">
        <div className="flex h-full items-center justify-center bg-surface" style={{ "--drop": "0px" } as React.CSSProperties}>
          <nav className="flex h-[56px] items-center gap-[24px] rounded-full border border-line bg-background px-[24px] shadow-[0_2px_12px_rgba(30,5,37,0.08)]">
            {t(LINKS.work, true)}
            {t(LINKS.play)}
            <Bell height={44} />
            {t(LINKS.paper)}
            {t(LINKS.about)}
          </nav>
        </div>
      </Frame>

      <Frame id="E" name="Letterhead" tall note="Like the top of a letter: the bell centred on its own row, the links in one line under it. Taller (112px) — it would shrink to one row on scroll.">
        <nav className="nav-container flex flex-col items-center gap-[4px] pb-[12px] pt-[12px]" style={{ "--drop": "12px" } as React.CSSProperties}>
          <Bell />
          <div className="flex items-center gap-[16px] text-line">
            {t(LINKS.work, true)}
            <span aria-hidden="true">·</span>
            {t(LINKS.play)}
            <span aria-hidden="true">·</span>
            {t(LINKS.paper)}
            <span aria-hidden="true">·</span>
            {t(LINKS.about)}
          </div>
        </nav>
      </Frame>

      <Frame id="F" name="Left cluster" note="The bell stays where it is now, with all four links right beside it after a divider. The right side stays empty and calm.">
        <nav className="nav-container flex h-full items-center gap-[32px]">
          <Bell />
          <span className="h-[24px] w-px bg-line" aria-hidden="true" />
          {t(LINKS.work, true)}
          {t(LINKS.play)}
          {t(LINKS.paper)}
          {t(LINKS.about)}
        </nav>
      </Frame>

      <Frame id="G" name="Today, without the CTA" note="The live layout with the Fancy paper button turned into a plain link, for comparison.">
        <nav className="nav-container flex h-full items-center justify-between">
          <Bell />
          <div className="flex items-center gap-[32px]">{t(LINKS.work, true)}{t(LINKS.play)}{t(LINKS.paper)}{t(LINKS.about)}</div>
        </nav>
      </Frame>
    </div>
  );
}

export default function NavLab() {
  const [hover, setHover] = useState<Hover>("checkbox");

  return (
    <main className="min-h-screen bg-surface pb-[96px] pt-[64px]">
      <div className="page-container flex flex-col gap-[8px]">
        <h1 className="m-0 font-heading text-h1-md text-heading">Nav lab</h1>
        <p className="m-0 max-w-[640px] font-body text-[16px] leading-[24px] text-secondary">
          Hover the tabs to try each effect. In every row, Work is the page you&apos;re on, so the active state shows too. Pick a hover below and every layout uses it.
        </p>
      </div>

      {/* Hover ideas */}
      <div className="page-container mt-[40px] flex flex-col gap-[8px]">
        <h2 className="m-0 font-heading text-h2-md text-heading">1 · Hover ideas</h2>
        <div className="mt-[8px] grid grid-cols-1 gap-[12px] md:grid-cols-2">
          {HOVERS.map((h, i) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHover(h.id)}
              className={`flex flex-col gap-[12px] rounded-xl border bg-background p-[20px] text-left transition-colors ${
                hover === h.id ? "border-grape shadow-[0_0_0_2px_#f9e4ff]" : "border-line-soft hover:border-line"
              }`}
            >
              <div className="flex items-baseline justify-between gap-[12px]">
                <span className="font-brand text-[12px] uppercase tracking-[1px] text-muted">
                  {i + 1} · {h.name}
                </span>
                {hover === h.id && <span className="font-brand text-[12px] uppercase tracking-[1px] text-grape">Using in layouts</span>}
              </div>
              <div className="flex h-[68px] items-center gap-[32px] border-b border-line pl-[24px]">
                <Tab hover={h.id} label={LINKS.work} active />
                <Tab hover={h.id} label={LINKS.play} />
                <Tab hover={h.id} label={LINKS.about} />
              </div>
              <p className="m-0 font-body text-[14px] leading-[20px] text-secondary">{h.idea}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Layouts */}
      <div className="mt-[64px] flex flex-col gap-[24px]">
        <div className="page-container">
          <h2 className="m-0 font-heading text-h2-md text-heading">2 · Layouts</h2>
          <p className="m-0 mt-[4px] font-body text-[14px] leading-[20px] text-secondary">
            Showing hover: <span className="text-grape">{HOVERS.find((h) => h.id === hover)?.name}</span>
          </p>
        </div>
        <Layouts hover={hover} />
      </div>
    </main>
  );
}
