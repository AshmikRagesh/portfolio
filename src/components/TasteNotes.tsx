"use client";

// ── My Taste Notes ────────────────────────────────────────────────────────────
// Two notes, each posted in a kraft mailer (see Mailer) — one yellow, one red. The
// mailers lie at slight angles; hovering one straightens it and nudges its sheets out.
//
// Opening a note is one continuous motion: the sheet slides out of the mailer's open
// end and, without stopping, keeps coming towards the reader — turning over top to
// bottom as it goes (it's posted face-down) — until it's up on screen, face up, with
// only its top half showing. The backdrop dims over the same stretch.
// Clicking outside the paper, the × or Esc plays it backwards. With reduced motion
// it simply appears.
// Uses the shared page container. All values are multiples of 2/4px.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Mailer, { MailerDefs, MAILER_SEEDS } from "@/components/Mailer";
import { TypeTag, DisciplineTag } from "@/components/Tag";
import { notes } from "@/content/notes";

// Mailers lie at slightly different angles, like they were dropped on a table
const TILTS = ["-rotate-[2deg]", "rotate-[1.6deg]"];

// Motion — one timeline on one clock. A single ease-in-out curve drives everything:
// the sheet sliding down out of the mailer, the paper carrying on from there in one
// unbroken arc (down a touch, curving round and up to the reader, like the sketch),
// turning over from its back to its front on the way, unrolling to full length, and
// the backdrop dimming behind it. It's all baked into keyframes that start together,
// so nothing waits on anything else, speed never jumps at the hand-over, and it lands
// softly with no long tail. Closing plays the same path backwards.
const OPEN_MS = 1500;
const CLOSE_MS = 1300;
const HANDOFF = 0.22; // share of the timeline spent sliding the sheet out
const OUT_Y = 72; // how far the sheet slides out, as % of its own height
const OUT_TURN = -1; // and its tilt by then (deg)
const REST = { y: 0, turn: -0.6 }; // the sheet tucked in (matches its CSS)

type Phase = "closed" | "opening" | "open" | "closing";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, n: number) => {
  const t = clamp01((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const bezier = (a: number, b: number, c: number, d: number, t: number) => {
  const m = 1 - t;
  return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d;
};

// Keyframes for the sheet, the paper (and its two faces) and the backdrop, from the
// sheet at `from` (its resting/hover pose) to the paper in front of the reader.
// sheetOut: the sheet's box once slid out. paper: the paper's box at rest.
function timeline(from: { y: number; turn: number }, sheetH: number, sheetOut: DOMRect, paper: DOMRect, ms: number) {
  const n = Math.max(2, Math.round((ms / 1000) * 60));
  const s = sheetOut.width / paper.width;
  const shown = sheetOut.height / s; // paper height (unscaled px) the sheet covers
  const hidden = Math.max(0, paper.height - shown);
  // Translate that puts the paper's shown strip exactly over the slid-out sheet
  const x0 = sheetOut.left + sheetOut.width / 2 - (paper.left + paper.width / 2);
  const y0 = sheetOut.top + sheetOut.height / 2 - (paper.top + paper.height / 2) - (shown / 2 - paper.height / 2) * s;
  // Carry the sheet's speed into the arc: start heading down at the same rate
  const slidePx = ((OUT_Y - from.y) / 100) * sheetH;
  const y1 = y0 + ((slidePx / HANDOFF) * (1 - HANDOFF)) / 3;
  const y2 = 90; // come up from below to land

  const sheet: Keyframe[] = [];
  const pap: Keyframe[] = [];
  const front: Keyframe[] = [];
  const back: Keyframe[] = [];
  const dim: Keyframe[] = [];
  for (let i = 0; i <= n; i++) {
    const offset = i / n;
    const u = easeInOut(offset);
    const out = u >= HANDOFF;
    const k = clamp01(u / HANDOFF);
    sheet.push({ transform: `translateY(${lerp(from.y, OUT_Y, k)}%) rotate(${lerp(from.turn, OUT_TURN, k)}deg)`, opacity: out ? 0 : 1, offset });

    const q = clamp01((u - HANDOFF) / (1 - HANDOFF));
    const x = bezier(x0, x0, x0 * 0.2, 0, q);
    const y = bezier(y0, y1, y2, 0, q);
    const scale = lerp(s, 1, smooth(0, 1, q));
    const turn = lerp(OUT_TURN, 0, q) + Math.sin(Math.PI * q) * 1.2;
    const over = 180 * (1 - smooth(0.04, 0.66, q)); // back → front, top over bottom
    const cut = hidden * (1 - smooth(0, 0.8, q)); // the rest of the page unrolls
    const room = -80 * smooth(0, 0.35, q); // let the shadow out as it lifts
    pap.push({
      transform: `perspective(1600px) translate(${x}px, ${y}px) scale(${scale}) rotate(${turn}deg) rotateX(${over}deg)`,
      // visibility, not opacity: animating opacity on a 3D parent flattens it, and
      // the back face would show through as a mirrored front
      visibility: out ? "visible" : "hidden",
      offset,
    });
    // The back face is turned over, so its "bottom" is its own top
    front.push({ clipPath: `inset(${room}px ${room}px ${cut}px ${room}px round 8px)`, offset });
    back.push({ clipPath: `inset(${cut}px ${room}px ${room}px ${room}px round 8px)`, offset });
    dim.push({ opacity: smooth(HANDOFF + 0.06, 0.88, u), offset });
  }
  return { sheet, paper: pap, front, back, dim };
}

// Same frames, played backwards
const backwards = (keys: Keyframe[]) => [...keys].reverse().map((k, i, all) => ({ ...k, offset: i / (all.length - 1) }));

// Folded in three to fit the mailer: a soft valley with a highlight on its lip
function PaperFolds() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: [33.3, 66.6]
          .map((y) => `linear-gradient(to bottom, transparent calc(${y}% - 6px), rgba(90,70,40,0.06) calc(${y}% - 1px), rgba(90,70,40,0.12) ${y}%, rgba(255,255,255,0.7) calc(${y}% + 1px), rgba(255,255,255,0.15) calc(${y}% + 6px), transparent calc(${y}% + 10px))`)
          .join(", "),
      }}
    />
  );
}

