"use client";

import { useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";

/**
 * A page checked against published best practice. A summary line counts what it met and
 * met in part; under it one row per practice, with the
 * verdict's round mark (green tick, grey dash, red cross) and the practice. Each row opens
 * to show what the page actually did and the evidence, with its source, easing open like
 * MoreDetail. Several can be open at once.
 */
type Verdict = "met" | "partly" | "missing";
type Practice = {
  practice: string;
  verdict: Verdict;
  found: string;
  evidence: string;
  source: { label: string; href: string };
};

const MARK = {
  met: { icon: Check, box: "bg-success text-white", word: "Met" },
  partly: { icon: Minus, box: "bg-muted text-white", word: "Partly" },
  missing: { icon: X, box: "bg-warning text-white", word: "Missing" },
} as const;

export default function PracticeCheck({ items, subject }: { items: Practice[]; subject: string }) {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  const count = (v: Verdict) => items.filter((p) => p.verdict === v).length;

  return (
    <div className="rounded-xl border border-line-soft bg-white p-[24px] font-body md:p-[32px]">
      {/* Summary: how the page did */}
      <div className="flex flex-col gap-[4px] border-b border-line-soft pb-[24px]">
        <span className="font-brand text-[12px] uppercase leading-[16px] tracking-[0.5px] text-muted">{subject}</span>
        <span className="font-heading text-[24px] leading-[32px] text-heading md:text-[28px] md:leading-[36px]">
          Met {count("met")} of {items.length} best practices
          {count("partly") > 0 && <span className="text-secondary">, {count("partly")} in part</span>}
        </span>
      </div>

      <ul className="m-0 flex list-none flex-col p-0">
        {items.map((p, i) => {
          const { icon: Icon, box, word } = MARK[p.verdict];
          const isOpen = open.includes(i);
          const id = `practice-${i}`;
          return (
            <li key={p.practice} className="border-b border-line-soft last:border-b-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => toggle(i)}
                className="group flex w-full items-center gap-[16px] rounded-xs py-[20px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape"
              >
                <span className={`flex size-[24px] shrink-0 items-center justify-center rounded-full ${box}`}>
                  <Icon size={14} strokeWidth={3} aria-hidden="true" />
                  <span className="sr-only">{word}:</span>
                </span>
                <span className="flex-1 text-[16px] leading-[24px] text-heading transition-colors duration-200 group-hover:text-grape md:text-[18px] md:leading-[28px]">
                  {p.practice}
                </span>
                <Plus
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={`shrink-0 text-muted transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-grape motion-reduce:transition-none ${
                    isOpen ? "rotate-45" : ""
                  }`}
                />
              </button>
              <div
                id={id}
                role="region"
                aria-label={p.practice}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <dl className="m-0 grid gap-[16px] pb-[24px] pl-[40px] md:grid-cols-2 md:gap-[32px]">
                    <div className="flex flex-col gap-[4px]">
                      <dt className="font-brand text-[12px] uppercase leading-[16px] tracking-[0.5px] text-muted">On the old page</dt>
                      <dd className="m-0 text-[16px] leading-[26px] text-secondary">{p.found}</dd>
                    </div>
                    <div className="flex flex-col gap-[4px]">
                      <dt className="font-brand text-[12px] uppercase leading-[16px] tracking-[0.5px] text-muted">The evidence</dt>
                      <dd className="m-0 text-[16px] leading-[26px] text-secondary">
                        {p.evidence}{" "}
                        <a
                          href={p.source.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-grape underline underline-offset-[2px]"
                        >
                          {p.source.label}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
