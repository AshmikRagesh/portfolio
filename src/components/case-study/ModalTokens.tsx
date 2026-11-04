"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { X } from "lucide-react";
import useInView from "./useInView";

/**
 * A real component beside the tokens it's made of, all in Geist, with no box around
 * either: Quark's "Verify your email" modal on the left, and on the right the Quark tokens
 * behind it, grouped into colour, radius, spacing and shadow.
 * Point at (or tap) any part of the modal and the rest of it dims, the part gets a dashed
 * outline with its tokens named on a tag, and those tokens light up in the list; point at a
 * token and every part that uses it lights instead. The panel's padding tints in when its
 * spacing is lit.
 * When it scrolls into view the modal opens (rises and settles, then the code types itself
 * in), the tokens arrive one after another, and it walks through the parts once on its
 * own; touching it takes over. With reduced motion it simply shows.
 * The modal is rebuilt from Quark's Helix docs in Ashmik's recording (helix-notes §19):
 * the token names and sizes are as shown there; the colours are sampled from the video,
 * so they're close rather than exact.
 */
type Part = "panel" | "title" | "close" | "body" | "code" | "help" | "cancel" | "confirm";
type Group = "Colour" | "Radius" | "Spacing" | "Shadow";
type Token = { id: string; group: Group; role: string; swatch?: string; size?: number };

const TOKENS: Token[] = [
  { id: "brand-yellow", group: "Colour", role: "Brand", swatch: "#F2B84B" },
  { id: "black", group: "Colour", role: "Base", swatch: "#1F252D" },
  { id: "white", group: "Colour", role: "Base", swatch: "#FFFFFF" },
  { id: "gray-90", group: "Colour", role: "Body text", swatch: "#323640" },
  { id: "gray-70", group: "Colour", role: "Muted text", swatch: "#495161" },
  { id: "gray-30", group: "Colour", role: "Input border", swatch: "#C2C6D1" },
  { id: "rounded-lg", group: "Radius", role: "16px", size: 16 },
  { id: "rounded-md", group: "Radius", role: "8px", size: 8 },
  { id: "spacing-5", group: "Spacing", role: "24px", size: 24 },
  { id: "spacing-2", group: "Spacing", role: "8px", size: 8 },
  { id: "shadow-lg", group: "Shadow", role: "Large" },
];
const GROUPS: Group[] = ["Colour", "Radius", "Spacing", "Shadow"];

// Which tokens each part of the modal is built from
const USES: Record<Part, string[]> = {
  panel: ["white", "rounded-lg", "spacing-5", "shadow-lg"],
  title: ["gray-90"],
  close: ["gray-70"],
  body: ["gray-70", "gray-90"],
  code: ["gray-30", "rounded-md", "spacing-2"],
  help: ["gray-70"],
  cancel: ["gray-90"],
  confirm: ["brand-yellow", "black", "rounded-md"],
};

const WALK: Part[] = ["panel", "title", "body", "code", "confirm", "cancel"];
const CODE = ["1", "2", "5", "7", "1", "9"];
const STEP = 1700;
const EASE = "ease-[cubic-bezier(0.2,0.7,0.2,1)]";

type Focus = { part: Part } | { token: string } | null;

