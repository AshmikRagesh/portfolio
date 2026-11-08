"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Postcard, LuggageLabel, CoffeeStamp, KeyTag, DoNotDisturb, WifiCard, Passport, Polaroid } from "./Stickers";

type Pos = { x: number; y: number; r: number }; // x/y in % of the board, r in degrees
type StickerId = "polaroid" | "label" | "stamp" | "postcard" | "dnd" | "wifi" | "passport" | "key";

// Desktop: stickers frame the centred hero text. Phone/tablet: a scattered pile under it.
const LAYOUT: Record<StickerId, { lg: Pos; sm: Pos; label: string }> = {
  polaroid: { lg: { x: 2, y: 6, r: -6 }, sm: { x: 2, y: 0, r: -6 }, label: "Polaroid of your host" },
  label: { lg: { x: 1, y: 60, r: 8 }, sm: { x: 46, y: 1, r: 8 }, label: "Luggage label" },
  stamp: { lg: { x: 17, y: 38, r: -10 }, sm: { x: 68, y: 22, r: -10 }, label: "Filter coffee stamp" },
  passport: { lg: { x: 15, y: 72, r: 6 }, sm: { x: 4, y: 54, r: 6 }, label: "Passport" },
  postcard: { lg: { x: 74, y: 4, r: 5 }, sm: { x: 2, y: 30, r: -3 }, label: "Postcard from Bangalore" },
  dnd: { lg: { x: 89, y: 36, r: -5 }, sm: { x: 74, y: 42, r: -5 }, label: "Do not disturb door hanger" },
  wifi: { lg: { x: 70, y: 64, r: -6 }, sm: { x: 40, y: 64, r: -4 }, label: "Guest Wi-Fi card" },
  key: { lg: { x: 82, y: 70, r: 10 }, sm: { x: 70, y: 78, r: 10 }, label: "Room key" },
};
const IDS = Object.keys(LAYOUT) as StickerId[];
const DRAG_THRESHOLD = 4;

export default function StickerBoard({
  calm,
  onToggleCalm,
  stamps,
  totalRooms,
}: {
  calm: boolean;
  onToggleCalm: () => void;
  stamps: number;
  totalRooms: number;
}) {
  const [isLg, setIsLg] = useState(true);
  const [offsets, setOffsets] = useState<Record<string, { dx: number; dy: number }>>({});
  const [order, setOrder] = useState<StickerId[]>(IDS);
  const [flipped, setFlipped] = useState(false);
  const drag = useRef<{ id: StickerId; startX: number; startY: number; dx: number; dy: number; moved: boolean } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const tap = (id: StickerId) => {
    if (id === "postcard") setFlipped((f) => !f);
    if (id === "dnd") onToggleCalm();
  };

  const onPointerDown = (id: StickerId) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const o = offsets[id] ?? { dx: 0, dy: 0 };
    drag.current = { id, startX: e.clientX, startY: e.clientY, dx: o.dx, dy: o.dy, moved: false };
    setOrder((prev) => [...prev.filter((p) => p !== id), id]); // bring to front
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const mx = e.clientX - d.startX;
    const my = e.clientY - d.startY;
    if (!d.moved && Math.hypot(mx, my) < DRAG_THRESHOLD) return;
    d.moved = true;
    setOffsets((prev) => ({ ...prev, [d.id]: { dx: d.dx + mx, dy: d.dy + my } }));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (d && !d.moved) tap(d.id);
  };

  const onKeyDown = (id: StickerId) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tap(id);
    }
  };

  const tidy = () => {
    setOffsets({});
    setOrder(IDS);
    setFlipped(false);
  };

  const render = (id: StickerId): ReactNode => {
    switch (id) {
      case "polaroid": return <Polaroid />;
      case "label": return <LuggageLabel />;
      case "stamp": return <CoffeeStamp />;
      case "passport": return <Passport count={stamps} total={totalRooms} />;
      case "postcard": return <Postcard flipped={flipped} />;
      case "dnd": return <DoNotDisturb calm={calm} />;
      case "wifi": return <WifiCard />;
      case "key": return <KeyTag room="101" />;
    }
  };

  const interactive = (id: StickerId) => id === "postcard" || id === "dnd";
  const moved = Object.keys(offsets).length > 0 || flipped;

  return (
    <div className="pointer-events-none absolute inset-0">
      {IDS.map((id) => {
        const base = isLg ? LAYOUT[id].lg : LAYOUT[id].sm;
        const o = offsets[id] ?? { dx: 0, dy: 0 };
        return (
          <div
            key={id}
            role={interactive(id) ? "button" : undefined}
            tabIndex={interactive(id) ? 0 : undefined}
            aria-label={
              id === "postcard" ? "Flip the postcard" : id === "dnd" ? (calm ? "Turn animations back on" : "Turn animations off") : LAYOUT[id].label
            }
            aria-pressed={id === "dnd" ? calm : undefined}
            onPointerDown={onPointerDown(id)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={interactive(id) ? onKeyDown(id) : undefined}
            className="pointer-events-auto absolute cursor-grab touch-none select-none outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grape active:cursor-grabbing"
            style={{
              left: `${base.x}%`,
              top: `${base.y}%`,
              zIndex: order.indexOf(id) + 1,
              transform: `translate(${o.dx}px, ${o.dy}px) rotate(${base.r}deg)`,
            }}
          >
            <div className="sticker hover:-translate-y-1 hover:rotate-[2deg]">{render(id)}</div>
          </div>
        );
      })}

      {/* Hint + tidy-up */}
      <div className="pointer-events-auto absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap">
        <span className="font-handwriting text-[22px] leading-[24px] text-grape">psst — everything here can be moved</span>
        {moved && (
          <button
            type="button"
            onClick={tidy}
            className="flex items-center gap-1 rounded-full border border-primary/20 bg-white px-3 py-1 font-brand text-[12px] leading-[16px] text-primary transition-colors hover:bg-grape-light"
          >
            <RotateCcw size={12} strokeWidth={2} />
            Tidy up
          </button>
        )}
      </div>
    </div>
  );
}
