import { Tag } from "@/components/Tag";

/**
 * One drawing from an exploration round: the still on a soft grape stage, its name below,
 * inside one white card. Every card is the same size whatever the drawing, so a row of
 * them lines up. `kept` outlines the card in grape and tags it.
 */
export default function ExplorationCard({ name, src, kept }: { name: string; src: string; kept?: boolean }) {
  return (
    <li
      className={`relative flex flex-col rounded-lg border bg-white p-[12px] ${
        kept ? "border-grape shadow-[0_0_0_1px_theme(colors.grape)]" : "border-line-soft"
      }`}
    >
      <div className="flex h-[136px] items-center justify-center rounded-md bg-grape-light/30 p-[16px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="max-h-full max-w-full object-contain" />
      </div>
      <p className="mt-[12px] px-[8px] pb-[4px] font-body text-[16px] font-medium leading-[24px] text-heading">{name}</p>
      {kept && (
        <span className="absolute right-[20px] top-[20px]">
          <Tag face="geist" tone="grape">Kept</Tag>
        </span>
      )}
    </li>
  );
}
