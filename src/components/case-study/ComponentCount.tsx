"use client";

import { useEffect, useState } from "react";
import useInView from "./useInView";

/**
 * A headline count with its breakdown: the total large in the heading serif on the left,
 * and one row per part on the right: its name (with an optional note, like "in
 * progress") and its number on one line, and a slim bar sized against the largest part
 * underneath.
 * When it scrolls into view the numbers count up from zero and the bars grow from the
 * left, one after another; with reduced motion they're simply shown.
 */
type Part = { name: string; count: number; plus?: boolean; note?: string };

const BAR_TONE = ["bg-primary", "bg-grape", "bg-grape/50", "bg-grape-light"];

// Counts from 0 to `to` over `ms` once `run` is true, easing out
function useCountUp(to: number, run: boolean, ms = 1200, delay = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / ms));
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, ms, delay]);
  return n;
}

function Count({ to, plus, run, delay, className }: { to: number; plus?: boolean; run: boolean; delay: number; className: string }) {
  const n = useCountUp(to, run, 1200, delay);
  return (
    <span className={`tabular-nums ${className}`}>
      {n}
      {plus && n === to ? "+" : ""}
    </span>
  );
}

export default function ComponentCount({
  total,
  label,
  parts,
}: {
  total: { count: number; plus?: boolean };
  label: string;
  parts: Part[];
}) {
  const [ref, shown] = useInView<HTMLDivElement>();
  const max = Math.max(...parts.map((p) => p.count));

  return (
    <div
      ref={ref}
      className="mt-[40px] grid grid-cols-1 items-center gap-[32px] font-body text-heading md:grid-cols-[200px_1fr] md:gap-[48px]"
    >
      <p className="m-0 flex flex-col gap-[8px]">
        <Count
          to={total.count}
          plus={total.plus}
          run={shown}
          delay={0}
          className="font-heading text-[72px] font-normal leading-[72px] tracking-[-2px] text-grape md:text-[96px] md:leading-[96px]"
        />
        <span className="text-[14px] leading-[22px] text-secondary">{label}</span>
      </p>

      <dl className="m-0 flex flex-col gap-[20px]">
        {parts.map((p, i) => (
          // Name (and note) on the left, the count on the right, the bar underneath across both
          <div key={p.name} className="grid grid-cols-[1fr_auto] items-baseline gap-x-[16px] gap-y-[8px]">
            <dt className="text-[16px] leading-[24px] text-heading">
              {p.name}
              {p.note && <span className="ml-[8px] text-[14px] text-muted">{p.note}</span>}
            </dt>
            <dd className="m-0 font-heading text-[22px] leading-[28px] text-heading">
              <Count to={p.count} plus={p.plus} run={shown} delay={200 + i * 200} className="" />
            </dd>
            <dd className="col-span-2 m-0 h-[8px] overflow-hidden rounded-full bg-line-soft">
              <span
                aria-hidden="true"
                className={`block h-full origin-left rounded-full transition-transform duration-[1000ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
                  BAR_TONE[i % BAR_TONE.length]
                }`}
                style={{
                  width: `${(p.count / max) * 100}%`,
                  transform: `scaleX(${shown ? 1 : 0})`,
                  transitionDelay: `${200 + i * 200}ms`,
                }}
              />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
