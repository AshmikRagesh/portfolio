"use client";

import { useEffect, useState } from "react";
import useInView from "./useInView";

/**
 * A component beside the tokens it's built from, all in Geist. On the left, TCS's tokens as
 * they're named in its Helix: a swatch or a size, the token, and its role or value. On the
 * right, a trip card built only from those tokens.
 * Hover (or tap) a token and every part of the card that uses it gets a dashed grape
 * outline with the token's name on it; gaps and padding tint in. Hover a part of the card
 * and its tokens light up in the list instead. When it scrolls into view it walks through
 * the tokens once on its own, then waits; touching it takes over. With reduced motion it
 * doesn't walk.
 * Token names and sizes are read from TCS's Helix docs in Ashmik's recording; the colours
 * are sampled from that video, so they're close rather than exact.
 */
type Token = { id: string; role: string; swatch?: string; size?: number };
type Part = "card" | "eyebrow" | "title" | "body" | "button" | "gap";

const TOKENS: Token[] = [
  { id: "gray-90", role: "Body text", swatch: "#323640" },
  { id: "gray-70", role: "Muted text", swatch: "#4b5061" },
  { id: "gray-20", role: "Border", swatch: "#d7d8e1" },
  { id: "black", role: "Base", swatch: "#1f252d" },
  { id: "rounded-lg", role: "16px", size: 16 },
  { id: "rounded-md", role: "8px", size: 8 },
  { id: "spacing-5", role: "24px", size: 24 },
  { id: "spacing-3", role: "12px", size: 12 },
];

// Which tokens each part of the card is built from
const USES: Record<Part, string[]> = {
  card: ["gray-20", "rounded-lg", "spacing-5"],
  eyebrow: ["gray-70"],
  title: ["gray-90"],
  body: ["gray-70"],
  button: ["black", "rounded-md", "spacing-3"],
  gap: ["spacing-3"],
};

const STEP = 1500;
const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

type Focus = { token: string } | { part: Part } | null;

