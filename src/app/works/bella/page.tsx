import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { Bell, Shapes, ChatText, Cursor, Sparkle } from "@phosphor-icons/react/dist/ssr";
import {
  Hero,
  Chapter,
  Copy,
  Meta,
  Visual,
  Figure,
  CardGrid,
  PullQuote,
  OptionCard,
  ProsCons,
  NumberedPoints,
  Pointers,
  Timeline,
  ImagePlaceholder,
  BellaMoods,
  NextCase,
} from "@/components/case-study";

// DRAFT, 2 Nov 2026. Bella's own outline, set by Ashmik (not the Problem → Outcome template):
// what Bella is and why → everything tried → top three and the pick → research → use cases
// and enhancements → what Bella can do and how → what it solves and what it can be. No
// results section. Facts from my-portfolio/case-studies/bella-notes.md; quotes are Ashmik's,
// the joining copy is a placeholder for him to rewrite. Figures are placeholders.
// Not on the homepage list yet, so it doesn't change the "all five read" goal.

export const metadata: Metadata = {
  title: "Bella · Ashmik Ragesh",
  description:
    "Designing Bella, a front-desk bell that hosts the portfolio and measures how long each visitor actually stays.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",     label: "Overview"      },
  { id: "explorations", label: "Explorations"  },
  { id: "top-three",    label: "Top three"     },
  { id: "research",     label: "Research"      },
  { id: "use-cases",    label: "Use cases"     },
  { id: "abilities",    label: "What Bella does" },
  { id: "purpose",      label: "What it can be" },
];

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
        <Meta
          role="Designer and director. Character, illustration, motion, copy and sound"
          team="Ashmik Ragesh (Design), built with Claude Code"
          timeline="23 Oct to 1 Nov 2026, live on the site"
        />
      </Copy>
      <Visual>
        <BellaMoods />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Explorations  (every character and illustration tried)
// ─────────────────────────────────────────────────────────────────────────────
// `kept` marks the version that made it into the final Bella
const EXPLORATIONS: { title: string; note: string; items: { name: string; kept?: boolean }[] }[] = [
  {
    title: "Characters",
    note: "Three directions from the site's guesthouse theme.",
    items: [{ name: "Key tag" }, { name: "Bellhop" }, { name: "Desk bell", kept: true }],
  },
  {
    title: "Finish",
    note: "From cute and flat to full metal, and back to the design system.",
    items: [
      { name: "Flat plum with cheeks" },
      { name: "Polished plum metal" },
      { name: "Full chrome" },
      { name: "Chrome with charcoal" },
      { name: "Blackcurrant and grape", kept: true },
      { name: "Gold, for the champion", kept: true },
    ],
  },
  {
    title: "Face",
    note: "Each round took something away.",
    items: [{ name: "Eyes, smile and cheeks" }, { name: "Brows and a mouth" }, { name: "Eyes only", kept: true }],
  },
  {
    title: "Sign",
    note: "Where the time shows when you hover.",
    items: [
      { name: "Dark flip clock" },
      { name: "Brass and ivory plaque" },
      { name: "Compact plaque" },
      { name: "Pencil-drawn board" },
      { name: "Grape wood frame" },
      { name: "Ivory with a grape edge" },
      { name: "Neutral, hairline title", kept: true },
    ],
  },
  {
    title: "Tooltip",
    note: "How Bella's lines appear.",
    items: [
      { name: "Grape speech bubble" },
      { name: "Front desk rich tooltip" },
      { name: "Card with a percentile bar" },
      { name: "Compact dark, with a pointer", kept: true },
    ],
  },
];

