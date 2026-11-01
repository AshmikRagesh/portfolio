"use client";

// One of Bella's rubber stamps (lib/bella/stampArt), inked onto whatever it sits on.
// The art is static markup from our own code, so it's set as HTML. On paper the ink
// multiplies into it; with an `ink` of its own (gold foil on the dark pass) it sits on top.

import { useId } from "react";
import { stampSvg, type StampKey } from "@/lib/bella/stampArt";

export default function Stamp({
  stamp,
  date = "",
  rotate = 0,
  ink,
  className = "",
}: {
  stamp: StampKey;
  date?: string;
  rotate?: number;
  ink?: string;
  className?: string;
}) {
  const id = `st${useId().replace(/[^a-z0-9]/gi, "")}`;
  return (
    <span
      className={`block ${ink ? "" : "mix-blend-multiply"} [&>svg]:h-full [&>svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: stampSvg(stamp, { id, date, rotate, ink }) }}
    />
  );
}
