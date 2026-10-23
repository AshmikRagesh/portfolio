import { ArrowUpRight } from "lucide-react";

// Testimonials as a guestbook: same notepad cards and punch holes, now with a
// handwritten signature and the room each guest "stayed in". Dark panel gets the
// lamp highlight + grain instead of a flat fill.

interface Entry {
  quote: string;
  name: string;
  role: string;
  context: string;
  room: string;
}

// TODO: DUMMY CONTENT — fictional people and quotes. Replace before publishing.
const entries: Entry[] = [
  {
    quote:
      "Ashmik turned a scattered set of components into a design system the whole team actually wanted to use. Every decision came with a reason, and every handoff came with documentation.",
    name: "Rohan Mehta",
    role: "Engineering Lead",
    context: "Worked together on the Artemis Design System",
    room: "101",
  },
  {
    quote:
      "He has a knack for finding the real problem behind a request. The reservations redesign made a dense tool feel calm for our ops team.",
    name: "Sarah Lindqvist",
    role: "Product Manager",
    context: "Worked together on Artemis 3.0",
    room: "102",
  },
];

export default function Guestbook() {
  return (
    <section id="guestbook" aria-labelledby="guestbook-heading" className="page-container section-spacing scroll-mt-24">
      <div className="demo-lamp w-full rounded-[4px] bg-primary p-6 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] md:p-8 lg:p-12">
        <div className="mb-8 grid grid-cols-1 items-end gap-4 pb-5 shadow-[inset_0_-1px_0_rgba(255,255,255,0.22)] md:mb-10 md:grid-cols-[minmax(0,1fr)_160px] md:gap-12">
          <div>
            <span className="mb-3 block font-brand text-[12px] uppercase leading-[16px] tracking-[2px] text-pink">Notes left by past guests</span>
            <h2
              id="guestbook-heading"
              className="m-0 text-balance font-heading text-[34px] font-normal leading-[36px] tracking-[-2px] text-white md:text-[44px] md:leading-[44px]"
            >
              The guestbook.
            </h2>
          </div>
          <a
            href="https://linkedin.com/in/ashmikragesh/details/recommendations/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-[6px] text-[14px] font-medium text-pink underline underline-offset-4"
          >
            Read all on LinkedIn
            <ArrowUpRight size={14} />
          </a>
        </div>

        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-6">
          {entries.map((t, i) => (
            <li key={t.name} className="min-w-0">
              <figure
                className={`relative m-0 flex h-full flex-col rounded-[4px] border border-white/25 [background:linear-gradient(rgba(50,7,62,0.05)_1px,transparent_1px)_0_32px/100%_24px,#faf6ef] p-5 text-heading shadow-[0_4px_18px_rgba(30,5,37,0.16)] transition-transform duration-[260ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:!translate-y-[-4px] hover:!rotate-0 md:p-6 motion-reduce:!transform-none motion-reduce:transition-none ${
                  i === 0 ? "-rotate-[0.35deg]" : "rotate-[0.4deg]"
                }`}
              >
                <div className="mb-5 flex items-center justify-between border-b border-line/60 pb-[10px] font-brand text-[10px] uppercase leading-[14px] tracking-[0px] text-muted">
                  <span>{String(i + 1).padStart(2, "0")} · Room {t.room}</span>
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full bg-primary shadow-[inset_0_2px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.8)]"
                  />
                </div>

                <blockquote className="m-0 flex-1 pt-1 font-heading text-[20px] font-normal not-italic leading-[26px] tracking-[0px] text-heading lg:text-[26px] lg:leading-[32px]">
                  <p className="m-0">{t.quote}</p>
                </blockquote>

                {/* Handwritten sign-off */}
                <p className="m-0 mt-4 rotate-[-2deg] font-handwriting text-[28px] leading-[28px] text-grape">— {t.name.split(" ")[0]}</p>

                <figcaption className="mt-6 grid grid-cols-1 border-t border-line/60 pt-[14px] text-[12px] not-italic leading-[16px] text-secondary">
                  <span className="text-[14px] font-medium leading-[20px] text-heading">{t.name}</span>
                  <span>{t.role}</span>
                  <span className="mt-1 text-muted">{t.context}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
