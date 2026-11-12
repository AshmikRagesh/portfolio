import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ArrowsSplit, ClockCounterClockwise, FileX, HourglassMedium, Images, DeviceMobile, ListBullets, Users } from "@phosphor-icons/react/dist/ssr";
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
  ChatQuotes,
  StatTiles,
  MoreDetail,
  HelixLink,
  NextCase,
  ProsCons,
  NumberedPoints,
  ProcessStrip,
  Stats,
  OptionCard,
  Footnote,
  VariantProvider,
  VariantFigure,
  Highlight,
} from "@/components/case-study";

// DRAFT — first pass at TCSWT-1270. Copy is a starting point to edit section by section;
// figures are placeholders until the Figma exports are in.

export const metadata: Metadata = {
  title: "Letting TCS travellers explore a destination before they book · Ashmik Ragesh",
  description:
    "Designed and built a two-path choice in the TCS World Travel “Find a Trip” menu, so travellers still exploring can learn about a destination first and those ready to compare go straight to trips. Both variants are built for an A/B/C test.",
};


const SECTIONS: CaseStudySection[] = [
  { id: "overview",    label: "Overview"    },
  { id: "the-problem", label: "The Problem" },
  { id: "discovery",   label: "Discovery"   },
  { id: "exploration", label: "Exploration" },
  { id: "solution",    label: "Solution"    },
  { id: "output",      label: "Build"       },
  { id: "outcome",     label: "Where it stands" },
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
          TCS World Travel plans luxury trips around the world. I designed and
          built a new step in the website&apos;s main menu: <Highlight>after picking a
          continent, travellers choose to explore the destination or browse
          trips</Highlight>. Both variants are built in code, ready to test against the
          current menu.
        </p>
        <Meta
          role="End-to-end Design & Front-end Build"
          team="Rohit Rayala (CRO), Sharayu Jadhav (Product Manager), Hriday Gami (Design), Sandy Tang (Content)"
          timeline={<>June – July 2026<br />Briefed in June · Designs approved 15 Jul · Built for an A/B/C test</>}
        />
      </Copy>
      <Visual>
        {/* The finished work up front; the problem walkthrough sits in The Problem */}
        <Figure label="The final designs: Variant 2 (text links) and Variant 3 (image cards) in the menu" />
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
          you want to go. But luxury trips take months to plan. <Highlight>Many people
          start by exploring a place, not by comparing trips.</Highlight>
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Picking a continent sent every visitor straight to a list of trips, even people still deciding where to go."
          consequence="The CRO team measured that 38% left the trip list without opening a single trip, so TCS lost them at the very first step."
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
  { tag: "Trip search", stat: "11 of 11", label: "menu links take you straight to a list of trips" },
  { tag: "Destination pages", stat: "0", label: "menu links lead to a destination page, though 9 continents already have one" },
  { tag: "Drop-off", stat: "38%", label: "of people leave the trip list without opening a trip, measured by the CRO team", tone: "key", meter: 38 },
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

// Three on top (the people and the choice), two below (the constraints from the ticket)
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
      "The ticket named two kinds of visitor: people exploring a place, and people planning a trip. The menu only served the planners.",
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
    icon: <DeviceMobile size={28} weight="fill" className="text-grape" />,
    title: "It had to work on a phone too",
    description:
      "The test runs on desktop, iPhone and Android. Two paths had to fit a narrow menu, with taps big enough to hit.",
  },
];

