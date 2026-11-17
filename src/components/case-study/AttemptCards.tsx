/**
 * "Someone tries" cards, white and compact, text only. On top, the setup: a quiet
 * sentence-case label and the attempt itself in the heading colour. Right under it, the card's headline: what the site does, in grape,
 * then one muted line on how. No divider and no fixed heights, so the two halves sit close.
 * A hairline border and a very soft shadow lift the card off the page. Three across from
 * desktop, two on tablet, one on phones. Every font is a sans or the heading serif.
 */
/** `who` replaces the "Someone tries" label, e.g. for the site owner's own visits */
type Attempt = { attempt: string; result: string; how: string; who?: string };

export default function AttemptCards({ items }: { items: Attempt[] }) {
  return (
    <ul className="cs-stagger m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ attempt, result, how, who = "Someone tries" }) => (
        <li
          key={attempt}
          className="flex flex-col rounded-xl border border-line-soft bg-white p-[24px] shadow-[0_1px_2px_rgba(30,5,37,0.04),0_8px_24px_-16px_rgba(30,5,37,0.12)]"
        >
          <span className="font-body text-caption text-muted">{who}</span>
          <p className="m-0 font-body text-body font-medium text-heading md:text-body-md">{attempt}</p>
          <h4 className="mt-[20px] font-heading text-h4 text-grape md:text-h4-md">{result}</h4>
          <p className="m-0 mt-[4px] font-body text-body text-muted">{how}</p>
        </li>
      ))}
    </ul>
  );
}
