import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { reels } from "@/content/reels";
import { Code, ShieldCheck, Stack } from "@phosphor-icons/react/dist/ssr";
import {
  Hero,
  Chapter,
  Copy,
  Meta,
  Visual,
  Figure,
  CardGrid,
  ProblemStatement,
  ProcessStrip,
  Timeline,
  Metrics,
  Footnote,
  NextCase,
  SkillBand,
  FlowCompare,
} from "@/components/case-study";

// DRAFT — angle chosen 29 Oct 2026: "build once, not twice", with Ashmik's own path
// (Enchanting in code → Helix pilot → three brands moved) as the evidence. Copy is a
// first pass from Ashmik's answers; see my-portfolio/case-studies/helix-notes.md.
// Figures are placeholders until the recordings are made.

export const metadata: Metadata = {
  title: "Helix · Ashmik Ragesh",
  description:
    "Helix is a design-system skill for Claude Code that lets designers build straight from each brand's components and tokens, so a component is built once instead of twice.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",    label: "Overview"        },
  { id: "the-problem", label: "The Problem"     },
  { id: "discovery",   label: "Discovery"       },
  { id: "solution",    label: "Solution"        },
  { id: "approach",    label: "Approaches"      },
  { id: "output",      label: "A ticket"        },
  { id: "outcome",     label: "Where it stands" },
  { id: "reflection",  label: "Reflection"      },
];

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview  (with Role / Team / Timeline)
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <Chapter id="overview" num={0} title="Overview">
      <Copy>
        <p>
          From first idea to finished screen, our designers now work in one
          place. Helix is a skill on Claude Code that holds the design system of
          every Travelopia brand, and it covers each step: exploring,
          brainstorming, wireframing, layouts, building screens, and keeping the
          system audited and up to date. What we build is what ships, and our
          designs now ship in about half the time.
        </p>
        <Meta
          role="Product Designer. Tried designing with Claude Code before Helix, was one of the first designers on it, and moved three brands onto it"
          team="Ashmik Ragesh and Hriday Gami (Design), Travelopia's developers (Engineering)"
          timeline="Pilot in June 2026, rollout from July, in daily use since August"
        />
      </Copy>
      <Visual>
        <Figure label="Helix on Claude Code" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The Problem
