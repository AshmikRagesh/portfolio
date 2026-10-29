"use client";

import { useEffect, useRef, useState } from "react";
import { Code, PenNib } from "@phosphor-icons/react/dist/ssr";

/**
 * Who does what, as a pull request conversation: one message per role, the first on the
 * left in a white bubble, the reply on the right in the dark primary.
 * When the thread scrolls into view it plays once, like a chat: a typing indicator (three
 * dots) for each sender, then their message typed out a few characters at a time, then a
 * short pause before the next sender starts.
 * Best practice for typed text: every bubble keeps the full message in the layout (invisible)
 * with the typed part laid over it, so nothing shifts as it types; the animated text is
 * hidden from screen readers, which read the full message instead; and with reduced motion
 * the whole thread simply shows.
 */
type Message = { from: string; role: "designer" | "developer"; text: string };

const DOTS_MS = 900; // the typing indicator, before each message
const CHAR_MS = 24; // one character typed
const GAP_MS = 500; // pause after a message, before the next sender

export default function ReviewThread({ messages }: { messages: Message[] }) {
  const ref = useRef<HTMLDivElement>(null);
  // Which message is playing (-1: not started), and how far into it
  const [active, setActive] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [chars, setChars] = useState(0);

  // Start once, when most of the thread is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(messages.length);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(0);
          setTyping(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [messages.length]);

  // Step through: dots, then characters, then on to the next message
  useEffect(() => {
    if (active < 0 || active >= messages.length) return;
    const text = messages[active].text;
    let t: number;
    if (typing) {
      t = window.setTimeout(() => setTyping(false), DOTS_MS);
    } else if (chars < text.length) {
      t = window.setTimeout(() => setChars((c) => Math.min(text.length, c + 2)), CHAR_MS * 2);
    } else {
      t = window.setTimeout(() => {
        setActive((a) => a + 1);
        setChars(0);
        setTyping(true);
      }, GAP_MS);
    }
    return () => window.clearTimeout(t);
  }, [active, typing, chars, messages]);

  return (
    <div ref={ref} className="mt-[40px] rounded-[24px] border border-line-soft bg-surface p-[20px] md:p-[40px]">
      <ol className="m-0 flex list-none flex-col gap-[24px] p-0">
        {messages.map((m, i) => {
          const dev = m.role === "developer";
          const shown = i < active; // finished
          const live = i === active;
          const visible = shown || live;
          const typed = shown ? m.text : live && !typing ? m.text.slice(0, chars) : "";
          const Icon = dev ? Code : PenNib;
          return (
            <li
              key={m.from}
              className={`flex items-end gap-[12px] transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
                dev ? "flex-row-reverse" : ""
              } ${visible ? "translate-y-0 opacity-100" : "translate-y-[8px] opacity-0"}`}
            >
              <span
                aria-hidden="true"
                className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${
                  dev ? "bg-primary text-white" : "bg-grape-light text-grape"
                }`}
              >
                <Icon size={20} />
              </span>
              <div className={`flex max-w-[480px] flex-col gap-[8px] ${dev ? "items-end" : "items-start"}`}>
                <span className="font-body text-[14px] leading-[20px] text-muted">{m.from}</span>
                <div
                  className={`relative px-[20px] py-[14px] ${
                    dev
                      ? "rounded-[20px] rounded-br-[6px] bg-primary text-white"
                      : "rounded-[20px] rounded-bl-[6px] border border-line-soft bg-white text-heading"
                  }`}
                >
                  {/* Full text holds the size; screen readers read this */}
                  <p className="invisible m-0 font-body text-[16px] leading-[26px] md:text-[18px] md:leading-[28px]">
                    <span className="sr-only !visible">{m.text}</span>
                    <span aria-hidden="true">{m.text}</span>
                  </p>
                  <div aria-hidden="true" className="absolute inset-0 px-[20px] py-[14px]">
                    {live && typing ? (
                      <span className="flex h-[26px] items-center gap-[6px] md:h-[28px]">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className={`h-[8px] w-[8px] animate-[thread-dot_1s_ease-in-out_infinite] rounded-full ${
                              dev ? "bg-white/70" : "bg-grape/60"
                            }`}
                            style={{ animationDelay: `${d * 160}ms` }}
                          />
                        ))}
                      </span>
                    ) : (
                      <p className="m-0 font-body text-[16px] leading-[26px] md:text-[18px] md:leading-[28px]">
                        {typed}
                        {live && chars < m.text.length && (
                          <span className="ml-[2px] inline-block h-[20px] w-[2px] translate-y-[4px] animate-[thread-caret_0.8s_steps(1)_infinite] bg-current" />
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
