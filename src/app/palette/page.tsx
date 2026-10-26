// ── /palette ──────────────────────────────────────────────────────────────────
// The colour reference for the whole site, laid out like the bell's palette on
// /host-states: the design-system tokens first, read straight from tokens.ts so
// they can't drift from it, then every colour the code uses outside the tokens,
// each with where it lives and the token it is closest to. That second list is
// the one to work down when making the colours consistent. The bell's own
// colours live on /host-states. Development only: it 404s in production.
// Every value is a multiple of 2/4px.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tokens } from "@/styles/tokens";

export const metadata: Metadata = { title: "Palette", robots: { index: false } };

type TokenName = keyof typeof tokens.colors;

interface Token {
  token: TokenName;
  name: string;
  /** The Tailwind name, where it differs from the token's */
  cls?: string;
  use: string;
}

// The off-token lists are kept by hand: re-run the audit when colours change
interface Loose {
  hex: string;
  name: string;
  use: string;
  where: string;
  /** The token it should probably become, or the one it already equals */
  closest?: string;
}

const C = tokens.colors;

const TOKEN_GROUPS: { id: string; title: string; intro: string; items: Token[] }[] = [
  {
    id: "brand",
    title: "Brand",
    intro: "Blackcurrant carries the brand, grape is the one interactive accent, and the two pale tints soften them.",
    items: [
      { token: "primary", name: "Blackcurrant", use: "CTAs, the navbar button, badges, the footer card" },
      { token: "midnight", name: "Midnight", use: "Deepest dark: the reel and its expanded view, modal backgrounds, the bell's tooltip" },
      { token: "grape", name: "Grape", use: "Hover, focus rings, links, Type tags, active states" },
      { token: "grape-light", name: "Grape, light", use: "Active and hover rows in the case-study nav and the chat" },
      { token: "pink", name: "Pink", use: "Soft tints. Nothing uses it through a class yet" },
    ],
  },
  {
    id: "text",
    title: "Text",
    intro: "Four steps, darkest to lightest. Body and heading text share their values with midnight and blackcurrant.",
    items: [
      { token: "heading", name: "Heading", use: "Every heading, H1 to H6. Same value as blackcurrant" },
      { token: "text", name: "Body", cls: "text-base", use: "Default body text. Same value as midnight" },
      { token: "secondary", name: "Secondary", use: "Leads, card copy, supporting text" },
      { token: "muted", name: "Muted", use: "Eyebrows, labels, captions, dates" },
    ],
  },
  {
    id: "surfaces",
    title: "Surfaces",
    intro: "White is the page. The rest sit behind content without competing with it.",
    items: [
      { token: "background", name: "Background", use: "The page" },
      { token: "surface", name: "Surface", use: "Light cards and the case-study sidebar" },
      { token: "placeholder", name: "Placeholder", use: "Image placeholders on work cards and case studies" },
      { token: "vanilla", name: "Vanilla", use: "Warm ground behind a taste note's page" },
    ],
  },
  {
    id: "lines",
    title: "Lines",
    intro: "Two weights of divider. 1px is the only width used.",
    items: [
      { token: "line-soft", name: "Line, soft", use: "Subtle dividers and card borders" },
      { token: "line", name: "Line", use: "Image borders, stronger dividers" },
    ],
  },
  {
    id: "status",
    title: "Status",
    intro: "Only in case studies and the stats page, for pros, cons and impact numbers.",
    items: [
      { token: "success", name: "Success", use: "Pros, trend arrows" },
      { token: "success-bg", name: "Success, background", use: "Impact metric cards" },
      { token: "warning", name: "Warning", use: "Cons and alerts" },
    ],
  },
];

// Interface colours that aren't tokens
const DRIFT: Loose[] = [
  { hex: "#0B0B0B", name: "Near black", use: "The Read the note button", where: "TasteNotes.tsx", closest: "midnight" },
  { hex: "#E5E7EB", name: "Tag grey", use: "Grey tag fill — Works discipline tags, case study option labels (Tailwind gray-200)", where: "Tag.tsx", closest: "line-soft or surface" },
];

