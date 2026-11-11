"use client";

// ── Sound toggle ──────────────────────────────────────────────────────────────
// The speaker in the navbar: turns every site sound on or off (lib/sound/ui). The choice
// is remembered. Its own click plays the switch sound both ways.
//
// A 24px speaker in a 40px round target, no background. Hovering ripples the sound waves
// outwards (or, muted, gives the cross a small shake) with the
// DS tick; pressing dips it. Switching off folds the waves away and draws a small cross in
// their place; switching on brings the waves back one after the other. (.sound-toggle in
// globals.css)

import { useEffect, useState } from "react";
import { onSoundsMuted, playSound, setSoundsMuted, soundsMuted } from "@/lib/sound/ui";

export default function SoundToggle({ className = "" }: { className?: string }) {
  // Rendered as "on" first, so the server and first paint agree; then the saved choice
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    setMuted(soundsMuted());
    return onSoundsMuted(setMuted);
  }, []);

  const toggle = () => {
    const next = !muted;
    // The switch is heard both ways: played before muting, and after unmuting
    if (next) playSound("toggle");
    setSoundsMuted(next);
    if (!next) playSound("toggle");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sounds on" : "Turn sounds off"}
      title={muted ? "Sounds off" : "Sounds on"}
      data-sound="tick"
      data-muted={muted || undefined}
      className={`sound-toggle ${className}`}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path className="sound-toggle-body" d="M4 9.5h3.2L11.5 6v12l-4.3-3.5H4z" />
        <path className="sound-toggle-wave" d="M15 9.6a3.4 3.4 0 0 1 0 4.8" />
        <path className="sound-toggle-wave sound-toggle-wave-2" d="M17.6 7a7 7 0 0 1 0 10" />
        <path className="sound-toggle-cross" d="M15.5 9.5l5 5M20.5 9.5l-5 5" pathLength={1} />
      </svg>
    </button>
  );
}
