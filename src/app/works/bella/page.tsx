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
  ProblemStatement,
  PullQuote,
  OptionCard,
  ProsCons,
  NumberedPoints,
  Pointers,
  Metrics,
  Footnote,
  BellaMoods,
  NextCase,
} from "@/components/case-study";

// DRAFT, 1 Nov 2026. Structure and facts from my-portfolio/case-studies/bella-notes.md and the
// mascot write-ups it lists (Duolingo, PostHog, Mailchimp, Clippy, Tripadvisor). Quotes are
// Ashmik's own; the joining copy is a placeholder for him to rewrite in his words
// (case-study-guide.md cuts AI first drafts). Figures are placeholders until recorded.
// Not on the homepage list yet, so it doesn't change the "all five read" goal.

export const metadata: Metadata = {
  title: "Bella · Ashmik Ragesh",
  description:
    "Designing Bella, a front-desk bell that hosts the portfolio and measures how long each visitor actually stays.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",    label: "Overview"    },
  { id: "the-problem", label: "The Problem" },
  { id: "research",    label: "Research"    },
  { id: "directions",  label: "Directions"  },
  { id: "details",     label: "Details"     },
  { id: "output",      label: "What shipped" },
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
          Bella is the desk bell in this site&apos;s navbar. It keeps each
          visit&apos;s active time, shows it on a small sign when you hover,
          and rings when it has something to say. I designed it over ten
          days, directing every decision, and built it with Claude Code. It
          is live on the site, but has not met real visitors yet.
        </p>
        <Meta
          role="Designer and director. Character, motion, copy, sound, and what gets measured"
          team="Ashmik Ragesh (Design), built with Claude Code"
          timeline="23 Oct to 1 Nov 2026, ready for launch"
        />
      </Copy>
      <Visual>
        <BellaMoods />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The Problem
