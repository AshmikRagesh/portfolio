"use client";

import { type ComponentProps } from "react";
import HostCharacter from "@/components/host/HostCharacter";
import { useRinging } from "@/components/host/HostStates";

/**
 * What Bella solves, one card per point: the live Bella in the state that shows it on a
 * soft grape stage, then the point's short bold lead and one plain line. Eyes held straight
 * ahead (a fixed `gaze`); ringing and the celebration replay on a loop. One column on
 * phones, two from tablet up.
 */
const STILL = { x: 0, y: 0 };

type Pose = Omit<ComponentProps<typeof HostCharacter>, "gaze" | "style" | "className">;
type Point = { lead: string; text: string; pose: Pose; loop?: "ding" | "celebrate" };

export default function BellaSolves({ items }: { items: Point[] }) {
  const beat = useRinging(3600);
  return (
    <ul className="cs-stagger m-0 grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2 md:gap-[24px]">
      {items.map(({ lead, text, pose, loop }) => (
        <li key={lead} className="flex flex-col rounded-lg border border-line-soft bg-white p-[12px]">
          <div className="flex h-[136px] items-center justify-center rounded-md bg-grape-light/30">
            <HostCharacter
              {...pose}
              gaze={STILL}
              ding={loop === "ding" ? beat : 0}
              celebrate={loop === "celebrate" ? beat : 0}
              style={{ width: 112, height: 104 }}
              className="block"
            />
          </div>
          <div className="flex flex-col gap-[4px] px-[8px] pb-[8px] pt-[16px]">
            <h4 className="font-heading text-[24px] leading-[30px] tracking-[0px] text-heading">{lead}</h4>
            <p className="m-0 font-body text-[18px] leading-[30px] text-muted">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
