/**
 * A set of skills on one dark Blackcurrant panel, drawn like the Claude Code session they run
 * in: the command on top, then one row per skill — its name in brand mono, what it does in
 * white body text. Rows sit name-beside-description from md (200px + the rest) and stack on
 * phones. No recordings needed; it reads as one object rather than a grid of cards.
 */
export default function SkillPanel({
  command,
  skills,
}: {
  command: string;
  skills: { title: string; description: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-[16px] bg-primary text-white shadow-[0_4px_18px_rgba(30,5,37,0.18)]">
      {/* Session bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-[20px] py-[12px] md:px-[32px]">
        <span className="flex gap-[8px]" aria-hidden="true">
          <span className="size-[10px] rounded-full bg-white/20" />
          <span className="size-[10px] rounded-full bg-white/20" />
          <span className="size-[10px] rounded-full bg-white/20" />
        </span>
        <span className="font-brand text-[12px] uppercase leading-[16px] text-white/60">Claude Code</span>
      </div>

      <div className="px-[20px] pb-[8px] pt-[28px] md:px-[32px] md:pt-[36px]">
        <p className="flex items-center gap-[12px] font-brand text-[20px] leading-[28px] md:text-[24px] md:leading-[32px]">
          <span aria-hidden="true" className="text-grape-light/60">
            &gt;
          </span>
          {command}
          <span aria-hidden="true" className="h-[24px] w-[2px] animate-pulse bg-grape-light motion-reduce:animate-none" />
        </p>

        <ul className="mt-[28px] md:mt-[32px]">
          {skills.map(({ title, description }) => (
            <li
              key={title}
              className="flex flex-col gap-[4px] border-t border-white/10 py-[20px] md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-[24px] md:py-[24px]"
            >
              <span className="font-brand text-[14px] uppercase leading-[24px] tracking-[0px] text-grape-light md:text-[16px] md:leading-[28px]">
                {title}
              </span>
              <span className="font-body text-[16px] leading-[26px] text-white/80 md:text-[18px] md:leading-[28px]">
                {description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
