import type { Metadata } from "next";
import { Compass, Gem, Scale, MapPinOff, Images } from "lucide-react";
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
  PullQuote,
  Compare,
  ProsCons,
  Reasons,
  OptionCard,
  Stats,
  Footnote,
} from "@/components/case-study";

// DRAFT — first pass at TCSWT-1270. Copy is a starting point to edit section by section;
// figures are placeholders until the Figma exports are in.

export const metadata: Metadata = {
  title: "Not everyone is ready to book · Ashmik Ragesh",
  description:
    "Designed a two-path choice in the TCS World Travel “Find a Trip” menu — letting travellers still exploring learn about a destination first, and travellers ready to compare go straight to trips. Approved as an A/B/C test.",
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
          TCS World Travel plans luxury trips around the world. This was my
          first project on the Helix team. I designed a new step in the
          website&apos;s main menu. After picking a continent, travellers can
          now explore the destination or browse trips. Both of my designs were
          approved for an A/B/C test.
        </p>
        <Meta
          role={
            <>
              Product Designer. My first project on Helix. Owned both test
              designs, from first prototype to developer handoff.
            </>
          }
          team="Rohit Rayala (CRO), Sharayu Jadhav (Product Owner), Hriday Gami (Design), Sandy Tang (Content)"
          timeline={<>4 weeks, Jun–Jul 2026<br />Ready for development 15 Jul 2026</>}
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
    <Chapter id="the-problem" num={1} title="One click, and straight to the trips, even if you were still exploring">
      <Copy>
        <p>
          On the TCS website, clicking a continent in the menu took you
          straight to a list of trips. That works if you already know where
          you want to go. But luxury trips take months to plan. Many people
          start by exploring a place, not by comparing trips.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Picking a continent sent every visitor straight to a list of trips, even people still deciding where to go."
          consequence="We believed many of them left before finding anything to explore, and TCS lost leads at the very first step."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Context  (research / inputs)
// ─────────────────────────────────────────────────────────────────────────────
// Counted on the live menu (tcsworldtravel.com, Oct 2026)
const MENU_COMPARE: Parameters<typeof Compare>[0]["items"] = [
  { tag: "Trip search", stat: "32", label: "menu links send people straight to a list of trips" },
  { tag: "Destination pages", stat: "0", label: "menu links lead to a destination page, though 9 of 11 categories had one" },
];

// Three on top (the people and the choice), two below (the constraints)
const CONTEXT_CARDS = [
  {
    icon: <Gem size={26} className="text-grape" strokeWidth={2} />,
    title: "A long, careful decision",
    description:
      "Featured TCS expeditions start at $135k per person and are planned months ahead. People explore a place long before they choose a trip.",
  },
  {
    icon: <Compass size={26} className="text-grape" strokeWidth={2} />,
    title: "Two kinds of visitor, one path",
    description:
      "The team believed visitors came in two moods: exploring a place, or planning a trip. The menu only served the planners.",
  },
  {
    icon: <Scale size={26} className="text-grape" strokeWidth={2} />,
    title: "Neither path should win by design",
    description:
      "I asked if the design should favour Destinations, since the test measures it. We agreed to treat both equally, so the test measures intent, not my layout.",
  },
  {
    icon: <MapPinOff size={26} className="text-grape" strokeWidth={2} />,
    title: "Not every continent has a destination page",
    description:
      "North America and Golf only have trips. The design had to fall back cleanly, with no broken or empty option.",
  },
  {
    icon: <Images size={26} className="text-grape" strokeWidth={2} />,
    title: "The images had to exist first",
    description:
      "The photo-card version needed an approved image for every continent. It couldn't be finished until the content team supplied them.",
  },
];

function Context() {
  return (
    <Chapter id="context" num={2} title="What we knew going in">
      <Copy>
        <p>
          This was my first project on the Helix team. The CRO team came with
          a hypothesis, not data.
        </p>
      </Copy>
      <Visual>
        <PullQuote
          label="Hypothesis"
          text="If travellers get a clear choice after picking a continent, more of them will keep going,"
          emphasis="because explorers can learn about the place first, and planners can go straight to trips."
        />
      </Visual>
      <Copy>
        <h3>The menu hid the pages explorers needed</h3>
        <p>
          The live menu made this easy to check. Every continent link pointed
          to a trip search. Not one pointed to a destination page, even though
          most continents already had one.
        </p>
      </Copy>
      <Visual>
        <Compare items={MENU_COMPARE} />
      </Visual>
      <Copy>
        <h3>What we expected to find</h3>
        <p>
          We had no analytics on this. Based on travel industry averages, we
          expected about 4 in 10 people to leave the trip list without opening
          a trip. Some would go looking for the place another way, through
          site search or Google.
        </p>
        <Footnote>
          Estimates, not TCS data. Travel sites average a 43% bounce rate (
          <a href="https://www.avidlyagency.com/blog/is-my-websites-bounce-rate-too-high-industry-data" target="_blank" rel="noreferrer">
            Contentsquare, 2021
          </a>
          ), with a usual range of 40–60% (
          <a href="https://plausible.io/blog/bounce-rate" target="_blank" rel="noreferrer">
            Plausible
          </a>
          ). 83% of visits to travel sites come from direct and search traffic (
          <a href="https://contentsquare.com/guides/travel-hospitality-digital-experience/traffic/" target="_blank" rel="noreferrer">
            Contentsquare, 2026
          </a>
          ). Menu links and prices are from tcsworldtravel.com, October 2026.
        </Footnote>
      </Copy>
      <Visual>
        <CardGrid items={CONTEXT_CARDS} />
      </Visual>
      <Copy>
        <p>
          <strong>What success looked like:</strong> more people reaching a
          real next page after picking a continent, either a destination page
          or a list of trips.
        </p>
      </Copy>
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
        title="Not everyone is ready to book. Letting travellers choose: explore a destination, or browse trips"
        date="July 2026"
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
