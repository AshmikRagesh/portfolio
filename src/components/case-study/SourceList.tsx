"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

/**
 * Research sources as cards, filtered by topic. A row of chips (All, then each topic with
 * its count; the picked chip is blackcurrant) over a grid of cards, two across from tablet
 * up. Each card: the topic in brand mono caps, the finding, what it changed in the design,
 * and the source as a link with an arrow. Cards fade up whenever the topic changes.
 */
type Source = { topic: string; finding: string; applies: string; source: { label: string; href: string } };

export default function SourceList({ sources }: { sources: Source[] }) {
  const topics = Array.from(new Set(sources.map((s) => s.topic)));
  const [topic, setTopic] = useState<string | null>(null);
  const shown = topic ? sources.filter((s) => s.topic === topic) : sources;

  const chip = (label: string, value: string | null, n: number) => {
    const on = topic === value;
    return (
      <button
        key={label}
        type="button"
        aria-pressed={on}
        onClick={() => setTopic(value)}
        className={`rounded-full px-[16px] py-[8px] font-body text-[14px] leading-[20px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
          on ? "bg-primary text-white" : "bg-white text-secondary ring-1 ring-inset ring-line hover:text-grape hover:ring-grape"
        }`}
      >
        {label} <span className={on ? "text-white/70" : "text-muted"}>{n}</span>
      </button>
    );
  };

  return (
    <div className="font-body">
      <div className="flex flex-wrap gap-[8px]" role="group" aria-label="Filter by topic">
        {chip("All", null, sources.length)}
        {topics.map((t) => chip(t, t, sources.filter((s) => s.topic === t).length))}
      </div>
      <ul key={topic ?? "all"} className="m-0 mt-[24px] grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2">
        {shown.map((s, i) => (
          <li
            key={s.source.href}
            className="flex animate-[step-in_400ms_ease-out_both] flex-col gap-[12px] rounded-xl border border-line-soft bg-white p-[24px] motion-reduce:animate-none"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="font-brand text-[12px] uppercase leading-[16px] tracking-[0.5px] text-muted">{s.topic}</span>
            <p className="m-0 text-[16px] leading-[26px] text-heading">{s.finding}</p>
            <p className="m-0 text-[14px] leading-[22px] text-secondary">
              <span className="font-medium text-heading">Used for:</span> {s.applies}
            </p>
            <a
              href={s.source.href}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-[4px] self-start pt-[4px] text-[14px] leading-[20px] text-grape underline underline-offset-[2px]"
            >
              {s.source.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
