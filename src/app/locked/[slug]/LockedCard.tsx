"use client";

import { useRef } from "react";
import PasswordGate, { type PasswordGateHandle } from "@/components/PasswordGate";

// The case study's cover with the password pill resting at its foot. Clicking anywhere on
// the cover opens the field, as on the home page's work card.
export default function LockedCard({ slug, href, children }: { slug: string; href: string; children: React.ReactNode }) {
  const gate = useRef<PasswordGateHandle>(null);
  return (
    <div className="relative aspect-[1071/608] w-full overflow-hidden rounded-xl border border-black/5 bg-placeholder">
      {children}
      <PasswordGate ref={gate} slug={slug} href={href} pinned />
    </div>
  );
}
