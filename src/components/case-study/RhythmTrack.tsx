import { Tag } from "@/components/Tag";

/**
 * Things that happen on a schedule, as cards along one time track, fastest first. A grape
 * line runs behind a marker on each card's top edge (across on tablet up, down the left on
 * phones, stopping at the last marker); each card has its icon, the "when" in the shared Geist tag, and one plain line.
 */
type Beat = { icon: React.ReactNode; when: string; text: string };

export default function RhythmTrack({ items }: { items: Beat[] }) {
  return (
    <div className="relative">
      {/* From tablet up, one track across from the first marker to the last (four columns, 24px gaps) */}
      <span aria-hidden="true" className="absolute left-[28px] right-[calc((100%_-_72px)/4_-_28px)] top-[27px] hidden h-[2px] rounded-full bg-grape-light md:block" />
      <ol className="cs-stagger relative m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-4 md:gap-[24px]">
        {items.map(({ icon, when, text }, i) => (
          <li key={when} className="relative grid grid-cols-[56px_1fr] items-start gap-[12px] md:flex md:flex-col md:gap-[16px]">
            {/* On phones, a segment down from this marker to the next one */}
            {i < items.length - 1 && (
              <span aria-hidden="true" className="absolute bottom-[-16px] left-[27px] top-[56px] w-[2px] bg-grape-light md:hidden" />
            )}
            <span className="relative flex size-[56px] items-center justify-center rounded-full border border-line-soft bg-white text-grape shadow-[0_1px_2px_rgba(30,5,37,0.08)]">
              {icon}
            </span>
            <div className="flex flex-1 flex-col gap-[12px] rounded-lg border border-line-soft bg-white p-[20px] md:w-full">
              <span><Tag tone="grape" face="geist">{when}</Tag></span>
              <p className="m-0 font-body text-[18px] leading-[30px] text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
