"use client";

import { useEffect, useState } from "react";
import useInView from "./useInView";

/**
 * A headline count with its breakdown, in Geist: the total large on the left, and one row
 * per part on the right, each a name, a solid bar sized against the largest part, and its
 * own number. When it scrolls into view the numbers count up from zero and the bars grow
 * from the left, one after another; with reduced motion they're simply shown.
 */
type Part = { name: string; count: number; plus?: boolean };

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
      className="mt-[40px] grid grid-cols-1 items-center gap-[32px] font-geist text-heading md:grid-cols-[200px_1fr] md:gap-[48px]"
    >
      <p className="m-0 flex flex-col gap-[8px]">
        <Count
          to={total.count}
          plus={total.plus}
          run={shown}
          delay={0}
          className="text-[72px] font-medium leading-[72px] tracking-[-2px] text-grape md:text-[88px] md:leading-[88px]"
        />
        <span className="text-[14px] leading-[22px] text-secondary">{label}</span>
      </p>

      <dl className="m-0 flex flex-col gap-[16px]">
        {parts.map((p, i) => (
          <div key={p.name} className="grid grid-cols-[64px_1fr_48px] items-center gap-[16px]">
            <dt className="text-[14px] font-medium leading-[20px]">{p.name}</dt>
            <dd className="m-0 h-[12px] overflow-hidden rounded-full bg-line-soft">
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
            <dd className="m-0 text-right text-[16px] font-medium leading-[24px]">
              <Count to={p.count} plus={p.plus} run={shown} delay={200 + i * 200} className="" />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
