"use client";

// ── Host states ───────────────────────────────────────────────────────────────
// Every state the front-desk bell can be in, each drawn live at navbar size in a
// little scene (scaled up for review) with a note on when it happens. Used by the
// development-only /host-states page.

import { useEffect, useState, type ReactNode } from "react";
import HostCharacter, { hostLayout, type HostMood } from "@/components/host/HostCharacter";
import TimerBoard, { BOARD_WIDTH } from "@/components/host/TimerBoard";
import CuriosityBubble, { type Bubble } from "@/components/CuriosityBubble";
import { MILESTONES, RECORD_LINES } from "@/lib/curiosity/milestones";

const HOST_HEIGHT = 56;
const HOST = hostLayout(HOST_HEIGHT);
const [LEFT_HAND, RIGHT_HAND] = HOST.hands;
const GRIP_MID = (LEFT_HAND.x + RIGHT_HAND.x) / 2;
// Where the bell sits inside each scene
const HOST_X = 100;
const HOST_Y = 16;

/** A clock that counts up from `start`, like a visit in progress. */
function useTicking(start: number) {
  const [s, setS] = useState(start);
  useEffect(() => {
    const id = window.setInterval(() => setS((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return s;
}

/** Bumps every `ms`, to keep the bell ringing on a loop. */
function useRinging(ms: number) {
  const [ding, setDing] = useState(1);
  useEffect(() => {
    const id = window.setInterval(() => setDing((d) => d + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return ding;
}

/** Types `line` out on a loop, as the tooltip does. */
function useSpeaking(line: string): Bubble {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => (c >= line.length + 60 ? 0 : c + 1)), 40);
    return () => window.clearInterval(id);
  }, [line]);
  const typed = line.slice(0, count);
  const talking = count < line.length;
  const noop = () => {};
  return {
    message: line,
    kind: "milestone",
    stamp: 0,
    typeMs: 0,
    holdMs: 0,
    percentile: null,
    typed,
    talking,
    leaving: false,
    dismiss: noop,
    pause: noop,
    resume: noop,
  };
}

function Scene({ title, when, children }: { title: string; when: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col gap-[12px]">
      <div className="relative overflow-hidden rounded-[12px] border border-line-soft bg-white h-[336px]">
        {/* The scene is drawn at real navbar size, then scaled up so the detail shows */}
        <div className="absolute left-0 top-0 w-[360px] h-[224px] origin-top-left scale-150">{children}</div>
      </div>
      <figcaption>
        <p className="font-body font-medium text-[16px] leading-[24px] text-heading">{title}</p>
        <p className="font-body text-[14px] leading-[22px] text-secondary">{when}</p>
      </figcaption>
    </figure>
  );
}

function Host({ mood = "idle", holding = false, ding = 0 }: { mood?: HostMood; holding?: boolean; ding?: number }) {
  return (
    <div className="absolute" style={{ left: HOST_X, top: HOST_Y }}>
      <HostCharacter mood={mood} holding={holding} ding={ding} style={{ width: HOST.width, height: HOST_HEIGHT }} className="relative z-10 block" />
    </div>
  );
}

function Board({ seconds, champion = false }: { seconds: number; champion?: boolean }) {
  const left = GRIP_MID - BOARD_WIDTH / 2;
  return (
    <div className="absolute" style={{ left: HOST_X + left, top: HOST_Y + LEFT_HAND.y + 6 }}>
      <TimerBoard seconds={seconds} champion={champion} grips={[LEFT_HAND.x - left, RIGHT_HAND.x - left]} />
    </div>
  );
}

function Tip({ bubble }: { bubble: Bubble }) {
  return (
    <div className="absolute z-20" style={{ left: HOST_X, top: HOST_Y + HOST_HEIGHT + 10 }}>
      <CuriosityBubble bubble={bubble} />
    </div>
  );
}

export default function HostStates() {
  const visit = useTicking(4 * 60 + 12);
  const record = useTicking(31 * 60 + 47);
  const longVisit = useTicking(60 * 60 + 4 * 60 + 9);
  const ringing = useRinging(2400);
  const thirty = useSpeaking(MILESTONES[0].say({ percentile: null }));
  const twoMin = useSpeaking(MILESTONES[1].say({ percentile: 72 }));
  const recordLine = useSpeaking(RECORD_LINES[0]);

  return (
    <main className="page-container pt-[140px] pb-[120px]">
      <h1 className="font-heading text-h1 md:text-h1-md lg:text-h1-lg text-heading">Front-desk bell — every state</h1>
      <p className="mt-[12px] max-w-[640px] font-body text-lead md:text-lead-md text-secondary">
        Each scene is live and drawn at the size it appears in the navbar, scaled up 1.5× here. Move your cursor around —
        the eyes follow it everywhere on the page.
      </p>

      <div className="mt-[48px] grid gap-[32px] lg:grid-cols-2">
        <Scene title="Resting" when="The default. Blinks, breathes, smiles, and its eyes follow the cursor. Hands tucked away behind the bell.">
          <Host />
        </Scene>

        <Scene title="Hovered" when="Rings (ding ding, with sound once the page has had a click), then both hands come out and lower the board: a grape-wood frame, the live time inside.">
          <Host holding ding={ringing} />
          <Board seconds={visit} />
        </Scene>

        <Scene title="Hovered — after an hour" when="Hours appear once there are some (1h 04m 09s); the cards narrow a touch to fit.">
          <Host holding />
          <Board seconds={longVisit} />
        </Scene>

        <Scene title="Message — at 0:30" when="Rings, then a tooltip types the line out underneath, pointing up at the bell.">
          <Host ding={ringing} />
          <Tip bubble={thirty} />
        </Scene>

        <Scene title="Message — at 2:00, with data" when="Once there are 10+ visitors, the 2- and 5-minute lines say how this visit compares.">
          <Host />
          <Tip bubble={twoMin} />
        </Scene>

        <Scene title="Asleep" when="The clock is paused: the tab is hidden, or there's been no scroll, click, key or touch for 30 seconds. Wakes up on the next one.">
          <Host mood="dozing" />
        </Scene>

        <Scene title="Record holder" when="This visit has run longer than anyone else's, ever (once at least 3 others have visited). The bell turns gold for the rest of the visit.">
          <Host mood="champion" />
        </Scene>

        <Scene title="Record holder — hovered" when="The board turns gold too: Champion of Curiosity.">
          <Host mood="champion" holding ding={ringing} />
          <Board seconds={record} champion />
        </Scene>

        <Scene title="Record holder — the moment" when="Said once, the moment the record is broken.">
          <Host mood="champion" />
          <Tip bubble={{ ...recordLine, kind: "record" }} />
        </Scene>
      </div>
    </main>
  );
}
