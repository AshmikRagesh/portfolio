"use client";

import { useEffect, useState } from "react";
import { Board, CONTENT, Host, Stage, Tip, useRinging, useSpeaking, useTicking } from "@/components/host/HostStates";
import Stamp from "@/components/bella/Stamp";
import { MILESTONES } from "@/lib/curiosity/milestones";

/**
 * Bella's use cases as live scenes: the real character and sign from the navbar, drawn at
 * navbar size and scaled up (see HostStates' Stage), each looping the moment it shows.
 * One per row on phones, two across from tablet up.
 */

/** Bumps every `ms`, to replay the goal celebration on a loop. */
function useCelebrating(ms: number) {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => v + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return n;
}

function UseCase({ title, how, content, children }: { title: string; how: string; content: number; children: React.ReactNode }) {
  return (
    <figure className="m-0 flex flex-col gap-[12px]">
      <Stage height={288} content={content}>
        {children}
      </Stage>
      <figcaption>
        <p className="font-body text-[16px] font-medium leading-[24px] text-heading">{title}</p>
        <p className="font-body text-[14px] leading-[22px] text-secondary">{how}</p>
      </figcaption>
    </figure>
  );
}

export default function BellaUseCases() {
  const visit = useTicking(256);
  const record = useTicking(2 * 3600 - 640);
  const ringing = useRinging(3600);
  const celebrating = useCelebrating(5200);
  const thirty = useSpeaking(MILESTONES[0].say({ percentile: null }));

  return (
    <div className="grid grid-cols-1 gap-[32px] md:grid-cols-2">
      <UseCase content={CONTENT.board} title="Shows your time" how="Hover, focus or tap: Bella rings and lowers a sign with your active time.">
        <Host holding ding={ringing} />
        <Board seconds={visit} />
      </UseCase>
      <UseCase content={CONTENT.tip} title="Says hello" how="At 0:30, 2:00 and 5:00 it rings once and types one plain line.">
        <Host ding={ringing} />
        <Tip bubble={thirty} />
      </UseCase>
      <UseCase content={CONTENT.bell} title="Reads with you" how="Round gold reading glasses while a case study is open.">
        <Host glasses="reading" />
      </UseCase>
      <UseCase content={CONTENT.bell} title="Watches with you" how="3D glasses while a video you started plays, and the clock keeps counting.">
        <Host glasses="video" />
      </UseCase>
      <UseCase content={CONTENT.bell} title="Dozes when you leave" how="Hidden tab or 30 seconds without input: the clock pauses and Bella sleeps.">
        <Host mood="dozing" />
      </UseCase>
      <UseCase content={CONTENT.bell} title="Celebrates a goal" how="Two case studies, all of them, the resume or the email: a gold bow tie for about three seconds.">
        <Host celebrate={celebrating} />
      </UseCase>
      <UseCase content={CONTENT.bell} title="Spots a stamp" how="Five stamps to find. Bella looks surprised and the stamp lands on your pass.">
        <Host expression="surprised" />
        <Stamp stamp="ring" rotate={-8} className="absolute left-[228px] top-[16px] h-[56px] w-[56px]" />
      </UseCase>
      <UseCase content={CONTENT.board} title="Crowns the longest stay" how="The longest visit this month turns Bella and the sign gold.">
        <Host mood="champion" holding ding={ringing} />
        <Board seconds={record} champion />
      </UseCase>
    </div>
  );
}
