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
  NextCase,
} from "@/components/case-study";

// DRAFT — Helix set up on the case study template (the same chapters as TCS Find a Trip).
// The copy is a first pass from what Ashmik described: a design-system skill for Claude
// Code, built and maintained by a developer, that only uses the TCS design system's
// components and tokens and writes code the way the developers do. Facts still to add are
// marked "To be added"; figures are placeholders.

export const metadata: Metadata = {
  title: "Helix · Ashmik Ragesh",
  description:
    "Helix is a design-system skill for Claude Code that lets designers build straight from the TCS components and tokens, so what we design is what developers ship.",
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
          Helix is a skill for Claude Code that holds the TCS design system as
          code. Designers use it to explore, lay out and build screens using
          only the system&apos;s own components and tokens, so what we design is
          what developers ship.
        </p>
        <Meta role="To be added" team="To be added" timeline="To be added" />
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
    <Chapter id="the-problem" num={1} title="Designs and code drifted apart">
      <Copy>
        <p>
          We designed in Figma and developers rebuilt each screen in code. Every
          handoff was a translation, and details got lost along the way.
        </p>
      </Copy>
      <Visual>
        <ProblemStatement
          situation="Designs lived in one tool and the design system lived in the codebase."
          consequence="Every handoff meant rebuilding screens, and mismatches surfaced late."
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
    <Chapter id="discovery" num={2} title="What we knew going in">
      <Copy>
        <p>To be added: what the team learned before building Helix.</p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Exploration
// ─────────────────────────────────────────────────────────────────────────────
function Exploration() {
  return (
    <Chapter id="exploration" num={3} title="What we explored">
      <Copy>
        <p>To be added: the approaches considered before Helix took its shape.</p>
      </Copy>
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
          can only reach for the design system&apos;s components, tokens and
          primitives. Beyond building screens, it helps audit the system,
          brainstorm, explore variations and create layouts.
        </p>
      </Copy>
      <Visual>
        <Figure label="Building a screen with Helix" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Build  (output)
// ─────────────────────────────────────────────────────────────────────────────
function Output() {
  return (
    <Chapter id="output" num={5} title="How work ships with Helix">
      <Copy>
        <p>To be added: how a design goes from Helix to the main codebase.</p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Where it stands  (outcome)
// ─────────────────────────────────────────────────────────────────────────────
function Outcome() {
  return (
    <Chapter id="outcome" num={6} title="Where it stands">
      <Copy>
        <p>To be added: where Helix is used today and what it has changed.</p>
      </Copy>
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
        <p>To be added.</p>
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
      <Hero title="One design system, built straight into the code" date="2026" />
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
