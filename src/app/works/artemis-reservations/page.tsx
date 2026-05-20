import type { Metadata } from "next";
import Image from "next/image";
import { Save, CircleX, BellOff, Workflow, Check } from "lucide-react";
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";

export const metadata: Metadata = {
  title: "Artemis Reservations · Ashmik Ragesh",
  description:
    "Streamlining the Reservations Module in Artemis 3.0 — reducing booking edit time by ~25% and eliminating manual saves.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",           label: "Overview"             },
  { id: "my-role",            label: "At a Glance"          },
  { id: "background",         label: "Background"           },
  { id: "research",           label: "Research"             },
  { id: "challenges",         label: "Insights"             },
  { id: "the-problem",        label: "The Problem"          },
  { id: "process",            label: "Process"              },
  { id: "solution",           label: "Solution"             },
  { id: "impact",             label: "Impact"               },
  { id: "reflection",         label: "Reflection"           },
];

// TODO: Replace with permanent assets — Figma URLs expire ~7 days from 2026-04-17
// Solution section images (all placeholders in Figma; swap when real assets are ready)
const SOLUTION_IMAGE =
  "https://www.figma.com/api/mcp/asset/b7bf0626-b02e-4cae-8342-73ee66a4ef5a";

// Process section image placeholder (used by DESIGN_DECISIONS option cards).
// Currently unused at render time — OptionCard shows ImagePlaceholder instead.
// Keep this constant for when real exploration screenshots replace placeholders.
const PROCESS_IMAGE_3 =
  "https://www.figma.com/api/mcp/asset/bed86782-e0f9-4923-be8f-de03dab9c8e3";

const OVERVIEW_IMAGE =
  "https://www.figma.com/api/mcp/asset/bd222c70-fe17-447e-bf69-a7de8dca1c4c";
const BACKGROUND_IMAGE =
  "https://www.figma.com/api/mcp/asset/e06b7f2a-e27a-4f23-b0a6-87c3cd31de9e";
const THE_PROBLEM_IMAGE =
  "https://www.figma.com/api/mcp/asset/15b081d5-d594-4d46-9077-b5aed89ad07f";

// ─────────────────────────────────────────────────────────────────────────────
// Shared class strings (typography scale: Scale B / Expressive)
// ─────────────────────────────────────────────────────────────────────────────
const H1_CLASS    = "font-heading font-normal text-h1 md:text-h1-md lg:text-h1-lg text-heading";
const H2_CLASS    = "font-heading font-normal text-h2 md:text-h2-md lg:text-h2-lg text-heading";
const H3_CLASS    = "font-heading font-normal text-h3 md:text-h3-md lg:text-h3-lg text-heading";
const H4_CLASS    = "font-heading font-normal text-h4 md:text-h4-md lg:text-h4-lg text-heading";
const LEAD_CLASS  = "font-body font-normal text-lead md:text-lead-md lg:text-lead-lg text-muted";
const BODY_CLASS  = "font-body font-normal text-body md:text-body-md lg:text-body-lg text-muted";
const EYEBROW_CLASS = "font-brand text-[13px] font-medium uppercase tracking-[1.5px] text-muted";

