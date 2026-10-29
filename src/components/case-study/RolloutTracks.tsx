/**
 * A rollout as parallel tracks on one month axis: each track is a title and a line of
 * context over a bar spanning the months it ran. `solid` is the Blackcurrant base layer,
 * `soft` a lilac bar for work done when there was time, `open` a grape bar that runs on
 * past the axis, and `tickets` a thin line with numbered stops for real tickets (listed
 * under the panel, so labels never collide on a phone). Months are positions in month units:
 * 0 is the start of the first month, 1 the start of the second.
 */
type Track = {
  title: string;
  note: string;
  kind: "solid" | "soft" | "open" | "tickets";
  start: number;
  end: number;
  stops?: { at: number; label: string }[];
};

export default function RolloutTracks({ months, tracks }: { months: string[]; tracks: Track[] }) {
  const pos = (m: number) => `${(m / months.length) * 100}%`;
  const stops = tracks.flatMap((t) => t.stops ?? []);
  return (
    <div className="rounded-[16px] bg-white p-[20px] ring-1 ring-line-soft md:p-[40px]">
      <div className="relative">
        {/* Month columns: labels on top, faint rules down the whole panel */}
        <div className="grid border-b border-line-soft pb-[12px]" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
          {months.map((m) => (
            <span key={m} className="font-brand text-[12px] uppercase leading-[16px] text-muted">
              {m}
            </span>
          ))}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
          {months.map((m, i) => (
            <span key={m} className={i ? "border-l border-dashed border-line-soft" : ""} />
          ))}
        </div>

        <ol className="relative m-0 flex list-none flex-col p-0">
          {tracks.map(({ title, note, kind, start, end, stops: marks }) => (
            <li key={title} className="flex flex-col gap-[12px] border-b border-line-soft py-[20px] last:border-b-0 md:py-[24px]">
              <div className="flex flex-col gap-[4px] bg-white/80 pr-[8px] md:max-w-[70%]">
                <span className="font-heading text-[18px] leading-[26px] tracking-[0px] text-heading md:text-[20px] md:leading-[28px]">{title}</span>
                <span className="font-body text-[16px] leading-[26px] text-secondary">{note}</span>
              </div>
              <div className="relative h-[24px]">
                {kind === "tickets" ? (
                  <>
                    <span
                      className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-grape/40"
                      style={{ left: pos(start), width: `calc(${pos(end)} - ${pos(start)})` }}
                    />
                    {marks?.map(({ at, label }) => (
                      <span
                        key={label}
                        title={label}
                        className="absolute top-1/2 flex size-[24px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-grape font-brand text-[12px] leading-none text-white ring-4 ring-white"
                        style={{ left: pos(at) }}
                      >
                        {stops.findIndex((s) => s.label === label) + 1}
                      </span>
                    ))}
                  </>
                ) : (
                  <span
                    className={`absolute inset-y-0 rounded-full ${
                      kind === "solid"
                        ? "bg-primary"
                        : kind === "soft"
                          ? "bg-grape-light ring-1 ring-inset ring-grape/30"
                          : "bg-gradient-to-r from-grape from-70% to-grape/0"
                    }`}
                    style={{ left: pos(start), width: `calc(${pos(end)} - ${pos(start)})` }}
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {stops.length > 0 && (
        <ol className="m-0 mt-[8px] grid list-none grid-cols-1 gap-[12px] border-t border-line-soft p-0 pt-[20px] md:grid-cols-3 md:gap-[24px]">
          {stops.map(({ label }, i) => (
            <li key={label} className="flex items-start gap-[12px] font-body text-[16px] leading-[24px] text-secondary">
              <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full bg-grape font-brand text-[12px] leading-none text-white">
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
