"use client";

// ── Host documentation ────────────────────────────────────────────────────────
// The reference page for the front-desk bell, laid out the way design systems and
// character sheets document a component: overview, anatomy, the palette, moods, the states it moves between and what triggers them, motion, copy,
// sound, do's and don'ts, accessibility, and where it lives in the code. Scenes are
// live and drawn at navbar size. Used by the development-only /host-states page.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import HostCharacter, { hostLayout, type HostMood } from "@/components/host/HostCharacter";
import TimerBoard, { BOARD_WIDTH } from "@/components/host/TimerBoard";
import CuriosityBubble, { type Bubble } from "@/components/CuriosityBubble";
import { HOLD_BASE_MS, HOLD_PER_CHAR_MS, MILESTONES, RECORD_LINES, TYPE_MS_PER_CHAR } from "@/lib/curiosity/milestones";
import { IDLE_TIMEOUT_MS, MIN_RANK_SAMPLE, MIN_RECORD_FIELD } from "@/lib/curiosity/config";

const HOST_HEIGHT = 56;
const HOST = hostLayout(HOST_HEIGHT);
const [LEFT_HAND, RIGHT_HAND] = HOST.hands;
const GRIP_MID = (LEFT_HAND.x + RIGHT_HAND.x) / 2;
// Scenes are drawn in a 360px-wide space; the bell sits on its centre line, and each
// scene's content is centred vertically by its Stage
const SCENE_WIDTH = 360;
const HOST_X = SCENE_WIDTH / 2 - HOST.width / 2;
// How tall each kind of scene's content is, so it can be centred
const CONTENT = { bell: HOST_HEIGHT, board: LEFT_HAND.y + 6 + 76, tip: HOST_HEIGHT + 10 + 56 };
const SceneTop = createContext(16);

const SECTIONS = [
  ["overview", "Overview"],
  ["anatomy", "Anatomy"],
  ["palette", "Palette"],
  ["moods", "Moods"],
  ["states", "States and triggers"],
  ["scenes", "In context"],
  ["motion", "Motion"],
  ["copy", "Copy"],
  ["sound", "Sound"],
  ["usage", "Do's and don'ts"],
  ["a11y", "Accessibility"],
  ["code", "In the code"],
] as const;

// ── Live helpers ──────────────────────────────────────────────────────────────

