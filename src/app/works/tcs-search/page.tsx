import type { Metadata } from "next";
import {
  CheckCircle,
  Compass,
  Funnel,
  MapTrifold,
  SlidersHorizontal,
} from "@phosphor-icons/react/dist/ssr";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import {
  Hero,
  Chapter,
  Copy,
  Meta,
  Visual,
  Figure,
  CardGrid,
  ProblemStatement,
  ChatQuotes,
  BarRows,
  Highlight,
  ResultsCard,
  ChangeList,
  PreviewLink,
  MoreDetail,
  NextCase,
  ProsCons,
  OptionCard,
  Pointers,
} from "@/components/case-study";

// DRAFT — first pass at TCSWT-1151 (site search filters). Built from
// case-studies/tcs-search-notes.md; copy is a starting point to edit section by section,
// figures are placeholders until the Figma exports are in. Lines marked TODO wait on
// Ashmik's answers (role, who moved the filters into dropdowns, team roles).

export const metadata: Metadata = {
  title: "Search that helps you narrow it down · Ashmik Ragesh",
  description:
    "Redesigned the TCS World Travel search page with filters, a result count and trip cards that show the route, so travellers can narrow a long list to the trips that fit.",
};

// Helix, the design-system skill on Claude Code, linked to its own case study
function HelixLink() {
  return (
    <PreviewLink
      href="/works/helix"
      preview={{
        tag: "Coming soon",
        title: "Helix: our design system, in code",
        description: "How a Claude Code skill keeps every design built from the TCS components and tokens.",
      }}
    >
      Helix on Claude Code
    </PreviewLink>
  );
}

const SECTIONS: CaseStudySection[] = [
  { id: "overview",    label: "Overview"    },
  { id: "the-problem", label: "The Problem" },
  { id: "discovery",   label: "Discovery"   },
  { id: "exploration", label: "Exploration" },
  { id: "solution",    label: "Solution"    },
  { id: "outcome",     label: "Results" },
  { id: "reflection",  label: "Reflection"  },
];

// Shared table styles, as on the Find a Trip page
const TH = "pb-[12px] pr-[16px] font-brand text-[12px] font-normal uppercase leading-[16px] text-muted";
const TD = "py-[14px] pr-[16px] align-top";
const TABLE = "w-full border-collapse text-left font-body text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]";

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview  (with Role / Team / Timeline)
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <Chapter id="overview" num={0} title="Overview">
      <Copy>
        <p>
          TCS&apos;s search page showed every upcoming trip in one long list,
          with no way to narrow it. I redesigned it so travellers
          can <Highlight>narrow results by destination, trip type, date and length</Highlight>, see
          how many trips match, and see each trip&apos;s route on its card.
          Developers built
          it, and it has been live since July 2026.
        </p>
        <Meta
          role="End-to-end Design & Developer Handoff"
          // TODO: add Travis's role once known
          team="Sharayu Jadhav (Product Owner), Travis Snelling, Sandy Tang (Content), TCS developers (Engineering)"
          timeline={<>May – July 2026<br />Briefed in June 2026 · V1 launched in July 2026</>}
        />
      </Copy>
      <Visual>
        <Figure label="Before and after: the same search, old page and new" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The Problem
