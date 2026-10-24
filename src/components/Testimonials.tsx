// ── Testimonials ──────────────────────────────────────────────────────────────
// "The guestbook": dark panel with two cream "notepad" cards — ruled lines every 24px,
// a punched hole in the top-right corner, a slight tilt that straightens on hover,
// and the guest's signature in ink at the bottom right.
// Uses the shared page container (1240px at desktop). All values are multiples of 2/4px.

import Signature from "@/components/Signature";
import PaperTooth from "@/components/PaperTooth";

interface Testimonial {
  quote: string;
  name: string;
  href?: string;
  role: string;
  signature: string[]; // SVG path strokes, drawn in a 168×72 box
}

// TODO: DUMMY CONTENT — fictional people and quotes. Replace with real excerpts
// from LinkedIn recommendations before publishing.
const testimonials: Testimonial[] = [
  {
    quote:
      "Ashmik turned a scattered set of components into a design system the whole team actually wanted to use. Every decision came with a reason, and every handoff came with documentation.",
    name: "Rohan Mehta",
    role: "Engineering Lead",
    signature: [
      "M14 50C12 34 16 18 24 12c8-6 16 0 12 10-3 8-14 10-18 8 8 6 14 16 22 22",
      "M40 52c4-12 10-14 12-8s-4 8-2 0 8-10 10-2c1 6 2 8 4 2s6-14 8-22c-2 12-2 22 0 28 2-8 8-12 10-4 1 4 2 4 4-2",
      "M92 50c2-12 4-22 6-28 2 10 4 18 6 22 2-8 6-18 8-24 0 12 0 22 2 30 4-8 8-10 10-6s-4 6-2 0 8-8 12-2c4-12 6-22 8-28-2 14-2 26 0 34 4-8 8-6 10-2",
      "M10 62c40-6 90-4 150-12",
    ],
  },
  {
    quote:
      "He has a knack for finding the real problem behind a request. The reservations redesign made a dense tool feel calm for our ops team.",
    name: "Sarah Lindqvist",
    role: "Product Manager",
    signature: [
      "M32 16c-8-6-20-2-16 8 4 8 18 8 16 18s-18 10-22 2",
      "M38 46c2-8 10-8 8 0s-6 6-4 0 6-4 8 2c2-6 6-10 10-8-4 4-4 10 0 8 4-6 8-8 8 0 0-8 4-26 6-32-2 16-2 28 0 34 2-8 8-10 8-2",
      "M102 14c-4 14-8 28-10 34 6-4 14-2 22 0 2-8 6-12 8-6 1 6 4 4 6-4",
      "M64 66c30-6 66-6 100-14",
    ],
  },
  {
    quote:
      "Ashmik makes complicated flows feel obvious. Insurance went from an afterthought at checkout to something guests actually chose.",
    name: "Daniel Okafor",
    role: "Head of Product",
    signature: [
      "M18 16c0 12-2 26-4 36M14 18c16-6 30 4 26 18s-18 18-28 14",
      "M44 46c2-8 8-8 8-2s-4 6-3 0 5-6 8 2c2-6 6-8 8-2 1 4 2 4 3 0 2-8 4-18 6-26-2 10-2 20 0 28",
      "M96 30c-8-2-12 8-8 14s12 4 12-4-6-12-4-10M110 46c2-10 4-22 6-30M112 36c4-2 8-2 10 2M120 46c2-6 6-8 8-4s-4 6-2 0 6-6 10 0",
      "M8 62c50-8 100-6 152-14",
    ],
  },
];

// Cards tilt alternately, like loose pages
const TILTS = ["-rotate-[0.35deg]", "rotate-[0.4deg]", "rotate-[0.3deg]", "-rotate-[0.4deg]"];

// A hand-punched hole: slightly wobbly edge, shadow inside the top lip, light rim at the
// bottom and a tiny paper fibre. Filled with the panel colour so the dark section shows
// through. Rotated per card so no two holes look identical.
function PunchHole({ index }: { index: number }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ transform: `rotate(${index * 67}deg)` }}>
      <path
        d="M8.2 1.1c2 .1 4.1 1.1 5.3 2.8 1.2 1.6 1.6 3.8 1 5.8-.6 2.2-2.3 3.9-4.5 4.6-2.1.6-4.5.3-6.2-1.1C2.2 11.9 1.1 9.8 1.3 7.6c.2-2.3 1.6-4.3 3.6-5.4 1-.6 2.1-1 3.3-1.1Z"
        fill="#32073e"
      />
      <path d="M2.4 6.2c.9-2.6 3.3-4.4 6-4.4 1.6 0 3.1.6 4.2 1.6" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.4 12.6c1.2 1 2.7 1.6 4.4 1.5 2.4-.1 4.4-1.6 5.3-3.7" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M13.9 9.6l1.1.5" stroke="rgba(250,246,239,0.9)" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

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
            <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-6 min-[960px]:grid-cols-3">
              {testimonials.map((t, i) => (
                <li key={i} className="min-w-0 md:last:odd:col-span-2 md:last:odd:mx-auto md:last:odd:w-[calc(50%_-_12px)] min-[960px]:last:odd:col-span-1 min-[960px]:last:odd:w-auto">
                  <figure
                    className={`relative m-0 flex h-full flex-col rounded-[4px] border border-white/25 [background:linear-gradient(rgba(50,7,62,0.05)_1px,transparent_1px)_0_32px/100%_24px,#faf6ef] p-5 text-heading shadow-[0_4px_18px_rgba(30,5,37,0.16)] transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:!translate-y-[-4px] hover:!rotate-0 md:p-6 motion-reduce:!transform-none motion-reduce:transition-none ${
                      TILTS[i % TILTS.length]
                    }`}
                  >
                    {/* Number + punch hole — the hole is filled with the panel colour so the
                        dark section shows "through" the paper. */}
                    <div className="mb-5 flex items-center justify-between border-b border-line/60 pb-[10px] font-brand text-[10px] uppercase leading-[14px] tracking-[0px] text-muted">
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <PunchHole index={i} />
                    </div>

                    {/* Quote */}
                    <blockquote className="m-0 flex-1 pt-1 font-heading text-[20px] font-normal not-italic leading-[26px] tracking-[0px] text-heading lg:text-[22px] lg:leading-[30px]">
                      <p className="m-0">{t.quote}</p>
                    </blockquote>

                    {/* Signature — its own element on the right, above the footer. The bottom
                        crosses the divider; multiply blend lets the paper's ruled lines show through. */}
                    <Signature
                      strokes={t.signature}
                      label={t.name}
                      className="relative z-[1] -mb-11 h-[68px] w-[160px] shrink-0 -rotate-[6deg] self-end mix-blend-multiply lg:-mb-12 lg:-mr-1 lg:h-[72px] lg:w-[168px]"
                    />

                    {/* Citation */}
                    <figcaption className="mt-8 border-t border-line/60 pt-[14px] font-body text-[12px] not-italic leading-[16px] text-secondary">
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
