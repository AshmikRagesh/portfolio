import type { Metadata } from "next";
import { reels } from "@/content/reels";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { Palette, Shapes, Eye, Sparkle } from "@phosphor-icons/react/dist/ssr";
import {
  Hero,
  Chapter,
  Copy,
  Visual,
  Figure,
  CardGrid,
  PullQuote,
  Pointers,
  ExplorationCard,
  BellaStates,
  BellaSolves,
  BellComparison,
  ReferencePlayground,
  NextCase,
  Highlight,
  SessionLog,
  PanelCards,
  RhythmChart,
  AttemptCards,
  BellaShowcase,
} from "@/components/case-study";

// DRAFT, 2 Nov 2026. Bella's own outline, set by Ashmik (not the Problem → Outcome template):
// what Bella is and why → research → explorations → the pick (bell vs key tag) → finishing →
// Bella on the live site, one use case at a time (recordings), with the sign and tooltip
// rounds under their use case → what it solves and what it can be → working only in Claude
// Code. No results section. Bella was made start to end in Claude Code, so each section
// shows Ashmik's own words from the sessions (bella-notes.md). The terminal-style SessionLog
// is used once, in Research, for the first prompt; elsewhere quotes use PullQuote.
// Stills are in public/images/bella (scripts/draw-bella-explorations.py). Facts from
// my-portfolio/case-studies/bella-notes.md; quotes are Ashmik's, the joining copy is a
// placeholder for him to rewrite. Not on the homepage list yet, so it doesn't change the
// "all five read" goal.

export const metadata: Metadata = {
  title: "Bella · Ashmik Ragesh",
  description:
    "Bella, the desk bell that hosts this portfolio and measures how long each visitor stays, designed from first sketch to live site entirely in Claude Code.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",     label: "Overview"       },
  { id: "research",     label: "Research"       },
  { id: "explorations", label: "Explorations"   },
  { id: "choosing",     label: "The pick"       },
  { id: "finish",       label: "Finishing"      },
  { id: "solution",     label: "On the site"    },
  { id: "behind",       label: "Behind the desk" },
  { id: "purpose",      label: "What it solves" },
];

const art = (name: string) => `/images/bella/${name}.svg`;

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview  (what Bella is, and why we made it)
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <Chapter id="overview" num={0} title="What Bella is, and why I made it">
      <Copy>
        <p>
          Bella is the host of this portfolio: a desk bell that sits in the navbar
          as the logo. It <Highlight>counts how long you actively spend here</Highlight> and
          shows it on a small sign when you hover.
        </p>
        <p>
          I wanted to know <Highlight>whether people actually read my work</Highlight>, and to
          give them a reason to stay. A timer could only do the first, so it became
          a character. I designed and built it <Highlight>entirely in Claude Code</Highlight>,
          without drawing anything by hand.
        </p>
      </Copy>
      {/* The live Bella, no card: she hops into a new use case every 10 seconds */}
      <BellaShowcase />
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Research  (what other mascot teams learned, and what we took)
// ─────────────────────────────────────────────────────────────────────────────
// What the six references share: findings only, Bella comes after (bella-notes.md, 09:12)
const TRAITS = [
  {
    icon: <Palette size={28} weight="fill" className="text-grape" />,
    title: "One or two colours",
    description: "None of the six relies on a full palette. Kumamon, for example, is a black bear with red cheeks.",
  },
  {
    icon: <Shapes size={28} weight="fill" className="text-grape" />,
    title: "One basic shape",
    description: "Each body is a single, easy-to-recall form, like Bibendum's stack of white tyres.",
  },
  {
    icon: <Eye size={28} weight="fill" className="text-grape" />,
    title: "Dot eyes",
    description: "Faces stay minimal. Small round eyes carry most of the expression.",
  },
  {
    icon: <Sparkle size={28} weight="fill" className="text-grape" />,
    title: "Personality from pose",
    description: "Mood comes from posture and movement rather than detailed facial expressions.",
  },
]

// Four mascots, cut out on transparent backgrounds, loose on one card to drag around.
// x and y are where each starts, as a share of the free space; `wide` widens the box for
// a wide pose. Sources (public/images/bella/references): Duo, en.wikipedia
// File:Duo_from_Duolingo.svg; Ollie, commons File:Tripadvisor-logo-circle-owl-icon-black-green.svg
// (CC0); Kumamon, en.wikipedia File:Kumamon_illustration.jpeg; Bibendum, en.wikipedia
// File:Michelin_(2017).svg with the wordmark cut away. Trademarks of their owners.
const REFERENCES = [
  { name: "Ollie, Tripadvisor's owl", slug: "ollie", x: 0.04, y: 0.1 },
  { name: "Duo, Duolingo's owl", slug: "duo", x: 0.34, y: 0.82 },
  { name: "Kumamon", slug: "kumamon", x: 0.62, y: 0.08 },
  { name: "Bibendum, the Michelin Man", slug: "bibendum", x: 0.98, y: 0.72, wide: 1.8 },
];