// ─────────────────────────────────────────────────────────────────────────────
function TheProblem() {
  return (
    <Chapter id="the-problem" num={1} title="Search made it hard for travellers to find the right trip">
      <Copy>
        <p>
          Travellers often search with a destination, travel period or type of
          experience in mind. But in March 2026, TCS&apos;s search page offered
          limited ways to narrow results. The Trips tab displayed <Highlight>42 trip cards
          in date order, with no filters, sorting or result count</Highlight>. Cards also
          lacked country information, meaning travellers had to scan the list
          and open individual trips to understand where each journey went.
        </p>
        <p>
          <Highlight>Search performance data wasn&apos;t available</Highlight> to the design team,
          making it difficult to understand how often travellers encountered
          these issues.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Travellers couldn’t easily identify trips that matched their interests. They had to work through a long list and open individual trips to determine which journeys were relevant."
          consequence="For a business that relies on enquiries, making relevant trips harder to discover also created a potential barrier between browsing and enquiring."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Discovery  (research / inputs)
// ─────────────────────────────────────────────────────────────────────────────
// What the audit of the old search page counted
const AUDIT: Parameters<typeof BarRows>[0]["items"] = [
  { label: "Trip cards in one list", value: 42 },
  { label: "Filters and sorting controls", value: 0, circled: true },
  { label: "Waitlisted trips in the results", value: 9, of: 42 },
  { label: "Trip names mentioning a country", value: 7, of: 32 },
];

// What frequent travellers said in the interviews
const TRAVELLER_QUOTES = [
  { text: "I want to know where the trip goes and which destinations it covers without having to open every trip.", from: "Frequent TCS traveller" },
  { text: "The number of matching trips is easy to miss when I’m changing filters.", from: "Frequent TCS traveller" },
];

// The five priorities the interviews and the audit shaped
const CONTEXT_CARDS = [
  {
    icon: <Funnel size={28} weight="fill" className="text-grape" />,
    title: "Narrow by how people plan",
    description: "Introduce filters for destination, trip type, departure and availability.",
  },
  {
    icon: <SlidersHorizontal size={28} weight="fill" className="text-grape" />,
    title: "Make search feedback visible",
    description: "Bring the result count closer to the filters and make applied selections easy to identify and remove.",
  },
  {
    icon: <MapTrifold size={28} weight="fill" className="text-grape" />,
    title: "Show the full trip route",
    description: "Surface the destinations and route directly on each trip card.",
  },
  {
    icon: <CheckCircle size={28} weight="fill" className="text-grape" />,
    title: "Make availability easier to understand",
    description: "Allow travellers to separate bookable trips from waitlisted ones.",
  },
  {
    icon: <Compass size={28} weight="fill" className="text-grape" />,
    title: "Connect navigation to search",
    description: "Make region links open search with the corresponding destination filter applied.",
  },
];

function Context() {
  return (
    <Chapter id="discovery" num={2} title="Understanding the existing search experience">
      <Copy>
        <p>
          I started by auditing the existing search page, reviewing earlier
          search tickets and conducting structured interviews with frequent TCS
          travellers. With no search analytics available to the design team,
          these helped me understand how travellers searched for trips and
          where the experience fell short.
        </p>
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>What we heard from travellers</h3>
          <p>
            <Highlight><span className="text-heading">7 frequent TCS travellers interviewed.</span></Highlight> Two
            recurring observations stood out:
          </p>
          <ChatQuotes label="What two frequent TCS travellers said" items={TRAVELLER_QUOTES} />
          <p>
            These conversations highlighted two important needs: <Highlight>better
            visibility into trip itineraries and clearer feedback when
            exploring search results</Highlight>.
          </p>
        </Copy>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What the product audit revealed</h3>
          <p>
            The existing search page was split across three tabs: Expeditions,
            Destinations, and Guides &amp; Resources. Within Expeditions,
            upcoming trips appeared in one long list, ordered by departure date.
          </p>
          <BarRows heads={["What I reviewed", "Finding"]} items={AUDIT} />
          <p className="mt-[24px]">
            Travellers had <Highlight>limited ways to narrow the list, distinguish
            available trips or understand where a journey went</Highlight> from the card
            itself.
          </p>
        </Copy>
        <Visual>
          <Figure
            src="/images/tcs-search/old-search.webp"
            alt="The old TCS search page: a long grid of trip and destination cards with no filters"
            label="The old search page: every kind of result in one grid, with no filters"
          />
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>Turning findings into design priorities</h3>
          <p>The interviews and product audit shaped five priorities for the redesign:</p>
        </Copy>
        <Visual>
          <CardGrid items={CONTEXT_CARDS} />
        </Visual>
        <Copy>
          <p>
            <strong>What success looked like:</strong> Travellers could narrow a
            long list to relevant trips, understand where each journey goes and
            make sense of their results without unnecessary clicks.
          </p>
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Exploration  (the ways to narrow results)
// ─────────────────────────────────────────────────────────────────────────────
type OptionItem = {
  label: string;
  title: string;
  shipped?: boolean;
  video: string;
  worked: string[];
  didntWork: string[];
};

// Three page ideas, each with its own way to narrow and its own card. Pros and cons match the
// clickable prototypes, which run on the 45 live trips.
const OPTIONS: OptionItem[] = [
  {
    label: "Option 1",
    video: "/videos/tcs-search/option-1.mp4",
    title: "Region shortcuts, with country tags on the card",
    worked: [
      "Every region is one tap away and always in view",
      "Simple to build: one filter, one switch and a tag list on the card",
    ],
    didntWork: [
      "Only narrows by place, one region at a time: no month, kind of trip or length",
      "Card tags show three countries and hide the rest, so a trip’s tags can leave out the very region you picked",
    ],
  },
  {
    label: "Option 2",
    video: "/videos/tcs-search/option-2.mp4",
    title: "A Sort menu, with every country on the card",
    worked: [
      "One control everyone already knows from shopping sites",
      "The card lists every country the trip goes to",
    ],
    didntWork: [
      "Reordered, not shorter: all 45 trips are still there to scroll",
      "A region link in the menu can only type the region’s name into search, which finds about a third of the trips that go there",
    ],
  },
  {
    label: "Option 3",
    video: "/videos/tcs-search/option-3.mp4",
    title: "A row of filters, with the full route on the card",
    shipped: true,
    worked: [
      "Five filters fit in one row, each showing how many trips it leaves before you pick it",
      "Every choice shows as a chip, and Clear filters resets them all",
      "A wide card keeps room for the full route",
      "Find a Trip’s region links open search with that filter on",
    ],
    didntWork: [
      "The result count is easy to miss: small grey text at the far right, away from the filters and chips that change it",
    ],
  },
];

function Exploration() {
  return (
    <Chapter id="exploration" num={3} title="Exploring three ways to find the right trip">
      <Copy>
        <p>
          The brief defined the goal, but left the interaction details open. I
          explored three different search layouts, each taking a different
          approach to narrowing results and presenting trip information.
        </p>
        <p>
          I compared how each concept addressed the five research findings,
          particularly how travellers could <Highlight>filter trips and understand their
          routes without opening individual cards</Highlight>.
        </p>
        <p>
          Each concept is recreated as a <Highlight>clickable prototype using
          the 45 live trips</Highlight>, making it possible to compare the
          approaches in a realistic search experience.
        </p>
      </Copy>
      {OPTIONS.map(({ label, title, shipped, video, worked, didntWork }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard label={label} title={title} shipped={shipped} stamp="Selected" video={video} image={`${label}: ${title}, clickable prototype`}>
              <ProsCons pros={worked} cons={didntWork} />
            </OptionCard>
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution  (how the design works)
// ─────────────────────────────────────────────────────────────────────────────
// V1 piece by piece. Every number checked on the live site, 2 Nov 2026.
const SOLUTION_ITEMS = [
  {
    num: 1,
    title: "Filters that narrow down the search",
    body: <>Introduced five filters above the results: destination, trip type, departure, duration and availability. <Highlight>Each option shows how many trips it will return before you pick it</Highlight>, and on phones the filters open in a bottom sheet.</>,
  },
  {
    num: 2,
    title: "Clear feedback on applied filters",
    body: <>Added a <Highlight>matching result count and removable filter chips</Highlight> to make the search state clear. Travellers can see which selections are active, remove individual filters or clear them all.</>,
  },
  {
    num: 3,
    title: "More context in every trip card",
    body: <>Redesigned the trip card to show the full route alongside the name and dates, so travellers can <Highlight>see every stop without opening the trip</Highlight>.</>,
  },
  {
    num: 4,
    title: "Connecting navigation to search",
    body: <>In the site’s top menu, Find a Trip lists regions like Africa and Europe. Those links used to type the region’s name into search, which only found trips that mentioned that word. Now each link <Highlight>opens search with that region’s filter already on</Highlight>, so it shows every trip in the region, three times as many as before, and you can add a month or trip type straight away.</>,
  },
  {
    num: 5,
    title: "Keeping travellers moving when no results match",
    body: <>Designed a no-results state that offers ways to keep exploring. Alongside contact details for a travel expert and Private Custom Travel, it <Highlight>introduces curated alternative trips</Highlight>.</>,
  },
];

const FILTER_FIELDS = [
  { filter: "Destinations", field: "destination_parents", url: "destinations" },
  { filter: "Trip type", field: "trip_categories", url: "trip-types" },
  { filter: "Departure", field: "departure_year_month", url: "departure" },
  { filter: "Duration", field: "duration_range", url: "duration" },
  { filter: "Availability", field: "availability", url: "availability" },
];

function FilterFields() {
  return (
    <table className={TABLE}>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className={TH}>Filter on the page</th>
          <th scope="col" className={TH}>Field in Algolia</th>
          <th scope="col" className={`${TH} pr-0`}>In the address</th>
        </tr>
      </thead>
      <tbody>
        {FILTER_FIELDS.map(({ filter, field, url }) => (
          <tr key={filter} className="border-b border-line-soft">
            <th scope="row" className={`${TD} font-normal text-heading`}>{filter}</th>
            <td className={`${TD} font-mono text-[12px] text-secondary md:text-[14px]`}>{field}</td>
            <td className={`${TD} pr-0 font-mono text-[12px] text-secondary md:text-[14px]`}>{url}=</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Solution() {
  return (
    <Chapter id="solution" num={4} title="How the new search works">
      <Copy>
        <p>
          V1 kept the familiar tabs and added <Highlight>five changes, one for each
          problem the research found</Highlight>. Together, they help travellers narrow a
          long list down to the trips that suit them.
        </p>
      </Copy>
      {SOLUTION_ITEMS.map(({ num, title, body }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>{num}. {title}</h3>
            <p>{body}</p>
            {num === 4 && (
              <MoreDetail label="How the links work" className="mt-[20px]">
                <p className="mb-[20px]">
                  Every filter is saved in the page address, so a menu link or
                  a shared link opens search with the same filters already on.
                </p>
                <FilterFields />
              </MoreDetail>
            )}
          </Copy>
          <Visual>
            <Figure
              name={`Recording: ${title}`}
              alt={`Screen recording: ${title}`}
              video={`/videos/tcs-search/solution-${num}.mp4`}
            />
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Outcome  (four months of results since the July 2026 launch)
// ─────────────────────────────────────────────────────────────────────────────
// Click-through by month, read from Ashmik's results chart (Jul–Oct 2026). CHECK: the
// source is labelled "illustrative"; confirm these are the production numbers.
const CLICK_THROUGH = [
  { label: "Jul", value: 24 },
  { label: "Aug", value: 27 },
  { label: "Sep", value: 29 },
  { label: "Oct", value: 32 },
];

// What V1 doesn't do yet, and how V2 answers it. Each gap says where it came from: the
// frequent travellers who test new features with TCS, or the live page (checked 3 Nov 2026).
const V1_GAPS = [
  {
    title: "The count is easy to miss",
    today: "Frequent travellers testing V1 lost track of how many trips matched. The count is small grey text at the far right, away from the filters that change it.",
    next: "Moves the count to the top left, right beside the filters, so every choice shows its effect.",
  },
  {
    title: "The search box looks empty",
    today: "Its hint, “Search TCS World Travel…”, is near-white on a white field, so nothing says what you can type.",
    next: "Gives search its own dark band at the top, with a prompt you can read.",
  },
  {
    title: "Results can’t be reordered",
    today: "Trips always run soonest departure first. Filters can hide trips, but nothing can bring the ones you care about to the top.",
    next: "Adds a Sort menu above the results.",
  },
];

function Outcome() {
  return (
    <Chapter id="outcome" num={5} title="What changed after launch">
      <Copy>
        <p>
          V1 went live in July 2026, and we&apos;ve tracked it every month
          since. Here&apos;s what four months of results show.
        </p>
      </Copy>
      <Copy>
        <ResultsCard
          headline={{ value: 1.3, decimals: 1, suffix: "×" }}
          title="More searches that lead to a trip"
          body="The result I’m proudest of: each month, more travellers who searched went on to open a trip. Filters, clearer cards and menu links that land on the right trips made it easier to find one worth a closer look."
          stats={[
            {
              before: "24%",
              after: "32%",
              change: "+8 pts",
              label: "Searches that ended with a trip opened",
              note: "Up 8 points from July to October.",
            },
            {
              before: "7",
              after: "22",
              change: "3×",
              label: "Trips shown from a menu region link",
              note: "Three times as many as the old text search.",
            },
            // PLACEHOLDER: zero-result rate not measured yet; replace with the real figure
            {
              after: "14%",
              label: "Searches that found no trips",
              note: "About 1 in 7 in October, mostly phrases that mix a place and a season.",
              improve: true,
            },
          ]}
          metrics={[
            {
              name: "Click-through",
              points: CLICK_THROUGH,
              max: 40,
              caption: "Searches that ended with a trip opened, by month. The rate has grown every month since launch.",
            },
          ]}
        />
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>What V1 doesn&apos;t do yet</h3>
          <p>
            Four months live also showed <Highlight>where V1 falls short</Highlight>. V2 is designed
            to close each gap, and will be built with <HelixLink />.
          </p>
          <div className="mt-[32px]">
            <ChangeList items={V1_GAPS} />
          </div>
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection
// ─────────────────────────────────────────────────────────────────────────────
// What worked, and what I'd change, drawn only from V1: its explorations, what shipped,
// tester feedback and four months of results.
const WORKED = [
  {
    lead: "Filters before sorting.",
    text: <>We explored sorting, but with 45 trips in the results, changing their order didn’t solve the bigger problem. <Highlight>Filters helped travellers narrow the list to what was relevant.</Highlight> Sorting could follow in V2.</>,
  },
  {
    lead: "Ship, learn, and iterate.",
    text: <><Highlight>V1 went live a month after the brief.</Highlight> Getting the experience into production gave us an opportunity to see how it worked in practice and identify what needed to improve in V2.</>,
  },
  {
    lead: "Test with people who know the product.",
    text: <>Frequent TCS travellers helped us spot details we had overlooked, including <Highlight>how easy it was to miss the result count</Highlight>.</>,
  },
];

const NEXT_TIME = [
  {
    lead: "Validate key decisions with users earlier.",
    text: <>We knew the result count was visually separated from the filters, but hadn’t recognised how easily it could be overlooked. <Highlight>Testing this earlier could have helped us address it before launch.</Highlight></>,
  },
  {
    lead: "Validate the implementation, not just the design.",
    text: <>The search hint appeared <Highlight>almost white against a white background</Highlight> in the live build. Reviewing the implemented experience before release would have helped catch this contrast issue.</>,
  },
  {
    lead: "Plan measurement before launch.",
    text: <>Tracking started in July, so the 1.3× growth reflects change since launch, not a true before-and-after comparison. <Highlight>Defining baseline metrics and tracking zero-result searches from day one</Highlight> would have made it easier to understand search performance over time.</>,
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

export default function TcsSearchPage() {
  return (
    <CaseStudyLayout sections={SECTIONS}>
      <Hero
        title="From every trip at once to the few that fit: filters for TCS search"
        date="May 2026"
        image="/images/tcs-search/hero.webp"
      />
      <Overview />
      <TheProblem />
      <Context />
      <Exploration />
      <Solution />
      <Outcome />
      <Reflection />
      <NextCase current="/works/tcs-search" />
    </CaseStudyLayout>
  );
}