function Explorations() {
  return (
    <Chapter id="explorations" num={1} title="Everything we tried">
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
            <ul className="m-0 grid list-none grid-cols-2 gap-[16px] p-0 md:grid-cols-3 lg:grid-cols-4">
              {items.map(({ name, kept }) => (
                <li key={name} className="flex flex-col gap-[8px]">
                  <ImagePlaceholder label={name} aspect="aspect-square" radius="rounded-lg" />
                  <p className="font-body text-[14px] leading-[22px] text-secondary">
                    {name}
                    {kept && <span className="ml-[8px] font-medium text-grape">Kept</span>}
                  </p>
                </li>
              ))}
            </ul>
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Top three  (and the one we picked)
// ─────────────────────────────────────────────────────────────────────────────
const TOP_THREE = [
  {
    label: "Option 1",
    title: "Key tag",
    chosen: false,
    pros: ["Ties straight to the guesthouse theme", "Could hold the time like a room number"],
    cons: ["At navbar size the details went missing", "Read as an object, not a character"],
  },
  {
    label: "Option 2",
    title: "Bellhop",
    chosen: false,
    pros: ["A host with hands, ready to greet"],
    cons: ["A whole person is too much detail for 40px"],
  },
  {
    label: "Option 3",
    title: "Desk bell",
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
    <Chapter id="top-three" num={2} title="The top three, and Bella">
      <Copy>
        <p>The key tag went furthest before it lost.</p>
        <PullQuote
          label="Why the key tag lost"
          text="In the header the key tag looks really small and"
          emphasis="the details go missing."
        />
      </Copy>
      {TOP_THREE.map(({ label, title, chosen, pros, cons }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard label={label} title={title} shipped={chosen} stamp="Selected" image={`${label}: ${title}`}>
              <ProsCons pros={pros} cons={cons} />
            </OptionCard>
          </Visual>
        </div>
      ))}
      <div className="cs-sub">
        <Copy>
          <p>
            Once picked, the bell drifted. Shaded and chromed, it stopped
            looking like itself.
          </p>
          <PullQuote
            label="The brief that fixed it"
            text="It doesn't feel like a bell anymore."
            emphasis="Make sure it feels like a bell, and maybe acts like a bell as well."
          />
          <p>So Bella rings: a short double ding before every line it says.</p>
        </Copy>
      </div>
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
    <Chapter id="research" num={3} title="What other mascots taught">
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
// Section: Use cases  (the enhancements made after the first Bella)
// ─────────────────────────────────────────────────────────────────────────────
const USE_CASES = [
  {
    title: "Reading a case study",
    description: "Bella puts on round gold reading glasses while you read a case study.",
  },
  {
    title: "Watching a video",
    description: "3D glasses go on, and a video you started counts as time spent, so Bella doesn't doze mid-reel.",
  },
  {
    title: "Leaving the tab",
    description: "The favicon dozes and the tab title shows your paused time, so you can see where you left off.",
  },
  {
    title: "Getting in touch",
    description: "The footer Bella holds up my email with a Copy email button beside it.",
  },
  {
    title: "Reaching a goal",
    description:
      "Two case studies in a visit, all of them read, the resume downloaded or the email copied: Bella wears a gold bow tie for about three seconds, then nothing stays.",
  },
  {
    title: "Exploring the site",
    description: "Five stamps to find: First ring, Screening, Front desk, Two in a row and Back again.",
  },
  {
    title: "Keeping a record",
    description: "Your Curiosity Pass slides out of an envelope, holds your stamps, and can be shared.",
  },
  {
    title: "Staying longest",
    description: "The longest visit this month turns Bella gold, with a Champion of Curiosity sign.",
  },
];

function UseCases() {
  return (
    <Chapter id="use-cases" num={4} title="Use cases and enhancements">
      <Copy>
        <p>
          The first Bella only kept time. Each enhancement after that came from
          a moment in a real visit, and asked what Bella should do there.
        </p>
        <NumberedPoints items={USE_CASES} stacked />
      </Copy>
      <Visual>
        <Figure label="Bella's glasses, bow tie, stamps and pass" />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>What we chose not to add</h3>
          <p>
            A halo and wings for celebrations (&ldquo;the circular motion is
            not needed&rdquo;), Bella travelling between sections as you
            scroll, a guest card in the footer, hands straightening the bow
            tie, and a ten-minute cap on the clock. Visit counts appear
            nowhere.
          </p>
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: What Bella does, and how
// ─────────────────────────────────────────────────────────────────────────────
const ABILITIES = [
  {
    lead: "Keeps real time.",
    text: "The clock only runs while you're here. It pauses when the tab is hidden or after 30 seconds without input, and sends the time to the server as you go.",
  },
  {
    lead: "Shows your time.",
    text: "Hover, focus or tap the bell and a sign drops below it, reading like 4m 16s. Tap again on a phone to hide it.",
  },
  {
    lead: "Rings and speaks.",
    text: "At 0:30, 2:00 and 5:00 Bella rings a short double ding and types one plain line. The first is “I'm Bella”.",
  },
  {
    lead: "Changes mood.",
    text: "Idle, it blinks and follows the cursor. When the clock pauses, it dozes. On the longest visit this month, it turns gold.",
  },
  {
    lead: "Appears once at a time.",
    text: "A smaller Bella pops up in the footer and hops along the counter. While it's up, the navbar Bella ducks and leaves its clock behind.",
  },
];

function Abilities() {
  return (
    <Chapter id="abilities" num={5} title="What Bella can do, and how">
      <Copy>
        <Pointers items={ABILITIES} />
      </Copy>
      <Visual>
        <Figure label="Bella on the site: the sign, a line and the footer" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: What it solves, and what it can be
// ─────────────────────────────────────────────────────────────────────────────
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
        <h3>What it solves</h3>
        <Pointers items={SOLVES} />
      </Copy>
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
      <Explorations />
      <TopThree />
      <Research />
      <UseCases />
      <Abilities />
      <Purpose />
      <NextCase current="/works/bella" />
    </CaseStudyLayout>
  );
}
