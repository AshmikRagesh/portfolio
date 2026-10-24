"use client";

// ── Timer board ───────────────────────────────────────────────────────────────
// The sign the host lowers on hover, hung from two rings its hands hold.
// Two editions, built the same way:
//
//   standard   a warm sand frame around an ivory face — the same plaque as the
//              champion's, in an everyday finish that sits with the site's vanilla.
//              Titled "Measuring your curiosity".
//   champion   for the visitor who's stayed longer than anyone, ever: the same plaque
//              in gold, titled "Champion of Curiosity".
//
// The title is one line of small spaced capitals in the primary colour, softened so it
// sits into the face rather than on top of it.
//
// Under the title, the clock: a dark recessed window running the full width of the
// face, its split-flap cards centred in it. Each digit flips in two stages when it changes —
// the old top half falls, then the new bottom half drops. A fold runs across the middle
// of each card, where the two flaps meet. A small unit mark follows each pair (4m 16s)
// so it reads as time spent, not a time of day.
// Hours appear only once there are some. With reduced motion the digits simply change.
// All values are multiples of 2/4px.

import { Fragment, useEffect, useRef, useState } from "react";
import { formatClock } from "@/components/host/clock";

/** Board width, so the host can centre and clamp the board before it renders. */
export const BOARD_WIDTH = 184;

/** One half of a card, showing the matching half of `value`. */
function Half({ value, half, tall = false, className = "" }: { value: string; half: "top" | "bottom"; tall?: boolean; className?: string }) {
  return (
    <span
      className={`absolute inset-x-0 h-1/2 overflow-hidden ${half === "top" ? "top-0 rounded-t-[4px] bg-[#2f2d31]" : "bottom-0 rounded-b-[4px] bg-[#28262a]"} ${className}`}
    >
      {/* Laid out at full card height, then clipped to this half */}
      <span
        className={`absolute inset-x-0 h-[200%] flex items-center justify-center font-sans font-semibold ${tall ? "text-[24px]" : "text-[20px]"} leading-none tracking-[-0.4px] text-[#f8f3e8] tabular-nums ${
          half === "top" ? "top-0" : "bottom-0"
        }`}
      >
        {value}
      </span>
    </span>
  );
}

// Cards are 24×26 on the board; `tall` makes them 26×34 so the bare clock stands 42px,
// level with the navbar's button
function FlapDigit({ value, narrow = false, tall = false }: { value: string; narrow?: boolean; tall?: boolean }) {
  const previous = useRef(value);
  const [flip, setFlip] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    if (previous.current === value) return;
    const from = previous.current;
    previous.current = value;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setFlip({ from, to: value });
  }, [value]);

  return (
    <span className={`relative block ${tall ? (narrow ? "w-[22px] h-[34px]" : "w-[26px] h-[34px]") : narrow ? "w-[20px] h-[26px]" : "w-[24px] h-[26px]"} rounded-[4px] shadow-[0_2px_2px_rgba(0,0,0,0.5)] [perspective:100px]`}>
      <Half value={value} half="top" tall={tall} />
      <Half value={flip ? flip.from : value} half="bottom" tall={tall} />

      {/* Moving flaps — keyed so a change mid-flip restarts cleanly; once the bottom
          flap lands it matches the resting halves, so they take over */}
      {flip && (
        <span key={`${flip.from}${flip.to}`} aria-hidden="true" onAnimationEnd={(e) => e.animationName === "flap-drop" && setFlip(null)}>
          <Half value={flip.from} half="top" tall={tall} className="flap-fall z-10" />
          <Half value={flip.to} half="bottom" tall={tall} className="flap-drop z-10" />
        </span>
      )}

      {/* The fold — where the two flaps meet, with a faint lit edge on the lower flap */}
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-[2px] -mt-[1px] z-20 bg-black/70 shadow-[0_1px_0_rgba(255,255,255,0.06)]" />
    </span>
  );
}

