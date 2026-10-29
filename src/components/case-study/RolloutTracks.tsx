/**
 * A rollout as a small roadmap: one lane per track on a shared month axis, like a product
 * roadmap. From md each lane is a 168px label column beside its bar; below that the label
 * sits over the bar. Bars carry their own short label: `solid` is the Blackcurrant base
 * layer, `soft` a lilac bar for work fitted in when there was time, `open` a grape bar that
 * runs off the edge, and `tickets` a hairline with numbered stops (named in the key below,
 * so nothing collides on a phone). A `milestone` draws one grape rule down every lane.
 * Positions are in month units: 0 is the start of the first month, 1 of the second.
 */
type Track = {
  title: string;
  kind: "solid" | "soft" | "open" | "tickets";
  start: number;
  end: number;
  bar?: string;
  stops?: { at: number; label: string }[];
};

const BAR = {
  solid: "bg-primary text-white",
  soft: "bg-grape-light text-primary ring-1 ring-inset ring-grape/25",
  open: "bg-gradient-to-r from-grape from-60% to-grape/0 text-white",
} as const;

export default function RolloutTracks({
  months,
  tracks,
  milestone,
}: {
  months: string[];
  tracks: Track[];
  milestone?: { at: number; label: string };
}) {
  const pos = (m: number) => `${(m / months.length) * 100}%`;
  const span = (a: number, b: number) => ({ left: pos(a), width: `calc(${pos(b)} - ${pos(a)})` });
  const stops = tracks.flatMap((t) => t.stops ?? []);
  const cols = { gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` };
  const lane = "md:grid md:grid-cols-[168px_minmax(0,1fr)] md:items-center md:gap-[16px]";

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="relative">
        {/* Month axis */}
        <div className={`${lane} mb-[8px]`}>
          <span className="hidden md:block" />
          <div className="relative">
            <div className="grid rounded-full bg-grape-light/50 px-[4px] py-[6px]" style={cols}>
              {months.map((m) => (
                <span key={m} className="text-center font-brand text-[12px] uppercase leading-[16px] text-primary">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone rule down every lane, drawn first so the bars sit over it */}
        {milestone && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:grid md:grid-cols-[168px_minmax(0,1fr)] md:gap-[16px]">
            <span />
            <div className="relative h-full">
              <span className="absolute inset-y-[32px] w-0 border-l-2 border-dashed border-grape/60" style={{ left: pos(milestone.at) }} />
            </div>
          </div>
        )}
        <ol className="m-0 flex list-none flex-col p-0">
          {tracks.map(({ title, kind, start, end, bar, stops: marks }) => (
            <li key={title} className={`flex flex-col gap-[8px] border-t border-line-soft py-[16px] first:border-t-0 ${lane}`}>
              <span className="font-body text-[14px] font-medium leading-[20px] text-heading">{title}</span>
              <div className="relative h-[32px]">
                {/* Faint month rules behind every bar */}
                <div aria-hidden="true" className="absolute inset-0 grid" style={cols}>
                  {months.map((m, i) => (
                    <span key={m} className={i ? "border-l border-line-soft" : ""} />
                  ))}
                </div>
                {kind === "tickets" ? (
                  <>
                    <span className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-grape/30" style={span(start, end)} />
                    {marks?.map(({ at, label }) => (
                      <span
                        key={label}
                        className="absolute top-1/2 flex size-[24px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-grape font-brand text-[12px] leading-none text-white ring-4 ring-white"
                        style={{ left: pos(at) }}
                      >
                        {stops.findIndex((s) => s.label === label) + 1}
                        <span className="sr-only">: {label}</span>
                      </span>
                    ))}
                  </>
                ) : (
                  <span
                    className={`absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap rounded-full px-[12px] font-brand text-[12px] uppercase leading-[16px] ${BAR[kind]}`}
                    style={span(start, end)}
                  >
                    {/* Too narrow to read on a phone, where the lane title says it */}
                    <span className="hidden md:inline">{bar}</span>
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>

      </div>

      {(stops.length > 0 || milestone) && (
        <div className="flex flex-col gap-[12px] border-t border-line-soft pt-[16px]">
          {stops.length > 0 && (
            <ol className="m-0 grid list-none grid-cols-1 gap-[8px] p-0 md:grid-cols-3 md:gap-[16px]">
              {stops.map(({ label }, i) => (
                <li key={label} className="flex items-start gap-[8px] font-body text-[14px] leading-[22px] text-secondary">
                  <span className="mt-[1px] flex size-[20px] shrink-0 items-center justify-center rounded-full bg-grape font-brand text-[12px] leading-none text-white">
                    {i + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          )}
          {milestone && (
            <p className="m-0 flex items-center gap-[8px] font-body text-[14px] leading-[22px] text-secondary">
              <span aria-hidden="true" className="h-[16px] w-0 border-l-2 border-dashed border-grape/60" />
              {milestone.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
