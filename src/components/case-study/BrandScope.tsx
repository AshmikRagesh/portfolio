"use client";

import { useEffect, useState } from "react";
import useInView from "./useInView";

/**
 * One skill, each brand kept apart, all in Geist. On top, a request to Helix with a brand
 * picker in it; under it, one panel per brand's design system: its foundations and some of
 * its components. Only the picked brand's panel is loaded, lit and lifted, with its
 * components popping in one after another; the others dim to "Not loaded". A short line
 * runs from the request down to the loaded panel and slides across when the brand changes.
 * Every brand has its own Buttons, so that chip is marked in each.
 * When it scrolls into view it moves through the brands once and comes back to the first;
 * picking a brand takes over. With reduced motion it simply switches. On phones the panels
 * stack and the unloaded ones fold down to their name.
 * The component names are from each brand's Helix in Ashmik's recordings (helix-notes §17).
 */
type Brand = { id: string; name: string; components: string[] };

const BRANDS: Brand[] = [
  {
    id: "TCS",
    name: "TCS World Travel",
    components: ["Trip Finder", "Search Panel", "Filter Sheet", "Destination Cards", "Activity Bento", "Buttons"],
  },
  {
    id: "Quark",
    name: "Quark Expeditions",
    components: ["Expedition Hero", "Rates Table", "Mega Menu", "Progress Ring", "Selector Bar", "Buttons"],
  },
  {
    id: "Kalos",
    name: "Kalos Golf",
    components: ["Itinerary Table", "Itinerary Day Modal", "Accommodation Info Card", "Activity Cards", "Secondary Navbar", "Buttons"],
  },
];

const FOUNDATIONS = ["Colour", "Type", "Spacing", "Radius"];
const STEP = 2600;
const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

export default function BrandScope() {
  const [ref, shown] = useInView<HTMLDivElement>(0.4);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  // Move through the brands once, then come back to the first
  useEffect(() => {
    if (!shown || touched || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const order = [1, 2, 0];
    let i = 0;
    const t = window.setInterval(() => {
      setActive(order[i]);
      i += 1;
      if (i >= order.length) window.clearInterval(t);
    }, STEP);
    return () => window.clearInterval(t);
  }, [shown, touched]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const brand = BRANDS[active];

  return (
    <div
      ref={ref}
      className={`font-geist text-heading transition-[opacity,transform] duration-[700ms] ${EASE} motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
      }`}
    >
      {/* The request */}
      <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px] rounded-lg border border-line-soft bg-white px-[16px] py-[12px]">
        <span className="rounded-xs bg-primary px-[6px] py-[2px] text-[12px] font-medium leading-[16px] text-white">/helix</span>
        <span className="text-[14px] leading-[20px] text-secondary">Build a new screen for</span>
        <span role="group" aria-label="Brand" className="flex gap-[4px] rounded-md bg-surface p-[4px]">
          {BRANDS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={i === active}
              onClick={() => pick(i)}
              className={`rounded-sm px-[12px] py-[4px] text-[14px] font-medium leading-[20px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-grape ${
                i === active ? "bg-grape text-white" : "text-secondary hover:text-grape"
              }`}
            >
              {b.id}
            </button>
          ))}
        </span>
      </div>

      {/* The line from the request to the loaded system, from md */}
      <div aria-hidden="true" className="relative hidden h-[24px] md:block">
        <span
          className={`absolute top-0 flex h-full w-[2px] -translate-x-1/2 flex-col items-center transition-[left] duration-[500ms] ${EASE} motion-reduce:transition-none`}
          style={{ left: `calc(${active} * (100% + 12px) / 3 + (100% - 24px) / 6)` }}
        >
          <span className="w-[2px] flex-1 bg-grape" />
          <span className="-mb-[4px] h-[8px] w-[8px] rounded-full bg-grape" />
        </span>
      </div>

      {/* The systems */}
      <ul className="m-0 mt-[12px] grid list-none grid-cols-1 gap-[12px] p-0 md:mt-0 md:grid-cols-3">
        {BRANDS.map((b, i) => {
          const on = i === active;
          return (
            <li
              key={b.id}
              className={`rounded-lg border p-[16px] transition-[opacity,transform,background-color,border-color] duration-[500ms] ${EASE} motion-reduce:transition-none ${
                on ? "-translate-y-[2px] border-grape/30 bg-white opacity-100" : "border-line-soft bg-surface opacity-50"
              }`}
            >
              <button
                type="button"
                onClick={() => pick(i)}
                tabIndex={-1}
                className="flex w-full items-center justify-between gap-[8px] text-left"
              >
                <span className="text-[14px] font-medium leading-[20px] text-heading">{b.name}</span>
                <span
                  className={`whitespace-nowrap rounded-full px-[8px] py-[2px] text-[12px] font-medium leading-[16px] transition-colors duration-300 ${
                    on ? "bg-grape text-white" : "bg-primary/5 text-muted"
                  }`}
                >
                  {on ? "Loaded" : "Not loaded"}
                </span>
              </button>

              {/* The system: foundations, then components. Unloaded ones fold to their name on phones */}
              <div className={`${on ? "block" : "hidden md:block"}`}>
                <p className="m-0 mt-[16px] text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-muted">Foundations</p>
                <p className="m-0 mt-[6px] text-[14px] leading-[20px] text-secondary">{FOUNDATIONS.join(" · ")}</p>
                <p className="m-0 mt-[16px] text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-muted">Components</p>
                <ul className="m-0 mt-[8px] flex list-none flex-wrap gap-[6px] p-0">
                  {b.components.map((c, k) => (
                    <li
                      key={c}
                      className={`rounded-sm px-[8px] py-[4px] text-[12px] leading-[16px] transition-[opacity,transform,background-color,color] duration-[400ms] ${EASE} motion-reduce:transition-none ${
                        on
                          ? `scale-100 opacity-100 ${c === "Buttons" ? "bg-grape text-white" : "bg-grape-light/70 text-primary"}`
                          : "scale-95 bg-primary/5 text-muted"
                      }`}
                      style={{ transitionDelay: on ? `${150 + k * 60}ms` : "0ms" }}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="m-0 mt-[16px] text-[14px] leading-[22px] text-secondary">
        Work on <span className="font-medium text-heading">{brand.id}</span> reads only {brand.id}&apos;s tokens and components, even
        its own <span className="font-medium text-grape">Buttons</span>.
      </p>
    </div>
  );
}
