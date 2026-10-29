import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import { reels } from "@/content/reels";
import {
  Hero,
  Chapter,
  Copy,
  Meta,
  Visual,
  Figure,
  ProblemStatement,
  OptionCard,
  ProsCons,
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
  { id: "exploration", label: "Exploration"     },
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
          Helix is a skill for Claude Code that holds the design system of every
          Travelopia brand as code. Designers use it to explore, lay out and
          build screens from the brand&apos;s own components and tokens, so a
          component is built once, in code, instead of once in Figma and again
          by a developer.
        </p>
        <Meta
          role="Product Designer. One of the first designers on Helix; moved three brands onto it"
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
    <Chapter id="the-problem" num={1} title="Every component was built twice">
      <Copy>
        <p>
          Figma did its job well. The waste was in what came after it. A
          designer drew each component in Figma, and then a developer built it
          again in code. The handoff was a rebuild, not a review.
        </p>
        <p>
          Delivering the designs for a ticket took one to two weeks, and the
          same work was being done twice, by two people, in two tools.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Each component was designed in Figma, then rebuilt in code by a developer."
          consequence="A ticket's designs took one to two weeks, and the same work was done twice."
        />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Discovery
// ─────────────────────────────────────────────────────────────────────────────
function Discovery() {
  return (
    <Chapter id="discovery" num={2} title="I was already designing in code">
      <Copy>
        <p>
          Before Helix, I was already working this way on Enchanting Travels. I
          created a branch, made the changes in the codebase, raised a pull
          request, and once a developer approved it, merged it to main.
        </p>
        <p>
          It worked. Developers reviewed real code instead of rebuilding a
          drawing. But it depended on me knowing the codebase, and nothing
          stopped a value that wasn&apos;t in the design system from slipping
          in. To work for every designer and every brand, it needed guardrails.
        </p>
      </Copy>
      <Visual>
        <Figure label="A pull request from the Enchanting Travels workflow" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Exploration
// ─────────────────────────────────────────────────────────────────────────────
const APPROACHES = [
  {
    label: "Way 1",
    title: "Design in Figma, rebuild in code",
    worked: ["Familiar to every designer", "Good for fast visual exploration"],
    didntWork: [
      "Every component built twice",
      "Developers translate specs by hand",
    ],
  },
  {
    label: "Way 2",
    title: "Designers work in the codebase directly",
    worked: ["Built once, reviewed as code", "Developers review instead of rebuild"],
    didntWork: [
      "Needs each designer to know the codebase",
      "Nothing keeps the work inside the design system",
    ],
  },
  {
    label: "Way 3",
    title: "Helix: a design-system skill on Claude Code",
    chosen: true,
    worked: [
      "Built once, in the developers' own language",
      "Only the brand's components and tokens can be used",
      "Works the same way for every designer and brand",
    ],
    didntWork: ["Tokens and foundations had to be set up first"],
  },
];

function Exploration() {
  return (
    <Chapter id="exploration" num={3} title="Three ways to get a design into code">
      <Copy>
        <p>
          By then we had seen two ways of working side by side: the Figma
          handoff most of the team used, and the in-code workflow I used on
          Enchanting. Helix took the best of the second and added the guardrails
          it lacked.
        </p>
      </Copy>
      {APPROACHES.map(({ label, title, chosen, worked, didntWork }) => (
        <div key={label} className="cs-sub">
          <Visual>
            <OptionCard
              label={label}
              title={title}
              shipped={chosen}
              stamp="In use"
              image={`${label} — ${title}`}
            >
              <ProsCons pros={worked} cons={didntWork} />
            </OptionCard>
          </Visual>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution
// ─────────────────────────────────────────────────────────────────────────────
function Solution() {
  return (
    <Chapter id="solution" num={4} title="How Helix works">
      <Copy>
        <p>
          A developer built Helix and keeps it up to date, so the code it writes
          matches the codebase and language our developers use. Whoever uses it
          can only reach for the brand&apos;s components, tokens and primitives,
          so anything new follows that brand&apos;s design system.
        </p>
        <p>
          It covers the whole design process, not just the build. It has skills
          for exploring variations, wireframing, laying out pages and auditing
          the design system.
        </p>
        <p>
          For developers, the change is that a pull request arrives as working
          code made from components they already know. They review it and fix
          it where needed, instead of measuring a file and starting again.
        </p>
      </Copy>
      <Visual>
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