const PAPERS: Loose[] = [
  { hex: "#FAF6EF", name: "Guestbook card", use: "The ruled cards in the guestbook", where: "Testimonials.tsx" },
  { hex: "#F7F4EC", name: "Note sheet", use: "An opened note, and the sheet on a note's page", where: "TasteNotes.tsx, notes/[slug]" },
  { hex: "#EEEAE0", name: "Note sheet, back", use: "The blank back of an opened note", where: "TasteNotes.tsx" },
  { hex: "#EEE4CC", name: "Envelope", use: "Both taste-note mailers", where: "Mailer.tsx" },
  { hex: "#FDFDFC", name: "Sheet in envelope", use: "The sheets peeking out of a mailer (#FCFCFB on the back one)", where: "Mailer.tsx", closest: "background" },
  { hex: "rgba(120,100,70,0.08)", name: "Paper edge", use: "Warm brown edge and grain on note paper (rgba(90,70,40) in the folds)", where: "TasteNotes.tsx, notes/[slug]", closest: "secondary as a tint" },
];

const HARDCODED: Loose[] = [
  { hex: C.warning, name: "NDA stamp ink", use: "The NDA stamp on work cards", where: "NdaStamp.tsx", closest: "Is warning, written as a hex" },
  { hex: C.secondary, name: "Envelope print", use: "Print and creases on the mailers", where: "Mailer.tsx", closest: "Is secondary, written as a hex" },
  { hex: C.grape, name: "Grape in SVG", use: "The key fob and the grape mailer", where: "KeyTag.tsx, Mailer.tsx", closest: "Is grape, written as a hex" },
  { hex: C.primary, name: "Punch hole", use: "The holes punched in guestbook cards", where: "Testimonials.tsx", closest: "Is primary, written as a hex" },
];

// Drawn colours: these belong to an object, not to the interface
const ILLUSTRATION: { title: string; where: string; hexes: string[] }[] = [
  { title: "Brass key and hook", where: "KeyTag.tsx", hexes: ["#FBE7B0", "#F8E2A0", "#D2A44A", "#C99A3C", "#A37A2C", "#7A5718", "#6B4B14", "#4D3409"] },
  { title: "Steel ring", where: "KeyTag.tsx", hexes: ["#FFFFFF", "#D9DCE1", "#C4C8CE", "#686D76"] },
  { title: "Room fob", where: "KeyTag.tsx", hexes: ["#FBE9F6", "#C0378D", "#9D136A", "#5E0B40"] },
  { title: "Signature ink", where: "Signature.tsx", hexes: ["#3557B7", "#1C2F7D"] },
  { title: "Social circles", where: "Footer.tsx", hexes: ["#67C23A", "#1F88F9", "#091624"] },
];

const FINDINGS = [
  "Body text and midnight are the same colour under two names (#1E0525), and so are heading and blackcurrant (#32073E).",
  "Paper is drawn in five creams that are close but not the same: vanilla, and the four under Papers.",
  "The selected option in two case studies still uses the old grape, #895BE7, at 5%.",
  "Buttons use two different darks: blackcurrant on the navbar and #0B0B0B on the note button.",
  "Discipline tags use Tailwind's greys instead of the palette.",
  "Pink is a token, but nothing uses it through a class.",
];

const SECTIONS = [
  ["overview", "Overview"],
  ["findings", "Findings"],
  ...TOKEN_GROUPS.map((g) => [g.id, g.title] as const),
  ["drift", "Off the palette"],
  ["papers", "Papers"],
  ["hardcoded", "Tokens as hex"],
  ["illustration", "Illustration"],
] as const;

// ── Pieces ────────────────────────────────────────────────────────────────────

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[120px] border-t border-line-soft pt-[48px]">
      <h2 className="font-heading text-h2 md:text-h2-md lg:text-h2-lg text-heading">{title}</h2>
      {intro && <p className="mt-[8px] max-w-[640px] font-body text-body md:text-body-md text-secondary">{intro}</p>}
      <div className="mt-[24px]">{children}</div>
    </section>
  );
}

function Swatch({ hex, name, code, use, note }: { hex: string; name: string; code?: string; use: string; note?: string }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-line-soft">
      <div className="h-[64px] border-b border-line-soft" style={{ background: hex }} />
      <div className="p-[12px]">
        <p className="font-body font-medium text-[14px] leading-[20px] text-heading">{name}</p>
        <p className="break-all font-brand text-[12px] leading-[16px] text-muted uppercase">{hex}</p>
        {code && <p className="mt-[4px] font-brand text-[12px] leading-[16px] text-grape">{code}</p>}
        <p className="mt-[4px] font-body text-[12px] leading-[18px] text-secondary">{use}</p>
        {note && <p className="mt-[8px] border-t border-line-soft pt-[8px] font-body text-[12px] leading-[18px] text-secondary">{note}</p>}
      </div>
    </div>
  );
}

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-[12px] grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{children}</div>
);

