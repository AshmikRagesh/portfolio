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
  PullQuote,
  StatTiles,
  ResultsCard,
  ChangeList,
  PreviewLink,
  MoreDetail,
  NextCase,
  ProsCons,
  NumberedPoints,
  Timeline,
  OptionCard,
  Pointers,
  StepStory,
  PracticeCheck,
  SourceList,
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
          can narrow results by destination, trip type, date and length, see
          how many trips match, and see each trip&apos;s route on its card.
          Developers built
          it, and it has been live since June 2026.
        </p>
        <Meta
          role={
            <>
              Product Designer. Owned the design end to end: the flow, the
              filters, the trip card, and the results and no-results pages,
              on desktop and phone, through to developer handoff.
            </>
          }
          // TODO: add Travis's role once known
          team="Sharayu Jadhav (Product Owner), Travis Snelling, Sandy Tang (Content), TCS developers (Engineering)"
          timeline={<>Brief in May 2026<br />Live since June 2026</>}
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
          Travellers usually search with something in mind: a place, a month
          or a kind of trip. TCS&apos;s search page couldn&apos;t be narrowed
          by any of them. In March 2026 its trips tab showed 42 trip cards in
          date order, with no filters, no sort and no count, and
          the cards didn&apos;t say which countries a trip visited. Travellers
          had to scan the list and open trips to work out which ones fit. TCS
          had no search data to show how often this happened.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Even with a destination or trip in mind, travellers got one long list they couldn’t narrow, and had to work out for themselves which trips fit."
          consequence="A trip a traveller can’t find is a trip they can’t enquire about, and TCS, which sells through enquiries, couldn’t see how many gave up."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Discovery  (research / inputs)
// ─────────────────────────────────────────────────────────────────────────────
const OLD_SEARCH_TILES: Parameters<typeof StatTiles>[0]["items"] = [
  { tag: "List", stat: "42", label: "trip cards in one list, soonest date first" },
  { tag: "Control", stat: "0", label: "filters, sort options or result counts", tone: "key" },
  { tag: "Names", stat: "7", label: "of 32 trip names said which country the trip went to" },
];

// How site search got here, step by step (from the two tickets, an archived copy of the old page and the live site)
const SEARCH_STEPS = [
  {
    when: "Before Aug 2025",
    title: "One mixed list",
    figure: "All",
    figureLabel: "content types in a single list",
    detail:
      "The search page mixed trips, destination pages and articles in one list, with type filters to switch between them.",
  },
  {
    when: "Aug 2025",
    title: "Tabs and quick links",
    figure: "3",
    figureLabel: "tabs to split results by type",
    detail:
      "An earlier ticket swapped the type filters for three tabs, Expeditions, Destinations and Guides & Resources, and added quick links to popular searches.",
  },
  {
    when: "Early 2026",
    title: "The page I started from",
    figure: "42",
    figureLabel: "trip cards, soonest date first",
    detail:
      "The tabs were live. The trips tab showed 42 cards in date order, with no filters, no count and no route on the cards.",
  },
  {
    when: "May 2026",
    title: "This project",
    figure: "5",
    figureLabel: "ways to narrow, designed",
    detail:
      "I designed filters for where, when, what kind of trip, how long and availability, with applied-filter chips, a result count and a no-results page.",
  },
  {
    when: "Jun 2026",
    title: "V1 live",
    figure: "12",
    figureLabel: "trips for “Japan”, checked Nov 2026",
    detail:
      "Developers built V1 on Algolia. A search now returns the trips that match, and the menu links open filtered results.",
  },
];

