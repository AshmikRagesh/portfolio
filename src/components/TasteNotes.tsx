// ── My Taste Notes ────────────────────────────────────────────────────────────
// Two notes, each posted in a vanilla kraft mailer (see Mailer). The mailers lie
// at slight angles; hovering one straightens it and nudges its sheets out.
// Clicking a mailer opens the article on Medium in a new tab.
// Uses the shared page container. All values are multiples of 2/4px.

import Mailer, { MailerDefs, MAILER_SEEDS } from "@/components/Mailer";
import { notes } from "@/content/notes";

// Mailers lie at slightly different angles, like they were dropped on a table
const TILTS = ["-rotate-[2deg]", "rotate-[1.6deg]"];

export default function TasteNotes() {
  return (
    <section
      id="notes"
      aria-labelledby="notes-heading"
      className="page-container section-spacing scroll-mt-20 bg-background pb-[128px] md:pb-[160px] lg:pb-[200px]"
    >
      <MailerDefs />

      {/* Header */}
      <header className="mb-10 md:mb-14">
        <h2
          id="notes-heading"
          className="m-0 text-balance font-heading text-[34px] font-normal leading-[36px] tracking-[-2px] text-heading md:text-[44px] md:leading-[44px]"
        >
          My taste notes.
        </h2>
      </header>

      {/* Mailers, from the left */}
      <ul className="m-0 flex list-none flex-col items-start gap-16 p-0 md:flex-row md:gap-16 lg:gap-20">
        {notes.map((n, i) => (
          <li key={n.href} className="w-full max-w-[300px]">
            <a
              href={n.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${n.title}: ${n.summary} ${n.date}, ${n.readTime}. Opens on Medium in a new tab.`}
              className={`group block w-full rounded-sm text-left transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:rotate-0 focus-visible:rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-8 motion-reduce:transition-none ${
                TILTS[i % TILTS.length]
              }`}
            >
              <Mailer
                seed={MAILER_SEEDS[i % MAILER_SEEDS.length]}
                tone={n.tone}
                title={n.title}
                summary={n.summary}
                date={n.date}
                readTime={n.readTime}
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
