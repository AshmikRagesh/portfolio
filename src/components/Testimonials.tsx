// ── Testimonials ──────────────────────────────────────────────────────────────
// "The guestbook": dark panel of cream "notepad" cards (two columns, three from 1280px) — grained
// paper lit from the top left, ruled lines under each line of the quote,
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

// Amlan's quote is the recommendation as written, with the pronouns corrected to he/him; Sneha's is lightly edited.
// TODO: Anish's is a draft; confirm it with Anish before publishing. The signature strokes are drawn to read as each name,
// scribbles, not their real signatures.
const testimonials: Testimonial[] = [
  {
    quote:
      "His ability to take full ownership, navigate tough situations, and apply his solid design-system expertise makes him stand out. He leads with clarity, confidence, and accountability.",
    name: "Amlan Mukherjee",
    role: "Ex-Design Manager, Travelopia",
    signature: [
      "M10 56C16 42 22 26 30 12C31 24 33 40 36 54C30 44 22 40 16 42C24 40 34 42 42 46C44 42 46 40 48 42C49 46 48 52 48 54C50 46 53 41 56 42C58 44 57 50 58 54C62 44 68 28 70 18C71 14 67 14 66 22C65 32 66 46 70 54C72 50 72 46 76 44C80 43 81 50 78 53C76 55 73 52 76 48C78 46 80 50 82 54C84 48 86 44 89 44C92 44 91 50 94 54",
      "M104 54C106 40 108 26 110 14C113 26 116 36 118 42C122 32 126 22 130 14C130 28 130 42 132 54C134 48 135 44 137 46C138 50 139 54 142 52C144 50 145 46 146 44C146 48 147 52 150 54C154 46 156 34 158 24",
      "M12 64C50 60 100 60 160 50",
    ],
  },
  {
    quote:
      "I've collaborated with Ashmik on multiple projects, and every time the designs went further than I'd asked for. Working together has been a genuine pleasure.",
    name: "Sneha",
    role: "Senior Visual Designer, Meesho",
    signature: [
      "M40 16C36 11 26 11 21 17C16 25 30 30 34 36C38 44 31 54 21 54C15 54 12 50 14 46",
      "M36 54C38 48 40 44 43 45C46 46 45 52 47 54C50 52 56 48 56 44C56 41 51 41 50 46C49 52 54 55 60 52C64 44 68 30 70 18C70 14 66 15 66 22C66 32 66 46 67 54C69 48 72 44 75 45C78 46 77 52 80 54C82 50 84 46 88 45C92 44 92 52 89 54C86 55 84 51 88 48C90 47 92 51 96 54C112 50 132 44 154 34",
    ],
  },
  {
    quote:
      "Ashmik turns a rough brief into a flow the team can actually build. On our booking and insurance work, every design decision came with a reason, and engineering always knew exactly what to ship.",
    name: "Anish",
    role: "Product Manager, Enchanting Travels",
    signature: [
      "M10 56C16 42 22 26 30 12C31 24 33 40 36 54C30 44 22 40 16 42C24 40 34 42 42 46C44 42 46 40 48 42C50 45 49 52 50 54C52 50 54 46 56 45C56 49 56 52 59 54C61 52 63 49 65 46C69 48 69 52 65 54C63 55 61 54 62 52C66 54 70 50 72 42C74 32 76 24 78 18C78 14 74 15 74 22C74 32 74 46 75 54C77 48 80 44 83 45C86 46 85 52 88 54C100 52 116 46 130 40",
      "M56 36l1.2 0.6",
      "M12 64C50 60 100 60 158 50",
    ],
  },
];

// Cards tilt alternately, like loose pages
const TILTS = ["-rotate-[0.35deg]", "rotate-[0.4deg]", "rotate-[0.3deg]", "-rotate-[0.4deg]"];

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
                  className="gb-sheet min-w-0 md:last:odd:col-span-2 md:last:odd:mx-auto md:last:odd:w-[calc(50%_-_12px)] xl:last:odd:col-span-1 xl:last:odd:w-auto">
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
