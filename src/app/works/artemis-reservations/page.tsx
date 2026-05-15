import type { Metadata } from "next";
import Image from "next/image";
import { Save, CircleX, BellOff, Workflow } from "lucide-react";
import SparkleAiIcon from "@/components/icons/SparkleAiIcon";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";

export const metadata: Metadata = {
  title: "Artemis Reservations · Ashmik Ragesh",
  description:
    "Streamlining the Reservations Module in Artemis 3.0 — reducing booking edit time by ~25% and eliminating manual saves.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview",           label: "Overview"             },
  { id: "my-role",            label: "My Role"              },
  { id: "background",         label: "Background"           },
  { id: "the-problem",        label: "The Problem"          },
  { id: "challenges",         label: "Challenges"           },
  { id: "process",            label: "Process"              },
  { id: "solution",           label: "Solution"             },
  { id: "impact",             label: "Impact"               },
  { id: "reflection",         label: "Reflection"           },
];

// TODO: Replace with permanent assets — Figma URLs expire ~7 days from 2026-04-17
// Solution section images (all placeholders in Figma; swap when real assets are ready)
const SOLUTION_IMAGE =
  "https://www.figma.com/api/mcp/asset/b7bf0626-b02e-4cae-8342-73ee66a4ef5a";

// Process section images (all placeholders in Figma; swap when real assets are ready)
const PROCESS_IMAGE_1 =
  "https://www.figma.com/api/mcp/asset/bed86782-e0f9-4923-be8f-de03dab9c8e3";
const PROCESS_IMAGE_2 =
  "https://www.figma.com/api/mcp/asset/bed86782-e0f9-4923-be8f-de03dab9c8e3";
const PROCESS_IMAGE_3 =
  "https://www.figma.com/api/mcp/asset/bed86782-e0f9-4923-be8f-de03dab9c8e3";
const PROCESS_IMAGE_4 =
  "https://www.figma.com/api/mcp/asset/bed86782-e0f9-4923-be8f-de03dab9c8e3";

const OVERVIEW_IMAGE =
  "https://www.figma.com/api/mcp/asset/bd222c70-fe17-447e-bf69-a7de8dca1c4c";
