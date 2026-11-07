// ── Testimonials ──────────────────────────────────────────────────────────────
// "The guestbook": dark panel of cream "notepad" cards (two columns, three from 1280px) — grained
// paper lit from the top left, on a second sheet, ruled lines under each line of the quote,
// a punched hole in the top-right corner, a slight tilt that straightens on hover,
// and the guest's signature in ink at the bottom right.
// Uses the shared page container (1240px at desktop). All values are multiples of 2/4px.

import Signature from "@/components/Signature";
import PaperTooth from "@/components/PaperTooth";
import PunchHole from "@/components/PunchHole";

interface Testimonial {
  quote: string;
  name: string;
  href?: string;
  role: string;
  signature: string[]; // SVG path strokes, drawn in a 168×72 box
}

// Amlan's quote is the recommendation as written; Sneha's is lightly edited.
// TODO: Anish's is a draft; confirm it with Anish before publishing. The signature strokes are drawn
// scribbles, not their real signatures.
const testimonials: Testimonial[] = [
  {
    quote:
      "Her ability to take full ownership, navigate tough situations, and apply her solid design-system expertise makes her stand out. She leads with clarity, confidence, and accountability.",
    name: "Amlan Mukherjee",
    role: "Ex-Design Manager, Travelopia",
    signature: [
      "M14 50C12 34 16 18 24 12c8-6 16 0 12 10-3 8-14 10-18 8 8 6 14 16 22 22",
      "M40 52c4-12 10-14 12-8s-4 8-2 0 8-10 10-2c1 6 2 8 4 2s6-14 8-22c-2 12-2 22 0 28 2-8 8-12 10-4 1 4 2 4 4-2",
      "M92 50c2-12 4-22 6-28 2 10 4 18 6 22 2-8 6-18 8-24 0 12 0 22 2 30 4-8 8-10 10-6s-4 6-2 0 8-8 12-2c4-12 6-22 8-28-2 14-2 26 0 34 4-8 8-6 10-2",
      "M10 62c40-6 90-4 150-12",
    ],
  },
  {
    quote:
      "I've collaborated with Ashmik on multiple projects, and every time the designs went further than I'd asked for. Working together has been a genuine pleasure.",
    name: "Sneha",
    role: "Meesho",
    signature: [
      "M32 16c-8-6-20-2-16 8 4 8 18 8 16 18s-18 10-22 2",
      "M38 46c2-8 10-8 8 0s-6 6-4 0 6-4 8 2c2-6 6-10 10-8-4 4-4 10 0 8 4-6 8-8 8 0 0-8 4-26 6-32-2 16-2 28 0 34 2-8 8-10 8-2",
      "M102 14c-4 14-8 28-10 34 6-4 14-2 22 0 2-8 6-12 8-6 1 6 4 4 6-4",
      "M64 66c30-6 66-6 100-14",
    ],
  },
  {
    quote:
      "Ashmik turns a rough brief into a flow the team can actually build. On our booking and insurance work, every design decision came with a reason, and engineering always knew exactly what to ship.",
    name: "Anish",
    role: "Product Manager, Enchanting Travels",
    signature: [
      "M18 16c0 12-2 26-4 36M14 18c16-6 30 4 26 18s-18 18-28 14",
      "M44 46c2-8 8-8 8-2s-4 6-3 0 5-6 8 2c2-6 6-8 8-2 1 4 2 4 3 0 2-8 4-18 6-26-2 10-2 20 0 28",
      "M96 30c-8-2-12 8-8 14s12 4 12-4-6-12-4-10M110 46c2-10 4-22 6-30M112 36c4-2 8-2 10 2M120 46c2-6 6-8 8-4s-4 6-2 0 6-6 10 0",
      "M8 62c50-8 100-6 152-14",
    ],
  },
];

// Cards tilt alternately, like loose pages; the sheet underneath turns the other way
const TILTS = ["-rotate-[0.35deg]", "rotate-[0.4deg]", "rotate-[0.3deg]", "-rotate-[0.4deg]"];
const UNDER = ["0.8deg", "-0.7deg", "-0.8deg", "0.7deg"];