export default function ModalTokens() {
  const [ref, shown] = useInView<HTMLDivElement>(0.4);
  const [focus, setFocus] = useState<Focus>(null);
  const [walk, setWalk] = useState<number | null>(null);
  const [typed, setTyped] = useState(0);
  const touched = useRef(false);
  const lastTag = useRef<Partial<Record<Part, string>>>({});

  // Open: type the code in, then walk through the parts once
  useEffect(() => {
    if (!shown) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(CODE.length);
      return;
    }
    const timers: number[] = [];
    CODE.forEach((_, i) => timers.push(window.setTimeout(() => setTyped(i + 1), 700 + i * 130)));
    WALK.forEach((_, i) => timers.push(window.setTimeout(() => !touched.current && setWalk(i), 1900 + i * STEP)));
    timers.push(window.setTimeout(() => !touched.current && setWalk(null), 1900 + WALK.length * STEP));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [shown]);

  const take = (f: Focus) => {
    touched.current = true;
    setWalk(null);
    setFocus(f);
  };

  const current: Focus = focus ?? (walk !== null ? { part: WALK[walk] } : null);
  const litToken = (id: string) => (current ? ("token" in current ? current.token === id : USES[current.part].includes(id)) : false);
  const litPart = (p: Part) => (current ? ("part" in current ? current.part === p : USES[p].includes(current.token)) : false);
  const dim = (p: Part) => !!current && !litPart(p);

  // The tag on a focused part names its tokens (a focused token is already named in the
  // list, so its parts just outline); it keeps its last words while it fades, so it never
  // shrinks to an empty chip
  const tagText = (p: Part) => (current && "part" in current && current.part === p ? USES[p].join(" · ") : null);
  const tag = (p: Part, side: "top" | "bottom" = "top", align: "left" | "right" = "left") => {
    const t = tagText(p);
    if (t) lastTag.current[p] = t;
    return (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute ${align === "left" ? "left-0" : "right-0"} z-[3] w-max max-w-[calc(100vw-64px)] rounded-xs bg-grape px-[6px] py-[2px] text-[12px] font-medium leading-[16px] text-white transition-[opacity,transform] duration-300 ${EASE} ${
          side === "top" ? "bottom-full mb-[10px]" : "top-full mt-[10px]"
        } ${t ? "translate-y-0 opacity-100" : side === "top" ? "translate-y-[4px] opacity-0" : "-translate-y-[4px] opacity-0"}`}
      >
        {t ?? lastTag.current[p] ?? ""}
      </span>
    );
  };

  // A part: dims when something else is lit, gets a dashed outline when it's lit
  const part = (p: Part, extra = "") => ({
    "data-part": p,
    className: `relative outline-dashed outline-2 transition-[opacity,outline-color,outline-offset] duration-300 ${EASE} ${
      litPart(p) ? "outline-grape outline-offset-[6px]" : "outline-transparent outline-offset-[2px]"
    } ${dim(p) ? "opacity-30" : "opacity-100"} ${extra}`,
  });

  // Pointing anywhere on the modal focuses the closest part (the panel itself in its padding)
  const onPoint = (e: PointerEvent) => {
    const el = (e.target as HTMLElement).closest("[data-part]");
    const p = el?.getAttribute("data-part") as Part | null;
    if (p) take({ part: p });
  };

  const padLit = litPart("panel") && !!current && ("part" in current || current.token === "spacing-5");

  return (
    <figure ref={ref} className="m-0">
      <div className="grid items-center gap-[48px] font-geist text-heading md:grid-cols-[minmax(0,420px)_240px] md:justify-center md:gap-[64px]">
        {/* The modal */}
        <div
          className={`flex justify-center transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.34,1.3,0.64,1)] motion-reduce:transition-none ${
            shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-[16px] scale-[0.96] opacity-0"
          }`}
        >
          <div
            onPointerOver={onPoint}
            onPointerLeave={() => setFocus(null)}
            data-part="panel"
            className={`relative w-full max-w-[420px] rounded-[16px] bg-white outline-dashed outline-2 transition-[outline-color,outline-offset,box-shadow] duration-300 ${EASE} ${
              litPart("panel") ? "outline-grape outline-offset-[8px]" : "outline-transparent outline-offset-[2px]"
            }`}
            style={{
              boxShadow: `0 12px 32px rgba(31,37,45,0.12), 0 2px 6px rgba(31,37,45,0.06)${
                padLit ? ", inset 0 0 0 24px rgba(157,19,106,0.10)" : ", inset 0 0 0 0 rgba(157,19,106,0)"
              }`,
            }}
          >
            {tag("panel")}
            <div className="flex flex-col p-[24px]">
              <div className="flex items-start justify-between gap-[16px]">
                <span {...part("title")}>
                  {tag("title")}
                  <span className="block text-[20px] font-semibold leading-[28px] text-[#323640]">Verify Your Email</span>
                </span>
                <span {...part("close", "rounded-xs")}>
                {tag("close", "top", "right")}
                  <X size={20} strokeWidth={2} aria-hidden="true" className="text-[#495161]" />
                </span>
              </div>
              <span {...part("body", "mt-[12px]")}>
              {tag("body", "bottom")}
                <span className="block text-[14px] leading-[22px] text-[#495161]">
                  We&apos;ve sent a one-time code to <span className="font-semibold text-[#323640]">sarah@email.com</span>. Please enter the
                  6-digit code below to verify your email address. This helps us keep your information secure.
                </span>
              </span>
              <span {...part("code", "mt-[24px] self-start")}>
                {tag("code")}
                <span className="flex gap-[8px]">
                  {CODE.map((d, i) => (
                    <span
                      key={i}
                      className={`flex h-[44px] w-[40px] items-center justify-center rounded-[8px] border text-[16px] font-medium leading-[24px] text-[#323640] transition-colors duration-200 ${
                        i === typed && typed < CODE.length && shown ? "border-[#323640]" : "border-[#C2C6D1]"
                      }`}
                    >
                      <span
                        className={`transition-[opacity,transform] duration-200 ${EASE} ${
                          i < typed ? "translate-y-0 opacity-100" : "translate-y-[4px] opacity-0"
                        }`}
                      >
                        {d}
                      </span>
                    </span>
                  ))}
                </span>
              </span>
              <span {...part("help", "mt-[16px] self-start")}>
              {tag("help", "bottom")}
                <span className="block text-[14px] leading-[22px] text-[#495161]">
                  Didn&apos;t receive the code? <span className="font-semibold text-[#2F4A6D]">Resend</span>
                </span>
              </span>
              <div className="mt-[24px] flex items-center justify-end gap-[8px]">
                <span {...part("cancel", "rounded-[8px]")}>
                {tag("cancel", "bottom", "right")}
                  <span className="block px-[16px] py-[10px] text-[14px] font-semibold leading-[20px] text-[#323640]">Cancel</span>
                </span>
                <span {...part("confirm", "rounded-[8px]")}>
                  {tag("confirm", "bottom")}
                  <span className="block rounded-[8px] bg-[#F2B84B] px-[16px] py-[10px] text-[14px] font-semibold leading-[20px] text-[#1F252D]">
                    Verify &amp; Continue
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The tokens */}
        <div onPointerLeave={() => setFocus(null)} className="flex flex-col gap-[20px]">
          {GROUPS.map((g) => (
            <div key={g}>
              <p className="m-0 mb-[6px] px-[8px] text-[12px] font-medium uppercase leading-[16px] tracking-[0.5px] text-muted">{g}</p>
              <ul className="m-0 flex list-none flex-col p-0">
                {TOKENS.filter((t) => t.group === g).map((t) => {
                  const on = litToken(t.id);
                  const order = TOKENS.indexOf(t);
                  return (
                    <li
                      key={t.id}
                      className={`transition-[opacity,transform] duration-[500ms] ${EASE} motion-reduce:transition-none ${
                        shown ? "translate-x-0 opacity-100" : "translate-x-[12px] opacity-0"
                      }`}
                      style={{ transitionDelay: shown ? `${400 + order * 50}ms` : "0ms" }}
                    >
                      <button
                        type="button"
                        aria-pressed={on}
                        onPointerOver={() => take({ token: t.id })}
                        onFocus={() => take({ token: t.id })}
                        onClick={() => take({ token: t.id })}
                        className={`flex w-full items-center gap-[12px] rounded-md px-[8px] py-[6px] text-left outline-none transition-[background-color,opacity,transform] duration-300 ${EASE} focus-visible:ring-2 focus-visible:ring-grape ${
                          on ? "translate-x-[4px] bg-grape-light/70" : current ? "opacity-40" : ""
                        }`}
                      >
                        {/* A swatch for a colour, a corner for a radius, a bar for a space, a lifted square for a shadow */}
                        <span aria-hidden="true" className="flex h-[20px] w-[20px] shrink-0 items-center justify-center">
                          {t.swatch ? (
                            <span
                              className={`h-[20px] w-[20px] rounded-sm ring-1 ring-inset ring-primary/10 transition-transform duration-300 ${on ? "scale-110" : ""}`}
                              style={{ background: t.swatch }}
                            />
                          ) : t.group === "Radius" ? (
                            <span
                              className="h-[16px] w-[16px] border-l-2 border-t-2 border-primary/50"
                              style={{ borderTopLeftRadius: Math.min(t.size!, 12) }}
                            />
                          ) : t.group === "Spacing" ? (
                            <span className="h-[8px] rounded-xs bg-primary/30" style={{ width: Math.min(t.size!, 20) }} />
                          ) : (
                            <span className="h-[14px] w-[14px] rounded-xs bg-white shadow-[0_4px_10px_rgba(31,37,45,0.25)]" />
                          )}
                        </span>
                        <span
                          className={`flex-1 text-[14px] font-medium leading-[20px] transition-colors duration-300 ${on ? "text-grape" : "text-heading"}`}
                        >
                          {t.id}
                        </span>
                        <span className="text-[12px] leading-[16px] text-muted">{t.role}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mx-auto mt-[32px] max-w-[724px] font-body text-[14px] leading-[22px] text-muted">
        Quark&apos;s email check, rebuilt from its Helix tokens. Point at any part of it to see what it&apos;s made of.
      </figcaption>
    </figure>
  );
}
