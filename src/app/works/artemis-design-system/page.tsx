import type { Metadata } from "next";
import { Palette, Boxes, ArrowLeftRight, Accessibility, TrendingUp } from "lucide-react";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import {
  NumberedH3,
  ImagePlaceholder,
  SectionHeader,
  TrendUpArrow,
  H1_CLASS,
  H2_CLASS,
  H3_CLASS,
  H4_CLASS,
  LEAD_CLASS,
  BODY_CLASS,
  EYEBROW_CLASS,
  SECTION_PAD,
} from "@/components/case-study";

export const metadata: Metadata = {
  title: "Artemis Design System · Ashmik Ragesh",
  description:
    "[placeholder: 1-line description of the Artemis Design System case study]",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",     label: "Overview"     },
  { id: "at-a-glance",  label: "At a Glance"  },
  { id: "why-artemis",  label: "Why Artemis"  },
  { id: "audit",        label: "Audit"        },
  { id: "five-fronts",  label: "Five Fronts"  },
  { id: "my-contributions", label: "My Contributions" },
  { id: "adoption",     label: "Adoption"     },
  { id: "reflection",   label: "Reflection"   },
];

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <section id="overview" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full">
        <div className="flex flex-col gap-5">
          <div className="-rotate-3 w-fit">
            <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.15px] text-grape whitespace-nowrap">
              {"< 2023 — Ongoing >"}
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <h1 className={H1_CLASS}>
              Three years of building Artemis at Enchanting Travels
            </h1>
            <p className={LEAD_CLASS}>
              Tokens, components, patterns, and governance — the shared
              foundation behind every Enchanting Travels product. Outcomes
              so far: ~35% less net-new UI effort, 40% wider component
              coverage, and a contribution model now used by designers and
              engineers across the org.
            </p>
          </div>
        </div>

        <ImagePlaceholder label="Artemis — system at a glance" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: At a Glance
