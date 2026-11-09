"use client";

// ── Sound toggle ──────────────────────────────────────────────────────────────
// The speaker in the navbar: turns every site sound on or off (lib/sound/ui). The choice
// is remembered. Its own click plays the switch sound, so turning sounds on is audible.

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
      data-sound="none"
      className={`grid h-[40px] w-[40px] place-items-center rounded-full transition-colors hover:bg-grape-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape ${
        muted ? "text-text-base/40" : "text-grape"
      } ${className}`}
    >
      {muted ? <VolumeX size={20} strokeWidth={1.8} aria-hidden="true" /> : <Volume2 size={20} strokeWidth={1.8} aria-hidden="true" />}
    </button>
  );
}