function ArrowUpRight({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="section-spacing bg-background">
      {/* A full-width band of blackcurrant with the footer's paper tooth; the content keeps
          the shared container and its inset */}
      <div className="relative w-full bg-primary py-10 text-white md:py-14 lg:py-20">
        <PaperTooth />
        <div className="page-container relative">
          <div className="px-6 md:px-8 lg:px-12">
            {/* Header */}
            <div className="mb-8 grid grid-cols-1 items-end gap-4 pb-5 shadow-[inset_0_-1px_0_rgba(255,255,255,0.22)] md:mb-10 md:grid-cols-[minmax(0,1fr)_320px] md:gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
              <h2
                id="testimonials-heading"
                className="m-0 text-balance font-heading text-[34px] font-normal leading-[36px] tracking-[-2px] text-white md:text-[44px] md:leading-[44px]"
              >
                The guestbook.
              </h2>
              <p className="m-0 text-pretty font-body text-[16px] leading-[26px] text-white/70">
                Kind words from the product managers, engineers and leads I&apos;ve built alongside.
              </p>
            </div>

            {/* Cards */}
            <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {testimonials.map((t, i) => (
                <li
                  key={i}
                  style={{ "--gb-under": UNDER[i % UNDER.length] } as React.CSSProperties} className="gb-sheet min-w-0 md:last:odd:col-span-2 md:last:odd:mx-auto md:last:odd:w-[calc(50%_-_12px)] xl:last:odd:col-span-1 xl:last:odd:w-auto">
                  <figure
                    className={`relative m-0 flex h-full flex-col rounded-[2px] gb-paper p-5 text-heading hover:!translate-y-[-6px] hover:!rotate-0 md:p-6 motion-reduce:!transform-none motion-reduce:transition-none ${
                      TILTS[i % TILTS.length]
                    }`}
                  >
                    {/* Number + punch hole — the hole is filled with the panel colour so the
                        dark section shows "through" the paper. */}
                    <div className="mb-5 flex items-center justify-between border-b border-line/60 pb-[10px] font-brand text-[10px] uppercase leading-[14px] tracking-[0px] text-muted">
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <PunchHole index={i} />
                    </div>

                    {/* Quote — written on the ruled part of the page: the rules run edge to edge
                        (negative margin out to the paper's edge), one rule per line */}
                    <blockquote className="gb-ruled relative -mx-5 m-0 flex-1 px-5 pb-[28px] font-heading text-[20px] font-normal not-italic leading-[28px] tracking-[0px] text-heading md:-mx-6 md:px-6 lg:text-[22px]">
                      <p className="relative m-0">{t.quote}</p>
                    </blockquote>

                    {/* Signature — its own element on the right, above the footer. The bottom
                        crosses the divider; multiply blend lets the paper's ruled lines show through. */}
                    <Signature
                      strokes={t.signature}
                      label={t.name}
                      className="relative z-[1] -mb-11 h-[68px] w-[160px] shrink-0 -rotate-[6deg] self-end mix-blend-multiply -mt-[20px] lg:-mb-12 lg:-mr-1 lg:h-[72px] lg:w-[168px]"
                    />

                    {/* Citation */}
                    <figcaption className="mt-6 border-t border-line/60 pt-[14px] font-body text-[12px] not-italic leading-[16px] text-secondary">
                      <div className="grid min-w-0 grid-cols-1">
                        {t.href ? (
                          <a
                            href={t.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-fit items-center gap-1 text-[14px] font-medium leading-[20px] text-heading underline underline-offset-2"
                          >
                            {t.name}
                            <ArrowUpRight size={12} />
                          </a>
                        ) : (
                          <span className="text-[14px] font-medium leading-[20px] text-heading">{t.name}</span>
                        )}
                        <span>{t.role}</span>
                      </div>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