/** A clock that counts up from `start`, like a visit in progress. */
function useTicking(start: number) {
  const [s, setS] = useState(start);
  useEffect(() => {
    const id = window.setInterval(() => setS((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return s;
}

/** Bumps every `ms`, to keep a bell ringing on a loop. */
function useRinging(ms: number) {
  const [ding, setDing] = useState(1);
  useEffect(() => {
    const id = window.setInterval(() => setDing((d) => d + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return ding;
}

/** Types `line` out on a loop, as the tooltip does. */
function useSpeaking(line: string, kind: Bubble["kind"] = "milestone"): Bubble {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    const id = window.setInterval(() => setCount((c) => (c >= line.length + 60 ? 0 : c + 1)), 40);
    return () => window.clearInterval(id);
  }, [line]);
  const noop = () => {};
  return {
    message: line,
    kind,
    stamp: 0,
    typeMs: 0,
    holdMs: 0,
    percentile: null,
    typed: line.slice(0, count),
    talking: count < line.length,
    leaving: false,
    dismiss: noop,
    pause: noop,
    resume: noop,
  };
}

// ── Building blocks ───────────────────────────────────────────────────────────

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[120px] border-t border-line-soft pt-[48px]">
      <h2 className="font-heading text-h2 md:text-h2-md lg:text-h2-lg text-heading">{title}</h2>
      {intro && <p className="mt-[8px] max-w-[640px] font-body text-body md:text-body-md text-secondary">{intro}</p>}
      <div className="mt-[24px]">{children}</div>
    </section>
  );
}

function Stage({ height = 336, content, children }: { height?: number; content: number; children: ReactNode }) {
  const inner = height / 1.5;
  return (
    <div className="relative overflow-hidden rounded-[12px] border border-line-soft bg-white" style={{ height }}>
      {/* Drawn at real navbar size, centred, then scaled up so the detail shows */}
      <div className="absolute left-1/2 top-0 origin-top -translate-x-1/2 scale-150" style={{ width: SCENE_WIDTH, height: inner }}>
        <SceneTop.Provider value={Math.max(0, (inner - content) / 2)}>{children}</SceneTop.Provider>
      </div>
    </div>
  );
}

function Scene({ title, when, content, children }: { title: string; when: string; content: number; children: ReactNode }) {
  return (
    <figure className="flex flex-col gap-[12px]">
      <Stage content={content}>{children}</Stage>
      <figcaption>
        <p className="font-body font-medium text-[16px] leading-[24px] text-heading">{title}</p>
        <p className="font-body text-[14px] leading-[22px] text-secondary">{when}</p>
      </figcaption>
    </figure>
  );
}

function Host({ mood = "idle", holding = false, ding = 0 }: { mood?: HostMood; holding?: boolean; ding?: number }) {
  const top = useContext(SceneTop);
  return (
    <div className="absolute" style={{ left: HOST_X, top }}>
      <HostCharacter mood={mood} holding={holding} ding={ding} style={{ width: HOST.width, height: HOST_HEIGHT }} className="relative z-10 block" />
    </div>
  );
}

function Board({ seconds, champion = false }: { seconds: number; champion?: boolean }) {
  const top = useContext(SceneTop);
  const left = GRIP_MID - BOARD_WIDTH / 2;
  return (
    <div className="absolute" style={{ left: HOST_X + left, top: top + LEFT_HAND.y + 6 }}>
      <TimerBoard seconds={seconds} champion={champion} grips={[LEFT_HAND.x - left, RIGHT_HAND.x - left]} />
    </div>
  );
}

// Centred under the bell, pointer in the middle
function Tip({ bubble }: { bubble: Bubble }) {
  const top = useContext(SceneTop);
  return (
    <div className="absolute z-20 -translate-x-1/2" style={{ left: HOST_X + HOST.width / 2, top: top + HOST_HEIGHT + 10 }}>
      <CuriosityBubble bubble={bubble} align="center" />
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-line-soft">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead className="bg-surface">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-[16px] py-[12px] font-brand text-[12px] leading-[16px] uppercase tracking-[1px] text-muted font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-line-soft align-top">
              {row.map((cell, j) => (
                <td key={j} className={`px-[16px] py-[12px] font-body text-[14px] leading-[22px] ${j === 0 ? "text-heading font-medium" : "text-secondary"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-[4px] bg-surface px-[6px] py-[2px] font-brand text-[12px] text-heading">{children}</code>;
}

// ── Sections ──────────────────────────────────────────────────────────────────

// Callouts on the anatomy drawing, in the drawing's own coordinates (see HostCharacter)
const PARTS: [number, number, string, string][] = [
  [100, 128, "Plunger", "Grape, with a lit cap. Pressed down on every ding."],
  [140, 168, "Dome", "Blackcurrant enamel: a shade shape with a lit copy offset up-left, leaving a crescent on the right. Turns gold for the record holder."],
  [65, 196, "Highlight", "One curved stroke down the left. Slides against the gaze with the light."],
  [85, 176, "Eyes", "Whites stay put; pupils and catchlights follow the cursor. No mouth — the face is just the eyes."],
  [150, 219, "Base", "Grape, with a lit top edge."],
  [80, 262, "Hands", "Hidden behind the bell at rest. Come round the front to hold the board, then go back."],
];

function Anatomy() {
  const height = 240;
  const scale = height / 130;
  const width = 140 * scale;
  return (
    <div className="grid gap-[32px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
      <div className="relative flex justify-center rounded-[12px] border border-line-soft bg-white py-[48px]">
        <div className="relative" style={{ width, height: height + 60 }}>
          <HostCharacter holding style={{ width, height }} className="block" />
          {PARTS.map(([x, y], i) => (
            <span
              key={i}
              className="absolute flex items-center justify-center w-[20px] h-[20px] -ml-[10px] -mt-[10px] rounded-full bg-grape font-brand text-[11px] text-white ring-2 ring-white"
              style={{ left: (x - 30) * scale, top: (y - 118) * scale }}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
      <ol className="flex flex-col gap-[16px]">
        {PARTS.map(([, , name, note], i) => (
          <li key={name} className="flex gap-[12px]">
            <span className="flex shrink-0 items-center justify-center w-[24px] h-[24px] rounded-full bg-grape font-brand text-[12px] text-white">{i + 1}</span>
            <div>
              <p className="font-body font-medium text-[16px] leading-[24px] text-heading">{name}</p>
              <p className="font-body text-[14px] leading-[22px] text-secondary">{note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const SWATCHES: [string, string, string][] = [
  ["Dome, lit", "#3e0d4b", "Blackcurrant enamel"],
  ["Midnight", "#1e0525", "Dome shade (the crescent on the right), arms, pupils, tooltip"],
  ["Grape", "#9D136A", "Base, plunger, hands, ring lines, Z's"],
  ["Grape, lit", "#c22a88", "Plunger cap"],
  ["Grape, shade", "#6e0e4b", "Base front, plunger collar"],
  ["Gold, lit", "#f2c75c", "Champion dome"],
  ["Gold, shade", "#c8952e", "Champion dome crescent"],
  ["Board, sand", "#d9c9a8", "Standard frame (gradient)"],
  ["Board, ivory", "#f8f1e3", "Standard face"],
  ["Clock window", "#1c1a1d", "Both boards"],
];

function Palette() {
  return (
    <div className="grid gap-[12px] grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {SWATCHES.map(([name, hex, use]) => (
        <div key={name} className="overflow-hidden rounded-[12px] border border-line-soft">
          <div className="h-[64px]" style={{ background: hex }} />
          <div className="p-[12px]">
            <p className="font-body font-medium text-[14px] leading-[20px] text-heading">{name}</p>
            <p className="font-brand text-[12px] leading-[16px] text-muted uppercase">{hex}</p>
            <p className="mt-[4px] font-body text-[12px] leading-[18px] text-secondary">{use}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Moods() {
  const moods: [HostMood, string, string][] = [
    ["idle", "Idle", "Eyes open, blinking every few seconds, breathing, following the cursor."],
    ["dozing", "Dozing", "Lids shut, slumped a little to one side, slow breathing, Z's drifting up."],
    ["champion", "Champion", "Cast in gold, eyes squeezed shut happily, sparkles catching the light."],
  ];
  return (
    <div className="grid gap-[16px] md:grid-cols-3">
      {moods.map(([mood, name, note]) => (
        <div key={mood} className="rounded-[12px] border border-line-soft p-[24px]">
          <div className="flex h-[140px] items-center justify-center">
            <HostCharacter mood={mood} style={{ width: 150, height: 140 }} className="block" />
          </div>
          <p className="mt-[16px] font-body font-medium text-[16px] leading-[24px] text-heading">{name}</p>
          <p className="font-body text-[14px] leading-[22px] text-secondary">{note}</p>
        </div>
      ))}
    </div>
  );
}

export default function HostStates() {
  const visit = useTicking(4 * 60 + 12);
  const longVisit = useTicking(60 * 60 + 4 * 60 + 9);
  const record = useTicking(31 * 60 + 47);
  const ringing = useRinging(2400);
  const thirty = useSpeaking(MILESTONES[0].say({ percentile: null }));
  const twoMin = useSpeaking(MILESTONES[1].say({ percentile: 72 }));
  const recordLine = useSpeaking(RECORD_LINES[0], "record");
  const idleSeconds = IDLE_TIMEOUT_MS / 1000;

  return (
    <main className="page-container pt-[140px] pb-[120px]">
      <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-[48px]">
        {/* On-page contents */}
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-[120px] flex flex-col gap-[8px]">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="font-body text-[14px] leading-[20px] text-secondary transition-colors hover:text-grape">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-[56px]">
          <header id="overview" className="scroll-mt-[120px]">
            <p className="font-brand text-[12px] uppercase tracking-[1.6px] text-muted">Character · Measuring your curiosity</p>
            <h1 className="mt-[8px] font-heading text-h1 md:text-h1-md lg:text-h1-lg text-heading">The front-desk bell</h1>
            <p className="mt-[12px] max-w-[680px] font-body text-lead md:text-lead-md text-secondary">
              The site&apos;s logo and host. It keeps time for each visit — active time only — shows it on a board when you hover it,
              and rings to say something at a few moments along the way. It&apos;s a desk bell first, a character second: it
              behaves like the object and speaks plainly, the way someone at a front desk would.
            </p>
            <div className="mt-[20px] flex flex-wrap gap-[8px]">
              {["Navbar logo, 56px tall", "3 moods", "6 states", "Development-only page"].map((t) => (
                <span key={t} className="rounded-full bg-surface px-[12px] py-[4px] font-brand text-[12px] uppercase tracking-[1px] text-secondary">
                  {t}
                </span>
              ))}
            </div>
          </header>

          <Section id="anatomy" title="Anatomy" intro="Flat, in the brand's colours, with just enough form to read as an object.">
            <Anatomy />
          </Section>

          <Section id="palette" title="Palette" intro="Blackcurrant and grape for the bell, gold only for the record holder. The board stays neutral so it never competes with the bell.">
            <Palette />
          </Section>

          <Section id="moods" title="Moods" intro="Expression comes from the eyes alone. A mood can combine with holding the board.">
            <Moods />
          </Section>

          <Section id="states" title="States and triggers" intro="What the bell is doing, what puts it there, and what takes it out again.">
            <Table
              head={["State", "Triggered by", "What happens", "Ends when"]}
              rows={[
                ["Resting", "The default", "Idle mood. Hands hidden. Eyes follow the cursor.", "Any other state starts"],
                [
                  "Hovered",
                  "Pointer over the bell, or keyboard focus",
                  "Rings (with sound once the page has had a click), then both hands bring down the board with the live time",
                  "Pointer leaves or focus moves",
                ],
                [
                  "Tapped (touch screens)",
                  "A tap on the bell — hover does nothing on touch. Also once by itself, right after the visit's first line",
                  "Rings, then lowers the board. The bell doesn't navigate home on touch screens.",
                  "Another tap, on the bell or the board",
                ],
                [
                  "Message",
                  "Active time reaches 0:30, 2:00 or 5:00 — each once per visit — or the record is broken",
                  "Rings, then a tooltip types the line out underneath. The navbar slides back into view. Hovering can't lower the board meanwhile.",
                  `Read time passes (${HOLD_BASE_MS / 1000}s + ${HOLD_PER_CHAR_MS}ms per character, paused while hovered) or it's clicked`,
                ],
                ["Dozing", `Tab hidden, or no scroll, click, key or touch for ${idleSeconds} seconds`, "Dozing mood. The visit clock is paused.", "The next scroll, click, key or touch"],
                [
                  "Record holder",
                  `This visit runs longer than anyone else's longest, with at least ${MIN_RECORD_FIELD} other visitors on record`,
                  "Champion mood, the gold board, and the record line, once",
                  "Stays for the rest of the visit, across reloads",
                ],
              ]}
            />
            <p className="mt-[16px] font-body text-[14px] leading-[22px] text-secondary">
              Moods layer under states: a dozing bell that&apos;s hovered wakes and holds the board; a record holder stays gold in every state.
              Percentages in the 2:00 and 5:00 lines appear once there are {MIN_RANK_SAMPLE}+ visitors.
            </p>
          </Section>

          <Section id="scenes" title="In context" intro="Each scene at real navbar size, scaled 1.5×.">
            <div className="grid gap-[32px] lg:grid-cols-2">
              <Scene content={CONTENT.bell} title="Resting" when="The default.">
                <Host />
              </Scene>
              <Scene content={CONTENT.board} title="Hovered" when="Rings, then lowers the board.">
                <Host holding ding={ringing} />
                <Board seconds={visit} />
              </Scene>
              <Scene content={CONTENT.board} title="Hovered — after an hour" when="Hours appear once there are some; the cards narrow a touch to fit.">
                <Host holding />
                <Board seconds={longVisit} />
              </Scene>
              <Scene content={CONTENT.tip} title="Message — at 0:30" when="Rings, then the tooltip types the line out.">
                <Host ding={ringing} />
                <Tip bubble={thirty} />
              </Scene>
              <Scene content={CONTENT.tip} title="Message — at 2:00, with data" when={`Once there are ${MIN_RANK_SAMPLE}+ visitors.`}>
                <Host />
                <Tip bubble={twoMin} />
              </Scene>
              <Scene content={CONTENT.bell} title="Dozing" when="The visit clock is paused.">
                <Host mood="dozing" />
              </Scene>
              <Scene content={CONTENT.board} title="Record holder — hovered" when="The gold board.">
                <Host mood="champion" holding ding={ringing} />
                <Board seconds={record} champion />
              </Scene>
              <Scene content={CONTENT.tip} title="Record holder — the moment" when="Said once, as the record is broken.">
                <Host mood="champion" />
                <Tip bubble={recordLine} />
              </Scene>
            </div>
          </Section>

          <Section id="motion" title="Motion" intro="Small, quick and physical — it should feel like an object being handled, and stay light on the hundredth hover.">
            <Table
              head={["Movement", "Duration", "Easing", "Notes"]}
              rows={[
                ["Ding", "900ms", "ease-out", "Plunger presses (260ms), dome shudders (640ms), ring lines fan out, a glint sweeps the dome"],
                ["Hands", "420ms", "easeOutBack", "Behind the bell at rest; round the front to hold the board"],
                ["Board drop", "700ms", "Overshoot, then a small swing", "Pivots from where it's held, like a hanging sign"],
                ["Flip", "380ms", "Ease-in, then overshoot", "Old top flap falls (180ms), new bottom flap drops (200ms)"],
                ["Tooltip", "160ms", "ease-out", "Fades and lifts from its pointer; types at " + TYPE_MS_PER_CHAR + "ms per character"],
                ["Blink", "Every 4.2s", "—", "Only while the eyes are open"],
                ["Breathe", "3.6s loop (5.2s dozing)", "ease-in-out", "A 1–2% squash and stretch"],
                ["Eyes", "Every frame", "—", "Follow the cursor anywhere on the page"],
              ]}
            />
            <p className="mt-[16px] font-body text-[14px] leading-[22px] text-secondary">With reduced motion, everything holds still: no tracking, breathing, swings or flips — states still change.</p>
          </Section>

          <Section id="copy" title="Copy" intro="Short, plain and factual — how a person at a front desk would actually say it. One thought per line, no dashes, no visit counts.">
            <Table
              head={["When", "Line", "Variant"]}
              rows={[
                ["0:30", MILESTONES[0].say({ percentile: null }), `On touch screens: ${MILESTONES[0].say({ percentile: null, touch: true })}`],
                ["2:00", MILESTONES[1].say({ percentile: 72 }), `Before ${MIN_RANK_SAMPLE} visitors: ${MILESTONES[1].say({ percentile: null })}`],
                ["5:00", MILESTONES[2].say({ percentile: 91 }), `Before ${MIN_RANK_SAMPLE} visitors: ${MILESTONES[2].say({ percentile: null })}`],
                ["Record", RECORD_LINES[0], "—"],
              ]}
            />
            <p className="mt-[16px] font-body text-[14px] leading-[22px] text-secondary">
              Lines live in <Code>src/lib/curiosity/milestones.ts</Code>. Percentages shown here are examples.
            </p>
          </Section>

          <Section id="sound" title="Sound" intro="A double ding from a small desk bell, synthesised in the browser — no audio file.">
            <ul className="flex flex-col gap-[8px] font-body text-[14px] leading-[22px] text-secondary list-disc pl-[20px]">
              <li>Two strikes 170ms apart, the second softer. Each: a short metallic click over the ring of a bell around 2,090 Hz.</li>
              <li>Plays on hover and on a first tap. At most once every 0.9 seconds.</li>
              <li>Silent until the visitor has clicked, tapped or pressed a key on the page — browsers require it.</li>
              <li>Tuning (pitch, length, volume) is at the top of <Code>bellSound.ts</Code>.</li>
            </ul>
          </Section>

          <Section id="usage" title="Do's and don'ts">
            <div className="grid gap-[16px] md:grid-cols-2">
              <div className="rounded-[12px] border border-line-soft p-[24px]">
                <p className="font-brand text-[12px] uppercase tracking-[1px] text-success">Do</p>
                <ul className="mt-[12px] flex flex-col gap-[8px] font-body text-[14px] leading-[22px] text-secondary list-disc pl-[20px]">
                  <li>Keep it at 56px tall in the navbar.</li>
                  <li>Let it ring before it speaks, every time.</li>
                  <li>Keep lines under about 70 characters and true about the visit.</li>
                  <li>Keep gold for the record holder only.</li>
                  <li>Show one thing at a time below it: the board or a tooltip.</li>
                </ul>
              </div>
              <div className="rounded-[12px] border border-line-soft p-[24px]">
                <p className="font-brand text-[12px] uppercase tracking-[1px] text-warning">Don&apos;t</p>
                <ul className="mt-[12px] flex flex-col gap-[8px] font-body text-[14px] leading-[22px] text-secondary list-disc pl-[20px]">
                  <li>Draw it smaller than 40px — the eyes stop reading.</li>
                  <li>Give it a mouth, eyebrows, or colours outside blackcurrant, grape and gold.</li>
                  <li>Use it for errors, forms or system messages — it&apos;s a host, not an alert.</li>
                  <li>Ring it without the visitor doing something, or play sound before they&apos;ve interacted.</li>
                  <li>Have it speak more than a few times a visit.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="a11y" title="Accessibility">
            <ul className="flex flex-col gap-[8px] font-body text-[14px] leading-[22px] text-secondary list-disc pl-[20px]">
              <li>The bell is a link home labelled &ldquo;Home — measuring your curiosity&rdquo;; the drawing itself is hidden from assistive tech.</li>
              <li>Keyboard focus on the bell lowers the board, the same as hover.</li>
              <li>On touch screens the bell is a toggle: tap to show the board, tap again to put it away. It reports its state with <Code>aria-expanded</Code>.</li>
              <li>The board is a <Code>role=&quot;timer&quot;</Code> with a spoken label, e.g. &ldquo;Measuring your curiosity: 4m 16s&rdquo;.</li>
              <li>Tooltip lines are announced whole through a polite live region, not letter by letter.</li>
              <li>Reduced motion stops every animation; sound never plays before an interaction.</li>
            </ul>
          </Section>

          <Section id="code" title="In the code">
            <Table
              head={["File", "What it does"]}
              rows={[
                [<Code key="a">components/host/HostCharacter.tsx</Code>, "The bell: drawing, moods, hands, ding, cursor tracking"],
                [<Code key="b">components/host/TimerBoard.tsx</Code>, "Standard and champion boards, split-flap clock"],
                [<Code key="c">components/CuriosityBubble.tsx</Code>, "When the bell speaks, and the tooltip"],
                [<Code key="d">components/host/bellSound.ts</Code>, "The ding"],
                [<Code key="e">components/host/useRecordHolder.ts</Code>, "Whether this visit holds the record"],
                [<Code key="f">lib/curiosity/milestones.ts</Code>, "What it says, and when"],
                [<Code key="g">components/Navbar.tsx</Code>, "Puts it all together in the navbar"],
              ]}
            />
            <p className="mt-[16px] font-body text-[14px] leading-[22px] text-secondary">
              To pin a state on the live navbar while developing, add <Code>?mood=holding</Code>, <Code>?mood=dozing</Code> or{" "}
              <Code>?mood=champion</Code> to any page&apos;s address.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
