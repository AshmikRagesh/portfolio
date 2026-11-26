"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Expanded } from "./Media";
import ImagePlaceholder from "./ImagePlaceholder";

/**
 * A sliding rail of smaller pictures, for supporting details that don't each need a full
 * screen: two cards visible from tablet up (one and a peek on phones), each a picture on a
 * fixed-height stage with a short title and one plain line under it. Arrows and a
 * "1–2 of 5" count sit below; the rail also scrolls and swipes, snapping card by card.
 * Clicking a picture opens it large, with arrows (and ← →) to step through the rest.
 * A card can hold a short clip (`video`) instead of a picture: it plays silently on loop in the
 * card (not with reduced motion) and opens large like a picture. A card with neither shows a
 * placeholder until its media is ready.
 */
type Item = { src?: string; video?: string; alt: string; title: string; text: string };

const ARROW =
  "flex h-[40px] w-[40px] items-center justify-center rounded-full border border-line bg-white text-heading transition-colors duration-150 hover:border-heading disabled:cursor-default disabled:opacity-30 disabled:hover:border-line focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape";

export default function MediaRail({ items, label }: { items: Item[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [first, setFirst] = useState(0);
  const [shown, setShown] = useState(2);
  const [open, setOpen] = useState<number | null>(null);
  const [ratio, setRatio] = useState(16 / 9);
  // Clips in the cards only play themselves when motion is welcome
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  // The width of one card plus the gap, so arrows and the count move card by card
  const step = useCallback(() => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return 1;
    return card.getBoundingClientRect().width + (parseFloat(getComputedStyle(el).columnGap) || 0);
  }, []);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const s = step();
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    setFirst(Math.round(el.scrollLeft / s));
    // Cards fully in view: the track holds n cards and n - 1 gaps
    setShown(Math.max(1, Math.floor((el.clientWidth + gap + 2) / s)));
  }, [step]);

  useEffect(() => {
    const el = track.current;
    measure();
    el?.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el?.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // Glide to the next set of cards. Animated by hand: native smooth scrolling doesn't run
  // reliably on a snapping track, so snapping is paused for the glide and restored after
  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const from = el.scrollLeft;
    const to = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, Math.round((from / step() + dir * shown)) * step()));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = to;
      return;
    }
    const start = performance.now();
    const ms = 450;
    el.style.scrollSnapType = "none";
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const ease = 1 - Math.pow(1 - t, 3);
      el.scrollLeft = from + (to - from) * ease;
      if (t < 1) requestAnimationFrame(tick);
      else el.style.scrollSnapType = "";
    };
    requestAnimationFrame(tick);
  };

  // The gallery steps through the cards that have a picture
  const pictures = items.map((it, i) => (it.src || it.video ? i : -1)).filter((i) => i >= 0);
  const close = useCallback(() => setOpen(null), []);
  const move = (dir: 1 | -1) =>
    setOpen((o) => {
      if (o === null) return o;
      const at = pictures.indexOf(o);
      return pictures[(at + dir + pictures.length) % pictures.length];
    });

  const last = Math.min(first + shown, items.length);
  const count = shown > 1 ? `${first + 1}–${last} of ${items.length}` : `${first + 1} of ${items.length}`;
  const current = open !== null ? items[open] : null;

  return (
    <div role="region" aria-label={label} className="flex flex-col gap-[20px]">
      <ul
        ref={track}
        className="m-0 flex list-none snap-x snap-mandatory gap-[16px] overflow-x-auto p-0 [scrollbar-width:none] md:gap-[24px] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <li
            key={it.title}
            className="flex w-[85%] shrink-0 snap-start flex-col rounded-lg border border-line-soft bg-white p-[12px] md:w-[calc(50%-12px)]"
          >
            <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-md bg-surface p-[16px] md:h-[280px]">
              {it.video ? (
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Expand: ${it.alt}`}
                  data-sound="whisper"
                  data-sound-click="pop"
                  className="flex h-full max-w-full cursor-zoom-in items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-grape"
                >
                  <video
                    src={it.video}
                    aria-label={it.alt}
                    muted
                    loop
                    playsInline
                    autoPlay={!reduce}
                    preload="metadata"
                    className="max-h-full max-w-full rounded-sm object-contain shadow-[0_1px_2px_rgba(30,5,37,0.08)]"
                  />
                </button>
              ) : it.src ? (
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Expand: ${it.alt}`}
                  data-sound="whisper"
                  data-sound-click="pop"
                  className="flex h-full max-w-full cursor-zoom-in items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-grape"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.src} alt={it.alt} loading="lazy" draggable={false} className="max-h-full max-w-full rounded-sm object-contain shadow-[0_1px_2px_rgba(30,5,37,0.08)]" />
                </button>
              ) : (
                <div className="w-full">
                  <ImagePlaceholder label={it.alt} />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[4px] px-[8px] pb-[8px] pt-[16px]">
              <h4 className="font-heading text-h3-md tracking-[0px] text-heading md:text-h3-lg">{it.title}</h4>
              <p className="m-0 font-body text-body-md text-secondary">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <p aria-live="polite" className="m-0 font-geist text-caption tabular-nums text-muted">
          {count}
        </p>
        <div className="flex gap-[8px]">
          <button type="button" onClick={() => go(-1)} disabled={first === 0} aria-label="Previous" className={ARROW}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" onClick={() => go(1)} disabled={last >= items.length} aria-label="Next" className={ARROW}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
      {current && (current.src || current.video) && (
        <Expanded
          label={`${current.title}: ${current.text}`}
          ratio={ratio}
          onClose={close}
          nav={pictures.length > 1 ? { index: pictures.indexOf(open!), total: pictures.length, onPrev: () => move(-1), onNext: () => move(1) } : undefined}
        >
          {current.video ? (
            <video
              key={current.video}
              src={current.video}
              aria-label={current.alt}
              muted
              loop
              playsInline
              autoPlay
              controls
              onLoadedMetadata={(e) => setRatio(e.currentTarget.videoWidth / e.currentTarget.videoHeight)}
              className="block h-full w-full bg-white object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={current.src} src={current.src} alt={current.alt} onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} className="block h-full w-full bg-white object-contain" />
          )}
        </Expanded>
      )}
    </div>
  );
}
