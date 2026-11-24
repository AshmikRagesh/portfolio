import type { Metadata } from "next";
import { ArrowCounterClockwise, Scales, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { reels } from "@/content/reels";
import {
  Hero,
  Chapter,
  Copy,
  Meta,
  Visual,
  Figure,
  ChatQuotes,
  DesignQuestion,
  CardGrid,
  ProblemStatement,
  ProsCons,
  OptionCard,
  ResultsCard,
  Pointers,
  NextCase,
  Highlight,
} from "@/components/case-study";

export const metadata: Metadata = {
  title: "Travel Insurance Integration · Ashmik Ragesh",
  description:
    "Designed a travel protection section inside the Artemis traveller details step, so Enchanting Travels guests can add insurance without leaving the booking.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview", label: "Overview" },
  { id: "the-problem", label: "The Problem" },
  { id: "discovery", label: "Discovery" },
  { id: "exploration", label: "Exploration" },
  { id: "solution", label: "Solution" },
  { id: "outcome", label: "Results" },
  { id: "reflection", label: "Reflection" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview  (with Role / Team / Timeline)
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <Chapter id="overview" num={0} title="Overview">
      <Copy>
        <p>
          Guests booking a trip with Enchanting Travels had no way to add
          travel insurance, so they had to ask their travel consultant, who
          arranged it through an outside provider. I designed a travel
          protection section inside the traveller details step, with <Highlight>two
          plans side by side that guests can add without leaving the
          booking</Highlight>. It launched in December 2024, and adoption has since
          gone from 7% to 52%.
        </p>
        <Meta
          role="End-to-end Design & Developer Handoff"
          team="Ashmik Ragesh (Design), Anish (Project Manager), Muzamil (Engineering)"
          timeline={<>November – December 2024<br />1.5 weeks of design · Launched in December 2024</>}
        />
      </Copy>
      <Visual>
        <Figure name="The travel protection section in the traveller details step" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Discovery  (how the problem came up, what we checked, and the reframe)
// ─────────────────────────────────────────────────────────────────────────────
// Facts from case-studies/artemis-insurance-notes.md (my-portfolio), confirmed by Ashmik
// 24 Nov 2026. The conversation is paraphrased: it happened, the wording is reconstructed.
const CONVERSATION = [
  { text: "Can I add travel insurance to this trip? I couldn’t find it anywhere in the booking.", from: "Guest" },
  { text: "We don’t sell insurance ourselves, but I can arrange cover through an outside provider for you.", from: "Travel consultant" },
  { text: "So I have to sort that out separately before I pay?", from: "Guest" },
  { text: "Guests keep coming back to us to add insurance, and we’re arranging it one booking at a time.", from: "Travel consultant, to the project team" },
];

// What the design had to do, one priority per finding; each matches the final Figma design
const PRIORITIES = [
  {
    icon: <ShieldCheck size={28} weight="fill" className="text-grape" />,
    title: "Add cover without leaving the booking",
    description: "Guests choose insurance in the traveller details step, so no one has to ask a consultant.",
  },
  {
    icon: <Scales size={28} weight="fill" className="text-grape" />,
    title: "Compare plans at a glance",
    description: "Two plans side by side, each with what it covers and its price, so guests can decide on their own.",
  },
  {
    icon: <ArrowCounterClockwise size={28} weight="fill" className="text-grape" />,
    title: "Easy to change or remove",
    description: "The recommended plan is added by default, and one tap removes it, so guests stay in control.",
  },
];

function Discovery() {
  return (
    <Chapter id="discovery" num={2} title="From a consultant’s request to a design question">
      <Copy>
        <p>
          The problem came from the front line. Travel consultants told Anish,
          our project manager, that <Highlight>guests kept asking them to add travel
          insurance</Highlight> to their trips. The team picked it up and brought me
          in. We checked drop-off rates in the Artemis booking flow and talked
          to guests directly.
        </p>
      </Copy>
      <Visual>
        <Figure label="The Artemis booking flow before insurance" />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>What we heard</h3>
          {/* TODO: confirm the exact number interviewed (Ashmik: "around 8 to 9") */}
          <p>
            We interviewed eight frequent guests about what bothered them in the
            booking flow. Some raised other issues, but <Highlight>every one of them
            mentioned insurance</Highlight>, and all of them wanted to add it while
            they booked. With no way to do that, they went back to their
            consultant, who arranged cover through an outside provider. A typical
            exchange went like this:
          </p>
          <ChatQuotes label="A typical exchange between a guest and a travel consultant, paraphrased" items={CONVERSATION} />
        </Copy>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>From a request to a design question</h3>
          <p>
            The request was &ldquo;guests keep asking consultants for
            insurance&rdquo;. The research showed something more specific: <Highlight>guests
            didn&apos;t want to ask anyone</Highlight>. They wanted to add cover
            themselves, while they booked. That turned the request into one
            question:
          </p>
          <DesignQuestion>
            How might we let guests add travel insurance on their own, right in
            the booking flow?
          </DesignQuestion>
          <p>The findings gave the design three priorities:</p>
        </Copy>
        <Visual>
          <CardGrid items={PRIORITIES} />
        </Visual>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The Problem
// ─────────────────────────────────────────────────────────────────────────────
function TheProblem() {
  return (
    <Chapter id="the-problem" num={1} title="No way to add travel insurance while booking">
      <Copy>
        <p>
          Enchanting Travels didn&apos;t sell travel insurance. When guests asked
          for it, travel consultants <Highlight>arranged cover through outside
          providers, by hand and one guest at a time</Highlight>. The booking flow in
          Artemis had no way to offer it.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Artemis had no way for guests to add travel insurance while booking."
          consequence="Guests had to leave the booking to ask for it, and consultants spent time arranging cover from outside providers."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Exploration  (the two places insurance sat: a page of its own, then the guest
// details step). Confirmed by Ashmik 24 Nov 2026: the first iteration was a separate page,
// the final one sat in the guest details step. CHECK: the pros and cons are drafted from
// the designs; Ashmik to confirm the real reasons the separate page lost.
// ─────────────────────────────────────────────────────────────────────────────
type IterationItem = {
  label: string;
  title: string;
  shipped?: boolean;
  worked: string[];
  didntWork: string[];
};

const ITERATIONS: IterationItem[] = [
  {
    label: "Iteration 1",
    title: "A separate insurance page in the booking",
    worked: [
      "Room to explain both plans in full",
      "Insurance had the guest’s full attention for one step",
    ],
    didntWork: [
      "Added one more page to the booking, right before payment",
      "Guests who didn’t want cover still had to pass through it",
    ],
  },
  {
    label: "Iteration 2",
    title: "Insurance inside the traveller details step",
    shipped: true,
    worked: [
      "No extra page: guests see it while they’re already filling in trip details",
      "Both plans side by side, each with its price",
      "The recommended plan is added by default and removed with one tap",
    ],
    didntWork: [
      "Among the form fields it could be missed, so it needed its own card and banner to stand out",
    ],
  },
];

function Process() {
  return (
    <Chapter id="exploration" num={3} title="Finding the right place for insurance in the booking">
      <Copy>
        <p>
          With the priorities set, the main decision was where insurance should
          sit in the booking. I started with <Highlight>a page of its own</Highlight>, then
          moved it into the traveller details step.
        </p>
      </Copy>
      {ITERATIONS.map(({ label, title, shipped, worked, didntWork }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard
              label={label}
              title={title}
              shipped={shipped}
              stamp="Selected"
              image={`${label}: ${title}`}
            >
              <ProsCons pros={worked} cons={didntWork} />
            </OptionCard>
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution
// ─────────────────────────────────────────────────────────────────────────────
const SOLUTION_ITEMS = [
  {
    num: 1,
    title: "Placed just before payment — not as a separate step",
    body: <>Insurance appears at the highest-intent moment in the booking journey: <Highlight>right before payment, as part of the existing flow</Highlight>. This placement was deliberate — guests are already in a commitment mindset. Introducing insurance here feels like a natural extension of protecting their investment, not an interruption of it.</>,
  },
  {
    num: 2,
    title: "Side-by-side plan comparison with value-first copy",
    body: <>The final design presents Basic and CFAR plans in a clear two-column layout, with benefits written in plain language. <Highlight>&quot;Cancel for any reason&quot; leads over technical terms</Highlight>. A &quot;POPULAR&quot; badge creates a gentle nudge without overriding guest autonomy. The structure makes the comparison effortless — guests don&apos;t need to remember what one plan said before reading the next.</>,
  },
  {
    num: 3,
    title: "Trust-first visual language",
    body: <>Shield icons, checkmarks, and a clear colour system were chosen specifically because insurance is an anxiety-laden category. Guests aren&apos;t uncertain about what insurance is — <Highlight>they&apos;re uncertain whether they can trust it</Highlight>. Every visual decision reinforced safety and transparency rather than trying to persuade.</>,
  },
  {
    num: 4,
    title: "Recommended plan auto-selected to reduce decision fatigue",
    body: <>The CFAR plan is pre-selected as the recommended option. This reduces the cognitive load of a cold decision mid-checkout — guests can accept the default, switch, or skip entirely. <Highlight>The skip option is always visible and never hidden</Highlight>, which preserved trust while improving adoption.</>,
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={4} title="Embedded, trustworthy, and easy to skip">
      <Copy>
        <p>
          The final solution wasn&apos;t about designing a better insurance
          screen — it was about <Highlight>finding the right integration point</Highlight> and giving
          the choice enough visual weight to be noticed, without turning it
          into a barrier.
        </p>
      </Copy>
      {SOLUTION_ITEMS.map(({ num, title, body }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>{num}. {title}</h3>
            <p>{body}</p>
          </Copy>
          <Visual>
            <Figure name={`Solution ${num} — ${title}`} />
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Impact
// ─────────────────────────────────────────────────────────────────────────────
// The results, on the shared results card the live case studies use. Wording is carried
// over from the old metric cards; the copy pass comes next.
// CHECK: Ashmik has said some of this case study's numbers are partly made up; confirm
// each one before the page is promoted.
function Impact() {
  return (
    <Chapter id="outcome" num={5} title="Numbers from the first quarter post-launch">
      <Copy>
        <p>
          Three metrics — each mapping directly to one of the gaps research
          identified. <Highlight>The adoption jump from 7% to 52%</Highlight> was the clearest signal
          that the integration point and design approach were right.
        </p>
      </Copy>
      <Copy>
        <ResultsCard
          headline={{ value: 52, suffix: "%" }}
          title="Insurance adoption rate"
          body="Clear hierarchy, value-first copy, and seamless flow placement drove the shift."
          stats={[
            {
              before: "7%",
              after: "52%",
              change: "+45 pts",
              label: "Insurance adoption rate",
              note: "Up from 7% before the integration.",
            },
            {
              after: "$125K",
              label: "Additional revenue generated in Q1 2025",
              note: "The first full quarter post-launch. A new revenue stream with minimal tech overhead.",
            },
            {
              after: "15%",
              label: "Reduction in booking drop-off at checkout",
              note: "Removing the off-platform detour gave guests a complete, confident path to confirmation.",
            },
          ]}
        />
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection  (pointers, as on the live case studies)
// ─────────────────────────────────────────────────────────────────────────────
const WORKED = [
  {
    lead: "Placement over polish.",
    text: <>The first iteration was visually reasonable — clear plans, good copy, clean layout. But it was wrong because of where it sat in the flow, not how it looked. Iteration 1 failed because it interrupted. Iteration 3 succeeded because it extended. That distinction — <Highlight>between a step that interrupts and a choice that extends</Highlight> — became the design principle that guided everything.</>,
  },
  {
    lead: "Research paid off.",
    text: <>The research phase paid off disproportionately here. Without the Mixpanel data confirming the exact drop-off point, I might have placed the insurance module earlier in the flow — which would have reduced adoption, not increased it. <Highlight>Guests are most receptive to protecting a trip immediately before they pay for it</Highlight>. That&apos;s not an intuition; it&apos;s in the data.</>,
  },
];

const NEXT_TIME = [
  {
    lead: "Track what happens after purchase.",
    text: <>If I had more time, I&apos;d invest in post-purchase satisfaction tracking — specifically whether guests who purchased insurance felt more confident about their trip overall, and whether that translated to higher rebooking rates. The adoption and revenue numbers are strong, but the longer-term signal — <Highlight>does insurance increase guest lifetime value?</Highlight> — is the metric I&apos;d want to follow.</>,
  },
];

function Reflection() {
  return (
    <Chapter id="reflection" num={6} title="What I learned">
      <Copy>
        <h3>What worked</h3>
        <Pointers items={WORKED} />
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>What I&apos;d do differently</h3>
          <Pointers items={NEXT_TIME} />
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtemisInsurancePage() {
  return (
    <CaseStudyLayout sections={SECTIONS} reel={reels["artemis-insurance"]}>
      <Hero
        title="Adding travel insurance to Artemis checkout: 7% to 52% adoption"
        date="November 2024"
      />
      <Overview />
      <TheProblem />
      <Discovery />
      <Process />
      <Solution />
      <Impact />
      <Reflection />
      <NextCase current="/works/artemis-insurance" />
    </CaseStudyLayout>
  );
}
