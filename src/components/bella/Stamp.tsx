"use client";

// One of Bella's rubber stamps (lib/bella/stampArt), inked onto whatever it sits on.
// The art is static markup from our own code, so it's set as HTML.

import { useId } from "react";
import { stampSvg, type StampKey } from "@/lib/bella/stampArt";

export default function Stamp({ stamp, date = "", rotate = 0, className = "" }: { stamp: StampKey; date?: string; rotate?: number; className?: string }) {
  const id = `st${useId().replace(/[^a-z0-9]/gi, "")}`;
  return <span className={`block mix-blend-multiply [&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: stampSvg(stamp, { id, date, rotate }) }} />;
}
