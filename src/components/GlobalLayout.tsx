"use client";

import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import PixelRuler from "@/components/PixelRuler";

export default function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <PixelRuler />
      {children}
    </>
  );
}