// TODO: Verify product count (~6) and active contributor count (~10).
// ─────────────────────────────────────────────────────────────────────────────
function AtAGlance() {
  const columns = [
    {
      heading: "My Role",
      content: (
        <>
          Lead UX Designer. Founder, lead, and ongoing maintainer of the
          Artemis Design System — owned everything from research through to
          governance.
        </>
      ),
    },
    {
      heading: "Timeline",
      content: (
        <>
          Jan 2023 — Ongoing
          <br />
          v1 shipped Jul 2023
        </>
      ),
    },
    {
      heading: "Scope",
      content: (
        <>
          Web + mobile
          <br />
          ~6 products across the Enchanting Travels suite
          <br />
          ~10 active contributors
        </>
      ),
    },
    {
      heading: "Founding team",
      content: (
        <>
          Vishwa (Design)
          <br />
          Parv (PM)
          <br />
          Aman (Frontend)
          <br />
          Swapnil Negi (Backend)
        </>
      ),
    },
  ];

  return (
    <section id="at-a-glance" className={`bg-white ${SECTION_PAD}`}>
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 w-full md:gap-x-[48px] lg:grid-cols-4 lg:gap-x-[48px]">
        {columns.map(({ heading, content }) => (
          <div key={heading} className="flex flex-col gap-3">
            <h4 className={H4_CLASS}>{heading}</h4>
            <p className={BODY_CLASS}>{content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Why Artemis  (strategic case for the work)
// ─────────────────────────────────────────────────────────────────────────────
function WhyArtemis() {
  return (
    <section id="why-artemis" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader tag="why" heading="Why Artemis" />

        <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
          <p>
            By early 2023, Enchanting Travels was running on a fragmented
            product surface. Six core tools, each built by a different team
            at a different stage of the company&apos;s growth, each with its
            own typography, spacing, and component conventions. Designers
            re-litigated the same low-level decisions on every new screen;
            engineers rebuilt the same UI from screenshots because there was
            no canonical source. The cost wasn&apos;t visible on any single
            project — it accumulated quietly across every sprint, every
            quarter.
          </p>
          <p>
            A design system wasn&apos;t going to fix that overnight, and
            wasn&apos;t going to be cheap to build. But the alternative —
            keep paying the tax indefinitely, scale it as the company
            scaled — was worse. The bet was that two engineering quarters
            of foundation work would compound into faster shipping, lower
            defect rates, and a unified product experience for years
            afterward. Three years later, it has.
          </p>
        </div>

        <ImagePlaceholder label="The fragmented product surface — late 2022" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Audit  (audit-first method, the receipts, voices from the field)
// ─────────────────────────────────────────────────────────────────────────────
const AUDIT_STATS = [
  { stat: "6",    label: "products audited" },
  { stat: "300+", label: "screens reviewed" },
  { stat: "12",   label: "stakeholder interviews" },
  { stat: "47",   label: "UI primitives catalogued" },
];

const AUDIT_QUOTES = [
  {
    text:
      "I keep a 'colours-I-actually-use' Figma file pinned in my workspace. I haven't checked the official style guide in months.",
    attribution: "— Product designer, Booking team",
  },
  {
    text:
      "Every new sprint starts the same way: open someone else's PR, copy the button JSX, hope it still works.",
    attribution: "— Engineer, Itinerary team",
  },
];

function Audit() {
  return (
    <section id="audit" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader
          tag="audit"
          heading="Mapping the system before redesigning it"
        />

        {/* Lead — audit-first framing + the two-thread method */}
        <p className={LEAD_CLASS}>
          The risk in starting a design system without an audit is obvious:
          you redesign what you remember, not what&apos;s actually there. So
          before opening a new Figma file, I spent a week with what already
          existed. Two parallel threads: an inventory of every UI primitive
          across the six tools — buttons, inputs, modals, cards, every
          distinct variation tagged in a single spreadsheet — and twelve
          short interviews, one designer and one engineer per product team,
          to surface the pain the visual audit couldn&apos;t see.
        </p>

        {/* By the numbers — bare 4-stat grid (no card chrome — matter-of-fact, not celebratory) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {AUDIT_STATS.map(({ stat, label }) => (
            <div key={label} className="flex flex-col gap-2">
              <span className="font-heading font-medium text-stat md:text-stat-md lg:text-stat-lg text-heading leading-none">
                {stat}
              </span>
              <p className="font-body font-normal text-body md:text-body-md lg:text-body-lg text-muted">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Voices from each side of the handoff */}
        <div className="flex flex-col gap-5 md:gap-6">
          {AUDIT_QUOTES.map(({ text, attribution }) => (
            <blockquote
              key={attribution + text.slice(0, 20)}
              className="border-l-2 border-grape pl-5 md:pl-6 flex flex-col gap-2"
            >
              <p className="font-body font-normal text-lead md:text-lead-md lg:text-lead-lg text-heading">
                &ldquo;{text}&rdquo;
              </p>
              <p className="font-body text-body md:text-body-md lg:text-body-lg text-muted">
                {attribution}
              </p>
            </blockquote>
          ))}
        </div>

        {/* Closing transition */}
        <p className={LEAD_CLASS}>
          Five clear challenges came up across every product. They appear
          next as the Five Fronts.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Five Fronts  (the five challenges that emerged from the audit)
// ─────────────────────────────────────────────────────────────────────────────
const FRONT_CARDS = [
  [
    {
      icon: <Palette size={26} className="text-grape" strokeWidth={2} />,
      title: "Visual fragmentation",
      description:
        "Across the six tools, typography, colour, and spacing had drifted into incompatible local conventions. The same brand looked materially different from one product to the next.",
    },
    {
      icon: <Boxes size={26} className="text-grape" strokeWidth={2} />,
      title: "Component drift",
      description:
        "Buttons existed in 6+ parallel implementations across the suite; inputs in 3 different formats. The same UI primitive, rebuilt independently in every product.",
    },
    {
      icon: <ArrowLeftRight size={26} className="text-grape" strokeWidth={2} />,
      title: "Broken handoff",
      description:
        "Engineers built features from designer screenshots and inspector measurements because there was no canonical Figma source, and no code library to match it.",
    },
  ],
  [
    {
      icon: <Accessibility size={26} className="text-grape" strokeWidth={2} />,
      title: "Accessibility gaps",
      description:
        "Each team approached interface building differently, so accessibility wasn't standardised. Colour contrast failed in several places; focus states and keyboard behaviour weren't shared expectations.",
    },
    {
      icon: <TrendingUp size={26} className="text-grape" strokeWidth={2} />,
      title: "Compounding cost",
      description:
        "Every new tool added new inconsistencies to the system. Feature teams reinvented basic UI on every sprint. Onboarding new designers got slower with each release.",
    },
  ],
];

function FiveFronts() {
  return (
    <section id="five-fronts" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader
          tag="five fronts"
          heading="The five fronts"
          lead="Each one showed up across every tool, in different combinations."
        />

        <div className="flex flex-col gap-[16px] md:gap-[24px]">
          {FRONT_CARDS.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={`grid gap-[16px] md:gap-[24px] ${
                row.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {row.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col gap-[16px] bg-surface rounded-[16px] p-[20px]"
                >
                  <div className="shrink-0">{icon}</div>
                  <div className="flex flex-col gap-3">
                    <h4 className={H4_CLASS}>{title}</h4>
                    <p className={BODY_CLASS}>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: My Contributions  (six pillars of the work, drawn from Notion §7)
// Impacts marked REAL come from the user's Notion doc; others are
// dummy-but-logical per the agreed metrics handling. Confirm before publish.
// ─────────────────────────────────────────────────────────────────────────────
type ContributionItem = {
  num: number;
  title: string;
  intro: string;
  bullets: { label: string; body: string }[];
  closing: string;
  images: [string, string];
  impacts: string[];
};

const CONTRIBUTION_ITEMS: ContributionItem[] = [
  {
    num: 1,
    title: "Foundations",
    intro: "A token system before any component existed:",
    bullets: [
      {
        label: "Three primitive layers",
        body: "Colour (12 hues × 7 tints), type (8 sizes mapped to semantic roles), and spacing (4px base).",
      },
      {
        label: "Semantic aliases",
        body: "Components consumed tokens by intent (text-primary, surface-elevated) rather than by value (grape-500, gray-100).",
      },
      {
        label: "Theme-friendly by design",
        body: "A brand update ripples from one file; downstream components don't need to change.",
      },
      {
        label: "Built for engineering",
        body: "Tokens exported as a single source for both Figma styles and React variables.",
      },
    ],
    closing:
      "The token system became the unit of consistency that everything else inherited from. Brand updates, accessibility patches, and theme variants all became single-file edits.",
    images: ["Foundations — primitive layer", "Foundations — semantic aliases"],
    impacts: [
      "~120 ad-hoc hex values collapsed into a 60-token system",
      "Brand-level changes deploy via single-file edits",
      "Single source of truth shared between design and engineering",
    ],
  },
  {
    num: 2,
    title: "Shipping Components",
    intro: "Starting from zero, I designed and built the foundational components:",
    bullets: [
      {
        label: "The essentials first",
        body: "Buttons, Inputs, Dropdowns, Chips, Cards, Tables, Modals — scope kept lean but meaningful.",
      },
      {
        label: "Variants that scale",
        body: "Buttons had states (hover, focus, disabled), types (primary, secondary, ghost), and modifiers (icons, full-width). Each built with flexible Figma variants and auto-layout.",
      },
      {
        label: "Built-in accessibility",
        body: "Standardised colour contrast ratios, focus states, and spacing — translated into accessible React components in close partnership with engineering.",
      },
      {
        label: "Documentation with each",
        body: "Every component shipped with usage guidelines, dos and don'ts, and edge cases.",
      },
    ],
    closing:
      "Each component was designed with responsiveness, accessibility, and edge cases in mind — using Figma's auto-layout, variants, and tokens to keep them flexible and scalable. Worked closely with developers to ensure 1:1 parity between design and code.",
    images: ["Shipping Components — library overview", "Shipping Components — variant matrix"],
    impacts: [
      "~35% reduction in net-new UI design effort", // REAL — Notion §7a
      "40% increase in overall component coverage", // REAL — Notion §7a
      "Developers started proactively referencing DS components without designer involvement",
    ],
  },
  {
    num: 3,
    title: "Maintaining and Enhancing Components",
    intro: "Shipping was only the first beat. Real value came from how the system stayed alive:",
    bullets: [
      {
        label: "Real-time feedback loops",
        body: "Active monitoring of Slack channels and design crit sessions for component pain points or bugs.",
      },
      {
        label: "Component evolution",
        body: "Five core components revised in year two — more variants, better responsive behaviour, tighter tokenisation — without breaking downstream usage.",
      },
      {
        label: "Validation through use",
        body: "Every revision validated against existing product use cases before merge; nothing landed without proof of need.",
      },
    ],
    closing:
      "The system aged forward, not backward. Components matured with product needs rather than calcifying into early decisions.",
    images: ["Maintaining — component evolution timeline", "Maintaining — Slack feedback loop"],
    impacts: [
      "Zero component forks across the suite as new products onboarded",
      "Five components meaningfully enhanced in year two",
      "Reduced design debt as components matured with the product",
    ],
  },
  {
    num: 4,
    title: "Documentation",
    intro: "Documentation wasn't an afterthought — it was a tool for adoption:",
    bullets: [
      {
        label: "Component-level docs in Figma",
        body: "Each component shipped with usage guidelines, dos and don'ts, variant coverage, and responsive behaviour — written in plain language.",
      },
      {
        label: "Code-aligned guidance",
        body: "Tokens, props, and states mapped clearly for engineering handoff.",
      },
      {
        label: "Patterns > pixels",
        body: "Beyond atomic components, documented usage patterns — form structures, modal stacking, success message behaviour across contexts.",
      },
      {
        label: "Platform-specific clarity",
        body: "Web-specific vs. mobile-specific guidance where it mattered (dropdowns behave differently on desktop vs. touch).",
      },
      {
        label: "Searchable and shareable",
        body: "Everything lived in Notion and Figma, structured around clear navigation and searchable tags.",
      },
    ],
    closing:
      "Good documentation meant fewer meetings, faster decisions, and better implementation fidelity. Docs stopped being a side-effort; they became the system's interface to the team.",
    images: ["Documentation — Figma component page", "Documentation — pattern library"],
    impacts: [
      "New-designer onboarding dropped from days to hours",
      "Developers stopped pinging designers and started referencing docs as source of truth",
      "Reduced back-and-forth on edge cases and state logic during handoff",
    ],
  },
  {
    num: 5,
    title: "Design System Governance",
    intro: "Systems thrive when people understand them — and contribute to them:",
    bullets: [
      {
        label: "Contribution workflow",
        body: "New components followed proposal → review → approve. Nothing landed without alignment to DS principles.",
      },
      {
        label: "Active unblocking",
        body: "Became the go-to person for DS questions across teams — from clarifying usage to debugging implementation issues with devs.",
      },
      {
        label: "Workshops and focus groups",
        body: "Quarterly focus-group sessions with designers surfaced friction points the audit missed; brainstorming sessions kept the system evolving with the team's actual workflows.",
      },
    ],
    closing:
      "The system stopped being mine and started being ours. Contribution opened the door for compounding value beyond what one designer could maintain.",
    images: ["Governance — contribution workflow", "Governance — focus group sessions"],
    impacts: [
      "Drove systemic consistency across the brand by validating major design decisions",
      "Enabled new contributors to participate confidently in DS evolution",
      "Created a culture where the system was seen as a living product — not a handoff artefact",
    ],
  },
  {
    num: 6,
    title: "Providing DS Education",
    intro: "For any design system to thrive, it must be understood, respected, and effectively used:",
    bullets: [
      {
        label: "Onboarding sessions",
        body: "Every new designer and PM received an intro walkthrough — not just how to use the system, but the why behind each design choice.",
      },
      {
        label: "Weekly clinics",
        body: "Open sessions where anyone could drop in with questions or component requests, keeping knowledge flowing and surfacing new patterns.",
      },
      {
        label: "Playbooks and templates",
        body: "Ready-to-use Figma templates for common flows, paired with playbooks for navigating common DS challenges.",
      },
      {
        label: "Dev enablement",
        body: "Paired with engineers on implementation demos and office hours, bridging gaps between tokens, visuals, and code.",
      },
      {
        label: "Evangelism through wins",
        body: "Highlighted successful uses of the system in org-wide channels — reinforcing best practices through visibility.",
      },
    ],
    closing:
      "DS education normalised reuse, encouraged good design hygiene, and made contributions easier across the team.",
    images: ["Education — onboarding session", "Education — Figma template gallery"],
    impacts: [
      "Designer onboarding shifted from 1:1 sessions to clinic + self-serve playbooks",
      "PMs and engineers regularly attended DS clinics, broadening literacy beyond design",
      "Reduced dependency on the DS lead for day-to-day system questions",
    ],
  },
];

function MyContributions() {
  return (
    <section id="my-contributions" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[80px]">
        <SectionHeader
          tag="my contributions"
          heading="Six pillars that grew Artemis from a Figma file into a system every Enchanting Travels product runs on"
          lead="Across three years I shipped foundations, built and maintained the component library, wrote the documentation, established the governance model, and ran the education work that drove adoption. Each pillar is detailed below."
        />

        {CONTRIBUTION_ITEMS.map(({ num, title, intro, bullets, closing, images, impacts }) => (
          <div key={num} className="flex flex-col gap-10 md:gap-[48px]">
            {/* Title + intro + bullets + closing */}
            <div className="flex flex-col gap-5 md:gap-[24px]">
              <NumberedH3 num={num} title={title} />
              <p className={LEAD_CLASS}>{intro}</p>

              <ul className={`list-disc ${LEAD_CLASS} flex flex-col gap-2`}>
                {bullets.map(({ label, body }) => (
                  <li key={label} className="ms-[27px]">
                    <span className="font-medium text-heading">{label}</span>: {body}
                  </li>
                ))}
              </ul>

              <p className={LEAD_CLASS}>{closing}</p>
            </div>

            {/* 2 images, stacked vertically — matches Reservations cadence */}
            <div className="flex flex-col gap-4 md:gap-6">
              <ImagePlaceholder label={images[0]} />
              <ImagePlaceholder label={images[1]} />
            </div>

            {/* Impact block — eyebrow + bullets */}
            <div className="flex flex-col gap-3">
              <p className="font-brand text-[13px] font-medium uppercase tracking-[1.5px] text-success">
                Impact
              </p>
              <ul className="list-disc flex flex-col gap-2">
                {impacts.map((i) => (
                  <li
                    key={i}
                    className="ms-[27px] font-body text-body md:text-body-md lg:text-body-lg text-muted"
                  >
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Adoption  (system-level outcomes + voices from current users)
// ─────────────────────────────────────────────────────────────────────────────
const METRICS: { stat: string; label: string }[] = [
  {
    stat: "6/6",
    label: "Enchanting Travels products fully on Artemis (was 0 at start)",
  },
  {
    stat: "4×",
    label: "faster to ship a new screen, design-to-production",
  },
  {
    stat: "~80%",
    label:
      "of new screens built entirely from Artemis components — no custom one-offs",
  },
];

function Adoption() {
  return (
    <section id="adoption" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader
          tag="adoption"
          heading="Three years on — where Artemis sits today"
          lead="The per-pillar impacts above are the inputs. These are the system-level outputs three years in."
        />

        {/* System-level stats — celebratory treatment (success-bg cards + trend arrows) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-[24px]">
          {METRICS.map(({ stat, label }) => (
            <div
              key={label}
              className="flex flex-col gap-4 bg-success-bg rounded-[16px] p-[24px]"
            >
              <div className="flex justify-end">
                <TrendUpArrow />
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-body font-normal text-body md:text-body-md lg:text-body-lg text-secondary">
                  {label}
                </p>
                <span className="font-heading font-medium text-stat md:text-stat-md lg:text-stat-lg text-heading">
                  {stat}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Closing line — case study punchline, centered + italic */}
        <p className="font-body italic text-lead md:text-lead-md lg:text-lead-lg text-heading text-center max-w-[640px] mx-auto pt-2">
          Three years in, Artemis isn&apos;t something I maintain — it&apos;s
          something the team builds on.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection  (three first-person learnings, thesis-driven prose)
// ─────────────────────────────────────────────────────────────────────────────
function Reflection() {
  return (
    <section id="reflection" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-5 w-full md:gap-[24px]">
        <SectionHeader tag="reflection" heading="What I learned" />

        <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
          <p>
            The hardest call I made in the first quarter was to build the
            token system before any component. Visible progress was slow —
            three weeks in, there was nothing to demo to leadership, no
            clickable Figma file, no &ldquo;we shipped a button&rdquo;
            moment. But every component that came after inherited from those
            tokens, and brand updates that would have taken weeks of
            cross-product coordination became single-file edits. Foundations
            paid off slowly, then all at once.
          </p>
          <p>
            Building a contribution workflow into v1 felt premature at the
            time — there was barely a system to contribute to. But the
            system that scales is the one other people can change. Without
            proposal → review → accept in place from day one, the library
            would have plateaued the moment my attention moved to other
            work. The system became a team because it could, and that was
            the only reason it outlasted me being its sole maintainer.
          </p>
          <p>
            Year one I was the bottleneck. Every &ldquo;should this
            component handle X&rdquo; question came to me; every
            implementation review pinged me directly. By year three, those
            questions had moved to a Slack channel that designers and
            engineers answered each other in, and to weekly clinics that
            ran with or without me. Removing myself from the critical path
            was the actual measure of success. If a DS lead is still
            indispensable in year three, the system hasn&apos;t matured —
            only the lead has.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtemisDesignSystemPage() {
  return (
    <CaseStudyLayout sections={SECTIONS} backHref="/#works">
      <Overview />
      <AtAGlance />
      <WhyArtemis />
      <Audit />
      <FiveFronts />
      <MyContributions />
      <Adoption />
      <Reflection />
    </CaseStudyLayout>
  );
}
