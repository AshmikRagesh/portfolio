"use client";

import HostCharacter, { type HostGlasses, type HostMood } from "@/components/host/HostCharacter";

/**
 * The live Bella, side by side in the states a visitor can meet: the same component the
 * navbar uses, so the case study always shows the bell as it ships. Two across on phones,
 * four from tablet up.
 */
const STATES: { mood: HostMood; glasses?: HostGlasses; name: string; note: string }[] = [
  { mood: "idle", name: "Idle", note: "Eyes open, blinking, following the cursor." },
  { mood: "idle", glasses: "reading", name: "Reading", note: "Round gold rims while a case study is read." },
  { mood: "dozing", name: "Dozing", note: "The clock is paused: the tab is hidden or idle." },
  { mood: "champion", name: "Champion", note: "Gold, for the longest visit this month." },
];

export default function BellaMoods() {
  return (
    <div className="grid grid-cols-2 gap-[16px] md:grid-cols-4">
      {STATES.map(({ mood, glasses, name, note }) => (
        <div key={name} className="rounded-lg border border-line-soft bg-white p-[20px]">
          <div className="flex h-[120px] items-center justify-center">
            <HostCharacter mood={mood} glasses={glasses} style={{ width: 128, height: 120 }} className="block" />
          </div>
          <p className="mt-[16px] font-body text-[16px] font-medium leading-[24px] text-heading">{name}</p>
          <p className="font-body text-[14px] leading-[22px] text-secondary">{note}</p>
        </div>
      ))}
    </div>
  );
}
