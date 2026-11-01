import type { Metadata } from "next";
import { DeviceMobile, Funnel, MagnifyingGlass, PaintBrush } from "@phosphor-icons/react/dist/ssr";
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
  StatTiles,
  MoreDetail,
  NextCase,
  ProsCons,
  NumberedPoints,
  Timeline,
  OptionCard,
  Footnote,
} from "@/components/case-study";

// DRAFT — first pass at TCSWT-1151 (site search filters). Built from
// case-studies/tcs-search-notes.md; copy is a starting point to edit section by section,
// figures are placeholders until the Figma exports are in. Lines marked TODO wait on
// Ashmik's answers (role, who moved the filters into dropdowns, team roles).

export const metadata: Metadata = {
  title: "Search that helps you narrow it down · Ashmik Ragesh",
  description:
    "Redesigned the TCS World Travel search page with filters, a result count and a no-results page that is never empty, so travellers can narrow the whole catalogue to the trips they want.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",    label: "Overview"    },
  { id: "the-problem", label: "The Problem" },
  { id: "discovery",   label: "Discovery"   },
  { id: "exploration", label: "Exploration" },
  { id: "solution",    label: "Solution"    },
  { id: "output",      label: "What shipped" },
  { id: "outcome",     label: "Where it stands" },
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
          Searching &ldquo;Summer in Japan&rdquo; on the TCS website showed
          about 48 trips, close to the whole catalogue. I redesigned the search
          page so travellers can narrow results by destination, trip type, date
          and length, and so a search that finds nothing still leads to a
          person or a trip. Developers built it, and it has been live since
          July 2026.
        </p>
        <Meta
          role={
            <>
              Product Designer. Owned the design end to end: the flow, the
              filters, and the results and no-results pages, on desktop and
              phone, through to developer handoff.
            </>
          }
          // TODO: add Travis's role once known
          team="Sharayu Jadhav (Product Owner), Travis Snelling, Sandy Tang (Content), TCS developers (Engineering)"
          timeline={<>Brief in Feb 2026, designs done May 2026<br />Live since July 2026</>}
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
    <Chapter id="the-problem" num={1} title="Travellers knew what they wanted. Search couldn't show it to them.">
      <Copy>
        <p>
          People search with a clear idea, like a place, a month or a kind of
          trip. The old page answered every search with almost all of
          TCS&apos;s 46 trips: no filters, no count, no sort, and no route on
          the cards. TCS had no search data to show what this cost them.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Every search returned close to the whole catalogue, with no way to narrow it by place, date or type of trip."
          consequence="We believed travellers who were ready to enquire gave up first, and TCS lost those leads."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Discovery  (research / inputs)
// ─────────────────────────────────────────────────────────────────────────────
const OLD_SEARCH_TILES: Parameters<typeof StatTiles>[0]["items"] = [
  { tag: "Old search", stat: "~48", label: "trip cards for “Summer in Japan”, close to the whole catalogue" },
  { tag: "Filters", stat: "0", label: "ways to narrow by place, date, trip type or length", tone: "key" },
  { tag: "Industry", stat: "34%", label: "of sites filter this poorly, so people can’t narrow a long list", tone: "estimate" },
];

// How site search got here, step by step (from the two tickets and the live site)
const SEARCH_HISTORY = [
  { when: "Before Aug 2025", step: "One mixed list", change: "Trips, destinations and articles in a single list" },
  { when: "Aug 2025", step: "Tabs and quick links", change: "Three tabs split the list by type; still 252 results for a Japan search" },
  { when: "Early 2026", step: "The page I started from", change: "Tabs live, but “Summer in Japan” still shows about 48 trips" },
  { when: "Feb–May 2026", step: "This project", change: "Filters, chips, a result count and a no-results page" },
  { when: "Jul–Oct 2026", step: "Live", change: "New search on Algolia, menu links open filtered results" },
];

