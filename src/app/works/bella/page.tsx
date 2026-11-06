import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { Palette, Shapes, Eye, Sparkle } from "@phosphor-icons/react/dist/ssr";
import {
  Hero,
  Chapter,
  Copy,
  Visual,
  Figure,
  CardGrid,
  OptionCard,
  ProsCons,
  Pointers,
  Timeline,
  ExplorationCard,
  BellaStates,
  NextCase,
  Highlight,
  SessionLog,
} from "@/components/case-study";

// DRAFT, 2 Nov 2026. Bella's own outline, set by Ashmik (not the Problem → Outcome template):
// what Bella is and why → research → four characters → the final two → finishing the bell →
// Bella on the live site, one use case at a time (recordings), with the sign and tooltip
// rounds under their use case → what it solves and what it can be → working only in Claude
// Code. No results section. Bella was made start to end in Claude Code, so each section
// opens with the session it came from (SessionLog): Ashmik's lines are quoted from the
// sessions in bella-notes.md, Claude's are plain summaries of what it made.
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
  { id: "choosing",     label: "The final two"  },
  { id: "finish",       label: "Finishing"      },
  { id: "solution",     label: "On the site"    },
  { id: "purpose",      label: "What it can be" },
  { id: "claude-code",  label: "Claude Code"    },
];

const art = (name: string) => `/images/bella/${name}.svg`;

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview  (what Bella is, and why we made it)
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <Chapter id="overview" num={0} title="Meet Bella">
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
          to end in Claude Code</Highlight>: I described what I wanted, Claude Code
          built it in code, and I reacted to what it put on screen. Every drawing
          on this page, the character in the navbar, its sign and its ding are
          code it wrote from my words.
        </p>
        <SessionLog
          when="23 Oct, 04:18"
          lines={[
            { from: "me", text: "This data is actually really useful for me." },
            { from: "claude", text: "Built an active-time clock that pauses when you leave and reports each visit (af319cb, 07:35)." },
          ]}
        />
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

