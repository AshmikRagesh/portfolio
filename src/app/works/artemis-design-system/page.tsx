import type { Metadata } from "next";
import { Fragment } from "react";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import {
  Hero,
  Chapter,
  Copy,
  Lead,
  Meta,
  Visual,
  Pair,
  Figure,
  Quote,
  Outcome,
} from "@/components/case-study";

export const metadata: Metadata = {
  title: "Artemis Design System · Ashmik Ragesh",
  description:
    "[placeholder: 1-line description of the Artemis Design System case study]",
};

const SECTIONS: CaseStudySection[] = [
  { id: "context",       label: "Context"       },
  { id: "audit",         label: "Audit"         },
  { id: "five-fronts",   label: "Five fronts"   },
  { id: "contributions", label: "Contributions" },
  { id: "adoption",      label: "Adoption"      },
  { id: "reflection",    label: "Reflection"    },
];

// ─────────────────────────────────────────────────────────────────────────────
// 00 Context
// TODO: Verify product count (~6) and active contributor count (~10).
// ─────────────────────────────────────────────────────────────────────────────
function Context() {
  return (
    <Chapter id="context" num={0} title="Context">
      <Copy>
        <Meta
          items={[
            { label: "Role", value: "Lead UX Designer — founder and maintainer of Artemis" },
            { label: "Timeline", value: <>Jan 2023 — ongoing<br />v1 shipped Jul 2023</> },
            {
              label: "Scope",
              value: <>Web + mobile, ~6 products, ~10 active contributors</>,
            },
            {
              label: "Founding team",
              value: <>Vishwa (Design), Parv (PM), Aman (Frontend), Swapnil Negi (Backend)</>,
            },
          ]}
        />
        <h3>Why Artemis?</h3>
        <p>
          By early 2023, Enchanting Travels was running on a fragmented product
          surface. Six core tools, each built by a different team at a different
          stage of the company&apos;s growth, each with its own typography,
          spacing, and component conventions. Designers re-litigated the same
          low-level decisions on every new screen; engineers rebuilt the same UI
          from screenshots because there was no canonical source. The cost
          wasn&apos;t visible on any single project — it accumulated quietly
          across every sprint, every quarter.
        </p>
        <p>
          A design system wasn&apos;t going to fix that overnight, and wasn&apos;t
          going to be cheap to build. But the alternative — keep paying the tax
          indefinitely, scale it as the company scaled — was worse. The bet was
          that two engineering quarters of foundation work would compound into
          faster shipping, lower defect rates, and a unified product experience
          for years afterward. Three years later, it has.
        </p>
        <h3>Goal</h3>
        <p>
          Build the shared foundation behind every Enchanting Travels product —
          tokens, components, patterns, and governance. Outcomes so far: ~35% less
          net-new UI effort, 40% wider component coverage, and a contribution
          model now used by designers and engineers across the org.
        </p>
      </Copy>
      <Visual>
        <Figure label="The fragmented product surface — late 2022" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 01 Audit
// ─────────────────────────────────────────────────────────────────────────────
function Audit() {
  return (
    <Chapter id="audit" num={1} title="Mapping the system before redesigning it">
      <Copy>
        <Lead>
          The risk in starting a design system without an audit is obvious: you
          redesign what you remember, not what&apos;s actually there.
        </Lead>
        <p>
          So before opening a new Figma file, I spent a week with what already
          existed. Two parallel threads: an inventory of every UI primitive across
          the six tools — buttons, inputs, modals, cards, every distinct variation
          tagged in a single spreadsheet — and twelve short interviews, one
          designer and one engineer per product team, to surface the pain the
          visual audit couldn&apos;t see.
        </p>
        <Outcome
          metric="300+"
          title="Screens reviewed"
          stats={[
            { value: "6", label: "Products audited" },
            { value: "12", label: "Stakeholder interviews" },
            { value: "47", label: "UI primitives catalogued" },
          ]}
        />
        <Quote name="Product designer" role="Booking team">
          I keep a &lsquo;colours-I-actually-use&rsquo; Figma file pinned in my
          workspace. I haven&apos;t checked the official style guide in months.
        </Quote>
        <Quote name="Engineer" role="Itinerary team">
          Every new sprint starts the same way: open someone else&apos;s PR, copy
          the button JSX, hope it still works.
        </Quote>
        <p className="cs-closing">
          Five clear challenges came up across every product. They appear next as
          the five fronts.
        </p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 02 Five fronts
// ─────────────────────────────────────────────────────────────────────────────
const FRONTS = [
  {
    title: "Visual fragmentation",
    description:
      "Across the six tools, typography, colour, and spacing had drifted into incompatible local conventions. The same brand looked materially different from one product to the next.",
  },
  {
    title: "Component drift",
    description:
      "Buttons existed in 6+ parallel implementations across the suite; inputs in 3 different formats. The same UI primitive, rebuilt independently in every product.",
  },
  {
    title: "Broken handoff",
    description:
      "Engineers built features from designer screenshots and inspector measurements because there was no canonical Figma source, and no code library to match it.",
  },
  {
    title: "Accessibility gaps",
    description:
      "Each team approached interface building differently, so accessibility wasn't standardised. Colour contrast failed in several places; focus states and keyboard behaviour weren't shared expectations.",
  },
  {
    title: "Compounding cost",
    description:
      "Every new tool added new inconsistencies to the system. Feature teams reinvented basic UI on every sprint. Onboarding new designers got slower with each release.",
  },
];

function FiveFronts() {
  return (
    <Chapter id="five-fronts" num={2} title="The five fronts">
      <Copy>
        <p>Each one showed up across every tool, in different combinations.</p>
        {FRONTS.map(({ title, description }) => (
          <Fragment key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
          </Fragment>
        ))}
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 03 Contributions  (six pillars of the work, drawn from Notion §7)
// Impacts marked REAL come from the user's Notion doc; others are
// dummy-but-logical per the agreed metrics handling. Confirm before publish.
// ─────────────────────────────────────────────────────────────────────────────
type ContributionItem = {
  title: string;
  intro: string;
  bullets: { label: string; body: string }[];
  closing: string;
  images: [string, string];
  impacts: string[];
};

const CONTRIBUTION_ITEMS: ContributionItem[] = [
  {
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
    title: "Shipping components",
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
    images: ["Shipping components — library overview", "Shipping components — variant matrix"],
    impacts: [
      "~35% reduction in net-new UI design effort", // REAL — Notion §7a
      "40% increase in overall component coverage", // REAL — Notion §7a
      "Developers started proactively referencing DS components without designer involvement",
    ],
  },
  {
    title: "Maintaining and enhancing components",
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
    title: "Design system governance",
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
    title: "Providing DS education",
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

function Contributions() {
  return (
    <Chapter id="contributions" num={3} title="Six pillars of the work">
      <Copy>
        <Lead>
          How Artemis grew from a Figma file into a system every Enchanting
          Travels product runs on.
        </Lead>
        <p>
          Across three years I shipped foundations, built and maintained the
          component library, wrote the documentation, established the governance
          model, and ran the education work that drove adoption.
        </p>
      </Copy>
      {CONTRIBUTION_ITEMS.map(({ title, intro, bullets, closing, images, impacts }) => (
        <div key={title} className="mt-[64px]">
          <Copy>
            <h3>{title}</h3>
            <p>{intro}</p>
            <ul>
              {bullets.map(({ label, body }) => (
                <li key={label}>
                  <strong>{label}:</strong> {body}
                </li>
              ))}
            </ul>
            <p>{closing}</p>
          </Copy>
          <Visual>
            <Pair>
              <Figure label={images[0]} />
              <Figure label={images[1]} />
            </Pair>
          </Visual>
          <Copy>
            <p><strong>Impact</strong></p>
            <ul>
              {impacts.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </Copy>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 04 Adoption
// ─────────────────────────────────────────────────────────────────────────────
function Adoption() {
  return (
    <Chapter id="adoption" num={4} title="Three years on — where Artemis sits today">
      <Copy>
        <p>
          The per-pillar impacts above are the inputs. These are the system-level
          outputs three years in.
        </p>
        <Outcome
          metric="6/6"
          title="Enchanting Travels products fully on Artemis"
          stats={[
            { value: "4×", label: "Faster to ship a new screen, design-to-production." },
            {
              value: "~80%",
              label: "Of new screens built entirely from Artemis components — no custom one-offs.",
            },
          ]}
        >
          <p>Up from zero at the start.</p>
        </Outcome>
        <p className="cs-closing">
          Three years in, Artemis isn&apos;t something I maintain — it&apos;s
          something the team builds on.
        </p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 05 Reflection
// ─────────────────────────────────────────────────────────────────────────────
function Reflection() {
  return (
    <Chapter id="reflection" num={5} title="What I learned">
      <Copy>
        <h3>Foundations pay off slowly, then all at once</h3>
        <p>
          The hardest call I made in the first quarter was to build the token
          system before any component. Visible progress was slow — three weeks in,
          there was nothing to demo to leadership, no clickable Figma file, no
          &ldquo;we shipped a button&rdquo; moment. But every component that came
          after inherited from those tokens, and brand updates that would have
          taken weeks of cross-product coordination became single-file edits.
        </p>
        <h3>The system that scales is the one others can change</h3>
        <p>
          Building a contribution workflow into v1 felt premature at the time —
          there was barely a system to contribute to. Without proposal → review →
          accept in place from day one, the library would have plateaued the
          moment my attention moved to other work. The system became a team
          because it could, and that was the only reason it outlasted me being its
          sole maintainer.
        </p>
        <h3>Removing myself from the critical path</h3>
        <p>
          Year one I was the bottleneck. Every &ldquo;should this component handle
          X&rdquo; question came to me; every implementation review pinged me
          directly. By year three, those questions had moved to a Slack channel
          that designers and engineers answered each other in, and to weekly
          clinics that ran with or without me.
        </p>
        <p className="cs-closing">
          If a DS lead is still indispensable in year three, the system hasn&apos;t
          matured — only the lead has.
        </p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtemisDesignSystemPage() {
  return (
    <CaseStudyLayout sections={SECTIONS}>
      <Hero title="Artemis Design System" date="2023 — Ongoing" color="#EFE8DC" />
      <Context />
      <Audit />
      <FiveFronts />
      <Contributions />
      <Adoption />
      <Reflection />
    </CaseStudyLayout>
  );
}
