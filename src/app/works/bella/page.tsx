import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { Palette, Shapes, Eye, Sparkle, PencilSlash, Timer, ChatText, Compass, BookOpen, GitCommit } from "@phosphor-icons/react/dist/ssr";
import {
  Hero,
  Chapter,
  Copy,
  Visual,
  Figure,
  CardGrid,
  PullQuote,
  Pointers,
  Timeline,
  Stats,
  ExplorationCard,
  BellaStates,
  BellaSolves,
  BellComparison,
  ReferencePlayground,
  NextCase,
  Highlight,
  SessionLog,
} from "@/components/case-study";

// DRAFT, 2 Nov 2026. Bella's own outline, set by Ashmik (not the Problem → Outcome template):
// what Bella is and why → research → four characters → the pick (bell vs key tag) → finishing →
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
  { id: "characters",   label: "Characters"     },
  { id: "choosing",     label: "The pick"       },
  { id: "finish",       label: "Finishing"      },
  { id: "solution",     label: "On the site"    },
  { id: "purpose",      label: "What it solves" },
  { id: "claude-code",  label: "Claude Code"    },
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
          Bella is the desk bell that runs the front desk of this portfolio.
          It sits in the navbar as the logo, <Highlight>keeps track of how long you
          actually spend here</Highlight>, and shows it on a small sign when you hover.
          When it has something to say, it rings first.
        </p>
        <p>
          I made Bella for two reasons. <Highlight>I wanted to know whether people really
          read my work</Highlight>, and for how long. And I wanted visitors to have a
          reason to look around a little longer. A plain clock in the corner
          did neither, so the clock became a character.
        </p>
        <p>
          I didn&apos;t draw any of it by hand. <Highlight>Bella was made from start
          to end in Claude Code</Highlight>: I described what I wanted.
        </p>
      </Copy>
      <Visual>
        {/* Ashmik's narrated walkthrough goes here: video="/videos/bella/overview.mp4" with a poster */}
        <Figure label="Walkthrough: meet Bella" narrated />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Research  (what other mascot teams learned, and what we took)
// ─────────────────────────────────────────────────────────────────────────────
// What the six references share, and what Bella took from each trait (bella-notes.md, 09:12)
const TRAITS = [
  {
    icon: <Palette size={28} weight="fill" className="text-grape" />,
    title: "One or two colours",
    description: "Bella is blackcurrant and grape, from the design system. Gold is kept for the champion.",
  },
  {
    icon: <Shapes size={28} weight="fill" className="text-grape" />,
    title: "One basic shape",
    description: "A dome on a base, so Bella still reads at 40px in the navbar.",
  },
  {
    icon: <Eye size={28} weight="fill" className="text-grape" />,
    title: "Dot eyes",
    description: "Eyes only. No mouth, no cheeks.",
  },
  {
    icon: <Sparkle size={28} weight="fill" className="text-grape" />,
    title: "Personality from pose",
    description: "Bella dozes, rings and puts on glasses instead of pulling faces.",
  },
];

// Four of the six hospitality references, pictures only, loose on one card to drag around.
// x and y are where each starts, as a share of the free space.
const REFERENCES = [
  { name: "Ollie, Tripadvisor's owl", slug: "ollie", x: 0.06, y: 0.12 },
  { name: "The Suica penguin", slug: "suica-penguin", x: 0.38, y: 0.78 },
  { name: "Kumamon", slug: "kumamon", x: 0.66, y: 0.08 },
  { name: "Bibendum, the Michelin Man", slug: "bibendum", x: 0.94, y: 0.7 },
];

function Research() {
  return (
    <Chapter id="research" num={1} title="What I learned from other mascots">
      <Copy>
        <p>
          The research started as one message. I asked Claude Code for a small,
          very minimal character that could be the logo and flash the time on a
          board when hovered, and for at least five hospitality mascots to learn
          from first.
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
          The six share one or two colours, one basic shape and dot eyes, and <Highlight>get
          their personality from pose</Highlight>. Those four traits became Bella&apos;s rules.
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
    note: "Three directions from the site's guesthouse theme, each in one colour. The door hanger came later, drawn for this write-up.",
    stage: "sketch",
  },
  {
    title: "The same four, with light and shadow",
    note: "I pointed Claude Code at the Grok, Codex and Muse characters. Each got a lit side, a shade side and a shadow.",
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
    <Chapter id="characters" num={2} title="Four ideas for the character">
      <Copy>
        <p>
          Claude Code drew every character as code, in the browser, from my
          descriptions. I never opened a drawing tool: I looked at what it drew
          and told it what felt wrong. Most rounds ended the same way: a version
          looked good on its own but didn&apos;t belong on the site, so it <Highlight>moved
          back toward the design system</Highlight>.
        </p>
        <PullQuote
          label="What started the depth round"
          text="Even though it is flat,"
          emphasis="it doesn't have depth or character to it."
        />
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
      { yes: true, text: "Guests get one at check-in." },
    ],
  },
  {
    name: "Desk bell",
    src: art("depth-desk-bell"),
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
    <Chapter id="choosing" num={3} title="We picked the desk bell over the key tag">
      <Copy>
        <p>
          The key tag went furthest before it lost. Claude Code put it in the
          real navbar, and <Highlight>seeing it at logo size decided it</Highlight>.
        </p>
        <PullQuote
          label="Why the key tag lost"
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
  { lead: "Finish.", text: "Blackcurrant dome and grape base, from the design system. Gold only for the champion." },
  { lead: "Face.", text: "Eyes only. No mouth, no cheeks." },
  { lead: "Hands.", text: "Tucked behind the bell, and only come round to hold something." },
  { lead: "Sound.", text: "A short synthesised double ding before every line." },
];