function Research() {
  return (
    <Chapter id="research" num={1} title="Six references in two minutes">
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
    title: "First sketches",
    note: "Three directions from the site's guesthouse theme, each in one colour. The door hanger came later, drawn for this write-up.",
    stage: "sketch",
  },
  {
    title: "With depth",
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
    <Chapter id="characters" num={2} title="Four characters">
      <Copy>
        <p>
          Claude Code drew every character as code, in the browser, from my
          descriptions. I never opened a drawing tool: I looked at what it drew
          and told it what felt wrong. Most rounds ended the same way: a version
          looked good on its own but didn&apos;t belong on the site, so it <Highlight>moved
          back toward the design system</Highlight>.
        </p>
        <SessionLog
          when="23 Oct, 09:21 – 09:45"
          lines={[
            { from: "me", text: "Even though it is flat, it doesn't have depth or character to it." },
            { from: "claude", text: "Added a lit side and a shade side, a ground shadow, overlapping layers, blinking and breathing." },
            { from: "me", text: "Right now it looks really cute, and the realistic version looks a little off." },
            { from: "claude", text: "Took out the pink cheeks and drew a realistic flip clock." },
          ]}
        />
      </Copy>
      {CHARACTERS.map(({ title, note, stage }) => (
        <div key={title} className="cs-sub">
          <Copy>
            <h3>{title}</h3>
            <p>{note}</p>
          </Copy>
          <Visual>
            <CardRow items={CHARACTER_NAMES.map(({ name, file }) => ({ name, src: art(`${stage}-${file}`) }))} />
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

/** A row of exploration cards: two across on phones, four from tablet up */
function CardRow({ items }: { items: { name: string; src: string; kept?: boolean }[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-[16px] p-0 md:grid-cols-4">
      {items.map((item) => (
        <ExplorationCard key={item.name} {...item} />
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Choosing the character  (the final two: key tag and desk bell)
// ─────────────────────────────────────────────────────────────────────────────
const FINAL_TWO = [
  {
    label: "Option 1",
    title: "Key tag",
    src: art("depth-key-tag"),
    chosen: false,
    pros: ["Ties straight to the guesthouse theme", "Could hold the time like a room number"],
    cons: ["At navbar size the details went missing", "Read as an object, not a character"],
  },
  {
    label: "Option 2",
    title: "Desk bell",
    src: art("depth-desk-bell"),
    chosen: true,
    pros: [
      "The silhouette reads at 40px",
      "An object that already makes a sound and calls for attention",
      "Belongs at a front desk, like the rest of the site",
    ],
    cons: [],
  },
];

const NOT_TAKEN = [
  { lead: "Bellhop.", text: "Not taken past the first two rounds." },
  { lead: "Door hanger.", text: "Drawn later, for this write-up, so it never competed." },
];

function Choosing() {
  return (
    <Chapter id="choosing" num={3} title="The final two">
      <Copy>
        <p>
          Two characters went head to head: the key tag and the desk bell.
          Claude Code put them in the real navbar, and <Highlight>seeing them at
          logo size decided it</Highlight>.
        </p>
        <SessionLog
          when="23 Oct, 10:26"
          lines={[
            { from: "me", text: "In the header the key tag looks really small and the details go missing." },
            { from: "claude", text: "Dropped the key tag for the desk bell, with one hand lifting the board." },
          ]}
        />
      </Copy>
      {FINAL_TWO.map(({ label, title, src, chosen, pros, cons }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard label={label} title={title} shipped={chosen} stamp="Selected" image={title} src={src}>
              <ProsCons pros={pros} cons={cons} />
            </OptionCard>
          </Visual>
        </div>
      ))}
      <div className="cs-sub">
        <Copy>
          <h3>The other two</h3>
          <Pointers items={NOT_TAKEN} />
        </Copy>
      </div>
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
    <Chapter id="finish" num={4} title="Finishing the bell">
      <Copy>
        <p>
          Once picked, the bell drifted. Each time I asked for more character,
          Claude Code added more finish, and <Highlight>shaded and chromed, it stopped
          looking like itself</Highlight>. Twice I pulled it back to the design system.
        </p>
        <SessionLog
          when="23 Oct, 10:54 – 11:31"
          lines={[
            { from: "me", text: "It doesn't feel like a bell anymore. Make sure it feels like a bell, and maybe acts like a bell as well." },
            { from: "claude", text: "Chromed the dome, added a ding animation, and made the champion gold." },
            { from: "me", text: "The silver colour with our colour is not working at all. The shadows near the face are what destroy it." },
            { from: "claude", text: "Went back to the design system: a blackcurrant dome, a grape base and a synthesised ding." },
          ]}
        />
      </Copy>
      <Visual>
        <CardRow items={FINISHES} />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>What we settled on</h3>
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
    <Chapter id="solution" num={5} title="Bella on the site today">
      <Copy>
        <p>
          The first Bella only kept time. <Highlight>Every addition after that came from a
          moment in a real visit</Highlight>, and asked what Bella should do there. Each
          one started as a sentence to Claude Code and shipped as a commit. Here
          they are in the order a visitor meets them.
        </p>
        <SessionLog
          when="23 – 24 Oct"
          lines={[
            { from: "me", text: "For a user who would hover over it a lot of times this would be very heavy." },
            { from: "claude", text: "Made the sign lighter and smaller, and added units: 4m 16s." },
            { from: "me", text: "Let's stop making changes to the movement of the character." },
            { from: "claude", text: "Dropped Bella travelling between sections. One Bella stays in the navbar, one in the footer." },
          ]}
        />
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
          <h3>Every state, at a glance</h3>
        </Copy>
        <Visual>
          <BellaStates />
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What we chose not to add</h3>
          <p>
            A halo and wings for celebrations (&ldquo;the circular motion is
            not needed&rdquo;), Bella travelling between sections as you
            scroll, a guest card in the footer, hands straightening the bow
            tie, and a ten-minute cap on the clock.
          </p>
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: What it solves, and what it can be
// ─────────────────────────────────────────────────────────────────────────────
// Each feature, and what it does for the visitor and for me. Draft copy, from the notes.
const FEATURES = [
  {
    feature: "Active-time clock",
    visitor: "Only time you actually spend here counts. Nothing runs while you're away.",
    me: "I see real attention, not tabs left open, so I know which visits were read.",
  },
  {
    feature: "The sign",
    visitor: "Your time is one hover away, and out of the way the rest of the time.",
    me: "The number I care about lives in the logo, not in a dashboard I have to open.",
  },
  {
    feature: "Three lines a visit",
    visitor: "A little company at 0:30, 2:00 and 5:00, in plain words.",
    me: "A nudge to keep reading that never covers the work.",
  },
  {
    feature: "Glasses",
    visitor: "Bella notices what you're doing: reading, or watching.",
    me: "Shows care for detail before anyone opens a case study.",
  },
  {
    feature: "Dozing",
    visitor: "You're never counted when you've stepped away.",
    me: "Hidden tabs and idle time stay out of the numbers.",
  },
  {
    feature: "Goals and the bow tie",
    visitor: "A small reward for exploring.",
    me: "Rewards what I hope visitors do: read a second case study, take the resume, get in touch.",
  },
  {
    feature: "Stamps and the pass",
    visitor: "Something to find, collect and share.",
    me: "A reason to look beyond the first page.",
  },
  {
    feature: "The champion",
    visitor: "A record to beat.",
    me: "A reason to stay a little longer.",
  },
  {
    feature: "Footer Bella",
    visitor: "My email, copied in one click.",
    me: "Getting in touch is the easiest last step on the page.",
  },
];

const TH = "pb-[12px] pr-[16px] font-brand text-[12px] font-normal uppercase leading-[16px] text-muted";
const TD = "py-[14px] pr-[16px] align-top";

function FeatureTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left font-body text-[14px] leading-[22px] md:text-[16px] md:leading-[24px]">
        <thead>
          <tr className="border-b border-line-soft">
            <th scope="col" className={TH}>Feature</th>
            <th scope="col" className={TH}>For visitors</th>
            <th scope="col" className={`${TH} pr-0`}>For me</th>
          </tr>
        </thead>
        <tbody>
          {FEATURES.map(({ feature, visitor, me }) => (
            <tr key={feature} className="border-b border-line-soft">
              <th scope="row" className={`${TD} font-medium text-heading`}>{feature}</th>
              <td className={`${TD} text-secondary`}>{visitor}</td>
              <td className={`${TD} pr-0 text-secondary`}>{me}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SOLVES = [
  {
    lead: "I can see what holds attention.",
    text: "Active time per visit and per case study tells me which work people actually read.",
  },
  {
    lead: "Visitors get a reason to stay.",
    text: "Lines, stamps and goals invite a second case study without getting in the way of the first.",
  },
  {
    lead: "The site has a host.",
    text: "A portfolio that greets you and notices you feels less like a folder of files.",
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
    <Chapter id="purpose" num={6} title="What Bella solves, and what it can be">
      <Copy>
        <p>
          Bella has two jobs: give visitors a reason to look around, and tell
          me whether they did. <Highlight>Every feature has to do one, and most do both.</Highlight>
        </p>
        <h3>What it solves</h3>
        <Pointers items={SOLVES} />
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>Every feature, and who it helps</h3>
        </Copy>
        <Visual>
          <FeatureTable />
        </Visual>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What it can be</h3>
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
const WORKING = [
  {
    lead: "Nothing was drawn by hand.",
    text: "Bella, its sign, its moods and its ding are all code Claude Code wrote from my descriptions. There is no design file behind this page.",
  },
  {
    lead: "Rounds took minutes.",
    text: "Six references and three characters came back two minutes after I asked for them.",
  },
  {
    lead: "Feedback was a sentence.",
    text: "I said what felt wrong, like “it doesn't feel like a bell anymore”, and the next version was on screen.",
  },
  {
    lead: "Direction stayed with me.",
    text: "Claude Code kept adding finish: chrome, shading, gloss. Twice I pulled it back to the design system.",
  },
  {
    lead: "It documented itself.",
    text: "Claude Code built a reference page for Bella: anatomy, palette, moods, motion, copy, sound, and do's and don'ts.",
  },
  {
    lead: "Every decision is a commit.",
    text: "49 commits between 23 Oct and 1 Nov, so any version of Bella can be brought back.",
  },
];

function WorkingInClaudeCode() {
  return (
    <Chapter id="claude-code" num={7} title="Working only in Claude Code">
      <Copy>
        <p>
          Bella is the first thing I designed without a design tool. <Highlight>The
          conversation was the design file.</Highlight>
        </p>
        <Pointers items={WORKING} />
      </Copy>
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
        title="Bella, the desk bell that hosts this portfolio, designed entirely in Claude Code"
        date="October 2026"
        badge="Made in Claude Code"
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