// ─────────────────────────────────────────────────────────────────────────────
function TheProblem() {
  return (
    <Chapter id="the-problem" num={1} title="Two design systems that had to match">
      <Copy>
        <p>
          Every brand&apos;s design system lived in two places: our Figma
          library and the developers&apos; coded components. Every ticket was
          handed to developers as a Figma file. Designs were well documented,
          but small details like padding and colour values still slipped
          between the two.
        </p>
        <p>
          Each slip became a bug ticket that only a developer could fix.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Each brand's design system was kept twice: in Figma by designers, and in code by developers."
          consequence="The two drifted apart, every mismatch became a bug for developers, and keeping a dozen brands consistent got slower with each change."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Discovery
// ─────────────────────────────────────────────────────────────────────────────
const REQUIREMENTS = [
  {
    icon: <Stack size={28} weight="fill" className="text-grape" />,
    title: "One source",
    description: "Each brand's design system lives once, in code.",
  },
  {
    icon: <Code size={28} weight="fill" className="text-grape" />,
    title: "Developers' code",
    description: "The same TypeScript components they maintain.",
  },
  {
    icon: <ShieldCheck size={28} weight="fill" className="text-grape" />,
    title: "Nothing off-system",
    description: "Only the brand's components and tokens.",
  },
];

function Discovery() {
  return (
    <Chapter id="discovery" num={2} title="Claude Code alone wasn't enough">
      <Copy>
        <p>
          I started on Enchanting Travels by building with Claude Code, giving
          it our Figma components through the Figma MCP server. The screens came
          together fast, but they weren&apos;t consistent: spacing, colours and
          components drifted from the system, and every build needed
          corrections. Having the design system as a reference wasn&apos;t
          enough. The AI had to be limited to it.
        </p>
        <h3>What the fix needed</h3>
      </Copy>
      <Visual>
        <CardGrid items={REQUIREMENTS} />
        <Figure label="Claude Code with the Figma MCP, before Helix" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution  (each problem raised earlier, and how Helix answers it)
// ─────────────────────────────────────────────────────────────────────────────
const PAIRS = [
  {
    num: 1,
    problem: "Two copies of each design system drifted apart, across a dozen brands",
    title: "One design system per brand, in code",
    body: "Each brand's design system lives in Helix, written as the same TypeScript components our developers use. Designers build in it directly, so there is no second copy to drift. One skill holds every brand, and work on one brand only uses that brand's system.",
    figure: "One brand's foundations in Helix: colour, type and spacing",
  },
  {
    num: 2,
    problem: "Padding and colour values slipped in the build",
    title: "Only the system's values",
    body: "Helix can only use the brand's own tokens and components, so every value comes out exactly as the system defines it. If a component is missing, we add it to the system first instead of improvising.",
    figure: "A component, with the token behind each value",
  },
  {
    num: 3,
    problem: "Every miss became a bug ticket only a developer could fix",
    title: "Designers fix it, developers review",
    body: "When a designer spots a miss, they fix it in Helix and send a pull request. A developer reviews it and merges it, so a small fix no longer waits in the queue.",
  },
];

const FIX_BEFORE = [
  { text: "Spot a miss", who: "Designer" },
  { text: "Write it up in a bug ticket", who: "Designer" },
  { text: "Wait for a developer to pick it up", who: "Developer", wait: true },
  { text: "Fix it", who: "Developer" },
  { text: "Check the fix", who: "Designer" },
];
const FIX_AFTER = [
  { text: "Spot a miss", who: "Designer" },
  { text: "Fix it in Helix", who: "Designer" },
  { text: "Send a pull request", who: "Designer" },
  { text: "Review and merge", who: "Developer" },
];
const SKILLS = [
  { title: "Explorations", description: "Variations of a screen, side by side" },
  { title: "Wireframing", description: "The flow agreed before the detail" },
  { title: "Layout", description: "Pages on the brand's own grid" },
  { title: "Build", description: "Components and screens, ready for a pull request" },
  { title: "Audit", description: "Anything off-system, flagged" },
];

function Solution() {
  return (
    <Chapter id="solution" num={3} title="How Helix solves it">
      <Copy>
        <p>
          Each problem from earlier has its own answer in Helix.
        </p>
      </Copy>
      {PAIRS.map(({ num, problem, title, body, figure }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <p className="cs-problem">
              <span className="font-brand text-[12px] uppercase leading-[16px] text-warning">Problem</span>
              <span>{problem}</span>
            </p>
            <h3>
              {num}. {title}
            </h3>
            <p>{body}</p>
          </Copy>
          <Visual>
            {figure ? (
              <Figure name={figure} />
            ) : (
              <FlowCompare
                before={{ label: "Before", summary: "The fix waits in a developer's queue.", steps: FIX_BEFORE }}
                after={{ label: "With Helix", summary: "The designer fixes it, a developer reviews it.", steps: FIX_AFTER }}
              />
            )}
          </Visual>
        </div>
      ))}
      <div className="cs-sub">
        <Visual>
          <SkillBand
            command="/helix"
            title="Day to day, the whole job happens in Helix"
            note="Every step uses only the brand's own system."
            skills={SKILLS}
          />
        </Visual>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Approach  (how it was rolled out without pausing live work)
// ─────────────────────────────────────────────────────────────────────────────
const ROLLOUT = [
  {
    title: "June: first tickets",
    description:
      "Helix was tried on live work first. My first Helix ticket was the Find a Trip test for TCS.",
  },
  {
    title: "July: foundations first",
    description:
      "Tickets kept coming, so we couldn't stop to migrate everything. Every brand's primary tokens and values went in first, exactly right.",
  },
  {
    title: "July–August: components as we go",
    description:
      "Existing components moved over whenever there was time, and new ones were built on the foundations when a ticket needed them. My three brands took about a month.",
  },
];

function Approach() {
  return (
    <Chapter id="approach" num={4} title="How we rolled it out">
      <Copy>
        <p>
          We couldn&apos;t pause the work to migrate, so Helix went in
          alongside live tickets. From August, every new ticket was designed in
          Helix.
        </p>
        <Timeline items={ROLLOUT} />
      </Copy>
      <Visual>
        <Figure label="A brand's components, migrated into Helix" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: A ticket, start to finish  (output)
// ─────────────────────────────────────────────────────────────────────────────
const WORKFLOW = [
  "Brief",
  "Explore in Helix",
  "Pick a direction",
  "Build with the brand's components",
  "Pull request",
  "Developer review",
  "Merge",
];

function Output() {
  return (
    <Chapter id="output" num={5} title="A ticket, start to finish">
      <Copy>
        <p>
          Every ticket now runs the same way, from the brief to the merge.{" "}
          <a href="/works/tcs-find-a-trip">Find a Trip</a> for TCS was the first:
          both test variants were explored, built and reviewed in Helix, then
          merged.
        </p>
        <ProcessStrip steps={WORKFLOW} />
      </Copy>
      <Visual>
        <Figure label="Find a Trip, explored and built in Helix" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Where it stands  (outcome)
// ─────────────────────────────────────────────────────────────────────────────
const RESULTS = [
  { stat: "~½", label: "the time to deliver a ticket's designs" },
  { stat: "1 month", label: "to move three brands' components into Helix" },
  { stat: "Every", label: "new ticket since August built in Helix" },
];

function Outcome() {
  return (
    <Chapter id="outcome" num={6} title="Where it stands">
      <Copy>
        <p>
          Every Travelopia brand now has its design system in Helix. I design
          for four of them: TCS World Travel, Quark Expeditions, Kalos Golf and
          Enchanting Travels.
        </p>
        <p>
          Tickets that took one to two weeks to deliver now take about half
          that. New work reuses what&apos;s already there: the country and state
          dropdowns for the TCS forms reused the existing combobox component
          instead of a new design.
        </p>
      </Copy>
      <Visual>
        <Metrics items={RESULTS} />
        <Footnote>
          Delivery time is my own estimate across my tickets, not a tracked
          measure.
        </Footnote>
      </Visual>
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
          The speed came from setup we did before any screen was built. Getting
          the tokens and foundations right for every brand took time, and
          everything after it depended on that work.
        </p>
        <p>
          Designing inside a system also means you can only use what it has.
          When something is missing, you add it to the design system instead of
          drawing around it, which is slower once and faster every time after.
        </p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HelixPage() {
  return (
    <CaseStudyLayout sections={SECTIONS} reel={reels.helix}>
      <Hero title="Shipping designs in half the time with Helix" date="2026" />
      <Overview />
      <TheProblem />
      <Discovery />
      <Solution />
      <Approach />
      <Output />
      <Outcome />
      <Reflection />
      <NextCase current="/works/helix" />
    </CaseStudyLayout>
  );
}