function Finishing() {
  return (
    <Chapter id="finish" num={4} title="Settling Bella's colours, face and sound">
      <Copy>
        <p>
          Once picked, the bell drifted. Each time I asked for more character,
          Claude Code added more finish, and <Highlight>shaded and chromed, it stopped
          looking like itself</Highlight>. Twice I pulled it back to the design system.
        </p>
        <PullQuote
          label="The brief that fixed it"
          text="It doesn't feel like a bell anymore."
          emphasis="Make sure it feels like a bell, and maybe acts like a bell as well."
        />
      </Copy>
      <Visual>
        <CardRow items={FINISHES} />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>The look we kept</h3>
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
// video="/videos/bella/<slug>.mp4" with a poster. Placeholders until then. The sign and
// tooltip explorations sit under the use case they belong to.
const SIGNS = [
  { name: "Dark flip clock", src: art("sign-flip-clock") },
  { name: "Brass and ivory plaque", src: art("sign-brass-ivory") },
  { name: "Grape wood frame", src: art("sign-grape-wood") },
  { name: "Cream plaque with flip digits", src: art("sign-neutral"), kept: true },
];

const TOOLTIPS = [
  { name: "Grape speech bubble", src: art("tip-grape-bubble") },
  { name: "Front desk rich tooltip", src: art("tip-front-desk") },
  { name: "Card with a percentile bar", src: art("tip-percentile-card") },
  { name: "Compact dark, with a pointer", src: art("tip-compact-dark"), kept: true },
];

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
    title: "It greets you",
    body: <>At 0:30, 2:00 and 5:00 Bella rings once and types one plain line in a small tooltip. <Highlight>Three lines a visit, never over the work.</Highlight></>,
    tried: { label: "Tooltips we tried", items: TOOLTIPS },
  },
  {
    num: 2,
    slug: "time",
    title: "It keeps your time",
    body: <>Hover, focus or tap the bell and it <Highlight>lowers a sign with your active time</Highlight>, like 4m 16s. On phones, tap again to hide it.</>,
    tried: { label: "Signs we tried", items: SIGNS },
  },
  {
    num: 3,
    slug: "reads",
    title: "It reads and watches with you",
    body: <>Round gold reading glasses while a case study is open, and <Highlight>3D glasses while a video you started plays</Highlight>. The clock keeps counting through both.</>,
  },
  {
    num: 4,
    slug: "dozes",
    title: "It dozes when you leave",
    body: <>Hide the tab or stop for 30 seconds and the clock pauses and Bella falls asleep, so <Highlight>only real attention counts</Highlight>. The browser tab dozes too, and its title shows your paused time.</>,
  },
  {
    num: 5,
    slug: "celebrates",
    title: "It celebrates what you find",
    body: <>Reading two case studies, reading all of them, downloading the resume or copying the email earns a gold bow tie for about three seconds. <Highlight>Five stamps are hidden around the site</Highlight>; when you find one, Bella looks surprised and the stamp lands on your Curiosity Pass.</>,
  },
  {
    num: 6,
    slug: "champion",
    title: "It crowns the longest stay",
    body: <>The longest visit this month turns Bella and the sign gold. <Highlight>Visit counts appear nowhere.</Highlight></>,
  },
  {
    num: 7,
    slug: "footer",
    title: "It follows you round the site",
    body: <>In the footer, a smaller Bella pops up and hops along the counter, <Highlight>holding my email with a Copy email button</Highlight>. While it’s up, the navbar Bella ducks and leaves its clock behind.</>,
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={5} title="What Bella does on the site">
      <Copy>
        <p>
          The first Bella only kept time. <Highlight>Every addition after that came from a
          moment in a real visit</Highlight>, and asked what Bella should do there. Each
          one started as a sentence to Claude Code and shipped as a commit. Here
          they are in the order a visitor meets them.
        </p>
      </Copy>
      {USE_CASES.map(({ num, slug, title, body, tried }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>{num}. {title}</h3>
            <p>{body}</p>
          </Copy>
          <Visual>
            <Figure name={`Recording: ${slug}`} alt={`Live site: ${title.toLowerCase()}`} />
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
          <h3>All of Bella&apos;s moods</h3>
        </Copy>
        <Visual>
          <BellaStates />
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
    text: "Active time per visit and per case study tells me which work people actually read.",
    pose: { glasses: "reading" },
  },
  {
    lead: "Visitors get a reason to stay",
    text: "Lines, stamps and goals invite a second case study without getting in the way of the first.",
    pose: {},
    loop: "celebrate",
  },
  {
    lead: "Only real time counts",
    text: "The clock pauses when you hide the tab or stop for 30 seconds, so a tab left open all day adds nothing.",
    pose: { mood: "dozing" },
  },
  {
    lead: "The site has a host",
    text: "A portfolio that greets you and notices you feels less like a folder of files.",
    pose: {},
    loop: "ding",
  },
];

const NEXT = [
  {
    title: "A curiosity score",
    description: "Count more than time: which case studies you opened, how far you scrolled, what you came back to.",
  },
  {
    title: "A guestbook and a Hall of Curiosity",
    description: "Leave your name on the way out, and see the most curious guests, moderated by me.",
  },
  {
    title: "Bella pointing to your pass",
    description: "A link in the 5:00 line that opens your Curiosity Pass.",
  },
];

function Purpose() {
  return (
    <Chapter id="purpose" num={6} title="What Bella solves, and what comes next">
      <Copy>
        <p>
          Bella has two jobs: give visitors a reason to look around, and tell
          me whether they did. <Highlight>Every feature has to do one, and most do both.</Highlight>
        </p>
      </Copy>
      <Visual>
        <BellaSolves items={SOLVES} />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>What comes next</h3>
          <Timeline items={NEXT} />
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Working only in Claude Code  (what it was like, from the sessions and git)
// ─────────────────────────────────────────────────────────────────────────────
// Facts from bella-notes.md and git (49 commits to Bella's code, 23 Oct – 1 Nov 2026).
// Draft wording, for Ashmik to rewrite.
const WORKING_STATS = [
  { stat: "0", label: "design files behind Bella" },
  { stat: "2 min", label: "from my first message to six references and three characters" },
  { stat: "10", label: "days of work, from 23 Oct to 1 Nov" },
  { stat: "49", label: "commits, so any version can be brought back" },
];

const icon = (I: typeof Timer) => <I size={28} weight="fill" className="text-grape" />;

const WORKING = [
  {
    icon: icon(PencilSlash),
    title: "Nothing drawn by hand",
    description: "Bella, its sign, its moods and its ding are all code Claude Code wrote from my descriptions.",
  },
  {
    icon: icon(Timer),
    title: "Rounds took minutes",
    description: "I asked for references and characters at 09:10. They were on screen at 09:12.",
  },
  {
    icon: icon(ChatText),
    title: "Feedback was a sentence",
    description: "I said what felt wrong, like “it doesn't feel like a bell anymore”, and the next version was on screen.",
  },
  {
    icon: icon(Compass),
    title: "Direction stayed with me",
    description: "Claude Code kept adding chrome, shading and gloss. Twice I pulled it back to the design system.",
  },
  {
    icon: icon(BookOpen),
    title: "It documented itself",
    description: "Claude Code built a reference page for Bella: anatomy, palette, moods, motion, copy, sound, and do's and don'ts.",
  },
  {
    icon: icon(GitCommit),
    title: "Every decision is a commit",
    description: "Each change shipped as its own commit, so I could go back to any earlier Bella.",
  },
];

function WorkingInClaudeCode() {
  return (
    <Chapter id="claude-code" num={7} title="Designing without a design tool">
      <Copy>
        <p>
          Bella is the first thing I designed without a design tool. <Highlight>The
          conversation was the design file.</Highlight>
        </p>
        <Stats items={WORKING_STATS} />
      </Copy>
      <Visual>
        <CardGrid items={WORKING} />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function BellaPage() {
  return (
    <CaseStudyLayout sections={SECTIONS}>
      <Hero
        title="A desk bell that shows how long people really read my portfolio, designed in Claude Code"
        date="October 2026"
        image="/images/bella/hero.svg"
      />
      <Overview />
      <Research />
      <Characters />
      <Choosing />
      <Finishing />
      <Solution />
      <Purpose />
      <WorkingInClaudeCode />
      <NextCase current="/works/bella" />
    </CaseStudyLayout>
  );
}