function SearchHistory() {
  return (
    <table className={TABLE}>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className={TH}>When</th>
          <th scope="col" className={TH}>Step</th>
          <th scope="col" className={`${TH} pr-0`}>What changed</th>
        </tr>
      </thead>
      <tbody>
        {SEARCH_HISTORY.map(({ when, step, change }) => (
          <tr key={when} className="border-b border-line-soft">
            <td className={`${TD} whitespace-nowrap text-muted`}>{when}</td>
            <th scope="row" className={`${TD} font-normal text-heading`}>{step}</th>
            <td className={`${TD} pr-0 text-secondary`}>{change}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const CONTEXT_CARDS = [
  {
    icon: <Funnel size={28} weight="fill" className="text-grape" />,
    title: "The brief had no filter list",
    description:
      "It asked for filters on trip details and availability, but the list itself was empty. Choosing which filters, and how many, was part of the job.",
  },
  {
    icon: <PaintBrush size={28} weight="fill" className="text-grape" />,
    title: "New branding, familiar patterns",
    description:
      "The page had to match the new TCS website style, and the brief pointed to the filters on Enchanting Travels as the pattern to restyle.",
  },
  {
    icon: <DeviceMobile size={28} weight="fill" className="text-grape" />,
    title: "Phones and a way back",
    description:
      "Filters had to adapt to small screens with clear touch targets, and there had to be one tap to clear them all.",
  },
  {
    icon: <MagnifyingGlass size={28} weight="fill" className="text-grape" />,
    title: "No search data to start from",
    description:
      "There were no numbers on what people searched for or how often they found nothing. The design leaned on TCS's own suggested searches and its menu.",
  },
];

function Context() {
  return (
    <Chapter id="discovery" num={2} title="What we knew going in">
      <div className="cs-sub">
        <Copy>
          <h3>Tabs sorted the pile, but didn&apos;t shrink it</h3>
          <p>
            This wasn&apos;t the first fix. In August 2025 the search page got
            three tabs, Expeditions, Destinations and Guides &amp; Resources, so
            trips no longer sat mixed in with articles. It made the list tidier,
            not shorter: a search still couldn&apos;t be narrowed by where, when
            or what kind of trip.
          </p>
          <MoreDetail label="How site search got here" className="mt-[20px]">
            <SearchHistory />
          </MoreDetail>
        </Copy>
        <Visual>
          <StatTiles items={OLD_SEARCH_TILES} />
          <Footnote>
            Old search counted from the live page as captured in the design file. Industry figure:{" "}
            <a href="https://baymard.com/ecommerce-product-lists/benchmark/page-types/filtering-options" target="_blank" rel="noreferrer">
              Baymard, filtering benchmark of 344 sites
            </a>
            .
          </Footnote>
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What shaped the design</h3>
          <p>
            Four things set the rules before I drew anything: two from the
            brief, one about phones, and one about what we didn&apos;t know.
          </p>
        </Copy>
        <Visual>
          <CardGrid items={CONTEXT_CARDS} />
        </Visual>
        <Copy>
          <p>
            <strong>What success looked like:</strong> a traveller can get from
            a broad search to the handful of trips that fit, and a search that
            finds nothing still offers a next step.
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
  worked: string[];
  didntWork: string[];
};

// The earlier fix, my design, and what went live
const OPTIONS: OptionItem[] = [
  {
    label: "Option 1",
    title: "Tabs only, the August 2025 fix",
    worked: [
      "Trips, destinations and articles no longer sit in one list",
      "Quick links in the search box offer popular searches",
    ],
    didntWork: [
      "A Japan search still returned 252 results",
      "No way to narrow by place, date, trip type or length",
    ],
  },
  {
    label: "Option 2",
    title: "A sidebar of checkbox filters, my design",
    worked: [
      "Every option is visible at once, with a count for the results",
      "Chosen filters show as chips above the results, with Clear All",
      "Room for all 11 destinations without hiding any",
    ],
    didntWork: [
      "Takes a column away from the trip cards",
      "On a phone it has to become a separate sheet",
    ],
  },
  {
    label: "Option 3",
    title: "A row of filter dropdowns",
    shipped: true,
    worked: [
      "Results keep the full width of the page",
      "The same five filters open as a sheet on a phone",
    ],
    didntWork: [
      "Options stay hidden until a dropdown is opened",
      "Sort was left out",
    ],
  },
];

function Exploration() {
  return (
    <Chapter id="exploration" num={3} title="Three ways to narrow the results">
      <Copy>
        <p>
          The brief named the goal but not the filters. I worked out which
          filters TCS buyers needed and how they should sit on the page. These
          are the three layouts the page has gone through.
        </p>
        {/* TODO: who moved the filters into dropdowns after handoff, and why (Ashmik) */}
      </Copy>
      {OPTIONS.map(({ label, title, shipped, worked, didntWork }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard label={label} title={title} shipped={shipped} stamp="Live" image={`${label} — ${title}`}>
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
const SOLUTION_ITEMS = [
  {
    num: 1,
    title: "Five filters, picked from how people choose a trip",
    body: "Destination, trip type, departure month, length and availability. These are the questions a traveller answers before they enquire.",
  },
  {
    num: 2,
    title: "A count and chips you can undo",
    body: "A line above the results says how many trips match. Each filter you pick shows as a chip with an ×, and Clear All resets the page in one tap.",
  },
  {
    num: 3,
    title: "Cards that say where a trip goes",
    body: "Each trip card shows its status, the number of destinations, the full route and the dates, so you can compare trips without opening them.",
  },
  {
    num: 4,
    title: "A no-results page that's never empty",
    body: "It says plainly that nothing matched, gives the phone number for a travel expert, links to Private Custom Travel, and lists real trips underneath. Nearly half of sites get this page wrong.",
  },
];

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
          The page keeps the three tabs and adds what was missing: a way to
          narrow, a way to see what you&apos;ve narrowed, and a way out when
          nothing fits.
        </p>
      </Copy>
      {SOLUTION_ITEMS.map(({ num, title, body }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>{num}. {title}</h3>
            <p>{body}</p>
            {num === 4 && (
              <Footnote>
                Source:{" "}
                <a href="https://baymard.com/research-articles/no-results-page" target="_blank" rel="noreferrer">
                  Baymard, no-results page research
                </a>
                .
              </Footnote>
            )}
          </Copy>
          <Visual>
            <Figure label={`Solution ${num} — ${title}`} />
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: What shipped  (output — the live page against the design)
// ─────────────────────────────────────────────────────────────────────────────
const DESIGN_VS_LIVE = [
  { part: "Filters", design: "A sidebar of checkboxes", live: "A row of five dropdowns; a sheet on phones" },
  { part: "Tabs", design: "Expeditions, Destinations, Guides & Resources", live: "All, Trips, Destinations, Resources" },
  { part: "Sort", design: "Sort by relevance", live: "No sort; trips by departure date" },
  { part: "Count and chips", design: "Count, chips, Clear All", live: "Kept" },
  { part: "No results", design: "Message, phone, two links, real trips", live: "Kept, almost one to one" },
  { part: "Menu links", design: "—", live: "Open search with a destination filter on" },
];

function DesignVsLive() {
  return (
    <table className={TABLE}>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className={TH}>Part</th>
          <th scope="col" className={TH}>My design, May</th>
          <th scope="col" className={`${TH} pr-0`}>Live, October</th>
        </tr>
      </thead>
      <tbody>
        {DESIGN_VS_LIVE.map(({ part, design, live }) => (
          <tr key={part} className="border-b border-line-soft">
            <th scope="row" className={`${TD} font-normal text-heading`}>{part}</th>
            <td className={`${TD} text-secondary`}>{design}</td>
            <td className={`${TD} pr-0 text-secondary`}>{live}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Output() {
  return (
    <Chapter id="output" num={5} title="What shipped">
      <Copy>
        <p>
          The new search went live in July 2026 at a new address, /search, on
          Algolia. Most of the design shipped as drawn. A few parts changed in
          the build.
        </p>
        <div className="!mt-[32px]">
          <DesignVsLive />
        </div>
      </Copy>
      <Visual>
        <Figure label="The live search page, October 2026" />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>How the developers built it</h3>
          <p>
            The developers built the new search on Algolia, a hosted search
            service. Each filter in the design became a field in its search
            index, and the filters are saved in the page address, so a link can
            open search with a filter already on and people can share what they
            found.
          </p>
          <MoreDetail label="Each filter and its field" className="mt-[20px]">
            <FilterFields />
          </MoreDetail>
        </Copy>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>The menu now lands on a filtered page</h3>
          <p>
            Because filters live in the page address, all 11 Find a Trip menu
            links now open search with a filter already on. Before, they ran a
            text search, which ranked by matching words. Now Africa shows the
            same 23 trips, but as a filter you can see and remove.
          </p>
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Outcome  (where it stands: what's known, estimated, and next)
// ─────────────────────────────────────────────────────────────────────────────
const OUTCOME_TILES: Parameters<typeof StatTiles>[0]["items"] = [
  { tag: "Menu links", stat: "0 → 11", label: "Find a Trip links that open a filtered search", tone: "key" },
  { tag: "Est.", stat: "~9%", label: "of searches return nothing, from 33 test searches", tone: "estimate" },
  { tag: "Est.", stat: "~2,000", label: "searches a week, from public traffic data", tone: "estimate" },
];

const NEXT_STEPS = [
  { title: "Understand sentences", description: "4 of 6 sentence searches found nothing. Add synonyms and query rules." },
  { title: "Measure it", description: "Use Algolia Analytics for top searches, no-result searches and filter use." },
  { title: "Close the gaps", description: "Fix the last text-search menu link, and decide on sort." },
];

function Outcome() {
  return (
    <Chapter id="outcome" num={6} title="Where it stands">
      <Copy>
        <p>
          The search is live, but its analytics weren&apos;t shared with the
          design team, so there&apos;s no measured before and after. What I
          could check, I checked on the live site.
        </p>
      </Copy>
      <Visual>
        <StatTiles items={OUTCOME_TILES} />
        <Footnote>
          Estimates, not TCS data. No-result rate from 33 searches run on the live site on 31 Oct
          2026, weighted towards short searches. Searches a week from public traffic ranking and{" "}
          <a href="https://www.luigisbox.com/blog/site-search-data/" target="_blank" rel="noreferrer">
            Luigi&apos;s Box data from 4,000 sites
          </a>
          .
        </Footnote>
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>What the test searches showed</h3>
          <p>
            Places, themes and typos all worked: &ldquo;Antartica&rdquo; and
            &ldquo;Machu Pichu&rdquo; still found their trips. Sentences
            didn&apos;t. &ldquo;Summer in Japan&rdquo; now finds nothing, and so
            does the example search in my own design, &ldquo;Luxury world tour
            for 25th anniversary next year&rdquo;. That&apos;s the next problem
            to solve, because it&apos;s how TCS travellers talk.
          </p>
          <Timeline items={NEXT_STEPS} />
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection
// ─────────────────────────────────────────────────────────────────────────────
// TODO: Ashmik to rewrite in his own words; these are placeholders from the notes
const LESSONS = [
  {
    title: "A tidier list isn't a shorter one",
    description: "Tabs sorted the results but didn't help anyone narrow them. Filters did.",
  },
  {
    title: "Search has to understand how people talk",
    description: "Names and typos worked; sentences didn't. A traveller's own words are the next thing to design for.",
  },
];

function Reflection() {
  return (
    <Chapter id="reflection" num={7} title="What I learned">
      <Copy>
        <NumberedPoints items={LESSONS} />
        <p>
          <strong>The empty state is a page too.</strong> The search that
          finds nothing is where a traveller is most likely to give up, so it
          got the same care as the results.
        </p>
      </Copy>
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
      <Output />
      <Outcome />
      <Reflection />
      <NextCase current="/works/tcs-search" />
    </CaseStudyLayout>
  );
}
