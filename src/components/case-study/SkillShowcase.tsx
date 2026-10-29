"use client";

import { useEffect, useRef, useState } from "react";
import { Figure } from "./Blocks";

type Skill = { title: string; description: string; video?: string; poster?: string };

/**
 * One panel for a set of skills: the list on the left, the picked skill's recording on the
 * right. While the panel is on screen it walks through the skills on its own — a grape bar
 * fills under the active one, then the next takes over — and stops for good once the reader
 * picks one. Hovering pauses it; reduced motion turns it off. From lg the panel splits the
 * 1000px Visual into a 320px list and a 680px stage; below that the skills become a row of
 * tabs over the stage, with the description underneath.
 */
export default function SkillShowcase({ skills, duration = 8 }: { skills: Skill[]; duration?: number }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // On phones the tabs scroll sideways: keep the active one in view without moving the page
  useEffect(() => {
    const row = list.current;
    const tab = tabs.current[active];
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - 12, behavior: "smooth" });
  }, [active]);

  const running = auto && inView && !paused;
  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + skills.length) % skills.length;
    pick(next);
    tabs.current[next]?.focus();
  };
  const skill = skills[active];

  return (
    <div
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="overflow-hidden rounded-[16px] bg-white ring-1 ring-line-soft lg:grid lg:grid-cols-[320px_minmax(0,1fr)]"
    >
      <div
        ref={list}
        role="tablist"
        aria-label="Helix skills"
        aria-orientation="vertical"
        className="relative flex gap-[8px] overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-line-soft p-[12px] lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-r lg:p-0"
      >
        {skills.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.title}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`skill-tab-${i}`}
              aria-selected={on}
              aria-controls="skill-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => pick(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={`group relative flex shrink-0 flex-col gap-[8px] rounded-full px-[16px] py-[8px] text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-grape lg:rounded-none lg:border-b lg:border-line-soft lg:px-[28px] lg:py-[24px] lg:last:border-b-0 ${
                on ? "bg-grape-light/60 lg:bg-grape-light/30" : "hover:bg-grape-light/30"
              }`}
            >
              <span className="flex items-center gap-[12px]">
                <span className={`hidden font-brand text-[12px] leading-[16px] lg:inline ${on ? "text-grape" : "text-muted"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`whitespace-nowrap font-heading text-[16px] leading-[24px] tracking-[0px] lg:text-[20px] lg:leading-[28px] ${
                    on ? "text-heading" : "text-secondary group-hover:text-heading"
                  }`}
                >
                  {s.title}
                </span>
              </span>
              {/* The description opens under the active skill (desktop only) */}
              <span
                className={`hidden overflow-hidden font-body text-[16px] leading-[26px] text-secondary lg:grid lg:transition-[grid-template-rows,opacity] lg:duration-[300ms] ${
                  on ? "lg:grid-rows-[1fr] lg:opacity-100" : "lg:grid-rows-[0fr] lg:opacity-0"
                }`}
              >
                <span className="min-h-0 pl-[28px]">{s.description}</span>
              </span>
              {/* Progress: fills while the showcase plays itself; full once the reader has picked */}
              {on && (
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-[2px] bg-line-soft lg:block">
                  <span
                    key={`${active}-${auto}`}
                    className={`block h-full bg-grape ${auto ? "skill-progress" : ""}`}
                    style={
                      {
                        "--skill-duration": `${duration}s`,
                        animationPlayState: running ? "running" : "paused",
                      } as React.CSSProperties
                    }
                    onAnimationEnd={() => auto && setActive((active + 1) % skills.length)}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        id="skill-panel"
        role="tabpanel"
        aria-labelledby={`skill-tab-${active}`}
        className="flex flex-col justify-center gap-[16px] bg-grape-light/20 p-[16px] md:p-[24px]"
      >
        <div key={active} className="cs-fade">
          <Figure
            name={`Recording: ${skill.title}`}
            video={skill.video}
            poster={skill.poster}
            alt={`Helix ${skill.title} skill in Claude Code`}
          />
        </div>
        <p className="font-body text-[16px] leading-[26px] text-secondary lg:hidden">{skill.description}</p>
      </div>
    </div>
  );
}
