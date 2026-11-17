import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

/**
 * "Someone tries" cards, kept small and plain: a white card with a hairline border. On top,
 * a muted caps label and the attempt in the heading colour; a hairline; then what the site
 * does as the card's headline in grape, led by a small arrow, and one quiet line on how.
 * Three across from desktop, two on tablet, one on phones.
 */
/** `who` replaces the "Someone tries" label, e.g. for the site owner's own visits */
type Attempt = { attempt: string; result: string; how: string; who?: string };

export default function AttemptCards({ items }: { items: Attempt[] }) {
  return (
    <ul className="cs-stagger m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ attempt, result, how, who = "Someone tries" }) => (
        <li key={attempt} className="flex flex-col rounded-lg border border-line-soft bg-white p-[20px]">
          <span className="font-geist text-[10px] font-medium uppercase leading-[12px] tracking-[0.6px] text-muted">{who}</span>
          <p className="m-0 mt-[8px] font-body text-body font-medium text-heading md:min-h-[52px] md:text-body-md">{attempt}</p>
          <div className="mt-[16px] flex flex-1 flex-col border-t border-line-soft pt-[16px]">
            <h4 className="flex items-center gap-[8px] font-heading text-h4 text-grape md:text-h4-md">
              <ArrowDown size={14} weight="bold" aria-hidden="true" className="shrink-0" />
              {result}
            </h4>
            <p className="m-0 mt-[4px] font-body text-body text-muted">{how}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
