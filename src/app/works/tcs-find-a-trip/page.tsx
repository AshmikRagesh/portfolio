import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ArrowsSplit, FileX, HourglassMedium, Image as ImageIcon, Users } from "@phosphor-icons/react/dist/ssr";
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
  StatTiles,
  MoreDetail,
  ProsCons,
  Reasons,
  NumberedPoints,
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
  { id: "discovery",   label: "Discovery"   },
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
          TCS World Travel plans luxury trips around the world. I designed a
          new step in the website&apos;s main menu. After picking a continent, travellers can
          now explore the destination or browse trips. Both of my designs were
          approved for an A/B/C test.
        </p>
        <Meta
          role={
            <>
              Product Designer. Owned both test designs, from first
              prototype to developer handoff.
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
// Section: Discovery  (research / inputs)
// ─────────────────────────────────────────────────────────────────────────────
// The Find a Trip menu as it is live (tcsworldtravel.com, Oct 2026): every category links
// to a trip search; the destination pages come from the ticket's image mapping
const MENU = [
  { name: "Around the World", page: true },
  { name: "Africa", page: true },
  { name: "Asia", page: true },
  { name: "Australia & The Pacific", page: true },
  { name: "Central America & Caribbean", page: true },
  { name: "Europe", page: true },
  { name: "India & The Middle East", page: true },
  { name: "North America", page: false },
  { name: "Polar Regions", page: true },
  { name: "South America", page: true },
  { name: "Golf", page: false },
];

const MENU_TILES: Parameters<typeof StatTiles>[0]["items"] = [
  { tag: "Trip search", stat: "11 of 11", label: "menu links send people straight to a list of trips" },
  { tag: "Destination pages", stat: "0", label: "menu links lead to a destination page, though 9 categories had one", tone: "key" },
  { tag: "Estimated drop-off", stat: "~40%", label: "of people leave the trip list without opening a trip", tone: "estimate" },
];

/** Each menu category, where its link goes, and whether a destination page was waiting */
function MenuMap() {
  const th = "pb-[12px] pr-[16px] font-brand text-[12px] font-normal uppercase leading-[16px] text-muted";
  const td = "py-[14px] pr-[16px] align-top";
  return (
    <table className="w-full border-collapse text-left font-body text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]">
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className={th}>Menu category</th>
          <th scope="col" className={th}>Link goes to</th>
          <th scope="col" className={`${th} pr-0`}>Destination page</th>
        </tr>
      </thead>
      <tbody>
        {MENU.map(({ name, page }) => (
          <tr key={name} className="border-b border-line-soft">
            <th scope="row" className={`${td} font-normal text-heading`}>{name}</th>
            <td className={`${td} text-secondary`}>
              <span className="inline-flex items-center gap-[6px] whitespace-nowrap">
                <ArrowRight size={14} aria-hidden="true" className="text-muted" />
                Trip list
              </span>
            </td>
            <td className={`${td} pr-0`}>
              {page ? (
                <span className="inline-flex items-center gap-[8px] text-grape">
                  <span aria-hidden="true" className="size-[8px] shrink-0 rounded-full bg-grape" />
                  Exists, not linked
                </span>
              ) : (
                <span className="text-muted">No page</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className="pt-[16px] pr-[16px] text-left font-medium text-heading">Total</th>
          <td className="pt-[16px] pr-[16px] font-medium text-heading">11 to trips</td>
          <td className="pt-[16px] font-medium text-grape">9 not linked</td>
        </tr>
      </tfoot>
    </table>
  );
}

// Three on top (the people and the choice), two below (the constraints)
const CONTEXT_CARDS = [
  {
    icon: <HourglassMedium size={28} weight="fill" className="text-grape" />,
    title: "A long, careful decision",
    description:
      "Featured TCS expeditions start at $135k per person and are planned months ahead. People explore a place long before they choose a trip.",
  },
  {
    icon: <Users size={28} weight="fill" className="text-grape" />,
    title: "Two kinds of visitor, one path",
    description:
      "The team believed visitors came in two moods: exploring a place, or planning a trip. The menu only served the planners.",
  },
  {
    icon: <ArrowsSplit size={28} weight="fill" className="text-grape" />,
    title: "Neither path should win by design",
    description:
      "I asked if the design should favour Destinations, since the test measures it. We agreed to treat both equally, so the test measures intent, not my layout.",
  },
  {
    icon: <FileX size={28} weight="fill" className="text-grape" />,
    title: "Not every continent has a destination page",
    description:
      "North America and Golf only have trips. The design had to fall back cleanly, with no broken or empty option.",
  },
  {
    icon: <ImageIcon size={28} weight="fill" className="text-grape" />,
    title: "The images had to exist first",
    description:
      "The photo-card version needed an approved image for every continent. It couldn't be finished until the content team supplied them.",
  },
];

function Context() {
  return (
    <Chapter id="discovery" num={2} title="What we knew going in">
      <Copy>
        <p>
          The CRO team came with a hypothesis, not data.
        </p>
        <PullQuote
          label="Hypothesis"
          text="If travellers get a clear choice after picking a continent, more of them will keep going,"
          emphasis="because explorers can learn about the place first, and planners can go straight to trips."
        />
      </Copy>
      {/* Subsections sit one step apart (.cs-sub), like the solutions below */}
      <div className="cs-sub">
        <Copy>
          <h3>The menu hid the pages explorers needed</h3>
          <p>
            The live menu made this easy to check. Every continent link pointed
            to a trip search. Not one pointed to a destination page, even though
            most continents already had one. We had no analytics on how many
            people left as a result, so we estimated it from travel industry
            averages.
          </p>
          <MoreDetail label="Research behind these numbers" className="mt-[20px]">
            <div className="flex flex-col gap-[32px]">
              <div>
                <h4 className="mb-[16px] font-body text-[18px] font-medium leading-[28px] text-heading">
                  Where each menu link goes
                </h4>
                <MenuMap />
              </div>
              <div>
                <h4 className="mb-[12px] font-body text-[18px] font-medium leading-[28px] text-heading">
                  How we estimated the drop-off
                </h4>
                <ul className="flex list-disc flex-col gap-[8px] pl-[20px] font-body text-[16px] leading-[26px] text-secondary">
                  <li>Travel sites average a 43% bounce rate, with a usual range of 40–60%.</li>
                  <li>We took the low end, about 40%, because people arriving from the menu are already browsing the site.</li>
                  <li>83% of visits to travel sites come from direct and search traffic, so people who can&apos;t find a place in the menu often go back to Google.</li>
                </ul>
                <Footnote>
                  Estimates, not TCS data. The test&apos;s exit tracking measures the real number. Sources:{" "}
                  <a href="https://www.avidlyagency.com/blog/is-my-websites-bounce-rate-too-high-industry-data" target="_blank" rel="noreferrer">
                    Contentsquare, 2021
                  </a>
                  ,{" "}
                  <a href="https://plausible.io/blog/bounce-rate" target="_blank" rel="noreferrer">
                    Plausible
                  </a>
                  ,{" "}
                  <a href="https://contentsquare.com/guides/travel-hospitality-digital-experience/traffic/" target="_blank" rel="noreferrer">
                    Contentsquare, 2026
                  </a>
                  . Menu links and prices from tcsworldtravel.com, October 2026.
                </Footnote>
              </div>
            </div>
          </MoreDetail>
        </Copy>
        <Visual>
          <StatTiles items={MENU_TILES} />
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What shaped the design</h3>
          <p>
            Before drawing anything, five things set the rules: three about the
            people using the menu, and two constraints the design had to work
            within.
          </p>
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
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Exploration  (iterations)
// ─────────────────────────────────────────────────────────────────────────────
type IterationItem = {
  label: string;
  title: string;
  chosen?: boolean;
  worked: string[];
  didntWork: string[];
};

// The one that didn't go forward first, then the two that went into the test
const ITERATIONS: IterationItem[] = [
  {
    label: "Variant 1",
    title: "Text links side by side, on every screen",
    worked: [
      "On desktop, both paths sit next to each other at equal weight",
    ],
    didntWork: [
      "On a phone, the two links got cramped next to each other",
      "The tap areas became too small to hit reliably",
    ],
  },
  {
    label: "Variant 2",
    title: "Text links that open under the continent",
    chosen: true,
    worked: [
      "The choice opens right under the continent you clicked",
      "The selected continent stays highlighted while its paths are open",
      "Stacked links work the same way on desktop and on a phone",
      "Needs no new images, so it works for every continent from day one",
    ],
    didntWork: [
      "Plain links are quieter; the team expected them to draw fewer clicks than images",
    ],
  },
  {
    label: "Variant 3",
    title: "Image cards that open under the continent",
    chosen: true,
    worked: [
      "A photo for each path makes exploring a place feel inviting",
      "Two big cards side by side are easy to tap, even on a phone",
      "Opens in place, with the selected continent highlighted",
    ],
    didntWork: [
      "Needs an approved pair of photos for every continent before it can ship",
      "The cards push the rest of the continent list further down",
    ],
  },
];

const REVIEW_CHANGES = [
  "Add a version with the two paths side by side, not stacked",
  "Rename \u201cFind Trips\u201d to \u201cExplore Trips\u201d",
  "List Explore Trips first, then Explore Destination",
];

// Numbered points, not cards, in the reading column: the takeaway after the variant cards
const WHY_BOTH = [
  {
    title: "Different strengths",
    description:
      "The links stay light and work for every continent. The cards make exploring a place feel inviting.",
  },
  {
    title: "Let the test decide",
    description:
      "The hypothesis asked whether image cards draw more clicks than text links. Running both against the current menu lets the numbers answer that, not opinion.",
  },
];

function Exploration() {
  return (
    <Chapter id="exploration" num={3} title="What we explored, and the three we showed the business">
      <Copy>
        <p>
          I started with quick prototypes to test how the choice should behave,
          not how it should look. The two paths open right under the continent
          you click, so the menu never jumps away. In review, Rohit asked for
          three changes:
        </p>
        <ul>
          {REVIEW_CHANGES.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p>
          The side-by-side version is where the phone problem showed up. In the
          end, two designs were strong enough that we tested both.
        </p>
      </Copy>
      {ITERATIONS.map(({ label, title, chosen, worked, didntWork }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard
              label={label}
              title={title}
              shipped={chosen}
              stamp="In test"
              image={`${label} — ${title}`}
            >
              <ProsCons pros={worked} cons={didntWork} />
            </OptionCard>
          </Visual>
        </div>
      ))}
      <div className="cs-sub">
        <Copy>
          <h3>Why we tested both instead of choosing</h3>
          <p>
            Variant 1 taught us the layout rule: cards can sit side by side,
            links stack. That left two good designs, and no reason to guess
            between them.
          </p>
          <NumberedPoints items={WHY_BOTH} />
        </Copy>
      </div>
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
        <Figure label="Text links (left) and image cards (right)" />
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