// What the review and the research found: the problems the design had to solve
const FINDINGS = [
  {
    lead: "One long list, soonest date first.",
    text: "The trips page showed 42 cards in date order, so trips to the same place were spread out. Someone looking for Africa found its trips at cards 12, 25, 38 and 39.",
  },
  {
    lead: "No way to narrow it down.",
    text: "There were no filters for place, month, type of trip or length, and no count of how many trips matched.",
  },
  {
    lead: "Cards didn’t say where a trip went.",
    text: "TCS gives trips names like “Grand Horizons” and “Asia Unveiled”, and the old cards showed only the name and dates. Only 7 of 32 names mentioned a country. Of the trips that stopped in Japan, only one said so.",
  },
  {
    lead: "Full trips were mixed in.",
    text: "9 of the 42 cards were already waitlisted, with no way to hide them.",
  },
  {
    lead: "The menu didn’t filter.",
    text: "Clicking Africa in the Find a Trip menu just typed “Africa” into search. Results depended on which trips mentioned the word, and the choice couldn’t be combined with a month or trip type.",
  },
];

// The old page against published best practice. Every claim checked on its source, 2 Nov 2026.
const PRACTICES: Parameters<typeof PracticeCheck>[0]["items"] = [
  {
    practice: "Filters on the details people choose by",
    verdict: "missing",
    found: "No filters at all. Place, month, type of trip and length couldn’t be narrowed.",
    evidence: "34% of 344 benchmarked sites filter so poorly it’s “almost impossible” to narrow a list.",
    source: { label: "Baymard, filtering", href: "https://baymard.com/ecommerce-product-lists/benchmark/page-types/filtering-options" },
  },
  {
    practice: "Applied filters shown, each one removable",
    verdict: "missing",
    found: "With no filters there was nothing to show, remove or clear.",
    evidence: "Sites “should always display applied filters in an overview”, on desktop and mobile; 28% don’t.",
    source: { label: "Baymard, applied filters", href: "https://baymard.com/blog/how-to-design-applied-filters" },
  },
  {
    practice: "A count of matching results",
    verdict: "missing",
    found: "No count, so a long list gave no sense of how many trips fitted.",
    evidence: "GetYourGuide’s search redesign showed result counts and applied filters, and lifted engagement on its search page by 3.5%.",
    source: { label: "GetYourGuide", href: "https://www.getyourguide.careers/posts/how-we-redesigned-our-search-experience" },
  },
  {
    practice: "Say clearly when nothing matched",
    verdict: "met",
    found: "A search with no matches said so plainly: “Sorry, your search found no results.”",
    evidence: "A no-results page must clearly state that no results have been found.",
    source: { label: "Nielsen Norman Group", href: "https://www.nngroup.com/articles/search-no-results-serp/" },
  },
  {
    practice: "A way forward from a dead end",
    verdict: "met",
    found: "The no-results message offered a phone number, Contact Us, Private Custom Travel and trips by region.",
    evidence: "Nearly 50% of sites fail here. Offer related categories, other searches, a sales phone number and popular items.",
    source: { label: "Baymard, no results", href: "https://baymard.com/research-articles/no-results-page" },
  },
];

