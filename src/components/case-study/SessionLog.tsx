/**
 * An excerpt from a Claude Code session, set like the terminal it happened in: what I
 * typed (after a ">" prompt, in white) and what Claude Code did in reply (after a "⏺",
 * dimmer), on midnight. `when` heads the window (the session's date and time). My lines
 * are quoted from the session; Claude's are a plain summary of what it made, never
 * invented dialogue. Sits in the reading column, like a pull quote.
 */
type Line = { from: "me" | "claude"; text: string };

export default function SessionLog({ when, lines }: { when: string; lines: Line[] }) {
  return (
    <figure className="my-[32px] overflow-hidden rounded-lg bg-midnight shadow-[0_2px_8px_rgba(30,5,37,0.12)] md:my-[40px]">
      <figcaption className="flex h-[40px] items-center gap-[8px] border-b border-white/10 px-[16px]">
        <span aria-hidden="true" className="flex gap-[6px]">
          {[0, 1, 2].map((d) => (
            <span key={d} className="h-[10px] w-[10px] rounded-full bg-white/20" />
          ))}
        </span>
        <span className="ml-[8px] font-brand text-caption uppercase text-white/60">
          Claude Code <span className="text-white/40">·</span> {when}
        </span>
      </figcaption>
      <ol className="m-0 flex list-none flex-col gap-[16px] p-[20px] md:p-[24px]">
        {lines.map(({ from, text }, i) => (
          <li key={i} className="grid grid-cols-[20px_1fr] gap-[4px]">
            <span aria-hidden="true" className={`font-brand text-body-md ${from === "me" ? "text-pink" : "text-grape-light/70"}`}>
              {from === "me" ? ">" : "⏺"}
            </span>
            <p className={`m-0 font-geist text-body-md ${from === "me" ? "text-white" : "text-white/70"}`}>
              <span className="sr-only">{from === "me" ? "I asked: " : "Claude Code: "}</span>
              {text}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  );
}
