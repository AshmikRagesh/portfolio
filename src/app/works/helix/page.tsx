import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { reels } from "@/content/reels";
import { Buildings, Copy as CopyIcon, Hourglass, Robot } from "@phosphor-icons/react/dist/ssr";
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
  ModalTokens,
  NumberedPoints,
  MoreDetail,
  RolloutPhases,
  BeforeAfter,
  ComponentCount,
  Pointers,
  Footnote,
  NextCase,
  Highlight,
  BeforeAfterSlider,
} from "@/components/case-study";

// DRAFT — angle chosen 29 Oct 2026: "build once, not twice", with Ashmik's own path
// (Enchanting in code → Helix pilot → three brands moved) as the evidence. Copy is a
// first pass from Ashmik's answers; see my-portfolio/case-studies/helix-notes.md.
// Figures are placeholders until the recordings are made.

export const metadata: Metadata = {
  title: "Helix on Claude Code · Ashmik Ragesh",
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
          Helix brings our design systems directly into Claude Code, giving
          designers a place to explore ideas, build interfaces and work with
          production-ready components.
        </p>
        <p>
          Instead of designing in Figma and handing everything over for
          development, we&apos;re now building with the same components our
          developers use. The result? Designs that take <Highlight>roughly half
          the time to deliver</Highlight>.
        </p>
        <Meta
          role="Design System Migration & Product Design in Helix"
          team="Ashmik Ragesh, Hriday Gami, Arunava (Design), Travelopia developers (Engineering)"
          timeline={<>June 2026 – present<br />Pilot in June · Rollout from July · In daily use since August</>}
        />
      </Copy>
      <Visual>
        {/* Quark Expedition Card: a recording of the Figma component sheet, then the same card
            built in Helix. Both recordings fill the frame (object-cover) and each has its own controls. */}
        <BeforeAfterSlider
          width={1920}
          height={1088}
          start={24}
          sweepTo={64}
          before={{ src: "/videos/helix/compare-before.mp4", alt: "screen recording: the Quark Expedition Card variants in Figma" }}
          after={{ src: "/videos/helix/compare-after.mp4", alt: "screen recording: the same Expedition Card built in Helix" }}
          labels={{
            before: { title: "Designed in Figma", note: "Rebuilt again in code by developers" },
            after: { title: "Built in Helix", note: "Made with the components developers ship" },
          }}
        />
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
          Every ticket was designed in Figma and handed to developers, who built
          it again in code. Even well-documented files lost small details like
          padding and colour values on the way.
        </p>
        <p>
          Each slip came back as <Highlight>a bug ticket that only a developer
          could fix</Highlight>, even when the fix was small.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Our design systems existed in two places: Figma and code."
          consequence="Keeping them aligned across multiple brands meant more handoffs, more inconsistencies and more dependency on developers for even the smallest fixes."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Discovery
// ─────────────────────────────────────────────────────────────────────────────
// The four problems Discovery turned up, in the order the solutions answer them
const PROBLEMS = [
  {
    icon: <CopyIcon size={28} weight="fill" className="text-grape" />,
    title: "Two copies of every system",
    description: "Each design system lived in Figma and again in code. Even well-documented files lost padding, spacing and colour values on the way.",
  },
  {
    icon: <Robot size={28} weight="fill" className="text-grape" />,
    title: "An AI that improvised",
    description: "With Figma as a reference, Claude Code still drifted from the system, so every build needed corrections.",
  },
  {
    icon: <Buildings size={28} weight="fill" className="text-grape" />,
    title: "Four brands, four systems",
    description: "I design for TCS, Quark, Kalos and Enchanting. Each has its own system, and none of it should leak into another.",
  },
  {
    icon: <Hourglass size={28} weight="fill" className="text-grape" />,
    title: "Fixes waited on developers",
    description: "Every miss went back as a bug ticket and waited for a developer, even when the fix was small.",
  },
];

function Discovery() {
  return (
    <Chapter id="discovery" num={2} title="Claude Code alone wasn't enough">
      <Copy>
        <p>
          Before building Helix, I experimented with using Claude Code and our
          Figma components through the Figma MCP server on Enchanting Travels.
        </p>
        <p>
          It was promising. Screens came together quickly, but the output
          wasn&apos;t consistent with our design system. Spacing drifted,
          components were improvised, and every build needed manual corrections.
        </p>
        <p>
          It became clear that giving AI access to a design system wasn&apos;t
          enough. <Highlight>It needed a way to work within its boundaries.</Highlight>
        </p>
      </Copy>
      <Visual>
        {/* Placeholder until public/images/helix/discovery-recreated.jpg (2000 x 1076) arrives:
            Kalos itinerary Figma frame left, Claude Code + Figma MCP build (no Helix) right,
            2-3 marked spots (spacing drift, improvised component, off-token colour).
            Then swap to <Figure src=... alt=... caption="Recreated on Kalos: ..." />. */}
        <Figure label="Recreated on Kalos: Claude Code with the Figma MCP, before Helix" />
      </Visual>
      <div className="cs-sub">
        <Copy>
          <h3>Four problems to solve</h3>
          <p>
            Between that test and our day-to-day work, four problems stood out.
            Each one became a part of Helix.
          </p>
        </Copy>
        <Visual>
          <CardGrid items={PROBLEMS} />
        </Visual>
      </div>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution  (each problem raised earlier, and how Helix answers it)
// ─────────────────────────────────────────────────────────────────────────────
// The two brands solution 3 shows, one recording each
const BRAND_VIDEOS = [
  {
    id: "quark",
    name: "Quark Expeditions' design system in Helix",
    video: "/videos/helix/solution-3-quark.mp4",
    caption: "Quark Expeditions' design system in Helix.",
  },
  {
    id: "kalos",
    name: "Kalos Golf's design system in Helix",
    video: "/videos/helix/solution-3-kalos.mp4",
    caption: "Kalos Golf's design system in Helix.",
  },
];

const PAIRS = [
  {
    num: 1,
    title: "One design system per brand, in code",
    body: <>Each brand’s design system now lives directly in Helix as reusable TypeScript components. Designers work with the same components developers use, <Highlight>eliminating the need to maintain two separate versions of the system</Highlight>.</>,
    figure: "One brand's foundations in Helix: colour, type and spacing",
    video: "/videos/helix/solution-1.mp4",
    caption: "Quark Expeditions' design system in Helix.",
  },
  {
    num: 2,
    title: "Only the system's values",
    body: <>Helix is restricted to each brand’s own tokens and components. That means <Highlight>no made-up colours, inconsistent spacing or improvised components</Highlight>. If something is missing, we add it to the system rather than work around it.</>,
    figure: "A component, with the token behind each value",
    visual: <ModalTokens />,
  },
  {
    num: 3,
    title: "One skill, every brand kept separate",
    body: <>A dozen brands share one skill, but <Highlight>each keeps its own system</Highlight>. Work on Quark only uses Quark components and tokens, and work on Kalos only uses Kalos’s.</>,
    figure: "Each brand's own design system in Helix",
    visual: (
      <div className="flex flex-col gap-[24px]">
        {BRAND_VIDEOS.map((b) => (
          <Figure
            key={b.id}
            name={b.name}
            alt={`Screen recording: ${b.name}`}
            video={b.video}
            caption={b.caption}
          />
        ))}
      </div>
    ),
  },
  {
    num: 4,
    title: "Designers fix it, developers review",
    body: <>When I spot a miss, I fix it in Helix and send a pull request. A developer reviews it and merges it, so <Highlight>a small fix no longer waits in the queue</Highlight>.</>,
    figure: "A pull request for a design fix, approved by a developer",
    src: "/images/helix/solution-4.webp",
    caption: "The review before a Kalos pull request, merged after approval.",
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
      {PAIRS.map(({ num, title, body, figure, video, src, caption, visual }) => (
        <div key={num} className="cs-sub">
          <Copy>
            <h3>
              {num}. {title}
            </h3>
            <p>{body}</p>
          </Copy>
          <Visual>
            {visual ?? <Figure name={figure} alt={video ? `Screen recording: ${figure}` : src ? figure : undefined} video={video} src={src} caption={caption} />}
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
    description:
      "We started with every brand's primary tokens and values, not its components. Once those were exactly right, anything built on top of them would be too.",
  },
  {
    title: "Existing components when there was time",
    description:
      "Rather than block out time for a migration, we moved existing components from Figma between tickets. Quark and TCS took about a month; Kalos is still moving across.",
  },
  {
    title: "New components as tickets needed them",
    description:
      "If a ticket needed something new, we didn't draw it in Figma first. We built it in Helix on the foundations, sent it to a developer as a pull request, and merged it once approved.",
  },
  {
    title: "Every ticket in Helix",
    description:
      "By August the system could carry new work on its own, so we stopped designing in Figma. Every new ticket since has started in Helix.",
  },
];

// The rollout in phases. `helix` is an illustrative count of each phase's 4 new tickets designed in Helix
const PHASES = [
  {
    when: "Jun – Jul",
    title: "Foundations first",
    detail: "Most new tickets still start in Figma.",
    helix: 1,
  },
  {
    when: "Jul – Aug",
    title: "Components move across",
    detail: "More tickets start in Helix as components arrive.",
    helix: 2,
  },
  {
    when: "August",
    title: "Every ticket in Helix",
    detail: "Figma drops out for new tickets.",
    helix: 3,
  },
  {
    when: "Now",
    title: "Still growing",
    detail: "The system grows with each ticket.",
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
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Where it stands  (outcome)
// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER counts for TCS and Kalos (and so the total) until Ashmik sends the real
// numbers. Counted from his recordings: Quark 51+, TCS 25, Kalos 16 (92 in all).
const COMPONENTS = [
  { name: "Quark", count: 51, plus: true, note: "migrated" },
  { name: "TCS", count: 36, note: "migrated" },
  { name: "Kalos", count: 25, note: "still migrating" },
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
            We moved the existing components for Quark and TCS into Helix <Highlight>in
            about a month, alongside live tickets</Highlight>, and Kalos is still moving
            across. When a ticket needed something new, we built it in
            Helix too.
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
            Previously, a design ticket could take one to two weeks to move from
            exploration to developer-ready handoff. With Helix, <Highlight>that work
            now takes roughly half the time</Highlight>.
          </p>
          <p>
            Designers can build directly with existing production components,
            reuse patterns across screens and make small corrections without
            waiting for a separate development cycle.
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
    lead: "AI became genuinely useful once we gave it clear boundaries.",
    text: <>The design system wasn’t just a reference anymore; <Highlight>it became the foundation for everything we built</Highlight>.</>,
  },
  {
    lead: "Migrating incrementally",
    text: <>meant <Highlight>we could keep shipping</Highlight> while improving the system underneath.</>,
  },
  {
    lead: "Giving designers ownership of implementation",
    text: <><Highlight>reduced the back-and-forth</Highlight> for smaller changes.</>,
  },
];

const NEXT_TIME = [
  {
    lead: "Establish measurement from day one.",
    text: <>I estimated the time saved across my tickets, but <Highlight>tracking delivery time and design bugs from the beginning</Highlight> would have given us a stronger baseline.</>,
  },
  {
    lead: "Plan for missing components.",
    text: <>Restricting output to the system improves consistency, but it also means <Highlight>the system needs to evolve alongside the work</Highlight>.</>,
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
          <h3>What I&apos;d do differently</h3>
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
      <Hero title="Shipping designs in half the time with Helix on Claude Code" date="2026" image="/images/helix/cover.webp" />
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