function Context() {
  return (
    <Chapter id="discovery" num={2} title="What we knew going in">
      <Copy>
        <p>
          The CRO ticket came with a hypothesis. Before designing
          anything, <Highlight>I checked the live menu to see how big the gap was</Highlight>.
        </p>
        <PullQuote
          text="If travellers get a clear choice after picking a continent, more of them will keep going,"
          emphasis="because explorers can learn about the place first, and planners can go straight to trips."
        />
      </Copy>
      <Visual>
        {/* The two paths side by side: a destination page is about the place, a trip list is what you can book */}
        <Figure label="Where each path lands: the Africa destination page (the place, when to go, highlights) and the Africa trip list (dates, length, price)" />
      </Visual>
      {/* Subsections sit one step apart (.cs-sub), like the solutions below */}
      <div className="cs-sub">
        <Copy>
          <h3>The menu hid the pages explorers needed</h3>
          <p>
            The live menu made this easy to check. Every continent link pointed
            to a trip search. <Highlight>Not one pointed to a destination page, even though
            most continents already had one.</Highlight>
          </p>
          <MoreDetail label="See where every menu link goes" className="mt-[20px]">
            <div className="flex flex-col gap-[32px]">
              <div>
                <h4 className="mb-[16px] font-body text-[18px] font-medium leading-[28px] text-heading">
                  Where each menu link goes
                </h4>
                <MenuMap />
              </div>
              <Footnote>
                Menu links and prices from tcsworldtravel.com, October 2026. The
                drop-off figure was measured and shared by the TCS CRO team.
              </Footnote>
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
            people using the menu, and two constraints from the ticket.
          </p>
        </Copy>
        <Visual>
          <CardGrid items={CONTEXT_CARDS} />
        </Visual>
        <Copy>
          <p>
            <strong>What success looked like:</strong> <Highlight>more people getting
            past the menu</Highlight>. After picking a continent, more of them should land
            on a destination page or a trip list, and fewer should leave without
            choosing. A visit counts only when that page loads, not on the click.
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
  video: string;
  worked: string[];
  didntWork: string[];
};

// The one that didn't go forward first, then the two that went into the test
const ITERATIONS: IterationItem[] = [
  {
    label: "Variant 1",
    video: "/videos/tcs-find-a-trip/option-1.mp4",
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
    video: "/videos/tcs-find-a-trip/option-2.mp4",
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
    video: "/videos/tcs-find-a-trip/option-3.mp4",
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

// The three asks, as they were given (not word-for-word quotes). Sharayu's rename came
// before the review; Rohit's two came in it. Senders alternate, like a chat.
const REVIEW_FEEDBACK = [
  { text: "Add a version with the two paths side by side, not stacked.", from: "Rohit Rayala, CRO" },
  { text: "Call them \u201ctrips\u201d, not \u201cexpeditions\u201d.", from: "Sharayu Jadhav, Product Manager" },
  { text: "Rename \u201cFind Trips\u201d to \u201cExplore Trips\u201d, and list it first.", from: "Rohit Rayala, CRO" },
];

// Numbered points, not cards, in the reading column: the takeaway after the variant cards
// Two reasons, matched in length so the columns sit level
const WHY_BOTH = [
  {
    title: "No clear winner",
    description:
      "Each design had its own strength. The links stay light and work everywhere; the cards make exploring a place feel inviting.",
  },
  {
    title: "An open question",
    description:
      "The hypothesis asked if image cards draw more clicks than text links. Only real visitors, not a meeting, could answer that.",
  },
];

function Exploration() {
  return (
    <Chapter id="exploration" num={3} title="What we explored, and the three we showed the business">
      <Copy>
        <p>
          I started with quick prototypes to test <Highlight>how the choice should behave,
          not how it should look</Highlight>. I built them with <HelixLink />, so the
          business could click through each one. The two paths
          open right under the continent you click, so the menu never jumps
          away. The business asked for three changes.
        </p>
        <ChatQuotes label="What the business asked for" items={REVIEW_FEEDBACK} />
        <p>
          The side-by-side version is where the phone problem showed up. In the
          end, two designs were strong enough that we chose to test both.
        </p>
      </Copy>
      {ITERATIONS.map(({ label, title, chosen, video, worked, didntWork }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard
              label={label}
              title={title}
              shipped={chosen}
              stamp="In test"
              video={video}
              image={`${label}: ${title}, clickable prototype`}
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
            Variant 1 taught us the layout rule: <Highlight>cards can sit side by side,
            links stack</Highlight>. That left two good designs, and no reason to guess
            between them.
          </p>
          <NumberedPoints items={WHY_BOTH} />
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution  (how the final designs work)
// ─────────────────────────────────────────────────────────────────────────────
// Only what a visitor experiences, and the reason behind each detail. The decisions that
// set these up (equal weight, the layout rule, the missing pages) are told in Discovery
// and Exploration, so here they show up as the finished behaviour, not again as reasons.
const SOLUTION_ITEMS = [
  {
    num: 1,
    title: "A new step, but not a new page",
    body: <>Adding a choice adds a step, and every extra step is a chance to lose someone. So <Highlight>the two paths open right under the continent you clicked, inside the menu</Highlight>. The choice costs one more tap, not another page to load, and the continent stays highlighted so you always see what you picked.</>,
  },
  {
    num: 2,
    title: "Two options that look equal",
    body: <>Both labels start with &ldquo;Explore&rdquo;, so <Highlight>neither feels like the main path</Highlight>. Explore Trips comes first, so people who used the old menu still find trips where they expect them.</>,
  },
  {
    num: 3,
    title: "Cards side by side, links stacked",
    body: <>Both test designs follow the rule from Variant 1 on every screen. The image cards are big enough to sit next to each other, even on a phone. <Highlight>The text links stack, so each one stays easy to tap.</Highlight></>,
  },
  {
    num: 4,
    title: "When a continent has no destination page",
    body: <>Continents with a destination page get their own photos and links, so Africa looks like Africa. <Highlight>North America and Golf have no destination page, so clicking them skips the choice</Highlight> and opens their trips, exactly as before. Nobody lands on an empty option.</>,
  },
];

// The two designs in test; each Solution visual carries a switch between them
const TEST_VARIANTS = [
  { id: "links", label: "Variant 2 · Text links", short: "V2" },
  { id: "cards", label: "Variant 3 · Image cards", short: "V3" },
];

function Solution() {
  return (
    <Chapter id="solution" num={4} title="How the final designs work">
      <VariantProvider variants={TEST_VARIANTS}>
        <Copy>
          <p>
            Both test designs share one flow: pick a continent, choose how to
            explore it, and land on the right page. These four details make
            that flow work. Each detail has a switch in its corner to flip
            between Variant 2 (text links) and Variant 3 (image cards).
          </p>
        </Copy>
        {SOLUTION_ITEMS.map(({ num, title, body }) => (
          <div key={num} className="cs-sub">
            <Copy>
              <h3>{num}. {title}</h3>
              <p>{body}</p>
            </Copy>
            <Visual>
              <VariantFigure
                names={
                  num === 4
                    ? {
                        links: "Africa opens the choice; North America goes straight to its trips (text links)",
                        cards: "Africa opens the choice; North America goes straight to its trips (image cards)",
                      }
                    : {
                        links: `Solution ${num} — ${title} (text links)`,
                        cards: `Solution ${num} — ${title} (image cards)`,
                      }
                }
              />
            </Visual>
          </div>
        ))}
      </VariantProvider>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Build  (output — the two variants, built in code and ready to test)
// ─────────────────────────────────────────────────────────────────────────────
// The three arms of the test; the two variants are the point, the control is today's menu
const TEST_ARMS: Parameters<typeof StatTiles>[0]["items"] = [
  { stat: "34%", label: "of visitors keep today's menu, the control" },
  { stat: "33%", label: "of visitors get Variant 2, the text links", tone: "key" },
  { stat: "33%", label: "of visitors get Variant 3, the image cards", tone: "key" },
];

// The path the code took, in order
const BUILD_STEPS = ["Branch off main", "Build both variants", "Code review", "Merge to main"];

// What went into the build — numbered points, one below the other
const HANDOFF = [
  {
    title: "Both variants, in code",
    description: "Desktop and phone front end for the text links and the image cards.",
  },
  {
    title: "Photos for every continent",
    description: "An approved photo pair each; North America and Golf stay trips-only.",
  },
  {
    title: "The behaviour, written down",
    description: "How the paths open, highlight and close, checked against ten criteria.",
  },
];

function Output() {
  return (
    <Chapter id="output" num={5} title="Built in code, ready to test">
      <Copy>
        <p>
          Both designs were approved on 15 July 2026, and I built them in code
          as two variants of the menu. <Highlight>The test splits visitors three ways
          against the current menu.</Highlight>
        </p>
      </Copy>
      <Visual>
        <StatTiles items={TEST_ARMS} />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>How it was built</h3>
          <p>
            Both variants were designed in high fidelity with <HelixLink />,
            so every screen was built only from the design system&apos;s
            components and tokens. From there, the code went through the same
            review as any developer&apos;s:
          </p>
          <ProcessStrip steps={BUILD_STEPS} />
          <p className="!mt-[32px]">
            Once it was merged, the developers picked it up to set up the test.
          </p>
          {/* A wider pause before the points (32px more on top of their own 32px) */}
          <div className="pt-[32px]">
            <NumberedPoints items={HANDOFF} stacked />
          </div>
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Outcome  (where it stands: status, the goal it answers, impact so far, next)
// ─────────────────────────────────────────────────────────────────────────────
// Real impact now, as plain numbers
const IMPACT_SO_FAR = [
  { stat: "8", label: "new tracking events, so TCS can see how people use the menu" },
  { stat: "3 weeks", label: "from the first question to two approved designs" },
];

// Each way the test can read out, and what we'd do
const OUTCOMES = [
  {
    icon: <ListBullets size={28} weight="fill" className="text-grape" />,
    title: "If Variant 2 wins",
    description: "Ship the text links. They need no photos, so every continent can switch over on day one.",
  },
  {
    icon: <Images size={28} weight="fill" className="text-grape" />,
    title: "If Variant 3 wins",
    description: "Ship the image cards. Every continent's photo pair is already approved, so nothing waits on content.",
  },
  {
    icon: <ClockCounterClockwise size={28} weight="fill" className="text-grape" />,
    title: "If today\u2019s menu wins",
    description: "Keep the menu as it is. The 8 new tracking events still show which path people want.",
  },
];

function Outcome() {
  return (
    <Chapter id="outcome" num={6} title="Where it stands">
      <Copy>
        <p>
          Both variants are built and reviewed, so <Highlight>the test is ready to run</Highlight>.
          There are no results to share yet.
        </p>
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>Impact so far</h3>
          <p>Before a single result comes in, the work has already changed two things.</p>
          <Stats items={IMPACT_SO_FAR} />
        </Copy>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What happens next</h3>
          <p>
            When the test reads out, we&apos;ll compare three things across the
            control and both variants: <Highlight>how many people reach a page after
            picking a continent, which path they choose, and the drop-off
            rate</Highlight>, meaning how many leave without choosing. A journey only
            counts when the next page actually loads. Each result has a plan.
          </p>
        </Copy>
        <Visual>
          <CardGrid items={OUTCOMES} />
        </Visual>
        <Copy>
          <p>
            Either way, <Highlight>if Explore Destination draws clicks, the same
            choice can be offered beyond the menu</Highlight>.
          </p>
        </Copy>
      </div>
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
          <strong>Fairness is a design decision.</strong> In an A/B test the
          layout can tip the result. Settling early that both paths carry equal
          weight meant <Highlight>the test measures intent, not my emphasis</Highlight>.
        </p>
        <p>
          <strong>Prototype the behaviour, not pixels.</strong> Two rough
          interaction prototypes let the team compare how each choice felt in a
          single review, and <Highlight>decide to test both instead of debating one</Highlight>.
        </p>
        <p>
          <strong>Design the edge cases early.</strong> The cramped phone
          layout and the missing destination pages were solved in the
          prototypes, so <Highlight>the build started with those questions answered</Highlight>.
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
        title="Letting TCS travellers explore a destination before they book"
        date="July 2026"
        image="/images/tcs-find-a-trip/cover-lime.webp"
      />
      <Overview />
      <TheProblem />
      <Context />
      <Exploration />
      <Solution />
      <Output />
      <Outcome />
      <Reflection />
      <NextCase current="/works/tcs-find-a-trip" />
    </CaseStudyLayout>
  );
}
