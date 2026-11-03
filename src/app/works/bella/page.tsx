import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { Bell, Shapes, ChatText, Cursor, Sparkle } from "@phosphor-icons/react/dist/ssr";
import {
  Hero,
  Chapter,
  Copy,
  Visual,
  Figure,
  CardGrid,
  PullQuote,
  OptionCard,
  ProsCons,
  Pointers,
  Timeline,
  ExplorationCard,
  BellaUseCases,
  type BellaSceneName,
  NextCase,
} from "@/components/case-study";

// DRAFT, 2 Nov 2026. Bella's own outline, set by Ashmik (not the Problem → Outcome template):
// what Bella is and why → research → everything tried → top three → the final Bella →
// the solution (how Bella hosts a visit), each step shown live → what it solves and what it can be. No
// results section. Stills are in public/images/bella (scripts/draw-bella-explorations.py);
// the solution's scenes are the live character. Facts from
// my-portfolio/case-studies/bella-notes.md; quotes are Ashmik's, the joining copy is a
// placeholder for him to rewrite. Not on the homepage list yet, so it doesn't change the
// "all five read" goal.

export const metadata: Metadata = {
  title: "Bella · Ashmik Ragesh",
  description:
    "Designing Bella, a front-desk bell that hosts the portfolio and measures how long each visitor actually stays.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",     label: "Overview"       },
  { id: "research",     label: "Research"       },
  { id: "explorations", label: "Explorations"   },
  { id: "top-three",    label: "Top three"      },
  { id: "solution",     label: "A visit"        },
  { id: "purpose",      label: "What it can be" },
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
          It sits in the navbar as the logo, keeps track of how long you
          actually spend here, and shows it on a small sign when you hover.
          When it has something to say, it rings first.
        </p>
        <p>
          I made Bella for two reasons. I wanted to know whether people really
          read my work, and for how long. And I wanted visitors to have a
          reason to look around a little longer. A plain clock in the corner
          did neither, so the clock became a character.
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
const LESSONS = [
  {
    icon: <Shapes size={28} weight="fill" className="text-grape" />,
    title: "Silhouette first",
    description: "Duolingo reshaped Duo's outline before any detail. Bella has to read at 40px in a navbar.",
  },
  {
    icon: <Sparkle size={28} weight="fill" className="text-grape" />,
    title: "Draw the ones you'll dislike",
    description: "PostHog went through about 18 hedgehogs, including styles they expected to reject.",
  },
  {
    icon: <ChatText size={28} weight="fill" className="text-grape" />,
    title: "Don't make it talk too much",
    description: "Mailchimp never writes copy in Freddie's voice. Bella's lines stay plain and factual.",
  },
  {
    icon: <Bell size={28} weight="fill" className="text-grape" />,
    title: "Interrupting has a cost",
    description: "Clippy is the warning. Bella speaks three times a visit, and never covers the work.",
  },
  {
    icon: <Cursor size={28} weight="fill" className="text-grape" />,
    title: "Look at what matters",
    description: "Tripadvisor's Ollie lets its eyes follow content. Bella's eyes follow the cursor.",
  },
];

