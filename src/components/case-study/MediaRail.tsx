"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Expanded } from "./Media";
import ImagePlaceholder from "./ImagePlaceholder";

/**
 * A sliding rail of smaller clips or pictures, for supporting details that don't each need a
 * full screen, after the reference (sudhanva.space): two items
 * are in view from tablet up (one and a peek on phones). Each item is the media itself (no card
 * around it, per the media template), then a short title and one plain line. A muted count sits
 * under the rail on the left and the two arrows on the right.
 * Arrows glide one view at a time with an eased scroll; trackpads and swipes scroll freely and
 * settle on the nearest item. Clips play silently on loop only while they're on screen (never
 * with reduced motion). Clicking opens the item large, with arrows (and ← →) to step through.
 * An item with no media yet shows a placeholder.
 */
type Item = { src?: string; video?: string; alt: string; title: string; text: string };

const ARROW =
  "flex h-[40px] w-[40px] items-center justify-center rounded-full border border-line bg-white text-heading transition-[border-color,opacity] duration-200 hover:border-heading disabled:cursor-default disabled:opacity-30 disabled:hover:border-line focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape";

// Ease-in-out with a soft landing, for the arrow glide
const glide = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

export default function MediaRail({ items, label }: { items: Item[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const raf = useRef(0);
  const [first, setFirst] = useState(0);
  const [shown, setShown] = useState(2);
  const [open, setOpen] = useState<number | null>(null);
  const [ratio, setRatio] = useState(16 / 9);
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  // The width of one item plus the gap, so arrows and the count move item by item
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
    // Items fully in view: the track holds n items and n - 1 gaps
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
      cancelAnimationFrame(raf.current);
    };
  }, [measure]);

  // Clips play only while at least half on screen, so the rail never decodes them all at once
  useEffect(() => {
    const el = track.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.5 },
    );
    el.querySelectorAll("video").forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [reduce, items]);

  // Glide by hand: snapping is paused for the glide (it would fight the animation) and put
  // back once the track has landed exactly on an item. A new press picks up from where it is.
  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    const s = step();
    const from = el.scrollLeft;
    const to = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, (Math.round(from / s) + dir * shown) * s));
    if (reduce) {
      el.scrollLeft = to;
      return;
    }
    const ms = Math.min(760, 420 + Math.abs(to - from) * 0.35);
    const start = performance.now();
    el.style.scrollSnapType = "none";
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      el.scrollLeft = from + (to - from) * glide(t);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else el.style.scrollSnapType = "";
    };
    raf.current = requestAnimationFrame(tick);
  };

  // The gallery steps through the items that have media
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
    <div role="region" aria-label={label} className="flex flex-col gap-[24px] md:gap-[32px]">
      <ul
        ref={track}
        className="m-0 flex list-none snap-x snap-proximity gap-[16px] overflow-x-auto overscroll-x-contain p-0 [scrollbar-width:none] md:gap-[24px] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <li key={it.title} className="group/item flex w-[85%] shrink-0 snap-start flex-col gap-[16px] md:w-[calc(50%-12px)]">
            <div className="relative aspect-video overflow-hidden rounded-lg border border-line-soft bg-surface">
              {it.video || it.src ? (
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Expand: ${it.alt}`}
                  data-sound="whisper"
                  data-sound-click="pop"
                  className="absolute inset-0 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grape"
                >
                  {it.video ? (
                    <video
                      src={it.video}
                      aria-label={it.alt}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/item:scale-[1.02] motion-reduce:transition-none"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.src} alt={it.alt} loading="lazy" draggable={false} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/item:scale-[1.02] motion-reduce:transition-none" />
                  )}
                  <span className="absolute right-[12px] top-[12px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-[4px] transition-opacity duration-200 group-hover/item:opacity-100">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4h5v5M9 20H4v-5M20 4l-6 6M4 20l6-6" /></svg>
                  </span>
                </button>
              ) : (
                <div className="flex h-full items-center p-[16px]">
                  <ImagePlaceholder label={it.alt} />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[4px] pr-[8px]">
              <h4 className="m-0 font-heading text-h4 text-heading md:text-h4-md">{it.title}</h4>
              <p className="m-0 font-body text-body text-secondary md:text-body-md">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-[16px]">
        <p aria-live="polite" className="m-0 font-geist text-caption tabular-nums text-muted md:text-caption-lg">
          {count}
        </p>
        <div className="flex shrink-0 gap-[8px]">
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
