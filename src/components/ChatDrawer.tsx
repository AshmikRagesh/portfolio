"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Info, RotateCcw, CornerDownRight, ArrowUp } from "lucide-react";
import { useChatDrawer } from "@/context/ChatContext";

const INITIAL_SUGGESTIONS = [
  "What projects are you most proud of?",
  "How did you approach designing an AI device?",
  "What tools do you use?",
];

const FOLLOW_UP_SUGGESTIONS = [
  "How did you achieve cost saving?",
  "Tell me about the patent",
  "What projects are you most proud of?",
];

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  followUps?: string[];
}

function SuggestionRow({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-1 w-full text-left px-1 py-2 rounded-[4px] hover:bg-[rgba(0,73,196,0.1)] transition-colors duration-150"
    >
      <CornerDownRight
        size={16}
        strokeWidth={1.5}
        className="shrink-0 text-[#717379] group-hover:text-[#0049c4] transition-colors duration-150"
      />
      <span className="font-body text-[14px] leading-[20px] text-[#717379] group-hover:text-[#0049c4] transition-colors duration-150">
        {text}
      </span>
    </button>
  );
}

function ChatInput({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: (v: string) => void;
}) {
  return (
    /* h-[100px] container: pb-6 (24px) + pt-4 (16px) + input (~52px) = ~92px, close enough */
    <div className="shrink-0 px-4 pt-4 pb-6 bg-[#f5f7f8]">
      <div className="flex items-center gap-3 bg-white border border-[#c8ccd4] rounded-[2px] px-3 py-[10px] focus-within:border-[#0049c4] transition-colors duration-150">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend(value)}
          placeholder="Ask about Ashmik..."
          className="flex-1 min-w-0 font-body text-[16px] leading-[20px] text-[#354454] placeholder:text-[#717379] outline-none bg-transparent"
        />
        <button
          type="button"
          onClick={() => onSend(value)}
          disabled={!value.trim()}
          aria-label="Send"
          className="shrink-0 flex items-center justify-center size-[28px] rounded-full text-[#354454] disabled:opacity-30 hover:text-[#0049c4] hover:bg-black/[0.05] transition-colors duration-150"
        >
          <ArrowUp size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default function ChatDrawer() {
  const { isOpen, close } = useChatDrawer();
  const pathname = usePathname();
  const isCaseStudy = pathname.startsWith("/works/");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleReset = () => {
    setMessages([]);
    setInput("");
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: text.trim() },
    ]);
    setInput("");
    // Placeholder — replace with real AI call later
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I'll be back with an answer soon!",
          followUps: FOLLOW_UP_SUGGESTIONS,
        },
      ]);
    }, 600);
  };

  return (
    /*
     * Desktop (lg+): fixed right panel, full height from top-0, z-40
     *   — has its own 76px header that aligns with the Navbar
     * Mobile (<lg): full-screen overlay, z-60 (above Navbar + backdrop)
     */
    <div
      role="dialog"
      aria-label="Chat with Ashmik"
      aria-hidden={!isOpen}
      className={`
        fixed flex flex-col bg-[#f5f7f8]
        inset-x-0 bottom-0 top-0 z-[60]
        lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:w-[400px] lg:z-40 lg:border-l lg:border-[#c8ccd4]
        transition-transform duration-300 ease-in-out
        ${isOpen
          ? "translate-y-0 lg:translate-y-0 lg:translate-x-0"
          : "translate-y-full lg:translate-y-0 lg:translate-x-full"}
      `}
    >
      {/* ── Header ── matches ruler+nav (96px) on home, nav only (68px) on case study */}
      <div className={`shrink-0 flex items-center justify-between px-5 border-b border-[#c8ccd4] bg-[#f5f7f8] ${isCaseStudy ? "h-[68px]" : "h-[96px]"}`}>
        <div className="flex items-center gap-2">
          {/* GT Alpina Regular (not italic) per Figma */}
          <span className="font-heading text-[20px] text-heading leading-[32px] tracking-[-0.2px] whitespace-nowrap">
            ASH LLM
          </span>
          <Info size={16} strokeWidth={1.5} className="text-[#9ca3af]" />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset conversation"
            className="flex items-center justify-center size-[32px] rounded-full text-[#717379] hover:text-[#354454] hover:bg-black/[0.05] transition-colors duration-150"
          >
            <RotateCcw size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close chat"
            className="flex items-center justify-center size-[32px] rounded-full text-[#717379] hover:text-[#354454] hover:bg-black/[0.05] transition-colors duration-150"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 min-h-0">
        {messages.length === 0 ? (
          /* Empty state — spacer pushes suggestions to bottom */
          <>
            <div className="flex-1" />
            <div className="shrink-0 px-5 pt-4 pb-6 bg-[#f5f7f8]">
              <p className="font-heading text-[22px] text-heading leading-[28px] tracking-[-0.22px] mb-6">
                What would you like to know?
              </p>
              <div className="flex flex-col gap-1">
                {INITIAL_SUGGESTIONS.map((q) => (
                  <SuggestionRow key={q} text={q} onClick={() => send(q)} />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Conversation — scrollable message feed */
          <div className="flex-1 overflow-y-auto min-h-0">
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                /* User bubble — right-aligned white box */
                <div
                  key={msg.id}
                  className={`flex justify-end px-5 py-2 ${i === 0 ? "pt-8" : ""}`}
                >
                  <div className="bg-white border border-[#c8ccd4] rounded-[2px] px-6 py-4 font-body text-[14px] leading-[20px] text-heading">
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* Assistant reply — full width, border-b separator + follow-ups */
                <div key={msg.id} className="flex flex-col gap-4 px-5 py-2">
                  <div className="border-b border-[#c8ccd4] pr-6 py-4">
                    <p className="font-body text-[14px] leading-[20px] text-heading">
                      {msg.content}
                    </p>
                  </div>
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {msg.followUps.map((q) => (
                        <SuggestionRow
                          key={q}
                          text={q}
                          onClick={() => send(q)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* ── Input — always at bottom ── */}
        <ChatInput value={input} onChange={setInput} onSend={send} />
      </div>
    </div>
  );
}
