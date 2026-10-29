"use client";

import { useRef, useState } from "react";

/**
 * A rollout as an interactive roadmap, all in Geist. One lane per stream of work on a shared
 * month axis; each lane holds one or more rounded segments.
 * From tablet up: hover a bar to read just that stream, or anywhere else on the chart for a
 * grape crosshair that snaps to each half-month and lights what was running then. Click to
 * keep a view, use the chips to jump to the key moments, or arrow keys once focused. It opens
 * on the milestone, so the cards under the chart always show something.
 * Phones have no hover, so there every lane is laid out in full instead: a slim bar on the
 * month axis, the lane's name, and each segment's span and story.
 * A screen-reader table carries the same content.
 * Positions are in month units: 0 is the start of the first month, 1 of the second.
 */
type Tone = "dark" | "grape" | "soft" | "pale";
type Segment = { start: number; end: number; tone: Tone; label: string; detail: string; open?: boolean };
type Lane = { name: string; segments: Segment[] };
type View = { kind: "step"; i: number } | { kind: "seg"; lane: string; label: string };

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
  now,
}: {
  months: string[];
  lanes: Lane[];
  milestone?: { at: number; label: string };
  /** Today on the axis: a solid Blackcurrant rule; open segments run up to it */
  now?: { at: number; label: string };
}) {
  const steps = months.flatMap((m, i) => HALVES.map((h, j) => ({ at: i + j * 0.5 + 0.25, name: `${h} ${m}` })));
  const stepAt = (m: number) => Math.max(0, Math.min(steps.length - 1, Math.floor(m * 2)));
  const home: View = { kind: "step", i: stepAt(milestone ? milestone.at : 0) };
  const [pinned, setPinned] = useState<View>(home);
  const [hover, setHover] = useState<View | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  const pos = (m: number) => `${(m / months.length) * 100}%`;
  const span = (a: number, b: number) => ({ left: pos(a), width: `calc(${pos(b)} - ${pos(a)})` });
  const end = (s: Segment) => (s.open && now ? now.at : s.end);
  const cols = { gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` };
  const lane = "grid grid-cols-1 gap-[8px] md:grid-cols-[152px_minmax(0,1fr)] md:items-center md:gap-[16px]";

  // "Jul", "Mid Jul – Aug", "Aug onwards": a segment's span in words
  const when = (s: Segment) => {
    const from = `${s.start % 1 >= 0.5 ? "Mid " : ""}${months[Math.floor(s.start)]}`;
    if (s.open) return `${from} onwards`;
    const to = months[Math.ceil(s.end) - 1];
    return to === months[Math.floor(s.start)] ? from : `${from} – ${to}`;
  };

  const view = hover ?? pinned;
  const t = view.kind === "step" ? steps[view.i].at : null;
  const lit = (l: string, s: Segment) =>
    view.kind === "seg" ? view.lane === l && view.label === s.label : s.start <= t! && t! < end(s);
  // One card per lane, always on screen: the lit segment, else the one nearest the crosshair
  const cards = lanes.map((l) => {
    const on = l.segments.find((s) => lit(l.name, s));
    const near = t === null ? l.segments[0] : [...l.segments].sort((a, b) => Math.abs(a.start - t) - Math.abs(b.start - t))[0];
    return { lane: l.name, on: !!on, ...(on ?? near) };
  });
  const same = (a: View, b: View) =>
    a.kind === b.kind && (a.kind === "step" ? a.i === (b as typeof a).i : a.lane === (b as typeof a).lane && a.label === (b as typeof a).label);

  // Which bar, or which half-month, sits under the pointer
  const at = (x: number, y: number): View | null => {
    const r = area.current?.getBoundingClientRect();
    if (!r) return null;
    const m = ((x - r.left) / r.width) * months.length;
    const row = rows.current.findIndex((el) => {
      const b = el?.getBoundingClientRect();
      return b && y >= b.top && y <= b.bottom;
    });
    const seg = row >= 0 ? lanes[row].segments.find((s) => m >= s.start && m <= end(s)) : undefined;
    return seg ? { kind: "seg", lane: lanes[row].name, label: seg.label } : { kind: "step", i: stepAt(m) };
  };

  const onKey = (e: React.KeyboardEvent) => {
    // From a bar, the arrows carry on from where that bar starts
    const seg = view.kind === "seg" ? lanes.find((l) => l.name === view.lane)?.segments.find((x) => x.label === view.label) : undefined;
    const i = view.kind === "step" ? view.i : stepAt(seg?.start ?? 0);
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = steps.length - 1;
    else if (d) next = Math.max(0, Math.min(steps.length - 1, i + d));
    else if (e.key === "Escape") next = home.kind === "step" ? home.i : 0;
    else return;
    e.preventDefault();
    setHover(null);
    setPinned({ kind: "step", i: next });
  };

  const jumps = [
    { name: "Start", view: { kind: "step", i: 0 } as View },
    ...(milestone ? [{ name: "August", view: { kind: "step", i: stepAt(milestone.at) } as View }] : []),
    ...(now ? [{ name: "Now", view: { kind: "step", i: stepAt(now.at) } as View }] : []),
  ];

  return (
    <div className="font-geist">
      {/* Phones: no hover, so every lane shows its bar and what happened, all at once */}
      <div className="rounded-[12px] bg-grape-light/30 p-[16px] md:hidden">
        <div className="grid pb-[4px]" style={cols}>
          {months.map((m) => (
            <span key={m} className="text-[12px] font-medium uppercase leading-[16px] text-muted">
              {m}
            </span>
          ))}
        </div>
        <ol className="m-0 flex list-none flex-col p-0">
          {lanes.map(({ name, segments }) => (
            <li key={name} className="flex flex-col gap-[12px] border-t border-primary/10 py-[16px] first:border-t-0">
              <div className="relative h-[8px] rounded-full bg-primary/5">
                {segments.map((s) => (
                  <span
                    key={s.label}
                    className={`absolute inset-y-0 rounded-full ${TONE[s.tone].bar} ${s.open && !now ? "[mask-image:linear-gradient(to_right,black_70%,transparent)]" : ""}`}
                    style={span(s.start, end(s))}
                  />
                ))}
                {milestone && (
                  <span
                    aria-hidden="true"
                    className="absolute -inset-y-[4px] border-l-2 border-dashed border-grape/50"
                    style={{ left: pos(milestone.at) }}
                  />
                )}
                {now && (
                  <span aria-hidden="true" className="absolute -inset-y-[4px] border-l-2 border-primary" style={{ left: pos(now.at) }} />
                )}
              </div>
              <span className="text-[16px] font-medium leading-[24px] text-heading">{name}</span>
              <ul className="m-0 flex list-none flex-col gap-[8px] p-0">
                {segments.map((s) => (
                  <li key={s.label} className="flex flex-col gap-[2px]">
                    <span className="text-[12px] font-medium uppercase leading-[16px] text-grape">
                      {s.label} · {when(s)}
                    </span>
                    <span className="text-[14px] leading-[22px] text-secondary">{s.detail}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-[8px] border-t border-primary/10 pt-[12px]">
          {milestone && (
            <p className="m-0 flex items-center gap-[8px] text-[14px] leading-[22px] text-secondary">
              <span aria-hidden="true" className="inline-block h-[14px] border-l-2 border-dashed border-grape/50" />
              {milestone.label}
            </p>
          )}
          {now && (
            <p className="m-0 flex items-center gap-[8px] text-[14px] leading-[22px] text-secondary">
              <span aria-hidden="true" className="inline-block h-[14px] border-l-2 border-primary" />
              {now.label}
            </p>
          )}
        </div>
      </div>

      {/* Tablet and up: the interactive roadmap */}
      <div className="hidden md:block">
        <div
          role="group"
          tabIndex={0}
          aria-label="Rollout by month. Hover a bar or a month, click to keep it, or use the left and right arrow keys."
          onKeyDown={onKey}
          className="rounded-[12px] bg-grape-light/30 p-[24px] pt-[44px] outline-none focus-visible:ring-2 focus-visible:ring-grape"
        >
          {/* Month axis */}
          <div className={`${lane} mb-[4px]`}>
            <span />
            <div className="grid" style={cols}>
              {months.map((m) => (
                <span key={m} className="pb-[8px] text-[12px] font-medium uppercase leading-[16px] tracking-[0px] text-muted">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <ol className="m-0 flex list-none flex-col gap-[8px] p-0">
              {lanes.map(({ name, segments }, li) => (
                <li
                  key={name}
                  ref={(el) => {
                    rows.current[li] = el;
                  }}
                  className={lane}
                >
                  <span
                    className={`text-[14px] font-medium leading-[20px] transition-colors duration-200 ${
                      segments.some((s) => lit(name, s)) ? "text-heading" : "text-muted"
                    }`}
                  >
                    {name}
                  </span>
                  <div className="relative h-[32px]">
                    <div aria-hidden="true" className="absolute inset-0 grid" style={cols}>
                      {months.map((m, i) => (
                        <span key={m} className={i ? "border-l border-primary/10" : ""} />
                      ))}
                    </div>
                    {segments.map((s) => {
                      const on = lit(name, s);
                      const focus = view.kind === "seg" && on;
                      return (
                        <span
                          key={s.label}
                          className={`absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap rounded-[8px] px-[10px] text-[12px] font-medium leading-[16px] transition-[opacity,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                            TONE[s.tone].bar
                          } ${s.open && !now ? "[mask-image:linear-gradient(to_right,black_75%,transparent)]" : ""} ${
                            on ? "opacity-100" : "opacity-30"
                          } ${focus ? "-translate-y-[2px] shadow-[0_6px_16px_rgba(50,7,62,0.18)]" : ""}`}
                          style={span(s.start, end(s))}
                        >
                          {s.label}
                        </span>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>

            {/* The tracking area sits over the bars (not the labels) and draws the rules */}
            <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${lane}`}>
              <span />
              <div
                ref={area}
                onPointerMove={(e) => setHover(at(e.clientX, e.clientY))}
                onPointerLeave={() => setHover(null)}
                onClick={(e) => {
                  const v = at(e.clientX, e.clientY);
                  if (v) setPinned(same(v, pinned) ? home : v);
                }}
                className={`pointer-events-auto relative h-full ${view.kind === "seg" ? "cursor-pointer" : "cursor-crosshair"}`}
              >
                {milestone && (
                  <span className="absolute -inset-y-[8px] border-l-2 border-dashed border-grape/50" style={{ left: pos(milestone.at) }} />
                )}
                {now && (
                  <span className="absolute -inset-y-[8px] w-0 border-l-2 border-primary" style={{ left: pos(now.at) }}>
                    <span className="absolute -top-[56px] left-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-[8px] py-[2px] text-[12px] font-medium leading-[16px] text-white">
                      Now
                    </span>
                  </span>
                )}
                {t !== null && (
                  <span
                    className="absolute -inset-y-[8px] w-0 border-l-2 border-grape transition-[left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    style={{ left: pos(t) }}
                  >
                    <span className="absolute -top-[56px] left-0 z-[1] -translate-x-1/2 whitespace-nowrap rounded-full bg-grape px-[8px] py-[2px] text-[12px] font-medium leading-[16px] text-white">
                      {steps[(view as { i: number }).i].name}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Under the chart: what the current view shows, then the jumps and the key */}
        <div aria-live="polite" className="mt-[20px] flex flex-col gap-[16px]">
          <div className="flex items-center justify-between gap-[16px]">
            <p className="m-0 text-[16px] font-medium leading-[24px] text-heading">
              {view.kind === "step" ? steps[view.i].name : `${view.lane}`}
              {!hover && !same(pinned, home) && <span className="ml-[8px] text-[12px] font-medium text-muted">Kept · click again to reset</span>}
            </p>
            <div className="flex items-center gap-[8px]" role="group" aria-label="Jump to">
              {jumps.map(({ name, view: v }) => {
                const on = same(v, pinned) && !hover;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setPinned(v)}
                    aria-pressed={on}
                    className={`rounded-full px-[12px] py-[4px] text-[12px] font-medium leading-[16px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape ${
                      on ? "bg-primary text-white" : "bg-white text-heading ring-1 ring-line-soft hover:ring-grape/40"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="m-0 grid list-none grid-cols-2 gap-[12px] p-0">
            {cards.map(({ lane: l, on, label, detail, tone, ...s }) => (
              <li
                key={l}
                className={`flex flex-col gap-[8px] rounded-[12px] bg-white p-[16px] transition-[opacity,box-shadow] duration-200 motion-reduce:transition-none ${
                  on ? "opacity-100 shadow-[0_4px_14px_rgba(50,7,62,0.08)] ring-1 ring-grape/30" : "opacity-50 ring-1 ring-line-soft"
                }`}
              >
                <span className="flex items-center gap-[8px] text-[12px] font-medium uppercase leading-[16px] text-muted">
                  <span aria-hidden="true" className={`size-[10px] shrink-0 rounded-[3px] ${TONE[tone].dot}`} />
                  {l}
                </span>
                <span className="flex items-baseline justify-between gap-[12px]">
                  <span key={label} className="cs-fade text-[16px] font-medium leading-[24px] text-heading">{label}</span>
                  <span className="whitespace-nowrap text-[12px] font-medium leading-[16px] text-grape">
                    {when({ label, detail, tone, ...s })}
                  </span>
                </span>
                <span key={detail} className="cs-fade text-[14px] leading-[22px] text-secondary">{detail}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-x-[24px] gap-y-[8px] border-t border-line-soft pt-[12px] text-[14px] leading-[22px] text-secondary">
            {milestone && (
              <span className="inline-flex items-center gap-[8px]">
                <span aria-hidden="true" className="inline-block h-[14px] border-l-2 border-dashed border-grape/50" />
                {milestone.label}
              </span>
            )}
            {now && (
              <span className="inline-flex items-center gap-[8px]">
                <span aria-hidden="true" className="inline-block h-[14px] border-l-2 border-primary" />
                {now.label}
              </span>
            )}
          </div>
        </div>
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
                  {steps[Math.floor(s.start * 2)]?.name} to {s.open ? (now ? now.label : "today") : steps[Math.ceil(s.end * 2) - 1]?.name}
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
