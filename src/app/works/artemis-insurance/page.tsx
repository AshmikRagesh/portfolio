import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import {
  Hero,
  Chapter,
  Copy,
  Lead,
  Meta,
  Visual,
  Figure,
  Quote,
  Outcome,
} from "@/components/case-study";

export const metadata: Metadata = {
  title: "Travel Insurance Integration · Ashmik Ragesh",
  description:
    "Designed an in-flow travel insurance option for the Artemis platform — achieving 52% adoption, reducing booking drop-offs by 15%, and generating $125K in Q1 revenue.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "context",    label: "Context"    },
  { id: "research",   label: "Research"   },
  { id: "problem",    label: "Problem"    },
  { id: "process",    label: "Process"    },
  { id: "solution",   label: "Solution"   },
  { id: "impact",     label: "Impact"     },
  { id: "reflection", label: "Reflection" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 00 Context
// ─────────────────────────────────────────────────────────────────────────────
function Context() {
  return (
    <Chapter id="context" num={0} title="Context">
      <Copy>
        <Meta
          items={[
            { label: "Role", value: "Lead UX Designer" },
            { label: "Timeline", value: <>4 weeks design<br />Launched Dec 2024</> },
            {
              label: "Team",
              value: <>Vishwa (Design), Parv (PM), Aman (Frontend), Swapnil Negi (Backend)</>,
            },
            { label: "Tools", value: "Figma, Mixpanel, Intercom, Slack" },
          ]}
        />
        <h3>What is the guest booking flow?</h3>
        <p>
          The guest booking flow is Enchanting Travels&apos; only direct digital
          touchpoint with guests — where high-value trips ($5,000–$50,000+) are
          formally confirmed: traveller details, payment, and trip sign-off.
        </p>
        <p>
          It&apos;s the moment guests are most open to insurance. They&apos;ve
          committed emotionally and are about to pay. Yet the platform had no
          option for it — guests had to ask their TC separately or find coverage
          on their own, mid-booking.
        </p>
        <h3>Goal</h3>
        <p>
          Add travel insurance to the Artemis guest booking experience without
          slowing guests down. I owned it end-to-end — research, iterations,
          final design, and engineering handoff.
        </p>
      </Copy>
      <Visual>
        <Figure label="Artemis — insurance selection final design" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 01 Research
// ─────────────────────────────────────────────────────────────────────────────
const INSIGHTS = [
  {
    title: "25% drop-off at checkout.",
    description:
      "Funnel data confirmed a consistent abandonment spike at the payment step — the exact point where no insurance option existed.",
  },
  {
    title: "Guests lacked trip confidence.",
    description:
      "Support logs showed guests pausing to ask about insurance, especially on high-value or first international trips. Uncertainty at checkout translated directly to abandonment.",
  },
  {
    title: "TCs carrying the operational load.",
    description:
      "Without an in-flow option, Travel Consultants were manually handling all post-booking insurance queries — a scaling bottleneck that grew with the business.",
  },
  {
    title: "$250K/quarter in missed revenue.",
    description:
      "The drop-offs weren't just a UX problem. Analytics confirmed the business was losing a significant, quantifiable revenue stream each quarter.",
  },
];

function Research() {
  return (
    <Chapter id="research" num={1} title="Finding the leak before designing the fix">
      <Copy>
        <Lead>
          Before touching a frame, I needed to understand where guests were
          falling off and why.
        </Lead>
        <p>Research ran across three tracks simultaneously.</p>
        <h3>Funnel analytics</h3>
        <p>
          Mixpanel data showed a clear drop-off spike at the payment step — the
          point where guests encountered no insurance option and had to leave the
          platform to seek coverage elsewhere. 25% of users were abandoning at
          this exact step, translating to an estimated $250K of unrealised
          insurance revenue per quarter.
        </p>
        <h3>Support log audit</h3>
        <p>
          A 3-month review of Intercom email and chat logs revealed a consistent
          pattern: guests pausing mid-booking to ask about insurance. The question
          was never about the product — it was always about where to find it.
        </p>
        <Quote name="Guest" role="Intercom support log">
          Is travel insurance included? Do I need to call someone to add it?
        </Quote>
        <Quote name="Travel Consultant" role="Internal interview">
          Most guests asking about insurance are high-value, long-haul travellers.
          When they can&apos;t find it in the platform, they pause — and sometimes
          don&apos;t come back.
        </Quote>
        <h3>TC interviews &amp; guest surveys</h3>
        <p>
          Travel Consultants who handle post-booking queries were surveyed and
          interviewed. They confirmed what the data showed — and added a
          behavioural nuance: the guests most likely to pause were first-time
          travellers and those booking long-haul, high-value trips. Exactly the
          guests Enchanting Travels most wants to retain. When TCs informally
          asked guests whether they&apos;d want in-flow insurance, 80% said yes.
        </p>
        <h3>Four signals pointing to the same gap</h3>
        <p>
          Every research track — analytics, support logs, TC interviews —
          converged on the same finding: guests wanted insurance but the platform
          gave them no path to it.
        </p>
        <ul>
          {INSIGHTS.map(({ title, description }) => (
            <li key={title}>
              <strong>{title}</strong> {description}
            </li>
          ))}
        </ul>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 02 Problem
// ─────────────────────────────────────────────────────────────────────────────
function Problem() {
  return (
    <Chapter id="problem" num={2} title="Insurance was available — just nowhere to be found">
      <Copy>
        <p>
          Enchanting Travels offered insurance. Guests wanted it. The problem was
          structural: there was no path between the two inside Artemis. Guests who
          wanted coverage had to exit the booking flow, contact a consultant
          separately, and re-enter. Most didn&apos;t.
        </p>
        <p>
          The result was a gap that hurt in both directions — guests lost
          confidence and abandoned; the business lost revenue and burdened its TC
          team with avoidable queries. A single design decision had been quietly
          creating both problems for years.
        </p>
        <h3>The problem statement</h3>
        <Lead>
          Guests had no in-flow way to add travel insurance — so they left at the
          moment of highest commitment, costing an estimated $250K a quarter.
        </Lead>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 03 Process
// ─────────────────────────────────────────────────────────────────────────────
const ITERATIONS = [
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
    label: "Iteration 3 · Shipped",
    title: "Visually-elevated, embedded insurance selection",
    insight: "",
    worked: [
      "Clear side-by-side plan comparison — Basic vs CFAR with benefit callouts",
      '"POPULAR" badge and placement nudged guests without overwhelming them',
      "Value-first copy — 'Cancel for any reason' prioritised over technical terms",
      "Shield icons and checkmarks reinforced trust and safety",
      '"View more benefits" link supported detail-oriented users without cluttering the default view',
      "Scalable layout — easy to add future plans without redesign",
    ],
    didntWork: [] as string[],
  },
];

function Process() {
  return (
    <Chapter id="process" num={3} title="Three iterations to find the right integration point">
      <Copy>
        <Lead>
          Where in the booking flow should insurance live — and how much visual
          weight should it carry?
        </Lead>
        <p>
          Three iterations tested different answers, each building on what the
          previous one revealed.
        </p>
      </Copy>
      {ITERATIONS.map(({ label, title, insight, worked, didntWork }) => (
        <div key={label}>
          <Visual narrow>
            <Figure label={label} caption={title} />
          </Visual>
          <Copy>
            <h3>{title}</h3>
            <p><strong>What worked</strong></p>
            <ul>
              {worked.map((item) => <li key={item}>{item}</li>)}
            </ul>
            {didntWork.length > 0 && (
              <>
                <p><strong>What didn&apos;t</strong></p>
                <ul>
                  {didntWork.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            )}
            {insight && <p>Key insight: &ldquo;{insight}&rdquo;</p>}
          </Copy>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 04 Solution
// ─────────────────────────────────────────────────────────────────────────────
const SOLUTION_ITEMS = [
  {
    title: "Placed just before payment — not as a separate step",
    body: "Insurance appears at the highest-intent moment in the booking journey: right before payment, as part of the existing flow. This placement was deliberate — guests are already in a commitment mindset. Introducing insurance here feels like a natural extension of protecting their investment, not an interruption of it.",
  },
  {
    title: "Side-by-side plan comparison with value-first copy",
    body: 'The final design presents Basic and CFAR plans in a clear two-column layout, with benefits written in plain language. "Cancel for any reason" leads over technical terms. A "POPULAR" badge creates a gentle nudge without overriding guest autonomy. The structure makes the comparison effortless — guests don\'t need to remember what one plan said before reading the next.',
  },
  {
    title: "Trust-first visual language",
    body: "Shield icons, checkmarks, and a clear colour system were chosen specifically because insurance is an anxiety-laden category. Guests aren't uncertain about what insurance is — they're uncertain whether they can trust it. Every visual decision reinforced safety and transparency rather than trying to persuade.",
  },
  {
    title: "Recommended plan auto-selected to reduce decision fatigue",
    body: "The CFAR plan is pre-selected as the recommended option. This reduces the cognitive load of a cold decision mid-checkout — guests can accept the default, switch, or skip entirely. The skip option is always visible and never hidden, which preserved trust while improving adoption.",
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={4} title="Embedded, trustworthy, and easy to skip">
      <Copy>
        <p>
          The final solution wasn&apos;t about designing a better insurance screen
          — it was about finding the right integration point and giving the choice
          enough visual weight to be noticed, without turning it into a barrier.
        </p>
      </Copy>
      {SOLUTION_ITEMS.map(({ title, body }) => (
        <div key={title}>
          <Visual>
            <Figure label={title} />
          </Visual>
          <Copy>
            <h3>{title}</h3>
            <p>{body}</p>
          </Copy>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 05 Impact
// ─────────────────────────────────────────────────────────────────────────────
function Impact() {
  return (
    <Chapter id="impact" num={5} title="Numbers from the first quarter post-launch">
      <Copy>
        <p>
          Three metrics — each mapping directly to one of the gaps research
          identified. The adoption jump from 7% to 52% was the clearest signal that
          the integration point and design approach were right.
        </p>
        <Outcome
          metric="52%"
          title="Insurance adoption"
          stats={[
            {
              value: "$125K",
              label: "Additional revenue in Q1 2025 — the first full quarter post-launch.",
            },
            {
              value: "15%",
              label: "Fewer booking drop-offs at checkout, with no off-platform detour.",
            },
          ]}
        >
          <p>
            Up from 7% before the integration. Clear hierarchy, value-first copy,
            and seamless flow placement drove the shift.
          </p>
        </Outcome>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 06 Reflection
// ─────────────────────────────────────────────────────────────────────────────
function Reflection() {
  return (
    <Chapter id="reflection" num={6} title="What I learned">
      <Copy>
        <h3>Placement over polish</h3>
        <p>
          The first iteration was visually reasonable — clear plans, good copy,
          clean layout. But it was wrong because of where it sat in the flow, not
          how it looked. Iteration 1 failed because it interrupted. Iteration 3
          succeeded because it extended. That distinction — between a step that
          interrupts and a choice that extends — became the design principle that
          guided everything.
        </p>
        <h3>The research paid for itself</h3>
        <p>
          Without the Mixpanel data confirming the exact drop-off point, I might
          have placed the insurance module earlier in the flow — which would have
          reduced adoption, not increased it. Guests are most receptive to
          protecting a trip immediately before they pay for it. That&apos;s not an
          intuition; it&apos;s in the data.
        </p>
        <h3>What I&apos;d measure next</h3>
        <p>
          If I had more time, I&apos;d invest in post-purchase satisfaction
          tracking — specifically whether guests who purchased insurance felt more
          confident about their trip overall, and whether that translated to higher
          rebooking rates.
        </p>
        <p className="cs-closing">
          The adoption and revenue numbers are strong, but the longer-term signal —
          does insurance increase guest lifetime value? — is the metric I&apos;d
          want to follow.
        </p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtemisInsurancePage() {
  return (
    <CaseStudyLayout sections={SECTIONS}>
      <Hero title="Artemis Insurance" date="November 2024" color="#F3E4F7" />
      <Context />
      <Research />
      <Problem />
      <Process />
      <Solution />
      <Impact />
      <Reflection />
    </CaseStudyLayout>
  );
}
