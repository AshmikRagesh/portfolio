import type { Metadata } from "next";
import { ListChecks, ShieldCheck, SuitcaseRolling, UsersThree } from "@phosphor-icons/react/dist/ssr";
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
  PanelCards,
  MediaRail,
  PrototypeCard,
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

// What the design had to do, one priority per Discovery finding. Needs, not the solution:
// how the design meets them is in Exploration and Solution
// The two pages where guests stopped to look for insurance (screenshots to come)
const STOP_PAGES = [
  {
    alt: "Your Travel Checklist before insurance",
    title: "Your Travel Checklist",
    text: "Guests reviewed their trip here and looked for insurance before paying.",
  },
  {
    alt: "The payment page before insurance",
    title: "Payment",
    text: "The last place guests looked. With no cover on offer, many stopped to ask.",
  },
];

const PRIORITIES = [
  {
    icon: <ShieldCheck size={28} weight="fill" className="text-grape" />,
    title: "Cover in the same booking",
    description: "Guests had to stop and message their consultant to get insurance. Adding it has to be part of booking the trip in Artemis.",
  },
  {
    icon: <ListChecks size={28} weight="fill" className="text-grape" />,
    title: "In view before payment",
    description: "Guests went looking for insurance on the checklist and payment pages, and left when it wasn’t there. It has to appear before they get that far.",
  },
  {
    icon: <SuitcaseRolling size={28} weight="fill" className="text-grape" />,
    title: "Everything from one place",
    description: "Guests expect their whole trip from Enchanting Travels, so insurance has to come with it, not as a separate errand.",
  },
  {
    icon: <UsersThree size={28} weight="fill" className="text-grape" />,
    title: "No cover arranged by hand",
    description: "Consultants sourced every policy from outside providers, one booking at a time. Cover added in Artemis takes that work off their desks.",
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
          in. We checked where guests were leaving the booking and talked to
          guests directly.
        </p>
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>Where guests stopped</h3>
          {/* TODO: add the drop-off figures for both pages once Ashmik has them */}
          <p>
            Drop-offs clustered on two pages near the end of the booking: Your
            Travel Checklist, where guests review their trip before paying, and
            the payment page. That&apos;s where guests looked for insurance once
            their details were in. When they couldn&apos;t find it, they <Highlight>left
            to ask their consultant, then came back to finish the booking</Highlight> once
            cover was arranged. Most asked before paying; a few booked first and
            asked after.
          </p>
        </Copy>
        <Visual>
          {/* TODO: screenshots of the two pages before insurance, from Ashmik */}
          <PanelCards items={STOP_PAGES} />
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What we heard</h3>
          {/* TODO: confirm the exact number interviewed (Ashmik: "around 8 to 9") */}
          <p>
            We interviewed eight frequent guests about what bothered them in the
            booking flow. Some raised other issues, but <Highlight>every one of them
            mentioned insurance</Highlight>, and all of them wanted to add it while
            they booked.
          </p>
          <p>
            Most Enchanting Travels guests are 45 to 60-plus and well off. They
            expect everything for their trip to come from one place, their travel
            consultant, so <Highlight>none of them went looking for cover on their
            own</Highlight>. A typical exchange went like this:
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
          <p>The findings gave the design four priorities:</p>
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
// Section: Exploration  (three iterations, confirmed by Ashmik 24 Nov 2026: a separate page,
// a section in the traveller details step, then that section redesigned with its card and
// banner so it stands out). CHECK: the pros and cons are drafted from
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
    title: "Insurance on a page of its own in the trip booking",
    worked: [
      "Room to explain both plans in full",
      "Insurance had the guest’s full attention for one step",
    ],
    didntWork: [
      "Added one more page to the trip booking, right before payment",
      "Guests who didn’t want cover still had to pass through it",
    ],
  },
  {
    label: "Iteration 2",
    title: "Insurance as a section in the traveller details step",
    worked: [
      "No extra page: guests see it while they fill in details for their trip",
      "Guests meet the offer before the checklist and payment pages, where they used to stop",
      "Both plans side by side, each with its price for the trip",
    ],
    didntWork: [
      "It looked like part of the form, so guests could scroll straight past it",
    ],
  },
  {
    label: "Iteration 3",
    title: "The same section, redesigned so guests notice it",
    shipped: true,
    worked: [
      "A banner with a shield sets it apart from the form fields around it",
      "Plan cards show the price for the trip, with a Popular tag on the recommended plan",
      "The recommended plan is added by default, and one tap removes it",
    ],
    // DRAFT: the trade-off accepted, to confirm once Ashmik shares the iteration images
    didntWork: [
      "The section takes more space, so the traveller details step gets longer",
    ],
  },
];

function Process() {
  return (
    <Chapter id="exploration" num={3} title="Finding the right place for insurance in the booking">
      <Copy>
        <p>
          With the priorities set, two questions remained: where guests should
          see the insurance offer while booking their trip in Artemis, and how
          much it should stand out. It took three iterations: a page of its own,
          then a section in the traveller details step, then <Highlight>a redesign of
          that section so guests wouldn&apos;t miss it</Highlight>.
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

// Smaller details for the rail, each captured from the working prototype
const DETAILS = [
  { src: "/images/artemis-insurance/plan-added.webp", alt: "The travel protection section with Trip Cancellation (CFAR) added", title: "Recommended plan", text: "Trip Cancellation (CFAR) starts added and marked Popular, with its price for the trip." },
  { src: "/images/artemis-insurance/plan-switched.webp", alt: "The Travel Protection Plan added in place of CFAR", title: "Switch in one tap", text: "Adding the other plan swaps it in, and the trip total updates straight away." },
  { src: "/images/artemis-insurance/whats-covered.webp", alt: "The What's covered panel for Trip Cancellation (CFAR)", title: "What’s covered", text: "View More Benefits lists everything a plan covers without leaving the page." },
  { src: "/images/artemis-insurance/missing-details.webp", alt: "Empty traveller fields marked in red with a message to fill them in", title: "Missing details", text: "Your Travel Checklist flags every empty field and jumps to the first one." },
  { src: "/images/artemis-insurance/phone.webp", alt: "The travel protection section on a phone", title: "On a phone", text: "The banner and the plans stack to fit a phone screen." },
  { src: "/images/artemis-insurance/phone-price.webp", alt: "The price details sheet open on a phone", title: "Price on a phone", text: "The total sits in a bar at the bottom, and Price details opens the breakdown." },
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
      <Visual>
        <PrototypeCard
          src="/prototypes/artemis-insurance.html"
          poster="/images/artemis-insurance/poster.webp"
          title="Travel protection in the Artemis traveller details step"
          label="The traveller details step with travel protection, rebuilt as a working prototype"
          hint="Try it: add or switch a plan, open View More Benefits, or press Your Travel Checklist with fields left empty."
        />
      </Visual>
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
      <div className="cs-sub">
        <Copy>
          <h3>The smaller details</h3>
          <p>Each of these works in the prototype above.</p>
        </Copy>
        <Visual>
          <MediaRail label="Smaller details of the travel protection section" items={DETAILS} />
        </Visual>
      </div>
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
