"use client";

import { type ComponentProps } from "react";
import HostCharacter from "@/components/host/HostCharacter";
import { useRinging } from "@/components/host/HostStates";
import ExplorationCard from "./ExplorationCard";

/**
 * Every state Bella can be in, each in an exploration card with the live character. The
 * eyes are held straight ahead (a fixed `gaze`), so the cards don't all follow the cursor
 * round the page. Ringing and the celebration replay on a loop. Two across on phones, four
 * from tablet up.
 */
const STILL = { x: 0, y: 0 };

type Pose = Omit<ComponentProps<typeof HostCharacter>, "gaze" | "style" | "className">;

const STATES: { name: string; pose: Pose; loop?: "ding" | "celebrate" }[] = [
  { name: "Idle", pose: {} },
  { name: "Ringing", pose: {}, loop: "ding" },
  { name: "Reading", pose: { glasses: "reading" } },
  { name: "Watching", pose: { glasses: "video" } },
  { name: "Dozing", pose: { mood: "dozing" } },
  { name: "Celebrating", pose: {}, loop: "celebrate" },
  { name: "Surprised", pose: { expression: "surprised" } },
  { name: "Champion", pose: { mood: "champion" } },
];

export default function BellaStates() {
  const beat = useRinging(3600);
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-[16px] p-0 md:grid-cols-4">
      {STATES.map(({ name, pose, loop }) => (
        <ExplorationCard key={name} name={name}>
          <HostCharacter
            {...pose}
            gaze={STILL}
            ding={loop === "ding" ? beat : 0}
            celebrate={loop === "celebrate" ? beat : 0}
            style={{ width: 112, height: 104 }}
            className="block"
          />
        </ExplorationCard>
      ))}
    </ul>
  );
}
