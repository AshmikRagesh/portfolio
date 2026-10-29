import { ArrowDown, ArrowRight, ArrowUUpLeft } from "@phosphor-icons/react/dist/ssr";

type Stage = { who: string; does: string };

/**
 * How a change gets into a design system: three stages as cards on a grape-light panel,
 * joined by labelled arrows, with a dashed return path from the second stage back to the
 * first ("changes asked"). The last stage is the dark primary card. A band underneath
 * names what every stage runs on. From lg the stages sit in a row; below that they stack,
 * and the return path becomes a line inside the second card.
 */
export default function ReviewLoop({
  stages,
  links,
  back,
  base,
}: {
  stages: [Stage, Stage, Stage];
  links: [string, string];
  back: string;
  base: { name: string; text: string };
}) {
  return (
    <div className="rounded-[24px] bg-grape-light p-[16px] md:p-[32px]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_88px_1fr_88px_1fr]">
        {stages.map((stage, i) => {
          const last = i === stages.length - 1;
          return (
            <div key={stage.who} className="contents">
              <div
                className={`flex flex-col gap-[12px] rounded-[16px] p-[24px] ${
                  last ? "bg-primary" : "bg-white"
                }`}
              >
                <h4
                  className={`m-0 font-heading text-[24px] font-normal leading-[28px] ${
                    last ? "text-white" : "text-heading"
                  }`}
                >
                  {stage.who}
                </h4>
                <p
                  className={`m-0 font-body text-[16px] leading-[26px] ${
                    last ? "text-white/80" : "text-secondary"
                  }`}
                >
                  {stage.does}
                </p>
                {i === 1 && (
                  <p className="m-0 flex items-center gap-[8px] font-body text-[14px] leading-[20px] text-grape lg:hidden">
                    <ArrowUUpLeft size={16} aria-hidden="true" />
                    {back}
                  </p>
                )}
              </div>
              {!last && (
                <div className="flex items-center justify-center gap-[8px] py-[12px] text-grape lg:flex-col lg:py-0">
                  <span className="font-body text-[14px] leading-[20px]">{links[i]}</span>
                  <ArrowRight size={20} aria-hidden="true" className="hidden lg:block" />
                  <ArrowDown size={20} aria-hidden="true" className="lg:hidden" />
                </div>
              )}
            </div>
          );
        })}

        {/* The return path: from the middle of the second card back to the middle of the first */}
        <div className="relative col-span-3 hidden grid-cols-[1fr_88px_1fr] lg:grid" aria-hidden="true">
          <div className="ml-auto h-[24px] w-1/2 rounded-bl-[12px] border-b border-l border-dashed border-grape/60" />
          <div className="h-[24px] border-b border-dashed border-grape/60" />
          <div className="h-[24px] w-1/2 rounded-br-[12px] border-b border-r border-dashed border-grape/60" />
          <p className="col-span-3 m-0 mt-[8px] flex items-center justify-center gap-[8px] font-body text-[14px] leading-[20px] text-grape">
            <ArrowUUpLeft size={16} />
            {back}
          </p>
        </div>
      </div>

      <div className="mt-[16px] flex flex-col gap-[4px] rounded-[16px] border border-grape/20 bg-white/60 p-[20px] md:mt-[24px] md:flex-row md:items-baseline md:gap-[16px]">
        <span className="font-heading text-[20px] leading-[28px] text-heading">{base.name}</span>
        <span className="font-body text-[16px] leading-[26px] text-secondary">{base.text}</span>
      </div>
    </div>
  );
}