const UNDERSTANDING_IMAGE =
  "https://www.figma.com/api/mcp/asset/09aab68c-6c20-48d4-9d57-ac9fc5dc5792";
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
// Section: My Role
// ─────────────────────────────────────────────────────────────────────────────
function MyRole() {
  const columns = [
    {
      heading: "My Role",
      content: (
        <>
          Conceptualized the product strategy. Led the end-to-end design
          process.
        </>
      ),
    },
    {
      heading: "Timeline",
      content: <>1 Month</>,
    },
    {
      heading: "Team",
      content: (
        <>
          Srishti Mahajan (PM)
          <br />
          Unnikrishnan Manikoth (Design Manager)
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
        </>
      ),
    },
  ];

  return (
    <section
      id="my-role"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 w-full md:gap-x-[48px] lg:grid-cols-4 lg:gap-x-[100px]">
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
// Section: Understanding the tool
// ─────────────────────────────────────────────────────────────────────────────
function UnderstandingTheTool() {
  return (
    <section
      id="understanding"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:pl-[80px] lg:pr-[180px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-[48px] w-full">
        <div className="flex flex-col gap-6 md:gap-[24px]">
          <h2 className={H2_CLASS}>Understanding the tool</h2>
          <p className={LEAD_CLASS}>
            Artemis is Enchanting Travels&apos; in-house planning and operations
            platform, used to design, manage, and execute highly customised trips
            across the world. Within it, the Reservations module is where backend
            magic happens: vendor bookings are confirmed, service details are
            tracked, and all trip-critical logistics are stitched together.
          </p>
        </div>

        <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
          <Image
            src={UNDERSTANDING_IMAGE}
            alt="Artemis platform — Reservations module screenshot"
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

          <div className={`flex flex-col gap-0 ${LEAD_CLASS}`}>
            <p>
              The Reservations module is the heartbeat of Artemis, our internal
              platform used daily by Travel Consultants and Reservations teams.
              It manages every confirmed booking — from hotel and flight updates
              to cancellation handling and vendor coordination.
            </p>
            <p>
              By 2023, the tool had started showing its age. Workflows felt
              fragmented, manual actions caused lost edits, and outdated UI
              patterns slowed down even the most experienced users.
            </p>
            <p>
              Migrating Artemis from 2.0 to 3.0 presented the perfect
              opportunity to rethink the Reservations experience — not just a
              visual refresh, but a full usability redesign focused on
              efficiency, clarity, and reliability.
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
// Section: The Problem
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
          {/* Tag + heading — 12px gap */}
          <div className="flex flex-col gap-3">
            <div className="-rotate-3 w-fit">
              <span className="font-handwriting text-[24px] leading-[32px] tracking-[-0.12px] text-grape whitespace-nowrap">
                {"< The Problem >"}
              </span>
            </div>

            <h2 className={H2_CLASS}>A System That Relied Too Much on Manual Effort</h2>
          </div>

          {/* Body */}
          <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
            <p>
              Core workflows depended heavily on manual intervention. Users had
              to remember to save changes, coordinate bookings over email, and
              re-enter flight details. Bulk updates require repetitive actions.
              The system functioned — but only if users stayed vigilant.
            </p>
            <p>
              Over time, this created operational strain. Teams double-checked
              actions instead of trusting the system, and small oversights —
              like a missed save or notification — led to downstream delays and
              errors.
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

        {/* Problem Statement callout */}
        <div className="flex flex-col gap-5 rounded-[8px] border-[1.5px] border-heading bg-[rgba(137,91,231,0.05)] p-[24px] md:gap-[20px]">
          {/* Heading row */}
          <div className="flex items-center gap-2 w-full">
            <SparkleAiIcon size={26} className="shrink-0 text-heading" />
            <h3 className={H3_CLASS}>The Problem Statement</h3>
          </div>

          {/* Body */}
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
                {"< Challenges >"}
              </span>
            </div>
            <h2 className={H2_CLASS}>Where the System Fell Short</h2>
          </div>
          <p className={LEAD_CLASS}>
            The Reservations module in Artemis 2.0 had become a daily friction
            point for users. Feedback from Reservations Consultants and Travel
            Consultants highlighted recurring pain areas.
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
// Section: Process
// ─────────────────────────────────────────────────────────────────────────────
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
            <h2 className={H2_CLASS}>From v0 Prototype to High-Fidelity Designs</h2>
          </div>
          <p className={LEAD_CLASS}>
            We shipped the improved booking workflow using a phased approach. We
            experimented with handing off the AI-generated v0 prototype directly
            to engineering, which seemed efficient since it was already
            interactive and we weren&apos;t yet using a formal Figma design
            system.
          </p>
        </div>

        {/* Step 1 */}
        <div className="flex flex-col gap-10 md:gap-[48px]">
          <div className="flex flex-col gap-5 md:gap-[24px]">
            <NumberedH3 num={1} title="From v0 Prototype to High-Fidelity Designs" />

            <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
              <p>
                Our first step was to build a functional low-fidelity prototype
                using Vercel V0 — a code-first prototyping tool that allowed us
                to move fast and test ideas early.
              </p>
              <div>
                <p className="font-semibold text-heading">Goals:</p>
                <ul className="list-disc mt-1">
                  <li className="ms-[27px]">
                    Visualise the full booking flow end-to-end.
                  </li>
                  <li className="ms-[27px]">
                    Test core usability patterns like step indicators and
                    drag-and-drop workflows.
                  </li>
                  <li className="ms-[27px]">
                    Gather early reactions from Reservations and TC teams.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
            <Image
              src={PROCESS_IMAGE_1}
              alt="v0 prototype — booking flow screenshot"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
            <Image
              src={PROCESS_IMAGE_2}
              alt="v0 prototype — usability testing screenshot"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col gap-10 md:gap-[48px]">
          <div className="flex flex-col gap-5 md:gap-[24px]">
            <NumberedH3 num={2} title="Iterative Feedback and Refinement" />

            <div className={`flex flex-col gap-4 ${LEAD_CLASS}`}>
              <div>
                <p className="font-semibold text-heading">Activities:</p>
                <ul className="list-disc mt-1">
                  <li className="ms-[27px]">
                    Conducted internal review sessions with ResCos, TCs, and
                    TCOs.
                  </li>
                  <li className="ms-[27px]">
                    Tested booking creation, modification, and cancellation
                    workflows.
                  </li>
                  <li className="ms-[27px]">
                    Iterated weekly on layout hierarchy, action placement, and
                    form usability.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-heading">
                  Key Design Adjustments:
                </p>
                <ul className="list-disc mt-1">
                  <li className="ms-[27px]">
                    Simplified action bar and consolidated frequent actions at
                    the top.
                  </li>
                  <li className="ms-[27px]">
                    Introduced inline validation for quicker feedback.
                  </li>
                  <li className="ms-[27px]">
                    Added consistent spacing and section headers for readability.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
            <Image
              src={PROCESS_IMAGE_3}
              alt="Iterative feedback — design refinement screenshot"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="relative w-full aspect-[16/9] rounded-[4px] overflow-hidden border border-[#c8ccd4] bg-[#f0f0f0]">
            <Image
              src={PROCESS_IMAGE_4}
              alt="Iterative feedback — layout adjustments screenshot"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
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
      <UnderstandingTheTool />
      <Background />
      <TheProblem />
      <Challenges />
      <Process />
      <Solution />
      <Impact />
      <Reflection />
    </CaseStudyLayout>
  );
}
