// Project tags for the Works cards — two per card: one Type, one Discipline.
// One shape for every tag (the Figma "Tags" component, scaled up: 24px tall, 8px side
// padding, Geist Mono 12/16 uppercase, 2px corners). Two colours only; both clear
// 4.5:1 at this size.
//
//   Type        grape fill (the button hover colour), white text   (7.7:1)
//   Discipline  light grey, dark grey text                         (8.6:1)

export type ProjectType = "Case study" | "Side project" | "Exploration" | "Taste note";
export type Discipline = "Design systems" | "Product design" | "Interaction design" | "UX research" | "AI";

const BASE =
  "inline-flex h-[24px] shrink-0 items-center whitespace-nowrap rounded-[2px] px-[8px] font-brand text-[12px] uppercase leading-[16px] tracking-[0px]";

export function TypeTag({ type }: { type: ProjectType }) {
  return <span className={`${BASE} bg-grape text-white`}>{type}</span>;
}

export function DisciplineTag({ discipline }: { discipline: Discipline }) {
  return <span className={`${BASE} bg-[#E5E7EB] text-[#374151]`}>{discipline}</span>;
}
