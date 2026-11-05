"use client";

import { Tag } from "@/components/Tag";
import useInView from "./useInView";

/**
 * What a test's result leads to, drawn as a split and a join. A dark card says what's
 * measured; the line runs down and splits into one card per possible result (what we'd
 * do, and why it's ready); the branches then join again into what happens either way.
 *
 * Plays once as it scrolls into view: the start card settles in, the line draws down and
 * out to each branch, the branch cards rise one after another, then the lines draw back
 * together into the last card. From tablet up the branches sit side by side with drawn
 * connectors; on phones they stack down a single line. Reduced motion shows it all at once.
 */
type Branch = { when: string; title: string; detail: string };

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const LINE = "bg-line";

export default function DecisionTree({
  start,
  branches,
  end,
}: {
  start: { label: string; title: string; measures: string[] };
  branches: Branch[];
  end: { label: string; title: string; detail: string };
}) {
  const [ref, shown] = useInView<HTMLDivElement>(0.25);
  // When each part arrives, in ms after the tree comes into view
  const t = {
    stem: 350,
    split: 650,
    drop: 900,
    card: (i: number) => 1100 + i * 180,
    join: 1100 + branches.length * 180 + 250,
  };
  const endAt = t.join + 550;

  const delay = (ms: number) => ({ transitionDelay: shown ? `${ms}ms` : "0ms" });
  const draw = (axis: "x" | "y") =>
    `transition-transform duration-[500ms] ${EASE} motion-reduce:transition-none ${
      shown ? "scale-100" : axis === "x" ? "scale-x-0" : "scale-y-0"
    }`;
  const rise = `transition-[opacity,transform] duration-[600ms] ${EASE} motion-reduce:transition-none ${
    shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
  }`;

  const cols = branches.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  // The rails run between the first and last branch's centres
  const rail = branches.length === 2 ? "left-1/4 right-1/4" : "left-[16.666%] right-[16.666%]";

  return (
    <div ref={ref} className="flex flex-col items-stretch">
      {/* What's measured */}
      <div
        className={`mx-auto w-full max-w-[560px] rounded-xl bg-primary p-[24px] text-white md:p-[32px] md:text-center ${rise}`}
      >
        <span className="font-geist text-[12px] font-medium uppercase leading-[16px] tracking-[1px] text-white/60">
          {start.label}
        </span>
        <p className="mt-[8px] font-heading text-[24px] leading-[30px]">{start.title}</p>
        <ul className="m-0 mt-[16px] flex list-none flex-wrap gap-[8px] p-0 md:justify-center">
          {start.measures.map((m) => (
            <li key={m}>
              <Tag face="geist" tone="grape">{m}</Tag>
            </li>
          ))}
        </ul>
      </div>

      {/* Down, then out to each branch */}
      <span aria-hidden="true" className={`mx-auto h-[32px] w-[2px] origin-top ${LINE} ${draw("y")}`} style={delay(t.stem)} />
      <div aria-hidden="true" className="relative hidden h-[2px] md:block">
        <span className={`absolute inset-y-0 ${rail} origin-center ${LINE} ${draw("x")}`} style={delay(t.split)} />
      </div>

      <ol className={`m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:gap-[24px] ${cols}`}>
        {branches.map(({ when, title, detail }, i) => (
          <li key={when} className="flex flex-col">
            <span
              aria-hidden="true"
              className={`mx-auto hidden h-[32px] w-[2px] origin-top md:block ${LINE} ${draw("y")}`}
              style={delay(t.drop)}
            />
            <div
              className={`flex flex-1 flex-col gap-[12px] rounded-xl border border-line-soft bg-white p-[24px] transition-[opacity,transform] duration-[600ms] ${EASE} motion-reduce:transition-none ${
                shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
              }`}
              style={delay(t.card(i))}
            >
              <div>
                <Tag face="geist" tone="grey">{when}</Tag>
              </div>
              <h4 className="font-heading text-[24px] leading-[30px] tracking-[0px] text-heading">{title}</h4>
              <p className="font-body text-[18px] leading-[30px] text-secondary">{detail}</p>
            </div>
            <span
              aria-hidden="true"
              className={`mx-auto hidden h-[32px] w-[2px] origin-top md:block ${LINE} ${draw("y")}`}
              style={delay(t.join)}
            />
          </li>
        ))}
      </ol>

      {/* Back together, into what happens either way */}
      <div aria-hidden="true" className="relative hidden h-[2px] md:block">
        <span className={`absolute inset-y-0 ${rail} origin-center ${LINE} ${draw("x")}`} style={delay(t.join + 250)} />
      </div>
      <span aria-hidden="true" className={`mx-auto h-[32px] w-[2px] origin-top ${LINE} ${draw("y")}`} style={delay(t.join + 400)} />

      <div
        className={`mx-auto w-full max-w-[560px] rounded-xl border border-dashed border-grape/40 bg-grape-light/45 p-[24px] md:p-[32px] md:text-center ${rise}`}
        style={delay(endAt)}
      >
        <Tag face="geist" tone="grape">{end.label}</Tag>
        <p className="mt-[12px] font-heading text-[24px] leading-[30px] text-heading">{end.title}</p>
        <p className="mt-[8px] font-body text-[18px] leading-[30px] text-secondary">{end.detail}</p>
      </div>
    </div>
  );
}