// Numbered H3 (Process/Solution step titles). Pass num + title.
function NumberedH3({ num, title }: { num: number; title: string }) {
  return (
    <h3 className={`${H3_CLASS} flex gap-[12px]`}>
      <span aria-hidden="true">{num}.</span>
      <span>{title}</span>
    </h3>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview  (text + contained image)
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <section
      id="overview"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full">
        {/* Date annotation */}
        <div className="flex flex-col gap-5">
          <div className="-rotate-3 w-fit">
            <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.15px] text-grape whitespace-nowrap">
              {"< 08/11/2024 >"}
            </span>
          </div>

          {/* Title + subtitle */}
          <div className="flex flex-col gap-5">
            <h1 className={H1_CLASS}>
              Giving the Reservations team back their time in Artemis 3.0
            </h1>
            <p className={LEAD_CLASS}>
              Redesigned the Reservations Bookings flow in Artemis 3.0 —
              cutting task time by 35% and eliminating data-loss incidents for
              the Reservations team. Replaced manual saves, ambiguous statuses,
              and repetitive bulk-update flows with auto-save, in-app alerts,
              and a streamlined modal-based workflow.
            </p>
          </div>
        </div>

        {/* Overview image — contained, not full-bleed */}
        <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
          <Image
            src={OVERVIEW_IMAGE}
            alt="Artemis 3.0 Reservations Module — overview screenshot"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: At a Glance  (4-column meta strip: Role · Timeline · Team · Tools)
// ─────────────────────────────────────────────────────────────────────────────
function MyRole() {
  const columns = [
    {
      heading: "My Role",
      content: (
        <>
          Sole designer. Owned the full lifecycle — research, IA, flows,
          v0 prototype, high-fi designs, and engineering handoff.
        </>
      ),
    },
    {
      heading: "Timeline",
      content: (
        <>
          4 weeks
          <br />
          Launched Aug 2024
        </>
      ),
    },
    {
      heading: "Tools",
      content: (
        <>
          Figma
          <br />
          FigJam
          <br />
          Vercel V0
          <br />
          Slack
          <br />
          Loom
        </>
      ),
    },
    {
      heading: "Team",
      content: (
        <>
          Srishti Mahajan (PM)
          <br />
          Unnikrishnan Manikoth (Design Manager)
          <br />
          Muzamil (Engineering)
          <br />
          Niraj (Engineering)
        </>
      ),
    },
  ];

  return (
    <section
      id="my-role"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 w-full md:gap-x-[48px] lg:grid-cols-4 lg:gap-x-[48px]">
        {columns.map(({ heading, content }) => (
          <div key={heading} className="flex flex-col gap-3">
            <h4 className={H4_CLASS}>{heading}</h4>
            <p className={BODY_CLASS}>{content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Background
// ─────────────────────────────────────────────────────────────────────────────
function Background() {
  return (
    <section
      id="background"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        {/* Text block */}
        <div className="flex flex-col gap-5 w-full md:gap-[24px]">
          {/* Tag + heading — 12px gap between them */}
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< background >"}
              </span>
            </div>

            <h2 className={H2_CLASS}>Reservations Module: Core of Artemis</h2>
          </div>

          <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
            <p>
              Artemis is Enchanting Travels&apos; internal platform for
              planning and executing custom trips. Within it, the
              Reservations module is the backend hub where 100+ Reservations
              Consultants (ResCos) confirm vendor bookings, manage flight
              and cancellation changes, and keep trip-critical logistics on
              track.
            </p>
            <p>
              By late 2023, Artemis was being migrated from 2.0 to 3.0 — and
              the Reservations module, largely untouched in years, became
              the natural first place to rethink the experience from the
              ground up.
            </p>
          </div>
        </div>

        {/* Full-width image */}
        <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
          <Image
            src={BACKGROUND_IMAGE}
            alt="Artemis Reservations — background context image"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Research  (stakeholder interview + ResCo interviews + quotes)
// ─────────────────────────────────────────────────────────────────────────────
// Composite ResCo quotes drawn from recurring themes in interviews + tickets.
// Disclosed below the quote stack via the composite disclaimer.
const RESEARCH_QUOTES = [
  {
    text:
      "I lost an entire morning of bookings on Tuesday because I forgot to hit save before switching trips. It was the third time that month.",
    attribution: "— ResCo, Bengaluru office",
  },
  {
    text:
      "By the time I figure out which booking the vendor is asking about, I've already opened five tabs and three email threads.",
    attribution: "— ResCo, Delhi office",
  },
];

function Research() {
  return (
    <section
      id="research"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        {/* Tag + heading + intro */}
        <div className="flex flex-col gap-5 w-full md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< research >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>
              Listening to the people who live in Artemis daily
            </h2>
          </div>

          <p className={LEAD_CLASS}>
            Before sketching a single screen, I spent the first week
            understanding how Reservations actually worked — and where it
            broke. Research had two threads: inward to the PM, and outward
            to the ResCos themselves.
          </p>
        </div>

        {/* Sub-section: Stakeholder Interview */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <h3 className={H3_CLASS}>Stakeholder Interview</h3>
          <p className={LEAD_CLASS}>
            A one-on-one with Srishti (PM) framed the brief. Three things
            stuck:
          </p>
          <ul className={`list-disc ${LEAD_CLASS} flex flex-col gap-2`}>
            <li className="ms-[27px]">
              The module hadn&apos;t been meaningfully touched in years — users
              had built private workarounds.
            </li>
            <li className="ms-[27px]">
              Data-loss incidents had been escalating into leadership
              channels.
            </li>
            <li className="ms-[27px]">
              The 2.0 → 3.0 migration window meant ~4 weeks of design time.
              No second pass.
            </li>
          </ul>
        </div>

        {/* Sub-section: ResCo Interviews */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <h3 className={H3_CLASS}>ResCo Interviews</h3>
          <p className={LEAD_CLASS}>
            I ran 6 contextual interviews with ResCos across regional
            offices, walking through a typical Tuesday with each. Alongside,
            I reviewed ~30 recent support tickets and internal Slack threads
            about lost-work incidents. The themes were unambiguous.
          </p>

          {/* Quote stack */}
          <div className="flex flex-col gap-5 md:gap-6 mt-2">
            {RESEARCH_QUOTES.map(({ text, attribution }) => (
              <blockquote
                key={attribution + text.slice(0, 20)}
                className="border-l-2 border-grape pl-5 md:pl-6 flex flex-col gap-2"
              >
                <p className="font-body font-normal text-lead md:text-lead-md lg:text-lead-lg text-heading">
                  &ldquo;{text}&rdquo;
                </p>
                <p className="font-body text-body md:text-body-md lg:text-body-lg text-muted">
                  {attribution}
                </p>
              </blockquote>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The Problem  (synthesis of research insights into a unified problem)
// ─────────────────────────────────────────────────────────────────────────────
function TheProblem() {
  return (
    <section
      id="the-problem"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        {/* Text block */}
        <div className="flex flex-col gap-5 w-full md:gap-[24px]">
          {/* Tag + heading */}
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< The Problem >"}
              </span>
            </div>

            <h2 className={H2_CLASS}>A System That Relied Too Much on Manual Effort</h2>
          </div>

          {/* Synthesis body (no longer restating findings — Insights does that) */}
          <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
            <p>
              Five recurring themes from research mapped to one root cause:
              Artemis Reservations had been built as a <em>user-driven</em>{" "}
              system. Every safety net — saves, status checks, notifications,
              confirmations — depended on a human remembering to perform it.
              As scale grew, vigilance fatigue grew with it.
            </p>
            <p>
              The result wasn&apos;t a single broken feature. It was a system
              that worked only when its users were sharp, well-rested, and
              uninterrupted — a fragile baseline for a team running 100+ live
              trips a day.
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
          <Image
            src={THE_PROBLEM_IMAGE}
            alt="Artemis Reservations — the problem illustration"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Problem Statement callout — original two-tone styling preserved */}
        <div className="flex flex-col gap-5 rounded-[8px] border-[1.5px] border-heading bg-[rgba(137,91,231,0.05)] p-[24px] md:gap-[20px]">
          <div className="flex items-center gap-2 w-full">
            <SparkleAiIcon size={26} className="shrink-0 text-heading" />
            <h3 className={H3_CLASS}>The Problem Statement</h3>
          </div>

          <p className="font-body font-normal text-lead md:text-lead-md lg:text-lead-lg">
            <span className="text-secondary">
              Artemis Reservations depended on manual coordination for
              high-stakes booking workflows.{" "}
            </span>
            <span className="text-heading underline decoration-solid [text-decoration-skip-ink:none]">
              As operational complexity increased, this reliance on user
              intervention created inefficiencies, miscommunication, and
              avoidable risk. The system needed to shift from user-driven
              execution to system-driven reliability.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Challenges
// ─────────────────────────────────────────────────────────────────────────────
const CHALLENGE_CARDS = [
  [
    {
      icon: <Save size={26} className="text-grape" strokeWidth={2} />,
      title: "Manual Saves",
      description:
        "Edits weren't auto-saved, often leading to lost work and wasted time when consultants switched between screens.",
    },
    {
      icon: (
        <svg
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-grape shrink-0"
          width={26}
          height={26}
          aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="4.5" fill="currentColor" />
          <circle cx="19.5" cy="6.5" r="4.5" fill="currentColor" />
          <circle cx="6.5" cy="19.5" r="4.5" fill="currentColor" />
          <circle cx="19.5" cy="19.5" r="4.5" fill="currentColor" />
        </svg>
      ),
      title: "Cluttered actions",
      description:
        "Outdated and overlapping UI elements made navigation unintuitive and slowed down task completion.",
    },
    {
      icon: <CircleX size={26} className="text-grape" strokeWidth={2} />,
      title: "Unclear statuses",
      description:
        "Ambiguous booking and request statuses caused delays in confirmations and extra back-and-forth between teams.",
    },
  ],
  [
    {
      icon: <BellOff size={26} className="text-grape" strokeWidth={2} />,
      title: "No notifications",
      description:
        "Important updates—like vendor confirmations or cancellations—were missed due to the lack of real-time alerts.",
    },
    {
      icon: <Workflow size={26} className="text-grape" strokeWidth={2} />,
      title: "Inefficient workflows",
      description:
        "Flight details and cancellation flows involved too many steps, creating inefficiencies in vendor coordination.",
    },
  ],
];

function Challenges() {
  return (
    <section
      id="challenges"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        {/* Header block */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< research insights >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>Where the System Fell Short</h2>
          </div>
          <p className={LEAD_CLASS}>
            Across interviews with ResCos, support ticket reviews, and Slack
            thread analysis, five themes surfaced repeatedly. Each became a
            target for the redesign.
          </p>
        </div>

        {/* Challenge cards */}
        <div className="flex flex-col gap-[16px] md:gap-[24px]">
          {CHALLENGE_CARDS.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={`grid gap-[16px] md:gap-[24px] ${
                row.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {row.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col gap-[16px] bg-[#f8f8f8] rounded-[16px] p-[20px]"
                >
                  <div className="shrink-0">{icon}</div>
                  <div className="flex flex-col gap-3">
                    <h4 className={H4_CLASS}>{title}</h4>
                    <p className={BODY_CLASS}>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Process  (3 narrative beats: direction → v0 prototype → iteration)
// ─────────────────────────────────────────────────────────────────────────────
const INSIGHT_DIRECTION_MAP = [
  {
    insight: "Manual saves",
    direction: "auto-save with visible status indicator",
  },
  {
    insight: "Cluttered actions",
    direction: "progressive disclosure, hierarchical layout",
  },
  {
    insight: "Unclear statuses",
    direction: "color-coded status taxonomy",
  },
  {
    insight: "Missing notifications",
    direction: "activity feed + in-app alerts",
  },
  {
    insight: "Repetitive bulk work",
    direction: "multi-select with a bulk update modal",
  },
];

// Design decisions explored during iteration. Each has 3 options + a
// prototype thumbnail. Non-shipped options carry pros/cons; the shipped
// option carries `reasons` ("Why this solution?" — Jhanvi-style).
type DesignOption = {
  label: string;       // "Option A"
  title: string;       // "Save on every keystroke"
  image: string;       // prototype thumbnail (placeholder for now)
  pros?: string[];     // non-shipped options
  cons?: string[];     // non-shipped options
  reasons?: string[];  // shipped option only — positive reasons it won
  shipped?: boolean;
};

type DesignDecision = {
  title: string;       // "Save behavior"
  intro: string;
  options: DesignOption[];
};

// TODO: Swap per-option image placeholders with real exploration screenshots
// once Figma assets are ready.
const DESIGN_DECISIONS: DesignDecision[] = [
  {
    title: "Save behavior",
    intro:
      "Auto-save is famously hard to get right. We tested three approaches before landing on a model that disappeared into the background.",
    options: [
      {
        label: "Option A",
        title: "Save on every keystroke",
        image: PROCESS_IMAGE_3,
        pros: ["Maximum data safety; never lose work"],
        cons: [
          "Flashing “Saving…” indicator broadcast anxiety",
          "Testers asked “did it save?” more than with manual save",
        ],
      },
      {
        label: "Option B",
        title: "Save on blur (when section completes)",
        image: PROCESS_IMAGE_3,
        pros: ["Quieter; matches the “I’m done with this part” cue"],
        cons: [
          "Tab-switching without focus shift lost data",
          "Long forms felt “unsaved” for minutes at a time",
        ],
      },
      {
        label: "Option C",
        title:
          "Save on meaningful change + “Saved 12s ago” timestamp + 30s undo",
        image: PROCESS_IMAGE_3,
        reasons: [
          "Disappears into the background — no flashing indicator, no anxiety.",
          "Builds trust through a quiet visible state (“Saved 12s ago”).",
          "Recoverable: a 30-second undo handles accidental changes.",
        ],
        shipped: true,
      },
    ],
  },
  {
    title: "Bulk editing",
    intro:
      "Multi-city cancellations and flight updates often touch 6+ bookings at once. The question was where the editing should happen.",
    options: [
      {
        label: "Option A",
        title: "Inline editing in the table",
        image: PROCESS_IMAGE_3,
        pros: ["Edit in context; no modal switching"],
        cons: [
          "5+ field edits get cramped in a single row",
          "Tight UI didn’t scale to complex changes",
        ],
      },
      {
        label: "Option B",
        title: "Dedicated bulk modal",
        image: PROCESS_IMAGE_3,
        pros: ["Plenty of space; multi-select clear"],
        cons: [
          "Context shift from table to modal",
          "Users had to remember which rows they’d selected",
        ],
      },
      {
        label: "Option C",
        title: "Hybrid — inline for simple edits, modal for complex",
        image: PROCESS_IMAGE_3,
        reasons: [
          "Each task picks the right tool — quick edits stay quick, complex edits get room.",
          "Reduces friction on the most common day-to-day workflows.",
          "Clear visual triggers make the inline-vs-modal boundary obvious.",
        ],
        shipped: true,
      },
    ],
  },
];

// Card for a single design option. 2-column on desktop: pros/cons on left,
// prototype thumbnail on right (Jhanvi-style). Grape-accented if shipped.
function OptionCard({ option }: { option: DesignOption }) {
  return (
    <div
      className={`flex flex-col gap-5 rounded-[16px] p-[20px] md:p-[24px] ${
        option.shipped
          ? "bg-[rgba(137,91,231,0.05)] border-[1.5px] border-heading"
          : "bg-[#f8f8f8]"
      }`}
    >
      {/* Eyebrow row: label + shipped pill badge (4px rounded, primary bg) */}
      <div className="flex items-center justify-between gap-2">
        <span className={EYEBROW_CLASS}>{option.label}</span>
        {option.shipped && (
          <span className="inline-flex items-center gap-1 bg-blackcurrant text-white px-[10px] py-[3px] rounded-[4px] font-brand text-[10px] font-medium uppercase tracking-[1.2px]">
            <Check size={10} strokeWidth={2.5} />
            Shipped
          </span>
        )}
      </div>

      {/* 2-column: text on left, image on right (stacks on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {/* LHS — Option title + (reasons if shipped, else pros/cons) */}
        <div className="flex flex-col gap-4">
          <p className="font-body text-lead md:text-lead-md font-medium text-heading">
            {option.title}
          </p>

          {option.shipped && option.reasons ? (
            // Shipped: numbered reasons (no eyebrow — Title + Shipped pill carry context)
            <ol className="list-decimal ms-[20px] flex flex-col gap-[6px]">
              {option.reasons.map((r) => (
                <li
                  key={r}
                  className="font-body text-body md:text-body-md text-muted"
                >
                  {r}
                </li>
              ))}
            </ol>
          ) : (
            // Non-shipped: inline +/− pros/cons
            <ul className="flex flex-col gap-[6px]">
              {option.pros?.map((p) => (
                <li
                  key={p}
                  className="font-body text-body md:text-body-md text-muted flex gap-2"
                >
                  <span className="text-[#0E9A49] font-medium shrink-0">
                    +
                  </span>
                  <span>{p}</span>
                </li>
              ))}
              {option.cons?.map((c) => (
                <li
                  key={c}
                  className="font-body text-body md:text-body-md text-muted flex gap-2"
                >
                  <span className="text-[#c5444a] font-medium shrink-0">
                    −
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RHS — Prototype thumbnail placeholder (4:3)
            TODO: Replace ImagePlaceholder with <Image src={option.image} ... />
            when real exploration screenshots are ready. */}
        <ImagePlaceholder
          label={`${option.label} preview`}
          aspect="aspect-[4/3]"
          radius="rounded-[8px]"
        />
      </div>
    </div>
  );
}

// Reusable visual placeholder for images we don't have yet. Renders a gray
// box with an icon + label. Swap with <Image> when real assets land.
function ImagePlaceholder({
  label,
  aspect = "aspect-[16/9]",
  radius = "rounded-[4px]",
}: {
  label: string;
  aspect?: string;
  radius?: string;
}) {
  return (
    <div
      className={`relative w-full ${aspect} ${radius} border border-[#c8ccd4] bg-[#f0f0f0] flex items-center justify-center overflow-hidden`}
    >
      <div className="flex flex-col items-center gap-2 opacity-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="font-brand text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}

function Process() {
  return (
    <section
      id="process"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full md:gap-[80px]">
        {/* Header block */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< Process >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>
              Designing at v0 speed, then earning Figma fidelity
            </h2>
          </div>
          <p className={LEAD_CLASS}>
            With the five insights synthesised and the problem statement
            locked, I had four weeks to move from validated pain to
            engineering handoff. Two constraints shaped the approach: no
            formal Figma design system to lean on, and a single design
            cycle — no second pass. So I bet on a different starting point.
          </p>
        </div>

        {/* Step 1 — Translating insights into design direction */}
        <div className="flex flex-col gap-10 md:gap-[48px]">
          <div className="flex flex-col gap-5 md:gap-[24px]">
            <NumberedH3
              num={1}
              title="Translating insights into design direction"
            />

            <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
              <p>
                Each insight from research had a corresponding hypothesis I
                wanted to test in prototype form:
              </p>
              <ul className="list-disc flex flex-col gap-2">
                {INSIGHT_DIRECTION_MAP.map(({ insight, direction }) => (
                  <li key={insight} className="ms-[27px]">
                    <span className="font-medium text-heading">
                      {insight}
                    </span>{" "}
                    → {direction}
                  </li>
                ))}
              </ul>
              <p>
                These weren&apos;t final solutions — they were starting
                points. The prototype was where they&apos;d either survive
                contact with real users, or get reshaped.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 — Code-first prototyping in v0 */}
        <div className="flex flex-col gap-10 md:gap-[48px]">
          <div className="flex flex-col gap-5 md:gap-[24px]">
            <NumberedH3 num={2} title="Code-first prototyping in v0" />

            <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
              <p>
                For the first prototype, I used Vercel V0 instead of starting
                in Figma. Two reasons made this the right call:
              </p>
              <ul className="list-disc flex flex-col gap-2">
                <li className="ms-[27px]">
                  <span className="font-medium text-heading">Speed.</span>{" "}
                  V0 generated interactive screens in minutes — what would
                  have taken hours of Figma frames and flow-wiring. With a
                  4-week clock, the time savings were real.
                </li>
                <li className="ms-[27px]">
                  <span className="font-medium text-heading">
                    Interaction fidelity.
                  </span>{" "}
                  Because V0 produces a working interface, ResCos in testing
                  could <em>feel</em> the interaction. They didn&apos;t have
                  to imagine what auto-save would look like — they saw it
                  run.
                </li>
              </ul>
              <p>
                The trade-off was visual polish — V0&apos;s default UI
                didn&apos;t match Enchanting&apos;s brand. That was fine.
                Visual fidelity would come back in Figma once the
                interaction model was validated.
              </p>
            </div>
          </div>

          <ImagePlaceholder label="v0 prototype — booking flow" />
          <ImagePlaceholder label="v0 prototype — usability testing" />
        </div>

        {/* Step 3 — Iteration & refinement (3 design decisions with pros/cons) */}
        <div className="flex flex-col gap-10 md:gap-[48px]">
          <div className="flex flex-col gap-5 md:gap-[24px]">
            <NumberedH3 num={3} title="Iteration & refinement" />

            <p className={LEAD_CLASS}>
              The interaction model is where most decisions had real
              consequences. Two of them — save behavior and bulk editing —
              best show the trade-offs.
            </p>
          </div>

          {/* Each design decision: title + intro + options stacked vertically.
              The shipped option's card carries its own "Why this solution?" — no
              redundant explainer paragraph below. */}
          {DESIGN_DECISIONS.map((decision) => (
            <div
              key={decision.title}
              className="flex flex-col gap-5 md:gap-[24px]"
            >
              <h4 className={H4_CLASS}>{decision.title}</h4>
              <p className={LEAD_CLASS}>{decision.intro}</p>

              <div className="flex flex-col gap-4 md:gap-5">
                {decision.options.map((opt) => (
                  <OptionCard key={opt.label} option={opt} />
                ))}
              </div>
            </div>
          ))}

          {/* Closing paragraph */}
          <p className={LEAD_CLASS}>
            The same pattern played out across the other three solution
            directions (status indicators, activity feed, and progressive
            layout): explore alternatives, weigh trade-offs, ship the one
            that fits the users&apos; actual day — not the one that looked
            best in isolation.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Solution
// ─────────────────────────────────────────────────────────────────────────────
const SOLUTION_ITEMS = [
  {
    num: 1,
    title: "Lost Edits → Auto-Save and Real-Time Sync",
    body: "ResCos often lost data when switching tabs or submitting partial forms. We introduced auto-save and real-time syncing to ensure edits were never lost. Every action—add, edit, delete—was preserved automatically, reducing rework and frustration.",
    impact: "Impact: Zero cases of lost edits reported during usability testing.",
  },
  {
    num: 2,
    title: "Cluttered Actions → Streamlined, Hierarchical Layout",
    body: "The previous layout was dense and repetitive. Actions lacked hierarchy, causing cognitive load. We restructured the UI with clear grouping, progressive disclosure, and consistent spacing. Common actions (like Save, Update, Cancel) were placed persistently at the top-level navigation.",
    impact: 'Users completed tasks 35% faster and described the layout as "finally intuitive."',
  },
  {
    num: 3,
    title: "Unclear Statuses → Colour-Coded Status Indicators",
    body: "Booking statuses like Pending, On Request, and Confirmed were ambiguous. We added consistent colour-coded labels and contextual microcopy—so users could instantly see what needed action and what didn't.",
    impact: "Reduced back-and-forth between ResCos and TCs by 40%.",
  },
  {
    num: 4,
    title: "No Notifications → In-App Alerts & Activity Feed",
    body: "Users often missed vendor updates or cancellations. We implemented real-time notifications for key actions and a persistent activity feed for audit trails. This ensured visibility across teams and reduced dependency on manual communication.",
    impact: "Eliminated 60% of missed vendor updates in pilot tests.",
  },
  {
    num: 5,
    title: "Cumbersome Workflows → Bulk Update Modal",
    body: "Flight and cancellation workflows were multi-step and repetitive. We introduced a Bulk Update Modal—allowing multiple bookings to be edited or cancelled simultaneously, with inline validation and pre-filled suggestions.",
    impact: "Reduced task completion time for bulk edits by 3×.",
  },
];

function Solution() {
  return (
    <section
      id="solution"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full md:gap-[80px]">
        {/* Header block */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< Solution >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>
              Redesigning Bookings to Enable Speed, Clarity &amp; Confidence
            </h2>
          </div>
          <p className={LEAD_CLASS}>
            Our redesign focused on directly addressing the five major user challenges identified
            through interviews and observation. Each solution was anchored in simplifying core
            workflows while preserving familiar patterns to minimise relearning effort.
          </p>
        </div>

        {/* Solution sub-sections */}
        {SOLUTION_ITEMS.map(({ num, title, body, impact }) => (
          <div key={num} className="flex flex-col gap-10 md:gap-[48px]">
            <div className="flex flex-col gap-5 md:gap-[24px]">
              <NumberedH3 num={num} title={title} />
              <p className={LEAD_CLASS}>{body}</p>
            </div>

            <div className="flex flex-col gap-5 md:gap-[24px]">
              <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
                <Image
                  src={SOLUTION_IMAGE}
                  alt={`Solution ${num} — ${title}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="font-body font-normal text-caption md:text-caption-md lg:text-caption-lg text-[#4caf50] text-center uppercase">
                {impact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Impact
// ─────────────────────────────────────────────────────────────────────────────

// Play arrow icon rotated -90° to point upward — matches Figma node 4323:449509
// Original: right-pointing triangle (M10 6 L26 18 L10 30), rotated 90° CCW around center (18,18)
function TrendUpArrow() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 26 L18 10 L30 26 Z" fill="#0E9A49" />
    </svg>
  );
}

const METRIC_ROWS: { stat: string; label: string }[][] = [
  [
    {
      stat: "100%",
      label: "Zero data loss after introducing Auto-save and Inline Validation.",
    },
    {
      stat: "40%",
      label: "Streamlined booking process with significantly fewer clicks.",
    },
    {
      stat: "35%",
      label: "Users completed tasks faster after the streamlined layout redesign.",
    },
  ],
  [
    {
      stat: "60%",
      label:
        "Fewer missed vendor updates after in-app alerts and an activity feed.",
    },
    {
      stat: "3×",
      label: "Faster bulk edits during peak hours with the new Bulk Update Modal.",
    },
  ],
];

function Impact() {
  return (
    <section
      id="impact"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full md:gap-[48px]">
        {/* Header block */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< Impact >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>Measuring the Outcomes That Mattered</h2>
          </div>
          <p className={LEAD_CLASS}>
            The redesigned Bookings module in Artemis 3.0 delivered measurable improvements across
            both user experience and operational efficiency.
          </p>
        </div>

        {/* Metric cards */}
        <div className="flex flex-col gap-5 md:gap-[24px]">
          <h3 className={H3_CLASS}>Quantitative Outcomes</h3>

          <div className="flex flex-col gap-4 md:gap-[24px]">
            {METRIC_ROWS.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className={`grid gap-4 md:gap-[24px] ${
                  row.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
                {row.map(({ stat, label }) => (
                  <div
                    key={stat + label}
                    className="flex flex-col gap-4 bg-[#e7f8f2] rounded-[16px] p-[20px]"
                  >
                    <div className="flex justify-end">
                      <TrendUpArrow />
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="font-body font-normal text-body md:text-body-md lg:text-body-lg text-secondary">
                        {label}
                      </p>
                      <span className="font-heading font-medium text-stat md:text-stat-md lg:text-stat-lg text-heading">
                        {stat}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Reflection
// ─────────────────────────────────────────────────────────────────────────────
function Reflection() {
  return (
    <section
      id="reflection"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-5 w-full md:gap-[24px]">
        {/* Tag + heading */}
        <div className="flex flex-col gap-3">
          <div className="-rotate-3 w-fit">
            <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
              {"< Reflection >"}
            </span>
          </div>
          <h2 className={H2_CLASS}>What I learned</h2>
        </div>

        {/* Body */}
        <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
          <p>
            Redesigning the Reservations module reinforced the importance of deep workflow
            empathy — understanding not just what users do, but why they do it that way.
            Simplifying operations for efficiency had to coexist with preserving familiar mental
            models for the teams that rely on Artemis daily.
          </p>
          <p>
            The project also emphasised the value of rapid prototyping and early feedback loops.
            Building the v0 prototype helped us validate assumptions early and align engineering
            and operations teams from the start.
            <br />
            Finally, this project reminded me that the best internal tools aren&apos;t flashy —
            they&apos;re invisible enablers of focus, speed, and trust in everyday workflows.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtemisReservationsPage() {
  return (
    <CaseStudyLayout sections={SECTIONS} backHref="/#works">
      <Overview />
      <MyRole />
      <Background />
      <Research />
      <Challenges />
      <TheProblem />
      <Process />
      <Solution />
      <Impact />
      <Reflection />
    </CaseStudyLayout>
  );
}
