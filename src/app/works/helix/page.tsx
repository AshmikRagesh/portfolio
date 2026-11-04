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
  StatTiles,
  ReviewThread,
  type ThreadItem,
  TokenInspector,
  BrandScope,
  NumberedPoints,
  MoreDetail,
  RolloutPhases,
  BeforeAfter,
  ComponentCount,
  Pointers,
  Footnote,
  NextCase,
  Highlight,
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
          designs now <Highlight>ship in about half the time</Highlight>.
        </p>
        <Meta
          role="Design System Migration & Product Design in Helix"
          team="Ashmik Ragesh, Hriday Gami (Design), Travelopia developers (Engineering)"
          timeline={<>June 2026 – present<br />Pilot in June · Rollout from July · In daily use since August</>}
        />
      </Copy>
      <Visual>
        <Figure name="Helix on Claude Code" />
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
          but <Highlight>small details like padding and colour values still slipped
          between the two</Highlight>.
        </p>
        <p>
          Each slip became <Highlight>a bug ticket that only a developer could fix</Highlight>.
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

// What research outside Travelopia found (sources in the footnote; see helix-notes §18)
const EVIDENCE = [
  {
    tag: "CHI 2023",
    stat: "59%",
    label: "of UX designers changed their own designs to match the build once the two drifted apart",
    tone: "key" as const,
  },
  {
    tag: "Telerik 2025",
    stat: "21%",
    label: "of designers and developers say their handoffs go smoothly, with few issues",
  },
  {
    tag: "Figma 2025",
    stat: "32%",
    label: "of product builders say they can rely on AI's output, though 78% say it makes them faster",
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
          enough. <Highlight>The AI had to be limited to it.</Highlight>
        </p>
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>Other teams hit the same wall</h3>
          <p>
            Design drifting from the build isn&apos;t only our problem. In a
            study of UX designers, most had to change their own designs to match
            what was built once the two drifted apart, so <Highlight>the code quietly
            became the source of truth</Highlight>. And while most people find AI
            faster, few can rely on what it makes.
          </p>
        </Copy>
        <Visual>
          <StatTiles items={EVIDENCE} />
        </Visual>
        <Copy>
          <Footnote>
            Sources: Feng, Li and Zhang,{" "}
            <a href="https://arxiv.org/abs/2302.11845">Understanding Collaborative Practices and Tools of Professional UX Practitioners</a>{" "}
            (CHI 2023, 87 of 114 UX practitioners);{" "}
            <a href="https://www.telerik.com/blogs/workflows-age-ai-how-design-development-changed-what-comes-next">Telerik&apos;s 2025 Designer-Developer Collaboration survey</a>{" "}
            (200+ designers and developers);{" "}
            <a href="https://www.figma.com/blog/figma-2025-ai-report-perspectives/">Figma&apos;s 2025 AI report</a>{" "}
            (2,500 product builders).
          </Footnote>
        </Copy>
      </div>
      <div className="cs-sub">
        <Copy>
          <h3>What the fix needed</h3>
        </Copy>
        <Visual>
          <CardGrid items={REQUIREMENTS} />
          <Figure label="Claude Code with the Figma MCP, before Helix" />
        </Visual>
      </div>
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
    body: <>Each brand’s design system lives in Helix, written as the same TypeScript components our developers use. Designers build in it directly, so <Highlight>there is no second copy to drift</Highlight>.</>,
    figure: "One brand's foundations in Helix: colour, type and spacing",
    video: "/videos/helix/solution-1.mp4",
    caption: "Shown here: TCS World Travel's design system in Helix.",
  },
  {
    num: 2,
    title: "Only the system's values",
    body: <>Helix can only use the brand’s own tokens and components, so <Highlight>every value comes out exactly as the system defines it</Highlight>. If a component is missing, we add it to the system first instead of improvising.</>,
    figure: "A component, with the token behind each value",
    visual: <TokenInspector />,
  },
  {
    num: 3,
    title: "One skill, every brand kept separate",
    body: <>A dozen brands share one skill, but <Highlight>each keeps its own system</Highlight>. Work on TCS only uses TCS components and tokens, and work on Quark only uses Quark’s.</>,
    figure: "Each brand's own system, loaded one at a time",
    visual: <BrandScope />,
  },
  {
    num: 4,
    title: "Designers fix it, developers review",
    body: <>When I spot a miss, I fix it in Helix and send a pull request. A developer reviews it and merges it, so <Highlight>a small fix no longer waits in the queue</Highlight>.</>,
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
      {PAIRS.map(({ num, title, body, figure, video, caption, visual }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>
              {num}. {title}
            </h3>
            <p>{body}</p>
          </Copy>
          <Visual>
            {visual ?? <Figure name={figure} alt={video ? `Screen recording: ${figure}` : undefined} video={video} caption={caption} />}
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

// The rollout in phases. `helix` is an illustrative count of each phase's 4 new tickets designed in Helix
const PHASES = [
  {
    when: "Jun – Jul",
    title: "Foundations first",
    detail: "Live work kept going. Every brand's primary tokens and values went into Helix first, and the first few tickets were tried there.",
    helix: 1,
  },
  {
    when: "Jul – Aug",
    title: "Components move across",
    detail: "Existing components moved from Figma between tickets, and new ones were built in Helix as tickets needed them.",
    helix: 2,
  },
  {
    when: "August",
    title: "Every ticket in Helix",
    detail: "From August, every new ticket was designed in Helix. Nothing new was designed in Figma.",
    helix: 3,
  },
  {
    when: "Now",
    title: "Still growing",
    detail: "Quark and TCS took about a month; Kalos is still moving across. New components keep arriving with tickets.",
    helix: 4,
  },
];

function Approach() {
  return (
    <Chapter id="approach" num={4} title="How we rolled it out">
      <Copy>
        <NumberedPoints items={ROLLOUT} stacked />
        <MoreDetail label="The rollout, month by month" className="mt-[32px]">
          <RolloutPhases phases={PHASES} />
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
    text: "Added the Modal component, with its sizes, close button and full-screen layout on mobile. Ready for your review.",
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
          Helix keeps every brand consistent because <Highlight>nothing goes in unchecked</Highlight>.
          Each new component or fix is built by a designer and sent as a pull
          request. The brand&apos;s developers review it against their codebase
          and approve it or ask for changes. Once it&apos;s merged into main,
          every designer on that brand can use it.
        </p>
        <ReviewThread title="feat(modal): add the Modal component" number={482} branch="feat/modal" items={THREAD} steps={CHANGE_PATH} />
      </Copy>
      <div className="cs-sub">
        <Copy>
          <h3>In use on every brand</h3>
          <p>
            Every Travelopia brand&apos;s design system is in Helix, and <Highlight>every
            new ticket is designed in it</Highlight>.{" "}
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
            I moved the existing components for Quark and TCS into Helix <Highlight>in
            about a month, alongside live tickets</Highlight>, and Kalos is still moving
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
            A ticket&apos;s designs used to take <Highlight>one to two weeks to deliver; now
            they take about half that</Highlight>. New work also reuses what&apos;s already
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
const WORKED = [
  {
    lead: "AI needs limits to be useful.",
    text: <>Claude Code on its own drifted from the design system. <Highlight>Holding it to each brand’s own tokens and components</Highlight> is what made the output match.</>,
  },
  {
    lead: "Foundations first kept work moving.",
    text: <>Getting every brand’s tokens right before any components meant <Highlight>live tickets never had to stop for the migration</Highlight>.</>,
  },
  {
    lead: "The fastest fix is the designer's.",
    text: <><Highlight>Fixing a miss in Helix and sending it for review</Highlight> beats filing a bug and waiting for a developer.</>,
  },
];

const NEXT_TIME = [
  {
    lead: "You can only use what the system has.",
    text: <>When something is missing, you add it to the design system instead of drawing around it: <Highlight>slower once, faster every time after</Highlight>.</>,
  },
  {
    lead: "I'd measure from day one.",
    text: <>“About half the time” is my honest estimate. <Highlight>Tracking delivery time and design bugs from the start</Highlight> would make it a measured number.</>,
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
          <h3>The trade-off, and what I&apos;d change</h3>
          <Pointers items={NEXT_TIME} />
        </Copy>
      </div>
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