// ─────────────────────────────────────────────────────────────────────────────
function TheProblem() {
  return (
    <Chapter id="the-problem" num={1} title="A timer that measured nothing">
      <Copy>
        <p>
          The navbar already had a timer with the line &ldquo;Measuring your
          curiosity&rdquo;. It counted wall-clock time in the browser, kept
          running in a hidden tab, and sent nothing anywhere. I had no way to
          know whether anyone read my work, or for how long.
        </p>
        <p>
          It also gave visitors no reason to stay. A clock ticking in the
          corner is easy to ignore.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="The portfolio showed every visitor a timer, but it counted time nobody spent reading and kept the number to itself."
          consequence="I couldn't tell which work held attention, and nothing on the page asked a visitor to look a little longer."
        />
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
    <Chapter id="research" num={2} title="What other mascots taught">
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
// Section: Directions  (key tag, bellhop, desk bell)
// ─────────────────────────────────────────────────────────────────────────────
const DIRECTIONS = [
  {
    label: "Direction 1",
    title: "Key tag",
    chosen: false,
    pros: ["Ties straight to the guesthouse theme", "Could hold the time like a room number"],
    cons: ["At navbar size the details went missing", "Read as an object, not a character"],
  },
  {
    label: "Direction 2",
    title: "Bellhop",
    chosen: false,
    pros: ["A host with hands, ready to greet"],
    cons: ["A whole person is too much detail for 40px", "Not taken past the first sketches"],
  },
  {
    label: "Direction 3",
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

function Directions() {
  return (
    <Chapter id="directions" num={3} title="Key tag, bellhop or desk bell">
      <Copy>
        <p>
          Three directions came out of the site&apos;s guesthouse theme. The
          key tag went furthest before it lost.
        </p>
        <PullQuote
          label="Why the key tag lost"
          text="In the header the key tag looks really small and"
          emphasis="the details go missing."
        />
      </Copy>
      {DIRECTIONS.map(({ label, title, chosen, pros, cons }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard label={label} title={title} shipped={chosen} stamp="Chosen" image={`${label}: ${title}`}>
              <ProsCons pros={pros} cons={cons} />
            </OptionCard>
          </Visual>
        </div>
      ))}
      <div className="cs-sub">
        <Copy>
          <p>
            The desk bell then drifted. Shaded and chromed, it stopped looking
            like itself.
          </p>
          <PullQuote
            label="The brief that fixed it"
            text="It doesn't feel like a bell anymore."
            emphasis="Make sure it feels like a bell, and maybe acts like a bell as well."
          />
          <p>
            So Bella rings: a short double ding before every line it says.
          </p>
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Details  (finish, face, sign, tooltip, copy, movement)
// ─────────────────────────────────────────────────────────────────────────────
const DETAILS = [
  {
    title: "Finish",
    tried: "Flat plum with cheeks, polished plum metal, full chrome, chrome with charcoal",
    kept: "Blackcurrant dome and grape base, from the design system. Gold only for the champion.",
    why: "“The silver colour with our colour is not working at all.”",
  },
  {
    title: "Face",
    tried: "Eyes, smile and cheeks; eyes with brows and a mouth",
    kept: "Eyes only.",
    why: "“Right now it looks really cute, and the realistic version looks a little off.”",
  },
  {
    title: "Sign",
    tried: "A dark flip clock, a brass and ivory plaque, a pencil-drawn board, a grape wood frame",
    kept: "A light neutral sign under the bell with a hairline title, reading 4m 16s.",
    why: "“For a user who would hover over it a lot of times this would be very heavy.”",
  },
  {
    title: "Tooltip",
    tried: "A grape speech bubble, a “Front desk” rich tooltip, a card with a percentile bar and buttons",
    kept: "A compact dark tooltip with a pointer.",
    why: "“It feels like a toast message instead of a tooltip.”",
  },
  {
    title: "Copy",
    tried: "Deadpan lines, then a playful hotel host with a few random lines per moment",
    kept: "Plain front-desk facts. No jokes, no visit counts.",
    why: "The playful lines “feel like AI”.",
  },
  {
    title: "Movement",
    tried: "Bella travelling between sections as you scroll; a hand-off from navbar to footer",
    kept: "One Bella in the navbar and one in the footer, and only one up at a time.",
    why: "“Let's stop making changes to the movement of the character.”",
  },
];

function Details() {
  return (
    <Chapter id="details" num={4} title="Every detail, pushed back to the system">
      <Copy>
        <p>
          Most rounds ended the same way: the new version looked good alone
          but didn&apos;t belong on the site. Each time, Bella moved back
          toward the design system&apos;s own colours, type and weight.
        </p>
      </Copy>
      {DETAILS.map(({ title, tried, kept, why }) => (
        <div key={title} className="cs-sub">
          <Copy>
            <h3>{title}</h3>
            <ProsCons pros={[kept]} cons={[tried]} />
            <p>{why}</p>
          </Copy>
        </div>
      ))}
      <Visual>
        <Figure label="The variations, side by side" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: What shipped  (output)
// ─────────────────────────────────────────────────────────────────────────────
const SHIPPED = [
  {
    title: "Only real attention counts",
    description:
      "The clock pauses when the tab is hidden or after 30 seconds without input. A video you started counts as reading.",
  },
  {
    title: "A sign on hover, a tap on phones",
    description: "Hover, focus or tap the bell and the sign drops with your time, like 4m 16s.",
  },
  {
    title: "Three lines a visit",
    description: "At 0:30, 2:00 and 5:00 Bella rings and says one plain line. The first one is “I'm Bella”.",
  },
  {
    title: "Small goals, briefly celebrated",
    description:
      "Two case studies in a visit, all of them read, the resume downloaded or the email copied: a gold bow tie for about three seconds, then nothing stays.",
  },
  {
    title: "A pass to keep",
    description: "Five stamps to find, and a Curiosity Pass you can open from an envelope and share.",
  },
];

function Output() {
  return (
    <Chapter id="output" num={5} title="What shipped">
      <Copy>
        <NumberedPoints items={SHIPPED} stacked />
      </Copy>
      <Visual>
        <Figure label="Bella on the site: the sign, a line and the footer" />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>What I chose not to build</h3>
          <p>
            A halo and wings for celebrations (&ldquo;the circular motion is
            not needed&rdquo;), a guest card in the footer, hands straightening
            the bow tie, and a ten-minute cap on the clock. Visit counts appear
            nowhere.
          </p>
        </Copy>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Outcome  (not measured yet, and how it will be)
// ─────────────────────────────────────────────────────────────────────────────
const MEASURES = [
  { stat: "Active time", label: "Average and median per visit, already on the stats page" },
  { stat: "Sign opens", label: "Share of visits that hover or tap Bella" },
  { stat: "2:00 and 5:00", label: "Share of visits that reach each line" },
  { stat: "Footer", label: "Share of visits that reach the footer Bella" },
];

function Outcome() {
  return (
    <Chapter id="outcome" num={6} title="Not measured yet">
      <Copy>
        <p>
          Bella is built and on the site, but no real visitor has met it yet.
          Everything recorded so far is from testing, so there is no result to
          report. When it launches, these are the numbers that will say
          whether it works.
        </p>
        <Metrics items={MEASURES} />
        <Footnote>
          Status as of 1 November 2026. Events for hovers, sign opens and taps
          are recorded from launch.
        </Footnote>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection
// ─────────────────────────────────────────────────────────────────────────────
const WORKED = [
  {
    lead: "The system was the tiebreaker.",
    text: "Whenever a version looked off, moving it back to the design system's colours and weight fixed it.",
  },
  {
    lead: "Acting like the object.",
    text: "Making Bella ring, instead of only look like a bell, did more for its character than any shading.",
  },
  {
    lead: "Saying no to movement.",
    text: "Two movement ideas worked technically and still came out. One Bella at a time is calmer.",
  },
];

const NEXT_TIME = [
  {
    lead: "I'd set the events up first.",
    text: "Hovers and sign opens weren't recorded from the start, so the first visitors are the baseline.",
  },
  {
    lead: "I'd sketch the silhouette earlier.",
    text: "The key tag lost on size. Testing every direction at 40px on day one would have saved a round.",
  },
];

function Reflection() {
  return (
    <Chapter id="reflection" num={7} title="What I learned">
      <Copy>
        <h3>What worked</h3>
        <Pointers items={WORKED} />
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>What I&apos;d change</h3>
          <Pointers items={NEXT_TIME} />
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
      <TheProblem />
      <Research />
      <Directions />
      <Details />
      <Output />
      <Outcome />
      <Reflection />
      <NextCase current="/works/bella" />
    </CaseStudyLayout>
  );
}
