import type { Metadata } from "next";
import { Shield, AlertTriangle, TrendingDown, Users } from "lucide-react";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import {
  NumberedH3,
  ImagePlaceholder,
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
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";

export const metadata: Metadata = {
  title: "Travel Insurance Integration · Ashmik Ragesh",
  description:
    "Designed an in-flow travel insurance option for the Artemis platform — achieving 52% adoption, reducing booking drop-offs by 15%, and generating $125K in Q1 revenue.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",    label: "Overview"    },
  { id: "at-a-glance", label: "At a Glance" },
  { id: "background",  label: "Background"  },
  { id: "research",    label: "Research"    },
  { id: "insights",    label: "Insights"    },
  { id: "the-problem", label: "The Problem" },
  { id: "process",     label: "Process"     },
  { id: "solution",    label: "Solution"    },
  { id: "impact",      label: "Impact"      },
  { id: "reflection",  label: "Reflection"  },
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
              {"< November 2024 >"}
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <h1 className={H1_CLASS}>
              Adding travel insurance to the Artemis guest booking experience
            </h1>
            <p className={LEAD_CLASS}>
              Designed an in-flow travel insurance option for the Artemis
              platform — achieving 52% adoption, reducing booking drop-offs by
              15%, and generating $125K in Q1 revenue.
            </p>
          </div>
        </div>

        <ImagePlaceholder label="Artemis — insurance selection final design" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: At a Glance
// ─────────────────────────────────────────────────────────────────────────────
function AtAGlance() {
  const columns = [
    {
      heading: "My Role",
      content: (
        <>
          Lead UX Designer. Owned end-to-end — research, iterations, final
          design, and engineering handoff.
        </>
      ),
    },
    {
      heading: "Timeline",
      content: (
        <>
          4 weeks design
          <br />
          Launched Dec 2024
        </>
      ),
    },
    {
      heading: "Tools",
      content: (
        <>
          Figma
          <br />
          Mixpanel
          <br />
          Intercom
          <br />
          Slack
        </>
      ),
    },
    {
      heading: "Team",
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
// ─────────────────────────────────────────────────────────────────────────────
function Background() {
  return (
    <section id="background" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <div className="flex flex-col gap-5 w-full md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< background >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>
              The guest booking flow — and the gap in it
            </h2>
          </div>
          <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
            <p>
              The guest booking flow is Enchanting Travels&apos; only direct
              digital touchpoint with guests — where high-value trips
              ($5,000–$50,000+) are formally confirmed: traveller details,
              payment, and trip sign-off.
            </p>
            <p>
              It&apos;s the moment guests are most open to insurance. They&apos;ve
              committed emotionally and are about to pay. Yet the platform had
              no option for it — guests had to ask their TC separately or find
              coverage on their own, mid-booking.
            </p>
          </div>
        </div>

        <ImagePlaceholder label="Artemis booking flow — before state" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Research
// ─────────────────────────────────────────────────────────────────────────────
const RESEARCH_QUOTES = [
  {
    text: "Is travel insurance included? Do I need to call someone to add it?",
    attribution: "— Guest, via Intercom support log",
  },
  {
    text: "Most guests asking about insurance are high-value, long-haul travellers. When they can't find it in the platform, they pause — and sometimes don't come back.",
    attribution: "— Travel Consultant, internal interview",
  },
];

function Research() {
  return (
    <section id="research" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <div className="flex flex-col gap-5 w-full md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< research >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>
              Finding the leak before designing the fix
            </h2>
          </div>
          <p className={LEAD_CLASS}>
            Before touching a frame, I needed to understand where guests were
            falling off and why. Research ran across three tracks simultaneously.
          </p>
        </div>

        <div className="flex flex-col gap-5 md:gap-[24px]">
          <h3 className={H3_CLASS}>Funnel analytics</h3>
          <p className={LEAD_CLASS}>
            Mixpanel data showed a clear drop-off spike at the payment step —
            the point where guests encountered no insurance option and had to
            leave the platform to seek coverage elsewhere. 25% of users were
            abandoning at this exact step, translating to an estimated $250K of
            unrealised insurance revenue per quarter.
          </p>
        </div>

        <div className="flex flex-col gap-5 md:gap-[24px]">
          <h3 className={H3_CLASS}>Support log audit</h3>
          <p className={LEAD_CLASS}>
            A 3-month review of Intercom email and chat logs revealed a
            consistent pattern: guests pausing mid-booking to ask about
            insurance. The question was never about the product — it was always
            about where to find it.
          </p>
          <div className="flex flex-col gap-5 md:gap-6 mt-2">
            {RESEARCH_QUOTES.map(({ text, attribution }) => (
              <blockquote
                key={attribution}
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

        <div className="flex flex-col gap-5 md:gap-[24px]">
          <h3 className={H3_CLASS}>TC interviews & guest surveys</h3>
          <p className={LEAD_CLASS}>
            Travel Consultants who handle post-booking queries were surveyed
            and interviewed. They confirmed what the data showed — and added
            a behavioural nuance: the guests most likely to pause were
            first-time travellers and those booking long-haul, high-value
            trips. Exactly the guests Enchanting Travels most wants to retain.
            When TCs informally asked guests whether they&apos;d want in-flow
            insurance, 80% said yes.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Insights
// ─────────────────────────────────────────────────────────────────────────────
const INSIGHT_CARDS = [
  {
    icon: <TrendingDown size={26} className="text-grape" strokeWidth={2} />,
    title: "25% drop-off at checkout",
    description:
      "Funnel data confirmed a consistent abandonment spike at the payment step — the exact point where no insurance option existed.",
  },
  {
    icon: <AlertTriangle size={26} className="text-grape" strokeWidth={2} />,
    title: "Guests lacked trip confidence",
    description:
      "Support logs showed guests pausing to ask about insurance, especially on high-value or first international trips. Uncertainty at checkout translated directly to abandonment.",
  },
  {
    icon: <Users size={26} className="text-grape" strokeWidth={2} />,
    title: "TCs carrying the operational load",
    description:
      "Without an in-flow option, Travel Consultants were manually handling all post-booking insurance queries — a scaling bottleneck that grew with the business.",
  },
  {
    icon: <Shield size={26} className="text-grape" strokeWidth={2} />,
    title: "$250K/quarter in missed revenue",
    description:
      "The drop-offs weren't just a UX problem. Analytics confirmed the business was losing a significant, quantifiable revenue stream each quarter.",
  },
];

function Insights() {
  return (
    <section id="insights" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< research insights >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>Four signals pointing to the same gap</h2>
          </div>
          <p className={LEAD_CLASS}>
            Every research track — analytics, support logs, TC interviews —
            converged on the same finding: guests wanted insurance but the
            platform gave them no path to it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 md:gap-[24px]">
          {INSIGHT_CARDS.map(({ icon, title, description }) => (
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
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The Problem
// ─────────────────────────────────────────────────────────────────────────────
function TheProblem() {
  return (
    <section id="the-problem" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <div className="flex flex-col gap-5 w-full md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< the problem >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>
              Insurance was available — just nowhere to be found
            </h2>
          </div>
          <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
            <p>
              Enchanting Travels offered insurance. Guests wanted it. The
              problem was structural: there was no path between the two inside
              Artemis. Guests who wanted coverage had to exit the booking flow,
              contact a consultant separately, and re-enter. Most didn&apos;t.
            </p>
            <p>
              The result was a gap that hurt in both directions — guests lost
              confidence and abandoned; the business lost revenue and burdened
              its TC team with avoidable queries. A single design decision had
              been quietly creating both problems for years.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-[8px] border-[1.5px] border-heading bg-[rgba(137,91,231,0.05)] p-[24px] md:gap-[20px]">
          <div className="flex items-center gap-2 w-full">
            <SparkleAiIcon size={26} className="shrink-0 text-heading" />
            <h3 className={H3_CLASS}>The Problem Statement</h3>
          </div>
          <p className="font-body font-normal text-lead md:text-lead-md lg:text-lead-lg">
            <span className="text-secondary">
              Guests booking through Artemis had no in-flow option to add
              travel insurance.{" "}
            </span>
            <span className="text-heading underline decoration-solid [text-decoration-skip-ink:none]">
              This forced them off-platform at the moment of highest
              commitment — the checkout step — causing abandonment, reducing
              guest confidence, and costing the business an estimated $250K in
              unrealised revenue each quarter.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Process  (3 iterations)
// ─────────────────────────────────────────────────────────────────────────────
type IterationItem = {
  label: string;
  title: string;
  insight: string;
  worked: string[];
  didntWork: string[];
};

const ITERATIONS: IterationItem[] = [
  {
    label: "Iteration 1",
    title: "Insurance as a dedicated booking step",
    insight:
      "Insurance needs to feel like a natural part of booking — not a separate task.",
    worked: [
      "Clear plan differentiation between Basic and CFAR",
      "Right-side pricing context kept total trip cost visible",
      '"Recommended" tag created a subtle nudge toward the higher-value plan',
    ],
    didntWork: [
      "Felt like a flow interruption — a separate page added friction guests didn't expect",
      "Drop-off at this step increased; guests felt the process had been derailed",
      "Value communication was unclear — 'What does it cover?' wasn't prominent enough",
    ],
  },
  {
    label: "Iteration 2",
    title: "Insurance embedded in the traveller details step",
    insight:
      "Important decisions still need enough visual weight and narrative framing to signal value.",
    worked: [
      "No page break reduced cognitive load — insurance felt less intimidating",
      "Improved microcopy helped demystify what guests were paying for",
      "One-screen flow aligned with the 'setting up my trip' mental model",
    ],
    didntWork: [
      "Buried visual hierarchy — the module read as a continuation of the form, not a decision",
      "No visual affordance drew the eye to insurance; easily missed on large screens",
      "Microcopy still too technical — built information, not emotional confidence",
    ],
  },
  {
    label: "Iteration 3",
    title: "Visually-elevated, embedded insurance selection",
    insight: "Shipped.",
    worked: [
      "Clear side-by-side plan comparison — Basic vs CFAR with benefit callouts",
      '"POPULAR" badge and placement nudged guests without overwhelming them',
      "Value-first copy — 'Cancel for any reason' prioritised over technical terms",
      "Shield icons and checkmarks reinforced trust and safety",
      '"View more benefits" link supported detail-oriented users without cluttering the default view',
      "Scalable layout — easy to add future plans without redesign",
    ],
    didntWork: [],
  },
];

function Process() {
  return (
    <section id="process" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[80px]">
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< process >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>
              Three iterations to find the right integration point
            </h2>
          </div>
          <p className={LEAD_CLASS}>
            With the problem defined, the design question became: where in the
            booking flow should insurance live — and how much visual weight
            should it carry? Three iterations tested different answers, each
            building on what the previous one revealed.
          </p>
        </div>

        <div className="flex flex-col gap-[48px] md:gap-[80px]">
          {ITERATIONS.map(({ label, title, insight, worked, didntWork }, i) => {
            const isShipped = didntWork.length === 0;
            return (
              <div key={label} className="flex flex-col gap-[24px] md:gap-[32px]">
                <div className="flex flex-col gap-5 md:gap-[24px]">
                  <NumberedH3 num={i + 1} title={title} />

                  <div
                    className={`flex flex-col gap-5 rounded-[16px] p-[20px] md:p-[24px] ${
                      isShipped
                        ? "bg-[rgba(137,91,231,0.05)] border-[1.5px] border-heading"
                        : "bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={EYEBROW_CLASS}>{label}</span>
                      {isShipped && (
                        <span className="inline-flex items-center gap-1 bg-primary text-white px-[10px] py-[3px] rounded-[4px] font-brand text-[10px] font-medium uppercase tracking-[1.2px]">
                          Shipped
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div className="flex flex-col gap-4">
                        {isShipped ? (
                          <ul className="flex flex-col gap-[6px]">
                            {worked.map((item) => (
                              <li
                                key={item}
                                className="font-body text-body md:text-body-md text-muted flex gap-2"
                              >
                                <span className="text-success font-medium shrink-0">+</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="flex flex-col gap-[6px]">
                            {worked.map((item) => (
                              <li
                                key={item}
                                className="font-body text-body md:text-body-md text-muted flex gap-2"
                              >
                                <span className="text-success font-medium shrink-0">+</span>
                                <span>{item}</span>
                              </li>
                            ))}
                            {didntWork.map((item) => (
                              <li
                                key={item}
                                className="font-body text-body md:text-body-md text-muted flex gap-2"
                              >
                                <span className="text-warning font-medium shrink-0">−</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <ImagePlaceholder
                        label={`${label} — design preview`}
                        aspect="aspect-[4/3]"
                        radius="rounded-[8px]"
                      />
                    </div>
                  </div>
                </div>

                <p className={`italic ${LEAD_CLASS}`}>
                  Key insight: &ldquo;{insight}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution
// ─────────────────────────────────────────────────────────────────────────────
const SOLUTION_ITEMS = [
  {
    num: 1,
    title: "Placed just before payment — not as a separate step",
    body: "Insurance appears at the highest-intent moment in the booking journey: right before payment, as part of the existing flow. This placement was deliberate — guests are already in a commitment mindset. Introducing insurance here feels like a natural extension of protecting their investment, not an interruption of it.",
  },
  {
    num: 2,
    title: "Side-by-side plan comparison with value-first copy",
    body: 'The final design presents Basic and CFAR plans in a clear two-column layout, with benefits written in plain language. "Cancel for any reason" leads over technical terms. A "POPULAR" badge creates a gentle nudge without overriding guest autonomy. The structure makes the comparison effortless — guests don\'t need to remember what one plan said before reading the next.',
  },
  {
    num: 3,
    title: "Trust-first visual language",
    body: "Shield icons, checkmarks, and a clear colour system were chosen specifically because insurance is an anxiety-laden category. Guests aren't uncertain about what insurance is — they're uncertain whether they can trust it. Every visual decision reinforced safety and transparency rather than trying to persuade.",
  },
  {
    num: 4,
    title: "Recommended plan auto-selected to reduce decision fatigue",
    body: "The CFAR plan is pre-selected as the recommended option. This reduces the cognitive load of a cold decision mid-checkout — guests can accept the default, switch, or skip entirely. The skip option is always visible and never hidden, which preserved trust while improving adoption.",
  },
];

function Solution() {
  return (
    <section id="solution" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[80px]">
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< solution >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>
              Embedded, trustworthy, and easy to skip
            </h2>
          </div>
          <p className={LEAD_CLASS}>
            The final solution wasn&apos;t about designing a better insurance
            screen — it was about finding the right integration point and giving
            the choice enough visual weight to be noticed, without turning it
            into a barrier.
          </p>
        </div>

        {SOLUTION_ITEMS.map(({ num, title, body }) => (
          <div key={num} className="flex flex-col gap-10 md:gap-[48px]">
            <div className="flex flex-col gap-5 md:gap-[24px]">
              <NumberedH3 num={num} title={title} />
              <p className={LEAD_CLASS}>{body}</p>
            </div>
            <ImagePlaceholder label={`Solution ${num} — ${title}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Impact
// ─────────────────────────────────────────────────────────────────────────────
const METRICS: { stat: string; label: string }[] = [
  {
    stat: "52%",
    label:
      "Insurance adoption rate — up from 7% before the integration. Clear hierarchy, value-first copy, and seamless flow placement drove the shift.",
  },
  {
    stat: "$125K",
    label:
      "Additional revenue generated in Q1 2025 — the first full quarter post-launch. A new revenue stream with minimal tech overhead.",
  },
  {
    stat: "15%",
    label:
      "Reduction in booking drop-off at checkout. Removing the off-platform detour gave guests a complete, confident path to confirmation.",
  },
];

function Impact() {
  return (
    <section id="impact" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< impact >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>Numbers from the first quarter post-launch</h2>
          </div>
          <p className={LEAD_CLASS}>
            Three metrics — each mapping directly to one of the gaps research
            identified. The adoption jump from 7% to 52% was the clearest signal
            that the integration point and design approach were right.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-[24px]">
          {METRICS.map(({ stat, label }) => (
            <div
              key={stat}
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
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection
// ─────────────────────────────────────────────────────────────────────────────
function Reflection() {
  return (
    <section id="reflection" className={`bg-white ${SECTION_PAD}`}>
      <div className="flex flex-col gap-5 w-full md:gap-[24px]">
        <div className="flex flex-col gap-3">
          <div className="-rotate-3 w-fit">
            <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
              {"< reflection >"}
            </span>
          </div>
          <h2 className={H2_CLASS}>What I learned</h2>
        </div>
        <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
          <p>
            The biggest lesson was about placement over polish. The first
            iteration was visually reasonable — clear plans, good copy, clean
            layout. But it was wrong because of where it sat in the flow, not
            how it looked. Iteration 1 failed because it interrupted. Iteration
            3 succeeded because it extended. That distinction — between a step
            that interrupts and a choice that extends — became the design
            principle that guided everything.
          </p>
          <p>
            The research phase paid off disproportionately here. Without the
            Mixpanel data confirming the exact drop-off point, I might have
            placed the insurance module earlier in the flow — which would have
            reduced adoption, not increased it. Guests are most receptive to
            protecting a trip immediately before they pay for it. That&apos;s
            not an intuition; it&apos;s in the data.
          </p>
          <p>
            If I had more time, I&apos;d invest in post-purchase satisfaction
            tracking — specifically whether guests who purchased insurance felt
            more confident about their trip overall, and whether that translated
            to higher rebooking rates. The adoption and revenue numbers are
            strong, but the longer-term signal — does insurance increase guest
            lifetime value? — is the metric I&apos;d want to follow.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtemisInsurancePage() {
  return (
    <CaseStudyLayout sections={SECTIONS} backHref="/#works">
      <Overview />
      <AtAGlance />
      <Background />
      <Research />
      <Insights />
      <TheProblem />
      <Process />
      <Solution />
      <Impact />
      <Reflection />
    </CaseStudyLayout>
  );
}
