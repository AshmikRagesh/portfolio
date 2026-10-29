"use client";

import { useRef, useState } from "react";

/**
 * A rollout as an interactive roadmap, all in Geist. One lane per stream of work on a shared
 * month axis; each lane holds one or more rounded segments. Move along the chart (pointer,
 * drag on touch, or arrow keys once focused) and a grape crosshair snaps to each half-month,
 * the segments running then stay lit while the rest fade, and the readout under the chart
 * lists what was happening. On phones (where lane names sit over the bars) the rules are
 * hidden and a tap just lights the bars and fills the readout. A screen-reader table carries
 * the same content.
 * Positions are in month units: 0 is the start of the first month, 1 of the second.
 */
type Tone = "dark" | "grape" | "soft" | "pale";
type Segment = { start: number; end: number; tone: Tone; label: string; detail: string; open?: boolean };
type Lane = { name: string; segments: Segment[] };

const TONE: Record<Tone, { bar: string; dot: string }> = {
  dark: { bar: "bg-primary text-white", dot: "bg-primary" },
  grape: { bar: "bg-grape text-white", dot: "bg-grape" },
  soft: { bar: "bg-grape-light text-primary ring-1 ring-inset ring-grape/20", dot: "bg-grape-light ring-1 ring-grape/40" },
  pale: {
    bar: "bg-[repeating-linear-gradient(135deg,rgba(157,19,106,0.12)_0_6px,rgba(157,19,106,0.04)_6px_12px)] text-grape ring-1 ring-inset ring-grape/20",
    dot: "bg-grape/20",
  },
};

const HALVES = ["Early", "Late"];

