import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { Tag } from "@/components/Tag";

/**
 * Two finalists side by side, so the choice reads at a glance: each card shows the drawing,
 * its name (the winner tagged and outlined in grape), then the same questions in the same
 * order, each answered yes (green tick) or no (warning cross) with one plain line why.
 * One column on phones, two from tablet up.
 */
type Answer = { yes: boolean; text: string };
type Finalist = { name: string; src: string; picked?: boolean; answers: Answer[] };

export default function BellComparison({ questions, finalists }: { questions: string[]; finalists: Finalist[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2 md:gap-[24px]">
      {finalists.map(({ name, src, picked, answers }) => (
        <li
          key={name}
          className={`flex flex-col rounded-lg border bg-white p-[12px] ${
            picked ? "border-grape shadow-[0_0_0_1px_theme(colors.grape)]" : "border-line-soft"
          }`}
        >
          <div className="relative flex h-[136px] items-center justify-center rounded-md bg-grape-light/30 p-[16px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={name} className="max-h-full max-w-full object-contain" />
            <span className="absolute right-[8px] top-[8px]">
              <Tag face="geist" tone={picked ? "grape" : "grey"}>{picked ? "Picked" : "Not picked"}</Tag>
            </span>
          </div>
          <p className="mt-[12px] px-[8px] font-body text-[16px] font-medium leading-[24px] text-heading">{name}</p>
          <dl className="m-0 mt-[8px] flex flex-col px-[8px]">
            {questions.map((q, i) => {
              const { yes, text } = answers[i];
              const Icon = yes ? CheckCircle : XCircle;
              return (
                <div key={q} className="grid grid-cols-[20px_1fr] gap-x-[12px] border-t border-line-soft py-[12px]">
                  <Icon size={20} weight="fill" className={`mt-[2px] ${yes ? "text-success" : "text-warning"}`} aria-hidden="true" />
                  <dt className="font-body text-[14px] font-medium leading-[22px] text-heading">
                    {q}
                    <span className="sr-only">: {yes ? "yes" : "no"}</span>
                  </dt>
                  <dd className="col-start-2 m-0 font-body text-[14px] leading-[22px] text-secondary">{text}</dd>
                </div>
              );
            })}
          </dl>
        </li>
      ))}
    </ul>
  );
}
