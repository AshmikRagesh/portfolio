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
  TopResults,
  Pointers,
  NextCase,
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
          booking</Highlight>. It launched in December 2024.
        </p>
        <Meta
          role="End-to-end Design & Developer Handoff"
          team="Ashmik Ragesh (Design), Anish (Project Manager), Muzamil (Engineering)"
          timeline={<>November – December 2024<br />1.5 weeks of design · Launched in December 2024</>}
        />
        {/* The headline numbers up front; the detail is in Results. CHECK: unconfirmed */}
        <TopResults
          items={[
            { from: "7%", stat: "52%", label: "of guests add travel insurance while booking" },
            { stat: "$125K", label: "insurance revenue in the first quarter" },
            { stat: "15%", label: "fewer drop-offs before payment" },
          ]}
        />
      </Copy>
      <Visual>
        {/* The cover: the travel protection section, cut from the traveller details step of the
            working prototype, on the case study's orange (rendered by cover.cjs) */}
        <Figure
          src="/images/artemis-insurance/cover.webp"
          alt="The travel protection section: a dark green Travel Protection Plan banner above two plans side by side, Trip Cancellation (CFAR) marked Popular and the Travel Protection Plan, each with its price per trip"
        />
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
          {/* TODO: when Ashmik shares screenshots of the two pages before insurance, show them
              here as a plain pair labelled only with the page names: the paragraph already says
              what happened on them, so the pictures shouldn't repeat it */}
        </Copy>
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
        </Copy>
        <Visual>
          <CardGrid items={PRIORITIES} label="The four priorities the findings gave the design" />
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
    title: "A yes-or-no question on a page of its own",
    worked: [
      "One clear question: add travel insurance to the trip or not",
      "Insurance had the guest’s full attention for one step",
    ],
    didntWork: [
      "Added one more page to the trip booking",
      "A plain yes or no gave guests nothing to compare, so it did little to encourage cover",
    ],
  },
  {
    label: "Iteration 2",
    title: "Insurance as a section in the traveller details step",
    worked: [
      "No extra page: guests see it while they fill in details for their trip",
      "Guests meet the offer before the checklist and payment pages, where they used to stop",
      "Two plans side by side, each with its price for the trip, so guests compare cover instead of answering yes or no",
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
          With the priorities set, three questions remained: where guests
          should see the insurance offer while booking their trip in Artemis,
          how to present the choice, and how much it should stand out. It took
          three iterations: a yes-or-no question on a page of its own, then two
          plans in a section of the traveller details step, then <Highlight>a redesign
          of that section so guests wouldn&apos;t miss it</Highlight>.
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
// The three decisions in the final design, one sentence each. Clips are rendered from the
// working prototype (orange stage, the camera zooms to what each point is about).
// CHECK (Ashmik, asked 26 Nov): did CFAR ship added by default? Point 3 assumes it.
const SOLUTION_ITEMS = [
  {
    num: 1,
    title: "Same page, same flow",
    text: <>Travel protection sits on the same page where guests fill in their details, so they add cover and carry on in one place, <Highlight>before they reach Your Travel Checklist and the payment page</Highlight> where they used to stop and look for it.</>,
    video: "/videos/artemis-insurance/main-1-placement.mp4",
    alt: "Scrolling the traveller details step from the guests' details down to the travel protection section",
  },
  {
    num: 2,
    title: "Hard to miss, easy to compare",
    text: <>A dark green banner with a shield sets the section apart from the form, and <Highlight>both plans sit side by side</Highlight> with ticks, crosses and the price for the trip, so guests can compare cover without asking anyone.</>,
    video: "/videos/artemis-insurance/main-2-compare.mp4",
    alt: "The Travel Protection Plan banner, then Trip Cancellation (CFAR), marked Popular, beside the Travel Protection Plan",
  },
  {
    num: 3,
    title: "Recommended plan added, one tap to change",
    text: <>Trip Cancellation (CFAR) comes added and marked Popular, with its cost already in the trip total, and <Highlight>one tap removes it or swaps in the other plan</Highlight>.</>,
    video: "/videos/artemis-insurance/main-3-change.mp4",
    alt: "Adding the Travel Protection Plan in place of CFAR and back, with the trip total updating each time",
  },
];

// Smaller details for the rail, each a short clip recorded from the working prototype.
// CHECK: did the empty-field check and the phone price sheet ship, or are they prototype only?
const DETAILS = [
  { video: "/videos/artemis-insurance/detail-whats-covered.mp4", alt: "The What's covered panel for Trip Cancellation (CFAR)", title: "What’s covered", text: "View More Benefits lists everything a plan covers without leaving the page." },
  { video: "/videos/artemis-insurance/detail-missing.mp4", alt: "Empty traveller fields marked in red with a message to fill them in", title: "Missing details", text: "Your Travel Checklist flags every empty field and jumps to the first one." },
  { video: "/videos/artemis-insurance/detail-phone.mp4", alt: "The travel protection section on a phone", title: "On a phone", text: "The banner and the plans stack to fit a phone screen." },
  { video: "/videos/artemis-insurance/detail-phone-price.mp4", alt: "The price details sheet open on a phone", title: "Price on a phone", text: "The total sits in a bar at the bottom, and Price details opens the breakdown." },
];

function Solution() {
  return (
    <Chapter id="solution" num={4} title="Travel protection, built into the traveller details step">
      <Copy>
        <p>
          The final design adds a travel protection section to the traveller
          details step. Three decisions shaped it, each answering one of the
          priorities.
        </p>
      </Copy>
      <Visual>
        <PrototypeCard
          src="/prototypes/artemis-insurance.html"
          title="Travel protection in the Artemis traveller details step"
          label="The traveller details step with travel protection, rebuilt as a working prototype"
          hint="Try it: add or switch a plan, open View More Benefits, or press Your Travel Checklist with fields left empty."
        />
      </Visual>
      {SOLUTION_ITEMS.map(({ num, title, text, video, alt }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>{num}. {title}</h3>
            <p>{text}</p>
          </Copy>
          <Visual>
            <Figure video={video} alt={alt} />
          </Visual>
        </div>
      ))}
      {/* A short lead-in for the rail, after the reference: why these details matter, tied to the
          design question ("on their own"). No new facts: it names what the clips show. */}
      <div className="cs-sub">
        <Copy>
          <h3>Helping guests finish on their own</h3>
          <p>
            The three decisions got guests to the plans. These smaller details
            help them finish the step without asking their consultant: <Highlight>checking
            what a plan covers, fixing missing details and seeing the price on
            a phone</Highlight>.
          </p>
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
    <Chapter id="outcome" num={5} title="The first quarter after launch">
      <Copy>
        <p>
          Travel protection went live in December 2024. These numbers cover
          the first full quarter after it, January to March 2025.
        </p>
      </Copy>
      <Copy>
        {/* 7% (Ashmik, 27 Nov): guests who had a consultant arrange cover from an outside
            provider. CHECK: 52%, $125K and 15% still unconfirmed; was CFAR added by default? */}
        <ResultsCard
          headline={{ value: 52, suffix: "%" }}
          title="Guests who added travel insurance"
          body="Up from 7% before launch: the guests who asked their consultant to arrange cover from an outside provider. Guests now add cover themselves while they enter their details."
          stats={[
            {
              after: "$125K",
              label: "Insurance revenue in Q1 2025",
              note: "A new line of revenue: Enchanting Travels didn’t sell insurance before.",
            },
            {
              after: "15%",
              label: "Fewer drop-offs before payment",
              note: "Guests no longer leave the booking to ask a consultant for cover.",
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
// Lessons from the confirmed facts (artemis-insurance-notes.md): the reframe in Discovery and
// the three iterations. CHECK (Ashmik): were the iterations tested with guests? The second
// "differently" point assumes they were reviewed within the team only.
const WORKED = [
  {
    lead: "Asking guests, not only consultants.",
    text: <>The request came from consultants: guests kept asking them for insurance. The guests we interviewed wanted something more specific, <Highlight>to add cover themselves while they booked</Highlight>. That answer became the design question and put insurance inside the booking flow.</>,
  },
  {
    lead: "Placement first, then visibility.",
    text: <>A yes-or-no question on a page of its own added a step and gave guests nothing to compare. Two plans in the traveller details step fixed both, but the section blended into the form. <Highlight>Where the offer sits decides whether guests reach it, and how it looks decides whether they notice it.</Highlight> The final design needed both.</>,
  },
];

const NEXT_TIME = [
  {
    lead: "Agree the measures before launch.",
    text: <>I&apos;d settle with Anish which numbers to track before the section went live: bookings with cover, where guests leave, and policies consultants still arrange by hand. <Highlight>Every result would then have a clear before and after.</Highlight></>,
  },
  {
    lead: "Test the section with guests.",
    text: <>We spoke to guests to find the problem, but the iterations were judged within the team. <Highlight>A short test with a few frequent guests</Highlight> would have shown sooner that the second iteration was easy to scroll past.</>,
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
        title="Adding travel insurance to the Artemis booking flow: 7% to 52% adoption"
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
