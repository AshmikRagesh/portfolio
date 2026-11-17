/**
 * Picture cards for the parts of one screen: each card shows a crop of that part on a soft
 * grape stage, then a short title and one plain line. Every stage is the same height and
 * the crop sits whole inside it (never stretched), so wide and tall crops share one size.
 * Five cards sit as two (the wide crops) over three from tablet up; one column on phones.
 */
type Panel = { src: string; alt: string; title: string; text: string };

const LAYOUT: Record<number, string> = {
  // Wide crops first: two across on top, then three
  5: "md:grid-cols-6 md:[&>*:nth-child(-n+2)]:col-span-3 md:[&>*:nth-child(n+3)]:col-span-2",
  4: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export default function PanelCards({ items }: { items: Panel[] }) {
  return (
    <ul className={`cs-stagger m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:gap-[24px] ${LAYOUT[items.length] ?? "md:grid-cols-2"}`}>
      {items.map(({ src, alt, title, text }) => (
        <li key={title} className="flex flex-col rounded-lg border border-line-soft bg-white p-[12px]">
          <div className="flex h-[224px] items-center justify-center overflow-hidden rounded-md bg-grape-light/30 p-[16px]">
            <img
              src={src}
              alt={alt}
              loading="lazy"
              draggable={false}
              className="max-h-full max-w-full rounded-sm object-contain shadow-[0_1px_2px_rgba(30,5,37,0.08)]"
            />
          </div>
          <div className="flex flex-col gap-[4px] px-[8px] pb-[8px] pt-[16px]">
            <h4 className="font-heading text-[24px] leading-[30px] tracking-[0px] text-heading">{title}</h4>
            <p className="m-0 font-body text-[18px] leading-[30px] text-muted">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