// The same plaque in two finishes
const EDITIONS = {
  standard: {
    frame: "linear-gradient(145deg, #f4ecdc 0%, #d9c9a8 26%, #b8a27b 50%, #e7d9bc 74%, #c0a984 100%)",
    face: "linear-gradient(160deg, #fffdf8 0%, #f8f1e3 42%, #efe5d1 68%, #faf5ea 100%)",
    ring: "#b8a27b",
    title: "Measuring your curiosity",
  },
  champion: {
    frame: "linear-gradient(145deg, #fff4c2 0%, #f0c24e 24%, #b8851e 48%, #ffe08a 70%, #c8922a 100%)",
    face: "linear-gradient(160deg, #fff1b8 0%, #f6d272 38%, #e3b54a 62%, #f8de8c 100%)",
    ring: "#d9a93e",
    title: "Champion of Curiosity",
  },
};

interface Props {
  seconds: number;
  champion?: boolean;
  /** Where the host's hands hold the board, in px from its left edge — rings go here. */
  grips?: readonly number[];
  /** Just the clock — the dark window and its cards, with no plaque around it, at 42px tall. */
  bare?: boolean;
}

// The dark window with the split-flap cards and their unit marks
function Clock({ groups, units, tall = false, className = "" }: { groups: string[]; units: string[]; tall?: boolean; className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center gap-[4px] rounded-[6px] bg-[#1c1a1d] p-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.7)]`}>
      {groups.map((group, gi) => (
        <Fragment key={gi}>
          <span className="flex gap-[4px]">
            {group.split("").map((d, di) => (
              <FlapDigit key={di} value={d} narrow={groups.length > 2} tall={tall} />
            ))}
          </span>
          {/* Unit mark — reads as a duration (4m 16s), not a time of day */}
          <span aria-hidden="true" className="self-end pb-[2px] pr-[2px] font-brand text-[10px] leading-[12px] text-[#e9dfc8]/60">
            {units[gi]}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

export default function TimerBoard({ seconds, champion = false, grips = [], bare = false }: Props) {
  const edition = champion ? EDITIONS.champion : EDITIONS.standard;
  const groups = formatClock(seconds).split(":");
  const units = groups.length > 2 ? ["h", "m", "s"] : ["m", "s"];
  const label = `${edition.title}: ${groups.map((g, i) => `${Number(g)}${units[i]}`).join(" ")}`;

  if (bare) {
    return (
      <div role="timer" aria-label={label} className="w-fit">
        <Clock groups={groups} units={units} tall />
      </div>
    );
  }

  return (
    <div role="timer" aria-label={label} className="relative" style={{ width: BOARD_WIDTH }}>
      {/* Rings the hands hold */}
      {grips.map((x, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute -top-[8px] w-[12px] h-[12px] -ml-[6px] rounded-t-full border-[2px] border-b-0"
          style={{ left: x, borderColor: edition.ring }}
        />
      ))}

      {/* Frame */}
      <div
        className="relative rounded-[10px] p-[4px] shadow-[0_16px_32px_rgba(30,5,37,0.2),0_4px_10px_rgba(30,5,37,0.14),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.25)]"
        style={{ background: edition.frame }}
      >
        {/* Face */}
        <div
          className="relative rounded-[8px] px-[8px] pt-[8px] pb-[8px] shadow-[inset_0_1px_3px_rgba(40,25,10,0.25),inset_0_-1px_0_rgba(255,255,255,0.7)]"
          style={{ background: edition.face }}
        >
          {/* Engraved title — a light edge under the letters reads as cut into the face */}
          <p className="text-center whitespace-nowrap font-brand font-medium text-[10px] leading-[12px] uppercase tracking-[0px] text-primary/60 [text-shadow:0_1px_0_rgba(255,255,255,0.6)]">
            {edition.title}
          </p>

          {/* The clock — a dark window the full width of the face, cards centred */}
          <Clock groups={groups} units={units} className="mt-[6px]" />
        </div>
      </div>
    </div>
  );
}