function LooseGrid({ items, lead }: { items: Loose[]; lead?: string }) {
  return (
    <Grid>
      {items.map((l) => (
        <Swatch
          key={l.hex + l.name}
          hex={l.hex}
          name={l.name}
          use={`${l.use}. ${l.where}`}
          note={l.closest && (lead ? `${lead} ${l.closest}` : l.closest)}
        />
      ))}
    </Grid>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PalettePage() {
  if (process.env.NODE_ENV === "production") notFound();

  const tokenCount = Object.keys(C).length;
  const looseCount = DRIFT.length + PAPERS.length;

  return (
    <main className="page-container pt-[140px] pb-[120px]">
      <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-[48px]">
        {/* On-page contents */}
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-[120px] flex flex-col gap-[8px]">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="font-body text-[14px] leading-[20px] text-secondary transition-colors hover:text-grape">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-[56px]">
          <header id="overview" className="scroll-mt-[120px]">
            <p className="font-brand text-[12px] uppercase tracking-[1.6px] text-muted">Design system · Colour</p>
            <h1 className="mt-[8px] font-heading text-h1 md:text-h1-md lg:text-h1-lg text-heading">Palette</h1>
            <p className="mt-[12px] max-w-[680px] font-body text-lead md:text-lead-md text-secondary">
              Every colour the site uses. The tokens come first, read straight from tokens.ts. After them is every colour
              written outside the tokens, with where it lives and the token it is closest to. Work down that list to make the
              colours consistent. The bell&apos;s own colours are on its character page.
            </p>
            <div className="mt-[20px] flex flex-wrap gap-[8px]">
              {[`${tokenCount} tokens`, `${looseCount} colours off the palette`, "Development-only page"].map((t) => (
                <span key={t} className="rounded-full bg-surface px-[12px] py-[4px] font-brand text-[12px] uppercase tracking-[1px] text-secondary">
                  {t}
                </span>
              ))}
              <a href="/host-states#palette" className="rounded-full bg-surface px-[12px] py-[4px] font-brand text-[12px] uppercase tracking-[1px] text-grape hover:bg-grape-light">
                Bell palette
              </a>
            </div>
          </header>

          <Section id="findings" title="Findings" intro="What stands out from the audit.">
            <ol className="m-0 flex max-w-[680px] list-decimal flex-col gap-[8px] pl-[20px] font-body text-body md:text-body-md text-secondary">
              {FINDINGS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ol>
          </Section>

          {TOKEN_GROUPS.map((g) => (
            <Section key={g.id} id={g.id} title={g.title} intro={g.intro}>
              <Grid>
                {g.items.map((t) => (
                  <Swatch key={t.token} hex={C[t.token]} name={t.name} code={t.cls ?? t.token} use={t.use} />
                ))}
              </Grid>
            </Section>
          ))}

          <Section id="drift" title="Off the palette" intro="Interface colours that aren't tokens. Each one probably wants to become the token under it.">
            <LooseGrid items={DRIFT} lead="Closest token:" />
          </Section>

          <Section
            id="papers"
            title="Papers"
            intro="The paper things: guestbook cards, notes, the envelopes and the sheets inside. They are drawn in creams that are close but not the same. One or two paper tokens would cover all of them."
          >
            <LooseGrid items={PAPERS} lead="Closest token:" />
          </Section>

          <Section id="hardcoded" title="Tokens as hex" intro="The right colour, written as a raw value. Inside SVG this is often unavoidable; elsewhere it can use the class.">
            <LooseGrid items={HARDCODED} />
          </Section>

          <Section id="illustration" title="Illustration" intro="Colours that belong to a drawn object rather than the interface. They are meant to sit outside the palette.">
            <div className="flex flex-col gap-[16px]">
              {ILLUSTRATION.map((set) => (
                <div key={set.title} className="rounded-[12px] border border-line-soft p-[16px]">
                  <p className="font-body font-medium text-[14px] leading-[20px] text-heading">{set.title}</p>
                  <p className="font-brand text-[12px] leading-[16px] text-muted">{set.where}</p>
                  <div className="mt-[12px] flex flex-wrap gap-[8px]">
                    {set.hexes.map((hex) => (
                      <div key={hex} className="flex items-center gap-[8px] rounded-full border border-line-soft py-[4px] pl-[4px] pr-[12px]">
                        <span className="size-[24px] rounded-full border border-line-soft" style={{ background: hex }} />
                        <span className="font-brand text-[12px] leading-[16px] text-secondary">{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
