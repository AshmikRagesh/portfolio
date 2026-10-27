"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A case study clip that plays itself, silently and on loop, only while it's on screen —
 * nothing downloads until it scrolls near, and it pauses when it leaves. With reduced
 * motion it never autoplays and shows controls instead.
 */
export default function AutoplayVideo({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(still);
    if (still) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      preload="none"
      controls={reduced}
      className="block h-auto w-full"
    />
  );
}