// Paper tooth: a small tile of soft grain, made once and repeated (a live SVG filter
// here would re-render on every frame of the motion)
let grainTile: string | null = null;
function grain() {
  if (grainTile) return grainTile;
  const size = 160;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 214 + Math.random() * 41;
    img.data[i] = v;
    img.data[i + 1] = v - 2;
    img.data[i + 2] = v - 6;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grainTile = c.toDataURL();
  return grainTile;
}

function PaperTexture() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply" style={{ backgroundImage: `url(${grain()})` }} />;
}

export default function TasteNotes() {
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const sheets = useRef<(HTMLDivElement | null)[]>([]);
  const openers = useRef<(HTMLButtonElement | null)[]>([]);
  const paper = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const follower = useRef<HTMLDivElement>(null);

  // The × rides along with the pointer anywhere off the paper (mouse/trackpad only)
  const follow = (e: React.PointerEvent) => {
    const f = follower.current;
    if (!f || e.pointerType !== "mouse") return;
    f.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    f.dataset.on = "true";
  };
  const unfollow = () => {
    if (follower.current) follower.current.dataset.on = "false";
  };

  const open = (i: number) => {
    if (busy.current || active !== null) return;
    busy.current = true;
    setActive(i);
    setPhase("opening");
  };

  // Where the sheet is now (resting, or nudged out by hover), as translate-% + tilt
  const sheetPose = (sheet: HTMLElement) => {
    const m = new DOMMatrix(getComputedStyle(sheet).transform);
    return { y: (m.f / sheet.offsetHeight) * 100, turn: (Math.atan2(m.b, m.a) * 180) / Math.PI };
  };
  // The sheet's box once it has slid out, measured without showing it
  const sheetOutBox = (sheet: HTMLElement) => {
    const prev = sheet.style.transform;
    sheet.style.transform = `translateY(${OUT_Y}%) rotate(${OUT_TURN}deg)`;
    const box = sheet.getBoundingClientRect();
    sheet.style.transform = prev;
    return box;
  };

  // Opening runs once the paper is mounted (hidden) in its reading position
  useEffect(() => {
    if (phase !== "opening" || active === null) return;
    const sheet = sheets.current[active];
    const el = paper.current;
    const shade = dim.current;
    const f = front.current;
    const b = back.current;
    if (!sheet || !el || !shade || !f || !b) return;

    document.body.style.overflow = "hidden";
    const k = timeline(sheetPose(sheet), sheet.offsetHeight, sheetOutBox(sheet), el.getBoundingClientRect(), OPEN_MS);
    const timing = { duration: reduced() ? 0 : OPEN_MS, easing: "linear", fill: "forwards" as const };
    sheet.animate(k.sheet, timing);
    shade.animate(k.dim, timing);
    f.animate(k.front, timing);
    b.animate(k.back, timing);
    el.animate(k.paper, timing).finished.then(() => {
      el.focus({ preventScroll: true });
      busy.current = false;
      setPhase("open");
    });
  }, [phase, active]);

  const close = useCallback(async () => {
    if (busy.current || active === null) return;
    const sheet = sheets.current[active];
    const el = paper.current;
    const shade = dim.current;
    const f = front.current;
    const b = back.current;
    if (!sheet || !el || !shade || !f || !b) return;
    busy.current = true;
    setPhase("closing");

    // Measure with everything at rest, then play the path backwards to the tucked-in sheet
    [sheet, el, f, b, shade].forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
    const k = timeline(REST, sheet.offsetHeight, sheetOutBox(sheet), el.getBoundingClientRect(), CLOSE_MS);
    const timing = { duration: reduced() ? 0 : CLOSE_MS, easing: "linear", fill: "forwards" as const };
    sheet.animate(backwards(k.sheet), timing);
    shade.animate(backwards(k.dim), timing);
    f.animate(backwards(k.front), timing);
    b.animate(backwards(k.back), timing);
    await el.animate(backwards(k.paper), timing).finished;

    el.style.visibility = "hidden";
    sheet.getAnimations().forEach((a) => a.cancel());
    document.body.style.overflow = "";
    openers.current[active]?.focus({ preventScroll: true });
    busy.current = false;
    setPhase("closed");
    setActive(null);
  }, [active]);

  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, close]);

  // Following "Read the note" unmounts this with the page still locked
  useEffect(() => () => {
    document.body.style.overflow = "";
  }, []);

  const note = active === null ? null : notes[active];

  return (
    <section
      id="notes"
      aria-labelledby="notes-heading"
      className="page-container section-spacing scroll-mt-20 bg-background pb-[96px] md:pb-[128px] lg:pb-[160px]"
    >
      <MailerDefs />

      {/* Header */}
      <header className="mb-10 md:mb-14">
        <h2
          id="notes-heading"
          className="m-0 text-balance font-heading text-[34px] font-normal leading-[36px] tracking-[-2px] text-heading md:text-[44px] md:leading-[44px] lg:text-[48px] lg:leading-[50px]"
        >
          My taste notes.
        </h2>
      </header>

      {/* Mailers, from the left */}
      <ul className="m-0 flex list-none flex-col items-start gap-16 p-0 md:flex-row md:gap-16 lg:gap-20">
        {notes.map((n, i) => (
          <li key={n.title} className="w-full max-w-[300px]">
            <button
              ref={(el) => {
                openers.current[i] = el;
              }}
              type="button"
              onClick={() => open(i)}
              aria-haspopup="dialog"
              aria-label={`${n.title} — ${n.summary} ${n.date}, ${n.readTime}`}
              className={`group block w-full cursor-pointer rounded-[4px] text-left transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:rotate-0 focus-visible:rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-8 motion-reduce:transition-none ${
                active === i ? "!rotate-0" : TILTS[i % TILTS.length]
              }`}
            >
              <Mailer
                seed={MAILER_SEEDS[i % MAILER_SEEDS.length]}
                tone={n.tone}
                sheetRef={(el) => {
                  sheets.current[i] = el;
                }}
                title={n.title}
                summary={n.summary}
                date={n.date}
                readTime={n.readTime}
              />
            </button>
          </li>
        ))}
      </ul>

      {/* The paper, out of its mailer — top half on screen, the rest below the fold */}
      {note &&
        createPortal(
          <div className="fixed inset-0 z-[80] overflow-hidden" role="presentation">
            {/* Backdrop + close, dimming in together */}
            <div ref={dim} className="absolute inset-0 opacity-0">
              <div
                className="absolute inset-0 bg-[rgba(30,5,37,0.42)] [@media(hover:hover)]:cursor-none"
                onClick={close}
                onPointerMove={follow}
                onPointerLeave={unfollow}
              />
              {/* Pointer devices: a × that follows the cursor off the paper — click anywhere there to close */}
              <div
                ref={follower}
                aria-hidden="true"
                data-on="false"
                className="pointer-events-none fixed left-0 top-0 hidden size-10 transition-transform duration-[120ms] ease-out [@media(hover:hover)]:block"
              >
                <span className="flex size-full scale-50 items-center justify-center rounded-full bg-white text-heading opacity-0 shadow-[0_4px_14px_rgba(30,5,37,0.22)] transition-[transform,opacity] duration-200 ease-out [[data-on=true]>&]:scale-100 [[data-on=true]>&]:opacity-100">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </span>
              </div>
              {/* Touch screens (and keyboard focus): a fixed × above the paper */}
              <button
                type="button"
                onClick={close}
                aria-label="Close note"
                className="absolute right-4 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:focus-visible:opacity-100 top-[calc(max(72px,16vh)_-_64px)] flex size-12 items-center justify-center rounded-full bg-white text-heading shadow-[0_4px_16px_rgba(30,5,37,0.18)] transition-transform duration-200 hover:scale-105 md:top-[calc(max(88px,28vh)_-_72px)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div
              ref={paper}
              role="dialog"
              aria-modal="true"
              aria-labelledby="note-title"
              tabIndex={-1}
              style={{ visibility: "hidden" }}
              className="absolute left-[calc(50%_-_min(360px,50vw_-_12px))] top-[max(72px,16vh)] h-[100vh] w-[min(720px,100vw_-_24px)] origin-center outline-none will-change-transform [transform-style:preserve-3d] md:top-[max(88px,28vh)] md:aspect-[1/1.414] md:h-auto"
            >
              {/* Back — blank, facing out of the mailer until it turns over */}
              <div ref={back} aria-hidden="true" className="absolute inset-0 rounded-[8px] bg-[#eeeae0] shadow-[0_2px_8px_rgba(30,5,37,0.18)] [backface-visibility:hidden] [transform:rotateX(180deg)]">
                <PaperTexture />
                <PaperFolds />
              </div>

              {/* Front — warm sheet, soft corners, a little thickness at the edge, a
                  bow across its width, and the folds it was posted in */}
              <div ref={front} className="absolute inset-0 overflow-hidden rounded-[8px] bg-[#f7f4ec] [backface-visibility:hidden] shadow-[0_1px_0_rgba(30,5,37,0.08),0_-8px_40px_rgba(30,5,37,0.22),0_30px_60px_rgba(30,5,37,0.18),inset_0_0_0_1px_rgba(120,100,70,0.08)]">
                <PaperTexture />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent 4%), linear-gradient(to right, rgba(90,70,40,0.07), transparent 12%, rgba(255,255,255,0.2) 30%, transparent 50%, transparent 70%, rgba(90,70,40,0.06)), radial-gradient(120% 60% at 50% 0%, transparent 60%, rgba(90,70,40,0.05))",
                  }}
                />
                <PaperFolds />

                <div className="relative flex flex-col items-start px-6 pt-8 md:px-16 md:pt-14">
                  <div className="flex w-full flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <TypeTag type={note.type} />
                      <DisciplineTag discipline={note.discipline} />
                    </div>
                    <span className="font-brand text-[12px] uppercase leading-[16px] tracking-[1px] text-muted">
                      {note.date} · {note.readTime}
                    </span>
                  </div>

                  <h3 id="note-title" className="m-0 mt-8 text-balance font-heading text-[34px] font-normal leading-[38px] tracking-[-1.2px] text-heading md:mt-10 md:text-[52px] md:leading-[56px] md:tracking-[-2px]">
                    {note.title}
                  </h3>

                  <p className="m-0 mt-5 line-clamp-6 max-w-[56ch] text-pretty font-body text-[16px] leading-[28px] text-secondary md:mt-6 md:line-clamp-none md:text-[18px] md:leading-[30px]">
                    {note.excerpt}
                  </p>

                  <Link
                    href={`/notes/${note.slug}`}
                    className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-[#0b0b0b] px-7 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-[18px] font-medium tracking-[-0.2px] text-white shadow-[0_10px_24px_rgba(0,0,0,0.22),0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-200 hover:-translate-y-[2px] md:mt-10"
                  >
                    Read the note
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h12M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
