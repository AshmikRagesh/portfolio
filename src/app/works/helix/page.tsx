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
  ReviewThread,
  type ThreadItem,
  NumberedPoints,
  MoreDetail,
  RolloutTracks,
  BeforeAfter,
  ComponentCount,
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
  { id: "solution",    label: "Solution"        },
  { id: "approach",    label: "Approaches"      },
  { id: "output",      label: "Governance"      },
  { id: "outcome",     label: "Impact"          },
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
    title: "One design system per brand, in code",
    body: "Each brand's design system lives in Helix, written as the same TypeScript components our developers use. Designers build in it directly, so there is no second copy to drift.",
    figure: "One brand's foundations in Helix: colour, type and spacing",
  },
  {
    num: 2,
    title: "Only the system's values",
    body: "Helix can only use the brand's own tokens and components, so every value comes out exactly as the system defines it. If a component is missing, we add it to the system first instead of improvising.",
    figure: "A component, with the token behind each value",
  },
  {
    num: 3,
    title: "One skill, every brand kept separate",
    body: "A dozen brands share one skill, but each keeps its own system. Work on TCS only uses TCS components and tokens, and work on Quark only uses Quark's.",
    figure: "The same card, built for TCS, Quark and Kalos",
  },
  {
    num: 4,
    title: "Designers fix it, developers review",
    body: "When I spot a miss, I fix it in Helix and send a pull request. A developer reviews it and merges it, so a small fix no longer waits in the queue.",
    figure: "A pull request for a design fix, approved by a developer",
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={3} title="How Helix solves it">
      <Copy>
        <p>
          Each problem from earlier has its own answer in Helix.
        </p>
      </Copy>
      {PAIRS.map(({ num, title, body, figure }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>
              {num}. {title}
            </h3>
            <p>{body}</p>
          </Copy>
          <Visual>
            <Figure name={figure} />
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Approach  (how it was rolled out without pausing live work)
// ─────────────────────────────────────────────────────────────────────────────
const ROLLOUT = [
  {
    title: "Live work never stopped",
    description:
      "Tickets kept coming in, so we couldn't pause to migrate every component from Figma at once. Helix went in alongside the live work.",
  },
  {
    title: "Foundations first, for every brand",
    description: "Every brand's primary tokens and values went in first, exactly right, before any component.",
  },
  {
    title: "Existing components when there was time",
    description: "Components we already had moved from Figma into Helix between tickets. Quark and TCS took about a month; Kalos is still moving across.",
  },
  {
    title: "New components as tickets needed them",
    description:
      "When a ticket needed something new, we built it on the foundations, shared it with a developer for review as a pull request, and merged it to main.",
  },
  {
    title: "Every ticket in Helix",
    description: "From August, nothing new was designed in Figma. Today every brand's design system is in good shape.",
  },
];

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct"];

// Today, as a position on that axis (30 October)
const NOW = 4 + 29 / 31;

const LANES = [
  {
    name: "Foundations",
    segments: [
      { start: 1, end: 2, tone: "dark" as const, label: "Every brand", detail: "Every brand's primary tokens and values went in first, exactly right." },
    ],
  },
  {
    name: "Existing components",
    segments: [
      { start: 1.5, end: 3, tone: "soft" as const, label: "Between tickets", detail: "Components we already had moved from Figma into Helix between tickets. Quark and TCS took about a month; Kalos is still moving across." },
    ],
  },
  {
    name: "New components",
    segments: [
      { start: 1.5, end: 4, tone: "grape" as const, open: true, label: "As tickets needed them", detail: "Built on the foundations, reviewed by a developer as a pull request, and merged to main." },
    ],
  },
  {
    name: "Tickets in Helix",
    segments: [
      { start: 0, end: 2, tone: "pale" as const, label: "The first few", detail: "The first tickets were designed in Helix while the rest still used Figma." },
      { start: 2, end: 4, tone: "grape" as const, open: true, label: "Every ticket", detail: "Every new ticket was designed in Helix, and nothing new in Figma." },
    ],
  },
];

function Approach() {
  return (
    <Chapter id="approach" num={4} title="How we rolled it out">
      <Copy>
        <NumberedPoints items={ROLLOUT} stacked />
        <MoreDetail label="The rollout, month by month" className="mt-[32px]">
          <RolloutTracks
            months={MONTHS}
            lanes={LANES}
            milestone={{ at: 2, label: "August: every new ticket designed in Helix" }}
            now={{ at: NOW, label: "Now: still running, on every brand" }}
          />
        </MoreDetail>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Who keeps it right  (output: governance and adoption)
// ─────────────────────────────────────────────────────────────────────────────
const THREAD: ThreadItem[] = [
  {
    kind: "comment",
    who: "designer",
    name: "Designer",
    verb: "commented",
    text: "Built the new component in Helix, using the brand's own tokens and components. Ready for review.",
  },
  {
    kind: "comment",
    who: "developer",
    name: "Developer",
    verb: "commented",
    text: "Checked it against our codebase. Looks good to me 👍",
  },
  { kind: "event", icon: "approved", who: "developer", name: "Developer", text: "approved these changes" },
  { kind: "event", icon: "merged", who: "designer", name: "Designer", text: "merged commit 4f2a9c1 into main" },
];

const CHANGE_PATH = [
  { title: "Needed", text: "A ticket calls for a new component or a fix" },
  { title: "Built", text: "Made in Helix and sent as a pull request" },
  { title: "Reviewed", text: "Developers approve it or ask for changes" },
  { title: "Merged", text: "Ready for every designer on that brand" },
];

function Output() {
  return (
    <Chapter id="output" num={5} title="Who keeps it right">
      <Copy>
        <p>
          Helix keeps every brand consistent because nothing goes in unchecked.
          Each new component or fix is built by a designer and sent as a pull
          request. The brand&apos;s developers review it against their codebase
          and approve it or ask for changes. Once it&apos;s merged into main,
          every designer on that brand can use it.
        </p>
        <ReviewThread title="feat: add a new component to the design system" number={482} branch="feat/new-component" items={THREAD} steps={CHANGE_PATH} />
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>In use on every brand</h3>
          <p>
            Every Travelopia brand&apos;s design system is in Helix, and every
            new ticket is designed in it.{" "}
            <a href="/works/tcs-find-a-trip">Find a Trip</a> for TCS was one of
            the first: both test variants were explored, built and reviewed in
            Helix, then merged.
          </p>
        </Copy>
      </div>
      <Visual>
        <Figure label="Find a Trip, explored and built in Helix" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Where it stands  (outcome)
// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER counts for TCS and Kalos (and so the total) until Ashmik sends the real
// numbers. Counted from his recordings: Quark 51+, TCS 25, Kalos 16 (92 in all).
const COMPONENTS = [
  { name: "Quark", count: 51, plus: true },
  { name: "TCS", count: 36 },
  { name: "Kalos", count: 25, note: "in progress" },
];

const DELIVERY = [
  { label: "Before Helix", value: "1–2 weeks", share: 1, tone: "before" as const },
  { label: "With Helix", value: "About half", share: 0.5, tone: "after" as const },
];

function Outcome() {
  return (
    <Chapter id="outcome" num={6} title="What changed">
      <Copy>
        <p>
          Every Travelopia brand now has its design system in Helix. I design
          for four of them: TCS World Travel, Quark Expeditions, Kalos Golf and
          Enchanting Travels.
        </p>
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>110+ components, in code</h3>
          <p>
            I moved the existing components for Quark and TCS into Helix in
            about a month, alongside live tickets, and Kalos is still moving
            across. When a ticket needed something new, Hriday and I built it
            in Helix too.
          </p>
          <ComponentCount
            total={{ count: 110, plus: true }}
            label="components in Helix across three brands"
            parts={COMPONENTS}
          />
        </Copy>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>Designs delivered in about half the time</h3>
          <p>
            A ticket&apos;s designs used to take one to two weeks to deliver; now
            they take about half that. New work also reuses what&apos;s already
            there: the country and state dropdowns for the TCS forms reused the
            existing combobox component instead of a new design.
          </p>
          <BeforeAfter rows={DELIVERY} />
          <Footnote>
            Component counts are from each brand&apos;s Helix in October 2026.
            Delivery time is my own estimate across my tickets, not a tracked
            measure. Next, we&apos;d measure design bugs per release and review
            time per pull request.
          </Footnote>
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