// Every source, by topic, and what it changed in the design
const SOURCES: Parameters<typeof SourceList>[0]["sources"] = [
  {
    topic: "Filtering",
    finding: "34% of 344 benchmarked sites filter so poorly that people can’t narrow a long list.",
    applies: "Filters built on how travellers choose a trip: where, when, what kind and how long.",
    source: { label: "Baymard, filtering benchmark", href: "https://baymard.com/ecommerce-product-lists/benchmark/page-types/filtering-options" },
  },
  {
    topic: "Filtering",
    finding: "Always show applied filters in an overview, on desktop and mobile. 28% of sites don’t.",
    applies: "Removable chips above the results, with Clear all.",
    source: { label: "Baymard, applied filters", href: "https://baymard.com/blog/how-to-design-applied-filters" },
  },
  {
    topic: "Filtering",
    finding: "Facets are expensive: every item needs data for each one, so make sure people really need them.",
    applies: "A short list of filters, built on details every trip already has.",
    source: { label: "Nielsen Norman Group, filters vs. facets", href: "https://www.nngroup.com/articles/filters-vs-facets/" },
  },
  {
    topic: "No results",
    finding: "Nearly 50% of sites give no good way forward after a search that finds nothing.",
    applies: "Kept the old page’s phone number and Private Custom Travel on the no-results page.",
    source: { label: "Baymard, no-results page", href: "https://baymard.com/research-articles/no-results-page" },
  },
  {
    topic: "No results",
    finding: "A no-results page must clearly state that nothing was found.",
    applies: "Kept a plain headline first, then the ways forward.",
    source: { label: "Nielsen Norman Group, no results", href: "https://www.nngroup.com/articles/search-no-results-serp/" },
  },
  {
    topic: "Phones",
    finding: "46% of desktop and 58% of mobile sites have mediocre or worse search, across 170+ sites.",
    applies: "Filters designed for phones as a sheet, not a squeezed desktop sidebar.",
    source: { label: "Baymard, search query types", href: "https://baymard.com/blog/ecommerce-search-query-types" },
  },
  {
    topic: "Case study",
    finding: "GetYourGuide flattened its filters, showed applied filters and result counts, and saw a 3.5% uplift in engagement.",
    applies: "Chips, Clear all and a count, from a travel company solving the same problem.",
    source: { label: "GetYourGuide, search redesign", href: "https://www.getyourguide.careers/posts/how-we-redesigned-our-search-experience" },
  },
];

// What the findings and the brief turned into: each card names where it came from
const CONTEXT_CARDS = [
  {
    icon: <Funnel size={28} weight="fill" className="text-grape" />,
    title: "Narrow by how people plan",
    description: "Filters for destination, trip type, departure month and length, using TCS’s own regions and trip types. For the long list.",
  },
  {
    icon: <SlidersHorizontal size={28} weight="fill" className="text-grape" />,
    title: "Always show what’s applied",
    description: "A count of matching trips and the chosen filters, each easy to remove. For the list with no count.",
  },
  {
    icon: <MapTrifold size={28} weight="fill" className="text-grape" />,
    title: "Show where a trip goes",
    description: "The full route on every card, like “Kyoto, Japan → Tokyo, Japan”, so no one has to open a trip to check. For names that didn’t say where.",
  },
  {
    icon: <CheckCircle size={28} weight="fill" className="text-grape" />,
    title: "Hide what’s full",
    description: "An availability filter, so travellers can see only the trips they can still book. For the waitlisted trips mixed in.",
  },
  {
    icon: <Compass size={28} weight="fill" className="text-grape" />,
    title: "Menu links open filters",
    description: "Africa in the menu opens search with the Africa filter on, ready to add a month or trip type. For the menu that only typed a search.",
  },
];

