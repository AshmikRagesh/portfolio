/**
 * A dark Blackcurrant band: the command and a serif statement on the left, the skills in a
 * two-column list on the right — each a serif name over a short line, with a hairline above.
 * From lg the band splits 2:3; below that the statement sits on top and the list follows in
 * one column (two from md). All text is white on Blackcurrant.
 */
export default function SkillBand({
  command,
  title,
  note,
  skills,
}: {
  command: string;
  title: string;
  note?: string;
  skills: { title: string; description: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-[32px] rounded-[16px] bg-primary p-[28px] text-white md:p-[40px] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-[48px] lg:p-[48px]">
      <div className="flex flex-col gap-[12px]">
        <span className="font-brand text-[12px] uppercase leading-[16px] text-grape-light">{command}</span>
        <h3 className="m-0 font-heading text-[28px] font-normal leading-[34px] tracking-[-1px] text-white md:text-[32px] md:leading-[40px]">
          {title}
        </h3>
        {note && <p className="m-0 font-body text-[16px] leading-[26px] text-white/80">{note}</p>}
      </div>
      <ul className="m-0 grid list-none grid-cols-1 gap-x-[32px] gap-y-[24px] p-0 md:grid-cols-2">
        {skills.map(({ title: name, description }) => (
          <li key={name} className="flex flex-col gap-[4px] border-t border-white/20 pt-[16px]">
            <span className="font-heading text-[20px] leading-[28px] tracking-[0px] text-white">{name}</span>
            <span className="font-body text-[16px] leading-[26px] text-white/80">{description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
