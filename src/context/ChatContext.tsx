"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ChatContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((v) => !v),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChatDrawer = () => useContext(ChatContext);
