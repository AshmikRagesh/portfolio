"use client";

// One of Bella's stamps (lib/bella/stampArt), embossed into whatever it sits on.
// The art is static markup from our own code, so it's set as HTML. `ink="none"` draws a
// blank impression, for a stamp not found yet.

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
      className={`block [&>svg]:h-full [&>svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: stampSvg(stamp, { id, date, rotate, ink }) }}
    />
  );
}