function Research() {
  return (
    <Chapter id="research" num={1} title="What other mascots taught">
      <Copy>
        <p>
          I asked for a small, very minimal character that could be the logo
          and flash the time on a board when hovered. Before drawing, we looked
          at six hospitality mascots: Tripadvisor&apos;s Ollie, the Suica
          penguin, Air India&apos;s Maharaja, Kumamon, Bibendum and Grimace.
          They share one or two colours, one basic shape and dot eyes, and get
          their personality from pose.
        </p>
        <p>
          Then we read how other teams built theirs. Five lessons changed what
          we made.
        </p>
      </Copy>
      <Visual>
        <CardGrid items={LESSONS} />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Explorations  (every character and illustration tried)
// ─────────────────────────────────────────────────────────────────────────────
// `kept` marks the version that made it into the final Bella
const EXPLORATIONS: { title: string; note: string; items: { name: string; src: string; kept?: boolean }[] }[] = [
  {
    title: "First sketches",
    note: "Three directions from the site's guesthouse theme, each in one colour. The door hanger came later, drawn for this write-up.",
    items: [
      { name: "Key tag", src: art("sketch-key-tag") },
      { name: "Bellhop", src: art("sketch-bellhop") },
      { name: "Desk bell", src: art("sketch-desk-bell") },
      { name: "Door hanger", src: art("sketch-door-hanger") },
    ],
  },
  {
    title: "With depth",
    note: "“Even though it is flat, it doesn't have depth or character to it.” So each got a lit side, a shade side and a shadow.",
    items: [
      { name: "Key tag", src: art("depth-key-tag") },
      { name: "Bellhop", src: art("depth-bellhop") },
      { name: "Desk bell", src: art("depth-desk-bell") },
      { name: "Door hanger", src: art("depth-door-hanger") },
    ],
  },
  {
    title: "Finish",
    note: "From cute and flat to full metal, and back to the design system.",
    items: [
      { name: "Flat plum", src: art("finish-flat-plum") },
      { name: "Chrome with charcoal", src: art("finish-chrome-charcoal") },
      { name: "Blackcurrant and grape", src: art("finish-blackcurrant"), kept: true },
      { name: "Gold, for the champion", src: art("finish-gold"), kept: true },
    ],
  },
  {
    title: "Sign",
    note: "Where the time shows when you hover.",
    items: [
      { name: "Dark flip clock", src: art("sign-flip-clock") },
      { name: "Brass and ivory plaque", src: art("sign-brass-ivory") },
      { name: "Grape wood frame", src: art("sign-grape-wood") },
      { name: "Cream plaque with flip digits", src: art("sign-neutral"), kept: true },
    ],
  },
  {
    title: "Tooltip",
    note: "How Bella's lines appear.",
    items: [
      { name: "Grape speech bubble", src: art("tip-grape-bubble") },
      { name: "Front desk rich tooltip", src: art("tip-front-desk") },
      { name: "Card with a percentile bar", src: art("tip-percentile-card") },
      { name: "Compact dark, with a pointer", src: art("tip-compact-dark"), kept: true },
    ],
  },
];

function Explorations() {
  return (
    <Chapter id="explorations" num={2} title="Everything we tried">
      <Copy>
        <p>
          Bella went through many versions in ten days. Most rounds ended the
          same way: a version looked good on its own but didn&apos;t belong on
          the site, so it moved back toward the design system.
        </p>
      </Copy>
      {EXPLORATIONS.map(({ title, note, items }) => (
        <div key={title} className="cs-sub">
          <Copy>
            <h3>{title}</h3>
            <p>{note}</p>
          </Copy>
          <Visual>
            <ul className="m-0 grid list-none grid-cols-2 gap-[16px] p-0 md:grid-cols-4">
              {items.map((item) => (
                <ExplorationCard key={item.name} {...item} />
              ))}
            </ul>
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Top three
// ─────────────────────────────────────────────────────────────────────────────
const TOP_THREE = [
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
    title: "Bellhop",
    src: art("depth-bellhop"),
    chosen: false,
    pros: ["A host with a hat, ready to greet"],
    cons: ["Not taken past the first two rounds"],
  },
  {
    label: "Option 3",
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

function TopThree() {
  return (
    <Chapter id="top-three" num={3} title="The top three">
      <Copy>
        <p>
          Three characters made it to the shortlist. The key tag went furthest
          before it lost.
        </p>
        <PullQuote
          label="Why the key tag lost"
          text="In the header the key tag looks really small and"
          emphasis="the details go missing."
        />
      </Copy>
      {TOP_THREE.map(({ label, title, src, chosen, pros, cons }) => (
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
          <h3>Refining the desk bell</h3>
          <p>
            Once picked, the bell drifted. Shaded and chromed, it stopped
            looking like itself.
          </p>
          <PullQuote
            label="The brief that fixed it"
            text="It doesn't feel like a bell anymore."
            emphasis="Make sure it feels like a bell, and maybe acts like a bell as well."
          />
          <Pointers items={FINAL_CHOICES} />
        </Copy>
        <Visual>
          <ul className="m-0 grid list-none grid-cols-2 gap-[16px] p-0 md:grid-cols-4">
            <ExplorationCard name="The first sketch, 23 Oct" src={art("sketch-desk-bell")} />
            <ExplorationCard name="Bella, as it ships" src={art("final-bella")} kept />
          </ul>
        </Visual>
      </div>
    </Chapter>
  );
}

const FINAL_CHOICES = [
  { lead: "Finish.", text: "Blackcurrant dome and grape base, from the design system. Gold only for the champion." },
  { lead: "Face.", text: "Eyes only. No mouth, no cheeks." },
  { lead: "Hands.", text: "Tucked behind the bell, and only come round to hold something." },
  { lead: "Sound.", text: "A short synthesised double ding before every line." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution  (how Bella hosts a visit, step by step, each step live)
// ─────────────────────────────────────────────────────────────────────────────
const VISIT: { num: number; title: string; body: string; scenes: BellaSceneName[] }[] = [
  {
    num: 1,
    title: "It greets you",
    body: "At 0:30, 2:00 and 5:00 Bella rings once and types one plain line in a small tooltip. Three lines a visit, never over the work.",
    scenes: ["hello"],
  },
  {
    num: 2,
    title: "It keeps your time",
    body: "Hover, focus or tap the bell and it lowers a sign with your active time, like 4m 16s. On phones, tap again to hide it.",
    scenes: ["time"],
  },
  {
    num: 3,
    title: "It reads and watches with you",
    body: "Round gold reading glasses while a case study is open, and 3D glasses while a video you started plays. The clock keeps counting through both.",
    scenes: ["reading", "watching"],
  },
  {
    num: 4,
    title: "It dozes when you leave",
    body: "Hide the tab or stop for 30 seconds and the clock pauses and Bella falls asleep, so only real attention counts. The browser tab dozes too, and its title shows your paused time.",
    scenes: ["dozing"],
  },
  {
    num: 5,
    title: "It celebrates what you find",
    body: "Reading two case studies, reading all of them, downloading the resume or copying the email earns a gold bow tie for about three seconds. Five stamps are hidden around the site; when you find one, Bella looks surprised and the stamp lands on your Curiosity Pass.",
    scenes: ["goal", "stamp"],
  },
  {
    num: 6,
    title: "It crowns the longest stay",
    body: "The longest visit this month turns Bella and the sign gold. Visit counts appear nowhere.",
    scenes: ["champion"],
  },
];

const AROUND_THE_SITE = [
  {
    lead: "In the footer.",
    text: "A smaller Bella pops up and hops along the counter, holding my email with a Copy email button. While it's up, the navbar Bella ducks and leaves its clock behind.",
  },
  {
    lead: "On your pass.",
    text: "Stamps you find land on a Curiosity Pass that slides out of an envelope and can be shared.",
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={4} title="How Bella hosts a visit">
      <Copy>
        <p>
          The first Bella only kept time. Every addition after that came from a
          moment in a real visit, and asked what Bella should do there. Here
          they are in the order a visitor meets them.
        </p>
      </Copy>
      {VISIT.map(({ num, title, body, scenes }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>{num}. {title}</h3>
            <p>{body}</p>
          </Copy>
          <Visual>
            <BellaUseCases scenes={scenes} />
          </Visual>
        </div>
      ))}
      <div className="cs-sub">
        <Copy>
          <h3>7. It follows you round the site</h3>
          <Pointers items={AROUND_THE_SITE} />
        </Copy>
        <Visual>
          <Figure label="The footer Bella and the Curiosity Pass" />
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
    <Chapter id="purpose" num={5} title="What Bella solves, and what it can be">
      <Copy>
        <p>
          Bella has two jobs: give visitors a reason to look around, and tell
          me whether they did. Every feature has to do one, and most do both.
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
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function BellaPage() {
  return (
    <CaseStudyLayout sections={SECTIONS}>
      <Hero title="Designing Bella, a front-desk bell that measures curiosity" date="2026" />
      <Overview />
      <Research />
      <Explorations />
      <TopThree />
      <Solution />
      <Purpose />
      <NextCase current="/works/bella" />
    </CaseStudyLayout>
  );
}
