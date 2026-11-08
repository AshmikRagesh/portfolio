"use client";

import { useState } from "react";
import DemoNav from "@/components/demo/DemoNav";
import CheckIn from "@/components/demo/CheckIn";
import Rooms, { ROOM_NUMBERS } from "@/components/demo/Rooms";
import Guestbook from "@/components/demo/Guestbook";
import CheckOut from "@/components/demo/CheckOut";
import { usePassport } from "@/components/demo/useGuesthouse";

// "The Guesthouse" theme preview. Lives apart from the real home page until approved.
export default function GuesthouseDemo() {
  const [calm, setCalm] = useState(false); // Do Not Disturb hanger → motion off
  const { stamps, stamp } = usePassport();
  const total = ROOM_NUMBERS.length;
  const visited = stamps.filter((s) => ROOM_NUMBERS.includes(s)).length;

  return (
    <div className={`demo-paper min-h-screen ${calm ? "demo-calm" : ""}`}>
      <DemoNav />
      <main>
        <CheckIn calm={calm} onToggleCalm={() => setCalm((c) => !c)} stamps={visited} totalRooms={total} />
        <Rooms stamps={stamps} onStamp={stamp} />
        <Guestbook />
      </main>
      <CheckOut roomsStayed={visited} totalRooms={total} />
    </div>
  );
}
