"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Compact top ruler (modelled on imdaryl.com) that doubles as the page's scroll-progress bar.
// Minor ticks every 10px, labels every 100px; 0 sits on the left edge of .page-container.
//
// States — set as data attributes on the root so each one is styled separately:
//   progress      grape marker at the scroll position: left edge = top of page, right edge = bottom.
//                 Light 20% grape tint; chip is white with grape text. Nearest 100px label turns dark.
//   hover         cursor over the ruler, away from the marker: thin dark hairline + neutral chip
//                 (white with dark text). Cursor: pointer — a click jumps the page there.
//   marker-hover  cursor within the marker: tint deepens to 30%, hover hint hidden. Cursor: grab.
//   dragging      tint 40%, chip inverts (grape with white text) while the page scrubs. Cursor: grabbing.
//   reduced motion: no transitions. Touch: no hover states; tap jumps, drag scrubs.
const MARKER_HALF = 12; // marker is 24px wide
const CHIP_CLAMP = "clamp(18px, VAR, calc(100% - 18px))"; // keep chips inside the ruler

type Tick = { at: number; label: number };

function contentLeft() {
  const el = document.querySelector<HTMLElement>(".page-container");
  if (!el) return 0;
  return el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft);
}

export default function PixelRuler() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const progressValueRef = useRef<HTMLSpanElement>(null);
  const hoverValueRef = useRef<HTMLSpanElement>(null);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const ticksRef = useRef<Tick[]>([]);
  const zeroRef = useRef(0);
  const progressXRef = useRef(0);
  const dragOffsetRef = useRef<number | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [zero, setZero] = useState(0);

  const setState = (key: "hover" | "marker" | "drag", on: boolean) => {
    const root = rootRef.current;
    if (root) root.dataset[key] = on ? "true" : "false";
  };

  // Move the progress marker to the current scroll position
  const sync = () => {
    const root = rootRef.current;
    if (!root) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const x = progress * root.clientWidth;
    progressXRef.current = x;
    root.style.setProperty("--p", `${x}px`);
    if (progressValueRef.current) progressValueRef.current.textContent = String(Math.round(x - zeroRef.current));

    let nearest = -1;
    let best = Infinity;
    ticksRef.current.forEach((t, i) => {
      const d = Math.abs(t.at - x);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    labelsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.color = i === nearest ? "#1e0525" : "";
      el.style.fontWeight = i === nearest ? "500" : "";
    });
  };

  // Labels every 100px, measured from the content edge
  useEffect(() => {
    const measure = () => {
      const z = Math.round(contentLeft());
      const width = document.documentElement.clientWidth;
      const next: Tick[] = [];
      for (let k = Math.ceil(-z / 100); z + k * 100 <= width; k++) next.push({ at: z + k * 100, label: k * 100 });
      zeroRef.current = z;
      ticksRef.current = next;
      setZero(z);
      setTicks(next);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  useEffect(() => {
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticks]);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Early return AFTER all hooks
  if (pathname.startsWith("/works/")) return null;

  const scrubTo = (x: number) => {
    const root = rootRef.current;
    if (!root) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, x / root.clientWidth));
    window.scrollTo(0, progress * maxScroll);
  };

  const nearMarker = (x: number) => Math.abs(x - progressXRef.current) <= MARKER_HALF;

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const x = e.clientX;
    if (dragOffsetRef.current !== null) {
      scrubTo(x - dragOffsetRef.current);
      return;
    }
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    rootRef.current?.style.setProperty("--hx", `${x}px`);
    if (hoverValueRef.current) hoverValueRef.current.textContent = String(Math.round(x - zeroRef.current));
    const onMarker = nearMarker(x);
    setState("marker", onMarker);
    setState("hover", !onMarker);
  };

  const onPointerLeave = () => {
    if (dragOffsetRef.current !== null) return;
    setState("hover", false);
    setState("marker", false);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const x = e.clientX;
    // Grabbing the marker keeps its offset; anywhere else jumps the page there first.
    dragOffsetRef.current = nearMarker(x) ? x - progressXRef.current : 0;
    if (dragOffsetRef.current === 0) scrubTo(x);
    setState("drag", true);
    setState("hover", false);
    setState("marker", false);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragOffsetRef.current === null) return;
    dragOffsetRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setState("drag", false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    // Re-evaluate hover where the pointer ended up
    if (e.pointerType === "mouse") onPointerMove(e);
  };

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      data-hover="false"
      data-marker="false"
      data-drag="false"
      className="group/ruler fixed inset-x-0 top-0 z-[51] h-[20px] cursor-pointer touch-none select-none overflow-hidden bg-background [--hx:-60px] [--p:0px] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[rgba(30,5,37,0.08)] after:content-[''] data-[marker=true]:cursor-grab data-[drag=true]:cursor-grabbing"
    >
      {/* Minor ticks every 10px — only the bottom 6px is visible */}
      <i
        className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(to_right,rgba(142,130,146,0.28)_0_1px,transparent_1px_10px)] [mask-image:linear-gradient(transparent_14px,#000_14px)]"
        style={{ backgroundPositionX: zero }}
      />

      {/* Labelled ticks every 100px */}
      {ticks.map((t, i) => (
        <span
          key={t.label}
          ref={(el) => {
            labelsRef.current[i] = el;
          }}
          className="pointer-events-none absolute bottom-0 whitespace-nowrap pb-2 pl-1 font-brand text-[10px] leading-[10px] tabular-nums text-muted/80 transition-colors duration-100 before:absolute before:bottom-0 before:left-0 before:h-2 before:w-px before:bg-[rgba(142,130,146,0.6)] before:content-[''] motion-reduce:transition-none"
          style={{ left: t.at }}
        >
          {t.label}
        </span>
      ))}

      {/* HOVER — thin dark hairline + neutral chip under the cursor */}
      <i
        className="pointer-events-none absolute inset-y-0 w-px bg-heading/40 opacity-0 transition-opacity duration-[120ms] group-data-[hover=true]/ruler:opacity-100 motion-reduce:transition-none"
        style={{ left: "var(--hx)" }}
      />
      <span
        ref={hoverValueRef}
        className="pointer-events-none absolute top-[2px] -translate-x-1/2 whitespace-nowrap bg-background px-1 font-brand text-[10px] leading-[12px] tabular-nums text-heading opacity-0 transition-opacity duration-[120ms] group-data-[hover=true]/ruler:opacity-100 motion-reduce:transition-none"
        style={{ left: CHIP_CLAMP.replace("VAR", "var(--hx)") }}
      />

      {/* PROGRESS marker — deepens on marker-hover, strongest while dragging */}
      <i
        className="pointer-events-none absolute inset-y-0 ml-[-12px] w-[24px] bg-grape/20 transition-colors duration-[120ms] group-data-[marker=true]/ruler:bg-grape/30 group-data-[drag=true]/ruler:bg-grape/40 motion-reduce:transition-none"
        style={{ left: "var(--p)" }}
      >
        <span className="absolute inset-y-0 left-[11px] w-px bg-grape/90" />
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-grape" />
      </i>
      <span
        ref={progressValueRef}
        className="pointer-events-none absolute top-[2px] -translate-x-1/2 whitespace-nowrap bg-background px-1 font-brand text-[10px] leading-[12px] tabular-nums text-grape transition-colors duration-[120ms] group-data-[drag=true]/ruler:bg-grape group-data-[drag=true]/ruler:text-white motion-reduce:transition-none"
        style={{ left: CHIP_CLAMP.replace("VAR", "var(--p)") }}
      />
    </div>
  );
}
