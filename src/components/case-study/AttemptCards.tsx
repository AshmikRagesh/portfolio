import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

/**
 * "Someone tries" cards. Two halves with a clear order of reading:
 *   top     the attempt: a small grape caps label, then the attempt itself in the heading
 *           colour, on a soft grape band so it reads as the setup
 *   bottom  what the site does: the result as the card's headline in grape, then one quiet
 *           line on how
 * A grape arrow chip sits on the seam, ringed in white so it cuts cleanly into both halves.
 * Every card in a row has the same height, with the seam at the same place. Two columns
 * from tablet up.
 */
/** `who` replaces the "Someone tries" label, e.g. for the site owner's own visits */
type Attempt = { attempt: string; result: string; how: string; who?: string };

export default function AttemptCards({ items }: { items: Attempt[] }) {
  return (
    <ul className="cs-stagger m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2 md:gap-[24px]">
      {items.map(({ attempt, result, how, who = "Someone tries" }) => (
        <li
          key={attempt}
          className="grid grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-line-soft bg-white shadow-[0_1px_2px_rgba(30,5,37,0.04)]"
        >
          <div className="flex min-h-[96px] flex-col gap-[8px] bg-grape-light/40 px-[24px] pb-[24px] pt-[20px]">
            <span className="font-geist text-[10px] font-medium uppercase leading-[12px] tracking-[0.6px] text-grape">{who}</span>
            <p className="m-0 font-body text-[18px] font-medium leading-[28px] text-heading">{attempt}</p>
          </div>
          <div className="relative flex flex-col gap-[8px] border-t border-grape-light px-[24px] pb-[24px] pt-[32px]">
            <span
              aria-hidden="true"
              className="absolute left-[24px] top-0 flex size-[28px] -translate-y-1/2 items-center justify-center rounded-full bg-grape text-white ring-4 ring-white"
            >
              <ArrowDown size={14} weight="bold" />
            </span>
            <h4 className="font-heading text-[24px] leading-[30px] tracking-[0px] text-grape">{result}</h4>
            <p className="m-0 font-body text-[16px] leading-[26px] text-muted">{how}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