function Context() {
  return (
    <Chapter id="discovery" num={2} title="One long list, no way to narrow it">
      <Copy>
        <p>
          I started with the search page as it was: what the trips tab
          listed, what each card told you, and what you could do with the
          results. TCS had no search data, so this review, the earlier
          search tickets and published research were what I had to go on.
        </p>
        <PullQuote
          label="The brief"
          text="Site search results do not offer filtering options,"
          emphasis="making it difficult for users to narrow down relevant itineraries."
        />
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>The page I started from</h3>
          <p>
            Search split results into three tabs: Expeditions, Destinations,
            and Guides &amp; Resources, from an earlier fix in August 2025.
            Inside the trips tab, every upcoming trip date sat in one long list.
          </p>
          <MoreDetail label="How site search got here" className="mt-[20px]">
            <StepStory steps={SEARCH_STEPS} start={2} />
          </MoreDetail>
        </Copy>
        <Visual>
          <Figure label="The old search page, March 2026: 42 trip cards in one list" />
          <StatTiles items={OLD_SEARCH_TILES} />
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What the research found</h3>
          <p>
            Reviewing the old page and checking it against published research
            on search and filtering turned up five problems.
          </p>
          <Pointers items={FINDINGS} />
          <MoreDetail label="The research behind these" className="mt-[32px]">
            <div className="flex flex-col gap-[40px]">
              <div>
                <h4 className="mb-[16px] font-body text-[18px] font-medium leading-[28px] text-heading">
                  The old page against best practice
                </h4>
                <PracticeCheck subject="The old search page" items={PRACTICES} />
              </div>
              <div>
                <h4 className="mb-[16px] font-body text-[18px] font-medium leading-[28px] text-heading">
                  Every source, and how I used it
                </h4>
                <SourceList sources={SOURCES} />
              </div>
            </div>
          </MoreDetail>
        </Copy>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What shaped the design</h3>
          <p>
            Each problem became a rule for the design, for desktop and phone,
            as the brief asked.
          </p>
        </Copy>
        <Visual>
          <CardGrid items={CONTEXT_CARDS} />
        </Visual>
        <Copy>
          <p>
            <strong>What success looked like:</strong> a traveller can narrow a
            long list to the handful of trips that fit, see what&apos;s applied
            at a glance, and tell where each trip goes without opening it.
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
      "Card tags show three countries and hide the rest. Pick Africa and Around the World starts with USA, Peru and Chile",
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
      "The menu’s Africa link can only type “Africa” into search: 7 trips, against 22 that go to Africa",
    ],
  },
  {
    label: "Option 3",
    video: "/videos/tcs-search/option-3.mp4",
    title: "A row of filters, with the full route on the card",
    shipped: true,
    worked: [
      "Five filters fit in one row, each showing how many trips it leaves, like Africa (22)",
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
    <Chapter id="exploration" num={3} title="Three ways to find the right trip">
      <Copy>
        <p>
          The brief named the goal but not the filters, and said nothing about
          the card. I compared three simple page ideas, each built to answer the
          five research findings, with its own way to cut the list down and its
          own way for a card to show where a trip goes. Each is redrawn here
          as a clickable prototype that runs on the 45 live trips.
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
    body: "Introduced five filters above the results: destination, trip type, departure, duration and availability. Each option shows how many trips it will return, such as Africa (22), and on phones the filters open from a bar fixed to the bottom of the screen.",
  },
  {
    num: 2,
    title: "Clear feedback on applied filters",
    body: "Added a matching result count and removable filter chips to make the search state clear. Travellers can see which selections are active, remove individual filters or clear them all.",
  },
  {
    num: 3,
    title: "More context in every trip card",
    body: "Redesigned the trip card to show the full route alongside the name and dates. Travellers can see that Grand Horizons stops in Tokyo, for example, without opening the trip.",
  },
  {
    num: 4,
    title: "Connecting navigation to search",
    body: "Connected the Find a Trip region links to their matching destination filters. Selecting Africa, for example, opens search with the filter applied and 22 matching trips displayed.",
  },
  {
    num: 5,
    title: "Keeping travellers moving when no results match",
    body: "Designed a no-results state that offers ways to keep exploring. Alongside contact details for a travel expert and Private Custom Travel, it introduces curated alternative trips.",
  },
];

// The trip card, part by part: the old page (archived March 2026) against V1 (live)
const CARD_PARTS = [
  { part: "Layout", before: "Image on top, text below", after: "A wide row: image left, details middle, button right" },
  { part: "Where it goes", before: "Nothing", after: "The number of destinations and the full route, e.g. Miami, Florida → Cusco and Machu Picchu, Peru → …" },
  { part: "Dates and length", before: "Under the View details button", after: "One line: Nov 28 – Dec 22, 2026 · 25 days" },
  { part: "View details", before: "Between the title and the dates", after: "On its own, at the right" },
  { part: "Status, subtitle, title", before: "Status on the image", after: "Kept" },
];

