import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { reels } from "@/content/reels";
import { Code, Cube, Layout, Lightbulb, ListChecks, PencilRuler, ShieldCheck, Stack } from "@phosphor-icons/react/dist/ssr";
import {
  Hero,
  Chapter,
  Copy,
  Meta,
  Visual,
  Figure,
  CardGrid,
  ProblemStatement,
  NumberedPoints,
  ProcessStrip,
  Timeline,
  Metrics,
  Footnote,
  NextCase,
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
  { id: "exploration", label: "Approaches"      },
  { id: "solution",    label: "Solution"        },
  { id: "output",      label: "Build"           },
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
// Section: Exploration
// ─────────────────────────────────────────────────────────────────────────────
const APPROACH = [
  {
    title: "Foundations first",
    description:
      "Tickets kept coming, so we couldn't stop to migrate everything. We set up every brand's foundations first: all the primary tokens and values, exactly right.",
  },
  {
    title: "Components as we go",
    description:
      "Existing components moved into Helix whenever there was time. When a ticket needed a new one, we built it on those foundations.",
  },
  {
    title: "Built to our developers' standards",
    description:
      "A developer built Helix and maintains it, so every component uses the same code and best practices as our codebase.",
  },
  {
    title: "Limited to the system",
    description:
      "Helix can only use the brand's own components and tokens. If something is missing, we add it to the system instead of improvising.",
  },
  {
    title: "One skill, every brand kept separate",
    description:
      "Every Travelopia brand lives in one skill, and work on one brand only uses that brand's system.",
  },
];

function Exploration() {
  return (
    <Chapter id="exploration" num={3} title="How we approached it">
      <Copy>
        <p>
          Helix had to meet those three needs without pausing the work already
          in flight. Five choices shaped it.
        </p>
        <NumberedPoints items={APPROACH} stacked />
      </Copy>
      <Visual>
        <Figure label="One brand's foundations in Helix" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution
// ─────────────────────────────────────────────────────────────────────────────
const SKILLS = [
  {
    icon: <Lightbulb size={28} weight="fill" className="text-grape" />,
    title: "Explorations",
    description: "Several variations of a screen, built from the brand's parts, to compare side by side.",
  },
  {
    icon: <PencilRuler size={28} weight="fill" className="text-grape" />,
    title: "Wireframing",
    description: "A quick, low-detail structure to agree the flow before the detail.",
  },
  {
    icon: <Layout size={28} weight="fill" className="text-grape" />,
    title: "Layout",
    description: "Pages laid out on the brand's own grid and spacing.",
  },
  {
    icon: <Cube size={28} weight="fill" className="text-grape" />,
    title: "Build",
    description: "Components and screens in the codebase, ready for a pull request.",
  },
  {
    icon: <ListChecks size={28} weight="fill" className="text-grape" />,
    title: "Audit",
    description: "Checks work against the design system and flags anything off-system.",
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={4} title="A skill for every step">
      <Copy>
        <p>
          Designers call Helix with <code>/helix</code> in Claude Code. It
          isn&apos;t only for the build: it has a skill for each step of the
          work, and every one of them uses the brand&apos;s own system.
        </p>
      </Copy>
      <Visual>
        <CardGrid items={SKILLS} />
        <Figure label="Exploring variations with Helix" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Build  (output)
// ─────────────────────────────────────────────────────────────────────────────
const ROLLOUT = [
  {
    title: "June: first tickets",
    description:
      "Helix was tried on live work first. My first Helix ticket was the Find a Trip test for TCS.",
  },
  {
    title: "July: foundations",
    description:
      "Primitive tokens and foundation components were set up for every brand before anything else.",
  },
  {
    title: "July–August: migration",
    description:
      "I moved three brands' Figma components into Helix in about a month, while running live tickets.",
  },
];

const WORKFLOW = [
  "Brief",
  "Explore in Helix",
  "Pick a direction",
  "Build with DS components",
  "Pull request",
  "Developer review",
  "Merge",
];

function Output() {
  return (
    <Chapter id="output" num={5} title="Moving three brands onto Helix">
      <Copy>
        <p>
          We didn&apos;t pause the work to migrate. Foundations went in first,
          then each brand&apos;s components were rebuilt in Helix alongside the
          tickets we were already running. From August, every new ticket was
          designed in Helix.
        </p>
        <Timeline items={ROLLOUT} />
        <h3>How a ticket ships now</h3>
        <ProcessStrip steps={WORKFLOW} />
      </Copy>
      <Visual>
        <Figure label="A brand's components, migrated into Helix" />
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
      <Exploration />
      <Solution />
      <Output />
      <Outcome />
      <Reflection />
      <NextCase current="/works/helix" />
    </CaseStudyLayout>
  );
}
