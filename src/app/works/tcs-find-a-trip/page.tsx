import type { Metadata } from "next";
import { Compass, Gem, Scale, MapPinOff } from "lucide-react";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { reels } from "@/content/reels";
import {
  Hero,
  Chapter,
  Copy,
  Meta,
  Visual,
  Figure,
  CardGrid,
  ProblemStatement,
  ProsCons,
  Reasons,
  OptionCard,
  Stats,
} from "@/components/case-study";

// DRAFT — first pass at TCSWT-1270. Copy is a starting point to edit section by section;
// figures are placeholders until the Figma exports are in.

export const metadata: Metadata = {
  title: "Destination or Trips · Ashmik Ragesh",
  description:
    "Designed a two-path choice in the TCS World Travel “Find a Trip” menu — letting travellers still dreaming explore a destination, and travellers ready to compare go straight to trips. Shipped as an A/B/C test.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",    label: "Overview"    },
  { id: "the-problem", label: "The Problem" },
  { id: "context",     label: "Context"     },
  { id: "exploration", label: "Exploration" },
  { id: "solution",    label: "Solution"    },
  { id: "output",      label: "What Shipped" },
  { id: "outcome",     label: "Outcome"     },
  { id: "reflection",  label: "Reflection"  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview  (with Role / Team / Timeline)
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <Chapter id="overview" num={0} title="Overview">
      <Copy>
        <p>
          Designed a new step in the TCS World Travel &ldquo;Find a Trip&rdquo;
          menu. After picking a continent, travellers now choose between
          exploring the destination or browsing trips. Both designs shipped as
          variants in an A/B/C test.
        </p>
        <Meta
          role={
            <>
              Product Designer. Owned the interaction design, both test
              variants and the responsive behaviour, through to dev handoff.
            </>
          }
          team="Rohit Rayala (CRO), Sharayu Jadhav (Product Owner), Hriday Gami (Design), Sandy Tang (Content)"
          timeline={<>4 weeks design, Jun–Jul 2026<br />Ready for dev 15 Jul 2026</>}
        />
      </Copy>
      <Visual>
        <Figure label="Find a Trip — the two paths after picking a continent" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The Problem
// ─────────────────────────────────────────────────────────────────────────────
function TheProblem() {
  return (
    <Chapter id="the-problem" num={1} title="One click, and you were already shopping">
      <Copy>
        <p>
          The &ldquo;Find a Trip&rdquo; menu is how most people start looking
          on tcsworldtravel.com. Clicking a continent took you straight to a
          list of trips, with prices, dates and itineraries to compare.
        </p>
        <p>
          That works if you already know where you&apos;re going. But TCS sells
          luxury journeys people think about for months. Many visitors are
          still picking a destination, not a trip. The menu had nothing for
          them, and they had nowhere useful to go but out.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Picking a continent in “Find a Trip” sent every visitor straight to a list of trips, even those still deciding where to go."
          consequence="Travellers who weren't ready to compare itineraries hit a page built for buyers and left — losing TCS the leads it needs from the very top of the funnel."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Context  (research / inputs)
// ─────────────────────────────────────────────────────────────────────────────
const CONTEXT_CARDS = [
  {
    icon: <Gem size={26} className="text-grape" strokeWidth={2} />,
    title: "A long, careful decision",
    description:
      "These are once-in-a-lifetime trips. People research a place and build confidence before they ever look at an itinerary.",
  },
  {
    icon: <Compass size={26} className="text-grape" strokeWidth={2} />,
    title: "Two kinds of visitor, one path",
    description:
      "Dreamers wanted to learn about the destination; shoppers wanted the trip list. The menu only served the second group.",
  },
  {
    icon: <Scale size={26} className="text-grape" strokeWidth={2} />,
    title: "Neither path should win by design",
    description:
      "I asked whether to visually favour Destinations, since the test measures it. The answer: treat both equally, so the test measures intent, not my layout.",
  },
  {
    icon: <MapPinOff size={26} className="text-grape" strokeWidth={2} />,
    title: "Not every continent has a destination page",
    description:
      "North America and Golf only have trips. Any design had to fall back cleanly, with no broken or empty option.",
  },
];

function Context() {
  return (
    <Chapter id="context" num={2} title="What we knew going in">
      <Copy>
        <p>
          The CRO team&apos;s hypothesis was simple. Give people a clear choice
          after they pick a continent, and more of them will keep going. Those
          looking for inspiration head to destination content, and those ready
          to buy head to trips.
        </p>
        <p>
          This was my first project on the Helix team. Before drawing anything
          I needed to settle one question, because the test results would
          depend on it: should the two paths carry equal weight?
        </p>
      </Copy>
      <Visual>
        <CardGrid items={CONTEXT_CARDS} />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Exploration  (iterations)
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
    label: "Prototype 1",
    title: "Inline accordion — options expand under the continent",
    shipped: true,
    worked: [
      "Click a continent and the two paths open right where you're looking",
      "Selected continent stays highlighted, so you never lose your place",
      "Lightweight — fits the existing menu with no new panel",
    ],
    didntWork: [
      "Text links are easy to read past; the choice can feel like small print",
    ],
  },
  {
    label: "Prototype 2",
    title: "Side panel — two image cards beside the menu",
    shipped: true,
    worked: [
      "Photos for each continent make the choice feel inspiring, not administrative",
      "Bigger targets — the two paths are impossible to miss",
    ],
    didntWork: [
      "Needs a full approved image set for every continent before it can ship",
      "Hover-to-open doesn't exist on touch screens; mobile needed its own pattern",
    ],
  },
  {
    label: "Exploration",
    title: "Side-by-side paths on every screen",
    worked: [
      "On desktop, both paths sit at equal weight at a glance",
    ],
    didntWork: [
      "On mobile the links got cramped, and the tap areas got too small to hit reliably",
    ],
  },
];

function Exploration() {
  return (
    <Chapter id="exploration" num={3} title="Two prototypes, then a layout that broke on mobile">
      <Copy>
        <p>
          I built two interaction prototypes to feel out the behaviour, not to
          polish the visuals. Rohit liked both enough to test them against each
          other. He also asked for a side-by-side version, which is where the
          mobile problem showed up.
        </p>
      </Copy>
      {ITERATIONS.map(({ label, title, shipped, worked, didntWork }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard label={label} title={title} shipped={shipped} image={`${label} — design preview`}>
              <ProsCons pros={worked} cons={didntWork} />
            </OptionCard>
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution  (the decisions)
// ─────────────────────────────────────────────────────────────────────────────
const SOLUTION_ITEMS = [
  {
    num: 1,
    title: "Equal weight, with Trips listed first",
    body: "Both paths share one visual treatment, so the test compares what people intend, not how loudly each option is styled. Explore Trips comes first because it's the existing behaviour, so returning users find what they expect in the usual place.",
  },
  {
    num: 2,
    title: "Side by side on desktop, stacked on mobile",
    body: "Side by side reads best on a wide screen. On a phone it squeezed the tap targets, so the paths stack there instead. One rule, two layouts, and nothing too small to tap.",
  },
  {
    num: 3,
    title: "A clean fallback where there's no destination page",
    body: "North America and Golf go straight to trips, exactly as they did before. No greyed-out option, no broken link, and no image without a page behind it.",
  },
  {
    num: 4,
    title: "Photos and links that change with the continent",
    body: "In the image-card variant, each continent swaps in its own approved photos and links. Africa looks like Africa. The prototype was wired up for Africa so reviewers could click through the real thing.",
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={4} title="Small decisions that keep the test fair">
      <Copy>
        <p>
          The visual design was the easy part. The decisions that mattered were
          about keeping the test honest and making it work on every screen.
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
// Section: What shipped  (output)
// ─────────────────────────────────────────────────────────────────────────────
const OUTPUT_STATS = [
  { stat: "3", label: "Test arms — the current menu plus both of my prototypes" },
  { stat: "34/33/33", label: "Traffic split across control, text links and image cards" },
  { stat: "11", label: "Continents and categories, each with its own images and links" },
  { stat: "2", label: "Categories with no destination page, falling back to trips" },
];

function Output() {
  return (
    <Chapter id="output" num={5} title="An A/B/C test, ready for development">
      <Copy>
        <p>
          Both prototypes went into the test as separate variants, alongside
          the current menu as the control. I handed off the responsive designs
          with the approved images for each continent. Rohit turned the agreed
          behaviour into acceptance criteria.
        </p>
      </Copy>
      <Visual>
        <Stats items={OUTPUT_STATS} />
      </Visual>
      <Visual>
        <Figure label="Variant 1 — text links (left) and Variant 2 — image cards (right)" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Outcome
// ─────────────────────────────────────────────────────────────────────────────
const MEASURES = [
  "Path completion — do more people reach a real next page after picking a continent?",
  "Which path they choose — how many people want inspiration, and how many want trips?",
  "Exits without a choice — does the extra step cost us anyone?",
];

function Outcome() {
  return (
    <Chapter id="outcome" num={6} title="What we're measuring">
      <Copy>
        <p>
          The test is approved and queued for development, so there are no
          results yet. The main measure counts a journey as complete only
          when the next page actually loads, either the trip list or the
          destination page. That makes all three arms directly comparable.
        </p>
      </Copy>
      <Visual narrow>
        <Reasons items={MEASURES} />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection
// ─────────────────────────────────────────────────────────────────────────────
function Reflection() {
  return (
    <Chapter id="reflection" num={7} title="What I learned">
      <Copy>
        <p>
          The most useful thing I did on this project was ask a question
          before drawing anything. Whether the two paths should be equal
          shaped every layout after it, and it kept me from building a bias
          into a test meant to measure intent.
        </p>
        <p>
          Building the side-by-side version on a real phone, rather than
          arguing about it, settled the layout question in a day. The fix was
          to give each screen size the layout that suits it, not to choose
          one for all of them.
        </p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function TcsFindATripPage() {
  return (
    <CaseStudyLayout sections={SECTIONS} reel={reels["tcs-find-a-trip"]}>
      <Hero
        title="Letting travellers choose: explore a destination, or browse trips"
        date="July 2026"
        color="#E4EEF7"
      />
      <Overview />
      <TheProblem />
      <Context />
      <Exploration />
      <Solution />
      <Output />
      <Outcome />
      <Reflection />
    </CaseStudyLayout>
  );
}
