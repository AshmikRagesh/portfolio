import { Tag } from "@/components/Tag";

/**
 * One drawing from an exploration round, on the case study card (Template A): its name on
 * top, then the still (`src`) or a live drawing (`children`) on a soft grape stage in the
 * card's 4px frame. Every card is the same size whatever the drawing, so a row lines up.
 * `kept` gives it the chosen outline and a tag beside the name ("Kept", or `tag`).
 */
export default function ExplorationCard({
  name,
  src,
  kept,
  tag = "Kept",
  children,
}: {
  name: string;
  src?: string;
  kept?: boolean;
  tag?: string;
  children?: React.ReactNode;
}) {
  return (
    <li className={`cs-pair-card flex flex-col rounded-md p-[8px] ${kept ? "cs-pair-card--chosen" : ""}`}>
      <div className="flex min-h-[40px] items-center justify-between gap-[8px] px-[12px] pb-[12px] pt-[8px]">
        <p className="m-0 font-body text-body font-medium text-heading">{name}</p>
        {kept && <Tag face="geist" tone="grape">{tag}</Tag>}
      </div>
      <div className="cs-pair-media mt-auto flex h-[136px] items-center justify-center rounded-sm bg-grape-light/30 p-[16px]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="max-h-full max-w-full object-contain" />
        ) : (
          children
        )}
      </div>
    </li>
  );
}
