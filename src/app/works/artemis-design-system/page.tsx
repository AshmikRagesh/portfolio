import type { Metadata } from "next";
import { Palette, Component, FileText, GitBranch, Layers, Check } from "lucide-react";
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";
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
  { id: "background",   label: "Background"   },
  { id: "audit",        label: "Audit"        },
  { id: "findings",     label: "Findings"     },
  { id: "the-problem",  label: "The Problem"  },
  { id: "process",      label: "Process"      },
  { id: "the-system",   label: "The System"   },
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
              {"< 2022 — Ongoing >"}
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <h1 className={H1_CLASS}>
              From six buttons to one — building Artemis, the design system
              behind Enchanting Travels
            </h1>
            <p className={LEAD_CLASS}>
              Built and lead the Artemis Design System — the shared
              foundation of tokens, components, patterns, and governance
              behind every Enchanting Travels product. Three years in: ~35%
              less net-new UI effort, 40% wider component coverage, and a
              contribution model now used by designers and engineers across
              the org.
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
          Oct 2022 — Ongoing
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
// Section: Background
// TODO: Replace generic setup copy with the real story of why a DS was needed.
// ─────────────────────────────────────────────────────────────────────────────
function Background() {
  return (
    <section id="background" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader
          tag="background"
          heading="A product growing faster than its UI language"
        />

        <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
          <p>
            [placeholder: 1st paragraph — context for Artemis 3.0. By 2025 the
            product had grown to N modules and M teams, with no shared
            foundation. Describe the surface symptoms — drifting components,
            inconsistent tokens, parallel implementations.]
          </p>
          <p>
            [placeholder: 2nd paragraph — what triggered the DS work. A
            specific moment, a leadership ask, or an accumulation of friction
            that made the cost of not having a system obvious.]
          </p>
        </div>

        <ImagePlaceholder label="Background — Artemis 3.0 fragmentation" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Audit
// Composite quotes drawn from recurring themes in designer / dev conversations.
// TODO: Replace placeholder quotes and attributions with real ones.
// ─────────────────────────────────────────────────────────────────────────────
const AUDIT_QUOTES = [
  {
    text:
      "[placeholder: designer quote — something about copying components between files because there was no canonical source].",
    attribution: "— [placeholder: Designer, team]",
  },
  {
    text:
      "[placeholder: engineer quote — something about hex codes drifting across implementations, or rewriting the same button for the fifth time].",
    attribution: "— [placeholder: Engineer, team]",
  },
];

function Audit() {
  return (
    <section id="audit" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader
          tag="audit"
          heading="Mapping what already existed before designing what didn't"
          lead="[placeholder: 1-sentence framing. Two threads ran in parallel — interviews with PMs and eng leads to frame the brief, and a hands-on audit of every existing screen, component, and token in Artemis."
        />

        {/* Sub-section: Stakeholder Interview */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <h3 className={H3_CLASS}>Stakeholder Interview</h3>
          <p className={LEAD_CLASS}>
            [placeholder: lead — what came out of the kickoff conversation with
            the PM / eng lead.]
          </p>
          <ul className={`list-disc ${LEAD_CLASS} flex flex-col gap-2`}>
            <li className="ms-[27px]">
              [placeholder: bullet 1 — e.g. no shared foundation; squads were
              each rolling their own.]
            </li>
            <li className="ms-[27px]">
              [placeholder: bullet 2 — e.g. design-engineering handoff was the
              biggest tax, with components rebuilt from screenshots.]
            </li>
            <li className="ms-[27px]">
              [placeholder: bullet 3 — e.g. scope and time available; what
              counted as &ldquo;done enough&rdquo; for v1.]
            </li>
          </ul>
        </div>

        {/* Sub-section: Component Audit */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <h3 className={H3_CLASS}>Component Audit</h3>
          <p className={LEAD_CLASS}>
            [placeholder: lead — describe the audit method. Catalogued every
            component, token, and pattern across N screens; pulled designers
            and engineers into M short sessions to validate findings.]
          </p>

          {/* Quote stack */}
          <div className="flex flex-col gap-5 md:gap-6 mt-2">
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
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Findings
// TODO: Replace card titles + descriptions with the real audit themes.
// ─────────────────────────────────────────────────────────────────────────────
const FINDING_CARDS = [
  [
    {
      icon: <Palette size={26} className="text-grape" strokeWidth={2} />,
      title: "Token chaos",
      description:
        "[placeholder: dozens of hex codes and spacing values used inconsistently across screens, with no semantic mapping to intent].",
    },
    {
      icon: <Component size={26} className="text-grape" strokeWidth={2} />,
      title: "Component drift",
      description:
        "[placeholder: the same component (buttons, inputs, modals) existed in N parallel implementations, each subtly different].",
    },
    {
      icon: <Layers size={26} className="text-grape" strokeWidth={2} />,
      title: "No source of truth",
      description:
        "[placeholder: designers and engineers each referenced different files; the canonical version of any component depended on who you asked].",
    },
  ],
  [
    {
      icon: <GitBranch size={26} className="text-grape" strokeWidth={2} />,
      title: "Designer–dev gap",
      description:
        "[placeholder: handoff was a translation step, not a pickup step — engineers rebuilt components from screenshots and inspector measurements].",
    },
    {
      icon: <FileText size={26} className="text-grape" strokeWidth={2} />,
      title: "Docs entropy",
      description:
        "[placeholder: usage guidance lived in scattered Notion pages, Slack threads, and tribal memory — outdated within weeks of being written].",
    },
  ],
];

function Findings() {
  return (
    <section id="findings" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader
          tag="audit findings"
          heading="Where the absence of a system was costing the team"
          lead="[placeholder: 1-sentence lead. Across the audit and the interviews, five themes surfaced repeatedly. Each became a target for v1.]"
        />

        <div className="flex flex-col gap-[16px] md:gap-[24px]">
          {FINDING_CARDS.map((row, rowIdx) => (
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
// Section: The Problem
// TODO: Rewrite synthesis paragraphs and Problem Statement once narrative is set.
// ─────────────────────────────────────────────────────────────────────────────
function TheProblem() {
  return (
    <section id="the-problem" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader
          tag="The Problem"
          heading="A product without a shared foundation"
        />

        <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
          <p>
            [placeholder: synthesis paragraph 1 — connect the five findings to
            one root cause. The shape used in Reservations: &ldquo;the themes
            mapped to one root cause: Artemis had been built as N parallel
            products rather than one system.&rdquo;]
          </p>
          <p>
            [placeholder: synthesis paragraph 2 — what was at stake if nothing
            changed. Productivity tax, brand drift, hiring overhead, etc.]
          </p>
        </div>

        <ImagePlaceholder label="The Problem — fragmentation illustration" />

        {/* Problem Statement callout — two-tone styling preserved from Reservations */}
        <div className="flex flex-col gap-5 rounded-[8px] border-[1.5px] border-heading bg-[rgba(137,91,231,0.05)] p-[24px] md:gap-[20px]">
          <div className="flex items-center gap-2 w-full">
            <SparkleAiIcon size={26} className="shrink-0 text-heading" />
            <h3 className={H3_CLASS}>The Problem Statement</h3>
          </div>

          <p className="font-body font-normal text-lead md:text-lead-md lg:text-lead-lg">
            <span className="text-secondary">
              [placeholder: opening clause — the situation, in muted tone.]{" "}
            </span>
            <span className="text-heading underline decoration-solid [text-decoration-skip-ink:none]">
              [placeholder: closing clause — the directive, in heading tone.
              What needs to change, framed as a system-level shift.]
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Process
// TODO: Replace decision options + reasons with the real exploration story.
// ─────────────────────────────────────────────────────────────────────────────

type DesignOption = {
  label: string;
  title: string;
  pros?: string[];
  cons?: string[];
  reasons?: string[];
  shipped?: boolean;
};

type DesignDecision = {
  title: string;
  intro: string;
  options: DesignOption[];
};

const DESIGN_DECISIONS: DesignDecision[] = [
  {
    title: "Token naming",
    intro:
      "[placeholder: framing — how should tokens be named so they survive theme changes, brand updates, and new product surfaces?]",
    options: [
      {
        label: "Option A",
        title: "Semantic-only (e.g. text-primary, surface-elevated)",
        pros: ["[placeholder: pro — abstracts intent; theme-friendly.]"],
        cons: [
          "[placeholder: con — hides the actual value; harder for new contributors to learn.]",
          "[placeholder: con — naming arguments stall design reviews.]",
        ],
      },
      {
        label: "Option B",
        title: "Literal-only (e.g. grape-500, gray-100)",
        pros: ["[placeholder: pro — predictable; one-to-one with Figma styles.]"],
        cons: [
          "[placeholder: con — semantic intent is implicit; theme changes ripple everywhere.]",
        ],
      },
      {
        label: "Option C",
        title: "Two-tier — literal primitives + semantic aliases",
        reasons: [
          "[placeholder: reason — primitives stay stable; aliases carry intent.]",
          "[placeholder: reason — theme changes happen at the alias layer, not the primitive.]",
          "[placeholder: reason — newcomers learn primitives first, aliases second.]",
        ],
        shipped: true,
      },
    ],
  },
  {
    title: "Component API shape",
    intro:
      "[placeholder: framing — how much should component APIs lean on props vs. composition? Trade-offs around flexibility, learnability, and consistency.]",
    options: [
      {
        label: "Option A",
        title: "Props-heavy (every variant as a prop)",
        pros: ["[placeholder: pro — discoverable; one place to look up options.]"],
        cons: [
          "[placeholder: con — APIs balloon; combinatorial explosion of variants.]",
        ],
      },
      {
        label: "Option B",
        title: "Composition-only (slots and sub-components)",
        pros: ["[placeholder: pro — flexible; matches how the underlying primitives work.]"],
        cons: [
          "[placeholder: con — every consumer has to learn the composition pattern.]",
          "[placeholder: con — consistency leaks; two teams can compose the same primitives differently.]",
        ],
      },
      {
        label: "Option C",
        title: "Hybrid — props for variants, composition for content",
        reasons: [
          "[placeholder: reason — variants stay constrained; content stays flexible.]",
          "[placeholder: reason — the common path is the obvious path.]",
          "[placeholder: reason — composition is available when teams genuinely need it.]",
        ],
        shipped: true,
      },
    ],
  },
];

function OptionCard({ option }: { option: DesignOption }) {
  return (
    <div
      className={`flex flex-col gap-5 rounded-[16px] p-[20px] md:p-[24px] ${
        option.shipped
          ? "bg-[rgba(137,91,231,0.05)] border-[1.5px] border-heading"
          : "bg-surface"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={EYEBROW_CLASS}>{option.label}</span>
        {option.shipped && (
          <span className="inline-flex items-center gap-1 bg-primary text-white px-[10px] py-[3px] rounded-[4px] font-brand text-[10px] font-medium uppercase tracking-[1.2px]">
            <Check size={10} strokeWidth={2.5} />
            Shipped
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="flex flex-col gap-4">
          <p className="font-body text-lead md:text-lead-md font-medium text-heading">
            {option.title}
          </p>

          {option.shipped && option.reasons ? (
            <ol className="list-decimal ms-[20px] flex flex-col gap-[6px]">
              {option.reasons.map((r) => (
                <li
                  key={r}
                  className="font-body text-body md:text-body-md text-muted"
                >
                  {r}
                </li>
              ))}
            </ol>
          ) : (
            <ul className="flex flex-col gap-[6px]">
              {option.pros?.map((p) => (
                <li
                  key={p}
                  className="font-body text-body md:text-body-md text-muted flex gap-2"
                >
                  <span className="text-success font-medium shrink-0">+</span>
                  <span>{p}</span>
                </li>
              ))}
              {option.cons?.map((c) => (
                <li
                  key={c}
                  className="font-body text-body md:text-body-md text-muted flex gap-2"
                >
                  <span className="text-warning font-medium shrink-0">−</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ImagePlaceholder
          label={`${option.label} preview`}
          aspect="aspect-[4/3]"
          radius="rounded-[8px]"
        />
      </div>
    </div>
  );
}

function Process() {
  return (
    <section id="process" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[80px]">
        <SectionHeader
          tag="Process"
          heading="Foundations first, then components, then everything else"
          lead="[placeholder: lead — frame the sequencing decision. Tokens before components before patterns before docs. Why that order made the work compound instead of stall.]"
        />

        {/* Step 1 — Audit-first foundations */}
        <div className="flex flex-col gap-10 md:gap-[48px]">
          <div className="flex flex-col gap-5 md:gap-[24px]">
            <NumberedH3 num={1} title="Audit-first foundations" />

            <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
              <p>
                [placeholder: paragraph — the foundations work. Token
                architecture before any component, because every component
                consumes tokens and changing them later is expensive.]
              </p>
              <p>
                [placeholder: paragraph — how the audit data shaped the token
                set. Started from what existed, then reduced to the smallest
                useful primitive layer.]
              </p>
            </div>
          </div>

          <ImagePlaceholder label="Token architecture — primitive layer" />
          <ImagePlaceholder label="Token architecture — semantic layer" />
        </div>

        {/* Step 2 — Iteration & refinement */}
        <div className="flex flex-col gap-10 md:gap-[48px]">
          <div className="flex flex-col gap-5 md:gap-[24px]">
            <NumberedH3 num={2} title="Iteration & refinement" />

            <p className={LEAD_CLASS}>
              [placeholder: lead — where decisions had real consequences. Two
              of them — token naming and component API shape — best show the
              trade-offs.]
            </p>
          </div>

          {DESIGN_DECISIONS.map((decision) => (
            <div
              key={decision.title}
              className="flex flex-col gap-5 md:gap-[24px]"
            >
              <h4 className={H4_CLASS}>{decision.title}</h4>
              <p className={LEAD_CLASS}>{decision.intro}</p>

              <div className="flex flex-col gap-4 md:gap-5">
                {decision.options.map((opt) => (
                  <OptionCard key={opt.label} option={opt} />
                ))}
              </div>
            </div>
          ))}

          <p className={LEAD_CLASS}>
            [placeholder: closing paragraph — the same pattern played out
            across other decisions. Optionality at the right layer, opinion at
            the right layer.]
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The System
// TODO: Replace each sub-section body and impact caption with real content.
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_ITEMS = [
  {
    num: 1,
    title: "Foundations — tokens, type, colour, spacing",
    body: "[placeholder: describe the primitive + semantic token system, the type scale, the colour ramp, the spacing grid. What was the unit of consistency that everything else inherited from?]",
    impact: "[placeholder: stat — e.g. N tokens consolidated from M hex values]",
  },
  {
    num: 2,
    title: "Components — the core library",
    body: "[placeholder: describe the component library. How many components, organised by what taxonomy, with what variant strategy. What was deliberately not built?]",
    impact: "[placeholder: stat — e.g. N components covering ~X% of surfaces]",
  },
  {
    num: 3,
    title: "Patterns — composed flows and states",
    body: "[placeholder: describe pattern-level guidance. Multi-step forms, empty states, error states, loading states — composed from components, owned by the system.]",
    impact: "[placeholder: stat — e.g. M patterns adopted across N modules]",
  },
  {
    num: 4,
    title: "Documentation — usage guidance and governance",
    body: "[placeholder: describe how the system documents itself. Storybook + a docs site, do/don't examples, accessibility notes, version history. The docs are the product surface for the system.]",
    impact: "[placeholder: stat — e.g. avg time to find guidance dropped from X to Y]",
  },
  {
    num: 5,
    title: "Contribution model — how the system evolves",
    body: "[placeholder: describe the contribution model. Who can propose new components, what the review bar is, how requests get triaged. The system as a product, with a roadmap and a backlog.]",
    impact: "[placeholder: stat — e.g. N contributions accepted from M teams]",
  },
];

function TheSystem() {
  return (
    <section id="the-system" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[80px]">
        <SectionHeader
          tag="The System"
          heading="A foundation that the rest of Artemis could build on"
          lead="[placeholder: 1–2 sentence lead. Each piece of the system maps back to a finding from the audit. The constraint was to keep the surface area small enough to learn, deep enough to be useful.]"
        />

        {SYSTEM_ITEMS.map(({ num, title, body, impact }) => (
          <div key={num} className="flex flex-col gap-10 md:gap-[48px]">
            <div className="flex flex-col gap-5 md:gap-[24px]">
              <NumberedH3 num={num} title={title} />
              <p className={LEAD_CLASS}>{body}</p>
            </div>

            <div className="flex flex-col gap-5 md:gap-[24px]">
              <ImagePlaceholder label={`The System ${num} — ${title}`} />
              <p className="font-body font-normal text-caption md:text-caption-md lg:text-caption-lg text-success text-center uppercase">
                {impact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Adoption
// TODO: Replace metric stats + closing quote with real numbers and attribution.
// ─────────────────────────────────────────────────────────────────────────────
const METRICS: { stat: string; label: string }[] = [
  {
    stat: "[stat]",
    label:
      "[placeholder: adoption metric — e.g. % of new screens built entirely from system components].",
  },
  {
    stat: "[stat]",
    label:
      "[placeholder: velocity metric — e.g. time-to-build a new screen, before vs. after the system].",
  },
  {
    stat: "[stat]",
    label:
      "[placeholder: consistency metric — e.g. drop in one-off colour or spacing values across the codebase].",
  },
];

function Adoption() {
  return (
    <section id="adoption" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <SectionHeader
          tag="impact"
          heading="The numbers that tracked the shift"
          lead="[placeholder: 1-sentence lead. Three metrics — each tied to a finding from the audit.]"
        />

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

        <figure className="flex flex-col gap-4 border-l-2 border-grape pl-6 py-1">
          <blockquote>
            <p className={`${LEAD_CLASS} italic`}>
              &ldquo;[placeholder: closing quote — a designer or engineer
              describing how the system changed their day-to-day. Keep it
              concrete: a habit that disappeared, a meeting that didn&apos;t
              need to happen, a question that stopped being asked.]&rdquo;
            </p>
          </blockquote>
          <figcaption className="font-body text-[13px] leading-[20px] text-muted">
            — [placeholder: Name], [placeholder: Role], Enchanting Travels
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection
// TODO: Rewrite with real lessons learned. Current copy is scaffolding only.
// ─────────────────────────────────────────────────────────────────────────────
function Reflection() {
  return (
    <section id="reflection" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-5 w-full md:gap-[24px]">
        <SectionHeader tag="Reflection" heading="What I learned" />

        <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
          <p>
            [placeholder: paragraph 1 — the biggest surprise. Something
            counter-intuitive about building a DS that you only learned by
            doing it. The shape used in Reservations: &ldquo;the real problem
            lived in workarounds&rdquo; — find the DS analogue.]
          </p>
          <p>
            [placeholder: paragraph 2 — a deliberate bet that paid off. A
            non-obvious sequencing or tooling choice (tokens before
            components, primitives before aliases, governance before scale)
            and why it worked.]
          </p>
          <p>
            [placeholder: paragraph 3 — what you&apos;d carry forward. The
            framing or principle that made decisions easier across the
            project, and how it generalises beyond DS work.]
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
      <Background />
      <Audit />
      <Findings />
      <TheProblem />
      <Process />
      <TheSystem />
      <Adoption />
      <Reflection />
    </CaseStudyLayout>
  );
}
