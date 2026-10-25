import type { Metadata } from "next";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";
import {
  Hero,
  Chapter,
  Copy,
  Lead,
  Meta,
  Visual,
  Pair,
  Figure,
  Quote,
  Outcome,
} from "@/components/case-study";

export const metadata: Metadata = {
  title: "Artemis Reservations · Ashmik Ragesh",
  description:
    "Streamlining the Reservations Module in Artemis 3.0 — reducing booking edit time by ~25% and eliminating manual saves.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "context",    label: "Context"    },
  { id: "research",   label: "Research"   },
  { id: "problem",    label: "Problem"    },
  { id: "process",    label: "Process"    },
  { id: "solution",   label: "Solution"   },
  { id: "impact",     label: "Impact"     },
  { id: "reflection", label: "Reflection" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 00 Context
// ─────────────────────────────────────────────────────────────────────────────
function Context() {
  return (
    <Chapter id="context" num={0} title="Context">
      <Copy>
        <Meta
          items={[
            { label: "Role", value: "Sole designer" },
            { label: "Timeline", value: <>4 weeks<br />Launched Aug 2024</> },
            {
              label: "Team",
              value: (
                <>
                  Srishti Mahajan (PM), Unnikrishnan Manikoth (Design Manager),
                  Muzamil &amp; Niraj (Engineering)
                </>
              ),
            },
            { label: "Tools", value: "Figma, FigJam, Vercel V0, Slack, Loom" },
          ]}
        />
        <h3>What is the Reservations module?</h3>
        <p>
          Artemis is Enchanting Travels&apos; internal platform for planning and
          executing custom trips. Within it, the Reservations module is the
          backend hub where 100+ Reservations Consultants (ResCos) confirm vendor
          bookings, manage flight and cancellation changes, and keep
          trip-critical logistics on track.
        </p>
        <p>
          By late 2023, Artemis was being migrated from 2.0 to 3.0 — and the
          Reservations module, largely untouched in years, became the natural
          first place to rethink the experience from the ground up.
        </p>
        <h3>Goal</h3>
        <p>
          Give the Reservations team back their time: replace manual saves,
          ambiguous statuses, and repetitive bulk-update flows with auto-save,
          in-app alerts, and a streamlined modal-based workflow. I owned the full
          lifecycle — research, IA, flows, v0 prototype, high-fi designs, and
          engineering handoff.
        </p>
      </Copy>
      <Visual>
        <Figure label="Artemis 3.0 Reservations — overview" />
      </Visual>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 01 Research
// ─────────────────────────────────────────────────────────────────────────────
// Composite ResCo quotes drawn from recurring themes in interviews + tickets.
const FINDINGS = [
  {
    title: "Manual saves.",
    description:
      "Edits weren't auto-saved, often leading to lost work and wasted time when consultants switched between screens.",
  },
  {
    title: "Cluttered actions.",
    description:
      "Outdated and overlapping UI elements made navigation unintuitive and slowed down task completion.",
  },
  {
    title: "Unclear statuses.",
    description:
      "Ambiguous booking and request statuses caused delays in confirmations and extra back-and-forth between teams.",
  },
  {
    title: "No notifications.",
    description:
      "Important updates — like vendor confirmations or cancellations — were missed due to the lack of real-time alerts.",
  },
  {
    title: "Inefficient workflows.",
    description:
      "Flight details and cancellation flows involved too many steps, creating inefficiencies in vendor coordination.",
  },
];

function Research() {
  return (
    <Chapter id="research" num={1} title="Listening to the people who live in Artemis daily">
      <Copy>
        <Lead>
          Before sketching a single screen, I spent the first week understanding
          how Reservations actually worked — and where it broke.
        </Lead>
        <p>
          Research had two threads: inward to the PM, and outward to the ResCos
          themselves.
        </p>
        <h3>Stakeholder interview</h3>
        <p>A one-on-one with Srishti (PM) framed the brief. Three things stuck:</p>
        <ul>
          <li>
            The module hadn&apos;t been meaningfully touched in years — users had
            built private workarounds.
          </li>
          <li>Data-loss incidents had been escalating into leadership channels.</li>
          <li>
            The 2.0 → 3.0 migration window meant ~4 weeks of design time. No
            second pass.
          </li>
        </ul>
        <h3>ResCo interviews</h3>
        <p>
          I ran 6 contextual interviews with ResCos across regional offices,
          walking through a typical Tuesday with each. Alongside, I reviewed ~30
          recent support tickets and internal Slack threads about lost-work
          incidents. The themes were unambiguous.
        </p>
        <Quote name="ResCo" role="Bengaluru office">
          I lost an entire morning of bookings on Tuesday because I forgot to hit
          save before switching trips. It was the third time that month.
        </Quote>
        <Quote name="ResCo" role="Delhi office">
          By the time I figure out which booking the vendor is asking about,
          I&apos;ve already opened five tabs and three email threads.
        </Quote>
        <h3>Where the system fell short</h3>
        <p>
          Across interviews, support ticket reviews, and Slack thread analysis,
          five themes surfaced repeatedly. Each became a target for the redesign.
        </p>
        <ul>
          {FINDINGS.map(({ title, description }) => (
            <li key={title}>
              <strong>{title}</strong> {description}
            </li>
          ))}
        </ul>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 02 Problem
// ─────────────────────────────────────────────────────────────────────────────
function Problem() {
  return (
    <Chapter id="problem" num={2} title="A system that relied too much on manual effort">
      <Copy>
        <p>
          Five recurring themes from research mapped to one root cause: Artemis
          Reservations had been built as a <em>user-driven</em> system. Every
          safety net — saves, status checks, notifications, confirmations —
          depended on a human remembering to perform it. As scale grew, vigilance
          fatigue grew with it.
        </p>
        <p>
          The result wasn&apos;t a single broken feature. It was a system that
          worked only when its users were sharp, well-rested, and uninterrupted — a
          fragile baseline for a team running 100+ live trips a day.
        </p>
      </Copy>
      <Visual>
        <Figure label="Artemis 2.0 Reservations — before" />
      </Visual>
      <Copy>
        <h3>The problem statement</h3>
        <Lead>
          The system needed to shift from user-driven execution to system-driven
          reliability.
        </Lead>
        <p>
          Artemis Reservations depended on manual coordination for high-stakes
          booking workflows. As operational complexity increased, this reliance on
          user intervention created inefficiencies, miscommunication, and
          avoidable risk.
        </p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 03 Process
// ─────────────────────────────────────────────────────────────────────────────
type DesignOption = {
  label: string;
  title: string;
  pros?: string[];
  cons?: string[];
  reasons?: string[];
  shipped?: boolean;
};

const DESIGN_DECISIONS: { title: string; intro: string; options: DesignOption[] }[] = [
  {
    title: "Save behavior",
    intro:
      "Auto-save is famously hard to get right. We tested three approaches before landing on a model that disappeared into the background.",
    options: [
      {
        label: "Option A",
        title: "Save on every keystroke",
        pros: ["Maximum data safety; never lose work"],
        cons: [
          "Flashing “Saving…” indicator broadcast anxiety",
          "Testers asked “did it save?” more than with manual save",
        ],
      },
      {
        label: "Option B",
        title: "Save on blur (when section completes)",
        pros: ["Quieter; matches the “I’m done with this part” cue"],
        cons: [
          "Tab-switching without focus shift lost data",
          "Long forms felt “unsaved” for minutes at a time",
        ],
      },
      {
        label: "Option C · Shipped",
        title: "Save on meaningful change + “Saved 12s ago” timestamp + 30s undo",
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
        pros: ["Edit in context; no modal switching"],
        cons: [
          "5+ field edits get cramped in a single row",
          "Tight UI didn’t scale to complex changes",
        ],
      },
      {
        label: "Option B",
        title: "Dedicated bulk modal",
        pros: ["Plenty of space; multi-select clear"],
        cons: [
          "Context shift from table to modal",
          "Users had to remember which rows they’d selected",
        ],
      },
      {
        label: "Option C · Shipped",
        title: "Hybrid — inline for simple edits, modal for complex",
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

function Process() {
  return (
    <Chapter id="process" num={3} title="Designing at v0 speed, then earning Figma fidelity">
      <Copy>
        <p>
          With the five insights synthesised and the problem statement locked, I
          had four weeks to move from validated pain to engineering handoff. Two
          constraints shaped the approach: no formal Figma design system to lean
          on, and a single design cycle — no second pass. So I bet on a different
          starting point.
        </p>
        <h3>Code-first prototyping in v0</h3>
        <p>
          For the first prototype, I used Vercel V0 instead of starting in Figma.
          Two reasons made this the right call:
        </p>
        <ul>
          <li>
            <strong>Speed.</strong> V0 generated interactive screens in minutes —
            what would have taken hours of Figma frames and flow-wiring. With a
            4-week clock, the time savings were real.
          </li>
          <li>
            <strong>Interaction fidelity.</strong> Because V0 produces a working
            interface, ResCos in testing could <em>feel</em> the interaction. They
            didn&apos;t have to imagine what auto-save would look like — they saw
            it run.
          </li>
        </ul>
        <p>
          The trade-off was visual polish — V0&apos;s default UI didn&apos;t match
          Enchanting&apos;s brand. That was fine. Visual fidelity would come back
          in Figma once the interaction model was validated.
        </p>
      </Copy>
      <Visual>
        <Pair>
          <Figure label="v0 prototype — booking flow" caption="The first working prototype, built in v0." />
          <Figure label="v0 prototype — usability testing" caption="ResCos testing auto-save in a live build." />
        </Pair>
      </Visual>
      <Copy>
        <h3>Iteration &amp; refinement</h3>
        <p>
          The interaction model is where most decisions had real consequences. Two
          of them — save behavior and bulk editing — best show the trade-offs.
        </p>
      </Copy>
      {DESIGN_DECISIONS.map(({ title, intro, options }) => (
        <div key={title}>
          <Copy>
            <h3>{title}</h3>
            <p>{intro}</p>
          </Copy>
          <Visual>
            <Pair>
              {options.map((opt) => (
                <Figure key={opt.label} label={opt.label} caption={opt.title} aspect="aspect-[4/3]" />
              ))}
            </Pair>
          </Visual>
          <Copy>
            {options.map((opt) => (
              <OptionNotes key={opt.label} option={opt} />
            ))}
          </Copy>
        </div>
      ))}
      <Copy>
        <p className="cs-closing">
          The same pattern played out across the other three solution directions
          (status indicators, activity feed, and progressive layout): explore
          alternatives, weigh trade-offs, ship the one that fits the users&apos;
          actual day — not the one that looked best in isolation.
        </p>
      </Copy>
    </Chapter>
  );
}

// Pros and cons for an option that didn't ship; reasons for the one that did
function OptionNotes({ option }: { option: DesignOption }) {
  return (
    <>
      <p>
        <strong>{option.label} — {option.title}</strong>
      </p>
      <ul>
        {option.shipped
          ? option.reasons?.map((r) => <li key={r}>{r}</li>)
          : [
              ...(option.pros ?? []).map((p) => <li key={p}><em>Pro:</em> {p}</li>),
              ...(option.cons ?? []).map((c) => <li key={c}><em>Con:</em> {c}</li>),
            ]}
      </ul>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 04 Solution
// ─────────────────────────────────────────────────────────────────────────────
const SOLUTION_ITEMS = [
  {
    title: "Lost edits → auto-save and real-time sync",
    body: "The data loss wasn't purely technical — it was a trust problem. ResCos had developed habits to compensate: saving manually before switching tabs, avoiding certain actions mid-form. They were managing the system's unreliability as part of their workflow. I removed the decision entirely. Every field change persisted immediately without user action, and real-time sync surfaced a TC's updates without a page refresh. The system became the source of truth, not the user's memory.",
    impact: "Zero cases of lost edits reported during usability testing.",
  },
  {
    title: "Cluttered actions → a streamlined, hierarchical layout",
    body: "The old layout treated every action as equal priority — edit, duplicate, archive, flag, and assign all present at once, in nearly every context. The result was that users knew what they needed to do but couldn't quickly find how. I audited every action by frequency and restructured them into tiers: primary actions always visible, secondary one click away, destructive behind a confirm step. That alone removed roughly a third of the visible controls from the default state — without removing any capability.",
    impact: 'Task completion 35% faster; ResCos described the layout as "finally intuitive."',
  },
  {
    title: "Unclear statuses → colour-coded status indicators",
    body: "'On Request' and 'Pending' looked identical in the old interface — same weight, same position, different meanings. ResCos told me they'd memorised which column each status appeared in as a workaround. I introduced a consistent colour system (green for confirmed, amber for in-progress, red for action required) and contextual microcopy that explained each status in plain language — not just what it was called, but what the user should do next.",
    impact: "Reduced back-and-forth between ResCos and TCs by 40%.",
  },
  {
    title: "No notifications → in-app alerts and an activity feed",
    body: "When a vendor updated a booking, the only signal was a manual refresh. ResCos described checking compulsively and still missing changes; the workaround was Slack messages and memory. I introduced targeted alerts for the moments that mattered — vendor confirmations, cancellations, status changes — and a persistent activity feed per booking. The feed wasn't just a notification log; it gave the whole team a shared record so they could stop asking each other 'what happened with this one?'",
    impact: "Eliminated 60% of missed vendor updates in pilot tests.",
  },
  {
    title: "Cumbersome workflows → a bulk update modal",
    body: "A group booking of 12 passengers meant 12 individual flight updates — the same multi-step form, repeated, with no guardrail against inconsistencies introduced mid-run. ResCos described it as one of the most demoralising parts of their day. The Bulk Update Modal let them select any set of bookings, apply a change once, and review a before/after preview before confirming. The key design decision was to keep the modal self-contained: no navigating away, no state loss — so the action felt atomic even when it touched dozens of records.",
    impact: "Reduced task completion time for bulk edits by 3×.",
  },
];

function Solution() {
  return (
    <Chapter id="solution" num={4} title="Redesigning bookings for speed, clarity, and confidence">
      <Copy>
        <p>
          Each solution maps directly to one of the five research themes. The
          constraint I set was to simplify without removing capability — familiar
          patterns preserved, cognitive load reduced, and no relearning curve for
          a team already under pressure.
        </p>
      </Copy>
      {SOLUTION_ITEMS.map(({ title, body, impact }) => (
        <div key={title}>
          <Visual>
            <Figure label={title} caption={impact} />
          </Visual>
          <Copy>
            <h3>{title}</h3>
            <p>{body}</p>
          </Copy>
        </div>
      ))}
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 05 Impact
// ─────────────────────────────────────────────────────────────────────────────
function Impact() {
  return (
    <Chapter id="impact" num={5} title="Measuring the outcomes that mattered">
      <Copy>
        <p>
          Three numbers from usability testing and pilot — each tied directly to a
          pain point that surfaced in research.
        </p>
        <Outcome
          metric="35%"
          title="Faster task completion"
          stats={[
            {
              value: "60%",
              label: "Fewer missed vendor updates once in-app alerts replaced the Slack-and-memory workaround.",
            },
            {
              value: "3×",
              label: "Faster bulk edits — a 12-step repeated process collapsed into one confirmed action.",
            },
          ]}
        >
          <p>
            After restructuring the layout hierarchy — verified across moderated
            usability sessions.
          </p>
        </Outcome>
        <Quote name="Sarah M." role="Reservations Consultant, Enchanting Travels">
          It&apos;s not that everything&apos;s faster — it&apos;s that I stopped
          second-guessing myself. I used to screenshot my work before switching
          tabs, just in case. I haven&apos;t done that once since launch.
        </Quote>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 06 Reflection
// ─────────────────────────────────────────────────────────────────────────────
function Reflection() {
  return (
    <Chapter id="reflection" num={6} title="What I learned">
      <Copy>
        <h3>The real problem lived in workarounds</h3>
        <p>
          ResCos memorising which column a status appeared in, saving manually
          before switching tabs — none of that was in any brief or requirements
          doc. It only surfaced through observation. A requirements-driven
          approach would have missed the actual friction entirely. The research
          phase wasn&apos;t preliminary groundwork; it was the work.
        </p>
        <h3>Match the tool to what you&apos;re learning</h3>
        <p>
          Starting in v0 instead of Figma was a deliberate bet, and it paid off.
          With a four-week window, interaction fidelity mattered more than visual
          polish — and v0 let participants feel the auto-save behaviour rather
          than imagine it. The lesson wasn&apos;t &ldquo;skip Figma&rdquo; but
          &ldquo;match your tool to what you&apos;re actually trying to learn at
          each stage.&rdquo;
        </p>
        <h3>Simplicity is tiering, not removing</h3>
        <p>
          The question that unlocked the right solution wasn&apos;t &ldquo;what can
          we cut?&rdquo; but &ldquo;what does a ResCo need right now vs.
          occasionally vs. rarely?&rdquo; That framing made the design defensible —
          and made it much easier to bring stakeholders along who were reluctant
          to hide anything.
        </p>
      </Copy>
    </Chapter>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtemisReservationsPage() {
  return (
    <CaseStudyLayout sections={SECTIONS}>
      <Hero title="Artemis Reservations" date="August 2024" color="#E6EDF8" />
      <Context />
      <Research />
      <Problem />
      <Process />
      <Solution />
      <Impact />
      <Reflection />
    </CaseStudyLayout>
  );
}