export default function RolloutTracks({
  months,
  lanes,
  milestone,
}: {
  months: string[];
  lanes: Lane[];
  milestone?: { at: number; label: string };
}) {
  const steps = months.flatMap((m, i) => HALVES.map((h, j) => ({ at: i + j * 0.5 + 0.25, name: `${h} ${m}` })));
  const [step, setStep] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);

  const pos = (m: number) => `${(m / months.length) * 100}%`;
  const span = (a: number, b: number) => ({ left: pos(a), width: `calc(${pos(b)} - ${pos(a)})` });
  const cols = { gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` };
  const lane = "grid grid-cols-1 gap-[8px] md:grid-cols-[152px_minmax(0,1fr)] md:items-center md:gap-[16px]";

  const t = step === null ? null : steps[step].at;
  const live = (s: Segment) => t !== null && s.start <= t && t < s.end;
  const active = t === null ? [] : lanes.flatMap((l) => l.segments.filter(live).map((s) => ({ lane: l.name, ...s })));

  const track = (clientX: number) => {
    const r = area.current?.getBoundingClientRect();
    if (!r) return;
    const m = ((clientX - r.left) / r.width) * months.length;
    setStep(Math.max(0, Math.min(steps.length - 1, Math.floor(m * 2))));
  };
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (e.key === "Home") setStep(0);
    else if (e.key === "End") setStep(steps.length - 1);
    else if (d) setStep((s) => Math.max(0, Math.min(steps.length - 1, (s ?? (d > 0 ? -1 : steps.length)) + d)));
    else return;
    e.preventDefault();
  };

  return (
    <div className="font-geist">
      <div
        role="group"
        tabIndex={0}
        aria-label="Rollout by month. Use the left and right arrow keys to move through it."
        onKeyDown={onKey}
        onBlur={() => setStep(null)}
        className="rounded-[12px] bg-grape-light/30 p-[16px] pt-[40px] outline-none focus-visible:ring-2 focus-visible:ring-grape md:p-[24px] md:pt-[44px]"
      >
        {/* Month axis */}
        <div className={`${lane} mb-[4px]`}>
          <span className="hidden md:block" />
          <div className="grid" style={cols}>
            {months.map((m) => (
              <span key={m} className="pb-[8px] text-[12px] font-medium uppercase leading-[16px] tracking-[0px] text-muted">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <ol className="m-0 flex list-none flex-col gap-[12px] p-0 md:gap-[8px]">
            {lanes.map(({ name, segments }) => (
              <li key={name} className={lane}>
                <span className="text-[14px] font-medium leading-[20px] text-heading">{name}</span>
                <div className="relative h-[32px]">
                  <div aria-hidden="true" className="absolute inset-0 grid" style={cols}>
                    {months.map((m, i) => (
                      <span key={m} className={i ? "border-l border-primary/10" : ""} />
                    ))}
                  </div>
                  {segments.map((s) => (
                    <span
                      key={s.label}
                      className={`absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap rounded-[8px] px-[10px] text-[12px] font-medium leading-[16px] transition-opacity duration-200 motion-reduce:transition-none ${
                        TONE[s.tone].bar
                      } ${s.open ? "[mask-image:linear-gradient(to_right,black_75%,transparent)]" : ""} ${
                        t !== null && !live(s) ? "opacity-30" : "opacity-100"
                      }`}
                      style={span(s.start, s.end)}
                    >
                      <span className="hidden md:inline">{s.label}</span>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {/* The tracking area sits over the bars (not the labels) and draws the crosshair */}
          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${lane}`}>
            <span className="hidden md:block" />
            <div
              ref={area}
              onPointerMove={(e) => track(e.clientX)}
              onPointerDown={(e) => track(e.clientX)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setStep(null)}
              className="pointer-events-auto relative h-full touch-pan-y"
            >
              {milestone && (
                <span className="absolute -inset-y-[8px] hidden border-l-2 border-dashed border-grape/50 md:block" style={{ left: pos(milestone.at) }} />
              )}
              {t !== null && (
                <span className="absolute -inset-y-[8px] hidden w-0 border-l-2 border-grape md:block" style={{ left: pos(t) }}>
                  <span className="absolute -top-[56px] left-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-grape px-[8px] py-[2px] text-[12px] font-medium leading-[16px] text-white">
                    {steps[step!].name}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Readout: what was happening at the crosshair */}
      <div aria-live="polite" className="mt-[16px] min-h-[96px] md:min-h-[176px]">
        {t === null ? (
          <p className="m-0 flex flex-col gap-[8px] text-[14px] leading-[22px] text-muted">
            <span>Move along the months to see what was happening.</span>
            {milestone && (
              <span className="inline-flex items-center gap-[8px]">
                <span aria-hidden="true" className="inline-block h-[14px] border-l-2 border-dashed border-grape/50" />
                {milestone.label}
              </span>
            )}
          </p>
        ) : (
          <div className="flex flex-col gap-[12px]">
            <p className="m-0 text-[14px] font-medium leading-[20px] text-heading">{steps[step!].name}</p>
            <ul className="m-0 grid list-none grid-cols-1 gap-[12px] p-0 md:grid-cols-2">
              {active.map(({ lane: l, label, detail, tone }) => (
                <li key={l + label} className="flex gap-[12px]">
                  <span aria-hidden="true" className={`mt-[4px] size-[12px] shrink-0 rounded-[4px] ${TONE[tone].dot}`} />
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[14px] font-medium leading-[20px] text-heading">
                      {l} · {label}
                    </span>
                    <span className="text-[14px] leading-[22px] text-secondary">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* The same content for screen readers */}
      <table className="sr-only">
        <caption>Rollout, by stream of work</caption>
        <thead>
          <tr>
            <th scope="col">Stream</th>
            <th scope="col">When</th>
            <th scope="col">What happened</th>
          </tr>
        </thead>
        <tbody>
          {lanes.flatMap((l) =>
            l.segments.map((s) => (
              <tr key={l.name + s.label}>
                <th scope="row">{l.name}</th>
                <td>
                  {steps[Math.floor(s.start * 2)]?.name} to {s.open ? "today" : steps[Math.ceil(s.end * 2) - 1]?.name}
                </td>
                <td>
                  {s.label}: {s.detail}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
