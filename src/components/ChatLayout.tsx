"use client";

import { ReactNode } from "react";
import { ChatProvider, useChatDrawer } from "@/context/ChatContext";
import ChatDrawer from "@/components/ChatDrawer";

function InnerLayout({ children }: { children: ReactNode }) {
  const { isOpen, close } = useChatDrawer();

  return (
    <>
      {/* Mobile backdrop — sits above Navbar (z-59), below drawer (z-60) */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`lg:hidden fixed inset-0 z-[59] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Page content — shifts right on desktop to make room for drawer */}
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

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <InnerLayout>{children}</InnerLayout>
    </ChatProvider>
  );
}
