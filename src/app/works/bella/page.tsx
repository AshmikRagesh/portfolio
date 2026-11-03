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
  NextCase,
} from "@/components/case-study";

// DRAFT, 2 Nov 2026. Bella's own outline, set by Ashmik (not the Problem → Outcome template):
// what Bella is and why → research → everything tried → top three → the final Bella →
// the solution, with every use case shown live → what it solves and what it can be. No
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
  { id: "final",        label: "The final Bella" },
  { id: "solution",     label: "Solution"       },
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
    note: "Three directions from the site's guesthouse theme, each in one colour.",
    items: [
      { name: "Key tag", src: art("sketch-key-tag") },
      { name: "Bellhop", src: art("sketch-bellhop") },
      { name: "Desk bell", src: art("sketch-desk-bell") },
    ],
  },
  {
    title: "With depth",
    note: "“Even though it is flat, it doesn't have depth or character to it.” So each got a lit side, a shade side and a shadow.",
    items: [
      { name: "Key tag", src: art("depth-key-tag") },
      { name: "Bellhop", src: art("depth-bellhop") },
      { name: "Desk bell", src: art("depth-desk-bell") },
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
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The final Bella  (finalising the desk bell)
// ─────────────────────────────────────────────────────────────────────────────
const FINAL_CHOICES = [
  { lead: "Finish.", text: "Blackcurrant dome and grape base, from the design system. Gold only for the champion." },
  { lead: "Face.", text: "Eyes only. No mouth, no cheeks." },
  { lead: "Hands.", text: "Tucked behind the bell, and only come round to hold something." },
  { lead: "Sound.", text: "A short synthesised double ding before every line." },
];

function Final() {
  return (
    <Chapter id="final" num={4} title="Finalising Bella">
      <Copy>
        <p>
          Once picked, the bell drifted. Shaded and chromed, it stopped looking
          like itself.
        </p>
        <PullQuote
          label="The brief that fixed it"
          text="It doesn't feel like a bell anymore."
          emphasis="Make sure it feels like a bell, and maybe acts like a bell as well."
        />
        <Pointers items={FINAL_CHOICES} />
      </Copy>
      <Visual>
        <div className="grid grid-cols-2 gap-[16px]">
          {[
            { src: art("sketch-desk-bell"), name: "The first sketch, 23 Oct" },
            { src: art("final-bella"), name: "Bella, as it ships" },
          ].map(({ src, name }) => (
            <figure key={name} className="m-0 flex flex-col gap-[8px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={name} className="aspect-[4/3] w-full rounded-lg border border-line-soft bg-white object-contain p-[40px]" />
              <figcaption className="text-center font-body text-[14px] leading-[22px] text-secondary">{name}</figcaption>
            </figure>
          ))}
        </div>
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution  (what Bella does, and every use case, live)
// ─────────────────────────────────────────────────────────────────────────────
const AROUND_THE_SITE = [
  {
    lead: "In the footer.",
    text: "A smaller Bella pops up and hops along the counter, holding my email with a Copy email button. While it's up, the navbar Bella ducks and leaves its clock behind.",
  },
  {
    lead: "In the browser tab.",
    text: "The favicon dozes and the tab title shows your paused time when you leave.",
  },
  {
    lead: "On your pass.",
    text: "Stamps you find land on a Curiosity Pass that slides out of an envelope and can be shared.",
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={5} title="Everything Bella does">
      <Copy>
        <p>
          The first Bella only kept time. Every addition after that came from a
          moment in a real visit, and asked what Bella should do there. The
          clock only counts while you&apos;re here: it pauses when the tab is
          hidden or after 30 seconds without input.
        </p>
      </Copy>
      <Visual>
        <BellaUseCases />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>Around the site</h3>
          <Pointers items={AROUND_THE_SITE} />
        </Copy>
        <Visual>
          <Figure label="The footer Bella, the tab and the Curiosity Pass" />
        </Visual>
      </div>
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
      <Research />
      <Explorations />
      <TopThree />
      <Final />
      <Solution />
      <Purpose />
      <NextCase current="/works/bella" />
    </CaseStudyLayout>
  );
}