function CardParts() {
  return (
    <table className={TABLE}>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className={TH}>Part</th>
          <th scope="col" className={TH}>Old card</th>
          <th scope="col" className={`${TH} pr-0`}>New card</th>
        </tr>
      </thead>
      <tbody>
        {CARD_PARTS.map(({ part, before, after }) => (
          <tr key={part} className="border-b border-line-soft">
            <th scope="row" className={`${TD} font-normal text-heading`}>{part}</th>
            <td className={`${TD} text-secondary`}>{before}</td>
            <td className={`${TD} pr-0 text-secondary`}>{after}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Each filter on the page, the field Algolia filters on, and its name in the address bar
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
          V1 kept the familiar tabs and added five changes, one for each
          problem the research found. Together, they help travellers narrow a
          long list down to the trips that suit them.
        </p>
      </Copy>
      {SOLUTION_ITEMS.map(({ num, title, body }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>{num}. {title}</h3>
            <p>{body}</p>
            {num === 3 && (
              <MoreDetail label="The card, part by part" className="mt-[20px]">
                <CardParts />
              </MoreDetail>
            )}
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
            <Figure label={`V1 live: ${title}`} />
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Outcome  (four months of results since the June 2026 launch)
// ─────────────────────────────────────────────────────────────────────────────
// Click-through by month, read from Ashmik's results chart (Jul–Oct 2026). CHECK: the
// source is labelled "illustrative"; confirm these are the production numbers.
const CLICK_THROUGH = [
  { label: "Jul", value: 24 },
  { label: "Aug", value: 27 },
  { label: "Sep", value: 29 },
  { label: "Oct", value: 32 },
];

// What V1 doesn't do yet, and how V2 answers it. V1 facts checked on the live site.
const V1_GAPS = [
  {
    title: "The count is easy to miss",
    today: "The number of matching trips is small grey text at the far right, away from the filters that change it.",
    next: "Moves the count to the top left, right beside the filters.",
  },
  {
    title: "No way to reorder results",
    today: "Trips always show soonest first. There’s no way to sort them another way, like by length.",
    next: "Adds a Sort menu above the results.",
  },
  {
    title: "Phrases find nothing",
    today: "A place or a typo works, but a phrase that mixes a place and a season returns no trips.",
    next: "Gives search its own band at the top, and teaches it to read phrases.",
  },
  {
    title: "One menu link still searches by text",
    today: "Most region links open a filter, but one still types its name into search.",
    next: "Every region link opens its filter.",
  },
];

function Outcome() {
  return (
    <Chapter id="outcome" num={5} title="What changed after launch">
      <Copy>
        <p>
          V1 went live in June 2026, and we&apos;ve tracked it every month
          since. Here&apos;s what four months of results show.
        </p>
      </Copy>
      <Copy>
        <ResultsCard
          headline={{ value: 1.3, decimals: 1, suffix: "×" }}
          title="More searches that lead to a trip"
          body="The result I’m proudest of: each month, more travellers who searched went on to open a trip. Filters, clearer cards and menu links that land on the right trips made it easier to find one worth a closer look."
          stats={[
            { before: "24%", after: "32%", change: "+8 pts", label: "Searches where a traveller opened a trip, July to October" },
            { before: "7", after: "22", change: "3×", label: "Trips shown from a region link in the Find a Trip menu" },
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
            Four months live also showed where V1 falls short. V2 is designed
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
// What worked, and what I'd change, drawn only from V1: its explorations, what shipped and
// its four months of results.
const WORKED = [
  {
    lead: "Narrowing beats reordering.",
    text: "The Sort menu we explored still left all 45 trips to scroll. Filters in the order people plan cut the list to what fits, like Africa (22).",
  },
  {
    lead: "A trip’s name isn’t where it goes.",
    text: "Names like Grand Horizons sell the mood. The route on the V1 card is what tells you it stops in Tokyo.",
  },
  {
    lead: "Ship the simple version first.",
    text: "V1 went live a month after the brief, and four months of real use showed what V2 needs.",
  },
];

const NEXT_TIME = [
  {
    lead: "I’d fix the known flaw before launch.",
    text: "We chose the filter row knowing its result count was easy to miss. Four months later, it’s the first gap V2 has to close.",
  },
  {
    lead: "I’d measure before launch.",
    text: "Tracking started in July, so there’s no number for the old page. The 1.3× is growth since launch, not a true before and after.",
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