function Research() {
  return (
    <Chapter id="research" num={1} title="What I learned from other mascots">
      <Copy>
        <p>
          I started by asking Claude Code for a minimal character that could work
          as the logo and show the time on a board when hovered, and for at least
          five hospitality mascots to study first.
        </p>
        <SessionLog
          when="23 Oct, 09:10"
          lines={[
            { from: "me", text: "A small very minimal character for this website ... as the logo, which would flash time in a board when hovered." },
            { from: "claude", text: "Six references (Tripadvisor's Ollie, the Suica penguin, Air India's Maharaja, Kumamon, Bibendum and Grimace) and three directions from the site's guesthouse theme: key tag, bellhop, desk bell. Two minutes later, at 09:12." },
          ]}
        />
      </Copy>
      <Visual>
        <ReferencePlayground items={REFERENCES} />
      </Visual>
      <Copy>
        <p>
          The same four patterns appeared across all six references. <Highlight>Simple
          characters get their personality from pose, not detail.</Highlight> These
          patterns became the rules for designing Bella.
        </p>
      </Copy>
      <Visual>
        <CardGrid items={TRAITS} />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The characters  (four directions, flat and then with depth)
// ─────────────────────────────────────────────────────────────────────────────
const CHARACTERS = [
  {
    title: "First sketches, in one colour",
    note: "Three directions from the site's guesthouse theme, each in a single colour. The door hanger was added later, for this case study.",
    stage: "sketch",
  },
  {
    title: "The same four, with light and shadow",
    note: "To add depth, I pointed Claude Code to the Grok, Codex and Muse characters. Each character gained a lit side, a shaded side and a shadow.",
    stage: "depth",
  },
];

const CHARACTER_NAMES = [
  { name: "Key tag", file: "key-tag" },
  { name: "Bellhop", file: "bellhop" },
  { name: "Door hanger", file: "door-hanger" },
  { name: "Desk bell", file: "desk-bell" },
];

function Characters() {
  return (
    <Chapter id="explorations" num={2} title="Exploring four characters for the logo">
      <Copy>
        <p>
          Claude Code drew each character as code, in the browser, from my
          descriptions. I reviewed every round and said what wasn&apos;t working.
          A pattern emerged: <Highlight>versions that looked good on their own often
          didn&apos;t fit the site</Highlight>, so each round moved back toward the
          design system.
        </p>
      </Copy>
      {CHARACTERS.map(({ title, note, stage }) => (
        <div key={title} className="cs-sub">
          <Copy>
            <h3>{title}</h3>
            <p>{note}</p>
          </Copy>
          <Visual>
            <Lineup items={CHARACTER_NAMES.map(({ name, file }) => ({ name, src: art(`${stage}-${file}`) }))} />
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

/** Characters side by side on one white panel, names below: two across on phones, four from tablet up */
function Lineup({ items }: { items: { name: string; src: string }[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-y-[32px] rounded-lg border border-line-soft bg-white p-[32px] md:grid-cols-4">
      {items.map(({ name, src }) => (
        <li key={name} className="flex flex-col items-center gap-[16px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={name} className="h-[104px] w-full object-contain" />
          <p className="font-body text-[16px] font-medium leading-[24px] text-heading">{name}</p>
        </li>
      ))}
    </ul>
  );
}

/** A row of exploration cards: two across on phones, four from tablet up */
function CardRow({ items }: { items: { name: string; src: string; kept?: boolean; tag?: string }[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-[16px] p-0 md:grid-cols-4">
      {items.map((item) => (
        <ExplorationCard key={item.name} {...item} />
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Why the desk bell  (what we picked, and why)
// ─────────────────────────────────────────────────────────────────────────────
// The same three questions for both finalists (bella-notes.md: 23 Oct 10:26, and the decisions list)
const QUESTIONS = ["Clear at logo size?", "Can it ring?", "Fits the guesthouse theme?"];

const FINALISTS = [
  {
    name: "Key tag",
    src: art("depth-key-tag"),
    answers: [
      { yes: false, text: "In the 40px navbar it looked tiny and its details disappeared." },
      { yes: false, text: "A key tag makes no sound, so a ding before each line wouldn't fit." },
      { yes: true, text: "Guests receive one at check-in." },
    ],
  },
  {
    name: "Desk bell",
    src: art("final-bella"),
    picked: true,
    answers: [
      { yes: true, text: "A dome on a base still reads at 40px." },
      { yes: true, text: "A bell already calls for attention, so it rings before it speaks." },
      { yes: true, text: "Guests ring it at the front desk." },
    ],
  },
];

function Choosing() {
  return (
    <Chapter id="choosing" num={3} title="I picked the desk bell over the key tag">
      <Copy>
        <p>
          The key tag was the strongest alternative until I tested it in
          context. Claude Code placed it in the live navbar, and <Highlight>at logo
          size its details disappeared</Highlight>.
        </p>
        <PullQuote
          text="In the header the key tag looks really small and"
          emphasis="the details go missing."
        />
      </Copy>
      <Visual>
        <BellComparison questions={QUESTIONS} finalists={FINALISTS} />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Finishing the bell  (colour, face, hands and sound)
// ─────────────────────────────────────────────────────────────────────────────
const FINISHES = [
  { name: "Flat plum", src: art("finish-flat-plum") },
  { name: "Chrome with charcoal", src: art("finish-chrome-charcoal") },
  { name: "Blackcurrant and grape", src: art("finish-blackcurrant"), kept: true },
  { name: "Gold, for the champion", src: art("finish-gold"), kept: true },
];

const FINAL_CHOICES = [
  { lead: "Finish.", text: "A blackcurrant dome and grape base from the design system. Gold is reserved for the champion." },
  { lead: "Face.", text: "Eyes only, with no mouth or cheeks." },
  { lead: "Hands.", text: "Hidden behind the bell, appearing only to hold something." },
  { lead: "Sound.", text: "A short synthesised double ding before every message." },
];

function Finishing() {
  return (
    <Chapter id="finish" num={4} title="Settling Bella's colours, face and sound">
      <Copy>
        <p>
          Once the desk bell was chosen, its look started to drift. Each request
          for more character added more finish, and <Highlight>with shading and chrome
          it no longer read as a bell</Highlight>. I brought it back to the design
          system twice.
        </p>
        <PullQuote
          text="It doesn't feel like a bell anymore."
          emphasis="Make sure it feels like a bell, and maybe acts like a bell as well."
        />
      </Copy>
      <Visual>
        <CardRow items={FINISHES} />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>The final look</h3>
          <Pointers items={FINAL_CHOICES} />
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution  (Bella on the live site, one use case at a time)
// ─────────────────────────────────────────────────────────────────────────────
// Each use case gets Ashmik's screen recording of the live site:
// video="/videos/bella/<slug>.mp4" with a poster (greets, time, reads, celebrates, champion). Placeholders until then. The sign and
// tooltip explorations sit under the use case they belong to.
const SIGNS = [
  { name: "Brass and ivory plaque", src: art("sign-brass-ivory") },
  { name: "Grape wood frame", src: art("sign-grape-wood") },
  { name: "Dark flip clock", src: art("sign-flip-clock") },
  { name: "Cream plaque with flip digits", src: art("sign-neutral"), kept: true },
];

const TOOLTIPS = [
  { name: "Grape speech bubble", src: art("tip-grape-bubble") },
  { name: "Front desk rich tooltip", src: art("tip-front-desk") },
  { name: "Card with a percentile bar", src: art("tip-percentile-card") },
  { name: "Compact dark, with a pointer", src: art("tip-compact-dark"), kept: true },
];

const RECORDED = new Set(["greets", "time", "reads", "celebrates", "champion"]);

const USE_CASES: {
  num: number;
  slug: string;
  title: string;
  body: React.ReactNode;
  tried?: { label: string; items: { name: string; src: string; kept?: boolean }[] };
}[] = [
  {
    num: 1,
    slug: "greets",
    title: "Greets you at set moments",
    body: <>Bella checks in a few times during a visit. It rings once, then types a short line in a compact tooltip that <Highlight>never covers the content</Highlight>.</>,
    tried: { label: "Tooltip options explored", items: TOOLTIPS },
  },
  {
    num: 2,
    slug: "time",
    title: "Shows your time on demand",
    body: <>Hovering over or tapping the bell <Highlight>lowers a sign with your active time</Highlight>. On phones, tapping again hides it.</>,
    tried: { label: "Sign options explored", items: SIGNS },
  },
  {
    num: 3,
    slug: "reads",
    title: "Reacts to what you're doing",
    body: <>Bella puts on reading glasses while you read a case study and <Highlight>switches to 3D glasses while you watch a video</Highlight>. The timer keeps running in both.</>,
  },
  {
    num: 4,
    slug: "celebrates",
    title: "Rewards exploring",
    body: <>Reaching a goal on the site earns Bella a gold bow tie. <Highlight>Goals include reading two case studies, downloading the resume and copying the email</Highlight>, and each one gets a short line you can close.</>,
  },
  {
    num: 5,
    slug: "champion",
    title: "Celebrates the longest visit",
    body: <>The longest visit of the month turns Bella and its sign gold.</>,
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={5} title="What Bella does on the site">
      <Copy>
        <p>
          The first version of Bella only kept time. <Highlight>Each feature after that
          was designed around a specific moment in a visit</Highlight>, asking what a
          good host would do there. They&apos;re shown below in the order a visitor
          meets them.
        </p>
      </Copy>
      {USE_CASES.map(({ num, slug, title, body, tried }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>{num}. {title}</h3>
            <p>{body}</p>
          </Copy>
          <Visual>
            {/* Every use case has its recording now; a slug left out of RECORDED shows a placeholder */}
            {RECORDED.has(slug) ? (
              <Figure video={`/videos/bella/${slug}.mp4`} alt={`Live site: ${title.toLowerCase()}`} />
            ) : (
              <Figure name={`Recording: ${slug}`} alt={`Live site: ${title.toLowerCase()}`} />
            )}
          </Visual>
          {tried && (
            <>
              <Copy>
                <h4>{tried.label}</h4>
              </Copy>
              <Visual>
                <CardRow items={tried.items} />
              </Visual>
            </>
          )}
        </div>
      ))}
      <div className="cs-sub">
        <Copy>
          <h3>Every state at a glance</h3>
        </Copy>
        <Visual>
          <BellaStates />
        </Visual>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Behind the desk  (the private stats page, how it's built, and how fake
// visits and spam are kept out). Facts from src/lib/curiosity, src/app/stats and the
// 11 Nov 2026 commits. Not claimed: bot detection (headless browsers aren't filtered).
// Joining copy is a placeholder for Ashmik to rewrite in his words.
// ─────────────────────────────────────────────────────────────────────────────
const STATS_PANELS = [
  { src: "/images/bella/stats/time.webp", alt: "Totals on the stats page", title: "Time", text: "Visits, visitors, average and median active time, and the longest visit so far." },
  { src: "/images/bella/stats/per-day.webp", alt: "Visits per day chart", title: "Visits per day", text: "One bar per day for the last 30 days, so a sudden jump stands out." },
  { src: "/images/bella/stats/referrers.webp", alt: "Top referrers list", title: "Where people come from", text: "By site only, like linkedin.com, never the full link." },
  { src: "/images/bella/stats/exits.webp", alt: "Exit pages list", title: "Where they leave", text: "The last page seen in each visit, so I know which page ends a visit." },
  { src: "/images/bella/stats/bella.webp", alt: "Bella actions list", title: "What they do with Bella", text: "Opening the sign, copying the email, earning a stamp. Each counts once per visit." },
];

// Real visits per day (curiosity:days, IST) from 23 Oct, the first day with visits, to
// 16 Nov 2026; nightly copies (curiosity:snapshot:*) exist from 13 Nov. Read on 17 Nov.
// The five zero days before 23 Oct only feed the spike check's "usual day".
const VISITS_BY_DAY: [string, number][] = [
  ["2026-10-23", 11], ["2026-10-24", 6], ["2026-10-25", 3], ["2026-10-26", 11], ["2026-10-27", 4],
  ["2026-10-28", 5], ["2026-10-29", 6], ["2026-10-30", 4], ["2026-10-31", 4], ["2026-11-01", 27],
  ["2026-11-02", 8], ["2026-11-03", 16], ["2026-11-04", 4], ["2026-11-05", 9], ["2026-11-06", 17],
  ["2026-11-07", 45], ["2026-11-08", 31], ["2026-11-09", 16], ["2026-11-10", 2], ["2026-11-11", 8],
  ["2026-11-12", 14], ["2026-11-13", 22], ["2026-11-14", 4], ["2026-11-15", 0], ["2026-11-16", 0],
];
const STATS_DAYS = VISITS_BY_DAY.map(([date, visits]) => ({ date, visits, saved: date >= "2026-11-13" }));

const RHYTHM_TABS = {
  visits: { name: "Every visit", text: "Each bar is one day. While a tab is open it reports every 20 seconds, and each visit is counted once." },
  saved: { name: "Saved nightly", text: "Every night the site saves a copy of the totals, with days in Indian time. The first copy was saved on 13 Nov." },
  weekly: { name: "Monday summary", text: "Every Monday, Claude adds up the week before and sends me a short summary, inside Claude instead of email." },
  spikes: { name: "Morning check", text: "Every morning, Claude checks the last day. A day with 30 or more visits and five times a usual day gets flagged. 7 Nov would have been." },
};

// Three ways to fake the numbers and what the site does. Cut on 17 Nov: someone else's
// visit, my own test visits, and the flagging script (still true, just fewer cards)
const ATTEMPTS = [
  { attempt: "Leave a tab open all night", result: "Nothing added after 30 seconds", how: "The clock pauses when the tab is hidden or nothing moves for 30 seconds." },
  { attempt: "Fake a really long visit to top the rankings", result: "Capped at the real time", how: "The site knows when each visit started, so a visit can't claim more time than has actually passed. No visit counts past two hours." },
  { attempt: "Flood the site with hundreds of visits", result: "Stopped at the limit", how: "Each connection can only start so many visits an hour. Its address is scrambled before it's stored." },
];

function Behind() {
  return (
    <Chapter id="behind" num={6} title="Behind the desk: reading the numbers and keeping them real">
      <Copy>
        <p>
          Bella only helps if the numbers are true. Visitors never see them, so
          I built <Highlight>a private stats page that only I can open</Highlight>,
          and a set of checks that keep fake visits out of it.
        </p>
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>What I see on the stats page</h3>
          <p>
            The page sits behind a key that only I have. <Highlight>It answers one
            question: did people read, and what?</Highlight>
          </p>
        </Copy>
        <Visual>
          <Figure video="/videos/bella/stats.mp4" poster="/images/bella/stats/poster.webp" alt="Scrolling through the private Curiosity stats page" />
        </Visual>
        <Visual>
          <PanelCards items={STATS_PANELS} />
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>How the numbers get there</h3>
          <p>
            <Highlight>I don&apos;t have to remember to check.</Highlight> The numbers
            are saved as visits happen, and Claude brings them to me.
          </p>
        </Copy>
        <Visual>
          <RhythmChart days={STATS_DAYS} history={[0, 0, 0, 0, 0]} tabs={RHYTHM_TABS} />
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>Keeping out fake visits and spam</h3>
          <p>
            Anyone can send the site a made-up visit. <Highlight>So the site checks every
            report instead of believing it.</Highlight>
          </p>
        </Copy>
        <Visual>
          <AttemptCards items={ATTEMPTS} />
        </Visual>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: What it solves, and what it can be
// ─────────────────────────────────────────────────────────────────────────────
// What Bella solves, each with the live Bella in the state that shows it
const SOLVES: Parameters<typeof BellaSolves>[0]["items"] = [
  {
    lead: "I can see what holds attention",
    text: "Active time per visit and per case study shows which work people actually read.",
    pose: { glasses: "reading" },
  },
  {
    lead: "Visitors get a reason to stay",
    text: "Messages and goals encourage a second case study without interrupting the first.",
    pose: {},
    loop: "celebrate",
  },
  {
    lead: "Only real time counts",
    text: "The timer pauses when the tab is hidden or idle for 30 seconds, so a tab left open all day adds nothing.",
    pose: { mood: "dozing" },
  },
  {
    lead: "The site has a host",
    text: "Greeting and responding to visitors makes the portfolio feel hosted, not just browsed.",
    pose: {},
    loop: "ding",
  },
];

function Purpose() {
  return (
    <Chapter id="purpose" num={7} title="What Bella solves">
      <Copy>
        <p>
          Bella was designed with two goals: give visitors a reason to explore,
          and show me whether they did. <Highlight>Every feature supports at least one
          of them, and most support both.</Highlight>
        </p>
      </Copy>
      <Visual>
        <BellaSolves items={SOLVES} />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function BellaPage() {
  return (
    <CaseStudyLayout sections={SECTIONS} reel={reels.bella}>
      <Hero
        title="Designing Bella, the desk bell that hosts this portfolio, in Claude Code"
        date="October 2026"
        image="/images/bella/cover.png"
      />
      <Overview />
      <Research />
      <Characters />
      <Choosing />
      <Finishing />
      <Solution />
      <Behind />
      <Purpose />
      <NextCase current="/works/bella" />
    </CaseStudyLayout>
  );
}
