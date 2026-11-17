import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

/**
 * "Someone tries" cards: the top half is a real attempt to fake or flood the numbers, in a
 * quiet grey band; an arrow leads to the bottom half, what the site does about it, with a
 * bold grape result and one plain line on how. Two columns from tablet up.
 */
/** `who` replaces the "Someone tries" label, e.g. for the site owner's own visits */
type Attempt = { attempt: string; result: string; how: string; who?: string };

export default function AttemptCards({ items }: { items: Attempt[] }) {
  return (
    <ul className="cs-stagger m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2 md:gap-[24px]">
      {items.map(({ attempt, result, how, who = "Someone tries" }) => (
        <li key={attempt} className="flex flex-col overflow-hidden rounded-lg border border-line-soft bg-white">
          <div className="flex flex-col gap-[8px] bg-surface px-[20px] pb-[20px] pt-[16px]">
            <span className="font-geist text-[10px] font-medium uppercase leading-[12px] tracking-[0.6px] text-heading">{who}</span>
            <p className="m-0 font-body text-[18px] leading-[30px] text-secondary">{attempt}</p>
          </div>
          <div className="relative flex flex-col gap-[4px] border-t border-line-soft px-[20px] pb-[20px] pt-[24px]">
            <span aria-hidden="true" className="absolute left-[20px] top-0 flex size-[24px] -translate-y-1/2 items-center justify-center rounded-full bg-grape text-white">
              <ArrowDown size={12} weight="bold" />
            </span>
            <h4 className="font-heading text-[24px] leading-[30px] tracking-[0px] text-grape">{result}</h4>
            <p className="m-0 font-body text-[18px] leading-[30px] text-muted">{how}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
