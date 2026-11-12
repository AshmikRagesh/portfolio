"use client";

import { useEffect, useRef, useState } from "react";
import { User } from "@phosphor-icons/react";

/**
 * What people said in research, as incoming chat messages, one person after another.
 * Each message plays once when the thread scrolls into view: the person's avatar and
 * name arrive, a typing bubble pulses for a moment, then it grows into the message (a
 * soft spring from the corner nearest the avatar) and the words settle in, a beat
 * apart. Then the next person starts typing.
 * Like a messaging app: incoming messages sit on the left beside the sender's avatar,
 * with the bubble's tail corner tucked towards it. Every message keeps its full size in
 * the layout from the start, so nothing below moves while it plays; screen readers get
 * each quote and who said it; with reduced motion the whole thread simply shows.
 */
type Message = { text: string; from: string };
type State = "waiting" | "typing" | "shown";

const START_MS = 300; // after the thread comes into view
const TYPING_MS = 1100; // the typing bubble, before the message
const GAP_MS = 650; // after a message, before the next person starts

// One tint per person, from the brand's soft accents
const TONES = [
  "bg-grape-light text-grape",
  "bg-primary text-white",
  "bg-pink text-primary",
];

export default function ChatQuotes({ items, label }: { items: Message[]; label: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const [states, setStates] = useState<State[]>(() => items.map(() => "waiting"));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStates(items.map(() => "shown"));
      return;
    }
    const timers: number[] = [];
    const play = () => {
      let at = START_MS;
      items.forEach((_, i) => {
        const set = (s: State) => setStates((prev) => prev.map((p, j) => (j === i ? s : p)));
        timers.push(window.setTimeout(() => set("typing"), at));
        at += TYPING_MS;
        timers.push(window.setTimeout(() => set("shown"), at));
        at += GAP_MS;
      });
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [items]);

  // One tint per person, so two messages from the same sender share a colour
  const senders = Array.from(new Set(items.map((m) => m.from)));

  return (
    <ol ref={ref} aria-label={label} className="my-[32px] flex list-none flex-col gap-[28px] p-0 md:my-[40px]">
      {items.map(({ text, from }, i) => {
        const state = states[i];
        const here = state !== "waiting";
        const shown = state === "shown";
        return (
          <li key={i} className="flex items-end gap-[12px]">
            <span
              aria-hidden="true"
              className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
                TONES[senders.indexOf(from) % TONES.length]
              } ${here ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
            >
              <User size={18} weight="fill" />
            </span>
            <figure className="m-0 min-w-0 max-w-[560px] flex-1">
              <figcaption
                className={`mb-[6px] pl-[4px] font-geist text-caption-lg text-muted transition-opacity duration-300 motion-reduce:transition-none ${
                  here ? "opacity-100" : "opacity-0"
                }`}
              >
                {from}
              </figcaption>
              <div className="relative">
                {/* The typing bubble, in the message's corner until the message takes over */}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 flex h-[44px] origin-bottom-left items-center gap-[6px] rounded-[22px] rounded-bl-[6px] bg-white px-[18px] shadow-[0_1px_2px_rgba(30,5,37,0.06),0_4px_16px_rgba(30,5,37,0.06)] ring-1 ring-line-soft transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                    state === "typing" ? "scale-100 opacity-100" : "scale-75 opacity-0"
                  }`}
                >
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="cs-typing-dot h-[8px] w-[8px] rounded-full bg-muted/70" style={{ animationDelay: `${d * 160}ms` }} />
                  ))}
                </span>
                <blockquote
                  className={`m-0 inline-block origin-bottom-left rounded-[22px] rounded-bl-[6px] bg-white px-[20px] py-[14px] font-geist text-lead text-heading shadow-[0_1px_2px_rgba(30,5,37,0.06),0_4px_16px_rgba(30,5,37,0.06)] ring-1 ring-line-soft transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none md:text-lead-md ${
                    shown ? "scale-100 opacity-100" : "scale-[0.85] opacity-0"
                  }`}
                >
                  {text.split(" ").map((word, w) => (
                    <span key={w}>
                      <span
                        className={`inline-block transition-[opacity,transform,filter] duration-500 ease-out motion-reduce:transition-none ${
                          shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-[4px] opacity-0 blur-[3px]"
                        }`}
                        style={{ transitionDelay: shown ? `${120 + w * 24}ms` : "0ms" }}
                      >
                        {word}
                      </span>{" "}
                    </span>
                  ))}
                </blockquote>
              </div>
            </figure>
          </li>
        );
      })}
    </ol>
  );
}
