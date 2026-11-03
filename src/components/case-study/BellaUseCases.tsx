"use client";

import { useEffect, useState } from "react";
import { Board, CONTENT, Host, Stage, Tip, useRinging, useSpeaking, useTicking } from "@/components/host/HostStates";
import Stamp from "@/components/bella/Stamp";
import { MILESTONES } from "@/lib/curiosity/milestones";

/**
 * Bella's use cases as live scenes: the real character and sign from the navbar, drawn at
 * navbar size and scaled up (see HostStates' Stage), each looping the moment it shows.
 * `scenes` picks which to show; two or more sit side by side from tablet up, each with a
 * small label.
 */

export type BellaSceneName = "time" | "hello" | "reading" | "watching" | "dozing" | "goal" | "stamp" | "champion";

const LABELS: Record<BellaSceneName, string> = {
  time: "Your time on the sign",
  hello: "A line at 0:30",
  reading: "Reading a case study",
  watching: "Watching a video",
  dozing: "Tab hidden or idle",
  goal: "A goal reached",
  stamp: "A stamp found",
  champion: "The longest stay this month",
};

/** Bumps every `ms`, to replay the goal celebration on a loop. */
function useCelebrating(ms: number) {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => v + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return n;
}

function TimeScene() {
  const visit = useTicking(256);
  const ringing = useRinging(3600);
  return (
    <Stage height={288} content={CONTENT.board}>
      <Host holding ding={ringing} />
      <Board seconds={visit} />
    </Stage>
  );
}

function HelloScene() {
  const ringing = useRinging(3600);
  const thirty = useSpeaking(MILESTONES[0].say({ percentile: null }));
  return (
    <Stage height={288} content={CONTENT.tip}>
      <Host ding={ringing} />
      <Tip bubble={thirty} />
    </Stage>
  );
}

function GoalScene() {
  const celebrating = useCelebrating(5200);
  return (
    <Stage height={288} content={CONTENT.bell}>
      <Host celebrate={celebrating} />
    </Stage>
  );
}

function ChampionScene() {
  const record = useTicking(2 * 3600 - 640);
  const ringing = useRinging(3600);
  return (
    <Stage height={288} content={CONTENT.board}>
      <Host mood="champion" holding ding={ringing} />
      <Board seconds={record} champion />
    </Stage>
  );
}

const SCENES: Record<BellaSceneName, () => React.ReactNode> = {
  time: TimeScene,
  hello: HelloScene,
  reading: () => (
    <Stage height={288} content={CONTENT.bell}>
      <Host glasses="reading" />
    </Stage>
  ),
  watching: () => (
    <Stage height={288} content={CONTENT.bell}>
      <Host glasses="video" />
    </Stage>
  ),
  dozing: () => (
    <Stage height={288} content={CONTENT.bell}>
      <Host mood="dozing" />
    </Stage>
  ),
  goal: GoalScene,
  stamp: () => (
    <Stage height={288} content={CONTENT.bell}>
      <Host expression="surprised" />
      <Stamp stamp="ring" rotate={-8} className="absolute left-[228px] top-[16px] h-[56px] w-[56px]" />
    </Stage>
  ),
  champion: ChampionScene,
};

export default function BellaUseCases({ scenes }: { scenes: BellaSceneName[] }) {
  const labelled = scenes.length > 1;
  return (
    <div className={`grid grid-cols-1 gap-[32px] ${labelled ? "md:grid-cols-2" : ""}`}>
      {scenes.map((name) => {
        const Scene = SCENES[name];
        return (
          <figure key={name} className="m-0 flex flex-col gap-[12px]">
            <Scene />
            {labelled && (
              <figcaption className="text-center font-body text-[12px] font-medium leading-[16px] text-muted">
                {LABELS[name]}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
