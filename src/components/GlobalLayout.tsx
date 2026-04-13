"use client";

import { ReactNode } from "react";
import { ChatProvider, useChatDrawer } from "@/context/ChatContext";
import ChatDrawer from "@/components/ChatDrawer";
import Navbar from "@/components/Navbar";

function Inner({ children }: { children: ReactNode }) {
  const { isOpen, close } = useChatDrawer();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`lg:hidden fixed inset-0 z-[59] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <Navbar />

      {/* Content shifts left when chat drawer opens on desktop */}
      <div
        className={`transition-[padding-right] duration-300 ease-in-out ${
          isOpen ? "lg:pr-[400px]" : ""
        }`}
      >
        {children}
      </div>

      <ChatDrawer />
    </>
  );
}

export default function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <Inner>{children}</Inner>
    </ChatProvider>
  );
}