export default function TokenInspector() {
  const [ref, shown] = useInView<HTMLDivElement>(0.4);
  const [focus, setFocus] = useState<Focus>(null);
  const [walk, setWalk] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  // Walk through the tokens once, the first time it's seen
  useEffect(() => {
    if (!shown || touched || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    setWalk(0);
    const t = window.setInterval(() => {
      i += 1;
      if (i >= TOKENS.length) {
        window.clearInterval(t);
        setWalk(null);
        return;
      }
      setWalk(i);
    }, STEP);
    return () => window.clearInterval(t);
  }, [shown, touched]);

  const take = (f: Focus) => {
    setTouched(true);
    setWalk(null);
    setFocus(f);
  };

  const current: Focus = focus ?? (walk !== null ? { token: TOKENS[walk].id } : null);
  const litToken = (id: string) =>
    current ? ("token" in current ? current.token === id : USES[current.part].includes(id)) : false;
  const litPart = (part: Part) =>
    current ? ("part" in current ? current.part === part : USES[part].includes(current.token)) : false;
  // The token named on a lit part, when a token (not a part) is in focus
  const tag = (part: Part) => (current && "token" in current && litPart(part) ? current.token : null);

  // A part of the card: hover lights its tokens; a lit part gets a dashed outline and its tag
  const part = (p: Part, extra = "") => ({
    onMouseEnter: () => take({ part: p }),
    onMouseLeave: () => setFocus(null),
    className: `relative outline outline-2 outline-offset-4 transition-[outline-color] duration-200 ${
      litPart(p) ? "outline-dashed outline-grape" : "outline-transparent"
    } ${extra}`,
  });
  const tagFor = (p: Part, side: "top" | "bottom" = "top") => {
    const t = tag(p);
    return (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute right-0 z-[2] whitespace-nowrap rounded-xs bg-grape px-[6px] py-[2px] text-[12px] font-medium leading-[16px] text-white transition-[opacity,transform] duration-200 ${EASE} ${
          side === "top" ? "-top-[28px]" : "-bottom-[28px]"
        } ${t ? "translate-y-0 opacity-100" : "translate-y-[4px] opacity-0"}`}
      >
        {t ?? ""}
      </span>
    );
  };
  // The 12px gaps between the card's parts, which tint when spacing-3 is in focus
  const gap = (
    <span
      aria-hidden="true"
      className={`block h-[12px] w-full rounded-xs transition-colors duration-200 ${litPart("gap") ? "bg-grape/20" : "bg-transparent"}`}
    />
  );
  // The card's 24px padding tints in when spacing-5 is in focus
  const padLit = !!current && "token" in current && current.token === "spacing-5";

  return (
    <div
      ref={ref}
      className={`grid overflow-hidden rounded-xl border border-line-soft bg-white font-geist text-heading transition-[opacity,transform] duration-[700ms] ${EASE} motion-reduce:transition-none md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"
      }`}
    >
      {/* The card, built from the tokens; first on phones */}
      <div className="flex items-center justify-center bg-surface px-[24px] py-[48px] md:order-2 md:px-[40px] md:py-[56px]">
        <div
          {...part("card", "w-full max-w-[320px] rounded-[16px] border border-[#d7d8e1] bg-white transition-shadow")}
          style={{ boxShadow: padLit ? "inset 0 0 0 24px rgba(157,19,106,0.12)" : "inset 0 0 0 0 rgba(157,19,106,0)" }}
        >
          {tagFor("card")}
          <div className="flex flex-col p-[24px]">
            <span {...part("eyebrow", "self-start")}>
              {tagFor("eyebrow")}
              <span className="block text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-[#4b5061]">
                Private jet · 24 days
              </span>
            </span>
            {gap}
            <span {...part("title")}>
              {tagFor("title")}
              <span className="block font-heading text-[24px] leading-[30px] text-[#323640]">Around the World by Private Jet</span>
            </span>
            {gap}
            <span {...part("body")}>
              {tagFor("body", "bottom")}
              <span className="block text-[14px] leading-[22px] text-[#4b5061]">
                Six continents in one journey, with every detail arranged for you.
              </span>
            </span>
            <span className="block h-[24px]" />
            <span {...part("button", "self-start rounded-[8px]")}>
              {tagFor("button", "bottom")}
              <span className="block rounded-[8px] bg-[#1f252d] px-[24px] py-[12px] text-[14px] font-medium leading-[20px] text-white">
                View trip
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* The tokens */}
      <div className="border-t border-line-soft p-[16px] md:order-1 md:border-r md:border-t-0 md:p-[24px]">
        <p className="m-0 mb-[12px] px-[8px] text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-muted">
          TCS tokens
        </p>
        <ul className="m-0 flex list-none flex-col gap-[2px] p-0" onMouseLeave={() => setFocus(null)}>
          {TOKENS.map((t) => {
            const on = litToken(t.id);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onMouseEnter={() => take({ token: t.id })}
                  onFocus={() => take({ token: t.id })}
                  onClick={() => take({ token: t.id })}
                  className={`flex w-full items-center gap-[12px] rounded-md px-[8px] py-[8px] text-left outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-grape ${
                    on ? "bg-grape-light/60" : "hover:bg-surface"
                  }`}
                >
                  {/* A swatch for a colour, a corner for a radius, a bar for a space */}
                  <span aria-hidden="true" className="flex h-[20px] w-[20px] shrink-0 items-center justify-center">
                    {t.swatch ? (
                      <span className="h-[20px] w-[20px] rounded-sm ring-1 ring-inset ring-primary/10" style={{ background: t.swatch }} />
                    ) : t.id.startsWith("rounded") ? (
                      <span
                        className="h-[16px] w-[16px] border-l-2 border-t-2 border-primary/50"
                        style={{ borderTopLeftRadius: Math.min(t.size!, 12) }}
                      />
                    ) : (
                      <span className="h-[8px] rounded-xs bg-primary/30" style={{ width: Math.min(t.size!, 20) }} />
                    )}
                  </span>
                  <span className={`flex-1 text-[14px] font-medium leading-[20px] ${on ? "text-grape" : "text-heading"}`}>{t.id}</span>
                  <span className="text-[12px] leading-[16px] text-muted">{t.role}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
