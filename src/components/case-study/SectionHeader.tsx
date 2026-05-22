import { H2_CLASS, LEAD_CLASS } from "./constants";

/**
 * Standard case study section header.
 *
 * Renders:
 *   < tag >          ← rotated handwriting label
 *   Heading          ← H2
 *   Lead paragraph   ← optional; omit for sections that need custom content below
 *
 * Usage:
 *   <SectionHeader
 *     tag="Process"
 *     heading="Designing at v0 speed, then earning Figma fidelity"
 *     lead="With five insights synthesised..."
 *   />
 */
export default function SectionHeader({
  tag,
  heading,
  lead,
}: {
  tag: string;
  heading: string;
  lead?: string;
}) {
  return (
    <div className="flex flex-col gap-5 md:gap-[24px]">
      <div className="flex flex-col gap-3">
        <div className="-rotate-3 w-fit">
          <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
            {`< ${tag} >`}
          </span>
        </div>
        <h2 className={H2_CLASS}>{heading}</h2>
      </div>
      {lead && <p className={LEAD_CLASS}>{lead}</p>}
    </div>
  );
}
