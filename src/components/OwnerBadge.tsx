"use client";

import { useEffect, useState } from "react";

/**
 * A small corner note on a browser Ashmik marked as his (owner switch on /stats):
 * his visits aren't counted and his feedback is saved as a test. Reads the readable
 * ash_owner flag; the server checks its own httpOnly cookie. Styles: .owner-badge.
 */
export default function OwnerBadge() {
  const [owner, setOwner] = useState(false);
  useEffect(() => setOwner(/(?:^|;\s*)ash_owner=1/.test(document.cookie)), []);
  if (!owner) return null;
  return (
    <a href="/stats" className="owner-badge" title="Visits and feedback from this browser are kept out of the real numbers">
      <span className="owner-badge-dot" aria-hidden="true" />
      Owner · not counted
    </a>
  );
}
